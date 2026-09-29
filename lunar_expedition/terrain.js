import * as THREE from 'three';

const SIZE = 800;
const SEGMENTS = 240;
const STEP = SIZE / SEGMENTS;
const HALF = SIZE / 2;

export function createMoonSurface(gradientMap) {
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
  const position = geometry.attributes.position;
  const heights = new Float32Array(position.count);

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const ridge = Math.sin(x * 0.045) + Math.cos(y * 0.055);
    const crater = Math.sin((x * y) * 0.0002) * 5;
    const noise = (Math.random() - 0.5) * 1.4;
    const height = ridge + crater + noise;
    position.setZ(i, height);
    heights[i] = height;
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshToonMaterial({
    color: 0x302357,
    gradientMap,
    emissive: new THREE.Color(0x12071f),
    emissiveIntensity: 0.25,
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
