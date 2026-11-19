// EPISODE 11 · worker B : "Living Mosaic", lines 5-9 (papyrus loan, cargo + pepper, Peutinger copy, records go quiet, 1341 flood theory)
//   b1  RECORD: a papyrus sheet rains down tile by tile onto a terracotta emblema; rows of abstract dark dashes (no text); reading band
//   b2  MOSAIC MAP: Egypt -> Malabar; gold route tiles lay themselves, monsoon rows of light-blue tiles flow, MUZIRIS lights up
//   b3  Roman merchant ship (square sail, curved stern) sails back west over a rippling lapis sea, wake tiles
//   b4  ship's hold assembles (amphorae, ivory tusks, sacks), then gold coin discs rain and pile up; smalti glint on "drachmas"
//   b5  ONE STUDY: pepper berries flip over the ivory and sacks, vines climb the amphorae
//   b6  TILE TRANSITION to a pepper vine close-up; berry spikes ripen green -> black tile by tile
//   b7  MEDIEVAL COPY: camera trucks along a long strip map, columns of tiles assembling at the leading edge
//   b8  temple icon assembles radially beside a little port bay; TEMPLE OF AUGUSTUS; glint sweep; boat bobs in
//   b9  "records go quiet": the dash rows of the papyrus pop out and fall away, bare mortar bed shows through
//   b10 harbour scene (warehouses, ships, Chera bow banner) losing clusters of tiles; UNCERTAIN
//   b11 TILE TRANSITION to a top-down tile map of the coast, Periyar river, Muziris marker; THEORY
//   b12 MUD SWAMP: ochre flood tiles spread out from the river over land and port
//   b13 mosaic digits 1341 assemble over a rippling mud field
//   b14 coastline reshapes: tiles flip north to south, old mouth silts up, a new inlet opens
//   b15 KOCHI dot lights up with expanding tile rings, a ship sails into the new harbour
import { ctx, setCtx, W, H, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';

const K = {
  grout: '#2A2622', mortar: '#6E6A62', m1: '#E9DFC9', m2: '#D8CBB0', m3: '#F4EEDF', lap: '#1F4E8C', lap2: '#2E6DB4', lap3: '#7FB2E0',
  crest: '#F4F1E8', terra: '#B5552F', terra2: '#D9794A', pep: '#232020', vine: '#2E3A24', gold: '#D9A63A', gold2: '#F3CF6B',
  red: '#9E2A2B', mud: '#8C6A3A', mud2: '#B08A52', grn: '#4E7A3A', grn2: '#7FA65A',
};
const LAND = '#D8C29A', PARCH = '#E9DCB8', PSEA = '#7FB2E0', PAPY = '#D9BF8A', INK = '#3A2E22', PLANK = '#7A4E2C', BERRY = '#9DBF6A', DARK = '#3B342D';
const hexInt = (h) => parseInt(h.slice(1), 16);
const rgbOf = (h) => { const v = hexInt(h); return [v >> 16, (v >> 8) & 255, v & 255]; };
const MIX = new Map();
const mix = (h, list) => MIX.set(hexInt(h), list.map(rgbOf));
mix(K.m1, [K.m1, K.m1, K.m1, K.m2, K.m3, '#E2D6BC']);
mix(K.lap2, [K.lap2, K.lap2, '#2A63A6', '#3577C0', '#2B67AE']);
mix(K.lap, [K.lap, '#1B4682', '#24569A']);
mix(LAND, [LAND, '#D2B98C', '#DFCBA6', '#CFB487']);
mix(PARCH, [PARCH, '#E3D3AA', '#EFE3C2', '#E6D6B0']);
mix(K.grn, [K.grn, '#5A8644', '#466E34', '#527F3E']);
mix(K.grn2, [K.grn2, '#8AB066', '#76A052']);
mix(K.mud, [K.mud, '#7E5F33', '#97743F', '#8C6A3A']);
mix(K.mud2, [K.mud2, '#A88049', '#BC9660']);
mix(K.pep, [K.pep, K.pep, '#2E3A24', '#3A3530', '#1A1818', '#2E3A24']);
mix(K.terra, [K.terra, '#A84E2B', '#BE5C34']);
mix(PLANK, [PLANK, '#714829', '#83552F']);
mix(PSEA, [PSEA, '#77AADA', '#88BAE6']);
mix(PAPY, [PAPY, '#D3B781', '#DEC693']);
mix(BERRY, [BERRY, '#8DB05C', '#A9C878']);
mix(DARK, [DARK, '#332D27', '#433B33']);

// ───────────── drawing helpers (used while sampling a picture) ─────────────
function withCtx(c, fn) { const prev = ctx; setCtx(c); try { fn(); } finally { setCtx(prev); } }
const Pf = (pts, c) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
const Rc = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
const El = (x, y, rx, ry, c, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); };
const St = (pts, c, w) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); };

// the emblema panel: cells [IX0..IX1] x [IY0..IY1] at 22 px; border rings outside; marble field elsewhere
const TS = 22, IX0 = 5, IX1 = 43, IY0 = 7, IY1 = 56;
const X0 = IX0 * TS, X1 = (IX1 + 1) * TS, Y0 = IY0 * TS, Y1 = (IY1 + 1) * TS;
const panel = (bg, fn) => () => {
  Rc(0, 0, W, H, K.m1); Rc(X0, Y0, X1 - X0, Y1 - Y0, bg);
  ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, X1 - X0, Y1 - Y0); ctx.clip(); if (fn) fn(); ctx.restore();
};
function setC(Ly, i, j, h) { if (i < 0 || j < 0 || i >= Ly.cols || j >= Ly.rows) return; const c = j * Ly.cols + i, [r, g, b] = rgbOf(h); Ly.R[c] = r; Ly.G[c] = g; Ly.B[c] = b; Ly.A[c] = 255; }
function frameBorder(Ly) {
  for (let d = 1; d <= 3; d++) {
    const i0 = IX0 - d, i1 = IX1 + d, j0 = IY0 - d, j1 = IY1 + d, ring = [];
    for (let i = i0; i <= i1; i++) ring.push([i, j0]);
    for (let j = j0 + 1; j <= j1; j++) ring.push([i1, j]);
    for (let i = i1 - 1; i >= i0; i--) ring.push([i, j1]);
    for (let j = j1 - 1; j > j0; j--) ring.push([i0, j]);
    ring.forEach(([i, j], s) => {
      const corner = (i === i0 || i === i1) && (j === j0 || j === j1);
      setC(Ly, i, j, corner ? K.gold : d === 2 ? (s % 4 < 2 ? K.terra : K.m3) : '#3B3029');
    });
  }
  for (let i = 0; i < Ly.cols; i++) { setC(Ly, i, 84, (i % 2) ? K.lap : K.m3); setC(Ly, i, 85, (i % 2) ? K.m3 : K.lap); setC(Ly, i, 83, '#3B3029'); setC(Ly, i, 86, '#3B3029'); }
}

// ───────────── tile layers: sample vector art once (one colour per cell), render jittered tesserae into a cached canvas ─────────────
const LAYS = new Map();
function layer(key, o) {
  let Ly = LAYS.get(key); if (Ly) return Ly;
  const ts = o.ts || TS, w = o.w || W, h = o.h || H, cols = Math.ceil(w / ts), rows = Math.ceil(h / ts), n = cols * rows, k = 3;
  const sc = document.createElement('canvas'); sc.width = cols * k; sc.height = rows * k;
  const sx = sc.getContext('2d', { willReadFrequently: true });
  withCtx(sx, () => { sx.save(); sx.scale(k / ts, k / ts); o.draw(); sx.restore(); });
  const d = sx.getImageData(0, 0, sc.width, sc.height).data;
  const R = new Uint8Array(n), G = new Uint8Array(n), B = new Uint8Array(n), A = new Uint8Array(n);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const p = ((j * k + 1) * sc.width + i * k + 1) * 4, c = j * cols + i; R[c] = d[p]; G[c] = d[p + 1]; B[c] = d[p + 2]; A[c] = d[p + 3]; }
  Ly = { key, ts, w, h, cols, rows, n, R, G, B, A, cs: new Array(n) };
  if (o.post) o.post(Ly);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const lc = cv.getContext('2d');
  if (!o.alpha) { lc.fillStyle = K.grout; lc.fillRect(0, 0, w, h); }
  let seed = 0; for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  for (let c = 0; c < n; c++) {
    if (A[c] < 128) { Ly.cs[c] = null; continue; }
    let r = R[c], g = G[c], b = B[c]; const m = MIX.get((r << 16) | (g << 8) | b);
    if (m) [r, g, b] = m[Math.floor(rnd(c * 1.37 + seed) * m.length)];
    const sh = 0.9 + rnd(c * 2.11 + seed + 5) * 0.17, tint = (rnd(c * 0.71 + seed) - 0.5) * 8;
    r = clamp(Math.round(r * sh + tint), 0, 255); g = clamp(Math.round(g * sh), 0, 255); b = clamp(Math.round(b * sh - tint), 0, 255);
    const col = `rgb(${r},${g},${b})`; Ly.cs[c] = col;
    const i = c % cols, j = (c / cols) | 0;
    const x = (i + 0.5) * ts + (rnd(c * 3.3 + seed) - 0.5) * ts * 0.1, y = (j + 0.5) * ts + (rnd(c * 4.7 + seed) - 0.5) * ts * 0.1;
    const s = (ts - 2.8) / 2 - rnd(c * 5.9 + seed) * ts * 0.05, a = (rnd(c * 6.1 + seed) - 0.5) * 0.14;
    const cc = Math.cos(a) * s, dd = Math.sin(a) * s;
    const p0 = [x - cc + dd, y - dd - cc], p1 = [x + cc + dd, y + dd - cc], p2 = [x + cc - dd, y + dd + cc], p3 = [x - cc - dd, y - dd + cc];
    lc.beginPath(); lc.moveTo(p0[0], p0[1]); lc.lineTo(p1[0], p1[1]); lc.lineTo(p2[0], p2[1]); lc.lineTo(p3[0], p3[1]); lc.closePath(); lc.fillStyle = col; lc.fill();
    lc.beginPath(); lc.moveTo(p0[0], p0[1]); lc.lineTo(p1[0], p1[1]); lc.lineTo(p3[0], p3[1]); lc.closePath(); lc.fillStyle = 'rgba(255,255,255,0.10)'; lc.fill();
    lc.beginPath(); lc.moveTo(p2[0], p2[1]); lc.lineTo(p1[0], p1[1]); lc.lineTo(p3[0], p3[1]); lc.closePath(); lc.fillStyle = 'rgba(0,0,0,0.08)'; lc.fill();
  }
  Ly.cv = cv; LAYS.set(key, Ly); return Ly;
}
const colAt = (Ly, c) => (Ly.R[c] << 16) | (Ly.G[c] << 8) | Ly.B[c];
const cellXY = (Ly, c) => [(c % Ly.cols + 0.5) * Ly.ts, (((c / Ly.cols) | 0) + 0.5) * Ly.ts];
const MEMO = new Map();
const memo = (key, fn) => { let v = MEMO.get(key); if (v === undefined) { v = fn(); MEMO.set(key, v); } return v; };
function cellsOf(Ly, hexes) {
  return memo('bco:' + Ly.key + hexes.join(), () => { const S = new Set(hexes.map(hexInt)), out = []; for (let c = 0; c < Ly.n; c++) if (Ly.A[c] > 128 && S.has(colAt(Ly, c))) out.push(c); return Int32Array.from(out); });
}
function diff(A, B) {
  const out = []; for (let c = 0; c < B.n; c++) { if ((A.A[c] > 128) !== (B.A[c] > 128) || Math.abs(A.R[c] - B.R[c]) + Math.abs(A.G[c] - B.G[c]) + Math.abs(A.B[c] - B.B[c]) > 24) out.push(c); }
  return out;
}
function mkOrder(idxs, kf) {
  const arr = Array.from(idxs, (c) => [c, kf(c)]).sort((a, b) => a[1] - b[1]);
  const k0 = arr.length ? arr[0][1] : 0, k1 = arr.length ? arr[arr.length - 1][1] : 1, sp = (k1 - k0) || 1;
  return { idx: Int32Array.from(arr, (a) => a[0]), k: Float32Array.from(arr, (a) => (a[1] - k0) / sp) };
}
function lower(O, v) { let lo = 0, hi = O.k.length; while (lo < hi) { const m = (lo + hi) >> 1; if (O.k[m] < v) lo = m + 1; else hi = m; } return lo; }

// ───────────── per-frame tile devices ─────────────
function clipDraw(O, a, b, src, ts, cols, ox = 0, oy = 0) {
  if (b <= a) return;
  ctx.save(); ctx.beginPath();
  for (let q = a; q < b; q++) { const c = O.idx[q]; ctx.rect(ox + (c % cols) * ts, oy + ((c / cols) | 0) * ts, ts, ts); }
  ctx.clip(); ctx.drawImage(src, src === MORTAR() ? 0 : ox, src === MORTAR() ? 0 : oy); ctx.restore();
}
function tileAt(col, x, y, ts, rot = 0, sx = 1, sy = 1, a = 1) {
  const hs = (ts - 2.8) / 2; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy);
  ctx.fillStyle = col; ctx.fillRect(-hs, -hs, hs * 2, hs * 2); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(-hs, -hs, hs * 2, hs * 0.45); ctx.restore();
}
/** TILE ASSEMBLY: cells of B with key < p-band are set; cells in the band fly in. */
function assemble(B, O, p, band, ox = 0, oy = 0, mode = 'rain', cx = 540, cy = 700) {
  const a = lower(O, p - band), b = lower(O, p), ts = B.ts, cols = B.cols;
  clipDraw(O, 0, a, B.cv, ts, cols, ox, oy);
  for (let q = a; q < b; q++) {
    const c = O.idx[q], u = clamp((p - O.k[q]) / band), e = eo(u), [x, y] = cellXY(B, c); if (!B.cs[c]) continue;
    let fx, fy;
    if (mode === 'rain') { fx = x + (rnd(c * 1.7) - 0.5) * 90 * (1 - e); fy = y - (260 + rnd(c * 2.3) * 300) * (1 - e); }
    else { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1, r = (380 + rnd(c * 2.9) * 420) * (1 - e); fx = x + dx / l * r + (rnd(c) - 0.5) * 200 * (1 - e); fy = y + dy / l * r; }
    tileAt(B.cs[c], ox + fx, oy + fy, ts, (rnd(c * 3.7) - 0.5) * 5 * (1 - e), 1 + 0.5 * (1 - e), 1 + 0.5 * (1 - e), clamp(u * 3));
  }
}
/** MISSING-TILE LOSS: cells with key < p are gone (mortar bed); the band pops up and falls away. */
function holes(Ly, O, p, band) {
  const a = lower(O, p - band), b = lower(O, p), ts = Ly.ts;
  clipDraw(O, 0, b, MORTAR(), ts, Ly.cols);
  for (let q = a; q < b; q++) {
    const c = O.idx[q], u = clamp((p - O.k[q]) / band), [x, y] = cellXY(Ly, c); if (!Ly.cs[c]) continue;
    const f = Math.max(0, u - 0.25) / 0.75, lift = Math.min(1, u * 4);
    tileAt(Ly.cs[c], x + (rnd(c * 1.3) - 0.5) * 160 * f, y + f * f * 900 - lift * 8, ts, (rnd(c * 2.1) - 0.5) * 7 * f, 1 + lift * 0.18, 1 + lift * 0.18, 1 - f * f);
  }
}
/** cells of B replace A tile by tile: 'flip' turns each tile over, 'grow' sets a new tile on top */
function flipCells(A, B, O, p, band, mode = 'flip') {
  ctx.drawImage(A.cv, 0, 0);
  const a = lower(O, p - band), b = lower(O, p), ts = B.ts;
  clipDraw(O, 0, a, B.cv, ts, B.cols);
  for (let q = a; q < b; q++) {
    const c = O.idx[q], u = clamp((p - O.k[q]) / band), [x, y] = cellXY(B, c);
    if (mode === 'flip') {
      ctx.fillStyle = K.grout; ctx.fillRect(x - ts / 2, y - ts / 2, ts, ts);
      const col = u < 0.5 ? A.cs[c] : B.cs[c]; if (col) tileAt(col, x, y, ts, 0, Math.max(0.04, Math.abs(Math.cos(u * Math.PI))), 1);
    } else { const e = eob(u); if (B.cs[c]) tileAt(B.cs[c], x, y - (1 - eo(u)) * 30, ts, (1 - u) * 0.8, e, e, clamp(u * 3)); }
  }
}
/** TILE TRANSITION: the whole frame turns over in 44 px blocks along a diagonal */
function flipFrame(A, B, p) {
  if (p <= 0) { ctx.drawImage(A, 0, 0); return; } if (p >= 1) { ctx.drawImage(B, 0, 0); return; }
  const bs = 44, nx = Math.ceil(W / bs), ny = Math.ceil(H / bs);
  ctx.fillStyle = K.grout; ctx.fillRect(0, 0, W, H);
  for (let by = 0; by < ny; by++) for (let bx = 0; bx < nx; bx++) {
    const dl = (bx / nx * 0.35 + by / ny * 0.65) * 0.6 + rnd(bx * 7 + by * 13) * 0.05, q = clamp((p - dl) / 0.35);
    const src = q < 0.5 ? A : B, sx = q <= 0 || q >= 1 ? 1 : Math.abs(Math.cos(q * Math.PI)), w = bs * Math.max(0.03, sx);
    ctx.drawImage(src, bx * bs, by * bs, bs, bs, bx * bs + (bs - w) / 2, by * bs, w, bs);
  }
}
/** TILE RIPPLE: water cells brighten / darken in travelling bands */
function ripple(Ly, cells, t, o = {}) {
  const ts = Ly.ts, cols = Ly.cols, ox = o.ox || 0, oy = o.oy || 0, s = ts - 3, hi = [], lo = [], sp = o.sp || 1;
  const xmin = o.xmin ?? -1e9, xmax = o.xmax ?? 1e9;
  for (let q = 0; q < cells.length; q++) {
    const c = cells[q], i = c % cols, j = (c / cols) | 0; const X = ox + i * ts; if (X < xmin || X > xmax) continue;
    const v = Math.sin(i * 0.5 + j * 0.85 - t * 3.1 * sp) + 0.7 * Math.sin(i * 0.23 - j * 0.31 + t * 1.7 * sp + 1);
    if (v > 1.2) hi.push(c); else if (v < -1.3) lo.push(c);
  }
  ctx.fillStyle = o.hi || 'rgba(244,241,232,0.5)'; for (const c of hi) ctx.fillRect(ox + (c % cols) * ts + 1.5, oy + ((c / cols) | 0) * ts + 1.5, s, s);
  ctx.fillStyle = o.lo || 'rgba(10,26,58,0.3)'; for (const c of lo) ctx.fillRect(ox + (c % cols) * ts + 1.5, oy + ((c / cols) | 0) * ts + 1.5, s, s);
}
/** SMALTI GLINT: a diagonal band of light across the given cells, plus random twinkles */
function glint(Ly, cells, pos, wid, t, tw = 0.03) {
  const ts = Ly.ts, cols = Ly.cols, s = ts - 3;
  for (let q = 0; q < cells.length; q++) {
    const c = cells[q], i = c % cols, j = (c / cols) | 0, dd = Math.abs(i + j * 0.6 - pos);
    let a = dd < wid ? (1 - dd / wid) * 0.8 : 0; if (rnd(c * 0.37 + Math.floor(t * 6)) < tw) a = Math.max(a, 0.7);
    if (a > 0.02) { ctx.fillStyle = `rgba(255,246,210,${a.toFixed(2)})`; ctx.fillRect(i * ts + 1.5, j * ts + 1.5, s, s); }
  }
}
function tablet(text, x, y, p, size = 40) {
  if (p <= 0) return; const e = eob(clamp(p));
  ctx.save(); ctx.font = `700 ${size}px Caladea`; ctx.letterSpacing = `${(size * 0.1).toFixed(1)}px`;
  const tw = ctx.measureText(text).width, w = tw + size * 1.3, h = size * 1.65;
  ctx.globalAlpha *= clamp(p * 3); ctx.translate(x, y - (1 - e) * 150); ctx.rotate((1 - e) * -0.1);
  ctx.fillStyle = 'rgba(20,16,12,0.4)'; ctx.fillRect(-w / 2 + 7, -h / 2 + 9, w, h);
  ctx.fillStyle = K.grout; ctx.fillRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10);
  ctx.fillStyle = K.m3; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = 'rgba(42,38,34,0.10)'; for (let gx = -w / 2 + size * 0.9; gx < w / 2 - 4; gx += size * 0.9) ctx.fillRect(gx, -h / 2, 2, h);
  ctx.strokeStyle = K.grout; ctx.lineWidth = 2; ctx.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14);
  ctx.fillStyle = K.grout; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, size * 0.05, size * 0.06);
  ctx.restore(); ctx.letterSpacing = '0px';
}
// TESSERAE COUNTER: 5x7 mosaic digits
const GLY = {
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'], 3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
};
const GOLDS = [K.gold, K.gold2, '#C9952E', '#E3B44A', K.gold];
function mosaicNum(str, cx, cy, cs, times, t, sweep) {
  const n = str.length, gw = 5 * cs, tot = n * gw + (n - 1) * cs, x0 = cx - tot / 2, y0 = cy - 3.5 * cs, set = [];
  for (let k = 0; k < n; k++) { const g = GLY[str[k]]; for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (g[r][q] === '1') {
    const id = k * 41 + r * 5 + q + 1, tl = times[k] + rnd(id) * 0.28, u = clamp((t - tl) / 0.38); if (u <= 0) continue;
    set.push([x0 + k * (gw + cs) + q * cs + cs / 2, y0 + r * cs + cs / 2, u, id]);
  } }
  ctx.fillStyle = K.grout; for (const [x, y, u] of set) if (u >= 1) ctx.fillRect(x - cs / 2 - 3, y - cs / 2 - 3, cs + 6, cs + 6);
  for (const [x, y, u, id] of set) {
    const e = eo(u), fx = x + (rnd(id + 1) - 0.5) * 900 * (1 - e), fy = y - (300 + rnd(id + 2) * 600) * (1 - e);
    tileAt(GOLDS[Math.floor(rnd(id + 3) * GOLDS.length)], fx, fy, cs, (rnd(id + 4) - 0.5) * 6 * (1 - e) + (rnd(id + 5) - 0.5) * 0.08, 1, 1, clamp(u * 3));
    if (sweep != null && u >= 1) { const dd = Math.abs(x + y * 0.5 - sweep); if (dd < 90) { ctx.fillStyle = `rgba(255,248,215,${(0.85 * (1 - dd / 90)).toFixed(2)})`; ctx.fillRect(x - cs / 2 + 1.5, y - cs / 2 + 1.5, cs - 3, cs - 3); } }
  }
}

// mortar bed: grey with trowel scratches
let _mortar = null;
function MORTAR() {
  if (_mortar) return _mortar;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = K.mortar; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { x.fillStyle = rnd(i) < 0.5 ? 'rgba(40,36,32,0.22)' : 'rgba(170,165,152,0.22)'; x.fillRect(rnd(i * 3.1) * W, rnd(i * 5.3) * H, 2 + rnd(i * 7.7) * 4, 2 + rnd(i * 2.2) * 3); }
  x.lineCap = 'round';
  for (let i = 0; i < 140; i++) { const cx = rnd(i * 9.1) * W, cy = rnd(i * 4.9) * H, r = 60 + rnd(i * 3.3) * 160, a0 = rnd(i * 1.9) * 6.28;
    x.strokeStyle = i % 2 ? 'rgba(38,34,30,0.35)' : 'rgba(165,160,148,0.35)'; x.lineWidth = 1.5 + rnd(i) * 1.5; x.beginPath(); x.arc(cx, cy, r, a0, a0 + 0.5 + rnd(i * 8.8) * 0.9); x.stroke(); }
  return (_mortar = c);
}
function compose(key, fn) { return memo(key, () => { const c = document.createElement('canvas'); c.width = W; c.height = H; withCtx(c.getContext('2d'), fn); return c; }); }
const inner = (Ly, c) => { const i = c % Ly.cols, j = (c / Ly.cols) | 0; return i >= IX0 && i <= IX1 && j >= IY0 && j <= IY1; };
function distPoly(x, y, P) {
  let best = 1e9;
  for (let k = 0; k < P.length - 1; k++) { const [ax, ay] = P[k], [bx, by] = P[k + 1], dx = bx - ax, dy = by - ay, u = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)); best = Math.min(best, Math.hypot(x - ax - u * dx, y - ay - u * dy)); }
  return best;
}

// ───────────── pictures ─────────────
const Lpap = (full) => layer(full ? 'bPap1' : 'bPap0', { draw: panel(K.terra, () => {
  for (let i = 0; i < 6; i++) Rc(X0, Y0 + 66 + i * 176, X1 - X0, 22, '#A84E2B');
  if (!full) return;
  const pts = []; for (let k = 0; k <= 12; k++) pts.push([220 + k * 53, 236 + (rnd(k + 2) - 0.5) * 26]); for (let k = 0; k <= 16; k++) pts.push([862 + (rnd(k + 30) - 0.5) * 24, 240 + k * 58]);
  for (let k = 12; k >= 0; k--) pts.push([220 + k * 53, 1172 + (rnd(k + 60) - 0.5) * 26]); for (let k = 16; k >= 0; k--) pts.push([218 + (rnd(k + 90) - 0.5) * 24, 240 + k * 58]);
  Pf(pts, PAPY);
  ctx.save(); Pf(pts, PAPY); ctx.clip(); for (let i = 10; i < 40; i += 3) Rc(i * TS, 220, TS, 970, '#CDB07A'); ctx.restore();
  // abstract unreadable rows of dashes (no letters)
  for (let j = 13; j <= 51; j += 2) {
    if (j === 25 || j === 39) continue; let i = 12 + (j === 27 || j === 41 ? 2 : 0); const end = 37 - Math.floor(rnd(j * 3.3) * (j === 23 || j === 37 || j === 51 ? 14 : 3));
    while (i <= end) { const len = 1 + Math.floor(rnd(i * 7.1 + j * 13.7) * 4); Rc(i * TS, j * TS, Math.min(len, end - i + 1) * TS, TS, INK); i += len + 1; }
  }
  // lacunae (damaged edges)
  Pf([[220, 980], [290, 1010], [310, 1090], [260, 1172], [218, 1172]], K.terra); Pf([[862, 236], [800, 236], [770, 290], [820, 330], [862, 320]], K.terra);
  El(700, 1150, 70, 34, K.terra);
}), post: frameBorder });

const MAPC = { ber: [352, 400], muz: [858, 960] };
const Lmap = () => layer('bMap', { draw: panel(K.lap2, () => {
  Pf([[60, 100], [262, 100], [300, 250], [350, 400], [392, 540], [420, 600], [470, 640], [545, 655], [505, 760], [425, 900], [360, 1060], [320, 1300], [60, 1300]], LAND);
  Pf([[310, 100], [740, 100], [780, 190], [745, 290], [690, 395], [600, 465], [500, 535], [445, 552], [412, 470], [362, 320]], LAND);
  Pf([[795, 100], [1000, 100], [1000, 980], [955, 1150], [918, 1100], [882, 985], [852, 865], [830, 700], [806, 560], [792, 430], [812, 330], [842, 250], [822, 175]], LAND);
  El(962, 1205, 26, 42, LAND);
  St([[150, 100], [175, 250], [205, 420], [215, 560]], K.lap2, 24);
  El(170, 700, 70, 120, '#C9A66B'); El(600, 230, 110, 60, '#C9A66B'); El(930, 420, 50, 160, '#C9A66B');
  St([[846, 780], [866, 870], [890, 960], [914, 1060]], K.grn, 36);
}), post: frameBorder });
const ROUTE = [[352, 400], [380, 470], [412, 545], [440, 600], [520, 650], [640, 740], [740, 830], [810, 905], [850, 955]];
const routeCells = () => memo('bRoute', () => {
  const out = [], seen = new Set();
  for (let k = 0; k < ROUTE.length - 1; k++) { const [ax, ay] = ROUTE[k], [bx, by] = ROUTE[k + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) / 6);
    for (let s = 0; s <= n; s++) { const x = ax + (bx - ax) * s / n, y = ay + (by - ay) * s / n, c = Math.floor(y / TS) * Lmap().cols + Math.floor(x / TS); if (!seen.has(c)) { seen.add(c); out.push(c); } } }
  return out;
});

const Lsea = () => layer('bSea', { draw: panel(K.m1, () => {
  El(760, 380, 96, 96, K.gold); El(760, 380, 66, 66, K.gold2);
  Pf([[110, 640], [200, 560], [300, 600], [380, 530], [470, 600], [520, 640]], '#C9A66B');
  Rc(X0, 640, X1 - X0, 22, K.lap3); Rc(X0, 662, X1 - X0, 300, K.lap2); Rc(X0, 962, X1 - X0, 300, K.lap);
  for (let j = 0; j < 12; j++) for (let i = 0; i < 6; i++) Rc(((i * 7 + j * 3) % 39 + IX0) * TS, (31 + j * 2) * TS, TS * 2, TS, j < 6 ? '#3577C0' : '#2A63A6');
}), post: frameBorder });
const Lship = () => layer('bShip', { ts: 16, w: 576, h: 432, alpha: true, draw: () => {
  Pf([[40, 172], [92, 170], [100, 262], [30, 262]], K.m3); St([[66, 270], [60, 150]], '#3A2616', 8);
  Rc(262, 40, 16, 250, '#3A2616'); Rc(104, 48, 330, 16, '#3A2616');
  Pf([[118, 64], [420, 64], [434, 160], [428, 254], [112, 254], [106, 160]], K.m3);
  Rc(176, 64, 32, 190, K.red); Rc(332, 64, 32, 190, K.red); Rc(112, 150, 316, 14, '#CDB07A');
  for (const x of [150, 214, 330, 394]) { El(x, 262, 13, 22, K.terra); }
  Pf([[18, 284], [480, 284], [510, 250], [526, 190], [548, 160], [556, 196], [538, 262], [508, 330], [462, 380], [400, 404], [150, 404], [80, 372], [40, 330]], '#5A3A22');
  Rc(30, 300, 470, 18, K.terra); Rc(18, 278, 470, 12, '#3A2616');
  St([[474, 262], [508, 410]], '#3A2616', 12);
} });
const Lcoin = (hi) => layer(hi ? 'bCoinH' : 'bCoin', { ts: 12, w: 60, h: 60, alpha: true, draw: () => {
  El(30, 30, 29, 29, hi ? '#FFF3C8' : K.gold); El(30, 30, 17, 17, hi ? '#FFFFFF' : K.gold2); El(30, 30, 6, 6, hi ? '#FFF3C8' : K.gold);
} });

function amph(x, top, bot) {
  Pf([[x - 36, top + 240], [x + 36, top + 240], [x + 8, bot - 6], [x, bot], [x - 8, bot - 6]], K.terra);
  El(x, top + 160, 54, 104, K.terra); Rc(x - 17, top + 26, 34, 70, K.terra); Rc(x - 28, top + 14, 56, 22, K.terra2);
  St([[x - 14, top + 44], [x - 52, top + 54], [x - 50, top + 98]], '#8E3F22', 20); St([[x + 14, top + 44], [x + 52, top + 54], [x + 50, top + 98]], '#8E3F22', 20);
  El(x - 22, top + 140, 15, 62, K.terra2);
}
function tusk(cx, cy) {
  const pts = [], inner = [], R = 172;
  for (let a = 200; a <= 335; a += 5) { const r = a * Math.PI / 180, th = 42 * (1 - (a - 200) / 150) + 6; pts.push([cx + R * Math.cos(r), cy + R * Math.sin(r)]); inner.push([cx + (R - th) * Math.cos(r), cy + (R - th) * Math.sin(r)]); }
  Pf(pts.concat(inner.reverse()), K.m3); const r0 = 200 * Math.PI / 180; El(cx + 152 * Math.cos(r0), cy + 152 * Math.sin(r0), 26, 18, K.m2, 0.4);
}
function holdBase() { for (let y = Y0; y < Y1; y += 66) Rc(X0, y + 44, X1 - X0, 22, '#8C5A33'); Rc(X0, 520, X1 - X0, 22, '#5A3A22'); Rc(X0, 726, X1 - X0, 22, '#5A3A22'); Rc(X0, 990, X1 - X0, 22, '#5A3A22'); }
function holdCargo() {
  for (const x of [186, 318, 450, 582, 714, 846]) amph(x, 196, 518);
  for (const x of [240, 520, 800]) tusk(x, 860);
  for (const x of [190, 365, 540, 715, 890]) { ctx.beginPath(); ctx.roundRect(x - 72, 800, 144, 186, 44); ctx.fillStyle = K.mud2; ctx.fill(); Pf([[x - 30, 808], [x + 30, 808], [x + 22, 762], [x - 22, 762]], K.mud); Rc(x - 72, 890, 144, 22, '#9C7A45'); }
}
const LholdE = () => layer('bHoldE', { draw: panel(PLANK, holdBase), post: frameBorder });
const Lhold = () => layer('bHold', { draw: panel(PLANK, () => { holdBase(); holdCargo(); }), post: frameBorder });
const LholdP = () => layer('bHoldP', { draw: panel(PLANK, () => {
  holdBase(); holdCargo();
  Pf([[X0, 1000], [X0, 640], [170, 600], [260, 560], [360, 590], [450, 548], [560, 580], [660, 552], [760, 590], [860, 560], [X1, 600], [X1, 1000]], K.pep);
  for (let k = 0; k < 14; k++) El(150 + k * 60, 990 - rnd(k + 3) * 30, 50, 30, K.pep);
  for (const [x0, s] of [[250, 1], [646, -1], [910, -1]]) {
    St([[x0, 600], [x0 + s * 30, 500], [x0 - s * 10, 400], [x0 + s * 26, 300], [x0, 220]], K.vine, 18);
    for (let k = 0; k < 4; k++) El(x0 + (k % 2 ? 1 : -1) * 34, 540 - k * 90, 34, 22, k % 2 ? K.grn : K.grn2, (k % 2 ? 0.5 : -0.5));
  }
}), post: frameBorder });
const COINS = (() => { const out = []; for (let r = 0; r < 5; r++) { const n = 13 - r * 2; for (let q = 0; q < n; q++) out.push([540 + (q - (n - 1) / 2) * 62 + (rnd(r * 17 + q) - 0.5) * 10, 1222 - r * 44]); } return out; })();
function drawCoins(t, t0, sweep) {
  const C = Lcoin(false), CH = Lcoin(true);
  COINS.forEach(([x, y], q) => {
    const tl = t0 + q * 0.027 + rnd(q * 3.1) * 0.05, fall = 0.36, u = (t - (tl - fall)) / fall; if (u <= 0) return;
    const e = Math.min(1, u), yy = u < 1 ? lerp(y - 900, y, e * e) : y - Math.max(0, Math.sin(Math.min(1, (u - 1) * fall / 0.15) * Math.PI)) * 10;
    const sx = u < 1 ? Math.max(0.12, Math.abs(Math.cos((1 - u) * 7 + q))) : 1;
    ctx.save(); ctx.translate(x, yy); ctx.scale(sx, 1); ctx.drawImage(C.cv, -30, -30);
    if (sweep != null && u >= 1) { const dd = Math.abs(x + y * 0.6 - sweep); if (dd < 110) { ctx.globalAlpha = 1 - dd / 110; ctx.drawImage(CH.cv, -30, -30); } }
    else if (u >= 1 && rnd(q * 0.7 + Math.floor(t * 5)) < 0.05) { ctx.globalAlpha = 0.7; ctx.drawImage(CH.cv, -30, -30); }
    ctx.restore();
  });
}

const VSP = [[27, 36, 12], [19, 25, 11], [28, 15, 10], [18, 45, 9]];
const Lvine = (ripe) => layer(ripe ? 'bVineB' : 'bVineG', { draw: panel(K.m1, () => {
  for (let j = 0; j < 4; j++) Rc(X0, Y0 + 220 + j * 280, X1 - X0, 22, K.m2);
  St([[540, 1260], [515, 1020], [585, 780], [495, 540], [560, 320], [535, 150]], K.vine, 30);
  for (const [x, y, a] of [[392, 960, -0.6], [700, 830, 0.5], [372, 610, -0.5], [710, 440, 0.6], [400, 260, -0.4], [690, 1110, 0.45]]) {
    El(x, y, 120, 72, K.grn, a); El(x + Math.cos(a) * 10, y - 22 + Math.sin(a) * 30, 104, 36, K.grn2, a); St([[x - Math.cos(a) * 110, y - Math.sin(a) * 110], [x + Math.cos(a) * 110, y + Math.sin(a) * 110]], K.vine, 10);
  }
  for (const [i, j, n] of VSP) { St([[i * TS + 22, j * TS - 40], [i * TS + 22, j * TS]], K.vine, 12); for (let k = 0; k < n; k++) Rc(i * TS + (k >= n - 3 ? 11 : 0), (j + k) * TS, k >= n - 3 ? TS : TS * 2, TS, ripe ? K.pep : BERRY); }
}), post: frameBorder });

const SW = 3680, SH = 640;
const Lstrip = () => layer('bStrip', { ts: 20, w: SW, h: SH, draw: () => {
  Rc(0, 0, SW, SH, PARCH);
  ctx.beginPath(); ctx.moveTo(0, 0); for (let x = 0; x <= SW; x += 40) ctx.lineTo(x, 96 + Math.sin(x / 170) * 22 + Math.sin(x / 61) * 8); ctx.lineTo(SW, 0); ctx.closePath(); ctx.fillStyle = PSEA; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, SH); for (let x = 0; x <= SW; x += 40) ctx.lineTo(x, 560 + Math.sin(x / 130 + 2) * 20); ctx.lineTo(SW, SH); ctx.closePath(); ctx.fillStyle = PSEA; ctx.fill();
  for (let k = 0; k < 9; k++) El(200 + k * 410, 40, 44, 16, PARCH);
  for (let k = 0; k < 22; k++) { const x = 90 + k * 165 + rnd(k) * 60, y = k % 2 ? 175 : 470; El(x, y, 64, 28, K.mud2); El(x - 8, y - 10, 40, 14, '#C9A66B'); }
  for (let k = 0; k < 7; k++) { const x = 260 + k * 520; St([[x, 100], [x + 40, 220], [x - 20, 330], [x + 50, 450], [x + 10, 570]], K.lap2, 20); }
  for (const [y, ph] of [[260, 0], [380, 1]]) { let x = 0; while (x < SW - 300) { const len = 160 + Math.floor(rnd(x * 0.01 + ph) * 6) * 40; Rc(x, y, len, 20, K.red); Rc(x + len - 20, y, 20, 40, K.red); x += len + 40; } }
  for (let k = 0; k < 8; k++) { const x = 380 + k * 400 + (k % 2) * 80, y = k % 2 ? 360 : 240; if (x > 2900) continue; Rc(x, y - 40, 20, 40, K.terra); Rc(x + 40, y - 40, 20, 40, K.terra); Pf([[x - 6, y - 40], [x + 10, y - 66], [x + 26, y - 40]], K.red); Pf([[x + 34, y - 40], [x + 50, y - 66], [x + 66, y - 40]], K.red); }
  for (let x = 900; x < SW; x += 900) Rc(x, 0, 20, SH, '#D9C79C');
  // the temple icon near the port (right end)
  Pf([[2880, 560], [2960, 470], [3060, 520], [3180, 470], [3280, 560]], PSEA);
  Rc(2990, 350, 180, 24, K.mud); for (let k = 0; k < 4; k++) Rc(3006 + k * 44, 272, 20, 80, K.m3); Rc(2994, 252, 172, 20, K.gold);
  Pf([[2980, 254], [3180, 254], [3080, 186], [3080, 186]], K.red); El(3080, 182, 12, 12, K.gold);
} });
const LdarkP = () => layer('bDarkP', { draw: panel(DARK), post: frameBorder });

function templeLand() {
  for (let j = 0; j < 6; j++) Rc(X0, Y0 + 132 + j * 198, X1 - X0, 22, '#E3D3AA');
  Pf([[560, Y1], [X1, Y1], [X1, 830], [880, 860], [790, 950], [700, 1080], [620, 1170]], K.lap2);
  St([[X0, 900], [260, 880], [330, 830]], K.red, 22); St([[750, 830], [860, 760], [X1, 740]], K.red, 22);
  St([[X0, 1100], [240, 1120], [380, 1210], [450, 1254]], K.lap2, 26);
  for (let k = 0; k < 5; k++) { El(170 + k * 40, 330 + (k % 2) * 30, 50, 22, K.mud2); }
  Rc(640, 1080, 22, 100, K.mud);
}
const Ltemple = (full) => layer(full ? 'bTem1' : 'bTem0', { draw: panel(PARCH, () => {
  templeLand(); if (!full) return;
  Rc(320, 800, 440, 44, K.mud); Rc(346, 770, 388, 30, K.mud2); Rc(370, 500, 340, 270, DARK);
  for (let k = 0; k < 5; k++) { const x = 360 + k * 82; Rc(x, 500, 44, 270, K.m3); Rc(x + 22, 500, 22, 270, K.m2); Rc(x - 6, 480, 56, 22, K.m2); }
  Rc(318, 452, 444, 40, K.gold); Pf([[296, 458], [784, 458], [540, 292]], K.red); Pf([[392, 436], [688, 436], [540, 344]], K.terra);
  El(540, 286, 22, 22, K.gold); El(306, 446, 18, 18, K.gold); El(774, 446, 18, 18, K.gold); Rc(518, 382, 44, 44, K.gold2);
}), post: frameBorder });

const Lport = () => layer('bPort', { draw: panel(K.m1, () => {
  Pf([[X0, 470], [X0, 400], [250, 360], [420, 410], [600, 350], [800, 400], [X1, 380], [X1, 470]], K.grn2);
  for (let k = 0; k < 6; k++) { const x = 260 + k * 104, h = 120 + (k % 3) * 30; Rc(x, 690 - h, 96, h, K.terra2); Pf([[x - 12, 690 - h], [x + 48, 690 - h - 60], [x + 108, 690 - h]], K.terra); Rc(x + 34, 640, 28, 50, DARK); }
  for (const [x, h] of [[880, 360], [806, 300]]) { St([[x, 700], [x - 10, 700 - h * 0.5], [x + 6, 700 - h]], '#5A3A22', 20); for (let a = 0; a < 7; a++) { const r = -Math.PI + a * Math.PI / 6; St([[x + 6, 700 - h], [x + 6 + Math.cos(r) * 110, 700 - h + Math.sin(r) * 50 + 40]], K.grn, 22); } }
  Rc(X0, 690, X1 - X0, 44, K.mud2); Rc(X0, 734, X1 - X0, 260, K.lap2); Rc(X0, 994, X1 - X0, 270, K.lap);
  Rc(170, 290, 18, 400, '#3A2616'); Pf([[188, 296], [380, 296], [380, 446], [188, 446]], K.red);
  ctx.beginPath(); ctx.arc(250, 371, 64, -1.15, 1.15); ctx.strokeStyle = K.gold; ctx.lineWidth = 20; ctx.stroke();
  St([[277, 312], [277, 430]], K.m3, 8); St([[214, 371], [360, 371]], K.gold2, 12); Pf([[360, 356], [378, 371], [360, 386]], K.gold2);
  for (const [x, y, s] of [[400, 850, 0.7], [790, 960, 0.85]]) {
    Pf([[x - 150 * s, y], [x + 150 * s, y], [x + 120 * s, y + 50 * s], [x - 110 * s, y + 50 * s]], '#5A3A22'); Pf([[x + 150 * s, y], [x + 175 * s, y - 60 * s], [x + 160 * s, y]], '#5A3A22');
    Rc(x - 6, y - 220 * s, 12, 220 * s, '#3A2616'); Rc(x - 90 * s, y - 200 * s, 180 * s, 140 * s, K.m3); Rc(x - 30 * s, y - 200 * s, 30 * s, 140 * s, K.red);
  }
}), post: frameBorder });

// Kerala coast map (top-down): sea west, land east, Periyar flowing in at the old port
const kcx = (y) => 560 + 28 * Math.sin(y / 150) + (y - 700) * 0.06;
const kcxB = (y) => kcx(y) + 80 * Math.exp(-(((y - 560) / 110) ** 2));
const RIV = [[1000, 300], [910, 350], [840, 322], [770, 400], [700, 470], [640, 520], [kcx(560) - 10, 560]];
const RIVB = [[1000, 300], [910, 350], [840, 322], [770, 400], [712, 470], [700, 560], [716, 700], [692, 850], [694, 960]];
const MUZ = [610, 612], KOC = [664, 1092];
function landFill(cx) {
  const pts = [[X1 + 40, Y0 - 40]]; for (let y = Y0 - 40; y <= Y1 + 40; y += 20) pts.push([cx(y), y]); pts.push([X1 + 40, Y1 + 40]); Pf(pts, K.grn);
  for (let k = 0; k < 16; k++) { const y = 180 + k * 70, x = cx(y) + 90 + rnd(k * 3.3) * 200; El(x, y, 48 + rnd(k) * 30, 26, K.grn2); }
  Rc(905, Y0, 70, Y1 - Y0, K.vine); for (let k = 0; k < 9; k++) El(905, 200 + k * 125, 40, 52, K.vine);
}
const Lker = (v) => layer('bKer' + v, { draw: panel(K.lap2, () => {
  Rc(X0, Y0, 160, Y1 - Y0, K.lap);
  if (v === 'B') {
    landFill(kcxB);
    St(RIVB, K.lap2, 40); St([[694, 1060], [684, 1150], [694, 1260]], K.lap2, 30);
    Pf([[kcxB(930) - 20, 930], [700, 940], [736, 1000], [700, 1062], [kcxB(1070) - 20, 1070]], K.lap2); El(kcxB(1000) + 20, 1000, 34, 22, LAND);
    El(640, 560, 90, 60, K.mud); El(700, 690, 60, 90, K.mud2); El(760, 430, 70, 46, K.mud);
    Rc(MUZ[0] - 22, MUZ[1] - 22, 44, 44, K.mortar);
  } else {
    landFill(kcx);
    St([[700, 640], [688, 780], [702, 920], [684, 1100], [694, 1260]], K.lap2, 30);
    if (v === 'M') {
      St(RIV, K.mud, 300); St([[700, 600], [690, 780], [702, 920], [684, 1000]], K.mud, 200);
      for (let k = 0; k < RIV.length; k++) El(RIV[k][0] + (rnd(k) - 0.5) * 60, RIV[k][1] + 80, 120, 90, K.mud);
      El(kcx(560) - 60, 572, 110, 76, K.mud2); St(RIV, K.mud2, 56);
    } else { St(RIV, K.lap2, 40); Rc(MUZ[0] - 22, MUZ[1] - 22, 44, 44, K.red); Rc(MUZ[0] - 11, MUZ[1] - 11, 22, 22, K.gold); }
  }
}), post: frameBorder });
const LmudF = () => layer('bMudF', { draw: panel(K.mud, () => {
  for (let k = 0; k < 9; k++) { ctx.beginPath(); for (let x = X0; x <= X1; x += 20) ctx.lineTo(x, 200 + k * 125 + Math.sin(x / 90 + k) * 30); ctx.strokeStyle = K.mud2; ctx.lineWidth = 26; ctx.stroke(); }
}), post: frameBorder });

// ───────────── shots ─────────────
export function buildB(add, cue) {
  const t5 = L(5), t10 = L(10);
  const tb2 = Wd('voyage', 5) - 0.07, tb3 = Wd('ship', 5) - 0.18, tb4 = Wd('worth', 5) + 0.1, tb5 = L(6) - 0.15, tb6 = Wd('was', 6) - 0.15;
  const tb7 = L(7), tb8 = Wd('marks', 7) - 0.05, tb9 = L(8), tb10 = Wd('how', 8), tb11 = L(9), tb12 = Wd('flood', 9) - 0.1;
  const tb13 = Wd('thirteen', 9) - 0.1, tb14 = Wd('reshaped', 9) - 0.08, tb15 = Wd('new', 9) - 0.1;
  const tRec = Wd('records', 5), tMuz = Wd('muziris', 5), tDr = Wd('drachmas', 5), tOne = Wd('one', 6), tMost = Wd('most', 6);
  const tMed = Wd('medieval', 7), tTem = Wd('temple', 7), tAug = Wd('augustus', 7), tPort = Wd('port', 7);
  const tQuiet = Wd('quiet', 8), tNo = Wd('no', 8), tThe = Wd('theory', 9), tKo = Wd('kochi', 9);
  const dTimes = [Wd('thirteen', 9) - 0.05, Wd('thirteen', 9) + 0.22, Wd('forty', 9), Wd('one', 9)];

  // b1 · papyrus rains down, RECORD
  add({ id: 'b1', at: t5, cam: [540, 640], zoom: 0.1, note: 'papyrus sheet rains down tile by tile, abstract dash rows; RECORD', draw(lt, d, t) {
    const A = Lpap(false), B = Lpap(true), O = memo('bOpap', () => mkOrder(diff(A, B), (c) => ((c / B.cols) | 0) + rnd(c * 3.1) * 5));
    ctx.drawImage(A.cv, 0, 0); assemble(B, O, seg(t, t5 + 0.02, tRec + 0.1) * 1.13, 0.13, 0, 0, 'rain');
    if (t > tRec - 0.2) { const ink = cellsOf(B, [INK]), row = 13 + Math.floor(((t - tRec + 0.2) * 9) % 40); ctx.fillStyle = 'rgba(243,207,107,0.75)';
      for (const c of ink) { const j = (c / B.cols) | 0; if (j === row || j === row - 2) ctx.fillRect((c % B.cols) * TS + 1.5, j * TS + 1.5, TS - 3, TS - 3); } }
    tablet('RECORD', 540, 205, seg(t, tRec, tRec + 0.45), 42);
  } });
  for (let k = 0; k < 6; k++) cue(t5 + 0.1 + k * 0.22, 'tock', { gain: 0.25 });
  cue(tRec + 0.25, 'thud', { gain: 0.5 });

  // b2 · mosaic route map
  add({ id: 'b2', at: tb2, cam: [760, 860], zoom: 0.14, note: 'mosaic map Egypt to Malabar: gold route tiles lay themselves, monsoon rows flow, MUZIRIS', draw(lt, d, t) {
    const M = Lmap(); ctx.drawImage(M.cv, 0, 0);
    const sea = cellsOf(M, [K.lap2]); ripple(M, sea, t);
    ctx.fillStyle = 'rgba(160,205,240,0.85)';
    for (const c of sea) { const i = c % M.cols, j = (c / M.cols) | 0; if (j % 6 === 2 && i > 10 && (((i - j * 0.5 - t * 9) % 10) + 10) % 10 < 3) ctx.fillRect(i * TS + 2, j * TS + 2, TS - 4, TS - 4); }
    const RT = routeCells(), k = seg(t, tb2 + 0.02, tMuz + 0.05) * RT.length;
    for (let q = 0; q < Math.min(RT.length, Math.ceil(k)); q++) { const c = RT[q], [x, y] = cellXY(M, c), u = clamp(k - q), e = eob(clamp(u / 1)); tileAt(q % 3 ? K.gold : K.gold2, x, y - (1 - e) * 30, TS, (rnd(c) - 0.5) * 0.2, e * 1.05, e * 1.05); }
    for (const [x, y] of [MAPC.ber, MAPC.muz]) { tileAt(K.red, x - 11, y - 11, TS); tileAt(K.red, x + 11, y - 11, TS); tileAt(K.red, x - 11, y + 11, TS); tileAt(K.red, x + 11, y + 11, TS); }
    const pm = seg(t, tMuz, tMuz + 0.6); if (pm > 0) { for (let a = 0; a < 16; a++) { const r = 30 + pm * 90, an = a / 16 * 6.283; tileAt(K.gold2, MAPC.muz[0] + Math.cos(an) * r, MAPC.muz[1] + Math.sin(an) * r, 16, an, 1, 1, 1 - pm); } tileAt(K.gold2, MAPC.muz[0], MAPC.muz[1], 26, Math.sin(t * 6) * 0.2); }
    tablet('EGYPT', 205, 255, seg(t, tb2, tb2 + 0.4), 28); tablet('MUZIRIS', 735, 1075, seg(t, tMuz, tMuz + 0.4), 32);
  } });
  cue(tb2 + 0.05, 'zip', { gain: 0.4 }); cue(tMuz + 0.05, 'bell', { gain: 0.45 });

  // b3 · the ship sails back
  add({ id: 'b3', at: tb3, cam: [480, 680], zoom: 0.1, note: 'Roman merchant ship sails back west over a rippling tile sea', draw(lt, d, t) {
    const S = Lsea(), sh = Lship(); ctx.drawImage(S.cv, 0, 0);
    glint(S, cellsOf(S, [K.gold, K.gold2]), 20 + lt * 30, 4, t);
    const u = lt / d, x = lerp(840, 380, u), y = 712 - 340 + Math.sin(t * 3.2) * 6;
    for (let k = 0; k < 16; k++) { const wx = x + 250 + k * 24 + (t * 40) % 24, a = (1 - k / 16) * 0.9; tileAt(K.crest, wx, 716 + Math.sin(k * 1.3 + t * 5) * 4, 14, k * 0.3, 1, 1, a); }
    ctx.save(); ctx.translate(x, y + 200); ctx.rotate(Math.sin(t * 2.4) * 0.025); ctx.drawImage(sh.cv, -288, -200); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(X0, 724, X1 - X0, 100); ctx.clip(); ctx.drawImage(S.cv, 0, 0); ctx.restore();
    ripple(S, cellsOf(S, [K.lap2, K.lap, '#3577C0', '#2A63A6']), t);
  } });
  cue(tb3 + 0.05, 'whoosh', { gain: 0.45 });

  // b4 · cargo assembles, coins pile up
  add({ id: 'b4', at: tb4, cam: [540, 980], zoom: 0.08, note: 'hold assembles: amphorae, ivory tusks, sacks; gold coin discs rain and pile up, glint', draw(lt, d, t) {
    const E = LholdE(), F = Lhold(), O = memo('bOhold', () => mkOrder(diff(E, F), (c) => { const [x, y] = cellXY(F, c); return Math.hypot(x - 540, y - 600) + rnd(c * 1.9) * 140; }));
    ctx.drawImage(E.cv, 0, 0); assemble(F, O, seg(lt, 0, 0.65) * 1.15, 0.15, 0, 0, 'scatter', 540, 600);
    drawCoins(t, tb4 + 0.35, t > tDr ? lerp(200, 1500, seg(t, tDr, tDr + 0.7)) : null);
  } });
  cue(tb4 + 0.05, 'tock', { gain: 0.3 }); for (let k = 0; k < 8; k++) cue(tb4 + 0.4 + k * 0.16, 'pop', { gain: 0.18 }); cue(tDr, 'sparkle', { gain: 0.45 });

  // b5 · ONE STUDY: pepper takes over the cargo
  add({ id: 'b5', at: tb5, cam: [540, 760], zoom: 0.1, note: 'ONE STUDY: pepper berries flip over the ivory and sacks, vines climb the amphorae', draw(lt, d, t) {
    const F = Lhold(), P = LholdP(), O = memo('bOpep', () => mkOrder(diff(F, P), (c) => { const [x, y] = cellXY(P, c); return Math.hypot(x - 540, y - 880) + rnd(c * 2.7) * 150; }));
    flipCells(F, P, O, seg(t, tMost - 0.05, tb6 - 0.05) * 1.15, 0.15, 'flip');
    drawCoins(t, -100, null);
    tablet('ONE STUDY', 540, 205, seg(t, tOne, tOne + 0.45), 40);
  } });
  cue(tOne + 0.2, 'thud', { gain: 0.45 }); cue(tMost, 'slide', { gain: 0.4 }); cue(tMost + 0.4, 'bubbles', { gain: 0.25 });

  // b6 · pepper vine close-up, berries ripen
  const holdPC = () => compose('bHoldPC', () => { ctx.drawImage(LholdP().cv, 0, 0); drawCoins(1e6, -100, null); });
  add({ id: 'b6', at: tb6, cam: [560, 700], zoom: 0.12, note: 'tiles turn over to a pepper vine; berry spikes ripen green to black', draw(lt, d, t) {
    const G = Lvine(false), Bk = Lvine(true);
    const O = memo('bOrip', () => mkOrder(diff(G, Bk), (c) => { const j = (c / G.cols) | 0; let k = 0; for (const [i0, j0] of VSP) if (Math.abs((c % G.cols) - i0) < 3 && j >= j0) k = j - j0; return k + rnd(c) * 2; }));
    const pf = seg(lt, 0, 0.5);
    if (pf < 1) { flipFrame(holdPC(), G.cv, pf); }
    else {
      flipCells(G, Bk, O, seg(t, tb6 + 0.45, tb7 - 0.15) * 1.2, 0.2, 'flip');
      ripple(G, cellsOf(G, [K.grn, K.grn2]), t, { hi: 'rgba(200,230,150,0.35)', lo: 'rgba(20,40,10,0.25)', sp: 0.6 });
    }
    tablet('ONE STUDY', 250, 205, 1, 28);
  } });
  cue(tb6, 'whoosh', { gain: 0.35 }); for (let k = 0; k < 5; k++) cue(tb6 + 0.55 + k * 0.2, 'pop', { gain: 0.15 });

  // b7 · Peutinger strip truck
  add({ id: 'b7', at: tb7, cam: [540, 700], zoom: 0.06, note: 'MEDIEVAL COPY: camera trucks along a long strip map whose tile columns assemble at the leading edge', draw(lt, d, t) {
    const D = LdarkP(), S = Lstrip(); ctx.drawImage(D.cv, 0, 0);
    const u = lt / d, ox = X0 - 2240 * (u * 0.4 + eio(u) * 0.6), oy = 380;
    const O = memo('bOstrip', () => { const a = []; for (let c = 0; c < S.n; c++) a.push(c); return mkOrder(a, (c) => (c % S.cols) + rnd(c * 1.3) * 2.5); });
    ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, X1 - X0, Y1 - Y0); ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(X0, oy + 14, X1 - X0, SH);
    assemble(S, O, (X1 - 40 - ox) / SW, 0.03, ox, oy, 'rain');
    ripple(S, cellsOf(S, [PSEA]), t, { ox, oy, xmin: X0 - 20, xmax: Math.min(X1, X1 - 140) });
    ctx.restore();
    tablet('MEDIEVAL COPY', 540, 250, seg(t, tMed, tMed + 0.45), 44);
  } });
  cue(tb7, 'whoosh', { gain: 0.4 }); cue(tMed + 0.25, 'thud', { gain: 0.5 }); for (let k = 0; k < 6; k++) cue(tb7 + 0.3 + k * 0.38, 'tock', { gain: 0.15 });

  // b8 · temple of Augustus near the port
  add({ id: 'b8', at: tb8, cam: [660, 820], zoom: 0.14, note: 'temple icon assembles beside a little port bay; TEMPLE OF AUGUSTUS; glint; boat bobs in', draw(lt, d, t) {
    const E = Ltemple(false), F = Ltemple(true), O = memo('bOtem', () => mkOrder(diff(E, F), (c) => { const [x, y] = cellXY(F, c); return Math.hypot(x - 540, y - 600) + rnd(c * 1.1) * 90; }));
    ctx.drawImage(E.cv, 0, 0); assemble(F, O, seg(lt, 0, 0.7) * 1.15, 0.15, 0, 0, 'scatter', 540, 600);
    ripple(F, cellsOf(F, [K.lap2]), t);
    if (lt > 0.75) glint(F, cellsOf(F, [K.gold, K.gold2]), lerp(-10, 80, seg(t, tAug - 0.1, tAug + 0.7)), 5, t, 0.06);
    const sh = Lship(), bx = lerp(1000, 800, eo(seg(t, tb8 + 0.6, tPort + 0.4))), by = 1010 + Math.sin(t * 3) * 5;
    ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, X1 - X0, Y1 - Y0); ctx.clip(); ctx.translate(bx, by); ctx.rotate(Math.sin(t * 2.2) * 0.04); ctx.scale(0.4, 0.4); ctx.drawImage(sh.cv, -288, -340); ctx.restore();
    tablet('TEMPLE OF AUGUSTUS', 540, 215, seg(t, tTem, tTem + 0.45), 44);
  } });
  cue(tb8 + 0.05, 'tock', { gain: 0.3 }); cue(tTem + 0.25, 'thud', { gain: 0.5 }); cue(tAug, 'sparkle', { gain: 0.4 });

  // b9 · the records go quiet
  add({ id: 'b9', at: tb9, cam: [540, 720], zoom: 0.07, note: 'the papyrus dash rows pop out and fall away, bare mortar bed shows', draw(lt, d, t) {
    const A = Lpap(false), B = Lpap(true);
    const O = memo('bOquiet', () => { const ink = new Set(cellsOf(B, [INK])); return mkOrder(diff(A, B), (c) => (ink.has(c) ? 0 : 0.55) + rnd(c * 4.3) * 0.5 + ((c / B.cols) | 0) * 0.004); });
    ctx.drawImage(B.cv, 0, 0); holes(B, O, lerp(0, 0.78, seg(lt, 0.1, d) * 0.6 + eo(seg(lt, 0.1, d)) * 0.4), 0.09);
  } });
  cue(tb9 + 0.3, 'tock', { gain: 0.2 }); cue(tb9 + 0.6, 'tock', { gain: 0.15 }); cue(tQuiet + 0.1, 'tock', { gain: 0.1 });

  // b10 · how Muziris faded: holes everywhere
  const portO = () => memo('bOport', () => { const P = Lport(), a = []; for (let c = 0; c < P.n; c++) if (inner(P, c)) a.push(c);
    return mkOrder(a, (c) => { const i = c % P.cols, j = (c / P.cols) | 0; return 0.5 + 0.22 * Math.sin(i * 0.33 + j * 0.2) + 0.22 * Math.sin(j * 0.27 - i * 0.18 + 1.3) + 0.18 * Math.sin(i * 0.9 + j * 0.7) + rnd(c * 0.9) * 0.3; }); });
  const portEnd = 0.58;
  add({ id: 'b10', at: tb10, cam: [540, 620], zoom: 0.08, note: 'harbour (warehouses, ships, Chera bow banner) loses clusters of tiles; UNCERTAIN', draw(lt, d, t) {
    const P = Lport(); ctx.drawImage(P.cv, 0, 0);
    holes(P, portO(), portEnd * (0.5 * seg(lt, 0, d) + 0.5 * eo(seg(lt, 0, d))), 0.06);
    tablet('UNCERTAIN', 540, 600, seg(t, tNo, tNo + 0.45), 54);
  } });
  cue(tb10 + 0.05, 'rumble', { gain: 0.25 }); cue(tNo + 0.25, 'thud', { gain: 0.5 });

  // b11 · coast map, THEORY
  const portEndCv = () => compose('bPortEnd', () => { const P = Lport(), O = portO(); ctx.drawImage(P.cv, 0, 0); clipDraw(O, 0, lower(O, portEnd), MORTAR(), TS, P.cols); });
  add({ id: 'b11', at: tb11, cam: [620, 600], zoom: 0.1, note: 'tiles turn over to a top-down coast map: Periyar river, Muziris marker; THEORY', draw(lt, d, t) {
    const A = Lker('A'), pf = seg(lt, 0, 0.6);
    if (pf < 1) flipFrame(portEndCv(), A.cv, pf);
    else {
      ctx.drawImage(A.cv, 0, 0); ripple(A, cellsOf(A, [K.lap2, K.lap]), t);
      tileAt(Math.sin(t * 7) > 0 ? K.gold2 : K.gold, MUZ[0], MUZ[1], 26, Math.sin(t * 3) * 0.2);
    }
    tablet('MUZIRIS', 790, 690, seg(lt, 0.6, 1.0), 30);
    tablet('THEORY', 540, 215, seg(t, tThe, tThe + 0.45), 44);
  } });
  cue(tb11, 'whoosh', { gain: 0.4 }); cue(tThe + 0.25, 'thud', { gain: 0.5 });

  // b12 · flood: mud swamp
  add({ id: 'b12', at: tb12, cam: [700, 560], zoom: 0.16, note: 'MUD SWAMP: ochre flood tiles spread out from the river over land and port', draw(lt, d, t) {
    const A = Lker('A'), M = Lker('M');
    const O = memo('bOmud', () => mkOrder(diff(A, M), (c) => { const [x, y] = cellXY(M, c); return distPoly(x, y, RIV) + rnd(c * 2.3) * 70; }));
    const p = seg(t, tb12 + 0.05, tb13 - 0.15) * 1.15;
    flipCells(A, M, O, p, 0.12, 'grow');
    ripple(A, cellsOf(A, [K.lap]), t);
    const a = lower(O, p - 0.12), mc = []; for (let q = 0; q < a; q++) mc.push(O.idx[q]);
    ripple(M, mc, t * 1.4, { hi: 'rgba(214,180,120,0.5)', lo: 'rgba(60,40,15,0.3)' });
    tablet('THEORY', 540, 215, 1, 44);
  } });
  cue(tb12, 'rumble', { gain: 0.6 }); cue(tb12 + 0.5, 'bubbles', { gain: 0.35 });

  // b13 · 1341 in mosaic digits
  add({ id: 'b13', at: tb13, cam: [540, 680], zoom: 0.1, note: 'mosaic digits 1341 assemble in gold over a rippling mud field', draw(lt, d, t) {
    const M = LmudF(); ctx.drawImage(M.cv, 0, 0);
    ripple(M, cellsOf(M, [K.mud, K.mud2]), t, { hi: 'rgba(214,180,120,0.45)', lo: 'rgba(60,40,15,0.3)', sp: 0.8 });
    mosaicNum('1341', 540, 700, 36, dTimes, t, t > dTimes[3] + 0.4 ? lerp(300, 1400, seg(t, dTimes[3] + 0.4, dTimes[3] + 1.1)) : null);
    tablet('THEORY', 540, 215, 1, 44);
  } });
  dTimes.forEach((tt) => cue(tt + 0.25, 'tock', { gain: 0.45 })); cue(dTimes[3] + 0.4, 'sparkle', { gain: 0.3 });

  // b14 · the coast reshapes
  add({ id: 'b14', at: tb14, cam: [640, 760], zoom: 0.1, note: 'coastline reshapes: tiles flip north to south, old mouth silts up, a new inlet opens', draw(lt, d, t) {
    const M = Lker('M'), B = Lker('B');
    const O = memo('bOcoast', () => mkOrder(diff(M, B), (c) => ((c / B.cols) | 0) + rnd(c * 1.7) * 5));
    flipCells(M, B, O, seg(t, tb14 + 0.05, tb15 - 0.1) * 1.15, 0.15, 'flip');
    ripple(B, cellsOf(B, [K.lap]), t);
    tablet('THEORY', 540, 215, 1, 44);
  } });
  cue(tb14 + 0.05, 'slide', { gain: 0.45 });

  // b15 · Kochi lights up
  add({ id: 'b15', at: tb15, cam: [664, 1000], zoom: 0.18, note: 'KOCHI dot lights up with expanding tile rings, ship sails into the new harbour; THEORY', draw(lt, d, t) {
    const B = Lker('B'); ctx.drawImage(B.cv, 0, 0); ripple(B, cellsOf(B, [K.lap2, K.lap]), t);
    const sh = Lship(), sx = lerp(260, 560, eio(seg(lt, 0, d))), sy = 1000 + Math.sin(t * 3) * 4;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.sin(t * 2.2) * 0.04); ctx.scale(-0.32, 0.32); ctx.drawImage(sh.cv, -288, -340); ctx.restore();
    const on = seg(t, tKo - 0.35, tKo + 0.1);
    if (on > 0) {
      for (let r = 0; r < 3; r++) { const ph = ((t - tKo + 0.35) * 0.9 + r / 3) % 1, rad = 30 + ph * 160; for (let a = 0; a < 20; a++) { const an = a / 20 * 6.283 + r; tileAt(K.gold2, KOC[0] + Math.cos(an) * rad, KOC[1] + Math.sin(an) * rad, 16, an, 1, 1, (1 - ph) * on); } }
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) tileAt(a || b ? K.gold : K.gold2, KOC[0] + a * 22, KOC[1] + b * 22, 22, 0, eob(on), eob(on));
      if (rnd(Math.floor(t * 8)) < 0.5) tileAt('#FFF6D2', KOC[0], KOC[1], 22, 0, 1, 1, 0.8);
    }
    tablet('KOCHI', 820, 1170, seg(t, tKo, tKo + 0.4), 38);
    tablet('THEORY', 540, 215, 1, 44);
  } });
  cue(tb15 + 0.1, 'swell', { gain: 0.3 }); cue(tKo, 'bell', { gain: 0.5 }); cue(tKo + 0.2, 'sparkle', { gain: 0.35 });
  void t10;
}
