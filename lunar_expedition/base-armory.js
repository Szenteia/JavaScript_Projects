import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const GREEN = 0x48ef87;
const OPEN_TIME = 1.2;

function box(parent, material, size, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Four material batches keep the detailed weapon cheap to draw.
export function createLaserPistol() {
  const root = new THREE.Group();
  root.name = 'laser-pistol';
  const alloy = new THREE.MeshStandardMaterial({ color: 0x899aa4, metalness: 0.8, roughness: 0.35 });
  const grip = new THREE.MeshStandardMaterial({ color: 0x18232b, metalness: 0.4, roughness: 0.7 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xbd8150, metalness: 0.7, roughness: 0.4 });
  const energy = new THREE.MeshStandardMaterial({ color: 0x8af6ff, emissive: 0x2cd9ed, emissiveIntensity: 1.5 });
  box(root, alloy, [1.25, 0.34, 0.32], [0, 0.25, 0]);
  box(root, grip, [0.88, 0.12, 0.35], [-0.12, 0.48, 0]);
  const handle = box(root, grip, [0.28, 0.68, 0.3], [-0.35, -0.18, 0]);
  handle.rotation.z = -0.22;
  box(root, alloy, [0.4, 0.12, 0.36], [-0.42, -0.51, 0]);
  for (let i = 0; i < 4; i += 1) {
    box(root, alloy, [0.26, 0.035, 0.32], [-0.32 - i * 0.028, -0.05 - i * 0.1, 0]);
    box(root, copper, [0.05, 0.22, 0.35], [0.08 + i * 0.13, 0.25, 0]);
  }
  // Trigger guard and trigger; a recessed lens identifies the laser emitter.
  box(root, alloy, [0.52, 0.06, 0.12], [-0.03, -0.25, 0]);
  box(root, alloy, [0.06, 0.42, 0.12], [0.2, -0.06, 0]);
  box(root, copper, [0.06, 0.18, 0.1], [-0.02, -0.04, 0]);
  for (const [radius, length, x, material] of [[0.21, 0.3, 0.68, grip], [0.17, 0.05, 0.85, alloy], [0.115, 0.04, 0.883, energy]]) {
    const part = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 12), material);
    part.rotation.z = Math.PI / 2;
    part.position.set(x, 0.25, 0);
    root.add(part);
  }
  for (const side of [-1, 1]) {
    box(root, energy, [0.45, 0.075, 0.025], [-0.18, 0.29, side * 0.17]);
    box(root, copper, [0.21, 0.27, 0.025], [-0.46, 0.24, side * 0.18]);
  }
  box(root, grip, [0.12, 0.1, 0.18], [-0.48, 0.58, 0]);
  box(root, energy, [0.04, 0.06, 0.08], [0.45, 0.54, 0]);
  root.updateMatrixWorld(true);
  for (const material of [alloy, grip, copper, energy]) {
    const parts = root.children.filter((part) => part.material === material);
    const geometries = parts.map((part) => part.geometry.clone().applyMatrix4(part.matrix));
    const mesh = new THREE.Mesh(mergeGeometries(geometries), material);
    mesh.receiveShadow = true;
    root.add(mesh);
    geometries.forEach((geometry) => geometry.dispose());
    parts.forEach((part) => { part.removeFromParent(); part.geometry.dispose(); });
  }
  return root;
}

export function createBaseArmory(habitat) {
  const root = new THREE.Group();
  root.name = 'base-armory';
  habitat.add(root);
  const shell = new THREE.MeshStandardMaterial({ color: 0x8b9697, metalness: 0.65, roughness: 0.55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x162027, metalness: 0.5, roughness: 0.65 });
  const signal = new THREE.MeshStandardMaterial({ color: 0xb29663, metalness: 0.3, roughness: 0.6 });
  // A shallow equipment recess outside the sealed habitat endcap. The original
  // solid-building collider remains intact; the player interacts from outside.
  box(root, dark, [2.25, 3.05, 0.1], [0, 3.85, -7.45]);
  box(root, shell, [2.4, 0.12, 0.65], [0, 2.3, -7.7]);
  for (const side of [-1, 1]) {
    box(root, signal, [0.4, 3.9, 0.48], [side * 1.35, 3.9, -7.8]);
  }
  for (const y of [2.05, 5.75]) box(root, signal, [2.3, 0.2, 0.48], [0, y, -7.8]);
  const door = box(root, dark, [2.25, 3.35, 0.14], [0, 3.85, -8.05]);
  box(door, shell, [0.07, 2.95, 0.025], [0, 0, -0.08]);
  box(door, shell, [0.32, 0.16, 0.05], [0.7, -0.15, -0.1]);
  const pistol = createLaserPistol();
  pistol.position.set(0, 3.25, -7.7);
  pistol.scale.setScalar(1.15);
  root.add(pistol);
  const localPlayer = new THREE.Vector3();
  let stage = 0;
  let opening = 0;
  let collected = false;

  function inRange(position) {
    habitat.updateWorldMatrix(true, false);
    localPlayer.copy(position);
    habitat.worldToLocal(localPlayer);
    return Math.abs(localPlayer.x) <= 2.8 && localPlayer.z >= -12.5 && localPlayer.z <= -8
      && Math.abs(localPlayer.y - 3.85) <= 3.5;
  }

  return {
    root,
    get stage() { return stage; },
    get collected() { return collected; },
    get isOpen() { return opening >= OPEN_TIME; },
    prompt(position) {
      if (collected || opening < OPEN_TIME || !inRange(position)) return '';
      return 'E — Lézerpisztoly felvétele';
    },
    interact(position) {
      if (collected || !inRange(position)) return null;
      if (stage === 0) {
        stage = 1;
        signal.color.setHex(GREEN);
        return 'activated';
      }
      if (stage === 1) {
        stage = 2;
        signal.emissive.setHex(GREEN);
        signal.emissiveIntensity = 2;
        return 'powered';
      }
      if (stage === 2) {
        stage = 3;
        return 'opening';
      }
      if (opening < OPEN_TIME) return 'busy';
      collected = true;
      pistol.visible = false;
      return 'pistol';
    },
    update(delta) {
      if (stage !== 3 || opening >= OPEN_TIME) return;
      opening = Math.min(OPEN_TIME, opening + delta);
      const progress = opening / OPEN_TIME;
      door.position.y = 3.85 + 3.6 * progress * progress * (3 - 2 * progress);
    },
  };
}
