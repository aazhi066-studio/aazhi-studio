// EPISODE 4 · worker A : moonlit lake + 1,700+, map card, gas building up, heavy water slab, overturn
// Cold flat painterly look: ink-black, deep teal, slate blue, one sickly green (the gas), off-white text, fog + grain.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { lg, fillP } from './art.js';

const INK = '#05080C', GREEN = '#7BD88F', WHITE = '#EEF3F0';
const FONT = (s, w = 900) => `${w} ${s}px Inter, sans-serif`;

// ───────────── helpers ─────────────
function txt(s, x, y, size, col = WHITE, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.font = FONT(size, o.w ?? 900); ctx.letterSpacing = `${o.ls ?? 0}px`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.sb ?? 24; }
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); ctx.letterSpacing = '0px';
}
function glow(x, y, r, rgb, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
function fogBand(y, h, rgb, a) { const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.5, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(-300, y - h / 2, W + 600, h); }
function vig(a = 0.7) { const g = ctx.createRadialGradient(540, 960, 380, 540, 960, 1250); g.addColorStop(0, 'rgba(2,5,8,0)'); g.addColorStop(1, `rgba(2,5,8,${a})`); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); }
let GRAIN = null;
function grain(t, a = 0.07) {
  if (!GRAIN) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), im = g.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) { const v = rnd(i) * 255; im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); GRAIN = c;
  }
  const f = Math.floor(t * 12), ox = rnd(f) * 256, oy = rnd(f + 99) * 256;
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
  for (let x = -256 + ox; x < W + 300; x += 256) for (let y = -256 + oy; y < H + 300; y += 256) ctx.drawImage(GRAIN, x, y);
  ctx.restore();
}
const rgbOf = (c) => (c.startsWith('#') ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : /rgb\((\d+),(\d+),(\d+)\)/.exec(c).slice(1, 4).map(Number));
const mixHex = (a, b, k) => { const A = rgbOf(a), B = rgbOf(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
function bubble(x, y, r, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; glow(x, y, r * 3.2, '123,216,143', 0.28);
  circle(x, y, r, 'rgba(123,216,143,0.42)'); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.strokeStyle = GREEN; ctx.lineWidth = Math.max(1.5, r * 0.22); ctx.stroke();
  circle(x - r * 0.3, y - r * 0.32, r * 0.24, 'rgba(238,255,240,0.85)'); ctx.restore();
}
function arrow(x, y, len, w, dir, col, a = 1) {   // tip at (x, y), pointing along dir
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(Math.atan2(dir[1], dir[0]));
  fillP([[0, 0], [-w * 1.1, -w * 0.95], [-w * 1.1, -w * 0.38], [-len, -w * 0.38], [-len, w * 0.38], [-w * 1.1, w * 0.38], [-w * 1.1, w * 0.95]], col); ctx.restore();
}

// ═════════════ A1 : moonlit lake ═════════════
const HZ1 = 1010;
const hillY = (x, base, amp, sd) => base - amp * (0.1 + 0.9 * Math.pow(Math.abs(x - 560) / 560, 1.7)) * (0.62 + 0.24 * Math.sin(x * 0.0045 + sd) + 0.14 * Math.sin(x * 0.012 + sd * 2.3));
const HOUSES = [];
[40, 120, 205, 290, 900, 965, 1040, 150, 850, 1000].forEach((x, i) => {
  const n = 3 + (i % 2); for (let k = 0; k < n; k++) HOUSES.push({ x: x + k * (30 + rnd(i * 5 + k) * 14) - 20, w: 22 + rnd(i * 9 + k) * 16, lit: rnd(i * 13 + k * 3) > 0.28, ph: rnd(i + k) * 6 });
});
function skyLake(t) {
  ctx.fillStyle = lg(0, 0, 0, HZ1, [[0, INK], [0.55, '#09222B'], [1, '#14505A']]); ctx.fillRect(-300, -300, W + 600, HZ1 + 300);
  for (let i = 0; i < 110; i++) { const x = rnd(i) * W, y = Math.pow(rnd(i + 3), 1.3) * 760, tw = 0.55 + 0.45 * Math.sin(t * (0.8 + rnd(i + 5)) + i); ctx.fillStyle = `rgba(230,242,238,${(0.2 + rnd(i + 8) * 0.5) * tw})`; ctx.fillRect(x, y, 1.6, 1.6); }
  glow(270, 330, 560, '120,200,205', 0.2); glow(270, 330, 220, '210,240,235', 0.35);
  circle(270, 330, 84, '#E9F3EE'); circle(244, 306, 14, 'rgba(160,190,190,0.35)'); circle(300, 350, 20, 'rgba(160,190,190,0.28)'); circle(290, 296, 9, 'rgba(160,190,190,0.3)');
  for (const [base, amp, col, sd] of [[HZ1 - 20, 300, '#0B3139', 1.3], [HZ1 - 6, 260, '#071F26', 4.1], [HZ1 + 2, 215, '#04121A', 0.4]]) {
    ctx.beginPath(); ctx.moveTo(-40, HZ1 + 4); for (let x = -40; x <= W + 40; x += 20) ctx.lineTo(x, hillY(x, base, amp, sd)); ctx.lineTo(W + 40, HZ1 + 4); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  for (const h of HOUSES) {
    const y = hillY(h.x, HZ1 + 2, 215, 0.4) + 14, hw = h.w, hh = hw * 0.6;
    ctx.fillStyle = '#02080C'; ctx.fillRect(h.x - hw / 2, y - hh, hw, hh); fillP([[h.x - hw / 2 - 4, y - hh], [h.x, y - hh - hw * 0.45], [h.x + hw / 2 + 4, y - hh]], '#02080C');
    if (h.lit) { const fl = 0.8 + 0.2 * Math.sin(t * 2 + h.ph); glow(h.x, y - hh * 0.5, 38, '230,240,200', 0.22 * fl); ctx.fillStyle = `rgba(236,244,208,${0.95 * fl})`; ctx.fillRect(h.x - 4, y - hh * 0.7, 8, 8); }
  }
}
function lakeScene(lt, d, t) {
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, HZ1 + 300); ctx.clip(); skyLake(t); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(-300, HZ1, W + 600, 1200); ctx.clip(); ctx.translate(0, 2 * HZ1); ctx.scale(1, -1); skyLake(t); ctx.restore();
  ctx.fillStyle = lg(0, HZ1, 0, H, [[0, 'rgba(8,40,48,0.35)'], [0.5, 'rgba(5,16,22,0.62)'], [1, 'rgba(3,8,12,0.88)']]); ctx.fillRect(-300, HZ1, W + 600, H + 300 - HZ1);
  for (let i = 0; i < 26; i++) { const u = i / 26, y = HZ1 + 20 + u * u * 820, w = (40 + u * 90) * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + i * 1.9))); ell(270 + Math.sin(t * 0.5 + i) * 6, y, w, 2 + u * 3, `rgba(220,240,235,${0.34 - u * 0.2})`); }
  for (let r = 1; r <= 14; r++) { const u = r / 14, y = HZ1 + u * u * 880 + 10; ctx.beginPath(); for (let x = -20; x <= W + 20; x += 30) { const yy = y + Math.sin(x * 0.012 + t * 0.5 + r) * (0.8 + u * 2.4); x === -20 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.strokeStyle = `rgba(150,200,205,${0.04 + u * 0.05})`; ctx.lineWidth = 1 + u * 2; ctx.stroke(); }
  fogBand(HZ1 - 10, 150, '120,180,185', 0.2); fogBand(HZ1 + 90, 140, '90,150,160', 0.1); fogBand(1280 + Math.sin(t * 0.2) * 20, 300, '60,110,120', 0.06);
}

// ═════════════ A2 : map card ═════════════
const MAPX = (lon) => 190 + (lon - 8) * 85, MAPY = (lat) => 370 + (13.6 - lat) * 85;
const mp = (pts) => pts.map(([a, b]) => [MAPX(a), MAPY(b)]);
const CAMEROON = mp([[9.0, 4.3], [9.6, 3.95], [9.75, 3.2], [9.9, 2.5], [10.4, 2.2], [13.0, 2.2], [16.1, 2.2], [16.2, 3.0], [15.4, 3.6], [14.6, 4.6], [14.9, 5.8], [15.4, 7.2], [14.5, 8.6], [15.0, 9.9], [15.5, 10.5], [14.6, 11.5], [15.0, 12.6], [14.3, 13.1], [13.7, 12.4], [14.0, 11.2], [13.2, 10.0], [12.6, 8.6], [11.9, 7.4], [11.0, 7.2], [10.2, 7.1], [9.5, 6.9], [9.25, 6.3], [8.9, 5.4], [8.6, 4.7]]);
const LAND = mp([[6.8, 15], [17, 15], [17, 1.0], [10.0, 1.0], [9.4, 2.4], [9.7, 3.3], [9.6, 3.95], [9.0, 4.3], [8.5, 4.5], [6.8, 4.4]]);
const NYOS = [MAPX(10.3), MAPY(6.43)];
function mapCard(lt, d, t) {
  ctx.fillStyle = lg(0, 0, 0, H, [[0, INK], [1, '#071A20']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  const cp = eo(clamp(lt / 0.55));
  ctx.save(); ctx.globalAlpha = cp; ctx.translate(0, (1 - cp) * 140);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; rr(100, 250, 880, 1230, 36); ctx.fillStyle = '#071419'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.save(); rr(100, 250, 880, 1230, 36); ctx.clip();
  ctx.strokeStyle = 'rgba(120,170,180,0.07)'; ctx.lineWidth = 2; for (let x = 100; x < 980; x += 85) { ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x, 1480); ctx.stroke(); } for (let y = 250; y < 1480; y += 85) { ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(980, y); ctx.stroke(); }
  fillP(LAND, '#10313A');
  const hl = eo(clamp((lt - 0.35) / 0.6)); ctx.save(); ctx.globalAlpha *= hl; fillP(CAMEROON, '#1F6670'); ctx.restore();
  ctx.beginPath(); CAMEROON.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.strokeStyle = `rgba(238,243,240,${0.75 * hl})`; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  fogBand(MAPY(3.2), 160, '60,130,140', 0.07);
  txt('NIGERIA', MAPX(9.1), MAPY(8.9), 32, WHITE, { ls: 8, a: 0.4 }); txt('CAMEROON', MAPX(13.0), MAPY(6.0), 36, WHITE, { ls: 8, a: 0.8 * hl });
  ctx.save(); ctx.translate(MAPX(8.5), MAPY(2.9)); ctx.rotate(-0.4); txt('GULF OF GUINEA', 0, 0, 24, WHITE, { ls: 6, a: 0.35 }); ctx.restore();
  const pt = Wd('Nyos', 1) - L(1) + 0.1, pp = clamp((lt - pt) / 0.55), [px, py] = NYOS;
  if (lt > pt - 0.05) {
    if (lt > pt + 0.3) for (let k = 0; k < 3; k++) { const rp = ((lt - pt) * 0.7 + k / 3) % 1; ctx.beginPath(); ctx.arc(px, py, 20 + rp * 110, 0, TAU); ctx.strokeStyle = `rgba(238,243,240,${0.6 * (1 - rp)})`; ctx.lineWidth = 3; ctx.stroke(); }
    circle(px, py, 12, '#4FB6C0');
    ctx.save(); ctx.translate(px, py + (1 - eob(pp)) * -300); ctx.globalAlpha *= clamp(pp * 4);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(0, -4); ctx.bezierCurveTo(-46, -62, -40, -116, 0, -116); ctx.bezierCurveTo(40, -116, 46, -62, 0, -4); ctx.fillStyle = WHITE; ctx.fill(); ctx.shadowColor = 'transparent'; circle(0, -78, 15, INK); ctx.restore();
    const lp = eob(clamp((lt - pt - 0.25) / 0.45));
    if (lp > 0) { ctx.save(); ctx.translate(px + 40, py - 190); ctx.scale(lp, lp); ctx.globalAlpha *= clamp(lp * 2); line([[0, 92], [-30, 150]], WHITE, 4); rr(0, 0, 440, 92, 18); ctx.fillStyle = WHITE; ctx.fill(); txt('LAKE NYOS', 220, 47, 58, INK, { ls: 3 }); ctx.restore(); }
  }
  const yp = eob(clamp((lt - (Wd('nineteen', 1) - L(1) + 0.1)) / 0.5));
  if (yp > 0) { ctx.save(); ctx.translate(640, 1200); ctx.scale(yp, yp); ctx.globalAlpha *= clamp(yp * 2); rr(-190, -92, 380, 184, 26); ctx.fillStyle = 'rgba(5,8,12,0.78)'; ctx.fill(); ctx.strokeStyle = WHITE; ctx.lineWidth = 4; ctx.stroke(); txt('1986', 0, 4, 140, WHITE, { ls: 2 }); ctx.restore(); }
  ctx.restore();
  txt('NORTHWEST CAMEROON', 540, 310, 30, WHITE, { ls: 9, a: 0.7 }); txt('STYLISED MAP, NOT TO SCALE', 540, 1440, 22, WHITE, { ls: 6, a: 0.35 });
  ctx.restore();
  fogBand(1500, 300, '30,80,90', 0.12);
}

// ═════════════ A3 : gas building up in the lake (cross-section) ═════════════
const BASIN = () => { ctx.beginPath(); ctx.moveTo(70, 470); ctx.bezierCurveTo(70, 900, 150, 1300, 320, 1330); ctx.lineTo(760, 1330); ctx.bezierCurveTo(930, 1300, 1010, 900, 1010, 470); ctx.closePath(); };
const LAYER_Y = 930;
function waterColumn(t, gas) {
  ctx.save(); BASIN(); ctx.clip();
  ctx.fillStyle = lg(0, 470, 0, 1330, [[0, '#2A7C84'], [0.3, '#1B5C66'], [0.55, '#154356'], [0.62, '#0E2E4D'], [1, '#07182B']]); ctx.fillRect(60, 460, 960, 880);
  for (let i = 0; i < 4; i++) { const x = 200 + i * 230 + Math.sin(t * 0.3 + i) * 30; fillP([[x - 18, 470], [x + 18, 470], [x + 120, LAYER_Y], [x + 40, LAYER_Y]], 'rgba(200,240,235,0.05)'); }
  fillP([[60, LAYER_Y], [1020, LAYER_Y], [1020, 1340], [60, 1340]], `rgba(123,216,143,${gas * 0.18})`);
  ctx.beginPath(); for (let x = 60; x <= 1020; x += 20) { const y = LAYER_Y + Math.sin(x * 0.02 + t * 0.8) * 3; x === 60 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = 'rgba(238,243,240,0.5)'; ctx.setLineDash([22, 14]); ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}
function crossSection(lt, d, t) {
  ctx.fillStyle = lg(0, 0, 0, H, [[0, INK], [0.5, '#08202A'], [1, INK]]); ctx.fillRect(-300, -300, W + 600, H + 600);
  const gas = eio(clamp(lt / (d - 0.4)));
  glow(820, 300, 300, '120,190,200', 0.12);
  ctx.fillStyle = '#10191F'; rr(40, 440, 1000, 980, 30); ctx.fill();
  for (let i = 0; i < 160; i++) { const x = 50 + rnd(i) * 980, y = 450 + rnd(i + 7) * 960; ctx.fillStyle = `rgba(60,85,95,${0.08 + rnd(i + 3) * 0.1})`; ctx.fillRect(x, y, 6 + rnd(i + 1) * 16, 3); }
  waterColumn(t, gas);
  const vents = [360, 450, 540, 630, 720];
  for (const vx of vents) fillP([[vx - 26, 1330], [vx, 1306], [vx + 26, 1330]], '#0A1115');
  const n = Math.round(10 + 44 * gas);
  ctx.save(); BASIN(); ctx.clip();
  for (let i = 0; i < n; i++) {
    const vx = vents[i % 5] + (rnd(i) - 0.5) * 30, sp = 0.09 + rnd(i + 5) * 0.08, ph = (t * sp + rnd(i + 9)) % 1, top = LAYER_Y + 50 + rnd(i + 2) * 40;
    bubble(vx + Math.sin(t * 1.6 + i) * 10, 1310 - ph * (1310 - top), 5 + rnd(i + 4) * 7, clamp(ph * 8) * (1 - seg(ph, 0.85, 1)));
  }
  const m = Math.round(110 * gas);
  for (let i = 0; i < m; i++) { const x = 130 + rnd(i * 3) * 820, y = LAYER_Y + 40 + rnd(i * 5 + 1) * 270 + Math.sin(t * 0.7 + i) * 8, r = 1.8 + rnd(i + 6) * 3.2; circle(x, y, r, `rgba(123,216,143,${0.5 + 0.4 * Math.sin(t * 1.2 + i)})`); }
  ctx.restore();
  BASIN(); ctx.strokeStyle = 'rgba(238,243,240,0.3)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); for (let x = 70; x <= 1010; x += 16) { const y = 470 + Math.sin(x * 0.03 + t) * 2.4; x === 70 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.strokeStyle = 'rgba(238,243,240,0.9)'; ctx.lineWidth = 5; ctx.stroke();
  fogBand(470, 120, '140,200,205', 0.1);
  txt('SURFACE WATER', 110, 560, 30, WHITE, { ls: 5, a: 0.65, align: 'left' }); txt('DEEP WATER', 110, 1000, 30, WHITE, { ls: 5, a: 0.75, align: 'left' });
  circle(118, 292, 11, GREEN); txt('CARBON DIOXIDE', 146, 292, 30, WHITE, { ls: 5, a: 0.85, align: 'left' });
  const lb = eob(clamp((lt - 0.3) / 0.5));
  ctx.save(); ctx.globalAlpha *= clamp(lb); txt('DECADES - CENTURIES', 540, 1456, 64, WHITE, { ls: 2 });
  const x0 = 120, x1 = 960, by = 1522; line([[x0, by], [x1, by]], 'rgba(238,243,240,0.3)', 6); line([[x0, by], [lerp(x0, x1, gas), by]], GREEN, 8);
  for (let i = 0; i <= 12; i++) line([[lerp(x0, x1, i / 12), by - (i % 4 === 0 ? 20 : 11)], [lerp(x0, x1, i / 12), by + (i % 4 === 0 ? 20 : 11)]], 'rgba(238,243,240,0.55)', 3);
  circle(lerp(x0, x1, gas), by, 15, GREEN); ctx.restore();
  vig(0.55);
}

// ═════════════ A4 : heavy bottom water pressing the gas in ═════════════
function heavySlab(lt, d, t) {
  ctx.fillStyle = lg(0, 0, 0, H, [[0, INK], [0.45, '#0A2A33'], [1, '#04090D']]); ctx.fillRect(-300, -300, W + 600, H + 600);
  glow(540, 760, 700, '30,100,115', 0.18);
  const ap = eo(clamp(lt / 0.5));
  ctx.save(); ctx.translate(0, (1 - ap) * -40); ctx.globalAlpha *= ap;
  txt('HEAVY WATER', 540, 190, 126, WHITE, { ls: 1 });
  txt('KEEPS', 330, 322, 126, WHITE, { ls: 1 }); txt('IT IN', 760, 322, 126, GREEN, { ls: 1, shadow: 'rgba(123,216,143,0.5)', sb: 30 });
  ctx.restore();
  const JX = 130, JW = 820, TOP = 940, BOT = 1480, LID = 44;
  rr(JX, 520, JW, TOP - 520, 10); ctx.fillStyle = 'rgba(40,125,135,0.22)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(JX, 520); ctx.lineTo(JX + JW, 520); ctx.strokeStyle = 'rgba(238,243,240,0.55)'; ctx.setLineDash([20, 14]); ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
  txt('WEIGHT OF WATER', 540, 580, 30, WHITE, { ls: 8, a: 0.7 });
  const press = 0.5 + 0.5 * Math.sin(t * 2.2), sink = press * 7;
  for (const ax of [270, 540, 810]) for (let k = 0; k < 2; k++) { const ph = (t * 0.6 + k * 0.5 + ax * 0.001) % 1; arrow(ax, 760 + ph * 220, 120, 44, [0, 1], WHITE, 0.85 * Math.sin(ph * Math.PI) * ap); }
  ctx.save(); ctx.translate(0, sink);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; rr(JX, TOP, JW, BOT - TOP, 34); ctx.fillStyle = lg(0, TOP, 0, BOT, [[0, '#14407A'], [0.4, '#0C2A55'], [1, '#07172F']]); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.save(); rr(JX, TOP, JW, BOT - TOP, 34); ctx.clip();
  for (let i = 0; i < 9; i++) { const y = TOP + 90 + i * 60; ctx.beginPath(); for (let x = JX; x <= JX + JW; x += 24) { const yy = y + Math.sin(x * 0.012 + t * 0.6 + i) * 5; x === JX ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.strokeStyle = 'rgba(120,170,230,0.07)'; ctx.lineWidth = 3; ctx.stroke(); }
  fillP([[JX, TOP + LID], [JX + JW, TOP + LID], [JX + JW, BOT], [JX, BOT]], `rgba(123,216,143,${0.05 + 0.04 * press})`);
  for (let i = 0; i < 34; i++) {
    const r = 12 + rnd(i + 3) * 20, x0 = JX + 70 + rnd(i) * (JW - 140), sp = 0.7 + rnd(i + 5), ph = rnd(i + 8) * TAU, f = 0.3 + 0.7 * rnd(i + 11);
    const lo = TOP + LID + r + 16, hi = BOT - r - 16, k = 0.5 + 0.5 * Math.sin(t * sp + ph);
    bubble(x0 + Math.sin(t * 1.3 + ph) * 14, lo + (hi - lo) * k * f, r, ap);
  }
  ctx.restore();
  rr(JX - 24, TOP - 6, JW + 48, LID + 6, 14); ctx.fillStyle = lg(0, TOP, 0, TOP + LID, [[0, '#5D7A90'], [1, '#2B4256']]); ctx.fill();
  ctx.restore();
  for (const [y, k] of [[1100, 0], [1300, 0.5]]) { const off = ((t * 0.8 + k) % 1) * 36; arrow(JX - 14 + off * 0.6, y, 90, 34, [1, 0], WHITE, 0.8 * ap); arrow(JX + JW + 14 - off * 0.6, y, 90, 34, [-1, 0], WHITE, 0.8 * ap); }
  txt('PRESSURE', 540, 1524, 34, WHITE, { ls: 12, a: 0.75 * ap });
  fogBand(1500, 240, '30,90,100', 0.12);
  vig(0.6);
}

// ═════════════ A5 : the layers tilt and overturn ═════════════
const LC = (y) => { const k = clamp((y - 700) / 800); return k < 0.35 ? mixHex('#2A7C84', '#154356', k / 0.35) : mixHex('#154356', '#07182B', clamp((k - 0.35) / 0.4)); };
function overturn(lt, d, t) {
  ctx.fillStyle = lg(0, 0, 0, H, [[0, INK], [0.6, '#0A2229'], [1, INK]]); ctx.fillRect(-300, -300, W + 600, H + 600);
  const tw = seg(lt, 0, 1.2), shake = tw * (1 - 0.3 * seg(lt, 3, d));
  const tilt = 0.17 * eio(seg(lt, 0.4, 2.0)) * Math.cos(seg(lt, 2.0, d) * 0.6);
  const sw = 5.6 * eio(seg(lt, 1.3, d - 0.2)), mix = eio(seg(lt, 1.4, d - 0.3));
  txt('SOMETHING', 540, 175, 118, WHITE, { ls: 1 }); txt('DISTURBED', 540, 295, 118, WHITE, { ls: 1 }); txt('THE LAKE', 540, 415, 118, GREEN, { ls: 1, shadow: 'rgba(123,216,143,0.45)', sb: 30 });
  ctx.save(); ctx.translate(Math.sin(t * 61) * 5 * shake, Math.sin(t * 47 + 1) * 4 * shake);
  const SY = 610; ell(540, SY, 470, 70, '#1B5C66'); ell(540, SY, 470, 70, 'rgba(238,243,240,0.12)');
  for (let k = 0; k < 6; k++) { const rp = ((t * 0.9 + k / 6) % 1) * (0.2 + 0.8 * tw), a = (1 - rp) * 0.7 * tw; if (a > 0.01) { ctx.beginPath(); ctx.ellipse(540, SY, 30 + rp * 440, 6 + rp * 64, 0, 0, TAU); ctx.strokeStyle = `rgba(238,243,240,${a})`; ctx.lineWidth = 4; ctx.stroke(); } }
  const FX0 = 90, FX1 = 990, FY0 = SY + 10, FY1 = 1500;
  ctx.save(); ctx.beginPath(); ctx.moveTo(FX0, FY0 - 4); ctx.lineTo(FX1, FY0 - 4); ctx.lineTo(FX1, FY1 - 40); ctx.quadraticCurveTo(FX1, FY1, FX1 - 40, FY1); ctx.lineTo(FX0 + 40, FY1); ctx.quadraticCurveTo(FX0, FY1, FX0, FY1 - 40); ctx.closePath(); ctx.clip();
  ctx.fillStyle = '#07182B'; ctx.fillRect(0, 0, W, H);
  const cx = 540, cy = 1130, R = 560, ca = Math.cos(tilt), sa = Math.sin(tilt);
  const warp = (x, y) => {
    let dx = x - cx, dy = y - cy; const r = Math.hypot(dx, dy), k = r < R ? Math.pow(1 - r / R, 1.6) : 0, a = sw * k, c = Math.cos(a), s = Math.sin(a);
    const rx = dx * c - dy * s, ry = dx * s + dy * c; dx = rx; dy = ry;
    return [cx + dx * ca - dy * sa, cy + dx * sa + dy * ca];
  };
  const N = 66, y0 = 480, sh = 1500 / N, xs = []; for (let x = -240; x <= 1320; x += 30) xs.push(x);
  const rows = []; for (let i = 0; i <= N; i++) rows.push(xs.map((x) => warp(x, y0 + i * sh)));
  for (let i = 0; i < N; i++) {
    const ym = y0 + (i + 0.5) * sh, deepK = clamp((ym - 1060) / 400); let col = LC(ym);
    if (deepK > 0) { const m = rgbOf(col), g = mix * (0.55 + 0.4 * deepK) * (0.5 + 0.5 * Math.sin(i * 0.9 + t * 0.6)) * 0.55; col = `rgb(${Math.round(m[0] + (123 - m[0]) * g)},${Math.round(m[1] + (216 - m[1]) * g)},${Math.round(m[2] + (143 - m[2]) * g)})`; }
    ctx.beginPath(); rows[i].forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); for (let j = xs.length - 1; j >= 0; j--) ctx.lineTo(rows[i + 1][j][0], rows[i + 1][j][1]); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke();
  }
  ctx.beginPath(); xs.forEach((x, j) => { const p = warp(x, 1060 + Math.sin(x * 0.02) * 3); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.strokeStyle = 'rgba(238,243,240,0.55)'; ctx.lineWidth = 4; ctx.setLineDash([22, 14]); ctx.stroke(); ctx.setLineDash([]);
  for (let i = 0; i < 60; i++) { const x = 130 + rnd(i * 3) * 820, y = 1090 + rnd(i * 5 + 1) * 370, p = warp(x, y); bubble(p[0], p[1] - mix * rnd(i + 2) * 120, 4 + rnd(i + 6) * 7, 0.85); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(FX0, FY0); ctx.lineTo(FX0, FY1 - 40); ctx.quadraticCurveTo(FX0, FY1, FX0 + 40, FY1); ctx.lineTo(FX1 - 40, FY1); ctx.quadraticCurveTo(FX1, FY1, FX1, FY1 - 40); ctx.lineTo(FX1, FY0); ctx.strokeStyle = 'rgba(238,243,240,0.4)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
  txt('THE LAYERS OVERTURN', 540, 1537, 36, WHITE, { ls: 8, a: 0.8 * eo(seg(lt, 2.3, 2.9)) });
  fogBand(1000, 260, '40,100,110', 0.06);
  vig(0.6);
}

export function buildA(add, cue) {
  const a1 = 0, a2 = L(1) - 0.1, a3 = L(2) - 0.1, a4 = L(3) - 0.1, a5 = L(4) - 0.1;
  const sk = Wd('killed', 0);

  add({ id: 'A1', at: a1, cam: [540, 1000], zoom: 0.07, note: 'moonlit mirror lake, hill villages with lit windows, 1,700+ fades in', draw(lt, d, t) {
    lakeScene(lt, d, t);
    const sp = eo(seg(t, sk - 0.35, sk + 1.5));
    if (sp > 0) {
      glow(540, 640, 620, '2,5,8', 0.55 * sp);
      txt('1,700+', 540, 640, 280, WHITE, { a: sp, ls: -4, shadow: 'rgba(0,0,0,0.6)', sb: 40 });
      txt('PEOPLE, IN ONE NIGHT', 540, 835, 46, WHITE, { a: sp * seg(t, sk + 0.5, sk + 1.8), ls: 10 });
    }
    vig(0.65); grain(t, 0.08);
  } });
  cue(0.05, 'swell', { gain: 0.7 }); cue(1.2, 'rumble', { gain: 0.25, dur: 3.5 }); cue(sk, 'thud', { gain: 0.5 }); cue(sk + 0.3, 'swell', { gain: 0.5 });

  add({ id: 'A2', at: a2, cam: [540, 900], zoom: 0.09, note: 'modern map card of Cameroon, pin drops on Lake Nyos, 1986 tag', draw(lt, d, t) {
    mapCard(lt, d, t); vig(0.5); grain(t, 0.07);
  } });
  cue(a2 + 0.05, 'whoosh', { gain: 0.6 }); cue(Wd('Nyos', 1) + 0.05, 'pop', { gain: 0.8 }); cue(Wd('nineteen', 1) + 0.1, 'thud', { gain: 0.5 });

  add({ id: 'A3', at: a3, cam: [540, 960], zoom: 0.06, note: 'side cross-section of lake, green CO2 bubbles seep from rock into deep layer, DECADES - CENTURIES scale', draw(lt, d, t) {
    crossSection(lt, d, t); grain(t, 0.07);
  } });
  cue(a3 + 0.1, 'whoosh', { gain: 0.5 }); cue(a3 + 0.8, 'bubbles', { gain: 0.55 }); cue(a3 + 3.2, 'bubbles', { gain: 0.5 }); cue(Wd('decades', 2) + 0.05, 'swell', { gain: 0.5 });

  add({ id: 'A4', at: a4, cam: [540, 1120], zoom: 0.1, note: 'heavy dark-blue water slab pressing down, gas trapped like in a closed jar, arrows, HEAVY WATER KEEPS IT IN', draw(lt, d, t) {
    heavySlab(lt, d, t); grain(t, 0.07);
  } });
  cue(a4 + 0.05, 'thud', { gain: 0.7 }); cue(a4 + 0.9, 'rumble', { gain: 0.35, dur: 3 }); cue(a4 + 2.4, 'thud', { gain: 0.5 });

  add({ id: 'A5', at: a5, cam: [540, 1050], zoom: 0.07, note: 'tremor on the surface, layers tilt and swirl into overturn, SOMETHING DISTURBED THE LAKE', draw(lt, d, t) {
    overturn(lt, d, t); grain(t, 0.07);
  } });
  cue(a5 + 0.05, 'rumble', { gain: 0.6, dur: 4.5 }); cue(a5 + 0.2, 'thud', { gain: 0.6 }); cue(a5 + 1.6, 'whoosh', { gain: 0.6 }); cue(a5 + 2.4, 'bubbles', { gain: 0.5 }); cue(a5 + 3.4, 'swell', { gain: 0.6 });
}
