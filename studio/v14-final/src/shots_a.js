// EPISODE 14 · worker A : "Ganjifa Round Cards", lines 0-4 (t 0 → L(5)).
// Hook (1656, two kingdoms, remembered for noses) · Tirumala Nayak of Madurai vs Kanthirava Narasaraja of Mysore ·
// Madurai sided with Bijapur; Bijapur went home; Mysore struck back · army marched south under Hampaiya ·
// old accounts say noses were cut (shown ONLY as a nose line painted over in black on a faceless card).
// Engine: every card face, back, crackle, baize table and shadow is baked once by cached(); per frame only blits move,
// plus a few strokes (paint-over brush, pulse rings, sparks) and clipped sprites (rider, marching soldiers).
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { poly, cached, blit } from './art.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const C = {
  iv: '#EDE0C2', ver: '#C8401E', leaf: '#3E7A3A', leafL: '#5E9A4E', leafD: '#2C5A2A', ind: '#24366B', indL: '#3B5397', saf: '#E69A2A',
  blk: '#1B1410', rim: '#5A1F14', gold: '#D8A845', baize: '#1F3B2C', skin: '#A8683A', white: '#F6EFDC', maroon: '#6A1A17',
  slip: '#F1E6C8', red: '#B8302A', bill: '#2B1408', mud: '#B9772E', thatch: '#8A5424',
};

// ───────────────────────────── paint primitives (card paint space: ground radius = 300) ─────────────────────────────
const ink = (w = 2.6) => { ctx.strokeStyle = C.blk; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
const fo = (col, w) => { ctx.fillStyle = col; ctx.fill(); ink(w); };
const E = (x, y, rx, ry, col, w = 2.6, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); fo(col, w); };
const P = (pts, col, w) => { poly(pts); fo(col, w); };
const R4 = (x, y, w, h, col, lw) => { ctx.beginPath(); ctx.rect(x, y, w, h); fo(col, lw); };
const dot = (x, y, r, col = C.white) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
const dots = (x0, y0, x1, y1, n, r = 2.2, col = C.white) => { for (let i = 0; i < n; i++) { const k = n > 1 ? i / (n - 1) : 0.5; dot(lerp(x0, x1, k), lerp(y0, y1, k), r, col); } };
const st = (pts, col, w) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
/** a limb: ink outline stroke then a narrower colour stroke on top */
const limb = (pts, col, w) => { st(pts, C.blk, w + 5); st(pts, col, w); };
/** faceless oval head with one white highlight dot */
const head = (x, y, s, col = C.skin) => { E(x, y, 13 * s, 16 * s, col, 2.2); dot(x - 5 * s, y - 7 * s, 1.8 * s); };

function spearman(x, y, s, tunic = C.ind, sh = C.ver) {
  limb([[x - 6 * s, y], [x - 2 * s, y - 24 * s]], C.skin, 4 * s); limb([[x + 6 * s, y], [x + 2 * s, y - 24 * s]], C.skin, 4 * s);
  P([[x - 11 * s, y - 20 * s], [x + 11 * s, y - 20 * s], [x + 8 * s, y - 48 * s], [x - 8 * s, y - 48 * s]], tunic, 2);
  head(x, y - 60 * s, 0.8 * s); E(x, y - 71 * s, 10 * s, 5 * s, C.white, 1.6);
  st([[x + 15 * s, y + 4 * s], [x + 15 * s, y - 104 * s]], C.blk, 2.6 * s); P([[x + 11 * s, y - 102 * s], [x + 19 * s, y - 102 * s], [x + 15 * s, y - 118 * s]], C.iv, 1.4);
  limb([[x + 6 * s, y - 44 * s], [x + 15 * s, y - 36 * s]], tunic, 3 * s);
  E(x - 11 * s, y - 34 * s, 10 * s, 12 * s, sh, 2); dot(x - 11 * s, y - 34 * s, 2.4 * s, C.gold);
}
function villager(x, y, s, cloth = C.white, top = C.skin) {
  P([[x - 12 * s, y], [x + 12 * s, y], [x + 9 * s, y - 30 * s], [x - 9 * s, y - 30 * s]], cloth, 2);
  P([[x - 9 * s, y - 30 * s], [x + 9 * s, y - 30 * s], [x + 7 * s, y - 52 * s], [x - 7 * s, y - 52 * s]], top, 2);
  limb([[x - 7 * s, y - 48 * s], [x - 14 * s, y - 28 * s]], C.skin, 3 * s); limb([[x + 7 * s, y - 48 * s], [x + 14 * s, y - 28 * s]], C.skin, 3 * s);
  head(x, y - 63 * s, 0.8 * s); dots(x - 10 * s, y - 4 * s, x + 10 * s, y - 4 * s, 4, 1.4 * s, C.ver);
}
function seatedKing(x, y, s) {
  R4(x - 110 * s, y - 30 * s, 220 * s, 40 * s, C.saf, 3); dots(x - 96 * s, y - 10 * s, x + 96 * s, y - 10 * s, 11, 3 * s, C.white);
  E(x, y - 38 * s, 112 * s, 16 * s, C.ver, 3);
  P([[x - 120 * s, y - 230 * s], [x - 104 * s, y - 230 * s], [x - 96 * s, y - 40 * s], [x - 118 * s, y - 40 * s]], C.gold, 2.5); // throne back posts
  P([[x + 104 * s, y - 230 * s], [x + 120 * s, y - 230 * s], [x + 118 * s, y - 40 * s], [x + 96 * s, y - 40 * s]], C.gold, 2.5);
  E(x - 112 * s, y - 236 * s, 12 * s, 12 * s, C.gold, 2.5); E(x + 112 * s, y - 236 * s, 12 * s, 12 * s, C.gold, 2.5);
  E(x, y - 62 * s, 86 * s, 26 * s, C.white, 3); // crossed legs in white
  P([[x - 44 * s, y - 60 * s], [x + 44 * s, y - 60 * s], [x + 32 * s, y - 150 * s], [x - 32 * s, y - 150 * s]], C.white, 3);
  limb([[x - 34 * s, y - 142 * s], [x - 58 * s, y - 100 * s], [x - 62 * s, y - 70 * s]], C.white, 16 * s);
  limb([[x + 34 * s, y - 142 * s], [x + 58 * s, y - 100 * s], [x + 62 * s, y - 70 * s]], C.white, 16 * s);
  E(x - 62 * s, y - 66 * s, 9 * s, 8 * s, C.skin, 2); E(x + 62 * s, y - 66 * s, 9 * s, 8 * s, C.skin, 2);
  R4(x - 9 * s, y - 166 * s, 18 * s, 18 * s, C.skin, 2);
  for (let k = 0; k < 9; k++) { const a = PI * (0.15 + 0.7 * k / 8); dot(x + cos(a) * 26 * s, y - 150 * s + sin(a) * 18 * s, 3.2 * s, C.gold); }
  dots(x - 26 * s, y - 120 * s, x + 26 * s, y - 120 * s, 6, 2.2 * s, C.saf);
  E(x, y - 186 * s, 22 * s, 27 * s, C.skin, 3); dot(x - 9 * s, y - 198 * s, 3 * s);
  dot(x - 22 * s, y - 180 * s, 4 * s, C.gold); dot(x + 22 * s, y - 180 * s, 4 * s, C.gold);
  // tall conical Nayak crown
  P([[x - 24 * s, y - 204 * s], [x + 24 * s, y - 204 * s], [x + 8 * s, y - 300 * s], [x, y - 318 * s], [x - 8 * s, y - 300 * s]], C.saf, 3);
  R4(x - 26 * s, y - 214 * s, 52 * s, 12 * s, C.ver, 2.5);
  for (let k = 1; k < 4; k++) { const yy = y - 214 * s - k * 24 * s, hw = 24 * s * (1 - k * 0.22); st([[x - hw, yy], [x + hw, yy]], C.blk, 2); dots(x - hw * 0.7, yy - 10 * s, x + hw * 0.7, yy - 10 * s, 3, 2.2 * s); }
  dot(x, y - 322 * s, 5 * s, C.gold);
}
function turbanKing(x, y, s) {
  E(x - 18 * s, y - 4 * s, 16 * s, 7 * s, C.blk, 1.5); E(x + 18 * s, y - 4 * s, 16 * s, 7 * s, C.blk, 1.5);
  P([[x - 26 * s, y - 160 * s], [x + 26 * s, y - 160 * s], [x + 62 * s, y - 8 * s], [x - 62 * s, y - 8 * s]], C.ind, 3);
  for (let k = 0; k < 5; k++) st([[x - 10 * s + k * 5 * s, y - 100 * s], [x - 40 * s + k * 20 * s, y - 10 * s]], C.indL, 2.5);
  R4(x - 28 * s, y - 112 * s, 56 * s, 14 * s, C.saf, 2.5); P([[x + 6 * s, y - 100 * s], [x + 18 * s, y - 100 * s], [x + 22 * s, y - 50 * s], [x + 10 * s, y - 50 * s]], C.saf, 2);
  limb([[x - 26 * s, y - 150 * s], [x - 46 * s, y - 112 * s], [x - 40 * s, y - 84 * s]], C.ind, 14 * s);
  limb([[x + 26 * s, y - 150 * s], [x + 48 * s, y - 120 * s], [x + 62 * s, y - 136 * s]], C.ind, 14 * s);
  E(x - 40 * s, y - 80 * s, 8 * s, 8 * s, C.skin, 2); E(x + 64 * s, y - 140 * s, 8 * s, 8 * s, C.skin, 2);
  st([[x + 66 * s, y - 136 * s], [x + 66 * s, y - 250 * s]], C.blk, 3 * s); P([[x + 54 * s, y - 250 * s], [x + 66 * s, y - 230 * s], [x + 100 * s, y - 238 * s], [x + 100 * s, y - 262 * s], [x + 66 * s, y - 268 * s]], C.ver, 2.5); // pennant
  R4(x - 8 * s, y - 176 * s, 16 * s, 16 * s, C.skin, 2);
  for (let k = 0; k < 7; k++) { const a = PI * (0.18 + 0.64 * k / 6); dot(x + cos(a) * 24 * s, y - 160 * s + sin(a) * 16 * s, 3 * s, C.white); }
  E(x, y - 196 * s, 20 * s, 25 * s, C.skin, 3); dot(x - 8 * s, y - 207 * s, 2.8 * s);
  E(x, y - 218 * s, 28 * s, 15 * s, C.white, 2.5); E(x + 3 * s, y - 230 * s, 21 * s, 12 * s, C.white, 2.5);
  st([[x - 22 * s, y - 220 * s], [x + 24 * s, y - 228 * s]], C.saf, 2.5); P([[x + 10 * s, y - 238 * s], [x + 18 * s, y - 266 * s], [x + 22 * s, y - 238 * s]], C.saf, 2); dot(x, y - 222 * s, 4 * s, C.ver);
}
function elephant(x, y, s, body = C.iv, cloth = C.ver) {
  for (const [lx, lw] of [[-48, 24], [-20, 24], [26, 24], [52, 24]]) R4(x + lx * s - lw * s / 2, y - 60 * s, lw * s, 60 * s, body, 2.4);
  st([[x - 70 * s, y - 80 * s], [x - 84 * s, y - 40 * s]], C.blk, 3 * s);
  E(x, y - 78 * s, 74 * s, 48 * s, body, 3);
  E(x + 70 * s, y - 92 * s, 34 * s, 36 * s, body, 3);
  limb([[x + 94 * s, y - 84 * s], [x + 104 * s, y - 40 * s], [x + 98 * s, y - 14 * s], [x + 86 * s, y - 10 * s]], body, 14 * s);
  st([[x + 86 * s, y - 70 * s], [x + 104 * s, y - 62 * s], [x + 112 * s, y - 72 * s]], C.blk, 7 * s); st([[x + 86 * s, y - 70 * s], [x + 104 * s, y - 62 * s], [x + 112 * s, y - 72 * s]], C.white, 4 * s);
  E(x + 56 * s, y - 86 * s, 20 * s, 28 * s, body, 2.4, -0.2);
  dot(x + 82 * s, y - 102 * s, 3 * s, C.blk);
  P([[x - 40 * s, y - 124 * s], [x + 30 * s, y - 124 * s], [x + 40 * s, y - 70 * s], [x - 50 * s, y - 70 * s]], cloth, 2.6);
  dots(x - 46 * s, y - 76 * s, x + 36 * s, y - 76 * s, 8, 3 * s, C.gold); dots(x - 30 * s, y - 112 * s, x + 24 * s, y - 112 * s, 5, 2.4 * s, C.white);
  E(x + 70 * s, y - 120 * s, 12 * s, 7 * s, C.gold, 2);
}
function fish(x, y, s, col = C.leaf, dir = 1) {
  ctx.beginPath(); ctx.moveTo(x - 34 * s * dir, y); ctx.quadraticCurveTo(x, y - 24 * s, x + 34 * s * dir, y); ctx.quadraticCurveTo(x, y + 24 * s, x - 34 * s * dir, y); fo(col, 2.4);
  P([[x - 30 * s * dir, y], [x - 52 * s * dir, y - 16 * s], [x - 52 * s * dir, y + 16 * s]], col, 2.4);
  dot(x + 20 * s * dir, y - 4 * s, 3 * s); dots(x - 14 * s * dir, y + 2 * s, x + 8 * s * dir, y + 2 * s, 4, 1.8 * s, C.saf);
}
function gopuram(x, y, w, h) {
  const n = 5, th = h / (n + 1.4);
  for (let i = 0; i < n; i++) {
    const wb = w * (1 - i * 0.15), wt = w * (1 - (i + 1) * 0.15) + w * 0.04, y0 = y - i * th, y1 = y0 - th;
    P([[x - wb / 2, y0], [x + wb / 2, y0], [x + wt / 2, y1], [x - wt / 2, y1]], i % 2 ? C.iv : C.white, 2.5);
    dots(x - wb * 0.38, y0 - th * 0.5, x + wb * 0.38, y0 - th * 0.5, 5 + (n - i), 3, i % 2 ? C.ver : C.saf);
  }
  const yt = y - n * th, wt = w * 0.32;
  ctx.beginPath(); ctx.moveTo(x - wt / 2, yt); ctx.lineTo(x - wt / 2, yt - th * 0.6); ctx.arc(x, yt - th * 0.6, wt / 2, PI, 0); ctx.lineTo(x + wt / 2, yt); ctx.closePath(); fo(C.saf, 2.5);
  for (let k = -1; k <= 1; k++) E(x + k * wt * 0.3, yt - th * 0.6 - wt / 2 - 8, 5, 8, C.gold, 1.6);
  ctx.beginPath(); ctx.moveTo(x - w * 0.12, y); ctx.lineTo(x - w * 0.12, y - th * 0.7); ctx.arc(x, y - th * 0.7, w * 0.12, PI, 0); ctx.lineTo(x + w * 0.12, y); ctx.closePath(); fo(C.blk, 2);
}
function dome(x, y, s) {
  for (const sx of [-1, 1]) { R4(x + sx * 78 * s - 9 * s, y - 150 * s, 18 * s, 150 * s, C.iv, 2.4); E(x + sx * 78 * s, y - 156 * s, 13 * s, 16 * s, C.iv, 2.4); dot(x + sx * 78 * s, y - 176 * s, 3 * s, C.gold); }
  R4(x - 62 * s, y - 80 * s, 124 * s, 80 * s, C.iv, 2.6); R4(x - 64 * s, y - 92 * s, 128 * s, 14 * s, C.saf, 2.4);
  ctx.beginPath(); ctx.moveTo(x - 52 * s, y - 92 * s); ctx.bezierCurveTo(x - 76 * s, y - 150 * s, x - 18 * s, y - 170 * s, x, y - 196 * s); ctx.bezierCurveTo(x + 18 * s, y - 170 * s, x + 76 * s, y - 150 * s, x + 52 * s, y - 92 * s); ctx.closePath(); fo(C.iv, 2.6);
  st([[x, y - 196 * s], [x, y - 214 * s]], C.blk, 2.4); dot(x, y - 216 * s, 4 * s, C.gold);
  for (const ax of [-34, 0, 34]) { ctx.beginPath(); ctx.moveTo(x + (ax - 11) * s, y); ctx.lineTo(x + (ax - 11) * s, y - 40 * s); ctx.arc(x + ax * s, y - 40 * s, 11 * s, PI, 0); ctx.lineTo(x + (ax + 11) * s, y); ctx.closePath(); fo(C.blk, 1.6); }
  dots(x - 40 * s, y - 120 * s, x + 40 * s, y - 120 * s, 6, 2.6 * s, C.saf);
}
function hut(x, y, s) {
  R4(x - 34 * s, y - 40 * s, 68 * s, 40 * s, C.mud, 2.4);
  ctx.beginPath(); ctx.moveTo(x - 46 * s, y - 36 * s); ctx.quadraticCurveTo(x, y - 110 * s, x + 46 * s, y - 36 * s); ctx.closePath(); fo(C.thatch, 2.4);
  for (let k = 0; k < 4; k++) st([[x - 30 * s + k * 20 * s, y - 42 * s], [x - 10 * s + k * 7 * s, y - 70 * s]], C.blk, 1.4);
  R4(x - 10 * s, y - 28 * s, 20 * s, 28 * s, C.blk, 1.5);
}
function palm(x, y, h, lean = 0.1) {
  const tx = x + h * lean, ty = y - h; st([[x, y], [x + h * lean * 0.4, y - h * 0.5], [tx, ty]], C.blk, 7); st([[x, y], [x + h * lean * 0.4, y - h * 0.5], [tx, ty]], C.mud, 4);
  for (let k = 0; k < 7; k++) { const a = -PI * 0.95 + k * PI * 0.32 / 1.05, l = h * 0.42; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + cos(a) * l * 0.6, ty + sin(a) * l * 0.6 - 18, tx + cos(a) * l, ty + sin(a) * l + 22); ctx.strokeStyle = C.blk; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = C.leaf; ctx.lineWidth = 5; ctx.stroke(); }
}
/** the nose: a single curved line on a faceless oval (shared by the face paint and the per-frame black paint-over) */
const NOSE_LEN = 150;
function nosePath(k = 1, ox = 0, oy = 0) { ctx.beginPath(); ctx.moveTo(ox - 6 * k, oy - 66 * k); ctx.bezierCurveTo(ox + 6 * k, oy - 30 * k, ox + 24 * k, oy + 6 * k, ox + 18 * k, oy + 26 * k); ctx.quadraticCurveTo(ox + 12 * k, oy + 36 * k, ox + 2 * k, oy + 32 * k); }

// ───────────────────────────── card faces (paint functions, radius 300 space) ─────────────────────────────
const F = {
  land() {
    ctx.fillStyle = C.saf; ctx.fillRect(-300, -300, 600, 600);
    E(120, -150, 52, 52, C.iv, 3); for (let k = 0; k < 14; k++) { const a = k * TAU / 14; dot(120 + cos(a) * 68, -150 + sin(a) * 68, 4, C.ver); }
    P([[-300, 20], [-200, -70], [-110, -10], [-20, -90], [90, -20], [190, -80], [300, 0], [300, 300], [-300, 300]], C.leaf, 3);
    P([[-300, 90], [-160, 40], [-30, 80], [120, 30], [300, 80], [300, 300], [-300, 300]], C.leafL, 3);
    ctx.beginPath(); ctx.moveTo(-300, 190); ctx.bezierCurveTo(-120, 120, 60, 260, 300, 170); ctx.lineTo(300, 240); ctx.bezierCurveTo(60, 330, -120, 190, -300, 260); ctx.closePath(); fo(C.ind, 3);
    for (let k = 0; k < 9; k++) { const x = -260 + k * 62, y = 214 + sin(k * 1.3) * 22; st([[x, y], [x + 12, y - 6], [x + 24, y]], C.white, 2.4); }
    for (const [x, y, sc] of [[-170, 70, 1], [170, 90, 1]]) { R4(x - 26 * sc, y - 70, 52 * sc, 70, C.iv, 2.6); for (let k = 0; k < 4; k++) R4(x - 26 + k * 15, y - 82, 9, 12, C.iv, 1.8); R4(x - 7, y - 30, 14, 30, C.blk, 1.5); dot(x, y - 50, 3, C.ver); }
    palm(-60, 120, 130, 0.12); palm(40, 110, 110, -0.1); palm(250, 120, 120, 0.05);
    for (let k = 0; k < 4; k++) st([[-150 + k * 34, -190 + (k % 2) * 16], [-140 + k * 34, -198 + (k % 2) * 16], [-130 + k * 34, -190 + (k % 2) * 16]], C.blk, 2.4);
  },
  madurai() {
    ctx.fillStyle = C.saf; ctx.fillRect(-300, -300, 600, 600);
    for (let k = 0; k < 18; k++) { const a = k * TAU / 18; dot(cos(a) * 270, sin(a) * 270, 4, C.ver); }
    P([[-300, 150], [-120, 120], [120, 120], [300, 150], [300, 300], [-300, 300]], C.leaf, 3);
    gopuram(0, 160, 250, 380);
    fish(-180, 200, 1.4, C.leaf, 1); fish(180, 200, 1.4, C.leaf, -1);
    fish(-190, 200, 1.0, C.iv, 1); fish(190, 200, 1.0, C.iv, -1);
  },
  mysore() {
    ctx.fillStyle = C.ind; ctx.fillRect(-300, -300, 600, 600);
    for (let k = 0; k < 18; k++) { const a = k * TAU / 18; dot(cos(a) * 270, sin(a) * 270, 4, C.saf); }
    for (let k = 0; k < 7; k++) dot(-200 + k * 66, -180 + (k % 2) * 30, 5, C.iv);
    P([[-300, 170], [300, 170], [300, 300], [-300, 300]], C.leaf, 3);
    elephant(-20, 190, 2.1, C.iv, C.ver);
  },
  battle() {
    ctx.fillStyle = C.ver; ctx.fillRect(-300, -300, 600, 600);
    P([[-300, 170], [300, 170], [300, 300], [-300, 300]], C.blk, 3);
    for (const sx of [-1, 1]) { st([[sx * -210, 220], [sx * 190, -210]], C.blk, 9); st([[sx * -210, 220], [sx * 190, -210]], C.iv, 5); P([[sx * 190 - 14, -200], [sx * 190 + 10, -224], [sx * 222, -248], [sx * 204, -212]], C.iv, 2.5); }
    for (const sx of [-1, 1]) { E(sx * 120, 70, 78, 78, C.ind, 3); E(sx * 120, 70, 54, 54, C.indL, 2); dot(sx * 120, 70, 12, C.gold); for (let k = 0; k < 10; k++) { const a = k * TAU / 10; dot(sx * 120 + cos(a) * 66, 70 + sin(a) * 66, 4, C.gold); } }
    P([[-14, -220], [10, -220], [10, -40], [-14, -40]], C.blk, 2); P([[10, -220], [120, -190], [10, -160]], C.saf, 2.5);
    spearman(-200, 250, 1.1, C.ind); spearman(-130, 250, 1.1, C.saf); spearman(140, 250, 1.1, C.leaf); spearman(210, 250, 1.1, C.ind);
  },
  nose() {
    ctx.fillStyle = C.iv; ctx.fillRect(-300, -300, 600, 600);
    for (let k = 0; k < 24; k++) { const a = k * TAU / 24; dot(cos(a) * 272, sin(a) * 272, 4.5, C.ver); }
    P([[-290, 300], [290, 300], [230, 190], [80, 150], [-80, 150], [-230, 190]], C.saf, 4);
    dots(-200, 220, 200, 220, 13, 4.5, C.white); dots(-150, 260, 150, 260, 9, 4, C.ver);
    R4(-36, 110, 72, 50, C.skin, 4);
    E(0, -20, 128, 158, C.skin, 5);
    dot(-62, -110, 9); dot(-80, -82, 4.5);
    nosePath(1, 0, -10); ink(7);
  },
  tiru() {
    ctx.fillStyle = C.ver; ctx.fillRect(-300, -300, 600, 600);
    // Nayak palace: big round pillars and broad arches
    for (const ax of [-170, 0, 170]) { ctx.beginPath(); ctx.moveTo(ax - 85, 260); ctx.lineTo(ax - 85, -60); ctx.arc(ax, -60, 85, PI, 0); ctx.lineTo(ax + 85, 260); ctx.closePath(); fo(C.ind, 3); }
    for (const px of [-255, -85, 85, 255]) {
      R4(px - 26, -80, 52, 340, C.white, 3); for (let k = 0; k < 5; k++) st([[px - 26, -40 + k * 66], [px + 26, -40 + k * 66]], C.saf, 3);
      R4(px - 34, -100, 68, 22, C.saf, 2.5); E(px, -112, 30, 10, C.saf, 2.5); dots(px, -30, px, 230, 5, 3, C.ver);
    }
    for (let k = 0; k < 16; k++) dot(-260 + k * 35, -230 + (k % 2) * 14, 4, C.iv);
    P([[-300, 250], [300, 250], [300, 300], [-300, 300]], C.blk, 3); dots(-280, 272, 280, 272, 16, 4, C.saf);
    seatedKing(0, 250, 1.18);
  },
  myking() {
    ctx.fillStyle = C.saf; ctx.fillRect(-300, -300, 600, 600);
    ctx.beginPath(); ctx.moveTo(-170, 260); ctx.lineTo(-170, -70); ctx.arc(0, -70, 170, PI, 0); ctx.lineTo(170, 260); ctx.closePath(); fo(C.ver, 3);
    ctx.beginPath(); ctx.moveTo(-140, 260); ctx.lineTo(-140, -70); ctx.arc(0, -70, 140, PI, 0); ctx.lineTo(140, 260); ctx.closePath(); fo(C.iv, 3);
    for (let k = 0; k < 12; k++) { const a = PI + k * PI / 11; dot(cos(a) * 155, -70 + sin(a) * 155, 4.5, C.gold); }
    P([[-300, 250], [300, 250], [300, 300], [-300, 300]], C.leaf, 3);
    elephant(-205, 250, 0.75, C.ind, C.ver); elephant(205, 250, 0.75, C.ind, C.ver);
    turbanKing(-10, 262, 1.25);
  },
  bijapur() {
    ctx.fillStyle = C.leaf; ctx.fillRect(-300, -300, 600, 600);
    for (let k = 0; k < 18; k++) { const a = k * TAU / 18; dot(cos(a) * 270, sin(a) * 270, 4, C.saf); }
    P([[-300, 190], [300, 190], [300, 300], [-300, 300]], C.leafD, 3);
    dome(0, 200, 1.75);
    for (let k = 0; k < 6; k++) dot(-230 + k * 92, -200 + (k % 2) * 24, 5, C.iv);
  },
  dagger() {
    ctx.fillStyle = C.blk; ctx.fillRect(-300, -300, 600, 600);
    for (let k = 0; k < 18; k++) { const a = k * TAU / 18; dot(cos(a) * 268, sin(a) * 268, 4.5, C.saf); }
    ctx.save(); ctx.rotate(-0.75);
    P([[-18, -40], [18, -40], [0, -250]], C.iv, 3); st([[0, -60], [0, -220]], C.blk, 2);
    R4(-70, -48, 140, 18, C.saf, 3); R4(-14, -30, 28, 120, C.ver, 3); dots(0, -14, 0, 76, 5, 3, C.gold); E(0, 104, 22, 22, C.saf, 3);
    ctx.restore();
  },
  soldbg() {
    ctx.fillStyle = C.saf; ctx.fillRect(-300, -300, 600, 600);
    P([[-300, -40], [-180, -120], [-60, -60], [60, -140], [200, -70], [300, -110], [300, 300], [-300, 300]], C.leaf, 3);
    P([[-300, 150], [300, 150], [300, 300], [-300, 300]], C.mud, 3);
    for (let k = 0; k < 10; k++) dot(-270 + k * 60, 240 + (k % 2) * 14, 4, C.iv);
    E(-170, -200, 40, 40, C.iv, 3);
  },
  village() {
    ctx.fillStyle = C.saf; ctx.fillRect(-300, -300, 600, 600);
    E(150, -170, 44, 44, C.iv, 3);
    P([[-300, 60], [-120, 20], [100, 50], [300, 10], [300, 300], [-300, 300]], C.leaf, 3);
    palm(-230, 90, 190, 0.1); palm(230, 80, 170, -0.12);
    hut(-120, 110, 1.6); hut(110, 100, 1.4); hut(0, 60, 1.0);
    P([[-300, 150], [300, 150], [300, 300], [-300, 300]], C.leafL, 3);
    villager(-150, 250, 1.5, C.white, C.ver); villager(-50, 240, 1.4, C.white, C.ind); villager(60, 250, 1.5, C.white, C.leaf); villager(160, 240, 1.3, C.ver, C.white);
  },
  riderbg() {
    ctx.fillStyle = C.saf; ctx.fillRect(-300, -300, 600, 600);
    E(160, -170, 42, 42, C.iv, 3);
    P([[-300, 0], [-160, -90], [-40, -30], [80, -110], [220, -40], [300, -70], [300, 300], [-300, 300]], C.leaf, 3);
    P([[-300, 150], [300, 150], [300, 300], [-300, 300]], C.mud, 3);
  },
  sFish() { ctx.fillStyle = C.saf; ctx.fillRect(-300, -300, 600, 600); fish(0, -70, 3.2, C.leaf, 1); fish(0, 90, 3.2, C.leaf, -1); },
  sEle() { ctx.fillStyle = C.ind; ctx.fillRect(-300, -300, 600, 600); elephant(-30, 150, 2.4, C.iv, C.ver); },
  sDome() { ctx.fillStyle = C.leaf; ctx.fillRect(-300, -300, 600, 600); dome(0, 190, 2.0); },
};

// ───────────────────────────── card machinery ─────────────────────────────
function rimBand(R) {
  const ri = R * 0.8, b0 = R * 0.93, mid = (b0 + ri) / 2, pr = (b0 - ri) * 0.36;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fillStyle = C.rim; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, R * 0.965, 0, TAU); ctx.strokeStyle = C.gold; ctx.lineWidth = Math.max(1.5, R * 0.01); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, b0, 0, TAU); ctx.fillStyle = C.blk; ctx.fill();
  const n = Math.max(14, Math.round(TAU * mid / Math.max(9, pr * 3.4)));
  for (let k = 0; k < n; k++) {
    const a = k * TAU / n; ctx.beginPath(); ctx.ellipse(cos(a) * mid, sin(a) * mid, pr * 1.25, pr * 0.62, a, 0, TAU); ctx.fillStyle = k % 2 ? C.saf : C.iv; ctx.fill();
    const a2 = a + PI / n; dot(cos(a2) * mid, sin(a2) * mid, pr * 0.32, C.ver);
  }
  for (const r of [b0, ri]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.strokeStyle = C.gold; ctx.lineWidth = Math.max(1.2, R * 0.008); ctx.stroke(); }
  return ri;
}
function gloss(R) {
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, R * 0.87, PI * 1.07, PI * 1.42); ctx.strokeStyle = 'rgba(255,250,235,0.30)'; ctx.lineWidth = R * 0.035; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, R * 0.62, PI * 1.12, PI * 1.3); ctx.strokeStyle = 'rgba(255,250,235,0.13)'; ctx.lineWidth = R * 0.05; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, R - 1, 0, TAU); ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 2; ctx.stroke();
}
/** a round Ganjifa card face, baked once: lacquer rim, gold rings, petal band, painted ground, gloss. origin = centre */
function card(key, R, paint, q = 1) {
  const S = 2 * R + 8;
  const c = cached('a' + key + R + '_' + q, S, S, q, () => {
    ctx.translate(R + 4, R + 4);
    const ri = rimBand(R);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, ri, 0, TAU); ctx.clip();
    ctx.save(); ctx.scale(ri / 300, ri / 300); paint(); ctx.restore();
    const g = ctx.createRadialGradient(0, 0, ri * 0.7, 0, 0, ri); g.addColorStop(0, 'rgba(60,20,0,0)'); g.addColorStop(1, 'rgba(60,20,0,0.28)'); ctx.fillStyle = g; ctx.fillRect(-ri, -ri, 2 * ri, 2 * ri);
    ctx.fillStyle = 'rgba(255,200,120,0.05)'; ctx.fillRect(-ri, -ri, 2 * ri, 2 * ri);
    ctx.restore();
    gloss(R);
  });
  c._R = R; return c;
}
function back(R) {
  const S = 2 * R + 8;
  const c = cached('aback' + R, S, S, 1, () => {
    ctx.translate(R + 4, R + 4);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fillStyle = C.rim; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, R * 0.92, 0, TAU); ctx.fillStyle = C.maroon; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, R * 0.92, 0, TAU); ctx.strokeStyle = C.gold; ctx.lineWidth = Math.max(1.2, R * 0.01); ctx.stroke();
    const rr0 = R * 0.2;
    for (let k = 0; k < 8; k++) { const a = k * TAU / 8; ctx.beginPath(); ctx.ellipse(cos(a) * rr0 * 0.7, sin(a) * rr0 * 0.7, rr0 * 0.55, rr0 * 0.24, a, 0, TAU); ctx.fillStyle = C.gold; ctx.fill(); }
    dot(0, 0, rr0 * 0.3, C.saf); dot(0, 0, rr0 * 0.14, C.maroon);
    for (let k = 0; k < 24; k++) { const a = k * TAU / 24; dot(cos(a) * R * 0.84, sin(a) * R * 0.84, Math.max(1, R * 0.012), 'rgba(216,168,69,0.7)'); }
    gloss(R);
  });
  c._R = R; return c;
}
const SH = () => cached('ashadow', 1000, 1000, 0.4, () => {
  const g = ctx.createRadialGradient(500, 500, 0, 500, 500, 480);
  g.addColorStop(0, 'rgba(0,6,2,0.62)'); g.addColorStop(0.8, 'rgba(0,6,2,0.5)'); g.addColorStop(0.9, 'rgba(0,6,2,0.2)'); g.addColorStop(1, 'rgba(0,6,2,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 1000);
});
/** draw a cached card at (x, y): s scale, sx horizontal squash (flip), rot, a alpha, lift (raises the shadow), after() runs in card-local space */
function dc(c, x, y, o = {}) {
  const s = o.s ?? 1, sx = o.sx ?? 1, rot = o.rot ?? 0, a = o.a ?? 1, lift = o.lift ?? 0, R = c._R * s;
  if (a <= 0) return;
  if (o.sh !== false) blit(SH(), 500, 500, x + R * (0.05 + lift * 0.14), y + R * (0.08 + lift * 0.2), R / 400 * Math.max(Math.abs(sx), 0.05) * (1 + lift * 0.12), a * (1 - lift * 0.35), R / 400 * (1 + lift * 0.12));
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx * s, s);
  const Lz = c.width / c._q; ctx.drawImage(c, -Lz / 2, -Lz / 2, Lz, Lz);
  if (o.after) o.after();
  ctx.restore();
}
/** flip p 0 → 1: back → face (scaleX = cos) with a lift */
function flip(face, bk, x, y, p, o = {}) {
  const ang = clamp(p) * PI, c = cos(ang), lift = sin(ang), showFace = c <= 0;
  dc(showFace ? face : bk, x, y, { ...o, sx: Math.max(0.02, Math.abs(c)), s: (o.s ?? 1) * (1 + 0.08 * lift), lift: (o.lift ?? 0) + lift, after: showFace ? o.after : null });
}
/** lacquer crackle lines (cached per card size), revealed inside a growing circle */
function crackle(R) {
  return cached('acrk' + R, 2 * R + 8, 2 * R + 8, 1, () => {
    ctx.translate(R + 4, R + 4); const ri = R * 0.8; ctx.beginPath(); ctx.arc(0, 0, R * 0.97, 0, TAU); ctx.clip(); ctx.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      let a = rnd(i * 3.1) * TAU, r = Math.sqrt(rnd(i * 5.7)) * ri, x = cos(a) * r, y = sin(a) * r, d = rnd(i * 9.2) * TAU;
      const pts = [[x, y]]; for (let k = 0; k < 7; k++) { d += (rnd(i * 31 + k) - 0.5) * 1.4; x += cos(d) * R * 0.07; y += sin(d) * R * 0.07; pts.push([x, y]); }
      st(pts.map(([px, py]) => [px + 1, py + 1]), 'rgba(255,240,210,0.22)', 1.2); st(pts, 'rgba(27,20,16,0.6)', 1.3);
    }
  });
}
function crackOver(R, p) {
  if (p <= 0) return; const cr = crackle(R), Lz = cr.width;
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R * 1.02 * eo(p), 0, TAU); ctx.clip(); ctx.drawImage(cr, -Lz / 2, -Lz / 2); ctx.restore();
}
function dull(R, a) {
  if (a <= 0) return; ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU);
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${a * 0.85})`; ctx.fill();
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(60,42,24,${a * 0.3})`; ctx.fill(); ctx.restore();
}
/** black paint brushed over the nose line, p 0 → 1, in card-local space of a card of radius R */
function paintNose(R, p) {
  if (p <= 0) return; const k = R * 0.8 / 300;
  ctx.save(); nosePath(k, 0, -10 * k); ctx.setLineDash([NOSE_LEN * k * 1.1 * eio(clamp(p / 0.6)), 4000]);
  ctx.strokeStyle = C.blk; ctx.lineWidth = 62 * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.setLineDash([]);
  const b = eo(seg(p, 0.45, 1)); if (b > 0) { ctx.beginPath(); ctx.ellipse(8 * k, -14 * k, 36 * k * b, 58 * k * b, 0.15, 0, TAU); ctx.fillStyle = C.blk; ctx.fill(); }
  ctx.restore();
}

// ───────────────────────────── table, slips, counters ─────────────────────────────
const SCATTER = [
  [[120, 260, 120], [985, 330, 95], [60, 1090, 100], [1010, 1120, 105], [960, 820, 70]],
  [[95, 420, 100], [1000, 190, 120], [1030, 1050, 100], [60, 1010, 80]],
  [[980, 520, 110], [80, 640, 90], [110, 1060, 95], [1000, 1090, 85], [130, 180, 80]],
];
function table(v = 0) {
  return cached('atable' + v, 1240, 2080, 0.75, () => {
    ctx.translate(80, 80);
    ctx.fillStyle = C.baize; ctx.fillRect(-80, -80, 1240, 2080);
    for (let i = 0; i < 70000; i++) { const x = rnd(i * 1.37 + v) * 1240 - 80, y = rnd(i * 2.71 + 0.5) * 2080 - 80; ctx.fillStyle = rnd(i * 0.91) > 0.5 ? 'rgba(170,220,180,0.05)' : 'rgba(0,0,0,0.09)'; ctx.fillRect(x, y, 2.2, 2.2); }
    for (let y = -80; y < 2000; y += 5) { ctx.fillStyle = 'rgba(0,0,0,0.035)'; ctx.fillRect(-80, y, 1240, 1.4); }
    for (const [x, y, r] of SCATTER[v % 3]) { const b = back(r); blit(SH(), 500, 500, x + r * 0.06, y + r * 0.09, r / 400); ctx.drawImage(b, x - b.width / 2, y - b.height / 2); }
    const g = ctx.createRadialGradient(540, 700, 60, 540, 760, 1250);
    g.addColorStop(0, 'rgba(255,196,110,0.20)'); g.addColorStop(0.35, 'rgba(255,170,80,0.06)'); g.addColorStop(0.7, 'rgba(0,0,0,0.38)'); g.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = g; ctx.fillRect(-80, -80, 1240, 2080);
  });
}
const tbl = (v = 0, dx = 0, dy = 0) => blit(table(v), 80, 80, dx, dy);
function slip(text, x, y, o = {}) {
  const sz = o.size ?? 34, a = o.a ?? 1, sc = o.sc ?? 1, rot = o.rot ?? 0; if (a <= 0 || sc <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  const sp = sz * 0.08; ctx.font = `700 ${sz}px Caladea`; ctx.letterSpacing = `${sp}px`;
  const tw = ctx.measureText(text).width, w = tw + sz * 1.1, h = sz * 1.55;
  ctx.fillStyle = 'rgba(0,8,3,0.45)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);
  ctx.fillStyle = C.slip; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = C.red; ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
  ctx.fillStyle = C.bill; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, sp / 2, sz * 0.06);
  ctx.restore(); ctx.letterSpacing = '0px';
}
const pop = (lt, t0, dur = 0.32) => eob(seg(lt, t0, t0 + dur));
function chips(x, y, n, r = 36) {
  for (let i = 0; i < n; i++) {
    const yy = y - i * 9, ox = (rnd(i * 7 + x) - 0.5) * 4;
    ctx.beginPath(); ctx.ellipse(x + ox, yy + 5, r, r * 0.4, 0, 0, TAU); ctx.fillStyle = '#8D7A58'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + ox, yy, r, r * 0.4, 0, 0, TAU); ctx.fillStyle = '#EFE4C8'; ctx.fill(); ctx.strokeStyle = 'rgba(40,20,8,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + ox, yy, r * 0.66, r * 0.26, 0, 0, TAU); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.stroke();
  }
}
function chipShadow(x, y, r = 36) { ctx.beginPath(); ctx.ellipse(x + 8, y + 10, r * 1.15, r * 0.5, 0, 0, TAU); ctx.fillStyle = 'rgba(0,6,2,0.4)'; ctx.fill(); }
/** short ivory spark strokes bursting from (x, y), p 0 → 1 */
function burst(x, y, p, n = 12, r0 = 40, r1 = 150, seed = 0) {
  if (p <= 0 || p >= 1) return; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = i * TAU / n + rnd(i + seed) * 0.4, ra = lerp(r0, r1, eo(p)), rb = ra + 30 * (1 - p); st([[x + cos(a) * ra, y + sin(a) * ra], [x + cos(a) * rb, y + sin(a) * rb]], `rgba(246,239,220,${1 - p})`, 5); }
}
const shake = (lt, t0, amp = 10) => { const k = seg(lt, t0, t0 + 0.4); return k <= 0 || k >= 1 ? [0, 0] : [sin(lt * 90) * amp * (1 - k), cos(lt * 77) * amp * (1 - k)]; };

// ───────────────────────────── sprites drawn into card space ─────────────────────────────
const RIDER = () => cached('arider', 560, 520, 1.6, () => {
  ctx.translate(250, 500);
  st([[-118, -170], [-150, -130], [-160, -70]], C.blk, 12);
  limb([[-80, -120], [-98, -60], [-96, 0]], C.white, 16); limb([[-48, -120], [-30, -60], [-36, 0]], C.white, 16);
  limb([[62, -120], [84, -60], [86, 0]], C.white, 16); limb([[92, -120], [122, -70], [130, -20]], C.white, 16);
  E(0, -150, 126, 56, C.white, 3);
  P([[70, -190], [112, -196], [176, -284], [142, -312]], C.white, 3);
  E(170, -298, 46, 22, C.white, 3, 0.55); P([[150, -322], [160, -346], [168, -318]], C.white, 2); dot(176, -304, 3.2, C.blk);
  for (let k = 0; k < 6; k++) st([[92 + k * 9, -206 - k * 16], [80 + k * 9, -214 - k * 16]], C.blk, 6);
  P([[-56, -206], [52, -206], [62, -136], [-66, -136]], C.ver, 3); dots(-56, -146, 56, -146, 8, 3.4, C.gold); dots(-40, -190, 40, -190, 5, 3, C.white);
  limb([[-6, -200], [16, -140], [8, -96]], C.ind, 16);
  P([[-24, -200], [24, -200], [18, -300], [-18, -300]], C.ind, 3); R4(-22, -238, 44, 12, C.saf, 2);
  limb([[8, -286], [44, -262], [70, -290]], C.ind, 12);
  st([[-70, -190], [230, -470]], C.blk, 6); P([[220, -456], [236, -476], [248, -490], [228, -468]], C.iv, 2); P([[214, -470], [240, -492], [222, -500]], C.iv, 2);
  E(0, -324, 21, 26, C.skin, 3); dot(-8, -334, 2.8);
  E(0, -346, 27, 14, C.white, 2.5); E(3, -358, 20, 11, C.white, 2.5); P([[6, -364], [14, -394], [20, -364]], C.saf, 2);
});
const SOLD = () => cached('asold', 1700, 300, 1.4, () => {
  ctx.translate(0, 280);
  for (let i = 0; i < 17; i++) spearman(40 + i * 100, -120, 1.05, [C.ind, C.ver, C.ind][i % 3], C.saf);
  for (let i = 0; i < 17; i++) spearman(90 + i * 100, 0, 1.45, [C.ind, C.leaf, C.ver][i % 3], [C.ver, C.saf][i % 2]);
});

// ───────────────────────────── shots ─────────────────────────────
export function buildA(add, cue) {
  const shot = (id, at, note, cam, zoom, draw) => add({ id, at, note, cam, zoom, draw });
  const T1 = Wd('two', 0), T2 = Wd('fought', 0), T3 = Wd('not', 0), T4 = Wd('but', 0), T5 = L(1), T6 = Wd('the', 1) - 0.2, T7 = Le(1) + 0.04,
    T8 = Wd('enemy', 2), T9 = Wd('when', 2), T10 = Wd('struck', 2) - 0.52, T11 = L(3), T12 = L(4), T13 = Wd('cut', 4), T14 = Wd('even', 4), TEND = L(5);

  // a1 · 1656: a face-down card flips on the baize to reveal the southern land; counters stack up for the year
  shot('a1', 0, 'round card flips: the southern land · counters stack · 1656', [540, 820], 0.08, (lt) => {
    tbl(0);
    const n = Math.floor(seg(lt, 0.95, 1.9) * 7 + 0.001);
    for (const cx of [190, 890]) { chipShadow(cx, 1215); chips(cx, 1215, Math.max(1, n)); }
    flip(card('land', 370, F.land), back(370), 540, 680 - 30 * (1 - eo(seg(lt, 0, 0.4))), eio(seg(lt, 0.3, 1.05)), { rot: lerp(-0.12, 0, eo(seg(lt, 0, 1.1))) });
    slip('1656', 540, 1200, { size: 46, sc: pop(lt, 1.0) });
  });
  cue(0.02, 'swell', { gain: 0.45, dur: 2.4 }); cue(0.3, 'whoosh', { gain: 0.5, dur: 0.8 }); cue(1.02, 'tock', { gain: 0.5 });
  for (let i = 0; i < 6; i++) cue(1.0 + i * 0.14, 'plop', { gain: 0.22, pan: i % 2 ? 0.5 : -0.5 });

  // a2 · two kingdoms: Madurai and Mysore cards are dealt in from opposite sides
  shot('a2', T1, 'deal: Madurai gopuram card vs Mysore elephant card', [540, 760], 0.07, (lt) => {
    tbl(1);
    const pa = eo(seg(lt, 0, 0.55)), pb = eo(seg(lt, 0.22, 0.78));
    dc(card('madurai', 250, F.madurai), lerp(-320, 300, pa), lerp(260, 560, pa), { rot: (1 - pa) * -3, lift: (1 - pa) * 0.8 });
    dc(card('mysore', 250, F.mysore), lerp(1400, 780, pb), lerp(1250, 930, pb), { rot: (1 - pb) * 3, lift: (1 - pb) * 0.8 });
    slip('MADURAI', 300, 860, { sc: pop(lt, 0.55) }); slip('MYSORE', 780, 630, { sc: pop(lt, 0.8) });
  });
  cue(T1, 'whoosh', { gain: 0.5, pan: -0.5 }); cue(T1 + 0.5, 'thud', { gain: 0.45, pan: -0.4 }); cue(T1 + 0.22, 'whoosh', { gain: 0.45, pan: 0.5 }); cue(T1 + 0.76, 'thud', { gain: 0.45, pan: 0.4 });

  // a3 · fought a war: suits as armies, fish cards and elephant cards pushed into each other across the baize
  shot('a3', T2, 'suits as armies: fish suit vs elephant suit clash mid-table', [540, 720], 0.1, (lt) => {
    tbl(2);
    const fishC = card('sFish', 58, F.sFish), eleC = card('sEle', 58, F.sEle), tc = 0.5;
    const push = 70 * eio(seg(lt, 0.3, tc)), jol = lt > tc ? sin((lt - tc) * 26) * 10 * Math.exp(-(lt - tc) * 2.2) : 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const d = 0.04 * r + 0.06 * (3 - c), p = eo(seg(lt, d, d + 0.45)), y = 470 + r * 150 + (c % 2) * 22, wob = lt > tc ? sin(lt * 7 + r * 2 + c) * 4 : 0;
      const bx = 110 + c * 100 + push + jol * (c / 3);
      dc(fishC, bx - (1 - p) * 760, y + wob, { rot: (1 - p) * -4 + wob * 0.02, lift: (1 - p) * 0.6 });
      dc(eleC, 970 - c * 100 - push - jol * (c / 3) + (1 - p) * 760, y - wob, { rot: (1 - p) * 4 - wob * 0.02, lift: (1 - p) * 0.6 });
    }
    for (let r = 0; r < 4; r++) burst(540, 470 + r * 150 + 10, seg(lt, tc, tc + 0.45), 9, 20, 90, r);
  });
  for (let i = 0; i < 5; i++) cue(T2 + 0.05 + i * 0.06, 'slide', { gain: 0.25, pan: i % 2 ? 0.6 : -0.6 });
  cue(T2 + 0.5, 'thud', { gain: 0.55 }); cue(T2 + 0.5, 'drum', { gain: 0.5 }); cue(T2 + 1.2, 'tock', { gain: 0.3, pan: -0.3 }); cue(T2 + 1.6, 'tock', { gain: 0.3, pan: 0.3 });

  // a4 · not for its battles: the battle card's lacquer dulls and crackles, then it slides away off the table
  shot('a4', T3, 'lacquer crackle: battle card fades and slides away', [540, 700], 0.08, (lt, d) => {
    tbl(0);
    const R = 340, cr = seg(lt, 0.05, 0.85), out = eio(seg(lt, 0.8, d));
    dc(card('battle', R, F.battle), lerp(540, -260, out), lerp(690, 1000, out), { rot: -out * 1.2, s: 1 - out * 0.35, lift: out * 0.4,
      after: () => { dull(R, cr); crackOver(R, cr); } });
  });
  cue(T3 + 0.05, 'chisel', { gain: 0.22, dur: 0.7 }); cue(T3 + 0.85, 'whoosh', { gain: 0.45, pan: -0.6 });

  // a5 · but for noses: a card flips to show the faceless face icon; the nose line pulses
  shot('a5', T4, 'flip reveals the faceless face card: one nose line', [540, 650], 0.12, (lt) => {
    tbl(1);
    const R = 360, k = R * 0.8 / 300, tn = Wd('noses', 0) - T4;
    flip(card('nose', R, F.nose), back(R), 540, 690, eio(seg(lt, 0.0, tn)), {
      after: () => { for (let i = 0; i < 2; i++) { const p = ((lt - tn) * 0.8 + i * 0.5) % 1; if (lt < tn) continue; ctx.beginPath(); ctx.arc(8 * k, -10 * k, (90 + p * 120) * k, 0, TAU); ctx.strokeStyle = `rgba(200,64,30,${0.7 * (1 - p)})`; ctx.lineWidth = 6 * k; ctx.stroke(); } } });
  });
  cue(T4 + 0.02, 'whoosh', { gain: 0.5 }); cue(Wd('noses', 0), 'slam', { gain: 0.5 }); cue(Wd('noses', 0) + 0.7, 'heartbeat', { gain: 0.35 });

  // a6 · Tirumala Nayak, king of Madurai: card dealt down, then the camera pushes into its painted palace
  shot('a6', T5, 'push-in through the card: Tirumala Nayak seated in his palace', [540, 690], 0.05, (lt, d) => {
    const z = 1 + 0.42 * eio(seg(lt, 0.45, d)), pin = eo(seg(lt, 0, 0.5));
    ctx.save(); ctx.translate(540, 690); ctx.scale(z, z); ctx.translate(-540, -690);
    tbl(2);
    dc(card('tiru', 330, F.tiru, 1.7), 540, lerp(-420, 690, pin), { rot: (1 - pin) * 2.5, lift: (1 - pin) * 0.8 });
    ctx.restore();
    slip('ILLUSTRATION', 540, 1240, { size: 26, sc: pop(lt, Wd('tirumala', 1) - T5) });
    slip('MADURAI', 540, 175, { sc: pop(lt, Wd('madurai', 1) - T5) });
  });
  cue(T5, 'whoosh', { gain: 0.5 }); cue(T5 + 0.48, 'thud', { gain: 0.45 }); cue(Wd('tirumala', 1), 'bell', { gain: 0.3 }); cue(Wd('madurai', 1), 'pop', { gain: 0.4 });

  // a7 · on the other side, Kanthirava Narasaraja of Mysore: Tirumala card slides aside, Mysore king card flips
  shot('a7', T6, 'Tirumala card slides aside; Mysore king card flips · MYSORE', [580, 760], 0.08, (lt) => {
    tbl(0);
    const m = eio(seg(lt, 0, 0.6));
    dc(card('tiru', 330, F.tiru, 1.7), lerp(540, 220, m), lerp(690, 330, m), { s: lerp(1, 0.55, m), rot: m * -0.2 });
    const din = eo(seg(lt, 0.05, 0.5));
    flip(card('myking', 340, F.myking, 1.2), back(340), lerp(1400, 610, din), 770, eio(seg(lt, 0.4, 1.0)), { lift: (1 - din) * 0.6 });
    slip('MYSORE', 610, 1205, { sc: pop(lt, Wd('mysore', 1) - T6) });
  });
  cue(T6 + 0.05, 'slide', { gain: 0.35, pan: -0.5 }); cue(T6 + 0.1, 'whoosh', { gain: 0.45, pan: 0.5 }); cue(T6 + 0.45, 'whoosh', { gain: 0.4 }); cue(Wd('mysore', 1), 'pop', { gain: 0.4 });

  // a8 · Madurai had sided with...: the Madurai card turns away from Mysore and slides to a face-down card
  const MAD_A = [300, 860], MYS_A = [770, 440], BIJ = [740, 930];
  shot('a8', T7, 'Madurai card slides away from Mysore toward a face-down card', [540, 700], 0.07, (lt) => {
    tbl(1);
    const myIn = eo(seg(lt, 0, 0.45)), mv = eio(seg(lt, Wd('sided', 2) - T7 - 0.2, Wd('sided', 2) - T7 + 0.6)), bIn = eo(seg(lt, 1.5, 2.0));
    dc(back(250), lerp(1450, BIJ[0], bIn), BIJ[1] + (1 - bIn) * 200, { rot: (1 - bIn) * 3, lift: (1 - bIn) * 0.6 });
    dc(card('mysore', 250, F.mysore), MYS_A[0], lerp(-350, MYS_A[1], myIn), { rot: (1 - myIn) * 2, lift: (1 - myIn) * 0.7 });
    const mx = lerp(470, MAD_A[0], mv), my = lerp(700, MAD_A[1], mv);
    dc(card('madurai', 250, F.madurai), mx, my, { rot: mv * -0.25, lift: sin(mv * PI) * 0.5 });
    slip('MADURAI', mx, my + 272, { sc: pop(lt, 0.1) });
  });
  cue(T7 + 0.02, 'whoosh', { gain: 0.45 }); cue(T7 + 0.42, 'thud', { gain: 0.4 }); cue(Wd('sided', 2) - 0.15, 'slide', { gain: 0.4, pan: -0.5 }); cue(T7 + 1.5, 'whoosh', { gain: 0.35, pan: 0.6 });

  // a9 · Mysore's enemy, the Sultan of Bijapur: the face-down card flips to the domed Bijapur card; Madurai sides with it
  shot('a9', T8, 'flip: Bijapur dome card; Madurai card slides up beside it · BIJAPUR', [600, 760], 0.08, (lt) => {
    tbl(1);
    dc(card('mysore', 250, F.mysore), MYS_A[0], MYS_A[1], { a: 1, after: () => dull(250, 0.25 * seg(lt, 0, 0.5)) });
    flip(card('bijapur', 250, F.bijapur), back(250), BIJ[0], BIJ[1], eio(seg(lt, 0.0, 0.5)));
    const mv = eio(seg(lt, 0.5, 1.2)), mx = lerp(MAD_A[0], 330, mv), my = lerp(MAD_A[1], 1000, mv);
    dc(card('madurai', 250, F.madurai), mx, my, { rot: lerp(-0.25, 0.05, mv), lift: sin(mv * PI) * 0.4 });
    burst(530, 970, seg(lt, 1.15, 1.6), 10, 30, 110, 4);
    slip('BIJAPUR', 900, 660, { sc: pop(lt, Wd('bijapur', 2) - T8), rot: -0.04 });
  });
  cue(T8 + 0.02, 'whoosh', { gain: 0.45 }); cue(T8 + 0.5, 'slide', { gain: 0.35, pan: -0.4 }); cue(T8 + 1.15, 'tock', { gain: 0.4 }); cue(Wd('bijapur', 2), 'pop', { gain: 0.4 });

  // a10 · the Bijapur army went home: the dome-suit army slides off north, the Bijapur card flips face-down and leaves
  shot('a10', T9, 'Bijapur dome-suit army slides off north; Bijapur card flips down and leaves', [540, 720], 0.07, (lt) => {
    tbl(1);
    const dC = card('sDome', 62, F.sDome), th = Wd('home', 2) - T9;
    for (let i = 0; i < 6; i++) {
      const d = 0.15 + i * 0.12, p = eio(seg(lt, d, d + 0.7)), x0 = 150 + i * 156, y0 = 560 + (i % 2) * 40;
      dc(dC, x0 + p * (200 + i * 30), y0 - p * 900, { rot: p * 1.5, lift: sin(p * PI) * 0.7 });
    }
    const out = eio(seg(lt, th + 0.25, th + 0.9));
    flip(card('bijapur', 250, F.bijapur), back(250), BIJ[0] + out * 700, BIJ[1] - out * 300, 1 - eio(seg(lt, th - 0.2, th + 0.25)), { rot: out * 0.6 });
    dc(card('madurai', 250, F.madurai), 330, 1000, { rot: 0.05 });
  });
  for (let i = 0; i < 6; i++) cue(T9 + 0.15 + i * 0.12, 'slide', { gain: 0.22, pan: -0.6 + i * 0.24 });
  cue(Wd('home', 2) - 0.2, 'whoosh', { gain: 0.45 }); cue(Wd('home', 2) + 0.3, 'whoosh', { gain: 0.35, pan: 0.6 });

  // a11 · Mysore struck back: trick taken, the Mysore card slaps down on Madurai, the beaten card slides into a pile
  shot('a11', T10, 'trick taken: Mysore card slaps on Madurai; Madurai slides to the pile', [560, 760], 0.08, (lt) => {
    const ts = Wd('struck', 2) - T10, [jx, jy] = shake(lt, ts, 12);
    ctx.save(); ctx.translate(jx, jy);
    tbl(0);
    for (let i = 0; i < 3; i++) dc(back(130), 170 + i * 6, 1150 - i * 10, { rot: i * 0.3 });
    const sl = eio(seg(lt, ts + 0.45, ts + 1.2));
    dc(card('madurai', 250, F.madurai), lerp(470, 182, sl), lerp(840, 1120, sl), { s: lerp(1, 0.52, sl), rot: sl * -1.2, after: () => dull(250, sl * 0.4) });
    const dn = clamp(lt / ts), s = lerp(1.7, 1, eio(dn));
    dc(card('mysore', 250, F.mysore), lerp(760, 610, eio(dn)), lerp(380, 700, eio(dn)), { s, a: clamp(dn * 3), lift: (1 - eio(dn)) * 1.3, rot: (1 - dn) * 0.5 });
    burst(610, 700, seg(lt, ts, ts + 0.5), 14, 260, 360, 7);
    ctx.restore();
    slip('MYSORE', 610, 1030, { sc: pop(lt, ts + 0.05) });
  });
  cue(T10 + 0.05, 'whoosh', { gain: 0.5 }); cue(Wd('struck', 2), 'slam', { gain: 0.6 }); cue(Wd('struck', 2), 'thud', { gain: 0.5 }); cue(Wd('back', 2) + 0.05, 'slide', { gain: 0.4, pan: -0.6 }); cue(Wd('back', 2) + 0.6, 'plop', { gain: 0.35, pan: -0.6 });

  // a12 · its army marched south under a general named Hampaiya: elephant-suit columns step down the table;
  //       the general's card flips: a faceless rider on horseback, then the camera pushes in
  shot('a12', T11, 'elephant-suit columns march south; Hampaiya rider card flips, push-in', [540, 620], 0.06, (lt, d) => {
    const tg = Wd('general', 3) - T11, z = 1 + 0.15 * eio(seg(lt, tg + 0.5, d));
    ctx.save(); ctx.translate(540, 620); ctx.scale(z, z); ctx.translate(-540, -620);
    tbl(2, 0, 0);
    const eC = card('sEle', 56, F.sEle), k = lt / 0.42, steps = Math.floor(k) + eio(clamp((k % 1) * 1.6));
    for (const cx of [140, 262, 818, 940]) for (let i = 0; i < 7; i++) {
      const fin = 1060 - i * 140, y = Math.min(fin, fin - 980 + steps * 112);
      dc(eC, cx + sin(k * PI + i) * 3, y, { rot: sin(k * PI) * 0.06 });
    }
    const R = 280, rC = card('riderbg', R, F.riderbg, 1.4), din = eo(seg(lt, 0, 0.7)), ki = R * 0.8 / 300;
    flip(rC, back(R), 540, lerp(-300, 610, din), eio(seg(lt, tg - 0.25, tg + 0.35)), {
      lift: (1 - din) * 0.6,
      after: () => {
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R * 0.8, 0, TAU); ctx.clip();
        for (let i = 0; i < 6; i++) { const p = (lt * 1.2 + i / 6) % 1; ctx.beginPath(); ctx.arc((-60 - p * 180) * ki, (130 - p * 30) * ki, (10 + p * 26) * ki, 0, TAU); ctx.fillStyle = `rgba(237,224,194,${0.6 * (1 - p)})`; ctx.fill(); }
        blit(RIDER(), 250, 500, 20 * ki, (175 + Math.abs(sin(lt * 7)) * -10) * ki, ki * 0.9);
        for (let i = 0; i < 5; i++) { const x = ((i * 140 - lt * 260) % 700 + 700) % 700 - 350; st([[x * ki, 190 * ki], [(x + 26) * ki, 190 * ki]], C.blk, 4 * ki); }
        ctx.restore();
      } });
    ctx.restore();
  });
  for (let i = 0; i < 8; i++) cue(T11 + 0.1 + i * 0.42, 'tock', { gain: 0.22, pan: i % 2 ? 0.5 : -0.5 });
  cue(Wd('general', 3) - 0.25, 'whoosh', { gain: 0.45 }); cue(Wd('hampaiya', 3), 'drum', { gain: 0.5 });

  // a13 · old accounts say his soldiers...: an aged, crackled card of marching spearmen slides in under the slip
  shot('a13', T12, 'OLD ACCOUNTS SAY · crackled card of marching spearmen', [540, 720], 0.1, (lt) => {
    tbl(0);
    const R = 350, din = eo(seg(lt, 0, 0.55)), ki = R * 0.8 / 300;
    dc(card('soldbg', R, F.soldbg, 1.2), lerp(1500, 540, din), 740, { rot: (1 - din) * 2.5, lift: (1 - din) * 0.6,
      after: () => {
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R * 0.8, 0, TAU); ctx.clip();
        const off = (lt * 110) % 100, bob = Math.abs(sin(lt * 9)) * -5;
        blit(SOLD(), 0, 280, -880 + off, 200 + bob, 1);
        ctx.restore();
        dull(R, 0.22); crackOver(R, 1);
      } });
    slip('OLD ACCOUNTS SAY', 540, 230, { size: 40, sc: pop(lt, 0.02) });
  });
  cue(T12, 'whoosh', { gain: 0.45, pan: 0.5 }); cue(T12 + 0.05, 'pop', { gain: 0.4 }); cue(T12 + 0.3, 'rumble', { gain: 0.3, dur: 1.5 });
  for (let i = 0; i < 4; i++) cue(T12 + 0.6 + i * 0.35, 'tock', { gain: 0.16, pan: i % 2 ? 0.4 : -0.4 });

  // a14 · cut off the noses of the people they captured: a dagger card glides over the face card and the nose line
  //       is painted over in black (symbolic only)
  shot('a14', T13, 'dagger card passes; the face card nose line is painted over in black', [540, 700], 0.1, (lt, d) => {
    tbl(2);
    const R = 330, tn = Wd('noses', 4) - T13;
    dc(card('nose', R, F.nose), 540, 720, { after: () => paintNose(R, seg(lt, tn, tn + 0.7)) });
    const din = eo(seg(lt, 0, 0.5)), dout = eio(seg(lt, tn + 0.8, d));
    dc(card('dagger', 170, F.dagger), lerp(1320, 820, din) + dout * -1100, lerp(140, 330, din) - dout * 60, { rot: (1 - din) * 2 - dout * 2, lift: 0.5 });
  });
  cue(T13 + 0.02, 'zip', { gain: 0.4, pan: 0.5 }); cue(Wd('noses', 4), 'sizzle', { gain: 0.25, dur: 0.6 }); cue(Wd('noses', 4) + 0.75, 'thud', { gain: 0.35 }); cue(T13 + 1.6, 'whoosh', { gain: 0.35, pan: -0.5 });

  // a15 · even ordinary villagers: the village card above, a row of small face cards dealt below, noses painted over
  shot('a15', T14, 'village card + row of small face cards, noses painted over one by one', [540, 760], 0.07, (lt) => {
    tbl(1);
    const din = eo(seg(lt, 0, 0.5));
    dc(card('village', 290, F.village, 1.1), 540, lerp(-300, 520, din), { rot: (1 - din) * -2, lift: (1 - din) * 0.6 });
    const fC = card('nose', 88, F.nose), tv = Wd('villagers', 4) - T14;
    for (let i = 0; i < 5; i++) {
      const d0 = 0.3 + i * 0.1, p = eo(seg(lt, d0, d0 + 0.4)), x = 140 + i * 200, y = 1030 + (i % 2) * 28;
      dc(fC, lerp(-200, x, p), y, { rot: (1 - p) * -3, lift: (1 - p) * 0.6, after: () => paintNose(88, seg(lt, tv - 0.2 + i * 0.22, tv + 0.25 + i * 0.22)) });
    }
  });
  cue(T14 + 0.02, 'whoosh', { gain: 0.4 }); cue(T14 + 0.45, 'thud', { gain: 0.35 });
  for (let i = 0; i < 5; i++) { cue(T14 + 0.3 + i * 0.1, 'slide', { gain: 0.2, pan: -0.6 + i * 0.3 }); cue(Wd('villagers', 4) - 0.2 + i * 0.22, 'plop', { gain: 0.2, pan: -0.6 + i * 0.3 }); }
  void TEND; void W; void H;
}
