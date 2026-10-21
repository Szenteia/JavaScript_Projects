import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createScannerDrone } from '../scanner-drone.js';

function fixture(options = {}) {
  const hits = [], alerts = [];
  const scanner = createScannerDrone({ heightAt: () => 0, random: () => 0,
    onDamage: (damage) => hits.push(damage), onAlert: (event) => alerts.push(event), ...options });
  const units = scanner.root.children.filter((part) => part.name.startsWith('scanner-unit-'));
  const models = units.map((unit) => unit.getObjectByName('scanner-drone'));
  const player = () => new THREE.Vector3(models[0].position.x, 2.4, models[0].position.z);
  return { scanner, hits, alerts, units, models, player };
}

test('first contact instantly alerts, damages and summons exactly three high reinforcements', () => {
  const f = fixture();
  assert.equal(f.units.filter((unit) => unit.visible).length, 1);
  f.scanner.update(0, f.player());
  assert.equal(f.scanner.state, 'alert');
  assert.equal(f.units.filter((unit) => unit.visible).length, 4);
  assert.deepEqual(f.hits, [10]);
  assert.equal(f.alerts.length, 1);
  assert.ok(f.models.slice(1).every((model) => model.position.y > 71));
  f.scanner.update(4, new THREE.Vector3(390, 2.4, 390));
  assert.ok(f.models.every((model) => model.position.y > 23.5 && model.position.y < 24.5));
  assert.equal(f.alerts.length, 1);
});

test('alert patrol continues at +15% speed with +50% scan area and red beams', () => {
  const f = fixture();
  const before = f.models[0].position.clone();
  f.scanner.update(0.1);
  assert.ok(Math.abs(new THREE.Vector2(f.models[0].position.x - before.x, f.models[0].position.z - before.z).length() - 2) < 1e-6);
  f.scanner.update(0, f.player());
  const alertStart = f.models[0].position.clone();
  f.scanner.update(0.1);
  assert.ok(Math.abs(new THREE.Vector2(f.models[0].position.x - alertStart.x, f.models[0].position.z - alertStart.z).length() - 2.3) < 1e-6);
  for (const unit of f.units) {
    const beam = unit.children.find((part) => part.geometry?.type === 'CylinderGeometry');
    assert.ok(beam.visible);
    assert.equal(beam.material.color.getHex(), 0xff3434);
    assert.ok(Math.abs(beam.scale.x ** 2 - 1.5) < 1e-6);
  }
  for (const model of f.models) {
    const start = model.position.clone();
    f.scanner.update(0.1);
    assert.ok(model.position.distanceTo(start) > 2);
  }
});

test('continuous exposure has a shared damage interval and re-entry hits immediately', () => {
  const f = fixture();
  f.scanner.update(0, f.player());
  f.scanner.update(0, f.player());
  assert.deepEqual(f.hits, [10]);
  for (let i = 0; i < 25; i += 1) f.scanner.update(0.05, f.player());
  assert.deepEqual(f.hits, [10, 10]);
  f.scanner.update(0, new THREE.Vector3(390, 2.4, 390));
  for (const model of f.models.slice(1)) {
    model.position.x = f.models[0].position.x;
    model.position.z = f.models[0].position.z;
  }
  f.scanner.update(0, f.player());
  assert.deepEqual(f.hits, [10, 10, 10]);
});

test('solid cover blocks initial detection and alert damage; beam narrows at height', () => {
  const cover = new THREE.Mesh(new THREE.BoxGeometry(60, 1, 60), new THREE.MeshBasicMaterial());
  const occluders = [cover];
  const f = fixture({ occluders });
  cover.position.copy(f.player()); cover.position.y = 12; cover.updateMatrixWorld(true);
  f.scanner.update(0, f.player());
  assert.equal(f.scanner.state, 'scanning');
  assert.deepEqual(f.hits, []);
  occluders.length = 0;
  f.scanner.update(0, f.player());
  assert.deepEqual(f.hits, [10]);
  occluders.push(cover);
  f.scanner.update(1, f.player());
  assert.deepEqual(f.hits, [10]);
  occluders.length = 0;
  const high = f.player(); high.y = 30;
  f.scanner.update(0, high);
  assert.deepEqual(f.hits, [10]);
});

test('preloading reveals spare geometry without alerting or adding shadow lights', () => {
  const f = fixture();
  f.scanner.setPreloading(true);
  assert.equal(f.units.filter((unit) => unit.visible).length, 4);
  assert.equal(f.scanner.state, 'scanning');
  assert.deepEqual(f.hits, []);
  const lights = f.scanner.root.children.filter((part) => part.isSpotLight);
  assert.equal(lights.length, 4);
  assert.ok(lights.every((light) => !light.castShadow));
  f.scanner.setPreloading(false);
  assert.equal(f.units.filter((unit) => unit.visible).length, 1);
});
