// EPISODE 18 · worker A : "Tide-Stained Manifest", lines 0-3 (t 0 -> L(4)). THE HOOK.
// Night sea ship pitching inside an indigo wash bloom + red wax seal slam at 0 · dotted route to PENANG · a boy at the rail ·
// SIVAGANGA chart bloom · ledger tally · the two faceless brothers (ILLUSTRATION) · red-coat row · proclamation sheet + seal ·
// sheets slapped onto Srirangam temple wall and Trichy fort wall · crowd rising · rope wipe · red strike-through, CRUSHED.
// Engine: teak, pages, sea, ship, chart, figures, walls, sheets, seal baked once by cached(); per frame only blits, clips,
// a few noisy blobs, waves, tally strokes and specks. No shadowBlur anywhere.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, fillP, poly, rgba } from './art.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const INK = '#2B1D14', PAPER = '#E9DFC6', FOX = '#CDBE98', PWHITE = '#F3EBD7', TEAK = '#1A110B';
const DEEP = '#1F3A68', MID = '#4E6E9E', PALE = '#A9BCD6', WAX = '#B0261E', WAXHI = '#E0574A', BRASS = '#C79A3E', HEMP = '#B89A6A';

// ───────────── shared paper helper (copied exactly from ART.md) ─────────────
// ledger page centred at (x,y), size w x h, rotation rot; rows = abstract ledger rows; seed varies marks; stain 0..1 = brown tide stain from bottom
function ledgerPage(x, y, w, h, rot = 0, rows = 14, seed = 1, stain = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const R = (i) => { const v = Math.sin((seed * 31 + i) * 12.9898) * 43758.5453; return v - Math.floor(v); };
  ctx.beginPath(); const n = 60;
  for (let i = 0; i <= n; i++) ctx.lineTo(-w / 2 + w * i / n, -h / 2 + (R(i) - 0.5) * 6);
  for (let i = 0; i <= n; i++) ctx.lineTo(w / 2 + (R(i + 99) - 0.5) * 6, -h / 2 + h * i / n);
  for (let i = n; i >= 0; i--) ctx.lineTo(-w / 2 + w * i / n, h / 2 + (R(i + 199) - 0.5) * 6);
  for (let i = n; i >= 0; i--) ctx.lineTo(-w / 2 + (R(i + 299) - 0.5) * 6, -h / 2 + h * i / n);
  ctx.closePath(); const g = ctx.createRadialGradient(0, 0, h * 0.1, 0, 0, h * 0.75); g.addColorStop(0, '#EFE6CF'); g.addColorStop(1, '#CDBE98');
  ctx.fillStyle = g; ctx.fill(); ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(157,178,200,0.55)'; ctx.lineWidth = 2;
  for (let r = 0; r < rows; r++) { const yy = -h / 2 + h * (r + 1.5) / (rows + 2); ctx.beginPath(); ctx.moveTo(-w / 2, yy); ctx.lineTo(w / 2, yy); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(176,38,30,0.6)'; ctx.beginPath(); ctx.moveTo(-w / 2 + w * 0.14, -h / 2); ctx.lineTo(-w / 2 + w * 0.14, h / 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(43,29,20,0.7)'; ctx.lineWidth = 2.5;
  for (let r = 0; r < rows; r++) { const yy = -h / 2 + h * (r + 1.5) / (rows + 2) - 6; let xx = -w / 2 + w * 0.17; ctx.beginPath();
    for (let k = 0; xx < w / 2 - w * 0.06 && k < 40; k++) { const f = R(r * 50 + k), lw = 10 + f * 30; ctx.moveTo(xx, yy);
      ctx.bezierCurveTo(xx + lw * 0.3, yy - 8 * f, xx + lw * 0.6, yy + 6, xx + lw, yy - 2); xx += lw + 8 + f * 14; if (f > 0.85) xx += 40; } ctx.stroke(); }
  for (let i = 0; i < 30; i++) { ctx.fillStyle = `rgba(150,110,60,${0.05 + R(i + 500) * 0.08})`; ctx.beginPath(); ctx.arc((R(i + 600) - 0.5) * w, (R(i + 700) - 0.5) * h, 4 + R(i + 800) * 16, 0, Math.PI * 2); ctx.fill(); }
  if (stain > 0) { const top = h / 2 - h * stain; const sg = ctx.createLinearGradient(0, top - 40, 0, h / 2); sg.addColorStop(0, 'rgba(120,80,40,0)'); sg.addColorStop(0.08, 'rgba(120,80,40,0.55)'); sg.addColorStop(0.12, 'rgba(160,120,70,0.25)'); sg.addColorStop(1, 'rgba(120,85,45,0.4)');
    ctx.fillStyle = sg; ctx.fillRect(-w / 2, top - 40, w, h); }
  ctx.restore(); ctx.restore();
}

// ───────────── drawing helpers (used inside caches) ─────────────
/** hand-drawn iron-gall polyline: subdivided with a small seeded wobble */
function wob(pts, lw = 3, col = INK, seed = 1, close = false) {
  const P = close ? [...pts, pts[0]] : pts; ctx.beginPath(); let n = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1], len = Math.hypot(x1 - x0, y1 - y0), k = Math.max(1, Math.round(len / 26)), nx = -(y1 - y0) / (len || 1), ny = (x1 - x0) / (len || 1);
    for (let j = 0; j <= k; j++) { if (i && !j) continue; const f = j / k, o = (j && j < k) ? (rnd(seed * 17 + n++) - 0.5) * 2.4 : 0, x = lerp(x0, x1, f) + nx * o, y = lerp(y0, y1, f) + ny * o; (i || j) ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  }
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
function shape(pts, fill, lw = 3.5, seed = 1) { fillP(pts, fill); wob(pts, lw, INK, seed, true); }
/** diagonal hatching inside the current path set by pathFn */
function hatch(pathFn, x0, y0, x1, y1, gap = 11, col = 'rgba(43,29,20,0.42)', lw = 1.6, dir = 1) {
  ctx.save(); pathFn(); ctx.clip(); ctx.beginPath(); const hh = y1 - y0;
  for (let s = -hh; s < x1 - x0 + hh; s += gap) { if (dir > 0) { ctx.moveTo(x0 + s, y0); ctx.lineTo(x0 + s - hh, y1); } else { ctx.moveTo(x0 + s - hh, y0); ctx.lineTo(x0 + s, y1); } }
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); ctx.restore();
}
function washBlots(x0, y0, x1, y1, n, col, a0, a1, r0, r1, seed) {
  for (let i = 0; i < n; i++) { ctx.fillStyle = rgba(col, a0 + rnd(i + seed) * (a1 - a0)); ctx.beginPath(); ctx.arc(lerp(x0, x1, rnd(i * 3 + seed)), lerp(y0, y1, rnd(i * 7 + seed + 1)), r0 + rnd(i * 5 + seed) * (r1 - r0), 0, TAU); ctx.fill(); }
}
/** blit with rotation about the image's local point (ox, oy) */
function blitR(c, ox, oy, x, y, s = 1, rot = 0, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= a; ctx.drawImage(c, -ox * s, -oy * s, c.width / c._q * s, c.height / c._q * s); ctx.restore();
}

// ───────────── the page and the scene window ─────────────
const PX = 540, PY = 720, PGW = 980, PGH = 1180;   // page: x 50..1030, y 130..1310 (caption band below stays teak)
const WIN = (() => { const p = [], x0 = 92, y0 = 176, x1 = 988, y1 = 1262, n = 28; const j = (i) => (rnd(i + 900) - 0.5) * 7;
  for (let i = 0; i < n; i++) p.push([lerp(x0, x1, i / n), y0 + j(i)]); for (let i = 0; i < n; i++) p.push([x1 + j(i + 40), lerp(y0, y1, i / n)]);
  for (let i = 0; i < n; i++) p.push([lerp(x1, x0, i / n), y1 + j(i + 80)]); for (let i = 0; i < n; i++) p.push([x0 + j(i + 120), lerp(y1, y0, i / n)]); return p; })();
const winPath = () => poly(WIN);

const teakImg = () => cached('aTeak', W + 600, H + 600, 0.4, () => {
  ctx.fillStyle = TEAK; ctx.fillRect(0, 0, W + 600, H + 600);
  for (let i = 0; i < 140; i++) { const y = rnd(i) * (H + 600), a = 0.04 + rnd(i + 3) * 0.08; ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x <= W + 600; x += 40) ctx.lineTo(x, y + sin(x * 0.004 + i) * 18 + sin(x * 0.013 + i * 2) * 5);
    ctx.strokeStyle = rnd(i + 7) > 0.5 ? `rgba(90,58,32,${a})` : `rgba(0,0,0,${a * 1.6})`; ctx.lineWidth = 2 + rnd(i + 9) * 7; ctx.stroke(); }
  const g = ctx.createRadialGradient((W + 600) / 2, 1000, 200, (W + 600) / 2, 1000, 1500); g.addColorStop(0, 'rgba(70,45,25,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W + 600, H + 600);
});
function teak() { blit(teakImg(), 300, 300, 0, 0); }
const pageImg = (seed = 1, tally = false) => cached(`aPage${seed}${tally ? 'T' : ''}`, 1000, 1200, 1, () => {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(18, 22, 980, 1180);   // contact shadow on the teak
  ledgerPage(500, 600, PGW, PGH, 0, 16, seed, 0);
  if (tally) {   // clear a header band and a tally column for our own marks (helper above stays untouched)
    ctx.fillStyle = 'rgba(236,226,200,0.93)'; ctx.fillRect(14, 20, 972, 170); ctx.fillRect(620, 190, 360, 980);
    ctx.strokeStyle = 'rgba(176,38,30,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(620, 190); ctx.lineTo(620, 1180); ctx.stroke();
    ctx.strokeStyle = 'rgba(157,178,200,0.55)'; ctx.beginPath(); ctx.moveTo(14, 190); ctx.lineTo(986, 190); ctx.stroke();
  }
});
function page(seed = 1, tally = false, rot = 0) { blitR(pageImg(seed, tally), 500, 600, PX, PY, 1, rot); }
const granImg = () => cached('aGran', W, 1320, 0.6, () => { for (let i = 0; i < 900; i++) { ctx.fillStyle = rnd(i + 3) > 0.5 ? 'rgba(169,188,214,0.22)' : 'rgba(10,20,45,0.25)'; ctx.beginPath(); ctx.arc(rnd(i) * W, rnd(i + 51) * 1320, 1 + rnd(i + 8) * 2.6, 0, TAU); ctx.fill(); } });

// ───────────── wash bloom (device 1) ─────────────
function bloomPath(cx, cy, r, seed = 1, t = 0) {
  ctx.beginPath();
  for (let i = 0; i <= 80; i++) { const a = i / 80 * TAU, k = 1 + 0.13 * sin(5 * a + seed + t * 0.9) + 0.07 * sin(9 * a + seed * 2.3 - t * 1.3) + 0.04 * sin(19 * a + seed * 5);
    const x = cx + cos(a) * r * k, y = cy + sin(a) * r * k * 0.94; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
}
/** reveal drawFn inside the page window through a noisy blooming blob with a dark wet edge + granulation */
function bloom(cx, cy, r, seed, t, drawFn, edge = DEEP, gran = 0.6) {
  if (r <= 0) return;
  ctx.save(); winPath(); ctx.clip(); bloomPath(cx, cy, r, seed, t); ctx.clip(); drawFn(); if (gran) blit(granImg(), 0, 0, 0, 0, 1, gran); ctx.restore();
  ctx.save(); winPath(); ctx.clip(); bloomPath(cx, cy, r, seed, t); ctx.strokeStyle = rgba(edge, 0.4); ctx.lineWidth = 11; ctx.stroke();
  ctx.strokeStyle = rgba(edge, 0.75); ctx.lineWidth = 3; ctx.stroke(); bloomPath(cx, cy, r * 0.97 - 6, seed + 0.3, t); ctx.strokeStyle = rgba(edge, 0.18); ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
}
function inWin(fn) { ctx.save(); winPath(); ctx.clip(); fn(); ctx.restore(); }
function winEdge() { winPath(); ctx.strokeStyle = 'rgba(31,58,104,0.35)'; ctx.lineWidth = 6; ctx.stroke(); }

// ───────────── labels ─────────────
/** Caladea caps label with a drawn red underline; p = time since it appears (s) */
function lab(txt, x, y, size, p, onDark = false) {
  if (p <= 0) return; const sc = 0.8 + 0.2 * eob(clamp(p / 0.28)), a = clamp(p / 0.12);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= a;
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.07)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width;
  if (onDark) { ctx.fillStyle = 'rgba(16,30,56,0.55)'; ctx.fillRect(-w / 2 - 22, -size * 0.62, w + 40, size * 1.42); }
  ctx.fillStyle = onDark ? PWHITE : INK; ctx.fillText(txt, size * 0.035, 0);
  const u = eo(clamp((p - 0.1) / 0.3)); ctx.fillStyle = WAX; ctx.fillRect(-w / 2, size * 0.5, w * u, Math.max(4, size * 0.08));
  ctx.restore(); ctx.letterSpacing = '0px';
}
const tag = (txt, x, y, p) => lab(txt, x, y, 30, p);

// ───────────── wax seal slam (device 3) ─────────────
const sealImg = () => cached('aSeal', 260, 300, 1, () => {   // brass seal seen from above-ish: handle + face
  ctx.translate(130, 150);
  ctx.fillStyle = '#7A5A22'; ctx.beginPath(); ctx.ellipse(0, 14, 112, 112, 0, 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(-30, -30, 10, 0, 0, 115); g.addColorStop(0, '#F1D38A'); g.addColorStop(0.6, BRASS); g.addColorStop(1, '#8A6420');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 110, 0, TAU); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  for (const r of [92, 70]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.strokeStyle = 'rgba(70,45,10,0.7)'; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,240,200,0.5)'; ctx.beginPath(); ctx.ellipse(-40, -46, 34, 14, -0.7, 0, TAU); ctx.fill();
  ctx.fillStyle = '#6E4E1A'; ctx.beginPath(); ctx.arc(0, 0, 36, 0, TAU); ctx.fill(); ctx.fillStyle = '#E9C778'; ctx.beginPath(); ctx.arc(-8, -8, 22, 0, TAU); ctx.fill();
});
const waxImg = () => cached('aWax', 280, 280, 1, () => {   // pressed imprint: blank rings + a simple star, no letters
  ctx.translate(140, 140); const pts = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, r = 110 * (1 + 0.08 * sin(5 * a) + 0.06 * sin(11 * a + 1) + (rnd(i + 70) - 0.5) * 0.08); pts.push([cos(a) * r, sin(a) * r]); }
  fillP(pts, '#8E1C16'); fillP(pts.map(([x, y]) => [x * 0.94 - 3, y * 0.94 - 3]), WAX);
  ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fillStyle = '#9A1F18'; ctx.fill();
  for (const r of [78, 60]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.strokeStyle = 'rgba(70,8,6,0.75)'; ctx.lineWidth = 5; ctx.stroke(); ctx.beginPath(); ctx.arc(-2, -2, r, PI, PI * 1.6); ctx.strokeStyle = 'rgba(224,87,74,0.8)'; ctx.lineWidth = 2.5; ctx.stroke(); }
  const st = []; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i / 10 * TAU, r = i % 2 ? 18 : 44; st.push([cos(a) * r, sin(a) * r]); }
  fillP(st, '#6E120D'); fillP(st.map(([x, y]) => [x * 0.9 - 2, y * 0.9 - 2]), WAXHI);
  ctx.fillStyle = 'rgba(255,200,180,0.45)'; ctx.beginPath(); ctx.ellipse(-56, -62, 20, 8, -0.7, 0, TAU); ctx.fill();
});
/** u = time relative to the impact; the seal is visible from u = -0.3 */
function sealSlam(x, y, u, s = 1) {
  if (u < -0.3) return;
  if (u < 0) { const k = clamp((u + 0.3) / 0.3), sy = lerp(-260, 0, k * k);   // falling wax blob + descending seal
    ctx.fillStyle = WAX; ctx.beginPath(); ctx.ellipse(x, y + sy * 0.4, 34 * s, 40 * s, 0, 0, TAU); ctx.fill();
    blit(sealImg(), 130, 150, x, y - 60 * s + sy, s * lerp(1.7, 1.05, k * k), clamp(k * 3)); return; }
  const sp = eo(clamp(u / 0.12)); blit(waxImg(), 140, 140, x, y, s * lerp(0.6, 1, sp));
  if (u < 0.7) { const r = (40 + u * 520) * s; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.9, 0, 0, TAU); ctx.strokeStyle = `rgba(176,38,30,${0.55 * (1 - u / 0.7)})`; ctx.lineWidth = 6 * (1 - u / 0.7) + 1; ctx.stroke(); }
  for (let i = 0; i < 9 && u < 0.5; i++) { const a = i / 9 * TAU + 0.3, d = (90 + eo(clamp(u / 0.3)) * 70) * s; ctx.fillStyle = `rgba(176,38,30,${1 - u * 2})`; ctx.beginPath(); ctx.arc(x + cos(a) * d, y + sin(a) * d * 0.9, (5 + rnd(i) * 7) * s, 0, TAU); ctx.fill(); }
  if (u < 0.55) { const lift = eio(clamp((u - 0.16) / 0.4)); blit(sealImg(), 130, 150, x + lift * 60 * s, y - 60 * s - lift * 420 * s, s * (1.05 + lift * 0.4), 1 - lift); }
}

// ───────────── night sea + ship (device 6) ─────────────
const seaImg = () => cached('aSea', W, 1320, 0.7, () => {
  ctx.fillStyle = (() => { const g = ctx.createLinearGradient(0, 160, 0, 1260); g.addColorStop(0, '#132548'); g.addColorStop(0.55, DEEP); g.addColorStop(1, '#2B4A7C'); return g; })(); ctx.fillRect(0, 0, W, 1320);
  washBlots(60, 160, 1020, 1000, 70, '#0E1C3A', 0.05, 0.16, 40, 160, 3); washBlots(60, 160, 1020, 1000, 40, MID, 0.04, 0.12, 30, 120, 9);
  const g = ctx.createRadialGradient(790, 340, 20, 790, 340, 300); g.addColorStop(0, 'rgba(169,188,214,0.5)'); g.addColorStop(1, 'rgba(169,188,214,0)'); ctx.fillStyle = g; ctx.fillRect(400, 0, 680, 700);
  ctx.fillStyle = '#E9DFC6'; ctx.beginPath(); ctx.arc(790, 340, 50, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(169,188,214,0.5)'; ctx.beginPath(); ctx.arc(808, 330, 44, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(790, 340, 50, 0, TAU); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(233,223,198,${0.25 + rnd(i + 4) * 0.6})`; ctx.beginPath(); ctx.arc(rnd(i + 11) * W, 180 + rnd(i + 33) * 620, 1 + rnd(i + 6) * 2, 0, TAU); ctx.fill(); }
});
const shipImg = () => cached('aShip', 880, 760, 1, () => {
  ctx.translate(430, 600);
  const masts = [[-150, -96, 380], [20, -90, 450], [175, -90, 350]];
  // rigging behind
  ctx.strokeStyle = 'rgba(43,29,20,0.8)'; ctx.lineWidth = 1.6; ctx.beginPath();
  for (const [x, b, h] of masts) { ctx.moveTo(x, b - h); ctx.lineTo(-290, -122); ctx.moveTo(x, b - h); ctx.lineTo(300, -120); }
  ctx.moveTo(175, -440); ctx.lineTo(410, -205); ctx.moveTo(20, -540); ctx.lineTo(410, -205); ctx.stroke();
  wob([[300, -122], [415, -200]], 5);   // bowsprit
  shape([[175, -430], [395, -212], [190, -230]], PALE, 2.5, 3); shape([[175, -330], [330, -170], [185, -180]], PALE, 2.5, 4);
  for (const [x, b, h] of masts) {
    for (let k = 0; k < 3; k++) {
      const ty = b - h * (0.95 - k * 0.29), by = ty + h * 0.25, w = 110 + k * 34;
      const pts = [[x - w / 2, ty], [x + w / 2, ty], [x + w / 2 + 10, by], [x, by + 16], [x - w / 2 - 10, by]];
      const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, MID); g.addColorStop(0.35, PALE); g.addColorStop(1, '#7F97BC');
      shape(pts, g, 3, x + k); ctx.save(); poly(pts); ctx.clip(); ctx.strokeStyle = 'rgba(43,29,20,0.35)'; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let j = 1; j < 4; j++) { ctx.moveTo(x - w / 2 + w * j / 4, ty); ctx.lineTo(x - w / 2 + w * j / 4 + (j - 2) * 6, by + 10); } ctx.stroke(); ctx.restore();
      wob([[x - w / 2 - 16, ty], [x + w / 2 + 16, ty]], 4);
    }
    wob([[x, b], [x, b - h - 30]], 6);
  }
  fillP([[20, -570], [20, -548], [70, -560]], WAX);
  const hull = [[-300, -70], [-292, -128], [-228, -134], [-200, -98], [180, -88], [300, -124], [322, -116], [254, -32], [196, 10], [-252, 10]];
  shape(hull, DEEP, 4.5, 2); hatch(() => poly(hull), -310, -140, 330, 12, 9, 'rgba(10,15,30,0.5)', 1.5);
  wob([[-280, -58], [-200, -62], [190, -54], [268, -70]], 3, PALE, 5);
  ctx.fillStyle = '#E9C778'; for (let x = -200; x <= 200; x += 44) ctx.fillRect(x, -48, 14, 11);
  wob([[-292, -128], [-228, -134], [-200, -98]], 3, BRASS, 6);
});
function waves(t, y0, rows = 4, gap = 80, from = 0, to = rows) {
  const cols = ['#2E4F84', '#264473', '#1D3760', '#152B4E', '#10223F'];
  for (let k = from; k < to; k++) {
    const y = y0 + k * gap, A = 13 + k * 6, ph = t * (1.6 + k * 0.45) + k * 1.7, kx = 0.013 - k * 0.0014, pts = [];
    for (let x = -60; x <= 1140; x += 24) pts.push([x, y + sin(x * kx + ph) * A + sin(x * kx * 2.3 - ph * 1.3) * A * 0.35]);
    ctx.beginPath(); ctx.moveTo(-60, 1400); pts.forEach(([x, yy]) => ctx.lineTo(x, yy)); ctx.lineTo(1140, 1400); ctx.closePath(); ctx.fillStyle = cols[k % 5]; ctx.fill();
    ctx.beginPath(); pts.forEach(([x, yy], i) => (i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy))); ctx.strokeStyle = 'rgba(8,12,24,0.85)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); for (let i = 0; i < pts.length; i++) { const [x, yy] = pts[i]; if ((i + k) % 2) continue; ctx.moveTo(x, yy + 6); ctx.lineTo(x - 12, yy + 26 + k * 3); } ctx.strokeStyle = 'rgba(169,188,214,0.45)'; ctx.lineWidth = 2; ctx.stroke();
  }
}
function sea(t, shipX = 520, shipY = 930, shipS = 0.95) {
  blit(seaImg(), 0, 0, 0, 0);
  waves(t, shipY - 60, 5, 78, 0, 1);
  const rot = 0.075 * sin(t * 2.7), bob = 12 * sin(t * 2.7 + 1.2);
  blitR(shipImg(), 430, 600, shipX, shipY + bob, shipS, rot);
  waves(t, shipY - 60, 5, 78, 1, 5);
}

// ───────────── sea chart (device 5) ─────────────
const IND = [[474, 160], [474, 200], [426, 224], [378, 296], [314, 392], [262, 470], [236, 560], [228, 632], [212, 680], [214, 730], [212, 762], [186, 806], [160, 834], [138, 867], [112, 850], [90, 824], [60, 700], [40, 400], [40, 160]];
const LANKA = [[224, 786], [252, 820], [276, 880], [270, 940], [237, 973], [214, 940], [208, 880], [214, 820]];
const MALAY = [[662, 160], [666, 200], [672, 488], [740, 470], [781, 464], [800, 600], [810, 776], [804, 872], [840, 930], [866, 975], [874, 1010], [880, 1054], [928, 1150], [980, 1194], [1060, 1220], [1060, 160]];
const SUMATRA = [[708, 987], [740, 990], [778, 1006], [820, 1070], [858, 1136], [900, 1200], [940, 1280], [860, 1300], [790, 1200], [740, 1080]];
const SIVA = [170, 783], PEN = [846, 1000];
const ROUTE = [[218, 700], [330, 730], [470, 770], [600, 820], [700, 900], [790, 970], [836, 996]];
const chartImg = () => cached('aChart', W, 1320, 1.5, () => {
  ctx.fillStyle = '#C6D2E2'; ctx.fillRect(0, 0, W, 1320); washBlots(80, 160, 1000, 1280, 60, MID, 0.04, 0.12, 30, 140, 21);
  // rhumb lines from the compass rose
  ctx.strokeStyle = 'rgba(43,29,20,0.22)'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.moveTo(470, 560); ctx.lineTo(470 + cos(a) * 1400, 560 + sin(a) * 1400); } ctx.stroke();
  for (const land of [IND, LANKA, MALAY, SUMATRA]) { fillP(land, '#E6D9B8'); ctx.save(); poly(land); ctx.clip(); washBlots(0, 0, W, 1320, 30, '#B79F6E', 0.05, 0.12, 20, 80, land.length); ctx.restore();
    ctx.save(); ctx.translate(5, 5); wob(land, 6, 'rgba(78,110,158,0.45)', 3, true); ctx.restore(); wob(land, 3.5, INK, land.length, true); }
  fillP([[614, 668], [620, 680], [616, 700], [610, 686]], '#E6D9B8'); wob([[614, 668], [620, 680], [616, 700], [610, 686]], 2.5, INK, 4, true);
  fillP([[640, 864], [646, 872], [640, 884], [636, 874]], '#E6D9B8'); wob([[640, 864], [646, 872], [640, 884], [636, 874]], 2.5, INK, 5, true);
  ctx.beginPath(); ctx.ellipse(PEN[0], PEN[1], 11, 14, 0.3, 0, TAU); ctx.fillStyle = '#E6D9B8'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  // hatched wave marks
  ctx.strokeStyle = 'rgba(31,58,104,0.45)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 0; i < 70; i++) { const x = 300 + rnd(i + 5) * 600, y = 200 + rnd(i + 9) * 1050; if (x < 480 - (y - 200) * 0.2 || x > 640 + (y - 200) * 0.12) continue; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 9, y - 7, x + 18, y); ctx.quadraticCurveTo(x + 27, y + 7, x + 36, y); } ctx.stroke();
  // compass rose in brass
  ctx.save(); ctx.translate(470, 560);
  for (const r of [92, 78]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.strokeStyle = BRASS; ctx.lineWidth = 4; ctx.stroke(); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - PI / 2, r = i % 2 ? 52 : 108, b = a + PI / 8, c = a - PI / 8;
    fillP([[0, 0], [cos(c) * 18, sin(c) * 18], [cos(a) * r, sin(a) * r]], i % 2 ? '#A07A2C' : BRASS); fillP([[0, 0], [cos(b) * 18, sin(b) * 18], [cos(a) * r, sin(a) * r]], i % 2 ? '#7A5A22' : '#E2C27A');
    wob([[cos(c) * 18, sin(c) * 18], [cos(a) * r, sin(a) * r], [cos(b) * 18, sin(b) * 18]], 2, INK, i); }
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
});
function routeTo(p, t) {
  const pts = []; for (let i = 0; i < ROUTE.length - 1; i++) for (let j = 0; j < 10; j++) { const f = j / 10; pts.push([lerp(ROUTE[i][0], ROUTE[i + 1][0], f), lerp(ROUTE[i][1], ROUTE[i + 1][1], f)]); } pts.push(ROUTE[ROUTE.length - 1]);
  const n = Math.max(1, Math.floor(p * (pts.length - 1))); ctx.beginPath(); for (let i = 0; i <= n; i++) i ? ctx.lineTo(...pts[i]) : ctx.moveTo(...pts[i]);
  ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = WAX; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke(); ctx.setLineDash([]);
  const a = pts[n], b = pts[Math.max(0, n - 1)]; return [a[0], a[1], Math.atan2(a[1] - b[1], a[0] - b[0])];
}
function chartWaves(t) { ctx.strokeStyle = 'rgba(31,58,104,0.5)'; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i < 16; i++) { const x = 330 + ((rnd(i) * 420 + t * 60) % 420), y = 300 + rnd(i + 4) * 800 + sin(t * 2 + i) * 6; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 12, y - 9, x + 24, y); ctx.quadraticCurveTo(x + 36, y + 9, x + 48, y); } ctx.stroke(); }

// ───────────── figures (faceless, outline + wash) ─────────────
function head(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = '#EFE6CF'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); }
function limb(pts, w, col) { wob(pts, w + 5, INK, pts[0][0]); wob(pts, w, col, pts[0][0] + 1); }
function brother(x, h, side) {
  const sx = x + side * h * 0.21;
  wob([[sx, -h * 0.01], [sx, -h * 1.1]], 6);
  shape([[sx, -h * 1.24], [sx + 15, -h * 1.15], [sx, -h * 1.1], [sx - 15, -h * 1.15]], BRASS, 3, 9);
  limb([[x - h * 0.05, -h * 0.26], [x - h * 0.075, -h * 0.01]], 11, MID); limb([[x + h * 0.05, -h * 0.26], [x + h * 0.08, -h * 0.01]], 11, MID);
  const vest = [[x - h * 0.09, -h * 0.53], [x + h * 0.09, -h * 0.53], [x + h * 0.13, -h * 0.2], [x - h * 0.13, -h * 0.2]];
  shape(vest, PALE, 4, x); wob([[x - h * 0.02, -h * 0.5], [x - h * 0.05, -h * 0.22]], 2, 'rgba(43,29,20,0.6)'); wob([[x + h * 0.04, -h * 0.5], [x + h * 0.07, -h * 0.22]], 2, 'rgba(43,29,20,0.6)');
  const torso = [[x - h * 0.13, -h * 0.79], [x + h * 0.13, -h * 0.79], [x + h * 0.09, -h * 0.53], [x - h * 0.09, -h * 0.53]];
  shape(torso, MID, 4, x + 3); hatch(() => poly(torso), x - h * 0.14, -h * 0.8, x + h * 0.14, -h * 0.52, 10, 'rgba(15,25,50,0.45)', 1.6, side);
  wob([[x - side * h * 0.12, -h * 0.78], [x + side * h * 0.08, -h * 0.54]], 7, WAX, 4);   // red sash
  limb([[x + side * h * 0.12, -h * 0.77], [x + side * h * 0.19, -h * 0.64], [sx, -h * 0.71]], 13, MID);
  limb([[x - side * h * 0.12, -h * 0.77], [x - side * h * 0.16, -h * 0.61], [x - side * h * 0.15, -h * 0.47]], 13, MID);
  limb([[x, -h * 0.8], [x, -h * 0.84]], 14, MID);
  head(x, -h * 0.885, h * 0.052, h * 0.066);
  shape([[x - h * 0.066, -h * 0.9], [x - h * 0.06, -h * 0.95], [x - h * 0.02, -h * 0.975], [x + h * 0.04, -h * 0.97], [x + h * 0.068, -h * 0.935], [x + h * 0.062, -h * 0.9]], DEEP, 3.5, x + 7);
  ctx.beginPath(); ctx.ellipse(x + side * h * 0.045, -h * 0.97, h * 0.03, h * 0.022, 0, 0, TAU); ctx.fillStyle = DEEP; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  wob([[x - h * 0.06, -h * 0.925], [x + h * 0.06, -h * 0.945]], 2.5, PALE, 3); wob([[x - h * 0.055, -h * 0.945], [x + h * 0.05, -h * 0.962]], 2.5, PALE, 4);
}
const broImg = () => cached('aBro', 900, 1160, 1, () => {
  ctx.translate(450, 1120);
  ctx.fillStyle = 'rgba(31,58,104,0.25)'; ctx.beginPath(); ctx.ellipse(0, 4, 400, 34, 0, 0, TAU); ctx.fill();
  wob([[-420, 8], [420, 4]], 3); ctx.strokeStyle = 'rgba(43,29,20,0.4)'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let x = -400; x < 400; x += 16) { ctx.moveTo(x, 10); ctx.lineTo(x - 14, 30); } ctx.stroke();
  brother(-190, 860, -1); brother(190, 810, 1);
});
const coatImg = () => cached('aCoat', 180, 340, 1.2, () => {
  ctx.translate(90, 330); const h = 280;
  wob([[40, -h * 0.6], [70, -h * 1.12]], 5); wob([[70, -h * 1.12], [76, -h * 1.22]], 3, '#E9DFC6');   // musket + bayonet
  limb([[-10, -h * 0.4], [-16, -2]], 9, PAPER); limb([[10, -h * 0.4], [18, -2]], 9, PAPER);
  const coat = [[-30, -h * 0.76], [30, -h * 0.76], [26, -h * 0.4], [34, -h * 0.28], [-34, -h * 0.28], [-26, -h * 0.4]];
  shape(coat, WAX, 3.5, 4); fillP([[-30, -h * 0.76], [-10, -h * 0.76], [-14, -h * 0.4], [-26, -h * 0.4]], 'rgba(224,87,74,0.6)');
  wob([[-26, -h * 0.74], [24, -h * 0.42]], 5, PWHITE); wob([[26, -h * 0.74], [-24, -h * 0.42]], 5, PWHITE);
  limb([[26, -h * 0.72], [42, -h * 0.58]], 9, WAX);
  head(0, -h * 0.83, 15, 19);
  shape([[-16, -h * 0.86], [16, -h * 0.86], [18, -h * 1.02], [-18, -h * 1.02]], INK, 2, 6); ctx.fillStyle = BRASS; ctx.fillRect(-5, -h * 0.97, 10, 10);
});
const manImg = (up) => cached(`aMan${up ? 'U' : ''}`, 140, 260, 1, () => {
  ctx.translate(70, 250); const h = 220;
  limb([[-9, -h * 0.35], [-12, -2]], 9, MID); limb([[9, -h * 0.35], [12, -2]], 9, MID);
  shape([[-24, -h * 0.75], [24, -h * 0.75], [20, -h * 0.32], [-20, -h * 0.32]], MID, 3.5, 3);
  if (up) { limb([[-22, -h * 0.72], [-38, -h * 0.92], [-44, -h * 1.08]], 9, MID); limb([[22, -h * 0.72], [38, -h * 0.92], [44, -h * 1.08]], 9, MID); }
  else { limb([[-22, -h * 0.72], [-28, -h * 0.5]], 9, MID); limb([[22, -h * 0.72], [28, -h * 0.5]], 9, MID); }
  head(0, -h * 0.85, 15, 19);
});
const boyImg = () => cached('aBoy', 160, 300, 1, () => {
  ctx.translate(80, 290); const h = 250;
  limb([[-9, -h * 0.35], [-11, -2]], 10, MID); limb([[9, -h * 0.35], [11, -2]], 10, MID);
  shape([[-24, -h * 0.72], [24, -h * 0.72], [20, -h * 0.34], [-20, -h * 0.34]], PALE, 3.5, 3);
  limb([[-22, -h * 0.7], [-28, -h * 0.48]], 9, PALE); limb([[22, -h * 0.7], [30, -h * 0.5]], 9, PALE);
  head(0, -h * 0.84, 19, 24);
});
const railImg = () => cached('aRail', W, 520, 1, () => {   // ship rail in the foreground (deck at bottom)
  const deck = [[-40, 300], [1120, 300], [1120, 520], [-40, 520]]; fillP(deck, '#3A2A1C'); hatch(() => poly(deck), -40, 300, 1120, 520, 12, 'rgba(0,0,0,0.5)', 2);
  ctx.strokeStyle = 'rgba(184,154,106,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let y = 330; y < 520; y += 34) { ctx.moveTo(-40, y); ctx.lineTo(1120, y); } ctx.stroke();
  for (let x = 10; x < 1080; x += 70) { const b = [[x, 120], [x + 18, 120], [x + 22, 300], [x - 4, 300]]; shape(b, '#5A4028', 3, x); }
  const r = [[-40, 96], [1120, 96], [1120, 128], [-40, 128]]; shape(r, '#6E4E30', 4, 2); wob([[-40, 104], [1120, 104]], 2.5, '#C79A3E', 3);
  ctx.save(); ctx.translate(880, 250);   // coiled hemp rope on deck
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0, 0, 90 - i * 18, 34 - i * 7, 0, 0, TAU); ctx.strokeStyle = HEMP; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
});

// ───────────── walls + proclamation sheets (device 8) ─────────────
const templeImg = () => cached('aTemple', W, 1320, 1, () => {
  let g = ctx.createLinearGradient(0, 170, 0, 900); g.addColorStop(0, '#8FA6C8'); g.addColorStop(1, '#D7DCE0'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1320);
  washBlots(80, 170, 1000, 800, 40, MID, 0.04, 0.12, 40, 140, 31);
  // gopuram: stacked tiers
  const cx = 540, base = 760; let y = base;
  for (let k = 0; k < 7; k++) { const w0 = 560 - k * 56, w1 = w0 - 40, hh = 72 - k * 3, pts = [[cx - w0 / 2, y], [cx + w0 / 2, y], [cx + w1 / 2, y - hh], [cx - w1 / 2, y - hh]];
    shape(pts, k % 2 ? '#7E93B4' : '#93A6C4', 3.5, k); hatch(() => poly(pts), cx + w1 * 0.18, y - hh, cx + w0 / 2, y, 8, 'rgba(20,35,70,0.5)', 1.5);
    ctx.fillStyle = 'rgba(20,30,60,0.7)'; for (let j = -3; j <= 3; j++) { const nx = cx + j * w1 / 8; ctx.fillRect(nx - 9, y - hh + 16, 18, hh - 26); }
    wob([[cx - w1 / 2 - 8, y - hh], [cx + w1 / 2 + 8, y - hh]], 3); y -= hh; }
  const top = [[cx - 150, y], [cx + 150, y], [cx + 160, y - 40], [cx + 110, y - 90], [cx - 110, y - 90], [cx - 160, y - 40]]; shape(top, '#6F86AA', 4, 9);
  for (let j = -2; j <= 2; j++) { const fx = cx + j * 50; shape([[fx - 9, y - 90], [fx + 9, y - 90], [fx + 4, y - 120], [fx, y - 132], [fx - 4, y - 120]], BRASS, 2.5, j + 20); }
  // enclosure wall where the sheets go
  const wall = [[60, 760], [1020, 760], [1020, 1190], [60, 1190]]; g = ctx.createLinearGradient(0, 760, 0, 1190); g.addColorStop(0, '#C9C2AE'); g.addColorStop(1, '#A7A08A'); shape(wall, g, 4, 3);
  ctx.strokeStyle = 'rgba(43,29,20,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let yy = 800; yy < 1190; yy += 56) { ctx.moveTo(60, yy); ctx.lineTo(1020, yy); for (let xx = 60 + ((yy / 56) % 2) * 60; xx < 1020; xx += 120) { ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 56); } } ctx.stroke();
  shape([[40, 740], [1040, 740], [1040, 776], [40, 776]], '#8C8572', 3.5, 5); washBlots(60, 780, 1020, 1190, 40, MID, 0.03, 0.09, 20, 90, 41);
  fillP([[60, 1190], [1020, 1190], [1020, 1320], [60, 1320]], '#5E5A4C'); hatch(() => poly([[60, 1190], [1020, 1190], [1020, 1320], [60, 1320]]), 60, 1190, 1020, 1320, 12, 'rgba(0,0,0,0.4)', 2);
});
const fortImg = () => cached('aFort', W, 1320, 1, () => {
  let g = ctx.createLinearGradient(0, 170, 0, 900); g.addColorStop(0, '#2A4677'); g.addColorStop(1, '#7E93B4'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1320);
  washBlots(80, 170, 1000, 700, 40, DEEP, 0.06, 0.16, 40, 160, 51);
  // the rock + upper fort silhouette in the distance
  fillP([[120, 560], [260, 430], [380, 360], [470, 330], [560, 360], [640, 440], [760, 520], [900, 560]], '#41598A'); wob([[120, 560], [260, 430], [380, 360], [470, 330], [560, 360], [640, 440], [760, 520], [900, 560]], 3);
  shape([[440, 340], [500, 340], [500, 280], [470, 250], [440, 280]], '#566E9C', 3, 7);
  // fort wall with merlons + a round bastion
  const wall = [[60, 640], [1020, 640], [1020, 1190], [60, 1190]]; g = ctx.createLinearGradient(0, 640, 0, 1190); g.addColorStop(0, '#B7B1A0'); g.addColorStop(1, '#8F8977'); shape(wall, g, 4, 3);
  for (let x = 60; x < 1020; x += 80) shape([[x + 6, 640], [x + 50, 640], [x + 50, 590], [x + 6, 590]], '#A9A392', 3, x);
  const bas = [[780, 1190], [780, 600], [1030, 600], [1030, 1190]]; shape(bas, '#9C9684', 4, 8); hatch(() => poly(bas), 900, 600, 1030, 1190, 9, 'rgba(20,20,30,0.45)', 1.6);
  for (let x = 784; x < 1030; x += 62) shape([[x, 600], [x + 36, 600], [x + 36, 556], [x, 556]], '#A9A392', 3, x + 2);
  ctx.strokeStyle = 'rgba(43,29,20,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let yy = 680; yy < 1190; yy += 50) { ctx.moveTo(60, yy); ctx.lineTo(1020, yy); for (let xx = 60 + ((yy / 50) % 2) * 50; xx < 1020; xx += 100) { ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 50); } } ctx.stroke();
  const gate = [[110, 1190], [110, 980], [170, 920], [230, 980], [230, 1190]]; shape(gate, '#1A2238', 4, 4);
  washBlots(60, 640, 1020, 1190, 40, DEEP, 0.03, 0.1, 20, 90, 61);
  fillP([[60, 1190], [1020, 1190], [1020, 1320], [60, 1320]], '#4C4A40'); hatch(() => poly([[60, 1190], [1020, 1190], [1020, 1320], [60, 1320]]), 60, 1190, 1020, 1320, 12, 'rgba(0,0,0,0.4)', 2);
});
const sheetImg = (seed) => cached(`aSheet${seed}`, 300, 400, 1.5, () => {
  const R = (i) => rnd(seed * 50 + i), pts = []; const n = 14;
  for (let i = 0; i <= n; i++) pts.push([10 + 280 * i / n, 10 + (R(i) - 0.5) * 6]); for (let i = 0; i <= n; i++) pts.push([290 + (R(i + 20) - 0.5) * 6, 10 + 380 * i / n]);
  for (let i = n; i >= 0; i--) pts.push([10 + 280 * i / n, 390 + (R(i + 40) - 0.5) * 6]); for (let i = n; i >= 0; i--) pts.push([10 + (R(i + 60) - 0.5) * 6, 10 + 380 * i / n]);
  const g = ctx.createRadialGradient(150, 180, 30, 150, 200, 280); g.addColorStop(0, '#F3EBD7'); g.addColorStop(1, '#D8CBA6'); fillP(pts, g); wob(pts, 2, 'rgba(43,29,20,0.6)', seed, true);
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); let x = 60; while (x < 230) { const lw = 18 + R(x) * 26; ctx.moveTo(x, 56); ctx.bezierCurveTo(x + lw * 0.3, 46, x + lw * 0.6, 64, x + lw, 54); x += lw + 12; } ctx.stroke();
  ctx.beginPath(); ctx.arc(150, 120, 26, 0, TAU); ctx.strokeStyle = 'rgba(43,29,20,0.7)'; ctx.lineWidth = 3; ctx.stroke(); ctx.beginPath(); ctx.arc(150, 120, 16, 0, TAU); ctx.stroke();
  ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(43,29,20,0.75)'; ctx.beginPath();
  for (let r = 0; r < 9; r++) { const yy = 168 + r * 24; let xx = 34 + (r === 0 ? 20 : 0); for (let k = 0; xx < 262 && k < 20; k++) { const f = R(r * 30 + k + 100), lw = 8 + f * 22; ctx.moveTo(xx, yy); ctx.bezierCurveTo(xx + lw * 0.3, yy - 6 * f, xx + lw * 0.6, yy + 4, xx + lw, yy - 1); xx += lw + 6 + f * 8; } }
  ctx.stroke(); ctx.fillStyle = 'rgba(150,110,60,0.12)'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(30 + R(i + 200) * 240, 30 + R(i + 220) * 340, 6 + R(i + 240) * 16, 0, TAU); ctx.fill(); }
});
/** a sheet slapped onto a surface: (x, y) = top centre, u = time since the slap began (impact at 0.13), flut = corner flutter 0..1 */
function sheet(x, y, s, rot, u, t, seed, flut = 0.5) {
  if (u < 0) return; const k = eo(clamp(u / 0.13)), sc = s * lerp(1.8, 1, k);
  ctx.save(); ctx.translate(x + (1 - k) * 120, y - (1 - k) * 80); ctx.rotate(rot + (1 - k) * 0.35); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(u / 0.05);
  const sh = flut * 0.05 * sin(t * 6.5 + seed * 2) + flut * 0.025 * sin(t * 13 + seed);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-140 + 8, 8, 280, 380);
  ctx.transform(1, 0, sh, 1, 0, 0); ctx.drawImage(sheetImg(seed), -150, 0, 300, 400);
  const c = flut * (18 + 22 * (0.5 + 0.5 * sin(t * 8 + seed * 3)));   // lifting bottom corner
  if (c > 3) { fillP([[140, 390 - c], [140 - c, 390], [140, 390]], 'rgba(40,30,20,0.55)'); fillP([[140, 390 - c], [140 - c, 390], [140 - c * 0.85, 390 - c * 0.85]], '#D8CBA6'); }
  if (u > 0.12) { const p = eo(clamp((u - 0.12) / 0.2)); ctx.globalAlpha *= 0.5 - 0.25 * clamp((u - 0.5) / 1);   // wet paste brush strokes
    ctx.strokeStyle = 'rgba(243,235,215,0.7)'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-150, 18); ctx.lineTo(-150 + 300 * p, 12 + 8 * p); ctx.moveTo(150, 360); ctx.lineTo(150 - 300 * p, 368); ctx.stroke(); }
  ctx.restore();
  if (u > 0.12 && u < 0.6) { const q = (u - 0.12) / 0.48; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, d = 80 + q * 160; ctx.fillStyle = `rgba(233,223,198,${0.6 * (1 - q)})`; ctx.beginPath(); ctx.arc(x + cos(a) * d * s * 1.4, y + 200 * s + sin(a) * d * s, 6 * (1 - q) + 2, 0, TAU); ctx.fill(); } }
}

// ───────────── ledger tally (device 2) ─────────────
const TX = 690, TY0 = 300, TROW = 96;   // tally column on the cleared page strip
function tally(n, t) {
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineCap = 'round'; const full = Math.floor(n), part = n - full; let nib = null;
  ctx.beginPath();
  for (let i = 0; i <= full && i < 80; i++) {
    const p = i < full ? 1 : part; if (p <= 0) break; const g = Math.floor(i / 5), j = i % 5, row = Math.floor(g / 3), col = g % 3, gx = TX + col * 98, gy = TY0 + row * TROW;
    let a, b; if (j < 4) { a = [gx + j * 17 + (rnd(i) - 0.5) * 3, gy - 26]; b = [gx + j * 17 + 2, gy + 26]; } else { a = [gx - 10, gy + 18]; b = [gx + 66, gy - 18]; }
    const e = [lerp(a[0], b[0], p), lerp(a[1], b[1], p)]; ctx.moveTo(a[0], a[1]); ctx.lineTo(e[0], e[1]); if (i === full || p < 1) nib = e; else nib = e;
  }
  ctx.stroke();
  if (nib) { ctx.save(); ctx.translate(nib[0], nib[1]); ctx.rotate(-0.6); fillP([[0, 0], [10, -60], [-6, -60]], '#3A3A40'); wob([[2, -60], [22, -240]], 9, '#E9DFC6'); wob([[2, -60], [22, -240]], 3, 'rgba(43,29,20,0.5)'); ctx.restore(); }
}
function strike(p, rows = 9) {   // red ink strike-through across the abstract rows
  ctx.strokeStyle = WAX; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
  for (let r = 0; r < rows; r++) { const q = clamp(p * rows - r); if (q <= 0) break; const y = 130 + 1180 * (r + 3.5) / 18 - 6, x0 = 200, x1 = lerp(x0, 600, q); ctx.moveTo(x0, y + 4); ctx.quadraticCurveTo((x0 + x1) / 2, y - 6 + rnd(r) * 6, x1, y + 2 * sin(r)); }
  ctx.stroke();
}

// ───────────── rope (device 4) ─────────────
function ropePath(y, sag, t) { ctx.beginPath(); for (let x = -60; x <= 1140; x += 30) { const yy = y + sag * sin(PI * (x + 60) / 1200) + sin(t * 30 + x * 0.02) * sag * 0.04; x > -60 ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } }
function rope(y, sag, t) {
  ropePath(y, sag, t); ctx.lineCap = 'butt'; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 34; ctx.stroke();
  ctx.strokeStyle = HEMP; ctx.lineWidth = 26; ctx.stroke();
  ctx.setLineDash([7, 9]); ctx.strokeStyle = '#7A5E36'; ctx.lineWidth = 26; ctx.lineDashOffset = -t * 300; ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(233,210,160,0.6)'; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ropePath(y - 13, sag, t); ctx.stroke(); ropePath(y + 13, sag, t); ctx.stroke();
}

// ───────────── misc per-frame bits ─────────────
function specks(t, n, seed, col = '169,188,214', a = 0.5) { for (let i = 0; i < n; i++) { const x = 100 + rnd(i + seed) * 880, y = 190 + ((rnd(i * 3 + seed) * 1060 - t * (20 + rnd(i) * 40)) % 1060 + 1060) % 1060; ctx.fillStyle = `rgba(${col},${a * (0.4 + 0.6 * rnd(i + 2))})`; ctx.beginPath(); ctx.arc(x, y, 1.5 + rnd(i + 5) * 2.5, 0, TAU); ctx.fill(); } }
function leaves(t, n = 7, seed = 3) {
  for (let i = 0; i < n; i++) { const ph = (t * (0.25 + rnd(i + seed) * 0.15) + rnd(i * 5 + seed)) % 1, x = 140 + rnd(i * 7 + seed) * 760 + sin(t * 2 + i) * 40, y = 180 + ph * 1060, r = t * 2 + i;
    ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.globalAlpha = clamp(ph * 8) * clamp((1 - ph) * 8);
    fillP([[0, -18], [10, -4], [7, 12], [0, 18], [-7, 12], [-10, -4]], i % 2 ? '#A0622C' : '#C08A3C'); wob([[0, -18], [0, 18]], 1.6, INK, i); ctx.restore(); }
}

// ═════════════════════════ SHOTS ═════════════════════════
export function buildA(add, cue) {
  const s0 = 0, s1 = Wd('exile', 0), s2 = Wd('rebel', 0), s3 = L(1), s4 = Wd('eighteen', 1), s5 = Wd('The', 1), s6 = Wd('Periya', 1), s7 = Wd('rose', 1), s8 = Wd('East', 1);
  const s9 = L(2), s10 = Wd('pasted', 2), s11 = Wd('and', 2), s12 = Wd('calling', 2), s13 = L(3), s14 = Wd('crushed', 3), sEnd = L(4);
  const tSon = Wd('son', 0), tOne = Wd('one', 1), tChinna = Wd('Chinna', 1), tJune = Wd('June', 2), tProc = Wd('proclamation', 2), tSri = Wd('Srirangam', 2), tTri = Wd('Trichy', 2), tAut = Wd('autumn', 3);

  // a0 · THE HOOK: wash bloom races over the page revealing a ship pitching on a night sea; wax seal slams at 0.0
  add({ id: 'a0_hook', at: s0, cam: [540, 820], zoom: 0.14, note: 'hook: indigo wash bloom races across, ship pitching on night sea, red wax seal slam at 0.0',
    draw(lt, d, t) {
      teak(); page(1);
      bloom(230, 420, 160 + eo(clamp(lt / 0.9)) * 1150, 1, t, () => sea(t), DEEP);
      inWin(() => { const r2 = 60 + eo(clamp((lt - 0.25) / 0.8)) * 260; if (lt > 0.25) { bloomPath(820, 360, r2, 4, t); ctx.fillStyle = 'rgba(14,28,58,0.12)'; ctx.fill(); } });
      specks(t, 24, 3);
      sealSlam(830, 1120, lt - 0.06, 0.9);
    } });
  cue(0, 'slam', { gain: 1 }); cue(0, 'whoosh', { gain: 0.8, dur: 0.9 }); cue(0.4, 'rumble', { gain: 0.4, dur: 2.5 });

  // a1 · the route: dotted red line races across the Bay to PENANG with a tiny ship at its head
  add({ id: 'a1_route', at: s1, cam: [700, 860], zoom: 0.16, note: 'chart bloom: dotted route from the Tamil coast races to PENANG, tiny ship at the head',
    draw(lt, d, t) {
      teak(); page(2);
      bloom(220, 700, 120 + eo(clamp(lt / 0.5)) * 1300, 2, t, () => { blit(chartImg(), 0, 0, 0, 0); chartWaves(t);
        const [hx, hy, ha] = routeTo(eio(clamp((lt - 0.05) / 0.75)), t); blitR(shipImg(), 430, 600, hx, hy + 8, 0.14, ha * 0.15 + 0.05 * sin(t * 5));
        if (lt > 0.75) { const q = clamp((lt - 0.75) / 0.4); ctx.beginPath(); ctx.arc(PEN[0], PEN[1], 18 + q * 70, 0, TAU); ctx.strokeStyle = `rgba(176,38,30,${0.8 * (1 - q)})`; ctx.lineWidth = 5; ctx.stroke(); } }, MID, 0.4);
      lab('PENANG', 800, 1110, 50, lt - 0.72);
    } });
  cue(s1 + 0.02, 'zip', { gain: 0.6, dur: 0.7, pan: 0.3 }); cue(s1 + 0.75, 'pop', { gain: 0.7, pan: 0.5 });

  // a2 · a faceless boy at the ship rail, night sea beyond; the seal stamps again on "son"
  add({ id: 'a2_boy', at: s2, cam: [560, 780], zoom: 0.12, note: 'faceless boy at a pitching ship rail at night; wax seal stamps on "son"',
    draw(lt, d, t) {
      teak(); page(3);
      bloom(560, 700, 300 + eo(clamp(lt / 0.5)) * 1100, 3, t, () => {
        blit(seaImg(), 0, 0, 0, 0); waves(t, 760, 3, 70, 0, 3);
        const rot = 0.04 * sin(t * 2.4), bob = 10 * sin(t * 2.4 + 1);
        ctx.save(); ctx.translate(540, 900 + bob); ctx.rotate(rot); ctx.translate(-540, -900);
        blit(boyImg(), 80, 290, 560, 1010, 1.25); blit(railImg(), 0, 0, 0, 840);
        ctx.restore(); }, DEEP);
      specks(t, 18, 7);
      sealSlam(850, 330, t - tSon, 0.72);
    } });
  cue(tSon, 'thud', { gain: 0.9, pan: 0.4 });

  // a3 · SIVAGANGA: chart close-up, a wash bloom spreads from the town, a red wax pin drops
  add({ id: 'a3_siva', at: s3, cam: [420, 700], zoom: 0.16, note: 'chart zoom on south India: bloom spreads from SIVAGANGA, wax pin drops',
    draw(lt, d, t) {
      teak(); page(4);
      const z = 2.3 - 0.25 * eo(clamp(lt / d));
      inWin(() => { blit(chartImg(), SIVA[0], SIVA[1], 420, 720, z); });
      bloom(420, 720, 40 + eo(clamp(lt / 0.7)) * 380, 5, t, () => { ctx.fillStyle = 'rgba(31,58,104,0.35)'; ctx.fillRect(0, 0, W, 1320); }, DEEP, 0.7);
      const k = clamp(lt / 0.18), py = lerp(400, 720, k * k); ctx.fillStyle = WAX; ctx.beginPath(); ctx.ellipse(420, py, 22, 26 - 6 * clamp((lt - 0.18) / 0.1), 0, 0, TAU); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
      if (lt > 0.18) { const q = clamp((lt - 0.18) / 0.6); ctx.beginPath(); ctx.arc(420, 720, 30 + q * 200, 0, TAU); ctx.strokeStyle = `rgba(176,38,30,${0.7 * (1 - q)})`; ctx.lineWidth = 5; ctx.stroke(); }
      lab('SIVAGANGA', 600, 560, 62, lt - 0.15);
    } });
  cue(s3, 'whoosh', { gain: 0.6, dur: 0.5 }); cue(s3 + 0.18, 'plop', { gain: 0.8, pan: -0.2 });

  // a4 · 1801: ledger page, header inked, tally strokes counted by an unseen nib
  add({ id: 'a4_ledger', at: s4, cam: [600, 600], zoom: 0.14, note: 'ledger page: SIVAGANGA, 1801 header; tally strokes inked one by one',
    draw(lt, d, t) {
      teak(); page(5, true, -0.01);
      lab('SIVAGANGA, 1801', 520, 230, 66, lt - 0.05);
      tally(clamp(lt / d) * 14, t);
      specks(t, 10, 11, '43,29,20', 0.25);
    } });
  cue(s4, 'slide', { gain: 0.5 }); for (let i = 0; i < 5; i++) cue(s4 + 0.15 + i * 0.22, 'tock', { gain: 0.35, pan: 0.4 }); cue(tOne, 'pop', { gain: 0.5 });

  // a5 · the two faceless brothers bloom out of the wash (ILLUSTRATION)
  add({ id: 'a5_bros', at: s5, cam: [540, 760], zoom: 0.1, note: 'two faceless brothers with spears bloom out of indigo wash; MARUTHU BROTHERS, ILLUSTRATION',
    draw(lt, d, t) {
      teak(); page(6);
      bloom(540, 820, 150 + eo(clamp(lt / 0.6)) * 900, 6, t, () => { ctx.fillStyle = '#C3CEDE'; ctx.fillRect(0, 0, W, 1320);
        bloomPath(540, 760, 420, 9, t); ctx.fillStyle = 'rgba(78,110,158,0.35)'; ctx.fill(); blit(broImg(), 450, 1120, 540, 1225, 0.92 + 0.03 * eo(clamp(lt / d))); }, DEEP, 0.5);
      lab('MARUTHU BROTHERS', 540, 245, 60, lt - 0.12);
      tag('ILLUSTRATION', 850, 1230, lt - 0.3);
    } });
  cue(s5, 'swell', { gain: 0.6, dur: 1.2 });

  // a6 · camera slides across the brothers: PERIYA, then CHINNA
  add({ id: 'a6_names', at: s6, cam: [540, 640], zoom: 0.08, note: 'push in and slide across the brothers; PERIYA then CHINNA tags; ILLUSTRATION kept',
    draw(lt, d, t) {
      teak(); page(6);
      const pan = lerp(170, -170, eio(clamp(lt / d)));
      inWin(() => { ctx.fillStyle = '#C3CEDE'; ctx.fillRect(0, 0, W, 1320); bloomPath(540 + pan, 760, 520, 9, t); ctx.fillStyle = 'rgba(78,110,158,0.35)'; ctx.fill();
        blit(broImg(), 450, 1120, 540 + pan, 1440, 1.25); blit(granImg(), 0, 0, 0, 0, 1, 0.5); });
      winEdge();
      tag('ILLUSTRATION', 850, 1230, 1);
      lab('PERIYA', 300 + pan, 230, 64, lt);
      lab('CHINNA', 780 + pan, 230, 64, t - tChinna);
    } });
  cue(s6, 'pop', { gain: 0.6, pan: -0.4 }); cue(tChinna, 'pop', { gain: 0.6, pan: 0.4 });

  // a7 · "rose": the brothers rise up into frame, a deep indigo bloom bursts behind, spears lift
  add({ id: 'a7_rise', at: s7, cam: [540, 700], zoom: 0.12, note: 'brothers rise into frame, deep indigo bloom bursts behind them, spatter',
    draw(lt, d, t) {
      teak(); page(7);
      const k = eob(clamp(lt / 0.45));
      bloom(540, 700, 80 + eo(clamp(lt / 0.5)) * 1000, 7, t, () => { ctx.fillStyle = DEEP; ctx.fillRect(0, 0, W, 1320); blit(granImg(), 0, 0, 0, 0, 1, 0.8);
        bloomPath(540, 600, 330 + 40 * sin(t * 3), 3, t); ctx.fillStyle = 'rgba(169,188,214,0.25)'; ctx.fill();
        blit(broImg(), 450, 1120, 540, lerp(1700, 1320, k), 1.05 + 0.05 * clamp(lt / d)); }, '#0E1C3A', 0);
      for (let i = 0; i < 14; i++) { const q = clamp((lt - 0.1) / 0.6), a = rnd(i + 3) * TAU, dd = 120 + q * (200 + rnd(i) * 300); if (q <= 0 || q >= 1) continue; ctx.fillStyle = `rgba(31,58,104,${0.8 * (1 - q)})`; ctx.beginPath(); ctx.arc(540 + cos(a) * dd, 700 + sin(a) * dd * 0.9, 4 + rnd(i + 1) * 9, 0, TAU); ctx.fill(); }
      tag('ILLUSTRATION', 850, 1230, 1);
    } });
  cue(s7, 'whoosh', { gain: 0.8, dur: 0.5 }); cue(s7 + 0.1, 'drum', { gain: 0.7 });

  // a8 · EAST INDIA COMPANY: a row of small red-coat soldiers marches in against the two brothers
  add({ id: 'a8_company', at: s8, cam: [640, 820], zoom: 0.1, note: 'row of red-coat musket soldiers marches in from the right toward the two brothers; EAST INDIA COMPANY',
    draw(lt, d, t) {
      teak(); page(8);
      inWin(() => { ctx.fillStyle = '#D9D4C3'; ctx.fillRect(0, 0, W, 1320); blit(granImg(), 0, 0, 0, 0, 1, 0.35);
        bloomPath(900, 940, 300 + eo(clamp(lt / 0.8)) * 360, 11, t); ctx.fillStyle = 'rgba(176,38,30,0.18)'; ctx.fill(); ctx.strokeStyle = 'rgba(176,38,30,0.4)'; ctx.lineWidth = 8; ctx.stroke();
        wob([[60, 1060], [1040, 1060]], 3); blit(broImg(), 450, 1120, 250, 1062, 0.5);
        const off = lerp(560, 0, eo(clamp(lt / 1.2)));
        for (let i = 0; i < 8; i++) { const step = sin(t * 9 + i * 0.6), x = 470 + i * 66 + off; blitR(coatImg(), 90, 330, x, 1060 - Math.abs(step) * 6, 0.92 - i * 0.012, step * 0.04); } });
      winEdge();
      lab('EAST INDIA COMPANY', 540, 300, 60, lt - 0.05);
      tag('ILLUSTRATION', 220, 1230, 1);
    } });
  cue(s8, 'drum', { gain: 0.8, pan: 0.3 }); for (let i = 1; i < 5; i++) cue(s8 + i * 0.35, 'drum', { gain: 0.4, pan: 0.4 });

  // a9 · JUNE 1801 · PROCLAMATION: a sheet slaps onto the page; the seal stamps it
  add({ id: 'a9_proc', at: s9, cam: [540, 700], zoom: 0.12, note: 'proclamation sheet slaps down on the ledger, JUNE 1801, PROCLAMATION, wax seal stamps its foot',
    draw(lt, d, t) {
      teak(); page(9);
      inWin(() => { bloomPath(540, 700, 260 + eo(clamp(lt / 0.6)) * 340, 12, t); ctx.fillStyle = 'rgba(78,110,158,0.28)'; ctx.fill(); ctx.strokeStyle = 'rgba(31,58,104,0.5)'; ctx.lineWidth = 8; ctx.stroke(); });
      sheet(540, 300, 2.05, -0.02, lt - 0.02, t, 1, 0.25);
      lab('JUNE 1801', 540, 225, 58, t - tJune);
      lab('PROCLAMATION', 540, 1225, 60, t - tProc);
      sealSlam(700, 1035, t - tProc - 0.35, 0.62);
    } });
  cue(s9 + 0.15, 'slam', { gain: 0.6 }); cue(tJune, 'pop', { gain: 0.5 }); cue(tProc + 0.35, 'thud', { gain: 0.8 });

  // a10 · SRIRANGAM: sheets slapped onto the temple wall under the gopuram, paste strokes, corners flutter
  add({ id: 'a10_temple', at: s10, cam: [540, 820], zoom: 0.1, note: 'gopuram + temple wall: proclamation sheets slap on with paste strokes, corners flutter; SRIRANGAM',
    draw(lt, d, t) {
      teak(); page(10);
      bloom(540, 900, 220 + eo(clamp(lt / 0.5)) * 1100, 13, t, () => { blit(templeImg(), 0, 0, 0, 0);
        sheet(330, 840, 0.68, -0.04, lt - 0.0, t, 2, 0.6); sheet(560, 830, 0.68, 0.03, lt - 0.3, t, 3, 0.7); sheet(790, 845, 0.68, -0.02, t - tSri, t, 4, 0.6); }, MID, 0.3);
      lab('SRIRANGAM', 540, 250, 64, t - tSri);
    } });
  cue(s10 + 0.13, 'thud', { gain: 0.6, pan: -0.4 }); cue(s10 + 0.43, 'thud', { gain: 0.6 }); cue(tSri + 0.13, 'thud', { gain: 0.6, pan: 0.4 });

  // a11 · TRICHY FORT: another sheet slaps onto the fort wall
  add({ id: 'a11_fort', at: s11, cam: [540, 880], zoom: 0.12, note: 'fort wall with merlons + bastion: sheet slaps on; TRICHY FORT',
    draw(lt, d, t) {
      teak(); page(11);
      bloom(520, 900, 260 + eo(clamp(lt / 0.4)) * 1100, 14, t, () => { blit(fortImg(), 0, 0, 0, 0);
        sheet(520, 720, 0.78, 0.02, t - tTri, t, 5, 0.6); sheet(330, 740, 0.62, -0.05, lt - 0.0, t, 6, 0.5); }, DEEP, 0.3);
      lab('TRICHY FORT', 540, 250, 64, t - tTri - 0.05);
    } });
  cue(s11 + 0.13, 'thud', { gain: 0.6, pan: -0.3 }); cue(tTri + 0.13, 'slam', { gain: 0.6 });

  // a12 · "calling people to rise": wind flutters the sheets, a crowd of faceless figures rises up, arms raised
  const fortScene = (lt, t) => { inWin(() => { blit(fortImg(), 0, 0, 0, 0);
    sheet(520, 720, 0.78, 0.02, 9, t, 5, 1); sheet(330, 740, 0.62, -0.05, 9, t, 6, 1); sheet(740, 730, 0.62, 0.04, lt - 0.1, t, 7, 1);
    for (let i = 0; i < 13; i++) { const k = eob(clamp((lt - 0.15 - rnd(i + 2) * 0.7) / 0.5)), x = 110 + i * 70 + (rnd(i) - 0.5) * 30, y = lerp(1480, 1190 + (i % 2) * 40 + rnd(i + 9) * 20, k);
      blit(manImg(k > 0.6), 70, 250, x, y + sin(t * 4 + i) * 6 * k, 1.05 + rnd(i + 4) * 0.2); }
    blit(granImg(), 0, 0, 0, 0, 1, 0.3); }); winEdge(); };
  add({ id: 'a12_rise', at: s12, cam: [540, 980], zoom: 0.08, note: 'sheets flutter in wind on the fort wall, a crowd of faceless figures rises, arms raised; paper scraps fly',
    draw(lt, d, t) {
      teak(); page(11); fortScene(lt, t);
      for (let i = 0; i < 6; i++) { const ph = (t * 0.6 + rnd(i)) % 1, x = 100 + ph * 900, y = 420 + rnd(i + 3) * 300 - ph * 120 + sin(t * 5 + i) * 20; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 4 + i); ctx.fillStyle = PWHITE; ctx.fillRect(-14, -10, 28, 20); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-14, -10, 28, 20); ctx.restore(); }
    } });
  cue(s12, 'whoosh', { gain: 0.5, dur: 1.2 }); cue(s12 + 0.3, 'rumble', { gain: 0.5, dur: 1.6 });

  // a13 · "By autumn": a hemp rope pulls taut down the frame as a wipe, revealing the tally page; autumn leaves fall
  const tallyPage = (t, n) => { teak(); page(5, true, -0.01); tally(n, t); };
  add({ id: 'a13_rope', at: s13, cam: [540, 760], zoom: 0.1, note: 'rope pulls taut down the frame as a wipe from fort to the tally page; autumn leaves fall; tallies race',
    draw(lt, d, t) {
      const k = eio(clamp(lt / 0.6)), y = lerp(-80, 1288, k), sag = lerp(160, 0, eo(clamp(lt / 0.75)));
      ctx.save(); ropePath(y, sag, t); ctx.lineTo(1200, 2100); ctx.lineTo(-120, 2100); ctx.closePath(); ctx.clip(); teak(); page(11); fortScene(lt + (s13 - s12), t); ctx.restore();
      ctx.save(); ropePath(y, sag, t); ctx.lineTo(1200, -300); ctx.lineTo(-120, -300); ctx.closePath(); ctx.clip(); tallyPage(t, 14 + clamp(lt / d) * 26); leaves(t); ctx.restore();
      rope(y, sag + (lt > 0.6 ? 4 * sin(t * 40) * clamp(1 - (lt - 0.6) / 0.5) : 0), t);
      lab('SIVAGANGA, 1801', 520, 230, 66, 1);
    } });
  cue(s13, 'zip', { gain: 0.8, dur: 0.6 }); cue(s13 + 0.6, 'thud', { gain: 0.5 }); for (let i = 0; i < 4; i++) cue(tAut + 0.2 + i * 0.2, 'tock', { gain: 0.3, pan: 0.4 });

  // a14 · CRUSHED: red ink strikes through the rows, the seal slams, the label stamps in
  add({ id: 'a14_crushed', at: s14, cam: [540, 700], zoom: 0.12, note: 'red strike-through races across the ledger rows, wax seal slams, CRUSHED',
    draw(lt, d, t) {
      tallyPage(t, 40); leaves(t + (s14 - s13));
      rope(1288, 0, t);
      strike(eo(clamp(lt / 0.5)));
      lab('CRUSHED', 540, 232, 104, lt - 0.05);
      sealSlam(800, 1040, lt - 0.12, 0.95);
    } });
  cue(s14, 'zip', { gain: 0.5, dur: 0.4 }); cue(s14 + 0.12, 'slam', { gain: 1 });
}
