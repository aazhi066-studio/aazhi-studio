// EPISODE 12 · worker B : "Tanjore Gilt Panel", lines 5-9 (treaty, king without a kingdom, Saraswathi Mahal, 1805 press, Dhanvantari Mahal)
//   b1  cabinet doors open on a treaty scroll unrolling, abstract dash rows, gesso beads pop round it; TREATY 1799
//   b2  push-in: a generic red seal stamps the treaty, red flag behind; the gilt frame tarnishes and cracks
//   b3  fort walls with bastions: gold leaves flutter down and gild the walls, gems pop onto the bastions
//   b4  a Maratha turban drops on a cushion (title): crest gems pop; gold coins drop into a modest stack (pension); sheen
//   b5  the king (faceless) stands before a painted kingdom; lacquer cabinet doors swing shut behind him
//   b6  the king in profile walks to a reading desk; gold leaves gild the books; more books bounce on (expanded)
//   b7  nested arch zooms open into the Saraswathi Mahal hall: three shelved arches, beads pop, sheen
//   b8  shelf close-up: palm-leaf bundles slide in, bound books drop in with a bounce
//   b9  a fan of leaves opens, each with a different abstract mark style; gems pop per leaf (many languages)
//   b10 doors open on "1805" in white gesso; gold leaves land and gild it; beaded ring; sheen
//   b11 wooden hand press: lever pulls, screw turns, platen stamps; a printed sheet rises
//   b12 type tray of abstract raised blocks above a sheet whose hanging-bar mark rows print in; OFTEN CALLED FIRST
//   b13 South India peninsula, coast beaded dot by dot, ruby gem + rings at Thanjavur, printed sheet beside; plaque stays
//   b14 doors open on the Dhanvantari Mahal: herb-jar shelves, lids pop gems, pestle grinds, herbs drop in
//   b15 library again, two faceless doctors walk in and one points up at the shelves
//   b16 a tied bundle of papers on a shelf starts to glow: rays, leaves swirl, the rest of the shelf dims
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached } from './art.js';

const G = {
  red: '#8E1B1B', red2: '#B3261E', grn: '#1E5B3A', grn2: '#2F7D4F', blu: '#1F3C8C', blu2: '#3557B5',
  gold: '#C99A2E', gold2: '#E9C25A', hi: '#FFF0B0', gsh: '#7A5714', ivory: '#F1E4C8', ink: '#2B1408',
  ruby: '#D1203A', em: '#19A35A', sap: '#2457D6', wood: '#7A4420', wood2: '#9A5A2C', wd: '#4E2810', ochre: '#D9B26A',
};
const GEMS = [G.ruby, G.em, G.sap];
const PX = 36, PY = 110, PW = 1008, PH = 1210;          // gilt panel
const OX = 124, OY = 200, OW = 832, OH = 1040, ARY = 230; // arch opening (bottom 1240)
const M = new Map();
const memo = (k, f) => (M.has(k) ? M.get(k) : (M.set(k, f()), M.get(k)));

// ───────────── geometry ─────────────
function quadPts(p0, c, p1, n, out) { for (let k = 1; k <= n; k++) { const u = k / n, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; out.push([a * p0[0] + b * c[0] + d * p1[0], a * p0[1] + b * c[1] + d * p1[1]]); } }
/** cusped (multifoil) arch outline: bottom-left, up, scalloped top, down to bottom-right */
function archPts(x, y, w, h, ry, lobes = 7) {
  const cx = x + w / 2, sy = y + ry, rx = w / 2, P = [[x, y + h], [x, sy]];
  for (let i = 0; i < lobes; i++) {
    const a0 = Math.PI * (1 + i / lobes), a1 = Math.PI * (1 + (i + 1) / lobes), am = (a0 + a1) / 2, k = 1 + 1.5 / lobes;
    quadPts([cx + Math.cos(a0) * rx, sy + Math.sin(a0) * ry], [cx + Math.cos(am) * rx * k, sy + Math.sin(am) * ry * k], [cx + Math.cos(a1) * rx, sy + Math.sin(a1) * ry], 8, P);
  }
  P.push([x + w, y + h]); return P;
}
const OPEN = () => memo('open', () => archPts(OX, OY, OW, OH, ARY, 7));
function trace(P) { ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.closePath(); }
/** evenly spaced points along a polyline, offset sideways (positive = left of travel on screen) */
function along(P, sp, off = 0) {
  const S = []; let tot = 0;
  for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > 0) { S.push([a, b, l, tot]); tot += l; } }
  const out = []; let j = 0;
  for (let d = sp / 2; d < tot; d += sp) {
    while (j < S.length - 1 && S[j][3] + S[j][2] < d) j++;
    const [a, b, l, s0] = S[j], u = (d - s0) / l, dx = (b[0] - a[0]) / l, dy = (b[1] - a[1]) / l;
    out.push([a[0] + (b[0] - a[0]) * u + dy * off, a[1] + (b[1] - a[1]) * u - dx * off]);
  }
  return out;
}
const rectPts = (x, y, w, h) => [[x, y + h], [x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const ellPts = (cx, cy, rx, ry, n = 120) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(Math.PI + i / n * TAU) * rx, cy + Math.sin(Math.PI + i / n * TAU) * ry]);

// ───────────── gilt devices ─────────────
function bead(x, y, r, s = 1) {
  if (s <= 0.01) return; r *= s;
  ctx.fillStyle = G.gsh; ctx.beginPath(); ctx.arc(x + r * 0.25, y + r * 0.3, r, 0, TAU); ctx.fill();
  ctx.fillStyle = G.gold2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.fillStyle = G.hi; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.38, 0, TAU); ctx.fill();
}
/** GESSO BEADING: dots pop in along the path; p = 0..1 of the path done */
function beads(pts, p = 1, r = 5, pop = 5) {
  const n = pts.length * clamp(p) * (1 + pop / pts.length), m = Math.min(pts.length, Math.ceil(n));
  for (let i = 0; i < m; i++) bead(pts[i][0], pts[i][1], r, eob(clamp((n - i) / pop)));
}
function star(x, y, s, a = 1) {
  if (s <= 0 || a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = G.hi; ctx.beginPath();
  for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4, q = k % 2 ? s * 0.2 : s; ctx.lineTo(x + Math.cos(an) * q, y + Math.sin(an) * q); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function gem(x, y, r, col, s = 1, spark = 0) {
  if (s <= 0.01) return; const R = r * s;
  circle(x + 2, y + 3, R + 5, 'rgba(43,20,8,0.5)'); circle(x, y, R + 5, G.gsh); circle(x - 1, y - 1, R + 3, G.gold2); circle(x, y, R, col);
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y + R * 0.25, R * 0.82, R * 0.62, 0, 0, Math.PI); ctx.fill();
  circle(x - R * 0.36, y - R * 0.38, R * 0.24, '#FFFFFF');
  if (spark > 0) star(x + R * 0.6, y - R * 0.7, R * 1.7 * spark, spark);
}
/** GEM INLAY POP: drops into its socket with a bounce + sparkle */
function gemPop(x, y, r, col, t, t0) {
  if (t0 == null) { gem(x, y, r, col); return; }
  const u = (t - t0) / 0.32; if (u < 0) { circle(x, y, r + 5, G.gsh); circle(x, y, r, 'rgba(43,20,8,0.75)'); return; }
  gem(x, y - (u < 1 ? (1 - eo(u)) * 70 : 0), r, col, u < 1 ? 0.6 + 0.4 * eob(u) : 1, clamp(1 - Math.abs(u - 1.2) / 0.9));
}
function leafShape(x, y, rot, fl, sz) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(fl, 1);
  ctx.fillStyle = fl > 0 ? G.gold2 : G.gold; ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
  ctx.fillStyle = G.hi; ctx.fillRect(-sz / 2, -sz / 2, sz, 3); ctx.fillStyle = G.gsh; ctx.fillRect(-sz / 2, sz / 2 - 3, sz, 3);
  ctx.restore();
}
/** GOLD-LEAF LAYING: leaves fall onto targets; gold() is revealed in growing patches where they land */
function gilding(t, tg, t0, gap, gold, R = 80, fall = 0.6, sz = 30) {
  let any = false; ctx.save(); ctx.beginPath();
  for (let i = 0; i < tg.length; i++) {
    const tl = t0 + i * gap + fall; if (t < tl) continue; any = true;
    const r = R * eo(clamp((t - tl) / 0.35)); ctx.moveTo(tg[i][0] + r, tg[i][1]); ctx.arc(tg[i][0], tg[i][1], r, 0, TAU);
  }
  if (any) { ctx.clip(); gold(); }
  ctx.restore();
  for (let i = 0; i < tg.length; i++) {
    const ts = t0 + i * gap, u = (t - ts) / fall; if (u < 0 || u > 1.25) continue;
    const [x, y] = tg[i];
    if (u < 1) leafShape(x + Math.sin(u * 6 + i) * 70 * (1 - u), y - (1 - eio(u)) * 480, u * 4 + i, Math.cos(u * 9 + i * 1.7), sz);
    else leafShape(x, y, i, 1 - (u - 1) * 4, sz * (1 + (u - 1)));
  }
}
let SC = null;
/** GILT SHEEN SWEEP over a W×H cached gold layer; pos = x + y of the band centre */
function sheen(img, pos, a = 0.6, w = 140) {
  if (!SC) { SC = document.createElement('canvas'); SC.width = W; SC.height = H; }
  const s = SC.getContext('2d'); s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, W, H); s.drawImage(img, 0, 0, W, H);
  s.globalCompositeOperation = 'source-in';
  const g = s.createLinearGradient((pos - w) / 2, (pos - w) / 2, (pos + w) / 2, (pos + w) / 2);
  g.addColorStop(0, 'rgba(255,240,176,0)'); g.addColorStop(0.5, `rgba(255,248,215,${a})`); g.addColorStop(1, 'rgba(255,240,176,0)');
  s.fillStyle = g; s.fillRect(0, 0, W, H); ctx.drawImage(SC, 0, 0);
}
function plaque(text, x, y, p, size = 40) {
  if (p <= 0) return; const s = eob(clamp(p));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = '3px';
  const tw = ctx.measureText(text).width, w = tw + size * 1.7, h = size * 1.8;
  rr(-w / 2 + 4, -h / 2 + 6, w, h, h / 2); ctx.fillStyle = 'rgba(20,8,2,0.5)'; ctx.fill();
  rr(-w / 2 + 2, -h / 2 + 2, w, h, h / 2); ctx.fillStyle = G.gsh; ctx.fill();
  rr(-w / 2 - 2, -h / 2 - 2, w, h, h / 2); ctx.fillStyle = G.hi; ctx.fill();
  rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = G.gold; ctx.fill(); ctx.strokeStyle = G.ink; ctx.lineWidth = 2.5; ctx.stroke();
  const bx = w / 2 - h / 2;
  for (let xx = -bx; xx <= bx; xx += 15) { bead(xx, -h / 2 + 8, 3); bead(xx, h / 2 - 8, 3); }
  for (let k = 1; k < 8; k++) { const a = -Math.PI / 2 + k / 8 * Math.PI; bead(bx + Math.cos(a) * (h / 2 - 8), Math.sin(a) * (h / 2 - 8), 3); bead(-bx - Math.cos(a) * (h / 2 - 8), Math.sin(a) * (h / 2 - 8), 3); }
  ctx.fillStyle = G.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3);
  ctx.letterSpacing = '0px'; ctx.restore();
}

// ───────────── the panel: back, frame (cached once), gems, varnish, doors, tarnish ─────────────
const backImg = () => cached('bBack', W, H, 0.5, () => {
  ctx.fillStyle = '#1C0C06'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(${rnd(i) > 0.5 ? '60,30,14' : '10,4,2'},0.35)`; ctx.fillRect(rnd(i * 3) * W, 0, 2 + rnd(i * 5) * 8, H); }
  const g = ctx.createRadialGradient(540, 720, 200, 540, 720, 1100); g.addColorStop(0, 'rgba(120,60,20,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
});
const frameShape = () => { ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 26); trace(OPEN()); };
const frameBeads = () => memo('fb', () => along(OPEN(), 17, 46).filter(([x, y]) => y < OY + OH + 20));
const frameImg = () => cached('bFrame', W, H, 1, () => {
  ctx.save(); ctx.translate(6, 8); frameShape(); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill('evenodd'); ctx.restore();
  ctx.save(); ctx.translate(3, 3); frameShape(); ctx.fillStyle = G.gsh; ctx.fill('evenodd'); ctx.restore();
  ctx.save(); ctx.translate(-3, -3); frameShape(); ctx.fillStyle = G.hi; ctx.fill('evenodd'); ctx.restore();
  frameShape(); ctx.fillStyle = G.gold; ctx.fill('evenodd');
  ctx.save(); frameShape(); ctx.clip('evenodd');
  ctx.lineJoin = 'round';
  for (const [w, c] of [[70, G.gsh], [62, G.gold2], [48, G.gold], [34, G.gsh], [28, G.gold2], [14, G.gold], [6, G.gsh]]) { ctx.beginPath(); trace(OPEN()); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); }
  // outer moulding
  for (const [ins, c, w] of [[12, G.gsh, 5], [9, G.hi, 2], [22, G.gsh, 3]]) { ctx.beginPath(); ctx.roundRect(PX + ins, PY + ins, PW - ins * 2, PH - ins * 2, 22); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
  // spandrel rosettes (raised rings of beads)
  for (const [cx, cy] of [[150, 225], [930, 225]]) { for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; bead(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52, 5); } for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; ctx.fillStyle = G.gold2; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30, 14, 7, a, 0, TAU); ctx.fill(); ctx.strokeStyle = G.gsh; ctx.lineWidth = 2; ctx.stroke(); } }
  // vine scroll beads on the spandrels toward the apex
  for (const sgn of [-1, 1]) for (let k = 0; k < 14; k++) { const u = k / 13; bead(540 + sgn * (110 + u * 230), 150 + Math.sin(u * 7) * 12, 4); }
  // bottom plinth bead rows
  for (let x = 70; x <= 1010; x += 16) { bead(x, 1252, 4); bead(x, 1306, 4); }
  ctx.restore();
  beads(frameBeads(), 1, 5);
  const g = ctx.createRadialGradient(540, 760, 380, 540, 760, 900); g.addColorStop(0, 'rgba(107,74,26,0)'); g.addColorStop(1, 'rgba(107,74,26,0.45)');
  ctx.save(); frameShape(); ctx.clip('evenodd'); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
});
const frameTImg = () => cached('bFrameT', W, H, 1, () => {
  ctx.drawImage(frameImg(), 0, 0); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(62,40,18,0.72)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
});
const FGEMS = (() => { const g = [[540, 152, 22, 2], [80, OY + ARY, 15, 0], [1000, OY + ARY, 15, 0], [80, 760, 13, 1], [1000, 760, 13, 1], [80, 1080, 13, 2], [1000, 1080, 13, 2], [150, 225, 16, 1], [930, 225, 16, 1]];
  for (let k = 0; k < 7; k++) g.push([212 + k * 109, 1280, 13, k % 3]); return g; })();
function frameGems(t, t0) { FGEMS.forEach(([x, y, r, c], i) => gemPop(x, y, r, GEMS[c], t, t0 == null ? null : t0 + i * 0.045)); }
const crackSet = () => memo('cracks', () => {
  const C = [];
  for (let i = 0; i < 34; i++) {
    const side = i % 4; let x, y;
    if (side === 0) { x = 60 + rnd(i * 3.1) * 960; y = 125 + rnd(i * 5.7) * 60; } else if (side === 1) { x = 45 + rnd(i * 2.3) * 60; y = 300 + rnd(i * 4.4) * 900; }
    else if (side === 2) { x = 975 + rnd(i * 2.9) * 60; y = 300 + rnd(i * 6.1) * 900; } else { x = 60 + rnd(i * 7.3) * 960; y = 1250 + rnd(i * 1.9) * 60; }
    const P = [[x, y]]; let a = rnd(i * 7) * TAU;
    for (let k = 0; k < 12; k++) { a += (rnd(i * 13 + k) - 0.5) * 1.5; x += Math.cos(a) * 17; y += Math.sin(a) * 17; P.push([x, y]); }
    C.push(P);
  }
  return C;
});
/** VARNISH CRACK: fine dark cracks spread over the gold */
function cracks(p) {
  if (p <= 0) return; ctx.save(); frameShape(); ctx.clip('evenodd'); ctx.strokeStyle = 'rgba(30,14,4,0.9)'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.beginPath();
  for (const P of crackSet()) { const n = p * (P.length - 1), m = Math.floor(n); if (n < 0.05) continue; ctx.moveTo(P[0][0], P[0][1]); for (let k = 1; k <= m; k++) ctx.lineTo(P[k][0], P[k][1]); if (m < P.length - 1) ctx.lineTo(lerp(P[m][0], P[m + 1][0], n - m), lerp(P[m][1], P[m + 1][1], n - m)); }
  ctx.stroke(); ctx.restore();
}
const doorImg = () => cached('bDoor', OW / 2, OH, 1, () => {
  const w = OW / 2, h = OH;
  ctx.fillStyle = G.red; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#741414'; ctx.fillRect(0, 0, 10, h); ctx.fillRect(w - 6, 0, 6, h);
  for (const [y0, hh] of [[60, 470], [570, 420]]) {
    rr(36, y0, w - 72, hh, 10); ctx.fillStyle = G.gold; ctx.fill(); rr(48, y0 + 12, w - 96, hh - 24, 8); ctx.fillStyle = G.red2; ctx.fill(); ctx.strokeStyle = G.gsh; ctx.lineWidth = 3; ctx.stroke();
    beads(along(rectPts(60, y0 + 24, w - 120, hh - 48).concat([[60, y0 + 24]]), 18, 0), 1, 3.5);
    const cx = w / 2, cy = y0 + hh / 2; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; ctx.fillStyle = G.gold2; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34, 20, 9, a, 0, TAU); ctx.fill(); ctx.strokeStyle = G.gsh; ctx.lineWidth = 2; ctx.stroke(); }
    gem(cx, cy, 15, y0 < 100 ? G.em : G.sap);
  }
  ctx.strokeStyle = G.gold2; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(w - 36, h * 0.52, 18, 0, TAU); ctx.stroke(); circle(w - 36, h * 0.52 - 18, 7, G.gold2);
});
/** PANEL CABINET: two lacquer doors on hinges, open = 0 (shut) .. 1 (open) */
function doors(open) {
  if (open >= 1) return; const sx = Math.cos(eio(clamp(open)) * Math.PI / 2), img = doorImg();
  for (const sgn of [1, -1]) {
    ctx.save(); ctx.translate(sgn > 0 ? OX : OX + OW, OY); ctx.scale(sgn * sx, 1); ctx.drawImage(img, 0, 0, OW / 2, OH);
    if (sx < 1) { ctx.fillStyle = `rgba(20,6,2,${(1 - sx) * 0.6})`; ctx.fillRect(0, 0, OW / 2, OH); }
    ctx.restore();
  }
}
/** one panel: back, scene clipped to the arch, gilt frame, gems, optional tarnish / cracks / sheen */
function stage(t, scene, o = {}) {
  ctx.fillStyle = '#1C0C06'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.drawImage(backImg(), 0, 0, W, H);
  ctx.save(); ctx.beginPath(); trace(OPEN()); ctx.clip(); scene(); if (o.doors != null) doors(o.doors); ctx.restore();
  ctx.drawImage(frameImg(), 0, 0);
  if (o.tarnish > 0) { ctx.globalAlpha = clamp(o.tarnish); ctx.drawImage(frameTImg(), 0, 0); ctx.globalAlpha = 1; }
  frameGems(t, o.gemT);
  if (o.tarnish > 0) { ctx.fillStyle = `rgba(40,24,8,${0.55 * clamp(o.tarnish)})`; for (const [x, y, r] of FGEMS) { ctx.beginPath(); ctx.arc(x, y, r + 5, 0, TAU); ctx.fill(); } }
  if (o.cracks > 0) cracks(o.cracks);
  if (o.sheen != null && o.sheen > 0 && o.sheen < 1) sheen(frameImg(), lerp(-200, 2900, o.sheen), 0.65);
}
function fillO(c) { ctx.fillStyle = c; ctx.fillRect(OX - 60, OY - 100, OW + 120, OH + 160); }
/** flat ground with a festoon swag (green leaves + gold dots) under the arch */
const groundImg = (c1, c2, key) => cached('bG' + key, W, H, 0.5, () => {
  ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H); ctx.fillStyle = c2; ctx.fillRect(0, 1130, W, 200);
  ctx.fillStyle = 'rgba(43,20,8,0.4)'; ctx.fillRect(0, 1130, W, 6);
  for (let k = 0; k < 8; k++) { const x0 = OX + k * 104; ctx.beginPath(); ctx.arc(x0 + 52, 330, 52, 0.1, Math.PI - 0.1); ctx.strokeStyle = G.grn2; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = G.grn; ctx.lineWidth = 4; ctx.stroke(); for (let j = 1; j < 6; j++) { const a = j / 6 * Math.PI; circle(x0 + 52 + Math.cos(a) * 52, 330 + Math.sin(a) * 52, 4.5, G.gold2); } circle(x0, 334, 9, G.ruby); circle(x0 - 2, 331, 3, '#FFD0D0'); }
});

// ───────────── figures (faceless, flat fill + thin brown outline) ─────────────
function OL(w = 3) { ctx.strokeStyle = G.ink; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.stroke(); }
function turban(t = 0, gemT = null, tt = 0) { // origin = head centre (head r 40), front of turban = +x
  ctx.beginPath(); ctx.moveTo(-46, 6); ctx.bezierCurveTo(-64, -52, -22, -82, 24, -76); ctx.bezierCurveTo(62, -72, 72, -30, 50, 6); ctx.quadraticCurveTo(2, -10, -46, 6); ctx.closePath(); ctx.fillStyle = G.red2; ctx.fill(); OL();
  ctx.strokeStyle = G.gold2; ctx.lineWidth = 5; for (const k of [0, 1, 2]) { ctx.beginPath(); ctx.moveTo(-50 + k * 4, -8 - k * 20); ctx.quadraticCurveTo(4, -30 - k * 22, 58 - k * 6, -16 - k * 20); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(40, -66, 24, 18, -0.3, 0, TAU); ctx.fillStyle = G.red; ctx.fill(); OL();
  rr(18, -60, 16, 34, 6); ctx.fillStyle = G.gold2; ctx.fill(); OL(2);
  ctx.beginPath(); ctx.moveTo(24, -70); ctx.quadraticCurveTo(10, -110, -16, -118 + Math.sin(tt * 3) * 3); ctx.strokeStyle = G.ink; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = G.ivory; ctx.lineWidth = 6; ctx.stroke();
  gemPop(26, -48, 7, G.em, t, gemT);
}
/** the king: (x, y) feet centre; ~560 px tall at s = 1. o = { dir, step (walk phase), tt } */
function king(x, y, s = 1, o = {}) {
  const dir = o.dir || 1, st = o.step || 0, sw = Math.sin(st) * 16;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.lineCap = 'round';
  for (const [k, a] of [[-1, sw], [1, -sw]]) { ctx.beginPath(); ctx.moveTo(k * 30 - 12, -110); ctx.lineTo(k * 24 - 10 + a, -10); ctx.lineTo(k * 24 + 12 + a, -10); ctx.lineTo(k * 30 + 12, -110); ctx.closePath(); ctx.fillStyle = G.ivory; ctx.fill(); OL();
    ctx.beginPath(); ctx.moveTo(k * 24 - 14 + a, -14); ctx.lineTo(k * 24 + 30 + a, -12); ctx.quadraticCurveTo(k * 24 + 40 + a, -2, k * 24 + 26 + a, 0); ctx.lineTo(k * 24 - 14 + a, 0); ctx.closePath(); ctx.fillStyle = G.red; ctx.fill(); OL(2); }
  // flared jama skirt
  ctx.beginPath(); ctx.moveTo(-50, -270); ctx.lineTo(50, -270); ctx.quadraticCurveTo(110, -170, 134 + sw * 0.4, -92); ctx.quadraticCurveTo(0, -70, -134 + sw * 0.4, -92); ctx.quadraticCurveTo(-110, -170, -50, -270); ctx.closePath(); ctx.fillStyle = G.ivory; ctx.fill(); OL();
  ctx.strokeStyle = 'rgba(43,20,8,0.35)'; ctx.lineWidth = 2.5; for (const k of [-80, -40, 0, 40, 80]) { ctx.beginPath(); ctx.moveTo(k * 0.3, -262); ctx.lineTo(k + sw * 0.3, -84); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-134 + sw * 0.4, -92); ctx.quadraticCurveTo(0, -70, 134 + sw * 0.4, -92); ctx.strokeStyle = G.gold; ctx.lineWidth = 8; ctx.stroke();
  // torso
  ctx.beginPath(); ctx.moveTo(-62, -386); ctx.quadraticCurveTo(0, -400, 62, -386); ctx.lineTo(54, -262); ctx.lineTo(-54, -262); ctx.closePath(); ctx.fillStyle = G.ivory; ctx.fill(); OL();
  ctx.beginPath(); ctx.moveTo(-30, -390); ctx.quadraticCurveTo(10, -330, 46, -300); ctx.strokeStyle = G.gold; ctx.lineWidth = 6; ctx.stroke();
  for (let k = 0; k < 9; k++) { const a = 0.35 + k / 8 * (Math.PI - 0.7); circle(Math.cos(a) * 44, -390 + Math.sin(a) * 50, 4.5, G.gold2); }
  rr(-60, -284, 120, 28, 9); ctx.fillStyle = G.red2; ctx.fill(); OL(2.5); for (let k = -48; k <= 48; k += 16) circle(k, -270, 3.5, G.gold2);
  ctx.beginPath(); ctx.moveTo(-16, -262); ctx.lineTo(-28, -170); ctx.lineTo(-6, -170); ctx.lineTo(4, -262); ctx.closePath(); ctx.fillStyle = G.red2; ctx.fill(); OL(2);
  // arms
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 60, -384); ctx.quadraticCurveTo(k * 92, -330, k * 84 - sw * 0.5 * k, -228); ctx.lineTo(k * 62 - sw * 0.5 * k, -226); ctx.quadraticCurveTo(k * 66, -310, k * 50, -350); ctx.closePath(); ctx.fillStyle = G.ivory; ctx.fill(); OL(); circle(k * 73 - sw * 0.5 * k, -218, 13, G.ivory); ctx.beginPath(); ctx.arc(k * 73 - sw * 0.5 * k, -218, 13, 0, TAU); OL(2.5); }
  // neck + faceless head
  rr(-15, -414, 30, 30, 6); ctx.fillStyle = G.ivory; ctx.fill(); OL(2.5);
  ctx.beginPath(); ctx.arc(0, -446, 40, 0, TAU); ctx.fillStyle = G.ivory; ctx.fill(); OL();
  ctx.save(); ctx.translate(0, -446); turban(o.t || 0, o.gemT, o.tt || 0); ctx.restore();
  ctx.restore();
}
/** a doctor: faceless, long ivory coat, dark trousers, short dark hair cap. o = { dir, step, point (0..1 raises an arm) } */
function doctor(x, y, s = 1, o = {}) {
  const dir = o.dir || 1, sw = Math.sin(o.step || 0) * 18, pt = o.point || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  for (const [k, a] of [[-1, sw], [1, -sw]]) { ctx.beginPath(); ctx.moveTo(k * 26 - 13, -150); ctx.lineTo(k * 22 - 12 + a, -10); ctx.lineTo(k * 22 + 12 + a, -10); ctx.lineTo(k * 26 + 13, -150); ctx.closePath(); ctx.fillStyle = G.blu; ctx.fill(); OL();
    ctx.beginPath(); ctx.ellipse(k * 22 + 8 + a, -6, 22, 9, 0, 0, TAU); ctx.fillStyle = G.ink; ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-58, -380); ctx.quadraticCurveTo(0, -394, 58, -380); ctx.lineTo(74 + sw * 0.2, -140); ctx.lineTo(-74 + sw * 0.2, -140); ctx.closePath(); ctx.fillStyle = G.ivory; ctx.fill(); OL();
  ctx.beginPath(); ctx.moveTo(0, -384); ctx.lineTo(4, -142); ctx.strokeStyle = 'rgba(43,20,8,0.45)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-22, -386); ctx.lineTo(0, -330); ctx.lineTo(22, -386); ctx.strokeStyle = 'rgba(43,20,8,0.6)'; ctx.stroke();
  rr(22, -300, 30, 8, 3); ctx.fillStyle = G.blu2; ctx.fill();
  // back arm
  ctx.beginPath(); ctx.moveTo(-56, -378); ctx.quadraticCurveTo(-84, -300, -74 + sw * 0.4, -220); ctx.lineTo(-54 + sw * 0.4, -222); ctx.quadraticCurveTo(-60, -300, -44, -350); ctx.closePath(); ctx.fillStyle = G.ivory; ctx.fill(); OL(); circle(-64 + sw * 0.4, -210, 12, G.ivory);
  // front arm: rotates up to point
  ctx.save(); ctx.translate(52, -372); ctx.rotate(-pt * 2.2 + sw * 0.004);
  ctx.beginPath(); ctx.moveTo(-10, -6); ctx.quadraticCurveTo(24, 60, 18, 150); ctx.lineTo(-4, 150); ctx.quadraticCurveTo(-2, 80, -14, 30); ctx.closePath(); ctx.fillStyle = G.ivory; ctx.fill(); OL(); circle(7, 162, 12, G.ivory); ctx.restore();
  rr(-14, -408, 28, 28, 6); ctx.fillStyle = G.ivory; ctx.fill(); OL(2.5);
  ctx.beginPath(); ctx.arc(0, -438, 36, 0, TAU); ctx.fillStyle = G.ivory; ctx.fill(); OL();
  ctx.beginPath(); ctx.arc(-4, -444, 38, Math.PI * 0.95, Math.PI * 2.08); ctx.quadraticCurveTo(10, -452, -38, -430); ctx.closePath(); ctx.fillStyle = G.wd; ctx.fill(); OL(2);
  ctx.restore();
}

// ───────────── props ─────────────
function dashRows(x, y, w, rows, gap, seed, col = 'rgba(43,20,8,0.72)') {
  ctx.fillStyle = col;
  for (let r = 0; r < rows; r++) { let xx = x; const end = x + w - (r % 4 === 3 ? w * 0.35 : 0); while (xx < end) { const lw = Math.min(16 + rnd(seed + r * 31 + xx) * 56, end - xx); ctx.fillRect(xx, y + r * gap, lw, 6); xx += lw + 12; } }
}
/** treaty scroll; len = unrolled length; fl = flourish 0..1 */
function treaty(cx, top, w, len, fl = 0) {
  const x = cx - w / 2;
  ctx.fillStyle = 'rgba(20,6,2,0.35)'; ctx.fillRect(x + 10, top + 12, w, len);
  ctx.fillStyle = G.ivory; ctx.fillRect(x, top, w, len); ctx.strokeStyle = G.ink; ctx.lineWidth = 3; ctx.strokeRect(x, top, w, len);
  ctx.fillStyle = 'rgba(201,154,46,0.35)'; ctx.fillRect(x + 22, top, 4, len); ctx.fillRect(x + w - 26, top, 4, len);
  ctx.save(); ctx.beginPath(); ctx.rect(x, top, w, Math.max(0, len - 34)); ctx.clip(); dashRows(x + 60, top + 80, w - 120, 11, 50, 3); ctx.restore();
  if (fl > 0 && len > 600) { ctx.beginPath(); for (let k = 0; k <= 40 * fl; k++) { const u = k / 40; ctx.lineTo(x + w - 280 + u * 200, top + len - 70 + Math.sin(u * 14) * 18 * (1 - u * 0.5)); } ctx.strokeStyle = G.ink; ctx.lineWidth = 4; ctx.stroke(); }
  for (const yy of [top, top + len]) { rr(x - 34, yy - 16, w + 68, 30, 15); ctx.fillStyle = G.gold; ctx.fill(); OL(2.5); ctx.fillStyle = G.hi; ctx.fillRect(x - 20, yy - 10, w + 40, 4); gem(x - 40, yy - 1, 12, G.ruby); gem(x + w + 40, yy - 1, 12, G.ruby); }
}
/** generic red wax seal with an abstract rosette (no real emblem) and ribbon tails */
function seal(x, y, r, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(k * 10, 10); ctx.lineTo(k * 46, r * 1.9); ctx.lineTo(k * 30, r * 1.75); ctx.lineTo(k * 22, r * 2.0); ctx.lineTo(k * -8, 20); ctx.closePath(); ctx.fillStyle = G.red; ctx.fill(); OL(2); }
  ctx.beginPath(); for (let k = 0; k <= 30; k++) { const a = k / 30 * TAU, q = r * (1 + 0.07 * Math.sin(k * 5.3)); ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q); } ctx.closePath(); ctx.fillStyle = '#A3161E'; ctx.fill(); OL(3);
  circle(0, 0, r * 0.76, '#C42A2A'); ctx.beginPath(); ctx.arc(0, 0, r * 0.68, 0, TAU); ctx.strokeStyle = '#7E0F14'; ctx.lineWidth = 4; ctx.stroke();
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; ctx.fillStyle = '#7E0F14'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32, r * 0.2, r * 0.08, a, 0, TAU); ctx.fill(); }
  circle(0, 0, r * 0.12, '#7E0F14');
  ctx.beginPath(); ctx.arc(0, 0, r * 0.85, Math.PI * 1.1, Math.PI * 1.5); ctx.strokeStyle = 'rgba(255,220,210,0.45)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}
function flag(x, y, t, s = 1) { // pole base (x, y); generic red flag with a gold circle mark
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-6, -620, 12, 620, 5); ctx.fillStyle = G.gold; ctx.fill(); OL(2); circle(0, -626, 14, G.gold2);
  ctx.beginPath(); const n = 16;
  for (let k = 0; k <= n; k++) { const u = k / n; ctx.lineTo(u * 300, -600 + Math.sin(u * 5 - t * 6) * 18 * u); }
  for (let k = n; k >= 0; k--) { const u = k / n; ctx.lineTo(u * 300, -420 + Math.sin(u * 5 - t * 6 + 0.3) * 18 * u); }
  ctx.closePath(); ctx.fillStyle = G.red2; ctx.fill(); OL(2.5);
  const yy = -510 + Math.sin(0.5 * 5 - t * 6) * 9; ctx.beginPath(); ctx.arc(150, yy, 40, 0, TAU); ctx.strokeStyle = G.gold2; ctx.lineWidth = 9; ctx.stroke();
  ctx.restore();
}
function coin(x, y, r = 30) { ell(x, y + 5, r, r * 0.34, G.gsh); ell(x, y, r, r * 0.34, G.gold2); ctx.beginPath(); ctx.ellipse(x, y, r * 0.78, r * 0.25, 0, 0, TAU); ctx.strokeStyle = G.gsh; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = G.hi; ctx.fillRect(x - r * 0.4, y - r * 0.14, r * 0.3, 2); }
function bundle(x, y, w, n = 2, seed = 0) { // palm-leaf bundles stacked, (x, y) = bottom-left on the plank
  for (let j = 0; j < n; j++) {
    const yy = y - (j + 1) * 21, ww = w - rnd(seed + j) * 14, xx = x + rnd(seed * 3 + j) * 8;
    rr(xx, yy + 4, ww, 13, 3); ctx.fillStyle = G.ochre; ctx.fill(); ctx.fillStyle = 'rgba(110,70,30,0.45)'; ctx.fillRect(xx + 4, yy + 9, ww - 8, 1.5);
    ctx.fillStyle = G.wd; ctx.fillRect(xx - 2, yy, ww + 4, 5); ctx.fillRect(xx - 2, yy + 16, ww + 4, 4);
    ctx.fillStyle = G.red2; ctx.fillRect(xx + ww * 0.28, yy - 1, 4, 22); ctx.fillRect(xx + ww * 0.7, yy - 1, 4, 22);
    ctx.strokeStyle = G.ink; ctx.lineWidth = 1.5; ctx.strokeRect(xx - 2, yy, ww + 4, 20);
  }
}
const BOOKC = [G.red2, G.grn2, G.blu2, G.ivory, '#7A2A10', G.grn, G.blu];
function book(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y - h, w, h); ctx.strokeStyle = G.ink; ctx.lineWidth = 1.6; ctx.strokeRect(x, y - h, w, h); ctx.fillStyle = G.gold2; ctx.fillRect(x + 2, y - h + 9, w - 4, 3); ctx.fillRect(x + 2, y - 14, w - 4, 3); }
function shelfRow(x0, x1, y, seed) {
  ctx.fillStyle = G.wd; ctx.fillRect(x0 - 8, y, x1 - x0 + 16, 18); ctx.fillStyle = G.wood2; ctx.fillRect(x0 - 8, y, x1 - x0 + 16, 4);
  let x = x0 + 4, k = 0;
  while (x < x1 - 30) {
    if (rnd(seed * 17 + k * 3.3) < 0.45) { const w = Math.min(x1 - x - 4, 70 + rnd(seed + k) * 50); bundle(x, y, w, 2 + Math.floor(rnd(seed * 3 + k) * 2.4), seed + k); x += w + 10; }
    else { const m = 2 + Math.floor(rnd(seed * 5 + k) * 4); for (let j = 0; j < m; j++) { const bw = 14 + rnd(seed + k * 7 + j) * 10, bh = 56 + rnd(seed * 9 + k + j * 3) * 36; if (x + bw > x1) break; book(x, y, bw, bh, BOOKC[Math.floor(rnd(seed * 2 + j + k * 5) * BOOKC.length)]); x += bw + 1; } x += 10; }
    k++;
  }
}
const LIBX = [276, 540, 804], LIBW = 220;
const libArches = () => memo('libA', () => LIBX.map((cx) => archPts(cx - LIBW / 2, 330, LIBW, 880, 95, 5)));
const libBeads = () => memo('libB', () => libArches().map((P) => along(P, 16, 16)));
/** Saraswathi Mahal hall: three tall shelved arches on lacquer red */
const libImg = () => cached('bLib', W, H, 1, () => {
  ctx.fillStyle = G.red; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(43,20,8,0.18)'; for (let x = 0; x < W; x += 26) ctx.fillRect(x, 0, 2, H);
  libArches().forEach((P, i) => {
    ctx.beginPath(); trace(P); ctx.fillStyle = G.blu; ctx.fill();
    ctx.save(); ctx.beginPath(); trace(P); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(LIBX[i] - LIBW / 2, 300, 18, 920);
    for (let s = 0; s < 6; s++) shelfRow(LIBX[i] - LIBW / 2 + 10, LIBX[i] + LIBW / 2 - 10, 510 + s * 132, i * 40 + s * 7 + 1);
    ctx.restore();
    ctx.beginPath(); trace(P); ctx.strokeStyle = G.gsh; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = G.gold; ctx.lineWidth = 10; ctx.stroke(); ctx.strokeStyle = G.hi; ctx.lineWidth = 2; ctx.stroke();
  });
  for (const x of [408, 672]) { rr(x - 16, 360, 32, 860, 6); ctx.fillStyle = G.gold; ctx.fill(); OL(2); ctx.fillStyle = G.hi; ctx.fillRect(x - 10, 370, 5, 840); rr(x - 28, 340, 56, 30, 6); ctx.fillStyle = G.gold2; ctx.fill(); OL(2); }
  ctx.fillStyle = G.grn; ctx.fillRect(0, 1200, W, 60); ctx.fillStyle = 'rgba(43,20,8,0.45)'; ctx.fillRect(0, 1200, W, 5);
});
function libGems(t, t0) { LIBX.forEach((x, i) => gemPop(x, 300, 14, GEMS[i], t, t0 == null ? null : t0 + i * 0.12)); }

// type marks: abstract, unreadable
function hangMarks(x, y, w, seed, sc = 1) { // a top bar with stems / hooks hanging under it
  ctx.fillRect(x, y, w, 5 * sc);
  for (let xx = x + 4 * sc, k = 0; xx < x + w - 6 * sc; xx += (12 + rnd(seed + k) * 8) * sc, k++) {
    const r = rnd(seed * 3 + k * 1.7);
    if (r < 0.5) ctx.fillRect(xx, y, 3.5 * sc, (14 + rnd(k + seed) * 10) * sc);
    else if (r < 0.8) { ctx.beginPath(); ctx.ellipse(xx + 2 * sc, y + 13 * sc, 4 * sc, 6 * sc, 0.5, 0, TAU); ctx.fill(); }
    else ctx.fillRect(xx - 2 * sc, y + 10 * sc, 8 * sc, 3 * sc);
  }
}
const sheetImg = () => cached('bSheet', 680, 420, 1, () => {
  ctx.fillStyle = G.ivory; ctx.fillRect(0, 0, 680, 420); ctx.strokeStyle = G.ink; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 676, 416);
  ctx.strokeStyle = 'rgba(122,87,20,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(22, 22, 636, 376);
  ctx.fillStyle = '#2B1408'; ctx.strokeStyle = '#2B1408';
  for (let r = 0; r < 7; r++) { let x = 50; const end = r === 6 ? 380 : 630; while (x < end - 30) { const w = Math.min(60 + rnd(r * 13 + x) * 80, end - x); hangMarks(x, 52 + r * 48, w, r * 100 + x); x += w + 20; } }
});
const typeImg = () => cached('bType', W, H, 1, () => {
  rr(170, 400, 740, 330, 12); ctx.fillStyle = G.gold; ctx.fill(); OL(3); rr(186, 416, 708, 298, 8); ctx.fillStyle = '#3B342D'; ctx.fill();
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) {
    const x = 200 + c * 69, y = 428 + r * 71;
    ctx.fillStyle = '#5E5A52'; ctx.fillRect(x + 5, y + 6, 60, 62); ctx.fillStyle = '#A9A498'; ctx.fillRect(x, y, 60, 62); ctx.fillStyle = '#CFCABD'; ctx.fillRect(x, y, 60, 5); ctx.fillStyle = '#7B776C'; ctx.fillRect(x + 55, y, 5, 62);
    ctx.fillStyle = '#4A463E'; ctx.strokeStyle = '#4A463E'; const sd = r * 10 + c;
    ctx.fillRect(x + 10, y + 16, 40, 6); ctx.fillRect(x + 14 + rnd(sd) * 22, y + 16, 6, 18 + rnd(sd + 1) * 18);
    if (rnd(sd + 2) > 0.4) { ctx.beginPath(); ctx.ellipse(x + 30 + rnd(sd + 3) * 10, y + 40, 6, 9, 0.5, 0, TAU); ctx.fill(); }
    if (rnd(sd + 5) > 0.6) ctx.fillRect(x + 36, y + 44, 10, 5);
  }
});
const pressImg = () => cached('bPress', W, H, 1, () => {
  rr(230, 1150, 620, 46, 8); ctx.fillStyle = G.wd; ctx.fill(); OL(3);
  for (const x of [290, 730]) { rr(x, 330, 62, 830, 8); ctx.fillStyle = G.wood; ctx.fill(); OL(3); ctx.fillStyle = G.wood2; ctx.fillRect(x + 8, 340, 10, 810); ctx.fillStyle = 'rgba(43,20,8,0.3)'; for (let y = 380; y < 1140; y += 60) ctx.fillRect(x + 30, y, 22, 3); }
  rr(250, 330, 580, 104, 10); ctx.fillStyle = G.wood; ctx.fill(); OL(3); ctx.fillStyle = G.wood2; ctx.fillRect(262, 340, 556, 10);
  rr(300, 360, 480, 44, 6); ctx.fillStyle = G.gold; ctx.fill(); OL(2); for (let x = 316; x <= 764; x += 16) bead(x, 382, 4);
  rr(290, 620, 502, 46, 6); ctx.fillStyle = G.wood; ctx.fill(); OL(3); rr(500, 616, 80, 54, 6); ctx.fillStyle = G.gold; ctx.fill(); OL(2);
  rr(180, 960, 720, 52, 6); ctx.fillStyle = G.wd; ctx.fill(); OL(3); ctx.fillStyle = G.wood2; ctx.fillRect(184, 964, 712, 6);
  rr(390, 928, 300, 34, 4); ctx.fillStyle = '#6E6A62'; ctx.fill(); OL(2); for (let x = 398; x < 682; x += 14) { ctx.fillStyle = '#A9A498'; ctx.fillRect(x, 930, 11, 8); }
});
function jarsList() { return memo('jars', () => { const J = []; for (let s = 0; s < 3; s++) { let x = 160; let k = 0; while (x < 920) { const w = 64 + rnd(s * 9 + k) * 34; J.push({ x: x + w / 2, y: 520 + s * 190, w, h: 92 + rnd(s * 4 + k * 2) * 46, c: [G.blu2, G.grn2, G.ivory, G.red2, G.blu][Math.floor(rnd(s * 3 + k * 7) * 5)], g: k % 3 }); x += w + 22; k++; } } return J; }); }
function jar(j) {
  const { x, y, w, h, c } = j;
  ctx.beginPath(); ctx.moveTo(x - w * 0.22, y - h); ctx.quadraticCurveTo(x - w * 0.62, y - h * 0.72, x - w * 0.5, y - h * 0.32); ctx.quadraticCurveTo(x - w * 0.42, y, x, y); ctx.quadraticCurveTo(x + w * 0.42, y, x + w * 0.5, y - h * 0.32); ctx.quadraticCurveTo(x + w * 0.62, y - h * 0.72, x + w * 0.22, y - h); ctx.closePath();
  ctx.fillStyle = c; ctx.fill(); OL(2.5);
  ctx.fillStyle = G.gold2; ctx.fillRect(x - w * 0.46, y - h * 0.5, w * 0.92, 6); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x - w * 0.34, y - h * 0.85, 6, h * 0.55);
  rr(x - w * 0.3, y - h - 12, w * 0.6, 14, 5); ctx.fillStyle = G.gold; ctx.fill(); OL(2);
}
const jarsImg = () => cached('bJars', W, H, 1, () => {
  ctx.fillStyle = G.grn; ctx.fillRect(0, 0, W, H);
  for (let s = 0; s < 3; s++) { ctx.fillStyle = G.blu; ctx.fillRect(140, 360 + s * 190, 800, 160); ctx.fillStyle = G.wd; ctx.fillRect(130, 520 + s * 190, 820, 18); ctx.fillStyle = G.wood2; ctx.fillRect(130, 520 + s * 190, 820, 4); }
  for (const j of jarsList()) jar(j);
  ctx.fillStyle = G.red; ctx.fillRect(0, 930, W, 400); ctx.fillStyle = 'rgba(43,20,8,0.5)'; ctx.fillRect(0, 930, W, 6);
  for (let x = 140; x < 950; x += 60) { ctx.beginPath(); ctx.moveTo(x, 1240); ctx.lineTo(x + 30, 960); ctx.lineTo(x + 60, 1240); ctx.strokeStyle = 'rgba(201,154,46,0.25)'; ctx.lineWidth = 3; ctx.stroke(); }
});
function mortar(x, y, s, t, tt) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-150, 0, 300, 40, 8); ctx.fillStyle = G.gold; ctx.fill(); OL(3); for (let k = -130; k <= 130; k += 18) bead(k, 20, 4.5);
  // pestle behind the front lip
  const a = tt * 5.2, px = Math.cos(a) * 60, py = -250 + Math.sin(a) * 16;
  ctx.beginPath(); ctx.moveTo(px - 18, py); ctx.lineTo(-14, -110); ctx.lineTo(14, -110); ctx.lineTo(px + 18, py); ctx.closePath(); ctx.fillStyle = G.wood2; ctx.fill(); OL(3); circle(px, py, 22, G.wood); ctx.beginPath(); ctx.arc(px, py, 22, 0, TAU); OL(3);
  ctx.beginPath(); ctx.moveTo(-170, -150); ctx.quadraticCurveTo(-160, -10, -90, 0); ctx.lineTo(90, 0); ctx.quadraticCurveTo(160, -10, 170, -150); ctx.closePath(); ctx.fillStyle = G.gold; ctx.fill(); OL(3);
  ctx.fillStyle = G.hi; ctx.fillRect(-140, -128, 10, 90);
  ctx.beginPath(); ctx.ellipse(0, -150, 170, 26, 0, Math.PI, TAU); ctx.fillStyle = '#3E2A10'; ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -150, 170, 26, 0, 0, TAU); OL(3);
  ctx.beginPath(); ctx.ellipse(0, -150, 170, 26, 0, 0, Math.PI); ctx.strokeStyle = G.gold2; ctx.lineWidth = 8; ctx.stroke();
  for (let k = -150; k <= 150; k += 20) bead(k, -84, 5);
  gem(0, -50, 16, G.em);
  ctx.restore();
}
function herbLeaf(x, y, r, rot, c) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -r * 0.6, r, 0); ctx.quadraticCurveTo(0, r * 0.6, -r, 0); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); OL(2); ctx.beginPath(); ctx.moveTo(-r * 0.8, 0); ctx.lineTo(r * 0.8, 0); ctx.strokeStyle = 'rgba(43,20,8,0.5)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
// South India (rough outline), lon/lat -> panel
const LX = (lon) => 170 + (lon - 73.5) * 95, LY = (lat) => 380 + (17.2 - lat) * 88;
const COAST = [[73.9, 17.2], [74.0, 16.5], [74.3, 15.0], [74.6, 13.6], [75.0, 12.6], [75.5, 11.6], [75.9, 10.9], [76.3, 9.7], [76.7, 8.8], [77.1, 8.3], [77.55, 8.08], [78.0, 8.6], [78.2, 8.95], [78.6, 9.15], [79.25, 9.3], [78.95, 9.7], [79.3, 10.3], [79.85, 10.3], [79.85, 10.8], [79.8, 11.6], [80.1, 12.5], [80.3, 13.5], [80.15, 15.0], [80.9, 15.8], [81.3, 16.4], [81.7, 17.2]].map(([a, b]) => [LX(a), LY(b)]);
const TNJ = [LX(79.14), LY(10.79)];
const mapImg = () => cached('bMap', W, H, 1, () => {
  ctx.fillStyle = G.blu; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(120,160,230,0.5)'; ctx.lineWidth = 3; for (let i = 0; i < 70; i++) { const x = rnd(i) * W, y = 300 + rnd(i * 3) * 1000; ctx.beginPath(); ctx.arc(x, y, 14, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  ctx.beginPath(); trace(COAST.concat([[LX(81.7), 200], [LX(73.9), 200]])); ctx.fillStyle = G.grn2; ctx.fill(); OL(4);
  ctx.beginPath(); ctx.ellipse(LX(80.75), LY(7.7), 72, 118, 0.15, 0, TAU); ctx.fillStyle = G.grn; ctx.fill(); OL(3);
  ctx.strokeStyle = 'rgba(30,91,58,0.7)'; ctx.lineWidth = 5; for (const [a, b, c, d] of [[75.2, 15.5, 80.0, 16.0], [76.5, 12.4, 79.85, 11.3], [77.2, 11.0, 79.4, 10.9]]) { ctx.beginPath(); ctx.moveTo(LX(a), LY(b)); ctx.quadraticCurveTo(LX((a + c) / 2), LY((b + d) / 2) - 40, LX(c), LY(d)); ctx.stroke(); }
});
const coastBeads = () => memo('cbeads', () => along(COAST, 17, -12));
const digitsImg = (gold) => cached(gold ? 'b1805g' : 'b1805p', W, H, 1, () => {
  ctx.font = '900 300px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.fillStyle = gold ? G.gsh : '#B9A888'; ctx.fillText('1805', 548, 718);
  ctx.fillStyle = gold ? G.hi : '#FFFFFF'; ctx.fillText('1805', 535, 704);
  ctx.fillStyle = gold ? G.gold2 : '#EFE6D2'; ctx.fillText('1805', 540, 710);
  ctx.lineWidth = 7; ctx.strokeStyle = G.ink; ctx.strokeText('1805', 540, 710);
});
const shelfCImg = () => cached('bShelfC', W, H, 1, () => {
  ctx.fillStyle = G.blu; ctx.fillRect(0, 0, W, H); ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let x = 100; x < W; x += 90) ctx.fillRect(x, 0, 4, H);
  ctx.save(); ctx.scale(1.9, 1.9); for (let s = 0; s < 4; s++) { const y = 225 + s * 150; if (s === 1) { shelfRow(40, 220, y, 77); shelfRow(345, 560, y, 91); ctx.fillStyle = G.wd; ctx.fillRect(210, y, 150, 18); ctx.fillStyle = G.wood2; ctx.fillRect(210, y, 150, 4); } else shelfRow(40, 560, y, 50 + s * 13); } ctx.restore();
});
function paperBundle(x, y, s) { // stacked papers tied with red tape, (x, y) = bottom centre
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let k = 0; k < 9; k++) { const yy = -14 - k * 11, dx = (rnd(k) - 0.5) * 10; rr(-118 + dx, yy, 236, 13, 3); ctx.fillStyle = k % 2 ? G.ivory : '#E6D6B0'; ctx.fill(); ctx.strokeStyle = 'rgba(43,20,8,0.7)'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.fillStyle = G.red2; ctx.fillRect(-60, -118, 12, 118); ctx.fillRect(50, -118, 12, 118); ctx.fillRect(-120, -64, 240, 10);
  ctx.beginPath(); ctx.ellipse(-54, -126, 20, 9, -0.4, 0, TAU); ctx.fillStyle = G.red2; ctx.fill(); OL(2);
  ctx.restore();
}
function rays(x, y, r0, r1, n, rot, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = `rgba(255,232,150,${a})`; ctx.beginPath();
  for (let k = 0; k < n; k++) { const an = k / n * TAU, w = TAU / n * 0.22; ctx.moveTo(Math.cos(an - w) * r0, Math.sin(an - w) * r0); ctx.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); ctx.lineTo(Math.cos(an + w) * r0, Math.sin(an + w) * r0); }
  ctx.fill(); ctx.restore();
}
function glowAt(x, y, r, a, col = '255,214,120') { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
function bookStack(x, y, n, seed, gold = false) { // lying books, (x, y) = bottom centre
  let yy = y;
  for (let k = 0; k < n; k++) { const w = 170 + rnd(seed + k) * 50, h = 28 + rnd(seed * 2 + k) * 12, dx = (rnd(seed * 5 + k) - 0.5) * 24;
    rr(x - w / 2 + dx, yy - h, w, h, 4); ctx.fillStyle = gold ? G.gold2 : BOOKC[Math.floor(rnd(seed * 3 + k) * 3)]; ctx.fill(); OL(2.5);
    ctx.fillStyle = gold ? G.hi : G.ivory; ctx.fillRect(x - w / 2 + dx + 10, yy - h + 6, w - 20, h - 12);
    ctx.fillStyle = gold ? G.gsh : G.gold2; ctx.fillRect(x - w / 2 + dx + 4, yy - h + 2, 5, h - 4); yy -= h; }
  return yy;
}

export function buildB(add, cue) {
  const t5 = L(5), t6 = L(6), t8 = L(8), t9 = L(9), t10 = L(10);
  const tTre = Wd('treaty', 5), tTnj = Wd('thanjavur', 5), tCo = Wd('company', 5), tFort = Wd('fort', 5), tTit = Wd('title', 5), tPen = Wd('pension', 5);
  const tWo = Wd('without', 6), tBooks = Wd('books', 6), tExp = Wd('expanded', 7), tLib = Wd('library', 7), tBk7 = Wd('books', 7), tLang = Wd('languages', 7);
  const tFive = Wd('five', 8), tPress = Wd('press', 8), tPr = Wd('printed', 8), tDev = Wd('devanagari', 8), tOft = Wd('often', 8), tSI = Wd('south', 8);
  const tMed = Wd('medical', 9), tDh = Wd('dhanvantari', 9), tDoc = Wd('doctors', 9), tUn = Wd('unexpected', 9);
  const tb2 = Wd('east', 5) - 0.25, tb3 = Wd('he', 5) - 0.2, tb4 = tTit - 0.2, tb6 = Wd('turned', 6) + 0.15, tb7 = Wd('saraswathi', 7) - 0.12;
  const tb8 = Wd('manuscripts', 7) - 0.15, tb9 = Wd('many', 7) - 0.2, tb11 = Wd('up', 8), tb12 = tDev - 0.1, tb13 = Wd('first', 8) - 0.15;
  const tb15 = Wd('and', 9) + 0.1, tb16 = Wd('something', 9) - 0.2;

  // b1 · treaty scroll
  const docBeads = memo('docB', () => along(rectPts(254, 404, 572, 700), 18, 0));
  add({ id: 'b1', at: t5, cam: [540, 640], zoom: 0.08, note: 'cabinet doors open on a treaty scroll unrolling, beads pop round it; TREATY 1799', draw(lt, d, t) {
    stage(t, () => {
      ctx.drawImage(groundImg(G.red, G.grn, 'rg'), 0, 0, W, H);
      const len = lerp(40, 740, eo(seg(t, t5 + 0.15, t5 + 1.1)));
      treaty(540, 390, 520, len, seg(t, tTnj + 0.1, tTnj + 0.7));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 390 + len); ctx.clip(); beads(docBeads, seg(t, t5 + 0.5, t5 + 2.2), 5); ctx.restore();
      plaque('TREATY 1799', 540, 290, seg(t, tTre + 0.05, tTre + 0.45), 40);
    }, { doors: eo(seg(lt, 0.02, 0.5)) });
  } });
  cue(t5 + 0.05, 'whoosh', { gain: 0.5 }); cue(tTre + 0.1, 'pop', { gain: 0.5 }); cue(t5 + 0.2, 'zip', { gain: 0.3 }); cue(tTnj + 0.15, 'zip', { gain: 0.25 });

  // b2 · seal stamps, frame tarnishes
  add({ id: 'b2', at: tb2, cam: [540, 760], zoom: 0.07, note: 'generic red seal stamps the treaty, red flag behind; gilt frame tarnishes and cracks', draw(lt, d, t) {
    const hit = tCo + 0.12, u = seg(t, hit - 0.35, hit), tn = seg(t, hit, hit + 0.9);
    const shake = t > hit && t < hit + 0.2 ? Math.sin((t - hit) * 90) * 8 * (1 - (t - hit) / 0.2) : 0;
    ctx.save(); ctx.translate(0, shake);
    stage(t, () => {
      ctx.drawImage(groundImg(G.red, G.grn, 'rg'), 0, 0, W, H);
      treaty(600, 380, 480, 740, 1);
      flag(190, 1180, t, 0.72);
      if (u > 0) { const s = u < 1 ? lerp(2.4, 1, eio(u)) : 1; if (u < 1) { ctx.fillStyle = `rgba(20,6,2,${0.3 * u})`; ctx.beginPath(); ctx.ellipse(660, 1010, 110 * (2 - u), 40 * (2 - u), 0, 0, TAU); ctx.fill(); } seal(660, u < 1 ? lerp(700, 960, eio(u)) : 960, 92, s); }
      if (t > hit) { const r = seg(t, hit, hit + 0.5); ctx.beginPath(); ctx.arc(660, 960, 100 + r * 220, 0, TAU); ctx.strokeStyle = `rgba(255,220,180,${0.6 * (1 - r)})`; ctx.lineWidth = 8; ctx.stroke(); }
      if (tn > 0) { ctx.fillStyle = `rgba(40,20,6,${0.35 * tn})`; fillO(ctx.fillStyle); }
    }, { tarnish: tn * 0.9, cracks: seg(t, hit + 0.1, hit + 1.3) });
    ctx.restore();
  } });
  cue(tb2 + 0.05, 'whoosh', { gain: 0.3 }); cue(tCo + 0.12, 'thud', { gain: 0.8 }); cue(tCo + 0.2, 'rumble', { gain: 0.4, dur: 1 });

  // b3 · fort gilded
  const fortTg = memo('fortTg', () => Array.from({ length: 16 }, (_, i) => [180 + (i * 0.618 % 1) * 720, 760 + rnd(i * 3) * 220]));
  const fortDraw = (gold) => {
    const body = gold ? G.gold2 : '#D9B98A', dark = gold ? G.gsh : '#A8875A', top = gold ? G.hi : '#EAD2A6';
    ctx.fillStyle = body; ctx.fillRect(140, 760, 800, 260); ctx.fillStyle = dark; ctx.fillRect(140, 980, 800, 40);
    for (let x = 140; x < 940; x += 40) { ctx.fillStyle = body; ctx.fillRect(x, 730, 24, 32); ctx.strokeStyle = G.ink; ctx.lineWidth = 2; ctx.strokeRect(x, 730, 24, 32); }
    ctx.strokeStyle = G.ink; ctx.lineWidth = 3; ctx.strokeRect(140, 760, 800, 260);
    ctx.strokeStyle = 'rgba(43,20,8,0.3)'; ctx.lineWidth = 2; for (let y = 800; y < 980; y += 40) for (let x = 140 + (y % 80 ? 0 : 30); x < 940; x += 60) ctx.strokeRect(x, y, 60, 40);
    for (const bx of [230, 540, 850]) { rr(bx - 75, 640, 150, 380, 10); ctx.fillStyle = body; ctx.fill(); OL(3); ctx.fillStyle = top; ctx.fillRect(bx - 66, 650, 14, 360); for (let k = -3; k <= 3; k++) { ctx.fillStyle = body; ctx.fillRect(bx + k * 21 - 8, 612, 16, 30); ctx.strokeStyle = G.ink; ctx.lineWidth = 2; ctx.strokeRect(bx + k * 21 - 8, 612, 16, 30); } }
    ctx.beginPath(); ctx.moveTo(490, 1020); ctx.lineTo(490, 870); ctx.arc(540, 870, 50, Math.PI, 0); ctx.lineTo(590, 1020); ctx.closePath(); ctx.fillStyle = '#3A1A0A'; ctx.fill(); OL(3);
  };
  add({ id: 'b3', at: tb3, cam: [540, 820], zoom: 0.1, note: 'fort walls + bastions; gold leaves flutter down and gild the walls; gems pop on bastions', draw(lt, d, t) {
    stage(t, () => {
      fillO(G.blu); ctx.fillStyle = G.grn2; ctx.fillRect(0, 1020, W, 300);
      ctx.fillStyle = G.blu2; ctx.fillRect(0, 1040, W, 60); ctx.strokeStyle = 'rgba(255,240,176,0.6)'; ctx.lineWidth = 3;
      for (let k = 0; k < 14; k++) { const x = 130 + ((k * 70 + t * 40) % 840); ctx.beginPath(); ctx.moveTo(x, 1068); ctx.quadraticCurveTo(x + 15, 1060, x + 30, 1068); ctx.stroke(); }
      for (let k = 0; k < 5; k++) { const x = 180 + k * 180 + Math.sin(t + k) * 10; circle(x, 450 + rnd(k) * 60, 6, 'rgba(255,240,176,0.5)'); }
      fortDraw(false);
      gilding(t, fortTg, tb3 + 0.05, 0.06, () => fortDraw(true), 110, 0.55, 32);
      [230, 540, 850].forEach((bx, i) => gemPop(bx, 700, 15, GEMS[i], t, tFort + i * 0.1));
    });
  } });
  cue(tb3 + 0.05, 'slide', { gain: 0.35 }); cue(tb3 + 0.6, 'sparkle', { gain: 0.35 }); for (let i = 0; i < 3; i++) cue(tFort + i * 0.1 + 0.3, 'plop', { gain: 0.35 });

  // b4 · turban (title) + coins (pension)
  add({ id: 'b4', at: tb4, cam: [540, 840], zoom: 0.09, note: 'Maratha turban drops on a cushion (title), crest gems pop; coins drop into a modest stack (pension); sheen', draw(lt, d, t) {
    stage(t, () => {
      ctx.drawImage(groundImg(G.red, G.grn, 'rg'), 0, 0, W, H);
      glowAt(540, 760, 420, 0.25);
      // gilt stand + cushion
      rr(330, 990, 420, 50, 10); ctx.fillStyle = G.gold; ctx.fill(); OL(3); for (let x = 350; x <= 730; x += 18) bead(x, 1015, 4.5);
      for (const x of [360, 700]) { rr(x, 1040, 24, 90, 6); ctx.fillStyle = G.gold; ctx.fill(); OL(2); }
      ctx.beginPath(); ctx.ellipse(540, 960, 230, 52, 0, 0, TAU); ctx.fillStyle = G.blu2; ctx.fill(); OL(3); ctx.beginPath(); ctx.ellipse(540, 952, 200, 34, 0, 0, TAU); ctx.strokeStyle = G.gold2; ctx.lineWidth = 5; ctx.stroke();
      for (const k of [-1, 1]) { circle(540 + k * 225, 972, 14, G.gold2); ctx.beginPath(); ctx.moveTo(540 + k * 225, 980); ctx.lineTo(540 + k * 232, 1010); ctx.strokeStyle = G.gold2; ctx.lineWidth = 6; ctx.stroke(); }
      const u = seg(t, tb4, tb4 + 0.4), ty = u < 1 ? lerp(520, 900, eob(u)) : 900;
      ctx.save(); ctx.translate(540, ty); ctx.scale(2.6, 2.6); turban(t, tTit - 0.02, t); ctx.restore();
      gemPop(540 + 2.6 * -20, ty - 2.6 * 30, 13, G.ruby, t, tTit + 0.12); gemPop(540 + 2.6 * -2, ty - 2.6 * 46, 11, G.sap, t, tTit + 0.24);
      // pension: coins drop onto a small plate
      ctx.beginPath(); ctx.ellipse(790, 1180, 110, 26, 0, 0, TAU); ctx.fillStyle = G.gold; ctx.fill(); OL(2.5); ctx.beginPath(); ctx.ellipse(790, 1176, 84, 16, 0, 0, TAU); ctx.fillStyle = G.gsh; ctx.fill();
      for (let i = 0; i < 9; i++) { const tc = tPen + 0.05 + i * 0.13, v = (t - tc) / 0.32; if (v < 0) break; const yy = 1170 - i * 11; coin(790 + (rnd(i) - 0.5) * 10, v < 1 ? lerp(560, yy, v * v) : yy, 44); }
    }, { sheen: seg(t, tTit + 0.1, tTit + 1.1) });
  } });
  cue(tb4 + 0.3, 'thud', { gain: 0.4 }); cue(tTit + 0.15, 'sparkle', { gain: 0.45 });
  for (let i = 0; i < 9; i++) cue(tPen + 0.05 + i * 0.13 + 0.32, 'tock', { gain: 0.3 });

  // b5 · king without a kingdom: doors shut behind him
  const kingdom = () => cached('bKdom', W, H, 0.5, () => {
    ctx.fillStyle = G.blu; ctx.fillRect(0, 0, W, H); ctx.fillStyle = G.grn2; ctx.fillRect(0, 760, W, 600);
    for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? G.grn : '#3E8F58'; ctx.beginPath(); ctx.moveTo(0, 820 + k * 70); ctx.quadraticCurveTo(540, 780 + k * 70, W, 830 + k * 70); ctx.lineTo(W, 870 + k * 70); ctx.quadraticCurveTo(540, 830 + k * 70, 0, 870 + k * 70); ctx.fill(); }
    ctx.fillStyle = G.blu2; ctx.beginPath(); ctx.moveTo(700, 760); ctx.quadraticCurveTo(600, 950, 820, 1240); ctx.lineTo(900, 1240); ctx.quadraticCurveTo(680, 950, 760, 760); ctx.fill();
    ctx.fillStyle = '#D9B98A'; ctx.fillRect(180, 640, 300, 130); for (let x = 180; x < 480; x += 30) ctx.fillRect(x, 622, 18, 20); ctx.strokeStyle = G.ink; ctx.lineWidth = 3; ctx.strokeRect(180, 640, 300, 130);
    ctx.beginPath(); ctx.moveTo(720, 770); ctx.lineTo(750, 470); ctx.lineTo(830, 470); ctx.lineTo(860, 770); ctx.closePath(); ctx.fillStyle = '#D9B98A'; ctx.fill(); OL(3); for (let y = 500; y < 770; y += 40) { ctx.fillStyle = 'rgba(43,20,8,0.3)'; ctx.fillRect(740, y, 110, 4); }
    circle(790, 455, 18, G.gold2);
  });
  add({ id: 'b5', at: t6, cam: [540, 860], zoom: 0.08, note: 'faceless king before a painted kingdom; lacquer cabinet doors swing shut behind him', draw(lt, d, t) {
    stage(t, () => {
      ctx.drawImage(kingdom(), 0, 0, W, H);
      doors(1 - eio(seg(t, tWo - 0.25, tWo + 0.55)));
      ctx.fillStyle = 'rgba(20,6,2,0.35)'; ctx.beginPath(); ctx.ellipse(540, 1215, 170, 22, 0, 0, TAU); ctx.fill();
      king(540, 1210, 1.45, { t, tt: t });
    }, { tarnish: 0.35 });
  } });
  cue(tWo - 0.2, 'whoosh', { gain: 0.4 }); cue(tWo + 0.55, 'slam', { gain: 0.6 });

  // b6 · turned to books
  const bookTg = memo('bookTg', () => Array.from({ length: 10 }, (_, i) => [680 + (i * 0.618 % 1) * 180, 890 + rnd(i * 7) * 120]));
  add({ id: 'b6', at: tb6, cam: [660, 860], zoom: 0.12, note: 'king in profile walks to a reading desk; gold leaves gild the books; more stacks bounce on', draw(lt, d, t) {
    stage(t, () => {
      fillO(G.red); ctx.fillStyle = 'rgba(43,20,8,0.25)'; for (let x = OX; x < OX + OW; x += 52) ctx.fillRect(x, OY, 3, OH);
      ctx.fillStyle = G.grn; ctx.fillRect(0, 1180, W, 100);
      glowAt(760, 900, 360, 0.35 + 0.05 * Math.sin(t * 7));
      // low gilt desk
      rr(590, 1020, 340, 34, 8); ctx.fillStyle = G.gold; ctx.fill(); OL(3); for (let x = 606; x <= 914; x += 18) bead(x, 1037, 4);
      for (const x of [610, 890]) { rr(x, 1054, 22, 130, 5); ctx.fillStyle = G.gold; ctx.fill(); OL(2); }
      const top0 = bookStack(770, 1020, 4, 3);
      gilding(t, bookTg, tBooks - 0.45, 0.05, () => bookStack(770, 1020, 4, 3, true), 70, 0.5, 26);
      let top = top0;
      for (const [n, sd, i] of [[3, 11, 0], [3, 23, 1], [2, 31, 2]]) { const u = seg(t, tExp - 0.35 + i * 0.22, tExp + 0.05 + i * 0.22); if (u <= 0) break; ctx.save(); ctx.translate(0, (1 - eob(u)) * -320); const nt = bookStack(770, top, n, sd); ctx.restore(); top = nt; }
      const wx = lerp(220, 330, eo(seg(t, tb6, tb6 + 1.6)));
      king(wx, 1200, 1.12, { dir: 1, step: t < tb6 + 1.6 ? (t - tb6) * 8 : 0, t, tt: t });
      if (t > tBooks) star(770, 880, 34 * clamp(1 - Math.abs(t - tBooks - 0.3) / 0.4));
    });
  } });
  cue(tBooks + 0.05, 'sparkle', { gain: 0.5 }); cue(tExp - 0.05, 'plop', { gain: 0.4 }); cue(tExp + 0.2, 'plop', { gain: 0.4 });

  // b7 · Saraswathi Mahal: nested arch zoom
  add({ id: 'b7', at: tb7, cam: [540, 780], zoom: 0.06, note: 'nested gilt arch zooms open into the Saraswathi Mahal hall, three shelved arches, beads pop, sheen', draw(lt, d, t) {
    const e = eio(seg(t, tb7, tb7 + 0.7)), k = lerp(0.45, 1, e), cx = 540, cy = 720;
    stage(t, () => {
      fillO(G.red);
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * 0.2; bead(cx + Math.cos(a) * 470, cy + Math.sin(a) * 600, 6); }
      ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
      ctx.save(); ctx.beginPath(); trace(OPEN()); ctx.clip(); ctx.drawImage(libImg(), 0, 0);
      libBeads().forEach((B, i) => beads(B, seg(t, tb7 + 0.4 + i * 0.15, tLib + 0.4 + i * 0.15), 4.5));
      libGems(t, tLib - 0.1);
      ctx.restore();
      if (k < 1) { ctx.drawImage(frameImg(), 0, 0); frameGems(t); }
      ctx.restore();
    }, { sheen: seg(t, tLib, tLib + 0.9) });
  } });
  cue(tb7, 'whoosh', { gain: 0.5 }); cue(tLib, 'sparkle', { gain: 0.4 }); for (let i = 0; i < 3; i++) cue(tLib + 0.25 + i * 0.12, 'pop', { gain: 0.3 });

  // b8 · manuscripts slide in, books drop in
  const B8 = memo('b8items', () => {
    const I = [];
    for (let s = 0; s < 2; s++) { let x = 170, k = 0; while (x < 860) { const w = 140 + rnd(s * 7 + k) * 70; I.push({ s, x, w, n: 2 + (k % 3), seed: s * 20 + k, dir: k % 2 ? 1 : -1, i: I.length }); x += w + 26; k++; } }
    let x = 160, k = 0; const Bk = []; while (x < 900) { const w = 30 + rnd(k * 3.3) * 22, h = 120 + rnd(k * 5.1) * 70; Bk.push({ x, w, h, c: BOOKC[k % BOOKC.length], k }); x += w + 3; k++; }
    return { I, Bk };
  });
  add({ id: 'b8', at: tb8, cam: [540, 760], zoom: 0.08, note: 'shelf close-up: palm-leaf bundles slide in, bound books drop in with a bounce', draw(lt, d, t) {
    stage(t, () => {
      fillO(G.blu); ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let x = 160; x < 960; x += 120) ctx.fillRect(x, 0, 4, H);
      const SY = [560, 860, 1160];
      for (const y of SY) { ctx.fillStyle = G.wd; ctx.fillRect(0, y, W, 30); ctx.fillStyle = G.wood2; ctx.fillRect(0, y, W, 6); ctx.fillStyle = G.gold; ctx.fillRect(0, y + 30, W, 8); }
      const { I, Bk } = B8;
      for (const it of I) { const ts = tb8 + 0.02 + it.i * 0.09, u = eo(seg(t, ts, ts + 0.35)); if (u <= 0) continue; ctx.save(); ctx.translate(it.dir * (1 - u) * 900, 0); ctx.scale(1, 1); ctx.translate(it.x, SY[it.s]); ctx.scale(1.6, 1.6); bundle(0, 0, it.w / 1.6, it.n, it.seed); ctx.restore(); }
      for (const b of Bk) { const ts = tBk7 - 0.15 + b.k * 0.035, u = seg(t, ts, ts + 0.3); if (u <= 0) continue; const yy = SY[2] - (1 - eob(u)) * 260; ctx.save(); ctx.beginPath(); ctx.rect(0, SY[1] + 38, W, 400); ctx.clip(); book(b.x, yy, b.w, b.h, b.c); ctx.restore(); }
    });
  } });
  cue(tb8 + 0.05, 'slide', { gain: 0.4 }); cue(tb8 + 0.5, 'slide', { gain: 0.35 }); cue(tBk7 + 0.1, 'thud', { gain: 0.35 }); cue(tBk7 + 0.35, 'tock', { gain: 0.3 });

  // b9 · many languages fan
  const markStyle = (k, x, y, w, sd) => {
    ctx.fillStyle = G.ink; ctx.strokeStyle = G.ink; ctx.lineWidth = 3;
    if (k === 0) { for (let xx = x; xx < x + w - 10; xx += 16) { ctx.beginPath(); ctx.ellipse(xx + 6, y, 6, 5 + rnd(sd + xx) * 3, 0, 0, Math.PI * (1.3 + rnd(xx + sd) * 0.7)); ctx.stroke(); } }
    else if (k === 1) hangMarks(x, y - 8, w, sd, 0.8);
    else if (k === 2) { ctx.beginPath(); for (let xx = x; xx < x + w; xx += 9) ctx.lineTo(xx, y + (Math.floor(xx / 9) % 2 ? -6 : 6) * rnd(sd + xx)); ctx.stroke(); }
    else if (k === 3) { for (let xx = x; xx < x + w - 6; xx += 13) { if (rnd(sd + xx) > 0.5) circle(xx, y, 3.5, G.ink); else { ctx.beginPath(); ctx.arc(xx, y + 4, 6, Math.PI, TAU); ctx.stroke(); } } }
    else { for (let xx = x; xx < x + w - 8; xx += 12) ctx.fillRect(xx, y - 8 + rnd(sd + xx) * 6, 7, 3 + rnd(xx * 3 + sd) * 10); }
  };
  add({ id: 'b9', at: tb9, cam: [540, 820], zoom: 0.1, note: 'a fan of leaves opens, each with a different abstract mark style; gems pop per leaf (many languages)', draw(lt, d, t) {
    stage(t, () => {
      fillO(G.blu); glowAt(540, 1100, 600, 0.2);
      for (let i = 0; i < 26; i++) { const a = Math.PI + i / 25 * Math.PI; ctx.beginPath(); ctx.moveTo(540, 1150); ctx.lineTo(540 + Math.cos(a) * 900, 1150 + Math.sin(a) * 900); ctx.strokeStyle = i % 2 ? 'rgba(53,87,181,0.6)' : 'rgba(31,60,140,0)'; ctx.lineWidth = 40; ctx.stroke(); }
      const open = eo(seg(t, tb9 + 0.02, tb9 + 0.75));
      for (let i = 0; i < 5; i++) {
        const ang = (i - 2) * 0.36 * open;
        ctx.save(); ctx.translate(540, 1150); ctx.rotate(ang);
        rr(-92, -760, 184, 680, 14); ctx.fillStyle = 'rgba(20,6,2,0.35)'; ctx.fill();
        rr(-96, -770, 184, 680, 14); ctx.fillStyle = i % 2 ? G.ivory : '#E9D6A8'; ctx.fill(); OL(3);
        ctx.strokeStyle = G.gold; ctx.lineWidth = 4; ctx.strokeRect(-82, -752, 156, 644);
        for (let r = 0; r < 11; r++) markStyle(i, -66, -700 + r * 52, 124, i * 100 + r * 7);
        ctx.restore();
        const gx = 540 + Math.sin(ang) * 820, gy = 1150 - Math.cos(ang) * 820;
        gemPop(gx - 4, gy, 17, GEMS[i % 3], t, tLang + i * 0.1);
      }
      ctx.beginPath(); ctx.arc(540, 1150, 110, Math.PI, TAU); ctx.fillStyle = G.gold; ctx.fill(); OL(3);
      beads(along(ellPts(540, 1150, 130, 130, 60).slice(0, 31), 16, 0), seg(t, tb9, tb9 + 1), 5);
      gem(540, 1100, 22, G.ruby);
    });
  } });
  for (let i = 0; i < 5; i++) cue(tLang + 0.3 + i * 0.1, 'pop', { gain: 0.3 }); cue(tb9 + 0.05, 'whoosh', { gain: 0.35 });

  // b10 · 1805 gilded
  const dTg = memo('dTg', () => Array.from({ length: 22 }, (_, i) => [300 + (i * 0.618 % 1) * 500, 620 + rnd(i * 5) * 180]));
  const ringB = memo('ringB', () => along(ellPts(540, 710, 380, 230, 140), 18, 0));
  add({ id: 'b10', at: t8, cam: [540, 720], zoom: 0.1, note: 'doors open on 1805 in white gesso; gold leaves land and gild it; beaded ring; sheen', draw(lt, d, t) {
    stage(t, () => {
      ctx.drawImage(groundImg(G.red, G.grn, 'rg'), 0, 0, W, H);
      beads(ringB, seg(t, t8 + 0.2, t8 + 1.3), 6);
      ctx.drawImage(digitsImg(false), 0, 0);
      gilding(t, dTg, t8 + 0.2, 0.04, () => ctx.drawImage(digitsImg(true), 0, 0), 120, 0.5, 34);
      if (t > tFive + 0.3) sheen(digitsImg(true), lerp(800, 2000, seg(t, tFive + 0.3, tFive + 0.9)), 0.8);
      for (let i = 0; i < 4; i++) gemPop(540 + Math.cos(i * Math.PI / 2) * 380, 710 + Math.sin(i * Math.PI / 2) * 230, 15, GEMS[i % 3], t, tFive + i * 0.08);
    }, { doors: eo(seg(lt, 0.0, 0.45)) });
  } });
  cue(t8 + 0.05, 'whoosh', { gain: 0.5 }); cue(t8 + 0.5, 'sparkle', { gain: 0.4 }); cue(tFive + 0.25, 'bell', { gain: 0.45 });

  // b11 · hand press stamps
  add({ id: 'b11', at: tb11, cam: [540, 760], zoom: 0.09, note: 'wooden hand press: lever pulls, screw turns, platen stamps; a printed sheet rises', draw(lt, d, t) {
    const hit = tPr, down = t < hit ? eio(seg(t, hit - 0.45, hit)) : 1 - eio(seg(t, hit + 0.2, hit + 0.55)), platY = lerp(760, 880, down);
    stage(t, () => {
      fillO(G.grn); ctx.fillStyle = G.red; ctx.fillRect(0, 1180, W, 100);
      ctx.drawImage(pressImg(), 0, 0);
      // screw (stripes slide as it turns)
      ctx.save(); rr(518, 434, 44, platY - 434, 6); ctx.fillStyle = G.gold; ctx.fill(); OL(2.5); ctx.clip();
      ctx.strokeStyle = G.gsh; ctx.lineWidth = 6; for (let y = 400 + (down * 120) % 24; y < platY; y += 24) { ctx.beginPath(); ctx.moveTo(514, y); ctx.lineTo(566, y + 12); ctx.stroke(); } ctx.restore();
      // lever (foreshortened as it swings)
      const la = down * 1.3, lx = Math.cos(la) * 300;
      ctx.beginPath(); ctx.moveTo(560, 640); ctx.lineTo(560 + lx, 640 + Math.sin(la) * 40); ctx.strokeStyle = G.ink; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = G.wood2; ctx.lineWidth = 12; ctx.stroke();
      circle(560 + lx, 640 + Math.sin(la) * 40, 22, G.wd); circle(556 + lx, 636 + Math.sin(la) * 40, 8, G.wood2);
      // platen
      rr(392, platY, 296, 46, 6); ctx.fillStyle = G.gold; ctx.fill(); OL(3); for (let x = 408; x <= 672; x += 16) bead(x, platY + 23, 4);
      if (t > hit) { const r = seg(t, hit, hit + 0.35); ctx.strokeStyle = `rgba(255,240,176,${1 - r})`; ctx.lineWidth = 6; for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + k * 170, 930); ctx.lineTo(540 + k * (220 + r * 80), 900 - r * 40); ctx.stroke(); } }
      // printed sheet rises
      const su = eo(seg(t, hit + 0.35, hit + 0.75));
      if (su > 0) { const sc = lerp(0.12, 0.55, su), sx = lerp(540, 540, su), sy = lerp(930, 470, su); ctx.save(); ctx.translate(sx, sy); ctx.rotate((1 - su) * 0.2); ctx.scale(sc, sc * (0.2 + 0.8 * su)); ctx.drawImage(sheetImg(), -340, -210); ctx.restore(); }
      gemPop(540, 470, 15, G.ruby, t, tPress);
    });
  } });
  cue(tPress, 'tock', { gain: 0.35 }); cue(tPr - 0.4, 'zip', { gain: 0.3 }); cue(tPr, 'slam', { gain: 0.7 });

  // b12 · type + printed rows; OFTEN CALLED FIRST
  add({ id: 'b12', at: tb12, cam: [540, 760], zoom: 0.08, note: 'type tray of abstract raised blocks above a sheet whose mark rows print in; OFTEN CALLED FIRST', draw(lt, d, t) {
    stage(t, () => {
      ctx.drawImage(groundImg(G.grn, G.red, 'gr'), 0, 0, W, H);
      ctx.save(); ctx.translate(0, lerp(40, 0, eo(seg(t, tb12, tb12 + 0.5)))); ctx.drawImage(typeImg(), 0, 0);
      const sw = (t * 260) % 1400 - 300; ctx.save(); ctx.beginPath(); ctx.rect(186, 416, 708, 298); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(sw, 416); ctx.lineTo(sw + 60, 416); ctx.lineTo(sw - 40, 714); ctx.lineTo(sw - 100, 714); ctx.fill(); ctx.restore();
      ctx.restore();
      const img = sheetImg(), sx = 200, sy = 770;
      ctx.fillStyle = 'rgba(20,6,2,0.35)'; ctx.fillRect(sx + 10, sy + 12, 680, 420);
      ctx.fillStyle = G.ivory; ctx.fillRect(sx, sy, 680, 420); ctx.drawImage(img, 0, 0, 680, 30, sx, sy, 680, 30); ctx.drawImage(img, 0, 390, 680, 30, sx, sy + 390, 680, 30);
      ctx.drawImage(img, 0, 0, 30, 420, sx, sy, 30, 420); ctx.drawImage(img, 650, 0, 30, 420, sx + 650, sy, 30, 420);
      for (let r = 0; r < 7; r++) { const p = seg(t, tb12 + 0.05 + r * 0.1, tb12 + 0.45 + r * 0.1); if (p <= 0) continue; const w = 30 + 620 * p; ctx.drawImage(img, 30, 40 + r * 48, w, 48, sx + 30, sy + 40 + r * 48, w, 48); }
    });
    plaque('OFTEN CALLED FIRST', 540, 300, seg(t, tOft + 0.05, tOft + 0.45), 38);
  } });
  for (let r = 0; r < 7; r++) cue(tb12 + 0.1 + r * 0.1, 'tock', { gain: 0.22 }); cue(tOft + 0.1, 'pop', { gain: 0.5 });

  // b13 · South India map
  add({ id: 'b13', at: tb13, cam: [700, 860], zoom: 0.14, note: 'South India peninsula, coast beaded dot by dot, ruby gem + rings at Thanjavur, printed sheet beside; plaque stays', draw(lt, d, t) {
    stage(t, () => {
      ctx.drawImage(mapImg(), 0, 0);
      beads(coastBeads(), seg(t, tb13, tSI + 0.2), 5);
      const [x, y] = TNJ;
      for (let k = 0; k < 3; k++) { const r = ((t - tb13 - 0.3) * 0.8 + k / 3) % 1; if (t < tb13 + 0.3) break; ctx.beginPath(); ctx.arc(x, y, 20 + r * 160, 0, TAU); ctx.strokeStyle = `rgba(255,240,176,${0.8 * (1 - r)})`; ctx.lineWidth = 5; ctx.stroke(); }
      gemPop(x, y, 18, G.ruby, t, tb13 + 0.2);
      const su = eo(seg(t, tb13 + 0.5, tb13 + 1.0));
      if (su > 0) { ctx.beginPath(); ctx.moveTo(x - 16, y - 16); ctx.lineTo(lerp(x, 420, su), lerp(y, 760, su)); ctx.strokeStyle = G.gold2; ctx.lineWidth = 5; ctx.stroke(); ctx.save(); ctx.translate(420, 760); ctx.rotate(-0.06); ctx.scale(0.5 * su, 0.5 * su); ctx.fillStyle = 'rgba(20,6,2,0.4)'; ctx.fillRect(-330, -200, 680, 420); ctx.drawImage(sheetImg(), -340, -210); ctx.restore(); }
    }, { sheen: seg(t, tSI, tSI + 1.0) });
    plaque('OFTEN CALLED FIRST', 540, 300, 1, 38);
  } });
  cue(tb13 + 0.25, 'plop', { gain: 0.45 }); cue(tb13 + 0.6, 'whoosh', { gain: 0.3 }); cue(tSI, 'sparkle', { gain: 0.4 });

  // b14 · Dhanvantari Mahal
  add({ id: 'b14', at: t9, cam: [540, 980], zoom: 0.12, note: 'doors open on the Dhanvantari Mahal: herb-jar shelves, lids pop gems, pestle grinds, herbs drop in', draw(lt, d, t) {
    stage(t, () => {
      ctx.drawImage(jarsImg(), 0, 0);
      jarsList().forEach((j, i) => gemPop(j.x, j.y - j.h - 16, 8, GEMS[j.g], t, tMed + i * 0.035));
      glowAt(540, 1000, 340, 0.25);
      for (let i = 0; i < 6; i++) { const ph = ((t - t9) * 0.8 + i / 6) % 1; if (t - t9 < i * 0.15) continue; herbLeaf(540 + Math.sin(i * 2.1 + ph * 4) * 90 * (1 - ph), lerp(600, 880, ph * ph), 22, ph * 5 + i, i % 2 ? G.grn2 : '#5BAE6A'); }
      mortar(540, 1060, 1.15, t, t - t9);
      for (let k = 0; k < 3; k++) beads(along([[140, 529 + k * 190], [940, 529 + k * 190]], 18, 0), seg(t, tDh - 0.1 + k * 0.15, tDh + 0.6 + k * 0.15), 4.5);
    }, { doors: eo(seg(lt, 0, 0.45)), sheen: seg(t, tDh, tDh + 1) });
  } });
  cue(t9 + 0.05, 'whoosh', { gain: 0.5 }); cue(tMed + 0.3, 'sparkle', { gain: 0.35 }); cue(tDh + 0.2, 'chisel', { gain: 0.2 }); cue(t9 + 1.2, 'tock', { gain: 0.2 }); cue(t9 + 2.4, 'tock', { gain: 0.2 });

  // b15 · doctors in the library
  add({ id: 'b15', at: tb15, cam: [480, 880], zoom: 0.08, note: 'library again, two faceless doctors walk in and one points up at the shelves', draw(lt, d, t) {
    stage(t, () => {
      ctx.drawImage(libImg(), 0, 0); libBeads().forEach((B) => beads(B, 1, 4.5)); libGems(t);
      ctx.fillStyle = 'rgba(30,10,4,0.25)'; fillO(ctx.fillStyle);
      const w = eo(seg(t, tb15, tDoc + 0.2)), walking = t < tDoc + 0.2;
      doctor(lerp(-200, 240, w), 1235, 1.16, { step: walking ? (t - tb15) * 8 + 1.6 : 0 });
      doctor(lerp(-40, 440, w), 1225, 1.22, { step: walking ? (t - tb15) * 8 : 0, point: eo(seg(t, tDoc + 0.3, tDoc + 0.7)) * 0.95 });
      const gp = seg(t, tDoc + 0.5, tDoc + 1); if (gp > 0) glowAt(804, 640, 160, 0.4 * gp);
    });
  } });
  cue(tb15 + 0.1, 'slide', { gain: 0.25 }); cue(tDoc + 0.4, 'whoosh', { gain: 0.25 });

  // b16 · the glowing bundle
  const swirl = memo('swirl', () => Array.from({ length: 14 }, (_, i) => ({ r: 150 + rnd(i) * 160, ph: rnd(i * 3) * TAU, sp: 0.8 + rnd(i * 7) * 0.8 })));
  add({ id: 'b16', at: tb16, cam: [540, 700], zoom: 0.12, note: 'a tied bundle of papers on a shelf starts to glow: rays, leaves swirl, the rest of the shelf dims', draw(lt, d, t) {
    const g = seg(t, tb16 + 0.1, tUn + 0.3), burst = seg(t, tUn, tUn + 0.6);
    stage(t, () => {
      ctx.drawImage(shelfCImg(), 0, 0);
      ctx.fillStyle = `rgba(14,6,2,${0.55 * g})`; fillO(ctx.fillStyle);
      const bx = 540, by = 1.9 * 375, s = 1.25 + 0.12 * eo(burst);
      glowAt(bx, by - 70, 260 + 140 * burst, 0.55 * g + 0.25 * burst * (1 - burst));
      rays(bx, by - 70, 90, 330 + 120 * burst, 14, t * 0.3, 0.22 * g);
      paperBundle(bx, by, s);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowAt(bx, by - 70, 150, 0.35 * g); ctx.restore();
      for (const [i, L0] of swirl.entries()) { if (g <= 0) break; const a = L0.ph + t * L0.sp * 2, rr_ = L0.r * (1 - 0.15 * burst); leafShape(bx + Math.cos(a) * rr_, by - 70 + Math.sin(a) * rr_ * 0.55, a * 2, Math.cos(a * 3 + i), 22 * g); }
      if (burst > 0) for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + 0.3; star(bx + Math.cos(a) * 200 * eo(burst), by - 70 + Math.sin(a) * 140 * eo(burst), 26, 1 - burst); }
    }, { sheen: seg(t, tUn + 0.1, tUn + 1.1) });
  } });
  cue(tb16 + 0.1, 'swell', { gain: 0.45, dur: 2 }); cue(tUn + 0.05, 'sparkle', { gain: 0.55 }); cue(tUn + 0.1, 'bell', { gain: 0.35 });
}
