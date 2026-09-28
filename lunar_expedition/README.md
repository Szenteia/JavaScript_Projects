# Lunar Expedition

A desktop browser prototype built with Three.js. Collect eight orange materials and return to the glowing base ring before suit integrity reaches zero. The cyan oxygen packs and purple survival kits go into your inventory; use them when needed.

## Run

Serve this folder over HTTP (ES modules do not reliably load from `file://`):

```sh
cd lunar_expedition
python3 -m http.server 8000
```

Open `http://localhost:8000`. The browser needs access to jsDelivr for Three.js and to threejs.org for the gradient textures.

## Controls

- Click **Launch Expedition** to lock the mouse. Press **Esc** to pause.
- **WASD** or arrow keys: move; mouse: look; **Space**: jump.
- **E**: collect the nearest supply within range.
- **Q**: use one oxygen pack; **F**: use one survival kit.
- Once you have eight materials, return to the yellow ring around the cyan beacon.

## Next steps

Touch controls, in-game guidance for nearby supplies, deterministic terrain generation, and automated browser smoke tests remain to be implemented.
