// v27 shared kit: "Neon Noir Wall". READ FULLY before writing shots.
// Every scene is NEON TUBE line art mounted on a dark, rain-wet BRICK WALL at night. Tubes ignite with a stutter (ignite), draw themselves
// along a path (tube with p), buzz/flicker, SHORT-CIRCUIT with sparks and die to grey dead glass (tube o.b = 0), and the whole wall can
// BLACK OUT. Rain streaks run down the wall; a wet pavement strip at the bottom reflects the tubes (wall o.wet).
// RECURRING MOTIF ("watch the throne"): one AMBER neon THRONE outline (throne). Its occupant flickers; at the end the throne tube turns MAGENTA.
// Colour code: Chola / Athirajendra = AMBER; Vikramaditya (Western Chalukya, brother-in-law) = CYAN; Kulottunga / Rajendra Chalukya of Vengi = MAGENTA;
// the revolt / the city's anger = RED; neutral labels = WHITE.
// No faces, no portraits, no real writing or inscription text (only our short tags), no religious symbols, temples or deities, no gore
// (a killing = the occupant's tube shorting out: sparks + red flash + the figure going dead grey).
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { cached, rgba } from './art.js';

export const PAL = {
  brick: '#1A0E12', brickHi: '#2C171C', mortar: '#0A0507', black: '#050304', wet: '#0B0A12',
  amber: '#FFB23E', amberHi: '#FFE0A0', cyan: '#3FE6F2', cyanHi: '#C8FBFF', magenta: '#FF3FB8', magentaHi: '#FFC2EA',
  red: '#FF3B3B', redHi: '#FFB0A0', white: '#FFF2E6', dead: '#5A5560', glass: '#8A8590',
};
export const HI = { [PAL.amber]: PAL.amberHi, [PAL.cyan]: PAL.cyanHi, [PAL.magenta]: PAL.magentaHi, [PAL.red]: PAL.redHi, [PAL.white]: '#FFFFFF' };
const SANS = 'Inter, Arial, sans-serif';

// ---------- small helpers ----------
export const pop = (lt, t0, d = 0.3) => eob(clamp((lt - t0) / d));
export function shk(lt, t0, amp, dur = 0.5) { const k = 1 - seg(lt, t0, t0 + dur); if (lt < t0 || k <= 0) return [0, 0]; const a = amp * k * k; return [Math.sin(lt * 93) * a, Math.cos(lt * 71) * a]; }
export function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
/** first fraction p of a polyline (by length) */
export function part(pts, p) {
  let tot = 0; const Ls = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); Ls.push(d); tot += d; }
  let left = tot * clamp(p); const out = [pts[0]];
  for (let i = 1; i < pts.length && left > 0; i++) { const d = Ls[i - 1]; if (d <= left) { out.push(pts[i]); left -= d; } else { const u = left / d; out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); left = 0; } }
  return out;
}
/** neon IGNITION brightness at lt for a tube struck at t0: stutters (on-off-on) then holds 1. Returns 0 before t0. */
export function ignite(lt, t0, seed = 0, d = 0.32) {
  const u = lt - t0; if (u < 0) return 0; if (u > d) return 1;
  const k = u / d, s = rnd(Math.floor(u * 40) + seed * 13);
  return k < 0.25 ? (s > 0.5 ? 0.9 : 0.05) : k < 0.6 ? (s > 0.3 ? 0.8 : 0.15) : (s > 0.1 ? 1 : 0.4);
}
/** neon SHORT-OUT brightness: 1 before t0, sputters, then 0 (dead) after t0 + d */
export function short(lt, t0, seed = 0, d = 0.35) {
  const u = lt - t0; if (u < 0) return 1; if (u > d) return 0;
  return rnd(Math.floor(u * 50) + seed * 7) > 0.35 + u / d * 0.6 ? 1 : 0.1;
}
/** constant buzz flicker (multiply your brightness by this): mostly 1, rare dips */
export function buzz(t, seed = 0, amt = 1) { const r = rnd(Math.floor(t * 24) + seed * 31); return r < 0.04 * amt ? 0.35 : r < 0.1 * amt ? 0.8 : 1; }

// ---------- the wall ----------
function wallImg(tone) {
  return cached('n_wall_' + tone, W, H, 0.5, () => {
    const base = tone === 'red' ? '#200A0C' : tone === 'blue' ? '#0E0E1A' : PAL.brick;
    ctx.fillStyle = PAL.mortar; ctx.fillRect(0, 0, W, H);
    const bw = 150, bh = 62;
    for (let r = 0, y = 0; y < H; r++, y += bh) for (let x = -(r % 2) * bw / 2; x < W; x += bw) {
      const v = rnd(r * 53 + x * 0.7); ctx.fillStyle = v > 0.66 ? PAL.brickHi : v < 0.2 ? '#120A0D' : base;
      ctx.fillRect(x + 4, y + 4, bw - 8, bh - 8);
      ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fillRect(x + 4, y + 4, bw - 8, 6);
    }
    for (let i = 0; i < 1500; i++) { ctx.fillStyle = `rgba(0,0,0,${0.1 + rnd(i * 3) * 0.25})`; ctx.fillRect(rnd(i * 5) * W, rnd(i * 7) * H, 3, 3); }
    // wet streak stains
    for (let i = 0; i < 26; i++) { const x = rnd(i + 91) * W, w = 10 + rnd(i + 3) * 40; const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.35)'); ctx.fillStyle = g; ctx.fillRect(x, rnd(i) * 600, w, H); }
  });
}
/** brick wall at night. o.tone 'brick' | 'red' | 'blue'; o.rain 0..1 rain streak amount; o.wet = y where the wet pavement starts (reflect zone); o.glowCol, o.gx, o.gy: tinted spill light on the bricks */
export function wall(t, o = {}) {
  ctx.drawImage(wallImg(o.tone || 'brick'), 0, 0, W, H);
  if (o.glowCol) glow(o.gx ?? 540, o.gy ?? 800, o.gr ?? 900, o.glowCol, o.ga ?? 0.16);
  if (o.wet) { const y = o.wet; const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, 'rgba(8,7,14,0.92)'); g.addColorStop(1, 'rgba(3,3,6,1)');
    ctx.fillStyle = g; ctx.fillRect(-300, y, W + 600, H - y + 300); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(-300, y, W + 600, 3); }
  const v = ctx.createRadialGradient(540, 860, 320, 540, 900, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.78)'); ctx.fillStyle = v; ctx.fillRect(-300, -300, W + 600, H + 600);
  if (o.rain) rain(t, o.rain);
}
/** falling rain streaks over everything */
export function rain(t, a = 0.6, seed = 0) {
  ctx.save(); ctx.strokeStyle = `rgba(200,210,240,${0.22 * a})`; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 120; i++) { const sp = 1400 + rnd(i + seed) * 900, x = rnd(i * 3 + seed) * (W + 200) - 100, y = ((rnd(i * 7 + seed) * H + t * sp) % (H + 200)) - 100, l = 30 + rnd(i + 5) * 50;
    ctx.moveTo(x, y); ctx.lineTo(x - l * 0.12, y + l); }
  ctx.stroke(); ctx.restore();
}
/** draw a scene callback mirrored below y (the wet pavement reflection). fn() must draw in normal coords. a = reflection alpha */
export function reflect(y, fn, a = 0.28, t = 0) {
  ctx.save(); ctx.beginPath(); ctx.rect(-300, y, W + 600, H - y + 300); ctx.clip();
  ctx.globalAlpha *= a; ctx.translate(Math.sin(t * 3) * 4, 2 * y); ctx.scale(1, -1); fn(); ctx.restore();
}

// ---------- neon marks ----------
/** NEON TUBE along pts, drawn to fraction p. o.col, o.w (tube width, default 12), o.b brightness 0..1 (0 = dead grey glass), o.close (closed path), o.tip (bright head while drawing) */
export function tube(pts, p = 1, o = {}) {
  if (p <= 0.003 || pts.length < 2) return; let q = part(pts, p); if (q.length < 2) return; if (o.close && p >= 1) q = [...q, pts[0]];
  const col = o.col || PAL.white, w = o.w ?? 12, b = clamp(o.b ?? 1), hi = HI[col] || '#FFFFFF';
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = () => { ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); for (let i = 1; i < q.length; i++) ctx.lineTo(q[i][0], q[i][1]); };
  path();
  // dead glass always visible underneath
  ctx.strokeStyle = rgba(PAL.glass, 0.35); ctx.lineWidth = w; ctx.stroke();
  if (b > 0.02) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(col, 0.07 * b); ctx.lineWidth = w * 6; ctx.stroke();
    ctx.strokeStyle = rgba(col, 0.16 * b); ctx.lineWidth = w * 3; ctx.stroke();
    ctx.strokeStyle = rgba(col, 0.9 * b); ctx.lineWidth = w; ctx.stroke();
    ctx.strokeStyle = rgba(hi, 0.85 * b); ctx.lineWidth = w * 0.38; ctx.stroke();
  }
  ctx.restore();
  if (o.tip && p < 1 && b > 0) { const e = q[q.length - 1]; glow(e[0], e[1], w * 6, hi, 0.7 * b); }
}
/** wall spill glow under a tube group (cheap halo): call before the tubes */
export function halo(x, y, r, col, b = 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, r, col, 0.22 * b); ctx.restore(); }
/** point helpers */
export const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
export const circPts = (x, y, r, n = 48, a0 = -Math.PI / 2, sweep = TAU) => Array.from({ length: n + 1 }, (_, i) => [x + Math.cos(a0 + sweep * i / n) * r, y + Math.sin(a0 + sweep * i / n) * r]);
/** tube from point list relative to (x, y) at scale s */
export const at = (pts, x, y, s = 1) => pts.map(([a, b]) => [x + a * s, y + b * s]);

/** NEON TEXT: our own short tags/titles only. Glowing outlined letters. o.b brightness, o.font (default Inter 900), o.p reveal 0..1 (letters light one by one), o.seed */
export function sign(text, x, y, size, col = PAL.white, o = {}) {
  const b = clamp(o.b ?? 1), hi = HI[col] || '#FFFFFF', n = text.length, shown = Math.ceil(n * clamp(o.p ?? 1));
  if (shown <= 0) return;
  ctx.save(); ctx.font = o.font || `900 ${size}px ${SANS}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.letterSpacing = '0px'; const ls = o.ls ?? size * 0.06;
  let full = -ls; for (const ch of text) full += ctx.measureText(ch).width + ls; let cx = x - full / 2;
  for (let i = 0; i < n; i++) { const ch = text[i], wch = ctx.measureText(ch).width; if (i < shown) {
      const bb = b * (o.flick ? buzz((o.t || 0) + i * 0.37, i + (o.seed || 0), o.flick) : 1);
      ctx.lineWidth = size * 0.06; ctx.strokeStyle = rgba(PAL.glass, 0.4); ctx.strokeText(ch, cx, y);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = size * 0.22; ctx.strokeStyle = rgba(col, 0.12 * bb); ctx.strokeText(ch, cx, y);
      ctx.lineWidth = size * 0.09; ctx.strokeStyle = rgba(col, 0.85 * bb); ctx.strokeText(ch, cx, y);
      ctx.lineWidth = size * 0.03; ctx.strokeStyle = rgba(hi, 0.9 * bb); ctx.strokeText(ch, cx, y);
      ctx.globalCompositeOperation = 'source-over'; }
    cx += wch + ls; }
  ctx.restore();
}
/** small boxed neon TAG (e.g. ILLUSTRATION, BILHANA'S VERSION, DISPUTED) */
export function tag(text, x, y, col = PAL.white, b = 1, size = 44) {
  ctx.save(); ctx.font = `900 ${size}px ${SANS}`; ctx.letterSpacing = '0px'; let w = size * 1.1 - size * 0.08; for (const ch of text) w += ctx.measureText(ch).width + size * 0.08; ctx.restore();
  tube(rectPts(x - w / 2, y - size * 0.85, w, size * 1.7), 1, { col, w: 5, b });
  sign(text, x, y + 2, size, col, { b, ls: size * 0.08 });
}
/** spark shower from (x, y) for a short-circuit at t0 */
export function sparks(x, y, lt, t0, n = 40, R = 380, seed = 0, col = PAL.amberHi) {
  const u = lt - t0; if (u < 0 || u > 1.1) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const ang = -Math.PI / 2 + (rnd(i + seed) - 0.5) * 3.4, sp = R * (0.4 + 0.6 * rnd(i + seed + 9)), k = u;
    const px = x + Math.cos(ang) * sp * k, py = y + Math.sin(ang) * sp * k + 900 * k * k, a = (1 - u / 1.1) * (0.5 + 0.5 * rnd(i + seed + 4));
    ctx.strokeStyle = rgba(col, a); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - Math.cos(ang) * 14, py - Math.sin(ang) * 14 - 20 * k); ctx.stroke(); }
  ctx.restore(); glow(x, y, 260, col, 0.5 * clamp(1 - u * 3));
}
/** full-frame colour flash (a 0..1) */
export function flash(a, col = PAL.white) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(col, clamp(a)); ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }
/** blackout overlay (a 0..1) */
export function blackout(a) { if (a <= 0) return; ctx.fillStyle = `rgba(0,0,0,${clamp(a)})`; ctx.fillRect(-300, -300, W + 600, H + 600); }

// ---------- neon objects (all line art; s = scale; o.b brightness, o.p draw fraction, o.col) ----------
const CROWN = [[-90, 40], [-110, -50], [-55, -5], [0, -80], [55, -5], [110, -50], [90, 40], [-90, 40]];
/** neon crown centred at (x, y) */
export function crown(x, y, s = 1, o = {}) { tube(at(CROWN, x, y, s), o.p ?? 1, { col: o.col || PAL.amber, w: (o.w ?? 12) * Math.min(1.4, s), b: o.b, tip: true });
  if ((o.p ?? 1) >= 1) for (const dx of [-55, 0, 55]) tube(at([[dx, 18], [dx + 0.1, 18]], x, y, s), 1, { col: o.col || PAL.amber, w: 16 * s, b: o.b }); }
const THRONE = [[-120, 220], [-120, 0], [-150, -40], [-150, -260], [-90, -320], [0, -350], [90, -320], [150, -260], [150, -40], [120, 0], [120, 220]];
const SEAT = [[-150, -10], [150, -10]], STEP = [[-200, 220], [200, 220]];
/** THE MOTIF: neon throne outline (base at y + 220*s). o.col (default amber), o.b, o.p */
export function throne(x, y, s = 1, o = {}) { const c = o.col || PAL.amber, p = o.p ?? 1;
  tube(at(THRONE, x, y, s), p, { col: c, w: 13 * Math.min(1.3, s), b: o.b, tip: true });
  tube(at(SEAT, x, y, s), clamp(p * 2 - 1), { col: c, w: 11 * Math.min(1.3, s), b: o.b });
  tube(at(STEP, x, y, s), clamp(p * 2 - 1), { col: c, w: 9 * Math.min(1.3, s), b: o.b }); }
/** faceless neon FIGURE standing at feet (x, y), height ~ 420*s. o.col, o.b, o.p, o.hat 'crown' | 'turban' | 'helm' | null, o.spear, o.arm (-1..1 raised arm), o.sit (seated pose on a throne) */
export function figure(x, y, s = 1, o = {}) {
  const c = o.col || PAL.white, b = o.b, p = o.p ?? 1, w = 11 * Math.min(1.3, s), sit = o.sit;
  const hy = sit ? -330 : -380, body = sit ? [[-60, -40], [-70, -250], [0, -285], [70, -250], [60, -40]] : [[-70, 0], [-30, -200], [-60, -280], [0, -305], [60, -280], [30, -200], [70, 0]];
  tube(at(body, x, y, s), p, { col: c, w, b, tip: true });
  if (sit) tube(at([[-60, -40], [-110, -30], [-110, 60]], x, y, s), p, { col: c, w, b }), tube(at([[60, -40], [110, -30], [110, 60]], x, y, s), p, { col: c, w, b });
  tube(circPts(x, y + hy * s, 55 * s, 36), clamp(p * 1.4 - 0.2), { col: c, w, b });
  const ar = o.arm ?? 0; tube(at([[55, -260], [110 + 30 * ar, -190 - 110 * ar], [130 + 40 * ar, -120 - 200 * ar]], x, y, s), clamp(p * 1.5 - 0.5), { col: c, w: w * 0.9, b });
  tube(at([[-55, -260], [-110, -190], [-125, -110]], x, y, s), clamp(p * 1.5 - 0.5), { col: c, w: w * 0.9, b });
  if (o.hat === 'crown') crown(x, y + (hy - 85) * s, 0.55 * s, { col: o.hatCol || PAL.amber, b, p: clamp(p * 2 - 1) });
  if (o.hat === 'turban') tube(at([[-60, hy - 30], [-40, hy - 75], [0, hy - 90], [40, hy - 75], [60, hy - 30]], x, y, s), clamp(p * 2 - 1), { col: c, w, b });
  if (o.hat === 'helm') tube(at([[-62, hy - 10], [-50, hy - 70], [0, hy - 105], [50, hy - 70], [62, hy - 10]], x, y, s), clamp(p * 2 - 1), { col: c, w, b });
  if (o.spear) tube(at([[150, 40], [150, -560], [130, -520], [150, -600], [170, -520], [150, -560]], x, y, s), clamp(p * 2 - 1), { col: c, w: w * 0.8, b });
}
/** row of small RIOTERS / soldiers marching or massing: n figures from x0 to x1 at base y, s scale, lt for bob; o.torch (red flame dots above), o.col, o.b, o.march (px/s) */
export function crowd(x0, x1, y, n, lt, o = {}) {
  const s = o.s ?? 0.35, c = o.col || PAL.red;
  for (let i = 0; i < n; i++) { const u = n === 1 ? 0.5 : i / (n - 1), x = lerp(x0, x1, u) + (o.march || 0) * lt, bob = Math.abs(Math.sin(lt * 8 + i)) * 10 * s / 0.35;
    figure(x, y - bob, s * (0.85 + 0.3 * rnd(i + 3)), { col: c, b: (o.b ?? 1) * buzz(lt, i + 7, 0.6), arm: o.torch ? 0.9 : 0 });
    if (o.torch) { const fx = x + 175 * s, fy = y - bob - 520 * s; glow(fx, fy, 70 * s / 0.35, PAL.red, 0.5 * (o.b ?? 1)); flame(fx, fy, s * 1.4, lt + i, o.b); } }
}
/** small neon flame (torch) */
export function flame(x, y, s, t, b = 1) { const f = Math.sin(t * 17) * 8 * s; tube([[x - 18 * s, y + 10 * s], [x - 10 * s + f, y - 30 * s], [x + f * 0.5, y - 60 * s], [x + 10 * s - f, y - 30 * s], [x + 18 * s, y + 10 * s]], 1, { col: PAL.red, w: 8 * s, b, close: true }); }
/** CITY skyline (secular: flat roofs, walls, gate, watch towers; NO temple towers) as one tube from x0..x1 at ground y, height h */
export function city(x0, x1, y, h, p = 1, o = {}) {
  const pts = [[x0, y]]; let x = x0, i = 0;
  while (x < x1) { const w = 60 + rnd(i * 7 + (o.seed || 0)) * 90, hh = h * (0.35 + 0.65 * rnd(i * 3 + 1 + (o.seed || 0))); pts.push([x, y - hh], [Math.min(x1, x + w), y - hh]); x += w; i++; pts.push([Math.min(x1, x), y - hh * 0.4]); }
  pts.push([x1, y]);
  tube(pts, p, { col: o.col || PAL.amber, w: o.w ?? 9, b: o.b, tip: true });
}
/** gate / arch outline (city gate) */
export function gate(x, y, s = 1, o = {}) { tube(at([[-160, 0], [-160, -300], [-100, -380], [0, -410], [100, -380], [160, -300], [160, 0]], x, y, s), o.p ?? 1, { col: o.col || PAL.amber, w: 12 * s, b: o.b, tip: true });
  tube(at([[-230, 0], [-230, -460], [230, -460], [230, 0]], x, y, s), clamp((o.p ?? 1) * 1.5 - 0.5), { col: o.col || PAL.amber, w: 9 * s, b: o.b }); }
/** dashed neon ROUTE arrow from a to b with bend, drawn to p */
export function route(a, b, p = 1, o = {}) {
  const mx = (a[0] + b[0]) / 2 + (o.bend || 0), my = (a[1] + b[1]) / 2 - Math.abs(o.bend || 0) * 0.3, pts = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u * u * b[1]]); }
  const q = part(pts, p); for (let i = 0; i < q.length - 1; i += 2) tube([q[i], q[i + 1]], 1, { col: o.col || PAL.cyan, w: o.w ?? 10, b: o.b });
  if (p >= 0.98) { const e = pts[40], d = pts[37], ang = Math.atan2(e[1] - d[1], e[0] - d[0]);
    tube([[e[0] - Math.cos(ang - 0.5) * 50, e[1] - Math.sin(ang - 0.5) * 50], e, [e[0] - Math.cos(ang + 0.5) * 50, e[1] - Math.sin(ang + 0.5) * 50]], 1, { col: o.col || PAL.cyan, w: o.w ?? 10, b: o.b }); }
}
/** hanging wire / cable between two points (sags; swings with t) */
export function wire(x0, y0, x1, y1, sag = 80, t = 0) { ctx.save(); ctx.strokeStyle = 'rgba(20,18,24,0.95)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo((x0 + x1) / 2 + Math.sin(t * 2) * 10, (y0 + y1) / 2 + sag, x1, y1); ctx.stroke(); ctx.restore(); }
/** neon FAMILY LINE (tree link): vertical link with nodes; nodes = [[x, y, col]], drawn to p */
export function lineage(nodes, p = 1, o = {}) {
  for (let i = 0; i < nodes.length; i++) { const [x, y, c] = nodes[i], pi = clamp(p * nodes.length - i);
    if (i > 0 && pi > 0) tube([[nodes[i - 1][0], nodes[i - 1][1] + 46], [x, y - 46]], pi, { col: o.linkCol || PAL.white, w: 7, b: o.b });
    if (pi > 0.5) tube(circPts(x, y, 40, 32), clamp(pi * 2 - 1), { col: c || PAL.amber, w: 10, b: o.b }); }
}
/** brick DUST / debris falling (a sign dropping, a crack) */
export function debris(x, y, lt, t0, n = 24, seed = 0) { const u = lt - t0; if (u < 0 || u > 1.4) return;
  for (let i = 0; i < n; i++) { const px = x + (rnd(i + seed) - 0.5) * 300 + (rnd(i + 5) - 0.5) * 200 * u, py = y + 1200 * u * u * (0.5 + rnd(i + 9)); ctx.fillStyle = `rgba(90,60,60,${1 - u / 1.4})`; ctx.fillRect(px, py, 6 + rnd(i) * 10, 6 + rnd(i + 2) * 10); } }
