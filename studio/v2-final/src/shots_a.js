// EPISODE 2 · worker A : hook (river water road + palm-leaf route map), name plate, city ground-plan
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L } from './core/timing.js';
import * as K from './core/kit.js';
import * as A from './art.js';
const { P } = K;
const { lg, poly, fillP } = A;

const SIL = '#160804';
// ---- a bearer in silhouette, carrying two copper pots on a pole (seen walking toward the camera) ----
function bearer(x, y, s, ph, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const w = Math.sin(ph), bob = Math.abs(Math.cos(ph)) * 5;
  line([[-12, 0], [-10 + w * 14, -118]], SIL, 18); line([[12, 0], [10 - w * 14, -118]], SIL, 18);   // legs
  ctx.translate(0, -bob);
  rr(-24, -250, 48, 140, 18); ctx.fillStyle = SIL; ctx.fill();                                       // body
  fillP([[-26, -150], [26, -150], [34, -92], [-34, -92]], '#2A0F08');                                // cloth
  circle(6, -272, 20, SIL);                                                                          // head, bowed
  line([[-110, -236 + 6], [0, -246], [110, -236 + 6]], '#3A1C0C', 8);                                // pole (sags)
  for (const k of [-1, 1]) {
    const px = k * 100, sw = Math.sin(t * 3 + ph + k) * 3;
    line([[px, -232], [px - 16 + sw, -178]], '#3A1C0C', 3); line([[px, -232], [px + 16 + sw, -178]], '#3A1C0C', 3);
    ell(px + sw, -150, 30, 33, '#C46A32'); ell(px + sw - 10, -158, 9, 15, '#F0A464'); rr(px + sw - 14, -190, 28, 16, 5); ctx.fillStyle = '#9A4E22'; ctx.fill();
  }
  ctx.restore();
}
function soldier(x, y, s, ph) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const w = Math.sin(ph);
  line([[-10, 0], [-8 + w * 10, -110]], SIL, 16); line([[10, 0], [8 - w * 10, -110]], SIL, 16);
  rr(-22, -240, 44, 140, 16); ctx.fillStyle = SIL; ctx.fill(); circle(0, -266, 20, SIL); fillP([[-20, -276], [20, -276], [0, -312]], SIL);
  line([[34, 20], [34, -380]], '#2A1208', 6); fillP([[34, -380], [28, -350], [40, -350]], '#C9985A');
  ctx.restore();
}
function flagA(x, y, s, t, ph = 0) {                         // small tiger banner on a pole (far)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  line([[0, 0], [0, -330]], '#2A1208', 8);
  ctx.beginPath(); ctx.moveTo(0, -320);
  for (let u = 0; u <= 1.001; u += 0.1) ctx.lineTo(u * 150, -320 + Math.sin(u * 5 - t * 5 + ph) * 12 * u);
  for (let u = 1; u >= -0.001; u -= 0.1) ctx.lineTo(u * 150, -200 + Math.sin(u * 5 - t * 5 + ph) * 12 * u);
  ctx.closePath(); ctx.fillStyle = P.kumkum; ctx.fill();
  ctx.save(); ctx.translate(75, -262); A.tiger(0, 0, 0.32, P.gold, P.goldDark); ctx.restore(); ctx.restore();
}
const polyAt = (pts, f) => {                                  // point at fraction f along a polyline
  let tot = 0; const ls = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls.push(l); tot += l; }
  let left = clamp(f) * tot; for (let i = 1; i < pts.length; i++) { if (left <= ls[i - 1] || i === pts.length - 1) { const k = clamp(left / ls[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } left -= ls[i - 1]; }
};
const potIcon = (x, y, s = 1) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ell(0, 0, 20, 22, '#E08A48'); ell(-6, -6, 6, 10, '#FFC890'); rr(-9, -30, 18, 12, 4); ctx.fillStyle = '#B5602A'; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, 0, 20, 22, 0, 0, TAU); ctx.stroke(); ctx.restore(); };

// ═════════ scene 1a : the road beside the river at dawn ═════════
function roadScene(lt, t) {
  const VX = 330, VY = 930;
  K.sky(t, 640, 820);
  A.haze(560, 940, '#FFD9A0', 0, 0.55);
  // far low hills
  ctx.save(); ctx.translate(-lt * 6, 0); ctx.fillStyle = '#B9774A'; poly([[-300, 940], [-60, 880], [200, 920], [460, 870], [760, 925], [1000, 890], [1400, 940]]); ctx.fill(); ctx.restore();
  // river (left of the road), wide, sun glitter
  poly([[-300, 940], [VX - 20, VY], [330, VY + 30], [880, 2200], [-300, 2200]]);
  ctx.fillStyle = lg(0, 930, 0, 2000, [[0, '#F3CC86'], [0.35, '#D98B4D'], [1, '#7A4224']]); ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,240,190,0.6)';
  for (let i = 0; i < 26; i++) { const yy = 950 + Math.pow(rnd(i + 3), 1.6) * 520, gx = 250 - (yy - 950) * 0.45 + Math.sin(t * 0.8 + i) * 18 + (rnd(i) - 0.5) * 240, gw = 24 + (yy - 930) * 0.25 * rnd(i + 5); ctx.fillRect(gx - gw / 2, yy, gw, 3 + (yy - 930) * 0.01); }
  ctx.restore();
  // far bank + palms and the road on the right
  ctx.fillStyle = '#6B3E20'; poly([[330, VY + 20], [-300, 1000], [-300, 940]]); ctx.fill();
  poly([[VX - 6, VY], [VX + 10, VY], [1900, 2200], [200, 2200]]); ctx.fillStyle = lg(0, VY, 0, 2000, [[0, '#E3AC66'], [1, '#B07A40']]); ctx.fill();
  // grass bank on the right of the road
  poly([[VX + 10, VY], [1900, VY], [1900, 2200]]); ctx.fillStyle = lg(0, VY, 0, 2000, [[0, '#8C6A34'], [1, '#4A3218']]); ctx.fill();
  A.fog(950, 170, 0.5, '255,205,140');
  // ruts
  ctx.strokeStyle = 'rgba(110,64,30,0.35)'; ctx.lineWidth = 4;
  for (const o of [-0.25, 0.25]) { ctx.beginPath(); ctx.moveTo(VX, VY); ctx.lineTo(560 + o * 520 + 400, 2000); ctx.stroke(); }
  // far palms
  [[560, 960, 150, -0.05, 4], [760, 975, 190, 0.04, 8], [980, 985, 230, -0.05, 2]].forEach(([x, y, h, l, sd]) => A.palm(x - lt * 12, y, h, l, sd, '#3E2212', t));
  // distant column: soldiers and tiger banners beside the road
  for (let i = 0; i < 4; i++) { const u = 0.07 + i * 0.05, y = VY + u * 570, x = VX + (y - VY) * 0.6 + 60 * u * 4, s = 0.12 + u * 1.1; soldier(x, y, s, t * 3 + i); }
  flagA(VX + 60 + 0.6 * 70, VY + 70, 0.4, t);
  // bearers walking toward the camera, drifting right
  const N = 11, order = [];
  for (let i = 0; i < N; i++) order.push([(i / N + lt * 0.028) % 1, i]);
  order.sort((a, b) => a[0] - b[0]);
  for (const [u, i] of order) {
    const y = VY + 20 + Math.pow(u, 1.5) * 560, f = (y - VY) / 570, x = VX + 40 + (y - VY) * 0.80 + Math.sin(i * 2.1) * 26 * f, s = 0.1 + f * 1.15;
    ctx.globalAlpha = clamp(u * 10, 0, 1);
    bearer(x, y, s, t * 4.2 + i * 1.7, t); ctx.globalAlpha = 1;
  }
  // near soldier with a big tiger banner, foreground right, out of focus-ish silhouette
  flagA(930 - lt * 20, 1480, 1.0, t, 2); soldier(1010 - lt * 20, 1480, 1.0, t * 2.4);
  A.fog(1480, 140, 0.35, '230,170,100');
  A.dust(t, 40, 5, '255,214,150', 0.55);
  K.glow(640, 820, 700, '255,214,140', 0.35);
}

// ═════════ scene 1b : the palm-leaf map ═════════
const PEN = [[110, 330], [470, 300], [830, 330], [960, 420], [930, 540], [880, 640], [900, 780], [860, 960], [770, 1140], [680, 1290], [610, 1390], [560, 1330], [470, 1160], [370, 980], [260, 820], [180, 700], [130, 560], [110, 430]];
const RT = [[780, 430], [730, 540], [770, 690], [700, 830], [620, 940], [660, 1050], [650, 1150], [610, 1250]];
function mapScene(lt, t) {
  ctx.fillStyle = lg(0, 0, 0, H, [[0, '#2A1608'], [0.5, '#3A200E'], [1, '#1E0F06']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  // palm-leaf ground: a big leaf with fine lines
  rr(40, 140, 1000, 1360, 30); ctx.fillStyle = lg(0, 140, 0, 1500, [[0, '#8C5E2C'], [0.5, '#A97A40'], [1, '#7A4F24']]); ctx.fill();
  ctx.save(); rr(40, 140, 1000, 1360, 30); ctx.clip(); ctx.strokeStyle = 'rgba(40,20,6,0.3)'; ctx.lineWidth = 2; for (let y = 150; y < 1500; y += 9) { ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(1040, y + (rnd(y) - 0.5) * 2); ctx.stroke(); } ctx.restore();
  rr(40, 140, 1000, 1360, 30); ctx.strokeStyle = P.goldDark; ctx.lineWidth = 6; ctx.stroke();
  // sea waves marks
  ctx.strokeStyle = 'rgba(36,18,10,0.35)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const x = 100 + rnd(i) * 200 + (i % 2) * 650, y = 800 + rnd(i + 4) * 560; if (x > 330 && x < 730 && y < 1180) continue; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 20, y - 14, x + 40, y); ctx.quadraticCurveTo(x + 60, y + 14, x + 80, y); ctx.stroke(); }
  // peninsula
  poly(PEN); ctx.fillStyle = '#E0B46A'; ctx.fill(); ctx.strokeStyle = '#4A2A10'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
  
  // Himalaya hint + Ganges river
  for (let i = 0; i < 6; i++) fillP([[150 + i * 100, 270], [200 + i * 100, 190], [250 + i * 100, 270]], '#5A3A1C');
  ctx.beginPath(); ctx.moveTo(350, 300); ctx.bezierCurveTo(430, 380, 520, 330, 600, 400); ctx.bezierCurveTo(680, 470, 720, 390, 780, 430); ctx.strokeStyle = '#2C7C88'; ctx.lineWidth = 12; ctx.stroke(); ctx.strokeStyle = '#6EB7B5'; ctx.lineWidth = 4; ctx.stroke();
  // labels
  circle(780, 430, 14, P.kumkum); K.label('GANGES', 800, 372, 40, '#1E0F06');
  circle(610, 1250, 14, P.kumkum); K.label('TAMIL COUNTRY', 760, 1292, 36, '#1E0F06');
  // route draws on
  const tw = 0.15, p = eio(clamp((lt - tw) / 2.9)), head = K.route(RT, p);
  for (let k = 0; k < 5; k++) { const f = p - k * 0.1; if (f <= 0.01) continue; const [px, py] = polyAt(RT, f); K.glow(px, py, 60, '255,190,90', 0.55); potIcon(px, py - 12 + Math.sin(t * 6 + k) * 2, 1.05); }
  K.glow(head[0], head[1], 90, '255,200,100', 0.6);
  // hint of arrival: ripple at the tamil country
  const arr = seg(lt, tw + 2.9, tw + 3.6); if (arr > 0) { ctx.strokeStyle = `rgba(232,182,58,${0.8 * (1 - arr)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(610, 1250, 20 + arr * 90, 0, TAU); ctx.stroke(); }
  K.label('ROUTE NOT TO SCALE', 540, 1470, 34, '#F6E7C4');
  K.embers(t, 14, 3);
}

export function buildA(add, cue) {
  const a1 = 0, a2 = L(2) - 0.1, a3 = L(3) - 0.1, wipeT = L(1) - 0.25;

  // ───────── A1 : the road, then the map ─────────
  add({ id: 'A1', at: a1, cam: [540, 1000], zoom: 0.1, note: 'dawn road dolly with bearers, wipe to palm-leaf route map', draw(lt, d, t) {
    const wl = wipeT - a1, wp = clamp((lt - wl) / 0.5);
    const tilt = (1 - eio(clamp(lt / wl))) * 0;
    if (wp < 1) {
      ctx.save(); ctx.translate(-lt * 22, tilt); roadScene(lt, t); ctx.restore();
      A.stars(t, 40, 0.35 * (1 - clamp(lt / 1.2)), 500);
      A.veil(0.5 * (1 - eo(clamp(lt / 1.6))), '20,8,6');
    }
    if (wp > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, (W + 600) * eio(wp) + 0, H + 600); ctx.clip(); mapScene(lt - wl, t); ctx.restore();
      const ex = -300 + (W + 600) * eio(wp);
      if (wp < 1) { ctx.fillStyle = 'rgba(255,214,130,0.85)'; ctx.fillRect(ex - 6, -300, 12, H + 600); K.glow(ex, 900, 300, '255,200,100', 0.35); }
    }
    K.vignette(0.55);
  } });
  cue(0.05, 'swell', { gain: 0.8 }); cue(0.4, 'rumble', { gain: 0.5, dur: 2.6 });
  cue(wipeT, 'whoosh', { gain: 0.8 }); cue(wipeT + 1.0, 'sparkle', { gain: 0.5 }); cue(wipeT + 3.0, 'pop', { gain: 0.7 });

  // ───────── A2 : name plate beside a waving tiger banner ─────────
  add({ id: 'A2', at: a2, cam: [540, 1000], zoom: 0.12, note: 'tiger banner, far tower in haze, name plate', draw(lt, d, t) {
    const k = lt / d;
    ctx.fillStyle = lg(0, -300, 0, 1500, [[0, '#2A0F0C'], [0.45, '#6A2A1A'], [0.75, '#D98B45'], [1, '#F2C27A']]); ctx.fillRect(-300, -300, W + 600, 2500);
    A.stars(t, 60, 0.7, 600);
    K.glow(760, 980, 800, '255,170,80', 0.55);
    // far tower in haze
    ctx.save(); ctx.translate(-k * 18, 0); A.drawVimana('dusk', 780, 1040, 0.34, 0.95, 1.0); ctx.restore();
    A.haze(700, 1060, '#F2B070', 0, 0.8);
    ctx.fillStyle = '#3A1E0E'; poly([[-300, 1060], [100, 1010], [340, 1040], [640, 1020], [1400, 1060], [1400, 2300], [-300, 2300]]); ctx.fill();
    A.fog(1040, 140, 0.5, '240,170,100');
    A.palm(1010 - k * 40, 1260, 600, -0.1, 5, '#120703', t); A.palm(-20 - k * 60, 1330, 700, 0.12, 9, '#120703', t);
    // big banner: pole on the left, cloth waving
    const px = 150, top = 330, bot = 1060, cw = 520, ch = 420, pop = eob(clamp(lt / 0.6));
    ctx.save(); ctx.translate(0, (1 - pop) * 300 + k * 0);
    line([[px, bot + 140], [px, top - 40]], '#2A1208', 20); circle(px, top - 50, 20, P.gold); fillP([[px - 10, top - 60], [px + 10, top - 60], [px, top - 100]], P.gold);
    const wv = (u, v) => [px + 10 + u * cw, top + v * ch + Math.sin(u * 5.5 - t * 4.2) * 22 * u + Math.sin(v * 3 + t * 2) * 5 * u];
    ctx.beginPath(); for (let u = 0; u <= 1.001; u += 0.05) { const [x, y] = wv(u, 0); u ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    for (let v = 0; v <= 1.001; v += 0.1) { const [x, y] = wv(1, v); ctx.lineTo(x, y); }
    for (let u = 1; u >= -0.001; u -= 0.05) { const [x, y] = wv(u, 1); ctx.lineTo(x, y); }
    ctx.closePath(); ctx.fillStyle = lg(px, 0, px + cw, 0, [[0, '#8E1F1F'], [0.5, '#B3262B'], [1, '#7A1A1A']]); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 8; ctx.stroke();
    // fold shading
    for (let i = 0; i < 4; i++) { const u0 = 0.15 + i * 0.22; ctx.beginPath(); for (let v = 0; v <= 1.001; v += 0.1) { const [x, y] = wv(u0, v); v ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = 'rgba(40,0,0,0.25)'; ctx.lineWidth = 16; ctx.stroke(); }
    const [tx, ty] = wv(0.5, 0.5); ctx.save(); ctx.translate(tx, ty + 30); ctx.rotate(Math.sin(0.5 * 5.5 - t * 4.2) * 0.05); A.tiger(-10, 0, 1.25, P.gold, P.goldDark); ctx.restore();
    ctx.restore();
    // name plate (dark palm-leaf strip)
    const pp = eob(clamp((lt - 0.7) / 0.6)), py = 1290;
    if (pp > 0) { ctx.save(); ctx.translate(540, py); ctx.scale(pp, pp);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10; rr(-440, -130, 880, 260, 30); ctx.fillStyle = '#24120A'; ctx.fill(); ctx.restore();
      rr(-440, -130, 880, 260, 30); ctx.strokeStyle = P.gold; ctx.lineWidth = 7; ctx.stroke(); rr(-426, -116, 852, 232, 22); ctx.strokeStyle = 'rgba(232,182,58,0.45)'; ctx.lineWidth = 3; ctx.stroke();
      K.lotus(-440, 0, 0.3); K.lotus(440, 0, 0.3);
      K.tamil('ராஜேந்திர சோழன்', 0, -30, 70, P.gold); K.label('RAJENDRA CHOLA', 0, 72, 50, P.cream); ctx.restore(); }
    A.warmRays(t, 0.12, 5); A.dust(t, 40, 11, '255,214,150', 0.5); K.embers(t, 14, 7); K.vignette(0.6);
  } });
  cue(a2, 'whoosh', { gain: 0.8 }); cue(a2 + 0.2, 'drum', { gain: 0.9 }); cue(a2 + 0.8, 'pop', { gain: 0.7 }); cue(a2 + 1.1, 'sparkle', { gain: 0.6 }); cue(a2 + 3.8, 'bell', { gain: 0.5 });

  // ───────── A3 : the ground plan of a new city ─────────
  add({ id: 'A3', at: a3, cam: [540, 880], zoom: 0.14, note: 'palm-leaf plan, ropes, pegs, gold ink walls, temple square, year plate', draw(lt, d, t) {
    const part = (pts, f) => { const ls = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls.push(l); tot += l; }
      let left = clamp(f) * tot; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length && left > 0; i++) { const kk = Math.min(1, left / ls[i - 1]); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], kk), lerp(pts[i - 1][1], pts[i][1], kk)); left -= ls[i - 1]; } };
    ctx.fillStyle = '#150A05'; ctx.fillRect(-300, -300, W + 600, H + 600);
    rr(70, 230, 940, 1180, 26); ctx.fillStyle = lg(0, 230, 0, 1410, [[0, '#3A2210'], [0.5, '#4A2E16'], [1, '#2E1A0C']]); ctx.fill();
    ctx.save(); rr(70, 230, 940, 1180, 26); ctx.clip(); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; for (let y = 236; y < 1410; y += 8) { ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(1010, y + (rnd(y) - 0.5) * 2); ctx.stroke(); } ctx.restore();
    rr(70, 230, 940, 1180, 26); ctx.strokeStyle = P.goldDark; ctx.lineWidth = 6; ctx.stroke();
    K.glow(540, 820, 700, '255,170,60', 0.22);
    const X0 = 170, X1 = 910, Y0 = 400, Y1 = 1280, CX = 540, CY = 840;
    const C = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1], [X0, Y0]];
    // pegs
    const pegs = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]];
    pegs.forEach(([x, y], i) => { const pp = eob(clamp((lt - 0.1 - i * 0.12) / 0.3)); if (pp <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(pp, pp); fillP([[-9, -38], [9, -38], [4, 6], [-4, 6]], '#C9985A'); circle(0, -40, 12, P.cream); ctx.restore(); });
    // surveyor ropes (cream, thin) draw around the rectangle then fade as ink takes over
    const rp = eio(clamp((lt - 0.3) / 1.2)), ropeA = 1 - seg(lt, 1.8, 2.6) * 0.75;
    ctx.save(); ctx.globalAlpha = ropeA; ctx.setLineDash([3, 0]); part(C, rp); ctx.strokeStyle = '#EAD9B0'; ctx.lineWidth = 4; ctx.stroke();
    // cross ropes at the centre lines
    const cp = eio(clamp((lt - 0.9) / 1)); ctx.setLineDash([14, 10]); ctx.lineWidth = 3; part([[CX, Y0], [CX, Y1]], cp); ctx.stroke(); part([[X0, CY], [X1, CY]], cp); ctx.stroke(); ctx.restore();
    // gold ink walls (double line), gates, street grid
    const ink = (pts, f, w = 6, a = 1) => { ctx.save(); ctx.shadowColor = 'rgba(255,190,70,0.8)'; ctx.shadowBlur = 14; ctx.globalAlpha = a; part(pts, f); ctx.strokeStyle = P.gold; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.setLineDash([]); ctx.stroke(); ctx.restore(); };
    const wp = eio(clamp((lt - 1.1) / 1.2));
    ink(C, wp, 9); const m = 34; ink([[X0 + m, Y0 + m], [X1 - m, Y0 + m], [X1 - m, Y1 - m], [X0 + m, Y1 - m], [X0 + m, Y0 + m]], wp, 4, 0.9);
    // corner towers
    if (wp > 0.9) for (const [x, y] of pegs) { rr(x - 24, y - 24, 48, 48, 6); ctx.strokeStyle = P.gold; ctx.lineWidth = 5; ctx.stroke(); }
    // streets
    const sp = eio(clamp((lt - 1.8) / 1.1));
    ctx.save(); ctx.globalAlpha = 0.7; for (let i = 1; i < 6; i++) { const x = X0 + (X1 - X0) * i / 6, y = Y0 + (Y1 - Y0) * i / 6; ink([[x, Y0 + m], [x, Y1 - m]], sp, 3, 0.65); ink([[X0 + m, y], [X1 - m, y]], sp, 3, 0.65); } ctx.restore();
    // central temple square: nested squares + axes
    const tp = eio(clamp((lt - 2.1) / 1.0));
    if (tp > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, tp * 2); ctx.fillStyle = '#3A2210'; ctx.fillRect(CX - 160, CY - 160, 320, 320); ctx.restore();
      for (const [r, w] of [[170, 7], [130, 4], [92, 4], [52, 4]]) ink([[CX - r, CY - r], [CX + r, CY - r], [CX + r, CY + r], [CX - r, CY + r], [CX - r, CY - r]], tp, w);
      ink([[CX, CY - 210], [CX, CY + 210]], tp, 3); ink([[CX - 210, CY], [CX + 210, CY]], tp, 3);
      ctx.save(); ctx.globalAlpha = tp; circle(CX, CY, 20, P.gold); K.glow(CX, CY, 150, '255,190,70', 0.4 * tp); ctx.restore(); }
    // gates (small gold marks at the middle of each side)
    if (wp > 0.95) for (const [x, y] of [[CX, Y0], [CX, Y1], [X0, CY], [X1, CY]]) { circle(x, y, 13, '#150A05'); circle(x, y, 8, P.gold); }
    // north arrow
    const na = clamp((lt - 2.6) / 0.5); if (na > 0) { ctx.save(); ctx.globalAlpha = na; fillP([[540, 262], [524, 304], [556, 304]], P.gold); K.label('N', 585, 285, 28, P.cream); ctx.restore(); }
    // year plate
    K.plaque('c. 1025 CE', 540, 1500, eob(clamp((lt - 2.7) / 0.5)), 72);
    K.embers(t, 24, 13); K.vignette(0.55);
  } });
  cue(a3, 'whoosh', { gain: 0.7 }); for (let i = 0; i < 4; i++) cue(a3 + 0.15 + i * 0.12, 'chisel', { gain: 0.5, pan: i % 2 ? 0.3 : -0.3 });
  cue(a3 + 1.3, 'sparkle', { gain: 0.6 }); cue(a3 + 2.3, 'rumble', { gain: 0.5, dur: 1.5 }); cue(a3 + 2.7, 'pop', { gain: 0.8 }); cue(a3 + 3.0, 'bell', { gain: 0.7 });
}
