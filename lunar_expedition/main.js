import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/PointerLockControls.js';

const canvas = document.getElementById('experience');
const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');

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

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1200);
scene.add(camera);

const controls = new PointerLockControls(camera, renderer.domElement);
controls.getObject().position.set(0, 6, 25);

const clock = new THREE.Clock();
const movementVelocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let canJump = true;

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
};

const inventory = {
  materials: 0,
  oxygenPacks: 0,
  survivalKits: 0,
};

let oxygen = 100;
let health = 100;
let timeSinceOxygenUse = 0;

const collectibles = [];
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
  oxygenBar.style.width = `${oxygen.toFixed(0)}%`;
  oxygenLabel.textContent = `${oxygen.toFixed(0)}%`;
  healthBar.style.width = `${health.toFixed(0)}%`;
  healthLabel.textContent = `${health.toFixed(0)}%`;
  materialsCount.textContent = inventory.materials;
  oxygenPacksCount.textContent = inventory.oxygenPacks;
  survivalKitsCount.textContent = inventory.survivalKits;
}

function createMoonSurface() {
  const geometry = new THREE.PlaneGeometry(800, 800, 240, 240);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const ridge = Math.sin(x * 0.045) + Math.cos(y * 0.055);
    const crater = Math.sin((x * y) * 0.0002) * 5;
    const noise = (Math.random() - 0.5) * 1.4;
    position.setZ(i, ridge + crater + noise);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshToonMaterial({
    color: 0x302357,
    gradientMap: gradientThreeTone,
    emissive: new THREE.Color(0x12071f),
    emissiveIntensity: 0.25,
  });

  const surface = new THREE.Mesh(geometry, material);
  surface.rotation.x = -Math.PI / 2;
  surface.receiveShadow = true;
  scene.add(surface);
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
    tower.position.set((Math.random() - 0.5) * 260, height / 2, (Math.random() - 0.5) * 260);
    tower.rotation.y = Math.random() * Math.PI;
    tower.castShadow = true;
    scene.add(tower);

    const haloGeom = new THREE.TorusGeometry(radius * 2.8, 0.28, 16, 60);
    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xffdc5c });
    const halo = new THREE.Mesh(haloGeom, haloMaterial);
    halo.position.set(tower.position.x, height * 0.75, tower.position.z);
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
  const geometry = new THREE.DodecahedronGeometry(1.6, 0);
  let color;
  let emissive;
  switch (type) {
    case 'materials':
      color = 0xff8e6e;
      emissive = 0x973028;
      break;
    case 'oxygen':
      color = 0x72faff;
      emissive = 0x1a7db5;
      break;
    case 'survival':
    default:
      color = 0xb777ff;
      emissive = 0x4b2196;
      break;
  }
  const material = new THREE.MeshToonMaterial({
    color,
    gradientMap: gradientFiveTone,
    emissive,
    emissiveIntensity: 0.55,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.position.y = 3.2 + Math.random() * 1.8;
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
      oxygen = Math.min(100, oxygen + 25);
      label = 'O₂ gas pack';
      break;
    case 'survival':
      inventory.survivalKits += 1;
      health = Math.min(100, health + 18);
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
  collectibles.forEach((item) => {
    if (!item.userData.collected) {
      const distance = tempVector.distanceTo(item.position);
      if (distance < 6) {
        collectItem(item);
      }
    }
  });
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
  if (!controls.isLocked) {
    return;
  }
  oxygen = Math.max(0, oxygen - delta * 1.2);
  timeSinceOxygenUse += delta;

  if (oxygen <= 0) {
    health = Math.max(0, health - delta * 6);
  }

  if (timeSinceOxygenUse > 12 && inventory.oxygenPacks > 0 && oxygen < 45) {
    inventory.oxygenPacks -= 1;
    oxygen = Math.min(100, oxygen + 55);
    timeSinceOxygenUse = 0;
    log('Auto-injected an O₂ pack!', '#7ae3ff');
  }

  updateHud();
}

function handleMovement(delta) {
  if (!controls.isLocked) return;

  movementVelocity.x -= movementVelocity.x * 6.0 * delta;
  movementVelocity.z -= movementVelocity.z * 6.0 * delta;
  movementVelocity.y -= 9.8 * 0.3 * delta;

  direction.z = Number(keys.forward) - Number(keys.backward);
  direction.x = Number(keys.right) - Number(keys.left);
  direction.normalize();

  const baseSpeed = 30;
  movementVelocity.x += direction.x * baseSpeed * delta;
  movementVelocity.z += direction.z * baseSpeed * delta;

  controls.moveRight(movementVelocity.x * delta);
  controls.moveForward(-movementVelocity.z * delta);

  controls.getObject().position.y += movementVelocity.y * delta;

  if (controls.getObject().position.y < 5.5) {
    movementVelocity.y = 0;
    controls.getObject().position.y = 5.5;
    canJump = true;
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  handleMovement(delta);
  updateCollectibles(delta);
  updateLights(delta);
  updateDust(delta);
  degradeVitals(delta);

  renderer.render(scene, camera);
}

function setupEventListeners() {
  document.addEventListener('keydown', (event) => {
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
        if (canJump) {
          movementVelocity.y += 9;
          canJump = false;
        }
        break;
      case 'KeyE':
        attemptInteract();
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
    controls.lock();
  });

  controls.addEventListener('lock', () => {
    overlay.classList.remove('active');
  });

  controls.addEventListener('unlock', () => {
    overlay.classList.add('active');
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function init() {
  createMoonSurface();
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
