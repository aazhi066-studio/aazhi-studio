// EPISODE 20 · worker B : "Forged Iron & Rust", lines 4-7 (L(4) -> L(8)).
//   b1  rivet map: c. 1767 slams, a Company route is hot-cut (dotted) from the north-east past Madurai to the NERKATTUMSEVAL rivet, which flares
//   b2  rust sky: the cut-iron fort on its hill, three rows of red-coated musket silhouettes march at it; CAMPBELL (bicorne) slides in, ILLUSTRATION; flag torn down on "took"
//   b3  THE STORY SPLITS: a riveted slab is hot-cut down the middle, bursts apart in sparks, three hot paths fork behind it; rust bloom wipe out
//   b4  LEGEND SAYS: two iron forearm cut-outs, the shackles slam shut on "captured", chain drops between them, sparks
//   b5  moonlit cold-blue gopuram (ILLUSTRATION), glowing doorway; the chained figure walks in, the two guards stay outside; ONE LAST PRAYER
//   b6  closer on the gopuram: its stepped outline is moon-cut, guards flank the glowing door; SANKARANKOVIL
//   b7  behind the two spear guards facing the doorway; CRACK: a white flash bursts out of the door, sparks, the lintel cracks
//   b8  inside: lamp niche, stone floor, BROKEN CHAINS glowing on the floor, the snapped link halves
//   b9  NEVER SEEN AGAIN: the empty doorway, cold smoke and embers rising, an empty chain swinging from the lintel
// Heavy art (plates, map, fort, figures, gopuram, wall, interior) is baked once with cached(); per frame only blits,
// a few strokes, chain links and sparks. No shadowBlur anywhere.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, smoke, mixc } from './art.js';
import * as K from './core/kit.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const EMB = '255,122,26', HOTC = '255,193,90', MOON = '143,179,201';

// ───────────── shared helpers (copied exactly from ART.md) ─────────────
// blackened iron plate filling the frame (cached): gradient + brushed grain + scratches + rust blooms + vignette
function plateImg(key = 'plate20', rust = 1) {
  return cached(key, W, H, 1, () => { const c = ctx;
    const g = c.createRadialGradient(540, 800, 150, 540, 960, 1300); g.addColorStop(0, '#2E2822'); g.addColorStop(0.6, '#211C18'); g.addColorStop(1, '#0E0C0A');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) { const y = rnd(i) * H, x = rnd(i + 5) * W, l = 40 + rnd(i + 9) * 260, v = rnd(i + 13);
      c.fillStyle = v > 0.5 ? `rgba(200,190,175,${0.015 + v * 0.03})` : `rgba(0,0,0,${0.05 + v * 0.08})`; c.fillRect(x, y, l, 1 + (v * 2 | 0)); }
    for (let i = 0; i < 70; i++) { c.beginPath(); const x = rnd(i + 99) * W, y = rnd(i + 199) * H, a = (rnd(i + 299) - 0.5) * 0.6, l = 30 + rnd(i + 399) * 140;
      c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.strokeStyle = 'rgba(220,210,195,0.07)'; c.lineWidth = 1; c.stroke(); }
    for (let i = 0; i < 26 * rust; i++) { const x = rnd(i + 501) * W, y = rnd(i + 601) * H, r = 30 + rnd(i + 701) * 160;
      const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(138,59,23,${0.18 + rnd(i + 801) * 0.2})`); rg.addColorStop(0.6, 'rgba(94,42,18,0.10)'); rg.addColorStop(1, 'rgba(94,42,18,0)');
      c.fillStyle = rg; c.fillRect(x - r, y - r, r * 2, r * 2); }
    const v = c.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  });
}
// domed rivet
function rivet(x, y, r = 9) { const c = ctx; const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r);
  g.addColorStop(0, '#8C8378'); g.addColorStop(0.5, '#3E3731'); g.addColorStop(1, '#120F0D'); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = g; c.fill(); }
// hot-cut stroke along pts ([x,y] list): p = 0..1 reveal; newest ~12% of the drawn length glows white-hot -> orange, older part cools to dull red/dark
function hotCut(pts, p = 1, w = 6, cool = 0.6) { const c = ctx, n = Math.max(2, Math.floor(pts.length * p)); if (n < 2) return; const hot = Math.max(2, Math.floor(n * 0.12));
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); for (let i = 0; i < n; i++) i ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.strokeStyle = `rgba(168,50,26,${0.35 + 0.5 * (1 - cool)})`; c.lineWidth = w; c.stroke();
  c.beginPath(); for (let i = n - hot; i < n; i++) i > n - hot ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.strokeStyle = '#FF7A1A'; c.lineWidth = w * 1.4; c.stroke();
  c.strokeStyle = '#FFE6A8'; c.lineWidth = w * 0.5; c.stroke();
  if (p < 1) { const [x, y] = pts[n - 1]; K.glow(x, y, w * 7, '255,190,100', 0.8); } }
// spark spray at (x,y): t = seconds since the burst, n sparks, seed
function sparks(x, y, t, n = 24, seed = 1, spd = 700) { const c = ctx; if (t < 0 || t > 1.2) return;
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(seed + i) - 0.5) * 2.6, v = spd * (0.4 + rnd(seed + i * 3) * 0.8), life = 0.5 + rnd(seed + i * 7) * 0.6; if (t > life) continue;
    const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + 900 * t * t, k = 1 - t / life;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px - Math.cos(a) * 18 * k, py - (Math.sin(a) * v + 1800 * t) / v * 18 * k);
    c.strokeStyle = `rgba(255,${150 + 90 * k | 0},${60 * k | 0},${k})`; c.lineWidth = 2.5; c.stroke(); } }

// ───────────── small helpers ─────────────
const pop = (lt, t0, d = 0.3) => (lt < t0 ? 0 : eob(clamp((lt - t0) / d)));
const pathP = (P, step = 14) => { const o = []; for (let i = 0; i < P.length - 1; i++) { const [x0, y0] = P[i], [x1, y1] = P[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
  for (let k = 0; k < n; k++) o.push([lerp(x0, x1, k / n), lerp(y0, y1, k / n)]); } o.push(P[P.length - 1]); return o; };
const quadP = (x0, y0, cx, cy, x1, y1, n = 50) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u; o.push([a * x0 + b * cx + d * x1, a * y0 + b * cy + d * y1]); } return o; };
const polyPath = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
/** cut-out silhouette: parts = [[pathFn, fill]]; a rim pass offset by (dx,dy) leaves a thin bright bevel edge on the lit side */
function cutout(parts, rim, dx = -3, dy = -3) { const c = ctx;
  c.save(); c.translate(dx, dy); for (const [p] of parts) { p(c); c.fillStyle = rim; c.fill(); } c.restore();
  for (const [p, f] of parts) { p(c); c.fillStyle = f; c.fill(); } }
/** brushed grain + rust specks over whatever is already opaque in the current (cache) canvas */
function ironFinish(w, h, seed = 1, tint = '200,190,175', rust = 1) { const c = ctx; c.save(); c.globalCompositeOperation = 'source-atop';
  const n = Math.min(900, (w * h / 700) | 0);
  for (let i = 0; i < n; i++) { const v = rnd(seed + i * 1.3); c.fillStyle = v > 0.5 ? `rgba(${tint},${0.02 + v * 0.05})` : `rgba(0,0,0,${0.06 + v * 0.1})`;
    c.fillRect(rnd(seed + i * 3.1) * w - 40, rnd(seed + i * 5.7) * h, 20 + rnd(seed + i * 7.3) * 120, 1 + (v * 2 | 0)); }
  for (let i = 0; i < 8 * rust; i++) { const x = rnd(seed + i * 11) * w, y = rnd(seed + i * 13) * h, r = 20 + rnd(seed + i * 17) * 70;
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(138,59,23,0.35)'); g.addColorStop(1, 'rgba(94,42,18,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.restore(); }
/** cold moon variant of hotCut (for temple outlines) */
function moonCut(pts, p = 1, w = 4) { const c = ctx, n = Math.max(2, Math.floor(pts.length * p)); if (p <= 0.01) return; const hot = Math.max(2, Math.floor(n * 0.1));
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); for (let i = 0; i < n; i++) i ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.strokeStyle = 'rgba(143,179,201,0.55)'; c.lineWidth = w; c.stroke();
  c.beginPath(); for (let i = n - hot; i < n; i++) i > n - hot ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.strokeStyle = '#E8F2F8'; c.lineWidth = w * 1.2; c.stroke();
  if (p < 1) { const [x, y] = pts[n - 1]; K.glow(x, y, 50, '210,230,240', 0.7); } }
/** continuous spark spray at a moving cutting head */
function spray(x, y, lt, seed = 1, n = 8, spd = 450) { for (let k = 0; k < 3; k++) { const ph = lt + k * 0.13, cyc = Math.floor(ph / 0.38); sparks(x, y, ph % 0.38, n, seed + k * 31 + cyc * 7, spd); } }
/** decaying flash 0..1 after t0 */
const flash = (lt, t0, k = 4) => (lt < t0 ? 0 : Math.exp(-(lt - t0) * k));
/** screen shake offset after t0 */
const shake = (lt, t0, amp = 18) => { const f = flash(lt, t0, 6); return [(rnd(Math.floor(lt * 60)) - 0.5) * amp * f, (rnd(Math.floor(lt * 60) + 9) - 0.5) * amp * f]; };

// ───────────── stencil labels ─────────────
function stencilImg(text, size) {
  ctx.save(); ctx.font = `900 ${size}px Inter`; const ls = Math.round(size * 0.08); ctx.letterSpacing = `${ls}px`; const tw = ctx.measureText(text).width; ctx.restore();
  const w = Math.ceil(tw + size * 1.3), h = Math.ceil(size * 1.6);
  return cached(`bst_${text}_${size}`, w + 40, h + 40, 1.5, () => { const c = ctx; c.translate(20, 20);
    c.beginPath(); c.roundRect(5, 8, w, h, size * 0.12); c.fillStyle = 'rgba(0,0,0,0.55)'; c.fill();
    c.beginPath(); c.roundRect(-2, -2, w, h, size * 0.12); c.fillStyle = 'rgba(255,215,175,0.35)'; c.fill();
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3B332C'); g.addColorStop(1, '#1A1613');
    c.beginPath(); c.roundRect(0, 0, w, h, size * 0.12); c.fillStyle = g; c.fill();
    c.save(); c.clip(); for (let i = 0; i < 60; i++) { const v = rnd(i + size); c.fillStyle = v > 0.5 ? 'rgba(220,205,190,0.05)' : 'rgba(0,0,0,0.12)'; c.fillRect(rnd(i * 3 + size) * w - 30, rnd(i * 7 + size) * h, 30 + v * 90, 1); }
    c.save(); c.translate(w / 2, h / 2); c.scale(1, h / w); const rg = c.createRadialGradient(0, 0, 0, 0, 0, w * 0.55); rg.addColorStop(0, 'rgba(255,122,26,0.30)'); rg.addColorStop(1, 'rgba(255,122,26,0)');
    c.fillStyle = rg; c.fillRect(-w, -w, 2 * w, 2 * w); c.restore(); c.restore();
    c.font = `900 ${size}px Inter`; c.letterSpacing = `${ls}px`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#7A2E12'; c.fillText(text, w / 2 + ls / 2 + 2, h / 2 + size * 0.06 + 2);
    c.fillStyle = '#FFB25A'; c.fillText(text, w / 2 + ls / 2, h / 2 + size * 0.06);
    c.letterSpacing = '0px';
    const bw = Math.max(2, size * 0.065); c.fillStyle = '#2A241F';
    for (const f of [0.27, 0.52, 0.76]) c.fillRect(w / 2 - tw / 2 + tw * f - bw / 2, h / 2 - size * 0.45, bw, size * 0.9);
    const r = Math.max(3, size * 0.09), m = size * 0.24; rivet(m, m, r); rivet(w - m, m, r); rivet(m, h - m, r); rivet(w - m, h - m, r);
  });
}
function stencil(text, x, y, size, a = 1, sc = 1, rot = 0) {
  if (a <= 0.01) return; const c = stencilImg(text, size), cw = c.width / c._q, ch = c.height / c._q;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); blit(c, cw / 2, ch / 2, 0, 0, sc, clamp(a)); ctx.restore();
}
/** label that slams in at t0 (scale from big, quick fade) with a little spark spit at both ends */
function slamLab(text, x, y, size, lt, t0, o = {}) {
  if (lt < t0) return; const p = clamp((lt - t0) / 0.22), a = (o.a ?? 1) * clamp(p * 2.5);
  stencil(text, x, y, size, a, (o.sc ?? 1) * (1 + 0.5 * (1 - eo(p))), o.rot || 0);
  if (o.sp !== false) { const hw = text.length * size * 0.36; sparks(x - hw, y, lt - t0 - 0.2, 10, size + 3, 380); sparks(x + hw, y, lt - t0 - 0.2, 10, size + 7, 380); }
}
const legend = (lt, t0 = -1) => stencil('LEGEND SAYS', 540, 140, 34, lt < t0 ? 0 : clamp((lt - t0) / 0.2), lt < t0 ? 1 : 1 + 0.3 * (1 - eo(clamp((lt - t0) / 0.25))));
const illus = (x, y, a = 1) => stencil('ILLUSTRATION', x, y, 22, a * 0.9);

// ───────────── chain ─────────────
/** one face-on link (rounded ring): dark iron core + ember edge; flat squashes it on the floor plane */
function link(x, y, ang, len = 70, wid = 40, th = 12, edge = 1, flat = 1) { const c = ctx;
  c.save(); c.translate(x, y); c.scale(1, flat); c.rotate(ang);
  c.beginPath(); c.roundRect(-len / 2, -wid / 2, len, wid, wid / 2); c.lineWidth = th; c.strokeStyle = '#1E1915'; c.stroke();
  c.beginPath(); c.roundRect(-len / 2 - th * 0.38, -wid / 2 - th * 0.38, len + th * 0.76, wid + th * 0.76, wid / 2 + th * 0.38);
  c.lineWidth = th * 0.24; c.strokeStyle = `rgba(${EMB},${0.35 + 0.65 * edge})`; c.stroke();
  c.beginPath(); c.roundRect(-len / 2 + th * 0.4, -wid / 2 + th * 0.4, len - th * 0.8, wid - th * 0.8, wid / 2 - th * 0.4); c.lineWidth = th * 0.16; c.strokeStyle = `rgba(${HOTC},${0.5 * edge})`; c.stroke();
  c.restore(); }
/** edge-on link: a thick bar */
function linkE(x, y, ang, len = 70, th = 12, edge = 1, flat = 1) { const c = ctx;
  c.save(); c.translate(x, y); c.scale(1, flat); c.rotate(ang); c.lineCap = 'round';
  c.beginPath(); c.moveTo(-len / 2, 0); c.lineTo(len / 2, 0); c.lineWidth = th * 1.3; c.strokeStyle = '#1E1915'; c.stroke();
  c.beginPath(); c.moveTo(-len / 2 + 4, -th * 0.5); c.lineTo(len / 2 - 4, -th * 0.5); c.lineWidth = th * 0.25; c.strokeStyle = `rgba(${EMB},${0.35 + 0.65 * edge})`; c.stroke();
  c.restore(); }
/** chain along a list of points (centres), alternating face / edge links */
function chainPts(pts, o = {}) { const len = o.len ?? 70, wid = o.wid ?? 40, th = o.th ?? 12, e = o.edge ?? 1, fl = o.flat ?? 1;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], a = Math.atan2(y1 - y0, x1 - x0), x = (x0 + x1) / 2, y = (y0 + y1) / 2;
    if (o.skip && o.skip.includes(i)) continue;
    i % 2 ? linkE(x, y, a, len, th, e, fl) : link(x, y, a, len, wid, th, e, fl); } }
/** points spaced along a sagging quadratic from (x0,y0) to (x1,y1) */
function sagPts(x0, y0, x1, y1, sag, n) { const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + sag; const o = []; for (let i = 0; i <= n; i++) { const u = i / n; o.push([(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y1]); } return o; }

// ───────────── transitions ─────────────
/** rust bloom: rust blobs spread from (x,y); p = 0..1 (1 = frame fully rusted) */
function rustBloom(p, x = 540, y = 700, seed = 5) { if (p <= 0) return; const c = ctx, cols = ['#5E2A12', '#8A3B17', '#6E3015', '#B5541F', '#4A200E'];
  c.save(); c.globalAlpha = clamp(p * p * 1.2); c.fillStyle = '#3E1A0B'; c.fillRect(-300, -300, W + 600, H + 600); c.globalAlpha = 1;
  for (let i = 0; i < 26; i++) { const a = rnd(seed + i) * TAU, dist = rnd(seed + i * 3) * 900 * eo(p), r = (80 + rnd(seed + i * 5) * 380) * eo(p) * (0.5 + p * 1.3);
    c.fillStyle = cols[i % 5]; c.globalAlpha = 0.55 + 0.45 * p; c.beginPath();
    for (let k = 0; k <= 14; k++) { const b = k / 14 * TAU, rr = r * (0.8 + 0.25 * sin(b * 3 + i) + 0.1 * rnd(i * 17 + k)); const px = x + cos(a) * dist + cos(b) * rr, py = y + sin(a) * dist * 1.4 + sin(b) * rr; k ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.closePath(); c.fill(); }
  c.restore(); }

// ───────────── backgrounds ─────────────
function rustBgImg() { return cached('bRustBg', W, H, 1, () => { const c = ctx; blit(plateImg(), 0, 0, 0, 0, 1);
  const g = c.createLinearGradient(0, 0, 0, 1000); g.addColorStop(0, 'rgba(181,84,31,0.32)'); g.addColorStop(0.75, 'rgba(138,59,23,0.18)'); g.addColorStop(1, 'rgba(94,42,18,0)'); c.fillStyle = g; c.fillRect(0, 0, W, 1000);
  const h = c.createLinearGradient(0, 760, 0, 980); h.addColorStop(0, 'rgba(255,122,26,0)'); h.addColorStop(0.7, 'rgba(255,122,26,0.16)'); h.addColorStop(1, 'rgba(255,122,26,0)'); c.fillStyle = h; c.fillRect(0, 760, W, 220); }); }
function moonBgImg() { return cached('bMoonBg', W, H, 1, () => { const c = ctx; blit(plateImg(), 0, 0, 0, 0, 1);
  c.fillStyle = 'rgba(14,30,44,0.55)'; c.fillRect(0, 0, W, H);
  const hg = c.createRadialGradient(820, 360, 40, 820, 360, 520); hg.addColorStop(0, 'rgba(143,179,201,0.32)'); hg.addColorStop(1, 'rgba(143,179,201,0)'); c.fillStyle = hg; c.fillRect(0, 0, W, 1100);
  for (let i = 0; i < 80; i++) { const x = rnd(i + 40) * W, y = rnd(i + 90) * 1000, r = 0.8 + rnd(i + 3) * 1.8; c.fillStyle = `rgba(220,235,245,${0.25 + rnd(i + 7) * 0.5})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  const mg = c.createRadialGradient(800, 340, 10, 820, 360, 76); mg.addColorStop(0, '#EEF4F7'); mg.addColorStop(0.7, '#BBD0DD'); mg.addColorStop(1, '#8FB3C9');
  c.beginPath(); c.arc(820, 360, 74, 0, TAU); c.fillStyle = mg; c.fill();
  for (const [dx, dy, r] of [[-20, -14, 14], [18, 20, 10], [26, -26, 7], [-8, 30, 8]]) { c.beginPath(); c.arc(820 + dx, 360 + dy, r, 0, TAU); c.fillStyle = 'rgba(78,106,124,0.25)'; c.fill(); }
  const v = c.createLinearGradient(0, 1150, 0, 1400); v.addColorStop(0, 'rgba(8,10,12,0)'); v.addColorStop(1, 'rgba(8,10,12,0.6)'); c.fillStyle = v; c.fillRect(0, 1150, W, 770); }); }
/** calm dark plate under the captions (drawn after scene, before labels) */
function calm(y0 = 1270) { const g = ctx.createLinearGradient(0, y0, 0, y0 + 90); g.addColorStop(0, 'rgba(12,10,9,0)'); g.addColorStop(1, 'rgba(12,10,9,0.92)'); ctx.fillStyle = g; ctx.fillRect(-300, y0, W + 600, 90); ctx.fillStyle = 'rgba(12,10,9,0.92)'; ctx.fillRect(-300, y0 + 90, W + 600, H); }
function bg(img, dx = 0, dy = 0, s = 1.08) { ctx.fillStyle = '#0E0C0A'; ctx.fillRect(-300, -300, W + 600, H + 600); blit(img, 540, 960, 540 + dx, 960 + dy, s); }

// ───────────── map (b1) ─────────────
const LAND = [[40, -60], [160, 120], [205, 330], [262, 560], [330, 780], [410, 980], [480, 1130], [540, 1225], [602, 1168], [662, 1058], [730, 935], [805, 828], [905, 728], [880, 690], [935, 560], [968, 380], [1015, 150], [1120, -60]];
const PL = { mad: [690, 560], san: [478, 800], ner: [432, 858] };
function mapImg() { return cached('bMap', W, H, 1, () => { const c = ctx; blit(plateImg(), 0, 0, 0, 0, 1);
  c.strokeStyle = 'rgba(143,179,201,0.06)'; c.lineWidth = 2; for (let y = 60; y < 1300; y += 34) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y + 8); c.stroke(); }
  polyPath(c, LAND); c.save(); c.translate(-4, -5); c.fillStyle = 'rgba(255,170,110,0.35)'; c.fill(); c.restore();
  polyPath(c, LAND); c.save(); c.translate(8, 12); c.fillStyle = 'rgba(0,0,0,0.55)'; c.fill(); c.restore();
  const g = c.createLinearGradient(0, 0, 0, 1250); g.addColorStop(0, '#4A4037'); g.addColorStop(1, '#342B24'); polyPath(c, LAND); c.fillStyle = g; c.fill();
  c.save(); polyPath(c, LAND); c.clip();
  for (let i = 0; i < 700; i++) { const v = rnd(i + 3000); c.fillStyle = v > 0.5 ? `rgba(220,205,190,${0.02 + v * 0.04})` : `rgba(0,0,0,${0.06 + v * 0.08})`; c.fillRect(rnd(i + 3100) * W, rnd(i + 3200) * 1300, 30 + rnd(i + 3300) * 160, 1 + (v * 2 | 0)); }
  for (let i = 0; i < 14; i++) { const x = 150 + rnd(i + 3400) * 800, y = rnd(i + 3500) * 1200, r = 40 + rnd(i + 3600) * 120; const rg = c.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'rgba(138,59,23,0.3)'); rg.addColorStop(1, 'rgba(94,42,18,0)'); c.fillStyle = rg; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.restore();
  const coast = pathP(LAND.slice(1, -1), 30); coast.forEach(([x, y]) => rivet(x, y, 7));
  for (const k of ['mad', 'san', 'ner']) { const [x, y] = PL[k]; c.beginPath(); c.arc(x, y, 22, 0, TAU); c.fillStyle = '#120F0D'; c.fill(); rivet(x, y, 15); }
}); }
const ROUTE = quadP(1000, 150, 760, 420, 690, 560, 30).concat(quadP(690, 560, 560, 640, 432, 858, 30).slice(1));

// ───────────── figures (all cached) ─────────────
const P = (pts) => (c) => polyPath(c, pts);
const E = (x, y, rx, ry) => (c) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); };
function officerImg() { return cached('bOff', 520, 1160, 1, () => { const c = ctx; c.translate(260, 1140);
  const coat = mixc('#2B2520', '#7A2A20', 0.75), dk = '#1C1815';
  cutout([
    [P([[-80, 0], [-16, 0], [-22, -60], [-14, -440], [-84, -440], [-72, -60]]), dk],
    [P([[16, 0], [98, 0], [94, -22], [62, -60], [74, -440], [10, -440], [16, -60]]), dk],
    [P([[-96, -560], [-84, -566], [-150, -150], [-168, -152]]), dk],
    [P([[-120, -330], [-40, -362], [0, -430], [40, -362], [120, -330], [100, -600], [108, -790], [64, -842], [-64, -842], [-108, -790], [-100, -600]]), coat],
    [P([[-108, -790], [-148, -700], [-152, -560], [-120, -540], [-112, -680], [-84, -760]]), coat],
    [E(-136, -530, 24, 26), dk],
    [P([[108, -790], [170, -680], [122, -578], [96, -600], [132, -680], [84, -760]]), coat],
    [(c) => { c.beginPath(); c.rect(-20, -885, 40, 55); }, dk],
    [E(0, -905, 46, 56), dk],
    [(c) => { c.beginPath(); c.moveTo(-152, -930); c.quadraticCurveTo(-74, -972, -44, -1012); c.quadraticCurveTo(0, -1052, 44, -1012); c.quadraticCurveTo(74, -972, 152, -930); c.quadraticCurveTo(0, -962, -152, -930); c.closePath(); }, dk],
    [E(-100, -800, 36, 14), '#5A3A22'], [E(100, -800, 36, 14), '#5A3A22'],
  ], '#E8742A', -5, -3);
  ironFinish(520, 1160, 7, '230,190,160');
  c.strokeStyle = 'rgba(190,170,150,0.35)'; c.lineWidth = 10; c.beginPath(); c.moveTo(-92, -800); c.lineTo(92, -470); c.moveTo(92, -800); c.lineTo(-92, -470); c.stroke();
  for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(0, -790 + i * 70, 5, 0, TAU); c.fillStyle = 'rgba(255,178,90,0.55)'; c.fill(); }
  c.beginPath(); c.arc(30, -995, 12, 0, TAU); c.fillStyle = '#6E3015'; c.fill();
}); }
function soldierImg(f) { return cached('bSol' + f, 170, 370, 1, () => { const c = ctx; c.translate(70, 355);
  const coat = mixc('#2B2520', '#7A2A20', 0.9), dk = '#1A1613';
  const legs = f ? [P([[-14, 0], [2, 0], [6, -130], [-12, -130]]), P([[0, 0], [16, 0], [12, -130], [-4, -130]])]
    : [P([[-34, 0], [-18, 0], [4, -125], [-12, -132]]), P([[22, 0], [38, 0], [12, -132], [-4, -125]])];
  cutout([[legs[0], dk], [legs[1], dk],
    [P([[-14, -170], [-4, -178], [52, -350], [44, -352]]), '#2A231E'],
    [P([[-32, -112], [32, -112], [30, -220], [18, -234], [-18, -234], [-30, -220]]), coat],
    [P([[-30, -220], [-40, -150], [-28, -140], [-18, -200]]), coat],
    [E(0, -252, 15, 18), dk],
    [P([[-16, -264], [16, -264], [13, -304], [-13, -304]]), dk],
    [P([[4, -304], [10, -326], [14, -304]]), '#8A3B17'],
  ], '#C4552A', -2, -2);
  ironFinish(170, 370, 11 + f, '230,190,160', 0.3);
  c.strokeStyle = 'rgba(200,180,160,0.4)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-26, -220); c.lineTo(26, -130); c.stroke();
  c.beginPath(); c.moveTo(48, -350); c.lineTo(56, -368); c.strokeStyle = 'rgba(220,210,200,0.7)'; c.lineWidth = 2; c.stroke();
}); }
function fortImg() { return cached('bFort', 1000, 720, 1, () => { const c = ctx; c.translate(500, 700);
  const wallPts = []; wallPts.push([-330, -130]); for (let x = -330; x < 330; x += 48) { wallPts.push([x, -330], [x + 26, -330], [x + 26, -300], [x + 48, -300]); } wallPts.push([330, -330], [330, -130]);
  const tower = (x0, x1, top) => { const o = [[x0, -120]]; const n = 3, w = (x1 - x0) / (n * 2 - 1); for (let i = 0; i < n * 2 - 1; i++) { const x = x0 + i * w, y = i % 2 ? top + 30 : top; o.push([x, y], [x + w, y]); } o.push([x1, -120]); return o; };
  cutout([
    [(c) => { c.beginPath(); c.moveTo(-500, 0); c.quadraticCurveTo(-220, -150, 0, -160); c.quadraticCurveTo(260, -160, 500, 0); c.closePath(); }, '#16120F'],
    [P(wallPts), '#2A231E'],
    [P(tower(-400, -250, -440)), '#2E2621'], [P(tower(250, 400, -440)), '#2E2621'], [P(tower(-80, 80, -500)), '#332A24'],
  ], '#B5541F', 0, -4);
  ironFinish(1000, 720, 21, '230,190,160');
  c.fillStyle = '#0A0807'; c.beginPath(); c.moveTo(-40, -130); c.lineTo(-40, -230); c.arc(0, -230, 40, PI, 0); c.lineTo(40, -130); c.fill();
  for (const [x, y] of [[-325, -440 + 40], [325, -440 + 40]]) { c.fillStyle = '#0A0807'; c.fillRect(x - 10, y + 40, 20, 46); }
  for (let x = -300; x <= 300; x += 50) rivet(x, -280, 6);
  for (let x = -60; x <= 60; x += 40) rivet(x, -440, 6);
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 2; for (let y = -250; y > -300; y -= 25) { c.beginPath(); c.moveTo(-330, y); c.lineTo(330, y); c.stroke(); }
}); }
function armImg() { return cached('bArm', 280, 960, 1, () => { const c = ctx; c.translate(140, 210);
  cutout([
    [P([[-52, 0], [52, 0], [78, 740], [-78, 740]]), '#211C18'],
    [(c) => { c.beginPath(); c.roundRect(-62, -175, 124, 190, 50); }, '#1E1A16'],
    [(c) => { c.beginPath(); c.roundRect(-78, -120, 40, 90, 18); }, '#1E1A16'],
  ], '#E8742A', -4, -4);
  ironFinish(280, 960, 31, '230,190,160');
  c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 3; for (const y of [-130, -95, -60]) { c.beginPath(); c.moveTo(-40, y); c.lineTo(50, y + 4); c.stroke(); }
}); }
// gopuram (local origin = base centre, y up negative)
const GOP = (() => { const tiers = []; for (let i = 0; i < 6; i++) { const y0 = -280 - i * 110, wb = 520 - i * 62, wt = wb - 50; tiers.push({ y0, y1: y0 - 110, wb, wt }); } return tiers; })();
function gopOutline() { const o = [[-300, 0], [-300, -260], [-315, -260], [-315, -280]];
  for (const t of GOP) o.push([-t.wb / 2, t.y0], [-t.wt / 2, t.y1 + 14], [-t.wt / 2 - 12, t.y1 + 14], [-t.wt / 2 - 12, t.y1]);
  o.push([-110, -940], [-110, -975], [-80, -1010], [80, -1010], [110, -975], [110, -940]);
  for (let i = GOP.length - 1; i >= 0; i--) { const t = GOP[i]; o.push([t.wt / 2 + 12, t.y1], [t.wt / 2 + 12, t.y1 + 14], [t.wt / 2, t.y1 + 14], [t.wb / 2, t.y0]); }
  o.push([315, -280], [315, -260], [300, -260], [300, 0]); return pathP(o, 12); }
function gopImg() { return cached('bGop', 700, 1100, 1.2, () => { const c = ctx; c.translate(350, 1080);
  const parts = [[(c) => { c.beginPath(); c.rect(-300, -262, 600, 262); }, '#172028'], [(c) => { c.beginPath(); c.rect(-315, -282, 630, 22); }, '#22303A']];
  GOP.forEach((t, i) => { parts.push([P([[-t.wb / 2, t.y0], [t.wb / 2, t.y0], [t.wt / 2, t.y1 + 14], [-t.wt / 2, t.y1 + 14]]), mixc('#141C23', '#22303A', i / 6)]);
    parts.push([(c) => { c.beginPath(); c.rect(-t.wt / 2 - 12, t.y1, t.wt + 24, 16); }, '#2A3944']); });
  parts.push([(c) => { c.beginPath(); c.roundRect(-110, -1010, 220, 72, 36); }, '#24323C']);
  for (let k = -2; k <= 2; k++) parts.push([(c) => { c.beginPath(); c.ellipse(k * 40, -1024, 11, 14, 0, 0, TAU); c.moveTo(k * 40 - 3, -1036); c.lineTo(k * 40, -1062); c.lineTo(k * 40 + 3, -1036); }, '#24323C']);
  cutout(parts, '#8FB3C9', 3, -3);
  ironFinish(700, 1100, 41, '160,190,210', 0.4);
  GOP.forEach((t, i) => { const n = Math.max(2, Math.floor(t.wt / 70)); for (let k = 0; k < n; k++) { const x = -t.wt / 2 + 30 + (t.wt - 60) * (n === 1 ? 0.5 : k / (n - 1)), y = t.y0 - 22;
      c.fillStyle = '#0B0F13'; c.beginPath(); c.moveTo(x - 12, y); c.lineTo(x - 12, y - 46); c.arc(x, y - 46, 12, PI, 0); c.lineTo(x + 12, y); c.fill();
      c.strokeStyle = 'rgba(143,179,201,0.35)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y - 46, 14, PI * 1.1, PI * 1.9); c.stroke(); }
    for (let x = -t.wt / 2; x <= t.wt / 2; x += 40) rivet(x, t.y1 + 7, 4); });
  for (let x = -290; x <= 290; x += 46) rivet(x, -271, 5);
  for (const x of [-210, -150, 150, 210]) { c.fillStyle = 'rgba(11,15,19,0.9)'; c.fillRect(x - 16, -220, 32, 160); }
  c.fillStyle = '#06080A'; c.beginPath(); c.moveTo(-60, 0); c.lineTo(-60, -150); c.arc(0, -150, 60, PI, 0); c.lineTo(60, 0); c.fill();
  c.strokeStyle = 'rgba(143,179,201,0.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-66, 0); c.lineTo(-66, -150); c.arc(0, -150, 66, PI, 0); c.lineTo(66, 0); c.stroke();
}); }
function drawDoorGlow(x, y, s, a) { // warm lamp glow in the gopuram door (local door: x +-60, y 0..-210)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-60, -150); ctx.arc(0, -150, 60, PI, 0); ctx.lineTo(60, 0); ctx.closePath();
  const g = ctx.createLinearGradient(0, -210, 0, 0); g.addColorStop(0, `rgba(255,150,60,${0.35 * a})`); g.addColorStop(1, `rgba(255,193,90,${0.9 * a})`); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  K.glow(x, y - 80 * s, 200 * s, '255,150,60', 0.3 * a); }
function guardImg() { return cached('bGuard', 420, 1060, 1, () => { const c = ctx; c.translate(200, 1045);
  const dk = '#141A1F';
  cutout([
    [(c) => { c.beginPath(); c.rect(118, -990, 10, 980); }, '#1E262C'],
    [P([[123, -1030], [140, -975], [123, -945], [106, -975]]), '#2A3944'],
    [P([[-62, 0], [-20, 0], [-16, -330], [-66, -330]]), dk], [P([[20, 0], [64, 0], [66, -330], [16, -330]]), dk],
    [P([[-102, -300], [102, -300], [82, -560], [98, -640], [60, -682], [-60, -682], [-98, -640], [-82, -560]]), '#182027'],
    [P([[-98, -640], [-124, -470], [-104, -398], [-84, -470], [-74, -600]]), dk],
    [P([[98, -640], [140, -560], [134, -470], [110, -470], [112, -560], [74, -610]]), dk],
    [E(0, -730, 40, 48), dk],
    [P([[-48, -744], [48, -744], [32, -800], [0, -834], [-32, -800]]), '#1C252C'],
  ], '#8FB3C9', 3, -3);
  ironFinish(420, 1060, 51, '160,190,210', 0.4);
  c.strokeStyle = 'rgba(143,179,201,0.3)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-90, -320); c.lineTo(90, -320); c.stroke();
}); }
function walkerImg(f) { return cached('bWalk' + f, 260, 560, 1, () => { const c = ctx; c.translate(120, 545);
  const dk = '#1A1714';
  const legs = f ? [P([[-14, 0], [6, 0], [8, -220], [-12, -222]]), P([[-2, 0], [18, 0], [14, -222], [-6, -220]])]
    : [P([[-48, 0], [-28, 0], [2, -220], [-16, -226]]), P([[26, 0], [48, 0], [12, -226], [-4, -220]])];
  cutout([[legs[0], dk], [legs[1], dk],
    [P([[-38, -168], [42, -168], [34, -330], [-28, -330]]), '#201C18'],
    [P([[-30, -330], [36, -330], [32, -408], [-22, -418]]), dk],
    [P([[-8, -404], [24, -404], [64, -304], [74, -282], [54, -272], [40, -302]]), dk],
    [E(4, -446, 26, 32), dk],
    [E(4, -478, 36, 24), '#24201B'], [P([[-30, -482], [-44, -440], [-26, -444]]), '#24201B'],
  ], '#8FB3C9', 3, -3);
  ironFinish(260, 560, 61 + f, '170,190,205', 0.3);
}); }
// temple wall with the door opening cut out (b7, b9)
const DOOR = { x0: 410, x1: 670, top: 640, bot: 1180 };
function doorPath(c, pad = 0) { const r = (DOOR.x1 - DOOR.x0) / 2 + pad, cx = (DOOR.x0 + DOOR.x1) / 2; c.beginPath(); c.moveTo(cx - r, DOOR.bot); c.lineTo(cx - r, DOOR.top + r); c.arc(cx, DOOR.top + r, r, PI, 0); c.lineTo(cx + r, DOOR.bot); c.closePath(); }
function wallImg() { return cached('bWall', W, H, 1, () => { const c = ctx; blit(plateImg(), 0, 0, 0, 0, 1);
  c.fillStyle = 'rgba(20,38,52,0.5)'; c.fillRect(0, 0, W, H);
  const mg = c.createRadialGradient(900, 100, 50, 900, 100, 1100); mg.addColorStop(0, 'rgba(143,179,201,0.22)'); mg.addColorStop(1, 'rgba(143,179,201,0)'); c.fillStyle = mg; c.fillRect(0, 0, W, 1300);
  for (let r = 0, y = 40; y < 1180; y += 92, r++) { c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, y, W, 4); c.fillStyle = 'rgba(143,179,201,0.12)'; c.fillRect(0, y + 4, W, 2);
    for (let x = (r % 2) * 90 - 90; x < W; x += 180) { c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x, y, 4, 92); } }
  c.fillStyle = '#1C2730'; c.fillRect(350, 560, 380, 70); c.fillRect(352, 560, 56, 620); c.fillRect(672, 560, 56, 620);
  c.fillStyle = 'rgba(143,179,201,0.5)'; c.fillRect(350, 558, 380, 3); c.fillRect(726, 560, 3, 620);
  for (let x = 370; x <= 712; x += 38) rivet(x, 595, 6);
  for (let y = 660; y < 1170; y += 60) { rivet(380, y, 6); rivet(700, y, 6); }
  const sg = c.createLinearGradient(0, 1180, 0, 1280); sg.addColorStop(0, '#2E3B45'); sg.addColorStop(1, '#141A1F'); c.fillStyle = sg; c.fillRect(0, 1180, W, 100);
  c.fillStyle = 'rgba(143,179,201,0.45)'; c.fillRect(0, 1180, W, 3);
  const bot = c.createLinearGradient(0, 1260, 0, 1360); bot.addColorStop(0, 'rgba(12,10,9,0.3)'); bot.addColorStop(1, 'rgba(12,10,9,0.95)'); c.fillStyle = bot; c.fillRect(0, 1260, W, H);
  c.save(); c.globalCompositeOperation = 'destination-out'; doorPath(c); c.fill(); c.restore();
  c.strokeStyle = 'rgba(143,179,201,0.55)'; c.lineWidth = 3; doorPath(c, 4); c.stroke();
}); }
function insideImg() { return cached('bInside', W, H, 1, () => { const c = ctx; blit(plateImg(), 0, 0, 0, 0, 1);
  c.fillStyle = 'rgba(40,22,12,0.35)'; c.fillRect(0, 0, W, 820);
  for (let r = 0, y = 70; y < 820; y += 88, r++) { c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(0, y, W, 4); for (let x = (r % 2) * 100 - 100; x < W; x += 200) c.fillRect(x, y, 4, 88); }
  // niche
  c.fillStyle = '#0B0806'; c.beginPath(); c.moveTo(430, 700); c.lineTo(430, 470); c.arc(540, 470, 110, PI, 0); c.lineTo(650, 700); c.fill();
  c.strokeStyle = 'rgba(255,160,90,0.4)'; c.lineWidth = 4; c.beginPath(); c.moveTo(422, 704); c.lineTo(422, 470); c.arc(540, 470, 118, PI, 0); c.lineTo(658, 704); c.stroke();
  c.fillStyle = '#2B231D'; c.fillRect(400, 700, 280, 26); c.fillStyle = 'rgba(255,180,120,0.35)'; c.fillRect(400, 700, 280, 2);
  // floor
  const fg = c.createLinearGradient(0, 820, 0, 1300); fg.addColorStop(0, '#1A1512'); fg.addColorStop(1, '#2A221C'); c.fillStyle = fg; c.fillRect(0, 820, W, 480);
  c.fillStyle = 'rgba(255,170,110,0.25)'; c.fillRect(0, 820, W, 3);
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 3; for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(540 + i * 70, 820); c.lineTo(540 + i * 260, 1300); c.stroke(); }
  for (let k = 0; k < 7; k++) { const y = 820 + 480 * Math.pow(k / 7, 1.6); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  for (let i = 0; i < 400; i++) { const v = rnd(i + 5000); c.fillStyle = `rgba(0,0,0,${0.05 + v * 0.1})`; c.fillRect(rnd(i + 5100) * W, 820 + rnd(i + 5200) * 480, 40 + v * 120, 1); }
  const bot = c.createLinearGradient(0, 1250, 0, 1360); bot.addColorStop(0, 'rgba(12,10,9,0)'); bot.addColorStop(1, 'rgba(12,10,9,0.95)'); c.fillStyle = bot; c.fillRect(0, 1250, W, H);
}); }
function slabImg() { return cached('bSlab', 800, 1040, 1, () => { const c = ctx; c.translate(10, 10);
  c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(10, 14, 780, 1020);
  c.fillStyle = 'rgba(255,200,160,0.35)'; c.fillRect(-3, -3, 780, 1020);
  const g = c.createLinearGradient(0, 0, 0, 1020); g.addColorStop(0, '#3E352D'); g.addColorStop(1, '#241E1A'); c.fillStyle = g; c.fillRect(0, 0, 780, 1020);
  ironFinish(800, 1040, 71, '220,205,190', 1.5);
  for (let x = 40; x <= 740; x += 50) { rivet(x, 36, 10); rivet(x, 984, 10); }
  for (let y = 86; y <= 934; y += 50) { rivet(36, y, 10); rivet(744, y, 10); }
  c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 3; c.strokeRect(70, 70, 640, 880); c.strokeStyle = 'rgba(255,200,160,0.12)'; c.strokeRect(73, 73, 640, 880);
}); }

// ═════════════════════════ shots ═════════════════════════
export function buildB(add, cue) {
  const T4 = L(4), T5 = L(5), T6 = L(6), T7 = L(7), T8 = L(8);

  // ── b1 rivet map: c. 1767, the Company route cut to NERKATTUMSEVAL ──
  { const at = T4, tY = Wd('seventeen', 4) - at, r0 = 0.25, r1 = Wd('British', 4) - at - 0.35;
    cue(at, 'whoosh', { gain: 0.6 }); cue(at + tY, 'slam', { gain: 0.8 }); cue(at + r0, 'sizzle', { gain: 0.5, dur: r1 - r0 }); cue(at + r1, 'thud', { gain: 0.9 });
    add({ id: 'b1', at, cam: [450, 800], zoom: 0.14, note: 'rivet map: c. 1767, Company route hot-cut to NERKATTUMSEVAL',
      draw(lt, d) {
        bg(mapImg(), -lt * 10, -lt * 6, 1.04);
        const p = seg(lt, r0, r1);
        ctx.setLineDash([20, 14]); hotCut(ROUTE, Math.max(0.02, p), 8, 0.4 + 0.6 * p); ctx.setLineDash([]);
        if (p > 0 && p < 1) { const [x, y] = ROUTE[Math.max(0, Math.floor(ROUTE.length * p) - 1)]; spray(x, y, lt, 3, 6, 380); }
        // Company marks marching along the route behind the head
        for (let k = 0; k < 4; k++) { const q = p - 0.06 - k * 0.07; if (q <= 0 || p >= 1) continue; const [x, y] = ROUTE[Math.floor(ROUTE.length * q)];
          ctx.fillStyle = '#7A2A20'; ctx.fillRect(x - 7, y - 16, 14, 22); ctx.fillStyle = 'rgba(255,150,90,0.6)'; ctx.fillRect(x - 7, y - 16, 14, 3); }
        // Madurai stays a dim hot rivet; the fort's rivet flares when the route lands
        K.glow(...PL.mad, 50, EMB, 0.35 + 0.1 * sin(lt * 5));
        stencil('MADURAI', PL.mad[0] + 10, PL.mad[1] - 70, 26, 0.7 * clamp(lt / 0.4));
        const hit = flash(lt, r1, 2.5), pulse = lt > r1 ? 0.55 + 0.25 * sin((lt - r1) * 9) : 0.25 + 0.1 * sin(lt * 4);
        K.glow(...PL.ner, 70 + 160 * hit, '255,150,60', pulse + 0.5 * hit); K.glow(...PL.ner, 26, '255,230,168', 0.6 + 0.4 * hit);
        K.glow(...PL.san, 40, EMB, 0.25);
        sparks(...PL.ner, lt - r1, 30, 77, 800);
        slamLab('NERKATTUMSEVAL', 470, 960, 40, lt, r1 - 0.05);
        slamLab('c. 1767', 540, 300, 96, lt, tY);
        K.embers(lt, 18, 3, '255,170,90');
        calm();
      } }); }

  // ── b2 rust sky: troops march on the fort; CAMPBELL; flag torn down ──
  { const at = Wd('British', 4), tC = Wd('Campbell', 4) - at, tT = Wd('took', 4) - at;
    cue(at, 'rumble', { gain: 0.5, dur: 2.2 }); for (let k = 0; k < 6; k++) cue(at + 0.1 + k * 0.42, 'drum', { gain: 0.35 });
    cue(at + tC, 'slam', { gain: 0.8 }); cue(at + tT, 'thud', { gain: 1 }); cue(at + tT + 0.08, 'whoosh', { gain: 0.5 });
    add({ id: 'b2', at, cam: [620, 760], zoom: 0.08, note: 'rust sky, red musket rows march on the fort, CAMPBELL slides in, flag torn down on "took"',
      draw(lt, d) {
        bg(rustBgImg(), -lt * 14, 0, 1.06);
        // fort (far layer)
        const fx = 700 - lt * 12, fy = 940; blit(fortImg(), 500, 700, fx, fy, 0.78);
        // flag on the gate tower
        const px = fx, py = fy - 500 * 0.78, tf = lt - tT, fall = tf > 0 ? eo(clamp(tf / 0.55)) : 0;
        ctx.save(); ctx.translate(px, py); ctx.rotate(fall * 1.75);
        ctx.fillStyle = '#2A231E'; ctx.fillRect(-4, -150, 8, 150); ctx.fillStyle = 'rgba(255,150,90,0.6)'; ctx.fillRect(-4, -150, 2, 150);
        if (tf < 0.12) { ctx.beginPath(); ctx.moveTo(4, -146); for (let i = 0; i <= 10; i++) { const u = i / 10; ctx.lineTo(4 + u * 110, -146 + sin(lt * 9 - u * 5) * 8 * u); }
          for (let i = 10; i >= 0; i--) { const u = i / 10; ctx.lineTo(4 + u * 110, -76 + sin(lt * 9 - u * 5) * 8 * u); } ctx.closePath(); ctx.fillStyle = '#8A3B17'; ctx.fill(); ctx.strokeStyle = 'rgba(255,150,80,0.6)'; ctx.lineWidth = 2; ctx.stroke(); }
        ctx.restore();
        if (tf >= 0.12) { const u = tf - 0.12; ctx.save(); ctx.translate(px + 60 + u * 140, py - 110 + u * u * 700); ctx.rotate(u * 3); ctx.globalAlpha = clamp(1 - u / 1.1);
          ctx.beginPath(); ctx.moveTo(-55, -35); ctx.quadraticCurveTo(0, -20 + sin(u * 12) * 12, 55, -35); ctx.lineTo(50, 35); ctx.quadraticCurveTo(0, 20, -55, 35); ctx.closePath(); ctx.fillStyle = '#8A3B17'; ctx.fill(); ctx.restore(); }
        sparks(px, py, tf, 30, 41, 650); K.glow(px, py, 160, '255,150,60', 0.6 * flash(lt, tT, 4));
        // ground plate
        const gg = ctx.createLinearGradient(0, 930, 0, 1300); gg.addColorStop(0, '#2A231E'); gg.addColorStop(1, '#14110E'); ctx.fillStyle = gg; ctx.fillRect(-300, 930, W + 600, 400);
        ctx.fillStyle = 'rgba(255,150,90,0.35)'; ctx.fillRect(-300, 930, W + 600, 3);
        // three rows of marching musket silhouettes (parallax)
        [[1050, 0.5, 70, 90, 0], [1150, 0.66, 95, 120, 1], [1262, 0.84, 120, 160, 2]].forEach(([y, s, gap, spd, r]) => {
          for (let i = 0; i < 16; i++) { const x = ((i * gap + lt * spd + r * 40) % (16 * gap)) - 120; const f = ((lt * 3.6 + i * 0.5 + r * 0.3) | 0) % 2;
            blit(soldierImg(f), 70, 355, x, y - (f ? 3 : 0) * s, s, 0.75 + r * 0.12); } });
        // CAMPBELL slides in (foreground)
        const cp = eo(clamp((lt - tC + 0.15) / 0.45));
        if (cp > 0) { const ox = lerp(-260, 215, cp); K.glow(ox + 60, 700, 420, EMB, 0.18 * cp); blit(officerImg(), 260, 1140, ox, 1296, 0.9); }
        calm(1285);
        stencil('BRITISH', 540, 250, 64, clamp(lt / 0.15) * (1 - clamp((lt - tC + 0.2) / 0.2)), 1 + 0.4 * (1 - eo(clamp(lt / 0.22))));
        slamLab('CAMPBELL', 640, 250, 64, lt, tC);
        if (lt > tC + 0.2) illus(640, 330, clamp((lt - tC - 0.2) / 0.3));
        K.embers(lt + 3, 22, 9, '255,170,90');
      } }); }

  // ── b3 THE STORY SPLITS: slab hot-cut, bursts apart, three paths fork ──
  { const at = T5, tS = Wd('splits', 5) - at, c0 = 0.05, c1 = tS - 0.04;
    cue(at + c0, 'sizzle', { gain: 0.6, dur: c1 - c0 }); cue(at + tS, 'slam', { gain: 1 }); cue(at + tS + 0.05, 'whoosh', { gain: 0.7 }); cue(at + tS + 0.35, 'chisel', { gain: 0.5 });
    const CUT = []; for (let i = 0; i <= 42; i++) CUT.push([540 + (i % 2 ? 1 : -1) * (6 + rnd(i + 900) * 16), 170 + i * 24.5]);
    const FORK = [quadP(540, 1170, 300, 900, 190, 520, 40), quadP(540, 1170, 540, 800, 540, 430, 40), quadP(540, 1170, 780, 900, 890, 520, 40)];
    add({ id: 'b3', at, cam: [540, 680], zoom: 0.08, note: 'THE STORY SPLITS: slab hot-cut, bursts apart, three hot paths fork; rust bloom out',
      draw(lt, d) {
        bg(plateImg(), 0, lt * 8, 1.05);
        // three forked paths on the base plate (revealed as the halves fly away)
        const fp = seg(lt, tS + 0.1, tS + 0.7);
        if (fp > 0) { FORK.forEach((f, i) => hotCut(f, Math.max(0.02, fp), 9, 0.3 + 0.7 * fp));
          if (fp >= 1) for (const [x, y] of [[190, 520], [540, 430], [890, 520]]) { K.glow(x, y, 70, '255,150,60', 0.55 + 0.2 * sin(lt * 8 + x)); rivet(x, y, 14); }
          rivet(540, 1170, 16); K.glow(540, 1170, 80, '255,150,60', 0.5); }
        const sp = tS > lt ? 0 : eo(clamp((lt - tS) / 0.75)), off = sp * 640, rot = sp * 0.16;
        const half = (side) => { ctx.save(); ctx.translate(540 + side * off, 680 + sp * 120); ctx.rotate(side * rot); ctx.translate(-540, -680);
          ctx.beginPath(); if (side < 0) { ctx.moveTo(100, 150); CUT.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(100, 1200); }
          else { ctx.moveTo(980, 150); CUT.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(980, 1200); } ctx.closePath(); ctx.clip();
          blit(slabImg(), 400, 520, 540, 680, 1);
          ctx.beginPath(); CUT.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = `rgba(255,${140 + 60 * flash(lt, tS, 2) | 0},60,${0.9 - 0.5 * sp})`; ctx.lineWidth = 10; ctx.stroke();
          ctx.restore(); };
        if (lt < tS) { blit(slabImg(), 400, 520, 540, 680, 1); const p = seg(lt, c0, c1); hotCut(CUT, Math.max(0.02, p), 8, 0.2);
          const [hx, hy] = CUT[Math.max(0, Math.floor(CUT.length * p) - 1)]; spray(hx, hy, lt, 5, 9, 520); }
        else { half(-1); half(1); }
        const f = flash(lt, tS, 3.5);
        if (f > 0.01) { K.glow(540, 680, 900, '255,200,120', 0.75 * f); ctx.fillStyle = `rgba(255,230,168,${0.35 * f})`; ctx.fillRect(-300, -300, W + 600, H + 600); }
        for (let k = 0; k < 5; k++) sparks(540, 200 + k * 230, lt - tS, 26, 300 + k * 17, 1000);
        calm();
        slamLab('THE STORY SPLITS', 540, 230, 60, lt, tS);
        rustBloom(seg(lt, d - 0.38, d), 540, 760, 13);
      } }); }

  // ── b4 LEGEND SAYS: shackles slam shut on two iron forearms ──
  { const at = T6, tL = Wd('legend', 6) - at, tC = Wd('captured', 6) - at;
    cue(at + tL, 'chisel', { gain: 0.6 }); cue(at + tC - 0.25, 'whoosh', { gain: 0.5 }); cue(at + tC, 'slam', { gain: 1 }); cue(at + tC + 0.05, 'thud', { gain: 0.7 });
    add({ id: 'b4', at, cam: [540, 780], zoom: 0.1, note: 'LEGEND SAYS: shackles slam shut on two iron forearms, chain drops between',
      draw(lt, d) {
        bg(plateImg(), lt * 10, 0, 1.06);
        K.glow(540, 760, 520, EMB, 0.14 + 0.1 * flash(lt, tC, 2));
        const jolt = flash(lt, tC, 7) * 16, [sx, sy] = shake(lt, tC, 22);
        ctx.save(); ctx.translate(sx, sy);
        const arms = [[430, 790 + jolt, 0.5], [650, 790 + jolt, -0.5]];
        const cp = eo(clamp((lt - tC + 0.3) / 0.3)); // cuff close progress
        // chain between the cuffs (behind the fists), drops in on close
        if (lt > tC) { const sw = sin((lt - tC) * 7) * 40 * flash(lt, tC, 2); chainPts(sagPts(arms[0][0] + 30, arms[0][1] + 60, arms[1][0] - 30, arms[1][1] + 60, 200 + sw, 6), { len: 62, wid: 36, th: 11, edge: 0.6 + 0.4 * flash(lt, tC, 1.5) }); }
        arms.forEach(([x, y, a], i) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); blit(armImg(), 140, 210, 0, 0, 1);
          // cuff: two halves close from the sides
          const o = (1 - cp) * 120, e = 0.4 + 0.6 * flash(lt, tC, 2);
          for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * o, 70 - (1 - cp) * 40); ctx.rotate(sd * (1 - cp) * 0.6);
            ctx.beginPath(); ctx.ellipse(0, 0, 74, 26, 0, sd < 0 ? PI / 2 : -PI / 2, sd < 0 ? PI * 1.5 : PI / 2); ctx.lineWidth = 26; ctx.strokeStyle = '#26201B'; ctx.stroke();
            ctx.lineWidth = 4; ctx.strokeStyle = `rgba(${EMB},${e})`; ctx.beginPath(); ctx.ellipse(0, -10, 84, 34, 0, sd < 0 ? PI : PI * 1.5, sd < 0 ? PI * 1.5 : PI * 2); ctx.stroke();
            ctx.strokeStyle = `rgba(${HOTC},${0.5 * e})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 66, 20, 0, sd < 0 ? PI / 2 : -PI / 2, sd < 0 ? PI * 1.5 : PI / 2); ctx.stroke(); ctx.restore(); }
          if (cp >= 1) { rivet(-74, 70, 9); rivet(74, 70, 9); }
          ctx.restore(); });
        ctx.restore();
        sparks(430, 860, lt - tC, 30, 81, 850); sparks(650, 860, lt - tC, 30, 91, 850);
        const f = flash(lt, tC, 5); if (f > 0.01) K.glow(540, 860, 500, '255,210,140', 0.7 * f);
        K.embers(lt, 16, 21, '255,170,90');
        calm();
        legend(lt, tL);
        rustBloom(1 - seg(lt, 0, 0.35), 540, 760, 13);
      } }); }

  // ── b5 moonlit gopuram wide: ONE LAST PRAYER, the figure walks in, guards stay outside ──
  { const at = Wd('pray', 6), tT = Wd('temple', 6) - at;
    cue(at, 'whoosh', { gain: 0.45 }); cue(at + 0.1, 'swell', { gain: 0.4, dur: 1.6 }); cue(at + tT, 'bell', { gain: 0.45 });
    add({ id: 'b5', at, cam: [540, 1000], zoom: 0.1, note: 'moonlit gopuram (ILLUSTRATION), chained figure walks into the glowing door, guards stay outside; ONE LAST PRAYER',
      draw(lt, d) {
        bg(moonBgImg(), -lt * 8, 0, 1.05);
        const gx = 540, gy = 1180, gs = 0.8;
        blit(gopImg(), 350, 1080, gx, gy, gs);
        drawDoorGlow(gx, gy, gs, 0.8 + 0.15 * sin(lt * 11) * sin(lt * 7));
        const gg = ctx.createLinearGradient(0, 1180, 0, 1300); gg.addColorStop(0, '#22303A'); gg.addColorStop(1, '#10161B'); ctx.fillStyle = gg; ctx.fillRect(-300, 1180, W + 600, 130);
        ctx.fillStyle = 'rgba(143,179,201,0.4)'; ctx.fillRect(-300, 1180, W + 600, 2);
        K.glow(gx, 1190, 200, '255,150,60', 0.22);
        // guards either side of the door
        blit(guardImg(), 200, 1045, gx - 112, 1188, 0.2);
        ctx.save(); ctx.translate(gx + 112, 1188); ctx.scale(-1, 1); blit(guardImg(), 200, 1045, 0, 0, 0.2); ctx.restore();
        // the walker (side view) crosses to the door and fades into its glow
        const wp = seg(lt, 0.05, tT + 0.25), wx = lerp(120, gx, eio(wp) * 0.4 + wp * 0.6), wa = 1 - seg(lt, tT + 0.05, tT + 0.45), ws = 0.42 - 0.04 * seg(lt, tT, tT + 0.4);
        if (wa > 0) { const f = ((lt * 3.2) | 0) % 2; blit(walkerImg(f), 120, 545, wx, 1190, ws, wa);
          ctx.strokeStyle = `rgba(${EMB},${0.9 * wa})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(wx + 22 * ws / 0.42, 1190 - 120); ctx.quadraticCurveTo(wx + 34, 1190 - 92, wx + 20, 1190 - 70); ctx.stroke(); }
        smoke(gx, 1180, lt, 4, '143,179,201', 0.06, 160, 300);
        K.embers(lt, 12, 33, '200,220,235');
        calm();
        legend(lt);
        slamLab('ONE LAST PRAYER', 540, 250, 54, lt, 0.1);
        illus(870, 1235, clamp((lt - 0.3) / 0.3));
      } }); }

  // ── b6 closer: the gopuram outline is moon-cut; SANKARANKOVIL ──
  { const at = Wd('Sankarankovil', 6), OUT = gopOutline();
    cue(at, 'bell', { gain: 0.6 }); cue(at + 0.05, 'chisel', { gain: 0.35 }); cue(at + 0.1, 'sizzle', { gain: 0.3, dur: 1.1 });
    add({ id: 'b6', at, cam: [540, 900], zoom: 0.09, note: 'close on the moonlit gopuram, outline moon-cut, guards flank the glowing door; SANKARANKOVIL',
      draw(lt, d) {
        bg(moonBgImg(), 60 - lt * 20, -60, 1.12);
        const gx = 540 + 10 - lt * 6, gy = 1250, gs = 1.45;
        blit(gopImg(), 350, 1080, gx, gy, gs);
        drawDoorGlow(gx, gy, gs, 0.85 + 0.15 * sin(lt * 13) * sin(lt * 5));
        ctx.save(); ctx.translate(gx, gy); ctx.scale(gs, gs); moonCut(OUT, seg(lt, 0.05, 1.2), 3); ctx.restore();
        const gg = ctx.createLinearGradient(0, 1250, 0, 1320); gg.addColorStop(0, '#22303A'); gg.addColorStop(1, '#10161B'); ctx.fillStyle = gg; ctx.fillRect(-300, 1250, W + 600, 80);
        blit(guardImg(), 200, 1045, gx - 190, 1262, 0.36);
        ctx.save(); ctx.translate(gx + 190, 1262); ctx.scale(-1, 1); blit(guardImg(), 200, 1045, 0, 0, 0.36); ctx.restore();
        const fg = ctx.createLinearGradient(0, 1120, 0, 1290); fg.addColorStop(0, 'rgba(143,179,201,0)'); fg.addColorStop(1, 'rgba(143,179,201,0.14)'); ctx.fillStyle = fg; ctx.fillRect(-300, 1120, W + 600, 170);
        smoke(gx + sin(lt) * 40, 1250, lt + 2, 5, '143,179,201', 0.07, 260, 260);
        calm(1290);
        legend(lt);
        slamLab('SANKARANKOVIL', 540, 270, 62, lt, 0.08);
        illus(540, 350, clamp((lt - 0.35) / 0.3));
      } }); }

  // ── b7 behind the guards: CRACK, flash out of the doorway ──
  { const at = T7, tC = Wd('crack', 7) - at;
    cue(at, 'rumble', { gain: 0.35, dur: 1.4 }); cue(at + tC, 'chisel', { gain: 1 }); cue(at + tC, 'slam', { gain: 0.9 }); cue(at + tC + 0.08, 'sizzle', { gain: 0.5, dur: 0.5 });
    add({ id: 'b7', at, cam: [540, 860], zoom: 0.1, note: 'behind two spear guards at the door; CRACK: white flash and sparks burst out, lintel cracks',
      draw(lt, d) {
        const f = flash(lt, tC, 3.2), [sx, sy] = shake(lt, tC, 26);
        ctx.save(); ctx.translate(sx, sy);
        ctx.fillStyle = '#0E0C0A'; ctx.fillRect(-300, -300, W + 600, H + 600);
        // interior
        const ig = ctx.createLinearGradient(0, DOOR.top, 0, DOOR.bot); ig.addColorStop(0, '#0A0706'); ig.addColorStop(1, `rgba(120,50,20,${0.6 + 0.1 * sin(lt * 9)})`); ctx.fillStyle = ig; ctx.fillRect(DOOR.x0 - 20, DOOR.top - 20, 300, 600);
        if (f > 0.01) { ctx.fillStyle = `rgba(255,230,168,${f})`; ctx.fillRect(DOOR.x0 - 20, DOOR.top - 20, 300, 600); }
        blit(wallImg(), 540, 960, 540, 960 + lt * 6, 1);
        // light beams out of the doorway
        if (f > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (let k = 0; k < 7; k++) { const a = -PI / 2 + (k - 3) * 0.42, L2 = 1300; ctx.beginPath(); ctx.moveTo(540, 900); ctx.lineTo(540 + cos(a - 0.08) * L2, 900 + sin(a - 0.08) * L2); ctx.lineTo(540 + cos(a + 0.08) * L2, 900 + sin(a + 0.08) * L2); ctx.closePath();
            ctx.fillStyle = `rgba(255,180,90,${0.12 * f})`; ctx.fill(); }
          ctx.restore(); K.glow(540, 900, 760, '255,190,100', 0.7 * f); }
        // the lintel cracks (hot-cut zigzag)
        const CR = [[380, 575], [420, 600], [455, 580], [500, 612], [530, 590], [568, 618], [610, 588], [650, 610], [700, 585]];
        const cp = seg(lt, tC, tC + 0.2); if (cp > 0) hotCut(pathP(CR, 10), Math.max(0.05, cp), 5, clamp((lt - tC) / 1.2));
        sparks(540, 980, lt - tC, 40, 111, 1200); sparks(540, 760, lt - tC - 0.05, 30, 131, 1000); sparks(540, 600, lt - tC, 22, 151, 700);
        // two guards in the foreground (backs to camera), they flinch on the crack
        const fl = flash(lt, tC, 4) * 0.05;
        for (const [x, sd] of [[190, 1], [890, -1]]) { ctx.save(); ctx.translate(x, 1300); ctx.rotate(-sd * fl + sin(lt * 1.3 + x) * 0.006); ctx.scale(sd, 1); blit(guardImg(), 200, 1045, 0, 0, 0.88); ctx.restore(); }
        if (f > 0.01) { K.glow(190, 900, 260, '255,170,90', 0.25 * f); K.glow(890, 900, 260, '255,170,90', 0.25 * f); }
        ctx.restore();
        calm(1290);
        legend(lt);
        slamLab('CRACK', 540, 300, 110, lt, tC, { rot: -0.04 });
      } }); }

  // ── b8 inside: lamp niche, stone floor, BROKEN CHAINS ──
  { const at = Wd('Inside', 7), tF = Wd('found', 7) - at, tB = Wd('broken', 7) - at;
    cue(at, 'whoosh', { gain: 0.5 }); cue(at + tF, 'tock', { gain: 0.4 }); cue(at + tB, 'chisel', { gain: 0.8 }); cue(at + tB + 0.05, 'sizzle', { gain: 0.4, dur: 0.6 });
    add({ id: 'b8', at, cam: [540, 620], zoom: 0.08, note: 'inside: lamp niche, stone floor, BROKEN CHAINS glowing, snapped link halves',
      draw(lt, d) {
        bg(insideImg(), 0, -lt * 6, 1.04);
        // lamp in the niche
        const fl = 0.85 + 0.15 * sin(lt * 17) * sin(lt * 6.3);
        K.glow(540, 640, 320, '255,150,60', 0.35 * fl);
        ctx.fillStyle = '#2B231D'; ctx.beginPath(); ctx.ellipse(540, 690, 46, 14, 0, 0, TAU); ctx.fill();
        ctx.save(); ctx.translate(540, 676); ctx.scale(fl, 1 / fl * 0.9 + 0.1); ctx.beginPath(); ctx.moveTo(0, -70); ctx.quadraticCurveTo(22, -24, 14, -4); ctx.quadraticCurveTo(0, 6, -14, -4); ctx.quadraticCurveTo(-22, -24, 0, -70);
        const lg2 = ctx.createLinearGradient(0, -70, 0, 6); lg2.addColorStop(0, 'rgba(255,122,26,0.9)'); lg2.addColorStop(0.6, '#FFC15A'); lg2.addColorStop(1, '#FFE6A8'); ctx.fillStyle = lg2; ctx.fill(); ctx.restore();
        K.glow(540, 1050, 520, '255,140,60', 0.16 + 0.08 * fl);
        // the broken chains on the floor
        const e = clamp(0.35 + 0.4 * seg(lt, 0, tF + 0.3) + 0.4 * flash(lt, tB, 1.6) + (lt > tB ? 0.2 : 0)) * (0.92 + 0.08 * sin(lt * 6));
        const FL = 0.55;
        // left open cuff
        for (const [cx, cy, a0] of [[300, 1110, 0.7], [790, 1120, PI + 0.5]]) { ctx.save(); ctx.translate(cx, cy); ctx.scale(1, FL); ctx.rotate(a0);
          ctx.beginPath(); ctx.arc(0, 0, 58, 0.6, TAU - 0.6); ctx.lineWidth = 24; ctx.strokeStyle = '#1E1915'; ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 72, 0.7, TAU - 0.7); ctx.lineWidth = 3.5; ctx.strokeStyle = `rgba(${EMB},${e})`; ctx.stroke(); ctx.restore();
          K.glow(cx, cy, 90, EMB, 0.18 * e); }
        chainPts(pathP([[350, 1080], [420, 1050], [490, 1062]], 50).slice(0, 4), { len: 58, wid: 34, th: 11, edge: e, flat: 1 });
        chainPts(pathP([[620, 1095], [690, 1110], [745, 1104]], 50).slice(0, 4), { len: 58, wid: 34, th: 11, edge: e, flat: 1 });
        // the snapped link: two open halves, nudged apart
        const sep = 14 + 6 * eo(clamp(lt / 0.6));
        for (const [hx, hy, sd] of [[520 - sep, 1066, -1], [588 + sep, 1086, 1]]) { ctx.save(); ctx.translate(hx, hy); ctx.rotate(0.15 + sd * 0.25);
          ctx.beginPath(); ctx.arc(0, 0, 22, sd < 0 ? PI / 2 : -PI / 2, sd < 0 ? PI * 1.5 : PI / 2); ctx.lineWidth = 11; ctx.strokeStyle = '#1E1915'; ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 28, sd < 0 ? PI / 2 + 0.2 : -PI / 2 + 0.2, sd < 0 ? PI * 1.5 - 0.2 : PI / 2 - 0.2); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,230,168,${e})`; ctx.stroke(); ctx.restore(); }
        K.glow(555, 1076, 70, '255,210,140', 0.4 * e);
        sparks(555, 1070, lt - tB, 26, 171, 600); sparks(300, 1100, lt - tB - 0.05, 12, 181, 400); sparks(790, 1110, lt - tB - 0.08, 12, 191, 400);
        smoke(555, 1060, lt, 4, '210,180,150', 0.07, 60, 420);
        K.embers(lt, 14, 41, '255,170,90');
        calm();
        legend(lt);
        slamLab('BROKEN CHAINS', 540, 250, 66, lt, tB);
      } }); }

  // ── b9 NEVER SEEN AGAIN: empty doorway, smoke, empty chain swings ──
  { const at = Wd('chains', 7, 'e'), tN = Wd('never', 7) - at;
    cue(at + tN, 'rumble', { gain: 0.7, dur: 1.6 }); cue(at + tN + 0.02, 'slam', { gain: 0.55 }); cue(at + tN + 0.3, 'bell', { gain: 0.4 });
    add({ id: 'b9', at, cam: [540, 860], zoom: 0.14, note: 'NEVER SEEN AGAIN: empty doorway, cold smoke and embers rise, an empty chain swings',
      draw(lt, d) {
        ctx.fillStyle = '#0E0C0A'; ctx.fillRect(-300, -300, W + 600, H + 600);
        const dim = 1 - 0.6 * seg(lt, 0.4, d);
        const ig = ctx.createLinearGradient(0, DOOR.top, 0, DOOR.bot); ig.addColorStop(0, '#060505'); ig.addColorStop(1, `rgba(110,45,18,${0.55 * dim})`); ctx.fillStyle = ig; ctx.fillRect(DOOR.x0 - 20, DOOR.top - 20, 300, 600);
        smoke(540, 1180, lt + 1, 7, '170,190,205', 0.13, 120, 560);
        // empty chain hanging from the lintel, swinging and slowing
        const ang = 0.32 * Math.exp(-lt * 0.5) * sin(lt * 3.1 + 0.9);
        K.glow(540 + sin(ang) * 180, 820, 220, '255,140,60', 0.35 * dim);
        ctx.save(); ctx.translate(540, 650); ctx.rotate(ang);
        for (let i = 0; i < 6; i++) { const y = i * 52 + 26; i % 2 ? linkE(0, y, PI / 2, 60, 13, dim) : link(0, y, PI / 2, 60, 34, 13, dim); }
        ctx.beginPath(); ctx.arc(0, 6 * 52 + 14, 20, -PI * 0.15, PI * 1.15, true); ctx.lineWidth = 11; ctx.strokeStyle = '#1E1915'; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 6 * 52 + 14, 26, -PI * 0.1, PI * 1.1, true); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,190,110,${0.8 * dim})`; ctx.stroke();
        ctx.restore();
        blit(wallImg(), 540, 960, 540, 960 - lt * 4, 1);
        ctx.fillStyle = '#2A3944'; ctx.fillRect(530, 630, 20, 24); rivet(540, 642, 7);
        // embers drifting up out of the doorway
        for (let i = 0; i < 26; i++) { const ph = (lt * (0.25 + rnd(i + 600) * 0.3) + rnd(i + 700)) % 1, x = 540 + (rnd(i + 800) - 0.5) * 240 + sin(ph * 7 + i) * 40 * ph, y = 1170 - ph * 900;
          ctx.fillStyle = `rgba(255,${150 + rnd(i) * 80 | 0},80,${(1 - ph) * 0.85})`; ctx.fillRect(x, y, 3 + rnd(i + 3) * 3, 3 + rnd(i + 3) * 3); }
        K.glow(540, 1150, 260, '255,140,60', 0.18 * dim);
        calm(1290);
        legend(lt);
        slamLab('NEVER SEEN AGAIN', 540, 290, 60, lt, tN);
      } }); }
}
