// EPISODE 8 · worker A : "Kalamkari Cloth", lines 0-4 (hook, name, 1689, sati, regent, Mughal tribute)
//   a1  cloth unrolls; crowned faceless queen under a parasol pen-draws herself, dye bleeds in; MADURAI printed; "15 YEARS" patch; indigo dye drips down
//   a2  indigo night cloth: a closed arched door pen-draws in cream, a "?" is stitched over it, light under the door; "UNCERTAIN" patch; cloth folds
//   a3  cloth unfolds: queen under parasol in the top register, MANGAMMAL outlined then dyed madder letter by letter between borders
//   a4  camera glides down the same cloth (gentle sway) to the register below: gopuram + two Nayak pavilions draw themselves; "MADURAI NAYAK KINGDOM" patch
//   a5  sun and moon cross the top register; "AROUND" patch; 1689 printed big; a running-stitch timeline 1600-1700 with a knot at 1689
//   a6  the young king stands under a torana arch, then his dyes wash out and run down; "DIED YOUNG" patch
//   a7  indigo cloth: a cream outline of the widow beside a brass lamp; gently dissolves into rising petals; "ACCOUNTS SAY" patch (no fire, no body)
//   a8  indigo washes away: a hanging cradle pen-draws and swings; "THE HEIR" patch
//   a9  the queen seated on a throne under her parasol pen-draws beside the cradle; REGENT printed
//   a10 family register: queen, her faded son, the cradle; a madder stitch arcs from queen to baby; "GRANDSON" patch; cloth folds
//   a11 cloth map of the south: rows of stitched Mughal horsemen with pennants advance from the north; MUGHAL ARMY; stitched arrows "south"
//   a12 a stitched route from Madurai north, a tray of gifts travels up it, the army halts; TRIBUTE printed; "NOT WAR" patch
import { ctx, setCtx, W, H, TAU, clamp, lerp, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { rgba, mixc, cached, blit } from './art.js';

const CT = '#EFE3C8', CTS = '#E2D2AF', INK = '#1E1611', MAD = '#A8322A', MADD = '#7A1F1A', IND = '#23305E', INDL = '#3D4F8A', MUS = '#D9A441', GRN = '#5E7A4E';
const IND_D = '#18213F', PI = Math.PI;

// ───────────── geometry: shapes are point lists so the pen can measure and draw them ─────────────
const E = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 30) => { const r = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; r.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return r; };
const B = (p0, c1, c2, p1, n = 14) => { const r = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; r.push([v * v * v * p0[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p1[0], v * v * v * p0[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p1[1]]); } return r; };
const cat = (...parts) => [].concat(...parts);
const R = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const MV = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
/** a limb/rod as a closed polygon around a centre line */
function tube(pts, w0, w1 = w0) {
  const l = [], r = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const w = lerp(w0, w1, n > 1 ? i / (n - 1) : 0) / 2; l.push([pts[i][0] - ty * w, pts[i][1] + tx * w]); r.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  return l.concat(r.reverse());
}
const plen = (p, closed) => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (closed) s += Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]); return s; };
function walk(p, d) { // point + angle at distance d along an open polyline
  for (let i = 1; i < p.length; i++) { const sl = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (d <= sl || i === p.length - 1) { const k = clamp(d / (sl || 1)); return [lerp(p[i - 1][0], p[i][0], k), lerp(p[i - 1][1], p[i][1], k), Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])]; } d -= sl; }
  return [p[0][0], p[0][1], 0];
}
const trace = (p, closed) => { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); if (closed) ctx.closePath(); };

/** a figure = list of {p, f (fill), pat, w, open}. Drawn back to front; the pen draws outlines in the same order. */
function mkFig(S) {
  let tot = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const s of S) { s.closed = !s.open; s.len = plen(s.p, s.closed); tot += s.len; for (const [x, y] of s.p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } }
  return { S, tot, bb: [x0 - 12, y0 - 12, x1 + 12, y1 + 12] };
}
// small repeat tiles for the garment prints
const TILES = {
  dc: [22, 22, (c) => { c.fillStyle = CT; for (const [x, y] of [[5.5, 5.5], [16.5, 16.5]]) { c.beginPath(); c.arc(x, y, 2.4, 0, TAU); c.fill(); } }],
  di: [22, 22, (c) => { c.fillStyle = rgba(INK, 0.75); for (const [x, y] of [[5.5, 5.5], [16.5, 16.5]]) { c.beginPath(); c.arc(x, y, 2.2, 0, TAU); c.fill(); } }],
  dm: [20, 20, (c) => { c.fillStyle = MAD; for (const [x, y] of [[5, 5], [15, 15]]) { c.beginPath(); c.arc(x, y, 2.6, 0, TAU); c.fill(); } }],
  sm: [20, 16, (c) => { c.fillStyle = MAD; c.fillRect(0, 0, 20, 5); c.fillStyle = rgba(INK, 0.5); c.fillRect(0, 9, 20, 1.5); }],
  st: [20, 12, (c) => { c.fillStyle = rgba(INK, 0.45); c.fillRect(0, 0, 20, 2.5); }],
};
const tile = (k) => cached('a:t:' + k, TILES[k][0], TILES[k][1], 1, () => TILES[k][2](ctx));
const pat = (k) => ctx.createPattern(tile(k), 'repeat');

function pen(x, y, s = 1) { // the kalam: a slim bamboo pen at the drawing tip
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(40, -96); ctx.stroke();
  ctx.strokeStyle = mixc(MUS, INK, 0.25); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(40, -96); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(9, -22, 7, 9, 0.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, TAU); ctx.fill(); ctx.restore();
}
/** draw a figure. o: draw 0..1 (pen outline reveal), bleed 0..1 (dye spreads from org), fillA, ink, inkA, rot, pen */
function drawFig(F, x, y, s, o = {}) {
  const draw = o.draw ?? 1, bleed = o.bleed ?? 1, fa = o.fillA ?? 1, ink = o.ink ?? INK, ia = o.inkA ?? 1, org = o.org || [0, -400], Rr = o.R ?? 800;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const base = ctx.globalAlpha;
  if (bleed > 0 && fa > 0) for (const sh of F.S) {
    if (!sh.f) continue; trace(sh.p, true);
    ctx.globalAlpha = base * fa;
    if (bleed >= 1) ctx.fillStyle = sh.f;
    else { const g = ctx.createRadialGradient(org[0], org[1], 0, org[0], org[1], Rr * bleed + 1); g.addColorStop(0, sh.f); g.addColorStop(0.72, sh.f); g.addColorStop(1, rgba(sh.f, 0)); ctx.fillStyle = g; }
    ctx.fill();
    if (sh.pat) { ctx.globalAlpha = base * fa * clamp(bleed * 1.6 - 0.6); if (ctx.globalAlpha > 0) { ctx.fillStyle = pat(sh.pat); ctx.fill(); } }
  }
  let tip = null;
  if (draw > 0 && ia > 0) {
    ctx.globalAlpha = base * ia; ctx.strokeStyle = ink; let b = draw * F.tot;
    for (const sh of F.S) {
      if (b <= 0) break; const k = draw >= 1 ? 1 : Math.min(1, b / sh.len); ctx.lineWidth = sh.w ?? 5; trace(sh.p, sh.closed);
      if (k < 1) { ctx.setLineDash([k * sh.len, sh.len + 20]); tip = walk(sh.closed ? sh.p.concat([sh.p[0]]) : sh.p, k * sh.len); }
      ctx.stroke(); ctx.setLineDash([]); b -= sh.len;
    }
  }
  ctx.globalAlpha = base;
  if (tip && o.pen !== false) pen(tip[0], tip[1], 1.4 / s);
  ctx.restore();
}
/** fully dyed static figure from a cache (cheap) */
function figImg(key, F, o = {}) { const [x0, y0, x1, y1] = F.bb; return cached('a:fig:' + key, x1 - x0, y1 - y0, 1, () => { ctx.translate(-x0, -y0); drawFig(F, 0, 0, 1, o); }); }
const blitFig = (key, F, x, y, s, a = 1, o = {}) => blit(figImg(key, F, o), -F.bb[0], -F.bb[1], x, y, s, a);

// ───────────── the figures (all faceless, profile, facing right; feet at 0,0) ─────────────
function parasol(cx, by) {
  const fr = []; for (let k = 0; k < 10; k++) fr.push(...E(cx + 180 - k * 40, by + 2, 20, 20, 0, PI, 8));
  return [
    { p: tube([[cx, by - 130], [cx, by + 60]], 10), f: MADD },
    { p: cat([[cx + 200, by - 8]], fr, [[cx - 200, by - 8]]), f: MAD, pat: 'dc', w: 4 },
    { p: cat(B([cx - 200, by], [cx - 190, by - 92], [cx - 92, by - 132], [cx, by - 132]), B([cx, by - 132], [cx + 92, by - 132], [cx + 190, by - 92], [cx + 200, by]).slice(1), B([cx + 200, by], [cx + 100, by + 14], [cx - 100, by + 14], [cx - 200, by]).slice(1)), f: MUS, pat: 'sm' },
    { p: E(cx, by - 146, 13, 15), f: MUS },
    { p: [[cx, by - 196], [cx - 12, by - 172], [cx, by - 160], [cx + 12, by - 172]], f: MAD, w: 4 },
    { p: [[cx - 200, by + 2], [cx - 206, by + 58]], open: true, w: 4 }, { p: E(cx - 206, by + 64, 7, 9), f: MAD, w: 3 },
    { p: [[cx + 200, by + 2], [cx + 206, by + 58]], open: true, w: 4 }, { p: E(cx + 206, by + 64, 7, 9), f: MAD, w: 3 },
  ];
}
function womanBack(dx, dy) {
  return [
    { p: MV(E(-40, -528, 22, 22), dx, dy), f: INK },
    { p: MV([[-48, -468], [-30, -472], [-66, -330], [-84, -276], [-104, -286], [-90, -340]], dx, dy), f: MUS, pat: 'sm' },
  ];
}
function womanFront(dx, dy, crown, arm) {
  const T = (p) => MV(p, dx, dy);
  const S = [
    { p: T(cat([[-60, -330], [56, -334]], B([56, -334], [64, -380], [70, -428], [44, -468]), [[-20, -480]], B([-48, -468], [-64, -430], [-64, -380], [-60, -330]))), f: GRN, pat: 'dc' },
    { p: T(tube([[-64, -332], [60, -336]], 14)), f: MUS },
    { p: T([[28, -474], [52, -460], [-34, -336], [-60, -342]]), f: MUS, pat: 'sm' },
    { p: T(B([-22, -474], [-10, -432], [20, -432], [38, -466])), open: true, w: 3 },
    { p: T([[-14, -502], [14, -502], [16, -470], [-16, -470]]), f: CTS },
    { p: T(E(4, -540, 38, 46)), f: CTS },
    { p: T(E(4, -540, 39, 47, 0.6 * PI, 1.55 * PI, 20)), f: INK },
    { p: T(E(-10, -500, 6, 9)), f: MUS, w: 3 },
  ];
  if (crown) S.push(
    { p: T([[-30, -580], [36, -580], [34, -602], [22, -614], [14, -648], [6, -680], [-2, -648], [-12, -614], [-26, -602]]), f: MUS, pat: 'dm' },
    { p: T(tube([[-34, -582], [40, -582]], 12)), f: MAD });
  if (arm === 'lotus') S.push(
    { p: T(tube(B([30, -462], [46, -430], [54, -400], [52, -382], 8), 26, 20)), f: CTS },
    { p: T(tube([[52, -384], [80, -396], [112, -408]], 20, 16)), f: CTS },
    { p: T(E(102, -404, 5, 11)), f: MUS, w: 3 },
    { p: T(E(118, -410, 13, 11)), f: CTS },
    { p: T([[118, -418], [120, -452]]), open: true, w: 4 },
    { p: T([[118, -452], [94, -466], [86, -492], [110, -478]]), f: MUS, w: 4 },
    { p: T([[122, -452], [146, -466], [154, -492], [130, -478]]), f: MUS, w: 4 },
    { p: T([[120, -452], [107, -482], [120, -516], [133, -482]]), f: MAD, w: 4 });
  else if (arm === 'reach') S.push(
    { p: T(tube(B([30, -462], [48, -430], [60, -400], [66, -384], 8), 26, 20)), f: CTS },
    { p: T(tube([[66, -386], [100, -390], [132, -396]], 20, 16)), f: CTS },
    { p: T(E(112, -392, 5, 11)), f: MUS, w: 3 },
    { p: T(E(140, -397, 13, 10)), f: CTS });
  else S.push(
    { p: T(tube(B([30, -462], [42, -420], [44, -380], [40, -340], 8), 24, 18)), f: CTS },
    { p: T(E(40, -330, 12, 12)), f: CTS });
  return S;
}
const standingSkirt = () => [
  { p: cat([[-62, -330], [58, -335]], B([58, -335], [75, -200], [100, -80], [125, -22]), B([-110, -22], [-90, -120], [-70, -250], [-62, -330])), f: MAD, pat: 'dc' },
  { p: [[18, -322], [44, -66]], open: true, w: 3 }, { p: [[-4, -322], [8, -66]], open: true, w: 3 },
  { p: [[-114, -62], [114, -62], [125, -22], [-110, -22]], f: MUS, pat: 'di' },
  { p: E(140, -12, 26, 9), f: CTS, w: 4 },
];
let _F = {};
const QS = () => _F.qs || (_F.qs = mkFig([...parasol(-4, -720), ...womanBack(0, 0), ...standingSkirt(), ...womanFront(0, 0, true, 'lotus')]));
const WOMAN = () => _F.wo || (_F.wo = mkFig([...womanBack(0, 0), ...standingSkirt(), ...womanFront(0, 0, false, 'down')]));
const QSEAT = () => _F.qt || (_F.qt = mkFig([
  ...parasol(4, -600),
  { p: cat([[-128, -150], [-100, -150], [-92, -440]], E(-112, -440, 22, 26, 0, -PI, 10)), f: MADD, pat: 'dc' },
  { p: E(-82, -214, 18, 46), f: IND, pat: 'dc' },
  ...womanBack(0, 120),
  { p: R(-112, -150, 214, 22), f: MUS, pat: 'di' },
  { p: R(-100, -128, 16, 128), f: MADD }, { p: R(80, -128, 16, 128), f: MADD },
  { p: [[-72, -212], [60, -216], [104, -206], [122, -178], [128, -22], [72, -22], [70, -150], [-72, -150]], f: MAD, pat: 'dc' },
  { p: [[70, -60], [126, -60], [128, -22], [72, -22]], f: MUS, pat: 'di' },
  { p: E(118, -12, 28, 9), f: CTS, w: 4 },
  ...womanFront(0, 120, true, 'reach'),
]));
const KING = () => _F.k || (_F.k = mkFig([
  { p: tube([[-40, -330], [-70, -240], [-96, -150]], 16, 12), f: MADD },
  { p: tube([[-14, -130], [-18, -14]], 28, 22), f: CTS }, { p: tube([[34, -130], [44, -14]], 28, 22), f: CTS },
  { p: E(-6, -10, 24, 8), f: CTS, w: 4 }, { p: E(58, -10, 24, 8), f: CTS, w: 4 },
  { p: cat([[-60, -334], [58, -338]], B([58, -338], [70, -260], [80, -180], [84, -118]), B([-66, -118], [-66, -200], [-62, -280], [-60, -334])), f: MUS, pat: 'sm' },
  { p: tube([[20, -330], [30, -118]], 30, 42), f: MAD, pat: 'dc' },
  { p: cat([[-62, -334], [56, -338]], B([56, -338], [66, -390], [68, -440], [50, -470]), B([-50, -472], [-68, -430], [-66, -380], [-62, -334])), f: CTS },
  { p: [[30, -474], [54, -462], [-40, -336], [-62, -344]], f: MAD, pat: 'dc' },
  { p: tube([[-64, -336], [60, -340]], 16), f: MAD },
  { p: B([-24, -470], [-12, -426], [24, -426], [40, -462]), open: true, w: 3 }, { p: E(10, -432, 8, 10), f: MUS, w: 3 },
  { p: [[-14, -490], [14, -490], [16, -466], [-16, -466]], f: CTS },
  { p: E(4, -522, 36, 42), f: CTS },
  { p: E(4, -522, 37, 43, 0.72 * PI, 1.3 * PI, 12), f: INK },
  { p: [[-32, -552], [40, -552], [34, -610], [22, -664], [8, -704], [-6, -662], [-24, -610]], f: IND, pat: 'dc' },
  { p: tube([[-36, -554], [42, -554]], 14), f: MUS },
  { p: tube(B([30, -462], [46, -420], [52, -380], [56, -346], 8), 26, 20), f: CTS },
  { p: E(44, -420, 13, 6), f: MUS, w: 3 }, { p: E(60, -338, 12, 12), f: CTS },
]));
const CRADLE = () => _F.c || (_F.c = mkFig([
  { p: tube(B([-170, -26], [-90, 6], [90, 6], [170, -26], 16), 16), f: MADD },
  { p: tube([[-96, -10], [-84, -80]], 16), f: MADD }, { p: tube([[96, -10], [84, -80]], 16), f: MADD },
  { p: E(-24, -182, 110, 30), f: IND, pat: 'dc' },
  { p: E(100, -214, 30, 28), f: CTS }, { p: E(100, -214, 31, 29, 0.72 * PI, 1.62 * PI, 14), f: INK },
  { p: cat([[-160, -170], [160, -170]], B([160, -170], [130, -56], [-130, -56], [-160, -170])), f: MAD, pat: 'dc' },
  { p: tube([[-166, -170], [166, -170]], 12), f: MUS },
  { p: E(-176, -186, 19, 19), f: MUS, pat: 'dm' }, { p: E(176, -186, 19, 19), f: MUS, pat: 'dm' },
  { p: B([-120, -120], [-60, -90], [60, -90], [120, -120]), open: true, w: 3 },
]));
const LAMP = () => _F.l || (_F.l = mkFig([
  { p: cat(B([-80, 0], [-80, -30], [-40, -46], [0, -48]), B([0, -48], [40, -46], [80, -30], [80, 0]).slice(1)), f: MUS, pat: 'di' },
  { p: tube([[0, -46], [0, -272]], 18), f: MUS },
  { p: E(0, -120, 22, 8), f: MAD, w: 4 }, { p: E(0, -200, 20, 7), f: MAD, w: 4 },
  { p: cat(B([-92, -276], [-62, -232], [62, -232], [92, -276]), [[-92, -276]]), f: MUS, pat: 'dm' },
  { p: E(0, -278, 92, 12), f: MUS, w: 4 },
  { p: tube([[0, -284], [0, -340]], 10), f: MUS },
  { p: [[0, -392], [-22, -354], [0, -338], [22, -354]], f: MAD },
]));
function gopuram() {
  const S = [{ p: R(-200, -230, 400, 230), f: MUS, pat: 'di' }, { p: cat([[-44, 0], [-44, -130]], E(0, -130, 44, 54, PI, TAU, 12), [[44, 0]]), f: IND }];
  let y = -230;
  for (let i = 0; i < 5; i++) {
    const w = 380 - i * 58, w2 = w - 34, h = 78 - i * 5;
    S.push({ p: [[-w / 2, y], [w / 2, y], [w2 / 2, y - h], [-w2 / 2, y - h]], f: i % 2 ? MAD : MUS, pat: i % 2 ? 'dc' : 'dm' });
    for (let k = -1; k <= 1; k++) S.push({ p: cat([[k * w * 0.28 - 9, y - 6]], E(k * w * 0.28, y - h * 0.62, 9, 12, PI, TAU, 6), [[k * w * 0.28 + 9, y - 6]]), open: true, w: 3 });
    S.push({ p: tube([[-w2 / 2 - 6, y - h], [w2 / 2 + 6, y - h]], 9), f: MADD, w: 3 });
    y -= h + 4;
  }
  S.push({ p: cat(E(0, y, 84, 70, PI, TAU, 18), [[-84, y]]), f: MAD, pat: 'dc' });
  for (let k = -2; k <= 2; k++) S.push({ p: E(k * 30, y - 70 + Math.abs(k) * 16, 8, 12), f: MUS, w: 3 });
  return mkFig(S);
}
function pavilion() {
  const S = [{ p: R(-130, -250, 260, 250), f: CT, pat: 'di' }];
  for (const ax of [-78, 0, 78]) S.push({ p: cat([[ax - 28, 0], [ax - 28, -130]], E(ax, -130, 28, 40, PI, TAU, 10), [[ax + 28, 0]]), f: IND });
  S.push({ p: tube([[-150, -256], [150, -256]], 18), f: MAD });
  S.push({ p: cat(E(0, -264, 92, 110, PI, TAU, 22), [[-92, -264]]), f: MUS, pat: 'dm' });
  S.push({ p: [[0, -420], [-14, -386], [0, -372], [14, -386]], f: MAD, w: 4 });
  for (const sx of [-1, 1]) S.push({ p: cat(E(sx * 128, -270, 26, 34, PI, TAU, 10), [[sx * 128 - 26, -270]]), f: MAD, w: 4 });
  return mkFig(S);
}
const CROWN = () => _F.cr || (_F.cr = mkFig([
  { p: [[-46, 0], [46, 0], [44, -30], [28, -46], [18, -92], [6, -132], [-6, -92], [-16, -46], [-34, -30]], f: MUS, pat: 'dm' },
  { p: tube([[-50, -2], [50, -2]], 14), f: MAD }, { p: E(6, -142, 7, 9), f: MAD, w: 3 },
]));
const GOP = () => _F.g || (_F.g = gopuram());
const PAV = () => _F.p || (_F.p = pavilion());
const DOOR = () => _F.d || (_F.d = mkFig([
  { p: cat([[300, 1250], [300, 560]], E(540, 560, 240, 262, PI, TAU, 26), [[780, 1250]]), f: IND_D, w: 6 },
  { p: cat([[342, 1250], [342, 580]], E(540, 580, 198, 222, PI, TAU, 26), [[738, 1250]]), f: INDL, pat: 'dc', w: 5 },
  { p: [[540, 358], [540, 1250]], open: true, w: 5 },
  { p: R(372, 700, 138, 210), w: 3 }, { p: R(570, 700, 138, 210), w: 3 }, { p: R(372, 1000, 138, 220), w: 3 }, { p: R(570, 1000, 138, 220), w: 3 },
  { p: tube([[410, 958], [670, 958]], 28), f: MUS },
  { p: R(514, 942, 52, 66), f: MAD, w: 4 }, { p: E(540, 942, 16, 20, PI, TAU, 10), open: true, w: 5 },
  { p: R(262, 1250, 556, 34), f: MADD },
]));

// ───────────── the cloth: background, weave, borders, print, patches, stitches, dye ─────────────
const bgImg = (k) => cached('a:bg:' + k, W + 160, H + 160, 0.5, () => {
  const night = k === 'i', base = night ? IND : CT;
  ctx.fillStyle = base; ctx.fillRect(0, 0, W + 160, H + 160);
  for (let i = 0; i < 70; i++) {
    const x = rnd(i * 3.1 + (night ? 7 : 0)) * (W + 160), y = rnd(i * 5.7 + 2) * (H + 160), r = 80 + rnd(i * 9.3) * 260;
    const c = night ? (rnd(i) < 0.5 ? IND_D : INDL) : (rnd(i) < 0.7 ? CTS : '#D7C39B');
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(c, 0.18 + rnd(i * 2.2) * 0.25)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 90; i++) { ctx.fillStyle = rgba(night ? CT : INK, 0.025 + rnd(i * 4.4) * 0.03); ctx.fillRect(0, rnd(i * 6.1) * (H + 160), W + 160, 1 + rnd(i) * 3); }
  const g = ctx.createRadialGradient(W / 2 + 80, H / 2, 500, W / 2 + 80, H / 2, 1300); g.addColorStop(0, 'rgba(30,22,17,0)'); g.addColorStop(1, `rgba(30,22,17,${night ? 0.45 : 0.22})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W + 160, H + 160);
});
const bg = (k = 'c') => blit(bgImg(k), 0, 0, -80, -80);
const weaveTile = () => cached('a:weave', 96, 96, 1, () => {
  for (let x = 0; x < 96; x += 3) { ctx.fillStyle = `rgba(30,22,17,${0.03 + rnd(x * 1.7) * 0.05})`; ctx.fillRect(x, 0, 1, 96); }
  for (let y = 0; y < 96; y += 3) { ctx.fillStyle = `rgba(255,248,230,${0.03 + rnd(y * 2.3) * 0.05})`; ctx.fillRect(0, y, 96, 1); }
  for (let i = 0; i < 10; i++) { ctx.fillStyle = `rgba(30,22,17,${0.05 + rnd(i * 8.1) * 0.05})`; ctx.fillRect(rnd(i * 3.3) * 90, rnd(i * 4.9) * 96, 8 + rnd(i) * 14, 2); }
});
function weave() { ctx.save(); ctx.fillStyle = ctx.createPattern(weaveTile(), 'repeat'); ctx.fillRect(-200, -200, W + 400, H + 400); ctx.restore(); }

const BANDS = {
  creeper: () => {
    ctx.fillStyle = MAD; ctx.fillRect(0, 8, 1200, 48);
    ctx.strokeStyle = CT; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= 1200; x += 4) { const y = 32 + Math.sin(x / 80 * TAU) * 12; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    for (let x = 20; x < 1200; x += 80) {
      ctx.save(); ctx.translate(x, 20); ctx.rotate(-0.5); ctx.beginPath(); ctx.ellipse(0, 0, 11, 6, 0, 0, TAU); ctx.fillStyle = GRN; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(x + 40, 44, 6, 0, TAU); ctx.fillStyle = MUS; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    }
  },
  lotus: () => {
    ctx.fillStyle = CTS; ctx.fillRect(0, 8, 1200, 48);
    for (let x = 30; x < 1200; x += 60) for (const [a, c] of [[-0.9, MUS], [0.9, MUS], [0, MAD]]) {
      ctx.save(); ctx.translate(x, 50); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-12, -20, 0, -38); ctx.quadraticCurveTo(12, -20, 0, 0); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
    }
  },
  tri: () => {
    ctx.fillStyle = CT; ctx.fillRect(0, 8, 1200, 48);
    for (let x = 0, i = 0; x < 1200; x += 40, i++) { ctx.beginPath(); if (i % 2) { ctx.moveTo(x, 8); ctx.lineTo(x + 40, 8); ctx.lineTo(x + 20, 56); } else { ctx.moveTo(x, 56); ctx.lineTo(x + 40, 56); ctx.lineTo(x + 20, 8); } ctx.closePath(); ctx.fillStyle = i % 2 ? IND : MAD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); }
  },
};
const bandImg = (k) => cached('a:band:' + k, 1200, 64, 1, () => {
  BANDS[k]();
  ctx.fillStyle = INK; ctx.fillRect(0, 2, 1200, 5); ctx.fillRect(0, 57, 1200, 5); ctx.fillRect(0, 11, 1200, 1.5); ctx.fillRect(0, 52, 1200, 1.5);
});
/** an ornamental border band centred on y; p = reveal left to right */
function band(k, y, p = 1, x = 540) {
  if (p <= 0) return; ctx.save(); if (p < 1) { ctx.beginPath(); ctx.rect(x - 600, y - 40, 1200 * eio(p), 80); ctx.clip(); } blit(bandImg(k), 600, 32, x, y); ctx.restore();
}

/** big printed word: pen outlines letter by letter, then dye bleeds into each letter, with a mis-registered second colour */
function printWord(s, x, y, size, o = {}) {
  const col = o.col ?? INK, off = o.off ?? MAD, pOut = o.pOut ?? 1, pFill = o.pFill ?? 1, ls = o.ls ?? 0.07, outCol = o.outCol ?? INK;
  if (pOut <= 0 && pFill <= 0) return;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '0px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  const ch = [...s], ws = ch.map((c) => ctx.measureText(c).width), sp = size * ls, tw = ws.reduce((a, b) => a + b, 0) + sp * (ch.length - 1), n = ch.length, st = 0.55;
  let cx = x - tw / 2; const base = ctx.globalAlpha;
  for (let i = 0; i < n; i++) {
    const w = ws[i], lp = (p) => clamp((p - (i / n) * st) / (1 - st)), op = lp(pOut), fp = lp(pFill), mx = cx + w / 2;
    if (fp > 0) {
      ctx.globalAlpha = base * fp * 0.85; ctx.fillStyle = off; ctx.fillText(ch[i], cx + size * 0.045, y + size * 0.04);
      ctx.globalAlpha = base;
      if (fp >= 1) ctx.fillStyle = col; else { const g = ctx.createRadialGradient(mx, y, 0, mx, y, size * 0.85 * fp + 1); g.addColorStop(0, col); g.addColorStop(0.7, col); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; }
      ctx.fillText(ch[i], cx, y);
    }
    if (op > 0) { ctx.globalAlpha = base; ctx.strokeStyle = outCol; ctx.lineWidth = Math.max(2, size * 0.028); if (op < 1) ctx.setLineDash([op * size * 5, 1e5]); ctx.strokeText(ch[i], cx, y); ctx.setLineDash([]); }
    cx += w + sp;
  }
  ctx.restore();
}
function note(s, x, y, size, col = INK, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px Caladea, serif`; ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
/** embroidered patch label: mustard cloth, stitched indigo border, indigo text */
function patch(s, x, y, size, p = 1, rot = -0.02) {
  if (p <= 0) return; const k = eob(clamp(p));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot * (1 + (1 - clamp(p)) * 4)); ctx.scale(k, k); ctx.globalAlpha *= clamp(p * 3);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * 0.1) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width + size * 1.3, h = size * 1.85;
  ctx.fillStyle = rgba(INK, 0.28); ctx.fillRect(-w / 2 + 5, -h / 2 + 6, w, h);
  ctx.fillStyle = MUS; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = rgba(INK, 0.1); for (let i = 0; i < w; i += 5) ctx.fillRect(-w / 2 + i, -h / 2, 1, h);
  // stitched border, sewn in as the patch lands
  const sp = clamp(p * 1.6 - 0.2), per = [[-w / 2 + 9, -h / 2 + 9], [w / 2 - 9, -h / 2 + 9], [w / 2 - 9, h / 2 - 9], [-w / 2 + 9, h / 2 - 9], [-w / 2 + 9, -h / 2 + 9]];
  stitch(per, sp, IND, 3.2, 10, 7);
  ctx.fillStyle = IND; ctx.fillText(s, size * 0.05, size * 0.06);
  ctx.restore(); ctx.letterSpacing = '0px';
}
/** running stitch along an open polyline, the first fraction p sewn; returns the tip [x, y, angle] */
function stitch(pts, p, col, w = 4, st = 12, gap = 8) {
  if (p <= 0) return null; const tot = plen(pts, false), end = tot * clamp(p);
  ctx.beginPath(); let d = 0, i = 1, acc = 0;
  for (let s0 = 0; s0 < end; s0 += st + gap) {
    const s1 = Math.min(end, s0 + st);
    const a = walk(pts, s0), b = walk(pts, s1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
  }
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
  return walk(pts, end);
}
function needle(tip, s = 1) {
  if (!tip) return; ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(tip[2]); ctx.scale(s, s); ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-46, 0); ctx.lineTo(10, 0); ctx.stroke();
  ctx.strokeStyle = CT; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-44, 0); ctx.lineTo(8, 0); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(-36, 0, 5, 1.8, 0, 0, TAU); ctx.stroke(); ctx.restore();
}
/** dye running down from the top edge in uneven streaks. mode 'cover' (p 0..1 -> fully covered) or 'wash' (covered -> washed out) */
function drips(p, col, mode = 'cover', seed = 1) {
  if (p <= 0 || (mode === 'wash' && p >= 1)) return;
  const n = 20, cw = W / n; ctx.save(); ctx.fillStyle = col;
  for (let i = -1; i <= n; i++) {
    const dl = rnd(i * 7.3 + seed) * (mode === 'wash' ? 0.2 : 0.4), q = clamp((p - dl) / (1 - dl)), k = mode === 'cover' ? eio(q) : 1 - eo(q), len = (mode === 'cover' ? H + 420 : H + 260) * k;
    if (len <= 1) continue; const x = i * cw - rnd(i * 3.1 + seed) * 12, w = cw * (1.15 + rnd(i * 5.5 + seed) * 0.4), yb = -200 + len - rnd(i * 2.7 + seed) * 180 * (1 - k);
    ctx.fillRect(x, -200, w, yb + 200); ctx.beginPath(); ctx.ellipse(x + w / 2, yb, w / 2, w * 0.45, 0, 0, TAU); ctx.fill();
    const tw = w * 0.22, tl = 60 + rnd(i * 9.9 + seed) * 140; ctx.fillRect(x + w * (0.2 + rnd(i + seed) * 0.5), yb, tw, tl); ctx.beginPath(); ctx.arc(x + w * (0.2 + rnd(i + seed) * 0.5) + tw / 2, yb + tl, tw * 0.8, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
function flame(x, y, s, t, ph = 0) {
  const sw = Math.sin(t * 7 + ph) * 5 + Math.sin(t * 11.3 + ph) * 3, hh = 62 + Math.sin(t * 9 + ph) * 6;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const [k, c] of [[1, MUS], [0.55, MAD]]) {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-22 * k, -6 * k, -18 * k, -hh * 0.55 * k, sw * k, -hh * k); ctx.bezierCurveTo(18 * k, -hh * 0.55 * k, 22 * k, -6 * k, 0, 0); ctx.closePath();
    ctx.fillStyle = c; ctx.fill(); if (k === 1) { ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(); }
  }
  ctx.restore();
}
function petal(x, y, r, s, c, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(10, 0, 0, 14); ctx.quadraticCurveTo(-10, 0, 0, -14); ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }

// ───────────── offscreen compositing: fold / unfold and cloth sway ─────────────
let OFF = null;
function renderOff(fn) {
  if (!OFF) { OFF = document.createElement('canvas'); OFF.width = W; OFF.height = H; }
  const prev = ctx, c = OFF.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.clearRect(0, 0, W, H); setCtx(c);
  try { fn(); } finally { setCtx(prev); } return OFF;
}
/** fn draws the whole shot. fold 0..1 = how far the cloth is folded shut at the centre crease; sway = strip ripple amplitude */
function compose(fn, fold = 0, sway = 0, t = 0) {
  if (fold <= 0.002 && !sway) { fn(); return; }
  const c = renderOff(fn);
  ctx.fillStyle = '#120C08'; ctx.fillRect(-200, -200, W + 400, H + 400);
  if (fold > 0.002) {
    const h2 = H / 2, k = Math.cos(clamp(fold) * PI / 2), hh = h2 * k;
    if (hh > 0.5) {
      ctx.drawImage(c, 0, 0, W, h2, 0, h2 - hh, W, hh); ctx.drawImage(c, 0, h2, W, h2, 0, h2, W, hh);
      const g = ctx.createLinearGradient(0, h2 - hh, 0, h2 + hh); g.addColorStop(0, `rgba(18,12,8,${fold * 0.2})`); g.addColorStop(0.5, `rgba(18,12,8,${0.15 + fold * 0.6})`); g.addColorStop(1, `rgba(18,12,8,${fold * 0.2})`);
      ctx.fillStyle = g; ctx.fillRect(0, h2 - hh, W, hh * 2);
    }
    return;
  }
  const n = 24, sw = W / n;
  for (let i = 0; i < n; i++) { const dy = Math.sin(t * 2.1 + i * 0.45) * sway, dx = Math.sin(t * 1.4 + i * 0.3) * sway * 0.25; ctx.drawImage(c, i * sw, 0, sw + 1, H, i * sw + dx, dy, sw + 1.5, H); }
}

// ───────────── map + army sprites ─────────────
const MAD_PT = [600, 1180];
const COAST = (() => {
  const pts = [[-40, -60], [1120, -60], [1120, 520], [960, 570], [905, 700], [870, 860], [820, 980], [765, 1080], [722, 1180], [680, 1280], [622, 1372], [578, 1432], [546, 1420], [520, 1358], [482, 1240], [432, 1100], [382, 960], [332, 800], [280, 642], [222, 506], [150, 424], [-40, 400]];
  const out = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; for (let k = 0; k < 4; k++) { const u = k / 4, j = (i > 1 && i < pts.length - 1) ? (rnd(i * 4 + k) - 0.5) * 14 : 0; out.push([lerp(a[0], b[0], u) + j, lerp(a[1], b[1], u) + j * 0.6]); } }
  return out;
})();
const mapImg = () => cached('a:map', W, H, 0.75, () => {
  // sea: indigo with cream wave strokes
  ctx.fillStyle = IND; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = rgba(CT, 0.35); ctx.lineWidth = 3;
  for (let y = 380; y < H; y += 46) for (let x = (y / 46 % 2) * 40; x < W; x += 80) { ctx.beginPath(); ctx.arc(x, y, 16, PI * 1.1, PI * 1.9); ctx.stroke(); }
  // land
  trace(COAST, true); ctx.fillStyle = CT; ctx.fill();
  ctx.save(); ctx.clip();
  for (let i = 0; i < 46; i++) { const x = rnd(i * 3.3) * W, y = rnd(i * 7.1) * 1400, r = 90 + rnd(i) * 200, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(CTS, 0.6)); g.addColorStop(1, rgba(CTS, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.fillStyle = rgba(GRN, 0.45); for (let i = 0; i < 500; i++) { ctx.beginPath(); ctx.arc(rnd(i * 1.9) * W, rnd(i * 2.7 + 1) * 1440, 2.2, 0, TAU); ctx.fill(); }
  // western hills: small kalamkari triangles
  for (let i = 0; i < 16; i++) { const u = i / 15, x = lerp(250, 520, u) + 26, y = lerp(560, 1330, u); ctx.beginPath(); ctx.moveTo(x - 26, y + 18); ctx.lineTo(x, y - 22); ctx.lineTo(x + 26, y + 18); ctx.closePath(); ctx.fillStyle = i % 2 ? GRN : rgba(GRN, 0.7); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke(); }
  // rivers
  ctx.strokeStyle = INDL; ctx.lineWidth = 4;
  for (const r of [[[300, 700], [520, 760], [700, 720], [900, 760]], [[380, 960], [560, 1000], [700, 980], [860, 900]], [[520, 1150], [600, 1160], [680, 1200], [740, 1150]]]) { ctx.beginPath(); ctx.moveTo(...r[0]); ctx.bezierCurveTo(...r[1], ...r[2], ...r[3]); ctx.stroke(); }
  ctx.restore();
  trace(COAST, true); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
  // Madurai: a small temple mark
  const [mx, my] = MAD_PT; ctx.save(); ctx.translate(mx, my); ctx.lineWidth = 3; ctx.strokeStyle = INK;
  for (const [w, h, y, c] of [[60, 18, 0, MAD], [48, 16, -18, MUS], [36, 14, -34, MAD], [24, 12, -48, MUS]]) { ctx.beginPath(); ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); ctx.lineTo(w / 2 - 5, y - h); ctx.lineTo(-w / 2 + 5, y - h); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, -64, 9, PI, TAU); ctx.fillStyle = MAD; ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.font = '700 40px Caladea, serif'; ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK; ctx.fillText('MADURAI', mx, my + 44); ctx.letterSpacing = '0px';
  // map border
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.strokeRect(24, 24, W - 48, H - 48); ctx.lineWidth = 2; ctx.strokeRect(38, 38, W - 76, H - 76);
});
const horseImg = () => cached('a:horse', 130, 160, 1.2, () => {
  ctx.translate(55, 150); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const O = () => { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); };
  ctx.strokeStyle = INK; ctx.lineWidth = 4.5; for (const lx of [-22, -12, 14, 24]) { ctx.beginPath(); ctx.moveTo(lx, -44); ctx.lineTo(lx + (lx > 0 ? 3 : -2), 0); ctx.stroke(); }
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-32, -52); ctx.quadraticCurveTo(-48, -40, -44, -20); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -52, 35, 17, 0, 0, TAU); ctx.fillStyle = MUS; ctx.fill(); O();
  ctx.beginPath(); ctx.moveTo(20, -62); ctx.lineTo(32, -84); ctx.lineTo(46, -82); ctx.lineTo(38, -52); ctx.closePath(); ctx.fillStyle = MUS; ctx.fill(); O();
  ctx.beginPath(); ctx.ellipse(50, -80, 16, 8, 0.55, 0, TAU); ctx.fillStyle = MUS; ctx.fill(); O();
  ctx.fillStyle = MAD; ctx.fillRect(-16, -70, 28, 22); ctx.strokeRect(-16, -70, 28, 22);
  ctx.beginPath(); ctx.moveTo(-10, -66); ctx.lineTo(12, -66); ctx.lineTo(2, -100); ctx.closePath(); ctx.fillStyle = IND; ctx.fill(); O();
  ctx.beginPath(); ctx.ellipse(2, -110, 9, 10, 0, 0, TAU); ctx.fillStyle = CTS; ctx.fill(); O();
  ctx.beginPath(); ctx.ellipse(0, -118, 11, 6, 0, 0, TAU); ctx.fillStyle = CT; ctx.fill(); O();
  ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(14, -60); ctx.lineTo(22, -146); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22, -146); ctx.lineTo(62, -136); ctx.lineTo(22, -124); ctx.closePath(); ctx.fillStyle = GRN; ctx.fill(); O();
});
/** rows of horsemen; base = y of the front-most row's hooves */
function army(base, t, halt = 0) {
  const img = horseImg();
  for (let r = 3; r >= 0; r--) for (let c = 0; c < 6; c++) {
    const y = base - r * 88, x = 300 + c * 92 + (r % 2) * 44 - r * 6, bob = Math.sin(t * 9 + c * 1.3 + r) * 3 * (1 - halt);
    blit(img, 55, 150, x, y + bob, 0.82);
  }
}

// ───────────── the shots ─────────────
export function buildA(add, cue) {
  const tMad = Wd('Madurai', 0), t15 = Wd('fifteen', 0), tNob = Wd('Nobody', 0), tDie0 = Wd('died', 0);
  const tMang = Wd('Mangammal', 1), tNay = Wd('Nayak', 1);
  const t1689 = Wd('sixteen', 2), tSon = Wd('son', 2), tDied = Wd('died', 2), tYoung = Wd('young', 2), tAcc = Wd('Accounts', 2), tWid = Wd('widow', 2), tSati = Wd('sati', 2), tLeave = Wd('leaving', 2), tBaby = Wd('baby', 2);
  const tReg = Wd('regent', 3), tGs = Wd('grandson', 3);
  const tMug = Wd('Mughal', 4), tSouth = Wd('south', 4), tAcc4 = Wd('accounts', 4), tTrib = Wd('tribute', 4), tNot = Wd('not', 4);

  // warm the heavy caches at boot so no frame pays for them
  mapImg(); horseImg(); bgImg('c'); bgImg('i'); weaveTile(); for (const k in BANDS) bandImg(k); for (const k in TILES) tile(k); figImg('qs', QS()); figImg('qseat', QSEAT());
  const A2 = tNob - 0.12, A3 = L(1) - 0.25, A4 = tNay - 0.18, A5 = L(2) - 0.12, A6 = tSon - 0.12, A7 = tAcc - 0.1, A8 = tLeave - 0.1, A9 = L(3) - 0.15, A10 = tGs - 0.3, A11 = L(4) - 0.15, A12 = tAcc4 - 0.12;

  // a1 · hook: cloth unrolls, the queen draws herself, MADURAI, 15 YEARS
  add({ id: 'a1', at: 0, cam: [540, 760], zoom: 0.07, note: 'cloth unrolls; crowned faceless queen under parasol pen-draws, dye bleeds; MADURAI print; 15 YEARS patch; indigo drips', draw(lt, d) {
    const roll = eio(clamp(lt / 0.8)), ry = lerp(30, H + 80, roll);
    ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, ry + 300); ctx.clip();
    bg('c');
    band('lotus', 110, clamp((lt - 0.05) / 0.6));
    drawFig(QS(), 540, 1080, 1.0, { draw: eio(clamp((lt - 0.12) / 1.25)), bleed: eo(clamp((lt - 0.85) / 1.0)), org: [40, -450], R: 760 });
    band('creeper', 1140, clamp((lt - 0.4) / 0.6));
    printWord('MADURAI', 540, 1262, 134, { col: MAD, off: IND, pOut: clamp((lt - (tMad - 0.25)) / 0.55), pFill: clamp((lt - (tMad + 0.05)) / 0.6) });
    patch('15 YEARS', 540, 1405, 46, clamp((lt - (t15 - 0.05)) / 0.35));
    weave(); ctx.restore();
    if (roll < 1) { // the wooden roller
      ctx.fillStyle = 'rgba(18,12,8,0.35)'; ctx.fillRect(-300, ry + 14, W + 600, 18);
      ctx.fillStyle = MADD; ctx.fillRect(-300, ry - 22, W + 600, 40); ctx.fillStyle = rgba(CT, 0.25); ctx.fillRect(-300, ry - 16, W + 600, 6);
      ctx.fillStyle = INK; ctx.fillRect(-300, ry - 24, W + 600, 4); ctx.fillRect(-300, ry + 16, W + 600, 4);
    }
    drips(clamp((lt - (d - 0.36)) / 0.36), IND, 'cover', 3);
  } });
  cue(0.02, 'whoosh', { gain: 0.6 }); cue(0.3, 'zip', { gain: 0.35 }); cue(tMad, 'thud', { gain: 0.5 }); cue(t15, 'pop', { gain: 0.6 }); cue(A2 - 0.4, 'bubbles', { gain: 0.4 });

  // a2 · the closed door and the question
  add({ id: 'a2', at: A2, cam: [540, 760], zoom: 0.08, note: 'indigo night cloth: arched closed door pen-draws in cream, light under it, her crown left on the threshold; UNCERTAIN patch; folds shut', draw(lt, d, t) {
    compose(() => {
      bg('i');
      glow(540, 1250, 420, MUS, 0.18 + 0.05 * Math.sin(t * 6));
      drawFig(DOOR(), 0, 0, 1, { draw: eio(clamp(lt / 1.1)), bleed: eo(clamp((lt - 0.4) / 0.8)), org: [540, 800], R: 760, ink: CT });
      ctx.fillStyle = rgba(MUS, 0.75 + 0.2 * Math.sin(t * 9)); ctx.fillRect(350, 1240, 380, 8);
      // her crown left on the threshold step
      const cp = clamp((lt - 0.7) / 0.8);
      glow(560, 1215, 120, MUS, 0.3 * cp);
      drawFig(CROWN(), 560, 1236, 1.35, { draw: eio(cp), bleed: eo(clamp((cp - 0.5) / 0.5)), org: [0, -40], R: 90, ink: CT, rot: 0.05 });
      patch('UNCERTAIN', 540, 1395, 46, clamp((lt - (tDie0 - A2 - 0.1)) / 0.35));
      weave();
      drips(clamp(lt / 0.45), IND, 'wash', 3);
    }, clamp((lt - (d - 0.32)) / 0.32));
  } });
  cue(A2 + 0.05, 'swell', { gain: 0.5 }); cue(A2 + 0.7, 'zip', { gain: 0.35 }); cue(tDie0 - 0.05, 'tock', { gain: 0.6 }); cue(A3 - 0.3, 'whoosh', { gain: 0.4 });

  // a3 + a4 · one tall cloth: queen register → MANGAMMAL → the Nayak kingdom register below
  const tall = (ty, lt3, lt4) => {
    bg('c');
    ctx.save(); ctx.translate(0, ty);
    band('creeper', 120);
    blitFig('qs', QS(), 540, 960, 0.95);
    band('tri', 1010);
    printWord('MANGAMMAL', 540, 1128, 110, { col: MAD, off: MUS, pOut: clamp((lt3 - (tMang - A3 - 0.45)) / 0.6), pFill: clamp((lt3 - (tMang - A3 - 0.05)) / 0.6) });
    band('lotus', 1240);
    const dg = eio(clamp(lt4 / 0.95)), bl = eo(clamp((lt4 - 0.45) / 0.85));
    drawFig(PAV(), 190, 1985, 0.9, { draw: dg, bleed: bl, org: [0, -200], R: 400, pen: false });
    drawFig(PAV(), 890, 1985, 0.9, { draw: dg, bleed: bl, org: [0, -200], R: 400, pen: false });
    drawFig(GOP(), 540, 1985, 1.0, { draw: dg, bleed: bl, org: [0, -300], R: 520 });
    band('creeper', 2020);
    patch('MADURAI NAYAK KINGDOM', 540, 2115, 40, clamp((lt4 - 0.7) / 0.35));
    ctx.restore(); weave();
  };
  add({ id: 'a3', at: A3, cam: [540, 980], zoom: 0.06, note: 'cloth unfolds: queen under parasol in top register; MANGAMMAL pen-outlined then dyed madder between borders', draw(lt, d) {
    compose(() => tall(-40 * eio(clamp(lt / d)), lt, -1), clamp(1 - lt / 0.32));
  } });
  add({ id: 'a4', at: A4, cam: [540, 900], zoom: 0.05, note: 'glide down the same swaying cloth: gopuram + two Nayak pavilions pen-draw; MADURAI NAYAK KINGDOM patch', draw(lt, d, t) {
    const ty = lerp(-40, -760, eio(clamp(lt / 0.75))) - 30 * clamp((lt - 0.75) / (d - 0.75));
    compose(() => tall(ty, 9, lt), 0, 5, t);
  } });
  cue(A3, 'slide', { gain: 0.4 }); cue(tMang, 'sparkle', { gain: 0.45 }); cue(A4, 'whoosh', { gain: 0.4 }); cue(A4 + 0.3, 'zip', { gain: 0.3 }); cue(A4 + 0.72, 'pop', { gain: 0.5 });

  // a5 · 1689
  add({ id: 'a5', at: A5, cam: [540, 860], zoom: 0.08, note: 'sun + moon cross the top register; AROUND patch; 1689 printed; running-stitch timeline 1600-1700 with a knot at 1689', draw(lt, d, t) {
    bg('c');
    band('tri', 190);
    // sun and moon register
    const sx = lerp(170, 420, eio(clamp(lt / d))), sy = 400;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.6);
    for (let i = 0; i < 12; i++) { ctx.save(); ctx.rotate(i * TAU / 12); ctx.beginPath(); ctx.moveTo(-14, -78); ctx.lineTo(0, -112); ctx.lineTo(14, -78); ctx.closePath(); ctx.fillStyle = i % 2 ? MAD : MUS; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(sx, sy, 74, 0, TAU); ctx.fillStyle = MUS; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.arc(sx, sy, 48, 0, TAU); ctx.fillStyle = MAD; ctx.fill(); ctx.stroke();
    const mx = lerp(880, 760, eio(clamp(lt / d)));
    ctx.beginPath(); ctx.arc(mx, 390, 70, 0.35 * PI, 1.65 * PI); ctx.arc(mx + 34, 380, 58, 1.6 * PI, 0.4 * PI, true); ctx.closePath(); ctx.fillStyle = IND; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    for (let i = 0; i < 9; i++) { const a = 0.4 + 0.6 * Math.sin(t * 3 + i * 1.7); ctx.fillStyle = rgba(MUS, a); ctx.beginPath(); ctx.arc(560 + rnd(i) * 140, 290 + rnd(i * 3) * 220, 5, 0, TAU); ctx.fill(); }
    band('creeper', 600);
    patch('AROUND', 540, 712, 46, clamp((lt - 0.1) / 0.35));
    printWord('1689', 540, 900, 290, { col: MAD, off: IND, ls: 0.04, pOut: clamp((lt - (t1689 - A5 - 0.35)) / 0.5), pFill: clamp((lt - (t1689 - A5)) / 0.55) });
    band('lotus', 1090);
    // timeline 1600 → 1700 sewn across, knot at 1689
    const tl = [[130, 1240], [950, 1240]], sp = eio(clamp((lt - 0.2) / 1.2)), tip = stitch(tl, sp, INK, 5, 16, 9);
    for (let k = 0; k <= 10; k++) { const x = 130 + k * 82; if (x - 130 <= 820 * sp) { ctx.fillStyle = INK; ctx.fillRect(x - 2, k % 5 ? 1226 : 1214, 4, k % 5 ? 28 : 52); } }
    if (sp < 1) needle(tip, 1.2);
    note('1600', 130, 1310, 36, INK, clamp(lt / 0.4)); note('1700', 950, 1310, 36, INK, clamp((sp - 0.9) / 0.1));
    const kx = 130 + 820 * 0.89, kp = clamp((sp - 0.89) / 0.11);
    if (kp > 0) { const pu = 1 + 0.15 * Math.sin(t * 6); ctx.beginPath(); ctx.arc(kx, 1240, 20 * eob(kp) * pu, 0, TAU); ctx.fillStyle = MAD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); ctx.beginPath(); ctx.arc(kx, 1240, 34 * eob(kp), 0, TAU); ctx.strokeStyle = MUS; ctx.lineWidth = 4; ctx.stroke(); }
    weave();
  } });
  cue(A5, 'drum', { gain: 0.5 }); cue(t1689, 'thud', { gain: 0.55 }); cue(A5 + 0.4, 'zip', { gain: 0.3 }); cue(A5 + 1.3, 'tock', { gain: 0.5 });

  // a6 · the young king, his dyes wash out
  add({ id: 'a6', at: A6, cam: [540, 820], zoom: 0.07, note: 'young king under a torana arch, then his dyes wash out and run down; DIED YOUNG patch', draw(lt, d, t) {
    bg('c');
    band('tri', 190);
    const ap = eio(clamp(lt / 0.6)), arch = cat([[260, 1300], [260, 700]], E(540, 700, 280, 300, PI, TAU, 30), [[820, 1300]]);
    ctx.save(); trace(arch, false); ctx.lineCap = 'round'; ctx.strokeStyle = MAD; ctx.lineWidth = 26; ctx.setLineDash([plen(arch) * ap, 1e5]); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
    for (let i = 0; i < 9; i++) { const a = PI + (i + 0.5) * PI / 9; if (ap > (i + 1) / 10) { ctx.beginPath(); ctx.arc(540 + Math.cos(a) * 310, 700 + Math.sin(a) * 330, 12, 0, TAU); ctx.fillStyle = MUS; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); } }
    const fd = eio(clamp((lt - (tDied - A6)) / 0.7));
    // dye running out of him
    if (fd > 0) for (let i = 0; i < 9; i++) {
      const x = 540 + (i - 4) * 22 + rnd(i) * 10, y0 = 1300 - 600 * rnd(i * 3.3), len = (1440 - y0) * clamp(fd * (0.7 + rnd(i * 2) * 0.6)), w = 8 + rnd(i * 5) * 10;
      ctx.fillStyle = rgba(i % 3 ? MAD : MUS, 0.5 * (1 - fd * 0.4)); ctx.fillRect(x, y0, w, len); ctx.beginPath(); ctx.arc(x + w / 2, y0 + len, w * 0.7, 0, TAU); ctx.fill();
    }
    drawFig(KING(), 540, 1300, 1.15, { fillA: 1 - 0.85 * fd, ink: mixc(INK, '#9A8A6E', fd), inkA: 1 - 0.45 * fd, rot: Math.sin(t * 1.2) * 0.008 });
    band('creeper', 1370);
    patch('DIED YOUNG', 540, 310, 46, clamp((lt - (tDied - A6 - 0.05)) / 0.35));
    weave();
  } });
  cue(A6, 'slide', { gain: 0.35 }); cue(tDied, 'heartbeat', { gain: 0.5 }); cue(tDied + 0.02, 'pop', { gain: 0.45 }); cue(A7, 'bubbles', { gain: 0.35 });

  // a7 · the widow (abstract and gentle): an outline beside a lamp dissolves into petals
  add({ id: 'a7', at: A7, cam: [560, 860], zoom: 0.06, note: 'indigo cloth: cream outline of the widow beside a brass lamp gently dissolves into rising petals; ACCOUNTS SAY patch; no fire on any figure', draw(lt, d, t) {
    bg('i');
    // falling petals everywhere, slow
    for (let i = 0; i < 16; i++) { const y = ((rnd(i * 3.7) * 1500 + t * (40 + rnd(i) * 30)) % 1500) + 120, x = rnd(i * 5.1) * W + Math.sin(t + i) * 30; petal(x, y, t * 0.8 + i, 0.9, i % 2 ? MAD : MUS, 0.55); }
    glow(760, 830, 300, MUS, 0.22 + 0.04 * Math.sin(t * 7));
    drawFig(LAMP(), 760, 1250, 1.25, { ink: CT });
    flame(760 - 80 * 1.25, 1250 - 290 * 1.25, 1.1, t, 0); flame(760 + 80 * 1.25, 1250 - 290 * 1.25, 1.1, t, 2);
    // the widow: an outline only, then gone into petals
    const dis = eio(clamp((lt - (tSati - A7 - 0.3)) / 1.0));
    ctx.save(); ctx.globalAlpha = 0.9 * (1 - dis);
    drawFig(WOMAN(), 330, 1250, 1.0, { draw: eio(clamp((lt - 0.1) / 1.0)), bleed: 0, ink: CT, pen: false });
    ctx.restore();
    if (dis > 0) for (let i = 0; i < 26; i++) { const k = clamp(dis * 1.3 - rnd(i * 2.2) * 0.3), x = 300 + rnd(i * 4.4) * 120 + Math.sin(t * 2 + i) * 20 * k, y = 1220 - rnd(i * 6.6) * 560 - k * 380; petal(x, y, i + t, 0.8 + rnd(i) * 0.5, i % 3 ? MUS : MAD, Math.sin(PI * clamp(k)) * 0.95); }
    band('lotus', 1330);
    patch('ACCOUNTS SAY', 540, 300, 44, clamp((lt - 0.15) / 0.35));
    weave();
    drips(clamp(lt / 0.5), IND, 'wash', 7);
  } });
  cue(A7 + 0.05, 'swell', { gain: 0.4 }); cue(tSati - 0.1, 'bell', { gain: 0.35 });

  // a8 · the baby in the cradle
  add({ id: 'a8', at: A8, cam: [540, 760], zoom: 0.08, note: 'indigo washes off: wooden rocking cradle with swaddled baby pen-draws, dyes, rocks; THE HEIR patch', draw(lt, d, t) {
    bg('c');
    band('lotus', 260);
    for (let i = 0; i < 14; i++) { const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 3 + i * 2)); ctx.fillStyle = rgba(i % 2 ? MUS : MAD, a); const x = 120 + rnd(i * 3) * 840, y = 340 + rnd(i * 7) * 760; if (Math.abs(x - 540) > 290 || y > 1080) { ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); } }
    const dr = eio(clamp(lt / 0.9)), bl = eo(clamp((lt - 0.45) / 0.8));
    drawFig(CRADLE(), 540, 1040, 2.4, { draw: dr, bleed: bl, org: [0, -150], R: 260, rot: Math.sin(lt * 2.6) * 0.06 * clamp(lt / 0.6) });
    band('creeper', 1130);
    patch('THE HEIR', 540, 1255, 48, clamp((lt - (tBaby - A8 - 0.05)) / 0.35));
    weave();
    drips(clamp(lt / 0.45), IND, 'wash', 11);
  } });
  cue(A8 + 0.1, 'zip', { gain: 0.3 }); cue(tBaby, 'sparkle', { gain: 0.5 });

  // a9 · regent: the queen seated beside the cradle
  add({ id: 'a9', at: A9, cam: [520, 820], zoom: 0.07, note: 'queen seated on throne under parasol pen-draws beside the rocking cradle; REGENT printed', draw(lt, d, t) {
    bg('c');
    band('tri', 150);
    drawFig(CRADLE(), 795, 1120, 1.15, { rot: Math.sin(t * 2.6) * 0.05 });
    drawFig(QSEAT(), 370, 1120, 1.0, { draw: eio(clamp(lt / 1.1)), bleed: eo(clamp((lt - 0.6) / 0.9)), org: [0, -350], R: 720 });
    band('creeper', 1190);
    printWord('REGENT', 540, 1320, 150, { col: IND, off: MAD, pOut: clamp((lt - (tReg - A9 - 0.35)) / 0.5), pFill: clamp((lt - (tReg - A9 - 0.05)) / 0.5) });
    weave();
  } });
  cue(A9 + 0.1, 'zip', { gain: 0.35 }); cue(tReg, 'drum', { gain: 0.6 });

  // a10 · grandson: the family register
  add({ id: 'a10', at: A10, cam: [540, 800], zoom: 0.06, note: 'family register: queen, her faded son, the cradle; madder stitch arcs queen to baby; GRANDSON patch; folds shut', draw(lt, d, t) {
    compose(() => {
      bg('c');
      band('lotus', 250);
      blitFig('qs', QS(), 210, 1100, 0.72);
      drawFig(KING(), 535, 1100, 0.74, { fillA: 0.15, ink: '#9A8A6E', inkA: 0.6 });
      drawFig(CRADLE(), 860, 1100, 0.85, { rot: Math.sin(t * 2.6) * 0.05 });
      const thin = stitch(B([250, 520], [330, 420], [470, 440], [520, 560]), clamp(lt / 0.5), INDL, 3, 8, 7);
      stitch(B([560, 560], [640, 450], [800, 560], [860, 880]), clamp((lt - 0.25) / 0.5), INDL, 3, 8, 7);
      const arc = B([215, 470], [380, 300], [800, 300], [890, 870], 30), ap = eio(clamp((lt - 0.2) / 0.9)), tip = stitch(arc, ap, MAD, 7, 18, 10);
      if (ap > 0 && ap < 1) needle(tip, 1.3);
      band('creeper', 1150);
      note('QUEEN', 210, 1225, 40, INK, clamp(lt / 0.3)); note('HER SON', 535, 1225, 40, '#8A7A5E', clamp(lt / 0.3));
      patch('GRANDSON', 860, 1228, 40, clamp((lt - (tGs - A10 - 0.05)) / 0.35), 0.03);
      weave();
    }, clamp((lt - (d - 0.32)) / 0.32));
  } });
  cue(A10 + 0.2, 'zip', { gain: 0.35 }); cue(tGs, 'pop', { gain: 0.6 }); cue(A11 - 0.3, 'whoosh', { gain: 0.4 });

  // a11 · the Mughal army presses south on the cloth map
  add({ id: 'a11', at: A11, cam: [560, 560], zoom: 0.06, note: 'cloth map of the south unfolds: rows of stitched Mughal horsemen with pennants advance from the north; MUGHAL ARMY; madder stitched arrows south', draw(lt, d, t) {
    compose(() => {
      blit(mapImg(), 0, 0, 0, 0);
      army(lerp(260, 640, eio(clamp(lt / d))), t);
      const ap = clamp((lt - (tSouth - A11 - 0.35)) / 0.6);
      for (const [x0, x1] of [[400, 440], [700, 660]]) {
        const tip = stitch([[x0, 620], [x1, 980]], ap, MAD, 8, 18, 10);
        if (ap >= 1) { ctx.save(); ctx.translate(x1, 980); ctx.rotate(Math.atan2(360, x1 - x0) - PI / 2); ctx.beginPath(); ctx.moveTo(-26, -30); ctx.lineTo(0, 6); ctx.lineTo(26, -30); ctx.strokeStyle = MAD; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
      }
      ctx.fillStyle = rgba(CT, 0.85); ctx.fillRect(60, 70, 960, 150);
      printWord('MUGHAL ARMY', 540, 148, 96, { col: IND, off: MAD, pOut: clamp((lt - (tMug - A11 - 0.3)) / 0.45), pFill: clamp((lt - (tMug - A11)) / 0.45) });
      weave();
    }, clamp(1 - lt / 0.32));
  } });
  cue(A11 + 0.2, 'rumble', { gain: 0.55, dur: 2 }); cue(tMug, 'drum', { gain: 0.5 }); cue(tSouth, 'zip', { gain: 0.35 });

  // a12 · tribute, not war
  const ROUTE = B([600, 1130], [500, 1060], [700, 990], [600, 880], 30);
  add({ id: 'a12', at: A12, cam: [600, 820], zoom: 0.08, note: 'stitched route from Madurai north, tray of gifts travels it, the army halts; TRIBUTE printed; NOT WAR patch', draw(lt, d, t) {
    blit(mapImg(), 0, 0, 0, 0);
    const halt = clamp((lt - (tTrib - A12)) / 0.4);
    army(lerp(640, 670, eo(clamp(lt / (tTrib - A12)))), t, halt);
    blitFig('qseat', QSEAT(), 770, 1215, 0.27);
    const sp = eio(clamp((lt - 0.1) / 1.0)), tip = stitch(ROUTE, sp, MAD, 6, 15, 9);
    if (sp < 1) needle(tip, 1.2);
    const tp = eio(clamp((lt - 0.45) / 1.15)), [x, y] = walk(ROUTE, plen(ROUTE) * tp), bob = Math.sin(t * 8) * 4 * (1 - halt);
    // the tray of gifts
    ctx.save(); ctx.translate(x, y - 30 + bob); ctx.lineWidth = 3; ctx.strokeStyle = INK;
    for (const [px, c] of [[-26, MAD], [0, IND], [26, MAD]]) { ctx.beginPath(); ctx.ellipse(px, -18, 15, 18, 0, 0, TAU); ctx.fillStyle = c; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(px, -38, 8, 5, 0, 0, TAU); ctx.fillStyle = MUS; ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0, 0, 62, 16, 0, 0, TAU); ctx.fillStyle = MUS; ctx.fill(); ctx.stroke();
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(i * 15, 2, 5, 0, TAU); ctx.fillStyle = CT; ctx.fill(); ctx.stroke(); }
    ctx.restore();
    if (halt > 0) { ctx.beginPath(); ctx.arc(x, y - 40, 60 + halt * 90, 0, TAU); ctx.strokeStyle = rgba(MUS, 1 - halt); ctx.lineWidth = 8; ctx.stroke(); }
    // a stitched line the army does not cross
    const np = clamp((lt - (tNot - A12 - 0.2)) / 0.6); stitch([[260, 742], [880, 742]], np, IND, 6, 16, 10);
    ctx.fillStyle = rgba(CT, 0.85); ctx.fillRect(60, 110, 960, 170);
    printWord('TRIBUTE', 540, 196, 128, { col: MAD, off: IND, pOut: clamp((lt - (tTrib - A12 - 0.35)) / 0.45), pFill: clamp((lt - (tTrib - A12 - 0.05)) / 0.45) });
    patch('NOT WAR', 560, 1345, 50, clamp((lt - (tNot - A12 - 0.05)) / 0.35));
    weave();
  } });
  cue(A12 + 0.15, 'zip', { gain: 0.35 }); cue(A12 + 0.5, 'slide', { gain: 0.4 }); cue(tTrib, 'sparkle', { gain: 0.55 }); cue(tNot, 'thud', { gain: 0.55 });
}
