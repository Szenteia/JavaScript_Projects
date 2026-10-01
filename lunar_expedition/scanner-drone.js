import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function createScanRoute(random = Math.random) {
  const angle = random() * Math.PI * 2, cx = (random() - 0.5) * 20, cz = (random() - 0.5) * 20;
  const points = [];
  for (let row = 0; row < 17; row += 1) {
    const z = -176 + row * 22;
    for (const x of row % 2 ? [176, -176] : [-176, 176]) {
      points.push(new THREE.Vector3(cx + x * Math.cos(angle) - z * Math.sin(angle), 0,
        cz + x * Math.sin(angle) + z * Math.cos(angle)));
    }
  }
  if (random() < 0.5) points.reverse();
  return points;
}

function createModel() {
  const group = new THREE.Group();
  const alloy = new THREE.MeshStandardMaterial({ color: 0x8b989e, metalness: 0.7, roughness: 0.4 });
  const black = new THREE.MeshStandardMaterial({ color: 0x1b242a, metalness: 0.45, roughness: 0.6 });
  const add = (geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); group.add(mesh); return mesh;
  };
  add(new THREE.BoxGeometry(3, 0.8, 2.3), alloy);
  add(new THREE.BoxGeometry(2.1, 0.3, 1.7), black, 0, 0.55, 0);
  add(new THREE.SphereGeometry(0.7, 16, 8), black, 0, -0.65, -0.4);
  for (const x of [-2.7, 2.7]) for (const z of [-2.7, 2.7]) {
    const arm = add(new THREE.BoxGeometry(3.8, 0.25, 0.35), alloy, x / 2, 0, z / 2);
    arm.rotation.y = -Math.atan2(z, x);
    const ring = add(new THREE.TorusGeometry(1.25, 0.16, 6, 24), black, x, 0.1, z);
    ring.rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 10), alloy, x, 0.1, z);
  }
  for (const x of [-1.2, 1.2]) add(new THREE.BoxGeometry(0.12, 0.8, 2.7), black, x, -0.6, 0);
  group.updateMatrixWorld(true);
  const buckets = new Map();
  group.traverse((mesh) => {
    if (!mesh.isMesh) return;
    if (!buckets.has(mesh.material)) buckets.set(mesh.material, []);
    buckets.get(mesh.material).push(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
  });
  const model = new THREE.Group(); model.name = 'scanner-drone'; model.userData.partCount = group.children.length;
  for (const [material, geometries] of buckets) {
    const geometry = mergeGeometries(geometries);
    if (!geometry) throw new Error('Could not merge scanner drone');
    model.add(new THREE.Mesh(geometry, material)); geometries.forEach((g) => g.dispose());
  }
  group.traverse((mesh) => { if (mesh.isMesh) mesh.geometry.dispose(); });
  const lamp = new THREE.MeshBasicMaterial({ color: 0x46ff77 });
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), lamp);
  lens.position.set(0, -1.15, -0.4); model.add(lens);
  const rotors = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.07, 0.18), black, 4);
  rotors.instanceMatrix.setUsage(THREE.DynamicDrawUsage); model.add(rotors);
  return { model, lamp, rotors };
}

export function createScannerDrone({ heightAt, occluders = [], random = Math.random, onState = () => {}, onAlert = () => {} }) {
  const root = new THREE.Group(); root.name = 'scanner-system';
  const { model, lamp, rotors } = createModel(); root.add(model);
  const radius = 12, altitude = 24;
  const beamMaterial = new THREE.MeshBasicMaterial({ color: 0x39ff70, transparent: true, opacity: 0.055, depthWrite: false, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0, radius, 1, 32, 1, true), beamMaterial); root.add(beam);
  const footprintGeometry = new THREE.CircleGeometry(radius, 48); footprintGeometry.rotateX(-Math.PI / 2);
  const footprint = new THREE.Mesh(footprintGeometry, new THREE.MeshBasicMaterial({ color: 0x46ff77, transparent: true, opacity: 0.18, depthWrite: false }));
  root.add(footprint);
  const light = new THREE.SpotLight(0x39ff70, 35, 45, Math.atan(radius / altitude), 0.35, 1);
  light.castShadow = false; root.add(light); root.add(light.target);
  const point = footprintGeometry.attributes.position;
  const ray = new THREE.Raycaster(), direction = new THREE.Vector3(), dummy = new THREE.Object3D();
  const lastContact = new THREE.Vector3();
  const route = createScanRoute(random);
  let target = Math.floor(random() * route.length), elapsed = 0, pendingUntil = Infinity;
  let state = 'scanning';
  model.position.copy(route[target]);
  target = (target + 1) % route.length;
  function setState(next) { state = next; root.userData.state = next; onState(next); }
  function update(delta, playerPosition) {
    elapsed += delta;
    if (state !== 'alert') {
      let remaining = delta * 20;
      while (remaining > 0) {
        direction.copy(route[target]).sub(model.position); direction.y = 0;
        const distance = direction.length();
        if (distance <= remaining) {
          model.position.x = route[target].x; model.position.z = route[target].z;
          remaining -= distance; target = (target + 1) % route.length;
        } else { direction.multiplyScalar(remaining / distance); model.position.add(direction); remaining = 0; }
      }
      model.rotation.y = Math.atan2(-direction.x, -direction.z);
    }
    const ground = heightAt(model.position.x, model.position.z);
    model.position.y = ground + altitude + Math.sin(elapsed * 1.4) * 0.35;
    let i = 0;
    for (const x of [-2.7, 2.7]) for (const z of [-2.7, 2.7]) {
      dummy.position.set(x, 0.15, z); dummy.rotation.set(0, elapsed * 28 * (i % 2 ? -1 : 1), 0); dummy.updateMatrix();
      rotors.setMatrixAt(i++, dummy.matrix);
    }
    rotors.instanceMatrix.needsUpdate = true;
    beam.position.set(model.position.x, (ground + model.position.y) / 2, model.position.z);
    beam.scale.y = model.position.y - ground;
    footprint.position.set(model.position.x, ground + 0.1, model.position.z);
    for (let v = 0; v < point.count; v += 1) {
      point.setY(v, heightAt(model.position.x + point.getX(v), model.position.z + point.getZ(v)) - ground);
    }
    point.needsUpdate = true; footprintGeometry.computeBoundingSphere();
    light.position.copy(model.position); light.target.position.copy(footprint.position);
    if (state === 'scanning' && playerPosition) {
      const feetAboveGround = playerPosition.y - heightAt(playerPosition.x, playerPosition.z);
      // Cone narrows with height: a jumping player must still be inside the real beam.
      const detectionRadius = radius * Math.max(0, 1 - feetAboveGround / (model.position.y - ground));
      if (feetAboveGround >= 0 && feetAboveGround < altitude && Math.hypot(playerPosition.x - model.position.x, playerPosition.z - model.position.z) < detectionRadius) {
        direction.copy(playerPosition).sub(model.position); const distance = direction.length();
        ray.set(model.position, direction.normalize()); ray.far = Math.max(0, distance - 0.25);
        if (!ray.intersectObjects(occluders, true).length) {
          lastContact.copy(playerPosition); pendingUntil = elapsed + 3; setState('pending');
        }
      }
    }
    if (state === 'pending' && elapsed >= pendingUntil) {
      setState('alert'); lamp.color.set(0xff3434);
      onAlert({ position: lastContact.clone(), time: elapsed });
    }
    beam.visible = footprint.visible = state !== 'alert';
    // Preserve the light count so ALERT does not trigger fresh shader variants.
    light.intensity = state === 'alert' ? 0 : 35;
    if (state === 'alert') lamp.color.setRGB(1, 0.05 + (Math.sin(elapsed * 8) + 1) * 0.08, 0.05);
  }
  root.userData.state = state;
  update(0);
  return { root, update, get state() { return state; } };
}
