// EPISODE 9 · worker A : "Ember Linocut", lines 0-4 (hook 1780 legend, name + record vs song, 1772 Kalaiyar Kovil, Company + Nawab attack, king killed, queen escapes)
//   a1  black inked block: a V-gouge carves "1780" out in paper colour, vermilion copy settles off-register, embers rise; "FOLK SONG" ribbon
//   a2  paper print: a faceless woman silhouette is gouge-carved while she walks past a vermilion carved sun; flames begin to lick at her hem on "set"
//   a3  black page: the walking silhouette inside a big three-ink carved flame (vermilion / ember / paper core), carved cuts flow up, embers + heat shimmer
//   a4  night: carved vaulted gunpowder store with powder kegs, the small flame figure walks into the glowing door; carved starburst flash; PAPER BURN eats through to a5
//   a5  paper: vermilion flame print with the silhouette inside; "IN THE STORY" ribbon; KUYILI gouge-carved in black with off-register vermilion copy
//   a6  camera tilts down a two-part print: bound record stack (RECORD ribbon) above a carved divider, a singer whose vermilion song-lines curl into flames (FOLK SONG ribbon)
//   a7  INK ROLLER rolls down leaving a fresh black layer; "RECORD" ribbon; a gouge tool carves "1772"; vermilion copy shakes on "two"
//   a8  PRINT PULL peels the 1772 sheet off a CARVED MAP of the southern Tamil country; Kalaiyar Kovil dot + tiny gopuram, dashed vermilion SIVAGANGA ring; camera pushes in
//   a9  slate-blue rows of identical Company silhouettes march right with shouldered muskets in front of a carved vermilion sun; "EAST INDIA COMPANY"
//   a10 carved fort + gopuram on a hill; Company files from the left, Nawab's soot-grey horsemen with pennants from the right; "+ NAWAB OF ARCOT"; on "attacked" muskets level, carved starburst, smoke, print shake
//   a11 king silhouette (spear, carved crown with vermilion copy) gouge-carved before a paper-shade colonnade, royal vermilion banner flutters, smoke drifts; name ribbon + ILLUSTRATION
//   a12 the carved crown tumbles down and lands with a dust puff while the banner pole topples (no body, no gore)
//   a13 queen Velu Nachiyar: high hair knot, raised sword, gouge-carved over a vermilion disc, sword glint, sash flutters; name ribbon + ILLUSTRATION
//   a14 INK ROLLER to night: paper-carved queen on a galloping horse with little Vellachi in front, moon, far fort burning, palms + ground streak past; "WITH DAUGHTER VELLACHI"
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { rgba, mixc, cached, blit } from './art.js';

const PAP = '#EADBC0', PAPS = '#D6C29E', INK = '#141010', VER = '#D2401F', VERD = '#8E2412', EMB = '#F39A2B', SOOT = '#4A4440', SLATE = '#3E5872';
const WOOD = mixc(EMB, INK, 0.5), STEEL = '#9A948C', PI = Math.PI, sin = Math.sin, cos = Math.cos;

// ───────────── path helpers (add sub-paths to the current path) ─────────────
// while a carved layer is being built (SOLID), every sub-path is filled on its own so overlapping windings never cut holes
let SOLID = false;
const pre = () => { if (SOLID) { ctx.fill(); ctx.beginPath(); } }, post = () => { if (SOLID) { ctx.fill(); ctx.beginPath(); } };
const P = (pts) => { pre(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); post(); };
const E = (x, y, rx, ry, rot = 0) => { pre(); ctx.moveTo(x + rx * cos(rot), y + rx * sin(rot)); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); post(); };
function tube(pts, w0, w1 = w0) {
  const l = [], r = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const w = lerp(w0, w1, n > 1 ? i / (n - 1) : 0) / 2; l.push([pts[i][0] - ty * w, pts[i][1] + tx * w]); r.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  return l.concat(r.reverse());
}
function limb(pts, w0, w1, col) { ctx.beginPath(); P(tube(pts, w0, w1)); const e = pts[pts.length - 1]; E(e[0], e[1], w1 / 2, w1 / 2); E(pts[0][0], pts[0][1], w0 / 2, w0 / 2); ctx.fillStyle = col; ctx.fill(); }
const chain = (x, y, a1, l1, a2, l2) => { const kx = x + cos(a1) * l1, ky = y + sin(a1) * l1; return [[x, y], [kx, ky], [kx + cos(a2) * l2, ky + sin(a2) * l2]]; };
const ellF = (x, y, rx, ry, col, rot = 0) => { ctx.beginPath(); E(x, y, rx, ry, rot); ctx.fillStyle = col; ctx.fill(); };

// ───────────── linocut textures ─────────────
/** V-gouge cuts: tapered lens strokes in parallel rows across a box (rotated by ang). Used inside cached layers only. */
function gougeFill(bx, by, bw, bh, o = {}) {
  const ang = o.ang ?? -0.45, gap = o.gap ?? 15, seed = o.seed ?? 1, w = o.w ?? 2.2, bend = o.bend ?? 9, dens = o.dens ?? 0.55;
  const R = Math.hypot(bw, bh) / 2 + 30;
  ctx.save(); ctx.translate(bx + bw / 2, by + bh / 2); ctx.rotate(ang); ctx.fillStyle = o.col ?? PAP; ctx.globalAlpha *= o.a ?? 0.5; ctx.beginPath();
  let k = 0;
  for (let y = -R; y < R; y += gap) {
    let x = -R + rnd(seed + y * 0.13) * 60;
    while (x < R) {
      k++; const len = (o.len ?? 30) + rnd(seed + k * 1.3) * (o.lenR ?? 140);
      if (rnd(seed + k * 2.7) < dens) {
        const ww = w * (0.5 + rnd(seed + k * 3.9)), yy = y + (rnd(seed + k * 5.3) - 0.5) * gap * 0.5, b = (rnd(seed + k * 4.1) - 0.5) * 2 * bend;
        ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + len / 2, yy + b - ww, x + len, yy); ctx.quadraticCurveTo(x + len / 2, yy + b + ww, x, yy);
      }
      x += len + 6 + rnd(seed + k * 6.1) * 34;
    }
  }
  ctx.fill(); ctx.restore();
}
/** concentric broken gouge rings (for discs) */
function ringCuts(r0, r1, step, col, a, seed, lw = 3) {
  ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha *= a; ctx.lineCap = 'round'; let k = 0;
  for (let r = r0; r < r1; r += step) { let a0 = rnd(seed + r) * TAU; const end = a0 + TAU; while (a0 < end) { k++; const l = 0.25 + rnd(seed + k * 1.7) * 0.9; ctx.lineWidth = lw * (0.5 + rnd(seed + k * 2.3)); ctx.beginPath(); ctx.arc(0, 0, r, a0, Math.min(end, a0 + l)); ctx.stroke(); a0 += l + 0.08 + rnd(seed + k * 3.1) * 0.3; } }
  ctx.restore();
}
/** a carved shape: fill + gouges kept inside (source-atop), cached. bb = [x0,y0,x1,y1] in shape coords */
function carved(key, bb, shape, o = {}) {
  const [x0, y0, x1, y1] = bb;
  const c = cached('a:' + key, x1 - x0, y1 - y0, o.q ?? 1, () => {
    ctx.translate(-x0, -y0); ctx.beginPath(); ctx.fillStyle = o.col ?? INK; SOLID = !o.rule; shape(); SOLID = false; ctx.fill(o.rule ?? 'nonzero');
    if (o.g !== false) { ctx.save(); ctx.globalCompositeOperation = 'source-atop'; gougeFill(x0, y0, x1 - x0, y1 - y0, o.g || {}); ctx.restore(); }
    if (o.extra) { ctx.save(); ctx.globalCompositeOperation = 'source-atop'; o.extra(); ctx.restore(); }
  });
  c._bb = bb; return c;
}
const put = (c, x, y, s = 1, a = 1) => blit(c, -c._bb[0], -c._bb[1], x, y, s, a);
/** big carved word, centred on (0,0) */
function textImg(key, txt, size, col, gcol) {
  ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = `${Math.round(size * 0.04)}px`; const tw = ctx.measureText(txt).width; ctx.restore();
  const w = tw + size * 0.4, h = size * 1.15;
  return carved(key, [-w / 2, -h / 2, w / 2, h / 2], () => {}, {
    g: false,
    extra: () => {
      ctx.globalCompositeOperation = 'source-over'; ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = `${Math.round(size * 0.04)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = col; ctx.fillText(txt, 0, size * 0.04);
      if (gcol) { ctx.globalCompositeOperation = 'source-atop'; gougeFill(-w / 2, -h / 2, w, h, { col: gcol, a: 0.35, ang: -0.3, gap: 13, w: 1.8, seed: size }); }
    },
  });
}

const paperImg = () => cached('a:paper', W + 320, H + 320, 0.5, () => {
  ctx.fillStyle = PAP; ctx.fillRect(0, 0, W + 320, H + 320);
  for (let i = 0; i < 260; i++) { ctx.fillStyle = rgba(PAPS, 0.05 + rnd(i * 3.1) * 0.08); ctx.beginPath(); ctx.ellipse(rnd(i) * (W + 320), rnd(i + 0.5) * (H + 320), 40 + rnd(i * 2) * 160, 30 + rnd(i * 5) * 90, rnd(i * 7) * PI, 0, TAU); ctx.fill(); }
  ctx.lineCap = 'round';
  for (let i = 0; i < 2600; i++) { const x = rnd(i * 1.7) * (W + 320), y = rnd(i * 2.9) * (H + 320), a = rnd(i * 4.3) * PI, l = 4 + rnd(i * 6.1) * 14; ctx.strokeStyle = rgba(i % 3 ? '#B9A27C' : '#F6EBD4', 0.25 + rnd(i) * 0.25); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cos(a) * l, y + sin(a) * l); ctx.stroke(); }
});
const inkImg = () => cached('a:inkpage', W + 320, H + 320, 0.5, () => {
  ctx.fillStyle = INK; ctx.fillRect(0, 0, W + 320, H + 320);
  for (let i = 0; i < 160; i++) { ctx.fillStyle = rgba('#2A211D', 0.25 + rnd(i * 3.1) * 0.3); ctx.beginPath(); ctx.ellipse(rnd(i * 1.3) * (W + 320), rnd(i + 0.7) * (H + 320), 60 + rnd(i * 2) * 200, 40 + rnd(i * 5) * 120, rnd(i * 7) * PI, 0, TAU); ctx.fill(); }
  gougeFill(0, 0, W + 320, H + 320, { a: 0.05, gap: 40, dens: 0.25, seed: 77, ang: -0.6 });
});
const grainImg = () => cached('a:grain', W + 320, H + 320, 0.5, () => {
  for (let i = 0; i < 9000; i++) { const lt = i % 2; ctx.fillStyle = lt ? rgba(PAP, 0.07 + rnd(i) * 0.12) : rgba(INK, 0.05 + rnd(i) * 0.08); const s = 1.5 + rnd(i * 3.3) * 3; ctx.fillRect(rnd(i * 1.9) * (W + 320), rnd(i * 2.3) * (H + 320), s, s * (0.6 + rnd(i * 5.5))); }
});
const paperBg = () => blit(paperImg(), 160, 160, 0, 0);
const inkBg = () => blit(inkImg(), 160, 160, 0, 0);
const grain = () => blit(grainImg(), 160, 160, 0, 0);
function glow(x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }

/** off-register offset: a resting 4/3 px plus a decaying shake after each beat */
function reg(lt, beats = []) { let a = 1.5; for (const b of beats) if (lt > b) a += 9 * Math.exp(-(lt - b) * 7); return [4 + a * sin(lt * 37), 3 + a * cos(lt * 29)]; }

function embers(t, n, seed, x0, x1, yb, rise, a = 1) {
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.35 + rnd(seed + i) * 0.5) + rnd(seed + i * 1.7)) % 1, x = x0 + rnd(seed + i * 2.3) * (x1 - x0) + sin(t * 2 + i) * 24 * ph, y = yb - ph * rise, s = (2 + rnd(seed + i * 3.7) * 5) * (1 - ph * 0.7);
    ctx.globalAlpha = a * (1 - ph) * (ph < 0.08 ? ph / 0.08 : 1); ctx.fillStyle = i % 3 === 0 ? VER : i % 3 === 1 ? EMB : '#FFD9A0';
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 + i); ctx.fillRect(-s / 2, -s / 2, s, s * 0.6); ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ───────────── devices ─────────────
/** carved flame (tongues flicker) */
function flamePath(x, y, w, h, t, seed) {
  const m = 5; ctx.beginPath(); ctx.moveTo(x - w / 2, y); let px = x - w / 2, py = y;
  for (let k = 0; k < m; k++) {
    const env = 1 - Math.abs((k + 0.5) / m - 0.5) * 1.25, sway = sin(t * 3.1 + seed) * w * 0.09 * (1 - env * 0.3);
    const tx = x - w / 2 + w * (k + 0.5) / m + sin(t * 5 + k * 2.1 + seed) * w * 0.04 + sway, ty = y - h * env * (0.82 + 0.18 * sin(t * 7.3 + k * 1.7 + seed));
    const last = k === m - 1, vx = x - w / 2 + w * (k + 1) / m, vy = last ? y : y - h * env * (0.42 + 0.1 * sin(t * 6 + k));
    ctx.quadraticCurveTo(px + (tx - px) * 0.05, (py + ty) / 2 + (ty - py) * 0.1, tx, ty);
    ctx.quadraticCurveTo(vx - (vx - tx) * 0.1, (ty + vy) / 2 - (ty - vy) * 0.1, vx, vy);
    px = vx; py = vy;
  }
  ctx.quadraticCurveTo(x, y + h * 0.07, x - w / 2, y); ctx.closePath();
}
function flame(x, y, w, h, t, seed, cols = [VER, EMB, PAP]) {
  cols.forEach((c, i) => { const k = 1 - i * 0.3; flamePath(x, y, w * k, h * (1 - i * 0.26), t + i * 0.7, seed + i * 3); ctx.fillStyle = c; ctx.fill(); });
}
/** paper-coloured carved cuts flowing up through a flame */
function flameCuts(x, y, w, h, t, n = 9, col = PAP, a = 0.55) {
  ctx.fillStyle = col; ctx.globalAlpha = a; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.9 + rnd(i * 3.3)) % 1, xx = x + (rnd(i * 1.9) - 0.5) * w * 0.55 * (1 - ph * 0.5), yy = y - h * 0.08 - ph * h * 0.55, l = h * 0.12 * (1 - ph * 0.4), b = sin(t * 4 + i) * 10, ww = 4;
    ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + b + ww, yy - l / 2, xx + b * 0.4, yy - l); ctx.quadraticCurveTo(xx + b - ww, yy - l / 2, xx, yy);
  }
  ctx.fill(); ctx.globalAlpha = 1;
}
function shimmer(x, y, w, t, n = 5, a = 0.18) {
  ctx.strokeStyle = rgba(EMB, a); ctx.lineWidth = 3;
  for (let i = 0; i < n; i++) { const yy = y - i * 46 - ((t * 60) % 46); ctx.beginPath(); for (let k = 0; k <= 20; k++) { const xx = x - w / 2 + w * k / 20; ctx[k ? 'lineTo' : 'moveTo'](xx, yy + sin(k * 1.3 + t * 9 + i) * 6); } ctx.stroke(); }
}
/** the V-gouge tool, tip at (x,y) */
function gougeTool(x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.75 + sin(t * 20) * 0.03);
  ctx.beginPath(); P([[-16, 0], [0, -7], [118, -6], [118, 6], [0, 7]]); ctx.fillStyle = STEEL; ctx.fill();
  ctx.fillStyle = rgba(PAP, 0.6); ctx.fillRect(4, -5, 110, 3);
  ctx.fillStyle = SOOT; ctx.fillRect(112, -10, 18, 20);
  ellF(190, 0, 70, 22, WOOD); ellF(262, 0, 26, 34, WOOD); ellF(190, -8, 56, 6, rgba(PAP, 0.25));
  ctx.restore();
}
let SCR = null;
/** GOUGE CARVE REVEAL: the cached image emerges along wavy carving rows, the gouge rides the cutting front */
function revealPut(c, x, y, s, p, o = {}) {
  if (p <= 0) return; if (p >= 1) { put(c, x, y, s); return; }
  const w = c.width, h = c.height, q = c._q, bb = c._bb;
  if (!SCR) SCR = document.createElement('canvas');
  if (SCR.width < w || SCR.height < h) { SCR.width = Math.max(SCR.width, w); SCR.height = Math.max(SCR.height, h); }
  const g = SCR.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  const rows = o.rows ?? 6, rh = h / rows, tot = rows * eio(p); let tip = null;
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#000'; g.lineWidth = rh * 1.45;
  for (let r = 0; r < rows && r < tot; r++) {
    const f = Math.min(1, tot - r), yc = (r + 0.5) * rh, ltr = r % 2 === 0, n = 18; g.beginPath();
    for (let i = 0; i <= n; i++) { const u = f * i / n, xx = ltr ? -rh + u * (w + 2 * rh) : w + rh - u * (w + 2 * rh), yy = yc + sin(u * 9 + r) * rh * 0.2; if (i) g.lineTo(xx, yy); else g.moveTo(xx, yy); tip = [xx, yy]; }
    g.stroke();
  }
  g.globalCompositeOperation = 'source-in'; g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-over';
  const dx = x + bb[0] * s, dy = y + bb[1] * s, sc = s / q;
  ctx.drawImage(SCR, 0, 0, w, h, dx, dy, w * sc, h * sc);
  if (tip && o.tool !== false) {
    const tx = dx + clamp(tip[0], 0, w) * sc, ty = dy + tip[1] * sc, t = o.t ?? p * 5;
    ctx.fillStyle = o.chip ?? PAP;
    for (let i = 0; i < 7; i++) { const ph = (t * 3 + rnd(i * 1.3)) % 1; ctx.globalAlpha = 1 - ph; ctx.fillRect(tx + (rnd(i * 2.1) - 0.2) * 90 * ph, ty - 60 * ph + 90 * ph * ph, 6, 4); }
    ctx.globalAlpha = 1; gougeTool(tx, ty, o.ts ?? 1, t);
  }
}
/** PAPER-CUT RIBBON BANNER, unfurls from the left. (x, y) = left end, vertical centre */
function ribbon(txt, x, y, p, o = {}) {
  const k = eo(clamp(p)); if (k <= 0.001) return;
  const sz = o.size ?? 40; ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.03);
  ctx.font = `900 ${sz}px Inter`; ctx.letterSpacing = `${Math.round(sz * 0.08)}px`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const tw = ctx.measureText(txt).width, h = sz * 1.45, w = (tw + sz * 1.1) * k, fd = sz * 0.3, tl = sz * 0.9, ins = sz * 0.22;
  const tailL = [[-tl, -h / 2 + fd], [ins, -h / 2 + fd], [ins, h / 2 + fd], [-tl, h / 2 + fd], [-tl + sz * 0.38, fd]];
  const tailR = [[w - ins, -h / 2 + fd], [w + tl, -h / 2 + fd], [w + tl - sz * 0.38, fd], [w + tl, h / 2 + fd], [w - ins, h / 2 + fd]];
  const shapes = (dx, dy, cb) => { ctx.save(); ctx.translate(dx, dy); cb(); ctx.restore(); };
  shapes(7, 9, () => { ctx.beginPath(); P(tailL); if (k > 0.12) P(tailR); ctx.rect(0, -h / 2, w, h); ctx.fillStyle = rgba(INK, 0.25); ctx.fill(); });
  ctx.beginPath(); P(tailL); if (k > 0.12) P(tailR); ctx.fillStyle = VERD; ctx.fill();
  ctx.beginPath(); P([[0, h / 2], [ins, h / 2], [ins, h / 2 + fd]]); if (k > 0.12) P([[w, h / 2], [w - ins, h / 2], [w - ins, h / 2 + fd]]); ctx.fillStyle = '#5A160A'; ctx.fill();
  ctx.fillStyle = VER; ctx.fillRect(0, -h / 2, w, h);
  ctx.fillStyle = rgba(VERD, 0.45); ctx.fillRect(0, h / 2 - h * 0.12, w, h * 0.12);
  ctx.fillStyle = rgba(PAP, 0.18); ctx.fillRect(0, -h / 2 + 3, w, 3);
  ctx.beginPath(); ctx.rect(0, -h / 2, w, h); ctx.clip(); ctx.fillStyle = PAP; ctx.fillText(txt, sz * 0.55, sz * 0.05);
  ctx.restore();
}
/** INK ROLLER: a brayer rolls down the page; above it the new layer is printed */
function roller(y) {
  ctx.save();
  ctx.strokeStyle = SOOT; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(540, y - 300); ctx.lineTo(W + 10, y); ctx.stroke();
  ctx.fillStyle = WOOD; ctx.beginPath(); ctx.roundRect(512, y - 500, 56, 210, 26); ctx.fill(); ctx.fillStyle = rgba(PAP, 0.25); ctx.fillRect(522, y - 486, 8, 180);
  const g = ctx.createLinearGradient(0, y - 56, 0, y + 56); g.addColorStop(0, INK); g.addColorStop(0.3, '#4A4440'); g.addColorStop(0.42, '#2A2421'); g.addColorStop(1, INK);
  ctx.fillStyle = g; ctx.fillRect(-60, y - 56, W + 120, 112); ctx.fillStyle = rgba(PAP, 0.3); ctx.fillRect(-60, y - 30, W + 120, 4);
  ctx.restore();
}
function rollerWipe(p, drawOld, drawNew) {
  const y = lerp(-140, H + 200, eio(clamp(p)));
  drawOld(); ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, W + 800, y + 400); ctx.clip(); drawNew(); ctx.restore(); roller(y);
}
/** PRINT PULL: the old sheet is peeled back from the bottom-right corner, its light back curls over */
function clipHalf(poly, C, u, D, keepLess) {
  const f = (p) => (p[0] - C[0]) * u[0] + (p[1] - C[1]) * u[1] - D, out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b), ia = keepLess ? fa <= 0 : fa >= 0, ib = keepLess ? fb <= 0 : fb >= 0;
    if (ia) out.push(a); if (ia !== ib) { const k = fa / (fa - fb); out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); }
  }
  return out;
}
function printPull(p, drawOld, drawNew) {
  const M = 260, rect = [[-M, -M], [W + M, -M], [W + M, H + M], [-M, H + M]], C = [W + M, H + M], len = Math.hypot(W + 2 * M, H + 2 * M), u = [-(W + 2 * M) / len, -(H + 2 * M) / len];
  const D = eio(clamp(p)) * len * 1.02;
  drawNew();
  const old = clipHalf(rect, C, u, D, false);
  if (old.length > 2) { ctx.save(); ctx.beginPath(); P(old); ctx.clip(); drawOld(); ctx.restore(); }
  const peel = clipHalf(rect, C, u, D, true);
  if (peel.length > 2) {
    const fl = peel.map(([x, y]) => { const dd = D - ((x - C[0]) * u[0] + (y - C[1]) * u[1]); return [x + 2 * dd * u[0], y + 2 * dd * u[1]]; });
    const fx = C[0] + u[0] * D, fy = C[1] + u[1] * D;
    ctx.save(); ctx.beginPath(); P(peel); ctx.clip();
    const sg = ctx.createLinearGradient(fx, fy, fx - u[0] * 70, fy - u[1] * 70); sg.addColorStop(0, rgba(INK, 0.4)); sg.addColorStop(1, rgba(INK, 0)); ctx.fillStyle = sg; ctx.fillRect(-M, -M, W + 2 * M, H + 2 * M); ctx.restore();
    const g = ctx.createLinearGradient(fx, fy, fx + u[0] * 500, fy + u[1] * 500); g.addColorStop(0, '#BFA982'); g.addColorStop(0.35, PAPS); g.addColorStop(1, PAP);
    ctx.beginPath(); P(fl); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = rgba(INK, 0.2); ctx.lineWidth = 3; ctx.stroke();
  }
}
/** PAPER BURN: a ragged burning hole with charred edge and ember rim reveals the next print */
function burn(p, cx, cy, t, drawNew) {
  const R = Math.pow(clamp(p), 1.4) * 1550; if (R <= 1) return;
  const path = () => { ctx.beginPath(); for (let i = 0; i <= 80; i++) { const a = i / 80 * TAU, n = 1 + 0.13 * sin(a * 5 + 1.3) + 0.08 * sin(a * 11 + 4) + 0.05 * sin(a * 23 + t * 6); const r = R * n; ctx[i ? 'lineTo' : 'moveTo'](cx + cos(a) * r, cy + sin(a) * r); } ctx.closePath(); };
  ctx.save(); path(); ctx.clip(); drawNew(); ctx.restore();
  path(); ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2A1A12'; ctx.lineWidth = 46; ctx.stroke();
  ctx.strokeStyle = VERD; ctx.lineWidth = 20; ctx.stroke();
  ctx.strokeStyle = EMB; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = '#FFE2A8'; ctx.lineWidth = 3; ctx.stroke();
}

// ───────────── figures (faceless, profile, facing right, feet at 0,0) ─────────────
function womanShape(knot) {
  return () => {
    E(8, -548, 30, 38); P([[30, -566], [46, -544], [32, -532]]);
    if (knot === 'high') { E(-2, -598, 22, 19); E(0, -624, 13, 12); } else E(-28, -536, 21, 23);
    P([[-4, -520], [16, -520], [18, -486], [-8, -486]]);
    P([[-30, -494], [30, -494], [38, -452], [28, -388], [-24, -388], [-40, -452]]);
    P([[-30, -394], [28, -394], [46, -200], [62, -14], [-56, -14], [-46, -200]]);
    P([[22, -498], [42, -480], [-30, -372], [-98, -286], [-76, -330], [-46, -392]]);
  };
}
const womanImg = (knot, col = INK, gcol = PAP) => carved('wom' + knot + col, [-110, -650, 80, 0], womanShape(knot), { col, g: { col: gcol, a: 0.5, ang: 1.25, gap: 13, seed: 5 } });
/** a walking / standing woman: per-frame arms + feet around the cached carved body */
function woman(x, y, s, ph, img, o = {}) {
  const col = o.col ?? INK, ap = o.limbA ?? 1, sw = o.walk === false ? 0 : 1;
  ctx.save(); ctx.translate(x, y - Math.abs(sin(ph)) * 6 * sw); ctx.scale(s, s);
  ctx.globalAlpha = ap;
  limb(chain(-6, -482, PI / 2 + 0.32 * sin(ph) * sw, 118, PI / 2 + 0.32 * sin(ph) * sw - 0.25, 106), 24, 17, col);
  for (let k = 0; k < 2; k++) { const f = sin(ph + k * PI) * sw; ellF(4 + f * 30, -9 - Math.max(0, cos(ph + k * PI)) * 10 * sw, 28, 10, col); }
  ctx.globalAlpha = 1;
  if (o.reveal != null && o.reveal < 1) revealPut(img, 0, 0, 1, o.reveal, { rows: 7, ts: 1 / s, t: o.t, chip: o.chip });
  else put(img, 0, 0, 1);
  ctx.globalAlpha = ap;
  if (o.arm === 'sword') {
    limb([[18, -482], [72, -426], [86, -500]], 24, 18, col);
    ctx.save(); ctx.translate(86, -500); ctx.rotate(o.swordRot ?? 0.08);
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-7, -250); ctx.quadraticCurveTo(-4, -300, 10, -320); ctx.quadraticCurveTo(8, -270, 7, -250); ctx.lineTo(6, 0); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.fillRect(-26, -8, 52, 12); ellF(0, 16, 9, 14, col);
    if (o.glint != null) { const gy = -30 - o.glint * 260; ctx.fillStyle = rgba(o.glintCol ?? PAP, 0.9); ctx.beginPath(); ctx.ellipse(0, gy, 3, 26, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  } else if (o.arm === 'sing') limb(chain(18, -484, 0.2 + sin(ph * 0.5) * 0.08, 112, -0.5 + sin(ph * 0.5) * 0.12, 100), 24, 17, col);
  else limb(chain(18, -482, PI / 2 - 0.32 * sin(ph) * sw, 118, PI / 2 - 0.32 * sin(ph) * sw - 0.3, 106), 24, 17, col);
  ctx.globalAlpha = 1; ctx.restore();
}
const kingImg = () => carved('king', [-110, -790, 130, 0], () => {
  E(6, -566, 32, 40); P([[30, -582], [48, -560], [32, -548]]);
  P([[-8, -534], [18, -534], [20, -500], [-10, -500]]);
  P([[-46, -506], [40, -506], [48, -440], [34, -340], [-30, -340], [-48, -440]]);
  P([[-36, -348], [36, -348], [46, -150], [-44, -150]]);
  P(tube([[12, -160], [18, -12]], 26, 22)); P(tube([[-22, -160], [-28, -12]], 26, 22)); E(30, -8, 26, 10); E(-16, -8, 26, 10);
  P([[34, -508], [48, -490], [-42, -380], [-78, -300], [-64, -366]]);
  P(tube([[30, -490], [64, -424], [86, -436]], 28, 22));
  P(tube([[-24, -490], [-40, -404], [-34, -320]], 26, 20));
  P([[86, -700], [97, -700], [99, 0], [89, 0]]); P([[92, -770], [108, -700], [76, -700]]);
}, { g: { ang: 1.2, gap: 13, seed: 9 } });
const crownShape = () => {
  P([[-36, 0], [36, 0], [31, -26], [24, -30], [21, -60], [14, -64], [11, -96], [5, -100], [0, -134], [-5, -100], [-11, -96], [-14, -64], [-21, -60], [-24, -30], [-31, -26]]);
  E(-40, 8, 9, 15); E(40, 8, 9, 15);
};
const crownImg = (col = INK) => carved('crown' + col, [-52, -140, 52, 26], crownShape, { col, g: { ang: 0, gap: 11, w: 2.4, seed: 4, dens: 0.7, a: 0.6 } });
const soldierImg = (col) => carved('sold' + col, [-34, -420, 40, -150], () => {
  E(6, -362, 21, 25); P([[-20, -372], [28, -372], [24, -396], [2, -406], [-16, -396]]);
  P([[-2, -340], [16, -340], [16, -326], [-2, -326]]);
  P([[-24, -336], [26, -336], [30, -260], [24, -190], [-22, -190], [-28, -260]]);
  P([[-24, -200], [24, -200], [30, -158], [-32, -152]]);
}, { col, g: { ang: 1.3, gap: 11, a: 0.35, seed: 3 } });
function soldier(x, y, s, ph, aim, col = SLATE) {
  ctx.save(); ctx.translate(x, y - Math.abs(sin(ph)) * 5); ctx.scale(s, s);
  for (let k = 0; k < 2; k++) { const a = PI / 2 + 0.36 * sin(ph + k * PI); const fx = cos(a) * 160, fy = -170 + sin(a) * 160; limb([[0, -172], [fx, fy]], 24, 18, col); ellF(fx + 10, fy, 20, 8, col); }
  put(soldierImg(col), 0, 0);
  ctx.save(); ctx.translate(12, -318); ctx.rotate(lerp(-PI / 2 - 0.16, -0.06, aim));
  ctx.fillStyle = col; ctx.fillRect(-70, -6, 250, 11); ctx.fillRect(-70, -9, 60, 17);
  ctx.beginPath(); P([[178, -3], [240, 0], [178, 4]]); ctx.fill();
  ctx.restore();
  limb([[8, -318], [26, -262], [40, -238]], 20, 16, col);
  ctx.restore();
}
const HORSE = () => {
  E(0, -200, 126, 56); E(92, -206, 52, 58); E(-98, -205, 58, 60);
  P([[66, -238], [120, -186], [180, -298], [160, -338], [126, -332], [70, -266]]);
  P([[150, -344], [178, -340], [234, -278], [228, -258], [202, -260], [186, -270], [156, -300]]);
  P([[156, -338], [162, -370], [173, -340]]);
  P([[128, -334], [98, -300], [72, -258], [96, -292], [112, -320]]);
};
const horseQueenImg = (col, gcol) => carved('hq' + col, [-160, -680, 240, -120], () => {
  HORSE();
  P([[-40, -250], [10, -250], [24, -330], [14, -392], [-30, -392], [-42, -330]]); E(4, -432, 24, 30); P([[22, -444], [34, -428], [22, -420]]);
  E(-8, -470, 16, 14); E(-6, -490, 9, 9); P([[-6, -404], [10, -404], [10, -386], [-6, -386]]);
  P(tube([[-14, -258], [30, -214], [24, -150]], 32, 22));
  P([[34, -252], [68, -252], [70, -318], [38, -318]]); E(56, -342, 16, 19); P([[68, -350], [78, -340], [68, -334]]); E(42, -350, 9, 9);
  P(tube([[6, -380], [52, -334], [100, -320]], 20, 15));
  P(tube([[-14, -384], [-40, -440], [-30, -500]], 20, 15));
  P([[-36, -496], [-24, -496], [-36, -660], [-44, -650]]); P([[-50, -500], [-12, -504], [-12, -494], [-50, -490]]);
}, { col, g: { col: gcol, ang: 1.0, gap: 13, a: 0.55, seed: 8 }, extra: () => { ctx.strokeStyle = gcol; ctx.lineWidth = 5; ctx.beginPath(); P([[34, -252], [68, -252], [70, -318], [38, -318]]); E(56, -342, 16, 19); ctx.stroke(); ctx.beginPath(); P(tube([[6, -380], [52, -334], [100, -320]], 20, 15)); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -252); ctx.lineTo(10, -252); ctx.stroke(); } });
const horseNawabImg = (col) => carved('hn' + col, [-160, -480, 240, -120], () => {
  HORSE();
  P([[-40, -250], [10, -250], [22, -330], [12, -392], [-30, -392], [-42, -330]]); E(2, -428, 24, 28); E(-4, -456, 32, 18); E(-26, -448, 14, 12);
  P(tube([[-14, -258], [30, -214], [24, -150]], 32, 22));
  P(tube([[6, -380], [52, -340], [100, -322]], 20, 15));
}, { col, g: { col: PAP, ang: 1.0, gap: 13, a: 0.35, seed: 6 } });
/** galloping horse: per-frame legs + tail around a cached body (+ riders) */
function horse(x, y, s, ph, img, col, o = {}) {
  ctx.save(); ctx.translate(x, y - Math.abs(sin(ph)) * 12); if (o.flip) ctx.scale(-s, s); else ctx.scale(s, s);
  const legs = [[92, -176, 0, 1], [76, -176, 0.8, 1], [-96, -180, 2.4, -1], [-80, -180, 3.2, -1]];
  for (const [hx, hy, off, fr] of legs) {
    const a1 = PI / 2 + 0.55 * sin(ph + off), bend = 0.15 + 0.55 * (0.5 + 0.5 * sin(ph + off + 1.4)), a2 = a1 + fr * bend;
    const pts = chain(hx, hy, a1, 86, a2, 92); limb(pts, 28, 15, col); ellF(pts[2][0] + 6 * fr, pts[2][1], 13, 9, col);
  }
  limb([[-150, -226], [-200, -210 + sin(ph) * 14], [-246, -190 + sin(ph + 1) * 22], [-280, -170 + sin(ph + 2) * 26]], 30, 8, col);
  put(img, 0, 0);
  if (o.extra) o.extra(ph);
  ctx.restore();
}
const storeImg = () => carved('store', [-480, -400, 480, 6], () => {
  ctx.moveTo(-280, 0); ctx.lineTo(-280, -260); ctx.ellipse(0, -260, 280, 116, 0, PI, TAU); ctx.lineTo(280, 0); ctx.closePath();
  P([[-310, 0], [-266, 0], [-266, -230], [-310, -210]]); P([[310, 0], [266, 0], [266, -230], [310, -210]]);
  for (const [x, y] of [[-420, -40], [-340, -40], [-380, -114], [360, -40], [440, -40], [400, -114]]) E(x, y, 40, 40);
}, {
  col: '#3A3230', g: { col: EMB, a: 0.45, ang: -0.2, gap: 15, seed: 12 },
  extra: () => { ctx.strokeStyle = rgba(EMB, 0.55); ctx.lineWidth = 3; for (const [x, y] of [[-420, -40], [-340, -40], [-380, -114], [360, -40], [440, -40], [400, -114]]) { ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.stroke(); } ctx.fillStyle = rgba(EMB, 0.4); ctx.fillRect(-280, -262, 560, 8); },
});
const doorPath = (cx, by, w, h) => { ctx.beginPath(); ctx.moveTo(cx - w / 2, by); ctx.lineTo(cx - w / 2, by - h + w / 2); ctx.arc(cx, by - h + w / 2, w / 2, PI, TAU); ctx.lineTo(cx + w / 2, by); ctx.closePath(); };
const fortImg = () => carved('fort', [-420, -520, 420, 4], () => {
  P([[-360, 0], [360, 0], [360, -170], [-360, -170]]);
  for (let x = -356; x < 350; x += 42) P([[x, -168], [x + 24, -168], [x + 24, -196], [x, -196]]);
  for (const cx of [-340, 340]) { P([[cx - 52, 0], [cx + 52, 0], [cx + 46, -250], [cx - 46, -250]]); for (let k = -2; k <= 1; k++) P([[cx + k * 24, -248], [cx + k * 24 + 14, -248], [cx + k * 24 + 14, -272], [cx + k * 24, -272]]); }
  for (let i = 0; i < 6; i++) { const y0 = -170 - i * 52, w0 = 120 - i * 11; P([[60 - w0, y0 + 2], [60 + w0, y0 + 2], [60 + w0 - 8, y0 - 50], [60 - w0 + 8, y0 - 50]]); }
  E(60, -486, 52, 20); for (const k of [-30, 0, 30]) E(60 + k, -514, 6, 10);
}, {
  g: { ang: 0, gap: 12, seed: 21, dens: 0.6 },
  extra: () => { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = PAP; doorPath(-100, 0, 90, 130); ctx.fill(); for (let i = 0; i < 6; i++) { ctx.fillRect(60 - 14, -200 - i * 52, 28, 16); } },
});
const booksImg = (col = INK) => carved('books' + col, [-230, -310, 230, 2], () => {
  for (const [x, y, w, h] of [[-205, -70, 410, 70], [-175, -150, 370, 80], [-215, -218, 395, 68], [-165, -300, 350, 82]]) ctx.roundRect(x, y, w, h, 12);
}, {
  col, g: { ang: 0, gap: 10, seed: 15, dens: 0.75, a: 0.4 },
  extra: () => { ctx.fillStyle = rgba(PAP, 0.8); for (const [x, y, w, h] of [[-205, -70, 410, 70], [-175, -150, 370, 80], [-215, -218, 395, 68], [-165, -300, 350, 82]]) { ctx.fillRect(x + 30, y + 8, 8, h - 16); ctx.fillRect(x + w - 40, y + 8, 8, h - 16); ctx.fillRect(x + 48, y + 8, 4, h - 16); ctx.fillRect(x + w - 54, y + 8, 4, h - 16); } },
});
const discImg = (key, r, col, gcol, a = 0.45) => carved('disc' + key, [-r, -r, r, r], () => E(0, 0, r, r), { col, g: false, extra: () => ringCuts(r * 0.14, r * 0.97, 22, gcol, a, r) });
const groundImg = (key, w, h, col, gcol, a = 0.4) => carved('gr' + key, [-w / 2, 0, w / 2, h], () => {
  ctx.moveTo(-w / 2, 12); for (let i = 0; i <= 24; i++) ctx.lineTo(-w / 2 + w * i / 24, 8 + sin(i * 1.7) * 6 + rnd(i) * 6); ctx.lineTo(w / 2, h); ctx.lineTo(-w / 2, h); ctx.closePath();
}, { col, g: { col: gcol, a, ang: 0.04, gap: 12, seed: w + h, lenR: 200 } });
const palmImg = (col) => carved('palm' + col, [-190, -720, 190, 4], () => {
  P(tube([[0, 0], [6, -300], [14, -600]], 30, 18));
  for (let i = 0; i < 11; i++) { const a = -PI + 0.12 + i * (PI - 0.24) / 10, l = 150 + (i % 2) * 30, cx = 14, cy = -610, ex = cx + cos(a) * l, ey = cy + sin(a) * l * 0.8 + Math.abs(cos(a)) * 40; const nx = -sin(a) * 14, ny = cos(a) * 14; P([[cx, cy], [lerp(cx, ex, 0.5) + nx, lerp(cy, ey, 0.5) + ny], [ex, ey], [lerp(cx, ex, 0.5) - nx, lerp(cy, ey, 0.5) - ny]]); }
}, { col, g: { ang: 1.45, gap: 9, a: 0.3, seed: 31 } });
const arcadeImg = () => carved('arcade', [-600, -820, 600, 0], () => {
  ctx.rect(-600, -820, 1200, 820);
  for (let i = -2; i <= 2; i++) { const cx = i * 240; ctx.moveTo(cx - 80, 0); ctx.lineTo(cx - 80, -480); ctx.arc(cx, -480, 80, PI, TAU); ctx.lineTo(cx + 80, 0); ctx.closePath(); }
}, { col: PAPS, rule: 'evenodd', g: { col: '#B9A27C', a: 0.7, ang: 1.5708, gap: 16, seed: 41 } });

// ───────────── the carved map of the southern Tamil country ─────────────
const MP = (lon, lat) => [(lon - 75.6) * 225, (11.8 - lat) * 270 + 150];
const MAINLAND = [[75.2, 12.4], [75.75, 11.5], [75.78, 11.25], [75.92, 10.78], [76.26, 9.97], [76.33, 9.5], [76.58, 8.88], [76.95, 8.5], [77.54, 8.08], [77.8, 8.2], [78.06, 8.38], [78.15, 8.8], [78.37, 9.07], [78.6, 9.18], [79.13, 9.28], [79.42, 9.15], [79.44, 9.2], [79.3, 9.3], [78.9, 9.48], [79.02, 9.74], [79.2, 10.05], [79.85, 10.28], [79.84, 10.77], [79.84, 10.92], [79.82, 11.5], [79.9, 12.4]].map(([a, b]) => MP(a, b));
const LANKA = [[79.9, 9.6], [80.0, 9.7], [80.23, 9.82], [80.7, 9.5], [80.7, 7.9], [79.85, 7.9], [79.88, 8.6], [79.92, 8.98], [79.95, 9.3]].map(([a, b]) => MP(a, b));
const KK = MP(78.63, 9.85), SVG = [KK[0] - 26, KK[1] + 14];
const seaImg = () => carved('sea', [-160, 0, W + 160, 1320], () => ctx.rect(-160, 0, W + 320, 1320), {
  col: 'rgba(0,0,0,0)', g: false,
  extra: () => { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = rgba(INK, 0.32); ctx.lineCap = 'round'; for (let y = 20, i = 0; y < 1320; y += 34, i++) { let x = -160 + rnd(i) * 80; while (x < W + 160) { const l = 60 + rnd(x * 0.1 + i) * 160; ctx.lineWidth = 2 + rnd(x + i) * 2; ctx.beginPath(); for (let k = 0; k <= 10; k++) ctx[k ? 'lineTo' : 'moveTo'](x + l * k / 10, y + sin((x + l * k / 10) * 0.05 + i) * 6); ctx.stroke(); x += l + 30 + rnd(x + i * 3) * 60; } } },
});
const mapImg = () => carved('map', [-160, 0, W + 160, 1320], () => { P(MAINLAND); P(LANKA); }, {
  g: { ang: -0.9, gap: 14, seed: 51, a: 0.42 },
  extra: () => { ctx.strokeStyle = rgba(PAP, 0.75); ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.save(); ctx.beginPath(); P(MAINLAND); P(LANKA); ctx.clip(); ctx.translate(0, 0); ctx.lineWidth = 16; ctx.strokeStyle = rgba(PAP, 0.18); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(PAP, 0.7); ctx.stroke(); ctx.restore(); },
});
const gopuramImg = () => carved('gop', [-40, -96, 40, 2], () => {
  for (let i = 0; i < 5; i++) { const y0 = -i * 16, w0 = 30 - i * 4; P([[-w0, y0], [w0, y0], [w0 - 3, y0 - 15], [-w0 + 3, y0 - 15]]); }
  E(0, -84, 16, 7); E(0, -93, 3, 5);
}, { col: PAP, g: { col: INK, ang: 0, gap: 6, a: 0.4, w: 1.2, seed: 2 } });

// ───────────── shots ─────────────
export function buildA(add, cue) {
  const tWoman = Wd('woman', 0), tSet = Wd('set', 0), tFire = Wd('fire', 0), tGun = Wd('gunpowder', 0), tStoreE = Wd('store', 0, 'e');
  const t1 = L(1), tKuy = Wd('Kuyili', 1), tBut = Wd('But', 1), tRec1 = Wd('record', 1), tSong = Wd('song', 1);
  const t2 = L(2), tRec2 = Wd('record', 2), t17 = Wd('seventeen', 2), tTwo = Wd('two', 2), tAt = Wd('at', 2), tKal = Wd('Kalaiyar', 2), tSiv = Wd('Sivaganga', 2);
  const t3 = L(3), tTroops = Wd('troops', 3), tNawab = Wd('Nawab', 3), tAtt = Wd('attacked', 3), tKing = Wd('king', 3), tMuthu = Wd('Muthu', 3), tKilled = Wd('killed', 3);
  const t4 = L(4), tVelu = Wd('Velu', 4), tEsc = Wd('escaped', 4), tDau = Wd('daughter', 4), t5 = L(5);
  const D = { a6: t2 - tBut, a7: tAt - t2, a13: tEsc - t4 };

  // a1 · 1780 carved out of the black block
  const T1780 = () => textImg('t1780', '1780', 300, PAP, INK), T1780v = () => textImg('t1780v', '1780', 300, VER);
  const sA1 = (lt) => {
    inkBg(); glow(540, 1300, 760, EMB, 0.26 + 0.05 * sin(lt * 7)); glow(540, 640, 520, VER, 0.12);
    embers(lt, 44, 11, 40, 1040, 1280, 1100);
    const p = seg(lt, 0.08, 1.15), r = reg(lt, [1.15]);
    if (p > 0.6) put(T1780v(), 540 + r[0], 660 + r[1], 1, seg(p, 0.6, 1));
    revealPut(T1780(), 540, 660, 1, p, { rows: 4, t: lt, chip: PAP });
    ribbon('FOLK SONG', 120, 960, seg(lt, 1.25, 1.7), { size: 48 });
  };
  add({ id: 'a1', at: 0, zoom: 0.09, cam: [540, 760], note: '1780 gouge-carved from black block, embers, FOLK SONG ribbon', draw: (lt) => { sA1(lt); grain(); } });
  cue(0.05, 'swell', { gain: 0.5, dur: 2 }); cue(0.1, 'chisel', { gain: 0.7, dur: 1 }); cue(1.25, 'slide', { gain: 0.4 });

  // a2 · the woman is carved, walks past the vermilion sun; flames begin at her hem
  const sA2 = (lt, d) => {
    paperBg(); const r = reg(lt, [0.1]);
    put(discImg('sun', 320, VER, PAP, 0.4), 600 + r[0], 600 + r[1], 1 + 0.03 * lt);
    put(groundImg('a2', 1300, 90, INK, PAP), 540, 1180);
    const x = lerp(360, 560, lt / d), ph = lt * 6.5, p = seg(lt, 0, 0.8), f = seg(lt, tSet - tWoman, d);
    woman(x, 1186, 1.25, ph, womanImg('low'), { reveal: p, limbA: seg(p, 0.75, 1), t: lt });
    if (f > 0) { flame(x, 1190, 260 * eo(f), 330 * f, lt, 7, [VER, EMB]); flameCuts(x, 1190, 260 * f, 330 * f, lt, 5); embers(lt, 16, 4, x - 140, x + 140, 1180, 500, f); }
  };
  add({ id: 'a2', at: tWoman, zoom: 0.07, cam: [520, 820], note: 'woman silhouette carved while walking past vermilion sun, hem flames on "set"', draw: (lt, d) => { sA2(lt, d); grain(); } });
  cue(tWoman + 0.02, 'chisel', { gain: 0.6, dur: 0.8 }); cue(tSet, 'sizzle', { gain: 0.35, dur: 0.9 });

  // a3 · the silhouette inside a carved flame
  const sA3 = (lt) => {
    inkBg(); glow(540, 900, 820, VER, 0.32 + 0.06 * sin(lt * 11)); shimmer(540, 260, 700, lt, 4, 0.16);
    flamePath(540, 1210, 760, 1080, lt, 1); ctx.fillStyle = VERD; ctx.fill();
    flame(540, 1210, 660, 980, lt, 2, [VER, EMB]);
    woman(540, 1180, 1.12, lt * 6, womanImg('low'), { t: lt });
    flamePath(540, 1215, 260, 300, lt * 1.3, 9); ctx.fillStyle = PAP; ctx.fill();
    flameCuts(540, 1210, 660, 980, lt, 12);
    embers(lt, 50, 3, 120, 960, 1180, 1150);
  };
  add({ id: 'a3', at: tFire, zoom: 0.1, cam: [540, 700], note: 'walking silhouette inside 3-ink carved flame, carved cuts rise, embers, shimmer', draw: (lt) => { sA3(lt); grain(); } });
  cue(tFire, 'whoosh', { gain: 0.5 }); cue(tFire + 0.05, 'sizzle', { gain: 0.6, dur: 1.8 });

  // a5 scene (used by a4's burn)
  const KUY = () => textImg('kuy', 'KUYILI', 200, INK, PAP), KUYv = () => textImg('kuyv', 'KUYILI', 200, VER);
  const sA5 = (lt) => {
    paperBg(); const kT = tKuy - t1, r = reg(lt, [kT + 0.45]);
    glow(540, 560, 420, EMB, 0.18);
    flame(540, 830, 470, 700, lt + 3, 5, [VER, EMB]); flameCuts(540, 830, 470, 700, lt, 8);
    woman(540, 820, 0.86, lt * 5, womanImg('low'), { t: lt });
    flamePath(540, 832, 170, 170, lt * 1.3 + 2, 4); ctx.fillStyle = PAP; ctx.fill();
    embers(lt, 22, 9, 300, 780, 820, 650, 0.9);
    ribbon('IN THE STORY', 90, 230, seg(lt, 0.05, 0.5), { size: 40 });
    const p = seg(lt, kT - 0.05, kT + 0.5);
    if (p > 0.5) put(KUYv(), 540 + r[0], 1070 + r[1], 1, seg(p, 0.5, 1));
    revealPut(KUY(), 540, 1070, 1, p, { rows: 3, t: lt, chip: INK });
  };

  // a4 · the gunpowder store, the flash, the paper burn
  const sA4 = (lt, d) => {
    inkBg(); const fT = tStoreE - tGun, bT = fT + 0.12;
    glow(560, 1000, 700, EMB, 0.1 + 0.25 * seg(lt, 0.3, fT));
    put(storeImg(), 560, 1160, 0.95);
    doorPath(560, 1160, 120, 210); ctx.fillStyle = INK; ctx.fill();
    ctx.save(); doorPath(560, 1160, 120, 210); ctx.clip(); glow(560, 1110, 200, EMB, 0.2 + 0.7 * seg(lt, 0.4, fT)); ctx.restore();
    const wk = seg(lt, 0, 0.85), x = lerp(110, 545, eio(wk)), fa = 1 - seg(lt, 0.8, 1.0), s = lerp(0.42, 0.34, wk);
    if (fa > 0) { ctx.globalAlpha = fa; flame(x, 1162, 160, 330, lt, 3, [VER, EMB]); woman(x, 1160, s, lt * 7, womanImg('low'), { t: lt }); flameCuts(x, 1162, 160, 330, lt, 4); ctx.globalAlpha = 1; }
    embers(lt, 20, 21, 60, 1020, 1160, 600, 0.7);
    ribbon('GUNPOWDER STORE', 80, 300, seg(lt, 0.1, 0.5), { size: 40 });
    const fl = seg(lt, fT, fT + 0.1) * (1 - seg(lt, fT + 0.15, fT + 0.6));
    if (fl > 0) {
      ctx.save(); ctx.translate(560, 1060); ctx.rotate(lt * 0.4);
      ctx.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, l = (700 + rnd(i) * 900) * eo(fl); P([[cos(a - 0.07) * 60, sin(a - 0.07) * 60], [cos(a) * l, sin(a) * l], [cos(a + 0.07) * 60, sin(a + 0.07) * 60]]); }
      ctx.fillStyle = rgba(VER, fl); ctx.fill(); ctx.restore();
      glow(560, 1060, 900, EMB, 0.9 * fl); glow(560, 1060, 360, PAP, fl);
    }
    if (lt > bT) burn(seg(lt, bT, d), 560, 1060, lt, () => sA5(0));
  };
  add({ id: 'a4', at: tGun, zoom: 0.08, cam: [560, 1000], note: 'carved gunpowder store, flame figure enters door, starburst flash, paper burn to a5', draw: (lt, d) => { sA4(lt, d); grain(); } });
  cue(tGun + 0.1, 'slide', { gain: 0.4 }); cue(tStoreE, 'slam', { gain: 0.8 }); cue(tStoreE + 0.02, 'rumble', { gain: 0.8, dur: 1.6 }); cue(tStoreE + 0.15, 'sizzle', { gain: 0.5, dur: 0.9 });

  add({ id: 'a5', at: t1, zoom: 0.08, cam: [540, 800], note: 'vermilion flame print with silhouette, IN THE STORY ribbon, KUYILI carved', draw: (lt) => { sA5(lt); grain(); } });
  cue(t1 + 0.05, 'slide', { gain: 0.35 }); cue(tKuy - 0.05, 'chisel', { gain: 0.7, dur: 0.6 }); cue(tKuy + 0.4, 'bell', { gain: 0.35 });

  // a6 · RECORD above, SONG below
  const sA6 = (lt, d) => {
    paperBg(); const rT = tRec1 - tBut, sT = tSong - tBut, pan = lerp(90, -90, eio(clamp(lt / d)));
    ctx.save(); ctx.translate(0, pan);
    const r = reg(lt, [rT + 0.1]);
    if (lt > rT) put(booksImg(VER), 560 + r[0], 600 + r[1], 1, seg(lt, rT, rT + 0.2));
    revealPut(booksImg(), 560, 600, 1, seg(lt, 0.02, 0.9), { rows: 4, t: lt });
    const bm = sin(lt * 3) * 0.08; ctx.save(); ctx.translate(700, 466); ctx.rotate(bm); ctx.fillStyle = VER; ctx.beginPath(); P([[0, 0], [22, 0], [22, 110], [11, 96], [0, 110]]); ctx.fill(); ctx.restore();
    ribbon('RECORD', 80, 230, seg(lt, rT, rT + 0.4), { size: 46 });
    const dv = eo(seg(lt, 0.3, 1.0)); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(70, 682); ctx.quadraticCurveTo(70 + 470 * dv, 674, 70 + 940 * dv, 684); ctx.quadraticCurveTo(70 + 470 * dv, 694, 70, 690); ctx.fill();
    const sp = seg(lt, 1.2, 1.9), wave = 0.35 + 0.65 * seg(lt, sT - 0.3, sT + 0.2);
    if (sp > 0) {
      const mx = 255 + 0.85 * 46, my = 1185 - 0.85 * 548;
      for (let i = 0; i < 4; i++) {
        const amp = (16 + i * 9) * wave, ang = -0.35 + i * 0.22, L0 = (380 + i * 90) * eo(seg(lt, 1.4 + i * 0.1, 2.2 + i * 0.1));
        let ex = mx, ey = my;
        for (let k = 0; k < 28; k++) {
          const u0 = k / 28, u1 = (k + 1) / 28; if (u1 * 640 > L0 + 1) break;
          const pt = (u) => { const dd = u * 640; return [mx + cos(ang) * dd - sin(ang) * sin(dd * 0.03 - lt * 7 + i) * amp * u, my + sin(ang) * dd + cos(ang) * sin(dd * 0.03 - lt * 7 + i) * amp * u]; };
          const a = pt(u0), b = pt(u1); ctx.strokeStyle = VER; ctx.lineCap = 'round'; ctx.lineWidth = lerp(5, 14, u0) * (0.6 + 0.4 * wave); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ex = b[0]; ey = b[1];
        }
        if (L0 > 300) { const fs = seg(L0, 300, 500) * wave; flame(ex + 10, ey + 24, 70 * fs, 110 * fs, lt * 1.4 + i, i * 4, [VER, EMB]); }
      }
      woman(255, 1185, 0.85, lt * 3, womanImg('low'), { walk: false, arm: 'sing', reveal: sp, limbA: seg(sp, 0.75, 1), t: lt });
    }
    ribbon('FOLK SONG', 520, 1080, seg(lt, sT, sT + 0.4), { size: 46 });
    ctx.restore();
  };
  add({ id: 'a6', at: tBut, zoom: 0.05, cam: [540, 760], note: 'tilt down: carved record stack RECORD / singer with vermilion song-lines into flames FOLK SONG', draw: (lt, d) => { sA6(lt, d); grain(); } });
  cue(tBut + 0.05, 'chisel', { gain: 0.5, dur: 0.8 }); cue(tRec1, 'slide', { gain: 0.4 }); cue(tRec1 + 0.1, 'tock', { gain: 0.4 }); cue(tSong, 'slide', { gain: 0.4 }); cue(tSong + 0.05, 'sparkle', { gain: 0.35 });

  // a7 · ink roller, RECORD, 1772 carved
  const T1772 = () => textImg('t1772', '1772', 300, PAP, INK), T1772v = () => textImg('t1772v', '1772', 300, VER);
  const sA7 = (lt) => {
    inkBg(); const s0 = t17 - t2, p = seg(lt, s0 - 0.1, s0 + 1.0), r = reg(lt, [tTwo - t2]);
    glow(540, 780, 600, VER, 0.08 + 0.1 * p);
    ribbon('RECORD', 80, 330, seg(lt, tRec2 - t2, tRec2 - t2 + 0.4), { size: 50 });
    if (p > 0.5) put(T1772v(), 540 + r[0], 780 + r[1], 1, seg(p, 0.5, 1));
    if (p <= 0) gougeTool(lerp(1250, 110, eo(seg(lt, 0.45, s0 - 0.1))), 650 + sin(lt * 5) * 10, 1, lt);
    revealPut(T1772(), 540, 780, 1, p, { rows: 4, t: lt });
    const ul = eo(seg(lt, s0 + 0.9, s0 + 1.4)); if (ul > 0) { ctx.fillStyle = VER; ctx.beginPath(); ctx.moveTo(160, 975); ctx.quadraticCurveTo(160 + 380 * ul, 962, 160 + 760 * ul, 972); ctx.quadraticCurveTo(160 + 380 * ul, 990, 160, 990); ctx.fill(); }
  };
  add({ id: 'a7', at: t2, zoom: 0.08, cam: [540, 760], note: 'ink roller wipe to black, RECORD ribbon, gouge carves 1772', draw: (lt, d) => { if (lt < 0.6) rollerWipe(lt / 0.6, () => sA6(D.a6, D.a6), () => sA7(lt)); else sA7(lt); grain(); } });
  cue(t2, 'whoosh', { gain: 0.45 }); cue(tRec2 + 0.05, 'slide', { gain: 0.4 }); cue(t17 - 0.05, 'chisel', { gain: 0.7, dur: 1.1 }); cue(tTwo, 'slam', { gain: 0.45 });

  // a8 · carved map: Kalaiyar Kovil in Sivaganga
  const sA8 = (lt, d) => {
    paperBg(); const wv = sin(lt * 1.8) * 8;
    put(seaImg(), wv, 0); put(mapImg(), 0, 0);
    const kp = seg(lt, 0.3, 0.6), sT = tSiv - tAt, sp = seg(lt, sT - 0.1, sT + 0.5);
    if (sp > 0) { ctx.save(); ctx.strokeStyle = VER; ctx.lineWidth = 9; ctx.setLineDash([24, 14]); ctx.lineDashOffset = -lt * 30; ctx.beginPath(); ctx.arc(SVG[0], SVG[1], 92, -PI / 2, -PI / 2 + TAU * eo(sp)); ctx.stroke(); ctx.restore(); }
    if (kp > 0) {
      for (let i = 0; i < 2; i++) { const ph = (lt * 0.8 + i * 0.5) % 1; ctx.strokeStyle = rgba(PAP, 0.6 * (1 - ph)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(KK[0], KK[1], 12 + ph * 50, 0, TAU); ctx.stroke(); }
      const k = eob(kp); ellF(KK[0], KK[1], 13 * k, 13 * k, PAP); ellF(KK[0], KK[1], 8 * k, 8 * k, VER);
      put(gopuramImg(), KK[0], KK[1] - 20, 0.9 * k);
    }
    ribbon('KALAIYAR KOVIL', 300, 530, seg(lt, 0.4, 0.85), { size: 34 });
    ribbon('SIVAGANGA', 380, 840, seg(lt, sT, sT + 0.4), { size: 34 });
  };
  add({ id: 'a8', at: tAt, zoom: 0.32, cam: [650, 690], note: 'print pull to carved map of southern Tamil country, Kalaiyar Kovil + gopuram, dashed Sivaganga ring', draw: (lt, d) => { if (lt < 0.55) printPull(lt / 0.55, () => sA7(D.a7), () => sA8(lt, d)); else sA8(lt, d); grain(); } });
  cue(tAt, 'slide', { gain: 0.5 }); cue(tKal + 0.3, 'pop', { gain: 0.5 }); cue(tSiv, 'chisel', { gain: 0.45, dur: 0.5 }); cue(tSiv + 0.1, 'slide', { gain: 0.35 });

  // a9 · Company rows march
  const sA9 = (lt) => {
    paperBg(); const r = reg(lt, [tTroops - t3]);
    put(discImg('sun9', 290, VER, PAP, 0.38), 760 + r[0], 690 + r[1], 1);
    put(groundImg('a9', 1400, 80, INK, PAP), 540, 1196);
    const march = lt * 120;
    for (const [y, s] of [[1020, 0.6], [1105, 0.74], [1200, 0.9]]) {
      const sp = 190 * s; for (let i = 0; i < 14; i++) { const x = -260 + i * sp + march + (s === 0.74 ? sp / 2 : 0); if (x < -120 || x > W + 120) continue; soldier(x, y, s, lt * 7.5, 0, SLATE); }
    }
    ribbon('EAST INDIA COMPANY', 60, 250, seg(lt, 0.1, 0.55), { size: 42 });
  };
  add({ id: 'a9', at: t3, zoom: 0.07, cam: [600, 900], note: 'rows of slate-blue Company silhouettes march before carved vermilion sun, EAST INDIA COMPANY', draw: (lt) => { sA9(lt); grain(); } });
  cue(t3 + 0.1, 'slide', { gain: 0.4 }); for (let k = 0; k < 4; k++) cue(t3 + 0.2 + k * 0.42, 'drum', { gain: 0.45 - k * 0.04 });

  // a10 · the attack on the fort
  const sA10 = (lt) => {
    paperBg(); const aT = tAtt - tNawab, ak = lt > aT ? Math.exp(-(lt - aT) * 6) : 0, r = reg(lt, [aT]);
    ctx.save(); ctx.translate(sin(lt * 91) * ak * 12, cos(lt * 73) * ak * 9);
    const bp = seg(lt, aT, aT + 0.35);
    if (bp > 0) { ctx.save(); ctx.translate(640, 640); ctx.rotate(lt * 0.15); ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, l = (420 + rnd(i * 3) * 300) * eo(bp); P([[cos(a - 0.09) * 80, sin(a - 0.09) * 80], [cos(a) * l, sin(a) * l], [cos(a + 0.09) * 80, sin(a + 0.09) * 80]]); } ctx.fillStyle = EMB; ctx.fill(); ctx.restore(); }
    put(discImg('sun10', 260, VER, PAP, 0.38), 640 + r[0], 640 + r[1], 1);
    ctx.beginPath(); ctx.moveTo(230, 1050); ctx.quadraticCurveTo(380, 838, 650, 842); ctx.quadraticCurveTo(930, 846, 1080, 1050); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
    put(fortImg(), 660, 870, 0.82);
    if (lt > aT) for (let i = 0; i < 6; i++) { const ph = clamp((lt - aT) * 0.9 - i * 0.06), x = 420 + i * 90 + sin(i * 2) * 20, y = 760 - ph * 380; ellF(x, y, (40 + i * 6) * (0.4 + ph), (32 + i * 4) * (0.4 + ph), rgba(SOOT, 0.85 * (1 - ph * 0.6))); }
    put(groundImg('a10', 1400, 70, INK, PAP), 540, 1222);
    const aim = seg(lt, aT, aT + 0.25);
    for (const [y, s, x0] of [[1080, 0.46, -120], [1160, 0.54, -180]]) for (let i = 0; i < 5; i++) soldier(x0 + i * 100 + lt * 90, y, s, lt * 7.5, aim, SLATE);
    for (let i = 0; i < 3; i++) {
      const hx = 1080 - lt * 160 + i * 140, hy = 1210 - i * 40, ph = lt * 13 + i * 1.7;
      horse(hx, hy, 0.5 - i * 0.04, ph, horseNawabImg(SOOT), SOOT, { flip: true, extra: () => { ctx.strokeStyle = SOOT; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-40, -260); ctx.lineTo(220, -470); ctx.stroke(); ctx.beginPath(); ctx.moveTo(214, -466); ctx.lineTo(214 - 90, -470 + sin(ph * 1.3) * 12 - 10); ctx.lineTo(206, -432); ctx.closePath(); ctx.fillStyle = VER; ctx.fill(); } });
    }
    ctx.restore();
    ribbon('+ NAWAB OF ARCOT', 60, 250, seg(lt, 0.05, 0.5), { size: 42 });
  };
  add({ id: 'a10', at: tNawab, zoom: 0.07, cam: [640, 900], note: 'carved fort + gopuram on hill; Company files left, Nawab horsemen right; starburst + smoke on "attacked"', draw: (lt) => { sA10(lt); grain(); } });
  cue(tNawab + 0.05, 'slide', { gain: 0.4 }); cue(tNawab + 0.1, 'drum', { gain: 0.4 }); cue(tAtt, 'slam', { gain: 0.8 }); cue(tAtt + 0.02, 'rumble', { gain: 0.7, dur: 1.2 });

  // a11 · the king
  const sA11 = (lt) => {
    paperBg(); const r = reg(lt, [0.5]);
    put(arcadeImg(), 540, 1240, 1);
    put(groundImg('a11', 1400, 60, INK, PAP), 540, 1236);
    ctx.save(); ctx.translate(860, 1240); ctx.fillStyle = INK; ctx.fillRect(-7, -900, 14, 900); ellF(0, -906, 14, 14, INK);
    ctx.beginPath(); ctx.moveTo(7, -890); for (let k = 0; k <= 10; k++) ctx.lineTo(7 + k * 18, -890 + sin(k * 0.7 - lt * 8) * 14 * k / 10); ctx.lineTo(7 + 180 - 30, -790 + sin(10 * 0.7 - lt * 8) * 14); ctx.lineTo(7 + 180, -720 + sin(10 * 0.7 - lt * 8) * 14);
    for (let k = 10; k >= 0; k--) ctx.lineTo(7 + k * 18, -740 + sin(k * 0.7 - lt * 8) * 14 * k / 10); ctx.closePath(); ctx.fillStyle = VER; ctx.fill(); ctx.restore();
    for (let i = 0; i < 4; i++) { const ph = (lt * 0.25 + i * 0.25) % 1; ellF(1100 - ph * 1300, 380 + i * 60 + sin(lt + i) * 10, 80 + i * 10, 34, rgba(SOOT, 0.35 * sin(ph * PI))); }
    const p = seg(lt, 0, 0.5), kx = 450, ky = 1240, s = 1.12;
    revealPut(kingImg(), kx, ky, s, p, { rows: 7, t: lt });
    if (p >= 1) put(crownImg(VER), kx + 6 * s + r[0], ky - 600 * s + r[1], s);
    if (p > 0.6) put(crownImg(), kx + 6 * s, ky - 600 * s, s, seg(p, 0.6, 1));
    ribbon('KING MUTHU VADUGANATHA', 50, 232, seg(lt, tMuthu - tKing, tMuthu - tKing + 0.45), { size: 36 });
    ribbon('ILLUSTRATION', 770, 150, seg(lt, 0.2, 0.5), { size: 22 });
  };
  add({ id: 'a11', at: tKing, zoom: 0.07, cam: [480, 760], note: 'king silhouette gouge-carved, carved crown + vermilion copy, colonnade, royal banner flutters, name ribbon', draw: (lt) => { sA11(lt); grain(); } });
  cue(tKing, 'chisel', { gain: 0.55, dur: 0.6 }); cue(tMuthu, 'slide', { gain: 0.4 });

  // a12 · the crown falls, the banner drops
  const sA12 = (lt) => {
    paperBg(); const fT = 0.42, ky = 1180;
    glow(540, 700, 700, VER, 0.12 * seg(lt, 0, 1));
    put(groundImg('a12', 1400, 80, INK, PAP), 540, ky);
    const bd = eio(seg(lt, 0.0, 1.1)) * 700; ctx.save(); ctx.translate(860, ky); ctx.rotate(0.03 * sin(lt * 3)); ctx.fillStyle = INK; ctx.fillRect(-7, -880, 14, 880);
    ctx.beginPath(); const sag = seg(bd, 200, 700); ctx.moveTo(7, -870 + bd); for (let k = 0; k <= 10; k++) ctx.lineTo(7 + k * 18 * (1 - sag * 0.6), -870 + bd + sin(k * 0.7 - lt * 6) * 10 * k / 10 + k * k * 1.2 * sag); ctx.lineTo(7 + 180 * (1 - sag * 0.6), -720 + bd + 120 * sag); for (let k = 10; k >= 0; k--) ctx.lineTo(7 + k * 18 * (1 - sag * 0.6), -720 + bd + sin(k * 0.7 - lt * 6) * 10 * k / 10 + k * k * 1.2 * sag * 0.3); ctx.closePath(); ctx.fillStyle = VER; ctx.fill(); ctx.restore();
    let cy, rot, cx = 460;
    if (lt < fT) { const u = lt / fT; cy = lerp(180, ky, u * u); rot = -u * 5.4; }
    else { const u = lt - fT; cy = ky - Math.abs(sin(u * 9)) * 60 * Math.exp(-u * 6); rot = -5.4 + (-2 * PI - 0.5 + 5.4) * eo(clamp(u / 0.5)); cx = 460 - 40 * eo(clamp(u / 0.6)); }
    if (lt > fT) for (let i = 0; i < 7; i++) { const u = clamp((lt - fT) / 0.9), a = PI + i / 6 * PI; ellF(cx + cos(a) * 200 * eo(u), ky - 10 + sin(a) * 50 * eo(u), 40 * (1 - u * 0.6), 22 * (1 - u * 0.6), rgba(SOOT, 0.5 * (1 - u))); }
    const r = reg(lt, [fT]);
    const he = lerp(165, 120, Math.abs(sin(rot))) - (lt > fT ? 12 : 0); ctx.save(); ctx.translate(cx, cy - he); ctx.rotate(rot);
    put(crownImg(VER), r[0], 160 + r[1], 2.4); put(crownImg(), 0, 160, 2.4); ctx.restore();
    for (let i = 0; i < 14; i++) { const ph = (lt * 0.6 + rnd(i)) % 1; ctx.fillStyle = rgba(SOOT, 0.6 * (1 - ph)); ctx.fillRect(rnd(i * 3) * W, 150 + ph * 1050, 6, 4); }
  };
  add({ id: 'a12', at: tKilled, zoom: 0.08, cam: [520, 1000], note: 'carved crown tumbles and lands, banner pole topples, dust (no gore)', draw: (lt) => { sA12(lt); grain(); } });
  cue(tKilled, 'whoosh', { gain: 0.4 }); cue(tKilled + 0.42, 'thud', { gain: 0.9 }); cue(tKilled + 0.45, 'rumble', { gain: 0.4, dur: 1 });

  // a13 · queen Velu Nachiyar
  const sA13 = (lt) => {
    paperBg(); const nT = tVelu - t4, r = reg(lt, [nT]);
    put(discImg('q', 340, VER, PAP, 0.4), 600 + r[0], 640 + r[1], 1 + 0.03 * lt);
    put(groundImg('a13', 1400, 60, INK, PAP), 540, 1236);
    const p = seg(lt, 0, 0.62);
    woman(640, 1240, 1.3, 0, womanImg('high'), { walk: false, arm: 'sword', reveal: p, limbA: seg(p, 0.7, 1), t: lt, glint: seg(lt, 0.7, 1.4) });
    ctx.save(); ctx.translate(640, 1240); ctx.scale(1.3, 1.3); ctx.beginPath(); ctx.moveTo(-76, -330); for (let k = 0; k <= 8; k++) ctx.lineTo(-76 - k * 12, -330 + k * 9 + sin(k * 0.9 - lt * 9) * 6 * k / 8); for (let k = 8; k >= 0; k--) ctx.lineTo(-76 - k * 12, -304 + k * 9 + sin(k * 0.9 - lt * 9) * 6 * k / 8); ctx.closePath(); ctx.fillStyle = rgba(INK, seg(p, 0.7, 1)); ctx.fill(); ctx.restore();
    ribbon('VELU NACHIYAR', 50, 250, seg(lt, nT, nT + 0.4), { size: 50 });
    ribbon('ILLUSTRATION', 50, 340, seg(lt, nT + 0.2, nT + 0.5), { size: 22 });
  };
  add({ id: 'a13', at: t4, zoom: 0.08, cam: [600, 760], note: 'queen with high knot + raised sword gouge-carved over vermilion disc, sword glint, name ribbon', draw: (lt) => { sA13(lt); grain(); } });
  cue(t4, 'chisel', { gain: 0.6, dur: 0.7 }); cue(tVelu, 'swell', { gain: 0.45, dur: 1.4 }); cue(tVelu + 0.05, 'slide', { gain: 0.4 });

  // a14 · night escape on horseback
  const sA14 = (lt, d) => {
    inkBg(); const sc = lt * 380;
    glow(160, 960, 520, EMB, 0.3 + 0.05 * sin(lt * 9)); glow(160, 960, 260, VER, 0.3);
    put(discImg('moon', 110, PAP, INK, 0.35), 830, 360, 1);
    ctx.save(); ctx.translate(170, 960); ctx.scale(0.3, 0.3); put(fortImg(), 0, 0); for (let i = 0; i < 4; i++) flame(-260 + i * 170, -150 - (i % 2) * 60, 140, 260, lt + i, i, [VER, EMB]); ctx.restore();
    embers(lt, 26, 41, 40, 320, 920, 600, 0.9);
    ctx.beginPath(); ctx.moveTo(-200, 1000); for (let i = 0; i <= 12; i++) ctx.lineTo(-200 + i * 125, 965 + sin(i * 1.3 + 1) * 26); ctx.lineTo(1300, 1300); ctx.lineTo(-200, 1300); ctx.closePath(); ctx.fillStyle = '#231C19'; ctx.fill();
    for (let i = 0; i < 6; i++) { const x = ((1400 - i * 260 - sc * 0.5) % 1560 + 1560) % 1560 - 240; put(palmImg(SOOT), x, 1010 + (i % 2) * 20, 0.62 + (i % 3) * 0.06); }
    put(groundImg('a14', 1400, 80, SOOT, PAP, 0.25), 540, 1180);
    ctx.fillStyle = rgba(PAP, 0.35); for (let i = 0; i < 12; i++) { const x = ((1300 - i * 120 - sc * 1.6) % 1440 + 1440) % 1440 - 180; ctx.fillRect(x, 1200 + (i % 3) * 18, 70 + (i % 4) * 20, 4); }
    const hx = lerp(330, 600, lt / d), ph = lt * 15;
    for (let i = 0; i < 4; i++) { const pp = (lt * 2 + i * 0.25) % 1; ellF(hx - 200 - pp * 260, 1170 - pp * 50, 30 + pp * 40, 16 + pp * 20, rgba(SOOT, 0.7 * (1 - pp))); }
    horse(hx, 1182, 1.22, ph, horseQueenImg(PAP, INK), PAP, {
      extra: (ph) => { ctx.beginPath(); ctx.moveTo(-36, -390); for (let k = 0; k <= 8; k++) ctx.lineTo(-36 - k * 20, -392 + k * 4 + sin(k * 0.9 - ph * 0.9) * 8 * k / 8); for (let k = 8; k >= 0; k--) ctx.lineTo(-36 - k * 20, -366 + k * 4 + sin(k * 0.9 - ph * 0.9) * 8 * k / 8); ctx.closePath(); ctx.fillStyle = VER; ctx.fill(); },
    });
    ribbon('WITH DAUGHTER VELLACHI', 50, 230, seg(lt, tDau - tEsc, tDau - tEsc + 0.45), { size: 40 });
    ribbon('ILLUSTRATION', 50, 310, seg(lt, tDau - tEsc + 0.2, tDau - tEsc + 0.5), { size: 22 });
  };
  add({ id: 'a14', at: tEsc, zoom: 0.06, cam: [560, 860], note: 'roller wipe to night: paper-carved queen + Vellachi gallop, moon, far fort burning, palms streak past', draw: (lt, d) => { if (lt < 0.5) rollerWipe(lt / 0.5, () => sA13(D.a13), () => sA14(lt, d)); else sA14(lt, d); grain(); } });
  cue(tEsc, 'whoosh', { gain: 0.5 }); for (let k = 0; k < 7; k++) cue(tEsc + 0.4 + k * 0.4, 'tock', { gain: 0.28 }); cue(tDau, 'slide', { gain: 0.4 });
}
