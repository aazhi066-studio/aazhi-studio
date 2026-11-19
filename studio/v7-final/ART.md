# v7 ART DIRECTION: "Sand-Bottle Strata" (new to the channel; do not reuse anything in ../autopilot/compositions.md)
Story: Korkai, near Thoothukudi, early Pandya port (tradition: first Pandya capital); Sangam title "Korkai Koman"; pearl divers in the Gulf of Mannar;
Periplus (Greek sailing guide, ~1st c CE) calls it Colchi, where the pearl fisheries were; the Tamirabarani river's silt pushed the land out; ships could not reach;
trade moved downriver to Kayal; today a quiet village ~6 km from the shore; 1876 Robert Caldwell dug burial urns; later digs: pottery with Tamil-Brahmi scratches;
charcoal from one trench dated ~785 BCE (~2800 years ago); one date is not the whole story, new excavations announced; "the sea left, the pearls are gone, the ground remembers".
Look: the whole film lives inside / around a tall GLASS SAND-ART BOTTLE and its sand layers. Coloured sand = time and land. Sand pours, settles, drains, builds coastlines.
 - Palette: deep sea indigo #0B2233 / #12354D (night water), sea teal #1F7A86, sand layers in bands: cream #EADBB8, ochre #D2A45A, rust #A9542E, dark silt #5B4636, river-mud brown #7A5A3C.
   Pearl / nacre: white #F4EFE6 with an iridescent pink #F2C6D2 -> teal #A9E1DC sheen (radial + shifting angle gradient). ONE signal colour: coral red #E5533D (labels, the "785 BCE" marker, key arrows).
 - Figures: simple faceless silhouettes made of SAND (grainy fill: tiny speckle dots over a flat colour), soft edges, can crumble/drift into grains. Never faces, never portraits.
   Robert Caldwell = a faceless hat-and-coat sand silhouette with a spade + name tag "R. CALDWELL, 1876". Pandya king = crown + fish-banner silhouette only.
 - Devices NEW to the channel: (1) SAND-POUR transitions: a stream of grains falls from the top and fills the frame in a coloured layer, the next shot appears as the layer drains through a slit;
   (2) STRATA-DEPTH CLOCK: horizontal sand bands with a coral depth marker sliding down; deeper = older; small tags on layers; (3) IRIDESCENT PEARLS that glint (moving specular highlight);
   (4) BRUSH-REVEAL: a soft archaeologist's brush sweeps grains away to reveal an object (urn, sherd, charcoal); (5) GLASS bottle edge/reflection highlight framing some shots;
   (6) COASTLINE CREEP: top-down map where sand grains build the delta outward, the old shoreline left behind as a dashed coral line; (7) rising bubble columns from divers; floating dust grains in light shafts.
 - Text: big words in Inter 900 (caps, slightly letter-spaced) set in a pale sand colour with a dark shadow; small notes in Caladea 700. Labels "RECORD" / "TRADITION" / "ILLUSTRATION" as small coral pill tags (rounded rect), not stamps.
 - Tamil-Brahmi: NEVER write invented letters. Draw generic scratch strokes and the attested graffiti symbols (fish, bow and arrow, sun) only, with a small tag "marks: illustration".
 - Never: blueprint/cyanotype, rubber stamps, balance scales, palm-leaf bundles, compass roses, measuring tapes, dimension lines (v5); shadow puppets, crack transitions, puppet sticks (v6); lanterns going out (v4).
 - Captions are drawn by the engine at y ~1640 (CAPLOOK.y in kit.js; keep y 1300-1720 calm). Keep that band calm (no big text there); main action in y 200-1250 and 1550-1850.
 - Every shot: camera always moving (sh.zoom, sh.cam), something animates the whole time, no static frames. Shots 1.5-4 s each. Draw cost must stay < ~0.2 s/frame (no per-path shadowBlur/filter; cache static layers with cached()/offscreen canvases; speckle textures generated once).
Engine: see src/main.js (shot = {id, at, draw(lt, d, t), cam:[x,y], zoom, note}), src/core/lib.js (ctx, W=1080, H=1920, clamp, lerp, seg, eo, eio, eob, rnd, TAU, circle, ell, rr),
 src/core/timing.js (L(i) line start, Le(i) line end, Wd(word, line) word start), src/art.js (lg, poly, fillP, rgba, mixc, cached, blit), src/core/kit.js.
 Sound cues: cue(t, type, {gain, dur, pan}); types: whoosh slide pop plop gulp boing bubbles sizzle sparkle thud slam tock zip alarm inhale heartbeat drum rumble chisel bell swell.
 Reference code style: ../v6-final/src/shots_a.js (a different film; do NOT copy its look).
