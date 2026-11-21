// EPISODE 15 · worker B : "Lamplit Bronze & Red Thread", lines 4-6 (L(4) -> L(7))
//   b1  lamp orbits round and round over an empty corridor (years pass); tally marks scratch onto the wall
//   b2  hooded faceless killers exist only as wall shadows, walking free past the floor lamp; UNPUNISHED
//   b3  THE crown floats across the dark corridor, carried by the lamp light
//   b4  older heavier bronze figure with a plain cap; the crown lowers onto him; molten UTTAMA CHOLA; ILLUSTRATION
//   b5  crowned Uttama lit at left; the slim younger brother stays dark at the right; a red thread dangles by him
//   b6  the lamp travels to the younger brother; he comes out of the dark, his shadow grows on the wall
//   b7  halo ring ignites behind him, the crown lands on him; molten RAJARAJA I
//   b8  temple wall, a dark granite slab in rising lamp light; molten UDAIYARKUDI / INSCRIPTION
//   b9  abstract incised rows glow red one by one; the hooded shadows return and get pinned by red thread; ROYAL OFFICERS
//   b10 bronze field plots and house tokens are pulled off a map by red threads into darkness; LANDS TAKEN
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { cached, blit, lg, rgba, dust, smoke } from './art.js';
import { flame } from './core/kit.js';

const B = { body: '#8A4B22', mid: '#B5692F', hi: '#F2B66B', deep: '#2A1206', wall: '#140A06', void: '#070302', red: '#B0121B', ash: '#E9DFCF', brass: '#D9A441' };
const SERIF = 'Caladea';

// bronze Chola crown, base centre at (x,y), height ~ 190*s
function crown(x, y, s = 1, rot = 0, glowA = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, '#5A2E12'); g.addColorStop(0.45, '#F2B66B'); g.addColorStop(0.6, '#B5692F'); g.addColorStop(1, '#3A1A08');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, 0); ctx.lineTo(56, -40); ctx.lineTo(44, -95); ctx.lineTo(30, -140); ctx.lineTo(10, -175); ctx.lineTo(0, -195); ctx.lineTo(-10, -175); ctx.lineTo(-30, -140); ctx.lineTo(-44, -95); ctx.lineTo(-56, -40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2A1206'; ctx.lineWidth = 5; for (const yy of [-40, -95, -140]) { ctx.beginPath(); ctx.moveTo(-60 + (-yy) * 0.2, yy); ctx.lineTo(60 - (-yy) * 0.2, yy); ctx.stroke(); }
  ctx.fillStyle = '#B0121B'; ctx.beginPath(); ctx.arc(0, -20, 11, 0, Math.PI * 2); ctx.fill();
  if (glowA > 0) { ctx.globalAlpha = glowA; ctx.fillStyle = '#FFD9A0'; ctx.beginPath(); ctx.arc(0, -195, 14, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  ctx.restore();
}
// black silhouette of the crown (for its wall shadow), origin = base centre, cached
const crownSil = () => cached('bcrownsil', 160, 210, 1, () => { crown(80, 205, 1); ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 160, 210); ctx.globalCompositeOperation = 'source-over'; });

// ───────────── light: cached dark mask with a hole at the flame + warm glow ─────────────
function maskImg(R) {
  return cached('bmask' + R, 2 * R, 2 * R, 0.5, () => {
    const g = ctx.createRadialGradient(R, R, 0, R, R, R);
    g.addColorStop(0, 'rgba(7,3,2,0)'); g.addColorStop(0.35, 'rgba(7,3,2,0.05)'); g.addColorStop(0.7, 'rgba(7,3,2,0.6)'); g.addColorStop(1, 'rgba(7,3,2,0.97)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 2 * R, 2 * R);
  });
}
function dark(x, y, R) {
  R = Math.round(R / 20) * 20; blit(maskImg(R), R, R, x, y);
  ctx.fillStyle = 'rgba(7,3,2,0.97)'; const X0 = -700, X1 = W + 700, Y0 = -700, Y1 = H + 700;
  ctx.fillRect(X0, Y0, X1 - X0, y - R - Y0 + 1); ctx.fillRect(X0, y + R - 1, X1 - X0, Y1 - y - R + 1);
  ctx.fillRect(X0, y - R, x - R - X0 + 1, 2 * R); ctx.fillRect(x + R - 1, y - R, X1 - x - R + 1, 2 * R);
}
const glowImg = () => cached('bglow', 256, 256, 1, () => {
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,190,100,1)'); g.addColorStop(0.3, 'rgba(255,140,50,0.45)'); g.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
});
function warm(x, y, r, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; blit(glowImg(), 128, 128, x, y, r / 128, a); ctx.restore(); }
const flick = (t, s = 0) => 0.9 + 0.06 * Math.sin(t * 9 + s) + 0.04 * Math.sin(t * 23 + s * 2);
// small bronze oil lamp: dish + flame, (x,y) = flame base
function oilLamp(x, y, s, t, seed = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = lg(-60, 0, 60, 0, [[0, '#3A1A08'], [0.45, B.hi], [0.7, B.mid], [1, B.deep]]);
  ctx.beginPath(); ctx.moveTo(-62, 6); ctx.quadraticCurveTo(0, 52, 62, 6); ctx.lineTo(70, 0); ctx.lineTo(-56, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 4, 62, 10, 0, 0, TAU); ctx.fillStyle = B.deep; ctx.fill();
  ctx.restore();
  flame(x, y + 2 * s, s * 0.8, t, seed);
}

// ───────────── wall, pillars ─────────────
const wallImg = () => cached('bwall', 1080, 1920, 1, () => {
  ctx.fillStyle = B.wall; ctx.fillRect(0, 0, 1080, 1920);
  let y = 0, row = 0;
  while (y < 1250) {
    const h = 120 + rnd(row * 3 + 1) * 50; let x = -((row * 173) % 260);
    while (x < 1080) { const w = 200 + rnd(row * 11 + x * 0.7) * 160, tn = rnd(row * 7 + x * 0.3);
      ctx.fillStyle = `rgb(${30 + tn * 22},${17 + tn * 12},${10 + tn * 6})`; ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
      ctx.fillStyle = 'rgba(255,200,140,0.05)'; ctx.fillRect(x + 3, y + 3, w - 6, 5);
      for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + rnd(row + x + k) * w, y + rnd(row * 2 + x + k) * h, 3 + rnd(k + x) * 8, 2); }
      x += w; }
    y += h; row++;
  }
  ctx.fillStyle = lg(0, 1240, 0, 1920, [[0, '#1A0D07'], [0.08, '#0D0604'], [1, B.void]]); ctx.fillRect(0, 1240, 1080, 680);
  ctx.fillStyle = 'rgba(242,182,107,0.10)'; ctx.fillRect(0, 1240, 1080, 4);
});
const pillarImg = () => cached('bpillar', 200, 1300, 1, () => {
  ctx.fillStyle = lg(0, 0, 200, 0, [[0, '#0E0704'], [0.4, '#3A2214'], [0.6, '#2A170C'], [1, '#0A0503']]);
  ctx.fillRect(30, 90, 140, 1120); ctx.fillRect(0, 40, 200, 60); ctx.fillRect(10, 0, 180, 40); ctx.fillRect(0, 1200, 200, 100);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; for (let k = 0; k < 6; k++) ctx.fillRect(30, 250 + k * 170, 140, 10);
});

// ───────────── bronze figures (faceless cut-outs), origin = feet centre at (250, 740) ─────────────
// kind 'y' = slim younger brother, 'u' = older heavier Uttama with a plain cap; mode 'L' / 'R' rim side, 'S' black silhouette
const HEADTOP = { y: -628, u: -598 };   // where the crown base sits
function figPaint(kind, mode) {
  const u = kind === 'u', k = u ? 1.4 : 1;
  const grad = mode === 'S' ? '#000' : lg(-130, 0, 130, 0, mode === 'R'
    ? [[0, B.deep], [0.35, B.body], [0.65, B.mid], [0.86, B.hi], [1, '#FFE6B8']]
    : [[0, '#FFE6B8'], [0.14, B.hi], [0.35, B.mid], [0.65, B.body], [1, B.deep]]);
  ctx.save(); ctx.translate(250, 740); ctx.fillStyle = grad; ctx.strokeStyle = grad; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const P = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); };
  // legs + feet
  ctx.fillRect(-46 * k, -130, 30 * k, 124); ctx.fillRect(16 * k, -130, 30 * k, 124);
  ctx.beginPath(); ctx.ellipse(-34 * k, -6, 30 * k, 10, 0, 0, TAU); ctx.ellipse(34 * k, -6, 30 * k, 10, 0, 0, TAU); ctx.fill();
  // dhoti
  P([[-58 * k, -340], [58 * k, -340], [80 * k, -130], [34 * k, -116], [0, -160], [-34 * k, -116], [-80 * k, -130]]);
  // torso
  P([[-74 * k, -510], [74 * k, -510], [54 * k, -330], [-54 * k, -330]]);
  if (u) { ctx.beginPath(); ctx.ellipse(0, -385, 70 * k * 0.85, 70, 0, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.arc(-70 * k, -496, 22 * k, 0, TAU); ctx.arc(70 * k, -496, 22 * k, 0, TAU); ctx.fill();
  // arms
  ctx.lineWidth = 34 * (u ? 1.25 : 1);
  ctx.beginPath(); ctx.moveTo(-74 * k, -490); ctx.lineTo(-96 * k, -340); ctx.lineTo(-86 * k, -250); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(74 * k, -490); ctx.lineTo(96 * k, -340); ctx.lineTo(86 * k, -250); ctx.stroke();
  // neck + head (smooth faceless oval)
  ctx.fillRect(-15 * (u ? 1.3 : 1), -545, 30 * (u ? 1.3 : 1), 44);
  ctx.beginPath(); ctx.ellipse(0, -585, u ? 48 : 40, u ? 54 : 52, 0, 0, TAU); ctx.fill();
  if (u) { ctx.beginPath(); ctx.roundRect(-46, -652, 92, 52, 8); ctx.fill(); }      // plain cap
  else { ctx.beginPath(); ctx.arc(0, -642, 18, 0, TAU); ctx.fill(); }                // top-knot
  if (mode !== 'S') {
    // engraved details: waist sash, necklace, dhoti pleats, cap rim
    ctx.strokeStyle = 'rgba(42,18,6,0.85)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-56 * k, -338); ctx.lineTo(56 * k, -338); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -520, 34 * (u ? 1.2 : 1), 0.3, Math.PI - 0.3); ctx.stroke();
    for (const px of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.moveTo(px * 40 * k, -330); ctx.lineTo(px * 60 * k, -170); ctx.stroke(); }
    if (u) { ctx.beginPath(); ctx.moveTo(-46, -606); ctx.lineTo(46, -606); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,240,210,0.35)'; ctx.beginPath(); ctx.ellipse(mode === 'R' ? 16 : -16, -600, 10, 20, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
const figImg = (kind, mode) => cached(`bfig_${kind}_${mode}`, 500, 760, 1, () => figPaint(kind, mode));
// a figure lit from flame x lx: crossfade the two rim versions; its long shadow on the wall behind
function figure(kind, x, y, s, lx, a = 1) {
  const r = clamp(0.5 + (lx - x) / 500);
  blit(figImg(kind, 'L'), 250, 740, x, y, s, a * (1 - r)); blit(figImg(kind, 'R'), 250, 740, x, y, s, a * r);
}
function wallShadow(img, ox, oy, x, y, s, lx, a = 0.75) {
  const sk = clamp(-(x - lx) / 900, -0.7, 0.7) * -1;
  ctx.save(); ctx.translate(x + (x - lx) * 0.12, y - 6); ctx.transform(1, 0, -sk, 1, 0, 0); ctx.scale(1.12, 1.18);
  blit(img, ox, oy, 0, 0, s, a); ctx.restore();
}

// hooded faceless figure, silhouette only (feet centre at (150, 540)), two walking poses
const hoodImg = (pose) => cached('bhood' + pose, 300, 560, 1, () => {
  ctx.save(); ctx.translate(150, 540); ctx.fillStyle = '#000';
  const sw = pose ? 34 : -34;
  ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
  ctx.beginPath(); ctx.moveTo(-26, -80); ctx.lineTo(-26 + sw, -12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(26, -80); ctx.lineTo(26 - sw, -12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(26, -525); ctx.quadraticCurveTo(-40, -520, -62, -430); ctx.quadraticCurveTo(-100, -400, -104, -360);
  ctx.lineTo(-122, -70); ctx.quadraticCurveTo(-60, -56 + (pose ? 8 : -6), 0, -66); ctx.quadraticCurveTo(60, -56 + (pose ? -6 : 8), 118, -70);
  ctx.lineTo(102, -360); ctx.quadraticCurveTo(96, -410, 66, -436); ctx.quadraticCurveTo(70, -480, 26, -525); ctx.closePath(); ctx.fill();
  ctx.restore();
});
function hooded(x, y, s, t, a = 0.85, ph = 0) {
  const pose = Math.floor(t * 4 + ph) % 2, bob = Math.abs(Math.sin((t * 4 + ph) * Math.PI)) * 8 * s;
  blit(hoodImg(pose), 150, 540, x, y - bob, s, a);
}

// ───────────── red thread, pins, labels, molten titles ─────────────
function thread(ax, ay, bx, by, sag, p = 1, w = 4) {
  if (p <= 0) return; const n = 28, m = Math.max(1, Math.round(n * clamp(p)));
  const cx = (ax + bx) / 2, cy = (ay + by) / 2 + sag; ctx.beginPath();
  for (let i = 0; i <= m; i++) { const u = (i / n) * (p >= 1 ? 1 : 1), q = Math.min(u, clamp(p)); const x = (1 - q) * (1 - q) * ax + 2 * (1 - q) * q * cx + q * q * bx, y = (1 - q) * (1 - q) * ay + 2 * (1 - q) * q * cy + q * q * by; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = B.red; ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,120,110,0.45)'; ctx.lineWidth = w * 0.35; ctx.stroke();
}
function pin(x, y, s = 1) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(x + 4 * s, y + 5 * s, 11 * s, 0, TAU); ctx.fill();
  ctx.fillStyle = B.brass; ctx.beginPath(); ctx.arc(x, y, 11 * s, 0, TAU); ctx.fill();
  ctx.fillStyle = '#FFE9B0'; ctx.beginPath(); ctx.arc(x - 3 * s, y - 3 * s, 4 * s, 0, TAU); ctx.fill();
}
// ash-white caps on a thin blood-red bar; a = 0..1 appear (slide + scale)
function tag(text, x, y, size, a, sp = 6) {
  if (a <= 0) return; ctx.save(); ctx.font = `700 ${size}px ${SERIF}`; ctx.letterSpacing = sp + 'px';
  const w = ctx.measureText(text).width + size * 1.1, k = eo(clamp(a));
  ctx.globalAlpha = clamp(a * 3);
  ctx.fillStyle = B.red; ctx.fillRect(x - w / 2 * k, y - size * 0.72, w * k, size * 1.44);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x - w / 2 * k, y + size * 0.62, w * k, 4);
  ctx.globalAlpha = clamp((a - 0.25) * 2.5); ctx.fillStyle = B.ash; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + sp / 2, y + size * 0.04);
  ctx.restore(); ctx.letterSpacing = '0px';
}
function moltenImgs(text, size) {
  ctx.save(); ctx.font = `700 ${size}px ${SERIF}`; ctx.letterSpacing = '8px'; const w = Math.ceil(ctx.measureText(text).width + 40), h = Math.ceil(size * 1.3); ctx.restore(); ctx.letterSpacing = '0px';
  const mk = (kind) => cached(`bmt_${text}_${size}_${kind}`, w, h, 1, () => {
    ctx.font = `700 ${size}px ${SERIF}`; ctx.letterSpacing = '8px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (kind === 'cool') { ctx.fillStyle = B.deep; ctx.fillText(text, w / 2 + 3, h / 2 + 5); }
    ctx.fillStyle = kind === 'hot' ? lg(0, 0, 0, h, [[0, '#FFE08A'], [0.5, '#FF9A2A'], [1, '#E0560E']]) : kind === 'white' ? '#FFF6DA' : lg(0, h * 0.15, 0, h * 0.85, [[0, B.hi], [0.45, B.mid], [1, B.body]]);
    ctx.fillText(text, w / 2, h / 2); ctx.letterSpacing = '0px';
  });
  return { w, h, hot: mk('hot'), cool: mk('cool'), white: mk('white') };
}
// molten pour: fills from the bottom over 0.55 s from lt=t0, white-hot leading edge, then cools to bronze
function molten(text, x, y, size, lt, t0) {
  const m = moltenImgs(text, size), p = eio(seg(lt, t0, t0 + 0.55)), cool = seg(lt, t0 + 0.5, t0 + 1.3);
  if (p <= 0) return;
  const top = y + m.h / 2 - m.h * p;
  ctx.save(); ctx.beginPath(); ctx.rect(x - m.w / 2 - 10, top, m.w + 20, m.h * p + 4); ctx.clip();
  if (cool < 1) { warm(x, y, m.w * 0.55, 0.25 * (1 - cool)); blit(m.hot, m.w / 2, m.h / 2, x, y, 1, 1 - cool); }
  if (cool > 0) blit(m.cool, m.w / 2, m.h / 2, x, y, 1, cool);
  ctx.restore();
  if (p < 1) { ctx.save(); ctx.beginPath(); ctx.rect(x - m.w / 2 - 10, top, m.w + 20, 10); ctx.clip(); blit(m.white, m.w / 2, m.h / 2, x, y); ctx.restore(); }
}
function ash(t, seed = 0, n = 28) { dust(t, n, seed + 50, '233,223,207', 0.35); }

// ───────────── slab, map, tokens ─────────────
const SLAB_W = 600, SLAB_H = 820, ROWS = 9;
const rowY = (i) => 120 + i * 72;
function slabStrokes(i, col, lw) {
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
  let x = 60; const y = rowY(i);
  while (x < SLAB_W - 70) {
    const g = rnd(i * 97 + x), w = 22 + g * 18;
    ctx.beginPath();
    if (g < 0.3) { ctx.moveTo(x, y - 16); ctx.lineTo(x, y + 16); ctx.moveTo(x, y); ctx.lineTo(x + w, y - 10); }
    else if (g < 0.55) { ctx.moveTo(x, y + 14); ctx.quadraticCurveTo(x + w / 2, y - 26, x + w, y + 14); }
    else if (g < 0.8) { ctx.moveTo(x, y - 14); ctx.lineTo(x + w, y - 14); ctx.moveTo(x + w / 2, y - 14); ctx.lineTo(x + w / 2, y + 16); }
    else { ctx.arc(x + w / 2, y, 12, 0.4, TAU - 0.4); }
    ctx.stroke(); x += w + 16;
  }
}
const slabImg = () => cached('bslab', SLAB_W, SLAB_H, 1, () => {
  ctx.fillStyle = lg(0, 0, SLAB_W, SLAB_H, [[0, '#2C2622'], [0.5, '#1E1A17'], [1, '#121010']]); ctx.beginPath(); ctx.roundRect(0, 0, SLAB_W, SLAB_H, [40, 40, 6, 6]); ctx.fill();
  for (let k = 0; k < 900; k++) { const g = rnd(k * 3.1); ctx.fillStyle = g > 0.5 ? 'rgba(200,190,175,0.07)' : 'rgba(0,0,0,0.25)'; ctx.fillRect(rnd(k) * SLAB_W, rnd(k * 7.3) * SLAB_H, 2 + g * 3, 2 + g * 2); }
  ctx.strokeStyle = 'rgba(230,210,180,0.12)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(24, 24, SLAB_W - 48, SLAB_H - 48, [26, 26, 4, 4]); ctx.stroke();
  for (let i = 0; i < ROWS; i++) { slabStrokes(i, 'rgba(0,0,0,0.75)', 7); ctx.save(); ctx.translate(-1.5, -1.5); slabStrokes(i, 'rgba(220,200,170,0.16)', 3); ctx.restore(); }
});
const rowGlowImg = (i) => cached('bslabrow' + i, SLAB_W, 100, 1, () => {
  ctx.translate(0, 50 - rowY(i)); slabStrokes(i, 'rgba(176,18,27,0.45)', 14); slabStrokes(i, '#E0242F', 6); slabStrokes(i, '#FFB0A0', 2);
});
const templeImg = () => cached('btemple', 1080, 1400, 1, () => {
  // pilasters + lintel framing the slab niche
  for (const x of [90, 990]) { ctx.fillStyle = lg(x - 70, 0, x + 70, 0, [[0, '#0C0604'], [0.45, '#3C2516'], [1, '#0C0604']]); ctx.fillRect(x - 70, 160, 140, 1100); ctx.fillRect(x - 90, 140, 180, 40); ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 0; k < 7; k++) ctx.fillRect(x - 70, 260 + k * 140, 140, 8); }
  ctx.fillStyle = lg(0, 90, 0, 160, [[0, '#3C2516'], [1, '#160B06']]); ctx.fillRect(0, 90, 1080, 70);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; for (let x = 0; x < 1080; x += 60) ctx.fillRect(x, 100, 30, 18);
  ctx.fillStyle = '#0E0805'; ctx.fillRect(200, 1180, 680, 60);
  ctx.fillStyle = 'rgba(242,182,107,0.12)'; ctx.fillRect(200, 1180, 680, 4);
});
const MAP_W = 900, MAP_H = 860;
const TOK = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) TOK.push({ x: 150 + c * 200 + (r % 2) * 30, y: 190 + r * 230, house: (r * 4 + c) % 3 === 1 });
const mapImg = () => cached('bmap', MAP_W, MAP_H, 1, () => {
  ctx.fillStyle = lg(0, 0, MAP_W, MAP_H, [[0, '#3A1D0B'], [0.5, '#2A1407'], [1, '#170A04']]); ctx.beginPath(); ctx.roundRect(0, 0, MAP_W, MAP_H, 18); ctx.fill();
  ctx.strokeStyle = 'rgba(242,182,107,0.25)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(16, 16, MAP_W - 32, MAP_H - 32, 12); ctx.stroke();
  // river
  ctx.strokeStyle = 'rgba(10,4,2,0.8)'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(-10, 700); ctx.bezierCurveTo(250, 600, 500, 820, 910, 640); ctx.stroke();
  ctx.strokeStyle = 'rgba(181,105,47,0.35)'; ctx.lineWidth = 3; ctx.stroke();
  // incised field boundaries
  ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(30, 60 + i * 80 + rnd(i) * 30); ctx.lineTo(870, 60 + i * 80 + rnd(i + 9) * 30); ctx.stroke(); }
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(60 + i * 100 + rnd(i + 3) * 30, 30); ctx.lineTo(60 + i * 100 + rnd(i + 5) * 30, 830); ctx.stroke(); }
  // sockets where the tokens sit
  for (const k of TOK) { ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(k.x - 66, k.y - 56, 132, 112); }
});
const plotImg = () => cached('bplot', 140, 120, 1, () => {
  ctx.fillStyle = lg(0, 0, 140, 120, [[0, B.hi], [0.4, B.mid], [1, B.body]]); ctx.beginPath(); ctx.roundRect(6, 6, 128, 108, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(42,18,6,0.7)'; ctx.lineWidth = 4; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(20, 24 + k * 18); ctx.quadraticCurveTo(70, 18 + k * 18, 120, 26 + k * 18); ctx.stroke(); }
  ctx.strokeStyle = B.deep; ctx.lineWidth = 3; ctx.strokeRect(6, 6, 128, 108);
});
const houseImg = () => cached('bhouse', 140, 120, 1, () => {
  ctx.fillStyle = lg(0, 0, 140, 120, [[0, B.hi], [0.45, B.mid], [1, B.body]]);
  ctx.beginPath(); ctx.moveTo(10, 56); ctx.lineTo(70, 8); ctx.lineTo(130, 56); ctx.lineTo(118, 56); ctx.lineTo(118, 114); ctx.lineTo(22, 114); ctx.lineTo(22, 56); ctx.closePath(); ctx.fill();
  ctx.fillStyle = B.deep; ctx.fillRect(58, 74, 24, 40); ctx.strokeStyle = B.deep; ctx.lineWidth = 3; ctx.stroke();
});

export function buildB(add, cue) {
  const T4 = L(4), T5 = L(5), T6 = L(6), T7 = L(7);
  const tNobody = Wd('nobody', 4), tPun = Wd('punished', 4);
  const tCousin = Wd('cousin', 5), tUtt = Wd('Uttama', 5), tNot = Wd('not', 5), tBro = Wd('brother', 5);
  const tRuled = Wd('ruled', 6), tRaja = Wd('Rajaraja', 6), tDid = Wd('did', 6), tInsc = Wd('inscription', 6), tUdai = Wd('Udaiyarkudi', 6);
  const tName = Wd('name', 6), tKill = Wd('killers', 6), tRoyal = Wd('royal', 6), tAnd = Wd('and', 6), tLands = Wd('lands', 6);
  for (const t of [T4, tNobody, T5, tCousin, tNot, T6, tRuled, tDid, tName, tAnd]) cue(t, 'whoosh', { gain: 0.32, dur: 0.3 });

  // b1 ─ lamp orbiting over an empty corridor (years), tally marks scratch onto the wall
  const TAL = []; { let g = 0, i = 0; while (TAL.length < 14) { const inG = i % 5; const gx = 330 + g * 150; TAL.push(inG < 4 ? { x0: gx + inG * 24, y0: 560, x1: gx + inG * 24 + 4, y1: 700 } : { x0: gx - 14, y0: 670, x1: gx + 92, y1: 590 }); i++; if (inG === 4) g++; } }
  const talT = (i, base, span) => base + i * span;
  const drawTally = (lt, base, span, a = 1) => {
    ctx.lineCap = 'round';
    TAL.forEach((m, i) => {
      const p = seg(lt, talT(i, base, span), talT(i, base, span) + 0.08); if (p <= 0) return;
      const j = (rnd(i) - 0.5) * 6;
      ctx.strokeStyle = `rgba(0,0,0,${0.7 * a})`; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(m.x0 + j, m.y0); ctx.lineTo(lerp(m.x0, m.x1, p) - j, lerp(m.y0, m.y1, p)); ctx.stroke();
      ctx.strokeStyle = `rgba(233,223,207,${0.8 * a})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(m.x0 + j - 2, m.y0 - 2); ctx.lineTo(lerp(m.x0, m.x1, p) - j - 2, lerp(m.y0, m.y1, p) - 2); ctx.stroke();
    });
  };
  const b1d = tNobody - T4, b1span = (b1d - 0.15) / TAL.length;
  TAL.forEach((_, i) => { if (i % 2 === 0) cue(T4 + talT(i, 0.08, b1span), 'tock', { gain: 0.32, pan: -0.3 + (i % 5) * 0.15 }); });
  add({ id: 'b1', at: T4, cam: [540, 640], zoom: 0.07, note: 'lamp orbits an empty corridor, tally marks scratch on',
    draw(lt, d, t) {
      blit(wallImg(), 0, 0, 0, 0);
      const a = lt * 5.2 - 1, fx = 540 + Math.cos(a) * 330, fy = 640 + Math.sin(a) * 300 * 0.75;
      warm(fx, fy, 520, 0.38 * flick(t));
      drawTally(lt, 0.08, b1span);
      // pillars lit from the orbiting flame (their shadows swing opposite)
      for (const px of [70, 1010]) { ctx.save(); ctx.globalAlpha = 0.5; ctx.translate(px, 1250); ctx.transform(1, 0, (px - fx) / 1400, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(-60 + (px - fx) * 0.2, -1100, 120, 1100); ctx.restore(); blit(pillarImg(), 100, 1300, px, 1250); }
      oilLamp(fx, fy, 0.8, t, 1);
      smoke(fx, fy - 40, t, 5, '235,210,170', 0.08, 50, 260);
      dark(fx, fy, 640);
      ash(t, 1);
    } });

  // b2 ─ hooded killers exist only as shadows, walking free past the floor lamp; UNPUNISHED
  add({ id: 'b2', at: tNobody, cam: [540, 820], zoom: 0.06, note: 'hooded shadows walk free past the lamp; UNPUNISHED',
    draw(lt, d, t) {
      blit(wallImg(), 0, 0, 0, 0);
      const fx = 540 + Math.sin(lt * 1.3) * 40, fy = 1150;
      warm(fx, fy - 300, 700, 0.42 * flick(t));
      drawTally(99, 0, 0, 0.35);
      for (let i = 0; i < 4; i++) {
        const x = -220 + (lt * 520 + i * 300) % 1600 - 100;
        const s = 0.78 + 0.32 * Math.max(0, 1 - Math.abs(x - fx) / 600);
        hooded(x, 1250, s, lt, 0.85, i * 0.5);
      }
      oilLamp(fx, fy, 0.75, t, 2);
      smoke(fx, fy - 60, t, 5, '235,210,170', 0.08, 60, 320);
      dark(fx, fy - 350, 860);
      tag('UNPUNISHED', 540, 260, 74, seg(t, tPun, tPun + 0.35), 10);
      ash(t, 2);
    } });
  cue(tPun, 'slam', { gain: 0.3 });

  // b3 ─ THE crown floats across the darkness, the lamp carrying it
  add({ id: 'b3', at: T5, cam: [540, 700], zoom: 0.08, note: 'the crown floats across the dark corridor',
    draw(lt, d, t) {
      const p = lt / d, scroll = lt * 260;
      blit(wallImg(), 0, 0, 0, 0);
      const cx = lerp(170, 900, eio(p)), cy = 700 + Math.sin(lt * 2.6) * 30, rot = Math.sin(lt * 1.9) * 0.12;
      const fx = cx - 170, fy = cy + 260;
      warm(fx, fy, 560, 0.4 * flick(t));
      // crown's own shadow on the wall
      ctx.save(); ctx.translate(cx + (cx - fx) * 0.35, cy + 40); ctx.rotate(rot); blit(crownSil(), 80, 205, 0, 0, 2.3, 0.55); ctx.restore();
      for (let k = 0; k < 3; k++) { const px = ((k * 520 - scroll) % 1560 + 1560) % 1560 - 240; blit(pillarImg(), 100, 1300, px, 1300, 1.0, 0.8); }
      crown(cx, cy, 1.9, rot, 0.6 + 0.4 * Math.sin(t * 6));
      // red thread trailing the crown back into darkness
      thread(cx - 60, cy - 30, cx - 700, cy + 120, 120, 1, 4);
      oilLamp(fx, fy, 0.6, t, 3);
      dark(fx + 60, fy - 160, 600);
      ash(t, 3);
    } });

  // b4 ─ Uttama Chola: heavier bronze figure, plain cap; the crown lowers onto him
  const tLand4 = tUtt + 0.22;
  cue(tLand4, 'bell', { gain: 0.5 });
  add({ id: 'b4', at: tCousin, cam: [540, 620], zoom: 0.07, note: 'crown lowers onto Uttama; UTTAMA CHOLA (molten); ILLUSTRATION',
    draw(lt, d, t) {
      blit(wallImg(), 0, 0, 0, 0);
      const fx = 840 + Math.sin(lt * 1.6) * 60, fy = 860 + Math.cos(lt * 2.1) * 30, s = 1.18, fxp = 560, fyp = 1250;
      warm(fx, fy, 640, 0.45 * flick(t));
      wallShadow(figImg('u', 'S'), 250, 740, fxp, fyp, s, fx, 0.7);
      figure('u', fxp, fyp, s, fx);
      const land = seg(t, tCousin, tLand4), cy = lerp(-120, fyp + HEADTOP.u * s, eo(land)), bounce = t > tLand4 ? Math.sin((t - tLand4) * 18) * 6 * Math.exp(-(t - tLand4) * 6) : 0;
      const hit = clamp(1 - (t - tLand4) / 0.5);
      if (t > tLand4 && hit > 0) warm(fxp, cy - 60, 260, 0.5 * hit);
      crown(fxp, cy + bounce, 0.74, Math.sin(lt * 3) * 0.06 * (1 - land), t > tLand4 ? 0.9 : 0.3);
      oilLamp(fx, fy, 0.6, t, 4);
      dark(fx - 120, fy - 120, 760);
      molten('UTTAMA CHOLA', 540, 240, 104, t, tUtt);
      ctx.save(); ctx.font = `700 26px ${SERIF}`; ctx.letterSpacing = '6px'; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(233,223,207,0.7)'; ctx.fillText('ILLUSTRATION', 1030, 1290); ctx.restore(); ctx.letterSpacing = '0px';
      ash(t, 4);
    } });
  cue(tUtt, 'sizzle', { gain: 0.3 });

  // b5 ─ crowned Uttama lit; younger brother stays in the dark at the side; red thread dangles
  add({ id: 'b5', at: tNot, cam: [700, 760], zoom: 0.08, note: 'younger brother stays dark at the side; red thread dangles',
    draw(lt, d, t) {
      blit(wallImg(), 0, 0, 0, 0);
      const fx = lerp(480, 170, eio(lt / d)), fy = 820 + Math.sin(lt * 2) * 20;
      warm(fx, fy, 520, 0.42 * flick(t));
      const ux = 320, yx = 900, s = 1.02;
      wallShadow(figImg('u', 'S'), 250, 740, ux, 1250, s, fx, 0.7);
      figure('u', ux, 1250, s, fx); crown(ux, 1250 + HEADTOP.u * s, 0.64, 0, 0.6);
      figure('y', yx, 1250, s * 0.98, fx);
      oilLamp(fx, fy, 0.55, t, 5);
      dark(fx + 40, fy - 80, 520);
      // the passed-over brother: only a faint ghost edge survives the dark
      blit(figImg('y', 'L'), 250, 740, yx, 1250, s * 0.98, 0.12 + 0.05 * Math.sin(t * 3));
      const sw = Math.sin(lt * 2.2) * 30, ex = yx - 60 + sw, ey = 760 + Math.sin(lt * 1.7) * 14;
      pin(yx - 120, 160); thread(yx - 120, 160, ex, ey, 30, 1, 4);
      ctx.strokeStyle = B.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.quadraticCurveTo(ex + 10 + sw * 0.3, ey + 30, ex - 4, ey + 60); ctx.stroke();
      ash(t, 5);
    } });

  // b6 ─ the lamp comes to the younger brother; he steps out of the dark, his shadow grows
  add({ id: 'b6', at: T6, cam: [660, 760], zoom: 0.12, note: 'lamp travels to the younger brother; he is lit, shadow grows',
    draw(lt, d, t) {
      blit(wallImg(), 0, 0, 0, 0);
      const p = eio(clamp(lt / d)), fx = lerp(-40, 400, p), fy = 900 - Math.sin(p * Math.PI) * 120, yx = 660, s = 1.12;
      warm(fx, fy, 600, 0.45 * flick(t));
      wallShadow(figImg('y', 'S'), 250, 740, yx, 1250, s, fx, 0.75);
      figure('y', yx, 1250, s, fx);
      oilLamp(fx, fy, 0.6, t, 6);
      dark(lerp(fx, yx, 0.35), fy - 60, lerp(420, 760, p));
      thread(yx - 150, 150, yx - 60, 760, 40, 1, 4); pin(yx - 150, 150);
      ash(t, 6);
    } });

  // b7 ─ halo ring ignites; the crown lands on him; RAJARAJA I
  const tLand7 = tRaja + 0.25;
  cue(tLand7, 'bell', { gain: 0.6 }); cue(tRaja, 'swell', { gain: 0.3, dur: 1.2 });
  add({ id: 'b7', at: tRuled, cam: [540, 560], zoom: 0.09, note: 'halo ring ignites, crown lands; RAJARAJA I (molten)',
    draw(lt, d, t) {
      blit(wallImg(), 0, 0, 0, 0);
      const fx = 260 + Math.sin(lt * 1.4) * 50, fy = 960 + Math.sin(lt * 2.3) * 25, s = 1.25, X = 560, hy = 1250 + (-585) * s;
      const halo = eo(seg(t, tRaja - 0.15, tRaja + 0.45));
      warm(fx, fy, 620, 0.45 * flick(t));
      if (halo > 0) {
        warm(X, hy, 420, 0.5 * halo);
        ctx.save(); ctx.translate(X, hy); ctx.rotate(lt * 0.6);
        ctx.strokeStyle = `rgba(255,217,160,${halo})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 170 * (0.6 + 0.4 * halo), 0, TAU * halo); ctx.stroke();
        ctx.strokeStyle = `rgba(242,182,107,${0.8 * halo})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 200 * (0.6 + 0.4 * halo), 0, TAU); ctx.stroke();
        ctx.fillStyle = `rgba(255,217,160,${halo})`; for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; ctx.fillRect(Math.cos(a) * 214 - 4, Math.sin(a) * 214 - 4, 8, 8); }
        ctx.restore();
      }
      wallShadow(figImg('y', 'S'), 250, 740, X, 1250, s, fx, 0.7);
      figure('y', X, 1250, s, fx);
      const land = seg(t, tRuled + 0.1, tLand7), cy = lerp(-160, 1250 + HEADTOP.y * s, eo(land));
      const bounce = t > tLand7 ? Math.sin((t - tLand7) * 18) * 6 * Math.exp(-(t - tLand7) * 6) : 0;
      crown(X, cy + bounce, 0.68, 0.08 * (1 - land) * Math.sin(lt * 4), t > tLand7 ? 1 : 0.3);
      oilLamp(fx, fy, 0.6, t, 7);
      dark(lerp(fx, X, 0.55), 760, 780);
      if (halo > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,190,110,${0.35 * halo})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(X, hy, 200 * (0.6 + 0.4 * halo), 0, TAU); ctx.stroke(); ctx.restore(); }
      molten('RAJARAJA I', 540, 200, 112, t, tRaja + 0.05);
      ash(t, 7);
    } });

  // b8 ─ temple wall, granite slab in rising lamp light; UDAIYARKUDI INSCRIPTION
  cue(tInsc, 'chisel', { gain: 0.35 }); cue(tUdai, 'sizzle', { gain: 0.3 });
  add({ id: 'b8', at: tDid, cam: [540, 560], zoom: 0.08, note: 'granite slab in lamp light; UDAIYARKUDI INSCRIPTION (molten)',
    draw(lt, d, t) {
      blit(wallImg(), 0, 0, 0, 0);
      const p = eio(clamp(lt / d)), fx = lerp(330, 760, p), fy = lerp(1160, 820, p);
      warm(fx, fy, 640, 0.42 * flick(t));
      blit(templeImg(), 0, 0, 0, 0);
      ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#000'; ctx.fillRect(240 + (540 - fx) * 0.08, 400, 640, 820); ctx.restore();
      blit(slabImg(), SLAB_W / 2, SLAB_H, 540, 1190, 0.98);
      oilLamp(fx, fy, 0.6, t, 8);
      smoke(fx, fy - 50, t, 5, '235,210,170', 0.07, 50, 300);
      dark(lerp(fx, 540, 0.4), lerp(fy, 760, 0.5), 820);
      molten('UDAIYARKUDI', 540, 205, 104, t, tUdai);
      molten('INSCRIPTION', 540, 310, 60, t, tUdai + 0.3);
      ash(t, 8);
    } });

  // b9 ─ rows glow red one by one; hooded shadows return and are pinned with red thread; ROYAL OFFICERS
  const rowT = (i) => lerp(tName + 0.05, tAnd - 0.35, i / (ROWS - 1));
  for (let i = 0; i < ROWS; i += 2) cue(rowT(i), 'chisel', { gain: 0.3, pan: -0.2 });
  const SUS = [{ x: 820, y: 700, s: 0.55 }, { x: 960, y: 950, s: 0.55 }, { x: 800, y: 1220, s: 0.55 }];
  const pinT = (i) => tKill + 0.2 + i * 0.22;
  SUS.forEach((_, i) => cue(pinT(i), 'pop', { gain: 0.4, pan: 0.4 }));
  cue(tRoyal, 'slam', { gain: 0.25 });
  add({ id: 'b9', at: tName, cam: [560, 720], zoom: 0.07, note: 'rows glow red; shadows pinned by red thread; ROYAL OFFICERS',
    draw(lt, d, t) {
      blit(wallImg(), 0, 0, 0, 0);
      const fx = 640 + Math.sin(lt * 1.2) * 40, fy = 1120 - lt * 30;
      warm(fx, fy - 300, 760, 0.42 * flick(t));
      const sx = 330, sy = 1210, ss = 1.04;
      blit(slabImg(), SLAB_W / 2, SLAB_H, sx, sy, ss);
      const ox = sx - SLAB_W / 2 * ss, oy = sy - SLAB_H * ss;
      for (let i = 0; i < ROWS; i++) { const g = seg(t, rowT(i), rowT(i) + 0.15); if (g > 0) blit(rowGlowImg(i), 0, 50, ox, oy + rowY(i) * ss, ss, g * (0.85 + 0.15 * Math.sin(t * 8 + i))); }
      SUS.forEach((k, i) => { const a = seg(t, tKill - 0.3 + i * 0.12, tKill + 0.1 + i * 0.12); if (a > 0) hooded(k.x, k.y, k.s, lt * 0.3, 0.9 * a, i); });
      oilLamp(fx, fy, 0.6, t, 9);
      dark(fx - 80, fy - 420, 900);
      SUS.forEach((k, i) => {
        const pt = pinT(i), py = k.y - 230 * k.s, a = seg(t, pt - 0.25, pt);
        const ri = [2, 4, 6][i], rx = ox + (SLAB_W - 60) * ss, ry = oy + rowY(ri) * ss;
        thread(rx, ry, k.x, py, 40, eio(a), 4);
        if (t > pt) { const pop = 1 + 0.6 * Math.exp(-(t - pt) * 10); pin(k.x, py, pop); pin(rx, ry, 0.8); }
      });
      tag('ROYAL OFFICERS', 540, 160, 64, seg(t, tRoyal, tRoyal + 0.35), 8);
      ash(t, 9, 20);
    } });

  // b10 ─ field plots and house tokens pulled off the map by red threads into darkness; LANDS TAKEN
  const pullT = (i) => lerp(tAnd + 0.25, tLands + 0.5, ((i * 5) % TOK.length) / (TOK.length - 1));
  TOK.forEach((_, i) => { if (i % 3 === 0) cue(pullT(i) + 0.25, 'zip', { gain: 0.22, dur: 0.3, pan: (TOK[i].x - 450) / 600 }); });
  cue(tLands, 'thud', { gain: 0.6 });
  add({ id: 'b10', at: tAnd, cam: [540, 700], zoom: 0.08, note: 'tokens pulled off the land map by red threads; LANDS TAKEN',
    draw(lt, d, t) {
      blit(wallImg(), 0, 0, 0, 0);
      const fx = 540 + Math.sin(lt * 1.5) * 260, fy = 1180;
      warm(fx, 760, 700, 0.35 * flick(t));
      const mx = 540 - MAP_W / 2, my = 330, sh = t > tLands ? Math.sin((t - tLands) * 40) * 6 * Math.exp(-(t - tLands) * 7) : 0;
      blit(mapImg(), 0, 0, mx, my + sh);
      TOK.forEach((k, i) => {
        const t0 = pullT(i), th = seg(t, t0, t0 + 0.25), up = seg(t, t0 + 0.25, t0 + 1.0);
        const x = mx + k.x, y0 = my + k.y + sh, y = y0 - eio(up) * 900 * up, topY = -150;
        if (up < 1) blit(k.house ? houseImg() : plotImg(), 70, 60, x + Math.sin(up * 6 + i) * 10 * up, y, 1 - 0.3 * up, 1 - up * 0.6);
        if (th > 0 && up < 1) { thread(x, topY, x, y - 40, 0, th, 4); if (th >= 1) pin(x, y - 40, 0.8); }
      });
      oilLamp(fx, fy, 0.6, t, 10);
      dark(fx * 0.4 + 540 * 0.6, 820, 760);
      tag('LANDS TAKEN', 540, 210, 76, seg(t, tLands, tLands + 0.35), 10);
      ash(t, 10, 22);
    } });
}
