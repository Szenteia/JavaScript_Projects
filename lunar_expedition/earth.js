import * as THREE from 'three';

// Pinned Three.js example asset: a photographic Earth map with cloud cover.
const EARTH_TEXTURE = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r161/examples/textures/planets/earth_atmos_2048.jpg';

export function createEarthSky() {
  const root = new THREE.Group();
  root.name = 'earth-sky';
  const axis = new THREE.Group();
  axis.rotation.z = THREE.MathUtils.degToRad(23.4);
  root.add(axis);

  // A blue fallback keeps the planet visible if the remote image cannot load.
  const fallback = new THREE.DataTexture(new Uint8Array([28, 74, 133, 255]), 1, 1);
  fallback.colorSpace = THREE.SRGBColorSpace;
  fallback.needsUpdate = true;
  const uniforms = {
    surfaceMap: { value: fallback },
    sunDirection: { value: new THREE.Vector3(-0.6, 0.7, 1).normalize() },
  };
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;
  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(30, 64, 32),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader: `
        uniform sampler2D surfaceMap;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        void main() {
          vec3 color = texture2D(surfaceMap, vUv).rgb;
          float daylight = smoothstep(-0.12, 0.55, dot(normalize(vWorldNormal), sunDirection));
          gl_FragColor = vec4(color * mix(0.035, 1.15, daylight), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      fog: false,
    }),
  );
  surface.name = 'earth-surface';
  axis.add(surface);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(31.1, 64, 32),
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float rim = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 3.0);
          gl_FragColor = vec4(0.16, 0.42, 0.85, rim * 0.65);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    }),
  );
  atmosphere.name = 'earth-atmosphere';
  axis.add(atmosphere);

  const ready = new Promise((resolve) => {
    let settled = false;
    const finish = (status) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(status);
    };
    // A failed or stalled CDN must not leave the loading screen stuck forever.
    const timeout = setTimeout(() => finish('fallback'), 12000);
    new THREE.TextureLoader().load(EARTH_TEXTURE, (texture) => {
      if (settled) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      uniforms.surfaceMap.value = texture;
      fallback.dispose();
      finish('loaded');
    }, undefined, () => finish('fallback'));
  });

  let elapsed = 0;
  function update(delta, cameraPosition) {
    elapsed += delta;
    // Keep it distant as the player walks. The small drift suggests slow sky motion;
    // this is an artistic, accelerated rotation rather than an orbital simulation.
    root.position.set(
      cameraPosition.x - 170 + Math.sin(elapsed / 240) * 8,
      cameraPosition.y + 205 + Math.sin(elapsed / 310) * 3,
      cameraPosition.z - 630,
    );
    surface.rotation.y = 0.7 + elapsed * 0.006;
  }

  return { root, update, ready };
}
