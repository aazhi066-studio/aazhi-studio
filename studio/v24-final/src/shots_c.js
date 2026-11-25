// v24 worker C: script lines 8-11 (Manucci's version, the disputed death, the Marathas, the question + windows end).
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, circle, ell, rr, line } from './core/lib.js';
import { T, L, Le, Wd } from './core/timing.js';
import { cached, blit, rgba, mixc, lg, stars } from './art.js';
import * as G from './glass.js';
const P = G.PAL;

// ---------- local helpers ----------
const R0 = { x: 60, y: 110, w: 960, h: 1330 };
function pop(text, x, y, lt, t0, o = {}) {
  if (lt < t0) return; const k = clamp((lt - t0) / 0.3);
  G.tag(text, x, y, { ...o, sc: (o.sc ?? 1) * eob(k) });
}
function slam(text, x, y, lt, t0, o = {}) {
  if (lt < t0) return; const k = eo(clamp((lt - t0) / 0.2)), sh = (1 - clamp((lt - t0) / 0.35)) * 10;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  G.tag(text, x + Math.sin(lt * 90) * sh, y + Math.cos(lt * 77) * sh, { ...o, sc: (o.sc ?? 1) * lerp(2.4, 1, k) });
  ctx.restore();
}
// gilt question mark (Caladea) with ink outline
function qmark(x, y, size, rot = 0, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `700 ${size}px Caladea`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = P.ink; ctx.strokeText('?', 0, 0);
  ctx.fillStyle = lg(0, -size / 2, 0, size / 2, [[0, P.giltHi], [0.5, P.gilt], [1, P.giltDk]]); ctx.fillText('?', 0, 0);
  ctx.restore();
}
// palace window geometry (mirrors G.palace) for per-window overlays
const WINS = (() => { const a = [];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) a.push([-300 + i * 100, -40 - r * 150, 54, 100]);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) a.push([-50 + i * 100, -360 - r * 110, 48, 80]);
  return a; })();
function winPath(wx, wy, ww, wh) {
  ctx.beginPath(); ctx.moveTo(wx - ww / 2, wy); ctx.lineTo(wx - ww / 2, wy - wh * 0.6); ctx.quadraticCurveTo(wx - ww / 2, wy - wh, wx, wy - wh);
  ctx.quadraticCurveTo(wx + ww / 2, wy - wh, wx + ww / 2, wy - wh * 0.6); ctx.lineTo(wx + ww / 2, wy); ctx.closePath();
}
// colOf(k) -> { col, g (glow 0..1, glow colour gc) } or null to leave the window as drawn
function windows(x, y, s, colOf) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const st = WINS.map((w, k) => colOf(k));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  WINS.forEach(([wx, wy, ww, wh], k) => { const c = st[k]; if (!c || !(c.g > 0)) return; const cy = wy - wh / 2, rad = ww * 1.9;
    const g = ctx.createRadialGradient(wx, cy, 0, wx, cy, rad); g.addColorStop(0, rgba(c.gc || P.gilt, 0.45 * c.g)); g.addColorStop(1, rgba(c.gc || P.gilt, 0));
    ctx.fillStyle = g; ctx.fillRect(wx - rad, cy - rad, rad * 2, rad * 2); });
  ctx.restore();
  WINS.forEach(([wx, wy, ww, wh], k) => { const c = st[k]; if (!c) return; winPath(wx, wy, ww, wh); ctx.fillStyle = c.col; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.stroke(); });
  ctx.restore();
}
const fireCol = (t, k) => mixc(P.fireHi, P.vermil, 0.5 + 0.5 * Math.sin(t * 13 + k * 2.1));
const goldCol = (t, k) => mixc(P.gilt, P.giltHi, 0.5 + 0.5 * Math.sin(t * 3 + k * 1.3));
// night sky + moon + ground strip
function night(r, t, gy = 1300, o = {}) {
  stars(t, 50, 0.9, gy - 200, o.seed || 4);
  const mx = o.mx ?? 840, my = o.my ?? 300;
  const g = ctx.createRadialGradient(mx, my, 10, mx, my, 170); g.addColorStop(0, rgba(P.giltHi, 0.35)); g.addColorStop(1, rgba(P.giltHi, 0)); ctx.fillStyle = g; ctx.fillRect(mx - 170, my - 170, 340, 340);
  circle(mx, my, 56, P.cream); ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.stroke(); circle(mx + 22, my - 12, 46, o.sky || '#17205A');
  ctx.fillStyle = o.land || '#14311F'; ctx.fillRect(r.x, gy, r.w, r.y + r.h - gy); line([[r.x, gy], [r.x + r.w, gy]], P.ink, 6);
}
function crown(x, y, s = 1, rot = 0, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  G.paint(() => { ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-80, -90); ctx.lineTo(-40, -50); ctx.lineTo(0, -120); ctx.lineTo(40, -50); ctx.lineTo(80, -90); ctx.lineTo(70, 0); ctx.closePath(); }, P.gilt, 1, { lw: 7 });
  ctx.fillStyle = P.giltDk; ctx.fillRect(-70, -22, 140, 14);
  circle(0, -60, 11, P.vermil); circle(-42, -30, 8, P.greenHi); circle(42, -30, 8, P.greenHi);
  for (const [px, py] of [[-80, -90], [0, -120], [80, -90]]) circle(px, py, 9, P.giltHi);
  ctx.restore();
}
function spear(x0, y0, x1, y1) {
  line([[x0, y0], [x1, y1]], P.ink, 12); line([[x0, y0], [x1, y1]], '#7A4A22', 6);
  const a = Math.atan2(y1 - y0, x1 - x0); ctx.save(); ctx.translate(x1, y1); ctx.rotate(a);
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(50, 0); ctx.lineTo(0, 14); ctx.closePath(); ctx.fillStyle = '#C9C2B0'; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
}
// a hand-held torch (pole + small flame)
function torch(x, y, len, ang, t, seed, s = 0.22) {
  const tx = x + Math.sin(ang) * len, ty = y - Math.cos(ang) * len;
  line([[x, y], [tx, ty]], P.ink, 14); line([[x, y], [tx, ty]], '#6A3A1A', 8);
  G.fire(tx, ty + 6, s, t, seed);
}
// teak divider for the split panels (inside the clip)
function divider(r, t, x = 540, w = 26) {
  ctx.fillStyle = lg(x - w / 2, 0, x + w / 2, 0, [[0, P.teakDk], [0.5, P.teakHi], [1, P.teakDk]]); ctx.fillRect(x - w / 2, r.y, w, r.h);
  ctx.strokeStyle = P.gilt; ctx.lineWidth = 4; line([[x - w / 2, r.y], [x - w / 2, r.y + r.h]], P.gilt, 4); line([[x + w / 2, r.y], [x + w / 2, r.y + r.h]], P.gilt, 4);
}
function half(side, r, fn) { ctx.save(); ctx.beginPath(); if (side < 0) ctx.rect(r.x, r.y, 540 - r.x, r.h); else ctx.rect(540, r.y, r.x + r.w - 540, r.h); ctx.clip(); fn(); ctx.restore(); }
function dim(side, r, a) { if (a <= 0) return; ctx.fillStyle = `rgba(5,4,12,${a})`; if (side < 0) ctx.fillRect(r.x, r.y, 540 - r.x, r.h); else ctx.fillRect(540, r.y, r.x + r.w - 540, r.h); }
// a jagged hairline crack across the glass, growing left->right with p
function lineCrack(x0, x1, y, p, seed, amp = 40) {
  if (p <= 0) return; const n = 16, pts = [];
  for (let i = 0; i <= n * p; i++) { const u = i / n; pts.push([lerp(x0, x1, u), y + (i ? (rnd(i * 7 + seed) - 0.5) * amp * 2 : 0)]); }
  if (pts.length < 2) return; line(pts, 'rgba(0,0,0,0.55)', 7); line(pts, 'rgba(255,255,255,0.9)', 3);
  pts.forEach((pt, i) => { if (i % 3 === 1) { const a = (rnd(i + seed) - 0.5) * 2 + (i % 2 ? 1.2 : -1.2); line([pt, [pt[0] + Math.cos(a) * 60, pt[1] + Math.sin(a) * 60]], 'rgba(255,255,255,0.7)', 2); } });
}
// traveller hat + satchel over a G.person at (x, y, s)
function travellerExtras(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ell(0, -258, 62, 13, P.ink); ell(0, -258, 56, 9, '#5A3A1E');
  rr(-30, -305, 60, 48, 10); ctx.fillStyle = '#5A3A1E'; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = P.gilt; ctx.fillRect(-30, -270, 60, 8);
  line([[-34, -176], [44, -78]], P.ink, 12); line([[-34, -176], [44, -78]], '#8A5A2A', 6);
  rr(18, -96, 66, 56, 10); ctx.fillStyle = '#8A5A2A'; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#6A4020'; ctx.fillRect(18, -96, 66, 18); circle(51, -76, 6, P.gilt);
  ctx.restore();
}
// two-line gilt foil label (G.title per line), a = brightness
function label2(lines, x, y, size, p, a, t) {
  if (p <= 0) return; ctx.save(); ctx.globalAlpha *= 0.35 + 0.65 * a;
  lines.forEach((ln, i) => G.title(ln, x, y + i * size * 1.05 + Math.sin(t * 2 + i) * 3, size, p));
  ctx.restore();
}
function rewindIcon(x, y, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a;
  for (const dx of [0, 46]) { ctx.beginPath(); ctx.moveTo(x + dx, y - 30); ctx.lineTo(x + dx - 46, y); ctx.lineTo(x + dx, y + 30); ctx.closePath(); ctx.fillStyle = P.gilt; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.stroke(); }
  ctx.restore();
}

// ---------- the folk-art map of Tamil country (cached) ----------
const TJ = [712, 640], MD = [520, 930];
function mapImg() {
  return cached('c_map', W, H, 0.75, () => {
    const r = R0;
    ctx.fillStyle = lg(0, r.y, 0, r.y + r.h, [[0, P.ultra], [1, '#142a6a']]); ctx.fillRect(r.x, r.y, r.w, r.h);
    // sea waves
    ctx.strokeStyle = rgba(P.cream, 0.45); ctx.lineWidth = 4;
    for (let i = 0; i < 60; i++) { const x = r.x + rnd(i * 3 + 1) * r.w, y = r.y + rnd(i * 5 + 2) * r.h; ctx.beginPath(); ctx.arc(x, y, 16, Math.PI * 1.1, Math.PI * 1.9); ctx.arc(x + 30, y, 16, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    // land (south of the peninsula; east coast on the right)
    const land = () => { ctx.beginPath(); ctx.moveTo(r.x - 20, r.y - 20); ctx.lineTo(900, r.y - 20);
      ctx.bezierCurveTo(880, 300, 820, 460, 800, 560); ctx.bezierCurveTo(840, 640, 860, 700, 800, 720);
      ctx.bezierCurveTo(720, 760, 700, 900, 660, 1050); ctx.bezierCurveTo(620, 1200, 560, 1330, 470, 1400);
      ctx.bezierCurveTo(400, 1330, 300, 1200, 230, 1060); ctx.bezierCurveTo(170, 900, 110, 700, r.x - 20, 600); ctx.closePath(); };
    land(); ctx.fillStyle = '#E2C285'; ctx.fill();
    ctx.save(); land(); ctx.clip();
    for (let i = 0; i < 18; i++) { const x = 120 + rnd(i * 11) * 680, y = 200 + rnd(i * 13 + 3) * 1000; ell(x, y, 60 + rnd(i) * 50, 28 + rnd(i + 2) * 20, rgba(i % 2 ? '#B9A060' : '#9DAA5A', 0.55), rnd(i + 4)); }
    // hills
    for (let i = 0; i < 7; i++) { const x = 140 + i * 44 + (i % 2) * 16, y = 820 + (i % 3) * 50; ctx.beginPath(); ctx.moveTo(x - 34, y); ctx.lineTo(x, y - 54); ctx.lineTo(x + 34, y); ctx.closePath(); ctx.fillStyle = '#8E6A3A'; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke(); }
    ctx.restore();
    land(); ctx.strokeStyle = P.ink; ctx.lineWidth = 8; ctx.stroke();
    // the Kaveri
    ctx.beginPath(); ctx.moveTo(r.x, 520); ctx.bezierCurveTo(260, 480, 380, 600, 520, 570); ctx.bezierCurveTo(640, 545, 700, 600, 820, 640);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = P.ultraHi; ctx.lineWidth = 8; ctx.stroke();
    // gilt inner border
    ctx.strokeStyle = P.gilt; ctx.lineWidth = 8; ctx.strokeRect(r.x + 22, r.y + 22, r.w - 44, r.h - 44);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.strokeRect(r.x + 32, r.y + 32, r.w - 64, r.h - 64);
  });
}
function mapScene(r, t) {
  ctx.drawImage(mapImg(), 0, 0, W, H);
  // shimmer on the river
  const k = (t * 0.4) % 1; circle(lerp(140, 800, k), lerp(510, 630, k) - Math.sin(k * 6) * 10, 6, rgba(P.cream, 0.8));
  for (const [x, y, c] of [[...TJ, P.green], [...MD, P.vermil]]) {
    const pu = 0.5 + 0.5 * Math.sin(t * 4 + x); circle(x, y, 30 + 10 * pu, rgba(c, 0.35)); circle(x, y, 20, c); ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.stroke(); circle(x, y, 7, P.giltHi);
  }
}
function fallenBanner(x, y, s, col, t, fall, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(eio(clamp(fall)) * 1.45 * (col === P.green ? -1 : 1)); G.banner(0, 0, s, col, t); ctx.restore();
}

export function buildC(add, cue) {
  const t8 = L(8), tells = Wd('tells', 8), he = Wd('he', 8), palW = Wd('palace', 8), fire8 = Wd('fire', 8), mann = Wd('manucci', 8);
  const t9 = L(9), disp = Wd('disputed', 9), killed = Wd('killed', 9), capt = Wd('captured', 9), behead = Wd('beheaded', 9);
  const t10 = L(10), three = Wd('three', 10), mar = Wd('marathas', 10), took = Wd('took', 10), thj = Wd('thanjavur', 10), from10 = Wd('from', 10), both = Wd('both', 10);
  const t11 = L(11), fath = Wd("father's", 11), enemy = Wd("enemy's", 11), tell = Wd('tell', 11), below = Wd('below', 11), watch = Wd('watch', 11), wins = Wd('windows', 11);
  const END = T.dur;

  // ===== c8a: REWIND - shards fly back together into the intact palace =====
  const frontScene = (t) => {
    const r = R0; ctx.fillStyle = lg(0, r.y, 0, r.y + r.h, [[0, '#17205A'], [1, P.night]]); ctx.fillRect(r.x, r.y, r.w, r.h);
    night(r, t, 1290); G.palace(540, 1290, 0.95, { lit: 1, dark: 0.25, t });
  };
  add({ id: 'c8a', at: t8, cam: [540, 860], zoom: 0.05, note: 'REWIND: green blast shrinks, shards fly back up into the intact palace; ANOTHER VERSION', draw(lt, d, t) {
    const q = eo(seg(lt, 0, 0.85)), p = 0.86 * (1 - q);
    const r = G.panel(t, { ground: ['#0E2A18', P.night], rot: -0.03 * (1 - q) });
    if (p > 0.002) {
      G.shatter(() => {
        const g = ctx.createRadialGradient(540, 900, 20, 540, 900, 700); g.addColorStop(0, rgba(P.greenHi, 0.7 * (1 - q))); g.addColorStop(1, rgba(P.green, 0)); ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
        G.burst(540, 900, 520, 0.15 + 0.6 * (1 - q), P.greenHi); G.puffs(540, 1300, t, 6, 0.6, 3);
      }, () => frontScene(0), r, p, { key: 'c8a_front', cx: 540, cy: 900, seed: 5 });
    } else frontScene(t);
    // rewind scan bands
    if (q < 1) for (let i = 0; i < 4; i++) { const y = r.y + ((lt * 2400 + i * 340) % r.h); ctx.fillStyle = `rgba(255,255,255,${0.06 * (1 - q)})`; ctx.fillRect(r.x, y, r.w, 24); }
    G.glassTop(t, r);
    rewindIcon(180, 220, (1 - seg(lt, 0.8, 1.0)) * (0.6 + 0.4 * Math.sin(lt * 20)));
    pop('ANOTHER VERSION', 540, 230, lt, 0.7, { size: 44 });
  } });
  cue(t8, 'zip', { gain: 0.8, dur: 0.8 }); cue(t8 + 0.82, 'chisel', { gain: 0.6 }); cue(t8 + 0.7, 'pop', { gain: 0.6 });

  // ===== c8b: the traveller with an open book; MANUCCI =====
  add({ id: 'c8b', at: tells, cam: [540, 900], zoom: 0.07, note: 'faceless traveller (ochre robe, hat, satchel) walks; open book rows appear; MANUCCI', draw(lt, d, t) {
    const r = G.panel(t, { ground: ['#2A3A7A', '#121838'] });
    night(r, t, 1260, { mx: 220, my: 330, land: '#5A3A1E', sky: '#25346F' });
    // distant palace on the horizon
    G.palace(880, 1262, 0.28, { lit: 1, dark: 0.3, t });
    // road
    ctx.beginPath(); ctx.moveTo(r.x, 1360); ctx.quadraticCurveTo(540, 1290, r.x + r.w, 1270); ctx.lineTo(r.x + r.w, 1300); ctx.quadraticCurveTo(540, 1330, r.x, 1420); ctx.closePath(); ctx.fillStyle = '#B98A4A'; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke();
    const px = 250 + lt * 70, bob = Math.abs(Math.sin(lt * 7)) * 6;
    G.person(px, 1330 - bob, 1.45, { kind: 'plain', robe: P.ochre, walk: lt * 7, t });
    travellerExtras(px, 1330 - bob, 1.45);
    // the book floats open beside him
    const bp = eo(seg(lt, 0.1, 0.45)), by = 760 + Math.sin(t * 2) * 10;
    ctx.save(); ctx.globalAlpha *= bp; G.book(690, by + 60 * (1 - bp), 0.62 * (0.7 + 0.3 * bp), seg(lt, 0.3, 1.2), t); ctx.restore();
    G.foil(560, 600, 280, 340, t, 10, 7);
    line([[px + 60, 1000], [600, by + 60]], rgba(P.giltHi, 0.35 * bp), 3);
    G.glassTop(t, r);
    pop('THE TRAVELLER', 540, 230, lt, 0.0, { size: 34, sc: 0.9 });
    slam('MANUCCI', 690, 520, lt, Math.max(0.15, mann - tells), { size: 54 });
  } });
  cue(tells, 'whoosh', { gain: 0.5, pan: 0.3 }); cue(Math.max(tells + 0.15, mann), 'slam', { gain: 0.55 });

  // ===== c8c: vermilion attackers with torches march on the gold-lit palace =====
  add({ id: 'c8c', at: he, cam: [600, 1000], zoom: 0.07, note: 'vermilion soldiers with flaming torches march from the left toward the gold-lit palace', draw(lt, d, t) {
    const r = G.panel(t, { ground: ['#17205A', P.night] });
    night(r, t, 1300, { mx: 230, my: 300 });
    G.palace(700, 1300, 0.78, { lit: 1, dark: 0.25, t });
    const x0 = -260 + lt * 240;
    for (let row = 0; row < 2; row++) {
      const s = row ? 0.62 : 0.5, y = row ? 1420 : 1340, n = row ? 5 : 6, xa = x0 + (row ? -60 : 40), xb = xa + (row ? 560 : 600);
      G.crowd(xa, xb, y, n, s, { robe: P.vermil, walk: lt * 9 + row, shield: P.vermilDk });
      for (let i = 0; i < n; i++) { const x = lerp(xa, xb, i / (n - 1)), yy = y + (i % 2) * 12 * s; G.fire(x + 70 * s, yy - 365 * s, 0.16, t, i + row * 7); }
    }
    G.glassTop(t, r);
    pop('THE ATTACKERS', 540, 230, lt, 0.5, { size: 40, col: P.vermil, ink: P.cream });
  } });
  cue(he, 'drum', { gain: 0.6 }); cue(he + 0.5, 'pop', { gain: 0.5 }); cue(he + 0.2, 'rumble', { gain: 0.4, dur: 1.2 });

  // ===== c8d: fire from OUTSIDE - windows turn fire colours, smoke rises =====
  add({ id: 'c8d', at: palW, cam: [540, 900], zoom: 0.08, note: 'torches arc in from both sides, the palace catches: windows fire-coloured, smoke; FIRE FROM OUTSIDE vs green inside', draw(lt, d, t) {
    const b = eo(seg(lt, 0.15, 1.0));
    const r = G.panel(t, { ground: [mixc('#17205A', '#5A1410', b), mixc(P.night, '#2A0A08', b)] });
    night(r, t, 1300, { mx: 860, my: 290, sky: mixc('#17205A', '#5A1410', b) });
    G.puffs(420, 700, t, 6, 0.75 * b, 2); G.puffs(700, 560, t + 1.3, 5, 0.75 * b, 9);
    G.palace(540, 1300, 0.95, { lit: 1, dark: 0.25, burn: b, t });
    for (let i = 0; i < 5; i++) { const k = eo(seg(lt, 0.1 + i * 0.14, 0.5 + i * 0.14)); if (k > 0) G.fire(160 + i * 190, 1305, 0.55 * k, t, i * 3); }
    // torches thrown in (arcs from outside the frame)
    for (let i = 0; i < 4; i++) { const k = seg(lt, i * 0.18, i * 0.18 + 0.5); if (k <= 0 || k >= 1) continue; const L0 = i % 2 ? r.x + r.w + 40 : r.x - 40, tx = 330 + i * 130;
      const x = lerp(L0, tx, k), y = lerp(1250, 900 + i * 40, k) - Math.sin(k * Math.PI) * 300; ctx.save(); ctx.translate(x, y); ctx.rotate(k * 9 * (i % 2 ? -1 : 1)); line([[-40, 0], [40, 0]], '#6A3A1A', 10); ctx.restore(); G.fire(x, y, 0.15, t, i); }
    // inward arrows
    const ap = eo(seg(lt, 0.6, 0.9));
    for (const sd of [-1, 1]) { if (ap <= 0) break; const x = 540 + sd * lerp(520, 420, ap), y = 1000; ctx.save(); ctx.globalAlpha *= ap; ctx.translate(x, y); ctx.scale(-sd, 1);
      ctx.beginPath(); ctx.moveTo(-50, -18); ctx.lineTo(10, -18); ctx.lineTo(10, -40); ctx.lineTo(50, 0); ctx.lineTo(10, 40); ctx.lineTo(10, 18); ctx.lineTo(-50, 18); ctx.closePath(); ctx.fillStyle = P.gilt; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
    G.glassTop(t, r);
    G.flash(0.35 * (1 - seg(lt, 0, 0.2)), P.vermil);
    pop('FIRE FROM OUTSIDE', 540, 230, lt, Math.max(0.3, fire8 - palW), { size: 42, col: P.vermil, ink: P.cream });
    // reminder of version 1, small: the green blast from inside
    if (lt > 0.9) { const k = eo(seg(lt, 0.9, 1.2)); ctx.save(); ctx.globalAlpha *= 0.9 * k; ctx.translate(880, 400); ctx.scale(k, k);
      circle(0, 0, 74, P.ink); circle(0, 0, 66, '#0E2A18'); G.burst(0, 0, 54, 0.45, P.greenHi); ctx.restore(); G.tag('VERSION 1', 880, 500, { size: 22, sc: k }); }
  } });
  cue(palW, 'whoosh', { gain: 0.7 }); cue(palW + 0.25, 'rumble', { gain: 0.6, dur: 1.4 }); cue(Math.max(palW + 0.3, fire8), 'pop', { gain: 0.5 });

  // ===== c9a: the king, disputed - his figure splits into two versions =====
  add({ id: 'c9a', at: t9, cam: [540, 820], zoom: 0.07, note: 'green faceless king stands; on DISPUTED he splits into two ghost versions and a crack runs down the glass', draw(lt, d, t) {
    const r = G.panel(t, { ground: ['#0E2A18', P.night] });
    night(r, t, 1330, { mx: 860, my: 290 });
    G.foil(r.x, r.y, r.w, 700, t, 14, 2);
    const sp = eio(seg(lt, disp - t9, disp - t9 + 0.5)), off = 190 * sp;
    if (sp > 0) { ctx.save(); ctx.globalAlpha *= 0.55 + 0.45 * sp; G.person(540 - off, 1330, 2.0, { kind: 'king', robe: P.green, t }); G.person(540 + off, 1330, 2.0, { kind: 'king', robe: P.green, dir: -1, t }); ctx.restore(); }
    if (sp < 1) { ctx.save(); ctx.globalAlpha *= 1 - sp * 0.9; G.person(540, 1330, 2.0, { kind: 'king', robe: P.green, p: eo(seg(lt, 0, 0.5)), t }); ctx.restore(); }
    qmark(540 - off, 560 - Math.sin(t * 3) * 10, 120 * sp, -0.15, sp); qmark(540 + off, 560 + Math.sin(t * 3) * 10, 120 * sp, 0.15, sp);
    G.crack(540, 900, seg(lt, disp - t9, disp - t9 + 0.5), 7, { n: 7, len: 900, lw: 3 });
    G.glassTop(t, r);
    pop("THE KING'S DEATH", 540, 230, lt, 0.1, { size: 36 });
    slam('DISPUTED', 540, 360, lt, disp - t9, { size: 58, col: P.vermil, ink: P.cream });
  } });
  cue(t9, 'tock', { gain: 0.5 }); cue(disp, 'slam', { gain: 0.8 }); cue(disp + 0.05, 'chisel', { gain: 0.5 });

  // ===== c9b / c9c: split panel - KILLED IN BATTLE? | CAPTURED? =====
  const splitScene = (lt, t, base, hiL, hiR, crackP) => {
    const r = G.panel(t, { ground: P.night });
    // left: battle at dusk, crown falls among crossed spears
    half(-1, r, () => {
      ctx.fillStyle = lg(0, r.y, 0, r.y + r.h, [[0, '#8A3A16'], [1, '#2A1208']]); ctx.fillRect(r.x, r.y, 480, r.h);
      G.puffs(300, 1300, t, 5, 0.5, 11);
      ctx.fillStyle = '#3A1A0A'; ctx.fillRect(r.x, 1180, 480, 300); line([[r.x, 1180], [540, 1180]], P.ink, 6);
      spear(110, 1200, 430, 760); spear(470, 1200, 160, 780); spear(220, 1200, 270, 700); spear(380, 1210, 350, 820);
      const fk = seg(base + lt, 0.05, 0.9), fy = lerp(380, 1130, eo(fk) * (fk < 1 ? 1 : 1)), bounce = fk >= 1 ? Math.abs(Math.sin((base + lt - 0.9) * 12)) * 30 * Math.exp(-(base + lt - 0.9) * 5) : 0;
      crown(295, fy - bounce, 0.85, (1 - eo(fk)) * 6 + (fk >= 1 ? 0.35 : 0) + Math.sin(t * 4) * 0.03);
      qmark(130, 540 + Math.sin(t * 2.4) * 14, 110, -0.2, 0.9); qmark(450, 640 + Math.cos(t * 2) * 14, 80, 0.25, 0.8);
    });
    // right: empty shackles, rope, crown on a vermilion cushion
    half(1, r, () => {
      ctx.fillStyle = lg(0, r.y, 0, r.y + r.h, [[0, '#1F3A8C'], [1, '#0B0F26']]); ctx.fillRect(540, r.y, 480, r.h);
      // barred window light
      ctx.fillStyle = rgba(P.giltHi, 0.12); ctx.beginPath(); ctx.moveTo(700, 300); ctx.lineTo(880, 300); ctx.lineTo(1000, 1200); ctx.lineTo(620, 1200); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#141A3A'; ctx.fillRect(540, 1180, 480, 300); line([[540, 1180], [1020, 1180]], P.ink, 6);
      // shackles hanging from a ring
      const sw = Math.sin(t * 2.2) * 0.12; ctx.save(); ctx.translate(780, 420); ctx.rotate(sw);
      circle(0, 0, 20, P.ink); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(0, 30 + i * 30, 10, 18, (i % 2) * 1.57, 0, TAU); ctx.strokeStyle = P.ink; ctx.lineWidth = 11; ctx.stroke(); ctx.strokeStyle = '#9A9AA6'; ctx.lineWidth = 5; ctx.stroke(); }
      for (const dx of [-46, 46]) { ctx.beginPath(); ctx.ellipse(dx, 250, 40, 28, 0, 0, TAU); ctx.strokeStyle = P.ink; ctx.lineWidth = 18; ctx.stroke(); ctx.strokeStyle = '#9A9AA6'; ctx.lineWidth = 9; ctx.stroke(); }
      line([[0, 200], [-46, 222]], P.ink, 6); line([[0, 200], [46, 222]], P.ink, 6);
      ctx.restore();
      // rope coil
      ctx.save(); ctx.translate(640, 1150); for (let i = 0; i < 3; i++) { ell(0, -i * 16, 70 - i * 8, 22, P.ink); ell(0, -i * 16 - 3, 64 - i * 8, 16, '#C9963E'); } ctx.restore();
      // cushion + crown
      const ck = eo(seg(base + lt, 1.15, 1.5));
      rr(720, 1060, 250, 90, 40); ctx.fillStyle = P.vermil; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 7; ctx.stroke();
      ctx.strokeStyle = P.gilt; ctx.lineWidth = 4; rr(736, 1074, 218, 62, 30); ctx.stroke();
      for (const [x, y] of [[724, 1146], [966, 1146]]) { line([[x, y], [x + (x < 800 ? -8 : 8), y + 30]], P.gilt, 8); circle(x + (x < 800 ? -8 : 8), y + 34, 9, P.gilt); }
      crown(845, lerp(900, 1070, ck), 0.75, 0, Math.max(0.25, ck));
      qmark(610, 600 + Math.sin(t * 2.6) * 14, 100, -0.2, 0.85); qmark(960, 760 + Math.cos(t * 2.1) * 14, 80, 0.2, 0.8);
    });
    dim(-1, r, 0.55 * (1 - hiL)); dim(1, r, 0.55 * (1 - hiR));
    divider(r, t);
    lineCrack(r.x, r.x + r.w, 880, crackP, 21, 46);
    if (crackP > 0.3) G.crack(540, 880, seg(crackP, 0.3, 1), 13, { n: 6, len: 380, lw: 3 });
    G.glassTop(t, r);
    label2(['KILLED', 'IN BATTLE?'], 300, 250, 54, clamp((base + lt) / 0.35), 0.45 + 0.55 * hiL, t);
    label2(['CAPTURED?'], 780, 290, 64, clamp((base + lt - 0.25) / 0.35), 0.45 + 0.55 * hiR, t);
  };
  add({ id: 'c9b', at: killed, cam: [300, 880], zoom: 0.08, note: 'split panel, left lit: KILLED IN BATTLE? gilt crown tumbles down among crossed spears', draw(lt, d, t) {
    splitScene(lt, t, 0, eo(seg(lt, 0, 0.3)), 0.1, 0);
  } });
  cue(killed, 'whoosh', { gain: 0.5, pan: -0.4 }); cue(killed + 0.9, 'thud', { gain: 0.6, pan: -0.4 });
  add({ id: 'c9c', at: capt, cam: [700, 880], zoom: 0.06, note: 'right lit: CAPTURED? empty shackles, rope, crown settles on a vermilion cushion; a crack runs across both', draw(lt, d, t) {
    const base = capt - killed;
    splitScene(lt, t, base, 1 - 0.4 * eo(seg(lt, 0, 0.3)), eo(seg(lt, 0, 0.3)), eo(seg(lt, behead - capt, behead - capt + 0.6)));
  } });
  cue(capt, 'slide', { gain: 0.5, pan: 0.4 }); cue(Math.max(capt + 0.05, killed + 1.25), 'plop', { gain: 0.4, pan: 0.4 }); cue(behead, 'chisel', { gain: 0.8 });

  // ===== c10a: the map, ~3 YEARS =====
  add({ id: 'c10a', at: t10, cam: [540, 700], zoom: 0.06, note: 'folk-art map of Tamil country, Thanjavur (green) + Madurai (vermilion) banners; ~3 YEARS title + three year tokens', draw(lt, d, t) {
    const r = G.panel(t, { ground: P.ultra, sc: lerp(0.94, 1, eo(seg(lt, 0, 0.5))) });
    mapScene(r, t);
    G.banner(TJ[0], TJ[1] - 10, 0.55, P.green, t); G.banner(MD[0], MD[1] - 10, 0.55, P.vermil, t + 1);
    // title cartouche
    const tp = seg(lt, 0.1, 0.7);
    ctx.save(); ctx.globalAlpha *= eo(tp); rr(230, 210, 620, 270, 40); ctx.fillStyle = rgba(P.night, 0.82); ctx.fill(); ctx.strokeStyle = P.gilt; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
    G.title('~3 YEARS', 540, 300, 120, tp);
    for (let i = 0; i < 3; i++) { const k = eob(clamp((lt - (three - t10) - i * 0.15) / 0.25)); if (k <= 0) continue; const x = 440 + i * 100;
      circle(x, 420, 30 * k, P.ink); circle(x, 420, 24 * k, P.gilt); circle(x, 420, 10 * k, P.giltHi); }
    G.glassTop(t, r);
    G.tag('THANJAVUR', TJ[0] - 40, TJ[1] + 70, { size: 26 }); G.tag('MADURAI', MD[0], MD[1] + 70, { size: 26 });
  } });
  cue(t10, 'swell', { gain: 0.5, dur: 1.2 }); for (let i = 0; i < 3; i++) cue(three + i * 0.15, 'tock', { gain: 0.5 });

  // ===== c10b / c10c: ultramarine Maratha pennants plant over Thanjavur; both Nayak banners fall =====
  const PEN = [[640, 610], [780, 600], [690, 700], [600, 690]];
  const marMap = (lt, t, base, r) => {
    mapScene(r, t);
    const ab = eo(seg(base + lt, 0, 0.5));
    // dashed arrow from the north-west
    ctx.save(); ctx.setLineDash([26, 18]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.moveTo(150, 170);
    ctx.quadraticCurveTo(lerp(150, 400, ab), lerp(170, 300, ab), lerp(150, TJ[0] - 40, ab), lerp(170, TJ[1] - 90, ab));
    ctx.strokeStyle = P.ink; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = P.ultraHi; ctx.lineWidth = 9; ctx.stroke(); ctx.restore();
    // Nayak banners
    const gf = seg(base + lt, thj - mar + 0.05, thj - mar + 0.5), vf = seg(base + lt, both - mar, both - mar + 0.45);
    fallenBanner(TJ[0] - 20, TJ[1] - 10, 0.55, P.green, t, gf, 1 - 0.65 * seg(base + lt, thj - mar + 0.5, thj - mar + 1.2));
    fallenBanner(MD[0], MD[1] - 10, 0.55, P.vermil, t + 1, vf, 1 - 0.65 * seg(base + lt, both - mar + 0.45, both - mar + 1.1));
    PEN.forEach(([x, y], i) => { const k = clamp((base + lt - 0.2 - i * 0.17) / 0.3); if (k <= 0) return;
      const dy = -260 * (1 - eo(k)); ctx.save(); ctx.globalAlpha *= clamp(k * 3); G.banner(x, y + dy, 0.6, P.ultra, t + i); ctx.restore();
      if (k < 1) circle(x, y, 40 * k, rgba(P.ultraHi, 0.5 * (1 - k))); });
  };
  add({ id: 'c10b', at: mar, cam: [700, 640], zoom: 0.09, note: 'blue arrow from the north; four ultramarine Maratha pennants drop onto Thanjavur, the green banner topples; MARATHAS', draw(lt, d, t) {
    const r = G.panel(t, { ground: P.ultra });
    marMap(lt, t, 0, r);
    G.glassTop(t, r);
    slam('MARATHAS', 540, 260, lt, 0.05, { size: 56, col: P.ultraHi, ink: P.cream });
    G.tag('THANJAVUR', TJ[0] - 40, TJ[1] + 80, { size: 26 });
  } });
  cue(mar, 'slam', { gain: 0.7 }); PEN.forEach((_, i) => cue(mar + 0.2 + i * 0.17 + 0.3, 'thud', { gain: 0.45, pan: 0.3 })); cue(thj + 0.05, 'whoosh', { gain: 0.4 });
  add({ id: 'c10c', at: from10, cam: [620, 780], zoom: 0.1, note: 'map push-in: vermilion Madurai banner topples too, both Nayak banners fade; blue pennants fly', draw(lt, d, t) {
    const r = G.panel(t, { ground: P.ultra, rot: 0.012 * Math.sin(lt * 1.5) });
    marMap(lt, t, from10 - mar, r);
    G.glassTop(t, r);
    G.tag('MARATHAS', 540, 260, { size: 56, col: P.ultraHi, ink: P.cream });
    pop('BOTH NAYAK HOUSES', 540, 1340, lt, both - from10, { size: 34 });
    G.tag('MADURAI', MD[0], MD[1] + 80, { size: 26 });
  } });
  cue(both, 'thud', { gain: 0.55, pan: -0.2 }); cue(both + 0.05, 'pop', { gain: 0.4 });

  // ===== c11a: A FATHER'S CHOICE? | AN ENEMY'S FIRE? =====
  add({ id: 'c11a', at: t11, cam: [540, 820], zoom: 0.06, note: "split: green panel kegs + green-glowing palace (FATHER'S CHOICE?) vs vermilion torches + burning palace (ENEMY'S FIRE?), big gilt ? on the divide", draw(lt, d, t) {
    const r = G.panel(t, { ground: P.night });
    const hL = eo(seg(lt, fath - t11 - 0.1, fath - t11 + 0.2)) * (1 - 0.45 * eo(seg(lt, enemy - t11 - 0.1, enemy - t11 + 0.2))), hR = eo(seg(lt, enemy - t11 - 0.1, enemy - t11 + 0.2));
    half(-1, r, () => {
      ctx.fillStyle = lg(0, r.y, 0, r.y + r.h, [[0, P.green], [1, '#0A2414']]); ctx.fillRect(r.x, r.y, 480, r.h);
      G.foil(r.x, r.y, 480, 500, t, 10, 4);
      G.palace(300, 1040, 0.55, { lit: 1, dark: 0.2, t });
      windows(300, 1040, 0.55, (k) => ({ col: mixc(P.greenHi, P.fireHi, 0.3 + 0.3 * Math.sin(t * 8 + k)), g: 0.8, gc: P.greenHi }));
      ctx.fillStyle = '#0A2414'; ctx.fillRect(r.x, 1040, 480, 500); line([[r.x, 1040], [540, 1040]], P.ink, 6);
      G.keg(180, 1330, 1.25, { glow: 1, t }); G.keg(370, 1340, 1.25, { glow: 1, t: t + 0.4 }); G.keg(275, 1190, 1.1, { glow: 1, t: t + 0.9 });
    });
    half(1, r, () => {
      ctx.fillStyle = lg(0, r.y, 0, r.y + r.h, [[0, P.vermil], [1, '#3A0A08']]); ctx.fillRect(540, r.y, 480, r.h);
      G.puffs(790, 740, t, 5, 0.6, 5);
      G.palace(790, 1040, 0.55, { lit: 1, dark: 0.2, burn: 1, t });
      ctx.fillStyle = '#3A0A08'; ctx.fillRect(540, 1040, 480, 500); line([[540, 1040], [1020, 1040]], P.ink, 6);
      for (let i = 0; i < 3; i++) torch(640 + i * 140, 1460, 300 + (i % 2) * 70, (i - 1) * 0.25 + Math.sin(t * 2 + i) * 0.06, t, i * 4, 0.3);
    });
    dim(-1, r, 0.5 * (1 - hL)); dim(1, r, 0.5 * (1 - hR));
    divider(r, t);
    G.glassTop(t, r);
    const qs = eob(clamp((lt - 0.05) / 0.35));
    ctx.save(); ctx.translate(540, 820); ctx.scale(qs, qs); circle(0, 0, 92, P.ink); circle(0, 0, 84, P.night); ctx.restore();
    qmark(540, 830, 170 * qs, Math.sin(t * 3) * 0.12, qs);
    label2(["A FATHER'S", 'CHOICE?'], 296, 260, 50, clamp((lt - Math.max(0, fath - t11 - 0.15)) / 0.4), 0.4 + 0.6 * Math.max(hL, 0.55 * (hR > 0 ? 1 : 0)), t);
    label2(["AN ENEMY'S", 'FIRE?'], 784, 260, 50, clamp((lt - (enemy - t11 - 0.15)) / 0.4), 0.4 + 0.6 * hR, t);
  } });
  cue(t11, 'bell', { gain: 0.5 }); cue(fath, 'pop', { gain: 0.5, pan: -0.4 }); cue(enemy, 'pop', { gain: 0.5, pan: 0.4 }); cue(enemy + 0.1, 'whoosh', { gain: 0.4, pan: 0.4 });

  // ===== c11b: the palace at night, all windows gold; COMMENT BELOW =====
  const goldWin = (t) => (k) => ({ col: goldCol(t, k), g: 0.7 + 0.3 * Math.sin(t * 2.5 + k) });
  add({ id: 'c11b', at: tell, cam: [540, 900], zoom: 0.05, note: 'palace at night, every arched window glowing gold; COMMENT BELOW tag with bouncing arrow', draw(lt, d, t) {
    const r = G.panel(t, { ground: ['#17205A', P.night] });
    night(r, t, 1230, { mx: 860, my: 280 });
    G.palace(540, 1230, 0.95, { lit: 1, dark: 0.35, t }); windows(540, 1230, 0.95, goldWin(t));
    G.foil(r.x, r.y, r.w, 400, t, 12, 9);
    G.glassTop(t, r);
    pop('COMMENT BELOW', 540, 1320, lt, Math.max(0, below - tell - 0.15), { size: 44 });
    const ak = seg(lt, below - tell, below - tell + 0.2), ay = 1395 + Math.abs(Math.sin(lt * 9)) * 18;
    if (ak > 0) { ctx.save(); ctx.globalAlpha *= ak; ctx.beginPath(); ctx.moveTo(510, ay - 20); ctx.lineTo(570, ay - 20); ctx.lineTo(540, ay + 18); ctx.closePath(); ctx.fillStyle = P.gilt; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
  } });
  cue(below, 'pop', { gain: 0.6 }); cue(tell, 'sparkle', { gain: 0.4 });

  // ===== c11c: slow push in on the gold windows ("watch again") =====
  add({ id: 'c11c', at: watch, cam: [540, 900], zoom: 0.08, note: 'slow push in on the glowing arched windows, glints travel along the rows', draw(lt, d, t) {
    const r = G.panel(t, { ground: ['#17205A', P.night] });
    const s = lerp(1.25, 1.55, eio(seg(lt, 0, d))), y = lerp(1360, 1420, eio(seg(lt, 0, d)));
    night(r, t, y, { mx: 900, my: 240 });
    G.palace(540, y, s, { lit: 1, dark: 0.35, t }); windows(540, y, s, (k) => ({ col: goldCol(t, k), g: 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 4 - (k % 7) * 0.8)) }));
    G.glassTop(t, r, { sheen: 1.3 });
  } });
  cue(watch, 'swell', { gain: 0.5, dur: 1.4 });

  // ===== c11d: "watch the windows": they flicker to fire, go dark one by one, a hairline crack =====
  const order = WINS.map((_, k) => k).sort((a, b) => rnd(a * 3 + 1) - rnd(b * 3 + 1));
  const rank = []; order.forEach((k, i) => (rank[k] = i));
  add({ id: 'c11d', at: wins, cam: [540, 820], zoom: 0.1, note: 'close on the windows: one fire flicker, then they go dark one by one; a hairline crack (loops to the burning hook)', draw(lt, d, t) {
    const r = G.panel(t, { ground: ['#17205A', P.night] });
    const s = 1.75, y = 1440;
    night(r, t, y, { mx: 900, my: 220 });
    const fl = seg(lt, 0.05, 0.4), darkT = (k) => 0.45 + rank[k] / WINS.length * Math.max(0.3, d - 1.0);
    G.palace(540, y, s, { lit: 1, dark: 0.35 + 0.25 * seg(lt, 0.5, d), t });
    windows(540, y, s, (k) => {
      const dk = eo(clamp((lt - darkT(k)) / 0.12)), onFire = fl > 0 && fl < 1;
      const base = onFire ? fireCol(t, k) : goldCol(t, k);
      return { col: dk > 0 ? mixc(onFire ? P.fire : P.gilt, '#1A1424', dk) : base, g: (1 - dk) * (onFire ? 1 : 0.7), gc: onFire ? P.fire : P.gilt };
    });
    if (fl > 0 && fl < 1) G.puffs(540, 700, t, 4, 0.4 * Math.sin(fl * Math.PI), 6);
    // embers drifting (keeps motion to the last frame)
    for (let i = 0; i < 14; i++) { const q = (t * 0.25 + rnd(i * 9)) % 1; circle(r.x + rnd(i * 4 + 2) * r.w + Math.sin(t + i) * 20, 1350 - q * 1100, 3 + rnd(i) * 3, rgba(P.fireHi, 0.6 * (1 - q))); }
    G.crack(700, 760, seg(lt, d - 0.6, d - 0.3), 31, { n: 6, len: 420, lw: 2 });
    G.glassTop(t, r, { sheen: 1.2 });
    G.flash(0.25 * (1 - seg(lt, 0, 0.15)), P.fire);
  } });
  cue(wins, 'whoosh', { gain: 0.55 }); cue(wins + 0.45, 'heartbeat', { gain: 0.5 }); cue(Math.max(wins + 0.6, END - 0.6), 'chisel', { gain: 0.7 });
}
