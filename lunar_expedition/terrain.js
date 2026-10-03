import * as THREE from 'three';

const SIZE = 800;
const SEGMENTS = 240;
const STEP = SIZE / SEGMENTS;
const HALF = SIZE / 2;
const CRATERS = [
  [-115, -92, 27], [112, -118, 34], [-155, 92, 23], [156, 103, 29],
  [20, -168, 38], [-18, 168, 31], [205, 8, 36], [-220, -12, 32],
];

function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const hash = (a, b) => {
    const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(hash(ix, iy), hash(ix + 1, iy), u),
    THREE.MathUtils.lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), u), v,
  );
}

// Seamless, deterministic regolith relief; mipmaps soften distant grains.
function createRegolithTexture() {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  const hash = (x, y) => {
    x = (x + size) % size; y = (y + size) % size;
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const grain = hash(x, y);
      const clump = (hash(x - 1, y) + hash(x + 1, y) + hash(x, y - 1) + hash(x, y + 1)) / 4;
      const value = Math.round(150 + grain * 65 + clump * 30);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = value; data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(80, 80);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function createHorizon(material) {
  // Square rings share every edge vertex with the playable grid: no seam or overlap.
  const radii = [HALF, 440, 520, 650, 850, 1200];
  const ringSize = SEGMENTS * 4;
  const positions = [], colors = [], indices = [];
  for (const edge of radii) {
    for (let i = 0; i < ringSize; i += 1) {
      const side = Math.floor(i / SEGMENTS), t = (i % SEGMENTS) / SEGMENTS;
      const along = -edge + 2 * edge * t;
      const x = side === 0 ? along : side === 1 ? edge : side === 2 ? -along : -edge;
      const z = side === 0 ? -edge : side === 1 ? along : side === 2 ? edge : -along;
      const blend = THREE.MathUtils.smoothstep(edge, 400, 650);
      const ridge = 14 + noise(x * 0.006, z * 0.006) * 32 + noise(x * 0.018, z * 0.018) * 8;
      positions.push(x, THREE.MathUtils.lerp(heightAtPoint(x, z), ridge, blend), z);
      // Fade from the map edge into almost-black, cold distant silhouettes.
      const variation = noise(x * 0.015, z * 0.015);
      const shade = THREE.MathUtils.lerp(0.10 + variation * 0.025, 0.018 + variation * 0.008, blend);
      colors.push(shade * 0.85, shade * 0.92, shade);
    }
  }
  for (let ring = 0; ring < radii.length - 1; ring += 1) {
    for (let i = 0; i < ringSize; i += 1) {
      const next = (i + 1) % ringSize;
      const a = ring * ringSize + i, b = ring * ringSize + next;
      const c = (ring + 1) * ringSize + i, d = (ring + 1) * ringSize + next;
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const horizon = new THREE.Mesh(geometry, material.clone());
  // The lunar horizon must remain a silhouette against the sky without atmospheric fog.
  horizon.material.fog = false;
  horizon.material.map = horizon.material.bumpMap = null;
  horizon.name = 'distant-lunar-ridges';
  return horizon;
}

function heightAtPoint(x, z) {
  let height = Math.sin(x * 0.037) * 2.3 + Math.cos(z * 0.041) * 1.8;
  height += Math.sin(x * 0.115 + z * 0.075) * 0.55;
  height += Math.sin(x * 0.73 + z * 0.91) * 0.18;
  for (const [cx, cz, radius] of CRATERS) {
    const d = Math.hypot(x - cx, z - cz) / radius;
    height -= 4.5 * Math.exp(-d * d * 4.5);
    height += 1.45 * Math.exp(-((d - 0.88) ** 2) * 35);
  }
  // Keep the mission's landing pad level without flattening the wider landscape.
  const padDistance = Math.hypot(x, z - 25);
  const blend = THREE.MathUtils.smoothstep(padDistance, 10, 20);
  return height * blend;
}

export function createMoonSurface() {
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
  const position = geometry.attributes.position;
  const heights = new Float32Array(position.count);
  const colors = new Float32Array(position.count * 3);
  const baseColor = new THREE.Color();
  const craterColor = new THREE.Color(0x393b3e);
  const regolithColor = new THREE.Color(0x777775);

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = -position.getY(i);
    const height = heightAtPoint(x, z);
    position.setZ(i, height);
    heights[i] = height;
    const variation = 0.82 + noise(x * 0.025, z * 0.025) * 0.16 + noise(x * 0.14, z * 0.14) * 0.05;
    baseColor.copy(craterColor).lerp(regolithColor, THREE.MathUtils.smoothstep(height, -3.5, -1)).multiplyScalar(variation);
    colors[i * 3] = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const regolith = createRegolithTexture();
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    map: regolith,
    bumpMap: regolith,
    bumpScale: 0.075,
    roughness: 1,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;

  // Match PlaneGeometry's two triangles per grid cell (a,b,d and b,c,d).
  // Its local +Y becomes world -Z after the rotation above.
  function heightAt(x, z) {
    const column = Math.max(0, Math.min(SEGMENTS - 1, Math.floor((x + HALF) / STEP)));
    const row = Math.max(0, Math.min(SEGMENTS - 1, Math.floor((z + HALF) / STEP)));
    const u = Math.max(0, Math.min(1, (x + HALF) / STEP - column));
    const v = Math.max(0, Math.min(1, (z + HALF) / STEP - row));
    const a = heights[row * (SEGMENTS + 1) + column];
    const b = heights[(row + 1) * (SEGMENTS + 1) + column];
    const c = heights[(row + 1) * (SEGMENTS + 1) + column + 1];
    const d = heights[row * (SEGMENTS + 1) + column + 1];
    return u + v <= 1
      ? a * (1 - u - v) + b * v + d * u
      : b * (1 - u) + c * (u + v - 1) + d * (1 - v);
  }

  return { mesh, horizon: createHorizon(material), heightAt };
}
