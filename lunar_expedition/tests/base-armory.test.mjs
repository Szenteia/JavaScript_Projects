import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createBaseArmory, createLaserPistol } from '../base-armory.js';
import { createWreckedBase } from '../environment.js';

function fixture() {
  const habitat = new THREE.Group();
  habitat.position.set(28, 1.3, 18);
  habitat.rotation.y = 0.35;
  const armory = createBaseArmory(habitat);
  const position = habitat.localToWorld(new THREE.Vector3(0, 2.4, -9.5));
  return { habitat, armory, position };
}

test('three door activations, timed opening, and exactly one weapon pickup', () => {
  const { armory, position } = fixture();
  const frame = armory.root.children.find((part) => part.material?.color.getHex() === 0xb29663);
  assert.match(armory.prompt(position), /1\/3/);
  assert.equal(armory.interact(position), 'activated');
  assert.equal(frame.material.color.getHex(), 0x48ef87);
  assert.equal(frame.material.emissive.getHex(), 0);
  assert.equal(armory.interact(position), 'powered');
  assert.equal(frame.material.emissive.getHex(), 0x48ef87);
  assert.equal(frame.material.emissiveIntensity, 2);
  assert.equal(armory.interact(position), 'opening');
  assert.equal(armory.interact(position), 'busy');
  armory.update(0.6);
  assert.equal(armory.isOpen, false);
  assert.equal(armory.interact(position), 'busy');
  armory.update(0.6);
  assert.equal(armory.isOpen, true);
  assert.match(armory.prompt(position), /Lézerpisztoly/);
  assert.equal(armory.interact(position), 'pistol');
  assert.equal(armory.collected, true);
  assert.equal(armory.root.getObjectByName('laser-pistol').visible, false);
  assert.equal(armory.interact(position), null);
  assert.equal(armory.prompt(position), '');
});

test('front-side proximity respects the rotated habitat and vertical distance', () => {
  const { habitat, armory } = fixture();
  for (const local of [[0, 2.4, 9.5], [5, 2.4, -9.5], [0, 2.4, -20], [0, 12, -9.5]]) {
    const position = habitat.localToWorld(new THREE.Vector3(...local));
    assert.equal(armory.interact(position), null);
    assert.equal(armory.prompt(position), '');
  }
  assert.equal(armory.stage, 0);
});

test('pistol geometry is finite, compact and batched into four materials', () => {
  const pistol = createLaserPistol();
  assert.equal(pistol.children.length, 4);
  for (const part of pistol.children) {
    assert.equal(part.castShadow, false);
    assert.ok([...part.geometry.attributes.position.array].every(Number.isFinite));
  }
  const size = new THREE.Box3().setFromObject(pistol).getSize(new THREE.Vector3());
  assert.ok(size.x > 1.4 && size.x < 2);
  assert.ok(size.y > 1 && size.y < 1.5);
});

test('outpost batching preserves an independent armory and resets each mission', () => {
  const scene = new THREE.Scene();
  const { colliders, armory } = createWreckedBase(scene, () => 0);
  assert.equal(colliders.length, 6);
  assert.ok(scene.getObjectByName('starting-habitat'));
  assert.ok(armory.root.getObjectByName('laser-pistol'));
  assert.equal(armory.stage, 0);
  assert.equal(armory.collected, false);
  const position = armory.root.parent.localToWorld(new THREE.Vector3(0, 2.4, -9.5));
  assert.ok(Math.hypot(position.x - 28, position.z - 18) > colliders[0].radius);
  assert.equal(armory.interact(position), 'activated');
  const next = createWreckedBase(new THREE.Scene(), () => 0).armory;
  assert.equal(next.stage, 0);
  assert.equal(next.collected, false);
});
