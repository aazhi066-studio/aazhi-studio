# v6 ART DIRECTION: "Shadow Play on Parched Earth" (new to the channel; do not reuse anything in ../autopilot/compositions.md)
Story: 1876-78 famine; relief = work for food; Temple wage 1 lb grain + 1 anna; workers dug the 8 km Adyar-Cooum link in Madras; named after the Governor, Duke of Buckingham; diggers left no names; canal 796 km; choked today.
Look: a backlit SHADOW-PUPPET SCREEN (inspired by Tamil leather shadow puppetry, tholpavakoothu) set on PARCHED, CRACKED EARTH.
 - Palette: deep umber night #1E130C / #3A2418, cracked-earth dust #8E5E3A / #A8744A, lamp-lit screen bone-white #EFE4CC with warm glow #F6D9A0,
   shadow ink #120B07. ONE signal colour: grain gold #E9B949 (grain, the one-anna coin, the "price" of things). Water appears ONLY in worker C's last shots, muddy grey-green #6F7F62, never bright.
 - Figures: flat black silhouettes cut like leather puppets: jointed limbs, small perforated dot patterns punched in the body, thin puppet STICKS running down out of frame,
   slight swing on the joints. Always faceless, no portraits, no real person's likeness. The Governor is ONLY a tall plumed-hat silhouette + a name plate "THE GOVERNOR".
 - Light: one oil-lamp flame behind the screen; it flickers, so the shadows breathe (scale +-1.5%, slight blur); warm radial falloff, dark vignette.
 - Devices new to the channel: (1) CRACK-SPREAD transitions: dry-earth cracks race across the frame, then the shards fall away into the next shot; (2) GRAIN PARTICLES: individual gold grains pouring, counted, heaped (heaps = numbers);
   (3) puppet sticks and the screen frame visible (cloth edge, wooden frame); (4) dust devils / drifting dust motes in the lamp beam; (5) a hand-pressed WOODBLOCK label style (rough ink edges, letters slightly uneven) for big words, Caladea for small notes;
   (6) plan-view trench: a city plan seen from above in sepia ink where a trench line is dug segment by segment by tiny silhouette diggers.
 - Never: blueprint/cyanotype, rubber stamps, balance scales, palm-leaf bundles, compass roses, measuring tapes (all used in v5).
 - Captions are drawn by the engine around y 1300-1500 (CAP.y 1400). Keep that band calm (no big text there); main action in y 200-1250 and 1550-1850.
 - Every shot: camera always moving (sh.zoom, sh.cam), something animates the whole time, no static frames. Shots 1.5-4 s each.
Engine: see src/main.js (shot = {id, at, draw(lt, d, t), cam:[x,y], zoom, note}), src/core/lib.js (ctx, W=1080, H=1920, clamp, lerp, seg, eo, eio, eob, rnd, TAU, circle, ell, rr),
 src/core/timing.js (L(i) line start, Le(i) line end, Wd(word, line) word start), src/art.js (lg, poly, fillP, rgba, mixc, cached, blit).
 Sound cues: cue(t, type, {gain, dur, pan}); types: whoosh slide pop plop gulp boing bubbles sizzle sparkle thud slam tock zip alarm inhale heartbeat drum rumble chisel bell swell.
 Reference code style: ../v5-final/src/shots_a.js (a different film; do NOT copy its look).
