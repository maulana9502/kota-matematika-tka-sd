import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CITY_BUILDINGS } from '../data/buildings';
import {
  AvatarAppearance,
  BuildingDef,
  BuildingId,
  OnlinePlayer,
  ResolvedTimeOfDay,
  StationId,
  WeatherType
} from '../types/game';
import { AvatarRig, createRobloxAvatar } from './avatarBuilder';
import { buildCityWorld, CityWorldRefs } from './cityBuilder';
import { buildBuildingInterior, BuildingInteriorRefs } from './interiorBuilder';

export interface EngineCallbacks {
  onNearbyChange: (nearby: { kind: 'building'; building: BuildingDef } | { kind: 'station'; stationId: StationId; label: string } | null) => void;
  onPlayerMove: (x: number, y: number, z: number, rotY: number, moving: boolean) => void;
  onEnterBuilding?: (buildingId: BuildingId) => void;
  onExitBuilding?: () => void;
}

interface RemoteRigEntry {
  rig: AvatarRig;
  targetPos: THREE.Vector3;
  targetRotY: number;
  moving: boolean;
  lastKey: string;
}

export class Kota3DEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private glContext: WebGLRenderingContext | WebGL2RenderingContext;
  private pmrem: THREE.PMREMGenerator;
  private envTarget: THREE.WebGLRenderTarget;

  private city: CityWorldRefs;
  private interior: BuildingInteriorRefs;
  private playerRig: AvatarRig;
  private remotePlayers = new Map<string, RemoteRigEntry>();

  // Lighting & Atmosphere
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;
  private rainPoints: THREE.Points;
  private rainPositions: Float32Array;
  private lightningTimer = 0;
  private lightningFlash = 0;

  // Player Physics & Camera Orbit State
  private playerPos = new THREE.Vector3(0, 0, 34);
  private savedCityPos = new THREE.Vector3(0, 0, 34);
  private playerRotY = Math.PI;
  private camYaw = 0;
  private camPitch = 0.42;
  private camDistance = 12.5;
  private keys = new Set<string>();
  private joyVec = { x: 0, y: 0 };
  private mobileSprint = false;
  private activeBuildingId: BuildingId | null = null;
  private lastNearbyKey = '';

  // Pre-allocated math scratch objects outside render loop
  private _forward = new THREE.Vector3();
  private _right = new THREE.Vector3();
  private _moveDir = new THREE.Vector3();
  private _camTarget = new THREE.Vector3();
  private _camDesired = new THREE.Vector3();
  private _up = new THREE.Vector3(0, 1, 0);

  private clock = new THREE.Clock();
  private rafId = 0;
  private disposed = false;
  private callbacks: EngineCallbacks;
  private lastNetEmit = 0;

  // Current atmosphere
  private currentWeather: WeatherType = 'Cerah';
  private currentTime: ResolvedTimeOfDay = 'siang';

  // Orbit drag tracking
  private dragPointerId: number | null = null;
  private dragLastX = 0;
  private dragLastY = 0;

  constructor(
    container: HTMLElement,
    initialAppearance: AvatarAppearance,
    identityLabel: { name: string; className: string; level: number; progressText: string },
    callbacks: EngineCallbacks
  ) {
    this.container = container;
    this.callbacks = callbacks;

    // Renderer + software GL detection
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.glContext = this.renderer.getContext();
    const dbg = this.glContext.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg
      ? String(this.glContext.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
      : String(this.glContext.getParameter(this.glContext.RENDERER) || '');
    this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);

    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Scene + Camera + RoomEnvironment PMREM
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x7dd3fc);
    this.scene.fog = new THREE.Fog(0x7dd3fc, 48, 135);

    const aspect = (container.clientWidth || window.innerWidth) / Math.max(1, container.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(58, aspect, 0.2, 220);

    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envTarget = this.pmrem.fromScene(roomEnv, 0.04);
    this.scene.environment = this.envTarget.texture;
    roomEnv.dispose();

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x3f6212, 0.7);
    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    this.sunLight.position.set(28, 42, 24);
    if (!this.isSoftwareGl) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(1024, 1024);
      this.sunLight.shadow.camera.near = 2;
      this.sunLight.shadow.camera.far = 120;
      const d = 48;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
    }
    this.scene.add(this.ambientLight, this.hemiLight, this.sunLight);

    // Build City & Interior
    const maxAniso = this.isSoftwareGl ? 1 : Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.city = buildCityWorld(maxAniso);
    this.interior = buildBuildingInterior();
    this.scene.add(this.city.root, this.interior.root);

    // Local Player Avatar
    this.playerRig = createRobloxAvatar(initialAppearance, identityLabel);
    this.playerRig.root.position.copy(this.playerPos);
    this.playerRig.root.rotation.y = this.playerRotY;
    this.scene.add(this.playerRig.root);

    // 3D Rain Particle System (700 particles)
    const rainCount = 700;
    this.rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 90;
      this.rainPositions[i * 3 + 1] = Math.random() * 26;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.28,
      transparent: true,
      opacity: 0.78
    });
    this.rainPoints = new THREE.Points(rainGeo, rainMat);
    this.rainPoints.visible = false;
    this.scene.add(this.rainPoints);

    this.bindEvents();
    this.applyAtmosphere('siang', 'Cerah');
    this.animate();
  }

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
    dom.addEventListener('wheel', this.handleWheel, { passive: true });
  }

  private handleResize = () => {
    if (this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    this.keys.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private handlePointerDown = (e: PointerEvent) => {
    if (this.dragPointerId !== null) return;
    this.dragPointerId = e.pointerId;
    this.dragLastX = e.clientX;
    this.dragLastY = e.clientY;
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (this.dragPointerId !== e.pointerId) return;
    const dx = e.clientX - this.dragLastX;
    const dy = e.clientY - this.dragLastY;
    this.dragLastX = e.clientX;
    this.dragLastY = e.clientY;
    this.camYaw -= dx * 0.0065;
    this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * 0.0055, 0.14, 1.18);
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (this.dragPointerId === e.pointerId) {
      this.dragPointerId = null;
    }
  };

  private handleWheel = (e: WheelEvent) => {
    this.camDistance = THREE.MathUtils.clamp(this.camDistance + e.deltaY * 0.01, 5.5, 24);
  };

  public setJoystickVector(x: number, y: number) {
    this.joyVec.x = x;
    this.joyVec.y = y;
  }

  public setMobileSprint(sprint: boolean) {
    this.mobileSprint = sprint;
  }

  public updateAppearance(app: AvatarAppearance) {
    this.playerRig.updateAppearance(app);
  }

  public updateNameplate(name: string, className: string, level: number, progressText: string) {
    this.playerRig.updateNameplate(name, className, level, progressText);
  }

  public updateBuildingProgress(id: BuildingId, completed: boolean, masteryCount: number) {
    this.city.updateBuildingSign(id, completed, masteryCount);
    if (this.activeBuildingId === id) {
      const def = CITY_BUILDINGS.find((b) => b.id === id);
      if (def) this.interior.updateProgress(def, masteryCount);
    }
  }

  public applyAtmosphere(timeMode: ResolvedTimeOfDay, weather: WeatherType) {
    this.currentTime = timeMode;
    this.currentWeather = weather;

    const skyColors: Record<ResolvedTimeOfDay, number> = {
      pagi: 0xbae6fd,
      siang: 0x60a5fa,
      sore: 0xfb923c,
      malam: 0x0f172a
    };
    let skyHex = skyColors[timeMode];
    if (weather === 'Hujan') skyHex = timeMode === 'malam' ? 0x090d16 : 0x64748b;
    if (weather === 'Badai') skyHex = 0x1e293b;
    if (weather === 'Berawan' && timeMode !== 'malam') skyHex = 0x94a3b8;

    this.scene.background = new THREE.Color(skyHex);
    (this.scene.fog as THREE.Fog).color.setHex(skyHex);

    const isDark = timeMode === 'malam' || timeMode === 'sore' || weather === 'Badai';
    const isRain = weather === 'Hujan' || weather === 'Badai';

    this.sunLight.intensity =
      timeMode === 'malam' ? 0.25 : weather === 'Terik' ? 1.75 : weather === 'Badai' ? 0.35 : weather === 'Hujan' ? 0.55 : 1.3;
    this.sunLight.color.setHex(timeMode === 'sore' ? 0xfdba74 : timeMode === 'malam' ? 0x93c5fd : 0xfffbeb);
    this.ambientLight.intensity = timeMode === 'malam' ? 0.35 : 0.5;
    this.hemiLight.intensity = timeMode === 'malam' ? 0.32 : 0.72;
    this.renderer.toneMappingExposure = weather === 'Terik' ? 1.18 : timeMode === 'malam' ? 0.9 : 1.05;

    this.rainPoints.visible = isRain && !this.activeBuildingId;
    this.city.setNightLights(isDark || isRain, isRain);
  }

  public getPlayerPosition() {
    return { x: this.playerPos.x, y: this.playerPos.y, z: this.playerPos.z, rotY: this.playerRotY };
  }

  public getActiveBuildingId(): BuildingId | null {
    return this.activeBuildingId;
  }

  public teleportTo(x: number, z: number) {
    if (this.activeBuildingId) {
      this.exitBuilding();
    }
    this.playerPos.set(x, 0, z);
    this.playerRig.root.position.copy(this.playerPos);
    this.callbacks.onPlayerMove(x, 0, z, this.playerRotY, false);
  }

  public teleportToBuilding(id: BuildingId) {
    const def = CITY_BUILDINGS.find((b) => b.id === id);
    if (!def) return;
    if (this.activeBuildingId) this.exitBuilding();
    this.playerPos.set(def.frontX, 0, def.frontZ);
    this.playerRig.root.position.copy(this.playerPos);
    this.callbacks.onPlayerMove(def.frontX, 0, def.frontZ, this.playerRotY, false);
  }

  public enterBuilding(id: BuildingId, masteryCount: number) {
    const def = CITY_BUILDINGS.find((b) => b.id === id);
    if (!def) return;
    this.savedCityPos.copy(this.playerPos);
    this.activeBuildingId = id;
    this.city.root.visible = false;
    this.interior.root.visible = true;
    this.rainPoints.visible = false;
    this.interior.updateProgress(def, masteryCount);
    this.playerPos.set(0, 0, 5.2);
    this.playerRotY = Math.PI;
    this.playerRig.root.position.copy(this.playerPos);
    this.playerRig.root.rotation.y = this.playerRotY;
    for (const r of this.remotePlayers.values()) {
      r.rig.root.visible = false;
    }
    this.callbacks.onEnterBuilding?.(id);
  }

  public exitBuilding() {
    if (!this.activeBuildingId) return;
    this.activeBuildingId = null;
    this.interior.root.visible = false;
    this.city.root.visible = true;
    this.rainPoints.visible = this.currentWeather === 'Hujan' || this.currentWeather === 'Badai';
    this.playerPos.copy(this.savedCityPos);
    this.playerRig.root.position.copy(this.playerPos);
    for (const r of this.remotePlayers.values()) {
      r.rig.root.visible = true;
    }
    this.callbacks.onExitBuilding?.();
  }

  public syncRemotePlayers(players: OnlinePlayer[], selfId: string) {
    const seen = new Set<string>();
    for (const p of players) {
      if (p.id === selfId) continue;
      seen.add(p.id);
      const appKey = `${p.shirtColor}|${p.pantsColor}|${p.hairColor}|${p.hatStyle}|${p.companion}|${p.level}|${p.completedCount}`;
      let entry = this.remotePlayers.get(p.id);
      if (!entry) {
        const rig = createRobloxAvatar(
          {
            shirtColor: p.shirtColor || '#2563eb',
            pantsColor: p.pantsColor || '#1e293b',
            hairColor: p.hairColor || '#1e1b18',
            hatStyle: (p.hatStyle as AvatarAppearance['hatStyle']) || 'default',
            companion: p.companion || 'garuda'
          },
          {
            name: p.name,
            className: p.className,
            level: p.level || 1,
            progressText: `${p.completedCount || 0}/25 Soal`
          }
        );
        rig.root.position.set(p.x, p.y, p.z);
        rig.root.visible = !this.activeBuildingId && !p.insideBuildingId;
        this.scene.add(rig.root);
        entry = {
          rig,
          targetPos: new THREE.Vector3(p.x, p.y, p.z),
          targetRotY: p.rotY || 0,
          moving: p.moving,
          lastKey: appKey
        };
        this.remotePlayers.set(p.id, entry);
      } else {
        entry.targetPos.set(p.x, p.y, p.z);
        entry.targetRotY = p.rotY || 0;
        entry.moving = p.moving;
        entry.rig.root.visible = !this.activeBuildingId && !p.insideBuildingId;
        if (entry.lastKey !== appKey) {
          entry.lastKey = appKey;
          entry.rig.updateAppearance({
            shirtColor: p.shirtColor || '#2563eb',
            pantsColor: p.pantsColor || '#1e293b',
            hairColor: p.hairColor || '#1e1b18',
            hatStyle: (p.hatStyle as AvatarAppearance['hatStyle']) || 'default',
            companion: p.companion || 'garuda'
          });
          entry.rig.updateNameplate(p.name, p.className, p.level || 1, `${p.completedCount || 0}/25 Soal`);
        }
      }
    }

    for (const [id, entry] of this.remotePlayers.entries()) {
      if (!seen.has(id)) {
        this.scene.remove(entry.rig.root);
        entry.rig.dispose();
        this.remotePlayers.delete(id);
      }
    }
  }

  private resolveCollisions(nextX: number, nextZ: number): [number, number] {
    if (this.activeBuildingId) {
      return [THREE.MathUtils.clamp(nextX, -8.8, 8.8), THREE.MathUtils.clamp(nextZ, -8.8, 8.8)];
    }

    let cx = THREE.MathUtils.clamp(nextX, -48, 48);
    let cz = THREE.MathUtils.clamp(nextZ, -64, 48);

    // Push out of building footprints
    for (const b of this.city.buildings.values()) {
      const c = b.collider;
      if (cx > c.minX && cx < c.maxX && cz > c.minZ && cz < c.maxZ) {
        const dxMin = Math.abs(cx - c.minX);
        const dxMax = Math.abs(c.maxX - cx);
        const dzMin = Math.abs(cz - c.minZ);
        const dzMax = Math.abs(c.maxZ - cz);
        const m = Math.min(dxMin, dxMax, dzMin, dzMax);
        if (m === dxMin) cx = c.minX;
        else if (m === dxMax) cx = c.maxX;
        else if (m === dzMin) cz = c.minZ;
        else cz = c.maxZ;
      }
    }
    return [cx, cz];
  }

  private animate = () => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);

    const dt = Math.min(0.05, this.clock.getDelta());
    const elapsed = this.clock.elapsedTime;

    // 1. Movement input (Keyboard + Analog Joystick)
    let inputX = this.joyVec.x;
    let inputY = this.joyVec.y;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) inputX -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) inputX += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) inputY -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) inputY += 1;

    const inputMag = Math.hypot(inputX, inputY);
    const sprinting = this.mobileSprint || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const moving = inputMag > 0.08;

    if (moving) {
      const clampedMag = Math.min(1, inputMag);
      const nx = inputX / inputMag;
      const ny = inputY / inputMag;

      this._forward.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw)).normalize();
      this._right.crossVectors(this._forward, this._up).normalize();
      this._moveDir.set(0, 0, 0).addScaledVector(this._forward, -ny).addScaledVector(this._right, nx).normalize();

      const speed = (sprinting ? 14.5 : 8.5) * clampedMag;
      const [rx, rz] = this.resolveCollisions(
        this.playerPos.x + this._moveDir.x * speed * dt,
        this.playerPos.z + this._moveDir.z * speed * dt
      );
      this.playerPos.x = rx;
      this.playerPos.z = rz;

      const targetRot = Math.atan2(this._moveDir.x, this._moveDir.z);
      let diff = targetRot - this.playerRotY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.playerRotY += diff * Math.min(1, dt * 12);
    }

    this.playerRig.root.position.copy(this.playerPos);
    this.playerRig.root.rotation.y = this.playerRotY;
    this.playerRig.animate(dt, elapsed, moving, sprinting);

    if (elapsed - this.lastNetEmit > 0.1) {
      this.lastNetEmit = elapsed;
      this.callbacks.onPlayerMove(this.playerPos.x, this.playerPos.y, this.playerPos.z, this.playerRotY, moving);
    }

    // 2. Smooth Remote Players
    for (const r of this.remotePlayers.values()) {
      r.rig.root.position.lerp(r.targetPos, Math.min(1, dt * 9));
      r.rig.root.rotation.y = r.targetRotY;
      r.rig.animate(dt, elapsed, r.moving, false);
    }

    // 3. World & Weather Animations
    if (!this.activeBuildingId) {
      this.city.animate(dt, elapsed);

      if (this.rainPoints.visible) {
        const speedRain = this.currentWeather === 'Badai' ? 28 : 19;
        for (let i = 0; i < this.rainPositions.length; i += 3) {
          this.rainPositions[i + 1] -= speedRain * dt;
          if (this.rainPositions[i + 1] < 0) {
            this.rainPositions[i] = this.playerPos.x + (Math.random() - 0.5) * 70;
            this.rainPositions[i + 1] = 24;
            this.rainPositions[i + 2] = this.playerPos.z + (Math.random() - 0.5) * 70;
          }
        }
        (this.rainPoints.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        if (this.currentWeather === 'Badai') {
          this.lightningTimer -= dt;
          if (this.lightningTimer <= 0) {
            this.lightningTimer = 4 + Math.random() * 6;
            this.lightningFlash = 1.0;
          }
          if (this.lightningFlash > 0) {
            this.lightningFlash = Math.max(0, this.lightningFlash - dt * 4.5);
            this.ambientLight.intensity = 0.45 + this.lightningFlash * 1.9;
          }
        }
      }
    } else {
      this.interior.animate(elapsed);
    }

    // 4. Proximity check (City Building Portals OR Interior Stations)
    let nearbyKey = '';
    if (!this.activeBuildingId) {
      let found: BuildingDef | null = null;
      for (const b of CITY_BUILDINGS) {
        const dist = Math.hypot(this.playerPos.x - b.frontX, this.playerPos.z - b.frontZ);
        if (dist < 4.4) {
          found = b;
          break;
        }
      }
      nearbyKey = found ? `b:${found.id}` : '';
      if (nearbyKey !== this.lastNearbyKey) {
        this.lastNearbyKey = nearbyKey;
        this.callbacks.onNearbyChange(found ? { kind: 'building', building: found } : null);
      }
    } else {
      let foundSt: { id: StationId; label: string } | null = null;
      for (const st of this.interior.stations) {
        const dist = Math.hypot(this.playerPos.x - st.x, this.playerPos.z - st.z);
        if (dist < 3.1) {
          foundSt = { id: st.id, label: st.label };
          break;
        }
      }
      nearbyKey = foundSt ? `s:${foundSt.id}` : '';
      if (nearbyKey !== this.lastNearbyKey) {
        this.lastNearbyKey = nearbyKey;
        this.callbacks.onNearbyChange(
          foundSt ? { kind: 'station', stationId: foundSt.id, label: foundSt.label } : null
        );
      }
    }

    // 5. Camera 360 Orbit Follow
    this._camTarget.set(this.playerPos.x, this.playerPos.y + 1.85, this.playerPos.z);
    const activeDist = this.activeBuildingId ? Math.min(this.camDistance, 8.5) : this.camDistance;
    const horizDist = Math.cos(this.camPitch) * activeDist;
    const vertDist = Math.sin(this.camPitch) * activeDist;
    this._camDesired.set(
      this._camTarget.x + Math.sin(this.camYaw) * horizDist,
      this._camTarget.y + vertDist,
      this._camTarget.z + Math.cos(this.camYaw) * horizDist
    );
    if (this.activeBuildingId) {
      this._camDesired.x = THREE.MathUtils.clamp(this._camDesired.x, -9.2, 9.2);
      this._camDesired.z = THREE.MathUtils.clamp(this._camDesired.z, -9.2, 9.2);
      this._camDesired.y = THREE.MathUtils.clamp(this._camDesired.y, 1.4, 5.8);
    }
    this.camera.position.lerp(this._camDesired, Math.min(1, dt * 10));
    this.camera.lookAt(this._camTarget);

    this.renderer.render(this.scene, this.camera);

    // Software WebGL fenceSync pacing
    if (this.isSoftwareGl) {
      if ('fenceSync' in this.glContext) {
        const gl2 = this.glContext as WebGL2RenderingContext;
        const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (sync) {
          gl2.flush();
          gl2.deleteSync(sync);
        }
      } else {
        this.glContext.finish();
      }
    }
  };

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.handlePointerDown);
    dom.removeEventListener('wheel', this.handleWheel);

    this.playerRig.dispose();
    for (const r of this.remotePlayers.values()) {
      r.rig.dispose();
    }
    this.envTarget.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
    if (dom.parentElement) dom.parentElement.removeChild(dom);
  }
}
