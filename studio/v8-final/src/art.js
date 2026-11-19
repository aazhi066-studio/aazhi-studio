// AAZHI: set pieces for "The King Who Built a Mountain in Stone" (built on the Chola Chronicle kit).
// Same rules as the style sheet: flat painted shapes, light is the only gradient, warm gold mood, no outlines on scenery.
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import * as K from './core/kit.js';
const { P } = K;

export const lg = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
export const poly = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
export const fillP = (pts, c) => { poly(pts); ctx.fillStyle = c; ctx.fill(); };
export const rad = (d) => d * Math.PI / 180;
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
export const rgba = (c, a) => { const A = hex(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };

// ───────────── offscreen cache: draw a heavy set piece once, then blit it every frame ─────────────
const CACHE = new Map();
export function cached(key, w, h, q, fn) {
  let c = CACHE.get(key); if (c) return c;
  c = document.createElement('canvas'); c.width = Math.ceil(w * q); c.height = Math.ceil(h * q);
  const prev = ctx, cx = c.getContext('2d'); setCtx(cx); cx.save(); cx.scale(q, q); fn(); cx.restore(); setCtx(prev);
  c._q = q; CACHE.set(key, c); return c;
}
/** blit a cached canvas so that its local point (ox, oy) lands on (x, y), scaled s */
export function blit(c, ox, oy, x, y, s = 1, a = 1, sy = s) {
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(c, x - ox * s, y - oy * sy, c.width / c._q * s, c.height / c._q * sy); ctx.restore();
}

// ───────────── light & air ─────────────
export function fog(y, h, a = 0.4, col = '255,190,110') {
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(-300, y - h / 2, W + 600, h);
}
export function veil(a, col = '10,4,0') { ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(-300, -300, W + 600, H + 600); }
/** drifting dust motes, a pure function of t */
export function dust(t, n = 40, seed = 0, col = '255,226,160', amp = 0.5) {
  for (let i = 0; i < n; i++) {
    const sp = 6 + rnd(i + seed) * 16, x = (rnd(i * 3 + seed) * (W + 200) + t * sp - 100) % (W + 200) - 50, y = (rnd(i * 7 + seed) * H + Math.sin(t * 0.4 + i) * 40 + t * -4 * rnd(i + 5)) % H;
    const r = 1.5 + rnd(i + 9) * 3, tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 2.1));
    ctx.fillStyle = `rgba(${col},${amp * tw})`; ctx.beginPath(); ctx.arc(x, (y + H) % H, r, 0, TAU); ctx.fill();
  }
}
/** soft smoke plumes rising (incense, lamps, camp fires) */
export function smoke(x, y, t, n = 7, col = '235,210,170', a = 0.16, spread = 90, rise = 520) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.18 + i / n) % 1, yy = y - ph * rise, xx = x + Math.sin(ph * 5 + i * 2) * spread * ph + (i - n / 2) * 8, r = 26 + ph * 120;
    const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, r); g.addColorStop(0, `rgba(${col},${a * (1 - ph) * Math.min(1, ph * 6)})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(xx - r, yy - r, r * 2, r * 2);
  }
}
export function stars(t, n = 70, a = 1, yMax = 900, seed = 0) {
  for (let i = 0; i < n; i++) { const x = rnd(i + seed) * W, y = rnd(i * 5 + 3 + seed) * yMax, tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * (0.8 + rnd(i) * 2) + i)); ctx.fillStyle = `rgba(255,236,200,${a * tw * (0.35 + rnd(i + 2) * 0.65)})`; ctx.beginPath(); ctx.arc(x, y, 1.1 + rnd(i + 8) * 1.8, 0, TAU); ctx.fill(); }
}
export function warmRays(t, a = 0.3, n = 6) { K.godrays(t, a, n, '255,205,120'); }
/** a horizontal haze gradient wash (aerial perspective) */
export function haze(y0, y1, col, aTop = 0, aBot = 0.8) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgba(col, aTop)); g.addColorStop(1, rgba(col, aBot)); ctx.fillStyle = g; ctx.fillRect(-300, y0, W + 600, y1 - y0); }

// ───────────── the great vimana ─────────────
export const GRAN = { body: '#A58A66', light: '#D3B684', dark: '#65503A', trim: '#E4CB96', niche: '#1C0F07' };
export const SIL = (c = '#0B0503') => ({ body: c, light: c, dark: c, trim: c, niche: c, gold: c });
export const VIM_OX = 440, VIM_OY = 1760, VIM_W = 880, VIM_H = 1780;   // cache canvas size and the base-centre origin
export const VIM_TOP = 1696;                                           // height of the finial tip above the base, in px at s = 1
const TIER = (i) => ({ w: 640 - i * (640 - 220) / 12, h: 62 - i });

function kuta(x, y, w, pal, lit) {
  const h = w * 0.62;
  rr(x - w / 2, y - h * 0.55, w, h * 0.55, 2); ctx.fillStyle = lg(x - w / 2, 0, x + w / 2, 0, [[0, pal.light], [0.5, pal.body], [1, pal.dark]]); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, y - h * 0.55, w * 0.47, h * 0.5, 0, Math.PI, TAU); ctx.fillStyle = lg(x - w / 2, 0, x + w / 2, 0, [[0, pal.trim], [0.45, pal.light], [1, pal.dark]]); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - w * 0.12, y); ctx.lineTo(x - w * 0.12, y - h * 0.3); ctx.arc(x, y - h * 0.3, w * 0.12, Math.PI, 0); ctx.lineTo(x + w * 0.12, y); ctx.fillStyle = lit ? `rgba(255,177,59,${0.4 + 0.5 * lit})` : pal.niche; ctx.fill();
  circle(x, y - h * 1.02, Math.max(1.4, w * 0.06), pal.gold || P.gold);
}
function arch(cx, base, w, h, fill) { ctx.beginPath(); ctx.moveTo(cx - w / 2, base); ctx.lineTo(cx - w / 2, base - h + w / 2); ctx.arc(cx, base - h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(cx + w / 2, base); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }

/** draw the vimana with its base-centre at (0, 0), growing up (negative y). o = { lit 0..1 (glow in niches), tiers (how many of the 13 to draw, may be fractional), crown (draw the capstone and finial), sil } */
export function vimana(pal = GRAN, o = {}) {
  const lit = o.lit || 0, nT = o.tiers == null ? 13 : o.tiers, sil = o.sil;
  const glowFill = lit ? `rgba(255,177,59,${0.35 + 0.55 * lit})` : pal.niche;
  // plinth
  let y = 0;
  for (const [w, h] of [[800, 24], [760, 22], [720, 22]]) { rr(-w / 2, y - h, w, h, 3); ctx.fillStyle = lg(-w / 2, 0, w / 2, 0, [[0, pal.light], [0.5, pal.body], [1, pal.dark]]); ctx.fill(); y -= h; }
  // two-storey sanctum wall with a central doorway
  for (let s = 0; s < 2; s++) {
    const w = 700 - s * 26, h = s ? 150 : 172;
    ctx.fillStyle = lg(-w / 2, 0, w / 2, 0, [[0, pal.light], [0.5, pal.body], [1, pal.dark]]); ctx.fillRect(-w / 2, y - h, w, h);
    const n = 9; for (let j = 0; j < n; j++) { const nx = -w / 2 + (j + 0.5) * w / n; if (s === 0 && j === 4) { arch(nx, y, 92, h * 0.78, glowFill); rr(nx - 54, y - h * 0.84, 108, 12, 3); ctx.fillStyle = pal.trim; ctx.fill(); } else arch(nx, y - h * 0.14, 30, h * 0.64, j % 3 === 1 && lit ? glowFill : pal.niche); }
    for (let j = 0; j <= n; j++) { const px = -w / 2 + j * w / n; ctx.fillStyle = pal.trim; ctx.globalAlpha = 0.5; ctx.fillRect(px - 2, y - h, 4, h); ctx.globalAlpha = 1; }
    rr(-w / 2 - 22, y - h - 24, w + 44, 24, 4); ctx.fillStyle = pal.trim; ctx.fill(); ctx.fillStyle = sil ? pal.dark : 'rgba(0,0,0,0.3)'; ctx.fillRect(-w / 2 - 14, y - h, w + 28, 10);
    y -= h + 24;
  }
  // 13 tapering tiers: walls first (bottom to top), then the rows of kutas on every terrace so they stand in front of the tier above
  const ys = [];
  for (let i = 0; i < 13; i++) {
    const { w, h } = TIER(i); if (i >= Math.ceil(nT)) break;
    const part = i + 1 > nT ? nT - i : 1, hh = h * part;
    ctx.save(); if (part < 1) { ctx.beginPath(); ctx.rect(-w, y - hh - 16, w * 2, hh + 16); ctx.clip(); }
    ctx.fillStyle = lg(-w / 2, 0, w / 2, 0, [[0, pal.light], [0.5, pal.body], [1, pal.dark]]); ctx.fillRect(-w / 2, y - h, w, h);
    const n = clamp(Math.round(w / 74), 3, 9);
    for (let j = 0; j < n; j++) { const nx = -w / 2 + (j + 0.5) * w / n; const mid = j === (n - 1) / 2; arch(nx, y - h * 0.16, mid ? 34 : 24, h * (mid ? 0.74 : 0.56), (lit && (j + i) % 2 === 0) || (mid && lit) ? glowFill : pal.niche); }
    const pw = w * 0.17; ctx.fillStyle = pal.light; ctx.globalAlpha = 0.4; ctx.fillRect(-pw / 2, y - h, pw, h); ctx.globalAlpha = 1;
    rr(-w / 2 - 10, y - h - 12, w + 20, 12, 3); ctx.fillStyle = pal.trim; ctx.fill(); ctx.fillStyle = sil ? pal.dark : 'rgba(0,0,0,0.3)'; ctx.fillRect(-w / 2 - 4, y - h, w + 8, 8);
    ctx.restore();
    ys.push([y - h - 12, w, i]); y -= h + 12 * (part < 1 ? 0 : 1);
    if (part < 1) { y += 0; break; }
  }
  if (!sil) for (const [yy, w, i] of ys) {
    const m = clamp(Math.round(w / 92) + 1, 3, 7), kw = 20 + (1 - i / 12) * 14;
    for (let k = 0; k < m; k++) kuta(-w / 2 + 6 + k * (w - 12) / (m - 1), yy + 2, kw, pal, lit && k % 2 === 0 ? lit * 0.6 : 0);
  } else for (const [yy, w, i] of ys) { const m = clamp(Math.round(w / 92) + 1, 3, 7), kw = 20 + (1 - i / 12) * 14; for (let k = 0; k < m; k++) kuta(-w / 2 + 6 + k * (w - 12) / (m - 1), yy + 2, kw, pal, 0); }
  o._top = y;
  if (nT < 13) return;
  // neck with four seated bulls, capstone slab, domed cupola, golden finial
  const nw = 226, nh = 62;
  ctx.fillStyle = lg(-nw / 2, 0, nw / 2, 0, [[0, pal.light], [0.5, pal.body], [1, pal.dark]]); ctx.fillRect(-nw / 2, y - nh, nw, nh);
  for (const j of [-1, 0, 1]) arch(j * 62, y - 8, 26, 38, lit ? glowFill : pal.niche);
  for (const sx of [-1, 1]) { ell(sx * 104, y - nh - 12, 24, 13, pal.body); circle(sx * 104 + sx * 20, y - nh - 22, 8, pal.body); ell(sx * 82, y - nh - 8, 15, 9, pal.dark); }
  y -= nh;
  rr(-146, y - 26, 292, 26, 3); ctx.fillStyle = pal.trim; ctx.fill(); rr(-128, y - 46, 256, 20, 3); ctx.fillStyle = lg(-128, 0, 128, 0, [[0, pal.light], [1, pal.dark]]); ctx.fill(); y -= 46;
  ctx.beginPath(); ctx.moveTo(-112, y); ctx.bezierCurveTo(-120, y - 74, -64, y - 128, 0, y - 132); ctx.bezierCurveTo(64, y - 128, 120, y - 74, 112, y); ctx.closePath(); ctx.fillStyle = lg(-112, 0, 112, 0, [[0, pal.trim], [0.4, pal.light], [1, pal.dark]]); ctx.fill();
  for (let k = 0; k < 9; k++) { const px = -88 + k * 22; ctx.beginPath(); ctx.ellipse(px, y - 10, 13, 24, (k - 4) * 0.05, 0, TAU); ctx.fillStyle = k % 2 ? pal.light : pal.trim; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1; }
  ctx.strokeStyle = pal.dark; ctx.lineWidth = 3; for (const k of [0.4, 0.7]) { ctx.beginPath(); ctx.ellipse(0, y - 14, 112 * (1 - k * 0.45), 22 * (1 - k * 0.2), 0, Math.PI, TAU); ctx.stroke(); }
  y -= 128;
  if (!sil) { K.kalasam(0, y + 6, 0.52); } else { ell(0, y - 20, 34, 40, pal.body); rr(-4, y - 90, 8, 60, 3); ctx.fillStyle = pal.body; ctx.fill(); }
  o._top = y - 140;
}
/** the vimana as a cached canvas. kind: 'stone' | 'sil' | 'lit' | 'dusk' */
export function vimanaImg(kind = 'stone', q = 1.5) {
  return cached('vim:' + kind, VIM_W, VIM_H, q, () => {
    ctx.translate(VIM_OX, VIM_OY);
    if (kind === 'sil') {                       // dark body + a thin amber rim light on the left edges
      ctx.save(); ctx.translate(-4, -2); vimana(SIL('#E39A4E'), { sil: true }); ctx.restore(); vimana(SIL('#0B0503'), { sil: true });
    } else if (kind === 'silplain') vimana(SIL('#0B0503'), { sil: true });
    else if (kind === 'lit') vimana(GRAN, { lit: 1 });
    else if (kind === 'dusk') vimana({ body: '#7A6650', light: '#A8906A', dark: '#43342A', trim: '#B89E70', niche: '#150A05' }, { lit: 0.9 });
    else vimana(GRAN, {});
  });
}
export const drawVimana = (kind, x, y, s = 1, a = 1, q = 1.5) => blit(vimanaImg(kind, q), VIM_OX, VIM_OY, x, y, s, a);

// ───────────── landscape ─────────────
const quadPt = (p0, c, p1, u) => [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]];
/** a palm: curved trunk and a crown of drooping, feathered fronds. (x, y) = foot */
export function palm(x, y, h, lean = 0.1, seed = 1, col = '#0C0603', t = 0, hi = null) {
  ctx.save(); ctx.translate(x, y); const topx = lean * h + Math.sin(t * 0.7 + seed) * h * 0.012, topy = -h;
  ctx.beginPath(); ctx.moveTo(-h * 0.022, 0); ctx.quadraticCurveTo(topx * 0.25, -h * 0.5, topx - h * 0.01, topy); ctx.lineTo(topx + h * 0.01, topy); ctx.quadraticCurveTo(topx * 0.25 + h * 0.03, -h * 0.5, h * 0.022, 0); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI + (i + 0.5) * Math.PI / n + (rnd(seed + i) - 0.5) * 0.22, L = h * (0.3 + rnd(seed * 3 + i) * 0.14), sw = Math.sin(t * 1.1 + i + seed) * 0.04, ca = Math.cos(a + sw), sa = Math.sin(a + sw);
    const p0 = [topx, topy], p1 = [topx + ca * L, topy + sa * L * 0.3 + L * 0.34 * (0.35 + Math.abs(ca) * 0.65)], c = [topx + ca * L * 0.5, topy + sa * L * 0.75 - L * 0.08];
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(c[0], c[1], p1[0], p1[1]); ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, h * 0.011); ctx.lineCap = 'round'; ctx.stroke();
    for (let u = 0.12; u < 1; u += 0.055) { const [px, py] = quadPt(p0, c, p1, u), [qx, qy] = quadPt(p0, c, p1, Math.min(1, u + 0.02)); const ang = Math.atan2(qy - py, qx - px), ll = L * 0.21 * Math.sin(Math.PI * (0.15 + u * 0.85)) + 3;
      for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(ang + sg * 1.05) * ll, py + Math.sin(ang + sg * 1.05) * ll + ll * 0.55); ctx.lineWidth = Math.max(1.3, h * 0.0065); ctx.stroke(); } }
  }
  ctx.restore();
}
/** terraced paddy fields in perspective. y0 = horizon edge, y1 = bottom. cols = [a, b, water] */
export function paddy(y0, y1, t = 0, cols = ['#5F6F2A', '#7E8434', '#E8BE70'], vx = 540, scroll = 0) {
  const N = 14; let prev = y0;
  for (let k = 1; k <= N; k++) {
    const y = y0 + (y1 - y0) * Math.pow(k / N, 1.85); ctx.fillStyle = k % 2 ? cols[0] : cols[1]; ctx.fillRect(-300, prev, W + 600, y - prev + 1);
    // water sheen in alternate bays
    if (k % 3 === 0) { ctx.fillStyle = rgba(cols[2], 0.35); ctx.fillRect(-300, prev + (y - prev) * 0.2, W + 600, (y - prev) * 0.5); }
    ctx.fillStyle = 'rgba(40,24,8,0.35)'; ctx.fillRect(-300, y - 2, W + 600, 3 + k * 0.5); prev = y;
  }
  ctx.strokeStyle = 'rgba(40,24,8,0.3)'; ctx.lineWidth = 3;
  for (let j = -9; j <= 9; j++) { const bx = vx + j * 130 + scroll * 0.2; ctx.beginPath(); ctx.moveTo(vx + (bx - vx) * 0.05, y0); ctx.lineTo(bx + (bx - vx) * 3.2, y1); ctx.stroke(); }
}
export function river(y, hgt, t, sunX = 700, col = ['#F0C27A', '#D98B45']) {
  ctx.beginPath(); ctx.moveTo(-300, y); ctx.bezierCurveTo(100, y - 60, 300, y + 40, 600, y - 10); ctx.bezierCurveTo(900, y - 50, 1100, y + 20, 1400, y - 20); ctx.lineTo(1400, y + hgt); ctx.bezierCurveTo(1000, y + hgt + 40, 800, y + hgt - 30, 560, y + hgt + 10); ctx.bezierCurveTo(300, y + hgt + 40, 100, y + hgt - 20, -300, y + hgt); ctx.closePath();
  ctx.fillStyle = lg(0, y, 0, y + hgt, [[0, col[0]], [1, col[1]]]); ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,244,200,0.55)';
  for (let i = 0; i < 28; i++) { const gx = sunX + (rnd(i) - 0.5) * 420 + Math.sin(t * 0.8 + i) * 20, gy = y + rnd(i + 20) * hgt, gw = 20 + rnd(i + 5) * 60; ctx.fillRect(gx - gw / 2, gy, gw, 3 + (gy - y) * 0.02); }
  ctx.restore();
}
/** a row of tiled-roof village houses */
export function village(x, y, s = 1, seed = 1, col = '#3A2414', roof = '#2A180C', glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  let hx = 0;
  for (let i = 0; i < 9; i++) {
    const w = 70 + rnd(seed + i) * 60, h = 46 + rnd(seed + i * 3) * 40;
    rr(hx, -h, w, h, 2); ctx.fillStyle = col; ctx.fill(); fillP([[hx - 8, -h + 4], [hx + w / 2, -h - 38 - rnd(seed + i) * 18], [hx + w + 8, -h + 4]], roof);
    if (glow) { rr(hx + w * 0.4, -h * 0.55, w * 0.2, h * 0.35, 2); ctx.fillStyle = `rgba(255,177,59,${0.4 + 0.5 * glow * (0.7 + 0.3 * Math.sin(i * 3))})`; ctx.fill(); }
    hx += w + 6 + rnd(seed + i * 7) * 16;
  }
  ctx.restore();
}

// ───────────── people & props ─────────────
export function tiger(x, y, s = 1, col = P.gold, dk = P.goldDark) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const lx of [-46, -26, 30, 52]) { rr(lx - 8, 4, 16, 48, 6); ctx.fillStyle = col; ctx.fill(); }
  ell(0, 0, 74, 34, col); ctx.beginPath(); ctx.moveTo(-70, -6); ctx.bezierCurveTo(-120, -40, -112, -90, -80, -84); ctx.lineWidth = 12; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke();
  circle(76, -22, 28, col); fillP([[60, -44], [66, -70], [82, -46]], col); fillP([[82, -46], [96, -66], [100, -38]], col); ell(98, -10, 15, 11, col);
  ctx.strokeStyle = dk; ctx.lineWidth = 5; for (const sx of [-44, -22, 0, 22, 44]) { ctx.beginPath(); ctx.moveTo(sx, -30); ctx.quadraticCurveTo(sx + 6, -4, sx - 2, 24); ctx.stroke(); }
  circle(84, -28, 4, dk); ctx.restore();
}
export function kingBust(x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  fillP([[-340, 0], [-310, -170], [-130, -262], [130, -262], [310, -170], [340, 0]], P.skin);
  fillP([[40, -262], [130, -262], [310, -170], [340, 0], [120, 0]], P.skinDark);
  ctx.beginPath(); ctx.moveTo(-340, 0); ctx.lineTo(-310, -170); ctx.lineTo(-130, -262); ctx.lineTo(-60, -262); ctx.lineTo(-120, -80); ctx.closePath(); ctx.fillStyle = P.skinHi; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
  line([[-300, -170], [230, -6]], P.kumkum, 66); line([[-300, -170], [230, -6]], '#E9C25A', 6);
  rr(-60, -340, 120, 130, 24); ctx.fillStyle = P.skinDark; ctx.fill();
  for (const [r, w] of [[160, 16], [215, 14], [270, 12]]) { ctx.beginPath(); ctx.arc(0, -250, r, 0.28, Math.PI - 0.28); ctx.strokeStyle = P.gold; ctx.lineWidth = w; ctx.stroke(); }
  for (let k = -3; k <= 3; k++) { const a = Math.PI / 2 + k * 0.22; circle(Math.cos(a) * 215, -250 + Math.sin(a) * 215, k % 2 ? 9 : 13, k % 2 ? P.kumkum : '#F5D58E'); }
  circle(0, -34, 26, P.kumkum); circle(0, -34, 14, '#F5D58E');
  for (const sx of [-1, 1]) { rr(sx * 288 - 36, -130, 72, 40, 12); ctx.fillStyle = P.gold; ctx.fill(); circle(sx * 288, -110, 11, P.kumkum); }
  circle(0, -432, 122, P.skin); ctx.beginPath(); ctx.ellipse(52, -428, 70, 112, 0, -1.2, 1.2); ctx.fillStyle = P.skinDark; ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
  for (const sx of [-1, 1]) { ell(sx * 122, -430, 18, 36, P.skinDark); ctx.strokeStyle = P.gold; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(sx * 124, -396, 22, 0, TAU); ctx.stroke(); ell(sx * 124, -356, 10, 22, P.gold); }
  ctx.beginPath(); ctx.arc(0, -452, 116, Math.PI * 1.02, Math.PI * 1.98); ctx.lineWidth = 30; ctx.strokeStyle = P.night; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-70, -392); ctx.quadraticCurveTo(-36, -370, 0, -386); ctx.quadraticCurveTo(36, -370, 70, -392); ctx.lineWidth = 15; ctx.strokeStyle = P.night; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-80, -470); ctx.lineTo(80, -470); ctx.lineWidth = 12; ctx.strokeStyle = P.goldDark; ctx.stroke();
  rr(-130, -566, 260, 40, 10); ctx.fillStyle = P.gold; ctx.fill();
  fillP([[-116, -566], [116, -566], [90, -632], [-90, -632]], P.gold); fillP([[-90, -632], [90, -632], [62, -694], [-62, -694]], '#F0C85A'); fillP([[-62, -694], [62, -694], [0, -790]], P.gold);
  fillP([[0, -790], [62, -694], [30, -694]], P.goldDark);
  for (const [gx, gy, c] of [[-80, -546, P.kumkum], [0, -546, '#F5D58E'], [80, -546, P.kumkum], [-50, -612, '#F5D58E'], [50, -612, '#F5D58E'], [0, -672, P.kumkum]]) { circle(gx, gy, 11, c); }
  circle(0, -800, 12, '#F5D58E'); ctx.restore();
}
/** the prabha: an arch of gold and light behind a king */
export function prabha(x, y, r, t) {
  ctx.save(); ctx.translate(x, y); K.glow(0, 0, r * 1.5, '255,190,100', 0.5);
  ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); ctx.lineTo(r, r * 0.9); ctx.lineTo(-r, r * 0.9); ctx.closePath(); ctx.fillStyle = 'rgba(40,12,8,0.55)'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); ctx.lineWidth = 26; ctx.strokeStyle = P.gold; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r - 36, Math.PI, 0); ctx.lineWidth = 6; ctx.strokeStyle = P.goldDark; ctx.stroke();
  for (let i = 0; i <= 18; i++) { const a = Math.PI + i * Math.PI / 18; ctx.save(); ctx.rotate(a); fillP([[r + 10, -14], [r + 54 + 8 * Math.sin(t * 3 + i), 0], [r + 10, 14]], P.gold); ctx.restore(); }
  ctx.restore();
}
export function parasol(x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); line([[0, -200], [0, -90]], P.goldDark, 8);
  ctx.beginPath(); ctx.moveTo(-250, 0); ctx.bezierCurveTo(-240, -110, -90, -150, 0, -150); ctx.bezierCurveTo(90, -150, 240, -110, 250, 0); ctx.closePath(); ctx.fillStyle = lg(-250, 0, 250, 0, [[0, '#E9D9AE'], [0.5, '#FFF4D2'], [1, '#C9B27E']]); ctx.fill();
  for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(i * 24, -148 + Math.abs(i) * 4); ctx.lineTo(i * 50, -4); ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1; }
  for (let i = -10; i <= 10; i++) { const fx = i * 25; circle(fx, 12 + Math.sin(t * 2 + i) * 3, 10, i % 2 ? P.gold : P.kumkum); }
  rr(-250, -8, 500, 12, 6); ctx.fillStyle = P.gold; ctx.fill(); circle(0, -206, 12, P.gold); ctx.restore();
}
export function chowrie(x, y, rot, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot + Math.sin(t * 2) * 0.05); line([[0, 0], [0, 240]], P.gold, 14);
  for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(i * 3, 0); ctx.quadraticCurveTo(i * 12, -90, i * 17 + Math.sin(t * 2 + i) * 6, -170); ctx.strokeStyle = i % 2 ? '#FFF4D8' : '#E8D9B4'; ctx.lineWidth = 5; ctx.stroke(); } ctx.restore(); }
export function granite(x, y, w, h, a = 1, shade = 0) {
  ctx.save(); ctx.globalAlpha *= a; const d = h * 0.28;
  fillP([[x, y - h], [x + w, y - h], [x + w + d, y - h - d], [x + d, y - h - d]], '#C3AA82');
  rr(x, y - h, w, h, 3); ctx.fillStyle = lg(x, 0, x + w, 0, [[0, '#A98F68'], [1, '#7C6445']]); ctx.fill();
  fillP([[x + w, y - h], [x + w + d, y - h - d], [x + w + d, y - d], [x + w, y]], '#5E4A32');
  ctx.strokeStyle = 'rgba(40,24,10,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w * 0.2, y - h * 0.3); ctx.lineTo(x + w * 0.5, y - h * 0.45); ctx.moveTo(x + w * 0.6, y - h * 0.7); ctx.lineTo(x + w * 0.9, y - h * 0.6); ctx.stroke();
  if (shade) { ctx.fillStyle = `rgba(20,8,2,${shade})`; ctx.fillRect(x, y - h - d, w + d, h + d); }
  ctx.restore();
}
/** timber scaffold: lashed poles from the ground up to height h */
export function scaffold(x, y, w, h, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = '#5A3A1C'; ctx.lineCap = 'round';
  const n = 5; for (let i = 0; i <= n; i++) { const px = x - w / 2 + i * w / n; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y - h); ctx.stroke(); }
  ctx.lineWidth = 6; for (let yy = y - 90; yy > y - h; yy -= 90) { ctx.beginPath(); ctx.moveTo(x - w / 2, yy); ctx.lineTo(x + w / 2, yy); ctx.stroke(); }
  ctx.lineWidth = 4; for (let i = 0; i < n; i++) for (let yy = y; yy > y - h + 90; yy -= 180) { ctx.beginPath(); ctx.moveTo(x - w / 2 + i * w / n, yy); ctx.lineTo(x - w / 2 + (i + 1) * w / n, yy - 90); ctx.stroke(); }
  ctx.restore();
}

export function dancer(x, y, h, t, dir = 1, ph = 0) {
  const s = h / 700, sw = Math.sin(t * 3 + ph), sw2 = Math.sin(t * 3 + ph + 1.6);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  for (const k of [-1, 1]) ell(k * 40, -8, 30, 12, P.skinDark);
  ctx.save(); ctx.translate(sw * 10, 0);
  fillP([[-70, -322], [70, -322], [138 + sw * 6, -14], [-138 + sw * 6, -14]], P.kumkum); for (let i = -4; i <= 4; i++) line([[i * 14, -312], [i * 17 + sw * 4, -22]], 'rgba(60,10,10,0.35)', 4);
  rr(-140 + sw * 6, -34, 280, 20, 6); ctx.fillStyle = P.gold; ctx.fill();
  fillP([[-60, -522], [60, -522], [54, -312], [-54, -312]], P.skin); fillP([[-62, -522], [62, -522], [58, -440], [-58, -440]], '#F1E3C2');
  rr(-60, -340, 120, 24, 8); ctx.fillStyle = P.gold; ctx.fill(); circle(0, -328, 9, P.kumkum);
  const arm = (shx, a1, a2) => { const r1 = rad(a1), r2 = rad(a2), ex = shx + Math.sin(r1) * 110, ey = -500 + Math.cos(r1) * 110, hx = ex + Math.sin(r2) * 100, hy = ey + Math.cos(r2) * 100; line([[shx, -500], [ex, ey]], P.skin, 30); line([[ex, ey], [hx, hy]], P.skin, 26); circle(ex, ey + 2, 18, P.gold); circle(hx, hy, 16, P.skinDark); };
  arm(-60, 100 + sw2 * 14, 150); arm(60, 160 + sw * 12, 190);
  for (const [r, w] of [[40, 8], [62, 8]]) { ctx.beginPath(); ctx.arc(0, -520, r, 0.3, Math.PI - 0.3); ctx.strokeStyle = P.gold; ctx.lineWidth = w; ctx.stroke(); }
  ctx.restore();
  rr(-14, -552, 28, 26, 8); ctx.fillStyle = P.skinDark; ctx.fill();
  ctx.save(); ctx.translate(sw * 10, 0); circle(0, -596, 50, P.skin); ctx.beginPath(); ctx.arc(0, -604, 52, Math.PI * 1.03, Math.PI * 1.97); ctx.lineWidth = 20; ctx.strokeStyle = P.night; ctx.stroke(); circle(-40, -612, 26, P.night);
  ctx.beginPath(); ctx.moveTo(-50, -590); ctx.quadraticCurveTo(-90, -480 + sw * 14, -70, -340); ctx.lineWidth = 16; ctx.strokeStyle = P.night; ctx.stroke();
  for (const fx of [-52, -36, -22]) circle(fx, -636, 8, '#F6EFDC'); circle(0, -626, 7, P.gold); ctx.restore();
  ctx.restore();
}
export function drum(x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ell(0, 0, 86, 46, '#6E3A1E'); rr(-84, -46, 168, 92, 30); ctx.fillStyle = lg(0, -46, 0, 46, [[0, '#B56A3C'], [1, '#6E3A1E']]); ctx.fill(); ell(-84, 0, 22, 48, '#F1E3C2'); ell(84, 0, 22, 48, '#E6D3A6'); for (const k of [-50, -20, 10, 40]) line([[k, -46], [k + 10, 46]], P.gold, 4); ctx.restore(); }
/** reveal dots in a grid: n of total shown */
export function dotGrid(x, y, cols, rows, gap, r, shown, col, hi = '#FFF1BE') {
  const total = cols * rows;
  for (let i = 0; i < total; i++) { if (i >= shown) break; const cx = x + (i % cols) * gap, cy = y + Math.floor(i / cols) * gap; circle(cx, cy, r, col); circle(cx - r * 0.3, cy - r * 0.3, r * 0.35, hi); }
}
const glyph = (x, y, sz, sd) => { const k = Math.floor(rnd(sd) * 5); ctx.beginPath();
  if (k === 0) ctx.arc(x, y, sz * 0.4, 0.5, TAU - 0.5); else if (k === 1) { ctx.moveTo(x - sz * 0.4, y + sz * 0.3); ctx.quadraticCurveTo(x, y - sz * 0.8, x + sz * 0.4, y + sz * 0.3); ctx.moveTo(x, y - sz * 0.1); ctx.lineTo(x, y + sz * 0.45); }
  else if (k === 2) { ctx.arc(x - sz * 0.15, y, sz * 0.28, 0, TAU); ctx.moveTo(x + sz * 0.2, y - sz * 0.4); ctx.lineTo(x + sz * 0.2, y + sz * 0.45); } else if (k === 3) { ctx.moveTo(x - sz * 0.4, y); ctx.bezierCurveTo(x - sz * 0.2, y - sz * 0.7, x + sz * 0.3, y - sz * 0.7, x + sz * 0.4, y); ctx.lineTo(x + sz * 0.4, y + sz * 0.45); }
  else { ctx.moveTo(x - sz * 0.35, y - sz * 0.3); ctx.lineTo(x + sz * 0.35, y - sz * 0.3); ctx.moveTo(x, y - sz * 0.3); ctx.lineTo(x, y + sz * 0.45); } ctx.stroke(); };
/** a big wall of granite courses with a recessed band of illustrative carved marks (cached, 2400 x 1920) */
export function wallImg() {
  return cached('wall', 2400, 1920, 1, () => {
    ctx.fillStyle = '#5A4630'; ctx.fillRect(0, 0, 2400, 1920);
    let y = 0, row = 0;
    while (y < 1920) {
      const h = row === 4 ? 360 : 190 + rnd(row * 3) * 70; let x = -((row * 137) % 300);
      while (x < 2400) { const w = 240 + rnd(row * 11 + x) * 200, tn = rnd(row * 7 + x * 0.3); ctx.fillStyle = mixc('#7C6446', '#B09468', tn); ctx.fillRect(x, y, w - 4, h - 4); ctx.fillStyle = 'rgba(255,230,170,0.10)'; ctx.fillRect(x, y, w - 4, 8); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x, y + h - 14, w - 4, 10);
        if (row === 4) { ctx.strokeStyle = 'rgba(40,22,8,0.75)'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; for (let ln = 0; ln < 6; ln++) for (let g = 0; g < Math.floor((w - 24) / 34); g++) if (rnd(ln * 91 + g * 13 + x) > 0.12) glyph(x + 22 + g * 34, y + 40 + ln * 52, 26, ln * 977 + g * 31 + x); }
        x += w; }
      y += h; row++;
    }
  });
}
