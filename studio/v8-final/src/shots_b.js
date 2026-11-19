// EPISODE 8 · worker B : "Kalamkari Cloth", lines 5-9 (wars, roads, rest houses, Tamukkam, the grandson grows up)
//   b1  queen under a parasol (top register) sends a register of marching soldiers ("SENT ARMIES")
//   b2  cloth map of the far south: a madder army arrow is stitched from MADURAI to TRAVANCORE, "1697" patch
//   b3  same map, NE: a second stitched arrow to THANJAVUR, "LATER" patch
//   b4  battle register: two files of soldiers clash under banners, "THANJAVUR", "MARATHA RULER" patch; madder dye drips down
//   b5  dye washes out: queen under parasol, a stitched road runs into the distance, trees pop up, "ROADS"
//   b6  map again: the needle stitches the highway north from KANYAKUMARI past MADURAI, avenue trees pop along it
//   b7  swaying cloth: travellers walk the tree-lined road; printed "MANGAMMAL SALAI" on a mustard patch, "TRADITION"
//   b8  a pillared rest house (choultry) draws itself in pen and bleeds its dyes; pilgrims walk up; "REST HOUSES"
//   b9  inside: seated pilgrims served food on leaf plates, water pots below; "SHELTER" then "FOOD"
//   b10 Tamukkam: stylised two-storey arcaded palace pen-drawn + dye bleed, "TAMUKKAM", "ILLUSTRATION" patch
//   b11 cloth unfolds: the palace TODAY, a hanging sign "GANDHI MEMORIAL MUSEUM" drops in
//   b12 three stacked registers: cradle -> child -> youth, "CAME OF AGE"
//   b13 queen and youth either side of the throne, the crown pulled between them, indigo dye creeps in, "POWER"
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { rgba, mixc, cached, blit } from './art.js';

const COT = '#EFE3C8', SHADE = '#E2D2AF', INK = '#1E1611', MAD = '#A8322A', MADD = '#7A1F1A', IND = '#23305E', INDL = '#3D4F8A',
  MUS = '#D9A441', GRN = '#5E7A4E', SKIN = '#E8D3AC', WALL = '#E7C988';

// ───────────── cloth, weave, borders ─────────────
const clothImg = (dark) => cached(dark ? 'b:clothI' : 'b:cloth', 1400, 2400, 0.35, () => {
  ctx.fillStyle = dark ? IND : COT; ctx.fillRect(0, 0, 1400, 2400);
  for (let i = 0; i < 46; i++) {
    const x = rnd(i * 3.7) * 1400, y = rnd(i * 5.3 + 2) * 2400, r = 120 + rnd(i * 1.9) * 260, lt = rnd(i * 7.1) < 0.35;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const c = dark ? (lt ? INDL : '#151D3A') : (lt ? '#F6ECD6' : SHADE);
    g.addColorStop(0, rgba(c, dark ? 0.35 : 0.55)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
});
const cloth = (dark = false) => blit(clothImg(dark), 0, 0, -160, -240);
const weaveTile = () => cached('b:weave', 64, 64, 1, () => {
  for (let y = 0; y < 64; y += 4) { ctx.fillStyle = `rgba(30,22,17,${0.05 + rnd(y) * 0.04})`; ctx.fillRect(0, y, 64, 1.4); }
  for (let x = 0; x < 64; x += 4) { ctx.fillStyle = `rgba(255,250,235,${0.06 + rnd(x + 9) * 0.05})`; ctx.fillRect(x, 0, 1.4, 64); }
  for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(30,22,17,0.08)'; ctx.fillRect(rnd(i * 4.4) * 60, Math.floor(rnd(i * 2.2) * 16) * 4, 6 + rnd(i) * 14, 2); }
});
function weave(a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = ctx.createPattern(weaveTile(), 'repeat'); ctx.fillRect(-160, -240, 1400, 2400); ctx.restore(); }

const bandImg = (kind, h = 56) => cached('b:band:' + kind, 1400, h, 1, () => {
  const fill = { creeper: MAD, tri: MUS, lotus: IND }[kind];
  ctx.fillStyle = fill; ctx.fillRect(0, 0, 1400, h);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'creeper') {
    ctx.strokeStyle = COT; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 0; x <= 1400; x += 4) { const y = h / 2 + Math.sin(x / 80 * TAU) * h * 0.22; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    for (let x = 20; x < 1400; x += 40) {
      const y = h / 2 + Math.sin(x / 80 * TAU) * h * 0.22, up = Math.floor(x / 40) % 2 ? -1 : 1;
      ctx.beginPath(); ctx.ellipse(x + 6, y + up * 11, 9, 5, up * 0.6, 0, TAU); ctx.fillStyle = MUS; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
    }
  } else if (kind === 'tri') {
    for (let x = 0; x < 1400; x += 36) {
      ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x + 36, 6); ctx.lineTo(x + 18, h - 8); ctx.closePath(); ctx.fillStyle = IND; ctx.fill();
      ctx.beginPath(); ctx.arc(x + 36, h - 16, 4, 0, TAU); ctx.fillStyle = MAD; ctx.fill();
    }
  } else {
    for (let x = 0; x < 1400; x += 44) {
      ctx.beginPath(); ctx.arc(x + 22, h - 6, 18, Math.PI, TAU); ctx.strokeStyle = COT; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 22, h - 6, 8, Math.PI, TAU); ctx.fillStyle = MUS; ctx.fill();
      ctx.beginPath(); ctx.arc(x + 44, 12, 3, 0, TAU); ctx.fillStyle = COT; ctx.fill();
    }
  }
  ctx.fillStyle = INK; ctx.fillRect(0, 0, 1400, 4); ctx.fillRect(0, h - 4, 1400, 4);
  ctx.fillStyle = rgba(COT, 0.6); ctx.fillRect(0, 7, 1400, 1.5); ctx.fillRect(0, h - 8.5, 1400, 1.5);
});
const band = (kind, y, h = 56, dx = 0) => blit(bandImg(kind, h), 0, 0, -160 + (((dx % 80) + 80) % 80) - 80, y);

// ───────────── type & patches ─────────────
function big(s, x, y, size, col = INK, off = MAD, a = 1, sc = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * 0.06) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (off) { ctx.fillStyle = off; ctx.fillText(s, size * 0.05, size * 0.05); }
  ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); ctx.letterSpacing = '0px';
}
function patch(label, x, y, k, rot = -0.04, size = 32) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = eob(clamp(k)); ctx.scale(s, s);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * 0.12) + 'px';
  const w = ctx.measureText(label).width + size * 1.3, h = size * 1.9;
  ctx.fillStyle = rgba(INK, 0.25); ctx.fillRect(-w / 2 + 5, -h / 2 + 6, w, h);
  ctx.fillStyle = MUS; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.setLineDash([9, 7]); ctx.strokeStyle = IND; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); ctx.setLineDash([]);
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = IND; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, size * 0.06, size * 0.06);
  ctx.restore(); ctx.letterSpacing = '0px';
}
function label(s, x, y, a = 1, size = 40, col = INK) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); const k = eob(clamp(a)); ctx.scale(k, k);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * 0.08) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.28; ctx.strokeStyle = COT; ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0);
  ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────── paths: pen draw, running stitch, needle ─────────────
function mk(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, len: cum[cum.length - 1] }; }
function at(P, d) {
  d = clamp(d, 0, P.len); let i = 0; while (i < P.pts.length - 2 && P.cum[i + 1] < d) i++;
  const a = P.pts[i], b = P.pts[i + 1], u = (d - P.cum[i]) / ((P.cum[i + 1] - P.cum[i]) || 1);
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, Math.atan2(b[1] - a[1], b[0] - a[0])];
}
function trace(P, d) {
  ctx.beginPath(); ctx.moveTo(P.pts[0][0], P.pts[0][1]); let i = 1;
  for (; i < P.pts.length && P.cum[i] <= d; i++) ctx.lineTo(P.pts[i][0], P.pts[i][1]);
  if (i < P.pts.length) { const q = at(P, d); ctx.lineTo(q[0], q[1]); }
}
const rect = (x0, y0, x1, y1) => mk([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]);
const arcPts = (cx, cy, rx, ry, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const archPts = (cx, bot, w, spring) => [[cx - w / 2, bot], [cx - w / 2, spring], ...arcPts(cx, spring, w / 2, w / 2, Math.PI, TAU, 14), [cx + w / 2, bot]];
function smooth(pts, n = 10) {   // catmull-rom through points
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
  }
  out.push(pts[pts.length - 1]); return out;
}
/** pen-kalam outline: draws the list of paths in order up to progress p; returns the nib position */
function pen(paths, p, lw = 5, col = INK) {
  const tot = paths.reduce((a, P) => a + P.len, 0); let d = p * tot, tip = null;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const P of paths) { if (d <= 0) break; const v = Math.min(d, P.len); trace(P, v); ctx.stroke(); if (v < P.len) tip = at(P, v); d -= P.len; }
  ctx.restore();
  if (tip && p < 1) { ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(-0.6); ctx.fillStyle = MADD; ctx.fillRect(-4, -70, 8, 62); ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(4, -8); ctx.lineTo(0, 2); ctx.closePath(); ctx.fillStyle = INK; ctx.fill(); ctx.restore(); }
  return tip;
}
function stitch(P, p, col = MAD, lw = 6, dash = [16, 11]) {
  const d = p * P.len; if (d <= 1) return null;
  ctx.save(); trace(P, d); ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  return at(P, d);
}
function needle(x, y, ang, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-52, 0); ctx.quadraticCurveTo(-80, 26, -120, 14); ctx.strokeStyle = MAD; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-50, -4.5); ctx.lineTo(-56, 0); ctx.lineTo(-50, 4.5); ctx.closePath(); ctx.fillStyle = '#C9C2B2'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-45, 0, 5, 1.6, 0, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
function arrowHead(P, col = MAD, k = 1) {
  if (k <= 0) return; const e = at(P, P.len), b = at(P, P.len - 30); const a = Math.atan2(e[1] - b[1], e[0] - b[0]);
  ctx.save(); ctx.translate(e[0], e[1]); ctx.rotate(a); ctx.scale(eob(k), eob(k)); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.setLineDash([14, 8]); ctx.beginPath(); ctx.moveTo(-40, -28); ctx.lineTo(0, 0); ctx.lineTo(-40, 28); ctx.stroke(); ctx.restore();
}
/** dye bleed: fill the current clip from (cx, cy) with a soft growing edge */
function bleed(pathFn, cx, cy, r, col, a = 1) {
  if (r <= 0) return; ctx.save(); ctx.globalAlpha *= a; pathFn(); ctx.clip();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2); g.addColorStop(0, col); g.addColorStop(0.78, col); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4); ctx.restore();
}
const polyPath = (pts) => { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); };

// ───────────── transitions ─────────────
function drip(p, col = MAD) {   // dye runs down from the top edge, covering everything at p = 1
  if (p <= 0) return; const N = 20, cw = 1480 / N; ctx.fillStyle = col;
  for (let i = 0; i < N; i++) {
    const x = -200 + i * cw, len = -300 + eio(p) * (H + 900) * (0.85 + 0.4 * rnd(i * 3.1)) - 150 * rnd(i + 7);
    if (len < -300) continue; ctx.fillRect(x - 1, -300, cw + 2, len + 300); ctx.beginPath(); ctx.arc(x + cw / 2, len, cw * 0.58, 0, TAU); ctx.fill();
  }
}
function wash(q, col = MAD) {   // the dye drains downward in streaks: q = 1 fully dyed, 0 clean
  if (q <= 0) return; const N = 20, cw = 1480 / N; ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = 0.35 + 0.65 * q;
  for (let i = 0; i < N; i++) {
    const x = -200 + i * cw, top = -300 + (1 - eio(q)) * (H + 700) * (0.8 + 0.5 * rnd(i * 5.7));
    ctx.fillRect(x - 1, top, cw + 2, H + 400 - top); ctx.beginPath(); ctx.arc(x + cw / 2, top, cw * 0.58, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
/** the cloth unfolds: bottom half swings down from the crease at y = 960 */
function unfold(k, scene) {
  if (k >= 1) { scene(); return; }
  ctx.fillStyle = IND; ctx.fillRect(-300, -300, W + 600, H + 600);
  const yc = 960, e = eo(k);
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, yc + 300); ctx.clip(); scene(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(-300, yc, W + 600, (H + 300 - yc) * e); ctx.clip(); ctx.translate(0, yc); ctx.scale(1, Math.max(0.001, e)); ctx.translate(0, -yc); scene(); ctx.restore();
  ctx.save(); ctx.fillStyle = `rgba(30,22,17,${0.45 * (1 - e)})`; ctx.fillRect(-300, yc, W + 600, (H + 300 - yc) * e);
  const g = ctx.createLinearGradient(0, yc - 30, 0, yc + 40); g.addColorStop(0, 'rgba(30,22,17,0)'); g.addColorStop(0.5, `rgba(30,22,17,${0.35 * (1 - e) + 0.08})`); g.addColorStop(1, 'rgba(30,22,17,0)');
  ctx.fillStyle = g; ctx.fillRect(-300, yc - 30, W + 600, 70); ctx.restore();
}
let swayCv = null;
function sway(t, amp, scene) {
  if (!swayCv) { swayCv = document.createElement('canvas'); swayCv.width = W; swayCv.height = H; }
  const prev = ctx, c2 = swayCv.getContext('2d'); c2.setTransform(1, 0, 0, 1, 0, 0); c2.globalAlpha = 1; setCtx(c2); scene(); setCtx(prev);
  const N = 24, sw = W / N;
  for (let i = 0; i < N; i++) { const ox = Math.sin(t * 1.7 + i * 0.5) * amp * 0.5, oy = Math.sin(t * 1.3 + i * 0.32) * amp; ctx.drawImage(swayCv, i * sw, 0, sw + 1, H, i * sw + ox, oy, sw + 1, H); }
  // fold shading that travels with the ripple
  for (let i = 0; i < N; i++) { const s = Math.cos(t * 1.3 + i * 0.32); ctx.fillStyle = s > 0 ? `rgba(255,248,230,${0.05 * s})` : `rgba(30,22,17,${-0.06 * s})`; ctx.fillRect(i * sw, -300, sw + 1, H + 600); }
}

// ───────────── figures (faceless, kalamkari profile) ─────────────
function ink(fill, lw = 5) { ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke(); }
function shp(pts, fill, lw = 5) { ctx.beginPath(); polyPath(pts); ink(fill, lw); }
function stripes(pts, col, dx = 14, w = 3) { ctx.save(); ctx.beginPath(); polyPath(pts); ctx.clip(); ctx.strokeStyle = col; ctx.lineWidth = w; for (let x = -80; x < 80; x += dx) { ctx.beginPath(); ctx.moveTo(x, -400); ctx.lineTo(x + 30, 20); ctx.stroke(); } ctx.restore(); }
function dots(pts, col, n = 14, seed = 1) { ctx.save(); ctx.beginPath(); polyPath(pts); ctx.clip(); ctx.fillStyle = col; const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(lerp(x0, x1, rnd(i * 3.3 + seed)), lerp(y0, y1, rnd(i * 5.9 + seed)), 3.6, 0, TAU); ctx.fill(); } ctx.restore(); }
function arm(sx, sy, a, len, lw = 5) {
  const hx = sx + Math.sin(a) * len, hy = sy + Math.cos(a) * len;
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.strokeStyle = INK; ctx.lineWidth = 15 + lw; ctx.stroke(); ctx.strokeStyle = SKIN; ctx.lineWidth = 13; ctx.stroke();
  ctx.beginPath(); ctx.arc(hx, hy, 8, 0, TAU); ink(SKIN, 3); return [hx, hy];
}
const PAL = {
  queen: { top: MAD, low: MAD, head: 'crown' }, soldier: { top: IND, low: COT, head: 'turban', tc: MAD }, enemy: { top: GRN, low: COT, head: 'turban', tc: MUS },
  pilgrim: { top: COT, low: GRN, head: 'knot' }, pilgrim2: { top: COT, low: MAD, head: 'knot' }, pilgrim3: { top: COT, low: IND, head: 'knot' },
  youth: { top: MAD, low: MUS, head: 'turban', tc: MUS }, child: { top: MUS, low: MAD, head: 'knot' }, server: { top: COT, low: IND, head: 'knot' },
};
/** standing figure, feet at (x, y), ~320 * s tall, facing right (dir -1 faces left). o: ph walk phase, arm angle, spear, shield, staff, bundle */
function fig(kind, x, y, s, o = {}) {
  const p = PAL[kind], sw = Math.sin(o.ph || 0) * (o.ph == null ? 0 : 1);
  ctx.save(); ctx.translate(x, y + (o.ph != null ? -Math.abs(Math.cos(o.ph)) * 5 : 0)); ctx.scale(s * (o.dir || 1), s); ctx.lineJoin = 'round';
  if (o.shield) { ctx.beginPath(); ctx.arc(-30, -190, 36, 0, TAU); ink(MUS); ctx.beginPath(); ctx.arc(-30, -190, 12, 0, TAU); ink(p.tc || MAD, 3); }
  arm(-6, -240, -0.15 - sw * 0.25, 92);   // back arm
  if (kind === 'queen') {
    const sk = [[-32, -180], [30, -180], [50, -4], [-46, -4]]; shp(sk, MAD); dots(sk, MUS, 16, 2);
    ctx.fillStyle = MUS; ctx.fillRect(-45, -26, 94, 14); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-45, -26, 94, 14);
    for (const fx of [16, 40]) { ctx.beginPath(); ctx.ellipse(fx, -2, 13, 6, 0, 0, TAU); ink(SKIN, 3); }
  } else {
    const lg = (k) => [[-14 + k * 8, -130], [6 + k * 8, -130], [k * sw * 26 + 6, -4], [k * sw * 26 - 10, -4]];
    shp(lg(-1), SKIN, 4); shp(lg(1), SKIN, 4);
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * sw * 26 + 4, -3, 15, 6, 0, 0, TAU); ink(SKIN, 3); }
    const lo = [[-30, -180], [28, -180], [38, -92], [-36, -92]]; shp(lo, p.low); stripes(lo, kind === 'soldier' || kind === 'enemy' ? MAD : INK, 16, 3);
  }
  const to = [[-25, -256], [20, -256], [29, -176], [-30, -176]]; shp(to, p.top);
  if (p.top === COT) { ctx.beginPath(); ctx.moveTo(-22, -254); ctx.lineTo(26, -184); ctx.strokeStyle = p.low; ctx.lineWidth = 9; ctx.stroke(); }
  else stripes(to, kind === 'queen' ? MUS : COT, 18, 3);
  if (kind === 'queen') { ctx.beginPath(); ctx.moveTo(-26, -252); ctx.lineTo(28, -180); ctx.lineTo(10, -180); ctx.lineTo(-26, -232); ctx.closePath(); ink(MUS, 3); }
  ctx.beginPath(); ctx.rect(-4, -270, 14, 18); ink(SKIN, 4);
  ctx.beginPath(); ctx.ellipse(5, -288, 21, 26, 0.1, 0, TAU); ink(SKIN);
  if (p.head === 'crown') {
    ctx.beginPath(); ctx.arc(-17, -294, 12, 0, TAU); ctx.fillStyle = INK; ctx.fill();
    shp([[-14, -304], [-12, -334], [-2, -318], [6, -340], [14, -318], [24, -334], [26, -302]], MUS, 4);
    ctx.beginPath(); ctx.arc(6, -326, 4, 0, TAU); ctx.fillStyle = MAD; ctx.fill();
  } else if (p.head === 'turban') {
    ctx.beginPath(); ctx.ellipse(2, -304, 25, 15, -0.1, Math.PI * 0.9, Math.PI * 2.15); ctx.closePath(); ink(p.tc, 4);
    ctx.beginPath(); ctx.ellipse(-22, -300, 9, 7, 0, 0, TAU); ink(p.tc, 3);
  } else { ctx.beginPath(); ctx.arc(-16, -298, 11, 0, TAU); ctx.fillStyle = INK; ctx.fill(); ctx.beginPath(); ctx.arc(5, -290, 22, Math.PI * 1.05, Math.PI * 1.7); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke(); }
  if (o.bundle) { ctx.beginPath(); ctx.moveTo(-60, -230); ctx.lineTo(30, -262); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); ctx.beginPath(); ctx.ellipse(-54, -214, 22, 18, 0, 0, TAU); ink(MUS, 4); }
  const h = arm(12, -244, o.arm ?? (0.25 + sw * 0.25), o.alen || 96);
  if (o.spear) { ctx.beginPath(); ctx.moveTo(h[0], h[1] + 120); ctx.lineTo(h[0], h[1] - 170); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); shp([[h[0] - 9, h[1] - 168], [h[0], h[1] - 200], [h[0] + 9, h[1] - 168]], MUS, 3); }
  if (o.staff) { ctx.beginPath(); ctx.moveTo(h[0] + 4, h[1] - 60); ctx.lineTo(h[0] + 14, 0); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); }
  if (o.pot) { ctx.save(); ctx.translate(h[0] + 10, h[1] - 6); pot(0, 0, 26, MUS); ctx.restore(); }
  ctx.restore();
}
function figSeat(x, y, s, low, reach = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.ellipse(4, -26, 64, 26, 0, 0, TAU); ink(low); ctx.save(); ctx.clip(); ctx.strokeStyle = INK; ctx.lineWidth = 3; for (let i = -60; i < 70; i += 16) { ctx.beginPath(); ctx.moveTo(i, -60); ctx.lineTo(i + 12, 0); ctx.stroke(); } ctx.restore();
  const to = [[-22, -176], [18, -176], [28, -46], [-28, -46]]; shp(to, COT); ctx.beginPath(); ctx.moveTo(-20, -174); ctx.lineTo(26, -60); ctx.strokeStyle = low; ctx.lineWidth = 9; ctx.stroke();
  ctx.beginPath(); ctx.rect(-4, -190, 14, 18); ink(SKIN, 4);
  ctx.beginPath(); ctx.ellipse(5, -208, 20, 25, 0.1, 0, TAU); ink(SKIN);
  ctx.beginPath(); ctx.arc(-15, -217, 10, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  arm(10, -164, 0.9 + reach * 0.5, 82 - reach * 8);
  ctx.restore();
}
function pot(x, y, r, col, band = MAD) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ink(col, 4);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip(); ctx.fillStyle = band; ctx.fillRect(x - r, y - r * 0.15, r * 2, r * 0.3); ctx.restore();
  ctx.beginPath(); ctx.rect(x - r * 0.4, y - r * 1.15, r * 0.8, r * 0.3); ink(col, 3); ctx.beginPath(); ctx.ellipse(x, y - r * 1.17, r * 0.55, r * 0.14, 0, 0, TAU); ink(col, 3);
}
const treeImg = () => cached('b:tree', 220, 300, 1, () => {
  ctx.lineJoin = 'round'; shp([[100, 292], [122, 292], [117, 160], [105, 160]], MADD, 5);
  const cs = [[111, 118, 66], [58, 150, 44], [164, 150, 44], [111, 64, 50], [70, 92, 38], [152, 92, 38]];
  ctx.fillStyle = INK; for (const [x, y, r] of cs) { ctx.beginPath(); ctx.arc(x, y, r + 5, 0, TAU); ctx.fill(); }
  ctx.fillStyle = GRN; for (const [x, y, r] of cs) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  for (let i = 0; i < 46; i++) { const a = rnd(i * 2.3) * TAU, d = Math.sqrt(rnd(i * 4.1)) * 80, x = 111 + Math.cos(a) * d, y = 108 + Math.sin(a) * d * 0.8;
    ctx.beginPath(); ctx.ellipse(x, y, 7, 3.5, a, 0, TAU); ctx.fillStyle = i % 5 ? rgba(COT, 0.7) : MAD; ctx.fill(); }
});
const tree = (x, y, s, k = 1) => { if (k <= 0) return; const e = eob(clamp(k)); blit(treeImg(), 110, 292, x, y, s * Math.max(0.01, e)); };
const parasolImg = () => cached('b:parasol', 360, 260, 1, () => {
  ctx.lineJoin = 'round'; ctx.beginPath(); ctx.ellipse(180, 200, 140, 92, 0, Math.PI, TAU); ctx.closePath(); ink(MAD, 6);
  ctx.save(); ctx.clip(); ctx.strokeStyle = MUS; ctx.lineWidth = 6; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(180, 108); ctx.lineTo(180 + i * 38, 200); ctx.stroke(); } ctx.restore();
  for (let x = 48; x <= 312; x += 24) { ctx.beginPath(); ctx.arc(x, 204, 12, 0, Math.PI); ctx.closePath(); ink(MUS, 3); }
  ctx.beginPath(); ctx.arc(180, 104, 11, 0, TAU); ink(MUS, 4);
});
function parasol(x, y, s, t) { ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 7 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 420 * s); ctx.stroke(); ctx.restore(); blit(parasolImg(), 180, 200, x + Math.sin(t * 1.4) * 3, y - 400 * s, s); }

// ───────────── the cloth map of the far south ─────────────
const MX = (lon) => 60 + (lon - 74.6) * 165, MY = (lat) => 180 + (13.2 - lat) * 235, MP = (lon, lat) => [MX(lon), MY(lat)];
const PL = { madurai: MP(78.12, 9.92), thanjavur: MP(79.14, 10.79), travancore: MP(77.33, 8.25), kanya: MP(77.54, 8.08) };
const COAST = [[74.75, 13.6], [74.95, 12.8], [75.3, 12.0], [75.75, 11.3], [76.05, 10.8], [76.2, 10.2], [76.3, 9.6], [76.45, 9.1], [76.75, 8.65], [77.1, 8.35], [77.35, 8.18], [77.54, 8.08],
  [77.75, 8.2], [78.05, 8.45], [78.15, 8.8], [78.35, 9.1], [78.9, 9.25], [79.25, 9.28], [78.95, 9.6], [79.1, 9.9], [79.3, 10.25], [79.85, 10.3], [79.85, 10.8], [79.78, 11.4], [79.85, 11.9], [80.1, 12.5], [80.3, 13.0], [80.35, 13.8]].map(([a, b]) => MP(a, b));
const mapImg = () => cached('b:map', 1400, 2400, 1, () => {
  ctx.translate(160, 240);
  ctx.fillStyle = INDL; ctx.fillRect(-160, -240, 1400, 2400);
  // waves
  ctx.strokeStyle = rgba(COT, 0.45); ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let y = -200; y < 2150; y += 46) for (let x = -150 + ((y / 46) % 2) * 40; x < 1250; x += 80) { ctx.beginPath(); ctx.arc(x, y, 14, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  // Sri Lanka (unlabelled)
  ctx.beginPath(); polyPath([[80.0, 9.8], [80.25, 9.6], [80.6, 9.0], [80.9, 8.5], [81.2, 7.6], [79.85, 7.6], [79.85, 8.5], [79.95, 9.2]].map(([a, b]) => MP(a, b))); ink(SHADE, 5);
  // the land
  ctx.beginPath(); polyPath([...COAST, [1300, -260], [-200, -260], [-200, -200], [COAST[0][0], -200]]);
  ctx.fillStyle = COT; ctx.fill();
  ctx.save(); ctx.clip();
  for (let i = 0; i < 30; i++) { const x = rnd(i * 9.1) * 1080, y = rnd(i * 3.7) * 1500, r = 80 + rnd(i) * 200; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(SHADE, 0.7)); g.addColorStop(1, rgba(SHADE, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  // ghats: little stitched hills
  for (let i = 0; i < 26; i++) { const lat = 12.6 - i * 0.17, lon = 75.95 + (12.6 - lat) * 0.27 + (i % 2) * 0.12, [x, y] = MP(lon, lat);
    ctx.beginPath(); ctx.moveTo(x - 26, y + 14); ctx.lineTo(x, y - 20); ctx.lineTo(x + 26, y + 14); ctx.closePath(); ctx.fillStyle = GRN; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); }
  // rivers (Kaveri, Vaigai)
  for (const r of [[[76.0, 12.4], [76.9, 12.1], [77.7, 11.9], [78.2, 11.3], [78.7, 10.85], [79.2, 10.95], [79.85, 11.05]], [[77.3, 9.95], [77.8, 9.95], [78.12, 9.92], [78.5, 9.7], [78.9, 9.38]]]) {
    const P = mk(smooth(r.map(([a, b]) => MP(a, b)), 8)); trace(P, P.len); ctx.strokeStyle = INDL; ctx.lineWidth = 7; ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(COAST[0][0], COAST[0][1]); for (const p of COAST) ctx.lineTo(p[0], p[1]); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.setLineDash([12, 9]); ctx.strokeStyle = MAD; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(COAST[0][0] - 12, COAST[0][1]); for (const p of COAST) ctx.lineTo(p[0] - 12, p[1]); ctx.stroke(); ctx.setLineDash([]);
});
function town(p, k = 1, r = 15) { if (k <= 0) return; const e = eob(clamp(k)); ctx.beginPath(); ctx.arc(p[0], p[1], r * e, 0, TAU); ink(MAD, 5); ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.4 * e, 0, TAU); ctx.fillStyle = COT; ctx.fill(); }
function mapBase(t) {
  blit(mapImg(), 0, 0, -160, -240);
  band('tri', -40, 56, t * 20);
}
const P_TRAV = mk(smooth([PL.madurai, [560, 1060], [470, 1200], [PL.travancore[0] - 6, PL.travancore[1] - 30]], 14));
const P_THAN = mk(smooth([PL.madurai, [700, 900], [770, 820], [PL.thanjavur[0] - 10, PL.thanjavur[1] + 20]], 12));
function marchers(P, d, n, s, t) { for (let i = 0; i < n; i++) { const q = at(P, d - 40 - i * 46); if (d - 40 - i * 46 < 0) continue; fig('soldier', q[0], q[1] + 10, s, { ph: t * 9 + i, spear: 1, dir: Math.cos(q[2]) >= 0 ? 1 : -1 }); } }

// ───────────── Tamukkam (stylised, not a reconstruction) ─────────────
let PAL_G = null;
function palaceGeom() {
  if (PAL_G) return PAL_G;
  const lines = [], ope = [];
  lines.push(rect(110, 1180, 970, 1240), mk([[470, 1240], [470, 1270], [610, 1270], [610, 1240]]));
  lines.push(rect(140, 900, 940, 1180));
  for (let i = 0; i < 7; i++) { const cx = 140 + (i + 0.5) * 800 / 7, w = i === 3 ? 92 : 74, a = archPts(cx, 1180, w, i === 3 ? 990 : 1012); ope.push(a); lines.push(mk(a)); }
  lines.push(rect(118, 880, 962, 902));
  lines.push(rect(190, 660, 890, 880));
  for (let i = 0; i < 7; i++) { const cx = 190 + (i + 0.5) * 100, a = archPts(cx, 880, 58, 772); ope.push(a); lines.push(mk(a)); }
  const par = [[175, 660]]; for (let x = 175; x < 905; x += 36.5) par.push(...arcPts(x + 18.25, 630, 18.25, 14, Math.PI, TAU, 6)); par.push([905, 630], [905, 660], [175, 660]);
  lines.push(rect(175, 630, 905, 660), mk(par.slice(1, -2)));
  const kiosks = [];
  for (const [cx, hw, top, dr] of [[215, 30, 560, 36], [865, 30, 560, 36], [540, 70, 540, 72]]) {
    lines.push(mk([[cx - hw, 630], [cx - hw, top]]), mk([[cx + hw, 630], [cx + hw, top]]), rect(cx - hw - 14, top - 12, cx + hw + 14, top));
    const dome = [[cx - dr, top - 12], ...arcPts(cx, top - 12, dr, dr * 1.1, Math.PI, TAU, 16)]; lines.push(mk(dome), mk([[cx, top - 12 - dr * 1.1], [cx, top - 40 - dr * 1.1]]));
    kiosks.push({ cx, hw, top, dr, dome });
  }
  PAL_G = { lines, ope, kiosks }; return PAL_G;
}
function palace(pp, fp) {
  const G = palaceGeom();
  if (fp > 0) {
    bleed(() => { ctx.beginPath(); ctx.rect(140, 900, 800, 280); ctx.rect(190, 660, 700, 220); }, 540, 900, fp * 640, WALL);
    bleed(() => { ctx.beginPath(); ctx.rect(110, 1180, 860, 60); ctx.rect(118, 880, 844, 22); ctx.rect(175, 630, 730, 30); }, 540, 1000, (fp - 0.2) * 800, MAD);
    bleed(() => { ctx.beginPath(); for (const k of G.kiosks) polyPath(k.dome); }, 540, 500, (fp - 0.3) * 700, MUS);
    bleed(() => { ctx.beginPath(); for (const a of G.ope) polyPath(a); }, 540, 980, (fp - 0.35) * 700, IND);
    if (fp > 0.6) { ctx.save(); ctx.globalAlpha = clamp((fp - 0.6) / 0.3); ctx.fillStyle = MUS;   // dotted frieze
      for (let x = 160; x < 930; x += 26) { ctx.beginPath(); ctx.arc(x, 891, 4, 0, TAU); ctx.fill(); } for (let x = 190; x < 900; x += 26) { ctx.beginPath(); ctx.arc(x, 645, 4, 0, TAU); ctx.fill(); }
      ctx.restore(); }
  }
  pen(G.lines, pp, 6);
}
const palaceFull = () => cached('b:palace', 1080, 1300, 1, () => palace(1, 1));

// ───────────── the choultry (rest house) ─────────────
let CH_G = null;
function choultryGeom() {
  if (CH_G) return CH_G;
  const lines = [rect(120, 860, 960, 900), rect(140, 822, 940, 860)];
  const pil = [190, 330, 470, 610, 750, 890];
  for (const x of pil) lines.push(rect(x - 17, 920, x + 17, 1130), mk([[x - 32, 900], [x + 32, 900], [x + 18, 920], [x - 18, 920], [x - 32, 900]]), rect(x - 24, 1130, x + 24, 1150));
  lines.push(rect(150, 1150, 930, 1210), mk([[470, 1210], [470, 1235], [610, 1235], [610, 1210]]), mk([[450, 1235], [450, 1258], [630, 1258], [630, 1235]]));
  for (const x of [200, 540, 880]) lines.push(mk([[x - 18, 822], ...arcPts(x, 822, 18, 22, Math.PI, TAU, 10), [x + 18, 822]]), mk([[x, 800], [x, 784]]));
  CH_G = { lines, pil }; return CH_G;
}
function choultry(pp, fp) {
  const G = choultryGeom();
  if (fp > 0) {
    bleed(() => { ctx.beginPath(); ctx.rect(150, 900, 780, 250); }, 540, 1020, fp * 600, INDL, 0.55);
    bleed(() => { ctx.beginPath(); ctx.rect(120, 860, 840, 40); ctx.rect(150, 1150, 780, 60); }, 540, 900, (fp - 0.15) * 700, MAD);
    bleed(() => { ctx.beginPath(); ctx.rect(140, 822, 800, 38); for (const x of [200, 540, 880]) { ctx.moveTo(x + 18, 822); ctx.ellipse(x, 822, 18, 22, 0, 0, Math.PI, true); } }, 540, 830, (fp - 0.25) * 700, MUS);
    bleed(() => { ctx.beginPath(); for (const x of G.pil) { ctx.rect(x - 17, 920, 34, 210); ctx.rect(x - 24, 1130, 48, 20); } }, 540, 1100, (fp - 0.3) * 800, COT);
    if (fp > 0.5) { ctx.save(); ctx.globalAlpha = clamp((fp - 0.5) / 0.3); ctx.fillStyle = MUS; for (const x of G.pil) for (let y = 950; y < 1120; y += 34) { ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); } ctx.restore(); }
  }
  pen(G.lines, pp, 5);
}

// ───────────── throne, crown, cradle ─────────────
function throne(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-90, -120); ctx.lineTo(-90, -300); ctx.quadraticCurveTo(0, -380, 90, -300); ctx.lineTo(90, -120); ctx.closePath(); ink(MUS, 6);
  ctx.beginPath(); ctx.moveTo(-60, -140); ctx.lineTo(-60, -280); ctx.quadraticCurveTo(0, -335, 60, -280); ctx.lineTo(60, -140); ctx.closePath(); ink(MAD, 4); dots([[-60, -140], [-60, -280], [60, -280], [60, -140]], MUS, 12, 4);
  shp([[-120, -130], [120, -130], [110, -90], [-110, -90]], MUS, 6);
  shp([[-112, -150], [112, -150], [120, -128], [-120, -128]], MAD, 5);
  for (const lx of [-100, 70]) shp([[lx, -90], [lx + 30, -90], [lx + 26, 0], [lx + 4, 0]], MADD, 5);
  ctx.restore();
}
function crown(x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineJoin = 'round';
  shp([[-50, 20], [-56, -30], [-30, -8], [-16, -46], [0, -14], [16, -46], [30, -8], [56, -30], [50, 20]], MUS, 6);
  ctx.fillStyle = MAD; for (const cx of [-28, 0, 28]) { ctx.beginPath(); ctx.arc(cx, 8, 6, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function cradle(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-160, -250); ctx.lineTo(160, -250); ctx.stroke();
  const a = Math.sin(t * 3) * 0.12; ctx.translate(0, -250); ctx.rotate(a);
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-100, 170); ctx.moveTo(90, 0); ctx.lineTo(100, 170); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(18, 166, 24, 20, 0, 0, TAU); ink(SKIN, 4);
  ctx.beginPath(); ctx.arc(2, 160, 9, 0, TAU); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-130, 160); ctx.quadraticCurveTo(0, 260, 130, 160); ctx.lineTo(110, 170); ctx.lineTo(-110, 170); ctx.closePath(); ink(MUS, 6);
  ctx.beginPath(); ctx.moveTo(-120, 172); ctx.quadraticCurveTo(0, 248, 120, 172); ctx.strokeStyle = MAD; ctx.lineWidth = 8; ctx.stroke();
  ctx.restore();
}

// ════════════════════════════════════════ the shots ════════════════════════════════════════
export function buildB(add, cue) {
  const t1 = L(5), t2 = Wd('travancore', 5), t3 = Wd('and', 5), t4 = Wd('thanjavur', 5), t5 = L(6), t6 = Wd('the', 6), t7 = Wd('mangammal', 6),
    t8 = L(7), t9 = Wd('shelter', 7), t10 = L(8), t11 = Wd('today', 8), t12 = L(9), t13 = Wd('accounts', 9), tEnd = L(10);

  // b1 · queen sends armies (two registers, camera glides down)
  add({ id: 'b1', at: t1, cam: [540, 1150], zoom: 0.07, note: 'queen under parasol sends a register of marching soldiers, "SENT ARMIES"',
    draw: (lt, d) => {
      cloth();
      band('lotus', 350, 56, lt * 30);
      parasol(330, 900, 1.0, lt); fig('queen', 300, 900, 1.25, { arm: lerp(0.3, 1.45, eo(seg(lt, 0.15, 0.7))) });
      tree(820, 890, 0.9, seg(lt, 0.3, 0.8)); tree(960, 890, 0.7, seg(lt, 0.45, 0.95));
      band('creeper', 910, 56, -lt * 40);
      for (let i = 0; i < 6; i++) { const x = -160 + i * 190 + lt * 150; fig('soldier', x, 1400, 1.15, { ph: lt * 8 + i * 1.3, spear: 1, shield: 1 }); }
      band('tri', 1415, 56, lt * 40);
      big('SENT', 540, 140, 100, INK, MAD, seg(lt, 0.15, 0.4), lerp(1.2, 1, eo(seg(lt, 0.15, 0.4))));
      big('ARMIES', 540, 255, 140, MAD, INK, seg(lt, 0.9, 1.15), lerp(1.3, 1, eo(seg(lt, 0.9, 1.15))));
      weave();
    } });
  cue(t1, 'whoosh', { gain: 0.5 }); cue(t1 + 0.9, 'drum', { gain: 0.5 }); cue(t1 + 1.4, 'drum', { gain: 0.45 }); cue(t1 + 1.9, 'drum', { gain: 0.4 });

  // b2 · map: Madurai -> Travancore, 1697
  const k2 = Wd('sixteen', 5);
  add({ id: 'b2', at: t2, cam: [560, 1050], zoom: 0.08, note: 'cloth map of the far south, madder army arrow stitched Madurai -> TRAVANCORE, "1697" patch',
    draw: (lt, d) => {
      mapBase(lt); const p = eio(seg(lt, 0.15, 1.6)), q = stitch(P_TRAV, p, MAD, 8);
      town(PL.madurai, seg(lt, 0, 0.3), 17); label('MADURAI', PL.madurai[0] + 40, PL.madurai[1] - 50, seg(lt, 0.05, 0.35), 40);
      marchers(P_TRAV, p * P_TRAV.len, 3, 0.2, lt);
      if (q && p < 1) needle(q[0], q[1], q[2], 1);
      arrowHead(P_TRAV, MAD, seg(lt, 1.6, 1.85)); town(PL.travancore, seg(lt, 1.55, 1.8), 13);
      label('TRAVANCORE', 290, 1225, seg(lt, 0.1, 0.45), 46, MADD);
      patch('1697', 290, 1315, seg(lt, k2 - t2, k2 - t2 + 0.3), -0.06, 40);
      weave();
    } });
  cue(t2, 'slide', { gain: 0.4 }); cue(t2 + 0.15, 'zip', { gain: 0.35, dur: 1.4 }); cue(k2, 'pop', { gain: 0.6 }); cue(t2 + 1.6, 'tock', { gain: 0.5 });

  // b3 · map: later, Thanjavur
  add({ id: 'b3', at: t3, cam: [720, 860], zoom: 0.1, note: 'same map: a second stitched arrow from Madurai NE to THANJAVUR, "LATER" patch',
    draw: (lt, d) => {
      mapBase(lt + 3); stitch(P_TRAV, 1, MAD, 8); arrowHead(P_TRAV, MAD, 1); town(PL.travancore, 1, 13);
      const p = eio(seg(lt, 0.25, 1.5)), q = stitch(P_THAN, p, MAD, 8);
      town(PL.madurai, 1, 17); label('MADURAI', PL.madurai[0] - 10, PL.madurai[1] + 55, 1, 40);
      marchers(P_THAN, p * P_THAN.len, 2, 0.2, lt);
      if (q && p < 1) needle(q[0], q[1], q[2], 1);
      arrowHead(P_THAN, MAD, seg(lt, 1.5, 1.75)); town(PL.thanjavur, seg(lt, 1.45, 1.7), 15);
      label('THANJAVUR', 820, 670, seg(lt, 1.3, 1.6), 46, MADD);
      patch('LATER', 420, 760, seg(lt, 0.15, 0.45), 0.05, 40);
      weave();
    } });
  cue(t3, 'whoosh', { gain: 0.35 }); cue(t3 + 0.2, 'pop', { gain: 0.5 }); cue(t3 + 0.25, 'zip', { gain: 0.35, dur: 1.2 }); cue(t3 + 1.5, 'tock', { gain: 0.5 });

  // b4 · the clash register + madder dye drip
  add({ id: 'b4', at: t4, cam: [540, 950], zoom: 0.07, note: 'battle register: two files of soldiers clash under banners, "THANJAVUR", "MARATHA RULER" patch; madder dye drips down',
    draw: (lt, d) => {
      cloth(); band('creeper', 500, 56, lt * 30); band('creeper', 1360, 56, -lt * 30);
      const adv = eo(seg(lt, 0, 0.8)) * 120, jolt = lt > 0.8 ? Math.sin((lt - 0.8) * 30) * 6 * Math.exp(-(lt - 0.8) * 3) : 0;
      // banners
      for (const [x, col, dir] of [[150 + adv, MAD, 1], [930 - adv, MUS, -1]]) {
        ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, 1330); ctx.lineTo(x, 640); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, 650); ctx.quadraticCurveTo(x + dir * 90, 640 + Math.sin(lt * 6) * 14, x + dir * 170, 670); ctx.lineTo(x + dir * 150, 720); ctx.quadraticCurveTo(x + dir * 80, 730 + Math.sin(lt * 6 + 1) * 14, x, 740); ctx.closePath(); ink(col); ctx.restore();
      }
      for (let i = 0; i < 3; i++) fig('soldier', 120 + i * 110 + adv + jolt, 1330, 1.2, { ph: lt < 0.8 ? lt * 9 + i : null, spear: 1, shield: 1, arm: lt > 0.7 ? 1.3 : null });
      for (let i = 0; i < 3; i++) fig('enemy', 960 - i * 110 - adv - jolt, 1330, 1.2, { ph: lt < 0.8 ? lt * 9 + i : null, spear: 1, shield: 1, dir: -1, arm: lt > 0.7 ? 1.3 : null });
      // stitched starburst at the clash
      const k = seg(lt, 0.75, 1.1); if (k > 0) { ctx.save(); ctx.translate(540, 980); ctx.rotate(lt * 0.4); ctx.strokeStyle = MAD; ctx.lineWidth = 7; ctx.setLineDash([12, 8]); ctx.lineCap = 'round';
        for (let i = 0; i < 12; i++) { const a = i * TAU / 12, r = 160 * eob(k) * (i % 2 ? 0.6 : 1); ctx.beginPath(); ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); } ctx.restore(); }
      big('THANJAVUR', 540, 250, 120, INK, MAD, seg(lt, 0, 0.25), lerp(1.25, 1, eo(seg(lt, 0, 0.25))));
      patch('MARATHA RULER', 540, 400, seg(lt, 0.3, 0.6), -0.03, 34);
      weave();
      drip(seg(lt, d - 0.6, d), MAD);
    } });
  cue(t4, 'rumble', { gain: 0.45, dur: 1.0 }); cue(t4 + 0.78, 'slam', { gain: 0.6 }); cue(t4 + 0.35, 'pop', { gain: 0.4 }); cue(t5 - 0.55, 'plop', { gain: 0.45 });

  // b5 · roads: wash-out, queen, a stitched road into the distance
  const P_ROAD = [mk(smooth([[430, 1500], [560, 1150], [640, 900], [700, 720]], 12)), mk(smooth([[1150, 1500], [920, 1150], [790, 900], [730, 720]], 12)), mk(smooth([[800, 1500], [740, 1150], [715, 900], [715, 720]], 12))];
  add({ id: 'b5', at: t5, cam: [640, 900], zoom: 0.08, note: 'madder dye washes out; queen under parasol beside a stitched road running into the distance, trees pop up, "ROADS"',
    draw: (lt, d) => {
      cloth(); band('lotus', 640, 56, lt * 20);
      ctx.fillStyle = rgba(GRN, 0.22); ctx.fillRect(-200, 700, 1500, 900);
      const p = eio(seg(lt, 0.15, 1.5));
      ctx.save(); ctx.beginPath(); ctx.moveTo(430, 1500); ctx.lineTo(1150, 1500); ctx.lineTo(730, 720); ctx.lineTo(700, 720); ctx.closePath(); ctx.fillStyle = rgba(MUS, 0.35 * p); ctx.fill(); ctx.restore();
      stitch(P_ROAD[0], p, INK, 6); stitch(P_ROAD[1], p, INK, 6); const q = stitch(P_ROAD[2], p, MAD, 7, [22, 16]);
      for (let i = 0; i < 6; i++) { const u = 1 - i / 6, y = lerp(1450, 760, i / 6), sc = lerp(0.95, 0.25, i / 6), k = seg(p, i / 6 - 0.05, i / 6 + 0.12);
        tree(lerp(330, 680, i / 6) - 40 * u, y, sc, k); tree(lerp(1180, 760, i / 6) + 40 * u, y, sc, k); }
      if (q && p < 1) needle(q[0], q[1], q[2], 1.1);
      parasol(200, 1330, 0.95, lt); fig('queen', 175, 1330, 1.15, { arm: lerp(0.5, 1.5, eo(seg(lt, 0.3, 0.9))) });
      big('ROADS', 540, 330, 190, INK, MAD, seg(lt, 0.25, 0.55), lerp(1.3, 1, eo(seg(lt, 0.25, 0.55))));
      weave();
      wash(1 - seg(lt, 0, 0.55), MAD);
    } });
  cue(t5, 'whoosh', { gain: 0.45 }); cue(t5 + 0.2, 'zip', { gain: 0.35, dur: 1.2 }); cue(Wd('roads', 6), 'thud', { gain: 0.5 });

  // b6 · map: the highway from Kanyakumari, stitched north with avenue trees
  const P_HW = mk(smooth([[PL.kanya[0], PL.kanya[1] - 12], MP(77.7, 8.73), MP(77.87, 9.17), MP(77.98, 9.55), [PL.madurai[0] - 6, PL.madurai[1] + 8], MP(78.4, 10.4), MP(78.7, 10.8), MP(78.8, 11.5)], 14));
  const tKan = Wd('kanyakumari', 6);
  add({ id: 'b6', at: t6, cam: [540, 900], zoom: 0.05, note: 'map close-up: needle stitches the old highway north from KANYAKUMARI past MADURAI, avenue trees pop along it',
    draw: (lt, d) => {
      const p = eio(seg(lt, 0.1, d - 0.2)), q0 = at(P_HW, p * P_HW.len);
      const cx = lerp(560, 660, eio(seg(lt, 0, d))), cy = lerp(1230, 950, eio(seg(lt, 0, d)));
      ctx.save(); ctx.translate(540, 820); ctx.scale(1.35, 1.35); ctx.translate(-cx, -cy);
      mapBase(lt);
      ctx.save(); ctx.strokeStyle = rgba(MUS, 0.9); ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; trace(P_HW, p * P_HW.len); ctx.stroke(); ctx.restore();
      const q = stitch(P_HW, p, MAD, 7);
      const nT = Math.floor(P_HW.len / 52);
      for (let i = 1; i < nT; i++) { const dd = i * 52, a = at(P_HW, dd), side = i % 2 ? 1 : -1, nx = -Math.sin(a[2]) * side * 30, ny = Math.cos(a[2]) * side * 30; tree(a[0] + nx, a[1] + ny + 12, 0.17, (p * P_HW.len - dd) / 60); }
      town(PL.kanya, seg(lt, 0, 0.3), 14); town(PL.madurai, seg(p, 0.45, 0.55), 15);
      if (q && p < 1) needle(q[0], q[1], q[2], 0.8);
      label('KANYAKUMARI', PL.kanya[0] + 150, PL.kanya[1] + 6, seg(lt, tKan - t6, tKan - t6 + 0.3), 34, MADD);
      label('MADURAI', PL.madurai[0] + 110, PL.madurai[1], seg(p, 0.5, 0.62), 32);
      ctx.restore();
      label('THE OLD HIGHWAY', 540, 210, seg(lt, 0.1, 0.4), 80, INK);
      weave();
    } });
  cue(t6, 'slide', { gain: 0.4 }); cue(t6 + 0.1, 'zip', { gain: 0.3, dur: 2.6 }); cue(tKan, 'pop', { gain: 0.55 }); cue(t6 + 1.6, 'sparkle', { gain: 0.3 });

  // b7 · Mangammal Salai: swaying cloth, travellers on the tree-lined road
  add({ id: 'b7', at: t7, cam: [540, 820], zoom: 0.06, note: 'swaying cloth: pilgrims walk a tree-lined stitched road; printed "MANGAMMAL SALAI" on a mustard patch, "ONCE CALLED"',
    draw: (lt, d) => {
      cloth();
      sway(lt, 5, () => {
        cloth(); band('tri', 560, 56, -lt * 40);
        const pan = -lt * 90;
        for (let i = -1; i < 9; i++) tree(((i * 170 + pan) % 1530 + 1530) % 1530 - 200, 1080, 0.95, 1);
        ctx.fillStyle = rgba(MUS, 0.55); ctx.fillRect(-200, 1080, 1500, 150);
        ctx.save(); ctx.setLineDash([22, 14]); ctx.lineDashOffset = -pan; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-200, 1082); ctx.lineTo(1300, 1082); ctx.moveTo(-200, 1228); ctx.lineTo(1300, 1228); ctx.stroke();
        ctx.strokeStyle = MAD; ctx.beginPath(); ctx.moveTo(-200, 1155); ctx.lineTo(1300, 1155); ctx.stroke(); ctx.restore();
        const walk = lt * 70;
        fig('pilgrim', 180 + walk, 1215, 0.95, { ph: lt * 7, staff: 1 }); fig('pilgrim2', 380 + walk, 1210, 0.9, { ph: lt * 7 + 2, bundle: 1 }); fig('pilgrim3', 640 + walk, 1215, 0.95, { ph: lt * 7 + 4, staff: 1 });
        // milestone
        const mx = 900 + pan * 0.6; ctx.beginPath(); ctx.moveTo(mx - 26, 1240); ctx.lineTo(mx - 26, 1150); ctx.arc(mx, 1150, 26, Math.PI, TAU); ctx.lineTo(mx + 26, 1240); ctx.closePath(); ink(SHADE, 5);
        band('creeper', 1300, 56, lt * 30);
        // the printed name
        const k = seg(lt, 0.05, 0.4);
        if (k > 0) { ctx.save(); ctx.translate(540, 360); const s = eob(k); ctx.scale(s, s); ctx.rotate(-0.02);
          ctx.fillStyle = rgba(INK, 0.25); ctx.fillRect(-470 + 8, -150 + 10, 940, 300); ctx.fillStyle = MUS; ctx.fillRect(-470, -150, 940, 300);
          ctx.setLineDash([12, 9]); ctx.strokeStyle = IND; ctx.lineWidth = 4; ctx.strokeRect(-456, -136, 912, 272); ctx.setLineDash([]); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-470, -150, 940, 300);
          ctx.restore();
          big('MANGAMMAL', 540, 300, 118, IND, null, k, eob(k)); big('SALAI', 540, 425, 118, IND, null, seg(lt, 0.55, 0.8), lerp(1.3, 1, eo(seg(lt, 0.55, 0.8)))); }
        patch('ONCE CALLED', 540, 160, seg(lt, 0.0, 0.3), -0.05, 30);
      });
      weave();
    } });
  cue(t7, 'slam', { gain: 0.45 }); cue(t7 + 0.6, 'pop', { gain: 0.4 }); cue(t7 + 0.1, 'swell', { gain: 0.25, dur: 1.5 });

  // b8 · the rest house draws itself
  add({ id: 'b8', at: t8, cam: [540, 1000], zoom: 0.07, note: 'pillared choultry (rest house) pen-draws itself and bleeds madder/mustard dyes; pilgrims walk up; "REST HOUSES"',
    draw: (lt, d) => {
      cloth(); band('lotus', 520, 56, lt * 30);
      ctx.fillStyle = rgba(GRN, 0.3); ctx.fillRect(-200, 1258, 1500, 200); band('creeper', 1440, 50, -lt * 30);
      tree(70, 1260, 0.9, seg(lt, 1.0, 1.4)); tree(1010, 1260, 0.9, seg(lt, 1.1, 1.5));
      choultry(eio(seg(lt, 0.05, 1.2)), eo(seg(lt, 0.7, 1.9)));
      const w = lt * 110; fig('pilgrim', -40 + w, 1400, 0.72, { ph: lt * 7, staff: 1 }); fig('pilgrim2', -190 + w, 1400, 0.68, { ph: lt * 7 + 2, bundle: 1 });
      fig('pilgrim3', 1140 - w * 0.9, 1400, 0.72, { ph: lt * 7 + 1, staff: 1, dir: -1 });
      big('REST HOUSES', 540, 330, 110, INK, MAD, seg(lt, 0.3, 0.6), lerp(1.25, 1, eo(seg(lt, 0.3, 0.6))));
      weave();
    } });
  cue(t8, 'whoosh', { gain: 0.4 }); cue(t8 + 0.05, 'chisel', { gain: 0.25, dur: 1.1 }); cue(Wd('rest', 7), 'bell', { gain: 0.4 });

  // b9 · shelter and food
  const tFood = Wd('food', 7);
  add({ id: 'b9', at: t9, cam: [540, 980], zoom: 0.07, note: 'inside the rest house: seated pilgrims served rice on leaf plates by a server with a pot, water pots below; "SHELTER" -> "FOOD"',
    draw: (lt, d) => {
      cloth();
      ctx.fillStyle = rgba(INDL, 0.18); ctx.fillRect(110, 540, 860, 720);
      // pillars + beam frame (shelter)
      for (const x of [110, 970]) { ctx.beginPath(); ctx.rect(x - 24, 560, 48, 700); ink(COT, 5); ctx.fillStyle = MUS; for (let y = 600; y < 1240; y += 40) { ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill(); } }
      ctx.beginPath(); ctx.rect(60, 500, 960, 60); ink(MAD, 6); band('tri', 444, 56, lt * 30);
      ctx.fillStyle = rgba(MUS, 0.4); ctx.fillRect(86, 1240, 908, 30); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(86, 1240, 908, 30);
      const ser = Math.sin(lt * 5);
      for (let i = 0; i < 3; i++) {
        const x = 230 + i * 190, served = seg(lt, 0.2 + i * 0.35, 0.5 + i * 0.35);
        ctx.beginPath(); ctx.ellipse(x + 92, 1228, 52, 13, 0, 0, TAU); ink(GRN, 4);
        if (served > 0) { ctx.fillStyle = COT; for (let k = 0; k < 9 * served; k++) { ctx.beginPath(); ctx.arc(x + 70 + rnd(k + i * 9) * 44, 1222 - rnd(k * 2 + i) * 10, 6, 0, TAU); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); } }
        figSeat(x, 1238, 1.0, [GRN, MAD, IND][i], served > 0.9 ? 0.5 + 0.5 * Math.sin(lt * 6 + i) : 0);
      }
      const sx = lerp(900, 840, eo(seg(lt, 0, 0.5)));
      fig('server', sx, 1238, 1.0, { dir: -1, arm: 1.1 + ser * 0.2, pot: 1 });
      for (let k = 0; k < 3; k++) { const ph = (lt * 0.8 + k / 3) % 1; ctx.beginPath(); for (let y = 0; y < 60; y += 6) { const xx = sx - 120 + Math.sin(y * 0.15 + lt * 4 + k) * 8 + k * 14; y ? ctx.lineTo(xx, 1060 - ph * 80 - y) : ctx.moveTo(xx, 1060 - ph * 80 - y); } ctx.strokeStyle = rgba(INK, 0.5 * (1 - ph)); ctx.lineWidth = 3; ctx.stroke(); }
      for (let i = 0; i < 6; i++) { const x = 190 + i * 140, k = seg(lt, 0.1 + i * 0.08, 0.4 + i * 0.08); if (k > 0) { ctx.save(); ctx.translate(x, 1395); ctx.scale(eob(k), eob(k)); pot(0, 0, 38, i % 2 ? MUS : MAD, i % 2 ? MAD : MUS); ctx.restore(); } }
      const fT = tFood - t9;
      big('SHELTER', 540, 260, 130, INK, MAD, seg(lt, 0, 0.2) * (1 - seg(lt, fT - 0.25, fT)), 1);
      big('FOOD', 540, 260, 170, MAD, INK, seg(lt, fT, fT + 0.2), lerp(1.4, 1, eo(seg(lt, fT, fT + 0.25))));
      weave();
    } });
  cue(t9, 'slide', { gain: 0.35 }); cue(t9 + 0.3, 'bubbles', { gain: 0.3, dur: 1.2 }); cue(tFood, 'pop', { gain: 0.55 });

  // b10 · Tamukkam, pen + dye
  const tTam = Wd('tamukkam', 8);
  add({ id: 'b10', at: t10, cam: [540, 900], zoom: 0.07, note: 'Tamukkam: stylised two-storey arcaded palace pen-drawn then dye bleed, "TAMUKKAM", "ILLUSTRATION" patch',
    draw: (lt, d) => {
      cloth(); band('creeper', 1290, 56, lt * 20);
      ctx.fillStyle = rgba(GRN, 0.3); ctx.fillRect(-200, 1240, 1500, 50);
      tree(60, 1250, 1.0, seg(lt, 1.0, 1.4)); tree(1020, 1250, 1.0, seg(lt, 1.1, 1.5));
      palace(eio(seg(lt, 0, 1.4)), eo(seg(lt, 0.7, 2.2)));
      big('TAMUKKAM', 540, 300, 136, INK, MAD, seg(lt, tTam - t10, tTam - t10 + 0.25), lerp(1.3, 1, eo(seg(lt, tTam - t10, tTam - t10 + 0.25))));
      ctx.save(); ctx.globalAlpha = seg(lt, 0.1, 0.4); ctx.font = '700 64px Caladea, serif'; ctx.textAlign = 'center'; ctx.fillStyle = MADD; ctx.fillText('her summer palace', 540, 190); ctx.restore();
      patch('ILLUSTRATION', 780, 1390, seg(lt, 0.4, 0.7), -0.04, 28);
      weave();
    } });
  cue(t10, 'whoosh', { gain: 0.4 }); cue(t10 + 0.05, 'chisel', { gain: 0.25, dur: 1.9 }); cue(tTam, 'thud', { gain: 0.5 }); cue(t10 + 1.3, 'swell', { gain: 0.3, dur: 1.6 });

  // b11 · today: unfold, the sign drops in
  const tG = Wd('gandhi', 8);
  add({ id: 'b11', at: t11, cam: [540, 860], zoom: 0.09, note: 'cloth unfolds to the palace TODAY; a hanging mustard sign "GANDHI MEMORIAL MUSEUM" drops in (no portrait)',
    draw: (lt, d) => {
      const scene = () => {
        cloth(); band('tri', 1290, 56, lt * 20); ctx.fillStyle = rgba(GRN, 0.3); ctx.fillRect(-200, 1240, 1500, 50);
        tree(60, 1250, 1.0, 1); tree(1020, 1250, 1.0, 1);
        blit(palaceFull(), 0, 0, 0, 0);
        const k = seg(lt, tG - t11, tG - t11 + 0.5), y = lerp(-260, 0, eob(k));
        if (k > 0) {
          ctx.save(); ctx.translate(540, 1030 + y); ctx.rotate(Math.sin(lt * 3) * 0.02 * (1 - k * 0.5));
          ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-300, -120); ctx.lineTo(-300, -260); ctx.moveTo(300, -120); ctx.lineTo(300, -260); ctx.stroke();
          ctx.fillStyle = rgba(INK, 0.3); ctx.fillRect(-370 + 8, -120 + 10, 740, 230); ctx.fillStyle = MUS; ctx.fillRect(-370, -120, 740, 230);
          ctx.setLineDash([12, 9]); ctx.strokeStyle = IND; ctx.lineWidth = 4; ctx.strokeRect(-356, -106, 712, 202); ctx.setLineDash([]); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-370, -120, 740, 230);
          ctx.restore();
          big('GANDHI MEMORIAL', 540, 975 + y, 64, IND, null, 1, 1);
          big('MUSEUM', 540, 1060 + y, 80, IND, null, 1, 1);
        }
        big('TODAY', 540, 280, 150, IND, MUS, 1, 1);
        patch('STILL STANDS', 540, 410, 1, 0.03, 28);
      };
      unfold(seg(lt, 0, 0.45), scene);
      // a mustard 'TODAY' glow ribbon behind the word is in the scene; weave over all
      weave();
    } });
  cue(t11, 'slide', { gain: 0.45 }); cue(t11 + 0.4, 'thud', { gain: 0.35 }); cue(tG + 0.3, 'tock', { gain: 0.5 }); cue(tG, 'whoosh', { gain: 0.3 });

  // b12 · the grandson grows: three registers
  add({ id: 'b12', at: t12, cam: [540, 900], zoom: 0.06, note: 'three stacked registers time-lapse: baby in a swing cradle -> small child -> youth with turban, "CAME OF AGE"',
    draw: (lt, d) => {
      cloth();
      const regs = [[400, 740], [780, 1080], [1120, 1440]];
      regs.forEach(([y0, y1], i) => {
        const k = seg(lt, i * 0.3, i * 0.3 + 0.3); if (k <= 0) return;
        ctx.save(); ctx.beginPath(); ctx.rect(-200, y0, 1500, (y1 - y0) * eo(k)); ctx.clip();
        ctx.fillStyle = [rgba(MUS, 0.18), rgba(GRN, 0.16), rgba(MAD, 0.14)][i]; ctx.fillRect(-200, y0, 1500, y1 - y0);
        if (i === 0) { cradle(540, y1 - 30, 0.95, lt); }
        if (i === 1) { fig('child', 470 + lt * 30, y1 - 18, 0.75, { ph: lt * 6 }); tree(760, y1 - 20, 0.6, 1); }
        if (i === 2) { fig('youth', 520 + lt * 20, y1 - 16, 0.9, { arm: 0.4 + Math.sin(lt * 2) * 0.1 }); tree(260, y1 - 20, 0.7, 1); tree(820, y1 - 20, 0.7, 1); }
        ctx.restore();
        band(i === 1 ? 'tri' : 'creeper', y0 - 40, 40, lt * (i % 2 ? 30 : -30));
      });
      band('lotus', 1440, 40, lt * 30);
      // tally of years stitched in the margin
      ctx.save(); ctx.strokeStyle = MAD; ctx.lineWidth = 5; ctx.lineCap = 'round'; const n = Math.floor(clamp((lt - 0.3) / 1.2) * 15);
      for (let j = 0; j < n; j++) { const x = 70 + (j % 5) * 14 + Math.floor(j / 5) * 0, y = 820 + Math.floor(j / 5) * 70; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 44); ctx.stroke(); } ctx.restore();
      big('THE GRANDSON', 540, 250, 100, INK, MAD, seg(lt, 0, 0.2) * (1 - seg(lt, 0.8, 0.95)), 1);
      big('CAME OF AGE', 540, 250, 110, MAD, INK, seg(lt, 0.95, 1.15), lerp(1.3, 1, eo(seg(lt, 0.95, 1.15))));
      weave();
    } });
  cue(t12, 'whoosh', { gain: 0.4 }); cue(t12 + 0.45, 'tock', { gain: 0.45 }); cue(t12 + 0.9, 'tock', { gain: 0.45 }); cue(Wd('age', 9), 'sparkle', { gain: 0.35 });

  // b13 · the crown pulled between them, indigo creeping
  const tP = Wd('power', 9), tNot = Wd('not', 9);
  add({ id: 'b13', at: t13, cam: [540, 950], zoom: 0.1, note: 'queen and youth either side of the throne, the crown pulled between them, indigo dye creeps in from the edges, "ACCOUNTS SAY" patch, "POWER"',
    draw: (lt, d) => {
      cloth(); band('creeper', 1380, 56, lt * 20);
      ctx.fillStyle = rgba(MUS, 0.25); ctx.fillRect(-200, 1330, 1500, 50);
      throne(540, 1340, 1.15);
      const pull = seg(lt, tNot - t13, tP - t13 + 0.2), wob = Math.sin(lt * 7) * 14 * pull, cxr = 540 - 40 * eio(pull) + wob;
      const cy = 880 + Math.sin(lt * 2.2) * 6;
      // the two figures reach for the crown
      fig('queen', 300, 1340, 1.3, { arm: 2.3 + Math.sin(lt * 7) * 0.04 * pull, alen: 150 - 30 * eio(pull) });
      fig('youth', 790, 1340, 1.3, { dir: -1, arm: 2.3 - Math.sin(lt * 7) * 0.04 * pull, alen: 150 + 30 * eio(pull) });
      // tension cord across the crown
      crown(cxr, cy, 1.3, Math.sin(lt * 7) * 0.12 * pull);
      // indigo dye creeps in from the edges
      const cr = seg(lt, 0.2, d); if (cr > 0) {
        const r0 = lerp(1150, 470, eio(cr)), g = ctx.createRadialGradient(540, 900, r0 * 0.75, 540, 900, r0 * 1.15);
        g.addColorStop(0, rgba(IND, 0)); g.addColorStop(0.55, rgba(IND, 0.75)); g.addColorStop(1, rgba(IND, 0.96)); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
        ctx.fillStyle = rgba(IND, 0.9); for (let i = 0; i < 16; i++) { const a = i * TAU / 16 + 0.2, rr2 = r0 * (1.05 + 0.12 * rnd(i)), rad = 60 + 80 * rnd(i * 3); ctx.beginPath(); ctx.arc(540 + Math.cos(a) * rr2, 900 + Math.sin(a) * rr2 * 1.3, rad, 0, TAU); ctx.fill(); }
      }
      patch('ACCOUNTS SAY', 540, 200, seg(lt, 0.05, 0.35), -0.04, 32);
      big('POWER', 540, 400, 170, MAD, INK, seg(lt, tP - t13, tP - t13 + 0.2), lerp(1.4, 1, eo(seg(lt, tP - t13, tP - t13 + 0.25))));
      weave();
    } });
  // build every cached texture now (at boot) so no frame pays the one-time cost
  clothImg(false); weaveTile(); treeImg(); parasolImg(); mapImg(); palaceFull(); ['creeper', 'tri', 'lotus'].forEach((k) => bandImg(k)); bandImg('creeper', 40); bandImg('tri', 40); bandImg('lotus', 40); bandImg('creeper', 50);
  cue(t13, 'heartbeat', { gain: 0.45 }); cue(tNot, 'rumble', { gain: 0.4, dur: 1.4 }); cue(t13 + 1.0, 'heartbeat', { gain: 0.45 }); cue(tP, 'slam', { gain: 0.55 });
}
