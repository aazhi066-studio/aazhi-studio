# v17 Who erased 300 years of Tamil history? (the Kalabhras, c. 3rd-6th c. CE) - ART DIRECTION "Hammered Copper & Ink Erasure" (new to the channel)
Story (hedged, matches desc.txt): After about the 200s CE, records of the Cheras, Cholas and Pandyas grow thin. In their place: rulers called the Kalabhras; their origin is unknown. Most of what we know was written by their enemies: about two centuries after them, a Pandya copper-plate grant (Velvikudi, c. 770 CE) calls the Kalabhra a "Kali king" (king of the evil age) who drove out countless great kings; then, it says, the Pandya Kadungon took the land back, late in the 500s CE. So historians long called it a "dark age". THE DOUBT: some scholars think the Kalabhras may have backed Jain and Buddhist monks, and that Tamil writing may have kept growing then. End: "Wreckers of Tamil country, or kings written out by the winners? Tell me below. Then watch the start again, and ask who was holding the pen."
Script: script.json; line times data/lines.json; word times data/words.json (L(i), Le(i), Wd(word, line) from src/core/timing.js; ALWAYS use these, never hard-coded seconds).
Line starts (s): 0:0.15 1:3.179 2:8.936 3:15.113 4:18.353 5:28.438 6:34.195 7:38.039 8:47.356 end 56.765
Line texts:
 0 "Who erased three hundred years of Tamil history?"
 1 "After about the two hundreds, records of the Cheras, Cholas and Pandyas grow thin."
 2 "In their place stand rulers called the Kalabhras. Where they came from, nobody can say for sure."
 3 "And most of what we know was written by their enemies."
 4 "About two centuries after them, a Pandya copper plate grant, found at Velvikudi, calls the Kalabhra a Kali king, who drove out countless great kings."
 5 "Then, it says, the Pandya Kadungon took the land back, late in the five hundreds."
 6 "So for a long time, historians called it a dark age."
 7 "Now the doubt. Some scholars think the Kalabhras may have backed Jain and Buddhist monks, and that Tamil writing may have kept growing in these years."
 8 "Wreckers of Tamil country, or kings written out by the winners? Tell me below. Then watch the start again, and ask who was holding the pen."

LOOK: the whole film is HAMMERED COPPER PLATES and BLACK INK. A near-black slate ground (#0B0B0D) with faint cold-blue rim light (#4A6A8A).
 Copper plates: thick rectangular sheets with rounded corners (copper gradient #E08A4E -> #B4552A -> #6E2E14, bright specular streak #FFD2A6 sliding across as the camera moves), a ring hole at the left edge; several plates threaded on a heavy bronze RING with a round royal SEAL (blank disc with a simple raised fish relief = Pandya emblem; no letters).
 Verdigris patina (#3FA38A / #2C7A66) creeps over old plates in blotches.
 Inscribed lines on plates are ABSTRACT: rows of small chiselled dashes, dots and hooks, unreadable on purpose. NEVER real Tamil or Grantha script, NEVER invented inscription text.
 Black INK (#050505, glossy edge #2A2A30) is the eraser: it floods, drips and blots over things.
Devices NEW to the channel (use several per shot):
 (1) REPOUSSE PUNCH-REVEAL: an image appears as hammered dots/dents punched in from the back (dots pop in along the outline, each with a tiny highlight + shadow), then the area between gets a raised copper sheen.
 (2) INK ERASURE: black ink pours/floods across a scene from an edge or drips from above and swallows it (animated blob edge using several moving circles / noisy polygon); things "erased" leave only a faint embossed ghost.
 (3) BLANK CENTURIES RULER: a long horizontal copper ruler with century ticks 100s..700s CE; the span ~250-575 gets blotted black ("the dark age"), a red-hot marker slides along it.
 (4) RING OF PLATES: plates swing around the bronze ring like a carousel (rotate around the ring hole), one plate swings to the front to "speak".
 (5) THREE EMBLEMS: Chera bow, Chola tiger, Pandya twin fish as embossed copper medallions on a dark map of the Tamil south (simple coastline shape); they dim, crack and sink under ink.
 (6) SPARK + HAMMER: a small faceless hand-hammer strikes; orange sparks (#FF9A3C, #FFE0A0) on every strike (sync with cue 'chisel' / 'thud').
 (7) THE PEN: a large reed/stylus pen silhouette dripping ink = "the winners write the story"; in C it hovers over the whole tableau at the end.
 (8) HEAT: red-hot glow (#FF4A1A) at edges for violent moments ("drove out countless kings": a line of small crowned faceless silhouettes knocked down like pins; no blood).
LABELS: Caladea 700 caps, cold white #EDEFF2 on a thin black bar or stamped into copper: "WHO ERASED THEM?", "c. 250-550 CE", "CHERA", "CHOLA", "PANDYA", "RECORDS GROW THIN", "THE KALABHRAS", "ORIGIN UNKNOWN", "WRITTEN BY ENEMIES", "VELVIKUDI GRANT", "c. 770 CE", "PANDYA COPPER PLATE", "\"KALI KING\"", "KADUNGON", "LATE 500s CE", "\"DARK AGE\"", "THE DOUBT", "SOME SCHOLARS", "JAIN?", "BUDDHIST?", "TAMIL WRITING?", "WRECKERS?", "OR WRITTEN OUT?", "TELL ME BELOW", "WHO HELD THE PEN?", "ILLUSTRATION". Hedge tags must stay visible when the voice hedges ("IT SAYS", "MAY HAVE", "?").
FIGURES: faceless silhouettes only (blank oval heads, simple crowns). The Kalabhra king = a figure whose outline is half dissolved in ink (we do not know what they looked like). Kadungon = a figure with a spear (javelin) and fish banner, outline only. Monks = robed faceless figures (Jain = bare pale robe with whisk; Buddhist = robe over shoulder + bowl), as tiny embossed figures.
Never (used before): palm leaves/stylus etch/soot rub/leaf flip (v16), bronze cut-outs/red thread/lamp-mask corridor (v15), ganjifa cards (v14), paper theatre (v13), gilt panels (v12), mosaic (v11), stone relief (v10), linocut prints (v9), kalamkari cloth (v8), sand bottle (v7), shadow puppets (v6), blueprint/rubber stamps (v5), lanterns (v4).
RETENTION (hard rules): line 0 at 0.15 s IS the hook ("Who erased three hundred years of Tamil history?"): the very first frame must already move: black ink already pouring over a glowing copper plate + camera push + a red-hot flash at 0.0, sound hit (cue 'slam' or 'thud' at 0.0). Shots 1.0-1.5 s each in the first 8 s (strongest animation of the film); 1.5-3 s later.
Captions are drawn by the engine at y ~1400-1640; keep y 1330-1760 calm (dark ground only). Main action in y 150-1250.
Every shot: camera always moving (sh.zoom, sh.cam), something animates the whole time.
RENDER: draw plates, ring, emblems, figures ONCE to offscreen canvases via cached(); per frame only blit + move/clip + a few sparks/ink blobs. Draw cost < 0.2 s/frame; never shadowBlur in per-frame loops.
Engine: src/main.js (shot = {id, at, draw(lt, d, t), cam:[x,y], zoom, note}; main.js adds a cut punch-in + slow push), src/core/lib.js (ctx, W=1080, H=1920, clamp, lerp, seg, eo, eio, eob, rnd, TAU, circle, ell, rr, line, bigText), src/core/timing.js (L, Le, Wd), src/art.js (lg, poly, fillP, rgba, mixc, cached(key,w,h,q,fn), blit, smoke, stars, dust, fog, veil, haze), src/core/kit.js (glow, vignette, embers, label ...). Read them for exact signatures.
 Sound cues: cue(t, type, {gain, dur, pan}); types: whoosh slide pop plop gulp boing bubbles sizzle sparkle thud slam tock zip alarm inhale heartbeat drum rumble chisel bell swell.
 Reference code style (different look, do NOT copy it): ../v16-final/src/shots_a.js.
Workers: A = lines 0-3 (src/shots_a.js, buildA(add, cue)), 0 -> L(4); B = lines 4-6 (src/shots_b.js, buildB), L(4) -> L(7); C = lines 7-8 (src/shots_c.js, buildC), L(7) -> end. Each worker's first shot starts at L(first line) (A at 0), last shot runs until the next group starts. Prefix shot ids/cached keys with a/b/c. Keep helpers inside your own file (no edits to other files).
Shared copper plate helper (copy exactly so all plates match):
```js
// copper plate centred at (x,y), size w x h, rotation rot; rows = number of abstract inscribed rows; seed varies the marks; patina 0..1
function copperPlate(x, y, w, h, rot = 0, rows = 6, seed = 1, patina = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#E08A4E'); g.addColorStop(0.45, '#B4552A'); g.addColorStop(1, '#6E2E14');
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.08); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,166,0.55)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#0B0B0D'; ctx.beginPath(); ctx.arc(-w / 2 + h * 0.16, 0, h * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(60,20,8,0.75)';
  for (let r = 0; r < rows; r++) { const yy = -h / 2 + h * (r + 1) / (rows + 1); let xx = -w / 2 + h * 0.3;
    for (let k = 0; xx < w / 2 - h * 0.08; k++) { const v = Math.sin((seed * 31 + r * 7 + k) * 12.9898) * 43758.5453, f = v - Math.floor(v), lw = 6 + f * 22;
      ctx.fillRect(xx, yy - 3, lw, 5); if (f > 0.6) ctx.fillRect(xx + lw * 0.5, yy - 10, 4, 7); xx += lw + 7 + f * 6; } }
  if (patina > 0) { ctx.fillStyle = `rgba(63,163,138,${0.55 * patina})`; for (let i = 0; i < 9; i++) { const v = Math.sin((seed + i) * 78.233) * 43758.5453, f = v - Math.floor(v);
    ctx.beginPath(); ctx.arc(-w / 2 + f * w, -h / 2 + ((f * 7) % 1) * h, h * (0.08 + f * 0.12) * patina, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
}
```
