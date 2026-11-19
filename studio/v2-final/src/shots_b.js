// EPISODE 2 · worker B: shots B1-B5 (lines 4 to 8): the city, the finished temple, the ledger of pots, the new lake, the king's own record.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import * as K from './core/kit.js';
import * as A from './art.js';
const { P } = K;
const { lg, poly, fillP, rgba, mixc } = A;

// ───────────── local helpers ─────────────
const DK = '#0E0503';
/** a tiny faceless walker, feet at (x, y). o: dir, ph (walk phase), pot (colour), flag (colour), col */
function walker(x, y, h, o = {}) {
  const s = h / 100, c = o.col || DK;
  ctx.save(); ctx.translate(x, y); ctx.scale(o.dir || 1, 1);
  const sw = Math.sin(o.ph || 0) * 0.5;
  ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineWidth = 8 * s;
  ctx.beginPath(); ctx.moveTo(0, -46 * s); ctx.lineTo(sw * 24 * s, 0); ctx.moveTo(0, -46 * s); ctx.lineTo(-sw * 24 * s, 0); ctx.stroke();
  rr(-12 * s, -84 * s, 24 * s, 44 * s, 9 * s); ctx.fillStyle = c; ctx.fill();
  circle(0, -94 * s, 9.5 * s, c);
  if (o.pot) {
    fillP([[-13 * s, -82 * s], [13 * s, -82 * s], [17 * s, -110 * s], [-17 * s, -110 * s]], c);
    ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(-9 * s, -76 * s); ctx.lineTo(-12 * s, -108 * s); ctx.moveTo(9 * s, -76 * s); ctx.lineTo(12 * s, -108 * s); ctx.stroke();
    ell(0, -118 * s, 17 * s, 15 * s, o.pot); rr(-9 * s, -138 * s, 18 * s, 10 * s, 3 * s); ctx.fillStyle = o.pot; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -118 * s, 17 * s, 4.3, 5.0); ctx.strokeStyle = 'rgba(255,170,80,0.55)'; ctx.lineWidth = 1.6 * s; ctx.stroke();
  }
  if (o.flag) {
    ctx.lineWidth = 3 * s; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(14 * s, -70 * s); ctx.lineTo(14 * s, -190 * s); ctx.stroke();
    const f = Math.sin((o.ph || 0) * 1.3) * 4 * s; fillP([[14 * s, -188 * s], [58 * s, -178 * s + f], [14 * s, -158 * s]], o.flag);
  }
  ctx.restore();
}
function star(x, y, r, a) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.fillStyle = '#FFF4CC';
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r * 0.9, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r * 0.9, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  K.glow(x, y, r * 1.6, '255,220,140', 0.55); ctx.restore();
}
function panel(x, y, w, h, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(21,11,6,0.78)'; rr(x - w / 2, y - h / 2, w, h, 30); ctx.fill();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 5; rr(x - w / 2, y - h / 2, w, h, 30); ctx.stroke();
  ctx.strokeStyle = P.goldDark; ctx.lineWidth = 2; rr(x - w / 2 + 10, y - h / 2 + 10, w - 20, h - 20, 22); ctx.stroke(); ctx.restore();
}
/** text fitted to a max width */
function fit(txt, x, y, size, maxW, col, tamil = false, ls = 0) {
  ctx.save(); const f = (z) => `700 ${z}px ${tamil ? 'NotoTamil, Caladea' : 'Caladea'}`; ctx.font = f(size); ctx.letterSpacing = ls + 'px';
  const w = ctx.measureText(txt).width; if (w > maxW) { size *= maxW / w; ctx.font = f(size); }
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y); ctx.restore();
}
function duskSky(y1, c = ['#22102A', '#6E2634', '#D8643A', '#F7B258'], sx = 540, sy = 900, sr = 70) {
  ctx.fillStyle = lg(0, -300, 0, y1, [[0, c[0]], [0.45, c[1]], [0.82, c[2]], [1, c[3]]]); ctx.fillRect(-300, -300, W + 600, y1 + 300);
  K.glow(sx, sy, 780, '255,190,100', 0.7); if (sr) circle(sx, sy, sr, '#FFE9A8');
}
/** palm-leaf slab (lit by `warm` 0..1 from (lx, ly) in local coordinates) */
function slab(x, y, w, h, rot, lx = 0, ly = 0, warm = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const hw = w / 2, hh = h / 2;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
  rr(-hw, -hh, w, h, 18); ctx.fillStyle = lg(0, -hh, 0, hh, [[0, '#E3B97A'], [0.5, '#C9985A'], [1, '#8C5E2C']]); ctx.fill(); ctx.restore();
  ctx.save(); rr(-hw, -hh, w, h, 18); ctx.clip();
  ctx.strokeStyle = 'rgba(110,70,30,0.30)'; ctx.lineWidth = 2; for (let yy = -hh + 6; yy < hh; yy += 8) { ctx.beginPath(); ctx.moveTo(-hw, yy); ctx.lineTo(hw, yy + (rnd(yy | 0) - 0.5) * 2); ctx.stroke(); }
  const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, w * 0.85); g.addColorStop(0, `rgba(255,214,130,${0.55 * warm})`); g.addColorStop(0.55, `rgba(255,170,70,${0.12 * warm})`); g.addColorStop(1, `rgba(20,6,0,${0.5})`);
  ctx.fillStyle = g; ctx.fillRect(-hw, -hh, w, h); ctx.restore();
  ctx.strokeStyle = 'rgba(70,40,15,0.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-hw + 12, -hh + 4); ctx.lineTo(hw - 12, -hh + 4); ctx.moveTo(-hw + 12, hh - 4); ctx.lineTo(hw - 12, hh - 4); ctx.stroke();
  for (const sx of [-1, 1]) { circle(sx * (hw - 44), 0, 13, P.night); ctx.strokeStyle = P.cord; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sx * (hw - 44), 0, 13, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
/** a flag on a pole that ripples (feet at x, y) */
function banner(x, y, h, w, col, t, ph = 0, edge = P.gold) {
  line([[x, y], [x, y - h]], '#1A0A04', Math.max(6, h * 0.016));
  const n = 8, top = y - h + 10, fh = w * 0.62; const up = [], dn = [];
  for (let i = 0; i <= n; i++) { const u = i / n, wv = Math.sin(t * 4 + ph - u * 4) * w * 0.06 * u; up.push([x + u * w, top + wv + u * fh * 0.1]); dn.push([x + u * w, top + fh * (1 - u * 0.25) + wv]); }
  fillP(up.concat(dn.reverse()), col);
  ctx.strokeStyle = edge; ctx.lineWidth = Math.max(3, w * 0.025); ctx.beginPath(); up.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
  circle(x, y - h - 4, Math.max(5, h * 0.015), P.gold);
}

export function buildB(add, cue) {
  const T1 = L(4) - 0.1, T2 = L(5) - 0.1, T3 = L(6) - 0.1, T4 = L(7) - 0.1, T5 = L(8) - 0.1, T6 = L(9) - 0.1;

  // ═════════ B1 · line 4 · a distant fortified city at golden hour, a procession enters ═════════
  add({ id: 'B1', at: T1, cam: [540, 1040], zoom: 0.13, note: 'wide: walled city gate, procession, name plate', draw(lt, d, t) {
    const gy = 1062;
    duskSky(1062, ['#3A1530', '#A23F32', '#F09A48', '#FFD488'], 600, 930, 80);
    A.stars(t, 24, 0.5, 350, 4);
    // far hills + a hazy temple of the city
    ctx.fillStyle = '#9A5A3E'; poly([[-300, 1062], [-60, 985], [160, 1020], [380, 975], [700, 1015], [980, 970], [1400, 1062]]); ctx.fill();
    A.drawVimana('dusk', 220, 1040, 0.12, 0.75, 0.8);
    A.haze(880, 1062, '#F6C37A', 0, 0.55);
    // city wall with crenels and torches
    const wall = '#6A3A24', wallD = '#46261A';
    ctx.fillStyle = lg(0, 985, 0, 1070, [[0, '#8A4E30'], [1, wallD]]); ctx.fillRect(-300, 985, W + 600, 85);
    ctx.fillStyle = '#8A4E30'; for (let x = -300; x < W + 300; x += 38) ctx.fillRect(x, 962, 22, 26);
    ctx.fillStyle = 'rgba(20,8,2,0.4)'; for (let x = -300; x < W + 300; x += 38) ctx.fillRect(x + 14, 962, 8, 26);
    for (let i = 0; i < 6; i++) { const tx = 80 + i * 180 + (i > 2 ? 140 : 0); if (Math.abs(tx - 540) < 150) continue; K.glow(tx, 1010, 70, '255,170,60', 0.7 + 0.2 * Math.sin(t * 9 + i)); circle(tx, 1012, 5, '#FFE9A8'); }
    // the gate: gopuram with a lit archway
    K.gopuram(540, 1075, 0.44, K.STONE.warm, { tiers: 5, w: 560 });
    ctx.fillStyle = 'rgba(40,16,6,0.22)'; ctx.fillRect(400, 880, 280, 200);
    ctx.beginPath(); ctx.moveTo(498, 1072); ctx.lineTo(498, 1030); ctx.arc(540, 1030, 42, Math.PI, 0); ctx.lineTo(582, 1072); ctx.closePath();
    ctx.fillStyle = '#FFC25A'; ctx.fill(); K.glow(540, 1050, 160, '255,170,60', 0.5);
    A.fog(1050, 140, 0.45, '246,184,100');
    // ground and road
    ctx.fillStyle = lg(0, 1070, 0, 1920, [[0, '#9C5A30'], [0.5, '#5A3018'], [1, '#26120A']]); ctx.fillRect(-300, 1068, W + 600, 900);
    const cx = (y) => 540 + 120 * Math.sin((y - 1065) / 250) * ((y - 1065) / 480), hw = (y) => 42 + (y - 1065) * 0.66;
    ctx.beginPath(); for (let y = 1068; y <= 1700; y += 40) ctx.lineTo(cx(y) - hw(y), y); for (let y = 1700; y >= 1068; y -= 40) ctx.lineTo(cx(y) + hw(y), y); ctx.closePath();
    ctx.fillStyle = lg(0, 1068, 0, 1700, [[0, '#F0B36A'], [1, '#B87A44']]); ctx.fill();
    // procession: tiny figures, some with banners and pots
    for (let i = 0; i < 20; i++) {
      const p = -0.3 + i * 0.066 + lt * 0.058; if (p < -0.12 || p > 1) continue;
      const y = 1066 + 440 * Math.pow(1 - p, 1.6), h = 10 + (y - 1066) * 0.36, side = ((i * 7) % 3 - 1) * hw(y) * 0.38;
      const a = clamp((1 - p) / 0.05) * clamp((p + 0.12) / 0.05); ctx.globalAlpha = a;
      walker(cx(y) + side, y, h, { ph: t * 6 + i * 1.7, dir: 1, flag: i % 4 === 1 ? P.kumkum : i % 5 === 2 ? P.gold : null, pot: i % 3 === 0 ? '#3A1A0C' : null });
    }
    ctx.globalAlpha = 1;
    // dust kicked up on the road, golden
    A.fog(1330, 360, 0.25, '246,184,100');
    A.palm(-30, 1560, 820, 0.14, 5, '#0A0402', t); A.palm(1110, 1600, 900, -0.13, 11, '#0A0402', t);
    A.dust(t, 34, 2, '255,210,130', 0.5); K.vignette(0.55);
    // name plate
    const tn = Wd('gangaikonda', 4) - T1, pp = clamp((lt - tn + 0.1) / 0.5);
    if (pp > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, pp * 1.4) * (1 - seg(lt, d - 0.35, d)); ctx.translate(0, (1 - eo(pp)) * 28);
      panel(540, 330, 880, 230);
      fit('கங்கைகொண்ட சோழபுரம்', 540, 296, 92, 780, P.gold, true);
      fit('GANGAIKONDA CHOLAPURAM', 540, 392, 44, 780, P.cream, false, 3); ctx.restore(); }
  } });
  cue(T1, 'whoosh', { gain: 0.8 }); cue(T1 + 0.3, 'swell', { gain: 0.8 }); cue(Wd('gangaikonda', 4), 'bell', { gain: 0.8 });

  // ═════════ B2 · line 5 · the finial is raised: low behind a row of banners ═════════
  let VT = -1500;
  const vimImg = () => A.cached('b2:vim', A.VIM_W, A.VIM_H, 1.0, () => {
    ctx.translate(A.VIM_OX, A.VIM_OY); const o = { tiers: 12.999, lit: 0.9 };
    A.vimana({ body: '#6B573F', light: '#9A8260', dark: '#3A2C22', trim: '#A88D62', niche: '#150A05' }, o); VT = o._top;
  });
  add({ id: 'B2', at: T2, cam: [540, 1180], zoom: 0.09, note: 'finial raised on the tower, banners foreground, c. 1035 CE', draw(lt, d, t) {
    const k = lt / d; ctx.fillStyle = lg(0, -300, 0, 1250, [[0, '#2A1030'], [0.4, '#8A2E36'], [0.8, '#EE7F3E'], [1, '#FFC472']]); ctx.fillRect(-300, -300, W + 600, 1600);
    K.glow(540, 760, 800, '255,170,80', 0.65); K.glow(540, 700, 300, '255,226,150', 0.5);
    A.stars(t, 30, 0.5, 300, 9);
    ctx.fillStyle = '#7A3A3A'; poly([[-300, 1260], [-80, 1170], [200, 1230], [520, 1190], [860, 1240], [1150, 1160], [1400, 1260]]); ctx.fill();
    A.haze(900, 1260, '#F0A560', 0, 0.55);
    // tower (s grows slightly) + hand-drawn crown so the finial can be lifted into place
    const s = 0.5, bx = 540, by = 1330, img = vimImg(); A.blit(img, A.VIM_OX, A.VIM_OY, bx, by, s);
    ctx.save(); ctx.translate(bx, by); ctx.scale(s, s); const top = VT;
    const pal = { body: '#6B573F', light: '#9A8260', dark: '#3A2C22', trim: '#A88D62' };
    rr(-113, top - 62, 226, 62, 3); ctx.fillStyle = lg(-113, 0, 113, 0, [[0, pal.light], [0.5, pal.body], [1, pal.dark]]); ctx.fill();
    rr(-146, top - 88, 292, 26, 3); ctx.fillStyle = pal.trim; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-112, top - 100); ctx.bezierCurveTo(-120, top - 174, -64, top - 228, 0, top - 232); ctx.bezierCurveTo(64, top - 228, 120, top - 174, 112, top - 100); ctx.closePath();
    ctx.fillStyle = lg(-112, 0, 112, 0, [[0, pal.trim], [0.4, pal.light], [1, pal.dark]]); ctx.fill();
    // the golden kalasam is hauled up a rope
    const rise = eio(seg(lt, 0.2, 2.6)), kyTop = top - 226, ky = lerp(top + 700, kyTop, rise);
    line([[0, ky - 40], [-6, by * 0 + 200]], 'rgba(40,20,10,0.6)', 5);
    ctx.globalAlpha = 1; K.kalasam(0, ky, 0.52);
    ctx.restore();
    // lights up when it seats: a flash and a halo
    const seat = seg(lt, 2.6, 3.2), tipY = by + (kyTop - 100) * s;
    K.glow(bx, by + (ky_fn(top, rise) - 100) * s, 160 + 340 * seat, '255,214,120', 0.35 + 0.5 * Math.sin(Math.min(1, seat) * Math.PI) + 0.3 * rise);
    if (seat > 0 && seat < 1) star(bx, tipY, 150 * Math.sin(seat * Math.PI), 1);
    // tiny workers on a bamboo platform at the neck
    ctx.save(); ctx.translate(bx, by + top * s + 20); for (const dx of [-60, 58]) walker(dx, 0, 38, { ph: 0 }); line([[-90, 3], [90, 3]], '#1A0A04', 5); ctx.restore();
    A.fog(1300, 160, 0.5, '240,150,90');
    // ground and the line of banners, drawn from low behind them
    ctx.fillStyle = lg(0, 1280, 0, 1920, [[0, '#4A2012'], [1, '#12060A']]); ctx.fillRect(-300, 1280, W + 600, 700);
    A.palm(-20, 1330, 440, 0.13, 3, '#14070A', t); A.palm(1090, 1340, 480, -0.12, 8, '#14070A', t);
    const sw = (lt - 2) * 12;
    [[300, 1560, 640, 200, '#8E1E22', 0.3], [800, 1560, 600, 190, '#B3262B', 1.4], [120, 1760, 900, 300, '#5E1A1A', 2.1], [960, 1780, 940, 320, '#7A1D20', 0.8], [540, 1480, 400, 130, '#C79A2C', 2.6]].forEach(([x, y, h, w, c, ph], i) => banner(x + sw * (i % 2 ? 1 : -1) * 0.0, y, h, w, c, t, ph, P.gold));
    // a row of low pennants strung between poles
    for (let i = 0; i < 9; i++) { const x = 40 + i * 125; line([[x, 1570], [x, 1500 - (i % 2) * 20]], '#1A0A04', 6); fillP([[x, 1500 - (i % 2) * 20], [x + 46, 1510 - (i % 2) * 20 + Math.sin(t * 4 + i) * 3], [x, 1540 - (i % 2) * 20]], i % 3 ? P.kumkum : P.gold); }
    K.embers(t, 26, 5, '255,200,110'); A.dust(t, 26, 3, '255,210,130', 0.4); K.vignette(0.55);
    // date plaque + honest label
    const pp = clamp((lt - 0.35) / 0.4); if (pp > 0) K.plaque('c. 1035 CE', 540, 230, eob(pp), 86);
    ctx.save(); ctx.globalAlpha = eio(clamp((lt - 0.9) / 0.5)); fit('DATE DEBATED', 540, 340, 38, 600, P.cream, false, 7); ctx.restore();
    function ky_fn(tp, r) { return lerp(tp + 700, tp - 226, r); }
  } });
  cue(T2, 'whoosh', { gain: 0.7 }); cue(T2 + 0.4, 'pop', { gain: 0.7 }); cue(T2 + 2.7, 'sparkle', { gain: 0.9 }); cue(T2 + 2.75, 'bell', { gain: 0.9 });

  // ═════════ B3 · line 6 · THE LEDGER: bearers with pots crossing a ridge, a palm-leaf tally ═════════
  add({ id: 'B3', at: T3, cam: [540, 960], zoom: 0.05, note: 'tracking: long line of pot bearers on a ridge at dusk, ledger tally counts', draw(lt, d, t) {
    const vc = 70, cxw = lt * vc;                                         // camera tracks right
    duskSky(960, ['#1C0C24', '#5A2034', '#C85A3A', '#F0A058'], 880, 880, 80);
    A.stars(t, 40, 0.8, 520, 21);
    const ridge = (wx, k = 1) => 980 + k * (54 * Math.sin(wx * 0.0042 + 0.6) + 22 * Math.sin(wx * 0.011 + 2));
    // far ridge with a tiny distant file of pots
    const farX = cxw * 0.35; ctx.fillStyle = '#6A2A38'; ctx.beginPath(); ctx.moveTo(-300, 1300); for (let x = -300; x <= 1400; x += 40) ctx.lineTo(x, 900 + 30 * Math.sin((x + farX) * 0.006) + 14 * Math.sin((x + farX) * 0.017)); ctx.lineTo(1400, 1300); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 26; i++) { const x = ((i * 58 - farX * 0.4 + lt * 10) % 1500 + 1500) % 1500 - 200; const y = 900 + 30 * Math.sin((x + farX) * 0.006) + 14 * Math.sin((x + farX) * 0.017); walker(x, y + 2, 34, { col: '#2A0E18', pot: '#2A0E18', ph: t * 4 + i }); }
    A.haze(820, 1020, '#E08A4A', 0, 0.5);
    // main ridge
    ctx.fillStyle = '#1A0A0E'; ctx.beginPath(); ctx.moveTo(-300, 1500); for (let x = -300; x <= 1400; x += 30) ctx.lineTo(x, ridge(x + cxw)); ctx.lineTo(1400, 1500); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(240,150,80,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = -300; x <= 1400; x += 30) (x === -300 ? ctx.moveTo(x, ridge(x + cxw) + 1) : ctx.lineTo(x, ridge(x + cxw) + 1)); ctx.stroke();
    // two files of bearers, a few glinting pots
    const glintN = [3, 8, 13, 17];
    for (const [row, base, sc, spc, nn] of [[1, 0, 1.0, 160, 14], [0, 28, 0.74, 140, 17]]) {
      const per = nn * spc;
      for (let i = 0; i < nn; i++) {
        let x = ((i * spc + lt * (vc + 28) + (row ? 0 : 60)) % per) - cxw % per; x = (((x % per) + per) % per) - 220;
        const wx = x + cxw, y = ridge(wx, row ? 1 : 0.9) + base * 0.0 + (row ? 0 : 20), g = row === 1 && glintN.includes(i);
        walker(x, y, 205 * sc, { ph: t * 5 + i * 1.3, pot: g ? '#C99A33' : '#2E1408', col: row ? DK : '#2A0E14' });
        if (g) star(x + 3 * sc, y - 205 * sc * 1.05, 40 + 26 * Math.sin(t * 5 + i), 0.5 + 0.5 * Math.sin(t * 5 + i));
      }
    }
    A.fog(1020, 120, 0.3, '240,140,80');
    // foreground
    ctx.fillStyle = lg(0, 1130, 0, 1920, [[0, '#2A1210'], [1, '#0A0405']]); ctx.beginPath(); ctx.moveTo(-300, 1920); for (let x = -300; x <= 1400; x += 30) ctx.lineTo(x, 1160 + 40 * Math.sin((x + cxw * 1.4) * 0.005)); ctx.lineTo(1400, 1920); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 4; i++) { const x = ((i * 480 - cxw * 1.6) % 1900 + 1900) % 1900 - 300; A.palm(x, 1260 + (i % 3) * 14, 300 + (i % 3) * 60, (i % 2 ? 0.1 : -0.12), i + 2, '#060203', t); }
    A.dust(t, 26, 6, '255,190,110', 0.35); K.vignette(0.65);
    // the ledger: a palm-leaf with a tally that counts up (marks only, no text but the label)
    ctx.save(); ctx.translate(0, (1 - eo(clamp(lt / 0.5))) * 160);
    const lx = 540, ly = 1330; slab(lx, ly, 900, 270, -0.015, 160, 0, 0.9);
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(-0.015);
    fit('POTS', -300, -6, 66, 220, '#3A1E0A', false, 8);
    line([[-205, -90], [-205, 90]], 'rgba(70,40,15,0.5)', 4);
    const N = 30, cnt = Math.floor(eio(clamp((lt - 0.5) / 5.4)) * N);
    ctx.strokeStyle = '#2A1408'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = 0; i < cnt; i++) { const gI = Math.floor(i / 5), r = Math.floor(gI / 4), c = gI % 4, m = i % 5, ox = -150 + c * 150, oy = -52 + r * 100;
      ctx.beginPath(); if (m < 4) { ctx.moveTo(ox + m * 24, oy - 36); ctx.lineTo(ox + m * 24 + 2, oy + 36); } else { ctx.moveTo(ox - 10, oy + 18); ctx.lineTo(ox + 90, oy - 18); } ctx.stroke(); }
    if (cnt > 0) { const i = cnt - 1, gI = Math.floor(i / 5), r = Math.floor(gI / 4), c = gI % 4; K.glow(-150 + c * 150 + (i % 5) * 24, -52 + r * 100, 70, '255,190,80', 0.5); }
    ctx.restore(); ctx.restore();
  } });
  cue(T3, 'whoosh', { gain: 0.7 });
  for (let i = 0; i < 10; i++) cue(T3 + 0.6 + i * 0.62, 'drum', { gain: 0.3 + 0.2 * (i % 2) });
  cue(T3 + 3.2, 'sparkle', { gain: 0.5 }); cue(T3 + 5.4, 'sparkle', { gain: 0.5 });

  // ═════════ B4 · line 7 · the new lake: pots pour, the water rises, a pillar of water ═════════
  add({ id: 'B4', at: T4, cam: [540, 1080], zoom: 0.07, note: 'lake at dusk, pots pour, level rises, pillar of water, CHOLA GANGAM', draw(lt, d, t) {
    const lvl = eio(seg(lt, 0.2, 3.6)), col = eo(seg(lt, 3.4, 4.8)), hold = seg(lt, 3.4, 6);
    duskSky(830, ['#2A1030', '#7A2A38', '#E0703E', '#FFC274'], 330, 820, 64);
    A.stars(t, 36, 0.7, 400, 31);
    // far shore: palms and a small dark temple
    ctx.fillStyle = '#2A1018'; ctx.fillRect(-300, 820, W + 600, 70);
    A.drawVimana('silplain', 800, 850, 0.17, 0.95, 0.8);
    [[60, 6], [170, 13], [330, 4], [930, 8], [1030, 15]].forEach(([x, sd], i) => A.palm(x, 860, 170 + (i % 3) * 40, (x < 540 ? 0.1 : -0.1), sd, '#14070C', t));
    A.haze(760, 880, '#F0A060', 0, 0.5);
    // lake with a stone rim (concentric bands), perspective ellipse
    const cx = 540, cy = 1030, rxO = 600, k = 0.34;
    const E = (rx, c) => { ell(cx, cy, rx, rx * k, c); };
    E(rxO + 26, '#2A1810'); E(rxO, '#7A6248'); E(rxO - 22, '#5A4630'); E(rxO - 50, '#8E7656'); E(rxO - 74, '#4A3828'); E(rxO - 100, '#7A6248');
    const wr = lerp(400, rxO - 112, lvl);
    // water: sky reflection
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, wr, wr * k, 0, 0, TAU); ctx.clip();
    ctx.fillStyle = lg(0, cy - wr * k, 0, cy + wr * k, [[0, '#F0A460'], [0.5, '#B55A44'], [1, '#4A1E32']]); ctx.fillRect(cx - wr, cy - wr * k, wr * 2, wr * k * 2 + 4);
    ctx.fillStyle = 'rgba(255,230,170,0.5)'; for (let i = 0; i < 18; i++) { const gx = 330 + rnd(i) * 300 + Math.sin(t * 0.9 + i) * 16, gy = cy - wr * k + rnd(i + 9) * wr * k * 2, gw = 30 + rnd(i + 4) * 80; ctx.fillRect(gx - gw / 2, gy, gw, 3); }
    // ripples from the pour points and the centre
    ctx.strokeStyle = 'rgba(255,236,190,0.5)'; ctx.lineWidth = 3;
    const pours = [[300, 1120], [780, 1125], [430, 1165], [660, 1170]];
    pours.forEach(([px, py], j) => { for (let r = 0; r < 3; r++) { const u = ((t * 0.5 + r / 3 + j * 0.27) % 1); ctx.globalAlpha = (1 - u) * 0.8 * seg(lt, 0.4 + j * 0.1, 0.9); ctx.beginPath(); ctx.ellipse(px, py, 10 + u * 120, (10 + u * 120) * k, 0, 0, TAU); ctx.stroke(); } });
    ctx.globalAlpha = 1; ctx.restore();
    // column of water (luminous pillar)
    const colH = 780 * col, topY = cy - colH, cw = 54 + 34 * (1 - Math.abs(0.5 - 0.5)) ;
    if (col > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      K.glow(cx, cy - colH * 0.5, 420, '255,200,120', 0.25 * col); K.glow(cx, cy, 300, '191,240,228', 0.35 * col);
      const g = ctx.createLinearGradient(cx - 80, 0, cx + 80, 0); g.addColorStop(0, 'rgba(191,240,228,0)'); g.addColorStop(0.2, 'rgba(150,215,205,0.35)'); g.addColorStop(0.5, 'rgba(255,226,160,0.55)'); g.addColorStop(0.8, 'rgba(150,215,205,0.35)'); g.addColorStop(1, 'rgba(191,240,228,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 70, cy); for (let y = cy; y >= topY; y -= 24) { const u = (cy - y) / 780; ctx.lineTo(cx - (62 + 6 * Math.sin(y * 0.03 + t * 3) - 14 * u), y); } for (let y = topY; y <= cy; y += 24) { const u = (cy - y) / 780; ctx.lineTo(cx + (62 + 6 * Math.sin(y * 0.03 + t * 3 + 2) - 14 * u), y); } ctx.closePath(); ctx.fill();
      // streaks flowing up
      ctx.fillStyle = 'rgba(255,248,224,0.35)';
      for (let i = 0; i < 9; i++) { const fx = cx + (i - 4) * 12, ph = (t * 1.4 + rnd(i) * 3) % 1, y0 = cy - ph * colH * 0.9; ctx.fillRect(fx - 1.5, y0, 3, Math.min(120, colH * 0.3)); }
      ell(cx, topY, 58, 20, 'rgba(255,230,170,0.5)'); ell(cx, topY - 6, 30, 30, 'rgba(255,240,200,0.4)');
      ctx.restore();
      // cap
      K.glow(cx, topY, 130, '255,240,200', 0.4 * col);
      // foam rings at the base
      ctx.strokeStyle = 'rgba(255,248,224,0.8)'; ctx.lineWidth = 4; for (let r = 0; r < 3; r++) { const u = (t * 0.6 + r / 3) % 1; ctx.globalAlpha = (1 - u) * col; ctx.beginPath(); ctx.ellipse(cx, cy + 6, 70 + u * 220, (70 + u * 220) * k, 0, 0, TAU); ctx.stroke(); } ctx.globalAlpha = 1;
      // sparkle motes spiralling up
      for (let i = 0; i < 20; i++) { const u = (t * 0.35 + rnd(i)) % 1, y = cy - u * colH, x = cx + Math.sin(t * 2 + i * 1.7 + u * 6) * (80 + 40 * rnd(i + 3)); ctx.fillStyle = `rgba(255,244,200,${(1 - u) * 0.9 * col})`; circle(x, y, 2.5 + rnd(i + 8) * 3, ctx.fillStyle); }
    }
    // bank (foreground) and bearers pouring
    ctx.fillStyle = lg(0, 1270, 0, 1920, [[0, '#1E0C0C'], [1, '#08030A']]); ctx.beginPath(); ctx.moveTo(-300, 1920); ctx.lineTo(-300, 1300); for (let x = -300; x <= 1400; x += 40) ctx.lineTo(x, 1262 + 26 * Math.sin(x * 0.006) + Math.pow(Math.abs(x - 540) / 540, 2) * 40); ctx.lineTo(1400, 1920); ctx.closePath(); ctx.fill();
    const pourer = (x, y, h, ph, face) => {
      const tilt = eio(seg(lt - ph, 0.1, 1.2)) * 1.9, pt = Math.min(1, tilt / 1.4);
      walker(x, y, h, { dir: face, ph: 0 });
      ctx.save(); ctx.translate(x + face * h * 0.17, y - h * 0.9); ctx.rotate(face * tilt);
      const s = h / 100; ell(0, -14 * s, 18 * s, 16 * s, '#2E1408'); rr(-9 * s, -40 * s, 18 * s, 12 * s, 3 * s); ctx.fillStyle = '#2E1408'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -14 * s, 18 * s, 3.5, 5.1); ctx.strokeStyle = 'rgba(255,200,110,0.85)'; ctx.lineWidth = 2.4 * s; ctx.stroke(); ctx.restore();
      // the stream of water
      if (pt > 0.15) { const mx = x + face * (h * 0.17 + 34 * s * Math.sin(tilt) * 0.9 + 14 * s), my = y - h * 0.9 + 6 * s;
        ctx.strokeStyle = 'rgba(230,245,238,0.8)'; ctx.lineWidth = 5 * s * 0.9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx, my); ctx.quadraticCurveTo(mx + face * 40 * s, my + 30 * s, mx + face * 56 * s, 1170 + (face > 0 ? 0 : 0)); ctx.stroke();
        for (let j = 0; j < 5; j++) { const u = ((t * 2 + j / 5) % 1); circle(mx + face * (14 + 42 * u) * s, my + (1170 - my) * u * u, 2.5 * s, 'rgba(255,255,255,0.9)'); } }
    };
    pourer(130, 1500, 330, 0.0, 1); pourer(950, 1500, 330, 0.5, -1);
    for (let i = 0; i < 6; i++) { const x = 240 + i * 120, y = 1212 + Math.pow(Math.abs(x - 540) / 540, 2) * 30; pourer(x, y, 82, 0.2 + i * 0.35, x < 540 ? 1 : -1); }
    A.dust(t, 24, 7, '255,200,120', 0.35); K.vignette(0.55);
    // plate
    const pp = clamp((lt - 3.1) / 0.5);
    if (pp > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, pp * 1.4); ctx.translate(0, (1 - eo(pp)) * 30);
      panel(540, 1370, 700, 190); fit('சோழகங்கம்', 540, 1340, 84, 600, P.gold, true); fit('CHOLA GANGAM', 540, 1420, 44, 600, P.cream, false, 5); ctx.restore(); }
  } });
  cue(T4, 'whoosh', { gain: 0.6 }); for (let i = 0; i < 6; i++) cue(T4 + 0.5 + i * 0.35, 'pop', { gain: 0.22 });
  cue(T4 + 3.3, 'rumble', { gain: 0.8, dur: 1.6 }); cue(T4 + 3.4, 'swell', { gain: 0.9 }); cue(T4 + 4.5, 'sparkle', { gain: 0.95 }); cue(T4 + 4.55, 'bell', { gain: 0.7 });

  // ═════════ B5 · line 8 · a lamp-lit palm-leaf: one line of gold marks, three empty lines ═════════
  add({ id: 'B5', at: T5, cam: [400, 1180], zoom: 0.15, note: 'slab by lamp: THE KING\'S OWN RECORD, one line, three empty, NO OTHER RECORD', draw(lt, d, t) {
    ctx.fillStyle = lg(0, 0, 0, 1920, [[0, '#0B0504'], [0.5, '#1E0E08'], [1, '#0B0504']]); ctx.fillRect(-300, -300, W + 600, 2500);
    const lampX = 190, lampY = 1500, fl = 0.92 + 0.08 * Math.sin(t * 9) + 0.03 * Math.sin(t * 23);
    K.glow(lampX, lampY - 140, 1100, '255,150,50', 0.5 * fl);
    // slab, lit from the lamp (lower left)
    const sx = 540, sy = 820, sw = 840, sh = 540;
    slab(sx, sy, sw, sh, -0.03, -420, 330, fl);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.03);
    const rowY = [-150, -50, 50, 150];
    // ruled lines
    ctx.strokeStyle = 'rgba(70,40,15,0.55)'; ctx.lineWidth = 3; for (const y of rowY) { ctx.beginPath(); ctx.moveTo(-340, y + 36); ctx.lineTo(340, y + 36); ctx.stroke(); }
    // line 1: unreadable gold marks (invented), written in left to right
    const wr = eo(seg(lt, 0.4, 3.2)), gx = -340 + 680 * wr;
    ctx.save(); ctx.beginPath(); ctx.rect(-380, -200, gx + 380, 120); ctx.clip();
    ctx.strokeStyle = P.goldDark; ctx.lineWidth = 11; ctx.lineCap = 'round';
    const marks = (col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; for (let i = 0; i < 38; i++) { const mx = -332 + i * 17.6, r = rnd(i + 40), m = i % 6;
      ctx.beginPath(); if (m === 0) { ctx.arc(mx, -156, 8 + r * 6, 0, TAU); } else if (m === 1) { ctx.moveTo(mx - 6, -178); ctx.lineTo(mx + 4, -128); } else if (m === 2) { ctx.moveTo(mx - 8, -150); ctx.quadraticCurveTo(mx, -184 - r * 8, mx + 8, -150); } else if (m === 3) { ctx.moveTo(mx - 5, -176); ctx.lineTo(mx - 5, -130); ctx.moveTo(mx - 5, -154); ctx.lineTo(mx + 10, -146); } else if (m === 4) { ctx.moveTo(mx - 8, -134); ctx.quadraticCurveTo(mx, -176, mx + 8, -134); } else { ctx.arc(mx, -170, 4, 0, TAU); ctx.moveTo(mx, -160); ctx.lineTo(mx, -128); }
      ctx.stroke(); } };
    marks(P.goldDark, 10); marks('#F2C45A', 5);
    ctx.restore();
    if (wr > 0 && wr < 1) { K.glow(gx, -150, 90, '255,210,110', 0.8); }
    ctx.restore();
    // label above, line under the empty lines
    const a1 = eio(clamp((lt - 0.2) / 0.6)); ctx.save(); ctx.globalAlpha = a1; fit("THE KING'S OWN RECORD", 540, 470, 46, 880, P.gold, false, 5);
    line([[240, 505], [840, 505]], P.goldDark, 3); ctx.restore();
    const a2 = eio(clamp((lt - 3.2) / 0.7)); ctx.save(); ctx.globalAlpha = a2; ctx.translate(0, (1 - a2) * 16); fit('NO OTHER RECORD', 540, 1170, 52, 800, P.cream, false, 7); ctx.restore();
    // the lamp, in front
    K.lamp(lampX, lampY, 0.95, t, 1);
    K.glow(lampX, lampY - 150, 420, '255,190,90', 0.35 * fl);
    K.embers(t, 18, 14, '255,200,110'); A.dust(t, 22, 9, '255,210,130', 0.35); K.vignette(0.8);
  } });
  cue(T5, 'whoosh', { gain: 0.6 }); for (let i = 0; i < 5; i++) cue(T5 + 0.5 + i * 0.5, 'chisel', { gain: 0.35 }); cue(T5 + 3.2, 'swell', { gain: 0.6 }); cue(T5 + 3.3, 'bell', { gain: 0.5 });
  void T6;
}
