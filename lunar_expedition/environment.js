import * as THREE from 'three';

const hull = new THREE.MeshStandardMaterial({ color: 0xa7a9a2, metalness: 0.62, roughness: 0.55 });
const scarred = new THREE.MeshStandardMaterial({ color: 0x4b4b48, metalness: 0.48, roughness: 0.85 });
const dark = new THREE.MeshStandardMaterial({ color: 0x20272c, metalness: 0.58, roughness: 0.5 });
const rust = new THREE.MeshStandardMaterial({ color: 0x775a43, metalness: 0.52, roughness: 0.85 });
const glass = new THREE.MeshStandardMaterial({ color: 0x1e343e, metalness: 0.4, roughness: 0.24 });
const solar = new THREE.MeshStandardMaterial({ color: 0x263e4c, metalness: 0.55, roughness: 0.35 });
const warning = new THREE.MeshStandardMaterial({ color: 0xc08748, metalness: 0.35, roughness: 0.7 });
const beaconLight = new THREE.MeshStandardMaterial({ color: 0xf3c177, emissive: 0xe88b42, emissiveIntensity: 1.8 });

function add(parent, geometry, material, x = 0, y = 0, z = 0) {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  part.castShadow = true;
  part.receiveShadow = true;
  parent.add(part);
  return part;
}

function box(parent, material, width, height, depth, x, y, z) {
  return add(parent, new THREE.BoxGeometry(width, height, depth), material, x, y, z);
}

function strut(parent, a, b, radius, material = dark) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const part = add(parent, new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 8), material);
  part.position.copy(start).add(end).multiplyScalar(0.5);
  part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
}

function place(scene, heightAt, x, z) {
  const group = new THREE.Group();
  group.position.set(x, heightAt(x, z), z);
  scene.add(group);
  return group;
}

function landingPad(scene, heightAt) {
  const pad = place(scene, heightAt, 0, 25);
  add(pad, new THREE.CylinderGeometry(11, 11.5, 0.55, 48), scarred, 0, 0.15, 0);
  const ring = add(pad, new THREE.TorusGeometry(10.3, 0.17, 8, 64), warning, 0, 0.48, 0);
  ring.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 12; i += 1) {
    const angle = i * Math.PI / 6;
    const stripe = box(pad, warning, 1.5, 0.05, 0.32, Math.sin(angle) * 9.1, 0.47, Math.cos(angle) * 9.1);
    stripe.rotation.y = angle;
  }
  add(pad, new THREE.CylinderGeometry(0.85, 1.2, 5, 10), hull, 0, 2.8, -8);
  add(pad, new THREE.CylinderGeometry(1.2, 1.2, 0.4, 12), beaconLight, 0, 5.6, -8);
  const light = new THREE.PointLight(0xffaa6b, 12, 30, 2);
  light.position.set(0, 6, -8);
  pad.add(light);
}

function habitat(scene, heightAt, x, z, damaged) {
  const site = place(scene, heightAt, x, z);
  site.rotation.y = damaged ? -0.4 : 0.35;
  if (damaged) site.rotation.z = 0.11;
  const body = add(site, new THREE.CylinderGeometry(4.2, 4.2, 14, 16, 1), damaged ? scarred : hull, 0, 4.7, 0);
  body.rotation.x = Math.PI / 2;
  for (const depth of [-6.4, -3, 0, 3, 6.4]) {
    add(site, new THREE.TorusGeometry(4.27, 0.23, 8, 32), damaged && depth > 3 ? rust : dark, 0, 4.7, depth);
  }
  for (const depth of [-4.5, 0, 4.5]) {
    box(site, glass, 2.2, 1.25, 0.16, 0, 5.6, depth).rotation.y = Math.PI / 2;
    box(site, dark, 2.4, 1.45, 0.18, 3.95, 5.6, depth).rotation.y = Math.PI / 2;
  }
  add(site, new THREE.CylinderGeometry(3.75, 3.75, 0.5, 16), dark, 0, 4.7, -7.2).rotation.x = Math.PI / 2;
  box(site, hull, 3.1, 3.9, 0.45, 0, 3.9, -7.6);
  box(site, dark, 2.2, 3, 0.5, 0, 3.85, -7.9);
  for (const side of [-1, 1]) {
    strut(site, [side * 3.6, 3.7, -5], [side * 5.3, 0.4, -5], 0.18);
    strut(site, [side * 3.6, 3.7, 5], [side * 5.3, 0.4, 5], 0.18);
  }
  if (damaged) {
    const tear = box(site, rust, 4.2, 0.2, 4, 0, 8.5, 3.5);
    tear.rotation.z = 0.35;
    box(site, dark, 3.4, 0.3, 2.5, 0, 8.22, 3.5).rotation.z = -0.22;
    for (let i = 0; i < 3; i += 1) {
      strut(site, [-2.5 + i * 1.9, 7.7, 4], [-3.8 + i * 2.3, 10, 6.5], 0.12, rust);
    }
  } else {
    box(site, warning, 2.5, 0.14, 1.8, 0, 8.95, -3);
    add(site, new THREE.SphereGeometry(0.28, 8, 6), beaconLight, 0, 9.25, -3);
  }
  return { x, z, radius: 8.5 };
}

function lander(scene, heightAt, x, z) {
  const site = place(scene, heightAt, x, z);
  site.rotation.z = 0.15;
  add(site, new THREE.CylinderGeometry(3.1, 4, 6, 12), hull, 0, 5.2, 0);
  add(site, new THREE.ConeGeometry(3.1, 3, 12), scarred, 0, 9.7, 0);
  add(site, new THREE.CylinderGeometry(3.55, 3.55, 0.5, 12), dark, 0, 7.2, 0);
  for (let i = 0; i < 4; i += 1) {
    const angle = i * Math.PI / 2;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    strut(site, [dx * 3, 5.5, dz * 3], [dx * 6.7, 0.65, dz * 6.7], 0.22, hull);
    box(site, scarred, 2, 0.24, 2, dx * 6.7, 0.4, dz * 6.7);
  }
  box(site, glass, 2.3, 1.8, 0.2, 0, 5.8, -3.35);
  box(site, rust, 3, 0.18, 2.6, -2.8, 7.1, 1.4).rotation.z = -0.42;
  return { x, z, radius: 6.5 };
}

function commsTower(scene, heightAt, x, z) {
  const site = place(scene, heightAt, x, z);
  box(site, scarred, 6, 0.7, 6, 0, 0.2, 0);
  const mast = new THREE.Group();
  mast.rotation.z = 0.32;
  site.add(mast);
  for (const side of [-1, 1]) {
    strut(mast, [side * 1.5, 0.5, 0], [side * 0.25, 17, 0], 0.16, hull);
    for (let y = 3; y <= 15; y += 3) strut(mast, [-1.25 + y * 0.06, y, 0], [1.25 - y * 0.06, y, 0], 0.1, dark);
  }
  add(mast, new THREE.SphereGeometry(2.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), scarred, 0, 17, 0).rotation.x = 0.6;
  strut(mast, [0, 16, 0], [0, 20.5, 0], 0.11);
  box(site, rust, 5, 0.16, 1.4, 3, 0.8, 4).rotation.y = 0.4;
  return { x, z, radius: 3.7 };
}

function solarFarm(scene, heightAt, x, z) {
  const site = place(scene, heightAt, x, z);
  for (let i = 0; i < 4; i += 1) {
    const panelX = (i - 1.5) * 6.7;
    strut(site, [panelX, 0.2, -2], [panelX, 3, -2], 0.16, hull);
    const frame = box(site, dark, 5.6, 0.2, 4.3, panelX, 3, -2);
    const face = box(site, solar, 5.25, 0.08, 3.95, panelX, 3.14, -2);
    frame.rotation.x = face.rotation.x = i === 2 ? -0.28 : -0.18;
    if (i === 2) face.rotation.z = -0.21;
    for (let j = -1; j <= 1; j += 1) {
      box(site, hull, 0.06, 0.09, 3.9, panelX + j * 1.7, 3.21, -2).rotation.x = face.rotation.x;
    }
  }
  box(site, scarred, 4, 2, 3, 0, 1, 5);
  return { x, z: z + 5, radius: 3.2 };
}

function supplyOutpost(scene, heightAt, x, z) {
  const site = place(scene, heightAt, x, z);
  for (let i = 0; i < 5; i += 1) {
    const crate = box(site, i % 2 ? scarred : hull, 2.8, 2.3, 2.8, (i % 3) * 3.4 - 3.4, 1.15, Math.floor(i / 3) * 3.5);
    crate.rotation.y = i * 0.21;
    box(site, warning, 2.5, 0.15, 0.12, crate.position.x, 1.7, crate.position.z - 1.43);
  }
  for (const offset of [-2, 2]) {
    add(site, new THREE.CylinderGeometry(0.9, 0.9, 4.5, 12), hull, offset, 2.3, -6);
    add(site, new THREE.TorusGeometry(0.93, 0.12, 8, 16), dark, offset, 3.7, -6).rotation.x = Math.PI / 2;
  }
  return { x, z, radius: 6.5 };
}

function scatterDebris(scene, heightAt, colliders) {
  // Two instanced draws keep the scattered field inexpensive on modest GPUs.
  let seed = 89347;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const dummy = new THREE.Object3D();
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), scarred, 85);
  const fragments = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.16, 2), rust, 55);
  for (const [field, count] of [[rocks, 85], [fragments, 55]]) {
    for (let i = 0; i < count; i += 1) {
      let x;
      let z;
      do {
        x = (random() - 0.5) * 390;
        z = (random() - 0.5) * 390;
      } while (Math.hypot(x, z - 25) < 17 || colliders.some((site) => Math.hypot(x - site.x, z - site.z) < site.radius + 2));
      const scale = field === rocks ? 0.4 + random() * 1.5 : 0.7 + random() * 2;
      dummy.position.set(x, heightAt(x, z) + (field === rocks ? scale * 0.25 : 0.12), z);
      dummy.rotation.set(random() * 0.18, random() * Math.PI * 2, random() * 0.3);
      dummy.scale.set(scale, scale * (field === rocks ? 0.6 : 1), scale);
      dummy.updateMatrix();
      field.setMatrixAt(i, dummy.matrix);
    }
    field.instanceMatrix.needsUpdate = true;
    field.receiveShadow = true;
    scene.add(field);
  }
}

export function createWreckedBase(scene, heightAt) {
  landingPad(scene, heightAt);
  const colliders = [
    habitat(scene, heightAt, 28, 18, false),
    habitat(scene, heightAt, -47, -42, true),
    lander(scene, heightAt, -94, 79),
    commsTower(scene, heightAt, 76, -76),
    solarFarm(scene, heightAt, 98, 61),
    supplyOutpost(scene, heightAt, -25, 116),
  ];
  scatterDebris(scene, heightAt, colliders);
  return colliders;
}
