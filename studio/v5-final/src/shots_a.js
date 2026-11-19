// EPISODE 5 · worker A : "Survey Blueprint" opening (0 → L(5)).
// Cyanotype survey sheet coming alive: chalk/ink linework that draws itself, watercolour washes (teal water, ochre stone),
// sun-yellow highlights, Inter 900 stencil labels, Caladea notes, rubber stamps thumped on, page-slide transitions.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, circle } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { lg, poly, rgba, cached, blit } from './art.js';

const TEAL = '#3FB7B0', OCHRE = '#C9954A', SUN = '#FFD34D', CHALK = '#F2F7FF', PAPER = '#163F6E';
const STEN = (s) => `900 ${s}px Inter, sans-serif`, NOTE = (s) => `700 ${s}px Caladea, serif`;
const TM = {};   // narration times, filled in buildA (timing is loaded before shots are built)

// ───────────── paper ─────────────
function paperCanvas() {
  return cached('a-bp-paper', W + 600, H + 600, 1, () => {
    const w = W + 600, h = H + 600;
    ctx.fillStyle = lg(0, 0, w * 0.3, h, [[0, '#0F2F57'], [0.55, '#163F6E'], [1, '#1B4A80']]); ctx.fillRect(0, 0, w, h);
    // uneven cyanotype exposure: soft lighter / darker clouds
    for (let i = 0; i < 14; i++) {
      const x = rnd(i * 3.1) * w, y = rnd(i * 7.7 + 1) * h, r = 260 + rnd(i + 4) * 520, lite = rnd(i + 9) > 0.5;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, lite ? 'rgba(80,140,210,0.10)' : 'rgba(5,18,40,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // graph-paper grid (sheet origin at (300,300) so the grid lines up with the frame)
    for (let x = 300 % 40; x < w; x += 40) { const major = ((x - 300) / 40) % 5 === 0; ctx.fillStyle = major ? 'rgba(190,220,255,0.13)' : 'rgba(190,220,255,0.055)'; ctx.fillRect(x, 0, major ? 2 : 1, h); }
    for (let y = 300 % 40; y < h; y += 40) { const major = ((y - 300) / 40) % 5 === 0; ctx.fillStyle = major ? 'rgba(190,220,255,0.13)' : 'rgba(190,220,255,0.055)'; ctx.fillRect(0, y, w, major ? 2 : 1); }
    // paper fibres
    ctx.lineCap = 'round';
    for (let i = 0; i < 260; i++) {
      const x = rnd(i * 1.37 + 5) * w, y = rnd(i * 2.91 + 8) * h, a = rnd(i + 3) * TAU, l = 6 + rnd(i * 5) * 22;
      ctx.strokeStyle = `rgba(200,225,255,${0.04 + rnd(i * 9) * 0.07})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 4, y + Math.sin(a) * l * 0.5 - 3, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
    }
    // grain tile
    const tile = document.createElement('canvas'); tile.width = tile.height = 256; const tg = tile.getContext('2d'), im = tg.createImageData(256, 256);
    for (let i = 0; i < 65536; i++) { const v = rnd(i * 0.731 + 2) > 0.5 ? 255 : 0; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = Math.floor(rnd(i * 1.913) * 34); }
    tg.putImageData(im, 0, 0); ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(0, 0, w, h);
    // calm, darker band under the captions + vignette
    ctx.fillStyle = lg(0, 300 + 1250, 0, 300 + 1780, [[0, 'rgba(6,20,42,0)'], [0.35, 'rgba(6,20,42,0.32)'], [0.75, 'rgba(6,20,42,0.32)'], [1, 'rgba(6,20,42,0.12)']]); ctx.fillRect(0, 300 + 1250, w, 530);
    const v = ctx.createRadialGradient(840, 1200, 500, 840, 1200, 1500); v.addColorStop(0, 'rgba(4,14,32,0)'); v.addColorStop(1, 'rgba(4,14,32,0.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
  });
}
function paper(n, t) {
  blit(paperCanvas(), 0, 0, -300, -300);
  // sheet chrome: corner register marks, sheet number, title block
  ctx.save(); ctx.strokeStyle = 'rgba(242,247,255,0.35)'; ctx.lineWidth = 2;
  for (const [x, y, sx, sy] of [[48, 48, 1, 1], [W - 48, 48, -1, 1], [48, H - 48, 1, -1], [W - 48, H - 48, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + sy * 46); ctx.lineTo(x, y); ctx.lineTo(x + sx * 46, y); ctx.stroke(); }
  txt(`SHEET ${String(n).padStart(2, '0')}`, 72, 96, 28, CHALK, { font: NOTE, align: 'left', a: 0.55, ls: 3 });
  txt('FIELD NOTEBOOK · KAVERI', W - 72, 96, 28, CHALK, { font: NOTE, align: 'right', a: 0.45, ls: 2 });
  ctx.globalAlpha = 0.5; ctx.strokeRect(640, 1772, 380, 92); ctx.beginPath(); ctx.moveTo(640, 1818); ctx.lineTo(1020, 1818); ctx.moveTo(880, 1818); ctx.lineTo(880, 1864); ctx.stroke(); ctx.globalAlpha = 1;
  txt('KALLANAI · SURVEY', 830, 1796, 24, CHALK, { font: STEN, a: 0.6, ls: 3 });
  txt('illustration', 760, 1842, 22, CHALK, { font: NOTE, a: 0.5 });
  txt(`${n} / 7`, 950, 1842, 22, CHALK, { font: NOTE, a: 0.5 });
  ctx.restore();
}

// ───────────── drawing helpers ─────────────
function txt(s, x, y, size, col = CHALK, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.font = (o.font || STEN)(size); ctx.letterSpacing = `${o.ls ?? 0}px`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); x = 0; y = 0; }
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
/** stencil text whose glyph outlines draw themselves (dash restarts on every contour), then the fill floods in */
function drawnText(s, x, y, size, p, col = CHALK, o = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.font = STEN(size); ctx.letterSpacing = `${o.ls ?? 0}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let sc = 1; if (o.maxW) { const mw = ctx.measureText(s).width; if (mw > o.maxW) sc = o.maxW / mw; }
  ctx.translate(x, y); ctx.scale(sc, sc); if (o.rot) ctx.rotate(o.rot);
  const pl = clamp(p / 0.65), pf = clamp((p - 0.5) / 0.5);
  ctx.setLineDash([pl * size * 4.2 + 0.01, 1e5]); ctx.lineWidth = Math.max(2, size * 0.022); ctx.strokeStyle = col; ctx.lineJoin = 'round';
  ctx.strokeText(s, 0, 0); ctx.setLineDash([]);
  if (pf > 0) { ctx.globalAlpha = eo(pf); ctx.fillStyle = col; ctx.fillText(s, 0, 0); }
  ctx.restore(); ctx.letterSpacing = '0px';
}
function plen(pts) { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }
/** the first fraction p of a polyline */
function part(pts, p) {
  if (p >= 1) return pts; if (p <= 0) return [];
  const tot = plen(pts) * p, out = [pts[0]]; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + l >= tot) { const k = (tot - acc) / (l || 1); out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]); return out; }
    acc += l; out.push(pts[i]);
  }
  return out;
}
function stroke(pts, col, w, a = 1, closed = false) {
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (closed) ctx.closePath(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
/** chalk pen line that draws itself: p = 0..1, a soft wide halo + crisp core, with the pen nib riding the tip */
function ink(pts, p, o = {}) {
  const q = part(pts, p); if (q.length < 2) return;
  const col = o.col || CHALK, w = o.w || 4;
  if (o.dash) { ctx.save(); ctx.setLineDash(o.dash); }
  stroke(q, col, w * 2.6, 0.12 * (o.a ?? 1)); stroke(q, col, w, 0.92 * (o.a ?? 1));
  if (o.dash) ctx.restore();
  if (o.tip !== false && p > 0 && p < 1) nib(q[q.length - 1][0], q[q.length - 1][1]);
}
function nib(x, y) {
  ctx.save(); const g = ctx.createRadialGradient(x, y, 0, x, y, 34); g.addColorStop(0, 'rgba(255,211,77,0.55)'); g.addColorStop(1, 'rgba(255,211,77,0)'); ctx.fillStyle = g; ctx.fillRect(x - 34, y - 34, 68, 68);
  ctx.translate(x, y); ctx.rotate(-0.75);
  ctx.fillStyle = 'rgba(4,14,32,0.35)'; ctx.fillRect(10, 8, 150, 16);
  ctx.fillStyle = '#E9EEF6'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, -6); ctx.lineTo(18, 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C9D3E2'; ctx.fillRect(18, -7, 30, 14); ctx.fillStyle = '#0B2342'; ctx.fillRect(48, -9, 120, 18); ctx.fillStyle = SUN; ctx.fillRect(48, -9, 8, 18);
  ctx.restore();
}
/** Catmull-Rom sampled smooth curve through control points */
function smooth(cp, n = 10) {
  const out = [];
  for (let i = 0; i < cp.length - 1; i++) {
    const p0 = cp[Math.max(0, i - 1)], p1 = cp[i], p2 = cp[i + 1], p3 = cp[Math.min(cp.length - 1, i + 2)];
    for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u; out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3))); }
  }
  out.push(cp[cp.length - 1]); return out;
}
/** watercolour wash: offset low-alpha layers, pigment pooled at the edge, a few granulation blooms */
function wash(pts, col, a, seed = 0) {
  if (a <= 0) return;
  ctx.save();
  for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate((rnd(seed + k * 3) - 0.5) * 9, (rnd(seed + k * 5 + 1) - 0.5) * 9); poly(pts); ctx.fillStyle = rgba(col, a * 0.3); ctx.fill(); ctx.restore(); }
  poly(pts); ctx.strokeStyle = rgba(col, a * 0.5); ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  poly(pts); ctx.clip();
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  for (let i = 0; i < 5; i++) {
    const x = lerp(x0, x1, rnd(seed * 7 + i)), y = lerp(y0, y1, rnd(seed * 11 + i + 3)), r = 30 + rnd(seed + i * 13) * Math.max(40, (x1 - x0) * 0.25);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a * 0.22)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}
/** rubber stamp thumped on with a scale bounce (t0 = impact) */
function stamp(s, x, y, t0, t, o = {}) {
  const k = seg(t, t0 - 0.12, t0 + 0.26); if (k <= 0) return;
  const col = o.col || SUN, size = o.size || 80, sc = lerp(2.3, 1, eob(k)), a = clamp(k * 4);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  // impact ring
  const rk = seg(t, t0, t0 + 0.5); if (rk > 0 && rk < 1) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - rk); ctx.strokeStyle = col; ctx.lineWidth = 3; const e = 1 + rk * 0.5; ctx.font = STEN(size); const mw = ctx.measureText(s).width; ctx.strokeRect(-(mw / 2 + size * 0.45) * e, -size * 0.85 * e, (mw + size * 0.9) * e, size * 1.7 * e); ctx.restore(); }
  ctx.scale(sc, sc); ctx.globalAlpha = a * (o.a ?? 0.95);
  ctx.font = STEN(size); ctx.letterSpacing = `${size * 0.06}px`; const mw = ctx.measureText(s).width, bw = mw + size * 0.75, bh = size * 1.45;
  ctx.strokeStyle = col; ctx.lineWidth = size * 0.07; ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
  ctx.lineWidth = size * 0.025; ctx.strokeRect(-bw / 2 + size * 0.12, -bh / 2 + size * 0.12, bw - size * 0.24, bh - size * 0.24);
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, size * 0.03, size * 0.04);
  // worn ink: specks of paper showing through
  ctx.letterSpacing = '0px'; ctx.globalAlpha = a * 0.7; ctx.fillStyle = PAPER;
  const sd = s.length * 17 + s.charCodeAt(0);
  for (let i = 0; i < 46; i++) { const px = (rnd(sd + i) - 0.5) * bw, py = (rnd(sd + i * 3.3) - 0.5) * bh, r = 1 + rnd(sd + i * 7) * size * 0.05; ctx.beginPath(); ctx.ellipse(px, py, r * 1.6, r, rnd(i) * 3, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function arrowHead(x, y, ang, s, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s, -s * 0.42); ctx.lineTo(-s * 0.75, 0); ctx.lineTo(-s, s * 0.42); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
/** dimension line: extension ticks, line drawing out from the middle, arrowheads, label */
function dim(x0, y0, x1, y1, p, label, o = {}) {
  if (p <= 0) return;
  const col = o.col || CHALK, ang = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(ang) * 18, ny = Math.cos(ang) * 18, k = eo(clamp(p / 0.8));
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  stroke([[x0 - nx, y0 - ny], [x0 + nx, y0 + ny]], col, 2, 0.7 * k); stroke([[x1 - nx, y1 - ny], [x1 + nx, y1 + ny]], col, 2, 0.7 * k);
  const ax = lerp(mx, x0, k), ay = lerp(my, y0, k), bx = lerp(mx, x1, k), by = lerp(my, y1, k);
  stroke([[ax, ay], [bx, by]], col, 2.5, 0.85);
  arrowHead(ax, ay, ang + Math.PI, 18, col); arrowHead(bx, by, ang, 18, col);
  if (label) { const la = clamp((p - 0.6) / 0.4); ctx.save(); ctx.translate(mx, my); ctx.rotate(ang); ctx.fillStyle = PAPER; ctx.font = NOTE(o.size || 30); const mw = ctx.measureText(label).width; ctx.globalAlpha = la; ctx.fillRect(-mw / 2 - 10, -20, mw + 20, 40); ctx.restore(); txt(label, mx, my, o.size || 30, col, { font: NOTE, a: la, rot: ang }); }
}
function compass(x, y, r, p, t) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.04 * Math.sin(t * 0.6));
  const ring = []; for (let i = 0; i <= 64; i++) { const a = -Math.PI / 2 + (i / 64) * TAU; ring.push([Math.cos(a) * r, Math.sin(a) * r]); }
  ink(ring, p, { w: 2.5, tip: false });
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, l = i % 4 === 0 ? 0.16 : 0.08; if (p > i / 16) stroke([[Math.cos(a) * r, Math.sin(a) * r], [Math.cos(a) * r * (1 - l), Math.sin(a) * r * (1 - l)]], CHALK, 2, 0.8); }
  const k = eo(clamp((p - 0.3) / 0.7));
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2); ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(0, -r * 0.92); ctx.lineTo(r * 0.14, 0); ctx.lineTo(-r * 0.14, 0); ctx.closePath(); ctx.fillStyle = i === 0 ? SUN : 'rgba(242,247,255,0.85)'; ctx.fill(); ctx.restore(); }
  ctx.rotate(-0.04 * Math.sin(t * 0.6)); txt('N', 0, -r - 26, 30, SUN, { a: k });
  ctx.restore();
}
function note(s, x, y, a, o = {}) { txt(s, x, y, o.size || 34, o.col || CHALK, { font: NOTE, a: a * (o.a ?? 0.85), align: o.align, rot: o.rot }); }
/** page-slide transition: the previous sheet stays, the new sheet slides over it from the right */
function slideOver(prev, t, lt, dur, drawNew) {
  if (!prev || lt >= dur) { drawNew(); return; }
  prev.draw(t - prev.at, 1, t);
  const k = eio(clamp(lt / dur)), off = (1 - k) * (W + 360);
  ctx.save(); ctx.translate(off, (1 - k) * 40); ctx.rotate((1 - k) * 0.035);
  ctx.fillStyle = lg(-90, 0, 0, 0, [[0, 'rgba(0,6,18,0)'], [1, 'rgba(0,6,18,0.5)']]); ctx.fillRect(-90, -400, 90, H + 800);
  ctx.beginPath(); ctx.rect(0, -400, W + 700, H + 800); ctx.clip(); drawNew(); ctx.restore();
}

// ───────────── tiny survey figures ─────────────
function theodolite(x, y, s, p, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ink([[0, -92], [-34, 0]], clamp(p * 3), { w: 3, tip: false }); ink([[0, -92], [30, 0]], clamp(p * 3 - 0.3), { w: 3, tip: false }); ink([[0, -92], [6, 6]], clamp(p * 3 - 0.6), { w: 3, tip: false });
  const k = clamp((p - 0.4) / 0.6); ctx.globalAlpha = k;
  ctx.fillStyle = CHALK; ctx.fillRect(-12, -112, 24, 20); ctx.fillRect(-26, -126, 52, 12); ctx.beginPath(); ctx.arc(0, -126, 7, 0, TAU); ctx.fill();
  ctx.restore();
}
function surveyor(x, y, s, p) {   // stick-like survey figure with a brimmed hat, bending to the eyepiece
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const k = clamp(p * 1.4);
  ink([[-14, 0], [0, -60], [14, 0]], k, { w: 4, tip: false });
  ink([[0, -60], [6, -118]], clamp(k * 1.2 - 0.2), { w: 4, tip: false });
  ink([[4, -104], [34, -96], [48, -112]], clamp(k * 1.2 - 0.35), { w: 3.5, tip: false });
  ink([[4, -104], [-18, -82], [-10, -66]], clamp(k * 1.2 - 0.4), { w: 3.5, tip: false });
  const hk = clamp((p - 0.5) / 0.5); ctx.globalAlpha = hk;
  ctx.fillStyle = CHALK; ctx.beginPath(); ctx.arc(10, -132, 12, 0, TAU); ctx.fill();
  ctx.fillRect(-10, -146, 40, 4); ctx.fillRect(0, -160, 22, 15);
  ctx.restore();
}

// ═════════════ A1 · the riverbank survey + the ancient weir ═════════════
const LB = smooth([[230, 1270], [300, 1080], [372, 900], [420, 740], [452, 610]], 8);
const RB = smooth([[1150, 1270], [1010, 1080], [895, 900], [790, 740], [700, 610]], 8);
const FAR = smooth([[-120, 616], [120, 600], [340, 612], [560, 604], [800, 614], [1000, 598], [1200, 610]], 8);
const bankX = (B, y) => { for (let i = 1; i < B.length; i++) if ((B[i - 1][1] - y) * (B[i][1] - y) <= 0) { const k = (y - B[i - 1][1]) / ((B[i][1] - B[i - 1][1]) || 1); return lerp(B[i - 1][0], B[i][0], k); } return B[0][0]; };
const WY = 905, WX0 = bankX(LB, WY) - 14, WX1 = bankX(RB, WY) + 14;
const weirY = (x) => WY - 10 * Math.sin(((x - WX0) / (WX1 - WX0)) * Math.PI);
const WEIR_TOP = Array.from({ length: 41 }, (_, i) => { const x = lerp(WX0, WX1, i / 40); return [x, weirY(x) - 22]; });
const WEIR_BOT = Array.from({ length: 41 }, (_, i) => { const x = lerp(WX0, WX1, i / 40); return [x, weirY(x) + 22]; });
const STONES = Array.from({ length: 17 }, (_, i) => {
  const x = lerp(WX0 + 22, WX1 - 22, i / 16) + (rnd(i * 3) - 0.5) * 10, y = weirY(x) + (rnd(i * 5) - 0.5) * 8, rx = 16 + rnd(i * 7) * 10, ry = 12 + rnd(i * 9) * 6;
  return { x, y, pts: Array.from({ length: 9 }, (_, j) => { const a = (j / 9) * TAU, r = 0.78 + rnd(i * 13 + j) * 0.3; return [x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r]; }) };
});
const PALMS = [[90, 600, 0.9], [205, 604, 0.7], [560, 602, 0.6], [880, 610, 0.85], [990, 598, 0.7]];
function palm(x, y, s, p) {
  if (p <= 0) return;
  ink([[x, y], [x + 6 * s, y - 50 * s], [x + 4 * s, y - 100 * s]], clamp(p * 2), { w: 2.5, tip: false });
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.62, tx = x + 4 * s, ty = y - 100 * s; ink([[tx, ty], [tx + Math.cos(a) * 26 * s, ty + Math.sin(a) * 22 * s - 6 * s], [tx + Math.cos(a) * 46 * s, ty + Math.sin(a) * 30 * s + 12 * s]], clamp(p * 2 - 1 - i * 0.05), { w: 2, tip: false }); }
}
function shotRiver(lt, d, t) {
  paper(1, t);
  const tb = 0.25;
  // far bank, palms, low hills
  ink(FAR, eo(seg(t, tb, tb + 1.4)), { w: 3 });
  ink(smooth([[-100, 600], [140, 548], [330, 586], [520, 560], [720, 590], [900, 540], [1180, 590]], 8), eo(seg(t, tb + 0.6, tb + 2.2)), { w: 2, a: 0.45, tip: false });
  PALMS.forEach(([x, y, s], i) => palm(x, y, s, seg(t, tb + 0.8 + i * 0.15, tb + 1.8 + i * 0.15)));
  // river banks + teal wash
  const rv = eo(seg(t, 0.5, 2.0));
  wash([...LB, ...RB.slice().reverse()], TEAL, 0.55 * rv, 3);
  ink(LB, eo(seg(t, 0.4, 1.7)), { w: 4, tip: false }); ink(RB, eo(seg(t, 0.7, 2.0)), { w: 4, tip: false });
  ink([[-300, 1272], [1380, 1272]], eo(seg(t, 0.2, 1.6)), { w: 2.5, a: 0.6, tip: false });
  // flow marks drifting toward the viewer
  for (let i = 0; i < 16; i++) {
    const ph = (rnd(i * 3) + t * 0.09) % 1, y = lerp(640, 1240, ph * ph), xl = bankX(LB, y), xr = bankX(RB, y), x = lerp(xl + 30, xr - 30, rnd(i * 7 + 1)), l = 14 + ph * 40;
    stroke([[x - l / 2, y], [x - l / 6, y - 3], [x + l / 6, y + 2], [x + l / 2, y]], CHALK, 1.5 + ph * 2, 0.45 * rv * Math.sin(ph * Math.PI));
  }
  // earth on the near banks
  const ek = seg(t, 1.0, 2.2);
  wash([[-300, 1280], [-300, 640], [452, 610], ...LB.slice().reverse()], OCHRE, 0.22 * ek, 11);
  wash([[1400, 1280], [1400, 640], [700, 610], ...RB], OCHRE, 0.18 * ek, 17);
  // the surveyor and his instrument on the left bank
  surveyor(112, 1236, 0.95, seg(t, 1.0, 2.0)); theodolite(186, 1236, 0.9, seg(t, 1.3, 2.3), t);
  // sight line to the river crossing
  const sl = eo(seg(t, TM.studied - 0.1, TM.studied + 0.8));
  ink([[190, 1120], [600, WY - 4]], sl, { col: SUN, w: 2.5, dash: [14, 12], tip: false });
  if (sl > 0) { const gk = 0.5 + 0.5 * Math.sin(t * 6); ctx.beginPath(); ctx.arc(600, WY - 4, 10 + 6 * gk, 0, TAU); ctx.strokeStyle = rgba(SUN, 0.8 * sl); ctx.lineWidth = 2.5; ctx.stroke(); }
  note('sight line', 300, 1060, seg(t, TM.studied + 0.4, TM.studied + 1), { rot: -0.52, size: 28 });
  // the weir draws itself across the river
  const w0 = TM.dam - 0.55, wp = eio(seg(t, w0, w0 + 1.3));
  STONES.forEach((s, i) => { const k = seg(t, w0 + 0.1 + (i / 16) * 1.2, w0 + 0.5 + (i / 16) * 1.2); if (k > 0) { wash(s.pts, OCHRE, 0.95 * k, i + 40); stroke(s.pts, CHALK, 2, 0.65 * k, true); } });
  ink(WEIR_TOP, wp, { w: 3.5 }); ink(WEIR_BOT, eio(seg(t, w0 + 0.2, w0 + 1.5)), { w: 3.5 });
  // water spilling over the crest
  const sp = seg(t, w0 + 1.2, w0 + 2.0);
  if (sp > 0) for (let i = 0; i < 14; i++) {
    const x = lerp(WX0 + 30, WX1 - 30, i / 13), y0 = weirY(x) + 26, ph = (t * 0.8 + rnd(i)) % 1;
    stroke([[x, y0 + ph * 40], [x + 6, y0 + 10 + ph * 40], [x, y0 + 20 + ph * 40]], CHALK, 2, 0.5 * sp * (1 - ph));
  }
  dim(WX0, WY - 70, WX1, WY - 70, seg(t, w0 + 1.2, w0 + 2.0), 'low stone weir', { size: 30 });
  // header + stamp
  txt('RIVER CROSSING', 72, 210, 64, CHALK, { align: 'left', a: eo(seg(t, 0.3, 1.1)), ls: 4 });
  note('surveyed, 19th century · illustration', 74, 272, eo(seg(t, 0.7, 1.5)), { align: 'left', size: 32 });
  compass(950, 250, 64, eo(seg(t, 0.8, 2.4)), t);
  stamp('ANCIENT', 540, 450, TM.ancient + 0.05, t, { rot: -0.1, size: 100 });
}

// ═════════════ A2 · KALLANAI title + Kaveri ribbon ═════════════
const RIB = smooth([[-120, 640], [140, 690], [330, 820], [460, 960], [640, 1040], [860, 1090], [1210, 1200]], 10);
function ribbon(off) {   // offset the centreline sideways by `off`
  return RIB.map((p, i) => { const a = RIB[Math.max(0, i - 1)], b = RIB[Math.min(RIB.length - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), w = off * (0.85 + 0.3 * i / RIB.length); return [p[0] - Math.sin(ang) * w, p[1] + Math.cos(ang) * w]; });
}
const RIB_L = ribbon(-62), RIB_R = ribbon(62);
function shotTitle(lt, d, t) {
  paper(2, t);
  const tk = TM.kallanai - 0.25;
  // drafting ruler slides in and the title is measured
  const rk = eo(seg(t, TM.a2 + 0.2, TM.a2 + 0.9));
  ctx.save(); ctx.translate(lerp(-900, 0, rk), 0); ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(242,247,255,0.10)'; ctx.fillRect(70, 160, 940, 46); ctx.strokeStyle = 'rgba(242,247,255,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(70, 160, 940, 46);
  for (let i = 0; i <= 94; i++) { const x = 70 + i * 10; ctx.fillStyle = CHALK; ctx.fillRect(x, 160, 1.5, i % 10 === 0 ? 22 : i % 5 === 0 ? 14 : 8); }
  ctx.restore();
  drawnText('KALLANAI', 540, 335, 196, seg(t, tk, tk + 1.1), CHALK, { maxW: 940, ls: 6 });
  dim(70, 450, 1010, 450, seg(t, tk + 0.6, tk + 1.3), '');
  drawnText('THE STONE DAM', 540, 525, 76, seg(t, TM.stone - 0.25, TM.stone + 0.5), SUN, { ls: 6 });
  // river ribbon
  const rp = eio(seg(t, TM.a2 + 0.4, TM.kaveri + 0.4));
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, lerp(-300, W + 300, rp) + 300, H + 600); ctx.clip();
  wash([...RIB_L, ...RIB_R.slice().reverse()], TEAL, 0.7, 5);
  for (let i = 0; i < 7; i++) { const sh = ((t * 0.05 + i / 7) % 1); const q = part(RIB, 1).slice(Math.floor(sh * (RIB.length - 8)), Math.floor(sh * (RIB.length - 8)) + 6); stroke(q, CHALK, 2.5, 0.35); }
  ctx.restore();
  ink(RIB_L, rp, { w: 3.5 }); ink(RIB_R, eio(seg(t, TM.a2 + 0.55, TM.kaveri + 0.55)), { w: 3.5, tip: false });
  // fields wash along the banks
  wash([[-300, 1270], [-300, 760], [100, 800], [300, 950], [470, 1110], [700, 1180], [1000, 1240], [1100, 1270]], OCHRE, 0.16 * seg(t, TM.a2 + 1, TM.a2 + 2.5), 23);
  // dam marker across the river
  const di = RIB.length * 0.47 | 0, dp = RIB[di], dn = RIB[di + 1], da = Math.atan2(dn[1] - dp[1], dn[0] - dp[0]);
  const mk = eob(seg(t, TM.stone - 0.1, TM.stone + 0.35));
  if (mk > 0) {
    ctx.save(); ctx.translate(dp[0], dp[1]); ctx.rotate(da + Math.PI / 2); ctx.scale(mk, mk);
    ctx.fillStyle = SUN; ctx.fillRect(-90, -9, 180, 18); ctx.strokeStyle = '#0B2342'; ctx.lineWidth = 2; for (let i = -80; i < 90; i += 22) { ctx.beginPath(); ctx.moveTo(i, -9); ctx.lineTo(i + 8, 9); ctx.stroke(); }
    ctx.restore();
    const g = ctx.createRadialGradient(dp[0], dp[1], 0, dp[0], dp[1], 120); g.addColorStop(0, `rgba(255,211,77,${0.3 * (0.6 + 0.4 * Math.sin(t * 4))})`); g.addColorStop(1, 'rgba(255,211,77,0)'); ctx.fillStyle = g; ctx.fillRect(dp[0] - 120, dp[1] - 120, 240, 240);
  }
  ink([[dp[0] + 40, dp[1] - 60], [dp[0] + 150, dp[1] - 190], [dp[0] + 290, dp[1] - 190]], eo(seg(t, TM.stone + 0.1, TM.stone + 0.6)), { w: 2.5, tip: false });
  note('the stone dam', dp[0] + 300, dp[1] - 190, seg(t, TM.stone + 0.4, TM.stone + 0.8), { align: 'left', size: 34, a: 1 });
  // river name along the ribbon
  const ki = RIB.length * 0.2 | 0, kp = RIB[ki], kn = RIB[ki + 2], ka = Math.atan2(kn[1] - kp[1], kn[0] - kp[0]);
  drawnText('KAVERI', kp[0] + 40, kp[1] + 120, 74, seg(t, TM.kaveri - 0.15, TM.kaveri + 0.55), CHALK, { rot: ka, ls: 10 });
  compass(170, 1150, 60, eo(seg(t, TM.a2 + 0.8, TM.a2 + 2.2)), t);
  note('stylised, not to scale', 540, 1262, seg(t, TM.a2 + 1, TM.a2 + 1.6), { size: 30, a: 0.7 });
}

// ═════════════ A3 · tiger banner + crown emblem, KARIKALA name plate ═════════════
const TIGER = [[-170, -70], [-160, -104], [-140, -110], [-138, -86], [-150, -70], [-128, -34], [-104, -24], [-60, -36], [0, -40], [60, -32], [88, -46], [104, -72], [122, -80], [124, -96], [140, -84], [160, -72], [174, -52], [168, -38], [150, -34], [138, -28], [126, -8], [130, 30], [140, 58], [156, 62], [140, 68], [116, 64], [104, 22], [60, 10], [0, 14], [-50, 10], [-70, 30], [-58, 60], [-42, 64], [-62, 70], [-88, 64], [-100, 20], [-110, -14]];
const STRIPES = [[-70, -34, -64, -6], [-36, -38, -32, -4], [0, -40, 2, -2], [34, -38, 32, -4], [66, -32, 62, 0], [-96, -22, -86, 4]];
const flagWave = (x, y, t, k) => [x, y + Math.sin((x - 380) * 0.018 - t * 3.2) * 9 * k];
function shotEmblem(lt, d, t) {
  paper(3, t);
  const cx = 540, cy = 720, R = 255, e0 = TM.a3 + 0.2;
  // medallion rings
  const ring = (r) => Array.from({ length: 81 }, (_, i) => { const a = -Math.PI / 2 + (i / 80) * TAU; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  ink(ring(R), eio(seg(t, e0, e0 + 1.2)), { w: 4 }); ink(ring(R - 22), eio(seg(t, e0 + 0.2, e0 + 1.4)), { w: 2, tip: false });
  for (let i = 0; i < 48; i++) { const a = (i / 48) * TAU, k = seg(t, e0 + 0.3 + i * 0.02, e0 + 0.5 + i * 0.02); if (k > 0) stroke([[cx + Math.cos(a) * (R - 22), cy + Math.sin(a) * (R - 22)], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], CHALK, 2, 0.6 * k); }
  // banner on its pole
  const bk = seg(t, e0 + 0.4, e0 + 1.4), wk = clamp(lt / 2);
  ink([[392, 930], [392, 480]], eo(bk), { w: 5, tip: false });
  const FL = [[392, 500], [700, 500], [650, 610], [700, 720], [392, 720]].map(([x, y]) => flagWave(x, y, t, wk));
  wash(FL, OCHRE, 0.55 * seg(t, e0 + 0.8, e0 + 1.6), 31);
  const flp = [...[0, 1, 2, 3, 4].flatMap((i) => { const a = FL[i], b = FL[(i + 1) % 5]; return Array.from({ length: 6 }, (_, j) => [lerp(a[0], b[0], j / 6), lerp(a[1], b[1], j / 6)]); }), FL[0]];
  ink(flp, eio(seg(t, e0 + 0.6, e0 + 1.6)), { w: 3, tip: false });
  circle(392, 472, 10 * eo(bk), CHALK);
  // the tiger, drawn by the pen
  const tp = eio(seg(t, e0 + 1.1, e0 + 2.4)), TS = 0.82, TX = 540, TY = 625;
  const tig = TIGER.concat([TIGER[0]]).map(([x, y]) => flagWave(TX + x * TS, TY + y * TS, t, wk));
  if (tp > 0.95) { ctx.save(); poly(tig); ctx.fillStyle = rgba(SUN, 0.35 * seg(t, e0 + 2.3, e0 + 2.8)); ctx.fill(); ctx.restore(); }
  ink(tig, tp, { w: 3.5, col: SUN });
  STRIPES.forEach(([x0, y0, x1, y1], i) => { const k = seg(t, e0 + 2.2 + i * 0.06, e0 + 2.5 + i * 0.06); if (k > 0) ink([flagWave(TX + x0 * TS, TY + y0 * TS, t, wk), flagWave(TX + x1 * TS, TY + y1 * TS, t, wk)], k, { w: 3, col: SUN, tip: false }); });
  // crown above
  const ck = eo(seg(t, TM.chola - 0.3, TM.chola + 0.4)), cyy = 375;
  const CR = [[-120, 70], [-130, -20], [-70, 20], [-40, -50], [0, 0], [40, -50], [70, 20], [130, -20], [120, 70]].map(([x, y]) => [cx + x, cyy + y]);
  if (ck > 0) { wash(CR, SUN, 0.5 * ck, 51); }
  ink([...CR, CR[0]], eio(seg(t, TM.chola - 0.4, TM.chola + 0.5)), { w: 4 });
  [[-130, -20], [-40, -50], [40, -50], [130, -20]].forEach(([x, y], i) => { const k = eob(seg(t, TM.chola + 0.2 + i * 0.07, TM.chola + 0.45 + i * 0.07)); if (k > 0) { ctx.beginPath(); ctx.arc(cx + x, cyy + y - 12, 11 * k, 0, TAU); ctx.fillStyle = SUN; ctx.fill(); } });
  for (let i = 0; i < 6; i++) { const k = seg(t, TM.chola + 0.3, TM.chola + 1.2), a = -Math.PI / 2 + (i - 2.5) * 0.4, r0 = 120 + k * 40; if (k > 0 && k < 1) stroke([[cx + Math.cos(a) * r0, cyy + 20 + Math.sin(a) * r0], [cx + Math.cos(a) * (r0 + 30), cyy + 20 + Math.sin(a) * (r0 + 30)]], SUN, 3, 1 - k); }
  note('early Chola king · emblem stylised', cx, 1006, seg(t, TM.early - 0.1, TM.early + 0.5), { size: 32 });
  // name plate
  const pk = eob(seg(t, TM.karikala - 0.2, TM.karikala + 0.25));
  if (pk > 0) {
    ctx.save(); ctx.translate(cx, 1130); ctx.scale(1, pk);
    ctx.fillStyle = 'rgba(8,26,52,0.55)'; ctx.fillRect(-400, -70, 800, 140);
    ctx.strokeStyle = CHALK; ctx.lineWidth = 3; ctx.strokeRect(-400, -70, 800, 140); ctx.lineWidth = 1.5; ctx.strokeRect(-388, -58, 776, 116);
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 370, 0, 7, 0, TAU); ctx.fillStyle = CHALK; ctx.fill(); }
    ctx.restore();
  }
  drawnText('KARIKALA', cx, 1134, 112, seg(t, TM.karikala - 0.1, TM.karikala + 0.6), SUN, { ls: 8, maxW: 690 });
  stamp('TRADITION', 540, 205, TM.tradition + 0.35, t, { col: CHALK, rot: -0.05, size: 64 });
}

// ═════════════ A4 · the big question mark ═════════════
function shotQuestion(lt, d, t) {
  paper(4, t);
  const q0 = TM.a4;
  // faint calendar wheel spinning behind
  ctx.save(); ctx.translate(540, 720); ctx.rotate(t * 0.5);
  for (let i = 0; i < 60; i++) { const a = (i / 60) * TAU, l = i % 5 === 0 ? 34 : 16; stroke([[Math.cos(a) * 380, Math.sin(a) * 380], [Math.cos(a) * (380 - l), Math.sin(a) * (380 - l)]], CHALK, 2, 0.35 * seg(t, q0, q0 + 0.4)); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(540, 720, 380, 0, TAU); ctx.strokeStyle = rgba(CHALK, 0.25 * seg(t, q0, q0 + 0.4)); ctx.lineWidth = 2; ctx.stroke();
  // the "?" stamped down, then outline draws over it
  const k = seg(t, TM.when - 0.05, TM.when + 0.3), sc = lerp(2.0, 1, eob(k));
  if (k > 0) {
    ctx.save(); ctx.translate(540, 730); ctx.scale(sc, sc); ctx.rotate(0.05 * Math.sin(t * 2));
    ctx.font = STEN(640); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = clamp(k * 3);
    ctx.fillStyle = 'rgba(4,14,32,0.4)'; ctx.fillText('?', 14, 18); ctx.fillStyle = SUN; ctx.fillText('?', 0, 0);
    ctx.restore();
  }
  // small doubts popping around it
  [[200, 360, 90, -0.3], [880, 420, 70, 0.25], [170, 1010, 64, 0.2], [900, 1040, 96, -0.15], [760, 260, 54, 0.1], [300, 1180, 50, -0.2]].forEach(([x, y, s, r], i) => {
    const pk = eob(seg(t, TM.nobody + i * 0.09, TM.nobody + 0.25 + i * 0.09)); if (pk > 0) txt('?', x + Math.sin(t * 2 + i) * 6, y, s * pk, CHALK, { rot: r, a: 0.8 });
  });
  note('date: unknown', 540, 1230, seg(t, TM.nobody + 0.2, TM.nobody + 0.6), { size: 40 });
}

// ═════════════ A5 · the timeline ruler with a fuzzy date range ═════════════
const YX = (yr) => 110 + (yr + 500) * 1.1;   // −500 → 110, 0 → 660, +300 → 990
function shotTimeline(lt, d, t) {
  paper(5, t);
  const sl = 1 - eo(seg(lt, 0.0, 0.9)), drift = -10 * Math.sin(lt * 0.5);
  ctx.save(); ctx.translate(sl * 1100 + drift, 0);
  // ruler
  const ry = 700;
  ctx.fillStyle = 'rgba(242,247,255,0.10)'; ctx.fillRect(40, ry, 1010, 110); ctx.strokeStyle = 'rgba(242,247,255,0.75)'; ctx.lineWidth = 3; ctx.strokeRect(40, ry, 1010, 110);
  for (let yr = -560; yr <= 340; yr += 10) { const x = YX(yr), big = yr % 100 === 0, mid = yr % 50 === 0; ctx.fillStyle = CHALK; ctx.globalAlpha = 0.85; ctx.fillRect(x - 1, ry, 2, big ? 44 : mid ? 28 : 14); }
  ctx.globalAlpha = 1;
  for (let yr = -500; yr <= 300; yr += 100) txt(String(Math.abs(yr)), YX(yr), ry + 76, 30, CHALK, { a: 0.9 });
  // era divider
  ctx.save(); ctx.setLineDash([12, 10]); stroke([[YX(0), 420], [YX(0), 860]], SUN, 3, 0.9); ctx.restore();
  txt('BCE', YX(0) - 30, 470, 66, CHALK, { align: 'right', ls: 4 }); txt('CE', YX(0) + 30, 470, 66, CHALK, { align: 'left', ls: 4 });
  arrowHead(YX(0) - 210, 470, Math.PI, 26, CHALK); arrowHead(YX(0) + 140, 470, 0, 26, CHALK);
  // the range bar: grows left from year 0 at "before", right at "second century", both ends blurred
  const le = lerp(0, -470, eo(seg(t, TM.before - 0.2, TM.before + 1.2))), re = lerp(0, 250, eo(seg(t, TM.second - 0.3, TM.century + 0.3)));
  const by = 600, bh = 56, wob = (i) => 18 * Math.sin(t * 1.7 + i);
  if (le < -1 || re > 1) {
    const g = ctx.createLinearGradient(YX(-470), 0, YX(250), 0);
    const st = (yr) => (yr + 470) / 720;
    g.addColorStop(0, rgba(SUN, 0)); g.addColorStop(st(-330 + wob(1)), rgba(SUN, 0.35)); g.addColorStop(st(-180 + wob(2)), rgba(SUN, 0.92)); g.addColorStop(st(90 + wob(3)), rgba(SUN, 0.92)); g.addColorStop(st(170 + wob(4)), rgba(SUN, 0.4)); g.addColorStop(1, rgba(SUN, 0));
    ctx.save(); ctx.beginPath(); ctx.rect(YX(le), by - 40, YX(re) - YX(le), bh + 80); ctx.clip();
    ctx.fillStyle = g; ctx.fillRect(YX(-470), by, YX(250) - YX(-470), bh);
    // speckle at the uncertain ends
    for (let i = 0; i < 70; i++) { const side = i % 2, yr = side ? lerp(90, 250, rnd(i * 3)) : lerp(-470, -170, rnd(i * 3)), fade = side ? 1 - (yr - 90) / 160 : (yr + 470) / 300; const y = by + rnd(i * 7) * bh + (rnd(i * 11) - 0.5) * 50; ctx.fillStyle = rgba(SUN, 0.55 * fade * (0.6 + 0.4 * Math.sin(t * 3 + i))); ctx.fillRect(YX(yr), y, 3 + rnd(i) * 4, 3 + rnd(i) * 4); }
    ctx.restore();
  }
  note('before the common era …', YX(-260), 545, seg(t, TM.before + 0.2, TM.before + 0.8), { size: 32 });
  note('… about 2nd century CE', YX(110), 900, seg(t, TM.second + 0.1, TM.second + 0.7), { size: 32 });
  ink([[YX(150), 870], [YX(150), by + bh + 6]], eo(seg(t, TM.second + 0.2, TM.second + 0.7)), { w: 2, tip: false });
  ctx.restore();
  // heading
  drawnText('DATES?', 540, 250, 130, seg(t, TM.a5 + 0.15, TM.a5 + 1.0), CHALK, { ls: 8 });
  note('estimates vary widely', 540, 345, seg(t, TM.a5 + 0.6, TM.a5 + 1.2), { size: 36 });
  stamp('DATE UNCERTAIN', 540, 1080, TM.century + 0.45, t, { rot: -0.07, size: 76 });
}

// ═════════════ A6 · the palm-leaf poem bundle ═════════════
function leaf(x, y, w, h, rot, a, seed, lines = true) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= a;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = rgba(OCHRE, 0.55); ctx.fill(); ctx.fillStyle = lg(0, -h / 2, 0, h / 2, [[0, 'rgba(255,230,170,0.25)'], [1, 'rgba(60,30,0,0.2)']]); ctx.fill();
  ctx.strokeStyle = rgba(CHALK, 0.85); ctx.lineWidth = 2.5; ctx.stroke();
  if (lines) { ctx.strokeStyle = rgba(CHALK, 0.28); ctx.lineWidth = 1.5; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(-w / 2 + h * 0.8, k * h * 0.22); ctx.lineTo(w / 2 - h * 0.8, k * h * 0.22); ctx.stroke(); } }
  for (const sx of [-0.3, 0.3]) { ctx.beginPath(); ctx.arc(sx * w, 0, h * 0.12, 0, TAU); ctx.fillStyle = PAPER; ctx.fill(); ctx.strokeStyle = rgba(CHALK, 0.7); ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.restore();
}
function shotPoems(lt, d, t) {
  paper(6, t);
  drawnText('SANGAM POEMS', 540, 280, 110, seg(t, TM.sangam - 0.2, TM.sangam + 0.6), SUN, { ls: 6, maxW: 960 });
  note('the main source · early Tamil poetry', 540, 375, seg(t, TM.sangam + 0.3, TM.sangam + 0.9), { size: 34 });
  note('his story comes from …', 540, 190, seg(t, TM.a6 + 0.5, TM.a6 + 1.0) * (1 - seg(t, TM.sangam - 0.4, TM.sangam - 0.1)), { size: 38 });
  // bundle of leaves dropping onto the sheet and fanning
  const cx = 540, cy = 780, fan = eio(seg(t, TM.poems, TM.poems + 1.4));
  for (let i = 0; i < 7; i++) {
    const k = eob(seg(t, TM.a6 + 0.35 + i * 0.12, TM.a6 + 0.7 + i * 0.12)); if (k <= 0) continue;
    const y = cy + (i - 3) * 34 + (1 - k) * -120, rot = (i - 3) * 0.05 * fan + Math.sin(t * 0.8 + i) * 0.004;
    leaf(cx + (i - 3) * 6 * fan, y, 820, 58, rot, clamp(k * 2), i);
  }
  // cord through the holes, with wooden end boards
  const ck = eo(seg(t, TM.a6 + 1.3, TM.a6 + 2.0));
  for (const sx of [-246, 246]) ink([[cx + sx, cy - 170], [cx + sx, cy + 170], [cx + sx + 26, cy + 230]], ck, { w: 3, col: SUN, tip: false });
  // dimension + note
  dim(130, 1010, 950, 1010, seg(t, TM.a6 + 1.6, TM.a6 + 2.3), 'palm-leaf bundle (illustrative)', { size: 30 });
}

// ═════════════ A7 · split into RECORD / LEGEND on a balance ═════════════
function shotBalance(lt, d, t) {
  paper(7, t);
  const px = 540, py = 520, arm = 315;
  const rec = TM.record, leg = TM.legend;
  // tilt: settles nowhere, leaning to each side as it is named
  const th = 0.13 * eo(seg(t, rec - 0.1, rec + 0.4)) - 0.26 * eo(seg(t, leg - 0.1, leg + 0.4)) + 0.13 * eo(seg(t, leg + 0.5, leg + 1.3)) + 0.03 * Math.sin(t * 2.2);
  // stand
  ink([[px, py], [px, 1180]], eo(seg(lt, 0, 0.5)), { w: 6, tip: false });
  wash([[px - 170, 1230], [px + 170, 1230], [px + 60, 1170], [px - 60, 1170]], OCHRE, 0.6 * seg(lt, 0.1, 0.5), 61);
  stroke([[px - 170, 1230], [px + 170, 1230], [px + 60, 1170], [px - 60, 1170]], CHALK, 3, seg(lt, 0.1, 0.5), true);
  // beam
  const ex = (s) => [px + Math.cos(th) * arm * s, py + Math.sin(th) * arm * s];
  const [lx, ly] = ex(-1), [rx, ry] = ex(1), bk = eo(seg(lt, 0.1, 0.6));
  stroke([[lerp(px, lx, bk), lerp(py, ly, bk)], [lerp(px, rx, bk), lerp(py, ry, bk)]], CHALK, 7, 0.95);
  ctx.beginPath(); ctx.arc(px, py, 16, 0, TAU); ctx.fillStyle = SUN; ctx.fill();
  ctx.beginPath(); ctx.moveTo(px, py - 70); ctx.lineTo(px - 14, py - 16); ctx.lineTo(px + 14, py - 16); ctx.closePath(); ctx.fillStyle = CHALK; ctx.fill();
  // pans on strings
  const pans = [[lx, ly], [rx, ry]].map(([x, y]) => [x, y + 300]);
  pans.forEach(([x, y], s) => {
    const k = eo(seg(lt, 0.25, 0.75)); if (k <= 0) return;
    const top = s ? [rx, ry] : [lx, ly];
    stroke([[top[0], top[1]], [x - 120, y]], CHALK, 2, k); stroke([[top[0], top[1]], [x + 120, y]], CHALK, 2, k);
    const P = Array.from({ length: 17 }, (_, i) => { const a = Math.PI * (i / 16); return [x - Math.cos(a) * 140, y + Math.sin(a) * 34]; });
    wash(P, s ? SUN : TEAL, 0.5 * k, 70 + s); stroke(P.concat([P[0]]), CHALK, 3, k);
  });
  // leaves fly from the bundle into the two pans
  for (let i = 0; i < 8; i++) {
    const side = i % 2, n = i >> 1, k = eio(seg(lt, 0.15 + i * 0.07, 0.75 + i * 0.07));
    const [tx, ty] = pans[side], ex2 = tx, ey = ty - 18 - n * 20;
    const sx = 540, sy = 300 + i * 18, x = lerp(sx, ex2, k), y = lerp(sy, ey, k) - Math.sin(k * Math.PI) * 120;
    leaf(x, y, lerp(560, 230, k), lerp(44, 22, k), (side ? 0.04 : -0.04) + Math.sin(k * Math.PI) * (side ? 0.5 : -0.5), 1, i, k < 0.5);
  }
  stamp('RECORD', pans[0][0], pans[0][1] - 190, rec + 0.05, t, { col: CHALK, rot: -0.12, size: 64 });
  stamp('LEGEND', pans[1][0], pans[1][1] - 190, leg + 0.05, t, { col: SUN, rot: 0.12, size: 64 });
  txt('MIXED', 540, 200, 64, CHALK, { a: eo(seg(t, TM.mixes - 0.1, TM.mixes + 0.4)), ls: 14 });
  note('hard to separate', 540, 1270, seg(t, leg + 0.4, leg + 1.0), { size: 32 });
}

export function buildA(add, cue) {
  Object.assign(TM, {
    studied: Wd('studied', 0), dam: Wd('dam', 0), ancient: Wd('ancient', 0),
    kallanai: Wd('Kallanai', 1), stone: Wd('stone', 1), kaveri: Wd('Kaveri', 1),
    tradition: Wd('Tradition', 2), early: Wd('early', 2), chola: Wd('Chola', 2), karikala: Wd('Karikala', 2),
    when: Wd('When', 3), nobody: Wd('Nobody', 3), before: Wd('before', 3), second: Wd('second', 3), century: Wd('century', 3),
    sangam: Wd('Sangam', 4), poems: Wd('poems', 4), mixes: Wd('mixes', 4), record: Wd('record', 4), legend: Wd('legend', 4),
  });
  TM.a2 = L(1) - 0.15; TM.a3 = L(2) - 0.15; TM.a4 = L(3) - 0.1; TM.a5 = Wd('Dates', 3) - 0.15; TM.a6 = L(4) - 0.15; TM.a7 = TM.mixes - 0.35;
  const SL = 0.5;
  const s1 = add({ id: 'a1', at: 0, cam: [600, 900], zoom: 0.07, note: 'blank cyanotype sheet; riverbank, survey figure + theodolite, sight line, pen draws low stone weir; ANCIENT stamp', draw: shotRiver });
  cue(0.05, 'swell', { gain: 0.6 }); cue(0.4, 'rumble', { gain: 0.3, dur: 4 }); cue(TM.dam - 0.5, 'chisel', { gain: 0.45 }); cue(TM.ancient + 0.05, 'slam', { gain: 0.7 });

  const s2 = add({ id: 'a2', at: TM.a2, cam: [540, 760], zoom: 0.06, note: 'sheet slides in; drafting ruler, KALLANAI stencil draws itself, THE STONE DAM, Kaveri ribbon + dam marker, compass, stylised not to scale',
    draw: (lt, d, t) => slideOver(s1, t, lt, SL, () => shotTitle(lt, d, t)) });
  cue(TM.a2 + 0.02, 'slide', { gain: 0.6 }); cue(TM.kallanai - 0.2, 'zip', { gain: 0.45 }); cue(TM.stone, 'pop', { gain: 0.6 }); cue(TM.kaveri, 'sparkle', { gain: 0.35 });

  const s3 = add({ id: 'a3', at: TM.a3, cam: [540, 720], zoom: 0.07, note: 'medallion with waving tiger banner (no face/person), crown, KARIKALA name plate, TRADITION stamp',
    draw: (lt, d, t) => slideOver(s2, t, lt, SL, () => shotEmblem(lt, d, t)) });
  cue(TM.a3 + 0.02, 'slide', { gain: 0.55 }); cue(TM.tradition + 0.35, 'thud', { gain: 0.6 }); cue(TM.chola + 0.2, 'sparkle', { gain: 0.45 }); cue(TM.karikala, 'bell', { gain: 0.5 });

  add({ id: 'a4', at: TM.a4, cam: [540, 730], zoom: 0.1, note: 'giant yellow ? stamped over a spinning calendar ring, small ? marks pop, "date: unknown"', draw: shotQuestion });
  cue(TM.when - 0.02, 'slam', { gain: 0.75 }); cue(TM.nobody, 'pop', { gain: 0.45 });

  const s5 = add({ id: 'a5', at: TM.a5, cam: [560, 700], zoom: 0.06, note: 'timeline ruler slides in, BCE | CE divider, fuzzy yellow range bar from BCE to ~2nd c. CE, DATE UNCERTAIN stamp',
    draw: (lt, d, t) => slideOver(null, t, lt, SL, () => shotTimeline(lt, d, t)) });
  cue(TM.a5 + 0.05, 'whoosh', { gain: 0.5 }); cue(TM.before, 'swell', { gain: 0.4 }); cue(TM.century + 0.45, 'thud', { gain: 0.7 });

  const s6 = add({ id: 'a6', at: TM.a6, cam: [540, 700], zoom: 0.07, note: 'palm-leaf bundle (blank ruled leaves) drops in and fans, cord, SANGAM POEMS stencil, dimension line',
    draw: (lt, d, t) => slideOver(s5, t, lt, SL, () => shotPoems(lt, d, t)) });
  cue(TM.a6 + 0.02, 'slide', { gain: 0.55 }); cue(TM.a6 + 0.5, 'plop', { gain: 0.4 }); cue(TM.sangam, 'zip', { gain: 0.4 });

  add({ id: 'a7', at: TM.a7, cam: [540, 760], zoom: 0.06, note: 'leaves fly into two pans of a tilting balance; RECORD and LEGEND stamps, MIXED', draw: shotBalance });
  cue(TM.a7 + 0.1, 'whoosh', { gain: 0.55 }); cue(TM.record + 0.05, 'thud', { gain: 0.6 }); cue(TM.legend + 0.05, 'thud', { gain: 0.65 }); cue(TM.legend + 0.5, 'tock', { gain: 0.4 });
}
