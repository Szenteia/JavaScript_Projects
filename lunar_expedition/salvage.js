import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const SALVAGE_VARIANTS = ['powerCore', 'electronics', 'scrapFrame'];

const steel = new THREE.MeshStandardMaterial({ color: 0x969c99, metalness: 0.72, roughness: 0.47 });
const dark = new THREE.MeshStandardMaterial({ color: 0x283238, metalness: 0.6, roughness: 0.56 });
const copper = new THREE.MeshStandardMaterial({ color: 0x987151, metalness: 0.68, roughness: 0.64 });
const circuit = new THREE.MeshStandardMaterial({ color: 0x3c6158, metalness: 0.25, roughness: 0.66 });
const amber = new THREE.MeshStandardMaterial({ color: 0xf0bb70, emissive: 0xa95e1b, emissiveIntensity: 0.8, roughness: 0.4 });
const boltGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.09, 6);

function part(group, geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function box(group, material, size, position) {
  return part(group, new THREE.BoxGeometry(...size), material, ...position);
}

function powerCore() {
  const group = new THREE.Group();
  part(group, new THREE.CylinderGeometry(0.5, 0.5, 1.3, 16), copper);
  for (const y of [-0.65, 0.65]) {
    part(group, new THREE.CylinderGeometry(0.7, 0.7, 0.15, 16), dark, 0, y, 0);
    for (const x of [-0.22, 0.22]) {
      part(group, new THREE.CylinderGeometry(0.1, 0.1, 0.23, 8), steel, x, y + Math.sign(y) * 0.18, 0);
    }
  }
  for (const y of [-0.36, 0, 0.36]) {
    const band = part(group, new THREE.TorusGeometry(0.51, 0.06, 6, 16), steel, 0, y, 0);
    band.rotation.x = Math.PI / 2;
  }
  for (let i = 0; i < 4; i += 1) {
    const angle = i * Math.PI / 2;
    const rail = box(group, steel, [0.12, 1.3, 0.12], [Math.sin(angle) * 0.59, 0, Math.cos(angle) * 0.59]);
    rail.rotation.y = angle;
  }
  box(group, dark, [0.34, 0.64, 0.16], [0, 0, 0.58]);
  box(group, amber, [0.15, 0.42, 0.06], [0, 0, 0.69]);
  group.userData.label = 'power core';
  return group;
}

function electronics() {
  const group = new THREE.Group();
  box(group, dark, [1.8, 0.24, 1.25], [0, -0.22, 0]);
  box(group, circuit, [1.65, 0.08, 1.1], [0, -0.05, 0]);
  box(group, copper, [0.55, 0.12, 0.65], [-0.35, 0.06, 0]);
  const finGeometry = new THREE.BoxGeometry(0.04, 0.32, 0.58);
  for (let i = 0; i < 5; i += 1) part(group, finGeometry, steel, -0.56 + i * 0.1, 0.24, 0);
  const capacitorGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.38, 10);
  for (const z of [-0.35, 0, 0.35]) part(group, capacitorGeometry, dark, 0.38, 0.16, z);
  box(group, steel, [0.18, 0.3, 0.7], [0.78, 0.07, 0]);
  box(group, amber, [0.14, 0.05, 0.12], [0.07, 0.04, -0.38]);
  for (const x of [-0.7, 0.7]) {
    for (const z of [-0.44, 0.44]) part(group, boltGeometry, steel, x, 0.04, z);
  }
  const cable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.5, 0.1, 0.4), new THREE.Vector3(0.9, 0.25, 0.65),
    new THREE.Vector3(0.8, -0.1, 0.85), new THREE.Vector3(0.3, -0.2, 0.75),
  ]);
  part(group, new THREE.TubeGeometry(cable, 10, 0.045, 6, false), copper);
  group.userData.label = 'electronics assembly';
  return group;
}

function scrapFrame() {
  const group = new THREE.Group();
  const plate = box(group, steel, [1.65, 0.13, 1.3], [0, -0.25, 0]);
  plate.rotation.z = -0.1;
  const tornPlate = box(group, copper, [0.8, 0.12, 0.85], [0.45, -0.04, 0.25]);
  tornPlate.rotation.z = 0.48;
  tornPlate.rotation.y = 0.2;
  for (const z of [-0.5, 0.5]) box(group, dark, [1.75, 0.17, 0.16], [0, 0, z]);
  const pipeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.45, 10);
  for (const x of [-0.5, 0.1]) {
    const pipe = part(group, pipeGeometry, steel, x, 0.26, 0);
    pipe.rotation.x = Math.PI / 2;
    const coupling = part(group, new THREE.TorusGeometry(0.12, 0.055, 6, 10), copper, x, 0.26, 0.3);
    coupling.rotation.z = 0.2;
  }
  for (const x of [-0.65, 0.65]) {
    for (const z of [-0.5, 0.5]) part(group, boltGeometry, copper, x, 0.12, z);
  }
  box(group, amber, [0.32, 0.04, 0.14], [-0.3, -0.12, -0.25]);
  group.userData.label = 'structural scrap';
  return group;
}

function batchParts(group) {
  const batches = new Map();
  group.userData.partCount = group.children.length;
  for (const mesh of group.children) {
    mesh.updateMatrix();
    const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrix);
    if (!batches.has(mesh.material)) batches.set(mesh.material, []);
    batches.get(mesh.material).push(geometry);
  }
  group.clear();
  for (const [material, geometries] of batches) {
    const merged = mergeGeometries(geometries);
    if (!merged) throw new Error('Unable to merge salvage geometry');
    part(group, merged, material);
    for (const geometry of geometries) geometry.dispose();
  }
  return group;
}

// Batch by material once; clones share the finished geometry and materials.
const templates = {
  powerCore: batchParts(powerCore()),
  electronics: batchParts(electronics()),
  scrapFrame: batchParts(scrapFrame()),
};

export function createSalvageModel(variant) {
  if (!templates[variant]) throw new Error(`Unknown salvage variant: ${variant}`);
  const model = templates[variant].clone(true);
  model.userData.variant = variant;
  return model;
}
