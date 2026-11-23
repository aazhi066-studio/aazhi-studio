// EPISODE 19 · worker A : "Charcoal Diptych", lines 0-3 (t 0 -> L(4)). THE HOOK.
// Sheet slams in on the dark wall, push to the charcoal Madurai gate, red pastel slash, crows burst, chalk dust ·
// empty spikes outlined in red + red "?" · MADURAI skyline smudge reveal · c. 1169 + paper tearing · two crowned
// faceless princes across a torn diptych seam (ILLUSTRATION) · the throne torn in half · "one of them" chalk ring ·
// PARAKRAMA PANDYA · HELP! dotted toward LANKA on the strait map · ACCOUNTS SAY + help sail too far away ·
// putty eraser wipes him away, crown falls, KILLED? · PARAKRAMABAHU I seated (teal) · LANKAPURA with spear ·
// Palk Strait map, teal sails crossing the dotted route.
// Engine: paper, gate, city, princes, throne, king, general, map baked once by cached(); per frame only blits,
// clips, a few charcoal strokes, crows and specks. No shadowBlur anywhere.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { cached, blit, fillP, poly } from './art.js';

const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const CH = '#1C1A18', CHALK = '#F2EFE8', TEAL = '#3E8C8A', RED = '#A8321F', WALL = '#141210';
const CHc = '28,26,24', CHALKc = '242,239,232', TEALc = '62,140,138', REDc = '168,50,31';

// ───────────── shared paper helper (copied exactly from ART.md) ─────────────
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
const paper = () => blit(paperImg(), 0, 0, 0, 0, 1);
/** straight line as a point list (so charcoal() can reveal it) */
const lp = (x0, y0, x1, y1, n = 20) => Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(y0, y1, i / n)]);
/** arc as a point list */
const ap = (cx, cy, r, a0, a1, n = 40, ry = r) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + cos(a) * r, cy + sin(a) * ry]; });
/** charcoal-filled polygon (cache use) */
function cfill(pts, a = 0.85, col = CHc) { poly(pts); ctx.fillStyle = `rgba(${col},${a})`; ctx.fill(); }
/** knock paper tooth out of a cached drawing so it reads as charcoal on toothy paper */
function tooth(w, h, n = 5000, seed = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < n; i++) { const v = rnd(i * 3 + seed); ctx.fillStyle = `rgba(0,0,0,${0.15 + v * 0.45})`; ctx.fillRect(rnd(i + seed * 11) * w, rnd(i * 7 + seed * 5) * h, 1 + v * 3, 1 + rnd(i + 9) * 2); }
  ctx.restore();
}
/** diagonal hatching inside the current clip */
function hatch(x0, y0, x1, y1, gap = 14, a = 0.25, col = CHc, w = 2, ang = 1, seed = 1) {
  ctx.strokeStyle = `rgba(${col},${a})`; ctx.lineWidth = w; ctx.beginPath();
  const hh = y1 - y0;
  for (let x = x0 - hh; x < x1 + hh; x += gap) { const j = (rnd(x + seed) - 0.5) * gap * 0.5; ctx.moveTo(x + j, y0); ctx.lineTo(x + j + hh * ang, y1); }
  ctx.stroke();
}
/** soft charcoal thumb-smear from (x0,y0) toward (x1,y1), p 0..1 */
function smudge(x0, y0, x1, y1, w, a = 0.5, p = 1, col = CHc) {
  if (p <= 0) return; const x = lerp(x0, x1, p), y = lerp(y0, y1, p);
  ctx.lineCap = 'round';
  for (const [k, f] of [[1, 0.18], [0.7, 0.22], [0.42, 0.3]]) { ctx.strokeStyle = `rgba(${col},${a * f})`; ctx.lineWidth = w * k; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); }
}
/** label: Caladea 700 caps, draw-on reveal left->right, short pastel underline */
function lab(text, x, y, size, p = 1, o = {}) {
  if (p <= 0) return; const col = o.col || CH;
  ctx.save(); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${o.sp ?? Math.round(size * 0.06)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width, q = eo(clamp(p * 1.6));
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2 - 30, y - size, (w + 60) * q, size * 2); ctx.clip();
  if (o.back) { ctx.fillStyle = o.back; ctx.fillRect(x - w / 2 - size * 0.35, y - size * 0.62, w + size * 0.7, size * 1.24); }
  ctx.fillStyle = col; ctx.fillText(text, x, y + size * 0.04); ctx.restore();
  ctx.letterSpacing = '0px'; ctx.restore();
  if (o.ul) charcoal(lp(x - w * 0.3, y + size * 0.62, x + w * 0.3, y + size * 0.66, 24), seg(p, 0.45, 1), size * 0.13, o.ul, 0.95, size);
}
const tagIll = (a = 1) => { ctx.save(); ctx.globalAlpha = a; lab('ILLUSTRATION', 905, 118, 26, 1, { col: 'rgba(28,26,24,0.75)' }); ctx.restore(); };
/** chalk-dust burst at (x,y) lt seconds after the hit */
function burst(lt, x, y, n = 60, seed = 1, sp = 520, col = CHALKc) {
  if (lt < 0 || lt > 1.8) return;
  for (let i = 0; i < n; i++) {
    const a = rnd(i + seed) * TAU, v = sp * (0.25 + rnd(i * 3 + seed)), d = v * (1 - Math.exp(-3.2 * lt)) / 3.2;
    const px = x + cos(a) * d, py = y + sin(a) * d * 0.8 + 70 * lt * lt, al = clamp(1 - lt / (1.1 + rnd(i + 7) * 0.7)) * (0.5 + rnd(i + 2) * 0.5);
    const s = 2 + rnd(i * 5 + seed) * 7; ctx.fillStyle = `rgba(${rnd(i + 4) > 0.3 ? col : '120,116,108'},${al})`; ctx.fillRect(px, py, s, s * 0.8);
  }
}
/** falling charcoal / chalk specks over the whole sheet (y < 1300) */
function specks(t, n = 30, seed = 1, col = CHc, a = 0.5) {
  for (let i = 0; i < n; i++) { const x = rnd(i + seed) * W + sin(t + i) * 12, y = (rnd(i * 3 + seed) * 1300 + t * (40 + rnd(i) * 60)) % 1300, s = 2 + rnd(i * 7) * 4;
    ctx.fillStyle = `rgba(${col},${a * (0.4 + 0.6 * rnd(i + 5))})`; ctx.fillRect(x, y, s, s); }
}
/** a charcoal crow, wings flapping with phase ph, facing dir */
function crow(x, y, s, ph, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); const f = sin(ph);
  ctx.fillStyle = CH; ctx.beginPath(); ctx.ellipse(0, 0, 20, 8, -0.1, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(18, -5, 7, 0, TAU); ctx.fill(); fillP([[24, -6], [34, -2], [24, -1]], CH);
  fillP([[-18, -2], [-34, -6], [-32, 6]], CH);
  fillP([[-6, -3], [-22, -34 * f - 6], [-40, -26 * f], [6, 2]], CH);
  fillP([[2, -3], [12, -38 * f - 8], [26, -30 * f], [8, 2]], 'rgba(28,26,24,0.8)');
  ctx.restore();
}
/** crows bursting from (x0,y0) points, lt seconds after the burst */
function crows(lt, src, n = 7, seed = 1, sp = 1) {
  for (let i = 0; i < n; i++) { const [sx, sy] = src[i % src.length], a = -PI / 2 + (rnd(i + seed) - 0.5) * 2.4, v = (260 + rnd(i * 3 + seed) * 380) * sp;
    const d = v * lt + 40 * lt * lt, x = sx + cos(a) * d, y = sy + sin(a) * d * 0.85;
    crow(x, y, 1.1 + rnd(i + 8) * 0.9 + lt * 0.4, lt * (14 + rnd(i) * 6) + i, cos(a) > 0 ? 1 : -1); }
}
/** torn vertical paper seam at x; jag points cached per seed. y range -200..2100 */
const JAG = new Map();
function jag(seed) { let j = JAG.get(seed); if (j) return j; j = []; for (let y = -200, i = 0; y <= 2120; y += 34, i++) j.push([(rnd(i * 5 + seed) - 0.5) * 26 + (rnd(i + seed * 3) > 0.85 ? 14 : 0), y]); JAG.set(seed, j); return j; }
function seamPath(x, seed, right) { const j = jag(seed); ctx.beginPath(); ctx.moveTo(right ? 1400 : -300, -200); for (const [dx, y] of j) ctx.lineTo(x + dx, y); ctx.lineTo(right ? 1400 : -300, 2120); ctx.closePath(); }
/** diptych: tint each panel, then draw the torn seam (white fibre + dark shadow); p reveals the tear top->bottom */
function diptych(x, seed, lcol, rcol, p = 1) {
  if (lcol) { seamPath(x, seed, false); ctx.fillStyle = lcol; ctx.fill(); }
  if (rcol) { seamPath(x, seed, true); ctx.fillStyle = rcol; ctx.fill(); }
  const j = jag(seed), n = Math.floor(j.length * clamp(p)); if (n < 2) return;
  ctx.lineJoin = 'round';
  ctx.beginPath(); for (let i = 0; i < n; i++) ctx.lineTo(x + j[i][0] + 7, j[i][1]); ctx.strokeStyle = 'rgba(28,26,24,0.45)'; ctx.lineWidth = 9; ctx.stroke();
  ctx.beginPath(); for (let i = 0; i < n; i++) ctx.lineTo(x + j[i][0], j[i][1]); ctx.strokeStyle = 'rgba(242,239,232,0.95)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); for (let i = 0; i < n; i++) ctx.lineTo(x + j[i][0] - 3 + (i % 2) * 4, j[i][1] + 10); ctx.strokeStyle = 'rgba(242,239,232,0.5)'; ctx.lineWidth = 2; ctx.stroke();
}
/** keep the caption band calm: soft paper fade over anything drawn below y0 */
function calm(y0 = 1270) {
  const P = paperImg(); ctx.drawImage(P, 0, y0 + 70, W, H - y0 - 70, 0, y0 + 70, W, H - y0 - 70);
  const g = ctx.createLinearGradient(0, y0, 0, y0 + 72); g.addColorStop(0, 'rgba(196,190,180,0)'); g.addColorStop(1, 'rgba(196,190,180,1)'); ctx.fillStyle = g; ctx.fillRect(0, y0, W, 72);
}
/** red pastel question mark centred at (x,y), size s, p reveal */
function qmark(x, y, s, p, seed = 3) {
  const pts = [...ap(x, y - s * 0.35, s * 0.32, PI * 1.05, PI * 2.35, 30), ...lp(x + s * 0.13, y - s * 0.05, x, y + s * 0.18, 8)];
  charcoal(pts, seg(p, 0, 0.85), s * 0.11, REDc, 0.95, seed);
  if (p > 0.9) { ctx.fillStyle = `rgba(${REDc},0.95)`; ctx.beginPath(); ctx.arc(x, y + s * 0.38, s * 0.07, 0, TAU); ctx.fill(); }
}

// ───────────── cached set pieces ─────────────
// THE GATE: 1000 x 1300, origin bottom centre (500, 1300). Spike tips in SPK.
const SPK = Array.from({ length: 9 }, (_, i) => [212 + i * 72, i === 3 || i === 5 ? 170 : 225]);
function gateImg() {
  return cached('aGate', 1000, 1300, 1, () => {
    // walls with crenels + brick courses
    for (const [x0, x1] of [[0, 196], [804, 1000]]) {
      cfill([[x0, 380], [x1, 380], [x1, 1300], [x0, 1300]], 0.32);
      for (let m = x0; m < x1; m += 66) cfill([[m + 6, 330], [m + 44, 330], [m + 44, 382], [m + 6, 382]], 0.5);
      for (let y = 430, r = 0; y < 1300; y += 56, r++) { charcoal(lp(x0, y, x1, y + 3, 8), 1, 3, CHc, 0.45, y);
        for (let x = x0 + (r % 2) * 40; x < x1; x += 80) charcoal(lp(x, y, x, y + 56, 2), 1, 3, CHc, 0.35, x + y); }
    }
    ctx.save(); poly([[0, 380], [196, 380], [196, 1300], [0, 1300]]); ctx.clip(); hatch(0, 380, 200, 1300, 13, 0.22); ctx.restore();
    // posts + lintel
    cfill([[176, 420], [236, 420], [236, 1300], [176, 1300]], 0.85); cfill([[764, 420], [824, 420], [824, 1300], [764, 1300]], 0.85);
    cfill([[130, 396], [870, 396], [878, 484], [122, 484]], 0.9);
    charcoal(lp(130, 398, 870, 396, 30), 1, 5, CHALKc, 0.7, 4);
    for (let x = 160; x < 860; x += 54) { ctx.fillStyle = 'rgba(242,239,232,0.6)'; ctx.beginPath(); ctx.arc(x, 440, 5, 0, TAU); ctx.fill(); }
    // spikes (iron shafts + leaf tips)
    for (const [x, ty] of SPK) { charcoal(lp(x, 398, x, ty + 30, 10), 1, 9, CHc, 0.95, x);
      cfill([[x, ty - 4], [x + 13, ty + 34], [x, ty + 46], [x - 13, ty + 34]], 0.95);
      charcoal(lp(x - 4, ty + 8, x - 4, 390, 6), 1, 2, CHALKc, 0.45, x + 3); }
    // doors
    cfill([[236, 484], [764, 484], [764, 1300], [236, 1300]], 0.62);
    for (let x = 236; x <= 764; x += 44) charcoal(lp(x, 486, x + 2, 1300, 12), 1, 4, CHc, 0.55, x);
    ctx.save(); poly([[236, 484], [500, 484], [500, 1300], [236, 1300]]); ctx.clip(); hatch(236, 484, 520, 1300, 11, 0.3, CHc, 2.5, 0.6); ctx.restore();
    ctx.save(); poly([[500, 484], [764, 484], [764, 1300], [500, 1300]]); ctx.clip(); hatch(480, 484, 780, 1300, 22, 0.16, CHALKc, 2, -0.5); ctx.restore();
    for (const y of [620, 880, 1140]) { cfill([[236, y - 12], [764, y - 12], [764, y + 12], [236, y + 12]], 0.92);
      for (let x = 262; x < 760; x += 52) { ctx.fillStyle = CH; ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(242,239,232,0.75)'; ctx.beginPath(); ctx.arc(x - 3, y - 4, 3.5, 0, TAU); ctx.fill(); } }
    charcoal(lp(500, 484, 500, 1300, 20), 1, 10, CHc, 0.95, 9);
    for (const x of [468, 532]) { charcoal(ap(x, 990, 24, 0, TAU, 24), 1, 6, CHc, 0.95, x); }
    // red pastel accents on the gate (lintel edge + threshold)
    charcoal(lp(140, 482, 860, 484, 30), 1, 7, REDc, 0.8, 12);
    charcoal(lp(236, 1292, 764, 1294, 30), 1, 10, REDc, 0.55, 13);
    tooth(1000, 1300, 9000, 2);
  });
}
// MADURAI skyline: 1080 x 700, origin bottom centre (540, 700)
function cityImg() {
  return cached('aCity', 1080, 700, 1, () => {
    const gop = (cx, base, w, h, tiers, a) => { for (let i = 0; i < tiers; i++) { const f0 = i / tiers, f1 = (i + 1) / tiers, w0 = w * (1 - f0 * 0.62), w1 = w * (1 - f1 * 0.62), y0 = base - h * f0, y1 = base - h * f1;
        cfill([[cx - w0 / 2, y0], [cx + w0 / 2, y0], [cx + w1 / 2, y1 + 8], [cx - w1 / 2, y1 + 8]], a * (0.7 + 0.3 * (i % 2)));
        charcoal(lp(cx - w1 / 2 - 6, y1 + 8, cx + w1 / 2 + 6, y1 + 8, 10), 1, 4, CHALKc, 0.45, cx + i); }
      const tw = w * 0.38; cfill([[cx - tw / 2, base - h], [cx + tw / 2, base - h], [cx + tw / 2 - 8, base - h - 34], [cx - tw / 2 + 8, base - h - 34]], a);
      ctx.save(); poly([[cx - w / 2, base], [cx, base], [cx, base - h], [cx - w * 0.2, base - h]]); ctx.clip(); hatch(cx - w, base - h, cx, base, 10, 0.3); ctx.restore(); };
    gop(150, 560, 170, 300, 6, 0.45); gop(930, 560, 180, 330, 6, 0.45);
    gop(330, 560, 220, 430, 8, 0.7); gop(760, 560, 230, 450, 8, 0.7); gop(540, 560, 280, 540, 9, 0.88);
    // fort wall
    cfill([[0, 540], [1080, 540], [1080, 700], [0, 700]], 0.78);
    for (let m = 0; m < 1080; m += 60) cfill([[m + 8, 500], [m + 40, 500], [m + 40, 542], [m + 8, 542]], 0.8);
    ctx.save(); poly([[0, 540], [1080, 540], [1080, 700], [0, 700]]); ctx.clip(); hatch(0, 540, 1080, 700, 9, 0.3, CHALKc, 1.5, -0.7); ctx.restore();
    // small red gate in the wall
    cfill([[505, 700], [505, 600], [540, 578], [575, 600], [575, 700]], 0.95);
    charcoal([[505, 700], [505, 600], [540, 578], [575, 600], [575, 700]], 1, 7, REDc, 0.9, 5);
    tooth(1080, 700, 5000, 4);
  });
}
// a crowned faceless prince facing right: 420 x 900, origin bottom centre (210, 900)
function princeImg() {
  return cached('aPrince', 420, 900, 1, () => {
    cfill([[150, 272], [270, 272], [318, 330], [370, 900], [52, 900], [104, 330]], 0.86);
    cfill([[186, 225], [236, 225], [238, 285], [184, 285]], 0.9);
    ctx.fillStyle = 'rgba(28,26,24,0.92)'; ctx.beginPath(); ctx.ellipse(212, 180, 52, 64, 0, 0, TAU); ctx.fill();
    cfill([[160, 146], [158, 62], [180, 96], [196, 26], [212, 80], [228, 26], [244, 96], [266, 62], [264, 146]], 0.96);
    charcoal(lp(158, 140, 266, 140, 12), 1, 6, CHALKc, 0.7, 3);
    for (const x of [196, 228]) { ctx.fillStyle = 'rgba(242,239,232,0.8)'; ctx.beginPath(); ctx.arc(x, 112, 6, 0, TAU); ctx.fill(); }
    // forward arm + raised sword
    charcoal(lp(292, 330, 366, 448, 12), 1, 42, CHc, 0.95, 4);
    charcoal(lp(368, 448, 408, 92, 20), 1, 11, CHc, 0.95, 5); charcoal(lp(344, 418, 398, 430, 6), 1, 10, CHc, 0.95, 6);
    charcoal(lp(372, 430, 404, 110, 20), 1, 3, CHALKc, 0.6, 7);
    // robe hatching, sash, chalk rim light on the right edge
    ctx.save(); poly([[150, 272], [270, 272], [318, 330], [370, 900], [52, 900], [104, 330]]); ctx.clip(); hatch(40, 260, 380, 900, 12, 0.35, CHc, 2.5, 0.5); hatch(200, 260, 400, 900, 26, 0.14, CHALKc, 2, -0.4); ctx.restore();
    charcoal(lp(120, 520, 330, 600, 14), 1, 16, CHALKc, 0.25, 8);
    charcoal([[262, 150], [264, 190], [258, 225]], 1, 5, CHALKc, 0.55, 9);
    charcoal(lp(318, 334, 368, 896, 24), 1, 5, CHALKc, 0.55, 10);
    tooth(420, 900, 3000, 5);
  });
}
// the empty throne: 520 x 640, origin bottom centre (260, 640)
function throneImg() {
  return cached('aThrone', 520, 640, 1, () => {
    cfill([[110, 470], [130, 80], [200, 40], [260, 20], [320, 40], [390, 80], [410, 470]], 0.78);
    ctx.save(); poly([[110, 470], [130, 80], [200, 40], [260, 20], [320, 40], [390, 80], [410, 470]]); ctx.clip(); hatch(100, 20, 420, 470, 12, 0.3); ctx.restore();
    charcoal(ap(260, 220, 90, PI, TAU, 30), 1, 8, CHALKc, 0.55, 2);
    cfill([[50, 430], [470, 430], [490, 500], [30, 500]], 0.92);
    charcoal(lp(40, 432, 480, 432, 20), 1, 6, CHALKc, 0.7, 3);
    for (const x of [60, 150, 370, 460]) cfill([[x - 14, 500], [x + 14, 500], [x + 10, 640], [x - 10, 640]], 0.9);
    cfill([[20, 470], [70, 470], [70, 380], [20, 380]], 0.85); cfill([[450, 470], [500, 470], [500, 380], [450, 380]], 0.85);
    charcoal(lp(60, 466, 460, 466, 20), 1, 8, REDc, 0.7, 4);
    tooth(520, 640, 2500, 6);
  });
}
// Parakramabahu I seated, teal pastel: 640 x 820, origin bottom centre (320, 820)
function kingImg() {
  return cached('aKing', 640, 820, 1, () => {
    cfill([[150, 640], [160, 150], [230, 90], [320, 60], [410, 90], [480, 150], [490, 640]], 0.45);
    ctx.save(); poly([[150, 640], [160, 150], [230, 90], [320, 60], [410, 90], [480, 150], [490, 640]]); ctx.clip(); hatch(140, 60, 500, 640, 14, 0.3, TEALc, 3, 0.7); ctx.restore();
    charcoal([[160, 150], [230, 90], [320, 60], [410, 90], [480, 150]], 1, 7, TEALc, 0.9, 2);
    // figure
    cfill([[250, 330], [390, 330], [420, 600], [220, 600]], 0.9);
    cfill([[292, 280], [348, 280], [350, 340], [290, 340]], 0.9);
    ctx.fillStyle = 'rgba(28,26,24,0.93)'; ctx.beginPath(); ctx.ellipse(320, 236, 50, 62, 0, 0, TAU); ctx.fill();
    cfill([[272, 202], [270, 120], [292, 150], [306, 92], [320, 136], [334, 92], [348, 150], [370, 120], [368, 202]], 0.96);
    charcoal(lp(270, 198, 370, 198, 10), 1, 6, CHALKc, 0.7, 3);
    // arms on knees, lap, shins
    charcoal(lp(258, 350, 214, 520, 10), 1, 34, CHc, 0.92, 4); charcoal(lp(382, 350, 426, 520, 10), 1, 34, CHc, 0.92, 5);
    cfill([[180, 560], [460, 560], [470, 640], [170, 640]], 0.92);
    cfill([[190, 640], [270, 640], [262, 800], [198, 800]], 0.9); cfill([[370, 640], [450, 640], [442, 800], [378, 800]], 0.9);
    cfill([[170, 796], [290, 796], [290, 820], [170, 820]], 0.9); cfill([[350, 796], [470, 796], [470, 820], [350, 820]], 0.9);
    // teal pastel: sash, robe edge, cushion
    charcoal(lp(262, 340, 404, 590, 16), 1, 26, TEALc, 0.95, 6);
    charcoal(lp(176, 600, 464, 600, 20), 1, 14, TEALc, 0.85, 7);
    charcoal(lp(120, 650, 520, 650, 20), 1, 22, TEALc, 0.7, 8);
    cfill([[110, 640], [530, 640], [540, 700], [100, 700]], 0.6);
    charcoal([[366, 210], [368, 250], [360, 290]], 1, 5, CHALKc, 0.5, 9);
    charcoal(lp(392, 340, 420, 596, 14), 1, 5, CHALKc, 0.5, 10);
    tooth(640, 820, 3500, 7);
  });
}
// Lankapura, general with spear + teal sash: 460 x 980, origin bottom centre (230, 980)
function genImg() {
  return cached('aGen', 460, 980, 1, () => {
    charcoal(lp(372, 980, 392, 40, 30), 1, 11, CHc, 0.95, 1);
    cfill([[392, 0], [412, 60], [394, 110], [376, 60]], 0.95); charcoal(lp(382, 30, 386, 100, 6), 1, 3, CHALKc, 0.6, 2);
    cfill([[150, 300], [310, 300], [340, 360], [320, 700], [140, 700], [120, 360]], 0.9);
    cfill([[140, 680], [325, 680], [345, 760], [120, 760]], 0.86);
    cfill([[150, 760], [212, 760], [206, 960], [156, 960]], 0.9); cfill([[248, 760], [310, 760], [304, 960], [254, 960]], 0.9);
    cfill([[136, 950], [216, 950], [220, 980], [132, 980]], 0.9); cfill([[244, 950], [324, 950], [328, 980], [240, 980]], 0.9);
    cfill([[204, 250], [256, 250], [258, 308], [202, 308]], 0.9);
    ctx.fillStyle = 'rgba(28,26,24,0.93)'; ctx.beginPath(); ctx.ellipse(230, 206, 48, 60, 0, 0, TAU); ctx.fill();
    cfill([[178, 196], [184, 150], [230, 126], [276, 150], [282, 196]], 0.97);
    charcoal(ap(230, 136, 40, PI * 1.1, PI * 1.9, 14), 1, 14, TEALc, 0.9, 3);
    // spear arm
    charcoal(lp(316, 330, 376, 470, 10), 1, 36, CHc, 0.92, 4);
    // shield on the other arm
    ctx.fillStyle = 'rgba(28,26,24,0.85)'; ctx.beginPath(); ctx.arc(118, 520, 92, 0, TAU); ctx.fill();
    charcoal(ap(118, 520, 86, 0, TAU, 40), 1, 6, CHALKc, 0.5, 5); ctx.fillStyle = 'rgba(242,239,232,0.7)'; ctx.beginPath(); ctx.arc(118, 520, 12, 0, TAU); ctx.fill();
    // teal sash
    charcoal(lp(160, 310, 318, 690, 20), 1, 34, TEALc, 0.95, 6); charcoal(lp(134, 700, 330, 700, 20), 1, 16, TEALc, 0.9, 7);
    ctx.save(); poly([[150, 300], [310, 300], [340, 360], [320, 700], [140, 700], [120, 360]]); ctx.clip(); hatch(100, 290, 350, 700, 13, 0.3, CHc, 2.5, 0.5); ctx.restore();
    charcoal(lp(336, 364, 318, 696, 14), 1, 5, CHALKc, 0.55, 8); charcoal([[274, 180], [278, 214], [270, 250]], 1, 5, CHALKc, 0.5, 9);
    tooth(460, 980, 3500, 8);
  });
}
// Palk Strait map: 1080 x 1200 (drawn at screen y 100), mainland top-left, Lanka lower right
const MAIN = [[-20, -20], [840, -20], [800, 110], [720, 250], [650, 370], [600, 460], [690, 505], [690, 535], [560, 545], [470, 625], [390, 760], [310, 900], [228, 1010], [150, 1085], [92, 1010], [40, 880], [-20, 800]];
const LANKA = Array.from({ length: 70 }, (_, i) => { const a = i / 70 * TAU, k = 1 + 0.07 * sin(3 * a + 1) + 0.05 * sin(7 * a + 2); const ry = 270 * (sin(a) > 0 ? 1 : 0.92), rx = 190 * (1 - 0.3 * Math.max(0, -sin(a))); return [745 + cos(a) * rx * k, 905 + sin(a) * ry * k]; });
const MADU = [370, 330];
const SEA_ROUTE = (() => { const pts = []; for (let i = 0; i <= 40; i++) { const f = i / 40; pts.push([lerp(690, 520, f) + sin(f * PI) * -70, lerp(720, 560, f) + sin(f * PI) * 30]); } return pts; })();
function mapImg() {
  return cached('aMap', 1080, 1200, 1, () => {
    // sea hatch everywhere, then land knocked back to paper and lightly chalked
    hatch(0, 0, 1080, 1200, 15, 0.2, CHc, 2, 0.8, 3);
    for (let y = 60; y < 1200; y += 90) for (let x = (y / 90 % 2) * 60; x < 1080; x += 130) charcoal([[x, y], [x + 18, y - 8], [x + 36, y]], 1, 3, CHc, 0.35, x + y);
    for (const pts of [MAIN, LANKA]) { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; poly(pts); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore(); }
    cfill(MAIN, 0.12, CHALKc); cfill(LANKA, 0.22, TEALc);
    ctx.save(); poly(MAIN); ctx.clip(); hatch(0, 0, 900, 1100, 40, 0.1, CHc, 2, -0.3, 5); ctx.restore();
    charcoal(MAIN.slice(1, -1), 1, 8, CHc, 0.9, 6); charcoal([...LANKA, LANKA[0]], 1, 8, CHc, 0.9, 7);
    charcoal([...LANKA, LANKA[0]], 1, 5, TEALc, 0.7, 8);
    // Adam's bridge shoals
    for (let i = 0; i < 7; i++) { ctx.fillStyle = 'rgba(28,26,24,0.6)'; ctx.beginPath(); ctx.ellipse(690 + i * 4, 555 + i * 14, 9, 5, 0.5, 0, TAU); ctx.fill(); }
    // hills on mainland
    for (const [x, y] of [[200, 200], [260, 520], [130, 700], [560, 140]]) charcoal([[x - 40, y], [x - 10, y - 30], [x + 20, y - 8], [x + 46, y - 34], [x + 80, y]], 1, 4, CHc, 0.5, x);
    tooth(1080, 1200, 6000, 9);
  });
}

// ───────────── the shots ─────────────
export function buildA(add, cue) {
  const T1 = Wd('to', 0), T2 = Wd('madurai', 0) + 0.5, T3 = Wd('sixty', 1) - 0.1, T4 = Wd('pandya', 1) - 0.05, T5 = Wd('for', 1),
    T6 = Wd('madurai', 1) + 0.3, T7 = Wd('parakrama', 2) - 0.07, T8 = Wd('begged', 2) - 0.05, T9 = Wd('accounts', 2) - 0.1,
    T10 = Wd('killed', 2) - 0.1, T11 = L(3) - 0.05, T12 = Wd('general', 3) - 0.1, T13 = Wd('across', 3) - 0.05;

  // a1 · HOOK: sheet slams onto the dark wall, fast push to the gate, red slash, crows burst, chalk dust
  cue(0, 'slam', { gain: 1 }); cue(0, 'whoosh', { gain: 0.8 }); cue(0.12, 'zip', { gain: 0.6 }); cue(0.3, 'whoosh', { gain: 0.35, pan: 0.4 });
  add({ id: 'a1', at: 0, cam: [540, 700], zoom: 0.05, note: 'HOOK sheet slam + push to charcoal gate, red slash, crows burst, chalk dust',
    draw(lt) {
      ctx.fillStyle = WALL; ctx.fillRect(-300, -300, W + 600, H + 600);
      const k = eo(clamp(lt / 0.9)), s = lerp(0.78, 1.12, k), rot = lerp(-0.05, 0, k);
      ctx.save(); ctx.translate(540, 760); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-540, -760);
      paper();
      blit(gateImg(), 500, 1300, 540, 1250, 0.86);
      // red pastel slash across the spike row
      const sp = eo(seg(lt, 0.04, 0.32));
      charcoal(lp(70, 470, 1010, 250, 40), sp, 30, REDc, 0.9, 21); charcoal(lp(140, 500, 960, 300, 40), seg(sp, 0.2, 1), 10, REDc, 0.7, 22);
      ctx.restore();
      ctx.save(); ctx.translate(540, 760); ctx.scale(s, s); ctx.translate(-540, -760);
      const src = SPK.map(([x, y]) => [540 + (x - 500) * 0.86, 1250 - (1300 - y) * 0.86]);
      crows(lt + 0.05, src, 9, 3);
      burst(lt, 540, 330, 90, 4, 700); burst(lt - 0.05, 300, 700, 30, 9, 400); burst(lt - 0.05, 800, 640, 30, 11, 400);
      ctx.restore();
      calm(1290);
    } });

  // a2 · empty spikes close-up: red pastel outlines, last crows lift off, red "?"
  cue(T1, 'whoosh', { gain: 0.5 }); cue(T1 + 0.1, 'zip', { gain: 0.45 }); cue(Wd('madurai', 0), 'pop', { gain: 0.6 });
  add({ id: 'a2', at: T1, cam: [540, 600], zoom: 0.1, note: 'spike row close-up, two empty spikes outlined red, crows lift, red ?',
    draw(lt) {
      paper();
      const sc = 2.3, ox = 500, oy = 330, X = (x) => 540 + (x - ox) * sc + lt * -30, Y = (y) => 640 + (y - oy) * sc;
      blit(gateImg(), ox, oy, 540 + lt * -30, 640, sc);
      for (const i of [3, 5]) { const [x, ty] = SPK[i];
        charcoal([[X(x), Y(ty - 10)], [X(x + 18), Y(ty + 36)], [X(x), Y(ty + 52)], [X(x - 18), Y(ty + 36)], [X(x), Y(ty - 10)]], eo(seg(lt, 0.05 + (i - 3) * 0.06, 0.45)), 9, REDc, 0.95, i);
        charcoal(lp(X(x + 8), Y(ty + 60), X(x + 8), Y(400), 14), eo(seg(lt, 0.2, 0.6)), 6, REDc, 0.8, i + 9); }
      crows(lt * 0.8 + 0.12, [[X(SPK[3][0]), Y(SPK[3][1])], [X(SPK[5][0]), Y(SPK[5][1])], [X(SPK[4][0]), Y(SPK[4][1])]], 4, 17, 0.8);
      qmark(X(SPK[4][0]), Y(60), 260, seg(lt, Wd('madurai', 0) - T1 - 0.1, Wd('madurai', 0) - T1 + 0.35));
      specks(lt, 25, 3, CHc, 0.5);
      calm(1260);
    } });

  // a3 · MADURAI skyline smudge reveal
  cue(T2, 'slide', { gain: 0.6 }); cue(T2 + 0.2, 'pop', { gain: 0.55 });
  add({ id: 'a3', at: T2, cam: [540, 700], zoom: 0.08, note: 'MADURAI skyline revealed by a charcoal thumb-smear, crows circle',
    draw(lt) {
      paper();
      const sw = eo(seg(lt, 0, 0.7));
      smudge(-80, 930, 1160, 900, 520, 0.5, sw);
      ctx.save(); ctx.beginPath(); ctx.rect(-100, 0, 80 + 1300 * sw, 1300); ctx.clip();
      blit(cityImg(), 540, 700, 540 - lt * 20, 1220, 1); ctx.restore();
      for (let i = 0; i < 4; i++) { const a = lt * 1.4 + i * 1.6; crow(540 + cos(a) * (220 + i * 40), 470 + sin(a) * 60 + i * 20, 0.9, lt * 16 + i, -sin(a) > 0 ? 1 : -1); }
      lab('MADURAI', 540, 270, 130, seg(lt, 0.15, 0.6), { ul: REDc });
      specks(lt, 20, 6, CHc, 0.45);
    } });

  // a4 · c. 1169 chalked on a smudge, the paper starts to tear down the middle
  cue(T3, 'whoosh', { gain: 0.45 }); cue(T3 + 0.05, 'chisel', { gain: 0.4 }); cue(Wd('two', 1), 'zip', { gain: 0.7 });
  add({ id: 'a4', at: T3, cam: [540, 760], zoom: 0.1, note: 'big chalk c. 1169 over a smudge band, torn seam rips open top to bottom',
    draw(lt) {
      paper();
      smudge(-60, 760, 1140, 740, 420, 0.75, eo(seg(lt, 0, 0.35)));
      smudge(1140, 600, -60, 640, 160, 0.4, eo(seg(lt, 0.1, 0.45)));
      lab('c. 1169', 540, 760, 230, seg(lt, 0.12, 0.6), { col: CHALK, ul: REDc, sp: 8 });
      lab('AROUND', 540, 520, 54, seg(lt, 0.05, 0.4), { col: 'rgba(28,26,24,0.85)' });
      const tp = eo(seg(lt, Wd('two', 1) - T3 - 0.15, Wd('two', 1) - T3 + 0.3));
      if (tp > 0) diptych(540, 7, null, null, tp);
      burst(lt - (Wd('two', 1) - T3), 540, 300, 40, 5, 380);
      specks(lt, 30, 8, CHALKc, 0.5);
    } });

  // a5 · PANDYA CIVIL WAR: two crowned faceless princes face off across the seam (ILLUSTRATION)
  cue(T4, 'thud', { gain: 0.8 }); cue(T4 + 0.25, 'pop', { gain: 0.5 });
  add({ id: 'a5', at: T4, cam: [540, 760], zoom: 0.08, note: 'diptych: two crowned faceless princes face off across torn seam, PANDYA CIVIL WAR',
    draw(lt, d) {
      paper();
      const sx = 540 + sin(lt * 7) * 18 * (1 - seg(lt, 0, d));
      diptych(sx, 7, 'rgba(242,239,232,0.10)', 'rgba(28,26,24,0.10)');
      const k = eob(seg(lt, 0, 0.45));
      blit(princeImg(), 210, 900, lerp(-120, 270, k), 1250, 0.92);
      ctx.save(); ctx.translate(lerp(1200, 810, k), 1250); ctx.scale(-1, 1); blit(princeImg(), 210, 900, 0, 0, 0.92); ctx.restore();
      burst(lt - 0.3, sx, 560, 50, 13, 480);
      lab('PANDYA CIVIL WAR', 540, 230, 76, seg(lt, 0.15, 0.6), { ul: REDc });
      tagIll();
      specks(lt, 20, 9, CHc, 0.4);
    } });

  // a6 · the throne of Madurai torn in two, princes lunge from both panels
  cue(T5, 'whoosh', { gain: 0.5 }); cue(Wd('throne', 1), 'slam', { gain: 0.8 }); cue(Wd('throne', 1) + 0.05, 'pop', { gain: 0.4 });
  add({ id: 'a6', at: T5, cam: [540, 820], zoom: 0.1, note: 'empty throne split by the seam, two princes lunge in, chalk burst, TWO PRINCES',
    draw(lt) {
      paper();
      const hit = Wd('throne', 1) - T5, gap = 40 * eob(seg(lt, hit, hit + 0.3));
      diptych(540, 11, 'rgba(28,26,24,0.06)', 'rgba(28,26,24,0.12)');
      for (const [side, dx] of [[-1, -gap], [1, gap]]) { ctx.save(); ctx.beginPath(); side < 0 ? ctx.rect(-300, 0, 840, 1300) : ctx.rect(540, 0, 900, 1300); ctx.clip();
        blit(throneImg(), 260, 640, 540 + dx, 1200, 1.05); ctx.restore(); }
      const k = eo(seg(lt, 0, 0.5));
      blit(princeImg(), 210, 900, lerp(-60, 150, k), 1250, 0.7);
      ctx.save(); ctx.translate(lerp(1140, 930, k), 1250); ctx.scale(-1, 1); blit(princeImg(), 210, 900, 0, 0, 0.7); ctx.restore();
      diptych(540, 11, null, null, 1);
      burst(lt - hit, 540, 760, 80, 21, 640);
      lab('TWO PRINCES', 540, 230, 80, seg(lt, 0.05, 0.5));
      tagIll();
    } });

  // a7 · "one of them": chalk ring circles the left prince, the right panel smudges dark
  cue(T6, 'slide', { gain: 0.5 }); cue(L(2) + 0.05, 'zip', { gain: 0.5 });
  add({ id: 'a7', at: T6, cam: [330, 760], zoom: 0.12, note: 'diptych again: chalk ring draws round the left prince, right panel smudged away',
    draw(lt) {
      paper();
      const sx = 540 + 80 * eio(seg(lt, 0.2, 1.2));
      diptych(sx, 7, 'rgba(242,239,232,0.12)', 'rgba(28,26,24,0.12)');
      blit(princeImg(), 210, 900, 290, 1250, 0.92);
      ctx.save(); ctx.translate(840, 1250); ctx.scale(-1, 1); blit(princeImg(), 210, 900, 0, 0, 0.92); ctx.restore();
      ctx.save(); seamPath(sx, 7, true); ctx.clip();
      smudge(1200, 300, 500, 1100, 380, 0.85, eo(seg(lt, 0.1, 0.9))); smudge(1200, 1150, 520, 380, 300, 0.7, eo(seg(lt, 0.4, 1.2))); ctx.restore();
      diptych(sx, 7, null, null, 1);
      const r0 = L(2) - T6;
      charcoal(ap(300, 760, 260, -PI * 0.6, PI * 1.5, 60, 520), eo(seg(lt, r0, r0 + 0.5)), 12, CHALKc, 0.95, 31);
      lab('ONE OF THEM', 300, 175, 60, seg(lt, r0 + 0.1, r0 + 0.5), { col: CH });
      tagIll();
    } });

  // a8 · PARAKRAMA PANDYA close: hatching draws on behind him
  cue(T7, 'whoosh', { gain: 0.5 }); cue(T7 + 0.15, 'pop', { gain: 0.6 });
  add({ id: 'a8', at: T7, cam: [500, 700], zoom: 0.1, note: 'PARAKRAMA PANDYA close-up, radial charcoal hatching draws on behind',
    draw(lt) {
      paper();
      for (let i = 0; i < 26; i++) { const a = -PI + i / 25 * PI, p = eo(seg(lt, i * 0.02, 0.4 + i * 0.02));
        charcoal(lp(500 + cos(a) * 260, 760 + sin(a) * 300, 500 + cos(a) * 640, 760 + sin(a) * 700, 10), p, 7, CHc, 0.5, i + 40); }
      smudge(150, 1230, 950, 1240, 140, 0.6, eo(seg(lt, 0, 0.5)));
      blit(princeImg(), 210, 900, 470 + lt * 14, 1250, 1.12);
      lab('PARAKRAMA PANDYA', 540, 200, 72, seg(lt, 0.1, 0.55), { ul: CHALKc, back: 'rgba(207,202,192,0.85)' });
      burst(lt, 500, 500, 40, 33, 520);
      specks(lt, 24, 12, CHALKc, 0.55);
    } });

  // a9 · HELP! dotted toward LANKA on the strait map
  cue(T8, 'whoosh', { gain: 0.55 }); cue(Wd('lanka', 2), 'zip', { gain: 0.5 }); cue(Wd('help', 2), 'pop', { gain: 0.7 }); cue(Wd('lanka', 2) + 0.2, 'pop', { gain: 0.45 });
  add({ id: 'a9', at: T8, cam: [560, 640], zoom: 0.1, note: 'strait map: dotted plea from Madurai dives to teal LANKA, HELP!',
    draw(lt) {
      paper(); blit(mapImg(), 0, 0, 0, 100, 1);
      const MX = MADU[0], MY = MADU[1] + 100;
      ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(MX, MY, 14 + sin(lt * 8) * 2, 0, TAU); ctx.fill();
      charcoal(ap(MX, MY, 30 + lt * 14, 0, TAU, 24), 1, 4, REDc, clamp(1 - lt * 0.5), 3);
      lab('MADURAI', MX, MY - 60, 44, seg(lt, 0, 0.3));
      const p = eio(seg(lt, Wd('lanka', 2) - T8 - 0.2, Wd('help', 2) - T8 + 0.2)), path = [];
      for (let i = 0; i <= 30; i++) { const f = i / 30; path.push([lerp(MX, 700, f) + sin(f * PI) * 120, lerp(MY, 880, f)]); }
      ctx.save(); ctx.setLineDash([4, 26]); charcoal(path, p, 10, CHc, 0.95, 5); ctx.restore();
      if (p > 0.98) { const [x, y] = path[30]; charcoal([[x - 30, y - 40], [x, y], [x + 34, y - 34]], 1, 9, CHc, 0.95, 6); }
      lab('HELP!', 680, 470, 110, seg(lt, Wd('help', 2) - T8 - 0.05, Wd('help', 2) - T8 + 0.3), { ul: TEALc, back: 'rgba(207,202,192,0.8)' });
      lab('LANKA', 760, 1000, 70, seg(lt, Wd('lanka', 2) - T8, Wd('lanka', 2) - T8 + 0.35), { col: CH, ul: TEALc });
      specks(lt, 18, 14, CHc, 0.4);
    } });

  // a10 · ACCOUNTS SAY: he stands alone, a far teal sail on the horizon, darkness smudges in
  cue(T9, 'rumble', { gain: 0.5 }); cue(T9 + 0.1, 'pop', { gain: 0.55 });
  add({ id: 'a10', at: T9, cam: [540, 760], zoom: 0.07, note: 'ACCOUNTS SAY tag, prince alone on shore, tiny teal help-sail far off, smudge creeping in',
    draw(lt) {
      paper();
      charcoal(lp(-40, 1180, 1120, 1170, 40), 1, 6, CHc, 0.7, 51);
      for (let i = 0; i < 5; i++) charcoal([[600 + i * 90, 1210 + i * 8], [640 + i * 90, 1200 + i * 8], [680 + i * 90, 1212 + i * 8]], 1, 3, CHc, 0.4, 60 + i);
      const sx = 980 - lt * 30; charcoal(lp(sx, 1100, sx, 1172, 6), 1, 4, CHc, 0.9, 61); fillP([[sx + 3, 1104], [sx + 3, 1160], [sx + 44, 1160]], TEAL);
      blit(princeImg(), 210, 900, 380, 1185, 0.95);
      smudge(1200, 200, 700, 700, 560, 0.75, eo(seg(lt, 0, 1.1)));
      lab('ACCOUNTS SAY', 380, 190, 64, seg(lt, 0, 0.35), { col: CH, back: 'rgba(242,239,232,0.9)', ul: REDc });
      specks(lt, 30, 15, CHc, 0.5);
    } });

  // a11 · KILLED?: a putty eraser wipes him away, his crown drops, ACCOUNTS SAY stays up
  cue(T10, 'slide', { gain: 0.7 }); cue(T10 + 0.45, 'slide', { gain: 0.5 }); cue(Wd('killed', 2) + 0.1, 'drum', { gain: 0.7 }); cue(T10 + 1.05, 'thud', { gain: 0.6 });
  add({ id: 'a11', at: T10, cam: [540, 720], zoom: 0.08, note: 'putty eraser wipes the prince away, crown drops, red KILLED?, ACCOUNTS SAY kept',
    draw(lt) {
      paper();
      charcoal(lp(-40, 1180, 1120, 1170, 40), 1, 6, CHc, 0.7, 51);
      blit(princeImg(), 210, 900, 540, 1185, 0.95);
      // eraser: zigzag bands from the crown down, clip and redraw clean paper
      const ep = seg(lt, 0.05, 1.15), nb = 10, bandH = 100, top = 260, P = paperImg();
      let hx = 0, hy = 0;
      ctx.save(); ctx.beginPath();
      for (let b = 0; b < nb; b++) { const f = clamp(ep * nb - b); if (f <= 0) break; const y = top + b * 92, l2r = b % 2 === 0, w = 520 * f, x0 = l2r ? 290 : 810 - w;
        ctx.roundRect(x0, y, w, bandH, 50); hx = l2r ? x0 + w : x0; hy = y + bandH / 2; }
      ctx.clip(); ctx.drawImage(P, 0, 0); ctx.fillStyle = 'rgba(214,209,199,0.55)'; ctx.fillRect(0, 0, W, 1300); ctx.restore();
      if (ep > 0 && ep < 1) { ctx.fillStyle = 'rgba(206,200,190,0.97)'; ctx.beginPath(); ctx.ellipse(hx, hy, 62, 48, 0.3, 0, TAU); ctx.fill();
        charcoal(ap(hx, hy, 60, 0, TAU, 20, 46), 1, 4, CHc, 0.35, 7); }
      for (let i = 0; i < 26; i++) { const by = top + (i % nb) * 92 + 50, bx = 300 + rnd(i * 3) * 500; if (by > hy + 10 && ep < 1) continue;
        ctx.fillStyle = 'rgba(90,86,80,0.7)'; ctx.beginPath(); ctx.ellipse(bx, by, 7, 3, rnd(i), 0, TAU); ctx.fill(); }
      // falling crown
      const cf = seg(lt, 0.15, 1.0), cy = lerp(370, 1150, cf * cf), crot = cf * 2.2 + (cf >= 1 ? sin(lt * 9) * 0.05 * Math.exp(-(lt - 1) * 4) : 0);
      ctx.save(); ctx.translate(545 + cf * 60, cy); ctx.rotate(crot); ctx.scale(0.95, 0.95);
      fillP([[-52, 40], [-54, -44], [-32, -10], [-16, -80], [0, -26], [16, -80], [32, -10], [54, -44], [52, 40]], CH);
      charcoal(lp(-54, 34, 54, 34, 8), 1, 6, CHALKc, 0.7, 2); ctx.restore();
      if (cf >= 1) burst(lt - 1.0, 600, 1160, 40, 41, 300);
      const kp = seg(lt, Wd('killed', 2) - T10 - 0.05, Wd('killed', 2) - T10 + 0.35);
      lab('KILLED?', 540, 560, 150, kp, { col: RED, ul: REDc, back: 'rgba(214,209,199,0.0)' });
      lab('ACCOUNTS SAY', 380, 190, 64, 1, { col: CH, back: 'rgba(242,239,232,0.9)', ul: REDc });
      specks(lt, 24, 16, CHc, 0.45);
    } });

  // a12 · PARAKRAMABAHU I seated on the teal (Lanka) panel; seam slides in from the right
  cue(T11, 'swell', { gain: 0.6 }); cue(T11 + 0.05, 'whoosh', { gain: 0.5 }); cue(Wd('parakramabahu', 3), 'pop', { gain: 0.6 }); cue(Wd('sent', 3), 'tock', { gain: 0.5 });
  add({ id: 'a12', at: T11, cam: [470, 760], zoom: 0.1, note: 'teal LANKA panel: PARAKRAMABAHU I seated crowned silhouette, seam slides in',
    draw(lt) {
      paper();
      const sx = lerp(1220, 860, eo(seg(lt, 0, 0.6)));
      diptych(sx, 23, 'rgba(62,140,138,0.16)', 'rgba(28,26,24,0.18)');
      smudge(-40, 1150, sx - 60, 1150, 200, 0.55, eo(seg(lt, 0, 0.6)), TEALc);
      blit(kingImg(), 320, 820, 440, 1230, 1.08 + lt * 0.015);
      for (let i = 0; i < 18; i++) { const a = -PI * 0.95 + i / 17 * PI * 0.9; charcoal(lp(440 + cos(a) * 480, 680 + sin(a) * 480, 440 + cos(a) * 560, 680 + sin(a) * 560, 6), eo(seg(lt, 0.3 + i * 0.03, 0.7 + i * 0.03)), 8, TEALc, 0.7, i + 70); }
      lab('LANKA', 440, 140, 46, seg(lt, 0.1, 0.4), { col: 'rgba(28,26,24,0.85)', ul: TEALc });
      lab('PARAKRAMABAHU I', 440, 245, 76, seg(lt, Wd('parakramabahu', 3) - T11 - 0.1, Wd('parakramabahu', 3) - T11 + 0.4), { ul: TEALc, back: 'rgba(207,202,192,0.8)' });
      specks(lt, 24, 18, TEALc, 0.5);
    } });

  // a13 · LANKAPURA: the general, spear drawn on, teal sails massing on the horizon
  cue(T12, 'whoosh', { gain: 0.55 }); cue(Wd('lankapura', 3), 'pop', { gain: 0.65 }); cue(Wd('lankapura', 3) + 0.05, 'tock', { gain: 0.4 });
  add({ id: 'a13', at: T12, cam: [540, 700], zoom: 0.12, note: 'LANKAPURA general with spear + teal sash, teal sails massing on horizon',
    draw(lt) {
      paper();
      smudge(-60, 820, 1140, 800, 700, 0.35, eo(seg(lt, 0, 0.5)), TEALc);
      charcoal(lp(-40, 1120, 1120, 1110, 40), 1, 5, CHc, 0.7, 81);
      for (let i = 0; i < 9; i++) { const x = 60 + i * 120 + ((lt * 30) % 120), y = 1100 - (i % 2) * 22, s = 0.7 + rnd(i) * 0.5; charcoal(lp(x, y - 70 * s, x, y + 8, 4), 1, 3, CHc, 0.8, 90 + i); fillP([[x + 2, y - 66 * s], [x + 2, y - 8], [x + 42 * s, y - 8]], TEAL); }
      const k = eo(seg(lt, 0, 0.5));
      blit(genImg(), 230, 980, 540, lerp(1330, 1250, k), 1.08);
      burst(lt - (Wd('lankapura', 3) - T12), 540, 340, 50, 51, 460, TEALc);
      lab('LANKAPURA', 540, 200, 96, seg(lt, Wd('lankapura', 3) - T12 - 0.1, Wd('lankapura', 3) - T12 + 0.35), { ul: TEALc, back: 'rgba(207,202,192,0.8)' });
      lab('GENERAL', 540, 300, 44, seg(lt, 0.05, 0.4), { col: 'rgba(28,26,24,0.85)' });
      calm(1270);
    } });

  // a14 · Palk Strait map: teal sails cross the dotted route toward the mainland
  cue(T13, 'whoosh', { gain: 0.5 }); cue(T13 + 0.15, 'swell', { gain: 0.5 }); cue(Wd('sea', 3), 'pop', { gain: 0.5 });
  add({ id: 'a14', at: T13, cam: [600, 700], zoom: 0.12, note: 'charcoal Palk Strait map, teal sails cross the dotted route, PALK STRAIT, MADURAI dot',
    draw(lt, d) {
      paper(); blit(mapImg(), 0, 0, 0, 100, 1);
      const R = SEA_ROUTE.map(([x, y]) => [x, y + 100]), rp = eio(seg(lt, 0, d * 0.8));
      ctx.save(); ctx.setLineDash([6, 22]); charcoal(R, rp, 9, CHc, 0.95, 5); ctx.restore();
      const MX = MADU[0], MY = MADU[1] + 100;
      ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(MX, MY, 14, 0, TAU); ctx.fill();
      lab('MADURAI', MX, MY - 56, 44, 1);
      for (let i = 0; i < 4; i++) { const f = clamp(rp - i * 0.09); if (f <= 0) continue; const idx = Math.min(R.length - 1, Math.floor(f * (R.length - 1))), [x, y] = R[idx], s = 1.0 - i * 0.1, bob = sin(lt * 6 + i) * 4;
        ctx.save(); ctx.translate(x + 20 + i * 18, y + bob - i * 10); ctx.scale(s, s);
        fillP([[-34, 0], [34, 0], [24, 16], [-24, 16]], CH); charcoal(lp(0, 0, 0, -78, 4), 1, 4, CHc, 0.95, i); fillP([[3, -74], [3, -6], [50, -6]], TEAL); fillP([[-3, -64], [-3, -6], [-34, -6]], 'rgba(62,140,138,0.75)');
        ctx.restore(); }
      lab('PALK STRAIT', 860, 470, 56, seg(lt, 0.15, 0.5), { ul: TEALc, back: 'rgba(207,202,192,0.8)' });
      lab('LANKA', 770, 1000, 60, 1, { ul: TEALc });
      specks(lt, 18, 19, CHc, 0.4);
    } });
}
