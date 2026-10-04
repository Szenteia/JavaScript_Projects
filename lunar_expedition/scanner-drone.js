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
  lens.name = 'scanner-sensor';
  lens.position.set(0, -1.15, -0.4); model.add(lens);
  const rotors = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.07, 0.18), black, 4);
  rotors.instanceMatrix.setUsage(THREE.DynamicDrawUsage); model.add(rotors);
  return { model, lamp, rotors };
}

const SCAN_RADIUS = 18;
const ALTITUDE = 24;
const ALERT_SCALE = Math.sqrt(1.5); // Area, rather than radius, grows by 50%.
const DESCENT_TIME = 4;

export function createScannerDrone({ heightAt, occluders = [], random = Math.random, onState = () => {}, onAlert = () => {}, onDamage = () => {} }) {
  const root = new THREE.Group(); root.name = 'scanner-system';
  const template = createModel();
  const route = createScanRoute(random);
  const alertRoute = route.map((point) => point.clone().multiplyScalar(ALERT_SCALE));
  const start = Math.floor(random() * route.length);
  const ray = new THREE.Raycaster(), direction = new THREE.Vector3(), dummy = new THREE.Object3D();
  let elapsed = 0, alertTime = 0, damageCooldown = 0, state = 'scanning';
  let preloading = false;

  const drones = Array.from({ length: 4 }, (_, index) => {
    const group = new THREE.Group(); group.name = `scanner-unit-${index + 1}`; root.add(group);
    const model = index === 0 ? template.model : template.model.clone();
    // Hull geometry/materials are shared; each sensor and rotor matrix is independent.
    const lamp = template.lamp.clone();
    model.getObjectByName('scanner-sensor').material = lamp;
    const rotors = model.children.find((part) => part.isInstancedMesh);
    group.add(model);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0, SCAN_RADIUS, 1, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x39ff70, transparent: true, opacity: 0.055, depthWrite: false, side: THREE.DoubleSide }));
    group.add(beam);
    const geometry = new THREE.CircleGeometry(SCAN_RADIUS, 48); geometry.rotateX(-Math.PI / 2);
    const footprint = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x46ff77, transparent: true, opacity: 0.18, depthWrite: false }));
    group.add(footprint);
    const light = new THREE.SpotLight(0x39ff70, 0, 110, Math.atan(SCAN_RADIUS / ALTITUDE), 0.35, 1);
    light.castShadow = false;
    // Keep all four lights in the scene to prepare the alert shaders at startup.
    root.add(light, light.target);
    const waypoint = (start + index * Math.floor(route.length / 4)) % route.length;
    model.position.copy(route[waypoint]);
    return { group, model, lamp, rotors, beam, footprint, light,
      target: (waypoint + 1) % route.length, basePoints: geometry.attributes.position.array.slice() };
  });

  function beginAlert(position) {
    state = 'alert'; alertTime = elapsed; root.userData.state = state;
    for (const [index, drone] of drones.entries()) {
      if (index > 0) drone.model.position.copy(alertRoute[(drone.target + alertRoute.length - 1) % alertRoute.length]);
      drone.lamp.color.setHex(0xff3434);
      drone.beam.material.color.setHex(0xff3434);
      drone.footprint.material.color.setHex(0xff3434);
      drone.light.color.setHex(0xff3434);
    }
    onState(state);
    onAlert({ position: position.clone(), time: elapsed });
  }

  function updateDrone(drone, index, delta) {
    const active = state === 'alert' || index === 0;
    drone.group.visible = active || preloading;
    drone.light.intensity = active ? 35 : 0;
    if (!active && !preloading) return;
    const path = state === 'alert' ? alertRoute : route;
    let remaining = delta * (state === 'alert' ? 23 : 20);
    while (remaining > 0) {
      direction.copy(path[drone.target]).sub(drone.model.position); direction.y = 0;
      const distance = direction.length();
      if (distance <= remaining) {
        drone.model.position.x = path[drone.target].x; drone.model.position.z = path[drone.target].z;
        remaining -= distance; drone.target = (drone.target + 1) % path.length;
      } else { direction.multiplyScalar(remaining / distance); drone.model.position.add(direction); remaining = 0; }
    }
    if (delta > 0) drone.model.rotation.y = Math.atan2(-direction.x, -direction.z);
    const ground = heightAt(drone.model.position.x, drone.model.position.z);
    const descent = index > 0 && state === 'alert' ? 48 * (1 - Math.min(1, (elapsed - alertTime) / DESCENT_TIME)) : 0;
    drone.model.position.y = ground + ALTITUDE + descent + Math.sin(elapsed * 1.4 + index) * 0.35;
    let rotor = 0;
    for (const x of [-2.7, 2.7]) for (const z of [-2.7, 2.7]) {
      dummy.position.set(x, 0.15, z); dummy.rotation.set(0, elapsed * 28 * (rotor % 2 ? -1 : 1), 0); dummy.updateMatrix();
      drone.rotors.setMatrixAt(rotor++, dummy.matrix);
    }
    drone.rotors.instanceMatrix.needsUpdate = true;
    const scale = state === 'alert' ? ALERT_SCALE : 1;
    const height = drone.model.position.y - ground;
    drone.beam.position.set(drone.model.position.x, (ground + drone.model.position.y) / 2, drone.model.position.z);
    drone.beam.scale.set(scale, height, scale);
    drone.footprint.position.set(drone.model.position.x, ground + 0.1, drone.model.position.z);
    const point = drone.footprint.geometry.attributes.position;
    for (let vertex = 0; vertex < point.count; vertex += 1) {
      const x = drone.basePoints[vertex * 3] * scale, z = drone.basePoints[vertex * 3 + 2] * scale;
      point.setXYZ(vertex, x, heightAt(drone.model.position.x + x, drone.model.position.z + z) - ground, z);
    }
    point.needsUpdate = true; drone.footprint.geometry.computeBoundingSphere();
    drone.light.position.copy(drone.model.position); drone.light.target.position.copy(drone.footprint.position);
    drone.light.angle = Math.atan(SCAN_RADIUS * scale / height);
    if (state === 'alert') drone.lamp.color.setRGB(1, 0.05 + (Math.sin(elapsed * 8) + 1) * 0.08, 0.05);
  }

  function seesPlayer(drone, position) {
    const ground = heightAt(drone.model.position.x, drone.model.position.z);
    const height = drone.model.position.y - ground;
    const playerHeight = position.y - ground;
    const radius = SCAN_RADIUS * (state === 'alert' ? ALERT_SCALE : 1) * Math.max(0, 1 - playerHeight / height);
    if (playerHeight < 0 || playerHeight >= height || Math.hypot(position.x - drone.model.position.x, position.z - drone.model.position.z) >= radius) return false;
    direction.copy(position).sub(drone.model.position);
    const distance = direction.length();
    ray.set(drone.model.position, direction.normalize()); ray.far = Math.max(0, distance - 0.25);
    return ray.intersectObjects(occluders, true).length === 0;
  }

  function update(delta, playerPosition) {
    elapsed += delta;
    damageCooldown = Math.max(0, damageCooldown - delta);
    drones.forEach((drone, index) => updateDrone(drone, index, delta));
    if (state === 'scanning' && playerPosition && seesPlayer(drones[0], playerPosition)) {
      beginAlert(playerPosition);
      drones.forEach((drone, index) => updateDrone(drone, index, 0));
    }
    if (state === 'alert' && playerPosition) {
      const exposed = drones.some((drone) => seesPlayer(drone, playerPosition));
      if (exposed && damageCooldown <= 0) {
        damageCooldown = 1;
        onDamage(10);
      } else if (!exposed) damageCooldown = 0;
    }
  }
  root.userData.state = state;
  update(0);
  return { root, update, get state() { return state; },
    setPreloading(value) {
      preloading = value;
      drones.forEach((drone, index) => updateDrone(drone, index, 0));
    },
  };
}
