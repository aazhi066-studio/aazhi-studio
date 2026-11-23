// EPISODE 18 · worker C : "Tide-Stained Manifest", lines 7-10 (Duraisamy / Penang / barely recorded / the question / loop)
//   c1  L7 -> "Duraisamy"     wash bloom reveals a night sea, East Indiaman pitching; ACCOUNTS SAY, ILLUSTRATION
//   c2  "Duraisamy" -> "Chinna"  close at the ship rail: a small faceless boy against the moon; DURAISAMY, A BOY
//   c3  "Chinna" -> L8        on the ledger page: boy inked, two tall outline fathers, red ink lines to both; FATHER DISPUTED
//   c4  L8 -> "convicts"      Penang shore blooms in indigo; exiles standing in a row; ONE STUDY
//   c5  "convicts" -> "rank"  a chained row of hunched convicts slides in beside them; WITH CONVICTS
//   c6  "rank" -> L9          push on the exiles standing tall, red wax seal slams; RANK & DIGNITY
//   c7  L9 -> "barely"        ledger page, a nib inks tally strokes, brown tide stain starts creeping up
//   c8  "barely" -> L10       the tide swallows the rows into blur; BARELY RECORDED
//   c9  L10 -> "Tell"         split: ship on night sea (MERCY?) | rope knot + fort wall + crows (OR WORSE?), rope divider
//   c10 "Tell" -> "watch"     both halves shrink to panels, ink arrow bobs down; TELL ME BELOW
//   c11 "watch" -> "came"     ledger tally of 73 figures; most fade, rows struck in red; ABOUT 73 -> WHO NEVER CAME HOME?
//   c12 "came" -> end         loop: ship on night sea again, red seal slam (echo of the opening)
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit, lg, rgba } from './art.js';

// ───────────── palette ─────────────
const PAPER = '#E9DFC6', FOX = '#CDBE98', RED = '#B0261E', REDHI = '#E0574A', BRASS = '#C79A3E', TEAK = '#1A110B',
  INK = '#2B1D14', DEEP = '#1F3A68', MID = '#4E6E9E', PALE = '#A9BCD6', WHITE = '#F3EBD7', TAN = '#B89A6A';
const NIGHT = '#14264A';
// page interior (where the wash is painted)
const IX0 = 84, IY0 = 118, IX1 = 996, IY1 = 1236;

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

// ───────────── small helpers ─────────────
const pathP = (pts, close = true) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); if (close) ctx.closePath(); };
// wobbly hand-inked polyline (cache only)
function wl(pts, col, w, seed = 1, close = false, j = 2.2) {
  const out = []; const all = close ? [...pts, pts[0]] : pts;
  for (let i = 0; i < all.length - 1; i++) { const [ax, ay] = all[i], [bx, by] = all[i + 1], n = Math.max(2, Math.ceil(Math.hypot(bx - ax, by - ay) / 14));
    for (let k = 0; k < n; k++) { const f = k / n; out.push([ax + (bx - ax) * f + (rnd(seed + i * 31 + k) - 0.5) * j, ay + (by - ay) * f + (rnd(seed + i * 17 + k + 7) - 0.5) * j]); } }
  out.push(all[all.length - 1]);
  pathP(out, false); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
// granulation specks + wet blooms (cache only)
function granulate(x0, y0, x1, y1, n, seed, col = DEEP, a = 0.1) {
  for (let i = 0; i < n; i++) { ctx.fillStyle = rgba(col, a * (0.4 + rnd(seed + i) * 0.8)); ctx.beginPath();
    ctx.arc(lerp(x0, x1, rnd(seed + i * 3.1)), lerp(y0, y1, rnd(seed + i * 7.3)), 1 + rnd(seed + i * 1.7) * (i % 9 === 0 ? 40 : 3), 0, TAU); ctx.fill(); }
}
// noisy wash-bloom outline
function blobPath(cx, cy, r, seed, t) {
  ctx.beginPath(); const n = 56;
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, k = 1 + 0.12 * Math.sin(3 * a + seed + t * 0.8) + 0.07 * Math.sin(7 * a + seed * 2 - t * 1.1) + 0.04 * Math.sin(13 * a + seed * 3);
    ctx.lineTo(cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k); }
  ctx.closePath();
}
// WASH BLOOM REVEAL: draw fn() inside a spreading blob (clipped to the page interior), dark wet edge
function bloom(fn, cx, cy, r, seed, t, box = [IX0, IY0, IX1, IY1]) {
  ctx.save(); ctx.beginPath(); ctx.rect(box[0], box[1], box[2] - box[0], box[3] - box[1]); ctx.clip();
  blobPath(cx, cy, r, seed, t); ctx.save(); ctx.clip(); fn(); ctx.restore();
  if (r < 1500) { blobPath(cx, cy, r, seed, t); ctx.strokeStyle = 'rgba(20,38,74,0.5)'; ctx.lineWidth = 10; ctx.stroke(); ctx.strokeStyle = 'rgba(20,38,74,0.7)'; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore();
}
// labels: Caladea caps, small red underline; p = appear 0..1
function tag(text, x, y, p = 1, o = {}) {
  if (p <= 0) return; const { size = 52, col = INK, chip = false, rot = 0, under = true } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = lerp(0.6, 1, eob(clamp(p))); ctx.scale(s, s); ctx.globalAlpha *= clamp(p * 2);
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.08)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width;
  if (chip) { ctx.fillStyle = PAPER; ctx.beginPath(); ctx.roundRect(-w / 2 - 26, -size * 0.75, w + 52, size * 1.55, 6); ctx.fill(); ctx.strokeStyle = BRASS; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = rgba(INK, 0.35); ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 - 18, -size * 0.62, w + 36, size * 1.29); }
  ctx.fillStyle = col; ctx.fillText(text, 0, 4);
  if (under) { ctx.strokeStyle = RED; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2, size * 0.58); ctx.quadraticCurveTo(0, size * 0.66, (w / 2) * clamp(p * 1.4) * 2 - w / 2, size * 0.56); ctx.stroke(); }
  ctx.letterSpacing = '0px'; ctx.restore();
}
const appear = (lt, at, out = 1e9) => clamp((lt - at) / 0.28) * clamp((out - lt) / 0.2);

// ───────────── figures (faceless) ─────────────
function fig(x, y, h, o = {}) {
  const { body = INK, head = PALE, line = INK, turban = false, spear = false, chain = false, hunch = 0, ghost = false, boy = false, cloth = null } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(h / 100, h / 100); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const hx = hunch * 9, hy = hunch * 6, up = (px, py) => [px + hx * clamp((-py - 40) / 50), py + hy * clamp((-py - 40) / 50)];
  const pts = [[-9, 0], [-7, -22], [-12, -24], [-10, -50], [-14, -76], [-6, -81], [6, -81], [14, -76], [10, -50], [12, -24], [7, -22], [9, 0], [3, 0], [0, -20], [-3, 0]].map(([a, b]) => up(a, b));
  const hr = boy ? [9, 11] : [7, 9], hcy = boy ? -92 : -90;
  if (spear) { ctx.strokeStyle = ghost ? rgba(INK, 0.8) : INK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(19, 4); ctx.lineTo(19, -128); ctx.stroke(); pathP([[19, -142], [15, -128], [23, -128]]); ctx.fillStyle = INK; ctx.fill(); }
  pathP(pts);
  if (ghost) { ctx.setLineDash([5, 4]); ctx.strokeStyle = rgba(INK, 0.85); ctx.lineWidth = 2.2; ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = rgba(MID, 0.15); ctx.fill(); }
  else { ctx.fillStyle = body; ctx.fill(); if (cloth) { ctx.save(); ctx.clip(); ctx.fillStyle = cloth; ctx.fillRect(-20, -82, 40, 40); ctx.restore(); } ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.stroke(); }
  // arms
  ctx.strokeStyle = ghost ? rgba(INK, 0.85) : body; ctx.lineWidth = ghost ? 2 : 5;
  if (chain) { const s0 = up(-13, -75), s1 = up(13, -75), hd = up(0, -50); ctx.beginPath(); ctx.moveTo(...s0); ctx.lineTo(hd[0] - 3, hd[1]); ctx.moveTo(...s1); ctx.lineTo(hd[0] + 3, hd[1]); ctx.stroke();
    ctx.strokeStyle = rgba(BRASS, 0.9); ctx.lineWidth = 1.6; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.ellipse(hd[0] + k * 3, hd[1] + 2, 3, 2, 0, 0, TAU); ctx.stroke(); }
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(k * 3.4, -3, 2.4, 1.6, 0, 0, TAU); ctx.stroke(); } }
  else if (ghost) { ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(-14, -76); ctx.lineTo(-17, -46); ctx.moveTo(14, -76); ctx.lineTo(19, -60); ctx.stroke(); ctx.setLineDash([]); }
  else { ctx.beginPath(); ctx.moveTo(-14, -76); ctx.lineTo(-17, -46); ctx.moveTo(14, -76); ctx.lineTo(17, -46); ctx.stroke(); }
  // head (blank oval)
  const [qx, qy] = up(0, hcy);
  ctx.beginPath(); ctx.ellipse(qx, qy, hr[0], hr[1], 0, 0, TAU);
  if (ghost) { ctx.setLineDash([5, 4]); ctx.strokeStyle = rgba(INK, 0.85); ctx.lineWidth = 2.2; ctx.stroke(); ctx.setLineDash([]); }
  else { ctx.fillStyle = head; ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.stroke(); }
  if (turban) { ctx.beginPath(); ctx.ellipse(qx, qy - hr[1] * 0.75, hr[0] + 3, 5, 0, 0, TAU); if (ghost) { ctx.strokeStyle = rgba(INK, 0.85); ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = cloth || body; ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = 1.6; ctx.stroke(); } }
  ctx.restore();
}

// ───────────── cached set pieces ─────────────
const teakImg = () => cached('cteak', W, H, 0.5, () => {
  ctx.fillStyle = TEAK; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const y = i * 28 + rnd(i) * 20; ctx.strokeStyle = `rgba(${i % 3 ? '60,40,24' : '12,8,5'},${0.35 + rnd(i + 3) * 0.3})`; ctx.lineWidth = 2 + rnd(i + 5) * 5;
    ctx.beginPath(); for (let x = -20; x <= W + 20; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.004 + i) * 14 + Math.sin(x * 0.019 + i * 2) * 4); ctx.stroke(); }
});
const pageImg = (seed = 3, rows = 14) => cached('cpage' + seed + '_' + rows, W, 1400, 1, () => {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(56, 98, 1000, 1240); // shadow
  ledgerPage(540, 700, 1000, 1240, 0, rows, seed, 0);
});
const bg = (seed = 3, rows = 14) => { blit(teakImg(), 0, 0, 0, 0); blit(pageImg(seed, rows), 0, 0, 0, 0); };

function nightSky(hz, moonX, moonY, moonR, seed) {
  ctx.fillStyle = lg(0, IY0, 0, hz, [[0, NIGHT], [0.6, DEEP], [1, MID]]); ctx.fillRect(IX0 - 40, IY0 - 40, IX1 - IX0 + 80, hz - IY0 + 40);
  const g = ctx.createRadialGradient(moonX, moonY, moonR * 0.8, moonX, moonY, moonR * 3); g.addColorStop(0, rgba(PALE, 0.4)); g.addColorStop(1, rgba(PALE, 0));
  ctx.fillStyle = g; ctx.fillRect(IX0 - 40, IY0 - 40, IX1 - IX0 + 80, hz - IY0 + 40);
  for (let i = 0; i < 14; i++) { ctx.fillStyle = rgba(NIGHT, 0.25); ctx.beginPath(); ctx.ellipse(lerp(IX0, IX1, rnd(seed + i)), lerp(IY0 + 60, hz - 120, rnd(seed + i * 2)), 120 + rnd(i) * 200, 10 + rnd(i + 4) * 16, 0, 0, TAU); ctx.fill(); }
  for (let i = 0; i < 90; i++) { ctx.fillStyle = rgba(WHITE, 0.3 + rnd(seed + i * 5) * 0.6); ctx.beginPath(); ctx.arc(lerp(IX0, IX1, rnd(seed + i * 9)), lerp(IY0, hz - 80, rnd(seed + i * 13)), 1 + rnd(i) * 2, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, TAU); ctx.fillStyle = WHITE; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = rgba(PALE, 0.6); for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(moonX + (rnd(i + 40) - 0.5) * moonR, moonY + (rnd(i + 50) - 0.5) * moonR, moonR * (0.1 + rnd(i) * 0.15), 0, TAU); ctx.fill(); }
}
function nightSea(hz, moonX, seed) {
  ctx.fillStyle = lg(0, hz, 0, IY1, [[0, MID], [0.25, DEEP], [1, NIGHT]]); ctx.fillRect(IX0 - 40, hz, IX1 - IX0 + 80, IY1 - hz + 40);
  for (let i = 0; i < 70; i++) { const y = hz + Math.pow(rnd(seed + i), 1.6) * (IY1 - hz), x = lerp(IX0, IX1, rnd(seed + i * 3)), l = 30 + (y - hz) * 0.25 * rnd(i + 1);
    wl([[x - l, y], [x, y - 3], [x + l, y]], rgba(INK, 0.55), 2, seed + i); }
  for (let i = 0; i < 40; i++) { const y = hz + 8 + Math.pow(rnd(seed + i * 7), 1.3) * (IY1 - hz - 20), l = 10 + rnd(i) * 40 * (1 + (y - hz) / 300);
    ctx.strokeStyle = rgba(WHITE, 0.55 * (1 - (y - hz) / (IY1 - hz))); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(moonX - l / 2 + (rnd(i + 3) - 0.5) * 50, y); ctx.lineTo(moonX + l / 2 + (rnd(i + 3) - 0.5) * 50, y); ctx.stroke(); }
  wl([[IX0, hz], [IX1, hz]], rgba(INK, 0.7), 2.5, seed);
}
const nightImg = () => cached('cnight', W, 1400, 1, () => {
  nightSky(820, 790, 330, 62, 11); nightSea(820, 790, 12); granulate(IX0, IY0, IX1, IY1, 520, 13, NIGHT, 0.12);
});
const railImg = () => cached('crail', W, 1400, 1, () => {
  nightSky(900, 560, 760, 170, 21); nightSea(900, 560, 22); granulate(IX0, IY0, IX1, IY1, 420, 23, NIGHT, 0.12);
  fig(540, 1240, 420, { boy: true, body: INK, head: PALE, line: INK });
  // rail + balusters
  for (let x = IX0 + 20; x < IX1; x += 72) { ctx.fillStyle = INK; ctx.fillRect(x, 1010, 13, 260); ctx.fillStyle = rgba(TAN, 0.35); ctx.fillRect(x + 9, 1010, 3, 260); }
  ctx.fillStyle = INK; ctx.fillRect(IX0 - 20, 990, IX1 - IX0 + 40, 30); ctx.fillStyle = rgba(TAN, 0.55); ctx.fillRect(IX0 - 20, 992, IX1 - IX0 + 40, 4);
  ctx.fillStyle = rgba(INK, 0.9); ctx.fillRect(IX0 - 20, 1180, IX1 - IX0 + 40, 80);
  for (let i = 0; i < 26; i++) wl([[IX0 + i * 38, 1180], [IX0 + i * 38 + 30, 1240]], rgba(TAN, 0.25), 2, 30 + i);
});
// East Indiaman: origin (380, 540) = waterline centre
const SHX = 380, SHY = 540;
const shipImg = () => cached('cship', 800, 640, 1, () => {
  ctx.translate(SHX, SHY); ctx.lineJoin = 'round';
  const masts = [[-130, -400], [10, -470], [140, -380]];
  // rigging
  for (const [mx, top] of masts) { wl([[mx, top], [-255, -100]], rgba(INK, 0.55), 1.4, mx + 1); wl([[mx, top], [262, -92]], rgba(INK, 0.55), 1.4, mx + 2); }
  wl([[262, -92], [370, -150]], INK, 4, 5); wl([[140, -380], [370, -150]], rgba(INK, 0.6), 1.4, 6);
  pathP([[150, -330], [360, -150], [180, -150]]); ctx.fillStyle = rgba(PALE, 0.9); ctx.fill(); wl([[150, -330], [360, -150], [180, -150]], INK, 2.5, 7, true);
  // masts + square sails
  for (let m = 0; m < 3; m++) { const [mx, top] = masts[m]; wl([[mx, -60], [mx, top]], INK, 5, 9 + m);
    const tiers = 3, span = (-90 - top) / tiers;
    for (let k = 0; k < tiers; k++) { const y0 = top + 20 + k * span, y1 = y0 + span - 12, hw = 52 + k * 22 + (m === 1 ? 10 : 0);
      ctx.beginPath(); ctx.moveTo(mx - hw, y0); ctx.lineTo(mx + hw, y0); ctx.lineTo(mx + hw + 6, y1); ctx.quadraticCurveTo(mx, y1 + 16, mx - hw - 6, y1); ctx.closePath();
      ctx.fillStyle = lg(mx - hw, 0, mx + hw, 0, [[0, PALE], [1, WHITE]]); ctx.fill();
      ctx.save(); ctx.clip(); for (let h = -hw; h < 0; h += 9) wl([[mx + h, y0], [mx + h - 10, y1 + 10]], rgba(DEEP, 0.35), 1.5, m * 40 + k * 9 + h); ctx.restore();
      wl([[mx - hw - 8, y0], [mx + hw + 8, y0]], INK, 4, 50 + m * 3 + k); wl([[mx - hw, y0], [mx + hw, y0], [mx + hw + 6, y1], [mx, y1 + 12], [mx - hw - 6, y1]], INK, 2.2, 60 + m * 5 + k, true); } }
  pathP([[10, -470], [10, -500], [50, -490], [10, -482]]); ctx.fillStyle = RED; ctx.fill();
  // hull
  const hull = [[-275, -120], [-205, -122], [-195, -92], [205, -80], [262, -98], [240, -40], [205, 14], [-190, 20], [-250, -10]];
  pathP(hull); ctx.fillStyle = lg(0, -120, 0, 20, [[0, MID], [1, DEEP]]); ctx.fill();
  ctx.save(); ctx.clip(); for (let x = -280; x < 280; x += 11) wl([[x, -30], [x + 30, 30]], rgba(NIGHT, 0.5), 1.6, x + 300); ctx.restore();
  wl(hull, INK, 4, 70, true); wl([[-240, -70], [0, -55], [230, -62]], INK, 2.5, 71); wl([[-230, -40], [0, -28], [215, -36]], INK, 2, 72);
  for (let x = -160; x <= 180; x += 42) { ctx.fillStyle = rgba(INK, 0.85); ctx.fillRect(x, -52, 14, 11); }
  ctx.fillStyle = BRASS; ctx.beginPath(); ctx.arc(-262, -136, 7, 0, TAU); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
});
function drawShip(x, y, s, t, ph = 0) {
  const rot = 0.045 * Math.sin(t * 1.7 + ph), bob = 10 * Math.sin(t * 1.7 + ph + 0.8) * s;
  ctx.save(); ctx.translate(x, y + bob); ctx.rotate(rot); blit(shipImg(), SHX, SHY, 0, 0, s); ctx.restore();
  const g = ctx.createRadialGradient(x - 262 * s, y - 136 * s + bob, 0, x - 262 * s, y - 136 * s + bob, 60 * s); g.addColorStop(0, `rgba(199,154,62,${0.45 + 0.15 * Math.sin(t * 7)})`); g.addColorStop(1, 'rgba(199,154,62,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 330 * s, y - 210 * s + bob, 140 * s, 150 * s);
}
// foreground hatched waves (per frame: 2 bands)
function waves(y, t, x0 = IX0, x1 = IX1, amp = 14) {
  for (let b = 0; b < 2; b++) { const yy = y + b * 70, ph = t * (1.4 + b * 0.5) + b * 2;
    ctx.beginPath(); ctx.moveTo(x0 - 20, IY1 + 40);
    for (let x = x0 - 20; x <= x1 + 20; x += 24) ctx.lineTo(x, yy + Math.sin(x * 0.012 + ph) * amp + Math.sin(x * 0.031 - ph * 1.3) * amp * 0.4);
    ctx.lineTo(x1 + 20, IY1 + 40); ctx.closePath(); ctx.fillStyle = b ? rgba(NIGHT, 0.95) : rgba(DEEP, 0.9); ctx.fill(); ctx.strokeStyle = rgba(INK, 0.8); ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = rgba(PALE, 0.35); ctx.lineWidth = 2; ctx.beginPath();
    for (let x = x0; x <= x1; x += 48) { const wy = yy + Math.sin(x * 0.012 + ph) * amp + 16; ctx.moveTo(x, wy); ctx.lineTo(x + 22, wy + 8); } ctx.stroke(); }
}
// Penang shore
const shoreImg = () => cached('cshore', W, 1400, 1, () => {
  ctx.fillStyle = lg(0, IY0, 0, 720, [[0, DEEP], [0.55, MID], [1, PALE]]); ctx.fillRect(IX0 - 40, IY0 - 40, IX1 - IX0 + 80, 760);
  for (let i = 0; i < 10; i++) { ctx.fillStyle = rgba(DEEP, 0.25); ctx.beginPath(); ctx.ellipse(lerp(IX0, IX1, rnd(i + 70)), lerp(250, 560, rnd(i + 71)), 140 + rnd(i) * 160, 14, 0, 0, TAU); ctx.fill(); }
  // island hill
  ctx.beginPath(); ctx.moveTo(IX0 - 40, 730); for (let x = IX0 - 40; x <= IX1 + 40; x += 20) ctx.lineTo(x, 700 - 170 * Math.exp(-Math.pow((x - 620) / 230, 2)) - 60 * Math.exp(-Math.pow((x - 300) / 160, 2)) + Math.sin(x * 0.05) * 6);
  ctx.lineTo(IX1 + 40, 730); ctx.closePath(); ctx.fillStyle = rgba(DEEP, 0.85); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  // water band
  ctx.fillStyle = lg(0, 720, 0, 900, [[0, MID], [1, DEEP]]); ctx.fillRect(IX0 - 40, 715, IX1 - IX0 + 80, 190);
  for (let i = 0; i < 40; i++) { const y = lerp(730, 890, rnd(i + 80)), x = lerp(IX0, IX1, rnd(i + 81)); wl([[x - 30, y], [x, y - 3], [x + 30, y]], rgba(INK, 0.5), 2, i + 82); }
  // beach
  ctx.beginPath(); ctx.moveTo(IX0 - 40, 900); for (let x = IX0 - 40; x <= IX1 + 40; x += 30) ctx.lineTo(x, 895 + Math.sin(x * 0.02) * 8); ctx.lineTo(IX1 + 40, IY1 + 40); ctx.lineTo(IX0 - 40, IY1 + 40); ctx.closePath();
  ctx.fillStyle = lg(0, 900, 0, IY1, [[0, FOX], [1, TAN]]); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < 60; i++) { const y = lerp(930, IY1, rnd(i + 90)), x = lerp(IX0, IX1, rnd(i + 91)); wl([[x, y], [x + 26, y - 2]], rgba(INK, 0.3), 1.6, i + 92); }
  // palms
  const palm = (x, y, h, lean) => { const tx = x + lean * h, ty = y - h; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * h * 0.2, y - h * 0.6, tx, ty); ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.stroke();
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.55, l = h * 0.45; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * l * 0.6, ty + Math.sin(a) * l * 0.6 - 30, tx + Math.cos(a) * l, ty + Math.sin(a) * l + l * 0.35);
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = rgba(DEEP, 0.9); ctx.lineWidth = 4; ctx.stroke(); } };
  palm(150, 1000, 520, 0.18); palm(950, 960, 460, -0.2); palm(880, 990, 330, -0.1);
  granulate(IX0, IY0, IX1, IY1, 420, 95, DEEP, 0.1);
});
const exilesImg = () => cached('cexiles', 600, 520, 1, () => {
  const xs = [80, 190, 300, 410, 510];
  xs.forEach((x, i) => fig(x, 480, 300 + (i % 2) * 18, { body: DEEP, head: PALE, line: INK, turban: true, cloth: WHITE }));
});
const convictsImg = () => cached('cconv', 640, 460, 1, () => {
  const xs = [70, 170, 270, 370, 470, 570];
  ctx.strokeStyle = rgba(BRASS, 0.9); ctx.lineWidth = 3; ctx.setLineDash([7, 5]); ctx.beginPath(); ctx.moveTo(20, 420); xs.forEach((x) => ctx.quadraticCurveTo(x - 50, 436, x, 418)); ctx.lineTo(630, 420); ctx.stroke(); ctx.setLineDash([]);
  xs.forEach((x, i) => fig(x, 420, 260 - (i % 3) * 10, { body: INK, head: rgba(PALE, 0.9), line: INK, hunch: 1, chain: true }));
});
// wax seal (blob + pressed rings + star), centred (150,150)
const sealImg = () => cached('cseal', 300, 300, 1, () => {
  ctx.translate(150, 150); ctx.beginPath();
  for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, r = 110 + 12 * Math.sin(5 * a) + 8 * Math.sin(11 * a + 1) + (rnd(i + 200) - 0.5) * 8; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 82, 0, TAU); ctx.fillStyle = '#9A2019'; ctx.fill();
  ctx.strokeStyle = REDHI; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 82, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
  ctx.strokeStyle = rgba(INK, 0.45); ctx.lineWidth = 3; for (const r of [70, 56]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 42, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = REDHI; ctx.fill(); ctx.strokeStyle = rgba(INK, 0.4); ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = rgba(REDHI, 0.8); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-30, -40, 60, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
});
// WAX SEAL SLAM (lt from the hit)
function sealSlam(lt, x, y, s = 1) {
  if (lt < -0.2) return;
  const p = clamp((lt + 0.2) / 0.2);
  if (lt < 0) { blit(sealImg(), 150, 150, x, y - 120 * (1 - p), s * lerp(1.8, 1.1, p), p); }
  else { const sq = 1 + 0.12 * Math.exp(-lt * 9) * Math.cos(lt * 30); blit(sealImg(), 150, 150, x, y, s * sq, 1, s / sq);
    const w = seg(lt, 0, 0.6); if (w < 1) { ctx.strokeStyle = `rgba(176,38,30,${0.6 * (1 - w)})`; ctx.lineWidth = 6 * (1 - w) + 1; ctx.beginPath(); ctx.arc(x, y, s * (120 + 220 * eo(w)), 0, TAU); ctx.stroke(); }
    // brass stamp presses then lifts
    const q = seg(lt, 0, 0.45); if (q < 1) { const lift = eio(seg(q, 0.35, 1)); ctx.save(); ctx.globalAlpha = 1 - lift;
      ctx.translate(x, y - 40 * s - lift * 260 * s); ctx.fillStyle = lg(-60 * s, 0, 60 * s, 0, [[0, '#8C6A26'], [0.4, BRASS], [1, '#6E5220']]);
      ctx.fillRect(-28 * s, -200 * s, 56 * s, 150 * s); ctx.beginPath(); ctx.ellipse(0, -40 * s, 86 * s, 26 * s, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); } }
}
// rope (horizontal strip), length 1600
const ropeImg = () => cached('crope', 1600, 40, 1, () => {
  ctx.fillStyle = TAN; ctx.fillRect(0, 6, 1600, 28); ctx.fillStyle = rgba(INK, 0.35); ctx.fillRect(0, 28, 1600, 6);
  ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 3; ctx.beginPath(); for (let x = -20; x < 1620; x += 13) { ctx.moveTo(x, 6); ctx.lineTo(x + 12, 34); } ctx.stroke();
  ctx.strokeStyle = rgba(WHITE, 0.4); ctx.lineWidth = 2; ctx.beginPath(); for (let x = -20; x < 1620; x += 13) { ctx.moveTo(x + 3, 9); ctx.lineTo(x + 8, 20); } ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(0, 6, 1600, 28);
});
// right half of the split: dusk wash, fort wall, rope + knot (no body)
const worseImg = () => cached('cworse', W, 1400, 1, () => {
  ctx.fillStyle = lg(0, IY0, 0, 1000, [[0, NIGHT], [0.6, DEEP], [1, MID]]); ctx.fillRect(540, IY0 - 40, IX1 - 500, 1200);
  granulate(540, IY0, IX1, IY1, 260, 120, NIGHT, 0.14);
  // fort wall with crenellations
  ctx.beginPath(); ctx.moveTo(540, IY1 + 40); ctx.lineTo(540, 980);
  for (let x = 540; x <= IX1 + 20; x += 64) { ctx.lineTo(x, 980); ctx.lineTo(x, 940); ctx.lineTo(x + 36, 940); ctx.lineTo(x + 36, 980); }
  ctx.lineTo(IX1 + 40, IY1 + 40); ctx.closePath(); ctx.fillStyle = NIGHT; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  for (let r = 0; r < 6; r++) for (let x = 540 + (r % 2) * 40; x < IX1; x += 80) { ctx.strokeStyle = rgba(PALE, 0.15); ctx.lineWidth = 2; ctx.strokeRect(x, 1000 + r * 42, 80, 42); }
  // gallows beam (top)
  ctx.fillStyle = INK; ctx.fillRect(600, 150, 380, 22); ctx.fillRect(950, 150, 22, 800);
});
function knot(x, y, t, tight = 0) {
  const sw = Math.sin(t * 1.3) * 0.04;
  ctx.save(); ctx.translate(x, y); ctx.rotate(sw);
  ctx.save(); ctx.beginPath(); ctx.rect(-30, -40, 60, 380); ctx.clip(); ctx.rotate(Math.PI / 2); blit(ropeImg(), 0, 20, 0, 0, 1, 1, 0.8); ctx.restore();
  // coils
  for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? TAN : '#A3875A'; ctx.beginPath(); ctx.roundRect(-20, 330 + k * 16, 40, 16, 6); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); }
  // loop tightening
  const rx = lerp(78, 52, tight), ry = lerp(104, 80, tight), cy = 430 + ry;
  ctx.lineWidth = 16; ctx.strokeStyle = TAN; ctx.beginPath(); ctx.ellipse(0, cy, rx, ry, 0, 0, TAU); ctx.stroke();
  ctx.lineWidth = 16; ctx.setLineDash([3, 10]); ctx.strokeStyle = rgba(INK, 0.6); ctx.stroke(); ctx.setLineDash([]);
  ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.ellipse(0, cy, rx + 8, ry + 8, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, cy, rx - 8, ry - 8, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}
function crows(t, x0, y0, n, seed, lift) {
  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const d = clamp(lift - rnd(seed + i) * 0.4), x = x0 + (rnd(seed + i * 3) - 0.5) * 300 + d * (rnd(seed + i * 5) - 0.3) * 400, y = y0 - d * (300 + rnd(i + seed) * 300);
    const f = d > 0 ? Math.sin(t * 16 + i * 2) * 12 : 2, s = 1 + rnd(i) * 0.5; ctx.beginPath(); ctx.moveTo(x - 20 * s, y - f); ctx.quadraticCurveTo(x - 8 * s, y - 4, x, y); ctx.quadraticCurveTo(x + 8 * s, y - 4, x + 20 * s, y - f); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y + 2, 6 * s, 4 * s, 0, 0, TAU); ctx.fill(); }
}
// ledger with tally strokes + red strikes; sharp and drowned (blurred + stained) versions
function tallyMarks(x, y, n, col = INK) {
  for (let k = 0; k < n; k++) { const g = Math.floor(k / 5), j = k % 5; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
    if (j < 4) { const xx = x + g * 80 + j * 13; ctx.moveTo(xx, y - 18); ctx.lineTo(xx + 2, y + 18); } else { const xx = x + g * 80; ctx.moveTo(xx - 8, y + 12); ctx.lineTo(xx + 50, y - 12); } ctx.stroke(); }
}
const ledgImg = () => cached('cledg', W, 1400, 1, () => {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(56, 98, 1000, 1240);
  ledgerPage(540, 700, 1000, 1240, 0, 14, 7, 0);
  for (let r = 3; r < 13; r++) { const yy = 80 + 1240 * (r + 1.5) / 16 + 26; tallyMarks(720, yy, 3 + Math.floor(rnd(r + 400) * 9), rgba(INK, 0.85)); }
  for (const r of [4, 7, 10]) { const yy = 80 + 1240 * (r + 1.5) / 16 - 6; wl([[200, yy], [960, yy - 6]], rgba(RED, 0.8), 4, r * 11); }
});
const ledgBlurImg = () => cached('cledgb', W, 1400, 1, () => {
  const src = ledgImg(); ctx.filter = 'blur(7px)'; ctx.drawImage(src, 0, 0); ctx.filter = 'none';
  ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(140,100,55,0.42)'; ctx.fillRect(0, 0, W, 1400);
  for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(110,75,40,${0.08 + rnd(i + 900) * 0.12})`; ctx.beginPath(); ctx.ellipse(rnd(i + 901) * W, 120 + rnd(i + 902) * 1200, 40 + rnd(i) * 120, 20 + rnd(i + 3) * 40, 0, 0, TAU); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
});
// TIDE STAIN: drowned page below a wavy tide line at y
function tide(y, t) {
  const edge = (x) => y + Math.sin(x * 0.013 + t * 1.2) * 14 + Math.sin(x * 0.037 - t * 0.9) * 7;
  ctx.save(); ctx.beginPath(); ctx.moveTo(40, 1400); for (let x = 40; x <= 1040; x += 20) ctx.lineTo(x, edge(x)); ctx.lineTo(1040, 1400); ctx.closePath(); ctx.clip();
  blit(ledgBlurImg(), 0, 0, 0, 0); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(44, 84, 992, 1232); ctx.clip();
  for (const [off, a, w] of [[0, 0.75, 6], [26, 0.35, 3], [60, 0.2, 2]]) { ctx.strokeStyle = `rgba(110,72,36,${a})`; ctx.lineWidth = w; ctx.beginPath(); for (let x = 40; x <= 1040; x += 20) ctx.lineTo(x, edge(x) + off + Math.sin(x * 0.02 + off) * 4); ctx.stroke(); }
  ctx.restore();
}
const figIcon = (faded) => cached('cfigi' + (faded ? 'f' : ''), 60, 110, 2, () => fig(30, 104, 96, { body: INK, head: PAPER, line: INK, turban: true }));
// ink arrow pointing down, drawn to p
function arrow(x, y0, y1, p) {
  const y = lerp(y0, y1, eo(clamp(p))); ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.quadraticCurveTo(x + 14, (y0 + y) / 2, x, y); ctx.stroke();
  if (p > 0.6) { ctx.beginPath(); ctx.moveTo(x - 40, y - 44); ctx.lineTo(x, y + 4); ctx.lineTo(x + 40, y - 44); ctx.stroke(); }
}

// ───────────── the shots ─────────────
export function buildC(add, cue) {
  const t7 = L(7), tDur = Wd('Duraisamy', 7), tChinna = Wd('Chinna', 7), tOr7 = Wd('or', 7), tBro = Wd('brother', 7);
  const t8 = L(8), tConv = Wd('convicts', 8), tRank = Wd('rank', 8), tStudy = Wd('One', 8);
  const t9 = L(9), tBarely = Wd('barely', 9);
  const t10 = L(10), tOr = Wd('or', 10), tRope = Wd('rope', 10), tTell = Wd('Tell', 10), tWatch = Wd('watch', 10), tCount = Wd('count', 10), tWho = Wd('who', 10), tCame = Wd('came', 10);
  const tAcc = Wd('accounts', 7);

  // c1 — night sea, ship, wash bloom; ACCOUNTS SAY
  add({ id: 'c1', at: t7, cam: [560, 760], zoom: 0.1, note: 'night sea bloom, ship pitching; ACCOUNTS SAY', draw(lt, d, t) {
    bg(3); ctx.save(); ctx.translate(lerp(20, -20, lt / d), 0);
    bloom(() => { blit(nightImg(), 0, 0, 0, 0); drawShip(560, 1000, 1.05, t); waves(1030, t); }, 560, 820, lerp(80, 1300, eo(clamp(lt / 1.0))), 1, t);
    ctx.restore();
    tag('ACCOUNTS SAY', 300, 210, appear(t, tAcc), { chip: true, size: 44, rot: -0.04 });
    tag('ILLUSTRATION', 850, 1196, appear(lt, 0.3), { size: 26, col: WHITE, under: false });
  } });
  cue(t7, 'whoosh', { gain: 0.5, dur: 0.8 }); cue(tAcc, 'pop', { gain: 0.4 });

  // c2 — boy at the ship rail against the moon
  add({ id: 'c2', at: tDur, cam: [540, 820], zoom: 0.14, note: 'small faceless boy at ship rail, moon; DURAISAMY, A BOY', draw(lt, d, t) {
    bg(4);
    bloom(() => { ctx.save(); ctx.translate(0, lerp(30, 0, eo(clamp(lt / d)))); blit(railImg(), 0, 0, 0, 0); ctx.restore();
      ctx.strokeStyle = rgba(PALE, 0.25); ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { const y = 920 + i * 12; ctx.beginPath(); ctx.moveTo(IX0, y); for (let x = IX0; x <= IX1; x += 40) ctx.lineTo(x, y + Math.sin(x * 0.02 + t * 2 + i) * 3); ctx.stroke(); }
    }, 540, 760, lerp(120, 1300, eo(clamp(lt / 0.8))), 4, t);
    tag('ACCOUNTS SAY', 300, 210, 1, { chip: true, size: 44, rot: -0.04 });
    tag('DURAISAMY', 540, 380, appear(lt, 0.15), { size: 76, col: WHITE });
    tag('A BOY', 540, 470, appear(lt, 0.7), { size: 44, col: PALE });
    tag('ILLUSTRATION', 850, 1196, 1, { size: 26, col: WHITE, under: false });
  } });
  cue(tDur, 'whoosh', { gain: 0.4 }); cue(tDur + 0.15, 'bell', { gain: 0.25, dur: 1.2 });

  // c3 — on the ledger: boy + two outline fathers; father disputed
  add({ id: 'c3', at: tChinna, cam: [540, 760], zoom: 0.08, note: 'boy inked between two outline fathers, red ink lines; FATHER DISPUTED', draw(lt, d, t) {
    bg(5, 12); ctx.save(); ctx.translate(lerp(-30, 30, lt / d), 0);
    const tO = tOr7 - tChinna, tB = tBro - tChinna;
    // left father (Chinna) then right (Periya), outline only
    const fa = clamp(lt / 0.4), fb = clamp((lt - tO) / 0.4);
    ctx.globalAlpha = fa; fig(290, 1100, 520, { ghost: true, turban: true, spear: true }); ctx.globalAlpha = fb; fig(800, 1100, 540, { ghost: true, turban: true, spear: true }); ctx.globalAlpha = 1;
    // red ink lines to the boy
    const ink = (x0, y0, x1, y1, p, dash) => { if (p <= 0) return; ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, p), lerp(y0, y1, p)); ctx.stroke(); ctx.setLineDash([]); };
    ink(330, 820, 520, 950, eo(clamp((lt - 0.2) / 0.4)), []); ink(760, 820, 565, 950, eo(clamp((lt - tO - 0.1) / 0.4)), [14, 12]);
    fig(545, 1130, 230 * lerp(0.9, 1, eo(clamp(lt / 0.3))), { boy: true, body: DEEP, head: PAPER, line: INK });
    ctx.restore();
    tag('CHINNA', 230, 500, appear(lt, 0.15), { size: 48 });
    tag('PERIYA?', 800, 480, appear(lt, tB - 0.1), { size: 48 });
    tag('ACCOUNTS SAY', 300, 210, 1, { chip: true, size: 44, rot: -0.04 });
    tag('FATHER DISPUTED', 700, 300, appear(lt, tO), { chip: true, size: 46, rot: 0.03 });
    tag('ILLUSTRATION', 850, 1196, 1, { size: 26, under: false });
  } });
  cue(tChinna, 'slide', { gain: 0.35 }); cue(tOr7, 'pop', { gain: 0.45 }); cue(tBro, 'tock', { gain: 0.4 });

  // c4 — Penang shore blooms, exiles stand in a row; ONE STUDY
  add({ id: 'c4', at: t8, cam: [420, 820], zoom: 0.1, note: 'Penang shore indigo bloom, exile row; ONE STUDY', draw(lt, d, t) {
    bg(6);
    bloom(() => { ctx.save(); ctx.translate(lerp(40, 0, eo(clamp(lt / d))), 0); blit(shoreImg(), 0, 0, 0, 0); ctx.restore();
      ctx.strokeStyle = rgba(WHITE, 0.4); ctx.lineWidth = 3; ctx.beginPath(); for (let x = IX0; x <= IX1; x += 24) ctx.lineTo(x, 905 + Math.sin(x * 0.02 + t * 2) * 5); ctx.stroke();
      blit(exilesImg(), 300, 480, 340, 1170, 1, clamp(lt / 0.5));
    }, 380, 700, lerp(100, 1300, eo(clamp(lt / 0.9))), 7, t);
    tag('ONE STUDY', 300, 210, appear(t, tStudy), { chip: true, size: 46, rot: -0.03 });
    tag('PENANG', 640, 470, appear(lt, 0.5), { size: 52, col: WHITE });
  } });
  cue(t8, 'whoosh', { gain: 0.5 }); cue(tStudy + 0.05, 'pop', { gain: 0.4 });

  // c5 — convicts slide in, chained
  add({ id: 'c5', at: tConv, cam: [620, 900], zoom: 0.08, note: 'chained convict row slides in beside exiles; WITH CONVICTS', draw(lt, d, t) {
    bg(6); ctx.save(); ctx.beginPath(); ctx.rect(IX0, IY0, IX1 - IX0, IY1 - IY0); ctx.clip();
    ctx.translate(lerp(0, -60, eio(clamp(lt / d))), 0);
    blit(shoreImg(), 0, 0, 0, 0);
    ctx.strokeStyle = rgba(WHITE, 0.4); ctx.lineWidth = 3; ctx.beginPath(); for (let x = IX0; x <= IX1 + 60; x += 24) ctx.lineTo(x, 905 + Math.sin(x * 0.02 + t * 2) * 5); ctx.stroke();
    blit(exilesImg(), 300, 480, 300, 1170, 0.86);
    const sx = lerp(520, 0, eo(clamp(lt / 0.7))), jerk = Math.sin(t * 9) * 2;
    blit(convictsImg(), 320, 420, 830 + sx, 1190 + jerk, 0.92);
    ctx.restore();
    tag('ONE STUDY', 300, 210, 1, { chip: true, size: 46, rot: -0.03 });
    tag('WITH CONVICTS', 760, 620, appear(lt, 0.25), { size: 50, col: WHITE });
  } });
  cue(tConv, 'slide', { gain: 0.45 }); cue(tConv + 0.35, 'tock', { gain: 0.35 }); cue(tConv + 0.6, 'tock', { gain: 0.3 });

  // c6 — exiles stand tall, wax seal slams; RANK & DIGNITY
  add({ id: 'c6', at: tRank, cam: [340, 900], zoom: 0.14, note: 'push on exiles standing tall, red wax seal slam; RANK & DIGNITY', draw(lt, d, t) {
    bg(6); ctx.save(); ctx.beginPath(); ctx.rect(IX0, IY0, IX1 - IX0, IY1 - IY0); ctx.clip(); ctx.translate(-60, 0);
    blit(shoreImg(), 0, 0, 0, 0);
    blit(convictsImg(), 320, 420, 830, 1190, 0.92, 0.55);
    ctx.fillStyle = lg(560, 0, 760, 0, [[0, rgba(NIGHT, 0)], [1, rgba(NIGHT, 0.35)]]); ctx.fillRect(560, IY0, 640, IY1 - IY0);
    const g = ctx.createRadialGradient(360, 1000, 40, 360, 1000, 420); g.addColorStop(0, rgba(WHITE, 0.35)); g.addColorStop(1, rgba(WHITE, 0)); ctx.fillStyle = g; ctx.fillRect(0, 560, 800, 700);
    blit(exilesImg(), 300, 480, 360, 1170, 0.86 * lerp(1, 1.12, eob(clamp(lt / 0.5))));
    ctx.restore();
    tag('ONE STUDY', 300, 210, 1, { chip: true, size: 46, rot: -0.03 });
    tag('RANK & DIGNITY', 380, 560, appear(lt, 0.1), { size: 60, col: WHITE });
    sealSlam(lt - 0.45, 840, 330, 0.85);
  } });
  cue(tRank, 'whoosh', { gain: 0.35 }); cue(tRank + 0.45, 'slam', { gain: 0.7 }); cue(tRank + 0.47, 'thud', { gain: 0.5 });

  // c7 — ledger, nib inks tally strokes, tide begins
  add({ id: 'c7', at: t9, cam: [540, 820], zoom: 0.08, note: 'ledger tally inked, brown tide stain creeps up', draw(lt, d, t) {
    blit(teakImg(), 0, 0, 0, 0); ctx.save(); ctx.translate(540, 700); ctx.rotate(lerp(-0.01, 0.012, lt / d)); ctx.translate(-540, -700);
    blit(ledgImg(), 0, 0, 0, 0);
    // a fresh tally row being inked in the top row
    const yy = 80 + 1240 * 2.5 / 16 + 26, n = Math.floor(clamp(lt / 1.2) * 14); tallyMarks(260, yy, n);
    const k = n % 5, g = Math.floor(n / 5), nx = 260 + g * 80 + k * 13 + 6, ny = yy - 30 - Math.abs(Math.sin(lt * 16)) * 14;
    ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx + 90, ny - 200); ctx.stroke(); ctx.fillStyle = BRASS; ctx.beginPath(); ctx.moveTo(nx, ny + 6); ctx.lineTo(nx + 14, ny - 26); ctx.lineTo(nx - 4, ny - 24); ctx.fill();
    tide(1330 - 1240 * lerp(0.02, 0.32, eio(clamp(lt / d))), t);
    ctx.restore();
  } });
  cue(t9, 'whoosh', { gain: 0.3 }); for (let i = 0; i < 5; i++) cue(t9 + 0.1 + i * 0.25, 'tock', { gain: 0.18 }); cue(t9 + 0.4, 'bubbles', { gain: 0.2, dur: 1.2 });

  // c8 — tide swallows the rows; BARELY RECORDED
  add({ id: 'c8', at: tBarely, cam: [540, 600], zoom: 0.12, note: 'tide swallows ledger rows into blur; BARELY RECORDED', draw(lt, d, t) {
    blit(teakImg(), 0, 0, 0, 0); ctx.save(); ctx.translate(540, 700); ctx.rotate(0.012 + Math.sin(lt * 1.5) * 0.004); ctx.translate(-540, -700);
    blit(ledgImg(), 0, 0, 0, 0); const yy = 80 + 1240 * 2.5 / 16 + 26; tallyMarks(260, yy, 14);
    tide(1330 - 1240 * lerp(0.32, 0.82, eo(clamp(lt / d))), t);
    ctx.restore();
    tag('BARELY RECORDED', 540, 240, appear(lt, 0.15), { chip: true, size: 60, rot: -0.02 });
  } });
  cue(tBarely, 'swell', { gain: 0.3, dur: 1.6 });

  // split scene (used by c9 and c10)
  const drawSplit = (lt, t, rightP, tight) => {
    ctx.save(); ctx.beginPath(); ctx.rect(IX0, IY0, 540 - IX0, IY1 - IY0); ctx.clip();
    ctx.translate(-330, 0); blit(nightImg(), 0, 0, 0, 0); ctx.translate(330, 0);
    drawShip(310, 960, 0.6, t); waves(985, t, IX0, 540, 10); ctx.restore();
    bloom(() => { blit(worseImg(), 0, 0, 0, 0); knot(800, 172, t, tight); crows(t, 780, 930, 7, 3, clamp(rightP * 1.4 - 0.2)); }, 780, 700, lerp(40, 900, eo(rightP)), 9, t, [540, IY0, IX1, IY1]);
  };
  // c9 — split: MERCY? vs OR WORSE?
  add({ id: 'c9', at: t10, cam: [540, 700], zoom: 0.07, note: 'split: ship (MERCY?) | rope knot, fort, crows (OR WORSE?)', draw(lt, d, t) {
    bg(8); const rp = clamp((t - tOr) / 0.8);
    bloom(() => drawSplit(lt, t, rp, eo(clamp((t - tRope) / 0.4))), 310, 700, lerp(60, 1300, eo(clamp(lt / 0.7))), 2, t, [IX0, IY0, 540, IY1]);
    if (rp > 0) drawSplit(lt, t, rp, eo(clamp((t - tRope) / 0.4)));
    // rope divider pulled down
    const rd = eo(clamp(lt / 0.35)); ctx.save(); ctx.beginPath(); ctx.rect(IX0, IY0 - 40, IX1 - IX0, IY1 - IY0 + 40); ctx.clip(); ctx.translate(540, IY0 - 30); ctx.rotate(Math.PI / 2); blit(ropeImg(), 0, 20, -1600 + rd * (IY1 - IY0 + 60), 0, 1, 1, 0.9); ctx.restore();
    tag('MERCY?', 310, 260, appear(lt, 0.1), { size: 64, col: WHITE });
    tag('OR WORSE?', 770, 260, appear(t, tOr + 0.1), { size: 60, col: WHITE });
  } });
  cue(t10, 'whoosh', { gain: 0.45 }); cue(tOr, 'whoosh', { gain: 0.45, pan: 0.5 }); cue(tRope, 'thud', { gain: 0.5 });

  // c10 — panels shrink, arrow down; TELL ME BELOW
  add({ id: 'c10', at: tTell, cam: [540, 760], zoom: 0.06, note: 'split shrinks to two panels, ink arrow bobs down; TELL ME BELOW', draw(lt, d, t) {
    bg(9, 10); const s = lerp(1, 0.56, eio(clamp(lt / 0.4)));
    ctx.save(); ctx.translate(540, lerp(677, 520, eio(clamp(lt / 0.4)))); ctx.scale(s, s); ctx.translate(-540, -677);
    drawSplit(lt, t, 1, 1); ctx.strokeStyle = INK; ctx.lineWidth = 6 / s; ctx.strokeRect(IX0, IY0, 540 - IX0 - 8, IY1 - IY0); ctx.strokeRect(548, IY0, IX1 - 548, IY1 - IY0);
    ctx.save(); ctx.beginPath(); ctx.rect(IX0, IY0, IX1 - IX0, IY1 - IY0); ctx.clip(); ctx.translate(540, IY0); ctx.rotate(Math.PI / 2); blit(ropeImg(), 0, 20, 0, 0, 1, 1, 0.9); ctx.restore();
    tag('MERCY?', 310, 260, 1, { size: 64, col: WHITE }); tag('OR WORSE?', 770, 260, 1, { size: 60, col: WHITE });
    ctx.restore();
    tag('TELL ME BELOW', 540, 960, appear(lt, 0.2), { size: 66 });
    ctx.save(); ctx.translate(0, Math.sin(lt * 9) * 10 * clamp(lt - 0.5)); arrow(540, 1050, 1220, clamp((lt - 0.3) / 0.4)); ctx.restore();
  } });
  cue(tTell, 'pop', { gain: 0.5 }); cue(tTell + 0.35, 'zip', { gain: 0.3 });

  // c11 — tally of 73, most fade; WHO NEVER CAME HOME?
  const keep = new Set([4, 17, 26, 38, 51, 63, 70]);
  add({ id: 'c11', at: tWatch, cam: [540, 760], zoom: 0.1, note: 'ledger tally of 73 figures, most fade, rows struck red; ABOUT 73 -> WHO NEVER CAME HOME?', draw(lt, d, t) {
    bg(10, 10);
    const tc = tCount - tWatch, tw = tWho - tWatch;
    for (let i = 0; i < 73; i++) { const r = Math.floor(i / 10), c = i % 10, x = 162 + c * 84, y = 420 + r * 104;
      const ap = clamp((lt - i * 0.006) / 0.15), fade = keep.has(i) ? 0 : clamp((lt - tc + 0.25 - rnd(i + 300) * 0.5) / 0.35);
      if (ap <= 0) continue; blit(figIcon(), 30, 104, x, y, 0.85 * lerp(1.3, 1, eo(ap)), ap * lerp(1, 0.1, fade)); }
    for (let r = 0; r < 8; r++) { const p = clamp((lt - tc - r * 0.07) / 0.3); if (p <= 0) continue; const y = 420 + r * 104 - 40, x1 = r === 7 ? 162 + 2 * 84 + 40 : 958;
      ctx.strokeStyle = rgba(RED, 0.8); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(130, y); ctx.lineTo(lerp(130, x1, p), y + 4); ctx.stroke(); }
    tag('ABOUT 73', 540, 240, appear(lt, 0.05, tw), { chip: true, size: 52 });
    tag('WHO NEVER CAME HOME?', 540, 240, appear(lt, tw), { size: 58 });
  } });
  cue(tWatch, 'whoosh', { gain: 0.35 }); for (let i = 0; i < 4; i++) cue(tWatch + 0.05 + i * 0.12, 'tock', { gain: 0.15 }); cue(tCount, 'sizzle', { gain: 0.2, dur: 0.8 }); cue(tWho, 'drum', { gain: 0.45 });

  // c12 — loop: ship on night sea, red seal slam
  add({ id: 'c12', at: tCame, cam: [560, 800], zoom: 0.12, note: 'loop: ship on night sea again, red wax seal slam; WHO NEVER CAME HOME?', draw(lt, d, t) {
    bg(3);
    bloom(() => { blit(nightImg(), 0, 0, 0, 0); drawShip(560, 1000, 1.05, t); waves(1030, t); }, 560, 820, lerp(150, 1300, eo(clamp(lt / 0.6))), 1, t);
    tag('WHO NEVER CAME HOME?', 540, 240, 1, { size: 58, col: WHITE });
    sealSlam(lt - 0.25, 850, 1110, 0.8);
  } });
  cue(tCame, 'whoosh', { gain: 0.45 }); cue(tCame + 0.25, 'slam', { gain: 0.75 }); cue(tCame + 0.27, 'thud', { gain: 0.5 });
}
