import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { createMoonSurface } from './terrain.js';

const canvas = document.getElementById('experience');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const controlsHelp = document.getElementById('controlsHelp');
const missionObjective = document.getElementById('missionObjective');

const oxygenBar = document.getElementById('oxygenBar');
const oxygenLabel = document.getElementById('oxygenLabel');
const healthBar = document.getElementById('healthBar');
const healthLabel = document.getElementById('healthLabel');
const materialsCount = document.getElementById('materialsCount');
const oxygenPacksCount = document.getElementById('oxygenPacksCount');
const survivalKitsCount = document.getElementById('survivalKitsCount');
const logEntries = document.getElementById('logEntries');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05030b);
scene.fog = new THREE.FogExp2(0x090415, 0.018);

const textureLoader = new THREE.TextureLoader();
const gradientThreeTone = textureLoader.load('https://threejs.org/examples/textures/gradientMaps/threeTone.jpg');
gradientThreeTone.minFilter = THREE.NearestFilter;
gradientThreeTone.magFilter = THREE.NearestFilter;

const gradientFiveTone = textureLoader.load('https://threejs.org/examples/textures/gradientMaps/fiveTone.jpg');
gradientFiveTone.minFilter = THREE.NearestFilter;
gradientFiveTone.magFilter = THREE.NearestFilter;

const collectibleGeometry = new THREE.DodecahedronGeometry(1.6, 0);
const collectibleMaterials = {
  materials: new THREE.MeshToonMaterial({ color: 0xff8e6e, gradientMap: gradientFiveTone, emissive: 0x973028, emissiveIntensity: 0.55 }),
  oxygen: new THREE.MeshToonMaterial({ color: 0x72faff, gradientMap: gradientFiveTone, emissive: 0x1a7db5, emissiveIntensity: 0.55 }),
  survival: new THREE.MeshToonMaterial({ color: 0xb777ff, gradientMap: gradientFiveTone, emissive: 0x4b2196, emissiveIntensity: 0.55 }),
};

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1200);
scene.add(camera);

const controls = new PointerLockControls(camera, renderer.domElement);
const EYE_HEIGHT = 5.5;
const MATERIALS_GOAL = 8;
const BASE_RADIUS = 11;
const WORLD_LIMIT = 395;
const basePosition = new THREE.Vector3(0, 0, 25);
let terrainHeightAt;
let missionState = 'ready';

const clock = new THREE.Clock();
const movementVelocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let canJump = true;

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

const inventory = {
  materials: 0,
  oxygenPacks: 0,
  survivalKits: 0,
};

let oxygen = 100;
let health = 100;
let lastHudValues = '';

const collectibles = [];
const structureColliders = [];
const tempVector = new THREE.Vector3();

function log(message, color = null) {
  const entry = document.createElement('li');
  entry.textContent = message;
  if (color) entry.style.color = color;
  logEntries.prepend(entry);
  while (logEntries.children.length > 8) {
    logEntries.lastChild.remove();
  }
}

function updateHud() {
  const values = [Math.round(oxygen), Math.round(health), inventory.materials, inventory.oxygenPacks, inventory.survivalKits].join(':');
  if (values === lastHudValues) return;
  lastHudValues = values;
  oxygenBar.style.width = `${oxygen.toFixed(0)}%`;
  oxygenLabel.textContent = `${oxygen.toFixed(0)}%`;
  healthBar.style.width = `${health.toFixed(0)}%`;
  healthLabel.textContent = `${health.toFixed(0)}%`;
  materialsCount.textContent = inventory.materials;
  oxygenPacksCount.textContent = inventory.oxygenPacks;
  survivalKitsCount.textContent = inventory.survivalKits;
  missionObjective.textContent = inventory.materials < MATERIALS_GOAL
    ? `Collect materials: ${inventory.materials} / ${MATERIALS_GOAL}`
    : 'Return to the glowing base!';
}

function finishMission(won) {
  if (missionState !== 'running') return;
  missionState = won ? 'won' : 'lost';
  overlayTitle.textContent = won ? 'Mission accomplished!' : 'Expedition failed';
  overlayMessage.textContent = won
    ? `You brought ${inventory.materials} materials safely back to base.`
    : 'Your suit integrity reached zero. Give the expedition another try.';
  controlsHelp.hidden = true;
  startButton.textContent = 'New expedition';
  overlay.classList.add('active');
  controls.unlock();
}

function useOxygenPack() {
  if (missionState !== 'running' || inventory.oxygenPacks === 0 || oxygen >= 100) return;
  inventory.oxygenPacks -= 1;
  oxygen = Math.min(100, oxygen + 55);
  log('Used an O₂ pack!', '#7ae3ff');
  updateHud();
}

function useSurvivalKit() {
  if (missionState !== 'running' || inventory.survivalKits === 0 || health >= 100) return;
  inventory.survivalKits -= 1;
  health = Math.min(100, health + 35);
  log('Used a survival kit!', '#88ffb7');
  updateHud();
}

function createBase() {
  const base = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(BASE_RADIUS, 0.5, 10, 48),
    new THREE.MeshBasicMaterial({ color: 0xffdc5c }),
  );
  ring.rotation.x = -Math.PI / 2;
  base.add(ring);

  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 1.2, 10, 12),
    new THREE.MeshBasicMaterial({ color: 0x7ae3ff }),
  );
  beacon.position.y = 5;
  base.add(beacon);
  base.position.set(basePosition.x, terrainHeightAt(basePosition.x, basePosition.z) + 0.6, basePosition.z);
  scene.add(base);
}

function createCraters() {
  const craterMaterial = new THREE.MeshToonMaterial({
    color: 0x473681,
    emissive: 0x12071f,
    emissiveIntensity: 0.4,
  });

  for (let i = 0; i < 14; i += 1) {
    const radius = 6 + Math.random() * 10;
    const height = 1 + Math.random() * 1.5;
    const craterGeom = new THREE.CylinderGeometry(radius, radius * 0.7, height, 32, 1, true);
    craterGeom.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(craterGeom, craterMaterial);
    rim.position.set((Math.random() - 0.5) * 400, 0.6, (Math.random() - 0.5) * 400);
    rim.rotation.z = Math.random() * Math.PI;
    rim.castShadow = true;
    scene.add(rim);
  }
}

function createStarField() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1200;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const ix = i * 3;
    const radius = 600 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[ix] = radius * Math.sin(phi) * Math.cos(theta);
    positions[ix + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[ix + 2] = radius * Math.cos(phi);
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0x9be7ff,
    size: 1.3,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

function createDustParticles() {
  const geometry = new THREE.BufferGeometry();
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const color = new THREE.Color();

  for (let i = 0; i < particleCount; i += 1) {
    const ix = i * 3;
    positions[ix] = (Math.random() - 0.5) * 400;
    positions[ix + 1] = Math.random() * 40;
    positions[ix + 2] = (Math.random() - 0.5) * 400;
    color.setHSL(0.62 + Math.random() * 0.02, 0.55, 0.55 + Math.random() * 0.15);
    colors[ix] = color.r;
    colors[ix + 1] = color.g;
    colors[ix + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });

  const dust = new THREE.Points(geometry, material);
  dust.name = 'dust';
  scene.add(dust);
}

function createGlowStructures() {
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0x6d53ff,
    emissive: 0x6d53ff,
    emissiveIntensity: 0.8,
    metalness: 0.1,
    roughness: 0.25,
  });

  for (let i = 0; i < 6; i += 1) {
    const height = 6 + Math.random() * 12;
    const radius = 1.2 + Math.random() * 1.8;
    const geometry = new THREE.CylinderGeometry(radius, radius * 0.75, height, 12, 1, false);
    const tower = new THREE.Mesh(geometry, glowMaterial);
    const x = (Math.random() - 0.5) * 260;
    const z = (Math.random() - 0.5) * 260;
    tower.position.set(x, terrainHeightAt(x, z) + height / 2, z);
    tower.rotation.y = Math.random() * Math.PI;
    tower.castShadow = true;
    scene.add(tower);
    structureColliders.push({ x, z, radius: radius + 1.5 });

    const haloGeom = new THREE.TorusGeometry(radius * 2.8, 0.28, 16, 60);
    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xffdc5c });
    const halo = new THREE.Mesh(haloGeom, haloMaterial);
    halo.position.set(x, tower.position.y + height * 0.25, z);
    halo.rotation.x = Math.PI / 2;
    halo.userData = { baseY: halo.position.y, speed: 0.4 + Math.random() * 0.4 };
    scene.add(halo);
  }
}

const lightGroup = new THREE.Group();

function createLights() {
  const hemi = new THREE.HemisphereLight(0x4932a6, 0x060312, 0.55);
  scene.add(hemi);

  const moonGlow = new THREE.DirectionalLight(0xbdafff, 0.6);
  moonGlow.position.set(120, 220, -160);
  moonGlow.castShadow = true;
  moonGlow.shadow.mapSize.set(2048, 2048);
  moonGlow.shadow.camera.near = 1;
  moonGlow.shadow.camera.far = 400;
  scene.add(moonGlow);

  const rimLight = new THREE.PointLight(0xffa8f9, 2.4, 120, 1.6);
  rimLight.position.set(-45, 12, 35);
  lightGroup.add(rimLight);

  const coolLight = new THREE.PointLight(0x7ae3ff, 1.8, 140, 1.5);
  coolLight.position.set(50, 9, -32);
  lightGroup.add(coolLight);

  scene.add(lightGroup);
}

function spawnCollectible(type, position) {
  const mesh = new THREE.Mesh(collectibleGeometry, collectibleMaterials[type]);
  mesh.position.copy(position);
  mesh.position.y = terrainHeightAt(position.x, position.z) + 3.2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = {
    type,
    baseY: mesh.position.y,
    speed: 0.6 + Math.random() * 0.6,
    collected: false,
  };

  scene.add(mesh);
  collectibles.push(mesh);
}

function populateCollectibles() {
  const ranges = [
    { type: 'materials', count: 18 },
    { type: 'oxygen', count: 12 },
    { type: 'survival', count: 8 },
  ];

  ranges.forEach(({ type, count }) => {
    for (let i = 0; i < count; i += 1) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 360,
        0,
        (Math.random() - 0.5) * 360,
      );
      spawnCollectible(type, pos);
    }
  });
}

function collectItem(mesh) {
  if (mesh.userData.collected) return;
  mesh.userData.collected = true;

  let label;
  switch (mesh.userData.type) {
    case 'materials':
      inventory.materials += 1;
      label = 'materials';
      break;
    case 'oxygen':
      inventory.oxygenPacks += 1;
      label = 'O₂ gas pack';
      break;
    case 'survival':
      inventory.survivalKits += 1;
      label = 'survival kit';
      break;
    default:
      break;
  }

  log(`Collected ${label}!`);
  updateHud();

  scene.remove(mesh);
  collectibles.splice(collectibles.indexOf(mesh), 1);
}

function attemptInteract() {
  tempVector.copy(controls.getObject().position);
  let nearest = null;
  let nearestDistance = 6;
  for (const item of collectibles) {
    const distance = Math.hypot(tempVector.x - item.position.x, tempVector.z - item.position.z);
    if (distance < nearestDistance) {
      nearest = item;
      nearestDistance = distance;
    }
  }
  if (nearest) collectItem(nearest);
}

function updateCollectibles(delta) {
  const pulsate = Math.sin(performance.now() * 0.003) * 0.12;
  collectibles.forEach((item) => {
    if (!item.userData.collected) {
      item.rotation.x += delta * 0.6;
      item.rotation.y += delta * 0.8;
      item.position.y = item.userData.baseY + Math.sin(performance.now() * 0.0018 * item.userData.speed) * 0.6 + pulsate;
    }
  });
}

function updateLights(delta) {
  lightGroup.children.forEach((light, index) => {
    light.position.y = 8 + Math.sin(clock.elapsedTime * (0.6 + index * 0.2)) * 2.5;
    light.position.x += Math.sin(clock.elapsedTime * 0.25 + index) * delta * 2;
    light.position.z += Math.cos(clock.elapsedTime * 0.25 + index) * delta * 2;
  });
}

function updateDust(delta) {
  const dust = scene.getObjectByName('dust');
  if (!dust) return;
  const positions = dust.geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const y = positions.getY(i) + Math.sin(clock.elapsedTime * 0.6 + i) * delta * 0.4;
    positions.setY(i, ((y + 40) % 40));
  }
  positions.needsUpdate = true;
}

function degradeVitals(delta) {
  if (missionState !== 'running' || !controls.isLocked) return;
  oxygen = Math.max(0, oxygen - delta * 1.2);

  if (oxygen <= 0) {
    health = Math.max(0, health - delta * 6);
  }

  updateHud();
  if (health <= 0) finishMission(false);
}

function handleMovement(delta) {
  if (missionState !== 'running' || !controls.isLocked) return;

  movementVelocity.x -= movementVelocity.x * 6.0 * delta;
  movementVelocity.z -= movementVelocity.z * 6.0 * delta;
  movementVelocity.y -= 9.8 * 0.3 * delta;

  direction.z = Number(keys.forward) - Number(keys.backward);
  direction.x = Number(keys.right) - Number(keys.left);
  direction.normalize();

  const baseSpeed = 85;
  movementVelocity.x += direction.x * baseSpeed * delta;
  movementVelocity.z += direction.z * baseSpeed * delta;

  controls.moveRight(movementVelocity.x * delta);
  controls.moveForward(-movementVelocity.z * delta);

  const position = controls.getObject().position;
  position.x = THREE.MathUtils.clamp(position.x, -WORLD_LIMIT, WORLD_LIMIT);
  position.z = THREE.MathUtils.clamp(position.z, -WORLD_LIMIT, WORLD_LIMIT);
  for (const obstacle of structureColliders) {
    const dx = position.x - obstacle.x;
    const dz = position.z - obstacle.z;
    const distance = Math.hypot(dx, dz);
    if (distance < obstacle.radius) {
      const scale = obstacle.radius / (distance || 1);
      position.x = obstacle.x + (distance ? dx : 1) * scale;
      position.z = obstacle.z + dz * scale;
    }
  }
  position.y += movementVelocity.y * delta;

  const ground = terrainHeightAt(position.x, position.z) + EYE_HEIGHT;
  if (position.y <= ground) {
    movementVelocity.y = 0;
    position.y = ground;
    canJump = true;
  }

  if (inventory.materials >= MATERIALS_GOAL &&
      Math.hypot(position.x - basePosition.x, position.z - basePosition.z) < BASE_RADIUS) {
    finishMission(true);
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  handleMovement(delta);
  updateCollectibles(delta);
  updateLights(delta);
  updateDust(delta);
  degradeVitals(delta);

  renderer.render(scene, camera);
}

function setupEventListeners() {
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code.startsWith('Arrow')) event.preventDefault();
    if (missionState !== 'running' || !controls.isLocked) return;
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        keys.forward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        keys.left = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        keys.backward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        keys.right = true;
        break;
      case 'Space':
        if (canJump && !event.repeat) {
          movementVelocity.y += 9;
          canJump = false;
        }
        break;
      case 'KeyE':
        if (!event.repeat) attemptInteract();
        break;
      case 'KeyQ':
        if (!event.repeat) useOxygenPack();
        break;
      case 'KeyF':
        if (!event.repeat) useSurvivalKit();
        break;
      default:
        break;
    }
  });

  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        keys.forward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        keys.left = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        keys.backward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        keys.right = false;
        break;
      default:
        break;
    }
  });

  startButton.addEventListener('click', () => {
    if (missionState === 'won' || missionState === 'lost') {
      window.location.reload();
      return;
    }
    controls.lock();
  });

  controls.addEventListener('lock', () => {
    missionState = 'running';
    overlay.classList.remove('active');
  });

  controls.addEventListener('unlock', () => {
    if (missionState === 'running') {
      missionState = 'paused';
      overlayTitle.textContent = 'Expedition paused';
      overlayMessage.textContent = 'Return to the surface when you are ready.';
      startButton.textContent = 'Resume expedition';
    }
    keys.forward = keys.backward = keys.left = keys.right = false;
    overlay.classList.add('active');
  });

  window.addEventListener('blur', () => {
    keys.forward = keys.backward = keys.left = keys.right = false;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function init() {
  const terrain = createMoonSurface(gradientThreeTone);
  terrainHeightAt = terrain.heightAt;
  scene.add(terrain.mesh);
  controls.getObject().position.set(basePosition.x, terrainHeightAt(basePosition.x, basePosition.z) + EYE_HEIGHT, basePosition.z);
  createBase();
  createCraters();
  createStarField();
  createDustParticles();
  createGlowStructures();
  createLights();
  populateCollectibles();
  setupEventListeners();
  updateHud();
  animate();
}

init();
