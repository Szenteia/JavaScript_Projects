import * as THREE from 'three';

// Small visor-mounted lamp tips, with no extra dynamic shadow maps or bloom.
export function createHelmetLights(camera) {
  const root = new THREE.Group();
  root.name = 'helmet-lights';
  camera.add(root);
  const casing = new THREE.MeshBasicMaterial({ color: 0x202831, fog: false, depthTest: false, depthWrite: false });
  const rim = new THREE.MeshBasicMaterial({ color: 0x485762, fog: false, depthTest: false, depthWrite: false });
  const lens = new THREE.MeshBasicMaterial({ color: 0x849b9e, fog: false, depthTest: false, depthWrite: false });
  const barrelGeometry = new THREE.CylinderGeometry(0.026, 0.029, 0.07, 12);
  barrelGeometry.rotateX(Math.PI / 2);
  const rimGeometry = new THREE.TorusGeometry(0.024, 0.004, 6, 16);
  const lensGeometry = new THREE.CircleGeometry(0.019, 16);
  const mountGeometry = new THREE.BoxGeometry(0.045, 0.014, 0.025);
  const lamps = [];
  for (const side of [-1, 1]) {
    const housing = new THREE.Group();
    housing.name = side < 0 ? 'left-mask-lamp' : 'right-mask-lamp';
    root.add(housing);
    for (const [geometry, material, x, y, z] of [
      [barrelGeometry, casing, 0, 0, 0],
      [rimGeometry, rim, 0, 0, 0.038],
      [lensGeometry, lens, 0, 0, 0.039],
      [mountGeometry, casing, side * 0.026, -0.022, 0],
    ]) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.renderOrder = 20;
      mesh.frustumCulled = false;
      housing.add(mesh);
    }
    const light = new THREE.SpotLight(0xc8dbe0, 12, 18, 0.38, 0.75, 2);
    light.name = side < 0 ? 'left-helmet-beam' : 'right-helmet-beam';
    light.castShadow = false;
    // Beam starts at the forward end; its target is also camera-relative.
    root.add(light);
    const target = new THREE.Object3D();
    root.add(target);
    light.target = target;
    lamps.push({ side, housing, light, target });
  }

  function resize() {
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.45;
    const halfWidth = halfHeight * camera.aspect;
    const size = Math.min(1, camera.aspect);
    for (const { side, housing, light, target } of lamps) {
      const x = side * halfWidth * 0.82;
      housing.position.set(x, -halfHeight * 0.76, -0.45);
      housing.scale.setScalar(size);
      light.position.set(x, housing.position.y, -0.5);
      target.position.set(side * 0.22, -1.15, -10);
    }
  }
  resize();
  return { root, resize };
}
