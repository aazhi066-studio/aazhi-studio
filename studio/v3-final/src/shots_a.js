// EPISODE 3 · worker A : night fleet, palm-leaf sea chart, helm at dawn, burning harbour, inscription slab + shackled shadow
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import * as K from './core/kit.js';
import * as A from './art.js';
const { P } = K;
const { lg, poly, fillP } = A;

const blob = (pts) => {   // smooth closed shape through points
  const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  ctx.beginPath(); const m0 = mid(pts[n - 1], pts[0]); ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
  ctx.closePath();
};

// ───────────── a generic oared sailing ship in silhouette (no real Chola ship survives). (x, y) = waterline centre, faces right ─────────────
function boat(x, y, s, t, ph, o = {}) {
  const col = o.col || '#050B14', dir = o.dir || 1;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.3 + ph) * 4 * s); ctx.scale(s * dir, s); ctx.rotate(Math.sin(t * 1.1 + ph) * 0.02);
  for (let i = 0; i < 7; i++) { const ox = -120 + i * 38, st = Math.sin(t * 2.2 + ph + i * 0.35) * 16; line([[ox, -10], [ox - 44 + st, 66]], col, 6); }
  line([[10, -20], [10, -335]], col, 9); line([[-30, -300], [170, -310]], col, 6);
  const sw = Math.sin(t * 0.9 + ph) * 8;
  ctx.beginPath(); ctx.moveTo(16, -300); ctx.quadraticCurveTo(110 + sw, -250, 158, -118); ctx.lineTo(16, -100); ctx.closePath();
  ctx.fillStyle = lg(16, 0, 160, 0, [[0, '#0B1624'], [1, o.sail || '#233650']]); ctx.fill();
  ctx.beginPath(); ctx.moveTo(4, -255); ctx.quadraticCurveTo(-50 - sw, -210, -96, -118); ctx.lineTo(4, -112); ctx.closePath(); ctx.fillStyle = '#0B1624'; ctx.fill();
  if (o.pennant) { line([[10, -335], [10, -380]], col, 6); const f = Math.sin(t * 5 + ph) * 8; fillP([[12, -378], [96, -366 + f], [60, -356], [100, -344 - f], [12, -336]], P.kumkum); }
  ctx.beginPath(); ctx.moveTo(-205, -112); ctx.bezierCurveTo(-198, -20, -120, 28, 0, 30); ctx.bezierCurveTo(120, 28, 195, -10, 240, -118);
  ctx.bezierCurveTo(185, -72, 120, -50, 60, -46); ctx.lineTo(-150, -46); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  line([[-196, -100], [-196, -168]], col, 7); line([[10, -340], [10, -352]], col, 4);
  if (o.lit !== 0) for (const [lx, ly] of [[-196, -182], [10, -330]]) {
    const fl = 0.85 + 0.15 * Math.sin(t * 9 + lx + ph); K.glow(lx, ly, 120, '255,170,70', 0.55 * fl); circle(lx, ly, 7, '#FFE2A0');
    if (o.refl) for (let j = 0; j < 6; j++) ell(lx + Math.sin(t * 3 + j + lx) * 7, 46 + j * 14 + (ly > -250 ? 0 : 18), 26 - j * 3, 3.4, `rgba(255,170,70,${0.4 - j * 0.06})`);
  }
  ctx.restore();
}
function wake(x, y, s, t, a = 0.35) {
  const sx = x - 200 * s;
  ctx.beginPath(); ctx.moveTo(sx, y + 14 * s); ctx.lineTo(sx - 620 * s, y - 14 * s); ctx.lineTo(sx - 620 * s, y + 58 * s); ctx.closePath();
  ctx.fillStyle = lg(sx, 0, sx - 620 * s, 0, [[0, `rgba(170,215,235,${a})`], [1, 'rgba(170,215,235,0)']]); ctx.fill();
  for (let i = 0; i < 9; i++) { const k = (i + (t * 0.35) % 1) / 9; ell(sx - k * 560 * s, y + 24 * s + k * 10 * s, (26 + k * 40) * s, 5 * s, `rgba(200,232,246,${a * 0.7 * (1 - k)})`); }
}

// ─────────────────────────── A1 night sea ───────────────────────────
const HZ1 = 700;
function nightSea(lt, t) {
  ctx.fillStyle = lg(0, -300, 0, HZ1, [[0, '#02050F'], [0.55, '#07152B'], [1, '#1A3C52']]); ctx.fillRect(-300, -300, W + 600, HZ1 + 300);
  K.glow(300, 260, 520, '110,140,190', 0.13); K.glow(540, HZ1, 650, '90,140,170', 0.22);
  const cx = 780, cy = 60;                                      // the sky turns slowly about one pole
  for (let i = 0; i < 190; i++) {
    const a = rnd(i) * TAU + t * 0.018, r = Math.pow(rnd(i * 3 + 1), 0.7) * 1500, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (y > HZ1 - 8 || x < -20 || x > W + 20) continue;
    const tw = 0.5 + 0.5 * Math.sin(t * (1 + rnd(i + 4) * 2) + i), sz = 1 + rnd(i + 9) * 2.1;
    ctx.fillStyle = `rgba(255,238,205,${(0.35 + rnd(i + 2) * 0.65) * (0.55 + 0.45 * tw)})`; ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = lg(0, HZ1, 0, H, [[0, '#123248'], [0.3, '#07202F'], [1, '#02080F']]); ctx.fillRect(-300, HZ1, W + 600, H + 300 - HZ1);
  for (let r = 1; r <= 26; r++) {
    const u = r / 26, y = HZ1 + u * u * 1150 + 6, amp = 2 + u * 14;
    ctx.beginPath(); for (let x = -40; x <= W + 40; x += 24) { const yy = y + Math.sin(x * (0.02 / (0.3 + u)) + t * 1.2 * (0.5 + u) + r * 2) * amp; x === -40 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
    ctx.strokeStyle = `rgba(156,200,224,${0.06 + u * 0.12})`; ctx.lineWidth = 1 + u * 3; ctx.stroke();
  }
}
const FLEET = [[900, 840, 0.4], [770, 930, 0.52], [640, 1060, 0.7], [470, 1230, 0.92], [300, 1450, 1.2]];

// ─────────────────────────── A2 palm-leaf chart ───────────────────────────
const COAST = [[80, 250], [330, 250], [318, 470], [286, 650], [258, 790], [222, 900], [180, 975], [130, 1010], [80, 1010]];
const MALAY = [[1000, 250], [885, 250], [858, 420], [822, 560], [836, 700], [880, 810], [935, 900], [1000, 940]];
const SUMATRA = [[632, 1012], [700, 1040], [812, 1120], [925, 1215], [1000, 1280], [1000, 1420], [930, 1430], [820, 1350], [715, 1235], [655, 1110]];
const ROUTE2 = [[262, 850], [380, 905], [500, 990], [600, 1085], [690, 1160], [790, 1240], [872, 1300]];
function chartLeaf() {
  ctx.fillStyle = '#150B06'; ctx.fillRect(-300, -300, W + 600, H + 600); K.glow(540, 860, 900, '255,150,60', 0.3);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; rr(60, 190, 960, 1330, 30); ctx.fillStyle = lg(0, 190, 0, 1520, [[0, P.leafLight], [0.5, P.leaf], [1, P.leafDark]]); ctx.fill(); ctx.restore();
  ctx.save(); rr(60, 190, 960, 1330, 30); ctx.clip(); ctx.strokeStyle = 'rgba(110,70,30,0.3)'; ctx.lineWidth = 2;
  for (let x = 68; x < 1020; x += 9) { ctx.beginPath(); ctx.moveTo(x + (rnd(x) - 0.5) * 2, 190); ctx.lineTo(x, 1520); ctx.stroke(); } ctx.restore();
  for (const y of [250, 1460]) for (const x of [140, 940]) { circle(x, y, 17, P.night); circle(x, y, 17, 'rgba(0,0,0,0)'); }
  for (const x of [140, 940]) { line([[x, 250], [x, 1460]], P.cord, 7); }
  ctx.save(); ctx.globalAlpha = 0.62; rr(110, 290, 860, 1130, 14); ctx.fillStyle = P.sea; ctx.fill(); ctx.restore();
  ctx.save(); rr(110, 290, 860, 1130, 14); ctx.clip();
  ctx.strokeStyle = 'rgba(60,34,12,0.2)'; ctx.lineWidth = 2; for (let x = 110; x <= 970; x += 107.5) { ctx.beginPath(); ctx.moveTo(x, 290); ctx.lineTo(x, 1420); ctx.stroke(); } for (let y = 290; y <= 1420; y += 113) { ctx.beginPath(); ctx.moveTo(110, y); ctx.lineTo(970, y); ctx.stroke(); }
  const land = (pts, fillc, smooth = true) => { smooth ? blob(pts) : poly(pts); ctx.fillStyle = fillc; ctx.fill(); ctx.strokeStyle = P.leafDark; ctx.lineWidth = 5; ctx.stroke(); };
  land(COAST.map(([x, y]) => [x - (x < 100 ? 80 : 0), y - (y < 260 ? 80 : 0)]), '#E7C27A'); land(MALAY.map(([x, y]) => [x + (x > 990 ? 80 : 0), y - (y < 260 ? 80 : 0)]), '#E7C27A');
  land(SUMATRA.map(([x, y]) => [x + (x > 990 ? 80 : 0), y + (y > 1410 ? 60 : 0)]), '#F0C75E');
  blob(K.landPts(335, 1135, 56, 82, 2.4, 24)); ctx.fillStyle = '#E7C27A'; ctx.fill(); ctx.strokeStyle = P.leafDark; ctx.lineWidth = 5; ctx.stroke();
  for (const [x, y, r] of [[560, 800, 11], [572, 850, 9], [586, 905, 12], [598, 955, 8]]) { ell(x, y, r, r * 1.6, '#E7C27A'); }
  ctx.restore();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.strokeRect(110, 290, 860, 1130); ctx.lineWidth = 2; ctx.strokeRect(122, 302, 836, 1106);
}
function compassRose(x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); circle(0, 0, r, 'rgba(36,18,10,0.18)');
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8, ln = i % 2 ? r * 0.6 : r; ctx.save(); ctx.rotate(a); fillP([[-r * 0.13, 0], [0, -ln], [r * 0.13, 0]], i === 0 ? P.kumkum : P.ink); ctx.restore(); }
  circle(0, 0, r * 0.12, P.gold); ctx.restore();
}
function miniBoat(x, y, a, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2) * 0.05); ctx.scale(0.4, 0.4);
  ctx.save(); ctx.shadowColor = 'rgba(255,200,100,0.9)'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.moveTo(-70, -10); ctx.bezierCurveTo(-60, 28, 50, 28, 76, -26); ctx.bezierCurveTo(40, -2, -30, -2, -70, -10); ctx.fillStyle = P.night; ctx.fill(); ctx.restore();
  line([[0, -4], [0, -80]], P.night, 5); fillP([[3, -78], [44, -34], [3, -34]], P.cream); fillP([[3, -80], [40, -78], [3, -70]], P.kumkum); ctx.restore();
}

// ─────────────────────────── A3 helm at dawn ───────────────────────────
const HZ3 = 940;
function dawn(lt, t) {
  ctx.fillStyle = lg(0, -300, 0, HZ3, [[0, '#1A1233'], [0.4, '#6C3550'], [0.72, '#E4803F'], [1, '#FFD27A']]); ctx.fillRect(-300, -300, W + 600, HZ3 + 300);
  A.stars(t, 40, 0.5, 520, 7);
  K.glow(620, HZ3, 760, '255,190,100', 0.8); circle(620, HZ3 + 10, 118, '#FFF1BE');
  ctx.fillStyle = lg(0, HZ3, 0, 1160, [[0, '#B8663F'], [0.35, '#5E3A3C'], [1, '#17323F']]); ctx.fillRect(-300, HZ3, W + 600, 700);
  for (let i = 0; i < 34; i++) { const u = i / 34, y = HZ3 + 6 + u * u * 230, w = 150 * (1 - u * 0.4) * (0.5 + 0.5 * Math.sin(t * 1.4 + i * 1.7)); ell(620 + Math.sin(t + i) * 16, y, Math.max(6, w), 2 + u * 4, `rgba(255,224,150,${0.7 - u * 0.4})`); }
  A.haze(HZ3 - 80, HZ3 + 40, '#FFC27A', 0, 0.35);
}
function starCompass(x, y, R, rot) {
  ctx.save(); ctx.translate(x, y); K.glow(0, 0, R * 1.3, '255,190,90', 0.28); ctx.scale(1, 0.36);
  circle(0, 0, R * 1.04, '#2A1608'); ctx.lineWidth = 12; ctx.strokeStyle = P.gold; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = P.goldDark; ctx.beginPath(); ctx.arc(0, 0, R * 0.72, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, R * 0.46, 0, TAU); ctx.stroke();
  ctx.rotate(rot);
  for (let i = 0; i < 32; i++) { const a = i * TAU / 32, big = i % 4 === 0; ctx.save(); ctx.rotate(a); line([[0, -R * (big ? 0.78 : 0.86)], [0, -R * 0.96]], P.cream, big ? 8 : 4); if (big) circle(0, -R * 0.64, 12, P.gold); ctx.restore(); }
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8, ln = i % 2 ? R * 0.52 : R * 0.7; ctx.save(); ctx.rotate(a); fillP([[-R * 0.07, 0], [0, -ln], [R * 0.07, 0]], i === 0 ? P.kumkum : P.gold); fillP([[0, 0], [0, -ln], [R * 0.07, 0]], i === 0 ? '#7A1A1E' : P.goldDark); ctx.restore(); }
  circle(0, 0, R * 0.07, P.cream); ctx.restore();
}
function emperorSeal(x, y, r, t) {
  ctx.save(); ctx.translate(x, y); K.glow(0, 0, r * 2.4, '255,190,90', 0.5);
  circle(0, 0, r * 1.02, P.goldDark); circle(0, 0, r, lg(-r, -r, r, r, [[0, '#F5D58E'], [0.5, P.gold], [1, P.goldDark]]));
  ctx.strokeStyle = P.goldDark; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, r * 0.84, 0, TAU); ctx.stroke();
  for (let i = 0; i < 24; i++) { const a = i * TAU / 24; circle(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92, r * 0.025, P.goldDark); }
  for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i * TAU / 12); ell(0, -r * 0.5, r * 0.09, r * 0.26, P.goldDark); ctx.restore(); }
  circle(0, 0, r * 0.3, '#F5D58E'); circle(0, 0, r * 0.18, P.kumkum); circle(0, 0, r * 0.07, P.gold); ctx.restore();
}

// ─────────────────────────── A4 burning harbour ───────────────────────────
const HZ4 = 1010;
function tierRoof(cx, y, w, h, col) {   // one upswept palm-thatch tier
  ctx.beginPath(); ctx.moveTo(cx - w / 2 - 34, y - 26); ctx.quadraticCurveTo(cx - w / 2 - 6, y + 6, cx - w / 2 + 10, y + 8); ctx.lineTo(cx + w / 2 - 10, y + 8);
  ctx.quadraticCurveTo(cx + w / 2 + 6, y + 6, cx + w / 2 + 34, y - 26); ctx.lineTo(cx + w / 2 - 36, y - h); ctx.lineTo(cx - w / 2 + 36, y - h); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
function hall(cx, base, w, tiers, col, t, fire, seed) {
  const bh = 110;
  ctx.fillStyle = col; ctx.fillRect(cx - w / 2 + 10, base - bh, w - 20, bh);
  for (let i = 0; i < 6; i++) ctx.fillRect(cx - w / 2 + 14 + i * (w - 40) / 5, base, 10, 70);
  ctx.fillStyle = 'rgba(255,140,50,0.8)'; for (let i = 0; i < 3; i++) ctx.fillRect(cx - w * 0.3 + i * w * 0.3 - 10, base - 80, 20, 52);
  let y = base - bh, ww = w + 40, topy = y;
  for (let i = 0; i < tiers; i++) { tierRoof(cx, y, ww, 70, col); topy = y - 70; y -= 70; ww *= 0.66; }
  line([[cx, topy], [cx, topy - 60]], col, 8);
  if (fire) for (let i = 0; i < fire; i++) { const fx = cx + (i - (fire - 1) / 2) * w * 0.26, fy = base - bh - 40 - (i % 2) * 70; K.glow(fx, fy - 30, 150, '255,120,30', 0.5); K.flame(fx, fy + 30, 0.8 + (i % 2) * 0.3, t, seed + i); }
}
function stupa(cx, base, s, col) {
  ctx.save(); ctx.translate(cx, base); ctx.scale(s, s);
  rr(-120, -50, 240, 50, 4); ctx.fillStyle = col; ctx.fill(); rr(-94, -96, 188, 46, 4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-80, -96); ctx.bezierCurveTo(-90, -240, 90, -240, 80, -96); ctx.closePath(); ctx.fill();
  rr(-24, -290, 48, 56, 3); ctx.fill(); for (let i = 0; i < 5; i++) { const w = 74 - i * 12; rr(-w / 2, -312 - i * 22, w, 11, 4); ctx.fill(); }
  line([[0, -420], [0, -470]], col, 6); ctx.restore();
}
function palace(t) {
  const SILC = '#0E0503';
  // shore line and mud bank
  ctx.fillStyle = '#120806'; ctx.fillRect(-300, HZ4 - 30, W + 600, 70);
  for (let i = 0; i < 9; i++) { const hx = 40 + i * 125 + (i % 2) * 20; ctx.fillStyle = SILC; ctx.fillRect(hx, HZ4 - 62, 66, 38); fillP([[hx - 12, HZ4 - 60], [hx + 33, HZ4 - 108], [hx + 78, HZ4 - 60]], SILC); for (const k of [8, 54]) ctx.fillRect(hx + k, HZ4 - 26, 5, 38); if (i % 3 === 1) K.flame(hx + 33, HZ4 - 100, 0.5, t, i); }
  hall(300, HZ4 - 20, 460, 3, SILC, t, 4, 1);          // palace
  stupa(790, HZ4 - 20, 0.9, SILC);                     // monastery stupa
  hall(930, HZ4 - 20, 250, 2, SILC, t, 3, 9);          // monastery hall
  K.glow(790, HZ4 - 330, 320, '255,120,30', 0.4);
}

// ─────────────────────────── A5 inscription slab + shadow ───────────────────────────
function wallBlocks() {
  ctx.fillStyle = '#1B0F08'; ctx.fillRect(-300, -300, W + 600, H + 600);
  for (let r = 0; r < 17; r++) { const y = -20 + r * 128, off = (r % 2) * 120; for (let c = -1; c < 6; c++) { const x = c * 240 + off, v = rnd(r * 7 + c); rr(x + 4, y + 4, 232, 120, 5); ctx.fillStyle = `rgba(${70 + v * 40},${48 + v * 28},${30 + v * 16},0.55)`; ctx.fill(); } }
}
const SLAB = { x0: 150, x1: 560, top: 400, bot: 1400 };
function slabPath() { const { x0, x1, top, bot } = SLAB; ctx.beginPath(); ctx.moveTo(x0, bot); ctx.lineTo(x0, top + 170); ctx.quadraticCurveTo(x0, top, (x0 + x1) / 2, top); ctx.quadraticCurveTo(x1, top, x1, top + 170); ctx.lineTo(x1, bot); ctx.closePath(); }
function slab(p, t) {
  const { x0, x1, bot } = SLAB;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetX = 14; slabPath(); ctx.fillStyle = lg(x0, 0, x1, 0, [[0, '#B09474'], [0.5, '#8C7A62'], [1, '#5B4B3A']]); ctx.fill(); ctx.restore();
  ctx.save(); slabPath(); ctx.clip();
  slabPath(); ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(40,22,10,0.55)'; ctx.stroke();
  const n = 15, shown = p * n;
  for (let i = 0; i < n; i++) {
    const y = 640 + i * 48, a = clamp(shown - i); if (a <= 0) continue; let x = 205; const lim = 205 + 300 * (i === n - 1 ? 0.5 : 1) * a; let k = 0;
    while (x < lim - 6) { const l = 14 + rnd(i * 31 + k) * 34, e = Math.min(x + l, lim); line([[x, y + 2], [e, y + 2]], 'rgba(235,210,160,0.35)', 4); line([[x, y], [e, y]], 'rgba(30,16,8,0.85)', 5); x = e + 7 + rnd(i * 17 + k) * 9; k++; }
  }
  ctx.strokeStyle = 'rgba(30,16,8,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(205, 560); ctx.lineTo(505, 560); ctx.stroke();
  ctx.restore();
  rr(x0 - 26, bot - 6, x1 - x0 + 52, 46, 6); ctx.fillStyle = '#5B4B3A'; ctx.fill();
}
function captive(x, y, h, t, col) {   // a shackled figure's shadow, head bowed toward the slab (left)
  const sw = Math.sin(t * 0.8) * 2;
  ctx.save(); ctx.translate(x + sw, y); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const u = h / 900;
  line([[-34 * u, -250 * u], [-44 * u, 0]], col, 74 * u); line([[40 * u, -250 * u], [50 * u, 0]], col, 70 * u);
  fillP([[-96 * u, -330 * u], [100 * u, -330 * u], [118 * u, -80 * u], [-110 * u, -80 * u]], col);        // cloth to the knee
  fillP([[-104 * u, -590 * u], [-62 * u, -652 * u], [68 * u, -652 * u], [106 * u, -590 * u], [98 * u, -330 * u], [-98 * u, -330 * u]], col);           // torso
  ell(-40 * u, -792 * u, 54 * u, 62 * u, col);                                                                // head, bowed
  rr(-62 * u, -780 * u, 80 * u, 150 * u, 20 * u); ctx.fillStyle = col; ctx.fill();                          // neck
  fillP([[-86 * u, -838 * u], [-4 * u, -838 * u], [-18 * u, -910 * u], [-72 * u, -910 * u]], col); circle(-45 * u, -918 * u, 12 * u, col); rr(-96 * u, -846 * u, 100 * u, 20 * u, 5 * u); ctx.fill();   // a plain crown shape
  line([[-80 * u, -620 * u], [-140 * u, -470 * u], [-96 * u, -392 * u]], col, 54 * u); line([[80 * u, -620 * u], [56 * u, -470 * u], [-70 * u, -392 * u]], col, 50 * u);   // arms, wrists together
  ctx.lineWidth = 9 * u; for (const [a, b] of [[-98 * u, -388 * u], [-70 * u, -388 * u]]) { ctx.beginPath(); ctx.arc(a, b, 24 * u, 0, TAU); ctx.stroke(); }
  // chain from the wrists to the ankle irons, links along a sagging curve
  const ch = (p0, c, p1) => { for (let i = 0; i <= 12; i++) { const k = i / 12, px = (1 - k) * (1 - k) * p0[0] + 2 * (1 - k) * k * c[0] + k * k * p1[0], py = (1 - k) * (1 - k) * p0[1] + 2 * (1 - k) * k * c[1] + k * k * p1[1]; ctx.save(); ctx.translate(px, py); ctx.rotate(i * 0.9); ctx.lineWidth = 8 * u; ctx.beginPath(); ctx.ellipse(0, 0, 18 * u, 9 * u, 0, 0, TAU); ctx.stroke(); ctx.restore(); } };
  ch([-84 * u, -380 * u], [-150 * u, -190 * u], [-52 * u, -30 * u]);
  ch([-52 * u, -14 * u], [0, 30 * u], [52 * u, -14 * u]);
  for (const ax of [-46 * u, 50 * u]) { ctx.lineWidth = 12 * u; ctx.beginPath(); ctx.ellipse(ax, -14 * u, 34 * u, 15 * u, 0, 0, TAU); ctx.stroke(); }
  ell(-60 * u, 20 * u, 62 * u, 20 * u, col); ell(62 * u, 20 * u, 62 * u, 20 * u, col);   // feet
  ctx.restore();
}

export function buildA(add, cue) {
  const a1 = 0, a2 = L(1) - 0.1, a3 = L(2) - 0.1, a4 = L(3) - 0.1, a5 = L(4) - 0.1;

  // ───────── A1 : the fleet by night, camera low over the water ─────────
  add({ id: 'A1', at: a1, cam: [540, 1180], zoom: 0.09, note: 'night sea, rotating star dome, file of lantern ships with wakes, 1025 CE plate', draw(lt, d, t) {
    nightSea(lt, t);
    const dx = lt * 16;
    FLEET.forEach(([x, y, s], i) => { const bx = x + dx * s * 1.4 - 60; wake(bx, y, s, t, 0.38); boat(bx, y, s, t, i * 1.7, { refl: true }); });
    A.haze(HZ1 - 30, HZ1 + 90, '#6AA0BA', 0, 0.18);
    const pw = eob(clamp((lt - (Wd('year', 0) - a1 - 0.1)) / 0.55));
    if (pw > 0) { K.glow(540, 330, 420, '255,190,90', 0.2 * pw); K.plaque('1025 CE', 540, 330, pw, 104); }
    K.vignette(0.6);
  } });
  cue(0.05, 'swell', { gain: 0.8 }); cue(0.5, 'rumble', { gain: 0.45, dur: 3.5 }); cue(Wd('year', 0) - 0.1, 'pop', { gain: 0.8 }); cue(Wd('year', 0) + 0.4, 'bell', { gain: 0.5 });

  // ───────── A2 : the palm-leaf chart, a dotted route sails to Sumatra ─────────
  add({ id: 'A2', at: a2, cam: [540, 900], zoom: 0.1, note: 'palm-leaf chart of the Bay of Bengal, route grows Tamil coast to Srivijaya', draw(lt, d, t) {
    chartLeaf();
    const rp = eio(clamp((lt - 0.35) / (d - 1.1)));
    const lab = (txt, x, y, size, rot = 0, a = 1) => { ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); K.label(txt, 0, 0, size, P.ink); ctx.restore(); };
    lab('TAMIL COAST', 175, 650, 30, -Math.PI / 2, eo(clamp(lt / 0.5)));
    lab('BAY OF BENGAL', 540, 700, 52, -0.05, eo(clamp((lt - 0.2) / 0.5)));
    ctx.save(); ctx.beginPath(); ctx.rect(110, 290, 860, 1130); ctx.clip(); const head = K.route(ROUTE2, rp); ctx.restore();
    miniBoat(head[0], head[1] - 10, head[2], t);
    circle(ROUTE2[0][0], ROUTE2[0][1], 11, P.kumkum);
    const sa = eob(clamp((lt - (Wd('Srivijaya', 1) - a2)) / 0.5));
    if (sa > 0) { ctx.save(); ctx.translate(808, 1262); ctx.rotate(0.55); ctx.scale(sa, sa); K.label('SRIVIJAYA', 0, 0, 40, P.ink); ctx.restore(); }
    compassRose(210, 1320, 78, Math.sin(t * 0.6) * 0.04);
    ctx.save(); ctx.globalAlpha = 0.85; K.label('STYLISED CHART, NOT TO SCALE', 540, 1462, 25, P.cream); ctx.restore();
    K.embers(t, 10, 5); K.vignette(0.5);
  } });
  cue(a2 + 0.1, 'whoosh', { gain: 0.7 }); cue(a2 + 0.9, 'sparkle', { gain: 0.5 }); cue(Wd('Srivijaya', 1) + 0.05, 'pop', { gain: 0.7 });

  // ───────── A3 : helm point of view, the star compass turns, the emperor's seal ─────────
  add({ id: 'A3', at: a3, cam: [540, 1150], zoom: 0.1, note: 'helm POV at dawn, turning star-compass, emperor seal and Rajendra Chola name band', draw(lt, d, t) {
    dawn(lt, t);
    // far fleet specks on the horizon
    for (let i = 0; i < 5; i++) boat(180 + i * 150 + lt * 5, HZ3 + 24 + (i % 2) * 8, 0.12 + (i % 2) * 0.03, t, i, { lit: 0, col: '#2A1520' });
    // foredeck: planks in perspective
    fillP([[-300, 1130], [W + 300, 1130], [W + 300, 2100], [-300, 2100]], '#2A150A');
    for (let i = -8; i <= 8; i++) fillP([[540 + i * 42, 1130], [540 + i * 42 + 40, 1130], [540 + i * 190 + 190, 2100], [540 + i * 190, 2100]], i % 2 ? '#3A1E0E' : '#321A0C');
    rr(-300, 1112, W + 600, 34, 6); ctx.fillStyle = lg(0, 1112, 0, 1146, [[0, '#E39A62'], [1, '#6E3A1E']]); ctx.fill();
    for (const px of [90, 350, 730, 990]) { rr(px - 17, 1000, 34, 140, 6); ctx.fillStyle = '#4A2410'; ctx.fill(); circle(px, 1000, 24, P.gold); }
    line([[1000, 1000], [1000, 780]], '#4A2410', 10); const fw = Math.sin(t * 5) * 14; fillP([[1004, 782], [1120, 802 + fw], [1070, 832], [1120, 862 - fw], [1004, 880]], P.kumkum);
    starCompass(540, 1480, 360, lt * 0.5 + 0.3);
    // steering oar
    line([[70, 1960], [240, 1160]], '#6E3A1E', 44); line([[70, 1960], [240, 1160]], '#B56A3C', 22); circle(70, 1960, 46, P.bronzeDark);
    // the seal and the name band
    const sp = eob(clamp(lt / 0.6));
    ctx.save(); ctx.translate(540, 0); ctx.rotate(Math.sin(t * 1.3) * 0.03); line([[0, -300], [0, 260 * sp]], P.cord, 8); emperorSeal(0, 330 * sp - 30 * (1 - sp), 128, t); ctx.restore();
    const np = eob(clamp((lt - (Wd('emperor', 2) - a3 - 0.05)) / 0.5));
    if (np > 0) {
      ctx.save(); ctx.translate(540, 665); ctx.scale(np, np); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
      fillP([[-470, 0], [-410, -92], [410, -92], [470, 0], [410, 92], [-410, 92]], P.umber); ctx.shadowColor = 'transparent';
      poly([[-470, 0], [-410, -92], [410, -92], [470, 0], [410, 92], [-410, 92]]); ctx.strokeStyle = P.gold; ctx.lineWidth = 7; ctx.stroke();
      poly([[-436, 0], [-398, -72], [398, -72], [436, 0], [398, 72], [-398, 72]]); ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3; ctx.stroke();
      K.tamil('ராஜேந்திர சோழன்', 0, -24, 66, P.gold); K.label('RAJENDRA CHOLA', 0, 36, 44, P.cream); ctx.restore();
    }
    K.vignette(0.45);
  } });
  cue(a3 + 0.1, 'swell', { gain: 0.7 }); cue(Wd('emperor', 2) - 0.05, 'pop', { gain: 0.7 }); cue(Wd('emperor', 2) + 0.2, 'sparkle', { gain: 0.5 });

  // ───────── A4 : the strike on Palembang ─────────
  add({ id: 'A4', at: a4, cam: [560, 1050], zoom: 0.11, note: 'burning palm-roof palace and monastery at the Palembang waterfront, ships arriving', draw(lt, d, t) {
    const k = lt / d;
    ctx.fillStyle = lg(0, -300, 0, HZ4, [[0, '#12070A'], [0.4, '#4E1612'], [0.75, '#B84A1E'], [1, '#F29A3A']]); ctx.fillRect(-300, -300, W + 600, HZ4 + 300);
    A.stars(t, 30, 0.3, 380, 3); K.glow(560, HZ4 - 200, 900, '255,110,30', 0.55);
    A.palm(-20, HZ4 - 10, 700, 0.12, 4, '#0A0403', t); A.palm(1090, HZ4 - 10, 800, -0.14, 6, '#0A0403', t);
    palace(t);
    A.smoke(300, HZ4 - 420, t, 8, '40,26,22', 0.5, 120, 620); A.smoke(930, HZ4 - 330, t, 7, '40,26,22', 0.45, 100, 560); A.smoke(790, HZ4 - 520, t + 3, 6, '50,34,28', 0.4, 90, 500);
    K.embers(t, 40, 11, '255,150,50');
    ctx.fillStyle = lg(0, HZ4, 0, H, [[0, '#C8501E'], [0.12, '#4E1E14'], [1, '#0B0506']]); ctx.fillRect(-300, HZ4, W + 600, H + 300 - HZ4);
    for (let i = 0; i < 26; i++) { const u = i / 26, y = HZ4 + 14 + u * u * 520, w = (90 + rnd(i) * 120) * (1 + u), x = 300 + (rnd(i * 3) - 0.5) * 300 + Math.sin(t * 1.5 + i) * 18; ell(x, y, w, 3 + u * 5, `rgba(255,140,50,${0.5 - u * 0.3})`); ell(x + 480, y, w * 0.8, 3 + u * 5, `rgba(255,120,40,${0.4 - u * 0.25})`); }
    const sx = 1280 - eo(clamp(k / 0.85)) * 560;
    wake(sx - 60, 1330, 1.05, t, 0.28); boat(sx, 1330, 1.05, t, 0.5, { dir: -1, pennant: true, col: '#0A0405', sail: '#6A2A1A', lit: 0 });
    const sx2 = -200 + eo(clamp((k - 0.05) / 0.85)) * 460;
    boat(sx2, 1140, 0.55, t, 2, { dir: 1, pennant: true, col: '#0A0405', sail: '#6A2A1A', lit: 0 });
    const pp = eob(clamp((lt - (Wd('Palembang', 3) - a4 - 0.1)) / 0.5));
    if (pp > 0) K.plaque('PALEMBANG', 540, 300, pp, 88);
    K.vignette(0.55);
  } });
  cue(a4 + 0.1, 'drum', { gain: 0.7 }); cue(a4 + 0.5, 'rumble', { gain: 0.6, dur: 3 }); cue(Wd('Palembang', 3) - 0.05, 'pop', { gain: 0.7 }); cue(Wd('monasteries', 3), 'swell', { gain: 0.6 });

  // ───────── A5 : the inscription and the shadow of the captive king ─────────
  add({ id: 'A5', at: a5, cam: [600, 900], zoom: 0.1, note: 'king taken prisoner per the inscription: carved slab (no real text) and a shackled shadow', draw(lt, d, t) {
    wallBlocks(); K.glow(520, 900, 1000, '255,150,60', 0.5);
    const p = eio(clamp((lt - 0.3) / (d - 1.4)));
    ctx.save(); ctx.globalAlpha = 0.0; ctx.restore();
    const sh = eo(clamp((lt - (Wd('king', 4) - a5 - 0.3)) / 1.0));
    ctx.save(); ctx.beginPath(); ctx.rect(400, 1420 - sh * 1500, 700, 1500); ctx.clip(); captive(790, 1400, 980, t, '#0A0503'); ctx.restore();
    slab(p, t);
    K.lamp(72, 1505, 0.5, t, 1);
    A.dust(t, 28, 2, '255,210,140', 0.5);
    const pw = eob(clamp((lt - 0.15) / 0.5)); if (pw > 0) K.plaque('THANJAVUR INSCRIPTION', 540, 250, pw, 56);
    K.vignette(0.6);
  } });
  for (const [dt, g] of [[0.5, 0.6], [1.3, 0.55], [2.1, 0.55], [2.9, 0.5]]) cue(a5 + dt, 'chisel', { gain: g });
  cue(Wd('prisoner', 4) - 0.1, 'rumble', { gain: 0.55, dur: 2 });
}
