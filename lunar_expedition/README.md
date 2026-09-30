# Lunar Expedition

A desktop browser prototype built with Three.js. Explore a wrecked lunar outpost, collect eight salvage materials, and return to the marked landing pad before suit integrity reaches zero. Oxygen packs and survival kits go into your inventory; use them when needed.

Salvage appears as three detailed models: power cores, electronics assemblies, and structural scrap. Each run includes six of each; every pickup adds one material toward the same mission goal. Their meshes share geometry and materials across copies.

Oxygen bottles have rounded pressure vessels, retaining bands, a valve, pressure gauge, protective handle and hose. Survival cases have reinforced corners, hinges, latches, a carry handle and medical markings. They use shared, material-batched geometry and remain upright while gently rotating and hovering.

The distant Earth has a photographic surface, a day/night boundary and a blue atmospheric rim. Its rotation and subtle sky drift are accelerated for atmosphere, not a to-scale orbital simulation. The planet and stars follow camera translation so walking never brings them closer.

Earth imagery: the version-pinned `earth_atmos_2048.jpg` from the [Three.js r161 planet examples](https://github.com/mrdoob/three.js/tree/r161/examples/textures/planets), loaded through jsDelivr. If it cannot load, a blue globe remains visible.

## Run

Serve this folder over HTTP (ES modules do not reliably load from `file://`):

```sh
cd lunar_expedition
python3 -m http.server 8000
```

Open `http://localhost:8000`. The browser needs access to jsDelivr for Three.js and must support WebGL and pointer lock.

## Controls

- Click **Launch Expedition** to lock the mouse. Press **Esc** to pause.
- **W / S**: forward / backward; **A / D**: strafe left / right. Arrow keys work too. Mouse: look; **Space**: jump.
- **E**: collect the nearest supply within range.
- **Q**: use one oxygen pack; **F**: use one survival kit.
- Once you have eight materials, return to the marked landing pad and orange beacon.

## Next steps

Touch controls, in-game guidance for nearby supplies, and automated WebGL browser smoke tests remain to be implemented. The terrain and debris layout are deterministic; supplies still spawn randomly on each run.
