// EPISODE 4 · worker C : two suggested triggers (split screen), the second lake on a map, pipes at dawn, a quiet lake holding its breath, end card
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L, T } from './core/timing.js';
import * as K from './core/kit.js';
import * as A from './art.js';
const { lg, rgba, mixc } = A;

const INK = '#05080C', TEAL = '#0E3B43', SLATE = '#2B4A5E', SLATE2 = '#4F6B7A', GREEN = '#7BD88F', WHITE = '#E9F1EE', COLD = '#9CC4D6';
const sans = (sz, ls = 0) => { ctx.font = `900 ${sz}px Inter, sans-serif`; ctx.letterSpacing = `${ls}px`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; };
const txt = (s, x, y, sz, col = WHITE, ls = 4, a = 1) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; sans(sz, ls); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.letterSpacing = '0px'; ctx.restore(); };
/** flat dark label with a thin coloured edge */
function pill(s, x, y, sz = 36, a = 1, ls = 5, edge = GREEN, fg = WHITE) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; sans(sz, ls); const w = ctx.measureText(s).width + sz * 1.6, h = sz * 1.9;
  rr(x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(5,8,12,0.9)'; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = fg; ctx.fillText(s, x, y + 2); ctx.letterSpacing = '0px'; ctx.restore();
}
function grain(t, a = 0.07) {
  const s = Math.floor(t * 14) * 97;
  for (let i = 0; i < 300; i++) { const x = rnd(i + s) * W, y = rnd(i * 3 + s + 7) * H; ctx.fillStyle = rnd(i + s + 2) > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 1.6})`; ctx.fillRect(x, y, 3, 3); }
}
const fogB = (y, h, a, col = '170,200,210') => A.fog(y, h, a, col);
const vig = (a = 0.55) => { const g = ctx.createRadialGradient(540, 900, 460, 540, 900, 1300); g.addColorStop(0, 'rgba(2,4,8,0)'); g.addColorStop(1, `rgba(2,4,8,${a})`); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); };
function orb(x, y, r, a, col = '123,216,143') { // soft gas bubble: glass ring + green core
  K.glow(x, y, r * 3.2, col, 0.28 * a);
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = `rgba(${col},${0.16 * a})`; ctx.fill(); ctx.strokeStyle = `rgba(210,255,225,${0.7 * a})`; ctx.lineWidth = Math.max(2, r * 0.1); ctx.stroke();
  ctx.beginPath(); ctx.arc(x - r * 0.32, y - r * 0.34, r * 0.2, 0, TAU); ctx.fillStyle = `rgba(255,255,255,${0.7 * a})`; ctx.fill();
}
function rock(x, y, r, rot, seed, col = '#33464F') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, rr_ = r * (0.7 + rnd(seed + k) * 0.4); k ? ctx.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_) : ctx.moveTo(Math.cos(a) * rr_, Math.sin(a) * rr_); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.3); ctx.lineTo(r * 0.1, -r * 0.7); ctx.lineTo(r * 0.3, -r * 0.2); ctx.closePath(); ctx.fillStyle = 'rgba(190,215,225,0.22)'; ctx.fill(); ctx.restore();
}
function ring(x, y, rx, ry, a, lw = 4, col = '210,235,240') { if (a <= 0) return; ctx.strokeStyle = `rgba(${col},${a})`; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.stroke(); }
function pin(x, y, s, col, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ell(0, 4, 34, 10, 'rgba(0,0,0,0.4)');
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-52, -58, -46, -128, 0, -128); ctx.bezierCurveTo(46, -128, 52, -58, 0, 0); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  circle(0, -82, 18, INK); ctx.restore();
}

export function buildC(add, cue) {
  const T1 = L(10) - 0.1, T2 = L(11) - 0.1, T3 = L(12) - 0.1, T4 = L(13) - 0.1, T5 = L(14) - 0.1;

  // ═════════ C1 · line 10 · split screen: LANDSLIDE above, RAIN below ═════════
  const WL = 770; // top-panel waterline
  const IMPX = 600;
  add({ id: 'C1', at: T1, cam: [540, 960], zoom: 0.035, note: 'split screen: top rocks slide into the lake with a ripple, bottom cold rain sinks as a dense plume down one side; SUGGESTED x2', draw(lt, d, t) {
    // ---------- TOP: landslide ----------
    ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, 1240); ctx.clip();
    ctx.fillStyle = lg(0, -300, 0, 800, [[0, INK], [0.5, '#0B2530'], [1, '#1B4A56']]); ctx.fillRect(-300, -300, W + 600, 1240);
    A.stars(t, 40, 0.55, 420, 5);
    // far ridge
    A.fillP([[-300, 520], [60, 440], [300, 520], [700, 420], [1000, 500], [1400, 460], [1400, 800], [-300, 800]], '#10303B');
    // lake (side view)
    ctx.fillStyle = lg(0, WL, 0, 940, [[0, '#2F6A74'], [0.4, TEAL], [1, '#071820']]); ctx.fillRect(-300, WL, W + 600, 200);
    // surface wave from impact
    const hit = 1.55, ia = lt - hit;
    ctx.beginPath(); for (let x = 540; x <= 1400; x += 14) { const dd = x - IMPX, ph = ia * 340, env = ia > 0 ? Math.exp(-Math.abs(dd - ph * 0.9) / 90) * Math.exp(-ia * 0.9) : 0; ctx.lineTo(x, WL - 22 * env * Math.sin(dd * 0.05 - ia * 8)); } ctx.lineTo(1400, 960); ctx.lineTo(540, 960); ctx.closePath(); ctx.fillStyle = '#2F6A74'; ctx.fill();
    ctx.strokeStyle = 'rgba(200,235,240,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-300, WL); ctx.lineTo(1400, WL); ctx.stroke();
    // slope
    const slopeY = (x) => 330 + (x + 20) * 0.76;
    A.fillP([[-300, -100], [-300, 960], [IMPX - 40, 960], [IMPX - 40, WL + 6], [-20, 330], [-300, 250]], '#16262F');
    A.fillP([[-300, 250], [-20, 330], [IMPX - 40, WL + 6], [IMPX - 120, WL + 6], [-300, 380]], '#233743'); // lit top face
    const scar = eo(seg(lt, 0.3, 1.6)); A.fillP([[60, slopeY(60) + 6], [60 + 150 * scar, slopeY(60 + 150 * scar) + 6], [60 + 150 * scar, slopeY(60 + 150 * scar) + 60], [60, slopeY(60) + 60]], 'rgba(120,145,155,0.28)');
    // rocks
    for (let i = 0; i < 11; i++) {
      const x0 = 70 + i * 44 + rnd(i) * 20, st = 0.35 + i * 0.1, p = seg(lt, st, st + 1.25), r = 16 + rnd(i + 3) * 22;
      if (p <= 0) { rock(x0, slopeY(x0) - r * 0.6, r, rnd(i) * 3, i); continue; }
      const q = eio(p), x = lerp(x0, IMPX - 30, q * q * 0.5 + q * 0.5), y = slopeY(x) - r * 0.7, q2 = seg(lt, st + 1.2, st + 1.9);
      if (q2 < 1) { ctx.save(); ctx.globalAlpha = 1 - q2; rock(x + q2 * 40, y + q2 * (WL - y + 80), r, q * 9 + i, i); ctx.restore(); }
    }
    for (let k = 0; k < 7; k++) { const sx = 60 + k * 60, a = Math.sin(clamp((lt - 0.4 - k * 0.12) / 1.4) * Math.PI) * 0.35; if (a > 0.01) K.glow(sx + (lt - 0.4) * 110, slopeY(sx + (lt - 0.4) * 110) - 40, 110, '150,175,185', a); }
    // splash + ripples
    if (ia > 0) {
      for (let k = 0; k < 14; k++) { const a = -Math.PI / 2 + (rnd(k) - 0.5) * 1.8, v = 140 + rnd(k + 2) * 200, tt = ia * 1.3; const px = IMPX + Math.cos(a) * v * tt, py = WL + Math.sin(a) * v * tt + 520 * tt * tt; if (py < WL + 4 && tt < 1.2) circle(px, py, 5, `rgba(220,240,245,${1 - tt / 1.2})`); }
      for (let k = 0; k < 3; k++) { const pk = clamp((ia - k * 0.4) / 2.6); ring(IMPX, WL + 3, 30 + pk * 460, 5 + pk * 22, (1 - pk) * 0.8, 4); }
    }
    fogB(WL - 10, 140, 0.22); fogB(560, 260, 0.1);
    // labels
    txt('LANDSLIDE', 540, 96, 92, WHITE, 10, eo(seg(lt, 0.1, 0.6)));
    pill('SUGGESTED', 540, 200, 34, eo(seg(lt, 0.5, 1.0)), 7, GREEN);
    ctx.restore();

    // ---------- BOTTOM: heavy rain ----------
    ctx.save(); ctx.beginPath(); ctx.rect(-300, 960, W + 600, 1100); ctx.clip();
    ctx.fillStyle = lg(0, 960, 0, 1700, [[0, '#0A1822'], [0.3, '#12323F'], [1, INK]]); ctx.fillRect(-300, 950, W + 600, 1100);
    const SY = 1270; // lake surface
    // cloud band
    for (let i = 0; i < 9; i++) { const cx = -40 + i * 150 + Math.sin(t * 0.3 + i) * 14, cy = 1010 + Math.sin(i * 2) * 20; ell(cx, cy, 190, 62, i % 2 ? '#1D3744' : '#23404E'); }
    ell(300, 1050, 520, 50, 'rgba(10,20,28,0.5)');
    // rain curtain over the left/middle
    const rainA = eo(seg(lt, 0.2, 0.8));
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 90; i++) { const x = 30 + rnd(i) * 560, ph = (t * (1.8 + rnd(i + 4) * 0.8) + rnd(i + 9)) % 1, y = 1120 + ph * (SY - 1120), len = 34 + rnd(i + 2) * 30; ctx.strokeStyle = `rgba(190,225,240,${0.5 * rainA * (1 - Math.abs(ph - 0.5))})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.2, y + len); ctx.stroke(); }
    ctx.restore();
    // lake cross-section
    ctx.fillStyle = lg(0, SY, 0, 1600, [[0, '#2B6672'], [0.35, TEAL], [1, '#04101A']]); ctx.fillRect(-300, SY, W + 600, 340);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-300, 1610); ctx.lineTo(300, 1580); ctx.lineTo(760, 1598); ctx.lineTo(W + 300, 1570); ctx.lineTo(W + 300, 1700); ctx.lineTo(-300, 1700); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(200,235,240,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-300, SY); ctx.lineTo(1400, SY); ctx.stroke();
    for (let i = 0; i < 12; i++) { const rx = 30 + rnd(i) * 520, ph = (t * 1.1 + rnd(i + 3)) % 1; ring(rx, SY + 2, 6 + ph * 34, 2 + ph * 6, (1 - ph) * 0.6 * rainA, 2.5); }
    // the gas-rich bottom layer
    const sl = Math.sin(t * 0.8) * 0.04;
    ctx.fillStyle = lg(0, 1470, 0, 1600, [[0, 'rgba(123,216,143,0)'], [1, `rgba(123,216,143,${0.34 + sl})`]]); ctx.fillRect(-300, 1470, W + 600, 140);
    // the dense cold plume sinking down the left side
    const pr = eio(seg(lt, 0.9, 5.0)), N = 46;
    for (let i = 0; i < N; i++) {
      const u = i / N * pr; if (u <= 0.001) continue; let x, y;
      if (u < 0.68) { x = 110 + u * 70 + Math.sin(u * 14 + t * 1.5 + i) * 22; y = SY + 10 + u / 0.68 * 290; } else { const v = (u - 0.68) / 0.32; x = 160 + v * 520 + Math.sin(i + t) * 18; y = 1556 - Math.sin(v * 3) * 6 - v * 22; }
      const r = 48 + rnd(i) * 28 + u * 22;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(165,215,235,0.26)'); g.addColorStop(1, 'rgba(165,215,235,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // streamlines of the sinking water
    ctx.strokeStyle = 'rgba(210,240,250,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([10, 18]); ctx.lineDashOffset = -t * 40; ctx.beginPath(); ctx.moveTo(210, SY + 20); ctx.quadraticCurveTo(250, SY + 160, 180, SY + 270); ctx.stroke(); ctx.setLineDash([]);
    fogB(SY, 120, 0.12);
    txt('HEAVY RAIN', 540, 1042, 92, WHITE, 10, eo(seg(lt, 0.2, 0.7)));
    pill('SUGGESTED', 540, 1140, 34, eo(seg(lt, 0.7, 1.2)), 7, COLD);
    ctx.restore();
    // divider
    ctx.fillStyle = INK; ctx.fillRect(-300, 938, W + 600, 24); ctx.fillStyle = 'rgba(233,241,238,0.5)'; ctx.fillRect(-300, 948, W + 600, 3);
    grain(t); vig(0.45);
  } });
  cue(T1 + 1.55, 'rumble', { gain: 0.7, dur: 1.6 }); cue(T1 + 1.9, 'plop', { gain: 0.6 }); cue(T1 + 0.3, 'whoosh', { gain: 0.3 }); cue(T1 + 3.5, 'swell', { gain: 0.45 });

  // ═════════ C2 · line 11 · a second pin on the map ═════════
  const NY = [640, 700], MO = [380, 1010];
  add({ id: 'C2', at: T2, cam: [520, 880], zoom: 0.08, note: 'map: NYOS pin, then MONOUN pin drops beside it with a dotted line; MONOUN 1984, TWO YEARS EARLIER timeline', draw(lt, d, t) {
    ctx.fillStyle = lg(0, -300, 0, H, [[0, INK], [0.5, '#0A2229'], [1, '#07141B']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    ctx.strokeStyle = 'rgba(123,170,185,0.1)'; ctx.lineWidth = 2; for (let x = -60; x < W + 100; x += 90) { ctx.beginPath(); ctx.moveTo(x, -100); ctx.lineTo(x - 80, 1700); ctx.stroke(); } for (let y = 0; y < 1700; y += 90) { ctx.beginPath(); ctx.moveTo(-100, y); ctx.lineTo(1200, y + 20); ctx.stroke(); }
    // land mass with contour lines
    const lp = (k) => K.landPts(540, 880, 520 * k, 560 * k, 2.2);
    A.fillP(lp(1.0), '#12333D'); for (const k of [0.82, 0.64, 0.46, 0.28]) { A.poly(lp(k)); ctx.strokeStyle = `rgba(110,170,185,${0.1 + (1 - k) * 0.12})`; ctx.lineWidth = 3; ctx.stroke(); }
    A.poly(lp(1.0)); ctx.strokeStyle = 'rgba(160,205,215,0.5)'; ctx.lineWidth = 5; ctx.stroke();
    // lake dots
    for (const [c, r] of [[NY, 26], [MO, 22]]) { ell(c[0], c[1] + 4, r * 1.6, r * 0.8, 'rgba(60,150,170,0.55)'); }
    fogB(1180, 400, 0.12);
    // dotted line
    const dp = eio(seg(lt, 1.0, 1.9));
    ctx.save(); ctx.setLineDash([2, 24]); ctx.lineDashOffset = -t * 20; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(233,241,238,0.9)'; ctx.lineWidth = 9; ctx.beginPath();
    for (let k = 0; k <= 40; k++) { const u = k / 40 * dp, x = (1 - u) * (1 - u) * NY[0] + 2 * (1 - u) * u * 600 + u * u * MO[0], y = (1 - u) * (1 - u) * NY[1] + 2 * (1 - u) * u * 930 + u * u * MO[1]; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
    // pins
    const na = eob(seg(lt, 0.0, 0.5));
    for (let k = 0; k < 2; k++) { const ph = (t * 0.5 + k / 2) % 1; ring(NY[0], NY[1], 20 + ph * 80, 8 + ph * 32, (1 - ph) * 0.6, 3); }
    pin(NY[0], NY[1], 0.9 * clamp(na, 0, 1.2), WHITE, clamp(na));
    pill('NYOS', NY[0] + 180, NY[1] - 70, 36, eo(seg(lt, 0.2, 0.7)), 6, WHITE);
    const mp = seg(lt, 0.55, 1.1), drop = mp < 1 ? (1 - eo(mp)) * -260 : 0, bounce = mp >= 1 ? Math.max(0, Math.sin((lt - 1.1) * 14) * 16 * Math.exp(-(lt - 1.1) * 5)) : 0;
    if (mp > 0) { const ma = clamp(mp * 2); for (let k = 0; k < 2; k++) { const ph = (t * 0.5 + k / 2) % 1; ring(MO[0], MO[1], 20 + ph * 80, 8 + ph * 32, (1 - ph) * 0.6 * ma * (mp >= 1 ? 1 : 0), 3, '123,216,143'); }
      pin(MO[0], MO[1] + drop - bounce, 0.9, GREEN, ma); }
    pill('MONOUN  1984', MO[0] - 20, MO[1] + 90, 36, eo(seg(lt, 1.1, 1.6)), 5, GREEN);
    // timeline
    const ta = eo(seg(lt, 1.5, 2.2));
    txt('TWO YEARS EARLIER', 540, 1290, 66, WHITE, 6, ta);
    ctx.save(); ctx.globalAlpha = ta; ctx.strokeStyle = 'rgba(233,241,238,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(300, 1380); ctx.lineTo(300 + 480 * eio(seg(lt, 1.6, 2.4)), 1380); ctx.stroke(); circle(300, 1380, 13, GREEN); circle(780, 1380, 13, WHITE); ctx.restore();
    txt('1984', 300, 1432, 32, GREEN, 4, ta); txt('1986', 780, 1432, 32, WHITE, 4, ta);
    grain(t); vig(0.5);
  } });
  cue(T2 + 0.9, 'pop', { gain: 0.7 }); cue(T2 + 1.1, 'thud', { gain: 0.35 }); cue(T2 + 1.5, 'whoosh', { gain: 0.3 });

  // ═════════ C3 · line 12 · dawn: a pipe from the lake bottom, calm fountain, green bubbles ═════════
  const S3 = 800, PX = 540;
  add({ id: 'C3', at: T3, cam: [540, 1020], zoom: 0.07, note: 'dawn cross-section: vertical pipe from the lake bottom, calm fountain at the surface, steady stream of green bubbles; GAS ESCAPES SLOWLY', draw(lt, d, t) {
    // sky
    ctx.fillStyle = lg(0, -300, 0, S3, [[0, '#6C8FA0'], [0.55, '#B9D0D4'], [0.9, '#EBE6D8'], [1, '#F3E3CC']]); ctx.fillRect(-300, -300, W + 600, S3 + 300);
    K.glow(800, S3 - 20, 520, '255,236,205', 0.55);
    A.fillP([[-300, 660], [100, 610], [420, 700], [800, 680], [1100, 600], [1400, 640], [1400, S3], [-300, S3]], '#6F8A97');
    A.fillP([[-300, 720], [180, 690], [520, 760], [900, 720], [1400, 700], [1400, S3], [-300, S3]], '#3E5A68');
    fogB(S3 - 40, 220, 0.35, '235,235,225');
    // water cross-section
    ctx.fillStyle = lg(0, S3, 0, 1560, [[0, '#5B8E94'], [0.18, '#2B6672'], [0.55, TEAL], [1, '#03090E']]); ctx.fillRect(-300, S3, W + 600, 800);
    ctx.fillStyle = lg(0, 1380, 0, 1570, [[0, 'rgba(123,216,143,0)'], [1, 'rgba(123,216,143,0.3)']]); ctx.fillRect(-300, 1380, W + 600, 200);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const x = 120 + i * 300 + Math.sin(t * 0.3 + i) * 40; ctx.fillStyle = lg(x, S3, x + 140, 1300, [[0, 'rgba(255,240,210,0.16)'], [1, 'rgba(255,240,210,0)']]); A.poly([[x - 30, S3], [x + 30, S3], [x + 190, 1300], [x + 60, 1300]]); ctx.fill(); } ctx.restore();
    // floor
    ctx.beginPath(); ctx.moveTo(-300, 1560); for (let x = -300; x <= 1400; x += 60) ctx.lineTo(x, 1520 + Math.sin(x * 0.01) * 14 + rnd(x) * 12); ctx.lineTo(1400, 1700); ctx.lineTo(-300, 1700); ctx.closePath(); ctx.fillStyle = '#04080C'; ctx.fill();
    // slow seep bubbles on the floor (the gas source)
    for (const vx of [140, 300, 800, 940]) for (let k = 0; k < 4; k++) { const ph = (t * 0.12 + k / 4 + rnd(vx) ) % 1, y = 1520 - ph * 220, x = vx + Math.sin(ph * 6 + k) * 10; const a = Math.sin(ph * Math.PI) * 0.7; orb(x, y, 5 + ph * 4, a * 0.8); }
    // the pipe
    const topY = 640, botY = 1500, pw = 54;
    ctx.fillStyle = lg(PX - pw, 0, PX + pw, 0, [[0, '#1B2F3A'], [0.35, '#6E8C99'], [0.6, '#3E5A68'], [1, '#14242E']]);
    ctx.beginPath(); ctx.moveTo(PX - pw / 2 - 20, botY + 16); ctx.lineTo(PX - pw / 2, botY - 50); ctx.lineTo(PX - pw / 2, topY); ctx.lineTo(PX + pw / 2, topY); ctx.lineTo(PX + pw / 2, botY - 50); ctx.lineTo(PX + pw / 2 + 20, botY + 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(5,12,18,0.55)'; ctx.fillRect(PX - 14, S3 + 8, 28, botY - S3 - 20);
    // bubbles inside the pipe: small low down, bigger near the top
    for (let i = 0; i < 16; i++) { const ph = (t * 0.17 + i / 16) % 1, y = botY - 30 - ph * (botY - S3 - 20); orb(PX + Math.sin(ph * 10 + i) * 4, y, 4 + ph * 7, 0.95, '123,216,143'); }
    // float collar at the surface
    ell(PX, S3 + 4, 78, 14, '#C8D8DC'); ell(PX, S3 + 2, 78, 10, '#E9F1EE'); ctx.fillStyle = '#2B4A5E'; rr(PX - 38, topY - 12, 76, 22, 8); ctx.fill();
    // calm fountain
    const fa = eo(seg(lt, 0.3, 1.0));
    for (let i = 0; i < 44; i++) { const ph = (t * 0.55 + i / 44) % 1, vx = (rnd(i) - 0.5) * 300, y = topY - 150 * ph + 330 * ph * ph, x = PX + vx * ph; if (y > S3 + 2) continue; circle(x, y, 4.5 - ph * 1.5, `rgba(235,246,248,${0.85 * fa})`); }
    for (let k = 0; k < 2; k++) for (const sg of [-1, 1]) { const ph = (t * 0.55 + k * 0.5) % 1, lx = PX + sg * (150 * ph), lp = clamp((ph - 0.7) * 3); ring(lx + sg * 90 * 0, S3 + 4, 10 + ph * 40, 3 + ph * 8, (1 - ph) * 0.4 * fa, 2.5); }
    ctx.beginPath(); ctx.ellipse(PX, topY - 6, 20, 8, 0, 0, TAU); ctx.fillStyle = 'rgba(235,246,248,0.7)'; ctx.fill();
    // gas drifting off, thin and green
    for (let i = 0; i < 6; i++) { const ph = (t * 0.1 + i / 6) % 1; K.glow(PX + Math.sin(ph * 5 + i) * 50 + ph * 110, topY - 30 - ph * 160, 50 + ph * 70, '123,216,143', 0.18 * (1 - ph) * fa); }
    ring(PX, S3 + 4, 110 + 30 * Math.sin(t), 14, 0.12, 3);
    // label on the sky
    pill('GAS ESCAPES SLOWLY', 540, 300, 44, eo(seg(lt, 0.3, 1.0)), 6, GREEN);
    txt('', 0, 0, 1);
    grain(t, 0.06); vig(0.4);
  } });
  cue(T3 + 0.2, 'swell', { gain: 0.5 }); for (let k = 0; k < 5; k++) cue(T3 + 0.6 + k * 0.8, 'bubbles', { gain: 0.35 }); cue(T3 + 0.5, 'whoosh', { gain: 0.2 });

  // ═════════ C4 · line 13 · wide dawn mirror lake, mist, one breath-like bubble ═════════
  const HZ = 900;
  add({ id: 'C4', at: T4, cam: [540, 1000], zoom: 0.12, note: 'wide dawn lake mirror: crater rim, drifting mist, slow push-in, one green bubble rising and pulsing like a breath; no people', draw(lt, d, t) {
    const sky = () => { ctx.fillStyle = lg(0, 0, 0, HZ, [[0, '#7893A3'], [0.55, '#C5D5D8'], [0.88, '#EFE6D6'], [1, '#F6DDBF']]); ctx.fillRect(-300, -300, W + 600, HZ + 300); };
    sky();
    K.glow(540, HZ - 10, 640, '255,232,200', 0.6);
    const rim = () => { A.fillP([[-300, 700], [0, 660], [260, 740], [480, 820], [660, 830], [860, 760], [1100, 650], [1400, 700], [1400, HZ], [-300, HZ]], '#5E7B88'); A.fillP([[-300, 790], [200, 770], [520, 850], [900, 830], [1400, 770], [1400, HZ], [-300, HZ]], '#34505E'); A.fillP([[-300, 850], [400, 860], [700, 870], [1400, 850], [1400, HZ], [-300, HZ]], '#1D3441'); };
    rim();
    fogB(HZ - 90, 200, 0.4, '240,235,225');
    // mirror water: flipped sky + rim
    ctx.save(); ctx.beginPath(); ctx.rect(-300, HZ, W + 600, 1100); ctx.clip();
    ctx.fillStyle = lg(0, HZ, 0, 1700, [[0, '#8FA9B3'], [0.12, '#4F7886'], [0.5, '#16404B'], [1, '#05121A']]); ctx.fillRect(-300, HZ, W + 600, 1000);
    ctx.save(); ctx.globalAlpha = 0.4; ctx.translate(0, HZ * 2); ctx.scale(1, -1); rim(); ctx.restore();
    ctx.fillStyle = lg(0, HZ, 0, 1500, [[0, 'rgba(10,30,40,0)'], [1, 'rgba(5,12,18,0.85)']]); ctx.fillRect(-300, HZ, W + 600, 900);
    ctx.strokeStyle = 'rgba(235,240,235,0.16)'; ctx.lineWidth = 2; for (let i = 0; i < 22; i++) { const y = HZ + 20 + rnd(i) * 560, x = ((rnd(i + 5) * 1300 + t * 5) % 1300) - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60 + rnd(i) * 120, y); ctx.stroke(); }
    // bubble
    const rise = eio(seg(lt, 0.15, 3.3)), by = lerp(1500, HZ + 130, rise), bx = 560 + Math.sin(lt * 1.3) * 14, pulse = 1 + 0.18 * Math.sin(lt * 4.2), br = (22 + rise * 18) * pulse;
    ctx.save(); ctx.globalAlpha = 1 - seg(lt, 3.3, 3.6); orb(bx, by, br, 1); ctx.restore();
    const rp = seg(lt, 3.2, d); for (let k = 0; k < 3; k++) { const pk = clamp(rp * 1.4 - k * 0.22); ring(bx, HZ + 130, 20 + pk * 260, 4 + pk * 36, (1 - pk) * 0.5 * (rp > 0 ? 1 : 0), 3); }
    ctx.restore();
    // mist
    for (let i = 0; i < 5; i++) { const y = HZ - 40 + i * 70 + Math.sin(t * 0.25 + i) * 10, a = 0.16 + 0.04 * i; for (let k = 0; k < 6; k++) { const x = ((k * 260 + t * (8 + i * 4) + i * 90) % 1700) - 300; K.glow(x, y, 260, '235,238,232', a * 0.5); } }
    // foreground shore silhouette
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-300, 1620); for (let x = -300; x <= 1400; x += 30) ctx.lineTo(x, 1590 - Math.abs(Math.sin(x * 0.02)) * 26 - rnd(x) * 22); ctx.lineTo(1400, 2000); ctx.lineTo(-300, 2000); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 26; i++) { const x = -40 + i * 46 + rnd(i) * 20, h = 70 + rnd(i + 2) * 90, sw = Math.sin(t * 0.8 + i) * 5; ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 1620); ctx.quadraticCurveTo(x + sw, 1620 - h * 0.6, x + sw * 2 + (rnd(i) - 0.5) * 30, 1620 - h); ctx.stroke(); }
    grain(t, 0.06); vig(0.5);
  } });
  cue(T4 + 0.1, 'inhale', { gain: 0.6 }); cue(T4 + 0.9, 'bubbles', { gain: 0.3 }); cue(T4 + 3.3, 'plop', { gain: 0.35 });

  // ═════════ C5 · line 14 · end card: still dark lake, one bubble, AAZHI wordmark ═════════
  const SY5 = 1150;
  add({ id: 'C5', at: T5, cam: [540, 960], zoom: 0.04, note: 'end card: near-black still lake with one bubble rising; ஆழி + AAZHI off-white, EPISODE 4, ALL SCENES ARE ILLUSTRATIONS', draw(lt, d, t) {
    ctx.fillStyle = lg(0, -300, 0, H, [[0, '#03060A'], [0.5, '#071820'], [0.6, '#0A2832'], [1, '#03080C']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    A.stars(t, 40, 0.35, 900, 31);
    ctx.fillStyle = lg(0, 880, 0, SY5, [[0, 'rgba(110,160,175,0)'], [1, 'rgba(110,160,175,0.18)']]); ctx.fillRect(-300, 880, W + 600, SY5 - 880);
    // still water, faint streaks
    ctx.strokeStyle = 'rgba(180,215,225,0.1)'; ctx.lineWidth = 2; for (let i = 0; i < 18; i++) { const y = SY5 + 20 + rnd(i) * 360, x = ((rnd(i + 5) * 1300 + t * 4) % 1300) - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50 + rnd(i) * 100, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(200,225,230,0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-300, SY5); ctx.lineTo(1400, SY5); ctx.stroke();
    // one bubble, rising on a 2.4 s loop
    const per = 2.4, ph = (lt % per) / per, q = eio(ph), by = lerp(1500, SY5 + 24, q), bx = 540 + Math.sin(ph * 5) * 12, br = (14 + q * 12) * (1 + 0.15 * Math.sin(lt * 5));
    orb(bx, by, br, 1 - seg(ph, 0.95, 1.0));
    const pk = clamp((lt % per - per * 0.97 + (lt >= per * 0.97 ? 0 : 0)) / 1.5), rl = (lt + per * 0.03) % per; // ripples after each arrival
    if (lt > per * 0.97) for (let k = 0; k < 3; k++) { const p = clamp(((lt - per * 0.97) % per) / 1.8 - k * 0.2); ring(540, SY5 + 22, 20 + p * 300, 3 + p * 38, (1 - p) * 0.5, 3); }
    // wordmark
    const wa = eo(seg(lt, 0.05, 0.7));
    ctx.save(); ctx.globalAlpha = wa; ctx.translate(0, (1 - wa) * 14);
    ctx.font = '700 200px NotoTamil, Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = WHITE; ctx.fillText('ஆழி', 540, 400);
    sans(120, 34); ctx.fillStyle = WHITE; ctx.fillText('AAZHI', 540 + 17, 590); ctx.letterSpacing = '0px';
    ctx.fillStyle = GREEN; ctx.fillRect(440, 690, 200, 4); ctx.restore();
    const ea = eio(seg(lt, 0.5, 1.1)); txt('EPISODE 4', 540, 760, 38, WHITE, 14, ea * 0.9); txt('THE LAKE THAT HELD ITS BREATH', 540, 826, 28, COLD, 5, ea * 0.85);
    txt('ALL SCENES ARE ILLUSTRATIONS', 540, 1470, 26, WHITE, 5, ea * 0.55);
    fogB(SY5, 160, 0.14); grain(t, 0.06); vig(0.6);
  } });
  cue(T5 + 0.1, 'swell', { gain: 0.5 }); cue(T5 + 0.9, 'bubbles', { gain: 0.3 }); cue(T5 + 2.2, 'plop', { gain: 0.3 });
}
