// v26 shared kit: "Kolam Threshold" (rice-powder line drawing on a dark red-oxide floor at night). Read fully before writing shots.
// Every scene is drawn in WHITE RICE POWDER (kolam) on a polished dark red-oxide threshold floor lit by one low lamp from the side.
// Devices: a DOT GRID (pulli) pops in dot by dot (dots); powder LINES draw themselves with grain (stroke / loop / rect);
// coloured powder FILLS bloom from a point (bloom); a GUST blows powder grains across and half-erases a drawing (gust);
// a FOOTSTEP SMUDGE wipes part of a drawing (smudge); powder POURS in a falling stream (pour); the floor CRACKS (crack);
// LOOPS close around a dot or a figure = captivity (cage), and break open = release (cage o.open).
// RECURRING MOTIF ("watch the dots"): one YELLOW dot (the emperor) trapped inside a RED closed loop (the Kadava chief).
// Colour code: Chola / Rajaraja III = TURMERIC YELLOW; Kadava / Kopperunchinga = KUMKUM RED; Hoysala = TEAL-GREEN powder.
// No faces, no portraits, no real writing or inscription text (labels are our own short tags), no religious symbols or deities,
// no gore (violence = smudges, gusts, cracks, red flashes). Figures are faceless powder outlines.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, line } from './core/lib.js';
import { cached, rgba, mixc } from './art.js';

export const PAL = {
  floor: '#3A1D15', floorHi: '#5A2E20', floorDk: '#160A07', black: '#080403',
  powder: '#F3ECDD', powderDk: '#CFC5B2', yellow: '#E9B22F', yellowHi: '#FFD764', red: '#C8342A', redHi: '#F05A45',
  teal: '#2E9A8E', tealHi: '#5FD0C0', lamp: '#FFB24A', white: '#FFFFFF', ash: '#8C7F70',
};
const SERIF = 'Caladea, Georgia, serif', SANS = 'Inter, Arial, sans-serif';

// ---------- small helpers ----------
export const pop = (lt, t0, d = 0.3) => eob(clamp((lt - t0) / d));
export function shk(lt, t0, amp, dur = 0.5) { const k = 1 - seg(lt, t0, t0 + dur); if (lt < t0 || k <= 0) return [0, 0]; const a = amp * k * k; return [Math.sin(lt * 93) * a, Math.cos(lt * 71) * a]; }
export function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
/** first fraction p of a polyline (by length) */
export function part(pts, p) {
  let tot = 0; const Ls = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); Ls.push(d); tot += d; }
  let left = tot * clamp(p); const out = [pts[0]];
  for (let i = 1; i < pts.length && left > 0; i++) { const d = Ls[i - 1]; if (d <= left) { out.push(pts[i]); left -= d; } else { const u = left / d; out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); left = 0; } }
  return out;
}

// ---------- the floor ----------
function floorImg(tone) {
  return cached('k_floor_' + tone, W, H, 0.5, () => {
    const base = tone === 'night' ? '#1E1014' : tone === 'ash' ? '#2B2421' : PAL.floor;
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
    // polished oxide mottling + faint tile seams
    for (let i = 0; i < 60; i++) { const x = rnd(i) * W, y = rnd(i + 31) * H, r = 60 + rnd(i + 7) * 220; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(rnd(i + 3) > 0.5 ? PAL.floorHi : PAL.floorDk, 0.16)); g.addColorStop(1, rgba(PAL.floorDk, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(255,230,200,${0.015 + rnd(i * 3) * 0.03})`; ctx.fillRect(rnd(i * 5) * W, rnd(i * 7) * H, 2, 2); }
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let y = 160; y < H; y += 360) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  });
}
/** dark red-oxide floor + a low side lamp pool that breathes. o.tone 'oxide' | 'night' | 'ash'; o.lamp 0..1; o.lx, o.ly lamp pool centre */
export function floor(t, o = {}) {
  ctx.drawImage(floorImg(o.tone || 'oxide'), 0, 0, W, H);
  const fl = 0.85 + 0.15 * Math.sin(t * 7.3) * Math.sin(t * 3.1), lx = o.lx ?? 860, ly = o.ly ?? 640;
  glow(lx, ly, 1100, PAL.lamp, (o.lamp ?? 0.22) * fl);
  const v = ctx.createRadialGradient(540, 860, 300, 540, 900, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.72)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
/** floating powder dust motes in the lamp light */
export function motes(t, n = 40, seed = 0, a = 0.5) {
  for (let i = 0; i < n; i++) { const sp = 8 + rnd(i + seed) * 20, x = (rnd(i * 3 + seed) * (W + 200) + t * sp) % (W + 200) - 100, y = (rnd(i * 7 + seed) * H - t * 10 * rnd(i + 4) + H * 4) % H;
    ctx.fillStyle = rgba(PAL.powder, a * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 1.7 + i)))); ctx.fillRect(x, y, 3, 3); }
}

// ---------- powder marks ----------
/** grainy powder line along pts, drawn to fraction p. o.col, o.w, o.seed, o.a */
export function stroke(pts, p = 1, o = {}) {
  if (p <= 0.005 || pts.length < 2) return; const q = part(pts, p); if (q.length < 2) return;
  const col = o.col || PAL.powder, w = o.w ?? 10, a = o.a ?? 1, sd = o.seed ?? 1;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
  line(q, rgba(col, 0.55), w * 1.5); ctx.shadowColor = 'transparent'; line(q, col, w * 0.8);
  // grains scattered along the drawn part
  ctx.fillStyle = col;
  for (let i = 1; i < q.length; i++) { const [x0, y0] = q[i - 1], [x1, y1] = q[i], d = Math.hypot(x1 - x0, y1 - y0), n = Math.min(40, d / 6 | 0);
    for (let k = 0; k < n; k++) { const u = k / n, j = rnd(i * 97 + k * 13 + sd); ctx.globalAlpha = a * (0.3 + 0.6 * j);
      ctx.fillRect(lerp(x0, x1, u) + (j - 0.5) * w * 2.2, lerp(y0, y1, u) + (rnd(i * 31 + k * 7 + sd) - 0.5) * w * 2.2, 2.5, 2.5); } }
  ctx.restore();
  if (o.tip && p < 1) { const e = q[q.length - 1]; glow(e[0], e[1], w * 4, col, 0.5); }
}
/** one powder dot */
export function dot(x, y, r = 9, col = PAL.powder, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = rgba(PAL.white, 0.35); ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, TAU); ctx.fill(); ctx.restore();
}
/** pulli dot grid centred at (cx, cy): dots pop in one by one with p (0..1). o.col(i,j) optional colour fn, o.r */
export function dots(cx, cy, cols, rows, gap, p = 1, o = {}) {
  const n = cols * rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = j * cols + i, s = Math.max(0, eob(clamp((p * (n + 2) - k) / 2))); if (s <= 0) continue;
    dot(cx + (i - (cols - 1) / 2) * gap, cy + (j - (rows - 1) / 2) * gap, (o.r ?? 9) * s, o.col ? o.col(i, j) : PAL.powder);
  }
}
/** points of a flower loop (kolam petal curve) around (cx, cy): radius r, k petals, depth d */
export function loopPts(cx, cy, r, k = 6, d = 0.28, n = 220, rot = 0) {
  const pts = []; for (let i = 0; i <= n; i++) { const a = i / n * TAU + rot, rr = r * (1 + d * Math.cos(k * (a - rot))); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return pts;
}
/** rounded-rectangle powder outline as points (for walls / cells) */
export function rectPts(x, y, w, h, r = 30) {
  const pts = [], arc = (cx, cy, a0) => { for (let i = 0; i <= 8; i++) { const a = a0 + i / 8 * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI); pts.push(pts[0]); return pts;
}
/** CAPTIVITY LOOP: a closed petal loop drawn around (cx, cy). p draws it; o.open 0..1 breaks it apart (gap opens, halves slide away) */
export function cage(cx, cy, r, p = 1, o = {}) {
  const col = o.col || PAL.red, op = clamp(o.open ?? 0), pts = loopPts(cx, cy, r, o.k ?? 8, o.d ?? 0.12, 240, o.rot ?? 0);
  if (op <= 0) { stroke(pts, p, { col, w: o.w ?? 12, seed: 5, tip: true }); return; }
  const cut = Math.floor(pts.length / 2), A = pts.slice(0, cut + 1), B = pts.slice(cut);
  const dx = op * (o.spread ?? 160), sh = (q, sx) => q.map(([x, y]) => [x + sx, y + Math.sin(op * 3) * 8]);
  ctx.save(); ctx.globalAlpha *= 1 - op * 0.5; stroke(sh(A.slice(Math.floor(op * 30)), dx), 1, { col, w: o.w ?? 12, seed: 6 }); stroke(sh(B.slice(0, B.length - Math.floor(op * 30)), -dx), 1, { col, w: o.w ?? 12, seed: 7 }); ctx.restore();
}
/** coloured powder fill that blooms from (x, y) inside a path (pts closed) to fraction p */
export function bloom(pts, x, y, rMax, p, col, a = 0.85) {
  if (p <= 0) return; ctx.save(); ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.clip();
  const r = rMax * eo(clamp(p)); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba(PAL.white, 0.12); for (let i = 0; i < 160; i++) { const aa = rnd(i) * TAU, d = Math.sqrt(rnd(i + 9)) * r; ctx.fillRect(x + Math.cos(aa) * d, y + Math.sin(aa) * d, 3, 3); }
  ctx.restore();
}
/** GUST: powder grains blown across the screen from left to right (dir 1) at progress p; also call with a drawing to erase */
export function gust(p, o = {}) {
  if (p <= 0 || p >= 1) return; const y0 = o.y ?? 400, y1 = o.y1 ?? 1400, dir = o.dir ?? 1, n = o.n ?? 260, col = o.col || PAL.powder;
  for (let i = 0; i < n; i++) { const yy = lerp(y0, y1, rnd(i + 3)), sp = 0.7 + rnd(i) * 0.6, x = (-200 + (W + 400) * clamp(p * sp * 1.3 - rnd(i + 8) * 0.3));
    const xx = dir > 0 ? x : W - x, ln = 8 + rnd(i + 5) * 40; ctx.fillStyle = rgba(col, 0.25 + 0.6 * rnd(i + 2)); ctx.fillRect(xx - ln * dir, yy + Math.sin(p * 9 + i) * 12, ln, 2.5); }
}
/** footstep / palm SMUDGE: a dark floor-coloured wipe that erases what is beneath, growing with p */
export function smudge(x, y, r, p, rot = -0.4) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const k = eo(clamp(p));
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * k); g.addColorStop(0, rgba(PAL.floor, 0.98)); g.addColorStop(0.7, rgba(PAL.floor, 0.85)); g.addColorStop(1, rgba(PAL.floor, 0));
  ctx.fillStyle = g; ctx.scale(1.6, 0.7); ctx.beginPath(); ctx.arc(0, 0, r * k, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba(PAL.powder, 0.25); for (let i = 0; i < 50; i++) ctx.fillRect((rnd(i) - 0.5) * r * 2 * k, (rnd(i + 4) - 0.5) * r * k, 6 + rnd(i + 2) * 20, 2);
  ctx.restore();
}
/** a falling stream of powder from above into (x, y); lt drives the grains */
export function pour(x, y, lt, a = 1, col = PAL.powder) {
  ctx.save(); ctx.globalAlpha *= a; for (let i = 0; i < 70; i++) { const ph = (lt * 1.6 + rnd(i)) % 1, yy = lerp(y - 520, y, ph), xx = x + (rnd(i + 3) - 0.5) * 14 * (1 + ph);
    ctx.fillStyle = rgba(col, 0.5 + 0.5 * rnd(i + 6)); ctx.fillRect(xx, yy, 3, 6); } glow(x, y, 60, col, 0.35); ctx.restore();
}
/** CRACK: a jagged crack in the floor from (x, y) at angle ang, growing with p */
export function crack(x, y, len, ang, p, seed = 1) {
  if (p <= 0) return; const pts = [[x, y]]; let cx = x, cy = y;
  for (let i = 1; i <= 14; i++) { const a = ang + (rnd(i * 7 + seed) - 0.5) * 0.9; cx += Math.cos(a) * len / 14; cy += Math.sin(a) * len / 14; pts.push([cx, cy]); }
  const q = part(pts, p); line(q, PAL.black, 9); line(q.map(([a, b]) => [a + 3, b + 3]), rgba(PAL.lamp, 0.25), 2);
  if (p > 0.4) { const b = part(pts.slice(5), (p - 0.4) / 0.6).map(([a, bb], i) => [a + i * 6, bb - i * 9]); line(b, PAL.black, 5); }
}

// ---------- figures and set pieces (all powder outlines, faceless) ----------
/** faceless standing figure in powder outline at feet (x, y), height ~ 300 * s. o.col fill colour, o.hat 'crown' | 'helm' | 'veil' | 'turban', o.p draw progress, o.spear */
export function figure(x, y, s = 1, o = {}) {
  const p = o.p ?? 1, col = o.col || PAL.yellow, w = 9 * Math.max(0.6, s);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = [[-62, 0], [-48, -170], [-30, -200], [30, -200], [48, -170], [62, 0], [-62, 0]];
  bloom(body, 0, -100, 220, clamp(p * 2 - 0.6), col, 0.75);
  stroke(body, clamp(p * 1.6), { w, seed: 11 });
  const head = loopPts(0, -240, 34, 1, 0, 40); bloom(head, 0, -240, 60, clamp(p * 2 - 0.8), col, 0.6); stroke(head, clamp(p * 2 - 0.4), { w, seed: 12 });
  if (o.hat === 'crown') stroke([[-30, -268], [-24, -300], [-10, -280], [0, -310], [10, -280], [24, -300], [30, -268]], clamp(p * 2 - 1), { col: PAL.yellowHi, w, seed: 13 });
  if (o.hat === 'helm') stroke([[-38, -250], [-34, -285], [0, -300], [34, -285], [38, -250]], clamp(p * 2 - 1), { col: PAL.powder, w, seed: 14 });
  if (o.hat === 'veil') stroke([[0, -282], [-46, -250], [-60, -150]], clamp(p * 2 - 1), { col: PAL.powder, w, seed: 15 });
  if (o.hat === 'turban') stroke(loopPts(0, -270, 38, 5, 0.12, 60), clamp(p * 2 - 1), { col: PAL.powder, w, seed: 16 });
  if (o.spear) stroke([[80, 10], [80, -330], [70, -305], [90, -305], [80, -330]], clamp(p * 2 - 1), { col: PAL.powder, w: w * 0.8, seed: 17 });
  ctx.restore();
}
/** fort / walled capital outline: wall with towers and a gate, base centre (x, y), width ~ 700 * s, draw progress p; o.col fill */
export function fort(x, y, s = 1, p = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wall = [[-350, 0], [-350, -260], [-300, -260], [-300, -300], [-240, -300], [-240, -260], [-120, -260], [-120, -330], [-60, -330], [-60, -260],
    [60, -260], [60, -330], [120, -330], [120, -260], [240, -260], [240, -300], [300, -300], [300, -260], [350, -260], [350, 0], [-350, 0]];
  if (o.col) bloom(wall, 0, -150, 520, clamp(p * 1.5 - 0.5), o.col, 0.55);
  stroke(wall, clamp(p * 1.3), { w: 11, seed: 21 });
  stroke([[-60, 0], [-60, -130], [0, -175], [60, -130], [60, 0]], clamp(p * 2 - 1), { w: 10, seed: 22, col: o.gate || PAL.powder });
  for (let i = 0; i < 6; i++) dots(-280 + i * 112, -200, 1, 1, 0, clamp(p * 2 - 1 - i * 0.05), { r: 8 });
  ctx.restore();
}
/** an army: rows of small dot-soldiers with spear strokes, marching by offset mx; col */
export function army(x, y, cols, rows, gap, p = 1, col = PAL.teal, mx = 0, seed = 0) {
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = (i + j * cols) / (cols * rows), q = eob(clamp((p - k * 0.6) / 0.3)); if (q <= 0) continue;
    const bob = Math.sin(mx * 0.05 + i * 1.3 + j) * 6, xx = x + i * gap + mx + (j % 2) * gap * 0.5, yy = y + j * gap * 0.8 + bob;
    dot(xx, yy, 12 * q, col); stroke([[xx + 16, yy + 10], [xx + 16, yy - 46 * q]], 1, { w: 4, col: PAL.powder, seed: seed + i * 7 + j });
  }
}
/** an arrowed powder route (an army's march) along pts to p */
export function route(pts, p, col = PAL.teal, w = 10) {
  if (p <= 0.02) return; const q = part(pts, p); if (q.length < 2) return; ctx.save(); ctx.setLineDash([26, 20]); stroke(q, 1, { col, w, seed: 31 }); ctx.restore();
  const a = q[q.length - 1], b = q[q.length - 2], ang = Math.atan2(a[1] - b[1], a[0] - b[0]), k = w * 3.4;
  stroke([[a[0] + Math.cos(ang + 2.5) * k, a[1] + Math.sin(ang + 2.5) * k], [a[0] + Math.cos(ang) * k * 0.6, a[1] + Math.sin(ang) * k * 0.6], [a[0] + Math.cos(ang - 2.5) * k, a[1] + Math.sin(ang - 2.5) * k]], 1, { col, w, seed: 32 });
}
/** a powder crown symbol (the Chola throne), centre (x, y) */
export function crown(x, y, s = 1, p = 1, col = PAL.yellow) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const c = [[-110, 50], [-130, -60], [-60, -10], [0, -90], [60, -10], [130, -60], [110, 50], [-110, 50]];
  bloom(c, 0, 0, 200, clamp(p * 1.6 - 0.5), col, 0.8); stroke(c, clamp(p * 1.4), { w: 10, seed: 41 }); for (const xx of [-130, 0, 130]) dot(xx, xx ? -72 : -102, 12 * clamp(p * 2 - 1), PAL.powder);
  ctx.restore();
}

// ---------- type ----------
/** big title in powder lettering (our own words only), letters fade in with p; o.col, o.size, o.font 'serif' | 'sans' */
export function title(text, x, y, p = 1, o = {}) {
  if (p <= 0) return; const size = o.size ?? 120;
  ctx.save(); ctx.font = `${o.font === 'sans' ? '900' : '700'} ${size}px ${o.font === 'sans' ? SANS : SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = (o.ls ?? 6) + 'px';
  const q = eo(clamp(p)); ctx.globalAlpha *= q; ctx.translate(x, y); const s = 1 + 0.25 * (1 - eob(clamp(p))); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; ctx.fillStyle = o.col || PAL.powder; ctx.fillText(text, 0, 0);
  ctx.shadowColor = 'transparent'; ctx.globalAlpha *= 0.35; ctx.fillStyle = PAL.white; for (let i = 0; i < 80; i++) ctx.fillRect((rnd(i) - 0.5) * size * text.length * 0.55, (rnd(i + 3) - 0.5) * size * 0.7, 3, 3);
  ctx.restore();
}
/** small label tag: powder-bordered dark tile with text, e.g. ILLUSTRATION, RECORDS SAY, DISPUTED, INSCRIPTIONS SAY, ONE VIEW, ANOTHER VIEW */
export function tag(text, x, y, p = 1, col = PAL.powder) {
  if (p <= 0) return; ctx.save(); ctx.font = `900 40px ${SANS}`; ctx.letterSpacing = '5px'; const w = ctx.measureText(text).width + 60, h = 74, q = eob(clamp(p));
  ctx.translate(x, y); ctx.scale(q, q); ctx.fillStyle = 'rgba(8,4,3,0.82)'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 14); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.setLineDash([12, 8]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3); ctx.restore();
}
/** full-screen flash (a hit): col, alpha */
export function flash(a, col = PAL.white) { if (a <= 0) return; ctx.fillStyle = rgba(col, clamp(a)); ctx.fillRect(-300, -300, W + 600, H + 600); }
