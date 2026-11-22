// EPISODE 17 · worker C : "Hammered Copper & Ink Erasure", lines 7-8 (the doubt / the question / end)
//   c1  L7 -> "Kalabhras"      ink drains up off a copper sheet: a punched "?" + three tiny scholars; THE DOUBT, SOME SCHOLARS
//   c2  "Kalabhras" -> "Buddhist"  ink pulls back left off a tall plate: repousse Jain monk (whisk) punched in; MAY HAVE, JAIN?
//   c3  "Buddhist" -> "Tamil"  Jain plate steps back, a second plate slides in: Buddhist monk (bowl) punched in; BUDDHIST?
//   c4  "Tamil" -> "growing"   hammer + punch chisel rows of abstract marks into a plate, sparks on every strike; TAMIL WRITING?, MAY HAVE
//   c5  "growing" -> L8        the plates multiply into a wall of inscribed plates, light streak slides across
//   c6  L8 -> "or"             split frame: left the Kalabhra (ink figure, red-hot) smashes a plate; right a calm copper king; WRECKERS?
//   c7  "or" -> "Tell"         camera crosses right: a giant pen scribbles the copper king out, faint ghost left; OR WRITTEN OUT?
//   c8  "Tell" -> "watch"      both sides as small panels, punched arrow bounces down; TELL ME BELOW
//   c9  "watch" -> "who"       rewind: the ring of plates spins backwards, ink pulls off them, hook callback; WHO ERASED THEM?
//   c10 "who" -> end           the giant dripping pen hovers over the whole tableau, a drop falls on "pen" and spreads; WHO HELD THE PEN?, AAZHI
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit, lg, poly, dust } from './art.js';
import * as K from './core/kit.js';

// ───────────── palette ─────────────
const SLATE = '#0B0B0D', RIM = '#4A6A8A', INK = '#050505', INKE = '#2A2A30', HOT = '#FF4A1A', SP1 = '#FF9A3C', SP2 = '#FFE0A0', TXT = '#EDEFF2';

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

// ───────────── small helpers ─────────────
const ep = (cx, cy, rx, ry, n = 26) => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * TAU) * rx, cy + Math.sin((i / n) * TAU) * ry]);
const bar = (x0, y0, x1, y1, w) => { const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * w / 2, ny = Math.cos(a) * w / 2; return [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]; };
const pl = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); };
// even points along closed polygons (for the repousse punch dots)
function resample(polys, gap) {
  const out = [];
  for (const P of polys) {
    const n = P.length; let carry = 0;
    for (let i = 0; i < n; i++) {
      const a = P[i], b = P[(i + 1) % n], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      let d = carry; while (d < len) { const f = d / len; out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); d += gap; } carry = d - len;
    }
  }
  return out;
}
// emboss a list of shapes ({p, f:[c0,c1]} filled, {l} fold lines) - only inside cached()
function relief(shapes, sx = 1) {
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const s of shapes) {
    if (s.l) { ctx.strokeStyle = 'rgba(70,22,6,0.75)'; ctx.lineWidth = 5; pl(s.l); ctx.save(); ctx.translate(-2, -2); ctx.strokeStyle = 'rgba(255,214,176,0.55)'; ctx.lineWidth = 2; pl(s.l); ctx.restore(); continue; }
    ctx.save(); ctx.translate(6 * sx, 8 * sx); poly(s.p); ctx.fillStyle = 'rgba(30,8,2,0.55)'; ctx.fill(); ctx.restore();
    poly(s.p); ctx.fillStyle = lg(-160, -680, 160, 0, [[0, s.f[0]], [1, s.f[1]]]); ctx.fill();
    ctx.save(); ctx.translate(-2, -2); poly(s.p); ctx.strokeStyle = 'rgba(255,228,196,0.75)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    poly(s.p); ctx.strokeStyle = 'rgba(70,22,6,0.55)'; ctx.lineWidth = 2; ctx.stroke();
  }
}
// repousse punch dots popping in along an outline (p 0..1), newest dot gets a spark
function punchDots(pts, p) {
  const n = pts.length, shown = p * n;
  for (let i = 0; i < Math.min(n, Math.ceil(shown)); i++) {
    const k = clamp((shown - i) / 5), s = eob(k), [x, y] = pts[i];
    ctx.fillStyle = 'rgba(40,12,4,0.75)'; ctx.beginPath(); ctx.arc(x + 2.5, y + 3, 6 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#C9682F'; ctx.beginPath(); ctx.arc(x, y, 5 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,214,170,0.9)'; ctx.beginPath(); ctx.arc(x - 1.6, y - 1.8, 2.2 * s, 0, TAU); ctx.fill();
  }
  if (p > 0 && p < 1) { const [x, y] = pts[Math.min(n - 1, Math.floor(shown))]; K.glow(x, y, 46, '255,154,60', 0.7); ctx.fillStyle = SP2; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); }
}
// hammer sparks: a pure function of the strike age
function sparks(x, y, age, seed, n = 14, life = 0.45, pw = 1) {
  if (age < 0 || age > life) return; const k = 1 - age / life;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rnd(seed + i * 1.7) - 0.5) * 2.9, v = (260 + rnd(seed * 2 + i) * 620) * pw;
    const px = x + Math.cos(a) * v * age, py = y + Math.sin(a) * v * age + 1400 * age * age, vx = Math.cos(a) * v, vy = Math.sin(a) * v + 2800 * age;
    ctx.globalAlpha = k; ctx.strokeStyle = i % 2 ? SP1 : SP2; ctx.lineWidth = 2 + rnd(seed + i * 3) * 3;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - vx * 0.03, py - vy * 0.03); ctx.stroke();
  }
  ctx.restore();
}
// black ink beyond a wavy edge. In the rotated frame (about screen centre, angle ang) ink fills y' < f; drips hang toward +y'.
function ink(ang, f, t, seed = 0, drip = 1) {
  ctx.save(); ctx.translate(540, 960); ctx.rotate(ang);
  const ey = (x) => f + Math.sin(x * 0.011 + t * 2.3 + seed) * 22 + Math.sin(x * 0.027 - t * 3.1 + seed * 1.7) * 10;
  ctx.beginPath(); ctx.moveTo(-1500, -2400); for (let x = -1500; x <= 1500; x += 40) ctx.lineTo(x, ey(x)); ctx.lineTo(1500, -2400); ctx.closePath();
  ctx.fillStyle = INK; ctx.fill(); ctx.strokeStyle = INKE; ctx.lineWidth = 6; ctx.stroke();
  for (let i = 0; i < 22; i++) {
    const x = -1000 + rnd(i * 3.3 + seed) * 2000, y0 = ey(x), w = 10 + rnd(i * 5 + seed) * 20;
    const len = drip * (30 + rnd(i * 7 + seed) * 200) * (0.7 + 0.3 * Math.sin(t * 1.7 + i));
    ctx.fillStyle = INK; ctx.fillRect(x - w / 2, y0 - 8, w, len); ctx.beginPath(); ctx.arc(x, y0 + len, w * 0.75, 0, TAU); ctx.fill();
    ctx.fillStyle = INKE; ctx.beginPath(); ctx.arc(x - w * 0.25, y0 + len - w * 0.2, w * 0.2, 0, TAU); ctx.fill();
    if (i < 8) { const bx = x + 40, by = ey(bx) + Math.sin(t * 3 + i) * 6; ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(bx, by, 18 + rnd(i + seed) * 26, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}
// label: Caladea caps, cold white on a thin black bar with copper hairlines; stamps in (scale 1.5 -> 1)
function tag(text, x, y, size, p, o = {}) {
  if (p <= 0) return;
  const s = o.still ? 1 : lerp(1.5, 1, eo(clamp(p))), a = clamp(p * 3) * (o.a ?? 1);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.06)}px`;
  const w = ctx.measureText(text).width + size * 0.9, h = size * 1.3;
  ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = o.col || '#C8703A'; ctx.fillRect(-w / 2, -h / 2, w, 3); ctx.fillRect(-w / 2, h / 2 - 3, w, 3);
  ctx.fillStyle = TXT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, size * 0.03, size * 0.05);
  ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────── figures (local coords, origin = feet centre, ~640 tall) ─────────────
const ROBE = ['#F6C79A', '#C8743E'], SKIN = ['#EBA36E', '#A6522A'], DARKCU = ['#9A4A22', '#5A2410'], PALE = ['#F8DCB8', '#C27A44'];
const JAIN = [
  { p: ep(-50, -14, 34, 12), f: SKIN }, { p: ep(50, -14, 34, 12), f: SKIN },
  { p: [[-30, -520], [30, -520], [92, -488], [110, -400], [116, -300], [128, -160], [150, -24], [-150, -24], [-128, -160], [-116, -300], [-110, -400], [-92, -488]], f: PALE },
  { l: [[-70, -470], [30, -320], [92, -160]] }, { l: [[-100, -220], [-70, -40]] }, { l: [[10, -230], [24, -40]] },
  { p: ep(0, -578, 44, 54), f: SKIN },
  { p: [[92, -480], [128, -420], [138, -330], [124, -278], [100, -288], [108, -350], [88, -420]], f: PALE },
  { p: bar(116, -290, 186, -64, 13), f: DARKCU },
  { p: [[180, -76], [194, -72], [232, 6], [206, 16], [178, 18], [150, 10]], f: PALE },
  { l: [[186, -64], [168, 12]] }, { l: [[188, -64], [200, 14]] }, { l: [[190, -66], [222, 6]] },
  { p: ep(116, -284, 21, 19), f: SKIN },
];
const BUDD = [
  { p: ep(-50, -14, 34, 12), f: SKIN }, { p: ep(50, -14, 34, 12), f: SKIN },
  { p: [[-30, -520], [30, -520], [96, -486], [118, -400], [124, -300], [136, -160], [156, -24], [-156, -24], [-136, -160], [-124, -300], [-118, -400], [-96, -486]], f: ROBE },
  { p: [[30, -518], [96, -486], [117, -404], [62, -452]], f: SKIN },
  { l: [[-32, -514], [118, -392]] }, { l: [[-84, -250], [-104, -40]] }, { l: [[64, -250], [84, -40]] }, { l: [[0, -250], [-8, -40]] },
  { p: ep(0, -578, 44, 54), f: SKIN },
  { p: [[-118, -404], [-130, -330], [-74, -296], [-58, -324], [-98, -352], [-100, -414]], f: ROBE },
  { p: [[118, -404], [130, -330], [74, -296], [58, -324], [98, -352], [100, -414]], f: SKIN },
  { p: [[-80, -330], [80, -330], ...Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI; return [76 * Math.cos(a), -318 + 48 * Math.sin(a)]; })], f: DARKCU },
  { p: ep(-64, -318, 19, 16), f: SKIN }, { p: ep(64, -318, 19, 16), f: SKIN },
];
const KING = [
  { p: ep(-46, -14, 32, 12), f: SKIN }, { p: ep(46, -14, 32, 12), f: SKIN },
  { p: [[-34, -520], [34, -520], [110, -490], [126, -380], [100, -300], [106, -160], [124, -24], [-124, -24], [-106, -160], [-100, -300], [-126, -380], [-110, -490]], f: ROBE },
  { p: [[-104, -304], [104, -304], [104, -278], [-104, -278]], f: DARKCU },
  { l: [[-50, -270], [-70, -40]] }, { l: [[50, -270], [70, -40]] },
  { p: [[-110, -490], [-152, -400], [-152, -268], [-128, -264], [-126, -392]], f: ROBE },
  { p: [[110, -490], [152, -400], [152, -268], [128, -264], [126, -392]], f: ROBE },
  { p: ep(0, -578, 44, 54), f: SKIN },
  { p: [[-44, -616], [-52, -684], [-24, -650], [0, -704], [24, -650], [52, -684], [44, -616]], f: PALE },
];
const SCHOLAR = [
  { p: [[-26, -520], [26, -520], [100, -470], [130, -20], [-130, -20], [-100, -470]], f: ROBE },
  { p: ep(0, -580, 46, 56), f: SKIN },
  { l: [[-40, -420], [-60, -40]] }, { l: [[40, -420], [56, -40]] },
];
const outline = (shapes) => shapes.filter((s) => s.p).map((s) => s.p);
const JAIN_D = resample(outline(JAIN), 17), BUDD_D = resample(outline(BUDD), 17);
// question mark (plate-local coords)
const Q_PATH = (() => { const pts = []; for (let i = 0; i <= 18; i++) { const a = Math.PI * 1.05 + (i / 18) * Math.PI * 1.45; pts.push([Math.cos(a) * 92, -110 + Math.sin(a) * 92]); }
  pts.push([0, -2], [0, 60]); return pts; })();
const Q_D = (() => { const o = []; for (let i = 0; i < Q_PATH.length - 1; i++) { const [a, b] = [Q_PATH[i], Q_PATH[i + 1]], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 18)); for (let k = 0; k < n; k++) o.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); }
  for (const [x, y] of ep(0, 128, 22, 22, 8)) o.push([x, y]); return o; })();

// ───────────── cached art ─────────────
const bgImg = () => cached('cBg', W, H, 0.5, () => {
  ctx.fillStyle = SLATE; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(540, 760, 120, 540, 760, 1150); g.addColorStop(0, 'rgba(46,52,62,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 700; i++) { const x = rnd(i) * W, y = rnd(i + 0.5) * H, r = 6 + rnd(i * 3) * 16;
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.arc(x + 2, y + 2, r, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(120,150,180,0.03)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  for (const [x0, x1] of [[0, 170], [W, W - 170]]) { const h = ctx.createLinearGradient(x0, 0, x1, 0); h.addColorStop(0, 'rgba(74,106,138,0.32)'); h.addColorStop(1, 'rgba(74,106,138,0)'); ctx.fillStyle = h; ctx.fillRect(Math.min(x0, x1), 0, 170, H); }
  const b = ctx.createLinearGradient(0, 1240, 0, H); b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(0.3, 'rgba(0,0,0,0.6)'); b.addColorStop(1, 'rgba(0,0,0,0.85)'); ctx.fillStyle = b; ctx.fillRect(0, 1240, W, H - 1240);
});
const bg = (t) => { blit(bgImg(), 0, 0, 0, 0, 1); K.glow(540 + Math.sin(t * 0.7) * 320, 380, 520, '74,106,138', 0.12); };
// tall plate (ring hole at top) for a monk relief; local centre (360, 460)
const PLW = 720, PLH = 920;
const tallPlate = (key, seed, pat) => cached(key, PLW, PLH, 1, () => copperPlate(PLW / 2, PLH / 2, 900, 700, Math.PI / 2, 0, seed, pat));
const reliefImg = (key, shapes, s = 1) => cached(key, PLW, PLH, 1, () => { ctx.translate(PLW / 2, PLH - 60); ctx.scale(s, s); relief(shapes); });
const jainPlate = () => tallPlate('cPlJ', 3, 0.25), buddPlate = () => tallPlate('cPlB', 7, 0.2);
const jainRel = () => reliefImg('cRelJ', JAIN), buddRel = () => reliefImg('cRelB', BUDD);
// a finished monk panel (plate + relief + dots) for later shots
const monkDone = (key, plate, rel, dots) => cached(key, PLW, PLH, 0.6, () => {
  ctx.drawImage(plate(), 0, 0); ctx.drawImage(rel(), 0, 0); ctx.save(); ctx.translate(PLW / 2, PLH - 60); punchDots(dots, 1); ctx.restore(); });
function monkPanel(plate, rel, dots, x, y, s, dotP, sheen, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  blit(plate(), PLW / 2, PLH / 2, 0, 0, 1);
  if (sheen > 0) blit(rel(), PLW / 2, PLH / 2, 0, 0, 1, sheen);
  if (dotP > 0) { ctx.save(); ctx.translate(0, PLH / 2 - 60); punchDots(dots, dotP); ctx.restore(); }
  ctx.restore();
}
// wide plate for the doubt shot: question mark relief + scholars
const QW = 960, QH = 640;
const qPlate = () => cached('cQp', QW + 20, QH + 20, 1, () => copperPlate(QW / 2 + 10, QH / 2 + 10, QW - 20, QH - 40, 0, 0, 11, 0.15));
const qRel = () => cached('cQr', QW + 20, QH + 20, 1, () => {
  ctx.translate(QW / 2 + 10 - 190, QH / 2 + 10 + 10); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.save(); ctx.translate(6, 8); ctx.strokeStyle = 'rgba(30,8,2,0.55)'; ctx.lineWidth = 36; pl(Q_PATH); ctx.fillStyle = 'rgba(30,8,2,0.55)'; ctx.beginPath(); ctx.arc(0, 128, 24, 0, TAU); ctx.fill(); ctx.restore();
  ctx.strokeStyle = lg(-90, -200, 90, 150, [[0, '#F8D2A8'], [1, '#B8622E']]); ctx.lineWidth = 32; pl(Q_PATH);
  ctx.fillStyle = '#E8A46E'; ctx.beginPath(); ctx.arc(0, 128, 22, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(-3, -3); ctx.strokeStyle = 'rgba(255,232,204,0.6)'; ctx.lineWidth = 4; pl(Q_PATH); ctx.restore();
});
const scholarImg = () => cached('cSch', 300, 680, 1, () => { ctx.translate(150, 650); relief(SCHOLAR); });
// pen (tip at (110, 990) of a 220 x 1000 canvas)
const penImg = () => cached('cPen', 220, 1000, 1, () => {
  const sh = [[74, 0], [146, 0], [142, 640], [134, 840], [110, 990], [86, 840], [78, 640]];
  poly(sh); ctx.fillStyle = lg(70, 0, 150, 0, [[0, '#26262C'], [0.35, '#0E0E12'], [1, INK]]); ctx.fill();
  ctx.strokeStyle = INKE; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(150,170,200,0.45)'; ctx.lineWidth = 3; pl([[84, 20], [84, 640], [94, 840]]);
  ctx.fillStyle = lg(76, 0, 146, 0, [[0, '#E08A4E'], [0.5, '#B4552A'], [1, '#6E2E14']]); ctx.fillRect(77, 600, 66, 40); ctx.fillRect(75, 150, 70, 18); ctx.fillRect(75, 182, 70, 8);
  ctx.strokeStyle = '#3A3A44'; ctx.lineWidth = 3; pl([[110, 880], [110, 984]]); ctx.fillStyle = '#3A3A44'; ctx.beginPath(); ctx.arc(110, 872, 7, 0, TAU); ctx.fill();
});
const pen = (x, y, rot = 0, s = 1) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); blit(penImg(), 110, 990, 0, 0, s); ctx.restore(); };
// hammer in a faceless hand (pivot = hand at (220,100)); head on the left, striking face at y 150
const hamImg = () => cached('cHam', 320, 200, 1, () => {
  ctx.fillStyle = '#3A2416'; ctx.fillRect(60, 90, 170, 20);
  ctx.fillStyle = lg(0, 50, 0, 150, [[0, '#4A4A54'], [1, '#1A1A20']]); ctx.beginPath(); ctx.roundRect(18, 50, 56, 100, 8); ctx.fill(); ctx.strokeStyle = RIM; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#18181C'; ctx.fillRect(230, 78, 90, 46); ctx.beginPath(); ctx.ellipse(222, 100, 40, 32, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = RIM; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(222, 100, 40, 32, 0, Math.PI * 1.05, Math.PI * 1.9); ctx.stroke(); pl([[262, 78], [320, 78]]);
});
// a plain inscribed plate
const smallPlate = (key, w, h, rows, seed, pat = 0) => cached(key, w + 20, h + 20, 1, () => copperPlate(w / 2 + 10, h / 2 + 10, w, h, 0, rows, seed, pat));
// Pandya seal: bronze disc with a raised twin-fish relief, no letters
const sealImg = () => cached('cSeal', 220, 220, 1, () => {
  ctx.translate(110, 110);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(5, 7, 96, 0, TAU); ctx.fill();
  ctx.fillStyle = lg(-90, -90, 90, 90, [[0, '#E0A060'], [0.5, '#A8642E'], [1, '#5A2E12']]); ctx.beginPath(); ctx.arc(0, 0, 96, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,180,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 82, 0, TAU); ctx.stroke();
  for (const d of [-1, 1]) {
    ctx.save(); ctx.scale(d, 1); ctx.translate(-26, 0); ctx.rotate(-0.12);
    const fish = () => { ctx.beginPath(); ctx.ellipse(0, -10, 16, 46, 0, 0, TAU); ctx.moveTo(0, 30); ctx.lineTo(-18, 62); ctx.lineTo(18, 62); ctx.closePath(); };
    ctx.save(); ctx.translate(3, 4); fish(); ctx.fillStyle = 'rgba(40,14,4,0.6)'; ctx.fill(); ctx.restore();
    fish(); ctx.fillStyle = lg(-16, -50, 16, 60, [[0, '#F6CC98'], [1, '#B8702E']]); ctx.fill(); ctx.restore();
  }
});
// the Kalabhra: ink figure, outline half dissolved, red-hot halo (feet at (260, 860)); arm separate
const kalImg = () => cached('cKal', 520, 920, 1, () => {
  ctx.translate(260, 860);
  ctx.shadowColor = HOT; ctx.shadowBlur = 46;
  for (const s of KING) if (s.p) { poly(s.p); ctx.fillStyle = INK; ctx.fill(); }
  ctx.shadowBlur = 0;
  // dissolving right side: blots and drips
  for (let i = 0; i < 26; i++) { const y = -560 + rnd(i * 3.1) * 540, x = 40 + rnd(i * 7.7) * 120 + (y > -300 ? 0 : -20), r = 10 + rnd(i * 2.3) * 30;
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); if (rnd(i + 0.3) > 0.5) { ctx.fillRect(x - r * 0.3, y, r * 0.6, 40 + rnd(i) * 90); ctx.beginPath(); ctx.arc(x, y + 40 + rnd(i) * 90, r * 0.4, 0, TAU); ctx.fill(); } }
  ctx.strokeStyle = 'rgba(255,74,26,0.85)'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  for (const s of KING) if (s.p) { ctx.save(); ctx.beginPath(); ctx.rect(-220, -760, 230, 800); ctx.clip(); poly(s.p); ctx.stroke(); ctx.restore(); }
  ctx.strokeStyle = INKE; ctx.lineWidth = 4; for (const s of KING) if (s.p) { ctx.save(); ctx.beginPath(); ctx.rect(10, -760, 220, 800); ctx.clip(); poly(s.p); ctx.stroke(); ctx.restore(); }
});
// raised arm + club (pivot = shoulder at (80, 480), arm points up)
const kalArm = () => cached('cKalA', 160, 520, 1, () => {
  ctx.translate(80, 480); ctx.shadowColor = HOT; ctx.shadowBlur = 30; ctx.fillStyle = INK;
  poly([[-20, 10], [20, 10], [16, -190], [-16, -190]]); ctx.fill();
  poly([[-12, -200], [12, -200], [30, -400], [0, -444], [-30, -400]]); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -200, 24, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,74,26,0.9)'; ctx.lineWidth = 3; poly([[-12, -200], [12, -200], [30, -400], [0, -444], [-30, -400]]); ctx.stroke();
});
// right-half panel: tall plate + copper king relief (centre (240, 450))
const RPW = 480, RPH = 920;
const kingPanel = () => cached('cKingP', RPW, RPH, 1, () => { copperPlate(RPW / 2, RPH / 2, 880, 440, Math.PI / 2, 0, 21, 0.2); ctx.translate(RPW / 2, RPH - 70); ctx.scale(0.95, 0.95); relief(KING); });
const kingGhost = () => cached('cKingG', RPW, RPH, 1, () => { ctx.translate(RPW / 2, RPH - 70); ctx.scale(0.95, 0.95); ctx.lineJoin = 'round';
  for (const s of KING) if (s.p) { ctx.save(); ctx.translate(3, 3); poly(s.p); ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); poly(s.p); ctx.strokeStyle = 'rgba(150,96,64,0.5)'; ctx.lineWidth = 3; ctx.stroke(); } });
// pen scribble path over the right panel (local coords about the panel centre)
const SCR_ROWS = 7, SCR_X0 = -170, SCR_X1 = 170, SCR_Y0 = -400, SCR_RH = 118;
function scribblePts(p) {
  const tot = p * SCR_ROWS, out = [];
  for (let r = 0; r <= Math.min(SCR_ROWS - 1, Math.floor(tot)); r++) {
    const y = SCR_Y0 + (r + 0.5) * SCR_RH, dir = r % 2 ? -1 : 1, a = dir > 0 ? SCR_X0 : SCR_X1, b = dir > 0 ? SCR_X1 : SCR_X0, f = clamp(tot - r);
    out.push([a, y], [lerp(a, b, f), y + Math.sin(f * 9) * 8]);
  }
  return out;
}
function rightPanel(x, y, s, inkP, t, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  blit(kingPanel(), RPW / 2, RPH / 2, 0, 0, 1);
  let tip = null;
  if (inkP > 0) {
    const P = scribblePts(inkP); tip = P[P.length - 1];
    ctx.save(); ctx.beginPath(); ctx.roundRect(-220, -440, 440, 880, 35); ctx.clip();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = INKE; ctx.lineWidth = SCR_RH * 1.38; pl(P); ctx.strokeStyle = INK; ctx.lineWidth = SCR_RH * 1.3; pl(P);
    // drips under the wet front
    ctx.fillStyle = INK; for (let i = 0; i < 5; i++) { const dx = lerp(SCR_X0, SCR_X1, rnd(i * 4.1)), ln = 20 + rnd(i) * 60 + Math.sin(t * 2 + i) * 8, yy = tip[1] + SCR_RH * 0.55; ctx.fillRect(dx - 6, yy - 10, 12, ln); ctx.beginPath(); ctx.arc(dx, yy + ln, 9, 0, TAU); ctx.fill(); }
    ctx.restore();
    blit(kingGhost(), RPW / 2, RPH / 2, 0, 0, 1, clamp(inkP * 1.5) * 0.9);
  }
  ctx.restore();
  return tip && [x + tip[0] * s, y + tip[1] * s];
}

// ───────────── shots ─────────────
const nth = (w, line, n) => { const h = T.words.filter((x) => x.line === line && String(x.w).toLowerCase().replace(/[^a-z]/g, '') === w)[n]; if (!h) throw new Error(`no ${w} #${n} in line ${line}`); return h.s; };
export function buildC(add, cue) {
  const t1 = L(7), t2 = Wd('Kalabhras', 7), t3 = Wd('Buddhist', 7), t4 = Wd('Tamil', 7), t5 = Wd('growing', 7), t6 = L(8), t7 = Wd('or', 8), t8 = Wd('Tell', 8), t9 = Wd('watch', 8), t10 = Wd('who', 8), END = T.dur;

  // c1 THE DOUBT: ink drains up off a copper sheet, a punched "?" and three tiny scholars
  {
    const tD = Wd('doubt', 7) - t1, tS = Wd('Some', 7) - t1, tSc = Wd('scholars', 7) - t1;
    cue(t1, 'swell', { gain: 0.5, dur: 1.4 }); cue(t1, 'gulp', { gain: 0.5 }); cue(t1 + tD, 'thud', { gain: 0.7 }); cue(t1 + tS, 'chisel', { gain: 0.5, pan: 0.3 }); cue(t1 + tS + 0.18, 'chisel', { gain: 0.45, pan: 0.4 }); cue(t1 + tS + 0.36, 'chisel', { gain: 0.45, pan: 0.5 }); cue(t1 + tSc + 0.1, 'tock', { gain: 0.5 });
    add({ id: 'c1', at: t1, cam: [540, 720], zoom: 0.07, note: 'THE DOUBT: ink drains up, punched ? + scholars; THE DOUBT, SOME SCHOLARS',
      draw(lt, d) {
        bg(lt);
        const px = 540, py = 720 + Math.sin(lt * 1.2) * 6;
        blit(qPlate(), QW / 2 + 10, QH / 2 + 10, px, py, 1);
        const qp = seg(lt, 0.15, 1.0), sh = seg(lt, 0.8, 1.3);
        if (sh > 0) blit(qRel(), QW / 2 + 10, QH / 2 + 10, px, py, 1, sh);
        ctx.save(); ctx.translate(px - 190, py + 10); punchDots(Q_D, qp); ctx.restore();
        // three tiny scholars hammered in on "Some"
        for (let i = 0; i < 3; i++) { const k = seg(lt, tS + i * 0.18, tS + i * 0.18 + 0.3); if (k <= 0) continue; const sx = px + 110 + i * 120, sy = py + 220;
          ctx.save(); ctx.translate(sx, sy); ctx.scale(0.36 * eob(k), 0.36 * eob(k)); blit(scholarImg(), 150, 650, 0, 0, 1); ctx.restore(); sparks(sx, sy - 120, lt - tS - i * 0.18, 30 + i, 10, 0.4, 0.6); }
        // specular streak
        ctx.save(); ctx.beginPath(); ctx.roundRect(px - QW / 2 + 10, py - QH / 2 + 20, QW - 20, QH - 40, 40); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
        const sx = lerp(-200, 1300, lt / d); ctx.fillStyle = lg(sx - 120, 0, sx + 120, 0, [[0, 'rgba(255,210,166,0)'], [0.5, 'rgba(255,210,166,0.22)'], [1, 'rgba(255,210,166,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
        // ink drains upward
        ink(0, lerp(760, -1250, eio(seg(lt, 0.0, 1.0))), lt, 1, 1.2);
        tag('THE DOUBT', 540, 250, 76, seg(lt, tD, tD + 0.22));
        tag('SOME SCHOLARS', 540, 1180, 60, seg(lt, tSc, tSc + 0.22));
        dust(lt, 26, 3, '170,190,220', 0.3);
      } });
  }

  // c2 JAIN?: ink pulls back left, a Jain monk with a whisk is punched in from behind
  {
    const tM = Wd('may', 7) - t2, tJ = Wd('Jain', 7) - t2;
    cue(t2, 'whoosh', { gain: 0.45, pan: -0.4 }); for (let i = 0; i < 4; i++) cue(t2 + 0.25 + i * 0.22, 'chisel', { gain: 0.35, pan: -0.2 + i * 0.15 }); cue(t2 + tM, 'tock', { gain: 0.45 }); cue(t2 + tJ, 'thud', { gain: 0.6 });
    add({ id: 'c2', at: t2, cam: [540, 640], zoom: 0.08, note: 'JAIN?: ink recedes left, repousse Jain monk (whisk); MAY HAVE, JAIN?, ILLUSTRATION',
      draw(lt, d) {
        bg(lt + 3);
        const x = 540 + Math.sin(lt * 0.9) * 8, y = 720;
        monkPanel(jainPlate, jainRel, JAIN_D, x, y, 1, seg(lt, 0.15, 1.15), seg(lt, 0.9, 1.4));
        ink(-Math.PI / 2, lerp(700, -1300, eio(seg(lt, 0.0, 1.0))), lt, 4, 1);
        tag('MAY HAVE', 540, 200, 50, seg(lt, tM, tM + 0.2), { col: '#3FA38A' });
        tag('JAIN?', 540, 1235, 74, seg(lt, tJ, tJ + 0.22));
        tag('ILLUSTRATION', 760, 1110, 22, seg(lt, 1.0, 1.2), { still: true, a: 0.85 });
        dust(lt, 22, 5, '170,190,220', 0.3);
      } });
  }

  // c3 BUDDHIST?: Jain plate steps back, a second plate slides in, Buddhist monk with bowl punched in
  {
    cue(t3, 'slide', { gain: 0.5, pan: 0.5 }); cue(t3 + 0.12, 'thud', { gain: 0.55 }); for (let i = 0; i < 3; i++) cue(t3 + 0.3 + i * 0.2, 'chisel', { gain: 0.35, pan: 0.3 });
    add({ id: 'c3', at: t3, cam: [640, 700], zoom: 0.07, note: 'BUDDHIST?: Buddhist monk (bowl) punched in beside the Jain plate; BUDDHIST?, JAIN?',
      draw(lt, d) {
        bg(lt + 6);
        const jx = lerp(540, 270, eo(seg(lt, 0, 0.45))), js = lerp(1, 0.6, eo(seg(lt, 0, 0.45)));
        blit(monkDone('cJdone', jainPlate, jainRel, JAIN_D), PLW / 2, PLH / 2, jx, lerp(720, 740, eo(seg(lt, 0, 0.45))), js, 0.8);
        const bx = lerp(1300, 700, eo(seg(lt, 0, 0.4))) + Math.sin(lt) * 6;
        monkPanel(buddPlate, buddRel, BUDD_D, bx, 700, 0.8, seg(lt, 0.25, 1.05), seg(lt, 0.85, 1.3));
        ctx.save(); ctx.beginPath(); ctx.roundRect(bx - 282, 338, 564, 724, 40); ctx.clip(); ink(Math.PI / 2, lerp(110, -700, eo(seg(lt, 0.05, 0.9))), lt, 8, 0.8); ctx.restore();
        tag('JAIN?', 250, 1050, 40, 1, { still: true, a: 0.85 });
        tag('BUDDHIST?', 700, 1165, 66, seg(lt, 0.12, 0.34));
        dust(lt, 22, 7, '170,190,220', 0.3);
      } });
  }

  // c4 TAMIL WRITING?: hammer + punch chisel rows of abstract marks, sparks on every strike
  {
    const PW = 900, PH = 420, rows = 5, rate = 5.5, tM = nth('may', 7, 1) - t4;
    const nStr = Math.floor((t5 - t4) * rate);
    for (let k = 0; k < nStr; k++) cue(t4 + (k + 0.62) / rate, 'chisel', { gain: 0.42, pan: -0.3 + (k % 5) * 0.15 });
    cue(t4, 'whoosh', { gain: 0.35 }); cue(t4 + 0.12, 'tock', { gain: 0.5 }); cue(t4 + tM, 'tock', { gain: 0.45 });
    add({ id: 'c4', at: t4, cam: [540, 680], zoom: 0.08, note: 'TAMIL WRITING?: rows of abstract marks hammered into a plate; TAMIL WRITING?, MAY HAVE',
      draw(lt, d) {
        bg(lt + 9);
        blit(smallPlate('cTWa', 860, 400, 5, 3, 0.5), 440, 210, 520, 470, 1, 0.55); // back plates
        blit(smallPlate('cTWb', 860, 400, 5, 5, 0.3), 440, 210, 565, 560, 1, 0.7);
        const px = 540, py = 720;
        const blank = smallPlate('cTW0', PW, PH, 0, 9, 0), full = smallPlate('cTW1', PW, PH, rows, 9, 0);
        blit(blank, PW / 2 + 10, PH / 2 + 10, px, py, 1);
        const p = seg(lt, 0.1, d - 0.1) * rows, x0 = px - PW / 2 + PH * 0.3, x1 = px + PW / 2 - PH * 0.08;
        ctx.save(); ctx.beginPath(); let tip = [x0, py];
        for (let r = 0; r < rows; r++) { const f = clamp(p - r); if (f <= 0) break; const yy = py - PH / 2 + PH * (r + 1) / (rows + 1); ctx.rect(x0 - 10, yy - 14, (x1 - x0 + 20) * f, 24); tip = [x0 + (x1 - x0) * f, yy]; }
        ctx.clip(); blit(full, PW / 2 + 10, PH / 2 + 10, px, py, 1); ctx.restore();
        // hammer + punch at the tip
        const ph = (lt * rate) % 1, lift = ph < 0.62 ? eio(ph / 0.62) : 1 - eo((ph - 0.62) / 0.38) * 1;
        const hit = ph >= 0.62 ? (ph - 0.62) / rate : -1;
        ctx.fillStyle = '#2A2A30'; ctx.fillRect(tip[0] - 7, tip[1] - 84, 14, 80); ctx.fillStyle = '#6A7A8E'; ctx.fillRect(tip[0] - 7, tip[1] - 84, 4, 80);
        ctx.save(); ctx.translate(tip[0] + 186, tip[1] - 84 - 50); ctx.rotate(0.85 * (1 - (ph >= 0.62 ? eo((ph - 0.62) / 0.12) : 1 - lift))); blit(hamImg(), 220, 100, 0, 0, 1); ctx.restore();
        if (hit >= 0) { sparks(tip[0], tip[1] - 4, hit, Math.floor(lt * rate) * 13, 14, 0.18); K.glow(tip[0], tip[1], 90, '255,154,60', 0.6 * (1 - hit * rate)); }
        tag('MAY HAVE', 540, 230, 50, seg(lt, tM, tM + 0.2), { col: '#3FA38A' });
        tag('TAMIL WRITING?', 540, 1165, 66, seg(lt, 0.1, 0.32));
        dust(lt, 20, 9, '255,200,150', 0.25);
      } });
  }

  // c5 multiplying: one plate becomes a wall of inscribed plates
  {
    const cols = [190, 540, 890], rowsY = [330, 490, 650, 810, 970, 1130], cells = [];
    rowsY.forEach((y, r) => cols.forEach((x, c) => cells.push({ x, y, i: cells.length, dd: Math.hypot(x - 540, (y - 730) * 1.3) })));
    cells.sort((a, b) => a.dd - b.dd).forEach((c, k) => (c.k = k));
    cue(t5, 'whoosh', { gain: 0.35 }); for (let k = 0; k < 18; k += 2) cue(t5 + 0.05 + k * 0.065, 'pop', { gain: 0.32, pan: ((cells.find((c) => c.k === k).x - 540) / 540) * 0.6 }); cue(t5 + 1.3, 'sparkle', { gain: 0.4 });
    add({ id: 'c5', at: t5, cam: [540, 740], zoom: 0.05, note: 'plates multiply into a wall of inscribed plates; TAMIL WRITING?, MAY HAVE',
      draw(lt, d) {
        bg(lt + 12);
        for (const c of cells) { const k = seg(lt, 0.03 + c.k * 0.065, 0.03 + c.k * 0.065 + 0.3); if (k <= 0) continue;
          const img = smallPlate('cGP' + (c.i % 6), 300, 132, 3, 40 + (c.i % 6), c.i % 4 === 0 ? 0.25 : 0), s = eob(k);
          ctx.save(); ctx.translate(c.x, c.y + Math.sin(lt * 1.6 + c.i) * 4); ctx.rotate((rnd(c.i) - 0.5) * 0.08 * (1 + (1 - k) * 4)); blit(img, 160, 76, 0, 0, s); ctx.restore(); }
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sx = lerp(-400, 1500, seg(lt, 0.6, d));
        ctx.translate(sx, 700); ctx.rotate(0.35); ctx.fillStyle = lg(-140, 0, 140, 0, [[0, 'rgba(255,210,166,0)'], [0.5, 'rgba(255,210,166,0.16)'], [1, 'rgba(255,210,166,0)']]); ctx.fillRect(-140, -900, 280, 1800); ctx.restore();
        tag('MAY HAVE', 540, 170, 46, 1, { still: true, col: '#3FA38A' });
        tag('TAMIL WRITING?', 540, 1262, 58, 1, { still: true });
      } });
  }

  // split frame pieces
  const divider = (t) => { ctx.strokeStyle = '#B4552A'; ctx.lineWidth = 6; const P = []; for (let y = -50; y <= 1340; y += 40) P.push([540 + Math.sin(y * 0.03 + t) * 5 + (rnd(y) - 0.5) * 8, y]); pl(P); ctx.strokeStyle = 'rgba(255,210,166,0.5)'; ctx.lineWidth = 2; pl(P); };
  const leftHalf = (lt, strike, armA) => {
    ctx.save(); ctx.beginPath(); ctx.rect(-100, -100, 640, 1440); ctx.clip();
    const g = ctx.createLinearGradient(0, 1320, 0, 500); g.addColorStop(0, 'rgba(255,74,26,0)'); g.addColorStop(0.15, 'rgba(255,74,26,0.5)'); g.addColorStop(1, 'rgba(255,74,26,0)'); ctx.fillStyle = g; ctx.fillRect(-100, 500, 640, 820);
    K.glow(300, 820, 380, '255,74,26', 0.22 + 0.06 * Math.sin(lt * 9));
    K.embers(lt, 16, 5, '255,154,60');
    // floor plate (cracks after the strike)
    const sa = lt - strike;
    ctx.save(); ctx.translate(120, 1165); ctx.rotate(-0.06); blit(smallPlate('cFl', 230, 100, 2, 61, 0.2), 125, 60, 0, 0, 1);
    if (sa > 0) { ctx.strokeStyle = INK; ctx.lineWidth = 4; pl([[-10, -50], [6, -12], [-14, 10], [8, 50]]); pl([[6, -12], [60, -24]]); }
    ctx.restore();
    if (sa > 0) for (let i = 0; i < 4; i++) { const a = -2.2 + i * 0.5, v = 380 + rnd(i) * 200, x = 120 + Math.cos(a) * v * sa, y = 1150 + Math.sin(a) * v * sa + 1300 * sa * sa;
      if (y < 1400) { ctx.save(); ctx.translate(x, y); ctx.rotate(sa * (6 + i)); ctx.fillStyle = i % 2 ? '#B4552A' : '#E08A4E'; poly([[-18, -12], [20, -6], [4, 16]]); ctx.fill(); ctx.restore(); } }
    // figure + arm
    const fx = 330, fy = 1180 + Math.sin(lt * 2) * 3;
    ctx.save(); ctx.translate(fx - 100 * 0.85, fy - 480 * 0.85); ctx.rotate(armA); blit(kalArm(), 80, 480, 0, 0, 0.85); ctx.restore();
    blit(kalImg(), 260, 860, fx, fy, 0.85);
    // live drips off the dissolving side
    ctx.fillStyle = INK; for (let i = 0; i < 4; i++) { const x = fx + 50 + i * 26, ln = 30 + ((lt * 60 + i * 37) % 120); ctx.fillRect(x - 5, fy - 260 + i * 40, 10, ln); ctx.beginPath(); ctx.arc(x, fy - 260 + i * 40 + ln, 8, 0, TAU); ctx.fill(); }
    if (sa > 0) { sparks(120, 1140, sa, 77, 22, 0.5, 1.1); K.glow(120, 1140, 220, '255,154,60', 0.7 * (1 - clamp(sa / 0.4))); }
    ctx.restore();
  };
  const armAt = (lt, strike) => lt < strike - 0.18 ? 0.35 + Math.sin(lt * 4) * 0.08 : lt < strike ? lerp(0.35, -2.75, eio(seg(lt, strike - 0.18, strike))) : lerp(-2.75, -2.4, eo(seg(lt, strike, strike + 0.6)));

  // c6 WRECKERS?: left the Kalabhra smashes a plate in red heat, right a calm copper king
  {
    const st = Wd('country', 8) - t6;
    cue(t6, 'slam', { gain: 0.6 }); cue(t6, 'sizzle', { gain: 0.35, dur: 1.4, pan: -0.5 }); cue(t6 + st - 0.18, 'whoosh', { gain: 0.4, pan: -0.4 }); cue(t6 + st, 'thud', { gain: 0.8, pan: -0.5 }); cue(t6 + st + 0.02, 'chisel', { gain: 0.5, pan: -0.5 });
    add({ id: 'c6', at: t6, cam: [300, 800], zoom: 0.07, note: 'split: Kalabhra ink figure smashes a plate in red heat | calm copper king; WRECKERS?, ILLUSTRATION',
      draw(lt, d) {
        bg(lt + 15);
        leftHalf(lt, st, armAt(lt, st));
        rightPanel(810, 760, 1, 0, lt, 0.5); ctx.fillStyle = 'rgba(11,11,13,0.35)'; ctx.fillRect(545, 0, 600, 1330);
        divider(lt);
        tag('WRECKERS?', 285, 1250, 64, seg(lt, 0.05, 0.27), { col: HOT });
        tag('ILLUSTRATION', 270, 220, 22, 1, { still: true, a: 0.8 });
      } });
  }

  // c7 OR WRITTEN OUT?: the giant pen scribbles the copper king out, a faint ghost remains
  {
    const p0 = 0.2, p1 = Wd('winners', 8) - t7 + 0.3;
    cue(t7, 'whoosh', { gain: 0.45, pan: 0.4 }); for (let r = 0; r < SCR_ROWS; r++) cue(t7 + lerp(p0, p1, r / SCR_ROWS), 'zip', { gain: 0.35, pan: r % 2 ? 0.2 : 0.6 }); cue(t7 + p1, 'plop', { gain: 0.5, pan: 0.5 });
    add({ id: 'c7', at: t7, cam: [800, 760], zoom: 0.07, note: 'split: giant pen scribbles the copper king out, faint ghost; OR WRITTEN OUT?',
      draw(lt, d) {
        bg(lt + 18);
        leftHalf(lt + 2, -10, -2.4 + Math.sin(lt * 2) * 0.05); ctx.fillStyle = 'rgba(11,11,13,0.55)'; ctx.fillRect(-100, 0, 640, 1330);
        const tip = rightPanel(810, 760, 1, seg(lt, p0, p1), lt);
        divider(lt);
        const [tx, ty] = tip || [810, 340], hov = lt < p0 ? (1 - eo(lt / p0)) * 300 : 0;
        if (lt > p1) { const a = lt - p1; pen(tx + 60 * eo(clamp(a * 2)), ty - 120 * eo(clamp(a * 2)) + Math.sin(lt * 3) * 6, 0.32, 0.85); }
        else pen(tx, ty - hov, 0.32 + Math.sin(lt * 12) * 0.03, 0.85);
        tag('WRECKERS?', 285, 1250, 64, 1, { still: true, col: HOT, a: 0.45 });
        tag('OR WRITTEN OUT?', 805, 1250, 50, seg(lt, 0.05, 0.27));
      } });
  }

  // c8 TELL ME BELOW: both sides as panels, punched arrow bounces down
  {
    cue(t8, 'pop', { gain: 0.5 }); cue(t8 + 0.1, 'bell', { gain: 0.4 }); cue(t8 + 0.6, 'tock', { gain: 0.4 });
    add({ id: 'c8', at: t8, cam: [540, 760], zoom: 0.06, note: 'both sides as panels, punched arrow points down; TELL ME BELOW',
      draw(lt, d) {
        bg(lt + 21);
        const k = eo(seg(lt, 0, 0.35)), pulse = 0.5 + 0.5 * Math.sin(lt * 7);
        K.glow(280, 720, 300, '255,74,26', 0.25 + 0.12 * pulse);
        ctx.save(); ctx.translate(280, 900); ctx.scale(lerp(0.8, 0.6, k), lerp(0.8, 0.6, k));
        ctx.save(); ctx.translate(-100 * 0.85, -480 * 0.85); ctx.rotate(0.35 + Math.sin(lt * 4) * 0.1); blit(kalArm(), 80, 480, 0, 0, 0.85); ctx.restore();
        blit(kalImg(), 260, 860, 0, 0, 0.85); ctx.restore();
        rightPanel(790, 620, lerp(0.75, 0.6, k), 1, lt);
        tag('WRECKERS?', 280, 1000, 42, 1, { still: true, col: HOT });
        tag('OR WRITTEN OUT?', 790, 1000, 36, 1, { still: true });
        tag('TELL ME BELOW', 540, 1120, 62, seg(lt, 0.05, 0.27));
        // punched arrow (repousse dots) bouncing down
        const ay = 1205 + Math.abs(Math.sin(lt * 6)) * 18, ap = seg(lt, 0.2, 0.6);
        const A = [[-36, 0], [36, 0], [36, 50], [76, 50], [0, 112], [-76, 50], [-36, 50]], D = resample([A], 15).map(([x, y]) => [540 + x, ay + y]);
        ctx.fillStyle = lg(0, ay, 0, ay + 96, [[0, '#E08A4E'], [1, '#6E2E14']]); ctx.globalAlpha = ap; poly(A.map(([x, y]) => [540 + x, ay + y])); ctx.fill(); ctx.globalAlpha = 1;
        punchDots(D, ap);
      } });
  }

  // c9 rewind: ring of plates spins backwards, ink pulls off them, a red flash like the hook
  {
    cue(t9, 'whoosh', { gain: 0.5, pan: 0.3 }); cue(t9 + 0.05, 'zip', { gain: 0.35 }); cue(t9 + 0.5, 'slide', { gain: 0.35 }); const tS = Wd('start', 8) - t9; cue(t9 + tS, 'thud', { gain: 0.5 });
    add({ id: 'c9', at: t9, cam: [540, 690], zoom: 0.09, note: 'rewind: ring of plates spins backwards, ink pulls off, hook callback; WHO ERASED THEM?',
      draw(lt, d) {
        bg(lt + 24);
        K.glow(540, 690, 600, '255,74,26', 0.45 * Math.exp(-lt * 2.5) + 0.06);
        const cx = 540, cy = 690, spin = -5.2 * eo(seg(lt, 0, d)) - lt * 0.15;
        for (let i = 0; i < 5; i++) {
          const img = smallPlate('cRp' + i, 460, 200, 4, 80 + i, i % 2 ? 0.4 : 0.1), a = (i / 5) * TAU + spin;
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); blit(img, 10 + 200 * 0.16, 110, 0, 0, 1); ctx.restore();
        }
        ctx.strokeStyle = lg(cx - 60, cy - 60, cx + 60, cy + 60, [[0, '#E6B070'], [1, '#6A3A16']]); ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(cx, cy, 50, 0, TAU); ctx.stroke();
        blit(sealImg(), 110, 110, cx, cy + 4, 0.75);
        ink(0, lerp(60, -1300, eio(seg(lt, 0, 0.75))), lt, 12, 1.2);
        // rewind chevrons
        const cp = 0.6 + 0.4 * Math.sin(lt * 10);
        ctx.fillStyle = `rgba(224,138,78,${cp})`; for (const ox of [-10, 50]) { poly([[540 - ox, 150], [540 - ox - 54, 180], [540 - ox, 210]]); ctx.fill(); }
        tag('WHO ERASED THEM?', 540, 1268, 56, seg(lt, tS, tS + 0.22));
      } });
  }

  // c10 finale: the giant dripping pen over the whole tableau, a drop falls on "pen", AAZHI
  {
    const hit = Wd('pen', 8) - t10, fall = 0.36;
    cue(t10, 'swell', { gain: 0.5, dur: 2 }); cue(t10 + 0.05, 'rumble', { gain: 0.35, dur: 1.5 }); cue(t10 + 0.15, 'thud', { gain: 0.5 }); cue(t10 + hit - fall, 'gulp', { gain: 0.35 }); cue(t10 + hit, 'plop', { gain: 0.8 }); cue(t10 + hit + 0.02, 'slam', { gain: 0.45 }); cue(t10 + hit + 0.55, 'bell', { gain: 0.5 });
    add({ id: 'c10', at: t10, cam: [540, 760], zoom: 0.08, note: 'giant pen hovers over the tableau, drop falls on "pen" and spreads; WHO HELD THE PEN?, AAZHI',
      draw(lt, d) {
        bg(lt + 27);
        blit(monkDone('cJdone', jainPlate, jainRel, JAIN_D), PLW / 2, PLH / 2, 200, 840 + Math.sin(lt) * 5, 0.42);
        blit(monkDone('cBdone', buddPlate, buddRel, BUDD_D), PLW / 2, PLH / 2, 880, 840 + Math.sin(lt + 1) * 5, 0.42);
        for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(390, 880); ctx.rotate(-0.35 + i * 0.35 + Math.sin(lt * 1.3 + i) * 0.03); blit(smallPlate('cRp' + i, 460, 200, 4, 80 + i, i % 2 ? 0.4 : 0.1), 42, 110, 0, 0, 0.78); ctx.restore(); }
        ctx.strokeStyle = lg(350, 840, 430, 920, [[0, '#E6B070'], [1, '#6A3A16']]); ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(390, 880, 36, 0, TAU); ctx.stroke();
        // pen hovers in
        const tipX = 560 + Math.sin(lt * 1.4) * 14, tipY = lerp(-120, 560, eo(seg(lt, 0, 0.7))) + Math.sin(lt * 2.2) * 10;
        K.glow(tipX, tipY + 300, 420, '74,106,138', 0.12);
        // the ink splash (spreads after the hit)
        if (lt > hit) {
          const a = lt - hit, r = 40 + 250 * eo(clamp(a / 1.2)) + a * 40, hx = 560, hy = 880;
          ctx.beginPath(); for (let i = 0; i <= 48; i++) { const an = (i / 48) * TAU, rr = r * (1 + 0.08 * Math.sin(an * 5 + lt * 3) + 0.04 * Math.sin(an * 11 - lt * 4)); ctx.lineTo(hx + Math.cos(an) * rr, hy + Math.sin(an) * rr * 0.62); }
          ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); ctx.strokeStyle = INKE; ctx.lineWidth = 5; ctx.stroke();
          ctx.strokeStyle = `rgba(255,210,166,${0.5 * (1 - clamp(a / 0.8))})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx, hy, r * 1.25, r * 0.78, 0, 0, TAU); ctx.stroke();
          ctx.fillStyle = INK; for (let i = 0; i < 12; i++) { const an = -Math.PI * (0.1 + rnd(i) * 0.8), v = 300 + rnd(i * 2) * 400, x = hx + Math.cos(an) * v * a * (i % 2 ? 1 : -1), y = hy + Math.sin(an) * v * a + 1600 * a * a; if (y < hy + 60) { ctx.beginPath(); ctx.arc(x, y, 5 + rnd(i) * 8, 0, TAU); ctx.fill(); } }
        }
        pen(tipX, tipY, 0.05 + Math.sin(lt * 1.1) * 0.03, 1.5);
        // the drop: swells at the nib, falls onto the plates on "pen"
        if (lt < hit - fall) { const g = seg(lt, 0.5, hit - fall); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(tipX, tipY + 8 + g * 14, 6 + g * 14, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,190,140,0.55)'; ctx.lineWidth = 2; ctx.stroke(); }
        else if (lt < hit) { const f = (lt - (hit - fall)) / fall, y = lerp(tipY + 22, 880, f * f); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(lerp(tipX, 560, f), y, 18, 24 + f * 10, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,190,140,0.6)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = INKE; ctx.beginPath(); ctx.arc(lerp(tipX, 560, f) - 6, y - 8, 5, 0, TAU); ctx.fill(); }
        else { const g = seg(lt, hit + 0.2, d); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(tipX, tipY + 6 + g * 10, 5 + g * 9, 0, TAU); ctx.fill(); }
        tag('WHO HELD THE PEN?', 540, 1150, 64, seg(lt, 0.12, 0.34));
        // AAZHI mark stamped into a small copper bar
        const ak = seg(lt, hit + 0.5, hit + 0.75);
        if (ak > 0) { ctx.save(); ctx.translate(540, 1262); const s = lerp(1.4, 1.3, eo(ak)); ctx.scale(s, s); ctx.globalAlpha = clamp(ak * 3);
          ctx.fillStyle = lg(-110, -26, 110, 26, [[0, '#E08A4E'], [0.45, '#B4552A'], [1, '#6E2E14']]); ctx.beginPath(); ctx.roundRect(-110, -27, 220, 54, 8); ctx.fill(); ctx.strokeStyle = 'rgba(255,210,166,0.6)'; ctx.lineWidth = 2; ctx.stroke();
          ctx.font = '700 36px Caladea'; ctx.letterSpacing = '10px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(255,230,200,0.8)'; ctx.fillText('AAZHI', 6.5, 4.5); ctx.fillStyle = '#2A0E04'; ctx.fillText('AAZHI', 5, 2);
          ctx.letterSpacing = '0px'; ctx.restore(); }
        dust(lt, 24, 13, '170,190,220', 0.3);
      } });
  }
}
