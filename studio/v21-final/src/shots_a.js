// EPISODE 21 · worker A : "Gold Leaf & Sonar", lines 0-3 (t 0 -> L(4)). THE HOOK.
// a0 wave curl crashes over the gold-leaf harbour city (vermilion flash, flake burst) · a1 waterline wipe: towers turn
// into sonar dots · a2 ONE FESTIVAL? slams over vermilion festival banners · a3 gold-leaf map, PUHAR at the river mouth ·
// a4 KAVERI mouth close, ships sail in · a5 harbour skyline + fleet, glint · a6 EARLY CHOLAS gate tower leaf-lay ·
// a7 OLD EPICS SAY over the horizon fleet · a8 SHIPS · a9 WAREHOUSES · a10 TRADERS (faceless, ILLUSTRATION) ·
// a11 MANIMEKALAI: the bundle opens, abstract bars · a12 the light darkens, waterline rises, sonar sweep foreshadow.
// All shapes baked once with cached(); per frame only blits, clips, a few strokes and particles.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, poly, lg } from './art.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const GOLD = '233,196,106', GOLDHI = '247,226,160', VERM = '216,67,46', CYAN = '207,246,255', PHOS = '65,255,154';

// ───────────── shared helpers (copied exactly from ART.md) ─────────────
// indigo lacquer ground (cached)
function lacquerImg(key = 'lacq21') {
  return cached(key, W, H, 1, () => { const c = ctx;
    const g = c.createRadialGradient(540, 760, 120, 540, 960, 1300); g.addColorStop(0, '#1A2358'); g.addColorStop(0.55, '#10173E'); g.addColorStop(1, '#05071A');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(160,170,255,0.05)'; c.lineWidth = 1;
    for (let i = 0; i < 160; i++) { let x = rnd(i) * W, y = rnd(i + 7) * H; c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (rnd(i * 9 + k) - 0.5) * 90; y += (rnd(i * 5 + k + 3) - 0.5) * 90; c.lineTo(x, y); } c.stroke(); }
    const v = c.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  });
}
// sonar screen ground (cached): dark green + scanlines + faint grid rings around (540, 1250)
function sonarImg(key = 'sonar21') {
  return cached(key, W, H, 1, () => { const c = ctx;
    const g = c.createRadialGradient(540, 1000, 100, 540, 1000, 1300); g.addColorStop(0, '#08201A'); g.addColorStop(1, '#010604'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(65,255,154,0.08)'; c.lineWidth = 2; for (let r = 150; r < 1500; r += 150) { c.beginPath(); c.arc(540, 1250, r, 0, TAU); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 2);
  });
}
// gold-leaf fill for the current path (call after building a path): gradient + loose seam grid clipped to the path
function goldFill(x0, y0, x1, y1, seam = 26) { const c = ctx;
  const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#A8792B'); g.addColorStop(0.35, '#E9C46A'); g.addColorStop(0.55, '#F7E2A0'); g.addColorStop(1, '#B88A35');
  c.fillStyle = g; c.fill(); c.save(); c.clip(); c.strokeStyle = 'rgba(110,70,20,0.28)'; c.lineWidth = 1;
  for (let x = Math.floor(x0 / seam) * seam; x < x1; x += seam) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x + 3, y1); c.stroke(); }
  for (let y = Math.floor(y0 / seam) * seam; y < y1; y += seam) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y + 2); c.stroke(); }
  c.restore(); }
// the waterline at height y: fills below with col (alpha a) and strokes the crest; t = film time
function waterline(y, t, col = '6,20,40', a = 0.85, tilt = 0) { const c = ctx;
  c.beginPath(); c.moveTo(-60, H + 60);
  for (let x = -60; x <= W + 60; x += 20) c.lineTo(x, y + tilt * (x - 540) + Math.sin(x * 0.011 + t * 2.1) * 14 + Math.sin(x * 0.027 - t * 3.3) * 6);
  c.lineTo(W + 60, H + 60); c.closePath(); c.fillStyle = `rgba(${col},${a})`; c.fill();
  c.beginPath(); for (let x = -60; x <= W + 60; x += 20) { const yy = y + tilt * (x - 540) + Math.sin(x * 0.011 + t * 2.1) * 14 + Math.sin(x * 0.027 - t * 3.3) * 6; x < -50 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
  c.strokeStyle = 'rgba(207,246,255,0.9)'; c.lineWidth = 4; c.stroke(); }
// sonar sweep wedge from (x,y): angle ang (rad), radius r
function sweep(x, y, ang, r = 1400, a = 0.35) { const c = ctx; c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, ang - (k + 1) * 0.04, ang - k * 0.04); c.closePath(); c.fillStyle = `rgba(65,255,154,${a * (1 - k / 12) * 0.5})`; c.fill(); }
  c.restore(); }

// ───────────── small helpers ─────────────
const MC = document.createElement('canvas').getContext('2d');
const lacq = () => blit(lacquerImg(), 0, 0, 0, 0, 1);
const bez = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
/** wavy waterline y at x (same formula as waterline()) */
const wy = (x, y, t, tilt = 0) => y + tilt * (x - 540) + sin(x * 0.011 + t * 2.1) * 14 + sin(x * 0.027 - t * 3.3) * 6;
/** path of everything below the waterline (for clipping) */
function belowPath(y, t, tilt = 0) { ctx.beginPath(); ctx.moveTo(-400, H + 400); for (let x = -400; x <= W + 400; x += 20) ctx.lineTo(x, wy(x, y, t, tilt)); ctx.lineTo(W + 400, H + 400); ctx.closePath(); }
function abovePath(y, t, tilt = 0) { ctx.beginPath(); ctx.moveTo(-400, -400); for (let x = -400; x <= W + 400; x += 20) ctx.lineTo(x, wy(x, y, t, tilt)); ctx.lineTo(W + 400, -400); ctx.closePath(); }
/** crest stroke only */
function crest(y, t, tilt = 0, a = 0.9) { const c = ctx; c.beginPath(); for (let x = -400; x <= W + 400; x += 20) { const yy = wy(x, y, t, tilt); x === -400 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
  c.strokeStyle = `rgba(${CYAN},${a})`; c.lineWidth = 4; c.stroke(); glowLine(y, t, tilt, a); }
function glowLine(y, t, tilt, a) { const img = cached('aCrestGl', 64, 64, 1, () => { const g = ctx.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(207,246,255,0)'); g.addColorStop(0.5, 'rgba(207,246,255,1)'); g.addColorStop(1, 'rgba(207,246,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64); });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.25 * a; for (let x = -400; x < W + 400; x += 80) ctx.drawImage(img, x, wy(x + 40, y, t, tilt) - 30, 82, 60); ctx.restore(); }

/** additive glow from a cached sprite */
function glowS(x, y, r, col = GOLD, a = 0.6) {
  if (a <= 0 || r <= 0) return;
  const img = cached('aGl' + col, 128, 128, 1, () => { const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(0.3, `rgba(${col},0.38)`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128); });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= Math.min(1, a); ctx.drawImage(img, x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
const shake = (lt, t0, amp = 14) => { const d = lt - t0; if (d < 0 || d > 0.6) return [0, 0]; const k = Math.exp(-d * 8) * amp; return [sin(d * 90) * k, cos(d * 71) * k]; };

/** calm caption zone: plain dark ground from y 1255 down */
function calm(col = '5,7,26') {
  const g = ctx.createLinearGradient(0, 1230, 0, 1320); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},1)`);
  ctx.fillStyle = g; ctx.fillRect(-300, 1230, W + 600, 90); ctx.fillStyle = `rgb(${col})`; ctx.fillRect(-300, 1319, W + 600, 1200);
}

// ───────────── gold leaf building blocks (used inside cached()) ─────────────
/** gold-leaf polygon: gradient + seams, thin dark outline, chipped broken edge, a few lifted flakes */
function leafPoly(pts, seed = 1, seam = 26) {
  const c = ctx; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  poly(pts); goldFill(x0, y0, x1, y1, seam);
  c.save(); c.clip(); for (let i = 0; i < (x1 - x0) * (y1 - y0) / 9000; i++) { c.fillStyle = `rgba(255,244,200,${0.05 + rnd(seed + i) * 0.12})`; c.fillRect(Math.floor(lerp(x0, x1, rnd(seed + i * 3)) / seam) * seam, Math.floor(lerp(y0, y1, rnd(seed + i * 7)) / seam) * seam, seam, seam); } c.restore();
  poly(pts); c.strokeStyle = 'rgba(70,40,10,0.85)'; c.lineWidth = 2; c.stroke();
  chips(pts, seed);
}
function chips(pts, seed) { const c = ctx; let k = 0;
  for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length], len = Math.hypot(bx - ax, by - ay);
    for (let s = 0; s < len; s += 22) { k++; if (rnd(seed * 31 + k) > 0.45) continue; const f = s / len, x = lerp(ax, bx, f), y = lerp(ay, by, f), r = 2.5 + rnd(seed + k * 5) * 5, a = rnd(seed + k * 9) * TAU;
      c.save(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.moveTo(x + cos(a) * r, y + sin(a) * r); c.lineTo(x + cos(a + 2.2) * r, y + sin(a + 2.2) * r); c.lineTo(x + cos(a + 4.1) * r * 0.7, y + sin(a + 4.1) * r * 0.7); c.closePath(); c.fill(); c.restore();
      if (rnd(seed + k * 13) > 0.8) { c.save(); c.translate(x + (rnd(k) - 0.5) * 16, y - 6 - rnd(k + 2) * 10); c.rotate(rnd(k + 4) * 2); c.fillStyle = rnd(k + 6) > 0.5 ? '#F7E2A0' : '#C89A44'; c.fillRect(-3, -3, 6, 5); c.restore(); } } }
}
/** stepped gate tower (generic, not a real temple) with base centre (x, y) */
function tower(x, y, bw, h, tiers = 5, seed = 1) {
  const th = h * 0.8 / tiers; let w = bw, yy = y;
  for (let i = 0; i < tiers; i++) { const w2 = w * 0.84; leafPoly([[x - w / 2, yy], [x + w / 2, yy], [x + w2 / 2, yy - th], [x - w2 / 2, yy - th]], seed + i * 7, 22);
    ctx.fillStyle = 'rgba(20,14,40,0.55)'; for (let k = -1; k <= 1; k++) if (i < tiers - 1 || k === 0) { rr(x + k * w * 0.28 - 7, yy - th * 0.72, 14, th * 0.45, 7); ctx.fill(); }
    yy -= th; w = w2 * 0.92; }
  // barrel roof + finials
  ctx.beginPath(); ctx.moveTo(x - w * 0.7, yy); ctx.quadraticCurveTo(x, yy - h * 0.22, x + w * 0.7, yy); ctx.closePath(); goldFill(x - w, yy - h * 0.2, x + w, yy); ctx.strokeStyle = 'rgba(70,40,10,0.85)'; ctx.lineWidth = 2; ctx.stroke();
  for (const k of [-0.4, 0, 0.4]) leafPoly([[x + k * w - 6, yy - h * 0.1 - 2], [x + k * w + 6, yy - h * 0.1 - 2], [x + k * w, yy - h * 0.1 - 34]], seed + 50);
  if (h > 300) { ctx.fillStyle = '#1A1238'; rr(x - bw * 0.14, y - h * 0.18, bw * 0.28, h * 0.18, [bw * 0.14, bw * 0.14, 0, 0]); ctx.fill(); }
}
function warehouse(x, y, w, h, seed = 1) {
  leafPoly([[x, y], [x + w, y], [x + w, y - h], [x + w / 2, y - h - w * 0.28], [x, y - h]], seed, 24);
  ctx.fillStyle = 'rgba(20,14,40,0.6)'; rr(x + w * 0.36, y - h * 0.62, w * 0.28, h * 0.62, [10, 10, 0, 0]); ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,14,0.5)'; ctx.lineWidth = 3; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + 6, y - h + k * h / 4 - 10); ctx.lineTo(x + w * 0.3, y - h + k * h / 4 - 10); ctx.moveTo(x + w * 0.7, y - h + k * h / 4 - 10); ctx.lineTo(x + w - 6, y - h + k * h / 4 - 10); ctx.stroke(); }
}
function flagPole(x, y, h, seed = 1) { ctx.fillStyle = '#B88A35'; ctx.fillRect(x - 3, y - h, 6, h);
  ctx.beginPath(); ctx.moveTo(x + 3, y - h); ctx.lineTo(x + 70, y - h + 20); ctx.lineTo(x + 3, y - h + 44); ctx.closePath(); ctx.fillStyle = '#D8432E'; ctx.fill(); ctx.strokeStyle = 'rgba(60,10,5,0.8)'; ctx.lineWidth = 2; ctx.stroke(); }

// ───────────── cached pictures ─────────────
/** harbour city, W x 700, base line y = 660 */
function cityImg() { return cached('aCity', W, 700, 1, () => {
  warehouse(-20, 640, 170, 140, 3); warehouse(800, 650, 190, 150, 5); warehouse(960, 640, 160, 130, 9);
  tower(250, 650, 230, 470, 5, 11); tower(880, 640, 190, 380, 4, 21);
  warehouse(330, 655, 150, 120, 7); warehouse(620, 655, 150, 110, 13);
  tower(540, 660, 300, 620, 6, 31);
  flagPole(120, 520, 140); flagPole(705, 560, 170); flagPole(1010, 520, 120);
  leafPoly([[-20, 640], [W + 20, 640], [W + 20, 700], [-20, 700]], 41, 30);
  ctx.fillStyle = 'rgba(20,14,40,0.5)'; for (let x = 10; x < W; x += 90) ctx.fillRect(x, 662, 40, 10);
}); }
/** sonar-dot version of any cached canvas (edges bright, interior sparse) */
function dotsOf(key, src, step = 12) { return cached(key, src.width / src._q, src.height / src._q, 1, () => {
  const w = src.width, h = src.height, q = src._q, d = MC.canvas; d.width = w; d.height = h; MC.clearRect(0, 0, w, h); MC.drawImage(src, 0, 0);
  const px = MC.getImageData(0, 0, w, h).data, A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : px[(Math.floor(y) * w + Math.floor(x)) * 4 + 3];
  const s = step * q;
  for (let y = s / 2; y < h; y += s) for (let x = s / 2; x < w; x += s) { if (A(x, y) < 60) continue;
    const edge = A(x - s, y) < 60 || A(x + s, y) < 60 || A(x, y - s) < 60 || A(x, y + s) < 60, j = rnd(x * 0.37 + y * 1.13);
    if (!edge && j > 0.45) continue;
    ctx.fillStyle = edge ? `rgba(${PHOS},${0.75 + j * 0.25})` : `rgba(${PHOS},${0.25 + j * 0.3})`; const r = edge ? 3.2 : 2.2;
    ctx.fillRect(x / q - r, y / q - r, r * 2, r * 2); }
}); }
/** sonar dot layer: faint whole + bright returns trailing the sweep at angle ang from (sx, sy) */
function sonarDots(img, ox, oy, sx, sy, ang, base = 0.22) {
  blit(img, 0, 0, ox, oy, 1, base);
  for (let k = 0; k < 4; k++) { ctx.save(); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.arc(sx, sy, 2200, ang - (k + 1) * 0.35, ang - k * 0.35); ctx.closePath(); ctx.clip();
    blit(img, 0, 0, ox, oy, 1, 0.95 - k * 0.22); ctx.restore(); }
}
/** big breaking wave curl, facing left. 1400 x 1300, lip tip near local (250, 560) */
const WV = { o: [1400, 420], p: [[[1300, 150], [900, 40], [620, 90]], [[380, 130], [200, 260], [160, 470]], [[140, 600], [260, 650], [330, 560]], [[400, 480], [380, 380], [470, 360]], [[600, 330], [700, 460], [640, 620]], [[590, 760], [480, 900], [300, 1300]]] };
function wavePath(nSeg = 6) { const c = ctx; c.beginPath(); if (nSeg === 6) { c.moveTo(1400, 1300); c.lineTo(...WV.o); } else c.moveTo(...WV.o);
  for (let i = 0; i < nSeg; i++) c.bezierCurveTo(...WV.p[i][0], ...WV.p[i][1], ...WV.p[i][2]); if (nSeg === 6) c.closePath(); }
function waveImg() { return cached('aWave', 1400, 1300, 0.75, () => { const c = ctx;
  wavePath(); c.fillStyle = lg(0, 0, 0, 1300, [[0, '#1E4A8C'], [0.4, '#112B62'], [1, '#060F2C']]); c.fill();
  c.save(); wavePath(); c.clip();
  for (let r = 70; r < 1100; r += 55) { c.beginPath(); c.arc(470 + r * 0.25, 470 + r * 0.05, r, PI * 0.9, PI * 2.25); c.strokeStyle = `rgba(150,215,255,${0.22 - r / 6000})`; c.lineWidth = 3 + (r % 110 ? 0 : 3); c.stroke(); }
  for (let i = 0; i < 260; i++) { const x = rnd(i + 3) * 1400, y = rnd(i + 8) * 1300; c.fillStyle = `rgba(207,246,255,${0.04 + rnd(i) * 0.08})`; c.fillRect(x, y, 3, 3); }
  c.restore();
  // gold-leaf crest band along the back and lip
  wavePath(3); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#6E4A16'; c.lineWidth = 46; c.stroke();
  wavePath(3); c.strokeStyle = lg(200, 0, 1400, 600, [[0, '#F7E2A0'], [0.4, '#E9C46A'], [0.7, '#C89A44'], [1, '#A8792B']]); c.lineWidth = 36; c.stroke();
  wavePath(3); c.strokeStyle = 'rgba(207,246,255,0.95)'; c.lineWidth = 6; c.stroke();
  // leaf squares flaking off the lip
  let k = 0; for (let s = 0; s < 3; s++) { let p0 = s ? WV.p[s - 1][2] : WV.o; for (let i = 0; i < 18; i++) { const [x, y] = bez(p0, ...WV.p[s], i / 18); k++;
    for (let j = 0; j < 2; j++) { const sz = 8 + rnd(k * 3 + j) * 16; c.save(); c.translate(x + (rnd(k + j * 7) - 0.5) * 70, y - 10 - rnd(k * 5 + j) * 60); c.rotate(rnd(k + j) * 3);
      c.fillStyle = ['#F7E2A0', '#E9C46A', '#C89A44'][(k + j) % 3]; c.fillRect(-sz / 2, -sz / 2, sz, sz * 0.8); c.strokeStyle = 'rgba(70,40,10,0.6)'; c.lineWidth = 1; c.strokeRect(-sz / 2, -sz / 2, sz, sz * 0.8); c.restore(); } } }
}); }
/** gold sailing ship (eyeless prow), 380 x 380, waterline origin local (190, 300) */
function shipImg() { return cached('aShip', 380, 380, 1, () => {
  ctx.fillStyle = '#8A6424'; ctx.fillRect(186, 40, 8, 240); ctx.fillRect(296, 120, 6, 160);
  ctx.beginPath(); ctx.moveTo(60, 55); ctx.quadraticCurveTo(120, 50, 180, 56); ctx.quadraticCurveTo(205, 150, 180, 240); ctx.quadraticCurveTo(120, 232, 60, 240); ctx.quadraticCurveTo(85, 150, 60, 55); ctx.closePath(); goldFill(60, 50, 210, 245, 20); ctx.strokeStyle = 'rgba(70,40,10,0.85)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(110,70,20,0.5)'; ctx.lineWidth = 3; for (const y of [100, 150, 200]) { ctx.beginPath(); ctx.moveTo(70, y); ctx.quadraticCurveTo(140, y + 6, 190, y); ctx.stroke(); }
  leafPoly([[230, 130], [292, 132], [296, 250], [222, 246]], 77, 18);
  // hull with raised prow (right) and stern (left)
  leafPoly([[10, 236], [60, 262], [320, 262], [372, 186], [356, 182], [330, 238], [40, 244], [22, 222]], 88, 20);
  leafPoly([[40, 262], [320, 262], [292, 312], [72, 312]], 99, 20);
  ctx.strokeStyle = 'rgba(70,40,10,0.7)'; ctx.lineWidth = 3; for (let x = 90; x < 300; x += 34) { ctx.beginPath(); ctx.moveTo(x, 290); ctx.lineTo(x - 22, 340); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(194, 40); ctx.lineTo(250, 54); ctx.lineTo(194, 68); ctx.closePath(); ctx.fillStyle = '#D8432E'; ctx.fill();
}); }
/** draw a ship rocking at (x,y) waterline, scale s */
function ship(x, y, s, t, ph = 0, a = 1) { ctx.save(); ctx.translate(x, y + sin(t * 2.2 + ph) * 6 * s); ctx.rotate(sin(t * 1.7 + ph) * 0.05); blit(shipImg(), 190, 300, 0, 0, s, a); ctx.restore(); }

/** gold-leaf title (text only, transparent) */
function goldText(text, size) {
  MC.font = `900 ${size}px Inter`; MC.letterSpacing = `${Math.round(size * 0.04)}px`; const tw = MC.measureText(text).width, w = Math.ceil(tw + size * 0.5), h = Math.ceil(size * 1.3);
  return cached(`aGT_${text}_${size}`, w, h, 1, () => { const c = ctx; c.font = `900 ${size}px Inter`; c.letterSpacing = `${Math.round(size * 0.04)}px`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const y = h / 2 + size * 0.04; c.lineJoin = 'round'; c.strokeStyle = '#2A1806'; c.lineWidth = size * 0.14; c.strokeText(text, w / 2, y);
    c.fillStyle = lg(0, y - size / 2, 0, y + size / 2, [[0, '#F7E2A0'], [0.45, '#E9C46A'], [0.7, '#C89A44'], [1, '#A8792B']]); c.fillText(text, w / 2, y);
    c.globalCompositeOperation = 'source-atop'; const sm = Math.max(10, size * 0.24); c.strokeStyle = 'rgba(110,70,20,0.4)'; c.lineWidth = 1;
    for (let x = 0; x < w; x += sm) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 3, h); c.stroke(); } for (let yy = 0; yy < h; yy += sm) { c.beginPath(); c.moveTo(0, yy); c.lineTo(w, yy + 2); c.stroke(); }
    for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(255,248,215,${0.1 + rnd(i + size) * 0.25})`; c.fillRect(Math.floor(rnd(i * 3 + 1) * w / sm) * sm, Math.floor(rnd(i * 7 + 2) * h / sm) * sm, sm, sm); }
    c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(rnd(i * 11 + size) * w, rnd(i * 13 + size) * h, 1.5 + rnd(i) * 3, 0, TAU); c.fill(); }
  });
}
/** gold title on an indigo lacquer plate */
function titleImg(text, size) { const t = goldText(text, size), w = t.width + size * 0.4, h = t.height + size * 0.2;
  return cached(`aTI_${text}_${size}`, w, h, 1, () => { const c = ctx;
    rr(4, 4, w - 8, h - 8, size * 0.12); c.fillStyle = 'rgba(8,11,38,0.82)'; c.fill(); c.strokeStyle = 'rgba(233,196,106,0.55)'; c.lineWidth = 2; c.stroke();
    rr(12, 12, w - 24, h - 24, size * 0.08); c.strokeStyle = 'rgba(233,196,106,0.18)'; c.stroke();
    c.drawImage(t, (w - t.width) / 2, (h - t.height) / 2); });
}
/** phosphor-green tag (sonar side / ILLUSTRATION) */
function greenTag(text, size) {
  MC.font = `900 ${size}px Inter`; MC.letterSpacing = `${Math.round(size * 0.12)}px`; const tw = MC.measureText(text).width, w = Math.ceil(tw + size * 1.2), h = Math.ceil(size * 1.7);
  return cached(`aGr_${text}_${size}`, w, h, 1, () => { const c = ctx; rr(2, 2, w - 4, h - 4, 6); c.fillStyle = 'rgba(2,14,9,0.85)'; c.fill(); c.strokeStyle = 'rgba(65,255,154,0.6)'; c.lineWidth = 2; c.stroke();
    c.font = `900 ${size}px Inter`; c.letterSpacing = `${Math.round(size * 0.12)}px`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.shadowColor = 'rgba(65,255,154,0.9)'; c.shadowBlur = size * 0.5; c.fillStyle = '#41FF9A'; c.fillText(text, w / 2 + size * 0.06, h / 2 + size * 0.05); c.shadowBlur = 0;
    c.fillStyle = 'rgba(0,0,0,0.3)'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1.5); });
}
/** title slamming in at t0 (scale 2 -> 1, jitter); before t0 nothing */
function slam(img, x, y, lt, t0, s0 = 1, a0 = 1) {
  const p = seg(lt, t0, t0 + 0.16); if (p <= 0) return; const st = lt - t0 - 0.16, j = st > 0 ? sin(st * 44) * Math.exp(-st * 10) * 7 : 0;
  const s = s0 * lerp(2.1, 1, eo(p)); glowS(x, y, img.width * 0.55 * s, GOLD, 0.12 * clamp(p * 2) * a0); blit(img, img.width / 2, img.height / 2, x, y + j, s, clamp(p * 2) * a0);
}

// ───────────── particles ─────────────
/** gold flakes bursting from (x,y) at local time t (seconds since burst), tumbling down */
function flakes(x, y, t, n = 30, seed = 1, spd = 650, up = 1.2, cols = null) { if (t < 0 || t > 2.2) return; const c = ctx;
  for (let i = 0; i < n; i++) { const life = 1.1 + rnd(seed + i * 7) * 1.0; if (t > life) continue;
    const a = -PI / 2 + (rnd(seed + i) - 0.5) * 2 * up, v = spd * (0.3 + rnd(seed + i * 3) * 0.9), drag = 1 - Math.exp(-t * 2.2);
    const px = x + cos(a) * v * drag / 2.2, py = y + sin(a) * v * drag / 2.2 + 260 * t * t, k = 1 - t / life, sz = 6 + rnd(seed + i * 5) * 12, rot = t * (4 + rnd(seed + i) * 8) + i;
    const gl = 0.5 + 0.5 * sin(rot * 1.3); c.save(); c.translate(px, py); c.rotate(rot); c.scale(1, 0.3 + 0.7 * Math.abs(cos(rot * 0.7)));
    c.globalAlpha = clamp(k * 1.6); c.fillStyle = cols ? cols[i % cols.length] : (gl > 0.8 ? '#FFF4CC' : ['#F7E2A0', '#E9C46A', '#C89A44', '#A8792B'][i % 4]); c.fillRect(-sz / 2, -sz / 2, sz, sz * 0.75); c.restore(); }
}
/** slow drifting gold dust (ambient) */
function drift(t, n = 30, seed = 0, a = 0.6, yMax = 1250) { for (let i = 0; i < n; i++) { const x = (rnd(i + seed) * W + t * (12 + rnd(i * 3) * 20)) % W, y = (rnd(i * 5 + seed + 1) * yMax + t * (25 + rnd(i * 7) * 30)) % yMax;
  const tw = 0.4 + 0.6 * Math.abs(sin(t * 2 + i)); ctx.fillStyle = `rgba(${tw > 0.85 ? GOLDHI : GOLD},${a * tw})`; ctx.save(); ctx.translate(x, y); ctx.rotate(t + i); ctx.fillRect(-3, -3, 6, 5); ctx.restore(); } }
/** ping ring */
function ring(x, y, t, a = 0.8, maxR = 520, col = PHOS) { if (t < 0 || t > 1.4) return; const k = t / 1.4; ctx.beginPath(); ctx.arc(x, y, 20 + eo(k) * maxR, 0, TAU); ctx.strokeStyle = `rgba(${col},${a * (1 - k)})`; ctx.lineWidth = 3; ctx.stroke(); }
/** diagonal glint band sweeping over a cached gold image (lighter, only brightens gold) */
function glint(img, ox, oy, x, y, s, p, a = 0.55) { if (p <= 0 || p >= 1) return; const w = img.width / img._q * s, h = img.height / img._q * s, x0 = x - ox * s, y0 = y - oy * s, bx = lerp(x0 - 300, x0 + w + 300, p);
  ctx.save(); ctx.beginPath(); ctx.moveTo(bx - 90, y0 - 50); ctx.lineTo(bx + 20, y0 - 50); ctx.lineTo(bx - 200 + 20, y0 + h + 50); ctx.lineTo(bx - 310, y0 + h + 50); ctx.closePath(); ctx.clip();
  ctx.globalCompositeOperation = 'lighter'; blit(img, ox, oy, x, y, s, a); ctx.restore(); }
/** LEAF-LAY: the image appears as square leaf pieces dropping in a staggered grid (p 0..1) */
function leafLay(img, x, y, s, p, cell = 54, seed = 1, dir = 0) {
  if (p <= 0) return; const iw = img.width / img._q, ih = img.height / img._q, q = img._q;
  if (p >= 1) { blit(img, 0, 0, x, y, s); return; }
  const nx = Math.ceil(iw / cell), ny = Math.ceil(ih / cell);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const order = dir === 1 ? (ny - 1 - j) / ny : dir === 2 ? i / nx : j / ny, del = order * 0.55 + rnd(seed + i * 17 + j * 31) * 0.3, k = clamp((p - del) / 0.18); if (k <= 0) continue;
    const e = eo(k), cx = x + (i + 0.5) * cell * s, cy = y + (j + 0.5) * cell * s - (1 - e) * 46 * s, rot = (1 - e) * (rnd(seed + i + j * 9) - 0.5) * 1.2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = clamp(k * 3);
    const sw = Math.min(cell, iw - i * cell), sh = Math.min(cell, ih - j * cell);
    ctx.drawImage(img, i * cell * q, j * cell * q, sw * q, sh * q, -cell * s / 2, -cell * s / 2, sw * s, sh * s); ctx.restore(); }
}

// ───────────── more cached pictures ─────────────
/** gold-leaf coastal map: land west, Kaveri runs east to the mouth at (MOUTH) */
const MOUTH = [618, 700];
const coastX = (y) => 610 + sin(y * 0.006) * 40 + sin(y * 0.019 + 1) * 14 + (y > 700 ? (y - 700) * 0.06 : 0);
function mapImg() { return cached('aMap', W, 1260, 1, () => { const c = ctx;
  const pts = [[-20, -20]]; for (let y = -20; y <= 1280; y += 20) pts.push([coastX(y), y]); pts.push([-20, 1280]); leafPoly(pts, 5, 30);
  // the Kaveri: cut out of the leaf (lacquer shows through) with a delta fork at the mouth
  const riv = []; for (let x = -30; x <= MOUTH[0] + 10; x += 15) riv.push([x, 330 + (MOUTH[1] - 330) * Math.pow(x / MOUTH[0], 1.4) + sin(x * 0.02) * 34 * (1 - x / MOUTH[0])]);
  const rp = () => { c.beginPath(); riv.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); };
  c.save(); c.globalCompositeOperation = 'destination-out'; c.lineCap = 'round'; c.lineJoin = 'round';
  rp(); c.lineWidth = 40; c.stroke(); for (let i = 0; i < riv.length; i++) { const [x, y] = riv[i]; c.beginPath(); c.arc(x, y, 18 + i / riv.length * 22, 0, TAU); c.fill(); }
  c.beginPath(); c.moveTo(430, 610); c.quadraticCurveTo(520, 700, 640, 760); c.lineWidth = 18; c.stroke(); c.restore();
  rp(); c.strokeStyle = 'rgba(70,40,10,0.6)'; c.lineWidth = 2; c.stroke();
  // land marks: hills (little tri), fields, towns
  c.strokeStyle = 'rgba(100,62,16,0.55)'; c.lineWidth = 3;
  for (let i = 0; i < 26; i++) { const x = 40 + rnd(i + 70) * 480, y = 60 + rnd(i + 90) * 1150; if (Math.abs(y - (330 + (MOUTH[1] - 330) * Math.pow(Math.max(0, x) / MOUTH[0], 1.4))) < 70) continue;
    c.beginPath(); c.moveTo(x - 18, y + 10); c.lineTo(x, y - 14); c.lineTo(x + 18, y + 10); c.stroke(); }
  // sea: grid and wave glyphs
  c.strokeStyle = 'rgba(233,196,106,0.12)'; c.lineWidth = 1.5; for (let x = 60; x < W; x += 120) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1260); c.stroke(); } for (let y = 60; y < 1260; y += 120) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.globalCompositeOperation = 'destination-over';
  c.strokeStyle = 'rgba(233,196,106,0.35)'; c.lineWidth = 3; c.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 22; i++) { const y = 80 + rnd(i + 3) * 1100, x = coastX(y) + 90 + rnd(i + 5) * 330; c.beginPath(); c.arc(x, y, 16, PI * 1.1, PI * 1.9); c.arc(x + 30, y, 16, PI * 1.1, PI * 1.9); c.stroke(); }
  // compass
  c.save(); c.translate(940, 1120); for (let k = 0; k < 4; k++) { c.rotate(PI / 2); leafPoly([[0, -70], [12, -12], [0, 0], [-12, -12]], 900 + k); } c.restore();
}); }
function mapShipImg() { return cached('aMShip', 60, 60, 2, () => { leafPoly([[6, 40], [54, 40], [46, 52], [14, 52]], 3, 10); leafPoly([[28, 6], [30, 6], [44, 36], [16, 36]], 4, 10); }); }
/** river-mouth close-up banks (gold), transparent river + sea */
const bankW = (y) => 110 + (y - 120) * 0.55;
const bankX = (y) => 540 + sin(y * 0.007) * 60;
function mouthImg() { return cached('aMouth', W, 1300, 1, () => {
  const L1 = [[-30, 100]], R1 = [[W + 30, 100]];
  for (let y = 100; y <= 900; y += 20) { L1.push([bankX(y) - bankW(y) / 2 + sin(y * 0.05) * 6, y]); R1.push([bankX(y) + bankW(y) / 2 + sin(y * 0.04 + 2) * 6, y]); }
  L1.push([bankX(900) - bankW(900) / 2 - 80, 960], [-30, 940]); R1.push([bankX(900) + bankW(900) / 2 + 90, 950], [W + 30, 930]);
  leafPoly(L1, 61, 28); leafPoly(R1.reverse(), 71, 28);
  ctx.strokeStyle = 'rgba(100,62,16,0.5)'; ctx.lineWidth = 3;
  for (let i = 0; i < 30; i++) { const y = 140 + rnd(i + 5) * 760, left = rnd(i + 9) > 0.5, xe = left ? bankX(y) - bankW(y) / 2 - 40 : bankX(y) + bankW(y) / 2 + 40, x = left ? xe - rnd(i) * 300 : xe + rnd(i) * 300;
    if (x < 0 || x > W) continue; ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(x + 30, y); ctx.moveTo(x - 20, y + 12); ctx.lineTo(x + 20, y + 12); ctx.stroke(); }
  tower(150, 520, 150, 260, 4, 81); warehouse(260, 430, 110, 80, 83); tower(950, 460, 140, 240, 4, 85); warehouse(780, 560, 120, 90, 87);
}); }
/** epic bundle: pages with abstract bars (no text). page w 360 h 500 */
function pageImg(side) { return cached('aPage' + side, 380, 520, 1, () => { const c = ctx;
  rr(6, 6, 368, 508, 8); c.fillStyle = lg(0, 0, 380, 0, side ? [[0, '#C9A65A'], [0.12, '#EBD39A'], [1, '#F3E2B0']] : [[0, '#F3E2B0'], [0.88, '#EBD39A'], [1, '#C9A65A']]); c.fill();
  c.strokeStyle = 'rgba(90,55,15,0.7)'; c.lineWidth = 2; c.stroke();
  c.save(); c.clip(); c.strokeStyle = 'rgba(140,95,30,0.18)'; c.lineWidth = 1; for (let x = 0; x < 380; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 2, 520); c.stroke(); } for (let y = 0; y < 520; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(380, y + 2); c.stroke(); } c.restore();
  for (let r = 0; r < 13; r++) { let x = 44; const y = 70 + r * 32; while (x < 330) { const w = 18 + rnd(side * 99 + r * 13 + x) * 70; if (x + w > 336) break; rr(x, y, w, 10, 5); c.fillStyle = 'rgba(92,52,14,0.75)'; c.fill(); x += w + 12; } }
  c.beginPath(); c.arc(190, 40, 9, 0, TAU); c.fillStyle = 'rgba(216,67,46,0.8)'; c.fill();
}); }
function coverImg() { return cached('aCover', 380, 520, 1, () => { const c = ctx;
  leafPoly([[6, 6], [374, 6], [374, 514], [6, 514]], 201, 28);
  rr(36, 36, 308, 448, 10); c.strokeStyle = 'rgba(70,40,10,0.7)'; c.lineWidth = 5; c.stroke(); rr(52, 52, 276, 416, 6); c.strokeStyle = 'rgba(70,40,10,0.35)'; c.lineWidth = 2; c.stroke();
  // abstract wave-curl emblem
  c.save(); c.translate(190, 250); for (let r = 20; r <= 110; r += 22) { c.beginPath(); c.arc(0, 0, r, PI * 0.2, PI * 1.75); c.strokeStyle = 'rgba(70,40,10,0.55)'; c.lineWidth = 6; c.stroke(); } c.restore();
  c.fillStyle = '#D8432E'; c.fillRect(0, 300, 380, 22); c.fillStyle = 'rgba(60,10,5,0.5)'; c.fillRect(0, 318, 380, 4);
  c.beginPath(); c.arc(190, 311, 26, 0, TAU); c.fillStyle = '#D8432E'; c.fill(); c.strokeStyle = 'rgba(60,10,5,0.7)'; c.lineWidth = 3; c.stroke();
}); }
function bookOpenImg() { return cached('aBookO', 800, 560, 1, () => { ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(10, 30, 780, 520, 16); ctx.fill(); ctx.drawImage(pageImg(0), 20, 20); ctx.drawImage(pageImg(1), 400, 20); }); }
/** faceless trader carrying a bundle (kind 0) or amphora (kind 1), 200 x 420, feet at (100, 410) */
function traderImg(kind) { return cached('aTrader' + kind, 200, 420, 1, () => { const c = ctx;
  leafPoly([[78, 260], [96, 262], [88, 408], [64, 408]], 11 + kind, 16); leafPoly([[104, 262], [124, 260], [138, 408], [112, 408]], 13 + kind, 16);
  leafPoly([[62, 120], [138, 120], [156, 290], [44, 290]], 15 + kind, 18);
  c.beginPath(); c.arc(100, 88, 30, 0, TAU); goldFill(70, 58, 130, 118, 14); c.strokeStyle = 'rgba(70,40,10,0.85)'; c.lineWidth = 2; c.stroke();
  c.fillStyle = 'rgba(20,14,40,0.35)'; c.fillRect(46, 200, 108, 8);
  if (kind === 0) { rr(40, 6, 120, 50, 14); goldFill(40, 6, 160, 56, 14); c.strokeStyle = 'rgba(70,40,10,0.85)'; c.stroke(); c.strokeStyle = '#D8432E'; c.lineWidth = 5; c.beginPath(); c.moveTo(100, 6); c.lineTo(100, 56); c.stroke();
    leafPoly([[62, 128], [44, 80], [58, 74], [76, 124]], 19, 10); leafPoly([[138, 128], [156, 80], [142, 74], [124, 124]], 21, 10); }
  else { c.save(); c.translate(150, 140); c.rotate(0.35); c.beginPath(); c.moveTo(-14, -70); c.lineTo(14, -70); c.quadraticCurveTo(44, -30, 30, 40); c.lineTo(0, 80); c.lineTo(-30, 40); c.quadraticCurveTo(-44, -30, -14, -70); c.closePath(); goldFill(-44, -70, 44, 80, 14); c.strokeStyle = 'rgba(70,40,10,0.85)'; c.lineWidth = 2; c.stroke(); c.restore();
    leafPoly([[134, 128], [150, 90], [162, 96], [148, 136]], 23, 10); }
}); }
function baleImg(kind) { return cached('aBale' + kind, 120, 110, 1, () => { if (kind === 0) { rr(8, 20, 104, 82, 22); goldFill(8, 20, 112, 102, 16); ctx.strokeStyle = 'rgba(70,40,10,0.85)'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = 'rgba(216,67,46,0.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(60, 20); ctx.lineTo(60, 102); ctx.moveTo(8, 60); ctx.lineTo(112, 60); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(50, 4); ctx.lineTo(70, 4); ctx.quadraticCurveTo(104, 34, 86, 80); ctx.lineTo(60, 106); ctx.lineTo(34, 80); ctx.quadraticCurveTo(16, 34, 50, 4); ctx.closePath(); goldFill(16, 4, 104, 106, 14); ctx.strokeStyle = 'rgba(70,40,10,0.85)'; ctx.lineWidth = 2; ctx.stroke(); } }); }
function sunImg() { return cached('aSun', 420, 420, 1, () => { const c = ctx; c.beginPath(); c.arc(210, 210, 170, 0, TAU); goldFill(40, 40, 380, 380, 30); c.strokeStyle = 'rgba(70,40,10,0.8)'; c.lineWidth = 2; c.stroke();
  for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; leafPoly([[210 + cos(a - 0.08) * 182, 210 + sin(a - 0.08) * 182], [210 + cos(a) * 208, 210 + sin(a) * 208], [210 + cos(a + 0.08) * 182, 210 + sin(a + 0.08) * 182]], 300 + k, 10); }
  chips(Array.from({ length: 40 }, (_, i) => [210 + cos(i / 40 * TAU) * 170, 210 + sin(i / 40 * TAU) * 170]), 7); }); }
function bannerImg() { return cached('aBanner', 160, 460, 1, () => { const c = ctx; c.fillStyle = '#B88A35'; c.fillRect(74, 0, 10, 460);
  c.beginPath(); c.moveTo(84, 30); c.lineTo(150, 40); c.lineTo(150, 300); c.lineTo(117, 270); c.lineTo(84, 300); c.closePath(); c.fillStyle = lg(84, 0, 150, 0, [[0, '#A8301F'], [0.5, '#E2553C'], [1, '#B8381F']]); c.fill(); c.strokeStyle = 'rgba(60,10,5,0.8)'; c.lineWidth = 2; c.stroke();
  c.strokeStyle = 'rgba(247,226,160,0.8)'; c.lineWidth = 3; for (const y of [80, 140, 200]) { c.beginPath(); c.moveTo(92, y); c.lineTo(142, y + 6); c.stroke(); }
  leafPoly([[66, 0], [92, 0], [79, -1], [79, 0]], 1); c.beginPath(); c.arc(79, 8, 12, 0, TAU); goldFill(66, -4, 92, 20, 8); }); }
function lampImg() { return cached('aLamp', 120, 140, 1, () => { leafPoly([[10, 70], [110, 70], [90, 100], [30, 100]], 3, 12); leafPoly([[50, 100], [70, 100], [74, 130], [46, 130]], 5, 12); }); }

// ───────────── the shots ─────────────
export function buildA(add, cue) {
  const T1 = L(1), T2 = L(2), T3 = L(3), T4 = L(4);
  const tCity = Wd('city', 0), tOne = Wd('one', 0), tFest = Wd('festival', 0);
  const tPuhar = Wd('puhar', 1), tKav = Wd('kaveri', 1), tGreat = Wd('great', 1), tEarly = Wd('early', 1);
  const tShips = Wd('ships', 2), tWare = Wd('warehouses', 2), tForeign = Wd('foreign', 2), tTraders = Wd('traders', 2);
  const tMani = Wd('manimekalai', 3), tDark = Wd('darker', 3);

  // a0 · 0 → city: the wave curl crashes over the gold harbour city (already moving on frame 0)
  const a0 = 0, a1 = Wd('a', 0) - 0.05, a2 = tFest - 0.1;
  add({ id: 'a0', at: a0, cam: [420, 760], zoom: 0.1, note: 'wave curl crashes over gold-leaf harbour city, vermilion flash, flake burst', draw: (lt, d, t) => {
    const [jx, jy] = shake(lt, 0.0, 22); ctx.save(); ctx.translate(jx, jy);
    lacq(); drift(t + 3, 26, 5, 0.5);
    const cs = 1 + 0.03 * lt; blit(cityImg(), 540, 660, 540, 1215, cs);
    glint(cityImg(), 540, 660, 540, 1215, cs, lt / 0.9, 0.5);
    // the wave sweeps in from the right, lip coming down over the towers
    const p = lt / 1.0, wx = lerp(300, -40, eio(clamp(p))), wyy = lerp(-60, 170, eo(clamp(p)));
    ctx.save(); ctx.translate(wx + 700, wyy + 650); ctx.rotate(lerp(-0.12, 0.06, p)); blit(waveImg(), 700, 650, 0, 0, 1.2); ctx.restore();
    // spray stream of flakes from the lip
    for (let k = 0; k < 6; k++) { const f = lt / 0.12, tau = ((f % 1) + k) * 0.12, s = Math.floor(f) - k; flakes(wx + 200 + sin(s) * 40, wyy + 520, tau + 0.05, 5, s * 17 + 3, 520, 1.6); }
    flakes(560, 640, lt + 0.22, 46, 9, 1100, 1.5); flakes(300, 820, lt + 0.12, 30, 19, 900, 1.3);
    waterline(lerp(1290, 1110, eo(clamp(lt / d))), t, '6,20,40', 0.9);
    ctx.restore();
    // vermilion flash on 0.0
    const fl = clamp(1 - lt / 0.32); if (fl > 0) { ctx.fillStyle = `rgba(${VERM},${0.72 * fl})`; ctx.fillRect(-300, -300, W + 600, H + 600); glowS(560, 620, 900, '255,200,150', 0.7 * fl); }
    calm();
  } });

  // a1 · waterline wipe: the towers drown, the gold turns to sonar dots
  add({ id: 'a1', at: a1, cam: [540, 700], zoom: 0.08, note: 'waterline climbs over the towers, gold becomes green sonar dots', draw: (lt, d, t) => {
    const s = 1.55, ox = 540, oy = 660, X = 560, Y = 1180, wl = lerp(1120, 520, eo(clamp(lt / (d + 0.1)))), tilt = 0.06 * sin(lt * 3);
    ctx.save(); abovePath(wl, t, tilt); ctx.clip(); lacq(); blit(cityImg(), ox, oy, X, Y, s); flakes(560, wl, lt, 30, 31, 700, 1.2); ctx.restore();
    ctx.save(); belowPath(wl, t, tilt); ctx.clip(); blit(sonarImg(), 0, 0, 0, 0, 1);
    const dots = dotsOf('aCityDots', cityImg(), 11), ang = -PI * 0.95 + lt * 3.4;
    ctx.save(); ctx.translate(X - ox * s, Y - oy * s); ctx.scale(s, s); sonarDots(dots, 0, 0, (540 - (X - ox * s)) / s, (1250 - (Y - oy * s)) / s, ang, 0.3); ctx.restore();
    sweep(540, 1250, ang, 1400, 0.4); ring(540, 1250, lt, 0.7, 700); ctx.restore();
    crest(wl, t, tilt); calm('2,10,7');
  } });

  // a2 · ONE FESTIVAL? slams over vermilion festival banners, the crest looming
  add({ id: 'a2', at: a2, cam: [540, 520], zoom: 0.09, note: 'ONE FESTIVAL? slams in on "festival"; banners + lamps; wave crest looms', draw: (lt, d, t) => {
    const ts = tFest - a2, [jx, jy] = shake(lt, ts, 16);
    ctx.save(); ctx.translate(jx, jy); lacq();
    glowS(540, 900, 700, VERM, 0.22 + 0.1 * sin(lt * 6));
    blit(cityImg(), 540, 660, 540, 1250, 1.12, 0.9);
    for (let i = 0; i < 5; i++) { const x = 110 + i * 215, wob = sin(lt * 3 + i) * 0.06; ctx.save(); ctx.translate(x, 1180 - (i % 2) * 70); ctx.rotate(wob); blit(bannerImg(), 79, 460, 0, 0, 1.15); ctx.restore(); }
    for (let i = 0; i < 6; i++) { const x = 90 + i * 180, y = 1060 + (i % 2) * 40; blit(lampImg(), 60, 100, x, y, 0.7); const fl = 0.75 + 0.25 * sin(t * 13 + i * 2); glowS(x, y - 40, 70 * fl, '255,170,80', 0.8); ctx.fillStyle = '#FFE3A0'; ctx.beginPath(); ctx.ellipse(x, y - 38, 7 * fl, 16 * fl, 0, 0, TAU); ctx.fill(); }
    // wave crest overhead, creeping down
    ctx.save(); ctx.translate(lerp(820, 700, lt / d), lerp(-560, -470, lt / d)); ctx.rotate(0.35); blit(waveImg(), 700, 650, 0, 0, 1.0, 0.95); ctx.restore();
    ctx.restore();
    const ti = titleImg('ONE FESTIVAL?', 104);
    if (lt < ts) { const k = seg(lt, ts - 0.25, ts); ctx.fillStyle = `rgba(${VERM},${0.1 * k})`; ctx.fillRect(-300, -300, W + 600, H + 600); }
    slam(ti, 540, 540, lt, ts);
    const fl = clamp(1 - (lt - ts) / 0.3); if (lt > ts && fl > 0) { ctx.fillStyle = `rgba(${VERM},${0.5 * fl})`; ctx.fillRect(-300, -300, W + 600, H + 600); }
    flakes(540 - ti.width * 0.45, 600, lt - ts - 0.05, 22, 41, 700); flakes(540 + ti.width * 0.45, 600, lt - ts - 0.05, 22, 43, 700); flakes(540, 470, lt - ts - 0.05, 18, 47, 500);
    glint(ti, ti.width / 2, ti.height / 2, 540, 540, 1, (lt - ts - 0.25) / 0.6, 0.6);
    calm();
  } });

  // a3 · L(1): gold-leaf map, leaf-lay, PUHAR at the Kaveri mouth
  add({ id: 'a3', at: T1, cam: [MOUTH[0], MOUTH[1]], zoom: 0.1, note: 'gold-leaf coastline map leaf-lays in, PUHAR marker pings at the river mouth', draw: (lt, d, t) => {
    lacq(); const p = clamp(lt / 0.75);
    leafLay(mapImg(), 0, 0, 1, p, 60, 3, 2);
    glint(mapImg(), 0, 0, 0, 0, 1, (lt - 0.6) / 0.7, 0.4);
    // ships heading to the mouth
    for (let i = 0; i < 4; i++) { const k = clamp((lt + i * 0.3) / 2.6), x = lerp(1040 - i * 40, MOUTH[0] + 80, eo(k)), y = lerp(220 + i * 260, MOUTH[1] + (i - 1.5) * 50, eo(k)); blit(mapShipImg(), 30, 46, x, y + sin(t * 3 + i) * 3, 1, clamp(p * 2)); }
    const tp = tPuhar - T1;
    if (lt > tp) { for (let k = 0; k < 3; k++) ring(MOUTH[0], MOUTH[1], (lt - tp - k * 0.4) % 1.2, 0.9, 160, GOLD); }
    const pul = 1 + 0.15 * sin(lt * 10); glowS(MOUTH[0], MOUTH[1], 70 * pul, VERM, 0.9); ctx.beginPath(); ctx.arc(MOUTH[0], MOUTH[1], 14, 0, TAU); ctx.fillStyle = '#D8432E'; ctx.fill(); ctx.strokeStyle = '#F7E2A0'; ctx.lineWidth = 3; ctx.stroke();
    const ti = titleImg('PUHAR', 80); slam(ti, 830, 540, lt, tp + 0.02);
    if (lt > tp + 0.1) { ctx.strokeStyle = 'rgba(247,226,160,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(MOUTH[0] + 18, MOUTH[1] - 10); ctx.lineTo(760, 590); ctx.stroke(); }
    flakes(830, 540, lt - tp - 0.1, 20, 51, 500);
    calm();
  } });

  // a4 · KAVERI mouth close: banks lay in, gold current flows to the sea, ships sail in
  const a4 = tKav - 0.12;
  add({ id: 'a4', at: a4, cam: [540, 760], zoom: 0.1, note: 'river mouth close-up, KAVERI label, flowing gold current, ships entering', draw: (lt, d, t) => {
    lacq();
    // current lines (drawn under the banks)
    ctx.save(); ctx.setLineDash([60, 50]); ctx.lineDashOffset = -lt * 260; ctx.lineCap = 'round';
    for (let k = -3; k <= 3; k++) { ctx.beginPath(); for (let y = 100; y <= 1000; y += 25) { const x = bankX(y) + k * bankW(y) * 0.13; y === 100 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = `rgba(${k % 2 ? GOLD : CYAN},${0.35 - Math.abs(k) * 0.04})`; ctx.lineWidth = 5; ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(207,246,255,0.25)'; ctx.lineWidth = 3; for (let r = 0; r < 6; r++) { ctx.beginPath(); for (let x = -20; x <= W + 20; x += 30) { const y = 990 + r * 45 + sin(x * 0.02 + t * 2 + r) * 8; x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    leafLay(mouthImg(), 0, 0, 1, clamp(lt / 0.5), 64, 7, 0);
    ship(lerp(760, 600, eo(clamp(lt / d))), lerp(1180, 1010, eo(clamp(lt / d))), 0.62, t, 0);
    ship(lerp(250, 330, lt / d), 1160, 0.5, t, 2);
    const ti = titleImg('KAVERI', 92), tk = tKav - a4; slam(ti, 540, 300, lt, tk);
    flakes(540, 300, lt - tk - 0.05, 18, 61, 520);
    calm();
  } });

  // a5 · great harbour: skyline + fleet, glint sweep
  const a5 = tGreat - 0.04;
  add({ id: 'a5', at: a5, cam: [540, 800], zoom: -0.07, note: 'the great harbour: gold skyline, fleet bobbing at the quay, glint sweep', draw: (lt, d, t) => {
    lacq(); glowS(540, 520, 520, GOLD, 0.16); drift(t, 30, 9, 0.6, 1100);
    const sun = sunImg(); blit(sun, 210, 210, 820, 330 + lt * 20, 0.6, 0.9);
    blit(cityImg(), 540, 660, 540 - lt * 30, 960, 1.0);
    glint(cityImg(), 540, 660, 540 - lt * 30, 960, 1.0, lt / d, 0.5);
    waterline(950, t, '8,16,50', 0.92);
    ctx.strokeStyle = 'rgba(233,196,106,0.25)'; ctx.lineWidth = 3; for (let r = 0; r < 5; r++) { ctx.beginPath(); for (let x = -20; x <= W + 20; x += 30) { const y = 1010 + r * 50 + sin(x * 0.018 + t * 2 + r) * 6; x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    ship(200 + lt * 40, 1100, 0.75, t, 0); ship(560 + lt * 25, 1150, 0.9, t, 1.3); ship(930 + lt * 50, 1080, 0.65, t, 2.6);
    calm();
  } });

  // a6 · EARLY CHOLAS: big gate tower leaf-lays, flags
  const a6 = tEarly - 0.08;
  add({ id: 'a6', at: a6, cam: [540, 650], zoom: 0.08, note: 'EARLY CHOLAS: generic stepped gate tower leaf-lays in, vermilion flags', draw: (lt, d, t) => {
    lacq(); glowS(540, 700, 650, GOLD, 0.15);
    const img = cached('aGate', 900, 1000, 1, () => { tower(450, 980, 560, 900, 7, 501); flagPole(110, 980, 380); flagPole(790, 980, 380); });
    leafLay(img, 90, 230, 1, clamp(lt / 0.7), 60, 11, 1);
    glint(img, 0, 0, 90, 230, 1, (lt - 0.65) / 0.7, 0.55);
    for (const x of [200, 880]) { ctx.save(); ctx.translate(x + 3, 830); ctx.beginPath(); ctx.moveTo(0, 0); for (let k = 0; k <= 8; k++) ctx.lineTo(k * 9, 20 + sin(t * 7 + k * 0.8 + x) * 8 * k / 8); ctx.lineTo(0, 44); ctx.closePath(); ctx.fillStyle = 'rgba(216,67,46,0.5)'; ctx.fill(); ctx.restore(); }
    waterline(1215, t, '6,12,40', 0.95);
    const te = tEarly - a6; slam(titleImg('EARLY CHOLAS', 92), 540, 330, lt, te);
    flakes(540, 330, lt - te - 0.05, 30, 71, 650);
    calm();
  } });

  // ── line 2: OLD EPICS SAY stays up throughout ──
  const epicsTag = (lt, big = false) => { const img = greenTagGold(); blit(img, img.width / 2, img.height / 2, 540, 205, 1); };
  function greenTagGold() { return titleImg('OLD EPICS SAY', 56); }

  // a7 · L(2): OLD EPICS SAY slams big, then rises to the top; horizon fleet under a gold sun
  add({ id: 'a7', at: T2, cam: [540, 760], zoom: 0.07, note: 'OLD EPICS SAY slams centre then docks at the top; sun disc leaf-lays; fleet on the horizon', draw: (lt, d, t) => {
    lacq(); drift(t, 24, 13, 0.5, 1000);
    leafLay(sunImg(), 330, 470, 1, clamp(lt / 0.6), 42, 21, 0); glowS(540, 680, 420, GOLD, 0.18 * clamp(lt / 0.6));
    waterline(900, t, '8,14,46', 0.95);
    ctx.strokeStyle = 'rgba(233,196,106,0.3)'; ctx.lineWidth = 3; for (let r = 0; r < 6; r++) { ctx.beginPath(); for (let x = -20; x <= W + 20; x += 30) { const y = 960 + r * 48 + sin(x * 0.02 - t * 2 + r * 1.7) * 7; x < 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    for (let i = 0; i < 5; i++) ship(((80 + i * 230 + lt * (30 + i * 8)) % 1240) - 80, 905 + (i % 2) * 40, 0.32 + (i % 2) * 0.1, t, i);
    const p = eio(seg(lt, 0.75, 1.25)), img = titleImg('OLD EPICS SAY', 104), small = titleImg('OLD EPICS SAY', 56);
    if (p < 1) slam(img, 540, lerp(470, 205, p), lt, 0.02, lerp(1, small.width / img.width, p));
    else blit(small, small.width / 2, small.height / 2, 540, 205, 1);
    flakes(540, 470, lt - 0.1, 30, 81, 700);
    calm();
  } });

  // a8 · SHIPS: two big ships rock, sails leaf-lay
  const a8 = tShips - 0.35;
  add({ id: 'a8', at: a8, cam: [540, 820], zoom: 0.08, note: 'SHIPS: two large gold ships rocking on the waterline', draw: (lt, d, t) => {
    lacq(); glowS(540, 700, 600, GOLD, 0.12);
    ctx.save(); ctx.translate(-lt * 30, 0); ship(330, 1060, 1.35, t, 0, clamp(lt / 0.2)); ctx.restore();
    ship(860 - lt * 50, 920, 0.85, t, 1.7, clamp(lt / 0.3));
    waterline(1060, t, '6,14,44', 0.9);
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(lerp(470, 180, k / 3) - lt * 30, 1072 + k * 6, 30 + k * 8, PI * 1.05, PI * 1.9); ctx.strokeStyle = `rgba(${CYAN},0.5)`; ctx.lineWidth = 3; ctx.stroke(); }
    epicsTag(lt); slam(titleImg('SHIPS', 92), 540, 370, lt, tShips - a8);
    flakes(330, 700, lt, 24, 91, 600);
    calm();
  } });

  // a9 · WAREHOUSES: godowns leaf-lay, bales and amphorae drop in
  const a9 = tWare - 0.1;
  add({ id: 'a9', at: a9, cam: [540, 860], zoom: 0.08, note: 'WAREHOUSES: row of godowns, bales and amphorae drop and bounce', draw: (lt, d, t) => {
    lacq();
    const img = cached('aWare', W, 520, 1, () => { warehouse(30, 500, 300, 260, 601); warehouse(380, 500, 320, 300, 611); warehouse(750, 500, 300, 250, 621); });
    leafLay(img, 0, 640 - lt * 0, 1, clamp(lt / 0.55), 56, 13, 1);
    leafPoly2(lt);
    for (let i = 0; i < 9; i++) { const t0 = 0.25 + i * 0.09, k = clamp((lt - t0) / 0.45); if (k <= 0) continue; const x = 90 + i * 112, y0 = 1160 - (i % 3 === 1 ? 70 : 0); const y = lerp(600, y0, k < 0.6 ? (k / 0.6) ** 2 : 1) - (k > 0.6 ? sin((k - 0.6) / 0.4 * PI) * 30 : 0);
      blit(baleImg(i % 2), 60, 104, x, y, 0.9); if (k > 0.6) flakes(x, y0, lt - t0 - 0.27, 6, 100 + i, 280); }
    epicsTag(lt); slam(titleImg('WAREHOUSES', 92), 540, 370, lt, 0.1);
    calm();
  } });
  function leafPoly2() { const q = cached('aQuay', W, 90, 1, () => leafPoly([[-10, 0], [W + 10, 0], [W + 10, 90], [-10, 90]], 777, 30)); blit(q, 0, 0, 0, 1160, 1); }

  // a10 · TRADERS: faceless foreign traders walk the quay (ILLUSTRATION)
  const a10 = tForeign - 0.1;
  add({ id: 'a10', at: a10, cam: [540, 900], zoom: 0.07, note: 'TRADERS: faceless gold silhouettes with bundles/amphorae walk off a ship gangway; ILLUSTRATION tag', draw: (lt, d, t) => {
    lacq(); glowS(540, 800, 600, GOLD, 0.12);
    ship(930, 990, 0.95, t * 0.5, 0.4);
    waterline(1000, t, '6,14,44', 0.85);
    leafPoly2();
    ctx.save(); ctx.strokeStyle = '#8A6424'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(820, 980); ctx.lineTo(640, 1165); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 3; i++) { const x = 680 - i * 220 - lt * 110, step = lt * 7 + i * 2, y = 1165 - Math.abs(sin(step)) * 10;
      ctx.save(); ctx.translate(x, y); ctx.rotate(sin(step) * 0.04); blit(traderImg(i % 2), 100, 410, 0, 0, 1.15); ctx.restore(); }
    epicsTag(lt); slam(titleImg('TRADERS', 92), 540, 370, lt, tTraders - a10);
    const it = greenTag('ILLUSTRATION', 26); blit(it, it.width, 0, 1040, 74, 1);
    calm();
  } });

  // a11 · L(3): MANIMEKALAI — the gold-leaf bundle opens; abstract bars
  const a12 = tDark - 0.04;
  add({ id: 'a11', at: T3, cam: [540, 720], zoom: 0.1, note: 'MANIMEKALAI: gold-leaf epic bundle opens, abstract bars write in (no text)', draw: (lt, d, t) => {
    lacq(); drift(t, 26, 17, 0.5);
    const op = eio(seg(lt, 0.45, 1.15)), bx = lerp(350, 540, op) , by = 790, k = lt;
    glowS(540, 780, 560, GOLD, 0.12 + 0.12 * op);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; rr(bx - 380 * op - 10 + 10, by - 250, 380 + 380 * op + 20, 540, 16); ctx.fill();
    blit(pageImg(1), 0, 260, bx, by, 1);
    // left page appears as the cover passes
    // bars of right page reveal top-down
    // cover flipping (scaleX cos)
    const ang = op * PI, sx = cos(ang);
    if (sx > 0) { ctx.save(); ctx.translate(bx, by); ctx.scale(sx, 1); blit(coverImg(), 0, 260, 0, 0, 1); ctx.restore(); }
    else blit(pageImg(0), 380, 260, bx, by, -sx, 1, 1);
    if (op > 0.99) { glowS(540, by, 300, GOLDHI, 0.25 * (1 - seg(lt, 1.15, 1.8))); }
    const tm = tMani - T3; slam(titleImg('MANIMEKALAI', 96), 540, 340, lt, tm);
    flakes(540, 340, lt - tm - 0.05, 30, 111, 650);
    flakes(540, by - 100, lt - 1.0, 24, 121, 500);
    calm();
  } });

  // a12 · "darker": the light drains, the waterline climbs over the open book, sonar sweep foreshadows
  add({ id: 'a12', at: a12, cam: [540, 800], zoom: 0.09, note: 'the light darkens: veil drains the gold, waterline rises over the book, sonar sweep + pings below', draw: (lt, d, t) => {
    const D = T4 - a12, p = clamp(lt / D), wl = lerp(1260, 700, eio(p)), by = 790;
    ctx.save(); abovePath(wl, t, 0.03); ctx.clip(); lacq(); blit(bookOpenImg(), 400, 280, 540, by, 1);
    ctx.fillStyle = `rgba(2,3,12,${0.62 * eo(p)})`; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore();
    ctx.save(); belowPath(wl, t, 0.03); ctx.clip(); blit(sonarImg(), 0, 0, 0, 0, 1);
    const dots = dotsOf('aBookDots', bookOpenImg(), 12), ang = -PI * 0.9 + lt * 2.6;
    sonarDots(dots, 540 - 400, by - 280, 540, 1250, ang, 0.25); sweep(540, 1250, ang, 1400, 0.45);
    ring(540, 1250, lt % 1.1, 0.6, 600); ctx.restore();
    crest(wl, t, 0.03);
    const ti = titleImg('MANIMEKALAI', 96); blit(ti, ti.width / 2, ti.height / 2, 540, 340, 1, 1 - 0.5 * eo(p));
    // depth gauge creeping in on the left edge
    const ga = seg(lt, 0.2, 0.7); if (ga > 0) { ctx.save(); ctx.globalAlpha = ga; ctx.fillStyle = 'rgba(65,255,154,0.6)'; ctx.fillRect(40, 440, 3, 780);
      ctx.font = '900 28px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; for (let k = 0; k <= 6; k++) { const y = 470 + k * 120; ctx.fillRect(40, y, 18, 3); ctx.fillStyle = `rgba(${PHOS},0.75)`; ctx.fillText(`-${k * 5} m`, 66, y); ctx.fillStyle = 'rgba(65,255,154,0.6)'; }
      const my = clamp(wl, 470, 1190); ctx.beginPath(); ctx.moveTo(44, my); ctx.lineTo(70, my - 12); ctx.lineTo(70, my + 12); ctx.closePath(); ctx.fillStyle = '#41FF9A'; ctx.fill(); ctx.restore(); }
    calm('2,8,8');
  } });

  // ───────────── cues ─────────────
  cue(0.0, 'slam', { gain: 1.0 }); cue(0.05, 'whoosh', { gain: 0.8 }); cue(0.1, 'rumble', { gain: 0.7, dur: 1.4 });
  cue(a1, 'swell', { gain: 0.6, dur: 0.8 }); cue(a1 + 0.1, 'bubbles', { gain: 0.5 }); cue(a1 + 0.12, 'pop', { gain: 0.35 });
  cue(a2, 'whoosh', { gain: 0.5 }); cue(tFest, 'slam', { gain: 0.9 }); cue(tFest + 0.05, 'sparkle', { gain: 0.5 });
  cue(T1, 'whoosh', { gain: 0.5 }); cue(T1 + 0.1, 'sparkle', { gain: 0.4 }); cue(tPuhar + 0.02, 'thud', { gain: 0.7 }); cue(tPuhar + 0.1, 'tock', { gain: 0.35 });
  cue(a4, 'swell', { gain: 0.45, dur: 0.9 }); cue(tKav, 'thud', { gain: 0.6 });
  cue(a5, 'sparkle', { gain: 0.45 }); cue(a6, 'whoosh', { gain: 0.4 }); cue(tEarly, 'slam', { gain: 0.7 });
  cue(T2, 'whoosh', { gain: 0.5 }); cue(T2 + 0.02, 'thud', { gain: 0.6 }); cue(T2 + 0.15, 'sparkle', { gain: 0.35 });
  cue(a8 + 0.1, 'thud', { gain: 0.5 }); cue(a9 + 0.1, 'thud', { gain: 0.5 }); cue(a9 + 0.4, 'tock', { gain: 0.3 }); cue(a9 + 0.6, 'tock', { gain: 0.3 });
  cue(tTraders, 'thud', { gain: 0.5 });
  cue(T3, 'whoosh', { gain: 0.5 }); cue(T3 + 0.5, 'slide', { gain: 0.4 }); cue(tMani, 'slam', { gain: 0.7 }); cue(tMani + 0.05, 'sparkle', { gain: 0.35 });
  cue(a12, 'rumble', { gain: 0.6, dur: 1.4 }); cue(a12 + 0.1, 'bubbles', { gain: 0.4 }); cue(a12 + 0.3, 'pop', { gain: 0.4 }); cue(a12 + 1.4, 'pop', { gain: 0.35 });
}
