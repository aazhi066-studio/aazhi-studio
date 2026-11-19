// EPISODE 8 · worker C : "Kalamkari Cloth", lines 10-14 (the later story, the food outside, the 1917 doubt, the roads, end card)
//   c1  indigo dye runs down the painted day panel: the queen's register turns to night, "LATER STORY" patch
//   c2  night facade: the heavy door swings shut on her silhouette, bolt + lock; "slowly": moon crosses, tally stitches, lamp dims
//   c3  close: a banana-leaf meal (rice, banana, mango, clay pot) slides in, pen outline + dye bleed, steam curls, "OUTSIDE"
//   c4  cut-through: wall with a barred window, her silhouette inside, the food outside; stitched sight line, scent curls drift in
//   c5  through the bars: an arm reaches out and stops short, a stitched gap, "OUT OF REACH"
//   c6  a printed book on indigo, a quill writes generic lines, "1917" prints, RECORD patch
//   c7  the page close: the LATER STORY box, "UNRELIABLE?" prints in madder, UNCERTAIN patch
//   c8  a big "?" sewn in running stitch by a needle, "MYSTERY"
//   c9  dawn: the indigo washes off; a stitched road with avenue trees runs to the horizon, "HER ROADS / OUTLIVED HER"
//   c10 the cloth glides down its registers (reign, roads) to an empty stitched frame: "NO CLEAR RECORD"; the cloth folds
//   c11 end card: AAZHI on a swaying cloth banner with a creeper border, FOLLOW, "for the next chronicle"
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell } from './core/lib.js';
import { L, Wd, lineWords } from './core/timing.js';
import { cached, blit } from './art.js';

const COT = '#EFE3C8', SHADE = '#E2D2AF', INK = '#1E1611', MAD = '#A8322A', MADD = '#7A1F1A', IND = '#23305E', INDL = '#3D4F8A';
const MUS = '#D9A441', LEAF = '#5E7A4E', NIGHT = '#141B38', PAPER = '#F5ECD6';

// ───────────── colour + small helpers ─────────────
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const rgba = (c, a) => { const A = hx(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };
const mixh = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const SKIN = mixh(COT, MUS, 0.42), WALLN = mixh(MADD, IND, 0.5);

function renderTo(buf, fn) {
  const prev = ctx, b = buf.getContext('2d'); setCtx(b); b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.clearRect(0, 0, buf.width, buf.height);
  try { fn(); } finally { setCtx(prev); }
}
const BUF = {};
const buf = (k, w, h) => { let c = BUF[k]; if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; BUF[k] = c; } return c; };

// ───────────── cloth: dyed ground, weave, uneven dye ─────────────
const clothBg = (kind) => cached('c:bg' + kind, W, H, 0.5, () => {
  const n = kind === 'n';
  ctx.fillStyle = n ? IND : COT; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 46; i++) {
    const x = rnd(i * 3.1 + 7) * W, y = rnd(i * 5.3 + 2) * H, r = 90 + rnd(i * 7.7) * 260;
    const c = n ? (i % 2 ? '#18224A' : '#2E3E76') : (i % 2 ? SHADE : '#F6EEDB');
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(c, n ? 0.45 : 0.55)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
});
const cloth = (kind) => blit(clothBg(kind), 0, 0, 0, 0, 1);
const weaveTile = () => cached('c:weave', 192, 192, 1, () => {
  for (let y = 0; y < 192; y += 3) { ctx.fillStyle = `rgba(30,22,17,${0.04 + rnd(y * 1.7) * 0.05})`; ctx.fillRect(0, y, 192, 1); }
  for (let x = 1; x < 192; x += 3) { ctx.fillStyle = `rgba(255,248,230,${0.04 + rnd(x * 2.3 + 50) * 0.06})`; ctx.fillRect(x, 0, 1, 192); }
  for (let i = 0; i < 26; i++) { ctx.fillStyle = i % 2 ? 'rgba(30,22,17,0.10)' : 'rgba(255,248,230,0.12)'; ctx.fillRect(rnd(i * 9.1) * 192, Math.floor(rnd(i * 4.3) * 64) * 3, 8 + rnd(i) * 22, 2); }
});
function weave(a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = ctx.createPattern(weaveTile(), 'repeat'); ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore(); }
const blotTile = () => cached('c:blot', 256, 256, 1, () => {
  for (let i = 0; i < 22; i++) {
    const x = rnd(i * 2.7) * 256, y = rnd(i * 6.1 + 3) * 256, r = 20 + rnd(i * 3.9) * 60;
    for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) {
      const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r); g.addColorStop(0, i % 3 ? 'rgba(20,10,8,0.16)' : 'rgba(255,245,225,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    }
  }
});
function vig(a = 0.5, col = '#0A0E20') { const g = ctx.createRadialGradient(540, 860, 380, 540, 860, 1250); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, a)); ctx.fillStyle = g; ctx.fillRect(-60, -60, W + 120, H + 120); }

/** PEN-KALAM: stroke the current path progressively (p 0..1) */
function pen(pathFn, p, col = INK, lw = 6, Lmax = 2600) {
  if (p <= 0) return; ctx.save(); pathFn(); if (p < 1) ctx.setLineDash([Lmax * p, Lmax * 2]);
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
/** DYE BLEED: fill the path with colour spreading from (cx, cy) with a soft edge */
function bleed(pathFn, col, p, cx, cy, R) {
  if (p <= 0) return; ctx.save(); pathFn(); ctx.clip();
  if (p >= 1) ctx.fillStyle = col; else { const r = R * eo(p) + 1, g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col); g.addColorStop(0.72, col); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; }
  ctx.fillRect(cx - R - 4, cy - R - 4, R * 2 + 8, R * 2 + 8);
  ctx.globalAlpha = clamp(p * 2); ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.fillRect(cx - R - 4, cy - R - 4, R * 2 + 8, R * 2 + 8);
  ctx.restore();
}

// ───────────── type ─────────────
function big(s, x, y, size, col = INK, col2 = MAD, a = 1, sc = 1, rot = 0, maxW = 960) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * 0.05) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width, f = Math.min(1, maxW / w); ctx.scale(sc * f, sc * f);
  if (col2) { ctx.globalAlpha *= 0.9; ctx.fillStyle = col2; ctx.fillText(s, size * 0.045, size * 0.05); ctx.globalAlpha /= 0.9; }
  ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); ctx.letterSpacing = '0px';
}
function note(s, x, y, size, col = INK, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px Caladea, serif`; ctx.letterSpacing = '1px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
/** EMBROIDERED PATCH: mustard cloth, stitched dashed border, indigo letters; p 0..1 pops it on */
function patch(s, x, y, size = 40, p = 1, rot = 0) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const k = eob(clamp(p)); ctx.scale(k, k); ctx.globalAlpha *= clamp(p * 4);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * 0.1) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width + size * 1.4, h = size * 2;
  ctx.fillStyle = 'rgba(20,14,10,0.35)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);
  ctx.fillStyle = MUS; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.setLineDash([size * 0.32, size * 0.2]); ctx.strokeStyle = IND; ctx.lineWidth = Math.max(3, size * 0.09); ctx.strokeRect(-w / 2 + size * 0.24, -h / 2 + size * 0.24, w - size * 0.48, h - size * 0.48); ctx.setLineDash([]);
  ctx.fillStyle = IND; ctx.fillText(s, size * 0.05, size * 0.06); ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────── running stitch ─────────────
function resample(pts, step) {
  const out = [pts[0].slice()]; let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], l = Math.hypot(bx - ax, by - ay); if (l < 1e-6) continue;
    let s = step - carry; while (s <= l) { out.push([ax + (bx - ax) * s / l, ay + (by - ay) * s / l]); s += step; }
    carry = l - (s - step);
  }
  return out;
}
/** stitches between P[2k] and P[2k+1]; p 0..1 sews them in order; a needle leads while sewing */
function stitches(P, p, col = INK, lw = 6, needle = true, ncol = INK) {
  if (p <= 0) return; const n = P.length - 1, f = p * n;
  ctx.save(); ctx.lineCap = 'round';
  for (const pass of [0, 1]) {
    ctx.beginPath();
    for (let k = 0; 2 * k < f && 2 * k < n; k++) {
      const a = P[2 * k], u = Math.min(1, f - 2 * k), b = P[2 * k + 1];
      const ex = a[0] + (b[0] - a[0]) * u, ey = a[1] + (b[1] - a[1]) * u, o = pass ? 0 : lw * 0.45;
      ctx.moveTo(a[0] + o, a[1] + o); ctx.lineTo(ex + o, ey + o);
    }
    ctx.strokeStyle = pass ? col : 'rgba(10,8,6,0.3)'; ctx.lineWidth = lw; ctx.stroke();
  }
  if (needle && p < 1) {
    const i = Math.min(n - 1, Math.floor(f)), u = f - i, a = P[i], b = P[i + 1];
    const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(-60, 0); ctx.quadraticCurveTo(-110, 30, -150, 10); ctx.strokeStyle = rgba(col, 0.7); ctx.lineWidth = lw * 0.4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(-58, -4); ctx.lineTo(-62, 0); ctx.lineTo(-58, 4); ctx.closePath(); ctx.fillStyle = ncol; ctx.fill();
    ctx.strokeStyle = rgba(ncol === INK ? COT : INK, 0.8); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(-50, 0, 6, 1.6, 0, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
const arcPts = (cx, cy, r, a0, a1, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });

// ───────────── dye drip / wash ─────────────
const DRIPS = Array.from({ length: 16 }, (_, i) => ({ x: rnd(i * 4.7 + 1) * 1140 - 30, w: 18 + rnd(i * 2.3) * 34, l: 140 + rnd(i * 8.1) * 420 }));
const streak = (x) => { let s = Math.sin(x * 0.013) * 24 + Math.sin(x * 0.041 + 1) * 10; for (const d of DRIPS) { const q = (x - d.x) / d.w; if (q > -1 && q < 1) s += d.l * Math.sqrt(1 - q * q); } return s; };
const STREAK = Array.from({ length: 191 }, (_, i) => streak(-60 + i * 6.3));
/** region dyed by a drip front at level lev (dye above): returns the polygon path of the UNDYED region below */
function belowFront(lev, sgn = 1) {
  ctx.beginPath(); ctx.moveTo(-80, H + 200);
  for (let i = 0; i < STREAK.length; i++) ctx.lineTo(-60 + i * 6.3, lev + sgn * STREAK[i]);
  ctx.lineTo(W + 80, H + 200); ctx.closePath();
}
function frontEdge(lev, sgn, col, a = 0.6) {
  ctx.save(); ctx.beginPath(); for (let i = 0; i < STREAK.length; i++) { const x = -60 + i * 6.3, y = lev + sgn * STREAK[i]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.strokeStyle = rgba(col, a); ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
}

// ───────────── border bands (registers) ─────────────
function bandImg(kind, fg, bg, acc) {
  return cached(`c:band:${kind}:${fg}${bg}${acc}`, W, 64, 1, () => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, 64);
    ctx.fillStyle = fg; ctx.fillRect(0, 3, W, 5); ctx.fillRect(0, 56, W, 5);
    ctx.strokeStyle = fg; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    if (kind === 'tri') {
      for (let x = 0, k = 0; x < W; x += 40, k++) { ctx.beginPath(); ctx.moveTo(x, 54); ctx.lineTo(x + 20, 12); ctx.lineTo(x + 40, 54); ctx.closePath(); ctx.fillStyle = k % 2 ? acc : bg; ctx.fill(); ctx.stroke(); circle(x + 40, 18, 4, fg); }
    } else {
      ctx.beginPath(); for (let x = 0; x <= W; x += 4) { const y = 32 + Math.sin(x * TAU / 120) * 11; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      for (let x = 30, k = 0; x < W; x += 60, k++) {
        const up = k % 2 === 0, y = 32 + (up ? -11 : 11);
        ctx.save(); ctx.translate(x, y); ctx.rotate(up ? -0.7 : 0.7); ctx.beginPath(); ctx.ellipse(0, up ? -9 : 9, 7, 13, 0, 0, TAU); ctx.fillStyle = acc; ctx.fill(); ctx.stroke(); ctx.restore();
        circle(x + 30, 32, 3.5, fg);
      }
    }
  });
}
const band = (y, kind, fg, bg, acc) => blit(bandImg(kind, fg, bg, acc), 0, 0, 0, y, 1);

// ───────────── figures (faceless, kalamkari profile) ─────────────
const PAL = {
  day: { ink: INK, skin: SKIN, saree: MAD, dot: MUS, blouse: INDL, hair: INK, crown: MUS, border: IND, flower: MAD, lw: 7 },
  night: { ink: COT, skin: INDL, saree: MADD, dot: MUS, blouse: IND, hair: NIGHT, crown: MUS, border: NIGHT, flower: MAD, lw: 7 },
  sil: { ink: COT, skin: NIGHT, saree: NIGHT, dot: null, blouse: NIGHT, hair: NIGHT, crown: NIGHT, border: NIGHT, flower: NIGHT, lw: 6 },
};
function queenDraw(pal) {
  const st = (w = pal.lw) => { ctx.lineWidth = w; ctx.strokeStyle = pal.ink; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const F = (c) => { ctx.fillStyle = c; ctx.fill(); };
  // back pallu
  ctx.beginPath(); ctx.moveTo(-48, -700); ctx.quadraticCurveTo(-130, -560, -152, -400); ctx.lineTo(-104, -388); ctx.quadraticCurveTo(-88, -560, -16, -690); ctx.closePath(); F(pal.saree); st();
  // skirt
  const skirt = () => { ctx.beginPath(); ctx.moveTo(-72, -470); ctx.quadraticCurveTo(-120, -200, -162, 0); ctx.lineTo(182, 0); ctx.quadraticCurveTo(122, -220, 72, -470); ctx.closePath(); };
  skirt(); F(pal.saree);
  ctx.save(); skirt(); ctx.clip();
  if (pal.dot) for (let y = -450; y < -40; y += 36) for (let x = -170; x < 190; x += 36) circle(x + ((y / 36) % 2 ? 18 : 0), y, 5.5, pal.dot);
  ctx.fillStyle = pal.border; ctx.fillRect(-200, -48, 400, 48);
  ctx.strokeStyle = pal.ink; ctx.lineWidth = 3; for (let x = -180; x < 200; x += 28) { ctx.beginPath(); ctx.moveTo(x, -6); ctx.lineTo(x + 14, -40); ctx.lineTo(x + 28, -6); ctx.fillStyle = pal.dot || pal.border; ctx.fill(); ctx.stroke(); }
  ctx.restore();
  skirt(); st();
  ctx.beginPath(); for (const [a, b] of [[40, 70], [60, 110], [78, 150]]) { ctx.moveTo(a, -440); ctx.quadraticCurveTo(a + 20, -220, b, -50); } st(4);
  // torso
  ctx.beginPath(); ctx.moveTo(-72, -470); ctx.bezierCurveTo(-88, -560, -82, -660, -52, -712); ctx.lineTo(56, -712); ctx.bezierCurveTo(82, -680, 96, -600, 72, -470); ctx.closePath(); F(pal.skin); st();
  ctx.beginPath(); ctx.moveTo(-60, -690); ctx.lineTo(60, -690); ctx.lineTo(80, -600); ctx.lineTo(-70, -600); ctx.closePath(); F(pal.blouse); st(4);
  // pallu across
  ctx.beginPath(); ctx.moveTo(-74, -500); ctx.lineTo(-58, -712); ctx.lineTo(-14, -712); ctx.lineTo(80, -530); ctx.lineTo(74, -470); ctx.closePath(); F(pal.saree); st();
  if (pal.dot) { ctx.save(); ctx.clip(); for (let k = 0; k < 7; k++) circle(-40 + k * 16, -680 + k * 26, 5, pal.dot); ctx.restore(); }
  // neck, head, hair, knot, crown
  ctx.beginPath(); ctx.rect(-12, -770, 40, 66); F(pal.skin); st();
  ctx.beginPath(); ctx.ellipse(12, -815, 50, 60, 0, 0, TAU); F(pal.skin); st();
  ctx.beginPath(); ctx.ellipse(12, -815, 50, 60, 0, Math.PI * 0.62, Math.PI * 1.5); ctx.quadraticCurveTo(-10, -800, -18, -760); ctx.closePath(); F(pal.hair); st();
  ctx.beginPath(); ctx.arc(-48, -790, 30, 0, TAU); F(pal.hair); st();
  if (pal.dot) for (let k = 0; k < 5; k++) circle(-48 + Math.cos(k * 1.26) * 18, -790 + Math.sin(k * 1.26) * 18, 5, pal.dot);
  ctx.beginPath(); ctx.moveTo(-34, -862); ctx.lineTo(58, -862); ctx.lineTo(48, -926); ctx.lineTo(32, -896); ctx.lineTo(12, -958); ctx.lineTo(-8, -896); ctx.lineTo(-24, -926); ctx.closePath(); F(pal.crown); st();
  if (pal.dot) for (const [x, y] of [[12, -880], [-14, -876], [38, -876]]) circle(x, y, 5, pal.flower);
  circle(-2, -766, 8, pal.crown); ctx.beginPath(); ctx.arc(-2, -766, 8, 0, TAU); st(3);
  // necklace
  ctx.beginPath(); ctx.arc(12, -712, 34, 0.3, Math.PI - 0.3); ctx.strokeStyle = pal.crown; ctx.lineWidth = 6; ctx.stroke();
  // arm holding a lotus
  const arm = () => { ctx.beginPath(); ctx.moveTo(54, -690); ctx.lineTo(96, -560); ctx.lineTo(168, -600); };
  arm(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = pal.ink; ctx.lineWidth = 42; ctx.stroke(); arm(); ctx.strokeStyle = pal.skin; ctx.lineWidth = 28; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(140, -598); ctx.lineTo(132, -572); ctx.moveTo(150, -604); ctx.lineTo(142, -578); ctx.strokeStyle = pal.crown; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(176, -604); ctx.lineTo(190, -680); st(4);
  for (const a of [-0.6, 0, 0.6]) { ctx.save(); ctx.translate(190, -684); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -22, 11, 24, 0, 0, TAU); F(pal.flower); st(4); ctx.restore(); }
}
const qImg = (k) => cached('c:q' + k, 520, 1100, 1, () => { ctx.translate(240, 1060); queenDraw(PAL[k]); });
const queen = (k, x, y, s, a = 1) => blit(qImg(k), 240, 1060, x, y, s, a);

function parasol(x, y, s, pal) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = pal.ink; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-60, -640); ctx.lineTo(-60, -1130); ctx.lineWidth = 10; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-290, -1090); ctx.quadraticCurveTo(-60, -1330, 170, -1090); ctx.closePath(); ctx.fillStyle = pal.saree; ctx.fill(); ctx.lineWidth = 7; ctx.stroke();
  ctx.beginPath(); for (let k = 0; k < 6; k++) { ctx.moveTo(-60, -1205); ctx.lineTo(-270 + k * 84, -1094); } ctx.lineWidth = 3; ctx.stroke();
  for (let k = 0; k < 10; k++) { ctx.beginPath(); ctx.arc(-276 + k * 48, -1090, 22, 0, Math.PI); ctx.fillStyle = k % 2 ? pal.crown : pal.blouse; ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); }
  circle(-60, -1214, 12, pal.crown);
  ctx.restore();
}
function pillar(x, y0, y1, pal) {
  ctx.save(); ctx.strokeStyle = pal.ink; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.rect(x - 24, y0 + 60, 48, y1 - y0 - 100); ctx.fillStyle = pal.skin; ctx.fill(); ctx.stroke();
  for (let y = y0 + 110; y < y1 - 60; y += 70) { ctx.beginPath(); ctx.moveTo(x - 24, y); ctx.lineTo(x + 24, y); ctx.stroke(); circle(x, y + 35, 7, pal.saree); }
  ctx.beginPath(); ctx.moveTo(x - 24, y0 + 60); ctx.quadraticCurveTo(x - 66, y0 + 40, x - 60, y0); ctx.lineTo(x + 60, y0); ctx.quadraticCurveTo(x + 66, y0 + 40, x + 24, y0 + 60); ctx.closePath(); ctx.fillStyle = pal.crown; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.rect(x - 44, y1 - 40, 88, 40); ctx.fillStyle = pal.saree; ctx.fill(); ctx.stroke();
  ctx.restore();
}
function tree(x, y, h, pal = PAL.day, pop = 1) {
  if (pop <= 0) return; const k = eob(clamp(pop)); ctx.save(); ctx.translate(x, y); ctx.scale(k, k); const s = h / 400;
  ctx.scale(s, s); ctx.strokeStyle = pal.ink; ctx.lineWidth = 6 / Math.max(0.5, s * 1.2); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-12, -200); ctx.lineTo(12, -200); ctx.lineTo(18, 0); ctx.closePath(); ctx.fillStyle = MADD; ctx.fill(); ctx.stroke();
  ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.42; const cx = Math.cos(a) * 110, cy = -270 + Math.sin(a) * 90; ctx.moveTo(cx + 62, cy); ctx.arc(cx, cy, 62, 0, TAU); }
  ctx.fillStyle = LEAF; ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -270, 150, 120, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = rnd(i * 3.3) * TAU, r = rnd(i * 1.7) * 100, px = Math.cos(a) * r, py = -270 + Math.sin(a) * r * 0.75; ctx.moveTo(px - 14, py - 10); ctx.lineTo(px, py + 6); ctx.lineTo(px + 14, py - 10); } ctx.strokeStyle = COT; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}

// ───────────── the meal on a banana leaf (local coords around 0,0, ~800 wide) ─────────────
const MEAL = [
  { col: MAD, cx: 290, cy: -80, R: 140, path: () => { ctx.beginPath(); ctx.ellipse(290, -74, 96, 86, 0, 0, TAU); ctx.moveTo(250, -150); ctx.rect(250, -176, 80, 34); }, deco: (ink) => { ctx.beginPath(); ctx.ellipse(290, -178, 56, 14, 0, 0, TAU); ctx.fillStyle = MADD; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.stroke(); ctx.beginPath(); for (const y of [-100, -70, -40]) { ctx.moveTo(200, y); ctx.quadraticCurveTo(290, y + 18, 380, y); } ctx.strokeStyle = COT; ctx.lineWidth = 5; ctx.stroke(); } },
  { col: LEAF, cx: 0, cy: 20, R: 420, path: () => { ctx.beginPath(); ctx.moveTo(-390, 44); ctx.quadraticCurveTo(0, -120, 410, 0); ctx.quadraticCurveTo(20, 140, -390, 44); ctx.closePath(); }, deco: (ink) => { ctx.beginPath(); ctx.moveTo(-380, 44); ctx.quadraticCurveTo(0, 12, 404, 0); for (let k = -6; k <= 6; k++) { const x = k * 56; ctx.moveTo(x, 22 - Math.abs(k) * 1.5); ctx.lineTo(x + 40, -40 + Math.abs(k) * 6); ctx.moveTo(x, 22 - Math.abs(k) * 1.5); ctx.lineTo(x + 34, 72 - Math.abs(k) * 6); } ctx.strokeStyle = rgba(ink, 0.55); ctx.lineWidth = 3; ctx.stroke(); } },
  { col: PAPER, cx: -60, cy: -20, R: 160, path: () => { ctx.beginPath(); ctx.moveTo(-180, 34); ctx.bezierCurveTo(-170, -120, 40, -120, 60, 34); ctx.quadraticCurveTo(-60, 54, -180, 34); ctx.closePath(); }, deco: () => { for (let i = 0; i < 26; i++) circle(-150 + rnd(i * 3.3) * 190, -50 + rnd(i * 5.1) * 70 + Math.abs(-60 + rnd(i * 3.3) * 190 - (-60)) * 0.25, 4, rgba(INK, 0.35)); } },
  { col: MUS, cx: -280, cy: 0, R: 120, path: () => { ctx.beginPath(); ctx.moveTo(-350, 30); ctx.quadraticCurveTo(-290, -86, -190, -50); ctx.quadraticCurveTo(-270, -34, -330, 50); ctx.closePath(); }, deco: () => {} },
  { col: mixh(MUS, MAD, 0.35), cx: 150, cy: 0, R: 90, path: () => { ctx.beginPath(); ctx.ellipse(150, 2, 64, 46, -0.25, 0, TAU); }, deco: (ink) => { ctx.beginPath(); ctx.moveTo(190, -34); ctx.quadraticCurveTo(220, -70, 250, -56); ctx.quadraticCurveTo(224, -40, 190, -34); ctx.fillStyle = LEAF; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.stroke(); } },
];
function meal(x, y, s, pPen, pDye, ink = INK) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  MEAL.forEach((m, i) => {
    const pd = clamp(pDye * 1.6 - i * 0.12), pp = clamp(pPen * 1.4 - i * 0.08);
    bleed(m.path, m.col, pd, m.cx, m.cy, m.R);
    if (pd > 0.3) { ctx.save(); ctx.globalAlpha *= clamp((pd - 0.3) * 2); m.deco(ink); ctx.restore(); }
    pen(m.path, pp, ink, 7 / Math.max(0.6, s), 1500);
  });
  ctx.restore();
}
/** scent / steam curls: wavy dashed threads rising from (x, y) */
function curls(x, y, t, n, col, a, hgt = 420, drift = 0, lw = 6) {
  if (a <= 0) return; ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([16, 14]);
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.35 + i / n) % 1, x0 = x + (i - (n - 1) / 2) * 40;
    ctx.beginPath();
    for (let k = 0; k <= 24; k++) { const u = k / 24, yy = y - u * hgt, xx = x0 + Math.sin(u * 7 + t * 2.4 + i * 1.7) * (16 + u * 26) + drift * u * u; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.lineDashOffset = -t * 50 - i * 9; ctx.strokeStyle = rgba(col, a * Math.sin(Math.PI * ph) * 0.9 + a * 0.1); ctx.lineWidth = lw; ctx.stroke();
  }
  ctx.restore();
}
function stars(t, n, y0, y1, a = 1, seed = 0) {
  ctx.save(); ctx.strokeStyle = COT; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = rnd(i * 2.9 + seed) * W, y = y0 + rnd(i * 6.1 + seed) * (y1 - y0), s = 6 + rnd(i * 4.4) * 7, tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * (1.5 + rnd(i) * 2) + i));
    ctx.globalAlpha = a * tw; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke();
  }
  ctx.restore();
}
function moon(x, y, r, col = COT) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x + r * 0.42, y - r * 0.18, r * 0.86, 0, TAU, true); ctx.fillStyle = col; ctx.fill('evenodd'); ctx.restore();
}

// ───────────── c1: the painted register (day + night versions) ─────────────
const panelImg = (k) => cached('c:panel' + k, W, H, 1, () => {
  const n = k === 'night', pal = n ? PAL.night : PAL.day;
  ctx.drawImage(clothBg(n ? 'n' : 'd'), 0, 0, W, H);
  if (n) { ctx.fillStyle = rgba(NIGHT, 0.25); ctx.fillRect(0, 300, W, 1100); }
  band(300, 'tri', pal.ink, n ? IND : COT, n ? MADD : MAD);
  band(1330, 'creeper', pal.ink, n ? IND : COT, n ? MUS : LEAF);
  pillar(150, 364, 1330, pal); pillar(930, 364, 1330, pal);
  if (!n) parasol(540, 1310, 0.72, pal);
  ctx.save(); ctx.translate(540, 1310); ctx.scale(0.78, 0.78); ctx.translate(-240, -1060); ctx.drawImage(qImg(n ? 'night' : 'day'), 0, 0); ctx.restore();
  if (n) moon(230, 520, 54);
});

// ───────────── c2: the night facade ─────────────
const doorway = () => { ctx.beginPath(); ctx.moveTo(400, 1322); ctx.lineTo(400, 760); ctx.arc(540, 760, 140, Math.PI, 0); ctx.lineTo(680, 1322); ctx.closePath(); };
const roomImg = () => cached('c:room', W, H, 1, () => {
  ctx.drawImage(clothBg('n'), 0, 0, W, H);
  ctx.strokeStyle = COT; ctx.lineJoin = 'round';
  // parapet merlons
  for (let x = 160; x < 930; x += 64) { ctx.beginPath(); ctx.moveTo(x, 440); ctx.lineTo(x, 400); ctx.arc(x + 26, 400, 26, Math.PI, 0); ctx.lineTo(x + 52, 440); ctx.fillStyle = WALLN; ctx.fill(); ctx.lineWidth = 5; ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(140, 436, 800, 64); ctx.clip(); ctx.drawImage(bandImg('tri', COT, WALLN, MADD), 0, 436); ctx.restore();
  ctx.beginPath(); ctx.rect(150, 500, 780, 822); ctx.fillStyle = WALLN; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.fillRect(150, 500, 780, 822);
  ctx.strokeStyle = rgba(COT, 0.16); ctx.lineWidth = 3; for (let y = 560, r = 0; y < 1322; y += 62, r++) { ctx.beginPath(); ctx.moveTo(150, y); ctx.lineTo(930, y); for (let x = 150 + (r % 2) * 60; x < 930; x += 120) { ctx.moveTo(x, y - 62); ctx.lineTo(x, y); } ctx.stroke(); }
  ctx.restore();
  ctx.lineWidth = 7; ctx.strokeStyle = COT; ctx.strokeRect(150, 500, 780, 822);
  // doorway with her silhouette inside
  doorway(); ctx.fillStyle = '#0B1029'; ctx.fill();
  ctx.save(); doorway(); ctx.clip(); ctx.translate(540, 1318); ctx.scale(0.6, 0.6); ctx.translate(-240, -1060); ctx.drawImage(qImg('sil'), 0, 0); ctx.restore();
  doorway(); ctx.lineWidth = 9; ctx.stroke();
  ctx.beginPath(); ctx.arc(540, 760, 170, Math.PI, 0); ctx.lineWidth = 5; ctx.stroke();
  for (let k = 0; k <= 8; k++) { const a = Math.PI + k * Math.PI / 8; circle(540 + Math.cos(a) * 155, 760 + Math.sin(a) * 155, 6, MUS); }
  // small barred window, lamp niche
  ctx.beginPath(); ctx.rect(210, 640, 120, 130); ctx.fillStyle = '#0B1029'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); for (const x of [240, 270, 300]) { ctx.moveTo(x, 640); ctx.lineTo(x, 770); } ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(222, 1180); ctx.lineTo(222, 1090); ctx.arc(270, 1090, 48, Math.PI, 0); ctx.lineTo(318, 1180); ctx.closePath(); ctx.fillStyle = '#0B1029'; ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
  ctx.drawImage(bandImg('creeper', COT, IND, MUS), 0, 1322);
});
function door(e) {
  const w = lerp(26, 280, e);
  ctx.save(); doorway(); ctx.clip();
  ctx.beginPath(); ctx.rect(400, 600, w, 730); ctx.fillStyle = MADD; ctx.fill();
  ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.fill();
  ctx.strokeStyle = rgba(COT, 0.45); ctx.lineWidth = 3; ctx.beginPath(); for (let k = 1; k < 6; k++) { const x = 400 + w * k / 6; ctx.moveTo(x, 600); ctx.lineTo(x, 1322); } ctx.stroke();
  for (const y of [820, 1020, 1220]) { ctx.fillStyle = NIGHT; ctx.fillRect(400, y - 9, w, 18); for (let k = 0; k < 6; k++) circle(400 + w * (k + 0.5) / 6, y, 5, MUS); }
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(400 + w - 8, 600, 8, 730);
  ctx.beginPath(); ctx.rect(400, 600, w, 730); ctx.strokeStyle = COT; ctx.lineWidth = 6; ctx.stroke();
  ctx.restore();
  if (e < 1) { ctx.fillStyle = `rgba(11,16,41,${0.5 * (1 - e)})`; } // nothing else: the dark interior is already behind
}

// ───────────── c4/c5 helpers ─────────────
function bars(xs, y0, y1, w = 24) {
  for (const x of xs) {
    ctx.fillStyle = NIGHT; ctx.fillRect(x - w / 2, y0, w, y1 - y0);
    ctx.fillStyle = rgba(COT, 0.35); ctx.fillRect(x - w / 2 + 4, y0, 4, y1 - y0);
    ctx.strokeStyle = COT; ctx.lineWidth = 4; ctx.strokeRect(x - w / 2, y0, w, y1 - y0);
  }
}
function arm(sx, sy, hx2, hy2, pal = { ink: COT, fill: INDL }) {
  const ang = Math.atan2(hy2 - sy, hx2 - sx);
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx2, hy2); ctx.strokeStyle = pal.ink; ctx.lineWidth = 96; ctx.stroke(); ctx.strokeStyle = pal.fill; ctx.lineWidth = 82; ctx.stroke();
  ctx.translate(hx2, hy2); ctx.rotate(ang);
  // fingers
  for (const [dy, l] of [[-22, 62], [-6, 76], [10, 72], [26, 58]]) { ctx.beginPath(); ctx.moveTo(30, dy); ctx.lineTo(30 + l, dy + dy * 0.12); ctx.strokeStyle = pal.ink; ctx.lineWidth = 22; ctx.stroke(); ctx.strokeStyle = pal.fill; ctx.lineWidth = 12; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(10, -36); ctx.quadraticCurveTo(40, -66, 70, -46); ctx.strokeStyle = pal.ink; ctx.lineWidth = 22; ctx.stroke(); ctx.strokeStyle = pal.fill; ctx.lineWidth = 12; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(18, 0, 52, 42, 0, 0, TAU); ctx.fillStyle = pal.fill; ctx.fill(); ctx.strokeStyle = pal.ink; ctx.lineWidth = 6; ctx.stroke();
  for (const bx of [-50, -36, -22]) { ctx.beginPath(); ctx.moveTo(bx, -44); ctx.lineTo(bx, 44); ctx.strokeStyle = MUS; ctx.lineWidth = 8; ctx.stroke(); }
  ctx.restore();
}

// ───────────── c6/c7: printed book ─────────────
const BOOKROWS = (() => { const r = []; for (let i = 0; i < 15; i++) { const y = 548 + i * 46, ws = []; let x = 0; const end = i % 6 === 5 ? 200 + rnd(i * 3.1) * 80 : 330 - rnd(i * 4.4) * 20; while (x < end) { const w = 24 + rnd(i * 13 + x) * 70; ws.push([x, Math.min(w, end - x)]); x += w + 12; } r.push({ y, ws, end }); } return r; })();
function typeRow(x0, y, ws, p, col = INK, hgt = 11) {
  ctx.fillStyle = col; const lim = p * (ws.length ? ws[ws.length - 1][0] + ws[ws.length - 1][1] : 0);
  for (const [x, w] of ws) { if (x >= lim) break; ctx.fillRect(x0 + x, y - hgt / 2, Math.min(w, lim - x), hgt); }
}
const pageL = () => { ctx.beginPath(); ctx.moveTo(140, 476); ctx.quadraticCurveTo(340, 446, 540, 490); ctx.lineTo(540, 1262); ctx.quadraticCurveTo(340, 1228, 140, 1258); ctx.closePath(); };
const pageR = () => { ctx.beginPath(); ctx.moveTo(940, 476); ctx.quadraticCurveTo(740, 446, 540, 490); ctx.lineTo(540, 1262); ctx.quadraticCurveTo(740, 1228, 940, 1258); ctx.closePath(); };
const bookImg = () => cached('c:book', W, H, 1, () => {
  ctx.drawImage(clothBg('n'), 0, 0, W, H);
  ctx.fillStyle = 'rgba(8,10,24,0.4)'; rr(124, 452, 856, 860, 24); ctx.fill();
  rr(104, 432, 872, 860, 22); ctx.fillStyle = MADD; ctx.fill(); ctx.strokeStyle = COT; ctx.lineWidth = 6; ctx.stroke();
  for (const f of [pageL, pageR]) { f(); ctx.fillStyle = PAPER; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.globalAlpha = 0.25; ctx.fillRect(100, 400, 900, 900); ctx.restore(); f(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); }
  const g = ctx.createLinearGradient(490, 0, 590, 0); g.addColorStop(0, 'rgba(30,22,17,0)'); g.addColorStop(0.5, 'rgba(30,22,17,0.35)'); g.addColorStop(1, 'rgba(30,22,17,0)'); ctx.fillStyle = g; ctx.fillRect(490, 480, 100, 790);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(190, 520); ctx.lineTo(490, 520); ctx.moveTo(590, 520); ctx.lineTo(890, 520); ctx.stroke();
});
function quill(x, y, rot = -0.5) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -140, 10, -320); ctx.quadraticCurveTo(70, -170, 0, 0); ctx.fillStyle = MUS; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -150, 10, -320); ctx.stroke();
  ctx.beginPath(); for (let k = 1; k < 9; k++) { const yy = -40 - k * 30; ctx.moveTo(6, yy); ctx.lineTo(26, yy - 22); } ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
}

// ───────────── c9: dawn road ─────────────
const VY = 560, VX = 540;
const dawnImg = () => cached('c:dawnLand', W, H, 1, () => {
  ctx.beginPath(); ctx.rect(0, VY - 3, W, H); ctx.clip(); ctx.drawImage(clothBg('d'), 0, 0, W, H);
  // field strips in perspective
  for (let k = 0; k < 14; k++) { const y0 = VY + Math.pow(k / 14, 1.9) * (H - VY), y1 = VY + Math.pow((k + 1) / 14, 1.9) * (H - VY); ctx.fillStyle = k % 2 ? rgba(LEAF, 0.32) : rgba(MUS, 0.22); ctx.fillRect(0, y0, W, y1 - y0); ctx.fillStyle = rgba(INK, 0.25); ctx.fillRect(0, y1 - 1, W, 2); }
  ctx.fillStyle = INK; ctx.fillRect(0, VY - 3, W, 6);
  // road surface
  ctx.beginPath(); ctx.moveTo(VX - 6, VY); ctx.lineTo(VX + 6, VY); ctx.lineTo(900, H + 40); ctx.lineTo(180, H + 40); ctx.closePath(); ctx.fillStyle = mixh(COT, MUS, 0.5); ctx.fill();
  ctx.save(); ctx.clip(); ctx.globalAlpha = 0.4; ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.fillRect(0, VY, W, H); ctx.restore();
});
const roadEdge = (bx) => resample([[bx, H + 20], [VX + (bx - VX) * 0.01, VY + 4]], 22);
const ROAD_L = roadEdge(180), ROAD_R = roadEdge(900), ROAD_C = resample([[VX, H + 20], [VX, VY + 6]], 30);
const TREES = (() => { const out = []; for (let k = 0; k < 9; k++) { const f = 0.78 * Math.pow(0.72, k), y = VY + f * (H - VY); for (const sd of [-1, 1]) out.push({ x: VX + sd * (360 * f + 150 * f + 20), y, h: 760 * f, k }); } return out; })();
function sun(x, y, r, t) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  for (let i = 0; i < 16; i++) { ctx.save(); ctx.rotate(i * TAU / 16 + t * 0.15); ctx.beginPath(); ctx.moveTo(r + 10, -14); ctx.lineTo(r + 64 + (i % 2) * 22, 0); ctx.lineTo(r + 10, 14); ctx.closePath(); ctx.fillStyle = i % 2 ? MAD : MUS; ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = MUS; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, TAU); ctx.strokeStyle = MAD; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
function roadScene(lt, opts = {}) {
  cloth('d');
  const sy = VY + 30 - 90 * eo(clamp(lt / 2.5));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, VY); ctx.clip(); sun(VX, sy, 90, lt); ctx.restore();
  blit(dawnImg(), 0, 0, 0, 0, 1);
  ctx.save(); ctx.beginPath(); ctx.rect(0, VY, W, H); ctx.clip();
  const ps = opts.static ? 1 : seg(lt, 0.15, 1.3);
  stitches(ROAD_L, ps, MAD, 9, !opts.static); stitches(ROAD_R, ps, MAD, 9, !opts.static); stitches(ROAD_C, ps, INK, 6, false);
  ctx.restore();
  for (let i = TREES.length - 1; i >= 0; i--) { const tr = TREES[i]; tree(tr.x, tr.y, tr.h, PAL.day, opts.static ? 1 : (lt - 0.2 - tr.k * 0.11) / 0.3); }
}

// ───────────── c10: the tall register cloth ─────────────
const TALL = 2660;
const tallImg = () => cached('c:tall', W, TALL, 0.8, () => {
  ctx.drawImage(clothBg('d'), 0, 0, W, 1920); ctx.drawImage(clothBg('d'), 0, 1920, W, 1920);
  band(0, 'tri', INK, COT, MAD);
  // R1 reign
  ctx.save(); ctx.beginPath(); ctx.rect(0, 64, W, 796); ctx.clip();
  pillar(150, 120, 830, PAL.day); pillar(930, 120, 830, PAL.day);
  parasol(540, 820, 0.62, PAL.day); ctx.save(); ctx.translate(540, 820); ctx.scale(0.66, 0.66); ctx.translate(-240, -1060); ctx.drawImage(qImg('day'), 0, 0); ctx.restore();
  ctx.restore();
  band(860, 'creeper', INK, COT, LEAF);
  // R2 roads + rest house
  ctx.save(); ctx.beginPath(); ctx.rect(0, 924, W, 796); ctx.clip();
  ctx.fillStyle = rgba(LEAF, 0.18); ctx.fillRect(0, 1420, W, 300);
  ctx.fillStyle = INK; ctx.fillRect(0, 1418, W, 4);
  ctx.beginPath(); ctx.moveTo(0, 1560); ctx.bezierCurveTo(300, 1520, 700, 1640, W, 1580); ctx.lineTo(W, 1640); ctx.bezierCurveTo(700, 1700, 300, 1580, 0, 1620); ctx.closePath(); ctx.fillStyle = mixh(COT, MUS, 0.5); ctx.fill();
  const P = resample(Array.from({ length: 40 }, (_, i) => { const x = i * W / 39; return [x, 1590 + Math.sin(i * 0.25) * 20 - i * 0.2]; }), 22); stitches(P, 1, MAD, 8, false);
  for (let k = 0; k < 5; k++) tree(110 + k * 110, 1500, 200, PAL.day, 1);
  // rest house (pavilion)
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(660, 1180); ctx.lineTo(820, 1060); ctx.lineTo(980, 1180); ctx.closePath(); ctx.fillStyle = MAD; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.rect(680, 1180, 280, 30); ctx.fillStyle = MUS; ctx.fill(); ctx.stroke();
  for (const x of [700, 780, 860, 940]) { ctx.beginPath(); ctx.rect(x - 12, 1210, 24, 200); ctx.fillStyle = SKIN; ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.rect(670, 1400, 300, 24); ctx.fillStyle = MADD; ctx.fill(); ctx.stroke();
  ctx.restore();
  band(1720, 'tri', INK, COT, MUS);
  ctx.fillStyle = rgba(SHADE, 0.7); ctx.fillRect(0, 1784, W, 812);
  band(2596, 'creeper', INK, COT, MAD);
});

// ───────────── c11: banner ─────────────
const BW = 960, BH = 720;
const bannerCloth = () => cached('c:banner', BW, BH, 1, () => {
  ctx.fillStyle = MAD; ctx.fillRect(40, 40, BW - 80, 600);
  ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.fillRect(40, 40, BW - 80, 600);
  ctx.save(); ctx.beginPath(); ctx.rect(40, 60, BW - 80, 64); ctx.clip(); ctx.drawImage(bandImg('creeper', MUS, MAD, LEAF), -60, 60); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(40, 556, BW - 80, 64); ctx.clip(); ctx.drawImage(bandImg('creeper', MUS, MAD, LEAF), -30, 556); ctx.restore();
  ctx.fillStyle = COT; ctx.fillRect(80, 140, BW - 160, 400);
  ctx.globalAlpha = 0.3; ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.fillRect(80, 140, BW - 160, 400); ctx.globalAlpha = 1;
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.strokeRect(80, 140, BW - 160, 400); ctx.strokeRect(40, 40, BW - 80, 600);
  for (let k = 0; k < 9; k++) { const x = 80 + k * (BW - 160) / 8; ctx.beginPath(); ctx.moveTo(x, 640); ctx.lineTo(x, 680); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); circle(x, 692, 14, k % 2 ? MUS : IND); ctx.beginPath(); ctx.arc(x, 692, 14, 0, TAU); ctx.stroke(); }
});

export function buildC(add, cue) {
  const T10 = L(10), T11 = L(11), T12 = L(12), T13 = L(13), T14 = L(14);
  const tLocked = Wd('locked', 10), tSlowly = Wd('slowly', 10), tStory = Wd('story', 10);
  const tClose = Wd('close', 11), tSee = Wd('see', 11), tSmell = Wd('smell', 11), tNever = Wd('never', 11), tReach = Wd('reach', 11), tOutside = Wd('outside', 11);
  const tNine = Wd('nineteen', 12), tCalled = Wd('called', 12), tUnrel = Wd('unreliable', 12), tTrue = Wd('the', 12), tMyst = Wd('mystery', 12);
  const w13 = lineWords(13), tOutlived = Wd('outlived', 13), tLast = Wd('last', 13), tNo = Wd('no', 13), tRecord = Wd('record', 13);
  const tNext = Wd('next', 14);
  void w13;

  // c1 · the dye runs down: the day panel becomes night; LATER STORY
  add({ id: 'c1', at: T10, cam: [540, 860], zoom: 0.07, note: 'indigo dye drips over the day panel of the queen; night register; LATER STORY patch',
    draw(lt) {
      const pk = clamp(lt / 1.0), lev = lerp(-560, H + 80, eio(pk));
      blit(panelImg('night'), 0, 0, 0, 0, 1);
      stars(lt, 22, 380, 1250, clamp((lt - 0.4) * 2));
      if (pk < 1) { ctx.save(); belowFront(lev); ctx.clip(); blit(panelImg('day'), 0, 0, 0, 0, 1); ctx.restore(); frontEdge(lev, 1, NIGHT, 0.55); }
      patch('LATER STORY', 540, 466, 42, (lt - (tStory - T10)) / 0.3, -0.07);
      weave(0.9); vig(0.35);
    } });
  cue(T10, 'whoosh', { gain: 0.5, dur: 1.0 }); cue(tStory, 'pop', { gain: 0.6 });

  // c2 · the heavy door shuts; slowly: moon, tally stitches, lamp dims
  const TALLY = []; for (let g = 0; g < 3; g++) { for (let k = 0; k < 4; k++) TALLY.push([[760 + g * 52 + k * 10, 650], [760 + g * 52 + k * 10, 742]]); TALLY.push([[752 + g * 52, 730], [800 + g * 52, 662]]); }
  const TALLYP = TALLY.map((s) => resample(s, 14));
  add({ id: 'c2', at: tLocked, cam: [540, 900], zoom: 0.08, note: 'night facade: door slams on her silhouette, bolt + lock; moon crosses, tally stitches, lamp dims',
    draw(lt, d) {
      blit(roomImg(), 0, 0, 0, 0, 1);
      const ts = tSlowly - tLocked, mp = clamp((lt - ts + 0.3) / (d - ts + 0.3));
      stars(lt, 26, 60, 360, 1, 5);
      moon(lerp(140, 940, mp), 250 - Math.sin(mp * Math.PI) * 120, 46);
      door(eo(clamp((lt - 0.05) / 0.36)));
      const bp = eo(clamp((lt - 0.5) / 0.25));
      ctx.fillStyle = NIGHT; ctx.strokeStyle = COT; ctx.lineWidth = 4;
      rr(lerp(720, 590, bp), 980, 160, 26, 6); ctx.fill(); ctx.stroke();
      rr(700, 966, 30, 54, 6); ctx.fillStyle = MUS; ctx.fill(); ctx.stroke();
      const lk = (lt - 0.75) / 0.3;
      if (lk > 0) { ctx.save(); ctx.translate(716, 1050); const k = eob(clamp(lk)); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, -8, 22, Math.PI, 0); ctx.strokeStyle = COT; ctx.lineWidth = 9; ctx.stroke(); rr(-34, -8, 68, 60, 8); ctx.fillStyle = MUS; ctx.fill(); ctx.strokeStyle = COT; ctx.lineWidth = 4; ctx.stroke(); circle(0, 18, 7, NIGHT); ctx.restore(); }
      TALLYP.forEach((P, i) => stitches(P, (lt - ts - 0.05 - i * 0.11) / 0.12, COT, 5, false));
      const dim = 1 - 0.75 * clamp((lt - ts) / (d - ts)), fl = 0.85 + 0.15 * Math.sin(lt * 23) * Math.sin(lt * 7);
      const g = ctx.createRadialGradient(270, 1150, 0, 270, 1150, 160 * dim); g.addColorStop(0, rgba(MUS, 0.45 * dim)); g.addColorStop(1, rgba(MUS, 0)); ctx.fillStyle = g; ctx.fillRect(100, 980, 340, 340);
      ell(270, 1172, 30, 9, MUS); ctx.beginPath(); ctx.moveTo(270, 1164 - 46 * dim * fl); ctx.quadraticCurveTo(286, 1150, 270, 1164); ctx.quadraticCurveTo(254, 1150, 270, 1164 - 46 * dim * fl); ctx.fillStyle = COT; ctx.fill();
      weave(0.9); vig(0.45);
    } });
  cue(tLocked + 0.38, 'slam', { gain: 0.8 }); cue(tLocked + 0.72, 'tock', { gain: 0.5 }); cue(tLocked + 0.85, 'thud', { gain: 0.4 });
  for (let i = 0; i < 15; i += 4) cue(tSlowly + 0.05 + i * 0.11, 'tock', { gain: 0.25 });
  cue(tSlowly, 'heartbeat', { gain: 0.35, dur: 1.6 });

  // c3 · the meal is placed outside
  add({ id: 'c3', at: T11, cam: [540, 980], zoom: 0.1, note: 'banana-leaf meal (rice, banana, mango, clay pot) slides in; pen outline + dye bleed; steam; OUTSIDE patch',
    draw(lt) {
      cloth('n'); ctx.fillStyle = rgba(NIGHT, 0.25); ctx.fillRect(0, 0, W, H);
      band(1190, 'creeper', COT, IND, MUS);
      ctx.fillStyle = rgba(INDL, 0.35); ctx.fillRect(0, 1254, W, 300);
      const sl = eo(clamp(lt / 0.4));
      ell(560 + (1 - sl) * 500, 1140, 400, 40, 'rgba(8,10,24,0.35)');
      meal(540 + (1 - sl) * 500, 1080, 1.0, clamp(lt / 0.7), clamp((lt - 0.25) / 0.8), COT);
      const sa = clamp((lt - 0.5) * 2);
      curls(830, 880, lt, 3, COT, 0.75 * sa, 520, -40); curls(480, 990, lt + 1.3, 3, COT, 0.6 * sa, 560, 30);
      patch('OUTSIDE', 300, 520, 52, (lt - (tOutside - T11)) / 0.3, -0.05);
      weave(0.9); vig(0.4);
    } });
  cue(T11 + 0.36, 'plop', { gain: 0.6 }); cue(tOutside, 'pop', { gain: 0.5 }); cue(T11 + 0.5, 'sizzle', { gain: 0.15, dur: 1.0 });

  // c4 · close enough to see and smell: the wall between them
  const SIGHT = resample([[330, 800], [560, 780], [820, 1190]], 20);
  add({ id: 'c4', at: tClose, cam: [540, 860], zoom: 0.06, note: 'cut-through wall with barred window: her silhouette inside, food outside; stitched sight line on see, scent curls drift in on smell',
    draw(lt) {
      cloth('n');
      ctx.fillStyle = 'rgba(8,10,28,0.55)'; ctx.fillRect(0, 0, 480, H);
      ctx.fillStyle = rgba(INDL, 0.22); ctx.fillRect(620, 0, W - 620, H);
      ctx.fillStyle = NIGHT; ctx.fillRect(0, 1300, W, 300); ctx.strokeStyle = COT; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 1300); ctx.lineTo(W, 1300); ctx.stroke();
      // wall with window opening
      ctx.save(); ctx.beginPath(); ctx.rect(470, 240, 150, 1060); ctx.rect(470, 690, 150, 230); ctx.fillStyle = WALLN; ctx.fill('evenodd'); ctx.restore();
      ctx.strokeStyle = rgba(COT, 0.2); ctx.lineWidth = 3; ctx.beginPath(); for (let y = 300; y < 1300; y += 60) { if (y > 680 && y < 930) continue; ctx.moveTo(470, y); ctx.lineTo(620, y); } ctx.stroke();
      ctx.strokeStyle = COT; ctx.lineWidth = 6; ctx.strokeRect(470, 240, 150, 1060); ctx.strokeRect(470, 690, 150, 230);
      bars([500, 545, 590], 690, 920, 16);
      queen('sil', 270, 1300, 0.62);
      ctx.save(); ctx.translate(840, 1250); ctx.scale(0.42, 0.42); ctx.translate(-840, -1250); meal(840, 1250, 1, 1, 1, COT); ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp((lt - (tSee - tClose) + 0.1) * 3); stitches(SIGHT, (lt - (tSee - tClose) + 0.1) / 0.5, MUS, 5, false); ctx.restore();
      const sm = clamp((lt - (tSmell - tClose)) * 2.5);
      if (sm > 0) {
        ctx.save(); ctx.lineCap = 'round'; ctx.setLineDash([14, 12]);
        for (let i = 0; i < 3; i++) {
          const ph = clamp(sm * 1.4 - i * 0.15); if (ph <= 0) continue;
          ctx.beginPath();
          for (let k = 0; k <= 30; k++) { const u = k / 30 * ph, x = lerp(830 + i * 30, 380, u), y = lerp(1170 - i * 10, 740 + i * 50, Math.pow(u, 0.6)) + Math.sin(u * 10 + lt * 4 + i * 2) * 14; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.lineDashOffset = -lt * 60; ctx.strokeStyle = i % 2 ? MUS : rgba(COT, 0.85); ctx.lineWidth = 6; ctx.stroke();
        }
        ctx.restore();
      }
      curls(890, 1180, lt, 2, COT, 0.5, 260, -30, 4);
      patch('SEE', 820, 520, 40, (lt - (tSee - tClose)) / 0.25, 0.05);
      patch('SMELL', 830, 620, 40, (lt - (tSmell - tClose)) / 0.25, -0.04);
      weave(0.9); vig(0.4);
    } });
  cue(tSee, 'sparkle', { gain: 0.3 }); cue(tSmell, 'inhale', { gain: 0.5 });

  // c5 · never to reach: an arm through the bars stops short
  const GAP = resample([[700, 1036], [780, 1090]], 12);
  add({ id: 'c5', at: tNever, cam: [620, 1000], zoom: 0.1, note: 'through the barred window: an arm reaches out and stops short of the food; stitched gap; OUT OF REACH',
    draw(lt) {
      cloth('n'); ctx.fillStyle = rgba(WALLN, 0.85); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = rgba(COT, 0.14); ctx.lineWidth = 3; ctx.beginPath(); for (let y = 40, r = 0; y < H; y += 70, r++) { ctx.moveTo(0, y); ctx.lineTo(W, y); for (let x = (r % 2) * 70; x < W; x += 140) { ctx.moveTo(x, y); ctx.lineTo(x, y + 70); } } ctx.stroke(); ctx.restore();
      // opening: outside night
      ctx.save(); ctx.beginPath(); ctx.rect(160, 420, 760, 800); ctx.fillStyle = IND; ctx.fill(); ctx.clip();
      blit(clothBg('n'), 0, 0, 0, 0, 1); stars(lt, 18, 430, 900, 0.9, 9); moon(780, 540, 40);
      ctx.fillStyle = NIGHT; ctx.fillRect(160, 1140, 760, 90); ctx.strokeStyle = COT; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(160, 1140); ctx.lineTo(920, 1140); ctx.stroke();
      meal(870, 1120, 0.36, 1, 1, COT); curls(900, 1060, lt, 2, COT, 0.45, 220, 0, 4);
      ctx.restore();
      ctx.strokeStyle = COT; ctx.lineWidth = 8; ctx.strokeRect(160, 420, 760, 800);
      ctx.fillStyle = NIGHT; ctx.fillRect(130, 1220, 820, 46); ctx.strokeRect(130, 1220, 820, 46);
      bars([287, 413, 540, 667, 793], 420, 1220, 30);
      const r = eo(clamp((lt - 0.1) / 0.7)), tr = Math.sin(lt * 9) * 3 * clamp(lt - 0.8);
      arm(-60, 1580, lerp(240, 600, r) + tr, lerp(1320, 1010, r));
      const gp = clamp((lt - 0.85) / 0.4); stitches(GAP, gp, MUS, 6, false);
      if (gp > 0.9) { ctx.save(); ctx.strokeStyle = MUS; ctx.lineWidth = 5; for (const [x, y] of [[700, 1036], [780, 1090]]) { ctx.beginPath(); ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 10, y + 10); ctx.moveTo(x + 10, y - 10); ctx.lineTo(x - 10, y + 10); ctx.stroke(); } ctx.restore(); }
      big('OUT OF REACH', 540, 260, 104, COT, MAD, clamp((lt - 0.4) * 4), 1 + 0.15 * (1 - eo(clamp((lt - 0.4) * 4))));
      weave(0.9); vig(0.4);
    } });
  cue(tNever, 'zip', { gain: 0.4 }); cue(tReach + 0.2, 'heartbeat', { gain: 0.5, dur: 1.2 });

  // c6 · a historian writing in 1917
  add({ id: 'c6', at: T12, cam: [540, 820], zoom: 0.07, note: 'printed book on indigo; a quill writes generic type lines; 1917 prints on the right page; RECORD patch',
    draw(lt) {
      blit(bookImg(), 0, 0, 0, 0, 1);
      const wp = clamp(lt / 1.6) * BOOKROWS.length; let qx = 190, qy = 548;
      BOOKROWS.forEach((r, i) => { const p = clamp(wp - i); if (p > 0) { typeRow(190, r.y, r.ws, p, rgba(INK, 0.8)); qx = 190 + p * r.end; qy = r.y; } });
      const ln = tNine - T12, pr = clamp((lt - ln) / 0.18);
      const rp = clamp((lt - ln - 0.2) / 0.7) * 10;
      for (let i = 0; i < 10; i++) { const r = BOOKROWS[i + 4]; typeRow(590, r.y + 20, r.ws, clamp(rp - i), rgba(INK, 0.8)); }
      big('1917', 742, 630, 150, INK, MAD, pr, 1 + 0.35 * (1 - eo(pr)), 0, 330);
      quill(qx + 6, qy + 4, -0.45 + Math.sin(lt * 18) * 0.03 * (lt < 1.6 ? 1 : 0));
      patch('RECORD', 820, 1300, 40, (lt - ln - 0.6) / 0.3, 0.05);
      weave(0.9); vig(0.35);
    } });
  cue(T12, 'whoosh', { gain: 0.35 }); cue(tNine, 'thud', { gain: 0.7 }); cue(tNine + 0.6, 'pop', { gain: 0.4 });

  // c7 · called that source unreliable
  add({ id: 'c7', at: tCalled, cam: [540, 820], zoom: 0.06, note: 'page close: LATER STORY box; UNRELIABLE? prints in madder; UNCERTAIN patch',
    draw(lt) {
      cloth('n');
      ctx.fillStyle = 'rgba(8,10,24,0.4)'; ctx.fillRect(126, 262, 860, 1160);
      ctx.beginPath(); ctx.moveTo(110, 260); ctx.quadraticCurveTo(540, 230, 970, 260); ctx.lineTo(970, 1400); ctx.quadraticCurveTo(540, 1380, 110, 1400); ctx.closePath(); ctx.fillStyle = PAPER; ctx.fill();
      ctx.save(); ctx.clip(); ctx.globalAlpha = 0.25; ctx.fillStyle = ctx.createPattern(blotTile(), 'repeat'); ctx.fillRect(100, 200, 900, 1250); ctx.restore();
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
      for (let i = 0; i < 20; i++) { const y = 330 + i * 52; if (y > 560 && y < 1020) continue; if (y > 1040 && y < 1240) continue; const r = BOOKROWS[i % 15]; ctx.save(); ctx.translate(200, y); ctx.scale(2.0, 1.2); typeRow(0, 0, r.ws, 1, rgba(INK, 0.7)); ctx.restore(); }
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(210, 600, 660, 400); ctx.lineWidth = 2; ctx.strokeRect(222, 612, 636, 376);
      // tiny locked-door drawing in the box
      ctx.save(); ctx.translate(340, 830); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-70, 120); ctx.lineTo(-70, -40); ctx.arc(0, -40, 70, Math.PI, 0); ctx.lineTo(70, 120); ctx.closePath(); ctx.fillStyle = MADD; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-70, 30); ctx.lineTo(70, 30); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 52, 12, Math.PI, 0); ctx.stroke(); ctx.fillStyle = MUS; ctx.fillRect(-16, 52, 32, 28); ctx.strokeRect(-16, 52, 32, 28); ctx.restore();
      patch('LATER STORY', 640, 800, 36, 1, -0.04);
      const up = clamp((lt - (tUnrel - tCalled)) / 0.16);
      big('UNRELIABLE?', 540, 1140, 120, MAD, INK, up, 1 + 0.4 * (1 - eo(up)), -0.05, 860);
      patch('UNCERTAIN', 560, 470, 46, (lt - (tUnrel - tCalled) - 0.5) / 0.3, 0.04);
      weave(0.9); vig(0.3);
    } });
  cue(tUnrel, 'slam', { gain: 0.7 }); cue(tUnrel + 0.5, 'pop', { gain: 0.5 });

  // c8 · may stay a mystery: a big "?" sewn in running stitch
  const QP = resample([...arcPts(540, 640, 200, Math.PI * 1.08, Math.PI * 2.3, 50), [600, 900], [552, 980], [540, 1060]], 26);
  const QD = resample(arcPts(540, 1210, 36, -Math.PI / 2, Math.PI * 1.5, 24), 14);
  add({ id: 'c8', at: tTrue, cam: [540, 820], zoom: 0.08, note: 'a big ? sewn in cream running stitch by a needle on indigo, faint door behind; MYSTERY',
    draw(lt, d) {
      cloth('n');
      ctx.save(); ctx.globalAlpha = 0.16; ctx.translate(540, 820); ctx.scale(0.9, 0.9); ctx.translate(-540, -900); blit(roomImg(), 0, 0, 0, 0, 1); ctx.restore();
      ctx.fillStyle = rgba(IND, 0.35); ctx.fillRect(0, 0, W, H);
      stars(lt, 30, 120, 1400, 0.7, 13);
      const sp = clamp((lt - 0.1) / 1.9);
      stitches(QP, sp, COT, 16, true, COT);
      stitches(QD, clamp((lt - 2.0) / 0.35), MUS, 14, false);
      const mp = clamp((lt - (tMyst - tTrue)) / 0.25);
      big('MYSTERY', 540, 250, 130, COT, MAD, mp, 1 + 0.3 * (1 - eo(mp)));
      weave(0.9); vig(0.45);
    } });
  cue(tTrue, 'zip', { gain: 0.35, dur: 1.8 }); cue(tMyst, 'drum', { gain: 0.6 });

  // c9 · dawn: the indigo washes off, the stitched road runs to the horizon
  add({ id: 'c9', at: T13, cam: [540, 760], zoom: 0.07, note: 'dawn: indigo washes off; stitched road with avenue trees to a rising sun; HER ROADS / OUTLIVED HER',
    draw(lt) {
      roadScene(lt);
      const tp = clamp((lt - (tOutlived - T13) + 0.35) / 0.3);
      big('HER ROADS', 540, 150, 120, INK, MAD, tp, 1 + 0.2 * (1 - eo(tp)));
      big('OUTLIVED HER', 540, 278, 104, MAD, INK, clamp((tp - 0.4) / 0.6), 1);
      const wp = clamp(lt / 0.6);
      if (wp < 1) { const lev = lerp(-600, H + 640, eio(wp)); ctx.save(); belowFront(lev, -1); ctx.clip(); ctx.globalAlpha = 1 - wp * 0.2; cloth('n'); ctx.restore(); frontEdge(lev, -1, INDL, 0.4 * (1 - wp)); }
      weave(0.8);
    } });
  cue(T13, 'swell', { gain: 0.5, dur: 1.5 }); cue(tOutlived, 'pop', { gain: 0.5 });

  // c10 · registers glide down to an empty frame; then the cloth folds
  const R3 = resample([[170, 1840], [910, 1840], [910, 2540], [170, 2540], [170, 1840]], 24);
  add({ id: 'c10', at: tLast, cam: [540, 860], zoom: 0.05, note: 'cloth registers glide (reign, roads) to an empty stitched frame: NO CLEAR RECORD; cloth folds shut',
    draw(lt, d) {
      const scene = () => {
        const oy = lerp(-200, -1330, eio(clamp(lt / 1.4)));
        cloth('d');
        ctx.save(); ctx.translate(0, oy);
        blit(tallImg(), 0, 0, 0, 0, 1);
        stitches(R3, clamp((lt - 0.6) / 0.9), MAD, 8, true);
        const gh = 0.1 + 0.06 * Math.sin(lt * 3);
        ctx.save(); ctx.globalAlpha = gh * clamp(lt - 1.2); ctx.setLineDash([6, 14]); ctx.translate(540, 2470); ctx.scale(0.62, 0.62); ctx.translate(-240, -1060); ctx.drawImage(qImg('day'), 0, 0); ctx.restore();
        patch('NO CLEAR RECORD', 540, 2190, 50, (lt - (tNo - tLast)) / 0.35, -0.03);
        ctx.restore();
        weave(0.8);
      };
      const fp = clamp((lt - (d - 0.45)) / 0.45);
      if (fp <= 0) { scene(); return; }
      const b = buf('c:fold', W, H); renderTo(b, scene);
      ctx.fillStyle = SHADE; ctx.fillRect(-40, -40, W + 80, H + 80);
      const k = Math.cos(eio(fp) * Math.PI / 2), mid = 960, hh = 960 * k;
      ctx.drawImage(b, 0, 0, W, 960, 0, mid - hh, W, hh);
      ctx.drawImage(b, 0, 960, W, 960, 0, mid, W, hh);
      ctx.fillStyle = `rgba(30,22,17,${0.45 * fp})`; ctx.fillRect(0, mid - hh, W, hh);
      const g = ctx.createLinearGradient(0, mid - 40, 0, mid + 40); g.addColorStop(0, 'rgba(30,22,17,0)'); g.addColorStop(0.5, `rgba(30,22,17,${0.5 * fp})`); g.addColorStop(1, 'rgba(30,22,17,0)'); ctx.fillStyle = g; ctx.fillRect(0, mid - 40, W, 80);
    } });
  cue(tLast, 'whoosh', { gain: 0.4 }); cue(tNo, 'pop', { gain: 0.55 }); cue(T14 - 0.45, 'slide', { gain: 0.45 });

  // c11 · end card
  add({ id: 'c11', at: T14, cam: [540, 820], zoom: 0.05, note: 'end card: AAZHI on a swaying madder cloth banner with creeper borders, FOLLOW, for the next chronicle',
    draw(lt, d) {
      cloth('d');
      band(110, 'tri', INK, COT, MAD); band(1420, 'tri', INK, COT, MUS);
      const b = buf('c:ban', BW, BH);
      const ap = clamp((lt - 0.15) / 0.7), fp = clamp((lt - 0.45) / 0.6);
      renderTo(b, () => {
        ctx.drawImage(bannerCloth(), 0, 0);
        ctx.save(); ctx.font = '900 184px Inter'; ctx.letterSpacing = '12px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (fp > 0) { const r = 520 * eo(fp) + 1, g = ctx.createRadialGradient(480, 345, 0, 480, 345, r); g.addColorStop(0, MAD); g.addColorStop(0.8, MAD); g.addColorStop(1, rgba(MAD, 0)); ctx.fillStyle = g; ctx.fillText('AAZHI', 488, 352);
          const g2 = ctx.createRadialGradient(480, 345, 0, 480, 345, r); g2.addColorStop(0, IND); g2.addColorStop(0.8, IND); g2.addColorStop(1, rgba(IND, 0)); ctx.fillStyle = g2; ctx.fillText('AAZHI', 480, 345); }
        ctx.setLineDash(ap < 1 ? [1400 * ap, 2800] : []); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.strokeText('AAZHI', 480, 345);
        ctx.restore(); ctx.letterSpacing = '0px';
      });
      const up = eo(clamp(lt / 0.45)), bx = 60, by = 820 - BH / 2 + 30, n = 24, sw = BW / n;
      for (let i = 0; i < n; i++) {
        const dy = Math.sin(lt * 2.2 - i * 0.32) * 8, hh = BH * up;
        ctx.drawImage(b, i * sw, 0, sw + 0.6, BH, bx + i * sw, by + (BH - hh) / 2 + dy, sw + 0.6, hh);
        const sh = Math.cos(lt * 2.2 - i * 0.32) * 0.07; ctx.fillStyle = sh > 0 ? `rgba(255,248,230,${sh})` : `rgba(30,22,17,${-sh})`; ctx.fillRect(bx + i * sw, by + (BH - hh) / 2 + dy, sw + 0.6, hh * 0.89);
      }
      big('FOLLOW', 540, 330, 120, INK, MAD, clamp(lt * 4), 1 + 0.2 * (1 - eo(clamp(lt * 4))));
      const np = clamp((lt - (tNext - T14) + 0.2) / 0.3);
      note('for the next chronicle', 540, 1270, 64, INK, np);
      stitches(resample([[290, 1335], [790, 1335]], 18), clamp((lt - (tNext - T14)) / 0.8), MAD, 6, true);
      weave(0.8);
    } });
  cue(T14, 'bell', { gain: 0.55 }); cue(tNext, 'sparkle', { gain: 0.45 }); cue(T14 + 0.2, 'swell', { gain: 0.35, dur: 2 });
}
