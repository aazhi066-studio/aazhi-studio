// EPISODE 19 · worker C : "Charcoal Diptych", lines 7-9 (two victories / disputed / the question / end card)
//   c1  L7 -> L8            torn seam opens; teal chronicle bundle vs red stone slab slide in like duelling cards; LANKA'S RECORD | CHOLA RECORD, VICTORY x2, TWO VICTORIES?
//   c2  L8 -> "and"         close on the sheet: DISPUTED tag; 1171? scribbled, putty eraser streak wipes it, 1174? written below
//   c3  "and" -> L9         diptych again, the seam cracks wider, red crack on the slab; DISPUTED stays; WHO BENT THE TRUTH?
//   c4  L9 -> "or"          left teal panel: ship sailing home, chalk glory rays; HERO?
//   c5  "or" -> "tell"      red panel pushes the seam left: the gate, empty spikes outlined red, red ?, crows lift, dropped helmet; OR A HEAD ON A GATE?
//   c6  "tell" -> "watch"   wide diptych, both answers small, a paper scrap pinned over the seam; TELL ME BELOW + bobbing arrow
//   c7  "watch" -> "cracks" end card: the torn seam closes, the two records slide together; WATCH AGAIN, AAZHI chalk wordmark, crow perched
//   c8  "cracks" -> end     a hairline crack runs down the healed seam, the crow flies off, dust keeps falling
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { T, L, Wd } from './core/timing.js';
import { cached, blit } from './art.js';

// ───────────── palette ─────────────
const CH = '#1C1A18', CHALK = '#F2EFE8', TEAL = '#3E8C8A', RED = '#A8321F', WALL = '#141210';
const CHr = '28,26,24', CHALKr = '242,239,232', TEALr = '62,140,138', REDr = '168,50,31';

// ───────────── shared helpers (copied from ART.md) ─────────────
// toned charcoal paper filling the frame (cache it): grey sheet + tooth grain + vignette
function paperImg() {
  return cached('paper19', W, H, 1, () => { const c = ctx;
    const g = c.createRadialGradient(540, 820, 200, 540, 960, 1250); g.addColorStop(0, '#CFCAC0'); g.addColorStop(0.6, '#B8B2A6'); g.addColorStop(1, '#8F897D');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 26000; i++) { const x = rnd(i) * W, y = rnd(i + 77777) * H, v = rnd(i + 3333);
      c.fillStyle = v > 0.5 ? `rgba(255,252,245,${0.05 + v * 0.06})` : `rgba(28,26,24,${0.03 + v * 0.07})`; c.fillRect(x, y, 1 + (v * 3 | 0), 1 + (v * 2 | 0)); }
  });
}
// grainy charcoal stroke along pts (array of [x,y]); p = 0..1 reveal; w = width; col default charcoal
function charcoal(pts, p = 1, w = 6, col = '28,26,24', a = 0.85, seed = 1) {
  const n = Math.max(2, Math.floor(pts.length * p)); if (n < 2) return;
  for (let k = 0; k < 3; k++) { ctx.beginPath();
    for (let i = 0; i < n; i++) { const j = (rnd(seed * 97 + i * 13 + k * 7) - 0.5) * w * 0.6; const [x, y] = pts[i]; i ? ctx.lineTo(x + j, y - j) : ctx.moveTo(x + j, y + j); }
    ctx.strokeStyle = `rgba(${col},${a * (k ? 0.35 : 0.8)})`; ctx.lineWidth = w * (k ? 0.5 : 1); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
}

// ───────────── small helpers ─────────────
// densify a polyline into ~step px points with a little hand jitter
function dens(pts, step = 12, close = false, j = 1.5, seed = 1) {
  const all = close ? [...pts, pts[0]] : pts, out = [];
  for (let i = 0; i < all.length - 1; i++) { const [ax, ay] = all[i], [bx, by] = all[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 0; k < n; k++) { const f = k / n; out.push([ax + (bx - ax) * f + (rnd(seed + i * 31 + k) - 0.5) * j, ay + (by - ay) * f + (rnd(seed + i * 17 + k + 7) - 0.5) * j]); } }
  out.push(all[all.length - 1]); return out;
}
const pathP = (pts, close = true) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); if (close) ctx.closePath(); };
// diagonal hatching inside the current clip
function hatch(x0, y0, x1, y1, gap = 10, a = 0.3, w = 2, seed = 1, dir = 1) {
  const h = y1 - y0; ctx.lineCap = 'round';
  for (let k = -h; k < x1 - x0 + h; k += gap) { ctx.strokeStyle = `rgba(${CHr},${a * (0.6 + rnd(seed + k) * 0.6)})`; ctx.lineWidth = w;
    ctx.beginPath(); if (dir > 0) { ctx.moveTo(x0 + k, y0); ctx.lineTo(x0 + k - h, y1); } else { ctx.moveTo(x0 + k - h, y0); ctx.lineTo(x0 + k, y1); } ctx.stroke(); }
}
// abstract charcoal squiggle row (unreadable on purpose)
function squig(x0, x1, y, seed, a = 0.7, w = 2.5) {
  ctx.strokeStyle = `rgba(${CHr},${a})`; ctx.lineWidth = w; ctx.lineCap = 'round'; let x = x0; ctx.beginPath();
  for (let k = 0; x < x1 && k < 40; k++) { const f = rnd(seed * 13 + k), lw = 12 + f * 26; ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + lw * 0.3, y - 9 * f, x + lw * 0.6, y + 7, x + lw, y - 2); x += lw + 6 + f * 10; if (f > 0.86) x += 26; }
  ctx.stroke();
}
// rotate + blit a cached canvas
function img(c, ox, oy, x, y, s = 1, rot = 0, a = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); blit(c, ox, oy, 0, 0, s, a); ctx.restore(); }
// studio wall + slightly oversized paper (safe under small in-shot pans)
function bg(px = 0, py = 0) { ctx.fillStyle = WALL; ctx.fillRect(-300, -300, W + 600, H + 600); blit(paperImg(), 540, 960, 540 + px, 960 + py, 1.1); }
// label: Caladea caps drawn in left-to-right, charcoal double-pass, short pastel underline (ul: 'teal' | 'red' | 'both' | null)
function tag(text, x, y, size, p = 1, ul = null, col = CH, a = 1, seed = 1) {
  if (p <= 0) return;
  ctx.save(); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.06)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width, q = clamp(p / 0.75);
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2 - 30, y - size, (w + 60) * eo(q), size * 2); ctx.clip();
  ctx.globalAlpha = a * 0.35; ctx.fillStyle = col === CH ? CH : CH; ctx.fillText(text, x + size * 0.03, y + size * 0.03);
  ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillText(text, x, y);
  ctx.globalAlpha = a * 0.25; ctx.fillStyle = col; ctx.fillText(text, x - 1.5, y - 1);
  ctx.restore(); ctx.letterSpacing = '0px';
  if (ul) { const up = seg(p, 0.45, 1), uy = y + size * 0.62, hw = Math.min(w / 2, Math.max(70, w * 0.32)), uw = Math.max(4, size * 0.11);
    if (ul === 'both') { charcoal(dens([[x - hw, uy], [x - 4, uy + 2]], 10, false, 1, seed), up, uw, TEALr, 0.95 * a, seed); charcoal(dens([[x + 4, uy + 2], [x + hw, uy]], 10, false, 1, seed + 5), up, uw, REDr, 0.95 * a, seed + 5); }
    else charcoal(dens([[x - hw, uy], [x + hw, uy + 3]], 10, false, 1, seed), up, uw, ul === 'teal' ? TEALr : REDr, 0.95 * a, seed); }
  ctx.restore(); ctx.letterSpacing = '0px';
}
// rough red pastel box tag (DISPUTED)
function boxTag(text, x, y, size, p, rot = 0, seed = 3) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${Math.round(size * 0.1)}px`; const w = ctx.measureText(text).width + 60, h = size * 1.5; ctx.letterSpacing = '0px';
  ctx.fillStyle = `rgba(210,205,195,${0.96 * clamp(p * 3)})`; ctx.fillRect(-w / 2, -h / 2, w, h);
  charcoal(dens([[-w / 2, -h / 2], [w / 2, -h / 2 + 3], [w / 2 - 2, h / 2], [-w / 2 + 3, h / 2 - 2], [-w / 2, -h / 2]], 14, false, 2, seed), eo(clamp(p * 1.4)), 7, REDr, 0.95, seed);
  tag(text, 0, 2, size, clamp(p * 1.3), null, RED, 1, seed); ctx.restore();
}
// torn paper scrap pinned under a label that crosses the seam
function scrap(cx, cy, w, h, seed = 1, rot = 0, sc = 1) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); const P = [];
  for (let i = 0; i <= 10; i++) P.push([-w / 2 + w * i / 10, -h / 2 + (rnd(seed + i) - 0.5) * 12]);
  for (let i = 0; i <= 10; i++) P.push([w / 2 - w * i / 10, h / 2 + (rnd(seed + i + 40) - 0.5) * 12]);
  pathP(P.map(([x, y]) => [x + 10, y + 12])); ctx.fillStyle = 'rgba(20,18,16,0.22)'; ctx.fill();
  pathP(P); ctx.fillStyle = '#D2CDC3'; ctx.fill(); charcoal(dens([...P, P[0]], 16, false, 1.5, seed), 1, 4, CHr, 0.6, seed);
  ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, -h / 2 + 16, 7, 0, TAU); ctx.fill();
  ctx.restore();
}
// TORN SEAM DIPTYCH: jagged vertical tear at x; gap = dark wall showing through; teal tint left, red tint right
function seamPts(x, seed) { const out = []; for (let i = 0, y = -260; y <= 2180; i++, y += 28) out.push([x + (rnd(seed + i) - 0.5) * 22 + Math.sin(y * 0.011 + seed) * 7, y]); return out; }
function diptych(x, gap, seed = 7, tint = 1) {
  const P = seamPts(x, seed), Lp = P.map(([px, py], i) => [px - gap / 2 - rnd(seed + i * 3) * 5, py]), Rp = P.map(([px, py], i) => [px + gap / 2 + rnd(seed + i * 5) * 5, py]);
  if (tint > 0) {
    pathP([[-400, -300], ...Lp, [-400, 2200]]); ctx.fillStyle = `rgba(${TEALr},${0.14 * tint})`; ctx.fill();
    pathP([[1500, -300], ...Rp, [1500, 2200]]); ctx.fillStyle = `rgba(${REDr},${0.11 * tint})`; ctx.fill();
  }
  if (gap > 0.6) {
    pathP([...Lp, ...Rp.slice().reverse()]); ctx.fillStyle = WALL; ctx.fill();
    for (const E of [Lp, Rp]) { pathP(E, false); ctx.lineJoin = 'round'; ctx.strokeStyle = `rgba(${CHALKr},0.28)`; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = `rgba(${CHALKr},0.85)`; ctx.lineWidth = 3; ctx.stroke(); }
  } else { pathP(P, false); ctx.strokeStyle = `rgba(${CHr},0.35)`; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = `rgba(${CHALKr},0.4)`; ctx.lineWidth = 2; ctx.translate(3, 0); ctx.stroke(); ctx.translate(-3, 0); }
  return P;
}
// CHALK-DUST BURST at time t0 (shot-local)
function burst(lt, t0, x, y, n = 40, seed = 1, col = CHALKr, spd = 1) {
  const a = lt - t0; if (a < 0 || a > 1.6) return; const al = (1 - a / 1.6);
  for (let i = 0; i < n; i++) { const ang = rnd(seed + i) * TAU, v = (140 + rnd(seed + i * 7) * 420) * spd, dd = v * (1 - Math.exp(-a * 3.2)) / 3.2;
    const s = 2 + rnd(seed + i * 3) * 6; ctx.fillStyle = `rgba(${i % 4 === 0 ? CHr : col},${al * (0.45 + rnd(seed + i * 5) * 0.5)})`;
    ctx.fillRect(x + Math.cos(ang) * dd, y + Math.sin(ang) * dd * 0.8 + 70 * a * a, s, s); }
}
// falling charcoal dust specks (kept above the caption band)
function specks(t, n = 30, seed = 0, a = 0.4) {
  for (let i = 0; i < n; i++) { const x = rnd(seed + i) * W + Math.sin(t * 0.8 + i) * 10, y = 120 + ((rnd(seed + i * 3) * 1180 + t * (30 + rnd(seed + i * 9) * 60)) % 1180), s = 1.5 + rnd(seed + i * 5) * 3.5;
    ctx.fillStyle = `rgba(${i % 3 ? CHr : CHALKr},${a * (0.4 + rnd(seed + i * 7) * 0.6)})`; ctx.fillRect(x, y, s, s); }
}
// SMUDGE: wide soft charcoal thumb-smear from (x0,y0) toward (x1,y1)
function smudge(x0, y0, x1, y1, p, w = 160, a = 0.1) {
  if (p <= 0) return; ctx.lineCap = 'round';
  for (let k = 0; k < 14; k++) { const o = (rnd(k * 7 + x0) - 0.5) * w, e = 1 - Math.abs(o) / w, q = p * (0.7 + rnd(k * 3 + y0) * 0.3), s0 = rnd(k * 5 + x1) * 0.12;
    ctx.strokeStyle = `rgba(${CHr},${a * (0.5 + e)})`; ctx.lineWidth = w * (0.1 + rnd(k * 11) * 0.14) * (0.5 + e);
    ctx.beginPath(); ctx.moveTo(lerp(x0, x1, s0), lerp(y0, y1, s0) + o); ctx.lineTo(lerp(x0, x1, q), lerp(y0, y1, q) + o * 0.8); ctx.stroke(); }
}
// PUTTY ERASER streak: bright paper-coloured soft stroke + crumbs at its head
function eraser(x0, y0, x1, y1, p, w = 150, seed = 4) {
  if (p <= 0) return; const x = lerp(x0, x1, p), y = lerp(y0, y1, p); ctx.lineCap = 'round';
  for (let k = 0; k < 16; k++) { const o = (rnd(k * 13 + seed) - 0.5) * w, e = 1 - Math.abs(o) / (w * 0.5), q = 0.82 + rnd(k * 3 + seed) * 0.18, s0 = rnd(k * 9 + seed) * 0.08;
    ctx.strokeStyle = `rgba(208,203,193,${0.35 + 0.5 * e})`; ctx.lineWidth = w * (0.12 + rnd(k * 5 + seed) * 0.12);
    ctx.beginPath(); ctx.moveTo(lerp(x0, x, s0), lerp(y0, y, s0) + o); ctx.lineTo(x0 + (x - x0) * q, y0 + (y - y0) * q + o); ctx.stroke(); }
  for (let i = 0; i < 26; i++) { const ox = (rnd(seed + i) - 0.3) * 120 * (p < 1 ? 1 : 0.4) + (p < 1 ? 0 : (rnd(seed + i * 9) - 0.5) * (x1 - x0)), oy = (rnd(seed + i * 3) - 0.5) * w * 1.3;
    ctx.fillStyle = i % 3 ? 'rgba(160,154,142,0.85)' : `rgba(${CHr},0.4)`; ctx.beginPath(); ctx.ellipse(x - Math.abs(ox) * 0.2 + ox * 0.5, y + oy + 4, 3 + rnd(seed + i * 5) * 5, 2 + rnd(seed + i * 7) * 3, rnd(i) * 3, 0, TAU); ctx.fill(); }
}
// crow silhouette; ph = wing phase; dir = 1 faces right
function crow(x, y, s, ph, dir = 1, fly = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.fillStyle = CH;
  ctx.beginPath(); ctx.ellipse(0, 0, 30, 12, -0.12, 0, TAU); ctx.fill();
  pathP([[-24, -2], [-56, -12], [-54, 8]]); ctx.fill();
  ctx.beginPath(); ctx.arc(28, -8, 10, 0, TAU); ctx.fill(); pathP([[34, -12], [52, -6], [34, -3]]); ctx.fill();
  const f = fly ? Math.sin(ph) : -0.15;
  pathP([[-12, -6], [14, -6], [4 - 22 * f * 0.3, -10 - 58 * f], [-22, -8 - 44 * f]]); ctx.fill();
  ctx.globalAlpha = 0.6; pathP([[-6, -4], [12, -4], [20, -6 - 40 * f], [-2, -6 - 34 * f]]); ctx.fill();
  if (!fly) { ctx.globalAlpha = 1; ctx.strokeStyle = CH; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-2, 10); ctx.lineTo(-6, 26); ctx.moveTo(8, 10); ctx.lineTo(6, 26); ctx.stroke(); }
  ctx.restore();
}
// dropped helmet (empty), lying on its side
function helmet(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, 0, 48, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#5E5A52'; ctx.fill();
  ctx.save(); ctx.clip(); hatch(-50, -50, 50, 0, 9, 0.5, 2, 3); ctx.restore();
  charcoal(dens([[-50, 0], [-40, -30], [0, -50], [40, -30], [50, 0]], 8, false, 1, 9), 1, 4, CHr, 0.9, 9);
  ctx.fillStyle = CH; ctx.beginPath(); ctx.ellipse(0, 2, 62, 9, 0, 0, TAU); ctx.fill();
  pathP([[-5, -48], [0, -78], [5, -48]]); ctx.fill();
  ctx.strokeStyle = `rgba(${CHALKr},0.7)`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 38, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
  ctx.restore();
}

// ───────────── cached drawings ─────────────
// teal-tied chronicle bundle (LANKA'S RECORD); 520 x 380, origin centre (260,190)
const bundleImg = () => cached('cBundle', 520, 380, 1, () => {
  ctx.fillStyle = 'rgba(28,26,24,0.16)'; ctx.beginPath(); ctx.ellipse(262, 330, 240, 30, 0, 0, TAU); ctx.fill();
  // stack edge
  pathP([[40, 150], [480, 150], [470, 300], [50, 306]]); ctx.fillStyle = '#A8A296'; ctx.fill();
  ctx.save(); ctx.clip(); hatch(30, 150, 490, 310, 9, 0.28, 2, 5);
  for (let k = 0; k < 9; k++) { ctx.strokeStyle = `rgba(${k % 2 ? CHALKr : CHr},${k % 2 ? 0.45 : 0.5})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(44, 170 + k * 15); ctx.lineTo(476, 168 + k * 15 + (rnd(k) - 0.5) * 4); ctx.stroke(); }
  ctx.restore();
  charcoal(dens([[40, 150], [50, 306], [470, 300], [480, 150]], 12, false, 2, 3), 1, 5, CHr, 0.9, 3);
  // top folio
  pathP([[30, 70], [490, 62], [482, 158], [36, 162]]); ctx.fillStyle = '#D6D1C6'; ctx.fill();
  ctx.save(); ctx.clip(); for (let r = 0; r < 4; r++) { squig(70, 200, 92 + r * 18, 11 + r, 0.55, 2); squig(250, 460, 90 + r * 18, 31 + r, 0.55, 2); } ctx.restore();
  charcoal(dens([[30, 70], [490, 62], [482, 158], [36, 162], [30, 70]], 12, false, 2, 5), 1, 5, CHr, 0.9, 5);
  // teal cords wrapping the stack + knots and tails
  for (const cx of [222, 238]) {
    charcoal(dens([[cx, 64], [cx + 2, 160], [cx + 4, 304]], 10, false, 1.2, cx), 1, 10, TEALr, 0.95, cx);
  }
  for (const [cx, k] of [[110, 1], [410, 2]]) { ctx.fillStyle = 'rgba(28,26,24,0.7)'; ctx.beginPath(); ctx.ellipse(cx, 112, 8, 6, 0, 0, TAU); ctx.fill(); }
  charcoal(dens([[110, 112], [230, 112], [410, 112]], 10, false, 1, 41), 1, 6, TEALr, 0.9, 41);
  ctx.fillStyle = TEAL; ctx.beginPath(); ctx.ellipse(230, 112, 20, 14, 0.3, 0, TAU); ctx.fill(); ctx.strokeStyle = CH; ctx.lineWidth = 3; ctx.stroke();
  charcoal(dens([[230, 118], [214, 170], [204, 240], [196, 292]], 10, false, 1.5, 51), 1, 7, TEALr, 0.9, 51);
  charcoal(dens([[236, 118], [254, 176], [262, 236]], 10, false, 1.5, 61), 1, 7, TEALr, 0.9, 61);
  // chalk highlight
  ctx.strokeStyle = `rgba(${CHALKr},0.75)`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(44, 74); ctx.lineTo(300, 69); ctx.stroke();
});
// red-edged stone slab (CHOLA RECORD); 380 x 600, origin centre (190,300)
const slabImg = () => cached('cSlab', 380, 600, 1, () => {
  ctx.fillStyle = 'rgba(28,26,24,0.18)'; ctx.beginPath(); ctx.ellipse(196, 572, 190, 22, 0, 0, TAU); ctx.fill();
  const S = [[44, 560], [44, 140], [80, 76], [190, 46], [300, 76], [336, 140], [336, 560]];
  pathP(S); ctx.fillStyle = '#A39D91'; ctx.fill();
  ctx.save(); ctx.clip(); hatch(220, 40, 340, 570, 8, 0.4, 2, 9); hatch(40, 40, 340, 570, 22, 0.12, 2, 19, -1);
  for (let r = 0; r < 9; r++) { const y = 160 + r * 40; ctx.strokeStyle = `rgba(${CHr},0.72)`; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 76; x < 300;) { const f = rnd(r * 41 + x); ctx.moveTo(x, y + f * 6); ctx.lineTo(x + 5 + f * 6, y - 8 - f * 4); x += 11 + f * 9; if (f > 0.9) x += 20; } ctx.stroke();
    ctx.strokeStyle = `rgba(${CHALKr},0.35)`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(74, y + 10); ctx.lineTo(304, y + 9); ctx.stroke(); }
  ctx.restore();
  charcoal(dens(S, 12, true, 2, 13), 1, 6, CHr, 0.9, 13);
  charcoal(dens([[336, 560], [336, 140], [300, 76], [190, 46]], 10, false, 1.5, 17), 1, 11, REDr, 0.9, 17);
  ctx.strokeStyle = `rgba(${CHALKr},0.7)`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(56, 540); ctx.lineTo(56, 150); ctx.lineTo(86, 92); ctx.stroke();
  ctx.fillStyle = CH; ctx.fillRect(20, 556, 340, 26); ctx.fillStyle = `rgba(${CHALKr},0.4)`; ctx.fillRect(24, 558, 330, 3);
});
// gate of Madurai: 760 x 1000, origin bottom-centre (380,1000); spikes on the lintel
const SPX = [70, 150, 230, 310, 380, 450, 530, 610, 690], SPY0 = 232, SPY1 = 78, RED_SP = [3, 5];
const gateImg = () => cached('cGate', 760, 1000, 1, () => {
  ctx.fillStyle = 'rgba(28,26,24,0.25)'; ctx.beginPath(); ctx.ellipse(380, 980, 380, 26, 0, 0, TAU); ctx.fill();
  for (const [x0, x1] of [[30, 130], [630, 730]]) { pathP([[x0, 290], [x1, 290], [x1 + 6, 980], [x0 - 6, 980]]); ctx.fillStyle = '#8F897D'; ctx.fill();
    ctx.save(); ctx.clip(); hatch(x0 - 10, 290, x1 + 10, 980, 9, 0.35, 2, x0); for (let y = 330; y < 980; y += 48) { ctx.strokeStyle = `rgba(${CHr},0.4)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y + 2); ctx.stroke(); } ctx.restore();
    charcoal(dens([[x0, 290], [x0 - 6, 980]], 12, false, 1.5, x0), 1, 6, CHr, 0.9, x0); charcoal(dens([[x1, 290], [x1 + 6, 980]], 12, false, 1.5, x1), 1, 6, CHr, 0.9, x1); }
  // doors
  for (const [x0, x1, sd] of [[136, 376, 1], [384, 624, 2]]) { ctx.fillStyle = '#7C766B'; ctx.fillRect(x0, 300, x1 - x0, 670);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, 300, x1 - x0, 670); ctx.clip(); hatch(x0, 300, x1, 970, 7, sd === 1 ? 0.22 : 0.34, 2, sd * 7, sd === 1 ? 1 : -1);
    for (let x = x0 + 40; x < x1; x += 40) { ctx.strokeStyle = `rgba(${CHr},0.55)`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x + (rnd(x) - 0.5) * 4, 970); ctx.stroke(); }
    ctx.restore();
    for (const by of [400, 630, 860]) { ctx.fillStyle = CH; ctx.fillRect(x0, by - 12, x1 - x0, 24); for (let x = x0 + 22; x < x1; x += 40) { ctx.fillStyle = CH; ctx.beginPath(); ctx.arc(x, by, 9, 0, TAU); ctx.fill(); ctx.fillStyle = `rgba(${CHALKr},0.6)`; ctx.beginPath(); ctx.arc(x - 3, by - 3, 3, 0, TAU); ctx.fill(); } }
    charcoal(dens([[x0, 300], [x1, 300], [x1, 970], [x0, 970], [x0, 300]], 14, false, 2, sd * 3), 1, 5, CHr, 0.9, sd * 3); }
  ctx.fillStyle = CH; ctx.fillRect(374, 300, 12, 670);
  // lintel
  pathP([[14, 232], [746, 232], [740, 300], [20, 300]]); ctx.fillStyle = '#5E5A52'; ctx.fill(); ctx.save(); ctx.clip(); hatch(10, 230, 750, 300, 6, 0.5, 2, 71); ctx.restore();
  charcoal(dens([[14, 232], [746, 232], [740, 300], [20, 300], [14, 232]], 14, false, 2, 77), 1, 6, CHr, 0.95, 77);
  ctx.strokeStyle = `rgba(${CHALKr},0.6)`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(24, 240); ctx.lineTo(500, 238); ctx.stroke();
  // iron spikes (empty)
  SPX.forEach((x, i) => { pathP([[x - 9, SPY0], [x, SPY1 + (i % 2) * 14], [x + 9, SPY0]]); ctx.fillStyle = CH; ctx.fill(); ctx.strokeStyle = `rgba(${CHALKr},0.5)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 3, SPY0 - 6); ctx.lineTo(x - 1, SPY1 + 30); ctx.stroke(); });
  // red pastel accents
  charcoal(dens([[20, 300], [740, 300]], 14, false, 1, 88), 1, 6, REDr, 0.8, 88);
});
// teal-sailed ship on hatched sea: 440 x 380, origin (220,300) waterline
const shipImg = () => cached('cShip', 440, 380, 1, () => {
  for (let r = 0; r < 4; r++) charcoal(dens(Array.from({ length: 12 }, (_, i) => [10 + i * 38, 300 + r * 20 + Math.sin(i * 1.4 + r) * 6]), 10, false, 1, 300 + r), 1, 3, CHr, 0.5 - r * 0.08, 300 + r);
  const hull = [[24, 250], [416, 250], [358, 312], [84, 314]]; pathP(hull); ctx.fillStyle = '#4A463F'; ctx.fill(); ctx.save(); ctx.clip(); hatch(20, 240, 420, 320, 7, 0.6, 2, 5); ctx.restore();
  charcoal(dens(hull, 10, true, 1.5, 7), 1, 5, CHr, 0.95, 7);
  charcoal(dens([[220, 252], [222, 32]], 10, false, 1, 9), 1, 7, CHr, 0.95, 9);
  const sail = [[106, 62], [334, 58], [350, 226], [92, 230]]; pathP(sail); ctx.fillStyle = 'rgba(62,140,138,0.92)'; ctx.fill();
  ctx.save(); ctx.clip(); for (let i = 0; i < 500; i++) { ctx.fillStyle = `rgba(${rnd(i) > 0.5 ? CHALKr : CHr},${0.08 + rnd(i * 3) * 0.12})`; ctx.fillRect(90 + rnd(i * 7) * 270, 56 + rnd(i * 11) * 180, 3, 2); } hatch(240, 50, 360, 240, 10, 0.25, 2, 13); ctx.restore();
  charcoal(dens(sail, 10, true, 1.5, 11), 1, 5, CHr, 0.9, 11);
  ctx.strokeStyle = `rgba(${CHALKr},0.75)`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(112, 74); ctx.lineTo(118, 214); ctx.stroke();
  pathP([[222, 32], [262, 42], [222, 54]]); ctx.fillStyle = TEAL; ctx.fill();
});

// red pastel question mark (draw-in top to bottom)
function redQ(x, y, size, p, seed = 5) {
  if (p <= 0) return; ctx.save(); ctx.beginPath(); ctx.rect(x - size, y - size * 0.75, size * 2, size * 1.5 * eo(clamp(p))); ctx.clip();
  ctx.font = `700 ${size}px Caladea`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = `rgba(${CHr},0.45)`; ctx.fillText('?', x + 6, y + 6); ctx.fillStyle = RED; ctx.fillText('?', x, y);
  ctx.fillStyle = `rgba(${CHALKr},0.18)`; ctx.fillText('?', x - 3, y - 3); ctx.restore();
}
// red outline on an empty spike of a gate blitted at (gx, gy) bottom-centre, scale s
function redSpikes(gx, gy, s, p, seed = 21) {
  RED_SP.forEach((i, k) => { const x = gx + (SPX[i] - 380) * s, y0 = gy + (SPY0 - 1000) * s, y1 = gy + (SPY1 + (i % 2) * 14 - 1000) * s;
    charcoal(dens([[x - 14 * s, y0], [x, y1 - 10 * s], [x + 14 * s, y0]], 6, false, 1, seed + k), seg(p, k * 0.25, k * 0.25 + 0.75), 6, REDr, 0.95, seed + k); });
}
const spikeTop = (gx, gy, s, i) => [gx + (SPX[i] - 380) * s, gy + (SPY1 + (i % 2) * 14 - 1000) * s];

// ───────────── the end card (c7 + c8 share it; absolute film time) ─────────────
function endCard(t) {
  const tw = Wd('watch', 9), tc = Wd('cracks', 9), a = t - tw, k = t - tc;
  bg(Math.sin(t * 0.7) * 6, 0);
  const close = eio(seg(a, 0, 0.6)), gap = lerp(26, 0, close);
  diptych(540, gap, 7, 1 - close);
  if (a > 0.55 && a < 2.2) burst(a, 0.6, 540, 640, 50, 71);
  // the two records slide together (seated side by side above the title)
  const m = eo(seg(a, 0, 0.8)), bob = Math.sin(t * 2.4) * 5;
  img(bundleImg(), 260, 190, lerp(250, 360, m), 560 + bob, 0.62, lerp(0.08, 0.02, m));
  img(slabImg(), 190, 300, lerp(820, 700, m), 520 - bob, 0.6, lerp(-0.08, -0.02, m));
  // hairline crack reopening down the healed seam ("which story cracks first")
  if (k > 0) { const P = seamPts(540, 7).filter(([, y]) => y > 150 && y < 1290); charcoal(P, eo(seg(k, 0, 1.2)), 4, CHr, 0.85, 91);
    const pr = eo(seg(k, 0.05, 1.3)); charcoal(P.map(([x, y]) => [x + 5, y]), pr, 2.5, REDr, 0.7, 92); charcoal(P.map(([x, y]) => [x - 5, y]), pr, 2.5, TEALr, 0.7, 93);
    burst(k, 0.05, 540, 200, 30, 97); }
  // WATCH AGAIN
  const pul = 1 + (k > 0 ? 0.02 * Math.sin(k * 6) : 0);
  ctx.save(); ctx.translate(540, 900); ctx.scale(pul, pul); tag('WATCH AGAIN', 0, 0, 120, seg(a, 0.25, 0.85), 'both', CH, 1, 33); ctx.restore();
  // AAZHI chalk wordmark on a charcoal smudge
  const wp = seg(a, 0.6, 1.1);
  if (wp > 0) { const pw = 300 * eo(wp), Pp = []; for (let i = 0; i <= 8; i++) Pp.push([390 + pw * i / 8, 1062 + (rnd(i + 5) - 0.5) * 14]); for (let i = 8; i >= 0; i--) Pp.push([390 + pw * i / 8 + (rnd(i + 9) - 0.5) * 10, 1156 + (rnd(i + 25) - 0.5) * 14]);
    pathP(Pp); ctx.fillStyle = 'rgba(28,26,24,0.88)'; ctx.fill(); smudge(380, 1110, 390 + pw + 30, 1112, 1, 110, 0.08); tag('AAZHI', 540, 1110, 52, seg(a, 0.75, 1.25), null, CHALK, 1, 44); }
  // crow: perched on the slab, then flies off on "cracks"
  const sx = lerp(820, 700, m), sy = 520 - bob - 0.6 * 254;
  if (k < 0.15) crow(sx + 8, sy - 26, 0.9, 0, -1, 0);
  else { const f = k - 0.15; crow(sx + 8 + f * 260 + f * f * 60, sy - 26 - f * 170 - f * f * 40, 0.9 + f * 0.25, f * 22, 1, 1); }
  specks(t, 34, 501, 0.45);
}

// ═════════════════════════ SHOTS ═════════════════════════
export function buildC(add, cue) {
  const L7 = L(7), L8 = L(8), L9 = L(9), END = T.dur;
  const tVic = Wd('victory', 7), tAnd = Wd('and', 8), tOver = Wd('over', 8), tWhose = Wd('whose', 8), tBent = Wd('bent', 8);
  const tOr = Wd('or', 9), tHead = Wd('head', 9), tTell = Wd('tell', 9), tBelow = Wd('below', 9), tWatch = Wd('watch', 9), tCracks = Wd('cracks', 9);

  // c1 · L7 -> L8 · two records face off like duelling cards
  add({ id: 'c1', at: L7, cam: [540, 760], zoom: 0.07, note: 'torn diptych: teal chronicle bundle vs red stone slab, VICTORY x2, TWO VICTORIES?', draw(lt, d, t) {
    bg(Math.sin(t * 0.9) * 8, 0);
    const v = tVic - L7, open = eo(seg(lt, 0, 0.3)), lunge = v < lt ? Math.sin(seg(lt, v, v + 0.35) * Math.PI) * 22 : 0;
    diptych(540 + Math.sin(lt * 2.2) * 10, 6 + 22 * open, 7, open);
    burst(lt, 0.02, 540, 560, 46, 11); burst(lt, v, 540, 700, 36, 13);
    const bx = lerp(-320, 280, eob(seg(lt, 0.04, 0.5))) + lunge, sx = lerp(1400, 800, eob(seg(lt, 0.1, 0.56))) - lunge;
    img(bundleImg(), 260, 190, bx, 720 + Math.sin(t * 2.3) * 8, 0.88, 0.09 - 0.04 * seg(lt, 0.1, 0.6));
    img(slabImg(), 190, 300, sx, 650 - Math.sin(t * 2.3) * 8, 0.92, -0.08 + 0.04 * seg(lt, 0.15, 0.65));
    tag("LANKA'S RECORD", 280, 400, 42, seg(lt, 0.25, 0.7), 'teal', CH, 1, 2);
    tag('CHOLA RECORD', 800, 300, 42, seg(lt, 0.35, 0.8), 'red', CH, 1, 3);
    tag('VICTORY', 280, 1010, 70, seg(lt, v - 0.1, v + 0.35), 'teal', CH, 1, 4);
    tag('VICTORY', 800, 1010, 70, seg(lt, v, v + 0.45), 'red', CH, 1, 5);
    const ts = eob(seg(lt, v + 0.1, v + 0.35)); if (ts > 0) scrap(540, 190, 720, 150, 21, -0.02, ts);
    tag('TWO VICTORIES?', 540, 180, 76, seg(lt, v + 0.15, v + 0.6), 'both', CH, 1, 6);
    specks(t, 24, 101, 0.4);
  } });
  cue(L7, 'zip', { gain: 0.5 }); cue(L7 + 0.05, 'slide', { gain: 0.4 }); cue(tVic, 'thud', { gain: 0.6 }); cue(tVic + 0.2, 'pop', { gain: 0.4 });

  // c2 · L8 -> "and" · DISPUTED; dates scribbled, erased, rewritten
  add({ id: 'c2', at: L8, cam: [540, 820], zoom: 0.08, note: 'DISPUTED tag; 1171? scribbled, putty eraser streak, 1174? written', draw(lt, d, t) {
    bg(0, Math.sin(t * 0.8) * 6);
    // the two records argue, faint in the background
    const sw = Math.sin(t * 5) * 0.03;
    img(bundleImg(), 260, 190, 200, 520, 0.42, 0.1 + sw, 0.55); img(slabImg(), 190, 300, 880, 500, 0.42, -0.1 - sw, 0.55);
    // the two records argue: teal and red charcoal arrows jab at each other and clash in the middle
    for (let i = 0; i < 3; i++) { const j0 = 0.1 + i * 0.6, jab = Math.sin(seg(lt, j0, j0 + 0.45) * Math.PI), y = 470 + i * 40, fade = 1 - seg(lt, 1.9, 2.3);
      const lx = 330 + 170 * jab, rx = 750 - 170 * jab;
      charcoal(dens([[330, y], [lx, y + 4]], 8, false, 1, 60 + i), 1, 6, TEALr, 0.9 * fade, 60 + i); charcoal(dens([[lx - 26, y - 18], [lx, y + 4], [lx - 26, y + 24]], 6, false, 1, 63 + i), 1, 6, TEALr, 0.9 * fade, 63 + i);
      charcoal(dens([[750, y + 10], [rx, y + 6]], 8, false, 1, 66 + i), 1, 6, REDr, 0.9 * fade, 66 + i); charcoal(dens([[rx + 26, y - 14], [rx, y + 6], [rx + 26, y + 28]], 6, false, 1, 69 + i), 1, 6, REDr, 0.9 * fade, 69 + i);
      burst(lt, j0 + 0.22, 540, y + 6, 14, 80 + i, CHALKr, 0.4); }
    boxTag('DISPUTED', 540, 250 + Math.sin(t * 3) * 4, 66, seg(lt, 0, 0.3), -0.04 + Math.sin(t * 2) * 0.01, 3);
    const e0 = tOver - L8 - 0.2, e1 = e0 + 0.4;
    tag('1171?', 540, 800, 170, seg(lt, 0.3, 0.9), null, CH, 1, 7);
    eraser(200, 800, 900, 790, eo(seg(lt, e0, e1)), 150, 4);
    tag('1174?', 540, 1060, 170, seg(lt, e1 - 0.05, e1 + 0.45), 'red', CH, 1, 8);
    burst(lt, e1, 860, 800, 26, 41, '207,202,192', 0.6);
    specks(t, 26, 202, 0.4);
  } });
  cue(L8, 'whoosh', { gain: 0.45 }); cue(L8 + 0.05, 'thud', { gain: 0.45 }); cue(L8 + 0.3, 'chisel', { gain: 0.35 }); cue(tOver - 0.2, 'zip', { gain: 0.45 }); cue(tOver + 0.2, 'chisel', { gain: 0.35 });

  // c3 · "and" -> L9 · the seam cracks wider: WHO BENT THE TRUTH?
  add({ id: 'c3', at: tAnd, cam: [540, 700], zoom: 0.1, note: 'diptych seam cracks wider, red crack on the slab, DISPUTED stays, WHO BENT THE TRUTH?', draw(lt, d, t) {
    bg(Math.sin(t * 0.9) * 8, 0);
    const b = tBent - tAnd, jolt = lt > b ? Math.exp(-(lt - b) * 6) * Math.sin((lt - b) * 50) * 14 : 0;
    const gap = 22 + 34 * eo(seg(lt, b - 0.05, b + 0.3)) + 6 * Math.sin(lt * 3);
    diptych(540 + Math.sin(lt * 4) * 16 + jolt, gap, 9, 1);
    img(bundleImg(), 260, 190, 270 + jolt * 0.6, 640, 0.86, 0.05 + Math.sin(t * 3) * 0.02);
    img(slabImg(), 190, 300, 810 - jolt * 0.6, 600, 0.9, -0.05 - Math.sin(t * 3) * 0.02);
    // red crack running down the slab (from its top) and a charcoal crack across the bundle
    charcoal(dens([[800, 360], [780, 430], [812, 500], [790, 580], [824, 660], [806, 740]], 8, false, 1, 31), eo(seg(lt, 0.2, b + 0.2)), 6, REDr, 0.95, 31);
    charcoal(dens([[200, 610], [240, 650], [226, 700], [262, 740]], 8, false, 1, 33), eo(seg(lt, b, b + 0.4)), 5, CHr, 0.9, 33);
    burst(lt, b, 540, 620, 50, 51); burst(lt, 0.02, 540, 300, 26, 53);
    boxTag('DISPUTED', 540, 200, 58, 1, -0.04 + Math.sin(t * 2) * 0.01, 5);
    const ws = eob(seg(lt, tWhose - tAnd - 0.2, tWhose - tAnd + 0.1)); if (ws > 0) scrap(540 + jolt * 0.3, 1145, 960, 170, 23, 0.015, ws);
    tag('WHO BENT THE TRUTH?', 540 + jolt * 0.3, 1130, 74, seg(lt, tWhose - tAnd - 0.1, b + 0.2), 'both', CH, 1, 9);
    specks(t, 28, 303, 0.45);
  } });
  cue(tAnd, 'slide', { gain: 0.45 }); cue(tBent, 'rumble', { gain: 0.5 }); cue(tBent + 0.02, 'thud', { gain: 0.55 });

  // c4 · L9 -> "or" · a hero's welcome (teal, left)
  add({ id: 'c4', at: L9, cam: [440, 760], zoom: 0.09, note: 'left teal panel: ship sailing home, chalk glory rays, HERO?', draw(lt, d, t) {
    bg(-Math.sin(t * 0.8) * 8, 0);
    diptych(930 + Math.sin(lt * 2) * 8, 22, 11, 1.6);
    const cx = 440, cy = 640;
    for (let i = 0; i < 11; i++) { const ang = -Math.PI + (i + 0.5) / 11 * Math.PI, p = eo(seg(lt, 0.02 + i * 0.03, 0.4 + i * 0.03)), r0 = 230, r1 = r0 + (130 + rnd(i) * 90) * p;
      charcoal(dens([[cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 * 0.9], [cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1 * 0.9]], 10, false, 1, 400 + i), 1, 6, CHALKr, 0.8, 400 + i); }
    img(shipImg(), 220, 300, lerp(330, 470, lt / d), 760 + Math.sin(t * 2.6) * 10, 1.15, Math.sin(t * 2.2) * 0.04);
    for (let i = 0; i < 26; i++) { const x = 140 + rnd(i + 900) * 640 + Math.sin(t * 2 + i) * 14, y = 200 + ((rnd(i * 3 + 900) * 700 + lt * 220) % 700);
      ctx.fillStyle = i % 3 ? `rgba(${CHALKr},0.8)` : `rgba(${TEALr},0.9)`; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 + i); ctx.fillRect(-5, -3, 10, 6); ctx.restore(); }
    tag('HERO?', 440, 1110, 140, seg(lt, 0.1, 0.55), 'teal', TEAL, 1, 12);
    specks(t, 18, 404, 0.35);
  } });
  cue(L9, 'whoosh', { gain: 0.45 }); cue(L9 + 0.12, 'bell', { gain: 0.4 }); cue(L9 + 0.3, 'sparkle', { gain: 0.3 });

  // c5 · "or" -> "tell" · the red record pushes the seam: or a head on a gate?
  add({ id: 'c5', at: tOr, cam: [600, 700], zoom: 0.08, note: 'red panel pushes the seam left: gate, empty spikes outlined red, red ?, crows lift, dropped helmet, OR A HEAD ON A GATE?', draw(lt, d, t) {
    bg(Math.sin(t * 0.8) * 8, 0);
    const push = eo(seg(lt, 0, 0.35)), sxp = lerp(930, 150, push);
    diptych(sxp + Math.sin(lt * 2) * 6, 22, 13, 1.6);
    burst(lt, 0.3, sxp + 20, 700, 44, 61);
    const gx = 610, gy = 1080, gs = 0.85, slam = lt < 0.5 ? 0 : Math.exp(-(lt - 0.5) * 8) * Math.sin((lt - 0.5) * 40) * 6;
    ctx.save(); ctx.beginPath(); ctx.rect(sxp + 14, -300, 1600, 2400); ctx.clip();
    img(gateImg(), 380, 1000, gx + lerp(220, 0, push), gy + slam, gs);
    ctx.restore();
    const h = tHead - tOr;
    redSpikes(gx + lerp(220, 0, push), gy + slam, gs, seg(lt, 0.35, h + 0.45));
    redQ(gx, 190, 230, seg(lt, h - 0.1, h + 0.35));
    // crows lifting off the empty spikes
    [[1, 0.25], [7, 0.4], [4, 0.55]].forEach(([i, t0], j) => { const [x, y] = spikeTop(gx, gy, gs, i), f = Math.max(0, lt - t0);
      if (lt < t0) crow(x, y - 20, 0.7, 0, j % 2 ? -1 : 1, 0);
      else crow(x + (j % 2 ? -1 : 1) * (f * 260 + f * f * 60), y - 20 - f * 230 - f * f * 40, 0.7 + f * 0.3, f * 24 + j, j % 2 ? -1 : 1, 1); });
    helmet(840, 1070, 0.85, 0.5 + Math.sin(lt * 7) * 0.06 * Math.exp(-lt * 1.5));
    tag('OR A HEAD ON A GATE?', 600, 1185, 64, seg(lt, h - 0.25, h + 0.35), 'red', CH, 1, 14);
    specks(t, 22, 505, 0.4);
  } });
  cue(tOr, 'slide', { gain: 0.55 }); cue(tOr + 0.3, 'slam', { gain: 0.55 }); cue(tOr + 0.3, 'whoosh', { gain: 0.35 }); cue(tHead, 'tock', { gain: 0.45 });

  // c6 · "tell" -> "watch" · both answers side by side; TELL ME BELOW on a scrap pinned over the seam
  add({ id: 'c6', at: tTell, cam: [540, 760], zoom: 0.07, note: 'wide diptych: HERO? ship | gate + red ?, paper scrap over the seam: TELL ME BELOW + bobbing arrow', draw(lt, d, t) {
    bg(Math.sin(t * 0.8) * 6, 0);
    diptych(540 + Math.sin(lt * 2.6) * 12, 24, 15, 1.4);
    const bob = Math.sin(t * 2.4) * 8;
    img(shipImg(), 220, 300, 270 + Math.sin(t) * 10, 600 + bob, 0.78, Math.sin(t * 2.2) * 0.04);
    tag('HERO?', 270, 810, 90, seg(lt, 0, 0.25), 'teal', TEAL, 1, 16);
    img(gateImg(), 380, 1000, 810, 740 - bob, 0.42);
    redSpikes(810, 740 - bob, 0.42, 1, 24);
    redQ(810, 290 - bob, 120, seg(lt, 0, 0.25));
    tag('OR A HEAD ON A GATE?', 810, 810, 36, seg(lt, 0.05, 0.35), 'red', CH, 1, 17);
    // paper scrap pinned over the seam
    const sp = eob(seg(lt, 0.02, 0.3)), ry = 1080;
    ctx.save(); ctx.translate(540, ry); ctx.rotate(-0.025 + Math.sin(t * 1.6) * 0.008); ctx.scale(sp, sp);
    const scrap = [[-400, -100], [-120, -110], [150, -98], [400, -108], [392, 190], [120, 182], [-160, 194], [-396, 186]];
    ctx.fillStyle = 'rgba(28,26,24,0.18)'; pathP(scrap.map(([x, y]) => [x + 10, y + 12])); ctx.fill();
    pathP(scrap); ctx.fillStyle = '#D2CDC3'; ctx.fill(); charcoal(dens(scrap, 14, true, 2, 81), 1, 4, CHr, 0.7, 81);
    ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, -80, 9, 0, TAU); ctx.fill();
    tag('TELL ME BELOW', 0, -18, 82, seg(lt, 0.1, 0.5), 'both', CH, 1, 18);
    const ab = Math.sin(t * 7) * 10, ap = eo(seg(lt, 0.35, 0.65));
    charcoal(dens([[0, 50], [0, 140 + ab]], 8, false, 1, 85), ap, 9, CHr, 0.9, 85);
    charcoal(dens([[-34, 106 + ab], [0, 150 + ab], [34, 106 + ab]], 6, false, 1, 86), seg(lt, 0.55, 0.75), 9, CHr, 0.9, 86);
    ctx.restore();
    burst(lt, 0.15, 540, 1020, 30, 71);
    specks(t, 22, 606, 0.4);
  } });
  cue(tTell, 'whoosh', { gain: 0.45 }); cue(tTell + 0.12, 'pop', { gain: 0.5 }); cue(tBelow, 'tock', { gain: 0.35 });

  // c7 · "watch" -> "cracks" · the seam closes: WATCH AGAIN + AAZHI
  add({ id: 'c7', at: tWatch, cam: [540, 840], zoom: 0.05, note: 'end card: torn seam closes, records slide together, WATCH AGAIN, AAZHI chalk wordmark, crow perched', draw(lt, d, t) { endCard(t); } });
  cue(tWatch, 'slide', { gain: 0.45 }); cue(tWatch + 0.6, 'thud', { gain: 0.5 }); cue(tWatch + 0.65, 'bell', { gain: 0.4 });

  // c8 · "cracks" -> end · a hairline crack runs down, the crow flies off (motion to the very end)
  add({ id: 'c8', at: tCracks, cam: [540, 760], zoom: 0.07, note: 'end card holds: hairline crack reopens down the seam, crow flies off', draw(lt, d, t) { endCard(t); } });
  cue(tCracks, 'chisel', { gain: 0.45 }); cue(tCracks + 0.15, 'whoosh', { gain: 0.4 }); cue(Math.min(END - 0.6, tCracks + 1.2), 'swell', { gain: 0.3 });
}
