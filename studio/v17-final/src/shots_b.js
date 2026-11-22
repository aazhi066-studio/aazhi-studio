// EPISODE 17 · worker B : "Hammered Copper & Ink Erasure", lines 4-6 (L(4) -> L(7)).
//   b1  ring of copper plates spins like a carousel round the bronze ring, Pandya fish seal on top; TWO CENTURIES LATER
//   b2  one plate swings forward to the camera; a hammer punches the twin fish in repousse dots; PANDYA COPPER PLATE
//   b3  close on the grant: a crowned figure is punched in, black ink eats half of it; VELVIKUDI GRANT / c. 770 CE
//   b4  the half-erased king glows red-hot, heat at the edges; "KALI KING" / IT SAYS
//   b5  a red-hot ink ball rolls along a copper ledge and knocks a row of small crowned kings down like pins; IT SAYS
//   b6  new plate: the hammer punches a fish banner, sparks, ink waits at the edge; IT SAYS
//   b7  wide: Kadungon (outline, javelin + fish banner) punched in full, the ink is pushed back off the plate; KADUNGON
//   b8  copper map of the Tamil south: the ink retreats north off the map, the fish medallion rises; LATE 500s CE
//   b9  the blank centuries ruler: red-hot marker slides, ink drips and blots c. 250-575; c. 250-550 CE
//   b10 closer: the blot spreads and drips, "DARK AGE" stamped red-hot
// Plates, seal, map, ruler and pins are baked once with cached(); per frame only blits, punch dots, a hammer,
// sparks and a few ink circles. No shadowBlur anywhere.
import { ctx, W, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit } from './art.js';
import { glow } from './core/kit.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const K = { slate: '#0B0B0D', rim: '#4A6A8A', ink: '#050505', gloss: '#2A2A30', cold: '#EDEFF2', hot: '#FF4A1A', sp1: '#FF9A3C', sp2: '#FFE0A0' };

// ───────────── shared copper plate (copied exactly from ART.md) ─────────────
// copper plate centred at (x,y), size w x h, rotation rot; rows = number of abstract inscribed rows; seed varies the marks; patina 0..1
function copperPlate(x, y, w, h, rot = 0, rows = 6, seed = 1, patina = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, '#E08A4E'); g.addColorStop(0.45, '#B4552A'); g.addColorStop(1, '#6E2E14');
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.08); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,166,0.55)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#0B0B0D'; ctx.beginPath(); ctx.arc(-w / 2 + h * 0.16, 0, h * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(60,20,8,0.75)';
  for (let r = 0; r < rows; r++) { const yy = -h / 2 + h * (r + 1) / (rows + 1); let xx = -w / 2 + h * 0.3;
    for (let k = 0; xx < w / 2 - h * 0.08; k++) { const v = Math.sin((seed * 31 + r * 7 + k) * 12.9898) * 43758.5453, f = v - Math.floor(v), lw = 6 + f * 22;
      ctx.fillRect(xx, yy - 3, lw, 5); if (f > 0.6) ctx.fillRect(xx + lw * 0.5, yy - 10, 4, 7); xx += lw + 7 + f * 6; } }
  if (patina > 0) { ctx.fillStyle = `rgba(63,163,138,${0.55 * patina})`; for (let i = 0; i < 9; i++) { const v = Math.sin((seed + i) * 78.233) * 43758.5453, f = v - Math.floor(v);
    ctx.beginPath(); ctx.arc(-w / 2 + f * w, -h / 2 + ((f * 7) % 1) * h, h * (0.08 + f * 0.12) * patina, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
}

// ───────────── cached plate + per-frame dimming / sliding specular streak ─────────────
const PAD = 12;
const plateC = (w, h, rows, seed, pat) => cached(`bpl${w}x${h}r${rows}s${seed}p${pat}`, w + PAD * 2, h + PAD * 2, 1, () => copperPlate(w / 2 + PAD, h / 2 + PAD, w, h, 0, rows, seed, pat));
const plateS = (w, h) => cached(`bps${w}x${h}`, w + PAD * 2, h + PAD * 2, 0.5, () => { ctx.beginPath(); ctx.roundRect(PAD, PAD, w, h, h * 0.08); ctx.fillStyle = '#000'; ctx.fill(); });
function plate(x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.sx ?? 1, o.sy ?? 1);
  ctx.drawImage(plateC(w, h, o.rows ?? 6, o.seed ?? 1, o.pat ?? 0), -w / 2 - PAD, -h / 2 - PAD, w + PAD * 2, h + PAD * 2);
  if (o.sheen != null) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.08); ctx.clip(); ctx.transform(1, 0, -0.45, 1, 0, 0);
    const sx = lerp(-w / 2 - 260, w / 2 + 260, o.sheen), g = ctx.createLinearGradient(sx - 110, 0, sx + 110, 0);
    g.addColorStop(0, 'rgba(255,210,166,0)'); g.addColorStop(0.5, `rgba(255,210,166,${o.sheenA ?? 0.3})`); g.addColorStop(1, 'rgba(255,210,166,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(sx - 110, -h / 2 - 10, 220, h + 20); ctx.restore();
  }
  if (o.dark > 0) { ctx.globalAlpha *= clamp(o.dark); ctx.drawImage(plateS(w, h), -w / 2 - PAD, -h / 2 - PAD, w + PAD * 2, h + PAD * 2); }
  ctx.restore();
}
/** recessed panel hammered into a plate (hosts a repousse image) */
function panel(x0, y0, w, h) {
  ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 18);
  const g = ctx.createLinearGradient(x0, y0, x0 + w, y0 + h); g.addColorStop(0, '#8E431F'); g.addColorStop(1, '#4A1E0E'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(30,8,2,0.8)'; ctx.lineWidth = 7; ctx.stroke();
  ctx.beginPath(); ctx.roundRect(x0 + 5, y0 + 5, w - 10, h - 10, 14); ctx.strokeStyle = 'rgba(255,210,166,0.3)'; ctx.lineWidth = 2; ctx.stroke();
}

// ───────────── ground ─────────────
const bgC = () => cached('bbg', 1080, 1920, 0.5, () => {
  ctx.fillStyle = K.slate; ctx.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(${rnd(i) > 0.5 ? '120,140,165' : '0,0,0'},${0.02 + rnd(i + 3) * 0.05})`; ctx.fillRect(rnd(i * 3) * 1080, rnd(i * 7) * 1920, 20 + rnd(i * 5) * 160, 2 + rnd(i * 9) * 3); }
  let g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1300); g.addColorStop(0, 'rgba(74,106,138,0.28)'); g.addColorStop(1, 'rgba(74,106,138,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  g = ctx.createRadialGradient(1080, 700, 0, 1080, 700, 800); g.addColorStop(0, 'rgba(74,106,138,0.16)'); g.addColorStop(1, 'rgba(74,106,138,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
});
function bg(t) { blit(bgC(), 540, 960, 540 + sin(t * 0.3) * 12, 960, 1.06); }
const calmC = () => cached('bcalm', 4, 700, 1, () => { const g = ctx.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(0.22, 'rgba(8,8,10,1)'); g.addColorStop(1, 'rgba(8,8,10,1)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 700); });
/** the caption zone stays dark ground: fade everything out from y 1200, solid from ~1355 */
function calm() { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(calmC(), 0, 1200, 1080, 720); ctx.restore(); }
function motes(t, n = 26, seed = 0, col = '150,178,205', a = 0.4) {
  for (let i = 0; i < n; i++) {
    const x = (rnd(i + seed) * 1180 + t * (8 + rnd(i * 3 + seed) * 18)) % 1180 - 50, y = 130 + ((rnd(i * 7 + seed) * 1100 - t * (10 + rnd(i + 4) * 20)) % 1100 + 1100) % 1100;
    ctx.fillStyle = `rgba(${col},${a * (0.4 + 0.6 * (0.5 + 0.5 * sin(t * 2 + i)))})`; ctx.fillRect(x, y, 3, 3);
  }
}
function hotEmbers(t, n = 30, seed = 0) {
  for (let i = 0; i < n; i++) {
    const sp = 90 + rnd(i + seed) * 140, y = 1250 - ((t * sp + rnd(i * 3 + seed) * 1150) % 1150), x = rnd(i * 7 + seed) * W + sin(t * 1.4 + i) * 30;
    ctx.fillStyle = i % 3 ? `rgba(255,154,60,${0.5 + 0.4 * sin(t * 6 + i)})` : `rgba(255,224,160,0.8)`; ctx.fillRect(x, y, 4, 4);
  }
}
const heatC = () => cached('bheat', 1080, 1920, 0.25, () => {
  let g = ctx.createLinearGradient(0, 0, 260, 0); g.addColorStop(0, 'rgba(255,74,26,0.55)'); g.addColorStop(1, 'rgba(255,74,26,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 260, 1300);
  g = ctx.createLinearGradient(1080, 0, 820, 0); g.addColorStop(0, 'rgba(255,74,26,0.55)'); g.addColorStop(1, 'rgba(255,74,26,0)'); ctx.fillStyle = g; ctx.fillRect(820, 0, 260, 1300);
  g = ctx.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, 'rgba(255,74,26,0.5)'); g.addColorStop(1, 'rgba(255,74,26,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 260);
});
function heat(a) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.drawImage(heatC(), 0, 0, 1080, 1920); ctx.restore(); }

// ───────────── labels ─────────────
function tag(text, x, y, o = {}) {
  const size = o.size || 46, kind = o.kind || 'bar', a = o.a ?? 1, sc = o.sc ?? 1; if (a <= 0 || sc <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(sc, sc);
  ctx.font = `700 ${size}px Caladea`; const ls = Math.round(size * 0.12); ctx.letterSpacing = ls + 'px';
  const tw = ctx.measureText(text).width, pw = tw + size * 1.0, ph = size * 1.45;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (kind === 'hot') glow(0, 0, pw * 0.7, '255,74,26', 0.4);
  ctx.fillStyle = kind === 'hot' ? '#1A0402' : 'rgba(5,5,5,0.92)'; ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
  ctx.fillStyle = kind === 'hot' ? K.hot : K.rim; ctx.fillRect(-pw / 2, -ph / 2, pw, 3); ctx.fillRect(-pw / 2, ph / 2 - 3, pw, 3);
  if (kind === 'hot') { ctx.fillStyle = 'rgba(255,74,26,0.7)'; ctx.fillText(text, ls / 2 + 3, size * 0.05 + 3); }
  ctx.fillStyle = kind === 'hot' ? '#FFEBDD' : K.cold; ctx.fillText(text, ls / 2, size * 0.05);
  ctx.letterSpacing = '0px'; ctx.restore();
}
const pop = (lt, t0, dur = 0.3) => ({ a: seg(lt, t0, t0 + 0.12), sc: eob(seg(lt, t0, t0 + dur)) });
const stampIn = (lt, t0) => { const k = seg(lt, t0, t0 + 0.2); return { a: k, sc: lerp(1.8, 1, eo(k)) }; };

// ───────────── geometry: outlines for repousse ─────────────
const ellPts = (cx, cy, rx, ry, n = 36) => Array.from({ length: n + 1 }, (_, i) => [cx + cos(i / n * TAU - PI / 2) * rx, cy + sin(i / n * TAU - PI / 2) * ry]);
const closeP = (p) => p.concat([p[0]]);
function resample(lines, step) {
  const out = [];
  for (const pl of lines) { let s = 0; for (let i = 1; i < pl.length; i++) { const [x0, y0] = pl[i - 1], [x1, y1] = pl[i], dl = Math.hypot(x1 - x0, y1 - y0) || 1e-6; while (s <= dl) { out.push([x0 + (x1 - x0) * s / dl, y0 + (y1 - y0) * s / dl]); s += step; } s -= dl; } }
  return out;
}
/** fish polygon, length len, pointing along ang */
function fishPts(cx, cy, len, ang, flip = 1) {
  const up = [], dn = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16, x = lerp(0.5, -0.32, u), y = 0.21 * sin(PI * Math.pow(u, 0.8)); up.push([x, -y]); dn.unshift([x, y]); }
  const pts = up.concat([[-0.5, -0.2], [-0.42, 0], [-0.5, 0.2]], dn);
  return pts.map(([x, y]) => { y *= flip; const X = x * len, Y = y * len; return [cx + X * cos(ang) - Y * sin(ang), cy + X * sin(ang) + Y * cos(ang)]; });
}
const TWIN = (cx, cy, len) => [fishPts(cx - len * 0.2, cy, len, -PI / 2 + 0.2, 1), fishPts(cx + len * 0.2, cy, len, -PI / 2 - 0.2, -1)];

// the Kalabhra king (feet at 0, height ~690): we do not know what they looked like
const KAL = (() => {
  const head = ellPts(0, -545, 40, 50), crown = [[-40, -585], [-46, -665], [-24, -625], [-12, -690], [0, -640], [12, -690], [24, -625], [46, -665], [40, -585]];
  const robe = [[-22, -497], [-95, -470], [-80, -300], [-120, -10], [120, -10], [80, -300], [95, -470], [22, -497]];
  const armL = [[-92, -455], [-125, -320], [-120, -210]], armR = [[92, -455], [125, -320], [120, -210]];
  return { pts: resample([crown, head, closeP(robe), armL, armR], 15), fills: [robe, head.slice(0, -1), closeP(crown)] };
})();
// Kadungon: outline figure with javelin and fish banner (A = banner group, B = the man)
const KAD = (() => {
  const pole = [[-150, -20], [-150, -800]], flag = [[-150, -790], [-360, -790], [-322, -725], [-360, -660], [-150, -660]], fish = fishPts(-252, -725, 130, PI, 1);
  const head = ellPts(0, -545, 40, 50), crown = [[-36, -582], [-34, -640], [-17, -608], [0, -655], [17, -608], [34, -640], [36, -582]];
  const torso = [[-22, -497], [-88, -470], [-70, -300], [-100, -70], [100, -70], [70, -300], [88, -470], [22, -497]];
  const legL = [[-62, -70], [-72, -4], [-30, -4]], legR = [[62, -70], [76, -4], [118, -4]];
  const armR = [[86, -462], [140, -540], [160, -615]], armL = [[-86, -462], [-135, -380], [-150, -320]];
  const jav = [[40, -330], [240, -800]], dx = 0.391, dy = -0.92, bx = 240 - dx * 52, by = -800 - dy * 52, tip = [[bx + 0.92 * 15, by + 0.391 * 15], [240, -800], [bx - 0.92 * 15, by - 0.391 * 15]];
  return { A: resample([pole, closeP(flag), closeP(fish)], 14), B: resample([crown, head, closeP(torso), armR, armL, legL, legR, jav, tip], 14), fills: [torso, head.slice(0, -1), closeP(crown), flag], fish };
})();
const FISH2 = (() => { const f = TWIN(0, 0, 240); return { pts: resample(f.map(closeP), 13).concat([[-58, -78], [58, -78]]), fills: f }; })();

/** repousse dots punched from the back: k = fraction revealed; batched in three paths (shadow, body, highlight) */
function punch(pts, k, r = 5, o = {}) {
  const n = pts.length, m = k * n; if (m <= 0) return; const N = Math.min(n, Math.ceil(m)), from = o.from ?? 0;
  const sc = (i) => r * (0.45 + 0.55 * eob(clamp((m - i) / 5)));
  const pass = (col, dx, dy, f) => { ctx.fillStyle = col; ctx.beginPath(); for (let i = from; i < N; i++) { const [x, y] = pts[i]; if (o.filter && !o.filter(x, y)) continue; const rr = sc(i) * f; ctx.moveTo(x + dx + rr, y + dy); ctx.arc(x + dx, y + dy, rr, 0, TAU); } ctx.fill(); };
  const pa = ctx.globalAlpha; ctx.globalAlpha = pa * (o.a ?? 1);
  pass('rgba(26,7,2,0.85)', r * 0.35, r * 0.45, 1.05); pass(o.hot ? '#FF7A3A' : '#F2A066', 0, 0, 1); pass(o.hot ? 'rgba(255,236,200,0.95)' : 'rgba(255,230,200,0.9)', -r * 0.3, -r * 0.3, 0.42);
  ctx.globalAlpha = pa;
}
/** the raised sheen between the dots */
function raised(polys, a, hot = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a);
  for (const p of polys) { ctx.beginPath(); p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    let x0 = 1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const g = ctx.createLinearGradient(x0, y0, x0 + 40, y1); g.addColorStop(0, hot ? '#FF9A5A' : '#F6B07A'); g.addColorStop(1, hot ? '#B4301A' : '#B4552A'); ctx.fillStyle = g; ctx.fill(); }
  ctx.restore();
}

// ───────────── seal, ring, hammer, sparks, ink ─────────────
const sealC = () => cached('bseal', 240, 240, 1, () => {
  const cx = 120, cy = 120, r = 104, g = ctx.createLinearGradient(20, 20, 220, 220); g.addColorStop(0, '#E3A061'); g.addColorStop(0.5, '#A8642F'); g.addColorStop(1, '#5A2E14');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,210,166,0.6)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r - 16, 0, TAU); ctx.strokeStyle = 'rgba(40,14,4,0.7)'; ctx.lineWidth = 4; ctx.stroke();
  for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; ctx.beginPath(); ctx.arc(cx + cos(a) * (r - 8), cy + sin(a) * (r - 8), 3, 0, TAU); ctx.fillStyle = 'rgba(255,220,180,0.6)'; ctx.fill(); }
  for (const f of TWIN(cx, cy + 4, 120)) {
    const path = (dx, dy) => { ctx.beginPath(); f.forEach(([x, y], i) => (i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy))); ctx.closePath(); };
    path(3, 4); ctx.fillStyle = 'rgba(40,12,4,0.75)'; ctx.fill(); path(0, 0); ctx.fillStyle = '#F0A466'; ctx.fill(); ctx.strokeStyle = 'rgba(255,236,206,0.7)'; ctx.lineWidth = 2; ctx.stroke();
  }
});
function seal(x, y, s = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(sealC(), -120 * s, -120 * s, 240 * s, 240 * s); ctx.restore(); }
function ring(cx, cy, r, w = 22, a0 = 0, a1 = TAU) {
  ctx.lineCap = 'butt';
  for (const [col, lw] of [['#3E220E', w], ['#A86A34', w * 0.62], ['rgba(255,210,166,0.55)', w * 0.16]]) { ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); }
}
/** small faceless hand-hammer: striking face at (x,y), ang = how far it is raised (0 = struck) */
function hammer(x, y, ang, s = 1) {
  ctx.save(); ctx.translate(x + 165 * s, y - 85 * s); ctx.scale(s, s); ctx.rotate(ang);
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(260, -190); ctx.strokeStyle = '#121214'; ctx.lineWidth = 46; ctx.stroke(); ctx.strokeStyle = 'rgba(74,106,138,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(250, -212); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(-165, 22); ctx.strokeStyle = '#5A3A22'; ctx.lineWidth = 15; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(6, -2, 34, 28, -0.5, 0, TAU); ctx.fillStyle = '#18181B'; ctx.fill();
  ctx.save(); ctx.translate(-165, 30); ctx.rotate(-0.16);
  const g = ctx.createLinearGradient(-26, 0, 26, 0); g.addColorStop(0, '#2A2A30'); g.addColorStop(0.5, '#8C8C96'); g.addColorStop(1, '#2A2A30');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-26, -58, 52, 112, 6); ctx.fill(); ctx.fillStyle = '#C9C9D2'; ctx.fillRect(-26, 46, 52, 8); ctx.restore();
  ctx.restore();
}
/** raise angle for strikes at times S */
function hamAng(lt, S) {
  const j = S.findIndex((s) => s > lt);
  if (j === -1) return 0.8 * eo(clamp((lt - S[S.length - 1]) / 0.3));
  const s1 = S[j], s0 = j ? S[j - 1] : s1 - 0.4, p = clamp((lt - s0) / (s1 - s0));
  return p < 0.55 ? 0.8 * eo(p / 0.55) : 0.8 * (1 - ((p - 0.55) / 0.45) ** 2);
}
const lastStrike = (lt, S) => { let s = -9; for (const x of S) if (x <= lt) s = x; return lt - s; };
function sparks(x, y, dt, seed, n = 14, spd = 560) {
  if (dt < 0 || dt > 0.55) return;
  glow(x, y, 130, '255,154,60', 0.7 * (1 - clamp(dt / 0.18)));
  ctx.lineCap = 'round'; const a0 = 1 - dt / 0.55;
  for (let i = 0; i < n; i++) {
    const a = -PI / 2 + (rnd(seed + i) - 0.5) * 3.0, v = spd * (0.35 + rnd(seed + i * 3) * 0.85), p = (tt) => [x + cos(a) * v * tt, y + sin(a) * v * tt + 1100 * tt * tt];
    const [x1, y1] = p(dt), [x0, y0] = p(Math.max(0, dt - 0.035));
    ctx.strokeStyle = i % 3 ? `rgba(255,154,60,${a0})` : `rgba(255,224,160,${a0})`; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
}
/** ink: a union of circles, glossy rim behind */
function inkCircles(list, extra) {
  ctx.fillStyle = K.gloss; ctx.beginPath(); for (const [x, y, r] of list) { if (r <= 0) continue; ctx.moveTo(x - 4 + r + 6, y - 5); ctx.arc(x - 4, y - 5, r + 6, 0, TAU); } ctx.fill();
  ctx.fillStyle = K.ink; ctx.beginPath(); for (const [x, y, r] of list) { if (r <= 0) continue; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); } if (extra) extra(); ctx.fill();
}
/** ink covering everything to the right of x = xe (between y0 and y1) */
function inkRight(xe, t, seed, y0 = 100, y1 = 1300) {
  const list = []; for (let y = y0, i = 0; y <= y1; y += 46, i++) list.push([xe + (rnd(seed + i) - 0.5) * 50, y, 34 + rnd(seed + i * 3) * 44 + sin(t * 2.3 + i) * 8]);
  inkCircles(list, () => { ctx.rect(xe, y0 - 60, 1600, y1 - y0 + 120); });
}
/** ink covering everything above y = ye */
function inkAbove(ye, t, seed) {
  const list = []; for (let x = -100, i = 0; x <= 1180; x += 46, i++) list.push([x, ye + (rnd(seed + i) - 0.5) * 50, 34 + rnd(seed + i * 3) * 44 + sin(t * 2.3 + i) * 8]);
  inkCircles(list, () => { ctx.rect(-300, -400, 1700, ye + 400); });
}
function drip(x, y0, len, w = 12) { if (len <= 0) return; ctx.fillStyle = K.ink; ctx.beginPath(); ctx.roundRect(x - w / 2, y0, w, len, w / 2); ctx.moveTo(x + w * 0.9, y0 + len); ctx.arc(x, y0 + len, w * 0.9, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(120,130,150,0.5)'; ctx.fillRect(x - w * 0.25, y0 + 4, 2, Math.max(0, len - 8)); }

// ───────────── set pieces ─────────────
/** b1: plates spinning round the ring (vertical axis through the ring holes) */
function carousel(px, py, s0, spin, t) {
  const N = 6, w = 480, h = 180, off = w / 2 - h * 0.16, PAT = [0, 0.5, 0.2, 0.8, 0.1, 0.4];
  const items = []; for (let i = 0; i < N; i++) { const ph = i / N * TAU + spin; items.push({ i, z: sin(ph), c: cos(ph) }); }
  items.sort((a, b) => a.z - b.z);
  const one = (it) => { const s = s0 * (0.86 + 0.16 * it.z); plate(px + off * it.c * s, py + it.z * 30 * s0, w, h, { rows: 4, seed: 3 + it.i, pat: PAT[it.i], sx: it.c * s, sy: s, dark: 0.12 + 0.4 * (1 - it.z) / 2 + 0.35 * (1 - Math.abs(it.c)), sheen: it.z > 0 ? (it.c + 1) / 2 : null }); };
  const rr = 120 * s0, rc = py - rr + 4;
  items.filter((it) => it.z < 0).forEach(one);
  ring(px, rc, rr, 24 * s0);
  items.filter((it) => it.z >= 0).forEach(one);
  ring(px, rc, rr, 24 * s0, PI * 0.36, PI * 0.64);
  seal(px, rc - rr - 82 * s0, s0 * 0.9, sin(t * 1.7) * 0.06);
}
/** b3/b4: the grant plate with the half-erased king in a panel */
function grantScene(cx, cy, s, o) {
  const fs = 0.64, fy = 232;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  plate(0, 0, 1000, 640, { rows: 8, seed: 21, pat: 0.35, sheen: o.sheen, sheenA: 0.22 });
  panel(-250, -250, 500, 500);
  ctx.save(); ctx.beginPath(); ctx.roundRect(-244, -244, 488, 488, 14); ctx.clip();
  if (o.hot) glow(0, 0, 300, '255,74,26', 0.45 * o.hot);
  ctx.translate(0, fy); ctx.scale(fs, fs);
  raised(KAL.fills, o.fill, o.hot > 0.5);
  punch(KAL.pts, o.k, 9, { hot: o.hot > 0.5 });
  if (o.ink > 0) { // ink eats the right half of the king
    const list = []; for (let i = 0; i < 13; i++) list.push([30 + rnd(i + 5) * 200 + sin(o.t * 1.6 + i) * 10, -720 + i * 62, (60 + rnd(i + 8) * 60) * eo(clamp(o.ink * 1.6 - rnd(i + 2) * 0.6))]);
    inkCircles(list, () => { const ww = 420 * eo(o.ink); ctx.rect(150, -760, ww, 800); });
    for (let i = 0; i < 4; i++) drip(60 + i * 45, -260 + rnd(i) * 200, 280 * eo(clamp(o.ink * 1.4 - i * 0.15)) * (0.6 + rnd(i + 1) * 0.6), 14);
    punch(KAL.pts, 1, 9, { a: 0.16, filter: (x) => x > 20 });   // the faint embossed ghost under the ink
  }
  const hp = KAL.pts[Math.min(KAL.pts.length - 1, Math.floor(o.k * KAL.pts.length))];
  ctx.restore(); ctx.restore();
  return [cx + s * hp[0] * fs, cy + s * (fy + hp[1] * fs)];
}
/** b6/b7: Kadungon plate */
function kadScene(cx, cy, s, o) {
  const fs = 0.95, fx = 50, fy = 385;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  plate(0, 0, 1040, 1000, { rows: 14, seed: 31, pat: 0.2, sheen: o.sheen, sheenA: 0.2 });
  panel(-460, -405, 920, 810);
  ctx.save(); ctx.translate(fx, fy); ctx.scale(fs, fs);
  raised(KAD.fills, o.fill); raised([KAD.fish], o.fill * 0.9);
  punch(KAD.A, o.kA, 8); punch(KAD.B, o.kB, 8);
  const hp = o.kB > 0 ? KAD.B[Math.min(KAD.B.length - 1, Math.floor(o.kB * KAD.B.length))] : KAD.A[Math.min(KAD.A.length - 1, Math.floor(o.kA * KAD.A.length))];
  ctx.restore(); ctx.restore();
  return [cx + s * (fx + hp[0] * fs), cy + s * (fy + hp[1] * fs)];
}
// small crowned faceless silhouettes (pins) — feet centre at (70, 252)
const pinC = () => cached('bpin', 140, 260, 1, () => {
  const g = ctx.createLinearGradient(20, 40, 120, 250); g.addColorStop(0, '#E8955A'); g.addColorStop(0.5, '#B4552A'); g.addColorStop(1, '#5E260F');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(70, 66, 21, 26, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(48, 46); ctx.lineTo(46, 14); ctx.lineTo(58, 30); ctx.lineTo(70, 6); ctx.lineTo(82, 30); ctx.lineTo(94, 14); ctx.lineTo(92, 46); ctx.closePath(); ctx.fillStyle = '#F2B36A'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(60, 92); ctx.lineTo(80, 92); ctx.lineTo(106, 104); ctx.lineTo(116, 250); ctx.lineTo(24, 250); ctx.lineTo(34, 104); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,170,0.7)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.beginPath(); ctx.ellipse(70, 66, 21, 26, 0, 0, TAU); ctx.stroke();
});
// map of the Tamil south: an embossed copper sheet
const MAP = (() => { const raw = [[110, 250], [150, 420], [215, 600], [295, 790], [375, 950], [445, 1065], [512, 1150], [545, 1175], [585, 1130], [640, 1030], [705, 890], [765, 750], [830, 590], [890, 430], [950, 250]];
  const p = resample([raw], 18); return p.map(([x, y], i) => [x + (rnd(i * 3.3) - 0.5) * 12, y + (rnd(i * 5.1) - 0.5) * 8]).concat([[950, 200], [110, 200]]); })();
const mapC = () => cached('bmap', 1080, 1300, 0.75, () => {
  const path = (dx = 0, dy = 0) => { ctx.beginPath(); MAP.forEach(([x, y], i) => (i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy))); ctx.closePath(); };
  path(8, 12); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill();
  const g = ctx.createLinearGradient(100, 200, 900, 1200); g.addColorStop(0, '#C9743E'); g.addColorStop(0.5, '#9A4622'); g.addColorStop(1, '#5A240E'); path(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); path(); ctx.clip();
  for (let i = 0; i < 420; i++) { const x = 100 + rnd(i * 2.1) * 860, y = 200 + rnd(i * 4.7) * 1000, r = 6 + rnd(i) * 12; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = `rgba(40,12,4,${0.08 + rnd(i + 1) * 0.1})`; ctx.fill(); ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.5, 0, TAU); ctx.fillStyle = 'rgba(255,214,170,0.1)'; ctx.fill(); }
  ctx.strokeStyle = 'rgba(40,12,4,0.45)'; ctx.lineWidth = 4; for (const [a, b, c2, d] of [[300, 520, 520, 700], [600, 420, 470, 760], [380, 900, 560, 860]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c2) / 2 + 40, (b + d) / 2, c2, d); ctx.stroke(); }
  ctx.restore();
  path(); ctx.strokeStyle = '#FFD2A6'; ctx.globalAlpha = 0.6; ctx.lineWidth = 4; ctx.stroke(); ctx.globalAlpha = 1;
});
// the blank centuries ruler: x(year) = 90 + (yr - 100) * 1.5 ; canvas origin at screen x 20, bar top at local y 30
const YX = (yr) => 90 + (yr - 100) * 1.5;
const rulerC = () => cached('bruler', 1040, 170, 1, () => {
  ctx.save(); ctx.translate(-20, 0);
  const g = ctx.createLinearGradient(0, 30, 0, 140); g.addColorStop(0, '#E8955A'); g.addColorStop(0.4, '#B4552A'); g.addColorStop(1, '#6E2E14');
  ctx.beginPath(); ctx.roundRect(30, 30, 1020, 110, 12); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,210,166,0.6)'; ctx.lineWidth = 3; ctx.stroke();
  for (let yr = 100; yr <= 700; yr += 25) { const x = YX(yr), big = yr % 100 === 0, mid = yr % 50 === 0, l = big ? 46 : mid ? 28 : 16;
    ctx.fillStyle = 'rgba(50,16,6,0.85)'; ctx.fillRect(x - (big ? 3 : 2), 32, big ? 6 : 4, l); ctx.fillStyle = 'rgba(255,214,170,0.5)'; ctx.fillRect(x + (big ? 3 : 2), 32, 2, l); }
  ctx.font = '700 34px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let yr = 100; yr <= 700; yr += 100) { const x = Math.min(YX(yr), 1012); ctx.fillStyle = 'rgba(255,210,166,0.7)'; ctx.fillText(String(yr), x + 2, 112); ctx.fillStyle = '#3A1206'; ctx.fillText(String(yr), x, 110); }
  ctx.restore();
});
const RY = 760; // ruler bar centre y on screen (bar spans RY-55 .. RY+55)
function ruler(dx = 0, a = 1) { blit(rulerC(), 0, 85, 20 + dx, RY, 1, a); }
function blot(k, t, seed = 7) {
  if (k <= 0) return; const xa = YX(250), xb = YX(575), xc = (xa + xb) / 2, hw = (xb - xa) / 2 * eo(k), y0 = RY - 82, y1 = RY + 82;
  const list = []; const n = Math.max(2, Math.round(hw * 2 / 44));
  for (let i = 0; i <= n; i++) { const x = xc - hw + i * (2 * hw / n); list.push([x, y0 + (rnd(seed + i) - 0.5) * 24, 26 + rnd(seed + i * 2) * 26 + sin(t * 2 + i) * 5]); list.push([x, y1 + (rnd(seed + i + 40) - 0.5) * 24, 24 + rnd(seed + i * 5) * 26 + sin(t * 2.2 + i) * 5]); }
  for (const s of [-1, 1]) list.push([xc + s * hw, RY, 70 + sin(t * 1.7 + s) * 6]);
  inkCircles(list, () => ctx.rect(xc - hw, y0, hw * 2, y1 - y0));
  ctx.save(); ctx.beginPath(); ctx.rect(xc - hw, y0, hw * 2, y1 - y0); ctx.clip(); ruler(0, 0.12); ctx.restore();   // faint ghost of the ticks
}
function marker(x, t, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; const fl = 0.85 + 0.15 * sin(t * 30);
  glow(x, RY - 40, 160, '255,74,26', 0.55 * fl);
  ctx.fillStyle = '#FF4A1A'; ctx.fillRect(x - 3, RY - 60, 6, 120);
  ctx.beginPath(); ctx.moveTo(x - 24, RY - 104); ctx.lineTo(x + 24, RY - 104); ctx.lineTo(x, RY - 66); ctx.closePath(); ctx.fillStyle = '#FF6A2A'; ctx.fill(); ctx.strokeStyle = '#FFE0A0'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

// ═════════════════════════ SHOTS ═════════════════════════
export function buildB(add, cue) {
  const t1 = L(4), t2 = Wd('pandya', 4), t3 = Wd('velvikudi', 4), t4 = Wd('kali', 4), t5 = Wd('countless', 4);
  const t6 = L(5), t7 = Wd('kadungon', 5), t8 = Wd('late', 5), t9 = L(6), t10 = Wd('called', 6), tEnd = L(7);

  // b1 — ring of plates swinging like a carousel
  add({ id: 'b1', at: t1, cam: [540, 700], zoom: 0.08, note: 'ring of copper plates spins round the bronze ring, Pandya fish seal; TWO CENTURIES LATER', draw(lt, d, t) {
    bg(t); motes(t, 26, 1);
    glow(540, 820, 700, '224,138,78', 0.2);
    const spin = 0.35 + lt * 1.5 + 0.25 * sin(lt * 2.2);
    carousel(540, 900, 1.45 + 0.05 * sin(lt), spin, t);
    tag('TWO CENTURIES LATER', 540, 230, { size: 52, ...pop(lt, 0.15) });
    calm();
  } });
  cue(t1, 'whoosh', { gain: 0.55 }); cue(t1 + 0.05, 'slide', { gain: 0.5, dur: 1.2 }); cue(t1 + 0.15, 'pop', { gain: 0.35 });
  for (let k = 0; k < 3; k++) cue(t1 + 0.5 + k * 0.55, 'tock', { gain: 0.3, pan: k % 2 ? 0.3 : -0.3 });

  // b2 — one plate swings forward, the twin fish punched in
  const S2 = []; for (let s = 0.62; s < t3 - t2 - 0.25; s += 0.2) S2.push(s);
  add({ id: 'b2', at: t2, cam: [600, 720], zoom: 0.07, note: 'one plate swings forward; hammer punches the twin fish in repousse dots; PANDYA COPPER PLATE', draw(lt, d, t) {
    bg(t); motes(t, 20, 2);
    const w = 940, h = 400, off = w / 2 - h * 0.16, px = 128, py = 720, ph = 1.3 * (1 - eob(seg(lt, 0, 0.55))), c = cos(ph);
    ring(px, py - 106, 110, 24); seal(px, py - 300, 0.8, sin(t * 1.7) * 0.06);
    plate(px + off * c, py, w, h, { rows: 6, seed: 11, pat: 0.25, sx: c, dark: 0.5 * (1 - c), sheen: seg(lt, 0.3, d) });
    ring(px, py - 106, 110, 24, PI * 0.3, PI * 0.7);
    if (lt > 0.4) {
      ctx.save(); ctx.translate(px + off * c, py); ctx.scale(c, 1); ctx.globalAlpha = seg(lt, 0.4, 0.55);
      panel(150, -170, 285, 340);
      ctx.translate(292, 8);
      raised(FISH2.fills, seg(lt, d - 0.5, d - 0.1)); punch(FISH2.pts, seg(lt, 0.6, d - 0.25), 6);
      ctx.restore();
      const k = seg(lt, 0.6, d - 0.25), hp = FISH2.pts[Math.min(FISH2.pts.length - 1, Math.floor(k * FISH2.pts.length))], hx = px + off * c + 292 + hp[0], hy = py + 8 + hp[1];
      if (lt > 0.5) { sparks(hx, hy, lastStrike(lt, S2), Math.floor((lt - lastStrike(lt, S2)) * 50), 12, 480); hammer(hx, hy, hamAng(lt, S2), 0.8); }
    }
    tag('PANDYA COPPER PLATE', 540, 1080, { size: 50, ...pop(lt, 0.45) });
    calm();
  } });
  cue(t2, 'whoosh', { gain: 0.6 }); cue(t2 + 0.45, 'thud', { gain: 0.6 }); S2.forEach((s, i) => cue(t2 + s, 'chisel', { gain: 0.45 + 0.1 * (i % 2), dur: 0.15 }));

  // b3 — Velvikudi grant: the king punched in, ink eats half of him
  const tKal = Wd('kalabhra', 4) - t3, S3 = []; for (let s = 0.18; s < 1.45; s += 0.18) S3.push(s);
  add({ id: 'b3', at: t3, cam: [540, 700], zoom: 0.09, note: 'grant plate close: crowned king punched in dots, black ink eats half of him; VELVIKUDI GRANT / c. 770 CE', draw(lt, d, t) {
    bg(t); motes(t, 18, 3);
    const k = seg(lt, 0.1, 1.5), hp = grantScene(540, 700, 1, { k, fill: seg(lt, 1.2, 1.7), ink: seg(lt, tKal, tKal + 0.9), sheen: seg(lt, 0, d) * 0.9, hot: 0, t });
    if (lt < 1.6) { sparks(hp[0], hp[1], lastStrike(lt, S3), Math.floor((lt - lastStrike(lt, S3)) * 50) + 7, 12, 480); hammer(hp[0], hp[1], hamAng(lt, S3), 0.8); }
    tag('VELVIKUDI GRANT', 540, 250, { size: 62, ...stampIn(lt, 0.02) });
    tag('c. 770 CE', 540, 1110, { size: 50, ...pop(lt, 0.45) });
    calm();
  } });
  cue(t3, 'thud', { gain: 0.8 }); cue(t3 + 0.03, 'whoosh', { gain: 0.35 }); S3.forEach((s, i) => cue(t3 + s, 'chisel', { gain: 0.4 + 0.1 * (i % 2), dur: 0.12 })); cue(t3 + tKal, 'gulp', { gain: 0.5 }); cue(t3 + tKal + 0.1, 'bubbles', { gain: 0.3, dur: 0.8 });

  // b4 — "KALI KING": the half-erased king glows red-hot
  add({ id: 'b4', at: t4, cam: [540, 700], zoom: 0.1, note: 'the half-erased king close up, glowing red-hot, heat at the frame edges; "KALI KING" / IT SAYS', draw(lt, d, t) {
    bg(t); const fl = 0.85 + 0.15 * sin(t * 23) * sin(t * 7);
    grantScene(560, 760, 1.5, { k: 1, fill: 1, ink: 1, sheen: 0.2 + lt * 0.3, hot: seg(lt, 0, 0.25) * fl, t });
    heat((0.5 + 0.5 * seg(lt, 0, 0.2)) * fl); hotEmbers(t, 34, 4);
    tag('"KALI KING"', 540, 255, { size: 86, kind: 'hot', ...stampIn(lt, 0.03) });
    tag('IT SAYS', 540, 1160, { size: 44, ...pop(lt, 0.4) });
    calm();
  } });
  cue(t4, 'slam', { gain: 0.9 }); cue(t4 + 0.02, 'sizzle', { gain: 0.7, dur: 1.3 }); cue(t4 + 0.4, 'pop', { gain: 0.3 });

  // b5 — red-hot ink ball knocks a row of crowned kings down like pins
  const PX = Array.from({ length: 7 }, (_, i) => 230 + i * 105), LEDGE = 1060, BR = 70;
  const ballX = (lt) => lerp(-140, 1240, seg(lt, 0.12, 1.75)), hitAt = (x) => 0.12 + ((x - 95 + 140) / 1380) * 1.63;
  add({ id: 'b5', at: t5, cam: [540, 900], zoom: 0.07, note: 'red-hot ink ball rolls along a copper ledge, small crowned kings fall like pins and sink in ink; IT SAYS', draw(lt, d, t) {
    bg(t);
    plate(540, 700, 1000, 700, { rows: 9, seed: 44, pat: 0.6, dark: 0.7 });
    heat(0.55 + 0.1 * sin(t * 9)); hotEmbers(t, 22, 5);
    const bx = ballX(lt);
    for (let i = 0; i < PX.length; i++) {
      const x = PX[i], f = eo(seg(lt, hitAt(x), hitAt(x) + 0.32)), ang = 1.42 * f + 0.06 * sin(PI * seg(lt, hitAt(x) + 0.32, hitAt(x) + 0.5)), ghost = lerp(1, 0.2, seg(bx, x + 140, x + 380));
      ctx.save(); ctx.translate(x + 60 + 30 * f, LEDGE); ctx.rotate(ang); blit(pinC(), 116, 252, 0, 0, 1.3, ghost); ctx.restore();
    }
    // ink trail behind the ball, pooling over the fallen kings
    const tw = Math.max(0, bx + 40);
    if (tw > 0) { const list = []; for (let x = -60, i = 0; x < bx - 30; x += 50, i++) list.push([x, LEDGE - 18, 24 + rnd(i + 9) * 30 * clamp((bx - x) / 300)]); inkCircles(list, () => ctx.rect(-100, LEDGE - 16, tw + 100, 26)); }
    for (let i = 0; i < 8; i++) { const x = 120 + i * 120; if (x < bx - 60) drip(x + rnd(i) * 40, LEDGE + 8, Math.min(150, (bx - x) * 0.25) * (0.5 + rnd(i + 2)), 12); }
    plate(540, LEDGE + 64, 1200, 110, { rows: 2, seed: 41, pat: 0.3, sheen: seg(lt, 0, d) });
    // the ball: black, glossy, red-hot rim
    const by = LEDGE - BR - 2, rot = bx / BR;
    glow(bx, by, 260, '255,74,26', 0.55);
    ctx.beginPath(); ctx.arc(bx, by, BR, 0, TAU); ctx.fillStyle = K.ink; ctx.fill(); ctx.strokeStyle = K.hot; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = '#FF9A3C'; ctx.lineWidth = 4; for (let j = 0; j < 3; j++) { const a = rot + j * 2.1; ctx.beginPath(); ctx.moveTo(bx + cos(a) * 14, by + sin(a) * 14); ctx.lineTo(bx + cos(a + 0.4) * 52, by + sin(a + 0.4) * 52); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(bx - 22, by - 26, 14, 0, TAU); ctx.fillStyle = 'rgba(160,170,190,0.35)'; ctx.fill();
    for (let i = 0; i < PX.length; i++) sparks(PX[i] + 20, LEDGE - 160, lt - hitAt(PX[i]), 30 + i * 9, 8, 420);
    tag('IT SAYS', 540, 250, { size: 48, ...pop(lt, 0.1) });
    calm();
  } });
  cue(t5, 'rumble', { gain: 0.6, dur: 1.9 }); cue(t5, 'whoosh', { gain: 0.4 });
  PX.forEach((x, i) => { cue(t5 + hitAt(x), i % 2 ? 'tock' : 'thud', { gain: 0.5 + 0.05 * i, pan: lerp(-0.6, 0.6, i / 6) }); });

  // b6 — new plate: the hammer punches the fish banner
  const tIt = Wd('says', 5) - t6, S6 = []; for (let s = 0.2; s < t7 - t6 - 0.1; s += 0.22) S6.push(s);
  add({ id: 'b6', at: t6, cam: [480, 640], zoom: 0.08, note: 'new plate close: hammer punches a fish banner, sparks; ink waits at the right edge; IT SAYS', draw(lt, d, t) {
    bg(t); motes(t, 16, 6);
    const kA = seg(lt, 0.15, d - 0.05), hp = kadScene(751, 1061, 1.45, { kA, kB: 0, fill: 0, sheen: 0.1 + lt * 0.3 });
    inkRight(900 + sin(t * 1.3) * 14, t, 61, 100, 1300);
    sparks(hp[0], hp[1], lastStrike(lt, S6), Math.floor((lt - lastStrike(lt, S6)) * 50) + 3, 14, 520); hammer(hp[0], hp[1], hamAng(lt, S6), 0.95);
    tag('IT SAYS', 480, 230, { size: 56, ...pop(lt, Math.max(0.05, tIt - 0.3)) });
    calm();
  } });
  cue(t6, 'whoosh', { gain: 0.5 }); cue(t6 + 0.05, 'slide', { gain: 0.35 }); S6.forEach((s, i) => cue(t6 + s, 'chisel', { gain: 0.5 + 0.1 * (i % 2), dur: 0.15 }));

  // b7 — Kadungon in full; the ink is pushed back off the plate
  const tTook = Wd('took', 5) - t7, tBack = Wd('back', 5, 'e') - t7, S7 = []; for (let s = 0.08; s < 0.95; s += 0.13) S7.push(s);
  add({ id: 'b7', at: t7, cam: [540, 700], zoom: 0.07, note: 'wide: Kadungon (outline, javelin + fish banner) punched in, ink pushed back off the plate; KADUNGON', draw(lt, d, t) {
    bg(t); motes(t, 16, 7);
    const kB = seg(lt, 0.02, 0.95), hp = kadScene(540, 700, 1.0, { kA: 1, kB, fill: seg(lt, 0.8, 1.2), sheen: seg(lt, 0.8, d) });
    const xe = lerp(760, 1260, eio(seg(lt, tTook - 0.1, tBack)));
    if (xe < 1240) { glow(xe - 10, 700, 260, '255,154,60', 0.35 * seg(lt, tTook - 0.1, tTook + 0.1)); inkRight(xe, t, 71, 180, 1230); }
    if (lt < 1.05) { sparks(hp[0], hp[1], lastStrike(lt, S7), Math.floor((lt - lastStrike(lt, S7)) * 50) + 5, 10, 460); hammer(hp[0], hp[1], hamAng(lt, S7), 0.7); }
    tag('KADUNGON', 540, 150, { size: 62, ...stampIn(lt, 0.03) });
    calm();
  } });
  cue(t7, 'thud', { gain: 0.8 }); cue(t7 + 0.04, 'chisel', { gain: 0.5, dur: 0.9 }); cue(t7 + tTook - 0.1, 'whoosh', { gain: 0.55 }); cue(t7 + tTook, 'sizzle', { gain: 0.45, dur: 0.9 }); cue(t7 + 0.85, 'sparkle', { gain: 0.3 });

  // b8 — the ink retreats north off the map; the fish medallion rises
  add({ id: 'b8', at: t8, cam: [540, 760], zoom: 0.08, note: 'copper map of the Tamil south, ink retreats north off it, Pandya fish medallion rises; LATE 500s CE', draw(lt, d, t) {
    bg(t);
    blit(mapC(), 540, 650, 540, 650 + sin(t * 0.5) * 6, 1);
    const ye = lerp(1060, -120, eio(seg(lt, 0.05, d - 0.15))), mk = seg(ye, 980, 800);
    glow(540, 930, 300, '255,154,60', 0.35 * mk);
    if (mk > 0) seal(540, 930, 0.95 * eob(mk), sin(t) * 0.05);
    if (ye > -60) {
      const g = ctx.createLinearGradient(0, ye, 0, ye + 160); g.addColorStop(0, 'rgba(255,120,40,0.45)'); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(-300, ye, 1700, 160);
      inkAbove(ye, t, 81);
      ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, 1700, ye + 300); ctx.clip(); blit(mapC(), 540, 650, 540, 650 + sin(t * 0.5) * 6, 1, 0.1); ctx.restore();
      for (let i = 0; i < 7; i++) { const x = 140 + i * 130 + sin(t * 3 + i) * 10; ctx.fillStyle = i % 2 ? K.sp1 : K.sp2; ctx.fillRect(x, ye + 30 + rnd(i + Math.floor(t * 12)) * 40, 4, 4); }
    }
    tag('LATE 500s CE', 540, 1230, { size: 54, ...pop(lt, 0.15) });
    calm();
  } });
  cue(t8, 'whoosh', { gain: 0.5 }); cue(t8 + 0.1, 'rumble', { gain: 0.45, dur: 1.8 }); cue(t8 + 0.15, 'pop', { gain: 0.35 }); cue(t8 + 1.3, 'bell', { gain: 0.35 });

  // b9 — the blank centuries ruler: marker slides, ink drips and blots the span
  add({ id: 'b9', at: t9, cam: [540, 760], zoom: 0.06, note: 'blank centuries ruler 100-700 CE: red-hot marker slides, ink drips from above and blots c. 250-575; c. 250-550 CE', draw(lt, d, t) {
    bg(t); motes(t, 18, 9);
    ruler(-1100 * (1 - eo(seg(lt, 0, 0.4))));
    const mx = lerp(YX(100), YX(700), eio(seg(lt, 0.35, d)));
    for (let i = 0; i < 5; i++) { const x = YX(280 + i * 70), t0 = 0.5 + i * 0.12, fall = seg(lt, t0, t0 + 0.35); if (fall > 0 && fall < 1) drip(x, 150, (RY - 210) * eo(fall), 16); }
    blot(seg(lt, 0.75, d + 0.3), t);
    marker(mx, t, seg(lt, 0.3, 0.45));
    tag('c. 250-550 CE', 540, 1080, { size: 50, ...pop(lt, 0.9) });
    calm();
  } });
  cue(t9, 'slide', { gain: 0.6 }); cue(t9 + 0.35, 'sizzle', { gain: 0.4, dur: 1.4 }); for (let i = 0; i < 5; i++) cue(t9 + 0.85 + i * 0.12, 'plop', { gain: 0.35, pan: lerp(-0.4, 0.4, i / 4) });

  // b10 — closer: the blot drips, "DARK AGE" stamped red-hot
  const tDark = Wd('dark', 6) - t10;
  add({ id: 'b10', at: t10, cam: [540, 760], zoom: 0.12, note: 'closer on the ruler: the blot spreads and drips down; "DARK AGE" stamped red-hot', draw(lt, d, t) {
    bg(t); motes(t, 14, 10);
    ruler(); blot(1, t);
    for (let i = 0; i < 6; i++) drip(YX(270 + i * 58) + rnd(i) * 20, RY + 70, 300 * eo(seg(lt, 0.1 + i * 0.1, 1.4 + i * 0.1)) * (0.5 + rnd(i + 3) * 0.6), 14);
    marker(YX(575) + sin(t * 18) * 3, t);
    const fl = seg(lt, tDark, tDark + 0.05) * (1 - seg(lt, tDark + 0.05, tDark + 0.5));
    if (fl > 0) heat(fl);
    tag('"DARK AGE"', 540, 470, { size: 92, kind: 'hot', ...stampIn(lt, tDark) });
    calm();
  } });
  cue(t10, 'whoosh', { gain: 0.4 }); cue(t10 + 0.2, 'plop', { gain: 0.3 }); cue(t10 + tDark, 'thud', { gain: 0.95 }); cue(t10 + tDark + 0.03, 'sizzle', { gain: 0.5, dur: 0.9 });
  void tEnd;
}
