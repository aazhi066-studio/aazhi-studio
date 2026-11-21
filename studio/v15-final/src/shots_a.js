// EPISODE 15 · worker A : "Lamplit Bronze & Red Thread", lines 0-3 (t 0 → L(4)). THE HOOK.
// Crown tipped on a corridor floor · faceless bronze crown prince · 969 CE molten pour · Aditya Karikalan · empty throne ·
// bronze crack (death, no wounds) · Chola records claim (abstract slab) · Vira Pandya + fish banner · shadow battle on the wall ·
// "then he was gone" (lamp gutters) · "no record says how" (slab with a red blank gap, smoke question mark).
// Engine: every figure, crown, throne, slab, wall and title is baked once by cached(); per frame only blits move, plus the
// lamp mask (one cached radial image, scaled), the flame, a few strokes, ash and red flashes. No shadowBlur anywhere.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { poly, cached, blit, smoke } from './art.js';
import * as K from './core/kit.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const B = { body: '#8A4B22', mid: '#B5692F', hi: '#F2B66B', deep: '#2A1206', wall: '#140A06', void: '#070302', red: '#B0121B', ash: '#E9DFCF', hot: '#FFC27A' };

// bronze Chola crown, base centre at (x,y), height ~ 190*s
function crown(x, y, s = 1, rot = 0, glowA = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, '#5A2E12'); g.addColorStop(0.45, '#F2B66B'); g.addColorStop(0.6, '#B5692F'); g.addColorStop(1, '#3A1A08');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, 0); ctx.lineTo(56, -40); ctx.lineTo(44, -95); ctx.lineTo(30, -140); ctx.lineTo(10, -175); ctx.lineTo(0, -195); ctx.lineTo(-10, -175); ctx.lineTo(-30, -140); ctx.lineTo(-44, -95); ctx.lineTo(-56, -40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2A1206'; ctx.lineWidth = 5; for (const yy of [-40, -95, -140]) { ctx.beginPath(); ctx.moveTo(-60 + (-yy) * 0.2, yy); ctx.lineTo(60 - (-yy) * 0.2, yy); ctx.stroke(); }
  ctx.fillStyle = '#B0121B'; ctx.beginPath(); ctx.arc(0, -20, 11, 0, Math.PI * 2); ctx.fill();
  if (glowA > 0) { ctx.globalAlpha = glowA; ctx.fillStyle = '#FFD9A0'; ctx.beginPath(); ctx.arc(0, -195, 14, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.restore();
}

// ───────────────────────────── small helpers ─────────────────────────────
const fl = (t, k = 0) => 1 + 0.06 * sin(t * 23 + k) + 0.04 * sin(t * 37 + k * 2) + 0.03 * sin(t * 61 + k * 3);
const bronzeGrad = (x0, x1, side = -1) => { const g = ctx.createLinearGradient(side < 0 ? x0 : x1, 0, side < 0 ? x1 : x0, 0); g.addColorStop(0, B.hi); g.addColorStop(0.22, B.mid); g.addColorStop(0.55, B.body); g.addColorStop(1, B.deep); return g; };
const st = (pts, col, w) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };
const fillAll = (c, a = 1) => { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(-400, -400, W + 800, H + 800); ctx.restore(); };
/** 2-4 frame blood-red flash at local time lt (cut) */
const flash = (lt, at = 0, a = 0.7) => { const k = (lt - at) / 0.11; if (k >= 0 && k < 1) fillAll(B.red, a * (1 - k)); };
/** recolour a cached image into a flat silhouette */
const tint = (key, src, ox, oy, col) => cached(key, src.width / src._q, src.height / src._q, src._q, () => {
  ctx.drawImage(src, 0, 0, src.width / src._q, src.height / src._q); ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = col; ctx.fillRect(0, 0, src.width, src.height);
});

// lamp mask: void everywhere except a soft hole (radius 540 local at s = 1)
const MASK = () => cached('amask', 4000, 4000, 0.25, () => {
  const g = ctx.createRadialGradient(2000, 2000, 0, 2000, 2000, 2000);
  const v = (a) => `rgba(7,3,2,${a})`;
  g.addColorStop(0, v(0)); g.addColorStop(0.05, v(0)); g.addColorStop(0.11, v(0.35)); g.addColorStop(0.18, v(0.8)); g.addColorStop(0.27, v(1)); g.addColorStop(1, v(1));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4000, 4000);
});
function lampMask(x, y, R) {
  const s = R / 540, half = 2000 * s; blit(MASK(), 2000, 2000, x, y, s);
  ctx.fillStyle = B.void; const M = 600;
  if (x - half > -M) ctx.fillRect(-M, -M, x - half + M + 1, H + 2 * M);
  if (x + half < W + M) ctx.fillRect(x + half - 1, -M, W + M - x - half + 1, H + 2 * M);
  if (y - half > -M) ctx.fillRect(-M, -M, W + 2 * M, y - half + M + 1);
  if (y + half < H + M) ctx.fillRect(-M, y + half - 1, W + 2 * M, H + M - y - half + 1);
}
/** warm light pool (before the mask) */
const warm = (x, y, R, a = 0.35) => K.glow(x, y, R, '255,150,60', a);
/** small clay lamp + flame + halo, drawn after the mask so it burns bright */
function oilLamp(x, y, t, s = 1, lit = 1) {
  K.glow(x, y - 30 * s, 170 * s * lit, '255,190,110', 0.55 * lit * fl(t));
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#5A2E12'; ctx.beginPath(); ctx.ellipse(0, 14, 46, 16, 0, 0, PI); ctx.fill();
  ctx.fillStyle = B.mid; ctx.beginPath(); ctx.moveTo(-46, 12); ctx.quadraticCurveTo(0, 0, 40, 4); ctx.lineTo(56, -2); ctx.quadraticCurveTo(46, 14, 40, 14); ctx.lineTo(-46, 14); ctx.closePath(); ctx.fill();
  ctx.restore();
  if (lit > 0.02) K.flame(x + 44 * s, y - 2 * s, 0.5 * s * lit * fl(t, 3), t, 2);
}
/** drifting ash + optional rising smoke, pure functions of t */
function ash(t, n = 34, seed = 0, a = 0.55, yMax = 1300) {
  for (let i = 0; i < n; i++) {
    const sp = 30 + rnd(i + seed) * 50, y = ((rnd(i * 5 + seed) * (yMax + 100) + t * sp) % (yMax + 100)) - 60;
    const x = rnd(i * 3 + seed) * W + sin(t * 0.8 + i) * 30, r = 1.6 + rnd(i + 7) * 3.2;
    ctx.fillStyle = `rgba(233,223,207,${a * (0.35 + 0.65 * rnd(i + 2))})`; ctx.fillRect(x, y, r, r * 0.7);
  }
}
/** keep the caption band calm: fade the floor to near-void below y 1260 */
function floorDark(a = 0.92) {
  const g = ctx.createLinearGradient(0, 1240, 0, 1420); g.addColorStop(0, 'rgba(7,3,2,0)'); g.addColorStop(1, `rgba(7,3,2,${a})`);
  ctx.fillStyle = g; ctx.fillRect(-400, 1240, W + 800, 180); ctx.fillStyle = `rgba(7,3,2,${a})`; ctx.fillRect(-400, 1419, W + 800, H);
}
/** ash-white caps label on a thin blood-red bar; p = reveal 0..1 */
function tag(text, x, y, size = 44, p = 1, a = 1) {
  if (p <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${size * 0.16}px`;
  const w = ctx.measureText(text).width + size * 1.1, h = size * 1.5, e = eo(p);
  ctx.fillStyle = 'rgba(7,3,2,0.82)'; ctx.fillRect(x - w / 2 * e, y - h / 2, w * e, h);
  ctx.fillStyle = B.red; ctx.fillRect(x - w / 2 * e, y + h / 2 - 7, w * e, 7); ctx.fillRect(x - w / 2 * e, y - h / 2, w * e, 3);
  ctx.beginPath(); ctx.rect(x - w / 2 * e, y - h, w * e, h * 2); ctx.clip();
  ctx.fillStyle = B.ash; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + size * 0.08, y + 1);
  ctx.restore(); ctx.letterSpacing = '0px';
}
/** text engraved into a bronze bar */
function engraved(text, x, y, size = 58, p = 1) {
  if (p <= 0) return; ctx.save(); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${size * 0.12}px`;
  const w = ctx.measureText(text).width + size * 1.4, h = size * 1.7, e = eo(p);
  ctx.translate(x, y); ctx.scale(1, e);
  ctx.fillStyle = bronzeGrad(-w / 2, w / 2, -1); ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = B.deep; ctx.fillRect(-w / 2, h / 2 - 6, w, 6); ctx.fillStyle = 'rgba(255,220,160,0.6)'; ctx.fillRect(-w / 2, -h / 2, w, 3);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,214,150,0.55)'; ctx.fillText(text, 2, 4); ctx.fillStyle = B.deep; ctx.fillText(text, 0, 1);
  ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────────────────────── molten pour titles ─────────────────────────────
function moltenImgs(key, text, size) {
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${size * 0.06}px`; const w = Math.ceil(ctx.measureText(text).width + size * 0.4), h = Math.ceil(size * 1.2); ctx.letterSpacing = '0px';
  const paint = (fill) => () => { ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${size * 0.06}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = fill(); ctx.fillText(text, w / 2, size * 0.98); };
  const hot = cached(key + 'h', w, h, 1, paint(() => { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#FFE6A8'); g.addColorStop(0.5, '#FF9A2A'); g.addColorStop(1, '#D2440E'); return g; }));
  const cool = cached(key + 'c', w, h, 1, paint(() => { const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, B.hi); g.addColorStop(0.35, B.mid); g.addColorStop(0.7, B.body); g.addColorStop(1, B.deep); return g; }));
  const edge = cached(key + 'e', w, h, 1, paint(() => '#FFFBEA'));
  return { hot, cool, edge, w, h };
}
/** (x, y) = centre of the word box. p = fill 0..1, c = cooling 0..1 */
function molten(key, text, size, x, y, p, c, t) {
  const M = moltenImgs(key, text, size), x0 = x - M.w / 2, y0 = y - M.h / 2, lvl = y0 + M.h * (1 - eio(clamp(p)));
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, lvl, M.w + 20, M.h + 20); ctx.clip();
  if (c < 1) blit(M.hot, 0, 0, x0, y0, 1, 1 - c);
  if (c > 0) blit(M.cool, 0, 0, x0, y0, 1, c);
  ctx.restore();
  if (p > 0 && p < 1) {
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, lvl - 2, M.w + 20, 16); ctx.clip(); blit(M.edge, 0, 0, x0, y0); ctx.restore();
    // the pour stream wanders across the word and sparks spit off the surface
    const sx = x0 + M.w * (0.5 + 0.42 * sin(t * 5.3));
    ctx.fillStyle = '#FFB347'; ctx.fillRect(sx - 6, -200, 12 + 3 * sin(t * 40), lvl + 200);
    ctx.fillStyle = '#FFF1C8'; ctx.fillRect(sx - 2, -200, 4, lvl + 200);
    for (let i = 0; i < 14; i++) { const ph = (t * 2.2 + rnd(i)) % 1, dx = (rnd(i + 3) - 0.5) * 260 * ph, dy = -220 * ph + 260 * ph * ph; ctx.fillStyle = `rgba(255,${180 + 60 * rnd(i)},90,${1 - ph})`; ctx.fillRect(sx + dx, lvl + dy, 5, 5); }
  }
  if (c > 0 && c < 1) K.glow(x, y, M.w * 0.6, '255,120,40', 0.3 * (1 - c));
}

// ───────────────────────────── set pieces (cached) ─────────────────────────────
// corridor: wall of big blocks, pillars receding, a floor in perspective. 1280 x 2120, origin (-100, -100)
const CORR = () => cached('acorr', 1280, 2120, 0.6, () => {
  ctx.translate(100, 100);
  ctx.fillStyle = '#1C0E07'; ctx.fillRect(-100, -100, 1280, 2120);
  const vx = 540, vy = 760;
  // back wall blocks
  for (let r = 0; r < 14; r++) for (let c = -1; c < 8; c++) { const bw = 190, bh = 92, x = c * bw + (r % 2) * 95 - 60, y = r * bh - 40; ctx.fillStyle = `rgb(${44 + rnd(r * 9 + c) * 22},${24 + rnd(r * 9 + c) * 10},${12 + rnd(r + c) * 6})`; ctx.fillRect(x + 3, y + 3, bw - 6, bh - 6); }
  // floor
  ctx.fillStyle = '#21110A'; ctx.fillRect(-100, 1180, 1280, 940);
  ctx.strokeStyle = 'rgba(0,0,0,0.65)'; ctx.lineWidth = 4;
  for (let j = -10; j <= 10; j++) { ctx.beginPath(); ctx.moveTo(vx + j * 40, 1180); ctx.lineTo(vx + j * 420, 2100); ctx.stroke(); }
  for (let k = 0; k < 10; k++) { const y = 1180 + 900 * Math.pow(k / 10, 1.8); ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(1180, y); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,190,120,0.18)'; ctx.fillRect(-100, 1176, 1280, 5);
  // receding pillars both sides
  for (let i = 5; i >= 0; i--) {
    const k = Math.pow(0.72, i), h = 1500 * k, w = 150 * k;
    for (const sd of [-1, 1]) {
      const x = vx + sd * (90 + 520 * k), base = vy + (1180 + 300 * (1 - k) * 0 - vy) * 1 + 520 * k - 520 * Math.pow(0.72, 0) * 0;
      const y1 = vy + (1180 - vy) * (0.25 + 0.75 * k) + 260 * k;
      ctx.fillStyle = bronzeGrad(x - w / 2, x + w / 2, -sd); ctx.globalAlpha = 0.25 + 0.6 * k;
      ctx.fillRect(x - w / 2, y1 - h, w, h); ctx.fillStyle = '#0E0603'; ctx.fillRect(x - w / 2 - 10 * k, y1 - h, w + 20 * k, 30 * k); ctx.fillRect(x - w / 2 - 10 * k, y1 - 40 * k, w + 20 * k, 40 * k);
      ctx.globalAlpha = 1; void base;
    }
  }
});
// flat wall + floor for the figure shots (shadows read on it)
const WALL = () => cached('awall', 1280, 2120, 0.6, () => {
  ctx.translate(100, 100);
  ctx.fillStyle = '#2A160C'; ctx.fillRect(-100, -100, 1280, 1290);
  for (let r = 0; r < 12; r++) for (let c = -1; c < 7; c++) { const bw = 240, bh = 120, x = c * bw + (r % 2) * 120 - 40, y = r * bh - 100; const v = rnd(r * 13 + c * 7); ctx.fillStyle = `rgb(${46 + v * 18},${26 + v * 9},${14 + v * 5})`; ctx.fillRect(x + 4, y + 4, bw - 8, bh - 8); ctx.fillStyle = 'rgba(255,200,140,0.05)'; ctx.fillRect(x + 4, y + 4, bw - 8, 5); }
  ctx.fillStyle = '#1A0D07'; ctx.fillRect(-100, 1180, 1280, 940);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 4;
  for (let j = -10; j <= 10; j++) { ctx.beginPath(); ctx.moveTo(540 + j * 110, 1180); ctx.lineTo(540 + j * 400, 2100); ctx.stroke(); }
  for (let k = 1; k < 8; k++) { const y = 1180 + 900 * Math.pow(k / 8, 1.8); ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(1180, y); ctx.stroke(); }
  ctx.fillStyle = '#0D0603'; ctx.fillRect(-100, 1160, 1280, 22); ctx.fillStyle = 'rgba(255,190,120,0.16)'; ctx.fillRect(-100, 1158, 1280, 4);
});
const bg = (img, sx = 0) => blit(img, 0, 0, -100 + sx, -100);

// prince: foot centre at (0,0), height ~ 790. cache 360 x 880, origin (180, 860). side = light side (-1 left, +1 right)
function princeBody(side) {
  const g = bronzeGrad(-120, 120, side);
  ctx.fillStyle = g;
  poly([[-44, 0], [-14, 0], [-12, -300], [-50, -300]]); ctx.fill(); poly([[14, 0], [44, 0], [50, -300], [12, -300]]); ctx.fill();
  poly([[-54, -6], [-10, -6], [-10, 6], [-62, 6]]); ctx.fill(); poly([[10, -6], [54, -6], [62, 6], [10, 6]]); ctx.fill();
  poly([[-60, -340], [60, -340], [92, -170], [40, -190], [0, -160], [-40, -190], [-92, -170]]); ctx.fill(); // dhoti
  poly([[-50, -340], [50, -340], [96, -548], [70, -566], [-70, -566], [-96, -548]]); ctx.fill(); // torso
  st([[-92, -540], [-118, -440], [-112, -350]], g, 30); st([[92, -540], [118, -450], [70, -372]], g, 30); // arms
  ctx.fillStyle = g; poly([[-18, -560], [18, -560], [16, -600], [-16, -600]]); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -650, 46, 58, 0, 0, TAU); ctx.fill(); // faceless oval head
  // sword at hip
  st([[60, -350], [150, -110]], '#3A1A08', 16); st([[60, -350], [150, -110]], B.mid, 8); st([[44, -372], [80, -358]], B.hi, 10); ctx.fillStyle = B.hi; ctx.beginPath(); ctx.arc(52, -380, 9, 0, TAU); ctx.fill();
  // ornaments: belt, necklace arcs, armbands
  ctx.fillStyle = B.deep; ctx.fillRect(-62, -352, 124, 16); ctx.fillStyle = B.hi; ctx.fillRect(-62, -352, 124, 4);
  for (const r of [40, 58]) { ctx.beginPath(); ctx.arc(0, -566, r, 0.25, PI - 0.25); ctx.strokeStyle = r === 40 ? B.hi : B.deep; ctx.lineWidth = 6; ctx.stroke(); }
  for (const sx of [-1, 1]) st([[sx * 98, -500], [sx * 120, -490]], B.deep, 8);
  ctx.fillStyle = 'rgba(255,230,180,0.5)'; ctx.beginPath(); ctx.ellipse(side * 18, -672, 12, 22, side * 0.3, 0, TAU); ctx.fill(); // head sheen
}
const PRINCE = (side, crowned = true) => cached(`apr${side}${crowned ? 'c' : ''}`, 360, 880, 1, () => { ctx.translate(180, 860); princeBody(side); if (crowned) crown(0, -700, 0.5); });
const PRINCE_SIL = (crowned = true) => tint('aprS' + crowned, PRINCE(-1, crowned), 180, 860, '#000');
const PRINCE_RIM = (crowned = true) => tint('aprR' + crowned, PRINCE(-1, crowned), 180, 860, B.hot);

// Pandya king: heavier, dome cap, holding a fish-banner pole. cache 520 x 1100, origin (220, 1080)
function kingBody(side) {
  const g = bronzeGrad(-140, 140, side);
  ctx.fillStyle = g;
  poly([[-56, 0], [-18, 0], [-16, -300], [-62, -300]]); ctx.fill(); poly([[18, 0], [56, 0], [62, -300], [16, -300]]); ctx.fill();
  poly([[-74, -350], [74, -350], [110, -160], [-110, -160]]); ctx.fill();
  poly([[-70, -350], [70, -350], [118, -560], [86, -584], [-86, -584], [-118, -560]]); ctx.fill();
  st([[-110, -556], [-140, -450], [-120, -370]], g, 36); st([[110, -556], [150, -470], [190, -520]], g, 36);
  ctx.fillStyle = g; poly([[-22, -580], [22, -580], [20, -616], [-20, -616]]); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -668, 52, 62, 0, 0, TAU); ctx.fill();
  // dome cap with a band and a knob (NOT the Chola crown)
  ctx.beginPath(); ctx.moveTo(-60, -706); ctx.quadraticCurveTo(-64, -800, 0, -812); ctx.quadraticCurveTo(64, -800, 60, -706); ctx.closePath(); ctx.fillStyle = bronzeGrad(-64, 64, side); ctx.fill();
  ctx.fillStyle = B.deep; ctx.fillRect(-62, -716, 124, 14); ctx.beginPath(); ctx.arc(0, -820, 14, 0, TAU); ctx.fillStyle = B.hi; ctx.fill();
  ctx.fillStyle = B.deep; ctx.fillRect(-76, -362, 152, 16);
  for (const r of [46, 66]) { ctx.beginPath(); ctx.arc(0, -584, r, 0.25, PI - 0.25); ctx.strokeStyle = r === 46 ? B.hi : B.deep; ctx.lineWidth = 7; ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,230,180,0.45)'; ctx.beginPath(); ctx.ellipse(side * 20, -690, 13, 24, side * 0.3, 0, TAU); ctx.fill();
}
// fish banner: pole + cloth with two fish. cache 300 x 1000, origin (40, 980) = pole foot
function fishShape(x, y, s, dir, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.beginPath(); ctx.moveTo(-60, 0); ctx.quadraticCurveTo(-10, -34, 40, 0); ctx.quadraticCurveTo(-10, 34, -60, 0); ctx.closePath(); ctx.moveTo(40, 0); ctx.lineTo(70, -22); ctx.lineTo(62, 0); ctx.lineTo(70, 22); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = '#2A1206'; ctx.beginPath(); ctx.arc(-38, -4, 5, 0, TAU); ctx.fill(); ctx.restore(); }
const BANNER = () => cached('aban', 300, 1000, 1, () => {
  ctx.translate(40, 980);
  st([[0, 0], [0, -960]], '#3A1A08', 14); st([[0, 0], [0, -960]], B.mid, 6); ctx.fillStyle = B.hi; ctx.beginPath(); ctx.arc(0, -966, 12, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(6, -940); ctx.lineTo(240, -930); ctx.quadraticCurveTo(220, -830, 250, -700); ctx.lineTo(200, -730); ctx.lineTo(160, -690); ctx.lineTo(6, -700); ctx.closePath(); ctx.fillStyle = '#6E1A10'; ctx.fill();
  ctx.strokeStyle = B.hi; ctx.lineWidth = 4; ctx.stroke();
  fishShape(120, -860, 1.15, 1, B.ash); fishShape(120, -770, 1.15, -1, B.ash);
});
const KING = (side) => cached('akg' + side, 520, 1100, 1, () => { ctx.translate(220, 1080); kingBody(side); });
const KING_SIL = () => tint('akgS', KING(-1), 220, 1080, '#000');
const KING_RIM = () => tint('akgR', KING(-1), 220, 1080, B.hot);
const BAN_SIL = () => tint('abanS', BANNER(), 40, 980, '#000');

// empty bronze throne. cache 640 x 760, origin (320, 740)
const THRONE = () => cached('athr', 640, 760, 1, () => {
  ctx.translate(320, 740); const g = bronzeGrad(-300, 300, -1);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-220, -260); ctx.lineTo(-220, -560); ctx.quadraticCurveTo(-220, -700, 0, -720); ctx.quadraticCurveTo(220, -700, 220, -560); ctx.lineTo(220, -260); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = B.deep; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-180, -280); ctx.lineTo(-180, -550); ctx.quadraticCurveTo(-180, -660, 0, -676); ctx.quadraticCurveTo(180, -660, 180, -550); ctx.lineTo(180, -280); ctx.stroke();
  ctx.fillStyle = '#4A220C'; ctx.fillRect(-170, -560, 340, 290);
  ctx.fillStyle = g; ctx.fillRect(-290, -280, 580, 80); ctx.fillStyle = B.hi; ctx.fillRect(-290, -280, 580, 6);
  ctx.fillStyle = g; for (const sx of [-1, 1]) { ctx.fillRect(sx * 250 - 30, -420, 60, 150); ctx.beginPath(); ctx.arc(sx * 250, -430, 40, 0, TAU); ctx.fill(); }
  ctx.fillStyle = g; poly([[-270, -200], [-210, -200], [-200, 0], [-280, 0]]); ctx.fill(); poly([[210, -200], [270, -200], [280, 0], [200, 0]]); ctx.fill();
  ctx.fillStyle = B.deep; ctx.fillRect(-210, -200, 420, 26);
  ctx.fillStyle = B.red; ctx.fillRect(-260, -300, 520, 20); // cushion edge
  for (let k = -3; k <= 3; k++) { ctx.fillStyle = B.hi; ctx.beginPath(); ctx.arc(k * 70, -240, 8, 0, TAU); ctx.fill(); }
});

// granite slab with rows of abstract incised strokes. cache 760 x 980, origin (380, 980). gap = [row0,row1,col0,col1] left blank
function strokesOn(col, w, gap) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  for (let r = 0; r < 12; r++) for (let c = 0; c < 11; c++) {
    if (gap && r >= gap[0] && r <= gap[1] && c >= gap[2] && c <= gap[3]) continue;
    if (rnd(r * 31 + c * 7) < 0.1) continue;
    const x = 110 + c * 56, y = 170 + r * 64, k = Math.floor(rnd(r * 17 + c * 3) * 5); ctx.beginPath();
    if (k === 0) { ctx.moveTo(x - 14, y + 16); ctx.lineTo(x - 14, y - 14); ctx.lineTo(x + 14, y - 14); }
    else if (k === 1) { ctx.arc(x, y, 15, 0.6, TAU - 0.4); }
    else if (k === 2) { ctx.moveTo(x - 16, y); ctx.lineTo(x + 16, y); ctx.moveTo(x, y - 16); ctx.lineTo(x + 6, y + 16); }
    else if (k === 3) { ctx.moveTo(x - 16, y + 14); ctx.quadraticCurveTo(x, y - 30, x + 16, y + 14); }
    else { ctx.moveTo(x - 12, y - 14); ctx.lineTo(x + 12, y + 14); ctx.moveTo(x + 10, y - 16); ctx.lineTo(x + 10, y - 4); }
    ctx.stroke();
  }
}
const slabShape = () => { ctx.beginPath(); ctx.moveTo(30, 980); ctx.lineTo(30, 130); ctx.quadraticCurveTo(40, 20, 380, 14); ctx.quadraticCurveTo(720, 20, 730, 130); ctx.lineTo(730, 980); ctx.closePath(); };
const SLAB = (gap, key) => cached('aslab' + key, 760, 980, 1, () => {
  slabShape(); const g = ctx.createLinearGradient(0, 0, 760, 0); g.addColorStop(0, '#3A332E'); g.addColorStop(0.5, '#24201D'); g.addColorStop(1, '#100D0B'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); slabShape(); ctx.clip(); for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(${rnd(i) > 0.5 ? '255,240,220' : '0,0,0'},${0.05 + rnd(i + 3) * 0.08})`; ctx.fillRect(rnd(i * 3) * 760, rnd(i * 7) * 980, 3 + rnd(i) * 6, 3 + rnd(i + 1) * 6); } ctx.restore();
  ctx.save(); ctx.translate(0, 3); strokesOn('rgba(255,235,210,0.18)', 7, gap); ctx.restore(); strokesOn('#060403', 7, gap);
  ctx.strokeStyle = 'rgba(255,230,200,0.12)'; ctx.lineWidth = 4; slabShape(); ctx.stroke();
});
const SLAB_GLOW = (gap, key) => cached('aslabg' + key, 760, 980, 1, () => { strokesOn('rgba(255,60,40,0.35)', 18, gap); strokesOn('#FF5A3A', 6, gap); });

/** wall shadow of a cached silhouette: foot at (fx, fy) on the floor, lamp at (lx, ly). stretches away from the flame */
function wallShadow(sil, ox, oy, fx, fy, s, lx, ly, a = 0.85) {
  const dx = fx - lx, sh = clamp((fy - ly) / 500, 0.3, 1.6);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(fx + dx * 0.45, 1170); ctx.transform(1.1 + Math.abs(dx) / 1600, 0, dx / 900, 0.95 + sh * 0.35, 0, 0);
  blit(sil, ox, oy, 0, 0, s); ctx.restore();
}
/** a lit bronze cut-out: rim (hot silhouette offset toward the flame) + crossfaded L/R lighting */
function cutout(imgL, imgR, rim, ox, oy, x, y, s, lx, a = 1) {
  const side = lx < x ? -1 : 1, k = clamp(0.5 + (lx - x) / 600);
  blit(rim, ox, oy, x + side * 7 * s, y - 3, s, a * 0.9);
  blit(imgL, ox, oy, x, y, s, a); if (k > 0.02) blit(imgR, ox, oy, x, y, s, a * k);
}

// ───────────────────────────── the shots ─────────────────────────────
export function buildA(add, cue) {
  const T1 = Wd('prince', 0), T2 = L(1), T3 = Wd('aditya', 1), T4 = Wd('heir', 1), T5 = Wd('killed', 1), T6 = L(2), T7 = Wd('had', 2),
    T8 = Wd('pandya', 2), T9 = Wd('battle', 2), T10 = L(3), T11 = Wd('no', 3), TEND = L(4);

  // a1 · 0 → "prince": lamp flame jerks across a black corridor, the crown lies tipped on the stone floor in the lamp pool
  cue(0, 'slam', { gain: 1 }); cue(0, 'heartbeat', { gain: 0.9 }); cue(Wd('murdered', 0), 'heartbeat', { gain: 0.7 }); cue(0.05, 'rumble', { gain: 0.5, dur: 1.2 });
  add({ id: 'a1', at: 0, cam: [560, 1080], zoom: 0.34, note: 'lamp jerks across black corridor; THE crown tipped on the floor; red flash at 0',
    draw(lt, d, t) {
      const k = eo(seg(lt, 0, 0.55)), lx = lerp(-60, 700, k) + 30 * sin(lt * 31) * (1 - k), ly = 1010 + 40 * sin(lt * 9) - 60 * k;
      bg(CORR(), -60 * lt);
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.ellipse(560, 1172, 230, 30, 0, 0, TAU); ctx.fill();
      crown(560, 1150, 1.45, -1.38 + 0.03 * sin(lt * 4), 0.6); // tipped on its side
      warm(lx, ly, 620, 0.32);
      lampMask(lx, ly, 560 * fl(t));
      oilLamp(lx - 44, ly, t, 1.1);
      ash(t, 26, 1, 0.45, 1250);
      floorDark();
      flash(lt, 0, 0.8); flash(lt, Wd('murdered', 0), 0.55);
    } });

  // a2 · "prince" → L(1): faceless bronze prince wearing THE crown, rim-lit, long shadow on the wall; lamp flickers
  cue(T1, 'whoosh', { gain: 0.7 }); cue(T1 + 0.05, 'thud', { gain: 0.6 });
  add({ id: 'a2', at: T1, cam: [540, 520], zoom: 0.18, note: 'CROWN PRINCE: bronze faceless prince, crown, long wall shadow swings with lamp',
    draw(lt, d, t) {
      const lx = 200 + 120 * sin(lt * 2.2) + 14 * sin(lt * 29), ly = 980;
      bg(WALL());
      wallShadow(PRINCE_SIL(), 180, 860, 560, 1180, 1.12, lx, ly, 0.8);
      warm(lx, ly, 760, 0.3);
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.ellipse(560, 1182, 140, 20, 0, 0, TAU); ctx.fill();
      cutout(PRINCE(-1), PRINCE(1), PRINCE_RIM(), 180, 860, 560, 1180, 1.12, lx);
      lampMask(lx, ly - 200, 720 * fl(t));
      oilLamp(lx - 44, ly, t, 1.1);
      tag('CROWN PRINCE', 540, 1250, 50, seg(lt, 0.2, 0.55));
      ash(t, 22, 2, 0.4); floorDark();
      flash(lt, 0, 0.6);
    } });

  // a3 · L(1) → "Aditya": molten pour title 969 CE
  cue(T2, 'whoosh', { gain: 0.6 }); cue(T2 + 0.08, 'sizzle', { gain: 0.8, dur: 1.3 }); cue(Wd('nine', 1), 'tock', { gain: 0.5 });
  add({ id: 'a3', at: T2, cam: [540, 700], zoom: 0.12, note: '969 CE pours as molten bronze into letter shapes, then cools',
    draw(lt, d, t) {
      const lx = 540 + 260 * sin(lt * 1.3), ly = 1100;
      bg(WALL(), -40 * lt);
      warm(540, 700, 700, 0.25);
      lampMask(540 + 80 * sin(lt * 1.3), 760, 760 * fl(t));
      const p = seg(lt, 0.05, 0.95), c = seg(lt, 0.85, 1.55);
      molten('a969', '969', 360, 540, 650, p, c, t);
      ctx.save(); ctx.globalAlpha = seg(lt, 0.9, 1.2); K.label('CIRCA', 540, 380, 46, B.ash); ctx.restore();
      tag('969 CE', 540, 940, 56, seg(lt, 0.9, 1.25));
      oilLamp(lx, ly, t, 1); ash(t, 30, 3, 0.4); floorDark();
      flash(lt, 0, 0.6);
    } });

  // a4 · "Aditya" → "heir": prince + ADITYA KARIKALAN engraved bar + ILLUSTRATION tag
  cue(T3, 'whoosh', { gain: 0.6 }); cue(T3 + 0.1, 'bell', { gain: 0.35 });
  add({ id: 'a4', at: T3, cam: [600, 640], zoom: 0.16, note: 'ADITYA KARIKALAN engraved bronze bar under the prince, ILLUSTRATION tag; lamp passes right to left',
    draw(lt, d, t) {
      const lx = lerp(980, 300, eio(clamp(lt / d))), ly = 940;
      bg(WALL(), 30 * lt);
      wallShadow(PRINCE_SIL(), 180, 860, 600, 1180, 1.2, lx, ly, 0.85);
      warm(lx, ly, 780, 0.3);
      cutout(PRINCE(-1), PRINCE(1), PRINCE_RIM(), 180, 860, 600, 1180, 1.2, lx);
      lampMask(lx, 760, 760 * fl(t));
      oilLamp(lx, ly, t, 1.1);
      engraved('ADITYA KARIKALAN', 540, 1236, 62, seg(lt, 0.05, 0.35));
      ctx.save(); ctx.globalAlpha = 0.85 * seg(lt, 0.3, 0.5); ctx.fillStyle = 'rgba(7,3,2,0.7)'; ctx.fillRect(60, 150, 330, 62); K.label('ILLUSTRATION', 225, 182, 36, B.ash); ctx.restore();
      ash(t, 22, 4, 0.4); floorDark();
      flash(lt, 0, 0.5);
    } });

  // a5 · "heir" → "killed": empty bronze throne, crown hovering above it, lamp sweep
  cue(T4, 'whoosh', { gain: 0.6 }); cue(Wd('throne', 1), 'swell', { gain: 0.4, dur: 0.8 });
  add({ id: 'a5', at: T4, cam: [540, 600], zoom: 0.2, note: 'HEIR: empty bronze throne, THE crown hovers above it glowing; lamp sweep',
    draw(lt, d, t) {
      const lx = lerp(120, 960, eio(clamp(lt / d))), ly = 1040;
      bg(WALL(), -30 * lt);
      blit(tint('athrS', THRONE(), 320, 740, '#000'), 320, 740, 540 + (540 - lx) * 0.35, 1150, 1.25, 0.6, 1.4);
      warm(lx, ly, 760, 0.3);
      blit(THRONE(), 320, 740, 540, 1180, 1.05);
      lampMask(lerp(lx, 540, 0.4), 760, 820 * fl(t));
      const hy = 400 + 14 * sin(lt * 3.2);
      K.glow(540, hy - 90, 280, '255,170,90', 0.4);
      crown(540, hy, 1.0, 0.04 * sin(lt * 2.4), 0.8 + 0.2 * sin(t * 9));
      oilLamp(lx, ly, t, 1.1);
      tag('HEIR TO THE THRONE', 540, 1250, 44, seg(lt, 0.15, 0.45));
      ash(t, 26, 5, 0.4); floorDark();
      flash(lt, 0, 0.45);
    } });

  // a6 · "killed" → L(2): BRONZE CRACK races through the prince, halves fall apart (no blood, no wound, no weapon)
  cue(T5, 'slam', { gain: 1 }); cue(T5 + 0.04, 'thud', { gain: 0.9 }); cue(T5 + 0.35, 'rumble', { gain: 0.6, dur: 0.8 }); cue(T5 + 0.1, 'heartbeat', { gain: 0.8 });
  const CRK = []; for (let i = 0; i <= 14; i++) CRK.push([(i % 2 ? 1 : -1) * (10 + rnd(i + 40) * 22) * (i && i < 14 ? 1 : 0), -840 + i * 60]);
  add({ id: 'a6', at: T5, cam: [540, 760], zoom: 0.14, note: 'KILLED: a glowing bronze crack races down the prince, the two halves split and fall apart; red flash',
    draw(lt, d, t) {
      const lx = 260 + 20 * sin(lt * 27), ly = 960, x = 560, y = 1180, s = 1.2;
      const pc = eo(seg(lt, 0.0, 0.22)), sep = eio(seg(lt, 0.28, 0.95)), shake = (1 - seg(lt, 0, 0.4)) * 14;
      ctx.save(); ctx.translate(shake * sin(lt * 90), shake * cos(lt * 77));
      bg(WALL());
      warm(lx, ly, 760, 0.3);
      const half = (sd, img) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(sd * 0.22 * sep); ctx.translate(sd * 90 * sep, 26 * sep * sep);
        ctx.beginPath(); ctx.moveTo(sd * 400, 20); ctx.lineTo(sd * 400, -900); CRK.forEach((p) => ctx.lineTo(p[0] * s, p[1] * s)); ctx.lineTo(0, 20); ctx.closePath(); ctx.clip();
        img(); ctx.restore();
      };
      for (const sd of [-1, 1]) half(sd, () => { ctx.save(); ctx.globalAlpha = 0.75 * (1 - sep * 0.6); ctx.translate((x - lx) * 0.45, -10); ctx.transform(1.2, 0, (x - lx) / 900, 1.25, 0, 0); blit(PRINCE_SIL(), 180, 860, 0, 0, s); ctx.restore(); });
      for (const sd of [-1, 1]) half(sd, () => { blit(PRINCE_RIM(), 180, 860, -7 * s, -3, s, 0.9); blit(PRINCE(-1), 180, 860, 0, 0, s); });
      // the crack itself
      if (pc > 0 && sep < 0.6) {
        const n = Math.max(1, Math.floor(pc * (CRK.length - 1))), pts = CRK.slice(0, n + 1).map((p) => [x + p[0] * s, y + p[1] * s]);
        ctx.globalAlpha = 1 - sep / 0.6; st(pts, 'rgba(255,90,40,0.5)', 22); st(pts, '#FFE7B0', 6); ctx.globalAlpha = 1;
        const tip = pts[pts.length - 1]; K.glow(tip[0], tip[1], 90, '255,220,150', 0.8 * (1 - sep));
      }
      // bronze flakes falling from the split
      for (let i = 0; i < 18; i++) { const ph = seg(lt, 0.25 + rnd(i) * 0.15, 1.1); if (ph <= 0 || ph >= 1) continue; const fx = x + (rnd(i + 5) - 0.5) * 120 + (rnd(i + 9) - 0.5) * 200 * ph, fy = y - 840 * s * rnd(i + 2) + 700 * ph * ph; ctx.fillStyle = rnd(i) > 0.5 ? B.hi : B.mid; ctx.fillRect(fx, fy, 7, 4); }
      lampMask(lx, 760, 760 * fl(t, 5));
      oilLamp(lx - 44, ly, t, 1.1);
      ctx.restore();
      ash(t, 30, 6, 0.5); floorDark();
      flash(lt, 0, 0.85); flash(lt, 0.3, 0.4);
    } });

  // a7 · L(2) → "had": CHOLA RECORDS CLAIM - granite slab, abstract incised strokes glow red row by row
  cue(T6, 'whoosh', { gain: 0.6 }); cue(Wd('records', 2), 'chisel', { gain: 0.5 }); cue(Wd('boast', 2), 'tock', { gain: 0.5 });
  add({ id: 'a7', at: T6, cam: [540, 640], zoom: 0.16, note: 'CHOLA RECORDS CLAIM: granite slab, abstract strokes glow red row by row (illustrative, not text)',
    draw(lt, d, t) {
      const lx = lerp(200, 880, eio(clamp(lt / d))), ly = 1120;
      bg(WALL(), 20 * lt);
      warm(lx, ly, 800, 0.3);
      blit(SLAB(null, 'n'), 380, 980, 540, 1190, 1.0);
      const p = seg(lt, 0.15, d * 0.9);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 1190 - 980 + 120, W, 800 * p); ctx.clip(); blit(SLAB_GLOW(null, 'n'), 0, 0, 540 - 380, 1190 - 980, 1, 0.85 + 0.15 * sin(t * 12)); ctx.restore();
      lampMask(lerp(lx, 540, 0.5), 700, 900 * fl(t));
      oilLamp(lx, ly, t, 1.1);
      tag('CHOLA RECORDS CLAIM', 540, 140, 46, seg(lt, 0.1, 0.4));
      ash(t, 22, 7, 0.4); floorDark();
      flash(lt, 0, 0.4);
    } });

  // a7b · "had" → "Pandya": the boast - the prince's shadow huge on the wall, sword raised in victory
  cue(T7, 'whoosh', { gain: 0.5 }); cue(Wd('killed', 2), 'drum', { gain: 0.6 });
  add({ id: 'a7b', at: T7, cam: [540, 600], zoom: 0.2, note: 'the boast: prince cut-out, sword raised, giant victory shadow on the wall; lamp low',
    draw(lt, d, t) {
      const lx = 360 + 60 * sin(lt * 1.6) + 10 * sin(lt * 31), ly = 1150;
      bg(WALL());
      // raised-sword silhouette on the wall (huge, stretched)
      const raise = eob(seg(lt, 0.1, 0.6));
      ctx.save(); ctx.globalAlpha = 0.85; ctx.translate(560 + (560 - lx) * 0.5, 1170); ctx.transform(1.35, 0, (560 - lx) / 700, 1.45, 0, 0);
      blit(PRINCE_SIL(), 180, 860, 0, 0, 1.0); ctx.translate(90, -540); ctx.rotate(-2.6 + 1.0 * (1 - raise)); ctx.fillStyle = '#000'; ctx.fillRect(-6, 0, 12, 300); ctx.fillRect(-26, -4, 52, 12); ctx.restore();
      warm(lx, ly, 700, 0.3);
      cutout(PRINCE(-1), PRINCE(1), PRINCE_RIM(), 180, 860, 560, 1180, 0.95, lx);
      // the cut-out's own raised sword
      ctx.save(); ctx.translate(560 + 112 * 0.95, 1180 - 450 * 0.95); ctx.rotate(-2.6 + 1.0 * (1 - raise)); st([[0, 0], [0, 240]], '#3A1A08', 14); st([[0, 0], [0, 240]], B.hi, 6); st([[-20, 0], [20, 0]], B.mid, 10); ctx.restore();
      lampMask(lx, 820, 820 * fl(t));
      oilLamp(lx - 44, ly, t, 1.1);
      tag('VICTORY BOAST', 540, 1250, 44, seg(lt, 0.2, 0.5));
      ash(t, 22, 8, 0.4); floorDark();
    } });

  // a8 · "Pandya" → "battle": rival king cut-out with the Pandya fish banner, molten title VIRA PANDYA
  cue(T8, 'whoosh', { gain: 0.6 }); cue(Wd('vira', 2), 'sizzle', { gain: 0.7, dur: 1 }); cue(Wd('vira', 2), 'drum', { gain: 0.5 });
  add({ id: 'a8', at: T8, cam: [560, 640], zoom: 0.14, note: 'VIRA PANDYA: rival king (dome cap) with fish banner; molten-pour title',
    draw(lt, d, t) {
      const lx = lerp(900, 640, eio(clamp(lt / d))) + 12 * sin(lt * 25), ly = 1060, x = 460;
      bg(WALL(), -25 * lt);
      wallShadow(KING_SIL(), 220, 1080, x, 1180, 1.0, lx, ly, 0.8);
      wallShadow(BAN_SIL(), 40, 980, x + 190, 1180, 1.0, lx, ly, 0.8);
      warm(lx, ly, 820, 0.3);
      ctx.save(); ctx.translate(x + 190, 1180); ctx.transform(1, 0, 0.0, 1, 0, 0); blit(BANNER(), 40, 980, 0, 0, 1.0); ctx.restore();
      cutout(KING(-1), KING(1), KING_RIM(), 220, 1080, x, 1180, 1.0, lx);
      lampMask(lx - 120, 760, 840 * fl(t));
      oilLamp(lx, ly, t, 1.1);
      const tv = lt - (Wd('vira', 2) - T8) + 0.15;
      if (tv > 0) { ctx.fillStyle = 'rgba(7,3,2,0.55)'; ctx.fillRect(-100, 140, W + 200, 230); molten('avp', 'VIRA PANDYA', 118, 540, 250, seg(tv, 0, 0.6), seg(tv, 0.6, 1.1), t); }
      tag('PANDYA KING', 540, 1250, 44, seg(lt, 0.1, 0.4));
      ash(t, 22, 9, 0.4); floorDark();
      flash(lt, 0, 0.45);
    } });

  // a9 · "battle" → L(3): two shadows clash on the wall, sword-flash streak, the fish banner falls (no gore)
  cue(T9, 'whoosh', { gain: 0.8 }); cue(T9 + 0.32, 'slam', { gain: 0.8 }); cue(T9 + 0.6, 'thud', { gain: 0.6 });
  add({ id: 'a9', at: T9, cam: [540, 700], zoom: 0.22, note: 'BATTLE: two shadows lunge and clash on the wall, sword-flash streak, fish banner topples',
    draw(lt, d, t) {
      const lx = 540 + 40 * sin(lt * 21), ly = 1180;
      bg(WALL());
      warm(lx, ly, 800, 0.32);
      const k = eio(seg(lt, 0, 0.32)), hit = seg(lt, 0.3, 0.42);
      const ax = lerp(160, 400, k), bx = lerp(920, 690, k);
      ctx.save(); ctx.globalAlpha = 0.92;
      ctx.save(); ctx.translate(ax, 1170); ctx.transform(1.3, 0, 0.35 * k, 1.4, 0, 0); blit(PRINCE_SIL(), 180, 860, 0, 0, 1); ctx.restore();
      ctx.save(); ctx.translate(bx, 1170); ctx.transform(-1.3, 0, 0.35 * k, 1.4, 0, 0); blit(KING_SIL(), 220, 1080, 0, 0, 0.9); ctx.restore();
      // banner shadow topples after the clash
      const fall = eo(seg(lt, 0.45, 1.0)); ctx.save(); ctx.translate(bx + 160, 1170); ctx.rotate(fall * 1.25); ctx.scale(1.2, 1.3); blit(BAN_SIL(), 40, 980, 0, 0, 1); ctx.restore();
      // sword shadows meeting
      ctx.fillStyle = '#000';
      ctx.save(); ctx.translate(ax + 150, 1170 - 640); ctx.rotate(lerp(-1.6, -0.5, k)); ctx.fillRect(0, -7, 380, 14); ctx.restore();
      ctx.save(); ctx.translate(bx - 140, 1170 - 640); ctx.rotate(PI + lerp(1.6, 0.5, k)); ctx.fillRect(0, -7, 360, 14); ctx.restore();
      ctx.restore();
      lampMask(lx, 800, 860 * fl(t, 7));
      // sword-flash streak + sparks at the clash
      if (hit > 0 && hit < 1) { ctx.save(); ctx.globalAlpha = 1 - hit; ctx.translate(545, 500); ctx.rotate(-0.5); ctx.fillStyle = '#FFF4DA'; ctx.fillRect(-520 * eo(hit), -5, 1040 * eo(hit), 10); ctx.fillStyle = 'rgba(255,200,120,0.5)'; ctx.fillRect(-560 * eo(hit), -16, 1120 * eo(hit), 32); ctx.restore(); }
      for (let i = 0; i < 20; i++) { const ph = seg(lt, 0.34, 0.9 + rnd(i) * 0.3); if (ph <= 0 || ph >= 1) continue; const a = rnd(i + 1) * TAU; ctx.fillStyle = `rgba(255,${190 + 60 * rnd(i)},110,${1 - ph})`; ctx.fillRect(545 + cos(a) * 260 * ph, 500 + sin(a) * 200 * ph + 200 * ph * ph, 6, 6); }
      oilLamp(lx - 44, ly - 40, t, 1.1);
      tag('IN BATTLE', 540, 1250, 44, seg(lt, 0.4, 0.7));
      ash(t, 30, 10, 0.5); floorDark();
      flash(lt, 0.34, 0.6);
    } });

  // a10 · L(3) → "No": then he was gone - lamp gutters, empty spot where he stood, his shadow fades, ash falls
  cue(T10, 'whoosh', { gain: 0.5 }); cue(Wd('gone', 3), 'heartbeat', { gain: 0.7 }); cue(Wd('gone', 3) + 0.05, 'inhale', { gain: 0.3 });
  add({ id: 'a10', at: T10, cam: [540, 900], zoom: 0.16, note: 'GONE: empty floor spot where the prince stood; his shadow fades off the wall; lamp gutters; ash',
    draw(lt, d, t) {
      const g = 1 - 0.55 * seg(lt, 0.2, d), gut = g * (1 - 0.35 * Math.max(0, sin(t * 17) * sin(t * 7.3))), lx = 300, ly = 1060;
      bg(WALL());
      wallShadow(PRINCE_SIL(), 180, 860, 600, 1180, 1.12, lx, ly, 0.85 * (1 - seg(lt, 0.4, d * 0.9)));
      warm(lx, ly, 700 * gut, 0.3 * gut);
      // the empty spot: a faint ring of ash on the floor where he stood
      ctx.strokeStyle = 'rgba(233,223,207,0.45)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(600, 1190, 150, 22, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(600, 1190, 140, 18, 0, 0, TAU); ctx.fill();
      lampMask(lx + 140, 860, 760 * gut);
      smoke(lx, ly - 70, t, 6, '200,180,160', 0.18, 70, 600);
      oilLamp(lx - 44, ly, t, 1.1, gut);
      ash(t, 50, 11, 0.6, 1300);
      floorDark();
    } });

  // a11 · "No" → L(4): NO RECORD SAYS HOW - slab of strokes with a blank gap glowing red, a question mark in smoke
  cue(T11, 'whoosh', { gain: 0.5 }); cue(Wd('how', 3), 'bell', { gain: 0.4 }); cue(Wd('how', 3) + 0.1, 'heartbeat', { gain: 0.6 });
  const GAP = [4, 7, 2, 8];
  add({ id: 'a11', at: T11, cam: [540, 620], zoom: 0.18, note: 'NO RECORD SAYS HOW: slab of abstract strokes with a blank gap glowing red; smoke question mark',
    draw(lt, d, t) {
      const lx = lerp(860, 300, eio(clamp(lt / d))), ly = 1120, sx = 540, sy = 1190;
      bg(WALL(), -20 * lt);
      warm(lx, ly, 820, 0.3);
      blit(SLAB(GAP, 'g'), 380, 980, sx, sy, 1.0);
      blit(SLAB_GLOW(GAP, 'g'), 380, 980, sx, sy, 1.0, 0.25);
      // the gap: a pulsing blood-red frame where no strokes are
      const gx = sx - 380 + 110 + GAP[2] * 56 - 34, gy = sy - 980 + 170 + GAP[0] * 64 - 34, gw = (GAP[3] - GAP[2]) * 56 + 68, gh = (GAP[1] - GAP[0]) * 64 + 68;
      const pu = 0.6 + 0.4 * sin(t * 6), p = seg(lt, 0.2, 0.6);
      ctx.fillStyle = `rgba(176,18,27,${0.22 * p * pu})`; ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = `rgba(255,60,50,${0.9 * p})`; ctx.lineWidth = 5; ctx.setLineDash([22, 12]); ctx.lineDashOffset = -t * 40; ctx.strokeRect(gx, gy, gw, gh); ctx.setLineDash([]);
      lampMask(lerp(lx, 540, 0.5), 720, 900 * fl(t));
      // question mark in smoke, drifting up out of the gap
      const q = seg(lt, 0.5, 1.4);
      if (q > 0) { ctx.save(); ctx.globalAlpha = 0.55 * q; ctx.font = '700 300px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(233,223,207,${0.25})`; ctx.fillText('?', gx + gw / 2 + 8 * sin(t * 1.7 + i * 2), gy + gh / 2 - 40 * q + 6 * cos(t * 1.3 + i)); }
        ctx.restore(); smoke(gx + gw / 2, gy + gh / 2 + 60, t, 6, '220,200,180', 0.14 * q, 60, 380); }
      oilLamp(lx, ly, t, 1.1);
      tag('NO RECORD SAYS HOW', 540, 140, 48, seg(lt, 0.15, 0.5));
      ash(t, 26, 12, 0.45); floorDark();
      flash(lt, 0, 0.35);
    } });
  void TEND;
}
