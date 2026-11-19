import * as THREE from 'three';
import { CITY_BUILDINGS } from '../data/buildings';
import { BuildingDef, BuildingId } from '../types/game';

export interface BuildingVisualRefs {
  def: BuildingDef;
  group: THREE.Group;
  portalRing: THREE.Mesh;
  beaconGroup: THREE.Group;
  starMesh: THREE.Mesh;
  signMesh: THREE.Mesh;
  signCanvas: HTMLCanvasElement;
  signTexture: THREE.CanvasTexture;
  collider: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export interface TrafficCar {
  group: THREE.Group;
  axis: 'z' | 'x';
  dir: 1 | -1;
  laneCoord: number;
  pos: number;
  speed: number;
  maxSpeed: number;
}

export interface CityWorldRefs {
  root: THREE.Group;
  buildings: Map<BuildingId, BuildingVisualRefs>;
  streetLights: { bulbMat: THREE.MeshStandardMaterial; pointLight?: THREE.PointLight }[];
  trafficBulbs: {
    nsRed: THREE.MeshStandardMaterial;
    nsYellow: THREE.MeshStandardMaterial;
    nsGreen: THREE.MeshStandardMaterial;
    ewRed: THREE.MeshStandardMaterial;
    ewYellow: THREE.MeshStandardMaterial;
    ewGreen: THREE.MeshStandardMaterial;
  };
  cars: TrafficCar[];
  fountainWater: THREE.Mesh;
  roadMat: THREE.MeshStandardMaterial;
  updateBuildingSign: (id: BuildingId, completed: boolean, masteryCount: number) => void;
  setNightLights: (isLit: boolean, isWet: boolean) => void;
  animate: (dt: number, elapsed: number) => void;
}

function drawBuildingSign(
  canvas: HTMLCanvasElement,
  def: BuildingDef,
  completed: boolean,
  masteryCount: number
) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = def.isVersus ? '#7F1D1D' : '#0F172A';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = completed ? '#FBBF24' : def.accentColor;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText(def.shortTitle, w / 2, 66);

  if (def.isVersus) {
    ctx.fillStyle = '#FCD34D';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('DUEL CEPAT 1v1 · 125 SOAL', w / 2, 114);
  } else if (completed) {
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 140, 86, 280, 48, 14);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('★ SELESAI ★', w / 2, 120);
  } else {
    ctx.fillStyle = '#93C5FD';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`Progres Interior: ${Math.min(10, masteryCount)}/10`, w / 2, 116);
  }
}

export function buildCityWorld(maxAnisotropy = 4): CityWorldRefs {
  const root = new THREE.Group();

  // 1. Ground Grass + Perimeter Hills + Distant City Silhouette (No empty void!)
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x3b9b53, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), grassMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  const hillMat = new THREE.MeshStandardMaterial({ color: 0x2f855a, roughness: 0.92 });
  const hillPositions = [
    [-75, -70, 22, 10],
    [72, -75, 24, 12],
    [-80, 65, 20, 8],
    [78, 60, 25, 11],
    [0, -98, 32, 14],
    [0, 92, 28, 10]
  ];
  for (const [hx, hz, hr, hh] of hillPositions) {
    const hill = new THREE.Mesh(new THREE.ConeGeometry(hr, hh, 7), hillMat);
    hill.position.set(hx, hh / 2 - 0.5, hz);
    root.add(hill);
  }

  // City Skyline Perimeter Blocks
  const skyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
  const skylineRing = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), skyMat, 36);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const rad = 84 + (i % 3) * 8;
    const h = 10 + ((i * 7) % 18);
    dummy.position.set(Math.cos(angle) * rad, h / 2, Math.sin(angle) * rad);
    dummy.scale.set(7 + (i % 4) * 2, h, 7 + ((i + 1) % 3) * 2);
    dummy.rotation.y = angle;
    dummy.updateMatrix();
    skylineRing.setMatrixAt(i, dummy.matrix);
  }
  root.add(skylineRing);

  // 2. Black Asphalt Roads + Yellow/White Road Markings + Sidewalks
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.05 });
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.82 });
  const yellowLineMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.6 });
  const whiteLineMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });

  // Main North-South Avenue (x = 0, z from -52 to +52, width 12)
  const nsRoad = new THREE.Mesh(new THREE.BoxGeometry(12, 0.06, 104), roadMat);
  nsRoad.position.set(0, 0.03, 0);
  nsRoad.receiveShadow = true;
  root.add(nsRoad);

  // East-West Cross Street (z = 0, x from -56 to +56, width 10)
  const ewRoad = new THREE.Mesh(new THREE.BoxGeometry(112, 0.062, 10), roadMat);
  ewRoad.position.set(0, 0.031, 0);
  ewRoad.receiveShadow = true;
  root.add(ewRoad);

  // Sidewalks flanking NS Avenue
  const swLeft = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 104), sidewalkMat);
  swLeft.position.set(-7.6, 0.08, 0);
  swLeft.receiveShadow = true;
  const swRight = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, 104), sidewalkMat);
  swRight.position.set(7.6, 0.08, 0);
  swRight.receiveShadow = true;
  root.add(swLeft, swRight);

  // Sidewalks flanking EW Street
  const swNorth = new THREE.Mesh(new THREE.BoxGeometry(112, 0.15, 2.4), sidewalkMat);
  swNorth.position.set(0, 0.075, -6.2);
  const swSouth = new THREE.Mesh(new THREE.BoxGeometry(112, 0.15, 2.4), sidewalkMat);
  swSouth.position.set(0, 0.075, 6.2);
  root.add(swNorth, swSouth);

  // Yellow Dashed Center Lines
  for (let z = -48; z <= 48; z += 4.5) {
    if (Math.abs(z) < 7) continue;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.075, 2.4), yellowLineMat);
    dash.position.set(0, 0.04, z);
    root.add(dash);
  }
  for (let x = -50; x <= 50; x += 4.5) {
    if (Math.abs(x) < 8) continue;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.075, 0.28), yellowLineMat);
    dash.position.set(x, 0.04, 0);
    root.add(dash);
  }

  // Zebra Crossings at intersection
  for (let i = -4; i <= 4; i += 1.3) {
    const zStripeN = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.078, 2.4), whiteLineMat);
    zStripeN.position.set(i, 0.042, -6.5);
    const zStripeS = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.078, 2.4), whiteLineMat);
    zStripeS.position.set(i, 0.042, 6.5);
    const zStripeW = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.078, 0.65), whiteLineMat);
    zStripeW.position.set(-7.2, 0.042, i * 0.85);
    const zStripeE = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.078, 0.65), whiteLineMat);
    zStripeE.position.set(7.2, 0.042, i * 0.85);
    root.add(zStripeN, zStripeS, zStripeW, zStripeE);
  }

  // 3. Central City Park with Benches & Fountain (East Plaza around x = 28, z = 4)
  const parkBase = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.14, 14),
    new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.85 })
  );
  parkBase.position.set(27, 0.07, 10);
  parkBase.receiveShadow = true;
  root.add(parkBase);

  const fountainRim = new THREE.Mesh(
    new THREE.CylinderGeometry(2.8, 3.1, 0.65, 16),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45 })
  );
  fountainRim.position.set(27, 0.45, 10);
  const fountainWater = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.4, 0.45, 16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.25 })
  );
  fountainWater.position.set(27, 0.52, 10);
  const fountainPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.6, 1.8, 12),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 })
  );
  fountainPillar.position.set(27, 1.1, 10);
  root.add(fountainRim, fountainWater, fountainPillar);

  // Park Benches
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 });
  const benchOffsets = [
    [22, 10, Math.PI / 2],
    [32, 10, -Math.PI / 2],
    [27, 5, 0]
  ];
  for (const [bx, bz, rot] of benchOffsets) {
    const bench = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 0.7), woodMat);
    seat.position.y = 0.45;
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.14), woodMat);
    back.position.set(0, 0.78, -0.28);
    bench.add(seat, back);
    bench.position.set(bx, 0.14, bz);
    bench.rotation.y = rot;
    root.add(bench);
  }

  // 4. Stylized Roblox Trees (InstancedMesh for trunks + canopies)
  const treeCoords: [number, number][] = [
    [-12, 10], [-25, 10], [-12, 34], [-28, 34], [-12, -8], [-28, -8],
    [12, 10], [36, 10], [12, 34], [28, 34], [12, -8], [30, -8],
    [-28, -28], [28, -28], [-12, -48], [12, -48], [-32, 22], [32, 22],
    [-26, -42], [26, -42], [20, 38], [-22, 42]
  ];
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
  const trunks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.75, 2.8, 0.75), trunkMat, treeCoords.length);
  const leaves = new THREE.InstancedMesh(new THREE.BoxGeometry(2.5, 2.4, 2.5), leafMat, treeCoords.length);
  trunks.castShadow = true;
  leaves.castShadow = true;

  treeCoords.forEach(([tx, tz], idx) => {
    dummy.position.set(tx, 1.4, tz);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.y = (idx % 4) * 0.4;
    dummy.updateMatrix();
    trunks.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tx, 3.6, tz);
    dummy.scale.set(1 + (idx % 2) * 0.15, 1 + (idx % 3) * 0.12, 1 + (idx % 2) * 0.15);
    dummy.updateMatrix();
    leaves.setMatrixAt(idx, dummy.matrix);
  });
  root.add(trunks, leaves);

  // 5. Streetlights along Main Avenue
  const streetLights: CityWorldRefs['streetLights'] = [];
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
  const lampPositions: [number, number, number][] = [
    [-7.8, 32, 1],
    [7.8, 32, -1],
    [-7.8, 12, 1],
    [7.8, 12, -1],
    [-7.8, -10, 1],
    [7.8, -10, -1],
    [-7.8, -30, 1],
    [7.8, -30, -1]
  ];
  for (const [lx, lz, dirX] of lampPositions) {
    const pole = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.8, 8), poleMat);
    post.position.y = 2.4;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 0.14), poleMat);
    arm.position.set(dirX * 0.6, 4.75, 0);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.15
    });
    const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.35), bulbMat);
    bulb.position.set(dirX * 1.1, 4.62, 0);
    pole.add(post, arm, bulb);
    pole.position.set(lx, 0, lz);
    root.add(pole);
    streetLights.push({ bulbMat });
  }

  // 6. Automated Traffic Lights at Central Intersection (0, 0)
  const nsRed = new THREE.MeshStandardMaterial({ color: 0x450a0a, emissive: 0xef4444, emissiveIntensity: 0 });
  const nsYellow = new THREE.MeshStandardMaterial({ color: 0x451a03, emissive: 0xf59e0b, emissiveIntensity: 0 });
  const nsGreen = new THREE.MeshStandardMaterial({ color: 0x052e16, emissive: 0x22c55e, emissiveIntensity: 1.4 });
  const ewRed = new THREE.MeshStandardMaterial({ color: 0x450a0a, emissive: 0xef4444, emissiveIntensity: 1.4 });
  const ewYellow = new THREE.MeshStandardMaterial({ color: 0x451a03, emissive: 0xf59e0b, emissiveIntensity: 0 });
  const ewGreen = new THREE.MeshStandardMaterial({ color: 0x052e16, emissive: 0x22c55e, emissiveIntensity: 0 });

  const buildTrafficPole = (
    x: number,
    z: number,
    rMat: THREE.MeshStandardMaterial,
    yMat: THREE.MeshStandardMaterial,
    gMat: THREE.MeshStandardMaterial
  ) => {
    const g = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 4.2, 8), poleMat);
    post.position.y = 2.1;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 1.5, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    box.position.y = 4.4;
    const rBulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), rMat);
    rBulb.position.set(0, 4.85, 0.25);
    const yBulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), yMat);
    yBulb.position.set(0, 4.4, 0.25);
    const gBulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), gMat);
    gBulb.position.set(0, 3.95, 0.25);
    g.add(post, box, rBulb, yBulb, gBulb);
    g.position.set(x, 0, z);
    root.add(g);
  };
  buildTrafficPole(-6.8, -6.8, nsRed, nsYellow, nsGreen);
  buildTrafficPole(6.8, 6.8, ewRed, ewYellow, ewGreen);

  // 7. Procedural 3D Cars obeying traffic lights
  const cars: TrafficCar[] = [];
  const carConfigs: { color: number; axis: 'z' | 'x'; dir: 1 | -1; lane: number; start: number; speed: number }[] = [
    { color: 0xef4444, axis: 'z', dir: -1, lane: 2.8, start: 34, speed: 9.5 },
    { color: 0x3b82f6, axis: 'z', dir: 1, lane: -2.8, start: -34, speed: 8.5 },
    { color: 0xf59e0b, axis: 'x', dir: 1, lane: 2.4, start: -38, speed: 9.0 },
    { color: 0x10b981, axis: 'x', dir: -1, lane: -2.4, start: 38, speed: 8.0 }
  ];
  for (const cfg of carConfigs) {
    const cg = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.72, 3.4),
      new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.35, metalness: 0.25 })
    );
    body.position.y = 0.58;
    body.castShadow = true;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.62, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.3 })
    );
    cabin.position.set(0, 1.2, -0.1);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    for (const [wx, wz] of [
      [-0.95, 1.0],
      [0.95, 1.0],
      [-0.95, -1.0],
      [0.95, -1.0]
    ]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 12), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.32, wz);
      cg.add(wheel);
    }
    cg.add(body, cabin);
    if (cfg.axis === 'z') {
      cg.position.set(cfg.lane, 0.05, cfg.start);
      cg.rotation.y = cfg.dir === 1 ? 0 : Math.PI;
    } else {
      cg.position.set(cfg.start, 0.05, cfg.lane);
      cg.rotation.y = cfg.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    }
    root.add(cg);
    cars.push({
      group: cg,
      axis: cfg.axis,
      dir: cfg.dir,
      laneCoord: cfg.lane,
      pos: cfg.start,
      speed: cfg.speed,
      maxSpeed: cfg.speed
    });
  }

  // 8. Chapter Buildings & Red-Gold Versus Building
  const buildings = new Map<BuildingId, BuildingVisualRefs>();
  for (const def of CITY_BUILDINGS) {
    const bg = new THREE.Group();
    bg.position.set(def.x, 0, def.z);
    bg.rotation.y = def.facingAngle;

    const width = def.isVersus ? 13 : 10.5;
    const depth = def.isVersus ? 10.5 : 8.5;
    const height = def.isVersus ? 8.2 : 6.4;

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
    const trimMat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.45, metalness: 0.15 });
    const accentMat = new THREE.MeshStandardMaterial({ color: def.accentColor, roughness: 0.35, metalness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      roughness: 0.15,
      metalness: 0.6
    });

    // Plinth & Steps
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 1.4, 0.4, depth + 1.6), sidewalkMat);
    plinth.position.y = 0.2;
    plinth.receiveShadow = true;

    // Main Building Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      def.isVersus ? trimMat : wallMat
    );
    body.position.y = height / 2 + 0.4;
    body.castShadow = true;
    body.receiveShadow = true;

    // Roof Cap & Band
    const band = new THREE.Mesh(new THREE.BoxGeometry(width + 0.5, 0.7, depth + 0.5), trimMat);
    band.position.y = height + 0.45;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(width - 0.6, 0.8, depth - 0.6), accentMat);
    roof.position.y = height + 1.15;

    // Front Pillars
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.75, height - 0.5, 0.75), accentMat);
    pillarL.position.set(-2.3, height / 2 + 0.2, depth / 2 + 0.35);
    const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.75, height - 0.5, 0.75), accentMat);
    pillarR.position.set(2.3, height / 2 + 0.2, depth / 2 + 0.35);

    // Decorative Windows
    for (const wx of [-3.6, 3.6]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.18), glassMat);
      win.position.set(wx, 3.3, depth / 2 + 0.08);
      bg.add(win);
    }

    // Entrance Door Frame
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 3.2, 0.25),
      new THREE.MeshStandardMaterial({
        color: def.isVersus ? 0xfbbf24 : 0x0ea5e9,
        emissive: def.isVersus ? 0xd97706 : 0x0284c7,
        emissiveIntensity: 0.45
      })
    );
    door.position.set(0, 2.0, depth / 2 + 0.05);

    // 3D Signboard above door
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 152;
    drawBuildingSign(signCanvas, def, false, 0);
    const signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.colorSpace = THREE.SRGBColorSpace;
    signTexture.anisotropy = maxAnisotropy;
    const signMat = new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.4 });
    const signMesh = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.85, 0.28), [
      trimMat,
      trimMat,
      trimMat,
      trimMat,
      signMat,
      trimMat
    ]);
    signMesh.position.set(0, height - 0.6, depth / 2 + 0.55);

    // Glowing Portal Ring on ground in front of door
    const portalMat = new THREE.MeshStandardMaterial({
      color: def.isVersus ? 0xfbbf24 : 0x38bdf8,
      emissive: def.isVersus ? 0xef4444 : def.color,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });
    const portalRing = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.16, 12, 28), portalMat);
    portalRing.rotation.x = Math.PI / 2;
    portalRing.position.set(0, 0.24, depth / 2 + 2.4);

    // Roof Completion Beacon & Spinning Star (hidden until completed)
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(0, height + 2.5, 0);
    beaconGroup.visible = false;
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.45
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.75, 7, 12), beamMat);
    beam.position.y = 3.2;
    const starMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.15, 0),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9,
        metalness: 0.6,
        roughness: 0.2
      })
    );
    starMesh.position.y = 1.2;
    beaconGroup.add(beam, starMesh);

    bg.add(plinth, body, band, roof, pillarL, pillarR, door, signMesh, portalRing, beaconGroup);
    root.add(bg);

    // World-space collider approximation
    const rot90 = Math.abs(Math.sin(def.facingAngle)) > 0.7;
    const halfX = (rot90 ? depth : width) / 2 + 0.6;
    const halfZ = (rot90 ? width : depth) / 2 + 0.6;

    buildings.set(def.id, {
      def,
      group: bg,
      portalRing,
      beaconGroup,
      starMesh,
      signMesh,
      signCanvas,
      signTexture,
      collider: {
        minX: def.x - halfX,
        maxX: def.x + halfX,
        minZ: def.z - halfZ,
        maxZ: def.z + halfZ
      }
    });
  }

  return {
    root,
    buildings,
    streetLights,
    trafficBulbs: { nsRed, nsYellow, nsGreen, ewRed, ewYellow, ewGreen },
    cars,
    fountainWater,
    roadMat,
    updateBuildingSign(id: BuildingId, completed: boolean, masteryCount: number) {
      const ref = buildings.get(id);
      if (!ref) return;
      drawBuildingSign(ref.signCanvas, ref.def, completed, masteryCount);
      ref.signTexture.needsUpdate = true;
      ref.beaconGroup.visible = completed;
    },
    setNightLights(isLit: boolean, isWet: boolean) {
      const targetEmissive = isLit ? 1.5 : 0.12;
      for (const sl of streetLights) {
        sl.bulbMat.emissiveIntensity = targetEmissive;
      }
      roadMat.roughness = isWet ? 0.24 : 0.85;
      roadMat.metalness = isWet ? 0.35 : 0.05;
    },
    animate(dt: number, elapsed: number) {
      // Traffic cycle: 14s loop -> 0..5.5s NS green, 5.5..7s NS yellow, 7..12.5s EW green, 12.5..14s EW yellow
      const cycle = elapsed % 14;
      const nsGo = cycle < 5.5;
      const nsWarn = cycle >= 5.5 && cycle < 7;
      const ewGo = cycle >= 7 && cycle < 12.5;
      const ewWarn = cycle >= 12.5;

      nsGreen.emissiveIntensity = nsGo ? 1.6 : 0;
      nsYellow.emissiveIntensity = nsWarn ? 1.6 : 0;
      nsRed.emissiveIntensity = !nsGo && !nsWarn ? 1.6 : 0;

      ewGreen.emissiveIntensity = ewGo ? 1.6 : 0;
      ewYellow.emissiveIntensity = ewWarn ? 1.6 : 0;
      ewRed.emissiveIntensity = !ewGo && !ewWarn ? 1.6 : 0;

      // Move cars & brake before red lights
      for (const car of cars) {
        const allow = car.axis === 'z' ? nsGo : ewGo;
        const approachingLine =
          car.dir === 1 ? car.pos > -11.5 && car.pos < -7.2 : car.pos < 11.5 && car.pos > 7.2;

        const targetSpeed = !allow && approachingLine ? 0 : car.maxSpeed;
        car.speed += (targetSpeed - car.speed) * Math.min(1, dt * 6);
        car.pos += car.dir * car.speed * dt;
        if (car.pos > 48) car.pos = -48;
        if (car.pos < -48) car.pos = 48;

        if (car.axis === 'z') {
          car.group.position.z = car.pos;
        } else {
          car.group.position.x = car.pos;
        }
      }

      // Fountain ripple
      fountainWater.position.y = 0.52 + Math.sin(elapsed * 3.5) * 0.04;

      // Building portals & completion stars
      for (const b of buildings.values()) {
        const s = 1 + Math.sin(elapsed * 3.2) * 0.06;
        b.portalRing.scale.set(s, s, 1);
        if (b.beaconGroup.visible) {
          b.starMesh.rotation.y = elapsed * 1.8;
          b.starMesh.position.y = 1.2 + Math.sin(elapsed * 2.5) * 0.25;
        }
      }
    }
  };
}
