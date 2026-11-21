# v15 Who murdered the Chola crown prince? (Aditya Karikalan, c. 969 CE) - ART DIRECTION "Lamplit Bronze & Red Thread" (new to the channel)
Story (hedged, matches desc.txt): c. 969 CE Aditya Karikalan (Aditya II), crown prince/heir of the Chola king Sundara Chola (Parantaka II), was killed. Chola records BOAST he had killed the Pandya king Vira Pandya in battle. No record says exactly how he died. For years nobody was punished. Later the crown went to a cousin, Uttama Chola, not to Aditya's younger brother. Only when that brother ruled as Rajaraja I (his 2nd regnal year, c. 986-987) did an inscription at Udaiyarkudi (Anantisvara temple) name the killers - royal officers - and record that their families' lands were taken. WHO SENT THEM = DISPUTED: some historians suspect Uttama Chola; others say there is no proof and point to Pandya revenge. "The stone names the hands; it never names the mind." End: question to viewer + "now watch who wore the crown next" (rewatch: the crown motif is in the first shots).
Script: script.json; line times data/lines.json; word times data/words.json (L(i), Le(i), Wd(word, line) from src/core/timing.js).
Line starts (s): 0:0.15 1:2.737 2:7.945 3:13.322 4:16.705 5:19.283 6:25.062 7:35.58 8:43.327 9:46.853 end 51.025
Line texts:
 0 "Who murdered the crown prince of the Cholas?"
 1 "Around nine sixty nine, Aditya Karikalan, heir to the throne, was killed."
 2 "Chola records boast he had already killed the Pandya king, Vira Pandya, in battle."
 3 "Then he was gone. No record says exactly how."
 4 "And for years, nobody was punished."
 5 "Later, the crown went to a cousin, Uttama Chola, not to Aditya's younger brother."
 6 "Only when that brother ruled as Rajaraja the First did an inscription at Udaiyarkudi name the killers, royal officers, and take their families' lands."
 7 "So who sent them? Some historians suspect Uttama Chola. Others say there is no proof, and point to Pandya revenge."
 8 "The stone names the hands. It never names the mind."
 9 "Who do you think gave the order? Now watch who wore the crown next."

Look: a WHODUNIT in the dark. A black temple-corridor void lit ONLY by one moving oil-lamp flame. Everything is a flat 2.5D cut-out of polished
CHOLA BRONZE (body #8A4B22, mid #B5692F, highlight #F2B66B, deep shadow #2A1206) with a hot rim-light on the side facing the flame and a long
black SHADOW thrown on a dark wall behind (#140A06 wall, #070302 void). Accent = BLOOD RED #B0121B (red thread, flashes, wax seals) and
ash white #E9DFCF for labels. Figures are FACELESS (smooth bronze oval heads, no features), stylised; nothing is a real portrait.
Devices NEW to the channel (use several per shot):
 (1) LAMP SWEEP: an oil-lamp flame (small teardrop, flicker) moves across the frame; objects are only visible inside its warm light radius (draw a
     radial dark mask with a hole at the flame - cache the mask image once per radius and blit it; no per-frame shadowBlur). Rim-light side follows the flame x.
 (2) WALL SHADOWS: each bronze figure throws a long tilted black shadow on the wall that stretches/shrinks with the flame position (skewed copy of the silhouette).
 (3) RED THREAD: blood-red string drawn pin to pin between suspect tokens (a sagging quadratic curve that draws on with progress p), small brass pins.
 (4) MOLTEN POUR TITLES: words/numbers (969, VIRA PANDYA, UDAIYARKUDI) appear as glowing orange molten bronze filling letter shapes from the bottom, then cooling to bronze (colour lerp orange->bronze + a white-hot leading edge). Use clip to a rect that rises.
 (5) BRONZE CRACK: a bronze object/figure gets a jagged crack that races across it and it splits/falls (two halves translate apart) - used for the death; NO blood, NO wounds, NO weapon hitting a body.
 (6) BLOOD-RED FLASH CUT: 2-4 frame full-screen red flash (#B0121B, alpha 0.7 -> 0) on hard cuts in the first 8 s and on "killed"/"murdered".
 (7) ASH FALL: slow drifting pale ash particles + a rising lamp-smoke ribbon (pure functions of t).
 (8) THE CROWN: a bronze Chola crown (tall conical crown with tiers and a finial, simple, stylised) is the recurring object: it is passed, it rolls, it lands on another head. Keep its look identical in all shots (copy the crown() helper below into your file exactly).
 (9) STONE INSCRIPTION SLAB: a dark granite slab with rows of ABSTRACT incised strokes (NOT readable letters, NOT real Tamil text) that glow red when "naming" - illustrative only.
 (10) SUSPECT TOKENS: round bronze medallion tokens with a faceless figure + label (UTTAMA CHOLA, PANDYA REVENGE?) hung on a dark wall, linked by red thread; a question-mark token.
LABELS: ash-white Caladea 700 caps with letterSpacing, on a thin blood-red bar or engraved into bronze: "969 CE", "CROWN PRINCE", "ADITYA KARIKALAN", "ILLUSTRATION", "CHOLA RECORDS CLAIM", "VIRA PANDYA", "NO RECORD SAYS HOW", "UNPUNISHED", "UTTAMA CHOLA", "RAJARAJA I", "UDAIYARKUDI INSCRIPTION", "ROYAL OFFICERS", "LANDS TAKEN", "SOME HISTORIANS SUSPECT", "NO PROOF", "PANDYA REVENGE?", "DISPUTED", "WHO GAVE THE ORDER?".
Figures: Aditya = young prince bronze cut-out, THE crown, sword at hip, slim; Vira Pandya = rival king with a fish banner (Pandya fish emblem); Uttama Chola = older heavier figure, plain cap, later wearing THE crown; younger brother/Rajaraja = figure with a glowing halo-ring later; killers = 3-4 hooded faceless figures ONLY as shadows on the wall (never shown striking).
Never (used before): ganjifa cards/baize (v14), paper theatre/proscenium (v13), gilt panels (v12), mosaic tiles (v11), stone relief chisel-reveal (v10), linocut (v9), kalamkari cloth (v8), sand-bottle (v7), shadow puppets on parched earth (v6), blueprint/rubber stamps (v5), lanterns (v4).
RETENTION (hard rules): line 0 at 0.15 s IS the hook: the very first frame must already move (camera push + flame flicker + red flash at 0.0), no title card or slow fade.
 Shots 1.0-1.5 s each in the first 8 s (strongest animation, high contrast); 1.5-3 s later. Sound cue at 0.0 (slam + heartbeat).
Captions are drawn by the engine at y ~1400-1640; keep y 1330-1760 calm (dark floor/wall only). Main action in y 150-1250.
Every shot: camera always moving (sh.zoom, sh.cam), something animates the whole time.
RENDER: draw bronze figures, crown, slabs, wall texture ONCE to offscreen canvases via cached(); per frame only blit + move a few pieces + the lamp mask. Draw cost < 0.2 s/frame; never shadowBlur in per-frame loops.
Engine: src/main.js (shot = {id, at, draw(lt, d, t), cam:[x,y], zoom, note}; main.js already does a cut punch-in + slow push), src/core/lib.js (ctx, W=1080, H=1920, clamp, lerp, seg, eo, eio, eob, rnd, TAU, circle, ell, rr, line, bigText), src/core/timing.js (L, Le, Wd), src/art.js (lg, poly, fillP, rgba, mixc, cached(key,w,h,q,fn), blit, smoke, stars, dust, fog, veil, haze), src/core/kit.js (glow, vignette, embers, flame, lamp, label ...). Read these files for exact signatures.
 Sound cues: cue(t, type, {gain, dur, pan}); types: whoosh slide pop plop gulp boing bubbles sizzle sparkle thud slam tock zip alarm inhale heartbeat drum rumble chisel bell swell.
 Reference code style (a different film, do NOT copy its look): ../v14-final/src/shots_a.js.
Workers: A = lines 0-3 (src/shots_a.js, export function buildA(add, cue)), 0 -> L(4); B = lines 4-6 (src/shots_b.js, buildB), L(4) -> L(7); C = lines 7-9 (src/shots_c.js, buildC), L(7) -> end. Each worker's first shot starts at L(first line) (A at 0), last shot runs until the next group starts. Prefix shot ids/cached keys with a/b/c. Keep helpers inside your own file (no edits to other files).

Shared crown helper (copy exactly, same look everywhere):
```js
// bronze Chola crown, base centre at (x,y), height ~ 190*s
function crown(x, y, s = 1, rot = 0, glowA = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, '#5A2E12'); g.addColorStop(0.45, '#F2B66B'); g.addColorStop(0.6, '#B5692F'); g.addColorStop(1, '#3A1A08');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, 0); ctx.lineTo(56, -40); ctx.lineTo(44, -95); ctx.lineTo(30, -140); ctx.lineTo(10, -175); ctx.lineTo(0, -195); ctx.lineTo(-10, -175); ctx.lineTo(-30, -140); ctx.lineTo(-44, -95); ctx.lineTo(-56, -40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2A1206'; ctx.lineWidth = 5; for (const yy of [-40, -95, -140]) { ctx.beginPath(); ctx.moveTo(-60 + (-yy) * 0.2, yy); ctx.lineTo(60 - (-yy) * 0.2, yy); ctx.stroke(); }
  ctx.fillStyle = '#B0121B'; ctx.beginPath(); ctx.arc(0, -20, 11, 0, Math.PI * 2); ctx.fill();
  if (glowA > 0) { ctx.globalAlpha = glowA; ctx.fillStyle = '#FFD9A0'; ctx.beginPath(); ctx.arc(0, -195, 14, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.restore();
}
```
