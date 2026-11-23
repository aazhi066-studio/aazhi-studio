// EPISODE 20 · worker C : "Forged Iron & Rust", lines 8-10 (textbooks / theory / the question / end card)
//   c1  L8 -> "plainer"      TEXTBOOKS SAY: an iron-bound school book flips open, abstract grey bars type in
//   c2  "plainer" -> "died"  rivet map, NERKATTUMSEVAL hot rivet, dotted hot-cut route escapes off the map; ESCAPED
//   c3  "died" -> L9         dim rust horizon, lone faceless silhouette walks away, foreground ember dies; DIED IN EXILE
//   c4  L9 -> "quiet"        rust bloom wipe: closed iron door, thin light under it; A THEORY; red-hot ? hot-cut + COVER-UP?
//   c5  "quiet" -> "none"    the wall beside the door: an empty noose SHADOW sways in the door light
//   c6  "none" -> L10        wide: door + shadow + cooling ?, UNPROVEN stencil stamps down
//   c7  L10 -> "tell"        MIRACLE? / ESCAPE? / COVER-UP? swing in on chains, one per word
//   c8  "tell" -> "watch"    the chain of questions pulls up, TELL ME BELOW + bobbing iron arrow
//   c9  "watch" -> end       end card: broken chain link glowing, WATCH AGAIN, AAZHI; on "chains" the link re-welds + rattles
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit, lg, poly, mixc, dust } from './art.js';
import * as K from './core/kit.js';

// ───────────── shared helpers (copied from ART.md) ─────────────
// blackened iron plate filling the frame (cached): gradient + brushed grain + scratches + rust blooms + vignette
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
// domed rivet
function rivet(x, y, r = 9) { const c = ctx; const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r);
  g.addColorStop(0, '#8C8378'); g.addColorStop(0.5, '#3E3731'); g.addColorStop(1, '#120F0D'); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = g; c.fill(); }
// hot-cut stroke along pts ([x,y] list): p = 0..1 reveal; newest ~12% of the drawn length glows white-hot -> orange, older part cools to dull red/dark
function hotCut(pts, p = 1, w = 6, cool = 0.6) { const c = ctx, n = Math.max(2, Math.floor(pts.length * p)); if (n < 2) return; const hot = Math.max(2, Math.floor(n * 0.12));
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); for (let i = 0; i < n; i++) i ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.strokeStyle = `rgba(168,50,26,${0.35 + 0.5 * (1 - cool)})`; c.lineWidth = w; c.stroke();
  c.beginPath(); for (let i = n - hot; i < n; i++) i > n - hot ? c.lineTo(...pts[i]) : c.moveTo(...pts[i]); c.strokeStyle = '#FF7A1A'; c.lineWidth = w * 1.4; c.stroke();
  c.strokeStyle = '#FFE6A8'; c.lineWidth = w * 0.5; c.stroke();
  if (p < 1) { const [x, y] = pts[n - 1]; K.glow(x, y, w * 7, '255,190,100', 0.8); } }
// spark spray at (x,y): t = seconds since the burst, n sparks, seed
function sparks(x, y, t, n = 24, seed = 1, spd = 700) { const c = ctx; if (t < 0 || t > 1.2) return;
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(seed + i) - 0.5) * 2.6, v = spd * (0.4 + rnd(seed + i * 3) * 0.8), life = 0.5 + rnd(seed + i * 7) * 0.6; if (t > life) continue;
    const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + 900 * t * t, k = 1 - t / life;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px - Math.cos(a) * 18 * k, py - (Math.sin(a) * v + 1800 * t) / v * 18 * k);
    c.strokeStyle = `rgba(255,${150 + 90 * k | 0},${60 * k | 0},${k})`; c.lineWidth = 2.5; c.stroke(); } }

// ───────────── small helpers (worker C) ─────────────
const bg = (k = 1.04) => blit(plateImg(), 540, 960, 540, 960, k);
function img(c, ox, oy, x, y, s = 1, rot = 0, a = 1, sy = s) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); blit(c, ox, oy, 0, 0, s, a, sy); ctx.restore(); }
const lighter = (fn) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; fn(); ctx.restore(); };
const oval = (x, y, rx, ry, col, a) => { ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); K.glow(0, 0, rx, col, a); ctx.restore(); };

// stencil tag: Inter 900 caps in ember light cut through a dark riveted plate, with vertical bridge bars
const HUE = {
  ember: { glow: '#FF7A1A', top: '#FFE6A8', bot: '#FF9A3A', fill: '#FFB25A' },
  red: { glow: '#D8321A', top: '#FFC9A8', bot: '#E8401E', fill: '#FF6A40' },
};
const TD = new Map();
function tagDims(text, size) {
  const k = text + '|' + size; let d = TD.get(k); if (d) return d;
  ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = `${Math.round(size * 0.06)}px`; const tw = ctx.measureText(text).width; ctx.restore();
  const padX = size * 0.5, padY = size * 0.36; d = { tw, w: Math.ceil(tw + padX * 2), h: Math.ceil(size * 0.95 + padY * 2), m: 34 }; TD.set(k, d); return d;
}
function tagImg(text, size = 80, hue = 'ember') {
  const d = tagDims(text, size), { w, h, m, tw } = d, HU = HUE[hue];
  return cached(`c_tag_${text}_${size}_${hue}`, w + m * 2, h + m * 2, 1.5, () => { const c = ctx, r = size * 0.12;
    c.fillStyle = 'rgba(0,0,0,0.5)'; rr(m + 6, m + 10, w, h, r); c.fill();
    rr(m, m, w, h, r); c.fillStyle = lg(0, m, 0, m + h, [[0, '#332B25'], [0.5, '#231E1A'], [1, '#141110']]); c.fill();
    c.save(); rr(m, m, w, h, r); c.clip();
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(200,190,175,${0.02 + rnd(i + w) * 0.04})`; c.fillRect(m + rnd(i * 3 + h) * w, m + rnd(i * 5 + w) * h, 20 + rnd(i) * 80, 1); }
    for (let i = 0; i < 3; i++) { const x = m + rnd(i + size) * w, y = m + rnd(i * 7 + size) * h, rad = 20 + rnd(i + 3) * 40;
      const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(138,59,23,0.35)'); g.addColorStop(1, 'rgba(94,42,18,0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    c.restore();
    rr(m, m, w, h, r); c.strokeStyle = '#0A0807'; c.lineWidth = 4; c.stroke();
    c.beginPath(); c.moveTo(m + r, m + 2.5); c.lineTo(m + w - r, m + 2.5); c.strokeStyle = 'rgba(230,205,170,0.4)'; c.lineWidth = 2; c.stroke();
    // letters: light behind the cut
    c.font = `900 ${size}px Inter`; c.letterSpacing = `${Math.round(size * 0.06)}px`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const cx = m + w / 2, cy = m + h / 2 + size * 0.04;
    c.save(); c.shadowColor = HU.glow; c.shadowBlur = size * 0.4; c.fillStyle = HU.fill; c.fillText(text, cx, cy); c.fillText(text, cx, cy); c.restore();
    c.fillStyle = lg(0, cy - size * 0.4, 0, cy + size * 0.4, [[0, HU.top], [1, HU.bot]]); c.fillText(text, cx, cy);
    // stencil bridges
    const nb = text.length > 8 ? 3 : 2;
    for (let i = 0; i < nb; i++) { const bx = cx - tw / 2 + tw * (i + 1) / (nb + 1) + (rnd(i + size) - 0.5) * size * 0.3;
      c.fillStyle = '#26201B'; c.fillRect(bx - size * 0.035, cy - size * 0.5, size * 0.07, size); }
    const ri = Math.max(5, size * 0.085), o = size * 0.2;
    rivet(m + o, m + o, ri); rivet(m + w - o, m + o, ri); rivet(m + o, m + h - o, ri); rivet(m + w - o, m + h - o, ri);
  });
}
// draw a tag centred at (x,y) (or hanging from its top-centre with top:true)
function tag(text, x, y, size = 80, o = {}) {
  const { s = 1, a = 1, rot = 0, hue = 'ember', heat = 0, top = false } = o; if (a <= 0 || s <= 0) return;
  const d = tagDims(text, size), c = tagImg(text, size, hue);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  blit(c, d.m + d.w / 2, top ? d.m : d.m + d.h / 2, 0, 0, s, a);
  if (heat > 0) lighter(() => { ctx.translate(0, top ? d.h / 2 * s : 0); ctx.scale(1, d.h / d.w * 1.4); K.glow(0, 0, d.w * 0.6 * s, '255,170,80', heat * 0.55 * a); });
  ctx.restore();
}
const slamS = (lt, t0, dur = 0.28) => (lt < t0 ? 0 : 1 + 0.35 * (1 - eob(seg(lt, t0, t0 + dur))));

// chain links (cached sprites): face-on ring and edge-on bar, with an ember edge
function linkFace() { return cached('c_linkF', 120, 76, 2, () => { const c = ctx;
  rr(14, 14, 92, 48, 24); c.strokeStyle = '#100D0B'; c.lineWidth = 17; c.stroke();
  rr(14, 14, 92, 48, 24); c.strokeStyle = lg(0, 6, 0, 70, [[0, '#6A5D52'], [0.35, '#3A322C'], [1, '#110E0C']]); c.lineWidth = 12; c.stroke();
  rr(6, 6, 108, 64, 32); c.strokeStyle = 'rgba(255,122,26,0.9)'; c.lineWidth = 2.5; c.stroke();
  rr(22, 22, 76, 32, 16); c.strokeStyle = 'rgba(255,160,70,0.55)'; c.lineWidth = 1.6; c.stroke(); }); }
function linkEdge() { return cached('c_linkE', 120, 76, 2, () => { const c = ctx;
  rr(6, 29, 108, 18, 9); c.fillStyle = '#100D0B'; c.fill();
  rr(8, 31, 104, 14, 7); c.fillStyle = lg(0, 31, 0, 45, [[0, '#6A5D52'], [0.5, '#2E2723'], [1, '#110E0C']]); c.fill();
  c.beginPath(); c.moveTo(14, 30); c.lineTo(106, 30); c.strokeStyle = 'rgba(255,140,50,0.9)'; c.lineWidth = 2; c.stroke(); }); }
function chain(ax, ay, bx, by, sc = 1, ph = 0, fromEnd = false) {
  const dx = bx - ax, dy = by - ay, dist = Math.hypot(dx, dy); if (dist < 4) return; const ang = Math.atan2(dy, dx), pitch = 66 * sc, n = Math.max(1, Math.round(dist / pitch)), st = dist / n;
  const F = linkFace(), E = linkEdge();
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < n; i++) { if (((fromEnd ? n - 1 - i : i) + ph) % 2 !== pass) continue;
    const f = (i + 0.5) * st; img(pass ? E : F, 60, 38, ax + Math.cos(ang) * f, ay + Math.sin(ang) * f, st / 66, ang); }
}

// densify a polyline
function dens(pts, step = 10) { const out = [];
  for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step)); for (let k = 0; k < n; k++) out.push([lerp(ax, bx, k / n), lerp(ay, by, k / n)]); }
  out.push(pts[pts.length - 1]); return out; }
function bez(p0, p1, p2, p3, n = 60) { const out = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t;
  out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return out; }
// a question mark path (hook + stem), height ~ s; dot drawn separately at (cx, cy + 0.38 s)
function qPts(cx, cy, s) { const pts = [], a0 = 195 * Math.PI / 180, a1 = 400 * Math.PI / 180;
  for (let i = 0; i <= 44; i++) { const a = a0 + (a1 - a0) * i / 44; pts.push([cx + Math.cos(a) * 0.36 * s, cy - 0.45 * s + Math.sin(a) * 0.36 * s]); }
  const [lx, ly] = pts[pts.length - 1]; for (let i = 1; i <= 18; i++) { const f = i / 18; pts.push([lerp(lx, cx, f), lerp(ly, cy + 0.17 * s, eo(f))]); }
  return pts; }
// a hot rivet place marker
function hotRivet(x, y, r, heat, t) { const fl = 0.85 + 0.15 * Math.sin(t * 9 + x);
  K.glow(x, y, r * 6, '255,122,26', 0.55 * heat * fl); circle(x, y, r * 1.3, '#120F0D');
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); g.addColorStop(0, mixc('#8C8378', '#FFE6A8', heat)); g.addColorStop(0.6, mixc('#3E3731', '#FF7A1A', heat)); g.addColorStop(1, mixc('#120F0D', '#A8321A', heat));
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = g; ctx.fill(); }

// rust bloom wipe: draws `prev`, then reveals `next` inside a noisy spreading rust blob from (ox, oy)
function rustWipe(p, ox, oy, prev, next, seed = 3) {
  if (p >= 1) { next(); return; } prev(); if (p <= 0) return;
  const R = p * 1900, path = new Path2D(), N = 72;
  for (let i = 0; i <= N; i++) { const a = i / N * TAU, k = 1 + 0.12 * Math.sin(a * 5 + seed) + 0.08 * Math.sin(a * 11 + seed * 2) + 0.06 * (rnd(seed + i) - 0.5);
    const x = ox + Math.cos(a) * R * k, y = oy + Math.sin(a) * R * k; i ? path.lineTo(x, y) : path.moveTo(x, y); }
  path.closePath();
  for (let i = 0; i < 9; i++) { const a = rnd(seed + i * 7) * TAU, dd = R * (0.95 + rnd(seed + i * 3) * 0.25), r = R * (0.05 + rnd(seed + i) * 0.08); path.moveTo(ox + Math.cos(a) * dd + r, oy + Math.sin(a) * dd); path.arc(ox + Math.cos(a) * dd, oy + Math.sin(a) * dd, r, 0, TAU); }
  ctx.save(); ctx.clip(path); next(); ctx.restore();
  ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(94,42,18,0.9)'; ctx.lineWidth = 34; ctx.stroke(path); ctx.strokeStyle = 'rgba(181,84,31,0.85)'; ctx.lineWidth = 12; ctx.stroke(path); ctx.strokeStyle = 'rgba(255,150,60,0.6)'; ctx.lineWidth = 3; ctx.stroke(path); ctx.restore();
}

// ───────────── set pieces (cached) ─────────────
const BK = { x: 540, y: 560, w: 380, h: 500 };
function coverImg() { return cached('c_cover', BK.w + 20, BK.h + 20, 1.5, () => { const c = ctx, w = BK.w, h = BK.h;
  rr(0, 0, w, h, 10); c.fillStyle = lg(0, 0, w, h, [[0, '#4A2C1C'], [0.6, '#33200F'], [1, '#1E120A']]); c.fill();
  for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(0,0,0,${0.08 + rnd(i + 40) * 0.1})`; c.fillRect(rnd(i) * w, rnd(i + 9) * h, 2 + rnd(i + 3) * 4, 2); }
  // iron spine strap, middle band, corner brackets
  c.fillStyle = '#2B2520'; c.fillRect(0, 0, 34, h); c.fillRect(0, h * 0.5 - 22, w, 44);
  for (const [x, y, sx, sy] of [[w, 0, -1, 1], [w, h, -1, -1]]) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + sx * 90, y); c.lineTo(x + sx * 90, y + sy * 26); c.lineTo(x + sx * 26, y + sy * 26); c.lineTo(x + sx * 26, y + sy * 90); c.lineTo(x, y + sy * 90); c.closePath(); c.fillStyle = '#2E2823'; c.fill(); c.strokeStyle = 'rgba(230,200,160,0.25)'; c.lineWidth = 2; c.stroke(); }
  c.strokeStyle = 'rgba(230,200,160,0.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, h * 0.5 - 22); c.lineTo(w, h * 0.5 - 22); c.moveTo(34, 0); c.lineTo(34, h); c.stroke();
  for (let i = 0; i < 6; i++) rivet(60 + i * 58, h * 0.5, 7); for (let i = 0; i < 7; i++) rivet(17, 30 + i * 74, 6);
  // title block: blank bars only
  rr(90, 90, 230, 110, 8); c.fillStyle = 'rgba(20,14,10,0.6)'; c.fill(); c.strokeStyle = 'rgba(255,150,70,0.35)'; c.stroke();
  c.fillStyle = '#8A8174'; rr(115, 118, 180, 18, 6); c.fill(); rr(140, 154, 130, 12, 5); c.fill();
}); }
function pageImg(spineLeft) { return cached('c_page' + (spineLeft ? 'R' : 'L'), BK.w, BK.h, 1.5, () => { const c = ctx, w = BK.w, h = BK.h;
  c.fillStyle = lg(0, 0, 0, h, [[0, '#B3AA9C'], [1, '#8E8577']]); c.fillRect(0, 0, w, h);
  for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(60,50,40,${0.04 + rnd(i + 7) * 0.06})`; c.fillRect(rnd(i + 70) * w, rnd(i + 170) * h, 1 + rnd(i) * 2, 1 + rnd(i + 1) * 2); }
  const g = spineLeft ? lg(0, 0, 70, 0, [[0, 'rgba(30,20,12,0.6)'], [1, 'rgba(30,20,12,0)']]) : lg(w, 0, w - 70, 0, [[0, 'rgba(30,20,12,0.6)'], [1, 'rgba(30,20,12,0)']]);
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const e = lg(0, 0, 0, h, [[0, 'rgba(255,150,60,0.0)'], [1, 'rgba(255,120,40,0.14)']]); c.fillStyle = e; c.fillRect(0, 0, w, h);
}); }
// abstract grey bars, revealed row by row (r = rows shown, fractional)
function pageBars(x0, r, seed) { const rows = 12;
  for (let i = 0; i < rows; i++) { if (i >= r) break; const f = clamp(r - i), head = i === 0, gap = i >= 6 ? 26 : 0;
    const full = head ? 190 : (i === 5 || i === 11 ? 150 : 250 + rnd(seed + i) * 50), hh = head ? 18 : 10;
    rr(x0, 62 + i * 33 + gap + (head ? -4 : 0), full * f, hh, hh / 2); ctx.fillStyle = head ? '#4A443E' : '#69625A'; ctx.fill(); } }
function mapImg() { return cached('c_map', W, H, 1, () => { const c = ctx;
  blit(plateImg(), 0, 0, 0, 0, 1); c.fillStyle = 'rgba(4,8,12,0.45)'; c.fillRect(0, 0, W, H);
  const land = MAPLAND;
  poly(land.map(([x, y]) => [x + 6, y + 14])); c.fillStyle = 'rgba(0,0,0,0.55)'; c.fill();
  poly(land); c.fillStyle = lg(0, 150, 0, 1200, [[0, '#3A322B'], [1, '#26201B']]); c.fill();
  c.save(); poly(land); c.clip(); blit(plateImg(), 0, 0, 0, 0, 1, 0.5);
  for (let i = 0; i < 12; i++) { const x = rnd(i + 900) * W, y = 200 + rnd(i + 950) * 900, r = 60 + rnd(i + 990) * 140; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(138,59,23,0.3)'); g.addColorStop(1, 'rgba(94,42,18,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  // ghats ridge as a cut seam
  c.beginPath(); c.moveTo(130, 300); c.bezierCurveTo(260, 600, 300, 900, 400, 1080); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 10; c.stroke(); c.strokeStyle = 'rgba(220,200,170,0.12)'; c.lineWidth = 2; c.stroke();
  c.restore();
  poly(land); c.strokeStyle = 'rgba(230,205,170,0.35)'; c.lineWidth = 2.5; c.stroke();
  const cp = dens(MAPLAND.slice(1, -1), 30); for (const [x, y] of cp) if (y > 140 && x > -10 && x < W + 10) rivet(x, y, 8);
  // sea scratch lines
  for (let i = 0; i < 8; i++) { const y = 1000 + i * 40; c.beginPath(); c.moveTo(620 + i * 30, y); c.lineTo(1080, y - 20); c.strokeStyle = 'rgba(143,179,201,0.06)'; c.lineWidth = 2; c.stroke(); }
}); }
const MAPLAND = [[-60, 120], [1140, 120], [1060, 300], [1030, 470], [1015, 580], [960, 700], [880, 830], [760, 870], [660, 900], [580, 965], [520, 1060], [430, 1150], [360, 1110], [280, 1050], [200, 900], [120, 700], [50, 480], [-60, 300]];
const NERK = [402, 897], SANK = [428, 862], MADU = [575, 676];

// exile landscape: far layer (sky + far ridges), near layer (ground + road)
function exFarImg() { return cached('c_exFar', W + 240, 1100, 1, () => { const c = ctx, w = W + 240;
  c.fillStyle = lg(0, 0, 0, 940, [[0, '#0D0B0A'], [0.55, '#1E1410'], [0.85, '#4A2114'], [1, '#6E2C16']]); c.fillRect(0, 0, w, 1100);
  for (let i = 0; i < 300; i++) { const y = rnd(i) * 900, v = rnd(i + 3); c.fillStyle = `rgba(200,190,175,${0.01 + v * 0.02})`; c.fillRect(rnd(i + 5) * w, y, 40 + v * 200, 1); }
  const sg = c.createRadialGradient(700, 920, 10, 700, 920, 420); sg.addColorStop(0, 'rgba(255,140,60,0.5)'); sg.addColorStop(0.15, 'rgba(200,80,30,0.3)'); sg.addColorStop(1, 'rgba(120,40,20,0)'); c.fillStyle = sg; c.fillRect(0, 400, w, 700);
  c.beginPath(); c.arc(700, 925, 70, Math.PI, TAU); c.fillStyle = '#A8321A'; c.fill();
  const ridge = (y0, amp, seed, col, edge) => { const pts = [[0, 1100]]; for (let x = 0; x <= w; x += 30) pts.push([x, y0 - amp * (0.5 + 0.5 * Math.sin(x * 0.006 + seed)) - amp * 0.4 * rnd(seed + x)]); pts.push([w, 1100]);
    poly(pts); c.fillStyle = col; c.fill(); c.beginPath(); pts.slice(1, -1).forEach((p, i) => (i ? c.lineTo(...p) : c.moveTo(...p))); c.strokeStyle = edge; c.lineWidth = 2; c.stroke(); };
  ridge(905, 70, 1, '#2A1D17', 'rgba(255,140,70,0.35)'); ridge(935, 50, 4, '#1C1512', 'rgba(255,120,60,0.25)');
}); }
function exNearImg() { return cached('c_exNear', W + 240, 1100, 1, () => { const c = ctx, w = W + 240, cx = w / 2;
  c.fillStyle = lg(0, 0, 0, 1100, [[0, '#1A1411'], [1, '#0B0908']]); c.fillRect(0, 60, w, 1040);
  for (let i = 0; i < 500; i++) { const y = 60 + rnd(i + 11) * 1040, v = rnd(i + 13); c.fillStyle = v > 0.5 ? `rgba(200,190,175,${0.012 + v * 0.025})` : `rgba(0,0,0,${0.08 + v * 0.1})`; c.fillRect(rnd(i + 15) * w, y, 30 + v * 240 * (y / 1100), 1 + (v * 2 | 0)); }
  poly([[cx - 8, 60], [cx + 8, 60], [cx + 420, 1100], [cx - 420, 1100]]); c.fillStyle = lg(0, 60, 0, 1100, [[0, 'rgba(110,44,22,0.55)'], [0.3, 'rgba(58,44,36,0.6)'], [1, 'rgba(36,30,26,0.7)']]); c.fill();
  for (let i = 1; i < 14; i++) { const f = Math.pow(i / 14, 1.8), y = 60 + f * 1040, dx = 8 + f * 412; rivet(cx - dx - 14 * f, y, 2 + 10 * f); rivet(cx + dx + 14 * f, y, 2 + 10 * f); }
  const top = c.createLinearGradient(0, 60, 0, 120); top.addColorStop(0, 'rgba(255,120,60,0.25)'); top.addColorStop(1, 'rgba(255,120,60,0)'); c.fillStyle = top; c.fillRect(0, 60, w, 60);
}); }
// faceless walker seen from behind (Puli Thevar silhouette: turban, curved sword, tiger-stripe shield on his back)
function walker(x, fy, s, ph) { const c = ctx, col = '#0B0908';
  c.save(); c.translate(x, fy); c.scale(s, s);
  for (let k = 0; k < 2; k++) { const sw = Math.sin(ph + k * Math.PI), lift = Math.max(0, sw) * 16, fx = (k ? 18 : -18) + sw * 4;
    poly([[k ? 4 : -26, -175], [k ? 26 : -4, -175], [fx + 9, -lift], [fx - 9, -lift]]); c.fillStyle = col; c.fill(); }
  poly([[-30, -170], [30, -170], [46, -300], [-46, -300]]); c.fillStyle = col; c.fill();
  for (let k = 0; k < 2; k++) { const sw = Math.sin(ph + k * Math.PI) * 0.18, sx = k ? 44 : -44; c.save(); c.translate(sx, -292); c.rotate((k ? -1 : 1) * 0.08 + sw); rr(-8, 0, 16, 120, 8); c.fillStyle = col; c.fill(); c.restore(); }
  ell(0, -322, 20, 25, col); ell(0, -345, 30, 18, col); ell(14, -356, 10, 8, col);
  // sword at the hip
  c.beginPath(); c.moveTo(30, -185); c.quadraticCurveTo(70, -130, 58, -60); c.strokeStyle = col; c.lineWidth = 8; c.lineCap = 'round'; c.stroke();
  // shield on the back, hot-cut tiger stripes (illustration)
  circle(0, -238, 38, '#17120F'); c.beginPath(); c.arc(0, -238, 38, 0, TAU); c.strokeStyle = 'rgba(168,50,26,0.8)'; c.lineWidth = 2.5; c.stroke();
  c.lineWidth = 4; c.strokeStyle = '#FF7A1A';
  for (const [a, b] of [[-20, -258], [-6, -232], [10, -258]]) { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo(a + 10, b + 10, a + 4, b + 24); c.stroke(); }
  // ember rim on the right edge
  c.beginPath(); c.moveTo(46, -300); c.lineTo(30, -170); c.strokeStyle = 'rgba(255,122,26,0.5)'; c.lineWidth = 2.5; c.stroke();
  c.restore(); }

// iron wall + floor, iron door, noose shadow
function wallImg() { return cached('c_wall', W, H, 1, () => { const c = ctx;
  blit(plateImg(), 0, 0, 0, 0, 1); c.fillStyle = 'rgba(8,12,18,0.35)'; c.fillRect(0, 0, W, H);
  for (const y of [300, 720]) { c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, y, W, 5); c.fillStyle = 'rgba(230,205,170,0.12)'; c.fillRect(0, y + 5, W, 2); for (let x = 30; x < W; x += 70) rivet(x, y + 26, 7); }
  for (const x of [140, 940]) { c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(x, 0, 4, 1160); }
  c.fillStyle = lg(0, 1160, 0, H, [[0, '#14110F'], [0.3, '#0D0B0A'], [1, '#060505']]); c.fillRect(0, 1160, W, H - 1160);
  c.fillStyle = 'rgba(230,205,170,0.2)'; c.fillRect(0, 1160, W, 2);
  for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(540 + i * 60, 1162); c.lineTo(540 + i * 240, H); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 2; c.stroke(); }
}); }
const DR = { w: 440, h: 780 };
function doorImg() { return cached('c_door', DR.w + 80, DR.h + 40, 1.5, () => { const c = ctx, w = DR.w, h = DR.h, o = 40;
  c.fillStyle = '#080706'; c.fillRect(0, 0, w + 80, h + 40);
  c.fillStyle = lg(0, 0, w + 80, 0, [[0, '#2A2420'], [0.5, '#3A322C'], [1, '#1E1A17']]); rr(6, 6, w + 68, h + 34, 6); c.fill();
  rr(o, o, w, h, 4); c.fillStyle = lg(o, 0, o + w, 0, [[0, '#26201C'], [0.4, '#332B25'], [1, '#191512']]); c.fill();
  for (let i = 0; i < 260; i++) { const v = rnd(i + 33); c.fillStyle = v > 0.5 ? `rgba(200,190,175,${0.02 + v * 0.03})` : `rgba(0,0,0,${0.06 + v * 0.08})`; c.fillRect(o + rnd(i + 34) * w * 0.9, o + rnd(i + 35) * h, 20 + v * 100, 1); }
  for (let i = 0; i < 4; i++) { const x = o + rnd(i + 61) * w, y = o + rnd(i + 62) * h, r = 40 + rnd(i + 63) * 80; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(138,59,23,0.3)'); g.addColorStop(1, 'rgba(94,42,18,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  for (const y of [o + 70, o + h * 0.36, o + h * 0.64, o + h - 70]) { c.fillStyle = '#1A1613'; c.fillRect(o, y - 20, w, 40); c.fillStyle = 'rgba(230,205,170,0.2)'; c.fillRect(o, y - 20, w, 2); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(o, y + 18, w, 3); for (let x = o + 26; x < o + w; x += 56) rivet(x, y, 7); }
  c.beginPath(); c.arc(o + w - 60, o + h * 0.5, 28, 0, TAU); c.strokeStyle = '#0C0A09'; c.lineWidth = 12; c.stroke(); c.strokeStyle = 'rgba(200,180,150,0.3)'; c.lineWidth = 2; c.stroke(); rivet(o + w - 60, o + h * 0.5 - 30, 9);
  c.strokeStyle = 'rgba(230,205,170,0.22)'; c.lineWidth = 2; c.strokeRect(o, o, w, h);
}); }
function nooseImg() { return cached('c_noose', 320, 980, 1, () => { const c = ctx;
  c.filter = 'blur(6px)'; c.strokeStyle = 'rgba(0,0,0,0.92)'; c.fillStyle = 'rgba(0,0,0,0.92)'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(160, 0); c.lineTo(160, 620); c.lineWidth = 16; c.stroke();
  for (let i = 0; i < 7; i++) { rr(132, 560 + i * 16, 56, 13, 6); c.fill(); }
  c.beginPath(); c.ellipse(160, 790, 78, 105, 0, -Math.PI / 2 + 0.25, Math.PI * 1.5 - 0.25); c.lineWidth = 16; c.stroke();
  c.filter = 'none';
}); }
const doorLight = (x, y, w, t, a = 1) => { const fl = 0.78 + 0.22 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1);
  lighter(() => { oval(x, y + 6, w * 0.95, 90, '255,170,80', 0.5 * fl * a); oval(x, y, w * 0.55, 16, '255,220,150', 0.8 * fl * a); });
  ctx.fillStyle = `rgba(255,230,168,${0.95 * fl * a})`; ctx.fillRect(x - w / 2, y - 3, w, 5); };

// the hanging chain of question tags (c7, c8): returns nothing, pure function of film time t
const QT = [['MIRACLE?', 'ember', 'miracle', -1], ['ESCAPE?', 'ember', 'escape', 1], ['COVER-UP?', 'red', 'cover', -1]];
function qStack(t, hits) { const size = 104;
  let ax = 540, ay = 30, lens = [150, 76, 76];
  for (let i = 0; i < 3; i++) { const t0 = hits[i] - 0.1, tau = t - t0; if (tau < 0) break;
    const ang = QT[i][3] * 1.15 * Math.exp(-3.2 * tau) * Math.cos(7 * tau) + 0.035 * Math.sin(t * 2.1 + i * 1.7);
    const px = ax - Math.sin(ang) * lens[i], py = ay + Math.cos(ang) * lens[i];
    chain(ax, ay, px, py, 0.62, i);
    const d = tagDims(QT[i][0], size), heat = 1 - seg(tau, 0.12, 1.0);
    tag(QT[i][0], px, py, size, { top: true, rot: ang, hue: QT[i][1], heat });
    rivet(px, py + 16, 8);
    if (tau < 1.2) sparks(px, py, tau - 0.2, 18, 40 + i * 9, 520);
    ax = px - Math.sin(ang) * (d.h - 16); ay = py + Math.cos(ang) * (d.h - 16);
  } }

// ───────────── the shots ─────────────
export function buildC(add, cue) {
  const t8 = L(8), tPlain = Wd('plainer', 8), tEsc = Wd('escaped', 8), tDied = Wd('died', 8);
  const t9 = L(9), tCov = Wd('covered', 9), tQuiet = Wd('quiet', 9), tExec = Wd('execution', 9), tNone = Wd('none', 9), tProven = Wd('proven', 9);
  const t10 = L(10), hits = [Wd('miracle', 10), Wd('escape', 10), Wd('cover', 10)], tTell = Wd('tell', 10), tWatch = Wd('watch', 10), tListen = Wd('listen', 10), tChains = Wd('chains', 10);

  const textbooks = (lt, s = 1) => tag('TEXTBOOKS SAY', 540, 170, 58, { s: s * slamS(lt, 0), a: clamp(lt / 0.12) });

  // c1 · the school book flips open, grey bars only
  add({ id: 'c1', at: t8, cam: [540, 760], zoom: 0.08, note: 'TEXTBOOKS SAY: iron-bound school book flips open, abstract grey bars type in', draw(lt, d, t) {
    bg(); lighter(() => K.glow(540, 640, 760, '255,122,26', 0.16));
    const p = eio(seg(lt, 0.12, 0.6)), r = 13 * seg(lt, 0.6, d - 0.15);
    ctx.save(); ctx.translate(-BK.w / 2 * (1 - p), -14 * Math.sin(p * Math.PI));
    ell(540, BK.y + BK.h + 26, 470, 42, 'rgba(0,0,0,0.55)');
    // page block thickness
    ctx.fillStyle = '#5E574F'; ctx.fillRect(BK.x, BK.y + 6, BK.w + 6, BK.h); ctx.fillStyle = '#3B2418'; ctx.fillRect(BK.x - 4, BK.y + BK.h, BK.w + 14, 12);
    blit(pageImg(true), 0, 0, BK.x, BK.y, 1); ctx.save(); ctx.translate(BK.x, BK.y); pageBars(44, r - 1, 7); ctx.restore();
    if (p < 0.5) { const sx = Math.max(0.001, 1 - 2 * p); ctx.save(); ctx.translate(BK.x, BK.y); ctx.scale(sx, 1); blit(coverImg(), 0, 0, 0, 0, 1); ctx.fillStyle = `rgba(0,0,0,${p * 1.2})`; ctx.fillRect(0, 0, BK.w, BK.h); ctx.restore(); }
    else { const sx = Math.max(0.001, 2 * p - 1); ctx.fillStyle = '#3B2418'; ctx.fillRect(BK.x - BK.w * sx - 10, BK.y + BK.h, BK.w * sx + 10, 12);
      ctx.save(); ctx.translate(BK.x, BK.y); ctx.scale(sx, 1); ctx.translate(-BK.w, 0); ctx.fillStyle = '#5E574F'; ctx.fillRect(-6, 6, BK.w, BK.h); blit(pageImg(false), 0, 0, 0, 0, 1); pageBars(40, r, 3); ctx.fillStyle = `rgba(0,0,0,${(1 - sx) * 0.6})`; ctx.fillRect(0, 0, BK.w, BK.h); ctx.restore(); }
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(BK.x - 3, BK.y, 6, BK.h); ctx.restore();
    // a reading line of ember light passing down the open pages
    if (p >= 1) lighter(() => { const y = BK.y + 60 + 34 * Math.min(r, 12); oval(540, y, 520, 22, '255,150,60', 0.18); });
    sparks(BK.x, BK.y + BK.h, lt - 0.6, 26, 11, 600); sparks(BK.x - 300, BK.y + BK.h, lt - 0.62, 12, 23, 400);
    K.embers(t, 18, 5, '255,150,70');
    textbooks(lt, 1);
  } });
  cue(t8, 'whoosh', { gain: 0.4 }); cue(t8 + 0.02, 'tock', { gain: 0.35 }); cue(t8 + 0.6, 'thud', { gain: 0.55 }); cue(t8 + 0.62, 'sparkle', { gain: 0.2 });

  // c2 · rivet map: the dotted hot-cut route leaves Nerkattumseval
  const route = bez(NERK, [300, 820], [210, 600], [40, 250], 80);
  add({ id: 'c2', at: tPlain, cam: [380, 760], zoom: 0.12, note: 'rivet map, NERKATTUMSEVAL hot rivet, dotted hot-cut route escapes NW off the map; ESCAPED', draw(lt, d, t) {
    blit(mapImg(), 540, 960, 540, 960, 1.04);
    hotRivet(...MADU, 11, 0.25, t); hotRivet(...SANK, 10, 0.3, t); hotRivet(...NERK, 13, 1, t);
    const pr = seg(lt, 0.12, d - 0.05);
    ctx.save(); ctx.setLineDash([2, 24]); hotCut(route, pr, 11, 0.4); ctx.restore();
    if (pr > 0 && pr < 1) { const [hx, hy] = route[Math.max(0, Math.floor(route.length * pr) - 1)]; sparks(hx, hy, (lt * 3) % 0.5, 10, (lt * 3 | 0) * 13 + 5, 380); }
    tag('NERKATTUMSEVAL', 560, 990, 40, { a: clamp(lt / 0.15) });
    textbooks(lt + 1);
    const te = tEsc - tPlain; tag('ESCAPED', 640, 360, 120, { s: slamS(lt, te), heat: 1 - seg(lt, te, te + 0.6), rot: -0.04 });
    sparks(640, 420, lt - te - 0.05, 26, 31, 650);
  } });
  cue(tPlain, 'zip', { gain: 0.45 }); cue(tPlain + 0.15, 'sizzle', { gain: 0.3, dur: 1.1 }); cue(tEsc, 'slam', { gain: 0.5 });

  // c3 · died in exile: lone silhouette walks into a dim horizon, an ember dies
  const sceneExile = (lt, d, t) => {
    blit(plateImg(), 540, 960, 540, 960, 1.04);
    blit(exFarImg(), 660, 0, 540 - lt * 14, 0, 1);
    blit(exNearImg(), 660, 0, 540 - lt * 26, 840, 1);
    const u = clamp(lt / 1.6), fy = lerp(1110, 985, u), s = lerp(0.62, 0.36, u);
    ell(540 - lt * 26, fy + 4, 46 * s, 9 * s, 'rgba(0,0,0,0.6)');
    walker(540 - lt * 26, fy, s, t * 7);
    // foreground ember dying out
    const heat = 1 - seg(lt, 0.15, 1.5), ex = 800, ey = 1215;
    lighter(() => K.glow(ex, ey, 30 + 110 * heat, heat > 0.5 ? '255,160,70' : '200,70,30', 0.15 + 0.55 * heat));
    circle(ex, ey, 9, mixc('#2B1A12', heat > 0.5 ? '#FFC15A' : '#A8321A', Math.min(1, heat * 1.6)));
    ctx.save(); for (let i = 0; i < 5; i++) { const ph = (lt * 0.7 + i / 5) % 1, yy = ey - 20 - ph * 260, xx = ex + Math.sin(ph * 6 + i) * 30 * ph; ctx.fillStyle = `rgba(150,140,130,${0.12 * (1 - ph) * (1 - heat * 0.5)})`; ctx.beginPath(); ctx.arc(xx, yy, 10 + ph * 40, 0, TAU); ctx.fill(); } ctx.restore();
    K.embers(t, 10, 9, '255,120,60');
  };
  add({ id: 'c3', at: tDied, cam: [540, 900], zoom: 0.07, note: 'dim rust horizon, lone faceless turbaned silhouette walks away, foreground ember dies; DIED IN EXILE', draw(lt, d, t) {
    sceneExile(lt, d, t);
    textbooks(lt + 1);
    tag('DIED IN EXILE', 540, 380, 100, { s: lerp(1.15, 1, eo(seg(lt, 0.05, 0.4))), a: seg(lt, 0.05, 0.25), heat: 0.6 * (1 - seg(lt, 0.1, 0.9)) });
    tag('ILLUSTRATION', 880, 1255, 26, { a: 0.85 });
  } });
  cue(tDied, 'whoosh', { gain: 0.3 }); cue(tDied + 0.05, 'drum', { gain: 0.35 }); cue(tDied + 0.2, 'sizzle', { gain: 0.18, dur: 1.2 });

  // c4-c6 · the theory: closed iron door, light under it, noose shadow, red-hot ?
  const qp = qPts(540, 800, 330), qOn = (t) => seg(t, tCov - 0.05, tCov + 0.55);
  const theory = (lt, from = 0) => tag('A THEORY', 540, 200, 72, { s: slamS(lt, from), a: clamp((lt - from) / 0.1), heat: 0.6 * (1 - seg(lt, from, from + 0.7)) });
  const qMark = (t, cool) => { const p = qOn(t); if (p <= 0) return;
    lighter(() => K.glow(540, 760, 260, '255,80,30', 0.22 * (1 - cool * 0.6) * (0.85 + 0.15 * Math.sin(t * 8))));
    hotCut(qp, p, 14, cool); if (p >= 1) { circle(540, 800 + 0.38 * 330, 15, mixc('#FFC15A', '#6E2014', cool)); lighter(() => K.glow(540, 925, 50, '255,120,50', 0.6 * (1 - cool))); }
    if (p < 1) { const [hx, hy] = qp[Math.max(0, Math.floor(qp.length * p) - 1)]; sparks(hx, hy, (t * 4) % 0.4, 10, (t * 4 | 0) * 7 + 3, 420); } };
  const sceneDoor = (lt, d, t) => {
    blit(wallImg(), 540, 960, 540, 960, 1.04);
    lighter(() => K.glow(540, 260, 900, '143,179,201', 0.08));
    blit(doorImg(), (DR.w + 80) / 2, DR.h + 40, 540, 1162, 1);
    doorLight(540, 1160, DR.w, t);
    qMark(t, seg(t, tCov + 0.6, tCov + 2.5) * 0.7);
    tag('COVER-UP?', 540, 440, 84, { hue: 'red', s: slamS(t, tCov + 0.2), heat: 1 - seg(t, tCov + 0.2, tCov + 0.9) });
    dust(t, 20, 4, '255,200,140', 0.25);
  };
  add({ id: 'c4', at: t9, cam: [540, 820], zoom: 0.1, note: 'rust bloom wipe -> closed iron door, light under it; A THEORY; red-hot ? hot-cut into the door + COVER-UP?', draw(lt, d, t) {
    rustWipe(eio(seg(lt, 0, 0.5)), 820, 1150, () => sceneExile(tDied >= 0 ? t9 - tDied : 0, 1, t), () => sceneDoor(lt, d, t), 5);
    theory(lt, 0.05);
  } });
  cue(t9, 'swell', { gain: 0.3 }); cue(t9 + 0.1, 'rumble', { gain: 0.35 }); cue(t9 + 0.15, 'slam', { gain: 0.35 });
  cue(tCov - 0.05, 'zip', { gain: 0.4 }); cue(tCov, 'sizzle', { gain: 0.4, dur: 0.7 }); cue(tCov + 0.2, 'thud', { gain: 0.45 });

  add({ id: 'c5', at: tQuiet, cam: [420, 760], zoom: 0.08, note: 'the wall beside the door: an empty noose SHADOW sways in the door light (no body)', draw(lt, d, t) {
    blit(wallImg(), 540, 960, 540, 960, 1.04);
    blit(doorImg(), (DR.w + 80) / 2, DR.h + 40, 1000, 1162, 1); doorLight(1000, 1160, DR.w, t);
    lighter(() => { K.glow(440, 720, 560, '255,140,60', 0.16); oval(700, 1180, 560, 110, '255,150,60', 0.15); });
    const sw = 0.07 * Math.sin(t * 1.5), a = 0.75 * eo(seg(lt, 0, 0.6));
    img(nooseImg(), 160, 0, 400 + 30 * (1 - eo(seg(lt, 0, 0.8))), 90, 1, sw, a);
    theory(lt + 1);
    dust(t, 24, 8, '255,200,140', 0.3);
  } });
  cue(tQuiet, 'whoosh', { gain: 0.25 }); cue(tExec, 'heartbeat', { gain: 0.45 });

  add({ id: 'c6', at: tNone, cam: [540, 760], zoom: 0.06, note: 'wide: door + noose shadow + cooling ?, A THEORY; UNPROVEN stencil stamps down on "proven"', draw(lt, d, t) {
    const tp = tProven - tNone - 0.06, shake = lt > tp && lt < tp + 0.25 ? (1 - (lt - tp) / 0.25) * 10 : 0;
    ctx.save(); ctx.translate(Math.sin(lt * 90) * shake, Math.cos(lt * 70) * shake);
    blit(wallImg(), 540, 960, 540, 960, 1.04);
    ctx.save(); ctx.translate(690, 1162); ctx.scale(0.8, 0.8); ctx.translate(-540, -1162);
    blit(doorImg(), (DR.w + 80) / 2, DR.h + 40, 540, 1162, 1); doorLight(540, 1160, DR.w, t); qMark(t, 0.75); ctx.restore();
    lighter(() => K.glow(250, 720, 420, '255,140,60', 0.12));
    img(nooseImg(), 160, 0, 250, 150, 0.8, 0.06 * Math.sin(t * 1.5), 0.6);
    theory(lt + 1);
    tag('UNPROVEN', 540, 780, 130, { s: slamS(lt, tp, 0.22), rot: -0.12, heat: 1 - seg(lt, tp, tp + 0.7) });
    sparks(380, 820, lt - tp - 0.03, 22, 51, 620); sparks(700, 740, lt - tp - 0.05, 22, 77, 620);
    ctx.restore();
  } });
  cue(tNone, 'whoosh', { gain: 0.25 }); cue(tProven - 0.06, 'slam', { gain: 0.6 }); cue(tProven - 0.04, 'chisel', { gain: 0.3 });

  // c7 · three hot tags swing in on chains, one per word
  const beam = () => { ctx.fillStyle = lg(0, 0, 0, 56, [[0, '#2E2823'], [1, '#141110']]); ctx.fillRect(-60, -60, W + 120, 116); ctx.fillStyle = 'rgba(230,205,170,0.25)'; ctx.fillRect(-60, 54, W + 120, 2); for (let x = 20; x < W; x += 80) rivet(x, 26, 8); };
  const sceneQ = (t) => { bg(1.06); lighter(() => { K.glow(540, 560, 780, '255,122,26', 0.12); K.glow(120, 300, 500, '143,179,201', 0.06); }); beam(); qStack(t, hits); K.embers(t, 22, 13, '255,150,70'); };
  add({ id: 'c7', at: t10, cam: [540, 600], zoom: 0.08, note: 'MIRACLE? / ESCAPE? / COVER-UP? swing in on chains, each hot on its word', draw(lt, d, t) {
    rustWipe(eio(seg(lt, 0, 0.35)), 540, 40, () => { bg(); }, () => sceneQ(t), 9);
  } });
  hits.forEach((h, i) => { cue(h - 0.12, 'whoosh', { gain: 0.3, pan: [-0.4, 0.4, -0.4][i] }); cue(h + 0.1, 'slam', { gain: 0.45 + i * 0.05 }); cue(h + 0.12, 'chisel', { gain: 0.25 }); });

  // c8 · the chain of questions pulls up, TELL ME BELOW
  add({ id: 'c8', at: tTell, cam: [540, 760], zoom: 0.06, note: 'question chain pulls up small, TELL ME BELOW + bobbing iron arrow', draw(lt, d, t) {
    bg(1.06); lighter(() => K.glow(540, 860, 700, '255,122,26', 0.14));
    const k = eo(seg(lt, 0, 0.35)), sc = lerp(1, 0.56, k);
    ctx.save(); ctx.translate(540, 0); ctx.scale(sc, sc); ctx.translate(-540, 0); beam(); qStack(t, hits); ctx.restore();
    tag('TELL ME BELOW', 540, 860, 84, { s: slamS(lt, 0.08), heat: 1 - seg(lt, 0.1, 0.8) });
    const by = 1050 + 30 * Math.abs(Math.sin(lt * 6)), aa = seg(lt, 0.2, 0.4);
    ctx.save(); ctx.globalAlpha = aa; ctx.translate(540, by);
    poly([[-34, 0], [34, 0], [34, 60], [80, 60], [0, 150], [-80, 60], [-34, 60]]); ctx.fillStyle = lg(0, 0, 0, 150, [[0, '#3A322C'], [1, '#1A1613']]); ctx.fill(); ctx.strokeStyle = '#FF7A1A'; ctx.lineWidth = 3; ctx.stroke();
    rivet(0, 26, 7); ctx.restore();
    lighter(() => K.glow(540, by + 110, 120, '255,150,60', 0.3 * aa));
    sparks(540, 900, lt - 0.1, 22, 61, 600); K.embers(t, 16, 21, '255,150,70');
  } });
  cue(tTell, 'slam', { gain: 0.5 }); cue(tTell + 0.05, 'sparkle', { gain: 0.25 }); cue(tTell + 0.3, 'pop', { gain: 0.3 });

  // c9 · end card: broken link glowing, WATCH AGAIN, AAZHI; on "chains" the link re-welds and the chain rattles
  const weld = tChains + 0.05;
  add({ id: 'c9', at: tWatch, cam: [540, 700], zoom: 0.07, note: 'end card: broken chain link glowing, WATCH AGAIN, AAZHI; link re-welds on "chains", chain rattles', draw(lt, d, t) {
    bg(1.06); lighter(() => K.glow(540, 560, 800, '255,122,26', 0.12));
    const sep = 64 * (1 - eio(seg(t, weld - 0.3, weld))), rat = Math.exp(-4 * Math.max(0, t - tListen)) * (t > tListen ? 1 : 0) + Math.exp(-5 * Math.max(0, t - weld)) * (t > weld ? 1.4 : 0);
    const cy = 560 + Math.sin(t * 1.3) * 10, jy = Math.sin(t * 47) * 9 * rat, jr = Math.sin(t * 31) * 0.04 * rat;
    ctx.save(); ctx.translate(540, cy + jy); ctx.rotate(jr + 0.03 * Math.sin(t * 0.9));
    const hot = t < weld ? 0.75 + 0.25 * Math.sin(t * 9) : 1 - seg(t, weld, weld + 1.6) * 0.7;
    lighter(() => K.glow(0, 0, 260, '255,140,50', 0.35 * hot + 0.15));
    chain(-760, 0, -sep - 137, 0, 1.9, 1, true); chain(sep + 137, 0, 760, 0, 1.9, 1);
    // the big link: two halves (split down the middle) closing up
    for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * sep, 0); ctx.rotate(sd * 0.0035 * sep); ctx.beginPath(); ctx.rect(sd < 0 ? -200 : 0, -120, 200, 240); ctx.clip();
      rr(-110, -62, 220, 124, 62); ctx.strokeStyle = '#100D0B'; ctx.lineWidth = 34; ctx.stroke();
      rr(-110, -62, 220, 124, 62); ctx.strokeStyle = lg(0, -80, 0, 80, [[0, '#7A6A5C'], [0.35, '#3A322C'], [1, '#110E0C']]); ctx.lineWidth = 26; ctx.stroke();
      rr(-127, -79, 254, 158, 79); ctx.strokeStyle = `rgba(255,${120 + 80 * hot | 0},40,${0.5 + 0.5 * hot})`; ctx.lineWidth = 4; ctx.stroke();
      rr(-93, -45, 186, 90, 45); ctx.strokeStyle = `rgba(255,170,80,${0.3 + 0.4 * hot})`; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.restore();
      if (sep > 1) { for (const yy of [-62, 62]) { lighter(() => K.glow(sd * sep, yy, 34, '255,200,120', 0.8 * hot)); circle(sd * sep, yy, 6, '#FFE6A8'); } } }
    if (t > weld && t < weld + 0.5) lighter(() => { const f = 1 - (t - weld) / 0.5; K.glow(0, -62, 160 * f + 40, '255,230,170', f); K.glow(0, 62, 160 * f + 40, '255,230,170', f); });
    sparks(0, -62, t - weld, 30, 91, 750); sparks(0, 62, t - weld, 20, 97, 600);
    ctx.restore();
    // question row
    QT.forEach(([s, hue], i) => tag(s, [205, 520, 855][i], 220, 40, { hue, a: 0.9 * seg(lt, 0.2 + i * 0.08, 0.4 + i * 0.08), rot: Math.sin(t * 2 + i) * 0.04 }));
    tag('WATCH AGAIN', 540, 930, 104, { s: slamS(lt, 0.04), heat: 1 - seg(lt, 0.05, 0.8) });
    sparks(540, 980, lt - 0.06, 24, 71, 620);
    const wa = seg(lt, 0.5, 0.9); ctx.save(); ctx.globalAlpha = wa; ctx.font = '900 46px Inter'; ctx.letterSpacing = '14px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#C9B8A0'; ctx.fillText('AAZHI', 547, 1180);
    ctx.letterSpacing = '0px'; ctx.fillStyle = 'rgba(255,122,26,0.7)'; ctx.fillRect(330, 1178, 90, 3); ctx.fillRect(660, 1178, 90, 3); rivet(310, 1180, 6); rivet(770, 1180, 6); ctx.restore();
    K.embers(t, 20, 33, '255,150,70');
  } });
  cue(tWatch, 'slam', { gain: 0.5 }); cue(tWatch + 0.05, 'sparkle', { gain: 0.25 }); cue(tListen, 'chisel', { gain: 0.3 }); cue(tListen + 0.1, 'tock', { gain: 0.25 });
  cue(weld, 'slam', { gain: 0.55 }); cue(weld + 0.02, 'chisel', { gain: 0.35 }); cue(weld + 0.05, 'bell', { gain: 0.35 }); cue(weld + 0.1, 'sparkle', { gain: 0.3 });
}
