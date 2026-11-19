// Chola Chronicle: the COMPONENT ZOO. Epic Tamil history lit like a painting: oil lamps, palm-leaf manuscripts, carved
// gopurams, dragon-prow warships, bronze and gold heroes, and sunken temple cities under god rays.
// Flat painted shapes + ONE kind of gradient: light (lamp glow, sun, god rays, metal sheen, depth of water).
import { ctx, W, H, TAU, lerp, clamp, rnd, rr, circle, ell, line } from './lib.js';

export const P = {
  night: '#150B06', umber: '#2A1608', ink: '#24120A', cream: '#F6E7C4',
  leaf: '#C9985A', leafLight: '#E3B97A', leafDark: '#8C5E2C', cord: '#6E4A22',
  lamp: '#FFB13B', flameHi: '#FFF1BE', gold: '#E8B63A', goldDark: '#A87A1E',
  bronze: '#B56A3C', bronzeDark: '#6E3A1E', bronzeHi: '#E39A62',
  maroon: '#5E1A1A', kumkum: '#B3262B',
  stone: '#8C7A62', stoneDark: '#5B4B3A', stoneLight: '#B9A486',
  teal: '#1C6B78', deep: '#0A2A38', ray: '#BFF0E4', moss: '#5E8C4A',
  skin: '#B97A4E', skinDark: '#8F5A38', skinHi: '#D9996A',
  sky1: '#F7D58A', sky2: '#E58A3E', sea: '#2A7F86', seaDark: '#17525C',
};
const SERIF = 'Caladea', TAMIL = 'NotoTamil';
const lg = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const poly = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
const fillP = (pts, c) => { poly(pts); ctx.fillStyle = c; ctx.fill(); };
const rad = (d) => d * Math.PI / 180;
export const STONE = {
  warm: { body: '#9A8468', light: '#C2AB8A', dark: '#6A5640', trim: '#D8C29A', niche: '#2A1608' },
  gold: { body: '#C79A52', light: '#EBC47C', dark: '#8A6228', trim: '#F5D58E', niche: '#3A2110' },
  sea: { body: '#3F7F86', light: '#6DB0B0', dark: '#1F4D58', trim: '#8CC9C0', niche: '#0A2A38' },
};

// ═════════════════════════ LIGHT ═════════════════════════
/** soft round glow: the only place a radial gradient is allowed (a light source) */
export function glow(x, y, r, color = '255,177,59', a = 0.6) {
  if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${color},${a})`); g.addColorStop(1, `rgba(${color},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
export function vignette(a = 0.6) {
  const g = ctx.createRadialGradient(540, 900, 420, 540, 900, 1300); g.addColorStop(0, 'rgba(10,4,0,0)'); g.addColorStop(1, `rgba(10,4,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
}
/** golden dust / sparks rising, a pure function of t */
export function embers(t, n = 36, seed = 0, col = '255,214,130') {
  for (let i = 0; i < n; i++) {
    const sp = 30 + rnd(i + seed) * 50, ph = rnd(i * 3 + seed), y = (H + 200) - ((t * sp + ph * (H + 400)) % (H + 400));
    const x = rnd(i * 7 + seed) * W + Math.sin(t * 0.9 + i) * 24, r = 2 + rnd(i + 9) * 4, tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 2);
    ctx.fillStyle = `rgba(${col},${0.25 + 0.6 * tw})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
}
/** slanted shafts of light from above (underwater or temple windows) */
export function godrays(t = 0, a = 0.5, n = 6, col = '191,240,228') {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = -120 + i * (W + 240) / (n - 1), w0 = 34 + rnd(i + 3) * 60, sw = Math.sin(t * 0.4 + i * 1.3) * 60, x2 = x + 300 + sw, w1 = w0 * 4.2;
    const g = ctx.createLinearGradient(x, -100, x2, H * 0.95); g.addColorStop(0, `rgba(${col},${a * (0.45 + 0.55 * rnd(i + 8))})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; poly([[x - w0, -100], [x + w0, -100], [x2 + w1, H * 0.95], [x2 - w1, H * 0.95]]); ctx.fill();
  }
  ctx.restore();
}
export function bubbles(t, n = 30, seed = 0) {
  for (let i = 0; i < n; i++) {
    const sp = 40 + rnd(i + seed) * 60, y = (H + 100) - ((t * sp + rnd(i * 2 + seed) * (H + 300)) % (H + 300)), x = rnd(i * 5 + seed) * W + Math.sin(t * 1.3 + i) * 14, r = 4 + rnd(i + 4) * 9;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = 'rgba(220,250,245,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.22, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
  }
}

// ═════════════════════════ PALM-LEAF MANUSCRIPTS ═════════════════════════
/** a line of invented script marks (looks like writing; real Tamil goes in captions or plaques) */
function scriptLine(x0, y, w, seed, size = 14, col = P.ink) {
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, size * 0.16); ctx.lineCap = 'round'; let x = x0, i = 0;
  while (x < x0 + w - size) {
    const g = size * (0.7 + rnd(seed + i) * 0.7), k = Math.floor(rnd(seed * 3 + i) * 4); ctx.beginPath();
    if (k === 0) ctx.arc(x + g / 2, y, g * 0.42, 0.4, TAU - 0.4);
    else if (k === 1) { ctx.moveTo(x, y + g * 0.3); ctx.quadraticCurveTo(x + g * 0.5, y - g * 0.7, x + g, y + g * 0.2); ctx.moveTo(x + g * 0.5, y - g * 0.2); ctx.lineTo(x + g * 0.5, y + g * 0.5); }
    else if (k === 2) { ctx.arc(x + g * 0.35, y - g * 0.1, g * 0.3, 0, TAU); ctx.moveTo(x + g * 0.65, y - g * 0.4); ctx.lineTo(x + g * 0.65, y + g * 0.45); }
    else { ctx.moveTo(x, y); ctx.bezierCurveTo(x + g * 0.2, y - g * 0.8, x + g * 0.8, y - g * 0.8, x + g * 0.9, y); ctx.lineTo(x + g * 0.9, y + g * 0.5); }
    ctx.stroke(); x += g + size * (0.25 + rnd(seed + i * 5) * 0.35); if (rnd(seed * 9 + i) > 0.86) x += size * 0.9; i++;
  }
}
/** one palm-leaf strip centred at x, y. o = { lines, seed, tie (string hole + cord), warm (0..1 lamp light) } */
export function leaf(x, y, w, h = w * 0.22, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const hw = w / 2, hh = h / 2;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  ctx.beginPath(); ctx.roundRect(-hw, -hh, w, h, h * 0.12); ctx.fillStyle = lg(0, -hh, 0, hh, [[0, P.leafLight], [0.5, P.leaf], [1, P.leafDark]]); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-hw, -hh, w, h, h * 0.12); ctx.clip();
  ctx.strokeStyle = 'rgba(110,70,30,0.32)'; ctx.lineWidth = 2; for (let yy = -hh + 6; yy < hh; yy += 7) { ctx.beginPath(); ctx.moveTo(-hw, yy); ctx.lineTo(hw, yy + (rnd(yy | 0) - 0.5) * 2); ctx.stroke(); }
  if (o.warm) { const g = ctx.createRadialGradient(hw * 0.2, 0, 0, hw * 0.2, 0, w * 0.6); g.addColorStop(0, `rgba(255,200,110,${0.35 * o.warm})`); g.addColorStop(1, 'rgba(255,200,110,0)'); ctx.fillStyle = g; ctx.fillRect(-hw, -hh, w, h); }
  ctx.restore();
  const n = o.lines || 4;
  for (let i = 0; i < n; i++) { const yy = -hh + h * (i + 0.8) / (n + 0.6); scriptLine(-hw + h * 0.2, yy, w - h * 0.4, (o.seed || 1) * 7 + i, h / (n * 2.3)); }
  ctx.strokeStyle = 'rgba(70,40,15,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-hw + 6, -hh + 2); ctx.lineTo(hw - 6, -hh + 2); ctx.moveTo(-hw + 6, hh - 2); ctx.lineTo(hw - 6, hh - 2); ctx.stroke();
  if (o.tie) { ctx.beginPath(); ctx.arc(0, 0, h * 0.1, 0, TAU); ctx.fillStyle = P.night; ctx.fill(); ctx.strokeStyle = P.cord; ctx.lineWidth = h * 0.05; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(h * 0.1, h * 0.25, h * 0.02, h * 0.5); ctx.strokeStyle = P.cord; ctx.lineWidth = h * 0.07; ctx.stroke(); circle(h * 0.02, h * 0.52, h * 0.09, P.cord); circle(h * 0.0, h * 0.5, h * 0.035, P.leafDark); }
  ctx.restore();
}
/** a fanned bundle of leaves, the top one tied with a cord. s = scale. */
export function manuscript(x, y, s = 1, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); const n = o.n || 6;
  for (let i = 0; i < n; i++) { const top = i === n - 1, k = n - 1 - i; leaf(k * 6 * (i % 2 ? 1 : -1), k * -2 + 0, 620, 150, rad(k * 2.4 * (i % 2 ? 1 : -1)), { seed: i + 1, lines: 4, tie: top, warm: o.warm == null ? 0.8 : o.warm }); }
  ctx.restore();
}

// ═════════════════════════ LAMPS & FLAME ═════════════════════════
export function flame(x, y, s = 1, t = 0, seed = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - 0.03 * Math.sin(t * 9 + seed)), s * (1 + 0.07 * Math.sin(t * 11 + seed) + 0.04 * Math.sin(t * 17 + seed * 2)));
  const f = (w, h, c) => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-w * 1.1, -h * 0.15, -w * 0.7, -h * 0.6, Math.sin(t * 7 + seed) * w * 0.15, -h); ctx.bezierCurveTo(w * 0.7, -h * 0.6, w * 1.1, -h * 0.15, 0, 0); ctx.fillStyle = c; ctx.fill(); };
  f(26, 92, '#FF8A1F'); f(19, 70, '#FFC24A'); f(10, 44, P.flameHi); ctx.restore();
}
/** brass oil lamp with its glow. (x, y) = base centre. lit 0..1 */
export function lamp(x, y, s = 1, t = 0, lit = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit > 0) glow(0, -130, 300, '255,170,60', 0.5 * lit * (0.92 + 0.08 * Math.sin(t * 9)));
  ell(0, -4, 96, 20, P.goldDark); rr(-26, -70, 52, 70, 10); ctx.fillStyle = lg(-26, 0, 26, 0, [[0, P.goldDark], [0.5, P.gold], [1, P.goldDark]]); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -80, 132, 62, 0, 0, Math.PI); ctx.closePath(); ctx.fillStyle = lg(-132, 0, 132, 0, [[0, P.goldDark], [0.35, '#F5D58E'], [0.7, P.gold], [1, P.goldDark]]); ctx.fill();
  ctx.strokeStyle = P.goldDark; ctx.lineWidth = 4; for (const k of [0.45, 0.7]) { ctx.beginPath(); ctx.ellipse(0, -80, 132 * k * 0.0 + 132 - (1 - k) * 60, 62 * k, 0, 0.15, Math.PI - 0.15); ctx.stroke(); }
  ell(0, -80, 136, 24, '#F5D58E'); ell(0, -80, 112, 15, P.bronzeDark); ell(0, -82, 80, 8, '#7A4A1E');
  rr(-7, -102, 14, 24, 5); ctx.fillStyle = P.gold; ctx.fill();
  if (lit > 0) flame(0, -96, lit * 1.1, t, x * 0.01);
  ctx.restore();
}

// ═════════════════════════ TEMPLES ═════════════════════════
export function lotus(x, y, s = 1, col = P.gold, dark = P.goldDark) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const a of [-70, 70, -38, 38, 0]) { ctx.save(); ctx.rotate(rad(a)); ell(0, -62, 24, 64, a === 0 ? col : dark); ctx.restore(); }
  ell(0, 0, 40, 14, col); ctx.restore();
}
/** carved temple tower standing on (x, y). pal = STONE.warm | STONE.gold | STONE.sea. o = { w, tiers, lit (window glow 0..1) } */
export function gopuram(x, y, s = 1, pal = STONE.warm, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const tiers = o.tiers || 7, bw = o.w || 560; let yy = 0, w = bw;
  rr(-bw / 2 - 30, -34, bw + 60, 34, 4); ctx.fillStyle = pal.dark; ctx.fill(); yy = -34;
  for (let i = 0; i < tiers; i++) {
    w = bw * (1 - i * 0.105); const h = 86 - i * 4;
    rr(-w / 2, yy - h, w, h, 3); ctx.fillStyle = lg(-w / 2, 0, w / 2, 0, [[0, pal.light], [0.45, pal.body], [1, pal.dark]]); ctx.fill();
    const nn = Math.max(2, Math.round(w / 78));
    for (let j = 0; j < nn; j++) { const nx = -w / 2 + (j + 0.5) * w / nn; ctx.beginPath(); ctx.moveTo(nx - 17, yy - 12); ctx.lineTo(nx - 17, yy - h * 0.58); ctx.arc(nx, yy - h * 0.58, 17, Math.PI, TAU); ctx.lineTo(nx + 17, yy - 12); ctx.closePath(); ctx.fillStyle = o.lit ? `rgba(255,177,59,${0.35 + 0.5 * o.lit})` : pal.niche; ctx.fill(); }
    rr(-w / 2 - 12, yy - h - 12, w + 24, 16, 3); ctx.fillStyle = pal.trim; ctx.fill();
    for (const sx of [-1, 1]) fillP([[sx * (w / 2 + 12), yy - h - 12], [sx * (w / 2 - 22), yy - h - 12], [sx * (w / 2 - 5), yy - h - 38]], pal.dark);
    yy -= h + 4;
  }
  ctx.beginPath(); ctx.ellipse(0, yy, w / 2 + 6, 78, 0, Math.PI, TAU); ctx.fillStyle = lg(-w / 2, 0, w / 2, 0, [[0, pal.light], [0.5, pal.body], [1, pal.dark]]); ctx.fill();
  for (const k of [-2, -1, 0, 1, 2]) { const kx = k * (w / 6); ell(kx, yy - 82 + Math.abs(k) * 12, 9, 15, P.gold); fillP([[kx - 3, yy - 96 + Math.abs(k) * 12], [kx + 3, yy - 96 + Math.abs(k) * 12], [kx, yy - 118 + Math.abs(k) * 12]], P.gold); }
  ctx.restore();
}
/** one carved pillar standing on (x, y) */
export function pillar(x, y, h = 560, pal = STONE.warm) {
  ctx.save(); ctx.translate(x, y); const w = h * 0.17;
  rr(-w * 0.9, -h * 0.07, w * 1.8, h * 0.07, 4); ctx.fillStyle = pal.dark; ctx.fill();
  rr(-w / 2, -h * 0.86, w, h * 0.8, 4); ctx.fillStyle = lg(-w / 2, 0, w / 2, 0, [[0, pal.light], [0.5, pal.body], [1, pal.dark]]); ctx.fill();
  for (const k of [0.2, 0.33, 0.5, 0.68]) { rr(-w * 0.62, -h * k, w * 1.24, h * 0.03, 5); ctx.fillStyle = pal.trim; ctx.fill(); }
  fillP([[-w * 0.8, -h * 0.86], [w * 0.8, -h * 0.86], [w * 0.55, -h * 0.93], [-w * 0.55, -h * 0.93]], pal.body);
  rr(-w * 1.25, -h * 1.0, w * 2.5, h * 0.07, 6); ctx.fillStyle = pal.trim; ctx.fill(); rr(-w * 1.05, -h * 0.94, w * 2.1, h * 0.04, 4); ctx.fillStyle = pal.dark; ctx.fill();
  ctx.restore();
}
export const colonnade = (x0, y, n, gap, h, pal) => { for (let i = 0; i < n; i++) pillar(x0 + i * gap, y, h, pal); };

// ═════════════════════════ SEA, SKY, SHIPS ═════════════════════════
export function sky(t = 0, sunX = 780, sunY = 520) {
  ctx.fillStyle = lg(0, -300, 0, 1000, [[0, '#F9E2A0'], [0.5, P.sky1], [1, P.sky2]]); ctx.fillRect(-300, -300, W + 600, 1500);
  glow(sunX, sunY, 700, '255,236,170', 0.8); circle(sunX, sunY, 90, '#FFF3C4');
  const cloud = (cx, cy, s, a) => { ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.scale(s, s); for (const [dx, dy, r] of [[-90, 10, 60], [-20, -20, 80], [60, 0, 70], [130, 18, 50], [10, 28, 70]]) circle(dx, dy, r, '#FFF1D0'); ctx.restore(); };
  for (let i = 0; i < 5; i++) cloud(((i * 330 + t * 14) % 1700) - 300, 200 + (i % 3) * 170, 0.9 + (i % 2) * 0.4, 0.55);
}
export function wave(y, col, t = 0, amp = 22, k = 0.012, ph = 0) {
  ctx.beginPath(); ctx.moveTo(-300, H + 300); ctx.lineTo(-300, y); for (let x = -300; x <= W + 300; x += 30) ctx.lineTo(x, y + Math.sin(x * k + t * 1.4 + ph) * amp); ctx.lineTo(W + 300, H + 300); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
/** Chola warship with a carved prow (o.prow 'elephant'), shields, a saffron pennant and oars. (x, y) = waterline centre. */
export function ship(x, y, s = 1, rot = 0, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const hull = o.metal ? [P.bronzeHi, P.bronze, P.bronzeDark] : ['#C98A45', '#9A5E2C', '#5E3418'], trim = o.metal ? P.bronzeHi : P.gold;
  for (let i = 0; i < 8; i++) { const ox = -200 + i * 55; line([[ox, 10], [ox - 44, 96 + Math.sin(t * 3 + i) * 7]], P.bronzeDark, 9); }
  if (!o.noFlag) {
    line([[250, -30], [250, -360]], P.bronzeDark, 9); const fw = Math.sin(t * 4) * 12;
    poly([[254, -352], [420, -330 + fw], [352, -310], [424, -288 - fw], [254, -266]]); ctx.fillStyle = P.kumkum; ctx.fill();
    circle(296, -308, 20, P.gold);
  }
  ctx.beginPath(); ctx.moveTo(-345, -125); ctx.bezierCurveTo(-345, -60, -300, 60, -150, 92); ctx.lineTo(150, 92); ctx.bezierCurveTo(290, 60, 335, -60, 332, -185); ctx.bezierCurveTo(300, -70, 250, -34, 190, -30); ctx.lineTo(-250, -30); ctx.bezierCurveTo(-300, -38, -340, -70, -345, -125); ctx.closePath();
  ctx.fillStyle = lg(0, -30, 0, 92, [[0, hull[0]], [0.4, hull[1]], [1, hull[2]]]); ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(40,20,8,0.4)'; ctx.lineWidth = 3; for (const k of [20, 50]) { ctx.beginPath(); ctx.moveTo(-360, -30 + k); ctx.quadraticCurveTo(0, 20 + k + 40, 360, -30 + k - 20); ctx.stroke(); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(-345, -125); ctx.bezierCurveTo(-340, -70, -300, -38, -250, -30); ctx.lineTo(190, -30); ctx.bezierCurveTo(250, -34, 300, -70, 332, -185); ctx.strokeStyle = trim; ctx.lineWidth = 12; ctx.stroke();
  for (let i = 0; i < 9; i++) { const sx = -230 + i * 52; circle(sx, -2, 17, trim); circle(sx, -2, 7, hull[2]); }
  if (o.lions) for (const lx of [-120, 20, 160]) { circle(lx, 50, 24, trim); circle(lx, 50, 12, hull[2]); }
  if (o.crew) for (let i = 0; i < o.crew; i++) { const cx = -200 + i * 120; rr(cx - 22, -118, 44, 90, 20); ctx.fillStyle = P.night; ctx.fill(); circle(cx, -134, 24, P.night); fillP([[cx - 8, -150], [cx + 22, -150], [cx + 2, -190]], P.kumkum); }
  // prow: an elephant head curling up
  ctx.save(); ctx.translate(332, -185);
  ctx.beginPath(); ctx.moveTo(-8, 10); ctx.bezierCurveTo(10, -30, 30, -50, 52, -60); ctx.lineWidth = 46; ctx.strokeStyle = hull[1]; ctx.lineCap = 'round'; ctx.stroke();
  ell(56, -72, 50, 42, hull[1], -0.3); ell(30, -66, 26, 36, hull[2], -0.2);
  ctx.beginPath(); ctx.moveTo(92, -66); ctx.bezierCurveTo(130, -60, 140, -10, 118, 8); ctx.bezierCurveTo(108, 18, 96, 6, 104, -2); ctx.lineWidth = 24; ctx.strokeStyle = hull[1]; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(80, -48); ctx.quadraticCurveTo(110, -36, 100, -8); ctx.lineWidth = 8; ctx.strokeStyle = P.cream; ctx.stroke();
  circle(70, -82, 6, P.night); ctx.restore();
  ctx.restore();
}

// ═════════════════════════ PEOPLE: bronze-skinned, faceless, gold-jewelled ═════════════════════════
const ROLE = {
  king: { cloth: '#E0A82E', clothDark: '#A87A1E', sash: P.kumkum },
  warrior: { cloth: '#8E2A22', clothDark: '#5E1A1A', sash: '#D9B24A' },
  sailor: { cloth: '#F1E3C2', clothDark: '#C9B88F', sash: P.kumkum },
  scribe: { cloth: '#F1E3C2', clothDark: '#C9B88F', sash: '#8C5E2C' },
  priest: { cloth: '#F6EFDC', clothDark: '#D2C6A4', sash: '#F6EFDC' },
};
/** a figure standing on (x, y), 700 px tall at h 700. o = { role, h, dir, arm (deg, 0 down · 90 forward · 180 up), bend, sword (deg), walk, metal, hold(x, y) } */
export function figure(o) {
  const h = o.h || 700, d = o.dir || 1, s = h / 700, role = o.role || 'king', R = ROLE[role], metal = o.metal, wk = o.walk != null ? Math.sin(o.walk) : 0;
  const SK = metal ? [P.bronze, P.bronzeDark, P.bronzeHi] : [P.skin, P.skinDark, P.skinHi];
  const cloth = metal ? '#9A5630' : R.cloth, clothD = metal ? P.bronzeDark : R.clothDark, sash = metal ? P.bronzeHi : R.sash, gold = metal ? P.bronzeHi : P.gold;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(s * d, s);
  const short = role === 'sailor' || role === 'warrior';
  for (const k of [-1, 1]) ell(k * 36 + k * wk * 14, -8, 30, 13, SK[1]);
  if (short) for (const k of [-1, 1]) { rr(k * 38 - 22 + k * wk * 14, -300, 44, 292, 16); ctx.fillStyle = SK[0]; ctx.fill(); rr(k * 38 + (k > 0 ? 8 : -22) + k * wk * 14, -300, 14, 292, 7); ctx.fillStyle = SK[2]; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1; }
  fillP(short ? [[-72, -312], [72, -312], [80, -170], [-80, -170]] : [[-70, -312], [70, -312], [86, -14], [-86, -14]], cloth);
  fillP(short ? [[-6, -312], [72, -312], [80, -170], [10, -170]] : [[-4, -312], [70, -312], [86, -14], [14, -14]], clothD);
  if (!short) { fillP([[-28, -250], [30, -250], [44, -14], [-40, -14]], clothD); for (const k of [-0.4, 0, 0.4]) line([[k * 60, -250], [k * 70, -16]], 'rgba(0,0,0,0.18)', 4); }
  fillP([[-80, -520], [80, -520], [60, -300], [-60, -300]], SK[0]); fillP([[50, -520], [80, -520], [60, -300], [44, -300]], SK[2]);
  line([[-68, -508], [58, -312]], sash, 34); line([[-68, -508], [58, -312]], clothD, 3);
  rr(-66, -322, 132, 26, 8); ctx.fillStyle = gold; ctx.fill(); circle(0, -309, 11, metal ? P.bronzeDark : P.kumkum);
  rr(-16, -540, 32, 30, 8); ctx.fillStyle = SK[1]; ctx.fill();
  for (const [rw, k] of [[56, 1], [76, 1.4], [96, 1.8]]) { ctx.beginPath(); ctx.arc(0, -515, rw * 0.9, 0.25, Math.PI - 0.25); ctx.strokeStyle = gold; ctx.lineWidth = 6 + k; ctx.stroke(); }
  // back arm
  const arm = (shx, ang, bend, hold) => {
    const a1 = rad(ang), a2 = rad(ang + bend), ex = shx + Math.sin(a1) * 120, ey = -500 + Math.cos(a1) * 120, hx = ex + Math.sin(a2) * 110, hy = ey + Math.cos(a2) * 110;
    line([[shx, -500], [ex, ey]], SK[0], 36); line([[ex, ey], [hx, hy]], SK[0], 32); line([[shx + (ex - shx) * 0.45, -500 + (ey + 500) * 0.45], [shx + (ex - shx) * 0.62, -500 + (ey + 500) * 0.62]], gold, 42); circle(hx, hy, 19, SK[0]);
    if (hold) hold(hx, hy); return [hx, hy];
  };
  arm(-80, -8 + wk * 8, 10);
  // head
  circle(0, -592, 54, SK[0]); ell(48, -592, 14, 20, SK[1]); circle(52, -576, 7, gold); ell(30, -600, 14, 40, SK[2]);
  if (role === 'king' || role === 'warrior') { ctx.beginPath(); ctx.arc(0, -572, 44, 0.15, Math.PI - 0.15); ctx.lineWidth = 16; ctx.strokeStyle = P.night; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-26, -582); ctx.quadraticCurveTo(0, -562, 26, -582); ctx.lineWidth = 9; ctx.strokeStyle = P.night; ctx.lineCap = 'round'; ctx.stroke();
  if (role === 'king') { rr(-52, -650, 104, 22, 6); ctx.fillStyle = gold; ctx.fill(); fillP([[-44, -650], [44, -650], [30, -704], [-30, -704]], gold); fillP([[-30, -704], [30, -704], [0, -748]], gold); circle(0, -688, 10, P.kumkum); }
  if (role === 'warrior') { circle(10, -660, 26, P.night); line([[-52, -636], [52, -636]], P.kumkum, 14); }
  if (role === 'sailor') { fillP([[-56, -622], [56, -622], [48, -668], [-48, -668]], P.kumkum); line([[-56, -626], [64, -618]], P.kumkum, 14); }
  if (role === 'scribe') { circle(8, -652, 24, P.night); }
  if (role === 'priest') { for (const k of [-10, 0, 10]) line([[k, -628], [k, -616]], '#F6EFDC', 4); circle(0, -606, 5, P.kumkum); }
  // front arm (+ sword)
  const front = arm(80, o.arm || 0, o.bend == null ? 14 : o.bend, o.hold);
  if (o.sword != null) { ctx.save(); ctx.translate(front[0], front[1]); ctx.rotate(rad(o.sword)); rr(-8, -4, 16, 40, 5); ctx.fillStyle = gold; ctx.fill(); rr(-22, -10, 44, 12, 5); ctx.fillStyle = gold; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, -10); ctx.quadraticCurveTo(-14, -240, 14, -380); ctx.quadraticCurveTo(22, -240, 9, -10); ctx.closePath(); ctx.fillStyle = '#EDEFF2'; ctx.fill(); line([[0, -14], [6, -370]], '#B6BCC6', 3); ctx.restore(); }
  ctx.restore();
}

// ═════════════════════════ TREASURE & GRAPHICS ═════════════════════════
export function coin(x, y, r = 40, tilt = 0.4, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, Math.cos(tilt)); circle(0, r * 0.18, r, P.goldDark); circle(0, 0, r, P.gold); circle(0, 0, r * 0.74, P.goldDark); circle(0, 0, r * 0.68, '#F5D58E');
  ctx.strokeStyle = P.goldDark; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0.3, TAU - 0.9); ctx.moveTo(-r * 0.15, 0); ctx.lineTo(r * 0.3, -r * 0.1); ctx.stroke(); ctx.restore();
}
export function kalasam(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(0, -4, 70, 16, P.goldDark); ell(0, -86, 100, 92, P.gold); ctx.beginPath(); ctx.ellipse(0, -86, 100, 92, 0, -0.5, 1.4); ctx.lineTo(0, -86); ctx.closePath(); ctx.fillStyle = P.goldDark; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
  ell(-34, -120, 18, 40, '#F5D58E', 0.5); rr(-48, -200, 96, 26, 8); ctx.fillStyle = P.gold; ctx.fill(); rr(-62, -216, 124, 20, 10); ctx.fillStyle = '#F5D58E'; ctx.fill();
  fillP([[-26, -216], [26, -216], [0, -270]], P.gold); circle(0, -274, 12, '#F5D58E'); ctx.restore();
}
export function treasure(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const [cx, cy, r, ti] of [[-150, -10, 44, 1.2], [-96, 6, 46, 0.9], [150, -6, 44, 1.1], [100, 8, 46, 0.7], [-46, 18, 40, 1.3], [54, 18, 40, 0.6]]) coin(cx, cy, r, ti, rnd(cx) * 2); kalasam(0, 0, 1); ctx.restore(); }
/** date plaque: dark leaf with a gold temple border and lotus ends. sc = pop scale */
export function plaque(text, x, y, sc = 1, size = 96) {
  if (sc <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.font = `700 ${size}px ${SERIF}`;
  const w = ctx.measureText(text).width + size * 1.5, h = size * 1.5;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; rr(-w / 2, -h / 2, w, h, h * 0.16); ctx.fillStyle = P.umber; ctx.fill(); ctx.restore();
  rr(-w / 2, -h / 2, w, h, h * 0.16); ctx.strokeStyle = P.gold; ctx.lineWidth = 7; ctx.stroke(); rr(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, h * 0.1); ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3; ctx.stroke();
  lotus(-w / 2, 0, 0.34); lotus(w / 2, 0, 0.34); ctx.fillStyle = P.cream; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 6); ctx.restore();
}
/** real Tamil (or any) text in gold on a dark strip: names, inscriptions */
export function tamil(text, x, y, size = 64, col = P.cream) { ctx.save(); ctx.font = `700 ${size}px ${TAMIL}, ${SERIF}`; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y); ctx.restore(); }
/** ink-on-gold map label */
export function label(text, x, y, size = 36, color = P.ink) { ctx.font = `700 ${size}px ${SERIF}`; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.letterSpacing = '0px'; }

// ═════════════════════════ MAPS ═════════════════════════
export function landPts(cx, cy, rx, ry, seed, n = 90) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, k = 1 + 0.18 * Math.sin(3 * a + seed) + 0.1 * Math.sin(7 * a + seed * 2) + 0.05 * Math.sin(13 * a + seed * 3); pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return pts; }
/** gold route through pts with a glowing head; p 0..1 draws it on; returns the head [x, y, angle] */
export function route(pts, p = 1) {
  const seglen = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seglen.push(l); tot += l; }
  let left = tot * clamp(p), head = [...pts[0], 0]; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && left > 0; i++) { const k = Math.min(1, left / seglen[i - 1]), x = lerp(pts[i - 1][0], pts[i][0], k), y = lerp(pts[i - 1][1], pts[i][1], k); ctx.lineTo(x, y); head = [x, y, Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; left -= seglen[i - 1]; }
  ctx.save(); ctx.shadowColor = 'rgba(255,177,59,0.9)'; ctx.shadowBlur = 24; ctx.setLineDash([26, 16]); ctx.strokeStyle = P.kumkum; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  if (p > 0) { ctx.save(); ctx.translate(head[0], head[1]); ctx.rotate(head[2]); fillP([[26, 0], [-18, -22], [-18, 22]], P.gold); ctx.restore(); }
  return head;
}
/** old sea-chart page: sandy land on a faded teal sea, gold grid, route. o = { route 0..1, labels } */
export function map(o = {}) {
  ctx.fillStyle = lg(0, 0, 0, H, [[0, '#E9CF98'], [1, '#C9A468']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = P.sea; ctx.fillRect(50, 150, 980, 1320); ctx.restore();
  ctx.strokeStyle = 'rgba(80,50,20,0.22)'; ctx.lineWidth = 2; for (let x = 50; x <= 1030; x += 122) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, 1470); ctx.stroke(); } for (let y = 150; y <= 1470; y += 132) { ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(1030, y); ctx.stroke(); }
  const lands = [landPts(210, 650, 230, 420, 1.3), landPts(380, 1250, 70, 90, 4.1), landPts(880, 640, 210, 330, 2.2), landPts(760, 1180, 230, 110, 0.7)];
  lands.forEach((pts, i) => { poly(pts); ctx.fillStyle = i === (o.highlight ?? 0) ? '#F0C75E' : '#D8B677'; ctx.fill(); ctx.strokeStyle = i === (o.highlight ?? 0) ? P.kumkum : P.leafDark; ctx.lineWidth = i === (o.highlight ?? 0) ? 8 : 5; ctx.stroke(); });
  ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.strokeRect(50, 150, 980, 1320);
  const pts = [[260, 820], [420, 1010], [620, 1130], [800, 1080], [850, 800]];
  if (o.route) route(pts, o.route);
  (o.labels || [['CHOLA LAND', 220, 780], ['THE SEA', 560, 880], ['SRIVIJAYA', 840, 800]]).forEach(([t, x, y]) => { circle(x, y + 36, 9, P.ink); label(t, x, y, 34); });
  return { pts };
}

// ═════════════════════════ SCENES ═════════════════════════
/** A · the lamplit scriptorium: dark umber room, a table, lamps, drifting embers */
export function scriptorium(t = 0, o = {}) {
  ctx.fillStyle = lg(0, -300, 0, H, [[0, '#0E0603'], [0.6, '#2A1608'], [1, '#1A0D05']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  glow(540, 1050, 900, '255,170,60', 0.28);
  for (const px of [140, 940]) pillar(px, 1230, 760, { body: '#4A3826', light: '#6A5238', dark: '#2A1A0E', trim: '#7A5E3A', niche: '#000' });
  poly([[-300, 1250], [W + 300, 1250], [W + 300, H + 300], [-300, H + 300]]); ctx.fillStyle = lg(0, 1250, 0, H, [[0, '#5A3A1E'], [1, '#2A1608']]); ctx.fill();
  ctx.fillStyle = 'rgba(255,200,110,0.35)'; ctx.fillRect(-300, 1250, W + 600, 6);
  (o.lamps || [[170, 1262, 0.9], [920, 1262, 1.0]]).forEach(([lx, ly, ls], i) => lamp(lx, ly, ls, t + i * 1.7));
  embers(t, 40, 1); vignette(0.65);
}
/** B · the sunken temple city: teal depth, god rays, a drowned gopuram, mossy colonnades */
export function sunken(t = 0, o = {}) {
  ctx.fillStyle = lg(0, -300, 0, H, [[0, '#2C858C'], [0.4, '#12464F'], [1, '#061C26']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  glow(540, 100, 800, '200,250,235', 0.4);
  gopuram(760, 1180, 1.25, STONE.gold, { w: 560 });
  ctx.fillStyle = 'rgba(20,95,110,0.5)'; ctx.fillRect(-300, 300, W + 600, 1300);
  colonnade(120, 1300, 6, 170, 460, { body: '#356E78', light: '#5EA0A2', dark: '#1A4650', trim: '#7CB8B2', niche: '#0A2A38' });
  poly([[-300, 1300], [W + 300, 1300], [W + 300, H + 300], [-300, H + 300]]); ctx.fillStyle = lg(0, 1300, 0, H, [[0, '#1F5560'], [1, '#08222E']]); ctx.fill();
  for (let i = 0; i < 5; i++) { rr(250 + i * 8, 1300 + i * 46, 580 - i * 16, 46, 3); ctx.fillStyle = i % 2 ? '#2E6A74' : '#3A7B84'; ctx.fill(); }
  for (const px of [-10, 1090]) { pillar(px, 1500, 1000, STONE.sea); for (let k = 0; k < 6; k++) line([[px + (k - 3) * 22, 540 + k * 10], [px + (k - 3) * 22 + Math.sin(t * 0.8 + k) * 14, 700 + k * 40]], P.moss, 10); }
  godrays(t, 0.3); bubbles(t, 26, 3); vignette(0.55);
}
/** C · golden-hour harbor with a temple stair on the right (o.temple) */
export function harbor(t = 0, o = {}) {
  sky(t);
  poly([[-300, 920], [160, 760], [330, 860], [520, 790], [700, 920]]); ctx.fillStyle = 'rgba(120,80,50,0.45)'; ctx.fill();
  wave(920, '#3D8E92', t, 14, 0.01, 0); wave(1010, P.sea, t, 20, 0.012, 1); wave(1110, P.seaDark, t, 24, 0.014, 2);
  if (o.temple !== false) {
    gopuram(850, 1230, 1.0, STONE.gold, { w: 620 });
    for (let i = 0; i < 6; i++) { rr(430 - i * 40, 1230 + i * 44, 900 + i * 80, 46, 3); ctx.fillStyle = i % 2 ? '#B38D52' : '#C79A52'; ctx.fill(); }
  } else wave(1190, '#0F3D46', t, 26, 0.016, 3);
  glow(780, 560, 620, '255,220,140', 0.25);
}
/** D · the bronze hall: maroon wall, a single spot, dark floor */
export function bronzeHall(t = 0) {
  ctx.fillStyle = lg(0, -300, 0, H, [[0, '#4A1410'], [0.55, '#7A2A1E'], [1, '#2A0F0A']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  glow(540, 760, 760, '255,190,120', 0.38);
  for (const px of [150, 930]) { rr(px - 60, -300, 120, 1700, 4); ctx.fillStyle = 'rgba(60,15,10,0.55)'; ctx.fill(); }
  poly([[-300, 1380], [W + 300, 1380], [W + 300, H + 300], [-300, H + 300]]); ctx.fillStyle = lg(0, 1380, 0, H, [[0, '#2A1208'], [1, '#120804']]); ctx.fill();
  embers(t, 22, 5); vignette(0.5);
}
/** a bronze hero on a ship's prow over a carved plinth (the statue look). inscription = real Tamil text */
export function statue(x, y, s = 1, t = 0, inscription = 'சோழர்') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-330, 120, 660, 150, 18); ctx.fillStyle = lg(-330, 0, 330, 0, [[0, P.bronzeDark], [0.4, P.bronze], [1, P.bronzeDark]]); ctx.fill();
  ell(0, 120, 330, 40, P.bronzeHi); ell(0, 124, 310, 30, P.bronzeDark); tamil(inscription, 0, 205, 64, '#F2C99A'); circle(-270, 200, 34, P.bronzeHi); circle(-270, 200, 22, P.bronzeDark);
  ctx.beginPath(); ctx.ellipse(0, 120, 300, 36, 0, 0, TAU); ctx.fillStyle = P.bronze; ctx.fill();
  ship(-10, 56, 0.9, -0.03, t, { metal: true, noFlag: true, lions: 1 });
  figure({ x: 110, y: 28, h: 600, role: 'king', metal: true, arm: 50, bend: 20, sword: 62 });
  ctx.restore();
}

// ═════════════════════════ CAPTION LOOK ═════════════════════════
export const CAPLOOK = { font: `700 88px ${SERIF}`, y: 1640, maxW: 940, fg: P.cream, hi: P.gold };
/** caption on a dark palm-leaf strip with a gold edge and a cord hole; one gold word */
export function captionStrip(words, x, y, sc = 1, look = CAPLOOK) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.font = look.font; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const sp = 24, ws = words.map((w) => ctx.measureText(w.txt).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1), pad = 60, hole = 70, hw = (tw + pad * 2 + hole) / 2;
  const fit = Math.min(1, (look.maxW || 960) / (hw * 2)); ctx.scale(fit, fit);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10; rr(-hw, -80, hw * 2, 160, 28); ctx.fillStyle = 'rgba(30,14,5,0.93)'; ctx.fill(); ctx.restore();
  rr(-hw, -80, hw * 2, 160, 28); ctx.strokeStyle = P.gold; ctx.lineWidth = 6; ctx.stroke(); rr(-hw + 12, -68, hw * 2 - 24, 136, 20); ctx.strokeStyle = 'rgba(232,182,58,0.45)'; ctx.lineWidth = 2.5; ctx.stroke();
  const hx = -hw + 56; circle(hx, 0, 17, P.night); ctx.beginPath(); ctx.arc(hx, 0, 17, 0, TAU); ctx.strokeStyle = P.cord; ctx.lineWidth = 6; ctx.stroke();
  let cx = -tw / 2 + hole / 2; words.forEach((w, i) => { ctx.fillStyle = w.hi ? look.hi : look.fg; ctx.fillText(w.txt, cx, 6); cx += ws[i] + sp; });
  ctx.restore();
}
