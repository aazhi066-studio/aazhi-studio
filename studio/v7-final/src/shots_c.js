// EPISODE 7 · worker C : "Sand-Bottle Strata", lines 10-13 (the 785 BCE date, new digs, the ground remembers, end card)
//   c1 brush-reveal: a soft brush sweeps loose grains off the trench wall, a black charcoal fleck appears ("CHARCOAL")
//   c2 strata-depth clock: from the surface ("TODAY") the coral marker slides down the sand bands to the fleck: "≈ 785 BCE", "ONE SAMPLE"
//   c3 pull back: the whole column in a glass slice, a coral arrow from today to the fleck, "≈ 2,800 YEARS" counts up; sand pours in
//   c4 the pour drains away: top-down night field of untouched sand, one small lit trench; zoom out until it is tiny; hidden glints
//   c5 survey pegs pop and strings snap out many new trench outlines across the field: "NEW DIGS ANNOUNCED"; sand pours in
//   c6 the pour drains to reveal the tall glass sand bottle with all the film's layers; the sea band drains away
//   c7 close on the sand top: the last iridescent pearl glints, then sinks into the strata
//   c8 the full bottle: the pearl glows faintly underground; faint memories (urn, sherd, charcoal) light up in their layers
//   c9 end card: AAZHI poured in banded sand, "FOLLOW", "for the next chronicle", a pearl glint
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { lg, rgba, mixc, cached, blit } from './art.js';

const INDIGO = '#0B2233', INDIGO2 = '#12354D', TEAL = '#1F7A86', CREAM = '#EADBB8', OCHRE = '#D2A45A', RUST = '#A9542E', SILT = '#5B4636', MUD = '#7A5A3C';
const PEARL = '#F4EFE6', PINK = '#F2C6D2', AQUA = '#A9E1DC', CORAL = '#E5533D', SHADOW = '#06141E';

// ───────────── grain + type helpers ─────────────
const grainTile = () => cached('c:grain', 256, 256, 1, () => {
  for (let i = 0; i < 2600; i++) {
    const dk = rnd(i * 1.37) < 0.55, a = 0.1 + rnd(i * 2.9) * 0.22;
    ctx.fillStyle = dk ? `rgba(38,24,12,${a})` : `rgba(255,246,222,${a * 0.9})`;
    const r = 0.6 + Math.pow(rnd(i * 4.1), 2) * 1.9; ctx.beginPath(); ctx.arc(rnd(i * 3.3) * 256, rnd(i * 7.7 + 1) * 256, r, 0, TAU); ctx.fill();
  }
});
const grainFill = (x, y, w, h, a = 1) => { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat'); ctx.fillRect(x, y, w, h); ctx.restore(); };

function big(s, x, y, size, col = CREAM, a = 1, ls = 0.06, sc = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * ls) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = rgba(SHADOW, 0.75); ctx.fillText(s, size * 0.03, size * 0.07); ctx.fillStyle = col; ctx.fillText(s, 0, 0);
  ctx.restore(); ctx.letterSpacing = '0px';
}
function note(s, x, y, size, col = CREAM, a = 1, align = 'center') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px Caladea, serif`; ctx.letterSpacing = '1px'; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillStyle = rgba(SHADOW, 0.8); ctx.fillText(s, x + 2, y + 3); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
/** small coral pill tag (rounded rect), p 0..1 = pop-in */
function pill(s, x, y, size = 28, p = 1, fill = CORAL, col = '#FFF4EA') {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); const k = eob(clamp(p)); ctx.scale(k, k); ctx.globalAlpha *= clamp(p * 3);
  ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = Math.round(size * 0.12) + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s).width + size * 1.3, h = size * 1.75;
  rr(-w / 2 + 3, -h / 2 + 5, w, h, h / 2); ctx.fillStyle = rgba(SHADOW, 0.5); ctx.fill();
  rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill();
  ctx.fillStyle = col; ctx.fillText(s, size * 0.06, size * 0.04); ctx.restore(); ctx.letterSpacing = '0px';
}
function glowAt(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
/** floating grains in the air / water, a pure function of t */
function motes(t, n = 40, seed = 1, col = CREAM, a = 0.5, x0 = 0, y0 = 0, w = W, h = H) {
  for (let i = 0; i < n; i++) {
    const sp = 8 + rnd(i + seed) * 22, x = x0 + ((rnd(i * 3 + seed) * w + t * sp * (rnd(i * 5 + seed) < 0.5 ? 1 : -1)) % w + w) % w;
    const y = y0 + ((rnd(i * 7 + seed) * h - t * (6 + rnd(i * 9 + seed) * 14) + Math.sin(t * 0.7 + i) * 12) % h + h) % h;
    const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 1.7 + i * 2.3));
    ctx.fillStyle = rgba(col, a * tw); ctx.beginPath(); ctx.arc(x, y, 1.2 + rnd(i + 11 + seed) * 2.4, 0, TAU); ctx.fill();
  }
}
function vig(a = 0.6, cx = 540, cy = 880, r0 = 420, r1 = 1250) { const g = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1); g.addColorStop(0, 'rgba(6,20,30,0)'); g.addColorStop(1, `rgba(6,20,30,${a})`); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); }
function sparkle(x, y, s, a, col = '#FFFFFF') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.translate(x, y);
  for (const r of [0, Math.PI / 2]) { ctx.save(); ctx.rotate(r); ctx.beginPath(); ctx.moveTo(-s, 0); ctx.quadraticCurveTo(0, -s * 0.09, s, 0); ctx.quadraticCurveTo(0, s * 0.09, -s, 0); ctx.fill(); ctx.restore(); }
  ctx.globalAlpha *= 0.5; circle(0, 0, s * 0.16, col); ctx.restore();
}

// ───────────── the iridescent pearl ─────────────
function pearl(x, y, r, t, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  ell(x + r * 0.12, y + r * 0.9, r * 0.9, r * 0.22, 'rgba(6,20,30,0.35)');
  let g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.45, PEARL); g.addColorStop(0.85, '#CFC6BA'); g.addColorStop(1, '#9E968E');
  circle(x, y, r, g);
  const cg = ctx.createConicGradient(t * 0.9, x, y);
  [[0, PINK], [0.25, AQUA], [0.5, PINK], [0.75, AQUA], [1, PINK]].forEach(([o, c]) => cg.addColorStop(o, c));
  ctx.globalAlpha = a * 0.42; circle(x, y, r * 0.98, cg);
  ctx.globalAlpha = a; g = ctx.createRadialGradient(x, y, r * 0.55, x, y, r); g.addColorStop(0, 'rgba(244,239,230,0)'); g.addColorStop(1, 'rgba(244,239,230,0.35)'); circle(x, y, r, g);
  const ha = -2.2 + Math.sin(t * 1.3) * 0.5, hx = x + Math.cos(ha) * r * 0.45, hy = y + Math.sin(ha) * r * 0.45;
  ell(hx, hy, r * 0.22, r * 0.12, 'rgba(255,255,255,0.9)', ha + Math.PI / 2);
  circle(x + r * 0.35, y + r * 0.42, r * 0.07, 'rgba(255,255,255,0.5)');
  ctx.restore();
}

// ───────────── sand-pour transitions ─────────────
const surf = (x0, x1, f) => { ctx.beginPath(); ctx.moveTo(x0, H + 60); for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, f(x)); ctx.lineTo(x1, H + 60); ctx.closePath(); };
function sandLayer(f, col, t) {
  surf(-300, W + 300, f); ctx.fillStyle = col; ctx.fill();
  ctx.save(); surf(-300, W + 300, f); ctx.clip(); grainFill(-300, -300, W + 600, H + 400, 1);
  for (let k = 1; k < 5; k++) { ctx.beginPath(); for (let x = -300; x <= W + 300; x += 24) { const y = f(x) + k * 70 + Math.sin(x * 0.01 + k) * 10; x === -300 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = rgba(SHADOW, 0.08); ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); for (let x = -300; x <= W + 300; x += 20) x === -300 ? ctx.moveTo(x, f(x)) : ctx.lineTo(x, f(x)); ctx.strokeStyle = 'rgba(255,246,222,0.35)'; ctx.lineWidth = 4; ctx.stroke();
}
function stream(x, y0, y1, t, w = 36, col = CREAM, n = 90) {
  if (y1 <= y0) return; ctx.fillStyle = rgba(col, 0.5); ctx.fillRect(x - w * 0.18, y0, w * 0.36, y1 - y0);
  for (let i = 0; i < n; i++) { const ph = (t * (1.6 + rnd(i) * 0.8) + rnd(i * 3.1)) % 1, yy = y0 + ph * (y1 - y0), xx = x + (rnd(i * 5.3) - 0.5) * w * (0.4 + ph * 0.6); ctx.fillStyle = i % 3 ? col : OCHRE; ctx.fillRect(xx, yy, 3.4, 3.4); }
}
/** p 0..1: a stream of grains falls from the top and fills the frame with a sand layer */
function pourIn(p, t, col = CREAM) {
  if (p <= 0) return; const lev = lerp(H + 80, -140, eio(p));
  stream(540, -20, lev, t, 44, col);
  sandLayer((x) => lev - 70 * Math.exp(-Math.pow((x - 540) / 240, 2)) + Math.sin(x * 0.02 + t * 3) * 4, col, t);
}
/** p 0..1: the sand layer drains through a slit at the bottom centre, revealing the next shot above it */
function drainOut(p, t, col = CREAM) {
  if (p >= 1) return; const lev = lerp(-140, H + 120, eio(p)), dip = 420 * Math.sin(Math.PI * clamp(p * 1.3));
  sandLayer((x) => lev + dip * Math.exp(-Math.pow((x - 540) / 200, 2)), col, t);
}

// ───────────── the trench wall (strata) ─────────────
const WALL_H = 3800, FX = 470;
const WB = [[150, CREAM], [190, OCHRE], [120, MUD], [80, CREAM], [230, RUST], [150, OCHRE], [200, SILT], [130, MUD], [220, RUST], [110, OCHRE], [190, MUD], [140, RUST], [200, SILT], [120, OCHRE], [200, '#3E3127'], [180, MUD], [400, SILT], [250, RUST], [600, SILT]];
const wbY = (k) => WB.slice(0, k).reduce((a, b) => a + b[0], 0);
const wbF = (k, x) => k === 0 ? 0 : wbY(k) + Math.sin(x * 0.006 + k * 1.7) * 9 + Math.sin(x * 0.019 + k * 4.1) * 4 + (x - 540) * 0.012 * Math.sin(k);
const FY = wbY(14) + 95;               // the charcoal fleck sits in the darkest band
const wallImg = () => cached('c:wall', W, WALL_H, 1, () => {
  WB.forEach(([h, col], k) => {
    ctx.beginPath(); ctx.moveTo(0, WALL_H); for (let x = 0; x <= W; x += 12) ctx.lineTo(x, wbF(k, x)); ctx.lineTo(W, WALL_H); ctx.closePath();
    ctx.fillStyle = mixc(col, '#241A14', 0.32 * wbY(k) / WALL_H); ctx.fill();
  });
  // laminations, pebbles, then grain over all
  for (let k = 1; k < WB.length; k++) for (let j = 1; j < 4; j++) {
    ctx.beginPath(); for (let x = 0; x <= W; x += 16) { const y = wbF(k, x) - WB[k - 1][0] * j / 4 + Math.sin(x * 0.03 + j * 2 + k) * 2.5; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = j % 2 ? 'rgba(255,240,210,0.07)' : 'rgba(30,18,10,0.09)'; ctx.lineWidth = 2; ctx.stroke();
  }
  for (let i = 0; i < 240; i++) { const x = rnd(i * 2.1) * W, y = 60 + rnd(i * 3.7) * (WALL_H - 60), r = 2 + Math.pow(rnd(i * 5.9), 3) * 10; ell(x, y, r * 1.4, r, rnd(i) < 0.5 ? 'rgba(40,26,16,0.35)' : 'rgba(250,236,205,0.28)', rnd(i * 7) * 3); }
  grainFill(0, 0, W, WALL_H, 1); grainFill(0, 0, W, WALL_H, 0.6);
  ctx.fillStyle = 'rgba(255,246,222,0.25)'; ctx.fillRect(0, 0, W, 5);
});
function charcoal(x, y, s, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const pts = []; for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, r = (i % 2 ? 26 : 36) * (0.8 + rnd(i * 3.3) * 0.4); pts.push([Math.cos(a) * r * 1.3, Math.sin(a) * r * 0.8]); }
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = '#121013'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-20, -14); ctx.lineTo(12, -22); ctx.lineTo(26, -6); ctx.lineTo(-4, -2); ctx.closePath(); ctx.fillStyle = '#2E2B31'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-30, 6); ctx.lineTo(-6, 4); ctx.lineTo(-14, 18); ctx.closePath(); ctx.fillStyle = '#232026'; ctx.fill();
  ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.25 * Math.sin(t * 3)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, -15); ctx.lineTo(8, -20); ctx.stroke();
  for (let i = 0; i < 9; i++) circle(Math.cos(i * 2.4) * (50 + rnd(i) * 30), Math.sin(i * 2.4) * (28 + rnd(i + 4) * 18), 2 + rnd(i * 5) * 3, '#18141A');
  ctx.restore();
}
function brush(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(6,20,30,0.3)'; rr(-20, -330, 52, 300, 20); ctx.fill();
  rr(-17, -360, 34, 250, 16); ctx.fillStyle = lg(-17, 0, 17, 0, [[0, '#8A5A34'], [0.45, '#B57F4C'], [1, '#6A4226']]); ctx.fill();
  rr(-24, -122, 48, 46, 6); ctx.fillStyle = lg(-24, 0, 24, 0, [[0, '#8E9496'], [0.4, '#DADDDA'], [1, '#6B7173']]); ctx.fill();
  for (let i = 0; i < 22; i++) { const u = i / 21 - 0.5; ctx.beginPath(); ctx.moveTo(u * 40, -78); ctx.quadraticCurveTo(u * 60, -30, u * 76 + Math.sin(i) * 3, 0); ctx.strokeStyle = i % 3 ? '#3A2A1E' : '#5C4634'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke(); }
  ctx.restore();
}

// ───────────── the night field (top-down) ─────────────
function field(t, sc, ox = 0, oy = 0, lit = 1) {
  ctx.fillStyle = mixc(SILT, INDIGO, 0.55); ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.save(); ctx.translate(540 + ox, 760 + oy); ctx.scale(sc, sc);
  const ext = 1600 / sc;
  for (let i = 0; i < 70; i++) {
    const y0 = -2600 + i * 75 + rnd(i) * 30; if (Math.abs(y0) > ext + 200) continue;
    ctx.beginPath(); for (let x = -2600; x <= 2600; x += 80) { const y = y0 + Math.sin(x * 0.004 + i * 1.3) * 26 + Math.sin(x * 0.011 + i) * 9; x === -2600 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.strokeStyle = i % 2 ? rgba(OCHRE, 0.13) : 'rgba(6,20,30,0.35)'; ctx.lineWidth = 6 + rnd(i * 3) * 8; ctx.stroke();
  }
  ctx.restore();
  grainFill(-300, -300, W + 600, H + 600, 0.7);
  // night: dark everywhere but a small warm pool around the one lit trench
  const r = Math.max(160, 360 * sc) * lit;
  const g = ctx.createRadialGradient(540 + ox, 760 + oy, r * 0.25, 540 + ox, 760 + oy, r * 2.6);
  g.addColorStop(0, 'rgba(6,20,30,0)'); g.addColorStop(0.4, 'rgba(6,20,30,0.45)'); g.addColorStop(1, 'rgba(6,20,30,0.82)');
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  glowAt(540 + ox, 760 + oy, r * 1.1, '#F0C890', 0.22 * lit);
}
/** a dug trench seen from above, centred at (0,0) in field units */
function trenchTop(w, h, t, lit = 1) {
  rr(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 4); ctx.fillStyle = rgba(CREAM, 0.25); ctx.fill();
  ctx.fillStyle = mixc(SILT, '#1A120C', 0.35); ctx.fillRect(-w / 2, -h / 2, w, h);
  const bands = [CREAM, OCHRE, RUST, MUD, SILT]; const fh = h * 0.42;
  bands.forEach((c, i) => { ctx.fillStyle = mixc(c, '#1A120C', 0.15 + i * 0.08); ctx.fillRect(-w / 2, -h / 2 + i * fh / 5, w, fh / 5 + 1); });
  ctx.fillStyle = 'rgba(6,20,30,0.35)'; ctx.fillRect(-w / 2, -h / 2, w * 0.1, h); ctx.fillRect(w / 2 - w * 0.1, -h / 2, w * 0.1, h);
  glowAt(w * 0.15, h * 0.18, h * 0.9, '#FFD99A', 0.5 * lit * (0.9 + 0.1 * Math.sin(t * 9)));
  circle(w * 0.15, h * 0.18, 4, `rgba(255,236,190,${lit})`);
  ctx.strokeStyle = rgba(CREAM, 0.8); ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20);
  for (const [px, py] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { circle(px * (w / 2 + 10), py * (h / 2 + 10), 7, CORAL); circle(px * (w / 2 + 10), py * (h / 2 + 10), 2.5, '#FFF4EA'); }
}
const NEW = (() => {
  const out = [];
  for (let i = -3; i <= 3; i++) for (let j = -4; j <= 4; j++) {
    if (Math.abs(i) <= 1 && Math.abs(j) <= 1 && (i === 0 && j === 0)) continue;
    const k = i * 31 + j * 7; if (rnd(k + 0.5) < 0.38 || (i === 0 && j === 0)) continue;
    const x = i * 300 + (rnd(k + 3) - 0.5) * 90, y = j * 240 + (rnd(k + 5) - 0.5) * 70;
    if (Math.hypot(x, y) < 200) continue;
    out.push({ x, y, w: 120 + rnd(k + 7) * 110, h: 60 + rnd(k + 9) * 60, d: Math.hypot(x, y * 1.2) });
  }
  out.sort((a, b) => a.d - b.d); out.forEach((o, n) => (o.t0 = 0.12 + n * 0.075)); return out;
})();
function newTrench(o, lt) {
  const p = lt - o.t0; if (p <= 0) return;
  const pegP = clamp(p / 0.25), strP = seg(p, 0.15, 0.5), fillP = seg(p, 0.45, 1.0);
  ctx.save(); ctx.translate(o.x, o.y);
  const hw = o.w / 2, hh = o.h / 2;
  if (fillP > 0) { ctx.fillStyle = rgba(CREAM, 0.12 * fillP); ctx.fillRect(-hw, -hh, o.w, o.h); }
  if (strP > 0) {
    const per = 2 * (o.w + o.h), L0 = per * eo(strP);
    ctx.setLineDash([14, 9]); ctx.lineDashOffset = -lt * 30; ctx.strokeStyle = rgba(CREAM, 0.85); ctx.lineWidth = 3.5;
    ctx.beginPath(); const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh], [-hw, -hh]]; let acc = 0; ctx.moveTo(-hw, -hh);
    for (let i = 1; i < 5; i++) { const sl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + sl <= L0) ctx.lineTo(pts[i][0], pts[i][1]); else { const u = (L0 - acc) / sl; ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); break; } acc += sl; }
    ctx.stroke(); ctx.setLineDash([]);
  }
  const k = eob(pegP);
  for (const [px, py] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ell(px * hw + 3, py * hh + 5, 10 * k, 5 * k, 'rgba(6,20,30,0.5)'); circle(px * hw, py * hh, 9 * k, CORAL); circle(px * hw - 2, py * hh - 2, 3 * k, '#FFF4EA'); }
  ctx.restore();
}

// ───────────── the glass sand bottle ─────────────
function bottlePath() {
  ctx.beginPath(); ctx.moveTo(466, 182); ctx.lineTo(466, 330); ctx.bezierCurveTo(466, 430, 232, 420, 232, 570); ctx.lineTo(232, 1760); ctx.quadraticCurveTo(232, 1846, 318, 1846);
  ctx.lineTo(762, 1846); ctx.quadraticCurveTo(848, 1846, 848, 1760); ctx.lineTo(848, 570); ctx.bezierCurveTo(848, 420, 614, 430, 614, 330); ctx.lineTo(614, 182); ctx.closePath();
}
const BL = [[0, CREAM], [70, MUD], [150, OCHRE], [250, CREAM], [300, RUST], [400, TEAL], [440, OCHRE], [530, MUD], [610, RUST], [700, CREAM], [745, SILT], [850, OCHRE], [920, RUST], [1000, SILT]];
const SAND0 = 790;
const bF = (k, x) => SAND0 + BL[k][0] + (k === 0 ? 0 : 1) * (Math.sin(x * 0.011 + k * 2.3) * (14 + rnd(k) * 26) + Math.sin(x * 0.027 + k) * 8)
  + (k === 0 ? 46 * Math.exp(-Math.pow((x - 540) / 70, 2)) - 40 * Math.exp(-Math.pow((x - 330) / 90, 2)) - 30 * Math.exp(-Math.pow((x - 760) / 80, 2)) + Math.sin(x * 0.02) * 6 : 0);
const sTop = (x) => bF(0, x);
const bottleSand = () => cached('c:bsand', W, H, 1, () => {
  ctx.save(); bottlePath(); ctx.clip();
  BL.forEach(([, col], k) => { ctx.beginPath(); ctx.moveTo(200, H); for (let x = 200; x <= 880; x += 8) ctx.lineTo(x, bF(k, x)); ctx.lineTo(880, H); ctx.closePath(); ctx.fillStyle = mixc(col, '#241A14', 0.1 + 0.3 * k / BL.length); ctx.fill(); });
  for (let k = 0; k < BL.length; k++) { ctx.beginPath(); for (let x = 200; x <= 880; x += 8) { const y = bF(k, x) + 1; x === 200 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = 'rgba(255,246,222,0.18)'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-atop';
  grainFill(200, 700, 680, 1220, 1); grainFill(200, 700, 680, 1220, 0.6);
  // a soft dark edge inside the glass (curvature)
  ctx.fillStyle = lg(232, 0, 848, 0, [[0, 'rgba(6,20,30,0.45)'], [0.12, 'rgba(6,20,30,0)'], [0.85, 'rgba(6,20,30,0)'], [1, 'rgba(6,20,30,0.5)']]); ctx.fillRect(200, 600, 680, 1300);
  ctx.globalCompositeOperation = 'source-over'; ctx.restore();
});
function glass(t, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  bottlePath(); ctx.strokeStyle = 'rgba(169,225,220,0.45)'; ctx.lineWidth = 7; ctx.stroke();
  bottlePath(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); bottlePath(); ctx.clip();
  ctx.fillStyle = lg(250, 0, 300, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.26)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(250, 560, 50, 1220);
  ctx.fillStyle = lg(800, 0, 830, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.14)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(800, 600, 30, 1150);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(484, 200, 14, 140);
  const sx = -400 + ((t * 260) % 2000); ctx.translate(sx, 0); ctx.rotate(-0.35);
  ctx.fillStyle = lg(0, 0, 120, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.1)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, -200, 120, 2600);
  ctx.restore();
  // lip + cork
  rr(452, 168, 176, 24, 10); ctx.fillStyle = 'rgba(169,225,220,0.35)'; ctx.fill();
  rr(478, 108, 124, 74, 14); ctx.fillStyle = lg(478, 0, 602, 0, [[0, '#7A5A3C'], [0.4, '#B58A5C'], [1, '#5B4636']]); ctx.fill();
  for (let i = 0; i < 26; i++) circle(484 + rnd(i * 3.1) * 112, 114 + rnd(i * 5.7) * 62, 1.5 + rnd(i) * 2, 'rgba(50,30,15,0.45)');
  ctx.restore();
}
/** the whole bottle scene in bottle units. o.sea = water top y (null = no sea), o.py = pearl y (null = none), o.mem = memories 0..1 */
function bottleScene(t, o = {}) {
  const bg = ctx.createRadialGradient(540, 800, 100, 540, 900, 1300); bg.addColorStop(0, INDIGO2); bg.addColorStop(1, '#06141E');
  ctx.fillStyle = bg; ctx.fillRect(-600, -600, W + 1200, H + 1200);
  // a light shaft behind the bottle + grains in it
  ctx.save(); ctx.translate(700, -100); ctx.rotate(0.28); ctx.fillStyle = lg(-160, 0, 160, 0, [[0, 'rgba(234,219,184,0)'], [0.5, 'rgba(234,219,184,0.07)'], [1, 'rgba(234,219,184,0)']]); ctx.fillRect(-160, 0, 320, 2400); ctx.restore();
  motes(t, 46, 7, CREAM, 0.4);
  ctx.save(); bottlePath(); ctx.clip();
  ctx.fillStyle = 'rgba(169,225,220,0.06)'; ctx.fillRect(200, 150, 700, 1750);
  if (o.sea != null && o.sea < 1700) {
    ctx.beginPath(); ctx.moveTo(200, H); for (let x = 200; x <= 880; x += 10) ctx.lineTo(x, o.sea + Math.sin(x * 0.02 + t * 3) * 7 + Math.sin(x * 0.047 - t * 2) * 3); ctx.lineTo(880, H); ctx.closePath();
    ctx.fillStyle = lg(0, o.sea, 0, o.sea + 400, [[0, TEAL], [1, INDIGO2]]); ctx.fill();
    ctx.beginPath(); for (let x = 200; x <= 880; x += 10) { const y = o.sea + Math.sin(x * 0.02 + t * 3) * 7 + Math.sin(x * 0.047 - t * 2) * 3; x === 200 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = 'rgba(169,225,220,0.7)'; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < 14; i++) { const ph = (t * 0.5 + rnd(i * 2.2)) % 1, by = lerp(sTop(300 + i * 34) - 20, o.sea + 10, ph); if (by > o.sea + 8) { ctx.beginPath(); ctx.arc(290 + rnd(i * 4.4) * 500, by, 3 + rnd(i) * 5, 0, TAU); ctx.strokeStyle = 'rgba(169,225,220,0.55)'; ctx.lineWidth = 2; ctx.stroke(); } }
  }
  ctx.restore();
  const pr = o.pr ?? 30;
  if (o.py != null) pearl(540, o.py, pr, t);
  blit(bottleSand(), 0, 0, 0, 0, 1);
  if (o.mem) memories(t, o.mem);
  if (o.py != null) {
    const under = clamp((o.py - sTop(540)) / 60);
    if (under > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const pulse = 0.75 + 0.25 * Math.sin(t * 2.6);
      glowAt(540, o.py, pr * 5, PINK, 0.22 * under * pulse); glowAt(540, o.py, pr * 2.4, AQUA, 0.28 * under * pulse);
      ctx.restore(); pearl(540, o.py, pr, t, 0.42 * under);
    }
  }
  glass(t, 1);
}
/** faint line memories of the film, embedded in their layers */
function memories(t, p) {
  const items = [
    { x: 360, y: 1070, k: 'urn', tag: 'URNS', tx: 115, c: 0 },
    { x: 715, y: 985, k: 'sherd', tag: 'SHERDS', tx: 965, c: 0.25 },
    { x: 690, y: 1225, k: 'char', tag: '785 BCE', tx: 965, c: 0.5 },
    { x: 380, y: 1790, k: 'shell', tag: 'PEARLS', tx: 115, c: 0.7 },
  ];
  ctx.save();
  for (const it of items) {
    const a = seg(p, it.c, it.c + 0.3); if (a <= 0) continue;
    const fl = 0.75 + 0.25 * Math.sin(t * 2 + it.x);
    ctx.save(); ctx.translate(it.x, it.y); ctx.globalAlpha = a * fl;
    ctx.globalCompositeOperation = 'lighter'; glowAt(0, 0, 90, CREAM, 0.12); ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(255,246,222,0.8)'; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (it.k === 'urn') { ctx.beginPath(); ctx.moveTo(-18, -52); ctx.lineTo(18, -52); ctx.quadraticCurveTo(10, -38, 34, -20); ctx.quadraticCurveTo(58, 10, 26, 46); ctx.lineTo(-26, 46); ctx.quadraticCurveTo(-58, 10, -34, -20); ctx.quadraticCurveTo(-10, -38, -18, -52); ctx.stroke(); }
    else if (it.k === 'sherd') { ctx.beginPath(); ctx.moveTo(-44, -20); ctx.lineTo(30, -32); ctx.lineTo(48, 10); ctx.lineTo(4, 30); ctx.lineTo(-40, 16); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(0, -12, 16, 0); ctx.quadraticCurveTo(0, 12, -18, 0); ctx.moveTo(16, 0); ctx.lineTo(26, -8); ctx.moveTo(16, 0); ctx.lineTo(26, 8); ctx.stroke(); }
    else if (it.k === 'char') { charcoal(0, 0, 0.6, t); circle(0, 0, 9, CORAL); ctx.strokeStyle = CORAL; ctx.beginPath(); ctx.arc(0, 0, 30 + 6 * Math.sin(t * 3), 0, TAU); ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(0, 0, 46, 28, 0, Math.PI, TAU); ctx.lineTo(46, 0); ctx.quadraticCurveTo(0, 18, -46, 0); ctx.stroke(); for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(i * 18, -24 + Math.abs(i) * 5); ctx.stroke(); } }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = rgba(CORAL, 0.6); ctx.lineWidth = 2; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(it.tx + (it.tx < 540 ? 70 : -78), it.y); ctx.lineTo(it.x + (it.tx < 540 ? -60 : 60), it.y); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    pill(it.tag, it.tx, it.y, 25, a, CORAL);
  }
  ctx.restore();
}

// ───────────── AAZHI wordmark in banded sand ─────────────
const MW = 1000, MH = 300;
const markImg = () => cached('c:mark', MW, MH, 1, () => {
  const cols = [SILT, RUST, OCHRE, MUD, CREAM, OCHRE, CREAM];
  ctx.fillStyle = CREAM; ctx.fillRect(0, 0, MW, MH);
  cols.map((c, k) => [c, k]).reverse().forEach(([c, k]) => { ctx.beginPath(); ctx.moveTo(0, MH + 10); for (let x = 0; x <= MW; x += 10) ctx.lineTo(x, MH - k * 44 - 20 + Math.sin(x * 0.012 + k * 2) * 12 + Math.sin(x * 0.031 + k) * 5); ctx.lineTo(MW, MH + 10); ctx.lineTo(0, MH + 10); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); });
  grainFill(0, 0, MW, MH, 1);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.font = '900 236px Inter'; ctx.letterSpacing = '14px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('AAZHI', MW / 2 + 7, MH / 2 + 10); ctx.letterSpacing = '0px';
  ctx.globalCompositeOperation = 'source-over';
});
const markGhost = () => cached('c:markg', MW, MH, 1, () => {
  ctx.font = '900 236px Inter'; ctx.letterSpacing = '14px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = 'rgba(169,225,220,0.35)'; ctx.lineWidth = 3; ctx.strokeText('AAZHI', MW / 2 + 7, MH / 2 + 10); ctx.letterSpacing = '0px';
});

export function buildC(add, cue) {
  const t1 = L(10) - 0.5, t2 = Wd('dated', 10), t3 = Wd('nearly', 10) - 0.1, t4 = L(11) - 0.3, t5 = Wd('new', 11) - 0.1;
  const t6 = L(12) - 0.35, t7 = Wd('pearls', 12) - 0.12, t8 = Wd('ground', 12) + 0.15, t9 = L(13) - 0.35;

  // ── c1: brush reveal of the charcoal fleck ──
  const GR = Array.from({ length: 340 }, (_, i) => { const a = rnd(i * 1.3) * TAU, r = Math.sqrt(rnd(i * 2.7)) * 125; const x = Math.cos(a) * r * 1.25, y = Math.sin(a) * r * 0.8; return { x, y, tr: 0.35 + clamp((x + 160) / 320) * 0.85 + rnd(i * 4.4) * 0.35, c: [OCHRE, CREAM, MUD, RUST][i % 4], s: 3 + rnd(i * 6.1) * 4, v: 0.6 + rnd(i * 8.1) }; });
  add({ id: 'c1', at: t1, cam: [540, 760], zoom: 0.07, note: 'brush-reveal on the trench wall: loose grains swept off a charcoal fleck', draw(lt, d, t) {
    const s = 1.7, px = 540 + lt * 6, py = 790;
    ctx.fillStyle = INDIGO; ctx.fillRect(0, 0, W, H);
    blit(wallImg(), FX, FY, px, py, s);
    ctx.save(); ctx.translate(-200, -100); ctx.rotate(-0.3); ctx.fillStyle = lg(0, 0, 520, 0, [[0, 'rgba(255,240,210,0)'], [0.5, 'rgba(255,240,210,0.09)'], [1, 'rgba(255,240,210,0)']]); ctx.fillRect(300, -200, 520, 2600); ctx.restore();
    const rev = seg(lt, 0.4, 1.5);
    charcoal(px, py, 1.7, t);
    // loose sand mound over the fleck, thinning as the brush works
    ctx.save(); ctx.globalAlpha = 1 - eo(rev); ell(px, py, 165, 105, mixc(OCHRE, SILT, 0.35)); ctx.restore();
    for (const g of GR) {
      const k = lt - g.tr; let x = px + g.x, y = py + g.y, a = 1;
      if (k > 0) { x += k * 420 * g.v * (g.x > 0 ? 1 : 0.6); y += -k * 160 * g.v + 700 * k * k; a = clamp(1 - k * 1.4); }
      if (a <= 0) continue; ctx.globalAlpha = a; ctx.fillStyle = g.c; ctx.fillRect(x, y, g.s, g.s);
    }
    ctx.globalAlpha = 1;
    // the brush sweeps
    const bp = seg(lt, 0.15, 1.7), bx = px - 150 + 300 * bp + Math.sin(lt * 15) * 40, by = py + 30 + Math.sin(lt * 7) * 18;
    const bin = clamp(lt / 0.25) * clamp((2.0 - lt) / 0.3);
    brush(lerp(bx + 500, bx, eo(bin)), lerp(by - 300, by, eo(bin)), 0.55 + Math.sin(lt * 15) * 0.12);
    motes(t, 36, 3, CREAM, 0.55, 0, 200, W, 1100);
    vig(0.55, 540, 790);
    const cp = seg(lt, 1.35, 1.75);
    if (cp > 0) { ctx.beginPath(); ctx.arc(px, py, 90 + 30 * eo(cp) + 4 * Math.sin(t * 4), 0, TAU); ctx.strokeStyle = rgba(CORAL, 0.9 * cp); ctx.lineWidth = 5; ctx.stroke(); note('charcoal', px + 170, py - 120, 44, CREAM, cp, 'left'); }
    big('CHARCOAL', 540, 300, 104, CREAM, seg(t, Wd('charcoal', 10) - 0.1, Wd('charcoal', 10) + 0.2), 0.08, lerp(1.15, 1, eo(seg(t, Wd('charcoal', 10) - 0.1, Wd('charcoal', 10) + 0.3))));
    pill('ONE TRENCH', 540, 415, 30, seg(t, Wd('trench', 10) - 0.1, Wd('trench', 10) + 0.25));
  } });
  cue(t1 + 0.4, 'sizzle', { gain: 0.3, dur: 1.2, pan: 0.2 });

  // ── c2: strata-depth clock: marker slides from TODAY down to the fleck ──
  const tSeven = Wd('seven', 10), tB = Wd('b', 10);
  add({ id: 'c2', at: t2, cam: [470, 760], zoom: 0.05, note: 'strata-depth clock: coral marker slides down the sand bands to the fleck, ≈ 785 BCE, ONE SAMPLE', draw(lt, d, t) {
    const arr = tSeven - t2, mp = eio(seg(lt, 0.12, arr)), m = FY * mp, MY = 760;
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#06141E'); sky.addColorStop(1, INDIGO2); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    motes(t, 30, 9, CREAM, 0.35);
    blit(wallImg(), 0, 0, 0, MY - m, 1);
    charcoal(FX, MY - m + FY, 0.8, t);
    // speed streaks while the marker travels
    const v = Math.sin(Math.PI * mp);
    if (v > 0.05) for (let i = 0; i < 22; i++) { const x = rnd(i * 3.3) * W, y = ((rnd(i * 7.1) * H - lt * 3000) % H + H) % H; ctx.fillStyle = `rgba(255,246,222,${0.18 * v})`; ctx.fillRect(x, y, 3, 120 * v); }
    vig(0.5, 540, MY);
    // the marker: coral line across + pointer
    const arrived = seg(lt, arr, arr + 0.15);
    ctx.fillStyle = rgba(CORAL, 0.25 + 0.2 * arrived); ctx.fillRect(0, MY - 10, W, 20);
    ctx.fillStyle = CORAL; ctx.fillRect(0, MY - 3, W, 6);
    ctx.beginPath(); ctx.moveTo(0, MY - 34); ctx.lineTo(62, MY); ctx.lineTo(0, MY + 34); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W, MY - 34); ctx.lineTo(W - 62, MY); ctx.lineTo(W, MY + 34); ctx.closePath(); ctx.fill();
    if (arrived > 0) { ctx.beginPath(); ctx.arc(FX, MY, 60 + 50 * eo(arrived), 0, TAU); ctx.strokeStyle = rgba('#FFF4EA', 0.8 * (1 - arrived)); ctx.lineWidth = 6; ctx.stroke(); ctx.beginPath(); ctx.arc(FX, MY, 64, 0, TAU); ctx.strokeStyle = CORAL; ctx.lineWidth = 5; ctx.stroke(); }
    pill(mp < 0.03 ? 'TODAY' : mp < 0.97 ? 'OLDER  ↓' : 'ONE SAMPLE', 820, MY + 70, 28, 1);
    note('deeper = older', 820, MY - 64, 34, CREAM, 1 - arrived);
    const a1 = seg(t, tSeven - 0.05, tSeven + 0.2), a2 = seg(t, tB - 0.05, tB + 0.2);
    big('≈ 785', 540, 400, 170, CORAL, a1, 0.04, lerp(1.25, 1, eob(a1)));
    big('BCE', 540, 555, 96, CREAM, a2, 0.2, lerp(1.25, 1, eob(a2)));
  } });
  cue(t2 + 0.12, 'slide', { gain: 0.45, dur: 0.9 });
  cue(tSeven, 'tock', { gain: 0.55 });

  // ── c3: pull back to the whole column; ≈ 2,800 years; sand pours in ──
  const tTwo = Wd('two', 10), tYears = Wd('years', 10);
  add({ id: 'c3', at: t3, cam: [540, 700], zoom: 0.04, note: 'pull back: whole strata column in a glass slice, coral arrow TODAY → fleck, ≈ 2,800 YEARS counts up; sand pours in', draw(lt, d, t) {
    const p = eio(seg(lt, 0, 0.95)), S = lerp(1, 0.36, p), CX = 330, TOP = 180;
    const fxs = lerp(FX, CX + (FX - 540) * 0.36, p), fys = lerp(760, TOP + FY * 0.36, p);
    const bg = ctx.createRadialGradient(540, 700, 100, 540, 800, 1300); bg.addColorStop(0, INDIGO2); bg.addColorStop(1, '#06141E'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    motes(t, 50, 13, CREAM, 0.4);
    const x0 = fxs - FX * S, y0 = fys - FY * S;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, y0, W * S + 40, 2900 * S); ctx.clip(); blit(wallImg(), FX, FY, fxs, fys, S); ctx.restore();
    charcoal(fxs, fys, lerp(0.8, 0.32, p), t);
    // the slice's glass edges
    const colH = 2900 * S;
    if (p > 0.3) { const a = seg(p, 0.3, 1); ctx.fillStyle = `rgba(169,225,220,${0.5 * a})`; ctx.fillRect(x0 - 6, y0, 6, colH); ctx.fillRect(x0 + W * S, y0, 6, colH); ctx.fillStyle = `rgba(255,255,255,${0.22 * a})`; ctx.fillRect(x0 + 14, y0 + 10, 10, colH - 20); ctx.fillStyle = `rgba(6,20,30,${0.6 * a})`; ctx.fillRect(x0, y0 + colH, W * S, 2); }
    const la = seg(lt, 0.8, 1.2);
    if (la > 0) {
      ctx.beginPath(); ctx.arc(fxs, fys, 26, 0, TAU); ctx.strokeStyle = rgba(CORAL, la); ctx.lineWidth = 4; ctx.stroke();
      pill('TODAY', x0 + W * S + 110, TOP + 4, 24, la, '#2A4A5E');
      pill('≈ 785 BCE', x0 + W * S + 150, fys, 26, la);
      // coral arrow from today down to the fleck
      const ap = eo(seg(t, tTwo - 0.2, tYears)), ax = x0 + W * S + 60, ya = TOP + 30, yb = lerp(ya, fys - 40, ap);
      ctx.strokeStyle = CORAL; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax, ya); ctx.lineTo(ax, yb); ctx.stroke();
      if (ap > 0.02) { ctx.fillStyle = CORAL; ctx.beginPath(); ctx.moveTo(ax - 20, yb - 6); ctx.lineTo(ax + 20, yb - 6); ctx.lineTo(ax, yb + 22); ctx.closePath(); ctx.fill(); }
    }
    const cp = seg(t, tTwo - 0.15, tYears), n = Math.round(2800 * eo(cp) / 10) * 10;
    if (cp > 0) {
      big('≈ ' + n.toLocaleString('en-US'), 790, 560, 112, CREAM, clamp(cp * 5), 0.02);
      big('YEARS', 790, 680, 78, CORAL, seg(t, tYears - 0.1, tYears + 0.2), 0.2, lerp(1.2, 1, eob(seg(t, tYears - 0.1, tYears + 0.25))));
      note('one sample · one layer', 790, 780, 38, CREAM, seg(t, tYears + 0.2, tYears + 0.6));
    }
    vig(0.4);
    pourIn(seg(lt, d - 0.6, d + 0.02), t, CREAM);
  } });
  cue(tTwo - 0.1, 'swell', { gain: 0.35, dur: 1.5 });
  cue(t4 - 0.55, 'whoosh', { gain: 0.3, dur: 0.6, pan: -0.2 });

  // ── c4: one small lit trench in a huge dark field ──
  const tWhole = Wd('whole', 11);
  const GL = Array.from({ length: 34 }, (_, i) => ({ x: (rnd(i * 2.3) - 0.5) * 2000, y: (rnd(i * 4.7) - 0.5) * 2600, ph: rnd(i * 6.1) }));
  add({ id: 'c4', at: t4, cam: [540, 760], zoom: 0.03, note: 'top-down night field of untouched sand, one small lit trench; zoom out until it is tiny; hidden glints', draw(lt, d, t) {
    const sc = lerp(2.4, 0.62, eio(seg(lt, 0.2, d - 0.1))), ox = Math.sin(lt * 0.6) * 20;
    field(t, sc, ox, 0);
    ctx.save(); ctx.translate(540 + ox, 760); ctx.scale(sc, sc);
    trenchTop(170, 86, t);
    const ga = seg(t, tWhole - 0.3, tWhole + 0.4);
    if (ga > 0) for (const g of GL) { if (Math.hypot(g.x, g.y) < 220) continue; const tw = Math.max(0, Math.sin((t * 1.4 + g.ph) * TAU * 0.5)); sparkle(g.x, g.y, 16 / sc * 1.0 + 8, ga * tw * 0.8, PEARL); }
    ctx.restore();
    pill('ONE TRENCH', 540 + ox, 760 - Math.max(70, 86 * sc / 2 + 50), 28, seg(lt, 0.25, 0.55));
    note('the rest: untouched', 540, 300, 46, CREAM, seg(t, tWhole - 0.2, tWhole + 0.3));
    drainOut(seg(lt, 0, 0.6), t, CREAM);
  } });
  cue(tWhole, 'sparkle', { gain: 0.3, dur: 0.8 });

  // ── c5: survey pegs + strings: many new trench outlines ──
  const tAnn = Wd('announced', 11);
  add({ id: 'c5', at: t5, cam: [540, 760], zoom: 0.06, note: 'survey pegs pop, dashed strings snap out many new trench outlines across the field: NEW DIGS ANNOUNCED', draw(lt, d, t) {
    const sc = lerp(0.62, 0.52, eio(seg(lt, 0, d))), ox = Math.sin((lt + (t5 - t4)) * 0.6) * 20;
    field(t, sc, ox, 0, 1 + 0.6 * seg(lt, 0.3, 2.0));
    ctx.save(); ctx.translate(540 + ox, 760); ctx.scale(sc, sc);
    trenchTop(170, 86, t);
    for (const o of NEW) newTrench(o, lt);
    ctx.restore();
    const a = seg(t, tAnn - 0.12, tAnn + 0.15);
    ctx.save(); ctx.translate(540, 250); ctx.rotate(-0.02); pill('NEW DIGS ANNOUNCED', 0, 0, 50, a); ctx.restore();
    pill('ONE TRENCH', 540 + ox, 760 - 95, 24, 1 - seg(lt, 0.4, 0.8), '#2A4A5E');
    pourIn(seg(lt, d - 0.55, d + 0.02), t, OCHRE);
  } });
  cue(t5 + 0.15, 'pop', { gain: 0.35 });
  cue(tAnn, 'drum', { gain: 0.5 });
  cue(t6 - 0.5, 'whoosh', { gain: 0.3, dur: 0.6, pan: 0.2 });

  // ── c6: the glass sand bottle; the sea band drains away ──
  const tLeft = Wd('left', 12);
  add({ id: 'c6', at: t6, cam: [540, 760], zoom: 0.05, note: 'the tall glass sand bottle with all the layers; the teal sea band drains away', draw(lt, d, t) {
    const sea = lerp(400, 900, eio(seg(t, tLeft - 0.35, t7 + 0.1)));
    ctx.save(); const s = lerp(0.9, 0.86, lt / d); ctx.translate(540, 980); ctx.scale(s, s); ctx.translate(-540, -980);
    bottleScene(t, { sea, py: sTop(540) - 22 });
    const a = 1 - seg(t, tLeft, tLeft + 0.5);
    pill('SEA', 540, lerp(470, 640, seg(t, tLeft - 0.35, tLeft + 0.5)), 30, a, '#1F7A86');
    ctx.restore();
    drainOut(seg(lt, 0, 0.6), t, OCHRE);
  } });
  cue(tLeft - 0.2, 'bubbles', { gain: 0.4, dur: 1.4 });

  // ── c7: the last pearl glints, then sinks into the strata ──
  const tGone = Wd('gone', 12);
  add({ id: 'c7', at: t7, cam: [540, 760], zoom: 0.06, note: 'close on the sand top: the last iridescent pearl glints, then sinks into the strata', draw(lt, d, t) {
    const z = lerp(2.1, 2.3, lt / d), py0 = sTop(540) - 22, py = py0 + 150 * eio(seg(t, tGone - 0.1, tGone + 1.0));
    ctx.save(); ctx.translate(540, 760); ctx.scale(z, z); ctx.translate(-540, -(sTop(540) - 10));
    bottleScene(t, { py });
    const g = seg(lt, 0.1, 0.6); sparkle(540 - 9, py0 - 12, 40 * Math.sin(Math.PI * g), 1, '#FFFFFF');
    const sp = seg(t, tGone - 0.05, tGone + 0.6);
    if (sp > 0 && sp < 1) for (let i = 0; i < 18; i++) { const a = -Math.PI * (0.1 + 0.8 * rnd(i)), r = 20 + 70 * eo(sp) * (0.5 + rnd(i * 3)); ctx.fillStyle = rgba([CREAM, OCHRE][i % 2], 1 - sp); ctx.fillRect(540 + Math.cos(a) * r, sTop(540) + Math.sin(a) * r * 0.7 + 60 * sp * sp, 3, 3); }
    ctx.restore();
    pill('THE LAST PEARL', 540, 330, 30, seg(lt, 0.15, 0.45) * (1 - seg(t, tGone + 0.4, tGone + 0.7)));
  } });
  cue(tGone, 'plop', { gain: 0.5 });

  // ── c8: the full bottle: the pearl glows underground; memories light up ──
  const tRem = Wd('remembers', 12);
  add({ id: 'c8', at: t8, cam: [540, 900], zoom: 0.05, note: 'the full bottle: the pearl glows faintly underground; faint memories (urn, sherd, charcoal, shell) light up in their layers', draw(lt, d, t) {
    const z = lerp(1.25, 0.94, eio(seg(lt, 0, 0.9)));
    ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960 + lerp(-120, 0, eio(seg(lt, 0, 0.9))));
    bottleScene(t, { py: lerp(sTop(540) + 128, 1150, eo(seg(lt, 0, d))), mem: seg(lt, 0.9, 2.2) });
    ctx.restore();
  } });
  cue(tRem, 'sparkle', { gain: 0.4, dur: 1.2 });

  // ── c9: end card: AAZHI poured in sand ──
  const tFol = Wd('follow', 13), tAaz = Wd('aazhi', 13), tNext = Wd('next', 13);
  add({ id: 'c9', at: t9, cam: [540, 780], zoom: 0.05, note: 'end card: AAZHI poured in banded sand from a grain stream, FOLLOW, for the next chronicle, a pearl glint', draw(lt, d, t) {
    const bg = ctx.createRadialGradient(540, 760, 80, 540, 900, 1300); bg.addColorStop(0, INDIGO2); bg.addColorStop(1, '#06141E'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(780, -100); ctx.rotate(0.25); ctx.fillStyle = lg(-200, 0, 200, 0, [[0, 'rgba(234,219,184,0)'], [0.5, 'rgba(234,219,184,0.06)'], [1, 'rgba(234,219,184,0)']]); ctx.fillRect(-200, 0, 400, 2600); ctx.restore();
    motes(t, 60, 21, CREAM, 0.45);
    // a low pile of banded sand at the bottom of the frame
    [[1760, CREAM], [1800, OCHRE], [1835, RUST], [1870, SILT]].forEach(([y, c], k) => { ctx.beginPath(); ctx.moveTo(-50, H + 50); for (let x = -50; x <= W + 50; x += 20) ctx.lineTo(x, y - 40 * Math.exp(-Math.pow((x - 540) / 300, 2)) + Math.sin(x * 0.012 + k) * 8); ctx.lineTo(W + 50, H + 50); ctx.closePath(); ctx.fillStyle = mixc(c, INDIGO, 0.35); ctx.fill(); });
    grainFill(0, 1700, W, 220, 0.8);
    const MX = 540, MYc = 760, mx0 = MX - MW / 2, my0 = MYc - MH / 2;
    blit(markGhost(), 0, 0, mx0, my0, 1);
    const fp = eio(seg(lt, 0.05, 1.25)), lev = my0 + MH - (MH + 20) * fp;
    ctx.save(); ctx.beginPath(); ctx.moveTo(mx0, my0 + MH + 10); for (let x = mx0; x <= mx0 + MW; x += 20) ctx.lineTo(x, lev + Math.sin(x * 0.03 + t * 4) * 6); ctx.lineTo(mx0 + MW, my0 + MH + 10); ctx.closePath(); ctx.clip();
    blit(markImg(), 0, 0, mx0, my0, 1); ctx.restore();
    if (fp < 1) stream(lerp(180, 900, (lt * 0.9) % 1), -20, lev + 10, t, 30, CREAM, 50);
    else { const g = seg(lt, 1.5, 2.2); if (g > 0 && g < 1) { ctx.save(); ctx.beginPath(); ctx.rect(mx0, my0, MW, MH); ctx.clip(); ctx.translate(mx0 + MW * lerp(-0.1, 1.1, g), 0); ctx.rotate(0.25); ctx.fillStyle = lg(-40, 0, 40, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]); ctx.globalCompositeOperation = 'source-atop'; ctx.fillRect(-40, 0, 80, 1400); ctx.restore(); } }
    const fa = seg(t, tFol - 0.1, tFol + 0.2);
    big('FOLLOW', 540, 520, 76, CORAL, fa, 0.35, lerp(1.3, 1, eob(fa)));
    note('for the next chronicle', 540, 970, 62, CREAM, seg(t, tNext - 0.15, tNext + 0.3));
    const pa = seg(lt, 0.9, 1.3);
    pearl(540, 1120, 34 * eob(pa), t, pa);
    const gl = (lt * 0.7) % 1; sparkle(528, 1104, 42 * Math.sin(Math.PI * clamp((gl - 0.55) / 0.3)), pa, '#FFFFFF');
    vig(0.45, 540, 800);
  } });
  cue(tAaz, 'bell', { gain: 0.45, dur: 1.5 });
  cue(Wd('chronicle', 13) + 0.2, 'sparkle', { gain: 0.3, dur: 1 });
}
