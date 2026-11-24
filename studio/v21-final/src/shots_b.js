// EPISODE 21 · worker B : "Gold Leaf & Sonar", lines 4-7 (L(4) -> L(8)).
//   b1  A GRIEVING KING: faceless crowned seated gold-leaf king, head bowed, leaf-lays in; a tiny boat drifts off on the horizon (ILLUSTRATION)
//   b2  INDRA'S FESTIVAL: vermilion/gold pennants on a rope, five standing lamps go dark one by one; JUST ONCE on the last lamp, flake burst
//   b3  THE WARNING: the sea goddess, a tall wave-curl figure with a crown (no face), cyan glowing outline, rises out of the waterline
//   b4  MISS IT / PUHAR DROWNS: a huge gold wave curl looms over the gold harbour city; on "drowns" it lunges, flakes burst
//   b5  the waves take the city: WATERLINE WIPE climbs over the gold city, below it the city is sonar dots; flake bursts at towers
//   b6  LEGEND slams above the water, flakes drop into the sea and ping; the drowned city is swept by sonar below
//   b7  RECORD: the waterline wipes off the top; sonar screen, bathymetry, depth gauge, sweep
//   b8  1980s counts up; DIVERS: green sonar-dot diver outlines with tanks descend, bubbles, gauge follows
//   b9  STONE STRUCTURES: the sweep builds blocky walls / rectangles / a U-shape out of returns; OFF PUHAR; depth gauge
// "THE POEM SAYS" tag stays up through b1-b6 (lines 4-6). Heavy art is baked once with cached(); per frame only blits,
// a few strokes and dots. No shadowBlur outside the one-time bakes.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { cached, blit, poly, dust } from './art.js';
import * as K from './core/kit.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;

// ───────────── shared helpers (copied exactly from ART.md) ─────────────
// indigo lacquer ground (cached)
function lacquerImg(key = 'lacq21') {
  return cached(key, W, H, 1, () => { const c = ctx;
    const g = c.createRadialGradient(540, 760, 120, 540, 960, 1300); g.addColorStop(0, '#1A2358'); g.addColorStop(0.55, '#10173E'); g.addColorStop(1, '#05071A');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(160,170,255,0.05)'; c.lineWidth = 1;
    for (let i = 0; i < 160; i++) { let x = rnd(i) * W, y = rnd(i + 7) * H; c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (rnd(i * 9 + k) - 0.5) * 90; y += (rnd(i * 5 + k + 3) - 0.5) * 90; c.lineTo(x, y); } c.stroke(); }
    const v = c.createRadialGradient(540, 900, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  });
}
// sonar screen ground (cached): dark green + scanlines + faint grid rings around (540, 1250)
function sonarImg(key = 'sonar21') {
  return cached(key, W, H, 1, () => { const c = ctx;
    const g = c.createRadialGradient(540, 1000, 100, 540, 1000, 1300); g.addColorStop(0, '#08201A'); g.addColorStop(1, '#010604'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(65,255,154,0.08)'; c.lineWidth = 2; for (let r = 150; r < 1500; r += 150) { c.beginPath(); c.arc(540, 1250, r, 0, TAU); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 2);
  });
}
// gold-leaf fill for the current path (call after building a path): gradient + loose seam grid clipped to the path
function goldFill(x0, y0, x1, y1, seam = 26) { const c = ctx;
  const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#A8792B'); g.addColorStop(0.35, '#E9C46A'); g.addColorStop(0.55, '#F7E2A0'); g.addColorStop(1, '#B88A35');
  c.fillStyle = g; c.fill(); c.save(); c.clip(); c.strokeStyle = 'rgba(110,70,20,0.28)'; c.lineWidth = 1;
  for (let x = Math.floor(x0 / seam) * seam; x < x1; x += seam) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x + 3, y1); c.stroke(); }
  for (let y = Math.floor(y0 / seam) * seam; y < y1; y += seam) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y + 2); c.stroke(); }
  c.restore(); }
// the waterline at height y: fills below with col (alpha a) and strokes the crest; t = film time
function waterline(y, t, col = '6,20,40', a = 0.85, tilt = 0) { const c = ctx;
  c.beginPath(); c.moveTo(-60, H + 60);
  for (let x = -60; x <= W + 60; x += 20) c.lineTo(x, y + tilt * (x - 540) + Math.sin(x * 0.011 + t * 2.1) * 14 + Math.sin(x * 0.027 - t * 3.3) * 6);
  c.lineTo(W + 60, H + 60); c.closePath(); c.fillStyle = `rgba(${col},${a})`; c.fill();
  c.beginPath(); for (let x = -60; x <= W + 60; x += 20) { const yy = y + tilt * (x - 540) + Math.sin(x * 0.011 + t * 2.1) * 14 + Math.sin(x * 0.027 - t * 3.3) * 6; x < -50 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
  c.strokeStyle = 'rgba(207,246,255,0.9)'; c.lineWidth = 4; c.stroke(); }
// sonar sweep wedge from (x,y): angle ang (rad), radius r
function sweep(x, y, ang, r = 1400, a = 0.35) { const c = ctx; c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, ang - (k + 1) * 0.04, ang - k * 0.04); c.closePath(); c.fillStyle = `rgba(65,255,154,${a * (1 - k / 12) * 0.5})`; c.fill(); }
  c.restore(); }

// ───────────── worker-B helpers ─────────────
const SAFE = 1300;                                    // nothing busy below this (captions live at 1330-1760)
const wy = (x, y, t, tilt) => y + tilt * (x - 540) + sin(x * 0.011 + t * 2.1) * 14 + sin(x * 0.027 - t * 3.3) * 6;
function clipBelow(y, t, tilt = 0) { const c = ctx; c.beginPath(); c.moveTo(-60, H + 60); for (let x = -60; x <= W + 60; x += 20) c.lineTo(x, wy(x, y, t, tilt)); c.lineTo(W + 60, H + 60); c.closePath(); c.clip(); }
function clipAbove(y, t, tilt = 0) { const c = ctx; c.beginPath(); c.moveTo(-60, -60); for (let x = -60; x <= W + 60; x += 20) c.lineTo(x, wy(x, y, t, tilt)); c.lineTo(W + 60, -60); c.closePath(); c.clip(); }
function crest(y, t, tilt = 0, a = 1) { const c = ctx; c.beginPath(); for (let x = -60; x <= W + 60; x += 20) { const yy = wy(x, y, t, tilt); x < -50 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
  c.strokeStyle = `rgba(207,246,255,${0.18 * a})`; c.lineWidth = 16; c.stroke(); c.strokeStyle = `rgba(207,246,255,${0.9 * a})`; c.lineWidth = 4; c.stroke(); }
function sweepC(x, y, ang, r, a) { ctx.save(); ctx.beginPath(); ctx.rect(-100, -100, W + 200, SAFE + 100); ctx.clip(); sweep(x, y, ang, r, a); ctx.restore(); }

function bbox(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; }
function ellPts(cx, cy, rx, ry, rot = 0, n = 30) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, x = cos(a) * rx, y = sin(a) * ry; p.push([cx + x * cos(rot) - y * sin(rot), cy + x * sin(rot) + y * cos(rot)]); } return p; }
function quadPts(out, p0, c1, p1, n = 14) { for (let i = out.length ? 1 : 0; i <= n; i++) { const u = i / n; out.push([(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c1[0] + u * u * p1[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c1[1] + u * u * p1[1]]); } return out; }
// ribbon polygon around a centre polyline, width tapering w0 -> w1
function ribbon(cl, w0, w1) { const L1 = [], R1 = []; for (let i = 0; i < cl.length; i++) { const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (cl.length - 1)) / 2;
  L1.push([cl[i][0] - dy / l * w, cl[i][1] + dx / l * w]); R1.push([cl[i][0] + dy / l * w, cl[i][1] - dx / l * w]); } return L1.concat(R1.reverse()); }
// one beaten gold-leaf shape (bake only): gold fill + seams + dark outline + broken, chipped edge
function leaf(pts, seed = 1, pal = 'gold', seam = 26) { const c = ctx, [x0, y0, x1, y1] = bbox(pts);
  poly(pts); if (pal === 'red') vermFill(x0, y0, x1, y1); else goldFill(x0, y0, x1, y1, seam);
  poly(pts); c.strokeStyle = pal === 'red' ? 'rgba(60,10,4,0.7)' : 'rgba(70,40,10,0.65)'; c.lineWidth = 2.2; c.lineJoin = 'round'; c.stroke();
  c.save(); c.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], n = Math.floor(Math.hypot(b[0] - a[0], b[1] - a[1]) / 16);
    for (let k = 0; k < n; k++) { if (rnd(seed + i * 13 + k * 3) > 0.42) continue; const u = rnd(seed + i * 31 + k * 7), s = 3 + rnd(seed + i + k * 11) * 7;
      c.save(); c.translate(lerp(a[0], b[0], u), lerp(a[1], b[1], u)); c.rotate(rnd(seed + k + i * 5) * 1.5); c.fillRect(-s / 2, -s / 2, s, s); c.restore(); } }
  c.restore(); }
function vermFill(x0, y0, x1, y1) { const c = ctx; const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#8E2516'); g.addColorStop(0.45, '#D8432E'); g.addColorStop(0.6, '#EE7A5C'); g.addColorStop(1, '#A8301E');
  c.fillStyle = g; c.fill(); c.save(); c.clip(); c.strokeStyle = 'rgba(70,10,4,0.3)'; c.lineWidth = 1;
  for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x + 3, y1); c.stroke(); }
  for (let y = Math.floor(y0 / 24) * 24; y < y1; y += 24) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y + 2); c.stroke(); } c.restore(); }
function seamSpiral(cx, cy, r0, turns, dir = 1, col = 'rgba(90,55,15,0.55)', w = 3) { const c = ctx; c.beginPath();
  for (let a = 0; a <= turns * TAU; a += 0.15) { const r = r0 * (1 - a / (turns * TAU) * 0.85); const x = cx + cos(a * dir) * r, y = cy + sin(a * dir) * r; a ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); }

// blit a cached image centred on its own _cx/_cy
function put(img, x, y, s = 1, a = 1, rot = 0) { if (a <= 0) return; const c = ctx; c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(rot); c.scale(s, s); c.drawImage(img, -img._cx, -img._cy, img.width / img._q, img.height / img._q); c.restore(); }
function slam(img, x, y, k, s = 1) { if (k < 0) return; const e = clamp(k / 0.32); put(img, x, y, s * (1 + 0.55 * (1 - eob(e))), clamp(k / 0.1), (1 - eo(e)) * -0.04); }

// LEAF-LAY: the cached image arrives as square gold-leaf pieces that drop, rotate and settle (p = 0..1)
function leafLay(img, ox, oy, x, y, s, p, seed = 1, cell = 40) {
  if (p >= 1) { blit(img, ox, oy, x, y, s); return; } if (p <= 0) return;
  const c = ctx, q = img._q, w = img.width / q, h = img.height / q, nx = Math.ceil(w / cell), ny = Math.ceil(h / cell);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const d = (1 - j / ny) * 0.4 + (i / nx) * 0.15 + rnd(seed + i * 17 + j * 31) * 0.25, k = clamp((p - d * 0.85) / 0.3); if (k <= 0) continue; const e = eo(k);
    c.save(); c.globalAlpha *= Math.min(1, k * 2.5); c.translate(x + (i * cell - ox + cell / 2) * s, y + (j * cell - oy + cell / 2) * s - (1 - e) * 80 * s); c.rotate((1 - e) * (rnd(seed + i * 3 + j * 7) - 0.5) * 1.4);
    c.drawImage(img, i * cell * q, j * cell * q, cell * q, cell * q, -cell * s / 2, -cell * s / 2, cell * s + 0.7, cell * s + 0.7); c.restore(); }
}
// glint: a bright diagonal band that sweeps across the gold only (g = 0..1)
const SCR = {};
function glint(img, ox, oy, x, y, s, g, a = 0.75) {
  if (g <= 0 || g >= 1) return; const q = img._q, w = img.width, h = img.height, key = w + 'x' + h;
  let sc = SCR[key]; if (!sc) { sc = document.createElement('canvas'); sc.width = w; sc.height = h; SCR[key] = sc; }
  const c2 = sc.getContext('2d'); c2.globalCompositeOperation = 'source-over'; c2.clearRect(0, 0, w, h); c2.drawImage(img, 0, 0); c2.globalCompositeOperation = 'source-in';
  const bx = lerp(-h, w + h * 0.3, g), bw = Math.max(80, w * 0.12); const gr = c2.createLinearGradient(bx - bw, -bw * 0.5, bx + bw, bw * 0.5);
  gr.addColorStop(0, 'rgba(255,250,225,0)'); gr.addColorStop(0.5, `rgba(255,250,225,${a})`); gr.addColorStop(1, 'rgba(255,250,225,0)');
  c2.save(); c2.setTransform(1, 0.0, 0.9, 1, 0, 0); c2.fillStyle = gr; c2.fillRect(-h, 0, w + h * 2, h); c2.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(sc, x - ox * s, y - oy * s, w / q * s, h / q * s); ctx.restore();
}
// FLAKE BURST: gold flakes break off and tumble down with gravity, glinting (k = seconds since the burst)
function flakes(x, y, k, n = 30, seed = 1, spd = 520, spread = 2.4, grav = 900) {
  if (k < 0 || k > 2.4) return; const c = ctx;
  for (let i = 0; i < n; i++) { const a = -PI / 2 + (rnd(seed + i) - 0.5) * spread, v = spd * (0.3 + rnd(seed + i * 3) * 0.9), life = 1.1 + rnd(seed + i * 7) * 1.1;
    const al = clamp(1 - k / life); if (al <= 0) continue; const px = x + cos(a) * v * k * 0.8 + sin(k * 3 + i) * 12, py = y + sin(a) * v * k + grav * k * k * 0.5; if (py > SAFE) continue;
    const s = 6 + rnd(seed + i * 5) * 12, tum = cos(k * (5 + rnd(i) * 7) + i); c.save(); c.translate(px, py); c.rotate(k * (2 + rnd(seed + i * 9) * 5) + i); c.globalAlpha = al;
    c.fillStyle = tum > 0.75 ? '#FFF4C8' : tum > 0 ? '#E9C46A' : '#A8792B'; c.fillRect(-s / 2, -s * Math.abs(tum) / 2 - 1, s, s * Math.abs(tum) + 2); c.restore(); }
}
function ping(x, y, k, R = 320, col = '65,255,154', w = 3) { if (k < 0 || k > 1.4) return; const c = ctx;
  for (let j = 0; j < 2; j++) { const kk = k - j * 0.18; if (kk < 0) continue; const e = eo(clamp(kk / 1.2)); c.beginPath(); c.arc(x, y, 8 + e * R, 0, TAU); c.strokeStyle = `rgba(${col},${0.85 * (1 - e)})`; c.lineWidth = w; c.stroke(); } }

// ───────────── titles + tags (baked) ─────────────
function measure(txt, font, ls) { ctx.save(); ctx.font = font; ctx.letterSpacing = ls; const w = ctx.measureText(txt).width; ctx.restore(); return w; }
function goldTitle(txt, size = 110, pal = 'gold', maxW = 880) {
  let font = `900 ${size}px Inter`, ls = Math.round(size * 0.04) + 'px', tw = measure(txt, font, ls);
  if (tw > maxW) { size = Math.floor(size * maxW / tw); font = `900 ${size}px Inter`; ls = Math.round(size * 0.04) + 'px'; tw = measure(txt, font, ls); }
  const pw = Math.ceil(tw + size * 0.8), ph = Math.ceil(size * 1.7);
  const img = cached('bGT:' + pal + txt + size, pw, ph, 1, () => { const c = ctx; c.font = font; c.letterSpacing = ls; c.textAlign = 'center'; c.textBaseline = 'middle'; const x = pw / 2, y = ph / 2 + size * 0.04;
    c.fillStyle = 'rgba(2,3,14,0.75)'; c.fillText(txt, x + size * 0.05, y + size * 0.08);
    c.lineJoin = 'round'; c.lineWidth = size * 0.11; c.strokeStyle = pal === 'red' ? '#3A0C06' : '#2A1806'; c.strokeText(txt, x, y);
    const g = c.createLinearGradient(0, y - size * 0.5, 0, y + size * 0.5);
    if (pal === 'red') { g.addColorStop(0, '#F28A6A'); g.addColorStop(0.4, '#D8432E'); g.addColorStop(1, '#8E2516'); }
    else { g.addColorStop(0, '#F7E2A0'); g.addColorStop(0.35, '#E9C46A'); g.addColorStop(0.7, '#C99A45'); g.addColorStop(1, '#A8792B'); }
    c.fillStyle = g; c.fillText(txt, x, y);
    c.save(); c.globalCompositeOperation = 'source-atop'; c.strokeStyle = pal === 'red' ? 'rgba(70,10,4,0.4)' : 'rgba(100,60,15,0.4)'; c.lineWidth = 1.3; const sm = Math.max(14, size * 0.26);
    for (let xx = 0; xx < pw; xx += sm) { c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx + 4, ph); c.stroke(); } for (let yy = 0; yy < ph; yy += sm) { c.beginPath(); c.moveTo(0, yy); c.lineTo(pw, yy + 3); c.stroke(); }
    c.fillStyle = 'rgba(255,248,215,0.2)'; c.fillRect(0, y - size * 0.42, pw, size * 0.16); c.restore();
    c.save(); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < Math.floor(tw / 10); i++) { const s = 2 + rnd(i * 3 + size) * 4; c.save(); c.translate(pw / 2 - tw / 2 + rnd(i + size) * tw, y + (rnd(i * 7 + 1) - 0.5) * size * 0.75); c.rotate(rnd(i)); c.fillRect(-s / 2, -s / 2, s, s); c.restore(); } c.restore();
  });
  img._cx = pw / 2; img._cy = ph / 2; return img;
}
function sonarTitle(txt, size = 110, col = '65,255,154', maxW = 800) {
  let font = `900 ${size}px Inter`, ls = Math.round(size * 0.05) + 'px', tw = measure(txt, font, ls);
  if (tw > maxW) { size = Math.floor(size * maxW / tw); font = `900 ${size}px Inter`; ls = Math.round(size * 0.05) + 'px'; tw = measure(txt, font, ls); }
  const pw = Math.ceil(tw + size * 1.2), ph = Math.ceil(size * 2);
  const img = cached('bST:' + col + txt + size, pw, ph, 1, () => { const c = ctx; c.font = font; c.letterSpacing = ls; c.textAlign = 'center'; c.textBaseline = 'middle'; const x = pw / 2, y = ph / 2 + size * 0.04;
    c.shadowColor = `rgba(${col},0.85)`; c.shadowBlur = size * 0.35; c.fillStyle = `rgb(${col})`; c.fillText(txt, x, y); c.shadowBlur = 0; c.fillText(txt, x, y);
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = 'rgba(0,0,0,0.42)'; for (let yy = 0; yy < ph; yy += 6) c.fillRect(0, yy, pw, 2);
  });
  img._cx = pw / 2; img._cy = ph / 2; return img;
}
function tagImg(txt, kind = 'gold', size = 30) {
  const font = `900 ${size}px Inter`, ls = Math.round(size * 0.14) + 'px', tw = measure(txt, font, ls), pw = Math.ceil(tw + size * 1.8), ph = Math.ceil(size * 1.9);
  const img = cached('bTag:' + kind + txt + size, pw, ph, 1, () => { const c = ctx; const gold = kind === 'gold';
    c.beginPath(); c.roundRect(2, 2, pw - 4, ph - 4, ph * 0.22); c.fillStyle = gold ? 'rgba(5,7,26,0.82)' : 'rgba(1,10,6,0.85)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = gold ? '#C9A24E' : 'rgba(65,255,154,0.8)'; c.stroke();
    c.font = font; c.letterSpacing = ls; c.textAlign = 'center'; c.textBaseline = 'middle';
    const g = c.createLinearGradient(0, ph * 0.25, 0, ph * 0.75); g.addColorStop(0, gold ? '#F7E2A0' : '#9CFFC8'); g.addColorStop(1, gold ? '#C99A45' : '#41FF9A');
    c.fillStyle = g; c.fillText(txt, pw / 2 + size * 0.07, ph / 2 + size * 0.05);
  });
  img._cx = pw / 2; img._cy = ph / 2; return img;
}
const POEM_Y = 138;
function poemTag(t, a = 1) { put(tagImg('THE POEM SAYS'), 540, POEM_Y, 1, a * clamp((t - L(4)) / 0.25)); }

// ───────────── baked set pieces ─────────────
// seated grieving king, profile facing right, head bowed, hand at the brow; origin = base centre (300, 780)
const KING_OX = 300, KING_OY = 780;
function kingImg() {
  return cached('bKing', 700, 820, 1, () => { const c = ctx; c.translate(KING_OX, KING_OY);
    leaf([[-215, -34], [-215, -520], [-205, -548], [-188, -575], [-171, -548], [-160, -520], [-160, -34]], 11);           // throne back
    leaf(ellPts(-188, -590, 16, 16), 12);
    leaf([[100, -165], [128, -165], [128, -34], [100, -34]], 13);                                                          // seat leg
    leaf([[-215, -185], [140, -185], [140, -150], [-215, -150]], 14);                                                      // seat
    leaf([[-270, 0], [-258, -36], [348, -36], [360, 0]], 15, 'gold', 34);                                                  // dais
    leaf([[-150, -185], [-168, -300], [-152, -392], [-112, -440], [-50, -456], [8, -442], [48, -402], [66, -330], [58, -255], [150, -244], [178, -216],
      [172, -48], [228, -42], [232, -36], [132, -36], [130, -180], [-150, -180]], 16);                                       // body + legs
    c.strokeStyle = 'rgba(90,55,15,0.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-120, -330); c.quadraticCurveTo(-40, -300, 50, -260); c.stroke();   // sash seam
    c.beginPath(); c.moveTo(-110, -230); c.lineTo(130, -228); c.stroke();
    leaf([[-62, -425], [-22, -452], [154, -290], [150, -250], [122, -246]], 17);                                            // upper arm to the knee
    leaf(ellPts(80, -456, 46, 54, 0.5), 18);                                                                               // bowed blank head
    const cr = [[-42, -40], [-47, -84], [-29, -66], [-17, -110], [0, -74], [17, -110], [29, -66], [47, -84], [42, -40]].map(([x, y]) => { const a = 0.6; return [80 + x * cos(a) - y * sin(a), -456 + x * sin(a) + y * cos(a)]; });
    leaf(cr, 19);                                                                                                          // crown, tilted with the head
    leaf([[122, -258], [156, -270], [132, -430], [100, -424]], 20);                                                         // forearm up to the brow
    leaf(ellPts(118, -436, 22, 18, 0.4), 21);                                                                              // hand
  });
}
function boatImg() {
  return cached('bBoat', 120, 110, 1, () => { const c = ctx; c.translate(60, 92);
    leaf([[-50, -14], [50, -14], [36, 6], [-34, 6]], 31, 'gold', 14); leaf([[-2, -14], [2, -14], [2, -84], [-2, -84]], 32, 'gold', 14); leaf([[4, -80], [36, -24], [4, -24]], 33, 'gold', 14);
  });
}
// gold harbour city; origin = base (0, 600)
function cityImg() {
  return cached('bCity', W, 600, 1, () => { const c = ctx; let sd = 100;
    const tower = (cx, base, s) => { let y = base; const n = 6;
      for (let i = 0; i < n; i++) { const w0 = (320 - i * 36) * s, w1 = (320 - (i + 1) * 36) * s, h = 62 * s; leaf([[cx - w0 / 2, y], [cx - w1 / 2 - 6 * s, y - h], [cx + w1 / 2 + 6 * s, y - h], [cx + w0 / 2, y]], sd++); y -= h; }
      const vw = 160 * s, vh = 62 * s; const vp = []; for (let k = 0; k <= 16; k++) { const a = PI + k / 16 * PI; vp.push([cx + cos(a) * vw / 2, y + sin(a) * vh]); } leaf(vp, sd++);
      for (const fx of [-0.3, 0, 0.3]) leaf([[cx + fx * vw - 7 * s, y - vh * (fx ? 0.75 : 1)], [cx + fx * vw, y - vh * (fx ? 0.75 : 1) - 34 * s], [cx + fx * vw + 7 * s, y - vh * (fx ? 0.75 : 1)]], sd++);
      c.beginPath(); c.moveTo(cx - 34 * s, base); c.lineTo(cx - 34 * s, base - 80 * s); c.arc(cx, base - 80 * s, 34 * s, PI, 0); c.lineTo(cx + 34 * s, base); c.fillStyle = 'rgba(11,16,48,0.92)'; c.fill();
      for (let i = 1; i < 5; i++) { c.fillStyle = 'rgba(11,16,48,0.85)'; c.fillRect(cx - 9 * s, base - (62 * i + 22) * s - 62 * s * 0, 18 * s, 26 * s); } };
    const house = (x, base, w, h) => { leaf([[x, base], [x, base - h], [x + w, base - h], [x + w, base]], sd++); leaf([[x - 12, base - h + 2], [x + w / 2, base - h - 46], [x + w + 12, base - h + 2]], sd++);
      c.fillStyle = 'rgba(11,16,48,0.9)'; for (let k = 0; k < Math.floor(w / 50); k++) { c.beginPath(); c.roundRect(x + 16 + k * 50, base - 56, 26, 56, [13, 13, 0, 0]); c.fill(); } };
    const ship = (x, base, s) => { leaf([[x - 90 * s, base - 50 * s], [x - 120 * s, base - 95 * s], [x - 80 * s, base - 62 * s], [x + 80 * s, base - 62 * s], [x + 125 * s, base - 100 * s], [x + 95 * s, base - 50 * s], [x + 70 * s, base - 14 * s], [x - 64 * s, base - 14 * s]], sd++);
      leaf([[x - 4 * s, base - 62 * s], [x - 4 * s, base - 300 * s], [x + 4 * s, base - 300 * s], [x + 4 * s, base - 62 * s]], sd++);
      leaf([[x - 70 * s, base - 270 * s], [x + 74 * s, base - 270 * s], [x + 84 * s, base - 110 * s], [x - 80 * s, base - 110 * s]], sd++);
      c.strokeStyle = 'rgba(90,55,15,0.5)'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x - 72 * s - k * 2, base - (270 - k * 40) * s); c.lineTo(x + 76 * s + k * 2, base - (270 - k * 40) * s); c.stroke(); } };
    house(14, 560, 160, 130); tower(300, 560, 0.55); house(690, 560, 120, 96);
    tower(540, 560, 1);
    ship(870, 548, 0.95); ship(1030, 552, 0.78);
    leaf([[0, 600], [0, 560], [W, 560], [W, 600]], 7, 'gold', 30);                                                         // quay
  });
}
const CITY_OY = 600, CITY_TOP = 108;
// the same city re-drawn as sonar returns (dots sampled from the gold alpha)
function cityDots() {
  const src = cityImg();
  return cached('bCityDots', W, 600, 1, () => { const c = ctx, q = src._q, w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data;
    for (let y = 4; y < 600; y += 9) for (let x = 4; x < W; x += 9) { const a = d[((Math.floor(y * q)) * w + Math.floor(x * q)) * 4 + 3]; if (a < 110) continue;
      const edge = d[((Math.floor((y - 9) * q)) * w + Math.floor(x * q)) * 4 + 3] < 110 || d[((Math.floor(y * q)) * w + Math.floor((x + 9) * q)) * 4 + 3] < 110 || d[((Math.floor(y * q)) * w + Math.floor((x - 9) * q)) * 4 + 3] < 110;
      const jx = (rnd(x * 3 + y) - 0.5) * 3, jy = (rnd(x + y * 7) - 0.5) * 3;
      c.fillStyle = 'rgba(65,255,154,0.16)'; c.fillRect(x + jx - 4, y + jy - 4, 8, 8);
      c.fillStyle = edge ? 'rgba(190,255,215,0.95)' : `rgba(65,255,154,${0.45 + rnd(x + y) * 0.4})`; c.fillRect(x + jx - 1.6, y + jy - 1.6, edge ? 3.6 : 3, edge ? 3.6 : 3); }
  });
}
// gold wave curl breaking to the right; origin = base-left (0, 1000)
function wavePts() { const p = []; quadPts(p, [0, 1000], [80, 350], [380, 120]); quadPts(p, [380, 120], [560, 20], [700, 160]); quadPts(p, [700, 160], [770, 260], [690, 340]);
  quadPts(p, [690, 340], [640, 250], [560, 268]); quadPts(p, [560, 268], [510, 430], [620, 630]); quadPts(p, [620, 630], [720, 830], [900, 1000]); return p; }
function waveImg() {
  return cached('bWave', 900, 1010, 1, () => { const c = ctx; const p = wavePts(); leaf(p, 41, 'gold', 30);
    poly(p); c.save(); c.clip(); for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(20 + k * 60, 1000); c.quadraticCurveTo(100 + k * 55, 380 + k * 40, 380 + k * 10, 140 + k * 45); c.quadraticCurveTo(540 - k * 10, 90 + k * 40, 640 - k * 25, 200 + k * 22); c.strokeStyle = 'rgba(90,55,15,0.45)'; c.lineWidth = 4; c.stroke(); }
    seamSpiral(560, 200, 70, 1.6, 1, 'rgba(90,55,15,0.6)', 5); seamSpiral(300, 520, 90, 1.4, 1); seamSpiral(150, 820, 80, 1.3, 1); c.restore();
    c.beginPath(); for (let i = 0; i < 42; i++) i ? c.lineTo(p[i][0], p[i][1]) : c.moveTo(p[i][0], p[i][1]); c.strokeStyle = 'rgba(207,246,255,0.25)'; c.lineWidth = 18; c.stroke(); c.strokeStyle = 'rgba(207,246,255,0.95)'; c.lineWidth = 5; c.stroke();
    for (let i = 0; i < 40; i++) { const pt = p[14 + Math.floor(rnd(i) * 28)]; c.fillStyle = 'rgba(230,252,255,0.9)'; c.beginPath(); c.arc(pt[0] + (rnd(i + 3) - 0.5) * 30, pt[1] - rnd(i + 5) * 26, 2 + rnd(i + 9) * 4, 0, TAU); c.fill(); }
  });
}
// the sea goddess: tall wave-curl figure, crown, blank head, raised warning hand; origin = base centre (450, 1060)
const GOD_OX = 450, GOD_OY = 1060;
function goddessPolys() {
  const P = [];
  const hair = []; quadPts(hair, [-20, -880], [-210, -760], [-210, -520]); quadPts(hair, [-210, -520], [-215, -320], [-330, -170]); P.push(ribbon(hair, 54, 16));
  const veil = []; quadPts(veil, [30, -870], [190, -760], [170, -560]); quadPts(veil, [170, -560], [150, -420], [250, -330]); P.push(ribbon(veil, 34, 12));
  P.push([[-300, 0], [-230, -120], [-150, -300], [-96, -480], [-82, -600], [-122, -700], [-62, -742], [-24, -762], [24, -762], [62, -742], [122, -700], [82, -600], [96, -480], [150, -300], [230, -120], [300, 0]]);
  P.push([[-110, -700], [-172, -560], [-205, -430], [-172, -424], [-142, -552], [-88, -664]]);
  P.push([[100, -722], [215, -802], [238, -944], [274, -948], [262, -790], [130, -680]]);
  P.push(ellPts(256, -968, 22, 34, 0.1, 20));
  P.push(ellPts(0, -830, 52, 64, 0, 30));
  P.push([[-56, -878], [-62, -940], [-36, -908], [-20, -982], [0, -922], [20, -982], [36, -908], [62, -940], [56, -878]]);
  const base = [[-440, 10]]; for (let k = 0; k <= 44; k++) { const x = -440 + k * 20; base.push([x, -60 - 46 * Math.pow(Math.abs(sin(k * 0.5)), 1.5) - (k % 7 === 3 ? 30 : 0)]); } base.push([440, 10]); P.push(base);
  return P;
}
function goddessImg() {
  return cached('bGod', 900, 1100, 1, () => { const c = ctx; c.translate(GOD_OX, GOD_OY); const P = goddessPolys(); P.forEach((p, i) => leaf(p, 51 + i * 7, 'gold', 24));
    const g = P[2]; poly(g); c.save(); c.clip(); seamSpiral(-60, -200, 60, 1.6, 1); seamSpiral(70, -360, 46, 1.5, -1); seamSpiral(-20, -520, 34, 1.5, 1); seamSpiral(110, -110, 70, 1.5, -1);
    for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(-200 + k * 20, -60 - k * 60); c.quadraticCurveTo(0, -100 - k * 70, 200 - k * 20, -60 - k * 60); c.strokeStyle = 'rgba(90,55,15,0.35)'; c.lineWidth = 3; c.stroke(); } c.restore();
    poly(P[P.length - 1]); c.save(); c.clip(); for (let k = 0; k < 9; k++) seamSpiral(-400 + k * 100, -50, 34, 1.4, k % 2 ? 1 : -1); c.restore();
    c.fillStyle = 'rgba(11,16,48,0.9)'; c.beginPath(); c.ellipse(0, -878, 52, 6, 0, 0, TAU); c.fill();
  });
}
function goddessGlow() {
  return cached('bGodGlow', 900, 1100, 1, () => { const c = ctx; c.translate(GOD_OX, GOD_OY); const P = goddessPolys(); c.lineJoin = 'round';
    for (const [w, a] of [[46, 0.08], [28, 0.14], [14, 0.3], [5, 0.95]]) { c.strokeStyle = `rgba(150,235,255,${a})`; c.lineWidth = w; P.forEach((p) => { poly(p); c.stroke(); }); }
    c.globalCompositeOperation = 'destination-out'; P.forEach((p) => { poly(p); c.fill(); });
  });
}
// standing festival lamp; origin = base (80, 410), flame at (0, -350)
function lampImg() {
  return cached('bLamp', 160, 420, 1, () => { const c = ctx; c.translate(80, 410);
    leaf(ellPts(0, -12, 64, 14, 0, 24), 61, 'gold', 18); leaf([[-40, -12], [-22, -40], [22, -40], [40, -12]], 62, 'gold', 18);
    leaf([[-7, -40], [-7, -300], [7, -300], [7, -40]], 63, 'gold', 14);
    for (const y of [-110, -190, -265]) leaf(ellPts(0, y, 18, 9, 0, 16), 64 + y, 'gold', 14);
    const bowl = []; for (let k = 0; k <= 16; k++) { const a = k / 16 * PI; bowl.push([cos(a) * 58, -322 + sin(a) * 26]); } leaf(bowl, 67, 'gold', 16);
    leaf([[-60, -322], [60, -322], [52, -332], [-52, -332]], 68, 'gold', 16);
  });
}
function pennantImg(pal) { return cached('bPen' + pal, 90, 150, 1, () => { ctx.translate(45, 4); leaf([[-40, 0], [40, 0], [0, 136]], pal === 'red' ? 71 : 72, pal, 20); }); }
// sonar: bathymetry contours, depth gauge, divers
function bathyImg() {
  return cached('bBathy', W, H, 1, () => { const c = ctx; c.lineWidth = 2;
    for (let r = 70, k = 0; r < 1200; r += 64, k++) { c.beginPath(); for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU, rr = r * (1 + 0.09 * sin(3 * a + k * 0.7) + 0.05 * sin(5 * a - k)); const x = 640 + cos(a) * rr * 1.15, y = 800 + sin(a) * rr * 0.8; i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.strokeStyle = `rgba(65,255,154,${k % 4 === 0 ? 0.2 : 0.09})`; c.stroke(); }
    c.globalCompositeOperation = 'destination-out'; const g = c.createLinearGradient(0, 1180, 0, 1320); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)'); c.fillStyle = g; c.fillRect(0, 1180, W, H - 1180);
  });
}
const GA0 = 240, depthAt = (y) => (y - GA0) / 40, yAtDepth = (m) => GA0 + m * 40;
function gaugeImg() {
  return cached('bGauge', 200, 1300, 1, () => { const c = ctx; c.fillStyle = 'rgba(1,10,6,0.55)'; c.fillRect(0, GA0 - 30, 112, 1240 - GA0 + 60);
    c.strokeStyle = 'rgba(65,255,154,0.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(110, GA0 - 20); c.lineTo(110, 1250); c.stroke();
    c.font = '700 22px Inter'; c.fillStyle = 'rgba(65,255,154,0.85)'; c.textBaseline = 'middle'; c.textAlign = 'right';
    for (let m = 0; m <= 25; m++) { const y = yAtDepth(m), big = m % 5 === 0; c.lineWidth = big ? 3 : 1.5; c.beginPath(); c.moveTo(110, y); c.lineTo(110 - (big ? 24 : 12), y); c.stroke(); if (big && m) c.fillText(`-${m} m`, 80, y); }
  });
}
function gauge(m, t) { const c = ctx; blit(gaugeImg(), 0, 0, 0, 0); const y = yAtDepth(clamp(m, 0, 25));
  c.beginPath(); c.moveTo(112, y); c.lineTo(136, y - 12); c.lineTo(136, y + 12); c.closePath(); c.fillStyle = '#41FF9A'; c.fill(); K.glow(116, y, 34, '65,255,154', 0.5);
  c.font = '900 26px Inter'; c.fillStyle = '#B8FFD8'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillText(`-${m.toFixed(1)} m`, 142, y); }
function diverPts() { const P = [];
  const pl = (pts, close = true, sp = 7) => { const n = pts.length; for (let i = 0; i < (close ? n : n - 1); i++) { const a = pts[i], b = pts[(i + 1) % n], l = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let s = 0; s < l; s += sp) P.push([lerp(a[0], b[0], s / l), lerp(a[1], b[1], s / l)]); } };
  pl(ellPts(-135, 0, 24, 24, 0, 18)); pl(ellPts(-20, 8, 98, 30, 0.04, 40)); pl([[-75, -50], [70, -44], [70, -22], [-75, -26]]);
  pl([[72, 0], [160, -12]], false); pl([[72, 22], [160, 30]], false); pl([[160, -12], [215, -40], [205, -2]]); pl([[160, 30], [218, 22], [196, 52]]);
  pl([[-90, 22], [-175, 46]], false); pl([[-150, -16], [-112, -16]], false);
  return P; }
function diverImg() {
  return cached('bDiver', 460, 180, 1, () => { const c = ctx; c.translate(230, 90); const P = diverPts();
    for (const [x, y] of P) { c.fillStyle = 'rgba(65,255,154,0.16)'; c.fillRect(x - 5, y - 5, 10, 10); }
    for (const [i, [x, y]] of P.entries()) { c.fillStyle = rnd(i) > 0.3 ? 'rgba(170,255,205,0.95)' : 'rgba(65,255,154,0.7)'; c.fillRect(x - 1.8, y - 1.8, 3.6, 3.6); }
  });
}
// sonar return brightness for something at angle phi seen from the sweep origin: ang = current sweep angle (cumulative), om = rad/s
function ret(ang, phi, om, res = 0.25) { const rel = ang - phi; if (rel < 0) return 0; const ts = (rel % TAU) / om; return res + (1 - res) * Math.max(0, 1 - ts / 1.2); }

// stone structures out of sonar returns (b9)
function structDots() {
  const D = [], seg2 = (x0, y0, x1, y1, sp = 10) => { const l = Math.hypot(x1 - x0, y1 - y0); for (let s = 0; s <= l; s += sp) D.push([lerp(x0, x1, s / l), lerp(y0, y1, s / l), 1]); };
  const rect = (x0, y0, x1, y1) => { seg2(x0, y0, x1, y0); seg2(x1, y0, x1, y1); seg2(x1, y1, x0, y1); seg2(x0, y1, x0, y0); };
  rect(220, 620, 470, 770); rect(250, 650, 440, 740); seg2(250, 695, 440, 695, 14);           // rectangle with an inner course
  seg2(600, 600, 920, 690); seg2(600, 625, 915, 715);                                         // long wall
  seg2(560, 820, 560, 1080); seg2(560, 1080, 880, 1080); seg2(880, 1080, 880, 820);          // U-shape
  seg2(590, 820, 590, 1050); seg2(590, 1050, 850, 1050); seg2(850, 1050, 850, 820);
  rect(170, 900, 380, 1040); seg2(275, 900, 275, 1040, 14);
  seg2(150, 1160, 960, 1180, 12);                                                               // low wall along the seabed
  for (let i = 0; i < 260; i++) D.push([120 + rnd(i * 3 + 1) * 860, 560 + rnd(i * 5 + 2) * 660, 0]);   // seabed speckle
  return D.map(([x, y, s], i) => ({ x: x + (rnd(i * 11) - 0.5) * 3, y: y + (rnd(i * 13) - 0.5) * 3, s, phi: Math.atan2(y - 1250, x - 540) }));
}

// ───────────── the shots ─────────────
export function buildB(add, cue) {
  const lacq = () => blit(lacquerImg(), 0, 0, 0, 0), sonar = () => blit(sonarImg(), 0, 0, 0, 0);
  const tF = Wd('festival', 4), tJ = Wd('just', 4), tO = Wd('once', 4);
  const tMiss = Wd('miss', 5) - 0.05, tThat = Wd('that', 6) - 0.1, tNine = Wd('nineteen', 7) - 0.1, tStone = Wd('stone', 7) - 0.12;

  // b1 · A GRIEVING KING
  add({ id: 'b1', at: L(4), cam: [430, 900], zoom: 0.07, note: 'grieving king (ILLUSTRATION), tiny boat lost on the horizon, THE POEM SAYS',
    draw(lt, d, t) { const c = ctx; lacq();
      const HY = 900; c.fillStyle = 'rgba(3,6,24,0.55)'; c.fillRect(-100, HY, W + 200, 1250 - HY);
      c.strokeStyle = 'rgba(233,196,106,0.75)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-100, HY); c.lineTo(W + 100, HY); c.stroke();
      for (let i = 0; i < 14; i++) { const y = HY + 18 + i * i * 1.6, x = (rnd(i) * 900 + t * (20 + i * 6)) % 1200 - 100; c.strokeStyle = `rgba(233,196,106,${0.28 - i * 0.015})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 60 + i * 8, y); c.stroke(); }
      // the boat: tiny, drifting off along the horizon, fading
      const bx = 800 + lt * 38, bs = 0.62 - lt * 0.05; K.glow(bx, HY - 20, 70, '233,196,106', 0.18); blit(boatImg(), 60, 92, bx, HY + 4 + sin(t * 2.2) * 2, bs, clamp(1.1 - lt * 0.2));
      dust(t, 26, 3, '247,226,160', 0.35);
      const kx = 360, ky = 1236, ks = 1.32, p = seg(lt, 0.0, 1.0);
      K.glow(kx + 60, ky - 520, 420, '233,196,106', 0.12 * p);
      leafLay(kingImg(), KING_OX, KING_OY, kx, ky, ks, p, 5, 36); glint(kingImg(), KING_OX, KING_OY, kx, ky, ks, seg(lt, 1.05, 1.9));
      flakes(kx + 140, ky - 600, lt - 1.0, 14, 9, 160, 2.6, 500);
      slam(goldTitle('A GRIEVING KING', 92), 540, 290, t - Wd('grieving', 4));
      poemTag(t); put(tagImg('ILLUSTRATION', 'gold', 19), 900, 222, 1, 0.85);
    } });
  cue(L(4) + 1.05, 'sparkle', { gain: 0.35 }); cue(Wd('grieving', 4), 'whoosh', { gain: 0.3 });

  // b2 · INDRA'S FESTIVAL · lamps go dark · JUST ONCE
  const LAMPS = [[150, 1150, 0.82], [330, 1100, 0.95], [540, 1180, 1.25], [750, 1100, 0.95], [930, 1150, 0.82]];
  const outs = [tF + 0.55, tF + 1.25, tO + 0.04, tF + 0.95, tF + 0.3];      // outer lamps first, the centre one on "once"
  add({ id: 'b2', at: tF - 0.1, cam: [540, 820], zoom: 0.07, note: "INDRA'S FESTIVAL pennants + lamps going dark one by one; JUST ONCE on the last",
    draw(lt, d, t) { const c = ctx; lacq();
      const lits = outs.map((o) => 1 - clamp((t - o) / 0.22)), avg = lits.reduce((a, b) => a + b, 0) / lits.length;
      K.glow(540, 860, 820, '255,150,60', 0.16 * avg);
      // rope + pennants
      const ry = (x) => 450 + 70 * (1 - ((x - 540) / 600) ** 2);
      c.beginPath(); for (let x = -80; x <= W + 80; x += 20) x > -80 ? c.lineTo(x, ry(x)) : c.moveTo(x, ry(x)); c.strokeStyle = '#A8792B'; c.lineWidth = 4; c.stroke();
      for (let i = 0; i < 9; i++) { const x = 60 + i * 120, im = pennantImg(i % 2 ? 'gold' : 'red'), droop = 1 - avg; im._cx = 45; im._cy = 4;
        put(im, x, ry(x), 1, 1, sin(t * 1.6 + i * 1.3) * 0.08 * (0.3 + avg) + droop * (i % 2 ? 0.05 : -0.05)); }
      // lamps
      LAMPS.forEach(([x, y, s], i) => { blit(lampImg(), 80, 410, x, y, s); const fx = x, fy = y - 332 * s, l = lits[i];
        if (l > 0.01) { K.glow(fx, fy - 20 * s, 190 * s, '255,160,70', 0.45 * l); const h = (50 + sin(t * 13 + i * 2) * 6) * s * (0.3 + 0.7 * l), w = 16 * s * l;
          c.beginPath(); c.moveTo(fx, fy - h); c.quadraticCurveTo(fx + w * 1.5, fy - h * 0.25, fx, fy); c.quadraticCurveTo(fx - w * 1.5, fy - h * 0.25, fx, fy - h); c.fillStyle = '#FFB547'; c.fill();
          c.beginPath(); c.moveTo(fx, fy - h * 0.6); c.quadraticCurveTo(fx + w * 0.7, fy - h * 0.15, fx, fy); c.quadraticCurveTo(fx - w * 0.7, fy - h * 0.15, fx, fy - h * 0.6); c.fillStyle = '#FFF3C4'; c.fill(); }
        const k = t - outs[i]; if (k > 0 && k < 1.8) { c.beginPath(); for (let j = 0; j <= 12; j++) { const yy = fy - j * 12 * s * (0.5 + k), xx = fx + sin(j * 0.7 + k * 4 + i) * 8 * j * 0.25 * s; j ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
          c.strokeStyle = `rgba(190,195,230,${0.45 * (1 - k / 1.8)})`; c.lineWidth = 3 * s; c.stroke(); } });
      c.fillStyle = `rgba(2,3,14,${0.5 * (1 - avg)})`; c.fillRect(-100, -100, W + 200, H + 200);
      flakes(540, 1180 - 332 * 1.25, t - outs[2], 34, 21, 560);
      const kJ = t - tJ, up = eio(clamp(kJ / 0.3));
      slam(goldTitle("INDRA'S FESTIVAL", 82), 540, lerp(285, 215, up), t - tF, lerp(1, 0.82, up));
      slam(goldTitle('JUST ONCE', 128, 'red'), 540, 340, kJ);
      if (kJ > 0) glint(goldTitle('JUST ONCE', 128, 'red'), goldTitle('JUST ONCE', 128, 'red')._cx, goldTitle('JUST ONCE', 128, 'red')._cy, 540, 340, 1, seg(t, tO, tO + 0.6), 0.6);
      poemTag(t);
    } });
  cue(tF, 'bell', { gain: 0.35 }); outs.slice(0, 2).concat(outs.slice(3)).forEach((o) => cue(o, 'plop', { gain: 0.22 })); cue(tJ, 'slam', { gain: 0.5 }); cue(tO + 0.04, 'thud', { gain: 0.55 });

  // b3 · THE WARNING · the sea goddess rises
  add({ id: 'b3', at: L(5), cam: [540, 760], zoom: 0.08, note: 'sea goddess of wave curls with crown, faceless, glowing outline; THE WARNING',
    draw(lt, d, t) { const c = ctx; lacq();
      const rise = eo(clamp(lt / 0.9)), gx = 540, gy = 1250 + (1 - rise) * 120, gs = 0.87;
      for (let i = 0; i < 5; i++) { const r = 160 + i * 110 + (lt * 60) % 110; c.beginPath(); c.arc(gx, gy - 830 * gs, r, 0, TAU); c.strokeStyle = `rgba(150,235,255,${0.12 * rise * (1 - i / 5)})`; c.lineWidth = 2; c.stroke(); }
      K.glow(gx, gy - 830 * gs, 380, '150,235,255', 0.16 * rise);
      blit(goddessGlow(), GOD_OX, GOD_OY, gx, gy, gs, rise * (0.7 + 0.3 * sin(t * 5)));
      leafLay(goddessImg(), GOD_OX, GOD_OY, gx, gy, gs, seg(lt, 0, 0.85), 7, 34); glint(goddessImg(), GOD_OX, GOD_OY, gx, gy, gs, seg(lt, 0.9, 1.6), 0.6);
      waterline(1230, t, '6,20,40', 0.92);
      slam(goldTitle('THE WARNING', 104), 540, 262, t - Wd('warned', 5));
      poemTag(t);
    } });
  cue(L(5), 'swell', { gain: 0.45 }); cue(Wd('warned', 5), 'whoosh', { gain: 0.35 });

  // b4 · MISS IT · PUHAR DROWNS
  add({ id: 'b4', at: tMiss, cam: [540, 860], zoom: 0.06, note: 'gold wave curl looms over the gold city; MISS IT, PUHAR DROWNS (vermilion); lunge + flakes on drowns',
    draw(lt, d, t) { const c = ctx; lacq(); const tD = Wd('drowns', 5), kD = t - tD, lunge = eo(clamp(kD / 0.5));
      blit(cityImg(), 0, CITY_OY, 0, 1160, 1); glint(cityImg(), 0, CITY_OY, 0, 1160, 1, seg(lt, 0.1, 0.9), 0.5);
      if (kD > 0) { c.fillStyle = `rgba(216,67,46,${0.22 * Math.max(0, 1 - kD / 0.4)})`; c.fillRect(-100, -100, W + 200, SAFE + 100); }
      const wx = lerp(-560, -380, eio(clamp(lt / 1.2))) + lunge * 170, wyy = lerp(1500, 1240, eo(clamp(lt / 0.9))) - lunge * 60;
      blit(waveImg(), 0, 1000, wx, wyy, 1.05, 1);
      flakes(540, 760, kD, 30, 31, 600); flakes(300, 900, kD - 0.08, 18, 37, 460); flakes(870, 880, kD - 0.12, 18, 43, 460);
      waterline(1185 - lunge * 40, t, '6,20,40', 0.92, -0.04 * lunge);
      slam(goldTitle('MISS IT', 128), 540, 262, t - Wd('miss', 5));
      slam(goldTitle('PUHAR DROWNS', 110, 'red'), 540, 400, t - Wd('puhar', 5));
      poemTag(t);
    } });
  cue(Wd('miss', 5), 'slam', { gain: 0.55 }); cue(Wd('puhar', 5), 'whoosh', { gain: 0.35 }); cue(Wd('drowns', 5), 'rumble', { gain: 0.6, dur: 1.4 });

  // b5 · the waves take the city: WATERLINE WIPE, gold -> sonar dots
  const tTook = Wd('took', 6), tCityUp = Wd('city', 6) + 0.25;
  const wl5 = (t) => lerp(1180, 520, eio(seg(t, L(6) + 0.05, tCityUp)));
  add({ id: 'b5', at: L(6), cam: [540, 880], zoom: 0.06, note: 'WATERLINE WIPE rises over the gold city; below it the city is sonar dots; flake bursts at the towers',
    draw(lt, d, t) { const c = ctx; lacq(); const y = wl5(t), tilt = 0.03 * sin(t * 1.3);
      blit(cityImg(), 0, CITY_OY, 0, 1160, 1);
      c.save(); clipBelow(y, t, tilt); sonar(); blit(cityDots(), 0, CITY_OY, 0, 1160, 1, 0.95); sweepC(540, 1250, -PI + (lt * 2.2) % TAU, 1300, 0.3); c.restore();
      crest(y, t, tilt); for (let i = 0; i < 8; i++) { const x = rnd(i + 3) * W, k = ((t * 0.9 + rnd(i)) % 1); c.fillStyle = `rgba(207,246,255,${0.6 * (1 - k)})`; c.beginPath(); c.arc(x, wy(x, y, t, tilt) - k * 40, 3, 0, TAU); c.fill(); }
      flakes(540, 640, t - tTook, 34, 51, 560); flakes(300, 890, t - tTook + 0.15, 20, 57, 420); flakes(870, 760, t - tTook - 0.1, 20, 61, 420); flakes(110, 980, t - tTook + 0.3, 14, 67, 380);
      poemTag(t);
    } });
  cue(L(6), 'swell', { gain: 0.5 }); cue(tTook, 'bubbles', { gain: 0.5 }); cue(tTook + 0.05, 'sparkle', { gain: 0.3 });

  // b6 · LEGEND
  const tLeg = Wd('legend', 6);
  add({ id: 'b6', at: tThat, cam: [540, 700], zoom: 0.07, note: 'LEGEND slams above the water, flakes fall in and ping; drowned city swept by sonar below',
    draw(lt, d, t) { const c = ctx; lacq(); const y = lerp(520, 560, eio(clamp(lt / d)));
      c.save(); clipBelow(y, t); sonar(); blit(cityDots(), 0, CITY_OY, 0, 1160, 1, 0.95); sweepC(540, 1250, -PI + 0.6 + lt * 2.6, 1300, 0.32); c.restore();
      crest(y, t);
      const kL = t - tLeg; slam(goldTitle('LEGEND', 150), 540, 330, kL); if (kL > 0) glint(goldTitle('LEGEND', 150), goldTitle('LEGEND', 150)._cx, goldTitle('LEGEND', 150)._cy, 540, 330, 1, seg(kL, 0.3, 1.0), 0.7);
      c.save(); c.beginPath(); c.rect(-100, -100, W + 200, y - 10 + 100); c.clip(); flakes(540, 360, kL - 0.05, 36, 71, 380, 3.0, 1300); c.restore();
      for (let i = 0; i < 4; i++) ping(260 + i * 180, y + 6, kL - 0.45 - i * 0.12, 150, '207,246,255', 2);
      poemTag(t);
    } });
  cue(tLeg, 'slam', { gain: 0.6 }); cue(tLeg + 0.5, 'plop', { gain: 0.3 });

  // b7 · RECORD (waterline wipes off the top; sonar register)
  const OM = TAU / 2.6;
  const sonarBase = (lt, a0, t, m) => { sonar(); blit(bathyImg(), 0, 0, 0, 0); K.glow(540, 1250, 260, '65,255,154', 0.14); gauge(m, t); };
  add({ id: 'b7', at: L(7), cam: [60, 760], zoom: 0.07, note: 'waterline wipes off the top into the sonar register; RECORD; bathymetry, depth gauge, sweep',
    draw(lt, d, t) { const c = ctx; const y = lerp(560, -120, eio(clamp(lt / 0.4)));
      sonarBase(lt, 0, t, lerp(6, 7.5, eo(clamp(lt / d))));
      blit(cityDots(), 0, CITY_OY, 0, 1160, 1, 0.9 * (1 - clamp(lt / 0.6)));
      const ang = -PI - 0.3 + lt * OM; sweepC(540, 1250, ang, 1300, 0.4);
      const ridge = []; for (let x = 100; x <= 1000; x += 12) ridge.push([x, 1150 - 40 * sin(x * 0.006) - 18 * sin(x * 0.021)]);
      ridge.forEach(([x, yy], i) => { const b = ret(ang, Math.atan2(yy - 1250, x - 540), OM, 0.2); if (b <= 0) return; c.globalAlpha = b; c.fillStyle = '#41FF9A'; c.fillRect(x - 2, yy - 2, 4, 4); }); c.globalAlpha = 1;
      if (y > -100) { c.save(); clipAbove(y, t); lacq(); c.restore(); crest(y, t); }
      const kR = t - Math.max(Wd('record', 7), L(7) + 0.28); slam(sonarTitle('RECORD', 160), 540, 330, kR); ping(540, 330, kR, 420);
    } });
  cue(L(7), 'whoosh', { gain: 0.4 }); cue(Math.max(Wd('record', 7), L(7) + 0.28), 'tock', { gain: 0.45 });

  // b8 · 1980s · DIVERS
  const tDiv = Wd('divers', 7);
  const DIVERS = [[420, 640, 0.9, 0.35], [760, 830, 0.95, 0.3], [520, 1020, 0.78, 0.4]];
  add({ id: 'b8', at: tNine, cam: [60, 820], zoom: 0.06, note: '1980s counts up; DIVERS as sonar-dot outlines with tanks descending; bubbles; depth gauge follows',
    draw(lt, d, t) { const c = ctx; const kD = t - tDiv, dd = eo(clamp(kD / 1.4));
      sonarBase(lt, 0, t, 7.5 + 3 * eo(clamp(lt / d)));
      const ang = -PI + 0.2 + lt * OM; sweepC(540, 1250, ang, 1300, 0.38);
      DIVERS.forEach(([x, y, s, rot], i) => { const k = t - tNine - 0.3 - i * 0.3; if (k < 0) return; const e = eo(clamp(k / 0.5)), px = x - 60 + k * 30 + (1 - e) * -60, py = y - 120 + k * 40 + sin(t * 2 + i) * 6;
        const b = Math.max(ret(ang, Math.atan2(py - 1250, px - 540), OM, 0.55), 0.55); put(Object.assign(diverImg(), { _cx: 230, _cy: 90 }), px, py, s, e * b, rot);
        if (k < 0.5) ping(px, py, k, 160);
        for (let j = 0; j < 5; j++) { const bk = (t * 0.8 + j / 5 + i * 0.3) % 1, bx = px - 135 * s * cos(rot) + sin(bk * 9 + j) * 10, by = py - 135 * s * sin(rot) - 30 - bk * 220; c.beginPath(); c.arc(bx, by, 4 + j % 3 * 2, 0, TAU); c.strokeStyle = `rgba(150,255,200,${0.7 * (1 - bk) * e})`; c.lineWidth = 2; c.stroke(); } });
      const kN = t - Wd('nineteen', 7), yr = 1900 + 10 * Math.floor(8 * eo(clamp(kN / 0.22)));
      slam(sonarTitle(`${yr}s`, 150), 540, 300, kN); if (kN > 0.35 && kN < 1.6) ping(540, 300, kN - 0.35, 360);
      slam(sonarTitle('DIVERS', 96), 540, 450, kD);
    } });
  cue(Wd('nineteen', 7), 'tock', { gain: 0.4 }); cue(Wd('nineteen', 7) + 0.35, 'pop', { gain: 0.4 }); cue(tDiv, 'bubbles', { gain: 0.45 });

  // b9 · STONE STRUCTURES · OFF PUHAR
  const SD = structDots(), OM9 = TAU / 2.2;
  add({ id: 'b9', at: tStone, cam: [60, 860], zoom: 0.07, note: 'sweep builds stone structures (rectangles, walls, U-shape) out of returns; STONE STRUCTURES; OFF PUHAR; depth gauge',
    draw(lt, d, t) { const c = ctx; sonarBase(lt, 0, t, 13.5 + 1.5 * eio(clamp(lt / d)));
      const ang = -PI - 0.15 + lt * OM9; sweepC(540, 1250, ang, 1300, 0.42);
      for (const p of SD) { const b = ret(ang, p.phi, OM9, p.s ? 0.38 : 0.06); if (b <= 0.01) continue;
        if (p.s) { c.globalAlpha = b * 0.25; c.fillStyle = '#41FF9A'; c.fillRect(p.x - 5, p.y - 5, 10, 10); c.globalAlpha = b; c.fillStyle = b > 0.7 ? '#D8FFE8' : '#41FF9A'; c.fillRect(p.x - 2, p.y - 2, 4, 4); }
        else { c.globalAlpha = b * 0.6; c.fillStyle = '#1C7A4C'; c.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); } }
      c.globalAlpha = 1;
      const tO2 = Wd('off', 7); const kO = t - tO2;
      if (kO > 0) { const e = eo(clamp(kO / 0.4)); c.save(); c.globalAlpha = e; c.setLineDash([10, 10]); c.strokeStyle = 'rgba(65,255,154,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(1010, 520); c.lineTo(1010, 1240); c.stroke(); c.setLineDash([]); c.restore();
        ping(1010, 560, kO, 140); }
      slam(sonarTitle('STONE STRUCTURES', 104), 540, 280, t - Wd('stone', 7));
      slam(sonarTitle('OFF PUHAR', 84), 540, 410, kO);
    } });
  cue(Wd('stone', 7), 'tock', { gain: 0.45 }); cue(Wd('stone', 7) + 1.1, 'pop', { gain: 0.3 }); cue(Wd('off', 7), 'tock', { gain: 0.4 });
}
