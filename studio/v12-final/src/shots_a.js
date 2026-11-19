// EPISODE 12 · worker A : "Tanjore Gilt Panel", lines 0-4 (t 0 → L(5)).
// Hook (1799: a king signs away his government, what he did next is forgotten) · Serfoji II, a Maratha king in the Tamil
// country · adopted as a boy by King Tulaja · Tulaja dies, Amar Singh takes the throne · Schwartz protects + educates him ·
// 1798 the British put him on the throne · "the price came a year later".
// Engine: every scene sits inside ONE cached gilt gesso arch frame (gold leaf seams, bevels, beaded rows, gem sockets) blitted
// over a flat ground; heavy set pieces (doors, throne, fort, gopuram, shelves, numerals, halo) are cached once; per frame only
// the moving parts are drawn (leaves, beads, gems, figures, seal, cracks).
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { poly, lg, cached, blit } from './art.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos, hyp = Math.hypot, abs = Math.abs;
const G = {
  red: '#8E1B1B', red2: '#B3261E', grn: '#1E5B3A', grn2: '#2F7D4F', blu: '#1F3C8C', blu2: '#3557B5',
  gold: '#C99A2E', gold2: '#E9C25A', hi: '#FFF0B0', gsh: '#7A5714', ivory: '#F1E4C8', ink: '#2B1408',
  ruby: '#D1203A', emer: '#19A35A', saph: '#2457D6', varn: '#6B4A1A', lac: '#2A0907', wood: '#5A3418',
  saff: '#E07A1F', black: '#231B1D', dred: '#5E0F14', wall: '#C08049', wall2: '#9A5A2C', paper: '#EFE0BC', leafy: '#D9B77E',
};

// ───────────────────────────── geometry of the panel ─────────────────────────────
const HCX = 540, HR = 390, HSY = 560, HB = 1215, BUL = 0.075, NL = 9;   // arch opening: x 150..930, apex ~140, bottom 1215
/** multifoil (cusped) arch: pillars from `bot` up to the springline `sy`, then n scallops round a semicircle of radius R */
function archPath(cx, R, sy, bot, n = NL, bul = BUL) {
  ctx.beginPath(); ctx.moveTo(cx - R, bot); ctx.lineTo(cx - R, sy);
  for (let k = 0; k < n; k++) {
    const a0 = PI + k * PI / n, a1 = a0 + PI / n, am = (a0 + a1) / 2;
    ctx.quadraticCurveTo(cx + cos(am) * R * (1 + bul * 2), sy + sin(am) * R * (1 + bul * 2), cx + cos(a1) * R, sy + sin(a1) * R);
  }
  ctx.lineTo(cx + R, bot); ctx.closePath();
}
/** points round an arch outline (bottom-left → over the top → bottom-right), about `step` px apart */
function archPts(cx, R, sy, bot, step, sides = true) {
  const p = [];
  if (sides) for (let y = bot; y > sy; y -= step) p.push([cx - R, y]);
  const n = Math.max(4, Math.round(PI * R / step));
  for (let k = 0; k <= n; k++) { const a = PI + k * PI / n; p.push([cx + cos(a) * R, sy + sin(a) * R]); }
  if (sides) for (let y = sy + step; y <= bot; y += step) p.push([cx + R, y]);
  return p;
}
const inArch = (x, y, cx, R, sy, bot) => y <= bot && (y >= sy ? abs(x - cx) <= R : hyp(x - cx, y - sy) <= R);
const archTopY = (x) => HSY - Math.sqrt(Math.max(0, HR * HR - (x - HCX) * (x - HCX)));

// ───────────────────────────── small ornaments ─────────────────────────────
/** a raised gesso bead (gold dot with a shadow and a highlight) */
function bead(x, y, r, s = 1) {
  if (s <= 0.02) return; r *= s;
  circle(x + r * 0.3, y + r * 0.38, r, 'rgba(43,20,8,0.55)'); circle(x, y, r, G.gold2); circle(x - r * 0.3, y - r * 0.32, r * 0.4, G.hi);
}
/** GESSO BEADING: beads pop in along a path, one after another (prog 0..1) */
function beadRow(pts, prog, r) {
  const n = pts.length, shown = prog * n;
  for (let i = 0; i < n && i < shown; i++) bead(pts[i][0], pts[i][1], r, eob(clamp((shown - i) / 3)));
}
/** cabochon gem in a gold bezel, with a white specular dot */
function gem(x, y, r, col, s = 1) {
  if (s <= 0.02) return; r *= s;
  circle(x + 1.5, y + 2.5, r * 1.32, 'rgba(43,20,8,0.5)'); circle(x, y, r * 1.3, G.gold2);
  circle(x, y, r, col);
  ctx.globalAlpha = 0.28; circle(x + r * 0.2, y + r * 0.26, r * 0.72, '#000'); ctx.globalAlpha = 0.3; circle(x - r * 0.18, y - r * 0.2, r * 0.6, '#fff'); ctx.globalAlpha = 1;
  circle(x - r * 0.36, y - r * 0.4, r * 0.24, '#fff');
}
function sparkle(x, y, sz, a) {
  if (a <= 0.01) return;
  ctx.globalAlpha = clamp(a); ctx.fillStyle = G.hi; ctx.beginPath();
  for (let k = 0; k < 8; k++) { const q = k % 2 ? sz * 0.16 : sz, an = k * PI / 4 + 0.2; ctx.lineTo(x + cos(an) * q, y + sin(an) * q); }
  ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
}
/** GEM INLAY POP: a gem drops into its socket with a bounce, sparkle on landing. tt = time since its drop started */
function popGem(x, y, r, col, tt) {
  if (tt < 0) return;
  const s = eob(clamp(tt / 0.26)), dy = (1 - eo(clamp(tt / 0.2))) * -46;
  gem(x, y + dy, r, col, s);
  if (tt > 0.12 && tt < 0.6) sparkle(x + r * 0.6, y - r * 0.7, r * 2.2 * (1 - abs(tt - 0.3) / 0.3), 1 - (tt - 0.12) / 0.48);
}
/** gold-leaf cartouche plaque with a beaded border and Caladea caps */
function plaque(text, x, y, size, s = 1) {
  if (s <= 0.02) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.08)}px`;
  const tw = ctx.measureText(text).width, w = tw + size * 1.5, h = size * 1.62, r = h * 0.32;
  rr(-w / 2 + 4, -h / 2 + 6, w, h, r); ctx.fillStyle = 'rgba(43,20,8,0.5)'; ctx.fill();
  rr(-w / 2, -h / 2, w, h, r); ctx.fillStyle = lg(0, -h / 2, 0, h / 2, [[0, G.hi], [0.3, G.gold2], [1, G.gold]]); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke();
  const bx = w / 2 - r * 0.9, n = Math.max(2, Math.round(bx * 2 / 16));
  for (let k = 0; k <= n; k++) { const xx = -bx + k * bx * 2 / n; circle(xx, -h / 2 + 7, 2.6, G.gsh); circle(xx, h / 2 - 7, 2.6, G.gsh); }
  ctx.fillStyle = G.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, size * 0.04, size * 0.06);
  ctx.restore();
}

// ───────────────────────────── cached set pieces ─────────────────────────────
// gem sockets on the frame: [x, y, r, colour]
const SOCK = [[540, 104, 17, G.ruby], [118, 118, 15, G.emer], [962, 118, 15, G.emer], [300, 146, 12, G.saph], [780, 146, 12, G.saph],
  [196, 262, 11, G.ruby], [884, 262, 11, G.ruby], [105, 560, 16, G.saph], [975, 560, 16, G.saph]];
[700, 840, 980, 1120].forEach((y, i) => { SOCK.push([105, y, 12, i % 2 ? G.emer : G.ruby], [975, y, 12, i % 2 ? G.emer : G.ruby]); });
for (let k = 0; k < 9; k++) SOCK.push([200 + k * 85, 1257, 10, [G.ruby, G.emer, G.saph][k % 3]]);
SOCK.sort((a, b) => a[1] - b[1] || a[0] - b[0]);

const frameImg = () => cached('aFrame', 1080, 1320, 1, () => {
  rr(60, 60, 960, 1240, 22); ctx.fillStyle = G.gold; ctx.fill();
  ctx.save(); rr(60, 60, 960, 1240, 22); ctx.clip();
  for (let gy = 60, row = 0; gy < 1300; gy += 58, row++) for (let gx = 60 - (row % 2) * 29; gx < 1020; gx += 58) {   // gold-leaf squares, each a touch different
    const v = rnd(gx * 0.37 + gy * 1.13);
    ctx.fillStyle = v < 0.5 ? `rgba(255,240,176,${0.05 + v * 0.16})` : `rgba(122,87,20,${(v - 0.5) * 0.26})`; ctx.fillRect(gx, gy, 58, 58);
    ctx.strokeStyle = 'rgba(122,87,20,0.3)'; ctx.lineWidth = 1.2; ctx.strokeRect(gx + 0.5, gy + 0.5, 57, 57);
  }
  ctx.restore();
  // outer bevel + inner moulding
  ctx.lineWidth = 6; rr(62, 62, 956, 1236, 21); ctx.strokeStyle = G.hi; ctx.stroke(); rr(64, 64, 956, 1236, 21); ctx.strokeStyle = 'rgba(122,87,20,0.9)'; ctx.lineWidth = 3; ctx.stroke();
  rr(96, 96, 888, 1168, 14); ctx.strokeStyle = G.gsh; ctx.lineWidth = 3; ctx.stroke(); rr(98, 98, 888, 1168, 14); ctx.strokeStyle = 'rgba(255,240,176,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  for (let x = 92; x <= 988; x += 20) { bead(x, 80, 4.2); bead(x, 1282, 4.2); }
  for (let y = 100; y <= 1262; y += 20) { bead(80, y, 4.2); bead(1000, y, 4.2); }
  // pillars: recessed channel, capital, base
  for (const px of [105, 975]) {
    rr(px - 16, 590, 32, 610, 10); ctx.fillStyle = '#A97C22'; ctx.fill(); ctx.strokeStyle = G.gsh; ctx.lineWidth = 2; ctx.stroke();
    for (let y = 610; y < 1190; y += 18) bead(px, y, 3.2);
    for (const cy of [544, 1196]) { rr(px - 40, cy - 14, 80, 30, 8); ctx.fillStyle = G.gold2; ctx.fill(); ctx.strokeStyle = G.gsh; ctx.lineWidth = 3; ctx.stroke(); }
  }
  // base band mouldings
  ctx.fillStyle = G.gsh; ctx.fillRect(150, 1230, 780, 4); ctx.fillRect(150, 1282, 780, 3); ctx.fillStyle = G.hi; ctx.fillRect(150, 1234, 780, 2);
  // spandrel scrolls: arcs of beads
  for (const s of [-1, 1]) for (let k = 0; k < 9; k++) { const a = k / 8 * PI * 0.9; bead(540 + s * (230 + cos(a) * 70), 200 + sin(a) * -40 + k * 3, 3.4); }
  // arch rim with bevel, beads outside it, then cut the opening
  archPath(HCX, HR, HSY, HB);
  ctx.save(); ctx.translate(4, 5); ctx.lineWidth = 24; ctx.strokeStyle = G.gsh; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(-3, -3); ctx.lineWidth = 22; ctx.strokeStyle = G.hi; archPath(HCX, HR, HSY, HB); ctx.stroke(); ctx.restore();
  archPath(HCX, HR, HSY, HB); ctx.lineWidth = 16; ctx.strokeStyle = G.gold2; ctx.stroke();
  const bp = archPts(HCX, HR * (1 + BUL) + 24, HSY, HB, 19, false); bp.slice(2, -2).forEach(([x, y]) => bead(x, y, 4.4));
  for (const [x, y, r] of SOCK) { circle(x, y, r * 1.42, G.gsh); circle(x, y, r * 1.12, '#3A2410'); }
  ctx.globalCompositeOperation = 'destination-out'; archPath(HCX, HR, HSY, HB); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
  // the frame's shadow falling into the opening
  ctx.save(); archPath(HCX, HR, HSY, HB); ctx.clip(); ctx.translate(6, 8); archPath(HCX, HR, HSY, HB); ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(20,8,2,0.45)'; ctx.stroke(); ctx.restore();
});
const cabImg = () => cached('aCab', 1320, 2240, 0.6, () => {
  ctx.translate(120, 160);
  ctx.fillStyle = G.lac; ctx.fillRect(-120, -160, 1320, 2240);
  for (let i = 0; i < 70; i++) {   // lacquered wood grain
    const y = -160 + i * 32 + rnd(i) * 20; ctx.strokeStyle = i % 3 ? 'rgba(0,0,0,0.22)' : 'rgba(150,60,30,0.10)'; ctx.lineWidth = 2 + rnd(i * 3) * 4;
    ctx.beginPath(); ctx.moveTo(-120, y); for (let x = -120; x <= 1200; x += 60) ctx.lineTo(x, y + sin(x * 0.006 + i) * 9); ctx.stroke();
  }
  for (const y of [1318, 1846]) { rr(30, y, 1020, 14, 7); ctx.fillStyle = G.gold; ctx.fill(); ctx.fillStyle = G.hi; ctx.globalAlpha = 0.6; ctx.fillRect(40, y + 2, 1000, 2); ctx.globalAlpha = 1; for (let x = 44; x < 1040; x += 26) bead(x, y + 26, 3.6); }
  ctx.globalAlpha = 0.07; for (let y = 1400; y < 1820; y += 70) for (let x = 70; x < 1040; x += 70) circle(x + ((y / 70) % 2) * 35, y, 4, G.gold2); ctx.globalAlpha = 1;
});
const vigImg = () => cached('aVig', 1080, 1920, 0.5, () => {
  const g = ctx.createRadialGradient(540, 700, 260, 540, 760, 1250);
  g.addColorStop(0, 'rgba(107,74,26,0)'); g.addColorStop(0.6, 'rgba(107,74,26,0.12)'); g.addColorStop(1, 'rgba(55,30,8,0.55)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
});
function doorPaint(mirror) {
  if (mirror) { ctx.translate(400, 0); ctx.scale(-1, 1); }
  rr(0, 0, 400, 1120, 6); ctx.fillStyle = G.red; ctx.fill();
  rr(26, 26, 348, 1068, 10); ctx.strokeStyle = G.gold; ctx.lineWidth = 12; ctx.stroke();
  for (let x = 48; x <= 352; x += 22) { bead(x, 48, 4); bead(x, 1072, 4); } for (let y = 70; y <= 1050; y += 22) { bead(48, y, 4); bead(352, y, 4); }
  archPath(200, 118, 380, 1020, 5, 0.1); ctx.fillStyle = G.red2; ctx.fill(); ctx.strokeStyle = G.gold2; ctx.lineWidth = 7; ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = G.gold; ctx.beginPath(); ctx.arc(200, 640, 66, 0, TAU); ctx.stroke();
  for (let k = 0; k < 8; k++) { const a = k * PI / 4; ell(200 + cos(a) * 40, 640 + sin(a) * 40, 16, 8, G.gold2, a); }
  gem(200, 640, 18, G.emer); gem(200, 360, 12, G.saph); gem(200, 920, 12, G.saph);
  circle(372, 640, 16, G.gold); gem(372, 640, 9, G.ruby);
  for (const y of [180, 940]) { rr(0, y, 30, 40, 4); ctx.fillStyle = G.gold; ctx.fill(); }
}
const doorL = () => cached('aDoorL', 400, 1120, 0.8, () => doorPaint(false));
const doorR = () => cached('aDoorR', 400, 1120, 0.8, () => doorPaint(true));
/** PANEL CABINET doors: ang 0 = shut, PI/2 = flat open (hinged at the pillars, scaleX = cos) */
function doors(ang) {
  const c = cos(clamp(ang, 0, PI / 2)); if (c < 0.02) return;
  blit(doorL(), 0, 0, 140, 100, c, 1, 1); blit(doorR(), 400, 0, 940, 100, c, 1, 1);
  if (c < 0.999) { ctx.fillStyle = `rgba(20,6,2,${(1 - c) * 0.5})`; ctx.fillRect(140, 100, 400 * c, 1120); ctx.fillRect(940 - 400 * c, 100, 400 * c, 1120); }
}
function swagImg(col) {
  return cached('aSwag' + col, 1080, 820, 0.7, () => {
    const n = 7, w = 780 / n;
    for (let k = 0; k < n; k++) {
      const x0 = 150 + k * w, x1 = x0 + w, xm = x0 + w / 2, y0 = archTopY(x0) + 10, y1 = archTopY(x1) + 10, ym = archTopY(xm) + 10;
      ctx.beginPath(); ctx.moveTo(x0, y0 - 80); ctx.lineTo(x0, y0); ctx.quadraticCurveTo(xm, ym + 130, x1, y1); ctx.lineTo(x1, y1 - 80); ctx.closePath();
      ctx.fillStyle = col; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(xm, ym + 130, x1, y1); ctx.strokeStyle = G.ink; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = G.gold2; ctx.lineWidth = 7; ctx.stroke();
      for (let u = 0.08; u < 0.95; u += 0.14) { const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * xm + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * (ym + 130) + u * u * y1; bead(x, y + 12, 3.4); }
      if (k < n - 1) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 9, y1 + 46); ctx.lineTo(x1 + 9, y1 + 46); ctx.closePath(); ctx.fillStyle = G.gold2; ctx.fill(); ctx.strokeStyle = G.ink; ctx.lineWidth = 2; ctx.stroke(); circle(x1, y1, 7, G.gold); }
    }
  });
}
function textImg(key, str, size, gold) {
  return cached(key, 1000, size * 1.4, 1, () => {
    ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.letterSpacing = `${Math.round(size * 0.03)}px`;
    const y = size * 0.72;
    ctx.lineWidth = size * 0.13; ctx.strokeStyle = G.ink; ctx.strokeText(str, 500, y);
    if (gold) {
      ctx.fillStyle = lg(0, y - size * 0.5, 0, y + size * 0.5, [[0, G.hi], [0.3, G.gold2], [0.62, G.gold], [1, G.gsh]]); ctx.fillText(str, 500, y);
      ctx.lineWidth = size * 0.02; ctx.strokeStyle = 'rgba(255,240,176,0.8)'; ctx.strokeText(str, 497, y - 3);
    } else { ctx.fillStyle = '#6E1512'; ctx.fillText(str, 500, y); ctx.lineWidth = size * 0.015; ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.strokeText(str, 502, y + 3); }
  });
}
const TXO = (size) => [500, size * 0.72];
// throne: base centre origin (280, 640); cushion top at local y -182
const THR = { ox: 280, oy: 640, seat: -178 };
const THR_GEMS = [[0, -596, 14, G.ruby], [-127, -527, 11, G.saph], [127, -527, 11, G.saph], [-180, -330, 11, G.emer], [180, -330, 11, G.emer],
  [-180, -220, 10, G.ruby], [180, -220, 10, G.ruby], [-242, -248, 12, G.saph], [242, -248, 12, G.saph], [-180, -118, 10, G.emer], [-60, -118, 10, G.ruby], [60, -118, 10, G.ruby], [180, -118, 10, G.emer]];
const throneImg = () => cached('aThrone', 560, 660, 1, () => {
  ctx.translate(THR.ox, THR.oy); ctx.lineJoin = 'round';
  const st = (w = 4) => { ctx.lineWidth = w; ctx.strokeStyle = G.ink; ctx.stroke(); };
  for (const x of [-210, -70, 70, 210]) { rr(x - 18, -92, 36, 92, 8); ctx.fillStyle = G.gold; ctx.fill(); st(3); ell(x, -8, 28, 12, G.gold2); st(3); }
  archPath(0, 200, -400, -150, 7, 0.09); ctx.fillStyle = G.gold; ctx.fill(); st();
  archPath(0, 160, -400, -160, 7, 0.09); ctx.fillStyle = G.red2; ctx.fill(); st(3);
  archPts(0, 180, -400, -170, 20).forEach(([x, y]) => bead(x, y, 4));
  for (const s of [-1, 1]) { rr(s * 242 - 20, -250, 40, 110, 10); ctx.fillStyle = G.gold; ctx.fill(); st(3); circle(s * 242, -250, 24, G.gold2); st(3); }
  rr(-252, -150, 504, 66, 12); ctx.fillStyle = G.gold; ctx.fill(); st();
  for (let x = -230; x <= 230; x += 22) bead(x, -94, 3.6);
  rr(-222, -186, 444, 44, 20); ctx.fillStyle = G.grn2; ctx.fill(); st(3);
  ctx.fillStyle = G.gold2; for (let x = -190; x <= 190; x += 38) ctx.fillRect(x - 3, -182, 6, 36);
  ctx.beginPath(); ctx.arc(0, -400 - 200 * 1.09 - 14, 13, 0, TAU); ctx.fillStyle = G.gold2; ctx.fill(); st(3);
  for (const [x, y, r] of THR_GEMS) { circle(x, y, r * 1.42, G.gsh); circle(x, y, r * 1.12, '#3A2410'); }
});
/** throne at base-centre (x, y), scale s, gems popping from t0 every dt (pop=null → all set) */
function throne(x, y, s, lt, pop) {
  blit(throneImg(), THR.ox, THR.oy, x, y, s);
  THR_GEMS.forEach(([gx, gy, r, col], i) => { const X = x + gx * s, Y = y + gy * s; if (!pop) gem(X, Y, r * s, col); else popGem(X, Y, r * s, col, lt - pop[0] - i * pop[1]); });
}
const fortImg = () => cached('aFort', 1000, 600, 0.8, () => {
  ctx.translate(500, 580); ctx.lineJoin = 'round';
  const st = (w = 2.6) => { ctx.lineWidth = w; ctx.strokeStyle = G.ink; ctx.stroke(); };
  let y = -200, w = 300;   // the great temple tower behind the walls
  for (let i = 0; i < 9; i++) { const w2 = w - 26; poly([[-w / 2, y], [w / 2, y], [w2 / 2, y - 34], [-w2 / 2, y - 34]]); ctx.fillStyle = i % 2 ? '#E8D2A2' : '#DCC08A'; ctx.fill(); st(2);
    for (let k = -2; k <= 2; k++) { rr(k * w2 * 0.18 - 4, y - 26, 8, 16, 3); ctx.fillStyle = '#7A4A22'; ctx.fill(); } y -= 34; w = w2; }
  ctx.beginPath(); ctx.ellipse(0, y - 4, 52, 34, 0, PI, TAU); ctx.closePath(); ctx.fillStyle = G.gold; ctx.fill(); st(2);
  rr(-5, y - 66, 10, 30, 4); ctx.fillStyle = G.gold2; ctx.fill(); st(2);
  rr(-460, -230, 920, 230, 4); ctx.fillStyle = G.wall; ctx.fill(); st(3);
  for (let r = 0; r < 4; r++) { ctx.fillStyle = 'rgba(90,40,10,0.18)'; for (let x = -450 + (r % 2) * 40; x < 450; x += 80) ctx.fillRect(x, -220 + r * 55, 70, 3); }
  for (let x = -456; x < 440; x += 36) { rr(x + 4, -254, 24, 26, 4); ctx.fillStyle = G.wall; ctx.fill(); st(2); }
  for (const bx of [-400, -150, 150, 400]) {
    rr(bx - 62, -292, 124, 292, 8); ctx.fillStyle = G.wall2; ctx.fill(); st(3);
    for (let x = bx - 60; x < bx + 50; x += 30) { rr(x + 2, -314, 22, 24, 4); ctx.fillStyle = G.wall2; ctx.fill(); st(2); }
    for (const yy of [-230, -140]) { rr(bx - 5, yy, 10, 34, 4); ctx.fillStyle = G.ink; ctx.fill(); }
    ctx.fillStyle = G.gold; ctx.fillRect(bx - 62, -292, 124, 8);
  }
  archPath(0, 60, -120, 0, 3, 0.1); ctx.fillStyle = G.ink; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = G.gold2; ctx.stroke();
  ctx.fillStyle = G.blu2; ctx.fillRect(-500, -16, 1000, 16);
});
function gopPaint(gold) {
  const F = gold ? G.gold : '#E8D6AE', D = gold ? G.gsh : '#BE9C6C', E = gold ? '#4A3008' : '#5A3418';
  ctx.translate(220, 820); ctx.lineJoin = 'round';
  const st = () => { ctx.lineWidth = 2.6; ctx.strokeStyle = G.ink; ctx.stroke(); };
  rr(-170, -150, 340, 150, 3); ctx.fillStyle = F; ctx.fill(); st();
  archPath(0, 40, -96, 0, 3, 0.1); ctx.fillStyle = E; ctx.fill(); st();
  rr(-186, -166, 372, 18, 4); ctx.fillStyle = D; ctx.fill(); st();
  let y = -166, w = 330;
  for (let i = 0; i < 7; i++) {
    const h = 62, w2 = w - 36; poly([[-w / 2, y], [w / 2, y], [w2 / 2, y - h], [-w2 / 2, y - h]]); ctx.fillStyle = F; ctx.fill(); st();
    const n = Math.max(2, Math.round(w2 / 60)); for (let k = 0; k < n; k++) { const x = -w2 / 2 + (k + 0.5) * w2 / n; rr(x - 7, y - h + 16, 14, 32, 6); ctx.fillStyle = E; ctx.fill(); }
    rr(-w2 / 2 - 8, y - h - 12, w2 + 16, 12, 3); ctx.fillStyle = D; ctx.fill(); st();
    y -= h + 12; w = w2;
  }
  ctx.beginPath(); ctx.moveTo(-w / 2 - 12, y); ctx.quadraticCurveTo(-w / 2 - 12, y - 76, 0, y - 76); ctx.quadraticCurveTo(w / 2 + 12, y - 76, w / 2 + 12, y); ctx.closePath(); ctx.fillStyle = D; ctx.fill(); st();
  for (let k = -2; k <= 2; k++) { circle(k * 24, y - 70 - (2 - abs(k)) * 2, 6, G.gold2); }
}
const gopImg = (gold) => cached(gold ? 'aGopG' : 'aGop', 440, 840, 1, () => gopPaint(gold));
const GOP = { ox: 220, oy: 820 };
const shelfImg = () => cached('aShelf', 800, 1100, 0.8, () => {
  ctx.translate(400, 0); ctx.lineJoin = 'round';
  ctx.fillStyle = '#2A120A'; ctx.fillRect(-400, 0, 800, 1100);
  const cols = [G.red2, G.grn2, G.blu2, '#7A2E12', G.grn, G.blu];
  [250, 480, 710, 940].forEach((B, r) => {
    let x = -385, k = 0;
    while (x < 360) {
      const v = rnd(r * 31 + k * 7.7);
      if (v < 0.5) {   // standing books
        const n = 3 + Math.floor(rnd(k + r * 5) * 4);
        for (let j = 0; j < n && x < 370; j++) {
          const w = 26 + rnd(r * 9 + k * 3 + j) * 18, h = 120 + rnd(r * 13 + k + j * 5) * 60;
          rr(x, B - h, w, h, 3); ctx.fillStyle = cols[Math.floor(rnd(r + k * 3 + j * 7) * cols.length)]; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = G.ink; ctx.stroke();
          ctx.fillStyle = G.gold2; ctx.fillRect(x + 4, B - h + 12, w - 8, 5); ctx.fillRect(x + 4, B - 24, w - 8, 5); x += w + 2;
        }
      } else {   // palm-leaf manuscript bundles between wooden boards, tied with red string
        const n = 3 + Math.floor(rnd(k * 3 + r) * 2), bw = 150 + rnd(r * 3 + k) * 50;
        for (let j = 0; j < n; j++) {
          const y = B - (j + 1) * 30;
          rr(x, y + 4, bw, 20, 6); ctx.fillStyle = G.leafy; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = G.ink; ctx.stroke();
          rr(x - 4, y, bw + 8, 7, 3); ctx.fillStyle = G.wood; ctx.fill(); ctx.stroke(); rr(x - 4, y + 22, bw + 8, 7, 3); ctx.fill(); ctx.stroke();
          ctx.fillStyle = G.ruby; ctx.fillRect(x + bw * 0.3, y, 4, 29); ctx.fillRect(x + bw * 0.7, y, 4, 29);
        }
        x += bw + 10;
      }
      x += 12; k++;
    }
    rr(-400, B, 800, 24, 2); ctx.fillStyle = G.wood; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke(); ctx.fillStyle = G.gold; ctx.fillRect(-400, B, 800, 5);
  });
});
const haloImg = () => cached('aHalo', 1080, 1300, 1, () => {
  archPath(540, 290, 560, 1090, 7, 0.09); ctx.fillStyle = G.gold; ctx.fill();
  ctx.save(); archPath(540, 290, 560, 1090, 7, 0.09); ctx.clip();
  for (let k = 0; k < 26; k++) { const a = PI + k * PI / 25; ctx.strokeStyle = k % 2 ? 'rgba(122,87,20,0.35)' : 'rgba(255,240,176,0.35)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(540, 600); ctx.lineTo(540 + cos(a) * 520, 600 + sin(a) * 520); ctx.stroke(); }
  ctx.restore();
  archPath(540, 290, 560, 1090, 7, 0.09); ctx.lineWidth = 4; ctx.strokeStyle = G.ink; ctx.stroke();
  archPath(540, 248, 560, 1090, 7, 0.09); ctx.lineWidth = 4; ctx.strokeStyle = G.gsh; ctx.stroke();
});

// ───────────────────────────── devices ─────────────────────────────
/** grid of leaf targets inside test(x,y), shuffled */
function leafTargets(x0, y0, x1, y1, step, seed, test) {
  const a = [];
  for (let y = y0; y <= y1; y += step) for (let x = x0; x <= x1; x += step) if (!test || test(x, y)) a.push([x + (rnd(x * 1.3 + y * 0.7 + seed) - 0.5) * step * 0.3, y + (rnd(x * 0.9 + y * 1.7 + seed) - 0.5) * step * 0.3, rnd(x * 2.1 + y * 0.3 + seed) + (y - y0) / (y1 - y0 + 1) * 0.8]);
  return a.sort((p, q) => p[2] - q[2]);
}
/** GOLD-LEAF LAYING: square leaves flutter down (spin → scaleX = cos) and stick; reveal() is drawn clipped to the stuck leaves */
function leaves(lt, T, t0, span, fall, sz, reveal, seed = 0) {
  const n = T.length, st = n > 1 ? span / (n - 1) : 0;
  let any = false; ctx.save(); ctx.beginPath();
  for (let i = 0; i < n; i++) {
    if (lt < t0 + i * st + fall) continue; any = true;
    const [x, y] = T[i], a = (rnd(i * 3.7 + seed) - 0.5) * 0.5, h = sz * 0.68, c = cos(a) * h, s = sin(a) * h;
    ctx.moveTo(x - c + s, y - s - c); ctx.lineTo(x + c + s, y + s - c); ctx.lineTo(x + c - s, y + s + c); ctx.lineTo(x - c - s, y - s + c); ctx.closePath();
  }
  if (any) { ctx.clip(); reveal(); }
  ctx.restore();
  for (let i = 0; i < n; i++) {
    const ti = t0 + i * st, p = (lt - ti) / fall; if (p < 0) continue;
    const [x, y] = T[i];
    if (p >= 1) { const f = 1 - (lt - ti - fall) / 0.25; if (f > 0) { ctx.globalAlpha = f * 0.5; ctx.fillStyle = G.hi; ctx.fillRect(x - sz * 0.5, y - sz * 0.5, sz, sz); ctx.globalAlpha = 1; } continue; }
    const q = 1 - eo(p), dx = (rnd(i * 5.1 + seed) - 0.5) * 280, dy = -(520 + rnd(i * 7.3 + seed) * 280);
    const px = x + dx * q + sin(p * 7 + i) * 50 * q, py = y + dy * q, spin = p * (7 + rnd(i) * 5) + i, rot = sin(p * 4 + i) * 0.9 * q;
    const sx = cos(spin), face = abs(sx);
    ctx.save(); ctx.translate(px, py); ctx.rotate(rot); ctx.scale(Math.max(0.08, face), 1);
    ctx.fillStyle = face > 0.6 ? G.gold2 : sx > 0 ? G.gold : G.gsh; ctx.fillRect(-sz * 0.42, -sz * 0.42, sz * 0.84, sz * 0.84);
    if (face > 0.85) { ctx.fillStyle = 'rgba(255,240,176,0.75)'; ctx.fillRect(-sz * 0.42, -sz * 0.42, sz * 0.84, sz * 0.18); }
    ctx.restore();
  }
}
let SC = null;
/** GILT SHEEN SWEEP: a diagonal bright band (p 0..1) masked to a cached gold image placed like blit(img, ox, oy, x, y, s) */
function sheen(img, ox, oy, x, y, s, p, a = 0.75, wid = 150) {
  if (p <= 0 || p >= 1) return;
  if (!SC) { SC = document.createElement('canvas'); SC.width = W; SC.height = H; }
  const c = SC.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H);
  const bx = lerp(-500, W + 500, p), by = 700, nx = 0.86, ny = 0.51;
  const g = c.createLinearGradient(bx - nx * wid, by - ny * wid, bx + nx * wid, by + ny * wid);
  g.addColorStop(0, 'rgba(255,240,176,0)'); g.addColorStop(0.5, `rgba(255,248,214,${a})`); g.addColorStop(1, 'rgba(255,240,176,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'destination-in'; c.drawImage(img, x - ox * s, y - oy * s, img.width / img._q * s, img.height / img._q * s);
  c.globalCompositeOperation = 'source-over';
  ctx.drawImage(SC, 0, 0);
}
/** branching crack network from (cx, cy); segments carry their distance from the origin so they can grow */
function crackNet(cx, cy, n, seed, len) {
  const S = [], stack = [];
  for (let k = 0; k < n; k++) stack.push([cx, cy, k * TAU / n + rnd(seed + k) * 0.7, 0, len * (0.6 + rnd(seed + k * 3) * 0.4)]);
  let guard = 0;
  while (stack.length && guard++ < 300) {
    let [x, y, a, o, ln] = stack.pop(), walked = 0, j = 0;
    while (walked < ln) {
      const stp = 12 + rnd(seed + guard * 7 + j) * 16, na = a + (rnd(seed + guard * 13 + j * 3) - 0.5) * 0.9;
      const nx = x + cos(na) * stp, ny = y + sin(na) * stp; S.push([x, y, nx, ny, o + walked]); x = nx; y = ny; a = na * 0.6 + a * 0.4; walked += stp; j++;
      if (rnd(seed + guard * 17 + j * 5) < 0.09 && ln - walked > 80) stack.push([x, y, a + (rnd(seed + j + guard) > 0.5 ? 1 : -1) * (0.6 + rnd(j + guard * 3) * 0.6), o + walked, (ln - walked) * 0.6]);
    }
  }
  return { S, mx: S.reduce((m, s) => Math.max(m, s[4]), 1) };
}
function drawCracks(C, p) {
  if (p <= 0) return; const lim = p * C.mx;
  ctx.beginPath(); for (const s of C.S) if (s[4] < lim) { ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.save(); ctx.translate(1.8, 2); ctx.strokeStyle = 'rgba(255,240,176,0.3)'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
  ctx.strokeStyle = 'rgba(30,12,3,0.9)'; ctx.lineWidth = 2.8; ctx.stroke();
}
/** VARNISH TARNISH: the whole panel desaturates and sinks to old brown varnish (k 0..1) */
function tarnish(k) {
  if (k <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = clamp(k * 0.75); ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = clamp(k * 0.6); ctx.fillStyle = G.varn; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
/** red wax seal with an abstract (non-logo) mark */
function seal(x, y, r) {
  ctx.beginPath(); for (let k = 0; k <= 36; k++) { const a = k * TAU / 36, q = r * (1 + (k % 2 ? 0.05 : -0.02) + sin(k * 1.7) * 0.02); ctx.lineTo(x + cos(a) * q, y + sin(a) * q); }
  ctx.closePath(); ctx.fillStyle = '#A3161F'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke();
  circle(x - r * 0.08, y - r * 0.1, r * 0.78, '#B8202A');
  ctx.lineWidth = r * 0.07; ctx.strokeStyle = '#6E0E14'; ctx.beginPath(); ctx.arc(x, y, r * 0.66, 0, TAU); ctx.stroke();
  ctx.lineWidth = r * 0.08; ctx.lineCap = 'round'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k * PI / 4; ctx.moveTo(x + cos(a) * r * 0.22, y + sin(a) * r * 0.22); ctx.lineTo(x + cos(a) * r * 0.48, y + sin(a) * r * 0.48); } ctx.stroke();
  circle(x, y, r * 0.12, '#6E0E14'); circle(x - r * 0.4, y - r * 0.45, r * 0.1, 'rgba(255,220,210,0.55)');
}
function palm(x, y, h, t, seed) {
  ctx.lineCap = 'round'; const tx = x + h * 0.1, ty = y - h;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + h * 0.02, y - h * 0.5, tx, ty);
  ctx.strokeStyle = G.ink; ctx.lineWidth = h * 0.05 + 5; ctx.stroke(); ctx.strokeStyle = G.wood; ctx.lineWidth = h * 0.05; ctx.stroke();
  for (let k = 0; k < 8; k++) {
    const a = -PI + (k + 0.5) * PI / 8 + sin(t * 1.2 + k + seed) * 0.05, Lf = h * 0.42;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + cos(a) * Lf * 0.55, ty + sin(a) * Lf * 0.7 - Lf * 0.1, tx + cos(a) * Lf, ty + sin(a) * Lf * 0.35 + Lf * 0.45);
    ctx.strokeStyle = G.ink; ctx.lineWidth = h * 0.06 + 5; ctx.stroke(); ctx.strokeStyle = k % 2 ? G.grn2 : G.grn; ctx.lineWidth = h * 0.06; ctx.stroke();
  }
}

// ───────────────────────────── faceless figures ─────────────────────────────
// Unit space: feet at y 0, head top at -100 (seated: lap bottom at y 0). kind: king | boy | priest | brit.
const ARM_A = 17, ARM_B = 16;
/** world point → a figure's local units */
const loc = (o, wx, wy) => { const u = o.h / 100; return [(wx - o.x) / u, (wy - o.y) / u - (o.seated ? 20 : 0)]; };
function arm(sx, sy, tgt, bend, col, lw) {
  let dx = tgt[0] - sx, dy = tgt[1] - sy, d = hyp(dx, dy); const th = Math.atan2(dy, dx); d = clamp(d, 4, ARM_A + ARM_B - 0.01);
  const al = Math.acos(clamp((ARM_A * ARM_A + d * d - ARM_B * ARM_B) / (2 * ARM_A * d), -1, 1)), ea = th + bend * al;
  const ex = sx + cos(ea) * ARM_A, ey = sy + sin(ea) * ARM_A, hx = sx + cos(th) * d, hy = sy + sin(th) * d;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy);
  ctx.strokeStyle = G.ink; ctx.lineWidth = 5.6 + lw * 2; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 5.6; ctx.stroke();
  ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, TAU); ctx.fillStyle = G.ivory; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = G.ink; ctx.stroke();
  return [hx, hy];
}
function fig(o) {
  const u = o.h / 100, lw = Math.max(2.2, u * 0.5) / u, kind = o.kind || 'king', coat = o.coat || G.ivory, gold = !!o.gold;
  ctx.save(); ctx.translate(o.x, o.y); if (o.rot) ctx.rotate(o.rot); ctx.scale(u, u); if (o.seated) ctx.translate(0, 20);
  if (o.a != null) ctx.globalAlpha *= o.a;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const out = () => { ctx.lineWidth = lw * (gold ? 1.7 : 1); ctx.strokeStyle = G.ink; ctx.stroke(); if (gold) { ctx.lineWidth = lw * 0.65; ctx.strokeStyle = G.gold2; ctx.stroke(); } };
  const fl = (c) => { ctx.fillStyle = c; ctx.fill(); out(); };
  if (o.part !== 'arms') {
    if (kind === 'brit') {
      for (const s of [-1, 1]) { rr(s * 4.2 - 3.2, -40, 6.4, 37, 1.5); fl('#EDE6D6'); rr(s * 4.2 - 3.6, -15, 7.2, 13, 1.5); fl(G.black); }
      poly([[-11, -79], [11, -79], [12.5, -34], [-12.5, -34]]); fl(coat);
      ctx.strokeStyle = '#F4EEDF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -77); ctx.lineTo(10, -48); ctx.moveTo(10, -77); ctx.lineTo(-10, -48); ctx.stroke();
      rr(-12.5, -38, 25, 4, 1); fl('#F4EEDF');
    } else {
      if (!o.seated) for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 7, -2.4, 5.6, 2.5, 0, 0, TAU); ctx.fillStyle = G.ink; ctx.fill(); }
      if (o.seated) { ctx.beginPath(); ctx.moveTo(-9.5, -55); ctx.lineTo(9.5, -55); ctx.quadraticCurveTo(28, -42, 27, -21); ctx.lineTo(-27, -21); ctx.quadraticCurveTo(-28, -42, -9.5, -55); ctx.closePath(); }
      else poly([[-9.5, -55], [9.5, -55], [21, -5], [-21, -5]]);
      fl(coat);
      ctx.strokeStyle = o.trim || G.gold; ctx.lineWidth = 2.4; ctx.beginPath();
      if (o.seated) { ctx.moveTo(-26, -24.5); ctx.lineTo(26, -24.5); } else { ctx.moveTo(-20, -8.2); ctx.lineTo(20, -8.2); }
      ctx.moveTo(0, -55); ctx.lineTo(0, o.seated ? -25 : -9); ctx.stroke();
      poly([[-11, -79], [11, -79], [9.5, -55], [-9.5, -55]]); fl(coat);
      rr(-10.8, -58.5, 21.6, 5.2, 2); fl(o.sash || G.gold);
      if (!o.seated) { ctx.strokeStyle = o.sash || G.gold; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(5, -54); ctx.lineTo(6.8, -36); ctx.stroke(); }
      if (kind !== 'priest') for (let k = 0; k < 7; k++) { const a = PI * 0.15 + k * PI * 0.7 / 6; circle(cos(a) * 7, -79.5 + sin(a) * 7.5, 0.95, G.gold2); }
      else { rr(-2.4, -80, 2, 6.5, 0.5); ctx.fillStyle = '#FFFFFF'; ctx.fill(); rr(0.4, -80, 2, 6.5, 0.5); ctx.fill(); }
    }
    rr(-2.6, -84, 5.2, 6, 1); ctx.fillStyle = G.ivory; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -89, 6.2, 7.4, 0, 0, TAU); fl(G.ivory);
    if (kind === 'king' || kind === 'boy') {   // Maratha turban: rounded crown with a forward-projecting tip and a plume
      const tc = o.turb || G.red2;
      ctx.beginPath(); ctx.ellipse(0.8, -96, 8.4, 5.4, -0.05, 0, TAU); fl(tc);
      ctx.beginPath(); ctx.ellipse(-6.8, -98.4, 3.7, 3.2, 0.3, 0, TAU); fl(tc);
      ctx.beginPath(); ctx.ellipse(1.6, -100, 6.0, 3.3, -0.05, 0, TAU); fl(tc);
      ctx.strokeStyle = G.gold2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-7.4, -94.2); ctx.quadraticCurveTo(1, -91.5, 9, -95); ctx.moveTo(-5.5, -98.5); ctx.quadraticCurveTo(2, -96.5, 8.6, -98.6); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(6, -101); ctx.quadraticCurveTo(11.5, -104, 9.5, -111); ctx.stroke(); circle(9.5, -111, 1.4, G.hi);
    } else if (kind === 'priest') { ctx.beginPath(); ctx.ellipse(0, -93, 6.6, 4.6, 0, PI * 1.02, PI * 1.98); ctx.lineTo(5.8, -90); ctx.lineTo(-5.8, -90); ctx.closePath(); fl('#3A2A20'); }
    else if (kind === 'brit') { poly([[-6.2, -94], [6.2, -94], [7.2, -110], [-7.2, -110]]); fl(G.black); circle(0, -102, 1.7, G.gold2); rr(-7.6, -95, 15.2, 2.4, 1); fl(G.black); }
  }
  if (o.part !== 'body') {
    const ac = kind === 'brit' ? coat : coat;
    const hl = o.hl || [-13.5, -48], hr = o.hr || [13.5, -48];
    o._hl = arm(-11, -76, hl, 1, ac, lw); o._hr = arm(11, -76, hr, -1, ac, lw);
    if (o.musket) { ctx.beginPath(); ctx.moveTo(o._hr[0] - 1, o._hr[1] + 6); ctx.lineTo(o._hr[0] + 4, -122); ctx.strokeStyle = G.ink; ctx.lineWidth = 3.4; ctx.stroke(); ctx.strokeStyle = G.wood; ctx.lineWidth = 2; ctx.stroke(); }
  }
  ctx.restore();
}

// ───────────────────────────── per-shot frame ─────────────────────────────
const cab = () => blit(cabImg(), 120, 160, 0, 0, 1);
function ground(col, floor, fy, swag) {
  ctx.fillStyle = col; ctx.fillRect(130, 90, 820, 1145);
  if (floor) { ctx.fillStyle = floor; ctx.fillRect(130, fy, 820, 1235 - fy); ctx.fillStyle = G.gold; ctx.fillRect(130, fy - 4, 820, 7); ctx.fillStyle = 'rgba(255,240,176,0.5)'; ctx.fillRect(130, fy - 4, 820, 2); }
  if (swag) blit(swagImg(swag), 0, 0, 0, 0, 1);
}
/** the gilt frame on top of the scene; pop = [t0, dt] makes its gems drop in one by one */
function front(lt, pop) {
  blit(frameImg(), 0, 0, 0, 0, 1);
  SOCK.forEach(([x, y, r, col], i) => { if (!pop) gem(x, y, r, col); else popGem(x, y, r, col, lt - pop[0] - i * pop[1]); });
}
function vig() { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(vigImg(), 0, 0, W, H); ctx.restore(); }
const frameSheen = (p, a) => sheen(frameImg(), 0, 0, 0, 0, 1, p, a);

// ───────────────────────────── the shots ─────────────────────────────
export function buildA(add, cue) {
  const shot = (id, at, note, cam, zoom, draw) => add({ id, at, note, cam, zoom, draw: (lt, d, t) => { draw(lt, d, t); vig(); } });

  const T1 = Wd('a', 0) - 0.12, T2 = Wd('away', 0), T3 = Wd('what', 0) - 0.05, T4 = L(1) - 0.05, T5 = Wd('a', 1), T6 = L(2) - 0.05, T7 = Wd('after', 2) - 0.05,
    T8 = Wd('amar', 2) - 0.1, T9 = L(3) - 0.05, T10 = Wd('helped', 3) - 0.05, T11 = Wd('that', 3), T12 = L(4) - 0.05, T13 = Wd('put', 4) - 0.05, T14 = Wd('price', 4) - 0.15;

  // a01 · cabinet doors swing open on "1799": the numerals are gilded leaf by leaf, gems drop into the frame
  {
    const S = 330, [ox, oy] = TXO(S), TT = leafTargets(250, 560, 830, 760, 60, 11);
    shot('a01', 0, 'hook: cabinet doors open, 1799 gilded leaf by leaf', [540, 660], 0.08, (lt) => {
      cab(); ground(G.blu, G.grn, 1060, G.red2);
      for (let k = 0; k < 2; k++) { const x = k ? 820 : 260; ctx.lineWidth = 4; ctx.strokeStyle = G.gold; ctx.beginPath(); ctx.arc(x, 980, 40, 0, TAU); ctx.stroke(); gem(x, 980, 12, k ? G.emer : G.ruby); }
      blit(textImg('aT1799b', '1799', S, false), ox, oy, 540, 660, 1);
      leaves(lt, TT, 0.55, 1.0, 0.55, 64, () => blit(textImg('aT1799', '1799', S, true), ox, oy, 540, 660, 1), 3);
      sheen(textImg('aT1799', '1799', S, true), ox, oy, 540, 660, 1, seg(lt, 1.75, 2.3), 0.85);
      doors(eio(seg(lt, 0.1, 0.85)) * 1.5);
      front(lt, [0.3, 0.025]);
    });
    cue(0.12, 'whoosh', { gain: 0.6 }); cue(0.35, 'pop', { gain: 0.35 }); cue(0.75, 'sparkle', { gain: 0.45 }); cue(1.75, 'sparkle', { gain: 0.4 });
  }

  // a02 · a king (faceless, ILLUSTRATION) before the walls of Thanjavur; a beaded halo pops round him, he lifts the pen
  {
    const P = archPts(540, 250, 640, 1190, 22);
    shot('a02', T1, 'a king in Thanjavur: faceless king before the fort, beaded halo, ILLUSTRATION', [540, 760], 0.07, (lt) => {
      cab(); ground(G.grn, G.grn2, 1040, null);
      ctx.fillStyle = G.blu2; ctx.fillRect(130, 90, 820, 600);
      blit(fortImg(), 500, 580, 540, 1050, 0.82);
      beadRow(P, seg(lt, 0, 1.0), 6);
      const up = eio(seg(lt, 1.2, 1.6));
      fig({ x: 540, y: 1195, h: 640, coat: G.ivory, turb: G.red2, gold: true, hl: [-13.5, -48], hr: [lerp(13.5, 22, up), lerp(-48, -74, up)] });
      if (up > 0) { const u = 6.4, hx = 540 + lerp(13.5, 22, up) * u * 0.98, hy = 1195 + lerp(-48, -74, up) * u; ctx.save(); ctx.translate(hx, hy); ctx.rotate(0.35); ell(0, -40, 7, 40, G.ivory); ctx.lineWidth = 2.5; ctx.strokeStyle = G.ink; ctx.stroke(); ctx.restore(); }
      front(lt, null);
      plaque('ILLUSTRATION', 540, 1257, 30, eob(seg(lt, 0.25, 0.55)));
    });
    cue(T1 + 0.05, 'pop', { gain: 0.3 }); cue(T1 + 0.5, 'pop', { gain: 0.3 }); cue(T1 + 1.25, 'zip', { gain: 0.3 });
  }

  // a03 · the treaty: scroll unrolls, abstract script runs, the red seal thumps; TREATY 1799; the gilt tarnishes and cracks
  {
    const C = crackNet(660, 830, 7, 37, 640);
    const rows = [];
    for (let r = 0; r < 11; r++) { const d = []; let x = 335; while (x < 745) { const w = 18 + rnd(r * 17 + x) * 60; d.push([x, Math.min(x + w, 745)]); x += w + 14; } rows.push(d); }
    shot('a03', T2, 'treaty: scroll, abstract writing, red seal, TREATY 1799, varnish tarnish + cracks', [600, 700], 0.07, (lt, d) => {
      cab(); ground(G.red2, G.grn, 960, G.blu2);
      for (let x = 150; x < 930; x += 40) { ctx.beginPath(); ctx.moveTo(x, 962); ctx.lineTo(x + 8, 1000); ctx.lineTo(x - 8, 1000); ctx.closePath(); ctx.fillStyle = G.gold2; ctx.fill(); }
      const yb = lerp(300, 930, eo(seg(lt, 0, 0.45)));
      rr(290, 250, 500, yb - 250, 4); ctx.fillStyle = G.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke();
      ctx.fillStyle = 'rgba(122,87,20,0.12)'; ctx.fillRect(296, 256, 488, 10);
      const pw = seg(lt, 0.35, 1.3) * rows.length;
      ctx.lineCap = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = '#3A1A0C';
      let qx = 335, qy = 310;
      ctx.beginPath();
      rows.forEach((dash, r) => {
        const y = 310 + r * 46; if (y > yb - 40 || r > pw) return;
        const lim = r < Math.floor(pw) ? 9999 : 335 + (pw - r) * 410;
        for (const [a, b] of dash) if (a < lim) { ctx.moveTo(a, y); ctx.lineTo(Math.min(b, lim), y); }
        qx = Math.min(lim, 745); qy = y;
      });
      ctx.stroke();
      for (const y of [250, yb]) { rr(268, y - 15, 544, 30, 15); ctx.fillStyle = G.wood; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke(); circle(268, y, 18, G.gold2); circle(812, y, 18, G.gold2); }
      if (lt > 0.3 && lt < 1.45) {   // the quill rides the writing
        const wob = sin(lt * 40) * 4; ctx.save(); ctx.translate(qx, qy + wob); ctx.rotate(0.5); ell(0, -70, 12, 70, G.ivory); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -130); ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      }
      if (lt > 1.05) {
        const p = eio(seg(lt, 1.05, 1.3)), s = lerp(1.7, 1, p) * (lt < 1.3 ? 1 : 1 + 0.06 * sin((lt - 1.3) * 30) * Math.exp(-(lt - 1.3) * 10));
        if (p < 1) { ctx.globalAlpha = 0.3 * p; ell(668, 842, 80, 26, '#000'); ctx.globalAlpha = 1; }
        seal(660, lerp(560, 830, p), 74 * s);
      }
      plaque('TREATY 1799', 540, 1110, 44, eob(seg(lt, 0.5, 0.8)));
      front(lt, null);
      const k = eio(seg(lt, 1.45, d)); tarnish(k * 0.9); drawCracks(C, seg(lt, 1.35, d));
    });
    cue(T2 + 0.02, 'zip', { gain: 0.4 }); cue(T2 + 0.5, 'pop', { gain: 0.4 }); cue(T2 + 1.3, 'thud', { gain: 0.8 }); cue(T2 + 1.45, 'rumble', { gain: 0.5, dur: 1.0 });
  }

  // a04 · "what he did next": cabinet doors open on shelves of manuscripts and books; then varnish dims them, doors drift half shut
  shot('a04', T3, 'what he did next / almost forgotten: doors open on library shelves, sheen, then varnish dims, doors drift shut', [540, 700], 0.07, (lt, d) => {
    cab(); ground('#2A120A', null, 0, null);
    blit(shelfImg(), 400, 0, 540, 170, 1);
    const fk = eio(seg(lt, 1.2, d));
    if (fk > 0) { ctx.fillStyle = `rgba(40,22,6,${fk * 0.55})`; ctx.fillRect(130, 90, 820, 1145); }
    for (let i = 0; i < 26; i++) { const x = 170 + rnd(i * 3.1) * 740, y = 200 + ((rnd(i * 5.3) * 1000 + lt * (20 + rnd(i) * 30)) % 1000); circle(x, y, 2 + rnd(i * 7) * 3, `rgba(255,226,160,${0.15 + fk * 0.3})`); }
    doors(lt < 1.6 ? eio(seg(lt, 0.05, 0.75)) * 1.5 : lerp(1.5, 0.95, eio(seg(lt, 1.6, d))));
    front(lt, null);
    frameSheen(seg(lt, 0.65, 1.35), 0.7);
    tarnish(fk * 0.35);
  });
  cue(T3 + 0.05, 'whoosh', { gain: 0.6 }); cue(T3 + 0.7, 'sparkle', { gain: 0.45 }); cue(T3 + 1.3, 'swell', { gain: 0.35, dur: 1.6 });

  // a05 · Serfoji II: faceless king, gold-leaf halo laid behind him, gesso beads round it, gems pop into his jewels
  {
    const TT = leafTargets(260, 280, 820, 1080, 66, 21, (x, y) => inArch(x, y, 540, 300, 560, 1100));
    const P = archPts(540, 318, 560, 1090, 22);
    const JW = [[-1.5, -97.2, 1.8, G.ruby], [0, -71.5, 1.6, G.emer], [0, -55.9, 1.7, G.saph]];
    shot('a05', T4, 'Serfoji II: king figure, gold-leaf halo, beaded arch, jewel gems, ILLUSTRATION', [540, 600], 0.1, (lt) => {
      cab(); ground(G.red2, G.blu, 1100, G.grn2);
      beadRow(P, seg(lt, 0, 0.8), 6);
      leaves(lt, TT, 0.2, 0.75, 0.5, 70, () => blit(haloImg(), 0, 0, 0, 0, 1), 5);
      sheen(haloImg(), 0, 0, 0, 0, 1, seg(lt, 1.35, 1.95), 0.6);
      const o = { x: 540, y: 1195, h: 820, coat: G.ivory, turb: G.red2, sash: G.gold, gold: true, hl: [-12, -55], hr: [12, -55] };
      fig(o);
      JW.forEach(([jx, jy, r, col], i) => popGem(540 + jx * 8.2, 1195 + jy * 8.2, r * 8.2, col, lt - 0.85 - i * 0.18));
      front(lt, null);
      plaque('ILLUSTRATION', 540, 1257, 30, eob(seg(lt, 0.2, 0.5)));
    });
    cue(T4 + 0.05, 'pop', { gain: 0.3 }); cue(T4 + 0.3, 'sparkle', { gain: 0.4 }); cue(T4 + 0.85, 'pop', { gain: 0.45 }); cue(T4 + 1.2, 'pop', { gain: 0.4 }); cue(T4 + 1.4, 'sparkle', { gain: 0.4 });
  }

  // a06 · a Maratha king in the Tamil country: small king with a saffron pennant, palms, a temple tower gilded leaf by leaf
  {
    const gs = 0.74, gx = 720, gy = 905;
    const TT = leafTargets(gx - 125, gy - 560, gx + 125, gy - 20, 54, 31);
    shot('a06', T5, 'Maratha king in the Tamil country: king + saffron pennant, palms, gopuram gilded by leaves, pan', [560, 700], 0.06, (lt, d) => {
      cab();
      ctx.fillStyle = G.blu2; ctx.fillRect(130, 90, 820, 1145);
      ctx.save(); ctx.translate(lerp(36, -36, eio(lt / d)), 0);
      circle(330, 430, 62, G.gold); circle(322, 422, 50, G.gold2);
      for (let k = 0; k < 18; k++) { const a = k * TAU / 18 + lt * 0.3; bead(330 + cos(a) * 84, 430 + sin(a) * 84, 4.2); }
      for (let r = 0; r < 9; r++) { ctx.fillStyle = r % 2 ? G.grn2 : G.grn; ctx.fillRect(90, 880 + r * 40, 900, 40); }
      ctx.strokeStyle = 'rgba(160,220,140,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); for (let r = 0; r < 9; r++) for (let x = 110 + (r % 2) * 20; x < 980; x += 40) { ctx.moveTo(x, 900 + r * 40); ctx.lineTo(x + 6, 888 + r * 40); } ctx.stroke();
      palm(905, 930, 420, lt, 2);
      blit(gopImg(false), GOP.ox, GOP.oy, gx, gy, gs);
      leaves(lt, TT, 0.9, 1.1, 0.55, 58, () => blit(gopImg(true), GOP.ox, GOP.oy, gx, gy, gs), 7);
      sheen(gopImg(true), GOP.ox, GOP.oy, gx, gy, gs, seg(lt, 2.3, 3.0), 0.8);
      palm(200, 960, 380, lt, 5);
      // king with the saffron pennant
      const fx = 360, fy = 1170, o = { x: fx, y: fy, h: 400, coat: G.ivory, turb: G.red2, gold: true, hr: [17, -56] };
      ctx.beginPath(); ctx.moveTo(fx + 68, fy - 6); ctx.lineTo(fx + 68, 640); ctx.strokeStyle = G.ink; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = G.wood; ctx.lineWidth = 5; ctx.stroke();
      const wv = (x) => sin(lt * 7 - x * 0.04) * 9 * ((x - fx - 68) / 150);
      const fp = [[fx + 68, 650], [fx + 220, 676], [fx + 182, 702], [fx + 220, 728], [fx + 68, 756]].map(([x, y]) => [x, y + wv(x)]);
      poly(fp); ctx.fillStyle = G.saff; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke();
      fig(o);
      ctx.restore();
      front(lt, null);
    });
    cue(T5 + 0.9, 'sparkle', { gain: 0.45 }); cue(T5 + 2.3, 'sparkle', { gain: 0.4 });
  }

  // a07 · as a boy he was adopted by King Tulaja: the boy walks in, the tall king's hand rests on his shoulder, beads arch round both
  {
    const P = archPts(530, 340, 620, 1190, 22);
    shot('a07', T6, 'boy walks in, King Tulaja hand on his shoulder, beaded arch round both', [520, 760], 0.08, (lt) => {
      cab(); ground(G.grn, G.red, 1080, G.red2);
      beadRow(P, seg(lt, 1.2, 2.3), 6);
      const bx = lerp(-80, 420, eo(seg(lt, 0, 0.8))), walk = lt < 0.8 ? abs(sin(lt * 14)) * 10 : 0;
      const boy = { x: bx, y: 1190 - walk, h: 460, kind: 'boy', coat: G.ivory, turb: G.saff, sash: G.red2 };
      const tul = { x: 650, y: 1192, h: 760, coat: G.blu2, turb: '#F4EEDF', sash: G.gold };
      const reach = eio(seg(lt, 0.95, 1.45)), tgt = loc(tul, 420 + 11 * 4.6, 1190 - 74 * 4.6);
      tul.hl = [lerp(-13.5, tgt[0], reach), lerp(-48, tgt[1], reach)];
      fig(boy); fig(tul);
      sparkle(420 + 50, 850, 34, reach > 0.95 ? 1 - seg(lt, 1.45, 1.9) : 0);
      front(lt, null);
    });
    cue(T6 + 0.1, 'whoosh', { gain: 0.35 }); cue(T6 + 1.4, 'sparkle', { gain: 0.4 }); cue(T6 + 1.25, 'pop', { gain: 0.3 });
  }

  // a08 · after Tulaja died: the cabinet doors close slowly over him
  {
    const P = archPts(540, 330, 600, 1190, 22);
    shot('a08', T7, 'after Tulaja died: cabinet doors swing shut over the king figure', [540, 700], 0.06, (lt, d) => {
      cab(); ground(G.red, G.grn, 1080, G.grn2);
      beadRow(P, 1, 6);
      fig({ x: 540, y: 1192, h: 780, coat: G.blu2, turb: '#F4EEDF', sash: G.gold, hl: [-4, -60], hr: [4, -60] });
      const sh = 1 - eio(seg(lt, 0.3, 1.25));
      doors(sh * 1.5);
      if (lt > 1.25) { const k = seg(lt, 1.25, d); ctx.fillStyle = `rgba(20,8,2,${k * 0.3})`; ctx.fillRect(130, 90, 820, 1145); sparkle(512, 640, 40, 1 - seg(lt, 1.3, 1.8)); }
      front(lt, null);
      for (let i = 0; i < 16; i++) { const x = 180 + rnd(i * 2.3) * 720, y = 200 + ((rnd(i * 4.1) * 1000 + lt * 40) % 1000); circle(x, y, 2 + rnd(i) * 2.5, 'rgba(255,226,160,0.3)'); }
    });
    cue(T7 + 0.3, 'whoosh', { gain: 0.4 }); cue(T7 + 1.25, 'slam', { gain: 0.6 });
  }

  // a09 · his half brother Amar Singh took the throne: dark-red figure glides onto the gilt throne, gems drop in, the boy is edged out
  {
    const ts = 1.2, seatY = 1190 + THR.seat * ts;
    shot('a09', T8, 'Amar Singh (dark red) glides onto gilt throne, gems pop, boy pushed aside', [540, 760], 0.07, (lt) => {
      cab(); ground(G.grn, G.red, 1080, G.red2);
      fig({ x: lerp(250, 205, eio(seg(lt, 0.3, 1.2))), y: 1190, h: 380, kind: 'boy', coat: G.ivory, turb: G.saff, sash: G.red2, a: lerp(1, 0.6, seg(lt, 0.3, 1.2)) });
      throne(540, 1190, ts, lt, [0.5, 0.07]);
      sheen(throneImg(), THR.ox, THR.oy, 540, 1190, ts, seg(lt, 1.45, 2.1), 0.7);
      fig({ x: lerp(1060, 540, eo(seg(lt, 0, 0.55))), y: seatY + 4, h: 560, seated: true, coat: G.dred, turb: G.dred, sash: G.gold, hl: [-18, -32], hr: [18, -32] });
      front(lt, null);
    });
    cue(T8 + 0.02, 'whoosh', { gain: 0.5 }); cue(T8 + 0.55, 'thud', { gain: 0.4 }); cue(T8 + 0.6, 'pop', { gain: 0.35 }); cue(T8 + 1.0, 'pop', { gain: 0.3 }); cue(T8 + 1.45, 'sparkle', { gain: 0.4 });
  }

  // a10 · a missionary, Christian Schwartz: black-coated figure, his open book gilded leaf by leaf, gems pop round the frame
  {
    const bx = 540, by = 700;
    const pages = (gold) => {
      for (const s of [-1, 1]) {
        poly([[bx, by + 12], [bx + s * 120, by - 4], [bx + s * 120, by - 92], [bx, by - 76]]); ctx.fillStyle = gold ? G.gold2 : G.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke();
        ctx.strokeStyle = gold ? G.gsh : 'rgba(58,26,12,0.7)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath();
        for (let r = 0; r < 5; r++) { const f = 0.2 + r * 0.14, y0 = by - 76 + r * 14 + 6; ctx.moveTo(bx + s * 16, y0 + 2); ctx.lineTo(bx + s * (100 - rnd(r * 3 + s) * 30), y0 - 10 * f + 12 * f); } ctx.stroke();
      }
    };
    const TT = leafTargets(430, 620, 650, 705, 34, 41);
    shot('a10', T9, 'Christian Schwartz: black-coat figure with open book, book gilded by leaves, frame gems pop', [540, 680], 0.09, (lt) => {
      cab(); ground(G.blu, G.grn, 1080, G.red2);
      const o = { x: 540, y: 1192, h: 800, kind: 'priest', coat: G.black, sash: G.black, trim: '#5A4A40', hl: [-10, -60], hr: [10, -60] };
      fig(o);
      poly([[bx - 128, by + 4], [bx, by + 22], [bx + 128, by + 4], [bx + 128, by - 2], [bx - 128, by - 2]]); ctx.fillStyle = G.red; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke();
      pages(false);
      leaves(lt, TT, 0.35, 0.7, 0.45, 40, () => pages(true), 9);
      front(lt, [0.1, 0.03]);
    });
    cue(T9 + 0.12, 'pop', { gain: 0.3 }); cue(T9 + 0.4, 'sparkle', { gain: 0.45 }); cue(T9 + 0.9, 'pop', { gain: 0.3 });
  }

  // a11 · helped protect him: Schwartz's arm over the boy, a beaded arch rises round the boy, a gem caps it
  {
    const P = archPts(445, 165, 800, 1190, 20);
    shot('a11', T10, 'protect: Schwartz arm round the boy, beaded arch rises round boy, gem caps it', [480, 820], 0.09, (lt) => {
      cab(); ground(G.grn, G.blu, 1080, G.red2);
      const sch = { x: 660, y: 1192, h: 780, kind: 'priest', coat: G.black, sash: G.black, trim: '#5A4A40', part: 'body' };
      const boy = { x: 450, y: 1190, h: 430, kind: 'boy', coat: G.ivory, turb: G.saff, sash: G.red2 };
      fig(sch);
      beadRow(P, seg(lt, 0.05, 0.85), 5.5);
      fig(boy);
      const reach = eio(seg(lt, 0, 0.5)), tgt = loc(sch, 450 + 11 * 4.3, 1190 - 72 * 4.3);
      fig({ ...sch, part: 'arms', hl: [lerp(-13.5, tgt[0], reach), lerp(-48, tgt[1], reach)], hr: [13.5, -50] });
      popGem(445, 800 - 165 - 10, 15, G.ruby, lt - 0.85);
      front(lt, null);
    });
    cue(T10 + 0.1, 'pop', { gain: 0.3 }); cue(T10 + 0.5, 'pop', { gain: 0.3 }); cue(T10 + 0.9, 'sparkle', { gain: 0.5 });
  }

  // a12 · educated: the boy at a book stand; palm-leaf bundles and books stack up on either side
  {
    const bundles = [0, 1, 2, 3].map((i) => ({ t: 0.15 + i * 0.28, w: 170 - i * 6 }));
    const books = [0, 1, 2, 3, 4].map((i) => ({ t: 0.3 + i * 0.24, w: 150 + rnd(i * 3) * 50, c: [G.red2, G.grn2, G.blu2, '#7A2E12', G.grn][i] }));
    shot('a12', T11, 'educated: boy at a book stand, palm-leaf bundles + books drop into stacks, frame sheen', [540, 820], 0.08, (lt) => {
      cab(); ground(G.blu, G.red, 1090, G.grn2);
      const boy = { x: 540, y: 1190, h: 480, kind: 'boy', coat: G.ivory, turb: G.saff, sash: G.red2 };
      boy.hl = loc(boy, 450, 900); boy.hr = loc(boy, 630, 900);
      fig({ ...boy, part: 'body' });
      for (const [a, b] of [[[430, 1192], [660, 960]], [[650, 1192], [420, 960]]]) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.strokeStyle = G.ink; ctx.lineWidth = 30; ctx.stroke(); ctx.strokeStyle = G.wood; ctx.lineWidth = 24; ctx.stroke(); }
      const turn = sin(lt * 3) * 6;
      for (const s of [-1, 1]) {
        poly([[540, 960], [540 + s * 150, 935 + (s > 0 ? turn : 0)], [540 + s * 150, 845], [540, 870]]); ctx.fillStyle = G.paper; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke();
        ctx.beginPath(); for (let r = 0; r < 5; r++) { ctx.moveTo(540 + s * 18, 885 + r * 15); ctx.lineTo(540 + s * (120 - (r % 3) * 18), 870 + r * 15 + (s > 0 ? turn * 0.5 : 0)); } ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(58,26,12,0.7)'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(540, 962); ctx.lineTo(540 + s * 152, 937 + (s > 0 ? turn : 0)); ctx.lineWidth = 5; ctx.strokeStyle = G.gold2; ctx.stroke();
      }
      fig({ ...boy, part: 'arms' });
      bundles.forEach((b, i) => {
        const p = eo(seg(lt, b.t, b.t + 0.22)); if (p <= 0) return; const y = lerp(-100, 1190 - (i + 1) * 34, p), x = 255 - b.w / 2;
        rr(x, y + 5, b.w, 22, 6); ctx.fillStyle = G.leafy; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = G.ink; ctx.stroke();
        rr(x - 5, y, b.w + 10, 8, 3); ctx.fillStyle = G.wood; ctx.fill(); ctx.stroke(); rr(x - 5, y + 25, b.w + 10, 8, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = G.ruby; ctx.fillRect(x + b.w * 0.3, y, 5, 33); ctx.fillRect(x + b.w * 0.7, y, 5, 33);
      });
      books.forEach((b, i) => {
        const p = eo(seg(lt, b.t, b.t + 0.2)); if (p <= 0) return; const y = lerp(-100, 1190 - (i + 1) * 32, p), x = 825 - b.w / 2 + (i % 2) * 10;
        rr(x, y, b.w, 30, 4); ctx.fillStyle = b.c; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = G.ink; ctx.stroke();
        ctx.fillStyle = G.ivory; ctx.fillRect(x + b.w - 14, y + 5, 10, 20); ctx.fillStyle = G.gold2; ctx.fillRect(x + 12, y + 4, 6, 22);
      });
      front(lt, null);
      frameSheen(seg(lt, 1.35, 2.1), 0.7);
    });
    bundles.forEach((b) => cue(T11 + b.t + 0.2, 'plop', { gain: 0.3 })); books.forEach((b, i) => i % 2 || cue(T11 + b.t + 0.18, 'tock', { gain: 0.3 }));
  }

  // a13 · 1798, the British: a new panel slides in, "1798" is burnished to gold, red-coats march in with a generic red flag
  {
    const S = 270, [ox, oy] = TXO(S), BP = []; for (let x = 250; x <= 830; x += 22) BP.push([x, 680]);
    shot('a13', T12, '1798: panel slides in, numerals burnished gold, red-coat soldiers march in with plain red flag', [540, 720], 0.06, (lt) => {
      cab();
      ctx.save(); ctx.translate((1 - eo(seg(lt, 0, 0.4))) * 1100, 0);
      ground(G.red2, G.grn, 1080, G.blu2);
      blit(textImg('aT1798b', '1798', S, false), ox, oy, 540, 520, 1);
      const wx = lerp(220, 880, eio(seg(lt, 0.3, 0.95)));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, wx, 900); ctx.clip(); blit(textImg('aT1798', '1798', S, true), ox, oy, 540, 520, 1); ctx.restore();
      if (lt > 0.3 && lt < 0.98) { ctx.fillStyle = 'rgba(255,248,214,0.7)'; ctx.fillRect(wx - 6, 400, 12, 240); }
      sheen(textImg('aT1798', '1798', S, true), ox, oy, 540, 520, 1, seg(lt, 1.0, 1.6), 0.85);
      beadRow(BP, seg(lt, 0.5, 1.1), 5);
      for (let i = 2; i >= 0; i--) {
        const x = lerp(1200 + i * 160, 560 + i * 150, seg(lt, 1.0, 2.3)), y = 1192 - abs(sin(lt * 9 + i)) * 10;
        if (x > 1100) continue;
        if (i === 2) {
          ctx.beginPath(); ctx.moveTo(x + 62, y - 200); ctx.lineTo(x + 62, y - 560); ctx.strokeStyle = G.ink; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = G.wood; ctx.lineWidth = 5; ctx.stroke();
          const wv = (k) => sin(lt * 7 + k) * 8;
          poly([[x + 62, y - 555], [x + 210, y - 548 + wv(1)], [x + 210, y - 450 + wv(2)], [x + 62, y - 458]]); ctx.fillStyle = G.ruby; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = G.ink; ctx.stroke();
          ctx.lineWidth = 6; ctx.strokeStyle = G.gold2; ctx.beginPath(); ctx.arc(x + 136, y - 503 + wv(1.5) * 0.5, 24, 0, TAU); ctx.stroke();
        }
        fig({ x, y, h: 420, kind: 'brit', coat: G.red2, musket: i !== 2, hr: i === 2 ? [15, -58] : [12, -46], hl: [-12, -46] });
      }
      ctx.restore();
      front(lt, null);
    });
    cue(T12 + 0.02, 'slide', { gain: 0.6 }); cue(T12 + 0.35, 'sizzle', { gain: 0.25, dur: 0.6 }); cue(T12 + 1.0, 'sparkle', { gain: 0.4 });
    cue(Wd('british', 4) - 0.1, 'drum', { gain: 0.6 }); cue(Wd('british', 4) + 0.3, 'drum', { gain: 0.45 });
  }

  // a14 + a15 share the throne scene: Serfoji set on the throne between two red-coats; then the red seal thumps down, the gilt starts to crack
  const ts = 1.2, seatY = 1190 + THR.seat * ts;
  function throneScene(lt, sy, pop) {
    ground(G.grn, G.red, 1080, G.red2);
    for (const [x, s] of [[205, 1], [875, -1]]) fig({ x, y: 1192, h: 440, kind: 'brit', coat: G.red2, hl: s > 0 ? [-12, -46] : [-20, -82], hr: s > 0 ? [20, -82] : [12, -46] });
    throne(540, 1190, ts, lt, pop);
    fig({ x: 540, y: sy, h: 560, seated: true, coat: G.ivory, turb: G.red2, sash: G.gold, gold: true, hl: [-18, -32], hr: [18, -32] });
  }
  shot('a14', T13, 'British put Serfoji on the throne: he is lowered onto the gilt throne between two red-coats, gems + sheen', [540, 760], 0.07, (lt) => {
    cab();
    const p = seg(lt, 0, 0.6);
    throneScene(lt, lerp(seatY - 620, seatY + 4, p < 1 ? eob(p) : 1), null);
    sheen(throneImg(), THR.ox, THR.oy, 540, 1190, ts, seg(lt, 0.75, 1.5), 0.7);
    front(lt, [0.45, 0.02]);
  });
  cue(T13 + 0.05, 'whoosh', { gain: 0.45 }); cue(T13 + 0.6, 'thud', { gain: 0.5 }); cue(T13 + 0.7, 'sparkle', { gain: 0.45 }); cue(T13 + 0.5, 'pop', { gain: 0.3 });
  {
    const C = crackNet(770, 330, 8, 53, 900);
    shot('a15', T14, 'the price: red seal stamps onto the panel, plaque 1799, tarnish + cracks begin', [700, 520], 0.05, (lt, d) => {
      const hit = 0.45, shake = lt > hit && lt < hit + 0.25 ? (1 - (lt - hit) / 0.25) * 10 : 0;
      ctx.save(); ctx.translate(sin(lt * 90) * shake, cos(lt * 77) * shake);
      cab(); throneScene(lt, seatY + 4, null);
      front(lt, null);
      if (lt > 0.1) {
        const p = eio(seg(lt, 0.1, hit)), s = lerp(1.8, 1, p);
        if (p < 1) { ctx.globalAlpha = 0.35 * p; ell(780, 345, 90 * s, 30 * s, '#000'); ctx.globalAlpha = 1; }
        seal(770, lerp(-120, 330, p), 88 * s);
      }
      plaque('1799', 540, 1257, 34, eob(seg(lt, 1.0, 1.3)));
      tarnish(0.6 * eio(seg(lt, 1.15, d))); drawCracks(C, seg(lt, 0.5, d) * 0.85);
      ctx.restore();
    });
    cue(T14 + 0.1, 'whoosh', { gain: 0.4 }); cue(T14 + 0.45, 'thud', { gain: 0.9 }); cue(T14 + 1.0, 'pop', { gain: 0.35 }); cue(T14 + 1.2, 'rumble', { gain: 0.5, dur: 1.4 });
  }
}
