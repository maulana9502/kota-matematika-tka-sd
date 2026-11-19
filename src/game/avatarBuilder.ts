import * as THREE from 'three';
import { AvatarAppearance, CompanionId } from '../types/game';

export interface AvatarRig {
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  headGroup: THREE.Group;
  torsoMesh: THREE.Mesh;
  leftLegMesh: THREE.Mesh;
  rightLegMesh: THREE.Mesh;
  hairGroup: THREE.Group;
  hatGroup: THREE.Group;
  nameplateSprite: THREE.Sprite;
  companionRig: CompanionRig;
  updateAppearance: (app: AvatarAppearance) => void;
  updateNameplate: (name: string, className: string, level: number, progressText: string) => void;
  animate: (dt: number, elapsed: number, moving: boolean, sprinting: boolean) => void;
  dispose: () => void;
}

export interface CompanionRig {
  root: THREE.Group;
  wingLeft?: THREE.Mesh;
  wingRight?: THREE.Mesh;
  antennaTip?: THREE.Mesh;
  type: CompanionId;
  setType: (t: CompanionId) => void;
  animate: (elapsed: number, ownerMoving: boolean) => void;
}

function createFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FDBA74';
  ctx.fillRect(0, 0, 128, 128);

  // Rosy cheeks
  ctx.fillStyle = 'rgba(244, 114, 182, 0.55)';
  ctx.beginPath();
  ctx.arc(28, 76, 10, 0, Math.PI * 2);
  ctx.arc(100, 76, 10, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(42, 54, 8, 0, Math.PI * 2);
  ctx.arc(86, 54, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eye sparkles
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(44, 51, 3, 0, Math.PI * 2);
  ctx.arc(88, 51, 3, 0, Math.PI * 2);
  ctx.fill();

  // Cheerful smile
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(64, 72, 18, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawNameplateCanvas(
  canvas: HTMLCanvasElement,
  name: string,
  className: string,
  level: number,
  progressText: string
) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Rounded dark pill plaque
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(8, 8, w - 16, h - 16, 20);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 30px sans-serif';
  const shortName = name.length > 18 ? name.slice(0, 17) + '…' : name;
  ctx.fillText(shortName, w / 2, 48);

  ctx.fillStyle = '#FCD34D';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Kelas ${className} · Lv.${level} · ${progressText}`, w / 2, 84);
}

export function createCompanionRig(initialType: CompanionId): CompanionRig {
  const root = new THREE.Group();
  let currentType: CompanionId = initialType;
  let wingLeft: THREE.Mesh | undefined;
  let wingRight: THREE.Mesh | undefined;
  let antennaTip: THREE.Mesh | undefined;

  const buildMesh = (type: CompanionId) => {
    while (root.children.length > 0) {
      const c = root.children[0];
      root.remove(c);
    }
    wingLeft = undefined;
    wingRight = undefined;
    antennaTip = undefined;

    if (type === 'garuda') {
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.2 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.5 });
      const crestMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.48), bodyMat);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.32), goldMat);
      head.position.set(0, 0.3, 0.12);
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), crestMat);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 0.28, 0.34);
      const crown = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.22), crestMat);
      crown.position.set(0, 0.48, 0.1);

      wingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.3), goldMat);
      wingLeft.position.set(-0.36, 0.08, 0);
      wingRight = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.3), goldMat);
      wingRight.position.set(0.36, 0.08, 0);

      root.add(body, head, beak, crown, wingLeft, wingRight);
    } else if (type === 'robot') {
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.55 });
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.8
      });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.3 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.4), bodyMat);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.32, 0.36), whiteMat);
      head.position.set(0, 0.38, 0);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.06), visorMat);
      visor.position.set(0, 0.38, 0.17);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.18, 8), whiteMat);
      stem.position.set(0, 0.62, 0);
      antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), visorMat);
      antennaTip.position.set(0, 0.72, 0);

      wingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.12), whiteMat);
      wingLeft.position.set(-0.3, 0, 0);
      wingRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.12), whiteMat);
      wingRight.position.set(0.3, 0, 0);

      root.add(body, head, visor, stem, antennaTip, wingLeft, wingRight);
    } else if (type === 'kucing') {
      const furMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 });
      const creamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.7 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.38, 0.44), furMat);
      const belly = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.06), creamMat);
      belly.position.set(0, -0.02, 0.21);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.34), furMat);
      head.position.set(0, 0.34, 0.08);
      const earL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), furMat);
      earL.position.set(-0.12, 0.56, 0.08);
      const earR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), furMat);
      earR.position.set(0.12, 0.56, 0.08);
      const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.06), glassMat);
      glasses.position.set(0, 0.36, 0.25);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.36), furMat);
      tail.position.set(0, 0.06, -0.34);
      tail.rotation.x = 0.45;

      root.add(body, belly, head, earL, earR, glasses, tail);
    } else {
      // Naga Aksara
      const scaleMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35, metalness: 0.4 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.5), scaleMat);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.38), scaleMat);
      head.position.set(0, 0.32, 0.14);
      const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), goldMat);
      hornL.position.set(-0.1, 0.52, 0.1);
      const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), goldMat);
      hornR.position.set(0.1, 0.52, 0.1);

      wingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.32), goldMat);
      wingLeft.position.set(-0.36, 0.14, -0.02);
      wingRight = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.32), goldMat);
      wingRight.position.set(0.36, 0.14, -0.02);

      root.add(body, head, hornL, hornR, wingLeft, wingRight);
    }
  };

  buildMesh(initialType);

  return {
    root,
    wingLeft,
    wingRight,
    antennaTip,
    get type() {
      return currentType;
    },
    setType(t: CompanionId) {
      if (t !== currentType) {
        currentType = t;
        buildMesh(t);
      }
    },
    animate(elapsed: number, ownerMoving: boolean) {
      const bobSpeed = ownerMoving ? 5.5 : 2.8;
      root.position.y = 1.65 + Math.sin(elapsed * bobSpeed) * 0.16;
      root.rotation.y = Math.sin(elapsed * 1.4) * 0.18;
      if (wingLeft && wingRight) {
        const flap = Math.sin(elapsed * (ownerMoving ? 14 : 7)) * 0.45;
        wingLeft.rotation.z = flap;
        wingRight.rotation.z = -flap;
      }
    }
  };
}

export function createRobloxAvatar(
  appearance: AvatarAppearance,
  identityLabel: { name: string; className: string; level: number; progressText: string }
): AvatarRig {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfdba74, roughness: 0.6 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: appearance.shirtColor, roughness: 0.55 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: appearance.pantsColor, roughness: 0.65 });
  const hairMat = new THREE.MeshStandardMaterial({ color: appearance.hairColor, roughness: 0.7 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

  // Legs (pivot at hip y = 0.78)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.2, 0.78, 0);
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.72, 0.36), pantsMat);
  leftLegMesh.position.y = -0.36;
  leftLegMesh.castShadow = true;
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.42), shoeMat);
  leftShoe.position.set(0, -0.71, 0.03);
  leftLeg.add(leftLegMesh, leftShoe);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.2, 0.78, 0);
  const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.72, 0.36), pantsMat);
  rightLegMesh.position.y = -0.36;
  rightLegMesh.castShadow = true;
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.42), shoeMat);
  rightShoe.position.set(0, -0.71, 0.03);
  rightLeg.add(rightLegMesh, rightShoe);

  // Torso
  const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.84, 0.44), shirtMat);
  torsoMesh.position.set(0, 1.22, 0);
  torsoMesh.castShadow = true;

  // Arms (pivot at shoulder y = 1.56)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.56, 1.56, 0);
  const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.32), shirtMat);
  leftSleeve.position.y = -0.17;
  const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.44, 0.3), skinMat);
  leftForearm.position.y = -0.52;
  leftArm.add(leftSleeve, leftForearm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.56, 1.56, 0);
  const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.32), shirtMat);
  rightSleeve.position.y = -0.17;
  const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.44, 0.3), skinMat);
  rightForearm.position.y = -0.52;
  rightArm.add(rightSleeve, rightForearm);

  // Head with smiling face texture on front (+Z)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.94, 0);
  const faceTex = createFaceTexture();
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.55 });
  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.58, 0.58), [
    skinMat,
    skinMat,
    skinMat,
    skinMat,
    faceMat,
    skinMat
  ]);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Hair & Hat Groups
  const hairGroup = new THREE.Group();
  const topHair = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.16, 0.62), hairMat);
  topHair.position.set(0, 0.32, 0);
  const backHair = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.42, 0.14), hairMat);
  backHair.position.set(0, 0.08, -0.26);
  hairGroup.add(topHair, backHair);
  headGroup.add(hairGroup);

  const hatGroup = new THREE.Group();
  headGroup.add(hatGroup);

  const buildHat = (style: string) => {
    while (hatGroup.children.length > 0) hatGroup.remove(hatGroup.children[0]);
    if (style === 'topi-sekolah') {
      const capMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });
      const crown = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.2, 0.64), capMat);
      crown.position.set(0, 0.38, 0);
      const brim = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.32), capMat);
      brim.position.set(0, 0.29, 0.42);
      hatGroup.add(crown, brim);
    } else if (style === 'topi-juara') {
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.5 });
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.18, 8), goldMat);
      band.position.set(0, 0.44, 0);
      hatGroup.add(band);
    } else if (style === 'bando-pintar') {
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
      const starMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.7 });
      const arc = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.14), bandMat);
      arc.position.set(0, 0.38, 0.05);
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), starMat);
      gem.position.set(0, 0.54, 0.05);
      hatGroup.add(arc, gem);
    }
  };
  buildHat(appearance.hatStyle);

  // Floating Nameplate Sprite
  const npCanvas = document.createElement('canvas');
  npCanvas.width = 512;
  npCanvas.height = 112;
  drawNameplateCanvas(
    npCanvas,
    identityLabel.name,
    identityLabel.className,
    identityLabel.level,
    identityLabel.progressText
  );
  const npTexture = new THREE.CanvasTexture(npCanvas);
  npTexture.colorSpace = THREE.SRGBColorSpace;
  const npMaterial = new THREE.SpriteMaterial({ map: npTexture, transparent: true, depthTest: true });
  const nameplateSprite = new THREE.Sprite(npMaterial);
  nameplateSprite.position.set(0, 2.88, 0);
  nameplateSprite.scale.set(2.9, 0.64, 1);

  // Companion 3D floating next to right shoulder
  const companionRig = createCompanionRig(appearance.companion);
  companionRig.root.position.set(1.15, 1.65, -0.25);

  root.add(leftLeg, rightLeg, torsoMesh, leftArm, rightArm, headGroup, nameplateSprite, companionRig.root);

  return {
    root,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    headGroup,
    torsoMesh,
    leftLegMesh,
    rightLegMesh,
    hairGroup,
    hatGroup,
    nameplateSprite,
    companionRig,
    updateAppearance(app: AvatarAppearance) {
      shirtMat.color.set(app.shirtColor);
      pantsMat.color.set(app.pantsColor);
      hairMat.color.set(app.hairColor);
      buildHat(app.hatStyle);
      companionRig.setType(app.companion);
    },
    updateNameplate(name: string, className: string, level: number, progressText: string) {
      drawNameplateCanvas(npCanvas, name, className, level, progressText);
      npTexture.needsUpdate = true;
    },
    animate(dt: number, elapsed: number, moving: boolean, sprinting: boolean) {
      if (moving) {
        const freq = sprinting ? 14 : 9.5;
        const amp = sprinting ? 0.72 : 0.52;
        const swing = Math.sin(elapsed * freq) * amp;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.85;
        rightArm.rotation.x = swing * 0.85;
        torsoMesh.position.y = 1.22 + Math.abs(Math.sin(elapsed * freq)) * 0.05;
        headGroup.position.y = 1.94 + Math.abs(Math.sin(elapsed * freq)) * 0.05;
      } else {
        const settle = Math.min(1, dt * 10);
        leftLeg.rotation.x *= 1 - settle;
        rightLeg.rotation.x *= 1 - settle;
        leftArm.rotation.x *= 1 - settle;
        rightArm.rotation.x *= 1 - settle;
        torsoMesh.position.y = 1.22 + Math.sin(elapsed * 2.2) * 0.015;
        headGroup.position.y = 1.94 + Math.sin(elapsed * 2.2) * 0.015;
      }
      companionRig.animate(elapsed, moving);
    },
    dispose() {
      faceTex.dispose();
      npTexture.dispose();
      npMaterial.dispose();
      skinMat.dispose();
      shirtMat.dispose();
      pantsMat.dispose();
      hairMat.dispose();
      shoeMat.dispose();
    }
  };
}
