// EPISODE 10 · worker B : "Raking-Light Stone Relief", lines 5-9 (Kanchi held, north lost, Narasimhavarman, 642, Vatapi taken, VATAPIKONDA)
//   b1  granite slab drops with a thud: Kanchi's crenellated walls + three early Pallava shrines (hut roof, tiered vimana, wagon
//       vault) in relief under a sweeping low sun; "KANCHI" chip-carved on the wall; the gate doors swing shut on "held"; MOST ACCOUNTS
//   b2  relief map of the south: granite Pallava land, sandstone Deccan; on "northern lands" the north strip flattens, turns to
//       red sandstone, lichen + blowing sand (erosion); camera tilts from Kanchi up to the lost north
//   b3  chisel chip reveal, top-down: tall-crowned faceless granite king (Narasimhavarman), ghost outline first; ILLUSTRATION
//   b4  the king glides up onto a lion-armed throne dais, lion banner rises behind; raking light; c. 630 plaque
//   b5  "642" chip-carved huge into granite, a carved sun disc rises behind it; AROUND
//   b6  FRIEZE TRACK: camera trucks along a two-register carved procession - granite soldiers, banner bearers, war elephants
//       marching left past lotus pillars; ACCOUNTS SAY
//   b7  SLAB SLIDE clash: granite lion-banner slab slams into the sandstone boar-banner slab (Pulakeshin) and shoves it away; NEAR KANCHI
//   b8  relief map again: the carved route channel fills with fire-orange from Kanchi north-west to Vatapi, lion token at its head
//   b9  sunset on sandstone: Pulakeshin relief with boar banner; on "died" the banner falls and the crown topples (no gore),
//       the figure weathers; BELIEVED
//   b10 night: Vatapi in red sandstone under a carved moon, Badami cliffs with cave mouths; a granite lion banner drops onto the
//       gate tower on "taken"
//   b11 FIRE LIGHT ON STONE: the city lit orange from below, carved flames along walls and roofs, sparks and smoke; ACCOUNTS SAY
//   b12 the king raises his sword under an empty carved cartouche; camera tilts up, a chisel arrives
//   b13 "VATAPI / KONDA" chip-carved into the cartouche, then "the one who took Vatapi" note; light sweep; TITLE
import { ctx, setCtx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, lg, smoke } from './art.js';

const GR = { tex: 'g', base: '#8C8A85', lt: '#C9C5BC', dk: '#3F3D3A', sh: '#141311' };
const SS = { tex: 's', base: '#A4553A', lt: '#D88A62', dk: '#5A2A1C', sh: '#1C0B05' };
const FIRE = '#FF8A2A', FIRE2 = '#FFD27A';

// ───────────── offscreen helpers ─────────────
function mk(w, h, q, fn) {
  const c = document.createElement('canvas'); c.width = Math.ceil(w * q); c.height = Math.ceil(h * q);
  const prev = ctx, cx = c.getContext('2d'); setCtx(cx); cx.save(); cx.scale(q, q); fn(); cx.restore(); setCtx(prev); c._q = q; return c;
}
function texTile(kind) {
  return cached('b:tex:' + kind, 512, 512, 1, () => {
    const id = ctx.createImageData(512, 512), D = id.data; let s = kind === 'g' ? 91357 : 4417;
    const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const base = kind === 'g' ? [140, 138, 133] : [164, 85, 58];
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
      const i = (y * 512 + x) * 4, u = x / 512 * TAU, v = y / 512 * TAU;
      let n = (R() - 0.5) * 16 + Math.sin(u * 2 + Math.sin(v * 3) * 1.3) * 5 + Math.sin(v * 5 + u) * 4 + Math.sin(u * 7 + v * 4) * 2.5;
      let r = base[0] + n, g = base[1] + n, b = base[2] + n;
      if (kind === 's') {
        const bed = Math.sin(v * 14 + Math.sin(u * 2) * 0.8 + Math.sin(u * 5) * 0.2), bed2 = Math.sin(v * 37 + Math.sin(u * 3) * 1.2);
        r += bed * 10 + bed2 * 4; g += bed * 6 + bed2 * 2.5; b += bed * 4 + bed2 * 2;
      }
      D[i] = r; D[i + 1] = g; D[i + 2] = b; D[i + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);
    if (kind === 'g') for (let k = 0; k < 1700; k++) {   // mica + feldspar grains
      const x = R() * 512, y = R() * 512, z = R(), sz = 1 + R() * 2.4;
      ctx.fillStyle = z < 0.5 ? 'rgba(30,29,27,0.6)' : z < 0.62 ? 'rgba(236,233,226,0.45)' : 'rgba(100,98,94,0.5)';
      ctx.fillRect(x, y, sz, sz * (0.6 + R() * 0.8));
    } else for (let k = 0; k < 900; k++) {
      const x = R() * 512, y = R() * 512, z = R();
      ctx.fillStyle = z < 0.5 ? 'rgba(70,28,14,0.35)' : 'rgba(236,170,128,0.35)'; ctx.fillRect(x, y, 1 + R() * 2, 1);
    }
  });
}
const PC = new WeakMap();
function pat(kind) { let m = PC.get(ctx); if (!m) PC.set(ctx, (m = {})); return m[kind] || (m[kind] = ctx.createPattern(texTile(kind), 'repeat')); }

// ───────────── shape primitives (use whatever fill/stroke style is current) ─────────────
const F = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); };
const E = (x, y, rx, ry, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fill(); };
const Lb = (x1, y1, x2, y2, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
const R_ = (x, y, w, h) => ctx.fillRect(x, y, w, h);
const cut = (fn) => { const g = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'destination-out'; fn(); ctx.globalCompositeOperation = g; };
/** a carved groove: dark cut + a lit far wall */
function groove(st, lx, ly, w, fn) {
  ctx.save(); ctx.lineCap = ctx.lineJoin = 'round';
  ctx.strokeStyle = st.sh; ctx.globalAlpha = 0.55; ctx.lineWidth = w; ctx.beginPath(); fn(); ctx.stroke();
  ctx.translate(-lx * w * 0.55, -ly * w * 0.55); ctx.strokeStyle = st.lt; ctx.globalAlpha = 0.45; ctx.lineWidth = w * 0.45; ctx.beginPath(); fn(); ctx.stroke();
  ctx.restore();
}
/** a sunk (incised) filled shape inside a face */
function sunkShape(st, lx, ly, o, fn) {
  ctx.save();
  ctx.save(); ctx.translate(-lx * o * 1.7, -ly * o * 1.7); ctx.fillStyle = ctx.strokeStyle = st.lt; ctx.globalAlpha = 0.75; fn(); ctx.restore();
  ctx.fillStyle = ctx.strokeStyle = st.sh; ctx.globalAlpha = 0.7; fn();
  ctx.save(); ctx.translate(-lx * o, -ly * o); ctx.fillStyle = ctx.strokeStyle = st.dk; ctx.globalAlpha = 0.55; fn(); ctx.restore();
  ctx.restore();
}

// ───────────── the relief renderer ─────────────
// A relief = mask -> two baked faces (lit from upper-left / upper-right, with inner bevel bands), a cast-shadow silhouette and a
// rim silhouette. Per frame: shadow copies offset away from the light, a rim copy toward it, then the faces cross-faded by k.
const RC = new Map();
function relief(key, w, h, st, shapes, o = {}) {
  let R = RC.get(key); if (R) return R;
  const q = o.q || 1, bev = o.bev || 5, sunk = !!o.sunk;
  const m = mk(w, h, q, () => { ctx.fillStyle = ctx.strokeStyle = '#000'; ctx.lineCap = ctx.lineJoin = 'round'; shapes(); });
  const tint = (col) => mk(w, h, q, () => { ctx.drawImage(m, 0, 0, w, h); ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = col; ctx.fillRect(0, 0, w, h); });
  const band = (dx, dy, col) => mk(w, h, q, () => { ctx.drawImage(m, 0, 0, w, h); ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(m, dx, dy, w, h); ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = col; ctx.fillRect(0, 0, w, h); });
  const face = (lx, ly) => mk(w, h, q, () => {
    ctx.fillStyle = pat(st.tex); ctx.fillRect(0, 0, w, h);
    if (o.tint) { ctx.fillStyle = o.tint; ctx.fillRect(0, 0, w, h); }
    if (sunk) { ctx.fillStyle = 'rgba(16,12,10,0.34)'; ctx.fillRect(0, 0, w, h); }
    ctx.fillStyle = lg(w / 2 + lx * w / 2, h / 2 + ly * h / 2, w / 2 - lx * w / 2, h / 2 - ly * h / 2, [[0, 'rgba(255,246,228,0.12)'], [1, 'rgba(0,0,0,0.16)']]); ctx.fillRect(0, 0, w, h);
    ctx.lineCap = ctx.lineJoin = 'round';
    if (o.detail) o.detail(lx, ly, st);
    const sg = sunk ? -1 : 1;
    for (const [k, a] of [[bev * 2.8, 0.3], [bev, 0.85]]) {
      ctx.globalAlpha = a; ctx.drawImage(band(-sg * lx * k, -sg * ly * k, st.lt), 0, 0, w, h);
      ctx.globalAlpha = a * 0.9; ctx.drawImage(band(sg * lx * k, sg * ly * k, st.dk), 0, 0, w, h);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(m, 0, 0, w, h);
  });
  R = { w, h, q, fa: face(-0.82, -0.57), fb: face(0.82, -0.57), sd: tint(st.sh), rm: tint(o.rim || st.lt), x: {} };
  for (const [n, [col, lx, ly, k]] of Object.entries(o.extra || {})) R.x[n] = band(-lx * k, -ly * k, col);
  RC.set(key, R); return R;
}
const LK = (k) => { const a = lerp(-162, -18, clamp(k)) * Math.PI / 180; return { k: clamp(k), lx: Math.cos(a), ly: Math.sin(a) }; };
function drawR(R, ox, oy, x, y, s, lk, o = {}) {
  const d = (o.d ?? 9) * s, a = o.a ?? 1, w = R.w * s, h = R.h * s, X = x - ox * s, Y = y - oy * s, ga = ctx.globalAlpha;
  if (o.sunk) {
    ctx.globalAlpha = ga * a * 0.75; ctx.drawImage(R.sd, X + lk.lx * 2 * s, Y + lk.ly * 2 * s, w, h);
    ctx.globalAlpha = ga * a * 0.6; ctx.drawImage(R.rm, X - lk.lx * 2.2 * s, Y - lk.ly * 2.2 * s, w, h);
  } else if (d > 0.3) {
    ctx.globalAlpha = ga * a * (o.sh ?? 0.75) * 0.6;
    ctx.drawImage(R.sd, X - lk.lx * d, Y - lk.ly * d, w, h);
    ctx.drawImage(R.sd, X - lk.lx * d * 0.5, Y - lk.ly * d * 0.5, w, h);
    const rk = Math.min(1, d / (6 * s)) * 2.4 * s;
    ctx.globalAlpha = ga * a * (o.rim ?? 0.75); ctx.drawImage(R.rm, X + lk.lx * rk, Y + lk.ly * rk, w, h);
  }
  ctx.globalAlpha = ga * a; ctx.drawImage(R.fa, X, Y, w, h);
  if (lk.k > 0.01) { ctx.globalAlpha = ga * a * lk.k; ctx.drawImage(R.fb, X, Y, w, h); }
  ctx.globalAlpha = ga;
}
/** additive coloured light on the edges of a relief that face a light source (fire / moon bands baked in R.x) */
function drawX(R, name, ox, oy, x, y, s, a) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.drawImage(R.x[name], x - ox * s, y - oy * s, R.w * s, R.h * s); ctx.restore();
}

// ───────────── stage: slabs, light, plaques, chips, dust ─────────────
function bgImg(kind) {
  return cached('b:bg:' + kind, 1240, 2120, 0.75, () => {
    const st = kind[0] === 'g' ? GR : SS;
    ctx.fillStyle = pat(st.tex); ctx.fillRect(0, 0, 1240, 2120);
    for (let i = 0; i < 46; i++) {
      const x = rnd(i * 3.7 + kind.length) * 1240, y = rnd(i * 5.3 + 2) * 2120, r = 90 + rnd(i * 1.9) * 300, lt = rnd(i * 7.1) < 0.45;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, lt ? 'rgba(255,248,235,0.07)' : 'rgba(10,6,4,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    if (st === SS) for (let i = 0; i < 9; i++) { const y = rnd(i * 9.1) * 2120, h = 30 + rnd(i * 2.3) * 90; ctx.fillStyle = lg(0, y, 0, y + h, [[0, 'rgba(60,20,8,0)'], [0.5, `rgba(60,20,8,${0.08 + rnd(i) * 0.1})`], [1, 'rgba(60,20,8,0)']]); ctx.fillRect(0, y, 1240, h); }
    if (kind.includes('f')) {   // carved panel frame (two incised lines)
      for (const [ins, w] of [[0, 7], [26, 4]]) {
        ctx.strokeStyle = st.sh; ctx.globalAlpha = 0.6; ctx.lineWidth = w; ctx.beginPath(); ctx.roundRect(110 + ins, 150 + ins, 1020 - ins * 2, 1820 - ins * 2, 10); ctx.stroke();
        ctx.strokeStyle = st.lt; ctx.globalAlpha = 0.4; ctx.lineWidth = w * 0.5; ctx.beginPath(); ctx.roundRect(110 + ins + w * 0.5, 150 + ins + w * 0.5, 1020 - ins * 2, 1820 - ins * 2, 10); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  });
}
const bg = (kind, a = 1) => blit(bgImg(kind), 0, 0, -80, -100, 1, a);
const fillAll = (c) => { ctx.fillStyle = c; ctx.fillRect(-300, -300, W + 600, H + 600); };
const vigImg = () => cached('b:vig', 540, 960, 0.5, () => { const g = ctx.createRadialGradient(270, 430, 180, 270, 480, 640); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.62)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 540, 960); });
const vignette = (a = 1) => blit(vigImg(), 0, 0, -30, -30, (W + 60) / 540, a, (H + 60) / 960);
/** the raking light: darken away from the sun, a warm beam band slides with the light angle */
function rake(lk, o = {}) {
  const R = 1300, cx = 540, cy = 860; ctx.save();
  ctx.fillStyle = lg(cx + lk.lx * R, cy + lk.ly * R, cx - lk.lx * R, cy - lk.ly * R, [[0, 'rgba(0,0,0,0)'], [0.5, 'rgba(0,0,0,0.14)'], [1, `rgba(5,4,3,${(o.dark ?? 0.5) * 1.2})`]]);
  ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = lg(cx + lk.lx * R, cy + lk.ly * R, cx, cy, [[0, `rgba(${o.col ?? '255,200,140'},${o.warm ?? 0.5})`], [1, 'rgba(255,200,140,0)']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.globalCompositeOperation = 'lighter'; ctx.translate(cx, cy); ctx.rotate(o.tilt ?? 0.32);
  const bx = lerp(-900, 900, lk.k) + (o.bo || 0), bw = o.bw ?? 380, col = o.col ?? '255,214,160';
  ctx.fillStyle = lg(bx - bw, 0, bx + bw, 0, [[0, `rgba(${col},0)`], [0.5, `rgba(${col},${o.beam ?? 0.13})`], [1, `rgba(${col},0)`]]);
  ctx.fillRect(bx - bw, -1600, bw * 2, 3200);
  ctx.restore();
}
/** a raised horizontal band (plinth / moulding) drawn live */
function band(y, h, lk, st, x0 = -200, x1 = W + 200) {
  ctx.save();
  ctx.globalAlpha = 0.5; ctx.fillStyle = st.sh; ctx.fillRect(x0 - lk.lx * 8, y - lk.ly * 8, x1 - x0, h);
  ctx.globalAlpha = 0.8; ctx.fillStyle = st.lt; ctx.fillRect(x0 + lk.lx * 2, y + lk.ly * 2, x1 - x0, h);
  ctx.globalAlpha = 1; ctx.fillStyle = pat(st.tex); ctx.fillRect(x0, y, x1 - x0, h);
  ctx.fillStyle = 'rgba(255,240,220,0.12)'; ctx.fillRect(x0, y, x1 - x0, 4); ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x0, y + h - 5, x1 - x0, 5);
  ctx.restore();
}
function carveTxt(txt, x, y, size, st, lk, a = 1, font = '900 ', fam = 'Inter', ls = 2) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.font = `${font}${size}px ${fam}`; ctx.letterSpacing = ls + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const o = Math.max(1.3, size * 0.04);
  ctx.save(); ctx.globalAlpha *= 0.85; ctx.fillStyle = st.lt; ctx.fillText(txt, x - lk.lx * o * 1.7, y - lk.ly * o * 1.7); ctx.restore();
  ctx.fillStyle = st.sh; ctx.fillText(txt, x, y);
  ctx.fillStyle = st.dk; ctx.fillText(txt, x - lk.lx * o, y - lk.ly * o);
  ctx.restore();
}
function plaqueImg(txt) {
  ctx.save(); ctx.font = '900 30px Inter'; ctx.letterSpacing = '4px'; const tw = ctx.measureText(txt).width; ctx.restore();
  const w = Math.ceil(tw + 108), h = 64, P = 14;
  return cached('b:pl:' + txt, w + P * 2, h + P * 2, 2, () => {
    ctx.translate(P, P);
    ctx.fillStyle = 'rgba(8,6,4,0.55)'; ctx.beginPath(); ctx.roundRect(5, 8, w, h, 8); ctx.fill();
    ctx.fillStyle = lg(0, 0, w * 0.3, h * 1.7, [[0, '#E6C674'], [0.45, '#B48A40'], [1, '#6A4E20']]); ctx.beginPath(); ctx.roundRect(0, 0, w, h, 8); ctx.fill();
    for (let i = 0; i < 160; i++) { ctx.fillStyle = i % 3 ? 'rgba(60,40,10,0.18)' : 'rgba(255,236,170,0.22)'; ctx.fillRect(rnd(i * 3.3) * w, rnd(i * 5.1) * h, 2, 1.5); }
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,238,175,0.8)'; ctx.beginPath(); ctx.moveTo(4, h - 6); ctx.lineTo(4, 4); ctx.lineTo(w - 6, 4); ctx.stroke();
    ctx.strokeStyle = 'rgba(48,30,8,0.75)'; ctx.beginPath(); ctx.moveTo(w - 4, 6); ctx.lineTo(w - 4, h - 4); ctx.lineTo(6, h - 4); ctx.stroke();
    ctx.strokeStyle = 'rgba(60,40,10,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(38, 10, w - 76, h - 20, 4); ctx.stroke();
    ctx.font = '900 30px Inter'; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,234,165,0.8)'; ctx.fillText(txt, w / 2 + 1.5, h / 2 + 3.5);
    ctx.fillStyle = '#35230A'; ctx.fillText(txt, w / 2, h / 2 + 1.5);
    for (const rx of [19, w - 19]) {
      const g = ctx.createRadialGradient(rx - 2, h / 2 - 3, 1, rx, h / 2, 9); g.addColorStop(0, '#FFF0B8'); g.addColorStop(0.5, '#B08A3E'); g.addColorStop(1, '#4A3410');
      ctx.fillStyle = 'rgba(30,20,5,0.6)'; ctx.beginPath(); ctx.arc(rx + 1.5, h / 2 + 2, 9, 0, TAU); ctx.fill();
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(rx, h / 2, 8.5, 0, TAU); ctx.fill();
    }
  });
}
/** bronze plaque pops in (p 0..1) with a little drop + tilt, then hangs with a slow sheen */
function plaque(txt, x, y, p, rot = -0.05, sc = 1) {
  if (p <= 0) return; const img = plaqueImg(txt), e = eo(clamp(p)), s = sc * lerp(1.4, 1, eob(clamp(p)));
  ctx.save(); ctx.translate(x, y - (1 - e) * 50); ctx.rotate(rot * (1 - e) + 0.012);
  blit(img, img.width / img._q / 2, img.height / img._q / 2, 0, 0, s, clamp(p * 5));
  ctx.restore();
}
/** stone chips flying off a moving chisel point; src(ts) gives the point at spawn time */
function chips(lt, t0, t1, n, seed, src, cols) {
  for (let i = 0; i < n; i++) {
    const ts = lerp(t0, t1, (i + rnd(seed + i)) / n), age = lt - ts; if (age < 0 || age > 0.7) continue;
    const [x0, y0] = src(ts), vx = (rnd(seed + i * 3.1) - 0.3) * 760, vy = -220 - rnd(seed + i * 7.3) * 620;
    const x = x0 + vx * age, y = y0 + vy * age + 1700 * age * age, r = 2.5 + rnd(seed + i * 1.9) * 6.5;
    ctx.save(); ctx.globalAlpha *= 1 - age / 0.7; ctx.translate(x, y); ctx.rotate(age * (6 + rnd(i) * 12)); ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath(); ctx.moveTo(-r, -r * 0.6); ctx.lineTo(r * 0.8, -r * 0.8); ctx.lineTo(r, r * 0.5); ctx.lineTo(-r * 0.5, r); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}
function puff(x, y, age, sz = 1, col = '196,188,176', n = 6, seed = 0, dur = 1.1) {
  if (age < 0 || age > dur) return; const p = age / dur, e = eo(p);
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i + 0.5) / n * Math.PI + (rnd(seed + i) - 0.5) * 0.4, R = 150 * sz * e, xx = x + Math.cos(a) * R, yy = y + Math.sin(a) * R * 0.35 - e * 20 * sz, r = (30 + 90 * e) * sz;
    const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, r); g.addColorStop(0, `rgba(${col},${0.34 * (1 - p)})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(xx - r, yy - r, 2 * r, 2 * r);
  }
}
const skirt = (x0, x1, y, age, col, sz = 1) => { for (let i = 0; i < 5; i++) puff(lerp(x0, x1, (i + 0.5) / 5), y, age - i * 0.02, sz, col, 4, i * 9); };
const shake = (age, amp) => (age < 0 || age > 0.45 ? [0, 0] : [Math.sin(age * 90) * amp * (1 - age / 0.45), Math.cos(age * 71) * amp * (1 - age / 0.45)]);
/** an iron chisel with its tip at (x, y); hit 0..1 pulls it back along its axis */
function chisel(x, y, ang = -0.75, hit = 0, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(ang); ctx.translate(hit * 16, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.save(); ctx.translate(12, 16); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(34, -9); ctx.lineTo(210, -9); ctx.lineTo(210, 9); ctx.lineTo(34, 9); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = lg(0, -10, 0, 10, [[0, '#B7BCC2'], [0.35, '#6C7177'], [1, '#26292D']]);
  ctx.beginPath(); ctx.moveTo(0, -1.5); ctx.lineTo(34, -9); ctx.lineTo(196, -9); ctx.lineTo(196, 9); ctx.lineTo(34, 9); ctx.lineTo(0, 1.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lg(0, -13, 0, 13, [[0, '#9AA0A6'], [1, '#2B2E32']]); ctx.beginPath(); ctx.roundRect(192, -13, 22, 26, 5); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(40, -7, 150, 2);
  ctx.restore();
}
/** sparks rising (additive) */
function sparks(t, n, x0, x1, yb, rise, seed = 0, a = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const sp = 0.35 + rnd(seed + i) * 0.5, ph = (t * sp + rnd(seed + i * 3.3)) % 1, x = x0 + rnd(seed + i * 5.7) * (x1 - x0) + Math.sin(t * 2 + i) * 40 * ph, y = yb - ph * rise;
    ctx.globalAlpha = a * (1 - ph) * (0.6 + 0.4 * Math.sin(t * 20 + i)); ctx.fillStyle = i % 3 ? FIRE2 : '#FFF1C8';
    ctx.beginPath(); ctx.arc(x, y, 1.6 + rnd(i * 1.7) * 2.8, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function glow(x, y, r, col, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
function motes(t, n, a = 0.5, seed = 0, col = '255,230,190') {
  for (let i = 0; i < n; i++) {
    const x = (rnd(i * 3 + seed) * 1200 + t * (10 + rnd(i) * 20)) % 1200 - 60, y = (rnd(i * 7 + seed) * 1300 + 150 - t * 8 * rnd(i + 4) + Math.sin(t * 0.7 + i) * 20);
    ctx.fillStyle = `rgba(${col},${a * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 2)))})`; ctx.beginPath(); ctx.arc(x, y, 1.4 + rnd(i + 9) * 2.4, 0, TAU); ctx.fill();
  }
}

// ───────────── figures ─────────────
// king canvas 600x1340, feet centre at (300, 1300). pose: 'sword' (planted), 'raise' (sword up), 'plain'
function kingShapes(pose, crown = true) {
  return () => {
    ctx.translate(40, 220); const cx = 260;
    if (crown) { F([[cx - 46, 252], [cx + 46, 252], [cx + 35, 150], [cx + 21, 92], [cx, 56], [cx - 21, 92], [cx - 35, 150]]); E(cx, 50, 10, 14); }
    E(cx, 300, 43, 57); E(cx - 44, 322, 8, 14); E(cx + 44, 322, 8, 14);
    F([[cx - 20, 340], [cx + 20, 340], [cx + 25, 384], [cx - 25, 384]]);
    ctx.beginPath(); ctx.moveTo(cx - 112, 394); ctx.quadraticCurveTo(cx, 370, cx + 112, 394); ctx.quadraticCurveTo(cx + 102, 480, cx + 52, 612); ctx.lineTo(cx - 52, 612); ctx.quadraticCurveTo(cx - 102, 480, cx - 112, 394); ctx.fill();
    F([[cx - 56, 600], [cx + 56, 600], [cx + 92, 700], [cx + 84, 862], [cx - 84, 862], [cx - 92, 700]]);
    Lb(cx - 34, 850, cx - 40, 1062, 40); Lb(cx + 34, 850, cx + 40, 1062, 40); E(cx - 54, 1078, 34, 14); E(cx + 54, 1078, 34, 14);
    F([[cx - 90, 700], [cx - 142, 770], [cx - 122, 806], [cx - 82, 742]]); F([[cx + 90, 700], [cx + 142, 770], [cx + 122, 806], [cx + 82, 742]]);
    Lb(cx - 104, 404, cx - 150, 560, 34); Lb(cx - 150, 560, cx - 84, 640, 30);
    if (pose === 'sword') {
      Lb(cx + 104, 404, cx + 160, 560, 34); Lb(cx + 160, 560, cx + 176, 648, 30);
      F([[cx + 150, 662], [cx + 204, 662], [cx + 204, 676], [cx + 150, 676]]); E(cx + 177, 636, 12, 12);
      F([[cx + 168, 676], [cx + 186, 676], [cx + 184, 1040], [cx + 176, 1066], [cx + 170, 1040]]);
    } else if (pose === 'raise') {
      Lb(cx + 104, 404, cx + 176, 300, 34); Lb(cx + 176, 300, cx + 196, 196, 30);
      F([[cx + 168, 180], [cx + 226, 176], [cx + 226, 190], [cx + 168, 194]]); E(cx + 197, 208, 12, 12);
      F([[cx + 188, 178], [cx + 206, 176], [cx + 236, -150], [cx + 232, -186], [cx + 218, -152]]);
    } else { Lb(cx + 104, 404, cx + 150, 560, 34); Lb(cx + 150, 560, cx + 84, 640, 30); }
  };
}
function kingDetail(pose, crown = true) {
  return (lx, ly, st) => {
    ctx.save(); ctx.translate(40, 220); const cx = 260;
    if (crown) for (const y of [228, 196, 164, 130]) { const hw = y > 150 ? lerp(35, 46, (y - 150) / 102) : lerp(21, 35, (y - 92) / 58); groove(st, lx, ly, 3.5, () => { ctx.moveTo(cx - hw + 4, y); ctx.lineTo(cx + hw - 4, y); }); }
    if (crown) for (const [x, y] of [[cx, 212], [cx - 18, 212], [cx + 18, 212], [cx, 178]]) groove(st, lx, ly, 4, () => ctx.arc(x, y, 4, 0, TAU));
    for (const r of [70, 92]) groove(st, lx, ly, 4, () => ctx.arc(cx, 330, r, 0.3 * Math.PI, 0.7 * Math.PI));
    groove(st, lx, ly, 3, () => { ctx.moveTo(cx - 84, 404); ctx.quadraticCurveTo(cx - 10, 500, cx + 48, 606); });
    for (const y of [614, 632]) groove(st, lx, ly, 4, () => { ctx.moveTo(cx - 58, y); ctx.lineTo(cx + 58, y); });
    for (const k of [-1, 0, 1]) groove(st, lx, ly, 3, () => { ctx.moveTo(cx + k * 30, 646); ctx.quadraticCurveTo(cx + k * 40, 760, cx + k * 54, 852); });
    for (const k of [-1, 1]) groove(st, lx, ly, 4, () => { ctx.moveTo(cx + k * 112, 452); ctx.lineTo(cx + k * 140, 446); });
    groove(st, lx, ly, 3, () => { ctx.moveTo(cx - 70, 862); ctx.lineTo(cx + 70, 862); });
    ctx.restore();
  };
}
const kingR = (stone, pose, crown = true) => relief(`b:king:${stone}:${pose}:${crown}`, 600, 1340, stone === 'g' ? GR : SS, kingShapes(pose, crown), { detail: kingDetail(pose, crown), bev: 5 });
const crownR = () => relief('b:crown:s', 140, 240, SS, () => { ctx.translate(70 - 260, -30); F([[214, 252], [306, 252], [295, 150], [281, 92], [260, 56], [239, 92], [225, 150]]); E(260, 50, 10, 14); },
  { bev: 4, detail: (lx, ly, st) => { ctx.save(); ctx.translate(70 - 260, -30); for (const y of [228, 196, 164, 130]) groove(st, lx, ly, 3.5, () => { ctx.moveTo(228, y); ctx.lineTo(292, y); }); ctx.restore(); } });

function lionShape(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  E(0, 0, 78, 30); E(70, -22, 44, 44);
  for (let i = 0; i < 11; i++) { const a = -2.7 + i * 0.36, c = Math.cos(a), sn = Math.sin(a); F([[70 + Math.cos(a - 0.17) * 40, -22 + Math.sin(a - 0.17) * 40], [70 + c * 62, -22 + sn * 62], [70 + Math.cos(a + 0.17) * 40, -22 + Math.sin(a + 0.17) * 40]]); }
  E(106, -12, 24, 18); F([[100, -36], [110, -54], [118, -32]]);
  ctx.lineCap = 'round'; Lb(-56, 10, -64, 64, 17); Lb(-28, 14, -18, 64, 17); Lb(40, 12, 50, 64, 17); Lb(66, 8, 98, 36, 16); Lb(98, 36, 112, 26, 14);
  ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-74, -6); ctx.quadraticCurveTo(-128, -54, -98, -86); ctx.stroke(); E(-96, -90, 11, 13);
  ctx.restore();
}
function boarShape(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  E(0, 0, 84, 44); F([[48, -36], [112, -12], [134, 4], [128, 18], [66, 34]]); E(134, 10, 8, 11); F([[62, -30], [72, -62], [88, -30]]);
  for (let i = 0; i < 7; i++) F([[-62 + i * 18, -38], [-54 + i * 18, -60], [-45 + i * 18, -40]]);
  ctx.lineCap = 'round'; Lb(-52, 30, -56, 74, 17); Lb(-26, 32, -22, 74, 17); Lb(36, 30, 32, 74, 17); Lb(58, 26, 64, 74, 17);
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-82, -6); ctx.quadraticCurveTo(-106, -20, -96, -34); ctx.stroke();
  ctx.restore();
}
// banner canvas 440x1030, pole foot at (40, 1020)
function bannerR(kind) {
  const st = kind === 'lion' ? GR : SS;
  return relief('b:ban:' + kind, 440, 1030, st, () => {
    Lb(40, 1012, 40, 70, 18); E(40, 54, 13, 20); F([[28, 74], [52, 74], [40, 34]]); R_(16, 990, 48, 36);
    ctx.beginPath(); ctx.moveTo(48, 90); ctx.quadraticCurveTo(220, 76, 404, 104); ctx.lineTo(352, 212); ctx.lineTo(404, 318); ctx.quadraticCurveTo(220, 344, 48, 330); ctx.closePath(); ctx.fill();
  }, { bev: 5, detail: (lx, ly, s) => {
    groove(s, lx, ly, 4, () => { ctx.moveTo(66, 108); ctx.quadraticCurveTo(220, 96, 372, 118); ctx.lineTo(330, 212); ctx.lineTo(372, 306); ctx.quadraticCurveTo(220, 322, 66, 312); ctx.closePath(); });
    sunkShape(s, lx, ly, 3, () => (kind === 'lion' ? lionShape(186, 236, 1.05) : boarShape(176, 214, 1.0)));
    for (let y = 140; y < 990; y += 120) groove(s, lx, ly, 3, () => { ctx.moveTo(32, y); ctx.lineTo(48, y + 8); });
  } });
}
const tokenR = (kind) => relief('b:tok:' + kind, 140, 140, kind === 'lion' ? GR : SS, () => E(70, 70, 58, 58), {
  bev: 4, detail: (lx, ly, s) => { groove(s, lx, ly, 3, () => ctx.arc(70, 70, 50, 0, TAU)); sunkShape(s, lx, ly, 2, () => (kind === 'lion' ? lionShape(56, 80, 0.36) : boarShape(58, 70, 0.36))); } });

// soldier canvas 220x470, feet at (110, 455), facing right
function soldierShapes(ph, banner) {
  return () => {
    ctx.translate(110, 455); const a = Math.sin(ph) * 0.42, b = Math.cos(ph) * 0.12;
    const f1 = Math.sin(a) * 150, f2 = -f1, lift1 = Math.max(0, Math.cos(ph)) * 10, lift2 = Math.max(0, -Math.cos(ph)) * 10;
    Lb(-4, -150, -4 + f1, -6 - lift1, 15); Lb(4, -150, 4 + f2, -6 - lift2, 15); E(-4 + f1 + 9, -6 - lift1, 17, 7); E(4 + f2 + 9, -6 - lift2, 17, 7);
    F([[-22, -172], [22, -172], [34, -118], [-32, -118]]);
    F([[-26, -264], [26, -264], [18, -168], [-18, -168]]);
    E(0, -290, 14, 18); F([[-15, -300], [15, -300], [4, -334], [0, -342], [-4, -334]]);
    Lb(-20, -256, -38 + b * 30, -206, 11); Lb(-38 + b * 30, -206, -30, -164, 10);
    if (banner) { Lb(-32, -30, -30, -440, 7); F([[-28, -440], [60, -424], [44, -398], [60, -372], [-28, -380]]); }
    else { Lb(-34, -40, -28, -410, 6); F([[-36, -408], [-20, -410], [-27, -450]]); }
    Lb(20, -256, 42, -206, 11); E(46, -200, 25, 35);
  };
}
const soldierDetail = (lx, ly, st) => { ctx.save(); ctx.translate(110, 455); groove(st, lx, ly, 3, () => ctx.ellipse(46, -200, 17, 26, 0, 0, TAU)); groove(st, lx, ly, 2.5, () => { ctx.moveTo(-24, -172); ctx.lineTo(24, -172); }); groove(st, lx, ly, 2.5, () => { ctx.moveTo(-8, -164); ctx.lineTo(-10, -122); ctx.moveTo(8, -164); ctx.lineTo(10, -122); }); ctx.restore(); };
const soldierR = (stone, pose, banner = false) => relief(`b:sol:${stone}:${pose}:${banner}`, 220, 470, stone === 'g' ? GR : SS, soldierShapes(pose / 8 * TAU, banner), { detail: soldierDetail, bev: 3.5 });
// elephant canvas 440x440, feet at (200, 430), facing right
function elephantShapes(ph) {
  return () => {
    ctx.translate(200, 430); const s = Math.sin(ph) * 16, l1 = Math.max(0, Math.cos(ph)) * 8, l2 = Math.max(0, -Math.cos(ph)) * 8;
    Lb(-82, -120, -86 + s, -18 - l1, 40); Lb(-42, -110, -42 - s, -18 - l2, 38); Lb(56, -110, 58 - s, -18 - l2, 40); Lb(96, -120, 100 + s, -18 - l1, 38);
    for (const [x, l] of [[-86 + s, l1], [-42 - s, l2], [58 - s, l2], [100 + s, l1]]) E(x, -12 - l, 24, 10);
    E(0, -172, 126, 82); E(118, -190, 60, 64);
    ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(160, -170); ctx.quadraticCurveTo(200 + s * 0.4, -96, 178 + s * 0.6, -26); ctx.stroke(); E(170 + s * 0.6, -22, 14, 10);
    F([[146, -132], [200, -120], [150, -112]]);
    Lb(-122, -186, -138, -104, 6);
    R_(-72, -282, 116, 36); E(-14, -326, 13, 16); F([[-30, -304], [2, -304], [8, -270], [-36, -270]]); F([[-26, -334], [0, -334], [-13, -366]]);
    Lb(-62, -282, -62, -400, 6); F([[-60, -400], [6, -386], [-6, -370], [6, -354], [-60, -360]]);
  };
}
const elephantDetail = (lx, ly, st) => {
  ctx.save(); ctx.translate(200, 430);
  groove(st, lx, ly, 4, () => ctx.ellipse(96, -184, 38, 52, 0.15, -1.2, 2.2));
  groove(st, lx, ly, 3.5, () => { ctx.moveTo(-84, -236); ctx.lineTo(56, -236); ctx.lineTo(48, -150); ctx.lineTo(-76, -150); ctx.closePath(); });
  for (let k = 0; k < 7; k++) groove(st, lx, ly, 2.5, () => { ctx.moveTo(-72 + k * 20, -150); ctx.lineTo(-74 + k * 20, -136); });
  for (const y of [-60, -90, -120, -150]) groove(st, lx, ly, 2.5, () => { ctx.moveTo(178 + (y + 100) * 0.1, y); ctx.lineTo(192, y + 4); });
  ctx.restore();
};
const elephantR = (pose) => relief('b:ele:' + pose, 440, 440, GR, elephantShapes(pose / 6 * TAU), { detail: elephantDetail, bev: 4.5 });

// ───────────── architecture ─────────────
// Kanchi: canvas 1080x980, wall base y 960. Shrines (back) + wall (front) + doors.
const kanShrines = () => relief('b:kshr', 1080, 980, GR, () => {
  R_(430, 470, 220, 220); R_(408, 450, 264, 24); R_(460, 360, 160, 92); R_(446, 342, 188, 20); R_(488, 286, 104, 58); R_(476, 270, 128, 18);
  ctx.beginPath(); ctx.ellipse(540, 268, 58, 46, 0, Math.PI, TAU); ctx.fill(); E(540, 214, 11, 15); F([[530, 206], [550, 206], [540, 176]]);
  for (const [y, w, n] of [[450, 264, 5], [342, 188, 4], [270, 128, 3]]) for (let k = 0; k < n; k++) { const x = 540 - w / 2 + (k + 0.5) * w / n; ctx.beginPath(); ctx.arc(x, y, 13, Math.PI, TAU); ctx.fill(); }
  R_(160, 500, 160, 190); ctx.beginPath(); ctx.moveTo(140, 506); ctx.bezierCurveTo(128, 420, 200, 352, 240, 330); ctx.bezierCurveTo(280, 352, 352, 420, 340, 506); ctx.closePath(); ctx.fill(); E(240, 320, 10, 15);
  R_(732, 520, 226, 170); R_(716, 504, 258, 20); R_(738, 440, 214, 66); ctx.beginPath(); ctx.ellipse(845, 442, 107, 64, 0, Math.PI, TAU); ctx.fill();
  for (let k = 0; k < 6; k++) { E(770 + k * 30, 376, 8, 11); }
}, { bev: 4.5, detail: (lx, ly, st) => {
  for (let k = 0; k <= 4; k++) groove(st, lx, ly, 4, () => { const x = 440 + k * 50; ctx.moveTo(x, 478); ctx.lineTo(x, 690); });
  for (const x of [465, 515, 565, 615]) groove(st, lx, ly, 4, () => { ctx.moveTo(x, 640); ctx.lineTo(x, 540); ctx.arc(x + 10, 540, 10, Math.PI, 0); ctx.lineTo(x + 20, 640); });
  for (let k = 0; k <= 3; k++) groove(st, lx, ly, 3.5, () => { const x = 470 + k * 47; ctx.moveTo(x, 366); ctx.lineTo(x, 450); });
  groove(st, lx, ly, 3, () => { ctx.moveTo(492, 290); ctx.lineTo(588, 290); });
  for (const [x0, x1] of [[176, 304]]) for (let k = 0; k < 4; k++) groove(st, lx, ly, 3.5, () => { const x = x0 + k * 42; ctx.moveTo(x, 520); ctx.lineTo(x, 690); });
  groove(st, lx, ly, 4, () => { ctx.moveTo(214, 690); ctx.lineTo(214, 560); ctx.arc(240, 560, 26, Math.PI, 0); ctx.lineTo(266, 690); });
  for (let k = 0; k < 4; k++) groove(st, lx, ly, 3, () => { ctx.moveTo(160 + k * 22, 500); ctx.quadraticCurveTo(200 + k * 10, 410, 240, 340); });
  for (let k = 0; k < 5; k++) groove(st, lx, ly, 3.5, () => { const x = 752 + k * 46; ctx.moveTo(x, 528); ctx.lineTo(x, 690); });
  groove(st, lx, ly, 4, () => ctx.ellipse(845, 452, 60, 40, 0, Math.PI, TAU));
  for (let k = 0; k < 8; k++) groove(st, lx, ly, 2.5, () => { ctx.moveTo(752 + k * 26, 440); ctx.lineTo(752 + k * 26, 504); });
} });
const kanWall = () => relief('b:kwall', 1080, 980, GR, () => {
  R_(0, 640, 1080, 340);
  for (let x = 0; x < 1080; x += 84) R_(x + 14, 588, 52, 56);
  for (const bx of [110, 970]) { R_(bx - 80, 566, 160, 414); for (let k = -1; k <= 1; k++) R_(bx + k * 54 - 20, 520, 40, 48); }
  R_(388, 606, 304, 374); for (let k = 0; k < 4; k++) R_(396 + k * 78, 556, 54, 52);
  cut(() => R_(440, 742, 200, 240));
}, { bev: 5.5, detail: (lx, ly, st) => {
  for (let y = 700, r = 0; y < 960; y += 58, r++) {
    groove(st, lx, ly, 3, () => { ctx.moveTo(0, y); ctx.lineTo(1080, y); });
    for (let x = (r % 2) * 60; x < 1080; x += 120) groove(st, lx, ly, 3, () => { ctx.moveTo(x, y); ctx.lineTo(x, y + 58); });
  }
  groove(st, lx, ly, 5, () => { ctx.moveTo(420, 730); ctx.lineTo(660, 730); ctx.lineTo(660, 980); ctx.moveTo(420, 730); ctx.lineTo(420, 980); });
  for (const bx of [110, 970]) for (const y of [680, 800]) groove(st, lx, ly, 5, () => { ctx.moveTo(bx, y); ctx.lineTo(bx, y + 50); });
} });
const doorR = () => relief('b:door', 100, 240, GR, () => R_(0, 0, 100, 240), { bev: 3, tint: 'rgba(30,26,22,0.25)', detail: (lx, ly, st) => {
  groove(st, lx, ly, 3, () => ctx.rect(10, 10, 80, 220));
  for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) groove(st, lx, ly, 4, () => ctx.arc(32 + c * 36, 34 + r * 36, 2.5, 0, TAU));
} });
// throne + dais: canvas 760x1100, base (380, 1080)
const throneR = () => relief('b:throne', 760, 1100, GR, () => {
  R_(0, 1000, 760, 90); R_(50, 930, 660, 74); R_(110, 870, 540, 64);
  ctx.beginPath(); ctx.moveTo(196, 880); ctx.lineTo(196, 420); ctx.ellipse(380, 420, 184, 176, 0, Math.PI, TAU); ctx.lineTo(564, 880); ctx.closePath(); ctx.fill();
  for (const sx of [-1, 1]) { R_(380 + sx * 250 - 42, 640, 84, 240); E(380 + sx * 250, 612, 50, 46); for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6; E(380 + sx * 250 + Math.cos(a) * 48, 612 + Math.sin(a) * 44, 14, 14); } }
  E(380, 228, 26, 34);
}, { bev: 5, detail: (lx, ly, st) => {
  groove(st, lx, ly, 5, () => { ctx.moveTo(226, 870); ctx.lineTo(226, 420); ctx.ellipse(380, 420, 154, 146, 0, Math.PI, TAU); ctx.lineTo(534, 870); });
  for (let k = 0; k < 12; k++) groove(st, lx, ly, 3.5, () => { const a = Math.PI + (k + 0.5) / 12 * Math.PI; ctx.arc(380 + Math.cos(a) * 168, 420 + Math.sin(a) * 160, 5, 0, TAU); });
  for (const sx of [-1, 1]) { groove(st, lx, ly, 4, () => ctx.arc(380 + sx * 250, 612, 26, 0, TAU)); groove(st, lx, ly, 3, () => { ctx.moveTo(380 + sx * 250 - 30, 700); ctx.lineTo(380 + sx * 250 + 30, 700); ctx.moveTo(380 + sx * 250 - 30, 820); ctx.lineTo(380 + sx * 250 + 30, 820); }); }
  for (const y of [1000, 930, 870]) groove(st, lx, ly, 3, () => { ctx.moveTo(0, y + 14); ctx.lineTo(760, y + 14); });
} });
// Vatapi: cliffs canvas 1240x780 (origin x -80), city canvas 1080x900, base y 880
const cliffR = () => relief('b:cliff', 1240, 780, SS, () => {
  F([[0, 780], [0, 300], [90, 292], [104, 236], [260, 226], [276, 168], [420, 158], [452, 214], [520, 222], [536, 184], [700, 174], [716, 120], [880, 112], [900, 196], [1010, 204], [1026, 250], [1140, 256], [1150, 300], [1240, 306], [1240, 780]]);
}, { bev: 6, q: 0.8, extra: { fire: [FIRE, 0, 1, 7], moon: ['#9DB2DA', 0.7, -0.7, 6] }, detail: (lx, ly, st) => {
  for (let i = 0; i < 16; i++) { const y = 200 + i * 36 + rnd(i) * 10; groove(st, lx, ly, 2.5 + rnd(i * 3) * 2, () => { ctx.moveTo(0, y); for (let x = 0; x <= 1240; x += 80) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 6); }); }
  for (let i = 0; i < 12; i++) { const x = rnd(i * 5.5) * 1240, y = 200 + rnd(i * 2.2) * 200; groove(st, lx, ly, 3, () => { ctx.moveTo(x, y); ctx.lineTo(x + 10, y + 120 + rnd(i) * 160); }); }
  for (const [cx, cy, w] of [[330, 330, 150], [780, 260, 170]]) {
    ctx.fillStyle = st.sh; ctx.globalAlpha = 0.9; ctx.fillRect(cx - w / 2, cy, w, 92); ctx.globalAlpha = 1;
    ctx.fillStyle = pat(st.tex); for (let k = 1; k < 3; k++) { ctx.fillRect(cx - w / 2 + k * w / 3 - 9, cy + 14, 18, 78); ctx.fillRect(cx - w / 2 + k * w / 3 - 16, cy + 8, 32, 10); } ctx.fillRect(cx - w / 2, cy, w, 8);
    groove(st, lx, ly, 4, () => ctx.rect(cx - w / 2 - 8, cy - 8, w + 16, 108));
  }
} });
const cityR = () => relief('b:vat', 1080, 900, SS, () => {
  for (const [x, w, top] of [[40, 190, 470], [250, 150, 450], [680, 120, 470], [972, 120, 480]]) { R_(x, top + 56, w, 640 - top); F([[x - 16, top + 62], [x + w / 2, top], [x + w + 16, top + 62]]); }
  R_(800, 440, 160, 200); R_(786, 420, 188, 24); F([[800, 420], [960, 420], [930, 360], [830, 360]]); F([[836, 360], [924, 360], [902, 314], [858, 314]]); E(880, 302, 28, 16); E(880, 280, 8, 12);
  R_(0, 620, 1080, 280); for (let x = 0; x < 1080; x += 72) R_(x + 12, 584, 42, 40);
  for (const bx of [170, 920]) { R_(bx - 72, 560, 144, 340); ctx.beginPath(); ctx.ellipse(bx, 562, 72, 30, 0, Math.PI, TAU); ctx.fill(); for (let k = -1; k <= 1; k++) R_(bx + k * 46 - 14, 504, 28, 34); }
  R_(430, 430, 220, 470); R_(414, 412, 252, 22); F([[430, 412], [650, 412], [620, 362], [460, 362]]); F([[472, 362], [608, 362], [588, 322], [492, 322]]); E(540, 318, 40, 16);
  cut(() => { ctx.beginPath(); ctx.moveTo(482, 900); ctx.lineTo(482, 730); ctx.arc(540, 730, 58, Math.PI, 0); ctx.lineTo(598, 900); ctx.closePath(); ctx.fill(); });
}, { bev: 5.5, extra: { fire: [FIRE, 0, 1, 7], moon: ['#9DB2DA', 0.7, -0.7, 5] }, detail: (lx, ly, st) => {
  for (let y = 660, r = 0; y < 900; y += 46, r++) { groove(st, lx, ly, 2.6, () => { ctx.moveTo(0, y); ctx.lineTo(1080, y); }); for (let x = (r % 2) * 45; x < 1080; x += 90) groove(st, lx, ly, 2.6, () => { ctx.moveTo(x, y); ctx.lineTo(x, y + 46); }); }
  for (const [x, w, top] of [[40, 190, 470], [250, 150, 450], [680, 120, 470], [972, 120, 480]]) {
    for (let k = 1; k < 6; k++) groove(st, lx, ly, 2.5, () => { ctx.moveTo(x + w / 2, top + 4); ctx.lineTo(x - 10 + k * (w + 20) / 6, top + 58); });
    groove(st, lx, ly, 4, () => { ctx.rect(x + w / 2 - 14, top + 90, 28, 40); });
  }
  for (const x of [470, 610]) for (const y of [470, 560, 650]) groove(st, lx, ly, 4, () => { ctx.moveTo(x, y); ctx.lineTo(x, y + 36); });
  groove(st, lx, ly, 5, () => { ctx.moveTo(468, 900); ctx.lineTo(468, 730); ctx.arc(540, 730, 72, Math.PI, 0); ctx.lineTo(612, 900); });
  for (const bx of [170, 920]) for (const y of [640, 760]) groove(st, lx, ly, 4.5, () => { ctx.moveTo(bx, y); ctx.lineTo(bx, y + 44); });
  for (let k = 0; k < 5; k++) groove(st, lx, ly, 3, () => { ctx.moveTo(820 + k * 30, 450); ctx.lineTo(820 + k * 30, 640); });
} });
const discR = (key, st, rays) => relief(key, 300, 300, st, () => { E(150, 150, 92, 92); if (rays) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.save(); ctx.translate(150, 150); ctx.rotate(a); F([[100, -12], [142, 0], [100, 12]]); ctx.restore(); } },
  { bev: 5, detail: (lx, ly, st) => { groove(st, lx, ly, 4, () => ctx.arc(150, 150, 74, 0, TAU)); groove(st, lx, ly, 3, () => ctx.arc(150, 150, 50, 0, TAU)); } });
const pillarR = () => relief('b:pil', 100, 960, GR, () => { R_(24, 120, 52, 740); R_(8, 860, 84, 100); R_(12, 90, 76, 34); ctx.beginPath(); ctx.ellipse(50, 92, 44, 30, 0, Math.PI, TAU); ctx.fill(); R_(4, 40, 92, 26); },
  { bev: 4, detail: (lx, ly, st) => { for (const x of [36, 50, 64]) groove(st, lx, ly, 3, () => { ctx.moveTo(x, 140); ctx.lineTo(x, 840); }); for (const y of [300, 600]) groove(st, lx, ly, 4, () => { ctx.moveTo(24, y); ctx.lineTo(76, y); }); for (let k = 0; k < 5; k++) groove(st, lx, ly, 3, () => { ctx.moveTo(14 + k * 18, 96); ctx.lineTo(50, 66); }); } });
const cartR = () => relief('b:cart', 1000, 660, GR, () => { ctx.beginPath(); ctx.roundRect(0, 0, 1000, 660, 40); ctx.fill(); cut(() => { ctx.beginPath(); ctx.roundRect(30, 30, 940, 600, 26); ctx.fill(); }); },
  { bev: 4, detail: (lx, ly, st) => { for (let x = 40; x < 970; x += 38) for (const y of [15, 645]) groove(st, lx, ly, 3, () => ctx.arc(x, y, 3.5, 0, TAU)); for (let y = 52; y < 620; y += 38) for (const x of [15, 985]) groove(st, lx, ly, 3, () => ctx.arc(x, y, 3.5, 0, TAU)); } });
function textR(key, txt, maxW, size, st, fam = 'Inter', wt = '900 ', ls = 6) {
  ctx.save(); ctx.font = `${wt}${size}px ${fam}`; ctx.letterSpacing = ls + 'px'; const tw = ctx.measureText(txt).width; ctx.restore();
  const fs = Math.min(size, size * maxW / tw), w = Math.ceil(Math.min(tw, maxW) + 60), h = Math.ceil(fs * 1.05 + 40);
  return relief(key, w, h, st, () => { ctx.font = `${wt}${fs}px ${fam}`; ctx.letterSpacing = ls + 'px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, w / 2, h / 2 + fs * 0.04); },
    { sunk: true, bev: Math.max(3, fs * 0.032) });
}
/** a sunk text relief revealed left->right up to screen x `rx` */
function drawTextReveal(R, x, y, s, lk, rx) {
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, rx + 300, H + 600); ctx.clip(); drawR(R, R.w / 2, R.h / 2, x, y, s, lk, { sunk: true }); ctx.restore();
}

// ───────────── relief map ─────────────
const MKS = 110, mp = (lon, lat) => [540 + (lon - 78) * MKS, 760 + (16 - lat) * MKS], mc = (lon, lat) => { const [x, y] = mp(lon, lat); return [x + 160, y + 100]; };
const COAST = [[68, 25.5], [88, 25.5], [87.2, 21.6], [86.8, 20.6], [85.5, 19.8], [84.6, 19.1], [83.4, 18.0], [82.3, 17.0], [81.4, 16.3], [80.9, 15.8], [80.1, 15.2], [80.2, 14.0], [80.3, 13.2], [80.1, 12.4], [79.8, 11.6], [79.85, 10.8], [79.3, 10.2], [78.9, 9.4], [78.2, 8.9], [77.5, 8.1], [77.0, 8.4], [76.5, 9.3], [76.2, 10.0], [75.8, 11.2], [75.2, 12.2], [74.8, 13.0], [74.6, 14.0], [74.1, 14.8], [73.7, 15.6], [73.4, 16.6], [73.0, 18.0], [72.8, 19.3], [72.9, 20.6], [72.6, 21.3], [72.2, 21.8], [70.5, 21.0], [69.0, 22.3], [68, 23.5]];
const LANKA = [[79.8, 9.6], [80.3, 9.75], [81.3, 8.5], [81.85, 7.2], [81.5, 6.3], [80.6, 5.95], [80.0, 6.4], [79.8, 7.5], [79.7, 8.5]];
const SPOLY = [[66, 12.6], [74.5, 12.9], [76.2, 13.6], [77.6, 14.7], [78.6, 14.5], [79.6, 14.75], [80.4, 14.6], [86, 14.6], [86, 3], [66, 3]];
const NPOLY = [[77.6, 14.7], [78.6, 14.5], [79.6, 14.75], [80.4, 14.6], [86, 14.6], [86, 16.0], [83, 16.2], [81.7, 16.8], [80.4, 18.2], [78.5, 18.8], [77.6, 18.0]];
const RIVERS = [[[73.7, 17.9], [75.0, 16.7], [76.6, 16.3], [78.0, 16.1], [79.6, 16.2], [80.9, 15.8]], [[75.6, 14.0], [76.3, 15.2], [77.4, 15.9], [78.0, 16.1]], [[75.9, 12.4], [77.0, 12.2], [78.2, 11.4], [79.3, 11.0], [79.8, 11.1]], [[73.7, 20.0], [76.0, 19.2], [78.5, 18.8], [80.4, 18.2], [81.7, 16.8]]];
const KANCHI = mp(79.7, 12.8), VATAPI = mp(75.7, 15.9);
function smoothPath(pts) {
  const P = pts.map((p) => mc(p[0], p[1])), n = P.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let m = mid(P[n - 1], P[0]); ctx.moveTo(m[0], m[1]);
  for (let i = 0; i < n; i++) { const b = P[(i + 1) % n], mm = mid(P[i], b); ctx.quadraticCurveTo(P[i][0], P[i][1], mm[0], mm[1]); }
  ctx.closePath();
}
const landPath = () => { ctx.beginPath(); smoothPath(COAST); smoothPath(LANKA); };
const polyPath = (pts) => { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = mc(p[0], p[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); };
function mapR(reg, stone) {
  const st = stone === 'g' ? GR : SS;
  return relief(`b:map:${reg}:${stone}`, 1400, 2100, st, () => {
    if (reg === 'C') { landPath(); ctx.fill(); cut(() => { polyPath(SPOLY); ctx.fill(); polyPath(NPOLY); ctx.fill(); ctx.lineWidth = 9; polyPath(SPOLY); ctx.stroke(); polyPath(NPOLY); ctx.stroke(); }); }
    else { const P = reg === 'S' ? SPOLY : NPOLY; ctx.save(); landPath(); ctx.clip(); polyPath(P); ctx.fill(); ctx.restore(); cut(() => { ctx.lineWidth = 9; polyPath(P); ctx.stroke(); }); }
  }, { q: 0.7, bev: 6, detail: (lx, ly, s) => {
    for (const rv of RIVERS) groove(s, lx, ly, 5, () => rv.forEach((p, i) => { const [x, y] = mc(p[0], p[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }));
    for (let i = 0; i < 70; i++) { const x = 200 + rnd(i * 4.4) * 1000, y = 300 + rnd(i * 6.1) * 1500; groove(s, lx, ly, 2.5, () => { ctx.moveTo(x - 10, y + 6); ctx.lineTo(x, y - 6); ctx.lineTo(x + 10, y + 6); }); }
  } });
}
const seaImg = () => cached('b:sea', 1240, 2120, 0.6, () => {
  ctx.fillStyle = pat('g'); ctx.fillRect(0, 0, 1240, 2120); ctx.fillStyle = 'rgba(16,20,26,0.5)'; ctx.fillRect(0, 0, 1240, 2120);
  for (let r = 0; r < 46; r++) for (let c = 0; c < 18; c++) {
    const x = c * 72 + (r % 2) * 36, y = r * 46 + 20;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(8,10,12,0.5)'; ctx.beginPath(); ctx.arc(x, y, 18, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(190,196,200,0.22)'; ctx.beginPath(); ctx.arc(x + 1.5, y + 2, 18, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  }
});
const eroImg = () => cached('b:ero', 1400, 2100, 0.5, () => {
  for (let i = 0; i < 900; i++) { const x = 640 + rnd(i * 3.1) * 760, y = 500 + rnd(i * 5.7) * 600, r = 2 + rnd(i * 2.3) * 11, k = rnd(i * 9.9);
    ctx.fillStyle = k < 0.5 ? 'rgba(40,20,10,0.35)' : k < 0.8 ? 'rgba(104,120,58,0.45)' : 'rgba(170,175,110,0.4)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.5 + rnd(i) * 0.5), rnd(i * 4) * 3, 0, TAU); ctx.fill(); }
  ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(mapR('N', 'g').sd, 0, 0, 1400, 2100);
});
function routePts() {
  const pts = [[79.7, 12.8], [79.1, 13.25], [78.4, 13.75], [77.7, 14.35], [77.0, 14.9], [76.35, 15.4], [75.7, 15.9]].map((p) => mp(p[0], p[1])), out = [];
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 8; k++) { const u = k / 8; out.push([lerp(pts[i][0], pts[i + 1][0], u) + Math.sin((i * 8 + k) * 0.5) * 6, lerp(pts[i][1], pts[i + 1][1], u)]); }
  out.push(pts[pts.length - 1]); return out;
}
function partial(pts, p) {
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const target = L[L.length - 1] * clamp(p), out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (L[i] <= target) out.push(pts[i]); else { const u = (target - L[i - 1]) / (L[i] - L[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } }
  return out;
}
const strokePts = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); };
function drawMap(lk, o = {}) {
  blit(seaImg(), 0, 0, -80, -100, 1, 1);
  const nG = 1 - (o.lost ?? 0);
  drawR(mapR('C', 's'), 160, 100, 0, 0, 1, lk, { d: 8 });
  drawR(mapR('S', 'g'), 160, 100, 0, 0, 1, lk, { d: 10 });
  const nd = lerp(10, 2.5, o.flat ?? 0);
  if (nG > 0.01) drawR(mapR('N', 'g'), 160, 100, 0, 0, 1, lk, { d: nd, a: nG });
  if (nG < 0.99) drawR(mapR('N', 's'), 160, 100, 0, 0, 1, lk, { d: nd, a: 1 - nG, rim: 0.4 });
  if (o.ero) blit(eroImg(), 0, 0, -160, -100, 1, o.ero);
}

// ───────────── fire ─────────────
function flame(x, y, w, h, t, sd, a = 1) {
  const sw = Math.sin(t * 7 + sd) * w * 0.25, sw2 = Math.sin(t * 5.3 + sd * 2) * w * 0.2, hh = h * (0.88 + 0.12 * Math.sin(t * 9 + sd * 3));
  const path = (s) => { const p = new Path2D(), W2 = w * s, H2 = hh * s;
    p.moveTo(x - W2 / 2, y); p.bezierCurveTo(x - W2 * 0.75, y - H2 * 0.35, x - W2 * 0.25 + sw2 * s, y - H2 * 0.5, x - W2 * 0.12 + sw * 0.6 * s, y - H2 * 0.72);
    p.quadraticCurveTo(x + sw * s, y - H2 * 0.88, x + sw * 1.4 * s, y - H2); p.quadraticCurveTo(x + W2 * 0.22 + sw * s, y - H2 * 0.68, x + W2 * 0.32 + sw2 * s, y - H2 * 0.5);
    p.quadraticCurveTo(x + W2 * 0.42, y - H2 * 0.62, x + W2 * 0.5 + sw2, y - H2 * 0.7); p.bezierCurveTo(x + W2 * 0.75, y - H2 * 0.4, x + W2 * 0.62, y - H2 * 0.06, x + W2 / 2, y); p.closePath(); return p; };
  const p = path(1);
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(20,6,0,0.55)'; ctx.save(); ctx.translate(5, -7); ctx.fill(p); ctx.restore();
  ctx.fillStyle = '#FFE39A'; ctx.save(); ctx.translate(-2, 2); ctx.fill(p); ctx.restore();
  ctx.fillStyle = pat('s'); ctx.fill(p); ctx.globalAlpha *= 0.78; ctx.fillStyle = lg(x, y, x, y - hh, [[0, '#FF7A22'], [0.55, '#D9531C'], [1, '#9A3414']]); ctx.fill(p);
  ctx.translate(x, y); ctx.scale(0.55, 0.6); ctx.translate(-x, -y); ctx.fillStyle = lg(x, y, x, y - hh, [[0, '#FFE3A0'], [1, '#FF9A36']]); ctx.fill(path(1));
  ctx.restore();
}

// ═════════════════════════════════════════ SHOTS ═════════════════════════════════════════
export function buildB(add, cue) {
  const T5 = L(5), T6 = L(6), T7 = L(7), T8 = L(8), T9 = L(9);
  const tHeld = Wd('held', 5), tKan = Wd('kanchi', 5), tBut = Wd('but', 5), tLands = Wd('lands', 5), tLost = Wd('lost', 5);
  const tCame = Wd('came', 6), tSix6 = Wd('six', 6);
  const tStruck = Wd('struck', 7), tAcc = Wd('accounts', 7), tBeat = Wd('beat', 7), tPul7 = Wd('pulakeshin', 7), tNear = Wd('near', 7), tThen = Wd('then', 7), tMarch = Wd('marched', 7), tVat7 = Wd('vatapi', 7);
  const tBel = Wd('believed', 8), tDied = Wd('died', 8), tVat8 = Wd('vatapi', 8), tTaken = Wd('taken', 8), tSaid = Wd('said', 8), tBurn = Wd('burned', 8);
  const tTitle = Wd('title', 9), tVk = Wd('vatapikonda', 9), tOne = Wd('one', 9), tVat9 = Wd('vatapi', 9);

  // ── b1 Kanchi held ──
  add({ id: 'b1', at: T5, cam: [540, 820], zoom: 0.07, note: 'granite Kanchi walls + early Pallava shrines, slab drop, KANCHI carved, gates shut on held, MOST ACCOUNTS',
    draw(lt, d) {
      const lk = LK(lerp(0.1, 0.72, eio(lt / d))), land = 0.3, drop = 1 - eo(seg(lt, 0, land)), [sx, sy] = shake(lt - land, 9), [hx, hy] = shake(lt - (tHeld - T5 + 0.12), 6);
      fillAll('#0C0B0A');
      ctx.save(); ctx.translate(sx + hx, -drop * 760 + sy + hy);
      bg('gf'); band(1250, 40, lk, GR, 110, 970);
      drawR(kanShrines(), 540, 960, 540, 1250, 1, lk, { d: 7 });
      // gate gloom + doors (closing on "held")
      ctx.fillStyle = '#100F0E'; ctx.fillRect(440, 1032, 200, 220); ctx.fillStyle = lg(0, 1032, 0, 1252, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(120,110,95,0.25)']]); ctx.fillRect(440, 1032, 200, 220);
      const dc = eob(seg(lt, tHeld - T5 - 0.15, tHeld - T5 + 0.12)), dw = lerp(0.12, 1, clamp(dc, 0, 1.08));
      ctx.save(); ctx.translate(440, 1012); ctx.scale(dw, 1); drawR(doorR(), 0, 0, 0, 0, 1, lk, { d: 4 }); ctx.restore();
      ctx.save(); ctx.translate(640, 1012); ctx.scale(-dw, 1); drawR(doorR(), 0, 0, 0, 0, 1, lk, { d: 4 }); ctx.restore();
      drawR(kanWall(), 540, 960, 540, 1250, 1, lk, { d: 11 });
      // KANCHI chip-carved on the gate lintel
      const k0 = tKan - T5 - 0.1, kp = seg(lt, k0, k0 + 0.38), rx = lerp(410, 672, kp);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, rx, H); ctx.clip(); carveTxt('KANCHI', 540, 978, 52, GR, lk, 1, '900 ', 'Inter', 8); ctx.restore();
      chips(lt, k0, k0 + 0.38, 16, 11, (ts) => [lerp(410, 672, seg(ts, k0, k0 + 0.38)), 978], [GR.lt, GR.base, '#E8E4DA']);
      chisel(rx, 970 + Math.sin(lt * 40) * 12, -0.8, Math.max(0, Math.sin(lt * 36)), kp > 0 && kp < 1 ? 1 : clamp(1 - (lt - k0 - 0.38) * 5) * (kp > 0 ? 1 : 0));
      ctx.restore();
      skirt(80, 1000, 1290 - drop * 760, lt - land, '190,184,172', 1.3);
      puff(540, 1250, lt - (tHeld - T5 + 0.1), 0.9, '170,164,154');
      motes(lt + 3, 28, 0.35, 5);
      rake(lk, { dark: 0.55 }); vignette(0.9);
      plaque('MOST ACCOUNTS', 540, 196, seg(lt, 0.4, 0.75));
    } });
  cue(T5 + 0.28, 'thud', { gain: 0.7 }); cue(tKan - 0.08, 'chisel', { gain: 0.45 }); cue(tHeld + 0.1, 'slam', { gain: 0.6 }); cue(T5 + 0.45, 'pop', { gain: 0.3 });

  // ── b2 northern lands lost (relief map) ──
  add({ id: 'b2', at: tBut, cam: [540, 820], zoom: 0.05, note: 'relief map: Pallava granite south, sandstone Deccan; north strip erodes, flattens, turns sandstone',
    draw(lt, d, t) {
      const lk = LK(lerp(0.75, 0.25, eio(lt / d))), pe = eio(seg(t, tLands - 0.15, tLost + 0.45));
      const z = lerp(1.18, 1.34, eio(lt / d)), fy = lerp(KANCHI[1] - 40, 840, eio(seg(lt, 0, d * 0.75))), fx = lerp(KANCHI[0] - 40, 720, eio(seg(lt, 0, d * 0.75)));
      fillAll('#15181C');
      ctx.save(); ctx.translate(540, 860); ctx.scale(z, z); ctx.translate(-fx, -fy);
      drawMap(lk, { lost: pe, flat: pe, ero: pe * 0.85 });
      // sand blowing across the north
      if (pe > 0) { ctx.save(); for (let i = 0; i < 26; i++) { const y = 560 + rnd(i * 3.3) * 420, x = ((rnd(i * 7.7) * 1400 + lt * (380 + rnd(i) * 300)) % 1400) - 200, w = 60 + rnd(i * 2.1) * 160;
        ctx.fillStyle = lg(x, 0, x + w, 0, [[0, 'rgba(230,180,130,0)'], [0.5, `rgba(230,180,130,${0.35 * pe})`], [1, 'rgba(230,180,130,0)']]); ctx.fillRect(x, y, w, 2.5); } ctx.restore(); }
      drawR(tokenR('lion'), 70, 70, KANCHI[0], KANCHI[1], 0.62, lk, { d: 6 });
      carveTxt('KANCHI', KANCHI[0] + 8, KANCHI[1] + 64, 30, GR, lk, 1, '900 ', 'Inter', 4);
      carveTxt('VATAPI', VATAPI[0], VATAPI[1] + 44, 28, SS, lk, 1, '900 ', 'Inter', 4);
      ctx.fillStyle = SS.sh; ctx.beginPath(); ctx.arc(VATAPI[0], VATAPI[1], 9, 0, TAU); ctx.fill();
      carveTxt('NORTHERN LANDS', 820, 700, 30, pe > 0.5 ? SS : GR, lk, seg(t, tBut + 0.2, tBut + 0.5) * (1 - 0.4 * pe), '900 ', 'Inter', 4);
      ctx.restore();
      glow(540 + (KANCHI[0] - fx) * z, 860 + (KANCHI[1] - fy) * z, 160, '255,220,170', 0.18 + 0.08 * Math.sin(lt * 5));
      rake(lk, { dark: 0.45, beam: 0.1 }); vignette(0.9);
    } });
  cue(tLands, 'rumble', { gain: 0.45 }); cue(tLost, 'whoosh', { gain: 0.4 });

  // ── b3 Narasimhavarman chisel-revealed ──
  add({ id: 'b3', at: T6, cam: [540, 760], zoom: 0.07, note: 'chisel chip reveal top-down of a tall-crowned faceless granite king, ghost outline, ILLUSTRATION',
    draw(lt, d) {
      const lk = LK(lerp(0.2, 0.62, eio(lt / d))), R = kingR('g', 'sword'), s = 0.98, bx = 540, by = 1262;
      const p = eio(seg(lt, 0.05, d - 0.2)), ry = lerp(250, 1320, p), sy = by + (ry - 1300) * s;
      bg('gf'); band(1262, 40, lk, GR, 110, 970);
      ctx.save(); ctx.globalAlpha = 0.16; ctx.drawImage(R.sd, bx - 300 * s, by - 1300 * s, 600 * s, 1340 * s); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, sy + 300); ctx.clip(); drawR(R, 300, 1300, bx, by, s, lk, { d: 10 }); ctx.restore();
      const tip = (ts) => { const pp = eio(seg(ts, 0.05, d - 0.2)); return [bx + Math.sin(ts * 11) * 150 * s, by + (lerp(250, 1320, pp) - 1300) * s]; };
      const [cx_, cy_] = tip(lt);
      chips(lt, 0.05, d - 0.15, 46, 3, tip, [GR.lt, GR.base, '#EDE9E0', GR.dk]);
      puff(cx_, cy_, (lt * 3) % 1, 0.4, '200,196,186', 3, Math.floor(lt * 3));
      chisel(cx_, cy_, -0.7 + Math.sin(lt * 11) * 0.15, Math.max(0, Math.sin(lt * 34)), clamp((d - lt) * 6));
      motes(lt, 24, 0.3, 2);
      rake(lk, { dark: 0.5 }); vignette(0.9);
      plaque('ILLUSTRATION', 820, 196, seg(lt, 0.5, 0.85), 0.05, 0.9);
    } });
  [0.1, 0.55, 1.05, 1.45].forEach((o, i) => cue(T6 + o, 'chisel', { gain: 0.38 + (i % 2) * 0.08 }));

  // ── b4 to the throne ──
  add({ id: 'b4', at: tCame, cam: [540, 900], zoom: 0.08, note: 'king glides up onto a lion-armed throne dais, lion banner rises, c. 630 plaque',
    draw(lt, d, t) {
      const lk = LK(lerp(0.85, 0.3, eio(lt / d))), ks = 0.76;
      const mv = eio(seg(lt, 0, 0.75)), kx = lerp(-120, 540, mv), ky = lerp(1250, 1040, eio(seg(lt, 0.35, 0.75))) - Math.abs(Math.sin(mv * Math.PI * 3)) * 14 * (1 - mv);
      const br = eo(seg(lt, 0.45, 1.05)), [sx, sy] = shake(lt - 1.05, 5);
      ctx.save(); ctx.translate(sx, sy);
      bg('g'); band(1250, 40, lk, GR);
      ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, 1250 + 300); ctx.clip();
      drawR(bannerR('lion'), 40, 1020, 150, 1250 + (1 - br) * 980, 0.88, lk, { d: 8 });
      drawR(bannerR('lion'), 40, 1020, 930, 1250 + (1 - br) * 980, 0.88, lk, { d: 8 }); ctx.restore();
      drawR(throneR(), 380, 1080, 540, 1250, 0.96, lk, { d: 10 });
      drawR(kingR('g', 'sword'), 300, 1300, kx, ky, ks, lk, { d: 11 });
      ctx.restore();
      puff(kx, ky, (lt * 2.2) % 1, 0.35, '190,186,176', 3, 7);
      skirt(60, 1020, 1250, lt - 1.05, '190,186,176', 0.8);
      motes(lt + 1, 26, 0.35, 8);
      rake(lk, { dark: 0.5, beam: 0.15 }); vignette(0.9);
      plaque('c. 630', 820, 220, seg(t, tSix6 - 0.1, tSix6 + 0.25), -0.06, 1.15);
    } });
  cue(tCame + 0.05, 'slide', { gain: 0.45 }); cue(tCame + 1.05, 'thud', { gain: 0.5 }); cue(tSix6 - 0.05, 'pop', { gain: 0.45 });

  // ── b5 around 642 ──
  add({ id: 'b5', at: T7, cam: [540, 700], zoom: 0.08, note: '642 chip-carved huge into granite, sun disc rising behind, AROUND',
    draw(lt, d) {
      const lk = LK(lerp(0.05, 0.6, eio(lt / d))), R = textR('b:t642', '642', 820, 440, GR), p = eio(seg(lt, 0.08, 1.15)), rx = lerp(110, 980, p);
      bg('gf');
      const sunY = lerp(980, 560, eo(seg(lt, 0, d)));
      drawR(discR('b:sun', GR, true), 150, 150, 800, sunY, 1.05, lk, { d: 8, a: 0.95 });
      glow(800, sunY, 340, '255,206,140', 0.18);
      drawTextReveal(R, 540, 760, 1, lk, rx);
      const tip = (ts) => [lerp(110, 980, eio(seg(ts, 0.08, 1.15))), 760 + Math.sin(ts * 23) * 150];
      const [cx_, cy_] = tip(lt);
      chips(lt, 0.08, 1.2, 50, 21, tip, [GR.lt, GR.base, '#EDE9E0']);
      puff(cx_, cy_, (lt * 3.3) % 1, 0.5, '200,196,186', 3, Math.floor(lt * 3.3));
      chisel(cx_, cy_, -0.75, Math.max(0, Math.sin(lt * 38)), clamp((1.35 - lt) * 5));
      band(1210, 36, lk, GR, 110, 970);
      motes(lt, 22, 0.35, 4);
      rake(lk, { dark: 0.5, beam: 0.16 }); vignette(0.85);
      plaque('AROUND', 540, 300, seg(lt, 0.25, 0.6), -0.05, 1.1);
    } });
  cue(T7 + 0.1, 'chisel', { gain: 0.5 }); cue(T7 + 0.6, 'chisel', { gain: 0.45 }); cue(T7 + 0.4, 'swell', { gain: 0.3 });

  // ── b6 frieze track: the army marches ──
  add({ id: 'b6', at: tStruck, cam: [540, 760], zoom: 0.05, note: 'FRIEZE TRACK: two-register procession of granite soldiers, banner bearers, war elephants marching left past pillars; ACCOUNTS SAY',
    draw(lt, d, t) {
      const lk = LK(lerp(0.2, 0.75, lt / d)), cam = 90 * lt + 60, vs = 200;
      bg('g');
      band(256, 44, lk, GR); band(790, 34, lk, GR); band(1232, 44, lk, GR);
      for (let i = -2; i < 4; i++) { const x = i * 760 + 300 + cam % 760; drawR(pillarR(), 50, 960, x, 1232, 0.98, lk, { d: 7, a: 1 }); }
      // back register: soldiers + banner bearers
      for (let i = 0; i < 16; i++) {
        let x = i * 132 - 120 - vs * 0.8 * lt + cam; x = ((x % 2112) + 2112) % 2112 - 300; if (x < -160 || x > 1240) continue;
        const ph = lt * 8 + i * 1.7, pose = Math.floor((((ph / TAU) % 1) + 1) % 1 * 8), bob = Math.abs(Math.sin(ph)) * 3;
        ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); drawR(soldierR('g', pose, i % 4 === 1), 110, 455, 0, 788 - bob, 0.92, { ...lk, lx: -lk.lx }, { d: 6 }); ctx.restore();
      }
      // front register: elephants + soldiers
      for (let i = 0; i < 8; i++) {
        let x = i * 330 - vs * lt + cam; x = ((x % 2640) + 2640) % 2640 - 400; if (x < -300 || x > 1400) continue;
        ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1);
        if (i % 3 === 0) { const ph = lt * 5 + i, pose = Math.floor((((ph / TAU) % 1) + 1) % 1 * 6); drawR(elephantR(pose), 200, 430, 0, 1230 - Math.abs(Math.sin(ph)) * 4, 1.08, { ...lk, lx: -lk.lx }, { d: 10 }); }
        else { const ph = lt * 8 + i * 2.3, pose = Math.floor((((ph / TAU) % 1) + 1) % 1 * 8); drawR(soldierR('g', pose, i % 3 === 2), 110, 455, 0, 1230 - Math.abs(Math.sin(ph)) * 4, 0.98, { ...lk, lx: -lk.lx }, { d: 8 }); }
        ctx.restore();
      }
      for (let i = 0; i < 4; i++) puff(((i * 300 - vs * lt + cam) % 1200 + 1200) % 1200 - 60, 1228, ((lt + i * 0.37) * 1.4) % 1, 0.45, '190,186,176', 3, i);
      motes(lt, 26, 0.35, 6);
      rake(lk, { dark: 0.5, beam: 0.14, tilt: 0.15 }); vignette(0.85);
      plaque('ACCOUNTS SAY', 540, 186, seg(t, tAcc - 0.1, tAcc + 0.25), -0.05, 1.05);
    } });
  cue(tStruck, 'drum', { gain: 0.75 }); cue(tStruck + 0.45, 'drum', { gain: 0.55 }); cue(tStruck + 0.9, 'drum', { gain: 0.6 }); cue(tStruck + 0.05, 'rumble', { gain: 0.4 }); cue(tAcc, 'pop', { gain: 0.35 });

  // ── b7 slab clash ──
  add({ id: 'b7', at: tBeat, cam: [540, 860], zoom: 0.06, note: 'SLAB SLIDE: granite lion-banner slab slams into the sandstone boar-banner slab (Pulakeshin) and shoves it away; NEAR KANCHI',
    draw(lt, d, t) {
      const lk = LK(lerp(0.75, 0.55, lt / d)), slam = 0.34, sIn = eo(seg(lt, 0, slam)), push = eio(seg(lt, slam + 0.12, d - 0.1));
      const seam = lerp(1180, 600, sIn) - push * 280, sOff = -push * 280, tilt = push * 0.05, [sx, sy] = shake(lt - slam, 12);
      fillAll('#0C0A09');
      ctx.save(); ctx.translate(sx, sy);
      // sandstone slab (left), shoved & sinking
      ctx.save(); ctx.translate(sOff, push * 40); ctx.translate(0, 1300); ctx.rotate(-tilt); ctx.translate(0, -1300);
      ctx.beginPath(); ctx.rect(-300, -300, 600 + 300, H + 600); ctx.clip();
      bg('s'); band(1250, 40, lk, SS, -300, 600);
      drawR(bannerR('boar'), 40, 1020, 300, 1250, 0.82, lk, { d: 8 });
      drawR(kingR('s', 'plain'), 300, 1300, 170, 1250, 0.66, lk, { d: 8 });
      for (const x of [400, 520]) drawR(soldierR('s', 2 + (x % 3)), 110, 455, x, 1250, 0.95, lk, { d: 7 });
      ctx.fillStyle = 'rgba(10,4,2,0.3)'; ctx.fillRect(-300, -300, 900, H + 600); ctx.fillStyle = `rgba(10,4,2,${push * 0.35})`; ctx.fillRect(-300, -300, 900, H + 600);
      ctx.restore();
      // granite slab (right)
      ctx.save(); ctx.translate(seam - 600, 0); ctx.beginPath(); ctx.rect(600, -300, 900, H + 600); ctx.clip();
      bg('g'); band(1250, 40, lk, GR, 600, 1400);
      drawR(bannerR('lion'), 40, 1020, 880, 1250, 0.86, lk, { d: 8 });
      for (const [x, k] of [[690, 3], [810, 5], [980, 1]]) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); drawR(soldierR('g', k, x === 980), 110, 455, 0, 1250, 0.98, { ...lk, lx: -lk.lx }, { d: 8 }); ctx.restore(); }
      ctx.fillStyle = lg(600, 0, 640, 0, [[0, 'rgba(255,240,220,0.35)'], [1, 'rgba(255,240,220,0)']]); ctx.fillRect(600, -300, 40, H + 600);
      ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(seam - 8, -300, 10, H + 600);
      ctx.restore();
      chips(lt, slam, slam + 0.12, 34, 41, () => [seam, 500 + rnd(Math.floor(lt * 60)) * 700], [GR.lt, SS.lt, SS.base, GR.base]);
      for (const y of [420, 760, 1100]) puff(seam, y, lt - slam, 0.9, '200,170,150', 5, y);
      skirt(seam - 300, seam + 300, 1280, lt - slam, '190,176,160', 1.0);
      rake(lk, { dark: 0.5, beam: 0.12 }); vignette(0.9);
      plaque('NEAR KANCHI', 540, 200, seg(t, tNear - 0.15, tNear + 0.2), 0.05, 1.05);
    } });
  cue(tBeat + 0.02, 'whoosh', { gain: 0.4 }); cue(tBeat + 0.34, 'slam', { gain: 0.85 }); cue(tBeat + 0.5, 'rumble', { gain: 0.45 }); cue(tNear - 0.1, 'pop', { gain: 0.3 });

  // ── b8 the route lights up to Vatapi ──
  const RT = routePts();
  add({ id: 'b8', at: tThen, cam: [540, 860], zoom: 0.05, note: 'relief map: carved route channel fills fire-orange Kanchi -> Vatapi, lion token at its head, Vatapi flares',
    draw(lt, d, t) {
      const lk = LK(lerp(0.2, 0.7, lt / d)), p = eio(seg(t, tMarch - 0.15, tVat7 + 0.45)), z = lerp(1.3, 1.45, eio(lt / d));
      const head = partial(RT, p), hp = head[head.length - 1];
      const fx = lerp(KANCHI[0], VATAPI[0], eio(seg(p, 0, 1))) + 30, fy = lerp(KANCHI[1], VATAPI[1], eio(seg(p, 0, 1))) - 10;
      fillAll('#15181C');
      ctx.save(); ctx.translate(540, 820); ctx.scale(z, z); ctx.translate(-fx, -fy);
      drawMap(lk, { lost: 1, flat: 1, ero: 0.5 });
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(12,8,6,0.75)'; ctx.lineWidth = 15; strokePts(RT);
      ctx.strokeStyle = 'rgba(210,205,195,0.35)'; ctx.lineWidth = 4; ctx.save(); ctx.translate(-lk.lx * 4, -lk.ly * 4); strokePts(RT); ctx.restore();
      if (p > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(255,138,42,0.28)'; ctx.lineWidth = 34; strokePts(head);
        ctx.strokeStyle = FIRE; ctx.lineWidth = 9; strokePts(head);
        ctx.strokeStyle = 'rgba(255,230,160,0.9)'; ctx.lineWidth = 3; strokePts(head);
        ctx.restore();
        glow(hp[0], hp[1], 70, '255,170,80', 0.55 + 0.2 * Math.sin(lt * 20));
      }
      ctx.fillStyle = SS.sh; ctx.beginPath(); ctx.arc(VATAPI[0], VATAPI[1], 11, 0, TAU); ctx.fill();
      const arr = seg(p, 0.97, 1);
      if (arr > 0) { glow(VATAPI[0], VATAPI[1], 200 * eo(arr), '255,150,60', 0.6 * (1 - 0.5 * seg(lt, d - 0.5, d))); drawR(tokenR('boar'), 70, 70, VATAPI[0] - 4, VATAPI[1] - 4, 0.5, lk, { d: 5 }); }
      carveTxt('KANCHI', KANCHI[0] + 8, KANCHI[1] + 54, 28, GR, lk, 1, '900 ', 'Inter', 4);
      carveTxt('VATAPI', VATAPI[0], VATAPI[1] - 46, 30, SS, lk, 1, '900 ', 'Inter', 4);
      drawR(tokenR('lion'), 70, 70, hp[0], hp[1] - 4, 0.55, lk, { d: 6 });
      sparks(lt, 18, hp[0] - 30, hp[0] + 30, hp[1], 120, 3, 0.8 * (p > 0 && p < 1 ? 1 : 0.3));
      ctx.restore();
      rake(lk, { dark: 0.45, beam: 0.1 }); vignette(0.9);
    } });
  cue(tMarch, 'zip', { gain: 0.35 }); cue(tVat7 + 0.4, 'sizzle', { gain: 0.35 }); cue(tVat7 + 0.42, 'drum', { gain: 0.5 });

  // ── b9 Pulakeshin falls (believed) ──
  add({ id: 'b9', at: T8, cam: [520, 820], zoom: 0.08, note: 'sunset sandstone Pulakeshin + boar banner; banner falls, crown topples on died; figure weathers; BELIEVED',
    draw(lt, d, t) {
      const td = tDied - T8, lk = LK(lerp(0.88, 0.97, lt / d)), fall = seg(lt, td - 0.05, td + 0.5), fe = fall * fall, dim = eio(seg(lt, td + 0.4, d));
      const hit = td + 0.5, [sx, sy] = shake(lt - hit, 8);
      ctx.save(); ctx.translate(sx, sy);
      bg('sf'); band(1250, 40, lk, SS, 110, 970);
      drawR(discR('b:sunS', SS, true), 150, 150, 880, lerp(420, 560, lt / d), 0.8, lk, { d: 6, a: 0.9 });
      glow(880, lerp(420, 560, lt / d), 300, '255,150,80', 0.22 * (1 - dim * 0.6));
      // the banner falls to the right about its foot
      const ang = fe * 1.42 + (fall >= 1 ? Math.sin((lt - hit) * 18) * 0.03 * Math.exp(-(lt - hit) * 5) : 0);
      ctx.save(); ctx.translate(660, 1250); ctx.rotate(ang); drawR(bannerR('boar'), 40, 1020, 0, 0, 0.84, lk, { d: 9 }); ctx.restore();
      // the king: weathers after the fall
      drawR(kingR('s', 'plain', false), 300, 1300, 380, 1250, 0.88, lk, { d: lerp(10, 3, dim), a: lerp(1, 0.82, dim) });
      // the crown topples to the ground
      const ck = seg(lt, td, td + 0.6), cx0 = 380 + (300 - 300) * 0.88, cy0 = 1250 - (1300 - 470) * 0.88;
      const cxp = cx0 - eo(ck) * 190, cyp = cy0 + ck * ck * (1250 - 20 - cy0), rot = -eo(ck) * 1.62;
      ctx.save(); ctx.translate(cxp, ck >= 1 ? 1250 - 20 : cyp); ctx.rotate(ck >= 1 ? -1.62 : rot); drawR(crownR(), 70, 220, 0, 0, 0.88, lk, { d: 7 }); ctx.restore();
      ctx.restore();
      puff(660 + 800 * 0.84, 1250, lt - hit, 1.1, '190,140,110', 6, 4);
      puff(cx0 - 190, 1250, lt - td - 0.6, 0.6, '190,140,110', 4, 8);
      ctx.fillStyle = `rgba(30,8,4,${dim * 0.35})`; ctx.fillRect(-300, -300, W + 600, H + 600);
      motes(lt, 22, 0.3, 9, '255,190,140');
      rake(lk, { dark: 0.55, beam: 0.12, col: '255,170,110' }); vignette(0.95);
      plaque('BELIEVED', 540, 210, seg(t, tBel - 0.1, tBel + 0.25), -0.05, 1.15);
    } });
  cue(tBel - 0.05, 'pop', { gain: 0.4 }); cue(tDied + 0.45, 'thud', { gain: 0.75 }); cue(tDied + 0.6, 'tock', { gain: 0.35 });

  // ── shared Vatapi night city ──
  function city(lt, lk, fireA, moonA) {
    drawR(cliffR(), 620, 780, 540, 990, 1, lk, { d: 6 });
    drawX(cliffR(), 'moon', 620, 780, 540, 990, 1, moonA * 0.5);
    drawX(cliffR(), 'fire', 620, 780, 540, 990, 1, fireA * 0.6);
    drawR(cityR(), 540, 880, 540, 1250, 1, lk, { d: 10 });
    drawX(cityR(), 'moon', 540, 880, 540, 1250, 1, moonA * 0.55);
    ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, 1536); ctx.clip(); drawX(cityR(), 'fire', 540, 880, 540, 1250, 1, fireA * (0.75 + 0.25 * Math.sin(lt * 23))); ctx.restore();
  }
  // ── b10 Vatapi taken (night) ──
  add({ id: 'b10', at: tVat8, cam: [540, 900], zoom: 0.07, note: 'night sandstone Vatapi, carved moon, Badami cliffs with caves; granite lion banner drops onto the gate tower on taken',
    draw(lt, d, t) {
      const lk = LK(0.78 + 0.08 * lt / d), tk = tTaken - tVat8, dr = seg(lt, tk - 0.22, tk + 0.05), [sx, sy] = shake(lt - tk - 0.05, 7);
      ctx.save(); ctx.translate(sx, sy + lerp(-20, 20, lt / d));
      bg('s'); drawR(discR('b:moon', SS, false), 150, 150, 880, 190, 0.7, lk, { d: 6 });
      city(lt, lk, seg(lt, d - 0.6, d) * 0.4, 1);
      ctx.fillStyle = 'rgba(12,16,28,0.5)'; ctx.fillRect(-300, -300, W + 600, H + 600);
      drawX(cityR(), 'moon', 540, 880, 540, 1250, 1, 0.3); drawX(cliffR(), 'moon', 620, 780, 540, 990, 1, 0.25);
      glow(880, 190, 240, '170,190,230', 0.25);
      if (dr > 0) { const by = lerp(-500, 690, dr * dr); drawR(bannerR('lion'), 40, 1020, 540, by, 0.5, lk, { d: 7 }); glow(540 + 90, by - 380, 160, '200,210,235', 0.1); }
      ctx.restore();
      puff(540, 692, lt - tk - 0.05, 0.6, '150,150,170', 5, 3);
      if (lt > d - 0.8) glow(540, 1350, 700, '255,120,40', 0.3 * seg(lt, d - 0.8, d));
      rake(lk, { dark: 0.4, beam: 0.05, col: '150,170,220' }); vignette(1);
    } });
  cue(tTaken + 0.04, 'thud', { gain: 0.75 }); cue(tTaken + 0.06, 'drum', { gain: 0.45 });

  // ── b11 burned (fire light on stone) ──
  add({ id: 'b11', at: tSaid, cam: [540, 860], zoom: 0.09, note: 'FIRE LIGHT ON STONE: Vatapi lit orange from below, carved flames on walls/roofs, sparks, smoke; ACCOUNTS SAY',
    draw(lt, d, t) {
      const lk = LK(0.5 + 0.06 * Math.sin(lt * 3)), fl = 0.85 + 0.15 * Math.sin(lt * 17) * Math.sin(lt * 7.3), grow = eo(seg(lt, 0, 0.9));
      ctx.save(); ctx.translate(540, 1000); ctx.scale(1.28, 1.28); ctx.translate(-540 + lerp(30, -30, lt / d), -1000);
      bg('s'); city(lt, lk, 0, 0);
      ctx.restore();
      ctx.fillStyle = 'rgba(14,10,14,0.7)'; ctx.fillRect(-300, -300, W + 600, H + 600);
      smoke(380, 640, lt + 2, 6, '40,30,30', 0.45, 160, 720); smoke(760, 600, lt + 5, 6, '40,30,30', 0.4, 160, 700);
      ctx.save(); ctx.translate(540, 1000); ctx.scale(1.28, 1.28); ctx.translate(-540 + lerp(30, -30, lt / d), -1000);
      ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, 1536); ctx.clip(); drawX(cityR(), 'fire', 540, 880, 540, 1250, 1, fl); drawX(cityR(), 'fire', 540, 880, 540, 1250 + 3, 1, fl * 0.6); ctx.restore();
      drawX(cliffR(), 'fire', 620, 780, 540, 990, 1, fl * 0.45);
      const F_ = [[110, 952], [300, 1006], [470, 922], [610, 922], [770, 1006], [930, 952], [205, 900], [880, 860], [700, 900], [380, 908], [1010, 1000], [40, 1000]];
      F_.forEach(([x, y], i) => flame(x, y, 64 + (i % 3) * 14, (130 + (i % 4) * 34) * grow, lt, i * 1.7));
      ctx.restore();
      glow(540, 1250, 900, '255,120,40', 0.36 * fl); glow(300, 1050, 420, '255,170,80', 0.2 * fl); glow(800, 1050, 420, '255,170,80', 0.2 * fl);
      sparks(lt, 70, 0, W, 1250, 1000, 7, 0.9);
      ctx.fillStyle = lg(0, 0, 0, 700, [[0, 'rgba(8,6,10,0.55)'], [1, 'rgba(8,6,10,0)']]); ctx.fillRect(-300, -300, W + 600, 1000);
      vignette(1);
      plaque('ACCOUNTS SAY', 540, 200, seg(lt, 0.1, 0.45), -0.05, 1.05);
    } });
  cue(tSaid, 'sizzle', { gain: 0.6 }); cue(tSaid + 0.1, 'rumble', { gain: 0.5 }); cue(tBurn, 'sizzle', { gain: 0.5 }); cue(tSaid + 0.15, 'pop', { gain: 0.3 });

  // ── b12 the king takes a title ──
  add({ id: 'b12', at: T9, cam: [540, 700], zoom: 0.08, note: 'granite king raises his sword under an empty carved cartouche, lion banner; tilt up, chisel arrives',
    draw(lt, d, t) {
      const lk = LK(lerp(0.1, 0.55, eio(lt / d))), ty = lerp(0, -50, eio(lt / d)), ch = seg(t, tTitle - 0.2, tTitle + 0.25);
      ctx.save(); ctx.translate(0, ty);
      bg('gf'); band(1250, 40, lk, GR, 110, 970);
      drawR(cartR(), 500, 330, 540, 340, 0.68, lk, { d: 7 });
      drawR(bannerR('lion'), 40, 1020, 780, 1250, 0.66, lk, { d: 7 });
      drawR(kingR('g', 'raise'), 300, 1300, 380, 1250, 0.66, lk, { d: 10 });
      const tip = [lerp(1200, 250, eo(ch)), lerp(120, 330, eo(ch))];
      chisel(tip[0], tip[1], -0.7, Math.max(0, Math.sin(lt * 30)) * seg(ch, 0.9, 1), ch);
      chips(lt, tTitle - T9 + 0.2, d, 10, 31, () => tip, [GR.lt, GR.base]);
      ctx.restore();
      motes(lt, 28, 0.4, 12);
      rake(lk, { dark: 0.5, beam: 0.18, col: '255,220,160' }); vignette(0.9);
    } });
  cue(T9, 'swell', { gain: 0.4 }); cue(tTitle + 0.2, 'chisel', { gain: 0.35 });

  // ── b13 VATAPIKONDA ──
  add({ id: 'b13', at: tVk, cam: [540, 640], zoom: 0.07, note: 'VATAPI/KONDA chip-carved into the granite cartouche, note: the one who took Vatapi; light sweep; TITLE',
    draw(lt, d, t) {
      const lk = LK(lerp(0.12, 0.9, eio(lt / d))), R1 = textR('b:tVAT', 'VATAPI', 860, 300, GR), R2 = textR('b:tKON', 'KONDA', 760, 300, GR);
      const p1 = eio(seg(lt, 0.02, 0.5)), p2 = eio(seg(lt, 0.5, 0.95));
      const x0a = 540 - R1.w / 2 + 30, x1a = 540 + R1.w / 2 - 30, x0b = 540 - R2.w / 2 + 30, x1b = 540 + R2.w / 2 - 30;
      bg('gf');
      drawR(cartR(), 500, 330, 540, 640, 1, lk, { d: 8 });
      drawTextReveal(R1, 540, 510, 1, lk, p1 >= 1 ? 9999 : lerp(x0a, x1a, p1));
      drawTextReveal(R2, 540, 790, 1, lk, p2 >= 1 ? 9999 : p2 <= 0 ? -999 : lerp(x0b, x1b, p2));
      const tip = (ts) => (ts < 0.5 ? [lerp(x0a, x1a, eio(seg(ts, 0.02, 0.5))), 510 + Math.sin(ts * 30) * 100] : [lerp(x0b, x1b, eio(seg(ts, 0.5, 0.95))), 790 + Math.sin(ts * 30) * 100]);
      const [cx_, cy_] = tip(Math.min(lt, 0.95));
      chips(lt, 0.02, 0.98, 60, 51, tip, [GR.lt, GR.base, '#EEEAE2', GR.dk]);
      puff(cx_, cy_, (lt * 4) % 1, 0.5, '200,196,186', 3, Math.floor(lt * 4));
      chisel(cx_, cy_, -0.75, Math.max(0, Math.sin(lt * 40)), clamp((1.15 - lt) * 5));
      carveTxt('“the one who took Vatapi”', 540, 1070, 54, GR, lk, seg(t, tOne - 0.25, tOne + 0.25), '700 ', 'Caladea', 1);
      // a fire-gold glint runs through the letters at the end
      const gx = lerp(-200, 1300, seg(t, tVat9 - 0.1, tVat9 + 0.9));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg(gx - 160, 0, gx + 160, 0, [[0, 'rgba(255,170,80,0)'], [0.5, 'rgba(255,170,80,0.22)'], [1, 'rgba(255,170,80,0)']]); ctx.fillRect(gx - 160, 300, 320, 660); ctx.restore();
      motes(lt, 24, 0.35, 14);
      rake(lk, { dark: 0.5, beam: 0.15 }); vignette(0.85);
      plaque('TITLE', 540, 200, seg(lt, 0.9, 1.2), -0.06, 1.2);
    } });
  cue(tVk + 0.02, 'chisel', { gain: 0.5 }); cue(tVk + 0.5, 'chisel', { gain: 0.5 }); cue(tVk + 0.95, 'pop', { gain: 0.35 }); cue(tOne - 0.1, 'bell', { gain: 0.4 });
}
