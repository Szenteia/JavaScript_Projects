import * as THREE from 'three';

// Fixed world-space visitors: terrain depth, rather than a screen overlay, hides the descent.
export const SKY_EVENTS = Object.freeze([
  { kind: 'lander', delay: 8, duration: 44, period: 165 },
  { kind: 'scout', delay: 72, duration: 24, period: 135 },
]);

function createVisitor(kind) {
  const group = new THREE.Group();
  group.name = `alien-${kind}`;
  const hull = new THREE.MeshBasicMaterial({ color: 0x313b46, fog: false, transparent: true });
  const armor = new THREE.MeshBasicMaterial({ color: 0x10171f, fog: false, transparent: true });
  const glow = new THREE.MeshBasicMaterial({ color: 0x79e5f2, fog: false, transparent: true });
  const add = (geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z); group.add(mesh); return mesh;
  };
  if (kind === 'lander') {
    const body = add(new THREE.SphereGeometry(14, 32, 12), hull);
    body.scale.set(1.3, 0.22, 1);
    const dome = add(new THREE.SphereGeometry(6.4, 24, 12), armor, 0, 2, 0);
    dome.scale.y = 0.65;
    const rim = add(new THREE.TorusGeometry(13.7, 0.18, 6, 48), glow);
    rim.rotation.x = Math.PI / 2; rim.scale.x = 1.3;
    const panelGeometry = new THREE.BoxGeometry(0.8, 0.35, 4.5);
    for (let i = 0; i < 8; i += 1) {
      const angle = i * Math.PI / 4;
      const panel = add(panelGeometry, armor, Math.sin(angle) * 11, 2.1, Math.cos(angle) * 8.5);
      panel.rotation.y = angle;
    }
    const engineGeometry = new THREE.CylinderGeometry(0.85, 0.65, 0.8, 12);
    for (const x of [-7, 7]) add(engineGeometry, glow, x, -2.7, 0);
  } else {
    const body = add(new THREE.OctahedronGeometry(4.8), hull);
    body.scale.set(2.5, 0.35, 0.85);
    for (const z of [-2.8, 2.8]) {
      const wing = add(new THREE.BoxGeometry(9, 0.3, 1.8), armor, -1, 0, z);
      wing.rotation.y = z > 0 ? -0.3 : 0.3;
      add(new THREE.SphereGeometry(0.7, 8, 6), glow, -5, 0, z);
    }
  }
  return { group, glow, materials: [hull, armor, glow] };
}

export function createSkyEvents() {
  const root = new THREE.Group();
  root.name = 'sky-visitors';
  const visitors = SKY_EVENTS.map((event) => {
    const visitor = createVisitor(event.kind);
    visitor.group.visible = false;
    root.add(visitor.group);
    return { ...visitor, event };
  });
  let elapsed = 0;
  function update(delta, active = true) {
    if (active) elapsed += delta;
    for (const visitor of visitors) {
      const { event, group, glow, materials } = visitor;
      const time = elapsed - event.delay;
      const phase = time < 0 ? -1 : time % event.period;
      group.visible = phase >= 0 && phase < event.duration;
      if (!group.visible) continue;
      const t = phase / event.duration;
      const ease = t * t * (3 - 2 * t);
      if (event.kind === 'lander') {
        group.position.set(-240 + ease * 350, 125 - ease * 190, -700 + ease * 60);
        group.rotation.set(0.06, t * 0.6, Math.sin(t * Math.PI) * 0.08);
      } else {
        group.position.set(340 - t * 680, 140 + Math.sin(t * Math.PI) * 45, -790);
        group.rotation.set(0, 0.1, -0.12);
      }
      // Fade at the interval boundaries; descent itself is occluded by the ridges.
      const fade = THREE.MathUtils.smoothstep(t, 0, 0.08) * (1 - THREE.MathUtils.smoothstep(t, 0.94, 1));
      for (const material of materials) material.opacity = fade;
      glow.opacity = fade * (0.8 + Math.sin(phase * 1.4) * 0.12);
    }
  }
  return { root, update };
}
