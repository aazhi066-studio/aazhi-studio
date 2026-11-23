// EPISODE 18 · worker B : "Tide-Stained Manifest", lines 4-6 (L(4) -> L(7)).
//   b1  ledger page on the teak table; indigo wash blooms; red wax drops and a brass seal slams it; 24 OCT 1801
//   b2  Tiruppattur fort walls at dusk (indigo wash); a rope knot tightens (empty loop, never a body); crows lift off; TIRUPPATTUR FORT
//   b3  ACCOUNTS SAY: close on abstract ledger rows; an unseen nib strikes them through in red, one by one
//   b4  wider: the struck page, more rows struck, crows cross, night wash creeps in from the corner
//   b5  hard turn: the page flips; a row of faceless figures, most wash away, a few stay standing; NOT EVERYONE
//   b6  tally: the nib inks |||| groups up to ABOUT 73, the last stroke flickers, SOME SAY 72 tag slams on
//   b7  rope wipe; faceless exiles file up a gangplank onto a pitching East Indiaman
//   b8  sea chart of the Bay of Bengal: dotted route from the Tamil coast to PENANG off MALAYA as the ship crosses
// All pages, scenes, ship, chart, seal, wax and figures are baked once with cached(); per frame: blits, a few
// strokes (strikes, tally, rope, crows, waves) and a few wash blobs. No shadowBlur.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, rgba } from './art.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const Q = { paper: '#E9DFC6', fox: '#CDBE98', rule: '#9DB2C8', red: '#B0261E', redHi: '#E0574A', ink: '#2B1D14', deep: '#1F3A68', mid: '#4E6E9E',
  pale: '#A9BCD6', brass: '#C79A3E', brassHi: '#E9C878', teak: '#1A110B', white: '#F3EBD7', hemp: '#B89A6A' };

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

// ───────────── small drawing helpers (cache-time unless noted) ─────────────
/** wobbly iron-gall ink polyline */
function wob(pts, seed = 1, amp = 2.2, lw = 3, col = Q.ink, close = false) {
  ctx.beginPath();
  const P = close ? [...pts, pts[0]] : pts;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1], n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 18));
    for (let k = 0; k <= n; k++) { const u = k / n, j = (rnd(seed * 97 + i * 13 + k) - 0.5) * amp * 2; const x = lerp(x0, x1, u) + j, y = lerp(y0, y1, u) + (rnd(seed * 51 + i * 7 + k) - 0.5) * amp * 2;
      if (i === 0 && k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  }
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
/** diagonal cross-hatch inside the current path's bounding box (call after clip) */
function hatch(x0, y0, x1, y1, gap = 12, ang = 1, col = 'rgba(43,29,20,0.35)', lw = 1.6) {
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
  const hgt = y1 - y0;
  for (let x = x0 - hgt; x < x1 + hgt; x += gap) { ctx.moveTo(x, y1); ctx.lineTo(x + hgt * ang, y0); }
  ctx.stroke();
}
/** noisy watercolour blob outline (per frame ok: 40 points) */
function blobPath(cx, cy, r, seed = 1, t = 0, sy = 1) {
  ctx.beginPath(); const n = 40;
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, k = 1 + 0.11 * sin(3 * a + seed + t * 0.8) + 0.07 * sin(5 * a + seed * 2.3 - t * 0.6) + 0.04 * sin(11 * a + seed * 3.1);
    const x = cx + cos(a) * r * k, y = cy + sin(a) * r * k * sy; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
}
/** indigo wash bloom: fill + darker wet edge + granulation specks */
function bloom(cx, cy, r, seed, t, col = Q.mid, a = 0.5, sy = 1) {
  if (r <= 2 || a <= 0) return;
  blobPath(cx, cy, r, seed, t, sy); ctx.fillStyle = rgba(col, a * 0.55); ctx.fill();
  ctx.strokeStyle = rgba(Q.deep, a * 0.55); ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = rgba(Q.deep, a * 0.35);
  for (let i = 0; i < 14; i++) { const an = rnd(seed * 7 + i) * TAU, rr = Math.sqrt(rnd(seed * 11 + i)) * r * 0.85; ctx.fillRect(cx + cos(an) * rr, cy + sin(an) * rr * sy, 3, 3); }
}
/** label: Caladea caps; mode 'ink' (on paper, red underline) or 'band' (paper-white on an indigo wash band) or 'red' */
function tag(text, x, y, size, mode = 'ink', a = 1, sc = 1, rot = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.08)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width;
  if (mode === 'band' || mode === 'red') {
    const bw = w + size * 1.1, bh = size * 1.55, col = mode === 'red' ? Q.red : Q.deep;
    ctx.beginPath(); const n = 24;
    for (let i = 0; i <= n; i++) ctx.lineTo(-bw / 2 + bw * i / n, -bh / 2 + (rnd(i + size) - 0.5) * 5);
    for (let i = n; i >= 0; i--) ctx.lineTo(-bw / 2 + bw * i / n, bh / 2 + (rnd(i + size + 40) - 0.5) * 5);
    ctx.closePath(); ctx.fillStyle = rgba(col, 0.92); ctx.fill(); ctx.strokeStyle = rgba(mode === 'red' ? '#6E140F' : '#122644', 0.8); ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = Q.white; ctx.fillText(text, 0, size * 0.05);
  } else {
    ctx.fillStyle = Q.ink; ctx.fillText(text, 0, 0);
    ctx.strokeStyle = Q.red; ctx.lineWidth = Math.max(3, size * 0.08); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w / 2, size * 0.62); ctx.quadraticCurveTo(0, size * 0.7, w / 2, size * 0.58); ctx.stroke();
  }
  ctx.letterSpacing = '0px'; ctx.restore();
}
const pop = (lt, t0, d = 0.3) => (lt < t0 ? 0 : eob(clamp((lt - t0) / d)));

// ───────────── table ─────────────
const teakC = () => cached('bteak', 1080, 1920, 0.5, () => {
  ctx.fillStyle = Q.teak; ctx.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 220; i++) { const y = rnd(i * 3.1) * 1920, a = 0.03 + rnd(i * 5.7) * 0.07; ctx.strokeStyle = rnd(i) > 0.4 ? `rgba(120,72,36,${a})` : `rgba(0,0,0,${a * 1.5})`;
    ctx.lineWidth = 1 + rnd(i * 9) * 4; ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= 1080; x += 60) ctx.lineTo(x, y + sin(x * 0.004 + i) * 14 + sin(x * 0.013 + i * 2) * 4); ctx.stroke(); }
  const g = ctx.createRadialGradient(540, 760, 200, 540, 900, 1250); g.addColorStop(0, 'rgba(90,55,25,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
});
function table(lt, dx = 0) { blit(teakC(), 540, 960, 540 + dx, 960, 1.18); }

// ───────────── pages ─────────────
const PW = 940, PH = 1080, PAD = 20;   // illustration / ledger page size, centred at (540, 720) → y 180-1260
const PG = { x: 540, y: 720 };
const rowY = (r, rows = 14) => -PH / 2 + PH * (r + 1.5) / (rows + 2);
const ledgerC = (seed, rows = 14) => cached(`bled${seed}r${rows}`, PW + PAD * 2, PH + PAD * 2, 1, () => {
  // soft drop shade under the page (baked, no shadowBlur)
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(PAD + 10, PAD + 14, PW, PH);
  ledgerPage(PW / 2 + PAD, PH / 2 + PAD, PW, PH, 0, rows, seed);
});
const pageAt = (c, x, y, s = 1, a = 1) => blit(c, PW / 2 + PAD, PH / 2 + PAD, x, y, s, a);

// ───────────── wax + seal ─────────────
const waxC = () => cached('bwax', 300, 300, 1, () => {
  ctx.translate(150, 150);
  ctx.beginPath(); const n = 44;
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, k = 1 + 0.1 * sin(5 * a + 1) + 0.07 * sin(9 * a + 2) + (rnd(i) > 0.82 ? 0.14 : 0); ctx.lineTo(cos(a) * 120 * k, sin(a) * 120 * k); }
  ctx.closePath(); const g = ctx.createRadialGradient(-30, -30, 10, 0, 0, 140); g.addColorStop(0, Q.redHi); g.addColorStop(0.5, Q.red); g.addColorStop(1, '#6E140F'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(70,10,8,0.7)'; ctx.lineWidth = 4; ctx.stroke();
  // pressed imprint: rings + star (no letters)
  for (const [r, w] of [[88, 7], [74, 3], [40, 3]]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.strokeStyle = 'rgba(80,10,8,0.75)'; ctx.lineWidth = w; ctx.stroke();
    ctx.beginPath(); ctx.arc(-2, -2, r, PI * 1.05, PI * 1.6); ctx.strokeStyle = 'rgba(240,120,100,0.5)'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 13 : 32; ctx.lineTo(cos(a) * r, sin(a) * r); } ctx.closePath(); ctx.fillStyle = 'rgba(80,10,8,0.8)'; ctx.fill();
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.fillStyle = 'rgba(80,10,8,0.6)'; ctx.beginPath(); ctx.arc(cos(a) * 81, sin(a) * 81, 3, 0, TAU); ctx.fill(); }
});
const sealC = () => cached('bseal', 260, 260, 1, () => {
  ctx.translate(130, 130);
  const g = ctx.createRadialGradient(-30, -40, 10, 0, 0, 125); g.addColorStop(0, Q.brassHi); g.addColorStop(0.6, Q.brass); g.addColorStop(1, '#7A5A1E');
  ctx.beginPath(); ctx.arc(0, 0, 115, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#5A3F12'; ctx.lineWidth = 5; ctx.stroke();
  for (const r of [92, 76, 42]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.strokeStyle = 'rgba(90,63,18,0.8)'; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 14 : 34; ctx.lineTo(cos(a) * r, sin(a) * r); } ctx.closePath(); ctx.fillStyle = '#7A5A1E'; ctx.fill();
  ctx.beginPath(); ctx.arc(-40, -48, 30, 0, TAU); ctx.fillStyle = 'rgba(255,245,200,0.25)'; ctx.fill();
});

// ───────────── fort at dusk (b2) ─────────────
const fortC = () => cached('bfort', PW + PAD * 2, PH + PAD * 2, 1, () => {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(PAD + 10, PAD + 14, PW, PH);
  ledgerPage(PW / 2 + PAD, PH / 2 + PAD, PW, PH, 0, 0, 21);
  ctx.translate(PAD, PAD);
  // painted area with a ragged wash edge
  ctx.save(); blobPath(470, 560, 520, 4, 0, 1.12); ctx.clip();
  let g = ctx.createLinearGradient(0, 40, 0, 760); g.addColorStop(0, rgba(Q.deep, 0.95)); g.addColorStop(0.55, rgba(Q.mid, 0.85)); g.addColorStop(1, rgba(Q.pale, 0.75));
  ctx.fillStyle = g; ctx.fillRect(0, 0, PW, 780);
  // dusk sun: a pale red wax disc low behind the wall
  g = ctx.createRadialGradient(640, 650, 0, 640, 650, 170); g.addColorStop(0, 'rgba(224,87,74,0.55)'); g.addColorStop(0.45, 'rgba(176,38,30,0.25)'); g.addColorStop(1, 'rgba(176,38,30,0)'); ctx.fillStyle = g; ctx.fillRect(400, 420, 480, 460);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = rgba(Q.pale, 0.18); ctx.beginPath(); ctx.ellipse(120 + i * 150, 220 + rnd(i) * 220, 160, 22, 0, 0, TAU); ctx.fill(); }
  // ground wash
  g = ctx.createLinearGradient(0, 960, 0, 1080); g.addColorStop(0, rgba(Q.mid, 0.7)); g.addColorStop(1, rgba(Q.pale, 0.4)); ctx.fillStyle = g; ctx.fillRect(0, 960, PW, 140);
  // walls
  const top = 720, base = 975, wall = [[-20, base], [-20, top]];
  for (let x = -20; x < 960; x += 56) { wall.push([x, top], [x, top - 34], [x + 30, top - 34], [x + 30, top]); }
  wall.push([960, top], [960, base]);
  ctx.beginPath(); wall.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = rgba(Q.deep, 0.96); ctx.fill();
  ctx.save(); ctx.clip(); for (let y = top + 24; y < base; y += 26) { ctx.strokeStyle = 'rgba(10,18,40,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(PW, y + 3); ctx.stroke(); }
  hatch(0, top - 40, PW, base, 14, 0.6, 'rgba(8,14,30,0.35)'); ctx.restore();
  wob(wall, 5, 1.8, 3.2, 'rgba(18,14,20,0.9)');
  // round bastion (left) and gate tower (right)
  ctx.beginPath(); ctx.moveTo(60, base); ctx.lineTo(70, 600); ctx.quadraticCurveTo(170, 570, 270, 600); ctx.lineTo(280, base); ctx.closePath(); ctx.fillStyle = rgba('#17305A', 1); ctx.fill();
  ctx.save(); ctx.clip(); hatch(60, 560, 300, base, 11, 0.9, 'rgba(8,14,30,0.45)'); ctx.restore();
  wob([[60, base], [70, 600], [120, 586], [170, 580], [220, 586], [270, 600], [280, base]], 7, 1.8, 3.4, 'rgba(18,14,20,0.9)');
  for (let x = 74; x < 270; x += 40) { ctx.fillStyle = rgba('#17305A', 1); ctx.fillRect(x, 560 + Math.abs(x - 170) * 0.12, 24, 30); }
  ctx.fillStyle = 'rgba(10,10,18,0.85)'; ctx.fillRect(160, 680, 16, 34);
  ctx.beginPath(); ctx.moveTo(720, base); ctx.lineTo(720, 620); ctx.lineTo(880, 620); ctx.lineTo(880, base); ctx.closePath(); ctx.fillStyle = rgba('#17305A', 1); ctx.fill();
  ctx.save(); ctx.clip(); hatch(700, 600, 900, base, 11, 0.9, 'rgba(8,14,30,0.45)'); ctx.restore();
  for (let x = 720; x < 880; x += 40) ctx.fillRect(x, 596, 24, 26);
  wob([[720, base], [720, 620], [880, 620], [880, base]], 9, 1.6, 3.4, 'rgba(18,14,20,0.9)');
  // gate arch
  ctx.beginPath(); ctx.moveTo(460, base); ctx.lineTo(460, 860); ctx.arc(510, 860, 50, PI, 0); ctx.lineTo(560, base); ctx.closePath(); ctx.fillStyle = 'rgba(8,10,20,0.92)'; ctx.fill();
  // gallows beam from bastion across the sky (rope drawn per frame)
  ctx.fillStyle = 'rgba(30,20,14,0.95)'; ctx.fillRect(150, 300, 470, 22); ctx.fillRect(150, 300, 20, 300);
  ctx.beginPath(); ctx.moveTo(170, 400); ctx.lineTo(260, 322); ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(30,20,14,0.95)'; ctx.stroke();
  wob([[150, 300], [620, 300], [620, 322], [170, 322]], 3, 1.2, 2.4, Q.ink);
  // granulation specks
  for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(20,30,60,${0.08 + rnd(i * 3) * 0.15})`; ctx.fillRect(rnd(i * 7) * PW, rnd(i * 11) * 1000, 2 + rnd(i) * 2, 2 + rnd(i) * 2); }
  ctx.restore();
  // wet edge of the painting
  blobPath(470, 560, 520, 4, 0, 1.12); ctx.strokeStyle = rgba(Q.deep, 0.5); ctx.lineWidth = 9; ctx.stroke();
});
function crow(x, y, s, flap, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = '#120E14';
  const w = sin(flap) * 0.9;
  ctx.beginPath(); ctx.ellipse(0, 0, 18, 7, -0.1, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(17, -4, 6, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(22, -4); ctx.lineTo(31, -2); ctx.lineTo(22, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-30, -4); ctx.lineTo(-30, 5); ctx.fill();
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-4, -30 * w * sd - 6, -22, -44 * w * sd); ctx.quadraticCurveTo(6, -20 * w * sd, 8, 0); ctx.fill(); }
  ctx.restore();
}
/** hemp rope segment from (x0,y0) to (x1,y1), alternating diagonal strand hatch (per frame, cheap) */
function rope(x0, y0, x1, y1, w = 14, col = Q.hemp) {
  const len = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang);
  ctx.fillStyle = col; ctx.fillRect(0, -w / 2, len, w);
  ctx.strokeStyle = 'rgba(60,40,20,0.8)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x < len; x += w * 0.7) { ctx.moveTo(x, -w / 2); ctx.lineTo(x + w * 0.5, w / 2); } ctx.stroke();
  ctx.strokeStyle = Q.ink; ctx.lineWidth = 2; ctx.strokeRect(0, -w / 2, len, w);
  ctx.restore();
}

// ───────────── figures ─────────────
const figC = (kind) => cached('bfig' + kind, 90, 240, 1.5, () => {
  // faceless silhouette: blank oval head, cloth wrap body; kind 0 solid wash, 1 ghost (pale outline only)
  const solid = kind === 0;
  ctx.translate(45, 0);
  const body = [[-26, 230], [-30, 120], [-22, 76], [0, 66], [22, 76], [30, 120], [26, 230], [8, 230], [4, 170], [-4, 170], [-8, 230]];
  ctx.beginPath(); body.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = solid ? rgba(Q.deep, 0.9) : rgba(Q.pale, 0.35); ctx.fill();
  if (solid) { ctx.save(); ctx.clip(); hatch(-40, 60, 40, 240, 9, 0.7, 'rgba(10,14,30,0.4)'); ctx.restore(); }
  wob(body, kind + 3, 1.2, solid ? 2.6 : 1.6, solid ? Q.ink : 'rgba(43,29,20,0.3)', true);
  ctx.beginPath(); ctx.ellipse(0, 40, 17, 22, 0, 0, TAU); ctx.fillStyle = solid ? '#E4D8BC' : 'rgba(233,223,198,0.4)'; ctx.fill();
  ctx.strokeStyle = solid ? Q.ink : 'rgba(43,29,20,0.3)'; ctx.lineWidth = solid ? 2.6 : 1.6; ctx.stroke();
});
const fig = (x, y, s = 1, a = 1, kind = 0) => blit(figC(kind), 45, 230, x, y, s, a);

// ───────────── the East Indiaman (b7, b8) ─────────────
const SHW = 760, SHH = 760;
const shipC = () => cached('bship', SHW, SHH, 1, () => {
  ctx.translate(380, 600);   // waterline centre
  // masts + yards + furled sails
  for (const [mx, mh] of [[-170, 470], [10, 540], [180, 440]]) {
    ctx.fillStyle = Q.ink; ctx.fillRect(mx - 5, -mh, 10, mh);
    for (const [yy, hw] of [[-mh + 60, 70], [-mh + 190, 110], [-mh + 330, 140]]) {
      if (yy > -90) continue;
      ctx.fillStyle = Q.ink; ctx.fillRect(mx - hw, yy, hw * 2, 6);
      ctx.beginPath(); ctx.moveTo(mx - hw * 0.9, yy + 6); ctx.quadraticCurveTo(mx, yy + 70, mx + hw * 0.9, yy + 6); ctx.closePath(); ctx.fillStyle = rgba(Q.pale, 0.85); ctx.fill();
      ctx.save(); ctx.clip(); hatch(mx - hw, yy, mx + hw, yy + 70, 10, 0.5, 'rgba(31,58,104,0.35)'); ctx.restore();
      wob([[mx - hw * 0.9, yy + 6], [mx - hw * 0.4, yy + 32], [mx, yy + 38], [mx + hw * 0.4, yy + 32], [mx + hw * 0.9, yy + 6]], mx + yy, 1, 2, Q.ink);
    }
  }
  // rigging
  ctx.strokeStyle = 'rgba(43,29,20,0.7)'; ctx.lineWidth = 1.6; ctx.beginPath();
  ctx.moveTo(-340, -60); ctx.lineTo(-170, -470); ctx.lineTo(10, -540); ctx.lineTo(180, -440); ctx.lineTo(330, -90);
  for (const mx of [-170, 10, 180]) for (let k = -1; k <= 1; k += 2) { ctx.moveTo(mx, mx === 10 ? -520 : -420); ctx.lineTo(mx + k * 90, -95); }
  ctx.stroke();
  // bowsprit
  ctx.fillStyle = Q.ink; ctx.save(); ctx.translate(290, -110); ctx.rotate(-0.32); ctx.fillRect(0, -4, 150, 8); ctx.restore();
  // hull
  const hull = [[-330, -130], [-300, -60], [-260, 0], [240, 0], [300, -60], [330, -120], [300, -120], [-300, -112], [-340, -170], [-300, -170]];
  ctx.beginPath(); hull.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  const g = ctx.createLinearGradient(0, -170, 0, 0); g.addColorStop(0, Q.mid); g.addColorStop(1, Q.deep); ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip(); hatch(-360, -180, 360, 0, 12, 0.7, 'rgba(10,14,30,0.4)');
  ctx.fillStyle = rgba(Q.pale, 0.8); ctx.fillRect(-300, -92, 600, 18);
  for (let x = -260; x < 260; x += 48) { ctx.fillStyle = '#0E1A30'; ctx.fillRect(x, -89, 18, 12); }
  ctx.restore();
  wob(hull, 2, 1.5, 3.2, Q.ink, true);
  // stern lantern + flag
  ctx.fillStyle = Q.brass; ctx.fillRect(-338, -192, 10, 18);
  ctx.fillStyle = Q.red; ctx.beginPath(); ctx.moveTo(10, -540); ctx.lineTo(70, -528); ctx.lineTo(10, -514); ctx.fill();
  // water shadow
  ctx.fillStyle = rgba(Q.deep, 0.35); ctx.beginPath(); ctx.ellipse(0, 10, 360, 18, 0, 0, TAU); ctx.fill();
});
const shipAt = (x, y, s, rot = 0, a = 1) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); blit(shipC(), 380, 600, 0, 0, s, a); ctx.restore(); };

const dockC = () => cached('bdock', PW + PAD * 2, PH + PAD * 2, 1, () => {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(PAD + 10, PAD + 14, PW, PH);
  ledgerPage(PW / 2 + PAD, PH / 2 + PAD, PW, PH, 0, 0, 33);
  ctx.translate(PAD, PAD);
  ctx.save(); blobPath(470, 560, 520, 8, 0, 1.12); ctx.clip();
  let g = ctx.createLinearGradient(0, 40, 0, 780); g.addColorStop(0, rgba(Q.mid, 0.75)); g.addColorStop(1, rgba(Q.pale, 0.6)); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, 790);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = rgba(Q.white, 0.22); ctx.beginPath(); ctx.ellipse(100 + i * 190, 160 + rnd(i + 4) * 200, 150, 20, 0, 0, TAU); ctx.fill(); }
  g = ctx.createLinearGradient(0, 780, 0, 1100); g.addColorStop(0, rgba(Q.mid, 0.9)); g.addColorStop(1, rgba(Q.deep, 0.95)); ctx.fillStyle = g; ctx.fillRect(0, 780, PW, 320);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 780, PW, 320); ctx.clip(); hatch(0, 780, PW, 1100, 16, 0.25, 'rgba(10,18,40,0.3)'); ctx.restore();
  // stone quay on the left
  const q = [[-10, 1100], [-10, 790], [250, 790], [262, 1100]];
  ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = '#8C7B5E'; ctx.fill();
  ctx.save(); ctx.clip(); for (let y = 810; y < 1100; y += 34) for (let x = (y / 34 % 2) * 30 - 10; x < 270; x += 60) { ctx.strokeStyle = 'rgba(43,29,20,0.45)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, 60, 34); } ctx.restore();
  wob(q, 4, 1.5, 3, Q.ink);
  // a bollard
  ctx.fillStyle = Q.ink; ctx.fillRect(200, 760, 26, 32); ctx.beginPath(); ctx.ellipse(213, 760, 18, 7, 0, 0, TAU); ctx.fill();
  for (let i = 0; i < 200; i++) { ctx.fillStyle = `rgba(20,30,60,${0.06 + rnd(i * 3) * 0.12})`; ctx.fillRect(rnd(i * 7 + 1) * PW, rnd(i * 13) * 1080, 2, 2); }
  ctx.restore();
  blobPath(470, 560, 520, 8, 0, 1.12); ctx.strokeStyle = rgba(Q.deep, 0.5); ctx.lineWidth = 9; ctx.stroke();
});

// ───────────── sea chart (b8) ─────────────
// page-local coordinates (0..PW, 0..PH); the route runs from the Tamil coast to Penang
const ROUTE = [[255, 640], [340, 668], [450, 690], [560, 690], [660, 672], [740, 640], [790, 612]];
const chartC = () => cached('bchart', PW + PAD * 2, PH + PAD * 2, 1, () => {
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(PAD + 10, PAD + 14, PW, PH);
  ledgerPage(PW / 2 + PAD, PH / 2 + PAD, PW, PH, 0, 0, 44);
  ctx.translate(PAD, PAD);
  // sea wash
  ctx.save(); blobPath(470, 560, 500, 12, 0, 1.1); ctx.clip();
  const g = ctx.createRadialGradient(480, 600, 60, 480, 600, 560); g.addColorStop(0, rgba(Q.pale, 0.55)); g.addColorStop(1, rgba(Q.mid, 0.7)); ctx.fillStyle = g; ctx.fillRect(0, 0, PW, PH);
  for (let i = 0; i < 300; i++) { ctx.fillStyle = `rgba(20,30,60,${0.06 + rnd(i * 3) * 0.12})`; ctx.fillRect(rnd(i * 7 + 2) * PW, rnd(i * 13 + 1) * PH, 2, 2); }
  ctx.restore();
  blobPath(470, 560, 500, 12, 0, 1.1); ctx.strokeStyle = rgba(Q.deep, 0.45); ctx.lineWidth = 8; ctx.stroke();
  // rhumb lines from the compass rose
  const CR = [470, 900];
  ctx.strokeStyle = 'rgba(176,38,30,0.22)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.moveTo(CR[0], CR[1]); ctx.lineTo(CR[0] + cos(a) * 1100, CR[1] + sin(a) * 1100); } ctx.stroke();
  // land: south India (left), Sri Lanka, Malay peninsula (right), a hint of Sumatra, Penang island
  const land = (pts, seed) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = '#E3D6B4'; ctx.fill();
    ctx.save(); ctx.clip(); hatch(-50, 0, PW + 50, PH, 14, 1, 'rgba(43,29,20,0.18)'); ctx.restore(); wob(pts, seed, 1.6, 3, Q.ink, true);
    // coastal wash lines (offset ripples)
    ctx.save(); ctx.translate(0, 0); ctx.strokeStyle = rgba(Q.deep, 0.25); ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0] + 10, p[1] + 4) : ctx.moveTo(p[0] + 10, p[1] + 4))); ctx.stroke(); ctx.restore(); };
  land([[-20, 120], [120, 150], [190, 260], [215, 380], [232, 500], [250, 600], [262, 680], [240, 780], [200, 880], [170, 950], [140, 990], [110, 940], [80, 820], [40, 700], [-20, 600]], 1);
  land([[262, 945], [300, 930], [330, 990], [325, 1050], [290, 1075], [262, 1030], [252, 985]], 2);
  land([[820, 120], [880, 140], [960, 120], [960, 1060], [930, 1040], [900, 960], [870, 840], [845, 720], [828, 620], [815, 500], [805, 380], [800, 250]], 3);
  land([[960, 820], [900, 900], [860, 990], [880, 1080], [960, 1080]], 4);
  land([[778, 588], [796, 578], [806, 596], [800, 618], [782, 616]], 5);
  // brass compass rose
  ctx.save(); ctx.translate(CR[0], CR[1]);
  ctx.beginPath(); ctx.arc(0, 0, 92, 0, TAU); ctx.strokeStyle = Q.brass; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 78, 0, TAU); ctx.strokeStyle = 'rgba(43,29,20,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  for (let i = 0; i < 8; i++) { const a = i * PI / 4, r = i % 2 ? 52 : 86; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cos(a - 0.2) * 16, sin(a - 0.2) * 16); ctx.lineTo(cos(a) * r, sin(a) * r); ctx.lineTo(cos(a + 0.2) * 16, sin(a + 0.2) * 16); ctx.closePath();
    ctx.fillStyle = i % 2 ? rgba(Q.deep, 0.75) : (i === 6 ? Q.red : Q.brass); ctx.fill(); ctx.strokeStyle = Q.ink; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fillStyle = Q.ink; ctx.fill(); ctx.restore();
  // departure dot on the Tamil coast
  ctx.beginPath(); ctx.arc(ROUTE[0][0], ROUTE[0][1], 9, 0, TAU); ctx.fillStyle = Q.red; ctx.fill(); ctx.strokeStyle = Q.ink; ctx.lineWidth = 2; ctx.stroke();
});
function routePt(p) {
  const segs = []; let tot = 0;
  for (let i = 1; i < ROUTE.length; i++) { const l = Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]); segs.push(l); tot += l; }
  let d = clamp(p) * tot;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) { const u = clamp(d / segs[i]); return { i, x: lerp(ROUTE[i][0], ROUTE[i + 1][0], u), y: lerp(ROUTE[i][1], ROUTE[i + 1][1], u), a: Math.atan2(ROUTE[i + 1][1] - ROUTE[i][1], ROUTE[i + 1][0] - ROUTE[i][0]) }; } d -= segs[i]; }
}

// ───────────── strikes / tally (per frame) ─────────────
function strike(x0, y0, x1, p, seed, lw = 5) {
  if (p <= 0) return;
  const xe = lerp(x0, x1, p); ctx.beginPath(); ctx.moveTo(x0, y0);
  for (let x = x0 + 30; x < xe; x += 30) ctx.lineTo(x, y0 + sin(x * 0.03 + seed) * 2.5 + (rnd(seed + x) - 0.5) * 2);
  ctx.lineTo(xe, y0 + (xe - x0) * 0.008);
  ctx.strokeStyle = rgba(Q.red, 0.9); ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
  if (p < 1) nib(xe, y0);
}
function nib(x, y) {   // the unseen writer's nib: just the steel tip
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.7);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -60); ctx.lineTo(-4, -140); ctx.lineTo(14, -140); ctx.lineTo(12, -60); ctx.closePath();
  ctx.fillStyle = '#3A3530'; ctx.fill(); ctx.strokeStyle = '#8A8070'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1, -10); ctx.lineTo(2, -60); ctx.strokeStyle = '#C8C0B0'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

// ═════════════════════════ SHOTS ═════════════════════════
export function buildB(add, cue) {
  const t4 = L(4), t5 = L(5), t6 = L(6), t7 = L(7);
  const tOct = Wd('October', 4), tBro = Wd('brothers', 4), tHang = Wd('hanged', 4), tTir = Wd('Tiruppattur', 4);
  const tAcc = Wd('Accounts', 4), tSons = Wd('sons', 4), tDied = Wd('died', 4);
  const tNot = Wd('not', 5), tKill = Wd('killed', 5);
  const tSev = Wd('seventy', 6), tPris = Wd('prisoners', 6), tSome = Wd('some', 6), tTwo = Wd('two', 6), tShip = Wd('ship', 6), tPen = Wd('Penang', 6), tMal = Wd('Malaya', 6);
  const b7at = tTwo - 0.3, b8at = tPen + 0.2;

  // ── b1: ledger + wash bloom + wax seal slam → 24 OCT 1801 ──
  const slam1 = tOct + 0.15;
  add({ id: 'b1', at: t4, cam: [540, 700], zoom: 0.08, note: 'ledger page, indigo bloom, red wax + brass seal slam; 24 OCT 1801', draw(lt, d, t) {
    table(lt, -lt * 10);
    const sx = 540 + lt * 8;
    pageAt(ledgerC(3), sx, PG.y, 1);
    // indigo wash blooms out from the seal point (night of the date)
    const sl = slam1 - t4, cx = sx, cy = 620;
    bloom(cx, cy, 80 + eo(clamp(lt / 1.6)) * 380, 2, lt, Q.mid, 0.55);
    bloom(cx + 40, cy + 30, eo(clamp((lt - 0.2) / 1.6)) * 230, 5, lt, Q.deep, 0.35);
    // wax: drips down before the slam, splats on the slam
    if (lt < sl) {
      const p = clamp(lt / sl), y = lerp(150, cy, eio(p));
      ctx.beginPath(); ctx.ellipse(cx, y, 30, 38, 0, 0, TAU); ctx.fillStyle = Q.red; ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 9, y - 12, 8, 0, TAU); ctx.fillStyle = rgba(Q.redHi, 0.8); ctx.fill();
      // brass seal hovers above, descending
      blit(sealC(), 130, 130, cx, cy - 40 * (1 - p), lerp(1.7, 1.15, eio(p)), 0.25 + 0.75 * p);
    } else {
      const k = lt - sl, sc = lerp(0.4, 1.15, eob(clamp(k / 0.16)));
      blit(waxC(), 150, 150, cx, cy, sc);
      // ring wave
      if (k < 0.6) { ctx.beginPath(); ctx.arc(cx, cy, 140 + k * 500, 0, TAU); ctx.strokeStyle = rgba(Q.deep, 0.6 * (1 - k / 0.6)); ctx.lineWidth = 6; ctx.stroke(); }
      // seal lifts off and away
      const up = eo(clamp((k - 0.12) / 0.5));
      if (up < 1) blit(sealC(), 130, 130, cx + up * 60, cy - up * 260, 1.15 + up * 0.3, 1 - up);
      tag('24 OCT 1801', cx, cy + 230, 74, 'ink', clamp((k - 0.15) / 0.2), pop(k, 0.15, 0.3));
    }
  } });
  cue(t4, 'whoosh', { gain: 0.5, dur: 0.6 }); cue(slam1, 'slam', { gain: 0.9 }); cue(slam1 + 0.02, 'thud', { gain: 0.6 });

  // ── b2: fort at dusk, rope knot tightens, crows lift ──
  add({ id: 'b2', at: tBro, cam: [560, 640], zoom: 0.1, note: 'Tiruppattur fort in indigo wash at dusk; rope knot tightens (empty); crows lift; TIRUPPATTUR FORT', draw(lt, d, t) {
    table(lt, lt * 12);
    const ox = 540 - lt * 14, oy = PG.y;
    // wash bloom reveal of the scene
    const rv = eo(clamp(lt / 0.55));
    ctx.save(); blobPath(ox, oy - 40, 120 + rv * 900, 9, lt, 1.1); ctx.clip(); pageAt(fortC(), ox, oy, 1); ctx.restore();
    pageAt(ledgerC(3), ox, oy, 1, 1 - rv);
    if (rv < 1) { ctx.save(); ctx.beginPath(); ctx.rect(-500, oy - PH / 2, 2080, PH); ctx.clip(); blobPath(ox, oy - 40, 120 + rv * 900, 9, lt, 1.1); ctx.strokeStyle = rgba(Q.deep, 0.6); ctx.lineWidth = 10; ctx.stroke(); ctx.restore(); }
    const L0 = ox - PW / 2, T0 = oy - PH / 2;   // page origin
    // rope from the beam: knot tightens at "hanged"
    const hk = clamp((t - tHang) / 0.35), sway = sin(lt * 2.2) * 0.03 * (1 - hk * 0.7);
    ctx.save(); ctx.translate(L0 + 600, T0 + 322); ctx.rotate(sway + (hk > 0 && hk < 1 ? sin(hk * 20) * 0.02 : 0));
    const ropeLen = 200 + eo(hk) * 26;
    ctx.fillStyle = '#2A1E14'; ctx.fillRect(-5, 0, 10, ropeLen);
    // knot coils (compress as it tightens)
    const coil = lerp(16, 11, eo(hk));
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(0, ropeLen + k * coil, 11, 6, 0, 0, TAU); ctx.fillStyle = k % 2 ? '#2A1E14' : '#3A2A1C'; ctx.fill(); }
    // the empty loop narrows
    const lr = lerp(54, 30, eo(hk)), ly = ropeLen + 6 * coil + lr * 1.15;
    ctx.beginPath(); ctx.ellipse(0, ly, lr * 0.82, lr * 1.15, 0, 0, TAU); ctx.strokeStyle = '#2A1E14'; ctx.lineWidth = 9; ctx.stroke();
    ctx.restore();
    // crows on the wall top, lifting off just after "hanged"
    for (let i = 0; i < 7; i++) {
      const bx = L0 + 330 + i * 70 + rnd(i) * 30, by = T0 + 686 - (i % 2) * 4, lift = t - (tHang + 0.08 + rnd(i + 3) * 0.3);
      if (lift <= 0) crow(bx, by, 0.9, 0.6 + sin(lt * 3 + i) * 0.08);
      else { const k = lift; crow(bx + k * (120 + rnd(i) * 160) * (i % 3 ? 1 : -1), by - k * (300 + rnd(i + 7) * 200) - k * k * 60, 0.9 + k * 0.2, k * 22 + i, 1); }
    }
    tag('TIRUPPATTUR FORT', ox, T0 + 1000, 60, 'band', clamp((t - tTir) / 0.2), pop(t - tTir, 0, 0.3));
  } });
  cue(tBro, 'whoosh', { gain: 0.4, dur: 0.6, pan: 0.2 }); cue(tHang, 'zip', { gain: 0.5, dur: 0.35 }); cue(tHang + 0.05, 'thud', { gain: 0.55 });
  cue(tHang + 0.15, 'whoosh', { gain: 0.3, dur: 0.8, pan: -0.3 }); cue(tTir, 'pop', { gain: 0.35 });

  // ── b3 + b4: ACCOUNTS SAY — rows struck through in red ──
  const STRUCK = [1, 2, 4, 5, 7, 8, 9, 11, 12];
  const strikeT = (j) => tAcc + 0.25 + j * 0.34;
  const strikes = (t, ox, oy, s) => {
    ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s);
    STRUCK.forEach((r, j) => strike(-PW * 0.34, rowY(r) - 8, PW * 0.42, clamp((t - strikeT(j)) / 0.26), r * 13, 6));
    ctx.restore();
  };
  add({ id: 'b3', at: tAcc, cam: [540, 520], zoom: 0.12, note: 'ACCOUNTS SAY; close ledger rows struck through in red one by one', draw(lt, d, t) {
    table(lt);
    const s = 1.3, ox = 600 - lt * 40, oy = 900 - lt * 40;
    ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, W + 400, 1290); ctx.clip();   // keep rows above the caption band
    pageAt(ledgerC(7), ox, oy, s); strikes(t, ox, oy, s); ctx.restore();
    tag('ACCOUNTS SAY', 360, 230, 64, 'band', clamp(lt / 0.15), pop(lt, 0, 0.3), -0.04);
  } });
  STRUCK.forEach((r, j) => { const tt = strikeT(j); if (tt < t5) cue(tt, 'zip', { gain: 0.22, dur: 0.25, pan: 0.3 }); });
  cue(tAcc, 'slide', { gain: 0.4 });

  add({ id: 'b4', at: tDied, cam: [540, 720], zoom: 0.07, note: 'wider: struck ledger page, crows cross, night wash creeps in; ACCOUNTS SAY stays', draw(lt, d, t) {
    table(lt, -lt * 8);
    const s = 0.92, ox = 540 + lt * 10, oy = PG.y - 10;
    pageAt(ledgerC(7), ox, oy, s); strikes(t, ox, oy, s);
    ctx.save(); ctx.beginPath(); ctx.rect(ox - PW * s / 2, oy - PH * s / 2, PW * s, PH * s); ctx.clip(); bloom(ox + PW * 0.4, oy - PH * 0.36, 60 + eo(clamp(lt / d)) * 320, 7, lt, Q.deep, 0.6, 0.8); ctx.restore();
    for (let i = 0; i < 5; i++) { const k = lt + rnd(i) * 0.4; crow(-80 + k * (620 + i * 60), 300 + i * 90 - k * 60, 1.1 - i * 0.1, k * 20 + i); }
    tag('ACCOUNTS SAY', 360, 230, 64, 'band', 1, 1, -0.04);
  } });
  cue(tDied, 'whoosh', { gain: 0.35, dur: 0.7, pan: -0.4 });

  // ── b5: NOT EVERYONE — page flip, figures wash away, a few remain ──
  const KEEP = new Set([2, 5, 6, 9]);
  add({ id: 'b5', at: t5, cam: [540, 760], zoom: 0.1, note: 'hard turn: page flips; row of faceless figures, most wash away, 4 stay standing; NOT EVERYONE', draw(lt, d, t) {
    table(lt, lt * 10);
    const ox = 540, oy = PG.y;
    pageAt(ledgerC(11, 0), ox, oy, 1);
    // wash glow behind the survivors
    bloom(ox, oy + 200, eo(clamp((t - tNot) / 1)) * 380, 13, lt, Q.pale, 0.5, 0.55);
    for (let i = 0; i < 11; i++) {
      const fx = ox - 400 + i * 80, keep = KEEP.has(i), fade = keep ? 0 : clamp((t - (tNot + 0.1 + ((i * 7) % 11) * 0.06)) / 0.35);
      const step = keep ? eo(clamp((t - tKill) / 0.4)) * 30 : 0;
      fig(fx, oy + 330 + step, 1, 1 - fade, 0);
      if (fade > 0) fig(fx, oy + 330, 1, fade, 1);
    }
    tag('NOT EVERYONE', ox, oy - 260, 82, 'ink', clamp((t - tNot) / 0.15), pop(t - tNot, 0, 0.32));
    // page flip: the struck ledger turns away over the left edge
    const fp = clamp(lt / 0.42);
    if (fp < 1) {
      const sx = cos(PI * eio(fp)), x0 = ox - PW / 2;
      ctx.save(); ctx.translate(x0, oy); ctx.scale(sx, 1);
      if (sx > 0) { pageAt(ledgerC(7), PW / 2, 0, 1); strikes(Infinity, PW / 2, 0, 1); ctx.fillStyle = `rgba(20,12,6,${(1 - sx) * 0.5})`; ctx.fillRect(0, -PH / 2, PW, PH); }
      else { ctx.fillStyle = '#D8CBA8'; ctx.fillRect(0, -PH / 2, PW, PH); ctx.fillStyle = `rgba(20,12,6,${(1 + sx) * 0.4})`; ctx.fillRect(0, -PH / 2, PW, PH); }
      ctx.restore();
    }
  } });
  cue(t5, 'slide', { gain: 0.6 }); cue(t5 + 0.05, 'whoosh', { gain: 0.4, dur: 0.4 }); cue(tNot, 'pop', { gain: 0.4 }); cue(tKill, 'swell', { gain: 0.3, dur: 1.4 });

  // ── b6: tally to ABOUT 73, SOME SAY 72 ──
  const tally0 = t6 + 0.15, tallyEnd = Math.min(tPris + 0.25, tSome - 0.15), N = 73;
  const strokePos = (k) => { const g = Math.floor(k / 5), j = k % 5, row = Math.floor(g / 5), col = g % 5, gx = 205 + col * 150, gy = 470 + row * 170;
    return j < 4 ? { x0: gx + j * 22, y0: gy - 48, x1: gx + j * 22 + 3, y1: gy + 48 } : { x0: gx - 14, y0: gy + 30, x1: gx + 80, y1: gy - 30 }; };
  add({ id: 'b6', at: t6, cam: [540, 640], zoom: 0.1, note: 'nib inks tally groups to ABOUT 73; last stroke flickers; SOME SAY 72 red tag', draw(lt, d, t) {
    table(lt, -lt * 10);
    const ox = 540 + lt * 6, oy = PG.y, L0 = ox - PW / 2, T0 = oy - PH / 2;
    pageAt(ledgerC(19, 0), ox, oy, 1);
    bloom(ox, oy - 80, 120 + eo(clamp(lt / 1.4)) * 360, 17, lt, Q.pale, 0.45, 0.8);
    const p = clamp((t - tally0) / (tallyEnd - tally0)), n = p * N, done = Math.floor(n);
    ctx.save(); ctx.translate(L0, T0); ctx.lineCap = 'round';
    const flick = t > tSome ? 0.35 + 0.65 * (0.5 + 0.5 * sin((t - tSome) * 26)) : 1;
    for (let k = 0; k < Math.min(N, Math.ceil(n)); k++) {
      const s = strokePos(k), f = k < done ? 1 : n - done;
      ctx.beginPath(); ctx.moveTo(s.x0, s.y0); ctx.lineTo(lerp(s.x0, s.x1, f), lerp(s.y0, s.y1, f));
      ctx.strokeStyle = rgba(Q.ink, k === N - 1 ? 0.9 * flick : 0.9); ctx.lineWidth = k % 5 === 4 ? 6 : 7; ctx.stroke();
      if (f < 1) nib(lerp(s.x0, s.x1, f), lerp(s.y0, s.y1, f));
    }
    if (t > tSome) { const s = strokePos(N - 1), k = eo(clamp((t - tSome) / 0.3)); ctx.beginPath(); ctx.ellipse(s.x0 + 2, s.y0 + 48, 30 * k + 8, 70 * k + 10, 0.1, 0, TAU * k); ctx.strokeStyle = rgba(Q.red, 0.85); ctx.lineWidth = 5; ctx.stroke(); }
    ctx.restore();
    const cnt = Math.min(N, Math.round(n));
    if (t < tallyEnd) tag(String(cnt), ox, T0 + 170, 110, 'ink', clamp(lt / 0.1), 1);
    else tag('ABOUT 73', ox, T0 + 170, 100, 'ink', 1, pop(t - tallyEnd, 0, 0.3));
    tag('SOME SAY 72', ox + 180, T0 + 1000, 64, 'red', clamp((t - tSome) / 0.1), lerp(1.6, 1, eo(clamp((t - tSome) / 0.16))), -0.07);
  } });
  cue(tally0, 'chisel', { gain: 0.3, dur: tallyEnd - tally0 }); cue(tallyEnd, 'pop', { gain: 0.5 }); cue(tSome, 'slam', { gain: 0.6 });

  // ── b7: rope wipe, exiles file up the gangplank onto the East Indiaman ──
  add({ id: 'b7', at: b7at, cam: [620, 700], zoom: 0.1, note: 'rope wipe; faceless exiles file up a gangplank onto a pitching East Indiaman; SOME SAY 72 lingers', draw(lt, d, t) {
    table(lt, lt * 10);
    const ox = 540 - lt * 18, oy = PG.y, L0 = ox - PW / 2, T0 = oy - PH / 2;
    pageAt(dockC(), ox, oy, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(L0, T0, PW, PH); ctx.clip();
    const pitch = sin(lt * 2.4) * 0.025, bob = sin(lt * 2.4 + 1) * 6;
    const shx = L0 + 600, shy = T0 + 820 + bob;
    // gangplank from the quay to the ship's waist
    const gp0 = [L0 + 230, T0 + 790], gp1 = [shx - 150, shy - 116 + pitch * -150];
    // figures walking (queue on the quay, then up the plank, vanishing onto the deck)
    for (let i = 0; i < 9; i++) {
      const u = lt * 0.42 + i * 0.13 - 0.25;
      let x, y, a = 1;
      if (u < 0.35) { x = lerp(L0 - 20, gp0[0], clamp(u / 0.35)); y = gp0[1]; a = clamp((x - L0 + 20) / 60); }
      else { const v = clamp((u - 0.35) / 0.65); x = lerp(gp0[0], gp1[0], v); y = lerp(gp0[1], gp1[1], v); if (v > 0.85) a = 1 - (v - 0.85) / 0.15; }
      fig(x, y + sin(u * 40) * 2, 0.62, a, 0);
    }
    ctx.strokeStyle = Q.ink; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(gp0[0], gp0[1]); ctx.lineTo(gp1[0], gp1[1]); ctx.stroke();
    ctx.strokeStyle = '#8C6A3E'; ctx.lineWidth = 5; ctx.stroke();
    shipAt(shx, shy, 0.9, pitch);
    // hatched waves rolling
    ctx.strokeStyle = rgba(Q.deep, 0.7); ctx.lineWidth = 3;
    for (let r = 0; r < 4; r++) { ctx.beginPath(); const yy = T0 + 850 + r * 50; for (let x = L0 + 250; x < L0 + PW; x += 14) { const yv = yy + sin(x * 0.03 - lt * 3 + r) * 6; x === L0 + 250 ? ctx.moveTo(x, yv) : ctx.lineTo(x, yv); } ctx.stroke(); }
    ctx.restore();
    // rope wipe: taut hemp rope sweeps across
    const rw = clamp(lt / 0.38);
    if (rw < 1) { const rx = lerp(-200, 1300, eio(rw)); ctx.save(); ctx.beginPath(); ctx.rect(rx, -300, 1600, H + 600); ctx.clip(); table(lt); pageAt(ledgerC(19, 0), 546, PG.y, 1);
      ctx.save(); ctx.translate(546 - PW / 2, PG.y - PH / 2); ctx.lineCap = 'round'; ctx.strokeStyle = rgba(Q.ink, 0.9);
      for (let k = 0; k < N; k++) { const q = strokePos(k); ctx.lineWidth = k % 5 === 4 ? 6 : 7; ctx.beginPath(); ctx.moveTo(q.x0, q.y0); ctx.lineTo(q.x1, q.y1); ctx.stroke(); }
      ctx.restore(); tag('ABOUT 73', 546, PG.y - PH / 2 + 170, 100, 'ink'); ctx.restore(); rope(-300, 720 - (1 - rw) * 30, rx + 30, 700, 22); }
    tag('SOME SAY 72', ox + 200, T0 + 1000, 56, 'red', 1 - clamp((t - (tTwo + 0.6)) / 0.3), 1, -0.07);
  } });
  cue(b7at, 'zip', { gain: 0.5, dur: 0.4 }); cue(b7at + 0.1, 'whoosh', { gain: 0.35, dur: 0.5 }); cue(tShip, 'rumble', { gain: 0.25, dur: 1.2 });
  for (let i = 0; i < 3; i++) cue(tShip - 0.4 + i * 0.3, 'tock', { gain: 0.18, pan: -0.3 + i * 0.2 });

  // ── b8: sea chart, dotted route to PENANG off MALAYA ──
  add({ id: 'b8', at: b8at, cam: [620, 640], zoom: 0.12, note: 'sea chart of the Bay of Bengal: dotted route from the Tamil coast to PENANG near MALAYA, ship crossing', draw(lt, d, t) {
    table(lt, -lt * 10);
    const ox = 540 - lt * 10, oy = PG.y, L0 = ox - PW / 2, T0 = oy - PH / 2;
    pageAt(chartC(), ox, oy, 1);
    ctx.save(); ctx.translate(L0, T0);
    // rolling wash waves (little arcs drifting east)
    ctx.strokeStyle = rgba(Q.deep, 0.45); ctx.lineWidth = 2.5;
    for (let i = 0; i < 14; i++) { const x = 300 + ((rnd(i) * 480 + lt * 30) % 480), y = 380 + rnd(i + 5) * 560; ctx.beginPath(); ctx.arc(x, y, 14, PI * 1.15, PI * 1.85); ctx.arc(x + 24, y, 14, PI * 1.15, PI * 1.85); ctx.stroke(); }
    const p = eio(clamp((lt - 0.1) / (t7 - b8at - 0.35)));
    // dotted route drawn up to the ship
    const head = routePt(p);
    ctx.setLineDash([4, 16]); ctx.lineCap = 'round'; ctx.strokeStyle = Q.red; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(ROUTE[0][0], ROUTE[0][1]);
    for (let i = 1; i <= head.i; i++) ctx.lineTo(ROUTE[i][0], ROUTE[i][1]); ctx.lineTo(head.x, head.y); ctx.stroke(); ctx.setLineDash([]);
    // Penang ring pulses on arrival
    const arr = clamp((p - 0.97) / 0.03);
    ctx.beginPath(); ctx.arc(792, 598, 26 + sin(lt * 6) * 4, 0, TAU); ctx.strokeStyle = rgba(Q.red, 0.4 + 0.5 * arr); ctx.lineWidth = 4; ctx.stroke();
    shipAt(head.x, head.y - 8 + sin(lt * 5) * 3, 0.16, sin(lt * 4) * 0.06);
    ctx.restore();
    tag('PENANG', L0 + 700, T0 + 520, 54, 'band', clamp(lt / 0.12), pop(lt, 0, 0.3));
    tag('MALAYA', L0 + 820, T0 + 900, 50, 'ink', clamp((t - tMal) / 0.15), pop(t - tMal, 0, 0.3));
  } });
  cue(b8at, 'whoosh', { gain: 0.45, dur: 0.6 }); cue(b8at + 0.02, 'pop', { gain: 0.35 }); cue(tMal, 'pop', { gain: 0.4 }); cue(t7 - 0.35, 'bell', { gain: 0.3, dur: 1.2 });
}
