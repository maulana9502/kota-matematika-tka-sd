import * as THREE from 'three';
import { BuildingDef, StationId } from '../types/game';

export interface InteriorStationRef {
  id: StationId;
  label: string;
  x: number;
  z: number;
  ring: THREE.Mesh;
}

export interface BuildingInteriorRefs {
  root: THREE.Group;
  stations: InteriorStationRef[];
  trophyGroup: THREE.Group;
  monumentCrystal?: THREE.Mesh;
  updateProgress: (def: BuildingDef, masteryCount: number) => void;
  animate: (elapsed: number) => void;
}

function makeStationLabelTexture(title: string, subtitle: string, accent: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 144;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 512, 144);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 132);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(title, 256, 62);
  ctx.fillStyle = accent;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(subtitle, 256, 108);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildBuildingInterior(): BuildingInteriorRefs {
  const root = new THREE.Group();
  root.visible = false;

  // Room dimensions: 20 x 20
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 20), floorMat);
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  root.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

  // North, East, West, South walls
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(20, 6.5, 0.5), wallMat);
  northWall.position.set(0, 3.25, -10);
  const southWall = new THREE.Mesh(new THREE.BoxGeometry(20, 6.5, 0.5), wallMat);
  southWall.position.set(0, 3.25, 10);
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6.5, 20), wallMat);
  eastWall.position.set(10, 3.25, 0);
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6.5, 20), wallMat);
  westWall.position.set(-10, 3.25, 0);
  root.add(northWall, southWall, eastWall, westWall);

  // Header Banner inside room
  const bannerCanvas = document.createElement('canvas');
  bannerCanvas.width = 768;
  bannerCanvas.height = 128;
  const bannerTex = new THREE.CanvasTexture(bannerCanvas);
  bannerTex.colorSpace = THREE.SRGBColorSpace;
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 1.8),
    new THREE.MeshBasicMaterial({ map: bannerTex })
  );
  banner.position.set(0, 5.1, -9.7);
  root.add(banner);

  // 4 Interactive Stations
  const stations: InteriorStationRef[] = [];

  const createStation = (
    id: StationId,
    label: string,
    sub: string,
    x: number,
    z: number,
    accent: string,
    furniture: THREE.Object3D
  ) => {
    const sg = new THREE.Group();
    sg.position.set(x, 0, z);
    sg.add(furniture);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.1, 10, 28),
      new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.85,
        roughness: 0.25
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.08;
    sg.add(ring);

    const labelTex = makeStationLabelTexture(label, sub, accent);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true }));
    sprite.position.set(0, 3.1, 0);
    sprite.scale.set(3.4, 0.96, 1);
    sg.add(sprite);

    root.add(sg);
    stations.push({ id, label, x, z, ring });
  };

  // 1. Layar Video & Materi (North: 0, -7.2)
  const screenGroup = new THREE.Group();
  const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 0.24), trimMat);
  tvFrame.position.y = 1.65;
  const tvGlass = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 1.8, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0284c7, emissiveIntensity: 0.6 })
  );
  tvGlass.position.y = 1.65;
  const tvStand = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 0.8), trimMat);
  tvStand.position.y = 0.32;
  screenGroup.add(tvFrame, tvGlass, tvStand);
  createStation('materi', '1. LAYAR MATERI', 'Buku Saku & Konsep', 0, -7.2, '#38BDF8', screenGroup);

  // 2. Meja Soal & Refleksi (East: 6.5, -0.5)
  const deskGroup = new THREE.Group();
  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.18, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 })
  );
  deskTop.position.y = 0.9;
  const deskBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.0), trimMat);
  deskBase.position.y = 0.45;
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.16, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.35 })
  );
  book.position.set(0, 1.08, 0);
  deskGroup.add(deskBase, deskTop, book);
  createStation('soal', '2. MEJA SOAL TKA', 'Peraga, Langkah & Refleksi', 6.5, -0.5, '#10B981', deskGroup);

  // 3. Terminal Kirim Google Sheet (West: -6.5, -0.5)
  const kioskGroup = new THREE.Group();
  const kioskBody = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.0, 0.9), trimMat);
  kioskBody.position.y = 1.0;
  const kioskScreen = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.85, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x16a34a, emissiveIntensity: 0.7 })
  );
  kioskScreen.position.set(0, 1.45, 0.46);
  kioskScreen.rotation.x = -0.25;
  kioskGroup.add(kioskBody, kioskScreen);
  createStation('sheet', '3. TERMINAL SHEET', 'Kirim Nilai ke Guru', -6.5, -0.5, '#4ADE80', kioskGroup);

  // 4. Pintu Keluar Kota (South: 0, 8.2)
  const exitGroup = new THREE.Group();
  const doorArch = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 3.0, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.6 })
  );
  doorArch.position.y = 1.5;
  exitGroup.add(doorArch);
  createStation('keluar', '4. PINTU KELUAR', 'Kembali ke Kota 3D', 0, 8.2, '#FBBF24', exitGroup);

  // 5. Progressive Trophy Objects (unlocked at 2, 4, 6, 8, 10)
  const trophyGroup = new THREE.Group();
  root.add(trophyGroup);

  // Tier 1 (>=2): Karpet Belajar
  const rugObj = new THREE.Group();
  const rugOuter = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.05, 4.4),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.9 })
  );
  rugOuter.position.y = 0.025;
  const rugInner = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.06, 3.2),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.85 })
  );
  rugInner.position.y = 0.03;
  rugObj.add(rugOuter, rugInner);
  trophyGroup.add(rugObj);

  // Tier 2 (>=4): Sofa & Meja Baca
  const loungeObj = new THREE.Group();
  loungeObj.position.set(-5.8, 0, -5.8);
  const sofaSeat = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.55, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.6 })
  );
  sofaSeat.position.y = 0.28;
  const sofaBack = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.65, 0.25),
    new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.6 })
  );
  sofaBack.position.set(0, 0.72, -0.42);
  const coffeeTable = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.38, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 })
  );
  coffeeTable.position.set(0, 0.19, 1.25);
  loungeObj.add(sofaSeat, sofaBack, coffeeTable);
  trophyGroup.add(loungeObj);

  // Tier 3 (>=6): Rak Piala & Tanaman Hias
  const shelfObj = new THREE.Group();
  shelfObj.position.set(5.8, 0, -5.8);
  const rack = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.5, 0.65),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
  );
  rack.position.y = 1.25;
  const goldCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.14, 0.5, 10),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.2 })
  );
  goldCup.position.set(0, 2.75, 0);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.3, 0.65, 10),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
  );
  pot.position.set(1.7, 0.32, 0.2);
  const plant = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.55, 0),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 })
  );
  plant.position.set(1.7, 1.0, 0.2);
  shelfObj.add(rack, goldCup, pot, plant);
  trophyGroup.add(shelfObj);

  // Tier 4 (>=8): Lampu Kristal & Pigura Prestasi
  const chandelierObj = new THREE.Group();
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.75, 0),
    new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.85,
      metalness: 0.3,
      roughness: 0.1
    })
  );
  crystal.position.set(0, 4.9, 0);
  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.4, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.25 })
  );
  plaque.position.set(0, 2.6, 0);
  const plaqueGroup = new THREE.Group();
  plaqueGroup.position.set(9.65, 0, -4.5);
  plaqueGroup.rotation.y = -Math.PI / 2;
  plaqueGroup.add(plaque);
  chandelierObj.add(crystal, plaqueGroup);
  trophyGroup.add(chandelierObj);

  // Tier 5 (>=10): Monumen Kristal Juara
  const monumentObj = new THREE.Group();
  monumentObj.position.set(0, 0, -0.5);
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 1.05, 0.9, 12),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.55, roughness: 0.25 })
  );
  pedestal.position.y = 0.45;
  const monumentCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65, 0),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.95,
      metalness: 0.4,
      roughness: 0.1
    })
  );
  monumentCrystal.position.y = 1.65;
  monumentObj.add(pedestal, monumentCrystal);
  trophyGroup.add(monumentObj);

  return {
    root,
    stations,
    trophyGroup,
    monumentCrystal,
    updateProgress(def: BuildingDef, masteryCount: number) {
      const ctx = bannerCanvas.getContext('2d')!;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, 768, 128);
      ctx.strokeStyle = def.accentColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 760, 120);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(def.title.toUpperCase(), 384, 58);
      ctx.fillStyle = '#FCD34D';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Objek Prestasi Interior: ${Math.min(5, Math.floor(masteryCount / 2))}/5 · Skor Bab: ${masteryCount}`, 384, 100);
      bannerTex.needsUpdate = true;

      rugObj.visible = masteryCount >= 2;
      loungeObj.visible = masteryCount >= 4;
      shelfObj.visible = masteryCount >= 6;
      chandelierObj.visible = masteryCount >= 8;
      monumentObj.visible = masteryCount >= 10;
    },
    animate(elapsed: number) {
      for (const st of stations) {
        const sc = 1 + Math.sin(elapsed * 3) * 0.06;
        st.ring.scale.set(sc, sc, 1);
      }
      if (monumentObj.visible) {
        monumentCrystal.rotation.y = elapsed * 1.4;
        monumentCrystal.position.y = 1.65 + Math.sin(elapsed * 2.4) * 0.16;
      }
    }
  };
}
