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

A small abandoned landing site sits near the Earth-facing edge at (-104, -360). Its 17-unit diameter is roughly twice the scanner drone's full footprint. A dark, terrain-conforming surface and faint rim become visible only within 32 units, fading to full visibility within 18. It adds two draws when nearby, with no beacon, map marker, new lights or mission reward. The named `remote-landing-site` anchor is reserved for a future curious event; this version has no trigger. Its geometry and shaders are warmed behind the loading screen.

Each mission places 5–8 Drop-Bots randomly on safe, separated patrol loops. Their patrol radii are 32–48 world units (previously 8–12), and they move at 3.6 world units/second (four times the previous 0.9) and eject every 10 seconds after staggered initial delays. Each shuffled ten-drop sequence contains exactly seven caltrops and three materials. Sensor eyes flash green for material or red for caltrops for one active second, then return to cyan. E pickup, F repair (+35), caltrops damage (18 with a shared two-second cooldown) and jump avoidance continue to work.

The fleet shares a 64-hazard pool rendered with two instanced draws; hull geometry stays shared while each robot has its own sensor material. Extra materials expire after 60 active seconds (at most 18 across the fleet); hazards expire after 90 seconds, with the oldest recycled if necessary. No new dynamic shadows are generated. Robot timers and scan detection pause with the mission.

A detailed four-rotor scanner drone follows a lawnmower route: 17 parallel lanes spaced 22 units apart, with randomized orientation, offset, direction and initial waypoint each mission. A green cone, actual unshadowed spotlight and terrain-conforming footprint show its 18-unit ground scan radius (1.5 times the previous 12); detection narrows at higher player positions and uses a raycast so the terrain and solid outpost parts block sight. The first unobstructed contact records the position and triggers ALERT immediately in the same update, without a pending stage or delay. The drone hovers, its sensor flashes red, and the HUD/log show the alert. A single `lunar:drone-alert` browser event provides `{ position, time }` for later attack systems; no attacks or drone damage are implemented in this version.

- Click **Küldetés indítása** to lock the mouse. Press **Esc** to pause.
- **W / S**: forward / backward; **A / D**: strafe left / right. Arrow keys work too. Mouse: look; **Space**: jump.
- **E**: collect the nearest supply within range.
- **Q**: use one oxygen pack; **F**: use one survival kit.
- Once you have eight materials, return to the marked landing pad and orange beacon.

## Base armory

The intact habitat beside the starting pad (28, 18) has an equipment recess in its original rectangular front doorway. Approach its front, then press and release **E** three times: the outer frame turns green, becomes steadily emissive green, then the door slides upward over 1.2 active seconds. The activation and opening stages have no HUD prompt or log messages; only the changing frame and moving door reveal progress. A Hungarian pickup prompt appears once the pistol is exposed. After it opens, another **E** picks up the laser pistol once and records it in the inventory HUD. Holding E does not advance multiple steps. Pausing freezes the opening animation; a new mission resets the door and weapon.

The pistol has a metal receiver, ribbed angled grip, trigger guard, copper cooling fins, cyan power cell strips, sights and a recessed laser emitter. Its geometry is batched into four materials and prepared during mission loading. The recess is accessible from outside the existing solid-habitat collider; the habitat remains sealed. Moving parts and the pistol do not cast stale baked shadows. This version implements acquisition only, with no firing, damage or ammunition mechanics.

Armory regression checks (Node.js 22+; run from this folder):

```sh
npm install --no-save --package-lock=false three@0.161.0
node --test tests/base-armory.test.mjs
```

## Next steps

Touch controls, in-game guidance for nearby supplies, and automated WebGL browser smoke tests remain to be implemented. The terrain and debris layout are deterministic; supplies still spawn randomly on each run.
