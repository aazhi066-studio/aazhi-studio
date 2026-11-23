// EPISODE 19 · worker B : "Charcoal Diptych", lines 4-6 (L(4) -> L(7)).
//   b1  LANKA'S RECORD: the teal-tied chronicle bundle is smudged on; CULAVAMSA SAYS tag (whole line 4)
//   b2  charcoal sea map: teal arrows push from the coast to MADURAI, battle X marks + dust, a tally on an erased patch, VICTORY
//   b3  a charcoal throne; the small crowned faceless boy-prince is set on it, teal halo, ILLUSTRATION
//   b4  hatched sea: the teal-sailed ship sails home along a dotted route; HERO slams with a chalk-dust burst
//   b5  DIPTYCH SPLIT: a torn seam rips; the red CHOLA RECORD panel with the stone slab slides in and pushes the teal side
//   b6  close on the red-edged slab: chisel nicks cut in row by row (red sparks); STONE INSCRIPTIONS; teal sliver pushed out
//   b7  RAJADHIRAJA II: faceless crowned silhouette smudged up from the floor, red pastel aura; ILLUSTRATION; INSCRIPTIONS SAY
//   b8  three rows of small red-shielded spearmen march right under a forest of spears
//   b9  the gate of Madurai: push to the spikes; crows lift off; two EMPTY spikes get outlined in red pastel
//   b10 the gate small at left, a fallen helmet tumbles to a stop on the right; NAILED TO THE GATES; red question mark
// Everything heavy (paper, bundle, slab, map, throne, figures, ship, sea, gate, helmet) is baked once with cached();
// per frame: blits, clips, a few charcoal strokes, dust specks and crows. No shadowBlur.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd, lineWords } from './core/timing.js';
import { cached, blit } from './art.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const Z = { wall: '#141210', paper: '#B8B2A6', tooth: '#9C968A', light: '#CFCAC0', coal: '#1C1A18', chalk: '#F2EFE8', teal: '#3E8C8A', red: '#A8321F' };
const COAL = '28,26,24', CHALK = '242,239,232', TEAL = '62,140,138', RED = '168,50,31', LIGHT = '207,202,192';

// ───────────── shared helpers (copied exactly from ART.md) ─────────────
// toned charcoal paper filling the frame (cache it): grey sheet + tooth grain + vignette
function paperImg() {
  return cached('paper19', W, H, 1, () => { const c = ctx;
    const g = c.createRadialGradient(540, 820, 200, 540, 960, 1250); g.addColorStop(0, '#CFCAC0'); g.addColorStop(0.6, '#B8B2A6'); g.addColorStop(1, '#8F897D');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 26000; i++) { const x = rnd(i) * W, y = rnd(i + 77777) * H, v = rnd(i + 3333);
      c.fillStyle = v > 0.5 ? `rgba(255,252,245,${0.05 + v * 0.06})` : `rgba(28,26,24,${0.03 + v * 0.07})`; c.fillRect(x, y, 1 + (v * 3 | 0), 1 + (v * 2 | 0)); }
  });
}
// grainy charcoal stroke along pts (array of [x,y]); p = 0..1 reveal; w = width; col default charcoal
function charcoal(pts, p = 1, w = 6, col = '28,26,24', a = 0.85, seed = 1) {
  const n = Math.max(2, Math.floor(pts.length * p)); if (n < 2) return;
  for (let k = 0; k < 3; k++) { ctx.beginPath();
    for (let i = 0; i < n; i++) { const j = (rnd(seed * 97 + i * 13 + k * 7) - 0.5) * w * 0.6; const [x, y] = pts[i]; i ? ctx.lineTo(x + j, y - j) : ctx.moveTo(x + j, y + j); }
    ctx.strokeStyle = `rgba(${col},${a * (k ? 0.35 : 0.8)})`; ctx.lineWidth = w * (k ? 0.5 : 1); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
}

// ───────────── small helpers ─────────────
/** charcoal draw-on that stays invisible until it has started (charcoal() always draws 2 points) */
const drawOn = (pts, p, ...r) => { if (p > 0.03) charcoal(pts, p, ...r); };
const pop = (lt, t0, d = 0.3) => (lt < t0 ? 0 : eob(clamp((lt - t0) / d)));
const lineP = (x0, y0, x1, y1, n = 16) => { const o = []; for (let i = 0; i <= n; i++) o.push([lerp(x0, x1, i / n), lerp(y0, y1, i / n)]); return o; };
const pathP = (P, step = 18) => { const o = []; for (let i = 0; i < P.length - 1; i++) { const [x0, y0] = P[i], [x1, y1] = P[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
  for (let k = 0; k < n; k++) o.push([lerp(x0, x1, k / n), lerp(y0, y1, k / n)]); } o.push(P[P.length - 1]); return o; };
const rectP = (x, y, w, h, step = 22) => pathP([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], step);
const arcP = (cx, cy, r, a0, a1, n = 24, ry = r) => { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([cx + cos(a) * r, cy + sin(a) * ry]); } return o; };
/** jagged closed polygon path (paper / stone edges) */
function roughPoly(P, amp = 4, seed = 1) {
  const pts = pathP(P, 26); ctx.beginPath();
  pts.forEach(([x, y], i) => { const jx = (rnd(seed * 13 + i) - 0.5) * amp * 2, jy = (rnd(seed * 29 + i) - 0.5) * amp * 2; i ? ctx.lineTo(x + jx, y + jy) : ctx.moveTo(x + jx, y + jy); });
  ctx.closePath();
}
const roughRect = (x, y, w, h, amp = 4, seed = 1) => roughPoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], amp, seed);
/** diagonal hatching across a box (use inside a clip) */
function hatch(x0, y0, x1, y1, gap = 12, col = COAL, a = 0.3, lw = 2, ang = 1) {
  ctx.strokeStyle = `rgba(${col},${a})`; ctx.lineWidth = lw; ctx.beginPath(); const h = y1 - y0;
  for (let x = x0 - h; x < x1 + h; x += gap) { ctx.moveTo(x, y1); ctx.lineTo(x + h * ang, y0); }
  ctx.stroke();
}
/** pastel tooth: specks of paper and charcoal over the current clip, so a fill reads as rubbed pastel */
function tooth(x0, y0, x1, y1, n = 400, seed = 1) {
  for (let i = 0; i < n; i++) { const v = rnd(seed * 7 + i); ctx.fillStyle = v > 0.5 ? `rgba(${LIGHT},${0.2 + v * 0.2})` : `rgba(${COAL},${0.08 + v * 0.15})`;
    ctx.fillRect(lerp(x0, x1, rnd(seed * 3 + i * 1.7)), lerp(y0, y1, rnd(seed * 5 + i * 2.3)), 1 + v * 3, 1 + v * 2); }
}
/** abstract writing: a row of charcoal squiggles (never letters) */
function squig(x0, x1, y, seed, col = COAL, a = 0.7, lw = 3, amp = 7) {
  ctx.beginPath(); let x = x0, k = 0;
  while (x < x1 - 10 && k < 60) { const f = rnd(seed * 31 + k), len = 16 + f * 36, e = Math.min(x1, x + len); ctx.moveTo(x, y);
    for (let s = 1; s <= 7; s++) { const u = s / 7; ctx.lineTo(lerp(x, e, u), y + sin(u * PI * (2 + f * 3) + f * 9) * amp * (0.5 + f * 0.6)); }
    x = e + 10 + f * 14; if (f > 0.86) x += 34; k++; }
  ctx.strokeStyle = `rgba(${col},${a})`; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
/** abstract chisel nicks: rows of short wedge cuts (never letters) */
function nicks(x0, x1, y, seed, col = COAL, a = 0.8) {
  let x = x0, k = 0; ctx.fillStyle = `rgba(${col},${a})`;
  while (x < x1 - 8 && k < 50) { const f = rnd(seed * 17 + k), g = rnd(seed * 23 + k);
    ctx.beginPath(); if (g < 0.4) { ctx.moveTo(x, y - 14); ctx.lineTo(x + 7, y - 14); ctx.lineTo(x + 3, y + 14); }
    else if (g < 0.7) { ctx.moveTo(x, y - 12); ctx.lineTo(x + 16, y + 2); ctx.lineTo(x + 2, y + 12); ctx.lineTo(x + 8, y); }
    else { ctx.moveTo(x, y - 3); ctx.lineTo(x + 18, y - 6); ctx.lineTo(x + 16, y + 2); ctx.lineTo(x + 2, y + 4); }
    ctx.closePath(); ctx.fill(); x += 14 + f * 14; if (f > 0.88) x += 26; k++; }
}

// ───────────── labels ─────────────
/** Caladea caps label; o.u = pastel underline rgb, o.col 'coal'|'chalk', o.box = boxed hedge tag */
function tag(text, x, y, size, o = {}) {
  const a = o.a ?? 1; if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(o.rot || 0); const sc = o.sc ?? 1; ctx.scale(sc, sc);
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.08)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width;
  if (o.box) { const bw = w + size * 1.6, bh = size * 1.7; roughRect(-bw / 2, -bh / 2, bw, bh, 3, size); ctx.fillStyle = 'rgba(214,209,199,0.94)'; ctx.fill();
    charcoal(rectP(-bw / 2, -bh / 2, bw, bh, 26), 1, 4, COAL, 0.85, size + 3);
    ctx.fillStyle = `rgba(${o.u},0.95)`; ctx.fillRect(-bw / 2 + size * 0.3, -bh / 2 + size * 0.35, size * 0.32, bh - size * 0.7); }
  ctx.fillStyle = o.col === 'chalk' ? Z.chalk : Z.coal; ctx.fillText(text, o.box ? size * 0.2 : 0, size * 0.04);
  if (o.u && !o.box) charcoal(lineP(-w / 2, size * 0.66, w / 2, size * 0.6, 14), 1, Math.max(5, size * 0.11), o.u, 0.95, size + 7);
  ctx.letterSpacing = '0px'; ctx.restore();
}
/** panel title: chalk caps on a grainy pastel band that rubs on left to right (p) */
function header(text, x, y, rgb, p = 1, size = 52) {
  if (p <= 0) return;
  ctx.save(); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.12)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width, bw = w + size * 1.3, bh = size * 1.5, x0 = x - bw / 2;
  ctx.beginPath(); ctx.rect(x0 - 20, y - bh, bw * eo(clamp(p)) + 40, bh * 2); ctx.clip();
  roughRect(x0, y - bh / 2, bw, bh, 4, size); ctx.fillStyle = `rgba(${rgb},0.92)`; ctx.fill();
  charcoal(lineP(x0, y - bh / 2, x0 + bw, y - bh / 2, 20), 1, 6, rgb, 0.8, 3); charcoal(lineP(x0, y + bh / 2, x0 + bw, y + bh / 2, 20), 1, 6, rgb, 0.8, 5);
  ctx.fillStyle = Z.chalk; ctx.fillText(text, x + size * 0.06, y + size * 0.05);
  ctx.letterSpacing = '0px'; ctx.restore();
}

// ───────────── per-frame effects ─────────────
function bg(dx = 0, dy = 0, tint = null, ta = 0.07) {
  ctx.fillStyle = Z.wall; ctx.fillRect(-300, -300, W + 600, H + 600);
  blit(paperImg(), 540, 960, 540 + dx, 960 + dy, 1.07);
  if (tint) { ctx.fillStyle = `rgba(${tint},${ta})`; ctx.fillRect(-300, -300, W + 600, H + 600); }
}
/** panel edge: a rubbed pastel stroke down one side of the sheet */
function edge(x, rgb, a = 0.75) { charcoal(lineP(x, 60, x + 6, 1300, 30), 1, 14, rgb, a, x | 0); }
/** chalk-dust burst: puffs + flying specks, age in s */
function burst(x, y, age, R = 240, seed = 1, n = 40) {
  if (age < 0 || age > 1.8) return; const u = age / 1.8;
  for (let i = 0; i < 7; i++) { const an = rnd(seed + i * 3) * TAU, r = R * 0.4 * eo(clamp(age / 0.6)) * (0.5 + rnd(seed + i));
    ctx.fillStyle = `rgba(${CHALK},${0.13 * (1 - u)})`; ctx.beginPath(); ctx.arc(x + cos(an) * r, y + sin(an) * r * 0.7 - age * 30, 30 + age * 70 * (0.6 + rnd(i + seed)), 0, TAU); ctx.fill(); }
  const e = eo(clamp(age / 0.9));
  for (let i = 0; i < n; i++) { const an = rnd(seed * 7 + i) * TAU, sp = R * (0.35 + rnd(seed * 3 + i) * 0.85), s = 2 + rnd(i + seed) * 5;
    ctx.fillStyle = i % 3 ? `rgba(${CHALK},${(1 - u) * 0.95})` : `rgba(90,86,80,${(1 - u) * 0.8})`;
    ctx.fillRect(x + cos(an) * sp * e, y + sin(an) * sp * e * 0.8 + age * age * 70, s, s); }
}
/** charcoal dust falling from a drawing edge */
function specks(x0, x1, y0, t, n = 18, seed = 1, fall = 300) {
  for (let i = 0; i < n; i++) { const ph = (t * (0.4 + rnd(seed + i) * 0.5) + rnd(seed * 3 + i)) % 1;
    ctx.fillStyle = `rgba(${COAL},${0.5 * (1 - ph)})`; ctx.fillRect(lerp(x0, x1, rnd(seed * 5 + i)) + sin(ph * 6 + i) * 8, y0 + ph * fall, 2 + rnd(i) * 3, 2 + rnd(i + 1) * 3); }
}
/** a wide thumb-smear of charcoal (feathered by stacked low-alpha strokes) */
function smear(x0, y0, x1, y1, w = 90, a = 0.12) {
  for (let k = 0; k < 4; k++) { ctx.strokeStyle = `rgba(${COAL},${a * (1 - k * 0.2)})`; ctx.lineWidth = w * (0.4 + k * 0.3); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0 + k * 6); ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 20 + k * 8, x1, y1 + k * 4); ctx.stroke(); }
}
/** clip to a left->right wipe with a jagged front; then the smudge band at the front */
function wipeX(x0, x1, y0, y1, p, seed = 1) {
  const fx = lerp(x0, x1, p); ctx.beginPath(); ctx.moveTo(x0 - 60, y0);
  for (let i = 0; i <= 24; i++) { const y = lerp(y0, y1, i / 24); ctx.lineTo(fx + (rnd(seed + i) - 0.5) * 50 + sin(i * 0.9) * 20, y); }
  ctx.lineTo(x0 - 60, y1); ctx.closePath(); ctx.clip(); return fx;
}
function wipeYup(x0, x1, y0, y1, p, seed = 1) { // reveals from bottom (y1) upward
  const fy = lerp(y1, y0, p); ctx.beginPath(); ctx.moveTo(x0, y1 + 60);
  for (let i = 0; i <= 24; i++) { const x = lerp(x0, x1, i / 24); ctx.lineTo(x, fy + (rnd(seed + i) - 0.5) * 50 + sin(i * 0.8) * 18); }
  ctx.lineTo(x1, y1 + 60); ctx.closePath(); ctx.clip(); return fy;
}
/** charcoal crow; f = wing phase (radians), fold 0..1 for a perched crow */
function crow(x, y, s = 1, f = 0, fold = 0, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.fillStyle = Z.coal; ctx.strokeStyle = Z.coal;
  ctx.beginPath(); ctx.ellipse(0, 0, 24, 10, -0.12, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(24, -7, 8, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(30, -9); ctx.lineTo(44, -5); ctx.lineTo(30, -3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, -3); ctx.lineTo(-42, -10); ctx.lineTo(-40, 6); ctx.closePath(); ctx.fill();
  const up = lerp(sin(f) * 38, -4, fold);
  for (const side of [1, 0.7]) { ctx.beginPath(); ctx.moveTo(-8, -4); ctx.quadraticCurveTo(-10, -up * side - 10, -36 * (1 - fold * 0.4), -up * side * 1.2 - 6);
    ctx.quadraticCurveTo(-14, -up * side * 0.4, 10, -2); ctx.closePath(); ctx.globalAlpha *= side === 1 ? 1 : 0.75; ctx.fill(); }
  ctx.restore();
}
/** a chalk/pastel question mark drawn on (p) */
function qmark(x, y, s, p, rgb = RED, w = 16) {
  const P = arcP(x, y - 70 * s, 52 * s, -PI * 0.95, PI * 0.45, 22).concat(lineP(x + 52 * s * cos(PI * 0.45), y - 70 * s + 52 * s * sin(PI * 0.45), x, y + 20 * s, 6));
  drawOn(P, clamp(p / 0.85), w, rgb, 0.95, 77);
  if (p > 0.9) { ctx.fillStyle = `rgba(${rgb},0.95)`; ctx.beginPath(); ctx.arc(x, y + 66 * s, 11 * s, 0, TAU); ctx.fill(); }
}

// ───────────── baked set pieces ─────────────
// chronicle bundle: a fanned stack of sheets, squiggle rows, tied with a teal pastel band. origin = centre (380, 290)
const chronC = () => cached('bchron', 760, 580, 1, () => {
  const cx = 380, cy = 290;
  ctx.fillStyle = `rgba(${COAL},0.16)`; ctx.beginPath(); ctx.ellipse(cx + 20, cy + 205, 340, 36, 0, 0, TAU); ctx.fill();
  for (let k = 5; k >= 0; k--) { const w = 600 - k * 4, h = 300, rot = (rnd(k + 3) - 0.5) * 0.05;
    ctx.save(); ctx.translate(cx + (rnd(k) - 0.5) * 22, cy + k * 13 - 30); ctx.rotate(rot);
    roughRect(-w / 2, -h / 2, w, h, 3, k + 1); ctx.fillStyle = k ? (k % 2 ? '#B2AC9F' : '#C2BCB0') : '#D3CEC4'; ctx.fill();
    charcoal(rectP(-w / 2, -h / 2, w, h, 24), 1, k ? 3 : 5, COAL, k ? 0.55 : 0.8, 10 + k);
    if (!k) { for (let r = 0; r < 7; r++) squig(-w / 2 + 44, w / 2 - 40, -h / 2 + 46 + r * 35, r + 5, COAL, 0.62, 3, 7);
      ctx.save(); roughRect(-w / 2, -h / 2, w, h, 3, 1); ctx.clip(); hatch(w / 2 - 120, -h / 2, w / 2, h / 2, 10, COAL, 0.12, 2); ctx.restore();
      charcoal(lineP(-w / 2 + 20, -h / 2 + 12, w / 2 - 60, -h / 2 + 10, 20), 1, 4, CHALK, 0.5, 4); }
    ctx.restore(); }
  // teal band wrapped round the stack + a flat bow (pastel, not rope)
  const bx = cx - 150, by0 = cy - 190, by1 = cy + 235;
  ctx.save(); roughRect(bx - 26, by0, 52, by1 - by0, 3, 9); ctx.fillStyle = `rgba(${TEAL},0.92)`; ctx.fill(); ctx.clip(); tooth(bx - 30, by0, bx + 30, by1, 260, 3); hatch(bx - 30, by0, bx + 30, by1, 9, '20,60,60', 0.25, 2); ctx.restore();
  charcoal(lineP(bx - 26, by0, bx - 24, by1, 16), 1, 3, '24,70,70', 0.8, 11); charcoal(lineP(bx + 26, by0, bx + 26, by1, 16), 1, 3, '24,70,70', 0.8, 12);
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(bx, by0 + 60); ctx.beginPath(); ctx.ellipse(s * 52, -26, 54, 30, s * 0.5, 0, TAU); ctx.fillStyle = `rgba(${TEAL},0.9)`; ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 50, -26, 24, 11, s * 0.5, 0, TAU); ctx.fillStyle = 'rgba(30,70,70,0.7)'; ctx.fill(); ctx.restore();
    charcoal(pathP([[bx, by0 + 60], [bx + s * 40, by0 + 120], [bx + s * 70, by0 + 175]], 12), 1, 14, TEAL, 0.95, 20 + s); }
  ctx.beginPath(); ctx.arc(bx, by0 + 58, 18, 0, TAU); ctx.fillStyle = '#2C6866'; ctx.fill();
  charcoal(arcP(bx, by0 + 58, 18, PI, PI * 1.7, 8), 1, 4, CHALK, 0.7, 30);
});
// stone slab (stele): rounded top, hatched grey stone, red pastel edge. origin = bottom centre (320, 880). nicks baked separately.
const SLAB = { x0: 60, x1: 580, top: 40, bot: 880, cy: 300 };
function slabPath() { ctx.beginPath(); ctx.moveTo(SLAB.x0, SLAB.bot); ctx.lineTo(SLAB.x0, SLAB.cy); ctx.arc(320, SLAB.cy, 260, PI, TAU); ctx.lineTo(SLAB.x1, SLAB.bot); ctx.closePath(); }
const slabC = () => cached('bslab', 640, 920, 1, () => {
  ctx.fillStyle = `rgba(${COAL},0.22)`; ctx.beginPath(); ctx.ellipse(340, 890, 320, 26, 0, 0, TAU); ctx.fill();
  slabPath(); ctx.fillStyle = '#8A847A'; ctx.fill();
  ctx.save(); slabPath(); ctx.clip(); tooth(40, 30, 600, 900, 1400, 5);
  hatch(380, 0, 640, 920, 11, COAL, 0.22, 2); hatch(470, 0, 640, 920, 9, COAL, 0.25, 2, -1);
  for (let i = 0; i < 9; i++) charcoal(lineP(70 + rnd(i) * 40, 120 + i * 85, 160 + rnd(i + 3) * 90, 130 + i * 85 + rnd(i + 5) * 20, 6), 1, 3, CHALK, 0.35, 40 + i);
  ctx.fillStyle = `rgba(${COAL},0.12)`; ctx.fillRect(SLAB.x0, 230, 520, 8); ctx.restore();
  charcoal(arcP(320, SLAB.cy, 262, PI, TAU, 36).concat(lineP(582, SLAB.cy, 582, SLAB.bot, 20)), 1, 16, RED, 0.9, 51);
  charcoal(lineP(58, SLAB.bot, 58, SLAB.cy, 20), 1, 16, RED, 0.9, 52);
  charcoal(arcP(320, SLAB.cy, 252, PI, TAU, 36), 1, 5, COAL, 0.75, 53);
  charcoal(lineP(60, SLAB.bot, 580, SLAB.bot, 24), 1, 8, COAL, 0.8, 54);
  charcoal(arcP(320, SLAB.cy, 238, PI * 1.05, PI * 1.45, 12), 1, 5, CHALK, 0.6, 55);
});
const NROWS = 12, nRowY = (r) => 250 + r * 50;
const nicksC = () => cached('bnicks', 640, 920, 1, () => { for (let r = 0; r < NROWS; r++) nicks(110, 535, nRowY(r), r + 3, COAL, 0.82); });

// charcoal sea map card: India (top-left) with Madurai, Lanka (lower right), hatched Palk Strait. 1080 x 960, drawn at y 330
const MAP = { y: 330, mad: [330, 420] };
const INDIA = [[40, 10], [700, 10], [690, 120], [650, 250], [600, 370], [545, 455], [480, 545], [420, 640], [350, 740], [280, 805], [215, 770], [140, 660], [70, 580], [40, 560]];
const LANKA = (() => { const o = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, k = 1 + 0.08 * sin(3 * a + 1) + 0.05 * sin(7 * a); const ry = 220, rx = 150 * (sin(a) < 0 ? 0.78 : 1);
  o.push([725 + cos(a) * rx * k, 720 + sin(a) * ry * k]); } o.push(o[0]); return o; })();
const mapC = () => cached('bmap', 1080, 960, 1, () => {
  roughRect(40, 10, 1000, 940, 4, 61); ctx.fillStyle = 'rgba(207,202,192,0.55)'; ctx.fill();
  ctx.save(); roughRect(40, 10, 1000, 940, 4, 61); ctx.clip(); hatch(0, 0, 1080, 960, 13, COAL, 0.2, 2);
  for (let i = 0; i < 16; i++) squig(560 + rnd(i) * 420, 640 + rnd(i) * 420, 80 + rnd(i + 9) * 860, i + 80, COAL, 0.3, 2, 5); ctx.restore();
  for (const P of [INDIA.concat([INDIA[0]]), LANKA]) {
    roughPoly(P, 3, 7); ctx.fillStyle = '#C9C3B7'; ctx.fill();
    ctx.save(); roughPoly(P, 3, 7); ctx.clip(); tooth(0, 0, 1080, 960, 500, P.length); ctx.restore();
    charcoal(pathP(P, 16), 1, 34, COAL, 0.09, 3); charcoal(pathP(P, 16), 1, 6, COAL, 0.85, P.length); }
  for (let i = 0; i < 12; i++) { const x = 90 + rnd(i * 3) * 420, y = 80 + rnd(i * 5) * 440; if (x > 600 - y * 0.3) continue;
    charcoal([[x - 16, y + 10], [x, y - 8], [x + 16, y + 10]], 1, 3, COAL, 0.5, i); }
  for (let i = 0; i < 4; i++) { const x = 690 + rnd(i) * 60, y = 700 + rnd(i + 2) * 120; charcoal([[x - 14, y + 8], [x, y - 7], [x + 14, y + 8]], 1, 3, COAL, 0.5, i + 20); }
  charcoal(rectP(40, 10, 1000, 940, 30), 1, 5, COAL, 0.6, 62);
  const [mx, my] = MAP.mad; ctx.beginPath(); ctx.arc(mx, my, 13, 0, TAU); ctx.fillStyle = Z.coal; ctx.fill(); charcoal(arcP(mx, my, 26, 0, TAU, 20), 1, 4, COAL, 0.7, 63);
});
// throne: arched back, seat, legs, teal cushion. origin bottom centre (260, 720); seat top y 430
const throneC = () => cached('bthrone', 520, 740, 1, () => {
  ctx.fillStyle = `rgba(${COAL},0.2)`; ctx.beginPath(); ctx.ellipse(270, 722, 250, 22, 0, 0, TAU); ctx.fill();
  const back = [[95, 440], [95, 170], [140, 90], [260, 30], [380, 90], [425, 170], [425, 440]];
  roughPoly(back, 3, 71); ctx.fillStyle = '#4A4540'; ctx.fill();
  ctx.save(); roughPoly(back, 3, 71); ctx.clip(); hatch(80, 20, 440, 450, 9, COAL, 0.5, 3); tooth(80, 20, 440, 450, 300, 7);
  charcoal(pathP([[150, 420], [150, 190], [185, 130], [260, 95], [335, 130], [370, 190], [370, 420]], 16), 1, 5, CHALK, 0.45, 72); ctx.restore();
  charcoal(pathP(back, 16), 1, 7, COAL, 0.9, 73);
  charcoal(arcP(260, 30, 16, 0, TAU, 12), 1, 5, TEAL, 0.9, 74);
  for (const x of [70, 410]) { roughRect(x, 470, 40, 230, 2, x); ctx.fillStyle = '#2E2A26'; ctx.fill(); charcoal(lineP(x + 8, 480, x + 8, 690, 8), 1, 3, CHALK, 0.35, x); }
  roughRect(40, 430, 440, 60, 3, 75); ctx.fillStyle = '#3A3530'; ctx.fill(); charcoal(rectP(40, 430, 440, 60, 22), 1, 6, COAL, 0.9, 76);
  charcoal(lineP(50, 438, 470, 436, 18), 1, 4, CHALK, 0.55, 77);
  for (const x of [30, 450]) { roughRect(x, 330, 40, 110, 2, x + 1); ctx.fillStyle = '#2E2A26'; ctx.fill(); }
  roughRect(80, 405, 360, 34, 6, 78); ctx.fillStyle = `rgba(${TEAL},0.92)`; ctx.fill();
  ctx.save(); roughRect(80, 405, 360, 34, 6, 78); ctx.clip(); tooth(80, 400, 440, 440, 160, 9); ctx.restore();
  roughRect(20, 690, 480, 30, 3, 79); ctx.fillStyle = '#4A4540'; ctx.fill(); charcoal(rectP(20, 690, 480, 30, 22), 1, 5, COAL, 0.85, 80);
});
// boy-prince: small seated crowned faceless silhouette. origin = seat point (110, 300)
const princeC = () => cached('bprince', 220, 330, 1, () => {
  const body = [[72, 140], [148, 140], [168, 230], [160, 300], [60, 300], [52, 230]];
  roughPoly(body, 2, 81); ctx.fillStyle = Z.coal; ctx.fill();
  ctx.save(); roughPoly(body, 2, 81); ctx.clip(); hatch(40, 130, 180, 310, 7, CHALK, 0.12, 2); ctx.restore();
  charcoal(pathP([[78, 150], [150, 290]], 10), 1, 14, TEAL, 0.95, 82);
  for (const x of [80, 128]) { roughRect(x, 296, 22, 30, 2, x); ctx.fillStyle = Z.coal; ctx.fill(); }
  ctx.fillStyle = Z.coal; ctx.fillRect(100, 116, 20, 30);
  ctx.beginPath(); ctx.ellipse(110, 92, 32, 38, 0, 0, TAU); ctx.fillStyle = '#C4BEB2'; ctx.fill(); charcoal(arcP(110, 92, 32, 0, TAU, 24, 38), 1, 4, COAL, 0.85, 83);
  const crown = [[80, 64], [80, 22], [95, 40], [110, 6], [125, 40], [140, 22], [140, 64]];
  roughPoly(crown, 1.5, 84); ctx.fillStyle = Z.coal; ctx.fill(); charcoal(lineP(84, 58, 136, 58, 8), 1, 5, TEAL, 0.95, 85);
  charcoal(lineP(86, 50, 94, 30, 4), 1, 3, CHALK, 0.6, 86);
});
// ship: hatched hull, mast, teal pastel sail. origin = waterline centre (280, 420)
const shipC = () => cached('bship', 560, 500, 1, () => {
  const hull = [[30, 350], [110, 360], [450, 360], [540, 330], [500, 400], [420, 450], [150, 450], [70, 400]];
  roughPoly(hull, 2, 91); ctx.fillStyle = '#3A3530'; ctx.fill();
  ctx.save(); roughPoly(hull, 2, 91); ctx.clip(); hatch(20, 330, 550, 460, 8, COAL, 0.6, 3); ctx.restore();
  charcoal(pathP(hull.concat([hull[0]]), 14), 1, 6, COAL, 0.9, 92); charcoal(lineP(110, 368, 450, 368, 16), 1, 4, CHALK, 0.5, 93);
  charcoal(lineP(280, 360, 282, 40, 16), 1, 9, COAL, 0.95, 94);
  const sail = [[150, 80], [410, 80], [425, 200], [405, 320], [160, 320], [140, 200]];
  roughPoly(sail, 3, 95); ctx.fillStyle = `rgba(${TEAL},0.92)`; ctx.fill();
  ctx.save(); roughPoly(sail, 3, 95); ctx.clip(); tooth(130, 70, 430, 330, 420, 11); hatch(330, 70, 440, 330, 9, '20,60,60', 0.3, 2); ctx.restore();
  charcoal(pathP(sail.concat([sail[0]]), 14), 1, 5, '24,70,70', 0.85, 96); charcoal(lineP(140, 80, 420, 80, 14), 1, 8, COAL, 0.9, 97);
  charcoal(lineP(175, 110, 180, 290, 10), 1, 5, CHALK, 0.55, 98);
  charcoal([[282, 40], [330, 52], [282, 62]], 1, 4, TEAL, 0.9, 99);
  charcoal(lineP(282, 50, 40, 350, 16), 1, 2, COAL, 0.6, 100); charcoal(lineP(282, 50, 530, 335, 16), 1, 2, COAL, 0.6, 101);
});
// sea band: hatched water + wave squiggles, 1300 x 460
const seaC = () => cached('bsea', 1300, 410, 1, () => {
  const g = ctx.createLinearGradient(0, 0, 0, 410); g.addColorStop(0, 'rgba(28,26,24,0.1)'); g.addColorStop(0.8, 'rgba(28,26,24,0.08)'); g.addColorStop(1, 'rgba(28,26,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1300, 410);
  for (let r = 0; r < 26; r++) { const y = 6 + r * r * 0.56; charcoal(lineP(0, y, 1300, y + (rnd(r) - 0.5) * 8, 40), 1, 2 + r * 0.12, COAL, (0.25 + r * 0.012) * (r > 21 ? (26 - r) / 5 : 1), 110 + r); }
  for (let i = 0; i < 40; i++) squig(rnd(i) * 1200, rnd(i) * 1200 + 120, 30 + rnd(i + 4) * 330, i + 120, COAL, 0.35, 2, 4);
  for (let i = 0; i < 10; i++) charcoal(lineP(rnd(i + 30) * 1200, 20 + rnd(i + 40) * 300, rnd(i + 30) * 1200 + 80, 22 + rnd(i + 40) * 300, 6), 1, 3, CHALK, 0.4, 130 + i);
});
// king: tall faceless crowned silhouette, red pastel sash and hem, sceptre. origin feet (280, 1090)
const kingC = () => cached('bking', 560, 1110, 1, () => {
  ctx.fillStyle = `rgba(${COAL},0.2)`; ctx.beginPath(); ctx.ellipse(280, 1090, 230, 20, 0, 0, TAU); ctx.fill();
  const robe = [[190, 250], [370, 250], [420, 330], [440, 560], [480, 1085], [80, 1085], [120, 560], [140, 330]];
  roughPoly(robe, 3, 141); ctx.fillStyle = Z.coal; ctx.fill();
  ctx.save(); roughPoly(robe, 3, 141); ctx.clip(); hatch(60, 240, 500, 1100, 10, CHALK, 0.08, 2); hatch(300, 240, 500, 1100, 12, '0,0,0', 0.3, 3, -1);
  charcoal(pathP([[150, 330], [280, 640], [430, 760]], 16), 1, 30, RED, 0.9, 142);
  roughRect(70, 1000, 420, 60, 4, 143); ctx.fillStyle = `rgba(${RED},0.85)`; ctx.fill(); ctx.restore();
  charcoal(pathP([[140, 330], [120, 560], [82, 1080]], 16), 1, 6, CHALK, 0.5, 144);
  charcoal(lineP(470, 220, 476, 1085, 30), 1, 10, COAL, 0.95, 145);
  ctx.beginPath(); ctx.arc(472, 205, 22, 0, TAU); ctx.fillStyle = Z.coal; ctx.fill(); charcoal(arcP(472, 205, 22, PI, PI * 1.6, 8), 1, 4, RED, 0.9, 146);
  roughRect(410, 420, 80, 50, 4, 147); ctx.fillStyle = Z.coal; ctx.fill();
  ctx.fillStyle = Z.coal; ctx.fillRect(255, 220, 50, 40);
  ctx.beginPath(); ctx.ellipse(280, 170, 56, 70, 0, 0, TAU); ctx.fillStyle = '#BDB7AB'; ctx.fill(); charcoal(arcP(280, 170, 56, 0, TAU, 28, 70), 1, 6, COAL, 0.85, 148);
  ctx.save(); ctx.beginPath(); ctx.ellipse(280, 170, 56, 70, 0, 0, TAU); ctx.clip(); hatch(290, 90, 360, 250, 8, COAL, 0.25, 2); ctx.restore();
  const crown = [[222, 118], [218, 40], [248, 70], [280, 0], [312, 70], [342, 40], [338, 118]];
  roughPoly(crown, 2, 149); ctx.fillStyle = Z.coal; ctx.fill(); charcoal(lineP(226, 108, 334, 108, 12), 1, 8, RED, 0.95, 150);
  charcoal(lineP(232, 98, 244, 60, 6), 1, 4, CHALK, 0.6, 151);
});
// spearman: small faceless silhouette, spear, red pastel round shield. two leg poses. origin feet (55, 290)
const spearC = (k) => cached('bspear' + k, 120, 300, 1, () => {
  ctx.fillStyle = `rgba(${COAL},0.2)`; ctx.beginPath(); ctx.ellipse(55, 292, 34, 6, 0, 0, TAU); ctx.fill();
  charcoal(lineP(84, 8, 84, 280, 10), 1, 4, COAL, 0.95, 161);
  ctx.beginPath(); ctx.moveTo(84, 0); ctx.lineTo(92, 30); ctx.lineTo(76, 30); ctx.closePath(); ctx.fillStyle = Z.coal; ctx.fill();
  ctx.beginPath(); ctx.ellipse(55, 92, 15, 18, 0, 0, TAU); ctx.fillStyle = Z.coal; ctx.fill();
  roughPoly([[38, 114], [72, 114], [78, 200], [32, 200]], 1.5, 162); ctx.fillStyle = Z.coal; ctx.fill();
  const lg = k ? [[[44, 198], [34, 288]], [[66, 198], [78, 288]]] : [[[44, 198], [50, 288]], [[66, 198], [62, 288]]];
  for (const [a, b] of lg) charcoal(lineP(a[0], a[1], b[0], b[1], 6), 1, 10, COAL, 0.95, 163 + k);
  ctx.beginPath(); ctx.arc(40, 160, 28, 0, TAU); ctx.fillStyle = `rgba(${RED},0.95)`; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(40, 160, 28, 0, TAU); ctx.clip(); tooth(10, 130, 70, 190, 60, 13); ctx.restore();
  charcoal(arcP(40, 160, 28, 0, TAU, 18), 1, 4, COAL, 0.85, 164); ctx.beginPath(); ctx.arc(40, 160, 6, 0, TAU); ctx.fillStyle = Z.coal; ctx.fill();
});
// gate of Madurai: towers, dark recess, studded doors, lintel, row of 9 iron spikes. origin bottom centre (450, 1220)
const SPX = (i) => 190 + 65 * i, SPB = 300, SPT = 118, EMPTY = [3, 5];
const gateC = () => cached('bgate', 900, 1230, 1, () => {
  for (const [x0, x1] of [[0, 195], [705, 900]]) {
    roughRect(x0, 210, x1 - x0, 1010, 3, x0 + 1); ctx.fillStyle = '#6E685E'; ctx.fill();
    ctx.save(); roughRect(x0, 210, x1 - x0, 1010, 3, x0 + 1); ctx.clip(); tooth(x0, 210, x1, 1220, 500, x0 + 3);
    for (let r = 0; r < 17; r++) { const y = 260 + r * 58; charcoal(lineP(x0, y, x1, y + 2, 10), 1, 3, COAL, 0.55, r + x0);
      for (let c = 0; c < 3; c++) { const x = x0 + ((c + (r % 2) * 0.5) * 80) % (x1 - x0); charcoal(lineP(x, y, x, y + 58, 3), 1, 3, COAL, 0.5, r * 3 + c + x0); } }
    hatch(x0 < 100 ? x0 + 120 : x0, 200, x0 < 100 ? x1 : x0 + 70, 1230, 9, COAL, 0.3, 2); ctx.restore();
    for (let m = 0; m < 3; m++) { const mx = x0 + 10 + m * 65; roughRect(mx, 160, 46, 56, 2, mx); ctx.fillStyle = '#6E685E'; ctx.fill(); charcoal(rectP(mx, 160, 46, 56, 14), 1, 4, COAL, 0.8, mx); }
    charcoal(rectP(x0, 210, x1 - x0, 1010, 30), 1, 6, COAL, 0.85, x0 + 7);
  }
  roughRect(195, 380, 510, 840, 2, 171); ctx.fillStyle = 'rgba(28,26,24,0.9)'; ctx.fill();
  for (const [x0, x1] of [[212, 446], [454, 688]]) {
    roughRect(x0, 400, x1 - x0, 815, 2, x0); ctx.fillStyle = '#4A443D'; ctx.fill();
    ctx.save(); roughRect(x0, 400, x1 - x0, 815, 2, x0); ctx.clip();
    for (let x = x0 + 34; x < x1; x += 34) charcoal(lineP(x, 400, x + 2, 1215, 20), 1, 3, COAL, 0.7, x);
    for (let x = x0 + 12; x < x1; x += 34) charcoal(lineP(x, 410, x, 1200, 20), 1, 2, CHALK, 0.18, x + 1);
    hatch(x0, 400, x1, 1215, 12, COAL, 0.25, 2, x0 < 400 ? 1 : -1); ctx.restore();
    for (const y of [520, 800, 1080]) { ctx.fillStyle = '#26221F'; ctx.fillRect(x0, y - 14, x1 - x0, 28);
      for (let x = x0 + 22; x < x1 - 10; x += 40) { ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fillStyle = '#141210'; ctx.fill(); ctx.fillStyle = `rgba(${CHALK},0.7)`; ctx.fillRect(x - 4, y - 5, 3, 3); } }
    charcoal(rectP(x0, 400, x1 - x0, 815, 26), 1, 5, COAL, 0.9, x0 + 9);
  }
  roughRect(140, 300, 620, 88, 2, 172); ctx.fillStyle = '#26221F'; ctx.fill(); charcoal(lineP(146, 306, 754, 304, 24), 1, 4, CHALK, 0.55, 173);
  charcoal(rectP(140, 300, 620, 88, 26), 1, 6, COAL, 0.9, 174);
  for (let i = 0; i < 9; i++) { const x = SPX(i); ctx.beginPath(); ctx.moveTo(x - 10, SPB); ctx.lineTo(x - 4, SPT + 24); ctx.lineTo(x, SPT); ctx.lineTo(x + 4, SPT + 24); ctx.lineTo(x + 10, SPB); ctx.closePath();
    ctx.fillStyle = '#1A1816'; ctx.fill(); charcoal(lineP(x - 5, SPB - 6, x - 2, SPT + 20, 6), 1, 2, CHALK, 0.6, 180 + i); }
  charcoal(lineP(-20, 1220, 920, 1222, 40), 1, 10, COAL, 0.8, 175);
});
const gS = (X, Y, s) => (lx, ly) => [X + (lx - 450) * s, Y + (ly - 1220) * s];
function spikeRed(T, s, p, seed) { // red pastel outline around an empty spike, in screen space via T
  const x = SPX(seed), P = [[x - 24, SPB + 4], [x - 12, SPT + 24], [x, SPT - 22], [x + 12, SPT + 24], [x + 24, SPB + 4]].map(([a, b]) => T(a, b));
  drawOn(pathP(P, 8), p, 7, RED, 0.95, 190 + seed);
}
// fallen helmet: conical iron helmet with brim, chalk glints, red pastel band. origin centre (190, 170)
const helmC = () => cached('bhelm', 380, 300, 1, () => {
  ctx.beginPath(); ctx.moveTo(70, 200); ctx.quadraticCurveTo(80, 70, 190, 30); ctx.quadraticCurveTo(300, 70, 310, 200); ctx.closePath(); ctx.fillStyle = '#5A554D'; ctx.fill();
  ctx.save(); ctx.clip(); hatch(180, 20, 320, 210, 8, COAL, 0.55, 2); tooth(60, 20, 320, 210, 260, 17); ctx.restore();
  charcoal(pathP([[70, 200], [95, 110], [190, 30], [285, 110], [310, 200]], 10), 1, 5, COAL, 0.9, 201);
  charcoal(pathP([[110, 180], [120, 110], [180, 60]], 10), 1, 6, CHALK, 0.7, 202);
  charcoal(lineP(190, 30, 190, 4, 4), 1, 8, COAL, 0.95, 203);
  roughRect(50, 192, 280, 36, 3, 204); ctx.fillStyle = '#2E2A26'; ctx.fill(); charcoal(lineP(56, 204, 324, 204, 14), 1, 7, RED, 0.9, 205);
  charcoal(rectP(50, 192, 280, 36, 20), 1, 4, COAL, 0.9, 206);
});

// ═════════════════════════ SHOTS ═════════════════════════
export function buildB(add, cue) {
  const Wn = (w, line, n) => lineWords(line).filter((x) => x.w.toLowerCase().replace(/[^a-z']/g, '').startsWith(w))[n].s;
  const t1 = L(4), t2 = Wd('says', 4), t3 = Wd('put', 4), t4 = Wd('and', 4), t5 = L(5), t6 = Wd('tell', 5), t7 = L(6), t8 = Wd('second', 6), t9 = Wd('heads', 6), t10 = Wd('nailed', 6), tEnd = L(7);
  const hedge4 = (lt, first = false, a = 1) => tag('CULAVAMSA SAYS', 540, 248, 34, { box: true, u: TEAL, sc: first ? 0.6 + 0.4 * pop(lt, 0, 0.25) : 1, a });
  const hedge6 = (lt, y = 248) => tag('INSCRIPTIONS SAY', 540, y, 34, { box: true, u: RED, sc: 1, a: 1 });

  // b1 — LANKA'S RECORD: chronicle bundle smudged on
  add({ id: 'b1', at: t1, zoom: 0.08, cam: [540, 760], note: "LANKA'S RECORD header, teal-tied chronicle bundle smudge-revealed, CULAVAMSA SAYS",
    draw(lt, d) {
      bg(-lt * 10, 0, TEAL, 0.06); edge(26, TEAL); edge(1048, TEAL, 0.4);
      header("LANKA'S RECORD", 540, 150, TEAL, 0.15 + 0.85 * seg(lt, 0, 0.4));
      const p = 0.12 + 0.88 * eo(seg(lt, 0, 0.9)), X = 540 + lt * 8, Y = 770;
      ctx.save(); const fx = wipeX(80, 1020, 380, 1150, p, 3); blit(chronC(), 380, 290, X, Y, 1.18); ctx.restore();
      if (p > 0 && p < 1) { smear(fx, 380, fx + 30, 1150, 80, 0.1); specks(fx - 40, fx + 40, 1000, lt, 16, 4, 260); }
      // the stick redraws the top edge, then chalk scribbles a highlight
      drawOn(lineP(X - 330, Y - 210, X + 330, Y - 215, 30), seg(lt, 0.9, 1.5), 6, COAL, 0.8, 9);
      drawOn(pathP([[X - 300, Y + 230], [X + 320, Y + 236]], 16), seg(lt, 1.2, 1.8), 10, TEAL, 0.8, 10);
      specks(200, 900, 1180, lt, 10, 8, 120);
      hedge4(lt, true);
      burst(X - 170, Y - 130, lt - 1.1, 180, 5, 30);
    } });
  cue(t1, 'whoosh', { gain: 0.5 }); cue(t1 + 0.05, 'tock', { gain: 0.5 }); cue(t1 + 0.15, 'slide', { gain: 0.35 }); cue(t1 + 1.1, 'pop', { gain: 0.4 });

  // b2 — battle after battle: teal arrows push across the charcoal map to Madurai
  const tw = Wd('won', 4), tb1 = Wn('battle', 4, 0), tb2 = Wn('battle', 4, 1);
  const ARW = [[[610, 640], [500, 575]], [[500, 575], [405, 500]], [[405, 500], [345, 440]]], HITS = [tw, tb1, tb2];
  add({ id: 'b2', at: t2, zoom: 0.1, cam: [430, 780], note: 'charcoal sea map, teal arrows battle by battle to MADURAI, X marks + dust, tally, VICTORY',
    draw(lt, d, t) {
      bg(lt * 12, 0, TEAL, 0.06); edge(26, TEAL);
      header("LANKA'S RECORD", 540, 150, TEAL); hedge4(lt);
      const ms = 0.94, dx = 40 - lt * 14, oy = MAP.y; blit(mapC(), 0, 0, dx, oy, ms);
      const M = (x, y) => [dx + x * ms, oy + y * ms];
      // landing beach dot + start
      const L0 = M(610, 640); ctx.fillStyle = `rgba(${TEAL},0.95)`; ctx.beginPath(); ctx.arc(L0[0], L0[1], 12, 0, TAU); ctx.fill();
      ARW.forEach(([a, b], i) => {
        const p = seg(t, HITS[i] - 0.12, HITS[i] + 0.25); if (p <= 0) return;
        const A = M(...a), B = M(...b), an = Math.atan2(B[1] - A[1], B[0] - A[0]), Bs = [B[0] - cos(an) * 30, B[1] - sin(an) * 30];
        drawOn(lineP(A[0], A[1], Bs[0], Bs[1], 14), p, 11, TEAL, 0.95, 30 + i);
        if (p >= 1) { ctx.beginPath(); ctx.moveTo(B[0] + cos(an) * 8, B[1] + sin(an) * 8); ctx.lineTo(B[0] - cos(an - 0.5) * 50, B[1] - sin(an - 0.5) * 50); ctx.lineTo(B[0] - cos(an + 0.5) * 50, B[1] - sin(an + 0.5) * 50); ctx.closePath(); ctx.fillStyle = `rgba(${TEAL},0.95)`; ctx.fill();
          const px = (A[0] + B[0]) / 2, py = (A[1] + B[1]) / 2 + 40, q = seg(t, HITS[i] + 0.2, HITS[i] + 0.4);
          charcoal(lineP(px - 22, py - 22, px + 22, py + 22, 6), q, 7, COAL, 0.9, 50 + i); charcoal(lineP(px + 22, py - 22, px - 22, py + 22, 6), q, 7, COAL, 0.9, 60 + i); }
        burst(B[0], B[1], t - HITS[i] - 0.2, 150, 11 + i, 26);
      });
      // tally on an erased patch in the open sea (eraser streak first)
      const ex = dx + 760, ey = oy + 160, ep = eo(seg(lt, 0.05, 0.4));
      if (ep > 0) { ctx.save(); ctx.beginPath(); ctx.rect(ex - 150, ey - 90, 300 * ep, 180); ctx.clip(); roughRect(ex - 140, ey - 75, 280, 150, 8, 70); ctx.fillStyle = 'rgba(214,209,199,0.95)'; ctx.fill(); ctx.restore();
        for (let i = 0; i < 6; i++) { const cx = ex - 150 + 300 * ep - rnd(i) * 40; ctx.fillStyle = `rgba(${LIGHT},0.8)`; ctx.fillRect(cx, ey - 70 + rnd(i + 5) * 150 + lt * 20, 5, 4); } }
      const nT = HITS.filter((h) => t > h).length + (t > tb2 + 0.25 ? 1 : 0) + (t > tb2 + 0.42 ? 1 : 0);
      for (let i = 0; i < Math.min(4, nT); i++) charcoal(lineP(ex - 90 + i * 34, ey - 50, ex - 96 + i * 34, ey + 50, 8), 1, 11, TEAL, 0.95, 80 + i);
      if (nT >= 5) drawOn(lineP(ex - 120, ey + 40, ex + 40, ey - 40, 10), seg(t, tb2 + 0.42, tb2 + 0.55), 10, TEAL, 0.95, 85);
      const [mx, my] = M(...MAP.mad); tag('MADURAI', mx, my - 56, 38, { u: COAL, sc: pop(lt, 0.2) });
      tag('VICTORY', mx - 60, my + 180, 60, { u: TEAL, sc: pop(t, tb2 + 0.35, 0.35), rot: -0.05 });
    } });
  cue(t2, 'slide', { gain: 0.4 }); HITS.forEach((h, i) => { cue(h, 'drum', { gain: 0.55 }); cue(h + 0.2, 'thud', { gain: 0.45 + i * 0.05 }); }); cue(tb2 + 0.35, 'pop', { gain: 0.45 });

  // b3 — the dead prince's son is set on the throne
  const tson = Wd('son', 4), tthr = Wd('throne', 4);
  add({ id: 'b3', at: t3, zoom: 0.09, cam: [540, 760], note: 'charcoal throne, small crowned faceless boy-prince lowered onto it, teal halo, ILLUSTRATION',
    draw(lt, d, t) {
      bg(0, -lt * 10, TEAL, 0.06); edge(26, TEAL);
      header("LANKA'S RECORD", 540, 150, TEAL); hedge4(lt);
      const X = 540, Y = 1240, s = 1.2, p = eio(seg(lt, 0, 0.8));
      ctx.save(); wipeYup(120, 960, 330, 1260, p, 7); blit(throneC(), 260, 720, X, Y, s); ctx.restore();
      if (p < 1) smear(160, lerp(1250, 330, p), 920, lerp(1250, 330, p) + 10, 70, 0.08);
      const seatY = Y + (430 - 720) * s + 8, land = eob(seg(t, tson - 0.35, tthr + 0.05));
      // teal halo scribbles on after landing
      drawOn(arcP(X, seatY - 300, 150, -PI * 0.6, PI * 1.4, 40), seg(t, tthr, tthr + 0.6), 10, TEAL, 0.75, 21);
      const py = lerp(seatY - 520, seatY, land), pa = seg(t, tson - 0.4, tson - 0.2);
      if (pa > 0) { blit(princeC(), 110, 300, X, py, 1.25, pa);
        if (land < 0.98) specks(X - 80, X + 80, py, lt, 10, 9, 160); }
      burst(X, seatY, t - tthr - 0.02, 230, 23, 34);
      tag('ILLUSTRATION', 900, 330, 24, { col: 'coal', a: 0.85 });
    } });
  cue(t3, 'whoosh', { gain: 0.45 }); cue(tthr, 'thud', { gain: 0.6 }); cue(tthr + 0.05, 'sparkle', { gain: 0.3 });

  // b4 — sails home a HERO
  const thero = Wd('hero', 4);
  add({ id: 'b4', at: t4, zoom: 0.07, cam: [540, 900], note: 'hatched sea, teal-sailed ship sails home on a dotted route to Lanka hills, HERO slams with chalk-dust burst',
    draw(lt, d, t) {
      bg(-lt * 12, 0, TEAL, 0.06); edge(26, TEAL);
      header("LANKA'S RECORD", 540, 150, TEAL); hedge4(lt);
      for (let i = 0; i < 3; i++) smear(120 + i * 300 - lt * 20, 420 + i * 60, 360 + i * 300 - lt * 20, 400 + i * 60, 50, 0.06);
      charcoal(arcP(860, 640, 60, 0, TAU, 26), 1, 6, CHALK, 0.6, 3);
      const hor = 900; blit(seaC(), 0, 0, -100 - lt * 30, hor, 1);
      charcoal(lineP(0, hor, 1080, hor, 40), 1, 5, COAL, 0.7, 4);
      // Lanka hills at the right horizon
      ctx.beginPath(); ctx.moveTo(760, hor + 2); ctx.quadraticCurveTo(840, hor - 70, 930, hor - 30); ctx.quadraticCurveTo(1000, hor - 80, 1100, hor - 40); ctx.lineTo(1100, hor + 2); ctx.closePath(); ctx.fillStyle = 'rgba(28,26,24,0.55)'; ctx.fill();
      tag('LANKA', 940, hor - 120, 34, { u: TEAL, a: 0.9 });
      const sx = lerp(240, 600, eio(clamp(lt / d))), sy = hor + 150 + sin(lt * 3) * 8, rot = sin(lt * 2.4) * 0.04;
      for (let x = 60; x < sx - 230; x += 34) { ctx.fillStyle = `rgba(${TEAL},0.9)`; ctx.beginPath(); ctx.arc(x, hor + 200 + sin(x * 0.02) * 10, 6, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(rot); blit(shipC(), 280, 420, 0, 0, 0.9); ctx.restore();
      for (let i = 0; i < 4; i++) { const wx = sx - 220 - i * 60 + ((lt * 60) % 60); charcoal(lineP(wx, sy + 20 + i * 8, wx + 50, sy + 24 + i * 8, 6), 1, 4, CHALK, 0.5, 5 + i); }
      const hp = pop(t, thero, 0.35); tag('HERO', 540, 560, 150, { u: TEAL, sc: hp ? 0.6 + hp * 0.4 : 0, a: hp ? 1 : 0 });
      burst(540, 560, t - thero, 360, 31, 60); burst(sx, sy - 200, t - thero - 0.1, 200, 37, 30);
    } });
  cue(t4, 'whoosh', { gain: 0.45 }); cue(thero, 'slam', { gain: 0.75 }); cue(thero + 0.03, 'sparkle', { gain: 0.4 });

  // ── diptych machinery: torn seam at x, teal side left, red side right ──
  const seamPts = (x) => { const o = []; for (let i = 0; i <= 90; i++) o.push([x + (rnd(i * 3.7) - 0.5) * 26 + sin(i * 0.7) * 6, -200 + i * 26]); return o; };
  function redSide(sx, fn) { const P = seamPts(sx); ctx.save(); ctx.beginPath(); ctx.moveTo(W + 400, -200); P.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(W + 400, 2200); ctx.closePath(); ctx.clip(); fn(); ctx.restore(); }
  function seam(sx, rip = 1) {
    const P = seamPts(sx), n = Math.floor(P.length * rip); if (n < 2) return; const Pn = P.slice(0, n);
    charcoal(Pn.map(([x, y]) => [x + 8, y]), 1, 10, COAL, 0.35, 301); charcoal(Pn.map(([x, y]) => [x - 2, y]), 1, 5, CHALK, 0.95, 302);
    for (let i = 0; i < n; i += 3) { const [x, y] = P[i]; ctx.strokeStyle = `rgba(${CHALK},0.7)`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.lineTo(x - 2 - rnd(i) * 14, y + (rnd(i + 1) - 0.5) * 12); ctx.stroke(); }
  }
  const redPaper = (dx = 0) => { blit(paperImg(), 540, 960, 540 + dx, 940, 1.07); ctx.fillStyle = `rgba(${RED},0.09)`; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.fillStyle = 'rgba(28,26,24,0.05)'; ctx.fillRect(-300, -300, W + 600, H + 600); };

  // b5 — DIPTYCH SPLIT: CHOLA RECORD rips in and pushes LANKA'S RECORD
  const tch = Wd('chola', 5), tst = Wd('stone', 5);
  add({ id: 'b5', at: t5, zoom: 0.05, cam: [540, 760], note: 'DIPTYCH SPLIT: torn seam rips, red CHOLA RECORD panel + stone slab slides in and pushes the teal chronicle side',
    draw(lt, d, t) {
      const r = seg(t, tch - 0.05, tch + 0.4), sx = lerp(1150, 560, eo(r)) - 70 * eio(seg(t, tch + 0.45, t6));
      const lw = sx, lc = lw / 2, ls = lerp(0.85, 0.62, eo(r));
      bg(-lt * 10, 0, TEAL, 0.06); edge(26, TEAL);
      header("LANKA'S RECORD", r > 0 ? lc : 540, 150, TEAL, 1, r > 0.5 ? 40 : 52);
      blit(chronC(), 380, 290, lerp(540, lc, eo(r)), 760, ls);
      if (r < 0.5) hedge4(lt, false, 1 - r * 2);
      tag('LANKA', lerp(540, lc, eo(r)), 1050, 40, { u: TEAL, a: r });
      if (r > 0) {
        redSide(sx, () => { redPaper(30 - lt * 10); edge(1050, RED);
          const rc = (sx + 1080) / 2, slide = eo(seg(t, tch + 0.05, tst + 0.15));
          header('CHOLA RECORD', rc, 150, RED, seg(t, tch + 0.15, tch + 0.5), 40);
          blit(slabC(), 320, 880, rc + (1 - slide) * 500, 1090, 0.6); blit(nicksC(), 320, 880, rc + (1 - slide) * 500, 1090, 0.6);
          specks(rc - 150, rc + 150, 1100, lt, 10, 12, 120);
          burst(rc - 180, 1060, t - tst - 0.15, 160, 41, 24);
        });
        seam(sx, clamp(r * 2.2));
        burst(sx, 400 + r * 700, r < 1 ? 0.2 : t - tch - 0.4, 120, 43, 18);
      }
    } });
  cue(t5, 'whoosh', { gain: 0.35 }); cue(tch, 'zip', { gain: 0.7 }); cue(tch + 0.05, 'slide', { gain: 0.5 }); cue(tst + 0.15, 'thud', { gain: 0.65 });

  // b6 — the stone slab: chisel nicks cut in row by row
  const tdiff = Wd('different', 5);
  add({ id: 'b6', at: t6, zoom: 0.08, cam: [600, 760], note: 'close on red-edged stone slab, chisel nicks cut row by row with red sparks, STONE INSCRIPTIONS, teal sliver pushed out',
    draw(lt, d, t) {
      const sx = lerp(170, 90, eio(clamp(lt / d)));
      bg(0, 0, TEAL, 0.06); blit(chronC(), 380, 290, sx / 2 - 120, 760, 0.6);
      redSide(sx, () => { redPaper(-lt * 12); edge(1050, RED);
        header('CHOLA RECORD', 600, 150, RED, 1, 48);
        tag('STONE INSCRIPTIONS', 600, 252, 40, { u: RED, sc: pop(lt, 0.05) });
        const X = 620, Y = 1260, s = 1.0, rows = NROWS * eio(seg(lt, 0.1, d - 0.2)), nr = Math.floor(rows);
        blit(slabC(), 320, 880, X, Y, s);
        const top = Y + (nRowY(0) - 30 - 880) * s, cut = Y + (nRowY(nr) - 25 - 880) * s, fr = rows - nr;
        ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, cut - top); ctx.rect(X + (110 - 320) * s, cut, (430 * fr) * s, 50 * s); ctx.clip(); blit(nicksC(), 320, 880, X, Y, s); ctx.restore();
        if (nr < NROWS) { const cx = X + (110 - 320 + 430 * fr) * s, cy = cut + 25 * s;
          charcoal(lineP(cx + 6, cy - 4, cx + 70, cy - 90, 8), 1, 10, COAL, 0.9, 61);
          for (let i = 0; i < 8; i++) { const a = -PI * 0.2 - rnd(i + Math.floor(lt * 12)) * PI * 0.6, r = 10 + rnd(i * 3 + Math.floor(lt * 12)) * 40; ctx.fillStyle = `rgba(${RED},0.9)`; ctx.fillRect(cx + cos(a) * r, cy + sin(a) * r, 4, 4); }
          specks(cx - 20, cx + 20, cy, lt, 6, 13, 150); }
        // "a different ending": red pastel scribble ring round the last rows
        drawOn(arcP(X, Y - 150 * s, 250, -PI * 0.1, PI * 1.9, 40, 90), seg(t, tdiff, tdiff + 0.5), 9, RED, 0.85, 62);
      });
      seam(sx);
    } });
  cue(t6, 'slide', { gain: 0.35 }); for (let i = 0; i < 4; i++) cue(t6 + 0.2 + i * 0.38, 'chisel', { gain: 0.4 });

  // b7 — RAJADHIRAJA II, faceless crowned silhouette (red pastel)
  const traj = Wd('rajadhiraja', 6);
  add({ id: 'b7', at: t7, zoom: 0.1, cam: [540, 700], note: 'RAJADHIRAJA II faceless crowned silhouette smudged up from the floor, red pastel aura, ILLUSTRATION, INSCRIPTIONS SAY',
    draw(lt, d, t) {
      ctx.fillStyle = Z.wall; ctx.fillRect(-300, -300, W + 600, H + 600); redPaper(lt * 10); edge(28, RED); edge(1050, RED);
      header('CHOLA RECORD', 540, 150, RED); hedge6(lt);
      for (let i = 0; i < 3; i++) drawOn(arcP(540, 760, 300 + i * 50, PI * (1.05 + i * 0.1) + lt * 0.12, PI * (1.95 - i * 0.05) + lt * 0.12, 30), seg(lt, 0.3 + i * 0.12, 0.9 + i * 0.12), 12 - i * 2, RED, 0.7 - i * 0.12, 70 + i);
      const X = 540, Y = 1195, s = 0.78, p = eio(seg(lt, 0, 0.75));
      ctx.save(); const fy = wipeYup(200, 880, 320, 1270, p, 11); blit(kingC(), 280, 1090, X, Y, s); ctx.restore();
      if (p < 1) { smear(220, fy, 860, fy + 10, 80, 0.1); specks(260, 820, fy, lt, 14, 15, 200); }
      tag('ILLUSTRATION', 900, 330, 24, { a: 0.85 });
      const lp = pop(t, traj + 0.1, 0.35); tag('RAJADHIRAJA II', 540, 1238, 54, { u: RED, sc: lp ? 0.7 + 0.3 * lp : 0, a: lp ? 1 : 0 });
      burst(540, 1238, t - traj - 0.1, 220, 71, 30);
    } });
  cue(t7, 'rumble', { gain: 0.45 }); cue(t7 + 0.05, 'whoosh', { gain: 0.4 }); cue(traj + 0.1, 'slam', { gain: 0.55 });

  // b8 — rows of red spearmen marching
  add({ id: 'b8', at: t8, zoom: 0.12, cam: [600, 820], note: 'three rows of small faceless red-shielded spearmen march right, forest of spears, dust',
    draw(lt, d) {
      ctx.fillStyle = Z.wall; ctx.fillRect(-300, -300, W + 600, H + 600); redPaper(-lt * 14); edge(28, RED);
      header('CHOLA RECORD', 540, 150, RED); hedge6(lt);
      smear(-50, 690, 1130, 700, 40, 0.06);
      const ROWS = [[690, 0.62, 0.55], [905, 0.82, 0.8], [1170, 1.02, 1]];
      ROWS.forEach(([y, s, a], r) => { const gap = 120 * s, off = (lt * 150 * s + r * 37) % gap, n = Math.ceil(1200 / gap) + 2;
        charcoal(lineP(-40, y + 4, 1120, y + 6, 30), 1, 6 * s, COAL, 0.5 * a, 90 + r);
        for (let i = -1; i < n; i++) { const x = i * gap + off - 40, k = (Math.floor((lt * 4 + i + r) % 2) + 2) % 2, bob = sin(lt * 12 + i + r) * 3 * s;
          blit(spearC(k), 55, 290, x, y + bob, s, a); }
        for (let i = 0; i < 6; i++) { const ph = (lt * 0.9 + i / 6 + r * 0.3) % 1; ctx.fillStyle = `rgba(${COAL},${0.12 * (1 - ph) * a})`; ctx.beginPath(); ctx.arc((i * 211 + r * 90 + lt * 80) % 1150 - 40, y - ph * 40, 18 + ph * 40 * s, 0, TAU); ctx.fill(); }
      });
      drawOn(pathP([[60, 1225], [520, 1218], [1010, 1225]], 20), seg(lt, 0.2, 1.2), 12, RED, 0.8, 99);
    } });
  cue(t8, 'whoosh', { gain: 0.4 }); for (let i = 0; i < 4; i++) cue(t8 + 0.15 + i * 0.45, 'drum', { gain: 0.5 });

  // b9 — the gate of Madurai: crows lift, two empty spikes outlined in red
  const tlp = Wd('lankapura', 6), tgen = Wd('general', 6);
  add({ id: 'b9', at: t9, zoom: 0.15, cam: [540, 700], note: 'Madurai gate, push to spike row, crows lift off, two EMPTY spikes outlined in red pastel, MADURAI on lintel',
    draw(lt, d, t) {
      ctx.fillStyle = Z.wall; ctx.fillRect(-300, -300, W + 600, H + 600); redPaper(0);
      hedge6(lt, 150);
      const s = 0.78, X = 540, Y = 1180 + lt * 8, T = gS(X, Y, s);
      blit(gateC(), 450, 1220, X, Y, s);
      smear(-40, 330, 160, 300, 50, 0.08); smear(930, 310, 1140, 330, 50, 0.08);
      const [lx, ly] = T(450, 344); tag('MADURAI', lx, ly, 40, { col: 'chalk', sc: pop(lt, 0.15) });
      spikeRed(T, s, eo(seg(t, tlp - 0.05, tlp + 0.35)), EMPTY[0]); spikeRed(T, s, eo(seg(t, tgen - 0.05, tgen + 0.35)), EMPTY[1]);
      for (const [i, tt] of [[EMPTY[0], tlp], [EMPTY[1], tgen]]) { const [bx, by] = T(SPX(i), SPT); burst(bx, by, t - tt - 0.3, 110, 80 + i, 20); }
      // crows perched on the lintel lift off and scatter
      for (let i = 0; i < 6; i++) { const [cx0, cy0] = T(200 + i * 100 + (i % 2) * 20, 290), go = lt - 0.25 - i * 0.07;
        if (go <= 0) crow(cx0, cy0, 0.85, 0, 1, i % 2 ? -1 : 1);
        else { const u = go, dir = i < 3 ? -1 : 1; crow(cx0 + dir * u * (260 + i * 30), cy0 - u * (380 + rnd(i) * 200) + u * u * 40, 0.85 + u * 0.15, u * 22 + i, 0, dir); } }
    } });
  cue(t9, 'slam', { gain: 0.55 }); cue(t9 + 0.3, 'whoosh', { gain: 0.5 }); cue(tlp + 0.1, 'chisel', { gain: 0.45 }); cue(tgen + 0.1, 'chisel', { gain: 0.45 });

  // b10 — NAILED TO THE GATES: fallen helmet, red question mark
  const tmad = Wd('madurai', 6);
  add({ id: 'b10', at: t10, zoom: 0.08, cam: [640, 860], note: 'gate small at left with red-outlined empty spikes, fallen helmet tumbles to a stop, NAILED TO THE GATES, red question mark',
    draw(lt, d, t) {
      ctx.fillStyle = Z.wall; ctx.fillRect(-300, -300, W + 600, H + 600); redPaper(lt * 10);
      hedge6(lt, 150);
      const s = 0.6, X = 400 - lt * 10, Y = 1190, T = gS(X, Y, s);
      blit(gateC(), 450, 1220, X, Y, s); spikeRed(T, s, 1, EMPTY[0]); spikeRed(T, s, 1, EMPTY[1]);
      charcoal(lineP(-40, 1196, 1120, 1200, 40), 1, 8, COAL, 0.7, 401);
      const lp = pop(lt, 0.03, 0.3); tag('NAILED TO THE GATES', 540, 262, 62, { u: RED, sc: lp ? 0.7 + 0.3 * lp : 0, a: lp ? 1 : 0 });
      burst(540, 262, lt - 0.03, 300, 91, 40);
      // helmet tumbles in from the right and settles on its side
      const hp = eo(seg(lt, 0.15, 1.0)), hx = lerp(1180, 850, hp), hrot = lerp(-6.6, -0.42, hp), hy = 1110 - Math.abs(sin(hp * PI * 2.2)) * 60 * (1 - hp);
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(hrot); blit(helmC(), 190, 170, 0, 0, 0.75); ctx.restore();
      if (hp > 0.98) drawOn(arcP(hx, hy + 10, 150, -PI * 0.2, PI * 1.75, 36, 100), seg(lt, 1.05, 1.5), 8, RED, 0.85, 402);
      specks(hx - 60, hx + 60, hy + 40, lt, 8, 17, 50);
      qmark(860, 760, 1.3, seg(t, tmad, tmad + 0.5), RED, 18);
      const cu = lt * 0.6; crow(1150 - cu * 900, 520 - sin(cu * 3) * 40, 0.8, lt * 20, 0, -1);
    } });
  cue(t10, 'slam', { gain: 0.8 }); cue(t10 + 0.85, 'thud', { gain: 0.55 }); cue(tmad + 0.05, 'sizzle', { gain: 0.35 }); cue(tEnd - 0.3, 'whoosh', { gain: 0.3 });
}
