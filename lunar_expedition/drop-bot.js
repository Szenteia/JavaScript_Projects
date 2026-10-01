import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const steel = new THREE.MeshStandardMaterial({ color: 0x79858b, metalness: 0.75, roughness: 0.48 });
const dark = new THREE.MeshStandardMaterial({ color: 0x182127, metalness: 0.4, roughness: 0.7 });
const orange = new THREE.MeshStandardMaterial({ color: 0xe6993e, metalness: 0.35, roughness: 0.5 });
const signal = new THREE.MeshStandardMaterial({ color: 0x70e5db, emissive: 0x268b85, emissiveIntensity: 1.3 });

function part(group, geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z); group.add(mesh); return mesh;
}
function box(group, material, w, h, d, x, y, z) {
  return part(group, new THREE.BoxGeometry(w, h, d), material, x, y, z);
}
function batch(group) {
  group.updateMatrixWorld(true);
  const buckets = new Map();
  group.traverse((mesh) => {
    if (!mesh.isMesh) return;
    if (!buckets.has(mesh.material)) buckets.set(mesh.material, []);
    const transformed = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    const geometry = transformed.index ? transformed.toNonIndexed() : transformed;
    if (geometry !== transformed) transformed.dispose();
    buckets.get(mesh.material).push(geometry);
  });
  const result = new THREE.Group();
  result.userData.partCount = group.children.length;
  for (const [material, geometries] of buckets) {
    const geometry = mergeGeometries(geometries);
    if (!geometry) throw new Error('Drop-Bot geometry could not be merged');
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    result.add(mesh);
    geometries.forEach((g) => g.dispose());
  }
  group.traverse((mesh) => { if (mesh.isMesh) mesh.geometry.dispose(); });
  return result;
}

function robotTemplate() {
  const group = new THREE.Group();
  box(group, dark, 2.8, 0.5, 3.1, 0, 0.9, 0);
  box(group, steel, 2.5, 1.8, 2.6, 0, 2, 0);
  box(group, orange, 2.55, 0.25, 2.65, 0, 2.85, 0);
  // Open hopper, armored rim and disposal chute on the rear.
  box(group, dark, 1.9, 0.1, 1.8, 0, 3.03, 0);
  for (const x of [-1.1, 1.1]) box(group, steel, 0.2, 0.8, 2.4, x, 3.25, 0);
  for (const z of [-1.1, 1.1]) box(group, steel, 2.4, 0.8, 0.2, 0, 3.25, z);
  box(group, dark, 1.25, 0.8, 0.2, 0, 1.9, 1.34);
  box(group, orange, 1.4, 0.15, 0.85, 0, 1.5, 1.65).rotation.x = -0.3;
  const wheelGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
  for (const x of [-1.5, 1.5]) for (const z of [-1, 1]) {
    part(group, wheelGeometry.clone(), dark, x, 0.7, z).rotation.z = Math.PI / 2;
    part(group, new THREE.CylinderGeometry(0.32, 0.32, 0.55, 12), steel, x, 0.7, z).rotation.z = Math.PI / 2;
    box(group, orange, 0.25, 0.4, 1.1, x, 1.45, z);
  }
  wheelGeometry.dispose();
  box(group, dark, 1.8, 0.6, 0.15, 0, 2.3, -1.35);
  for (const x of [-0.5, 0.5]) part(group, new THREE.SphereGeometry(0.18, 12, 8), signal, x, 2.4, -1.5);
  for (const x of [-1.4, 1.4]) {
    box(group, steel, 0.3, 1.25, 0.3, x, 2.1, -0.7).rotation.z = x > 0 ? -0.25 : 0.25;
    box(group, dark, 0.65, 0.18, 0.6, x * 1.2, 1.45, -0.9);
    for (const offset of [-0.22, 0.22]) box(group, steel, 0.12, 0.45, 0.15, x * 1.2 + offset, 1.2, -1.05);
  }
  for (let i = 0; i < 5; i += 1) box(group, dark, 0.1, 0.75, 0.05, -0.65 + i * 0.32, 2.1, 1.47);
  part(group, new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8), steel, 0.9, 3.9, -0.7);
  part(group, new THREE.SphereGeometry(0.16, 10, 8), signal, 0.9, 4.5, -0.7);
  // Three raised identity bars form a readable badge without a network texture.
  for (let i = 0; i < 3; i += 1) box(group, orange, 0.65, 0.08, 0.06, 0, 1.9 + i * 0.15, -1.4);
  const result = batch(group); result.name = 'Drop-Bot'; return result;
}

function caltropsTemplate() {
  const group = new THREE.Group();
  part(group, new THREE.IcosahedronGeometry(0.26, 0), steel, 0, 0.47, 0);
  // Tetrahedral spikes: three legs on the ground and one point upwards.
  const directions = [new THREE.Vector3(0, 1, 0)];
  for (let i = 0; i < 3; i += 1) {
    const angle = i * Math.PI * 2 / 3;
    directions.push(new THREE.Vector3(Math.cos(angle) * Math.sqrt(8 / 9), -1 / 3, Math.sin(angle) * Math.sqrt(8 / 9)));
  }
  for (const direction of directions) {
    const spike = part(group, new THREE.ConeGeometry(0.17, 1.2, 8), steel);
    spike.position.copy(direction).multiplyScalar(0.6).add(new THREE.Vector3(0, 0.47, 0));
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    const band = part(group, new THREE.CylinderGeometry(0.15, 0.15, 0.12, 8), orange);
    band.position.copy(direction).multiplyScalar(0.35).add(new THREE.Vector3(0, 0.47, 0));
    band.quaternion.copy(spike.quaternion);
  }
  const result = batch(group); result.name = 'caltrops'; return result;
}

const bot = robotTemplate();
const caltrops = caltropsTemplate();
export function createDropBotModel() {
  const model = bot.clone(true);
  // Only the emissive sensors differ per robot; hull geometry/materials stay shared.
  model.children.find((mesh) => mesh.material === signal).material = signal.clone();
  return model;
}
export const createCaltropsModel = () => caltrops.clone(true);

export function createDropBotSystem({ heightAt, spawnMaterial, removeMaterial, onDrop = () => {}, obstacles = [], random = Math.random }) {
  const root = new THREE.Group(); root.name = 'drop-bot-fleet';
  const count = 5 + Math.floor(random() * 4);
  const robots = [];
  const safe = (x, z, radius) => Math.hypot(x, z - 25) > radius + 24
    && obstacles.every((o) => Math.hypot(x - o.x, z - o.z) > radius + o.radius + 7)
    && robots.every((r) => Math.hypot(x - r.x, z - r.z) > radius + r.radius + 12);
  for (let i = 0; i < count; i += 1) {
    const radius = 8 + random() * 4;
    let x, z, placed = false;
    for (let attempt = 0; attempt < 200; attempt += 1) {
      x = (random() - 0.5) * 340; z = (random() - 0.5) * 340;
      if (safe(x, z, radius)) { placed = true; break; }
    }
    if (!placed) {
      // Guaranteed roomy alternatives if repeated random samples are unsuitable.
      for (const cx of [-250, -125, 0, 125, 250]) for (const cz of [-250, -125, 0, 125, 250]) {
        if (!placed && safe(cx, cz, radius)) { x = cx; z = cz; placed = true; }
      }
    }
    if (!placed) throw new Error('No safe Drop-Bot patrol placement');
    const mesh = createDropBotModel(); mesh.name = `Drop-Bot ${i + 1}`; root.add(mesh);
    robots.push({ id: i + 1, mesh, eyes: mesh.children.find((m) => m.material.emissiveIntensity === 1.3).material,
      x, z, radius, phase: random() * Math.PI * 2, nextDrop: 4 + random() * 6, flashUntil: 0,
      bag: [], collider: { x: 0, z: 0, radius: 2.5 } });
  }
  // Two instanced draws for the entire fleet's obstacles, including warning bands.
  const hazards = Array.from({ length: 64 }, () => ({ position: new THREE.Vector3(), angle: 0, expires: 0 }));
  const fields = caltrops.children.map((mesh) => {
    const field = new THREE.InstancedMesh(mesh.geometry, mesh.material, hazards.length);
    field.instanceMatrix.setUsage(THREE.DynamicDrawUsage); field.count = 0; field.receiveShadow = true;
    root.add(field); return field;
  });
  const dummy = new THREE.Object3D(), dropPosition = new THREE.Vector3();
  const pickups = [];
  let elapsed = 0, nextDamage = 0, materialIndex = 0;
  function rebuild(preloading = false) {
    let index = 0;
    for (const hazard of hazards) {
      if (!preloading && hazard.expires <= elapsed) continue;
      dummy.position.copy(hazard.position); dummy.rotation.set(0, hazard.angle, 0); dummy.updateMatrix();
      fields.forEach((field) => field.setMatrixAt(index, dummy.matrix)); index += 1;
    }
    fields.forEach((field) => { field.count = index; field.instanceMatrix.needsUpdate = true; field.computeBoundingSphere(); });
  }
  function nextKind(robot) {
    if (!robot.bag.length) {
      robot.bag = ['material', 'material', 'material', ...Array(7).fill('caltrops')];
      for (let i = robot.bag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [robot.bag[i], robot.bag[j]] = [robot.bag[j], robot.bag[i]];
      }
    }
    return robot.bag.pop();
  }
  function update(delta) {
    const previous = elapsed; elapsed += delta;
    let dirty = hazards.some((h) => h.expires > previous && h.expires <= elapsed);
    for (let i = pickups.length - 1; i >= 0; i -= 1) {
      if (pickups[i].expires <= elapsed || pickups[i].mesh.userData.collected) {
        if (!pickups[i].mesh.userData.collected) removeMaterial(pickups[i].mesh);
        pickups.splice(i, 1);
      }
    }
    for (const robot of robots) {
      const angle = robot.phase + elapsed * 0.9 / robot.radius;
      robot.mesh.position.set(robot.x + Math.cos(angle) * robot.radius, 0, robot.z + Math.sin(angle) * robot.radius);
      robot.mesh.position.y = heightAt(robot.mesh.position.x, robot.mesh.position.z);
      robot.mesh.rotation.y = Math.PI - angle;
      robot.collider.x = robot.mesh.position.x; robot.collider.z = robot.mesh.position.z;
      if (elapsed >= robot.flashUntil) { robot.eyes.color.set(0x70e5db); robot.eyes.emissive.set(0x268b85); }
      if (elapsed < robot.nextDrop) continue;
      robot.nextDrop = elapsed + 10;
      dropPosition.set(Math.sin(angle) * 3.7, 0, -Math.cos(angle) * 3.7).add(robot.mesh.position);
      const type = nextKind(robot);
      if (type === 'material') {
        if (pickups.length >= 18) removeMaterial(pickups.shift().mesh);
        pickups.push({ mesh: spawnMaterial(dropPosition.clone(), materialIndex++), expires: elapsed + 60 });
      } else {
        // Recycle the oldest if a particularly clustered series fills the bounded pool.
        const hazard = hazards.find((h) => h.expires <= elapsed) || hazards.reduce((a, b) => a.expires < b.expires ? a : b);
        hazard.position.copy(dropPosition); hazard.position.y = heightAt(dropPosition.x, dropPosition.z);
        hazard.angle = angle; hazard.expires = elapsed + 90; dirty = true;
      }
      robot.eyes.color.set(type === 'material' ? 0x39ff65 : 0xff2828);
      robot.eyes.emissive.copy(robot.eyes.color); robot.flashUntil = elapsed + 1;
      onDrop(type, robot.id);
    }
    if (dirty) rebuild();
  }
  function contactDamage(position, eyeHeight) {
    if (elapsed < nextDamage) return 0;
    for (const hazard of hazards) {
      if (hazard.expires <= elapsed) continue;
      const feet = position.y - eyeHeight;
      if (feet < hazard.position.y - 0.3 || feet > hazard.position.y + 1.7) continue;
      if (Math.hypot(position.x - hazard.position.x, position.z - hazard.position.z) < 1.3) {
        nextDamage = elapsed + 2; return 18;
      }
    }
    return 0;
  }
  update(0);
  return { root, count, colliders: robots.map((r) => r.collider), update, contactDamage, setPreloading: rebuild };
}
