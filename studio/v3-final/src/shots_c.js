// EPISODE 3 · worker C : raids and a bare beach, the ring of harbour lanterns dimming, one slab in a dark hall, the fleet crossing the starlit sea, lamp-boat end card
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L, Le, T } from './core/timing.js';
import * as K from './core/kit.js';
import * as A from './art.js';
const { P } = K;
const { lg, poly, fillP, rgba, mixc } = A;

const DK = '#0E0503';
const GOLD = '#E8B63A';
const serif = (sz, ls = 0) => { ctx.font = `700 ${sz}px Caladea`; ctx.letterSpacing = `${ls}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; };
const txt = (s, x, y, sz, col, ls = 4) => { serif(sz, ls); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.letterSpacing = '0px'; };
/** a dark rounded label with a gold edge, text centred */
function tag(s, x, y, sz = 32, a = 1, ls = 4, edge = GOLD) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; serif(sz, ls); const w = ctx.measureText(s).width + sz * 1.6, h = sz * 1.9;
  rr(x - w / 2, y - h / 2, w, h, h * 0.22); ctx.fillStyle = 'rgba(26,12,5,0.92)'; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.fillStyle = P.cream; ctx.fillText(s, x, y + 2); ctx.letterSpacing = '0px'; ctx.restore();
}

// ───────────── C1 helpers: a ship seen from above ─────────────
function topShip(x, y, ang, s, t, ph = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  // wake
  ctx.globalAlpha *= 0.5; ctx.fillStyle = 'rgba(240,235,215,0.5)'; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-260, -34); ctx.lineTo(-250, 0); ctx.lineTo(-260, 34); ctx.closePath(); ctx.fill(); ctx.globalAlpha /= 0.5;
  // oars
  ctx.strokeStyle = P.bronzeDark; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const ox = -50 + i * 26, sw = Math.sin(t * 5 + i + ph) * 10; ctx.beginPath(); ctx.moveTo(ox, -26); ctx.lineTo(ox - 14 + sw, -64); ctx.moveTo(ox, 26); ctx.lineTo(ox - 14 - sw, 64); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(110, 0); ctx.bezierCurveTo(70, -36, -40, -40, -90, -30); ctx.lineTo(-90, 30); ctx.bezierCurveTo(-40, 40, 70, 36, 110, 0); ctx.closePath();
  ctx.fillStyle = lg(0, -36, 0, 36, [[0, '#D79A52'], [0.5, '#9A5E2C'], [1, '#C98A45']]); ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 5; ctx.stroke();
  line([[-84, 0], [96, 0]], 'rgba(60,30,12,0.5)', 4);
  rr(-30, -20, 60, 40, 8); ctx.fillStyle = P.cream; ctx.fill(); rr(-30, -20, 60, 40, 8); ctx.strokeStyle = P.kumkum; ctx.lineWidth = 4; ctx.stroke();
  circle(-52, 0, 6, P.kumkum);
  ctx.restore();
}
function dashed(pts, upTo, col = 'rgba(255,214,120,0.9)', lw = 9) {
  // pts: [[x,y],[x,y]], draws the first `upTo` (0..1) fraction as a dotted line
  const [a, b] = pts, x = lerp(a[0], b[0], upTo), y = lerp(a[1], b[1], upTo);
  ctx.save(); ctx.setLineDash([2, 26]); ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
}
function arrowHead(x, y, ang, s = 1, col = P.kumkum) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(-22, -34); ctx.lineTo(-8, 0); ctx.lineTo(-22, 34); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
}
function footprint(x, y, ang, a, left) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha *= a;
  const sd = left ? -1 : 1; ctx.fillStyle = 'rgba(70,40,18,0.62)';
  ctx.beginPath(); ctx.ellipse(0, sd * 22, 15, 7, 0.1, 0, TAU); ctx.fill();            // foot
  ctx.beginPath(); ctx.ellipse(-19, sd * 22, 6, 5, 0, 0, TAU); ctx.fill();               // heel
  ctx.fillStyle = 'rgba(255,230,170,0.25)'; ctx.beginPath(); ctx.ellipse(2, sd * 21, 11, 4, 0.1, 0, TAU); ctx.fill();
  ctx.restore();
}

// ───────────── C2 helpers: a harbour lantern ─────────────
function lantern(x, y, s, lit, t, seed) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const fl = 0.9 + 0.1 * Math.sin(t * 9 + seed * 3);
  if (lit > 0.02) K.glow(0, -10, 230, '255,170,60', 0.6 * lit * fl);
  line([[0, -120], [0, -78]], '#6E4A22', 7);
  ctx.beginPath(); ctx.moveTo(-34, -70); ctx.lineTo(34, -70); ctx.lineTo(24, -86); ctx.lineTo(-24, -86); ctx.closePath(); ctx.fillStyle = lit > 0.3 ? P.goldDark : '#3A2A20'; ctx.fill();
  rr(-30, -70, 60, 88, 14); ctx.fillStyle = lg(0, -70, 0, 18, [[0, mixc('#2A2018', '#FFD27A', lit)], [1, mixc('#1E1510', '#FF9A30', lit)]]); ctx.fill();
  ctx.strokeStyle = lit > 0.3 ? GOLD : '#4A3A2C'; ctx.lineWidth = 5; rr(-30, -70, 60, 88, 14); ctx.stroke();
  line([[0, -68], [0, 16]], lit > 0.3 ? 'rgba(120,60,10,0.5)' : 'rgba(0,0,0,0.5)', 3);
  ctx.beginPath(); ctx.moveTo(-36, 18); ctx.lineTo(36, 18); ctx.lineTo(26, 30); ctx.lineTo(-26, 30); ctx.closePath(); ctx.fillStyle = lit > 0.3 ? P.goldDark : '#3A2A20'; ctx.fill();
  if (lit > 0.3) K.flame(0, 8, 0.28 * lit, t, seed);
  ctx.restore();
}
function wisp(x, y, t, a, seed) {
  if (a <= 0.01) return;
  for (let i = 0; i < 4; i++) { const ph = (t * 0.5 + i / 4 + seed * 0.13) % 1, xx = x + Math.sin(ph * 6 + seed) * 18 * ph, yy = y - 40 - ph * 150, r = 14 + ph * 34;
    const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, r); g.addColorStop(0, `rgba(170,150,130,${a * 0.35 * (1 - ph)})`); g.addColorStop(1, 'rgba(170,150,130,0)'); ctx.fillStyle = g; ctx.fillRect(xx - r, yy - r, r * 2, r * 2); }
}

// ───────────── C3 helpers: slabs ─────────────
function slabPath(x, y, w, h, topR) { // base-centre (x, y); arched top
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h + topR); ctx.quadraticCurveTo(x - w / 2, y - h, x, y - h - topR * 0.5); ctx.quadraticCurveTo(x + w / 2, y - h, x + w / 2, y - h + topR); ctx.lineTo(x + w / 2, y); ctx.closePath();
}
function carvedMarks(x, y, w, h) { // invented abstract rows (no real script)
  ctx.save(); ctx.lineCap = 'round';
  const rows = 12, top = y - h + 80, gap = (h - 150) / rows;
  for (let r = 0; r < rows; r++) {
    let cx = x - w / 2 + 40; const yy = top + r * gap; const end = x + w / 2 - 40 - (r % 5 === 4 ? 90 : 0);
    while (cx < end) { const wd = 10 + rnd(r * 40 + cx) * 30; ctx.strokeStyle = 'rgba(16,8,3,0.6)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cx, yy); ctx.lineTo(cx + wd, yy + (rnd(cx + r) - 0.5) * 6); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,214,140,0.42)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(cx - 2, yy - 4); ctx.lineTo(cx + wd - 2, yy - 4 + (rnd(cx + r) - 0.5) * 6); ctx.stroke(); cx += wd + 12 + rnd(cx) * 12; }
  }
  ctx.restore();
}

// ───────────── C5 helper: a copper boat-lamp ─────────────
function boatLamp(x, y, s, t, glowA = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.glow(0, -90, 460, '255,170,60', 0.6 * glowA);
  // hull: a copper crescent boat
  ctx.beginPath(); ctx.moveTo(-170, -34); ctx.bezierCurveTo(-130, 40, 130, 40, 170, -34); ctx.quadraticCurveTo(0, -6, -170, -34); ctx.closePath();
  ctx.fillStyle = lg(-170, 0, 170, 0, [[0, '#6E3A1E'], [0.3, '#E39A62'], [0.65, '#B56A3C'], [1, '#5E3018']]); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-170, -34); ctx.quadraticCurveTo(-196, -70, -176, -96); ctx.lineTo(-156, -84); ctx.quadraticCurveTo(-172, -62, -150, -38); ctx.closePath(); ctx.fillStyle = P.bronzeHi; ctx.fill();
  ctx.beginPath(); ctx.moveTo(170, -34); ctx.quadraticCurveTo(196, -70, 176, -96); ctx.lineTo(156, -84); ctx.quadraticCurveTo(172, -62, 150, -38); ctx.closePath(); ctx.fillStyle = P.bronzeHi; ctx.fill();
  ell(0, -34, 170, 17, '#F5D58E'); ell(0, -34, 150, 11, '#6E3A1E'); ell(0, -35, 120, 6, '#8A4A22');
  ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-110, -2); ctx.quadraticCurveTo(0, 22, 110, -2); ctx.stroke();
  // the cup that holds the wick
  ctx.beginPath(); ctx.ellipse(0, -52, 52, 20, 0, 0, Math.PI); ctx.closePath(); ctx.fillStyle = lg(-52, 0, 52, 0, [[0, P.goldDark], [0.4, '#F5D58E'], [1, P.goldDark]]); ctx.fill();
  ell(0, -52, 52, 10, '#F5D58E'); ell(0, -53, 34, 6, '#7A4A1E');
  K.flame(0, -56, 1.5 * glowA, t, 2);
  ctx.restore();
}

export function buildC(add, cue) {
  const T1 = L(10) - 0.1, T2 = L(11) - 0.1, T3 = L(12) - 0.1, T4 = L(13) - 0.1, T5 = L(14) - 0.1;

  // ═════════ C1 · line 10 · top-down: ships strike the shore and sail away; only footprints stay ═════════
  const shoreY = (x) => 930 + Math.sin(x * 0.006 + 1) * 34 + Math.sin(x * 0.017) * 10;
  add({ id: 'C1', at: T1, cam: [540, 900], zoom: 0.05, note: 'top-down: ships come in to the shore along a dotted arrow and leave again; RAIDS; empty beach with footprints; NO LASTING RULE', draw(lt, d, t) {
    // sea
    ctx.fillStyle = lg(0, -300, 0, 1000, [[0, '#0B3A48'], [0.6, '#17606C'], [1, '#2A8590']]); ctx.fillRect(-300, -300, W + 600, 1400);
    ctx.save(); ctx.strokeStyle = 'rgba(210,240,230,0.16)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 46; i++) { const x = ((rnd(i) * 1500 + t * (10 + rnd(i + 5) * 12)) % 1500) - 200, y = 60 + rnd(i + 9) * 860; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 24, y - 8, x + 50, y); ctx.stroke(); }
    ctx.restore();
    // sand
    ctx.beginPath(); ctx.moveTo(-300, 2200); ctx.lineTo(-300, shoreY(-300)); for (let x = -300; x <= W + 300; x += 20) ctx.lineTo(x, shoreY(x) + Math.sin(x * 0.03 + t * 1.2) * 6); ctx.lineTo(W + 300, 2200); ctx.closePath();
    ctx.fillStyle = lg(0, 900, 0, 1700, [[0, '#E2C088'], [0.4, '#C79C62'], [1, '#8E6A3E']]); ctx.fill();
    // wet sand + foam
    ctx.beginPath(); ctx.moveTo(-300, shoreY(-300) + 40); for (let x = -300; x <= W + 300; x += 20) ctx.lineTo(x, shoreY(x) + 40 + Math.sin(x * 0.03 + t * 1.2) * 6); ctx.strokeStyle = 'rgba(120,80,40,0.35)'; ctx.lineWidth = 36; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-300, shoreY(-300)); for (let x = -300; x <= W + 300; x += 20) ctx.lineTo(x, shoreY(x) + Math.sin(x * 0.03 + t * 1.2) * 6); ctx.strokeStyle = 'rgba(250,244,225,0.8)'; ctx.lineWidth = 12; ctx.stroke();
    // wind ripples and shrubs on the sand
    ctx.strokeStyle = 'rgba(110,70,30,0.22)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 30; i++) { const x = rnd(i + 70) * 1100, y = 1060 + rnd(i + 80) * 520; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y - 10, x + 70, y); ctx.stroke(); }
    for (const [x, y, r] of [[90, 1500, 60], [980, 1380, 70], [920, 1560, 50]]) { ell(x, y + 14, r * 1.3, r * 0.34, 'rgba(60,30,10,0.3)'); for (let k = 0; k < 6; k++) { const a = -1.2 + k * 0.45; line([[x, y], [x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 0.9]], '#3E4A22', 9); } }
    // dotted in-and-out arrow
    const S = [[180, 250], [510, 905]], E = [[510, 905], [900, 250]];
    const p1 = eio(seg(lt, 0.2, 1.7)), p2 = eio(seg(lt, 2.3, 3.8));
    dashed(S, p1); dashed(E, p2);
    if (p1 > 0.98) arrowHead(510, 905, Math.atan2(S[1][1] - S[0][1], S[1][0] - S[0][0]), 0.9 + 0.1 * eob(seg(lt, 1.6, 2.1)));
    if (p2 > 0.98) arrowHead(900, 250, Math.atan2(E[1][1] - E[0][1], E[1][0] - E[0][0]), 0.9 + 0.1 * eob(seg(lt, 3.7, 4.2)));
    // ships
    for (let i = 0; i < 3; i++) {
      const o = (i - 1) * 130, a0 = [180 + o * 0.8, 250 - Math.abs(i - 1) * 20 + i * 30], sh = [510 + o * 1.1, shoreY(510 + o) - 34 - Math.abs(i - 1) * 8], b0 = [900 + o * 0.8, 250 - Math.abs(i - 1) * 20 + i * 30];
      const pin = eio(seg(lt, 0.3 + i * 0.16, 1.9 + i * 0.1)), pout = eio(seg(lt, 2.3 + i * 0.14, 4.0 + i * 0.1));
      let x, y, ang;
      if (pout > 0) { x = lerp(sh[0], b0[0], pout); y = lerp(sh[1], b0[1], pout); ang = Math.atan2(b0[1] - sh[1], b0[0] - sh[0]); }
      else { x = lerp(a0[0], sh[0], pin); y = lerp(a0[1], sh[1], pin); ang = Math.atan2(sh[1] - a0[1], sh[0] - a0[0]); }
      topShip(x, y, ang + Math.sin(t * 2 + i) * 0.03, 0.74, t, i);
    }
    // the strike: a flash and sparks at the shore
    const fl = seg(lt, 1.8, 2.0) * (1 - seg(lt, 2.0, 2.7));
    if (fl > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; K.glow(510, 930, 420 * (0.7 + fl * 0.5), '255,120,60', 0.7 * fl); ctx.restore();
      for (let k = 0; k < 14; k++) { const a = rnd(k) * TAU, r = (lt - 1.8) * 160 * (0.4 + rnd(k + 4)); circle(510 + Math.cos(a) * r, 930 + Math.sin(a) * r * 0.5, 4, `rgba(255,214,120,${fl})`); } }
    // footprints: out of the surf, up the sand and nowhere (ships gone)
    const FP = [[470, 960, 1.2], [440, 1010, 1.9], [468, 1060, 1.5], [440, 1112, 1.9], [466, 1164, 1.4], [446, 1216, 1.7], [476, 1268, 1.3], [452, 1318, 1.8], [488, 1370, 1.5]];
    for (let i = 0; i < FP.length; i++) { const a = eo(seg(lt, 2.9 + i * 0.1, 3.2 + i * 0.1)); if (a > 0) footprint(FP[i][0], FP[i][1], 1.62 + (i % 2 ? 0.1 : -0.1), a, i % 2); }
    for (let i = 0; i < FP.length; i++) { const a = eo(seg(lt, 3.0 + i * 0.1, 3.3 + i * 0.1)); if (a > 0) footprint(FP[i][0] + 120, FP[i][1] + 30, 1.5 + (i % 2 ? 0.1 : -0.1), a * 0.9, i % 2); }
    // labels
    tag('RAIDS', 540, 560, 56, eo(seg(lt, 0.3, 0.9)), 10);
    tag('NO LASTING RULE', 540, 1340, 46, eo(seg(lt, 3.3, 3.9)), 6, P.kumkum);
    A.dust(t, 14, 4, '255,240,200', 0.25); K.vignette(0.45);
  } });
  cue(T1 + 0.3, 'whoosh', { gain: 0.45 }); cue(T1 + 1.85, 'thud', { gain: 0.6 }); cue(T1 + 2.4, 'whoosh', { gain: 0.4 }); cue(T1 + 3.4, 'pop', { gain: 0.6 });

  // ═════════ C2 · line 11 · a ring of harbour lanterns dims one by one, the grip meter drains ═════════
  const RC = [540, 800], RR = 330, ORD = [0, 4, 2, 6, 1, 5, 3, 7], END = [0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.38, 0.34];
  add({ id: 'C2', at: T2, cam: [540, 800], zoom: 0.07, note: 'harbour ledger: ring of 8 lantern-lit harbours joined to a hub; they dim one by one; grip meter drains; SEA TRADE GRIP WEAKENED', draw(lt, d, t) {
    ctx.fillStyle = lg(0, -300, 0, 1700, [[0, '#070C14'], [0.5, '#0E1F2A'], [1, '#150B06']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    A.stars(t, 40, 0.35, 300, 31);
    // chart disc
    ctx.save(); ctx.beginPath(); ctx.arc(RC[0], RC[1], 480, 0, TAU); ctx.fillStyle = lg(0, 320, 0, 1280, [[0, '#123A48'], [1, '#0A2230']]); ctx.fill(); ctx.strokeStyle = 'rgba(232,182,58,0.5)'; ctx.lineWidth = 6; ctx.stroke(); ctx.clip();
    ctx.strokeStyle = 'rgba(232,182,58,0.14)'; ctx.lineWidth = 2; for (const r of [120, 220, 330, 430]) { ctx.beginPath(); ctx.arc(RC[0], RC[1], r, 0, TAU); ctx.stroke(); }
    for (let k = 0; k < 16; k++) { const a = k * TAU / 16; ctx.beginPath(); ctx.moveTo(RC[0], RC[1]); ctx.lineTo(RC[0] + Math.cos(a) * 480, RC[1] + Math.sin(a) * 480); ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(RC[0], RC[1], 480, 0, TAU); ctx.strokeStyle = 'rgba(232,182,58,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    // per-lantern lit level
    const lit = []; for (let i = 0; i < 8; i++) { const k = ORD.indexOf(i), s0 = 0.9 + k * 0.4; lit[i] = lerp(1, END[k], eio(seg(lt, s0, s0 + 0.55))); }
    const meter = lit.reduce((a, b) => a + b, 0) / 8;
    // the ring (path) and spokes, brightness follows the lanterns
    for (let i = 0; i < 8; i++) { const a0 = -Math.PI / 2 + i * TAU / 8, a1 = a0 + TAU / 8, l = (lit[i] + lit[(i + 1) % 8]) / 2;
      ctx.beginPath(); ctx.arc(RC[0], RC[1], RR, a0, a1); ctx.strokeStyle = `rgba(255,190,80,${0.12 + 0.5 * l})`; ctx.lineWidth = 6; ctx.setLineDash([2, 18]); ctx.lineCap = 'round'; ctx.stroke(); ctx.setLineDash([]);
      const x = RC[0] + Math.cos(a0) * RR, y = RC[1] + Math.sin(a0) * RR;
      ctx.beginPath(); ctx.moveTo(RC[0], RC[1]); ctx.lineTo(x, y); ctx.strokeStyle = `rgba(255,190,80,${0.05 + 0.4 * lit[i]})`; ctx.lineWidth = 4; ctx.stroke(); }
    // hub: an eight-point star that fades with the grip
    ctx.save(); ctx.translate(RC[0], RC[1]); K.glow(0, 0, 200, '255,180,70', 0.5 * meter); ctx.rotate(t * 0.05);
    ctx.beginPath(); for (let k = 0; k < 16; k++) { const r = k % 2 ? 40 : 96, a = k * TAU / 16; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath();
    ctx.fillStyle = mixc('#4A3A2C', '#E8B63A', meter); ctx.fill(); circle(0, 0, 22, mixc('#2A2018', '#FFF1BE', meter)); ctx.restore();
    // lanterns
    for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * TAU / 8, x = RC[0] + Math.cos(a) * RR, y = RC[1] + Math.sin(a) * RR;
      const pop = eob(seg(lt, 0.1 + i * 0.06, 0.55 + i * 0.06));
      ctx.save(); ctx.translate(x, y + 36); ctx.scale(pop, pop); ctx.translate(-x, -(y + 36)); lantern(x, y + 36, 1.05, lit[i], t, i); ctx.restore();
      wisp(x, y + 6, t, (1 - lit[i]) * (lit[i] < 0.5 ? 1 : 0), i); }
    // header and the grip meter
    tag('HARBOUR LEDGER', 540, 250, 36, eo(seg(lt, 0.0, 0.5)), 8);
    const ma = eo(seg(lt, 0.4, 1.0)); ctx.save(); ctx.globalAlpha = ma;
    rr(190, 1275, 700, 34, 17); ctx.fillStyle = 'rgba(10,6,3,0.85)'; ctx.fill(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3.5; ctx.stroke();
    rr(196, 1281, Math.max(0.01, 688 * meter), 22, 11); ctx.fillStyle = lg(190, 0, 890, 0, [[0, mixc('#B3262B', '#E8B63A', meter)], [1, '#FFD27A']]); ctx.fill(); ctx.restore();
    tag('SEA TRADE GRIP WEAKENED', 540, 1380, 40, eo(seg(lt, 2.0, 2.7)), 5, P.kumkum);
    A.dust(t, 14, 8, '255,214,150', 0.25); K.vignette(0.5);
  } });
  for (let k = 0; k < 8; k++) cue(T2 + 1.2 + k * 0.4, 'tock', { gain: 0.35 });
  cue(T2 + 0.3, 'swell', { gain: 0.4 }); cue(T2 + 2.1, 'thud', { gain: 0.4 });

  // ═════════ C3 · line 12 · one inscription slab under one hanging lamp, empty outlines around it ═════════
  const EMPTY = [[150, 1050, 200, 340, 0], [930, 1050, 200, 340, 1], [120, 760, 170, 290, 2], [960, 770, 170, 290, 3], [300, 1120, 150, 250, 4], [780, 1120, 150, 250, 5], [250, 520, 140, 230, 6], [830, 520, 140, 230, 7]];
  add({ id: 'C3', at: T3, cam: [540, 850], zoom: 0.08, note: 'one Chola source: a lone inscription slab (invented marks, no real text) lit by one hanging lamp in a dark hall; many empty dashed slab outlines; NO OTHER RECORD', draw(lt, d, t) {
    ctx.fillStyle = '#060302'; ctx.fillRect(-300, -300, W + 600, H + 600);
    // hall: far pillars in the dark
    for (const [x, w, a] of [[40, 130, 0.9], [1040, 130, 0.9], [240, 90, 0.45], [840, 90, 0.45]]) { ctx.fillStyle = lg(x - w / 2, 0, x + w / 2, 0, [[0, `rgba(30,16,8,${a})`], [0.5, `rgba(70,42,20,${a})`], [1, `rgba(24,12,6,${a})`]]); ctx.fillRect(x - w / 2, -300, w, 1700); }
    // floor
    ctx.fillStyle = lg(0, 1250, 0, 1700, [[0, '#2A1A10'], [1, '#080403']]); ctx.fillRect(-300, 1250, W + 600, 700);
    ctx.strokeStyle = 'rgba(120,80,40,0.15)'; ctx.lineWidth = 2; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.moveTo(540 + (k - 4) * 60, 1250); ctx.lineTo(540 + (k - 4) * 300, 1700); ctx.stroke(); }
    // the lamp's light cone and pool
    const lx = 540, ly = 380, flick = 0.94 + 0.06 * Math.sin(t * 9);
    ctx.save(); ctx.beginPath(); ctx.moveTo(lx - 30, ly); ctx.lineTo(lx + 30, ly); ctx.lineTo(lx + 430, 1260); ctx.lineTo(lx - 430, 1260); ctx.closePath();
    ctx.fillStyle = lg(0, ly, 0, 1260, [[0, 'rgba(255,190,90,0.34)'], [1, 'rgba(255,170,70,0.07)']]); ctx.globalAlpha = flick; ctx.fill(); ctx.restore();
    ell(540, 1262, 420, 60, 'rgba(255,180,80,0.28)');
    // empty slab outlines
    for (const [x, y, w, h, k] of EMPTY) { const a = eo(seg(lt, 0.4 + k * 0.17, 0.9 + k * 0.17));
      if (a <= 0) continue; ctx.save(); ctx.globalAlpha = a; slabPath(x, y, w, h, 40); ctx.fillStyle = 'rgba(30,18,10,0.55)'; ctx.fill(); ctx.setLineDash([16, 12]); ctx.strokeStyle = 'rgba(232,182,58,0.5)'; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
      txt('?', x, y - h * 0.5, 64, 'rgba(232,182,58,0.28)', 0); ctx.restore(); }
    // the one slab
    const sx = 540, sy = 1250, sw = 340, sh = 600, rise = eo(seg(lt, 0, 0.5));
    ctx.save(); ctx.globalAlpha = rise; ell(sx, sy + 8, 250, 32, 'rgba(0,0,0,0.6)');
    rr(sx - 215, sy - 36, 430, 40, 6); ctx.fillStyle = '#5B4B3A'; ctx.fill(); rr(sx - 190, sy - 70, 380, 36, 6); ctx.fillStyle = '#6E5A44'; ctx.fill();
    slabPath(sx, sy - 70, sw, sh, 56); ctx.fillStyle = lg(sx - sw / 2, 0, sx + sw / 2, 0, [[0, '#8C7A62'], [0.5, '#C9B28A'], [1, '#7A6850']]); ctx.fill();
    ctx.save(); slabPath(sx, sy - 70, sw, sh, 56); ctx.clip(); ctx.fillStyle = lg(0, sy - 70 - sh, 0, sy - 70, [[0, 'rgba(255,214,140,0.45)'], [1, 'rgba(40,20,8,0.35)']]); ctx.fillRect(sx - 200, sy - sh - 140, 400, sh + 140); carvedMarks(sx, sy - 70, sw, sh - 30);
    // a carved arch band at the top
    ctx.strokeStyle = 'rgba(40,20,8,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sx, sy - 70 - sh + 110, 60, Math.PI, 0); ctx.stroke(); circle(sx, sy - 70 - sh + 82, 18, 'rgba(255,214,140,0.5)'); ctx.restore();
    slabPath(sx, sy - 70, sw, sh, 56); ctx.strokeStyle = 'rgba(255,224,160,0.8)'; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
    // hanging lamp on a chain
    ctx.save(); line([[lx, -300], [lx, ly - 120]], '#6E4A22', 8); for (let k = 0; k < 14; k++) ell(lx, -250 + k * 36, 7, 11, '#8A6232');
    ctx.translate(0, 0); K.glow(lx, ly - 60, 520 * flick, '255,176,70', 0.55); K.lamp(lx, ly + 40, 0.46, t, 1); ctx.restore();
    // labels
    tag('ONE CHOLA INSCRIPTION', 540, 215, 34, eo(seg(lt, 0.1, 0.7)), 5);
    tag('NO OTHER RECORD', 540, 1400, 46, eo(seg(lt, 1.7, 2.3)), 6, P.kumkum);
    A.dust(t, 24, 3, '255,214,150', 0.45); K.vignette(0.65);
  } });
  cue(T3 + 0.1, 'swell', { gain: 0.5 }); cue(T3 + 0.5, 'chisel', { gain: 0.5 }); cue(T3 + 1.7, 'thud', { gain: 0.5 });

  // ═════════ C4 · line 13 · dawn, a huge starlit sea, a fleet crossing to a glowing far shore ═════════
  const HOR = 820;
  const FLEET = [[350, 1330, 0.44], [740, 1250, 0.36], [150, 1170, 0.3], [520, 1110, 0.25], [850, 1050, 0.2], [330, 1000, 0.16], [640, 960, 0.13], [880, 925, 0.1], [450, 900, 0.09]];
  add({ id: 'C4', at: T4, cam: [600, 960], zoom: 0.1, note: 'wide dawn over a starlit sea: nine generic ships cross toward a glowing far shore; A THOUSAND YEARS AGO', draw(lt, d, t) {
    const dawn = eio(seg(lt, 0, d));
    ctx.fillStyle = lg(0, -300, 0, HOR, [[0, '#070B26'], [0.45, '#2A2058'], [0.8, mixc('#8A3A5A', '#C8584A', dawn)], [1, mixc('#E08850', '#FFC477', dawn)]]); ctx.fillRect(-300, -300, W + 600, HOR + 300);
    A.stars(t, 120, 1 - dawn * 0.55, 700, 11);
    // the far shore's glow, and a glimmering path to it
    K.glow(760, HOR - 10, 640, '255,190,100', 0.55 + dawn * 0.3);
    // sea
    ctx.fillStyle = lg(0, HOR, 0, 1920, [[0, mixc('#C8785A', '#E8A068', dawn)], [0.12, '#3A3E6A'], [0.5, '#12304A'], [1, '#06161F']]); ctx.fillRect(-300, HOR, W + 600, 1200);
    ctx.save(); ctx.beginPath(); ctx.rect(-300, HOR, W + 600, 1200); ctx.clip();
    // glitter path under the shore
    for (let i = 0; i < 110; i++) { const v = rnd(i + 3), y = HOR + 8 + v * v * 900, spread = 40 + (y - HOR) * 0.55, x = 760 - (y - HOR) * 0.1 + (rnd(i * 3) - 0.5) * 2 * spread, tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * (1 + rnd(i) * 2) + i));
      ctx.fillStyle = `rgba(255,214,150,${0.7 * tw})`; ctx.beginPath(); ctx.ellipse(x, y, 10 + (y - HOR) * 0.05 + rnd(i + 8) * 14, 2 + (y - HOR) * 0.005, 0, 0, TAU); ctx.fill(); }
    // star reflections
    for (let i = 0; i < 50; i++) { const x = rnd(i + 90) * W, y = HOR + 80 + rnd(i + 20) * 700, tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 1.5 + i)); ctx.fillStyle = `rgba(190,210,255,${0.35 * tw * (1 - dawn * 0.5)})`; ctx.beginPath(); ctx.ellipse(x, y, 8 + rnd(i) * 10, 2, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
    // far shore: low land, a lit temple tower, palms and a line of harbour lights
    ctx.fillStyle = '#1A0E10'; ctx.beginPath(); ctx.moveTo(480, HOR + 2); ctx.bezierCurveTo(560, HOR - 22, 700, HOR - 14, 780, HOR - 20); ctx.bezierCurveTo(900, HOR - 28, 1000, HOR - 12, 1120, HOR + 2); ctx.closePath(); ctx.fill();
    A.drawVimana('sil', 790, HOR - 14, 0.1, 1);
    for (const [x, h, l] of [[600, 46, 0.1], [650, 60, -0.05], [930, 54, 0.12], [985, 44, -0.1]]) A.palm(x, HOR - 6, h, l, x, '#120808', t);
    for (let i = 0; i < 16; i++) { const x = 560 + i * 34 + rnd(i) * 10, tw = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.7); circle(x, HOR - 2, 2.6, `rgba(255,210,120,${tw})`); }
    A.fog(HOR + 4, 60, 0.45, '255,200,140');
    // waves, then the fleet drawn far to near
    const drawShip = (x, y, s, i) => { const sail = lt * (26 + s * 80), bob = Math.sin(t * 1.3 + i * 1.7) * 0.025, by = Math.sin(t * 1.9 + i) * 3 * s * 4;
      ctx.save(); ctx.globalAlpha = 0.82 + s; ell(x + sail, y + 80 * s, 360 * s, 18 * s, 'rgba(6,14,22,0.45)'); K.ship(x + sail, y + by, s, bob, t, { crew: 0 }); ctx.restore(); };
    const order = FLEET.map((f, i) => [f, i]).sort((a, b) => a[0][1] - b[0][1]);
    for (const [f, i] of order) { drawShip(f[0], f[1], f[2], i); const wy = f[1] + 96 * f[2]; ctx.fillStyle = 'rgba(210,225,240,0.10)'; ctx.fillRect(-300, wy, W + 600, 3); }
    // near dark swell and a cool vignette
    K.wave(1700, 'rgba(4,14,22,0.88)', t, 18, 0.008, 1); K.wave(1800, '#030B12', t, 20, 0.01, 2);
    // title plaque
    const pa = eob(seg(lt, 0.35, 1.15)); K.plaque('A THOUSAND YEARS AGO', 540, 330, pa, 56);
    K.vignette(0.5);
  } });
  cue(T4 + 0.2, 'swell', { gain: 0.7 }); cue(T4 + 0.5, 'pop', { gain: 0.6 }); cue(T4 + 2.4, 'bell', { gain: 0.5 }); cue(T4 + 4.4, 'sparkle', { gain: 0.5 });

  // ═════════ C5 · line 14 · end card: a lit copper boat-lamp drifting on ripples, AAZHI plaque ═════════
  const WY = 1215;
  add({ id: 'C5', at: T5, cam: [540, 960], zoom: 0.05, note: 'end card: copper boat-lamp (diya) floating on rippling night water with tiny lamps drifting, ஆழி AAZHI plaque, EPISODE 3', draw(lt, d, t) {
    ctx.fillStyle = lg(0, 0, 0, H, [[0, '#050304'], [0.4, '#0E0806'], [0.55, '#0A2430'], [1, '#04121A']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    A.stars(t, 40, 0.4, 700, 21);
    const la = eo(seg(lt, 0, 0.8));
    K.glow(540, 1000, 800, '255,170,60', 0.3 * la);
    // water: shimmer lines and ripples
    ctx.save(); ctx.beginPath(); ctx.rect(-300, 900, W + 600, 1200); ctx.clip();
    ctx.fillStyle = lg(0, 900, 0, 1700, [[0, 'rgba(255,170,70,0)'], [0.2, 'rgba(255,170,70,0.2)'], [1, 'rgba(255,170,70,0)']]); ctx.fillRect(-300, 900, W + 600, 800);
    for (let i = 0; i < 34; i++) { const y = 930 + rnd(i) * 700, x = ((rnd(i + 6) * 1300 + t * (6 + rnd(i + 2) * 8)) % 1300) - 100, near = 1 - Math.abs(x - 540) / 600, a = 0.3 * Math.max(0, near) * (0.5 + 0.5 * Math.sin(t * 2 + i)); ctx.strokeStyle = `rgba(255,214,140,${a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40 + rnd(i) * 60, y); ctx.stroke(); }
    for (let k = 0; k < 6; k++) { const ph = (t * 0.28 + k / 6) % 1, rx = 120 + ph * 640, al = (1 - ph) * 0.75 * la; ctx.strokeStyle = `rgba(232,182,58,${al})`; ctx.lineWidth = 2 + 5 * (1 - ph); ctx.beginPath(); ctx.ellipse(540, WY + 18, rx, rx * 0.17, 0, 0, TAU); ctx.stroke(); }
    // reflection of the flame
    ctx.save(); ctx.globalAlpha = 0.5 * la; ctx.scale(1, 1); K.glow(540, WY + 110, 300, '255,180,70', 0.5); ell(540, WY + 120, 18 + Math.sin(t * 5) * 2, 90, 'rgba(255,210,120,0.35)'); ctx.restore();
    ctx.restore();
    // far tiny lamps drifting away
    for (let i = 0; i < 7; i++) { const x = 150 + rnd(i + 4) * 800, y = 1330 + rnd(i + 14) * 200, dx = Math.sin(t * 0.4 + i) * 14, a = la * (0.35 + 0.35 * rnd(i + 2)); if (Math.abs(x - 540) < 260) continue;
      ctx.save(); ctx.globalAlpha = a; K.glow(x + dx, y - 14, 70, '255,170,60', 0.6); ell(x + dx, y, 22, 6, '#8A4A22'); K.flame(x + dx, y - 6, 0.22, t, i); ctx.restore(); }
    // marigold petals on the water
    for (let i = 0; i < 12; i++) { const x = 140 + rnd(i + 40) * 800 + Math.sin(t * 0.5 + i) * 10, y = 1280 + rnd(i + 50) * 280; ctx.save(); ctx.globalAlpha = la * 0.8; ell(x, y, 12, 5, i % 3 ? '#E8892B' : '#E8B63A', rnd(i) * 3); ctx.restore(); }
    // the boat-lamp
    const bob = Math.sin(t * 1.3) * 5;
    ctx.save(); ctx.globalAlpha = la; boatLamp(540, WY + bob, 1.05, t, la); ctx.restore();
    // plaque: Tamil + AAZHI
    const pa = eob(seg(lt, 0.25, 1.0));
    ctx.save(); ctx.translate(540, 480); ctx.scale(0.9 + 0.1 * pa, 0.9 + 0.1 * pa); ctx.globalAlpha = clamp(pa);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; rr(-390, -190, 780, 380, 40); ctx.fillStyle = '#2A1608'; ctx.fill(); ctx.restore();
    rr(-390, -190, 780, 380, 40); ctx.strokeStyle = GOLD; ctx.lineWidth = 8; ctx.stroke(); rr(-372, -172, 744, 344, 30); ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3; ctx.stroke();
    K.lotus(-390, 0, 0.45); K.lotus(390, 0, 0.45);
    K.tamil('ஆழி', 0, -60, 160, GOLD);
    ctx.font = '700 120px Caladea'; ctx.letterSpacing = '24px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.cream; ctx.fillText('AAZHI', 12, 82); ctx.letterSpacing = '0px';
    ctx.restore();
    const ea = eio(seg(lt, 0.9, 1.6)); ctx.save(); ctx.globalAlpha = ea;
    txt('EPISODE 3', 540, 740, 44, GOLD, 12); ctx.strokeStyle = 'rgba(232,182,58,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(400, 782); ctx.lineTo(680, 782); ctx.stroke();
    txt('THE TAMIL FLEET THAT SAILED TO SRIVIJAYA', 540, 822, 27, P.cream, 2);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = ea * 0.7; txt('ALL PEOPLE AND SCENES ARE ILLUSTRATIONS', 540, 1470, 26, P.cream, 4); ctx.restore();
    K.embers(t, 24, 9); K.vignette(0.55);
  } });
  cue(T5 + 0.1, 'swell', { gain: 0.6 }); cue(T5 + 0.5, 'bell', { gain: 0.6 }); cue(T5 + 1.2, 'sparkle', { gain: 0.8 });
}
