// EPISODE 20 · worker A : "Forged Iron & Rust", lines 0-3 (t 0 -> L(4)). THE HOOK.
// a0 glowing chain whips toward camera over a moonlit iron temple and SNAPS (spark burst, ember flash, VANISHED?) ·
// a1 temple doorway push, chain inside dissolves into embers · a2 inside: broken shackles glowing on the stone floor ·
// a3 1750s torch-cut · a4 PULI THEVAR cut-out, tiger stripes hot-cut on his shield · a5 rivet map NERKATTUMSEVAL ·
// a6 NO TRIBUTE: iron palm shoves the tribute tray back · a7 NAWAB + BRITISH flags around the tiger shield ·
// a8 ACCOUNTS SAY, YUSUF KHAN + cannon fires · a9 cannonball arcs hot-cut cracks into the fort wall · a10 1761 ·
// a11 FORT FALLS, wall pieces drop · a12 ESCAPED through the gap at night · a13 empty noose on rust sky, dropped
// plumed turban, HANGED 1764 · a14 RETAKEN: tiger flag rises over the fort.
// Engine: plates, temple, fort, map, figures, tags baked once with cached(); per frame only blits, clips, a few
// strokes, sparks and glow sprites. No shadowBlur outside caches.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, fillP, poly, lg } from './art.js';
import * as K from './core/kit.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const EMBER = '255,122,26', HOT = '255,193,90', MOON = '143,179,201', WHITE = '255,230,168';

// ───────────── shared helpers (copied exactly from ART.md) ─────────────
function plateImg(key = 'plate20', rust = 1) {
  return cached(key, W, H, 1, () => { const c = ctx;
    const g = c.createRadialGradient(540, 800, 150, 540, 960, 1300); g.addColorStop(0, '#2E2822'); g.addColorStop(0.6, '#211C18'); g.addColorStop(1, '#0E0C0A');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) { const y = rnd(i) * H, x = rnd(i + 5) * W, l = 40 + rnd(i + 9) * 260, v = rnd(i + 13);
      c.fillStyle = v > 0.5 ? `rgba(200,190,175,${0.015 + v * 0.03})` : `rgba(0,0,0,${0.05 + v * 0.08})`; c.fillRect(x, y, l, 1 + (v * 2 | 0)); }
    for (let i = 0; i < 70; i++) { c.beginPath(); const x = rnd(i + 99) * W, y = rnd(i + 199) * H, a = (rnd(i + 299) - 0.5) * 0.6, l = 30 + rnd(i + 399) * 140;
      c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.strokeStyle = 'rgba(220,210,195,0.07)'; c.lineWidth = 1; c.stroke(); }
    for (let i = 0; i < 26 * rust; i++) { const x = rnd(i + 501) * W, y = rnd(i + 601) * H, r = 30 + rnd(i + 701) * 160;
      const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(138,59,23,${0.18 + rnd(i + 801) * 0.2})`); rg.addColorStop(0.6, 'rgba(94,42,18,0.10)'); rg.addColorStop(1, 'rgba(94,42,18,0)');
      c.fillStyle = rg; c.fillRect(x - r, y - r, r * 2, r * 2); }
    const v = c.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  });
}
function rivet(x, y, r = 9) { const c = ctx; const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r);
  g.addColorStop(0, '#8C8378'); g.addColorStop(0.5, '#3E3731'); g.addColorStop(1, '#120F0D'); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = g; c.fill(); }
function hotCut(pts, p = 1, w = 6, cool = 0.6) { const c = ctx, n = Math.max(2, Math.floor(pts.length * p)); if (n < 2) return; const hot = Math.max(2, Math.floor(n * 0.12));
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); for (let i = 0; i < n; i++) i ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.strokeStyle = `rgba(168,50,26,${0.35 + 0.5 * (1 - cool)})`; c.lineWidth = w; c.stroke();
  c.beginPath(); for (let i = n - hot; i < n; i++) i > n - hot ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.strokeStyle = '#FF7A1A'; c.lineWidth = w * 1.4; c.stroke();
  c.strokeStyle = '#FFE6A8'; c.lineWidth = w * 0.5; c.stroke();
  if (p < 1) { const [x, y] = pts[n - 1]; K.glow(x, y, w * 7, '255,190,100', 0.8); } }
function sparks(x, y, t, n = 24, seed = 1, spd = 700) { const c = ctx; if (t < 0 || t > 1.2) return;
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(seed + i) - 0.5) * 2.6, v = spd * (0.4 + rnd(seed + i * 3) * 0.8), life = 0.5 + rnd(seed + i * 7) * 0.6; if (t > life) continue;
    const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + 900 * t * t, k = 1 - t / life;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px - Math.cos(a) * 18 * k, py - (Math.sin(a) * v + 1800 * t) / v * 18 * k);
    c.strokeStyle = `rgba(255,${150 + 90 * k | 0},${60 * k | 0},${k})`; c.lineWidth = 2.5; c.stroke(); } }

// ───────────── small helpers ─────────────
const MC = document.createElement('canvas').getContext('2d');
const lp = (x0, y0, x1, y1, n = 20) => Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(y0, y1, i / n)]);
/** additive glow from a cached sprite (cheap, per frame) */
function glowS(x, y, r, col = EMBER, a = 0.6) {
  if (a <= 0 || r <= 0) return;
  const img = cached('aGl' + col, 128, 128, 1, () => { const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, `rgba(${col},1)`); g.addColorStop(0.3, `rgba(${col},0.38)`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128); });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= Math.min(1, a); ctx.drawImage(img, x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
const shake = (lt, t0, amp = 14) => { const d = lt - t0; if (d < 0 || d > 0.6) return [0, 0]; const k = Math.exp(-d * 8) * amp; return [sin(d * 90) * k, cos(d * 71) * k]; };
/** continuous spark stream from a moving torch head */
function torch(x, y, lt, seed = 1, n = 4) { for (let k = 0; k < 7; k++) { const f = lt / 0.06, tau = ((f % 1) + k) * 0.06, s = Math.floor(f) - k; sparks(x, y, tau, n, s * 13 + seed, 420); } }
function coldStars(t, n = 50, yMax = 900) { for (let i = 0; i < n; i++) { const x = rnd(i + 40) * W, y = rnd(i * 5 + 43) * yMax, tw = 0.4 + 0.6 * (0.5 + 0.5 * sin(t * (1 + rnd(i) * 2) + i));
  ctx.fillStyle = `rgba(190,215,230,${tw * (0.3 + rnd(i + 2) * 0.6)})`; ctx.fillRect(x, y, 2 + rnd(i + 8) * 2, 2 + rnd(i + 8) * 2); } }
const plate = () => blit(plateImg(), 0, 0, 0, 0, 1);

/** calm caption zone: plain dark plate below an iron strap (y > 1290 stays quiet) */
function calm(night = false) {
  const img = cached(night ? 'aCalmN' : 'aCalm', W, 680, 1, () => { const c = ctx;
    c.drawImage(plateImg(), 0, 1240, W, 680, 0, 0, W, 680); c.fillStyle = night ? 'rgba(6,10,14,0.55)' : 'rgba(8,6,5,0.5)'; c.fillRect(0, 0, W, 680);
    c.fillStyle = '#2A231E'; c.fillRect(0, 34, W, 26); c.fillStyle = night ? 'rgba(143,179,201,0.35)' : 'rgba(220,200,180,0.3)'; c.fillRect(0, 34, W, 2);
    c.fillStyle = 'rgba(0,0,0,0.7)'; c.fillRect(0, 60, W, 4); for (let x = 40; x < W; x += 125) rivet(x, 47, 7);
    const g = c.createLinearGradient(0, 0, 0, 34); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); c.fillStyle = g; c.fillRect(0, 0, W, 34); });
  blit(img, 0, 0, 0, 1240, 1); ctx.fillStyle = '#0B0908'; ctx.fillRect(-300, 1915, W + 600, 400);
}

// ───────────── stencil tags ─────────────
function tagImg(text, size) {
  MC.font = `900 ${size}px Inter`; MC.letterSpacing = `${Math.round(size * 0.06)}px`;
  const tw = MC.measureText(text).width, padX = size * 0.62, w = Math.ceil(tw + padX * 2), h = Math.ceil(size * 1.62);
  return cached(`aTag_${text}_${size}`, w, h, 1, () => { const c = ctx;
    rr(3, 3, w - 6, h - 6, size * 0.14); c.fillStyle = lg(0, 0, 0, h, [[0, '#3A322B'], [0.1, '#28211C'], [1, '#110E0C']]); c.fill();
    c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.85)'; c.stroke();
    c.fillStyle = 'rgba(225,205,185,0.3)'; c.fillRect(size * 0.2, 5, w - size * 0.4, 2);
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(200,190,175,${0.03 + rnd(i + size) * 0.04})`; c.fillRect(rnd(i * 3 + size) * w, rnd(i * 7) * h, 20 + rnd(i) * 60, 1); }
    c.font = `900 ${size}px Inter`; c.letterSpacing = `${Math.round(size * 0.06)}px`; c.textBaseline = 'middle'; c.textAlign = 'left';
    const tx = padX + Math.round(size * 0.03), ty = h / 2 + size * 0.05;
    c.fillStyle = '#0A0807'; c.fillText(text, tx, ty);           // the cut-through hole
    c.shadowColor = 'rgba(255,122,26,0.95)'; c.shadowBlur = size * 0.35; c.fillStyle = '#FF7A1A'; c.fillText(text, tx, ty); c.shadowBlur = 0;
    c.fillStyle = lg(0, ty - size * 0.5, 0, ty + size * 0.5, [[0, '#FFD69A'], [0.5, '#FFB25A'], [1, '#E06E1A']]); c.fillText(text, tx, ty);
    const bw = Math.max(3, size * 0.07); c.fillStyle = '#241E1A';
    for (const k of [0.26, 0.52, 0.78]) c.fillRect(tx + tw * k - bw / 2, ty - size * 0.46, bw, size * 0.9);
    const rv = Math.max(4, size * 0.09); for (const [x, y] of [[rv * 1.9, rv * 1.9], [w - rv * 1.9, rv * 1.9], [rv * 1.9, h - rv * 1.9], [w - rv * 1.9, h - rv * 1.9]]) rivet(x, y, rv);
  });
}
/** stencil tag slamming in at local time t0 (t0 < -0.2: already there) */
function tag(text, x, y, size, lt, t0 = -1, o = {}) {
  const p = seg(lt, t0, t0 + 0.2); if (p <= 0) return; const img = tagImg(text, size), w = img.width, h = img.height, st = lt - t0 - 0.2;
  const s = (o.s || 1) * lerp(1.7, 1, eo(p)), a = clamp(p * 2.5) * (o.a ?? 1), j = st > 0 ? sin(st * 40) * Math.exp(-st * 12) * 6 : 0;
  glowS(x, y + j, w * 0.62 * s, EMBER, 0.16 * a);
  blit(img, w / 2, h / 2, x, y + j, s, a);
  if (!o.quiet) { sparks(x - w * 0.46, y + h * 0.3, st, 12, 7 + size, 520); sparks(x + w * 0.46, y + h * 0.3, st, 12, 31 + size, 520); }
}
/** a tag revealed by a cutting torch moving left to right (p 0..1) */
function torchTag(text, x, y, size, p, lt) {
  if (p <= 0) return; const img = tagImg(text, size), w = img.width, h = img.height, x0 = x - w / 2, hx = x0 + w * p;
  glowS(x, y, w * 0.6, EMBER, 0.2 * p);
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y - h, w * p + 10, h * 2); ctx.clip(); blit(img, w / 2, h / 2, x, y, 1); ctx.restore();
  if (p < 1) { ctx.fillStyle = '#FFE6A8'; ctx.fillRect(hx - 3, y - h / 2 + 6, 6, h - 12); ctx.fillStyle = 'rgba(255,122,26,0.8)'; ctx.fillRect(hx - 10, y - h / 2 + 6, 7, h - 12);
    const hy = y + sin(lt * 30) * h * 0.3; glowS(hx, hy, 130, WHITE, 0.9); torch(hx, hy, lt, size); }
}

// ───────────── rust bloom (transition) ─────────────
function rustImg() { return cached('aRust', W, H, 0.5, () => { const c = ctx; c.fillStyle = '#4A200E'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) { const x = rnd(i + 3) * W, y = rnd(i + 9) * H, r = 40 + rnd(i + 11) * 200, col = ['138,59,23', '181,84,31', '94,42,18', '40,18,8'][i % 4];
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},0.55)`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(${rnd(i) > 0.5 ? '210,110,50' : '20,8,4'},${0.1 + rnd(i + 1) * 0.3})`; c.fillRect(rnd(i + 7) * W, rnd(i + 8) * H, 2 + rnd(i + 2) * 4, 2 + rnd(i + 4) * 3); } }); }
function blobPath(x, y, p, pad = 0) { const R = p * 2200; ctx.beginPath(); ctx.moveTo(x + R * 0.8 + pad, y); ctx.arc(x, y, R * 0.8 + pad, 0, TAU);
  for (let i = 0; i < 34; i++) { const a = i / 34 * TAU + rnd(i) * 0.3, d = R * (0.78 + rnd(i + 5) * 0.12), r = p * (120 + rnd(i + 9) * 260) + pad, bx = x + cos(a) * d, by = y + sin(a) * d; ctx.moveTo(bx + r, by); ctx.arc(bx, by, r, 0, TAU); } }
/** rust covering the frame from (x,y), coverage p 0..1 */
function rust(x, y, p) { if (p <= 0) return; ctx.save(); blobPath(x, y, p, 22); ctx.fillStyle = '#B5541F'; ctx.fill(); blobPath(x, y, p, 8); ctx.fillStyle = '#FF9A3A'; ctx.fill();
  blobPath(x, y, p, 0); ctx.clip(); blit(rustImg(), 0, 0, 0, 0, 1); ctx.restore(); }

// ───────────── chain ─────────────
function linkStroke(face, heat) { const c = ctx;
  c.lineWidth = face ? 22 : 18; c.strokeStyle = `rgba(255,${100 + 60 * heat | 0},30,${0.55 + 0.45 * heat})`; c.stroke();
  c.lineWidth = face ? 13 : 10; c.strokeStyle = '#1C1714'; c.stroke();
  c.lineWidth = 2; c.strokeStyle = 'rgba(150,135,120,0.5)'; c.stroke(); }
function link(x, y, ang, s, face, heat = 1) { const c = ctx; c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  if (face) rr(-56, -32, 112, 64, 32); else rr(-58, -8, 116, 16, 8); linkStroke(face, heat); c.restore(); }
function drawChain(pts, s = 1, heat = 1, glowA = 0.25) {
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < pts.length - 1; i++) { if ((i % 2 === 0) !== (pass === 0)) continue;
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    if (pass === 0 && glowA > 0) glowS(mx, my, 90 * s, EMBER, glowA * heat);
    link(mx, my, Math.atan2(y1 - y0, x1 - x0), s, i % 2 === 0, heat); } }
/** half of a broken link (a C) */
function halfLink(x, y, ang, s, heat = 1) { const c = ctx; c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.beginPath(); c.moveTo(6, -32); c.lineTo(-24, -32); c.arc(-24, 0, 32, -PI / 2, PI / 2, true); c.lineTo(6, 32); linkStroke(true, heat); c.restore(); }
function chainFrom(ax, ay, n, sp, angAt) { const pts = [[ax, ay]]; let x = ax, y = ay; for (let i = 0; i < n; i++) { const a = angAt(i); x += cos(a) * sp; y += sin(a) * sp; pts.push([x, y]); } return pts; }

// ───────────── set pieces (cached) ─────────────
function nightImg() { return cached('aNight', W, H, 1, () => { const c = ctx; c.drawImage(plateImg(), 0, 0);
  c.fillStyle = 'rgba(20,40,58,0.5)'; c.fillRect(0, 0, W, H);
  c.fillStyle = lg(0, 0, 0, 1200, [[0, 'rgba(78,106,124,0.35)'], [1, 'rgba(78,106,124,0)']]); c.fillRect(0, 0, W, 1200); }); }
function moonImg() { return cached('aMoon', 240, 240, 1, () => { const c = ctx; const g = c.createRadialGradient(100, 100, 10, 120, 120, 100);
  g.addColorStop(0, '#D8E4EA'); g.addColorStop(0.8, '#9DB6C6'); g.addColorStop(1, '#6F8C9E'); c.beginPath(); c.arc(120, 120, 100, 0, TAU); c.fillStyle = g; c.fill();
  for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(70 + rnd(i) * 100, 70 + rnd(i + 3) * 100, 6 + rnd(i + 6) * 16, 0, TAU); c.fillStyle = 'rgba(70,95,112,0.25)'; c.fill(); } }); }
const moon = (x, y, s = 1) => { glowS(x, y, 360 * s, MOON, 0.45); blit(moonImg(), 120, 120, x, y, s); };

// temple: local 900x1300, base centre (450,1300); door centre (450,1170)
function templeImg() { return cached('aTemple', 900, 1300, 1, () => { const c = ctx, cx = 450, base = 1300;
  const tiers = [[760, 300], [640, 170], [540, 150], [450, 135], [370, 120], [300, 105]], steel = ['#1B252D', '#202C35', '#25333D', '#2A3945', '#2F404D', '#344755'];
  let y = base;
  tiers.forEach(([w, h], i) => { y -= h; c.fillStyle = lg(0, y, 0, y + h, [[0, steel[i]], [1, '#11181D']]); c.fillRect(cx - w / 2, y, w, h);
    c.fillStyle = 'rgba(143,179,201,0.6)'; c.fillRect(cx - w / 2 - 6, y, w + 12, 4); c.fillStyle = 'rgba(143,179,201,0.16)'; c.fillRect(cx - w / 2, y, 4, h);
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(cx + w / 2 - 6, y, 6, h);
    if (i > 0) { const nn = Math.max(3, 8 - i); for (let k = 0; k < nn; k++) { const nx = cx - w / 2 + (k + 0.5) * w / nn; c.beginPath(); c.moveTo(nx - 13, y + h * 0.85); c.lineTo(nx - 13, y + h * 0.4); c.arc(nx, y + h * 0.4, 13, PI, 0); c.lineTo(nx + 13, y + h * 0.85); c.fillStyle = '#0A0F12'; c.fill(); } }
    for (let rx = cx - w / 2 + 22; rx < cx + w / 2 - 10; rx += 44) rivet(rx, y + h - 12, 5); });
  c.beginPath(); c.moveTo(cx - 170, y); c.quadraticCurveTo(cx - 170, y - 120, cx, y - 130); c.quadraticCurveTo(cx + 170, y - 120, cx + 170, y); c.closePath();
  c.fillStyle = lg(0, y - 130, 0, y, [[0, '#435A6A'], [1, '#26343E']]); c.fill(); c.lineWidth = 3; c.strokeStyle = 'rgba(143,179,201,0.7)'; c.stroke();
  for (let k = -2; k <= 2; k++) { const fx = cx + k * 62, fy = y - 122 + Math.abs(k) * 22 - (k === 0 ? 10 : 0); fillP([[fx - 9, fy + 10], [fx, fy - 46], [fx + 9, fy + 10]], '#3A4F5E'); c.beginPath(); c.arc(fx, fy + 6, 10, 0, TAU); c.fillStyle = '#4E6A7C'; c.fill(); }
  for (let k = 0; k < 2; k++) { const px = cx + (k ? 210 : -210); c.fillStyle = '#141B20'; c.fillRect(px - 30, base - 280, 60, 280); c.fillStyle = 'rgba(143,179,201,0.3)'; c.fillRect(px - 30, base - 280, 60, 3); }
  c.beginPath(); c.moveTo(cx - 92, base); c.lineTo(cx - 92, base - 170); c.arc(cx, base - 170, 92, PI, 0); c.lineTo(cx + 92, base); c.closePath(); c.fillStyle = '#4E6A7C'; c.fill();
  c.beginPath(); c.moveTo(cx - 80, base); c.lineTo(cx - 80, base - 170); c.arc(cx, base - 170, 80, PI, 0); c.lineTo(cx + 80, base); c.closePath(); c.fillStyle = '#05080A'; c.fill(); }); }

// interior: local W x 1300
function insideImg() { return cached('aInside', W, 1300, 1, () => { const c = ctx;
  c.fillStyle = lg(0, 0, 0, 780, [[0, '#121A20'], [1, '#22303A']]); c.fillRect(0, 0, W, 780);
  for (let r = 0; r < 8; r++) for (let k = 0; k < 9; k++) { const bx = k * 140 - (r % 2) * 70, by = r * 98; c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 3; c.strokeRect(bx, by, 140, 98); c.fillStyle = 'rgba(143,179,201,0.08)'; c.fillRect(bx + 2, by + 2, 136, 2); }
  c.beginPath(); c.moveTo(640, 640); c.lineTo(640, 470); c.arc(720, 470, 80, PI, 0); c.lineTo(800, 640); c.closePath(); c.fillStyle = '#070A0C'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(143,179,201,0.35)'; c.stroke();
  c.fillStyle = '#2C2620'; c.fillRect(630, 640, 180, 18);
  c.fillStyle = lg(0, 780, 0, 1300, [[0, '#1A232A'], [1, '#2B3A44']]); c.fillRect(0, 780, W, 520);
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 3; for (let k = -8; k <= 8; k++) { c.beginPath(); c.moveTo(540 + k * 40, 780); c.lineTo(540 + k * 260, 1300); c.stroke(); }
  for (const y of [810, 860, 930, 1030, 1160]) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.fillStyle = 'rgba(143,179,201,0.25)'; c.fillRect(0, 778, W, 3);
  for (const [x, w] of [[-20, 170], [930, 170]]) { c.fillStyle = lg(x, 0, x + w, 0, [[0, '#07090B'], [0.7, '#141C22'], [1, '#0A0E11']]); c.fillRect(x, 0, w, 1300);
    c.fillStyle = 'rgba(143,179,201,0.3)'; c.fillRect(x + (x < 0 ? w - 4 : 0), 0, 4, 1300); for (let y = 80; y < 1300; y += 160) rivet(x + w / 2, y, 7); } }); }

// fort: local W x 900, bottom at 900; placed with local (0,0) at world (ox, oy)
const FORT_OY = 370;
function fortDraw(c, night) {
  const iron = night ? ['#1E2830', '#141B21'] : ['#3A3029', '#1C1815'], bev = night ? 'rgba(143,179,201,0.55)' : 'rgba(255,190,140,0.45)';
  const block = (x, y, w, h) => { c.fillStyle = lg(0, y, 0, y + h, [[0, iron[0]], [1, iron[1]]]); c.fillRect(x, y, w, h); c.fillStyle = bev; c.fillRect(x, y, w, 3); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + w - 5, y, 5, h); };
  const merlons = (x0, x1, y) => { for (let x = x0; x < x1 - 20; x += 56) block(x, y - 46, 34, 48); };
  block(0, 320, W, 580); merlons(0, W, 322);
  for (const [x, w, top] of [[60, 160, 200], [440, 200, 140], [860, 160, 200]]) { block(x, top, w, 900 - top); merlons(x - 6, x + w + 6, top + 2); }
  c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 3;
  for (let x = 120; x < W; x += 120) { c.beginPath(); c.moveTo(x, 330); c.lineTo(x, 900); c.stroke(); }
  for (const y of [520, 720]) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); for (let x = 30; x < W; x += 60) rivet(x, y - 12, 5); }
  for (let x = 30; x < W; x += 60) rivet(x, 345, 5);
  c.beginPath(); c.moveTo(480, 900); c.lineTo(480, 700); c.arc(540, 700, 60, PI, 0); c.lineTo(600, 900); c.closePath(); c.fillStyle = '#090706'; c.fill(); c.lineWidth = 5; c.strokeStyle = bev; c.stroke();
  for (let k = 0; k < 3; k++) { c.fillStyle = '#0A0807'; c.fillRect(522 + 0, 210 + k * 0, 36, 70); }
  for (const x of [125, 925]) { c.fillStyle = '#0A0807'; c.fillRect(x, 260, 30, 60); }
}
const fortImg = (night = false) => cached(night ? 'aFortN' : 'aFort', W, 900, 1, () => fortDraw(ctx, night));
// gap pieces (local coords): a 3x4 jittered grid right of the gate tower
const GC = 3, GR = 4, GV = [];
for (let r = 0; r <= GR; r++) { GV.push([]); for (let c = 0; c <= GC; c++) { const jx = (r > 0 && r < GR) || c % GC ? (rnd(r * 9 + c * 3 + 1) - 0.5) * 36 : 0, jy = r > 0 && r < GR ? (rnd(r * 5 + c * 11 + 2) - 0.5) * 50 : 0;
  GV[r].push([Math.max(648, 662 + c * 66 + jx), 236 + r * 166 + jy]); } }
const GAP = [...GV[0], ...GV.slice(1).map((r) => r[GC]), ...GV[GR].slice().reverse().slice(1), ...GV.slice(1, GR).reverse().map((r) => r[0])];
const PIECES = []; for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) PIECES.push({ r, c, pts: [GV[r][c], GV[r][c + 1], GV[r + 1][c + 1], GV[r + 1][c]] });
/** draw the fort; mode 'whole' | 'gap'; ft = seconds since fall (pieces drop) */
function fort(ox, night = false, mode = 'whole', ft = -1) {
  const img = fortImg(night), c = ctx;
  c.save(); c.translate(ox, FORT_OY);
  if (mode === 'whole' && ft < 0) c.drawImage(img, 0, 0, W, 900);
  else {
    c.save(); c.beginPath(); c.rect(-10, -10, W + 20, 920); GAP.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.clip('evenodd'); c.drawImage(img, 0, 0, W, 900); c.restore();
    if (ft >= 0 || mode === 'whole') for (const P of PIECES) { const d = (GR - 1 - P.r) * 0.05 + rnd(P.c * 7 + P.r) * 0.06, tau = Math.max(0, ft - d);
      if (tau > 1.1) continue; const cxp = (P.pts[0][0] + P.pts[2][0]) / 2, cyp = (P.pts[0][1] + P.pts[2][1]) / 2;
      const dy = 0.5 * 2400 * tau * tau, dx = (rnd(P.c + P.r * 3 + 4) - 0.5) * 260 * tau, rot = (rnd(P.c * 3 + P.r + 9) - 0.5) * 3 * tau;
      c.save(); c.globalAlpha = clamp(1.3 - tau * 1.2); c.translate(cxp + dx, cyp + dy); c.rotate(rot); c.translate(-cxp, -cyp);
      poly(P.pts); c.save(); c.clip(); c.drawImage(img, 0, 0, W, 900); c.restore();
      if (tau > 0) { poly(P.pts); c.lineWidth = 4; c.strokeStyle = 'rgba(255,140,60,0.8)'; c.stroke(); }
      c.restore(); }
    if (mode === 'gap' && ft < 0) { poly(GAP); c.lineWidth = 5; c.strokeStyle = night ? 'rgba(143,179,201,0.5)' : 'rgba(255,122,26,0.6)'; c.stroke(); }
  }
  c.restore();
}
// cracks (local fort coords)
const IMPACTS = [[700, 470], [810, 610], [735, 740], [800, 380]];
const CRACKS = IMPACTS.map(([x, y], k) => [0, 1, 2, 3].map((b) => { const pts = [[x, y]]; let a = b * 1.6 + rnd(k * 5 + b) * 1.2, px = x, py = y;
  for (let i = 0; i < 9; i++) { a += (rnd(k * 31 + b * 7 + i) - 0.5) * 1.1; px += cos(a) * 22; py += sin(a) * 22; pts.push([px, py]); } return pts; }));
function cracks(ox, which, ps) { ctx.save(); ctx.translate(ox, FORT_OY); which.forEach((k, j) => CRACKS[k].forEach((pts) => hotCut(pts, ps[j], 5, 0.4))); ctx.restore(); }

// map: local W x 1300
const WEST = [[-60, 120], [41, 200], [60, 300], [91, 424], [150, 560], [206, 709], [270, 820], [338, 900], [430, 975], [520, 1032]];
const EAST = [[600, 995], [701, 931], [718, 794], [760, 700], [900, 650], [1031, 629], [1070, 560], [1031, 464], [1100, 380], [1180, 300], [1180, 120]];
const NERK = [487, 709], MADU = [708, 424];
function mapImg() { return cached('aMap', W, 1300, 1, () => { const c = ctx; const land = [...WEST, ...EAST];
  poly(land); c.fillStyle = lg(0, 100, 0, 1050, [[0, '#3E352D'], [1, '#2A231E']]); c.fill();
  c.save(); poly(land); c.clip(); for (let i = 0; i < 500; i++) { const v = rnd(i + 3); c.fillStyle = v > 0.5 ? `rgba(220,200,180,${0.03 + v * 0.03})` : `rgba(0,0,0,${0.06 + v * 0.06})`; c.fillRect(rnd(i) * W, 100 + rnd(i + 1) * 1000, 40 + rnd(i + 2) * 200, 1 + (v * 2 | 0)); }
  for (let i = 0; i < 8; i++) { const x = rnd(i + 70) * 900, y = 200 + rnd(i + 80) * 700, r = 60 + rnd(i + 90) * 120, g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(138,59,23,0.3)'); g.addColorStop(1, 'rgba(138,59,23,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); } c.restore();
  poly(land); c.lineWidth = 4; c.strokeStyle = 'rgba(255,190,140,0.35)'; c.stroke();
  const coast = [...WEST.slice(1), ...EAST.slice(0, -1)]; for (let i = 0; i < coast.length - 1; i++) { const [x0, y0] = coast[i], [x1, y1] = coast[i + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 34);
    for (let k = 0; k < n; k++) rivet(lerp(x0, x1, k / n), lerp(y0, y1, k / n), 8); }
  c.font = '900 26px Inter'; c.letterSpacing = '8px'; c.fillStyle = 'rgba(143,179,201,0.35)'; c.textAlign = 'center'; c.fillText('SEA', 880, 1100); }); }
function hotRivet(x, y, r, heat, lt) { glowS(x, y, r * 6, EMBER, 0.5 * heat); rivet(x, y, r); ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, TAU); ctx.fillStyle = `rgba(255,${150 + 80 * heat | 0},60,${0.5 + 0.5 * heat})`; ctx.fill();
  if (heat > 0.5) { const ph = (lt * 1.3) % 1; ctx.beginPath(); ctx.arc(x, y, r + ph * 70, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,150,60,${(1 - ph) * 0.8})`; ctx.stroke(); } }

// figures
const DK = { '#3A3029': '#1B1612', '#2C251F': '#130F0C', '#3E342C': '#1E1814', '#463B33': '#221B16', '#4A3E35': '#261F19', '#5A4C40': '#2E251E' };
function ironFill(col = '#3A3029', edge = 'rgba(255,175,120,0.4)') { ctx.fillStyle = DK[col] || col; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = edge; ctx.stroke(); }
function rimLight(w, h, col = '255,122,26', a = 0.35, left = false) { const c = ctx; c.save(); c.globalCompositeOperation = 'source-atop';
  c.fillStyle = lg(left ? w : 0, 0, left ? 0 : w, 0, [[0, `rgba(${col},0)`], [0.7, `rgba(${col},0)`], [1, `rgba(${col},${a})`]]); c.fillRect(0, 0, w, h); c.restore(); }
// Puli Thevar: local 520x1120, feet (260,1100); shield centre (350,560)
function puliImg(cold = false) { return cached(cold ? 'aPuliN' : 'aPuli', 520, 1120, 1, () => { const c = ctx, ed = cold ? 'rgba(143,179,201,0.55)' : 'rgba(255,170,110,0.6)', body = cold ? '#1E262C' : '#1B1612';
  const P = (pts, col = body) => { poly(pts); ironFill(col, ed); };
  P([[222, 690], [262, 690], [252, 1095], [212, 1095]], '#2C251F'); P([[258, 690], [302, 690], [318, 1095], [280, 1095]]);
  P([[330, 340], [362, 352], [384, 520], [352, 530]], '#2C251F');
  P([[178, 560], [342, 560], [376, 840], [146, 840]]);
  c.beginPath(); c.moveTo(178, 345); c.quadraticCurveTo(260, 300, 342, 345); c.lineTo(330, 585); c.lineTo(190, 585); c.closePath(); ironFill(body, ed);
  c.fillStyle = '#5E2A12'; c.fillRect(186, 555, 150, 24);
  c.fillStyle = body; c.fillRect(242, 282, 36, 50);
  c.beginPath(); c.ellipse(260, 242, 48, 60, 0, 0, TAU); ironFill(cold ? '#26313A' : '#463B33', ed);
  c.beginPath(); c.moveTo(212, 222); c.lineTo(168, 312); c.lineTo(192, 316); c.lineTo(228, 232); c.closePath(); ironFill('#2C251F', ed);
  c.beginPath(); c.ellipse(260, 196, 70, 44, 0, 0, TAU); ironFill(cold ? '#2A3640' : '#4A3E35', ed);
  for (const k of [0, 1, 2]) { c.beginPath(); c.ellipse(260, 210 - k * 14, 64 - k * 8, 14, -0.12, 0, PI); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.45)'; c.stroke(); }
  c.beginPath(); c.arc(302, 168, 15, 0, TAU); ironFill('#4A3E35', ed);
  P([[176, 345], [208, 356], [162, 606], [130, 598]]);
  c.beginPath(); c.moveTo(150, 630); c.quadraticCurveTo(108, 800, 40, 935); c.lineTo(26, 928); c.quadraticCurveTo(90, 796, 134, 626); c.closePath(); c.fillStyle = cold ? '#4E6A7C' : '#6A625A'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#D9CFC2'; c.stroke();
  c.fillStyle = '#1A1512'; c.fillRect(112, 616, 64, 12); c.beginPath(); c.arc(146, 606, 20, 0, TAU); ironFill(body, ed);
  const sx = 350, sy = 560; const g = c.createRadialGradient(sx - 40, sy - 50, 10, sx, sy, 120); g.addColorStop(0, cold ? '#3A4A56' : '#56483E'); g.addColorStop(1, cold ? '#141B20' : '#211B17');
  c.beginPath(); c.arc(sx, sy, 118, 0, TAU); c.fillStyle = g; c.fill(); c.lineWidth = 12; c.strokeStyle = '#151210'; c.stroke(); c.lineWidth = 3; c.strokeStyle = ed; c.stroke();
  for (let k = 0; k < 10; k++) rivet(sx + cos(k / 10 * TAU) * 106, sy + sin(k / 10 * TAU) * 106, 6);
  rimLight(520, 1120, cold ? MOON : EMBER, 0.6, cold); }); }
const STRIPES = [-2, -1, 0, 1, 2].map((k) => Array.from({ length: 16 }, (_, i) => { const x = -88 + i * (176 / 15); return [x, k * 36 - 14 + Math.abs(x) * 0.28 + 7 * sin(x * 0.09 + k * 1.7)]; }));
function stripes(cx, cy, s, p, w = 10) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.beginPath(); ctx.arc(0, 0, 98, 0, TAU); ctx.clip();
  STRIPES.forEach((pts, j) => { const pj = seg(p, j * 0.12, j * 0.12 + 0.52); if (pj > 0) hotCut(pts, pj, w, 0.25); }); ctx.restore();
  if (p > 0) rivet(cx, cy, 16 * s); }
// Yusuf Khan: local 560x1120, feet (280,1100)
function yusufImg() { return cached('aYusuf', 560, 1120, 1, () => { const c = ctx, ed = 'rgba(255,170,110,0.6)', body = '#1B1612';
  const P = (pts, col = body) => { poly(pts); ironFill(col, ed); };
  P([[214, 950], [254, 950], [252, 1095], [210, 1095]], '#2C251F'); P([[302, 950], [342, 950], [348, 1095], [306, 1095]], '#2C251F');
  P([[205, 340], [180, 352], [150, 470], [204, 540], [218, 518], [182, 466], [212, 384]]);
  c.beginPath(); c.moveTo(200, 340); c.quadraticCurveTo(280, 305, 360, 340); c.lineTo(404, 965); c.lineTo(156, 965); c.closePath(); ironFill(body, ed);
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 3; c.beginPath(); c.moveTo(280, 345); c.lineTo(280, 960); c.stroke();
  c.fillStyle = '#5E2A12'; c.fillRect(196, 560, 168, 30); P([[350, 575], [372, 580], [430, 820], [414, 824]], '#1A1512');
  P([[346, 352], [374, 366], [505, 468], [492, 492], [340, 404]]); c.beginPath(); c.arc(506, 480, 18, 0, TAU); ironFill(body, ed);
  c.fillStyle = body; c.fillRect(262, 282, 36, 50);
  c.beginPath(); c.ellipse(280, 246, 48, 60, 0, 0, TAU); ironFill('#463B33', ed);
  c.beginPath(); c.moveTo(300, 168); c.quadraticCurveTo(318, 80, 380, 34); c.quadraticCurveTo(350, 96, 318, 172); c.closePath(); ironFill('#5A4C40', ed);
  for (let k = 0; k < 6; k++) { const u = k / 6; c.beginPath(); c.moveTo(lerp(306, 362, u), lerp(160, 52, u)); c.lineTo(lerp(326, 382, u), lerp(168, 68, u)); c.lineWidth = 2; c.strokeStyle = 'rgba(0,0,0,0.4)'; c.stroke(); }
  c.beginPath(); c.ellipse(280, 198, 82, 52, 0, 0, TAU); ironFill('#4A3E35', ed);
  for (const k of [0, 1, 2, 3]) { c.beginPath(); c.ellipse(280, 214 - k * 13, 76 - k * 9, 15, 0.1, 0, PI); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.45)'; c.stroke(); }
  c.beginPath(); c.arc(298, 172, 11, 0, TAU); c.fillStyle = '#FF9A3A'; c.fill();
  rimLight(560, 1120, EMBER, 0.6); }); }
// cannon: local 720x440, wheels on ground y 430; barrel pivot (330,270), muzzle at angle -0.12, length 350
const CAN_A = -0.12, MUZ = [330 + cos(CAN_A) * 355, 270 + sin(CAN_A) * 355];
function cannonImg() { return cached('aCannon', 720, 440, 1, () => { const c = ctx, ed = 'rgba(255,170,110,0.6)';
  poly([[150, 300], [520, 300], [560, 372], [120, 372]]); ironFill('#2C251F', ed);
  c.save(); c.translate(330, 270); c.rotate(CAN_A);
  c.beginPath(); c.moveTo(-240, -58); c.lineTo(350, -38); c.lineTo(350, 38); c.lineTo(-240, 58); c.closePath(); c.fillStyle = lg(0, -58, 0, 58, [[0, '#6A5D52'], [0.35, '#3E352D'], [1, '#15110E']]); c.fill(); c.lineWidth = 3; c.strokeStyle = ed; c.stroke();
  c.beginPath(); c.arc(-258, 0, 26, 0, TAU); ironFill('#3E352D', ed);
  for (const [x, h] of [[-170, 62], [0, 54], [300, 44], [350, 46]]) { c.fillStyle = '#2A231E'; c.fillRect(x - 9, -h, 18, h * 2); c.fillStyle = 'rgba(255,190,140,0.4)'; c.fillRect(x - 9, -h, 18, 3); }
  c.restore();
  for (const wx of [200, 470]) { c.beginPath(); c.arc(wx, 360, 70, 0, TAU); c.lineWidth = 16; c.strokeStyle = '#1C1714'; c.stroke(); c.lineWidth = 3; c.strokeStyle = ed; c.stroke();
    for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(wx, 360); c.lineTo(wx + cos(k * PI / 4) * 64, 360 + sin(k * PI / 4) * 64); c.lineWidth = 7; c.strokeStyle = '#2C251F'; c.stroke(); } rivet(wx, 360, 12); } }); }
// palm (stop hand): local 440x640, wrist bottom-left
function handImg() { return cached('aHand', 440, 640, 1, () => { const c = ctx, ed = 'rgba(255,170,110,0.6)';
  poly([[0, 640], [130, 640], [250, 430], [160, 380]]); ironFill('#2C251F', ed);
  for (const [x, h] of [[166, 150], [212, 176], [258, 168], [304, 134]]) { rr(x, 270 - h, 42, h + 40, 21); ironFill('#3A3029', ed); }
  c.save(); c.translate(170, 400); c.rotate(-0.9); rr(-22, -130, 44, 140, 22); ironFill('#3A3029', ed); c.restore();
  rr(150, 240, 200, 210, 46); ironFill('#3E342C', ed);
  rimLight(440, 640, EMBER, 0.45); }); }
// tribute tray: local 520x260, centre (260,180)
function trayImg() { return cached('aTray', 520, 260, 1, () => { const c = ctx;
  c.beginPath(); c.ellipse(260, 190, 240, 56, 0, 0, TAU); c.fillStyle = '#2E2620'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#151210'; c.stroke(); c.lineWidth = 3; c.strokeStyle = 'rgba(255,175,120,0.5)'; c.stroke();
  c.beginPath(); c.ellipse(260, 184, 200, 40, 0, 0, TAU); c.fillStyle = '#1C1714'; c.fill();
  const coins = []; for (let i = 0; i < 26; i++) { const a = rnd(i + 3) * TAU, d = Math.sqrt(rnd(i + 7)); coins.push([260 + cos(a) * d * 160, 178 + sin(a) * d * 28 - (1 - d) * 50 - rnd(i) * 14]); }
  coins.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => coinDraw(x, y, 1, 1)); }); }
function coinDraw(x, y, s = 1, tilt = 1) { const c = ctx; c.beginPath(); c.ellipse(x, y + 5 * s, 34 * s * Math.abs(tilt) + 2, 12 * s, 0, 0, TAU); c.fillStyle = '#5E3E18'; c.fill();
  c.beginPath(); c.ellipse(x, y, 34 * s * Math.abs(tilt) + 2, 12 * s, 0, 0, TAU); c.fillStyle = '#8C6A2E'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#FFB25A'; c.stroke(); }
// small figures
function soldierImg() { return cached('aSoldier', 100, 250, 1, () => { const c = ctx, ed = 'rgba(255,175,120,0.35)';
  poly([[34, 160], [48, 160], [46, 245], [32, 245]]); ironFill('#1E1915', ed); poly([[52, 160], [66, 160], [70, 245], [56, 245]]); ironFill('#1E1915', ed);
  poly([[28, 62], [72, 62], [78, 170], [22, 170]]); ironFill('#7A2A20', ed);
  c.beginPath(); c.ellipse(50, 42, 16, 20, 0, 0, TAU); ironFill('#2B2520', ed);
  poly([[22, 26], [50, 8], [78, 26], [50, 20]]); ironFill('#1A1512', ed);
  c.fillStyle = '#1A1512'; c.fillRect(72, 2, 5, 130); c.fillStyle = '#8C8378'; c.fillRect(73, -8 + 8, 3, 18); }); }
function runnerImg(k) { return cached('aRun' + k, 260, 440, 1, () => { const c = ctx, ed = 'rgba(143,179,201,0.8)', b = '#11171C';
  const P = (pts) => { poly(pts); ironFill(b, ed); };
  if (k) { P([[118, 250], [140, 250], [80, 420], [58, 414]]); P([[132, 250], [152, 246], [210, 400], [190, 410]]); }
  else { P([[118, 250], [140, 250], [130, 425], [108, 425]]); P([[132, 250], [154, 250], [178, 340], [120, 410], [106, 400], [150, 340]]); }
  c.beginPath(); c.moveTo(108, 120); c.lineTo(168, 110); c.lineTo(160, 260); c.lineTo(110, 262); c.closePath(); ironFill(b, ed);
  P(k ? [[160, 120], [176, 128], [214, 200], [200, 210]] : [[110, 124], [124, 132], [80, 206], [68, 196]]);
  c.beginPath(); c.ellipse(150, 82, 26, 32, 0.2, 0, TAU); ironFill('#18212A', ed); c.beginPath(); c.ellipse(152, 58, 36, 22, 0.2, 0, TAU); ironFill('#1A232B', ed);
  c.beginPath(); c.moveTo(196, 272); c.quadraticCurveTo(230, 210, 240, 160); c.lineTo(234, 158); c.quadraticCurveTo(222, 206, 190, 268); c.fillStyle = '#4E6A7C'; c.fill(); }); }
function gallowsImg() { return cached('aGallows', W, 1300, 1, () => { const c = ctx, ed = 'rgba(255,170,110,0.35)';
  c.beginPath(); c.rect(250, 190, 44, 1080); ironFill('#120E0B', ed); c.beginPath(); c.rect(224, 190, 480, 44); ironFill('#120E0B', ed);
  poly([[294, 380], [294, 412], [450, 234], [418, 234]]); ironFill('#120E0B', ed); c.beginPath(); c.rect(170, 1230, 210, 40); ironFill('#120E0B', ed);
  for (let x = 250; x < 700; x += 60) rivet(x, 212, 6); for (let y = 270; y < 1220; y += 90) rivet(272, y, 6);
  c.fillStyle = '#120E0B'; c.fillRect(0, 1250, W, 60); c.fillStyle = 'rgba(255,170,110,0.3)'; c.fillRect(0, 1250, W, 3); }); }
// turban: local 320x240, centre (160,150)
function turbanDraw(c, x, y, s) { const ed = 'rgba(255,170,110,0.6)'; c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.moveTo(16, -22); c.quadraticCurveTo(34, -110, 96, -150); c.quadraticCurveTo(66, -88, 34, -18); c.closePath(); ironFill('#5A4C40', ed);
  c.beginPath(); c.ellipse(0, 0, 90, 56, 0, 0, TAU); ironFill('#4A3E35', ed);
  for (const k of [0, 1, 2, 3]) { c.beginPath(); c.ellipse(0, 18 - k * 14, 84 - k * 9, 16, 0.1, 0, PI); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.5)'; c.stroke(); }
  c.beginPath(); c.arc(18, -24, 11, 0, TAU); c.fillStyle = '#FF9A3A'; c.fill(); c.restore(); }
const turbanImg = () => cached('aTurban', 320, 240, 1, () => turbanDraw(ctx, 160, 150, 1));
function rustSkyImg() { return cached('aRustSky', W, H, 1, () => { const c = ctx; c.drawImage(plateImg(), 0, 0);
  c.fillStyle = lg(0, 0, 0, 1260, [[0, 'rgba(94,42,18,0.85)'], [0.6, 'rgba(138,59,23,0.7)'], [1, 'rgba(181,84,31,0.55)']]); c.fillRect(0, 0, W, 1260);
  const g = c.createRadialGradient(700, 1150, 20, 700, 1150, 700); g.addColorStop(0, 'rgba(255,140,60,0.45)'); g.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = g; c.fillRect(0, 400, W, 900);
  for (let i = 0; i < 600; i++) { c.fillStyle = `rgba(${rnd(i) > 0.5 ? '200,100,50' : '30,12,6'},${0.08 + rnd(i + 1) * 0.15})`; c.fillRect(rnd(i + 7) * W, rnd(i + 8) * 1260, 2 + rnd(i + 2) * 5, 2 + rnd(i + 4) * 4); } }); }
function flag(x, y, w, h, t, cols, dir = 1, poleH = 820) {
  const c = ctx; c.fillStyle = '#1C1714'; c.fillRect(x - 7, y - 12, 14, poleH); c.fillStyle = 'rgba(255,190,140,0.4)'; c.fillRect(x - 7, y - 12, 3, poleH); rivet(x, y - 18, 11);
  const N = 14, top = [], bot = []; for (let i = 0; i <= N; i++) { const u = i / N, px = x + dir * u * w, wy = sin(u * 5 - t * 6) * h * 0.09 * u; top.push([px, y + wy]); bot.push([px, y + h + wy + u * 8]); }
  const band = (a, b) => { const pts = []; for (let i = 0; i <= N; i++) pts.push([top[i][0], lerp(top[i][1], bot[i][1], a)]); for (let i = N; i >= 0; i--) pts.push([top[i][0], lerp(top[i][1], bot[i][1], b)]); return pts; };
  cols.forEach((col, k) => fillP(band(k / cols.length, (k + 1) / cols.length), col));
  for (let i = 0; i < N; i += 2) { const sh = sin((i / N) * 5 - t * 6); if (sh < 0) continue; fillP([top[i], top[i + 1], bot[i + 1], bot[i]], `rgba(255,200,150,${sh * 0.08})`); }
  poly([...top, ...bot.slice().reverse()]); c.lineWidth = 3; c.strokeStyle = 'rgba(255,150,80,0.6)'; c.stroke();
  return { top, bot };
}

// ═════════════════════════ SHOTS ═════════════════════════
export function buildA(add, cue) {
  const T1 = Wd('rebel', 0) + 0.15, T2 = Wd('temple', 0) - 0.04, T3 = L(1) - 0.05, T4 = Wd('puli', 1) - 0.45, T5 = Wd('nerkattumseval', 1) - 0.1,
    T6 = Wd('refused', 1) - 0.1, T7 = Wd('nawab', 1) - 0.35, T8 = L(2) - 0.08, T9 = Wd('cannon', 2) + 0.3, T10 = Wd('seventeen', 2) - 0.3,
    T11 = Wd('fell', 2) - 0.25, T12 = L(3) - 0.06, T13 = Wd('when', 3) - 0.08, T14 = Wd('came', 3) - 0.1;

  // a0 · HOOK: chain whips toward camera over the moonlit temple and SNAPS
  cue(0, 'slam', { gain: 1 }); cue(0, 'whoosh', { gain: 0.85 }); cue(0.04, 'sizzle', { gain: 0.55 }); cue(0.28, 'thud', { gain: 0.75 }); cue(0.5, 'chisel', { gain: 0.35, pan: -0.4 }); cue(0.75, 'chisel', { gain: 0.3, pan: 0.4 });
  add({ id: 'a0', at: 0, cam: [540, 700], zoom: 0.07, note: 'HOOK: ember chain whips + SNAPS over moonlit iron temple, spark burst, ember flash, VANISHED?',
    draw(lt) {
      blit(nightImg(), 0, 0, 0, 0, 1); coldStars(lt, 50, 700); moon(800, 300 + lt * 10, 0.8);
      blit(templeImg(), 450, 1300, 540, 1275 - lt * 20, 0.9);
      glowS(540, 1275 - 117 - lt * 20, 120, EMBER, 0.35 + 0.1 * sin(lt * 20));
      // chain
      const S = 1 + 0.2 * eo(clamp(lt / 1.25)), [sx, sy] = shake(lt, 0, 18);
      ctx.save(); ctx.translate(540 + sx, 460 + sy); ctx.scale(S, S); ctx.rotate(-0.05 * lt); ctx.translate(-540, -460);
      const half = (dir, ph) => chainFrom(dir > 0 ? 120 : 960, 380, 6, 76, (i) => { const tau = lt - 0.04 - (5 - i) * 0.04;
        let a = tau <= 0 ? 0.1 : 1.0 - 0.9 * cos(tau * (4.6 + ph)) * Math.exp(-tau * 1.3); a += 0.2 * sin(i * 0.8 - lt * 13 + ph * 3) * Math.exp(-lt * 1.6);
        return dir > 0 ? a : PI - a; });
      const heat = 1 - 0.3 * clamp(lt / 1.2);
      drawChain(half(1, 0), 0.7, heat); drawChain(half(-1, 0.4), 0.7, heat); for (const ax of [120, 960]) { rivet(ax, 380, 22); glowS(ax, 380, 60, EMBER, 0.3); }
      // broken link halves fly toward camera
      for (const d of [-1, 1]) { const k = eo(clamp(lt / 1.1)), hs = lerp(0.8, 2.6, k);
        halfLink(540 + d * (14 + 520 * k), 460 + 420 * k * k + d * -60 * k, (d < 0 ? 0 : PI) + d * lt * 5, hs, 1); }
      // flash + sparks
      const f = clamp(1 - lt / 0.4); glowS(540, 460, 520 * (0.6 + 0.4 * f), '255,150,60', 0.75 * f); glowS(540, 460, 150, WHITE, f);
      sparks(540, 460, lt + 0.06, 46, 3, 950); sparks(540, 460, lt - 0.08, 30, 17, 700); sparks(540, 460, lt - 0.3, 16, 41, 500);
      ctx.restore();
      if (f > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,122,26,${0.08 * f})`; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); }
      tag('VANISHED?', 540, 1080, 110, lt, 0.26);
      calm(true);
    } });

  // a1 · temple doorway push: the chain hanging inside burns away into embers on "vanish"
  const tv = Wd('vanish', 0) - T1;
  cue(T1, 'whoosh', { gain: 0.55 }); cue(Wd('vanish', 0), 'slam', { gain: 0.75 }); cue(Wd('vanish', 0) + 0.1, 'sizzle', { gain: 0.55 });
  add({ id: 'a1', at: T1, cam: [540, 1000], zoom: 0.12, note: 'temple doorway push-in, chain inside dissolves to rising embers, VANISHED? re-slam, ILLUSTRATION',
    draw(lt) {
      blit(nightImg(), 0, 0, 0, 0, 1); coldStars(lt + 2, 30, 500); moon(880, 220, 0.7);
      const ty = 1300 + lt * 30; blit(templeImg(), 450, 1300, 540, ty, 1.5);
      const dy = ty - 130 * 1.5; glowS(540, dy, 220, EMBER, 0.3 + 0.08 * sin(lt * 17));
      // chain hanging in the doorway, dissolving bottom-up
      const pts = chainFrom(540, ty - 250 * 1.5, 6, 62, (i) => PI / 2 + 0.06 * sin(lt * 3 + i * 0.5));
      for (let i = 0; i < pts.length - 1; i++) { const di = seg(lt, tv + (5 - i) * 0.08, tv + (5 - i) * 0.08 + 0.25), [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        if (di < 1) { ctx.save(); ctx.globalAlpha = 1 - di; glowS((x0 + x1) / 2, (y0 + y1) / 2, 70, EMBER, 0.4 + di); link((x0 + x1) / 2, (y0 + y1) / 2, Math.atan2(y1 - y0, x1 - x0), 0.56, i % 2 === 0, 1 + di); ctx.restore(); }
        const et = lt - tv - (5 - i) * 0.08; if (et > 0) for (let k = 0; k < 9; k++) { const ex = (x0 + x1) / 2 + (rnd(i * 9 + k) - 0.5) * 60 + sin(et * 3 + k) * 20 * et, ey = (y0 + y1) / 2 - et * (120 + rnd(k + i) * 200), a = clamp(1 - et / 0.9);
          if (a > 0) { ctx.fillStyle = `rgba(255,${150 + rnd(k) * 80 | 0},60,${a})`; ctx.fillRect(ex, ey, 4, 4); } } }
      K.embers(lt, 14, 3, HOT);
      tag('ILLUSTRATION', 870, 170, 24, lt, -1, { quiet: true, a: 0.85 });
      tag('VANISHED?', 540, 560, 104, lt, tv);
      calm(true);
    } });

  // a2 · inside: broken shackles glowing on the stone floor, lamp niche, moonbeam
  cue(T2, 'slide', { gain: 0.4 }); cue(T2 + 0.15, 'tock', { gain: 0.5 }); cue(T2 + 0.35, 'bell', { gain: 0.3 });
  add({ id: 'a2', at: T2, cam: [540, 950], zoom: 0.1, note: 'temple interior: moonbeam on stone floor, broken shackles glowing, lamp niche flicker',
    draw(lt) {
      plate(); const px = -lt * 30; blit(insideImg(), 0, 0, px * 0.4, 0, 1);
      // lamp in niche
      const fl = 0.8 + 0.2 * sin(lt * 23) * sin(lt * 7); glowS(720 + px * 0.4, 600, 200, HOT, 0.45 * fl);
      ctx.beginPath(); ctx.ellipse(720 + px * 0.4, 612 - 10 * fl, 9, 22 * fl, 0, 0, TAU); ctx.fillStyle = '#FFD08A'; ctx.fill();
      // moonbeam
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; fillP([[160, 0], [420, 0], [880, 1280], [300, 1280]], 'rgba(143,179,201,0.10)'); fillP([[220, 0], [360, 0], [760, 1280], [420, 1280]], 'rgba(143,179,201,0.07)'); ctx.restore();
      for (let i = 0; i < 26; i++) { const u = (rnd(i) + lt * 0.05 * (0.5 + rnd(i + 1))) % 1, bx = lerp(220, 640, u) + rnd(i + 3) * 160, by = u * 1250; ctx.fillStyle = `rgba(200,220,235,${0.3 + 0.3 * sin(lt * 3 + i)})`; ctx.fillRect(bx, by, 3, 3); }
      // shackles on the floor (perspective squash)
      ctx.save(); ctx.translate(540 + px, 1100); ctx.scale(1, 0.55);
      const pulse = 0.75 + 0.25 * sin(lt * 6);
      for (const [cx, ang] of [[-230, 0.3], [250, -0.2]]) { glowS(cx, 0, 200, EMBER, 0.35 * pulse); ctx.save(); ctx.translate(cx, 0); ctx.rotate(ang);
        ctx.beginPath(); ctx.arc(0, 0, 80, 0.5, TAU - 0.2); linkStroke(true, pulse); ctx.beginPath(); ctx.arc(0, 0, 80, TAU - 0.05, TAU + 0.35); ctx.save(); ctx.translate(40, -30); ctx.rotate(-0.6 * eo(clamp(lt / 0.4))); ctx.translate(-40, 30); linkStroke(true, pulse); ctx.restore(); ctx.restore(); }
      drawChain(chainFrom(-150, 0, 2, 70, (i) => 0.1 * i), 0.6, pulse, 0.2); drawChain(chainFrom(170, 10, 2, 70, (i) => PI + 0.2 + 0.1 * i), 0.6, pulse, 0.2);
      halfLink(0, -6, 0.2, 0.62, pulse); halfLink(30, 8, PI - 0.3, 0.62, pulse);
      ctx.restore();
      sparks(560 + px, 1100, lt - 0.12, 18, 61, 420);
      calm(true);
    } });

  // a3 · 1750s cut by a torch out of a riveted plate
  const t3c = 0.12, t3e = Wd('fifties', 1) - T3 + 0.35;
  cue(T3, 'whoosh', { gain: 0.5 }); cue(Wd('seventeen', 1), 'sizzle', { gain: 0.7 }); cue(Wd('fifties', 1) + 0.35, 'thud', { gain: 0.7 });
  add({ id: 'a3', at: T3, cam: [540, 680], zoom: 0.08, note: '1750s torch-cut out of a riveted plate, border hot-cut, sparks, parallax iron straps',
    draw(lt) {
      plate();
      for (const [y, v, h] of [[300, -60, 60], [1010, 50, 70], [1150, -30, 40]]) { const ox = (lt * v) % 125; ctx.fillStyle = '#2E2721'; ctx.fillRect(-200, y, W + 400, h); ctx.fillStyle = 'rgba(220,200,180,0.25)'; ctx.fillRect(-200, y, W + 400, 2); for (let x = -125 + ox; x < W + 125; x += 125) rivet(x, y + h / 2, 8); }
      glowS(540, 660, 600, EMBER, 0.25);
      const fr = [...lp(140, 440, 940, 440, 30), ...lp(940, 440, 940, 900, 18).slice(1), ...lp(940, 900, 140, 900, 30).slice(1), ...lp(140, 900, 140, 440, 18).slice(1)];
      hotCut(fr, eio(seg(lt, 0, 0.9)), 6, 0.5);
      torchTag('1750s', 540, 670, 190, eio(seg(lt, t3c, t3e)), lt);
      const [sx] = shake(lt, t3e, 8); if (sx) sparks(540, 820, lt - t3e, 30, 91, 650);
      calm();
    } });

  // a4 · PULI THEVAR rises as an iron cut-out, tiger stripes hot-cut across his shield
  const t4p = Wd('puli', 1) - T4;
  cue(T4, 'whoosh', { gain: 0.6 }); cue(T4 + 0.1, 'slide', { gain: 0.45 }); cue(Wd('puli', 1), 'slam', { gain: 0.7 }); cue(Wd('puli', 1) + 0.15, 'sizzle', { gain: 0.5 });
  add({ id: 'a4', at: T4, cam: [540, 700], zoom: 0.1, note: 'PULI THEVAR faceless iron cut-out rises, tiger stripes hot-cut on his shield, ILLUSTRATION',
    draw(lt) {
      plate(); glowS(560, 700, 640, EMBER, 0.3 + 0.05 * sin(lt * 9));
      blit(fortImg(), 540, 900, 540 - lt * 30, 1180, 0.8, 0.28);
      const k = eob(clamp(lt / 0.45)), fy = lerp(1600, 1265, k), fs = 1.02;
      blit(puliImg(), 260, 1100, 520 + lt * 14, fy, fs);
      const scx = 520 + lt * 14 + (350 - 260) * fs, scy = fy + (560 - 1100) * fs;
      stripes(scx, scy, fs, seg(lt, 0.25, 1.05));
      K.embers(lt, 18, 7, HOT);
      tag('PULI THEVAR', 540, 190, 78, lt, t4p);
      tag('ILLUSTRATION', 880, 330, 24, lt, -1, { quiet: true, a: 0.85 });
      calm();
    } });

  // a5 · rivet map: NERKATTUMSEVAL heats up in the south
  const t5n = Wd('nerkattumseval', 1) - T5;
  cue(T5, 'slide', { gain: 0.5 }); cue(Wd('nerkattumseval', 1), 'pop', { gain: 0.7 }); cue(Wd('nerkattumseval', 1) + 0.05, 'sizzle', { gain: 0.4 });
  add({ id: 'a5', at: T5, cam: [NERK[0], NERK[1]], zoom: 0.18, note: 'rivet map of the south, NERKATTUMSEVAL rivet glows white-hot with ring pulses, MADURAI small',
    draw(lt) {
      plate(); const my = -lt * 25; blit(mapImg(), 0, 0, 0, my, 1);
      hotRivet(MADU[0], MADU[1] + my, 11, 0.4, lt);
      const h = seg(lt, t5n - 0.1, t5n + 0.25); hotRivet(NERK[0], NERK[1] + my, 15, 0.3 + 0.7 * h, lt);
      if (h > 0) { const ring = Array.from({ length: 41 }, (_, i) => [NERK[0] + cos(i / 40 * TAU - PI / 2) * 60, NERK[1] + my + sin(i / 40 * TAU - PI / 2) * 60]); hotCut(ring, eo(h), 5, 0.3); }
      tag('MADURAI', MADU[0], MADU[1] + my - 60, 30, lt, 0.05, { quiet: true, a: 0.85 });
      tag('NERKATTUMSEVAL', 540, NERK[1] + my - 150, 56, lt, t5n);
      sparks(NERK[0], NERK[1] + my, lt - t5n, 24, 77, 520);
      calm();
    } });

  // a6 · NO TRIBUTE: tray of coins slides in, an iron palm shoves it back, coins fly
  const tp = Wd('tribute', 1) - T6 - 0.25;
  cue(T6, 'slide', { gain: 0.55 }); cue(Wd('tribute', 1) - 0.2, 'slam', { gain: 0.8 }); cue(Wd('tribute', 1) - 0.12, 'tock', { gain: 0.5, pan: 0.3 }); cue(Wd('tribute', 1), 'tock', { gain: 0.45, pan: 0.5 }); cue(Wd('tribute', 1) + 0.15, 'thud', { gain: 0.6 });
  add({ id: 'a6', at: T6, cam: [560, 800], zoom: 0.08, note: 'NO TRIBUTE: coin tray slides in from right, iron palm shoves it back, coins fly, sparks',
    draw(lt) {
      plate(); glowS(540, 800, 600, EMBER, 0.22); blit(fortImg(), 540, 900, 600 + lt * 20, 1200, 0.7, 0.22);
      const [sx, sy] = shake(lt, tp + 0.06, 16); ctx.save(); ctx.translate(sx, sy);
      const tx = lerp(1350, 720, eo(seg(lt, 0, 0.5))) + 760 * eo(seg(lt, tp + 0.06, tp + 0.9)), tr = 0.08 * eo(seg(lt, tp + 0.06, tp + 0.4));
      ctx.save(); ctx.translate(tx, 880); ctx.rotate(tr); blit(trayImg(), 260, 180, 0, 0, 1); ctx.restore();
      glowS(tx, 860, 260, HOT, 0.2);
      const ct = lt - tp - 0.08; if (ct > 0) for (let i = 0; i < 9; i++) { const vx = 250 + rnd(i + 1) * 600, vy = -700 - rnd(i + 2) * 600, x = 560 + rnd(i) * 160 + vx * ct, y = 840 + vy * ct + 1500 * ct * ct;
        if (y < 1300) coinDraw(x, y, 0.9, cos(ct * (10 + i * 2))); }
      const hx = lerp(-460, -40, eo(seg(lt, 0.1, 0.55))) + 220 * eo(seg(lt, tp, tp + 0.2)); blit(handImg(), 0, 640, hx, 1180, 1.12);
      sparks(480, 860, lt - tp - 0.06, 30, 13, 700);
      ctx.restore();
      tag('NO TRIBUTE', 540, 320, 100, lt, tp + 0.06);
      calm();
    } });

  // a7 · NAWAB (left) and BRITISH (right) flags around the tiger shield
  const tn = Wd('nawab', 1) - T7, tb = Wd('british', 1) - T7;
  cue(T7, 'whoosh', { gain: 0.5 }); cue(Wd('nawab', 1), 'pop', { gain: 0.7, pan: -0.5 }); cue(Wd('british', 1), 'pop', { gain: 0.7, pan: 0.5 }); cue(Wd('british', 1) + 0.1, 'drum', { gain: 0.6 });
  cue(T8 - 0.35, 'rumble', { gain: 0.4 });
  add({ id: 'a7', at: T7, cam: [540, 760], zoom: 0.1, note: 'NAWAB flag + spears left, BRITISH flag + red-coat musket row right, tiger shield centre; rust bloom out',
    draw(lt, d) {
      plate(); glowS(540, 760, 520, EMBER, 0.22);
      const fl = eo(seg(lt, tn - 0.25, tn + 0.15)), fr = eo(seg(lt, tb - 0.25, tb + 0.15));
      if (fl > 0) { ctx.save(); ctx.translate(lerp(-420, 0, fl), 0); flag(120, 470, 320, 210, lt, ['#3B4A30', '#2E3A25', '#3B4A30']);
        for (let i = 0; i < 7; i++) { const x = 40 + i * 52, y = 1250 - (i % 2) * 20; ctx.fillStyle = '#15110E'; ctx.fillRect(x, y - 300, 6, 300); fillP([[x - 8, y - 300], [x + 3, y - 336], [x + 14, y - 300]], '#6A625A'); } ctx.restore(); }
      if (fr > 0) { ctx.save(); ctx.translate(lerp(420, 0, fr), 0); flag(960, 470, 320, 210, lt + 0.5, ['#7A2A20', '#5E5650', '#7A2A20', '#5E5650', '#7A2A20'], -1);
        for (let i = 0; i < 6; i++) blit(soldierImg(), 50, 245, 740 + i * 62 - lt * 24, 1255 - (i % 2) * 14, 1.1); ctx.restore(); }
      const sr = sin(lt * 1.5) * 0.06; ctx.save(); ctx.translate(540, 820); ctx.rotate(sr); ctx.translate(-540, -820);
      glowS(540, 820, 300, EMBER, 0.3); blit(puliImg(), 350, 560, 540, 820, 1.25, 1, 1.25); stripes(540, 820, 1.25, 1, 9);
      ctx.restore();
      tag('NAWAB', 270, 330, 64, lt, tn); tag('BRITISH', 800, 330, 64, lt, tb);
      rust(980, 300, eio(seg(lt, d - 0.35, d)));
      calm();
    } });

  // a8 · ACCOUNTS SAY · YUSUF KHAN beside his cannon, which fires
  const ta = Wd('accounts', 2) - T8, ty8 = Wd('yusuf', 2) - T8, tc = Wd('cannon', 2) - T8;
  cue(T8, 'rumble', { gain: 0.5 }); cue(Wd('accounts', 2), 'tock', { gain: 0.6 }); cue(Wd('yusuf', 2), 'pop', { gain: 0.6 }); cue(Wd('cannon', 2), 'slam', { gain: 0.95 }); cue(Wd('cannon', 2) + 0.05, 'rumble', { gain: 0.7 });
  add({ id: 'a8', at: T8, cam: [600, 800], zoom: 0.09, note: 'rust recedes: ACCOUNTS SAY tag, YUSUF KHAN plumed silhouette beside cannon, cannon fires (flash, smoke, ball)',
    draw(lt) {
      plate(); glowS(540, 900, 600, EMBER, 0.2);
      blit(fortImg(), 540, 900, 900 + lt * 20, 1150, 0.55, 0.25);
      const [sx, sy] = shake(lt, tc, 18); ctx.save(); ctx.translate(sx, sy);
      blit(yusufImg(), 280, 1100, 280 + lt * 10, 1268, 0.92);
      const rec = tc < lt ? -50 * Math.exp(-(lt - tc) * 6) * Math.min(1, (lt - tc) * 30) : 0, cx = 560 + rec, cs = 0.78;
      blit(cannonImg(), 120, 430, cx, 1262, cs);
      const mx = cx + (MUZ[0] - 120) * cs, my = 1262 + (MUZ[1] - 430) * cs, ft = lt - tc;
      if (ft > 0) { const f = clamp(1 - ft / 0.35); glowS(mx + 30, my, 420 * (0.5 + f), '255,150,60', f * 1.2); glowS(mx + 20, my, 150, WHITE, f * 1.4);
        sparks(mx + 10, my, ft, 34, 29, 900);
        for (let i = 0; i < 6; i++) { const pt = ft - i * 0.03; if (pt <= 0) continue; const px = mx + 40 + pt * (300 + i * 60), py = my - pt * (60 + i * 30) - i * 10, r = 30 + pt * 160, a = clamp(0.5 - pt * 0.4);
          ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fillStyle = `rgba(70,60,52,${a})`; ctx.fill(); }
        const bx = mx + ft * 2600, by = my - ft * 380; if (bx < 1300) { glowS(bx, by, 60, EMBER, 0.9); ctx.beginPath(); ctx.arc(bx, by, 16, 0, TAU); ctx.fillStyle = '#1A1512'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#FFB25A'; ctx.stroke(); } }
      ctx.restore();
      tag('ACCOUNTS SAY', 540, 190, 54, lt, ta);
      tag('YUSUF KHAN', 330, 360, 66, lt, ty8);
      tag('CANNON', 800, 820, 46, lt, tc + 0.05);
      rust(980, 300, 1 - eo(seg(lt, 0, 0.5)));
      calm();
    } });

  // a9 · cannonball arcs slam into the fort wall, cracks hot-cut, tally of weeks
  const imp = [0.3, 0.72, 1.12, 1.5], tw9 = Wd('weeks', 2) - T9;
  imp.forEach((ti, k) => { cue(T9 + ti - 0.35, 'whoosh', { gain: 0.35, pan: -0.5 }); cue(T9 + ti, 'thud', { gain: 0.85 - k * 0.05 }); cue(T9 + ti + 0.05, 'chisel', { gain: 0.45, pan: 0.4 }); });
  cue(Wd('weeks', 2), 'tock', { gain: 0.4 });
  add({ id: 'a9', at: T9, cam: [700, 800], zoom: 0.1, note: 'cannonballs on ember arcs slam the cut-iron fort wall, cracks hot-cut, tally scratches for weeks, ACCOUNTS SAY',
    draw(lt) {
      plate(); glowS(300, 400, 500, EMBER, 0.15);
      let sx = 0, sy = 0; imp.forEach((ti) => { const [a, b] = shake(lt, ti, 12); sx += a; sy += b; });
      ctx.save(); ctx.translate(sx, sy);
      const OX = 120; fort(OX);
      cracks(OX, [0, 1, 2, 3], imp.map((ti) => eo(seg(lt, ti, ti + 0.4))));
      imp.forEach((ti, k) => { const [ix, iy] = IMPACTS[k], wx = ix + OX, wy = iy + FORT_OY, u = seg(lt, ti - 0.4, ti);
        if (u > 0 && u < 1) { const p = (uu) => [lerp(-80, wx, uu), lerp(560 - k * 40, wy, uu) - 4 * 260 * uu * (1 - uu)];
          for (let j = 10; j >= 0; j--) { const uu = Math.max(0, u - j * 0.025), [px, py] = p(uu); ctx.beginPath(); ctx.arc(px, py, 14 * (1 - j / 12), 0, TAU); ctx.fillStyle = `rgba(255,${120 + j * 8},40,${0.7 * (1 - j / 11)})`; ctx.fill(); }
          const [bx, by] = p(u); glowS(bx, by, 80, EMBER, 0.8); ctx.beginPath(); ctx.arc(bx, by, 18, 0, TAU); ctx.fillStyle = '#1A1512'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#FFB25A'; ctx.stroke(); }
        const it = lt - ti; if (it > 0) { glowS(wx, wy, 260, '255,150,60', clamp(1 - it / 0.3)); sparks(wx, wy, it, 30, 50 + k * 9, 760); } });
      ctx.restore();
      // tally of weeks (scratched with the torch)
      for (let i = 0; i < 12; i++) { const p = seg(lt, tw9 - 0.3 + i * 0.05, tw9 - 0.2 + i * 0.05); if (p <= 0) continue; const gx = 110 + Math.floor(i / 5) * 150 + (i % 5) * 26;
        hotCut(i % 5 === 4 ? lp(gx - 108, 430, gx + 4, 520, 10) : lp(gx, 420, gx, 530, 10), p, 6, 0.4); }
      tag('ACCOUNTS SAY', 540, 190, 54, lt);
      calm();
    } });

  // a10 · 1761 torch-cut over the battered fort
  const t10a = Wd('seventeen', 2) - T10, t10b = Wd('one', 2) - T10 + 0.12;
  cue(Wd('seventeen', 2), 'sizzle', { gain: 0.65 }); cue(Wd('one', 2) + 0.12, 'slam', { gain: 0.8 }); cue(T10, 'whoosh', { gain: 0.4 });
  add({ id: 'a10', at: T10, cam: [540, 700], zoom: 0.1, note: '1761 cut by torch over the cracked fort, smoke rising, ACCOUNTS SAY',
    draw(lt) {
      plate(); glowS(540, 700, 640, EMBER, 0.2);
      ctx.save(); ctx.globalAlpha = 0.6; fort(-lt * 20); ctx.restore(); cracks(-lt * 20, [0, 1, 2, 3], [1, 1, 1, 1]);
      for (const [x, s] of [[760, 0], [880, 1.7]]) for (let i = 0; i < 5; i++) { const ph = (lt * 0.3 + i / 5 + s) % 1, r = 50 + ph * 150; ctx.beginPath(); ctx.arc(x - lt * 20 + sin(ph * 4 + i) * 40, 820 - ph * 600, r, 0, TAU); ctx.fillStyle = `rgba(40,34,30,${0.35 * (1 - ph)})`; ctx.fill(); }
      torchTag('1761', 540, 640, 230, eio(seg(lt, t10a, t10b)), lt);
      const [s0] = shake(lt, t10b, 10); if (s0) sparks(540, 780, lt - t10b, 30, 23, 650);
      tag('ACCOUNTS SAY', 540, 190, 54, lt);
      calm();
    } });

  // a11 · FORT FALLS: the cracked section drops out in pieces
  const tf = Wd('fell', 2) - T11 + 0.05;
  cue(Wd('fell', 2) + 0.05, 'slam', { gain: 0.95 }); cue(Wd('fell', 2) + 0.15, 'rumble', { gain: 0.8 }); cue(Wd('fell', 2) + 0.45, 'thud', { gain: 0.6 });
  add({ id: 'a11', at: T11, cam: [780, 820], zoom: 0.07, note: 'FORT FALLS: cracked wall section breaks into iron pieces that drop, dust + sparks, ACCOUNTS SAY',
    draw(lt) {
      plate(); glowS(780, 700, 500, EMBER, 0.2 + 0.3 * clamp(1 - Math.abs(lt - tf) * 3));
      const [sx, sy] = shake(lt, tf, 22); ctx.save(); ctx.translate(sx, sy);
      const OX = 120, ft = lt - tf; fort(OX, false, 'whole', ft);
      if (ft < 0.05) cracks(OX, [0, 1, 2, 3], [1, 1, 1, 1]);
      if (ft > 0) { for (let i = 0; i < 10; i++) { const ph = clamp(ft * 0.8 + rnd(i) * 0.2), x = 780 + OX + (rnd(i + 1) - 0.5) * 380 + (rnd(i + 3) - 0.5) * 300 * ph, y = 1240 - ph * 300 * rnd(i + 2), r = 40 + ph * 160;
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = `rgba(60,50,44,${0.45 * (1 - ph)})`; ctx.fill(); }
        sparks(780 + OX - 60, 700, ft, 34, 5, 800); sparks(780 + OX + 40, 1000, ft - 0.2, 24, 15, 600); }
      ctx.restore();
      tag('FORT FALLS', 540, 330, 96, lt, tf);
      tag('ACCOUNTS SAY', 540, 190, 54, lt);
      calm();
    } });

  // a12 · ESCAPED: night, a figure slips out through the gap and runs
  const te = Wd('slipped', 3) - T12, d12 = T13 - T12;
  cue(T12, 'whoosh', { gain: 0.5 }); cue(Wd('slipped', 3), 'slide', { gain: 0.6 }); cue(Wd('away', 3), 'pop', { gain: 0.6 });
  add({ id: 'a12', at: T12, cam: [760, 900], zoom: 0.1, note: 'night: moonlit fort with the gap, faceless figure slips out and runs right, guard torches far left, ESCAPED',
    draw(lt) {
      blit(nightImg(), 0, 0, 0, 0, 1); coldStars(lt, 40, 600); moon(230, 260, 0.75);
      glowS(760, 1000, 330, MOON, 0.45);
      fort(0, true, 'gap');
      for (const [x, s] of [[110, 0], [230, 2]]) { const f = 0.8 + 0.2 * sin(lt * 19 + s); glowS(x, 1180, 120, EMBER, 0.6 * f); ctx.fillStyle = '#FFC15A'; ctx.beginPath(); ctx.ellipse(x, 1175, 8, 16 * f, 0, 0, TAU); ctx.fill(); }
      const u = eio(seg(lt, te - 0.45, d12)), rx = lerp(740, 1240, u), rs = lerp(0.62, 0.8, u), frame = Math.floor(lt * 9) % 2, bob = Math.abs(sin(lt * 28)) * 10;
      glowS(rx, 1150, 160, MOON, 0.25);
      blit(runnerImg(frame), 120, 410, rx, 1262 - bob, rs);
      if (u > 0) for (let i = 0; i < 6; i++) { const ph = (lt * 2 + i / 6) % 1, px = rx - 60 - ph * 160; ctx.fillStyle = `rgba(120,140,155,${0.25 * (1 - ph)})`; ctx.beginPath(); ctx.arc(px, 1258 - ph * 30, 10 + ph * 26, 0, TAU); ctx.fill(); }
      tag('ESCAPED', 600, 380, 96, lt, te);
      calm(true);
    } });

  // a13 · HANGED 1764: empty noose swings against a rust sky, a plumed turban drops to the ground
  const th = Wd('hanged', 3) - T13, ty13 = Wd('yusuf', 3) - T13;
  cue(T13, 'swell', { gain: 0.55 }); cue(T13 + 0.05, 'whoosh', { gain: 0.4 }); cue(Wd('yusuf', 3), 'tock', { gain: 0.45 }); cue(Wd('hanged', 3) + 0.35, 'thud', { gain: 0.8 }); cue(Wd('hanged', 3), 'drum', { gain: 0.6 });
  add({ id: 'a13', at: T13, cam: [600, 760], zoom: 0.08, note: 'rust bloom: empty swinging noose on rust sky (no body), plumed turban drops + rolls, YUSUF KHAN, HANGED 1764',
    draw(lt) {
      blit(rustSkyImg(), 0, 0, 0, 0, 1);
      blit(gallowsImg(), 0, 0, -lt * 12, 0, 1);
      const ax = 620 - lt * 12, ay = 234, ang = 0.09 * sin(lt * 2.2) + 0.03 * sin(lt * 5.1), len = 470;
      const kx = ax + sin(ang) * len, ky = ay + cos(ang) * len;
      ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(kx, ky); ctx.strokeStyle = '#120E0B'; ctx.lineWidth = 10; ctx.stroke();
      ctx.save(); ctx.translate(kx, ky); ctx.rotate(-ang);
      for (let i = 0; i < 6; i++) { rr(-15, -60 + i * 12, 30, 12, 6); ctx.fillStyle = '#120E0B'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,170,110,0.35)'; ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(0, 90, 56, 80, 0, 0, TAU); ctx.lineWidth = 11; ctx.strokeStyle = '#120E0B'; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,170,110,0.3)'; ctx.stroke();
      ctx.restore();
      tag('HANGED 1764', 540, 1010, 84, lt, th + 0.32);
      // turban drop
      const fp = seg(lt, th, th + 0.38), tt = lt - th - 0.38;
      if (fp > 0) { const gy = 1222, y = fp < 1 ? lerp(-150, gy, fp * fp) : gy - Math.abs(sin(tt * 12)) * 40 * Math.exp(-tt * 6), x = 690 + (fp >= 1 ? 50 * eo(clamp(tt / 0.8)) : 0), r = fp < 1 ? fp * 1.2 : 1.2 + 0.25 * eo(clamp(tt / 0.8));
        ctx.save(); ctx.translate(x - lt * 12, y); ctx.rotate(r - 0.9); blit(turbanImg(), 160, 150, 0, 0, 0.8); ctx.restore();
        if (tt > 0) { for (let i = 0; i < 7; i++) { const ph = clamp(tt * 1.2 + rnd(i) * 0.1); ctx.beginPath(); ctx.arc(x - lt * 12 + (rnd(i + 2) - 0.5) * 300 * ph, 1235 - ph * 60, 20 + ph * 70, 0, TAU); ctx.fillStyle = `rgba(40,20,12,${0.4 * (1 - ph)})`; ctx.fill(); } sparks(x, 1240, tt, 16, 88, 420); } }
      K.embers(lt, 16, 11, HOT);
      tag('YUSUF KHAN', 830, 520, 48, lt, ty13, { quiet: true });
      rust(900, 260, 1 - eo(seg(lt, 0, 0.5)));
      calm();
    } });

  // a14 · RETAKEN: Puli Thevar returns, his tiger flag climbs over the fort
  const tk = Wd('took', 3) - T14, tg = Wd('again', 3) - T14;
  cue(T14, 'whoosh', { gain: 0.5 }); cue(Wd('took', 3) - 0.1, 'zip', { gain: 0.6 }); cue(Wd('again', 3), 'slam', { gain: 0.85 }); cue(Wd('again', 3) + 0.1, 'swell', { gain: 0.5 });
  add({ id: 'a14', at: T14, cam: [540, 640], zoom: 0.1, note: 'dawn embers: Puli Thevar silhouette walks to the gate, tiger-stripe flag climbs the tower pole, RETAKEN slams on the wall',
    draw(lt) {
      plate(); ctx.fillStyle = lg(0, 0, 0, 1100, [[0, 'rgba(181,84,31,0.35)'], [1, 'rgba(255,122,26,0.05)']]); ctx.fillRect(-300, 0, W + 600, 1100);
      glowS(540, 520, 700, EMBER, 0.3);
      const ox = -lt * 8; fort(ox);
      const px = 540 + ox, pyTop = 160, pyBase = 520; ctx.fillStyle = '#1C1714'; ctx.fillRect(px - 7, pyTop, 14, pyBase - pyTop); rivet(px, pyTop - 6, 11);
      const fu = eio(seg(lt, tk - 0.2, tk + 0.6)), fy = lerp(pyBase - 140, pyTop + 6, fu);
      if (lt > tk - 0.25) { const f = flag(px, fy, 230, 136, lt, ['#C25A1E', '#E0761E', '#C25A1E'], 1, 0);
        ctx.save(); poly([...f.top, ...f.bot.slice().reverse()]); ctx.clip(); for (let k = 0; k < 4; k++) { const pts = Array.from({ length: 10 }, (_, i) => { const u = (i / 9) * 0.8 + 0.12, j = Math.round(u * 14); return [f.top[j][0], lerp(f.top[j][1], f.bot[j][1], 0.15 + k * 0.23) + sin(u * 9 + k) * 8]; }); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.lineWidth = 9; ctx.strokeStyle = '#1A1512'; ctx.stroke(); } ctx.restore(); }
      sparks(px, fy, lt - tk - 0.6, 20, 44, 500);
      const wx = lerp(120, 380, eio(seg(lt, 0, 1.8))), bob = Math.abs(sin(lt * 9)) * 6; blit(puliImg(), 260, 1100, wx + ox, 1270 - bob, 0.42);
      K.embers(lt, 22, 19, HOT);
      tag('RETAKEN', 540, 900, 104, lt, tg);
      calm();
    } });
}
