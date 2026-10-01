# Lunar Expedition

A desktop browser prototype built with Three.js. Explore a wrecked lunar outpost, collect eight salvage materials, and return to the marked landing pad before suit integrity reaches zero. Oxygen packs and survival kits go into your inventory; use them when needed.

Salvage appears as three detailed models: power cores, electronics assemblies, and structural scrap. Each run includes six of each; every pickup adds one material toward the same mission goal. Their meshes share geometry and materials across copies.

Oxygen bottles have rounded pressure vessels, retaining bands, a valve, pressure gauge, protective handle and hose. Survival cases have reinforced corners, hinges, latches, a carry handle and medical markings. They use shared, material-batched geometry and remain upright while gently rotating and hovering.

The distant Earth has a photographic surface, a day/night boundary and a blue atmospheric rim. Its rotation and subtle sky drift are accelerated for atmosphere, not a to-scale orbital simulation. The planet and stars follow camera translation so walking never brings them closer.

Earth imagery: the version-pinned `earth_atmos_2048.jpg` from the [Three.js r161 planet examples](https://github.com/mrdoob/three.js/tree/r161/examples/textures/planets), loaded through jsDelivr. If it cannot load, a blue globe remains visible.

The regolith has deterministic grain shading and subtle bump relief from a small, locally generated, mipmapped texture. Distant ridges extend the view beyond the playable area without changing the terrain collision surface or the level landing pad.

Two ambient alien visitors repeat while the expedition is active: a broad, cyan-rimmed lander first arrives after 8 seconds and descends behind the distant ridges over 44 seconds (165-second cycle); a smaller scout crosses the sky after 72 seconds over 24 seconds (135-second cycle). They occupy fixed world positions beyond the playable area, respect terrain depth and pause their schedule with the game. They are atmosphere only, with no combat or mission effects. Look toward the Earth / northern horizon to spot them.

## Run

The initial “Felkészülés a misszióra” screen remains visible while models, terrain, Earth imagery, GPU textures, shaders and geometry buffers are prepared. Launch stays disabled until preparation finishes. Earth imagery has a 12-second timeout and a blue-globe fallback; failed startup offers a retry. Progress represents preparation stages, not downloaded bytes.

Performance: static outpost geometry is batched per site/material (131 scene meshes become 33, including the two existing debris instances). Sun shadows are rendered once; hovering supplies do not cast stale shadows. The initial pixel ratio is capped at 1.25 instead of 2; on a display with devicePixelRatio 2 this draws about 61% fewer pixels. After warmup, sustained frame rates below 45 progressively reduce the internal resolution to 60% of the initial ratio. Geometry and HUD remain unchanged. Rendering stops while paused, before launch and on hidden tabs.

Movement uses small physics substeps so frame rates below 20 do not automatically slow the simulation. Frame stalls above 200 ms are capped to avoid large collision jumps.

Serve this folder over HTTP (ES modules do not reliably load from `file://`):

```sh
cd lunar_expedition
python3 -m http.server 8000
```

Open `http://localhost:8000`. The browser needs access to jsDelivr for Three.js and must support WebGL and pointer lock.

## Controls

Drop-Bot patrols a small loop north of the landing pad. Its detailed model has an open hopper, disposal chute, four wheels, grippers, sensor eyes and antenna; geometry is batched by material. The first drop is salvage after 6 active seconds, followed by alternating salvage and tetrahedral steel caltrops every 12 seconds. Salvage uses the existing three variants and E pickup, adding one mission material. Caltrops have orange warning collars and inflict 18 suit-integrity damage on contact, with a shared 2-second damage cooldown. Jump above their tips to avoid contact. F uses one repair kit to restore up to 35 integrity, capped at 100; full-integrity use consumes nothing. Q oxygen use is unchanged. Reaching zero integrity ends the expedition even with oxygen remaining.

The bot, drop timers and hazard cooldown freeze with the mission. Extra salvage expires after 75 active seconds (at most 6 tracked pickups); hazards expire after 90 seconds and reuse a 10-item geometry-sharing pool. Caltrops buffers/shaders are warmed behind the loading screen. Robot movement and drops cast no new dynamic shadows.

- Click **Launch Expedition** to lock the mouse. Press **Esc** to pause.
- **W / S**: forward / backward; **A / D**: strafe left / right. Arrow keys work too. Mouse: look; **Space**: jump.
- **E**: collect the nearest supply within range.
- **Q**: use one oxygen pack; **F**: use one survival kit.
- Once you have eight materials, return to the marked landing pad and orange beacon.

## Next steps

Touch controls, in-game guidance for nearby supplies, and automated WebGL browser smoke tests remain to be implemented. The terrain and debris layout are deterministic; supplies still spawn randomly on each run.
