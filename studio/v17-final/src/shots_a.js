// EPISODE 17 · worker A : "Hammered Copper & Ink Erasure", lines 0-3 (t 0 -> L(4)). THE HOOK.
// Ink pours over a red-hot copper plate · plates on the ring blotted one by one · hammer stamps WHO ERASED THEM? ·
// blank centuries ruler (red-hot marker, 250-550 blotted) · three emblem medallions punched in, then cracked + inked ·
// the Kalabhras rise out of the ink · half-dissolved king · origin arrows erased · carousel of plates · the enemy's pen.
// Engine: plates, ring, seal, map, medallions, ruler, king, hammer and pen are baked once by cached(); per frame only
// blits, clips, a few ink blobs, sparks and dots. No shadowBlur anywhere.
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, smoke, dust } from './art.js';
import * as K from './core/kit.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const INK = '#050505', GLOSS = '#2A2A30', SLATE = '#0B0B0D', RIM = '#4A6A8A', WHITE = '#EDEFF2', HOT = '#FF4A1A';
const CU1 = '#E08A4E', CU2 = '#B4552A', CU3 = '#6E2E14', SPEC = '#FFD2A6';

// ───────────── shared copper plate helper (copied exactly from ART.md) ─────────────
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

// ───────────── cached set pieces ─────────────
const bgImg = () => cached('aBg', W + 600, H + 600, 0.5, () => {
  ctx.translate(300, 300);
  ctx.fillStyle = SLATE; ctx.fillRect(-300, -300, W + 600, H + 600);
  let g = ctx.createRadialGradient(W + 60, 120, 0, W + 60, 120, 1100); g.addColorStop(0, 'rgba(74,106,138,0.34)'); g.addColorStop(1, 'rgba(74,106,138,0)');
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  g = ctx.createRadialGradient(-80, 1100, 0, -80, 1100, 800); g.addColorStop(0, 'rgba(74,106,138,0.16)'); g.addColorStop(1, 'rgba(74,106,138,0)');
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  for (let i = 0; i < 420; i++) { const x = rnd(i) * (W + 400) - 200, y = rnd(i + 77) * (H + 400) - 200, r = 6 + rnd(i + 5) * 18;
    ctx.fillStyle = `rgba(120,150,190,${0.025 + rnd(i + 9) * 0.03})`; ctx.beginPath(); ctx.arc(x - 2, y - 2, r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.arc(x + 2, y + 2, r * 0.9, 0, TAU); ctx.fill(); }
});
function bg(t, seed = 0) { blit(bgImg(), 300, 300, 0, 0); dust(t, 26, seed, '140,170,205', 0.28); }

const plateImg = (w, h, rows, seed, patina) => cached(`aP_${w}_${h}_${rows}_${seed}_${patina}`, w + 8, h + 8, 1, () => copperPlate((w + 8) / 2, (h + 8) / 2, w, h, 0, rows, seed, patina));
/** blit a cached plate; o: rows, seed, patina, sheen (0..1 position of the specular streak), hot (red-hot rim), dark (depth shade), a */
function drawPlate(x, y, w, h, rot = 0, o = {}) {
  const c = plateImg(w, h, o.rows ?? 6, o.seed ?? 1, o.patina ?? 0);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); if (o.sx != null) ctx.scale(o.sx, 1); ctx.globalAlpha *= o.a ?? 1;
  ctx.drawImage(c, -(w + 8) / 2, -(h + 8) / 2, w + 8, h + 8);
  if (o.hot > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.08);
    ctx.strokeStyle = `rgba(255,74,26,${0.8 * o.hot})`; ctx.lineWidth = 14; ctx.stroke(); ctx.strokeStyle = `rgba(255,224,160,${0.7 * o.hot})`; ctx.lineWidth = 3; ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; }
  if (o.sheen != null || o.dark > 0) {
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.08); ctx.clip();
    if (o.sheen != null) { const sx = lerp(-w * 0.75, w * 0.75, o.sheen), g = ctx.createLinearGradient(sx - h * 0.45, -h / 2, sx + h * 0.45, h / 2);
      g.addColorStop(0, 'rgba(255,210,166,0)'); g.addColorStop(0.5, 'rgba(255,210,166,0.42)'); g.addColorStop(1, 'rgba(255,210,166,0)');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.globalCompositeOperation = 'source-over'; }
    if (o.dark > 0) { ctx.fillStyle = `rgba(5,5,5,${o.dark})`; ctx.fillRect(-w / 2, -h / 2, w, h); }
  }
  ctx.restore();
}
/** ink flooding a plate from its top edge (level 0..1); leaves the faint embossed ghost outline */
function plateInk(x, y, w, h, rot, level, t, seed = 0, sx = 1) {
  if (level <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, 1);
  ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, h * 0.08); ctx.clip();
  inkPour(-w / 2 - 20, w / 2 + 20, -h / 2 + level * h * 1.25, t, seed, 0.5, h * 0.5);
  ctx.restore();
  if (level > 0.9) { ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.08); ctx.strokeStyle = `rgba(224,138,78,${0.28 * seg(level, 0.9, 1)})`; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
}

// ───────────── ink ─────────────
/** a sheet of ink from y = -top down to a wavy edge at yEdge, with drips below; local coords (wrap in translate/rotate) */
function inkPour(x0, x1, yEdge, t, seed = 0, drip = 1, top = 2400) {
  const E = []; for (let x = x0; x <= x1 + 29; x += 30) { const xx = Math.min(x, x1); E.push([xx, yEdge + sin(xx * 0.013 + t * 3 + seed) * 16 + sin(xx * 0.037 - t * 2.2 + seed * 2) * 8]); }
  ctx.beginPath(); ctx.moveTo(x0, yEdge - top); for (const p of E) ctx.lineTo(p[0], p[1]); ctx.lineTo(x1, yEdge - top); ctx.closePath();
  const n = Math.round((x1 - x0) / 90);
  for (let i = 0; i < n; i++) {
    const dx = lerp(x0 + 30, x1 - 30, rnd(seed * 13 + i)), len = drip * (40 + rnd(seed + i * 3) * 240) * (0.75 + 0.25 * sin(t * 2 + i)), dw = 10 + rnd(i + seed) * 18;
    if (len < 8) continue; ctx.moveTo(dx - dw / 2, yEdge - 30); ctx.lineTo(dx - dw / 2, yEdge + len); ctx.arc(dx, yEdge + len, dw / 2 + 3, PI, 0, true); ctx.lineTo(dx + dw / 2, yEdge - 30); ctx.closePath();
  }
  ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); E.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] - 5) : ctx.moveTo(p[0], p[1] - 5)));
  ctx.strokeStyle = GLOSS; ctx.lineWidth = 4; ctx.stroke();
}
/** a living ink blot (union of moving circles) */
function inkBlot(x, y, r, t, seed = 0, a = 1) {
  if (r <= 1 || a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.moveTo(x + r * 0.62, y); ctx.arc(x, y, r * 0.62, 0, TAU);
  for (let i = 0; i < 7; i++) { const an = i / 7 * TAU + seed, off = r * 0.42 * (0.85 + 0.15 * sin(t * 2.3 + i + seed)), rr = r * (0.38 + 0.2 * rnd(seed * 7 + i)) * (1 + 0.06 * sin(t * 3.1 + i));
    const cx = x + cos(an) * off, cy = y + sin(an) * off; ctx.moveTo(cx + rr, cy); ctx.arc(cx, cy, rr, 0, TAU); }
  for (let i = 0; i < 4; i++) { const an = rnd(seed + i * 5) * TAU, cx = x + cos(an) * r * 1.12, cy = y + sin(an) * r * 1.12, rr = r * 0.07 + 2; ctx.moveTo(cx + rr, cy); ctx.arc(cx, cy, rr, 0, TAU); }
  ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.arc(x - r * 0.1, y - r * 0.1, r * 0.62, PI * 1.05, PI * 1.45); ctx.strokeStyle = GLOSS; ctx.lineWidth = Math.max(2, r * 0.05); ctx.stroke();
  ctx.restore();
}
/** falling ink drops from (x, y0) to yEnd, looping */
function drops(x, y0, yEnd, t, n = 3, seed = 0, r = 10) {
  ctx.fillStyle = INK; ctx.strokeStyle = GLOSS; ctx.lineWidth = 2;
  for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n + rnd(seed + i)) % 1, y = y0 + (yEnd - y0) * ph * ph, xx = x + (rnd(seed + i * 3) - 0.5) * 30;
    ctx.beginPath(); ctx.ellipse(xx, y, r, r * 1.5, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(xx - r * 0.3, y - r * 0.4, r * 0.5, PI, PI * 1.5); ctx.stroke(); }
}
/** orange sparks burst, age in s since the strike */
function sparks(x, y, age, seed = 0, n = 18, power = 1) {
  if (age < 0 || age > 0.6) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const an = -PI / 2 + (rnd(seed * 11 + i) - 0.5) * PI * 1.5, sp = (320 + rnd(seed + i * 7) * 760) * power, a0 = Math.max(0, age - 0.035);
    const px = (k) => x + cos(an) * sp * k, py = (k) => y + sin(an) * sp * k + 1100 * k * k;
    ctx.strokeStyle = i % 2 ? `rgba(255,154,60,${1 - age / 0.6})` : `rgba(255,224,160,${1 - age / 0.6})`; ctx.lineWidth = 2 + rnd(i) * 3;
    ctx.beginPath(); ctx.moveTo(px(a0), py(a0)); ctx.lineTo(px(age), py(age)); ctx.stroke(); }
  if (age < 0.12) K.glow(x, y, 160, '255,154,60', 0.8 * (1 - age / 0.12));
  ctx.restore();
}
/** full-frame red-hot flash */
function flash(a, col = '255,74,26') { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }
/** red-hot glow creeping in at the frame edges */
function heatEdges(a) { if (a <= 0) return; for (const [x, y, r] of [[-60, 380, 620], [W + 60, 380, 620], [540, -160, 640], [-60, 950, 420], [W + 60, 950, 420]]) K.glow(x, y, r, '255,74,26', a); }

// ───────────── labels ─────────────
function tag(text, x, y, size = 60, a = 1, sc = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.08)}px`; const w = ctx.measureText(text).width, bw = w + size * 0.9, bh = size * 1.42;
  ctx.fillStyle = 'rgba(5,5,5,0.9)'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.fillStyle = CU2; ctx.fillRect(-bw / 2, -bh / 2, bw, 3); ctx.fillRect(-bw / 2, bh / 2 - 3, bw, 3);
  ctx.fillStyle = WHITE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, size * 0.04, size * 0.06);
  ctx.restore(); ctx.letterSpacing = '0px';
}
const pop = (lt, t0, d = 0.3) => (lt < t0 ? 0 : eob(clamp((lt - t0) / d)));
/** text stamped into copper: dark recess + light lip */
function stamped(text, x, y, size, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.06)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,210,166,0.75)'; ctx.fillText(text, x + 3, y + 3); ctx.fillStyle = '#2E0F05'; ctx.fillText(text, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────── ring, seal, hammer ─────────────
function fish(x, y, len, dir = 1, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); const l = len / 2;
  ctx.beginPath(); ctx.moveTo(l, 0); ctx.quadraticCurveTo(l * 0.2, -l * 0.5, -l * 0.6, -l * 0.05); ctx.lineTo(-l, -l * 0.38); ctx.lineTo(-l * 0.86, 0); ctx.lineTo(-l, l * 0.38); ctx.lineTo(-l * 0.6, l * 0.05); ctx.quadraticCurveTo(l * 0.2, l * 0.5, l, 0); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.restore();
}
const ringImg = () => cached('aRing', 240, 240, 1, () => {
  ctx.translate(120, 120); ctx.lineWidth = 30; ctx.strokeStyle = (() => { const g = ctx.createLinearGradient(-100, -100, 100, 100); g.addColorStop(0, '#E0B070'); g.addColorStop(0.5, '#9A6430'); g.addColorStop(1, '#4A2A12'); return g; })();
  ctx.beginPath(); ctx.arc(0, 0, 88, 0, TAU); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,230,180,0.7)'; ctx.beginPath(); ctx.arc(0, 0, 92, PI * 1.05, PI * 1.6); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(0, 0, 80, PI * 0.1, PI * 0.7); ctx.stroke();
});
const sealImg = () => cached('aSeal', 200, 200, 1, () => {
  ctx.translate(100, 100); const g = ctx.createLinearGradient(-80, -80, 80, 80); g.addColorStop(0, '#E0B070'); g.addColorStop(0.5, '#A06A34'); g.addColorStop(1, '#4A2A12');
  ctx.beginPath(); ctx.arc(0, 0, 84, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,230,180,0.5)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 66, 0, TAU); ctx.strokeStyle = 'rgba(40,20,6,0.5)'; ctx.lineWidth = 3; ctx.stroke();
  fish(3, 3, 96, 1, 'rgba(40,20,6,0.7)'); fish(0, 0, 96, 1, '#D29A5C'); fish(-2, -2, 96, 1, 'rgba(255,230,180,0.0)');
});
/** ring with the seal hanging under it */
function ringSeal(x, y, t, s = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(sin(t * 1.7) * 0.08); blit(sealImg(), 100, 20, 0, 70 * s, s * 0.8); ctx.restore(); blit(ringImg(), 120, 120, x, y, s); }
// hand + hammer, pivot (wrist) at local (0,0), handle pointing up (-y), head at y ~ -265
const hamImg = () => cached('aHam', 420, 640, 1, () => {
  ctx.translate(210, 340);
  ctx.fillStyle = '#16171C'; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(60, 300); ctx.lineTo(150, 300); ctx.lineTo(44, -10); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = RIM; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(60, 300); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-11, -270, 22, 250, 8); ctx.fillStyle = '#3A2416'; ctx.fill(); ctx.strokeStyle = 'rgba(224,138,78,0.6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-46, -80, 92, 92, 30); ctx.fillStyle = '#1C1D23'; ctx.fill(); ctx.strokeStyle = RIM; ctx.lineWidth = 4; ctx.stroke();
  for (const k of [-24, 0, 24]) { ctx.beginPath(); ctx.moveTo(k + 12, -78); ctx.lineTo(k + 12, -50); ctx.strokeStyle = 'rgba(74,106,138,0.6)'; ctx.lineWidth = 3; ctx.stroke(); }
  const g = ctx.createLinearGradient(0, -310, 0, -230); g.addColorStop(0, '#C89A5A'); g.addColorStop(0.5, '#7A4A22'); g.addColorStop(1, '#3A220E');
  ctx.beginPath(); ctx.roundRect(-90, -310, 180, 72, 12); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = SPEC; ctx.lineWidth = 3; ctx.stroke();
});
function swing(lt, hits) { let a = 0; for (const h of hits) { const d = lt - h; if (d > -0.18 && d < 0) a = Math.max(a, eio(1 + d / 0.18)); else if (d >= 0 && d < 0.26) a = Math.max(a, 1 - eo(d / 0.26)); } return a; }
/** hammer striking point (px,py) from the right; k = 0 raised .. 1 hit */
function hammer(px, py, k, s = 1) {
  ctx.save(); ctx.translate(px + 275 * s, py + 40 * s); ctx.rotate(lerp(-0.35, -PI / 2 + 0.15, k)); blit(hamImg(), 210, 340, 0, 0, s); ctx.restore();
}

// ───────────── map + emblem medallions ─────────────
const COAST_W = [[150, -40], [190, 160], [225, 360], [270, 560], [330, 760], [400, 930], [480, 1060], [545, 1130]];
const COAST_E = [[600, 1080], [660, 960], [705, 820], [740, 690], [800, 540], [860, 360], [905, 170], [940, -40]];
const mapImg = () => cached('aMap', 1080, 1300, 0.75, () => {
  ctx.fillStyle = '#20222A'; ctx.beginPath(); [...COAST_W, ...COAST_E].forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip(); for (let i = 0; i < 260; i++) { const x = 140 + rnd(i + 3) * 820, y = rnd(i + 40) * 1150, r = 8 + rnd(i) * 16; ctx.fillStyle = 'rgba(120,150,190,0.06)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  const lgm = ctx.createLinearGradient(0, 0, 0, 1150); lgm.addColorStop(0, 'rgba(74,106,138,0.12)'); lgm.addColorStop(1, 'rgba(224,138,78,0.06)'); ctx.fillStyle = lgm; ctx.fillRect(0, 0, 1080, 1150);
  ctx.strokeStyle = 'rgba(74,106,138,0.12)'; ctx.lineWidth = 2; for (let y = 100; y < 1150; y += 110) { ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(1000, y); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); [...COAST_W, ...COAST_E].forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.strokeStyle = 'rgba(74,106,138,0.85)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = 'rgba(224,138,78,0.6)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(770, 1185, 62, 96, 0.25, 0, TAU); ctx.fillStyle = '#20222A'; ctx.fill(); ctx.strokeStyle = 'rgba(74,106,138,0.7)'; ctx.lineWidth = 4; ctx.stroke();
});
const MEDS = [
  { k: 'bow', name: 'CHERA', x: 330, y: 640 },
  { k: 'tiger', name: 'CHOLA', x: 740, y: 560 },
  { k: 'fish', name: 'PANDYA', x: 560, y: 930 },
];
function emblem(k, col) {
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (k === 'bow') { ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(40, 0, 84, PI * 0.66, PI * 1.34); ctx.stroke();
    const a0 = PI * 0.66, a1 = PI * 1.34; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40 + cos(a0) * 84, sin(a0) * 84); ctx.lineTo(40 + cos(a1) * 84, sin(a1) * 84); ctx.stroke();
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(70, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(88, 0); ctx.lineTo(62, -15); ctx.lineTo(62, 15); ctx.closePath(); ctx.fill(); }
  if (k === 'tiger') { ctx.beginPath(); ctx.ellipse(-8, 12, 60, 28, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(56, -10, 25, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(42, -28); ctx.lineTo(46, -46); ctx.lineTo(56, -32); ctx.moveTo(60, -34); ctx.lineTo(70, -48); ctx.lineTo(74, -28); ctx.fill();
    ctx.lineWidth = 13; for (const lx of [-50, -26, 22, 40]) { ctx.beginPath(); ctx.moveTo(lx, 20); ctx.lineTo(lx + 2, 62); ctx.stroke(); }
    ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-64, 4); ctx.quadraticCurveTo(-96, -10, -84, -56); ctx.stroke(); }
  if (k === 'fish') { fish(0, -34, 150, 1, col); fish(0, 34, 150, -1, col); }
}
const embPts = (k) => {
  const P = [];
  if (k === 'bow') { for (let i = 0; i <= 12; i++) { const a = PI * 0.66 + i / 12 * PI * 0.68; P.push([40 + cos(a) * 84, sin(a) * 84]); } for (let x = -50; x <= 80; x += 22) P.push([x, 0]); }
  if (k === 'tiger') { for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; P.push([-8 + cos(a) * 60, 12 + sin(a) * 28]); } for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; P.push([56 + cos(a) * 25, -10 + sin(a) * 25]); } }
  if (k === 'fish') { for (const [cy, d] of [[-34, 1], [34, -1]]) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; P.push([d * (cos(a) * 62 + 10), cy + sin(a) * 22]); } }
  return P;
};
const medImg = (k) => cached('aMed_' + k, 300, 300, 1, () => {
  ctx.translate(150, 150); let g = ctx.createLinearGradient(-120, -120, 120, 120); g.addColorStop(0, CU1); g.addColorStop(0.45, CU2); g.addColorStop(1, CU3);
  ctx.beginPath(); ctx.arc(0, 0, 124, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,210,166,0.6)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 104, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(60,20,8,0.6)'; ctx.stroke();
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; ctx.beginPath(); ctx.arc(cos(a) * 114, sin(a) * 114, 3, 0, TAU); ctx.fillStyle = 'rgba(60,20,8,0.55)'; ctx.fill(); }
  ctx.save(); ctx.translate(4, 4); emblem(k, 'rgba(46,15,5,0.85)'); ctx.restore();
  ctx.save(); ctx.translate(-2, -2); emblem(k, 'rgba(255,210,166,0.85)'); ctx.restore();
  emblem(k, '#C8683A');
});
/** medallion with repousse punch reveal (pr 0..1), dim 0..1, crack 0..1 */
function medallion(m, x, y, s, pr, dim = 0, crack = 0, t = 0) {
  if (pr <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const dotsP = clamp(pr / 0.65), full = seg(pr, 0.55, 1);
  ctx.beginPath(); ctx.arc(0, 0, 124, 0, TAU); ctx.fillStyle = `rgba(110,46,20,${0.55 * (1 - full)})`; ctx.fill();
  if (full > 0) blit(medImg(m.k), 150, 150, 0, 0, 1, full);
  if (full < 1) { const P = []; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU - PI / 2; P.push([cos(a) * 114, sin(a) * 114]); } P.push(...embPts(m.k));
    const n = Math.floor(P.length * dotsP);
    for (let i = 0; i < n; i++) { const [px, py] = P[i], b = 1 + 0.6 * (1 - clamp((dotsP * P.length - i) / 4));
      ctx.fillStyle = 'rgba(40,14,4,0.9)'; ctx.beginPath(); ctx.arc(px + 2, py + 2, 5.5 * b, 0, TAU); ctx.fill();
      ctx.fillStyle = SPEC; ctx.beginPath(); ctx.arc(px - 1, py - 1, 3.2 * b, 0, TAU); ctx.fill(); } }
  if (dim > 0) { ctx.beginPath(); ctx.arc(0, 0, 128, 0, TAU); ctx.fillStyle = `rgba(5,5,5,${0.72 * dim})`; ctx.fill(); }
  if (crack > 0) { ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let b = 0; b < 3; b++) { const a0 = rnd(m.x + b) * TAU; let px = cos(a0) * 10, py = sin(a0) * 10; const n = Math.floor(7 * crack);
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let i = 0; i < n; i++) { const a = a0 + (rnd(m.y + b * 9 + i) - 0.5) * 1.1; px += cos(a) * 18; py += sin(a) * 18; ctx.lineTo(px, py); }
      ctx.strokeStyle = 'rgba(255,210,166,0.5)'; ctx.lineWidth = 2; ctx.stroke(); ctx.translate(-2, -2); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); ctx.translate(2, 2); } }
  ctx.restore();
}

// ───────────── blank centuries ruler ─────────────
const RX = (yr) => 60 + (yr - 100) / 600 * 880;   // ruler-local x of a year
const rulerImg = () => cached('aRuler', 1000, 170, 1.5, () => {
  const g = ctx.createLinearGradient(0, 40, 0, 130); g.addColorStop(0, CU1); g.addColorStop(0.45, CU2); g.addColorStop(1, CU3);
  ctx.beginPath(); ctx.roundRect(10, 40, 980, 90, 14); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,210,166,0.6)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(46,15,5,0.85)';
  for (let yr = 100; yr <= 700; yr += 25) { const x = RX(yr), big = yr % 100 === 0; ctx.fillRect(x - (big ? 2.5 : 1.5), 40, big ? 5 : 3, big ? 34 : 16); }
  ctx.font = '700 26px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let yr = 100; yr <= 700; yr += 100) { ctx.fillStyle = 'rgba(255,210,166,0.6)'; ctx.fillText(yr + 's', RX(yr) + 1.5, 103.5); ctx.fillStyle = '#2E0F05'; ctx.fillText(yr + 's', RX(yr), 102); }
});
function marker(x, y, t) {
  K.glow(x, y + 60, 130, '255,74,26', 0.55 + 0.1 * sin(t * 18));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,74,26,0.75)'; ctx.fillRect(x - 3, y + 10, 6, 120); ctx.restore();
  ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.lineTo(x - 22, y - 26); ctx.lineTo(x + 22, y - 26); ctx.closePath(); ctx.fillStyle = HOT; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x - 9, y - 18); ctx.lineTo(x + 9, y - 18); ctx.closePath(); ctx.fillStyle = '#FFE0A0'; ctx.fill();
}

// ───────────── the Kalabhra king (faceless, outline only) ─────────────
const kingImg = () => cached('aKing', 560, 1000, 1, () => {
  ctx.translate(280, 970);
  const body = new Path2D(); body.moveTo(-150, 0); body.lineTo(-108, -520); body.quadraticCurveTo(-104, -600, -40, -620); body.lineTo(40, -620); body.quadraticCurveTo(104, -600, 108, -520); body.lineTo(150, 0); body.closePath();
  ctx.fillStyle = '#17181D'; ctx.fill(body);
  ctx.strokeStyle = CU2; ctx.lineWidth = 6; ctx.stroke(body);
  ctx.strokeStyle = RIM; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-142, -10); ctx.lineTo(-102, -520); ctx.quadraticCurveTo(-98, -590, -40, -610); ctx.stroke();
  for (const k of [-0.3, 0.05, 0.4]) { ctx.beginPath(); ctx.moveTo(k * 120, -470); ctx.lineTo(k * 200, -20); ctx.strokeStyle = 'rgba(224,138,78,0.25)'; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.beginPath(); ctx.roundRect(-100, -440, 200, 26, 8); ctx.fillStyle = '#6E2E14'; ctx.fill(); // belt
  ctx.beginPath(); ctx.roundRect(-30, -660, 60, 50, 10); ctx.fillStyle = '#17181D'; ctx.fill(); ctx.strokeStyle = CU2; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -718, 54, 68, 0, 0, TAU); ctx.fillStyle = '#1C1D23'; ctx.fill(); ctx.strokeStyle = CU1; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = RIM; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, -718, 60, 74, 0, PI * 0.7, PI * 1.35); ctx.stroke();
  const crown = new Path2D(); crown.moveTo(-56, -770); crown.lineTo(-62, -850); crown.lineTo(-30, -812); crown.lineTo(0, -880); crown.lineTo(30, -812); crown.lineTo(62, -850); crown.lineTo(56, -770); crown.closePath();
  const g = ctx.createLinearGradient(-60, -880, 60, -770); g.addColorStop(0, CU1); g.addColorStop(0.5, CU2); g.addColorStop(1, CU3); ctx.fillStyle = g; ctx.fill(crown); ctx.strokeStyle = SPEC; ctx.lineWidth = 2; ctx.stroke(crown);
  // staff in the right hand + arms
  ctx.lineCap = 'round'; ctx.strokeStyle = '#17181D'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(98, -560); ctx.lineTo(150, -380); ctx.lineTo(176, -300); ctx.stroke();
  ctx.strokeStyle = CU2; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(116, -566); ctx.lineTo(168, -384); ctx.lineTo(194, -300); ctx.stroke();
  ctx.strokeStyle = '#7A4A22'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(186, -860); ctx.lineTo(186, 0); ctx.stroke();
  ctx.fillStyle = CU1; ctx.beginPath(); ctx.moveTo(186, -940); ctx.lineTo(166, -860); ctx.lineTo(206, -860); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#17181D'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(-98, -560); ctx.lineTo(-130, -380); ctx.lineTo(-118, -260); ctx.stroke();
  ctx.strokeStyle = RIM; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-116, -560); ctx.lineTo(-148, -380); ctx.lineTo(-136, -262); ctx.stroke();
});
let KSCR = null;
/** king blit + its right side dissolving into live ink; dis 0..1 */
function king(x, y, s, t, dis = 1, seed = 0) {
  blit(kingImg(), 280, 970, x, y, s);
  if (dis <= 0) return;
  // ink sheet eats the right side, masked to the figure's own silhouette (one scratch canvas, reused)
  const KI = kingImg(); if (!KSCR) { KSCR = document.createElement('canvas'); KSCR.width = KI.width; KSCR.height = KI.height; KSCR._q = 1; }
  const c = KSCR.getContext('2d'), prev = ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, KSCR.width, KSCR.height);
  setCtx(c); c.save(); c.translate(280 + 220 - 250 * dis, 0); c.rotate(PI / 2); inkPour(-40, 1040, 0, t * 0.8, seed, 0.35, 700); c.restore(); setCtx(prev);
  c.globalCompositeOperation = 'destination-in'; c.drawImage(KI, 0, 0); c.globalCompositeOperation = 'source-over';
  blit(KSCR, 280, 970, x, y, s);
  for (let i = 0; i < 4; i++) { const yy = y - s * (120 + i * 220 + rnd(seed + i) * 60), xx = x + s * (150 + rnd(seed + i * 2) * 40) + sin(t * 1.3 + i * 2) * 6 * s;
    inkBlot(xx, yy, s * (16 + rnd(i + seed) * 22) * dis, t, seed + i); }
  for (let i = 0; i < 3; i++) drops(x + s * (90 + i * 50), y - s * (300 + i * 140), y + 20, t + i * 0.3, 2, seed + i * 4, 8 * s);
}

// ───────────── the pen ─────────────
const penImg = () => cached('aPen', 1500, 300, 1, () => {
  ctx.translate(0, 150);
  ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(170, -26); ctx.lineTo(1480, -54); ctx.lineTo(1480, 54); ctx.lineTo(170, 26); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  ctx.strokeStyle = RIM; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(24, -2); ctx.lineTo(170, -27); ctx.lineTo(1480, -55); ctx.stroke();
  ctx.strokeStyle = GLOSS; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(200, -12); ctx.lineTo(1470, -32); ctx.stroke();
  ctx.strokeStyle = '#2A2A30'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(140, 0); ctx.stroke();
  for (const nx of [520, 900, 1280]) { ctx.fillStyle = '#16171C'; ctx.fillRect(nx, -48, 16, 96); ctx.fillStyle = 'rgba(74,106,138,0.7)'; ctx.fillRect(nx, -48, 16, 5); }
});

// ═════════════════════════ SHOTS ═════════════════════════
export function buildA(add, cue) {
  const t1 = Wd('hundred', 0), t2 = Wd('history', 0), t3 = L(1), t4 = Wd('hundreds', 1), t5 = Wd('cheras', 1), t6 = Wd('pandyas', 1),
    t7 = L(2), t8 = Wd('kalabhras', 2), t9 = Wd('nobody', 2), t10 = L(3), t11 = Wd('written', 3), tEnd = L(4);

  // a1 · first frame already moving: ink pouring over a glowing, red-hot copper plate
  cue(0, 'slam', { gain: 1 }); cue(0, 'sizzle', { gain: 0.7, dur: 1.2 }); cue(0.02, 'rumble', { gain: 0.5 });
  add({ id: 'a1', at: 0, cam: [540, 760], zoom: 0.16, note: 'ink pours over red-hot copper plate · WHO ERASED THEM?', draw(lt, d, t) {
    bg(t, 1);
    K.glow(540, 760, 760, '255,74,26', 0.42 * (1 - 0.5 * seg(lt, 0, d)));
    const rot = -0.05 + lt * 0.03;
    drawPlate(540, 760, 860, 560, rot, { rows: 6, seed: 3, sheen: 0.15 + lt * 0.7, hot: 1 - 0.5 * seg(lt, 0, d) });
    const edge = 520 + 300 * eo(seg(lt, 0, d * 1.1));
    ctx.save(); ctx.translate(540, 0); ctx.rotate(0.1); inkPour(-900, 900, edge, t, 2, 1.2); ctx.restore();
    for (let i = 0; i < 5; i++) { const x = 180 + i * 180, y = edge + 30 + (x - 540) * 0.1, age = (lt * 1.7 + rnd(i + 4)) % 0.6; if (y > 500 && y < 1030) sparks(x, y, age, i + 3, 8, 0.6); }
    smoke(380, edge + 20, t, 5, '200,212,228', 0.16, 60, 340); smoke(720, edge + 60, t + 1, 5, '200,212,228', 0.16, 60, 340);
    K.glow(540, 760, 900, '255,74,26', 0.7 * (1 - eo(seg(lt, 0, 0.3)))); flash(0.18 * (1 - eo(seg(lt, 0, 0.2)))); flash(0.15 * (1 - seg(lt, 0, 0.1)), '255,224,160');
    tag('WHO ERASED THEM?', 540, 1215, 64, 1, pop(lt, 0.12));
  } });

  // a2 · three hundred years: plates fanned on the ring, blotted out one by one
  cue(t1, 'whoosh', { gain: 0.6 });
  for (let i = 0; i < 5; i++) cue(lerp(t1, t2, 0.08 + i * 0.17), 'plop', { gain: 0.5, pan: -0.4 + i * 0.2 });
  add({ id: 'a2', at: t1, cam: [470, 760], zoom: 0.1, note: 'five plates fanned on the bronze ring, inked one by one', draw(lt, d, t) {
    bg(t, 2);
    const rx = 250, ry = 760, w = 640, h = 210, spin = 0.12 * eio(seg(lt, 0, d));
    K.glow(rx + 320, ry, 600, '255,120,60', 0.18);
    for (let i = 0; i < 5; i++) {
      const a = -0.6 + i * 0.3 + spin + sin(lt * 2.6 + i) * 0.035, off = w / 2 - h * 0.16, cx = rx + cos(a) * off, cy = ry + sin(a) * off;
      const s0 = 0.08 + i * 0.17, lev = eio(seg(lt, s0 * d, s0 * d + 0.3));
      drawPlate(cx, cy, w, h, a, { rows: 4, seed: 10 + i, patina: i % 2 ? 0.5 : 0.2, sheen: (lt * 0.9 + i * 0.15) % 1.4 - 0.2 });
      plateInk(cx, cy, w, h, a, lev, t, i);
      if (lev > 0 && lev < 1) drops(cx + cos(a) * 200, 120, cy, t, 2, i, 12);
    }
    ringSeal(rx, ry, t);
  } });

  // a3 · the hammer stamps the question into copper, ink creeping in from the corners
  const h3 = [0.1, 0.38, 0.66];
  h3.forEach((k, i) => { cue(lerp(t2, t3, k), 'chisel', { gain: 0.9, pan: -0.3 + i * 0.3 }); });
  cue(t2, 'thud', { gain: 0.7 });
  add({ id: 'a3', at: t2, cam: [540, 760], zoom: 0.1, note: 'hammer stamps WHO ERASED THEM? into a copper plate, sparks', draw(lt, d, t) {
    bg(t, 3);
    K.glow(540, 760, 700, '255,120,60', 0.2);
    drawPlate(540, 760, 900, 600, 0.02, { rows: 0, seed: 21, patina: 0.35, sheen: lt / d });
    ctx.save(); ctx.translate(540, 760); ctx.rotate(0.02);
    const W3 = [['WHO', 0, -165], ['ERASED', 0, 0], ['THEM?', 0, 165]], hits = h3.map((k) => k * d);
    W3.forEach(([w, x, y], i) => { if (lt > hits[i]) stamped(w, x, y, 140, 1); });
    for (let c = 0; c < 4; c++) { const cx = (c % 2 ? 1 : -1) * 430, cy = (c < 2 ? -1 : 1) * 280; inkBlot(cx, cy, 40 + 130 * eio(seg(lt, 0, d)), t, c * 3); }
    ctx.restore();
    let cur = 0; for (let i = 0; i < 3; i++) if (lt > hits[i] - 0.2) cur = i;
    const [, , wy] = W3[cur], px = 640, py = 760 + wy - 30;
    hammer(px, py, swing(lt, hits), 1.35);
    hits.forEach((h, i) => sparks(px - 60, 760 + W3[i][2] + 20, lt - h, i + 30, 24));
    flash(0.25 * Math.max(...hits.map((h) => 1 - seg(lt - h, 0, 0.1) - (lt < h ? 1 : 0))));
  } });

  // a4 · the blank centuries ruler: a red-hot marker slides to the 200s; records stand as plates up to there
  cue(t3, 'whoosh', { gain: 0.8 }); cue(lerp(t3, t4, 0.2), 'zip', { gain: 0.5 });
  add({ id: 'a4', at: t3, cam: [540, 800], zoom: 0.08, note: 'ruler close-up, red-hot marker slides to the 200s past standing plates', draw(lt, d, t) {
    bg(t, 4);
    const k = eio(seg(lt, 0, d)), s = 1.9, yr = lerp(110, 250, k);
    const baseX = 540 - RX(yr) * s - 60 * (1 - k), y = 900;
    ctx.save(); ctx.translate(baseX, 0);
    for (let p = 0; p < 9; p++) { const py = 100 + p * 25; const x = RX(py) * s, thin = clamp((270 - py) / 70);
      drawPlate(x, y - 40 - 150, 300, 96, PI / 2 + sin(t * 1.5 + p) * 0.03, { rows: 3, seed: 40 + p, patina: rnd(p) * 0.6, a: 0.35 + 0.65 * thin, sheen: (t * 0.5 + p * 0.1) % 1.3 - 0.15 }); }
    blit(rulerImg(), 0, 85, 0, y, s);
    marker(RX(yr) * s, y - 85 * s * 0.55, t);
    ctx.restore();
  } });

  // a5 · the span c. 250-550 gets blotted out; plates above it sink into the ink
  cue(t4, 'thud', { gain: 0.7 }); cue(t4 + 0.05, 'rumble', { gain: 0.6, dur: 1.2 }); cue(lerp(t4, t5, 0.55), 'pop', { gain: 0.6 });
  add({ id: 'a5', at: t4, cam: [540, 780], zoom: 0.07, note: 'full ruler, ink blots 250-550 · c. 250-550 CE', draw(lt, d, t) {
    bg(t, 5);
    const x0 = 40, y = 820, s = 1, k = eio(seg(lt, 0.05, d * 0.8)), front = lerp(250, 550, k);
    for (let p = 0; p < 25; p++) { const yr = 100 + p * 25, inSpan = yr > 240 && yr < 560, gone = inSpan ? clamp((front - yr) / 60) : 0;
      if (gone >= 1) continue; drawPlate(x0 + RX(yr), y - 130 + gone * 70, 200, 70, PI / 2 + sin(t * 1.4 + p) * 0.04, { rows: 3, seed: 60 + p, patina: rnd(p + 2) * 0.6, a: 1 - gone, sheen: (t * 0.4 + p * 0.07) % 1.3 - 0.15 }); }
    blit(rulerImg(), 0, 85, x0, y, s);
    for (let yr = 250; yr <= front; yr += 18) inkBlot(x0 + RX(yr), y + 2, 62, t, yr);
    if (k < 1) marker(x0 + RX(front), y - 70, t);
    if (k > 0.2) { ctx.strokeStyle = 'rgba(237,239,242,0.7)'; ctx.lineWidth = 3; const a = x0 + RX(250), b = x0 + RX(front); ctx.beginPath(); ctx.moveTo(a, y + 90); ctx.lineTo(a, y + 110); ctx.lineTo(b, y + 110); ctx.lineTo(b, y + 90); ctx.stroke(); }
    tag('c. 250-550 CE', 540, 1060, 70, 1, pop(lt, d * 0.4));
  } });

  // a6 · dark map of the Tamil south; Chera / Chola / Pandya medallions punched in from behind
  cue(t5, 'whoosh', { gain: 0.6 }); cue(t5, 'chisel', { gain: 0.7, pan: -0.4 }); cue(Wd('cholas', 1), 'chisel', { gain: 0.7, pan: 0.4 }); cue(Wd('and', 1, 's'), 'chisel', { gain: 0.7 });
  const medT = [t5, Wd('cholas', 1), Wd('and', 1)];
  add({ id: 'a6', at: t5, cam: [540, 760], zoom: 0.08, note: 'dark map, three emblem medallions punched in · CHERA CHOLA PANDYA', draw(lt, d, t) {
    bg(t, 6); blit(mapImg(), 0, 0, 0, 40);
    MEDS.forEach((m, i) => { const pr = seg(t, medT[i], medT[i] + 0.5); if (pr > 0.5) K.glow(m.x, m.y + 40, 220, '224,138,78', 0.22 * seg(pr, 0.5, 1));
      medallion(m, m.x, m.y + 40, 1, pr, 0, 0, t); tag(m.name, m.x, m.y + 40 + 160, 36, seg(pr, 0.55, 0.8), 1); });
    const last = medT.findLastIndex((x) => t >= x); if (last >= 0) { const m = MEDS[last]; sparks(m.x, m.y + 40, t - medT[last], last + 50, 12, 0.6); }
  } });

  // a7 · they dim, crack and sink under ink · RECORDS GROW THIN
  const tGrow = Wd('grow', 1);
  cue(t6, 'thud', { gain: 0.6 }); cue(tGrow, 'chisel', { gain: 0.9 }); cue(tGrow + 0.1, 'gulp', { gain: 0.6 }); cue(lerp(tGrow, t7, 0.3), 'rumble', { gain: 0.6 });
  add({ id: 'a7', at: t6, cam: [560, 720], zoom: 0.1, note: 'medallions dim, crack, sink; ink floods the map · RECORDS GROW THIN', draw(lt, d, t) {
    bg(t, 7);
    ctx.save(); ctx.translate(560, 760); ctx.scale(1.18, 1.18); ctx.translate(-560, -760);
    blit(mapImg(), 0, 0, 0, 40);
    const g = seg(t, tGrow - 0.1, t7 - 0.2);
    MEDS.forEach((m, i) => { const pr = i === 2 ? seg(lt, 0, 0.35) : 1, sink = 60 * eio(seg(g, 0.3, 1));
      if (g < 0.4) K.glow(m.x, m.y + 40, 220, '224,138,78', 0.22 * (1 - g / 0.4));
      medallion(m, m.x, m.y + 40 + sink, 1 - 0.08 * g, pr, eio(seg(g, 0.05, 0.6)), eo(seg(g, 0, 0.45)), t);
      if (t < tGrow) tag(m.name, m.x, m.y + 200, 36, 1 - seg(t, tGrow - 0.15, tGrow)); });
    const edge = lerp(-200, 1060, eio(seg(g, 0.25, 1)));
    if (g > 0.25) { ctx.save(); ctx.translate(560, 0); ctx.rotate(-0.06); inkPour(-800, 800, edge, t, 5, 1.1); ctx.restore();
      MEDS.forEach((m) => { const cov = seg(edge - (m.y + 40), 0, 160); if (cov > 0) { ctx.beginPath(); ctx.arc(m.x, m.y + 40 + 60 * eio(seg(g, 0.3, 1)), 118, 0, TAU); ctx.strokeStyle = `rgba(224,138,78,${0.22 * cov})`; ctx.lineWidth = 3; ctx.stroke(); } }); }
    ctx.restore();
    tag('RECORDS GROW THIN', 540, 1250, 60, 1, pop(t, tGrow));
  } });

  // a8 · in their place: rulers rise out of the ink pool
  cue(t7, 'rumble', { gain: 0.8, dur: 1.6 }); cue(t7 + 0.05, 'swell', { gain: 0.6, dur: 1.8 }); cue(Wd('rulers', 2), 'gulp', { gain: 0.5 });
  add({ id: 'a8', at: t7, cam: [540, 820], zoom: 0.1, note: 'three faceless Kalabhra rulers rise out of an ink pool', draw(lt, d, t) {
    bg(t, 8);
    const fy = 1130;
    for (let i = 0; i < 3; i++) drawPlate(200 + i * 340, 420 + (i % 2) * 70, 300, 110, -0.2 + i * 0.2, { rows: 3, seed: 80 + i, patina: 0.8, dark: 0.75 });
    ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, fy + 300); ctx.clip();
    for (const [x, s, k0] of [[250, 0.62, 0.25], [830, 0.62, 0.35], [540, 0.9, 0]]) {
      const rise = eo(seg(lt, k0 * d * 0.5, k0 * d * 0.5 + d * 0.7)); king(x, fy + (1 - rise) * 900 * s + 30, s, t, 0.55 + 0.45 * (1 - rise), x);
    }
    ctx.restore();
    { const g = ctx.createLinearGradient(0, fy, 0, fy + 200); g.addColorStop(0, INK); g.addColorStop(0.6, 'rgba(5,5,5,0.85)'); g.addColorStop(1, 'rgba(5,5,5,0)'); ctx.fillStyle = g; ctx.fillRect(-300, fy, W + 600, 200); }
    ctx.strokeStyle = GLOSS; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-300, fy + 2); ctx.lineTo(W + 300, fy + 2); ctx.stroke();
    for (let i = 0; i < 4; i++) { const ph = (lt * 0.8 + i * 0.25) % 1; ctx.beginPath(); ctx.ellipse(540, fy + 30, 120 + ph * 420, 12 + ph * 34, 0, 0, TAU); ctx.strokeStyle = `rgba(74,106,138,${0.4 * (1 - ph)})`; ctx.lineWidth = 3; ctx.stroke(); }
    tag('ILLUSTRATION', 900, 190, 26, 0.85);
  } });

  // a9 · the Kalabhra king, half dissolved in ink · THE KALABHRAS
  cue(t8, 'slam', { gain: 0.9 }); cue(t8 + 0.1, 'sizzle', { gain: 0.4, dur: 1 }); cue(Wd('where', 2), 'heartbeat', { gain: 0.6 });
  add({ id: 'a9', at: t8, cam: [540, 700], zoom: 0.12, note: 'close on the half-dissolved Kalabhra king · THE KALABHRAS', draw(lt, d, t) {
    bg(t, 9);
    K.glow(330, 520, 600, '74,106,138', 0.3);
    K.glow(540, 700, 520, '224,138,78', 0.12 + 0.05 * sin(t * 4));
    king(540, 1210, 1.08, t, 0.85 + 0.15 * seg(lt, 0, d), 3);
    flash(0.4 * (1 - seg(lt, 0, 0.2)));
    tag('THE KALABHRAS', 540, 1260, 72, 1, pop(lt, 0.05));
    tag('ILLUSTRATION', 900, 190, 26, 0.85);
  } });

  // a10 · where did they come from? arrows from every side, each erased · ORIGIN UNKNOWN
  const ARR = [[540, 120], [130, 260], [960, 300], [60, 760], [1020, 820]];
  ARR.forEach((_, i) => cue(lerp(t9, t10, 0.05 + i * 0.13), 'whoosh', { gain: 0.4, pan: (ARR[i][0] - 540) / 540 }));
  cue(lerp(t9, t10, 0.75), 'plop', { gain: 0.6 });
  add({ id: 'a10', at: t9, cam: [540, 760], zoom: -0.06, note: 'dim map, the king small; origin arrows with ? get blotted · ORIGIN UNKNOWN', draw(lt, d, t) {
    bg(t, 10); blit(mapImg(), 0, 0, 0, 40, 1, 0.55);
    const kx = 560, ky = 930;
    king(kx, ky + 120, 0.42, t, 0.8, 7);
    ARR.forEach(([ax, ay], i) => {
      const s0 = (0.05 + i * 0.13) * d, p = eo(seg(lt, s0, s0 + 0.45)), gone = eio(seg(lt, s0 + 0.9, s0 + 1.3));
      if (p <= 0) return;
      const ex = lerp(ax, kx, 0.62), ey = lerp(ay, ky - 160, 0.62), x = lerp(ax, ex, p), y = lerp(ay, ey, p);
      ctx.save(); ctx.globalAlpha = 1 - gone * 0.85; ctx.setLineDash([22, 16]); ctx.lineDashOffset = -t * 60; ctx.strokeStyle = CU1; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
      if (p > 0.8) { ctx.font = '700 84px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = WHITE; ctx.fillText('?', x + (x - ax) * 0.12, y + (y - ay) * 0.12); }
      ctx.restore();
      if (gone > 0) inkBlot(lerp(ax, x, 0.6), lerp(ay, y, 0.6), 30 + 120 * gone, t, i * 5);
    });
    tag('ORIGIN UNKNOWN', 540, 1250, 66, 1, pop(lt, d * 0.25));
  } });

  // a11 · the ring of plates turns like a carousel; one swings to the front
  cue(t10, 'bell', { gain: 0.5 }); cue(t10, 'whoosh', { gain: 0.6 }); cue(lerp(t10, t11, 0.6), 'tock', { gain: 0.6 });
  add({ id: 'a11', at: t10, cam: [540, 700], zoom: 0.1, note: 'carousel of plates on the bronze ring, one swings to the front', draw(lt, d, t) {
    bg(t, 11);
    const cx = 540, cy = 380, R = 340, N = 7, spin = lt * 1.4 + 0.4, front = eio(seg(lt, d * 0.45, d));
    const P = []; for (let i = 0; i < N; i++) { const ph = i / N * TAU + spin; P.push({ i, ph, z: cos(ph), x: cx + sin(ph) * R, y: cy + cos(ph) * 70 }); }
    P.sort((a, b) => a.z - b.z);
    ctx.lineWidth = 22; ctx.strokeStyle = '#6A4220'; ctx.beginPath(); ctx.ellipse(cx, cy, R, 70, 0, PI, TAU); ctx.stroke();
    for (const p of P) { const isF = p.i === 0, sc = 0.82 + 0.18 * p.z, w = 680, h = 220;
      const big = isF ? front : 0;
      const px = lerp(p.x, 540, big), py = lerp(p.y, 330, big), s = lerp(sc, 1.3, big);
      ctx.save(); ctx.translate(px, py); ctx.scale(s, s);
      drawPlate(0, w / 2 - h * 0.16, w, h, PI / 2, { rows: 4, seed: 90 + p.i, patina: 0.25 + 0.5 * rnd(p.i), dark: isF ? 0 : clamp(0.55 - p.z * 0.55), sheen: (t * 0.6 + p.i * 0.2) % 1.3 - 0.15, a: 1 });
      ctx.restore();
    }
    ctx.lineWidth = 22; const g = ctx.createLinearGradient(cx - R, 0, cx + R, 0); g.addColorStop(0, '#5A3418'); g.addColorStop(0.5, '#D8A464'); g.addColorStop(1, '#5A3418');
    ctx.strokeStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, R, 70, 0, 0, PI); ctx.stroke();
    ctx.save(); ctx.translate(cx, cy + 70); ctx.rotate(sin(t * 1.6) * 0.1); blit(sealImg(), 100, 20, 0, 0, 0.75); ctx.restore();
    // shadow of the pen arrives at the end
    const sh = eio(seg(lt, d * 0.55, d)); if (sh > 0) { ctx.save(); ctx.globalAlpha = 0.45 * sh; ctx.translate(lerp(1400, 760, sh), lerp(-200, 120, sh)); ctx.rotate(2.4); blit(penImg(), 20, 150, 0, 0, 1); ctx.restore(); }
  } });

  // a12 · a giant pen drips ink across the plates · WRITTEN BY ENEMIES
  const tEn = Wd('enemies', 3);
  cue(t11, 'zip', { gain: 0.7, dur: 1.2 }); cue(t11, 'whoosh', { gain: 0.6 }); cue(tEn, 'thud', { gain: 0.9 }); cue(tEn + 0.05, 'sizzle', { gain: 0.5, dur: 0.8 });
  add({ id: 'a12', at: t11, cam: [540, 820], zoom: 0.12, note: 'giant reed pen writes an ink stroke over three plates · WRITTEN BY ENEMIES', draw(lt, d, t) {
    bg(t, 12);
    heatEdges(0.45 * seg(t, tEn - 0.1, tEn + 0.3));
    const PL = [[300, 800, -0.12, 101], [560, 870, 0.05, 102], [800, 790, 0.16, 103]];
    PL.forEach(([x, y, r, s], i) => drawPlate(x, y, 460, 300, r, { rows: 5, seed: s, patina: 0.3 + i * 0.15, sheen: (t * 0.5 + i * 0.3) % 1.3 - 0.15 }));
    const D = tEnd - t11, p = eio(seg(lt, 0.05, D * 0.85)), path = (k) => [lerp(110, 980, k), 830 + sin(k * 9) * 70 - k * 60];
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    for (let k = 0; k <= p; k += 0.01) { const [x, y] = path(k); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = INK; ctx.lineWidth = 46; ctx.stroke(); ctx.strokeStyle = GLOSS; ctx.lineWidth = 6; ctx.translate(0, -12); ctx.stroke(); ctx.translate(0, 12);
    for (let i = 0; i < 9; i++) { const k = i / 9 + 0.05; if (k < p) { const [x, y] = path(k), l = 40 + 90 * rnd(i) * clamp((p - k) * 4); ctx.fillStyle = INK; ctx.fillRect(x - 6, y, 12, l); ctx.beginPath(); ctx.arc(x, y + l, 9, 0, TAU); ctx.fill(); } }
    const [nx, ny] = path(p), bob = sin(t * 6) * 8;
    drops(nx, ny + 20, 1200, t, 3, 4, 11);
    ctx.save(); ctx.translate(nx, ny - 20 + bob); ctx.rotate(-0.95); blit(penImg(), 20, 150, 0, 0, 1); ctx.restore();
    tag('WRITTEN BY ENEMIES', 540, 1250, 64, 1, pop(lt, 0.2));
  } });
}
