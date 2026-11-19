// EPISODE 3 · worker B: shots B1-B5 (lines 5 to 9): Kadaram on the chart, the fork of "why", the scale, the halted ships, the two-century gap.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import * as K from './core/kit.js';
import * as A from './art.js';
const { P } = K;
const { lg, poly, fillP, rgba } = A;

// ───────────── local helpers ─────────────
const DK = '#0E0503';
function panel(x, y, w, h, a = 1, dash = false) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(21,11,6,0.82)'; rr(x - w / 2, y - h / 2, w, h, 26); ctx.fill();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 5; if (dash) ctx.setLineDash([16, 12]); rr(x - w / 2, y - h / 2, w, h, 26); ctx.stroke(); ctx.setLineDash([]);
  if (!dash) { ctx.strokeStyle = P.goldDark; ctx.lineWidth = 2; rr(x - w / 2 + 10, y - h / 2 + 10, w - 20, h - 20, 18); ctx.stroke(); } ctx.restore();
}
function fit(txt, x, y, size, maxW, col, ls = 0) {
  ctx.save(); const f = (z) => `700 ${z}px Caladea`; ctx.font = f(size); ctx.letterSpacing = ls + 'px';
  const w = ctx.measureText(txt).width; if (w > maxW) { size *= maxW / w; ctx.font = f(size); }
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y); ctx.restore();
}
/** pop-in with fade: returns progress p (0..1) of an element starting at time s */
const pr = (lt, s, dur = 0.5) => clamp((lt - s) / dur);
function pin(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.globalAlpha *= 0.4; ell(0, 2, 26, 8, '#000'); ctx.restore();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-12, -40, -42, -52, -42, -92); ctx.arc(0, -92, 42, Math.PI, 0); ctx.bezierCurveTo(42, -52, 12, -40, 0, 0); ctx.closePath();
  ctx.fillStyle = lg(-40, 0, 40, 0, [[0, '#E0393F'], [0.6, P.kumkum], [1, '#7A1418']]); ctx.fill();
  circle(0, -92, 18, P.cream); circle(-6, -98, 6, '#fff'); ctx.restore();
}
/** a rolled scroll icon centred at (x, y), width w (marks are deliberately invented) */
function scroll(x, y, w, rot = 0) {
  const h = w * 0.62; ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8; rr(-w / 2 + 18, -h / 2, w - 36, h, 6); ctx.fillStyle = '#F0DDB0'; ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(110,70,30,0.55)'; ctx.lineWidth = Math.max(3, w * 0.02); ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const yy = -h / 2 + h * (i + 1.1) / 6.2; ctx.beginPath(); for (let k = 0; k < 7; k++) { const xx = -w * 0.32 + k * w * 0.1; ctx.moveTo(xx, yy); ctx.lineTo(xx + w * 0.07 * (0.5 + rnd(i * 9 + k)), yy + (rnd(i + k * 3) - 0.5) * 6); } ctx.stroke(); }
  for (const sx of [-1, 1]) { ell(sx * (w / 2 - 14), 0, 18, h / 2 + 8, '#D9B878'); ell(sx * (w / 2 - 14), 0, 8, h / 2 - 4, '#8C5E2C'); circle(sx * (w / 2 - 14), -h / 2 - 8, 8, P.gold); circle(sx * (w / 2 - 14), h / 2 + 8, 8, P.gold); }
  ctx.restore();
}
function twinkle(x, y, r, a) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.fillStyle = '#FFF4CC';
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r * 0.9, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r * 0.9, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill(); ctx.restore();
}
/** a generic trading ship in silhouette (hull, mast, battened sail), waterline centre (x, y), dir 1 faces right */
function junk(x, y, s, col, dir = 1, t = 0, sail = '#2A1408') {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); const bob = Math.sin(t * 2.2 + x * 0.01) * 4; ctx.translate(0, bob);
  line([[0, -20], [0, -420]], col, 12);
  fillP([[8, -400], [190, -370], [200, -150], [8, -120]], sail); ctx.strokeStyle = 'rgba(255,190,100,0.3)'; ctx.lineWidth = 4;
  for (const k of [-300, -230, -170]) { ctx.beginPath(); ctx.moveTo(8, k + 4); ctx.lineTo(196, k + 30); ctx.stroke(); }
  fillP([[-10, -380], [-120, -330], [-110, -140], [-10, -120]], sail);
  ctx.beginPath(); ctx.moveTo(-250, -70); ctx.lineTo(-210, 20); ctx.lineTo(210, 20); ctx.lineTo(290, -86); ctx.lineTo(240, -60); ctx.lineTo(-230, -50); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  fillP([[-110, -64], [-110, -112], [30, -112], [30, -64]], col);
  ctx.restore();
}
function bale(x, y, w, h, col, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); rr(-w / 2, -h, w, h, 14); ctx.fillStyle = lg(0, -h, 0, 0, [[0, mix(col, 1.25)], [1, mix(col, 0.7)]]); ctx.fill();
  ctx.strokeStyle = 'rgba(30,10,4,0.5)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w * 0.18, -h); ctx.lineTo(-w * 0.18, 0); ctx.moveTo(w * 0.18, -h); ctx.lineTo(w * 0.18, 0); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,230,170,0.28)'; ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -h + i * h / 5); ctx.lineTo(w / 2 - 8, -h + i * h / 5); ctx.stroke(); }
  ctx.restore();
}
function mix(c, k) { const v = [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(c.slice(i, i + 2), 16) * k)))); return `rgb(${v})`; }

export function buildB(add, cue) {
  const T1 = L(5) - 0.1, T2 = L(6) - 0.1, T3 = L(7) - 0.1, T4 = L(8) - 0.1, T5 = L(9) - 0.1;

  // ═════════ B1 · line 5 · the Malay coast on a palm-leaf chart, a pin, KADARAM, KEDAH? ═════════
  add({ id: 'B1', at: T1, cam: [560, 700], zoom: 0.16, note: 'palm-leaf chart: Malay coast, pin, KADARAM label then dotted KEDAH + PROBABLY', draw(lt, d, t) {
  ctx.fillStyle = lg(0, -300, 0, 2000, [[0, '#2A1608'], [1, '#150B06']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    K.glow(300, 300, 700, '255,177,59', 0.35);
    const tK = Wd('kadaram', 5) - T1, tP = Wd('probably', 5) - T1, tM = Wd('malay', 5) - T1;
    // the leaf
    ctx.save(); ctx.translate(540, 850); ctx.rotate(-0.012); ctx.translate(-540, -850);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; rr(50, 180, 980, 1340, 26); ctx.fillStyle = lg(0, 180, 0, 1520, [[0, '#E3B97A'], [0.5, '#C9985A'], [1, '#8C5E2C']]); ctx.fill(); ctx.restore();
    ctx.save(); rr(50, 180, 980, 1340, 26); ctx.clip();
    ctx.strokeStyle = 'rgba(110,70,30,0.28)'; ctx.lineWidth = 2; for (let y = 188; y < 1520; y += 9) { ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(1030, y + (rnd(y) - 0.5) * 2); ctx.stroke(); }
    // chart sea + grid, clipped to the inner frame
    ctx.save(); rr(90, 230, 900, 1240, 10); ctx.clip();
    ctx.fillStyle = 'rgba(28,107,120,0.62)'; ctx.fillRect(90, 230, 900, 1240);
    ctx.strokeStyle = 'rgba(246,231,196,0.18)'; ctx.lineWidth = 2; for (let i = 0; i < 18; i++) { const y = 260 + i * 70; ctx.beginPath(); for (let x = 90; x <= 990; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.03 + i + t * 0.8) * 5); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(80,50,20,0.25)'; for (let x = 90; x <= 990; x += 150) { ctx.beginPath(); ctx.moveTo(x, 230); ctx.lineTo(x, 1470); ctx.stroke(); } for (let y = 230; y <= 1470; y += 155) { ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(990, y); ctx.stroke(); }
    const pen = [[460, 230], [480, 330], [520, 430], [545, 520], [540, 590], [575, 660], [620, 740], [650, 830], [690, 930], [740, 1020], [780, 1110], [810, 1200], [850, 1280], [900, 1330], [940, 1300], [950, 1200], [930, 1100], [910, 1000], [935, 900], [975, 800], [1000, 700], [1040, 600], [1040, 230]];
    const sum = [[90, 760], [170, 720], [260, 780], [350, 880], [450, 990], [540, 1100], [620, 1210], [700, 1320], [760, 1470], [90, 1470]];
    for (const pts of [pen, sum]) { poly(pts); ctx.strokeStyle = 'rgba(246,231,196,0.5)'; ctx.lineWidth = 26; ctx.lineJoin = 'round'; ctx.stroke(); poly(pts); ctx.fillStyle = '#E3B867'; ctx.fill(); ctx.strokeStyle = P.leafDark; ctx.lineWidth = 6; ctx.stroke(); }
    ctx.fillStyle = 'rgba(140,94,44,0.7)'; for (let i = 0; i < 9; i++) { const mx = 800 + (i % 3) * 56 - (i > 5 ? 30 : 0), my = 560 + Math.floor(i / 3) * 52; fillP([[mx - 22, my + 16], [mx, my - 20], [mx + 22, my + 16]], 'rgba(140,94,44,0.7)'); }
    for (let i = 0; i < 6; i++) { const mx = 330 + i * 40, my = 1010 + i * 52; fillP([[mx - 20, my + 14], [mx, my - 18], [mx + 20, my + 14]], 'rgba(140,94,44,0.7)'); }
    ctx.restore();
    ctx.strokeStyle = P.ink; ctx.lineWidth = 6; rr(90, 230, 900, 1240, 10); ctx.stroke();
    ctx.restore(); // clip of the leaf
    // compass
    ctx.save(); ctx.translate(850, 340); circle(0, 0, 54, 'rgba(246,231,196,0.8)'); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 54, 0, TAU); ctx.stroke();
    fillP([[0, -48], [12, 0], [-12, 0]], P.kumkum); fillP([[0, 48], [12, 0], [-12, 0]], P.ink); fillP([[-46, 0], [0, 10], [0, -10]], P.leafDark); fillP([[46, 0], [0, 10], [0, -10]], P.leafDark); ctx.restore();
    ctx.save(); ctx.globalAlpha = eio(pr(lt, tM - 0.1, 0.5)); K.label('MALAY', 810, 770, 36); K.label('COAST', 810, 816, 36); ctx.restore();
    ctx.restore(); // rotation

    // the pin drops in at "Kadaram"
    const px = 575, py = 560, pp = pr(lt, tK - 0.05, 0.55);
    if (pp > 0) { const e = eob(pp); ctx.save(); ctx.globalAlpha = Math.min(1, pp * 3); pin(px, py - (1 - e) * 220, 1.05); ctx.restore();
      if (pp >= 1) { const rp = ((lt - tK) * 0.9) % 1; ctx.strokeStyle = `rgba(179,38,43,${0.6 * (1 - rp)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(px, py, 20 + rp * 70, 8 + rp * 28, 0, 0, TAU); ctx.stroke(); } }
    // KADARAM label: solid plaque
    const ka = eio(pr(lt, tK, 0.5)); if (ka > 0) { ctx.save(); ctx.translate((1 - ka) * -40, 0); ctx.globalAlpha = ka;
      line([[465, 450], [px - 8, py - 40]], P.ink, 5); panel(280, 450, 370, 112); fit('KADARAM', 280, 450, 56, 320, P.gold, 4); ctx.restore(); }
    // KEDAH label: dashed (uncertain), a dotted ring and "?" on the pin
    const kp = eio(pr(lt, tP, 0.5)); if (kp > 0) { ctx.save(); ctx.globalAlpha = kp; ctx.translate((1 - kp) * -40, 0);
      ctx.strokeStyle = P.kumkum; ctx.lineWidth = 6; ctx.setLineDash([4, 14]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(280, 506); ctx.lineTo(280, 596); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(465, 650); ctx.quadraticCurveTo(540, 640, px - 28, py - 6); ctx.stroke(); ctx.setLineDash([]);
      panel(280, 660, 370, 112, 1, true); fit('KEDAH', 280, 654, 56, 320, P.cream, 4); fit('PROBABLY', 280, 704, 28, 300, P.gold, 8); ctx.restore();
      ctx.save(); ctx.globalAlpha = kp; ctx.strokeStyle = P.kumkum; ctx.lineWidth = 6; ctx.setLineDash([4, 12]); ctx.lineCap = 'round'; ctx.lineDashOffset = -t * 14; ctx.beginPath(); ctx.arc(px, py - 4, 74, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      const q = 1 + Math.sin(t * 4) * 0.05; ctx.translate(px + 92, py - 120); ctx.scale(q, q); ctx.font = '700 120px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = 14; ctx.strokeStyle = P.night; ctx.strokeText('?', 0, 0); ctx.fillStyle = P.gold; ctx.fillText('?', 0, 0); ctx.restore(); }
    twinkle(px, py - 100, 60 * Math.sin(clamp((lt - tK - 0.5) / 0.6) * Math.PI), 1);
    A.dust(t, 22, 3, '255,210,130', 0.4); K.vignette(0.6);
  } });
  cue(T1, 'whoosh', { gain: 0.6 }); cue(Wd('kadaram', 5) + 0.35, 'thud', { gain: 0.6 }); cue(Wd('probably', 5), 'tock', { gain: 0.7 }); cue(Wd('probably', 5) + 0.3, 'tock', { gain: 0.5 });

  // ═════════ B2 · line 6 · two roads split in fog; a question mark carved in lamplight ═════════
  add({ id: 'B2', at: T2, cam: [540, 1000], zoom: 0.1, note: 'night: fork in fog, lamp-carved question mark, HISTORIANS DISAGREE', draw(lt, d, t) {
    ctx.fillStyle = lg(0, -300, 0, 1300, [[0, '#0C0618'], [0.55, '#2A1530'], [1, '#6A3A3C']]); ctx.fillRect(-300, -300, W + 600, 1700);
    A.stars(t, 40, 0.6, 700, 21); K.glow(540, 1120, 640, '255,170,80', 0.35);
    // distant ridges
    ctx.fillStyle = '#2A1830'; poly([[-300, 1160], [-60, 1060], [200, 1120], [420, 1050], [700, 1130], [980, 1040], [1400, 1160]]); ctx.fill();
    A.fog(1130, 260, 0.6, '150,110,140');
    // ground
    ctx.fillStyle = lg(0, 1130, 0, 1920, [[0, '#4A2A2A'], [1, '#150B0A']]); ctx.fillRect(-300, 1128, W + 600, 900);
    // two roads from the fork at (540, 1250) to far points at left and right
    const fy = 1260;
    const road = (dir) => { const vx = 540 + dir * 560, vy = 1135; ctx.beginPath(); ctx.moveTo(540 - 150, 1920); ctx.lineTo(540 + 150, 1920); ctx.lineTo(540 + 70, fy + 14); ctx.bezierCurveTo(540 + dir * 120, fy - 10, vx - dir * 260, vy + 22, vx, vy); ctx.bezierCurveTo(vx - dir * 260, vy + 8, 540 + dir * 40, fy - 36, 540 - 70, fy + 14); ctx.closePath();
      ctx.fillStyle = lg(0, vy, 0, 1920, [[0, '#8A5C4A'], [1, '#D9A268']]); ctx.fill(); };
    // trunk (shared) then branches
    fillP([[540 - 200, 1920], [540 + 200, 1920], [540 + 52, fy + 30], [540 - 52, fy + 30]], lg(0, fy, 0, 1920, [[0, '#9C6850'], [1, '#E3B070']]) );
    road(-1); road(1);
    // lamp-lit road centre line dashes
    ctx.strokeStyle = 'rgba(255,214,140,0.35)'; ctx.lineWidth = 6; ctx.setLineDash([26, 40]); ctx.beginPath(); ctx.moveTo(540, 1920); ctx.lineTo(540, fy + 40); ctx.stroke(); ctx.setLineDash([]);
    // fork island with a lamp-post
    const lampY = fy + 10; line([[540, lampY], [540, lampY - 250]], '#1A0A04', 16); line([[540, lampY - 250], [610, lampY - 270]], '#1A0A04', 12);
    K.lamp(612, lampY - 220, 0.5, t, 1); K.glow(612, lampY - 290, 460, '255,190,90', 0.5 + 0.06 * Math.sin(t * 7));
    // signposts: blank boards pointing opposite ways (no writing)
    const board = (x, y, dir) => { ctx.save(); ctx.translate(x, y); line([[0, 0], [0, -230]], '#1A0A04', 12); ctx.scale(dir, 1); fillP([[0, -230], [170, -230], [220, -200], [170, -170], [0, -170]], '#6A4222'); ctx.strokeStyle = P.gold; ctx.lineWidth = 4; poly([[0, -230], [170, -230], [220, -200], [170, -170], [0, -170]]); ctx.stroke(); ctx.restore(); };
    board(300, 1560, -1); board(780, 1560, 1);
    // the carved "?" in lamplight, above the fork
    const qa = eio(pr(lt, 0.5, 0.9)), flick = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.1);
    if (qa > 0) { ctx.save(); ctx.translate(540, 700); ctx.scale(1 + (1 - qa) * 0.2, 1 + (1 - qa) * 0.2); ctx.globalAlpha = qa;
      K.glow(0, 0, 520, '255,170,70', 0.45 * flick); ctx.font = '700 540px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = 30; ctx.strokeStyle = '#2A1008'; ctx.strokeText('?', 0, 0);
      ctx.fillStyle = lg(0, -300, 0, 300, [[0, '#FFE9A8'], [0.5, P.gold], [1, P.goldDark]]); ctx.fillText('?', 0, 0);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * flick; ctx.lineWidth = 6; ctx.strokeStyle = '#FFF1BE'; ctx.strokeText('?', -4, -4); ctx.restore(); ctx.restore(); }
    // two tiny faceless travellers at the fork, backs to us, each facing a different way
    for (const [x, dir] of [[455, -1], [625, 1]]) { ctx.save(); ctx.translate(x, fy + 120); ctx.scale(dir, 1); ctx.fillStyle = DK; rr(-14, -112, 28, 70, 11); ctx.fill(); circle(0, -124, 12, DK); line([[0, -44], [8, 0]], DK, 9); line([[0, -44], [-8, 0]], DK, 9); ctx.restore(); }
    A.fog(1300, 240, 0.35, '170,120,140'); A.fog(1560, 280, 0.25, '150,110,140');
    const fx = (Math.sin(t * 0.3) * 60); ctx.save(); ctx.translate(fx, 0); A.fog(1180, 120, 0.4, '190,140,150'); ctx.restore();
    A.dust(t, 24, 8, '255,210,150', 0.35); K.vignette(0.7);
    // label
    const la = eio(pr(lt, 1.0, 0.6)); if (la > 0) { ctx.save(); ctx.globalAlpha = la; ctx.translate(0, (1 - la) * 24); panel(540, 330, 900, 130); fit('HISTORIANS DISAGREE', 540, 330, 60, 820, P.gold, 4); ctx.restore(); }
  } });
  cue(T2, 'whoosh', { gain: 0.6 }); cue(T2 + 0.5, 'swell', { gain: 0.7 }); cue(Wd('historians', 6), 'bell', { gain: 0.7 }); cue(Wd('historians', 6) + 0.1, 'sparkle', { gain: 0.5 });

  // ═════════ B3 · line 7 · the balance: PRESTIGE vs TRADE WITH CHINA ═════════
  add({ id: 'B3', at: T3, cam: [540, 860], zoom: 0.08, note: 'balance scale: glory wreath vs silk bales + junk ship, beam see-saws', draw(lt, d, t) {
    const tp = Wd('prestige', 7) - T3, tt = Wd('trade', 7) - T3;
    ctx.fillStyle = lg(0, -300, 0, 1920, [[0, '#1C0C08'], [0.5, '#4A2410'], [1, '#150B06']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    K.glow(540, 760, 820, '255,177,59', 0.42); K.colonnade(-60, 1380, 4, 400, 1000, K.STONE.warm); ctx.fillStyle = 'rgba(21,11,6,0.55)'; ctx.fillRect(-300, -300, W + 600, H + 600);
    K.glow(540, 700, 760, '255,190,90', 0.35);
    // table / base
    rr(120, 1380, 840, 54, 10); ctx.fillStyle = lg(0, 1380, 0, 1434, [[0, '#B9A486'], [1, '#6A5640']]); ctx.fill();
    // stand: column + foot
    const px = 540, py = 640;
    fillP([[px - 34, 1380], [px + 34, 1380], [px + 18, py + 30], [px - 18, py + 30]], lg(px - 34, 0, px + 34, 0, [[0, '#6A4A1E'], [0.5, P.gold], [1, '#8A6228']]));
    ell(px, 1384, 150, 26, '#6A5640'); rr(px - 120, 1346, 240, 40, 12); ctx.fillStyle = P.goldDark; ctx.fill();
    // tilt: dips toward whichever claim is being named, then settles to a gentle wobble
    const sw = (a, b) => eio(seg(lt, a, b));
    const ang = lerp(-0.16, 0.0, sw(tp - 0.1, tp + 0.5)) + (lt < tt - 0.6 ? 0 : 0) + (sw(tt - 0.5, tt + 0.5) * 0.17) + Math.sin(t * 1.9) * 0.03 * seg(lt, tt, tt + 1.0);
    const half = 310, L1 = [px - Math.cos(ang) * half, py - Math.sin(ang) * half], R1 = [px + Math.cos(ang) * half, py + Math.sin(ang) * half];
    // beam
    ctx.save(); ctx.translate(px, py); ctx.rotate(ang); rr(-half - 20, -14, half * 2 + 40, 28, 14); ctx.fillStyle = lg(0, -14, 0, 14, [[0, '#F5D58E'], [0.5, P.gold], [1, P.goldDark]]); ctx.fill();
    circle(-half, 0, 22, P.gold); circle(half, 0, 22, P.gold); ctx.restore(); circle(px, py, 34, P.gold); circle(px, py, 14, P.goldDark); fillP([[px, py - 34], [px - 14, py - 90], [px + 14, py - 90]], P.gold); circle(px, py - 100, 14, '#FFE9A8');
    // pans on chains
    const pan = (c, dropY) => { const x = c[0], y = c[1] + dropY; line([[c[0], c[1]], [x - 130, y]], 'rgba(232,182,58,0.9)', 5); line([[c[0], c[1]], [x + 130, y]], 'rgba(232,182,58,0.9)', 5); line([[c[0], c[1]], [x, y]], 'rgba(232,182,58,0.6)', 3);
      ctx.beginPath(); ctx.moveTo(x - 160, y); ctx.quadraticCurveTo(x, y + 80, x + 160, y); ctx.closePath(); ctx.fillStyle = lg(0, y, 0, y + 70, [[0, '#F5D58E'], [1, P.goldDark]]); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 6; ctx.stroke(); return [x, y]; };
    const lp = pan(L1, 400), rp = pan(R1, 400);
    // PRESTIGE: a glory wreath (no crown, no portrait), standing on the pan
    ctx.save(); ctx.translate(lp[0], lp[1] - 8);
    const wr = pr(lt, tp - 0.1, 0.6); ctx.globalAlpha = eio(wr);
    K.glow(0, -140, 280, '255,200,90', 0.5 * (0.6 + 0.4 * Math.sin(t * 3)));
    // clean wreath: two sprays of leaves around a ring, bound by a kumkum ribbon at the base
    ctx.beginPath(); ctx.arc(0, -150, 108, 0, TAU); ctx.strokeStyle = '#A87A1E'; ctx.lineWidth = 10; ctx.stroke();
    for (let i = 0; i < 22; i++) { const a = i / 22 * TAU + 0.2, r = 108; ctx.save(); ctx.translate(Math.cos(a) * r, -150 + Math.sin(a) * r); ctx.rotate(a + Math.PI / 2 + 0.5); ell(0, 0, 34, 13, i % 2 ? '#F3CB62' : '#D9A22E'); ctx.restore(); }
    for (let i = 0; i < 6; i++) { const a = 0.6 + i * 1.0; circle(Math.cos(a) * 108, -150 + Math.sin(a) * 108, 7, '#FFE9A8'); }
    fillP([[-14, -44], [14, -44], [46, 6], [14, -4], [0, 6], [-14, -4], [-46, 6]], P.kumkum);
    ctx.restore();
    // TRADE WITH CHINA: silk bales and a junk-ship silhouette
    ctx.save(); ctx.translate(rp[0], rp[1] - 8); ctx.scale(0.82, 0.82); const tr = pr(lt, tt - 0.1, 0.6); ctx.globalAlpha = eio(tr);
    K.glow(0, -110, 260, '255,190,90', 0.35);
    junk(40, -86, 0.34, '#1A0A04', 1, t, '#3A1A0C'); // hull rests on the bales
    bale(-110, 0, 120, 82, '#B3262B'); bale(10, 0, 120, 82, '#E8B63A'); bale(128, 0, 110, 82, '#1C6B78'); bale(-50, -82, 118, 76, '#E8B63A'); bale(76, -82, 118, 76, '#B3262B', 0.04);
    ctx.restore();
    // tilt arrows: curved arrows showing the see-saw
    const arr = eio(pr(lt, 0.3, 0.6)); ctx.save(); ctx.globalAlpha = 0.9 * arr; ctx.strokeStyle = P.kumkum; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (const [cx, dir] of [[px - 330, -1], [px + 330, 1]]) { const ay = py - 150 + Math.sin(t * 2.5 + dir) * 8; ctx.beginPath(); ctx.arc(cx, ay + 90, 90, dir > 0 ? -2.3 : -0.84, dir > 0 ? -0.84 : -2.3, dir < 0); ctx.stroke();
      const hx = cx + Math.cos(dir > 0 ? -0.84 : -2.3) * 90, hy = ay + 90 + Math.sin(dir > 0 ? -0.84 : -2.3) * 90; fillP([[hx + dir * 4, hy + 10], [hx - dir * 26, hy - 6], [hx + dir * 6, hy - 30]], P.kumkum); }
    ctx.restore();
    // labels, always above the caption zone
    const l1 = eio(pr(lt, tp, 0.5)); if (l1 > 0) { ctx.save(); ctx.globalAlpha = l1; panel(250, 1270, 420, 100); fit('PRESTIGE', 250, 1270, 54, 360, P.gold, 4); ctx.restore(); }
    const l2 = eio(pr(lt, tt, 0.5)); if (l2 > 0) { ctx.save(); ctx.globalAlpha = l2; panel(830, 1270, 420, 150); fit('TRADE', 830, 1236, 54, 360, P.gold, 4); fit('WITH CHINA', 830, 1300, 54, 360, P.cream, 4); ctx.restore(); }
    K.embers(t, 20, 6, '255,200,110'); A.dust(t, 20, 4, '255,210,130', 0.35); K.vignette(0.55);
    const ha = eio(pr(lt, 0.2, 0.6)); ctx.save(); ctx.globalAlpha = ha; fit('WHY DID THEY GO?', 540, 250, 56, 880, P.gold, 6); line([[240, 292], [840, 292]], P.goldDark, 3); ctx.restore();
  } });
  cue(T3, 'whoosh', { gain: 0.6 }); cue(Wd('prestige', 7), 'tock', { gain: 0.8 }); cue(Wd('prestige', 7) + 0.1, 'sparkle', { gain: 0.5 }); cue(Wd('trade', 7) - 0.4, 'slide', { gain: 0.5 }); cue(Wd('trade', 7), 'thud', { gain: 0.7 });

  // ═════════ B4 · line 8 · a chain of ports: ships halted at the chain at each gate; the writer's scroll ═════════
  add({ id: 'B4', at: T4, cam: [540, 1020], zoom: 0.07, note: 'three port lanes, chain barrier, ships halted, scroll label A CHINESE WRITER, SHIPS MUST STOP', draw(lt, d, t) {
    const tW = Wd('writer', 8) - T4, tF = Wd('forced', 8) - T4, tS = Wd('stop', 8) - T4;
    ctx.fillStyle = lg(0, -300, 0, 1920, [[0, '#2A1030'], [0.3, '#8A3A38'], [0.5, '#2A1608'], [1, '#150B06']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    K.glow(300, 520, 700, '255,170,80', 0.35);
    // the three lanes: water band on the left, coast + port towers on the right, a rope-of-lamps linking the ports
    const lanes = [790, 1060, 1330], stopX = [430, 400, 460], lanesD = [0.0, 0.5, 1.0];
    ctx.fillStyle = '#143A44'; ctx.fillRect(-300, 640, 1100, 880);
    lanes.forEach((y, i) => { ctx.fillStyle = i % 2 ? '#1C6B78' : '#175862'; ctx.fillRect(-300, y - 120, 1100, 240); ctx.strokeStyle = 'rgba(246,231,196,0.16)'; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { ctx.beginPath(); for (let x = -20; x <= 800; x += 20) ctx.lineTo(x, y + 60 + k * 18 + Math.sin(x * 0.03 + t * 1.5 + i + k) * 4); ctx.stroke(); } });
    // land
    ctx.fillStyle = lg(780, 0, 1080, 0, [[0, '#8C5A30'], [1, '#4A2A14']]); poly([[800, 640], [1400, 640], [1400, 1520], [800, 1520], [760, 1400], [800, 1260], [760, 1130], [800, 990], [760, 860], [800, 740]]); ctx.fill();
    ctx.fillStyle = 'rgba(246,231,196,0.2)'; for (const y of [740, 860, 990, 1130, 1260, 1400]) ctx.fillRect(764, y - 3, 40, 6);
    // dotted chain-of-ports link between the gates
    ctx.strokeStyle = P.gold; ctx.lineWidth = 6; ctx.setLineDash([2, 18]); ctx.lineCap = 'round'; ctx.lineDashOffset = -t * 10; ctx.beginPath(); ctx.moveTo(900, lanes[0] - 20); ctx.lineTo(900, lanes[2] - 20); ctx.stroke(); ctx.setLineDash([]);
    lanes.forEach((y, i) => {
      const gy = y + 30;
      // gate towers (stone) + lamp
      ctx.save(); K.gopuram(900, gy, 0.22, K.STONE.warm, { tiers: 3, w: 520 }); ctx.restore(); K.glow(900, gy - 60, 120, '255,170,60', 0.45); circle(900, gy - 56, 6, '#FFE9A8');
      // the chain: heavy links sagging from the gate pier to a stake at stopX+..., hangs at water level
      const sx = stopX[i] + 230, sy = gy + 8, ex = 790, ey = gy - 10, show = eio(pr(lt, tF + lanesD[i] * 0.5 - 0.3, 0.5));
      if (show > 0) { ctx.save(); ctx.globalAlpha = show; line([[sx, sy + 8], [sx, sy - 90]], '#1A0A04', 14); circle(sx, sy - 96, 12, P.gold);
        const n = 12; for (let k = 0; k <= n; k++) { const u = k / n, x = lerp(sx, ex, u), y = lerp(sy - 76, ey - 36, u) + Math.sin(u * Math.PI) * 38; ctx.save(); ctx.translate(x, y); ctx.rotate(k % 2 ? 0 : 0.9); ctx.strokeStyle = '#D9B24A'; ctx.lineWidth = 5; rr(-11, -6, 22, 12, 6); ctx.stroke(); ctx.restore(); }
        ctx.restore(); }
      // ships come from the left and halt at the chain
      const k0 = tW + 0.2 + lanesD[i] * 1.2, pk = clamp((lt - k0) / 2.0), x = lerp(-260, stopX[i], eo(pk)) + (pk >= 1 ? Math.sin((lt - k0 - 2) * 3) * 3 * Math.exp(-(lt - k0 - 2) * 0.8) : 0);
      const sc = 0.4; junk(x, gy + 28, sc, '#0E0503', 1, t, '#2A1408');
      if (pk >= 1) { const st = clamp((lt - k0 - 2) / 0.5); if (st > 0 && st < 1) { twinkle(stopX[i] + 200, gy - 50, 40 * Math.sin(st * Math.PI), 1); } }
    });
    // top block: scroll icon + A CHINESE WRITER
    const wa = eio(pr(lt, tW - 0.1, 0.6)); if (wa > 0) { ctx.save(); ctx.globalAlpha = wa; ctx.translate(0, (1 - wa) * -30);
      K.glow(230, 330, 260, '255,200,100', 0.45); scroll(230, 330, 250, -0.08 + Math.sin(t * 1.5) * 0.02);
      panel(690, 330, 560, 120, 1); fit('A CHINESE WRITER', 690, 330, 52, 500, P.gold, 3); ctx.restore(); }
    // SHIPS MUST STOP stamp
    const sa = pr(lt, tS - 0.3, 0.45); if (sa > 0) { ctx.save(); ctx.translate(540, 535); ctx.rotate(-0.04); ctx.scale(eob(sa), eob(sa)); ctx.globalAlpha = Math.min(1, sa * 3);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; rr(-390, -62, 780, 124, 18); ctx.fillStyle = P.kumkum; ctx.fill(); ctx.restore();
      ctx.strokeStyle = P.cream; ctx.lineWidth = 5; rr(-390, -62, 780, 124, 18); ctx.stroke(); ctx.strokeStyle = 'rgba(246,231,196,0.5)'; ctx.lineWidth = 2; rr(-378, -50, 756, 100, 12); ctx.stroke();
      fit('SHIPS MUST STOP', 0, 4, 78, 720, P.cream, 5); ctx.restore(); }
    // soft mist at the water line
    A.fog(1500, 160, 0.25, '246,184,100'); K.embers(t, 16, 4, '255,200,110'); K.vignette(0.55);
  } });
  cue(T4, 'whoosh', { gain: 0.6 }); cue(Wd('writer', 8), 'tock', { gain: 0.7 }); cue(Wd('forced', 8), 'slide', { gain: 0.5 });
  for (let i = 0; i < 3; i++) cue(Wd('writer', 8) + 0.2 + i * 1.2 + 2.0, 'thud', { gain: 0.45 });
  cue(Wd('stop', 8), 'slam', { gain: 0.7 });

  // ═════════ B5 · line 9 · the ruler of years: 1025 ... about two centuries ... c. 1225 ═════════
  add({ id: 'B5', at: T5, cam: [540, 1000], zoom: 0.08, note: 'time ruler 1000-1250, gap 1025 to c.1225 highlighted, hourglass, ABOUT TWO CENTURIES LATER', draw(lt, d, t) {
    const tW = Wd('wrote', 9) - T5, tA = Wd('about', 9) - T5, tL = Wd('later', 9) - T5;
    ctx.fillStyle = lg(0, -300, 0, 1920, [[0, '#150B06'], [0.5, '#3A1C0C'], [1, '#150B06']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    K.glow(540, 560, 760, '255,177,59', 0.38);
    // hourglass (no figures): two bulbs, falling sand, a gold frame
    const hx = 540, hy = 560, hw = 120, hh = 175, fl = clamp(lt / d), sandTop = lerp(0.95, 0.15, eio(fl)), sandBot = lerp(0.05, 0.85, eio(fl));
    ctx.save(); ctx.translate(hx, hy);
    const glass = () => { ctx.beginPath(); ctx.moveTo(-hw, -hh); ctx.bezierCurveTo(-hw, -20, -16, -34, -14, 0); ctx.bezierCurveTo(-16, 34, -hw, 20, -hw, hh); ctx.lineTo(hw, hh); ctx.bezierCurveTo(hw, 20, 16, 34, 14, 0); ctx.bezierCurveTo(16, -34, hw, -20, hw, -hh); ctx.closePath(); };
    glass(); ctx.fillStyle = 'rgba(246,231,196,0.12)'; ctx.fill();
    ctx.save(); glass(); ctx.clip(); ctx.fillStyle = '#E8B63A'; ctx.fillRect(-hw, lerp(-hh, -8, 1 - sandTop), hw * 2, hh); ctx.fillStyle = '#D9A22E'; ctx.fillRect(-hw, lerp(hh, 10, sandBot) , hw * 2, hh);
    ctx.fillStyle = '#F5D58E'; ctx.fillRect(-2.5, -6, 5, hh); ctx.restore();
    glass(); ctx.strokeStyle = 'rgba(246,231,196,0.7)'; ctx.lineWidth = 6; ctx.stroke();
    for (const y of [-hh - 18, hh + 18]) { rr(-hw - 30, y - 18, hw * 2 + 60, 36, 10); ctx.fillStyle = lg(0, y - 18, 0, y + 18, [[0, '#F5D58E'], [1, P.goldDark]]); ctx.fill(); }
    for (const x of [-hw - 14, hw + 14]) line([[x, -hh], [x, hh]], P.gold, 10);
    ctx.restore();
    // the ruler: a long palm-leaf strip with decade ticks, 1000 to 1250 mapped to x 100..980
    const rx0 = 100, rx1 = 980, ry = 1030, X = (yr) => lerp(rx0, rx1, (yr - 1000) / 250);
    const ra = eio(pr(lt, 0.1, 0.6)); ctx.save(); ctx.globalAlpha = ra;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12; rr(40, ry - 60, 1000, 120, 16); ctx.fillStyle = lg(0, ry - 60, 0, ry + 60, [[0, '#E3B97A'], [0.5, '#C9985A'], [1, '#8C5E2C']]); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(110,70,30,0.3)'; ctx.lineWidth = 2; for (let y = ry - 54; y < ry + 60; y += 8) { ctx.beginPath(); ctx.moveTo(48, y); ctx.lineTo(1032, y); ctx.stroke(); }
    // gap highlight (sweeps from 1025 to c.1225 across the words "about two centuries later")
    const sw = eio(clamp((lt - tA) / (tL + 0.6 - tA))), gx0 = X(1025), gx1 = lerp(X(1025), X(1225), sw);
    ctx.fillStyle = 'rgba(179,38,43,0.78)'; ctx.fillRect(gx0, ry - 60, gx1 - gx0, 120);
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFE9A8'; for (let i = 0; i < 6; i++) ctx.fillRect(gx0 + ((t * 120 + i * 160) % Math.max(1, gx1 - gx0 + 1)), ry - 60, 14, 120); ctx.restore();
    ctx.strokeStyle = P.ink; ctx.lineCap = 'butt'; for (let yr = 1000; yr <= 1250; yr += 10) { const big = yr % 50 === 0, x = X(yr); ctx.lineWidth = big ? 6 : 3; ctx.beginPath(); ctx.moveTo(x, ry + 60); ctx.lineTo(x, ry + (big ? -2 : 22)); ctx.stroke(); }
    for (let yr = 1000; yr <= 1250; yr += 50) { ctx.font = '700 32px Caladea'; ctx.textAlign = 'center'; ctx.fillStyle = P.cream; ctx.textBaseline = 'middle'; ctx.fillText(String(yr), X(yr), ry + 92); }
    ctx.restore();
    // 1025 flag (the fleet) and c. 1225 flag (the writer's scroll)
    const a1 = pr(lt, 0.4, 0.5), a2 = pr(lt, tW + 0.1, 0.5);
    if (a1 > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, a1 * 2); line([[X(1025), ry - 60], [X(1025), 820]], P.gold, 7); K.plaque('1025', 200, 760, eob(a1), 70); ctx.restore(); }
    if (a2 > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, a2 * 2); line([[X(1225), ry - 60], [X(1225), 820]], P.gold, 7); K.plaque('c. 1225', 850, 760, eob(a2), 70); scroll(X(1225), ry - 150, 120, -0.1); ctx.restore(); }
    // the span bracket under the ruler + label
    const la = eio(pr(lt, tA - 0.05, 0.6)); if (la > 0) { ctx.save(); ctx.globalAlpha = la;
      const bx0 = X(1025), bx1 = lerp(X(1025), X(1225), sw), by = ry + 140; ctx.strokeStyle = P.gold; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx0, by - 18); ctx.lineTo(bx0, by); ctx.lineTo(bx1, by); ctx.lineTo(bx1, by - 18); ctx.stroke();
      ctx.translate(0, (1 - la) * 20); panel(540, 1330, 940, 150); fit('ABOUT TWO CENTURIES', 540, 1306, 58, 860, P.gold, 4); fit('LATER', 540, 1370, 58, 860, P.cream, 8); ctx.restore(); }
    // ship at 1025 on the ruler (generic silhouette) and a spark where the gap closes
    ctx.save(); ctx.globalAlpha = eio(pr(lt, 0.4, 0.5)); junk(X(1025), ry - 64, 0.12, '#0E0503', 1, t, '#2A1408'); ctx.restore();
    twinkle(gx1, ry, 46 * Math.sin(clamp((lt - tL) / 0.9) * Math.PI), 1);
    K.embers(t, 18, 3, '255,200,110'); A.dust(t, 22, 6, '255,210,130', 0.35); K.vignette(0.6);
  } });
  cue(T5, 'whoosh', { gain: 0.6 }); cue(T5 + 0.4, 'tock', { gain: 0.6 }); cue(Wd('about', 9), 'slide', { gain: 0.5 }); cue(Wd('later', 9), 'bell', { gain: 0.8 });
}
