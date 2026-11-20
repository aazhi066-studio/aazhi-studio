// EPISODE 13 · worker A : "Paper Theatre", lines 0-4 (t 0 → L(5)).
// Hook (51 years before 1857, soldiers rose inside a Tamil fort) · Vellore, night of 10 July 1806 · the 1805 dress orders
// (no forehead marks, shave beards) · the new round hat, badge rumoured to be leather · refusers punished, two flogged + thrown out.
// Engine: every scene plays on ONE cached toy paper theatre (printed card proscenium, pelmet, apron + footlights) standing on a
// dark table. Backdrops, flats and figures are hand-tinted card cut-outs baked once by cut() (misregistered tint, ink outline,
// hatching, paper margin, baked cast shadow); per frame only blits move, plus flames, strings, rods, iris and a few strokes.
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { poly, lg, cached, blit } from './art.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const C = {
  ink: '#2B1A10', paper: '#EFE3C6', cream: '#EADBB8', maroon: '#7A1E22', ochre: '#C08A2E', velvet: '#8C1C24', fringe: '#D9A441',
  fl: '#FFC864', night: '#1C2340', night2: '#2B3561', moon: '#F3E6C4', lat: '#A0623E', lat2: '#7C4A2E', cred: '#B8302A',
  brit: '#44506A', iron: '#2A2A2E', flash: '#FFF6DC', smoke: '#9A938A', bill: '#2B1408', skin: '#7E5236', pale: '#D9B99A',
  hair: '#1E1612', white: '#F2EDE0', trou: '#ECE4D2',
};
// stage opening (inside the proscenium) and the front edge of the stage floor
const OX0 = 100, OX1 = 980, OW = 880, OY0 = 250, FLOOR = 1222, BDH = 860;

// ───────────────────────────── card machinery ─────────────────────────────
function off(w, h, q, fn) {
  const c = document.createElement('canvas'); c.width = Math.ceil(w * q); c.height = Math.ceil(h * q);
  const prev = ctx, x = c.getContext('2d'); setCtx(x); x.save(); x.scale(q, q); fn(); x.restore(); setCtx(prev); return c;
}
/** a card cut-out: art drawn once, a paper margin round it (dilated silhouette) and a baked cast shadow. origin (ox, oy) */
function cut(key, w, h, ox, oy, fn, o = {}) {
  const m = o.m ?? 5, q = o.q ?? 1;
  const c = cached('a' + key, w, h, q, () => {
    const base = ctx;
    const A = off(w, h, q, () => { ctx.translate(ox, oy); fn(); });
    const B = off(w, h, q, () => {
      for (let k = 0; k < 12; k++) { const a = k * TAU / 12; ctx.drawImage(A, cos(a) * m, sin(a) * m, w, h); }
      ctx.drawImage(A, 0, 0, w, h); ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = o.edge || C.paper; ctx.fillRect(0, 0, w, h);
    });
    if (o.shadow !== false) { base.save(); base.shadowColor = 'rgba(6,3,2,0.55)'; base.shadowOffsetX = (o.sx ?? 9) * q; base.shadowOffsetY = (o.sy ?? 7) * q; base.shadowBlur = 7 * q; base.drawImage(B, 0, 0, w, h); base.restore(); }
    base.drawImage(B, 0, 0, w, h); base.drawImage(A, 0, 0, w, h);
  });
  c._ox = ox; c._oy = oy; return c;
}
/** draw a cut at (x, y) by its origin; sx = -1 flips */
function put(c, x, y, s = 1, rot = 0, a = 1, sx = 1, sy = 1) {
  if (a <= 0.005) return;
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(s * sx, s * sy); if (a < 1) ctx.globalAlpha *= a;
  ctx.drawImage(c, -c._ox, -c._oy, c.width / c._q, c.height / c._q); ctx.restore();
}
/** the plain paper back of a cut (seen when a card turns round) */
function backOf(c, key) {
  const b = cached('a' + key, c.width / c._q, c.height / c._q, c._q, () => {
    const w = c.width / c._q, h = c.height / c._q; ctx.drawImage(c, 0, 0, w, h);
    ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = '#D6C59E'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(43,26,16,0.16)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let k = -h; k < w; k += 8) { ctx.moveTo(k, 0); ctx.lineTo(k + h, h); } ctx.stroke();
  });
  b._ox = c._ox; b._oy = c._oy; return b;
}
const R = (x, y, w, h, r = 0) => () => { ctx.beginPath(); if (r) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
const Pg = (pts) => () => poly(pts);
const E = (x, y, rx, ry, rot = 0) => () => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); };
const Fn = (f) => () => { ctx.beginPath(); f(); ctx.closePath(); };
function hatchLines(b, ang, a, g) {
  const [x0, y0, x1, y1] = b, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, Rr = Math.hypot(x1 - x0, y1 - y0) / 2;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); ctx.strokeStyle = `rgba(43,26,16,${a})`; ctx.lineWidth = 1.3; ctx.beginPath();
  for (let k = -Rr; k < Rr; k += g) { ctx.moveTo(-Rr, k); ctx.lineTo(Rr, k); } ctx.stroke(); ctx.restore();
}
/** one hand-coloured part: watercolour fill slightly off register, engraved hatching inside the outline, ink outline */
function pt(path, fill, o = {}) {
  ctx.save(); ctx.translate(o.tx ?? 4, o.ty ?? -3); path(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  if (o.h != null) { ctx.save(); path(); ctx.clip(); hatchLines(o.hb || [-500, -900, 500, 100], o.h, o.ha ?? 0.2, o.hg ?? 7); ctx.restore(); }
  if (o.lw !== 0) { path(); ctx.strokeStyle = o.ink || C.ink; ctx.lineWidth = o.lw || 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
function bar(x0, y0, x1, y1, w, col, o = {}) {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l * w / 2, ny = dx / l * w / 2;
  pt(Pg([[x0 + nx, y0 + ny], [x1 + nx * 0.7, y1 + ny * 0.7], [x1 - nx * 0.7, y1 - ny * 0.7], [x0 - nx, y0 - ny]]), col, { lw: 2, ...o });
}
function star(x, y, r0, r1, n, rot = 0) { ctx.beginPath(); for (let k = 0; k < n * 2; k++) { const r = k % 2 ? r1 : r0, a = rot + k * PI / n; ctx.lineTo(x + cos(a) * r, y + sin(a) * r); } ctx.closePath(); }

// ───────────────────────────── the room, the theatre ─────────────────────────────
const roomImg = () => cached('aRoom', W, H, 1, () => {
  ctx.fillStyle = '#0C0806'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(540, 700, 50, 540, 700, 950); g.addColorStop(0, 'rgba(110,62,30,0.35)'); g.addColorStop(1, 'rgba(110,62,30,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = lg(0, 1292, 0, H, [[0, '#3A2616'], [0.12, '#24170D'], [1, '#0D0805']]); ctx.fillRect(0, 1292, W, H - 1292);
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 46; i++) { const y = 1310 + rnd(i) * 600, a = 0.05 + rnd(i + 3) * 0.08; ctx.strokeStyle = i % 3 ? `rgba(0,0,0,${a * 2})` : `rgba(255,200,140,${a * 0.4})`; ctx.beginPath(); ctx.moveTo(-20, y); ctx.bezierCurveTo(300, y + (rnd(i + 7) - 0.5) * 30, 700, y + (rnd(i + 9) - 0.5) * 30, 1100, y + (rnd(i + 5) - 0.5) * 20); ctx.stroke(); }
  ctx.save(); ctx.filter = 'blur(10px)'; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.ellipse(540, 1312, 560, 26, 0, 0, TAU); ctx.fill(); ctx.restore();
});
const LAMPS = Array.from({ length: 11 }, (_, i) => 150 + i * 78);
const proscImg = () => cached('aPros', W, H, 1, () => {
  const hb = [0, 0, 1080, 1320];
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(30, 1300); ctx.lineTo(30, 80); ctx.lineTo(210, 80); ctx.quadraticCurveTo(540, -30, 870, 80); ctx.lineTo(1050, 80); ctx.lineTo(1050, 1300); ctx.closePath(); ctx.rect(OX1, OY0, -OW, FLOOR - OY0); ctx.fill('evenodd'); ctx.restore();
  // header with a pediment and a blank cartouche
  pt(Fn(() => { ctx.moveTo(30, 254); ctx.lineTo(30, 80); ctx.lineTo(210, 80); ctx.quadraticCurveTo(540, -30, 870, 80); ctx.lineTo(1050, 80); ctx.lineTo(1050, 254); }), C.cream, { h: 0.35, ha: 0.13, hb, lw: 4 });
  pt(R(92, 114, 896, 120, 4), C.maroon, { h: -0.6, ha: 0.2, hb });
  ctx.strokeStyle = C.ochre; ctx.lineWidth = 4; ctx.strokeRect(106, 126, 868, 96); ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.strokeRect(112, 132, 856, 84);
  for (const x of [44, 1000]) pt(R(x, 114, 36, 120, 3), C.ochre, { h: 0.8, ha: 0.25, hb });
  for (let x = 120; x < 960; x += 60) { pt(Pg([[x, 174], [x + 14, 160], [x + 28, 174], [x + 14, 188]]), C.ochre, { lw: 1.5 }); }
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + sx * 90, 92); ctx.bezierCurveTo(540 + sx * 160, 40, 540 + sx * 240, 110, 540 + sx * 320, 66); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke(); pt(E(540 + sx * 250, 84, 22, 9, sx * -0.4), C.ochre, { lw: 2 }); pt(E(540 + sx * 170, 64, 18, 8, sx * 0.5), C.ochre, { lw: 2 }); }
  pt(E(540, 98, 96, 66), C.cream, { h: 0.9, ha: 0.18, hb, lw: 4 }); pt(E(540, 98, 76, 50), C.ochre, { h: -0.9, ha: 0.2, hb });
  pt(() => star(540, 98, 38, 15, 8, -PI / 2), C.cream, { lw: 2.5 }); pt(E(540, 98, 8, 8), C.maroon, { lw: 2 });
  for (let x = 32; x < 1048; x += 22) pt(R(x, 236, 14, 16), C.cream, { lw: 1.5, tx: 1, ty: -1 });
  // pillars
  for (const x0 of [30, 980]) {
    pt(R(x0, 252, 70, 978), C.cream, { h: 1.2, ha: 0.14, hb, lw: 4 });
    pt(R(x0 + 13, 304, 44, 870, 3), C.maroon, { h: -0.7, ha: 0.2, hb });
    ctx.strokeStyle = C.ochre; ctx.lineWidth = 3; ctx.strokeRect(x0 + 19, 310, 32, 858);
    for (const y of [420, 640, 860, 1080]) pt(Pg([[x0 + 35, y - 34], [x0 + 50, y], [x0 + 35, y + 34], [x0 + 20, y]]), C.cream, { lw: 2 });
    pt(R(x0 - 8, 250, 86, 36, 3), C.ochre, { h: 0, ha: 0.25, hb, hg: 5 }); pt(R(x0 - 8, 1184, 86, 42, 3), C.ochre, { h: 0, ha: 0.25, hb, hg: 5 });
  }
  // pelmet: velvet swags with gold fringe
  pt(R(OX0, OY0, OW, 44), C.velvet, { h: 1.57, ha: 0.25, hb, hg: 6 });
  for (let k = 0; k < 5; k++) {
    const xa = OX0 + k * OW / 5, xb = xa + OW / 5, xm = (xa + xb) / 2;
    pt(Fn(() => { ctx.moveTo(xa, 288); ctx.quadraticCurveTo(xm, 380, xb, 288); ctx.lineTo(xb, 280); ctx.lineTo(xa, 280); }), C.velvet, { h: 1.57, ha: 0.22, hb, hg: 6 });
    ctx.strokeStyle = C.fringe; ctx.lineWidth = 2;
    for (let u = 0.02; u < 1; u += 0.025) { const x = (1 - u) * (1 - u) * xa + 2 * (1 - u) * u * xm + u * u * xb, y = (1 - u) * (1 - u) * 288 + 2 * (1 - u) * u * 380 + u * u * 288; ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(x, y + 14); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(xa, 288); ctx.quadraticCurveTo(xm, 380, xb, 288); ctx.lineWidth = 6; ctx.strokeStyle = C.fringe; ctx.stroke(); ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.stroke();
    pt(E(xb, 300, 10, 16), C.fringe, { lw: 2 });
  }
  // apron and the footlight cups
  pt(R(OX0 - 4, FLOOR - 6, OW + 8, 12), '#2A1A10', { lw: 2 });
  pt(R(38, FLOOR + 4, 1004, 80, 3), C.cream, { h: 0.3, ha: 0.14, hb, lw: 4 });
  pt(R(70, FLOOR + 34, 940, 32, 3), C.maroon, { h: -0.6, ha: 0.2, hb }); ctx.strokeStyle = C.ochre; ctx.lineWidth = 3; ctx.strokeRect(78, FLOOR + 40, 924, 20);
  for (let x = 120; x < 980; x += 120) pt(E(x, FLOOR + 50, 16, 8), C.ochre, { lw: 1.5 });
  for (const x of LAMPS) { pt(E(x, FLOOR + 10, 16, 6), '#5A4A30', { lw: 2 }); pt(R(x - 3, FLOOR + 2, 6, 8), '#C8B48A', { lw: 1.2 }); }
});
const glowImg = () => cached('aGlow', 240, 240, 1, () => { const g = ctx.createRadialGradient(120, 120, 0, 120, 120, 120); g.addColorStop(0, 'rgba(255,200,100,0.9)'); g.addColorStop(0.35, 'rgba(255,170,70,0.3)'); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 240, 240); });
const washImg = () => cached('aWash', OW, 760, 1, () => { ctx.fillStyle = lg(0, 760, 0, 0, [[0, 'rgba(255,190,100,0.42)'], [0.4, 'rgba(255,170,80,0.12)'], [1, 'rgba(255,170,80,0)']]); ctx.fillRect(0, 0, OW, 760); });
function foot(t, lvl) {
  if (lvl <= 0.01) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  LAMPS.forEach((x, i) => { const f = 0.8 + 0.2 * sin(t * 13 + i * 2.3) * sin(t * 7.1 + i); blit(glowImg(), 120, 120, x, FLOOR - 4, 0.9, 0.55 * lvl * f); });
  ctx.restore();
  LAMPS.forEach((x, i) => {
    const f = 0.75 + 0.25 * sin(t * 15 + i * 1.7) * sin(t * 6.3 + i * 0.7), h = (10 + 14 * lvl) * f, w = 5 + 2 * lvl, sw = sin(t * 9 + i) * 2;
    ctx.fillStyle = C.fl; ctx.beginPath(); ctx.moveTo(x + sw, FLOOR + 2 - h); ctx.quadraticCurveTo(x + w, FLOOR + 2 - h * 0.35, x, FLOOR + 4); ctx.quadraticCurveTo(x - w, FLOOR + 2 - h * 0.35, x + sw, FLOOR + 2 - h); ctx.fill();
    ctx.fillStyle = '#FFF6DC'; ctx.beginPath(); ctx.ellipse(x, FLOOR - 1, 2, 4 * f, 0, 0, TAU); ctx.fill();
  });
}
const curtImg = () => cached('aCurt', OW, 1010, 1, () => {
  const n = 12, g = ctx.createLinearGradient(0, 0, OW, 0);
  for (let k = 0; k <= n * 2; k++) g.addColorStop(k / (n * 2), k % 2 ? '#5A0E14' : '#A8262F');
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(OW, 0); ctx.lineTo(OW, 950);
  for (let k = n; k > 0; k--) { const xa = k * OW / n, xb = (k - 1) * OW / n; ctx.quadraticCurveTo((xa + xb) / 2, 975, xb, 950); }
  ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); hatchLines([0, 0, OW, 1000], PI / 2, 0.16, 5);
  for (let k = 0; k < n; k++) { const x = (k + 0.5) * OW / n - 6; ctx.fillStyle = 'rgba(255,170,150,0.12)'; ctx.fillRect(x, 0, 8, 1000); } ctx.restore();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = C.fringe; ctx.strokeStyle = C.fringe; ctx.lineWidth = 2.5;
  for (let x = 2; x < OW; x += 6) { const yb = 950 + 18 * sin(PI * ((x % (OW / n)) / (OW / n))); ctx.beginPath(); ctx.moveTo(x, yb - 22); ctx.lineTo(x, yb + 30); ctx.stroke(); }
  ctx.strokeStyle = '#8A5E1E'; ctx.lineWidth = 6; ctx.beginPath(); for (let x = 0; x <= OW; x += 8) { const yb = 950 + 18 * sin(PI * ((x % (OW / n)) / (OW / n))) - 20; x ? ctx.lineTo(x, yb) : ctx.moveTo(x, yb); } ctx.stroke();
});
/** curtain: up = 0 closed .. 1 fully raised */
function curtain(up, lt, sway = 0) {
  if (up >= 1) return;
  ctx.save(); ctx.translate(OX0, OY0 - up * 1040); ctx.transform(1, 0, sin(lt * 4) * 0.012 * sway, 1, 0, 0);
  ctx.drawImage(curtImg(), 0, 0, OW, 1010); ctx.restore();
}
const vigImg = () => cached('aVig', W, H, 0.5, () => { const g = ctx.createRadialGradient(540, 820, 380, 540, 900, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); });
function vig() { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(vigImg(), 0, 0, W, H); ctx.restore(); }

/** the theatre: content is clipped to the opening; o = { lvl footlights 0..1, night veil, curt (0..1 up), fold (1 = standing) } */
function stage(lt, t, o, content) {
  blit(roomImg(), 0, 0, 0, 0);
  const f = o.fold ?? 1, lvl = o.lvl ?? 1;
  ctx.save();
  if (f !== 1) { ctx.translate(0, 1300); ctx.scale(1, Math.max(0.002, f)); ctx.translate(0, -1300); }
  ctx.save(); ctx.beginPath(); ctx.rect(OX0, OY0, OW, FLOOR - OY0 + 2); ctx.clip();
  content();
  if (o.night) { ctx.fillStyle = `rgba(10,14,40,${o.night})`; ctx.fillRect(OX0, OY0, OW, FLOOR - OY0 + 2); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; blit(washImg(), 0, 760, OX0, FLOOR + 2, 1, 0.8 * lvl); ctx.restore();
  if (o.curt != null) curtain(o.curt, lt, o.sway ?? 1);
  ctx.restore();
  blit(proscImg(), 0, 0, 0, 0);
  foot(t, lvl);
  if (f !== 1) { ctx.fillStyle = `rgba(0,0,0,${(1 - f) * 0.75})`; ctx.fillRect(20, -40, 1040, 1345); }
  ctx.restore();
}

// ───────────────────────────── backdrops & scenery ─────────────────────────────
const BW = OW + 40;
const STARS = Array.from({ length: 64 }, (_, i) => [rnd(i * 3 + 1) * BW, 40 + rnd(i * 7 + 2) * 560, 1.4 + rnd(i + 11) * 2.2]);
const bdNight = () => cached('aBdNight', BW, BDH, 1, () => {
  ctx.fillStyle = lg(0, 0, 0, BDH, [[0, '#121834'], [0.55, C.night], [1, C.night2]]); ctx.fillRect(0, 0, BW, BDH);
  hatchLines([0, 0, BW, BDH], 0, 0.18, 6);
  for (const [x, y, r] of STARS) { const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6); g.addColorStop(0, 'rgba(255,240,200,0.5)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12); ctx.fillStyle = '#FFF3D2'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  pt(Fn(() => { ctx.moveTo(0, BDH); ctx.lineTo(0, 650); for (let x = 0; x <= BW; x += 40) ctx.lineTo(x, 640 - 50 * sin(x / 140) - 30 * sin(x / 53 + 1)); ctx.lineTo(BW, BDH); }), '#1A2242', { h: 0.4, ha: 0.25, hb: [0, 0, BW, BDH] });
  pt(Fn(() => { ctx.moveTo(0, BDH); ctx.lineTo(0, 720); for (let x = 0; x <= BW; x += 40) ctx.lineTo(x, 715 - 26 * sin(x / 90 + 2)); ctx.lineTo(BW, BDH); }), '#141A34', { h: -0.4, ha: 0.25, hb: [0, 0, BW, BDH] });
});
function twinkle(t, x0, y0) { for (let i = 0; i < 18; i++) { const [x, y, r] = STARS[i], a = 0.5 + 0.5 * sin(t * (2 + rnd(i) * 3) + i * 1.7); ctx.fillStyle = `rgba(255,246,220,${0.7 * a})`; ctx.beginPath(); ctx.arc(x0 + x, y0 + y, r * 1.7, 0, TAU); ctx.fill(); } }
const bdDusk = () => cached('aBdDusk', BW, BDH, 1, () => {
  ctx.fillStyle = lg(0, 0, 0, BDH, [[0, '#4A1016'], [0.45, '#9A3424'], [0.72, '#D9853E'], [1, '#E9A85A']]); ctx.fillRect(0, 0, BW, BDH);
  hatchLines([0, 0, BW, BDH], 0, 0.16, 6);
  pt(E(470, 560, 96, 96), '#F3C470', { h: 0, ha: 0.12, hb: [0, 0, BW, BDH] });
  pt(Fn(() => { ctx.moveTo(0, BDH); ctx.lineTo(0, 600); for (let x = 0; x <= BW; x += 40) ctx.lineTo(x, 610 - 40 * sin(x / 120) - 20 * sin(x / 47)); ctx.lineTo(BW, BDH); }), '#5A1C16', { h: 0.5, ha: 0.25, hb: [0, 0, BW, BDH] });
});
const bdDay = () => cached('aBdDay', BW, BDH, 1, () => {
  const hb = [0, 0, BW, BDH];
  ctx.fillStyle = lg(0, 0, 0, 620, [[0, '#7F98A2'], [1, '#DCCFA8']]); ctx.fillRect(0, 0, BW, BDH); hatchLines(hb, 0, 0.12, 7);
  for (const [cx, cy, s] of [[200, 200, 1], [700, 140, 0.8], [520, 300, 0.6]]) pt(Fn(() => { ctx.ellipse(cx, cy, 90 * s, 26 * s, 0, 0, TAU); }), '#EDE4CC', { lw: 2 });
  pt(R(0, 560, BW, 200), C.lat, { h: 0, ha: 0.2, hb, hg: 9 });
  ctx.strokeStyle = 'rgba(43,26,16,0.3)'; ctx.lineWidth = 2; for (let y = 590; y < 760; y += 30) for (let x = (y / 30 % 2) * 30; x < BW; x += 60) { ctx.strokeRect(x, y, 60, 30); }
  for (let x = 0; x < BW; x += 46) pt(R(x, 532, 28, 30), C.lat, { lw: 2 });
  for (const bx of [160, 760]) { pt(R(bx - 70, 470, 140, 290), C.lat2, { h: 0.6, ha: 0.2, hb }); for (let x = bx - 70; x < bx + 70; x += 35) pt(R(x, 444, 22, 28), C.lat2, { lw: 2 }); pt(R(bx - 8, 560, 16, 40, 6), '#2A1812', { lw: 1.5 }); }
  pt(R(0, 760, BW, 100), '#B89A66', { h: 0.1, ha: 0.18, hb });
});
const bdPlain = () => cached('aBdPlain', BW, BDH, 1, () => {
  ctx.fillStyle = lg(0, 0, 0, BDH, [[0, '#24182C'], [1, '#2B3561']]); ctx.fillRect(0, 0, BW, BDH);
  hatchLines([0, 0, BW, BDH], PI / 2, 0.2, 6);
  const g = ctx.createRadialGradient(BW / 2, 520, 40, BW / 2, 520, 520); g.addColorStop(0, 'rgba(255,220,170,0.16)'); g.addColorStop(1, 'rgba(255,220,170,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, BW, BDH);
});
const bdMap = () => cached('aBdMap', OW, BDH, 1, () => {
  const hb = [0, 0, OW, BDH];
  ctx.fillStyle = '#E6D3A6'; ctx.fillRect(0, 0, OW, BDH); hatchLines(hb, 0.2, 0.08, 6);
  pt(Fn(() => { ctx.moveTo(OW, 0); ctx.lineTo(700, 0); ctx.bezierCurveTo(660, 160, 730, 260, 680, 380); ctx.bezierCurveTo(640, 480, 700, 600, 640, 700); ctx.lineTo(620, BDH); ctx.lineTo(OW, BDH); }), '#8399A2', { h: 0, ha: 0.25, hb, hg: 9 });
  ctx.strokeStyle = 'rgba(43,26,16,0.45)'; ctx.lineWidth = 2; for (let i = 0; i < 16; i++) { const x = 730 + rnd(i) * 120, y = 60 + rnd(i + 4) * 740; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - 8, x + 20, y); ctx.quadraticCurveTo(x + 30, y + 8, x + 40, y); ctx.stroke(); }
  for (let i = 0; i < 14; i++) { const x = 60 + rnd(i * 5) * 260, y = 120 + rnd(i * 9) * 560, s = 18 + rnd(i) * 16; pt(Pg([[x - s, y], [x, y - s * 1.2], [x + s, y]]), '#A68456', { lw: 2, h: 0.8, ha: 0.3, hb }); }
  ctx.beginPath(); ctx.moveTo(40, 380); ctx.bezierCurveTo(180, 330, 260, 470, 380, 430); ctx.bezierCurveTo(480, 400, 560, 520, 668, 520); ctx.strokeStyle = C.ink; ctx.lineWidth = 11; ctx.stroke(); ctx.strokeStyle = '#5F7C92'; ctx.lineWidth = 7; ctx.stroke();
  ctx.setLineDash([6, 9]); ctx.strokeStyle = 'rgba(43,26,16,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(330, 470); ctx.lineTo(450, 500); ctx.lineTo(600, 620); ctx.moveTo(330, 470); ctx.lineTo(300, 720); ctx.stroke(); ctx.setLineDash([]);
  for (const [x, y] of [[450, 500], [600, 620], [300, 720], [180, 250]]) pt(E(x, y, 7, 7), '#7A4A2E', { lw: 2 });
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(22, 22, OW - 44, BDH - 44); ctx.lineWidth = 1.5; ctx.strokeRect(32, 32, OW - 64, BDH - 64);
});
const floorImg = () => cached('aFloor', OW, 160, 1, () => {
  ctx.fillStyle = lg(0, 0, 0, 160, [[0, '#3E2818'], [1, '#6A4428']]); ctx.fillRect(0, 0, OW, 160);
  ctx.strokeStyle = 'rgba(20,10,4,0.5)'; ctx.lineWidth = 2; for (let k = -12; k <= 12; k++) { ctx.beginPath(); ctx.moveTo(OW / 2 + k * 40, 0); ctx.lineTo(OW / 2 + k * 95, 160); ctx.stroke(); }
  for (const y of [48, 92, 132]) { ctx.fillStyle = 'rgba(10,6,2,0.75)'; ctx.fillRect(0, y, OW, 5); ctx.fillStyle = 'rgba(255,210,150,0.18)'; ctx.fillRect(0, y + 5, OW, 2); }
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, OW, 6);
});
const wingImg = (v) => cut('Wing' + v, 330, 900, 165, 860, () => {
  const fol = v === 'n' ? ['#22304A', '#2C3C5A', '#1A2640'] : v === 's' ? ['#3A1A22', '#4A2228', '#2E141A'] : ['#46643A', '#5E7E44', '#3A5430'], hb = [-200, -900, 200, 20];
  pt(Pg([[-22, 0], [22, 0], [12, -420], [-8, -420]]), v !== 'd' ? '#2E2228' : '#5A3A26', { h: 1.3, ha: 0.3, hb });
  [[-30, -520, 110, 90], [60, -600, 90, 80], [-60, -650, 80, 70], [20, -720, 100, 80], [-10, -440, 90, 60], [80, -480, 60, 50]].forEach(([x, y, rx, ry], i) => pt(E(x, y, rx, ry), fol[i % 3], { h: 0.7 + i * 0.3, ha: 0.28, hb }));
});
const moonImg = () => cut('Moon', 180, 180, 90, 90, () => { pt(E(0, 0, 62, 62), C.moon, { h: 0.6, ha: 0.1, hb: [-80, -80, 80, 80], lw: 3 }); ctx.save(); E(0, 0, 62, 62)(); ctx.clip(); ctx.fillStyle = 'rgba(160,140,100,0.35)'; ctx.beginPath(); ctx.arc(26, -6, 70, 0, TAU); ctx.fill(); ctx.restore(); pt(E(-18, -14, 10, 8), '#E0CFA6', { lw: 1.5 }); pt(E(10, 20, 7, 6), '#E0CFA6', { lw: 1.5 }); }, { m: 4 });
function moonOnWire(p) {
  const x = lerp(260, 820, p), y = 470 - sin(p * PI) * 90;
  ctx.strokeStyle = 'rgba(200,200,210,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, OY0); ctx.lineTo(x, y - 60); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; blit(glowImg(), 120, 120, x, y, 1.6, 0.35); ctx.restore();
  put(moonImg(), x, y, 1, sin(p * 6) * 0.05);
}
// sets: backdrop + floor + wings, with a little parallax across the shot
function nightSet(lt, d, t, o = {}) {
  const u = lt / d, px = (k) => (0.5 - u) * k;
  blit(bdNight(), 0, 0, OX0 - 20 + px(10), OY0); twinkle(t, OX0 - 20 + px(10), OY0);
  if (o.moon !== false) moonOnWire(o.moonP ?? 0.2 + 0.25 * u);
  blit(floorImg(), 0, 0, OX0, FLOOR - 160);
  if (o.mid) o.mid(px);
  if (o.wings !== false) { put(wingImg('n'), OX0 + 18 + px(36), FLOOR - 100); put(wingImg('n'), OX1 - 18 + px(36), FLOOR - 100, 1, 0, 1, -1); }
  return px;
}
function daySet(lt, d, o = {}) {
  const u = lt / d, px = (k) => (0.5 - u) * k;
  blit(bdDay(), 0, 0, OX0 - 20 + px(10), OY0);
  blit(floorImg(), 0, 0, OX0, FLOOR - 160);
  if (o.wings !== false) { put(wingImg('d'), OX0 + 18 + px(36), FLOOR - 100); put(wingImg('d'), OX1 - 18 + px(36), FLOOR - 100, 1, 0, 1, -1); }
  return px;
}
function plainSet(lt, d) { const u = lt / d; blit(bdPlain(), 0, 0, OX0 - 20 + (0.5 - u) * 14, OY0); blit(floorImg(), 0, 0, OX0, FLOOR - 160); }

// ───────────────────────────── props & effects ─────────────────────────────
const fortImg = () => cut('Fort', 940, 470, 470, 440, () => {
  const hb = [-470, -440, 470, 30], wall = () => { ctx.save(); ctx.strokeStyle = 'rgba(43,26,16,0.33)'; ctx.lineWidth = 2; for (let y = -26; y > -230; y -= 26) { ctx.beginPath(); ctx.moveTo(-420, y); ctx.lineTo(420, y); ctx.stroke(); for (let x = -420 + ((y / 26) % 2) * 22; x < 420; x += 44) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 26); ctx.stroke(); } } ctx.restore(); };
  pt(R(-360, -222, 720, 222), C.lat, { h: 0.2, ha: 0.12, hb, lw: 3 }); ctx.save(); R(-360, -222, 720, 222)(); ctx.clip(); wall(); ctx.restore();
  for (let x = -356; x < 340; x += 40) pt(R(x, -246, 24, 26), C.lat, { lw: 2 });
  for (const sx of [-1, 1]) {
    const bx = sx * 340; pt(R(bx - 66, -300, 132, 300), C.lat, { h: 0.4, ha: 0.12, hb }); ctx.save(); R(bx - 66, -300, 132, 300)(); ctx.clip(); wall(); ctx.fillStyle = 'rgba(40,16,8,0.32)'; ctx.fillRect(bx + 10, -300, 60, 300); ctx.restore();
    for (let x = bx - 66; x < bx + 60; x += 34) pt(R(x, -326, 22, 28), C.lat, { lw: 2 });
    for (const y of [-200, -110]) pt(R(bx - 6, y, 12, 34, 5), '#1A1010', { lw: 1.5 });
  }
  pt(R(-86, -340, 172, 340), C.lat2, { h: 0.9, ha: 0.16, hb }); ctx.save(); R(-86, -340, 172, 340)(); ctx.clip(); wall(); ctx.restore();
  for (let x = -86; x < 80; x += 36) pt(R(x, -366, 24, 28), C.lat2, { lw: 2 });
  pt(Fn(() => { ctx.moveTo(-46, 0); ctx.lineTo(-46, -120); ctx.arc(0, -120, 46, PI, 0); ctx.lineTo(46, 0); }), '#140D0C', { lw: 3 });
  pt(Fn(() => { ctx.moveTo(-60, -2); ctx.lineTo(-60, -120); ctx.arc(0, -120, 60, PI, 0); ctx.lineTo(60, -2); ctx.lineTo(46, -2); ctx.lineTo(46, -120); ctx.arc(0, -120, 46, 0, PI, true); ctx.lineTo(-46, -2); }), C.cream, { lw: 2 });
  for (const x of [-200, -130, 130, 200]) pt(R(x - 5, -160, 10, 30, 4), '#1A1010', { lw: 1.5 });
});
const moatImg = () => cut('Moat', 960, 140, 480, 130, () => {
  pt(Fn(() => { ctx.moveTo(-470, 0); ctx.lineTo(-470, -90); for (let x = -470; x <= 470; x += 30) ctx.quadraticCurveTo(x + 15, -112, x + 30, -90); ctx.lineTo(470, 0); }), C.night2, { h: 0, ha: 0.3, hb: [-480, -130, 480, 10], hg: 6 });
  ctx.strokeStyle = '#6A7AAA'; ctx.lineWidth = 3; for (let i = 0; i < 10; i++) { const x = -420 + i * 92, y = -56 + (i % 3) * 16; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20, y - 10, x + 40, y); ctx.stroke(); }
});
const parapetImg = () => cut('Parapet', 960, 260, 480, 240, () => {
  pt(R(-470, -170, 940, 170), C.lat2, { h: 0.2, ha: 0.16, hb: [-480, -240, 480, 10] });
  for (let x = -470; x < 470; x += 64) pt(R(x, -214, 40, 46), C.lat2, { lw: 2.5 });
  ctx.strokeStyle = 'rgba(43,26,16,0.35)'; ctx.lineWidth = 2; for (let y = -140; y < 0; y += 30) { ctx.beginPath(); ctx.moveTo(-470, y); ctx.lineTo(470, y); ctx.stroke(); }
});
const crowdImg = (k) => cut('Crowd' + k, 1000, 300, 500, 280, () => {
  const col = k ? '#2A1210' : '#3E1A14', hb = [-500, -300, 500, 10];
  for (let i = 0; i < 26; i++) {
    const x = -470 + i * 37 + rnd(i + k * 50) * 14, s = 0.85 + rnd(i * 3 + k) * 0.3, h = 150 * s;
    ctx.fillStyle = col; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 12 * s, -40); ctx.lineTo(x - 14 * s, -h + 30 * s); ctx.lineTo(x + 14 * s, -h + 30 * s); ctx.lineTo(x + 12 * s, -40); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, -h + 16 * s, 12 * s, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 10 * s, -h + 40 * s); ctx.lineTo(x + 26 * s + rnd(i) * 10, -h - 60 * s); ctx.lineWidth = 4; ctx.stroke();
    if (i % 6 === 2) { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 16 * s, -h + 30 * s); ctx.lineTo(x - 20 * s, -h - 110 * s); ctx.stroke(); pt(Pg([[x - 20 * s, -h - 110 * s], [x + 40 * s, -h - 92 * s], [x - 19 * s, -h - 70 * s]]), i % 12 === 2 ? C.ochre : '#8C2A20', { lw: 2 }); }
  }
  pt(Fn(() => { ctx.moveTo(-500, 0); ctx.lineTo(-500, -60); for (let x = -500; x <= 500; x += 50) ctx.quadraticCurveTo(x + 25, -80 - rnd(x) * 20, x + 50, -60); ctx.lineTo(500, 0); }), k ? '#3A1A12' : '#4A2418', { h: 0.4, ha: 0.3, hb });
}, { m: 2.5, edge: '#B98E66' });
const burstImg = () => cut('Burst', 260, 260, 130, 130, () => { pt(() => star(0, 0, 110, 42, 12, 0.1), C.flash, { lw: 3 }); pt(() => star(0, 0, 60, 26, 9, 0.4), C.fl, { lw: 2 }); }, { m: 3, shadow: false });
function burst(x, y, tt, s = 1) { if (tt < 0 || tt > 0.5) return; put(burstImg(), x, y, eob(clamp(tt / 0.12)) * s, tt * 0.6, 1 - seg(tt, 0.22, 0.5)); }
const puffImg = () => cached('aPuff', 220, 170, 1, () => { ctx.filter = 'blur(3px)'; for (const [x, y, r, c] of [[80, 100, 52, '#CFC8BC'], [130, 90, 58, '#E8E2D6'], [100, 66, 44, '#F2EEE4'], [150, 110, 40, '#D9D2C6']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } });
const puff = (x, y, s, a) => blit(puffImg(), 110, 85, x, y, s, a);
/** soft limelight iris: everything outside the circle sinks into the dark */
function iris(x, y, r, a = 0.88) {
  const g = ctx.createRadialGradient(x, y, r * 0.82, x, y, r * 1.12); g.addColorStop(0, 'rgba(6,6,16,0)'); g.addColorStop(1, `rgba(6,6,16,${a})`);
  ctx.fillStyle = g; ctx.fillRect(OX0, OY0, OW, FLOOR - OY0 + 2);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g2 = ctx.createRadialGradient(x, y, 0, x, y, r); g2.addColorStop(0, 'rgba(255,236,190,0.13)'); g2.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = g2; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
/** tin slider rod from a flat out to the wing */
function rod(x, y, side) {
  const xe = side < 0 ? OX0 - 40 : OX1 + 40;
  ctx.lineCap = 'round'; ctx.strokeStyle = '#17110D'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(xe, y); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,225,170,0.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(xe, y - 2); ctx.stroke();
}
/** slide-in on a rod: returns [x, wobble rotation] */
function slide(lt, t0, dur, x0, x1) {
  const p = clamp((lt - t0) / dur), x = lerp(x0, x1, eo(p)), a = lt - t0 - dur;
  const wob = a > 0 ? sin(a * 20) * Math.exp(-a * 6) * 0.045 : p > 0 ? -Math.sign(x1 - x0) * 0.04 * sin(p * PI) : 0;
  return [x, wob];
}
function str(x, y0, y1) { ctx.strokeStyle = 'rgba(225,215,190,0.75)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }

// playbill cards
const billImg = (label) => {
  ctx.save(); ctx.font = '700 44px Caladea'; ctx.letterSpacing = '4px'; const tw = ctx.measureText(label).width; ctx.restore();
  const w = Math.ceil(tw + 80), h = 92;
  const c = cut('Bill' + label, w + 30, h + 30, (w + 30) / 2, 12, () => {
    ctx.translate(-w / 2, 0);
    pt(R(0, 0, w, h, 3), '#F1E6C8', { tx: 2, ty: -1, h: 0.3, ha: 0.06, hb: [0, 0, w, h], lw: 3.5, ink: C.bill });
    ctx.strokeStyle = C.bill; ctx.lineWidth = 1.6; ctx.strokeRect(9, 9, w - 18, h - 18);
    ctx.fillStyle = C.bill; ctx.font = '700 44px Caladea'; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, w / 2 + 2, h / 2 + 3);
    for (const x of [16, w - 16]) { ctx.beginPath(); ctx.arc(x, 16, 3.5, 0, TAU); ctx.fillStyle = '#3A2A1C'; ctx.fill(); }
  }, { m: 2, sx: 7, sy: 6 });
  c._w = w; return c;
};
/** a playbill card dropping on two strings from the flies to y (card top) */
function bill(label, x, y, tt, s = 1) {
  if (tt < 0) return;
  const c = billImg(label), yy = lerp(OY0 - 140, y, eob(clamp(tt / 0.5))), rot = sin(tt * 6) * 0.06 * Math.exp(-tt * 2.2), hw = (c._w / 2 - 16) * s;
  ctx.save(); ctx.translate(x, yy); ctx.rotate(rot);
  for (const sx of [-1, 1]) { ctx.strokeStyle = 'rgba(230,220,195,0.85)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx * hw, 16 * s); ctx.lineTo(sx * hw * 0.98, OY0 - yy - 30); ctx.stroke(); }
  put(c, 0, 0, s); ctx.restore();
}

// ───────────────────────────── figures (faceless card flats) ─────────────────────────────
function oldHat() { pt(E(0, -2, 38, 10), '#2A2638', { lw: 2.5 }); pt(R(-33, -34, 66, 32, 12), '#2A2638', { h: 0.6, ha: 0.25, hb: [-60, -60, 60, 10] }); pt(R(-34, -16, 68, 8), C.trou, { lw: 1.5 }); }
function newHat() {
  pt(E(0, 0, 46, 10), '#1E1A1E', { lw: 2.5 });
  pt(Fn(() => { ctx.moveTo(-32, -2); ctx.lineTo(-30, -68); ctx.quadraticCurveTo(0, -84, 30, -68); ctx.lineTo(32, -2); }), '#2A2530', { h: 0.7, ha: 0.28, hb: [-60, -100, 60, 10], hg: 5 });
  pt(R(-32, -18, 64, 9), C.ochre, { lw: 1.5 });
  pt(E(0, -42, 13, 13), '#B58A5A', { lw: 2 }); pt(E(0, -42, 6, 6), '#6A3F22', { lw: 1.5 });
}
const hatImg = (k) => cut('Hat' + k, 140, 130, 70, 110, k === 'N' ? newHat : oldHat, { m: 3, q: k === 'N' ? 4 : 1.5 });
/** o: coat, skin, trou, hat 'old'|'new'|'none'|'shako'|'bicorne', arm 'down'|'none'|'up'|'point', musket, epa */
function soldier(o) {
  const coat = o.coat || C.cred, skin = o.skin || C.skin, trou = o.trou || C.trou, hb = [-220, -700, 220, 20], arm = o.arm || 'down';
  pt(Pg([[-48, -326], [-62, -320], [-72, -190], [-56, -184]]), coat, { h: 1.1, ha: 0.2, hb }); pt(E(-64, -176, 11, 13), skin);
  pt(Pg([[-36, -186], [-4, -186], [-8, -12], [-30, -12]]), trou, { h: 1.3, ha: 0.13, hb }); pt(Pg([[4, -186], [36, -186], [30, -12], [8, -12]]), trou, { h: 1.3, ha: 0.13, hb });
  pt(R(-42, -15, 36, 15, 6), '#231A16'); pt(R(6, -15, 36, 15, 6), '#231A16');
  if (arm === 'down') bar(70, -110, 80, -520, 9, '#5A3A22');
  pt(Pg([[-50, -332], [50, -332], [56, -176], [30, -150], [0, -178], [-30, -150], [-56, -176]]), coat, { h: 0.9, ha: 0.2, hb });
  pt(R(-53, -198, 106, 13), C.white, { lw: 2 });
  if (o.cross !== false) { pt(Pg([[-46, -326], [-32, -330], [46, -204], [32, -200]]), C.white, { lw: 2 }); pt(Pg([[46, -326], [32, -330], [-46, -204], [-32, -200]]), C.white, { lw: 2 }); pt(E(0, -266, 9, 9), C.fringe, { lw: 2 }); }
  if (o.epa) for (const sx of [-1, 1]) pt(E(sx * 46, -330, 20, 9), C.fringe, { lw: 2 });
  pt(R(-26, -344, 52, 14, 4), o.collar || C.ochre, { lw: 2 });
  if (arm === 'down') { bar(80, -520, 82, -566, 4, '#C9C9C9'); pt(Pg([[48, -326], [62, -320], [76, -258], [60, -250]]), coat, { h: 1, ha: 0.2, hb }); pt(E(70, -250, 11, 12), skin); }
  else if (arm === 'none') { pt(Pg([[48, -326], [62, -320], [72, -190], [56, -184]]), coat, { h: 1.1, ha: 0.2, hb }); pt(E(64, -176, 11, 13), skin); }
  else if (arm === 'up') { bar(86, -380, 104, -640, 9, '#5A3A22'); bar(104, -640, 107, -690, 4, '#C9C9C9'); pt(Pg([[38, -332], [56, -326], [102, -456], [84, -464]]), coat, { h: 1, ha: 0.2, hb }); pt(E(93, -466, 12, 13), skin); }
  else if (arm === 'point') { pt(Pg([[44, -330], [48, -306], [150, -308], [148, -330]]), coat, { h: 0, ha: 0.2, hb }); pt(E(160, -319, 13, 10), skin); }
  pt(R(-11, -360, 22, 22), skin); pt(E(0, -390, 30, 36), skin, { h: 0.6, ha: 0.12, hb });
  const hat = o.hat || 'old';
  ctx.save(); ctx.translate(0, -414);
  if (hat === 'old') oldHat(); else if (hat === 'new') newHat();
  else if (hat === 'none') { ctx.restore(); ctx.save(); pt(Fn(() => ctx.ellipse(0, -398, 31, 30, 0, PI * 1.02, PI * 1.98)), C.hair, { lw: 2 }); }
  else if (hat === 'shako') { pt(Pg([[-26, 2], [-30, -56], [30, -56], [26, 2]]), '#1E1E24', { h: 0.5, ha: 0.25, hb: [-60, -80, 60, 10] }); pt(Pg([[-28, 0], [28, 0], [42, 10], [-12, 10]]), '#111', { lw: 2 }); pt(E(0, -28, 8, 10), C.fringe, { lw: 1.5 }); pt(E(0, -60, 7, 6), C.trou, { lw: 1.5 }); }
  else if (hat === 'bicorne') { pt(Fn(() => { ctx.moveTo(-72, 4); ctx.quadraticCurveTo(0, -70, 72, 4); ctx.quadraticCurveTo(0, -14, -72, 4); }), '#18161A', { h: 0.4, ha: 0.25, hb: [-80, -80, 80, 10] }); pt(R(-3, -40, 6, 30), C.fringe, { lw: 1 }); }
  ctx.restore();
}
const SOL = {
  sep: { hat: 'old' }, sepUp: { hat: 'old', arm: 'up' }, sepNew: { hat: 'new' }, sepBare: { hat: 'none' }, sepPlain: { hat: 'none', arm: 'none' },
  brit: { hat: 'shako', coat: C.brit, skin: C.pale, collar: C.cred }, off: { hat: 'bicorne', coat: C.brit, skin: C.pale, arm: 'point', cross: false, epa: true, collar: C.cred },
};
const fig = (k) => cut('Sol' + k, 360, 760, 150, 720, () => soldier(SOL[k]), { q: 1.25 });

// the big head in profile (faceless), its forehead mark, and a separate beard flat
function headPath() {
  ctx.beginPath(); ctx.moveTo(-120, 0); ctx.bezierCurveTo(-120, -120, -150, -180, -200, -260); ctx.bezierCurveTo(-270, -380, -250, -600, -80, -680);
  ctx.bezierCurveTo(60, -740, 190, -660, 200, -540); ctx.bezierCurveTo(205, -490, 200, -460, 205, -440); ctx.lineTo(238, -378); ctx.lineTo(206, -350);
  ctx.bezierCurveTo(216, -330, 213, -312, 205, -300); ctx.bezierCurveTo(213, -280, 205, -250, 180, -232); ctx.bezierCurveTo(130, -215, 80, -200, 62, -160);
  ctx.bezierCurveTo(50, -110, 50, -60, 60, 0); ctx.closePath();
}
const headImg = () => cut('Head', 620, 820, 300, 780, () => {
  const hb = [-300, -760, 300, 20];
  pt(Fn(() => { ctx.moveTo(-280, 0); ctx.bezierCurveTo(-270, -80, -200, -120, -110, -124); ctx.lineTo(80, -124); ctx.bezierCurveTo(170, -120, 240, -80, 250, 0); }), C.cred, { h: 0.9, ha: 0.2, hb }); pt(Pg([[-60, -124], [40, -124], [60, -60], [0, -20], [-80, -60]]), C.ochre, { lw: 2.5 });
  pt(headPath, C.skin, { h: 0.5, ha: 0.14, hb, lw: 4 });
  pt(Fn(() => { ctx.moveTo(-205, -262); ctx.bezierCurveTo(-270, -380, -250, -600, -80, -680); ctx.bezierCurveTo(60, -740, 180, -670, 196, -570); ctx.bezierCurveTo(120, -615, 0, -610, -70, -560); ctx.bezierCurveTo(-130, -500, -150, -380, -130, -300); }), C.hair, { h: 0.3, ha: 0.25, hb, lw: 4 });
  pt(E(-24, -420, 24, 38), '#6A4229', { lw: 3 });
  pt(R(156, -566, 18, 104, 8), '#D24A2A', { lw: 2.5 });
}, { q: 1 });
const beardImg = () => cut('Beard', 620, 820, 300, 780, () => {
  pt(Fn(() => { ctx.moveTo(-34, -384); ctx.bezierCurveTo(10, -330, 80, -318, 150, -330); ctx.lineTo(208, -354); ctx.bezierCurveTo(226, -320, 220, -250, 192, -196); ctx.bezierCurveTo(160, -136, 100, -108, 48, -128); ctx.bezierCurveTo(8, -148, -34, -220, -52, -300); }), C.hair, { h: 1.2, ha: 0.3, hb: [-300, -760, 300, 20], lw: 3.5 });
  ctx.strokeStyle = 'rgba(120,100,80,0.5)'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { const x = 10 + i * 20; ctx.beginPath(); ctx.moveTo(x, -320 + i * 4); ctx.quadraticCurveTo(x + 10, -240, x - 6, -160 + Math.abs(i - 4) * 6); ctx.stroke(); }
}, { q: 1 });
const scrollImg = () => cut('Scroll', 460, 560, 230, 20, () => {
  const hb = [-230, 0, 230, 540];
  pt(R(-176, 14, 352, 450, 2), '#EDE0BE', { h: 0.3, ha: 0.08, hb });
  ctx.strokeStyle = 'rgba(43,20,8,0.62)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let r = 0; r < 11; r++) { const y = 60 + r * 30, x1 = r === 0 ? 60 : 140 - (r === 10 ? 120 : 0); ctx.beginPath(); ctx.moveTo(-140 + (r === 0 ? 80 : 0), y); for (let x = -140 + (r === 0 ? 80 : 0); x < x1; x += 10) ctx.quadraticCurveTo(x + 5, y - 6 + rnd(r * 40 + x) * 12, x + 10, y); ctx.stroke(); }
  pt(E(110, 410, 32, 32), C.cred, { h: 0.5, ha: 0.2, hb }); pt(() => star(110, 410, 18, 9, 6), '#8C1C20', { lw: 1.5 });
  for (const y of [0, 456]) { pt(R(-196, y, 392, 20, 9), '#6A4428', { h: 1.57, ha: 0.3, hb, hg: 5 }); pt(E(-204, y + 10, 12, 14), C.ochre, { lw: 2 }); pt(E(204, y + 10, 12, 14), C.ochre, { lw: 2 }); }
});
const cowImg = () => cut('Cow', 380, 300, 180, 270, () => {
  const c = '#8A6A50', hb = [-200, -300, 200, 20];
  for (const x of [-80, -50, 60, 88]) pt(R(x - 10, -110, 20, 106, 4), c, { h: 1.3, ha: 0.2, hb });
  pt(E(0, -140, 118, 58), c, { h: 0.8, ha: 0.2, hb }); pt(E(40, -192, 30, 16), c, { lw: 2.5 });
  pt(Pg([[100, -170], [150, -200], [176, -150], [150, -118], [110, -130]]), c, { h: 0.8, ha: 0.2, hb });
  pt(Fn(() => { ctx.moveTo(144, -196); ctx.quadraticCurveTo(150, -230, 168, -232); ctx.quadraticCurveTo(160, -214, 154, -194); }), '#E6D8B8', { lw: 2 });
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-116, -150); ctx.quadraticCurveTo(-140, -110, -130, -60); ctx.stroke();
}, { m: 4 });
const pigImg = () => cut('Pig', 320, 220, 150, 200, () => {
  const c = '#B88A7A', hb = [-160, -220, 160, 20];
  for (const x of [-60, -34, 40, 64]) pt(R(x - 9, -60, 18, 58, 4), c, { h: 1.3, ha: 0.2, hb });
  pt(E(0, -92, 98, 52), c, { h: 0.7, ha: 0.2, hb }); pt(R(88, -104, 30, 30, 8), c, { lw: 2.5 }); pt(Pg([[60, -130], [82, -160], [86, -122]]), c, { lw: 2.5 });
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-96, -100); ctx.bezierCurveTo(-120, -120, -126, -90, -110, -88); ctx.stroke();
}, { m: 4 });

// ───────────────────────────── the shots ─────────────────────────────
export function buildA(add, cue) {
  const shot = (id, at, note, cam, zoom, draw) => add({ id, at, note, cam, zoom, draw: (lt, d, t) => { draw(lt, d, t); vig(); } });
  const S2 = Wd('of', 0) - 0.03, S3 = Wd('rose', 0) - 0.2, S4 = Wd('inside', 0) - 0.03, S5 = L(1) - 0.12, S6 = Wd('night', 1) - 0.15,
    S7 = L(2) - 0.1, S8 = Wd('in', 2) - 0.08, S9 = Wd('banned', 2) - 0.08, S10 = Wd('and', 2) - 0.06, S11 = L(3) - 0.1,
    S12 = Wd('rumour', 3) - 0.06, S13 = Wd('soldiers', 3) - 0.08, S14 = L(4) - 0.08, S15 = Wd('accounts', 4) - 0.06, S16 = Wd('and', 4) - 0.1;

  // 1857 scene: dusk backdrop, two crowd ground rows bobbing, smoke puffs, gun flashes
  const scene1857 = (u, t) => {
    blit(bdDusk(), 0, 0, OX0 - 20 + (0.5 - u) * 10, OY0);
    for (let i = 0; i < 5; i++) { const ph = (t * 0.12 + i / 5) % 1; puff(200 + i * 170 + ph * 60, 760 - ph * 260, 0.8 + ph * 0.8, 0.45 * sin(ph * PI)); }
    blit(floorImg(), 0, 0, OX0, FLOOR - 160);
    put(crowdImg(0), 540 + (0.5 - u) * 24, 1010 + sin(t * 5) * 5, 0.92);
    put(crowdImg(1), 520 + (0.5 - u) * 44, 1130 + sin(t * 5 + 1.6) * 6, 1.12);
    put(wingImg('s'), OX0 + 18, FLOOR - 100); put(wingImg('s'), OX1 - 18, FLOOR - 100, 1, 0, 1, -1);
  };

  // a1 · the curtain rises on a dusk stage: the great revolt of 1857, a crowd of card sepoys with flags, puffs, flashes
  {
    const B = [[2.1, 380, 760], [2.35, 700, 720], [2.65, 520, 800], [2.9, 820, 790]];
    shot('a1', 0, 'curtain rises on a dusk paper stage: 1857 crowd ground rows with flags, cotton smoke, gun-flash starbursts', [540, 780], 0.06, (lt, d, t) => {
      stage(lt, t, { lvl: 0.6 + 0.4 * eo(seg(lt, 0, 0.8)), curt: eio(seg(lt, 0.15, 1.45)) }, () => {
        scene1857(lt / d, t);
        for (const [t0, x, y] of B) burst(x, y, lt - t0, 0.6);
      });
    });
    cue(0.05, 'swell', { gain: 0.5, dur: 2.5 }); cue(0.18, 'whoosh', { gain: 0.6, dur: 1.2 }); cue(2.1, 'drum', { gain: 0.5 });
    B.forEach(([t0], i) => cue(t0, 'pop', { gain: 0.35, pan: [-0.4, 0.4, 0, 0.5][i] }));
  }

  // a2 · paper-book fold: the 1857 stage folds flat onto the table, the 1806 night stage pops up; sepoys slide in on rods
  {
    const xs = [300, 470, 640];
    shot('a2', S2, 'book fold back 51 years: night stage pops up, three sepoy flats slide in from the left wing on rods, ILLUSTRATION card', [540, 820], 0.05, (lt, d, t) => {
      if (lt < 0.55) { const f = 1 - eio(seg(lt, 0.05, 0.55)); stage(lt, t, { fold: f, lvl: 1 }, () => scene1857(1 + lt / (S2 - 0), t)); return; }
      const f = eob(seg(lt, 0.55, 1.05));
      stage(lt, t, { fold: f, lvl: 0.75, night: 0.08 }, () => {
        nightSet(lt, d, t, { moonP: 0.3 + 0.05 * lt / d });
        xs.forEach((x1, i) => { const t0 = 1.45 + i * 0.16; if (lt < t0) return; const [x, wob] = slide(lt, t0, 0.5, OX0 - 150, x1); rod(x - 40, 1190, -1); put(fig('sep'), x, 1196, 0.95, wob); });
        bill('ILLUSTRATION', 790, 380, lt - 1.05, 0.62);
      });
    });
    cue(S2 + 0.05, 'whoosh', { gain: 0.55 }); cue(S2 + 0.55, 'thud', { gain: 0.5 }); cue(S2 + 0.62, 'pop', { gain: 0.4 }); cue(S2 + 1.05, 'plop', { gain: 0.3 });
    xs.forEach((_, i) => cue(S2 + 1.45 + i * 0.16, 'slide', { gain: 0.35, pan: -0.5 }));
  }

  // a3 · rose against the British: sepoys pop up behind a laterite parapet, muskets raised; British flats on the right; flashes
  {
    const xs = [250, 410, 570];
    shot('a3', S3, 'sepoy flats spring up behind the parapet with raised muskets, two British shako flats right, gun flashes and smoke', [520, 760], 0.08, (lt, d, t) => {
      stage(lt, t, { lvl: 0.7, night: 0.1 }, () => {
        nightSet(lt, d, t, { moonP: 0.36, wings: false });
        for (const [x, k] of [[800, 0], [915, 1]]) put(fig('brit'), x + k * 0, 1130, 0.92, lt > 1.15 ? -sin(clamp((lt - 1.15) * 5) * PI) * 0.06 : 0, 1, -1);
        xs.forEach((x, i) => { const p = eob(seg(lt, 0.05 + i * 0.09, 0.42 + i * 0.09)); put(fig('sepUp'), x, 1130 + (1 - p) * 520, 1, sin(t * 6 + i) * 0.015); });
        for (let i = 0; i < 3; i++) { const tt = lt - 0.95 - i * 0.08; if (tt > 0) puff(xs[i] + 110 + tt * 60, 470 - tt * 80, 0.6 + tt, clamp(0.7 - tt * 0.5)); }
        put(parapetImg(), 540, FLOOR - 10, 1);
        xs.forEach((x, i) => burst(x + 106, 1130 - 690, lt - 0.95 - i * 0.08, 0.5));
        burst(760, 760, lt - 1.15, 0.45);
      });
    });
    cue(S3 + 0.06, 'boing', { gain: 0.35 }); cue(S3 + 0.15, 'thud', { gain: 0.45 }); cue(S3 + 0.95, 'pop', { gain: 0.45, pan: -0.3 }); cue(S3 + 1.12, 'pop', { gain: 0.4, pan: 0.4 }); cue(S3 + 0.95, 'drum', { gain: 0.4 });
  }

  // a4 · inside a Tamil fort: the laterite fort flat rises through the stage trap behind a moat ground row, moon on its wire
  {
    shot('a4', S4, 'laterite fort flat rises from the trap behind a rippling moat ground row, moon travels on its wire, pinhole stars', [540, 760], 0.07, (lt, d, t) => {
      stage(lt, t, { lvl: 0.7, night: 0.12 }, () => {
        nightSet(lt, d, t, {
          moonP: 0.45 + 0.2 * lt / d, mid: (px) => {
            const p = eob(seg(lt, 0.08, 0.85)); put(fortImg(), 540 + px(20), 1120 + (1 - p) * 470, 0.95);
            put(moatImg(), 540 + px(30) + sin(t * 1.6) * 12, FLOOR - 14, 1); put(moatImg(), 560 + px(40) - sin(t * 1.6) * 14, FLOOR + 22, 1);
          },
        });
      });
    });
    cue(S4 + 0.08, 'rumble', { gain: 0.45, dur: 0.9 }); cue(S4 + 0.8, 'thud', { gain: 0.5 }); cue(S4 + 1.3, 'bubbles', { gain: 0.15 });
  }

  // a5 · "the fort was Vellore": a painted map backdrop unrolls from its roller, a tiny card fort pops up, the iris closes on it
  {
    const vx = OX0 + 330, vy = OY0 + 470;
    shot('a5', S5, 'painted map backdrop rolls down, a tiny card fort pops up at Vellore, limelight iris closes on it', [vx, vy + 100], 0.1, (lt, d, t) => {
      stage(lt, t, { lvl: 0.75 }, () => {
        nightSet(lt, d, t, { moonP: 0.66, wings: false });
        const ry = OY0 + BDH * eo(seg(lt, 0, 0.65));
        ctx.save(); ctx.beginPath(); ctx.rect(OX0, OY0, OW, ry - OY0); ctx.clip(); blit(bdMap(), 0, 0, OX0, OY0); ctx.restore();
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(OX0, ry - 4, OW, 22);
        ctx.fillStyle = lg(0, ry - 16, 0, ry + 16, [[0, '#F0E2BC'], [0.5, '#C9B286'], [1, '#7A6440']]); ctx.fillRect(OX0 - 10, ry - 16, OW + 20, 32); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.strokeRect(OX0 - 10, ry - 16, OW + 20, 32);
        const p = eob(seg(lt, 0.62, 0.95)); if (p > 0) put(fortImg(), vx, vy + 10, 0.2, 0, 1, 1, p);
        if (lt > 0.75) iris(vx, vy - 20, lerp(900, 170, eio(seg(lt, 0.75, 1.3))), 0.82);
      });
    });
    cue(S5, 'zip', { gain: 0.45, dur: 0.6 }); cue(S5 + 0.66, 'pop', { gain: 0.45 }); cue(S5 + 0.8, 'sparkle', { gain: 0.35 });
  }

  // a6 · the night of 10 July 1806: footlights dim, the moon crosses on its wire, the fort far off, the date card drops
  {
    const tc = Wd('tenth', 1) - 0.1 - S6;
    shot('a6', S6, 'night stage: footlights dim, moon on its wire over the distant fort, playbill card 10 JULY 1806 drops on strings', [540, 700], 0.08, (lt, d, t) => {
      const dim = eio(seg(lt, 0.1, 0.9));
      stage(lt, t, { lvl: lerp(0.8, 0.35, dim), night: lerp(0.05, 0.3, dim) }, () => {
        nightSet(lt, d, t, {
          moonP: 0.2 + 0.6 * eio(lt / d), mid: (px) => { put(fortImg(), 540 + px(16), 1090, 0.7); put(moatImg(), 540 + px(28) + sin(t * 1.5) * 10, FLOOR - 26, 0.85); },
        });
        for (let i = 0; i < 6; i++) { const ph = (t * 0.06 + i / 6) % 1; puff(OX0 + ph * OW, 640 + sin(i * 2) * 60, 1.4, 0.14 * sin(ph * PI)); }
        bill('10 JULY 1806', 540, 400, lt - tc, 1.15);
      });
    });
    cue(S6 + 0.1, 'swell', { gain: 0.3, dur: 1.5 }); cue(S6 + tc + 0.35, 'plop', { gain: 0.45 }); cue(Wd('eighteen', 1), 'bell', { gain: 0.3 });
  }

  // a7 · it began with a uniform: one big sepoy flat glides in on its rod, the limelight iris opens on the red coat
  {
    shot('a7', S7, 'one big sepoy flat glides in on its rod, limelight iris opens on the red coat and white cross-belts', [540, 760], 0.07, (lt, d, t) => {
      stage(lt, t, { lvl: 0.6 }, () => {
        plainSet(lt, d);
        const [x, wob] = slide(lt, 0.0, 0.6, OX0 - 260, 540);
        rod(x - 60, 1188, -1); put(fig('sep'), x, 1196, 1.72, wob);
        iris(x + 10, 790, lerp(150, 520, eo(seg(lt, 0.45, 1.3))), 0.9);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sp = seg(lt, 1.1, 1.7); if (sp > 0 && sp < 1) { ctx.fillStyle = `rgba(255,240,200,${0.35 * sin(sp * PI)})`; ctx.save(); ctx.translate(x, 1196); ctx.rotate(0.6); ctx.fillRect(-420 + sp * 840, -1200, 40, 2400); ctx.restore(); } ctx.restore();
      });
    });
    cue(S7, 'slide', { gain: 0.45, pan: -0.4 }); cue(S7 + 0.45, 'swell', { gain: 0.3, dur: 1 }); cue(S7 + 1.1, 'sparkle', { gain: 0.3 });
  }

  // a8 · 1805 orders: day parade stage, the order scroll drops from the flies, a row of sepoys slides in from the right wing
  {
    const tScroll = Wd('orders', 2) - 0.35 - S8, tRow = Wd('company', 2) - 0.25 - S8;
    shot('a8', S8, 'day parade stage before the laterite wall: 1805 ORDERS card, order scroll (unreadable squiggles + seal) drops, sepoy row slides in', [540, 800], 0.06, (lt, d, t) => {
      stage(lt, t, { lvl: 0.55 }, () => {
        daySet(lt, d);
        const p = eob(clamp((lt - tScroll) / 0.5)); if (lt > tScroll) { const y = lerp(OY0 - 600, 360, p); str(560, OY0, y); str(860, OY0, y); put(scrollImg(), 710, y, 0.82, sin((lt - tScroll) * 5) * 0.03 * Math.exp(-(lt - tScroll) * 2)); }
        for (let i = 0; i < 5; i++) { const t0 = tRow + i * 0.09; if (lt < t0) continue; const [x, wob] = slide(lt, t0, 0.55, OX1 + 160, 210 + i * 150); rod(x + 40, 1188, 1); put(fig('sep'), x, 1196, 0.8, wob); }
        bill('1805 ORDERS', 330, 390, lt - 0.12, 0.95);
      });
    });
    cue(S8 + 0.4, 'plop', { gain: 0.4 }); cue(S8 + tScroll, 'whoosh', { gain: 0.45 }); cue(S8 + tScroll + 0.45, 'tock', { gain: 0.4 });
    for (let i = 0; i < 5; i += 2) cue(S8 + tRow + i * 0.09, 'slide', { gain: 0.3, pan: 0.5 });
  }

  // a9 · no marks on the forehead: a huge head-in-profile flat slides in; its forehead mark is struck through in ink
  {
    const tX = Wd('forehead', 2) - 0.2 - S9;
    shot('a9', S9, 'big faceless head-in-profile flat slides in under the limelight; the forehead mark is crossed out with two ink strokes', [560, 640], 0.09, (lt, d, t) => {
      stage(lt, t, { lvl: 0.5 }, () => {
        plainSet(lt, d);
        const [x, wob] = slide(lt, 0, 0.45, OX0 - 420, 500), y = 1190;
        rod(x - 120, 1150, -1); put(headImg(), x, y, 1, wob);
        iris(x + 120, 690, 430, 0.85);
        const g = sin(clamp((lt - 0.35) / 0.5) * PI); if (g > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; blit(glowImg(), 120, 120, x + 165, y - 514, 1.1, 0.5 * g); ctx.restore(); }
        ctx.save(); ctx.translate(x, y); ctx.rotate(wob); ctx.lineCap = 'round';
        for (const [k, a, b] of [[0, [128, -600], [204, -430]], [1, [204, -600], [128, -430]]]) {
          const p = eo(seg(lt, tX + k * 0.22, tX + k * 0.22 + 0.22)); if (p <= 0) continue;
          const ex = lerp(a[0], b[0], p), ey = lerp(a[1], b[1], p);
          ctx.strokeStyle = C.paper; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.strokeStyle = '#120A06'; ctx.lineWidth = 15; ctx.stroke();
        }
        ctx.restore();
      });
    });
    cue(S9, 'slide', { gain: 0.45, pan: -0.4 }); cue(S9 + tX, 'zip', { gain: 0.4 }); cue(S9 + tX + 0.22, 'zip', { gain: 0.4 });
  }

  // a10 · shave the beards: the same head with a beard flat on a rod; on "shave" the rod pulls the beard away, paper snips fall
  {
    const tS = Wd('shave', 2) - 0.08 - S10, SN = Array.from({ length: 12 }, (_, i) => [40 + rnd(i * 3) * 170, -300 + rnd(i * 5) * 160, rnd(i + 9)]);
    shot('a10', S10, 'same head with a beard flat on a rod; on "shave" the rod yanks the beard off to the wing, paper snips fall', [600, 820], 0.07, (lt, d, t) => {
      stage(lt, t, { lvl: 0.5 }, () => {
        plainSet(lt, d);
        const x = 470, y = 1196, s = 1.02;
        put(headImg(), x, y, s);
        ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.strokeStyle = '#120A06'; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(128, -600); ctx.lineTo(204, -430); ctx.moveTo(204, -600); ctx.lineTo(128, -430); ctx.stroke(); ctx.restore();
        const p = eio(seg(lt, tS, tS + 0.65)), bx = x + p * 720, by = y + p * p * 160, br = p * 0.35 + (lt < tS ? sin(t * 3) * 0.01 : 0);
        rod(bx + 200 * s, by - 250 * s, 1); put(beardImg(), bx, by, s, br);
        if (lt > tS) for (const [sx, sy, r] of SN) { const tt = lt - tS - r * 0.2; if (tt < 0) continue; ctx.save(); ctx.translate(x + sx * s + tt * 60 * (r - 0.3), y + sy * s + tt * tt * 900); ctx.rotate(tt * 8 * (r - 0.5)); ctx.fillStyle = C.hair; ctx.beginPath(); ctx.moveTo(-7, -4); ctx.lineTo(8, -2); ctx.lineTo(0, 7); ctx.closePath(); ctx.fill(); ctx.restore(); }
        iris(620, 760, 520, 0.8);
      });
    });
    cue(S10 + tS - 0.05, 'zip', { gain: 0.5 }); cue(S10 + tS + 0.1, 'whoosh', { gain: 0.45, pan: 0.5 }); cue(S10 + tS + 0.6, 'tock', { gain: 0.3 });
  }

  // a11 · a new round hat: the tall round hat with its badge descends on a string from the flies onto a bare-headed sepoy
  {
    const tH = Wd('hat', 3) - S11;
    shot('a11', S11, 'bare-headed sepoy flat under a spot; the new tall round hat with round badge descends on a string and lands on his head', [540, 700], 0.07, (lt, d, t) => {
      stage(lt, t, { lvl: 0.6 }, () => {
        plainSet(lt, d);
        const s = 1.55, x = 540, y = 1196, hy = y - 414 * s, p = clamp((lt - 0.45) / (tH - 0.45));
        put(fig('sepBare'), x, y, s);
        const yy = lt < tH ? lerp(OY0 - 200, hy, eio(p)) : hy, sq = lt > tH ? 1 - 0.12 * sin(clamp((lt - tH) / 0.25) * PI) : 1, sw = lt < tH ? sin(lt * 4) * 0.05 * (1 - p) : 0;
        str(x, OY0, yy - 80 * s); put(hatImg('N'), x, yy, s, sw, 1, 1 / sq, sq);
        if (lt > tH) for (let i = 0; i < 4; i++) { const tt = lt - tH; puff(x + (i - 1.5) * 70 * (1 + tt), hy + 10 - tt * 40, 0.3 + tt * 0.4, clamp(0.5 - tt)); }
        iris(x, 760, 460, 0.86);
      });
    });
    cue(S11 + 0.45, 'whoosh', { gain: 0.35, dur: 1 }); cue(S11 + tH, 'plop', { gain: 0.55 }); cue(S11 + tH + 0.02, 'boing', { gain: 0.25 });
  }

  // a12 · rumour: a giant hat, RUMOUR card, cotton-wool whispers drift in, the iris closes on the badge; two animal flats slide in
  {
    const tB = Wd('badge', 3) - 0.1 - S12, tL = Wd('leather', 3) - S12, tA = Wd('from', 3) - 0.3 - S12;
    shot('a12', S12, 'giant new hat on a dark drop, RUMOUR card, cotton whisper puffs drift in, iris closes on the badge; cow and pig flats slide in', [540, 760], 0.06, (lt, d, t) => {
      stage(lt, t, { lvl: 0.55 }, () => {
        plainSet(lt, d);
        const s = 5, hx = 520, hy = 960, bxy = [hx, hy - 42 * s];
        put(hatImg('N'), hx, hy, s, sin(t * 1.2) * 0.012);
        for (let i = 0; i < 6; i++) { const side = i % 2 ? 1 : -1, ph = clamp((lt - i * 0.12) / 2.2); puff(540 + side * lerp(520, 200, eo(ph)), 560 + i * 60 + sin(t * 2 + i) * 14, 0.7 + ph * 0.4, 0.5 * sin(ph * PI)); }
        if (lt > tL) { const g = 0.5 + 0.5 * sin((lt - tL) * 10); ctx.strokeStyle = `rgba(255,214,140,${0.5 * g})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(bxy[0], bxy[1], 13 * s + 10 + g * 6, 0, TAU); ctx.stroke(); }
        iris(bxy[0], bxy[1] + 40, lerp(620, 280, eio(seg(lt, tB, tB + 0.5))), 0.8);
        if (lt > tA) {
          const [cx, cw] = slide(lt, tA, 0.5, OX0 - 260, 280), [qx, qw] = slide(lt, tA + 0.12, 0.5, OX1 + 220, 800);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; blit(glowImg(), 120, 120, cx, 1150, 2.4, 0.3); blit(glowImg(), 120, 120, qx, 1160, 2.1, 0.3); ctx.restore();
          rod(cx - 60, 1180, -1); put(cowImg(), cx, 1192, 0.95, cw); rod(qx + 50, 1180, 1); put(pigImg(), qx, 1192, 0.95, qw, 1, -1);
        }
        bill('RUMOUR', 790, 380, lt - 0.08, 1.05);
      });
    });
    cue(S12 + 0.4, 'plop', { gain: 0.4 }); cue(S12 + 0.1, 'inhale', { gain: 0.3 }); cue(S12 + tB, 'swell', { gain: 0.3, dur: 0.8 }); cue(S12 + tL, 'sparkle', { gain: 0.3 });
    cue(S12 + tA, 'slide', { gain: 0.35, pan: -0.5 }); cue(S12 + tA + 0.12, 'slide', { gain: 0.35, pan: 0.5 });
  }

  // a13 · they would never touch it: new hats hover on strings over three sepoys; on "never" the cards turn their blank backs
  {
    const tN = Wd('never', 3) - 0.1 - S13, xs = [270, 480, 690];
    shot('a13', S13, 'three sepoy flats, new hats lowered on strings over them; on "never" the cards turn to show blank paper backs, hats hauled up', [540, 820], 0.07, (lt, d, t) => {
      stage(lt, t, { lvl: 0.55 }, () => {
        daySet(lt, d);
        xs.forEach((x, i) => {
          const s = 1.02, y = 1196, tt = lt - tN - i * 0.07, ang = clamp(tt / 0.32) * PI, sx = cos(ang);
          const c = sx >= 0 ? fig('sep') : backOf(fig('sep'), 'SolBack');
          put(c, x, y, s, 0, 1, Math.max(0.04, Math.abs(sx)) * (sx >= 0 ? 1 : -1));
          const down = eo(seg(lt, 0.05 + i * 0.1, 0.6 + i * 0.1)), up = eio(seg(lt, 1.45 + i * 0.08, 2.1 + i * 0.08)), hy = lerp(OY0 - 120, y - 520 * s, down) - up * 520;
          str(x, OY0, hy - 80); put(hatImg('N'), x, hy, 1.3, sin(t * 3 + i) * 0.05);
        });
      });
    });
    cue(S13 + 0.05, 'whoosh', { gain: 0.3 }); cue(S13 + tN, 'whoosh', { gain: 0.45 }); cue(S13 + tN + 0.3, 'tock', { gain: 0.45 }); cue(S13 + 1.45, 'zip', { gain: 0.3 });
  }

  // a14 · men who refused were punished: rejected hats on the floor, a British officer flat slides in pointing; the light turns cold
  {
    const tP = Wd('punished', 4) - 0.05 - S14, xs = [230, 390, 550];
    shot('a14', S14, 'sepoys stand with rejected new hats on the floor; British officer flat (bicorne, epaulettes) slides in pointing; light goes cold', [520, 800], 0.07, (lt, d, t) => {
      const c = eio(seg(lt, tP - 0.1, tP + 0.4));
      stage(lt, t, { lvl: lerp(0.6, 0.3, c), night: lerp(0.05, 0.35, c) }, () => {
        daySet(lt, d);
        xs.forEach((x, i) => { put(fig('sep'), x, 1196, 1, sin(t * 2 + i) * 0.008); put(hatImg('N'), x + 74, 1206, 1.05, 0.22 + i * 0.12); });
        const [ox, wob] = slide(lt, 0.15, 0.6, OX1 + 220, 800);
        rod(ox + 60, 1190, 1); put(fig('off'), ox, 1196, 1.06, wob, 1, -1);
        if (c > 0) { const g = ctx.createRadialGradient(390, 860, 60, 390, 860, 420); g.addColorStop(0, `rgba(190,210,255,${0.18 * c})`); g.addColorStop(1, 'rgba(190,210,255,0)'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(OX0, OY0, OW, 1000); ctx.restore(); }
      });
    });
    cue(S14 + 0.15, 'slide', { gain: 0.45, pan: 0.5 }); cue(S14 + tP, 'drum', { gain: 0.55 }); cue(S14 + tP + 0.05, 'thud', { gain: 0.4 });
  }

  // a15 · accounts say two were flogged: ACCOUNTS SAY card, two sepoys in a narrowing spot, a cord swish and a paper crack-burst
  {
    const tF = Wd('flogged', 4) - S15, xs = [380, 670];
    shot('a15', S15, 'ACCOUNTS SAY card; two bowed sepoy flats in a narrowing limelight; a cord swishes in from the wing, paper crack-burst, the flats jolt', [530, 780], 0.08, (lt, d, t) => {
      stage(lt, t, { lvl: 0.4, night: 0.15 }, () => {
        plainSet(lt, d);
        const jolt = lt > tF ? sin((lt - tF) * 30) * Math.exp(-(lt - tF) * 5) * 0.06 : 0;
        xs.forEach((x, i) => { const r = -0.035 + jolt * (i ? -1 : 1); rod(x - 50, 1188, -1); put(fig('sepBare'), x, 1196, 1.3, r); put(hatImg('O'), x + 414 * 1.3 * sin(r), 1196 - 414 * 1.3 * cos(r), 1.3, r); });
        iris(525, 850, lerp(620, 430, eio(seg(lt, 0.6, 1.1))), 0.88);
        const w = seg(lt, tF - 0.18, tF + 0.05);
        if (w > 0 && lt < tF + 0.45) {
          const a = 1 - seg(lt, tF + 0.15, tF + 0.45), tx = lerp(OX1 + 40, 700, eo(w)), ty = lerp(500, 760, eo(w));
          ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.strokeStyle = '#1A120C'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(OX1 + 40, 520); ctx.quadraticCurveTo(lerp(OX1, 820, w), lerp(360, 560, w), tx, ty); ctx.stroke(); ctx.restore();
        }
        burst(700, 760, lt - tF, 0.42);
        bill('ACCOUNTS SAY', 360, 360, lt - 0.05, 0.95);
      });
    });
    cue(S15 + 0.35, 'plop', { gain: 0.4 }); cue(S15 + tF - 0.18, 'zip', { gain: 0.45, pan: 0.6 }); cue(S15 + tF, 'slam', { gain: 0.5 });
  }

  // a16 · thrown out: the two flats are yanked off into the left wing on their rods, their hats drop and stay; half-drop curtain
  {
    const xs = [380, 670];
    shot('a16', S16, 'the two sepoy flats are yanked off into the left wing on their rods, hats drop to the empty stage, half-drop curtain falls', [540, 760], 0.06, (lt, d, t) => {
      const cd = eio(seg(lt, 1.5, 2.3));
      stage(lt, t, { lvl: lerp(0.45, 0.25, cd), night: 0.15, curt: 1 - 0.5 * cd, sway: 0.6 }, () => {
        plainSet(lt, d);
        xs.forEach((x0, i) => {
          const p = eio(seg(lt, 0.25 + i * 0.06, 0.85 + i * 0.06)), x = lerp(x0, OX0 - 320, p), rot = -0.035 + p * -0.2 + (p > 0 && p < 1 ? sin(p * PI) * 0.1 : 0);
          rod(x - 50, 1188, -1); put(fig('sepBare'), x, 1196, 1.3, rot);
          const hp = seg(lt, 0.25 + i * 0.06, 0.75 + i * 0.06), hx = x0 - 18 + hp * 40 * (i ? 1 : -1), hy = lerp(1196 - 414 * 1.3, 1204, hp * hp), hr = -0.035 + hp * (i ? 0.35 : -0.3);
          put(hatImg('O'), hx, hy, 1.3, hr);
        });
        iris(525, 850, lerp(430, 520, eo(seg(lt, 0.6, 1.4))), 0.86);
      });
    });
    cue(S16 + 0.25, 'whoosh', { gain: 0.55, pan: -0.6 }); cue(S16 + 0.72, 'thud', { gain: 0.35 }); cue(S16 + 0.8, 'tock', { gain: 0.3 }); cue(S16 + 1.5, 'whoosh', { gain: 0.35, dur: 0.8 });
  }
}
