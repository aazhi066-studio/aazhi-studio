// EPISODE 12 · worker C : "Tanjore Gilt Panel", lines 10-14 (eye-patient records, who operated, Manora, the end of the line, end card)
//   c1  L10 → "forty"        cabinet doors slide open on the library shelves; a case-note folio rises out to the front; RECORD
//   c2  "forty" → "Modi"     44 eye roundels drop into a honeycomb like gems; 44 PATIENTS
//   c3  "Modi" → "One"       an open book: abstract Modi strokes write in on the left page, abstract English cursive on the right; MODI / ENGLISH
//   c4  "One" → "in"         a brass lens glides over a case note to the eye sketch; inside, the lens clouds over milky white; CATARACT
//   c5  "in" → L11           gold leaves flutter down and stick into 1827; sheen sweep; eye roundel beaded above
//   c6  L11 → "Some"         operation scene: patient on a cot, oil lamp; the operator is only a gesso-bead outline that flickers; NOT CLEAR
//   c7  "Some" → "The"       gold leaves settle into the outline and it becomes the faceless king figure; SOME SAY
//   c8  "The" → L12          a case note with an empty box under the lens; ghost king behind; UNPROVEN slams down
//   c9  L12 → "to"           doors open on the coast; Manora's hexagonal tiers stack up by the sea; light at the top
//   c10 "to" → L13           red-coat figures and a flag on the shore, a beaded laurel wreath; a bicorne hat tumbles into the sea
//   c11 L13 → "His"          hinge-swing panel: the king beside a brass lamp; 1832; the varnish starts to tarnish
//   c12 "His" → "British"    the son on the gilt throne; LAST KING; he dissolves into lifting gold leaves; empty throne; 1855
//   c13 "British" → L14      the fort; a red flag climbs the pole; varnish cracks and tarnish spread over the whole panel
//   c14 L14 → "Follow"       tarnished fort (the lost kingdom) — then a fresh gilt library panel swings shut over it and gold leaves settle on the shelves
//   c15 "Follow" → end       end card: beaded lamp-and-book medallion, tagline, AAZHI in gold leaf, FOLLOW plaque
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit, fillP, poly, lg, mixc } from './art.js';

// ───────────── palette + panel geometry ─────────────
const RED = '#8E1B1B', RED2 = '#B3261E', GRN = '#1E5B3A', GRN2 = '#2F7D4F', BLU = '#1F3C8C', BLU2 = '#3557B5';
const G = '#C99A2E', G2 = '#E9C25A', GH = '#FFF0B0', GS = '#7A5714', IV = '#F1E4C8', INK = '#2B1408';
const RUBY = '#D1203A', EMER = '#19A35A', SAPH = '#2457D6';
const PAPER = '#EFE0BE', INKW = '#3A2410', WOOD = '#6B3E1E', WOOD2 = '#8E5A2E', SAND = '#D8B676';
const OX0 = 110, OX1 = 970, OY0 = 170, OY1 = 1236, AH = 250, PB = 1340;
const DKC = {}; const dk = (c, k = 0.35) => DKC[c + k] || (DKC[c + k] = mixc(c, '#000000', k));
const goldV = (y0, y1) => lg(0, y0, 0, y1, [[0, G2], [0.55, G], [1, '#A47820']]);

// ───────────── geometry helpers ─────────────
function resample(pts, step) {
  const out = [[pts[0][0], pts[0][1]]]; let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    let ax = pts[i - 1][0], ay = pts[i - 1][1]; const bx = pts[i][0], by = pts[i][1];
    let sl = Math.hypot(bx - ax, by - ay);
    while (acc + sl >= step && sl > 0) { const r = (step - acc) / sl; ax += (bx - ax) * r; ay += (by - ay) * r; out.push([ax, ay]); sl = Math.hypot(bx - ax, by - ay); acc = 0; }
    acc += sl;
  }
  return out;
}
/** multifoil (cusped) arch opening as a polyline: left foot → up → lobes over the top → right foot */
function archPts(x0, y0, x1, y1, ah, lobes = 7, bulge = 20) {
  const cx = (x0 + x1) / 2, hw = (x1 - x0) / 2, sy = y0 + ah, P = [[x0, y1], [x0, sy]];
  let pv = [x0, sy];
  for (let k = 1; k <= lobes; k++) {
    const th = Math.PI * (1 - k / lobes), p = [cx + hw * Math.cos(th), sy - ah * Math.pow(Math.max(0, Math.sin(th)), 0.85)];
    const dx = p[0] - pv[0], dy = p[1] - pv[1], ln = Math.hypot(dx, dy) || 1;
    const mx = (pv[0] + p[0]) / 2 + (dy / ln) * bulge * 2, my = (pv[1] + p[1]) / 2 - (dx / ln) * bulge * 2;
    for (let j = 1; j <= 10; j++) { const s = j / 10, a = (1 - s) * (1 - s), b = 2 * s * (1 - s), c = s * s; P.push([a * pv[0] + b * mx + c * p[0], a * pv[1] + b * my + c * p[1]]); }
    pv = p;
  }
  P.push([x1, y1]); return P;
}
function strokePts(P, col, w, dx = 0, dy = 0, close = true) {
  ctx.save(); ctx.translate(dx, dy); poly(P); if (!close) { ctx.beginPath(); P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); }
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
}
function ringPts(cx, cy, r, n, a0 = -Math.PI / 2) { const o = []; for (let i = 0; i < n; i++) { const a = a0 + (i / n) * TAU; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }
function stadiumPts(cx, cy, w, h, step) {
  const r = h / 2, P = [];
  for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + (i / 16) * Math.PI; P.push([cx - w / 2 + r + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI; P.push([cx + w / 2 - r + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  P.push(P[0]); return resample(P, step);
}

// ───────────── gilt devices: beads, gems, sparkle, leaves, sheen, tarnish ─────────────
function bead(x, y, r) { circle(x + r * 0.25, y + r * 0.3, r, GS); circle(x, y, r, G2); circle(x - r * 0.35, y - r * 0.35, r * 0.38, GH); }
/** GESSO BEADING: raised gold dots pop in along a path */
function beadPath(P, prog, r, alphaFn = null) {
  const n = P.length, m = prog * (n + 4);
  for (let i = 0; i < n; i++) {
    const s = clamp((m - i) / 4); if (s <= 0) break;
    const rr_ = r * eob(s); if (rr_ < 0.5) continue;
    if (alphaFn) { ctx.globalAlpha = alphaFn(i); bead(P[i][0], P[i][1], rr_); ctx.globalAlpha = 1; } else bead(P[i][0], P[i][1], rr_);
  }
}
function gem(x, y, r, col) {
  circle(x + r * 0.15, y + r * 0.2, r * 1.34, GS); circle(x - r * 0.05, y - r * 0.05, r * 1.26, G2);
  circle(x, y, r, dk(col, 0.45)); ell(x - r * 0.08, y - r * 0.1, r * 0.86, r * 0.8, col);
  circle(x - r * 0.34, y - r * 0.38, r * 0.22, '#FFFFFF');
}
function sparkle(x, y, s, a = 1) {
  if (s <= 0.5 || a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.beginPath();
  for (let i = 0; i < 8; i++) { const ang = (i / 8) * TAU, r = i % 2 ? s * 0.22 : s; ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); }
  ctx.closePath(); ctx.fillStyle = '#FFFBE8'; ctx.fill(); ctx.restore();
}
/** GEM INLAY POP: a cabochon drops into its socket with a bounce and a sparkle */
function gemPop(t, x, y, r, col) {
  if (t < 0) return;
  const p = clamp(t / 0.32), yd = y - 90 * (1 - eob(p));
  ctx.save(); ctx.globalAlpha *= Math.min(1, p * 4); gem(x, yd, r, col); ctx.restore();
  if (t > 0.22 && t < 0.62) sparkle(x + r * 0.7, y - r * 0.7, r * 2.2 * Math.sin(Math.PI * (t - 0.22) / 0.4));
}
/** GOLD-LEAF LAYING: square leaves flutter down (rotating, scaleX = cos foreshortening) and stick at pts */
function leaves(lt, pts, x, y, s, t0, span, sz = 22, fall = 0.55, seed = 0) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = (lt - t0 - (i / n) * span) / fall; if (p < 0) continue;
    const k = rnd(i * 3.7 + seed), q = Math.min(p, 1), tx = x + pts[i][0] * s, ty = y + pts[i][1] * s;
    const lx = tx + Math.sin(q * 6 + k * 9) * 70 * (1 - q), ly = ty - 440 * (1 - eo(q));
    const rot = k * 0.8 - 0.4 + (1 - q) * (2 + k * 3), sx = q < 1 ? Math.cos((1 - q) * (7 + k * 6)) : 1;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot); ctx.scale(sx, 1); ctx.globalAlpha *= Math.min(1, p * 5);
    ctx.fillStyle = sx < 0 ? GS : G2; ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
    ctx.fillStyle = GH; ctx.fillRect(-sz / 2, -sz / 2, sz, sz * 0.24);
    ctx.restore();
  }
}
/** the same leaves lifting off a shape and drifting away (dissolve) */
function leavesUp(lt, pts, x, y, s, t0, span, sz = 20, dur = 0.9, seed = 0) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = (lt - t0 - (i / n) * span) / dur; if (p >= 1) continue;
    const k = rnd(i * 5.3 + seed), q = Math.max(0, p), tx = x + pts[i][0] * s, ty = y + pts[i][1] * s;
    const lx = tx + Math.sin(q * 5 + k * 9) * 80 * q + (k - 0.5) * 120 * q, ly = ty - 520 * eio(q) * (0.6 + k * 0.6);
    const rot = k * 0.8 + q * (3 + k * 4), sx = Math.cos(q * (6 + k * 5));
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot); ctx.scale(sx, 1); ctx.globalAlpha *= (1 - q) * (p < 0 ? 1 : 1);
    ctx.fillStyle = sx < 0 ? GS : G2; ctx.fillRect(-sz / 2, -sz / 2, sz, sz); ctx.fillStyle = GH; ctx.fillRect(-sz / 2, -sz / 2, sz, sz * 0.24);
    ctx.restore();
  }
}
const PC = new Map();
/** sample opaque points of a cached canvas (local coords relative to ox, oy), sorted roughly top → bottom */
function samplePts(key, img, step, ox, oy) {
  if (PC.has(key)) return PC.get(key);
  const q = img._q, d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data, out = [];
  for (let y = step / 2; y < img.height / q; y += step) for (let x = step / 2; x < img.width / q; x += step) {
    const i = (Math.floor(y * q) * img.width + Math.floor(x * q)) * 4 + 3; if (d[i] > 200) out.push([x - ox, y - oy]);
  }
  out.sort((a, b) => (a[1] + rnd(a[0] * 1.3 + a[1]) * 140) - (b[1] + rnd(b[0] * 1.3 + b[1]) * 140));
  PC.set(key, out); return out;
}
let SCR = null;
/** GILT SHEEN SWEEP: blit a cached gold layer with a diagonal bright band clipped to its opaque pixels */
function sheenBlit(img, ox, oy, x, y, s, p, a = 1) {
  if (!(p > 0 && p < 1)) { blit(img, ox, oy, x, y, s, a); return; }
  const w = img.width, h = img.height, q = img._q;
  if (!SCR) { SCR = document.createElement('canvas'); SCR.width = W; SCR.height = H; }
  const c = SCR.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, w, h); c.drawImage(img, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  const bw = 120 * q; c.translate(lerp(-0.3 * w, 1.3 * w, p), h / 2); c.rotate(0.42);
  const g = c.createLinearGradient(-bw, 0, bw, 0); g.addColorStop(0, 'rgba(255,248,214,0)'); g.addColorStop(0.5, 'rgba(255,248,214,0.85)'); g.addColorStop(1, 'rgba(255,248,214,0)');
  c.fillStyle = g; c.fillRect(-bw, -h * 2, bw * 2, h * 4); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(SCR, 0, 0, w, h, x - ox * s, y - oy * s, (w / q) * s, (h / q) * s); ctx.restore();
}
/** VARNISH TARNISH: gold dulls to brown (multiply + desaturate) over the panel area */
function tarnish(a) {
  if (a <= 0.003) return;
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(120,86,40,${0.75 * a})`; ctx.fillRect(-60, -60, W + 120, PB + 60);
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${0.55 * a})`; ctx.fillRect(-60, -60, W + 120, PB + 60); ctx.restore();
}
/** VARNISH CRACK: a cached branching crack network revealed by a growing circle from its origin */
function crackImg(key, ox, oy) {
  return cached(key, W, PB, 1, () => {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const walk = (x, y, a, len, w, sd, depth) => {
      const P = [[x, y]]; for (let s = 0; s < len; s += 16) { a += (rnd(sd + s * 0.37) - 0.5) * 0.7; x += Math.cos(a) * 16; y += Math.sin(a) * 16; P.push([x, y]);
        if (depth < 2 && rnd(sd * 1.9 + s) > 0.9) walk(x, y, a + (rnd(sd + s) > 0.5 ? 0.9 : -0.9), len * 0.45, w * 0.6, sd + s * 3.1, depth + 1); }
      strokePts(P, 'rgba(255,236,190,0.35)', w * 0.7, 1.5, 1.5, false); strokePts(P, 'rgba(30,14,4,0.9)', w, 0, 0, false);
    };
    for (let b = 0; b < 16; b++) walk(ox, oy, (b / 16) * TAU + rnd(b) * 0.3, 700 + rnd(b * 7) * 600, 3, b * 13.3 + 1, 0);
  });
}
function cracks(img, ox, oy, prog, a = 1) {
  if (prog <= 0 || a <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.arc(ox, oy, prog * 1500, 0, TAU); ctx.clip(); ctx.globalAlpha *= a; ctx.drawImage(img, 0, 0); ctx.restore();
}

// ───────────── the gilt panel frame (cached once per lacquer colour) ─────────────
const SOCK = [[540, 92, 15], [196, 124, 12], [884, 124, 12], [64, 445, 9], [1016, 445, 9], [64, 1196, 9], [1016, 1196, 9], [300, 1278, 10], [420, 1278, 10], [540, 1278, 12], [660, 1278, 10], [780, 1278, 10]];
const GEMC = [RUBY, EMER, SAPH];
function frameImg(v = 0) {
  return cached('cFrame' + v, W, H, 1, () => {
    const band = [RED, GRN, BLU][v % 3], gb = lg(0, 0, W * 0.7, PB, [[0, '#E2B852'], [0.5, G], [1, '#A47820']]);
    ctx.fillStyle = '#1E0C07'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = gb; ctx.fillRect(0, 0, W, PB);
    ctx.lineWidth = 4; ctx.strokeStyle = GH; ctx.strokeRect(4, 4, W - 8, PB - 8); ctx.strokeStyle = GS; ctx.strokeRect(13, 13, W - 26, PB - 26);
    ctx.fillStyle = band; ctx.fillRect(18, 18, W - 36, PB - 36);
    ctx.fillStyle = gb; ctx.fillRect(40, 40, W - 80, PB - 80);
    line([[42, PB - 42], [42, 42], [W - 42, 42]], GH, 3); line([[W - 42, 42], [W - 42, PB - 42], [42, PB - 42]], GS, 3);
    for (const p of resample([[29, 29], [W - 29, 29], [W - 29, PB - 29], [29, PB - 29], [29, 29]], 22)) bead(p[0], p[1], 5.5);
    // pillars
    for (const px of [64, W - 64]) {
      ctx.fillStyle = band; ctx.fillRect(px - 12, 470, 24, 700);
      line([[px - 12, 1170], [px - 12, 470], [px + 12, 470]], GS, 3); line([[px + 12, 470], [px + 12, 1170]], GH, 2);
      for (const p of resample([[px, 492], [px, 1160]], 22)) bead(p[0], p[1], 4.2);
      for (const [y, h] of [[418, 54], [1170, 54]]) { rr(px - 22, y, 44, h, 10); ctx.fillStyle = G2; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = GS; ctx.stroke(); }
      rr(px - 18, 396, 36, 26, 8); ctx.fillStyle = G; ctx.fill(); ctx.strokeStyle = GS; ctx.stroke();
    }
    // spandrel rosettes
    for (const [x, y] of [[196, 124], [884, 124]]) {
      for (let k = 0; k < 6; k++) { ctx.save(); ctx.translate(x, y); ctx.rotate((k / 6) * TAU); ell(0, -40, 11, 20, band); ctx.restore(); }
      for (const p of ringPts(x, y, 27, 14)) bead(p[0], p[1], 4);
    }
    // arch bevel (raised gesso ridge) + outer bead row, then cut the opening
    const A = archPts(OX0, OY0, OX1, OY1, AH);
    strokePts(A, GS, 46, 4, 5); strokePts(A, GH, 46, -3, -3); strokePts(A, G2, 38); strokePts(A, G, 22);
    for (const p of resample(archPts(OX0 - 32, OY0 - 32, OX1 + 32, OY1 - 10, AH + 32), 21)) bead(p[0], p[1], 5.5);
    // plinth beads
    for (const p of resample([[120, 1300], [W - 120, 1300]], 20)) bead(p[0], p[1], 4);
    // varnish wash on the gold (amber toward the edges)
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    const vg = ctx.createRadialGradient(540, 700, 380, 540, 700, 980); vg.addColorStop(0, 'rgba(107,74,26,0)'); vg.addColorStop(1, 'rgba(107,74,26,0.42)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, PB); ctx.restore();
    // gem sockets
    for (const [x, y, r] of SOCK) { circle(x + 1, y + 2, r * 1.42, GS); circle(x, y, r * 1.12, '#3A2410'); }
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; poly(A); ctx.fill(); ctx.restore();
    strokePts(A, INK, 3);
    // calm lacquer ground under the panel (captions sit here)
    for (const p of resample([[60, PB + 14], [W - 60, PB + 14]], 18)) bead(p[0], p[1], 2.6);
  });
}
/** frame on top of the shot: optional gem pop sequence (o.gem = start), sheen sweep (o.sheen 0..1) and a twinkle */
function frame(lt, v = 0, o = {}) {
  const F = frameImg(v);
  sheenBlit(F, 0, 0, 0, 0, 1, o.sheen ?? -1);
  const t0 = o.gem ?? -9;
  SOCK.forEach(([x, y, r], i) => gemPop(lt - t0 - i * 0.07, x, y, r, GEMC[(i + v) % 3]));
  const k = Math.floor(lt * 1.6 + v * 3), ph = (lt * 1.6 + v * 3) % 1, [sx, sy, sr] = SOCK[(k * 5) % SOCK.length];
  if (lt - t0 > 1.2) sparkle(sx + sr * 0.6, sy - sr * 0.6, sr * 2 * Math.sin(Math.PI * ph), 0.9);
}
/** interior ground: flat lacquer colour with a faint gold flower lattice */
function bgImg(col) {
  return cached('cBg' + col, W, PB, 1, () => {
    ctx.fillStyle = col; ctx.fillRect(0, 0, W, PB);
    for (let r = 0, y = 150; y < PB; y += 84, r++) for (let x = (r % 2) * 48 + 40; x < W; x += 96) {
      ctx.globalAlpha = 0.16; for (let k = 0; k < 4; k++) circle(x + Math.cos(k * Math.PI / 2) * 7, y + Math.sin(k * Math.PI / 2) * 7, 4.2, G2); circle(x, y, 3, GH); ctx.globalAlpha = 1;
    }
  });
}
const bg = (col) => ctx.drawImage(bgImg(col), 0, 0);
/** PANEL CABINET: two lacquer doors slide apart behind the frame (p 0 → closed, 1 → open) */
function doorImg() {
  return cached('cDoor', 460, 1120, 1, () => {
    ctx.fillStyle = RED2; ctx.fillRect(0, 0, 460, 1120); ctx.lineWidth = 6; ctx.strokeStyle = G; ctx.strokeRect(22, 22, 416, 1076);
    ctx.lineWidth = 3; ctx.strokeStyle = GS; ctx.strokeRect(40, 40, 380, 1040);
    for (const p of resample([[60, 60], [400, 60], [400, 1060], [60, 1060], [60, 60]], 24)) bead(p[0], p[1], 4.5);
    for (const cy of [330, 790]) { for (const p of ringPts(230, cy, 70, 22)) bead(p[0], p[1], 5); for (let k = 0; k < 8; k++) { ctx.save(); ctx.translate(230, cy); ctx.rotate((k / 8) * TAU); ell(0, -38, 10, 22, G2); ctx.restore(); } gem(230, cy, 14, k2c(cy)); }
    line([[455, 0], [455, 1120]], INK, 6);
  });
}
const k2c = (k) => (k > 500 ? EMER : SAPH);
function doors(p) {
  if (p >= 1) return; const D = doorImg(), off = eio(p) * 470;
  ctx.drawImage(D, 80 - off, 150);
  ctx.save(); ctx.translate(1000 + off, 150); ctx.scale(-1, 1); ctx.drawImage(D, 0, 0); ctx.restore();
  gem(540 - off - 26, 700, 11, RUBY); gem(540 + off + 26, 700, 11, RUBY);
}
/** PANEL CABINET hinge: draw fn() as a panel swinging shut from the left edge of the opening (p 0 → edge-on, 1 → flat) */
function hinge(p, fn) {
  if (p <= 0) return; ctx.save(); ctx.translate(OX0 - 20, 0); ctx.scale(Math.max(0.001, p), 1); ctx.translate(-(OX0 - 20), 0); fn(); ctx.restore();
  if (p < 1) { ctx.fillStyle = `rgba(20,8,2,${0.5 * (1 - p)})`; ctx.fillRect(OX0 - 20, 0, (OX1 - OX0 + 40) * p, PB); }
}

// ───────────── labels: gold cartouche plaques + gold-leaf words ─────────────
function plaqueImg(text, fs = 44) {
  ctx.save(); ctx.font = `700 ${fs}px Caladea`; ctx.letterSpacing = '4px'; const tw = ctx.measureText(text).width; ctx.restore();
  const w = Math.ceil(tw + fs * 2.1), h = Math.ceil(fs * 2.05);
  return cached('cPl' + text + fs, w + 24, h + 24, 2, () => {
    const x = 10, y = 10;
    rr(x + 3, y + 6, w, h, h / 2); ctx.fillStyle = 'rgba(43,20,8,0.55)'; ctx.fill();
    rr(x, y, w, h, h / 2); ctx.fillStyle = goldV(y, y + h); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    rr(x + 10, y + 10, w - 20, h - 20, (h - 20) / 2); ctx.lineWidth = 2; ctx.strokeStyle = GS; ctx.stroke();
    for (const p of stadiumPts(x + w / 2, y + h / 2, w - 8, h - 8, 13)) circle(p[0], p[1], 2.4, GH);
    ctx.font = `700 ${fs}px Caladea`; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = GH; ctx.fillText(text, x + w / 2 + 2 - 1, y + h / 2 + 2 - 1); ctx.fillStyle = INK; ctx.fillText(text, x + w / 2 + 2, y + h / 2 + 3);
  });
}
function plaque(text, x, y, lt, t0, s = 1, fs = 44, out = 99) {
  const p = clamp((lt - t0) / 0.38); if (p <= 0) return;
  const o = clamp((lt - out) / 0.25); if (o >= 1) return;
  const img = plaqueImg(text, fs), sc = s * eob(p) * (1 - 0.3 * o);
  blit(img, img.width / img._q / 2, img.height / img._q / 2, x, y + 30 * (1 - eo(p)), sc, Math.min(1, p * 3) * (1 - o));
}
function goldText(text, size, ls = 0) {
  return cached('cGT' + text + size, W, Math.ceil(size * 1.5), 1, () => {
    ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = ls + 'px'; ctx.lineJoin = 'round';
    const x = W / 2 + ls / 2, y = size * 0.75;
    ctx.lineWidth = size * 0.11; ctx.strokeStyle = INK; ctx.strokeText(text, x + 4, y + 6); ctx.strokeText(text, x, y);
    ctx.fillStyle = GS; ctx.fillText(text, x + 3, y + 5); ctx.fillStyle = GH; ctx.fillText(text, x - 2, y - 2);
    ctx.fillStyle = goldV(y - size / 2, y + size / 2); ctx.fillText(text, x, y);
  });
}
/** outline-only version of a gold word (the gesso before the leaf) */
function ghostText(text, size, ls = 0) {
  return cached('cGh' + text + size, W, Math.ceil(size * 1.5), 1, () => {
    ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = ls + 'px'; ctx.lineJoin = 'round';
    const x = W / 2 + ls / 2, y = size * 0.75;
    ctx.fillStyle = 'rgba(43,20,8,0.45)'; ctx.fillText(text, x, y); ctx.lineWidth = 4; ctx.strokeStyle = GS; ctx.strokeText(text, x, y);
  });
}

// ───────────── manuscript pieces: abstract Modi strokes, abstract cursive, eye diagram ─────────────
function modiWord(x, y, xe, sd) {
  ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(xe, y);
  for (let gx = x + 6; gx < xe - 4; gx += 11 + rnd(sd + gx) * 9) {
    const k = rnd(sd * 1.7 + gx); ctx.moveTo(gx, y);
    if (k < 0.33) ctx.bezierCurveTo(gx - 7, y + 10, gx + 9, y + 17, gx + 4, y + 6);
    else if (k < 0.66) ctx.quadraticCurveTo(gx + 9, y + 14, gx - 2, y + 15);
    else { ctx.lineTo(gx, y + 13); ctx.lineTo(gx - 5, y + 17); }
  }
  ctx.stroke();
}
function engWord(x, y, xe, sd) {
  ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y + 12);
  for (let gx = x; gx <= xe; gx += 2.5) {
    const ph = (gx - x) * 0.55 + sd, tall = rnd(Math.floor((gx - x) / 13) + sd) > 0.8 ? 12 : 0;
    ctx.lineTo(gx + 3, y + 12 - Math.abs(Math.sin(ph)) * 8 - tall * Math.max(0, Math.sin(ph)));
  }
  ctx.stroke();
}
function dashRows(x0, y0, x1, y1, gap, seed, modi) {
  ctx.strokeStyle = INKW; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let y = y0, r = 0; y < y1; y += gap, r++) {
    let x = x0 + (r % 3 === 0 ? 0 : rnd(seed + r) * 14); const end = x1 - (rnd(seed * 3 + r) > 0.75 ? 80 : 0);
    while (x < end - 24) { const xe = Math.min(end, x + 36 + rnd(seed + r * 13 + x) * 80); (modi ? modiWord : engWord)(x, y, xe, seed + r * 7 + x); x = xe + 14 + rnd(seed + x * 0.3 + r) * 10; }
  }
}
/** abstract eye diagram: almond, iris, pupil, rings; cloud = milky cataract disc; ink = line drawing only */
function eyeDia(x, y, r, cloud = 0, ink = false) {
  ctx.beginPath(); ctx.moveTo(x - r * 1.7, y); ctx.quadraticCurveTo(x, y - r * 1.3, x + r * 1.7, y); ctx.quadraticCurveTo(x, y + r * 1.3, x - r * 1.7, y); ctx.closePath();
  ctx.lineJoin = 'round';
  if (ink) { ctx.strokeStyle = INKW; ctx.lineWidth = 2.4; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, r * 0.28, 0, TAU); ctx.fillStyle = INKW; ctx.fill(); ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(x, y, r * 0.44, 0, TAU); ctx.stroke(); ctx.setLineDash([]); return; }
  ctx.fillStyle = IV; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, r * 0.06); ctx.stroke();
  ctx.save(); ctx.clip();
  circle(x, y, r * 0.68, BLU2); circle(x, y, r * 0.5, BLU); ctx.strokeStyle = G2; ctx.lineWidth = Math.max(1.5, r * 0.035); ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, TAU); ctx.stroke();
  circle(x, y, r * 0.3, INK);
  if (cloud > 0) { circle(x, y, r * 0.42, `rgba(236,236,226,${0.92 * cloud})`); circle(x - r * 0.08, y - r * 0.08, r * 0.24, `rgba(255,255,250,${0.75 * cloud})`); }
  circle(x - r * 0.2, y - r * 0.22, r * 0.09, '#FFFFFF');
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(x - r * 1.7, y); ctx.quadraticCurveTo(x, y - r * 1.3, x + r * 1.7, y); ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, r * 0.06); ctx.stroke();
}
/** a case-note sheet: Modi rows, eye sketch, English rows (blank = an empty dashed box instead of the eye) */
const SW = 600, SHh = 760, EYE = [420, 352, 46];
function sheetImg(blank = false) {
  return cached('cSheet' + (blank ? 'B' : ''), SW + 20, SHh + 20, 1.5, () => {
    ctx.translate(10, 10);
    rr(6, 10, SW, SHh, 8); ctx.fillStyle = 'rgba(43,20,8,0.4)'; ctx.fill();
    rr(0, 0, SW, SHh, 8); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#B79B66'; ctx.stroke();
    ctx.strokeStyle = 'rgba(160,120,60,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(24, 24, SW - 48, SHh - 48);
    dashRows(50, 70, SW - 50, 270, 34, blank ? 77 : 11, true);
    if (blank) { ctx.setLineDash([10, 8]); ctx.strokeStyle = '#8A6A3A'; ctx.lineWidth = 3; rr(70, 300, SW - 140, 110, 10); ctx.stroke(); ctx.setLineDash([]); }
    else { dashRows(50, 312, 330, 400, 34, 23, true); eyeDia(EYE[0], EYE[1], EYE[2], 0, true); }
    dashRows(50, 450, SW - 50, SHh - 50, 32, blank ? 51 : 31, false);
  });
}
const sheet = (x, y, s, blank = false) => { const S = sheetImg(blank); blit(S, SW / 2 + 10, SHh / 2 + 10, x, y, s); };
/** colour eye roundel in a beaded gold ring */
function roundelImg(k) {
  return cached('cRd' + k, 140, 140, 1.5, () => {
    const c = 70; circle(c + 2, c + 4, 54, 'rgba(43,20,8,0.5)'); circle(c, c, 54, G); circle(c, c, 44, k % 3 === 1 ? GRN : RED);
    for (const p of ringPts(c, c, 49, 18)) bead(p[0], p[1], 3.6);
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, 43, 0, TAU); ctx.clip(); eyeDia(c, c, 20, k >= 3 ? 1 : 0); ctx.restore();
  });
}

// ───────────── figures (faceless) ─────────────
/** standing figure, feet at (0,0), height 100u: long coat, sash, Maratha-style turban, plain head */
function figure(u, o) {
  const ol = o.ol || G2, lw = Math.max(2, u * 0.9);
  const S = (fill) => { ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); };
  rr(-9 * u, -11 * u, 6 * u, 11 * u, 2 * u); S(IV); rr(3 * u, -11 * u, 6 * u, 11 * u, 2 * u); S(IV);
  ell(-7 * u, -0.5 * u, 5 * u, 2 * u, o.shoe || RED2); ell(7 * u, -0.5 * u, 5 * u, 2 * u, o.shoe || RED2);
  // long coat
  ctx.beginPath(); ctx.moveTo(-12 * u, -76 * u); ctx.quadraticCurveTo(-14 * u, -64 * u, -10 * u, -52 * u); ctx.quadraticCurveTo(-20 * u, -30 * u, -24 * u, -8 * u);
  ctx.quadraticCurveTo(0, -4 * u, 24 * u, -8 * u); ctx.quadraticCurveTo(20 * u, -30 * u, 10 * u, -52 * u); ctx.quadraticCurveTo(14 * u, -64 * u, 12 * u, -76 * u); ctx.quadraticCurveTo(0, -80 * u, -12 * u, -76 * u); ctx.closePath(); S(o.coat);
  ctx.beginPath(); ctx.moveTo(-23 * u, -11 * u); ctx.quadraticCurveTo(0, -7 * u, 23 * u, -11 * u); ctx.strokeStyle = G2; ctx.lineWidth = 2.2 * u; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -77 * u); ctx.lineTo(0, -10 * u); ctx.strokeStyle = G2; ctx.lineWidth = 1.2 * u; ctx.stroke();
  // sash
  rr(-11.5 * u, -56 * u, 23 * u, 6 * u, 2 * u); S(o.sash || G2);
  ctx.beginPath(); ctx.moveTo(4 * u, -51 * u); ctx.lineTo(9 * u, -32 * u); ctx.lineTo(4 * u, -33 * u); ctx.closePath(); S(o.sash || G2);
  // arms
  for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sgn * 11 * u, -75 * u); ctx.quadraticCurveTo(sgn * 18 * u, -62 * u, sgn * 17 * u, -44 * u); ctx.lineTo(sgn * 12 * u, -44 * u); ctx.quadraticCurveTo(sgn * 12 * u, -60 * u, sgn * 8 * u, -70 * u); ctx.closePath(); S(dk(o.coat, 0.18)); circle(sgn * 14.5 * u, -42 * u, 2.8 * u, IV); }
  // neck, head (no features), turban
  rr(-2.6 * u, -83 * u, 5.2 * u, 7 * u, 1 * u); S(IV);
  ctx.beginPath(); ctx.ellipse(0, -88 * u, 6.4 * u, 7.4 * u, 0, 0, TAU); S(IV);
  ctx.beginPath(); ctx.ellipse(0, -93.5 * u, 8.6 * u, 4.8 * u, 0, 0, TAU); S(o.turban);
  ctx.beginPath(); ctx.ellipse(4.5 * u, -97.5 * u, 6.8 * u, 3.6 * u, -0.45, 0, TAU); S(o.turban);
  ctx.beginPath(); ctx.moveTo(-8 * u, -92 * u); ctx.quadraticCurveTo(0, -95 * u, 8.5 * u, -93 * u); ctx.strokeStyle = G2; ctx.lineWidth = 1.4 * u; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-3 * u, -97 * u); ctx.quadraticCurveTo(-8 * u, -106 * u, -2 * u, -108 * u); ctx.strokeStyle = GH; ctx.lineWidth = 1.2 * u; ctx.stroke();
  circle(-3 * u, -96 * u, 1.7 * u, RUBY); circle(-3.5 * u, -96.6 * u, 0.5 * u, '#FFFFFF');
  for (let k = 0; k < 9; k++) { const a = Math.PI * (0.15 + 0.7 * (k / 8)); circle(Math.cos(a) * 8 * u, -77 * u + Math.sin(a) * 7 * u, 1.1 * u, k % 4 === 2 ? EMER : GH); }
}
const FIG_OX = 130, FIG_OY = 432;
function figImg(key, o) { return cached('cFig' + key, 260, 450, 1.5, () => { ctx.translate(FIG_OX, FIG_OY); figure(4, o); }); }
const KING = { coat: IV, turban: RED2, sash: G2, ol: G };
const SON = { coat: BLU2, turban: GRN2, sash: G2, ol: G2 };
/** British red-coat figure (simple, faceless), feet at (0,0) */
function redcoatImg() {
  return cached('cRC', 140, 330, 1.5, () => {
    ctx.translate(70, 320); const u = 2.8, ol = INK;
    const S = (f) => { ctx.fillStyle = f; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 2.2; ctx.stroke(); };
    rr(-8 * u, -40 * u, 7 * u, 40 * u, 2 * u); S(IV); rr(1 * u, -40 * u, 7 * u, 40 * u, 2 * u); S(IV);
    ctx.beginPath(); ctx.moveTo(-12 * u, -78 * u); ctx.lineTo(12 * u, -78 * u); ctx.lineTo(13 * u, -34 * u); ctx.lineTo(-13 * u, -34 * u); ctx.closePath(); S(RED2);
    line([[-11 * u, -76 * u], [11 * u, -40 * u]], IV, 2.4 * u); line([[11 * u, -76 * u], [-11 * u, -40 * u]], IV, 2.4 * u);
    line([[16 * u, -30 * u], [16 * u, -112 * u]], WOOD, 2.2 * u); rr(13 * u, -78 * u, 6 * u, 20 * u, 2 * u); S(RED2);
    ctx.beginPath(); ctx.ellipse(0, -86 * u, 6 * u, 7 * u, 0, 0, TAU); S(IV);
    rr(-7 * u, -108 * u, 14 * u, 18 * u, 2 * u); S('#1A1410'); ell(0, -109 * u, 3 * u, 4 * u, IV);
  });
}
/** gilt throne in two layers: back (behind the sitter) and front (seat, arms, legs); origin = floor centre */
function throneImg(front) {
  return cached('cTh' + (front ? 'F' : 'B'), 640, 760, 1.5, () => {
    ctx.translate(320, 740); ctx.lineJoin = 'round';
    const S = (f) => { ctx.fillStyle = f; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); };
    if (!front) {
      poly(archPts(-200, -700, 200, -240, 150, 5, 16)); S(goldV(-700, -240));
      poly(archPts(-150, -640, 150, -260, 120, 5, 12)); S(RED2);
      for (const p of resample(archPts(-178, -680, 178, -250, 140, 5, 14).slice(1, -1), 20)) bead(p[0], p[1], 4.4);
      gem(0, -706, 15, SAPH); gem(-200, -560, 11, EMER); gem(200, -560, 11, EMER);
      for (let k = 0; k < 3; k++) for (const p of ringPts(0, -470, 40 + k * 26, 10 + k * 6)) circle(p[0], p[1], 3, k === 1 ? G2 : 'rgba(233,194,90,0.6)');
      return;
    }
    rr(-230, -300, 460, 50, 18); S(RED); // cushion
    rr(-240, -258, 480, 128, 10); S(goldV(-258, -130));
    for (const p of resample([[-222, -238], [222, -238], [222, -150], [-222, -150], [-222, -238]], 22)) bead(p[0], p[1], 4.4);
    for (const x of [-120, 0, 120]) gem(x, -194, 13, x ? RUBY : EMER);
    for (const sgn of [-1, 1]) {
      rr(sgn * 210 - 30, -130, 60, 120, 10); S(goldV(-130, 0)); ell(sgn * 210, -6, 44, 14, G); ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sgn * 236, -258); ctx.lineTo(sgn * 236, -380); ctx.quadraticCurveTo(sgn * 236, -430, sgn * 200, -420); ctx.quadraticCurveTo(sgn * 175, -410, sgn * 190, -390);
      ctx.lineTo(sgn * 196, -258); ctx.closePath(); S(goldV(-430, -258)); gem(sgn * 207, -405, 9, RUBY);
    }
  });
}
/** brass lens ring + handle (cached) */
const LR = 150;
function lensImg() {
  return cached('cLens', 520, 520, 1.5, () => {
    const c = 190;
    ctx.save(); ctx.translate(c, c); ctx.rotate(Math.PI / 4);
    rr(LR + 4, -16, 50, 32, 8); ctx.fillStyle = G; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    rr(LR + 50, -20, 200, 40, 20); ctx.fillStyle = WOOD; ctx.fill(); ctx.stroke(); line([[LR + 70, -10], [LR + 230, -10]], WOOD2, 5);
    for (const x of [LR + 100, LR + 180]) { rr(x, -21, 10, 42, 3); ctx.fillStyle = G2; ctx.fill(); }
    ctx.restore();
    ctx.lineWidth = 30; ctx.strokeStyle = GS; ctx.beginPath(); ctx.arc(c + 3, c + 4, LR + 12, 0, TAU); ctx.stroke();
    ctx.strokeStyle = G; ctx.beginPath(); ctx.arc(c, c, LR + 12, 0, TAU); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(c, c, LR, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(c, c, LR + 27, 0, TAU); ctx.stroke();
    for (const p of ringPts(c, c, LR + 13, 44)) bead(p[0], p[1], 5);
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, LR, 0, TAU); ctx.clip();
    ctx.lineWidth = 26; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.arc(c, c, LR - 30, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke(); ctx.restore();
  });
}
/** lens at (x,y): inside() draws the magnified view (already clipped) */
function lens(x, y, inside) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, LR, 0, TAU); ctx.clip(); inside(); ctx.restore();
  blit(lensImg(), 190, 190, x, y, 1);
}

// ───────────── scenes ─────────────
/** library shelves: palm-leaf bundles, folio stacks, bound books */
const SHELVES = [560, 860, 1160];
function libImg() {
  return cached('cLib', W, PB, 1, () => {
    ctx.drawImage(bgImg(GRN), 0, 0);
    for (const [si, sy] of SHELVES.entries()) {
      let x = 120;
      while (x < 950) {
        const k = rnd(si * 31 + x * 0.17), sd = si * 100 + x;
        if (k < 0.34) { // palm-leaf bundle stack
          const w = 150 + rnd(sd) * 40; let y = sy;
          for (let j = 0; j < 3; j++) { const h = 30 + rnd(sd + j) * 10; rr(x + j * 4, y - h, w - j * 8, h, 6); ctx.fillStyle = j % 2 ? '#C8A060' : '#D9B676'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
            line([[x + j * 4 + 6, y - h / 2], [x + w - j * 4 - 6, y - h / 2]], 'rgba(90,60,20,0.5)', 1.5); rr(x + j * 4 - 4, y - h - 2, 10, h + 4, 3); ctx.fillStyle = WOOD; ctx.fill(); rr(x + w - j * 4 - 6, y - h - 2, 10, h + 4, 3); ctx.fill();
            line([[x + w / 2 - 6, y - h - 3], [x + w / 2 - 6, y + 1]], RED2, 4); y -= h + 2; }
          x += w + 16;
        } else if (k < 0.62) { // folio stack tied with cloth
          const w = 120; let y = sy; const n = 5 + Math.floor(rnd(sd * 2) * 4);
          for (let j = 0; j < n; j++) { rr(x + (rnd(sd + j) - 0.5) * 8, y - 12, w, 12, 3); ctx.fillStyle = j % 2 ? PAPER : '#E2CFA6'; ctx.fill(); ctx.strokeStyle = 'rgba(43,20,8,0.6)'; ctx.lineWidth = 1.5; ctx.stroke(); y -= 12; }
          ctx.fillStyle = RED2; ctx.fillRect(x + w / 2 - 8, y, 16, sy - y);
          x += w + 18;
        } else { // upright books
          const n = 3 + Math.floor(rnd(sd * 3) * 4);
          for (let j = 0; j < n; j++) { const w = 26 + rnd(sd + j * 2) * 14, h = 120 + rnd(sd + j * 5) * 70, c = [RED2, BLU2, GRN2, '#5A2A12', RED][Math.floor(rnd(sd + j) * 5)];
            rr(x, sy - h, w, h, 4); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
            for (const f of [0.15, 0.82]) { ctx.fillStyle = G2; ctx.fillRect(x + 3, sy - h * f - 4, w - 6, 6); } x += w + 3; }
          x += 18;
        }
      }
      rr(OX0 - 30, sy, OX1 - OX0 + 60, 26, 4); ctx.fillStyle = WOOD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
      line([[OX0 - 30, sy + 3], [OX1 + 30, sy + 3]], G2, 3);
      for (const p of resample([[OX0, sy + 16], [OX1, sy + 16]], 26)) circle(p[0], p[1], 3, G2);
    }
  });
}
/** operation room: patient lying on a cot, floor, a lamp stand (flame drawn live) */
function opImg() {
  return cached('cOp', W, PB, 1, () => {
    ctx.drawImage(bgImg(GRN), 0, 0);
    ctx.fillStyle = '#5A2A12'; ctx.fillRect(0, 1060, W, PB - 1060); line([[0, 1060], [W, 1060]], G2, 4);
    for (const p of resample([[OX0, 1078], [OX1, 1078]], 24)) circle(p[0], p[1], 3, G);
    // cot
    for (const x of [470, 900]) { rr(x - 10, 940, 20, 150, 4); ctx.fillStyle = WOOD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); }
    rr(440, 920, 490, 40, 8); ctx.fillStyle = WOOD2; ctx.fill(); ctx.stroke();
    for (let x = 460; x < 920; x += 22) line([[x, 924], [x + 12, 956]], 'rgba(43,20,8,0.35)', 3);
    // patient (faceless): pillow, head, draped body
    rr(452, 870, 120, 54, 22); ctx.fillStyle = RED2; ctx.fill(); ctx.strokeStyle = INK; ctx.stroke();
    ell(512, 868, 38, 32, IV); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(548, 920); ctx.quadraticCurveTo(560, 860, 640, 862); ctx.quadraticCurveTo(760, 850, 830, 878); ctx.quadraticCurveTo(905, 882, 912, 920); ctx.closePath();
    ctx.fillStyle = IV; ctx.fill(); ctx.stroke(); line([[600, 900], [880, 900]], G2, 5); line([[600, 912], [880, 912]], RED2, 3);
    // lamp stand
    rr(205, 1036, 90, 24, 8); ctx.fillStyle = G; ctx.fill(); ctx.stroke(); rr(242, 720, 16, 320, 6); ctx.fill(); ctx.stroke();
    for (const y of [800, 900, 980]) { ell(250, y, 24, 9, G2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(196, 712); ctx.quadraticCurveTo(250, 760, 304, 712); ctx.closePath(); ctx.fillStyle = G2; ctx.fill(); ctx.stroke();
  });
}
function flame(x, y, s, t, a = 1) {
  const f = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s * f);
  const gl = ctx.createRadialGradient(0, -20, 4, 0, -20, 90); gl.addColorStop(0, 'rgba(255,230,150,0.45)'); gl.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = gl; ctx.fillRect(-90, -110, 180, 180);
  ctx.beginPath(); ctx.moveTo(0, -46); ctx.quadraticCurveTo(18, -10, 0, 4); ctx.quadraticCurveTo(-18, -10, 0, -46); ctx.fillStyle = G2; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -28); ctx.quadraticCurveTo(8, -6, 0, 2); ctx.quadraticCurveTo(-8, -6, 0, -28); ctx.fillStyle = GH; ctx.fill(); ctx.restore();
}
/** outline of an unknown standing figure (no turban), as a closed polyline, feet at (cx, fy), height h */
function unknownPts(cx, fy, h) {
  const u = h / 100, P = [];
  for (let i = 0; i <= 20; i++) { const a = Math.PI / 2 + 0.55 + (i / 20) * (TAU - 1.1); P.push([cx + Math.cos(a) * 8 * u, fy - 88 * u + Math.sin(a) * 9 * u]); }
  const body = [[cx + 3 * u, fy - 79 * u], [cx + 13 * u, fy - 75 * u], [cx + 18 * u, fy - 46 * u], [cx + 22 * u, fy - 8 * u], [cx - 22 * u, fy - 8 * u], [cx - 18 * u, fy - 46 * u], [cx - 13 * u, fy - 75 * u], [cx - 3 * u, fy - 79 * u]];
  return resample([...P, P[0]], 15).concat(resample([...body, body[0]], 17));
}
/** coast: lacquer red sky with a gold sun, ultramarine sea, sand shore */
function coastImg() {
  return cached('cCoast', W, PB, 1, () => {
    ctx.drawImage(bgImg(RED), 0, 0);
    circle(800, 470, 74, G); for (const p of ringPts(800, 470, 92, 26)) bead(p[0], p[1], 5);
    ctx.fillStyle = BLU; ctx.fillRect(0, 760, W, PB - 760); line([[0, 760], [W, 760]], INK, 3);
    ctx.fillStyle = BLU2; for (let k = 0; k < 4; k++) ctx.fillRect(0, 800 + k * 60, W, 22);
    ctx.beginPath(); ctx.moveTo(0, 1010); ctx.quadraticCurveTo(300, 960, 560, 990); ctx.quadraticCurveTo(820, 1020, W, 1000); ctx.lineTo(W, PB); ctx.lineTo(0, PB); ctx.closePath();
    ctx.fillStyle = SAND; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    for (let i = 0; i < 70; i++) circle(120 + rnd(i) * 840, 1030 + rnd(i * 3) * 200, 2.5, 'rgba(122,87,20,0.45)');
  });
}
/** animated wave scallops with beaded crests */
function waves(t, y0, y1, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.lineWidth = 4; ctx.strokeStyle = GH; ctx.lineCap = 'round';
  for (let r = 0, y = y0; y < y1; y += 56, r++) {
    const sp = 70, off = ((t * (r % 2 ? 40 : -34)) % sp + sp) % sp;
    ctx.beginPath();
    for (let x = -sp + off; x < W + sp; x += sp) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sp / 2, y - 22, x + sp, y); }
    ctx.stroke();
    for (let x = -sp + off; x < W + sp; x += sp) circle(x + sp / 2, y - 11, 3.4, G2);
  }
  ctx.restore();
}
/** Manora: slim hexagonal tiered tower; prog = tiers built (0..9), each tier drops in; light 0..1 */
function tower(x, by, s, prog, light, t) {
  ctx.save(); ctx.translate(x, by); ctx.scale(s, s); ctx.lineJoin = 'round';
  let y = 0;
  for (let k = 0; k < 9; k++) {
    const w = 250 - k * 17, h = 76 - k * 2.5, p = clamp(prog - k); if (p <= 0) break;
    const dy = -160 * (1 - eob(p)); ctx.save(); ctx.translate(0, dy); ctx.globalAlpha *= Math.min(1, p * 3);
    fillP([[-w / 2, y], [-w / 4, y], [-w / 4, y - h], [-w / 2, y - h]], '#CDBB94');
    fillP([[-w / 4, y], [w / 4, y], [w / 4, y - h], [-w / 4, y - h]], IV);
    fillP([[w / 4, y], [w / 2, y], [w / 2, y - h], [w / 4, y - h]], '#E0D2B0');
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2, y - h, w, h); line([[-w / 4, y], [-w / 4, y - h]], INK, 2); line([[w / 4, y], [w / 4, y - h]], INK, 2);
    const ww = w * 0.13, wh = h * 0.52;
    for (const [cx, sc] of [[0, 1], [-w * 0.375, 0.55], [w * 0.375, 0.55]]) { ctx.beginPath(); ctx.moveTo(cx - ww * sc / 2, y - h * 0.18); ctx.lineTo(cx - ww * sc / 2, y - h * 0.18 - wh + ww * sc / 2); ctx.arc(cx, y - h * 0.18 - wh + ww * sc / 2, ww * sc / 2, Math.PI, 0); ctx.lineTo(cx + ww * sc / 2, y - h * 0.18); ctx.closePath(); ctx.fillStyle = '#2B1408'; ctx.fill(); }
    rr(-w / 2 - 10, y - h - 12, w + 20, 14, 4); ctx.fillStyle = G; ctx.fill(); ctx.stroke();
    for (let bx = -w / 2 - 2; bx <= w / 2 + 2; bx += 16) circle(bx, y - h - 5, 2.6, GH);
    ctx.restore();
    y -= h + 12;
  }
  if (prog >= 9) {
    const p = clamp(prog - 9), yy = y - 160 * (1 - eob(p));
    ctx.beginPath(); ctx.moveTo(-58, yy); ctx.quadraticCurveTo(-58, yy - 76, 0, yy - 92); ctx.quadraticCurveTo(58, yy - 76, 58, yy); ctx.closePath(); ctx.fillStyle = G; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    line([[0, yy - 92], [0, yy - 128]], G2, 6); circle(0, yy - 132, 8, G2);
    if (light > 0) {
      const f = 1 + Math.sin(t * 9) * 0.06;
      const gl = ctx.createRadialGradient(0, yy - 46, 6, 0, yy - 46, 210 * f); gl.addColorStop(0, `rgba(255,240,176,${0.85 * light})`); gl.addColorStop(1, 'rgba(255,240,176,0)');
      ctx.fillStyle = gl; ctx.fillRect(-230, yy - 270, 460, 460); circle(0, yy - 40, 18 * light, GH);
    }
  }
  ctx.restore();
}
function bicorne(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-70, 6); ctx.quadraticCurveTo(-30, -20, -6, -58); ctx.quadraticCurveTo(10, -60, 20, -54); ctx.quadraticCurveTo(40, -20, 70, 6); ctx.quadraticCurveTo(0, -10, -70, 6); ctx.closePath();
  ctx.fillStyle = '#141A2E'; ctx.fill(); ctx.strokeStyle = G2; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}
function flag(px, top, base, t, s = 1, fy = null) {
  line([[px, base], [px, top - 10]], WOOD, 8); circle(px, top - 14, 9, G2);
  const y0 = fy ?? top, w = 170 * s, h = 110 * s;
  ctx.beginPath(); ctx.moveTo(px, y0);
  for (let i = 0; i <= 10; i++) { const x = (i / 10) * w; ctx.lineTo(px + x, y0 + Math.sin(t * 6 - i * 0.7) * 8 * (i / 10)); }
  for (let i = 10; i >= 0; i--) { const x = (i / 10) * w; ctx.lineTo(px + x, y0 + h + Math.sin(t * 6 - i * 0.7) * 8 * (i / 10)); }
  ctx.closePath(); ctx.fillStyle = RED2; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  const cy = y0 + h / 2 + Math.sin(t * 6 - 3.5) * 4; circle(px + w / 2, cy, 26 * s, G2); circle(px + w / 2, cy, 15 * s, RED2); circle(px + w / 2, cy, 7 * s, G2);
}
/** Thanjavur fort walls with bastions under an ultramarine sky */
function fortImg() {
  return cached('cFort', W, PB, 1, () => {
    ctx.drawImage(bgImg(BLU), 0, 0);
    ctx.fillStyle = GRN2; ctx.fillRect(0, 1040, W, PB - 1040);
    ctx.fillStyle = BLU2; ctx.fillRect(0, 1010, W, 34); line([[0, 1010], [W, 1010]], INK, 3);
    const WALL = '#D2B98C', SHD = '#B39566';
    const S = (f) => { ctx.fillStyle = f; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); };
    const merlons = (x0, x1, y) => { for (let x = x0; x < x1 - 10; x += 34) { rr(x, y - 26, 22, 28, 3); S(WALL); } };
    rr(OX0 - 40, 780, OX1 - OX0 + 80, 232, 0); S(WALL); merlons(OX0 - 30, OX1 + 40, 782);
    for (let r = 0; r < 4; r++) for (let x = OX0 - 40 + (r % 2) * 40; x < OX1 + 40; x += 80) line([[x, 820 + r * 48], [x + 60, 820 + r * 48]], 'rgba(122,87,40,0.35)', 2);
    for (const [cx, w, top] of [[230, 150, 700], [850, 150, 700], [540, 230, 620]]) {
      rr(cx - w / 2, top, w, 1012 - top, 0); S(WALL); rr(cx + w / 4, top, w / 4, 1012 - top, 0); ctx.fillStyle = SHD; ctx.fill(); merlons(cx - w / 2 + 6, cx + w / 2 + 6, top + 2);
      rr(cx - 14, top + 50, 28, 46, 14); S('#2B1408');
    }
    ctx.beginPath(); ctx.moveTo(490, 1012); ctx.lineTo(490, 900); ctx.arc(540, 900, 50, Math.PI, 0); ctx.lineTo(590, 1012); ctx.closePath(); S('#2B1408');
    for (const p of resample([[490, 1012], [490, 900]], 18)) circle(p[0] - 10, p[1], 3, G2);
    for (const p of resample([[590, 1012], [590, 900]], 18)) circle(p[0] + 10, p[1], 3, G2);
    for (let i = 0; i < 40; i++) circle(OX0 + rnd(i * 7) * (OX1 - OX0), 1080 + rnd(i * 11) * 150, 3, 'rgba(233,194,90,0.35)');
  });
}

// ───────────── end card medallion ─────────────
function medalImg() {
  return cached('cMedal', 360, 360, 1.5, () => {
    const c = 180; circle(c + 3, c + 5, 150, 'rgba(20,8,2,0.5)'); circle(c, c, 150, G); circle(c, c, 126, RED);
    for (let k = 0; k < 12; k++) { ctx.save(); ctx.translate(c, c); ctx.rotate((k / 12) * TAU); ell(0, -138, 9, 14, G2); ctx.restore(); }
    // open book
    ctx.lineJoin = 'round';
    for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(c, c + 40); ctx.quadraticCurveTo(c + sgn * 40, c + 24, c + sgn * 88, c + 34); ctx.lineTo(c + sgn * 88, c + 92); ctx.quadraticCurveTo(c + sgn * 40, c + 82, c, c + 98); ctx.closePath(); ctx.fillStyle = IV; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
      for (let r = 0; r < 4; r++) line([[c + sgn * 14, c + 50 + r * 11], [c + sgn * 74, c + 47 + r * 11]], 'rgba(58,36,16,0.6)', 2.5); }
    // lamp bowl
    ctx.beginPath(); ctx.moveTo(c - 44, c - 10); ctx.quadraticCurveTo(c, c + 30, c + 44, c - 10); ctx.closePath(); ctx.fillStyle = G2; ctx.fill(); ctx.strokeStyle = INK; ctx.stroke();
    rr(c - 8, c + 8, 16, 18, 3); ctx.fillStyle = G; ctx.fill();
  });
}

/** start of the first word in `line` that equals `word` exactly (case/punctuation ignored) and starts after `after` */
const nw = (w) => String(w).toLowerCase().replace(/[^a-z0-9']+/g, '');
function wx(word, line, after = 0) {
  const hit = T.words.find((w) => w.line === line && nw(w.w) === nw(word) && w.s > after);
  if (!hit) throw new Error(`word "${word}" not found in line ${line} after ${after}`); return hit.s;
}

// ═════════════════════════ SHOTS ═════════════════════════
export function buildC(add, cue) {
  const t10 = L(10), tForty = Wd('forty', 10), tModi = Wd('Modi', 10), tOne = Wd('One', 10), tCat = Wd('cataract', 10);
  // "in" appears three times in line 10; c5 starts on the one right before "eighteen"
  const t1827 = Wd('eighteen', 10), tIn2 = wx('in', 10, tCat);
  const t11 = L(11), tNot = Wd('not', 11), tSome = Wd('Some', 11), tKing11 = Wd('king', 11), tThe = wx('the', 11, Wd('himself', 11)), tProve = Wd('prove', 11);
  const t12 = L(12), tManora = Wd('Manora', 12), tTo = wx('to', 12), tVict = Wd('victory', 12), tNap = Wd('Napoleon', 12);
  const t13 = L(13), t1832 = Wd('eighteen', 13), tHis = Wd('His', 13), tLast = Wd('last', 13), tWithout = Wd('without', 13), tBrit = Wd('British', 13), tTook = Wd('took', 13);
  const t14 = L(14), tSaved = Wd('saved', 14), tFollow = Wd('Follow', 14), tAazhi = Wd('Aazhi', 14);
  // second "died" in line 13 (the son's death)
  const died2 = wx('died', 13, tHis);

  // c1 ─ cabinet doors open on the library; a case-note folio rises out of the shelf
  add({ id: 'c1', at: t10, cam: [540, 760], zoom: 0.07, note: 'cabinet doors slide open on library shelves; a case-note folio rises to the front; RECORD plaque',
    draw(lt) {
      ctx.drawImage(libImg(), 0, 0);
      const p = eio(seg(lt, 0.3, 1.25)); sheet(540, lerp(1000, 720, p), lerp(0.3, 0.9, p));
      doors(seg(lt, 0, 0.5));
      frame(lt, 1, { sheen: seg(lt, 0.7, 1.6) });
      plaque('RECORD', 540, 1172, lt, 0.8);
    } });
  cue(t10, 'whoosh', { gain: 0.35 }); cue(t10 + 0.4, 'slide', { gain: 0.25 }); cue(t10 + 0.8, 'pop', { gain: 0.35 });

  // c2 ─ 44 eye roundels drop into a honeycomb
  const RD = []; { const rows = [6, 7, 6, 7, 6, 7, 5]; rows.forEach((n, r) => { for (let i = 0; i < n; i++) RD.push([540 + (i - (n - 1) / 2) * 122, 392 + r * 104]); }); }
  add({ id: 'c2', at: tForty, cam: [540, 700], zoom: 0.08, note: '44 eye roundels drop into a honeycomb like inlaid gems (some clouded); 44 PATIENTS plaque',
    draw(lt) {
      bg(BLU);
      RD.forEach(([x, y], i) => { const t = lt - 0.05 - i * 0.026; if (t < 0) return; const p = clamp(t / 0.3), k = (i * 7) % 11 === 3 || i === 20 ? 3 + (i % 3) : i % 3;
        blit(roundelImg(k), 70, 70, x, y - 70 * (1 - eob(p)), 0.9 * eob(p), Math.min(1, p * 4)); if (t > 0.2 && t < 0.5) sparkle(x + 30, y - 30, 22 * Math.sin(Math.PI * (t - 0.2) / 0.3)); });
      frame(lt, 2, { sheen: seg(lt, 1.1, 1.9) });
      plaque('44 PATIENTS', 540, 1172, lt, 0.95);
    } });
  for (let k = 0; k < 6; k++) cue(tForty + 0.1 + k * 0.2, 'pop', { gain: 0.14 + rnd(k) * 0.08, pan: (rnd(k * 3) - 0.5) * 0.8 });
  cue(tForty + 0.95, 'tock', { gain: 0.4 });

  // c3 ─ open book, Modi strokes and English cursive write in
  const PW = 380, PH = 540, ROW0 = 46, RH = 36, NR = 13;
  const inkImg = (modi) => cached('cInk' + (modi ? 'M' : 'E'), PW, PH, 1.5, () => { ctx.translate(0, 0); for (let r = 0; r < NR; r++) dashRows(30, ROW0 + r * RH, PW - 30, ROW0 + r * RH + 1, 40, (modi ? 300 : 500) + r * 17, modi); });
  const writeIn = (img, x, y, pr) => {
    const m = pr * NR, q = img._q;
    for (let r = 0; r < NR; r++) { const f = clamp(m - r); if (f <= 0) break; const sy = ROW0 + r * RH - 14, sw = PW * f;
      ctx.drawImage(img, 0, sy * q, sw * q, RH * q, x, y + sy, sw, RH);
      if (f < 1) { circle(x + sw, y + sy + 16, 5, G2); circle(x + sw, y + sy + 16, 2, GH); } }
  };
  add({ id: 'c3', at: tModi, cam: [540, 760], zoom: 0.08, note: 'open book: abstract Modi strokes write in on the left page, abstract English cursive on the right; MODI / ENGLISH plaques',
    draw(lt, d) {
      bg(RED2);
      const ox = lerp(26, -26, eio(clamp(lt / d)));
      ctx.save(); ctx.translate(ox, 0);
      rr(120, 470, 840, 580, 18); ctx.fillStyle = GRN; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
      for (const p of resample([[136, 486], [944, 486], [944, 1034], [136, 1034], [136, 486]], 24)) circle(p[0], p[1], 3.2, G2);
      for (const [x, modi, t0] of [[148, true, 0.1], [552, false, 0.45]]) {
        rr(x, 490, PW, PH, 6); ctx.fillStyle = PAPER; ctx.fill(); ctx.strokeStyle = '#B79B66'; ctx.lineWidth = 2; ctx.stroke();
        writeIn(inkImg(modi), x, 490, seg(lt, t0, t0 + 1.35));
      }
      line([[540, 492], [540, 1028]], 'rgba(43,20,8,0.45)', 6);
      ctx.restore();
      frame(lt, 0);
      plaque('MODI', 338 + ox, 440, lt, 0.05, 0.8); plaque('ENGLISH', 742 + ox, 440, lt, 0.75, 0.8);
    } });
  cue(tModi, 'slide', { gain: 0.3 }); cue(tModi + 0.05, 'pop', { gain: 0.3 }); cue(tModi + 0.75, 'pop', { gain: 0.3 });

  // c4 ─ brass lens glides to the eye sketch; inside, the lens clouds milky (cataract)
  const S4 = 1.12, SX = 540, SY = 720;
  const eyeScreen = [SX + (EYE[0] - SW / 2) * S4, SY + (EYE[1] - SHh / 2) * S4];
  add({ id: 'c4', at: tOne, cam: [600, 720], zoom: 0.1, note: 'brass lens glides over a case note to the eye sketch; inside the lens the eye clouds with a milky cataract disc; CATARACT plaque',
    draw(lt) {
      bg(RED);
      sheet(SX, SY, S4);
      const p = eio(seg(lt, 0, 1.25)), lx = lerp(330, eyeScreen[0], p) + Math.sin(lt * 2.2) * 6, ly = lerp(440, eyeScreen[1], p) + Math.cos(lt * 1.9) * 5;
      const cl = eo(seg(lt, tCat - tOne + 0.1, tCat - tOne + 0.9)), M = 2;
      lens(lx, ly, () => {
        ctx.fillStyle = PAPER; ctx.fillRect(lx - LR, ly - LR, LR * 2, LR * 2);
        sheet(lx + (SX - lx) * M, ly + (SY - ly) * M, S4 * M);
        const ex = lx + (eyeScreen[0] - lx) * M, ey = ly + (eyeScreen[1] - ly) * M;
        ctx.globalAlpha = clamp(p * 1.4 - 0.4); eyeDia(ex, ey, EYE[2] * S4 * M * 0.95, cl); ctx.globalAlpha = 1;
      });
      frame(lt, 0);
      plaque('CATARACT', 540, 1180, lt, 1.25);
    } });
  cue(tOne, 'whoosh', { gain: 0.3 }); cue(tCat + 0.2, 'sparkle', { gain: 0.3 }); cue(tOne + 1.25, 'pop', { gain: 0.3 });

  // c5 ─ gold leaves settle into 1827
  const Y27 = 800;
  add({ id: 'c5', at: tIn2, cam: [540, 720], zoom: 0.09, note: 'gold leaves flutter down and stick into the date 1827, then it gilds solid with a sheen; beaded eye roundel above; gems pop into the frame',
    draw(lt, d) {
      bg(BLU);
      const ring = ringPts(540, 470, 118, 40); beadPath(ring, seg(lt, 0, 0.9), 6);
      blit(roundelImg(3), 70, 70, 540, 470, 1.55 * (0.9 + 0.1 * eo(clamp(lt / 0.5))));
      const gt = goldText('1827', 280, 6), gh = ghostText('1827', 280, 6), oy = 280 * 0.75, pts = samplePts('c1827', gt, 20, W / 2, oy);
      blit(gh, W / 2, oy, 540, Y27, 1, 1 - seg(lt, 1.2, 1.6));
      leaves(lt, pts, 540, Y27, 1, 0.05, 0.9, 24, 0.5, 3);
      sheenBlit(gt, W / 2, oy, 540, Y27, 1, seg(lt, 1.6, d), eo(seg(lt, 1.05, 1.5)));
      frame(lt, 2, { gem: 0.3 });
    } });
  cue(tIn2 + 0.1, 'sparkle', { gain: 0.3 }); cue(tIn2 + 1.2, 'bell', { gain: 0.35 });

  // c6 ─ operation scene; the operator is an uncertain bead outline; NOT CLEAR
  const OPX = 360, OPF = 1060, OPH = 560;
  const opDots = unknownPts(OPX, OPF, OPH);
  add({ id: 'c6', at: t11, cam: [520, 820], zoom: 0.07, note: 'operation scene: patient on a cot, oil lamp; the operator is only a flickering gesso-bead outline (unknown); NOT CLEAR plaque',
    draw(lt, d, t) {
      ctx.drawImage(opImg(), 0, 0); flame(250, 712, 1, t);
      beadPath(opDots, seg(lt, 0.05, 1.2), 6, lt > 1.25 ? (i) => 0.25 + 0.75 * Math.abs(Math.sin(t * 2.6 + i * 0.45)) : null);
      frame(lt, 1);
      plaque('NOT CLEAR', 540, 1172, lt, tNot - t11);
    } });
  cue(t11 + 0.1, 'heartbeat', { gain: 0.25 }); cue(tNot, 'tock', { gain: 0.45 });

  // c7 ─ SOME SAY: gold leaves settle and the outline becomes the king
  const kImg = () => figImg('King', KING), KS = OPH / 400;
  add({ id: 'c7', at: tSome, cam: [460, 760], zoom: 0.08, note: 'the bead outline fills: gold leaves settle and the faceless king figure (turban, long coat) appears at the cot; SOME SAY plaque',
    draw(lt, d, t) {
      ctx.drawImage(opImg(), 0, 0); flame(250, 712, 1, t);
      const kp = eo(seg(lt, 0.45, 1.0));
      beadPath(opDots, 1, 6 * (1 - kp), (i) => 0.4 + 0.6 * Math.abs(Math.sin(t * 2.6 + i * 0.45)));
      const K = kImg(), pts = samplePts('cKing', K, 13, FIG_OX, FIG_OY);
      blit(K, FIG_OX, FIG_OY, OPX, OPF, KS, kp);
      leaves(lt, pts, OPX, OPF, KS, -0.05, 0.6, 14, 0.42, 7);
      ctx.save(); ctx.globalAlpha = 1 - seg(lt, 0.9, 1.3); leaves(99, pts, OPX, OPF, KS, 0, 0, 14); ctx.restore();
      frame(lt, 1);
      plaque('SOME SAY', 540, 1172, lt, 0.05);
    } });
  cue(tSome, 'sparkle', { gain: 0.3 }); cue(tSome + 0.05, 'pop', { gain: 0.35 }); cue(tKing11, 'swell', { gain: 0.2 });

  // c8 ─ the record is silent: empty box under the lens; UNPROVEN slams
  add({ id: 'c8', at: tThe, cam: [580, 720], zoom: 0.07, note: 'a case note with an empty dashed box under the brass lens; the king figure stands faint behind; UNPROVEN plaque slams down',
    draw(lt, d, t) {
      bg(GRN2);
      blit(kImg(), FIG_OX, FIG_OY, 250, 1180, 1.6, 0.28);
      const sx = 620, sy = 700, s = 0.95; sheet(sx, sy, s, true);
      const bx = sx + (SW / 2 - SW / 2) * s, byy = sy + (355 - SHh / 2) * s, lx = bx + Math.sin(lt * 1.7) * 60, ly = byy + Math.cos(lt * 1.3) * 14;
      lens(lx, ly, () => { ctx.fillStyle = PAPER; ctx.fillRect(lx - LR, ly - LR, LR * 2, LR * 2); sheet(lx + (sx - lx) * 1.8, ly + (sy - ly) * 1.8, s * 1.8, true); });
      const sl = tProve - tThe, p = clamp((lt - sl) / 0.18), shake = lt > sl + 0.18 && lt < sl + 0.4 ? Math.sin(lt * 90) * 8 * (1 - (lt - sl - 0.18) / 0.22) : 0;
      frame(lt, 1);
      if (p > 0) { const img = plaqueImg('UNPROVEN', 54); ctx.save(); ctx.translate(560 + shake, 1040); ctx.rotate(-0.05); blit(img, img.width / img._q / 2, img.height / img._q / 2, 0, 0, lerp(2.3, 1.15, eo(p)), Math.min(1, p * 2)); ctx.restore(); }
    } });
  cue(tThe, 'whoosh', { gain: 0.2 }); cue(tProve + 0.15, 'slam', { gain: 0.5 });

  // c9 ─ doors open on the coast; Manora's tiers stack up; light at the top
  const tierT0 = 0.45, tierDt = (tManora - t12 + 0.05 - tierT0) / 10;
  add({ id: 'c9', at: t12, cam: [540, 700], zoom: 0.08, note: 'doors open on the coast (red sky, gold sun, beaded waves); Manora\'s hexagonal tiers drop into place one by one; light at the top',
    draw(lt, d, t) {
      ctx.drawImage(coastImg(), 0, 0); waves(t, 830, 990);
      tower(540, 1060, 1, Math.max(0, (lt - tierT0) / tierDt), eo(seg(lt, tManora - t12 + 0.1, tManora - t12 + 0.6)), t);
      doors(seg(lt, 0, 0.5));
      frame(lt, 2);
      plaque('MANORA', 540, 1180, lt, tManora - t12 + 0.05);
    } });
  cue(t12, 'whoosh', { gain: 0.35 }); cue(t12 + 0.2, 'bubbles', { gain: 0.15 });
  for (let k = 0; k < 10; k += 2) cue(t12 + tierT0 + k * tierDt + 0.15, 'plop', { gain: 0.2 });
  cue(tManora + 0.15, 'bell', { gain: 0.35 });

  // c10 ─ British victory over Napoleon: red-coats, flag, beaded laurel; the bicorne falls into the sea
  const wreath = (() => { const P = []; for (let i = 0; i <= 30; i++) { const a = Math.PI * 0.62 + (i / 30) * Math.PI * 1.76; P.push([300 + Math.cos(a) * 110, 520 + Math.sin(a) * 110]); } return P; })();
  add({ id: 'c10', at: tTo, cam: [500, 760], zoom: 0.09, note: 'red-coat figures and a red flag on the shore, Manora small behind; a laurel wreath beads in on "victory"; a lone bicorne hat tumbles into the sea and sinks',
    draw(lt, d, t) {
      ctx.drawImage(coastImg(), 0, 0); waves(t, 830, 990);
      tower(840, 1010, 0.58, 10, 1, t);
      const RC = redcoatImg(); [[190, 1170], [290, 1185], [390, 1170]].forEach(([x, y], i) => blit(RC, 70, 320, x, y + Math.sin(t * 3 + i) * 2, 1, 1));
      flag(470, 760, 1190, t, 1);
      const wv = seg(lt, tVict - tTo - 0.1, tVict - tTo + 0.6); beadPath(wreath, wv, 6);
      wreath.forEach(([x, y], i) => { if (i % 2 || i / 30 > wv) return; const a = Math.atan2(y - 520, x - 300); ctx.save(); ctx.translate(x, y); ctx.rotate(a + 0.6); ell(0, -16, 8, 18, GRN2); ctx.restore(); });
      if (wv > 0.95) gem(300, 520 + 110, 12, RUBY);
      const hn = tNap - tTo, hp = seg(lt, hn, hn + 0.85);
      if (lt > hn - 0.2) {
        const hy = hp < 1 ? lerp(300, 905, hp * hp) : 905 + (lt - hn - 0.85) * 30, ha = hp < 1 ? 1 : clamp(1 - (lt - hn - 0.85) / 0.6);
        ctx.save(); ctx.globalAlpha = Math.min(1, (lt - hn + 0.2) * 4) * ha; bicorne(640 + Math.sin(hp * 7) * 40, hy, 0.9, Math.sin(hp * 9) * 0.6 + hp * 2.4); ctx.restore();
        if (hp >= 1) for (let k = 0; k < 6; k++) { const bt = (lt - hn - 0.85 - k * 0.12); if (bt < 0) continue; ctx.strokeStyle = `rgba(255,240,176,${clamp(1 - bt / 0.8)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(640 + (rnd(k) - 0.5) * 60, 905 - bt * 160, 6 + rnd(k * 3) * 8, 0, TAU); ctx.stroke(); }
      }
      frame(lt, 0, { sheen: seg(lt, tVict - tTo, tVict - tTo + 0.9) });
    } });
  cue(tVict, 'drum', { gain: 0.4 }); cue(tNap + 0.1, 'whoosh', { gain: 0.25 }); cue(tNap + 0.85, 'bubbles', { gain: 0.3 });

  // c11 ─ the king and a brass lamp; 1832; tarnish begins
  add({ id: 'c11', at: t13, cam: [540, 760], zoom: 0.08, note: 'a panel swings shut on a hinge: the faceless king beside a tall brass lamp; 1832 plaque; the gilt starts to tarnish',
    draw(lt, d, t) {
      ctx.fillStyle = '#1E0C07'; ctx.fillRect(0, 0, W, PB);
      hinge(eo(seg(lt, 0, 0.45)), () => {
        bg(GRN);
        blit(kImg(), FIG_OX, FIG_OY, 440, 1150, 1.45);
        rr(718, 620, 24, 520, 8); ctx.fillStyle = G; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); rr(670, 1120, 120, 30, 8); ctx.fill(); ctx.stroke();
        for (const y of [760, 900, 1040]) { ell(730, y, 34, 12, G2); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(650, 600); ctx.quadraticCurveTo(730, 670, 810, 600); ctx.closePath(); ctx.fillStyle = G2; ctx.fill(); ctx.stroke();
        const fa = 1 - 0.55 * seg(lt, 0.6, d); for (const [x, s] of [[670, 0.7], [730, 0.9], [790, 0.7]]) flame(x, 600, s, t + x, fa);
      });
      frame(lt, 1);
      plaque('1832', 540, 1180, lt, t1832 - t13, 1.1, 50);
      tarnish(0.4 * eio(seg(lt, 0.7, d)));
    } });
  cue(t13, 'whoosh', { gain: 0.3 }); cue(t1832, 'thud', { gain: 0.45 }); cue(t13 + 0.6, 'swell', { gain: 0.2 });

  // c12 ─ the son on the throne; LAST KING; he dissolves; empty throne; 1855
  const SNX = 540, SNF = 1000, SNS = 0.85;
  add({ id: 'c12', at: tHis, cam: [540, 760], zoom: 0.08, note: 'the son (smaller faceless figure) on the gilt throne; LAST KING; he dissolves into lifting gold leaves; the throne stands empty; 1855',
    draw(lt, d, t) {
      bg(RED2);
      const TB = throneImg(false), TF = throneImg(true);
      blit(TB, 320, 740, 540, 1140, 1);
      const dd = died2 - tHis, fade = 1 - eo(seg(lt, dd, dd + 0.6));
      const S = figImg('Son', SON), pts = samplePts('cSon', S, 14, FIG_OX, FIG_OY);
      if (fade > 0) blit(S, FIG_OX, FIG_OY, SNX, SNF, SNS * (0.94 + 0.06 * eo(clamp(lt / 0.4))), fade);
      if (lt > dd) leavesUp(lt, pts, SNX, SNF, SNS, dd, 0.5, 13, 0.9, 5);
      blit(TF, 320, 740, 540, 1140, 1);
      frame(lt, 0, { gem: -9 });
      plaque('LAST KING', 540, 1185, lt, tLast - tHis, 1, 44, tWithout - tHis - 0.3);
      plaque('1855', 540, 1185, lt, tWithout - tHis, 1.1, 50);
      tarnish(0.3 * seg(lt, dd, d));
    } });
  cue(tLast, 'pop', { gain: 0.35 }); cue(died2, 'sizzle', { gain: 0.15 }); cue(tWithout, 'thud', { gain: 0.45 });

  // c13 ─ the British took the rest: flag climbs over the fort; cracks + tarnish spread
  const CR = () => crackImg('cCrack', 540, 360);
  add({ id: 'c13', at: tBrit, cam: [540, 560], zoom: 0.1, note: 'the fort under an ultramarine sky; a red flag (abstract gold mark) climbs the pole; varnish cracks and tarnish spread across the whole panel',
    draw(lt, d, t) {
      ctx.drawImage(fortImg(), 0, 0);
      const fp = eo(seg(lt, 0, 0.7)); flag(540, 300, 620, t, 1, lerp(560, 300, fp));
      frame(lt, 2);
      const cp = eio(seg(lt, tTook - tBrit, d)); cracks(CR(), 540, 360, cp); tarnish(0.85 * cp);
    } });
  cue(tBrit, 'zip', { gain: 0.25 }); cue(tBrit + 0.7, 'slam', { gain: 0.3 }); cue(tTook, 'rumble', { gain: 0.45 });

  // c14 ─ lost kingdom (tarnished) → a fresh gilt library panel swings over it; leaves settle on the shelves
  const LIBPTS = []; SHELVES.forEach((sy, si) => { for (let x = 150; x < 940; x += 34) LIBPTS.push([x + (rnd(x + si) - 0.5) * 14, sy - 30 - rnd(x * 3 + si) * 110]); });
  LIBPTS.sort((a, b) => a[0] - b[0] + (rnd(a[1]) - 0.5) * 200);
  const hs = tSaved - t14 - 0.3;
  add({ id: 'c14', at: t14, cam: [540, 760], zoom: 0.08, note: 'the tarnished, cracked fort with the king small in front (the lost kingdom); a bright gilt library panel swings shut over it; gold leaves settle along the shelves; sheen',
    draw(lt, d, t) {
      ctx.drawImage(fortImg(), 0, 0); flag(540, 300, 620, t, 1, 300);
      blit(kImg(), FIG_OX, FIG_OY, 540, 1200, 0.72);
      const hp = eo(seg(lt, hs, hs + 0.5));
      cracks(CR(), 540, 360, 1, 1); tarnish(0.85);
      hinge(hp, () => { ctx.drawImage(libImg(), 0, 0); blit(kImg(), FIG_OX, FIG_OY, 540, 1236, 0.8); });
      if (hp >= 1) leaves(lt, LIBPTS, 0, 0, 1, hs + 0.45, 1.0, 16, 0.5, 11);
      frame(lt, 1, { sheen: seg(lt, hs + 0.9, d) });
      // the gilt outside the swinging library panel stays tarnished until it closes
      if (hp < 1) { ctx.save(); ctx.beginPath(); ctx.rect(OX0 - 20 + (OX1 - OX0 + 40) * hp, 0, W, PB); ctx.rect(0, 0, OX0 - 20, PB); ctx.clip(); tarnish(0.85); ctx.restore(); }
    } });
  cue(t14, 'rumble', { gain: 0.2 }); cue(t14 + hs, 'whoosh', { gain: 0.35 }); cue(t14 + hs + 0.5, 'thud', { gain: 0.3 }); cue(t14 + hs + 0.6, 'sparkle', { gain: 0.35 }); cue(t14 + hs + 0.9, 'swell', { gain: 0.25 });

  // c15 ─ end card
  add({ id: 'c15', at: tFollow, cam: [540, 700], zoom: 0.05, note: 'end card: doors open on an ultramarine panel; beaded lamp-and-book medallion with gems; tagline; AAZHI laid in gold leaf with sheen; FOLLOW plaque',
    draw(lt, d, t) {
      bg(BLU);
      // medallion
      const mp = eob(clamp((lt - 0.15) / 0.4)); blit(medalImg(), 180, 180, 540, 455, 0.78 * mp, clamp(lt / 0.2));
      flame(540, 440, 0.9, t, clamp((lt - 0.4) / 0.3));
      beadPath(ringPts(540, 455, 132, 44), seg(lt, 0.3, 1.2), 5);
      ringPts(540, 455, 132, 8).forEach(([x, y], i) => gemPop(lt - 0.9 - i * 0.08, x, y, 9, GEMC[i % 3]));
      // tagline
      ctx.save(); ctx.globalAlpha = eo(seg(lt, 0.1, 0.6)); ctx.font = '700 44px Caladea'; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const [s, y] of [['A KING WHO LOST A KINGDOM', 650], ['AND SAVED A LIBRARY', 708]]) { ctx.fillStyle = INK; ctx.fillText(s, 542, y + 3); ctx.fillStyle = IV; ctx.fillText(s, 540, y); }
      ctx.restore(); ctx.letterSpacing = '0px';
      for (const p of resample([[300, 750], [780, 750]], 20)) circle(p[0], p[1], 3, G2);
      // AAZHI in gold leaf
      const gt = goldText('AAZHI', 210, 10), gh = ghostText('AAZHI', 210, 10), oy = 210 * 0.75, pts = samplePts('cAazhi', gt, 18, W / 2, oy), ay = 900;
      blit(gh, W / 2, oy, 540, ay, 1, 1 - seg(lt, 1.0, 1.4));
      leaves(lt, pts, 540, ay, 1, 0.1, 0.7, 22, 0.45, 9);
      const sw = (lt - 1.5) % 1.6; sheenBlit(gt, W / 2, oy, 540, ay, 1, lt > 1.5 ? sw / 1.1 : -1, eo(seg(lt, 0.9, 1.3)));
      // FOLLOW
      const pulse = lt > 1.4 ? 1 + 0.04 * Math.sin((lt - 1.4) * 6) : 1;
      plaque('FOLLOW', 540, 1105, lt, tAazhi - tFollow + 0.25, 1.15 * pulse, 48);
      doors(seg(lt, 0, 0.45));
      frame(lt, 2, { gem: 0.6, sheen: seg(lt, 1.8, 2.9) });
    } });
  cue(tFollow, 'whoosh', { gain: 0.3 }); cue(tFollow + 0.1, 'swell', { gain: 0.3 }); cue(tAazhi + 0.6, 'bell', { gain: 0.4 }); cue(tAazhi + 0.25, 'pop', { gain: 0.35 }); cue(tFollow + 1.0, 'sparkle', { gain: 0.3 });
}
