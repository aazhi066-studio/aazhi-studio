// EPISODE 10 · worker A : "Raking-Light Stone Relief", lines 0-4 (hook 642 + burning capital, Vatapi = Badami = revenge, Pulakeshin II marches south, Pullalur, disputed result)
//   a1  night sandstone slab: a chisel cuts "642" in two rows (chips + dust), a carved sandstone city below with relief flames, fire light from below, sparks; 642 CE plaque
//   a2  FRIEZE TRACK along a long granite frieze of marching Pallava spearmen, war elephants and lion banners; low sun sweeps; MARCHING NORTH plaque with arrow
//   a3  closer night city relief burning: carved flames on every roof, fire light flicker, smoke + sparks rise; ACCOUNTS SAY plaque pops on "said"
//   a4  SLAB SLIDE: a red sandstone tablet drops in with a thud + dust skirt, a chisel cuts VATAPI into it, raking light sweeps across
//   a5  a second slab slides in from the right: BADAMI carved over a sandstone cliff relief with cave-temple openings above a sunk lake; TODAY plaque
//   a6  granite Pallava lion relief, REVENGE carved above, fire light rising from the lower right, sparks, light swings
//   a7  EROSION in reverse: a weathered boar (varaha) roundel, sand blows away and lichen recedes as time rewinds; c. 618 CE plaque
//   a8  CHISEL CHIP REVEAL of Pulakeshin II: red sandstone king relief in an arched niche, boar pennant waves; name plaque + ILLUSTRATION
//   a9  RELIEF MAP: granite peninsula on a sunk sea; a carved route channel fills with fire-orange from VATAPI south-east to KANCHI, boar marker rides it
//   a10 FRIEZE TRACK at Pullalur: sandstone boar-banner army meets granite lion-banner army on a split frieze; PULLALUR + NEAR KANCHI plaques
//   a11 granite Mahendravarman relief revealed by a sweeping sunbeam (mica glints), lion pennant waves; name plaque + ILLUSTRATION
//   a12 split slab (sandstone | granite): the two kings face each other, a chisel cuts a big "?" across the seam, the light swings side to side
//   a13 sandstone stele with a boar emblem: rows of abstract unreadable nicks are chiselled in; CHALUKYA RECORD plaque, CLAIMS VICTORY plaque slaps on
//   a14 granite stele with a lion emblem: rows of nicks, the light flips to the opposite side on "read"; PALLAVA RECORDS plaque
//   a15 both steles slide together from the sides (thud + dust), the light swings, DISPUTED plaque slams down between them
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { lg, rgba, mixc, cached, blit } from './art.js';

const PI = Math.PI, sin = Math.sin, cos = Math.cos;
const SA = { base: '#A4553A', light: '#D88A62', dark: '#5A2A1C' }, GR = { base: '#8C8A85', light: '#C9C5BC', dark: '#3F3D3A' };
const FIRE = '#FF8A2A', FIRE2 = '#FFD27A';
const ST = (k) => (k === 'sand' ? SA : GR);

// ───────────── light state (direction TOWARD the light, shadow length, rim strength) ─────────────
const LT = { x: -0.7, y: -0.7, d: 9, k: 1 };
function light(deg, d = 9, k = 1) { const a = deg * PI / 180; LT.x = cos(a); LT.y = sin(a); LT.d = d; LT.k = k; }

// ───────────── stone textures ─────────────
function tileImg(kind) {
  return cached('a:tile:' + kind, 512, 512, 1, () => {
    const S = ST(kind), sand = kind === 'sand', sd = sand ? 0 : 500;
    ctx.fillStyle = S.base; ctx.fillRect(0, 0, 512, 512);
    const wrapE = (x, y, rx, ry, rot) => { for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) { ctx.beginPath(); ctx.ellipse(x + ox, y + oy, rx, ry, rot, 0, TAU); ctx.fill(); } };
    for (let i = 0; i < 70; i++) { ctx.fillStyle = rgba(i % 2 ? S.light : S.dark, 0.04 + rnd(i * 3.7 + sd) * 0.06); wrapE(rnd(i + sd) * 512, rnd(i * 2.3 + sd) * 512, 30 + rnd(i * 5 + sd) * 90, 20 + rnd(i * 7 + sd) * 50, sand ? 0 : rnd(i * 9) * PI); }
    if (sand) {
      for (let i = 0; i < 30; i++) {
        const y0 = rnd(i * 5.1) * 512, th = 3 + rnd(i * 2.2) * 16, k = 1 + Math.floor(rnd(i * 4.4) * 2), ph = rnd(i * 6.6) * TAU, amp = 2 + rnd(i * 8.8) * 5;
        ctx.fillStyle = rgba(rnd(i * 1.1) > 0.5 ? S.light : S.dark, 0.05 + rnd(i * 9) * 0.09);
        for (const oy of [-512, 0, 512]) { ctx.beginPath(); for (let x = 0; x <= 512; x += 16) ctx.lineTo(x, oy + y0 + sin(x / 512 * TAU * k + ph) * amp); for (let x = 512; x >= 0; x -= 16) ctx.lineTo(x, oy + y0 + th + sin(x / 512 * TAU * k + ph + 0.6) * amp); ctx.closePath(); ctx.fill(); }
      }
      for (let i = 0; i < 5000; i++) { ctx.fillStyle = rgba(i % 2 ? '#F0B48A' : '#3A1810', 0.08 + rnd(i * 1.3) * 0.16); const s = 1 + rnd(i * 2.9) * 1.6; ctx.fillRect(rnd(i * 1.7) * 512, rnd(i * 3.1) * 512, s, s); }
    } else {
      for (let i = 0; i < 9000; i++) {
        const r = rnd(i * 1.9 + 7), s = 0.8 + rnd(i * 2.7) * (r < 0.3 ? 2.6 : 1.6);
        ctx.fillStyle = r < 0.3 ? rgba('#1A1918', 0.35 + rnd(i) * 0.45) : r < 0.42 ? rgba('#F4F1EA', 0.3 + rnd(i * 4) * 0.5) : rgba(i % 2 ? '#B5B1A8' : '#5E5C58', 0.25);
        ctx.fillRect(rnd(i * 1.3) * 512, rnd(i * 3.7) * 512, s, s * (0.6 + rnd(i * 5.1) * 0.8));
      }
    }
  });
}
const PATS = {};
const pat = (kind) => PATS[kind] || (PATS[kind] = ctx.createPattern(tileImg(kind), 'repeat'));

/** the background slab (sunk plane): covers -240..W+240 x -240..H+240 */
function slabImg(kind) {
  return cached('a:slab:' + kind, W + 480, H + 480, 1, () => {
    const S = ST(kind), w = W + 480, h = H + 480;
    ctx.fillStyle = pat(kind); ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 36; i++) { const x = rnd(i * 3.3 + 1) * w, y = rnd(i * 5.7 + 2) * h, r = 160 + rnd(i * 7.1) * 420, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(i % 2 ? S.light : S.dark, 0.1)); g.addColorStop(1, rgba(S.dark, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    ctx.fillStyle = rgba(S.dark, 0.22); ctx.fillRect(0, 0, w, h);
  });
}
const bg = (kind, px = 0, py = 0) => blit(slabImg(kind), 240, 240, px, py);
const vigImg = () => cached('a:vig', W, H, 0.5, () => { const g = ctx.createRadialGradient(540, 860, 300, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,4,2,0.62)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); });
const vig = () => blit(vigImg(), 0, 0, 0, 0);

// ───────────── shape helpers (fill with the current style). DET = detail pass (incised lines) ─────────────
let DET = false;
const Fp = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.fill(); };
const Fe = (x, y, rx, ry, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fill(); };
const Fr = (x, y, w, h, r = 0) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
const Fl = (pts, w, cap = 'round') => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.lineWidth = w; ctx.lineCap = cap; ctx.lineJoin = 'round'; ctx.stroke(); };
const Se = (x, y, rx, ry, w, a0 = 0, a1 = TAU) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, a0, a1); ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke(); };
const Fa = (cx, cy, r, a0, a1, w) => { ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.lineWidth = w; ctx.lineCap = 'butt'; ctx.stroke(); };
const at = (x, y, s, fn, dir = 1) => { ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); fn(); ctx.restore(); };

// ───────────── RELIEF RENDER: cached face / shadow / rim; light offsets each frame ─────────────
function relief(key, kind, bb, fn, q = 1) {
  const [x0, y0, x1, y1] = bb, w = x1 - x0, h = y1 - y0, S = ST(kind);
  const mk = (sfx, col) => cached(`a:${key}:${sfx}`, w, h, q, () => { ctx.translate(-x0, -y0); ctx.fillStyle = ctx.strokeStyle = col; DET = false; fn(); });
  const d = mk('d', S.dark), l = mk('l', S.light);
  const f = cached(`a:${key}:f`, w, h, q, () => {
    ctx.translate(-x0, -y0); ctx.fillStyle = ctx.strokeStyle = '#000'; DET = false; fn();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = pat(kind); ctx.fillRect(x0, y0, w, h); ctx.fillStyle = rgba(S.light, 0.13); ctx.fillRect(x0, y0, w, h);
    DET = true;
    ctx.save(); ctx.translate(1.4, 1.6); ctx.fillStyle = ctx.strokeStyle = rgba(S.light, 0.6); fn(); ctx.restore();
    ctx.fillStyle = ctx.strokeStyle = rgba(S.dark, 0.72); fn();
    DET = false;
  });
  return { d, l, f, ox: -x0, oy: -y0 };
}
/** draw a relief with its local (0,0) at (x, y), scale s; dep scales the cast shadow */
function R(r, x, y, s = 1, a = 1, dep = 1) {
  const D = LT.d * dep * s;
  blit(r.d, r.ox, r.oy, x - LT.x * D, y - LT.y * D, s, a * 0.42);
  blit(r.d, r.ox, r.oy, x - LT.x * D * 0.5, y - LT.y * D * 0.5, s, a * 0.5);
  blit(r.l, r.ox, r.oy, x + LT.x * 2.6 * s, y + LT.y * 2.6 * s, s, a * 0.85 * LT.k);
  blit(r.f, r.ox, r.oy, x, y, s, a);
}
/** direct (uncached) relief for small animated shapes */
function RD(kind, fn, dep = 0.6) {
  const S = ST(kind), D = LT.d * dep;
  ctx.save(); ctx.translate(-LT.x * D, -LT.y * D); ctx.globalAlpha *= 0.6; ctx.fillStyle = ctx.strokeStyle = S.dark; fn(); ctx.restore();
  ctx.save(); ctx.translate(LT.x * 2.4, LT.y * 2.4); ctx.globalAlpha *= 0.85 * LT.k; ctx.fillStyle = ctx.strokeStyle = S.light; fn(); ctx.restore();
  ctx.save(); ctx.fillStyle = ctx.strokeStyle = pat(kind); fn(); ctx.fillStyle = ctx.strokeStyle = rgba(S.light, 0.14); fn(); ctx.restore();
}

// ───────────── CARVED (incised) TEXT ─────────────
function cutImg(key, txt, size, kind, font = 'Inter', wt = 900) {
  const S = ST(kind), F = `${wt} ${size}px ${font}`, sp = Math.round(size * 0.06);
  ctx.save(); ctx.font = F; ctx.letterSpacing = `${sp}px`; const tw = ctx.measureText(txt).width; ctx.restore();
  const w = Math.ceil(tw + size * 0.5), h = Math.ceil(size * 1.25);
  const mk = (sfx, fill) => cached(`a:cut:${key}:${sfx}`, w, h, 1, () => {
    ctx.font = F; ctx.letterSpacing = `${sp}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = typeof fill === 'string' ? fill : '#000'; ctx.fillText(txt, w / 2 + sp / 2, h / 2 + size * 0.05);
    if (typeof fill !== 'string') { ctx.globalCompositeOperation = 'source-atop'; fill(); }
  });
  return {
    sh: mk('s', mixc(S.dark, '#000000', 0.25)), l: mk('l', S.light),
    f: mk('f', () => { ctx.fillStyle = pat(kind); ctx.fillRect(0, 0, w, h); ctx.fillStyle = rgba(S.dark, 0.32); ctx.fillRect(0, 0, w, h); }), w, h,
  };
}
let SC = null;
function CUT(c, x, y, s = 1, a = 1) {
  const w = c.w, h = c.h;
  if (!SC) SC = document.createElement('canvas');
  if (SC.width < w || SC.height < h) { SC.width = Math.max(SC.width, w); SC.height = Math.max(SC.height, h); }
  const g = SC.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  g.drawImage(c.sh, 0, 0); g.globalCompositeOperation = 'source-atop'; const D = Math.max(3, LT.d * 0.7); g.drawImage(c.f, -LT.x * D, -LT.y * D); g.globalCompositeOperation = 'source-over';
  const dw = w * s, dh = h * s, dx = x - dw / 2, dy = y - dh / 2;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.save(); ctx.globalAlpha *= 0.7 * LT.k; ctx.drawImage(c.l, dx - LT.x * 2 * s, dy - LT.y * 2 * s, dw, dh); ctx.restore();
  ctx.drawImage(SC, 0, 0, w, h, dx, dy, dw, dh); ctx.restore();
}

// ───────────── BRONZE PLAQUES ─────────────
function plaqueImg(txt, size, arrow) {
  {
    const key = `a:plq:${txt}:${size}:${arrow ? 1 : 0}`;
    ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = `${Math.round(size * 0.12)}px`; const tw = ctx.measureText(txt).width; ctx.restore();
    const aw = arrow ? size * 1.1 : 0, w = Math.ceil(tw + aw + size * 2.4), h = Math.ceil(size * 1.85);
    const c = cached(key, w, h, 1, () => {
      ctx.beginPath(); ctx.roundRect(0, 0, w, h, size * 0.2); ctx.fillStyle = '#4A3512'; ctx.fill();
      ctx.beginPath(); ctx.roundRect(3, 3, w - 6, h - 6, size * 0.17); ctx.fillStyle = lg(0, 0, w * 0.4, h * 1.4, [[0, '#E6C47A'], [0.35, '#C29A4C'], [0.7, '#9C7834'], [1, '#7A5A24']]); ctx.fill();
      for (let i = 0; i < 160; i++) { ctx.fillStyle = rgba(i % 3 ? '#5A3E14' : '#FFF0C0', 0.08 + rnd(i * 2.1) * 0.12); ctx.fillRect(4 + rnd(i * 1.3) * (w - 8), 4 + rnd(i * 3.3) * (h - 8), 2, 2); }
      const ins = size * 0.28;
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,236,180,0.55)'; ctx.beginPath(); ctx.roundRect(ins + 1.5, ins + 1.5, w - ins * 2, h - ins * 2, 4); ctx.stroke();
      ctx.strokeStyle = 'rgba(50,32,8,0.7)'; ctx.beginPath(); ctx.roundRect(ins, ins, w - ins * 2, h - ins * 2, 4); ctx.stroke();
      ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = `${Math.round(size * 0.12)}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tx = w / 2 - aw / 2 + size * 0.06, ty = h / 2 + size * 0.05;
      ctx.fillStyle = 'rgba(255,236,170,0.55)'; ctx.fillText(txt, tx + 1.5, ty + 2); ctx.fillStyle = '#2E1E08'; ctx.fillText(txt, tx, ty);
      if (arrow) { const ax = tx + tw / 2 + size * 0.55, ay = h / 2; const A = [[ax, ay - size * 0.5], [ax + size * 0.42, ay + size * 0.05], [ax + size * 0.14, ay + size * 0.05], [ax + size * 0.14, ay + size * 0.5], [ax - size * 0.14, ay + size * 0.5], [ax - size * 0.14, ay + size * 0.05], [ax - size * 0.42, ay + size * 0.05]];
        ctx.save(); ctx.translate(1.5, 2); ctx.fillStyle = 'rgba(255,236,170,0.55)'; Fp(A); ctx.restore(); ctx.fillStyle = '#2E1E08'; Fp(A); }
      for (const rx of [size * 0.62, w - size * 0.62]) { const g = ctx.createRadialGradient(rx - 3, h / 2 - 3, 1, rx, h / 2, size * 0.2); g.addColorStop(0, '#FFF2C8'); g.addColorStop(0.5, '#B08A42'); g.addColorStop(1, '#4A3512'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(rx, h / 2, size * 0.17, 0, TAU); ctx.fill(); }
    });
    c._w = w; c._h = h; return c;
  }
}
/** bronze plaque centred at (x, y); p = 0..1 pop-in progress */
function plaque(txt, x, y, p, size = 38, o = {}) {
  const k = clamp(p); if (k <= 0) return;
  const c = plaqueImg(txt, size, o.arrow), w = c._w, h = c._h, s = (o.s ?? 1) * (0.55 + 0.45 * eob(k));
  ctx.save(); ctx.translate(x, y - (1 - eo(k)) * (o.drop ?? 30)); ctx.rotate(o.rot ?? 0); ctx.scale(s, s); ctx.globalAlpha *= Math.min(1, k * 4);
  ctx.fillStyle = 'rgba(10,5,2,0.45)'; ctx.beginPath(); ctx.roundRect(-w / 2 + 6, -h / 2 + 9, w, h, size * 0.2); ctx.fill();
  ctx.drawImage(c, -w / 2, -h / 2, w, h);
  if (o.t != null) { const gx = -w / 2 + ((o.t * 0.5) % 1.6) * w * 1.1 - w * 0.3; const g = ctx.createLinearGradient(gx - 60, 0, gx + 60, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.5, 'rgba(255,240,200,0.28)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(Math.max(-w / 2 + 4, gx - 60), -h / 2 + 4, Math.min(120, w / 2 - 4 - (gx - 60)), h - 8); }
  ctx.restore();
}

// ───────────── light & air ─────────────
function beam(pos, a = 0.16, col = '255,214,150', ang = -0.35, wd = 300) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(540, 960); ctx.rotate(ang); const x = (pos - 0.5) * 2300;
  const g = ctx.createLinearGradient(x - wd, 0, x + wd, 0); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - wd, -1500, wd * 2, 3000); ctx.restore();
}
/** directional falloff: light side warm, far side dim (multiply) */
function wash(a = 0.45, warm = '#FFF0D8') {
  const g = ctx.createLinearGradient(540 + LT.x * 1100, 960 + LT.y * 1100, 540 - LT.x * 1100, 960 - LT.y * 1100);
  g.addColorStop(0, warm); g.addColorStop(1, mixc('#FFFFFF', '#3A2E3A', a));
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800); ctx.restore();
}
/** night + fire light from (fx, fy): multiply the lit scene down, then add a flickering glow */
function night(t, fx, fy, r = 1400, k = 1) {
  const fl = 0.88 + 0.12 * sin(t * 13) * sin(t * 7.3 + 1);
  const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, r * fl);
  g.addColorStop(0, '#FFD8A0'); g.addColorStop(0.35, '#E08A50'); g.addColorStop(0.7, '#5A3A3A'); g.addColorStop(1, '#151A26');
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  ctx.globalCompositeOperation = 'lighter'; const g2 = ctx.createRadialGradient(fx, fy, 0, fx, fy, r * 0.7); g2.addColorStop(0, `rgba(255,120,40,${0.22 * k * fl})`); g2.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g2; ctx.fillRect(fx - r, fy - r, r * 2, r * 2);
  ctx.restore();
}
function glow(x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
function sparks(t, n, x0, x1, yb, rise, seed = 0, a = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ph = (t * (0.3 + rnd(seed + i) * 0.45) + rnd(seed + i * 1.7)) % 1, x = x0 + rnd(seed + i * 2.3) * (x1 - x0) + sin(t * 2.3 + i) * 34 * ph, y = yb - ph * rise, r = (1.6 + rnd(i * 3.1 + seed) * 3.2) * (1 - ph * 0.6);
    ctx.globalAlpha = a * (1 - ph) * Math.min(1, ph * 10); ctx.fillStyle = i % 3 ? '#FFB050' : '#FFE6A0'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function smokeW(t, n, x0, x1, yb, rise, seed = 0, a = 0.3) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.16 + rnd(seed + i * 1.3)) % 1, x = x0 + rnd(seed + i * 2.9) * (x1 - x0) + sin(ph * 4 + i) * 60, y = yb - ph * rise, r = 60 + ph * 200;
    glow(x, y, r, '28,22,24', a * Math.min(1, ph * 5) * (1 - ph));
  }
}
function motes(t, n, seed = 0, col = '255,228,180', a = 0.5) {
  for (let i = 0; i < n; i++) { const x = (rnd(i + seed) * 1300 + t * (10 + rnd(i * 3 + seed) * 22)) % 1300 - 110, y = (rnd(i * 7 + seed) * 1500 + 120 - t * 9 * rnd(i + 4)) % 1500 + 60, r = 1.4 + rnd(i * 9) * 2.4; ctx.fillStyle = `rgba(${col},${a * (0.4 + 0.6 * (0.5 + 0.5 * sin(t * 1.7 + i)))})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
}

// ───────────── CHISEL CHIP REVEAL ─────────────
function rowsTip(x, y, w, h, p, rows, m) {
  const tot = rows * clamp(p), full = Math.min(rows - 1, Math.floor(tot)), f = tot - full, rh = h / rows, ltr = full % 2 === 0;
  return [ltr ? x - m + f * (w + 2 * m) : x + w + m - f * (w + 2 * m), y + full * rh + rh * 0.5, full, f, ltr, rh];
}
/** clip to the chiselled part (boustrophedon rows with a ragged front). Returns the tip, or null when complete */
function rowsClip(x, y, w, h, p, rows = 3, m = 40) {
  if (p >= 1) return null;
  const [fx, ty, full, f, ltr, rh] = rowsTip(x, y, w, h, p, rows, m);
  ctx.beginPath();
  if (full > 0) ctx.rect(x - m - 60, y - m - 60, w + 2 * m + 120, full * rh + m + 60);
  if (f > 0) {
    const ry = y + full * rh, top = ry - (full ? 0 : m + 60), bot = ry + rh + (full === rows - 1 ? m + 60 : 0), xs = ltr ? x - m - 60 : x + w + m + 60, n = 9;
    ctx.moveTo(xs, top); ctx.lineTo(fx, top);
    for (let i = 0; i <= n; i++) ctx.lineTo(fx + (ltr ? 1 : -1) * (rnd(i * 3.1 + full * 13) - 0.5) * 22, ry + rh * i / n);
    ctx.lineTo(fx, bot); ctx.lineTo(xs, bot); ctx.closePath();
  }
  ctx.clip();
  return [fx, ty];
}
function chisel(x, y, t, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.55 + sin(t * 47) * 0.05); ctx.translate(0, -Math.abs(sin(t * 23)) * 6);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(10, -170, 18, 160);
  ctx.fillStyle = lg(-8, 0, 8, 0, [[0, '#E8E6E0'], [0.5, '#A9A59E'], [1, '#5A5650']]); Fp([[0, 0], [-8, -28], [8, -28]]);
  ctx.fillStyle = lg(-8, 0, 8, 0, [[0, '#9A968E'], [0.4, '#D8D4CC'], [1, '#4E4A44']]); Fr(-7, -170, 14, 144, 2);
  ctx.fillStyle = '#3A3632'; Fr(-9, -184, 18, 18, 3); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-4, -166, 3, 136);
  ctx.restore();
}
/** stone chips + dust from a moving tip. tipAt(tt) gives the tip position at time tt (or null) */
function chips(lt, t0, t1, tipAt, col = '#E0A27A', n = 3) {
  const dt = 0.035, life = 0.55; let te = t0 + Math.max(0, Math.ceil((lt - life - t0) / dt)) * dt;
  for (; te <= Math.min(lt, t1); te += dt) {
    const age = lt - te, tp = tipAt(te); if (!tp) continue; const k = Math.round(te * 1000);
    if (k % 3 === 0) glow(tp[0] + age * 40, tp[1] - age * 50, 18 + age * 110, '235,205,170', 0.22 * (1 - age / life));
    for (let j = 0; j < n; j++) {
      const vx = (rnd(k * 1.3 + j * 7.1) - 0.35) * 520, vy = -140 - rnd(k * 2.7 + j * 3.3) * 380, px = tp[0] + vx * age, py = tp[1] + vy * age + 1100 * age * age, sz = 3 + rnd(k + j * 5.5) * 6;
      ctx.save(); ctx.globalAlpha = 1 - age / life; ctx.translate(px, py); ctx.rotate(age * 14 + j); ctx.fillStyle = j % 2 ? col : '#F6E2C8'; ctx.beginPath(); ctx.moveTo(-sz / 2, -sz * 0.3); ctx.lineTo(sz * 0.5, -sz * 0.4); ctx.lineTo(sz * 0.2, sz * 0.4); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
}
/** one complete chisel reveal: clip, draw, then chisel + chips. box = [x, y, w, h] */
function chiselReveal(lt, t0, t1, box, rows, drawFn, col, m = 40) {
  const pf = (tt) => eio(seg(tt, t0, t1)), p = pf(lt);
  if (p <= 0) return;
  ctx.save(); const tip = rowsClip(box[0], box[1], box[2], box[3], p, rows, m); drawFn(); ctx.restore();
  if (!tip) return;
  chips(lt, t0, t1, (tt) => { const pp = pf(tt); return pp > 0 && pp < 1 ? rowsTip(box[0], box[1], box[2], box[3], pp, rows, m) : null; }, col);
  chisel(tip[0], tip[1], lt);
}
/** dust skirt where a slab lands */
function dustSkirt(x0, x1, y, age, a = 0.5) {
  if (age < 0 || age > 1.2) return; const k = 1 - age / 1.2;
  for (let i = 0; i < 14; i++) { const u = i / 13, side = u < 0.5 ? -1 : 1, x = lerp(x0, x1, u) + side * eo(clamp(age * 1.5)) * (60 + rnd(i * 3) * 120), r = 40 + age * 160 + rnd(i) * 40; glow(x, y - age * 50 * rnd(i * 2), r, '226,196,160', a * k * k); }
}

// ───────────── figures: faceless relief units (local units, feet at 0, facing right) ─────────────
function pennantShape(len, hh, wv = 0, t = 0) {
  const top = [], bot = [];
  for (let i = 0; i <= 8; i++) { const u = i / 8, y = sin(t * 4.2 - u * 4.5) * hh * 0.22 * u * wv; top.push([u * len, y]); bot.push([u * len, y + hh * (1 - 0.18 * u)]); }
  const e = top[8], eb = bot[8];
  return [...top, [e[0] - len * 0.16, (e[1] + eb[1]) / 2], ...bot.reverse()];
}
function emblem(kind) { if (kind === 'boar') boar(); else lion(); }
function staticPennant(x, y, len, hh, emb) {
  if (!DET) Fp(pennantShape(len, hh).map(([px, py]) => [x + px, y + py]));
  else if (emb) { const was = DET; DET = false; at(x + len * 0.42, y + hh * 0.72, hh / 80, () => emblem(emb)); DET = was; }
}
function soldier(ph = 0, o = {}) {
  const s = ph;
  if (!DET) {
    Fl([[-1, -47], [-3 - 5 * s, -24], [-6 - 9 * s, -3]], 4.4); Fl([[1, -47], [4 + 5 * s, -24], [7 + 9 * s, -3]], 4.4);
    Fe(-6 - 9 * s + 2.4, -1.6, 4.2, 1.9); Fe(7 + 9 * s + 2.4, -1.6, 4.2, 1.9);
    Fp([[-6, -58], [6, -58], [11, -38], [2, -42], [-9, -38]]);
    Fp([[-5, -57], [5, -57], [9.5, -77], [3, -81], [-4, -81], [-8.5, -77]]);
    Fr(-1.8, -87, 3.6, 9, 1.5); Fe(0.9, -91, 4.2, 5.4);
    Fp([[-3.6, -95], [4.6, -95], [2.3, -108], [0.3, -108]]); Fe(1.3, -108.5, 1.6, 1.6);
    Fl([[-6, -77], [-9, -64], [-5, -55]], 3.3);
    if (o.pole) { Fl([[6, -77], [12, -67], [14, -78]], 3.3); Fr(14.2, -150, 1.8, 142); staticPennant(16, -150, 30, 15); }
    else { Fl([[6, -77], [12, -66], [14.5, -75]], 3.3); Fp([[14.2, -8], [15.8, -8], [16.4, -118], [15, -118]]); Fp([[15.7, -133], [18.6, -121], [15.7, -115], [12.8, -121]]); Fe(-8.5, -64, 6.6, 9.6); }
  } else {
    Fl([[-6, -57.5], [6, -57.5]], 1.1); Fl([[-3.8, -97], [4.4, -97]], 0.9); Fl([[-3, -101], [3.4, -101]], 0.7);
    Fl([[-2, -50], [-1, -40]], 0.7); Fl([[3, -52], [6, -41]], 0.7);
    if (o.pole) staticPennant(16, -150, 30, 15, o.emb); else Se(-8.5, -64, 4.4, 7, 0.9);
  }
}
function king(o = {}) {
  if (!DET) {
    Fl([[-2, -47], [-4, -24], [-6, -3]], 5); Fl([[2, -47], [5, -24], [8, -3]], 5); Fe(-3.6, -1.6, 4.6, 2); Fe(10.4, -1.6, 4.6, 2);
    Fp([[-7, -59], [7, -59], [14, -33], [1, -38], [-12, -33]]); Fp([[-7, -56], [-13, -38], [-9, -37]]);
    Fp([[-5.5, -57], [5.5, -57], [11.5, -77], [4, -82.5], [-4, -82.5], [-10.5, -77]]);
    Fr(-2, -88, 4, 9, 1.5); Fe(0.8, -92, 4.5, 5.8);
    Fp([[-4.6, -96], [5.8, -96], [4.8, -104], [3.4, -114], [2, -122], [-0.5, -122], [-2, -114], [-3.4, -104]]); Fe(0.75, -123.5, 2, 2);
    Fe(-3.4, -89, 1.4, 2.6);
    Fl([[-8.5, -76], [-14, -64], [-8, -57]], 3.7);
    Fl([[8.5, -76], [15, -69], [17, -81]], 3.7);
    Fp([[-10, -56], [-8.6, -55], [-21, -27], [-22.6, -28.5]]); Fr(-12.5, -59, 6, 2.6, 1);
    if (o.pole !== false) Fr(16.6, -158, 1.9, 150);
  } else {
    Fl([[-4.2, -100], [5.4, -100]], 1); Fl([[-3, -108], [4, -108]], 0.9); Fl([[-1.6, -115], [3.2, -115]], 0.8);
    Se(1, -80, 6.5, 4.5, 0.9, 0.2, PI - 0.2); Fl([[-6.5, -58], [6.5, -58]], 1.3); Fl([[-6.8, -61], [6.8, -61]], 0.8);
    Se(-12.4, -66, 2.2, 1.2, 0.8); Se(13.5, -71, 1.8, 1.2, 0.8);
    Fl([[-3, -52], [-6, -36]], 0.8); Fl([[2, -52], [6, -37]], 0.8); Fl([[7, -55], [12, -36]], 0.7);
  }
}
function elephant() {
  if (!DET) {
    Fl([[-44, -62], [-50, -46], [-49, -33]], 2.6);
    Fr(-38, -42, 13, 42, 4); Fr(-19, -40, 13, 40, 4); Fr(13, -42, 13, 42, 4); Fr(27, -40, 12, 40, 4);
    Fe(-4, -58, 42, 28); Fe(30, -66, 17, 20); Fl([[42, -64], [50, -46], [50, -24], [56, -11]], 7.5);
    Fl([[40, -50], [50, -47], [55, -54]], 2.8);
    Fp([[-25, -86], [17, -86], [22, -58], [-28, -58]]);
    Fe(-3, -96, 6, 11); Fe(-2, -111, 3.6, 4.4); Fp([[-5, -114], [1.5, -114], [-0.5, -125], [-2.6, -125]]);
  } else {
    Se(24, -64, 9, 15, 1.1); Fl([[-25, -78], [19, -78]], 1); Fl([[-27, -64], [21, -64]], 1);
    for (let i = 0; i < 5; i++) Fl([[-20 + i * 9, -76], [-20 + i * 9, -66]], 0.8);
    Fl([[-38, -32], [-28, -32]], 0.8); Fl([[13, -32], [24, -32]], 0.8);
  }
}
function lion() {
  if (!DET) {
    Fl([[-34, -40], [-46, -50], [-52, -64], [-46, -71]], 3.2); Fe(-45, -72, 4.2, 4.2);
    Fl([[-28, -30], [-30, -14], [-28, -2]], 7.5); Fl([[-14, -30], [-16, -14], [-13, -2]], 7.5); Fl([[16, -32], [18, -16], [16, -2]], 7.5); Fl([[24, -38], [36, -31], [45, -39]], 7);
    Fe(-4, -38, 34, 15); Fe(16, -42, 14, 16);
    const pts = []; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, r = i % 2 ? 15 : 22; pts.push([28 + cos(a) * r, -54 + sin(a) * r * 1.05]); } Fp(pts);
    Fe(38, -55, 10, 9); Fe(47, -50, 6.5, 5.5); Fp([[33, -63], [36, -71], [40, -63]]);
  } else {
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; Fl([[28 + cos(a) * 10, -54 + sin(a) * 10], [28 + cos(a) * 18, -54 + sin(a) * 18]], 1); }
    Fl([[45, -47], [52, -47]], 0.9); Se(-6, -38, 18, 8, 0.8, 0.3, 2.6); Fl([[-20, -30], [-18, -20]], 0.8); Fl([[10, -30], [12, -20]], 0.8);
  }
}
function boar() {
  if (!DET) {
    const b = [[-36, -38]]; for (let i = 0; i <= 10; i++) b.push([-34 + i * 6, -44 - (i % 2 ? 8 : 2) - sin(i / 10 * PI) * 4]); b.push([28, -40]); Fp(b);
    Fl([[-26, -16], [-27, -2]], 6); Fl([[-12, -14], [-12, -2]], 6); Fl([[14, -14], [15, -2]], 6); Fl([[26, -16], [28, -2]], 6);
    Fe(-2, -30, 36, 19); Fp([[22, -43], [46, -31], [57, -23], [56, -15], [44, -13], [22, -16]]); Fe(56.5, -19, 3.2, 4.8);
    Fp([[26, -42], [29, -56], [35, -43]]); Fl([[-37, -34], [-44, -30], [-42, -24]], 2.2); Fl([[47, -17], [51, -25], [48, -31]], 2.6);
  } else {
    for (let i = 0; i < 7; i++) Fl([[-28 + i * 8, -40], [-24 + i * 8, -30]], 0.9);
    Fl([[22, -40], [24, -18]], 1); Fl([[-30, -14], [-20, -15]], 0.8); Fl([[47, -17], [51, -25]], 0.8);
  }
}
/** an arched stele, top at y = 0, centred on x = 0 */
function stele(w, h) {
  if (!DET) { ctx.beginPath(); ctx.moveTo(-w / 2, h); ctx.lineTo(-w / 2, w / 2); ctx.arc(0, w / 2, w / 2, PI, 0); ctx.lineTo(w / 2, h); ctx.closePath(); ctx.fill(); Fr(-w / 2 - 34, h - 12, w + 68, 56, 6); }
  else { const i = 22; ctx.beginPath(); ctx.moveTo(-w / 2 + i, h - 30); ctx.lineTo(-w / 2 + i, w / 2); ctx.arc(0, w / 2, w / 2 - i, PI, 0); ctx.lineTo(w / 2 - i, h - 30); ctx.closePath(); ctx.lineWidth = 2.4; ctx.stroke(); Fl([[-w / 2 + i, w * 0.62], [w / 2 - i, w * 0.62]], 2); }
}
/** a carved frame: two pillars + an arch */
function niche(w, h, aw = 46) {
  if (!DET) { Fr(-w / 2 - aw, h * 0.0 + w / 2, aw, h - w / 2, 4); Fr(w / 2, w / 2, aw, h - w / 2, 4); Fa(0, w / 2, w / 2 + aw / 2, PI, TAU, aw); Fr(-w / 2 - aw - 26, h, w + aw * 2 + 52, 46, 5); Fe(0, -aw * 0.9, aw * 0.55, aw * 0.6); }
  else { for (const sx of [-1, 1]) { const px = sx * (w / 2 + aw / 2); for (let y = w / 2 + 60; y < h; y += 120) Fl([[px - aw / 2 + 6, y], [px + aw / 2 - 6, y]], 2); } Se(0, w / 2, w / 2 + aw / 2, w / 2 + aw / 2, 1.6, PI + 0.05, TAU - 0.05); }
}

// ───────────── a sandstone city (local: x 0..1000, ground ~330, wall runs down to 1240) ─────────────
const TEMPLES = [290, 700], HOUSES = [120, 430, 560, 830], TOWERS = [110, 500, 890];
function cityBack() {
  if (DET) { for (const cx of TEMPLES) for (let k = 0; k < 4; k++) { const w = 150 - k * 28, y = 250 - (k + 1) * 34; for (let j = 1; j < 4; j++) Fl([[cx - w / 2 + j * w / 4, y + 8], [cx - w / 2 + j * w / 4, y + 26]], 1.4); } return; }
  for (const x of HOUSES) { Fr(x, 262, 100, 90); Fp([[x - 14, 266], [x + 50, 206], [x + 114, 266]]); }
  for (const cx of TEMPLES) { Fr(cx - 85, 250, 170, 100); for (let k = 0; k < 4; k++) { const w = 150 - k * 28; Fr(cx - w / 2, 250 - (k + 1) * 34, w, 35, 4); } Fe(cx, 96, 28, 22); Fr(cx - 3, 42, 6, 40, 2); Fe(cx, 42, 7, 7); }
}
function cityFront() {
  if (DET) {
    for (let r = 0; r < 22; r++) { const y = 360 + r * 40; Fl([[0, y], [1000, y]], 1.2); for (let x = (r % 2) * 40 + 20; x < 1000; x += 80) Fl([[x, y], [x, y + 40]], 1); }
    ctx.beginPath(); ctx.moveTo(455, 470); ctx.lineTo(455, 400); ctx.arc(500, 400, 45, PI, 0); ctx.lineTo(545, 470); ctx.closePath(); ctx.fill();
    return;
  }
  Fr(0, 330, 1000, 910); for (let x = 8; x < 990; x += 48) Fr(x, 306, 28, 28, 3);
  for (const cx of TOWERS) { Fr(cx - 55, 214, 110, 1026, 3); for (let i = 0; i < 4; i++) Fr(cx - 55 + i * 30.5, 192, 18, 26, 3); }
}
const cityB = () => relief('acityB', 'sand', [-20, 20, 1020, 380], cityBack);
const cityF = () => relief('acityF', 'sand', [-20, 180, 1020, 1250], cityFront);
const FLAMES = [[290, 40, 1.1], [700, 40, 1.15], [120, 210, 0.75], [430, 210, 0.8], [560, 210, 0.8], [830, 210, 0.75], [110, 192, 0.7], [890, 192, 0.7], [500, 192, 0.65]];

/** carved relief flames (animated): three tongues, dark cast shadow, gold rim, glowing face */
function tongue(x, y, w, h, t, sd) {
  const sw = sin(t * 4.3 + sd) * w * 0.35, sw2 = sin(t * 6.1 + sd * 1.7) * w * 0.15;
  ctx.moveTo(x - w / 2, y); ctx.bezierCurveTo(x - w * 0.75, y - h * 0.4, x - w * 0.1 + sw2, y - h * 0.62, x + sw, y - h);
  ctx.bezierCurveTo(x + w * 0.22 + sw2, y - h * 0.58, x + w * 0.78, y - h * 0.36, x + w / 2, y); ctx.closePath();
}
function flames(x, y, sz, t, sd, grow = 1) {
  if (grow <= 0) return; const s = sz * grow;
  const path = (k = 1) => { ctx.beginPath(); tongue(x - s * 0.3, y, s * 0.5 * k, s * (0.78 + 0.14 * sin(t * 7 + sd)) * k, t, sd); tongue(x + s * 0.3, y, s * 0.5 * k, s * (0.7 + 0.14 * sin(t * 6.3 + sd * 2)) * k, t, sd + 3); tongue(x, y, s * 0.62 * k, s * (1.05 + 0.12 * sin(t * 8.1 + sd)) * k, t, sd + 6); };
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - s * 0.5, s * 1.3, '255,120,40', 0.35); ctx.restore();
  ctx.save(); ctx.translate(-LT.x * 7, -LT.y * 7); ctx.fillStyle = 'rgba(40,10,4,0.55)'; path(); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(LT.x * 2.5, LT.y * 2.5); ctx.fillStyle = FIRE2; path(); ctx.fill(); ctx.restore();
  ctx.fillStyle = lg(0, y, 0, y - s * 1.1, [[0, '#B2441A'], [0.5, FIRE], [1, FIRE2]]); path(); ctx.fill();
  ctx.fillStyle = 'rgba(255,236,170,0.55)'; ctx.beginPath(); tongue(x, y, s * 0.26, s * 0.55, t + 0.5, sd + 9); ctx.fill();
}

// ───────────── friezes ─────────────
const friezeFront = () => relief('afzF', 'gran', [0, 0, 3400, 640], () => {
  if (!DET) { Fr(0, 0, 3400, 30); Fr(0, 604, 3400, 36); for (let x = 0; x < 3400; x += 40) Fe(x + 20, 46, 13, 9); }
  else { Fl([[0, 616], [3400, 616]], 2); }
  for (let i = 0; i < 21; i++) {
    const x = 120 + i * 158; if ((x > 990 && x < 1330) || (x > 2240 && x < 2580)) continue;
    at(x, 600, 3.7, () => soldier(sin(i * 1.7) * 0.9, { pole: i % 5 === 2, emb: 'lion' }));
  }
  for (const x of [1160, 2410]) at(x, 600, 3.5, elephant);
});
const friezeBack = () => relief('afzB', 'gran', [0, 0, 3400, 640], () => {
  for (let i = 0; i < 22; i++) at(60 + i * 158, 570, 3.0, () => soldier(sin(i * 2.3 + 1) * 0.8, {}));
});
const armies = (kind) => relief('afz2' + kind, kind, kind === 'sand' ? [0, 0, 1240, 640] : [1160, 0, 2400, 640], () => {
  const sand = kind === 'sand', x0 = sand ? 0 : 1160, x1 = sand ? 1240 : 2400;
  if (!DET) { Fr(x0, 0, x1 - x0, 30); Fr(x0, 604, x1 - x0, 36); for (let x = x0; x < x1; x += 40) Fe(x + 20, 46, 13, 9); } else Fl([[x0, 616], [x1, 616]], 2);
  if (sand) { for (let i = 0; i < 7; i++) { const x = 90 + i * 150; if (x > 300 && x < 560) continue; at(x, 600, 3.6, () => soldier(sin(i * 1.3) * 0.9, { pole: i % 3 === 0, emb: 'boar' })); } at(430, 600, 3.3, elephant); }
  else { for (let i = 0; i < 7; i++) { const x = 2310 - i * 150; if (x > 1840 && x < 2100) continue; at(x, 600, 3.6, () => soldier(sin(i * 1.9) * 0.9, { pole: i % 3 === 0, emb: 'lion' }), -1); } at(1970, 600, 3.3, elephant, -1); }
});

// ───────────── map ─────────────
const mp = (lat, lon) => [(lon - 72) * 62 + 70, (21 - lat) * 62 + 230];
const COAST = [[21, 72.8], [20, 72.9], [19, 72.85], [18, 73.0], [17, 73.3], [16, 73.5], [15.4, 73.8], [14.5, 74.3], [13.5, 74.7], [12.8, 74.85], [12, 75.2], [11.2, 75.8], [10.2, 76.2], [9.3, 76.45], [8.6, 76.9], [8.08, 77.55], [8.5, 78.1], [9.0, 78.3], [9.3, 79.0], [9.9, 79.2], [10.3, 79.85], [11.0, 79.85], [11.8, 79.8], [12.6, 80.2], [13.4, 80.3], [14.3, 80.15], [15.2, 80.05], [15.8, 80.6], [16.3, 81.3], [16.6, 82.1], [17.0, 82.3], [17.7, 83.25], [18.3, 84.0], [19.1, 84.8], [19.8, 85.6], [20.3, 86.6], [21, 87.0], [21.6, 87.6]];
const LANKA = [[9.8, 80.1], [9.4, 80.5], [8.5, 81.2], [7.9, 81.7], [7.0, 81.9], [6.2, 81.4], [6.0, 80.5], [6.6, 79.95], [7.6, 79.8], [8.5, 79.9], [9.3, 79.95]];
const RIVERS = [[[17.9, 73.7], [16.9, 74.6], [16.6, 76.5], [16.2, 78.5], [16.3, 80.3], [15.8, 80.9]], [[19.9, 73.6], [19.0, 76.5], [18.8, 79.5], [17.5, 81.3], [16.8, 82.2]], [[12.4, 75.6], [12.3, 76.8], [12.1, 77.7], [11.4, 78.5], [10.9, 79.5], [11.2, 79.85]], [[15.8, 74.6], [16.1, 75.6], [16.25, 76.2]]];
const VAT = mp(15.92, 75.68), KAN = mp(12.83, 79.7);
const mapRel = () => relief('amap', 'gran', [-40, -340, 1180, 1200], () => {
  if (!DET) { Fp([[mp(21, 72.8)[0], -340], ...COAST.map(([a, b]) => mp(a, b)), [1180, -340]]); Fp(LANKA.map(([a, b]) => mp(a, b))); return; }
  for (const r of RIVERS) Fl(r.map(([a, b]) => mp(a, b)), 3);
  for (let lat = 20.5; lat > 9; lat -= 0.55) { const i = COAST.findIndex((c) => c[0] <= lat); const lon = (COAST[Math.max(0, i)][1]) + 0.75; const [x, y] = mp(lat, lon); Fl([[x - 9, y + 6], [x, y - 5], [x + 9, y + 6]], 2); }
});
const wavesImg = () => cached('a:waves', W + 200, H, 1, () => {
  ctx.lineCap = 'round';
  for (let i = 0; i < 260; i++) { const x = rnd(i * 2.3) * (W + 200), y = 200 + rnd(i * 4.1) * 1100, w = 18 + rnd(i * 6.7) * 26;
    ctx.strokeStyle = 'rgba(210,206,198,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 1.5, y + 1.5, w, PI * 1.15, PI * 1.85); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,40,44,0.55)'; ctx.beginPath(); ctx.arc(x, y, w, PI * 1.15, PI * 1.85); ctx.stroke(); }
});
const ROUTE = (() => { const pts = [], c = [VAT[0] + 20, VAT[1] + 170]; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([(1 - u) * (1 - u) * VAT[0] + 2 * (1 - u) * u * c[0] + u * u * KAN[0], (1 - u) * (1 - u) * VAT[1] + 2 * (1 - u) * u * c[1] + u * u * KAN[1]]); } return pts; })();
const routeAt = (p) => { const f = clamp(p) * (ROUTE.length - 1), i = Math.min(ROUTE.length - 2, Math.floor(f)), k = f - i; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], k), lerp(ROUTE[i][1], ROUTE[i + 1][1], k)]; };

// ───────────── inscription rows (abstract, unreadable nicks) ─────────────
function rowsImg(key, kind, w, rows, rh) {
  const S = ST(kind);
  return cached('a:rows:' + key, w, rows * rh, 1, () => {
    ctx.lineCap = 'round';
    for (const pass of [0, 1]) {
      ctx.save(); if (!pass) ctx.translate(1.6, 1.8); ctx.strokeStyle = ctx.fillStyle = pass ? rgba(S.dark, 0.85) : rgba(S.light, 0.7);
      for (let r = 0; r < rows; r++) {
        let x = 12, k = r * 97 + (kind === 'sand' ? 0 : 5000); const y = r * rh + rh * 0.5;
        while (x < w - 24) {
          k++; const t = Math.floor(rnd(k * 1.37) * 7), z = 9 + rnd(k * 2.1) * 6; ctx.lineWidth = 3.4; ctx.beginPath();
          if (t === 0) { ctx.moveTo(x, y - z); ctx.lineTo(x, y + z); } else if (t === 1) { ctx.moveTo(x - z * 0.4, y); ctx.lineTo(x + z * 0.6, y); }
          else if (t === 2) { ctx.arc(x, y, z * 0.45, 0, TAU); } else if (t === 3) { ctx.arc(x, y + z * 0.2, z * 0.55, PI, TAU); }
          else if (t === 4) { ctx.moveTo(x - z * 0.3, y - z * 0.7); ctx.lineTo(x + z * 0.3, y + z * 0.7); } else if (t === 5) { ctx.moveTo(x - 3, y - z * 0.6); ctx.lineTo(x - 3, y + z * 0.6); ctx.moveTo(x + 4, y - z * 0.6); ctx.lineTo(x + 4, y + z * 0.6); }
          else { ctx.arc(x, y + z * 0.5, 2.6, 0, TAU); }
          ctx.stroke(); x += 15 + rnd(k * 3.3) * 12 + (rnd(k * 5.9) < 0.12 ? 22 : 0);
        }
      }
      ctx.restore();
    }
  });
}
const steleR = (kind) => relief('astele' + kind, kind, [-340, -10, 340, 1010], () => stele(560, 940));
const embR = (kind) => relief('aemb' + kind, kind, [-60, -80, 70, 10], () => emblem(kind === 'sand' ? 'boar' : 'lion'));
function drawStele(kind, x, y, s, lt, reveal, cueT) {
  R(steleR(kind), x, y, s, 1, 1.2);
  R(embR(kind), x - 4 * s, y + 230 * s, s * 2.2, 1, 0.5);
  const img = rowsImg(kind, kind, 440, 11, 52), bx = x - 220 * s, by = y + 340 * s;
  if (reveal == null) { blit(img, 0, 0, bx, by, s); return; }
  chiselReveal(lt, reveal[0], reveal[1], [bx, by, 440 * s, 572 * s], 11, () => blit(img, 0, 0, bx, by, s), kind === 'sand' ? SA.light : GR.light, 10);
}
/** animated pennant on a pole top at (px, py) (screen units), dir = +1 right / -1 left */
function pennant(px, py, len, hh, t, dir, kind, emb) {
  ctx.save(); ctx.translate(px, py); ctx.scale(dir, 1);
  const pts = pennantShape(len, hh, 1, t);
  RD(kind, () => Fp(pts), 0.5);
  const u = 0.42, wy = sin(t * 4.2 - u * 4.5) * hh * 0.22 * u;
  ctx.fillStyle = rgba(ST(kind).dark, 0.6); at(len * u, hh * 0.74 + wy, hh / 80, () => { DET = false; emblem(emb); });
  ctx.restore();
}

// ───────────── weathering layers ─────────────
const lichenImg = () => cached('a:lichen', 900, 900, 1, () => {
  for (let i = 0; i < 70; i++) { const cx = 100 + rnd(i * 3.1) * 700, cy = 100 + rnd(i * 5.3) * 700; for (let j = 0; j < 9; j++) { ctx.fillStyle = rgba(j % 2 ? '#7E8C56' : '#A9AE72', 0.35 + rnd(i * 7 + j) * 0.35); ctx.beginPath(); ctx.arc(cx + (rnd(i * 11 + j) - 0.5) * 60, cy + (rnd(i * 13 + j) - 0.5) * 60, 4 + rnd(i * 17 + j) * 16, 0, TAU); ctx.fill(); } }
});
const sandImg = () => cached('a:sanddrift', 1600, 700, 1, () => {
  ctx.beginPath(); ctx.moveTo(0, 700); for (let x = 0; x <= 1600; x += 20) ctx.lineTo(x, 260 + sin(x / 230) * 70 + sin(x / 90 + 1) * 24); ctx.lineTo(1600, 700); ctx.closePath();
  ctx.fillStyle = lg(0, 180, 0, 700, [[0, '#E2B27E'], [1, '#B47A50']]); ctx.fill();
  ctx.globalCompositeOperation = 'source-atop'; for (let i = 0; i < 4000; i++) { ctx.fillStyle = rgba(i % 2 ? '#F6D2A2' : '#7A4A2C', 0.25); ctx.fillRect(rnd(i * 1.7) * 1600, 160 + rnd(i * 2.9) * 540, 2, 2); }
  for (let k = 0; k < 14; k++) { ctx.strokeStyle = 'rgba(120,70,40,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= 1600; x += 20) ctx.lineTo(x, 330 + k * 26 + sin(x / 120 + k) * 10); ctx.stroke(); }
});

// ───────────── cliffs (Badami) ─────────────
const cliffR = () => relief('acliff', 'sand', [-40, -20, 1120, 700], () => {
  if (!DET) {
    Fp([[-40, 700], [-40, 120], [80, 60], [200, 90], [260, 20], [420, 40], [520, 0], [660, 30], [760, -10], [900, 50], [1000, 30], [1120, 80], [1120, 700]]);
    return;
  }
  for (let k = 0; k < 9; k++) { const y = 140 + k * 60; ctx.beginPath(); for (let x = -40; x <= 1120; x += 40) ctx.lineTo(x, y + sin(x / 140 + k) * 10); ctx.lineWidth = 2; ctx.stroke(); }
  for (const [cx, cy, cw, ch] of [[230, 300, 220, 150], [560, 250, 260, 170], [880, 320, 200, 140]]) {
    Fr(cx - cw / 2, cy - ch / 2, cw, ch, 6);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 4; i++) Fr(cx - cw / 2 + 18 + i * (cw - 36) / 3 - 9, cy - ch / 2 + 22, 18, ch - 22, 2); ctx.restore();
    Fr(cx - cw / 2 - 16, cy + ch / 2, cw + 32, 14, 2);
  }
});

// ═════════════════════════════ shots ═════════════════════════════
export function buildA(add, cue) {
  const tArmy = Wd('Pallava', 0), tIs = Wd('is', 0), tSaid = Wd('said', 0), tEnemy = Wd('enemy', 0), t1 = L(1), tVat = Wd('Vatapi', 1), tBad = Wd('Badami', 1) - 0.21, tRev = Wd('revenge', 1) - 0.05;
  const t2 = L(2), tPul = Wd('Pulakeshin', 2), tSouth = Wd('south', 2), tKan = Wd('Kanchi', 2), t3 = L(3), tKan3 = Wd('Kanchi', 3), tMet = Wd('met', 3), tPk = Wd('Pallava', 3);
  const t4 = L(4), tInsc = Wd('inscriptions', 4) + 0.29, tVic = Wd('victory', 4), tSome = Wd('Some', 4), tRead = Wd('read', 4), tOther = Wd('other', 4) - 0.1, t5 = L(5);

  // a1 · 642 cut by a chisel over a burning city
  const c642 = () => cutImg('642', '642', 360, 'sand');
  add({ id: 'a1', at: 0, zoom: 0.07, cam: [540, 700], note: 'night sandstone: chisel cuts 642, city relief with carved flames, fire light from below', draw: (lt) => {
    light(90 + sin(lt * 9) * 14, 10, 1);
    ctx.save(); ctx.translate(0, 30 - lt * 22);
    bg('sand');
    chiselReveal(lt, 0.12, 1.45, [170, 380, 740, 290], 2, () => CUT(c642(), 540, 525), SA.light);
    R(cityB(), 40, 830, 1, 1, 0.6); R(cityF(), 40, 830, 1, 1, 1);
    ctx.restore();
    night(lt, 540, 1250, 1500);
    ctx.save(); ctx.translate(0, 30 - lt * 22);
    FLAMES.forEach(([x, y, s], i) => flames(40 + x, 830 + y, 120 * s, lt, i * 2.1, eo(seg(lt, 0.2 + i * 0.08, 0.8 + i * 0.08))));
    ctx.restore();
    smokeW(lt, 7, 60, 1020, 900, 700, 3, 0.35); sparks(lt, 36, 40, 1040, 1100, 900, 1);
    plaque('642 CE', 540, 790, seg(lt, 1.35, 1.7), 34, { t: lt });
    vig();
  } });
  cue(0.05, 'rumble', { gain: 0.45, dur: 2 }); cue(0.14, 'chisel', { gain: 0.75, dur: 1.3 }); cue(1.38, 'pop', { gain: 0.4 });

  // a2 · frieze track: the Pallava army marches
  add({ id: 'a2', at: tArmy, zoom: 0.05, cam: [540, 820], note: 'FRIEZE TRACK: granite army frieze (spearmen, elephants, lion banners), sun sweeps; MARCHING NORTH plaque', draw: (lt, d) => {
    const p = lt / d; light(-165 + p * 110, 11, 1);
    const ox = -60 - eio(p) * 1500;
    ctx.save(); ctx.translate(ox * 0.25, 0); bg('gran', -100); ctx.restore();
    ctx.save(); ctx.translate(ox, 470); R(friezeBack(), 0, 0, 1, 1, 0.5); R(friezeFront(), 0, 0, 1, 1, 1.2); ctx.restore();
    wash(0.5); beam(0.15 + p * 0.8, 0.14); motes(lt, 26, 3);
    plaque('MARCHING NORTH', 540, 300, seg(lt, 0.35, 0.75), 40, { arrow: true, t: lt });
    vig();
  } });
  cue(tArmy, 'whoosh', { gain: 0.4 }); for (let k = 0; k < 4; k++) cue(tArmy + 0.1 + k * 0.52, 'drum', { gain: 0.5 - k * 0.05 }); cue(tArmy + 0.38, 'pop', { gain: 0.35 });

  // a3 · the burning capital
  add({ id: 'a3', at: tIs, zoom: 0.08, cam: [540, 760], note: 'night city relief burning, carved flames, smoke + sparks; ACCOUNTS SAY plaque', draw: (lt, d, t) => {
    light(90 + sin(lt * 7) * 18 + sin(lt * 13) * 6, 12, 1);
    const s = 1.22, ox = 540 - 500 * s - 40 + lt * 14, oy = 360;
    ctx.save(); ctx.translate(0, -lt * 10);
    bg('sand', 0, -60);
    R(cityB(), ox, oy, s, 1, 0.6); R(cityF(), ox, oy, s, 1, 1);
    ctx.restore();
    night(lt + 3, 540, 1150, 1500, 1.2);
    ctx.save(); ctx.translate(0, -lt * 10);
    const grow = 1 + 0.35 * eo(seg(t, tEnemy, tEnemy + 0.8));
    FLAMES.forEach(([x, y, sz], i) => flames(ox + x * s, oy + y * s, 150 * sz * grow, lt + 2, i * 2.1, 1));
    ctx.restore();
    smokeW(lt + 2, 10, 0, 1080, 760, 800, 9, 0.45); sparks(lt + 2, 60, 0, 1080, 1100, 1000, 7);
    plaque('ACCOUNTS SAY', 540, 210, seg(t, tSaid - 0.05, tSaid + 0.3), 42, { t: lt });
    vig();
  } });
  cue(tIs, 'whoosh', { gain: 0.35 }); cue(tIs + 0.05, 'sizzle', { gain: 0.55, dur: 2.6 }); cue(tSaid, 'pop', { gain: 0.45 }); cue(tEnemy, 'rumble', { gain: 0.5, dur: 1.4 });

  // a4 · VATAPI slab drops, chisel cuts the name
  const cVat = () => cutImg('vat', 'VATAPI', 190, 'sand');
  const tabR = () => relief('atab', 'sand', [-470, -350, 470, 350], () => { if (!DET) Fr(-450, -330, 900, 660, 18); else { ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-410, -290, 820, 580, 10); ctx.stroke(); Fl([[-380, 130], [380, 130]], 2.5); } });
  const tabCity = () => relief('atabcity', 'sand', [-20, 20, 1020, 360], () => { cityBack(); if (!DET) { Fr(0, 330, 1000, 30); for (let x = 8; x < 990; x += 48) Fr(x, 306, 28, 28, 3); for (const cx of TOWERS) Fr(cx - 55, 214, 110, 146, 3); } });
  add({ id: 'a4', at: t1, zoom: 0.07, cam: [540, 640], note: 'SLAB SLIDE: sandstone tablet drops with thud + dust, chisel cuts VATAPI, raking light sweep', draw: (lt, d) => {
    const p = lt / d; light(-170 + p * 150, 9 + 4 * sin(p * PI), 1);
    bg('sand', 0, -lt * 20);
    const land = 0.32, k = lt < land ? eio(lt / land) : 1, y = lerp(-700, 640, k) - (lt > land ? Math.exp(-(lt - land) * 14) * sin((lt - land) * 40) * 10 : 0);
    const lift = 1 + (1 - k) * 4;
    ctx.save(); const D = LT.d * 2.4 * lift; ctx.fillStyle = 'rgba(30,10,4,0.35)'; ctx.beginPath(); ctx.roundRect(90 - LT.x * D, y - 330 - LT.y * D, 900, 660, 18); ctx.fill(); ctx.restore();
    R(tabR(), 540, y, 1, 1, 1.4);
    R(tabCity(), 540 - 500 * 0.62, y + 130 - 360 * 0.62 + 168, 0.62, 1, 0.5);
    chiselReveal(lt, 0.42, 1.35, [210, y - 260, 660, 220], 2, () => CUT(cVat(), 540, y - 150), SA.light);
    dustSkirt(90, 990, y + 330, lt - land, 0.55);
    wash(0.5); beam(p * 1.1 - 0.05, 0.18); motes(lt, 20, 5);
    vig();
  } });
  cue(t1 + 0.05, 'whoosh', { gain: 0.45 }); cue(t1 + 0.32, 'thud', { gain: 0.9 }); cue(t1 + 0.34, 'rumble', { gain: 0.4, dur: 0.9 }); cue(t1 + 0.44, 'chisel', { gain: 0.7, dur: 0.95 });

  // a5 · BADAMI: cliff relief with caves, slides in from the right
  const cBad = () => cutImg('bad', 'BADAMI', 180, 'sand');
  add({ id: 'a5', at: tBad, zoom: 0.07, cam: [540, 700], note: 'SLAB SLIDE from right: BADAMI carved over sandstone cliff relief with cave temples, sunk lake; TODAY plaque', draw: (lt, d) => {
    const p = lt / d; light(-150 + p * 70, 10, 1);
    const land = 0.3, sx = lt < land ? lerp(1150, 0, eio(lt / land)) : -Math.exp(-(lt - land) * 12) * sin((lt - land) * 36) * 8;
    bg('sand', -20 + lt * 10, 0);
    ctx.save(); ctx.translate(sx, 0);
    ctx.fillStyle = 'rgba(30,10,4,0.4)'; ctx.fillRect(-30, 120, 30, 1300);
    bg('sand', 0, 0);
    CUT(cBad(), 540, 300);
    R(cliffR(), 0, 560, 1, 1, 1.2);
    const ly = 1210; ctx.fillStyle = lg(0, ly, 0, ly + 260, [[0, 'rgba(40,20,14,0.55)'], [1, 'rgba(40,20,14,0.2)']]); ctx.fillRect(-40, ly, 1160, 260);
    ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) { const x = (rnd(i * 2.3) * 1200 + lt * 30 * (1 + rnd(i))) % 1200 - 60, y = ly + 30 + rnd(i * 5.1) * 200, w = 30 + rnd(i * 3.3) * 60; ctx.strokeStyle = 'rgba(30,12,6,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); ctx.strokeStyle = 'rgba(240,170,120,0.45)'; ctx.beginPath(); ctx.moveTo(x + 2, y + 3); ctx.lineTo(x + w + 2, y + 3); ctx.stroke(); }
    ctx.restore();
    dustSkirt(-60, 120, 1400, lt - land, 0.4);
    plaque('TODAY', 540, 445, seg(lt, 0.4, 0.7), 40, { t: lt });
    wash(0.45); beam(0.1 + p * 0.9, 0.16);
    vig();
  } });
  cue(tBad, 'whoosh', { gain: 0.5 }); cue(tBad + 0.3, 'thud', { gain: 0.75 }); cue(tBad + 0.42, 'pop', { gain: 0.4 });

  // a6 · REVENGE: Pallava lion in granite, fire rising
  const cRev = () => cutImg('rev', 'REVENGE', 170, 'gran');
  const lionR = () => relief('alion', 'gran', [-60, -82, 66, 6], lion, 1);
  add({ id: 'a6', at: tRev, zoom: 0.1, cam: [540, 760], note: 'granite lion relief, REVENGE carved, fire light from lower right, sparks', draw: (lt, d) => {
    const p = lt / d; light(-30 + p * 80 + sin(lt * 11) * 6, 11, 1);
    const sh = Math.exp(-lt * 9) * 12;
    ctx.save(); ctx.translate(sin(lt * 70) * sh, cos(lt * 63) * sh);
    bg('gran', -lt * 18, 0);
    CUT(cRev(), 540, 300);
    R(lionR(), 520 + lt * 20, 1150, 8.2, 1, 1.4);
    ctx.restore();
    wash(0.35, '#FFE0C0');
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(1000, 1300, 900, '255,110,30', 0.28 * (0.85 + 0.15 * sin(lt * 12))); ctx.restore();
    sparks(lt, 30, 500, 1100, 1350, 1000, 21, 0.9);
    vig();
  } });
  cue(tRev, 'slam', { gain: 0.7 }); cue(tRev + 0.02, 'rumble', { gain: 0.6, dur: 1.4 });

  // a7 · years earlier: a weathered boar roundel, time rewinds
  const roundR = () => relief('around', 'sand', [-380, -380, 380, 380], () => { if (!DET) Fa(0, 0, 330, 0, TAU, 44); else { Se(0, 0, 305, 305, 2); Se(0, 0, 355, 355, 2); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; Fl([[cos(a) * 312, sin(a) * 312], [cos(a) * 348, sin(a) * 348]], 2); } } });
  const boarR = () => relief('aboar', 'sand', [-50, -70, 66, 6], boar, 1);
  add({ id: 'a7', at: t2, zoom: 0.06, cam: [540, 720], note: 'EROSION reversed: weathered boar roundel, sand blows off, lichen recedes; c. 618 CE plaque', draw: (lt, d) => {
    const p = lt / d, rw = eio(seg(lt, 0.1, 1.5)); light(-60 - p * 90, 10, 1);
    bg('sand', 0, -lt * 14);
    ctx.save(); ctx.translate(0, -lt * 14);
    R(roundR(), 540, 720, 1, 1, 0.9); R(boarR(), 520, 860, 5.6, 1, 1.2);
    blit(lichenImg(), 450, 450, 540, 720, 1, 0.85 * (1 - rw));
    ctx.restore();
    blit(sandImg(), 800, 700, 540 - rw * 1500, 1250 + rw * 120, 1, 1 - rw * 0.6);
    for (let i = 0; i < 40; i++) { const ph = (lt * 0.9 + rnd(i * 1.3)) % 1, x = 1100 - ph * 1300, y = 700 + rnd(i * 2.9) * 700 + sin(ph * 6 + i) * 20; ctx.fillStyle = `rgba(240,200,150,${0.5 * (1 - rw * 0.7) * sin(ph * PI)})`; ctx.fillRect(x, y, 26 + rnd(i) * 40, 2.5); }
    wash(0.5); beam(0.9 - p * 0.9, 0.14);
    plaque('c. 618 CE', 540, 230, seg(lt, 0.6, 0.95), 44, { t: lt });
    vig();
  } });
  cue(t2, 'whoosh', { gain: 0.55 }); cue(t2 + 0.1, 'sizzle', { gain: 0.2, dur: 1.4 }); cue(t2 + 0.62, 'pop', { gain: 0.4 });

  // a8 · Pulakeshin II chiselled in red sandstone
  const kingS = () => relief('akingS', 'sand', [-26, -162, 22, 2], () => king(), 1);
  const nicheS = () => relief('anicheS', 'sand', [-480, -60, 480, 1180], () => niche(760, 1080));
  add({ id: 'a8', at: tPul, zoom: 0.07, cam: [540, 760], note: 'CHISEL REVEAL: Pulakeshin II sandstone king in arched niche, boar pennant; name plaque + ILLUSTRATION', draw: (lt, d, t) => {
    const p = lt / d; light(-150 + p * 100, 11, 1);
    bg('sand', 0, -lt * 12);
    ctx.save(); ctx.translate(0, -lt * 12);
    R(nicheS(), 540, 170, 1, 1, 1);
    const s = 6.1, kx = 470, ky = 1240;
    chiselReveal(lt, 0.02, 1.25, [kx - 26 * s, ky - 160 * s, 48 * s, 160 * s], 6, () => { R(kingS(), kx, ky, s, 1, 1.3); pennant(kx + 18.5 * s, ky - 157 * s, 200, 105, lt, 1, 'sand', 'boar'); }, SA.light);
    ctx.restore();
    wash(0.5); beam(0.05 + p, 0.15); motes(lt, 18, 8);
    plaque('PULAKESHIN II', 540, 165, seg(t, tPul + 0.15, tPul + 0.5), 44, { t: lt });
    plaque('ILLUSTRATION', 850, 1225, seg(lt, 0.9, 1.2), 20);
  } });
  cue(tPul, 'chisel', { gain: 0.75, dur: 1.2 }); cue(tPul + 0.18, 'pop', { gain: 0.45 });

  // a9 · relief map: the route south to Kanchi
  const cV = () => cutImg('mv', 'VATAPI', 46, 'gran'), cK = () => cutImg('mk', 'KANCHI', 46, 'gran');
  add({ id: 'a9', at: tSouth, zoom: 0.03, cam: [440, 650], note: 'RELIEF MAP: granite peninsula on sunk sea, route channel fills fire-orange VATAPI -> KANCHI, boar marker', draw: (lt, d, t) => {
    const p = lt / d; light(-140 + p * 60, 10, 1);
    const z = 1 + 0.2 * eio(p);
    ctx.save(); ctx.translate(440, 650); ctx.scale(z, z); ctx.translate(-440, -650);
    bg('gran');
    ctx.fillStyle = 'rgba(30,40,56,0.35)'; ctx.fillRect(-300, -300, W + 600, H + 600);
    blit(wavesImg(), 100, 0, lt * 20, 0);
    R(mapRel(), 0, 0, 1, 1, 1.3);
    // carved channel
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const strokeR = (pts, col, w) => { ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); };
    ctx.save(); ctx.translate(-LT.x * 2, -LT.y * 2); strokeR(ROUTE, rgba(GR.light, 0.7), 18); ctx.restore(); strokeR(ROUTE, '#2E2C2A', 16);
    const rp = eio(seg(t, tSouth + 0.15, tKan)), n = Math.max(1, Math.round(rp * (ROUTE.length - 1))), part = ROUTE.slice(0, n + 1); if (rp > 0) part[n] = routeAt(rp);
    if (rp > 0) { strokeR(part, '#C2501A', 12); strokeR(part, FIRE, 7); strokeR(part, FIRE2, 2.5); ctx.save(); ctx.globalCompositeOperation = 'lighter'; strokeR(part, 'rgba(255,140,50,0.28)', 34); ctx.restore(); }
    RD('sand', () => Fe(VAT[0], VAT[1], 22, 22), 0.6);
    const kf = seg(t, tKan - 0.1, tKan + 0.3);
    RD('gran', () => { Fe(KAN[0], KAN[1], 22, 22); }, 0.6);
    if (kf > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,170,80,${0.8 * (1 - kf)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(KAN[0], KAN[1], 22 + kf * 90, 0, TAU); ctx.stroke(); glow(KAN[0], KAN[1], 90, '255,140,50', 0.5 * (1 - kf * 0.6)); ctx.restore(); }
    CUT(cV(), VAT[0] - 20, VAT[1] - 62); CUT(cK(), KAN[0] + 60, KAN[1] + 62, 1, seg(t, tKan - 0.3, tKan));
    if (kf > 0) { ctx.save(); ctx.translate(KAN[0] + 4, KAN[1] - 6); RD('gran', () => Fr(-2, -110, 4, 110), 0.5); ctx.restore(); pennant(KAN[0] + 6, KAN[1] - 116, 80 * eo(kf), 44, lt, 1, 'gran', 'lion'); }
    const mk = routeAt(rp);
    if (rp > 0 && rp < 1.0001) { RD('sand', () => Fr(mk[0] - 2, mk[1] - 110, 4, 110), 0.5); pennant(mk[0], mk[1] - 110, 80, 44, lt, -1, 'sand', 'boar'); }
    ctx.restore();
    wash(0.4); beam(0.2 + p * 0.7, 0.1);
    vig();
  } });
  cue(tSouth, 'slide', { gain: 0.45 }); cue(tSouth + 0.2, 'rumble', { gain: 0.35, dur: 2 }); cue(tKan, 'thud', { gain: 0.7 }); cue(tKan + 0.05, 'bell', { gain: 0.3 });

  // a10 · Pullalur: the two armies meet on a split frieze
  add({ id: 'a10', at: t3, zoom: 0.05, cam: [540, 800], note: 'FRIEZE TRACK: sandstone boar army meets granite lion army on a split frieze; PULLALUR + NEAR KANCHI plaques', draw: (lt, d, t) => {
    const p = lt / d; light(-120 + p * 60, 11, 1);
    const s = 0.82, ox = 40 - eio(clamp(p * 1.15)) * (1200 * s - 540 + 40);
    ctx.save(); ctx.translate(ox * 0.3, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(-400, -300, 1200 * s - ox * 0.3 + ox + 400, H + 600); ctx.clip(); bg('sand', -200); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(1200 * s - ox * 0.3 + ox, -300, 3000, H + 600); ctx.clip(); bg('gran', 0); ctx.restore();
    ctx.restore();
    ctx.save(); ctx.translate(ox, 560); ctx.scale(s, s);
    R(armies('sand'), 0, 0, 1, 1, 1.2); R(armies('gran'), 0, 0, 1, 1, 1.2);
    ctx.fillStyle = 'rgba(20,10,6,0.55)'; ctx.fillRect(1196, -400, 8, 1800);
    ctx.restore();
    wash(0.5); beam(0.1 + p * 0.8, 0.14); motes(lt, 22, 11);
    plaque('PULLALUR', 540, 230, seg(lt, 0.1, 0.45), 48, { t: lt });
    plaque('NEAR KANCHI', 540, 345, seg(t, tKan3 - 0.15, tKan3 + 0.2), 30);
    const hit = seg(t, tMet - 0.05, tMet + 0.5); if (hit > 0 && hit < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(540, 820, 260, '255,200,120', 0.5 * (1 - hit)); ctx.restore(); }
    vig();
  } });
  cue(t3, 'whoosh', { gain: 0.4 }); for (let k = 0; k < 3; k++) cue(t3 + 0.15 + k * 0.5, 'drum', { gain: 0.5 }); cue(t3 + 0.12, 'pop', { gain: 0.4 }); cue(tKan3, 'pop', { gain: 0.3 }); cue(tMet, 'slam', { gain: 0.65 });

  // a11 · Mahendravarman, revealed by a sunbeam
  const kingG = () => relief('akingG', 'gran', [-26, -162, 22, 2], () => king(), 1);
  const nicheG = () => relief('anicheG', 'gran', [-480, -60, 480, 1180], () => niche(760, 1080));
  add({ id: 'a11', at: tPk, zoom: 0.08, cam: [540, 700], note: 'sunbeam sweep reveals granite Mahendravarman relief, mica glints, lion pennant; name plaque + ILLUSTRATION', draw: (lt, d, t) => {
    const p = lt / d, rv = eo(seg(lt, 0, 1.4)); light(-10 - p * 120, 6 + rv * 6, 0.3 + rv * 0.7);
    bg('gran', 0, -lt * 10);
    ctx.save(); ctx.translate(0, -lt * 10);
    R(nicheG(), 540, 170, 1, 1, 1);
    const s = 6.1, kx = 610, ky = 1240;
    ctx.save(); ctx.translate(kx, ky); ctx.scale(-1, 1); R(kingG(), 0, 0, s, 1, 1.3); ctx.restore();
    pennant(kx - 18.5 * s, ky - 157 * s, 200, 105, lt, -1, 'gran', 'lion');
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(40,44,60,${0.75 * (1 - rv)})`; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore();
    wash(0.5, '#FFF4E4'); const bp = 1.05 - p * 1.2; beam(bp, 0.24, '255,226,170', 0.35, 260);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const x = rnd(i * 3.7) * 1080, y = 200 + rnd(i * 5.9) * 1100, bx = (bp - 0.5) * 2300, dx = (x - 540) * cos(-0.35) + (y - 960) * sin(-0.35) - bx; if (Math.abs(dx) > 220) continue; const tw = Math.max(0, sin(lt * 9 + i * 2.7)) * (1 - Math.abs(dx) / 220); if (tw < 0.2) continue; ctx.fillStyle = `rgba(255,255,240,${tw})`; ctx.fillRect(x - 7 * tw, y - 1, 14 * tw, 2); ctx.fillRect(x - 1, y - 7 * tw, 2, 14 * tw); }
    ctx.restore();
    plaque('MAHENDRAVARMAN I', 540, 165, seg(t, Wd('Mahendravarman', 3) - 0.1, Wd('Mahendravarman', 3) + 0.25), 40, { t: lt });
    plaque('ILLUSTRATION', 230, 1225, seg(t, Wd('Mahendravarman', 3) + 0.4, Wd('Mahendravarman', 3) + 0.7), 20);
  } });
  cue(tPk, 'swell', { gain: 0.45, dur: 2 }); cue(Wd('Mahendravarman', 3), 'pop', { gain: 0.45 }); cue(Wd('Mahendravarman', 3) + 0.4, 'sparkle', { gain: 0.3 });

  // a12 · who won? split slab, the kings face each other, "?" cut across the seam
  const cQ = () => cutImg('q', '?', 340, 'gran');
  add({ id: 'a12', at: t4, zoom: 0.07, cam: [540, 760], note: 'split slab sandstone|granite, two kings face off, chisel cuts a big ? across the seam, light swings side to side', draw: (lt, d) => {
    light(-90 + sin(lt * 3.2) * 75, 11, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, 840, H + 600); ctx.clip(); bg('sand', -lt * 14); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(540, -300, 900, H + 600); ctx.clip(); bg('gran', lt * 14); ctx.restore();
    ctx.fillStyle = 'rgba(15,8,4,0.6)'; ctx.fillRect(536, -300, 8, H + 600); ctx.fillStyle = 'rgba(255,230,200,0.25)'; ctx.fillRect(544, -300, 2, H + 600);
    const s = 4.3, sx = Math.exp(-lt * 3) * 60;
    R(kingS(), 250 - sx, 1220, s, 1, 1.2); pennant(250 - sx + 18.5 * s, 1220 - 157 * s, 150, 78, lt, 1, 'sand', 'boar');
    ctx.save(); ctx.translate(830 + sx, 1220); ctx.scale(-1, 1); R(kingG(), 0, 0, s, 1, 1.2); ctx.restore(); pennant(830 + sx - 18.5 * s, 1220 - 157 * s, 150, 78, lt, -1, 'gran', 'lion');
    chiselReveal(lt, 0.08, 0.95, [420, 230, 240, 400], 3, () => CUT(cQ(), 540, 410), GR.light);
    wash(0.4);
    vig();
  } });
  cue(t4, 'thud', { gain: 0.6 }); cue(t4 + 0.08, 'chisel', { gain: 0.7, dur: 0.85 });

  // a13 · Chalukya record: rows of nicks chiselled into a sandstone stele
  add({ id: 'a13', at: tInsc, zoom: 0.07, cam: [540, 700], note: 'sandstone stele with boar emblem, rows of abstract nicks chiselled in; CHALUKYA RECORD + CLAIMS VICTORY plaques', draw: (lt, d, t) => {
    const p = lt / d; light(-150 + p * 70, 10, 1);
    bg('sand', 0, -lt * 16);
    ctx.save(); ctx.translate(0, -lt * 16);
    drawStele('sand', 540, 300, 1, lt, [0.05, 1.5]);
    ctx.restore();
    wash(0.5); beam(p * 1.1, 0.15);
    plaque('CHALUKYA RECORD', 540, 200, seg(lt, 0.05, 0.4), 40, { t: lt });
    plaque('CLAIMS VICTORY', 560, 930, seg(t, tVic - 0.05, tVic + 0.3), 44, { rot: -0.06, drop: 60, t: lt });
    vig();
  } });
  cue(tInsc, 'chisel', { gain: 0.65, dur: 1.4 }); cue(tInsc + 0.08, 'pop', { gain: 0.35 }); cue(tVic, 'thud', { gain: 0.55 });

  // a14 · Pallava records: granite stele, the light flips on "read"
  add({ id: 'a14', at: tSome, zoom: 0.06, cam: [540, 760], note: 'granite stele with lion emblem and nick rows; light flips to the other side on "read"; PALLAVA RECORDS plaque', draw: (lt, d, t) => {
    const f = eio(seg(t, tRead - 0.1, tRead + 0.5)); light(lerp(-150, -30, f), 11, 1);
    bg('gran', 0, -lt * 12);
    ctx.save(); ctx.translate(0, -60 + lt * 30);
    drawStele('gran', 540, 300, 1, lt, null);
    ctx.restore();
    wash(0.5, '#F4F0FF'); beam(lerp(0.15, 0.85, f), 0.16, '230,236,255');
    plaque('PALLAVA RECORDS', 540, 200, seg(lt, 0.05, 0.4), 40, { t: lt });
    vig();
  } });
  cue(tSome, 'slide', { gain: 0.45 }); cue(tSome + 0.08, 'pop', { gain: 0.35 }); cue(tRead, 'whoosh', { gain: 0.4 });

  // a15 · DISPUTED
  add({ id: 'a15', at: tOther, zoom: 0.07, cam: [540, 700], note: 'both steles slide together (thud + dust), light swings, DISPUTED plaque slams between them', draw: (lt, d) => {
    light(-90 + sin(lt * 2.6) * 70, 10, 1);
    const land = 0.28, k = lt < land ? eio(lt / land) : 1, s = 0.62;
    ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, 840, H + 600); ctx.clip(); bg('sand'); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(540, -300, 900, H + 600); ctx.clip(); bg('gran'); ctx.restore();
    ctx.fillStyle = 'rgba(15,8,4,0.6)'; ctx.fillRect(536, -300, 8, H + 600);
    drawStele('sand', lerp(-320, 280, k), 420, s, lt, null);
    drawStele('gran', lerp(1400, 800, k), 420, s, lt, null);
    dustSkirt(80, 480, 1030, lt - land, 0.45); dustSkirt(600, 1000, 1030, lt - land, 0.45);
    const pk = seg(lt, 0.42, 0.62), sh = lt > 0.62 ? Math.exp(-(lt - 0.62) * 10) * 10 : 0;
    ctx.save(); ctx.translate(sin(lt * 80) * sh, 0); plaque('DISPUTED', 540, 720, pk, 64, { drop: 260, rot: -0.04, t: lt }); ctx.restore();
    wash(0.45);
    vig();
  } });
  cue(tOther, 'whoosh', { gain: 0.45 }); cue(tOther + 0.28, 'thud', { gain: 0.7 }); cue(tOther + 0.6, 'slam', { gain: 0.8 });
  void t5;
}
