// v25 worker A: script lines 0-3 (storm hook, Jaffna 1617 + Nallur, Cankili seizes the throne, Portuguese vs Thanjavur call). Shots run 0 .. L(4).
import * as G from './chart.js';
import { L, Wd } from './core/timing.js';
import { ctx, clamp, lerp, seg, eo, eio, eob, rnd, TAU, line, circle } from './core/lib.js';
import { rgba, mixc } from './art.js';

const P = G.PAL, STORM = [P.storm, P.stormDk], GEO = G.GEO, LAND = '#CDB27E', LANDI = '#D9C08C';

// ---------- local helpers ----------
const pop = (lt, t0, d = 0.3) => eob(clamp((lt - t0) / d));
function shk(lt, t0, amp, dur = 0.5) { const k = 1 - seg(lt, t0, t0 + dur); if (lt < t0 || k <= 0) return [0, 0]; const a = amp * k * k; return [Math.sin(lt * 93) * a, Math.cos(lt * 71) * a]; }
function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
// map zoom: chart point (fx, fy) lands on screen (tx, ty) scaled s
function zm(fx, fy, s, tx = 540, ty = 780) { ctx.translate(tx, ty); ctx.scale(s, s); ctx.translate(-fx, -fy); }
function part(pts, p) { let tot = 0; const Ls = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); Ls.push(d); tot += d; }
  let left = tot * clamp(p); const out = [pts[0]];
  for (let i = 1; i < pts.length && left > 0; i++) { const d = Ls[i - 1]; if (d <= left) { out.push(pts[i]); left -= d; } else { const u = left / d; out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); left = 0; } }
  return out; }
// ink route with an arrowhead at its growing tip
function route(pts, p, col, w = 7, dash = null) {
  if (p <= 0.02) return; const o = part(pts, p); if (o.length < 2) return; ctx.save(); if (dash) ctx.setLineDash(dash); line(o, col, w); ctx.restore();
  const a = o[o.length - 1], b = o[o.length - 2], ang = Math.atan2(a[1] - b[1], a[0] - b[0]), k = w * 3.2;
  ctx.beginPath(); ctx.moveTo(a[0] + Math.cos(ang) * k, a[1] + Math.sin(ang) * k); ctx.lineTo(a[0] + Math.cos(ang + 2.4) * k, a[1] + Math.sin(ang + 2.4) * k); ctx.lineTo(a[0] + Math.cos(ang - 2.4) * k, a[1] + Math.sin(ang - 2.4) * k); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
// the two chart coasts, fully inked (or progressing)
function coasts(pI = 1, pJ = 1, o = {}) { G.coast(GEO.INDIA, pI, { land: o.landI ?? LANDI, col: o.col, hatchSide: 1 }); G.coast(GEO.JAFFNA, pJ, { land: o.land ?? LAND, col: o.col, closed: true, hatchSide: -1 }); }
function landPath() { ctx.beginPath(); GEO.JAFFNA.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); }
// mirrored figure (faces left)
function figL(x, y, s, o) { ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); G.figure(0, 0, s, o); ctx.restore(); }
// ink throne on its dais steps: n steps rising to the right, drawn in with p
function dais(x0, y0, n, sw, sh, p, lt) {
  for (let i = 0; i < n; i++) { const q = eo(clamp(p * (n + 1) - i)); if (q <= 0) continue; const x = x0 + i * sw, y = y0 - (i + 1) * sh, w = (n - i) * sw;
    ctx.save(); ctx.globalAlpha *= q; ctx.fillStyle = mixc(P.vellumDk, P.stain, i / n); ctx.fillRect(x, y, w, sh); ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, sh);
    for (let k = 12; k < w; k += 22) line([[x + k, y + sh - 4], [x + k - 14, y + 6]], rgba(P.ink, 0.3), 2); ctx.restore(); }
  const tq = eo(clamp(p * (n + 1) - n)); if (tq <= 0) return; const tx = x0 + (n - 0.5) * sw, ty = y0 - n * sh;
  ctx.save(); ctx.globalAlpha *= tq; ctx.translate(tx, ty); ctx.fillStyle = P.sepia; ctx.strokeStyle = P.ink; ctx.lineWidth = 6;
  ctx.fillRect(-70, -260, 140, 30); ctx.strokeRect(-70, -260, 140, 30); ctx.fillRect(-60, -230, 18, 230); ctx.fillRect(42, -230, 18, 230); ctx.fillRect(-90, -100, 180, 26); ctx.strokeRect(-90, -100, 180, 26);
  ctx.fillStyle = P.green; ctx.fillRect(-80, -124, 160, 24); ctx.strokeRect(-80, -124, 160, 24); G.pennant(0, -300, 50, lt, P.green); line([[0, -260], [0, -302]], P.ink, 5); ctx.restore();
}
const stepTop = (x0, y0, sw, sh, i) => [x0 + i * sw + sw * 0.5, y0 - (i + 1) * sh];

export function buildA(add, cue) {
  const t1 = Wd('tamil', 0) - 0.05, t2 = Wd('die', 0) - 0.05, t3 = L(1), t4 = Wd('sri', 1) - 0.1, t5 = Wd('seventeen', 1) - 0.05, t6 = Wd('tamil', 1) - 0.1,
    t7 = Wd('ruled', 1) - 0.05, t8 = L(2) - 0.05, t9 = Wd('killing', 2) - 0.05, t10 = Wd('princes', 2) - 0.05, t11 = L(3) - 0.05, t12 = Wd('cankili', 3) - 0.05,
    t13 = Wd('nayaks', 3) - 0.1;

  // ---- line 0: HOOK ----
  add({ id: 'a0_storm', at: 0, cam: [600, 820], zoom: 0.16, note: 'HOOK: storm-night chart, lightning flash, red wax seal SLAMS onto Jaffna coast, crowned green figure lit by the bolt, wind + rain',
    draw: (lt) => { const [sx, sy] = shk(lt, 0.03, 30, 0.7); const r = G.sheet(lt, { ground: STORM, lift: 0.7, x: 50 + sx, y: 110 + sy });
      ctx.save(); ctx.globalAlpha = 0.9; coasts(1, 1, { col: P.vellumHi, land: mixc(P.storm, P.green, 0.35), landI: mixc(P.storm, P.sepia, 0.35) }); ctx.restore();
      G.waves(60, 1020, 900, lt, { storm: 1, col: P.sea, a: 0.6, rows: 5, gap: 70 });
      const fl = Math.max(1 - lt / 0.12, lt > 0.75 ? 0.45 * (1 - (lt - 0.75) / 0.12) : 0);
      G.lightning(300, 110, 1000, 4, clamp(1 - lt / 0.2)); G.lightning(820, 110, 700, 9, lt > 0.75 ? clamp(1 - (lt - 0.75) / 0.2) : 0);
      glow(330, 1100, 420, '#CFE3FF', 0.2 + 0.4 * clamp(fl));
      G.figure(330, 1380, 1.55, { hat: 'crown', robe: P.green, t: lt, arm: 0.2 + Math.sin(lt * 4) * 0.1 });
      G.stamp(GEO.NALLUR[0] + 20, GEO.NALLUR[1] + 120, 150, 0.3 + lt / 0.7, { mark: 'cross' });
      G.wind(lt * 1.4, 60, 300, 1020, 1300, 0.9, 1, { col: P.vellumHi }); G.rain(lt, 0.8);
      G.sheetTop(lt, r, { lamp: 0.4 }); G.flash(fl * 0.85); } });
  cue(0, 'slam', { gain: 1 }); cue(0.02, 'thud', { gain: 0.9 }); cue(0, 'rumble', { gain: 0.9, dur: 2.5 }); cue(0.75, 'thud', { gain: 0.5 }); cue(0.3, 'whoosh', { gain: 0.5, pan: 0.4 });

  add({ id: 'a1_fate', at: t1, cam: [540, 760], zoom: 0.14, note: 'HOOK: rope swings in from the left, blade from the right, a "?" seal slams between them over the small crowned figure',
    draw: (lt) => { const [sx, sy] = shk(lt, 0.38, 22, 0.5); const r = G.sheet(lt, { ground: STORM, lift: 0.9, x: 50 + sx, y: 110 + sy });
      G.rhumb(540, 760, 1000, 1, { a: 0.35, rot: lt * 0.2 }); G.waves(60, 1020, 1200, lt, { storm: 1, col: P.sea, a: 0.5, rows: 5, gap: 50 });
      glow(540, 1250, 300, '#CFE3FF', 0.15); G.figure(540, 1400, 0.9, { hat: 'crown', robe: P.green, t: lt });
      const qi = eob(seg(lt, 0, 0.45)), sw = Math.sin(lt * 6) * 0.25 * (1 - seg(lt, 0.4, 0.9) * 0.6);
      G.rope(lerp(-260, 270, qi), 560, 1.5, { rot: 0.5 * (1 - qi) + sw }); G.blade(lerp(1340, 830, qi), 920, 1.5, { rot: -0.6 * (1 - qi) - sw });
      G.stamp(540, 760, 130, seg(lt, 0.1, 0.9), { mark: 'blank', text: '?' });
      G.wind(lt * 1.5, 60, 200, 1020, 1100, 0.8, 7, { col: P.vellumHi, dir: -1 }); G.rain(lt, 0.6, 3);
      G.sheetTop(lt, r, { lamp: 0.4 }); G.flash(0.4 * clamp(1 - (lt - 0.38) / 0.1) * (lt > 0.38)); } });
  cue(t1, 'whoosh', { gain: 0.8, pan: -0.5 }); cue(t1 + 0.08, 'whoosh', { gain: 0.7, pan: 0.5 }); cue(t1 + 0.38, 'slam', { gain: 0.9 });

  add({ id: 'a2_disputed', at: t2, cam: [540, 800], zoom: 0.12, note: '"really die?": lightning, "?" seal centre, rope + blade swaying, DISPUTED tag slams, vellum starts to burn at the edge',
    draw: (lt) => { const r = G.sheet(lt, { ground: STORM, lift: 1, rot: -0.02 });
      G.lightning(760, 110, 900, 13, clamp(1 - lt / 0.2)); G.waves(60, 1020, 1150, lt, { storm: 1, col: P.sea, a: 0.5, rows: 6, gap: 48 });
      G.rope(250, 470, 1.4, { rot: Math.sin(lt * 5) * 0.2 }); G.blade(850, 900, 1.4, { rot: -Math.sin(lt * 5) * 0.2 });
      G.stamp(540, 720, 170 + lt * 20, 1, { mark: 'blank', text: '?' }); G.burn(1030, 1450, seg(lt, 0.2, 1.1), 380, 5);
      G.wind(lt * 1.6, 60, 900, 1020, 1400, 0.9, 11, { col: P.vellumHi }); G.rain(lt, 0.8, 7);
      G.sheetTop(lt, r, { lamp: 0.4 }); G.tag('DISPUTED', 540, 1180, { sc: pop(lt, 0.12, 0.28) * 1.3, rot: -0.06, ink: P.red }); G.flash(0.8 * clamp(1 - lt / 0.18)); } });
  cue(t2, 'thud', { gain: 0.8 }); cue(t2 + 0.14, 'slam', { gain: 0.7 }); cue(t2 + 0.3, 'rumble', { gain: 0.5, dur: 1 });

  // ---- line 1: Jaffna, 1617, Nallur ----
  add({ id: 'a3_rose', at: t3, cam: [540, 800], zoom: 0.14, note: 'storm wash clears: compass rose, needle spins, rhumb lines SHOOT out across the chart',
    draw: (lt) => { const r = G.sheet(lt, { ground: STORM, groundA: 1 - eo(seg(lt, 0, 0.5)), lift: 0.4 * (1 - seg(lt, 0, 0.8)) });
      G.rhumb(540, 800, 1200, seg(lt, 0.05, 0.7), { w: 3 }); G.rhumb(200, 300, 500, seg(lt, 0.4, 1), { n: 16, a: 0.5 }); G.rhumb(880, 1300, 500, seg(lt, 0.5, 1.1), { n: 16, a: 0.5 });
      G.waves(80, 1000, 1250, lt, { a: 0.5, rows: 3 });
      G.rose(540, 800, 190 * eob(seg(lt, 0, 0.4)), lt, { spin: (1 - eo(seg(lt, 0, 1.2))) * TAU * 3 + 0.4, rot: (1 - eo(seg(lt, 0, 0.6))) * -1 });
      G.wind(lt, 60, 300, 1020, 600, 0.5, 2); G.sheetTop(lt, r); G.flash(0.6 * clamp(1 - lt / 0.15)); } });
  cue(t3, 'whoosh', { gain: 0.7 }); cue(t3 + 0.05, 'zip', { gain: 0.7 }); for (let i = 0; i < 4; i++) cue(t3 + 0.35 + i * 0.2, 'tock', { gain: 0.35 });

  add({ id: 'a4_coasts', at: t4, cam: [620, 700], zoom: 0.1, note: 'INDIA and JAFFNA coasts ink themselves in over rhumb lines; JAFFNA title ink-letters',
    draw: (lt) => { const r = G.sheet(lt, { lift: 0.2 });
      G.rhumb(GEO.STRAIT[0], GEO.STRAIT[1], 1100, 1, { a: 0.35 }); G.waves(80, 1000, 1000, lt, { a: 0.5, rows: 4, gap: 60 });
      coasts(seg(lt, 0, 0.8), seg(lt, 0.1, 1.1)); G.rose(250, 1200, 110, lt, { spin: lt * 2 });
      G.title('JAFFNA', 660, 1080, 140, seg(lt, 0.35, 1.0), { col: P.green }); G.wind(lt, 60, 160, 700, 420, 0.5, 5);
      G.sheetTop(lt, r); } });
  cue(t4, 'slide', { gain: 0.6 }); cue(t4 + 0.1, 'chisel', { gain: 0.5 }); cue(t4 + 0.4, 'chisel', { gain: 0.6 });

  add({ id: 'a5_1617', at: t5, cam: [540, 760], zoom: 0.18, note: '"1617": close on the peninsula, sheet lifts in a wind gust, big 1617 ink-lettered, needle spins',
    draw: (lt) => { const r = G.sheet(lt, { lift: 0.8 });
      ctx.save(); zm(720, 640, 1.5 + lt * 0.1); G.rhumb(GEO.NALLUR[0], GEO.NALLUR[1], 900, 1, { a: 0.4 }); coasts(1, 1); ctx.restore();
      G.title('1617', 540, 740, 250, seg(lt, 0, 0.55), { col: P.ink }); G.rose(860, 1260, 110, lt, { spin: lt * 9 });
      G.wind(lt * 1.3, 60, 900, 1020, 1350, 0.8, 8); G.sheetTop(lt, r); } });
  cue(t5, 'whoosh', { gain: 0.6 }); for (let i = 0; i < 4; i++) cue(t5 + 0.05 + i * 0.12, 'chisel', { gain: 0.45 });

  add({ id: 'a6_kingdom', at: t6, cam: [700, 760], zoom: 0.12, note: '"a Tamil kingdom": green ink floods the Jaffna land, green pennants pop up along its coast; ILLUSTRATION tag',
    draw: (lt) => { const r = G.sheet(lt, { lift: 0.15 });
      ctx.save(); zm(720, 800, 1.15, 640, 800); G.waves(80, 520, 900, lt, { a: 0.5, rows: 5, gap: 70 }); coasts(1, 1);
      ctx.save(); landPath(); ctx.fillStyle = rgba(P.green, 0.5 * eo(seg(lt, 0, 0.7))); ctx.fill(); ctx.restore();
      GEO.JAFFNA.forEach((q, i) => { if (i % 2) return; const k = pop(lt, 0.15 + i * 0.04, 0.3); if (k <= 0) return; ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(k, k); line([[0, 0], [0, -70]], P.ink, 5); G.pennant(0, -70, 44, lt + i, P.green); ctx.restore(); });
      ctx.restore(); G.wind(lt, 60, 300, 1020, 700, 0.4, 4);
      G.sheetTop(lt, r); G.tag('ILLUSTRATION', 540, 1370, { sc: pop(lt, 0.2, 0.3) * 0.8 }); } });
  cue(t6, 'slide', { gain: 0.5 }); for (let i = 0; i < 6; i++) cue(t6 + 0.2 + i * 0.09, 'pop', { gain: 0.3, pan: -0.3 + i * 0.12 }); cue(t6 + 0.25, 'plop', { gain: 0.4 });

  add({ id: 'a7_nallur', at: t7, cam: [540, 820], zoom: 0.14, note: '"ruled from Nallur": push on Nallur point, the fort glyph rises from the chart, green pennants climb its towers, NALLUR tag',
    draw: (lt) => { const r = G.sheet(lt, {});
      ctx.save(); zm(GEO.NALLUR[0], GEO.NALLUR[1], 2.2, 540, 1000); coasts(1, 1); ctx.save(); landPath(); ctx.fillStyle = rgba(P.green, 0.4); ctx.fill(); ctx.restore(); ctx.restore();
      G.rhumb(540, 1000, 1100, seg(lt, 0.3, 1.1), { a: 0.5 });
      const q = eob(seg(lt, 0, 0.6)); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, 1010); ctx.clip(); G.fort(540, 1000 + (1 - q) * 450, 1.5, { t: lt, col: P.green }); ctx.restore();
      for (const [px, d] of [[300, 0.5], [780, 0.65]]) { const k = eo(seg(lt, d, d + 0.5)); line([[px, 1010], [px, 1010 - 330 * k]], P.ink, 7); if (k > 0) G.pennant(px, 1010 - 330 * k, 80, lt, P.green); }
      G.wind(lt, 60, 300, 1020, 700, 0.5, 6); G.sheetTop(lt, r); G.tag('NALLUR', 540, 1220, { sc: pop(lt, 0.55, 0.3) }); } });
  cue(t7, 'whoosh', { gain: 0.5 }); cue(t7 + 0.4, 'thud', { gain: 0.7 }); cue(t7 + 0.55, 'swell', { gain: 0.4 }); cue(Wd('nallur', 1), 'pop', { gain: 0.5 });

  // ---- line 2: Cankili seizes the throne ----
  const X0 = 150, Y0 = 1380, SW = 150, SH = 90, N = 5;
  add({ id: 'a8_dais', at: t8, cam: [620, 800], zoom: 0.1, note: 'ACCOUNTS SAY: ink dais steps draw in, crowned green Cankili climbs to the throne; small seal thud as he takes it',
    draw: (lt, d) => { const r = G.sheet(lt, {}); G.rhumb(X0 + (N - 0.5) * SW, Y0 - N * SH - 150, 1100, seg(lt, 0, 0.8), { a: 0.25 });
      dais(X0, Y0, N, SW, SH, seg(lt, 0, 0.9), lt);
      const u = seg(lt, 0.5, d - 0.4) * N, i = Math.min(N - 1, Math.floor(u)), f = u - Math.floor(u);
      const a = i === 0 ? [X0 - 60, Y0] : stepTop(X0, Y0, SW, SH, Math.max(0, i - 1)), b = stepTop(X0, Y0, SW, SH, i);
      const [fx, fy] = u >= N ? stepTop(X0, Y0, SW, SH, N - 1) : [lerp(a[0], b[0], f), lerp(a[1], b[1], f) - Math.sin(f * Math.PI) * 50];
      G.figure(fx, fy, 1.05, { hat: 'crown', robe: P.green, t: lt, walk: u < N ? 1 : 0, arm: u >= N ? 0.8 : 0 });
      G.stamp(880, 340, 70, seg(lt, d - 0.45, d + 0.3), { mark: 'ring' }); G.wind(lt, 60, 200, 1020, 500, 0.4, 3);
      G.sheetTop(lt, r); G.tag('ACCOUNTS SAY', 400, 250, { sc: pop(lt, 0.1, 0.3) }); } });
  cue(t8, 'slide', { gain: 0.5 }); cue(t8 + 0.1, 'pop', { gain: 0.5 }); for (let i = 0; i < N; i++) cue(t8 + 0.5 + (i + 0.5) * (t9 - t8 - 0.9) / N, 'tock', { gain: 0.4 });
  cue(t9 - 0.3, 'thud', { gain: 0.6 });

  add({ id: 'a9_rivals', at: t9, cam: [540, 980], zoom: 0.1, note: '"killing rival claimants": Cankili on the throne above, a row of small turban/hood claimants below blotted out one by one by ink blots',
    draw: (lt) => { const r = G.sheet(lt, {}); G.rhumb(540, 560, 900, 1, { a: 0.2 });
      dais(300, 760, 3, 160, 70, 1, lt); G.figure(700, 760 - 3 * 70, 0.75, { hat: 'crown', robe: P.green, t: lt, arm: 0.6 + Math.sin(lt * 3) * 0.1 });
      line([[100, 1330], [980, 1330]], P.ink, 5);
      for (let i = 0; i < 5; i++) { const x = 170 + i * 185, tb = 0.2 + i * 0.26, gone = seg(lt, tb + 0.1, tb + 0.35);
        G.figure(x, 1330 + Math.sin(lt * 4 + i) * 3, 0.7, { hat: i % 2 ? 'hood' : 'turban', robe: [P.sepia, P.ochre, P.vellumDk, P.stain, P.sepia][i], t: lt, a: 1 - gone });
        G.blot(x, 1200, 95, seg(lt, tb, tb + 0.45), i + 3); }
      G.sheetTop(lt, r); } });
  cue(t9, 'whoosh', { gain: 0.4 }); for (let i = 0; i < 5; i++) cue(t9 + 0.2 + i * 0.26, 'plop', { gain: 0.6, pan: -0.6 + i * 0.3 });

  add({ id: 'a10_princes', at: t10, cam: [540, 760], zoom: 0.12, note: '"princes of royal blood": ink line of descent branches to small princes; blots fall, a red X seal slams on the tree; green Cankili alone on top',
    draw: (lt) => { const r = G.sheet(lt, { lift: 0.2 });
      dais(380, 600, 2, 160, 40, 1, lt); G.figure(620, 520, 0.8, { hat: 'crown', robe: P.green, t: lt, arm: 0.3 });
      const br = [[200, 1260], [370, 1260], [710, 1260], [880, 1260]], pg = seg(lt, 0, 0.6);
      route([[540, 620], [540, 900]], pg * 2, P.sepia, 6); br.forEach(([x, y], i) => { route([[540, 900], [x, 940], [x, y - 220]], seg(pg, 0.4, 1), P.sepia, 5);
        const tb = 0.55 + i * 0.2; G.figure(x, y, 0.6, { hat: 'turban', robe: P.gold, t: lt, a: eo(seg(lt, 0.3, 0.6)) * (1 - seg(lt, tb + 0.1, tb + 0.3)) }); G.blot(x, y - 110, 85, seg(lt, tb, tb + 0.4), i + 11); });
      G.stamp(540, 1030, 120, seg(lt, 1.25, 2.0), { mark: 'cross' }); G.wind(lt, 60, 1300, 1020, 1420, 0.5, 9);
      G.sheetTop(lt, r); G.flash(0.35 * clamp(1 - (lt - 1.51) / 0.2) * (lt > 1.51), P.wax); } });
  cue(t10, 'slide', { gain: 0.4 }); for (let i = 0; i < 4; i++) cue(t10 + 0.55 + i * 0.2, 'plop', { gain: 0.5, pan: -0.6 + i * 0.4 }); cue(t10 + 1.51, 'slam', { gain: 0.8 });

  // ---- line 3: Portuguese want Jaffna; Thanjavur soldiers called in ----
  add({ id: 'a11_carracks', at: t11, cam: [520, 950], zoom: 0.1, note: '"The Portuguese wanted Jaffna": three red-pennant carracks glide in from the south-west, red ink route arrows shoot toward the Jaffna coast; PORTUGUESE tag',
    draw: (lt) => { const r = G.sheet(lt, { lift: 0.25 }); G.waves(60, 640, 880, lt, { a: 0.6, rows: 8, gap: 70, storm: 0.3 }); coasts(1, 1);
      ctx.save(); landPath(); ctx.fillStyle = rgba(P.green, 0.35); ctx.fill(); ctx.restore(); G.fort(GEO.NALLUR[0], GEO.NALLUR[1] + 40, 0.3, { t: lt });
      const R = [[[60, 1400], [300, 1150], [600, 960]], [[60, 1100], [300, 960], [490, 740]], [[260, 1450], [480, 1300], [630, 1180]]];
      R.forEach((pts, i) => { const p = seg(lt, 0.1 + i * 0.15, 1.2 + i * 0.15); route(pts, p, P.red, 8, [26, 14]);
        const q = part(pts, Math.max(0.12, p)), sp = q[q.length - 1]; G.ship(sp[0], sp[1] - 10, 0.32, lt + i, { kind: 'carrack', roll: 0.3 }); });
      G.wind(lt, 60, 1100, 1020, 1420, 0.5, 12); G.sheetTop(lt, r); G.tag('PORTUGUESE', 330, 260, { sc: pop(lt, Wd('portuguese', 3) - t11 + 0.05, 0.3), ink: P.red }); } });
  cue(t11, 'whoosh', { gain: 0.6, pan: -0.5 }); cue(t11 + 0.15, 'zip', { gain: 0.5 }); cue(t11 + 0.3, 'zip', { gain: 0.5 }); cue(Wd('portuguese', 3) + 0.05, 'pop', { gain: 0.5 }); cue(Wd('wanted', 3), 'drum', { gain: 0.5 });

  add({ id: 'a12_call', at: t12, cam: [600, 820], zoom: 0.12, note: '"Cankili called in soldiers": green Cankili before the Nallur fort raises his arm west; an ochre dashed route shoots from the India coast across the strait',
    draw: (lt) => { const r = G.sheet(lt, { lift: 0.2 }); G.waves(60, 560, 700, lt, { a: 0.5, rows: 6, gap: 60 });
      ctx.save(); ctx.globalAlpha = 0.85; coasts(1, 1); ctx.restore(); G.rhumb(GEO.STRAIT[0], GEO.STRAIT[1], 900, seg(lt, 0, 0.6), { a: 0.3 });
      G.fort(800, 900, 0.75, { t: lt, col: P.green });
      route([[280, 600], [380, 700], [500, 820], [640, 930]], seg(lt, 0.35, 1.3), P.ochre, 9, [24, 14]);
      figL(720, 1320, 1.1, { hat: 'crown', robe: P.green, t: lt, arm: eob(seg(lt, 0.1, 0.45)) * 0.9 + Math.sin(lt * 5) * 0.05 });
      G.wind(lt, 60, 1150, 1020, 1420, 0.4, 14); G.sheetTop(lt, r); G.tag('THANJAVUR', 300, 380, { sc: pop(lt, 1.0, 0.3) * 0.85, ink: mixc(P.ochre, P.ink, 0.4) }); } });
  cue(t12, 'slide', { gain: 0.5 }); cue(t12 + 0.15, 'swell', { gain: 0.5 }); cue(t12 + 0.4, 'zip', { gain: 0.6, pan: -0.4 }); cue(t12 + 1.0, 'pop', { gain: 0.5 });

  add({ id: 'a13_march', at: t13, cam: [560, 900], zoom: 0.12, note: '"from the Nayaks of Thanjavur": ochre-robed Nayak soldiers march across the strait along the dashed ochre line toward the green Nallur fort; THANJAVUR tag',
    draw: (lt) => { const r = G.sheet(lt, {}); G.waves(60, 1020, 900, lt, { a: 0.6, rows: 9, gap: 60 }); G.coast(GEO.INDIA, 1, { land: LANDI });
      const fpX = 870, fpY = 1000; G.fort(fpX, fpY, 0.6, { t: lt, col: P.green });
      const path = [[180, 640], [380, 960], [580, 1110], [760, 1040]]; route(path, 1, P.ochre, 9, [24, 14]);
      for (let i = 0; i < 6; i++) { const u = clamp(0.05 + i * 0.1 + lt * 0.2), q = part(path, u), sp = q[q.length - 1];
        G.figure(sp[0], sp[1] + 20, 0.55, { hat: 'turban', robe: P.ochre, walk: 1 + i, t: lt }); line([[sp[0] + 40, sp[1] - 120], [sp[0] + 52, sp[1] - 230]], P.ink, 5); }
      G.wind(lt, 60, 250, 1020, 500, 0.5, 16); G.sheetTop(lt, r); G.tag('THANJAVUR', 330, 300, { sc: pop(lt, Wd('thanjavur', 3) - t13, 0.3), ink: mixc(P.ochre, P.ink, 0.4) }); } });
  for (let i = 0; t13 + i * 0.45 < L(4) - 0.2; i++) cue(t13 + i * 0.45, 'drum', { gain: 0.55, pan: -0.3 + i * 0.1 });
  cue(t13, 'whoosh', { gain: 0.4 }); cue(Wd('thanjavur', 3), 'pop', { gain: 0.5 });
}
