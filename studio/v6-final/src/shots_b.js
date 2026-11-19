// EPISODE 6 · worker B: shots b1-b11 (lines 5 to 9): women and children got less, the sanitary commissioner argued for
// 1.5 lb, one relief work was a canal through Madras, the 8 km Adyar-Cooum link dug segment by segment, the Governor
// (a plumed-hat silhouette only), the name pressed into the earth, and the diggers whose names were not recorded.
// ART DIRECTION "Shadow Play on Parched Earth": backlit bone-white screen, leather-puppet silhouettes on sticks with punched
// perforations, one flickering lamp, cracked earth, ONE signal colour (grain gold), woodblock labels, sepia plan-view trench.
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { lg, rgba, mixc, cached, blit } from './art.js';

// ───────── palette ─────────
const NIGHT = '#1E130C', UMB = '#3A2418', DUST = '#8E5E3A', DUST2 = '#A8744A', BONE = '#EFE4CC', GLOW = '#F6D9A0', INK = '#120B07', GOLD = '#E9B949', GOLDD = '#A87A1E', SEP = '#4A2E1A';
const SERIF = 'Caladea';
const LAMP = [540, 640];                       // the lamp's hot spot on the screen
const SCR = { x0: 64, x1: 1016, y0: 150, y1: 1256 }; // the cloth screen
const LEDGE = 1262;                            // top of the bottom beam (grain heaps sit on it)

// ───────── small helpers ─────────
const pr = (lt, s, dur = 0.4) => clamp((lt - s) / dur);
const flick = (t) => 0.5 * Math.sin(t * 13.1) + 0.3 * Math.sin(t * 7.3 + 1) + 0.2 * Math.sin(t * 23.7 + 2);
const mkCanvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
function polyPath(pts) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
function smoothPath(p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length - 1; i++) { const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my); } ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]); }
const plen = (p) => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; };
/** point at fraction k along a polyline (+ heading) */
function along(p, k) {
  const lim = plen(p) * clamp(k); let acc = 0;
  for (let i = 1; i < p.length; i++) { const sl = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + sl >= lim) { const f = (lim - acc) / (sl || 1); return [lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f), Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0])]; } acc += sl; }
  const n = p.length - 1; return [p[n][0], p[n][1], Math.atan2(p[n][1] - p[n - 1][1], p[n][0] - p[n - 1][0])];
}
/** the first k of a polyline as a sub-polyline */
function sub(p, k) { const lim = plen(p) * clamp(k), out = [p[0]]; let acc = 0; for (let i = 1; i < p.length; i++) { const sl = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + sl >= lim) { const f = (lim - acc) / (sl || 1); out.push([lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]); return out; } out.push(p[i]); acc += sl; } return out; }
function distPoly(x, y, p) { let best = 1e9; for (let i = 1; i < p.length; i++) { const [ax, ay] = p[i - 1], [bx, by] = p[i], dx = bx - ax, dy = by - ay, u = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)); best = Math.min(best, Math.hypot(x - ax - u * dx, y - ay - u * dy)); } return best; }

// ───────── offscreen layers (shadow layer, transition frames) ─────────
let SH = null;
/** draw fn into a scratch layer with the current camera transform; returns the layer canvas */
function layer(fn, cv) {
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, W, H);
  g.setTransform(ctx.getTransform()); const prev = ctx; setCtx(g); try { fn(); } finally { setCtx(prev); }
  return cv;
}
/** puppet shadows: drawn opaque into a layer (perforations punched out), then laid on the screen soft and breathing with the flame */
function shadows(t, fn, o = {}) {
  if (!SH) SH = mkCanvas(W, H);
  const f = 1 + 0.015 * flick(t);
  layer(() => { ctx.translate(LAMP[0], LAMP[1]); ctx.scale(f, f); ctx.translate(-LAMP[0], -LAMP[1]); fn(); }, SH);
  ctx.save(); ctx.beginPath(); ctx.rect(SCR.x0, SCR.y0, SCR.x1 - SCR.x0, (o.y1 || SCR.y1) - SCR.y0); ctx.clip();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = `blur(${(1.1 + 0.6 * Math.abs(flick(t * 1.3))).toFixed(2)}px)`; ctx.globalAlpha = o.a ?? 0.93; ctx.drawImage(SH, 0, 0);
  ctx.restore();
}

// ───────── the stage: screen, frame, cracked earth ─────────
function stageImg() {
  return cached('b:stage', W, H, 1, () => {
    ctx.fillStyle = NIGHT; ctx.fillRect(0, 0, W, H);
    // night behind the frame: faint warm spill
    let g = ctx.createRadialGradient(LAMP[0], LAMP[1], 100, LAMP[0], LAMP[1], 1100); g.addColorStop(0, 'rgba(90,55,30,0.6)'); g.addColorStop(1, 'rgba(30,19,12,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1300);
    // the cloth, lit from behind
    const { x0, x1, y0, y1 } = SCR;
    g = ctx.createRadialGradient(LAMP[0], LAMP[1], 30, LAMP[0], LAMP[1] + 80, 860);
    g.addColorStop(0, '#FFF3D6'); g.addColorStop(0.18, GLOW); g.addColorStop(0.5, '#E6CFA2'); g.addColorStop(0.82, '#B98F5C'); g.addColorStop(1, '#7A5434');
    ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    // stains and weave
    for (let i = 0; i < 14; i++) { const x = x0 + rnd(i + 3) * (x1 - x0), y = y0 + rnd(i * 5 + 1) * (y1 - y0), r = 60 + rnd(i + 8) * 200; const q = ctx.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(120,80,40,${0.04 + rnd(i) * 0.06})`); q.addColorStop(1, 'rgba(120,80,40,0)'); ctx.fillStyle = q; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    ctx.globalAlpha = 0.05; ctx.fillStyle = '#5A3A22';
    for (let x = x0; x < x1; x += 4) ctx.fillRect(x, y0, 1, y1 - y0);
    for (let y = y0; y < y1; y += 4) ctx.fillRect(x0, y, x1 - x0, 1);
    ctx.globalAlpha = 1;
    // a seam with stitches
    ctx.strokeStyle = 'rgba(110,72,40,0.28)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(352, y0); ctx.lineTo(356, y1); ctx.stroke();
    ctx.setLineDash([8, 10]); ctx.beginPath(); ctx.moveTo(360, y0); ctx.lineTo(364, y1); ctx.stroke(); ctx.setLineDash([]);
    // cloth hem
    ctx.strokeStyle = 'rgba(90,58,30,0.55)'; ctx.lineWidth = 14; ctx.strokeRect(x0 + 7, y0 + 7, x1 - x0 - 14, y1 - y0 - 14);
    ctx.strokeStyle = 'rgba(60,36,18,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([10, 9]); ctx.strokeRect(x0 + 20, y0 + 20, x1 - x0 - 40, y1 - y0 - 40); ctx.setLineDash([]);
    ctx.restore();
    // wooden frame: posts, top beam, bottom beam (the ledge)
    const wood = (x, y, w, h, vert) => {
      ctx.fillStyle = vert ? lg(x, 0, x + w, 0, [[0, '#2A170B'], [0.35, '#6B4426'], [0.7, '#4A2E1A'], [1, '#1E1108']]) : lg(0, y, 0, y + h, [[0, '#7A5030'], [0.3, '#5A3820'], [1, '#22130A']]);
      ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(20,10,4,0.35)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) { ctx.beginPath(); if (vert) { const xx = x + 4 + rnd(i + x) * (w - 8); ctx.moveTo(xx, y); ctx.bezierCurveTo(xx + 4, y + h * 0.3, xx - 4, y + h * 0.6, xx + 2, y + h); } else { const yy = y + 4 + rnd(i + y) * (h - 8); ctx.moveTo(x, yy); ctx.bezierCurveTo(x + w * 0.3, yy + 3, x + w * 0.6, yy - 3, x + w, yy + 1); } ctx.stroke(); }
    };
    wood(26, 96, 40, 1290, true); wood(1014, 96, 40, 1290, true);
    wood(10, 110, 1060, 42, false);
    // lashings at the corners
    for (const [x, y] of [[46, 130], [1034, 130], [46, 1278], [1034, 1278]]) { ctx.strokeStyle = '#B08A5A'; ctx.lineWidth = 4; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(x - 22, y + k * 7 - 6); ctx.lineTo(x + 22, y + k * 7 + 6); ctx.stroke(); } }
    // the parched earth, lit near the screen
    const ey = 1296;
    ctx.fillStyle = lg(0, ey, 0, H, [[0, '#B88050'], [0.18, DUST2], [0.55, DUST], [1, '#3A2418']]); ctx.fillRect(0, ey, W, H - ey);
    g = ctx.createRadialGradient(540, ey, 40, 540, ey + 80, 760); g.addColorStop(0, 'rgba(255,214,150,0.35)'); g.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = g; ctx.fillRect(0, ey, W, H - ey);
    // cracked plates in perspective
    const rows = [], N = 9; for (let j = 0; j <= N; j++) rows.push(ey + Math.pow(j / N, 1.6) * (H - ey + 60));
    const pts = []; for (let j = 0; j <= N; j++) { const r = []; const cw = 70 + j * 26; for (let i = -2; i <= Math.ceil(W / cw) + 2; i++) r.push([i * cw + (rnd(i * 13 + j * 7) - 0.5) * cw * 0.6, rows[j] + (j && j < N ? (rnd(i * 3 + j * 11) - 0.5) * (rows[j] - rows[j - 1]) * 0.5 : 0)]); pts.push(r); }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (let j = 1; j <= N; j++) {
      const lw = 1.5 + j * 0.5;
      for (const [col, off, w] of [['rgba(255,226,170,0.18)', 1.5, lw], ['rgba(30,16,8,0.75)', 0, lw]]) {
        ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
        const r = pts[j]; ctx.moveTo(r[0][0], r[0][1] + off); for (let i = 1; i < r.length; i++) { const mx = (r[i - 1][0] + r[i][0]) / 2 + (rnd(i * 5 + j) - 0.5) * 18; ctx.lineTo(mx, (r[i - 1][1] + r[i][1]) / 2 + off + (rnd(i + j * 3) - 0.5) * 10); ctx.lineTo(r[i][0], r[i][1] + off); }
        const up = pts[j - 1]; for (let i = 0; i < r.length; i++) { const k = Math.min(up.length - 1, Math.round(i * (up.length - 1) / (r.length - 1)) + (rnd(i * 7 + j) > 0.5 ? 1 : 0)); const u = up[Math.min(up.length - 1, k)]; ctx.moveTo(r[i][0], r[i][1] + off); ctx.quadraticCurveTo((r[i][0] + u[0]) / 2 + (rnd(i + j * 9) - 0.5) * 30, (r[i][1] + u[1]) / 2 + off, u[0], u[1] + off); }
        ctx.stroke();
      }
    }
    // tiny hairline cracks, pebbles, dust
    for (let i = 0; i < 260; i++) { const x = rnd(i * 3 + 1) * W, y = ey + Math.pow(rnd(i * 7 + 2), 0.8) * (H - ey), s = 0.5 + (y - ey) / (H - ey); ctx.strokeStyle = 'rgba(40,22,10,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rnd(i) - 0.5) * 30 * s, y + (rnd(i + 4) - 0.5) * 12 * s); ctx.stroke(); }
    for (let i = 0; i < 70; i++) { const x = rnd(i * 9 + 4) * W, y = ey + 20 + rnd(i * 2 + 7) * (H - ey - 20), r = (1.5 + rnd(i) * 4) * (0.6 + (y - ey) / 700); ctx.fillStyle = 'rgba(40,22,10,0.55)'; ctx.beginPath(); ctx.ellipse(x + 1, y + 1.5, r, r * 0.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = rnd(i + 3) > 0.5 ? '#C79B6A' : '#9C6E44'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, 0, 0, TAU); ctx.fill(); }
    // the bottom beam (ledge), drawn last so it sits on the earth
    wood(10, LEDGE, 1060, 40, false); ctx.fillStyle = 'rgba(255,220,160,0.35)'; ctx.fillRect(10, LEDGE, 1060, 3);
    ctx.fillStyle = lg(0, LEDGE + 40, 0, LEDGE + 80, [[0, 'rgba(20,10,4,0.55)'], [1, 'rgba(20,10,4,0)']]); ctx.fillRect(0, LEDGE + 40, W, 40);
  });
}
function stage(t, o = {}) {
  ctx.drawImage(stageImg(), 0, 0);
  // the flame breathes: the hot spot swells and dims
  const fl = flick(t), r = 520 + 30 * fl;
  const g = ctx.createRadialGradient(LAMP[0], LAMP[1], 0, LAMP[0], LAMP[1], r); g.addColorStop(0, `rgba(255,246,220,${0.22 + 0.1 * fl})`); g.addColorStop(1, 'rgba(255,230,180,0)');
  ctx.save(); ctx.beginPath(); ctx.rect(SCR.x0, SCR.y0, SCR.x1 - SCR.x0, SCR.y1 - SCR.y0); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(LAMP[0] - r, LAMP[1] - r, r * 2, r * 2);
  ctx.fillStyle = `rgba(30,16,6,${0.06 - 0.05 * fl})`; ctx.fillRect(SCR.x0, SCR.y0, SCR.x1 - SCR.x0, SCR.y1 - SCR.y0); ctx.restore();
}
/** dust motes drifting in the lamp beam (pure function of t) */
function motes(t, n = 46, seed = 0, a = 0.55, y0 = 0, y1 = H) {
  for (let i = 0; i < n; i++) {
    const sp = 8 + rnd(i + seed) * 22, x = ((rnd(i * 3 + seed) * (W + 200) + t * sp * (rnd(i + 2) > 0.5 ? 1 : -1)) % (W + 200) + W + 200) % (W + 200) - 100;
    const y = y0 + (((rnd(i * 7 + seed) * (y1 - y0) - t * (6 + rnd(i + 5) * 14) + Math.sin(t * 0.6 + i) * 30) % (y1 - y0)) + (y1 - y0)) % (y1 - y0);
    const near = Math.max(0, 1 - Math.hypot(x - LAMP[0], (y - LAMP[1]) * 0.6) / 900), tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.7 + i * 2.3)), r = 1.2 + rnd(i + 9) * 2.6;
    ctx.fillStyle = `rgba(255,232,180,${a * tw * (0.25 + near)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
}
/** a dust devil: a twisting column of motes over the earth */
function dustDevil(t, x, y, h = 260, a = 0.5) {
  for (let i = 0; i < 70; i++) { const u = i / 70, ang = t * 5 + i * 0.9, rr = 10 + u * u * 70, px = x + Math.cos(ang) * rr + Math.sin(t * 0.8) * 30 * u, py = y - u * h + Math.sin(ang) * rr * 0.25; ctx.fillStyle = `rgba(210,170,120,${a * (1 - u) * (0.4 + 0.6 * rnd(i))})`; ctx.beginPath(); ctx.arc(px, py, 1.5 + rnd(i + 4) * 3, 0, TAU); ctx.fill(); }
}
function vignette(a = 0.55) {
  const g = ctx.createRadialGradient(540, 760, 380, 540, 860, 1400); g.addColorStop(0, 'rgba(14,8,4,0)'); g.addColorStop(1, `rgba(14,8,4,${a})`);
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
}

// ───────── woodblock lettering ─────────
/** hand-pressed woodblock word: uneven letters, rough inked edges, worn speckles (cached per string/colour) */
function woodImg(str, size, col, seed = 1, font = 'Inter', weight = 900) {
  const key = `b:wood:${str}:${size}:${col}:${seed}:${font}`;
  ctx.save(); ctx.font = `${weight} ${size}px ${font}`; const ws = [...str].map((ch) => ctx.measureText(ch).width); ctx.restore();
  const sp = size * 0.06, tw = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1), pad = size * 0.3, w = tw + pad * 2, h = size * 1.5;
  const c = cached(key, w, h, 1, () => {
    ctx.font = `${weight} ${size}px ${font}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = col;
    let x = pad;
    [...str].forEach((ch, i) => {
      const r = (rnd(seed * 31 + i) - 0.5) * 0.07, dy = (rnd(seed * 17 + i * 3) - 0.5) * size * 0.06, sc = 1 + (rnd(seed + i * 7) - 0.5) * 0.06;
      ctx.save(); ctx.translate(x + ws[i] / 2, h / 2 + dy); ctx.rotate(r); ctx.scale(sc, sc);
      for (const [ox, oy, a] of [[0, 0, 1], [1.4, 0.8, 0.5], [-1, 1.2, 0.45], [0.6, -1.3, 0.4]]) { ctx.globalAlpha = a; ctx.fillText(ch, -ws[i] / 2 + ox, oy); }
      ctx.restore(); x += ws[i] + sp;
    });
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-out';
    const n = Math.round(w * h / 90);
    for (let i = 0; i < n; i++) { ctx.fillStyle = `rgba(0,0,0,${0.35 + rnd(i + seed) * 0.65})`; ctx.beginPath(); ctx.arc(rnd(i * 3 + seed) * w, rnd(i * 7 + seed + 1) * h, 0.5 + rnd(i * 11) * 1.8, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = 'rgba(0,0,0,0.28)'; for (let i = 0; i < 16; i++) { const y = rnd(i * 5 + seed) * h; ctx.lineWidth = 0.8 + rnd(i) * 1.6; ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + (rnd(i + 2) - 0.5) * 6); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over';
  });
  c._w = w; c._h = h; return c;
}
/** draw a woodblock word centred at (x, y); p = press progress (0..1): drops from 1.25x and lands with a tiny bounce */
function wood(str, x, y, size, col, p = 1, seed = 1, o = {}) {
  if (p <= 0) return; const c = woodImg(str, size, col, seed, o.font || 'Inter', o.weight || 900);
  const k = clamp(p / 0.6), s = lerp(1.25, 1, eo(k)) * (1 + 0.02 * Math.sin(clamp((p - 0.6) / 0.4) * Math.PI)) * (o.s || 1);
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.globalAlpha *= clamp(p / 0.35) * (o.a ?? 1);
  ctx.drawImage(c, -c._w * s / 2, -c._h * s / 2, c._w * s, c._h * s); ctx.restore();
}
/** a small serif note */
function note(str, x, y, size = 40, col = INK, a = 1, o = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${o.italic ? 'italic ' : ''}700 ${size}px ${SERIF}`; ctx.letterSpacing = (o.sp ?? 2) + 'px'; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(str, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
/** a wooden name plank hanging on two cords from the top beam, swinging in */
function plank(lines, x, y, w, h, t, p = 1, o = {}) {
  if (p <= 0) return;
  const k = eob(clamp(p / 0.5)), dy = (1 - k) * -(y + h), sw = Math.sin(t * 2.2) * 0.012 + (1 - clamp(p)) * 0.08 * Math.sin(p * 18);
  ctx.save(); ctx.translate(x, y + dy); ctx.rotate(sw);
  ctx.strokeStyle = '#2A1A0E'; ctx.lineWidth = 3; for (const sx of [-w * 0.36, w * 0.36]) { ctx.beginPath(); ctx.moveTo(sx, -h / 2); ctx.lineTo(sx * 0.9, -(y + dy) + 130); ctx.stroke(); }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.fillStyle = lg(0, -h / 2, 0, h / 2, [[0, '#7A5030'], [0.5, '#5A3820'], [1, '#3A2414']]); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.clip(); ctx.strokeStyle = 'rgba(20,10,4,0.3)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 9; i++) { const yy = -h / 2 + rnd(i + w) * h; ctx.beginPath(); ctx.moveTo(-w / 2, yy); ctx.bezierCurveTo(-w * 0.2, yy + 5, w * 0.2, yy - 5, w / 2, yy + 2); ctx.stroke(); } ctx.restore();
  ctx.strokeStyle = 'rgba(255,220,160,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 7); ctx.stroke();
  for (const sx of [-w * 0.36, w * 0.36]) { ctx.fillStyle = '#1E1108'; ctx.beginPath(); ctx.arc(sx, -h / 2 + 12, 5, 0, TAU); ctx.fill(); }
  lines.forEach(([s, size, yy, col], i) => wood(s, 0, yy, size, col || BONE, 1, 7 + i));
  ctx.restore();
}

// ───────── grain ─────────
function grain(x, y, r, s = 1, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.globalAlpha *= a;
  ctx.fillStyle = GOLDD; ctx.beginPath(); ctx.ellipse(0.6 * s, 0.8 * s, 5.2 * s, 3.1 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.ellipse(0, 0, 4.8 * s, 2.7 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,244,200,0.75)'; ctx.beginPath(); ctx.ellipse(-1.4 * s, -0.9 * s, 1.8 * s, 0.9 * s, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
const HEAPS = new Map();
/** grain positions for a parabolic heap of n grains, half-width w, height h (bottom-up order) */
function heapPts(n, w, h, seed) {
  const key = `${n}:${w}:${h}:${seed}`; if (HEAPS.has(key)) return HEAPS.get(key);
  const out = []; let i = 0;
  while (out.length < n && i < n * 8) { const u = rnd(i * 2 + seed) * 2 - 1, v = rnd(i * 5 + seed + 0.37); i++; const top = h * (1 - u * u); if (v * h > top) continue; out.push([u * w, -v * h, rnd(i + seed * 3) * TAU, 0.85 + rnd(i * 7) * 0.3]); }
  out.sort((a, b) => b[1] - a[1]); HEAPS.set(key, out); return out;
}
/** a heap on the ledge at (x, y): n grains total, `shown` of them settled so far; sc scales grain size */
function heap(x, y, n, shown, w, h, seed = 1, sc = 1.3) {
  const pts = heapPts(n, w, h, seed);
  ctx.fillStyle = 'rgba(20,10,4,0.4)'; ctx.beginPath(); ctx.ellipse(x, y + 3, w * 1.08, 8, 0, 0, TAU); ctx.fill();
  const m = Math.min(pts.length, Math.floor(shown));
  for (let i = 0; i < m; i++) { const [px, py, r, s] = pts[i]; grain(x + px, y + py, r, s * sc); }
  // rim light from the screen behind
  if (m > 20) { const topY = pts[m - 1][1]; const g = ctx.createLinearGradient(0, y + topY, 0, y); g.addColorStop(0, 'rgba(255,240,190,0.18)'); g.addColorStop(1, 'rgba(60,30,8,0.25)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w, y); for (let k = 0; k <= 20; k++) { const u = -1 + k / 10; ctx.lineTo(x + u * w, y + Math.max(topY, -h * (1 - u * u))); } ctx.closePath(); ctx.fill(); }
}
/** a falling stream of grains from y0 into a heap top at (x, y1) */
function pour(x, y0, y1, lt, a = 1, n = 34, spread = 10) {
  for (let j = 0; j < n; j++) { const u = (lt * 1.6 + j / n) % 1, yy = lerp(y0, y1, u * u), xx = x + (rnd(j) - 0.5) * spread * (0.4 + u); grain(xx, yy, j + lt * 6, 1.1, a * clamp((1 - u) * 6)); }
}
const heapDims = (n, base = 1) => [base * 92 * Math.sqrt(n / 300), base * 74 * Math.sqrt(n / 300)];

// ───────── leather puppets ─────────
// Local units: feet at y = 0, head top at about -600; +x is the way the puppet faces.
// o = { x, y, s, dir, kind: man|woman|child|official|gov|digger|carrier, pose: {...radians}, mode: 'fill'|'stroke', holes, sticks, prop }
function puppet(o) {
  const { x, y, s = 1, dir = 1, kind = 'man', mode = 'fill', holes = true, sticks = true } = o, P = o.pose || {};
  const fill = mode === 'fill', joints = [], dots = [], slits = [];
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  ctx.fillStyle = o.col || INK; ctx.strokeStyle = o.col || INK; ctx.lineWidth = (o.lw || 3) / s; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const emit = () => (fill ? ctx.fill() : ctx.stroke());
  const cap = (x1, y1, x2, y2, w) => { const L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1); ctx.save(); ctx.translate(x1, y1); ctx.rotate(a); ctx.beginPath(); ctx.roundRect(-w / 2, -w / 2, L + w, w, w / 2); ctx.restore(); emit(); };
  const limb = (x0, y0, a1, a2, l1, l2, w1, w2) => { const ex = x0 + Math.sin(a1) * l1, ey = y0 + Math.cos(a1) * l1, a = a1 + a2, hx = ex + Math.sin(a) * l2, hy = ey + Math.cos(a) * l2; cap(x0, y0, ex, ey, w1); cap(ex, ey, hx, hy, w2); joints.push([ex, ey], [x0, y0]); return [hx, hy, a]; };
  const shape = (pts) => { polyPath(pts); emit(); };
  const disc = (cx, cy, rx, ry = rx) => { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); emit(); };
  const coat = kind === 'official' || kind === 'gov', child = kind === 'child', woman = kind === 'woman';
  const legL = child ? 120 : 155, hipY = -2 * legL;
  // legs
  const foot = (fx, fy, a) => { ctx.save(); ctx.translate(fx, fy); ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(30 + (coat ? 8 : 0), 2); ctx.lineTo(-10, 6); ctx.closePath(); ctx.restore(); emit(); };
  const lb = limb(-6, hipY, P.l1 ?? 0.06, P.l1b ?? 0, legL, legL, coat ? 24 : 18, coat ? 20 : 15); foot(lb[0], lb[1]);
  const lf = limb(8, hipY, P.r1 ?? -0.05, P.r1b ?? 0, legL, legL, coat ? 24 : 18, coat ? 20 : 15); foot(lf[0], lf[1]);
  if (coat) { cap(lb[0] - 6, lb[1] - 40, lb[0] + 4, lb[1] - 4, 26); cap(lf[0] - 6, lf[1] - 40, lf[0] + 4, lf[1] - 4, 26); }
  // lower garment
  if (woman) { shape([[-40, hipY - 30], [40, hipY - 30], [58, -150], [74, -18], [-62, -18], [-46, -150]]); for (let i = 0; i < 9; i++) dots.push([-52 + i * 14, -40, 4]); }
  else if (!coat) { shape([[-36, hipY - 20], [36, hipY - 20], [54, hipY + 120 * (child ? 0.7 : 1)], [-50, hipY + 132 * (child ? 0.7 : 1)]]); for (let i = 0; i < 7; i++) dots.push([-42 + i * 14, hipY + 110 * (child ? 0.7 : 1), 3.5]); }
  // upper body group (bends at the hip)
  ctx.save(); ctx.translate(0, hipY); ctx.rotate(P.bend ?? 0); ctx.translate(0, -hipY);
  const tl = child ? 140 : 190, shY = hipY - tl;
  const back = limb(-10, shY + 10, P.a1 ?? 0.12, P.a1b ?? 0.18, child ? 96 : 125, child ? 90 : 115, 19, 15);
  ctx.beginPath(); ctx.arc(back[0], back[1], 11, 0, TAU); emit();
  if (coat) {
    shape([[-46, shY - 6], [48, shY - 6], [56, hipY + 40], [70, hipY + 150], [-74, hipY + 170], [-56, hipY + 40]]);
    if (kind === 'gov') { shape([[-74, hipY + 120], [-104, hipY + 210], [-60, hipY + 175]]); for (let i = 0; i < 6; i++) dots.push([30, shY + 30 + i * 34, 5]); for (let i = 0; i < 10; i++) dots.push([-40 + i * 9, shY + 18 + i * 22, 3]); }
    else { for (let i = 0; i < 5; i++) dots.push([28, shY + 30 + i * 36, 4.5]); }
  } else {
    shape([[-36, shY], [40, shY], [32, shY + 70], [26, hipY - 10], [-30, hipY - 10], [-34, shY + 60]]);
    if (woman) { shape([[-40, shY - 4], [20, shY - 6], [-6, hipY + 40], [-52, hipY + 20]]); for (let i = 0; i < 6; i++) dots.push([-30 + i * 6, shY + 20 + i * 30, 3.5]); }
    else for (let i = 0; i < 4; i++) slits.push([shY + 46 + i * 24, child ? 18 : 24]);   // famine ribs, punched as slits
  }
  // neck + head
  const hr = child ? 30 : 28, hy = shY - 44 - (child ? 6 : 0);
  cap(0, shY + 4, 3, shY - 24, 16);
  ctx.save(); ctx.translate(4, hy); ctx.rotate(P.head ?? 0);
  disc(0, 0, hr, hr * 1.18);
  if (kind === 'official') { ctx.beginPath(); ctx.ellipse(0, -hr * 0.5, hr * 1.05, hr * 0.85, 0, Math.PI, TAU); ctx.closePath(); emit(); cap(-hr * 1.6, -hr * 0.42, hr * 1.7, -hr * 0.42, 9); }
  else if (kind === 'gov') {
    // the cocked hat: a wide crescent worn athwart, with a tall ostrich plume
    shape([[-hr * 2.6, -hr * 0.55], [-hr * 1.6, -hr * 1.5], [-hr * 0.2, -hr * 1.9], [hr * 1.4, -hr * 1.6], [hr * 2.6, -hr * 0.6], [hr * 1.6, -hr * 0.95], [0, -hr * 1.1], [-hr * 1.6, -hr * 0.9]]);
    const sw = o.plume ?? 0;
    for (let i = 0; i < 9; i++) { const a = -1.9 + i * 0.16 + sw * 0.1, L = hr * (2.6 + rnd(i + 3) * 1.4); ctx.save(); ctx.translate(-hr * 0.2, -hr * 1.75); ctx.rotate(a + Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, -3); ctx.quadraticCurveTo(L * 0.5, -10 - i, L, -2 + Math.sin(i) * 6); ctx.quadraticCurveTo(L * 0.5, 9, 0, 3); ctx.closePath(); ctx.restore(); emit(); }
    dots.push([hr * 0.0, -hr * 1.35, 5], [hr * 0.8, -hr * 1.25, 4], [-hr * 0.8, -hr * 1.2, 4]);
  } else if (woman) disc(-hr * 0.85, hr * 0.05, hr * 0.55);
  else disc(-hr * 0.7, -hr * 0.85, hr * 0.45);
  if (kind === 'carrier') { shape([[-hr * 2.4, -hr * 1.1], [hr * 2.4, -hr * 1.1], [hr * 1.6, -hr * 2.6], [-hr * 1.6, -hr * 2.6]]); for (let i = 0; i < 6; i++) dots.push([-hr * 1.5 + i * hr * 0.6, -hr * 1.8, 3.5]); }
  ctx.restore();
  if (kind === 'gov') { for (const sx of [-34, 40]) { ctx.beginPath(); ctx.ellipse(sx, shY + 2, 26, 12, 0, 0, TAU); emit(); for (let k = 0; k < 5; k++) cap(sx - 20 + k * 10, shY + 8, sx - 22 + k * 10, shY + 30, 4); } }
  // front arm + prop
  const fa = limb(12, shY + 10, P.a2 ?? 0.25, P.a2b ?? 0.35, child ? 96 : 125, child ? 90 : 115, 19, 15);
  ctx.beginPath(); ctx.arc(fa[0], fa[1], 12, 0, TAU); emit();
  const prop = o.prop || (kind === 'digger' ? 'hoe' : kind === 'official' ? 'ledger' : null);
  if (prop === 'hoe') { const a = fa[2] + (P.hoe ?? 0.2), dx = Math.sin(a), dy = Math.cos(a), ex = fa[0] + dx * 150, ey = fa[1] + dy * 150; cap(fa[0] - dx * 50, fa[1] - dy * 50, ex, ey, 9); ctx.save(); ctx.translate(ex, ey); ctx.rotate(-a + Math.PI / 2); ctx.beginPath(); ctx.roundRect(-6, -8, 22, 74, 6); ctx.restore(); emit(); }
  if (prop === 'ledger') { ctx.save(); ctx.translate(fa[0] + 10, fa[1] - 20); ctx.rotate(-0.25); ctx.beginPath(); ctx.roundRect(-8, -50, 96, 70, 4); ctx.restore(); emit(); if (o.page !== false) { ctx.save(); ctx.translate(fa[0] + 10, fa[1] - 20); ctx.rotate(-0.25); for (let i = 0; i < 4; i++) slits.push(null); ctx.restore(); } }
  if (prop === 'quill') { const a = fa[2] - 0.6; ctx.save(); ctx.translate(fa[0], fa[1]); ctx.rotate(-a + Math.PI); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(14, -60, 4, -130); ctx.quadraticCurveTo(-8, -60, 0, 0); ctx.restore(); emit(); }
  if (kind === 'gov') cap(-20, hipY - 10, -110, hipY + 120, 8);     // sword scabbard
  ctx.restore();
  // sticks running down out of frame
  if (fill && sticks) { ctx.save(); ctx.lineWidth = 5 / s * (o.stickW || 1); ctx.strokeStyle = o.col || INK; ctx.globalAlpha *= 0.85; ctx.beginPath(); ctx.moveTo(fa[0], fa[1]); ctx.lineTo(fa[0] + 40, 2200 / s); ctx.moveTo(0, hipY - 60); ctx.lineTo(-20, 2200 / s); ctx.stroke(); ctx.restore(); }
  // punched perforations and rivets (only when drawing into a shadow layer)
  if (fill && holes) {
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.strokeStyle = '#000';
    for (const [jx, jy] of joints) { ctx.beginPath(); ctx.arc(jx, jy, 3.6, 0, TAU); ctx.fill(); }
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(P.bend ?? 0); ctx.translate(0, -hipY);
    for (const [dx, dy, r] of dots) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, TAU); ctx.fill(); }
    ctx.lineWidth = 3.4; for (const sl of slits) { if (!sl) continue; const [yy, w] = sl; ctx.beginPath(); ctx.moveTo(-w, yy); ctx.quadraticCurveTo(0, yy + 9, w, yy - 2); ctx.stroke(); }
    // the ledger page (punched out so the light shows through), with ink lines left in
    if (prop === 'ledger' && o.page !== false) { ctx.save(); ctx.translate(fa[0] + 10, fa[1] - 20); ctx.rotate(-0.25); ctx.beginPath(); ctx.rect(2, -42, 36, 54); ctx.rect(44, -42, 36, 54); ctx.fill(); ctx.restore(); }
    ctx.restore(); ctx.restore();
  }
  ctx.restore();
  return { hand: [x + fa[0] * s * dir, y + fa[1] * s], head: [x + 4 * s * dir, y + hy * s] };
}
const walkPose = (ph, amp = 0.38) => ({ l1: amp * Math.sin(ph), l1b: -0.35 * Math.max(0, Math.sin(ph + 1.2)), r1: -amp * Math.sin(ph), r1b: -0.35 * Math.max(0, Math.sin(ph + 1.2 + Math.PI)), a1: -0.35 * Math.sin(ph), a1b: 0.2, a2: 0.35 * Math.sin(ph), a2b: 0.3 });
const digPose = (ph) => { const k = 0.5 + 0.5 * Math.sin(ph); return { bend: 0.15 + 0.35 * (1 - k), a2: lerp(0.5, 2.7, k), a2b: lerp(-0.2, 0.35, k), a1: lerp(0.4, 2.4, k), a1b: 0.3, hoe: lerp(1.0, 0.35, k), l1: 0.18, r1: -0.22, r1b: 0.1, head: 0.1 * (1 - k) }; };
const swayPose = (t, ph = 0, extra = {}) => ({ a1: 0.12 + 0.05 * Math.sin(t * 1.6 + ph), a2: 0.25 + 0.06 * Math.sin(t * 1.4 + ph + 1), a2b: 0.4, head: 0.04 * Math.sin(t * 1.1 + ph), ...extra });

// ───────── crack-spread transition ─────────
const CRACKS = new Map();
function crackSet(seed, ox, oy) {
  const key = `${seed}`; if (CRACKS.has(key)) return CRACKS.get(key);
  const lines = []; let maxD = 0;
  const walk = (x, y, a, d0, steps, w, depth) => {
    const pts = [[x, y, d0]]; let d = d0;
    for (let i = 0; i < steps; i++) {
      a += (rnd(seed + lines.length * 13 + i * 7 + depth) - 0.5) * 0.7; const st = 40 + rnd(seed + i * 3 + lines.length) * 40; x += Math.cos(a) * st; y += Math.sin(a) * st; d += st; pts.push([x, y, d]);
      if (depth < 2 && rnd(seed * 3 + i * 11 + lines.length * 5) < 0.22) walk(x, y, a + (rnd(i + seed) > 0.5 ? 1 : -1) * (0.6 + rnd(i * 2) * 0.6), d, 3 + Math.floor(rnd(i + seed * 2) * 6), w * 0.55, depth + 1);
      if (x < -80 || x > W + 80 || y < -80 || y > H + 80) break;
    }
    maxD = Math.max(maxD, d); lines.push({ pts, w });
  };
  for (let k = 0; k < 9; k++) walk(ox, oy, k / 9 * TAU + rnd(seed + k) * 0.5, 0, 60, 7, 0);
  // shards: a jittered triangulated grid, each knows its distance from the origin
  const cols = 5, rows = 9, G = [];
  for (let j = 0; j <= rows; j++) { const r = []; for (let i = 0; i <= cols; i++) { const edge = i === 0 || j === 0 || i === cols || j === rows; r.push([i * W / cols + (edge ? (i === 0 ? -40 : i === cols ? 40 : 0) : (rnd(seed + i * 7 + j * 13) - 0.5) * 120), j * H / rows + (edge ? (j === 0 ? -40 : j === rows ? 40 : 0) : (rnd(seed + i * 11 + j * 3) - 0.5) * 120)]); } G.push(r); }
  const shards = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = G[j][i], b = G[j][i + 1], c = G[j + 1][i + 1], d = G[j + 1][i];
    for (const tri of (i + j) % 2 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]) { const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3; shards.push({ tri, cx, cy, dist: Math.hypot(cx - ox, cy - oy), sp: rnd(cx + cy + seed) }); }
  }
  const set = { lines, maxD, shards, ox, oy }; CRACKS.set(key, set); return set;
}
function drawCracks(set, p) {
  const lim = p * set.maxD; if (lim <= 0) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const pass of [0, 1]) for (const { pts, w } of set.lines) {
    if (pts[0][2] > lim) continue;
    ctx.beginPath(); ctx.moveTo(pts[0][0] + (pass ? 2 : 0), pts[0][1] + (pass ? 2 : 0));
    for (let i = 1; i < pts.length; i++) { const [x, y, d] = pts[i], [px, py, pd] = pts[i - 1]; if (d > lim) { const f = (lim - pd) / (d - pd); ctx.lineTo(lerp(px, x, f) + (pass ? 2 : 0), lerp(py, y, f) + (pass ? 2 : 0)); break; } ctx.lineTo(x + (pass ? 2 : 0), y + (pass ? 2 : 0)); }
    ctx.strokeStyle = pass ? 'rgba(255,226,170,0.35)' : INK; ctx.lineWidth = pass ? w * 0.35 : w; ctx.stroke();
  }
  ctx.restore();
}
/** cracks race across the last `dur` seconds of a shot */
function crackOut(lt, d, seed, ox = 540, oy = 760, dur = 0.42) { const p = clamp((lt - (d - dur)) / dur); if (p > 0) drawCracks(crackSet(seed, ox, oy), eo(p)); }
const PREV = new Map();
/** the first ~0.9 s of a shot: the previous shot's final cracked frame breaks into shards that fall away */
function shardsIn(lt, prev, seed, ox = 540, oy = 760) {
  if (lt > 1.0 || !prev) return;
  let img = PREV.get(prev.id);
  if (!img) {
    img = mkCanvas(W, H); const g = img.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const pd = prev._d, z = 1 + (prev.zoom ?? 0.06), [cx, cy] = prev.cam || [540, 900];
    const save = ctx.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
    const old = ctx; setCtx(g); try { prev.draw(pd - 0.001, pd, prev.at + pd - 0.001); } finally { setCtx(old); }
    PREV.set(prev.id, img); void save;
  }
  const set = crackSet(seed, ox, oy);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const s of set.shards) {
    const delay = s.dist / 2200 * 0.32, dt = Math.max(0, lt - delay);
    const yy = 2900 * dt * dt + 120 * dt, xx = (s.cx - set.ox) * 0.5 * dt, rot = (s.sp - 0.5) * 3.2 * dt, sc = 1 - 0.25 * clamp(dt / 0.6);
    if (yy > H + 400) continue;
    ctx.save(); ctx.translate(s.cx + xx, s.cy + yy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-s.cx, -s.cy);
    polyPath(s.tri); ctx.save(); ctx.clip(); ctx.drawImage(img, 0, 0); ctx.fillStyle = `rgba(20,10,4,${0.55 * clamp(dt / 0.4)})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ───────── the plan of Madras (sepia ink, plan view) ─────────
const COAST = (y) => 936 + 14 * Math.sin(y * 0.008) + 8 * Math.sin(y * 0.021);
const COOUM = [[-30, 478], [80, 446], [170, 476], [262, 436], [352, 456], [446, 414], [536, 436], [616, 400], [700, 388], [780, 374], [860, 368], [960, 362]];
const ADYAR = [[-30, 1296], [96, 1254], [196, 1282], [298, 1236], [396, 1252], [498, 1212], [598, 1222], [700, 1186], [800, 1180], [880, 1170], [960, 1166]];
const CANAL = [[706, 392], [696, 476], [702, 572], [718, 670], [712, 780], [722, 890], [734, 1000], [740, 1100], [742, 1180]];
const MOUNT = [[860, 330], [760, 470], [640, 620], [520, 790], [400, 960], [300, 1110], [220, 1230]];
function mapImg() {
  return cached('b:map', W, H, 1.35, () => {
    // aged sheet
    ctx.fillStyle = lg(0, 0, 0, H, [[0, '#E9D9B6'], [0.5, '#E2CDA2'], [1, '#CDB283']]); ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 22; i++) { const x = rnd(i + 41) * W, y = rnd(i * 3 + 9) * H, r = 80 + rnd(i + 2) * 260; const q = ctx.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(140,92,44,${0.05 + rnd(i) * 0.08})`); q.addColorStop(1, 'rgba(140,92,44,0)'); ctx.fillStyle = q; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    for (let i = 0; i < 1600; i++) { ctx.fillStyle = rnd(i) > 0.5 ? 'rgba(90,60,30,0.10)' : 'rgba(255,250,230,0.12)'; ctx.fillRect(rnd(i * 3 + 1) * W, rnd(i * 7 + 2) * H, 1.5 + rnd(i + 3) * 2, 1.5 + rnd(i + 5) * 2); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // sea: horizontal hatching east of the coast (no colour: water belongs to the last shots)
    ctx.strokeStyle = 'rgba(74,46,26,0.32)'; ctx.lineWidth = 1.6;
    for (let y = 60; y < H; y += 11) { const cx = COAST(y); for (let x = cx + 14 + (y % 22 ? 8 : 0); x < W; x += 38) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 20 + rnd(x + y) * 8, y); ctx.stroke(); } }
    ctx.beginPath(); for (let y = 0; y <= H; y += 8) { const cx = COAST(y); y ? ctx.lineTo(cx, y) : ctx.moveTo(cx, y); } ctx.strokeStyle = SEP; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.beginPath(); for (let y = 0; y <= H; y += 8) { const cx = COAST(y) + 9; y ? ctx.lineTo(cx, y) : ctx.moveTo(cx, y); } ctx.strokeStyle = 'rgba(74,46,26,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    // city blocks: dense in the north (Black Town, Fort), thinning to gardens in the south
    const nearWater = (x, y, m) => distPoly(x, y, COOUM) < 18 + m || distPoly(x, y, ADYAR) < 26 + m || distPoly(x, y, CANAL) < 22 + m || x > COAST(y) - 14 - m;
    for (let y = 170; y < 1860; y += 30) for (let x = 70; x < 940; x += 30) {
      const dens = y < 700 ? 0.82 - (940 - x) * 0.0006 : y < 1180 ? 0.48 - (y - 700) * 0.0004 : 0.12;
      if (rnd(x * 0.37 + y * 1.13) > dens) { if (rnd(x + y * 3) < 0.07 && !nearWater(x, y, 10)) { ctx.strokeStyle = 'rgba(74,46,26,0.55)'; ctx.lineWidth = 1.3; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + (rnd(k + x) - 0.5) * 26, y + (rnd(k + y) - 0.5) * 22, 4 + rnd(k * 3 + x) * 3, 0, TAU); ctx.stroke(); } } continue; }
      const bw = 16 + rnd(x + y * 7) * 10, bh = 14 + rnd(x * 3 + y) * 10, bx = x + (rnd(y + x * 5) - 0.5) * 6, by = y + (rnd(x + y * 9) - 0.5) * 6;
      if (nearWater(bx + bw / 2, by + bh / 2, 6) || distPoly(bx + bw / 2, by + bh / 2, MOUNT) < 14) continue;
      ctx.fillStyle = 'rgba(110,70,36,0.22)'; ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = 'rgba(74,46,26,0.75)'; ctx.lineWidth = 1.4; ctx.strokeRect(bx, by, bw, bh);
      ctx.beginPath(); for (let k = -bh; k < bw; k += 5) { ctx.moveTo(bx + Math.max(0, k), by + Math.max(0, -k)); ctx.lineTo(bx + Math.min(bw, k + bh), by + Math.min(bh, bh - (k + bh - Math.min(bw, k + bh)))); } ctx.strokeStyle = 'rgba(74,46,26,0.3)'; ctx.lineWidth = 0.9; ctx.stroke();
    }
    // the great road (double line)
    for (const [w, c] of [[10, SEP], [6, '#E2CDA2']]) { smoothPath(MOUNT); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
    // rivers: banks in ink, hatched bed
    const river = (p, w) => {
      for (const [lw, c] of [[w + 7, SEP], [w, '#DCC59A']]) { smoothPath(p); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke(); }
      ctx.save(); ctx.setLineDash([3, 7]); for (const o of [-w * 0.22, w * 0.22]) { ctx.save(); ctx.translate(0, o); smoothPath(p); ctx.strokeStyle = 'rgba(74,46,26,0.45)'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore(); } ctx.restore();
    };
    river(COOUM, 22); river(ADYAR, 34);
    ctx.fillStyle = '#DCC59A'; ctx.strokeStyle = SEP; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(890, 1176, 64, 28, -0.08, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.setLineDash([3, 6]); ctx.strokeStyle = 'rgba(74,46,26,0.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(890, 1176, 44, 16, -0.08, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    // Fort St George: a star fort north of the Cooum mouth
    ctx.save(); ctx.translate(872, 300); ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 26 : 50, a = i / 10 * TAU - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = 'rgba(110,70,36,0.3)'; ctx.fill(); ctx.strokeStyle = SEP; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeRect(-14, -14, 28, 28); ctx.restore();
    // a temple tank (outline only)
    ctx.strokeStyle = SEP; ctx.lineWidth = 2.5; ctx.strokeRect(560, 846, 46, 46); ctx.strokeRect(568, 854, 30, 30);
    // faint drought cracks over the whole sheet
    ctx.strokeStyle = 'rgba(74,46,26,0.14)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) { let x = rnd(i * 5 + 3) * W, y = rnd(i * 9 + 1) * H, a = rnd(i) * TAU; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 6; k++) { a += (rnd(i * 13 + k) - 0.5) * 1.2; x += Math.cos(a) * 30; y += Math.sin(a) * 30; ctx.lineTo(x, y); } ctx.stroke(); }
    // border: double rule with a tick scale
    ctx.strokeStyle = SEP; ctx.lineWidth = 3; ctx.strokeRect(30, 70, W - 60, H - 110); ctx.lineWidth = 1.2; ctx.strokeRect(42, 82, W - 84, H - 134);
    for (let x = 42; x < W - 42; x += 24) { ctx.beginPath(); ctx.moveTo(x, 70); ctx.lineTo(x, 82); ctx.moveTo(x, H - 52); ctx.lineTo(x, H - 40); ctx.lineWidth = (x / 24) % 2 ? 1 : 2.4; ctx.stroke(); }
    // small sepia notes
    ctx.fillStyle = 'rgba(74,46,26,0.85)'; ctx.font = `700 22px ${SERIF}`; ctx.textAlign = 'center'; ctx.letterSpacing = '3px';
    ctx.fillText('FORT', 872, 240); ctx.save(); ctx.translate(1000, 900); ctx.rotate(Math.PI / 2); ctx.fillText('BAY OF BENGAL', 0, 0); ctx.restore();
    ctx.font = `italic 700 20px ${SERIF}`; ctx.fillText('stylised, not to scale', 540, H - 62); ctx.letterSpacing = '0px';
  });
}
/** the trench: dug part (dark, with spoil banks), the rest as a dashed planned line; returns the dig front */
function trench(p, planA = 1, segs = 8) {
  const len = plen(CANAL);
  if (planA > 0) { ctx.save(); ctx.globalAlpha *= planA; ctx.setLineDash([12, 10]); ctx.lineDashOffset = 0; smoothPath(sub(CANAL, 1)); ctx.strokeStyle = 'rgba(58,36,24,0.8)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
  if (p <= 0) return along(CANAL, 0);
  const dug = sub(CANAL, p);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [w, c] of [[30, 'rgba(110,70,36,0.35)'], [22, SEP], [13, UMB], [5, '#2A180E']]) { smoothPath(dug); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); }
  // spoil heaps along both banks
  const n = Math.floor(len * p / 9);
  for (let i = 0; i < n; i++) { const [x, y, a] = along(CANAL, i * 9 / len); for (const sd of [-1, 1]) { const off = 19 + rnd(i * 3 + sd) * 6; ctx.fillStyle = rnd(i + sd * 7) > 0.5 ? 'rgba(74,46,26,0.75)' : 'rgba(110,70,36,0.6)'; ctx.beginPath(); ctx.arc(x - Math.sin(a) * off * sd, y + Math.cos(a) * off * sd, 2 + rnd(i * 5 + sd) * 2.4, 0, TAU); ctx.fill(); } }
  // km ticks
  for (let k = 1; k < segs; k++) if (k / segs <= p) { const [x, y, a] = along(CANAL, k / segs); ctx.strokeStyle = SEP; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - Math.sin(a) * 34, y + Math.cos(a) * 34); ctx.lineTo(x + Math.sin(a) * 24, y - Math.cos(a) * 24); ctx.stroke(); }
  ctx.restore();
  return along(CANAL, p);
}
/** tiny silhouette diggers at the dig front, and basket carriers walking the banks */
function crew(t, p, n = 6, s = 0.085) {
  const len = plen(CANAL);
  for (let i = 0; i < n; i++) {
    const back = 6 + i * 16 + rnd(i) * 8, k = clamp(p - back / len), [x, y, a] = along(CANAL, k), side = i % 2 ? 1 : -1;
    const px = x - Math.sin(a) * 26 * side, py = y + Math.cos(a) * 26 * side;
    puppet({ x: px, y: py + 14, s, dir: side, kind: 'digger', pose: digPose(t * 7 + i * 1.7), holes: false, sticks: false, col: INK });
  }
  for (let i = 0; i < 5; i++) {
    const u = ((t * 0.09 + i / 5) % 1), k = clamp(p * (1 - u) - 0.02), [x, y, a] = along(CANAL, Math.max(0, k)), side = i % 2 ? 1 : -1;
    if (p < 0.08) continue; puppet({ x: x - Math.sin(a) * 40 * side, y: y + Math.cos(a) * 40 * side + 14, s: s * 0.92, dir: -1, kind: 'carrier', pose: walkPose(t * 9 + i, 0.4), holes: false, sticks: false });
  }
}
function cartouche(t, p, str = 'MADRAS') {
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(p * 3);
  ctx.save(); ctx.shadowColor = 'rgba(40,20,8,0.35)'; ctx.shadowBlur = 16; ctx.fillStyle = '#EADBB8'; ctx.beginPath(); ctx.roundRect(270, 140, 540, 132, 6); ctx.fill(); ctx.restore();
  ctx.strokeStyle = SEP; ctx.lineWidth = 3; ctx.strokeRect(278, 148, 524, 116); ctx.lineWidth = 1.2; ctx.strokeRect(288, 158, 504, 96);
  ctx.restore();
  wood(str, 540, 206, 92, UMB, p, 3);
}

// ═════════════════════════ THE SHOTS ═════════════════════════
export function buildB(add, cue) {
  const T = [L(5), Wd('even', 5), Wd('argued', 5), L(6), Wd('canal', 6), L(7), Wd('joining', 7), L(8), Wd('duke', 8), L(9), Wd('diggers', 9), L(10)];
  const shots = [];
  const put = (o, i) => { o.at = T[i]; o._d = T[i + 1] - T[i]; shots.push(o); add(o); return o; };

  // ── b1 · women and children got less: three puppets, three heaps poured on the ledge ──
  {
    const t0 = T[0], tLess = Wd('less', 5) - t0;
    const fig = [{ x: 220, kind: 'man', s: 0.95, n: 300, hx: 210, lab: '1 lb' }, { x: 545, kind: 'woman', s: 0.9, n: 190, hx: 540, lab: 'LESS' }, { x: 835, kind: 'child', s: 0.86, n: 110, hx: 850, lab: 'LESS' }];
    put({ id: 'b1', cam: [540, 820], zoom: 0.07, note: 'screen: man, woman and child puppets in a row; gold grain pours onto the ledge into three heaps, man\'s biggest; tags 1 lb / LESS / LESS above', draw(lt, d, t) {
      stage(t);
      shadows(t, () => fig.forEach((f, i) => puppet({ x: f.x, y: 1150 - (f.kind === 'child' ? 0 : 0), s: f.s, kind: f.kind, pose: swayPose(t, i * 2, { a2: 0.9 + 0.1 * Math.sin(t * 2 + i), a2b: 0.9 }) })));
      fig.forEach((f, i) => {
        const pp = clamp((lt - 0.05 - i * 0.12) / 1.05), shown = f.n * eo(pp), [w, h] = heapDims(f.n, 1);
        heap(f.hx, LEDGE + 2, f.n, shown, w, h, 11 + i);
        if (pp > 0 && pp < 1) pour(f.hx, 140, LEDGE - h * eo(pp), lt + i, 1 - pp * 0.3, 26);
        const tp = pr(lt, i === 0 ? 0.45 : tLess - 0.05 + (i - 1) * 0.12, 0.45);
        const gold = i === 0; wood(f.lab, f.x + (i === 2 ? 10 : 0), f.kind === 'child' ? 520 : 330, gold ? 74 : 62, gold ? GOLD : INK, tp, 20 + i);
      });
      motes(t, 40, 3); vignette(0.5);
    } }, 0);
    cue(t0 + 0.05, 'sizzle', { gain: 0.35, dur: 1.2 }); cue(t0 + 0.45, 'pop', { gain: 0.45 }); cue(t0 + tLess, 'plop', { gain: 0.5 }); cue(t0 + tLess + 0.12, 'plop', { gain: 0.4, pan: 0.3 });
  }

  // ── b2 · even the sanitary commissioner of Madras argued: an official puppet with an open ledger, jabbing ──
  {
    const t0 = T[1], tSan = Wd('sanitary', 5) - t0, tMad = Wd('madras', 5) - t0;
    put({ id: 'b2', cam: [560, 700], zoom: 0.08, note: 'screen: tall faceless official puppet (pith helmet, frock coat) holding an open punched-out ledger, free arm jabbing; plank SANITARY / COMMISSIONER swings in; a thin worker puppet listens, small 1 lb heap on the ledge', draw(lt, d, t) {
      stage(t);
      const jab = Math.max(Math.exp(-Math.pow((lt - tSan - 0.3) * 5, 2)), Math.exp(-Math.pow((lt - tMad - 0.2) * 5, 2)));
      shadows(t, () => {
        puppet({ x: 300, y: 1170, s: 0.62, kind: 'man', dir: 1, pose: swayPose(t, 1, { head: -0.12, a2: 0.1, a1: 0.05 }) });
        puppet({ x: 640, y: 1190, s: 1.18, kind: 'official', dir: -1, pose: { a1: 0.9 + 0.08 * Math.sin(t * 1.3), a1b: 1.25, a2: 1.5 + 1.0 * jab + 0.1 * Math.sin(t * 2), a2b: 0.25 - 0.5 * jab, head: -0.05 + 0.08 * jab, l1: 0.05, r1: -0.05 }, prop: 'ledger', stickW: 1.2 });
      });
      const [w, h] = heapDims(300, 0.8); heap(300, LEDGE + 2, 300, 300, w, h, 31, 1.15);
      wood('1 lb', 300, 1140 - 0 + 0 * lt, 40, GOLD, pr(lt, 0.2, 0.3), 33);
      plank([['SANITARY', 56, -30], ['COMMISSIONER', 44, 34]], 540, 300, 600, 150, t, pr(lt, Math.max(0.05, tSan - 0.2), 0.7));
      motes(t, 40, 5); vignette(0.5);
    } }, 1);
    cue(t0 + Math.max(0.05, tSan - 0.2), 'whoosh', { gain: 0.35 }); cue(t0 + tSan + 0.15, 'tock', { gain: 0.5 }); cue(t0 + tSan + 0.3, 'tock', { gain: 0.4 }); cue(t0 + tMad + 0.2, 'tock', { gain: 0.5 });
  }

  // ── b3 · argued for at least one and a half pounds: two heaps side by side ──
  {
    const t0 = T[2], tOne = Wd('one', 5) - t0, tHalf = Wd('half', 5) - t0;
    put({ id: 'b3', cam: [540, 1000], zoom: 0.07, note: 'close on the ledge: heap "1 lb" (left) and a dashed ghost heap that grain pours into, labelled "1.5 lb" + "asked"; official\'s shadow arm points at it, thin worker shadow between', draw(lt, d, t) {
      stage(t);
      const pt = eio(pr(lt, 0.0, 0.8));
      shadows(t, () => {
        puppet({ x: 520, y: 1200, s: 0.8, kind: 'man', dir: 1, pose: swayPose(t, 3, { a2: 0.5 + 0.3 * pt, a2b: 0.6, head: 0.15 * pt }) });
        puppet({ x: 1010, y: 1230, s: 1.25, kind: 'official', dir: -1, pose: { a1: 0.9, a1b: 1.2, a2: lerp(1.2, 1.62, pt) + 0.05 * Math.sin(t * 2.4), a2b: 0.05, head: 0.05 }, prop: 'ledger' });
      });
      const [w1, h1] = heapDims(300, 1.45), [w2, h2] = heapDims(450, 1.45);
      heap(270, LEDGE + 2, 300, 300, w1, h1, 41, 1.6);
      // the ghost heap (what was asked for), then grain pours into it
      const gx = 760, gp = pr(lt, tOne - 0.1, tHalf - tOne + 0.9), ga = pr(lt, 0.15, 0.4);
      ctx.save(); ctx.globalAlpha = ga; ctx.setLineDash([10, 9]); ctx.lineDashOffset = -lt * 30; ctx.strokeStyle = BONE; ctx.lineWidth = 3.5; ctx.beginPath(); for (let k = 0; k <= 40; k++) { const u = -1 + k / 20; ctx.lineTo(gx + u * w2 * 1.03, LEDGE + 2 - h2 * 1.04 * (1 - u * u)); } ctx.stroke(); ctx.restore();
      heap(gx, LEDGE + 2, 450, 450 * eo(gp), w2, h2, 42, 1.6);
      if (gp > 0 && gp < 1) pour(gx, 120, LEDGE - h2 * eo(gp), lt, 1, 40, 14);
      wood('1 lb', 270, 1000, 84, GOLD, pr(lt, 0.1, 0.4), 43);
      wood('1.5 lb', gx, 880, 96, GOLD, pr(lt, tOne, 0.45), 44);
      note('asked for', gx, 960, 44, BONE, pr(lt, tHalf, 0.4), { italic: true });
      note('the 1877 relief wage', 270, 1080, 30, BONE, pr(lt, 0.4, 0.4) * 0.9, { italic: true });
      motes(t, 50, 7); vignette(0.5);
      crackOut(lt, d, 101, 540, 900);
    } }, 2);
    cue(t0 + tOne - 0.1, 'sizzle', { gain: 0.45, dur: 1.6 }); cue(t0 + tOne, 'pop', { gain: 0.55 }); cue(t0 + tHalf, 'sparkle', { gain: 0.35 }); cue(T[3] - 0.42, 'rumble', { gain: 0.45, dur: 0.6 });
  }

  // ── b4 · one of these relief works: a column of workers with baskets and hoes crossing the screen ──
  {
    const t0 = T[3], tRel = Wd('relief', 6) - t0;
    put({ id: 'b4', cam: [540, 760], zoom: 0.07, note: 'screen: a column of famine workers (carriers with head-baskets, diggers with hoes) walks left to right on sticks; plank RELIEF WORKS swings in; dust devil on the earth; shards of b3 fall away first', draw(lt, d, t) {
      stage(t);
      shadows(t, () => {
        for (let i = 0; i < 7; i++) {
          const x = -160 + i * 190 + lt * 120, k = i % 3, s = 0.66 + (k === 1 ? 0.04 : 0) - (i === 4 ? 0.12 : 0);
          puppet({ x, y: 1180 - (i % 2) * 22, s, kind: k === 1 ? 'digger' : k === 2 ? 'woman' : 'carrier', pose: k === 1 ? { ...walkPose(t * 5 + i, 0.35), a2: 2.4, a2b: -0.4, hoe: 2.4 } : k === 0 ? { ...walkPose(t * 5 + i, 0.35), a2: 2.9, a2b: 0.4, a1: 2.8, a1b: 0.3 } : walkPose(t * 5 + i, 0.3) });
        }
      });
      plank([['RELIEF WORKS', 62, 0]], 540, 290, 560, 110, t, pr(lt, tRel - 0.35, 0.7));
      dustDevil(t, 820 - lt * 40, 1880, 300, 0.45);
      motes(t, 46, 11); vignette(0.5);
      shardsIn(lt, shots[2], 101, 540, 900);
      crackOut(lt, d, 202, 700, 700);
    } }, 3);
    cue(t0 + 0.02, 'thud', { gain: 0.5 }); cue(t0 + tRel - 0.3, 'whoosh', { gain: 0.35 }); cue(t0 + tRel + 0.2, 'tock', { gain: 0.4 }); cue(T[4] - 0.42, 'rumble', { gain: 0.4, dur: 0.5 });
  }

  // ── b5 · a canal through the city of Madras: the sepia plan; a dashed route; MADRAS pressed in ──
  {
    const t0 = T[4], tMad = Wd('madras', 6) - t0;
    put({ id: 'b5', cam: [620, 760], zoom: 0.1, note: 'plan view: sepia ink map of Madras (blocks, Fort, Cooum north, Adyar south, coast hatched); a dashed planned canal line draws itself north to south; MADRAS woodblock pressed in a cartouche', draw(lt, d, t) {
      ctx.drawImage(mapImg(), 0, 0, W, H);
      const dp = eio(pr(lt, 0.15, 1.6));
      ctx.save(); ctx.setLineDash([12, 10]); ctx.lineDashOffset = -lt * 20; smoothPath(sub(CANAL, dp)); ctx.strokeStyle = UMB; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
      if (dp > 0 && dp < 1) { const [x, y] = along(CANAL, dp); ctx.fillStyle = UMB; ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill(); }
      cartouche(t, pr(lt, tMad - 0.1, 0.5));
      note('CANAL', 776, 640, 30, UMB, pr(lt, 0.4, 0.4), { align: 'left', sp: 6 });
      motes(t, 30, 13, 0.4); vignette(0.45);
      shardsIn(lt, shots[3], 202, 700, 700);
    } }, 4);
    cue(t0 + 0.02, 'thud', { gain: 0.55 }); cue(t0 + 0.2, 'zip', { gain: 0.35 }); cue(t0 + tMad, 'slam', { gain: 0.6 });
  }

  // ── b6 · workers dug a link about eight kilometres long: the trench dug segment by segment ──
  {
    const t0 = T[5], tEight = Wd('eight', 7) - t0;
    put({ id: 'b6', cam: [700, 640], zoom: 0.12, note: 'plan view close: the trench is dug km by km from the Cooum southwards by tiny silhouette diggers + basket carriers, spoil dots on both banks; distance bar "~8 km" with end ticks draws beside it', draw(lt, d, t) {
      ctx.drawImage(mapImg(), 0, 0, W, H);
      // 8 segments, each eased: a burst of digging then a pause
      const raw = 0.05 + lt / d * 0.55 * 8 / 8, segIdx = Math.floor(raw * 8), segF = raw * 8 - segIdx, p = (segIdx + eio(clamp(segF * 1.4))) / 8;
      const [fx, fy] = trench(p, 1);
      crew(t, p);
      // dust at the dig front
      for (let i = 0; i < 16; i++) { const u = (t * 0.8 + i / 16) % 1; ctx.fillStyle = `rgba(110,70,36,${0.35 * (1 - u)})`; ctx.beginPath(); ctx.arc(fx + (rnd(i) - 0.5) * 60 * u, fy - 20 * u + (rnd(i + 3) - 0.5) * 30, 3 + u * 9, 0, TAU); ctx.fill(); }
      // distance bar
      const bp = eio(pr(lt, tEight - 0.15, 0.8)), bx = 848, top = CANAL[0][1], bot = CANAL[CANAL.length - 1][1];
      if (bp > 0) {
        ctx.save(); ctx.strokeStyle = UMB; ctx.lineWidth = 4; ctx.lineCap = 'round';
        const mid = (top + bot) / 2, a = lerp(mid, top, bp), b = lerp(mid, bot, bp);
        ctx.beginPath(); ctx.moveTo(bx, a); ctx.lineTo(bx, b); ctx.moveTo(bx - 16, a); ctx.lineTo(bx + 16, a); ctx.moveTo(bx - 16, b); ctx.lineTo(bx + 16, b); ctx.stroke();
        for (let k = 1; k < 8; k++) { const yy = lerp(top, bot, k / 8); if (yy > a && yy < b) { ctx.beginPath(); ctx.moveTo(bx - 8, yy); ctx.lineTo(bx + 8, yy); ctx.lineWidth = 2.5; ctx.stroke(); } }
        ctx.restore();
        ctx.save(); ctx.globalAlpha = clamp(bp * 2); ctx.fillStyle = '#EADBB8'; ctx.strokeStyle = UMB; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(bx - 74, mid - 40, 148, 80, 8); ctx.fill(); ctx.stroke(); ctx.restore();
        wood('~8 km', bx, mid, 46, UMB, pr(lt, tEight + 0.1, 0.4), 61);
      }
      motes(t, 26, 17, 0.35); vignette(0.45);
    } }, 5);
    for (let k = 0; k < 5; k++) cue(t0 + 0.15 + k * 0.56, 'chisel', { gain: 0.35, pan: -0.2 + k * 0.1 });
    cue(t0 + tEight, 'zip', { gain: 0.4 }); cue(t0 + tEight + 0.15, 'pop', { gain: 0.5 });
  }

  // ── b7 · joining the Adyar river to the Cooum: the trench reaches the Adyar; river names pressed in; 1877-78 ──
  {
    const t0 = T[6], tAd = Wd('adyar', 7) - t0, tCo = Wd('cooum', 7) - t0;
    put({ id: 'b7', cam: [600, 760], zoom: 0.06, note: 'plan view wide: the dig front reaches the Adyar and the link is complete Cooum-to-Adyar; woodblock COOUM (north) and ADYAR (south) pressed in on bone tabs; "1877-78" tab; diggers keep working', draw(lt, d, t) {
      ctx.drawImage(mapImg(), 0, 0, W, H);
      const p = lerp(0.62, 1, eio(pr(lt, 0, tAd + 0.25)));
      trench(p, 1); crew(t, p, p >= 1 ? 4 : 6);
      // the join flash where the trench meets the Adyar
      const jp = pr(lt, tAd + 0.25, 0.6); if (jp > 0 && jp < 1) { const [x, y] = CANAL[CANAL.length - 1]; ctx.strokeStyle = `rgba(58,36,24,${1 - jp})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 20 + 70 * eo(jp), 0, TAU); ctx.stroke(); }
      const tab = (s, x, y, p, size, seed, w) => { if (p <= 0) return; ctx.save(); ctx.globalAlpha = clamp(p * 3); ctx.fillStyle = '#EADBB8'; ctx.strokeStyle = SEP; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(x - w / 2, y - size * 0.62, w, size * 1.24, 6); ctx.fill(); ctx.stroke(); ctx.restore(); wood(s, x, y, size, UMB, p, seed); };
      tab('COOUM', 330, 382, pr(lt, tCo - 0.05, 0.45), 54, 71, 250);
      tab('ADYAR', 330, 1170, pr(lt, tAd - 0.05, 0.45), 54, 72, 250);
      tab('1877-78', 330, 760, pr(lt, Math.min(d - 0.9, tCo + 0.4), 0.45), 50, 73, 260);
      cartouche(t, 1);
      motes(t, 26, 19, 0.35); vignette(0.45);
      crackOut(lt, d, 303, 520, 760);
    } }, 6);
    cue(t0 + tAd + 0.25, 'thud', { gain: 0.5 }); cue(t0 + tAd, 'slam', { gain: 0.5, pan: -0.2 }); cue(t0 + tCo, 'slam', { gain: 0.5, pan: -0.2 }); cue(T[7] - 0.42, 'rumble', { gain: 0.45, dur: 0.5 });
  }

  // ── b8 · it was ordered by the Governor: the plumed-hat silhouette, a pointing arm; plank THE GOVERNOR ──
  {
    const t0 = T[7], tOrd = Wd('ordered', 8) - t0, tGov = Wd('governor', 8) - t0;
    put({ id: 'b8', cam: [540, 720], zoom: 0.08, note: 'screen: a towering Governor puppet (only the plumed cocked hat, epaulettes, frock coat, sword; no face) rises in from below and points; small digger puppets bow to the left; plank THE GOVERNOR swings in', draw(lt, d, t) {
      stage(t);
      const rise = eo(pr(lt, 0, 0.7)), point = eob(pr(lt, tOrd - 0.1, 0.5));
      shadows(t, () => {
        for (let i = 0; i < 3; i++) puppet({ x: 120 + i * 120, y: 1190, s: 0.48, kind: 'digger', dir: 1, pose: { ...digPose(Math.PI * 1.5), bend: 0.35 + 0.05 * Math.sin(t * 2 + i), head: 0.3 } });
        puppet({ x: 700, y: 1240 + (1 - rise) * 700, s: 1.42, kind: 'gov', dir: -1, plume: Math.sin(t * 2.5), pose: { a1: 0.1, a1b: 0.15, a2: lerp(0.2, 1.75, point) + 0.03 * Math.sin(t * 2), a2b: lerp(0.4, -0.05, point), head: 0.02 * Math.sin(t * 1.2), l1: 0.04, r1: -0.04 }, stickW: 1.3 });
      });
      plank([['THE GOVERNOR', 64, 0]], 540, 270, 600, 112, t, pr(lt, tGov - 0.3, 0.7));
      motes(t, 46, 23); vignette(0.55);
      shardsIn(lt, shots[6], 303, 520, 760);
    } }, 7);
    cue(t0 + 0.05, 'swell', { gain: 0.4, dur: 1.2 }); cue(t0 + tOrd, 'drum', { gain: 0.6 }); cue(t0 + tGov - 0.25, 'whoosh', { gain: 0.35 }); cue(t0 + tGov + 0.2, 'tock', { gain: 0.45 });
  }

  // ── b9 · the Duke of Buckingham: closer on the hat and arm signing an order; plank DUKE OF BUCKINGHAM ──
  {
    const t0 = T[8], tBuck = Wd('buckingham', 8) - t0;
    put({ id: 'b9', cam: [560, 660], zoom: 0.08, note: 'screen close: the plumed cocked-hat silhouette (no face) and arm signs an order sheet with a quill (scribble lines appear, no real text); plank DUKE OF / BUCKINGHAM swings in', draw(lt, d, t) {
      stage(t);
      // the order sheet is a punched-out panel: light shines through, the quill's shadow writes on it
      const wp = clamp(lt / (d - 0.2));
      shadows(t, () => {
        puppet({ x: 760, y: 1640, s: 1.95, kind: 'gov', dir: -1, plume: Math.sin(t * 2.5), pose: { a1: 0.3, a1b: 0.5, a2: 1.35 + 0.08 * Math.sin(t * 9), a2b: 0.25 + 0.08 * Math.cos(t * 9), head: 0.15 }, prop: 'quill', stickW: 1.4 });
        // order sheet: bone panel with scribbled lines
        ctx.save(); ctx.translate(250, 920); ctx.rotate(-0.05);
        ctx.fillStyle = INK; ctx.fillRect(-150, -120, 300, 260);
        ctx.globalCompositeOperation = 'destination-out'; ctx.fillRect(-138, -108, 276, 236); ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let r = 0; r < 6; r++) { const lp = clamp(wp * 6 - r); if (lp <= 0) break; ctx.beginPath(); for (let k = 0; k <= 40 * lp; k++) { const xx = -110 + k * 5.5, yy = -70 + r * 34 + Math.sin(k * 1.3 + r) * 5 + (rnd(k + r * 40) - 0.5) * 4; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
        ctx.restore();
      });
      plank([['DUKE OF', 44, -42], ['BUCKINGHAM', 66, 24]], 540, 300, 640, 170, t, pr(lt, tBuck - 0.35, 0.7));
      note('illustration: no likeness shown', 540, 1218, 26, BONE, 0.75, { italic: true });
      motes(t, 46, 29); vignette(0.55);
      crackOut(lt, d, 404, 520, 900);
    } }, 8);
    cue(t0 + 0.1, 'zip', { gain: 0.3 }); cue(t0 + 0.8, 'zip', { gain: 0.25 }); cue(t0 + tBuck - 0.3, 'whoosh', { gain: 0.35 }); cue(t0 + tBuck + 0.1, 'bell', { gain: 0.4 }); cue(T[9] - 0.42, 'rumble', { gain: 0.45, dur: 0.5 });
  }

  // ── b10 · and the canal took his name: a woodblock presses BUCKINGHAM CANAL into the earth beside the trench ──
  {
    const t0 = T[9], tTook = Wd('took', 9) - t0, tName = Wd('name', 9) - t0;
    const earth = () => cached('b:earthTop', W, H, 1, () => {
      ctx.fillStyle = lg(0, 0, 0, H, [[0, '#9A6A40'], [0.5, DUST2], [1, '#6E4628']]); ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) { const x = rnd(i + 5) * W, y = rnd(i * 3 + 2) * H, r = 60 + rnd(i) * 200; const q = ctx.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(${rnd(i) > 0.5 ? '60,34,16' : '230,190,130'},0.12)`); q.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = q; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
      // polygon crack plates
      const cell = 120; ctx.lineJoin = 'round';
      for (const [col, off, lw] of [['rgba(255,226,170,0.2)', 2, 2.5], ['rgba(30,16,8,0.8)', 0, 3.5]]) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
        for (let j = -1; j < H / cell + 1; j++) for (let i = -1; i < W / cell + 1; i++) { const px = (ii, jj) => ii * cell + (rnd(ii * 17 + jj * 31) - 0.5) * cell * 0.7, py = (ii, jj) => jj * cell + (rnd(ii * 13 + jj * 7 + 5) - 0.5) * cell * 0.7; ctx.moveTo(px(i, j) + off, py(i, j) + off); ctx.lineTo(px(i + 1, j) + off, py(i + 1, j) + off); ctx.moveTo(px(i, j) + off, py(i, j) + off); ctx.lineTo(px(i, j + 1) + off, py(i, j + 1) + off); }
        ctx.stroke(); }
      for (let i = 0; i < 500; i++) { ctx.fillStyle = rnd(i) > 0.5 ? 'rgba(50,28,12,0.3)' : 'rgba(240,200,140,0.25)'; ctx.beginPath(); ctx.arc(rnd(i * 3 + 7) * W, rnd(i * 7 + 1) * H, 1 + rnd(i + 2) * 3, 0, TAU); ctx.fill(); }
      // the dug channel (dry, dark), with spoil banks
      const cy = 1060;
      ctx.fillStyle = 'rgba(40,22,10,0.35)'; ctx.fillRect(0, cy - 120, W, 240);
      ctx.fillStyle = lg(0, cy - 90, 0, cy + 90, [[0, '#2A180E'], [0.25, UMB], [0.7, '#4A2E1A'], [1, '#6E4628']]); ctx.beginPath(); ctx.moveTo(0, cy - 80); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, cy - 80 + Math.sin(x * 0.02) * 8 + (rnd(x) - 0.5) * 6); for (let x = W; x >= 0; x -= 30) ctx.lineTo(x, cy + 82 + Math.sin(x * 0.017 + 1) * 8 + (rnd(x + 1) - 0.5) * 6); ctx.closePath(); ctx.fill();
      for (let x = 0; x < W; x += 6) { ctx.strokeStyle = 'rgba(20,10,4,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, cy - 60 + rnd(x) * 20); ctx.lineTo(x + 4, cy + 60 - rnd(x + 2) * 20); ctx.stroke(); }
      for (const sd of [-1, 1]) for (let i = 0; i < 160; i++) { const x = rnd(i * 5 + sd) * W, y = cy + sd * (100 + rnd(i * 3 + sd) * 50), r = 4 + rnd(i) * 10; ctx.fillStyle = 'rgba(40,22,10,0.4)'; ctx.beginPath(); ctx.ellipse(x + 2, y + 3, r, r * 0.7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = rnd(i + 1) > 0.5 ? '#B98458' : '#8E5E3A'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.7, 0, 0, TAU); ctx.fill(); }
      // hoe marks: chevrons along the bed
      ctx.strokeStyle = 'rgba(20,10,4,0.35)'; ctx.lineWidth = 3; for (let x = 20; x < W; x += 46) { ctx.beginPath(); ctx.moveTo(x, cy - 26); ctx.lineTo(x + 16, cy); ctx.lineTo(x, cy + 26); ctx.stroke(); }
    });
    put({ id: 'b10', cam: [540, 700], zoom: 0.07, note: 'top-down cracked earth with the dry dug channel running across; a carved wooden block descends (shadow grows), slams and lifts away leaving BUCKINGHAM / CANAL pressed into the earth; dust puff', draw(lt, d, t) {
      ctx.drawImage(earth(), 0, 0);
      const land = Math.max(0.35, tTook - 0.05), lift = Math.max(land + 0.35, tName - 0.1);
      const down = eio(pr(lt, 0.05, land - 0.05)), up = eio(pr(lt, lift, 0.5)), h = (1 - down) + up * 1.2, hit = lt >= land;
      // the pressed letters (debossed: dark ink with a light lower lip)
      if (hit) {
        const a = clamp((lt - land) / 0.08);
        ctx.save(); ctx.globalAlpha = a;
        wood('BUCKINGHAM', 540 + 2.5, 640 + 3, 112, '#E8C49A', 1, 81, { a: 0.5 }); wood('BUCKINGHAM', 540, 640, 112, INK, 1, 81);
        wood('CANAL', 540 + 2.5, 790 + 3, 132, '#E8C49A', 1, 82, { a: 0.5 }); wood('CANAL', 540, 790, 132, INK, 1, 82);
        ctx.restore();
        // dust ring
        const dp = clamp((lt - land) / 0.9); if (dp < 1) for (let i = 0; i < 40; i++) { const an = i / 40 * TAU, r = 380 * eo(dp) + rnd(i) * 40; ctx.fillStyle = `rgba(220,180,130,${0.5 * (1 - dp)})`; ctx.beginPath(); ctx.arc(540 + Math.cos(an) * r, 715 + Math.sin(an) * r * 0.45, 6 + 16 * dp, 0, TAU); ctx.fill(); }
      }
      // the block: shadow first, then the block itself above it (top view, scaled by height)
      if (h < 2.2) {
        const s = 1 + h * 0.35, off = h * 60;
        ctx.save(); ctx.globalAlpha = clamp(1 - up * 0.9) * 0.55; ctx.fillStyle = INK; ctx.filter = `blur(${4 + h * 14}px)`; ctx.beginPath(); ctx.roundRect(540 - 400 * s + off, 715 - 190 * s + off, 800 * s, 380 * s, 20); ctx.fill(); ctx.restore();
        ctx.save(); ctx.globalAlpha = clamp(1.6 - up * 1.4); ctx.translate(540 - off * 0.3, 715 - off * 0.8 - h * 40); ctx.scale(s, s);
        ctx.fillStyle = lg(-400, -190, 400, 190, [[0, '#8A5A34'], [0.5, '#6B4426'], [1, '#3A2414']]); ctx.beginPath(); ctx.roundRect(-400, -190, 800, 380, 18); ctx.fill();
        ctx.strokeStyle = 'rgba(20,10,4,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { const yy = -180 + rnd(i + 90) * 360; ctx.beginPath(); ctx.moveTo(-396, yy); ctx.bezierCurveTo(-120, yy + 8, 120, yy - 8, 396, yy + 3); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,220,160,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-390, -180, 780, 360, 14); ctx.stroke();
        ctx.fillStyle = '#2A170B'; ctx.beginPath(); ctx.roundRect(-70, -40, 140, 80, 30); ctx.fill(); ctx.fillStyle = '#5A3820'; ctx.beginPath(); ctx.roundRect(-60, -34, 120, 60, 26); ctx.fill();
        ctx.restore();
      }
      if (hit) { const sh = Math.exp(-(lt - land) * 14) * 10; ctx.translate(Math.sin(lt * 90) * sh, 0); }
      dustDevil(t, 140 + lt * 50, 1880, 280, 0.5);
      motes(t, 30, 31, 0.4); vignette(0.5);
      shardsIn(lt, shots[8], 404, 520, 900);
    } }, 9);
    cue(t0 + 0.02, 'thud', { gain: 0.45 }); cue(t0 + Math.max(0.35, tTook - 0.05), 'slam', { gain: 0.85 }); cue(t0 + Math.max(0.7, tName - 0.1), 'whoosh', { gain: 0.3 });
  }

  // ── b11 · the diggers left no names: a row of digger puppets turns to blank outlines with "?" tags ──
  {
    const t0 = T[10], tNo = Wd('no', 9) - t0, tNames = Wd('names', 9) - t0;
    const N = 7;
    put({ id: 'b11', cam: [540, 760], zoom: 0.08, note: 'screen: plank BUCKINGHAM CANAL hangs at top; below, a long row of 7 digger/carrier puppets fades one by one from solid shadow to blank dashed outlines, each gets a hanging "?" tag; note "names not recorded"', draw(lt, d, t) {
      stage(t);
      const fade = (i) => eio(clamp((lt - (tNo - 0.55) - i * 0.17) / 0.6));
      const fig = (i, extra) => ({ x: 110 + i * 143, y: 1170 + (i % 2) * 20, s: 0.56 - (i % 3 === 2 ? 0.04 : 0), dir: i % 2 ? -1 : 1, kind: i % 3 === 1 ? 'carrier' : i % 3 === 2 ? 'woman' : 'digger', pose: i % 3 === 1 ? { a2: 2.9, a2b: 0.4, a1: 2.8, a1b: 0.3, ...swayPose(t, i, { a2: 2.9, a1: 2.8, a2b: 0.4, a1b: 0.3 }) } : i % 3 === 0 ? digPose(t * 3.2 * (1 - fade(i) * 0.85) + i * 1.3) : swayPose(t, i), ...extra });
      shadows(t, () => { for (let i = 0; i < N; i++) { ctx.save(); ctx.globalAlpha = 1 - fade(i); puppet(fig(i)); ctx.restore(); } });
      // the blank outlines, dashed, where the shadows were
      ctx.save(); ctx.setLineDash([7, 7]); ctx.lineDashOffset = -t * 12;
      for (let i = 0; i < N; i++) { const f = fade(i); if (f <= 0) continue; ctx.save(); ctx.globalAlpha = f * 0.85; puppet(fig(i, { mode: 'stroke', col: '#6B4426', lw: 3, holes: false })); ctx.restore(); }
      ctx.restore();
      // "?" tags on strings
      for (let i = 0; i < N; i++) {
        const tp = eob(clamp((lt - (tNo - 0.35) - i * 0.17) / 0.45)); if (tp <= 0) continue;
        const f = fig(i), hx = f.x, hy = f.y - 600 * f.s - 120, sw = Math.sin(t * 2 + i) * 0.08;
        ctx.save(); ctx.translate(hx, SCR.y0 + 20); ctx.rotate(sw); ctx.strokeStyle = '#3A2418'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, (hy - SCR.y0 - 20) * tp); ctx.stroke();
        ctx.translate(0, (hy - SCR.y0 - 20) * tp); ctx.scale(tp, tp);
        ctx.fillStyle = '#E2CDA2'; ctx.strokeStyle = '#3A2418'; ctx.lineWidth = 2.5; polyPath([[-30, 0], [30, 0], [30, 66], [0, 82], [-30, 66]]); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3A2418'; ctx.beginPath(); ctx.arc(0, 10, 4, 0, TAU); ctx.fill();
        wood('?', 0, 44, 50, INK, 1, 90 + i); ctx.restore();
      }
      plank([['BUCKINGHAM CANAL', 52, 0]], 540, 262, 640, 96, t, 1);
      note('names not recorded', 540, 1222, 40, '#3A2418', pr(lt, tNames + 0.2, 0.5), { italic: true });
      motes(t, 46, 37); vignette(0.55);
      crackOut(lt, d, 505, 540, 760, 0.36);
    } }, 10);
    cue(t0, 'inhale', { gain: 0.35 }); for (let i = 0; i < N; i += 2) cue(t0 + tNo - 0.35 + i * 0.17, 'tock', { gain: 0.3, pan: -0.6 + i * 0.2 });
    cue(t0 + tNames + 0.2, 'bell', { gain: 0.35 }); cue(T[11] - 0.36, 'rumble', { gain: 0.4, dur: 0.5 });
  }
}
