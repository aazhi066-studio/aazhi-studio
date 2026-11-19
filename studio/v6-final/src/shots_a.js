// EPISODE 6 · worker A : "Shadow Play on Parched Earth" opening (0 → L(5)).
// Backlit leather-puppet screen (bone cloth, one flickering oil lamp, wooden frame, puppet sticks), parched cracked earth,
// gold grain as the only signal colour, woodblock labels, crack-spread transitions with falling shards.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { lg, poly, rgba, mixc, cached, blit } from './art.js';

const UMB = '#1E130C', UMB2 = '#3A2418', DUST = '#8E5E3A', DUST2 = '#A8744A', BONE = '#EFE4CC', GLOW = '#F6D9A0', INK = '#120B07';
const GOLD = '#E9B949', GOLDD = '#8F6418', GOLDH = '#FFEAA8', WOOD = '#4A2E1A';
const WBF = (s) => `900 ${s}px Inter, sans-serif`, NOTE = (s) => `italic 700 ${s}px Caladea, serif`;
const TM = {};
const SX0 = 64, SX1 = 1016, SY0 = 150, SY1 = 1262;          // the cloth screen
const fl = (t) => 0.5 * Math.sin(t * 9.1) + 0.3 * Math.sin(t * 13.7 + 1.3) + 0.2 * Math.sin(t * 23.3 + 2.1);   // lamp flicker, -1..1
const sstep = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// ───────────── textures ─────────────
/** dry mud-crack texture (Voronoi cells, per-pixel, generated once). pal: [cellA, cellB, crack, rim] */
function crackTex(key, w, h, cell, pal, o = {}) {
  const q = o.q ?? 0.6, cw0 = o.cw ?? 3.2, seed = o.seed ?? 1, smooth = o.smooth;
  return cached(key, w, h, q, () => {
    const cw = Math.ceil(w * q), ch = Math.ceil(h * q), cs = cell * q, nx = Math.ceil(cw / cs) + 2, ny = Math.ceil(ch / cs) + 2;
    const PX = new Float32Array(nx * ny), PY = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i; PX[k] = (i - 1 + 0.1 + 0.8 * rnd(k * 1.71 + seed)) * cs; PY[k] = (j - 1 + 0.1 + 0.8 * rnd(k * 2.37 + seed * 3)) * cs; }
    const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const A = hx(pal[0]), B = hx(pal[1]), CR = hx(pal[2]), RIM = hx(pal[3]);
    const im = ctx.createImageData(cw, ch), D = im.data, wq = cw0 * q;
    for (let y = 0; y < ch; y++) {
      const gj = Math.floor(y / cs) + 1;
      for (let x = 0; x < cw; x++) {
        const gi = Math.floor(x / cs) + 1; let d1 = 1e9, d2 = 1e9, id = 0, bx = 0, by = 0;
        for (let jj = gj - 1; jj <= gj + 1; jj++) for (let ii = gi - 1; ii <= gi + 1; ii++) {
          if (ii < 0 || jj < 0 || ii >= nx || jj >= ny) continue; const k = jj * nx + ii, dx = x - PX[k], dy = y - PY[k], dd = dx * dx + dy * dy;
          if (dd < d1) { d2 = d1; d1 = dd; id = k; bx = dx; by = dy; } else if (dd < d2) d2 = dd;
        }
        d1 = Math.sqrt(d1); d2 = Math.sqrt(d2); const e = (d2 - d1) * 0.5, n = rnd(x * 0.731 + y * 1.913 + seed) - 0.5, tn = rnd(id * 3.3 + seed);
        let r = A[0] + (B[0] - A[0]) * tn, g = A[1] + (B[1] - A[1]) * tn, b = A[2] + (B[2] - A[2]) * tn;
        const cen = 1 - Math.min(1, d1 / cs) * 0.22; r *= cen; g *= cen; b *= cen;
        const ww = wq * (0.55 + 0.9 * rnd(id * 0.77 + seed));
        if (!smooth) {
          if (e < ww) { const k = e / ww; r = CR[0] + (r - CR[0]) * k * 0.35; g = CR[1] + (g - CR[1]) * k * 0.35; b = CR[2] + (b - CR[2]) * k * 0.35; }
          else if (e < ww * 2.6) { const k = 1 - (e - ww) / (ww * 1.6), up = by < 0 ? 1 : 0.35; r += (RIM[0] - r) * k * 0.45 * up; g += (RIM[1] - g) * k * 0.45 * up; b += (RIM[2] - b) * k * 0.45 * up; }
        }
        const p = (y * cw + x) * 4; D[p] = r + n * 18; D[p + 1] = g + n * 15; D[p + 2] = b + n * 12; D[p + 3] = 255;
      }
    }
    ctx.putImageData(im, 0, 0);
  });
}
/** perspective version of a top-down texture, cached: horizon at row 0, nearest at row h */
function perspTex(key, src, sw, sh, h, y0 = 250) {
  return cached(key, W, h, 1, () => {
    const k = 1, Zn = k / (h + y0), Zf = k / y0, q = src._q;
    for (let y = 0; y < h; y += 3) {
      const Z = k / (y + y0), v = sh * (1 - (Z - Zn) / (Zf - Zn)), ww = sw * Math.min(1, Z / Zf * 1.0), sx = (sw - ww) / 2;
      ctx.drawImage(src, sx * q, clamp(v * q, 0, src.height - 2), ww * q, 2, 0, y, W, 3.4);
    }
  });
}
function clothImg() {
  return cached('a-cloth', W, H, 0.75, () => {
    const w = SX1 - SX0, h = SY1 - SY0;
    ctx.fillStyle = BONE; ctx.fillRect(SX0, SY0, w, h);
    for (let i = 0; i < 16; i++) { const x = SX0 + rnd(i * 3.1) * w, y = SY0 + rnd(i * 7.7 + 1) * h, r = 80 + rnd(i + 4) * 260; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(150,105,55,${0.03 + rnd(i) * 0.05})`); g.addColorStop(1, 'rgba(150,105,55,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let y = SY0; y < SY1; y += 3) { ctx.fillStyle = `rgba(110,80,40,${0.02 + rnd(y * 0.37) * 0.035})`; ctx.fillRect(SX0, y, w, 1); }
    for (let x = SX0; x < SX1; x += 3) { ctx.fillStyle = `rgba(110,80,40,${0.015 + rnd(x * 0.71) * 0.03})`; ctx.fillRect(x, SY0, 1, h); }
    // stitched panel seams
    for (const sx of [SX0 + w * 0.34, SX0 + w * 0.68]) { ctx.fillStyle = 'rgba(120,85,45,0.10)'; ctx.fillRect(sx - 3, SY0, 6, h); ctx.strokeStyle = 'rgba(90,60,30,0.22)'; ctx.lineWidth = 1.6; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.moveTo(sx + 5, SY0); ctx.lineTo(sx + 5, SY1); ctx.stroke(); ctx.setLineDash([]); }
    // edges: scorched, darker towards the frame
    for (const [x0, y0, x1, y1] of [[SX0, 0, SX0 + 90, 0], [SX1, 0, SX1 - 90, 0], [0, SY0, 0, SY0 + 90], [0, SY1, 0, SY1 - 90]]) { ctx.fillStyle = lg(x0, y0, x1, y1, [[0, 'rgba(90,55,25,0.45)'], [1, 'rgba(90,55,25,0)']]); ctx.fillRect(SX0, SY0, w, h); }
  });
}
const floorImg = () => crackTex('a-floor', W + 240, 760, 64, ['#3A2418', '#2E1C12', '#0C0704', '#6A4428'], { q: 0.55, cw: 3.6, seed: 4 });

// ───────────── woodblock label (rough-edged hand press) ─────────────
function wbImg(text, size, col) {
  ctx.save(); ctx.font = WBF(size); const ws = [...text].map((c) => ctx.measureText(c).width); ctx.restore();
  const gap = size * 0.06, tw = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1), w = tw + size * 0.5, h = size * 1.5;
  const c = cached(`wb:${text}:${size}:${col}`, w, h, 1, () => {
    ctx.font = WBF(size); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; let x = size * 0.25;
    [...text].forEach((ch, i) => {
      const sd = i * 7.3 + text.length; ctx.save(); ctx.translate(x + ws[i] / 2, h / 2 + (rnd(sd) - 0.5) * size * 0.06); ctx.rotate((rnd(sd + 1) - 0.5) * 0.07); const sc = 0.96 + rnd(sd + 2) * 0.07; ctx.scale(sc, sc);
      ctx.fillStyle = col; ctx.globalAlpha = 0.45; ctx.fillText(ch, -ws[i] / 2 + 1.2, 1); ctx.fillText(ch, -ws[i] / 2 - 1, -0.8); ctx.globalAlpha = 1; ctx.fillText(ch, -ws[i] / 2, 0); ctx.restore(); x += ws[i] + gap;
    });
    // ink starvation: speckles and wood-grain streaks knocked out of the letters
    ctx.globalCompositeOperation = 'destination-out';
    const n = Math.floor(w * h / 90);
    for (let i = 0; i < n; i++) { const r = 0.6 + rnd(i * 1.3 + size) ** 3 * size * 0.05; ctx.fillStyle = `rgba(0,0,0,${0.35 + rnd(i * 2.1) * 0.65})`; ctx.beginPath(); ctx.arc(rnd(i * 3.7 + 1) * w, rnd(i * 5.9 + 2) * h, r, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 9; i++) { const y = rnd(i * 4.4 + size) * h; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.8 + rnd(i) * 1.6; ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + 2); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over';
  });
  return c;
}
/** press a woodblock label centred at x, y. k = 0..1 press-in progress */
function wb(text, x, y, size, col, k, o = {}) {
  if (k <= 0) return; const c = wbImg(text, size, col), e = eob(clamp(k)), sc = lerp(1.35, 1, e) * (o.sc || 1);
  ctx.save(); ctx.globalAlpha *= clamp(k * 3) * (o.a ?? 1); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(sc, sc);
  if (o.shadow) { ctx.globalAlpha *= 0.55; ctx.filter = 'blur(6px)'; ctx.drawImage(c, -c.width / 2 + 6, -c.height / 2 + 10); ctx.filter = 'none'; ctx.globalAlpha /= 0.55; }
  ctx.drawImage(c, -c.width / 2, -c.height / 2); ctx.restore();
}
function note(text, x, y, size, col, a, o = {}) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = NOTE(size); ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = (o.ls ?? 1) + 'px';
  ctx.fillStyle = col; ctx.fillText(text, x, y + (1 - clamp(a)) * 10); ctx.restore(); ctx.letterSpacing = '0px';
}

// ───────────── the screen ─────────────
function screen(t, o = {}) {
  const lx = o.lx ?? 540, ly = o.ly ?? 700, f = fl(t), dim = o.dim ?? 0;
  ctx.fillStyle = UMB; ctx.fillRect(-300, -300, W + 600, H + 600);
  // floor in front of the screen
  blit(floorImg(), 120, 0, 0, SY1 + 20, 1);
  ctx.fillStyle = lg(0, SY1, 0, H, [[0, 'rgba(246,217,160,0.16)'], [0.25, 'rgba(30,19,12,0.35)'], [1, 'rgba(18,11,7,0.85)']]); ctx.fillRect(-300, SY1, W + 600, H - SY1 + 300);
  ctx.fillStyle = 'rgba(18,11,7,0.35)'; ctx.fillRect(-300, 1300, W + 600, 220);      // calm caption band
  // lamp spill on the floor
  const sp = ctx.createRadialGradient(540, SY1 + 40, 10, 540, SY1 + 40, 520); sp.addColorStop(0, `rgba(246,200,130,${0.22 + 0.04 * f})`); sp.addColorStop(1, 'rgba(246,200,130,0)'); ctx.fillStyle = sp; ctx.fillRect(0, SY1, W, 560);
  // cloth + lamp light
  blit(clothImg(), 0, 0, 0, 0);
  ctx.save(); poly([[SX0, SY0], [SX1, SY0], [SX1, SY1], [SX0, SY1]]); ctx.clip();
  const R = 980 + f * 22, g = ctx.createRadialGradient(lx, ly, 20, lx, ly, R);
  g.addColorStop(0, `rgba(255,236,190,${0.55 + 0.06 * f - dim * 0.4})`); g.addColorStop(0.18, `rgba(246,217,160,${0.3 - dim * 0.2})`); g.addColorStop(0.55, `rgba(150,95,45,${0.12 + dim * 0.25})`); g.addColorStop(1, `rgba(40,22,10,${0.62 + dim * 0.25})`);
  ctx.fillStyle = g; ctx.fillRect(SX0, SY0, SX1 - SX0, SY1 - SY0);
  ctx.restore();
}
/** wooden frame + ties, drawn over the shadows */
function frame(t) {
  const f = fl(t);
  const beam = (x, y, w, h, vert) => { ctx.fillStyle = lg(x, y, vert ? x + w : x, vert ? y : y + h, [[0, '#2A190E'], [0.45, WOOD], [1, '#1B100A']]); ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(10,5,2,0.45)'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); if (vert) { const xx = x + 6 + i * (w - 12) / 3; ctx.moveTo(xx, y); ctx.lineTo(xx + 2, y + h); } else { const yy = y + 5 + i * (h - 10) / 3; ctx.moveTo(x, yy); ctx.lineTo(x + w, yy + 2); } ctx.stroke(); } };
  beam(18, 96, 52, 1250, true); beam(1010, 96, 52, 1250, true); beam(-20, 110, 1120, 46, false); beam(-20, SY1 - 4, 1120, 40, false);
  // warm rim light on the inner edges
  ctx.fillStyle = `rgba(246,217,160,${0.35 + 0.05 * f})`; ctx.fillRect(SX0 + 2, SY0, 3, SY1 - SY0); ctx.fillRect(SX1 - 5, SY0, 3, SY1 - SY0); ctx.fillRect(SX0, SY0 + 2, SX1 - SX0, 2);
  // cord ties
  ctx.strokeStyle = '#7A5A38'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const x = SX0 + 40 + i * (SX1 - SX0 - 80) / 7; for (const [y0, y1] of [[136, SY0 + 10], [SY1 + 22, SY1 - 10]]) { ctx.beginPath(); ctx.moveTo(x - 6, y0); ctx.lineTo(x + 4, y1); ctx.moveTo(x + 6, y0); ctx.lineTo(x - 4, y1); ctx.stroke(); } }
  for (let i = 0; i < 7; i++) { const y = SY0 + 70 + i * 160; for (const [x0, x1] of [[44, SX0 + 10], [1036, SX1 - 10]]) { ctx.beginPath(); ctx.moveTo(x0, y - 5); ctx.lineTo(x1, y + 3); ctx.moveTo(x0, y + 5); ctx.lineTo(x1, y - 3); ctx.stroke(); } }
  // top vignette
  ctx.fillStyle = lg(0, -300, 0, 220, [[0, 'rgba(10,6,3,0.9)'], [1, 'rgba(10,6,3,0)']]); ctx.fillRect(-300, -300, W + 600, 520);
}
/** draw shadows: clipped to the cloth, breathing with the lamp, a touch of blur */
function shadows(t, fn, o = {}) {
  const lx = o.lx ?? 540, ly = o.ly ?? 700, s = 1 + 0.015 * fl(t * 0.8);
  ctx.save(); poly([[SX0, SY0], [SX1, SY0], [SX1, SY1], [SX0, SY1]]); ctx.clip();
  ctx.translate(lx, ly); ctx.scale(s, s); ctx.translate(-lx, -ly);
  ctx.save(); ctx.globalAlpha = 0.28; ctx.filter = 'blur(7px)'; ctx.translate(0, 4); fn(true); ctx.restore();
  ctx.filter = 'blur(0.9px)'; fn(false); ctx.filter = 'none';
  ctx.restore();
}
function motes(t, n = 40, seed = 0, area = [SX0, SY0, SX1, SY1], col = '255,228,170', a = 0.55) {
  const [x0, y0, x1, y1] = area, w = x1 - x0, h = y1 - y0;
  for (let i = 0; i < n; i++) {
    const sp = 8 + rnd(i + seed) * 18, x = x0 + ((rnd(i * 3 + seed) * w + t * sp + Math.sin(t * 0.7 + i) * 30) % w + w) % w, y = y0 + ((rnd(i * 7 + seed) * h - t * (5 + rnd(i + 5) * 12)) % h + h) % h;
    const r = 1.2 + rnd(i + 9) * 2.6, tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 1.7 + i * 2.1));
    ctx.fillStyle = `rgba(${col},${a * tw})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
}

// ───────────── leather puppet ─────────────
function ik(sx, sy, tx, ty, l1, l2, bend) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 1e-3; const m = l1 + l2 - 0.5;
  if (d > m) { tx = sx + dx / d * m; ty = sy + dy / d * m; dx = tx - sx; dy = ty - sy; d = m; }
  const a = Math.atan2(dy, dx), b = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), an = a + bend * b;
  return [[sx + Math.cos(an) * l1, sy + Math.sin(an) * l1], [tx, ty]];
}
function limb(p0, p1, w0, w1) {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  ctx.beginPath(); ctx.moveTo(p0[0] + nx * w0 / 2, p0[1] + ny * w0 / 2); ctx.lineTo(p1[0] + nx * w1 / 2, p1[1] + ny * w1 / 2); ctx.lineTo(p1[0] - nx * w1 / 2, p1[1] - ny * w1 / 2); ctx.lineTo(p0[0] - nx * w0 / 2, p0[1] - ny * w0 / 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(p0[0], p0[1], w0 / 2, 0, TAU); ctx.arc(p1[0], p1[1], w1 / 2, 0, TAU); ctx.fill();
}
const holes = (pts, r, a = 0.85) => { ctx.fillStyle = rgba(GLOW, a); for (const [x, y, rr] of pts) { ctx.beginPath(); ctx.arc(x, y, rr || r, 0, TAU); ctx.fill(); } };
/** the hoe (mammoty): grip g, handle angle th (screen radians), length len */
function hoe(g, th, len = 160) {
  const hx = g[0] + Math.cos(th) * len, hy = g[1] + Math.sin(th) * len;
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(g[0] - Math.cos(th) * 10, g[1] - Math.sin(th) * 10); ctx.lineTo(hx, hy); ctx.stroke();
  const bd = th + Math.PI * 0.55, bx = Math.cos(bd), by = Math.sin(bd), nx = -by, ny = bx;
  ctx.beginPath(); ctx.moveTo(hx + nx * 6, hy + ny * 6); ctx.lineTo(hx + bx * 50 + nx * 22, hy + by * 50 + ny * 22); ctx.lineTo(hx + bx * 54 - nx * 22, hy + by * 54 - ny * 22); ctx.lineTo(hx - nx * 6, hy - ny * 6); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
  holes([[hx + bx * 30, hy + by * 30, 3.2]], 3);
  return [hx + bx * 52, hy + by * 52];
}
function basket(x, y, w = 74) {
  ctx.fillStyle = INK; poly([[x - w / 2, y - 34], [x + w / 2, y - 34], [x + w * 0.36, y], [x - w * 0.36, y]]); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x, y - 34, w / 2 + 3, 8, 0, 0, TAU); ctx.fill();
  const p = []; for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) p.push([x - w * 0.32 + i * w * 0.128 + r * 5, y - 24 + r * 12, 2.4]); holes(p, 2.4, 0.7);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(x, y - 40, w * 0.4, 12, 0, Math.PI, TAU); ctx.fill();   // heaped earth
}
/** a jointed leather shadow puppet. (x, y) = ground point. All poses relative, facing +x (dir flips). */
function puppet(o) {
  const s = o.s || 1, dir = o.dir || 1, hip = o.hip || [0, -142], lean = o.lean || 0, TL = 100;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(s * dir, s); ctx.fillStyle = INK; ctx.strokeStyle = INK;
  const up = (p, a, l) => [p[0] + Math.sin(a) * l, p[1] - Math.cos(a) * l];
  const sh = up(hip, lean, TL - 12), nk = up(hip, lean, TL), hc = up(nk, lean + (o.tilt || 0), 30);
  const feet = o.feet || [[-16, 0], [22, 0]], hands = o.hands || [[sh[0] - 4, sh[1] + 108], [sh[0] + 10, sh[1] + 108]];
  const legs = feet.map((f) => ik(hip[0], hip[1], f[0], f[1], 72, 74, -1)), arms = hands.map((h) => ik(sh[0], sh[1], h[0], h[1], 58, 58, o.elbowUp ? -1 : 1));
  // back limbs
  limb(hip, legs[0][0], 19, 13); limb(legs[0][0], legs[0][1], 13, 9); ctx.beginPath(); ctx.ellipse(feet[0][0] + 9, feet[0][1] - 3, 15, 5, 0, 0, TAU); ctx.fill();
  limb(sh, arms[0][0], 14, 11); limb(arms[0][0], arms[0][1], 11, 8); ctx.beginPath(); ctx.arc(arms[0][1][0], arms[0][1][1], 7, 0, TAU); ctx.fill();
  if (o.tool) o.tool(arms);
  // torso (thin, ribbed) + loincloth
  ctx.save(); ctx.translate(hip[0], hip[1]); ctx.rotate(lean);
  const tw = o.thin ? 0.82 : 1;
  ctx.beginPath(); ctx.moveTo(-14 * tw, 6); ctx.bezierCurveTo(-20 * tw, -30, -26 * tw, -70, -21 * tw, -TL + 8); ctx.quadraticCurveTo(0, -TL - 6, 21 * tw, -TL + 8); ctx.bezierCurveTo(28 * tw, -70, 22 * tw, -40, 16 * tw, 6); ctx.closePath(); ctx.fill();
  poly([[-20, -6], [22, -6], [30, 34], [8, 40], [-4, 26], [-26, 36]]); ctx.fill();
  const hp = [[0, -84, 2.6], [0, -72, 2.2], [0, -18, 2], [-12, 8, 2.2], [0, 10, 2.2], [12, 8, 2.2], [-14, 22, 2], [16, 22, 2]];
  if (o.thin) for (let r = 0; r < 4; r++) for (let i = -2; i <= 2; i++) if (i) hp.push([i * 5.5 * tw, -64 + r * 9 + Math.abs(i) * 1.6, 1.6]);
  holes(hp, 2); ctx.restore();
  // head: faceless, with a tied head-cloth knot
  ctx.fillStyle = INK; limb(nk, up(nk, lean, 14), 12, 12);
  ctx.beginPath(); ctx.ellipse(hc[0], hc[1], 20, 23, lean + (o.tilt || 0), 0, TAU); ctx.fill();
  const kb = [hc[0] - 22 * Math.cos(lean), hc[1] - 6]; ctx.beginPath(); ctx.ellipse(kb[0], kb[1], 9, 7, 0.4, 0, TAU); ctx.fill();
  const sw = Math.sin((o.t || 0) * 2.3 + (o.ph || 0)) * 6; limb(kb, [kb[0] - 16, kb[1] + 22 + sw], 6, 3);
  holes([[hc[0] - 4, hc[1] - 13, 1.8], [hc[0] + 3, hc[1] - 15, 1.8], [hc[0] + 9, hc[1] - 11, 1.8]], 1.8, 0.6);
  // front limbs
  ctx.fillStyle = INK;
  limb(hip, legs[1][0], 19, 13); limb(legs[1][0], legs[1][1], 13, 9); ctx.beginPath(); ctx.ellipse(feet[1][0] + 9, feet[1][1] - 3, 15, 5, 0, 0, TAU); ctx.fill();
  if (o.tool2) o.tool2(arms);
  ctx.fillStyle = INK; limb(sh, arms[1][0], 14, 11); limb(arms[1][0], arms[1][1], 11, 8); ctx.beginPath(); ctx.arc(arms[1][1][0], arms[1][1][1], 7, 0, TAU); ctx.fill();
  // rivets at the joints
  holes([sh, arms[1][0], legs[1][0], hip].map((p) => [p[0], p[1], 2.4]), 2.4, 0.9);
  holes([[legs[1][0][0] + (legs[1][1][0] - legs[1][0][0]) * 0.5, legs[1][0][1] + (legs[1][1][1] - legs[1][0][1]) * 0.5, 1.8]], 1.8, 0.7);
  // puppet sticks running down off the screen
  if (o.stickTo != null) {
    const yy = (o.stickTo - o.y) / s, hnd = arms[1][1], ch = up(hip, lean, 50);
    ctx.lineWidth = 2.6 / s; ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.moveTo(hnd[0], hnd[1]); ctx.lineTo(hnd[0] + 30 + (o.stickSway || 0), yy); ctx.moveTo(ch[0], ch[1]); ctx.lineTo(ch[0] - 20, yy); ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.restore();
}
/** digging pose from e: 0 = hoe raised overhead, 1 = struck into the ground */
function digPose(e, t, ph = 0) {
  const th = lerp(-Math.PI * 0.78, Math.PI * 0.36, e), arc = Math.sin(e * Math.PI) * 30;
  const g = [lerp(-24, 52, e), lerp(-300, -138, e) - arc], g2 = [g[0] + Math.cos(th) * 36, g[1] + Math.sin(th) * 36];
  return { lean: lerp(-0.06, 0.5, e) + Math.sin(t * 2 + ph) * 0.01, hip: [lerp(-2, -10, e), lerp(-142, -124, e)], hands: [g, g2], feet: [[-26, 0], [30, 0]], tool: () => {}, tool2: () => hoe(g, th), tilt: lerp(-0.1, 0.25, e) };
}
/** e for a repeating chop cycle; returns [e, phase] */
function chop(t, per, off = 0) {
  const u = (((t + off) / per) % 1 + 1) % 1; let e;
  if (u < 0.45) e = 1 - eio(u / 0.45); else if (u < 0.58) e = 0; else if (u < 0.7) e = ((u - 0.58) / 0.12) ** 2; else e = 1 - Math.sin((u - 0.7) / 0.3 * Math.PI) * 0.06;
  return [e, u];
}
/** clods of earth thrown after a strike (lt since strike) */
function clods(x, y, lt, seed, n = 9, dir = 1) {
  if (lt < 0 || lt > 1.1) return; ctx.fillStyle = INK;
  for (let i = 0; i < n; i++) { const vx = (rnd(seed + i) * 180 + 40) * dir * (rnd(i * 3 + seed) > 0.3 ? -1 : 1), vy = -(200 + rnd(seed + i * 5) * 260), xx = x + vx * lt, yy = y + vy * lt + 900 * lt * lt; if (yy > y + 30) continue; const r = 3 + rnd(i * 7 + seed) * 6; ctx.beginPath(); ctx.ellipse(xx, yy, r, r * 0.8, i, 0, TAU); ctx.fill(); }
}

// ───────────── gold grain ─────────────
function grainSprite() {
  return cached('a-grain', 16, 10, 3, () => { ctx.translate(8, 5); ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 3.6, 0, 0, TAU); ctx.fillStyle = lg(0, -4, 0, 4, [[0, GOLDH], [0.45, GOLD], [1, GOLDD]]); ctx.fill(); ctx.fillStyle = 'rgba(255,250,220,0.8)'; ctx.beginPath(); ctx.ellipse(-1.5, -1.4, 2.4, 0.9, -0.1, 0, TAU); ctx.fill(); });
}
function grain(x, y, rot, s = 1, a = 1) { const g = grainSprite(); ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(g, -8 * s, -5 * s, 16 * s, 10 * s); ctx.restore(); }
/** a cached heap of grain: base centre (300, 300), half-width 280 */
function heapImg() {
  return cached('a-heap', 600, 330, 1.2, () => {
    const mound = () => { ctx.beginPath(); ctx.moveTo(20, 300); ctx.bezierCurveTo(90, 270, 190, 120, 285, 108); ctx.quadraticCurveTo(300, 104, 315, 108); ctx.bezierCurveTo(410, 120, 510, 270, 580, 300); ctx.closePath(); };
    mound(); ctx.fillStyle = lg(150, 100, 450, 320, [[0, '#F3C866'], [0.5, '#C9952F'], [1, '#6E4A12']]); ctx.fill();
    ctx.save(); mound(); ctx.clip();
    for (let i = 0; i < 2600; i++) { const x = 20 + rnd(i * 1.3) * 560, y = 100 + rnd(i * 2.7) * 205, sh = clamp((x - 160) / 420 + (y - 100) / 500); const g = grainSprite(); ctx.globalAlpha = 0.95; ctx.save(); ctx.translate(x, y); ctx.rotate(rnd(i * 4.1) * TAU); const k = 0.9 + rnd(i) * 0.5; ctx.drawImage(g, -8 * k, -5 * k, 16 * k, 10 * k); ctx.fillStyle = `rgba(60,30,5,${sh * 0.55})`; ctx.fillRect(-8 * k, -5 * k, 16 * k, 10 * k); ctx.restore(); }
    ctx.globalAlpha = 1; ctx.fillStyle = lg(0, 100, 0, 300, [[0, 'rgba(255,240,190,0.25)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(40,20,4,0.4)']]); ctx.fillRect(0, 0, 600, 330);
    ctx.restore();
    for (let i = 0; i < 60; i++) { const x = 10 + rnd(i * 9.1) * 580; grain(x, 298 + rnd(i * 3.3) * 14, rnd(i) * TAU, 1, 0.9); }
  });
}
/** heap at base (x, y) with half-width r; glints animate with t */
function heap(x, y, r, t, seed = 0, a = 1) {
  if (r < 2) return; const s = r / 280;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(10,5,2,0.45)'; ctx.beginPath(); ctx.ellipse(x + r * 0.08, y + 4, r * 1.12, r * 0.12, 0, 0, TAU); ctx.fill();
  blit(heapImg(), 300, 300, x, y, s);
  for (let i = 0; i < 6; i++) { const ph = (t * 0.7 + rnd(seed + i)) % 1, k = Math.sin(ph * Math.PI) ** 8; if (k < 0.05) continue; const u = rnd(seed + i * 3) - 0.5, gx = x + u * r * 1.2, gy = y - (1 - Math.abs(u) * 1.8) * r * 0.62 * rnd(seed + i * 5); glint(gx, gy, 14 * k * Math.max(0.6, s)); }
  ctx.restore();
}
function glint(x, y, r) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(255,248,215,0.95)'; for (const a of [0, Math.PI / 2]) { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -r * 0.12, r, 0); ctx.quadraticCurveTo(0, r * 0.12, -r, 0); ctx.fill(); ctx.restore(); } ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, TAU); ctx.fill(); ctx.restore(); }
/** a falling stream of grains from y0 to y1 at x; rate grains/s; active between t0 and t1 */
function pour(x, y0, y1, t, t0, t1, rate = 60, seed = 0, spread = 10) {
  const g = 2400, T = Math.sqrt(2 * (y1 - y0) / g);
  for (let i = 0; ; i++) {
    const birth = t0 + i / rate; if (birth > t1 || birth > t) break; const age = t - birth; if (age > T) continue;
    const yy = y0 + 0.5 * g * age * age, xx = x + (rnd(i * 1.7 + seed) - 0.5) * spread * (0.4 + age / T);
    grain(xx, yy, rnd(i + seed) * TAU + age * 8, 1.15);
  }
}
function coin(x, y, r, spin, t) {
  const sx = Math.max(0.08, Math.abs(Math.cos(spin)));
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
  ctx.fillStyle = '#6E4A12'; ctx.beginPath(); ctx.arc(0, 4, r, 0, TAU); ctx.fill();
  ctx.fillStyle = lg(-r, -r, r, r, [[0, GOLDH], [0.45, GOLD], [1, GOLDD]]); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(110,70,15,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, TAU); ctx.stroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.fillStyle = 'rgba(110,70,15,0.6)'; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, 1.8, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(110,70,15,0.75)'; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, r * 0.16, r * 0.07, a, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, 0, r * 0.14, 0, TAU); ctx.fill();
  ctx.restore();
}

// ───────────── ground scene (grain on dry earth under the lamp) ─────────────
const groundImg = () => crackTex('a-ground', W + 300, H + 300, 118, ['#8E5E3A', '#7A4E2E', '#1E130C', '#C08A58'], { q: 0.5, cw: 4.2, seed: 9 });
function ground(t, o = {}) {
  const f = fl(t), lx = o.lx ?? 540, ly = o.ly ?? 820;
  blit(groundImg(), 150, 150, 0, 0);
  const g = ctx.createRadialGradient(lx, ly, 40, lx, ly, 1150 + f * 20);
  g.addColorStop(0, `rgba(255,214,150,${0.18 + 0.03 * f})`); g.addColorStop(0.35, 'rgba(60,35,18,0.25)'); g.addColorStop(0.75, 'rgba(30,19,12,0.82)'); g.addColorStop(1, 'rgba(18,11,7,0.97)');
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.fillStyle = lg(0, 1260, 0, 1560, [[0, 'rgba(18,11,7,0)'], [0.3, 'rgba(18,11,7,0.4)'], [0.7, 'rgba(18,11,7,0.4)'], [1, 'rgba(18,11,7,0)']]); ctx.fillRect(-300, 1260, W + 600, 300);
}

// ───────────── crack-spread transition ─────────────
const SC = 6, SR = 10;
const SP = (() => { const P = []; for (let j = 0; j <= SR; j++) { const row = []; for (let i = 0; i <= SC; i++) { const ex = i === 0 || i === SC, ey = j === 0 || j === SR; row.push([i * W / SC + (ex ? 0 : (rnd(i * 13.1 + j * 3.7) - 0.5) * 120), j * H / SR + (ey ? 0 : (rnd(i * 5.3 + j * 17.9) - 0.5) * 120)]); } P.push(row); } return P; })();
function jag(a, b, seed) { const pts = [a]; for (let k = 1; k < 6; k++) { const u = k / 6; pts.push([lerp(a[0], b[0], u) + (rnd(seed + k) - 0.5) * 26, lerp(a[1], b[1], u) + (rnd(seed + k * 2.3) - 0.5) * 26]); } pts.push(b); return pts; }
const EDGES = (() => { const E = []; for (let j = 0; j <= SR; j++) for (let i = 0; i <= SC; i++) { if (i < SC && j > 0 && j < SR) E.push(jag(SP[j][i], SP[j][i + 1], i * 31 + j * 7)); if (j < SR && i > 0 && i < SC) E.push(jag(SP[j][i], SP[j + 1][i], i * 11 + j * 41 + 500)); } return E; })();
/** cracks race out from (ox, oy): k = 0..1. Drawn in screen space. */
function crackRace(k, ox = 540, oy = 760) {
  if (k <= 0) return; const R = eio(k) * 1500;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const e of EDGES) {
    const d0 = Math.hypot(e[0][0] - ox, e[0][1] - oy), d1 = Math.hypot(e[e.length - 1][0] - ox, e[e.length - 1][1] - oy), near = d0 < d1 ? e : [...e].reverse(), dn = Math.min(d0, d1), len = 260;
    const f = clamp((R - dn) / len); if (f <= 0) continue; const n = Math.max(1, Math.round(f * (near.length - 1))), pts = near.slice(0, n + 1);
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = 'rgba(246,217,160,0.35)'; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 3.5 + f * 2.5; ctx.stroke();
  }
  ctx.restore();
}
/** snapshot of a shot's final frame (with its camera), cached */
function snap(sh, tEnd) {
  return cached('snap:' + sh.id, W, H, 1, () => {
    const d = tEnd - sh.at, lt = d - 1e-3, [cx, cy] = sh.cam || [540, 900], z = 1 + (sh.zoom ?? 0.06) * eio(clamp(lt / d));
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); sh.draw(lt, d, tEnd - 1e-3); ctx.restore();
  });
}
/** shards of the previous frame fall away (lt = time into the new shot) */
function shardsFall(img, lt, ox = 540, oy = 760) {
  if (lt > 1.3) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let j = 0; j < SR; j++) for (let i = 0; i < SC; i++) {
    const q = [SP[j][i], SP[j][i + 1], SP[j + 1][i + 1], SP[j + 1][i]], cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4;
    const dl = Math.hypot(cx - ox, cy - oy) / 1500 * 0.45 + rnd(i * 3 + j * 7) * 0.08, tt = Math.max(0, lt - dl);
    const dy = 2600 * tt * tt + tt * 120, dx = (cx - ox) * tt * 0.5, rot = (rnd(i + j * 9) - 0.5) * 3 * tt, sc = 1 - tt * 0.18;
    if (cy - 120 + dy > H + 100) continue;
    ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
    if (tt > 0) { ctx.save(); ctx.translate(10, 18); poly(q); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); ctx.restore(); }
    poly(q); ctx.save(); ctx.clip(); ctx.drawImage(img, 0, 0, W, H); ctx.restore();
    poly(q); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────── SHOTS ─────────────
// a1 · hook: diggers in a trench on the lamp-lit screen; CHENNAI · 1877
function shotHook(lt, d, t) {
  const gy = 1050;
  screen(t, { ly: 720 });
  shadows(t, (soft) => {
    ctx.fillStyle = INK;
    // ground in cross-section with the trench notch and spoil heaps on both banks
    ctx.beginPath(); ctx.moveTo(SX0 - 20, SY1 + 20); ctx.lineTo(SX0 - 20, gy);
    ctx.bezierCurveTo(120, gy - 4, 150, gy - 70, 200, gy - 74); ctx.bezierCurveTo(240, gy - 76, 250, gy - 10, 262, gy);
    ctx.lineTo(280, gy + 8); ctx.lineTo(300, 1200); ctx.lineTo(780, 1204); ctx.lineTo(800, gy + 8);
    ctx.lineTo(818, gy); ctx.bezierCurveTo(840, gy - 10, 860, gy - 92, 912, gy - 94); ctx.bezierCurveTo(960, gy - 92, 990, gy - 6, SX1 + 20, gy); ctx.lineTo(SX1 + 20, SY1 + 20); ctx.closePath(); ctx.fill();
    if (!soft) { const hp = []; for (let i = 0; i < 26; i++) hp.push([SX0 + 20 + rnd(i * 3.3) * 900, gy + 30 + rnd(i * 1.9) * 160, 1.5 + rnd(i) * 2]); holes(hp.filter((p) => p[0] < 290 || p[0] > 800 || p[1] > 1215), 2, 0.45); }
    // three diggers inside the trench, out of phase
    [[380, 1.05, 0.0], [540, 1.12, 0.47], [700, 1.0, 0.23]].forEach(([x, per, off], k) => {
      const [e] = chop(t, per, off), P = digPose(e, t, k), dir = k === 1 ? -1 : 1;
      puppet({ x, y: 1200, s: 1.22, dir, t, ph: k, thin: true, stickTo: SY1 + 30, ...P });
      // clods after each strike
      const u = (((t + off) / per) % 1 + 1) % 1, since = (u - 0.7) * per;
      clods(x + dir * 120, 1180, since, Math.floor((t + off) / per) * 17 + k, 7, -dir);
    });
    // a basket carrier walking along the right bank
    walker(940 - t * 40, gy - 2, 0.82, t, -1, 2, 'basket');
  });
  frame(t);
  motes(t, 46, 3);
  wb('CHENNAI · 1877', 540, 330, 92, INK, seg(t, TM.chennai - 0.12, TM.chennai + 0.25));
  note('then called Madras', 540, 418, 40, 'rgba(18,11,7,0.8)', seg(t, TM.chennai + 0.35, TM.chennai + 0.8));
  wb('DUG BY HUNGER', 540, 1800, 58, BONE, seg(t, TM.dug - 0.05, TM.dug + 0.3), { a: 0.92 });
}
/** a walking worker; carry = 'basket' | 'hoe' */
function walker(x, y, s, t, dir, ph, carry) {
  const sp = t * 5.2 + ph, a = Math.sin(sp), b = Math.cos(sp);
  const feet = [[-a * 26, -Math.max(0, b) * 12], [a * 26, -Math.max(0, -b) * 12]];
  const hip = [0, -140 + Math.abs(a) * 4];
  const o = { x, y, s, dir, t, ph, feet, hip, lean: 0.08, stickTo: SY1 + 30, thin: true };
  if (carry === 'basket') { o.hands = [[-14 + a * 12, -60], [6, -276 + Math.abs(a) * 4]]; o.elbowUp = false; o.tool2 = () => basket(4, -262 + Math.abs(a) * 4); }
  else { o.hands = [[-6 + a * 14, -40], [22, -214]]; o.tool = () => { ctx.save(); hoe([22, -214], -Math.PI * 0.9, 150); ctx.restore(); }; }
  puppet(o);
}
// a2 · "who were starving": one thin puppet tips an empty bowl, the lamp sinks
function shotStarving(lt, d, t) {
  const dim = 0.25 * eio(seg(lt, 0.4, d));
  screen(t, { ly: 640, dim });
  shadows(t, (soft) => {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(SX0 - 20, SY1 + 20); ctx.lineTo(SX0 - 20, 1190); ctx.quadraticCurveTo(540, 1160, SX1 + 20, 1196); ctx.lineTo(SX1 + 20, SY1 + 20); ctx.closePath(); ctx.fill();
    tree(860, 1196, 1.25, t);
    const tip = eio(seg(t, TM.starving - 0.4, TM.starving + 0.5)), sway = Math.sin(t * 1.4) * 0.02;
    const bowlA = -tip * 0.9;
    const hb = [62, -196 + tip * 10];
    puppet({ x: 380, y: 1196, s: 2.25, t, thin: true, lean: 0.16 + sway, tilt: 0.32, hip: [0, -136], feet: [[-14, 0], [24, 0]],
      hands: [[hb[0] - 26, hb[1] + 4], [hb[0] + 22, hb[1] + 2]], stickTo: SY1 + 30,
      tool2: () => { ctx.save(); ctx.translate(hb[0], hb[1] - 6); ctx.rotate(bowlA); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-40, -14); ctx.quadraticCurveTo(-36, 22, 0, 24); ctx.quadraticCurveTo(36, 22, 40, -14); ctx.closePath(); ctx.fill(); ctx.fillRect(-44, -18, 88, 6); holes([[-18, 4, 2.2], [0, 8, 2.2], [18, 4, 2.2]], 2.2, 0.7); ctx.restore(); } });
    // a little dust (not grain) trickles from the empty bowl
    if (!soft) for (let i = 0; i < 26; i++) { const b = TM.starving - 0.1 + i * 0.04, age = t - b; if (age < 0 || age > 0.8) continue; ctx.fillStyle = `rgba(18,11,7,${0.75 * (1 - age / 0.8)})`; ctx.beginPath(); ctx.arc(380 + 2.25 * 115 + (rnd(i) - 0.5) * 18 + age * 20, 1196 - 2.25 * 196 + 0.5 * 1800 * age * age, 2 + rnd(i * 3) * 2.5, 0, TAU); ctx.fill(); }
  }, { ly: 640 });
  frame(t);
  motes(t, 34, 8);
  crackRace(seg(lt, d - 0.5, d), 540, 760);
}
/** a withered tree, leather-cut */
function tree(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.bezierCurveTo(-10, -100, -26, -180, -6, -260); ctx.lineTo(8, -260); ctx.bezierCurveTo(0, -170, 14, -100, 18, 0); ctx.closePath(); ctx.fill();
  const br = (x0, y0, a, l, w, dpt) => { if (dpt > 4) return; const sw = Math.sin(t * 1.1 + dpt + x0 * 0.01) * 0.02; const x1 = x0 + Math.sin(a + sw) * l, y1 = y0 - Math.cos(a + sw) * l; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); br(x1, y1, a - 0.45 - rnd(dpt + x0) * 0.2, l * 0.7, w * 0.62, dpt + 1); br(x1, y1, a + 0.4 + rnd(dpt * 3 + y0) * 0.2, l * 0.66, w * 0.62, dpt + 1); };
  br(0, -250, -0.15, 90, 13, 0); br(-4, -170, -0.9, 70, 9, 1); br(6, -200, 0.9, 64, 9, 1);
  holes([[0, -60, 2.4], [2, -100, 2.4], [-2, -140, 2.4], [4, -30, 2.4]], 2.4, 0.6);
  ctx.restore();
}
// a3 · 1876, the monsoon failed: pale empty sky, sun disk, cracked earth spreading
function shotDrought(lt, d, t) {
  const hz = 1000, f = fl(t);
  ctx.fillStyle = lg(0, 0, 0, hz, [[0, '#E9D9B8'], [0.6, '#F2E6CC'], [1, '#E4C9A0']]); ctx.fillRect(-300, -300, W + 600, hz + 300);
  // sun disk with heat rings
  const sx = 760, sy = 470, pul = 1 + 0.02 * Math.sin(t * 3);
  for (let i = 4; i >= 1; i--) { ctx.fillStyle = `rgba(255,246,222,${0.12 + 0.02 * i})`; ctx.beginPath(); ctx.arc(sx, sy, (90 + i * 46 + Math.sin(t * 2 + i) * 6) * pul, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#FFF8E8'; ctx.beginPath(); ctx.arc(sx, sy, 100 * pul, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(160,110,60,0.25)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { const r = ((t * 60 + i * 110) % 330) + 110; ctx.globalAlpha = 1 - (r - 110) / 330; ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.stroke(); } ctx.globalAlpha = 1;
  // distant horizon: withered trees and a dry tank bund, leather-cut silhouettes
  ctx.fillStyle = mixc(DUST, '#E4C9A0', 0.35); ctx.beginPath(); ctx.moveTo(-300, hz); ctx.bezierCurveTo(100, hz - 40, 300, hz - 30, 520, hz - 10); ctx.bezierCurveTo(700, hz - 30, 900, hz - 46, 1380, hz); ctx.fill();
  ctx.save(); ctx.globalAlpha = 0.85; tree(170, hz + 6, 0.62, t); tree(330, hz - 2, 0.4, t + 1); tree(980, hz + 4, 0.5, t + 2); ctx.restore();
  // cracked earth in perspective: smooth dust first, then the cracks race outward
  const src = crackTex('a-dry', 2400, 2400, 72, ['#B07A4C', '#9A6840', '#2A170C', '#D9A877'], { q: 0.5, cw: 4.2, seed: 21 });
  const srcS = crackTex('a-drys', 2400, 2400, 72, ['#B07A4C', '#9A6840', '#2A170C', '#D9A877'], { q: 0.5, cw: 4.2, seed: 21, smooth: true });
  const pc = perspTex('a-dryP', src, 2400, 2400, 940), ps = perspTex('a-drysP', srcS, 2400, 2400, 940);
  blit(ps, 0, 0, -60, hz, 1.12, 1, 1);
  const k = eo(seg(lt, 0.15, TM.failed - TM.a3 + 0.7));
  ctx.save(); ctx.beginPath(); const cx = 540, cy = 1320, Rr = k * 1400;
  for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, j = 1 + 0.18 * (rnd(i * 3.1) - 0.5) + 0.12 * Math.sin(a * 5 + t); ctx.lineTo(cx + Math.cos(a) * Rr * j, cy + Math.sin(a) * Rr * j * 0.55); }
  ctx.closePath(); ctx.clip(); blit(pc, 0, 0, -60, hz, 1.12, 1, 1); ctx.restore();
  ctx.fillStyle = lg(0, hz, 0, hz + 140, [[0, 'rgba(228,201,160,0.85)'], [1, 'rgba(228,201,160,0)']]); ctx.fillRect(-300, hz, W + 600, 140);
  ctx.fillStyle = lg(0, 1280, 0, 1540, [[0, 'rgba(30,19,12,0)'], [0.3, 'rgba(30,19,12,0.45)'], [0.7, 'rgba(30,19,12,0.45)'], [1, 'rgba(30,19,12,0.1)']]); ctx.fillRect(-300, 1280, W + 600, 260);
  ctx.fillStyle = lg(0, 1600, 0, H, [[0, 'rgba(30,19,12,0)'], [1, 'rgba(30,19,12,0.65)']]); ctx.fillRect(-300, 1600, W + 600, 620);
  // heat shimmer dust
  motes(t, 30, 13, [0, 700, W, 1250], '255,240,210', 0.5);
  wb('1876', 300, 400, 190, INK, seg(t, TM.e1876 - 0.1, TM.e1876 + 0.3), { rot: -0.03 });
  note('no rain came', 300, 525, 46, 'rgba(18,11,7,0.78)', seg(t, TM.failed - 0.05, TM.failed + 0.4));
  // a dust devil crossing the near field
  dustDevil(lerp(-80, 1150, seg(lt, 0, d)), 1780, t, 0.9);
  shardsFall(snap(TM.s2, TM.a3), lt, 540, 760);
}
function dustDevil(x, y, t, s = 1, col = '214,170,120') {
  for (let i = 0; i < 26; i++) { const h = i / 26, r = (16 + h * 110) * s, a = t * 6 + i * 0.9, xx = x + Math.cos(a) * r + Math.sin(t * 2 + h * 4) * 20 * s, yy = y - h * 360 * s + Math.sin(a) * r * 0.2; ctx.fillStyle = `rgba(${col},${0.22 * (1 - h * 0.6)})`; ctx.beginPath(); ctx.arc(xx, yy, (10 + h * 24) * s, 0, TAU); ctx.fill(); }
}
// a4 · famine spreads across a stylised Madras Presidency, mapped in the dust
const PENIN = [[150, 230], [190, 420], [225, 600], [275, 780], [330, 940], [400, 1075], [470, 1170], [540, 1235], [575, 1200], [615, 1100], [655, 985], [682, 880], [694, 790], [722, 690], [784, 600], [866, 500], [936, 380], [990, 230]];
const PRES = [[880, 230], [990, 230], [936, 380], [866, 500], [784, 600], [722, 690], [694, 790], [682, 880], [655, 985], [615, 1100], [575, 1200], [540, 1235], [470, 1170], [400, 1075], [330, 940], [275, 780], [250, 690], [300, 700], [360, 830], [430, 850], [470, 760], [550, 650], [640, 530], [748, 430], [828, 320]];
function shotMap(lt, d, t) {
  const bg = crackTex('a-mapdust', W + 300, H + 300, 46, ['#A8744A', '#9A6A42', '#5A3A22', '#C8966A'], { q: 0.5, cw: 2.2, seed: 33 });
  blit(bg, 150, 150, 0, 0);
  const f = fl(t), g = ctx.createRadialGradient(560, 720, 60, 560, 720, 1250); g.addColorStop(0, `rgba(255,220,160,${0.16 + 0.02 * f})`); g.addColorStop(0.6, 'rgba(40,24,12,0.25)'); g.addColorStop(1, 'rgba(18,11,7,0.9)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  // sea side wash (east), dark
  const draw = eio(seg(lt, 0, 0.9));
  // sea: darker wash outside the peninsula (land is lighter dust); Sri Lanka
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, H + 600); [...PENIN, [990, -300], [150, -300]].forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = `rgba(30,19,12,${0.5 * draw})`; ctx.fill('evenodd'); ctx.restore();
  ctx.save(); poly([...PENIN, [990, -300], [150, -300]]); ctx.fillStyle = `rgba(255,225,170,${0.1 * draw})`; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.ellipse(640, 1268, 34, 52, 0.25, 0, TAU); ctx.fillStyle = `rgba(168,116,74,${draw})`; ctx.fill(); ctx.strokeStyle = `rgba(30,18,10,${0.9 * draw})`; ctx.lineWidth = 4; ctx.stroke();
  // coast ripples in the sea
  ctx.strokeStyle = `rgba(200,160,110,${0.18 * draw})`; ctx.lineWidth = 2; for (let i = 1; i <= 3; i++) { ctx.beginPath(); PENIN.forEach((p, j) => { const sx = p[0] < 560 ? -1 : 1, x = p[0] + sx * i * 22, y = p[1] + i * 10 + Math.sin(t * 1.5 + j + i) * 3; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); }
  // peninsula outline drawn as a groove in the dust
  const pathTo = (pts, k) => { const n = (pts.length - 1) * k, m = Math.floor(n); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= m; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (m < pts.length - 1) { const u = n - m; ctx.lineTo(lerp(pts[m][0], pts[m + 1][0], u), lerp(pts[m][1], pts[m + 1][1], u)); } };
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // presidency region: darker dust, then famine cracks spread inside it
  const rk = seg(lt, 0.5, 1.2);
  ctx.save(); poly(PRES); ctx.fillStyle = `rgba(58,36,24,${0.32 * rk})`; ctx.fill(); ctx.clip();
  const fk = eo(seg(t, TM.famine - 0.15, TM.famine + 2.6));
  if (fk > 0) {
    const cr = crackTex('a-mapcrack', W + 300, H + 300, 44, ['#6E4428', '#5A3820', '#120B07', '#A8744A'], { q: 0.5, cw: 4.4, seed: 34 });
    ctx.beginPath(); for (const [sx, sy, dl] of [[640, 640, 0], [480, 980, 0.15], [820, 420, 0.3], [380, 860, 0.45]]) { const r = Math.max(0, fk - dl) * 900; for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU, j = 1 + 0.25 * (rnd(i * 2.1 + sx) - 0.5); const x = sx + Math.cos(a) * r * j, y = sy + Math.sin(a) * r * j; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); }
    ctx.save(); ctx.clip(); blit(cr, 150, 150, 0, 0); ctx.fillStyle = 'rgba(18,11,7,0.25)'; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  ctx.restore();
  ctx.save(); poly(PRES); ctx.strokeStyle = `rgba(18,11,7,${0.55 * rk})`; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  pathTo(PENIN, draw); ctx.strokeStyle = 'rgba(240,210,160,0.35)'; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = 'rgba(30,18,10,0.95)'; ctx.lineWidth = 6; ctx.stroke();
  // Madras city on the coast
  const mk = Math.max(0, eob(seg(t, TM.madras - 0.1, TM.madras + 0.3)));
  if (mk > 0.01) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(694, 790, 13 * mk, 0, TAU); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(694, 790, Math.max(1, 26 * mk + Math.sin(t * 4) * 2), 0, TAU); ctx.stroke(); note('Madras', 735, 790, 44, INK, mk, { align: 'left' }); }
  // a dust devil sweeping across the map
  dustDevil(lerp(1150, -150, seg(lt, 0, d)), 1150, t, 0.7, '220,180,130');
  motes(t, 36, 21, [0, 0, W, 1280], '255,225,170', 0.45);
  wb('MADRAS', 540, 330, 112, INK, seg(t, TM.madras - 0.12, TM.madras + 0.25), { rot: -0.02 });
  wb('PRESIDENCY', 540, 440, 76, INK, seg(t, TM.presidency - 0.1, TM.presidency + 0.25), { rot: 0.015 });
  wb('FAMINE', 300, 1100, 84, BONE, seg(t, TM.famine, TM.famine + 0.35), { rot: -0.06, shadow: true });
  note('stylised, not to scale', 830, 1225, 32, 'rgba(18,11,7,0.75)', seg(lt, 1, 1.6));
  crackRace(seg(lt, d - 0.5, d), 540, 900);
}
// a5 · millions died: a heap of grain drains into a widening fissure
function shotDrain(lt, d, t) {
  ground(t, { ly: 760 });
  const k = eio(seg(t, TM.millions - 0.2, TM.a6)), r = lerp(300, 90, k), hx = 540, hy = 930;
  // fissure opening under the heap
  const fo = eo(seg(t, TM.millions - 0.5, TM.millions + 0.4));
  ctx.save(); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-40, 1060); for (let i = 0; i <= 24; i++) { const x = -40 + i * 48, w = fo * (8 + 26 * Math.sin(i / 24 * Math.PI)) * (0.7 + rnd(i) * 0.6); ctx.lineTo(x, 1060 + (rnd(i * 3) - 0.5) * 30 - w); } for (let i = 24; i >= 0; i--) { const x = -40 + i * 48, w = fo * (8 + 26 * Math.sin(i / 24 * Math.PI)) * (0.7 + rnd(i + 9) * 0.6); ctx.lineTo(x, 1060 + (rnd(i * 3) - 0.5) * 30 + w); } ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(200,150,100,0.4)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  heap(hx, hy, r, t, 5);
  // grains sliding off the heap and into the fissure
  for (let i = 0; i < 90; i++) {
    const ph = (t * 0.9 + rnd(i * 1.3)) % 1, side = rnd(i * 2.1) > 0.5 ? 1 : -1, x0 = hx + side * r * (0.3 + rnd(i) * 0.6), x1 = hx + side * (r * 0.5 + rnd(i * 5) * 280);
    if (k <= 0.02 && fo <= 0) continue; const a = clamp(fo * 1.4) * Math.sin(ph * Math.PI);
    const x = lerp(x0, x1, ph), y = lerp(hy - 4, 1060, eio(ph)) + Math.sin(ph * Math.PI) * -10; grain(x, y, i + ph * 6, 1.1, a);
  }
  for (let i = 0; i < 4; i++) pour(380 + i * 110, 1050, 1300, t, TM.millions - 0.3 + i * 0.07, TM.a6, 22, i * 50, 24);
  motes(t, 40, 31, [0, 200, W, 1250], '255,225,170', 0.5);
  wb('MILLIONS', 540, 360, 150, BONE, seg(t, TM.millions - 0.1, TM.millions + 0.28), { shadow: true });
  note('died across India', 540, 480, 46, 'rgba(239,228,204,0.85)', seg(t, TM.died - 0.05, TM.died + 0.4));
  note('each grain, many lives', 540, 1834, 36, 'rgba(239,228,204,0.55)', seg(t, TM.died + 0.3, TM.died + 0.9));
}
// a6 · estimates 5 → 9 million: two poured heaps, both labelled with a question mark
function shotEstimate(lt, d, t) {
  ground(t, { ly: 840 });
  const by = 1040, k5 = eo(seg(t, TM.five - 0.3, TM.five + 0.9)), k9 = eo(seg(t, TM.nine - 0.4, TM.nine + 1.1));
  pour(280, -40, by - 20 - 170 * 0.55 * k5, t, TM.five - 0.55, TM.five + 0.8, 70, 11, 14);
  pour(740, -40, by - 20 - 280 * 0.55 * k9, t, TM.nine - 0.65, TM.nine + 1.0, 90, 23, 18);
  heap(280, by, 170 * Math.sqrt(k5) + 4, t, 41);
  heap(740, by, 280 * Math.sqrt(k9) + 4, t, 57);
  // range arrow between them
  const ak = eio(seg(t, TM.over - 0.3, TM.nine + 0.2));
  if (ak > 0) { ctx.save(); ctx.strokeStyle = 'rgba(239,228,204,0.8)'; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.beginPath(); const p = (u) => [lerp(300, 700, u), lerp(900, 820, u) - Math.sin(u * Math.PI) * 170]; ctx.moveTo(...p(0)); for (let i = 1; i <= 30 * ak; i++) ctx.lineTo(...p(i / 30)); ctx.stroke(); ctx.setLineDash([]); if (ak > 0.95) { const [ex, ey] = p(1); ctx.fillStyle = 'rgba(239,228,204,0.85)'; ctx.beginPath(); ctx.moveTo(ex + 14, ey + 8); ctx.lineTo(ex - 18, ey - 6); ctx.lineTo(ex - 4, ey + 24); ctx.fill(); } ctx.restore(); }
  wb('5 MILLION?', 240, 1125, 54, BONE, seg(t, TM.five - 0.05, TM.five + 0.3), { rot: -0.03, shadow: true });
  wb('9 MILLION?', 740, 1195, 74, GOLD, seg(t, TM.nine - 0.05, TM.nine + 0.3), { rot: 0.025, shadow: true });
  wb('ESTIMATES', 540, 330, 118, BONE, seg(t, TM.estimates - 0.1, TM.estimates + 0.25), { shadow: true });
  note('estimates, all India · no firm count', 540, 1275, 38, 'rgba(239,228,204,0.8)', seg(t, TM.nine + 0.4, TM.nine + 0.9));
  // bracket under the two heaps
  motes(t, 40, 37, [0, 200, W, 1250], '255,225,170', 0.5);
}
// a7 · relief came with a condition: a leather notice rises on sticks, the queue waits
function shotNotice(lt, d, t) {
  const up = eob(seg(lt, 0.05, 0.75)), by = lerp(1500, 640, up), sw = Math.sin(t * 2.2) * 0.025 * (1 - up * 0.5);
  screen(t, { ly: 640, dim: 0.1 * (1 - seg(lt, 0, 0.5)) });
  shadows(t, (soft) => {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(SX0 - 20, SY1 + 20); ctx.lineTo(SX0 - 20, 1210); ctx.quadraticCurveTo(540, 1190, SX1 + 20, 1214); ctx.lineTo(SX1 + 20, SY1 + 20); ctx.closePath(); ctx.fill();
    // the queue
    for (let i = 0; i < 6; i++) { const x = 150 + i * 150, b = Math.sin(t * 1.5 + i) * 0.03; puppet({ x, y: 1210, s: 0.72, dir: 1, t, ph: i, thin: true, lean: 0.14 + b, tilt: 0.35, feet: [[-12, 0], [18, 0]], hands: [[0, -40], [14, -44]], stickTo: SY1 + 30 }); }
    // notice board on two sticks
    ctx.save(); ctx.translate(540, by); ctx.rotate(sw);
    ctx.fillStyle = INK; ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-200, 200); ctx.lineTo(-230, 1400); ctx.moveTo(200, 200); ctx.lineTo(240, 1400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-330, -230); ctx.lineTo(-300, -260); ctx.lineTo(300, -260); ctx.lineTo(330, -230); ctx.lineTo(330, 230); ctx.lineTo(300, 260); ctx.lineTo(-300, 260); ctx.lineTo(-330, 230); ctx.closePath(); ctx.fill();
    if (!soft) {
      const hp = []; for (let i = 0; i < 30; i++) { hp.push([-300 + i * 600 / 29, -232, 3]); hp.push([-300 + i * 600 / 29, 232, 3]); } for (let i = 0; i < 16; i++) { hp.push([-302, -200 + i * 400 / 15, 3]); hp.push([302, -200 + i * 400 / 15, 3]); } holes(hp, 3, 0.85);
      for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + t * 0.3; holes([[sx * 255 + Math.cos(a) * 14, -185 + Math.sin(a) * 14, 3.5]], 3.5, 0.8); }
      const kw = 1 + 0.04 * Math.sin(t * 6) * seg(t, TM.condition, TM.condition + 0.6);
      wb('RELIEF', 0, -175, 56, GLOW, 1, { a: 0.95 });
      wb('WORK', 0, -40, 168, GLOW, 1, { sc: kw });
      wb('FOR FOOD', 0, 120, 100, GLOW, 1);
    }
    ctx.restore();
  }, { ly: 640 });
  frame(t);
  motes(t, 38, 41);
  // light leaking through the cut letters onto the floor
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540, by - 40, 20, 540, by - 40, 420); g.addColorStop(0, `rgba(246,200,130,${0.12 * up})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  note('a condition', 540, 1834, 44, 'rgba(239,228,204,0.75)', seg(t, TM.condition, TM.condition + 0.5));
}
// a8 · to be fed you had to work: a digger swings once; only then the bowl of grain comes to him
function shotWork(lt, d, t) {
  screen(t, { ly: 680 });
  const raise = eio(seg(t, TM.to - 0.05, TM.work - 0.4)), strike = seg(t, TM.work - 0.24, TM.work) ** 2;
  const e = t < TM.work - 0.24 ? 1 - raise : strike;
  const bowlIn = eo(seg(t, TM.fed - 0.35, TM.fed + 0.35)), give = eio(seg(t, TM.work + 0.25, TM.work + 0.9));
  let bx = lerp(1180, 860, bowlIn), byy = 780 + Math.sin(t * 2.4) * 8; bx = lerp(bx, 700, give); byy = lerp(byy, 860, give);
  shadows(t, (soft) => {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(SX0 - 20, SY1 + 20); ctx.lineTo(SX0 - 20, 1180); ctx.quadraticCurveTo(540, 1160, SX1 + 20, 1186); ctx.lineTo(SX1 + 20, SY1 + 20); ctx.closePath(); ctx.fill();
    const P = digPose(e, t, 0);
    puppet({ x: 340, y: 1180, s: 2.0, t, thin: true, stickTo: SY1 + 30, ...P });
    clods(340 + 2.0 * 110, 1170, t - TM.work, 77, 11, 1);
    // bowl on a stick
    ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(bx, byy + 30); ctx.lineTo(bx + 120, 1400); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(bx - 70, byy - 16); ctx.quadraticCurveTo(bx - 64, byy + 40, bx, byy + 42); ctx.quadraticCurveTo(bx + 64, byy + 40, bx + 70, byy - 16); ctx.closePath(); ctx.fill(); ctx.fillRect(bx - 76, byy - 22, 152, 8);
    if (!soft) holes([[bx - 34, byy + 6, 3], [bx, byy + 14, 3], [bx + 34, byy + 6, 3], [bx - 17, byy + 22, 2.4], [bx + 17, byy + 22, 2.4]], 3, 0.7);
  });
  // the grain in the bowl glows gold through the leather
  if (bowlIn > 0) { ctx.save(); ctx.beginPath(); ctx.ellipse(bx, byy - 22, 64, 34, 0, Math.PI, TAU); ctx.fillStyle = lg(0, byy - 56, 0, byy - 20, [[0, GOLDH], [0.5, GOLD], [1, GOLDD]]); ctx.fill(); ctx.clip(); for (let i = 0; i < 70; i++) grain(bx + (rnd(i) - 0.5) * 120, byy - 24 - rnd(i * 3) * 30, rnd(i * 7) * TAU, 1, 0.9); ctx.restore(); if (give > 0.9) glint(bx + 20, byy - 46, 18 * Math.sin(seg(t, TM.work + 0.8, TM.work + 1.4) * Math.PI)); }
  frame(t);
  motes(t, 40, 51);
  wb('NO WORK, NO FOOD', 540, 300, 72, INK, seg(t, TM.to - 0.05, TM.to + 0.3));
  // flash on the strike
  const fx = 1 - seg(t, TM.work, TM.work + 0.35); if (t >= TM.work && fx > 0) { ctx.fillStyle = `rgba(255,240,200,${0.18 * fx})`; ctx.fillRect(SX0, SY0, SX1 - SX0, SY1 - SY0); }
}
// a9 · early 1877: the relief works, a procession of workers with baskets and hoes
function shotProcession(lt, d, t) {
  screen(t, { ly: 700 });
  shadows(t, (soft) => {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(SX0 - 20, SY1 + 20); ctx.lineTo(SX0 - 20, 1150);
    for (let x = 0; x <= 1100; x += 60) ctx.lineTo(x, 1150 - Math.max(0, Math.sin(x * 0.011 + 1)) * 40 - rnd(x) * 6);
    ctx.lineTo(SX1 + 20, SY1 + 20); ctx.closePath(); ctx.fill();
    // a distant second line of tiny workers (depth)
    ctx.save(); ctx.fillStyle = lg(0, 890, 0, 1060, [[0, 'rgba(18,11,7,0.16)'], [1, 'rgba(18,11,7,0)']]); ctx.beginPath(); ctx.moveTo(SX0 - 20, 1060); ctx.lineTo(SX0 - 20, 930); ctx.bezierCurveTo(300, 880, 700, 940, SX1 + 20, 900); ctx.lineTo(SX1 + 20, 1060); ctx.fill(); ctx.globalAlpha = 0.4;
    for (let i = 0; i < 9; i++) { const x = ((i * 130 + t * 40) % 1300) - 120; walker(x, 920 - Math.sin(x * 0.004) * 12, 0.36, t + i * 0.3, 1, i, i % 2 ? 'basket' : 'hoe'); } ctx.restore();
    for (let i = 0; i < 5; i++) { const x = 1150 - i * 230 - lt * 115; walker(x, 1150, 1.05, t + i * 0.37, -1, i * 1.7, i % 2 ? 'hoe' : 'basket'); }
  });
  frame(t);
  motes(t, 40, 61);
  wb('JAN 1877', 540, 330, 140, INK, seg(t, TM.early - 0.05, TM.early + 0.3), { rot: -0.02 });
  note('the relief works', 540, 450, 44, 'rgba(18,11,7,0.8)', seg(t, TM.e1877b - 0.1, TM.e1877b + 0.4));
}
// a10 · the daily wage was cut: a strike-board slices the heap
function shotCut(lt, d, t) {
  ground(t, { ly: 860 });
  const hx = 540, hy = 1060, R = 270, Hh = R * 0.62, cutY = hy - Hh * 0.42;
  const sw = eio(seg(t, TM.cut - 0.45, TM.cut + 0.05)), bxp = lerp(1250, -300, sw), off = seg(t, TM.cut - 0.25, TM.cut + 0.9);
  // remaining base of the heap
  ctx.save(); ctx.beginPath(); ctx.rect(-300, cutY, W + 600, 800); ctx.clip(); heap(hx, hy, R, t, 71); ctx.restore();
  // the top slides off with the board and tumbles away
  ctx.save(); const tx = lerp(0, -900, eio(off)), ty = 900 * off * off, rot = -off * 0.9;
  ctx.translate(hx + tx, cutY + ty); ctx.rotate(rot); ctx.translate(-hx, -cutY); ctx.globalAlpha = 1 - seg(off, 0.6, 1);
  ctx.beginPath(); ctx.rect(-300, -300, W + 600, cutY + 300); ctx.clip(); heap(hx, hy, R, t, 71); ctx.restore();
  // spilled grains
  for (let i = 0; i < 70; i++) { const st = TM.cut - 0.2 + rnd(i) * 0.4, age = t - st; if (age < 0) continue; const x = lerp(hx + (rnd(i * 3) - 0.5) * 300, -100 - rnd(i) * 300, eio(clamp(age / 1.2))), y = cutY + (rnd(i * 5) - 0.5) * 60 + 600 * age * age; if (y > H) continue; grain(x, y, i + age * 9, 1.2); }
  // strike-board: a dark plank on a puppet stick
  if (sw > 0 && sw < 1) { ctx.save(); ctx.translate(bxp, cutY - 8); ctx.rotate(-0.05); ctx.fillStyle = lg(0, -16, 0, 16, [[0, '#5A3A22'], [1, '#22140B']]); ctx.fillRect(-20, -150, 40, 300); ctx.fillStyle = INK; ctx.fillRect(-4, 150, 8, 800); ctx.restore(); }
  motes(t, 40, 71, [0, 200, W, 1250], '255,225,170', 0.5);
  wb('DAILY RELIEF WAGE', 540, 340, 82, BONE, seg(t, TM.daily - 0.05, TM.daily + 0.3), { shadow: true });
  note('for a man', 540, 440, 44, 'rgba(239,228,204,0.8)', seg(t, TM.man - 0.1, TM.man + 0.35));
  wb('CUT', 760, 720, 170, GOLD, seg(t, TM.cut - 0.02, TM.cut + 0.22), { rot: -0.1, shadow: true });
}
// a11 · one pound of grain and one anna: grains counted onto a puppet palm, a coin lands
function shotWage(lt, d, t) {
  screen(t, { ly: 760 });
  const px = 505, py = 945;                    // palm centre
  const hand = (soft) => {
    ctx.fillStyle = INK;
    // forearm in from the right, open palm cupped up, fingers to the left, thumb raised
    ctx.beginPath(); ctx.moveTo(1120, 1130); ctx.lineTo(1120, 1000); ctx.bezierCurveTo(960, 985, 820, 960, 740, 935);
    ctx.bezierCurveTo(712, 905, 690, 860, 664, 836); ctx.bezierCurveTo(648, 822, 628, 828, 632, 846); ctx.bezierCurveTo(640, 880, 660, 905, 650, 925);
    ctx.bezierCurveTo(560, 938, 470, 940, 410, 922); ctx.bezierCurveTo(380, 912, 362, 890, 350, 878); ctx.quadraticCurveTo(334, 870, 336, 888);
    ctx.bezierCurveTo(346, 930, 380, 962, 440, 980); ctx.bezierCurveTo(560, 1012, 680, 1030, 760, 1040); ctx.bezierCurveTo(900, 1070, 1000, 1110, 1120, 1130); ctx.closePath(); ctx.fill();
    // finger joints as faint creases
    if (!soft) { ctx.strokeStyle = rgba(GLOW, 0.35); ctx.lineWidth = 2; for (const fx of [400, 455]) { ctx.beginPath(); ctx.moveTo(fx, 935 + (fx - 400) * 0.25); ctx.lineTo(fx - 8, 970 + (fx - 400) * 0.2); ctx.stroke(); } }
    if (!soft) { const hp = []; for (const bxx of [780, 810]) for (let i = 0; i < 6; i++) hp.push([bxx, 975 + i * 18 + (bxx - 780) * 0.3, 3]); for (let i = 0; i < 5; i++) hp.push([890 + i * 40, 1035 + i * 4, 2.6]); hp.push([660, 980, 2.4], [700, 990, 2.4], [668, 870, 2]); holes(hp, 3, 0.8); }
    ctx.lineWidth = 3.4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(860, 1050); ctx.lineTo(820, SY1 + 30); ctx.stroke();
  };
  shadows(t, hand, { ly: 760 });
  // grains counted onto the palm (discrete drops) building a small heap
  const k = eo(seg(lt, 0, 2.2));
  heap(px + 10, py - 18, 20 + 105 * Math.sqrt(k), t, 91);
  const t0 = TM.a11 - 0.1;
  for (let i = 0; i < 40; i++) { const b = t0 + i * 0.055, age = t - b; if (age < 0) break; const Tf = 0.42; if (age > Tf) continue; const y = lerp(-20, py - 40 - 60 * k, (age / Tf) ** 2); grain(px + 10 + (rnd(i) - 0.5) * 30, y, rnd(i) * TAU + age * 10, 1.3); }
  // the one-anna coin
  const ca = TM.anna - 0.45, cl = seg(t, ca, ca + 0.4), land = t > ca + 0.4;
  if (t > ca) { const cy = land ? py - 34 - Math.abs(Math.sin((t - ca - 0.4) * 14)) * 30 * Math.exp(-(t - ca - 0.4) * 6) : lerp(-80, py - 34, cl * cl); coin(600, cy - 72, 48, land ? lerp(5.6, TAU * 2, 1 - Math.exp(-(t - ca - 0.4) * 5)) : (t - ca) * 14, t); if (land) glint(598, cy - 98, 22 * Math.sin(seg(t, ca + 0.4, ca + 1) * Math.PI)); }
  frame(t);
  motes(t, 44, 81);
  wb('1 lb GRAIN / DAY', 540, 310, 92, INK, seg(t, TM.pound - 0.08, TM.pound + 0.25), { rot: -0.015 });
  wb('+ 1 ANNA', 760, 740, 64, INK, seg(t, TM.anna - 0.05, TM.anna + 0.3), { rot: 0.03 });
  note('Jan 1877 · a man on relief works', 540, 410, 38, 'rgba(18,11,7,0.8)', seg(t, TM.grain - 0.1, TM.grain + 0.4));
  wb('ONE POUND', 540, 1790, 64, GOLD, seg(t, TM.pound - 0.05, TM.pound + 0.3), { shadow: true });
}

export function buildA(add, cue) {
  Object.assign(TM, {
    chennai: Wd('Chennai', 0), dug: Wd('dug', 0), who: Wd('who', 0), starving: Wd('starving', 0),
    e1876: Wd('eighteen', 1), failed: Wd('failed', 1), famine: Wd('famine', 1), madras: Wd('Madras', 1), presidency: Wd('Presidency', 1),
    millions: Wd('millions', 2), died: Wd('died', 2), estimates: Wd('Estimates', 2), five: Wd('five', 2), over: Wd('over', 2), nine: Wd('nine', 2),
    condition: Wd('condition', 3), to: Wd('To', 3), fed: Wd('fed', 3), work: Wd('work', 3),
    early: Wd('early', 4), e1877b: Wd('seven', 4), daily: Wd('daily', 4), man: Wd('man', 4), cut: Wd('cut', 4), pound: Wd('pound', 4), grain: Wd('grain', 4), anna: Wd('anna', 4),
  });
  TM.a2 = TM.who - 0.15; TM.a3 = L(1) - 0.15; TM.a4 = TM.famine - 0.25; TM.a5 = L(2) - 0.15; TM.a6 = TM.five - 0.35;
  TM.a7 = L(3) - 0.15; TM.a8 = TM.to - 0.15; TM.a9 = L(4) - 0.15; TM.a10 = TM.daily - 0.15; TM.a11 = TM.pound - 0.15;

  add({ id: 'a1', at: 0, cam: [540, 760], zoom: 0.07, note: 'lamp-lit shadow screen: three faceless leather-puppet diggers swing hoes in a cross-section trench, clods fly, basket carrier on the bank; woodblock CHENNAI · 1877, "then called Madras", DUG BY HUNGER on the floor', draw: shotHook });
  cue(0.05, 'swell', { gain: 0.6 }); cue(0.3, 'rumble', { gain: 0.25, dur: 4 }); cue(TM.chennai - 0.1, 'thud', { gain: 0.6 });
  for (const [per, off] of [[1.05, 0], [1.12, 0.47], [1.0, 0.23]]) for (let n = 0; n < 4; n++) { const ts = (n + 0.7) * per - off; if (ts > 0.3 && ts < TM.a2) cue(ts, 'chisel', { gain: 0.28, pan: 0 }); }
  cue(TM.dug, 'drum', { gain: 0.45 });

  TM.s2 = add({ id: 'a2', at: TM.a2, cam: [430, 700], zoom: 0.1, note: 'single thin puppet (perforated ribs) tips an empty bowl, dust trickles, withered tree, lamp dims; cracks race across the frame', draw: shotStarving });
  cue(TM.starving, 'heartbeat', { gain: 0.5 }); cue(TM.a3 - 0.5, 'sizzle', { gain: 0.35, dur: 0.5 });

  TM.s3 = add({ id: 'a3', at: TM.a3, cam: [540, 900], zoom: 0.08, note: 'crack-spread: shards of a2 fall away; pale empty sky, white sun disk with heat rings, withered horizon trees, perspective cracked earth spreading, dust devil; woodblock 1876, "no rain came"', draw: shotDrought });
  cue(TM.a3 + 0.05, 'rumble', { gain: 0.55, dur: 1.2 }); cue(TM.e1876, 'thud', { gain: 0.65 }); cue(TM.failed, 'sizzle', { gain: 0.3, dur: 1.2 });

  TM.s4 = add({ id: 'a4', at: TM.a4, cam: [560, 760], zoom: 0.07, note: 'plan-view map grooved in dust: stylised peninsula, dashed Madras Presidency region, famine cracks spread inside it, Madras dot on the coast, dust devil; woodblock MADRAS / PRESIDENCY, FAMINE, "stylised, not to scale"; cracks race out', draw: shotMap });
  cue(TM.famine, 'whoosh', { gain: 0.5 }); cue(TM.famine + 0.3, 'rumble', { gain: 0.4, dur: 2 }); cue(TM.madras - 0.1, 'thud', { gain: 0.6 }); cue(TM.presidency, 'tock', { gain: 0.4 }); cue(TM.a5 - 0.5, 'sizzle', { gain: 0.35, dur: 0.5 });

  add({ id: 'a5', at: TM.a5, cam: [540, 900], zoom: 0.08, note: 'crack-spread: map shards fall; gold grain heap on lamp-lit cracked earth drains into an opening fissure; woodblock MILLIONS, "died across India"', draw: (lt, d, t) => { shotDrain(lt, d, t); shardsFall(snap(TM.s4, TM.a5), lt, 540, 900); } });
  cue(TM.a5 + 0.05, 'rumble', { gain: 0.5, dur: 1.2 }); cue(TM.millions - 0.05, 'drum', { gain: 0.6 }); cue(TM.millions + 0.2, 'sizzle', { gain: 0.25, dur: 1.5 });

  add({ id: 'a6', at: TM.a6, cam: [540, 860], zoom: 0.07, note: 'two gold heaps poured from above: "5 MILLION?" (small, bone) and "9 MILLION?" (large, gold), dashed range arrow from small to large heap; ESTIMATES; "estimates, all India · no firm count"', draw: shotEstimate });
  cue(TM.five - 0.5, 'sizzle', { gain: 0.25, dur: 1.2 }); cue(TM.five, 'thud', { gain: 0.6 }); cue(TM.nine - 0.6, 'sizzle', { gain: 0.3, dur: 1.5 }); cue(TM.nine, 'slam', { gain: 0.6 }); cue(TM.nine + 0.5, 'tock', { gain: 0.35 });

  add({ id: 'a7', at: TM.a7, cam: [540, 700], zoom: 0.08, note: 'leather notice rises on two sticks: RELIEF / WORK / FOR FOOD cut out so lamp light shines through, perforated border; queue of six bowed puppets; "a condition"', draw: shotNotice });
  cue(TM.a7 + 0.05, 'slide', { gain: 0.55 }); cue(TM.a7 + 0.6, 'thud', { gain: 0.5 }); cue(TM.condition, 'drum', { gain: 0.55 });

  add({ id: 'a8', at: TM.a8, cam: [460, 820], zoom: 0.08, note: 'big digger puppet raises hoe and strikes on "work", clods fly, flash; bowl of gold grain on a stick waits, then moves to him; NO WORK, NO FOOD', draw: shotWork });
  cue(TM.fed - 0.3, 'slide', { gain: 0.4 }); cue(TM.work, 'thud', { gain: 0.8 }); cue(TM.work + 0.02, 'chisel', { gain: 0.45 }); cue(TM.work + 0.7, 'plop', { gain: 0.45 });

  add({ id: 'a9', at: TM.a9, cam: [540, 760], zoom: 0.07, note: 'procession of five puppet workers walking left with head baskets and hoes, a distant smaller line walking right; JAN 1877 woodblock, "the relief works"', draw: shotProcession });
  cue(TM.a9 + 0.05, 'whoosh', { gain: 0.4 }); cue(TM.early - 0.05, 'thud', { gain: 0.6 }); for (let i = 0; i < 4; i++) cue(TM.a9 + 0.3 + i * 0.6, 'tock', { gain: 0.18 });

  add({ id: 'a10', at: TM.a10, cam: [540, 900], zoom: 0.08, note: 'large gold heap on dry earth; a wooden strike-board sweeps across and slices off its top, grains tumble away; DAILY RELIEF WAGE, "for a man", gold CUT', draw: shotCut });
  cue(TM.daily, 'thud', { gain: 0.5 }); cue(TM.cut - 0.45, 'whoosh', { gain: 0.6 }); cue(TM.cut, 'slam', { gain: 0.7 }); cue(TM.cut + 0.1, 'sizzle', { gain: 0.3, dur: 0.8 });

  add({ id: 'a11', at: TM.a11, cam: [560, 820], zoom: 0.08, note: 'shadow forearm with cupped palm: gold grains counted one by one into a small heap, one gold coin drops and spins onto the palm; 1 lb GRAIN / DAY, + 1 ANNA, "Jan 1877 · a man on relief works", gold ONE POUND', draw: shotWage });
  cue(TM.a11 + 0.05, 'sparkle', { gain: 0.35 }); cue(TM.pound, 'pop', { gain: 0.5 }); cue(TM.anna - 0.05, 'bell', { gain: 0.55 }); cue(TM.anna + 0.1, 'tock', { gain: 0.3 });
}
