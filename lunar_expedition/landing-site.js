import * as THREE from 'three';

export const LANDING_SITE = Object.freeze({ x: -104, z: -360, radius: 8.5, revealDistance: 32 });

export function createRemoteLandingSite(heightAt) {
  const { x, z, radius, revealDistance } = LANDING_SITE;
  const root = new THREE.Group();
  root.name = 'remote-landing-site';
  root.position.set(x, heightAt(x, z), z);
  // A stable anchor for a later event, with no gameplay trigger in this version.
  root.userData.eventAnchor = 'remote-landing-site';
  root.userData.radius = radius;

  function surface(inner, outer, offset) {
    const positions = [], indices = [], segments = 48, rows = 12;
    for (let row = 0; row <= rows; row += 1) {
      const r = THREE.MathUtils.lerp(inner, outer, row / rows);
      for (let i = 0; i <= segments; i += 1) {
        const angle = i / segments * Math.PI * 2;
        const dx = Math.cos(angle) * r, dz = Math.sin(angle) * r;
        positions.push(dx, heightAt(x + dx, z + dz) - root.position.y + offset, dz);
      }
    }
    for (let row = 0; row < rows; row += 1) for (let i = 0; i < segments; i += 1) {
      const a = row * (segments + 1) + i, b = a + segments + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    return geometry;
  }
  const concrete = new THREE.MeshStandardMaterial({ color: 0x45494b, roughness: 1, metalness: 0.08, transparent: true, depthWrite: false });
  const fadedPaint = new THREE.MeshStandardMaterial({ color: 0x777a75, roughness: 1, metalness: 0, transparent: true, depthWrite: false });
  const pad = new THREE.Mesh(surface(0, radius, 0.09), concrete);
  const rim = new THREE.Mesh(surface(radius - 0.25, radius - 0.1, 0.12), fadedPaint);
  pad.receiveShadow = rim.receiveShadow = true;
  root.add(pad, rim);
  root.visible = false;
  function update(playerPosition) {
    const distance = Math.hypot(playerPosition.x - x, playerPosition.z - z);
    root.visible = distance < revealDistance;
    const opacity = 1 - THREE.MathUtils.smoothstep(distance, 18, revealDistance);
    concrete.opacity = fadedPaint.opacity = opacity;
  }
  function setPreloading(visible) {
    root.visible = visible;
    concrete.opacity = fadedPaint.opacity = 1;
  }
  return { root, update, setPreloading };
}
