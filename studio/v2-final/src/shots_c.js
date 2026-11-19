// EPISODE 2 · worker C : the stone itself (macro), the father's tower vs the son's, the lost city, fog and doubt, the temple that survived, end card
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';
import * as A from './art.js';
const { P } = K;
const { lg, poly, fillP, rgba, mixc } = A;

const DK = '#0E0503';
const GOLD = '#E8B63A';
const serif = (sz, ls = 0) => { ctx.font = `700 ${sz}px Caladea`; ctx.letterSpacing = `${ls}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; };
const txt = (s, x, y, sz, col, ls = 4) => { serif(sz, ls); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.letterSpacing = '0px'; };
/** a dark rounded label with a gold edge, text centred */
function tag(s, x, y, sz = 32, a = 1, ls = 4) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; serif(sz, ls); const w = ctx.measureText(s).width + sz * 1.6, h = sz * 1.9;
  rr(x - w / 2, y - h / 2, w, h, h * 0.22); ctx.fillStyle = 'rgba(26,12,5,0.92)'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.fillStyle = P.cream; ctx.fillText(s, x, y + 2); ctx.letterSpacing = '0px'; ctx.restore();
}
/** dark palm-leaf board (full bleed) with grain, cord holes and a thin gold frame */
function leafBoard(warm = 0.3, t = 0) {
  ctx.fillStyle = '#150B06'; ctx.fillRect(-300, -300, W + 600, H + 600);
  const bx = 36, by = 210, bw = W - 72, bh = 1260;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; rr(bx, by, bw, bh, 26); ctx.fillStyle = lg(0, by, 0, by + bh, [[0, '#3B2110'], [0.5, '#2E1809'], [1, '#22110A']]); ctx.fill(); ctx.restore();
  ctx.save(); rr(bx, by, bw, bh, 26); ctx.clip(); ctx.strokeStyle = 'rgba(120,80,40,0.2)'; ctx.lineWidth = 2;
  for (let yy = by + 8; yy < by + bh; yy += 9) { ctx.beginPath(); ctx.moveTo(bx, yy); ctx.lineTo(bx + bw, yy + (rnd(yy | 0) - 0.5) * 2.5); ctx.stroke(); }
  ctx.restore();
  rr(bx + 14, by + 14, bw - 28, bh - 28, 18); ctx.strokeStyle = 'rgba(232,182,58,0.55)'; ctx.lineWidth = 3; ctx.stroke();
  for (const yy of [by + 250, by + bh - 250]) { circle(bx + 40, yy, 15, DK); ctx.strokeStyle = P.cord; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(bx + 40, yy, 15, 0, TAU); ctx.stroke(); }
  K.glow(120, 1440, 760, '255,160,50', warm * (0.9 + 0.1 * Math.sin(t * 7)));
}
const sunRays = (x, y, t, a, n = 7) => {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const ang = Math.PI * (0.55 + i * 0.13) + Math.sin(t * 0.3 + i) * 0.02, w0 = 0.035 + rnd(i) * 0.03, R = 2600;
    const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * R, y - Math.sin(ang) * R);
    g.addColorStop(0, `rgba(255,214,140,${a * (0.5 + 0.5 * rnd(i + 4))})`); g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang - w0) * R, y - Math.sin(ang - w0) * R); ctx.lineTo(x + Math.cos(ang + w0) * R, y - Math.sin(ang + w0) * R); ctx.closePath(); ctx.fill(); }
  ctx.restore();
};
const mound = (cx, base, w, h, c0, c1, c2, tufts = 0, seed = 0) => {
  ctx.beginPath(); ctx.moveTo(cx - w / 2, base + 4); ctx.bezierCurveTo(cx - w * 0.32, base - h * 1.32, cx + w * 0.32, base - h * 1.32, cx + w / 2, base + 4); ctx.closePath();
  ctx.fillStyle = lg(cx - w / 2, 0, cx + w / 2, 0, [[0, c0], [0.55, c1], [1, c2]]); ctx.fill();
  if (tufts) { ctx.strokeStyle = c0; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < tufts; i++) { const u = 0.12 + 0.76 * rnd(seed + i), x = cx + (u - 0.5) * w, y = base - h * 1.0 * Math.sin(u * Math.PI) * 0.98 + 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y - 16); ctx.moveTo(x, y); ctx.lineTo(x + 5, y - 14); ctx.stroke(); } }
};
const puff = (x, y, r, a, col = '214,160,120', sy = 0.4) => {
  if (a <= 0.003) return; ctx.save(); ctx.translate(x, y); ctx.scale(1, sy); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();
};
const tinyPerson = (x, y, h, pose, t, ph) => {
  ctx.save(); ctx.translate(x, y); const sw = Math.sin(t * 0.9 + ph) * h * 0.012;
  if (pose === 1) { // kneeling and bowed
    ell(0, -h * 0.12, h * 0.3, h * 0.14, DK); circle(h * 0.1 + sw, -h * 0.34, h * 0.09, DK); line([[h * 0.06, -h * 0.26], [h * 0.34, -h * 0.1]], DK, h * 0.07);
  } else {
    line([[-h * 0.07, 0], [-h * 0.06, -h * 0.5]], DK, h * 0.11); line([[h * 0.07, 0], [h * 0.06, -h * 0.5]], DK, h * 0.11);
    ctx.beginPath(); ctx.moveTo(-h * 0.13, -h * 0.08); ctx.lineTo(-h * 0.1, -h * 0.82); ctx.lineTo(h * 0.1, -h * 0.82); ctx.lineTo(h * 0.13, -h * 0.08); ctx.closePath(); ctx.fillStyle = DK; ctx.fill();
    circle(sw, -h * 0.92, h * 0.095, DK);
    if (pose === 2) line([[-h * 0.1, -h * 0.74], [0, -h * 1.12]], DK, h * 0.055), line([[h * 0.1, -h * 0.74], [0, -h * 1.12]], DK, h * 0.055);
    else line([[-h * 0.1, -h * 0.74], [-h * 0.02, -h * 0.58]], DK, h * 0.055), line([[h * 0.1, -h * 0.74], [h * 0.02, -h * 0.58]], DK, h * 0.055);
  }
  ctx.restore();
};

// ───────────── the stone tower as a thin outline (gold ink) ─────────────
let _tp = null;
function towerPts() {
  if (_tp) return _tp;
  const R = []; let y = 0; const step = (w, h, lip = 0) => { R.push([w / 2, y], [w / 2, y - h]); y -= h; if (lip) { R.push([w / 2 + lip, y], [w / 2 + lip, y - 12]); y -= 12; } };
  const ledges = [];
  for (const [w, h] of [[800, 24], [760, 22], [720, 22]]) { step(w, h); ledges.push([w / 2, y]); }
  step(700, 172, 22); ledges.push([372, y]); step(674, 150, 22); ledges.push([359, y]);
  for (let i = 0; i < 13; i++) { const w = 640 - i * 35, h = 62 - i; step(w, h, 10); ledges.push([w / 2 + 10, y]); }
  step(226, 62); R.push([146, y], [146, y - 26]); y -= 26; R.push([128, y], [128, y - 20]); y -= 20;
  for (let u = 0; u <= 1.001; u += 0.1) R.push([112 * Math.cos(u * Math.PI / 2) + 0.01, y - 132 * Math.sin(u * Math.PI / 2)]);
  const dy = y - 132; R.push([10, dy - 6], [10, dy - 44], [26, dy - 44], [8, dy - 100], [0, dy - 142]);
  _tp = { R, H0: -(dy - 142), ledges }; return _tp;
}
/** draw the tower outline with its base-centre at (x, y), scaled s, drawn on from the bottom up to p (0..1) */
function towerOutline(x, y, s, p, col = GOLD, lw = 4) {
  if (p <= 0) return; const { R, H0, ledges } = towerPts();
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.rect(-600, -H0 * p - 4, 1200, H0 * p + 14); ctx.clip();
  const path = () => { ctx.beginPath(); ctx.moveTo(R[0][0], R[0][1]); for (const q of R) ctx.lineTo(q[0], q[1]); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(-R[i][0], R[i][1]); ctx.closePath(); };
  path(); ctx.fillStyle = 'rgba(232,182,58,0.07)'; ctx.fill();
  ctx.lineJoin = 'round'; path(); ctx.strokeStyle = 'rgba(255,190,70,0.22)'; ctx.lineWidth = (lw * 3.2) / s; ctx.stroke();
  path(); ctx.strokeStyle = col; ctx.lineWidth = lw / s; ctx.stroke();
  ctx.strokeStyle = 'rgba(232,182,58,0.45)'; ctx.lineWidth = 2 / s; ctx.beginPath(); for (const [hw, yy] of ledges) { ctx.moveTo(-hw, yy); ctx.lineTo(hw, yy); } ctx.stroke();
  ctx.restore();
  if (p < 1) { const fy = y - H0 * s * p; ctx.save(); ctx.globalCompositeOperation = 'lighter'; K.glow(x, fy, 150, '255,200,100', 0.7); ctx.restore(); }
}

// ───────────── a granite macro texture, made once ─────────────
function graniteTex() {
  return A.cached('c1:granite', W, H, 1, () => {
    ctx.fillStyle = lg(0, 0, W, H, [[0, '#7A6652'], [0.5, '#5E4D3D'], [1, '#43362A']]); ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { const x = rnd(i) * W, y = rnd(i + 500) * H, r = 40 + rnd(i + 900) * 160; ctx.globalAlpha = 0.07; ell(x, y, r, r * (0.5 + rnd(i + 3) * 0.5), rnd(i + 70) > 0.5 ? '#B9A07C' : '#2A1E14', rnd(i) * 3); }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 9000; i++) { const x = rnd(i * 2 + 1) * W, y = rnd(i * 3 + 7) * H, k = rnd(i * 5 + 2), r = 0.8 + rnd(i + 4) * 2.6;
      ctx.fillStyle = k < 0.35 ? 'rgba(226,208,170,0.55)' : k < 0.6 ? 'rgba(20,12,6,0.6)' : k < 0.8 ? 'rgba(168,118,92,0.5)' : 'rgba(240,232,215,0.4)'; ctx.fillRect(x, y, r, r * (0.6 + rnd(i) * 0.8)); }
    // chisel dressing: rows of short slanted grooves (dark groove, bright lip on the lamp side)
    ctx.lineCap = 'round';
    for (let i = 0; i < 300; i++) { const x = rnd(i + 31) * (W + 100) - 50, y = rnd(i + 91) * H, len = 70 + rnd(i + 5) * 120, a = -0.62 + (rnd(i + 8) - 0.5) * 0.18, dx = Math.cos(a) * len, dy = Math.sin(a) * len;
      ctx.strokeStyle = 'rgba(18,9,4,0.55)'; ctx.lineWidth = 4 + rnd(i) * 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke();
      ctx.strokeStyle = 'rgba(236,208,150,0.45)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - 5, y - 2); ctx.lineTo(x + dx - 5, y + dy - 2); ctx.stroke(); }
    // a few fine cracks
    ctx.strokeStyle = 'rgba(14,8,4,0.6)'; ctx.lineWidth = 2.2; for (let i = 0; i < 5; i++) { let x = rnd(i + 200) * W, y = rnd(i + 210) * H; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 7; k++) { x += (rnd(i * 9 + k) - 0.3) * 90; y += (rnd(i * 13 + k) - 0.3) * 80; ctx.lineTo(x, y); } ctx.stroke(); }
  });
}
const BRICK = '#8A4A2C';
function brickStumpImg(w, h, seed) {
  return A.cached(`c3:bs${seed}`, w + 16, h + 16, 1, () => {
    ctx.translate(8, h + 8); const cw = 30, bh = 15, n = Math.ceil(w / cw);
    for (let j = 0; j < n; j++) { const edge = Math.min(j, n - 1 - j) / (n / 2), hj = h * (0.22 + 0.78 * (0.35 * edge + 0.65 * rnd(seed * 17 + j * 3)));
      for (let y = 0, r = 0; y < hj; y += bh, r++) { const hh = Math.min(bh, hj - y), off = (r % 2) * cw * 0.5, bx = j * cw - off; const c = mixc('#6E3820', '#B8683C', rnd(seed + j * 31 + r * 7)); ctx.fillStyle = c; ctx.fillRect(Math.max(0, bx), -y - hh, Math.min(cw, w - Math.max(0, bx)) - 2, hh - 1.5); } }
    ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = lg(0, 0, w, 0, [[0, 'rgba(20,6,2,0.5)'], [0.5, 'rgba(20,6,2,0.05)'], [1, 'rgba(255,200,110,0.28)']]); ctx.fillRect(0, -h, w, h); ctx.globalCompositeOperation = 'source-over';
  });
}
function pillarStumpImg(w, h, seed) {
  return A.cached(`c3:ps${seed}`, w + 120, h + 90, 1, () => {
    ctx.translate((w + 120) / 2, h + 70);
    const hw = w / 2;
    rr(-hw * 1.5, -34, hw * 3, 34, 4); ctx.fillStyle = lg(-hw * 1.5, 0, hw * 1.5, 0, [[0, '#4A3B2C'], [0.6, '#8E785A'], [1, '#C7AA78']]); ctx.fill();
    const top = [[-hw, -34], [-hw, -h * 0.9], [-hw * 0.5, -h * 0.97], [-hw * 0.1, -h * 0.84], [hw * 0.35, -h * 1.0], [hw, -h * 0.8], [hw, -34]];
    fillP(top, '#000'); ctx.fillStyle = lg(-hw, 0, hw, 0, [[0, '#3E3024'], [0.45, '#8A7458'], [0.85, '#D2B27A'], [1, '#E4C58A']]); poly(top); ctx.fill();
    ctx.strokeStyle = 'rgba(30,18,8,0.45)'; ctx.lineWidth = 3; for (const k of [0.25, 0.5, 0.75]) { ctx.beginPath(); ctx.moveTo(-hw, -34 - (h - 34) * k * 0.9); ctx.lineTo(hw, -34 - (h - 34) * k * 0.9); ctx.stroke(); }
    ctx.fillStyle = 'rgba(94,140,74,0.55)'; for (let i = 0; i < 6; i++) ell(-hw + rnd(seed + i) * w, -34 - rnd(seed + i + 5) * h * 0.4, 20 + rnd(i) * 14, 8, 'rgba(94,140,74,0.5)');
    ell(hw * 1.1, -2, hw * 0.9, 12, 'rgba(10,4,0,0.5)');
  });
}

// ═════════════════════════════════════════════ build ═════════════════════════════════════════════
export function buildC(add, cue) {
  const T1 = L(9) - 0.1, T2 = L(10) - 0.1, T3 = L(11) - 0.1, T4 = L(13) - 0.1, T5 = L(15) - 0.1;

  // ═════════ C1 · line 9 · MACRO: granite, chisel marks, falling dust, a lamp raking light ═════════
  const HITS = [0.28, 0.66, 1.04, 1.42], HP = [[640, 930], [560, 1010], [470, 1090], [380, 1170]];
  add({ id: 'C1', at: T1, cam: [520, 1000], zoom: 0.12, note: 'MACRO: granite with chisel marks, chisel strikes, dust falls, lamp rakes light', draw(lt, d, t) {
    ctx.drawImage(graniteTex(), 0, 0);
    ctx.fillStyle = '#2A1A0E'; ctx.fillRect(-300, -300, W + 600, 300); ctx.fillRect(-300, H, W + 600, 300); ctx.fillRect(-300, -300, 300, H + 600); ctx.fillRect(W, -300, 300, H + 600);
    // raking light from the lamp, low on the left; deep shadow to the right
    ctx.fillStyle = lg(0, 0, W, 0, [[0, 'rgba(10,4,0,0)'], [0.45, 'rgba(10,4,0,0.35)'], [1, 'rgba(10,4,0,0.88)']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    const fl = 0.92 + 0.08 * Math.sin(t * 9) + 0.03 * Math.sin(t * 23);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; K.glow(60, 1330, 1250, '255,170,70', 0.55 * fl); K.glow(60, 1330, 520, '255,210,130', 0.4 * fl); ctx.restore();
    // fresh cuts: pale wedges that appear at each strike
    HITS.forEach((h0, i) => { const a = seg(lt, h0, h0 + 0.08); if (a <= 0) return; const [x, y] = HP[i];
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.62); ctx.globalAlpha = a; rr(-70, -9, 140, 18, 8); ctx.fillStyle = '#EBD4A0'; ctx.fill(); rr(-62, -4, 124, 11, 5); ctx.fillStyle = '#1C0F07'; ctx.fill(); ctx.restore(); });
    // the chisel (steel, from upper right), jolts on each strike
    let ci = 0; HITS.forEach((h0, i) => { if (lt >= h0 - 0.1) ci = i; }); const [cx, cy] = HP[ci], age = lt - HITS[ci], jolt = age >= 0 ? -16 * Math.exp(-age * 26) * Math.cos(age * 60) : 0, vis = seg(lt, 0, 0.12);
    ctx.save(); ctx.globalAlpha = vis; ctx.translate(cx + 40, cy - 22); ctx.rotate(-1.05); ctx.translate(jolt, 0);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, -40); ctx.lineTo(2200, -46); ctx.lineTo(2200, 46); ctx.lineTo(150, 40); ctx.closePath();
    ctx.fillStyle = lg(0, -46, 0, 46, [[0, '#E8C890'], [0.4, '#8E8478'], [1, '#2C2824']]); ctx.fill(); ctx.restore();
    // dust and sparks thrown at each strike
    for (let i = 0; i < HITS.length; i++) { const age2 = lt - HITS[i]; if (age2 < 0 || age2 > 1.5) continue; const [ox, oy] = HP[i];
      for (let k = 0; k < 16; k++) { const vx = (rnd(i * 40 + k) - 0.65) * 190, vy = -110 * rnd(i * 40 + k + 9), x = ox + vx * age2 * 0.8 + Math.sin(age2 * 3 + k) * 8, y = oy + vy * age2 + 120 * age2 * age2 * 0.8 + age2 * 60, a = (1 - age2 / 1.5) * 0.75, r = 5 + rnd(k + i) * 9;
        ctx.fillStyle = `rgba(236,214,170,${a * 0.7})`; ctx.beginPath(); ctx.arc(x, y, r * (1 + age2), 0, TAU); ctx.fill(); }
      if (age2 < 0.22) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 7; k++) { const an = -0.9 + rnd(k + i * 5) * 2.2, v = 280 * rnd(k + 3 + i) * age2; ctx.strokeStyle = `rgba(255,214,120,${1 - age2 / 0.22})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox + Math.cos(an) * v, oy - Math.sin(an) * v); ctx.lineTo(ox + Math.cos(an) * v * 1.4, oy - Math.sin(an) * v * 1.4); ctx.stroke(); } ctx.restore(); } }
    A.dust(t, 34, 21, '255,226,170', 0.55);
    K.lamp(40, 1560, 0.78, t, 1);
    K.vignette(0.5);
  } });
  for (const h of HITS) cue(T1 + h, 'chisel', { gain: 0.75 });

  // ═════════ C2 · line 10 · two towers in gold line on dark palm leaf, a dimension line between the tops ═════════
  const TW = towerPts(), SF = 880 / TW.H0, SS = SF * 0.93, BY = 1250, FX = 280, SX = 790;
  add({ id: 'C2', at: T2, cam: [540, 820], zoom: 0.06, note: 'diagram: father tower (THANJAVUR) slightly taller than son tower, gold dimension line, TRADITIONAL IDEA, NOT PROVEN', draw(lt, d, t) {
    leafBoard(0.28, t);
    const p1 = eo(seg(lt, 0.2, 1.5)), p2 = eo(seg(lt, 1.2, 2.5)), pd = eo(seg(lt, 2.6, 3.4)), pp = seg(lt, 3.0, 3.6);
    // ground line
    ctx.strokeStyle = 'rgba(232,182,58,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, BY + 3); ctx.lineTo(70 + 940 * eo(seg(lt, 0, 0.8)), BY + 3); ctx.stroke();
    towerOutline(FX, BY, SF, p1); towerOutline(SX, BY, SS, p2);
    const yF = BY - TW.H0 * SF, yS = BY - TW.H0 * SS;
    // dimension line between the tops
    if (pd > 0) { const dx = 546, gy = lerp(yF, yS, 0.5);
      ctx.save(); ctx.globalAlpha = pd; ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.setLineDash([10, 9]);
      ctx.beginPath(); ctx.moveTo(FX + 20, yF); ctx.lineTo(dx + 40, yF); ctx.moveTo(SX - 20, yS); ctx.lineTo(dx - 40, yS); ctx.stroke(); ctx.setLineDash([]);
      ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(dx, yF); ctx.lineTo(dx, yS); ctx.moveTo(dx - 20, yF); ctx.lineTo(dx + 20, yF); ctx.moveTo(dx - 20, yS); ctx.lineTo(dx + 20, yS); ctx.stroke();
      fillP([[dx, yF], [dx - 9, yF + 20], [dx + 9, yF + 20]], GOLD); fillP([[dx, yS], [dx - 9, yS - 20], [dx + 9, yS - 20]], GOLD);
      K.glow(dx, gy, 90, '255,200,100', 0.4 * pd); ctx.restore(); }
    // labels
    ctx.save(); ctx.globalAlpha = eo(seg(lt, 1.1, 1.8)); txt('THANJAVUR', FX, BY + 52, 40, P.cream, 6); ctx.restore();
    ctx.save(); ctx.globalAlpha = eo(seg(lt, 2.0, 2.7)); txt('GANGAIKONDA CHOLAPURAM', SX - 22, BY + 52, 31, P.cream, 2); ctx.restore();
    ctx.letterSpacing = '0px'; if (pp > 0) K.plaque('TRADITIONAL IDEA, NOT PROVEN', 540, 1400, eob(pp), 30);
    A.dust(t, 18, 8, '255,214,150', 0.35); K.vignette(0.45);
  } });
  cue(T2 + 0.3, 'whoosh', { gain: 0.45 }); cue(T2 + 1.3, 'whoosh', { gain: 0.4 }); cue(T2 + 2.7, 'sparkle', { gain: 0.5 }); cue(T2 + 3.5, 'pop', { gain: 0.7 });

  // ═════════ C3 · lines 11-12 · gold-ink city plan, dissolve into mounds, walls and pillar stumps; tilt down ═════════
  const PCX = 540, PCY = 840;
  function strokeDash(len, p, w, col) {
    ctx.strokeStyle = 'rgba(255,190,70,0.2)'; ctx.lineWidth = w * 3; ctx.setLineDash([len * p, len * 3]); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); ctx.setLineDash([]);
  }
  const rectD = (x, y, w, h, p, lw = 4.5, col = GOLD) => { if (p <= 0) return; ctx.beginPath(); ctx.rect(x, y, w, h); strokeDash(2 * (w + h), p, lw, col); };
  const circD = (x, y, r, p, lw = 4) => { if (p <= 0) return; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); strokeDash(TAU * r, p, lw, GOLD); };
  function cityPlan(lt, t, a) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(PCX, PCY); ctx.lineJoin = 'round';
    const g = (u0, u1) => eo(seg(lt, u0, u1));
    K.glow(0, 0, 640, '255,180,70', 0.3 * g(0.2, 2.6) * (0.9 + 0.1 * Math.sin(t * 3)));
    rectD(-410, -430, 820, 860, g(0.1, 1.6)); rectD(-394, -414, 788, 828, g(0.3, 1.8), 2.5, 'rgba(232,182,58,0.6)');
    // gates and corner bastions
    for (const [gx, gy, gw, gh] of [[-30, -446, 60, 30], [-30, 416, 60, 30], [-426, -30, 30, 60], [396, -30, 30, 60]]) { const p = g(1.4, 2.0); if (p > 0) { ctx.globalAlpha = a * p; rr(gx, gy, gw, gh, 5); ctx.fillStyle = 'rgba(232,182,58,0.25)'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3.5; ctx.stroke(); } }
    ctx.globalAlpha = a; for (const [bx, by] of [[-410, -430], [410, -430], [-410, 430], [410, 430]]) circD(bx, by, 30, g(1.0, 1.9), 4);
    // streets from the gates
    ctx.setLineDash([14, 12]); ctx.strokeStyle = 'rgba(232,182,58,0.45)'; ctx.lineWidth = 2.5; const ps = g(1.6, 2.6);
    ctx.beginPath(); ctx.moveTo(0, -416); ctx.lineTo(0, -416 + 246 * ps); ctx.moveTo(0, 416); ctx.lineTo(0, 416 - 246 * ps); ctx.moveTo(-396, 0); ctx.lineTo(-396 + 206 * ps, 0); ctx.moveTo(396, 0); ctx.lineTo(396 - 206 * ps, 0); ctx.stroke(); ctx.setLineDash([]);
    // fort (top left) with round bastions
    rectD(-366, -380, 210, 170, g(1.2, 2.3)); for (const [bx, by] of [[-366, -380], [-156, -380], [-366, -210], [-156, -210]]) circD(bx, by, 17, g(1.9, 2.6), 3.5);
    rectD(-326, -340, 130, 90, g(1.9, 2.7), 2.5, 'rgba(232,182,58,0.6)');
    // palace (bottom right) with courtyard and a row of pillars
    rectD(130, 170, 250, 210, g(1.5, 2.6)); rectD(160, 200, 190, 110, g(2.0, 2.8), 2.5, 'rgba(232,182,58,0.6)');
    for (let i = 0; i < 7; i++) { const p = g(2.4 + i * 0.05, 3.0 + i * 0.05); if (p > 0) { ctx.globalAlpha = a * p; circle(160 + i * 31.7, 345, 7, GOLD); } } ctx.globalAlpha = a;
    // the central temple: nested enclosures and a lit sanctum
    rectD(-190, -190, 380, 380, g(0.9, 2.4)); rectD(-130, -130, 260, 260, g(1.4, 2.7)); rectD(-70, -70, 140, 140, g(1.8, 2.9), 4);
    const sp = g(2.3, 3.0); if (sp > 0) { ctx.globalAlpha = a * sp; rr(-34, -34, 68, 68, 6); ctx.fillStyle = lg(0, -34, 0, 34, [[0, '#FFE9A8'], [1, GOLD]]); ctx.fill(); K.glow(0, 0, 200, '255,200,100', 0.8 * sp * (0.9 + 0.1 * Math.sin(t * 5))); }
    ctx.restore();
  }
  // the ruins, in world coordinates (horizon at y = 900); the camera tilts down by moving the world up
  function ruins(lt, t, ty) {
    ctx.save(); ctx.translate(0, ty);
    ctx.fillStyle = lg(0, -300, 0, 905, [[0, '#2E1228'], [0.45, '#8E3A34'], [0.8, '#F09A48'], [1, '#FFD488']]); ctx.fillRect(-300, -300, W + 600, 1210);
    K.glow(790, 880, 760, '255,200,120', 0.7); circle(790, 892, 70, '#FFF0BC');
    for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(120,40,40,${0.28})`; ell(((i * 340 + t * 6) % 1500) - 200, 330 + i * 120, 240, 16, 'rgba(120,40,40,0.28)'); }
    ctx.fillStyle = lg(0, 900, 0, 2900, [[0, '#7A4528'], [0.25, '#4D2C18'], [1, '#1A0C06']]); ctx.fillRect(-300, 900, W + 600, 2100);
    // far mounds, hazy
    for (const [x, w, h, s] of [[90, 520, 60, 1], [460, 640, 78, 2], [900, 560, 64, 3]]) mound(x, 930, w, h, '#5A3322', '#9A5C36', '#E09A58', 0, s);
    A.haze(880, 1010, '#F0B070', 0, 0.45);
    // mid mounds, grassy
    for (const [x, w, h, s, b] of [[230, 700, 150, 11, 1090], [760, 760, 170, 12, 1120], [540, 520, 100, 13, 1000]]) { ctx.fillStyle = 'rgba(10,4,0,0.3)'; ell(x - w * 0.55, b + 10, w * 0.6, 16, 'rgba(10,4,0,0.3)'); mound(x, b, w, h, '#2E2A14', '#5A5424', '#C8A24A', 24, s); }
    // brick wall stumps with long shadows
    for (const [x, y, w, h, s, sc] of [[110, 1330, 330, 170, 1, 0.8], [650, 1250, 300, 150, 2, 0.7], [380, 1510, 400, 190, 3, 1.0]]) { ctx.fillStyle = 'rgba(10,4,0,0.34)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 260 * sc, y + 18); ctx.lineTo(x - 250 * sc, y + 48); ctx.lineTo(x + w * sc, y + 10); ctx.fill(); A.blit(brickStumpImg(w, h, s), 8, h + 8, x, y, sc); }
    A.fog(1150, 160, 0.22, '240,170,110');
    // broken pillar stumps in the foreground
    for (const [x, w, h, s, by] of [[210, 150, 430, 1, 2150], [630, 140, 280, 2, 2190], [930, 150, 500, 3, 2140]]) { ctx.fillStyle = 'rgba(10,4,0,0.38)'; ctx.beginPath(); ctx.moveTo(x - 60, by); ctx.lineTo(x - 560, by + 40); ctx.lineTo(x - 520, by + 95); ctx.lineTo(x + 70, by + 18); ctx.fill(); A.blit(pillarStumpImg(w, h, s), (w + 120) / 2, h + 70, x, by, 1); }
    rr(330, 2120, 120, 70, 12); ctx.fillStyle = '#7A6446'; ctx.fill(); ell(390, 2128, 56, 10, '#C7AA78');
    ctx.strokeStyle = '#30280F'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 70; i++) { const x = rnd(i + 5) * W, y = 1560 + rnd(i + 8) * 1000, h = 14 + rnd(i) * 22; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y - h); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - h * 0.8); ctx.stroke(); }
    K.glow(790, 900, 1200, '255,170,70', 0.18);
    ctx.restore();
  }
  add({ id: 'C3', at: T3, cam: [540, 900], zoom: 0.03, note: 'gold-ink plan of the old city glows, dissolves into low mounds, brick stumps, broken pillars; camera tilts down', draw(lt, d, t) {
    const r = eio(seg(lt, 3.5, 5.6)), ty = -700 * eio(seg(lt, 4.6, d));
    leafBoard(0.25, t);
    if (r > 0) { ctx.save(); ctx.globalAlpha = r; ruins(lt, t, ty); ctx.restore(); }
    cityPlan(lt, t, 1 - r * 0.97);
    if (r > 0 && r < 1) { ctx.save(); ctx.globalAlpha = Math.sin(r * Math.PI) * 0.9; K.embers(t, 40, 3, '255,205,120'); ctx.restore(); }
    A.dust(t, 22, 14, '255,214,150', r * 0.4); K.vignette(0.45);
  } });
  cue(T3 + 0.4, 'swell', { gain: 0.5 }); cue(T3 + 3.7, 'whoosh', { gain: 0.5 }); cue(T3 + 5.3, 'rumble', { gain: 0.5 });

  // ═════════ C4 · lines 13-14 · fog, two doubtful arrows, UNCLEAR; the fog parts on the lit temple ═════════
  const PAR = 6.85;      // fog starts to part at the start of line 14
  const arrow = (x0, y0, x1, y1, p, a) => {
    if (a <= 0) return; const x = lerp(x0, x1, p), y = lerp(y0, y1, p), ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([14, 14]); ctx.strokeStyle = 'rgba(232,182,58,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.translate(x, y); ctx.rotate(ang); K.glow(0, 0, 150, '255,90,60', 0.35);
    ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(-10, -44); ctx.lineTo(-10, -18); ctx.lineTo(-120, -18); ctx.lineTo(-120, 18); ctx.lineTo(-10, 18); ctx.lineTo(-10, 44); ctx.closePath();
    ctx.fillStyle = P.kumkum; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
  };
  const fogPuffs = [];
  for (let i = 0; i < 18; i++) fogPuffs.push({ x: rnd(i + 2) * 1700 - 300, y: 1040 + rnd(i + 30) * 560 - (i % 3) * 20, r: 360 + rnd(i + 60) * 300, sp: 8 + rnd(i + 90) * 14, a: 0.5 + rnd(i + 5) * 0.3 });
  add({ id: 'C4', at: T4, cam: [540, 1100], zoom: 0.09, note: 'fog over mounds; PANDYA REVENGE? / DELHI RAIDS? arrows; ? UNCLEAR; fog parts, lit temple, lamps, tiny worshippers', draw(lt, d, t) {
    const ta = eio(seg(lt, PAR, PAR + 1.5)), parted = eo(seg(lt, PAR, PAR + 2.4)), pan = lerp(24, -24, lt / d);
    // dusk sky and ground
    ctx.fillStyle = lg(0, -300, 0, 1000, [[0, '#1E0C1C'], [0.5, '#5E2230'], [0.85, '#B8562E'], [1, '#F09A48']]); ctx.fillRect(-300, -300, W + 600, 1300);
    K.glow(520, 1000, 800, '255,190,110', 0.55); A.stars(t, 26, 0.5, 380, 7);
    ctx.fillStyle = lg(0, 1000, 0, 1920, [[0, '#4A2616'], [1, '#150905']]); ctx.fillRect(-300, 1000, W + 600, 1100);
    // far mounds drift slowly (parallax)
    ctx.save(); ctx.translate(pan * 0.4, 0); for (const [x, w, h, s] of [[60, 600, 70, 1], [520, 700, 90, 2], [960, 640, 70, 3]]) mound(x, 1010, w, h, '#4A2A1E', '#8A4E30', '#C87A42', 0, s); ctx.restore();
    A.haze(940, 1060, '#E0A068', 0, 0.5);
    // the temple platform and tower (hidden in fog until line 14)
    ctx.save(); ctx.translate(pan * 0.7, 0);
    if (ta > 0) {
      K.glow(540, 1150, 900, '255,170,70', 0.5 * ta);
      A.drawVimana('lit', 540, 1300, 0.55, ta);
      ctx.globalAlpha = ta; rr(210, 1296, 660, 30, 4); ctx.fillStyle = '#8E785A'; ctx.fill(); rr(250, 1326, 580, 26, 4); ctx.fillStyle = '#6E5A42'; ctx.fill(); rr(290, 1352, 500, 24, 4); ctx.fillStyle = '#54432F'; ctx.fill(); ctx.globalAlpha = 1;
      for (let i = 0; i < 9; i++) { const lx = 250 + i * 72.5; K.lamp(lx, 1318, 0.14, t + i, ta); }
      const pe = [[400, 1, 0], [440, 0, 1], [478, 2, 2], [520, 0, 3], [560, 1, 4], [606, 2, 5], [652, 0, 6], [690, 0, 7], [730, 1, 8], [360, 0, 9], [775, 2, 10]];
      ctx.globalAlpha = ta; for (const [px, pose, k] of pe) tinyPerson(px, 1388 + (k % 3) * 9, 92 - (k % 2) * 6, pose, t, k); ctx.globalAlpha = 1;
    }
    ctx.restore();
    // mid and near mounds, darker; the near ones frame the view
    ctx.save(); ctx.translate(pan, 0);
    for (const [x, w, h, s, b] of [[130, 600, 170, 21, 1360], [1000, 620, 200, 22, 1400]]) { mound(x, b, w, h, '#24150C', '#3E2814', '#6E4624', 18, s); }
    ctx.restore();
    ctx.save(); ctx.translate(pan * 1.5, 0); ctx.fillStyle = '#0E0503'; ctx.beginPath(); ctx.moveTo(-300, 1920); ctx.lineTo(-300, 1640); ctx.bezierCurveTo(150, 1520, 430, 1700, 700, 1660); ctx.bezierCurveTo(950, 1620, 1100, 1580, 1400, 1640); ctx.lineTo(1400, 1920); ctx.fill(); ctx.restore();
    // fog, thick until the fog parts and slides away to both sides
    const fa = 1 - parted * 0.96, fadeIn = eo(seg(lt, 0, 1.2));
    for (const p of fogPuffs) { const bx = ((p.x + t * p.sp) % 1700) - 300, dir = bx < 540 ? -1 : 1, x = bx + dir * parted * 800; puff(x, p.y, p.r, p.a * fa * fadeIn * 0.9); }
    A.fog(1120, 340, 0.55 * fa * fadeIn, '210,150,110');
    ctx.fillStyle = `rgba(30,12,10,${0.22 * (1 - parted)})`; ctx.fillRect(-300, -300, W + 600, H + 600);
    // arrows, labels, UNCLEAR
    const ap = seg(lt, 0.8, 4.8), aa = eo(seg(lt, 0.6, 1.4)) * (1 - eo(seg(lt, 5.8, 6.6)));
    arrow(190, 1400, 340, 1150, eio(ap) * 0.88 + 0.12 * ap, aa); arrow(880, 420, 760, 640, eio(ap) * 0.88 + 0.12 * ap, aa);
    tag('PANDYA REVENGE?', 330, 1450, 32, eo(seg(lt, 0.9, 1.6)) * (1 - eo(seg(lt, 5.8, 6.6)))); tag('DELHI RAIDS?', 770, 345, 32, eo(seg(lt, 1.6, 2.3)) * (1 - eo(seg(lt, 5.8, 6.6))));
    const qa = eo(seg(lt, 3.4, 4.6)) * (1 - eo(seg(lt, 6.2, 7.0)));
    if (qa > 0) { ctx.save(); ctx.globalAlpha = qa; ctx.translate(540, 810); const sc = 0.88 + 0.12 * eob(seg(lt, 3.4, 4.4)); ctx.scale(sc, sc);
      K.glow(0, 0, 360, '255,190,80', 0.35); ctx.font = '700 560px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(20,8,2,0.7)'; ctx.strokeText('?', 0, 0); ctx.fillStyle = GOLD; ctx.fillText('?', 0, 0);
      ctx.restore(); ctx.save(); ctx.globalAlpha = qa; txt('UNCLEAR', 540, 1050, 74, P.cream, 18); ctx.restore(); }
    A.dust(t, 20, 4, '255,214,150', 0.3 * ta); K.vignette(0.5);
  } });
  cue(T4 + 0.3, 'rumble', { gain: 0.5 }); cue(T4 + 0.9, 'whoosh', { gain: 0.4 }); cue(T4 + 3.4, 'pop', { gain: 0.6 }); cue(T4 + PAR, 'swell', { gain: 0.7 }); cue(T4 + PAR + 0.4, 'bell', { gain: 0.7 }); cue(T4 + PAR + 1.3, 'sparkle', { gain: 0.4 });

  // ═════════ C5 · lines 15-16 · low-angle dawn on the stone tower, then the end card ═════════
  const dawnTower = () => A.cached('c5:dawn', A.VIM_W, A.VIM_H, 1.5, () => { ctx.translate(A.VIM_OX, A.VIM_OY); A.vimana({ body: '#C49A64', light: '#F4D898', dark: '#6A4630', trim: '#FBE6B0', niche: '#2A1409', gold: '#FFD060' }, { lit: 0.3 }); });
  const EC = 4.35;      // end card crossfade starts
  add({ id: 'C5', at: T5, cam: [540, 1000], zoom: 0.04, note: 'low-angle dawn on the stone tower (tilt up), crossfade to end card: kalasam + ripple rings, AAZHI wordmark', draw(lt, d, t) {
    const ea = eio(seg(lt, EC, EC + 0.8));
    if (ea < 1) {
      const up = eio(seg(lt, 0, EC + 0.5)), bY = lerp(1850, 2090, up), SXY = 0.92, SYY = 1.12;
      ctx.fillStyle = lg(0, -300, 0, 1500, [[0, '#4A2440'], [0.35, '#A8483C'], [0.7, '#F09A52'], [1, '#FFE2A2']]); ctx.fillRect(-300, -300, W + 600, 1900);
      K.glow(880, 1250, 1100, '255,226,160', 0.85); circle(880, 1250, 80, '#FFF6D2'); sunRays(880, 1250, t, 0.1, 7);
      for (let i = 0; i < 3; i++) ell(((i * 420 + t * 7) % 1500) - 200, 420 + i * 150, 300, 14, 'rgba(255,190,130,0.35)');
      // far low hills, then the tower rising out of the mist
      ctx.fillStyle = '#7A3A30'; poly([[-300, 1700], [-60, 1450], [220, 1520], [520, 1430], [800, 1500], [1000, 1440], [1400, 1700]]); ctx.fill();
      A.blit(dawnTower(), A.VIM_OX, A.VIM_OY, 540, bY, SXY, 1, SYY);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; K.glow(930, 700, 700, '255,200,120', 0.35); ctx.restore();
      A.fog(1640, 260, 0.5, '255,200,140');
      // birds in the dawn
      ctx.strokeStyle = DK; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const bx = -100 + ((lt * (110 + i * 12) + i * 170) % 1300), by = 500 - i * 22 + Math.sin(lt * 1.2 + i) * 30 + (i % 2) * 150, fl = Math.sin(t * 9 + i * 2) * 10; ctx.beginPath(); ctx.moveTo(bx - 22, by - fl); ctx.quadraticCurveTo(bx - 8, by - 8, bx, by); ctx.quadraticCurveTo(bx + 8, by - 8, bx + 22, by - fl); ctx.stroke(); }
      // dark foreground: palm at left, low wall and grass at the bottom
      A.palm(60, 1900, 1250, 0.14, 4, '#0C0603', t); A.palm(1030, 1960, 800, -0.1, 9, '#0C0603', t);
      ctx.fillStyle = '#0C0603'; ctx.beginPath(); ctx.moveTo(-300, 1920); ctx.lineTo(-300, 1760); ctx.lineTo(300, 1740); ctx.lineTo(330, 1700); ctx.lineTo(560, 1700); ctx.lineTo(580, 1750); ctx.lineTo(1400, 1730); ctx.lineTo(1400, 1920); ctx.fill();
      ctx.strokeStyle = '#0C0603'; ctx.lineWidth = 5; for (let i = 0; i < 60; i++) { const x = i * 20 + rnd(i) * 10, hh = 40 + rnd(i + 4) * 60, sw = Math.sin(t * 1.4 + i) * 5; ctx.beginPath(); ctx.moveTo(x, 1760); ctx.lineTo(x + sw, 1760 - hh); ctx.stroke(); }
      A.dust(t, 26, 6, '255,230,170', 0.5); K.vignette(0.4);
    }
    if (ea > 0) {
      ctx.save(); ctx.globalAlpha = ea;
      ctx.fillStyle = lg(0, 0, 0, H, [[0, '#070304'], [0.55, '#150A05'], [1, '#2A1608']]); ctx.fillRect(-300, -300, W + 600, H + 600);
      K.glow(540, 800, 800, '255,170,60', 0.35); K.embers(t, 34, 5);
      const el = Math.max(0, lt - EC), kp = eo(seg(el, 0.1, 1.0)), KY = 840, KS = 1.2;
      ell(540, KY + 6, 400, 70, 'rgba(0,0,0,0.45)');
      for (let k = 0; k < 4; k++) { const ph = ((t * 0.38 + k / 4) % 1), rx = 80 + ph * 440, al = (1 - ph) * 0.8 * kp; ctx.strokeStyle = `rgba(232,182,58,${al})`; ctx.lineWidth = 2 + 5 * (1 - ph); ctx.beginPath(); ctx.ellipse(540, KY + 6, rx, rx * 0.19, 0, 0, TAU); ctx.stroke(); }
      ctx.save(); ctx.globalAlpha = ea * kp; ctx.translate(0, (1 - kp) * 40); K.glow(540, KY - 150, 420, '255,190,80', 0.5); K.kalasam(540, KY, KS); ctx.restore();
      const wa = eio(seg(el, 0.6, 1.4)); ctx.save(); ctx.globalAlpha = ea * wa;
      K.tamil('ஆழி', 540, 1105, 110, GOLD); ctx.font = '700 120px Caladea'; ctx.letterSpacing = '22px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.cream; ctx.fillText('AAZHI', 551, 1240); ctx.letterSpacing = '0px'; ctx.restore();
      const la = eio(seg(el, 1.2, 2.0)); ctx.save(); ctx.globalAlpha = ea * la * 0.95;
      txt('EPISODE 2', 540, 1348, 30, GOLD, 8); ctx.strokeStyle = 'rgba(232,182,58,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(440, 1378); ctx.lineTo(640, 1378); ctx.stroke();
      txt('THE KING WHO MADE HIS ENEMIES CARRY RIVER WATER', 540, 1415, 27, GOLD, 2);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = ea * la * 0.8; txt('ALL PEOPLE AND SCENES ARE ILLUSTRATIONS', 540, 1530, 28, P.cream, 4); ctx.restore();
      K.vignette(0.55); ctx.restore();
    }
  } });
  cue(T5 + 0.2, 'swell', { gain: 0.6 }); cue(T5 + 1.6, 'bell', { gain: 0.5 }); cue(T5 + EC + 0.2, 'sparkle', { gain: 0.9 });
  try { cue(Wd('aazhi', 16), 'pop', { gain: 0.8 }); } catch (e) { cue(L(16) + 0.4, 'pop', { gain: 0.8 }); }
}
