// EPISODE 11 · worker A : "Living Mosaic", lines 0-4 (hook: Tamil port traded with Rome then vanished, Muziris/Muciri/Chera,
// Sangam poem: Yavana ships gold in / pepper out, Pliny: nearest market + pirates, ships anchored far out + small boats)
// Engine (all local): one fixed tile grid (24 px cells). A picture = vector shapes painted once onto a small canvas, sampled
// ONE colour per cell, baked into a cached tile layer. Per frame: blit the layer (clipped by run-length Path2D masks) and draw
// only the moving tiles (assembly / loss / flip bands, ripple crests, glints). Moving objects = baked mosaic sprites.
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { poly } from './art.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs, floor = Math.floor;
const P = {
  lap: '#1F4E8C', sea: '#2E6DB4', sky: '#7FB2E0', crest: '#F4F1E8', ter: '#B5552F', ter2: '#D9794A', pep: '#232020', vine: '#2E3A24',
  gold: '#D9A63A', gold2: '#F3CF6B', red: '#9E2A2B', mud: '#8C6A3A', mud2: '#B08A52', grn: '#4E7A3A', grn2: '#7FA65A',
  m1: '#E9DFC9', m2: '#D8CBB0', m3: '#F4EEDF', grout: '#2A2622', mortar: '#6E6A62', wood: '#6E4526', wood2: '#8E5E34', skin: '#C98A5E',
};

// ───────────────────────────── the tile grid ─────────────────────────────
const TS = 24, COLS = 47, ROWS = 82, GX = -24, GY = -24, N = COLS * ROWS, GW = COLS * TS, GH = ROWS * TS;
const CX = new Float32Array(N), CY = new Float32Array(N), JX = new Float32Array(N), JY = new Float32Array(N), JR = new Float32Array(N), JS = new Float32Array(N), JH = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const c = i % COLS, r = (i / COLS) | 0;
  CX[i] = GX + c * TS + TS / 2; CY[i] = GY + r * TS + TS / 2;
  JX[i] = (rnd(i * 1.31 + 2) - 0.5) * 2.6; JY[i] = (rnd(i * 2.77 + 5) - 0.5) * 2.6; JR[i] = (rnd(i * 3.91 + 1) - 0.5) * 0.15;
  JS[i] = TS - 3.4 - rnd(i * 5.13) * 2.6; JH[i] = (rnd(i * 7.07 + 3) - 0.5) * 0.17;
}
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };

/** run cells of the paint callback (world coords) as exact cell squares: fn(i, x, y) -> colour | null */
function cells(fn) { for (let i = 0; i < N; i++) { const col = fn(i, CX[i], CY[i]); if (col) { ctx.fillStyle = col; ctx.fillRect(CX[i] - TS / 2, CY[i] - TS / 2, TS, TS); } } }
const MARB = (i) => { const r = rnd(i * 1.37 + 0.5); return r < 0.55 ? P.m1 : r < 0.82 ? P.m3 : P.m2; };
const SAND = (i) => { const r = rnd(i * 2.13 + 0.7); return r < 0.5 ? P.mud2 : r < 0.8 ? '#C49A5E' : P.m2; };
const GREEN = (i) => { const r = rnd(i * 3.17 + 0.2); return r < 0.45 ? P.grn : r < 0.8 ? P.grn2 : '#3E6A2E'; };
const SEA = (i, x, y) => { const r = rnd(i * 2.71 + 1), b = sin(y * 0.11 + sin(x * 0.017) * 1.6); return (b > 0.82 && r < 0.7) || r < 0.12 ? P.lap : r > 0.965 ? P.sky : P.sea; };
const inY = (y0, y1, f) => (i, x, y) => (y >= y0 && y < y1 ? f(i, x, y) : null);

// ───────────────────────────── pictures ─────────────────────────────
const SQ = 0.5; let SCV = null;
const PICS = new Map(), LAY = new Map();
function pic(key, paint) {
  let p = PICS.get(key); if (p) return p;
  const w = Math.ceil(GW * SQ), h = Math.ceil(GH * SQ);
  if (!SCV) SCV = mk(w, h);
  const x = SCV.getContext('2d', { willReadFrequently: true });
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.setTransform(SQ, 0, 0, SQ, -GX * SQ, -GY * SQ);
  x.lineCap = 'round'; x.lineJoin = 'round';
  const prev = ctx; setCtx(x); try { paint(); } finally { setCtx(prev); }
  const d = x.getImageData(0, 0, w, h).data;
  const A = new Uint8Array(N), css = new Array(N), water = [], gold = [];
  for (let i = 0; i < N; i++) {
    const k = (floor((CY[i] - GY) * SQ) * w + floor((CX[i] - GX) * SQ)) * 4;
    if (d[k + 3] < 128) continue;
    A[i] = 1; const r = d[k], g = d[k + 1], b = d[k + 2], f = 1 + JH[i];
    if (b > r + 50 && b > g + 10) water.push(i);
    if (r > 180 && g > 130 && b < 125 && r - b > 90) gold.push(i);
    css[i] = `rgb(${clamp(r * f, 0, 255) | 0},${clamp(g * f, 0, 255) | 0},${clamp(b * f, 0, 255) | 0})`;
  }
  p = { key, A, css, water: Int32Array.from(water), gold: Int32Array.from(gold) }; PICS.set(key, p); return p;
}
let MORT = null;
function mortarImg() {
  if (MORT) return MORT;
  const c = mk(GW, GH), x = c.getContext('2d');
  x.fillStyle = P.mortar; x.fillRect(0, 0, GW, GH);
  for (let i = 0; i < 9000; i++) { x.fillStyle = i % 3 ? 'rgba(40,36,32,0.18)' : 'rgba(230,224,210,0.16)'; const s = 1 + rnd(i * 3.3) * 2.5; x.fillRect(rnd(i * 1.7) * GW, rnd(i * 2.9) * GH, s, s); }
  x.lineCap = 'round';
  for (let i = 0; i < 70; i++) {   // trowel scratches
    const cx = rnd(i * 4.1) * GW, cy = rnd(i * 5.3) * GH, r = 120 + rnd(i * 6.7) * 380, a0 = rnd(i * 7.9) * TAU;
    x.strokeStyle = i % 2 ? 'rgba(230,224,210,0.10)' : 'rgba(30,26,22,0.16)'; x.lineWidth = 2 + rnd(i * 8.3) * 5;
    x.beginPath(); x.arc(cx, cy, r, a0, a0 + 0.4 + rnd(i * 9.1) * 0.9); x.stroke();
  }
  x.strokeStyle = 'rgba(30,26,22,0.22)'; x.lineWidth = 1.5;   // sockets where tiles were
  x.beginPath(); for (let c2 = 0; c2 <= COLS; c2++) { x.moveTo(c2 * TS, 0); x.lineTo(c2 * TS, GH); } for (let r = 0; r <= ROWS; r++) { x.moveTo(0, r * TS); x.lineTo(GW, r * TS); } x.stroke();
  return (MORT = c);
}
function layer(p) {
  let c = LAY.get(p.key);
  if (c) { LAY.delete(p.key); LAY.set(p.key, c); return c; }
  c = mk(GW, GH); const x = c.getContext('2d');
  x.drawImage(mortarImg(), 0, 0);
  x.fillStyle = P.grout; for (let i = 0; i < N; i++) if (p.A[i]) x.fillRect(CX[i] - GX - TS / 2, CY[i] - GY - TS / 2, TS, TS);
  for (let i = 0; i < N; i++) {
    if (!p.A[i]) continue;
    const co = cos(JR[i]), si = sin(JR[i]), s = JS[i], h = s / 2;
    x.setTransform(co, si, -si, co, CX[i] - GX + JX[i], CY[i] - GY + JY[i]);
    x.fillStyle = p.css[i]; x.fillRect(-h, -h, s, s);
    x.fillStyle = 'rgba(255,255,255,0.17)'; x.fillRect(-h, -h, s, 2.5); x.fillRect(-h, -h, 2.5, s);
    x.fillStyle = 'rgba(0,0,0,0.17)'; x.fillRect(-h, h - 2.5, s, 2.5); x.fillRect(h - 2.5, -h, 2.5, s);
  }
  LAY.set(p.key, c);
  if (LAY.size > 9) { const k = LAY.keys().next().value; LAY.get(k).width = 0; LAY.delete(k); }
  return c;
}
const drawLayer = (p) => ctx.drawImage(layer(p), GX, GY);
const drawMortar = () => ctx.drawImage(mortarImg(), GX, GY);
/** Path2D made of horizontal runs of cells passing test(i) */
function runs(test) {
  const p = new Path2D(); let n = 0;
  for (let r = 0; r < ROWS; r++) {
    let c0 = -1; const b = r * COLS;
    for (let c = 0; c <= COLS; c++) {
      const on = c < COLS && test(b + c);
      if (on) { if (c0 < 0) c0 = c; } else if (c0 >= 0) { p.rect(GX + c0 * TS, GY + r * TS, (c - c0) * TS, TS); c0 = -1; n++; }
    }
  }
  return n ? p : null;
}
function clipDraw(path, fn) { if (!path) return; ctx.save(); ctx.clip(path); fn(); ctx.restore(); }

// loose tiles: composed with the camera matrix (no save/restore per tile)
let M0 = null;
const beginLoose = () => { M0 = ctx.getTransform(); };
const endLoose = () => { ctx.setTransform(M0); ctx.globalAlpha = 1; };
function setM(x, y, rot, sx) {
  const m = M0, co = cos(rot), si = sin(rot), A = co * sx, B = si * sx, C = -si, D = co;
  ctx.setTransform(m.a * A + m.c * B, m.b * A + m.d * B, m.a * C + m.c * D, m.b * C + m.d * D, m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f);
}
function ltile(css, x, y, rot, s, a = 1, sh = 0, sx = 1) {
  const h = s / 2;
  if (sh > 0) { setM(x + sh * 0.4, y + sh, rot, sx); ctx.globalAlpha = a * 0.3; ctx.fillStyle = '#000'; ctx.fillRect(-h, -h, s, s); }
  setM(x, y, rot, sx); ctx.globalAlpha = a; ctx.fillStyle = css; ctx.fillRect(-h, -h, s, s);
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-h, -h, s, 2.5);
}

// ───────────────────────────── devices ─────────────────────────────
const ORD = new Map();
function ord(key, fn) { let o = ORD.get(key); if (!o) { o = new Float32Array(N); for (let i = 0; i < N; i++) o[i] = fn(i, CX[i], CY[i]); ORD.set(key, o); } return o; }
const radial = (x0, y0, J = 0.18) => (i, x, y) => { const d = Math.hypot(x - x0, y - y0) / 1500; return clamp(d * (1 - J) / 0.85 + rnd(i * 6.11) * J, 0, 1); };
const rowsDown = (J = 0.25) => (i, x, y) => clamp((y + 30) / 2000 * (1 - J) + rnd(i * 6.11) * J, 0, 1);
const diag = (J = 0.12) => (i, x, y) => clamp(((x + 30) / 1140 * 0.55 + (y + 30) / 1990 * 0.45) * (1 - J) + rnd(i * 4.37) * J, 0, 1);

/** TILE ASSEMBLY: tiles of p fly in (mode rain|scatter|rise|pop) in order o.ord (0..1) over o.span seconds */
function assemble(p, lt, o) {
  const O = o.ord, t0 = o.t0 || 0, span = o.span, F = o.F || 0.45, A = p.A, mode = o.mode || 'rain';
  (o.under || drawMortar)();
  const done = (i) => lt >= t0 + O[i] * span + (A[i] ? F : 0);
  if (lt >= t0 + span + F) drawLayer(p); else clipDraw(runs(done), () => drawLayer(p));
  if (o.mid) o.mid(done);
  if (lt >= t0 + span + F) return done;
  beginLoose();
  for (let i = 0; i < N; i++) {
    if (!A[i]) continue;
    const s0 = t0 + O[i] * span; if (lt < s0 || lt >= s0 + F) continue;
    const q = (lt - s0) / F, e = eo(q), u = 1 - e;
    let fx, fy;
    if (mode === 'rain') { fx = CX[i] + (rnd(i * 3.3) - 0.5) * 80; fy = CY[i] - 380 - rnd(i * 5.1) * 520; }
    else if (mode === 'rise') { fx = CX[i] + (rnd(i * 3.3) - 0.5) * 500; fy = 1500 + rnd(i * 5.1) * 500; }
    else if (mode === 'pop') { fx = CX[i]; fy = CY[i]; }
    else { fx = CX[i] + (rnd(i * 3.3) - 0.5) * 1300; fy = CY[i] + (rnd(i * 5.1) - 0.5) * 1300; }
    const sc = mode === 'pop' ? eob(q) : 1 + 0.7 * u;
    ltile(A[i] ? p.css[i] : P.m1, lerp(fx, CX[i] + JX[i], e), lerp(fy, CY[i] + JY[i], e), JR[i] + u * (rnd(i * 8.8) - 0.5) * 7, JS[i] * sc, Math.min(1, q * 5), 3 + 16 * u);
  }
  endLoose();
  return done;
}
/** MISSING-TILE LOSS: tiles leave at time tf(O[i]) (seconds, relative), pop out and fall away leaving bare mortar */
function lose(p, lt, O, tf, F = 0.9, after) {
  const A = p.A;
  const gone = (i) => A[i] && lt >= tf(O[i]);
  drawLayer(p);
  clipDraw(runs(gone), drawMortar);
  if (after) after(gone);
  beginLoose();
  for (let i = 0; i < N; i++) {
    if (!A[i]) continue;
    const s0 = tf(O[i]); if (lt < s0 || lt >= s0 + F) continue;
    const q = (lt - s0) / F, pop = sin(Math.min(1, q * 4) * PI);
    ltile(p.css[i], CX[i] + (rnd(i * 3.7) - 0.5) * 220 * q, CY[i] - 50 * Math.min(1, q * 4) + 1500 * q * q, JR[i] + (rnd(i * 2.2) - 0.5) * 9 * q,
      JS[i] * (1 + 0.3 * pop + 0.25 * q), 1 - seg(q, 0.7, 1), 4 + 22 * q);
  }
  endLoose();
  return gone;
}
/** TILE TRANSITION: every tile turns over (scale x 1->0->1) on a diagonal delay, from old picture to new */
function flip(old, p, lt, span = 0.55, F = 0.28, after, oldDraw) {
  const O = ord('aflip', diag());
  const st = (i) => O[i] * span;
  if (lt >= span + F) { drawLayer(p); if (after) after(() => true); return; }
  (oldDraw || (() => drawLayer(old)))();
  clipDraw(runs((i) => lt >= st(i) + F), () => drawLayer(p));
  if (after) after((i) => lt >= st(i) + F);
  const band = runs((i) => lt >= st(i) && lt < st(i) + F);
  if (band) { ctx.fillStyle = '#4A443D'; ctx.fill(band); }
  beginLoose();
  for (let i = 0; i < N; i++) {
    const s0 = st(i); if (lt < s0 || lt >= s0 + F) continue;
    const q = (lt - s0) / F, first = q < 0.5, src = first ? old : p;
    if (!src.A[i]) continue;
    ltile(src.css[i], CX[i] + JX[i], CY[i] + JY[i], JR[i], JS[i], 1, 0, Math.max(0.04, abs(cos(PI * q))));
    if (!first) { ctx.globalAlpha = 0.25 * (1 - q); ctx.fillStyle = '#fff'; ctx.fillRect(-JS[i] / 2, -JS[i] / 2, JS[i], JS[i]); }
  }
  endLoose();
}
/** TILE RIPPLE: water tiles shade in travelling wave bands (3 batched fills) */
function ripple(p, t, flt, amp = 1) {
  const a = new Path2D(), b = new Path2D(), c = new Path2D(); let na = 0, nb = 0, nc = 0;
  const w = p.water;
  for (let k = 0; k < w.length; k++) {
    const i = w[k]; if (flt && !flt(i)) continue;
    const x = CX[i], y = CY[i];
    const v = sin(y * 0.052 - t * 2.6 + sin(x * 0.011 + t * 0.6) * 1.8) * 0.7 + sin(x * 0.021 - y * 0.013 + t * 1.4) * 0.3;
    const s = JS[i], X = x + JX[i] - s / 2, Y = y + JY[i] - s / 2;
    if (v > 0.86 * amp + (1 - amp) * 2) { b.rect(X, Y, s, s); nb++; } else if (v > 0.55) { a.rect(X, Y, s, s); na++; } else if (v < -0.74) { c.rect(X, Y, s, s); nc++; }
  }
  if (na) { ctx.fillStyle = P.sky; ctx.globalAlpha = 0.85; ctx.fill(a); }
  if (nb) { ctx.fillStyle = P.crest; ctx.globalAlpha = 0.95; ctx.fill(b); }
  if (nc) { ctx.fillStyle = P.lap; ctx.globalAlpha = 0.9; ctx.fill(c); }
  ctx.globalAlpha = 1;
}
/** SMALTI GLINT: diagonal light sweep across gold tiles (pos along x + 0.5y) + single-tile twinkles */
function glint(p, t, pos, flt, wid = 110) {
  const a = new Path2D(), b = new Path2D(); let na = 0, nb = 0;
  const g = p.gold;
  for (let k = 0; k < g.length; k++) {
    const i = g[k]; if (flt && !flt(i)) continue;
    const d = abs(CX[i] + CY[i] * 0.5 - pos), s = JS[i], X = CX[i] + JX[i] - s / 2, Y = CY[i] + JY[i] - s / 2;
    if (d < wid * 0.45 || sin(t * 2.7 + rnd(i * 9.7) * 80) > 0.985) { a.rect(X, Y, s, s); na++; } else if (d < wid) { b.rect(X, Y, s, s); nb++; }
  }
  if (nb) { ctx.fillStyle = '#FBE6A4'; ctx.globalAlpha = 0.6; ctx.fill(b); }
  if (na) { ctx.fillStyle = '#FFFBEA'; ctx.globalAlpha = 0.9; ctx.fill(a); }
  ctx.globalAlpha = 1;
}

// ───────────────────────────── sprites (baked mosaic cut-outs that move) ─────────────────────────────
const SPR = new Map();
function sprite(key, w, h, ox, oy, paint, ts = TS) {
  let s = SPR.get(key); if (s) return s;
  const q = 0.5, sw = Math.ceil(w * q), sh = Math.ceil(h * q), sc = mk(sw, sh), x = sc.getContext('2d', { willReadFrequently: true });
  x.setTransform(q, 0, 0, q, ox * q, oy * q); x.lineCap = 'round'; x.lineJoin = 'round';
  const prev = ctx; setCtx(x); try { paint(); } finally { setCtx(prev); }
  const d = x.getImageData(0, 0, sw, sh).data;
  const c = mk(w, h), g = c.getContext('2d'), nc = floor(w / ts), nr = floor(h / ts), list = [];
  for (let r = 0; r < nr; r++) for (let cc = 0; cc < nc; cc++) {
    const px = (cc + 0.5) * ts, py = (r + 0.5) * ts, k = (floor(py * q) * sw + floor(px * q)) * 4;
    if (d[k + 3] < 140) continue;
    list.push([px, py, d[k], d[k + 1], d[k + 2], r * 131 + cc]);
  }
  g.fillStyle = P.grout; for (const [px, py] of list) g.fillRect(px - ts / 2 - 1, py - ts / 2 - 1, ts + 2, ts + 2);
  for (const [px, py, r, gg, b, id] of list) {
    const f = 1 + (rnd(id * 7.07 + 3) - 0.5) * 0.17, rot = (rnd(id * 3.9) - 0.5) * 0.15, s = ts * 0.86 - rnd(id * 5.1) * ts * 0.1, hh = s / 2;
    g.setTransform(cos(rot), sin(rot), -sin(rot), cos(rot), px + (rnd(id * 1.3) - 0.5) * 2, py + (rnd(id * 2.7) - 0.5) * 2);
    g.fillStyle = `rgb(${clamp(r * f, 0, 255) | 0},${clamp(gg * f, 0, 255) | 0},${clamp(b * f, 0, 255) | 0})`; g.fillRect(-hh, -hh, s, s);
    g.fillStyle = 'rgba(255,255,255,0.17)'; g.fillRect(-hh, -hh, s, 2.5); g.fillStyle = 'rgba(0,0,0,0.17)'; g.fillRect(-hh, hh - 2.5, s, 2.5);
  }
  s = { c, w, h, ox, oy }; SPR.set(key, s); return s;
}
function drawSpr(s, x, y, a = 1, sc = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (sc !== 1) ctx.scale(sc, sc); ctx.globalAlpha *= a;
  ctx.drawImage(s.c, -s.ox, -s.oy); ctx.restore();
}

// ───────────────────────────── mosaic glyphs (5x7 tile font) ─────────────────────────────
const GLY = {
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'], '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  ',': ['00', '00', '00', '00', '11', '01', '10'], '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
};
function glyphTiles(str, cx, cy, pitch, sub, colFn) {
  const gl = [...str].map((ch) => GLY[ch]);
  const wpx = gl.reduce((a, g) => a + g[0].length, 0) + gl.length - 1;
  const x0 = cx - (wpx * pitch) / 2, y0 = cy - 3.5 * pitch, tp = pitch / sub, out = [];
  let col = 0;
  for (const g of gl) {
    for (let r = 0; r < 7; r++) for (let c = 0; c < g[0].length; c++) if (g[r][c] === '1')
      for (let a = 0; a < sub; a++) for (let b = 0; b < sub; b++) {
        const k = out.length;
        out.push({ x: x0 + (col + c) * pitch + (b + 0.5) * tp + (rnd(k * 1.9) - 0.5) * 2, y: y0 + r * pitch + (a + 0.5) * tp + (rnd(k * 2.3) - 0.5) * 2,
          s: tp - 3 - rnd(k * 4.1) * 1.5, bed: tp + 1, rot: (rnd(k * 3.1) - 0.5) * 0.16, css: colFn(k, r, c), k });
      }
    col += g[0].length + 1;
  }
  return out;
}
/** draw glyph tiles flying in: ordF(tile) in 0..1 */
function glyphs(list, lt, t0, span, F, ordF, mode = 'scatter', shine = -1e9, wob = 0) {
  beginLoose();
  // grout bed under settled tiles
  for (const g of list) {
    const s0 = t0 + ordF(g) * span; if (lt < s0) continue;
    const q = Math.min(1, (lt - s0) / F), e = eo(q), u = 1 - e;
    let fx, fy;
    if (mode === 'rise') { fx = g.x + (rnd(g.k * 3.3) - 0.5) * 600; fy = 1550 + rnd(g.k * 5.1) * 400; }
    else { fx = g.x + (rnd(g.k * 3.3) - 0.5) * 1400; fy = g.y + (rnd(g.k * 5.1) - 0.5) * 1400 - 200; }
    const x = lerp(fx, g.x, e), y = lerp(fy, g.y, e) + wob * sin(lt * 3 + g.x * 0.01);
    const d = abs(g.x + g.y * 0.5 - shine);
    if (q > 0.7) { setM(g.x, g.y + wob * sin(lt * 3 + g.x * 0.01), 0, 1); ctx.globalAlpha = (q - 0.7) / 0.3; ctx.fillStyle = P.grout; ctx.fillRect(-g.bed / 2, -g.bed / 2, g.bed, g.bed); }
    ltile(d < 40 ? '#FFF6D6' : d < 90 ? '#F3CF6B' : g.css, x, y, g.rot + u * (rnd(g.k * 8.8) - 0.5) * 8, g.s * (1 + 0.8 * u), Math.min(1, q * 4), 3 + 18 * u);
  }
  endLoose();
}

// ───────────────────────────── labels: marble tablets that drop in ─────────────────────────────
function tablet(txt, x, y, p, o = {}) {
  if (p <= 0) return;
  const size = o.size || 46, font = o.font === 'inter' ? `900 ${size}px Inter` : o.font === 'tam' ? `700 ${size}px NotoTamil` : `700 ${size}px Caladea`;
  ctx.save(); ctx.font = font; ctx.letterSpacing = o.font === 'tam' ? '0px' : `${Math.round(size * 0.06)}px`;
  const tw = ctx.measureText(txt).width, w = tw + size * 1.2 + (o.padX || 0), h = size * (o.font === 'tam' ? 1.9 : 1.55) + (o.padY || 0);
  const e = eo(clamp(p)), sc = lerp(1.35, 1, eob(clamp(p))), yy = y - (1 - e) * 120;
  ctx.translate(x, yy); ctx.rotate((o.rot || 0) * (0.4 + 0.6 * e)); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(p * 4);
  ctx.fillStyle = 'rgba(20,14,10,0.38)'; ctx.beginPath(); ctx.roundRect(-w / 2 + 7, -h / 2 + 11, w, h, 6); ctx.fill();
  ctx.fillStyle = o.bg || P.m3; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 6); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-w / 2 + 4, -h / 2 + 3, w - 8, 3);
  ctx.fillStyle = 'rgba(80,60,40,0.10)'; for (let k = 0; k < 26; k++) ctx.fillRect(-w / 2 + rnd(k * 3.7 + size) * w, -h / 2 + rnd(k * 5.3 + size) * h, 3, 2);
  ctx.strokeStyle = o.ink || P.grout; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 3); ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(42,38,34,0.7)'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 6); ctx.stroke();
  ctx.fillStyle = o.ink || P.grout; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, size * (o.font === 'tam' ? 0.08 : 0.04));
  ctx.restore();
}

// ───────────────────────────── paint kit (world px, drawn into the sample canvas) ─────────────────────────────
function fill(pts, col) { poly(pts); ctx.fillStyle = col; ctx.fill(); }
function stroke(pts, col, w, close = false) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); if (close) ctx.closePath(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
function disc(x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); }
function chequer(x0, y0, x1, y1, c1 = P.ter, c2 = P.m3) {   // chequer band of single cells framed by dark rows
  cells((i, x, y) => {
    if (x < x0 || x >= x1 || y < y0 || y >= y1) return null;
    const c = floor((x - GX) / TS), r = floor((y - GY) / TS), r0 = floor((y0 - GY) / TS), r1 = floor((y1 - GY) / TS) - 1;
    if (r === r0 || r === r1) return P.grout;
    return (c + r) % 2 ? c1 : c2;
  });
}
function frameBand(x0, y0, x1, y1, w = 4) {   // rectangular chequer frame w cells thick
  cells((i, x, y) => {
    if (x < x0 || x >= x1 || y < y0 || y >= y1) return null;
    const c = floor((x - x0) / TS), r = floor((y - y0) / TS), nc = floor((x1 - x0) / TS) - 1, nr = floor((y1 - y0) / TS) - 1;
    const e = Math.min(c, r, nc - c, nr - r); if (e >= w) return null;
    if (e === 0 || e === w - 1) return P.grout;
    return (c + r) % 2 ? P.ter : P.gold;
  });
}
function sun(x, y, r) { disc(x, y, r + 26, P.gold); disc(x, y, r, P.gold2); disc(x - r * 0.25, y - r * 0.25, r * 0.4, '#FBE7A0'); }
function palm(x, y, h, lean = 0.2, s = 1) {
  const tx = x + lean * h, ty = y - h;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * h * 0.2, y - h * 0.6, tx, ty); ctx.strokeStyle = P.grout; ctx.lineWidth = 34 * s; ctx.stroke(); ctx.strokeStyle = P.mud; ctx.lineWidth = 22 * s; ctx.stroke();
  for (let k = 0; k < 7; k++) {
    const a = -PI / 2 + (k - 3) * 0.5, L2 = (120 + (k % 2) * 30) * s;
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(a);
    ctx.beginPath(); ctx.ellipse(L2 / 2, (k - 3) * 6, L2 / 2, 22 * s, 0.35 * Math.sign(k - 3 || 1), 0, TAU); ctx.fillStyle = k % 2 ? P.grn : P.grn2; ctx.fill();
    ctx.restore();
  }
  disc(tx, ty, 16 * s, P.mud);
}
function amph(x, y, s = 1, col = P.ter) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineWidth = 12; ctx.strokeStyle = P.grout;
  ctx.beginPath(); ctx.ellipse(0, -95, 44, 74, 0, 0, TAU); ctx.stroke(); ctx.fillStyle = col; ctx.fill();
  fill([[-18, -36], [18, -36], [0, 6]], col); ctx.fillRect(-14, -200, 28, 50);
  ctx.fillRect(-20, -208, 40, 14);
  ctx.strokeStyle = col; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(-14, -190); ctx.quadraticCurveTo(-52, -190, -40, -150); ctx.moveTo(14, -190); ctx.quadraticCurveTo(52, -190, 40, -150); ctx.stroke();
  ctx.fillStyle = P.ter2; ctx.beginPath(); ctx.ellipse(-14, -110, 10, 36, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function sack(x, y, s = 1, col = P.mud) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, -46, 50, 48, 0, 0, TAU); ctx.fillStyle = P.grout; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -46, 42, 40, 0, 0, TAU); ctx.fillStyle = col; ctx.fill();
  fill([[-16, -86], [16, -86], [24, -110], [-24, -110]], col); ctx.fillStyle = P.grout; ctx.fillRect(-20, -92, 40, 8);
  ctx.restore();
}
function house(x, y, w, h, roof = P.ter) {
  ctx.fillStyle = P.grout; ctx.fillRect(x - 10, y - h - 10, w + 20, h + 20);
  ctx.fillStyle = P.ter2; ctx.fillRect(x, y - h, w, h);
  fill([[x - 26, y - h + 6], [x + w / 2, y - h - 70], [x + w + 26, y - h + 6]], roof);
  ctx.fillStyle = P.pep; ctx.fillRect(x + w * 0.4, y - 60, w * 0.22, 60); ctx.fillRect(x + w * 0.12, y - h + 30, 26, 26);
}
/** Roman merchant ship: origin = waterline centre, faces +x (dir -1 mirrors). opts: sacks, dark (pirate), amph */
function ship(x, y, s = 1, dir = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const dark = o.dark, hullC = dark ? P.pep : P.wood, sail = dark ? '#4A3A34' : P.m3;
  const hull = [[-246, -178], [-268, -150], [-258, -112], [-234, -76], [-205, -36], [-168, 2], [-110, 30], [100, 32], [172, 10], [216, -22], [246, -80], [204, -64], [-188, -64], [-214, -98], [-226, -138], [-226, -166]];
  ctx.lineWidth = 9; ctx.strokeStyle = P.grout; line2([-200, -64], [-168, 52]);
  ctx.fillStyle = P.grout; ctx.fillRect(-12, -410, 24, 350);
  ctx.lineWidth = 16; line2([-178, -386], [178, -386]);
  const sl = [[-164, -376], [164, -376], [154, -126], [-154, -126]];
  poly(sl); ctx.fillStyle = sail; ctx.fill(); ctx.lineWidth = 16; ctx.strokeStyle = P.grout; ctx.stroke();
  if (!dark) { ctx.fillStyle = P.ter; ctx.fillRect(-160, -330, 318, 30); ctx.fillStyle = P.m2; for (const k of [-80, 0, 80]) ctx.fillRect(k - 5, -370, 10, 240); }
  else { ctx.fillStyle = P.red; ctx.fillRect(-160, -300, 318, 34); }
  ctx.lineWidth = 12; ctx.strokeStyle = P.grout; line2([176, -64], [262, -214]);
  poly([[214, -200], [266, -214], [272, -126], [222, -120]]); ctx.fillStyle = sail; ctx.fill(); ctx.lineWidth = 10; ctx.stroke();
  if (o.sacks) for (let k = 0; k < 6; k++) sack(-150 + k * 56, -58, 0.62, k % 2 ? P.mud : '#7A5A30');
  if (o.amph) for (let k = 0; k < 5; k++) amph(-140 + k * 62, -58, 0.42, k % 2 ? P.ter : P.ter2);
  poly(hull); ctx.fillStyle = P.grout; ctx.lineWidth = 22; ctx.strokeStyle = P.grout; ctx.stroke(); ctx.fillStyle = hullC; ctx.fill();
  ctx.save(); poly(hull); ctx.clip(); ctx.fillStyle = dark ? P.red : P.ter; ctx.fillRect(-300, -46, 600, 22); ctx.fillStyle = dark ? '#151313' : '#4E3018'; ctx.fillRect(-300, 6, 600, 40); ctx.restore();
  if (!dark) disc(-236, -168, 14, P.gold);
  ctx.restore();
}
function line2(a, b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
function boat(x, y, s = 1, o = {}) {   // small cargo boat (or dark pirate boat)
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s);
  const dark = o.dark;
  if (dark) {
    ctx.lineWidth = 10; ctx.strokeStyle = P.grout; line2([0, -40], [0, -230]);
    fill([[6, -226], [120, -60], [6, -60]], '#3A2E2A'); ctx.fillStyle = P.red; fill([[6, -170], [70, -100], [6, -100]], P.red);
    ctx.lineWidth = 8; for (const k of [-80, -30, 30]) line2([k, -20], [k - 40, 40]);
  } else if (o.amph) { for (let k = 0; k < 3; k++) amph(-60 + k * 52, -34, 0.36, k % 2 ? P.ter : P.ter2); }
  else { for (let k = 0; k < 3; k++) sack(-56 + k * 50, -32, 0.5); }
  const hull = [[-130, -50], [-112, -10], [-80, 14], [80, 14], [116, -12], [140, -56], [-130, -50]];
  poly(hull); ctx.lineWidth = 18; ctx.strokeStyle = P.grout; ctx.stroke(); ctx.fillStyle = dark ? P.pep : P.wood2; ctx.fill();
  if (!dark) { ctx.fillStyle = P.ter; ctx.fillRect(-120, -36, 250, 12); disc(-102, -70, 20, P.grout); disc(98, -70, 20, P.grout); }
  ctx.restore();
}
function vine(x0, y0, y1, side = 1, seed = 0) {   // pepper vine climbing up a stake / tree: stem, heart leaves, berry spikes
  const pts = []; for (let y = y1; y >= y0; y -= 20) pts.push([x0 + sin(y * 0.016 + seed) * 46, y]);
  stroke(pts, P.grout, 30); stroke(pts, P.vine, 18);
  let k = 0;
  for (let y = y1 - 60; y > y0 + 30; y -= 74, k++) {
    const sx = x0 + sin(y * 0.016 + seed) * 46, d = (k % 2 ? 1 : -1);
    ctx.save(); ctx.translate(sx + d * 60, y); ctx.rotate(d * 0.5);
    ctx.beginPath(); ctx.ellipse(0, 0, 58, 36, 0, 0, TAU); ctx.fillStyle = P.grout; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 48, 28, 0, 0, TAU); ctx.fillStyle = k % 3 ? P.grn : P.grn2; ctx.fill();
    ctx.restore();
    if (k % 2 === 0) {   // hanging berry spike
      const bx = sx - d * 44, by = y + 6;
      for (let j = 0; j < 6; j++) disc(bx + (j % 2 ? 9 : -9), by + j * 22, 13, (j + k + seed) % 4 === 0 ? P.grn : P.pep);
    }
  }
}
function toga(x, y, s = 1) {   // generic faceless Roman figure in a toga holding a scroll (feet at x, y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const out = (pts, col, w = 22) => { poly(pts); ctx.lineWidth = w; ctx.strokeStyle = P.grout; ctx.stroke(); ctx.fillStyle = col; ctx.fill(); };
  out([[-150, -20], [-120, -560], [-70, -640], [70, -640], [130, -560], [160, -20]], P.m3);                       // tunic/toga body
  out([[-70, -640], [80, -630], [150, -470], [40, -300], [-40, -150], [-110, -330]], '#E2D6BD');                   // draped sinus
  ctx.lineWidth = 12; ctx.strokeStyle = P.m2; for (const k of [0, 1, 2]) line2([-90 + k * 50, -480 + k * 40], [30 + k * 40, -40]);
  ctx.lineWidth = 26; ctx.strokeStyle = P.red; line2([-70, -636], [150, -470]); line2([150, -470], [44, -300]);    // stripe of the toga
  out([[-150, -20], [-60, -20], [-70, 0], [-160, 0]], P.mud, 12); out([[60, -20], [160, -20], [170, 0], [70, 0]], P.mud, 12);
  ctx.lineWidth = 46; ctx.strokeStyle = P.grout; line2([-120, -540], [-40, -380]); ctx.lineWidth = 30; ctx.strokeStyle = P.skin; line2([-120, -540], [-40, -380]);
  ctx.save(); ctx.translate(-10, -372); ctx.rotate(-0.25);                                                           // the scroll
  ctx.fillStyle = P.grout; ctx.fillRect(-90, -30, 180, 60); ctx.fillStyle = P.m1; ctx.fillRect(-80, -22, 160, 44);
  disc(-88, 0, 34, P.grout); disc(-88, 0, 24, P.gold); disc(88, 0, 34, P.grout); disc(88, 0, 24, P.gold); ctx.restore();
  out([[-30, -700], [30, -700], [36, -636], [-36, -636]], P.skin, 16);                                               // neck
  ctx.beginPath(); ctx.ellipse(0, -760, 62, 76, 0, 0, TAU); ctx.lineWidth = 22; ctx.strokeStyle = P.grout; ctx.stroke(); ctx.fillStyle = P.skin; ctx.fill(); // head (faceless)
  ctx.beginPath(); ctx.ellipse(0, -800, 66, 44, 0, PI, TAU); ctx.fillStyle = P.pep; ctx.fill();                       // hair cap
  ctx.restore();
}

// ───────────────────────────── picture painters ─────────────────────────────
function paintOpen() {
  cells(MARB);
  chequer(-30, 300, 1110, 372, P.ter, P.m3);
  chequer(-30, 948, 1110, 1020, P.ter, P.m3);
  cells(inY(1020, 1260, SEA));
  cells(inY(1260, 1300, () => P.grout));
  ship(830, 1170, 0.36, -1);
  chequer(-30, 1830, 1110, 1902, P.lap, P.m3);
}
function paintHarb(withShip) {
  cells(MARB);
  sun(790, 300, 92);
  fill([[-40, 640], [-40, 520], [120, 470], [260, 540], [380, 500], [520, 600], [560, 640]], P.grn);
  fill([[600, 640], [700, 520], [840, 470], [960, 520], [1120, 470], [1120, 640]], '#3E6A2E');
  cells(inY(636, 1170, SEA));
  // right bank with the port
  fill([[560, 700], [700, 660], [1120, 640], [1120, 1010], [980, 960], [820, 860], [640, 760]], P.mud2);
  cells((i, x, y) => (y > 650 && y < 1000 && x > 560 && (x - 560) * 0.62 > (y - 650) * 0.95 - 120 && y < 650 + (x - 560) * 0.62 + 40 ? SAND(i) : null));
  house(650, 740, 110, 110, P.ter); house(790, 800, 130, 140, P.red); house(950, 820, 130, 120, P.ter);
  amph(735, 850, 0.4); amph(780, 862, 0.4, P.ter2); sack(1040, 900, 0.6);
  // left spit with palms
  fill([[-40, 760], [120, 730], [260, 770], [190, 800], [-40, 820]], P.mud2);
  palm(40, 780, 260, 0.2); palm(150, 776, 210, -0.25, 0.85);
  if (withShip) ship(400, 1040, 0.9, 1);
  // quay
  cells(inY(1170, 1300, (i, x, y) => { const r = floor((y - GY) / TS); return r % 3 === 1 ? P.m2 : rnd(i * 4.4) < 0.15 ? P.m2 : P.m1; }));
  cells(inY(1166, 1190, () => P.grout));
  for (let k = 0; k < 6; k++) amph(560 + k * 80, 1290, 0.62, k % 2 ? P.ter : P.ter2);
  sack(110, 1290, 1); sack(230, 1290, 0.85); sack(330, 1290, 0.9, '#7A5A30');
  cells(inY(1300, 1324, () => P.grout));
  chequer(-30, 1820, 1110, 1892, P.ter, P.m3);
}
const coastX = (y) => 470 + (y - 300) * 0.2 + sin(y * 0.011) * 34 + sin(y * 0.031) * 12;
function paintMap() {
  cells((i, x, y) => (x < coastX(y) ? SEA(i, x, y) : GREEN(i)));
  // Western Ghats hills
  cells((i, x, y) => (x > 860 + sin(y * 0.01) * 50 ? (rnd(i * 5.5) < 0.6 ? '#3E6A2E' : P.mud) : null));
  // the Periyar river + a backwater lagoon at the mouth
  const ry = 820; const rp = []; for (let x = 1130; x >= coastX(ry) - 10; x -= 20) rp.push([x, ry - 120 * Math.max(0, (x - 650) / 480) + sin(x * 0.02) * 30]);
  stroke(rp, P.grout, 44); stroke(rp, P.sea, 26);
  ctx.beginPath(); ctx.ellipse(coastX(ry) + 40, ry + 60, 26, 120, 0.2, 0, TAU); ctx.fillStyle = P.sea; ctx.fill();
  // beach line
  const bl = []; for (let y = -40; y < 1980; y += 20) bl.push([coastX(y) + 10, y]); stroke(bl, P.mud2, 22);
  // the pin
  const px = coastX(ry) + 22;
  disc(px, ry - 4, 44, P.grout); disc(px, ry - 4, 34, P.gold2); disc(px, ry - 4, 12, P.red);
}
function paintVine() {
  cells(MARB);
  frameBand(-30, -30, 1110, 1950, 2);
  vine(150, 80, 1290, 1, 0); vine(930, 80, 1290, -1, 2.2);
  disc(540, 600, 360, P.grout); disc(540, 600, 346, P.gold); disc(540, 600, 318, P.grout); disc(540, 600, 306, P.lap);
  cells((i, x, y) => (Math.hypot(x - 540, y - 600) < 296 && rnd(i * 2.9) < 0.28 ? P.sea : null));
  cells(inY(1290, 1330, () => P.grout));
  cells(inY(1330, 1950, (i, x) => (x > 20 && x < 1060 ? SAND(i) : null)));
}
function paintBanner0() {
  cells(MARB);
  cells(inY(1060, 1290, SEA));
  ship(860, 1200, 0.4, -1);
  cells(inY(1290, 1950, (i, x, y) => { const r = floor((y - GY) / TS); return r % 3 === 1 ? P.m2 : P.m1; }));
  cells(inY(1286, 1310, () => P.grout));
  ctx.fillStyle = P.grout; ctx.fillRect(196, 120, 52, 1190); ctx.fillStyle = P.wood2; ctx.fillRect(206, 130, 32, 1170);
  disc(222, 120, 40, P.grout); disc(222, 120, 30, P.gold);
  chequer(-30, 1820, 1110, 1892, P.red, P.m3);
}
function paintBanner() {   // sprite: red banner with the Chera bow + arrow (local origin = top-left)
  ctx.fillStyle = P.grout; ctx.fillRect(0, 0, 696, 744);
  fill([[12, 12], [684, 12], [684, 732], [348, 640], [12, 732]], P.red);
  cells2(12, 12, 684, 732, (i) => (rnd(i * 3.3) < 0.18 ? '#8A2324' : null));
  ctx.lineWidth = 24; ctx.strokeStyle = P.gold; stroke([[12, 40], [684, 40]], P.gold, 26); stroke([[12, 40], [684, 40]], P.gold, 26);
  // the bow (vertical, belly to the right) + string + arrow
  ctx.beginPath(); ctx.moveTo(250, 120); ctx.quadraticCurveTo(560, 370, 250, 620); ctx.strokeStyle = P.grout; ctx.lineWidth = 64; ctx.stroke(); ctx.strokeStyle = P.gold; ctx.lineWidth = 40; ctx.stroke();
  stroke([[250, 120], [250, 620]], P.m3, 14);
  stroke([[130, 370], [560, 370]], P.grout, 30); stroke([[130, 370], [560, 370]], P.m3, 16);
  fill([[540, 330], [630, 370], [540, 410]], P.gold2);
  fill([[120, 340], [170, 370], [120, 400], [90, 400], [130, 370], [90, 340]], P.m3);
  for (let k = 0; k < 8; k++) disc(40 + k * 88, 700 - (k < 4 ? k : 7 - k) * 22, 14, P.gold2);
}
function cells2(x0, y0, x1, y1, fn) { let i = 0; for (let y = y0; y < y1; y += TS) for (let x = x0; x < x1; x += TS, i++) { const c = fn(i); if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, TS, TS); } } }
function paintPoem() {
  cells(MARB);
  frameBand(72, 312, 1008, 1272, 3);
  cells((i, x, y) => (x > 144 && x < 936 && y > 384 && y < 720 ? (rnd(i * 1.9) < 0.7 ? P.m3 : P.m1) : null));
  cells((i, x, y) => (x > 144 && x < 936 && y >= 720 && y < 744 ? P.grout : null));
  cells((i, x, y) => (x > 144 && x < 936 && y >= 744 && y < 1200 ? (y < 900 ? (rnd(i * 2.2) < 0.5 ? '#E9C88A' : P.m3) : SEA(i, x, y)) : null));
  ctx.save(); ctx.beginPath(); ctx.rect(144, 744, 792, 160); ctx.clip(); sun(540, 900, 100); ctx.restore();
  ship(330, 1010, 0.32, 1); ship(760, 1110, 0.24, 1);
}
function paintSeaWide() {
  cells(MARB);
  cells(inY(430, 1960, SEA));
  cells(inY(430, 454, (i) => (rnd(i * 3.1) < 0.6 ? P.lap : null)));
}
function paintQuay() {
  cells(MARB);
  cells(inY(380, 900, SEA));
  ship(330, 860, 1.25, 1, { amph: true });
  cells(inY(900, 1300, (i, x, y) => { const r = floor((y - GY) / TS), c = floor((x - GX + (r % 2) * TS) / (2 * TS)); return (r % 3 === 0) ? P.m2 : (c + r) % 5 === 0 ? P.m2 : P.m1; }));
  cells(inY(896, 920, () => P.grout));
  // the chest that catches the gold
  fill([[560, 1060], [900, 1060], [880, 1260], [580, 1260]], P.grout); fill([[576, 1074], [884, 1074], [866, 1246], [594, 1246]], P.wood2);
  ctx.fillStyle = P.gold; ctx.fillRect(580, 1120, 300, 18); ctx.fillRect(580, 1200, 296, 18);
  amph(130, 1270, 0.6); amph(220, 1280, 0.6, P.ter2); amph(950, 1280, 0.55);
  cells(inY(1300, 1324, () => P.grout));
  cells(inY(1324, 1960, (i, x, y) => { const r = floor((y - GY) / TS); return r % 3 === 1 ? P.m2 : P.m1; }));
}
function paintPep() {
  cells(MARB);
  cells(inY(560, 1150, SEA));
  sun(220, 380, 70);
  // tree trunk + vine on the right
  ctx.fillStyle = P.grout; ctx.fillRect(816, -40, 112, 1260); ctx.fillStyle = P.mud; ctx.fillRect(828, -40, 88, 1260);
  ctx.fillStyle = '#6E5230'; for (let y = 0; y < 1200; y += 70) ctx.fillRect(836, y, 30, 16);
  vine(870, 40, 1180, -1, 1.3);
  cells(inY(1150, 1300, (i, x, y) => { const r = floor((y - GY) / TS); return r % 3 === 1 ? P.m2 : P.m1; }));
  cells(inY(1146, 1170, () => P.grout));
  sack(700, 1290, 1.1); sack(980, 1300, 0.9, '#7A5A30');
  cells(inY(1300, 1324, () => P.grout));
  cells(inY(1324, 1960, (i) => (rnd(i * 2.4) < 0.8 ? P.m1 : P.m2)));
}
function paintRome() {
  cells(MARB);
  fill([[110, 220], [970, 220], [970, 860], [110, 860]], P.ter2);
  cells((i, x, y) => (x > 110 && x < 970 && y > 220 && y < 860 && rnd(i * 2.6) < 0.25 ? P.ter : null));
  // temple
  fill([[190, 470], [540, 300], [890, 470]], P.grout); fill([[220, 456], [540, 322], [860, 456]], P.m3);
  disc(540, 408, 34, P.gold); disc(540, 408, 20, P.gold2);
  ctx.fillStyle = P.grout; ctx.fillRect(196, 456, 688, 44); ctx.fillStyle = P.m2; ctx.fillRect(206, 466, 668, 26);
  for (let k = 0; k < 6; k++) { const x = 236 + k * 122; ctx.fillStyle = P.grout; ctx.fillRect(x - 8, 500, 64, 290); ctx.fillStyle = P.crest; ctx.fillRect(x, 500, 48, 290); ctx.fillStyle = P.m2; ctx.fillRect(x + 32, 500, 12, 290); }
  ctx.fillStyle = P.grout; ctx.fillRect(170, 790, 740, 80); ctx.fillStyle = P.m1; ctx.fillRect(180, 798, 720, 22); ctx.fillStyle = P.m2; ctx.fillRect(170, 822, 740, 22); ctx.fillStyle = P.m1; ctx.fillRect(160, 846, 760, 22);
  frameBand(86, 196, 994, 884, 1);
  // scroll sheet (abstract writing appears as loose tiles)
  ctx.fillStyle = P.grout; ctx.fillRect(160, 930, 760, 330); ctx.fillStyle = P.m3; ctx.fillRect(172, 942, 736, 306);
  for (const x of [150, 930]) { disc(x, 930, 40, P.grout); disc(x, 1260, 40, P.grout); ctx.fillStyle = P.grout; ctx.fillRect(x - 40, 930, 80, 330); ctx.fillStyle = P.ter; ctx.fillRect(x - 28, 930, 56, 330); disc(x, 920, 26, P.gold); disc(x, 1270, 26, P.gold); }
  cells(inY(1330, 1960, (i) => (rnd(i * 2.4) < 0.8 ? P.m1 : P.m2)));
}
function paintPliny() {
  cells(MARB);
  ctx.beginPath(); ctx.moveTo(190, 1280); ctx.lineTo(190, 560); ctx.arc(540, 560, 350, PI, 0); ctx.lineTo(890, 1280); ctx.closePath();
  ctx.fillStyle = P.grout; ctx.fill();
  ctx.beginPath(); ctx.moveTo(214, 1280); ctx.lineTo(214, 560); ctx.arc(540, 560, 326, PI, 0); ctx.lineTo(866, 1280); ctx.closePath(); ctx.fillStyle = P.gold; ctx.fill();
  ctx.beginPath(); ctx.moveTo(244, 1280); ctx.lineTo(244, 560); ctx.arc(540, 560, 296, PI, 0); ctx.lineTo(836, 1280); ctx.closePath(); ctx.fillStyle = P.lap; ctx.fill();
  cells((i, x, y) => (abs(x - 540) < 290 && y > 300 && y < 1270 && Math.hypot(x - 540, Math.min(0, y - 560)) < 290 && rnd(i * 2.9) < 0.25 ? P.sea : null));
  toga(540, 1240, 1.12);
  cells(inY(1270, 1310, () => P.grout));
  cells(inY(1310, 1960, (i, x, y) => { const r = floor((y - GY) / TS); return r % 3 === 1 ? P.m2 : P.m1; }));
}
function paintPirate() {
  cells(MARB);
  cells(inY(360, 1960, SEA));
  fill([[700, 360], [820, 300], [940, 320], [1120, 280], [1120, 360]], P.grn);
  ship(540, 900, 0.95, 1);
}
function paintFar(close) {
  cells(MARB);
  if (!close) sun(260, 420, 80); else sun(200, 330, 70);
  cells(inY(560, 1150, SEA));
  if (!close) { ship(730, 610, 0.36, -1); stroke([[660, 600], [680, 640], [700, 700]], P.grout, 10); }
  else { ship(760, 760, 0.72, -1); ctx.lineWidth = 12; stroke([[600, 730], [620, 800], [640, 880]], P.grout, 12); }
  cells(inY(1150, 1960, SAND));
  cells(inY(1146, 1168, (i) => (rnd(i * 3.7) < 0.7 ? P.crest : P.sky)));
  if (!close) { palm(90, 1200, 300, 0.15); palm(210, 1190, 240, -0.2, 0.85); house(300, 1240, 120, 100); house(960, 1250, 110, 100, P.red); }
  else { palm(60, 1240, 320, 0.12); house(860, 1260, 140, 110, P.red); for (let k = 0; k < 4; k++) amph(250 + k * 70, 1280, 0.5, k % 2 ? P.ter : P.ter2); sack(560, 1280, 0.8); }
}

// sprites
const SHIP_W = 600, SHIP_H = 470, SHIP_OX = 300, SHIP_OY = 430;
const shipSpr = (key, s, o = {}, dir = 1) => sprite('a' + key, SHIP_W * s + 24, SHIP_H * s + 24, SHIP_OX * s + 12, SHIP_OY * s + 12, () => ship(0, 0, s, dir, o), Math.max(12, Math.round(24 * Math.min(1, s * 1.15))));
const boatSpr = (key, o = {}) => sprite('a' + key, 320, 280, 160, 60 + 160, () => boat(0, 0, 1, o), 16);

// ───────────────────────────── the shots ─────────────────────────────
export function buildA(add, cue) {
  const A1 = 0, A2 = Wd('tamil', 0) - 0.1, A3 = Wd('vanished', 0) - 0.1, A4 = Wd('no', 0) - 0.15, A5 = L(1), A6 = Wd('tamil', 1),
    A7 = Wd('port', 1) - 0.27, A8 = L(2), A9 = Wd('ships', 2) - 0.15, A10 = Wd('arriving', 2) - 0.1, A11 = Wd('leaving', 2) - 0.11,
    A12 = L(3), A13 = Wd('pliny', 3) - 0.1, A14 = Wd('warned', 3) - 0.25, A15 = L(4), A16 = Wd('cargo', 4) - 0.15;

  const OPEN = () => pic('aOpen', paintOpen), HARB0 = () => pic('aHarb0', () => paintHarb(false)), HARB1 = () => pic('aHarb1', () => paintHarb(true));
  const MAP = () => pic('aMap', paintMap), VINE = () => pic('aVine', paintVine), BAN0 = () => pic('aBan0', paintBanner0), POEM = () => pic('aPoem', paintPoem);
  const SEAW = () => pic('aSeaW', paintSeaWide), QUAY = () => pic('aQuay', paintQuay), PEP = () => pic('aPep', paintPep), ROME = () => pic('aRome', paintRome);
  const PLIN = () => pic('aPliny', paintPliny), PIR = () => pic('aPir', paintPirate), FAR = () => pic('aFar', () => paintFar(false)), NEAR = () => pic('aNear', () => paintFar(true));

  // ── a1: "2,000 YEARS AGO" - the marble floor rains in tile by tile, lapis digits fly together ──
  const DIG = [];
  const digits = () => DIG.length ? DIG : DIG.push(...glyphTiles('2,000', 540, 620, 32, 2, (k) => (rnd(k * 7.7) < 0.12 ? P.sea : P.lap))) && DIG;
  add({ id: 'a1', at: A1, cam: [540, 640], zoom: 0.07, note: 'marble floor rains in tile by tile, lapis mosaic digits 2,000 fly together, YEARS AGO tablet drops, sea strip ripples',
    draw(lt, d, t) {
      const p = OPEN();
      assemble(p, lt, { ord: ord('a1', radial(540, 640)), span: 1.0, F: 0.5, mode: 'rain', mid: (done) => ripple(p, t, done) });
      glyphs(digits(), lt, 0.15, 1.0, 0.55, (g) => clamp((g.x - 80) / 920 * 0.8 + rnd(g.k * 1.7) * 0.2), 'scatter', lerp(-200, 1700, seg(lt, 1.4, 2.2)));
      tablet('YEARS AGO', 540, 840, seg(lt, Wd('years', 0) - 0.15, Wd('years', 0) + 0.3), { font: 'inter', size: 84 });
    } });
  cue(0.05, 'swell', { gain: 0.5 }); for (const x of [0.3, 0.55, 0.8, 1.05]) cue(x, 'tock', { gain: 0.35 }); cue(Wd('years', 0) - 0.1, 'thud', { gain: 0.5 }); cue(1.6, 'sparkle', { gain: 0.35 });

  // ── a2: the harbour rains in over the floor; a Roman ship glides into port ──
  const SH09 = () => shipSpr('Ship09', 0.9);
  add({ id: 'a2', at: A2, cam: [540, 900], zoom: 0.06, note: 'harbour mosaic rains in row by row over the floor (sun, palms, terracotta port, lapis sea, quay with amphorae); Roman ship sails in from the left; sea ripples',
    draw(lt, d, t) {
      const p = HARB0(), dur = A3 - A2;
      assemble(p, lt, { ord: ord('a2', rowsDown()), span: 0.9, F: 0.45, mode: 'rain', under: () => { drawLayer(OPEN()); glyphs(digits(), 9, 0, 1, 0.5, () => 0); tablet('YEARS AGO', 540, 840, 1, { font: 'inter', size: 84 }); }, mid: (done) => { ripple(p, t, done); glint(p, t, lerp(200, 1500, seg(lt, 0.9, 1.9)), done); } });
      const k = eo(seg(lt, 0.25, dur));
      drawSpr(SH09(), lerp(-320, 400, k), 1040 + sin(t * 2.2) * 4, 1, 1, sin(t * 1.7) * 0.012);
      tablet('MALABAR COAST · INDIA', 540, 170, seg(lt, 0.5, 0.85), { size: 40 });
    } });
  cue(A2, 'whoosh', { gain: 0.4 }); for (const x of [0.2, 0.45, 0.7]) cue(A2 + x, 'tock', { gain: 0.3 }); cue(Wd('rome', 0), 'bell', { gain: 0.35 });

  // ── a3: VANISHED - tiles pop out and fall away, bare mortar spreads ──
  const LO = () => ord('a3', (() => {   // blob noise -> rank -> uniform 0..1.9
    const raw = new Float32Array(N); for (let i = 0; i < N; i++) { const x = CX[i], y = CY[i]; raw[i] = sin(x * 0.009 + 1.3) * sin(y * 0.007 + 0.4) + 0.6 * sin(x * 0.021 - y * 0.017 + 2) + 0.5 * rnd(i * 9.3); }
    const idx = Array.from({ length: N }, (_, i) => i).sort((a, b) => raw[b] - raw[a]); const rk = new Float32Array(N); idx.forEach((i, k) => (rk[i] = (k / N) * 1.9));
    return (i) => rk[i];
  })());
  const tLose = (o) => (o < 1 ? o * 1.5 : 1.5 + (o - 1) * 5.5);   // seconds after A3
  add({ id: 'a3', at: A3, cam: [520, 880], zoom: 0.08, note: 'VANISH: harbour tiles pop out in blotches and fall away, leaving bare grey mortar with trowel scratches; sea still ripples where tiles remain',
    draw(lt, d, t) {
      const p = HARB1();
      lose(p, lt + 0.15, LO(), tLose, 0.9, (gone) => ripple(p, t, (i) => !gone(i)));
    } });
  cue(A3, 'rumble', { gain: 0.55 }); for (const x of [0.15, 0.4, 0.7, 1.0, 1.3]) cue(A3 + x, 'plop', { gain: 0.3 });

  // ── a4: NO ONE COULD SAY WHERE - fallen tiles rise into a big '?' over the mortar bed ──
  const QM = []; const qm = () => QM.length ? QM : QM.push(...glyphTiles('?', 540, 640, 72, 3, (k) => (rnd(k * 5.3) < 0.35 ? P.gold2 : P.gold))) && QM;
  add({ id: 'a4', at: A4, cam: [540, 660], zoom: 0.09, note: 'bare mortar with a few remnant harbour tiles still dropping; terracotta tiles rise from below and assemble a big mosaic ?',
    draw(lt, d, t) {
      const p = HARB1(), lt3 = lt + (A4 - A3) + 0.15;
      lose(p, lt3, LO(), tLose, 0.9, (gone) => ripple(p, t, (i) => !gone(i)));
      ctx.fillStyle = `rgba(20,16,12,${0.2 + 0.3 * seg(lt, 0.2, 1.2)})`; ctx.fillRect(-60, -60, W + 120, H + 120);
      glyphs(qm(), lt, 0.3, 0.9, 0.6, (g) => clamp(1 - (g.y - 400) / 480 + rnd(g.k * 3.1) * 0.25 - 0.25), 'rise', lerp(0, 1500, seg(lt, 1.7, 2.6)), 3);
    } });
  cue(A4 + 0.35, 'zip', { gain: 0.3 }); cue(A4 + 1.2, 'tock', { gain: 0.45 }); cue(Wd('where', 0), 'heartbeat', { gain: 0.45 });

  // ── a5: MUZIRIS - a mosaic map of the Malabar coast re-lays itself out from a gold pin at the river mouth ──
  const PX = coastX(820) + 22, PY = 816;
  add({ id: 'a5', at: A5, cam: [PX, PY], zoom: 0.08, note: 'mosaic map (lapis sea west, green Malabar coast, Periyar river) re-lays itself over the mortar, radiating from a gold pin at the river mouth; MUZIRIS tablet drops',
    draw(lt, d, t) {
      const p = MAP();
      assemble(p, lt, { ord: ord('a5', radial(PX, PY, 0.22)), span: 0.75, F: 0.4, mode: 'scatter', under: () => { lose(HARB1(), A5 - A3 + 0.15, LO(), tLose); ctx.fillStyle = 'rgba(20,16,12,0.5)'; ctx.fillRect(-60, -60, W + 120, H + 120); },
        mid: (done) => ripple(p, t, done) });
      beginLoose();   // pulsing ring of gold tiles around the pin
      for (let r = 0; r < 2; r++) { const q = ((lt * 0.9 + r * 0.5) % 1), R = 60 + q * 170; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + r; ltile(P.gold2, PX + cos(a) * R, PY + sin(a) * R, a, 16, (1 - q) * 0.9, 2); } }
      endLoose();
      tablet('MUZIRIS', 540, 300, seg(lt, Wd('muziris', 1) - A5 - 0.12, Wd('muziris', 1) - A5 + 0.25), { font: 'inter', size: 120 });
      tablet('MALABAR COAST', 830, 1140, seg(lt, 0.9, 1.2), { size: 36, rot: -0.03 });
    } });
  cue(A5, 'whoosh', { gain: 0.4 }); cue(A5 + 0.3, 'tock', { gain: 0.3 }); cue(Wd('muziris', 1) - 0.1, 'thud', { gain: 0.55 });

  // ── a6: MUCIRI in Tamil poems - tiles turn over into a lapis roundel framed by pepper vines; Tamil name tablet ──
  add({ id: 'a6', at: A6, cam: [540, 620], zoom: 0.07, note: 'tile flip to a lapis roundel in a gold ring, pepper vines climb both edges; tablet with the Tamil name முசிறி + MUCIRI',
    draw(lt, d, t) {
      const p = VINE();
      flip(MAP(), p, lt, 0.5, 0.28, (done) => { ripple(p, t, done, 0.7); glint(p, t, lerp(0, 1600, seg(lt, 0.6, 1.7)), done); });
      tablet('முசிறி', 540, 560, seg(lt, Wd('muciri', 1) - A6 - 0.35, Wd('muciri', 1) - A6 + 0.05), { font: 'tam', size: 110 });
      tablet('MUCIRI', 540, 730, seg(lt, Wd('muciri', 1) - A6 - 0.1, Wd('muciri', 1) - A6 + 0.25), { size: 54 });
      tablet('TAMIL POEMS', 540, 1180, seg(lt, 0.3, 0.6), { size: 36 });
    } });
  cue(A6, 'whoosh', { gain: 0.35 }); cue(Wd('muciri', 1) - 0.3, 'thud', { gain: 0.45 });

  // ── a7: CHERA KINGS - red banner with the bow and arrow waves on its pole ──
  const BAN = () => sprite('aBanner', 696, 744, 0, 0, paintBanner);
  add({ id: 'a7', at: A7, cam: [520, 620], zoom: 0.07, note: 'tiles flip to a harbour quay; the Chera red banner with a gold bow + arrow waves on its pole (column strips ripple), gold glint sweeps the bow; CHERA KINGS tablet',
    draw(lt, d, t) {
      const p = BAN0();
      flip(VINE(), p, lt, 0.45, 0.25, (done) => ripple(p, t, done));
      const b = BAN(), bx = 246, by = 190, ap = eo(seg(lt, 0.15, 0.7));
      ctx.save(); ctx.translate(bx, by); ctx.scale(ap, 1);
      for (let k = 0; k < 29; k++) {
        const sx = k * 24, dy = sin(k * 0.42 - t * 4.2) * 26 * (k / 29), sh = cos(k * 0.42 - t * 4.2);
        ctx.drawImage(b.c, sx, 0, 24, 744, sx, dy, 24.6, 744);
        if (sh > 0.3) { ctx.fillStyle = `rgba(20,10,8,${(sh - 0.3) * 0.25})`; ctx.fillRect(sx, dy, 24.6, 744); }
        else if (sh < -0.5) { ctx.fillStyle = `rgba(255,240,200,${(-sh - 0.5) * 0.2})`; ctx.fillRect(sx, dy, 24.6, 744); }
      }
      // glint across the bow
      const gp = lerp(-100, 900, seg(lt, 1.0, 1.9));
      ctx.restore();
      ctx.save(); ctx.translate(bx, by); const gx = gp; ctx.fillStyle = 'rgba(255,246,214,0.35)'; ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx + 60, 0); ctx.lineTo(gx - 140, 744); ctx.lineTo(gx - 200, 744); ctx.closePath(); ctx.clip();
      for (let k = 0; k < 29; k++) { const sx = k * 24, dy = sin(k * 0.42 - t * 4.2) * 26 * (k / 29); ctx.globalAlpha = 0.5; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(b.c, sx, 0, 24, 744, sx, dy, 24.6, 744); }
      ctx.restore();
      tablet('CHERA KINGS', 600, 1080, seg(lt, Wd('chera', 1) - A7 - 0.15, Wd('chera', 1) - A7 + 0.2), { font: 'inter', size: 76 });
    } });
  cue(A7, 'whoosh', { gain: 0.35 }); cue(A7 + 0.3, 'slide', { gain: 0.3 }); cue(Wd('chera', 1) - 0.1, 'drum', { gain: 0.5 });

  // ── a8: A SANGAM POEM (paraphrase) - a framed panel; rows of abstract dash-tiles lay themselves above a dawn sea ──
  const VERSE = []; const verse = () => {
    if (VERSE.length) return VERSE;
    for (let r = 0; r < 6; r++) { let x = 196; const y = 432 + r * 46; while (x < 860) { const n = 2 + floor(rnd(r * 17 + x) * 5); for (let k = 0; k < n && x < 880; k++, x += 22) VERSE.push({ x, y, r, k: VERSE.length }); x += 22; } }
    return VERSE;
  };
  add({ id: 'a8', at: A8, cam: [540, 760], zoom: 0.06, note: 'framed chequer panel assembles; rows of abstract dark dash-tiles (no readable text) lay themselves like verse above a sunrise sea with two ships; POEM (PARAPHRASE) tablet',
    draw(lt, d, t) {
      const p = POEM();
      assemble(p, lt, { ord: ord('a8', radial(540, 790, 0.25)), span: 0.6, F: 0.4, mode: 'scatter', under: () => drawLayer(BAN0()), mid: (done) => { ripple(p, t, done); glint(p, t, lerp(0, 1700, seg(lt, 0.9, 1.7)), done); } });
      beginLoose();
      for (const v of verse()) {
        const s0 = 0.5 + v.r * 0.18 + (v.x - 196) / 660 * 0.16; if (lt < s0) continue;
        const q = Math.min(1, (lt - s0) / 0.18);
        ltile(P.pep, v.x, v.y - (1 - eo(q)) * 30, (rnd(v.k * 3.3) - 0.5) * 0.15, 18 * eob(q), 1, 2);
      }
      endLoose();
      tablet('POEM (PARAPHRASE)', 540, 220, seg(lt, 0.25, 0.6), { size: 50 });
    } });
  cue(A8, 'whoosh', { gain: 0.35 }); cue(A8 + 0.3, 'thud', { gain: 0.4 }); for (const x of [0.6, 0.8, 1.0, 1.2, 1.4]) cue(A8 + x, 'tock', { gain: 0.22 });

  // ── a9: YAVANA SHIPS FROM THE WEST - three Roman ships sail in from the left on a rippling sea, monsoon wind rows flow ──
  const SHf = () => shipSpr('ShipF', 0.42), SHm = () => shipSpr('ShipM', 0.66), SHn = () => shipSpr('ShipN', 1.0);
  add({ id: 'a9', at: A9, cam: [540, 760], zoom: 0.07, note: 'wide lapis sea: three Roman merchant ships (near/mid/far) sail in from the left (west), light-blue monsoon wind tile rows stream right; YAVANAS + FROM THE WEST tablets',
    draw(lt, d, t) {
      const p = SEAW();
      flip(POEM(), p, lt, 0.45, 0.25, (done) => ripple(p, t, done));
      beginLoose();   // monsoon wind: rows of light-blue tiles flowing east
      for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) {
        const y = 180 + r * 60, len = 4 + (k % 3), x0 = ((k * 230 + r * 97 + lt * (260 + r * 40)) % 1500) - 300;
        for (let j = 0; j < len; j++) ltile(j === len - 1 ? P.crest : P.sky, x0 + j * 24, y + sin(x0 * 0.01 + r) * 8, 0, 19, 0.85 * Math.min(1, seg(lt, 0.3, 0.6)));
      }
      endLoose();
      const bob = (ph) => sin(t * 2 + ph) * 4;
      drawSpr(SHf(), lerp(120, 420, seg(lt, 0, d)), 610 + bob(1));
      drawSpr(SHm(), lerp(-260, 700, eo(seg(lt, 0.1, d))), 820 + bob(2), 1, 1, sin(t * 1.6) * 0.015);
      drawSpr(SHn(), lerp(-500, 330, eo(seg(lt, 0.3, d))), 1190 + bob(0), 1, 1, sin(t * 1.4) * 0.02);
      tablet('YAVANAS', 540, 200, seg(lt, Wd('yavanas', 2) - A9 - 0.1, Wd('yavanas', 2) - A9 + 0.25), { font: 'inter', size: 100 });
      tablet('FOREIGNERS FROM THE WEST  →', 540, 330, seg(lt, Wd('foreigners', 2) - A9, Wd('foreigners', 2) - A9 + 0.3), { size: 38 });
    } });
  cue(A9, 'whoosh', { gain: 0.4 }); cue(Wd('yavanas', 2) - 0.05, 'thud', { gain: 0.5 }); cue(A9 + 0.4, 'swell', { gain: 0.3 });

  // ── a10: ARRIVING WITH GOLD - gold coin discs pour from the ship into a chest on the quay ──
  const COINS = 46;
  add({ id: 'a10', at: A10, cam: [700, 1000], zoom: 0.07, note: 'quay close: Roman ship with amphorae; round gold tile coins arc from the deck and pile up in a wooden chest, glint sweeps',
    draw(lt, d, t) {
      const p = QUAY();
      flip(SEAW(), p, lt, 0.35, 0.22, (done) => { ripple(p, t, done); glint(p, t, lerp(-200, 1700, seg(lt, 0.7, 1.5)), done); }, () => { drawLayer(SEAW()); drawSpr(SHf(), 420, 610); drawSpr(SHm(), 700, 820); drawSpr(SHn(), 330, 1190); });
      for (let k = 0; k < COINS; k++) {
        const s0 = 0.15 + k * 0.024, q = clamp((lt - s0) / 0.55); if (lt < s0) continue;
        const ex = 600 + rnd(k * 3.3) * 260, ey = 1100 - floor(k / 9) * 9 - rnd(k * 1.7) * 30;
        const x = lerp(420, ex, q), y = lerp(720, ey, q) - sin(q * PI) * (260 + rnd(k * 2.2) * 120);
        const r = 21 + rnd(k * 4.4) * 5, sq = abs(cos(lt * 9 + k)) * (1 - q) + q;
        ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.25, sq), 1);
        ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, TAU); ctx.fillStyle = P.grout; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = P.gold; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, TAU); ctx.fillStyle = sin(t * 5 + k * 2.1) > 0.8 ? '#FFF6D6' : P.gold2; ctx.fill();
        ctx.restore();
      }
    } });
  cue(A10, 'whoosh', { gain: 0.3 }); cue(Wd('gold', 2), 'sparkle', { gain: 0.55 }); for (const x of [0.6, 0.8, 1.0]) cue(A10 + x, 'plop', { gain: 0.25 });

  // ── a11: LEAVING WITH PEPPER - berries drop from the vine into sacks; the ship, laden with sacks, sails off west ──
  const SHS = () => shipSpr('ShipSack', 0.75, { sacks: true }, -1);
  add({ id: 'a11', at: A11, cam: [700, 820], zoom: 0.08, note: 'pepper vine with black berry spikes climbs a tree trunk (right); berry tiles drop into a sack; a ship laden with sacks sails away left (west)',
    draw(lt, d, t) {
      const p = PEP();
      flip(QUAY(), p, lt, 0.35, 0.22, (done) => ripple(p, t, done));
      beginLoose();
      for (let k = 0; k < 26; k++) {
        const s0 = 0.2 + k * 0.07, q = (lt - s0) / 0.6; if (q < 0 || q > 1) continue;
        const x0 = 800 + rnd(k * 2.7) * 140, y0 = 300 + rnd(k * 3.9) * 700;
        ltile(rnd(k) < 0.2 ? P.grn : P.pep, lerp(x0, 700 + (rnd(k * 5) - 0.5) * 30, q), lerp(y0, 1210, q * q), q * 6, 15, 1 - seg(q, 0.85, 1), 3);
      }
      endLoose();
      drawSpr(SHS(), lerp(470, -380, eio(seg(lt, 0.5, d + 0.4))), 1110 + sin(t * 2) * 4, 1, 1, sin(t * 1.5) * 0.015);
      tablet('PEPPER', 760, 420, seg(lt, Wd('pepper', 2) - A11 - 0.1, Wd('pepper', 2) - A11 + 0.25), { font: 'inter', size: 80, rot: 0.03 });
    } });
  cue(A11, 'whoosh', { gain: 0.3 }); for (const x of [0.4, 0.7, 1.0, 1.3]) cue(A11 + x, 'plop', { gain: 0.22 }); cue(Wd('pepper', 2), 'thud', { gain: 0.4 });

  // ── a12: ROMAN WRITERS - a temple facade on Pompeian red; abstract dash-writing lays itself on a scroll ──
  const SCR = []; const scr = () => {
    if (SCR.length) return SCR;
    for (let r = 0; r < 6; r++) { let x = 214; const y = 986 + r * 44; while (x < 860) { const n = 2 + floor(rnd(r * 13 + x * 0.7) * 4); for (let k = 0; k < n && x < 870; k++, x += 22) SCR.push({ x, y, r, k: SCR.length }); x += 22; } }
    return SCR;
  };
  add({ id: 'a12', at: A12, cam: [540, 700], zoom: 0.07, note: 'tiles flip to a white-column Roman temple on a Pompeian-red panel; below, rows of abstract dash-tiles write themselves across a scroll (unreadable); ROME tablet',
    draw(lt, d, t) {
      const p = ROME();
      flip(PEP(), p, lt, 0.45, 0.25, (done) => glint(p, t, lerp(0, 1500, seg(lt, 0.8, 1.7)), done));
      beginLoose();
      for (const v of scr()) {
        const s0 = 0.4 + v.r * 0.2 + (v.x - 214) / 650 * 0.18; if (lt < s0) continue;
        const q = Math.min(1, (lt - s0) / 0.16);
        ltile(P.pep, v.x, v.y, (rnd(v.k * 3.3) - 0.5) * 0.15, 17 * eob(q), 1, 1.5);
      }
      endLoose();
      tablet('ROME', 540, 150, seg(lt, 0.2, 0.5), { font: 'inter', size: 70 });
    } });
  cue(A12, 'whoosh', { gain: 0.35 }); cue(A12 + 0.25, 'thud', { gain: 0.4 }); for (const x of [0.5, 0.75, 1.0, 1.25]) cue(A12 + x, 'tock', { gain: 0.2 });

  // ── a13: PLINY (illustration) - a generic toga figure assembles in an arched niche; India roundel pops for "nearest market" ──
  const IND = () => sprite('aIndia', 264, 264, 132, 132, () => {
    disc(0, 0, 128, P.grout); disc(0, 0, 118, P.gold); disc(0, 0, 104, P.sea);
    fill([[-70, -80], [70, -84], [60, -20], [10, 92], [-20, 30], [-60, -20]], P.grn);
    disc(-26, 24, 16, P.grout); disc(-26, 24, 10, P.gold2);
  }, 12);
  add({ id: 'a13', at: A13, cam: [540, 640], zoom: 0.08, note: 'generic faceless Roman in a toga with a scroll (no portrait) flies together tile by tile in a gold-ringed lapis arch niche; PLINY THE ELDER + ILLUSTRATION tablets; India roundel with a gold pin pops on "nearest market"',
    draw(lt, d, t) {
      const p = PLIN();
      assemble(p, lt, { ord: ord('a13', radial(540, 760, 0.3)), span: 0.75, F: 0.45, mode: 'scatter', under: () => drawLayer(ROME()), mid: (done) => glint(p, t, lerp(-100, 1700, seg(lt, 1.2, 2.4)), done) });
      tablet('PLINY THE ELDER', 540, 160, seg(lt, 0.1, 0.45), { font: 'inter', size: 66 });
      tablet('ILLUSTRATION', 840, 1220, seg(lt, 0.6, 0.9), { size: 32 });
      const ip = seg(lt, Wd('nearest', 3) - A13 - 0.1, Wd('nearest', 3) - A13 + 0.3);
      if (ip > 0) { drawSpr(IND(), 850, 420 + sin(t * 2) * 6, 1, eob(ip), sin(t * 1.3) * 0.05); tablet('NEAREST MARKET', 850, 590, seg(lt, Wd('market', 3) - A13 - 0.1, Wd('market', 3) - A13 + 0.2), { size: 32 }); }
    } });
  cue(A13, 'whoosh', { gain: 0.35 }); cue(A13 + 0.2, 'tock', { gain: 0.3 }); cue(Wd('nearest', 3), 'pop', { gain: 0.45 });

  // ── a14: PIRATES - dark boats creep in on a merchant ship; danger tiles flash red around it ──
  const PB = () => boatSpr('PirBoat', { dark: true }), PBL = () => boatSpr('PirBoatL', { dark: true, dir: -1 });
  add({ id: 'a14', at: A14, cam: [540, 820], zoom: 0.1, note: 'lapis sea with a merchant ship; four dark pepper-black pirate boats creep in from both sides, a ring of red warning tiles pulses; PIRATES tablet',
    draw(lt, d, t) {
      const p = PIR();
      flip(PLIN(), p, lt, 0.4, 0.22, (done) => ripple(p, t, done));
      const k = eo(seg(lt, 0.2, d));
      const boats = [[-200, 620, 210, 700, PB], [1280, 680, 860, 760, PBL], [-260, 1180, 250, 1060, PB], [1300, 1200, 830, 1080, PBL]];
      for (const [x0, y0, x1, y1, sp] of boats) drawSpr(sp(), lerp(x0, x1, k), lerp(y0, y1, k) + sin(t * 3 + x0) * 5, 1, 1, sin(t * 2.5 + y0) * 0.04);
      const pulse = 0.5 + 0.5 * sin(lt * 10);
      if (lt > Wd('pirates', 3) - A14 - 0.2) {
        beginLoose();
        for (let j = 0; j < 30; j++) { const a = j / 30 * TAU, R = 330 + pulse * 20; ltile(j % 2 ? P.red : '#C8403A', 540 + cos(a) * R * 1.1, 760 + sin(a) * R * 0.75, a, 20, 0.5 + 0.5 * pulse, 2); }
        endLoose();
      }
      tablet('PIRATES', 540, 230, seg(lt, Wd('pirates', 3) - A14 - 0.1, Wd('pirates', 3) - A14 + 0.25), { font: 'inter', size: 110, ink: P.red });
    } });
  cue(A14, 'whoosh', { gain: 0.3 }); cue(A14 + 0.3, 'drum', { gain: 0.35 }); cue(Wd('pirates', 3) - 0.05, 'alarm', { gain: 0.45 }); cue(Wd('pirates', 3), 'slam', { gain: 0.45 });

  // ── a15: ANCHORED FAR OUT - wide: the ship rides at anchor near the horizon; a gold tile line measures the distance to the beach ──
  const DOTS = 22;
  add({ id: 'a15', at: A15, cam: [600, 820], zoom: 0.08, note: 'wide: small Roman ship at anchor near the horizon (anchor rope), long rippling sea, sandy beach with palms and huts; a line of gold tiles lays itself from ship to shore; PLINY\'S ACCOUNT tablet',
    draw(lt, d, t) {
      const p = FAR();
      flip(PIR(), p, lt, 0.45, 0.25, (done) => ripple(p, t, done));
      beginLoose();
      for (let k = 0; k < DOTS; k++) {
        const s0 = Wd('far', 4) - A15 - 0.4 + k * 0.045, q = clamp((lt - s0) / 0.25); if (q <= 0) continue;
        const f = k / (DOTS - 1), x = lerp(720, 470, f), y = lerp(680, 1130, f);
        ltile(k % 2 ? P.gold : P.gold2, x, y - (1 - eo(q)) * 40, 0.785, 16 * eob(q), 1, 3);
      }
      endLoose();
      tablet("PLINY'S ACCOUNT", 540, 210, seg(lt, 0.4, 0.75), { size: 44 });
      tablet('FAR OUT', 830, 880, seg(lt, Wd('out', 4) - A15 - 0.1, Wd('out', 4) - A15 + 0.25), { font: 'inter', size: 56, rot: 0.04 });
    } });
  cue(A15, 'whoosh', { gain: 0.3 }); cue(Wd('anchored', 4), 'thud', { gain: 0.45 }); cue(Wd('far', 4), 'zip', { gain: 0.3 });

  // ── a16: SMALL BOATS - closer: little boats ferry amphorae and sacks from the anchored ship to the beach, leaving white wakes ──
  const BA = () => boatSpr('BoatA', { amph: true, dir: -1 }), BS = () => boatSpr('BoatS', { dir: -1 }), BR = () => boatSpr('BoatR', { amph: true });
  add({ id: 'a16', at: A16, cam: [520, 960], zoom: 0.07, note: 'closer: anchored ship on the right; three small boats with amphorae and sacks shuttle diagonally between ship and beach leaving white wake tiles; cargo stacked on the sand',
    draw(lt, d, t) {
      const p = NEAR();
      flip(FAR(), p, lt, 0.4, 0.22, (done) => ripple(p, t, done));
      const paths = [[640, 860, 260, 1120, 0, BA], [700, 960, 420, 1140, 0.35, BS], [300, 1100, 600, 900, 0.15, BR]];
      beginLoose();
      for (const [x0, y0, x1, y1, ph] of paths) {
        for (let j = 1; j < 10; j++) {   // wake tiles trailing behind
          const f = clamp(eio(seg(lt, ph, ph + 2.2)) - j * 0.025); if (f <= 0) continue;
          ltile(j % 3 ? P.crest : P.sky, lerp(x0, x1, f) + (j % 2 ? 26 : -26), lerp(y0, y1, f) + 6, 0, 14, 0.85 * (1 - j / 10));
        }
      }
      endLoose();
      for (const [x0, y0, x1, y1, ph, sp] of paths) { const f = eio(seg(lt, ph, ph + 2.2)); drawSpr(sp(), lerp(x0, x1, f), lerp(y0, y1, f) + sin(t * 3 + x0) * 5, 1, 1, sin(t * 2.6 + x0) * 0.04); }
      tablet('SMALL BOATS', 540, 220, seg(lt, Wd('small', 4) - A16 - 0.1, Wd('small', 4) - A16 + 0.25), { font: 'inter', size: 72 });
    } });
  cue(A16, 'slide', { gain: 0.3 }); cue(A16 + 0.4, 'bubbles', { gain: 0.3 }); cue(Wd('boats', 4), 'plop', { gain: 0.35 });
}
