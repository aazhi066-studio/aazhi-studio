// EPISODE 16 · worker A : "Soot-Etched Palm Leaves", lines 0-3 (t 0 -> L(4)). THE HOOK.
// Burning leaf with a crowned faceless king · curse verses glowing red · leaf flip + LEGEND · leaf fan · stylus etch + soot rub of
// the seated king · NANDIVARMAN III · c. 800s CE numerals · four half brothers · two etched armies · banner falls · the lone poet.
// Engine: leaves, inked figures, tags and the desk are baked once by cached(); per frame only blits, a few progressive strokes,
// a soot band, flames and embers. No shadowBlur outside cached().
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, smoke } from './art.js';
import * as K from './core/kit.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const INK = '#0D0603', SCR = '#2A1606', ASH = '#F1E6CC', SIN = '#C0331F', TUR = '#E0A526', IND = '#2D3A6B', DESK = '#120A05';

// ───────────── shared palm leaf (copied exactly from ART.md) ─────────────
function palmLeaf(x, y, w, h, rot = 0, tone = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, tone ? '#C89A52' : '#E6C27C'); g.addColorStop(0.5, tone ? '#B88A45' : '#D9B36C'); g.addColorStop(1, '#A8782F');
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w / 2 + h * 0.4, -h / 2, -w / 2 + h, -h / 2); ctx.lineTo(w / 2 - h, -h / 2); ctx.quadraticCurveTo(w / 2 - h * 0.4, -h / 2, w / 2, 0);
  ctx.quadraticCurveTo(w / 2 - h * 0.4, h / 2, w / 2 - h, h / 2); ctx.lineTo(-w / 2 + h, h / 2); ctx.quadraticCurveTo(-w / 2 + h * 0.4, h / 2, -w / 2, 0); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,30,0.35)'; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++) { const yy = -h / 2 + (h * i) / 6; ctx.beginPath(); ctx.moveTo(-w / 2 + h, yy); ctx.lineTo(w / 2 - h, yy); ctx.stroke(); }
  ctx.fillStyle = '#120A05'; for (const hx of [-w * 0.3, w * 0.3]) { ctx.beginPath(); ctx.arc(hx, 0, h * 0.09, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
/** the same outline as palmLeaf, path only (centred at 0,0) */
function leafPath(w, h) {
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w / 2 + h * 0.4, -h / 2, -w / 2 + h, -h / 2); ctx.lineTo(w / 2 - h, -h / 2); ctx.quadraticCurveTo(w / 2 - h * 0.4, -h / 2, w / 2, 0);
  ctx.quadraticCurveTo(w / 2 - h * 0.4, h / 2, w / 2 - h, h / 2); ctx.lineTo(-w / 2 + h, h / 2); ctx.quadraticCurveTo(-w / 2 + h * 0.4, h / 2, -w / 2, 0); ctx.closePath();
}

// ───────────── stroke data (figures as polylines so a stylus can draw them) ─────────────
const circ = (cx, cy, rx, ry = rx, n = 30) => { const p = []; for (let i = 0; i <= n; i++) { const a = (i / n) * TAU - PI / 2; p.push([cx + cos(a) * rx, cy + sin(a) * ry]); } return p; };
const tr = (S, dx, dy, s = 1, fx = 1) => S.map((p) => p.map(([x, y]) => [dx + x * s * fx, dy + y * s]));
function prep(S) {
  const R = S.map((p) => { let l = 0; const Ls = [0]; for (let i = 1; i < p.length; i++) { l += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); Ls.push(l); } return { p, L: Ls, l }; });
  R.tot = R.reduce((a, b) => a + b.l, 0); return R;
}
/** draw the first pr (0..1) of the strokes; returns the stylus tip */
function etch(S, pr, col, w) {
  let rem = clamp(pr) * S.tot, tip = null;
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  for (const s of S) {
    if (rem <= 0) break; const p = s.p; ctx.moveTo(p[0][0], p[0][1]); let i = 1;
    for (; i < p.length; i++) {
      if (s.L[i] <= rem) ctx.lineTo(p[i][0], p[i][1]);
      else { const k = (rem - s.L[i - 1]) / (s.L[i] - s.L[i - 1] || 1), x = lerp(p[i - 1][0], p[i][0], k), y = lerp(p[i - 1][1], p[i][1], k); ctx.lineTo(x, y); tip = [x, y]; break; }
    }
    if (i === p.length) tip = p[p.length - 1]; rem -= s.l;
  }
  ctx.stroke(); return tip;
}
/** fully inked (soot-filled) strokes with a faint lamp-black smudge around them */
function inkAll(S, w = 5, col = INK) { if (S.tot == null) S = prep(S); etch(S, 1, 'rgba(20,10,4,0.13)', w * 3.2); etch(S, 1, col, w); }

// seated faceless king with a tall crown on a low throne; base centre (0,0), ~300 tall
const KING = [
  [[-92, -40], [-92, -170], [-60, -196], [60, -196], [92, -170], [92, -40]], // throne back
  circ(0, -150, 22, 28),
  [[-24, -174], [-21, -214], [-13, -248], [0, -282], [13, -248], [21, -214], [24, -174], [-24, -174]], // crown
  [[-21, -214], [21, -214]], [[-13, -248], [13, -248]],
  [[-16, -122], [-50, -110], [-46, -40], [46, -40], [50, -110], [16, -122]], // torso
  [[-50, -106], [-74, -70], [-62, -42], [-30, -42]], [[50, -106], [76, -78], [86, -100]], // arms (right raised, listening)
  [[-46, -40], [-96, -12], [-24, 0], [24, 0], [96, -12], [46, -40]], // crossed legs
  [[-132, 0], [132, 0], [132, 28], [-132, 28], [-132, 0]], [[-118, 28], [-118, 58]], [[118, 28], [118, 58]], // low throne
];
// standing half-brother; base (0,0), ~140 tall
const BRO = [circ(0, -122, 14, 17, 22), [[-6, -104], [-28, -36], [28, -36], [6, -104]], [[-12, -36], [-16, 0]], [[12, -36], [16, 0]], [[-6, -96], [-30, -66]], [[6, -96], [30, -72]]];
// brother holding a stylus and a leaf
const POET = [circ(0, -122, 14, 17, 22), [[-6, -104], [-28, -36], [28, -36], [6, -104]], [[-12, -36], [-16, 0]], [[12, -36], [16, 0]], [[-6, -96], [-18, -70], [20, -66]], [[6, -96], [26, -78], [34, -96]], [[34, -96], [44, -116]], [[14, -70], [90, -76], [90, -62], [14, -58], [14, -70]]];
// crowned faceless head + shoulders (bust), base (0,0)
const BUST = [circ(0, -150, 62, 78, 40), [[-66, -214], [-58, -300], [-36, -380], [0, -450], [36, -380], [58, -300], [66, -214], [-66, -214]], [[-58, -300], [58, -300]], [[-36, -380], [36, -380]],
  [[-190, 40], [-150, -40], [-60, -70], [0, -72], [60, -70], [150, -40], [190, 40]]];
const THRONE = [[[-60, 0], [-60, -90], [-40, -110], [40, -110], [60, -90], [60, 0]], [[-80, 0], [80, 0], [80, 18], [-80, 18], [-80, 0]], [[-70, 18], [-70, 44]], [[70, 18], [70, 44]],
  [[-22, -130], [-18, -160], [0, -186], [18, -160], [22, -130], [-22, -130]]];
const BANNER = [[[0, 0], [0, -300]], [[0, -296], [130, -262], [40, -240], [130, -210], [0, -200]], circ(0, -306, 8, 8, 12)];
const SOLDIER = [circ(0, -48, 7, 8, 14), [[0, -40], [0, -18]], [[0, -18], [-9, 0]], [[0, -18], [9, 0]], [[0, -34], [14, -30]], [[-6, -8], [26, -66]], [[-6, -36], [-12, -22], [-6, -10]]];

/** abstract cursive verse rows (unreadable on purpose) inside a box, skipping the string holes */
function verse(x0, x1, y0, y1, rows, seed, holes = []) {
  const S = [];
  for (let r = 0; r < rows; r++) {
    const y = lerp(y0, y1, rows === 1 ? 0.5 : r / (rows - 1)); let x = x0 + rnd(seed + r) * 30;
    while (x < x1 - 40) {
      const len = 50 + rnd(seed * 3 + r * 17 + x) * 110, p = [];
      for (let u = 0; u <= len; u += 3) { const px = x + u + 7 * sin(u * 0.24), py = y - 8 * cos(u * 0.24) * (0.6 + 0.4 * sin(u * 0.05 + seed + r)); if (holes.some((hx) => Math.abs(px - hx) < 34)) break; p.push([px, py]); }
      if (p.length > 3) S.push(p);
      if (rnd(seed + x * 0.7) > 0.6) S.push(circ(x + len + 14, y - 14, 3, 3, 8));
      x += len + 30 + rnd(seed + x) * 20;
    }
  }
  return S;
}

// ───────────── cached art ─────────────
const PAD = 40;
/** a palm leaf baked with content fn (drawn in leaf-local coords, clipped to the leaf) */
function leafImg(key, w, h, tone = 0, fn = null) {
  return cached('a' + key, w + PAD * 2, h + PAD * 2, 1, () => {
    ctx.save(); ctx.translate(PAD + w / 2, PAD + h / 2); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 12; leafPath(w, h); ctx.fillStyle = '#5A3A18'; ctx.fill(); ctx.restore();
    palmLeaf(PAD + w / 2, PAD + h / 2, w, h, 0, tone);
    ctx.save(); ctx.translate(PAD + w / 2, PAD + h / 2); leafPath(w, h); ctx.clip();
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(110,70,25,${0.05 + rnd(i + w) * 0.08})`; ctx.beginPath(); ctx.ellipse((rnd(i * 3 + h) - 0.5) * w, (rnd(i * 7) - 0.5) * h, 20 + rnd(i) * 60, 4 + rnd(i * 2) * 8, 0, 0, TAU); ctx.fill(); }
    if (fn) fn();
    ctx.restore();
  });
}
const putLeaf = (img, w, h, a = 1) => blit(img, w / 2 + PAD, h / 2 + PAD, 0, 0, 1, a);
/** inked strokes alone, baked in a w x h box centred at 0,0 */
const inkImg = (key, w, h, S, lw = 5, col = INK) => cached('a' + key, w, h, 1, () => { ctx.translate(w / 2, h / 2); inkAll(S, lw, col); });
const putBox = (img, w, h, a = 1) => blit(img, w / 2, h / 2, 0, 0, 1, a);

const DESKI = () => cached('adesk', W + 400, H + 400, 0.5, () => {
  ctx.fillStyle = DESK; ctx.fillRect(0, 0, W + 400, H + 400);
  for (let i = 0; i < 140; i++) {
    const y = rnd(i * 3.1) * (H + 400), a = 0.04 + rnd(i * 5) * 0.08; ctx.strokeStyle = rnd(i) > 0.5 ? `rgba(70,38,16,${a})` : `rgba(0,0,0,${a * 1.6})`; ctx.lineWidth = 2 + rnd(i * 2) * 6;
    ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= W + 400; x += 60) ctx.lineTo(x, y + sin(x * 0.004 + i) * 18 + sin(x * 0.013 + i * 2) * 5); ctx.stroke();
  }
});
/** dark teak desk + lamp light pool (y 1330-1760 stays dark) */
function desk(t, lx = 540, ly = 700, a = 0.22) {
  blit(DESKI(), 0, 0, -200, -200, 1);
  K.glow(lx, ly, 900, '255,150,60', a * (0.93 + 0.07 * sin(t * 9) * sin(t * 5.3)));
}
/** darken the caption band so nothing bright sits behind captions */
function capCalm() { const g = ctx.createLinearGradient(0, 1240, 0, 1360); g.addColorStop(0, 'rgba(18,10,5,0)'); g.addColorStop(1, 'rgba(18,10,5,0.85)'); ctx.fillStyle = g; ctx.fillRect(-300, 1240, W + 600, 120); ctx.fillStyle = 'rgba(18,10,5,0.85)'; ctx.fillRect(-300, 1360, W + 600, 900); }

// tags: etched Caladea caps on a small leaf tag (red / indigo) or a thin dark bar
function tagImg(text, kind = 'red', size = 46) {
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = '6px'; const tw = ctx.measureText(text).width; ctx.letterSpacing = '0px';
  const w = Math.ceil(tw + size * 1.6), h = Math.ceil(size * 1.7);
  return cached(`atag_${text}_${kind}_${size}`, w + 20, h + 20, 1, () => {
    ctx.translate(10, 10);
    if (kind === 'bar') { ctx.fillStyle = 'rgba(10,5,2,0.92)'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = 'rgba(224,165,38,0.7)'; ctx.lineWidth = 2; ctx.strokeRect(5, 5, w - 10, h - 10); }
    else {
      const c = kind === 'red' ? SIN : IND; ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.quadraticCurveTo(0, 0, h * 0.5, 0); ctx.lineTo(w - h * 0.5, 0); ctx.quadraticCurveTo(w, 0, w, h / 2); ctx.quadraticCurveTo(w, h, w - h * 0.5, h); ctx.lineTo(h * 0.5, h); ctx.quadraticCurveTo(0, h, 0, h / 2); ctx.closePath();
      ctx.fillStyle = c; ctx.fill(); ctx.strokeStyle = 'rgba(241,230,204,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(rnd(i + w) * w, rnd(i * 3) * h, 2 + rnd(i) * 5, 0, TAU); ctx.fill(); }
    }
    ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = '6px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ASH; ctx.fillText(text, w / 2 + 3, h / 2 + size * 0.04); ctx.letterSpacing = '0px';
  });
}
/** stamp a tag on at local time t0: drops from big to size with a bounce, dust ring */
function stamp(text, kind, x, y, lt, t0, rot = 0, size = 46) {
  if (lt < t0) return; const img = tagImg(text, kind, size), k = seg(lt, t0, t0 + 0.2), s = lerp(1.9, 1, eo(k)) * (1 + 0.04 * sin(clamp((lt - t0 - 0.2) / 0.25) * PI));
  const w = img.width, h = img.height;
  if (k >= 1 && lt - t0 < 0.6) { const r = seg(lt, t0 + 0.2, t0 + 0.6); ctx.strokeStyle = `rgba(241,230,204,${0.35 * (1 - r)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, w * (0.5 + r * 0.25), h * (0.5 + r * 0.6), rot, 0, TAU); ctx.stroke(); }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot * (1 + (1 - eo(k)) * 2)); blit(img, w / 2, h / 2, 0, 0, s, clamp(k * 4)); ctx.restore();
}
/** text that is etched (thin scratch outline) then soot-filled, both baked */
const textImg = (key, text, size, mode) => {
  ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = '8px'; const tw = Math.ceil(ctx.measureText(text).width + 40); ctx.letterSpacing = '0px';
  return cached(`atx_${key}_${mode}`, tw, size * 1.5, 1, () => {
    ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = '8px'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    if (mode === 'etch') { ctx.strokeStyle = SCR; ctx.lineWidth = 2.5; ctx.strokeText(text, 20, size * 0.78); }
    else { ctx.fillStyle = 'rgba(20,10,4,0.16)'; ctx.fillText(text, 23, size * 0.78 + 4); ctx.fillStyle = INK; ctx.fillText(text, 20, size * 0.78); }
    ctx.letterSpacing = '0px';
  });
};

// ───────────── per-frame helpers ─────────────
const fillAll = (c, a = 1) => { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(-400, -400, W + 800, H + 800); ctx.restore(); };
const flash = (lt, at = 0, a = 0.75, col = SIN, len = 0.16) => { const k = (lt - at) / len; if (k >= 0 && k < 1) fillAll(col, a * (1 - k)); };
const hb = (t) => { const p = ((t % 0.86) + 0.86) % 0.86; return Math.exp(-((p / 0.07) ** 2)) + 0.65 * Math.exp(-(((p - 0.24) / 0.07) ** 2)); };
/** iron stylus with its tip at (x,y) */
function stylus(x, y, lean = 0.45, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(lean);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.moveTo(14, 6); ctx.lineTo(60, 10); ctx.lineTo(300, -10); ctx.lineTo(300, 6); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, '#2C2622'); g.addColorStop(0.45, '#8C8278'); g.addColorStop(1, '#1C1714'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-6, -40); ctx.lineTo(-9, -360); ctx.lineTo(9, -360); ctx.lineTo(6, -40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#B88A45'; ctx.fillRect(-11, -250, 22, 16); ctx.fillRect(-11, -220, 22, 8);
  ctx.fillStyle = 'rgba(255,236,200,0.9)'; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, TAU); ctx.fill();
  ctx.restore();
}
/** tiny scratch flakes thrown from the stylus tip */
function flakes(x, y, t, n = 6) { for (let i = 0; i < n; i++) { const ph = (t * 5 + rnd(i)) % 1; ctx.fillStyle = `rgba(90,55,20,${0.8 * (1 - ph)})`; ctx.fillRect(x + (rnd(i * 3) - 0.5) * 60 * ph, y - 30 * ph + 40 * ph * ph, 3, 3); } }
/** soot rub band at local x sx across a leaf of height h (call inside the leaf clip) */
function sootBand(sx, h, a = 1) {
  const g = ctx.createLinearGradient(sx - 160, 0, sx + 50, 0); g.addColorStop(0, 'rgba(15,8,3,0.04)'); g.addColorStop(0.7, `rgba(15,8,3,${0.5 * a})`); g.addColorStop(1, 'rgba(15,8,3,0)');
  ctx.fillStyle = g; ctx.fillRect(sx - 160, -h, 210, h * 2);
}
/** edge burn from the right end: char beyond bx, glowing rim, flames (inside leaf-local coords) */
function burnRight(w, h, bx, t, flames = true) {
  const front = []; for (let i = 0; i <= 16; i++) { const y = -h / 2 - 10 + ((h + 20) * i) / 16; front.push([bx + 22 * sin(y * 0.045 + t * 2.4) + 12 * sin(y * 0.11 - t * 4) + Math.abs(y) * 0.5, y]); }
  ctx.save(); leafPath(w, h); ctx.clip();
  ctx.strokeStyle = 'rgba(60,28,8,0.55)'; ctx.lineWidth = 26; leafPath(w, h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(front[0][0] - 70, front[0][1]); front.forEach(([x, y]) => ctx.lineTo(x - 70, y)); ctx.lineTo(w, h); ctx.lineTo(w, -h); ctx.closePath(); ctx.fillStyle = 'rgba(70,32,8,0.55)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(front[0][0], front[0][1]); front.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(w, h); ctx.lineTo(w, -h); ctx.closePath(); ctx.fillStyle = '#1A0B03'; ctx.fill();
  ctx.lineJoin = 'round'; ctx.beginPath(); front.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = '#FF8A1E'; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = '#FFD25A'; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
  if (flames) for (let i = 1; i < 16; i += 2) { const [x, y] = front[i]; K.flame(x + 6, y + 8, 0.9 + 0.6 * rnd(i) + 0.25 * sin(t * 6 + i), t, i * 3); }
}
/** rising embers around (x,y) */
function sparks(x, y, t, n = 20, spread = 200, rise = 600) {
  for (let i = 0; i < n; i++) { const ph = (t * (0.5 + rnd(i) * 0.6) + rnd(i * 7)) % 1; ctx.fillStyle = `rgba(255,${160 + (rnd(i) * 80) | 0},70,${(1 - ph) * 0.9})`; ctx.beginPath(); ctx.arc(x + (rnd(i * 3) - 0.5) * spread + sin(ph * 6 + i) * 30, y - ph * rise, 2 + rnd(i * 5) * 3, 0, TAU); ctx.fill(); }
}
/** red curse glow on strokes (lighter blend), intensity a */
function curse(S, pr, a, w = 3) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.22 * a; etch(S, pr, '#FF3A1A', w * 6); ctx.globalAlpha = 0.45 * a; etch(S, pr, '#FF4A20', w * 2.4);
  ctx.restore(); ctx.globalAlpha = 1; etch(S, pr, SIN, w); ctx.globalAlpha = 0.6 * a; etch(S, pr, '#FFB08A', w * 0.4); ctx.globalAlpha = 1;
}
const cord = (x1, y1, x2, y2, sag = 120) => { ctx.strokeStyle = '#6E4A22'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.bezierCurveTo(x1, y1 + sag, x2, y2 + sag, x2, y2); ctx.stroke(); ctx.strokeStyle = 'rgba(255,220,160,0.25)'; ctx.lineWidth = 2; ctx.stroke(); };

// ═════════════════════════ SHOTS ═════════════════════════
export function buildA(add, cue) {
  const kill = Wd('kill', 0), l1 = L(1), says = Wd('says', 1), the1 = Wd('the', 1), nandi = Wd('nandivarman', 1), in1 = Wd('in', 1);
  const l2 = L(2), fought = Wd('fought', 2), and2 = Wd('and', 2), lost = Wd('lost', 2), l3 = L(3), l4 = L(4);

  // shared stroke sets
  const KW = 1040, KH = 380; // close-up leaf
  const S_KING1 = prep(tr(KING, -40, 150, 1.05));
  const S_VERSE1 = prep(verse(-470, -200, -120, 120, 5, 3, [-KW * 0.3]));
  const S_VERSE2 = prep(verse(-450, 450, -120, 120, 5, 11, [-KW * 0.3, KW * 0.3]));

  // a1 · 0 -> "kill": burning leaf with an etched crowned faceless king, red flash, fast push-in
  const leafA1 = () => leafImg('l1', KW, KH, 0, () => { inkAll(S_KING1, 5); inkAll(S_VERSE1, 3); });
  add({ id: 'a1', at: 0, cam: [500, 640], zoom: 0.32, note: 'burning leaf, etched crowned king, red flash',
    draw(lt, d, t) {
      desk(t, 640, 700, 0.3);
      ctx.save(); ctx.translate(560 + lt * 30, 700); ctx.rotate(-0.07 + lt * 0.03); ctx.scale(1.2, 1.2);
      putLeaf(leafA1(), KW, KH);
      burnRight(KW, KH, 300 - lt * 140, t);
      ctx.restore();
      sparks(900, 640, t, 26, 260, 700); smoke(880, 560, t + 2, 5, '160,150,140', 0.2, 80, 600);
      K.glow(920, 680, 380, '255,120,40', 0.35 + 0.1 * sin(t * 17));
      capCalm(); flash(lt, 0, 0.8);
    } });
  cue(0, 'slam', { gain: 1 }); cue(0, 'heartbeat', { gain: 0.9 }); cue(0.02, 'sizzle', { gain: 0.7, dur: 0.8 });

  // a2 · "kill a king": verse strokes on a leaf glow sindoor red like a curse, heartbeat pulse
  const leafA2 = () => leafImg('l2', KW, KH, 1, () => inkAll(S_VERSE2, 3.4));
  add({ id: 'a2', at: kill, cam: [540, 700], zoom: 0.18, note: 'curse verses glow red, heartbeat',
    draw(lt, d, t) {
      desk(t, 540, 700, 0.16);
      const p = hb(lt), sc = 1.12 + 0.025 * p;
      ctx.save(); ctx.translate(540, 700); ctx.rotate(0.05 - lt * 0.03); ctx.scale(sc, sc);
      putLeaf(leafA2(), KW, KH);
      ctx.save(); leafPath(KW, KH); ctx.clip(); curse(S_VERSE2, 0.15 + eio(seg(lt, 0, d * 0.9)) * 0.85, 0.5 + p, 3.4);
      ctx.fillStyle = `rgba(192,51,31,${0.12 * p})`; ctx.fillRect(-KW, -KH, KW * 2, KH * 2); ctx.restore();
      ctx.restore();
      K.glow(540, 700, 650, '200,40,20', 0.18 + 0.25 * p);
      K.label('VERSE 1', 880, 470, 30, 'rgba(241,230,204,0.55)');
      capCalm(); flash(lt, 0, 0.4, SIN, 0.12);
    } });
  cue(kill, 'whoosh', { gain: 0.6 }); cue(kill + 0.05, 'heartbeat', { gain: 0.9 }); cue(kill + 0.91, 'heartbeat', { gain: 0.7 });

  // a3 · L(1) "A Tamil legend": leaf flips on the cord, LEGEND tag stamps on
  const S_BUST = prep(tr(BUST, 60, 170, 0.62));
  const S_VERSE3 = prep(verse(-470, -110, -120, 120, 5, 21, [-KW * 0.3]));
  const leafA3b = () => leafImg('l3b', KW, KH, 0, () => { inkAll(S_BUST, 5); inkAll(S_VERSE3, 3); });
  const leafA3t = () => leafImg('l3t', KW, KH, 1, () => inkAll(S_VERSE2, 3));
  add({ id: 'a3', at: l1, cam: [540, 680], zoom: 0.1, note: 'leaf flips on cord, LEGEND stamp',
    draw(lt, d, t) {
      desk(t, 540, 700, 0.22);
      ctx.save(); ctx.translate(540, 720); ctx.rotate(-0.03 + lt * 0.015);
      for (let i = 3; i >= 1; i--) { ctx.save(); ctx.translate(i * 8, i * 14); ctx.globalAlpha = 1; putLeaf(leafA3t(), KW, KH, 0.9); ctx.restore(); }
      putLeaf(leafA3b(), KW, KH);
      // top leaf flips up and away around its long axis
      const f = eio(seg(lt, 0.05, 0.5)); if (f < 1) { ctx.save(); ctx.translate(0, -KH * 0.5 * f); ctx.scale(1, cos(f * PI)); putLeaf(leafA3t(), KW, KH); if (f > 0.5) { leafPath(KW, KH); ctx.fillStyle = `rgba(40,20,6,${0.6})`; ctx.fill(); } ctx.restore(); }
      ctx.restore();
      cord(540 - KW * 0.3, 720, 540 + KW * 0.3, 720, 420);
      K.label('VERSE 2', 880, 520, 30, 'rgba(241,230,204,0.55)');
      stamp('LEGEND', 'red', 300, 400, lt, Wd('legend', 1) - l1, -0.08, 60);
      capCalm();
    } });
  cue(l1, 'whoosh', { gain: 0.8 }); cue(Wd('legend', 1), 'slam', { gain: 0.7 });

  // a3b · "says one did": the bundle fans out, one leaf's verses burn red
  const S_FAN = prep(verse(-330, 330, -38, 38, 3, 31, [-216, 216]));
  const fanLeaf = () => leafImg('lfan', 720, 130, 0, () => inkAll(S_FAN, 2.6));
  const fanRed = () => cached('afanred', 720, 130, 1, () => { ctx.translate(360, 65); ctx.globalAlpha = 0.35; etch(S_FAN, 1, '#FF3A1A', 14); ctx.globalAlpha = 1; etch(S_FAN, 1, '#FF5A2A', 3.5); });
  add({ id: 'a3b', at: says, cam: [540, 760], zoom: 0.14, note: 'leaf fan spreads, curse leaf glows',
    draw(lt, d, t) {
      desk(t, 540, 760, 0.25);
      const spread = eob(seg(lt, 0, 0.55)), n = 7, px = 540, py = 1180;
      for (let i = 0; i < n; i++) {
        const a = -PI / 2 + (i - (n - 1) / 2) * 0.27 * spread + lt * 0.02;
        ctx.save(); ctx.translate(px, py); ctx.rotate(a); ctx.translate(440, 0);
        putLeaf(fanLeaf(), 720, 130);
        if (i === 3) { const p = hb(lt + 0.3), k = seg(lt, 0.4, 0.9); ctx.save(); ctx.globalCompositeOperation = 'lighter'; blit(fanRed(), 360, 65, 0, 0, 1, k * (0.5 + 0.5 * p)); ctx.restore(); }
        ctx.restore();
      }
      K.glow(540, 740, 500, '200,40,20', 0.12 + 0.2 * hb(lt + 0.3) * seg(lt, 0.4, 0.9));
      ctx.fillStyle = '#6E4A22'; ctx.beginPath(); ctx.arc(px, py, 26, 0, TAU); ctx.fill(); ctx.fillStyle = '#3A220C'; ctx.beginPath(); ctx.arc(px, py, 10, 0, TAU); ctx.fill();
      K.label('ONE DID', 540, 230, 44, 'rgba(241,230,204,' + seg(lt, Wd('one', 1) - says, Wd('one', 1) - says + 0.2) + ')');
      capCalm();
    } });
  cue(says, 'slide', { gain: 0.7 }); cue(Wd('did', 1), 'heartbeat', { gain: 0.6 });

  // a4 · "The king was the Pallava ruler": stylus etch + soot rub of the seated king; PALLAVA KING
  const S_KING4 = prep(tr(KING, 0, 150, 1.05));
  const kingInk = () => inkImg('k4ink', KW, KH, S_KING4, 5);
  const leafPlain = () => leafImg('lplain', KW, KH, 0);
  add({ id: 'a4', at: the1, cam: [540, 700], zoom: 0.12, note: 'stylus etches seated king, soot rub, PALLAVA KING',
    draw(lt, d, t) {
      desk(t, 540, 700, 0.24);
      ctx.save(); ctx.translate(540, 720); ctx.rotate(0.025 - lt * 0.012); ctx.scale(1.25, 1.25);
      putLeaf(leafPlain(), KW, KH);
      const pe = eio(seg(lt, 0, 0.8)), q = seg(lt, 0.8, 1.35), sx = lerp(-KW * 0.32, KW * 0.32, eio(q));
      ctx.save(); leafPath(KW, KH); ctx.clip();
      const tip = etch(S_KING4, pe, SCR, 2.4);
      if (q > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-KW, -KH, KW + sx, KH * 2); ctx.clip(); putBox(kingInk(), KW, KH); ctx.restore(); if (q < 1) sootBand(sx, KH); }
      ctx.restore();
      if (pe < 1 && tip) { flakes(tip[0], tip[1], t); stylus(tip[0], tip[1], 0.5); }
      ctx.restore();
      stamp('PALLAVA KING', 'bar', 540, 1060, lt, Wd('pallava', 1) - the1, 0, 54);
      capCalm();
    } });
  cue(the1, 'whoosh', { gain: 0.6 }); cue(the1 + 0.05, 'chisel', { gain: 0.8, dur: 0.75 }); cue(the1 + 0.8, 'slide', { gain: 0.5 }); cue(Wd('pallava', 1), 'tock', { gain: 0.8 });

  // a5 · "Nandivarman the Third": leaf turns slightly, lamp flicker, NANDIVARMAN III + ILLUSTRATION
  const leafA5 = () => leafImg('l5', KW, KH, 0, () => { inkAll(S_KING4, 5); });
  add({ id: 'a5', at: nandi, cam: [560, 720], zoom: 0.1, note: 'NANDIVARMAN III, lamp flicker',
    draw(lt, d, t) {
      const fl = 0.85 + 0.15 * sin(t * 13) * sin(t * 7.7);
      desk(t, 200, 900, 0.3 * fl);
      ctx.save(); ctx.translate(560, 700); ctx.rotate(-0.06 + eio(seg(lt, 0, d)) * 0.08); ctx.scale(1.3 - lt * 0.02, 1.3 - lt * 0.02);
      putLeaf(leafA5(), KW, KH);
      ctx.save(); leafPath(KW, KH); ctx.clip(); const g = ctx.createLinearGradient(-KW / 2, 0, KW / 2, 0); g.addColorStop(0, `rgba(255,180,80,${0.25 * fl})`); g.addColorStop(1, 'rgba(20,10,4,0.3)'); ctx.fillStyle = g; ctx.fillRect(-KW, -KH, KW * 2, KH * 2);
      ctx.restore(); ctx.restore();
      K.lamp(110, 1250, 0.55, t, fl); smoke(110, 1150, t, 5, '200,180,150', 0.14, 60, 700);
      // name bar etches on (clip reveal)
      const img = tagImg('NANDIVARMAN III', 'bar', 64), k = eo(seg(lt, 0.05, 0.45));
      ctx.save(); ctx.beginPath(); ctx.rect(540 - img.width / 2, 980, img.width * k, img.height + 10); ctx.clip(); blit(img, img.width / 2, 0, 540, 990, 1); ctx.restore();
      if (k < 1) stylus(540 - img.width / 2 + img.width * k, 1040, 0.4);
      stamp('ILLUSTRATION', 'bar', 830, 420, lt, 0.5, 0.04, 30);
      capCalm();
    } });
  cue(nandi, 'whoosh', { gain: 0.6 }); cue(nandi + 0.05, 'chisel', { gain: 0.6, dur: 0.4 }); cue(nandi + 0.5, 'tock', { gain: 0.5 });

  // a6 · "in the eight hundreds": c. 800s CE etched then soot-rubbed
  const TXT = 'c. 800s CE', KW6 = 1240;
  const verseA6 = prep(verse(-500, 500, -135, -135, 1, 41, [-372, 372]).concat(verse(-500, 500, 140, 140, 1, 43, [-372, 372])));
  const leafA6 = () => leafImg('l6', KW6, KH, 1, () => inkAll(verseA6, 2.6));
  add({ id: 'a6', at: in1, cam: [540, 700], zoom: 0.14, note: 'c. 800s CE etched + soot rub',
    draw(lt, d, t) {
      desk(t, 540, 700, 0.24);
      ctx.save(); ctx.translate(540 - lt * 18, 710); ctx.rotate(-0.035); ctx.scale(1.05, 1.05);
      putLeaf(leafA6(), KW6, KH);
      const et = textImg('800', TXT, 118, 'etch'), ik = textImg('800', TXT, 118, 'ink'), tw = et.width, th = et.height, x0 = -tw / 2, y0 = -th / 2;
      const pe = eio(seg(lt, 0, Wd('hundreds', 1) - in1 + 0.15)), q = eio(seg(lt, Wd('hundreds', 1) - in1 + 0.2, Wd('hundreds', 1) - in1 + 0.75));
      ctx.save(); leafPath(KW6, KH); ctx.clip();
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, tw * pe, th); ctx.clip(); blit(et, 0, 0, x0, y0, 1); ctx.restore();
      if (q > 0) { const sx = x0 + tw * q; ctx.save(); ctx.beginPath(); ctx.rect(x0 - 50, y0, sx - x0 + 50, th); ctx.clip(); blit(ik, 0, 0, x0, y0, 1); ctx.restore(); if (q < 1) sootBand(sx, KH); }
      ctx.restore();
      if (pe < 1 && pe > 0) { const sx = x0 + tw * pe, sy = 10 + 50 * sin(lt * 40); flakes(sx, sy, t); stylus(sx, sy, 0.45); }
      ctx.restore();
      stamp('9TH CENTURY', 'bar', 540, 1040, lt, 1.1, 0, 40);
      capCalm();
    } });
  cue(in1, 'whoosh', { gain: 0.6 }); cue(in1 + 0.05, 'chisel', { gain: 0.8, dur: 0.75 }); cue(Wd('hundreds', 1) + 0.2, 'slide', { gain: 0.55 }); cue(in1 + 1.1, 'tock', { gain: 0.5 });

  // a7 · L(2) "His half brothers": four smaller faceless figures etched one after another
  const LW7 = 1180, LH7 = 400, BX = [-255, -85, 85, 255];
  const S_BROS = BX.map((x, i) => prep(tr(BRO, x, 150, 1.85 - (i % 2) * 0.1)));
  const brosInk = () => inkImg('bros', LW7, LH7, S_BROS.flatMap((s) => s.map((o) => o.p)), 5);
  const leafPlain7 = () => leafImg('lplain7', LW7, LH7, 0);
  add({ id: 'a7', at: l2, cam: [540, 720], zoom: 0.12, note: 'four half brothers etched, HALF BROTHERS, THE STORY GOES',
    draw(lt, d, t) {
      desk(t, 540, 700, 0.24);
      ctx.save(); ctx.translate(540 + 20 - lt * 20, 720); ctx.rotate(0.02); ctx.scale(1.05, 1.05);
      putLeaf(leafPlain7(), LW7, LH7);
      ctx.save(); leafPath(LW7, LH7); ctx.clip();
      const q = seg(lt, 1.3, 1.8), sx = lerp(-LW7 * 0.42, LW7 * 0.42, eio(q)); let tip = null;
      S_BROS.forEach((S, i) => { const p = seg(lt, i * 0.3, i * 0.3 + 0.32); if (p > 0) { const tp = etch(S, eo(p), SCR, 2.6); if (p < 1) tip = tp; } });
      if (q > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-LW7, -LH7, LW7 + sx, LH7 * 2); ctx.clip(); putBox(brosInk(), LW7, LH7); ctx.restore(); if (q < 1) sootBand(sx, LH7); }
      ctx.restore();
      if (tip) { flakes(tip[0], tip[1], t); stylus(tip[0], tip[1], 0.5); }
      ctx.restore();
      stamp('HALF BROTHERS', 'bar', 540, 1040, lt, Wd('brothers', 2) - l2, 0, 54);
      stamp('THE STORY GOES', 'red', 540, 400, lt, Wd('story', 2) - l2, -0.05, 44);
      capCalm();
    } });
  cue(l2, 'whoosh', { gain: 0.6 }); [0, 0.3, 0.6, 0.9].forEach((k) => cue(l2 + k, 'chisel', { gain: 0.6, dur: 0.3 }));
  cue(Wd('brothers', 2), 'tock', { gain: 0.6 }); cue(Wd('story', 2), 'slam', { gain: 0.5 });

  // a8 · "fought him for the throne": two etched armies rush together, throne icon in the middle
  const LW8 = 1320, LH8 = 440;
  const soldier = () => inkImg('sold', 90, 110, tr(SOLDIER, 0, 40), 3.6);
  const S_THR = THRONE.map((p) => p);
  const throneInk = () => inkImg('thr', 220, 260, tr(S_THR, 0, 80, 1), 5);
  const leafA8 = () => leafImg('l8', LW8, LH8, 1);
  const army = (lt, side, beaten = 0) => {
    const adv = eio(seg(lt, 0, 0.75)), clash = lt > 0.75;
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) {
      const base = side * (110 + i * 70 + r * 30), x = lerp(base + side * 420, base, adv) + (clash ? side * 6 * sin(lt * 30 + i) : 0);
      const y = 150 + r * 55 - Math.abs(sin(lt * 18 + i * 1.3 + r)) * (clash ? 3 : 10);
      ctx.save(); ctx.translate(x, y); ctx.scale(-side * 1.25, 1.25); blit(soldier(), 45, 70, 0, 0, 1); ctx.restore();
    }
  };
  add({ id: 'a8', at: fought, cam: [540, 760], zoom: 0.16, note: 'two etched armies clash, throne icon',
    draw(lt, d, t) {
      desk(t, 540, 700, 0.24);
      const shake = lt > 0.75 && lt < 1.05 ? 7 * sin(lt * 90) : 0;
      ctx.save(); ctx.translate(540 + shake, 720 + shake * 0.5); ctx.rotate(-0.02); ctx.scale(0.95, 0.95);
      putLeaf(leafA8(), LW8, LH8);
      ctx.save(); leafPath(LW8, LH8); ctx.clip();
      const tg = 0.5 + 0.5 * sin(t * 6); ctx.save(); ctx.globalCompositeOperation = 'lighter'; K.glow(0, -70, 160, '224,165,38', 0.3 + 0.2 * tg); ctx.restore();
      blit(throneInk(), 110, 130, 0, -60, 0.95);
      army(lt, -1); army(lt, 1);
      if (lt > 0.7) for (let i = 0; i < 9; i++) { const ph = seg(lt, 0.7 + i * 0.04, 1.3 + i * 0.04); if (ph <= 0 || ph >= 1) continue; ctx.fillStyle = `rgba(90,60,30,${0.4 * (1 - ph)})`; ctx.beginPath(); ctx.arc((rnd(i) - 0.5) * 160, 150 - ph * 60 * rnd(i * 2), 20 + ph * 60, 0, TAU); ctx.fill(); }
      ctx.restore(); ctx.restore();
      K.label('THE THRONE', 540, 420, 40, 'rgba(241,230,204,0.75)');
      capCalm();
    } });
  cue(fought, 'whoosh', { gain: 0.6 }); cue(fought + 0.05, 'rumble', { gain: 0.6, dur: 0.8 }); cue(fought + 0.75, 'slam', { gain: 0.8 }); cue(fought + 0.8, 'drum', { gain: 0.6 });

  // a9 · "and lost": the brothers' banner falls, their figures fade/slide away
  const bannerInk = () => inkImg('ban', 300, 360, tr(BANNER, 40, 330), 5, SIN);
  add({ id: 'a9', at: and2, cam: [540, 760], zoom: 0.1, note: 'brothers banner falls, they fade, LOST',
    draw(lt, d, t) {
      desk(t, 540, 700, 0.2);
      ctx.save(); ctx.translate(540, 720); ctx.rotate(-0.02); ctx.scale(0.98, 0.98);
      putLeaf(leafA8(), LW8, LH8);
      ctx.save(); leafPath(LW8, LH8); ctx.clip();
      K.glow(0, -70, 160, '224,165,38', 0.45);
      blit(throneInk(), 110, 130, 0, -60, 0.95);
      army(10, 1);
      const go = eio(seg(lt, 0.45, 1.1));
      ctx.save(); ctx.globalAlpha = 1 - go * 0.85; ctx.translate(-go * 220, go * 30); army(10, -1); ctx.restore();
      const fall = seg(lt, 0.08, 0.45) ** 2;
      ctx.save(); ctx.translate(-260 - go * 160, 190); ctx.rotate(-fall * 1.45); ctx.globalAlpha = 1 - go * 0.6; blit(bannerInk(), 40, 330, 0, 0, 1.25); ctx.restore();
      if (lt > 0.45 && lt < 1.05) { const ph = seg(lt, 0.45, 1.05); ctx.fillStyle = `rgba(90,60,30,${0.5 * (1 - ph)})`; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-500 + i * 60, 170 - ph * 40, 18 + ph * 50, 0, TAU); ctx.fill(); } }
      ctx.restore(); ctx.restore();
      stamp('LOST', 'red', 300, 420, lt, lost - and2, -0.1, 70);
      capCalm(); flash(lt, 0.45, 0.25, '#000000', 0.2);
    } });
  cue(and2, 'whoosh', { gain: 0.5 }); cue(and2 + 0.45, 'thud', { gain: 1 }); cue(lost, 'slam', { gain: 0.5 });

  // a10 · L(3) "So one of them turned to words": lone brother etched on a leaf above, a stylus scratches a blank leaf below,
  // the strokes start to glow sindoor red
  const S_POET = prep(tr(POET, -160, 140, 1.8));
  const leafA10 = () => leafImg('l10', 900, 330, 0, () => inkAll(S_POET, 5));
  const S_WORDS = prep(verse(-390, 390, -70, 70, 3, 61, [-0.3 * 940, 0.3 * 940]));
  const leafBlank = () => leafImg('lblank', 940, 220, 1);
  add({ id: 'a10', at: l3, cam: [540, 760], zoom: 0.12, note: 'lone brother, stylus writes, strokes glow red',
    draw(lt, d, t) {
      const fl = 0.9 + 0.1 * sin(t * 11) * sin(t * 6.1);
      desk(t, 540, 760, 0.26 * fl);
      ctx.save(); ctx.translate(540 - lt * 10, 470); ctx.rotate(-0.03 + lt * 0.01); putLeaf(leafA10(), 900, 330); ctx.restore();
      const wk = Wd('words', 3) - l3, pe = seg(lt, 0.2, d - 0.1);
      ctx.save(); ctx.translate(540, 960); ctx.rotate(0.02 - lt * 0.01);
      putLeaf(leafBlank(), 940, 220);
      ctx.save(); leafPath(940, 220); ctx.clip();
      const tip = etch(S_WORDS, pe, SCR, 2.6);
      const ra = seg(lt, wk - 0.3, wk + 0.4); if (ra > 0) curse(S_WORDS, pe, ra * (0.5 + 0.6 * hb(lt)), 2.6);
      ctx.restore();
      if (tip) { flakes(tip[0], tip[1], t); stylus(tip[0], tip[1], 0.55); }
      ctx.restore();
      if (ra > 0) K.glow(540, 960, 520, '200,40,20', 0.18 * ra * (0.6 + 0.4 * hb(lt)));
      K.lamp(980, 1260, 0.5, t, fl);
      stamp('TURNED TO WORDS', 'bar', 540, 210, lt, wk, 0, 44);
      capCalm();
    } });
  cue(l3, 'whoosh', { gain: 0.5 }); cue(l3 + 0.2, 'chisel', { gain: 0.6, dur: 1.6 }); cue(Wd('words', 3), 'heartbeat', { gain: 0.7 }); cue(Wd('words', 3) + 0.4, 'swell', { gain: 0.4, dur: 0.6 });
  void l4;
}
