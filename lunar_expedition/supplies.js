import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const steel = new THREE.MeshStandardMaterial({ color: 0x9ea9aa, metalness: 0.72, roughness: 0.4 });
const dark = new THREE.MeshStandardMaterial({ color: 0x253039, metalness: 0.4, roughness: 0.65 });
const cyan = new THREE.MeshStandardMaterial({ color: 0x76b9c3, emissive: 0x0a5363, emissiveIntensity: 0.32, metalness: 0.35, roughness: 0.5 });
const shell = new THREE.MeshStandardMaterial({ color: 0x9c8354, metalness: 0.2, roughness: 0.75 });
const marking = new THREE.MeshStandardMaterial({ color: 0xe2ebd9, emissive: 0x385c40, emissiveIntensity: 0.25, roughness: 0.5 });

function add(group, geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}
function box(group, material, size, position) {
  return add(group, new THREE.BoxGeometry(...size), material, ...position);
}

function oxygenBottle() {
  const group = new THREE.Group();
  add(group, new THREE.CylinderGeometry(0.52, 0.52, 1.45, 20), steel);
  for (const y of [-0.72, 0.72]) {
    const cap = add(group, new THREE.SphereGeometry(0.52, 20, 10), steel, 0, y, 0);
    cap.scale.y = 0.45;
    const band = add(group, new THREE.TorusGeometry(0.54, 0.055, 6, 20), dark, 0, y * 0.72, 0);
    band.rotation.x = Math.PI / 2;
  }
  add(group, new THREE.CylinderGeometry(0.56, 0.56, 0.15, 20), dark, 0, -0.93, 0);
  add(group, new THREE.CylinderGeometry(0.16, 0.16, 0.3, 10), steel, 0, 1.04, 0);
  box(group, dark, [0.42, 0.17, 0.22], [0, 1.22, 0]);
  const wheel = add(group, new THREE.TorusGeometry(0.21, 0.05, 6, 12), cyan, -0.27, 1.22, 0);
  wheel.rotation.y = Math.PI / 2;
  const gauge = add(group, new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16), steel, 0.23, 1.1, 0.15);
  gauge.rotation.x = Math.PI / 2;
  add(group, new THREE.CircleGeometry(0.145, 16), dark, 0.23, 1.1, 0.196);
  const needle = box(group, marking, [0.018, 0.17, 0.015], [0.25, 1.13, 0.21]);
  needle.rotation.z = -0.55;
  box(group, cyan, [0.34, 0.75, 0.045], [0, 0.02, 0.52]);
  box(group, marking, [0.2, 0.06, 0.025], [0, 0.08, 0.555]);
  for (const x of [-0.32, 0.32]) box(group, dark, [0.09, 0.5, 0.09], [x, 1.05, -0.14]);
  box(group, dark, [0.73, 0.09, 0.09], [0, 1.32, -0.14]);
  const hose = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.18, 1.22, 0), new THREE.Vector3(0.72, 0.8, 0.1),
    new THREE.Vector3(0.74, -0.35, 0.15), new THREE.Vector3(0.5, -0.65, 0.36),
  ]);
  add(group, new THREE.TubeGeometry(hose, 18, 0.055, 6, false), dark);
  return group;
}

function survivalCase() {
  const group = new THREE.Group();
  box(group, shell, [1.85, 0.86, 1.2], [0, -0.08, 0]);
  box(group, dark, [1.9, 0.09, 1.24], [0, 0.2, 0]);
  box(group, shell, [1.85, 0.2, 1.2], [0, 0.33, 0]);
  for (const x of [-0.77, 0.77]) {
    for (const z of [-0.47, 0.47]) box(group, dark, [0.22, 0.94, 0.22], [x, -0.03, z]);
  }
  for (const x of [-0.54, 0.54]) {
    box(group, steel, [0.22, 0.32, 0.11], [x, 0.19, 0.66]);
    box(group, dark, [0.13, 0.17, 0.025], [x, 0.2, 0.725]);
    box(group, steel, [0.3, 0.13, 0.12], [x, 0.22, -0.65]);
  }
  for (const x of [-0.33, 0.33]) box(group, dark, [0.1, 0.22, 0.15], [x, 0.52, 0]);
  box(group, dark, [0.76, 0.1, 0.15], [0, 0.66, 0]);
  box(group, dark, [0.7, 0.05, 0.65], [0, 0.445, 0]);
  box(group, marking, [0.15, 0.04, 0.47], [0, 0.48, 0]);
  box(group, marking, [0.47, 0.04, 0.15], [0, 0.481, 0]);
  const rib = new THREE.BoxGeometry(0.06, 0.45, 0.035);
  for (const x of [-0.35, 0, 0.35]) add(group, rib, shell, x, -0.14, 0.618);
  return group;
}

function batch(group) {
  const batches = new Map();
  group.userData.partCount = group.children.length;
  for (const mesh of group.children) {
    mesh.updateMatrix();
    if (!batches.has(mesh.material)) batches.set(mesh.material, []);
    batches.get(mesh.material).push(mesh.geometry.clone().applyMatrix4(mesh.matrix));
  }
  group.clear();
  for (const [material, geometries] of batches) {
    const geometry = mergeGeometries(geometries);
    if (!geometry) throw new Error('Unable to merge supply geometry');
    const mesh = add(group, geometry, material);
    mesh.castShadow = mesh.receiveShadow = true;
    geometries.forEach((part) => part.dispose());
  }
  return group;
}

const templates = { oxygen: batch(oxygenBottle()), survival: batch(survivalCase()) };
export function createSupplyModel(type) {
  if (!templates[type]) throw new Error(`Unknown supply type: ${type}`);
  return templates[type].clone(true);
}
