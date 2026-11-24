// EPISODE 21 · worker C : "Gold Leaf & Sonar", lines 8-10 (the record's explanation / the fringe claim / the question / end card)
//   c1  L8 -> "floods"        split: gold coast above the waterline crumbles square by square into green sonar dots; EROSION
//   c2  "floods" -> "centuries" gold harbour city; the waterline surges then climbs a depth gauge, gold turns sonar; FLOODS / RISING SEA
//   c3  "centuries" -> L9     full sonar: the drowned city as returns, a tick dial fills round; CENTURIES
//   c4  L9 -> "eleven"        sonar sweep finds a U-shaped stone outline; SOME CLAIM
//   c5  "eleven" -> "historians" closer on the U, it pulses; 11,000 YEARS? spins up
//   c6  "historians" -> L10   scene dims, HISTORIANS: + amber DOUBTFUL stamp slams on "doubtful" (hedges stay up)
//   c7  L10 -> "tell"         CURSE? (gold) / SLOW SEA? (green) / LOST AGE? (amber) swing in on their words over the waterline
//   c8  "tell" -> "watch"     tags lift into a row, TELL ME BELOW + bobbing down arrow with ping rings
//   c9  "watch" -> end        end card: waterline across a half-gold half-sonar city, WATCH AGAIN (leaf-lay), AAZHI; rises + pulses on "waterline"
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit, haze } from './art.js';
import * as K from './core/kit.js';

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

// ───────────── worker C helpers ─────────────
const GOLD = '#E9C46A', GREEN = '#41FF9A', AMBER = '#FFB547', VERM = '#D8432E';
const MC = document.createElement('canvas').getContext('2d');
const measure = (txt, size, sp = 0) => { MC.font = `900 ${size}px Inter`; MC.letterSpacing = `${sp}px`; return MC.measureText(txt).width; };
const wy0 = (x, y, t, tilt = 0) => y + tilt * (x - 540) + Math.sin(x * 0.011 + t * 2.1) * 14 + Math.sin(x * 0.027 - t * 3.3) * 6;
const lacq = (k = 1.05) => blit(lacquerImg(), 540, 960, 540, 960, k);
const sonar = (k = 1.05) => blit(sonarImg(), 540, 960, 540, 960, k);
const calm = () => haze(1290, 1920, '#010503', 0, 0.8);   // keep the caption band plain and dark
function belowClip(y, t, tilt = 0) { const c = ctx; c.beginPath(); c.moveTo(-200, H + 200);
  for (let x = -200; x <= W + 200; x += 20) c.lineTo(x, wy0(x, y, t, tilt)); c.lineTo(W + 200, H + 200); c.closePath(); c.clip(); }
/** two registers split by the waterline: top() on gold lacquer, bottom() on sonar, then the crest */
function split(y, t, top, bottom, tilt = 0, crestA = 1) {
  lacq(); top && top();
  ctx.save(); belowClip(y, t, tilt); sonar(); blit(bathyImg(), 540, 960, 540, 960, 1.05); bottom && bottom(); ctx.restore();
  ctx.save(); ctx.globalAlpha = crestA; waterline(y, t, '4,40,34', 0.16, tilt); ctx.restore();
  // soft cyan bloom along the crest
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, y - 40, 0, y + 40);
  g.addColorStop(0, 'rgba(207,246,255,0)'); g.addColorStop(0.5, `rgba(207,246,255,${0.12 * crestA})`); g.addColorStop(1, 'rgba(207,246,255,0)'); ctx.fillStyle = g; ctx.fillRect(-200, y - 40 - Math.abs(tilt) * 600, W + 400, 80 + Math.abs(tilt) * 1200); ctx.restore();
}
// bathymetry contours (wobbly concentric rings), cached
function bathyImg() {
  return cached('cbathy', W, H, 1, () => { const c = ctx; c.lineWidth = 2;
    for (let k = 0; k < 9; k++) { c.beginPath(); const r0 = 120 + k * 130;
      for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU, r = r0 * (1 + 0.07 * Math.sin(3 * a + k) + 0.04 * Math.sin(7 * a + k * 2)); const x = 540 + Math.cos(a) * r * 1.15, y = 1180 + Math.sin(a) * r * 0.75; i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.strokeStyle = `rgba(28,122,76,${0.35 - k * 0.025})`; c.stroke(); }
  });
}
// small green dot glow sprite
function dotImg() { return cached('cdot', 40, 40, 1, () => { K.glow(20, 20, 20, '65,255,154', 0.7); ctx.fillStyle = '#C8FFE2'; ctx.fillRect(17, 17, 6, 6); }); }
const gdot = (x, y, a = 1, s = 1) => { if (a > 0.02) blit(dotImg(), 20, 20, x, y, s, a); };
// ping rings: thin expanding green rings, dt = seconds since the ping
function ping(x, y, dt, n = 3, R = 420, col = '65,255,154') { if (dt < 0 || dt > 1.6) return; ctx.save(); ctx.lineWidth = 3;
  for (let k = 0; k < n; k++) { const u = (dt - k * 0.16) / 1.1; if (u < 0 || u > 1) continue; ctx.beginPath(); ctx.arc(x, y, 20 + R * eo(u), 0, TAU); ctx.strokeStyle = `rgba(${col},${0.8 * (1 - u)})`; ctx.stroke(); } ctx.restore(); }
// flake burst: gold leaf flakes tumbling with gravity and glinting; dt = since burst
function flakes(x, y, dt, n = 26, seed = 1, spd = 520, spread = 200) { if (dt < 0 || dt > 2) return;
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(seed + i) - 0.5) * 2.8, v = spd * (0.3 + rnd(seed + i * 3)), life = 1 + rnd(seed + i * 7) * 0.9; if (dt > life) continue;
    const px = x + (rnd(seed + i * 11) - 0.5) * spread + Math.cos(a) * v * dt + Math.sin(dt * 6 + i) * 14, py = y + Math.sin(a) * v * dt + 700 * dt * dt, k = 1 - dt / life, s = 6 + rnd(seed + i * 5) * 10;
    const gl = 0.5 + 0.5 * Math.sin(dt * 14 + i * 2);
    ctx.save(); ctx.translate(px, py); ctx.rotate(dt * (4 + rnd(seed + i) * 6) + i); ctx.scale(1, 0.3 + 0.7 * Math.abs(Math.cos(dt * 9 + i)));
    ctx.globalAlpha = k; ctx.fillStyle = gl > 0.8 ? '#FFF4C8' : gl > 0.4 ? GOLD : '#A8792B'; ctx.fillRect(-s / 2, -s / 2, s, s * 0.8); ctx.restore(); } }

// ───────────── labels (cached sprites) ─────────────
/** gold-leaf caps title */
function goldText(txt, size = 110) {
  const sp = size * 0.04, w = Math.ceil(measure(txt, size, sp) + size * 0.7), h = Math.ceil(size * 1.5);
  const c = cached(`cg_${txt}_${size}`, w, h, 1, () => { const x = ctx;
    x.font = `900 ${size}px Inter`; x.letterSpacing = `${sp}px`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
    x.lineWidth = size * 0.14; x.strokeStyle = '#1A1006'; x.strokeText(txt, w / 2, h / 2);
    const g = x.createLinearGradient(0, h * 0.2, 0, h * 0.8); g.addColorStop(0, '#F7E2A0'); g.addColorStop(0.45, '#E9C46A'); g.addColorStop(0.7, '#C99A45'); g.addColorStop(1, '#A8792B');
    x.fillStyle = g; x.fillText(txt, w / 2, h / 2);
    x.globalCompositeOperation = 'source-atop'; x.strokeStyle = 'rgba(110,70,20,0.45)'; x.lineWidth = 1.5; const sm = size * 0.24;
    for (let i = 0; i < w; i += sm) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 4, h); x.stroke(); }
    for (let j = 0; j < h; j += sm) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j + 3); x.stroke(); }
    x.fillStyle = 'rgba(255,250,220,0.5)'; x.fillRect(0, h * 0.28, w, size * 0.07);
    x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < w / 9; i++) { const s = 2 + rnd(i * 3 + size) * 5; x.fillRect(rnd(i + w) * w, rnd(i * 7 + h) * h, s, s); }
    x.letterSpacing = '0px'; });
  c._w = w; c._h = h; return c;
}
/** phosphor-green (or amber) sonar caps with baked glow and scanline cut */
function sonText(txt, size = 100, col = GREEN, rgb = '65,255,154') {
  const sp = size * 0.05, w = Math.ceil(measure(txt, size, sp) + size * 0.9), h = Math.ceil(size * 1.6);
  const c = cached(`cs_${txt}_${size}_${col}`, w, h, 1, () => { const x = ctx;
    x.font = `900 ${size}px Inter`; x.letterSpacing = `${sp}px`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = `rgba(${rgb},0.9)`; x.shadowBlur = size * 0.2; x.fillStyle = col; x.fillText(txt, w / 2, h / 2); x.shadowBlur = 0;
    x.fillText(txt, w / 2, h / 2);
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < h; y += 5) x.fillRect(0, y, w, 1.4);
    x.letterSpacing = '0px'; });
  c._w = w; c._h = h; return c;
}
/** a label on a dark plate: kind 'gold' | 'green' | 'amber'; a=alpha, s=scale, rot */
function tag(txt, x, y, kind = 'green', size = 96, s = 1, a = 1, rot = 0) {
  if (a <= 0.01) return;
  const spr = kind === 'gold' ? goldText(txt, size) : kind === 'amber' ? sonText(txt, size, AMBER, '255,181,71') : sonText(txt, size);
  const pw = spr._w - size * (kind === 'gold' ? 0.3 : 0.5), ph = size * 1.32, edge = kind === 'gold' ? 'rgba(233,196,106,0.7)' : kind === 'amber' ? 'rgba(255,181,71,0.75)' : 'rgba(65,255,154,0.6)';
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= a;
  rr(-pw / 2, -ph / 2, pw, ph, 14); ctx.fillStyle = kind === 'gold' ? 'rgba(8,10,34,0.82)' : 'rgba(1,10,6,0.82)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = edge; ctx.stroke();
  blit(spr, spr._w / 2, spr._h / 2, 0, 3, 1);
  ctx.restore();
}
// pop-in helper: scale/alpha for a label landing at film time t0
const land = (t, t0, dur = 0.35) => { const u = seg(t, t0, t0 + dur); return { s: u <= 0 ? 0 : 0.6 + 0.4 * eob(u), a: clamp(u * 3) }; };
// glint: a slanted band sweeping across a gold sprite, brightening only the gold (sprite re-blitted additively inside the band)
function glint(spr, ox, oy, x, y, s, u, w = 120) { if (u <= 0 || u >= 1) return; const bw = spr.width / spr._q * s, bh = spr.height / spr._q * s, x0 = x - ox * s, y0 = y - oy * s;
  const gx = lerp(x0 - 200, x0 + bw + 200, u); ctx.save(); ctx.beginPath(); ctx.moveTo(gx - w / 2 + 80, y0); ctx.lineTo(gx + w / 2 + 80, y0); ctx.lineTo(gx + w / 2 - 80, y0 + bh); ctx.lineTo(gx - w / 2 - 80, y0 + bh); ctx.clip();
  ctx.globalCompositeOperation = 'lighter'; blit(spr, ox, oy, x, y, s, 0.55); ctx.restore(); }

// ───────────── the harbour city (gold leaf + sonar twin), local 1080 x 680, base y = 660 ─────────────
function cityShapes() {
  const S = [];
  S.push([[0, 620], [1080, 620], [1080, 680], [0, 680]]);                                   // quay
  const house = (x, w, h) => { S.push([[x, 620], [x, 620 - h], [x + w / 2, 620 - h - w * 0.42], [x + w, 620 - h], [x + w, 620]]); };
  house(30, 120, 150); house(160, 140, 190); house(310, 110, 130);                         // warehouses
  const tower = (cx, bw, tiers, th) => { let y = 620, w = bw;                                // stepped gate tower (generic)
    for (let i = 0; i < tiers; i++) { const w2 = w * 0.8; S.push([[cx - w / 2, y], [cx - w2 / 2 - 6, y - th], [cx + w2 / 2 + 6, y - th], [cx + w / 2, y]]); y -= th; w = w2; }
    S.push([[cx - w * 0.6, y], [cx - w * 0.35, y - th * 0.7], [cx + w * 0.35, y - th * 0.7], [cx + w * 0.6, y]]);
    S.push([[cx - 8, y - th * 0.7], [cx, y - th * 1.5], [cx + 8, y - th * 0.7]]); };
  tower(560, 250, 6, 70); tower(810, 150, 4, 60);
  house(920, 130, 160);
  for (const px of [440, 690, 1050]) { S.push([[px - 4, 620], [px - 4, 380], [px + 4, 380], [px + 4, 620]]); S.push([[px + 4, 384], [px + 64, 404], [px + 4, 426]]); } // banner poles
  return S;
}
const bbox = (P) => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of P) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; };
function cityGold() {
  return cached('ccity_g', 1080, 700, 1, () => { const c = ctx; const S = cityShapes();
    S.forEach((P, i) => { const [a, b, cc, d] = bbox(P); c.beginPath(); P.forEach((p, k) => (k ? c.lineTo(...p) : c.moveTo(...p))); c.closePath();
      const j = i - (S.length - 6);
      if (j >= 0) { c.fillStyle = j % 2 ? VERM : '#B88A35'; c.fill(); }
      else goldFill(a, b, cc, d, 24);
      c.strokeStyle = 'rgba(60,36,8,0.6)'; c.lineWidth = 2; c.stroke(); });
    // doors / windows as lacquer cut-outs
    c.fillStyle = '#0E1440';
    for (const [x, y, w, h] of [[75, 560, 30, 60], [210, 540, 40, 80], [345, 575, 30, 45], [535, 560, 50, 60], [960, 560, 44, 60], [795, 580, 30, 40]]) { c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.fill(); }
    // flaking broken edges
    c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 260; i++) { const s = 3 + rnd(i * 5) * 7; c.fillRect(rnd(i * 3 + 1) * 1080, 150 + rnd(i * 7 + 2) * 530, s, s); }
  });
}
function citySonar() {
  return cached('ccity_s', 1080, 700, 1, () => { const c = ctx; const S = cityShapes();
    for (const P of S) { for (let k = 0; k < P.length; k++) { const [x0, y0] = P[k], [x1, y1] = P[(k + 1) % P.length], n = Math.max(1, Math.hypot(x1 - x0, y1 - y0) / 13 | 0);
      for (let j = 0; j < n; j++) { const u = j / n, x = lerp(x0, x1, u) + (rnd(x0 + j * 3 + y0) - 0.5) * 4, y = lerp(y0, y1, u) + (rnd(y0 + j * 5) - 0.5) * 4; K.glow(x, y, 10, '65,255,154', 0.35); c.fillStyle = rnd(j + x0) > 0.3 ? GREEN : '#1C7A4C'; c.fillRect(x - 2.5, y - 2.5, 5, 5); } }
      const [a, b, cc, d] = bbox(P); c.save(); c.beginPath(); P.forEach((p, k) => (k ? c.lineTo(...p) : c.moveTo(...p))); c.closePath(); c.clip(); c.fillStyle = 'rgba(28,122,76,0.55)';
      for (let y = b + 8; y < d; y += 16) for (let x = a + 8; x < cc; x += 16) if (rnd(x * 0.7 + y * 1.3) > 0.45) c.fillRect(x, y, 3, 3); c.restore(); }
  });
}
// depth gauge on the left edge (cached ruler), marker drawn live
function gaugeImg() {
  return cached('cgauge', 200, H, 1, () => { const c = ctx; c.fillStyle = 'rgba(1,10,6,0.6)'; c.fillRect(0, 160, 120, 1140);
    c.strokeStyle = 'rgba(65,255,154,0.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(30, 180); c.lineTo(30, 1280); c.stroke();
    c.font = '900 22px Inter'; c.textBaseline = 'middle'; c.fillStyle = GREEN;
    for (let y = 200, i = 0; y <= 1280; y += 27, i++) { const big = i % 4 === 0; c.beginPath(); c.moveTo(30, y); c.lineTo(big ? 62 : 44, y); c.lineWidth = big ? 3 : 2; c.stroke();
      if (big) c.fillText(`-${(i / 4) * 5} m`, 40, y - 14); } });
}
function gauge(my, label) { blit(gaugeImg(), 0, 0, 14, 0, 1); ctx.save(); ctx.fillStyle = '#CFF6FF';
  ctx.beginPath(); ctx.moveTo(48, my); ctx.lineTo(80, my - 14); ctx.lineTo(80, my + 14); ctx.closePath(); ctx.fill(); ctx.fillRect(44, my - 2, 96, 4);
  if (label) { ctx.font = '900 26px Inter'; ctx.textBaseline = 'middle'; ctx.fillText(label, 88, my - 26); } ctx.restore(); }

// ───────────── sonar sweep with persistent returns (ping-pong scan from (SX, SY)) ─────────────
const SX = 540, SY = 1300, OM = 1.7, AMP = 1.3;
const sweepAng = (t) => -Math.PI / 2 + AMP * Math.sin(t * OM);
/** seconds since the beam last crossed angle a (Infinity if never) */
function since(a, t) { const s = (a + Math.PI / 2) / AMP; if (s < -1 || s > 1) return Infinity; const b1 = Math.asin(s), b2 = Math.PI - b1; let best = -Infinity;
  for (const b of [b1, b2]) { const k = Math.floor((OM * t - b) / TAU); const tau = (b + TAU * k) / OM; if (tau > best) best = tau; } return t - best; }
function drawSweep(t, a = 0.4) { ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, W + 400, SY + 200 - 10); ctx.clip();
  const ang = sweepAng(t), dir = Math.cos(t * OM) >= 0 ? 1 : -1; ctx.translate(SX, SY); if (dir < 0) ctx.scale(-1, 1);
  sweep(0, 0, dir < 0 ? -Math.PI - ang : ang, 1500, a); ctx.restore();
  K.glow(SX, SY, 60, '65,255,154', 0.5); }
/** returns for a dot list [{x,y,a(angle),b(base)}] */
function returns(D, t, base = 0, sz = 1) { for (const d of D) { const s = since(d.a, t); const k = s < 1.3 ? 1 - s / 1.3 : 0; const al = Math.max(k, base * d.b); if (al > 0.02) gdot(d.x, d.y, al, sz); } }
const mkDots = (pts) => pts.map(([x, y], i) => ({ x, y, a: Math.atan2(y - SY, x - SX), b: 0.5 + 0.5 * rnd(i * 1.7) }));

// the U-shaped structure (record side, illustration), centred (540, 800)
let UD = null, SEA = null;
function uDots() {
  if (UD) return UD; const P = [];
  const wall = (x0, y0, x1, y1, step = 15) => { const n = Math.hypot(x1 - x0, y1 - y0) / step | 0; for (let j = 0; j <= n; j++) P.push([lerp(x0, x1, j / n) + (rnd(P.length) - 0.5) * 5, lerp(y0, y1, j / n) + (rnd(P.length + 9) - 0.5) * 5]); };
  // outer + inner outline of a thick U (open at top)
  wall(300, 560, 300, 1010); wall(300, 1010, 780, 1010); wall(780, 1010, 780, 560); wall(300, 560, 360, 560); wall(720, 560, 780, 560);
  wall(360, 560, 360, 950); wall(360, 950, 720, 950); wall(720, 950, 720, 560);
  for (let y = 575; y < 1000; y += 22) { P.push([330 + (rnd(y) - 0.5) * 12, y]); P.push([750 + (rnd(y + 3) - 0.5) * 12, y]); }
  for (let x = 380; x < 710; x += 24) P.push([x, 980 + (rnd(x) - 0.5) * 10]);
  // a few tumbled blocks around
  for (const [bx, by] of [[200, 720], [870, 840], [460, 1110], [640, 1090], [240, 1040]]) { wall(bx - 30, by - 18, bx + 30, by - 18, 12); wall(bx + 30, by - 18, bx + 30, by + 18, 12); wall(bx + 30, by + 18, bx - 30, by + 18, 12); wall(bx - 30, by + 18, bx - 30, by - 18, 12); }
  UD = mkDots(P); return UD;
}
function seaDots() { if (SEA) return SEA; const P = []; for (let i = 0; i < 170; i++) { const r = 200 + rnd(i * 3.1) * 1000, a = -Math.PI / 2 + (rnd(i * 5.3) - 0.5) * 2.6; const x = SX + Math.cos(a) * r, y = SY + Math.sin(a) * r * 0.85; if (y > 200 && y < 1260 && x > 20 && x < 1060) P.push([x, y]); } SEA = mkDots(P); return SEA; }
/** the U scene: pulse = how much the found outline breathes (0..1) */
function uScene(t, pulse = 0, dim = 0) {
  sonar(1.06); blit(bathyImg(), 540, 960, 540, 960, 1.05);
  drawSweep(t, 0.42 * (1 - dim * 0.5));
  returns(seaDots(), t, 0.0, 0.8);
  const pb = pulse * (0.45 + 0.35 * Math.sin(t * 7));
  if (pulse > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 6; ctx.strokeStyle = `rgba(65,255,154,${0.25 * pb})`;
    ctx.beginPath(); ctx.moveTo(300, 560); ctx.lineTo(300, 1010); ctx.lineTo(780, 1010); ctx.lineTo(780, 560); ctx.moveTo(360, 560); ctx.lineTo(360, 950); ctx.lineTo(720, 950); ctx.lineTo(720, 560); ctx.stroke(); ctx.restore(); }
  returns(uDots(), t, pb, 1.1);
  ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, W + 400, 1490); ctx.clip(); ping(SX, SY, (t * 1.0) % 1.7, 2, 900); ctx.restore();
  calm();
}

// ───────────── the shots ─────────────
export function buildC(add, cue) {
  const t8 = L(8), t9 = L(9), t10 = L(10), END = T.dur;
  const tEro = Wd('erosion', 8), tFl = Wd('floods', 8), tRi = Wd('rising', 8), tCen = Wd('centuries', 8);
  const tSome = Wd('some', 9), tEl = Wd('eleven', 9), tYrs = Wd('years', 9), tHis = Wd('historians', 9), tDou = Wd('doubtful', 9);
  const tCur = Wd('curse', 10), tSlow = Wd('slow', 10), tLost = Wd('lost', 10), tTell = Wd('tell', 10), tBelow = Wd('below', 10), tWatch = Wd('watch', 10), tWL = Wd('waterline', 10);
  const c2s = tFl - 0.12, c3s = tCen - 0.12, c5s = tEl - 0.15, c6s = tHis - 0.12, c8s = tTell - 0.12, c9s = tWatch - 0.1;

  // ── c1 · EROSION: the gold coast crumbles square by square into sonar dots ──
  const SQ = []; { let i = 0; for (let col = 0; col < 6; col++) for (let row = 0; row < 7; row++) { if (row < col - 3) continue; const x = 520 + col * 30, y = 700 + row * 30;
    SQ.push({ x, y, col, row, i: i++, tr: lerp(tEro - 0.1, c2s - 0.35, clamp((5 - col) / 6 + rnd(i * 3.3) * 0.16)), sx: 520 + rnd(i * 7) * 480, sy: 1080 + rnd(i * 11) * 170, vx: 40 + rnd(i * 2) * 120 }); } }
  const landImg = () => cached('cland', 620, 600, 1, () => { const c = ctx; c.beginPath(); c.moveTo(-10, 120); for (let x = 0; x <= 520; x += 20) c.lineTo(x, 100 + Math.sin(x * 0.05) * 6); c.lineTo(520, 600); c.lineTo(-10, 600); c.closePath(); goldFill(0, 90, 520, 600, 26);
    c.strokeStyle = 'rgba(60,36,8,0.6)'; c.lineWidth = 2; c.stroke(); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 70; i++) { const s = 3 + rnd(i * 5) * 7; c.fillRect(rnd(i * 3 + 1) * 520, 100 + rnd(i * 7 + 2) * 500, s, s); } });
  const WY1 = 900;
  add({ id: 'c1', at: t8, zoom: 0.08, cam: [560, 860], note: 'EROSION: gold coast crumbles into sonar dots',
    draw(lt, d, t) {
      const wy = WY1 - 10 * Math.sin(lt * 1.3);
      const fallers = [];
      split(wy, t, () => {
        K.glow(780, 420, 420, '120,130,255', 0.12);
        blit(landImg(), 0, 0, 0, 600, 1);
        blit(cityGold(), 540, 620, 270, 708, 0.48);
        for (const q of SQ) { const dt = t - q.tr;
          if (dt < 0) { const wob = dt > -0.35 ? Math.sin(t * 60 + q.i) * 2 * (1 + dt / 0.35) : 0; ctx.fillStyle = (q.i % 3) ? '#E3BC62' : '#F2D98E'; ctx.fillRect(q.x + wob, q.y, 30, 30); ctx.strokeStyle = 'rgba(110,70,20,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(q.x + wob, q.y, 30, 30); continue; }
          const tc = Math.sqrt(2 * Math.max(1, wy - q.y) / 1400);
          if (dt < tc) { const x = q.x + q.vx * dt, y = q.y + 700 * dt * dt; ctx.save(); ctx.translate(x + 15, y + 15); ctx.rotate(dt * (3 + q.col)); ctx.fillStyle = dt * 20 % 2 < 1 ? '#F7E2A0' : GOLD; ctx.fillRect(-14, -14, 28, 28); ctx.restore(); }
          fallers.push([q, dt, tc]);
        }
        tag('EROSION', 540, 400, 'green', 112, land(t, tEro).s, land(t, tEro).a);
      }, () => {
        // drowned cliff as returns
        for (let y = wy + 20; y < 1250; y += 16) gdot(520 + Math.sin(y * 0.05) * 8, y, 0.45, 0.8);
        for (let x = 0; x < 1080; x += 18) gdot(x, 1250 + Math.sin(x * 0.02) * 20, 0.3, 0.7);
        drawSweep(t, 0.32);
        for (const [q, dt, tc] of fallers) { if (dt < tc) continue; const u = eo(clamp((dt - tc) / 0.9)); const x0 = q.x + 15 + q.vx * tc;
          gdot(lerp(x0, q.sx, u), lerp(wy, q.sy, u), 1 - 0.4 * u + 0.4 * u * (0.5 + 0.5 * Math.sin(t * 5 + q.i)), 1);
          ping(x0, wy, dt - tc, 1, 70, '207,246,255'); }
      });
      flakes(640, 720, t - tEro, 22, 5, 300, 120);
      calm();
    } });
  cue(t8, 'bubbles', { gain: 0.3 }); cue(tEro, 'rumble', { gain: 0.45, dur: 1.4 });
  for (const k of [0, 0.35, 0.7]) cue(tEro + 0.15 + k, 'plop', { gain: 0.25, pan: 0.2 });

  // ── c2 · FLOODS / RISING SEA: the waterline surges, then climbs the depth gauge; gold becomes sonar ──
  const CB = 1080;   // city base y
  const wy2 = (t) => 1120 - 200 * eob(seg(t, tFl, tFl + 0.45)) - 300 * eio(seg(t, tRi - 0.05, c3s + 0.1)) - 8 * Math.sin(t * 3);
  add({ id: 'c2', at: c2s, zoom: 0.07, cam: [560, 760], note: 'FLOODS + RISING SEA: waterline climbs a depth gauge over the gold city',
    draw(lt, d, t) {
      const wy = wy2(t);
      split(wy, t, () => {
        K.glow(540, 500, 520, '233,196,106', 0.08);
        blit(cityGold(), 540, 660, 560, CB, 0.92);
        glint(cityGold(), 540, 660, 560, CB, 0.92, seg(t, c2s + 0.05, c2s + 0.85), 160);
      }, () => { blit(citySonar(), 540, 660, 560, CB, 0.92); drawSweep(t, 0.25); });
      flakes(560, wy, t - tFl, 30, 21, 600, 600);
      ping(560, wy, t - tRi, 2, 500, '207,246,255');
      gauge(wy);
      const f = land(t, tFl), r = land(t, tRi);
      tag('FLOODS', 600, 210, 'green', 92, f.s, f.a);
      tag('RISING SEA', 600, 340, 'green', 92, r.s, r.a);
      calm();
    } });
  cue(tFl, 'swell', { gain: 0.5 }); cue(tFl + 0.05, 'bubbles', { gain: 0.35 }); cue(tRi, 'swell', { gain: 0.4, dur: 1.2 }); cue(tRi + 0.1, 'tock', { gain: 0.35 });

  // ── c3 · CENTURIES: full sonar, the drowned city as returns, a tick dial fills ──
  add({ id: 'c3', at: c3s, zoom: 0.09, cam: [540, 700], note: 'CENTURIES: sonar city + filling tick dial',
    draw(lt, d, t) {
      split(200 - 20 * eo(clamp(lt / d)), t, null, () => {
        ctx.save(); ctx.globalAlpha = 0.75; blit(citySonar(), 540, 660, 540, 1240, 0.95); ctx.restore();
        drawSweep(t, 0.3);
      }, 0.04);
      const cx = 540, cy = 640, R = 230, n = 60, fill = eio(clamp(lt / (d * 0.92)));
      ctx.save(); ctx.fillStyle = 'rgba(1,10,6,0.6)'; ctx.beginPath(); ctx.arc(cx, cy, R + 40, 0, TAU); ctx.fill(); ctx.restore();
      for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * TAU, on = i / n < fill, big = i % 5 === 0, r0 = R - (big ? 40 : 22);
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.lineWidth = big ? 7 : 4; ctx.strokeStyle = on ? GREEN : 'rgba(28,122,76,0.45)'; ctx.stroke(); }
      const ha = -Math.PI / 2 + fill * TAU; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * (R - 50), cy + Math.sin(ha) * (R - 50)); ctx.lineWidth = 6; ctx.strokeStyle = '#CFF6FF'; ctx.stroke();
      K.glow(cx + Math.cos(ha) * R, cy + Math.sin(ha) * R, 50, '65,255,154', 0.8);
      ping(cx, cy, (lt % 0.5), 1, 300);
      const c = land(t, c3s + 0.1); tag('CENTURIES', 540, 1000, 'green', 104, c.s, c.a);
      calm();
    } });
  for (let k = 0; k < 4; k++) cue(c3s + 0.12 + k * 0.32, 'tock', { gain: 0.3 });

  // ── c4 · SOME CLAIM: the sweep finds a U-shaped outline ──
  add({ id: 'c4', at: t9, zoom: 0.07, cam: [540, 780], note: 'SOME CLAIM: sonar U-structure found by the sweep',
    draw(lt, d, t) {
      uScene(t, clamp((lt - 0.8) / 0.8));
      const s = land(t, tSome); tag('SOME CLAIM', 540, 300, 'green', 96, s.s, s.a);
      tag('ILLUSTRATION', 930, 140, 'green', 26, 1, 0.7);
    } });
  cue(tSome, 'pop', { gain: 0.45 }); cue(t9 + 1.1, 'tock', { gain: 0.35 });

  // ── c5 · 11,000 YEARS?: closer, the U pulses, the number spins up ──
  add({ id: 'c5', at: c5s, zoom: 0.08, cam: [540, 760], note: '11,000 YEARS? number spins up over pulsing U',
    draw(lt, d, t) {
      uScene(t, 1);
      tag('SOME CLAIM', 540, 260, 'green', 80, 1, 1);
      const u = seg(t, c5s, tYrs + 0.25);
      if (u < 1) { const n = Math.round(11000 * eo(u) / 10) * 10, s = n.toLocaleString('en-US') + ' YEARS?';
        ctx.save(); ctx.font = '900 104px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const w = ctx.measureText(s).width;
        rr(540 - w / 2 - 40, 425 - 68, w + 80, 136, 14); ctx.fillStyle = 'rgba(1,10,6,0.82)'; ctx.fill(); ctx.strokeStyle = 'rgba(65,255,154,0.6)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = GREEN; ctx.fillText(s, 540, 428); ctx.restore(); }
      else { const k = 1 + 0.12 * (1 - eo(seg(t, tYrs + 0.25, tYrs + 0.55))); tag('11,000 YEARS?', 540, 425, 'green', 104, k, 1); ping(540, 425, t - tYrs - 0.25, 2, 380); }
    } });
  cue(tEl, 'zip', { gain: 0.4 }); cue(tYrs + 0.25, 'pop', { gain: 0.45 });

  // ── c6 · HISTORIANS: DOUBTFUL: amber stamp; hedge tags stay up ──
  add({ id: 'c6', at: c6s, zoom: 0.06, cam: [540, 700], note: 'HISTORIANS: DOUBTFUL amber stamp; SOME CLAIM + 11,000 YEARS? stay',
    draw(lt, d, t) {
      uScene(t, 0.7, 0.4);
      ctx.fillStyle = `rgba(0,0,0,${0.35 * seg(t, tDou, tDou + 0.3)})`; ctx.fillRect(-300, -300, W + 600, H + 600);
      tag('SOME CLAIM', 540, 250, 'green', 72, 1, 0.95);
      tag('11,000 YEARS?', 540, 380, 'green', 92, 1, 0.95);
      const h = land(t, c6s + 0.1); tag('HISTORIANS:', 540, 640, 'amber', 80, h.s, h.a);
      const u = seg(t, tDou, tDou + 0.22);
      if (u > 0) { const s = lerp(2.2, 1, eo(u)) + 0.04 * Math.sin(seg(t, tDou + 0.22, tDou + 0.6) * Math.PI) ;
        ctx.save(); ctx.translate(540, 840); ctx.rotate(-0.08); ctx.scale(s, s); ctx.globalAlpha = clamp(u * 2);
        rr(-380, -100, 760, 200, 18); ctx.lineWidth = 10; ctx.strokeStyle = AMBER; ctx.stroke(); ctx.fillStyle = 'rgba(30,14,0,0.78)'; ctx.fill();
        rr(-360, -82, 720, 164, 10); ctx.lineWidth = 3; ctx.stroke();
        const spr = sonText('DOUBTFUL', 124, AMBER, '255,181,71'); blit(spr, spr._w / 2, spr._h / 2, 0, 6, 1);
        ctx.restore();
        K.glow(540, 840, 600, '255,181,71', 0.35 * (1 - seg(t, tDou + 0.2, tDou + 0.7)));
        flakes(540, 900, t - tDou - 0.2, 18, 41, 380, 600); }
    } });
  cue(tHis, 'tock', { gain: 0.3 }); cue(tDou + 0.2, 'thud', { gain: 0.7 }); cue(tDou + 0.2, 'slam', { gain: 0.35 });

  // ── c7 · CURSE? / SLOW SEA? / LOST AGE?: tags swing in on their words over the waterline ──
  const TAGS = [
    { txt: 'CURSE?', kind: 'gold', x: 320, y: 360, t0: tCur, dir: -1, size: 104 },
    { txt: 'SLOW SEA?', kind: 'green', x: 690, y: 590, t0: tSlow, dir: 1, size: 96 },
    { txt: 'LOST AGE?', kind: 'amber', x: 400, y: 820, t0: tLost, dir: -1, size: 96 },
  ];
  // pendulum from a pivot above the frame: drops + swings in from the side, settles with a damped wobble
  const swing = (g, t, x, y, s = 1, a = 1) => { const dt = t - g.t0 + 0.12; if (dt < 0) return;
    const len = y + 60, ang = g.dir * (0.75 * (1 - eo(clamp(dt / 0.42))) + 0.07 * Math.exp(-2.5 * dt) * Math.sin(dt * 9));
    ctx.save(); ctx.translate(x, -60); ctx.rotate(ang);
    ctx.strokeStyle = g.kind === 'gold' ? 'rgba(233,196,106,0.8)' : g.kind === 'amber' ? 'rgba(255,181,71,0.8)' : 'rgba(65,255,154,0.8)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, len - g.size * 0.66 * s); ctx.stroke();
    tag(g.txt, 0, len, g.kind, g.size, s, a); ctx.restore(); };
  add({ id: 'c7', at: t10, zoom: 0.06, cam: [540, 700], note: 'CURSE? / SLOW SEA? / LOST AGE? swing in',
    draw(lt, d, t) {
      const wy = 1140 + 10 * Math.sin(t * 1.4);
      split(wy, t, () => { blit(cityGold(), 540, 660, 540, 1180, 0.8); },
        () => { blit(citySonar(), 540, 660, 540, 1180, 0.8); drawSweep(t, 0.25); });
      for (const g of TAGS.slice().reverse()) { swing(g, t, g.x, g.y); const dt = t - g.t0 - 0.25;
        if (g.kind === 'gold') flakes(g.x, g.y, dt, 20, 61, 300, 260); else ping(g.x, g.y, dt, 2, 180, g.kind === 'amber' ? '255,181,71' : '65,255,154'); }
      calm();
    } });
  cue(tCur, 'whoosh', { gain: 0.45, pan: -0.3 }); cue(tCur + 0.15, 'sparkle', { gain: 0.35 });
  cue(tSlow, 'whoosh', { gain: 0.45, pan: 0.3 }); cue(tSlow + 0.15, 'bubbles', { gain: 0.3 });
  cue(tLost, 'whoosh', { gain: 0.45, pan: -0.2 }); cue(tLost + 0.15, 'pop', { gain: 0.35 });

  // ── c8 · TELL ME BELOW: tags lift into a row, arrow bobs down ──
  add({ id: 'c8', at: c8s, zoom: 0.05, cam: [540, 700], note: 'TELL ME BELOW + down arrow',
    draw(lt, d, t) {
      sonar(1.06); blit(bathyImg(), 540, 960, 540, 960, 1.05); drawSweep(t, 0.3);
      const u = eo(clamp(lt / 0.4));
      const row = [[200, 230], [540, 230], [880, 230]];
      TAGS.forEach((g, i) => { const x = lerp(g.x, row[i][0], u), y = lerp(g.y, row[i][1], u); tag(g.txt, x, y, g.kind, g.size, lerp(1, 0.5, u), 1); });
      const a = land(t, tTell - 0.05);
      tag('TELL ME', 540, 520, 'green', 132, a.s, a.a);
      const b = land(t, tBelow - 0.05); tag('BELOW', 540, 690, 'green', 132, b.s, b.a);
      const k = seg(t, tBelow, tBelow + 0.3);
      if (k > 0) { const bob = 26 * Math.sin((t - tBelow) * 8);
        ctx.save(); ctx.globalAlpha = clamp(k * 2); ctx.translate(540, 1000 + bob); ctx.fillStyle = GREEN;
        K.glow(0, 60, 160, '65,255,154', 0.35);
        ctx.fillRect(-22, -170, 44, 170); ctx.beginPath(); ctx.moveTo(-90, -10); ctx.lineTo(90, -10); ctx.lineTo(0, 120); ctx.closePath(); ctx.fill(); ctx.restore();
        ping(540, 1160, (t - tBelow) % 0.7, 1, 160); }
      calm();
    } });
  cue(tTell, 'pop', { gain: 0.45 }); cue(tBelow, 'plop', { gain: 0.4 }); cue(tBelow + 0.35, 'tock', { gain: 0.3 });

  // ── c9 · END CARD: waterline over a half-gold half-sonar city; WATCH AGAIN; on "waterline" it rises + pulses ──
  const TILE = 34;
  add({ id: 'c9', at: c9s, zoom: 0.05, cam: [540, 760], note: 'END CARD: WATCH AGAIN, AAZHI, waterline rises on "waterline"',
    draw(lt, d, t) {
      const r = seg(t, tWL, tWL + 0.7), wy = 880 - 110 * eob(r) - 40 * eio(seg(t, tWL + 0.7, END)) + 8 * Math.sin(t * 2.4);
      const pulse = Math.exp(-3 * Math.max(0, t - tWL)) * (t >= tWL ? 1 : 0);
      split(wy, t, () => { K.glow(540, 700, 600, '233,196,106', 0.1); blit(cityGold(), 540, 660, 540, 1120, 1); },
        () => { blit(citySonar(), 540, 660, 540, 1120, 1); drawSweep(t, 0.3); }, 0, 1);
      if (pulse > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = pulse; waterline(wy, t, '207,246,255', 0.0); ctx.restore();
        K.glow(540, wy, 700, '207,246,255', 0.3 * pulse); }
      ping(540, wy, t - tWL, 3, 460, '207,246,255');
      flakes(540, wy, t - tWL, 28, 77, 500, 800);
      // WATCH AGAIN: leaf-lay (tiles drop in, staggered), then a glint
      const spr = goldText('WATCH AGAIN', 118), sw = spr._w, sh = spr._h, ox = 540 - sw / 2, oy = 330 - sh / 2;
      ctx.save(); rr(ox + 20, oy + 10, sw - 40, sh - 20, 16); ctx.fillStyle = `rgba(8,10,34,${0.75 * clamp(lt / 0.3)})`; ctx.fill(); ctx.restore();
      for (let ty = 0; ty < sh; ty += TILE) for (let tx = 0; tx < sw; tx += TILE) { const i = tx / TILE + ty / TILE * 0.7, st = 0.03 * i + rnd(tx + ty * 3) * 0.12, u = eo(seg(lt, st, st + 0.3)); if (u <= 0) continue;
        const tw = Math.min(TILE, sw - tx), th = Math.min(TILE, sh - ty);
        ctx.save(); ctx.globalAlpha = clamp(u * 1.5); ctx.translate(ox + tx + tw / 2, oy + ty + th / 2 - 50 * (1 - u)); ctx.rotate((rnd(tx * 3 + ty) - 0.5) * 0.8 * (1 - u));
        ctx.drawImage(spr, tx, ty, tw, th, -tw / 2, -th / 2, tw, th); ctx.restore(); }
      glint(spr, sw / 2, sh / 2, 540, 330, 1, seg(lt, 0.9, 1.6)); glint(spr, sw / 2, sh / 2, 540, 330, 1, seg(t, tWL, tWL + 0.6));
      const am = clamp((lt - 0.5) / 0.4);
      if (am > 0) { const a = goldText('AAZHI', 46); blit(a, a._w / 2, a._h / 2, 540, 160, 1, am); }
      calm();
    } });
  cue(tWatch, 'sparkle', { gain: 0.4 }); cue(tWL, 'swell', { gain: 0.55, dur: 1.5 }); cue(tWL + 0.05, 'bubbles', { gain: 0.35 }); cue(tWL + 0.1, 'pop', { gain: 0.35 });
}
