import * as THREE from 'three';

const SIZE = 800;
const SEGMENTS = 240;
const STEP = SIZE / SEGMENTS;
const HALF = SIZE / 2;
const CRATERS = [
  [-115, -92, 27], [112, -118, 34], [-155, 92, 23], [156, 103, 29],
  [20, -168, 38], [-18, 168, 31], [205, 8, 36], [-220, -12, 32],
];

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
    const variation = 0.8 + (Math.sin(x * 0.17) * Math.cos(z * 0.19) + 1) * 0.09;
    baseColor.copy(craterColor).lerp(regolithColor, THREE.MathUtils.smoothstep(height, -3.5, -1)).multiplyScalar(variation);
    colors[i * 3] = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
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

  return { mesh, heightAt };
}
