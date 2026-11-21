# v16 The poem that killed a king? (Nandi Kalambakam legend, Pallava Nandivarman III, 9th c.) - ART DIRECTION "Soot-Etched Palm Leaves" (new to the channel)
Story (hedged, matches desc.txt): LEGEND: the Pallava king Nandivarman III (9th century CE) was fought for the throne by his half-brothers, who lost. One of them turned to words: he wrote a poem praising the king, the Nandi Kalambakam, but hid a curse (aram) in its verses. The king loved poetry; he sat to hear it under a row of pavilions; with every verse a pavilion caught fire; he moved to the next; when the last verse ended the king burned with it (STORY). RECORD: the poem is real and praises a real Nandivarman, victor at Tellaru; no inscription tells of a cursed death; scholars doubt a brother wrote it. End: "Murder by poetry, or a story to explain how a king died? Tell me below. Then look again: the poem survived. The king did not."
Script: script.json; line times data/lines.json; word times data/words.json (L(i), Le(i), Wd(word, line) from src/core/timing.js; ALWAYS use these, never hard-coded seconds).
Line starts (s): 0:0.15 1:1.841 2:9.365 3:13.801 4:15.854 5:22.898 6:28.631 7:33.587 8:37.819 9:49.794 end 58.884
Line texts:
 0 "Can a poem kill a king?"
 1 "A Tamil legend says one did. The king was the Pallava ruler Nandivarman the Third, in the eight hundreds."
 2 "His half brothers, the story goes, fought him for the throne, and lost."
 3 "So one of them turned to words."
 4 "He wrote a poem praising the king, the Nandi Kalambakam, but hid a curse inside its verses, called aram."
 5 "The king loved poetry. The legend says he sat to hear it under a row of pavilions."
 6 "With every verse, a pavilion caught fire. He moved to the next, and the next."
 7 "When the last verse ended, the story says, the king burned with it."
 8 "Now the record. The poem is real, and praises a real Nandivarman, victor at Tellaru. But no inscription tells of a cursed death, and scholars doubt a brother wrote it."
 9 "Murder by poetry, or a story to explain how a king died? Tell me below. Then look again: the poem survived. The king did not."

Look: the whole film lives on PALM-LEAF MANUSCRIPT leaves (long thin golden-tan leaves, #D9B36C body, #B88A45 edge, fine darker vein lines, two string holes, a cord through them) lying on a near-black teak desk (#120A05).
Images on the leaves are ETCHED: thin dark scratch lines (#2A1606) appear as if a stylus scratches them, then a SOOT RUB (lamp-black smudge wiped across) fills the scratches and they turn crisp black; colour only as thin washes of turmeric yellow #E0A526, sindoor red #C0331F and indigo #2D3A6B.
Fire accent: real orange/yellow flame shapes (#FF8A1E, #FFD25A, white-hot core) and ember dots; smoke grey.
Devices NEW to the channel (use several per shot):
 (1) STYLUS ETCH + SOOT RUB: a figure/building is revealed as scratch lines drawing on (path progress), then a dark soot band sweeps across and the lines go solid black.
 (2) LEAF FLIP ON THE CORD: leaves stacked on a cord flip like pages (scaleY/rotate around the cord hole), each new leaf = new scene; leaf count/verse number in the corner (small etched numerals: "verse 1", "verse 2" ... as Latin text only).
 (3) LEAF FAN / SPREAD: the bundle fans out into an arc on the desk (bundle of the poem = the Kalambakam).
 (4) CURSE INK: certain etched lines glow sindoor red and pulse like a heartbeat (the hidden curse, "aram"); red lines creep along the leaf like veins.
 (5) PAVILION ROW: a row of simple wooden-pillar pavilions with thatched roofs, etched in perspective on a long leaf; one after another ignites (flame shapes grow from the roof, ember rise), a small faceless king silhouette walks to the next one.
 (6) EDGE BURN: a leaf's edges char (dark brown band growing inward with an orange glowing rim) - used for the "burned" moments; also leaf curl.
 (7) LAMP + SMOKE: a small brass oil lamp at the desk edge lights the leaves; smoke ribbons drift.
 (8) STAMP OF TRUTH: two etched tags LEGEND (sindoor red) and RECORD (indigo) used throughout; final comparison splits the frame: LEGEND leaf burns, RECORD leaf stays.
LABELS: etched Caladea 700 caps on a small leaf tag or a thin dark bar, ash-white #F1E6CC: "LEGEND", "THE STORY GOES", "PALLAVA KING", "NANDIVARMAN III", "ILLUSTRATION", "c. 800s CE", "HALF BROTHERS", "NANDI KALAMBAKAM", "A HIDDEN CURSE?", "ARAM", "VERSE 1..", "THE STORY SAYS", "RECORD", "THE POEM IS REAL", "VICTOR AT TELLARU", "NO INSCRIPTION", "SCHOLARS DOUBT", "MURDER BY POETRY?", "OR A STORY?", "TELL ME BELOW", "THE POEM SURVIVED".
Figures: FACELESS silhouettes/etched outlines only (blank oval heads): the king = tall crown, seated on a low throne, listening; the half-brothers = 4 smaller figures, one with a stylus and leaf; a poet-reader reading aloud = robed figure (faceless). NO real Tamil text: verse lines on leaves are abstract wavy strokes and dots (unreadable on purpose).
Never (used before): bronze cut-outs/red thread/lamp-mask corridor (v15), ganjifa cards (v14), paper theatre (v13), gilt panels (v12), mosaic (v11), stone relief (v10), linocut prints/paper burn holes (v9), kalamkari cloth (v8), sand bottle (v7), shadow puppets (v6), blueprint/rubber stamps (v5), lanterns (v4).
RETENTION (hard rules): line 0 at 0.15 s IS the hook ("Can a poem kill a king?"): the very first frame must already move: a palm leaf already burning at the edge + camera push + a red flash at 0.0, sound hit at 0.0. Shots 1.0-1.5 s in the first 8 s (strongest animation); 1.5-3 s later.
Captions are drawn by the engine at y ~1400-1640; keep y 1330-1760 calm (dark desk only). Main action in y 150-1250.
Every shot: camera always moving (sh.zoom, sh.cam), something animates the whole time.
RENDER: draw leaves, figures, pavilions ONCE to offscreen canvases via cached(); per frame only blit + move/clip + a few flames/particles. Draw cost < 0.2 s/frame; never shadowBlur in per-frame loops.
Engine: src/main.js (shot = {id, at, draw(lt, d, t), cam:[x,y], zoom, note}; main.js adds a cut punch-in + slow push), src/core/lib.js (ctx, W=1080, H=1920, clamp, lerp, seg, eo, eio, eob, rnd, TAU, circle, ell, rr, line, bigText), src/core/timing.js (L, Le, Wd), src/art.js (lg, poly, fillP, rgba, mixc, cached(key,w,h,q,fn), blit, smoke, stars, dust, fog, veil, haze), src/core/kit.js (glow, vignette, embers, flame, lamp, leaf, manuscript, label ...). Read them for exact signatures.
 Sound cues: cue(t, type, {gain, dur, pan}); types: whoosh slide pop plop gulp boing bubbles sizzle sparkle thud slam tock zip alarm inhale heartbeat drum rumble chisel bell swell.
 Reference code style (different look, do NOT copy it): ../v15-final/src/shots_a.js.
Workers: A = lines 0-3 (src/shots_a.js, buildA(add, cue)), 0 -> L(4); B = lines 4-7 (src/shots_b.js, buildB), L(4) -> L(8); C = lines 8-9 (src/shots_c.js, buildC), L(8) -> end. Each worker's first shot starts at L(first line) (A at 0), last shot runs until the next group starts. Prefix shot ids/cached keys with a/b/c. Keep helpers inside your own file (no edits to other files).
Shared leaf helper (copy exactly so all leaves match):
```js
// palm leaf centred at (x,y), length w, height h (~w*0.12), rotation rot; draws body, veins, 2 holes; returns nothing
function palmLeaf(x, y, w, h, rot = 0, tone = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, tone ? '#C89A52' : '#E6C27C'); g.addColorStop(0.5, tone ? '#B88A45' : '#D9B36C'); g.addColorStop(1, '#A8782F');
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w / 2 + h * 0.4, -h / 2, -w / 2 + h, -h / 2); ctx.lineTo(w / 2 - h, -h / 2); ctx.quadraticCurveTo(w / 2 - h * 0.4, -h / 2, w / 2, 0);
  ctx.quadraticCurveTo(w / 2 - h * 0.4, h / 2, w / 2 - h, h / 2); ctx.lineTo(-w / 2 + h, h / 2); ctx.quadraticCurveTo(-w / 2 + h * 0.4, h / 2, -w / 2, 0); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,30,0.35)'; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++) { const yy = -h / 2 + (h * i) / 6; ctx.beginPath(); ctx.moveTo(-w / 2 + h, yy); ctx.lineTo(w / 2 - h, yy); ctx.stroke(); }
  ctx.fillStyle = '#120A05'; for (const hx of [-w * 0.3, w * 0.3]) { ctx.beginPath(); ctx.arc(hx, 0, h * 0.09, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
```
