import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { createMoonSurface } from './terrain.js';
import { createWreckedBase } from './environment.js';
import { createSalvageModel, SALVAGE_VARIANTS } from './salvage.js';
import { createEarthSky } from './earth.js';
import { createSupplyModel } from './supplies.js';
import { createSkyEvents } from './sky-events.js';
import { createRenderQuality } from './render-quality.js';
import { createDropBotSystem } from './drop-bot.js';

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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// The outpost and sun are static; animated pickups do not cast baked shadows.
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.setSize(window.innerWidth, window.innerHeight);
const renderQuality = createRenderQuality(renderer.getPixelRatio(), (ratio) => renderer.setPixelRatio(ratio));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070b);
scene.fog = new THREE.FogExp2(0x11151a, 0.0045);


const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1200);
scene.add(camera);

const controls = new PointerLockControls(camera, renderer.domElement);
const EYE_HEIGHT = 2.4;
const JUMP_SPEED = 6;
const MATERIALS_GOAL = 8;
const BASE_RADIUS = 11;
const WORLD_LIMIT = 395;
const basePosition = new THREE.Vector3(0, 0, 25);
let terrainHeightAt;
let missionState = 'loading';
let earthSky;
let skyEvents;
let dropBot;
let starField;

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
    : 'Return to the marked landing pad!';
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
  log('Used a repair kit: restored up to 35% suit integrity!', '#88ffb7');
  updateHud();
}


function createStarField() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1200;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const ix = i * 3;
    const radius = 900 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[ix] = radius * Math.sin(phi) * Math.cos(theta);
    positions[ix + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[ix + 2] = radius * Math.cos(phi);
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0xf2f4f7,
    size: 1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.65,
    fog: false,
    depthWrite: false,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  return stars;
}

const lightGroup = new THREE.Group();

function createLights() {
  const hemi = new THREE.HemisphereLight(0xb4bfca, 0x24252b, 0.8);
  scene.add(hemi);

  const moonGlow = new THREE.DirectionalLight(0xf1f0df, 2.1);
  moonGlow.position.set(110, 185, -95);
  moonGlow.castShadow = true;
  moonGlow.shadow.mapSize.set(1024, 1024);
  moonGlow.shadow.camera.near = 1;
  moonGlow.shadow.camera.far = 400;
  moonGlow.shadow.camera.left = -150;
  moonGlow.shadow.camera.right = 150;
  moonGlow.shadow.camera.top = 150;
  moonGlow.shadow.camera.bottom = -150;
  moonGlow.shadow.bias = -0.0002;
  scene.add(moonGlow);

  const rimLight = new THREE.PointLight(0xff784c, 9, 55, 2);
  rimLight.position.set(-47, 12, -42);
  lightGroup.add(rimLight);

  const coolLight = new THREE.PointLight(0x7da8bd, 6, 45, 2);
  coolLight.position.set(28, 9, 18);
  lightGroup.add(coolLight);

  scene.add(lightGroup);
}

function spawnCollectible(type, position, variant = null) {
  const mesh = type === 'materials'
    ? createSalvageModel(variant)
    : createSupplyModel(type);
  mesh.position.copy(position);
  mesh.position.y = terrainHeightAt(position.x, position.z) + 1.5;
  mesh.traverse((part) => { if (part.isMesh) part.castShadow = false; });
  mesh.receiveShadow = true;
  mesh.userData = {
    ...mesh.userData,
    type,
    baseY: mesh.position.y,
    speed: 0.6 + Math.random() * 0.6,
    collected: false,
  };

  scene.add(mesh);
  collectibles.push(mesh);
  return mesh;
}

function populateCollectibles() {
  const ranges = [
    { type: 'materials', count: 18 },
    { type: 'oxygen', count: 12 },
    { type: 'survival', count: 8 },
  ];

  ranges.forEach(({ type, count }) => {
    for (let i = 0; i < count; i += 1) {
      let pos;
      do {
        pos = new THREE.Vector3((Math.random() - 0.5) * 360, 0, (Math.random() - 0.5) * 360);
      } while (structureColliders.some((site) => Math.hypot(pos.x - site.x, pos.z - site.z) < site.radius + 3));
      // Six copies of each salvage model, with the same material reward.
      spawnCollectible(type, pos, type === 'materials' ? SALVAGE_VARIANTS[i % SALVAGE_VARIANTS.length] : null);
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
      label = mesh.userData.label;
      break;
    case 'oxygen':
      inventory.oxygenPacks += 1;
      label = 'O₂ gas pack';
      break;
    case 'survival':
      inventory.survivalKits += 1;
      label = 'suit repair kit (F)';
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
  collectibles.forEach((item) => {
    if (!item.userData.collected) {
      item.rotation.y += delta * 0.28;
      item.position.y = item.userData.baseY + Math.sin(performance.now() * 0.0018 * item.userData.speed) * 0.14;
    }
  });
}

function updateLights() {
  lightGroup.children.forEach((light, index) => {
    light.intensity = (index === 0 ? 9 : 6) * (0.88 + Math.sin(clock.elapsedTime * (index === 0 ? 4.5 : 0.8)) * 0.12);
  });
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
  controls.moveForward(movementVelocity.z * delta);

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

  const damage = dropBot.contactDamage(position, EYE_HEIGHT);
  if (damage) {
    health = Math.max(0, health - damage);
    log(`Caltrops puncture! −${damage}% suit integrity. Use F to repair.`, '#ff987d');
    updateHud();
    if (health <= 0) finishMission(false);
  }

  if (inventory.materials >= MATERIALS_GOAL &&
      Math.hypot(position.x - basePosition.x, position.z - basePosition.z) < BASE_RADIUS) {
    finishMission(true);
  }
}

function animate() {
  requestAnimationFrame(animate);

  const frameDelta = clock.getDelta();
  if (missionState !== 'running' || !controls.isLocked || document.hidden) return;
  renderQuality.update(frameDelta);
  // Preserve real-time speed below 20 FPS while keeping physics steps stable.
  const delta = Math.min(frameDelta, 0.2);
  dropBot.update(delta);
  const steps = Math.max(1, Math.ceil(delta / 0.025));
  for (let step = 0; step < steps; step += 1) handleMovement(delta / steps);
  earthSky.update(delta, camera.position);
  skyEvents.update(delta, missionState === 'running' && controls.isLocked);
  starField.position.copy(camera.position);
  updateCollectibles(delta);
  updateLights();
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
          movementVelocity.y = JUMP_SPEED;
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
    if (missionState === 'loading') return;
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
    if (missionState !== 'running') renderer.render(scene, camera);
  });
}

export async function prepareMission(report) {
  await report(15, 'Holdfelszín és horizont előkészítése…');
  const terrain = createMoonSurface();
  terrain.mesh.material.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  terrainHeightAt = terrain.heightAt;
  scene.add(terrain.mesh);
  scene.add(terrain.horizon);
  controls.getObject().position.set(basePosition.x, terrainHeightAt(basePosition.x, basePosition.z) + EYE_HEIGHT, basePosition.z);
  await report(35, 'Holdbázis és felszerelések összeállítása…');
  structureColliders.push(...createWreckedBase(scene, terrainHeightAt));
  starField = createStarField();
  earthSky = createEarthSky();
  scene.add(earthSky.root);
  skyEvents = createSkyEvents();
  scene.add(skyEvents.root);
  createLights();
  populateCollectibles();
  dropBot = createDropBotSystem({
    heightAt: terrainHeightAt,
    spawnMaterial: (position, index) => spawnCollectible('materials', position, SALVAGE_VARIANTS[index % SALVAGE_VARIANTS.length]),
    removeMaterial: (mesh) => {
      scene.remove(mesh);
      const index = collectibles.indexOf(mesh);
      if (index !== -1) collectibles.splice(index, 1);
    },
    onDrop: (type) => log(type === 'material'
      ? 'Drop-Bot ejected salvage. Collect it with E.'
      : 'Drop-Bot ejected caltrops! Watch your step.', type === 'material' ? '#88ffb7' : '#ff987d'),
  });
  scene.add(dropBot.root);
  structureColliders.push(dropBot.collider);
  log('Drop-Bot patrols north of the landing pad: salvage or sharp surprises. F repairs your suit.');
  await report(60, 'Földtextúra és felszíni anyagok betöltése…');
  await earthSky.ready;
  earthSky.update(0, camera.position);
  starField.position.copy(camera.position);
  // Upload even offscreen textures before the first active frame.
  const textures = new Set();
  scene.traverse((object) => {
    if (!object.material) return;
    for (const value of Object.values(object.material)) if (value?.isTexture) textures.add(value);
    for (const uniform of Object.values(object.material.uniforms || {})) {
      if (uniform.value?.isTexture) textures.add(uniform.value);
    }
  });
  textures.forEach((texture) => renderer.initTexture(texture));
  await report(80, 'Grafika és árnyékok előkészítése…');
  // Include future visitors so their first appearance does not compile a new shader.
  skyEvents.root.children.forEach((visitor) => { visitor.visible = true; });
  dropBot.setPreloading(true);
  const culling = new Map();
  scene.traverse((object) => {
    if (object.isMesh || object.isPoints) {
      culling.set(object, object.frustumCulled);
      object.frustumCulled = false;
    }
  });
  try {
    await renderer.compileAsync(scene, camera);
    // Warm geometry buffers too, including objects outside the starting view.
    renderer.render(scene, camera);
  } finally {
    culling.forEach((value, object) => { object.frustumCulled = value; });
    skyEvents.root.children.forEach((visitor) => { visitor.visible = false; });
    dropBot.setPreloading(false);
  }
  renderer.render(scene, camera);
  await report(100, 'A misszió készen áll.');
  missionState = 'ready';
  setupEventListeners();
  updateHud();
  clock.start();
  animate();
}
