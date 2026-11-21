// EPISODE 16 · worker C : "Soot-Etched Palm Leaves", lines 8-9 (the record / the question / end)
//   c1  L8 -> "poem"          smoke clears, a clean unburnt leaf slides in, RECORD indigo tag stamps (bell), cool indigo wash
//   c2  "poem" -> "Nandivarman"  the Nandi Kalambakam bundle drops onto the desk, tied with cord; THE POEM IS REAL
//   c3  "Nandivarman" -> "But"   stylus etches a battle scene across 3 leaves (king + banner, fleeing figures, river); VICTOR AT TELLARU
//   c4  "But" -> "scholars"   granite tablet of unreadable marks; red curse veins try to creep in and fade; NO INSCRIPTION
//   c5  "scholars" -> L9      faceless scholar's lens slides over the brother leaf; a red ? lands on him; SCHOLARS DOUBT
//   c6  L9 -> "or"            split frame: LEGEND leaf burning / RECORD leaf calm; MURDER BY POETRY?
//   c7  "or" -> "Tell"        camera crosses to the calm RECORD leaf; OR A STORY?
//   c8  "Tell" -> "Then"      TELL ME BELOW; a stylus taps a blank leaf, etched arrow points down
//   c9  "Then" -> "The king"  the bundle fans open in lamplight, king leaf beside it; THE POEM SURVIVED
//   c10 "The king" -> end     the king leaf chars and crumbles to ash; AAZHI etched tag + FOLLOW
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit, smoke, dust, rgba } from './art.js';
import * as K from './core/kit.js';

// ───────────── palette ─────────────
const DESK = '#120A05', INK = '#2A1606', SOOT = '#140A03', TUR = '#E0A526', RED = '#C0331F', IND = '#2D3A6B', ASH = '#F1E6CC';

// ───────────── shared leaf helper (copied from ART.md) ─────────────
function palmLeaf(x, y, w, h, rot = 0, tone = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, tone ? '#C89A52' : '#E6C27C'); g.addColorStop(0.5, tone ? '#B88A45' : '#D9B36C'); g.addColorStop(1, '#A8782F');
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w / 2 + h * 0.4, -h / 2, -w / 2 + h, -h / 2); ctx.lineTo(w / 2 - h, -h / 2); ctx.quadraticCurveTo(w / 2 - h * 0.4, -h / 2, w / 2, 0);
  ctx.quadraticCurveTo(w / 2 - h * 0.4, h / 2, w / 2 - h, h / 2); ctx.lineTo(-w / 2 + h, h / 2); ctx.quadraticCurveTo(-w / 2 + h * 0.4, h / 2, -w / 2, 0); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,30,0.35)'; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++) { const yy = -h / 2 + (h * i) / 6; ctx.beginPath(); ctx.moveTo(-w / 2 + h, yy); ctx.lineTo(w / 2 - h, yy); ctx.stroke(); }
  ctx.fillStyle = '#120A05'; for (const hx of [-w * 0.3, w * 0.3]) { ctx.beginPath(); ctx.arc(hx, 0, h * 0.09, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
// the same outline as a path (for clipping / burning)
function leafPath(x, y, w, h, rot = 0, add = false) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (px, py) => [x + px * c - py * s, y + px * s + py * c];
  if (!add) ctx.beginPath();
  const m = (a, b) => { const p = P(a, b); ctx.moveTo(p[0], p[1]); }, l = (a, b) => { const p = P(a, b); ctx.lineTo(p[0], p[1]); };
  const q = (a, b, e, f) => { const p = P(a, b), r = P(e, f); ctx.quadraticCurveTo(p[0], p[1], r[0], r[1]); };
  m(-w / 2, 0); q(-w / 2 + h * 0.4, -h / 2, -w / 2 + h, -h / 2); l(w / 2 - h, -h / 2); q(w / 2 - h * 0.4, -h / 2, w / 2, 0);
  q(w / 2 - h * 0.4, h / 2, w / 2 - h, h / 2); l(-w / 2 + h, h / 2); q(-w / 2 + h * 0.4, h / 2, -w / 2, 0); ctx.closePath();
}

// ───────────── tiny stroke helpers (used inside cached drawings) ─────────────
const pl = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); };
const oval = (x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.stroke(); };
// abstract unreadable verse marks: a wavy line of loops + dots
function verse(x0, x1, y, seed, sz = 9) {
  let x = x0, i = 0;
  while (x < x1 - sz) {
    const g = sz * (0.8 + rnd(seed + i) * 0.9), k = Math.floor(rnd(seed * 3.1 + i) * 4); ctx.beginPath();
    if (k === 0) ctx.arc(x + g / 2, y, g * 0.4, 0.5, TAU - 0.4);
    else if (k === 1) { ctx.moveTo(x, y + g * 0.3); ctx.quadraticCurveTo(x + g * 0.5, y - g * 0.8, x + g, y + g * 0.2); }
    else if (k === 2) { ctx.moveTo(x, y); ctx.bezierCurveTo(x + g * 0.3, y - g * 0.7, x + g * 0.7, y + g * 0.7, x + g, y); }
    else { ctx.arc(x + g * 0.3, y, g * 0.25, 0, TAU); ctx.moveTo(x + g * 0.6, y - g * 0.4); ctx.lineTo(x + g * 0.6, y + g * 0.4); }
    ctx.stroke(); x += g + sz * (0.3 + rnd(seed + i * 5) * 0.4); if (rnd(seed * 9 + i) > 0.85) x += sz * 1.2; i++;
  }
}
const versesOn = (w, h, seed, rows = 3, col = INK, lw = 2) => {
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  for (let r = 0; r < rows; r++) { const y = -h / 2 + h * (r + 0.75) / (rows + 0.5); verse(-w / 2 + h * 0.9, w / 2 - h * 0.9, y, seed + r * 13, h / (rows * 2.6)); }
};

// ───────────── cached art ─────────────
const deskImg = () => cached('cDesk', W, H, 0.5, () => {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1A0F07'); g.addColorStop(0.55, DESK); g.addColorStop(1, '#0A0503');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.lineCap = 'round';
  for (let i = 0; i < 90; i++) { const y = rnd(i) * H, a = 0.04 + rnd(i + 3) * 0.08; ctx.strokeStyle = `rgba(${rnd(i + 1) > 0.5 ? '60,34,16' : '0,0,0'},${a})`; ctx.lineWidth = 2 + rnd(i + 7) * 5;
    ctx.beginPath(); ctx.moveTo(-20, y); for (let x = 0; x <= W + 40; x += 60) ctx.lineTo(x, y + Math.sin(x * 0.006 + i) * 10 + (rnd(i * 9 + x) - 0.5) * 3); ctx.stroke(); }
});
const leafImg = (key, w, h, tone = 0, seed = 0, rows = 3) => cached(key, w + 20, h + 20, 1, () => {
  palmLeaf(w / 2 + 10, h / 2 + 10, w, h, 0, tone);
  if (seed) { ctx.save(); ctx.translate(w / 2 + 10, h / 2 + 10); versesOn(w, h, seed, rows, 'rgba(42,22,6,0.85)', 2.2); ctx.restore(); }
});
const blitLeaf = (img, x, y, rot = 0, s = 1, a = 1) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); blit(img, img.width / 2, img.height / 2, 0, 0, s, a); ctx.restore(); };

// a stack of n leaves (an illustrated panel) + its scene in two etch states
function panel(key, w, h, n, gap, scene) {
  const th = n * h + (n - 1) * gap, cw = w + 20, chh = th + 20;
  const clipL = () => { ctx.beginPath(); for (let i = 0; i < n; i++) leafPath(cw / 2, 10 + h / 2 + i * (h + gap), w, h, 0, true); ctx.clip(); };
  const base = cached(key + 'B', cw, chh, 1, () => { for (let i = 0; i < n; i++) palmLeaf(cw / 2, 10 + h / 2 + i * (h + gap), w, h, 0, i % 2); });
  const layer = (mode) => cached(key + mode, cw, chh, 1, () => {
    ctx.save(); clipL(); ctx.translate(cw / 2, chh / 2); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = mode === 'S' ? SOOT : 'rgba(84,48,16,0.8)'; ctx.lineWidth = mode === 'S' ? 4.2 : 2; scene(mode); ctx.restore();
    if (mode === 'S') { ctx.save(); clipL(); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(20,10,3,0.06)'; ctx.fillRect(0, 0, cw, chh); ctx.restore(); }
  });
  return { base, scr: layer('R'), soot: layer('S'), w, h, n, gap, th, cw, chh };
}
// draw a panel centred at (x, y): pS = stylus scratch progress, pK = soot rub progress (0..1, left to right)
function drawPanel(Pn, x, y, pS = 1, pK = 1, lt = 0, a = 1) {
  const ox = Pn.cw / 2, oy = Pn.chh / 2, x0 = x - Pn.w / 2;
  blit(Pn.base, ox, oy, x, y, 1, a);
  if (pS > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, y - oy, Pn.w * pS + 20, Pn.chh); ctx.clip(); blit(Pn.scr, ox, oy, x, y, 1, a); ctx.restore(); }
  if (pK > 0) { ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, y - oy, Pn.w * pK + 20, Pn.chh); ctx.clip(); blit(Pn.soot, ox, oy, x, y, 1, a); ctx.restore(); }
  // soot rub band (lamp black smudge) at the soot front
  if (pK > 0 && pK < 1) {
    const sx = x0 + Pn.w * pK; ctx.save(); ctx.beginPath(); for (let i = 0; i < Pn.n; i++) leafPath(x, y - Pn.th / 2 + Pn.h / 2 + i * (Pn.h + Pn.gap), Pn.w, Pn.h, 0, true); ctx.clip();
    const g = ctx.createLinearGradient(sx - 140, 0, sx + 30, 0); g.addColorStop(0, 'rgba(20,10,4,0)'); g.addColorStop(0.75, 'rgba(20,10,4,0.55)'); g.addColorStop(1, 'rgba(20,10,4,0)');
    ctx.fillStyle = g; ctx.fillRect(sx - 140, y - oy, 170, Pn.chh); ctx.restore();
    // the rag (a dark cloth wad)
    const ry = y + Math.sin(lt * 14) * Pn.th * 0.3; ctx.fillStyle = '#1C120B'; ctx.beginPath(); ctx.ellipse(sx + 10, ry, 34, 46, 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(241,230,204,0.12)'; ctx.beginPath(); ctx.ellipse(sx + 2, ry - 14, 14, 18, 0.3, 0, TAU); ctx.fill();
  }
  if (pS > 0 && pS < 1) stylus(x0 + Pn.w * pS, y + Math.sin(lt * 23) * Pn.th * 0.36, 0);
}
// iron stylus (tip at x, y)
function stylus(x, y, lift = 0) {
  ctx.save(); ctx.translate(x, y - lift); ctx.rotate(-0.55);
  ctx.fillStyle = '#5C5A55'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-7, -40); ctx.lineTo(7, -40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8D8A82'; ctx.fillRect(-7, -330, 14, 292); ctx.fillStyle = '#C9C3B5'; ctx.fillRect(-2, -320, 4, 280);
  ctx.fillStyle = TUR; ctx.fillRect(-10, -250, 20, 16); ctx.fillRect(-10, -300, 20, 10);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,230,170,0.8)'; ctx.beginPath(); ctx.arc(x, y - lift, 3, 0, TAU); ctx.fill();
}

// ───────────── labels ─────────────
function tag(text, x, y, sc = 1, a = 1, border = TUR, size = 52) {
  if (sc <= 0 || a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= a;
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.12)}px`;
  const w = ctx.measureText(text).width + size * 1.5, h = size * 1.55;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -h / 2 + 10, w, h, 10); ctx.fill();
  ctx.fillStyle = '#1C1008'; ctx.beginPath(); ctx.moveTo(-w / 2 - h * 0.35, 0); ctx.lineTo(-w / 2, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2 + h * 0.35, 0); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = border; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = rgba(border.length === 7 ? border : TUR, 0.45); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-w / 2 + 10, -h / 2 + 9); ctx.lineTo(w / 2 - 10, -h / 2 + 9); ctx.moveTo(-w / 2 + 10, h / 2 - 9); ctx.lineTo(w / 2 - 10, h / 2 - 9); ctx.stroke();
  ctx.fillStyle = border; ctx.beginPath(); ctx.arc(-w / 2 + 4, 0, 6, 0, TAU); ctx.arc(w / 2 - 4, 0, 6, 0, TAU); ctx.fill();
  ctx.fillStyle = ASH; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, size * 0.06, size * 0.06);
  ctx.restore(); ctx.letterSpacing = '0px';
}
// stamp-in: big -> settle, with a tiny shake
const stamp = (lt, t0, dur = 0.22) => { const k = seg(lt, t0, t0 + dur); return { s: k <= 0 ? 0 : lerp(1.7, 1, eo(k)) + 0.03 * Math.sin(lt * 3), a: clamp(k * 2.5) }; };
const stampTag = (text, x, y, lt, t0, border, size) => { const st = stamp(lt, t0); tag(text, x, y, st.s, st.a, border, size); };

// ───────────── atmosphere ─────────────
function desk(t, lampX = 920, lampY = 1240, lampS = 0.62, lit = 1) {
  blit(deskImg(), 0, 0, 0, 0, 1);
  if (lampX != null) K.lamp(lampX, lampY, lampS, t, lit);
}
function indigoWash(a, x = 540, y = 760) {
  if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 60, x, y, 900); g.addColorStop(0, `rgba(70,90,160,${0.22 * a})`); g.addColorStop(1, `rgba(20,26,60,${0.5 * a})`);
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
}
function calmCaptionZone() { const g = ctx.createLinearGradient(0, 1270, 0, 1380); g.addColorStop(0, 'rgba(8,4,2,0)'); g.addColorStop(1, 'rgba(8,4,2,0.7)'); ctx.fillStyle = g; ctx.fillRect(-300, 1270, W + 600, 110); ctx.fillStyle = 'rgba(8,4,2,0.7)'; ctx.fillRect(-300, 1380, W + 600, 700); }
function sparks(t, x, y, w, n, seed, rise = 420, col = '255,190,90') {
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.5 + rnd(i + seed) * 0.6) + rnd(i * 3 + seed)) % 1, xx = x + (rnd(i * 7 + seed) - 0.5) * w + Math.sin(t * 3 + i) * 16, yy = y - ph * rise;
    ctx.fillStyle = `rgba(${col},${(1 - ph) * 0.9})`; ctx.beginPath(); ctx.arc(xx, yy, 1.5 + rnd(i + 2) * 3, 0, TAU); ctx.fill();
  }
}

// ───────────── scenes (etched strokes; mode 'R' scratch, 'S' soot + colour washes) ─────────────
function runner(x, y, s, fall = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (fall) { ctx.rotate(1.25); }
  oval(8, -86, 8, 10); pl([[5, -75], [-4, -38]]); pl([[-4, -38], [14, -18], [16, 0]]); pl([[-4, -38], [-22, -16], [-36, -8]]);
  pl([[3, -68], [-18, -56], [-30, -62]]); pl([[3, -68], [20, -74], [30, -88]]);
  ctx.restore();
}
function sceneVictory(m) {
  const S = m === 'S';
  // sun
  oval(330, -140, 26, 26); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; pl([[330 + Math.cos(a) * 36, -140 + Math.sin(a) * 36], [330 + Math.cos(a) * 52, -140 + Math.sin(a) * 52]]); }
  // ground + river
  pl([[-500, 104], [-200, 100], [100, 106], [500, 100]]);
  for (const [yy, ph] of [[140, 0], [168, 1.7], [194, 3.1]]) { ctx.beginPath(); for (let x = -500; x <= 500; x += 10) { const v = yy + Math.sin(x * 0.03 + ph) * 5; x === -500 ? ctx.moveTo(x, v) : ctx.lineTo(x, v); } ctx.stroke(); }
  if (S) { ctx.fillStyle = rgba(IND, 0.32); ctx.fillRect(-520, 128, 1040, 80); }
  // the king: tall crown, raised banner
  const kx = -230;
  if (S) { ctx.fillStyle = rgba(TUR, 0.75); ctx.beginPath(); ctx.moveTo(-164, -206); ctx.lineTo(-60, -190); ctx.lineTo(-96, -168); ctx.lineTo(-60, -146); ctx.lineTo(-166, -150); ctx.closePath(); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-164, -206); ctx.lineTo(-60, -190); ctx.lineTo(-96, -168); ctx.lineTo(-60, -146); ctx.lineTo(-166, -150); ctx.stroke();
  pl([[-164, -212], [-176, 100]]);
  oval(kx, -100, 18, 23);
  if (S) { ctx.fillStyle = rgba(TUR, 0.8); ctx.beginPath(); ctx.moveTo(kx - 18, -118); ctx.lineTo(kx - 14, -160); ctx.lineTo(kx - 6, -140); ctx.lineTo(kx, -176); ctx.lineTo(kx + 6, -140); ctx.lineTo(kx + 14, -160); ctx.lineTo(kx + 18, -118); ctx.closePath(); ctx.fill(); }
  pl([[kx - 18, -118], [kx - 14, -160], [kx - 6, -140], [kx, -176], [kx + 6, -140], [kx + 14, -160], [kx + 18, -118], [kx - 18, -118]]);
  pl([[kx - 34, -72], [kx + 34, -72], [kx + 24, 20], [kx + 40, 100], [kx - 40, 100], [kx - 24, 20], [kx - 34, -72]]);
  pl([[kx - 24, 20], [kx + 24, 20]]); pl([[kx, 20], [kx, 100]]);
  pl([[kx + 32, -66], [kx + 56, -100], [-170, -140]]);
  pl([[kx - 32, -66], [kx - 54, -20], [kx - 58, 30]]); pl([[kx - 58, 30], [kx - 64, 92]]);
  if (S) { ctx.fillStyle = rgba(RED, 0.4); ctx.beginPath(); ctx.moveTo(kx - 30, -60); ctx.lineTo(kx + 30, -60); ctx.lineTo(kx + 22, 18); ctx.lineTo(kx - 22, 18); ctx.closePath(); ctx.fill(); }
  // two spear-men behind the king
  for (const [sx, sc] of [[-360, 0.9], [-420, 0.75]]) { ctx.save(); ctx.translate(sx, 100); ctx.scale(sc, sc); oval(0, -112, 11, 14); pl([[0, -98], [0, -40]]); pl([[0, -40], [-12, 0]]); pl([[0, -40], [12, 0]]); pl([[0, -86], [18, -60]]); pl([[18, -170], [18, 0]]); pl([[12, -170], [18, -188], [24, -170]]); ctx.restore(); }
  // fleeing enemies
  const R = [[30, 100, 0.95], [110, 98, 0.85], [175, 102, 1.05], [250, 100, 0.8], [320, 98, 0.9], [395, 101, 0.75]];
  R.forEach(([x, y, s]) => runner(x, y, s)); runner(80, 92, 0.8, 1);
  // dropped shields and spears, arrows in flight
  oval(-20, 90, 16, 10); oval(210, 92, 13, 8); pl([[-80, 96], [20, 74]]); pl([[140, 98], [230, 84]]);
  for (const [ax, ay] of [[-110, -60], [-40, -110], [30, -40], [90, -130]]) { pl([[ax, ay], [ax + 70, ay + 14]]); pl([[ax + 60, ay + 6], [ax + 72, ay + 14], [ax + 60, ay + 22]]); }
}
function sceneKing(m) {
  const S = m === 'S';
  // pavilion frame (two pillars + thatched roof)
  pl([[-200, 120], [-200, -50]]); pl([[200, 120], [200, -50]]); pl([[-230, -50], [0, -118], [230, -50], [-230, -50]]);
  for (let i = -3; i <= 3; i++) pl([[i * 56, -50 - (3 - Math.abs(i)) * 0], [i * 28, -100]]);
  pl([[-260, 122], [260, 122]]);
  // throne
  pl([[-70, 120], [-70, 50], [70, 50], [70, 120]]); pl([[-80, 50], [80, 50]]); pl([[-60, 50], [-60, -10]]); pl([[60, 50], [60, -10]]);
  // seated king
  oval(0, -58, 16, 20);
  if (S) { ctx.fillStyle = rgba(TUR, 0.8); ctx.beginPath(); ctx.moveTo(-16, -74); ctx.lineTo(-12, -112); ctx.lineTo(-4, -94); ctx.lineTo(0, -128); ctx.lineTo(4, -94); ctx.lineTo(12, -112); ctx.lineTo(16, -74); ctx.closePath(); ctx.fill(); }
  pl([[-16, -74], [-12, -112], [-4, -94], [0, -128], [4, -94], [12, -112], [16, -74], [-16, -74]]);
  pl([[-30, -34], [30, -34], [24, 40], [-24, 40], [-30, -34]]);
  if (S) { ctx.fillStyle = rgba(RED, 0.35); ctx.fillRect(-26, -30, 52, 68); }
  pl([[-24, 40], [-40, 46], [-34, 112]]); pl([[24, 40], [40, 46], [34, 112]]);
  pl([[30, -28], [46, 4], [26, 20]]); pl([[-30, -28], [-46, 4], [-26, 20]]);
  // verse rows either side
  ctx.save(); ctx.lineWidth = S ? 2.4 : 1.5; for (let r = 0; r < 4; r++) { verse(-350, -232, -80 + r * 56, 71 + r * 7, 10); verse(232, 350, -80 + r * 56, 91 + r * 5, 10); } ctx.restore();
}
function sceneBrother(m) {
  const S = m === 'S';
  // the brother: smaller faceless figure with a stylus and a leaf
  oval(0, -70, 17, 21); pl([[-26, -44], [26, -44], [34, 110], [-34, 110], [-26, -44]]); pl([[-8, 110], [-8, 130]]); pl([[8, 110], [8, 130]]);
  pl([[24, -38], [52, -6], [70, -24]]); pl([[-24, -38], [-40, 0], [-20, 14]]);
  pl([[70, -24], [92, -64]]); // stylus
  if (S) { ctx.fillStyle = rgba(TUR, 0.6); ctx.fillRect(-46, 2, 70, 16); }
  ctx.strokeRect(-46, 2, 70, 16);
  if (S) { ctx.fillStyle = rgba(IND, 0.3); ctx.fillRect(-22, -36, 44, 140); }
  // verses written by "someone"
  ctx.save(); ctx.lineWidth = S ? 2.6 : 1.6; for (let r = 0; r < 4; r++) { verse(-400, -130, -90 + r * 60, 31 + r * 7, 11); verse(130, 400, -90 + r * 60, 57 + r * 5, 11); } ctx.restore();
}

// ───────────── the Kalambakam bundle ─────────────
const BW = 820, BH = 110;
function bundle(x, y, t, fan = 0, glow = 0) {
  const L1 = leafImg('cBLeafA', BW, BH, 0, 5, 3), L2 = leafImg('cBLeafB', BW, BH, 1, 0);
  const n = 7, px = x - BW * 0.3;
  if (glow > 0) K.glow(x, y, 560, '255,170,70', 0.32 * glow * (0.92 + 0.08 * Math.sin(t * 7)));
  for (let i = 0; i < n; i++) {
    const k = i - (n - 1), a = (i % 2 ? 1 : -1) * Math.ceil(-k / 2) * 0.05 * fan, dy = -k * 7 * (1 - fan * 0.6);
    ctx.save(); ctx.translate(px, y + dy); ctx.rotate(a); ctx.translate(-px, -(y + dy));
    blitLeaf(i === n - 1 ? L1 : L2, x + (rnd(i) - 0.5) * 10, y + dy - i * 0, 0); ctx.restore();
  }
  // cord through the left hole, wrapped, knot + tails
  const hx = px, hy = y;
  ctx.strokeStyle = '#6E4A22'; ctx.lineCap = 'round'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(hx, hy - 70); ctx.lineTo(hx, hy + 70); ctx.stroke();
  ctx.strokeStyle = '#8A5E2E'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx - 3, hy - 66); ctx.lineTo(hx - 3, hy + 66); ctx.stroke();
  const sw = Math.sin(t * 2.2) * 0.25;
  ctx.strokeStyle = '#6E4A22'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(hx, hy + 6); ctx.quadraticCurveTo(hx - 60 + sw * 40, hy + 90, hx - 50 + sw * 90, hy + 170); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx, hy + 6); ctx.quadraticCurveTo(hx + 30 + sw * 30, hy + 100, hx + 10 + sw * 80, hy + 180); ctx.stroke();
  ctx.fillStyle = '#5A3A18'; ctx.beginPath(); ctx.arc(hx, hy + 4, 15, 0, TAU); ctx.fill();
  for (const [ex, ey] of [[hx - 50 + sw * 90, hy + 170], [hx + 10 + sw * 80, hy + 180]]) { ctx.fillStyle = TUR; ctx.beginPath(); ctx.arc(ex, ey, 9, 0, TAU); ctx.fill(); }
  // a wooden cover board on the right hole
  const rx = x + BW * 0.3; ctx.fillStyle = '#120A05'; ctx.beginPath(); ctx.arc(rx, y, 10, 0, TAU); ctx.fill(); ctx.strokeStyle = '#6E4A22'; ctx.lineWidth = 5; ctx.stroke();
}

// ───────────── per-frame edge burn ─────────────
function burnEdge(x, y, w, h, rot, char, t, seed = 0, flames = 8) {
  ctx.save(); leafPath(x, y, w, h, rot); ctx.clip(); ctx.lineJoin = 'round';
  leafPath(x, y, w, h, rot); ctx.strokeStyle = 'rgba(255,120,30,0.85)'; ctx.lineWidth = char * 2 + 18 + Math.sin(t * 9) * 3; ctx.stroke();
  leafPath(x, y, w, h, rot); ctx.strokeStyle = '#2A1206'; ctx.lineWidth = char * 2; ctx.stroke();
  leafPath(x, y, w, h, rot); ctx.strokeStyle = '#0E0603'; ctx.lineWidth = char * 1.2; ctx.stroke();
  ctx.restore();
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < flames; i++) {
    const u = (i + 0.5) / flames, side = i % 2 ? 1 : -1, lx = (u - 0.5) * (w - h * 1.5), ly = side * (h / 2 - char * 0.6);
    const fx = x + lx * c - ly * s, fy = y + lx * s + ly * c;
    K.flame(fx, fy, 0.45 + 0.25 * rnd(i + seed) + 0.1 * Math.sin(t * 5 + i), t, i + seed);
  }
}

// ═════════════════════════ SHOTS ═════════════════════════
export function buildC(add, cue) {
  const tA = L(8), tPoem = Wd('poem', 8) - 0.12, tNandi = Wd('nandivarman', 8) - 0.4, tBut = Wd('but', 8) - 0.12, tSch = Wd('scholars', 8) - 0.2;
  const t9 = L(9), tOr = Wd('or', 9) - 0.08, tTell = Wd('tell', 9) - 0.1, tThen = Wd('then', 9) - 0.1, tKing = Wd('did', 9) - 0.42, END = T.dur;
  const VIC = panel('cVic', 1040, 140, 3, 8, sceneVictory);
  const KING = panel('cKing', 780, 132, 2, 8, sceneKing);
  const BRO = panel('cBro', 920, 150, 2, 8, sceneBrother);
  const cleanLeaf = () => leafImg('cClean', 900, 120, 0, 3, 3);

  // c1 · Now the record
  const tRec = Wd('record', 8) - tA;
  add({ id: 'c1', at: tA, cam: [540, 760], zoom: 0.09, note: 'smoke clears, clean leaf slides in, RECORD stamps', draw(lt, d, t) {
    desk(t);
    indigoWash(eo(seg(lt, tRec, tRec + 0.6)));
    const k = eo(seg(lt, 0, 0.5)), x = lerp(1560, 540, k), rot = lerp(0.25, -0.03, k);
    blitLeaf(cleanLeaf(), x, 780 + Math.sin(lt * 2) * 4, rot);
    // a second leaf settling behind
    blitLeaf(leafImg('cBLeafB', BW, BH, 1, 0), lerp(-700, 520, eo(seg(lt, 0.15, 0.7))), 960, 0.05);
    smoke(540, 1150, t, 9, '150,140,130', 0.32 * (1 - seg(lt, 0, 0.9)), 260, 900);
    ctx.fillStyle = `rgba(70,64,58,${0.55 * (1 - eo(seg(lt, 0, 0.7)))})`; ctx.fillRect(-300, -300, W + 600, 1600);
    stampTag('RECORD', 540, 560, lt, tRec, '#5A6DB8', 78);
    dust(t, 30, 3, '200,210,255', 0.35);
    calmCaptionZone();
  } });
  cue(tA, 'whoosh', { gain: 0.6 }); cue(tA + 0.05, 'slide', { gain: 0.5 }); cue(tA + tRec, 'bell', { gain: 0.8 });

  // c2 · The poem is real
  const tReal = Wd('real', 8) - tPoem;
  add({ id: 'c2', at: tPoem, cam: [540, 700], zoom: 0.08, note: 'Nandi Kalambakam bundle intact, tied; THE POEM IS REAL', draw(lt, d, t) {
    desk(t, 160, 1220, 0.6);
    indigoWash(0.75);
    const k = seg(lt, 0, 0.45), y = lerp(330, 720, eob(k));
    ctx.fillStyle = `rgba(0,0,0,${0.5 * k})`; ctx.beginPath(); ctx.ellipse(540, 800, 470 * (0.6 + 0.4 * k), 40, 0, 0, TAU); ctx.fill();
    bundle(540, y, t, 0.15 + 0.1 * Math.sin(lt * 1.6), 0.6);
    tag('NANDI KALAMBAKAM', 540, 470, 1, eo(seg(lt, 0.4, 0.8)), TUR, 48);
    stampTag('THE POEM IS REAL', 540, 1050, lt, tReal, '#5A6DB8', 62);
    dust(t, 30, 5, '255,226,160', 0.4);
    calmCaptionZone();
  } });
  cue(tPoem, 'whoosh', { gain: 0.5 }); cue(tPoem + 0.4, 'thud', { gain: 0.6 }); cue(tPoem + tReal, 'tock', { gain: 0.7 });

  // c3 · praises a real Nandivarman, victor at Tellaru
  const tVic = Wd('victor', 8) - tNandi;
  add({ id: 'c3', at: tNandi, cam: [540, 700], zoom: 0.1, note: 'etched battle scene: king + banner, fleeing figures, river; VICTOR AT TELLARU', draw(lt, d, t) {
    desk(t, 900, 1240, 0.6);
    indigoWash(0.55);
    drawPanel(VIC, 540, 720, eio(seg(lt, 0.0, 1.15)), eio(seg(lt, 0.85, 1.9)), lt);
    // flag flutter highlight + dust behind runners once sooted
    const kk = seg(lt, 1.2, 1.6);
    if (kk > 0) { for (let i = 0; i < 6; i++) { const ph = (lt * 1.4 + i / 6) % 1; ctx.fillStyle = `rgba(90,60,30,${0.35 * kk * (1 - ph)})`; ctx.beginPath(); ctx.arc(540 + 20 + i * 60 - ph * 50, 812 - ph * 20, 6 + ph * 14, 0, TAU); ctx.fill(); } }
    tag('NANDIVARMAN III', 540, 410, 1, eo(seg(lt, 0.2, 0.6)), TUR, 46);
    stampTag('VICTOR AT TELLARU', 540, 1050, lt, tVic, TUR, 58);
    calmCaptionZone();
  } });
  cue(tNandi, 'whoosh', { gain: 0.5 }); cue(tNandi + 0.05, 'chisel', { gain: 0.7, dur: 1.1 }); cue(tNandi + 0.9, 'slide', { gain: 0.35 }); cue(tNandi + tVic, 'drum', { gain: 0.6 });

  // c4 · no inscription tells of a cursed death
  const tIns = Wd('inscription', 8) - tBut, tCur = Wd('cursed', 8) - tBut;
  const tablet = () => cached('cTablet', 760, 900, 1, () => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.roundRect(16, 24, 740, 870, 30); ctx.fill();
    const g = ctx.createLinearGradient(0, 0, 760, 900); g.addColorStop(0, '#6F6A63'); g.addColorStop(0.5, '#4E4A45'); g.addColorStop(1, '#34312D');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, 0, 740, 870, 30); ctx.fill();
    for (let i = 0; i < 900; i++) { ctx.fillStyle = rnd(i) > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.18)'; ctx.fillRect(rnd(i * 3) * 740, rnd(i * 7) * 870, 2 + rnd(i + 1) * 4, 2 + rnd(i + 2) * 3); }
    ctx.strokeStyle = 'rgba(20,16,12,0.7)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(34, 34, 672, 802, 18); ctx.stroke();
    ctx.strokeStyle = 'rgba(200,190,170,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(40, 40, 672, 802, 18); ctx.stroke();
    ctx.lineCap = 'round';
    for (let r = 0; r < 13; r++) { const y = 100 + r * 56; ctx.strokeStyle = 'rgba(18,14,10,0.8)'; ctx.lineWidth = 3.2; verse(80, 660, y, 200 + r * 11, 13); ctx.strokeStyle = 'rgba(210,200,180,0.18)'; ctx.lineWidth = 1.5; ctx.save(); ctx.translate(1.5, 2); verse(80, 660, y, 200 + r * 11, 13); ctx.restore(); }
  });
  const veins = []; for (let v = 0; v < 5; v++) { const pts = []; let x = -260 + rnd(v * 3) * 80, y = -330 + v * 150 + rnd(v * 5) * 60; for (let i = 0; i < 22; i++) { pts.push([x, y]); x += 26; y += Math.sin(i * 0.7 + v * 2) * 18 + (rnd(v * 17 + i) - 0.5) * 22; } veins.push(pts); }
  add({ id: 'c4', at: tBut, cam: [540, 720], zoom: 0.08, note: 'granite tablet, red curse veins try to appear and fade; NO INSCRIPTION', draw(lt, d, t) {
    desk(t, null);
    indigoWash(0.65);
    K.glow(540, 700, 700, '120,140,210', 0.18);
    blit(tablet(), 370, 450, 540, 720 + Math.sin(lt * 1.2) * 4, 1);
    // red curse veins: two attempts, both fail
    for (const [a0, amp] of [[0.25, 0.8], [tCur - 0.15, 1]]) {
      const p = eo(seg(lt, a0, a0 + 0.55)), f = 1 - seg(lt, a0 + 0.55, a0 + 1.05); if (p <= 0 || f <= 0) continue;
      const beat = 0.75 + 0.25 * Math.sin(lt * 14);
      for (const pts of veins) {
        const nn = Math.max(2, Math.floor(pts.length * p)); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); for (let i = 0; i < nn; i++) { const [x, y] = pts[i]; i ? ctx.lineTo(x + 540, y + 720) : ctx.moveTo(x + 540, y + 720); }
        ctx.strokeStyle = `rgba(255,80,40,${0.22 * f * amp * beat})`; ctx.lineWidth = 16; ctx.stroke();
        ctx.strokeStyle = `rgba(192,51,31,${0.9 * f * amp})`; ctx.lineWidth = 4; ctx.stroke();
      }
    }
    // a chisel tapping the corner (dust spits)
    const tap = (lt * 3) % 1; ctx.save(); ctx.translate(820, 300 - Math.max(0, 0.3 - tap) * 60); ctx.rotate(0.6); ctx.fillStyle = '#9A958C'; ctx.fillRect(-8, -200, 16, 200); ctx.fillStyle = '#6B4A2A'; ctx.fillRect(-14, -280, 28, 90); ctx.restore();
    for (let i = 0; i < 8; i++) { const ph = (tap + i / 8) % 1; ctx.fillStyle = `rgba(200,190,170,${0.6 * (1 - ph)})`; ctx.beginPath(); ctx.arc(820 + (rnd(i) - 0.5) * 80 * ph, 310 + ph * 90, 2.5, 0, TAU); ctx.fill(); }
    stampTag('NO INSCRIPTION', 540, 1110, lt, tIns, '#5A6DB8', 62);
    calmCaptionZone();
  } });
  cue(tBut, 'whoosh', { gain: 0.5 }); cue(tBut + 0.1, 'chisel', { gain: 0.6, dur: 0.8 }); cue(tBut + 0.3, 'heartbeat', { gain: 0.5 }); cue(tBut + tIns, 'thud', { gain: 0.7 }); cue(tBut + tCur - 0.1, 'heartbeat', { gain: 0.6 });

  // c5 · scholars doubt a brother wrote it
  const tDoubt = Wd('doubt', 8) - tSch, tBro = Wd('brother', 8) - tSch;
  const scholar = () => cached('cScholar', 520, 760, 1, () => {
    ctx.translate(260, 380); ctx.fillStyle = '#24170D';
    ctx.beginPath(); ctx.ellipse(40, -220, 70, 86, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-160, 380); ctx.quadraticCurveTo(-170, -40, -40, -110); ctx.quadraticCurveTo(80, -150, 170, -60); ctx.quadraticCurveTo(240, 80, 230, 380); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(224,165,38,0.55)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(40, -220, 70, 86, 0, Math.PI * 0.6, Math.PI * 1.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-160, 380); ctx.quadraticCurveTo(-170, -40, -40, -110); ctx.quadraticCurveTo(30, -134, 80, -130); ctx.stroke();
    ctx.strokeStyle = 'rgba(224,165,38,0.25)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-120 + i * 70, 380); ctx.quadraticCurveTo(-90 + i * 60, 100, -40 + i * 40, -60); ctx.stroke(); }
  });
  add({ id: 'c5', at: tSch, cam: [540, 760], zoom: 0.08, note: 'scholar lens over the brother leaf; red ? on him; SCHOLARS DOUBT', draw(lt, d, t) {
    desk(t, 140, 1240, 0.6);
    indigoWash(0.6);
    const py = 860; drawPanel(BRO, 540, py, 1, 1, lt);
    // scholar silhouette + lens
    const sx = 930 + Math.sin(lt * 0.8) * 10, sy = 370;
    blit(scholar(), 260, 380, sx, sy, 1);
    const lx = 540 + Math.sin(lt * 1.3 - 1.2) * 300 * (1 - eo(seg(lt, tBro - 0.3, tBro + 0.2))) , ly = py - 10 + Math.cos(lt * 1.7) * 30;
    ctx.strokeStyle = '#24170D'; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx - 120, sy + 40); ctx.quadraticCurveTo(sx - 180, ly - 140, lx + 70, ly - 80); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, 110, 0, TAU); ctx.clip();
    ctx.fillStyle = DESK; ctx.fillRect(lx - 110, ly - 110, 220, 220);
    ctx.save(); ctx.translate(lx, ly); ctx.scale(1.6, 1.6); ctx.translate(-lx, -ly); drawPanel(BRO, 540, py, 1, 1, lt); ctx.restore();
    ctx.fillStyle = 'rgba(180,200,255,0.12)'; ctx.fillRect(lx - 110, ly - 110, 220, 220); ctx.restore();
    ctx.strokeStyle = '#B88A45'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(lx, ly, 112, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#E6C27C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(lx, ly, 106, 3.6, 4.6); ctx.stroke();
    ctx.strokeStyle = '#6E4A22'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(lx + 78, ly - 78); ctx.lineTo(lx + 140, ly - 140); ctx.stroke();
    // the ? over the brother
    const q = seg(lt, tBro, tBro + 0.3);
    if (q > 0) { const pulse = 1 + 0.06 * Math.sin(lt * 12); ctx.save(); ctx.translate(540, py - 250); ctx.scale(lerp(2, 1, eo(q)) * pulse, lerp(2, 1, eo(q)) * pulse); ctx.globalAlpha = q;
      ctx.font = '700 230px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 10; ctx.strokeStyle = '#1C0A04'; ctx.strokeText('?', 0, 0); ctx.fillStyle = RED; ctx.fillText('?', 0, 0); ctx.restore(); }
    stampTag('SCHOLARS DOUBT', 540, 380, lt, 0.25, '#5A6DB8', 62);
    tag('A BROTHER?', 540, 1120, 1, eo(seg(lt, tBro + 0.1, tBro + 0.4)), RED, 46);
    calmCaptionZone();
  } });
  cue(tSch, 'whoosh', { gain: 0.5 }); cue(tSch + 0.25, 'tock', { gain: 0.6 }); cue(tSch + tDoubt, 'slide', { gain: 0.3 }); cue(tSch + tBro, 'pop', { gain: 0.6 });

  // c6 / c7 · split: LEGEND burns / RECORD stays
  const LW = 760, LH = 190;
  const splitDraw = (focus) => (lt, d, t) => {
    const g = t - t9;
    desk(t, null);
    // left half warm, right half cool
    K.glow(290, 720, 600, '255,120,40', 0.28 * (0.9 + 0.1 * Math.sin(t * 8)));
    ctx.save(); ctx.beginPath(); ctx.rect(540, -300, 900, 2400); ctx.clip(); indigoWash(0.9, 790, 720); ctx.restore();
    // divider
    ctx.strokeStyle = 'rgba(224,165,38,0.5)'; ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.moveTo(540, 170); ctx.lineTo(540, 1250); ctx.stroke(); ctx.setLineDash([]);
    // LEGEND leaf, burning
    const lx = 290, ly = 720, rot = Math.PI / 2 + Math.sin(t * 1.1) * 0.015;
    blitLeaf(leafImg('cSplitL', LW, LH, 0, 9, 4), lx, ly, rot);
    burnEdge(lx, ly, LW, LH, rot, 8 + 26 * eio(clamp(g / 3.8)), t, 3, 10);
    sparks(t, lx, 900, 240, 26, 4, 700);
    smoke(lx, 380, t, 6, '120,110,100', 0.18, 120, 300);
    // RECORD leaf, calm
    const rx = 790, rr2 = Math.PI / 2 - Math.sin(t * 0.9) * 0.012;
    blitLeaf(leafImg('cSplitR', LW, LH, 0, 13, 4), rx, ly + Math.sin(t * 1.4) * 5, rr2);
    dust(t, 18, 9, '200,210,255', 0.35);
    const dimL = focus === 'R' ? 0.25 * eo(seg(lt, 0, 0.4)) : 0, dimR = focus === 'L' ? 0.35 : 0.35 * (1 - eo(seg(lt, 0, 0.4)));
    if (dimL) { ctx.fillStyle = `rgba(8,4,2,${dimL})`; ctx.fillRect(-300, -300, 840, 2400); }
    if (dimR) { ctx.fillStyle = `rgba(8,4,2,${dimR})`; ctx.fillRect(540, -300, 900, 2400); }
    tag('LEGEND', lx, 250, 1, 1, RED, 54); tag('RECORD', rx, 250, 1, 1, '#5A6DB8', 54);
    const m = focus === 'L' ? stamp(lt, 0.2) : { s: 1, a: 1 };
    tag('MURDER BY', lx, 1150, m.s, m.a, RED, 44); tag('POETRY?', lx, 1222, m.s, m.a, RED, 44);
    if (focus === 'R') { const o = stamp(lt, 0.15); tag('OR A STORY?', rx, 1180, o.s, o.a, '#5A6DB8', 48); }
    calmCaptionZone();
  };
  add({ id: 'c6', at: t9, cam: [320, 720], zoom: 0.08, note: 'split: LEGEND leaf burns (MURDER BY POETRY?) vs RECORD leaf calm', draw: splitDraw('L') });
  add({ id: 'c7', at: tOr, cam: [760, 720], zoom: 0.07, note: 'camera crosses to calm RECORD leaf; OR A STORY?', draw: splitDraw('R') });
  cue(t9, 'whoosh', { gain: 0.6 }); cue(t9 + 0.05, 'sizzle', { gain: 0.35, dur: 3.6 }); cue(t9 + 0.2, 'heartbeat', { gain: 0.7 }); cue(t9 + 1.0, 'heartbeat', { gain: 0.6 });
  cue(tOr, 'whoosh', { gain: 0.4 }); cue(tOr + 0.15, 'bell', { gain: 0.5 }); cue(tOr + 1.0, 'heartbeat', { gain: 0.5 }); cue(tOr + 1.8, 'heartbeat', { gain: 0.5 });

  // c8 · Tell me below
  add({ id: 'c8', at: tTell, cam: [540, 800], zoom: 0.1, note: 'TELL ME BELOW; stylus taps a blank leaf; etched arrow down', draw(lt, d, t) {
    desk(t, 900, 1240, 0.6);
    indigoWash(0.4);
    const ly = 780; blitLeaf(leafImg('cBlank', 900, 130, 0, 0), 540, ly, -0.02);
    // stylus taps: each tap leaves a scratch mark
    const taps = [0.15, 0.42, 0.69, 0.96], n = taps.filter((x) => lt > x).length;
    ctx.strokeStyle = SOOT; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(260 + i * 70, ly - 10); verse(0, 60, 0, 400 + i, 12); ctx.restore(); }
    const ph = (lt % 0.27) / 0.27, lift = Math.abs(Math.sin(ph * Math.PI)) * 50;
    stylus(300 + Math.min(n, 3.6) * 70 + ph * 50, ly - 6, lift);
    stampTag('TELL ME BELOW', 540, 520, lt, 0.05, TUR, 70);
    // etched arrow pointing down to the comments
    const ay = 980 + Math.sin(lt * 7) * 14, ap = eo(seg(lt, 0.2, 0.6));
    ctx.strokeStyle = rgba(ASH, 0.85 * ap); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(540, ay); ctx.lineTo(540, ay + 150 * ap); ctx.moveTo(500, ay + 110 * ap); ctx.lineTo(540, ay + 150 * ap); ctx.lineTo(580, ay + 110 * ap); ctx.stroke();
    calmCaptionZone();
  } });
  cue(tTell, 'whoosh', { gain: 0.5 }); cue(tTell + 0.05, 'slam', { gain: 0.5 }); for (const x of [0.15, 0.42, 0.69, 0.96]) cue(tTell + x, 'tock', { gain: 0.45 });

  // c9 / c10 · the poem survived. The king did not.
  const tSurv = Wd('survived', 9) - tThen;
  const charKing = () => cached('cKingChar', KING.cw, KING.chh, 1, () => { ctx.drawImage(KING.base, 0, 0); ctx.drawImage(KING.soot, 0, 0); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(22,10,4,0.88)'; ctx.fillRect(0, 0, KING.cw, KING.chh); });
  add({ id: 'c9', at: tThen, cam: [540, 640], zoom: 0.07, note: 'bundle fans open in lamplight beside the king leaf; THE POEM SURVIVED', draw(lt, d, t) {
    desk(t, 150, 1230, 0.65);
    const fan = eio(seg(lt, 0.2, 1.1));
    bundle(540, 560, t, fan * 1.4 + 0.1 * Math.sin(lt * 2), 1);
    drawPanel(KING, 540, 990, 1, 1, lt);
    K.glow(540, 560, 300, '255,200,110', 0.12 + 0.06 * Math.sin(t * 5));
    stampTag('THE POEM SURVIVED', 540, 280, lt, tSurv, TUR, 62);
    dust(t, 30, 11, '255,226,160', 0.45);
    calmCaptionZone();
  } });
  cue(tThen, 'whoosh', { gain: 0.5 }); cue(tThen + 0.2, 'slide', { gain: 0.4 }); cue(tThen + tSurv, 'bell', { gain: 0.7 });

  const COLS = 14;
  add({ id: 'c10', at: tKing, cam: [540, 940], zoom: 0.08, note: 'king leaf chars and crumbles to ash; AAZHI etched tag + FOLLOW', draw(lt, d, t) {
    desk(t, 150, 1230, 0.65);
    bundle(540, 560, t, 1.5 + 0.08 * Math.sin(lt * 2), 1);
    // the king leaf: char creeps right -> left, chunks break off and fall as ash
    const ky = 990, ch = charKing(), x0 = 540 - KING.cw / 2, y0 = ky - KING.chh / 2, cw = KING.cw / COLS;
    for (let i = 0; i < COLS; i++) {
      const ti = 0.15 + (COLS - 1 - i) / COLS * 0.9, c = seg(lt, ti - 0.35, ti), u = seg(lt, ti, ti + 0.75);
      if (u >= 1) continue;
      for (let r = 0; r < 2; r++) {
        const sx = i * cw, sy = r * KING.chh / 2, sh = KING.chh / 2, j = rnd(i * 5 + r);
        const dx = x0 + sx + (j - 0.5) * 60 * u, dy = y0 + sy + 180 * u * u + j * 30 * u;
        ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(dx + cw / 2, dy + sh / 2); ctx.rotate((j - 0.5) * 1.6 * u); ctx.scale(1 - 0.4 * u, 1 - 0.4 * u);
        if (c < 1) ctx.drawImage(KING.base, sx, sy, cw, sh, -cw / 2, -sh / 2, cw, sh), ctx.drawImage(KING.soot, sx, sy, cw, sh, -cw / 2, -sh / 2, cw, sh);
        if (c > 0) { ctx.globalAlpha = (1 - u) * c; ctx.drawImage(ch, sx, sy, cw, sh, -cw / 2, -sh / 2, cw, sh); }
        ctx.restore();
      }
      // glowing ember rim at the burn front
      if (c > 0 && u <= 0) { ctx.fillStyle = `rgba(255,140,40,${0.8 * c})`; ctx.fillRect(x0 + i * cw + cw - 4, y0 + 14, 5, KING.chh - 28); K.flame(x0 + i * cw + cw, ky - 40 + rnd(i) * 80, 0.5 * c, t, i); }
    }
    sparks(t, 540, 1000, 700, 30, 7, 500, '255,170,80');
    // ash flecks drifting up
    for (let i = 0; i < 26; i++) { const ph = (lt * 0.5 + rnd(i * 3)) % 1; ctx.fillStyle = `rgba(190,180,170,${0.5 * (1 - ph) * seg(lt, 0.2, 0.6)})`; ctx.fillRect(220 + rnd(i) * 640 + Math.sin(t * 2 + i) * 20, 1080 - ph * 500, 4, 3); }
    // final: AAZHI etched tag + FOLLOW
    const f = seg(lt, 1.05, 1.35);
    if (f > 0) { const st = stamp(lt, 1.05, 0.28); tag('AAZHI', 540, 960, st.s, st.a, TUR, 92); tag('FOLLOW', 540, 1110, 1, eo(seg(lt, 1.35, 1.6)) * (0.85 + 0.15 * Math.sin(t * 6)), RED, 42); }
    calmCaptionZone();
  } });
  cue(tKing, 'whoosh', { gain: 0.4 }); cue(tKing + 0.1, 'sizzle', { gain: 0.6, dur: 1.2 }); cue(tKing + 1.05, 'slam', { gain: 0.6 }); cue(Math.max(tKing + 0.4, END - 1.6), 'swell', { gain: 0.6, dur: 1.6 });
}
