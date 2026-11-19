// EPISODE 7 · worker A : "Sand-Bottle Strata" opening (0 → L(5)), narration lines 0-4.
// A tall glass sand-art bottle: the sea drains out of it and leaves a tiny harbour high and dry; titles poured in sand;
// a sand map of the southern tip; crown + fish banner; verse lines written by a falling grain stream; underwater pearl
// divers with bubble columns; an oyster opening on an iridescent pearl; a Greek ship, an unrolling scroll, COLCHI on the map.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { lg, rgba, mixc, cached, blit } from './art.js';

// ───────────── palette (ART.md) ─────────────
const IND = '#0B2233', IND2 = '#12354D', TEAL = '#1F7A86', CREAM = '#EADBB8', OCH = '#D2A45A', RUST = '#A9542E', SILT = '#5B4636', MUD = '#7A5A3C';
const PEARL = '#F4EFE6', PINK = '#F2C6D2', AQUA = '#A9E1DC', CORAL = '#E5533D', OUT = '#050F17', DEEP = '#081A27';
const BIG = (s) => `900 ${s}px Inter, sans-serif`, NOTE = (s) => `700 ${s}px Caladea, serif`;
const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const fillAll = (c) => { ctx.fillStyle = c; ctx.fillRect(-300, -300, W + 600, H + 600); };
const STRATA = [CREAM, OCH, RUST, CREAM, MUD, OCH, SILT, RUST, CREAM, MUD];

// ───────────── grain: one speckle tile, used as a pattern over every sand fill ─────────────
let SPK = null;
function speck() {
  if (SPK) return SPK;
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  for (let i = 0; i < 3200; i++) {
    const r = rnd(i * 3.17 + 1);
    x.fillStyle = r < 0.45 ? `rgba(255,248,232,${0.10 + 0.28 * rnd(i * 7.7)})` : `rgba(38,24,12,${0.12 + 0.30 * rnd(i * 5.3)})`;
    const s = 1 + rnd(i * 9.1) * 2.4; x.fillRect(rnd(i * 1.31) * 256, rnd(i * 2.93) * 256, s, s);
  }
  return (SPK = c);
}
const PATS = new WeakMap();
function spat() { let p = PATS.get(ctx); if (!p) { p = ctx.createPattern(speck(), 'repeat'); PATS.set(ctx, p); } return p; }
/** fill the current path with colour, then speckle it */
function sand(col, a = 1, ga = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha *= ga; ctx.fillStyle = spat(); ctx.fill(); ctx.restore(); }
const wavyBand = (x0, x1, yA, yB) => { ctx.beginPath(); for (let x = x0; x <= x1; x += 12) ctx.lineTo(x, yA(x)); for (let x = x1; x >= x0; x -= 12) ctx.lineTo(x, yB(x)); ctx.closePath(); };

// ───────────── type ─────────────
function txtC(txt, size, o = {}) {
  const font = o.font || BIG(size), ls = o.ls ?? Math.round(size * 0.07), col = o.col || CREAM, key = `a-t|${txt}|${size}|${col}|${font}|${ls}`;
  ctx.save(); ctx.font = font; ctx.letterSpacing = ls + 'px'; const w = Math.ceil(ctx.measureText(txt).width) + ls + 50; ctx.restore();
  const h = Math.ceil(size * 1.3) + 30;
  const c = cached(key, w, h, 1, () => {
    ctx.font = font; ctx.letterSpacing = ls + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(3,10,16,0.8)'; ctx.fillText(txt, w / 2 + ls / 2 + size * 0.03, h / 2 + size * 0.055);
    ctx.fillStyle = col; ctx.fillText(txt, w / 2 + ls / 2, h / 2);
    if (!o.clean) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = ctx.createPattern(speck(), 'repeat'); ctx.fillRect(0, 0, w, h); }
    ctx.globalCompositeOperation = 'source-over'; ctx.letterSpacing = '0px';
  });
  c._w = w; c._h = h; return c;
}
/** a title made of sand: fills from the bottom up while grain streams pour onto the fill front */
function sandTitle(txt, x, y, size, p, t, o = {}) {
  if (p <= 0) return;
  const c = txtC(txt, size, o), w = c._w, h = c._h, pe = clamp(p), vis = Math.max(1, h * eo(pe)), a = o.a ?? 1;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.drawImage(c, 0, h - vis, w, vis, x - w / 2, y - h / 2 + h - vis, w, vis);
  if (pe < 1) {
    const fy = y - h / 2 + h - vis, n = Math.max(3, Math.round(w / 120)), fall = o.fall ?? 520;
    ctx.fillStyle = o.col || CREAM;
    for (let k = 0; k < n; k++) {
      const sx = x - w / 2 + 40 + (w - 80) * (k + 0.5) / n + 14 * Math.sin(t * 3 + k * 2.3);
      ctx.globalAlpha = a * 0.75 * (1 - seg(pe, 0.8, 1)); ctx.fillRect(sx - 2.5, fy - fall, 5, fall);
      for (let j = 0; j < 9; j++) { const gy = fy - ((t * 900 + j * 61 + k * 37) % fall); ctx.fillRect(sx - 7 + rnd(j + k * 10) * 14, gy, 3, 3); }
      for (let j = 0; j < 6; j++) { const ph = (t * 2.5 + j / 6 + k * 0.13) % 1; ctx.fillRect(sx + (rnd(j * 3 + k) - 0.5) * 70 * ph, fy - 30 * Math.sin(ph * Math.PI), 3, 3); }
    }
  }
  if (o.crumble) {   // a few grains keep slipping off the bottom edge
    ctx.fillStyle = o.col || CREAM;
    for (let i = 0; i < 26; i++) { const ph = (t * 0.5 + rnd(i * 3.3)) % 1; ctx.globalAlpha = a * 0.6 * (1 - ph) * pe; ctx.fillRect(x - w / 2 + 40 + rnd(i) * (w - 80), y + size * 0.42 + ph * 160, 3, 3); }
  }
  ctx.restore();
}
function note(txt, x, y, size, col = CREAM, a = 1, align = 'center', font = NOTE) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = font(size); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.letterSpacing = '2px';
  ctx.fillStyle = 'rgba(3,10,16,0.75)'; ctx.fillText(txt, x + 3, y + 4); ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
/** coral pill tag (TRADITION / RECORD / ILLUSTRATION) that pops in */
function pill(txt, x, y, size, p) {
  if (p <= 0) return;
  const s = eob(clamp(p));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= clamp(p * 3);
  ctx.font = BIG(size); ctx.letterSpacing = Math.round(size * 0.14) + 'px';
  const w = ctx.measureText(txt).width + size * 1.5, h = size * 1.9;
  ctx.fillStyle = 'rgba(3,10,16,0.45)'; ctx.beginPath(); ctx.roundRect(-w / 2 + 4, -h / 2 + 6, w, h, h / 2); ctx.fill();
  ctx.fillStyle = CORAL; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
  ctx.fillStyle = PEARL; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, size * 0.07, size * 0.06);
  ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────── pearls, glints, bubbles, dust ─────────────
function glint(x, y, s, a) {
  if (a <= 0 || s <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#FFFFFF'; ctx.translate(x, y);
  for (let k = 0; k < 2; k++) { ctx.rotate(k ? Math.PI / 2 : 0); ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(0, -s * 0.09); ctx.lineTo(s, 0); ctx.lineTo(0, s * 0.09); ctx.closePath(); ctx.fill(); }
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.45); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-s * 0.45, -s * 0.45, s * 0.9, s * 0.9);
  ctx.restore();
}
/** iridescent pearl: nacre body, rotating pink→teal sheen, travelling specular highlight */
function pearl(x, y, r, t, a = 1, seed = 0) {
  if (a <= 0 || r <= 0.5) return;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(3,10,16,0.35)'; ctx.beginPath(); ctx.ellipse(x + r * 0.15, y + r * 0.9, r * 0.9, r * 0.25, 0, 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.4, PEARL); g.addColorStop(0.8, '#E8D9D6'); g.addColorStop(1, '#9DBDB9');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  const cg = ctx.createConicGradient(t * 1.4 + seed, x, y);
  cg.addColorStop(0, rgba(PINK, 0.6)); cg.addColorStop(0.3, rgba(AQUA, 0.55)); cg.addColorStop(0.55, rgba(PINK, 0.05)); cg.addColorStop(0.8, rgba(AQUA, 0.5)); cg.addColorStop(1, rgba(PINK, 0.6));
  ctx.globalAlpha *= 0.55; ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(x, y, r * 0.97, 0, TAU); ctx.fill(); ctx.globalAlpha /= 0.55;
  const an = t * 1.6 + seed, hx = x + Math.cos(an) * r * 0.32 - r * 0.12, hy = y - r * 0.38 + Math.sin(an) * r * 0.14;
  const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.42); hg.addColorStop(0, 'rgba(255,255,255,0.95)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
  const tw = Math.sin(t * 2.3 + seed * 5);
  if (tw > 0.75) glint(hx, hy, r * 1.4 * (tw - 0.75) * 4, 0.9);
}
function bubbles(x, y0, t, n, seed, rise = 700, a = 1, sz = 1) {
  ctx.save(); ctx.strokeStyle = rgba(AQUA, 0.75 * a); ctx.lineWidth = 2.5;
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.45 + rnd(i + seed) * 0.35) + rnd(i * 3.7 + seed)) % 1, r = (3 + rnd(i * 5.1 + seed) * 9) * sz * (0.6 + ph * 0.6);
    const bx = x + Math.sin(ph * 9 + i) * 12 * sz, by = y0 - ph * rise;
    ctx.globalAlpha = Math.min(1, ph * 6) * (1 - ph * 0.6);
    ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(bx - r * 0.45, by - r * 0.5, r * 0.35, r * 0.35);
  }
  ctx.restore();
}
function grains(t, n, seed, col, a = 0.5, y0 = 0, y1 = H, vy = -8) {
  ctx.save(); ctx.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const x = ((rnd(i + seed) * (W + 100) + t * (8 + rnd(i * 3 + seed) * 18)) % (W + 100)) - 50;
    const y = y0 + (((rnd(i * 7 + seed) * (y1 - y0) + t * vy * (0.5 + rnd(i)) + Math.sin(t * 0.7 + i) * 20) % (y1 - y0)) + (y1 - y0)) % (y1 - y0);
    ctx.globalAlpha = a * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 1.4 + i * 2.1))); const s = 1.5 + rnd(i * 9 + seed) * 2.5; ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

// ───────────── the glass bottle ─────────────
const BX0 = 96, BX1 = 984, BY1 = 1880, NX0 = 404, NX1 = 676, NY0 = 70;
function bottlePath() {
  ctx.beginPath(); ctx.moveTo(NX0, NY0); ctx.lineTo(NX0, 180); ctx.bezierCurveTo(NX0, 280, BX0, 250, BX0, 390); ctx.lineTo(BX0, BY1 - 90);
  ctx.quadraticCurveTo(BX0, BY1, BX0 + 90, BY1); ctx.lineTo(BX1 - 90, BY1); ctx.quadraticCurveTo(BX1, BY1, BX1, BY1 - 90); ctx.lineTo(BX1, 390);
  ctx.bezierCurveTo(BX1, 250, NX1, 280, NX1, 180); ctx.lineTo(NX1, NY0); ctx.closePath();
}
const outBg = () => cached('a-out', W + 200, H + 200, 0.5, () => {
  ctx.translate(100, 100); const g = ctx.createRadialGradient(540, 960, 100, 540, 960, 1250); g.addColorStop(0, '#0F2A3B'); g.addColorStop(1, OUT);
  ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, H + 200);
});
const glassC = () => cached('a-glass', W, H, 1, () => {
  ctx.lineJoin = 'round'; bottlePath(); ctx.strokeStyle = 'rgba(169,225,220,0.16)'; ctx.lineWidth = 26; ctx.stroke();
  bottlePath(); ctx.strokeStyle = 'rgba(230,248,245,0.55)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); bottlePath(); ctx.clip();
  ctx.fillStyle = lg(BX0 + 24, 0, BX0 + 90, 0, [[0, 'rgba(255,255,255,0)'], [0.4, 'rgba(255,255,255,0.13)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(BX0 + 24, 420, 66, 1380);
  ctx.fillStyle = lg(BX1 - 50, 0, BX1 - 20, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.10)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(BX1 - 50, 440, 30, 1350);
  ctx.fillStyle = lg(NX0 + 12, 0, NX0 + 40, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.16)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(NX0 + 12, NY0 + 10, 28, 190);
  ctx.restore();
  ctx.fillStyle = 'rgba(230,248,245,0.35)'; ctx.beginPath(); ctx.roundRect(NX0 - 16, NY0 - 10, NX1 - NX0 + 32, 26, 12); ctx.fill();
});
/** draw a scene inside the bottle, then the glass on top with a slow travelling reflection */
function inBottle(t, inner) {
  blit(outBg(), 100, 100, 0, 0);
  grains(t, 26, 91, PEARL, 0.25);
  ctx.save(); bottlePath(); ctx.clip(); inner();
  const sx = -500 + ((t * 170) % 2400);
  ctx.fillStyle = lg(sx, 0, sx + 260, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,0.07)'], [1, 'rgba(255,255,255,0)']]);
  ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + 260, 0); ctx.lineTo(sx + 260 - 500, H); ctx.lineTo(sx - 500, H); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.drawImage(glassC(), 0, 0, W, H);
}
const skyC = () => cached('a-sky', W, H, 0.5, () => {
  ctx.fillStyle = lg(0, 0, 0, H, [[0, '#071824'], [0.55, IND], [1, IND2]]); ctx.fillRect(0, 0, W, H);
  for (let k = 0; k < 7; k++) { ctx.fillStyle = `rgba(169,225,220,${0.025 + 0.02 * (k % 2)})`; wavyBand(0, W, (x) => 300 + k * 170 + 20 * Math.sin(x * 0.006 + k), (x) => 360 + k * 170 + 20 * Math.sin(x * 0.007 + k * 2)); ctx.fill(); }
});
/** the strata the bottle stands on (y 1550 → bottom) */
const floorC = () => cached('a-floor', W, 420, 0.75, () => {
  const b = (k) => (x) => 40 + k * 46 + 16 * Math.sin(x * 0.008 + k * 1.9) + 7 * Math.sin(x * 0.027 + k);
  for (let k = 0; k < 9; k++) { wavyBand(-20, W + 20, b(k), k === 8 ? () => 440 : b(k + 1)); sand(STRATA[(k + 2) % STRATA.length]); }
  wavyBand(-20, W + 20, b(0), (x) => b(0)(x) + 5); ctx.fillStyle = 'rgba(255,248,232,0.35)'; ctx.fill();
});
function strataFloor(y = 1520) { blit(floorC(), 0, 0, 0, y); }

// ───────────── sand-pour transition (device 1) ─────────────
/** p 0→1: grain streams fall from the top and a coloured layer fills the frame from the bottom */
function pourCover(p, col, t) {
  if (p <= 0) return;
  const e = eio(clamp(p)), top = H + 60 - e * (H + 200);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-300, H + 300);
  for (let x = -300; x <= W + 300; x += 30) ctx.lineTo(x, top + 22 * Math.sin(x * 0.011 + 1) + 9 * Math.sin(x * 0.043));
  ctx.lineTo(W + 300, H + 300); ctx.closePath(); sand(col);
  ctx.fillStyle = col;
  for (let k = 0; k < 16; k++) {
    const sx = 30 + k * (W - 60) / 15 + 22 * Math.sin(k * 3.1), w = 5 + 6 * rnd(k);
    ctx.globalAlpha = 0.9 * (1 - seg(p, 0.85, 1)) * clamp(p * 5); ctx.fillRect(sx - w / 2, -300, w, top + 320);
    for (let j = 0; j < 8; j++) { const gy = ((t * 1100 + j * 97 + k * 53) % (top + 300)) - 300; ctx.fillRect(sx - 9 + rnd(j + k * 7) * 18, gy, 3, 3); }
  }
  ctx.restore();
}
/** p 0→1: a full coloured layer drains down through a slit at the bottom centre, revealing the shot from the top */
function drainReveal(p, col, t) {
  if (p >= 1) return;
  const e = eio(clamp(p)), base = -80 + e * (H + 420);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-300, H + 300);
  for (let x = -300; x <= W + 300; x += 24) { const dx = (x - 540) / 260; ctx.lineTo(x, base + 340 * Math.sin(e * Math.PI) * Math.exp(-dx * dx) + 14 * Math.sin(x * 0.02 + t * 3)); }
  ctx.lineTo(W + 300, H + 300); ctx.closePath(); sand(col);
  ctx.restore();
}

// ═════════════ scene pieces ═════════════
// ── the hook harbour (a1, a2) ──
const hookLand = (x) => { const k = sstep(380, 960, x); return 1150 + 580 * k + 7 * Math.sin(x * 0.045) + 4 * Math.sin(x * 0.13); };
function hut(x, y, w, h, col, roof) { ctx.beginPath(); ctx.rect(x - w / 2, y - h, w, h); sand(col); ctx.beginPath(); ctx.moveTo(x - w / 2 - 10, y - h + 2); ctx.lineTo(x, y - h - w * 0.55); ctx.lineTo(x + w / 2 + 10, y - h + 2); ctx.closePath(); sand(roof); ctx.fillStyle = 'rgba(5,15,23,0.75)'; ctx.fillRect(x - 7, y - 22, 14, 22); }
function landDraw() {
  ctx.beginPath(); ctx.moveTo(BX0 - 30, BY1 + 30); for (let x = BX0 - 30; x <= BX1 + 30; x += 8) ctx.lineTo(x, hookLand(x)); ctx.lineTo(BX1 + 30, BY1 + 30); ctx.closePath();
  ctx.save(); ctx.clip();
  for (let k = -1; k < 10; k++) { const b = (j) => (x) => 1180 + j * 80 + 24 * Math.sin(x * 0.009 + j * 1.9) + 9 * Math.sin(x * 0.031 + j); wavyBand(BX0 - 40, BX1 + 40, k < 0 ? () => 1000 : b(k), b(k + 1)); sand(STRATA[(k + 10) % STRATA.length]); }
  ctx.restore();
  ctx.beginPath(); for (let x = BX0 - 30; x <= BX1 + 30; x += 8) ctx.lineTo(x, hookLand(x)); ctx.strokeStyle = 'rgba(255,246,226,0.55)'; ctx.lineWidth = 4; ctx.stroke();
  // palm
  ctx.strokeStyle = SILT; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(392, hookLand(392)); ctx.quadraticCurveTo(372, 1080, 402, 1010); ctx.stroke();
  ctx.lineWidth = 7; for (let k = 0; k < 6; k++) { const a = -2.9 + k * 0.55; ctx.beginPath(); ctx.moveTo(402, 1010); ctx.quadraticCurveTo(402 + Math.cos(a) * 40, 1010 + Math.sin(a) * 40 - 10, 402 + Math.cos(a) * 66, 1010 + Math.sin(a) * 50 + 22); ctx.stroke(); }
  // huts + a warehouse
  hut(160, hookLand(160) + 4, 58, 50, RUST, SILT); hut(236, hookLand(236) + 4, 70, 66, OCH, RUST); hut(312, hookLand(312) + 4, 52, 44, MUD, SILT);
  // the pier on posts
  ctx.fillStyle = SILT; for (let x = 360; x <= 560; x += 40) ctx.fillRect(x - 4, 1124, 8, hookLand(x) - 1124);
  ctx.beginPath(); ctx.rect(340, 1116, 236, 12); sand(MUD);
}
const landC = () => cached('a-land', W, H, 0.75, landDraw);
const wetC = () => cached('a-wet', W, H, 0.75, () => { ctx.drawImage(landC(), 0, 0, W, H); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(11,34,51,0.45)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over'; });
function boat(x, y, s, rot, t, col = RUST) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-60, -12); ctx.quadraticCurveTo(-50, 14, -30, 16); ctx.lineTo(34, 16); ctx.quadraticCurveTo(56, 12, 66, -16); ctx.closePath(); sand(col);
  ctx.fillStyle = SILT; ctx.fillRect(-3, -96, 5, 86);
  ctx.beginPath(); ctx.moveTo(4, -92); ctx.quadraticCurveTo(44 + 6 * Math.sin(t * 2), -60, 6, -16); ctx.closePath(); sand(CREAM);
  ctx.restore();
}
function water(wl, t, x0 = BX0 - 20, x1 = BX1 + 20, flow = 0) {
  const sf = (x) => wl + 6 * Math.sin(x * 0.021 - t * 3 - flow) + 4 * Math.sin(x * 0.052 + t * 2.1);
  ctx.beginPath(); ctx.moveTo(x0, BY1 + 40); for (let x = x0; x <= x1; x += 10) ctx.lineTo(x, sf(x)); ctx.lineTo(x1, BY1 + 40); ctx.closePath();
  ctx.fillStyle = lg(0, wl, 0, wl + 700, [[0, TEAL], [0.35, '#175A6C'], [1, IND]]); ctx.fill();
  ctx.beginPath(); for (let x = x0; x <= x1; x += 10) ctx.lineTo(x, sf(x)); ctx.strokeStyle = rgba(AQUA, 0.7); ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = rgba(AQUA, 0.35);
  for (let i = 0; i < 14; i++) { const x = x0 + ((rnd(i) * (x1 - x0) + t * 60 + flow * 30) % (x1 - x0)), y = wl + 30 + rnd(i * 3) * 260; ctx.fillRect(x, y, 40 + rnd(i * 5) * 50, 3); }
}
function hookScene(t, wl, lt, flow) {
  ctx.drawImage(skyC(), 0, 0, W, H);
  // a low moon over the bottle's sea
  const mg = ctx.createRadialGradient(780, 560, 10, 780, 560, 260); mg.addColorStop(0, rgba(PEARL, 0.35)); mg.addColorStop(1, rgba(PEARL, 0)); ctx.fillStyle = mg; ctx.fillRect(520, 300, 520, 520);
  pearl(780, 560, 62, t * 0.3, 0.92, 2);
  grains(t, 40, 7, CREAM, 0.45, 300, 1100);
  water(wl, t, BX0 - 20, BX1 + 20, flow);
  ctx.drawImage(landC(), 0, 0, W, H);
  if (wl > 1132) { ctx.save(); ctx.beginPath(); ctx.rect(0, 1120, W, wl - 1120); ctx.clip(); ctx.drawImage(wetC(), 0, 0, W, H); ctx.restore(); }
  // boat rides the water, then grounds on the slope
  const bx = 640, gy = hookLand(bx) - 10, by = Math.min(wl - 4 + 3 * Math.sin(t * 2.2), gy), grounded = clamp((wl - gy + 4) / 60);
  boat(bx, by, 1.15, 0.03 * Math.sin(t * 1.7) * (1 - grounded) + 0.26 * eo(grounded), t);
}

// ── sand map of the southern tip (a4, a13) ──
const COAST = [[1260, 590], [1000, 664], [880, 700], [790, 772], [752, 880], [738, 935], [722, 980], [690, 1036], [604, 1110], [524, 1160], [480, 1190], [440, 1164], [332, 1082], [240, 1012], [170, 842], [92, 640], [-160, 420]];
const KOR = [692, 968], TUT = [716, 905];
function coastPts() {
  const out = [];
  for (let i = 0; i < COAST.length - 1; i++) {
    const [ax, ay] = COAST[i], [bx, by] = COAST[i + 1], dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
    for (let k = 0; k < 12; k++) { const u = k / 12, j = 7 * Math.sin(u * TAU * 2 + i * 1.7) * Math.sin(u * Math.PI) + 4 * Math.sin(u * 37 + i); out.push([ax + dx * u + nx * j, ay + dy * u + ny * j]); }
  }
  out.push(COAST[COAST.length - 1]); return out;
}
const mapC = () => cached('a-map', W + 400, H + 400, 0.6, () => {
  ctx.translate(200, 200);
  ctx.fillStyle = lg(0, -200, 0, H + 200, [[0, IND2], [1, DEEP]]); ctx.fillRect(-200, -200, W + 400, H + 400);
  ctx.fillStyle = spat(); ctx.globalAlpha = 0.25; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.globalAlpha = 1;
  const P = coastPts(), path = () => { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineTo(-300, -300); ctx.lineTo(1400, -300); ctx.closePath(); };
  ctx.lineJoin = 'round';
  for (const [w, a] of [[110, 0.18], [64, 0.25], [30, 0.35]]) { path(); ctx.strokeStyle = rgba(TEAL, a); ctx.lineWidth = w; ctx.stroke(); }
  path(); sand(OCH);
  ctx.save(); path(); ctx.clip();
  for (let k = 0; k < 9; k++) { const b = (j) => (x) => 120 + j * 120 + 40 * Math.sin(x * 0.006 + j * 1.3) + 12 * Math.sin(x * 0.02 + j); wavyBand(-220, W + 220, b(k), b(k + 1) ); sand(k % 2 ? CREAM : OCH, k % 2 ? 0.5 : 0.25); }
  // western hills (rust stipple band)
  ctx.beginPath(); ctx.moveTo(-200, 200); ctx.bezierCurveTo(200, 400, 280, 700, 420, 1080); ctx.lineTo(330, 1080); ctx.bezierCurveTo(200, 760, 120, 500, -200, 330); ctx.closePath(); sand(RUST, 0.45);
  // Tamirabarani river
  ctx.beginPath(); ctx.moveTo(318, 760); ctx.bezierCurveTo(430, 800, 520, 860, 570, 900); ctx.bezierCurveTo(630, 950, 680, 955, 724, 990);
  ctx.strokeStyle = TEAL; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = rgba(AQUA, 0.6); ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = 'rgba(255,246,226,0.7)'; ctx.lineWidth = 4; ctx.stroke();
});
function mapBase(t) {
  blit(mapC(), 200, 200, 0, 0);
  // drifting wave dashes on the sea
  ctx.save(); ctx.strokeStyle = rgba(AQUA, 0.25); ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const x = 560 + rnd(i) * 600 + ((t * 14) % 80), y = 1000 + rnd(i * 3) * 900 - (i % 3) * 30;
    if (y < 1180 && x < 760) continue;
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.5 + i); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 18, y - 9, x + 36, y); ctx.stroke();
  }
  ctx.restore();
  grains(t, 30, 33, CREAM, 0.35);
}
function mapDot(x, y, t, p, col = CORAL) {
  if (p <= 0) return;
  const s = eob(clamp(p));
  for (let k = 0; k < 2; k++) { const ph = (t * 0.8 + k * 0.5) % 1; ctx.strokeStyle = rgba(col, 0.7 * (1 - ph) * clamp(p * 2)); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 14 + ph * 60, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = PEARL; ctx.beginPath(); ctx.arc(x, y, 17 * s, 0, TAU); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 12 * s, 0, TAU); ctx.fill();
}

// ── crown + fish banner (a5, a6, a7) ──
function crownPath(w, h) {
  const tips = [-1, -0.5, 0, 0.5, 1], th = [0.72, 0.86, 1, 0.86, 0.72];
  ctx.beginPath(); ctx.moveTo(-w, 0);
  tips.forEach((u, i) => { ctx.lineTo(u * w, -h * th[i]); if (i < 4) ctx.lineTo((u + 0.25) * w, -h * 0.38); });
  ctx.lineTo(w, 0); ctx.lineTo(w * 0.94, h * 0.22); ctx.lineTo(-w * 0.94, h * 0.22); ctx.closePath();
}
function crown(x, y, w, t, reveal = 1, a = 1) {
  if (reveal <= 0) return;
  const h = w * 0.85;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  ctx.save(); ctx.beginPath(); ctx.rect(-w - 40, h * 0.3 - (h * 1.5) * eo(reveal), 2 * w + 80, h * 2); ctx.clip();
  crownPath(w, h); sand(OCH);
  ctx.beginPath(); ctx.rect(-w * 0.94, h * 0.02, w * 1.88, h * 0.2); sand(RUST);
  [-1, -0.5, 0, 0.5, 1].forEach((u, i) => { ctx.beginPath(); ctx.arc(u * w, -h * [0.72, 0.86, 1, 0.86, 0.72][i] - w * 0.06, w * 0.065, 0, TAU); sand(CREAM); });
  ctx.restore();
  if (reveal >= 1) pearl(0, -h * 0.2, w * 0.11, t, 1, 1);
  // crumbling grains drift off the base
  ctx.fillStyle = OCH;
  for (let i = 0; i < 22; i++) { const ph = (t * 0.45 + rnd(i * 2.3)) % 1; ctx.globalAlpha = a * 0.7 * (1 - ph) * clamp(reveal); ctx.fillRect(-w + rnd(i) * 2 * w + ph * 30, h * 0.25 + ph * 150, 3, 3); }
  ctx.restore();
}
function fishPath(cx, cy, s) { ctx.beginPath(); ctx.ellipse(cx, cy, 46 * s, 18 * s, 0, 0, TAU); ctx.moveTo(cx - 40 * s, cy); ctx.lineTo(cx - 74 * s, cy - 22 * s); ctx.lineTo(cx - 66 * s, cy); ctx.lineTo(cx - 74 * s, cy + 22 * s); ctx.closePath(); }
function banner(x, y, hgt, fw, fh, t, reveal = 1, flip = 1) {
  if (reveal <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(flip, 1);
  const top = -hgt * eo(clamp(reveal * 1.4));
  ctx.beginPath(); ctx.rect(-6, top, 12, -top); sand(SILT); ctx.beginPath(); ctx.arc(0, top - 6, 11, 0, TAU); sand(OCH);
  const fr = clamp(reveal * 1.4 - 0.4); if (fr > 0) {
    const wav = (u) => 18 * u * Math.sin(u * 5.5 - t * 4.5), fwr = fw * eo(fr);
    ctx.beginPath(); for (let u = 0; u <= 1.001; u += 0.05) ctx.lineTo(8 + u * fwr, top + 6 + wav(u)); for (let u = 1; u >= -0.001; u -= 0.05) ctx.lineTo(8 + u * fwr, top + 6 + fh + wav(u)); ctx.closePath(); sand(RUST);
    const u = 0.55; fishPath(8 + u * fwr, top + 6 + fh / 2 + wav(u), fh / 70 * fr); sand(CREAM);
  }
  ctx.restore();
}

// ── underwater (a8, a9, a10) ──
const uwC = () => cached('a-uw', W + 400, H + 400, 0.5, () => {
  ctx.translate(200, 200);
  ctx.fillStyle = lg(0, -200, 0, H + 200, [[0, '#2A8C93'], [0.25, TEAL], [0.6, IND2], [1, DEEP]]); ctx.fillRect(-200, -200, W + 400, H + 400);
  const b = (k) => (x) => 1560 + k * 56 + 30 * Math.sin(x * 0.006 + k * 1.4) + 10 * Math.sin(x * 0.021 + k);
  for (let k = 0; k < 8; k++) { wavyBand(-220, W + 220, b(k), k === 7 ? () => H + 220 : b(k + 1)); sand(mixc(STRATA[(k + 1) % STRATA.length], IND, 0.35)); }
});
function shafts(t, a = 1) {
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 190 + 50 * Math.sin(t * 0.35 + i * 1.7), w = 70 + 40 * rnd(i), sk = 380;
    ctx.globalAlpha = a * (0.10 + 0.06 * Math.sin(t * 0.9 + i * 2));
    ctx.fillStyle = lg(0, -100, 0, 1500, [[0, 'rgba(234,245,240,0.9)'], [1, 'rgba(234,245,240,0)']]);
    ctx.beginPath(); ctx.moveTo(x, -200); ctx.lineTo(x + w, -200); ctx.lineTo(x + w + sk + w, 1550); ctx.lineTo(x + sk, 1550); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function oyster(x, y, s, open, t, seed = 0, pr = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-80, 0); ctx.bezierCurveTo(-64, 52, 64, 58, 84, 4); ctx.bezierCurveTo(60, 10, -40, 8, -80, 0); sand(mixc(MUD, SILT, rnd(seed) * 0.6));
  ctx.strokeStyle = 'rgba(30,20,10,0.4)'; ctx.lineWidth = 3; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-74, 2); ctx.quadraticCurveTo(0, 14 + k * 12, 80, 6); ctx.stroke(); }
  if (open > 0) {
    const ng = ctx.createLinearGradient(-60, 0, 70, 0); ng.addColorStop(0, PINK); ng.addColorStop(0.5, PEARL); ng.addColorStop(1, AQUA);
    ctx.fillStyle = ng; ctx.beginPath(); ctx.ellipse(4, 4, 68, 8 + open * 14, 0, 0, TAU); ctx.fill();
    if (pr > 0) pearl(8, -6 * open, 15 * pr, t, 1, seed);
  }
  ctx.save(); ctx.translate(-80, 0); ctx.rotate(-open * 0.95); ctx.translate(80, 0);
  ctx.beginPath(); ctx.moveTo(-80, 0); ctx.bezierCurveTo(-60, -50, 60, -52, 84, 4); ctx.bezierCurveTo(60, -6, -40, -4, -80, 0); sand(mixc(OCH, MUD, 0.3 + rnd(seed * 3) * 0.5));
  ctx.strokeStyle = 'rgba(30,20,10,0.35)'; ctx.lineWidth = 3; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-74, -2); ctx.quadraticCurveTo(0, -12 - k * 11, 80, 2); ctx.stroke(); }
  ctx.restore(); ctx.restore();
}
/** a faceless sand diver, drawn head-up then rotated; kick animates the legs */
function diver(x, y, s, ang, t, col, seed = 0, bag = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  const kk = Math.sin(t * 5 + seed) * 14;
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineWidth = 17;
  ctx.beginPath(); ctx.moveTo(-8, 20); ctx.lineTo(-12 + kk, 96); ctx.moveTo(8, 20); ctx.lineTo(12 - kk, 96); ctx.stroke();
  ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(-10, -40); ctx.lineTo(-16, -118); ctx.moveTo(10, -40); ctx.lineTo(16, -118); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-19, -52, 38, 78, 16); sand(col); ctx.beginPath(); ctx.arc(0, -70, 19, 0, TAU); sand(col);
  // stone weight leads the dive, rope up to the boat
  ctx.beginPath(); ctx.ellipse(0, -150, 20, 15, 0, 0, TAU); sand(SILT);
  ctx.strokeStyle = rgba(CREAM, 0.5); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -136); ctx.lineTo(0, -118); ctx.moveTo(0, 96); ctx.lineTo(0, 1600); ctx.stroke();
  if (bag > 0) { ctx.beginPath(); ctx.ellipse(26, 10, 18 * bag, 24 * bag, 0.3, 0, TAU); sand(MUD); }
  ctx.restore();
}
function fishSchool(t, y, n, dir = 1, seed = 0, a = 0.5) {
  ctx.save(); ctx.fillStyle = rgba(IND, a);
  for (let i = 0; i < n; i++) {
    const x = ((rnd(i + seed) * 300 + t * 90 * dir + (dir > 0 ? -200 : 1300)) % 1500 + 1500) % 1500 - 200 + 30 * Math.sin(t + i), yy = y + rnd(i * 3 + seed) * 120 + 10 * Math.sin(t * 2 + i);
    ctx.save(); ctx.translate(x, yy); ctx.scale(dir, 1); fishPath(0, 0, 0.35); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

// ── the Greek ship (a11) and the scroll (a12) ──
function ship(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.03 * Math.sin(t * 1.6)); ctx.scale(s, s);
  ctx.strokeStyle = rgba(CREAM, 0.55); ctx.lineWidth = 3; for (let k = 0; k < 7; k++) { const ox = -110 + k * 34, sw = 10 * Math.sin(t * 3 + k * 0.3); ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox - 26 + sw, 46); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-200, -74); ctx.quadraticCurveTo(-206, -20, -150, 20); ctx.lineTo(140, 20); ctx.quadraticCurveTo(196, 8, 222, -30); ctx.lineTo(168, -18); ctx.lineTo(-160, -18); ctx.quadraticCurveTo(-182, -30, -200, -74); ctx.closePath(); sand('#2B2018');
  ctx.strokeStyle = rgba(OCH, 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-160, -16); ctx.lineTo(168, -16); ctx.stroke();
  ctx.fillStyle = '#2B2018'; ctx.fillRect(-4, -330, 9, 316); ctx.fillRect(-130, -318, 262, 8);
  const bl = 22 + 8 * Math.sin(t * 1.3);
  ctx.beginPath(); ctx.moveTo(-124, -312); ctx.lineTo(124, -312); ctx.quadraticCurveTo(124 + bl, -190, 112, -64); ctx.lineTo(-112, -64); ctx.quadraticCurveTo(-124 + bl, -190, -124, -312); ctx.closePath(); sand(CREAM);
  ctx.strokeStyle = rgba(RUST, 0.7); ctx.lineWidth = 5; for (const sx of [-60, 0, 60]) { ctx.beginPath(); ctx.moveTo(sx, -310); ctx.quadraticCurveTo(sx + bl * 0.8, -190, sx * 0.92, -66); ctx.stroke(); }
  ctx.strokeStyle = rgba(CREAM, 0.4); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -330); ctx.lineTo(214, -34); ctx.moveTo(0, -330); ctx.lineTo(-196, -70); ctx.stroke();
  ctx.restore();
}
function scroll(cx, y0, y1, hw, t) {
  const hgt = y1 - y0;
  if (hw > 4) {
    ctx.save(); ctx.beginPath(); ctx.rect(cx - hw, y0, hw * 2, hgt); sand(CREAM);
    ctx.clip();
    ctx.fillStyle = lg(0, y0, 0, y1, [[0, 'rgba(91,70,54,0.18)'], [0.15, 'rgba(91,70,54,0)'], [0.85, 'rgba(91,70,54,0)'], [1, 'rgba(91,70,54,0.22)']]); ctx.fillRect(cx - hw, y0, hw * 2, hgt);
    ctx.fillStyle = 'rgba(91,70,54,0.72)';
    for (let col = 0; col < 3; col++) for (let r = 0; r < 11; r++) {   // abstract lines only (no letters)
      let x = cx - 360 + col * 250, xe = x + 210 - (r === 10 ? 90 : 0); const yy = y0 + 64 + r * 38;
      for (let k = 0; x < xe; k++) { const w = 18 + rnd(col * 300 + r * 17 + k) * 46; ctx.fillRect(x, yy, Math.min(w, xe - x), 6); x += w + 12; }
    }
    ctx.restore();
  }
  for (const sx of [-1, 1]) { const x = cx + sx * hw; ctx.beginPath(); ctx.roundRect(x - 24, y0 - 26, 48, hgt + 52, 20); sand(MUD); ctx.fillStyle = lg(x - 24, 0, x + 24, 0, [[0, 'rgba(0,0,0,0.3)'], [0.35, 'rgba(255,240,210,0.35)'], [1, 'rgba(0,0,0,0.35)']]); ctx.fill(); ctx.beginPath(); ctx.ellipse(x, y0 - 26, 30, 10, 0, 0, TAU); sand(RUST); ctx.beginPath(); ctx.ellipse(x, y1 + 26, 30, 10, 0, 0, TAU); sand(RUST); }
}

// ═════════════ the shots ═════════════
export function buildA(add, cue) {
  const t1 = Wd('sea', 0) - 0.25, t2 = L(1) - 0.17, t3 = Wd('near', 1) + 0.07, t4 = Wd('first', 1) - 0.27, t5 = L(2) - 0.23, t6 = Wd('as', 2) + 0.02;
  const t7 = L(3) - 0.27, t8 = Wd('divers', 3) - 0.16, t9 = Wd('gulf', 3) + 0.3, t10 = L(4) - 0.19, t11 = Wd('periplus', 4) - 0.36, t12 = Wd('colchi', 4) - 0.12, tEnd = L(5);

  // a1 · the corked sand bottle: a tiny harbour, the sea lapping at its pier; the cork pops
  add({ id: 'a1', at: 0, cam: [600, 1000], zoom: 0.07, note: 'sand bottle w/ tiny harbour on strata cliff, sea at the pier, moon pearl; cork pops; TAMIL PORT pill', draw(lt) {
    inBottle(lt, () => hookScene(lt, 1146, lt, 0));
    // cork
    const cp = seg(lt, 0.18, 0.75), cy = 26 - eo(cp) * 380, cr = cp * 0.9;
    if (cp < 1) { ctx.save(); ctx.translate(540, cy); ctx.rotate(cr); ctx.beginPath(); ctx.roundRect(-118, -60, 236, 110, 18); sand(MUD); ctx.restore(); }
    if (cp > 0 && cp < 1) { ctx.fillStyle = CREAM; for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 + (rnd(i) - 0.5) * 2.2, d = eo(cp) * (80 + rnd(i * 3) * 160); ctx.globalAlpha = 1 - cp; ctx.fillRect(540 + Math.cos(a) * d, 70 + Math.sin(a) * d + cp * cp * 120, 4, 4); } ctx.globalAlpha = 1; }
    pill('TAMIL PORT', 250, 900, 30, seg(lt, Wd('tamil', 0) - 0.05, Wd('tamil', 0) + 0.3));
    if (lt > Wd('tamil', 0)) { ctx.strokeStyle = CORAL; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(250, 930); ctx.lineTo(250, 930 + 110 * seg(lt, Wd('tamil', 0), Wd('tamil', 0) + 0.4)); ctx.stroke(); ctx.setLineDash([]); }
  } });
  cue(0.2, 'pop', { gain: 0.55, dur: 0.3 });

  // a2 · the sea drains away down the slope; the boat grounds; old waterline left as a dashed coral line
  add({ id: 'a2', at: t1, cam: [620, 1180], zoom: -0.05, note: 'water level drops through the bottle, wet sand slope exposed, boat tips onto sand, coral dashed "the sea was here"; sand pours to cover', draw(lt, d) {
    const t = t1 + lt, dr = eio(seg(t, Wd('walked', 0) - 0.15, Wd('from', 0) + 0.55)), wl = lerp(1146, 1760, dr);
    inBottle(t, () => {
      hookScene(t, wl, lt, dr * 12);
      if (dr > 0.15) {
        const a = seg(dr, 0.15, 0.4);
        ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = CORAL; ctx.lineWidth = 4; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40;
        ctx.beginPath(); ctx.moveTo(470, 1146); ctx.lineTo(470 + 470 * eo(a), 1146); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        note('the sea was here', 760, 1100, 40, PEARL, a);
        // arrow: the sea walking away (down and right)
        const ap = seg(dr, 0.3, 0.8); if (ap > 0) { ctx.save(); ctx.globalAlpha = ap; ctx.strokeStyle = CORAL; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(700, 1210); ctx.quadraticCurveTo(820, 1230, 860, 1210 + 330 * ap); ctx.stroke();
          const ey = 1210 + 330 * ap; ctx.fillStyle = CORAL; ctx.beginPath(); ctx.moveTo(860, ey + 28); ctx.lineTo(838, ey - 6); ctx.lineTo(882, ey - 6); ctx.closePath(); ctx.fill(); ctx.restore(); }
      }
    });
    pourCover(seg(lt, d - 0.36, d), CREAM, t);
  } });
  cue(Wd('walked', 0) - 0.1, 'whoosh', { gain: 0.5, dur: 1.2, pan: 0.4 });

  // a3 · KORKAI poured in sand inside the bottle; pearls glint on the strata floor
  add({ id: 'a3', at: t2, cam: [540, 760], zoom: 0.08, note: 'cream layer drains through a slit; KORKAI fills in sand from a grain pour; "its name is"; pearls on strata floor', draw(lt) {
    const t = t2 + lt, kp = seg(t, Wd('korkai', 1) - 0.25, Wd('korkai', 1) + 0.45);
    inBottle(t, () => {
      ctx.drawImage(skyC(), 0, 0, W, H); grains(t, 50, 12, CREAM, 0.5, 300, 1300);
      strataFloor(1520);
      [[250, 1790, 24], [430, 1810, 18], [700, 1785, 28], [850, 1812, 16]].forEach(([x, y, r], i) => pearl(x, y, r, t, 1, i * 1.7));
      note('its name is', 540, 520, 54, AQUA, seg(t, L(1) - 0.1, L(1) + 0.3));
      sandTitle('KORKAI', 540, 760, 205, kp, t, { crumble: 1 });
      // a ripple line of sand under the title
      const up = seg(t, Wd('korkai', 1) + 0.3, Wd('korkai', 1) + 0.9);
      if (up > 0) { ctx.strokeStyle = CORAL; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(540 - 300 * eo(up), 905); ctx.lineTo(540 + 300 * eo(up), 905); ctx.stroke(); }
      note('a lost pearl port', 540, 990, 50, PEARL, seg(t, Wd('korkai', 1) + 0.5, Wd('korkai', 1) + 0.9));
    });
    drainReveal(seg(lt, 0, 0.5), CREAM, t);
  } });
  cue(Wd('korkai', 1) - 0.2, 'sizzle', { gain: 0.35, dur: 0.8 });

  // a4 · the sand map of the southern tip: Thoothukudi, the Korkai dot, TRADITION pill
  add({ id: 'a4', at: t3, cam: [692, 968], zoom: 0.16, note: 'top-down sand map of the southern tip, river Tamirabarani, Thoothukudi dot, coral KORKAI dot pulsing, TRADITION pill + crown icon', draw(lt) {
    const t = t3 + lt;
    mapBase(t);
    note('TAMIL NADU', 330, 520, 64, rgba(SILT, 0.9), 1, 'center', BIG);
    note('SOUTHERN TIP OF INDIA', 330, 590, 30, rgba(SILT, 0.9), 1, 'center', BIG);
    note('Gulf of Mannar', 900, 1190, 40, rgba(AQUA, 0.85), 1);
    const tp = seg(t, Wd('thoothukudi', 1) - 0.1, Wd('thoothukudi', 1) + 0.3);
    if (tp > 0) { ctx.fillStyle = PEARL; ctx.beginPath(); ctx.arc(TUT[0], TUT[1], 10 * eob(tp), 0, TAU); ctx.fill(); note('Thoothukudi', TUT[0] + 26, TUT[1] - 30, 42, PEARL, tp, 'left'); }
    const kp = seg(t, t3, t3 + 0.35);
    mapDot(KOR[0], KOR[1], t, kp);
    note('KORKAI', KOR[0] - 30, KOR[1] + 4, 56, CREAM, kp, 'right', BIG);
    const rp = seg(t, Wd('tradition', 1) - 0.05, Wd('tradition', 1) + 0.3);
    pill('TRADITION', 560, 1090, 28, rp);
    if (rp > 0) { crown(KOR[0] + 6, KOR[1] - 54, 30 * eob(rp), t, 1); }
  } });
  cue(Wd('thoothukudi', 1), 'tock', { gain: 0.4, dur: 0.2, pan: 0.3 });
  cue(Wd('tradition', 1), 'pop', { gain: 0.45, dur: 0.25 });

  // a5 · crown + fish banner rise in sand: FIRST PANDYA CAPITAL, TRADITION tag
  add({ id: 'a5', at: t4, cam: [540, 760], zoom: 0.07, note: 'sand crown assembles bottom-up, two waving rust fish banners, FIRST PANDYA CAPITAL sand title, TRADITION pill; ochre sand pours to cover', draw(lt, d) {
    const t = t4 + lt;
    inBottle(t, () => {
      ctx.drawImage(skyC(), 0, 0, W, H); grains(t, 50, 21, OCH, 0.5, 250, 1300);
      strataFloor(1520);
      const gl = ctx.createRadialGradient(540, 560, 20, 540, 560, 420); gl.addColorStop(0, rgba(OCH, 0.22)); gl.addColorStop(1, rgba(OCH, 0)); ctx.fillStyle = gl; ctx.fillRect(100, 140, 880, 840);
      banner(170, 1000, 760, 170, 100, t, seg(lt, 0.05, 0.9), 1);
      banner(910, 1000, 760, 170, 100, t + 0.7, seg(lt, 0.2, 1.05), -1);
      crown(540, 640, 190, t, seg(lt, 0, 0.75));
      sandTitle('FIRST PANDYA', 540, 900, 100, seg(t, Wd('first', 1) - 0.1, Wd('first', 1) + 0.6), t);
      sandTitle('CAPITAL', 540, 1030, 100, seg(t, Wd('capital', 1) - 0.15, Wd('capital', 1) + 0.5), t);
      pill('TRADITION', 540, 1180, 30, seg(t, Wd('pandya', 1) - 0.2, Wd('pandya', 1) + 0.2));
      [[300, 1800, 22], [780, 1795, 26]].forEach(([x, y, r], i) => pearl(x, y, r, t, 1, i + 4));
    });
    pourCover(seg(lt, d - 0.36, d), OCH, t);
  } });
  cue(Wd('first', 1) - 0.05, 'drum', { gain: 0.5, dur: 0.5 });

  // a6 · Sangam poems: a falling grain stream writes abstract verse lines; they lift toward a small crown
  add({ id: 'a6', at: t5, cam: [540, 640], zoom: 0.08, note: 'ochre layer drains; a single grain stream writes 7 abstract sand verse lines (no letters); "Sangam poems" note + ILLUSTRATION; lines glow, crown above', draw(lt) {
    const t = t5 + lt;
    inBottle(t, () => {
      ctx.drawImage(skyC(), 0, 0, W, H); grains(t, 40, 41, CREAM, 0.4, 250, 1300);
      strataFloor(1520);
      note('SANGAM POEMS', 540, 330, 66, CREAM, seg(t, Wd('sangam', 2) - 0.15, Wd('sangam', 2) + 0.25), 'center', BIG);
      pill('ILLUSTRATION', 540, 1220, 22, seg(lt, 0.6, 0.9));
      const rows = 7, wp = seg(lt, 0.25, 2.0) * rows, praise = seg(t, Wd('praise', 2) - 0.1, Wd('praise', 2) + 0.6);
      let pen = null;
      for (let r = 0; r < rows; r++) {
        const fr = clamp(wp - r); if (fr <= 0) break;
        const y = 470 + r * 82, x0 = 210 + (r % 2) * 40, x1 = 870 - (r % 3) * 40, xe = lerp(x0, x1, fr);
        let x = x0; ctx.save(); ctx.translate(0, -praise * (14 + 6 * Math.sin(t * 3 + r)));
        for (let k = 0; x < xe; k++) { const w = 30 + rnd(r * 31 + k) * 80; ctx.beginPath(); ctx.roundRect(x, y - 7, Math.min(w, xe - x), 14, 7); sand(r % 2 ? OCH : CREAM); x += w + 18; }
        ctx.restore();
        if (fr < 1) pen = [xe, y];
      }
      if (pen) { ctx.fillStyle = CREAM; ctx.globalAlpha = 0.85; ctx.fillRect(pen[0] - 2.5, 0, 5, pen[1] - 8); for (let j = 0; j < 10; j++) ctx.fillRect(pen[0] - 6 + rnd(j) * 12, (t * 1000 + j * 53) % (pen[1] - 8), 3, 3); ctx.globalAlpha = 1; }
      crown(540, 1100, 90 * eob(praise), t, praise > 0 ? 1 : 0);
      if (praise > 0) for (let i = 0; i < 4; i++) glint(540 + (i - 1.5) * 90, 1020 - 20 * Math.sin(t * 2 + i), 26 * praise * (0.5 + 0.5 * Math.sin(t * 4 + i * 2)), 0.9);
    });
    drainReveal(seg(lt, 0, 0.5), OCH, t);
  } });
  cue(Wd('sangam', 2) - 0.05, 'sizzle', { gain: 0.3, dur: 1.4 });

  // a7 · KORKAI KOMAN: crown above, two banners, "lord of Korkai"
  add({ id: 'a7', at: t6, cam: [540, 700], zoom: 0.08, note: 'crown, KORKAI / KOMAN two-line sand title, "lord of Korkai" with coral underline, flanking fish banners, pearls on floor', draw(lt) {
    const t = t6 + lt;
    inBottle(t, () => {
      ctx.drawImage(skyC(), 0, 0, W, H); grains(t, 50, 51, OCH, 0.45, 250, 1300);
      strataFloor(1520);
      banner(170, 1240, 920, 150, 90, t, seg(lt, 0, 0.7), 1);
      banner(910, 1240, 920, 150, 90, t + 0.5, seg(lt, 0, 0.7), -1);
      crown(540, 360, 120, t, seg(lt, 0, 0.5));
      sandTitle('KORKAI', 540, 590, 170, seg(t, Wd('korkai', 2) - 0.2, Wd('korkai', 2) + 0.35), t);
      sandTitle('KOMAN', 540, 770, 170, seg(t, Wd('koman', 2) - 0.15, Wd('koman', 2) + 0.4), t, { col: OCH });
      const lp = seg(t, Wd('lord', 2) - 0.1, Wd('lord', 2) + 0.35);
      note('lord of Korkai', 540, 920, 66, PEARL, lp);
      if (lp > 0) { const up = seg(t, Wd('lord', 2) + 0.1, Wd('lord', 2) + 0.7); ctx.strokeStyle = CORAL; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(540 - 210 * eo(up), 975); ctx.lineTo(540 + 210 * eo(up), 975); ctx.stroke(); }
      note('the Sangam title', 540, 1070, 40, AQUA, seg(t, Wd('lord', 2) + 0.4, Wd('lord', 2) + 0.8));
      [[330, 1805, 20], [540, 1790, 26], [760, 1808, 18]].forEach(([x, y, r], i) => pearl(x, y, r, t, 1, i * 2.2));
    });
  } });
  cue(Wd('koman', 2), 'bell', { gain: 0.45, dur: 1.2 });

  // a8 · diving through the surface: light shafts, dust, an oyster bed with one pearl glinting
  add({ id: 'a8', at: t7, cam: [540, 1300], zoom: 0.1, note: 'camera sinks through the sea surface (surface line sweeps up), light shafts + floating grains, school of fish, oyster bed on sand strata; front oyster opens a crack, pearl glints', draw(lt) {
    const t = t7 + lt, sink = eio(seg(lt, 0, 0.9));
    blit(uwC(), 200, 200, 0, 0);
    shafts(t, 0.4 + 0.6 * sink);
    grains(t, 60, 61, PEARL, 0.45, 0, 1550, -14);
    fishSchool(lt + 4, 700, 11, 1, 3, 0.6); fishSchool(lt + 9, 1050, 8, -1, 7, 0.45);
    // above-water layer peeling away upward
    const sy = lerp(1150, -160, sink);
    if (sy > -150) {
      ctx.fillStyle = lg(0, sy - 900, 0, sy, [[0, '#071824'], [1, IND2]]); ctx.fillRect(-300, -300, W + 600, sy + 300);
      ctx.beginPath(); for (let x = -300; x <= W + 300; x += 12) ctx.lineTo(x, sy + 10 * Math.sin(x * 0.02 - t * 3)); ctx.strokeStyle = rgba(AQUA, 0.85); ctx.lineWidth = 6; ctx.stroke();
      ctx.fillStyle = rgba(AQUA, 0.2); ctx.fillRect(-300, sy + 6, W + 600, 30);
    }
    bubbles(540, 1100, t, 18, 4, 900, 1 - sink * 0.7, 1.3);
    [[150, 1640, 0.8], [330, 1690, 1.0], [880, 1660, 0.9], [700, 1740, 0.75], [120, 1800, 0.9], [960, 1810, 1.0]].forEach(([x, y, s], i) => oyster(x, y, s, 0.08 + 0.06 * Math.sin(t * 1.3 + i), t, i));
    const op = 0.15 + 0.35 * seg(t, Wd('water', 3) - 0.3, Wd('water', 3) + 0.3);
    oyster(540, 1835, 1.5, op, t, 9, seg(t, Wd('water', 3) - 0.3, Wd('water', 3)));
    note('THE TREASURE', 540, 330, 70, CREAM, seg(t, Wd('treasure', 3) - 0.1, Wd('treasure', 3) + 0.3) * (sink > 0.6 ? 1 : 0), 'center', BIG);
    note('lay under the water', 540, 420, 58, PEARL, seg(t, Wd('under', 3) - 0.1, Wd('under', 3) + 0.3), 'center');
  } });
  cue(t7 + 0.1, 'bubbles', { gain: 0.5, dur: 1.2 });

  // a9 · pearl divers: faceless sand silhouettes plunge head-down on stone weights; bubble columns; a bag of pearls
  add({ id: 'a9', at: t8, cam: [600, 900], zoom: 0.08, note: '3 faceless sand divers plunge head-down with stone weights + ropes, bubble columns, front diver reaches the bed and lifts a glinting pearl; ILLUSTRATION pill', draw(lt) {
    const t = t8 + lt;
    blit(uwC(), 200, 200, 0, 0);
    shafts(t, 1);
    grains(t, 50, 71, PEARL, 0.4, 0, 1550, -14);
    [[180, 1660, 0.9], [420, 1720, 1.1], [880, 1650, 0.8], [980, 1790, 1.0], [260, 1810, 0.85]].forEach(([x, y, s], i) => oyster(x, y, s, 0.06 + 0.05 * Math.sin(t * 1.2 + i), t, i + 3));
    // back divers (smaller, darker)
    const dv = [[260, 0.55, 0.3, 0.2], [860, 0.6, 0.5, 0.55]];
    dv.forEach(([x, s, delay, seed], i) => { const p = eio(seg(lt, delay, delay + 1.9)), y = lerp(-120, 900, p); bubbles(x, y + 60 * s, t, 10, 20 + i, 900, 0.8, s); diver(x + 20 * Math.sin(t + i), y, s, Math.PI + 0.12 * Math.sin(t * 1.3 + i), t, mixc(OCH, IND, 0.45), seed); });
    // front diver
    const p = eio(seg(lt, 0, 1.15)), dx = 620, dy = lerp(-220, 1180, p), turn = seg(lt, 1.15, 1.6);
    bubbles(dx - 10, dy + 140, t, 18, 31, 1300, 1, 1.4);
    diver(dx + 10 * Math.sin(t * 1.4), dy, 1.25, Math.PI * (1 - 0.55 * eio(turn)) + 0.06 * Math.sin(t * 2), t, OCH, 1, seg(lt, 1.2, 1.5));
    const pr = seg(t, Wd('pearls', 3) - 0.1, Wd('pearls', 3) + 0.25);
    if (pr > 0) { const px = dx + 120, py = dy - 40 - 140 * eo(seg(t, Wd('pearls', 3), Wd('pearls', 3) + 1.0)); pearl(px, py, 36 * eob(pr), t, 1, 3); glint(px, py - 10, 90 * pr * (0.6 + 0.4 * Math.sin(t * 6)), 0.9); }
    note('PEARL DIVERS', 540, 300, 72, CREAM, seg(t, Wd('divers', 3) - 0.1, Wd('divers', 3) + 0.3), 'center', BIG);
    pill('ILLUSTRATION', 540, 390, 20, seg(lt, 0.4, 0.7));
  } });
  cue(Wd('divers', 3) - 0.05, 'gulp', { gain: 0.45, dur: 0.4, pan: -0.2 });
  cue(Wd('pearls', 3), 'sparkle', { gain: 0.45, dur: 0.6, pan: 0.2 });

  // a10 · a giant oyster opens on an iridescent pearl: GULF OF MANNAR
  add({ id: 'a10', at: t9, cam: [540, 820], zoom: 0.1, note: 'close-up giant oyster opens on a big iridescent pearl with travelling highlight + glints, GULF OF MANNAR sand title; rust sand pours to cover', draw(lt, d) {
    const t = t9 + lt, op = eob(seg(lt, 0.05, 0.6));
    blit(uwC(), 200, 200, 0, 0);
    shafts(t, 0.8);
    grains(t, 50, 81, PEARL, 0.45, 0, 1550, -14);
    bubbles(220, 1300, t, 12, 41, 1200, 0.8, 1); bubbles(880, 1350, t, 12, 43, 1200, 0.8, 1);
    oyster(540, 840, 4.4, op * 0.95, t, 2, 0);
    const pr = seg(lt, 0.25, 0.65), px = 575, py = 840 - op * 60;
    if (pr > 0) { const gl = ctx.createRadialGradient(px, py, 10, px, py, 360); gl.addColorStop(0, rgba(PEARL, 0.35 * pr)); gl.addColorStop(1, rgba(PEARL, 0)); ctx.fillStyle = gl; ctx.fillRect(px - 360, py - 360, 720, 720); pearl(px, py, 92 * eob(pr), t * 1.4, 1, 0.5); glint(px - 30, py - 40, 200 * pr * (0.55 + 0.45 * Math.sin(t * 5)), 0.85); }
    sandTitle('GULF OF MANNAR', 540, 360, 92, seg(t, Wd('gulf', 3) - 0.6, Wd('mannar', 3) + 0.1), t);
    note('the pearl beds', 540, 470, 50, AQUA, seg(t, Wd('mannar', 3), Wd('mannar', 3) + 0.4));
    [[160, 1700, 0.9], [900, 1720, 1.0]].forEach(([x, y, s], i) => oyster(x, y, s, 0.08, t, i + 6));
    pourCover(seg(lt, d - 0.36, d), RUST, t);
  } });
  cue(t9 + 0.15, 'sparkle', { gain: 0.55, dur: 0.8 });

  // a11 · a Greek sailing ship crosses the moonlit surface; cross-section: pearls glint on the bed below
  add({ id: 'a11', at: t10, cam: [540, 800], zoom: 0.07, note: 'rust layer drains; Greek ship silhouette w/ cream sand sail crosses moonlit sea, cross-section water below w/ shafts + pearls on bed; GREEK SAILING GUIDE pill, "~1st century CE"', draw(lt, d) {
    const t = t10 + lt, SY = 860;
    ctx.fillStyle = lg(0, -300, 0, SY, [[0, '#06141E'], [1, IND2]]); ctx.fillRect(-300, -300, W + 600, SY + 300);
    grains(t, 50, 91, PEARL, 0.5, 0, SY - 60, 0);
    const mg = ctx.createRadialGradient(830, 330, 10, 830, 330, 260); mg.addColorStop(0, rgba(PEARL, 0.3)); mg.addColorStop(1, rgba(PEARL, 0)); ctx.fillStyle = mg; ctx.fillRect(570, 70, 520, 520);
    pearl(830, 330, 70, t * 0.3, 0.95, 3);
    ctx.save(); ctx.beginPath(); ctx.rect(-300, SY, W + 600, H); ctx.clip(); blit(uwC(), 200, 200, 0, 0); shafts(t, 0.7); grains(t, 40, 92, PEARL, 0.4, SY, 1550, -10); ctx.restore();
    [[220, 1650, 0.9], [520, 1700, 1.1], [820, 1660, 0.95]].forEach(([x, y, s], i) => { oyster(x, y, s, 0.25, t, i + 11, 1); });
    const sx = lerp(-80, 860, (lt + 0.3) / (d + 0.6));
    // moon path on the water + surface line
    ctx.fillStyle = rgba(PEARL, 0.25); for (let i = 0; i < 9; i++) ctx.fillRect(830 - 60 - rnd(i) * 40 + 20 * Math.sin(t * 2 + i), SY + 16 + i * 14, 120 + rnd(i * 3) * 80 - i * 8, 4);
    ship(sx, SY - 8 + 5 * Math.sin(t * 1.8), 1.05, t);
    ctx.beginPath(); for (let x = -300; x <= W + 300; x += 12) ctx.lineTo(x, SY + 8 * Math.sin(x * 0.018 - t * 2.4) + 4 * Math.sin(x * 0.05 + t)); ctx.strokeStyle = rgba(AQUA, 0.85); ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = rgba(CREAM, 0.6); for (let i = 0; i < 10; i++) { const ph = (t * 1.2 + i / 10) % 1; ctx.globalAlpha = 0.7 * (1 - ph); ctx.fillRect(sx - 200 - ph * 260, SY + 6 + rnd(i) * 14, 30, 3); } ctx.globalAlpha = 1;
    pill('GREEK SAILING GUIDE', 400, 230, 28, seg(t, Wd('greek', 4) - 0.1, Wd('greek', 4) + 0.25));
    note('~1st century CE', 400, 320, 54, CREAM, seg(t, Wd('first', 4) - 0.1, Wd('first', 4) + 0.3));
    drainReveal(seg(lt, 0, 0.5), RUST, t);
  } });
  cue(t10 + 0.3, 'whoosh', { gain: 0.4, dur: 1.4, pan: 0.5 });

  // a12 · the Periplus: a scroll unrolls (abstract lines only), PERIPLUS poured in sand, RECORD pill
  add({ id: 'a12', at: t11, cam: [540, 720], zoom: 0.08, note: 'scroll with mud rollers unrolls sideways inside the bottle (abstract lines only), PERIPLUS sand title, RECORD pill + "Greek, ~1st c. CE" note', draw(lt) {
    const t = t11 + lt;
    inBottle(t, () => {
      ctx.drawImage(skyC(), 0, 0, W, H); grains(t, 40, 101, CREAM, 0.45, 250, 1300);
      strataFloor(1520);
      [[280, 1800, 22], [800, 1792, 26]].forEach(([x, y, r], i) => pearl(x, y, r, t, 1, i * 3.1));
      scroll(540, 560, 1010, lerp(30, 410, eio(seg(lt, 0.05, 0.75))), t);
      sandTitle('PERIPLUS', 540, 390, 150, seg(t, Wd('periplus', 4) - 0.2, Wd('periplus', 4) + 0.4), t);
      pill('RECORD', 330, 1160, 28, seg(lt, 0.7, 1.0));
      note('Greek, ~1st c. CE', 700, 1160, 44, AQUA, seg(lt, 0.8, 1.1));
    });
  } });
  cue(t11 + 0.05, 'slide', { gain: 0.45, dur: 0.6 });

  // a13 · back on the sand map: route around the cape to the dot, COLCHI = Korkai, pearl fisheries bloom in the gulf
  add({ id: 'a13', at: t12, cam: [700, 980], zoom: 0.12, note: 'sand map again: coral dashed sea route + ship glyph rounds the cape to the dot, COLCHI title + RECORD pill + "= Korkai", iridescent pearls pop up in the gulf "pearl fisheries"', draw(lt, d) {
    const t = t12 + lt;
    mapBase(t);
    mapDot(KOR[0], KOR[1], t, 1);
    // route
    const R = [[-60, 1230], [200, 1255], [470, 1250], [620, 1170], [720, 1060], [705, 990]], rp = eio(seg(lt, 0, 1.0));
    const segs = R.slice(1).map((p, i) => Math.hypot(p[0] - R[i][0], p[1] - R[i][1])), tot = segs.reduce((a, b) => a + b, 0);
    let rem = rp * tot, end = R[0];
    ctx.save(); ctx.strokeStyle = CORAL; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([18, 14]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.moveTo(R[0][0], R[0][1]);
    for (let i = 0; i < segs.length && rem > 0; i++) { const f = Math.min(1, rem / segs[i]); end = [lerp(R[i][0], R[i + 1][0], f), lerp(R[i][1], R[i + 1][1], f)]; ctx.lineTo(end[0], end[1]); rem -= segs[i]; }
    ctx.stroke(); ctx.restore();
    if (rp < 1) ship(end[0], end[1], 0.18, t);
    sandTitle('COLCHI', 690, 760, 130, seg(t, Wd('colchi', 4) - 0.1, Wd('colchi', 4) + 0.45), t);
    pill('RECORD', 520, 870, 26, seg(t, Wd('colchi', 4) + 0.3, Wd('colchi', 4) + 0.6));
    note('= Korkai', 790, 870, 50, PEARL, seg(t, Wd('colchi', 4) + 0.4, Wd('colchi', 4) + 0.8));
    note('KORKAI', KOR[0] - 30, KOR[1] + 4, 56, CREAM, 1 - seg(t, Wd('colchi', 4) - 0.2, Wd('colchi', 4) + 0.2), 'right', BIG);
    const fp = seg(t, Wd('pearl', 4) - 0.15, Wd('pearl', 4) + 0.2);
    [[830, 1060], [900, 1130], [790, 1150], [960, 1050], [870, 1220], [1000, 1180], [760, 1080]].forEach(([x, y], i) => { const p = seg(fp + 0.0001, i * 0.08, i * 0.08 + 0.35); pearl(x, y, 27 * eob(p), t, 1, i * 1.3); });
    note('pearl fisheries', 890, 1260, 44, AQUA, seg(t, Wd('fisheries', 4) - 0.05, Wd('fisheries', 4) + 0.35));
  } });
  cue(Wd('colchi', 4), 'tock', { gain: 0.5, dur: 0.25 });
  cue(Wd('pearl', 4), 'sparkle', { gain: 0.45, dur: 0.7, pan: 0.3 });
  void tEnd;
}
