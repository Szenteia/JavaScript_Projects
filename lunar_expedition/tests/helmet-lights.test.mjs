import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createHelmetLights } from '../helmet-lights.js';

test('visor light fittings are thin strips rather than projecting barrels', () => {
  const camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 1200);
  const helmet = createHelmetLights(camera);
  camera.updateMatrixWorld(true);
  for (const housing of helmet.root.children.filter((part) => part.isGroup)) {
    const size = new THREE.Box3().setFromObject(housing).getSize(new THREE.Vector3());
    assert.ok(size.z < 0.006);
    assert.ok(size.x > size.y * 2.5);
  }
});

test('both short-range beams follow camera translation and rotation', () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 1200);
  scene.add(camera);
  const helmet = createHelmetLights(camera);
  const beams = helmet.root.children.filter((part) => part.isSpotLight);
  assert.equal(beams.length, 2);
  const localDirections = beams.map((beam) => beam.target.position.clone().sub(beam.position).normalize());
  camera.position.set(44, 5, -70);
  camera.rotation.set(-0.2, 1.1, 0);
  scene.updateMatrixWorld(true);
  beams.forEach((beam, index) => {
    const start = beam.getWorldPosition(new THREE.Vector3());
    const target = beam.target.getWorldPosition(new THREE.Vector3());
    const actual = target.sub(start).normalize();
    const expected = localDirections[index].clone().applyQuaternion(camera.quaternion);
    assert.ok(actual.distanceTo(expected) < 1e-8);
    assert.ok(start.distanceTo(camera.position) < 1);
    assert.ok(beam.distance > 0 && beam.distance <= 20);
    assert.equal(beam.castShadow, false);
  });
});

test('lamp tips stay at the outer lower view edges across aspect ratios', () => {
  const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 1200);
  const helmet = createHelmetLights(camera);
  const housings = helmet.root.children.filter((part) => part.isGroup);
  for (const aspect of [0.55, 1, 16 / 9, 3.5]) {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    helmet.resize();
    camera.updateMatrixWorld(true);
    for (const housing of housings) {
      const center = housing.getWorldPosition(new THREE.Vector3()).project(camera);
      assert.ok(Math.abs(center.x) > 0.7 && Math.abs(center.x) < 0.9);
      assert.ok(center.y < -0.65 && center.y > -0.85);
      for (const mesh of housing.children) {
        assert.equal(mesh.material.depthWrite, false);
        const vertices = mesh.geometry.attributes.position;
        for (let i = 0; i < vertices.count; i += 1) {
          const point = new THREE.Vector3().fromBufferAttribute(vertices, i).applyMatrix4(mesh.matrixWorld).project(camera);
          assert.ok(Math.abs(point.x) < 1.05 && Math.abs(point.y) < 1.05);
          assert.ok(Math.abs(point.x) > 0.6, 'center of the view must remain clear');
          assert.ok(point.z > -1 && point.z < 1, 'lamp tip must clear the near clipping plane');
        }
      }
    }
  }
});
