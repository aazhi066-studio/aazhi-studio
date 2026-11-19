// EPISODE 5 · worker B: shots b1-b8 (lines 5 to 9): the idea (rough stone on sand), not a wall but a splitter,
// ≈ 330 m today, the 1800s repairs, the engineer's notebook and the name GRAND ANICUT.
// ART DIRECTION "Survey Blueprint": cyanotype survey sheet, graph grid + grain, self-drawing chalk lines,
// watercolour washes (teal water, ochre stone), one signal colour (sun-yellow), rubber stamps, dimension lines.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';

const BG0 = '#0F2F57', BG1 = '#1B4A80', BGM = '#163F6E', CH = '#EEF4FA', TEAL = '#3FB7B0', OCH = '#C9954A', SUN = '#FFD34D', GRN = '#7FBF6A', NAVY = '#081A33';
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const rgba = (c, a) => { const A = hex(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };
const lg = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const poly = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
const pr = (lt, s, dur = 0.4) => clamp((lt - s) / dur);

// ───────── paper ─────────
let PAPER = null;   // the static sheet (wash, mottling, grid, fixed grain, vignette), rendered once on first draw
function paperSheet() {
  if (PAPER) return PAPER;
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W + 600, H + 600) : Object.assign(document.createElement('canvas'), { width: W + 600, height: H + 600 });
  const g0 = c.getContext('2d'); g0.translate(300, 300);
  const g = (x0, y0, x1, y1, st) => { const q = g0.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, cc]) => q.addColorStop(o, cc)); return q; };
  g0.fillStyle = g(0, -300, 0, H + 300, [[0, BG1], [0.5, BGM], [1, BG0]]); g0.fillRect(-300, -300, W + 600, H + 600);
  for (let i = 0; i < 6; i++) {
    const x = rnd(i + 13) * W, y = rnd(i * 3 + 8) * 1400, r = 300 + rnd(i + 2) * 400;
    const q = g0.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, rnd(i + 5) > 0.5 ? 'rgba(60,120,190,0.12)' : 'rgba(5,20,45,0.14)'); q.addColorStop(1, 'rgba(0,0,0,0)');
    g0.fillStyle = q; g0.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g0.lineWidth = 1.2; g0.strokeStyle = 'rgba(200,225,255,0.06)'; g0.beginPath();
  for (let x = -280; x < W + 300; x += 40) { g0.moveTo(x, -300); g0.lineTo(x, H + 300); }
  for (let y = -280; y < H + 300; y += 40) { g0.moveTo(-300, y); g0.lineTo(W + 300, y); }
  g0.stroke();
  g0.lineWidth = 2; g0.strokeStyle = 'rgba(200,225,255,0.11)'; g0.beginPath();
  for (let x = -280; x < W + 300; x += 200) { g0.moveTo(x, -300); g0.lineTo(x, H + 300); }
  for (let y = -280; y < H + 300; y += 200) { g0.moveTo(-300, y); g0.lineTo(W + 300, y); }
  g0.stroke();
  for (let pass = 0; pass < 2; pass++) {
    g0.beginPath(); for (let i = 0; i < 900; i++) { if ((rnd(i + 77) > 0.45) !== (pass === 0)) continue; g0.rect(rnd(i * 3 + 1) * (W + 600) - 300, rnd(i * 7 + 2) * (H + 600) - 300, 2 + rnd(i) * 2, 2 + rnd(i + 1) * 2); }
    g0.fillStyle = pass === 0 ? 'rgba(220,235,255,0.06)' : 'rgba(0,10,30,0.12)'; g0.fill();
  }
  const v = g0.createRadialGradient(540, 860, 560, 540, 860, 1350); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,10,25,0.5)');
  g0.fillStyle = v; g0.fillRect(-300, -300, W + 600, H + 600);
  return (PAPER = c);
}
function paper(t, seed = 0) {
  ctx.drawImage(paperSheet(), -300, -300);
  grain(t, seed);
}
function grain(t, seed = 0) {
  const f = Math.floor(t * 6);
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    for (let i = 0; i < 70; i++) {
      const k = f * 17 + seed * 31; if ((rnd(i + k) > 0.45) !== (pass === 0)) continue;
      ctx.rect(rnd(i * 3 + k) * (W + 400) - 200, rnd(i * 7 + k + 5) * (H + 400) - 200, 2 + rnd(i) * 2, 2 + rnd(i + 1) * 2);
    }
    ctx.fillStyle = pass === 0 ? 'rgba(220,235,255,0.06)' : 'rgba(0,10,30,0.12)'; ctx.fill();
  }
}
// keep the caption band calm and darker; soft edge vignette
function finish() {
  ctx.fillStyle = lg(0, 1220, 0, 1920, [[0, 'rgba(4,16,36,0)'], [0.25, 'rgba(4,16,36,0.42)'], [0.7, 'rgba(4,16,36,0.5)'], [1, 'rgba(4,16,36,0.3)']]); ctx.fillRect(-300, 1220, W + 600, 1000);
}
// page slide-in: returns the x offset for the content, draws the incoming page edge
function slideIn(lt, dur = 0.42) { const k = eo(clamp(lt / dur)); return (1 - k) * 360; }
function pageEdge(lt, dur = 0.42) {
  const k = eo(clamp(lt / dur)); if (k >= 1) return;
  const ex = (1 - k) * 360 - 10; ctx.fillStyle = lg(ex - 60, 0, ex, 0, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,8,20,${0.5 * (1 - k)})`]]); ctx.fillRect(ex - 60, -300, 60, H + 600);
}

// ───────── pen & line work ─────────
const plen = (p) => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; };
/** draw the first k (0..1) of a polyline; returns the pen tip */
function pen(p, k, col = CH, w = 5, a = 1, chalk = true) {
  k = clamp(k); if (k <= 0 || p.length < 2) return null;
  const lim = plen(p) * k; let acc = 0, tip = p[0];
  const path = () => {
    ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); acc = 0; tip = p[0];
    for (let i = 1; i < p.length; i++) {
      const sl = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      if (acc + sl >= lim) { const f = (lim - acc) / (sl || 1); tip = [lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]; ctx.lineTo(tip[0], tip[1]); break; }
      ctx.lineTo(p[i][0], p[i][1]); acc += sl; tip = p[i];
    }
  };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col;
  path(); ctx.globalAlpha *= a; ctx.lineWidth = w; ctx.stroke();
  if (chalk && w < 14) { ctx.translate(1.6, -1.2); ctx.globalAlpha *= 0.35; ctx.lineWidth = w * 0.5; ctx.stroke(); }
  ctx.restore(); return tip;
}
/** hand-drawn polyline through pts (subdivided with a little wobble) */
function wob(pts, seed = 0, amp = 2.2, step = 36) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(len / step)), nx = -(y1 - y0) / (len || 1), ny = (x1 - x0) / (len || 1);
    for (let j = 1; j <= n; j++) { const f = j / n, o = j === n ? 0 : (rnd(seed + i * 31 + j) - 0.5) * 2 * amp; out.push([lerp(x0, x1, f) + nx * o, lerp(y0, y1, f) + ny * o]); }
  }
  return out;
}
function arrowHead(x, y, ang, col = CH, s = 22, w = 5) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  ctx.moveTo(x + Math.cos(ang + 2.6) * s, y + Math.sin(ang + 2.6) * s); ctx.lineTo(x, y); ctx.lineTo(x + Math.cos(ang - 2.6) * s, y + Math.sin(ang - 2.6) * s); ctx.stroke(); ctx.restore();
}
/** a pen arrow along pts, head appears at the end */
function penArrow(pts, k, col = CH, w = 5) {
  const tip = pen(pts, k, col, w); if (!tip || k < 0.98) return;
  const a = pts[pts.length - 1], b = pts[pts.length - 2]; arrowHead(a[0], a[1], Math.atan2(a[1] - b[1], a[0] - b[0]), col, 22, w);
}
/** horizontal dimension line with end ticks and arrowheads */
function dimH(x0, x1, y, k, col = CH, w = 4) {
  if (k <= 0) return; const m = (x0 + x1) / 2, h = (x1 - x0) / 2 * eio(clamp(k));
  pen([[x0, y - 26], [x0, y + 26]], clamp(k * 4), col, w); pen([[x1, y - 26], [x1, y + 26]], clamp(k * 4), col, w);
  pen([[m, y], [m - h, y]], 1, col, w); pen([[m, y], [m + h, y]], 1, col, w);
  if (k >= 1) { arrowHead(x0, y, Math.PI, col, 20, w); arrowHead(x1, y, 0, col, 20, w); }
}
function dimV(x, y0, y1, k, col = CH, w = 4) {
  if (k <= 0) return; const yy = lerp(y0, y1, eio(clamp(k)));
  pen([[x - 24, y0], [x + 24, y0]], 1, col, w); pen([[x, y0], [x, yy]], 1, col, w);
  if (k >= 1) { pen([[x - 24, y1], [x + 24, y1]], 1, col, w); arrowHead(x, y1, y1 < y0 ? -Math.PI / 2 : Math.PI / 2, col, 20, w); arrowHead(x, y0, y1 < y0 ? Math.PI / 2 : -Math.PI / 2, col, 20, w); }
}

// ───────── type ─────────
function writeText(s, x, y, size, k, o = {}) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  ctx.font = o.font || `700 ${size}px Caladea`; ctx.letterSpacing = (o.ls ?? 0) + 'px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const w = ctx.measureText(s).width, x0 = o.align === 'left' ? 0 : o.align === 'right' ? -w : -w / 2;
  ctx.beginPath(); ctx.rect(x0 - 12, -size, (w + 24) * clamp(k), size * 2); ctx.clip();
  ctx.globalAlpha *= o.alpha ?? 1;
  if (o.shadow) { ctx.fillStyle = 'rgba(2,12,30,0.45)'; ctx.fillText(s, x0 + 4, 5); }
  ctx.fillStyle = o.col || CH; ctx.fillText(s, x0, 0); ctx.restore();
}
const note = (s, x, y, size, k, o = {}) => writeText(s, x, y, size, k, o);
const label = (s, x, y, size, k, o = {}) => writeText(s, x, y, size, k, { ls: 6, shadow: true, ...o, font: `900 ${size}px Inter` });
/** rubber stamp thumped on with a scale bounce */
function stamp(s, x, y, k, o = {}) {
  if (k <= 0) return; const size = o.size || 66, col = o.col || SUN, rot = o.rot ?? -0.08;
  const sc = 1 + 0.85 * (1 - eob(clamp(k))), a = clamp(k * 4) * (o.alpha ?? 0.95);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= a;
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '5px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tw = ctx.measureText(s).width, bw = tw + size * 0.95, bh = size * 1.5;
  ctx.strokeStyle = col; ctx.lineWidth = size * 0.08; ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, size * 0.14); ctx.stroke();
  ctx.lineWidth = size * 0.03; ctx.beginPath(); ctx.roundRect(-bw / 2 + size * 0.15, -bh / 2 + size * 0.15, bw - size * 0.3, bh - size * 0.3, size * 0.08); ctx.stroke();
  ctx.fillStyle = col; ctx.fillText(s, 0, size * 0.05);
  // worn rubber: knock out specks
  ctx.fillStyle = BGM; ctx.globalAlpha *= 0.6;
  for (let i = 0; i < 46; i++) { const r = 1.2 + rnd(i + 3) * 3.2; ctx.beginPath(); ctx.arc((rnd(i + s.length) - 0.5) * bw, (rnd(i * 2 + 9) - 0.5) * bh, r, 0, TAU); ctx.fill(); }
  ctx.restore();
}
/** round date stamp */
function roundStamp(top, mid, x, y, k, o = {}) {
  if (k <= 0) return; const r = o.r || 110, col = o.col || SUN;
  const sc = 1 + 0.85 * (1 - eob(clamp(k))); ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? 0.12); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 4) * 0.95;
  ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r - 16, 0, TAU); ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${r * 0.5}px Inter`; ctx.fillText(mid, 0, 8); ctx.font = `900 ${r * 0.17}px Inter`; ctx.letterSpacing = '4px'; ctx.fillText(top, 0, -r * 0.45);
  ctx.fillText('★', 0, r * 0.5);
  ctx.fillStyle = BGM; ctx.globalAlpha *= 0.6; for (let i = 0; i < 36; i++) { const a = rnd(i + 2) * TAU, rr2 = rnd(i + 5) * r; ctx.beginPath(); ctx.arc(Math.cos(a) * rr2, Math.sin(a) * rr2, 1.2 + rnd(i) * 3, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// ───────── washes & materials ─────────
function wash(pts, col, a = 0.35, seed = 0, edge = 0.8) {
  for (let l = 0; l < 3; l++) {
    const dx = (rnd(seed + l) - 0.5) * 12, dy = (rnd(seed + l + 7) - 0.5) * 12;
    ctx.save(); ctx.translate(dx, dy); poly(pts); ctx.fillStyle = rgba(col, a * 0.42); ctx.fill(); ctx.restore();
  }
  if (edge) { poly(pts); ctx.strokeStyle = rgba(col, a * edge); ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke(); }
}
function blooms(pts, col, n, seed, a = 0.12, r = 120) {
  ctx.save(); poly(pts); ctx.clip();
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, rnd(i + seed)), y = lerp(y0, y1, rnd(i * 3 + seed + 1)), rr2 = r * (0.6 + rnd(i + 4)); const g = ctx.createRadialGradient(x, y, 0, x, y, rr2); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - rr2, y - rr2, rr2 * 2, rr2 * 2); }
  ctx.restore();
}
function hatch(pts, gap = 22, col = CH, a = 0.22, w = 2, ang = 1) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  ctx.save(); poly(pts); ctx.clip(); ctx.strokeStyle = rgba(col, a); ctx.lineWidth = w; ctx.beginPath();
  const h = y1 - y0; for (let x = x0 - h * ang; x < x1 + 10; x += gap) { ctx.moveTo(x, y1); ctx.lineTo(x + h * ang, y0); }
  ctx.stroke(); ctx.restore();
}
function stipple(pts, n, seed, col = CH, a = 0.3) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  ctx.save(); poly(pts); ctx.clip(); ctx.fillStyle = rgba(col, a);
  for (let i = 0; i < n; i++) ctx.fillRect(lerp(x0, x1, rnd(i + seed)), lerp(y0, y1, rnd(i * 5 + seed + 2)), 3, 3);
  ctx.restore();
}
/** irregular rough stone outline */
function stonePts(r, seed, sq = 0.72) {
  const n = 7 + Math.floor(rnd(seed) * 3), out = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU + rnd(seed + i) * 0.5, rr2 = r * (0.74 + rnd(seed * 3 + i) * 0.36); out.push([Math.cos(a) * rr2, Math.sin(a) * rr2 * sq]); }
  return out;
}
function stone(x, y, r, seed, o = {}) {
  const p = stonePts(r, seed, o.sq ?? 0.72);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.sx || 1, o.sy || 1);
  poly(p); ctx.fillStyle = '#76582F'; ctx.fill();
  ctx.save(); ctx.translate((rnd(seed) - 0.5) * r * 0.2, (rnd(seed + 1) - 0.5) * r * 0.2); poly(p); ctx.fillStyle = rgba(OCH, 0.75); ctx.fill(); ctx.restore();
  ctx.save(); poly(p); ctx.clip(); ctx.fillStyle = 'rgba(255,240,210,0.16)'; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.6, r * 0.3, -0.3, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(40,25,10,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 3; i++) { const yy = (rnd(seed + i + 40) - 0.5) * r; ctx.moveTo(-r, yy); ctx.lineTo(r, yy + r * 0.5); } ctx.stroke(); ctx.restore();
  poly(p); ctx.strokeStyle = CH; ctx.lineWidth = o.lw || 4; ctx.lineJoin = 'round'; ctx.globalAlpha *= 0.9; ctx.stroke();
  ctx.restore();
}
/** a dressed (cut, rectangular) block: white outline */
function block(x, y, w, h, seed, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = lg(x, y, x, y + h, [[0, '#4F7DB0'], [1, '#33618F']]); ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(238,244,250,0.12)'; ctx.fillRect(x, y, w, h * 0.3);
  ctx.strokeStyle = CH; ctx.lineWidth = 4; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.strokeStyle = 'rgba(238,244,250,0.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i < 3; i++) { const xx = x + 10 + rnd(seed + i) * (w - 20); ctx.moveTo(xx, y + 8); ctx.lineTo(xx + 6, y + h - 8); } ctx.stroke();
  ctx.restore();
}
function compass(x, y, r, k, t) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate((1 - eob(clamp(k))) * 1.2 + Math.sin(t * 0.8) * 0.03); ctx.globalAlpha *= clamp(k * 3);
  ctx.strokeStyle = CH; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, TAU); ctx.stroke();
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2); poly([[0, -r * 1.05], [r * 0.16, 0], [0, r * 0.1], [-r * 0.16, 0]]); ctx.fillStyle = i === 0 ? SUN : 'rgba(238,244,250,0.75)'; ctx.fill(); ctx.restore(); }
  ctx.fillStyle = SUN; ctx.font = `900 ${r * 0.42}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.rotate(0); ctx.fillText('N', 0, -r * 1.32);
  ctx.restore();
}
function waterBand(path, k, w) {   // wide river band: chalk banks, paper-coloured bed, teal wash, inner sheen
  pen(path, k, CH, w + 10, 0.85, false); pen(path, k, BGM, w, 1, false); pen(path, k, TEAL, w, 0.42, false); pen(path, k, TEAL, w * 0.55, 0.22, false);
}
function cum(p) { const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return c; }
function ptAt(p, c, u) {
  const d = clamp(u) * c[c.length - 1]; let i = 1; while (i < c.length - 1 && c[i] < d) i++;
  const f = (d - c[i - 1]) / ((c[i] - c[i - 1]) || 1); return [lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f), Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])];
}
/** flow dashes travelling along a path (water particles) */
function flow(p, c, t, n, spread, seed, reach = 1, sp = 0.18, col = CH, a = 0.7) {
  ctx.save(); ctx.strokeStyle = rgba(col, a); ctx.lineCap = 'round'; ctx.lineWidth = 4;
  for (let i = 0; i < n; i++) {
    const u = (rnd(i + seed) + t * sp * (0.7 + rnd(i + seed + 3) * 0.6)) % 1; if (u > reach) continue;
    const [x, y, ang] = ptAt(p, c, u), off = (rnd(i * 7 + seed) - 0.5) * spread, nx = -Math.sin(ang), ny = Math.cos(ang), L2 = 14 + rnd(i + 2) * 16;
    const fade = Math.sin(Math.PI * ((u * 9) % 1)) * 0.5 + 0.5;
    ctx.globalAlpha = a * fade; ctx.beginPath(); ctx.moveTo(x + nx * off - Math.cos(ang) * L2, y + ny * off - Math.sin(ang) * L2); ctx.lineTo(x + nx * off, y + ny * off); ctx.stroke();
  }
  ctx.restore();
}
function ripples(x0, x1, y, t, n, seed, a = 0.5) {
  ctx.save(); ctx.strokeStyle = rgba(CH, a); ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = x0 + ((rnd(i + seed) * (x1 - x0) + t * (30 + rnd(i) * 30)) % (x1 - x0)), yy = y + rnd(i * 3 + seed) * 30; ctx.beginPath(); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 14, yy - 6, x + 28, yy); ctx.stroke(); }
  ctx.restore();
}
/** simple dark silhouette of a hand holding a pen, nib at (x, y) */
function penHand(x, y, a = 1, ang = -0.95) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,8,20,0.28)'; ctx.beginPath(); ctx.ellipse(40, 40, 150, 70, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#E9EEF5'; poly([[0, 0], [16, -6], [190, -14], [190, 6], [16, 6]]); ctx.fill();
  ctx.fillStyle = SUN; ctx.fillRect(150, -13, 40, 19);
  ctx.fillStyle = NAVY; ctx.beginPath(); ctx.ellipse(130, 18, 70, 46, -0.15, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(76, 8, 34, 18, -0.2, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(92, 34, 34, 16, 0.2, 0, TAU); ctx.fill();
  ctx.fillRect(150, 10, 200, 70);
  ctx.restore();
}

export function buildB(add, cue) {
  const T1 = L(5), T2 = Wd('laid', 5) - 0.12, T3 = L(6) - 0.1, T4 = Wd('split', 6) - 0.15, T5 = L(7) - 0.1, T6 = L(8) - 0.1, T7 = L(9) - 0.1, T8 = Wd('called', 9) - 0.3;

  // ═════════ b1 · "The idea was simple. Rough, uncut stone..." : river section, rough stones drop through the water onto the sand ═════════
  {
    const bed = wob([[-300, 1010], [200, 1000], [540, 1012], [900, 1000], [1380, 1010]], 3, 6);
    const surf = wob([[-300, 560], [1380, 560]], 9, 5, 60);
    const fin = [[300, 950], [430, 958], [560, 952], [690, 958], [820, 950], [365, 862], [495, 868], [625, 866], [755, 862]];
    const drops = fin.map((f, i) => ({ x: f[0], y: f[1], r: i < 5 ? 74 : 70, ti: 0.3 + i * 0.24, rot: (rnd(i + 50) - 0.5) * 0.5, seed: 100 + i * 11 }));
    const tU = Wd('uncut', 5) - T1, tTitle = 0.05;
    add({ id: 'b1', at: T1, cam: [540, 820], zoom: 0.07, note: 'river cross-section, hatched sand bed, rough ochre stones drop through teal water and settle into a low wall; "rough, uncut" note', draw(lt, d, t) {
      paper(t, 1);
      // water body
      const wat = [...surf, [1380, 1010], ...bed.slice().reverse()];
      wash(wat, TEAL, 0.38, 3, 0); blooms(wat, TEAL, 6, 7, 0.14, 160);
      pen(surf, pr(lt, 0, 0.6), CH, 5);
      ripples(-100, 1180, 590, t, 18, 4, 0.35);
      flow(wob([[-300, 760], [1380, 760]], 1, 0, 200), cum(wob([[-300, 760], [1380, 760]], 1, 0, 200)), t, 26, 340, 9, 1, 0.08, CH, 0.4);
      // sand
      const sand = [...bed, [1380, 1500], [-300, 1500]];
      wash(sand, OCH, 0.6, 5, 0); hatch(sand, 24, CH, 0.18, 2, 0.9); stipple(sand, 220, 3, CH, 0.28);
      pen(bed, pr(lt, 0, 0.7), CH, 6);
      // stones
      for (let i = 0; i < drops.length; i++) {
        const s = drops[i], k = seg(lt, s.ti, s.ti + 0.36); if (k <= 0) continue;
        const y = lerp(-180, s.y, k * k), land = seg(lt, s.ti + 0.36, s.ti + 0.56), sq = Math.sin(Math.PI * land) * 0.13;
        if (land > 0 && land < 1) { ctx.save(); ctx.strokeStyle = rgba(CH, 0.6 * (1 - land)); ctx.lineWidth = 3; for (let j = 0; j < 2; j++) { ctx.beginPath(); ctx.ellipse(s.x, s.y + 50, 60 + land * 90 + j * 30, 10 + land * 12, 0, Math.PI, TAU); ctx.stroke(); } ctx.restore(); }
        stone(s.x, y + sq * 40, s.r, s.seed, { rot: s.rot + (1 - k) * (rnd(i + 3) - 0.5) * 1.4, sx: 1 + sq, sy: 1 - sq });
        if (k < 1) for (let j = 0; j < 4; j++) { const by = y - 60 - j * 40 - ((lt * 200) % 40); if (by > 580) { ctx.strokeStyle = rgba(CH, 0.45); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(s.x + (rnd(j + i) - 0.5) * 60, by, 6 + j * 2, 0, TAU); ctx.stroke(); } }
      }
      // titles and notes
      note('FIG. 1 · SECTION THROUGH THE RIVER', 80, 180, 40, pr(lt, tTitle, 0.6), { align: 'left', alpha: 0.85 });
      label('THE IDEA', 80, 300, 128, pr(lt, 0.15, 0.5), { align: 'left' });
      pen(wob([[86, 380], [640, 380]], 4, 2), pr(lt, 0.5, 0.4), SUN, 6);
      note('rough, uncut', 640, 470, 60, pr(lt, tU, 0.5), { align: 'left', col: SUN, rot: -0.04 });
      penArrow([[700, 500], [660, 610], [590, 760]], pr(lt, tU + 0.3, 0.35), SUN, 5);
      note('sandy river bed', 120, 1110, 46, pr(lt, 1.6, 0.6), { align: 'left' });
      finish();
    } });
    cue(T1 + drops[0].ti + 0.36, 'thud', { gain: 0.6 }); cue(T1 + drops[4].ti + 0.36, 'thud', { gain: 0.55 }); cue(T1 + drops[8].ti + 0.36, 'thud', { gain: 0.65 });
  }

  // ═════════ b2 · "...laid across a sandy river bed." : view across the channel, the low wall is laid bank to bank ═════════
  {
    const prof = wob([[-300, 640], [60, 650], [190, 1010], [890, 1010], [1020, 650], [1380, 640]], 21, 5);
    const ground = [...prof, [1380, 1500], [-300, 1500]];
    const sandBand = [[150, 1010], [930, 1010], [990, 1120], [90, 1120]];
    const tA = Wd('across', 5) - T2, tB = Wd('bed', 5) - T2;
    const wall = [];
    for (let i = 0; i < 12; i++) wall.push({ x: 222 + i * 58, y: 985 + (rnd(i) - 0.5) * 6, r: 34 + rnd(i + 2) * 6, seed: 300 + i * 7, row: 0 });
    for (let i = 0; i < 11; i++) wall.push({ x: 252 + i * 58, y: 940 + (rnd(i + 9) - 0.5) * 6, r: 32 + rnd(i + 4) * 6, seed: 400 + i * 7, row: 1 });
    add({ id: 'b2', at: T2, cam: [540, 860], zoom: 0.06, note: 'view across the channel: banks drawn, sandy bed hatched, a low wall of rough stones laid bank to bank, "unhewn stone"', draw(lt, d, t) {
      paper(t, 2);
      const xo = slideIn(lt); ctx.save(); ctx.translate(xo, 0);
      // water up to the level line
      const wl = 760, wat = [[80, wl], [1000, wl], [890, 1010], [190, 1010]];
      ctx.save(); poly(wat); ctx.clip(); wash(wat, TEAL, 0.42, 4, 0); blooms(wat, TEAL, 4, 9, 0.16, 140); ripples(100, 980, wl + 10, t, 12, 5, 0.4); ctx.restore();
      pen(wob([[110, wl], [970, wl]], 5, 3), pr(lt, 0.4, 0.5), CH, 4, 0.8);
      // earth + sand
      wash(ground, OCH, 0.5, 6, 0); hatch(ground, 30, OCH, 0.35, 2, -0.8); wash(sandBand, OCH, 0.5, 8, 0); stipple(sandBand, 160, 7, CH, 0.35);
      pen(prof, pr(lt, 0, 0.55), CH, 6);
      // the wall, laid left to right
      for (let i = 0; i < wall.length; i++) {
        const s = wall[i], u = (s.x - 200) / 700, ts = lerp(tA - 0.1, tB, u) + s.row * 0.18, k = pr(lt, ts, 0.25); if (k <= 0) continue;
        stone(s.x, s.y - (1 - eo(k)) * 60, s.r, s.seed, { rot: (rnd(i + 7) - 0.5) * 0.6, lw: 3, sx: eob(k), sy: eob(k) });
      }
      ctx.restore();
      note('FIG. 2 · ACROSS THE RIVER', 80, 180, 40, pr(lt, 0.1, 0.5), { align: 'left', alpha: 0.85 });
      label('LAID ACROSS', 80, 300, 112, pr(lt, 0.25, 0.45), { align: 'left' });
      pen(wob([[86, 375], [760, 375]], 8, 2), pr(lt, 0.6, 0.4), SUN, 6);
      note('unhewn stone', 660, 560, 62, pr(lt, tA + 0.2, 0.5), { col: SUN, rot: -0.05 });
      penArrow([[640, 600], [610, 760], [560, 905]], pr(lt, tA + 0.6, 0.35), SUN, 5);
      note('sandy bed', 540, 1170, 46, pr(lt, tB + 0.3, 0.5));
      pageEdge(lt);
      finish();
    } });
    cue(T2, 'slide', { gain: 0.45 }); cue(T2 + tA, 'tock', { gain: 0.4 }); cue(T2 + tB + 0.1, 'tock', { gain: 0.45 });
  }

  // ═════════ b3 · "Not to block the Kaveri..." : plan view, a solid wall blocks the river, crossed out: NOT A WALL ═════════
  {
    const riv = [[540, -320], [548, 200], [536, 760]], down = [[536, 760], [530, 1100], [540, 1460]];
    const rc = cum(riv);
    const tBl = Wd('block', 6) - T3;
    add({ id: 'b3', at: T3, cam: [540, 760], zoom: 0.07, note: 'plan view: river comes down, a solid wall across it (water piles up, dry bed below), yellow X + stamp NOT A WALL, compass, "stylised, not to scale"', draw(lt, d, t) {
      paper(t, 3);
      const xo = slideIn(lt); ctx.save(); ctx.translate(xo, 0);
      // banks: farmland hatch either side
      hatch([[-300, -300], [370, -300], [370, 1500], [-300, 1500]], 34, OCH, 0.22, 2, 0.4); hatch([[710, -300], [1380, -300], [1380, 1500], [710, 1500]], 34, OCH, 0.22, 2, -0.4);
      waterBand(riv, 1, 300);
      // dry bed downstream
      { const db = [[381, 760], [695, 760], [695, 1500], [381, 1500]]; poly(db); ctx.fillStyle = BGM; ctx.fill(); wash(db, OCH, 0.45, 12, 0); pen([[381, 760], [381, 1500]], 1, CH, 5, 0.85); pen([[695, 760], [695, 1500]], 1, CH, 5, 0.85); }
      ctx.save(); poly([[386, 770], [690, 770], [690, 1500], [386, 1500]]); ctx.clip(); stipple([[386, 770], [690, 770], [690, 1500], [386, 1500]], 200, 11, CH, 0.3); ctx.restore();
      // flow, piling at the wall
      ctx.save(); ctx.strokeStyle = rgba(CH, 0.7); ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let i = 0; i < 46; i++) {
        let u = (rnd(i + 3) + lt * 0.22 * (0.7 + rnd(i + 8) * 0.6)) % 1, [x, y] = ptAt(riv, rc, u); const off = (rnd(i * 5) - 0.5) * 240;
        const wallY = 728 - rnd(i + 20) * 70; let len = 22; if (y > wallY) { y = wallY; len = 6; }
        ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.moveTo(x + off, y - len); ctx.lineTo(x + off + (len < 10 ? 10 : 0), y); ctx.stroke();
      }
      ctx.restore();
      // the solid wall
      const kw = pr(lt, 0.15, 0.4);
      ctx.save(); ctx.globalAlpha *= clamp(kw * 3); ctx.fillStyle = '#9C7442'; ctx.fillRect(372, 736, 336 * kw, 46); ctx.strokeStyle = CH; ctx.lineWidth = 5; ctx.strokeRect(372, 736, 336 * kw, 46); ctx.restore();
      hatch([[372, 736], [372 + 336 * kw, 736], [372 + 336 * kw, 782], [372, 782]], 14, CH, 0.4, 2, 1);
      // the X
      const kx = pr(lt, tBl + 0.1, 0.3), kx2 = pr(lt, tBl + 0.3, 0.3);
      pen([[330, 640], [750, 880]], kx, SUN, 16, 1, false); pen([[750, 640], [330, 880]], kx2, SUN, 16, 1, false);
      ctx.restore();
      compass(920, 250, 64, pr(lt, 0.2, 0.6), t);
      note('PLAN · FROM ABOVE', 80, 180, 40, pr(lt, 0.1, 0.5), { align: 'left', alpha: 0.85 });
      note('the Kaveri', 600, 430, 50, pr(lt, Wd('kaveri', 6) - T3, 0.45), { align: 'left', rot: -0.05 });
      stamp('NOT A WALL', 540, 1010, pr(lt, tBl + 0.45, 0.32), { size: 92, rot: -0.09 });
      note('stylised, not to scale', 540, 1250, 34, pr(lt, 0.4, 0.5), { alpha: 0.75 });
      pageEdge(lt);
      finish();
    } });
    cue(T3, 'whoosh', { gain: 0.4 }); cue(T3 + tBl + 0.1, 'zip', { gain: 0.35 }); cue(T3 + tBl + 0.5, 'slam', { gain: 0.7 });
  }

  // ═════════ b4 · "...but to split it, and send water into the fields of the delta." : the weir splits the river into branches feeding a patchwork of fields ═════════
  {
    const M = [[540, -320], [546, 120], [540, 430]];
    const LB = wob([[500, 440], [470, 560], [390, 760], [300, 980], [210, 1250], [150, 1460]], 41, 4, 60), RB = wob([[580, 440], [612, 560], [700, 760], [800, 980], [890, 1250], [950, 1460]], 43, 4, 60);
    const mc = cum(M), lc = cum(LB), rc = cum(RB);
    const chans = [];
    [[LB, lc, 0.3, -1], [LB, lc, 0.55, 1], [LB, lc, 0.72, -1], [RB, rc, 0.3, 1], [RB, rc, 0.55, -1], [RB, rc, 0.72, 1]].forEach(([p, c, u, sd], i) => {
      const [x, y] = ptAt(p, c, u); chans.push(wob([[x, y], [x + sd * 120, y + 40], [x + sd * 250, y + 70 + rnd(i) * 40]], 60 + i, 4, 40));
    });
    const cols = 7, rows = 5, nodes = [];
    for (let r = 0; r <= rows; r++) { const row = []; for (let c = 0; c <= cols; c++) row.push([-80 + c * 175 + (rnd(r * 13 + c) - 0.5) * 60, 600 + r * 160 + (rnd(r * 7 + c + 3) - 0.5) * 50]); nodes.push(row); }
    const fields = [];
    const brX = (y) => [lerp(470, 180, clamp((y - 560) / 800)), lerp(612, 920, clamp((y - 560) / 800))];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const q = [nodes[r][c], nodes[r][c + 1], nodes[r + 1][c + 1], nodes[r + 1][c]], cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2;
      const [bl, br] = brX(cy), dd = Math.min(Math.abs(cx - bl), Math.abs(cx - br));
      fields.push({ q: q.map(([x, y]) => [lerp(x, cx, 0.08), lerp(y, cy, 0.1)]), dt: (cy - 600) / 800 * 0.9 + dd / 500 * 0.7 + rnd(r * 9 + c) * 0.2, seed: r * 10 + c });
    }
    const tSp = Wd('split', 6) - T4, tSe = Wd('send', 6) - T4, tFi = Wd('fields', 6) - T4;
    add({ id: 'b4', at: T4, cam: [540, 700], zoom: 0.06, note: 'plan: the river meets the weir and divides into two branches + side channels; patchwork delta fields fill with water; stamp A SPLITTER', draw(lt, d, t) {
      paper(t, 4);
      // fields: drawn outlines, then they fill (teal flash -> green)
      for (const f of fields) {
        pen([...f.q, f.q[0]], pr(lt, 0.1 + f.dt * 0.4, 0.5), CH, 2.5, 0.45, false);
        const k = pr(lt, tSe + 0.2 + f.dt * 1.2, 0.5), g = pr(lt, tSe + 0.6 + f.dt * 1.2, 0.7);
        if (k > 0) { wash(f.q, TEAL, 0.5 * k * (1 - 0.6 * g), f.seed, 0); if (g > 0) wash(f.q, GRN, 0.5 * g, f.seed + 3, 0.5); }
        if (k > 0 && k < 1) { ctx.save(); poly(f.q); ctx.clip(); const [a0, a1] = [f.q[0], f.q[2]]; ctx.fillStyle = rgba(CH, 0.25 * Math.sin(Math.PI * k)); ctx.fillRect(Math.min(a0[0], a1[0]), Math.min(a0[1], a1[1]), Math.abs(a1[0] - a0[0]), Math.abs(a1[1] - a0[1])); ctx.restore(); }
      }
      // upstream river + weir
      waterBand(M, 1, 270);
      flow(M, mc, t, 40, 220, 2, 1, 0.25, CH, 0.65);
      // branches grow from the weir
      const kb = eio(pr(lt, tSp - 0.1, 0.9));
      for (const [p, c] of [[LB, lc], [RB, rc]]) { pen(p, kb, CH, 100, 0.85, false); pen(p, kb, BGM, 90, 1, false); pen(p, kb, TEAL, 90, 0.45, false); flow(p, c, t, 22, 50, p === LB ? 5 : 8, kb, 0.22, CH, 0.6); }
      chans.forEach((p, i) => { const kc = pr(lt, tSe - 0.2 + i * 0.12, 0.6); pen(p, kc, CH, 22, 0.7, false); pen(p, kc, TEAL, 14, 0.9, false); });
      // the weir
      ctx.save(); ctx.fillStyle = '#9C7442'; ctx.fillRect(392, 406, 296, 42); ctx.restore();
      for (let i = 0; i < 9; i++) stone(410 + i * 33, 427, 20, 700 + i, { lw: 2.5, rot: rnd(i) });
      pen(wob([[392, 404], [688, 404], [688, 450], [392, 450], [392, 404]], 70, 2), pr(lt, 0, 0.5), CH, 4);
      // split arrows
      const ka = pr(lt, tSp + 0.1, 0.4);
      penArrow([[520, 470], [470, 560], [420, 640]], ka, SUN, 7); penArrow([[560, 470], [610, 560], [660, 640]], ka, SUN, 7);
      note('weir', 720, 470, 48, pr(lt, 0.3, 0.4), { align: 'left' });
      stamp('A SPLITTER', 540, 250, pr(lt, tSp + 0.15, 0.32), { size: 88, rot: -0.07 });
      note('delta fields', 860, 1180, 50, pr(lt, tFi, 0.5), { col: SUN, rot: -0.04 });
      compass(940, 170, 52, pr(lt, 0.1, 0.5), t);
      note('stylised, not to scale', 540, 1250, 34, pr(lt, 0.2, 0.5), { alpha: 0.75 });
      finish();
    } });
    cue(T4 + tSp + 0.15, 'thud', { gain: 0.6 }); cue(T4 + tSp, 'zip', { gain: 0.4 }); cue(T4 + tSe + 0.2, 'bubbles', { gain: 0.45 });
  }

  // ═════════ b5 · "Today the structure is about three hundred and thirty metres long." : a measuring tape unrolls along the dam ═════════
  {
    const X0 = 140, X1 = 940, DY = 650, DH = 100;
    const dam = []; for (let i = 0; i < 46; i++) dam.push({ x: X0 + 10 + (i % 23) * 34.5 + (i >= 23 ? 17 : 0), y: DY + 26 + (i >= 23 ? 46 : 0) + (rnd(i) - 0.5) * 6, r: 22 + rnd(i + 3) * 5, seed: 900 + i });
    const tS = Wd('structure', 7) - T5, tM = Wd('metres', 7) - T5 + 0.25;
    add({ id: 'b5', at: T5, cam: [540, 760], zoom: 0.06, note: 'plan: the dam across the river between banks, a yellow measuring tape unrolls along it with a ticking counter to ≈ 330 m, dimension line, stamp TODAY', draw(lt, d, t) {
      paper(t, 5);
      const xo = slideIn(lt); ctx.save(); ctx.translate(xo, 0);
      // banks
      const lb = [[-300, -300], [X0, -300], [X0 - 20, 1500], [-300, 1500]], rb = [[X1, -300], [1380, -300], [1380, 1500], [X1 + 20, 1500]];
      wash(lb, OCH, 0.3, 2, 0); hatch(lb, 28, OCH, 0.4, 2, 0.5); wash(rb, OCH, 0.3, 3, 0); hatch(rb, 28, OCH, 0.4, 2, -0.5);
      // water upstream (deep) and downstream (shallow, foamy)
      const up = [[X0, -300], [X1, -300], [X1, DY], [X0, DY]], dn = [[X0, DY + DH], [X1, DY + DH], [X1 + 20, 1500], [X0 - 20, 1500]];
      wash(up, TEAL, 0.5, 4, 0); blooms(up, TEAL, 5, 3, 0.15, 160); wash(dn, TEAL, 0.3, 5, 0);
      flow([[540, -300], [540, DY - 10]], cum([[540, -300], [540, DY - 10]]), t, 34, 760, 3, 1, 0.12, CH, 0.5);
      ripples(X0 + 10, X1 - 40, DY + DH + 10, t, 26, 8, 0.55);
      pen([[X0, -300], [X0 - 20, 1500]], 1, CH, 5, 0.8); pen([[X1, -300], [X1 + 20, 1500]], 1, CH, 5, 0.8);
      // the dam
      ctx.fillStyle = '#9C7442'; ctx.fillRect(X0, DY, X1 - X0, DH);
      for (let i = 0; i < dam.length; i++) { const s = dam[i]; stone(s.x, s.y, s.r, s.seed, { lw: 2.5, rot: rnd(i + 1) }); }
      ctx.strokeStyle = CH; ctx.lineWidth = 5; ctx.strokeRect(X0, DY, X1 - X0, DH);
      // tape
      const k = eio(pr(lt, tS, tM - tS)), tx = lerp(X0, X1, k), ty = 880;
      if (lt > tS - 0.3) {
        ctx.save(); ctx.fillStyle = 'rgba(0,8,20,0.3)'; ctx.fillRect(X0, ty - 18, tx - X0, 50); ctx.fillStyle = SUN; ctx.fillRect(X0, ty - 24, tx - X0, 46);
        ctx.strokeStyle = NAVY; ctx.fillStyle = NAVY; ctx.lineWidth = 2; ctx.font = '900 18px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.beginPath(); for (let m = 0; m <= 330; m += 10) { const x = X0 + (m / 330) * (X1 - X0); if (x > tx) break; const big = m % 50 === 0; ctx.moveTo(x, ty - 24); ctx.lineTo(x, ty - 24 + (big ? 20 : 10)); } ctx.stroke();
        for (let m = 50; m <= 300; m += 50) { const x = X0 + (m / 330) * (X1 - X0); if (x > tx - 10) break; ctx.fillText(String(m), x, ty + 8); }
        ctx.fillStyle = CH; ctx.fillRect(X0 - 10, ty - 32, 12, 62);
        // the case rolling along at the tape end
        ctx.translate(tx, ty); ctx.fillStyle = 'rgba(0,8,20,0.35)'; ctx.beginPath(); ctx.arc(8, 10, 58, 0, TAU); ctx.fill();
        ctx.fillStyle = NAVY; ctx.beginPath(); ctx.arc(0, 0, 56, 0, TAU); ctx.fill(); ctx.strokeStyle = SUN; ctx.lineWidth = 7; ctx.stroke();
        ctx.rotate(-k * 18); ctx.strokeStyle = CH; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 24, 0, TAU); ctx.moveTo(0, -24); ctx.lineTo(0, 24); ctx.moveTo(-24, 0); ctx.lineTo(24, 0); ctx.stroke();
        ctx.restore();
        const n = Math.round(k * 330); label(`${n} m`, Math.min(tx, 880), ty + 100, 56, 1, { col: CH, ls: 2 });
      }
      // dimension line + result
      dimH(X0, X1, 560, pr(lt, tM, 0.45), SUN, 5);
      const kr = pr(lt, tM + 0.25, 0.3);
      if (kr > 0) { ctx.save(); ctx.translate(540, 470); const sc = 0.6 + 0.4 * eob(kr); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kr * 3); label('≈ 330 m', 0, 0, 150, 1, { col: SUN, ls: 4 }); ctx.restore(); }
      note('length of the weir, approx.', 540, 1080, 42, pr(lt, tM + 0.4, 0.5));
      ctx.restore();
      stamp('TODAY', 240, 230, pr(lt, 0.12, 0.32), { size: 84, rot: -0.12 });
      note('stylised, not to scale', 540, 1170, 34, pr(lt, 0.4, 0.5), { alpha: 0.75 });
      pageEdge(lt);
      finish();
    } });
    cue(T5 + 0.12, 'slam', { gain: 0.6 }); cue(T5 + tS, 'zip', { gain: 0.45 }); cue(T5 + tM + 0.25, 'pop', { gain: 0.55 });
  }

  // ═════════ b6 · "In the eighteen hundreds, British engineers repaired it and raised it." : dressed blocks stacked on the old rough stones ═════════
  {
    const bed = wob([[-300, 1066], [1380, 1066]], 5, 5, 60);
    const old = [];
    for (let i = 0; i < 7; i++) old.push({ x: 300 + i * 80, y: 1024, r: 48, seed: 1200 + i });
    for (let i = 0; i < 6; i++) old.push({ x: 340 + i * 80, y: 958, r: 45, seed: 1300 + i });
    for (let i = 0; i < 4; i++) old.push({ x: 420 + i * 80, y: 898, r: 42, seed: 1400 + i });
    const c1 = [], c2 = [];
    for (let i = 0; i < 5; i++) c1.push({ x: 330 + i * 84, y: 820, w: 84, h: 52 });
    for (let i = 0; i < 4; i++) c2.push({ x: 372 + i * 84, y: 768, w: 84, h: 52 });
    const tE = Wd('eighteen', 8) - T6, tR = Wd('repaired', 8) - T6, tRa = Wd('raised', 8) - T6;
    add({ id: 'b6', at: T6, cam: [540, 820], zoom: 0.06, note: 'cross-section: old rough stone mound on hatched sand, two courses of dressed rectangular blocks drop on top, upstream water rises; 1800s REPAIRS label + round date stamp', draw(lt, d, t) {
      paper(t, 6);
      const r1 = pr(lt, tR, 0.6), r2 = pr(lt, tRa, 0.6);
      const lvl = 905 - 70 * eio(r1) - 52 * eio(r2);
      const upW = [[-300, lvl], [520, lvl], [520, 1066], [-300, 1066]], dnW = [[560, 990], [1380, 990], [1380, 1066], [560, 1066]];
      wash(upW, TEAL, 0.45, 2, 0); blooms(upW, TEAL, 4, 5, 0.15, 150); pen([[-300, lvl], [400, lvl]], 1, CH, 4, 0.7);
      wash(dnW, TEAL, 0.32, 3, 0); pen([[700, 990], [1380, 990]], 1, CH, 4, 0.6);
      ripples(-200, 300, lvl + 8, t, 10, 3, 0.4); ripples(820, 1300, 998, t, 10, 6, 0.4);
      const sand = [...bed, [1380, 1500], [-300, 1500]]; wash(sand, OCH, 0.6, 4, 0); hatch(sand, 24, CH, 0.18, 2, 0.9); stipple(sand, 200, 9, CH, 0.28); pen(bed, 1, CH, 6);
      for (let i = 0; i < old.length; i++) { const s = old[i]; stone(s.x, s.y, s.r, s.seed, { rot: (rnd(i + 2) - 0.5) * 0.5, lw: 3.5 }); }
      // new courses
      const drawCourse = (cs, t0) => cs.forEach((b, i) => { const k = pr(lt, t0 + i * 0.09, 0.22); if (k <= 0) return; block(b.x, b.y - (1 - k * k) * 140, b.w, b.h, 50 + i, clamp(k * 3)); });
      drawCourse(c1, tR - 0.1); drawCourse(c2, tRa - 0.1);
      // labels
      note('OLD · unhewn stone', 80, 1170, 44, pr(lt, 0.3, 0.5), { align: 'left' });
      penArrow([[200, 1135], [260, 1080], [300, 1040]], pr(lt, 0.6, 0.3), CH, 4);
      note('NEW · dressed blocks', 600, 640, 48, pr(lt, tR + 0.3, 0.5), { align: 'left', col: SUN });
      penArrow([[650, 670], [620, 720], [580, 770]], pr(lt, tR + 0.6, 0.3), SUN, 5);
      dimV(860, 905, 768, pr(lt, tRa + 0.2, 0.4), SUN, 5);
      note('raised', 890, 830, 48, pr(lt, tRa + 0.5, 0.4), { align: 'left', col: SUN });
      label('1800s REPAIRS', 540, 300, 104, pr(lt, tE - 0.05, 0.55), { ls: 4 });
      pen(wob([[150, 375], [930, 375]], 12, 2), pr(lt, tE + 0.4, 0.4), SUN, 6);
      roundStamp('REPAIRED', '1800s', 880, 500, pr(lt, Wd('hundreds', 8) - T6 + 0.2, 0.32), { r: 108 });
      note('FIG. 3 · SECTION, BEFORE / AFTER', 80, 170, 38, pr(lt, 0.05, 0.5), { align: 'left', alpha: 0.85 });
      finish();
    } });
    cue(T6 + Wd('hundreds', 8) - T6 + 0.2, 'slam', { gain: 0.6 }); cue(T6 + tR, 'chisel', { gain: 0.45 }); cue(T6 + tRa, 'tock', { gain: 0.55 });
  }

  // ═════════ b7 · "Arthur Cotton is said to have learned from it..." : an engineer's notebook page, a silhouette hand sketches the weir ═════════
  {
    // sketch strokes in page-local coordinates (page centre = 0, 0)
    const S = [];
    S.push(wob([[-330, -40], [330, -40]], 1, 6, 30));                                   // water line
    S.push(wob([[-350, 170], [350, 170]], 2, 4, 30));                                   // bed
    const hump = (x0, x1, y, r, seed) => { const p = []; for (let x = x0; x <= x1; x += r * 2) for (let j = 0; j <= 8; j++) { const a = Math.PI + (j / 8) * Math.PI; p.push([x + r + Math.cos(a) * r, y + Math.sin(a) * r * 0.8 + (rnd(seed + x + j) - 0.5) * 4]); } return p; };
    S.push(hump(-240, 200, 170, 30, 3)); S.push(hump(-210, 170, 120, 30, 7));
    S.push([[-320, 40], [-200, 40]]); S.push([[-225, 25], [-200, 40], [-225, 55]]);           // flow arrow
    S.push([[230, 60], [320, 0]]); S.push([[230, 80], [320, 140]]);                          // split arrows
    const lens = S.map(plen), tot = lens.reduce((a, b) => a + b, 0);
    const tSa = Wd('said', 9) - T7;
    add({ id: 'b7', at: T7, cam: [540, 760], zoom: 0.05, note: 'notebook page slides in, a silhouette hand with pen sketches the weir (stones on sand, flow and split arrows); stamp IS SAID TO', draw(lt, d, t) {
      paper(t, 7);
      const xo = slideIn(lt, 0.4); ctx.save(); ctx.translate(540 + xo, 760); ctx.rotate(-0.035);
      // page
      ctx.fillStyle = 'rgba(0,8,20,0.4)'; ctx.fillRect(-418, -508, 860, 1060);
      ctx.fillStyle = lg(0, -520, 0, 520, [[0, '#2A5E98'], [1, '#22517F']]); ctx.fillRect(-430, -520, 860, 1040);
      ctx.strokeStyle = 'rgba(220,235,255,0.14)'; ctx.lineWidth = 2; ctx.beginPath(); for (let y = -400; y < 500; y += 52) { ctx.moveTo(-430, y); ctx.lineTo(430, y); } ctx.stroke();
      ctx.strokeStyle = rgba(SUN, 0.35); ctx.beginPath(); ctx.moveTo(-340, -520); ctx.lineTo(-340, 520); ctx.stroke();
      for (let i = 0; i < 9; i++) { ctx.strokeStyle = CH; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(-360 + i * 90, -520, 14, 26, 0, 0, TAU); ctx.stroke(); }
      note("ENGINEER'S NOTES", -300, -440, 44, pr(lt, 0.2, 0.5), { align: 'left', alpha: 0.9 });
      note('a weir on sand', -300, -300, 54, pr(lt, 0.35, 0.6), { align: 'left' });
      // the sketch, drawn by the pen
      ctx.save(); ctx.translate(0, 0);
      const k = eio(pr(lt, 0.25, 2.1)); let acc = 0, tip = null;
      const water = [[-330, -40], [330, -40], [350, 170], [-350, 170]];
      wash(water, TEAL, 0.45 * clamp(k * 2.5), 4, 0);
      for (let i = 0; i < S.length; i++) { const kk = clamp((k * tot - acc) / lens[i]); if (kk > 0) { const tp = pen(S[i], kk, i >= 4 ? SUN : CH, 5); if (kk < 1 || i === S.length - 1) tip = tip || (kk < 1 ? tp : null); } acc += lens[i]; }
      if (k >= 1) tip = null;
      note('split, not block', -60, 330, 50, pr(lt, 2.0, 0.5), { col: SUN });
      if (lt < 2.5) { const p = tip || [S[0][0][0], S[0][0][1]]; penHand(p[0], p[1], clamp(lt / 0.3) * clamp((2.6 - lt) / 0.3)); }
      ctx.restore();
      note('sketch: illustrative', 400, 480, 30, pr(lt, 0.5, 0.4), { align: 'right', alpha: 0.7 });
      ctx.restore();
      stamp('IS SAID TO', 700, 590, pr(lt, tSa + 0.05, 0.32), { size: 78, rot: 0.1 });
      pageEdge(lt, 0.4);
      finish();
    } });
    cue(T7, 'slide', { gain: 0.45 }); cue(T7 + 0.3, 'chisel', { gain: 0.3 }); cue(T7 + tSa + 0.05, 'thud', { gain: 0.6 });
  }

  // ═════════ b8 · "...and the British called it the Grand Anicut." : GRAND ANICUT in big stencil letters ═════════
  {
    const tG = Wd('grand', 9) - T8, tA = Wd('anicut', 9) - T8;
    const ghost = wob([[120, 1080], [960, 1080]], 3, 3, 40);
    add({ id: 'b8', at: T8, cam: [540, 700], zoom: 0.08, note: 'title card: "the British called it", GRAND / ANICUT stencil letters thump in one by one, drafting ruler slides in and a yellow underline is ruled, stamp frame', draw(lt, d, t) {
      paper(t, 8);
      // ghost of the weir below
      ctx.save(); ctx.globalAlpha *= 0.55;
      wash([[120, 980], [960, 980], [960, 1080], [120, 1080]], TEAL, 0.35, 2, 0);
      for (let i = 0; i < 14; i++) stone(160 + i * 58, 1050, 30, 1600 + i, { lw: 2.5 });
      pen(ghost, 1, CH, 4); ctx.restore();
      note('the British called it', 540, 290, 58, pr(lt, 0.05, 0.6));
      // stencil letters
      const word = (s, y, t0) => {
        ctx.save(); ctx.font = '900 205px Inter'; ctx.letterSpacing = '0px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        const ws = [...s].map((ch) => ctx.measureText(ch).width), gap = 14, totW = ws.reduce((a, b) => a + b, 0) + gap * (s.length - 1); let x = 540 - totW / 2;
        [...s].forEach((ch, i) => {
          const k = pr(lt, t0 + i * 0.06, 0.26); if (k > 0) {
            const sc = 1 + 0.9 * (1 - eob(k)), cx = x + ws[i] / 2;
            ctx.save(); ctx.translate(cx, y); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k * 3);
            ctx.beginPath(); ctx.rect(-200, -200, 400, 190); ctx.rect(-200, 8, 400, 200); ctx.clip();   // stencil bridge
            ctx.fillStyle = 'rgba(2,12,30,0.5)'; ctx.fillText(ch, -ws[i] / 2 + 6, 8); ctx.fillStyle = CH; ctx.fillText(ch, -ws[i] / 2, 0);
            ctx.restore();
          }
          x += ws[i] + gap;
        });
        ctx.restore();
      };
      word('GRAND', 500, tG - 0.05); word('ANICUT', 720, tA - 0.05);
      // drafting ruler and the ruled underline
      const kr = eo(pr(lt, 0.1, 0.5)), rx = lerp(-900, 110, kr);
      ctx.save(); ctx.translate(rx, 850); ctx.fillStyle = 'rgba(0,8,20,0.35)'; ctx.fillRect(6, 8, 860, 64); ctx.fillStyle = 'rgba(230,240,250,0.85)'; ctx.fillRect(0, 0, 860, 64);
      ctx.strokeStyle = NAVY; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 86; i++) { ctx.moveTo(i * 10, 0); ctx.lineTo(i * 10, i % 10 === 0 ? 26 : i % 5 === 0 ? 18 : 10); } ctx.stroke();
      ctx.fillStyle = NAVY; ctx.font = '900 16px Inter'; ctx.textAlign = 'center'; for (let i = 1; i < 9; i++) ctx.fillText(String(i), i * 100, 42); ctx.restore();
      pen([[130, 836], [950, 836]], pr(lt, 0.5, 0.6), SUN, 9, 1, false);
      // stamp frame ruled around the name
      const kf = pr(lt, tA + 0.5, 0.6);
      pen(wob([[90, 380], [990, 380], [990, 800], [90, 800], [90, 380]], 9, 3, 60), kf, SUN, 6);
      note('a British name for the Kallanai', 540, 960, 44, pr(lt, tA + 0.6, 0.5), { alpha: 0.9 });
      finish();
    } });
    cue(T8 + tG - 0.05, 'slam', { gain: 0.75 }); cue(T8 + tA - 0.05, 'thud', { gain: 0.6 }); cue(T8 + tA + 0.5, 'sparkle', { gain: 0.45 });
  }
}
// b1 river section, stones drop onto sand · b2 across-channel view, wall laid bank to bank · b3 plan, solid wall crossed out NOT A WALL · b4 plan, weir splits river into branches + delta fields fill, A SPLITTER · b5 plan, tape unrolls along dam to ≈ 330 m, TODAY · b6 section, dressed-block courses on old stones, 1800s REPAIRS + round stamp · b7 notebook page, silhouette hand sketches weir, IS SAID TO · b8 GRAND / ANICUT stencil title with ruler + underline
