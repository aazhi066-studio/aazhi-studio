// EPISODE 15 · worker C : "Lamplit Bronze & Red Thread", lines 7-9 (who sent them? / the stone names the hands / end)
//   c1  L7 -> "historians"   dark wall of hanging bronze suspect tokens; a swinging lamp finds the big ? token (heartbeat)
//   c2  "historians" -> "Others"  red thread draws from ? to the UTTAMA CHOLA token (crowned faceless figure); SOME HISTORIANS SUSPECT
//   c3  "Others" -> "and"    the thread trembles, goes slack and snaps on "proof"; NO PROOF
//   c4  "and" -> L8          a second thread to the PANDYA REVENGE? token (fish emblem); both threads tremble; DISPUTED
//   c5  L8 -> "It"           granite slab with abstract incised rows glowing red; hooded shadow hands on the wall below
//   c6  "It" -> L9           the lamp climbs to an empty head outline above the slab; the flame gutters and cannot light it; NEVER NAMED
//   c7  L9 -> "Now"          the whole wall: every token tied to the ?; WHO GAVE THE ORDER?
//   c8  "Now" -> end         push-in on THE crown turning in a pool of lamplight; AAZHI bronze plate + FOLLOW
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit } from './art.js';
import * as K from './core/kit.js';

// ───────────── palette ─────────────
const BODY = '#8A4B22', MID = '#B5692F', HI = '#F2B66B', DEEP = '#2A1206', WALL = '#140A06', VOID = '#070302', RED = '#B0121B', ASH = '#E9DFCF';

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

// ───────────── cached art ─────────────
const wallImg = () => cached('cWall', 1500, 2500, 0.5, () => {
  ctx.fillStyle = WALL; ctx.fillRect(0, 0, 1500, 2500);
  // laid stone courses, barely visible
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 6;
  for (let r = 0; r < 18; r++) {
    const y = r * 150; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1500, y); ctx.stroke();
    for (let c = 0; c < 6; c++) { const x = c * 280 + (r % 2) * 140 + rnd(r * 9 + c) * 30; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 150); ctx.stroke(); }
  }
  ctx.strokeStyle = 'rgba(90,50,25,0.18)'; ctx.lineWidth = 2;
  for (let r = 0; r < 18; r++) { ctx.beginPath(); ctx.moveTo(0, r * 150 + 4); ctx.lineTo(1500, r * 150 + 4); ctx.stroke(); }
  for (let i = 0; i < 1400; i++) { ctx.fillStyle = rnd(i) > 0.5 ? 'rgba(80,45,22,0.22)' : 'rgba(0,0,0,0.35)'; ctx.fillRect(rnd(i * 3.1) * 1500, rnd(i * 7.7) * 2500, 2 + rnd(i * 5) * 5, 2 + rnd(i * 2) * 4); }
  // floor line + floor (caption zone stays dark)
  const g = ctx.createLinearGradient(0, 1440, 0, 1560); g.addColorStop(0, 'rgba(7,3,2,0)'); g.addColorStop(1, VOID); ctx.fillStyle = g; ctx.fillRect(0, 1440, 1500, 120); ctx.fillStyle = VOID; ctx.fillRect(0, 1560, 1500, 1000);
});
// dark mask with a soft hole: logical 4000 x 4000, hole at centre
const maskImg = () => cached('cMask', 4000, 4000, 0.2, () => {
  const g = ctx.createRadialGradient(2000, 2000, 120, 2000, 2000, 640);
  g.addColorStop(0, 'rgba(7,3,2,0)'); g.addColorStop(0.45, 'rgba(7,3,2,0.35)'); g.addColorStop(0.8, 'rgba(7,3,2,0.82)'); g.addColorStop(1, 'rgba(7,3,2,0.96)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4000, 4000);
});
function lampMask(fx, fy, s, t) {
  const k = s * (1 + 0.035 * Math.sin(t * 13) + 0.02 * Math.sin(t * 29));
  blit(maskImg(), 2000, 2000, fx, fy, k);
  K.glow(fx, fy, 330 * s, '255,150,60', 0.22);
}
const bowlImg = () => cached('cBowl', 160, 80, 1, () => {
  ctx.beginPath(); ctx.ellipse(80, 22, 70, 46, 0, 0, Math.PI); ctx.closePath();
  const g = ctx.createLinearGradient(10, 0, 150, 0); g.addColorStop(0, DEEP); g.addColorStop(0.4, HI); g.addColorStop(0.7, MID); g.addColorStop(1, DEEP); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.ellipse(80, 22, 72, 12, 0, 0, TAU); ctx.fillStyle = HI; ctx.fill();
  ctx.beginPath(); ctx.ellipse(80, 22, 58, 7, 0, 0, TAU); ctx.fillStyle = DEEP; ctx.fill();
  ctx.beginPath(); ctx.moveTo(128, 18); ctx.lineTo(158, 10); ctx.lineTo(132, 30); ctx.closePath(); ctx.fillStyle = MID; ctx.fill();
});
/** hanging lamp: pivot far above, flame at (fx, fy) (spout) */
function hangLamp(fx, fy, t, s = 1, lit = 1) {
  ctx.strokeStyle = 'rgba(58,30,12,0.7)'; ctx.lineWidth = 2.5; ctx.beginPath();
  ctx.moveTo(fx - 80 * s, fy + 8 * s); ctx.lineTo(fx - 64 * s, fy - 900); ctx.moveTo(fx + 30 * s, fy + 8 * s); ctx.lineTo(fx - 64 * s, fy - 900); ctx.stroke();
  blit(bowlImg(), 150, 14, fx, fy + 4 * s, s);
  if (lit > 0) K.flame(fx, fy, 0.55 * s * lit, t, 3);
}
function tokenBase(r) {
  const c = 150;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(c, c, r, 0, TAU); ctx.fillStyle = BODY; ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(c - r, c - r, c + r, c + r); g.addColorStop(0, HI); g.addColorStop(0.35, MID); g.addColorStop(0.75, BODY); g.addColorStop(1, DEEP);
  ctx.beginPath(); ctx.arc(c, c, r, 0, TAU); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.arc(c, c, r * 0.82, 0, TAU); const g2 = ctx.createLinearGradient(c, c - r, c, c + r); g2.addColorStop(0, DEEP); g2.addColorStop(1, '#5A2E12'); ctx.fillStyle = g2; ctx.fill();
  ctx.strokeStyle = 'rgba(242,182,107,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c, c, r * 0.82, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.fillStyle = 'rgba(42,18,6,0.7)'; ctx.beginPath(); ctx.arc(c + Math.cos(a) * r * 0.91, c + Math.sin(a) * r * 0.91, 3, 0, TAU); ctx.fill(); }
  // hanging loop
  ctx.strokeStyle = MID; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(c, c - r - 10, 12, 0, TAU); ctx.stroke();
}
const bust = (cx, cy, k, heavy) => {
  const g = ctx.createLinearGradient(cx - 70 * k, 0, cx + 70 * k, 0); g.addColorStop(0, BODY); g.addColorStop(0.4, HI); g.addColorStop(1, BODY);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy + 82 * k, (heavy ? 78 : 62) * k, 46 * k, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillRect(cx - 14 * k, cy + 10 * k, 28 * k, 40 * k);
  ctx.beginPath(); ctx.ellipse(cx, cy, 30 * k, 38 * k, 0, 0, TAU); ctx.fill();
};
const tokenImg = (kind) => cached('cTok_' + kind, 300, 300, 1, () => {
  tokenBase(120); const c = 150;
  if (kind === 'q') {
    ctx.font = '700 190px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 10; ctx.strokeStyle = DEEP; ctx.strokeText('?', c, c + 10); ctx.fillStyle = RED; ctx.fillText('?', c, c + 10);
  } else if (kind === 'uttama') {
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, 98, 0, TAU); ctx.clip(); bust(c, c + 10, 1.05, true); ctx.restore();
    crown(c, c - 22, 0.36);
  } else if (kind === 'pandya') {
    const fish = (dir) => {
      ctx.save(); ctx.translate(c + dir * 26, c); ctx.rotate(dir * 0.08); ctx.scale(dir, 1);
      const g = ctx.createLinearGradient(-30, -70, 30, 70); g.addColorStop(0, HI); g.addColorStop(1, BODY); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, -78); ctx.bezierCurveTo(30, -40, 30, 30, 0, 52); ctx.bezierCurveTo(-30, 30, -30, -40, 0, -78); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 46); ctx.lineTo(-24, 80); ctx.lineTo(24, 80); ctx.closePath(); ctx.fill();
      ctx.fillStyle = DEEP; ctx.beginPath(); ctx.arc(-6, -50, 5, 0, TAU); ctx.fill(); ctx.restore();
    };
    fish(-1); fish(1);
  } else if (kind === 'hands') {
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, 98, 0, TAU); ctx.clip();
    ctx.fillStyle = '#C07A3C'; ctx.fillRect(0, 0, 300, 300);
    for (const [dx, k] of [[-52, 0.8], [52, 0.8], [0, 0.95]]) hood(c + dx, c + 110, k * 0.42, '#0B0503');
    ctx.restore();
  }
});
/** hooded faceless silhouette, feet at (x, y), height ~ 520*s */
function hood(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(-110, 0); ctx.bezierCurveTo(-120, -200, -100, -300, -70, -360); ctx.bezierCurveTo(-70, -430, -40, -500, 0, -520); ctx.bezierCurveTo(40, -500, 70, -430, 70, -360);
  ctx.bezierCurveTo(100, -300, 120, -200, 110, 0); ctx.closePath(); ctx.fill(); ctx.restore();
}
const hoodImg = () => cached('cHood', 300, 600, 0.6, () => { ctx.save(); ctx.shadowColor = '#000'; ctx.shadowBlur = 16; hood(150, 570, 1, 'rgba(2,1,0,0.92)'); ctx.restore(); });
const shadowDisc = () => cached('cShDisc', 340, 340, 0.5, () => { ctx.save(); ctx.shadowColor = '#000'; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.beginPath(); ctx.arc(170, 170, 124, 0, TAU); ctx.fill(); ctx.restore(); });

// stone slab with abstract incised rows (not letters); glow twin
const SL_W = 780, SL_H = 500, ROWS = 6;
function strokes(glow) {
  for (let r = 0; r < ROWS; r++) {
    let x = 70; const y = 90 + r * 66;
    let i = 0;
    while (x < SL_W - 70) {
      const k = r * 50 + i++, kind = Math.floor(rnd(k) * 5), w = 18 + rnd(k + 1) * 22;
      ctx.beginPath();
      if (kind === 0) { for (let j = 0; j < 3; j++) { ctx.moveTo(x + j * w / 2.5 + 3, y + (j % 2 ? -8 : 8)); ctx.arc(x + j * w / 2.5, y + (j % 2 ? -8 : 8), 3, 0, TAU); } }
      else if (kind === 1) { ctx.arc(x + w / 2, y + 4, w / 3, 0, Math.PI * 1.6); ctx.quadraticCurveTo(x + w * 0.9, y - 22, x + w, y - 10); }
      else if (kind === 2) { ctx.moveTo(x, y + 6); for (let j = 1; j <= 6; j++) ctx.lineTo(x + j * w / 6, y + (j % 2 ? -10 : 10)); }
      else if (kind === 3) { ctx.moveTo(x, y + 14); ctx.quadraticCurveTo(x + w * 0.2, y - 20, x + w * 0.5, y); ctx.quadraticCurveTo(x + w * 0.8, y + 20, x + w, y - 14); ctx.moveTo(x + w * 0.5, y - 20); ctx.lineTo(x + w * 0.62, y - 12); }
      else { ctx.ellipse(x + w * 0.35, y - 4, w * 0.3, 10, 0.6, 0, TAU); ctx.moveTo(x + w * 0.6, y + 4); ctx.quadraticCurveTo(x + w, y + 8, x + w * 0.85, y + 20); }
      if (glow) { ctx.strokeStyle = '#FF4A2E'; ctx.lineWidth = 6; ctx.stroke(); }
      else { ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = 6; ctx.stroke(); ctx.save(); ctx.translate(1.5, 2.5); ctx.strokeStyle = 'rgba(160,140,120,0.25)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
      x += w + 16 + rnd(k + 3) * 12;
    }
  }
}
const slabImg = () => cached('cSlab', SL_W, SL_H, 1, () => {
  ctx.save(); ctx.shadowColor = '#000'; ctx.shadowBlur = 30; ctx.fillStyle = '#2B2622'; ctx.beginPath(); ctx.roundRect(10, 10, SL_W - 20, SL_H - 20, 10); ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(0, 0, SL_W, SL_H); g.addColorStop(0, '#463E36'); g.addColorStop(0.5, '#2E2823'); g.addColorStop(1, '#1A1612'); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(10, 10, SL_W - 20, SL_H - 20, 10); ctx.fill();
  for (let i = 0; i < 1600; i++) { ctx.fillStyle = rnd(i * 1.3) > 0.5 ? 'rgba(200,190,175,0.10)' : 'rgba(0,0,0,0.3)'; ctx.fillRect(20 + rnd(i * 2.7) * (SL_W - 40), 20 + rnd(i * 4.1) * (SL_H - 40), 2, 2); }
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(34, 34, SL_W - 68, SL_H - 68, 6); ctx.stroke();
  strokes(false);
});
const slabGlow = () => cached('cSlabG', SL_W, SL_H, 1, () => { ctx.save(); ctx.shadowColor = '#FF2A10'; ctx.shadowBlur = 16; strokes(true); ctx.restore(); });

const plateImg = () => cached('cPlate', 460, 150, 1, () => {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 20; ctx.fillStyle = BODY; ctx.beginPath(); ctx.roundRect(20, 20, 420, 110, 14); ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(20, 20, 440, 130); g.addColorStop(0, HI); g.addColorStop(0.4, MID); g.addColorStop(1, '#4A240E'); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(20, 20, 420, 110, 14); ctx.fill();
  ctx.strokeStyle = DEEP; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(34, 34, 392, 82, 8); ctx.stroke();
  ctx.font = '700 72px Caladea'; ctx.letterSpacing = '18px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,220,160,0.5)'; ctx.fillText('AAZHI', 240, 80); ctx.fillStyle = DEEP; ctx.fillText('AAZHI', 238, 77); ctx.letterSpacing = '0px';
});

// ───────────── per-frame helpers ─────────────
function wall(ox = 0, oy = 0) { blit(wallImg(), 210, 290, ox, oy, 1); }
/** a hanging token: shadow on wall away from the flame, the medallion, rim light toward the flame */
function token(kind, x, y, s, f, t, lit = 1) {
  const dx = x - f[0], dy = y - f[1], d = Math.hypot(dx, dy) || 1;
  blit(shadowDisc(), 170, 170, x + dx * 0.16, y + dy * 0.16 + 14, s * (1 + d * 0.0004), 0.6);
  // string to a pin above
  ctx.strokeStyle = '#3A1E0C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 130 * s); ctx.lineTo(x, y - 175 * s); ctx.stroke();
  pin(x, y - 175 * s);
  const sw = Math.sin(t * 1.7 + x * 0.01) * 0.04;
  ctx.save(); ctx.translate(x, y - 130 * s); ctx.rotate(sw); ctx.translate(-x, -(y - 130 * s));
  if (kind === 'blank') {
    ctx.strokeStyle = 'rgba(233,223,207,0.45)'; ctx.lineWidth = 4; ctx.setLineDash([14, 12]);
    ctx.beginPath(); ctx.arc(x, y, 120 * s, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y - 20 * s, 34 * s, 44 * s, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y + 80 * s, 72 * s, 40 * s, 0, Math.PI, 0); ctx.stroke(); ctx.setLineDash([]);
  } else {
    blit(tokenImg(kind), 150, 150, x, y, s, lit);
    const a = Math.atan2(-dy, -dx), near = clamp(1 - d / 900) * lit;
    if (near > 0) { ctx.strokeStyle = `rgba(255,214,150,${0.85 * near})`; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(x, y, 118 * s, a - 0.8, a + 0.8); ctx.stroke(); }
  }
  ctx.restore();
}
function pin(x, y) { ctx.fillStyle = '#5A2E12'; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); ctx.fillStyle = HI; ctx.beginPath(); ctx.arc(x - 2, y - 2, 4, 0, TAU); ctx.fill(); }
/** red thread a -> b sagging by sag, drawn to progress p; wob = tremble amount */
function thread(a, b, p, sag, t, wob = 0, alpha = 1) {
  if (p <= 0) return;
  const mx = (a[0] + b[0]) / 2 + Math.sin(t * 31) * wob, my = (a[1] + b[1]) / 2 + sag + Math.sin(t * 27 + 1) * wob;
  const n = 28, m = Math.max(1, Math.round(n * p));
  ctx.beginPath();
  for (let i = 0; i <= m; i++) { const s = (i / m) * p, q = 1 - s; const x = q * q * a[0] + 2 * q * s * mx + s * s * b[0], y = q * q * a[1] + 2 * q * s * my + s * s * b[1]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.lineCap = 'round'; ctx.strokeStyle = `rgba(0,0,0,${0.5 * alpha})`; ctx.lineWidth = 7; ctx.save(); ctx.translate(6, 14); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = `rgba(176,18,27,${alpha})`; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = `rgba(255,110,90,${0.35 * alpha})`; ctx.lineWidth = 1.5; ctx.stroke();
}
/** a snapped thread end hanging from pin a, toward direction of b, length len */
function loose(a, b, len, t, ph) {
  const dir = Math.sign(b[0] - a[0]) || 1, sw = Math.sin(t * 4 + ph) * 18;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(a[0] + dir * len * 0.35, a[1] + len * 0.4, a[0] + dir * len * 0.12 + sw, a[1] + len);
  ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
}
/** ash-white caps on a thin blood-red bar, popping in with p */
function bar(text, x, y, size, p, rot = 0) {
  if (p <= 0) return;
  ctx.save(); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.12)}px`;
  const w = ctx.measureText(text).width + size * 1.1, k = eob(clamp(p));
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha = clamp(p * 3);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-w / 2 + 8, -size * 0.75 + 10, w, size * 1.5);
  ctx.fillStyle = RED; ctx.fillRect(-w / 2, -size * 0.75, w, size * 1.5);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-w / 2, size * 0.55, w, size * 0.2);
  ctx.fillStyle = ASH; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, size * 0.06, size * 0.06);
  ctx.restore(); ctx.letterSpacing = '0px';
}
/** engraved bronze nameplate */
function nameplate(text, x, y, size, p) {
  if (p <= 0) return;
  ctx.save(); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.14)}px`;
  const w = ctx.measureText(text).width + size * 1.2, h = size * 1.55;
  ctx.globalAlpha = clamp(p * 2); ctx.translate(x, y + (1 - eo(clamp(p))) * 30);
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, HI); g.addColorStop(0.45, MID); g.addColorStop(1, '#4A240E');
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 10, w, h);
  ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = DEEP; ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(255,225,170,0.45)'; ctx.fillText(text, 1.5, 3.5); ctx.fillStyle = DEEP; ctx.fillText(text, 0, 2);
  ctx.restore(); ctx.letterSpacing = '0px';
}
function ash(t, n = 34, seed = 0) {
  for (let i = 0; i < n; i++) {
    const sp = 22 + rnd(i + seed) * 40, y = ((rnd(i * 3 + seed) * 1500 + t * sp) % 1500) - 100;
    const x = rnd(i * 7 + seed) * W + Math.sin(t * 0.7 + i) * 40, r = 1.5 + rnd(i + 9) * 3;
    ctx.fillStyle = `rgba(233,223,207,${0.18 + 0.3 * rnd(i * 5)})`; ctx.fillRect(x, y, r, r);
  }
}
function smokeRibbon(x, y, t, h = 360) {
  ctx.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24, yy = y - u * h, xx = x + Math.sin(u * 7 - t * 2.2) * 26 * u; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
  ctx.strokeStyle = 'rgba(233,223,207,0.10)'; ctx.lineWidth = 10; ctx.stroke(); ctx.strokeStyle = 'rgba(233,223,207,0.08)'; ctx.lineWidth = 3; ctx.stroke();
}
/** keep the caption band dark */
function floorBand() {
  const g = ctx.createLinearGradient(0, 1250, 0, 1360); g.addColorStop(0, 'rgba(7,3,2,0)'); g.addColorStop(1, 'rgba(7,3,2,0.9)');
  ctx.fillStyle = g; ctx.fillRect(-300, 1250, W + 600, 110); ctx.fillStyle = 'rgba(7,3,2,0.9)'; ctx.fillRect(-300, 1360, W + 600, 900);
}
function redFlash(lt, a = 0.6) { const k = clamp(1 - lt / 0.12); if (k > 0) { ctx.fillStyle = `rgba(176,18,27,${a * k})`; ctx.fillRect(-300, -300, W + 600, H + 600); } }

// ───────────── wall layout (shared by c1-c4) ─────────────
const QP = [540, 600], UP = [250, 1010], PP = [830, 1010];
const pinOf = (p, s) => [p[0], p[1] - 112 * s];   // where a thread is tied: top of the token rim

export function buildC(add, cue) {
  const tEnd = T.dur;
  const t1 = L(7), t2 = Wd('historians', 7), t3 = Wd('Others', 7), t4 = Wd('and', 7), t5 = L(8), t6 = Wd('It', 8), t7 = L(9), t8 = Wd('Now', 9);

  // c1 · "So who sent them?" lamp swings in, finds the ? token
  add({
    id: 'c1', at: t1, cam: [540, 700], zoom: 0.09, note: 'suspect wall, lamp swings to the ? token',
    draw(lt, d, t) {
      const pan = lerp(-40, 30, eio(clamp(lt / d)));
      ctx.save(); ctx.translate(pan, 0);
      const sw = Math.sin(lt * 2.4 - 1.3) * lerp(1, 0.4, clamp(lt / d));
      const f = [540 + sw * 300, 840 + Math.abs(sw) * -60];
      wall();
      token('uttama', UP[0], UP[1], 0.9, f, t, 0.8); token('pandya', PP[0], PP[1], 0.9, f, t, 0.8);
      const beat = Math.max(0, Math.sin((t - t1) * TAU * 1.25)) ** 6;
      token('q', QP[0], QP[1], 1.4 + beat * 0.04, f, t);
      lampMask(f[0], f[1], 1.05, t);
      K.glow(QP[0], QP[1], 260, '176,18,27', 0.18 + 0.25 * beat);
      hangLamp(f[0], f[1], t); smokeRibbon(f[0], f[1] - 60, t);
      ash(t); floorBand(); ctx.restore();
    },
  });
  cue(t1, 'whoosh', { gain: 0.6 }); cue(t1 + 0.05, 'heartbeat', { gain: 0.8, dur: t2 - t1 });

  // c2 · thread draws from ? to UTTAMA CHOLA
  const zip2 = t2 + 0.25;
  add({
    id: 'c2', at: t2, cam: [420, 800], zoom: 0.1, note: 'red thread ? -> Uttama Chola token; SOME HISTORIANS SUSPECT',
    draw(lt, d, t) {
      ctx.save(); ctx.translate(lerp(30, 90, eio(clamp(lt / d))), lerp(0, -40, eio(clamp(lt / d))));
      const p = eio(seg(t, zip2, Wd('Uttama', 7) + 0.1));
      const f = [lerp(560, 330, eio(seg(t, t2, Wd('Uttama', 7) + 0.3))) + Math.sin(lt * 2) * 30, lerp(820, 760, p)];
      wall();
      token('pandya', PP[0], PP[1], 0.9, f, t, 0.7);
      thread(pinOf(QP, 1.4), pinOf(UP, 1.0), p, 70, t);
      token('q', QP[0], QP[1], 1.4, f, t);
      const hit = seg(t, Wd('Uttama', 7), Wd('Uttama', 7) + 0.3);
      token('uttama', UP[0], UP[1], 1.0 + 0.06 * eob(hit) - 0.06 * hit, f, t);
      lampMask(f[0], f[1], 1.15, t);
      K.glow(UP[0], UP[1], 240, '255,170,80', 0.25 * hit);
      hangLamp(f[0], f[1], t); ash(t, 30, 2);
      nameplate('UTTAMA CHOLA', UP[0] + 30, UP[1] + 160, 40, seg(t, Wd('Uttama', 7), Wd('Uttama', 7) + 0.35));
      floorBand();
      bar('SOME HISTORIANS SUSPECT', 540, 250, 50, seg(t, t2 + 0.05, t2 + 0.4));
      ctx.restore();
    },
  });
  cue(t2, 'whoosh', { gain: 0.5 }); cue(zip2, 'zip', { gain: 0.7, dur: 0.8 }); cue(Wd('Uttama', 7), 'tock', { gain: 0.6 });

  // c3 · "Others say there is no proof" thread trembles, sags, snaps
  const tSnap = Wd('proof', 7);
  add({
    id: 'c3', at: t3, cam: [420, 820], zoom: 0.08, note: 'thread trembles and snaps; NO PROOF',
    draw(lt, d, t) {
      ctx.save(); ctx.translate(lerp(90, 60, eio(clamp(lt / d))), -40 + Math.sin(lt * 1.5) * 8);
      const f = [330 + Math.sin(lt * 1.8) * 80, 760 - 30 * Math.sin(lt * 1.1)];
      wall();
      token('pandya', PP[0], PP[1], 0.9, f, t, 0.7);
      const a = pinOf(QP, 1.4), b = pinOf(UP, 1.0);
      if (t < tSnap) thread(a, b, 1, lerp(70, 150, eio(seg(t, t3, tSnap))), t, 3 + 9 * seg(t, t3, tSnap));
      else { const k = eo(seg(t, tSnap, tSnap + 0.5)); loose(a, b, lerp(150, 260, k), t, 0); loose(b, a, lerp(120, 200, k), t, 2); }
      token('q', QP[0], QP[1], 1.4, f, t);
      const drop = t > tSnap ? eo(seg(t, tSnap, tSnap + 0.4)) : 0;
      token('uttama', UP[0], UP[1] + drop * 14, 1.0, f, t, 1 - 0.35 * drop);
      lampMask(f[0], f[1], 1.1 - 0.1 * drop, t);
      hangLamp(f[0], f[1], t);
      if (t > tSnap) { const s = seg(t, tSnap, tSnap + 0.25); for (let i = 0; i < 10; i++) { const an = i / 10 * TAU; ctx.fillStyle = `rgba(255,190,120,${1 - s})`; ctx.fillRect((a[0] + b[0]) / 2 + Math.cos(an) * s * 90, (a[1] + b[1]) / 2 + 70 + Math.sin(an) * s * 90, 5, 5); } }
      ash(t, 30, 3);
      nameplate('UTTAMA CHOLA', UP[0] + 30, UP[1] + 160 + drop * 14, 40, 1);
      floorBand();
      bar('NO PROOF', 540, 250, 64, seg(t, Wd('no', 7) - 0.05, Wd('no', 7) + 0.25), -0.04);
      ctx.restore();
    },
  });
  cue(t3, 'whoosh', { gain: 0.45 }); cue(tSnap, 'pop', { gain: 0.9 }); cue(Wd('no', 7), 'thud', { gain: 0.6 });

  // c4 · "and point to Pandya revenge" second thread; both tremble; DISPUTED
  const zip4 = t4 + 0.15, tPand = Wd('Pandya', 7), tDisp = Wd('revenge', 7) + 0.45;
  add({
    id: 'c4', at: t4, cam: [600, 820], zoom: 0.07, note: 'thread to Pandya token; then both threads tremble; DISPUTED',
    draw(lt, d, t) {
      const u = eio(clamp(lt / d));
      ctx.save(); ctx.translate(lerp(-70, 0, u), lerp(-40, -10, u));
      const f = [lerp(600, 760, eio(seg(t, t4, tPand + 0.3))) - 260 * eio(seg(t, tDisp - 0.3, tDisp + 0.6)) + Math.sin(lt * 2.3) * 40, 780 + Math.sin(lt * 1.4) * 30];
      wall();
      const a = pinOf(QP, 1.4), bu = pinOf(UP, 1.0), bp = pinOf(PP, 1.0);
      const dsp = seg(t, tDisp - 0.4, tDisp), wob = dsp * 7;
      // the broken Uttama thread is re-tied for the dispute
      if (dsp > 0) thread(a, bu, eio(dsp), 80, t, wob); else { loose(a, bu, 260, t, 0); loose(bu, a, 200, t, 2); }
      thread(a, bp, eio(seg(t, zip4, tPand + 0.15)), 80, t, wob);
      token('uttama', UP[0], UP[1], 1.0, f, t, 0.75 + 0.25 * dsp);
      token('q', QP[0], QP[1], 1.4 + Math.sin(t * 40) * 0.006 * dsp, f, t);
      const hit = seg(t, tPand, tPand + 0.3);
      token('pandya', PP[0], PP[1], 1.0 + 0.06 * eob(hit) - 0.06 * hit, f, t);
      lampMask(f[0], f[1], 1.2 + 0.2 * dsp, t);
      hangLamp(f[0], f[1], t); ash(t, 30, 4);
      nameplate('UTTAMA CHOLA', UP[0] + 30, UP[1] + 160, 40, dsp);
      nameplate('PANDYA REVENGE?', PP[0] - 50, PP[1] + 160, 40, seg(t, tPand, tPand + 0.35));
      floorBand();
      bar('DISPUTED', 540, 250, 72, seg(t, tDisp, tDisp + 0.3), 0.03);
      ctx.restore();
    },
  });
  cue(t4, 'whoosh', { gain: 0.45 }); cue(zip4, 'zip', { gain: 0.7, dur: 0.8 }); cue(tPand, 'tock', { gain: 0.6 });
  cue(tDisp, 'slam', { gain: 0.7 }); cue(tDisp + 0.05, 'heartbeat', { gain: 0.6, dur: t5 - tDisp });

  // c5 · "The stone names the hands" slab rows glow red; hooded shadows on the wall
  const tNames = Wd('names', 8), tHands = Wd('hands', 8);
  const SX = 540, SY = 640;
  function slabScene(t, f, glowK, hoodA) {
    wall(0, 0);
    K.glow(f[0], f[1] - 40, 650, '255,150,70', 0.3);
    // hooded shadows cast on the wall beneath the slab, skewing away from the flame
    for (let i = 0; i < 4; i++) {
      const hx = 230 + i * 205, sk = (hx - f[0]) * 0.0016, slide = (hx - f[0]) * 0.18;
      ctx.save(); ctx.translate(hx + slide, 1250); ctx.transform(1, 0, -sk, 1, 0, 0);
      blit(hoodImg(), 150, 570, 0, 0, 0.62 + 0.04 * Math.sin(t * 1.3 + i), hoodA * (0.75 + 0.25 * rnd(i)), 0.62 + clamp(1 - Math.abs(hx - f[0]) / 900) * 0.18);
      ctx.restore();
    }
    blit(slabImg(), SL_W / 2, SL_H / 2, SX, SY, 1);
    const gl = slabGlow(), q = gl._q;
    for (let r = 0; r < ROWS; r++) {
      const a = clamp(glowK * ROWS - r); if (a <= 0) continue;
      const y0 = 90 + r * 66 - 33, fl = 0.85 + 0.15 * Math.sin(t * 9 + r);
      ctx.globalAlpha = a * fl; ctx.drawImage(gl, 0, y0 * q, SL_W * q, 66 * q, SX - SL_W / 2, SY - SL_H / 2 + y0, SL_W, 66); ctx.globalAlpha = 1;
    }
  }
  add({
    id: 'c5', at: t5, cam: [540, 760], zoom: 0.08, note: 'inscription slab glows red row by row; hooded shadow hands below',
    draw(lt, d, t) {
      const u = eio(clamp(lt / d));
      ctx.save(); ctx.translate(0, lerp(40, -10, u));
      const f = [lerp(170, 900, u), 1000 + Math.sin(lt * 2.2) * 30];
      const g = eio(seg(t, tNames - 0.1, tHands + 0.3));
      slabScene(t, f, g, 0.4 + 0.6 * seg(t, tHands - 0.2, tHands + 0.2));
      lampMask(f[0], f[1], 1.45, t);
      K.glow(SX, SY, 460, '176,18,27', 0.28 * g);
      hangLamp(f[0], f[1], t); ash(t, 26, 5);
      floorBand();
      bar('THE HANDS: NAMED', 540, 190, 50, seg(t, tHands, tHands + 0.3));
      ctx.restore();
    },
  });
  cue(t5, 'whoosh', { gain: 0.5 }); cue(tNames, 'chisel', { gain: 0.6, dur: 0.6 }); cue(tHands, 'thud', { gain: 0.6 });

  // c6 · "It never names the mind" camera climbs to an empty head the flame cannot light
  const tMind = Wd('mind', 8);
  add({
    id: 'c6', at: t6, cam: [540, 700], zoom: 0.1, note: 'lamp climbs to an empty unlit head outline above the slab; NEVER NAMED',
    draw(lt, d, t) {
      const u = eio(seg(lt, 0, d * 0.75));
      ctx.save(); ctx.translate(0, lerp(-10, 700, u));
      const MY = SY - 820;                  // the mind sits high above the slab
      const f = [lerp(880, 690, u) + Math.sin(lt * 3) * 14, lerp(940, MY + 120, u)];
      slabScene(t, f, 1, 1);
      // empty dark space: the head outline stays black even as the lamp arrives
      const gut = seg(lt, d * 0.45, d);                       // flame gutters near it
      const lit = 1 - 0.55 * gut * (0.6 + 0.4 * Math.abs(Math.sin(t * 17)));
      lampMask(f[0], f[1], lerp(1.4, 0.75, u) * (0.6 + 0.4 * lit), t);
      ctx.fillStyle = VOID; ctx.beginPath(); ctx.ellipse(540, MY - 30, 120, 150, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(540, MY + 230, 260, 150, 0, Math.PI, 0); ctx.fill();
      ctx.setLineDash([16, 14]); ctx.lineDashOffset = -t * 20; ctx.strokeStyle = `rgba(233,223,207,${0.22 + 0.1 * Math.sin(t * 3)})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(540, MY - 30, 120, 150, 0, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(540, MY + 230, 260, 150, 0, Math.PI, 0); ctx.stroke(); ctx.setLineDash([]);
      hangLamp(f[0], f[1], t, 1, lit); smokeRibbon(f[0], f[1] - 50, t, 300);
      ash(t, 26, 6);
      ctx.restore();
      bar('NEVER NAMED', 540, 1150, 60, seg(t, tMind, tMind + 0.3), -0.03);
      floorBand();
    },
  });
  cue(t6, 'whoosh', { gain: 0.45 }); cue(Wd('never', 8), 'swell', { gain: 0.5, dur: 1.2 }); cue(tMind, 'tock', { gain: 0.7 });

  // c7 · "Who do you think gave the order?" every thread on the wall
  const Q7 = [540, 700], U7 = [215, 1000], P7 = [865, 1000], M7 = [540, 360], H7 = [540, 1110];
  add({
    id: 'c7', at: t7, cam: [540, 760], zoom: 0.11, note: 'all suspect tokens tied to the ?; WHO GAVE THE ORDER?',
    draw(lt, d, t) {
      const u = eio(clamp(lt / d));
      ctx.save(); ctx.translate(lerp(20, -20, u), 0);
      const sw = Math.sin(lt * 2.6 + 0.6);
      const f = [540 + sw * 330, 760 + Math.cos(lt * 2.6) * 60];
      wall();
      const a = [Q7[0], Q7[1]];
      const tags = [[U7, 0.85], [P7, 0.85], [M7, 0.75], [H7, 0.7]];
      tags.forEach(([p, s], i) => thread(a, [p[0], p[1]], eio(seg(lt, 0.05 + i * 0.12, 0.45 + i * 0.12)), 50, t + i, 3));
      token('blank', M7[0], M7[1], 0.75, f, t);
      token('uttama', U7[0], U7[1], 0.85, f, t); token('pandya', P7[0], P7[1], 0.85, f, t); token('hands', H7[0], H7[1], 0.7, f, t);
      const beat = Math.max(0, Math.sin(lt * TAU * 1.3)) ** 6;
      token('q', Q7[0], Q7[1], 1.05 + beat * 0.05, f, t); pin(a[0], a[1]);
      lampMask(f[0], f[1], 1.5, t);
      K.glow(Q7[0], Q7[1], 240, '176,18,27', 0.15 + 0.3 * beat);
      hangLamp(f[0], f[1], t); ash(t, 30, 7);
      floorBand();
      bar('WHO GAVE THE ORDER?', 540, 190, 58, seg(lt, 0.1, 0.45));
      ctx.restore();
    },
  });
  cue(t7, 'whoosh', { gain: 0.55 }); cue(t7 + 0.1, 'zip', { gain: 0.5, dur: 0.6 }); cue(t7 + 0.1, 'heartbeat', { gain: 0.85, dur: t8 - t7 });

  // c8 · "Now watch who wore the crown next" THE crown turning in a pool of light; AAZHI + FOLLOW
  const tCrown = Wd('crown', 9);
  add({
    id: 'c8', at: t8, cam: [540, 760], zoom: 0.16, note: 'THE crown turning in lamplight; AAZHI plate + FOLLOW to the end',
    draw(lt, d, t) {
      wall(0, 0);
      ctx.fillStyle = 'rgba(7,3,2,0.5)'; ctx.fillRect(-300, -300, W + 600, H + 600);
      const f = [300 + Math.sin(lt * 0.9) * 40, 1000 + Math.sin(lt * 1.7) * 12];
      const g = seg(t, tCrown - 0.15, tCrown + 0.5);
      // plinth
      ctx.fillStyle = '#1E0F07'; ctx.fillRect(330, 1000, 420, 60); ctx.fillStyle = '#3A1E0C'; ctx.fillRect(330, 1000, 420, 8);
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.ellipse(540 + (540 - f[0]) * 0.3, 1000, 200, 18, 0, 0, TAU); ctx.fill();
      const lamp = 0.9 + 0.1 * Math.sin(t * 11) * Math.sin(t * 5.3);
      lampMask(f[0], f[1] - 150, 1.45 * lamp, t);
      K.glow(540, 820, 520, '255,170,80', (0.2 + 0.25 * g) * lamp);
      // the crown slowly turns (pseudo 3D) and rises a touch
      const turn = Math.cos(lt * 1.3), sx = 0.82 + 0.18 * Math.abs(turn);
      ctx.save(); ctx.translate(540, 1000 - 6 * Math.sin(lt * 1.6)); ctx.scale(turn >= 0 ? sx : -sx, 1);
      crown(0, 0, 2.3, 0, 0.3 + 0.7 * g * (0.8 + 0.2 * Math.sin(t * 6)));
      ctx.restore();
      if (g > 0) K.glow(540, 1000 - 195 * 2.3, 120, '255,217,160', 0.6 * g);
      hangLamp(f[0], f[1], t, 0.9, lamp); smokeRibbon(f[0], f[1] - 50, t, 380);
      ash(t, 40, 8);
      blit(plateImg(), 230, 75, 540, 1140, 0.8, seg(t, tCrown + 0.25, tCrown + 0.6));
      floorBand();
      bar('FOLLOW', 540, 1240, 46, seg(t, tCrown + 0.5, tCrown + 0.8));
    },
  });
  cue(t8, 'whoosh', { gain: 0.5 }); cue(t8 + 0.05, 'rumble', { gain: 0.4, dur: tEnd - t8 }); cue(tCrown, 'bell', { gain: 0.9 });
}
