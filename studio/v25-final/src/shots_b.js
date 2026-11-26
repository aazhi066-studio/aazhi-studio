// Worker B: script lines 4-7 (L(4) .. L(8)). Nallur falls and burns; the flight by boat and the wind that drove it back;
// captured with family and shipped to Goa; two versions of the end (rope vs blade, wax seals). "Storm Portolan & Wax Seal".
import * as G from './chart.js';
import { L, Wd } from './core/timing.js';
import { ctx, clamp, lerp, seg, eo, eio, eob, rnd, line } from './core/lib.js';
import { rgba, smoke } from './art.js';

const P = G.PAL, STORM = [P.storm, P.stormDk];
const shake = (t, a, f = 40) => [Math.sin(t * f) * a, Math.cos(t * f * 1.3) * a];
const pop = (txt, x, y, lt, at, o = {}) => { const q = clamp((lt - at) / 0.35); if (q > 0) G.tag(txt, x, y, { ...o, sc: eob(q) * (o.sc ?? 1) }); };
// quadratic bezier samples, and a progressive cut along a polyline (returns drawn pts, head point and heading)
const bez = (a, b, c, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * a[0] + 2 * u * v * b[0] + u * u * c[0], v * v * a[1] + 2 * u * v * b[1] + u * u * c[1]]; });
function along(pts, p) {
  p = clamp(p); let tot = 0; const Ls = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); Ls.push(d); tot += d; }
  let left = tot * p; const out = [pts[0]]; let ang = 0;
  for (let i = 1; i < pts.length; i++) { const d = Ls[i - 1], a = pts[i - 1], b = pts[i]; ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    if (d <= left) { out.push(b); left -= d; } else { const u = left / d; out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]); break; } }
  return { out, head: out[out.length - 1], ang };
}
function route(pts, p, col, w = 7, dash = null, a = 1) {
  if (p <= 0) return; const { out } = along(pts, p); ctx.save(); ctx.globalAlpha *= a; if (dash) ctx.setLineDash(dash); line(out, col, w); ctx.restore();
}
// storm-chart geography zoomed onto the strait between Jaffna and South India
const OUT = bez([590, 880], [440, 900], [300, 800]);
const BACK = [...bez([300, 800], [170, 760], [250, 650]), ...bez([250, 650], [330, 590], [470, 700]).slice(1)];
function stormMap(t, storm, lt) {
  ctx.save(); ctx.translate(540, 820); ctx.scale(1.7, 1.7); ctx.translate(-380, -740);
  for (let k = 0; k < 9; k++) G.waves(-200, 1200, 520 + k * 60, t + k * 0.3, { rows: 1, storm, col: P.sea, a: 0.45 });
  G.coast(G.GEO.INDIA, 1, { land: '#33454D', col: P.vellumDk, w: 4 });
  G.coast(G.GEO.JAFFNA, 1, { land: '#33454D', col: P.vellumDk, w: 4, closed: true, hatchSide: -1 });
  ctx.restore();
}
const toMap = ([x, y]) => [540 + (x - 380) * 1.7, 820 + (y - 740) * 1.7];

export function buildB(add, cue) {
  // ---------------- line 4: 1619, the march on Nallur, the kingdom falls ----------------
  const t0 = L(4), tPh = Wd('Phillippe', 4), tNal = Wd('Nallur', 4), tFell = Wd('fell', 4);
  const MARCH = [...bez([-60, 1340], [300, 1330], [520, 1200]), ...bez([520, 1200], [640, 1120], [700, 1090]).slice(1)];
  add({ id: 'b0_a', at: t0, cam: [540, 760], zoom: 0.1, note: '"1619" ink-lettered over the chart, rhumb lines shoot out, red route begins',
    draw(lt, d) {
      const r = G.sheet(lt, { seed: 5 });
      ctx.save(); ctx.globalAlpha = 0.5; G.coast(G.GEO.INDIA, 1, { land: rgba(P.stain, 0.25) }); G.coast(G.GEO.JAFFNA, 1, { land: rgba(P.stain, 0.25), hatchSide: -1 }); ctx.restore();
      G.rhumb(540, 1120, 1150, eo(seg(lt, 0, 0.7)));
      G.fort(700, 600, 0.32, { t: lt, col: P.green });
      route([[540, 1460], [560, 1250], [640, 900], [700, 640]], eio(seg(lt, 0.5, d)), P.red, 8, [22, 14]);
      G.rose(540, 1120, 150, lt, { spin: 6 * (1 - eo(seg(lt, 0, 1.2))) });
      G.wind(lt, 60, 300, 1020, 520, 0.35, 4);
      G.sheetTop(lt, r);
      G.title('1619', 540, 440, 250, seg(lt, 0.1, 1.0));
      G.flash(0.5 * (1 - seg(lt, 0, 0.18)));
    } });
  cue(t0, 'slam', { gain: 0.9 }); cue(t0 + 0.05, 'whoosh', { gain: 0.5 }); cue(t0 + 0.3, 'chisel', { gain: 0.4 });

  add({ id: 'b0_b', at: tPh, cam: [620, 1100], zoom: 0.12, note: 'red-helmeted Portuguese column marches along red ink route to the green Nallur fort',
    draw(lt, d, t) {
      const r = G.sheet(lt, { seed: 7, rot: -0.01 });
      G.rhumb(170, 330, 1400, 1, { a: 0.35 }); G.rose(170, 330, 90, lt, { spin: Math.sin(lt * 2) * 0.3 });
      for (let i = 0; i < 6; i++) line([[90 + i * 150, 1400 - (i % 2) * 20], [160 + i * 150, 1380]], rgba(P.sepia, 0.35), 3);
      G.fort(820, 1080, 0.85, { t, col: P.green });
      route(MARCH, 1, rgba(P.red, 0.35), 6);
      const hp = lerp(0.25, 0.72, eio(seg(lt, 0, d)));
      route(MARCH, hp, P.red, 9, [24, 12]);
      for (let k = 6; k >= 0; k--) { const { head } = along(MARCH, hp - 0.08 - k * 0.075); if (hp - 0.08 - k * 0.075 <= 0) continue;
        G.figure(head[0], head[1], 0.5, { hat: 'helm', robe: P.red, walk: k * 1.3, t }); }
      G.wind(lt, 60, 400, 1020, 800, 0.3, 9);
      G.sheetTop(lt, r);
      G.title('1619', 840, 260, 120, 1);
      pop('PORTUGUESE RECORDS', 540, 1420, lt, 0.25, { sc: 0.7 });
    } });
  cue(tPh, 'whoosh', { gain: 0.6 }); cue(tPh + 0.1, 'drum', { gain: 0.6 }); cue(tPh + 0.8, 'drum', { gain: 0.5 });

  add({ id: 'b0_c', at: tNal, cam: [540, 900], zoom: 0.08, note: 'Nallur fort besieged; on "fell" it burns and falls, vellum burns through, red pennants',
    draw(lt, d, t) {
      const fl = seg(t, tFell, tFell + 0.6), sh = t > tFell ? Math.max(0, 1 - (t - tFell) / 0.6) : 0, [sx, sy] = shake(t, 14 * sh);
      const r = G.sheet(lt, { seed: 9, rot: sx * 0.002 });
      ctx.save(); ctx.translate(sx, sy);
      G.rhumb(540, 950, 1300, 1, { a: 0.3 });
      route([[60, 1330], [400, 1260], [540, 1180]], 1, P.red, 9, [24, 12]);
      if (fl > 0) smoke(540, 760, t, 8, '40,30,25', 0.4 * fl, 140, 600);
      G.fort(540, 1080, 1.35, { t, col: fl > 0.15 ? P.red : P.green, burning: eo(fl), fallen: eob(fl) * 0.8 });
      const adv = eo(seg(lt, 0, d)) * 70;
      for (let k = 0; k < 4; k++) { G.figure(90 + k * 80 + adv, 1380, 0.62, { hat: 'helm', robe: P.red, walk: k, t });
        G.figure(990 - k * 80 - adv, 1380, 0.62, { hat: 'helm', robe: P.red, walk: k + 2, t }); }
      ctx.restore();
      G.burn(1000, 200, seg(t, tFell, tFell + 0.9), 420, 3); G.burn(70, 1420, seg(t, tFell + 0.1, tFell + 1), 380, 8);
      G.wind(lt, 60, 300, 1020, 700, 0.3, 2);
      G.sheetTop(lt, r);
      G.flash(0.7 * clamp(1 - (t - tFell) / 0.25) * (t > tFell ? 1 : 0), '#FFD9A0');
    } });
  cue(tNal, 'drum', { gain: 0.8 }); cue(tNal + 0.05, 'whoosh', { gain: 0.4 }); cue(tFell, 'slam', { gain: 1 }); cue(tFell + 0.05, 'rumble', { gain: 0.8, dur: 1.2 });

  // ---------------- line 5: fled by boat; the winds drove him back ----------------
  const t5 = L(5), tAcc = Wd('Accounts', 5) - 0.05, tWind = Wd('winds', 5), tDrove = Wd('drove', 5);
  const boatAt = (pts, p, dir, lt, roll, s = 0.45) => { const { head } = along(pts, p); const [x, y] = toMap(head); G.ship(x, y + 10, s, lt, { kind: 'boat', dir, roll }); };
  add({ id: 'b0_d', at: t5, cam: [600, 900], zoom: 0.12, note: 'storm night chart; Cankili\'s green boat pushes out from Jaffna toward South India, dashed green route',
    draw(lt, d, t) {
      const r = G.sheet(lt, { seed: 11, ground: STORM });
      stormMap(t, 0.3, lt);
      const p = lerp(0, 0.72, eio(seg(lt, 0.1, d)));
      route(OUT.map(toMap), p, P.greenHi, 8, [20, 14]);
      boatAt(OUT, p, -1, lt, 0.3);
      G.fort(830, 470, 0.35, { t, col: P.red, burning: 0.5, fallen: 0.6 });
      G.rose(230, 1290, 100, lt, { spin: Math.sin(lt * 3) * 0.5 });
      G.rain(t, 0.3, 2); G.wind(lt, 60, 200, 1020, 600, 0.35, 5, { col: P.vellumHi });
      G.sheetTop(lt, r, { lamp: 0.5 });
      pop('SOUTH INDIA', 300, 330, lt, 0.9, { sc: 0.7 });
    } });
  cue(t5, 'whoosh', { gain: 0.7 }); cue(t5 + 0.1, 'swell', { gain: 0.4, dur: 2 }); cue(Wd('boat', 5), 'plop', { gain: 0.5 });

  add({ id: 'b0_e', at: tAcc, cam: [540, 1000], zoom: 0.14, note: 'ACCOUNTS SAY; first gusts hit, compass needle starts to spin, boat rolls',
    draw(lt, d, t) {
      const g = seg(t, tWind - 0.15, tWind + 0.3);
      const r = G.sheet(lt, { seed: 11, ground: STORM, lift: 0.5 * g });
      stormMap(t, 0.4 + 0.4 * g, lt);
      route(OUT.map(toMap), 0.8, P.greenHi, 8, [20, 14]);
      boatAt(OUT, lerp(0.72, 0.8, eo(seg(lt, 0, d))), -1, lt, 0.4 + g);
      G.rain(t, 0.45 + 0.3 * g, 3);
      G.wind(t, 60, 250, 1020, 1350, g, 7, { col: P.vellumHi, n: 16, speed: 1.5 });
      G.rose(540, 1180, 170, lt, { spin: lt * lt * 14 + Math.sin(lt * 9) * 0.4 });
      G.sheetTop(lt, r, { lamp: 0.5 });
      pop('ACCOUNTS SAY', 540, 250, lt, 0.05);
      G.title('WIND', 540, 430, 140, seg(t, tWind, tWind + 0.35), { col: P.vellumHi, stroke: rgba(P.stormDk, 0.9) });
    } });
  cue(tAcc, 'pop', { gain: 0.6 }); cue(tWind - 0.1, 'whoosh', { gain: 1, dur: 1 }); cue(tWind, 'zip', { gain: 0.5 });

  add({ id: 'b0_f', at: tDrove, cam: [480, 820], zoom: 0.16, note: 'KEY: huge gusts, lightning, sheet lifts, needle spins wild; the boat is driven back, route curls to Jaffna',
    draw(lt, d, t) {
      const [sx, sy] = shake(t, 6);
      const r = G.sheet(lt, { seed: 11, ground: STORM, lift: 1 });
      ctx.save(); ctx.translate(sx, sy);
      stormMap(t, 1, lt);
      route(OUT.map(toMap), 1, rgba(P.greenHi, 0.35), 7, [20, 14]);
      const p = eio(seg(lt, 0.05, d * 0.95));
      route(BACK.map(toMap), p, P.greenHi, 10);
      const { ang } = along(BACK, p); boatAt(BACK, p, Math.cos(ang) < 0 ? -1 : 1, lt * 1.6, 1.6, 0.5);
      ctx.restore();
      G.wind(t, 40, 200, 1040, 1400, 1, 21, { col: P.vellumHi, n: 22, speed: 2.4 });
      G.wind(t + 0.4, 40, 400, 1040, 1200, 0.7, 33, { col: P.sea, n: 12, speed: 1.8 });
      G.rain(t, 1, 5);
      const bolt = (lt % 0.75) < 0.12; G.lightning(700 + rnd(Math.floor(lt / 0.75)) * 250, 120, 900, Math.floor(lt / 0.75) + 3, bolt ? 1 : 0);
      G.rose(830, 1260, 120, lt, { spin: lt * 30 + Math.sin(lt * 17) * 1.5 });
      G.sheetTop(lt, r, { lamp: 0.4 });
      G.flash(bolt ? 0.35 * (1 - (lt % 0.75) / 0.12) : 0);
      G.title('BACK', 380, 300, 150, seg(lt, 0.5, 0.9), { col: P.vellumHi, stroke: rgba(P.stormDk, 0.9) });
    } });
  cue(tDrove, 'rumble', { gain: 1, dur: 1.4 }); cue(tDrove + 0.02, 'whoosh', { gain: 0.9 }); cue(tDrove + 0.75, 'thud', { gain: 0.6 }); cue(Wd('back', 5), 'slam', { gain: 0.7 });

  // ---------------- line 6: captured with his family, shipped to Goa ----------------
  const t6 = L(6), tCap = Wd('captured', 6), tShip = Wd('shipped', 6), tGoa = Wd('Goa', 6);
  add({ id: 'b0_g', at: t6, cam: [540, 1150], zoom: 0.1, note: 'crowned green Cankili bound, small hooded family between red helmets; seal on "captured"',
    draw(lt, d, t) {
      const r = G.sheet(lt, { seed: 13 });
      G.rhumb(540, 700, 1300, 1, { a: 0.3 });
      line([[60, 1320], [1020, 1320]], rgba(P.sepia, 0.6), 4);
      const dx = lt * 25, gin = eo(seg(lt, 0, 0.5));
      G.figure(540 + dx, 1310, 1.2, { hat: 'crown', robe: P.green, chain: true, walk: 0.5, t: t * 0.6 });
      for (const [x, k] of [[330, 0], [410, 1], [680, 2], [760, 3]]) G.figure(x + dx, 1315, 0.6, { hat: 'hood', robe: '#2B3A2E', walk: k, t: t * 0.6 });
      G.figure(150 - (1 - gin) * 320 + dx, 1320, 1.15, { hat: 'helm', robe: P.red, walk: 1, t: t * 0.6 });
      G.figure(930 + (1 - gin) * 320 + dx, 1320, 1.15, { hat: 'helm', robe: P.red, walk: 2, t: t * 0.6 });
      ctx.strokeStyle = P.sepia; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(150 - (1 - gin) * 320 + dx + 80, 1110); ctx.quadraticCurveTo(350 + dx, 1180, 500 + dx, 1130); ctx.stroke();
      G.stamp(860, 470, 80, seg(t, tCap - 0.2, tCap + 0.4), { mark: 'cross' });
      G.wind(lt, 60, 300, 1020, 700, 0.3, 12);
      G.sheetTop(lt, r);
      pop('ILLUSTRATION', 540, 230, lt, 0.1, { sc: 0.7 });
    } });
  cue(t6, 'whoosh', { gain: 0.6 }); cue(tCap - 0.2 + 0.21, 'slam', { gain: 0.9 }); cue(Wd('family', 6), 'heartbeat', { gain: 0.5 });

  const GOA = [...bez([470, 780], [400, 900], [250, 950]), ...bez([250, 950], [100, 980], [-120, 930]).slice(1)];
  add({ id: 'b0_h', at: tShip, cam: [320, 1000], zoom: 0.14, note: 'red carrack sails away on a long red route off the chart edge; GOA ink-lettered, rhumb lines',
    draw(lt, d, t) {
      const r = G.sheet(lt, { seed: 15 });
      G.rhumb(860, 1280, 1300, eo(seg(lt, 0, 0.6)), { a: 0.5 });
      G.coast(G.GEO.INDIA, 1, { land: rgba(P.stain, 0.3) }); G.coast(G.GEO.JAFFNA, 1, { land: rgba(P.stain, 0.3), hatchSide: -1 });
      G.waves(60, 1020, 1000, t, { rows: 3, gap: 50, a: 0.4 });
      const p = lerp(0.1, 1, eio(seg(lt, 0, d + 0.2)));
      route(GOA, 1, rgba(P.red, 0.3), 6, [18, 12]); route(GOA, p, P.red, 9);
      const { head } = along(GOA, p); G.ship(head[0], head[1] + 8, 0.3, t, { dir: -1, roll: 0.4 });
      G.rose(860, 1280, 95, lt, { spin: -0.9 + Math.sin(lt * 3) * 0.2 });
      G.wind(lt, 60, 700, 1020, 1000, 0.45, 17, { dir: -1 });
      G.sheetTop(lt, r);
      G.title('GOA', 300, 1200, 180, seg(t, tGoa - 0.05, tGoa + 0.45), { col: P.red });
    } });
  cue(tShip, 'whoosh', { gain: 0.7 }); cue(tShip + 0.1, 'swell', { gain: 0.5, dur: 1.4 }); cue(tGoa, 'bell', { gain: 0.5 });

  // ---------------- line 7: hanged, or beheaded? (split chart, cut on "Others") ----------------
  const t7 = L(7), tHang = Wd('hanged', 7), tOth = Wd('Others', 7), tBeh = Wd('beheaded', 7);
  const split = (lt, t, right) => {
    const r = G.sheet(lt, { seed: 17 });
    G.rhumb(540, 820, 1300, 1, { a: 0.25 });
    line([[540, 140], [540, 1420]], rgba(P.ink, 0.8), 6); line([[552, 140], [552, 1420]], rgba(P.ink, 0.4), 2);
    // left: ONE VERSION — the rope swings in, a seal on "hanged"
    const rin = eob(seg(t, t7, t7 + 0.6)), sw = Math.sin((t - t7) * 3.2) * 0.35 * Math.exp(-(t - t7) * 0.5);
    G.rope(290, 760 - (1 - rin) * 700, 1.3, { rot: sw });
    G.blot(160, 1080, 50, seg(t, tHang, tHang + 0.4), 4); G.blot(420, 1240, 32, seg(t, tHang + 0.08, tHang + 0.5), 9);
    G.stamp(290, 1200, 95, seg(t, tHang - 0.21, tHang + 0.39), { text: '?' });
    // right: ANOTHER VERSION — the blade swings down, a seal on "beheaded"
    if (right) { const bin = eob(seg(t, tOth, tOth + 0.5));
      G.blade(800, 960, 1.5, { rot: lerp(-1.4, 0.15, bin) + Math.sin((t - tOth) * 4) * 0.04 });
      G.blot(950, 1100, 46, seg(t, tBeh, tBeh + 0.4), 12); G.blot(660, 1260, 30, seg(t, tBeh + 0.1, tBeh + 0.5), 15);
      G.stamp(790, 1200, 95, seg(t, tBeh - 0.21, tBeh + 0.39), { text: '?' }); }
    else { ctx.save(); ctx.globalAlpha = 0.25; G.rose(800, 820, 130, lt, { spin: lt * 2 }); ctx.restore(); }
    G.wind(lt, 60, 300, 1020, 600, 0.25, 22);
    G.sheetTop(lt, r);
    pop('ONE VERSION', 290, 300, t - t7, 0.05, { sc: 0.62 });
    if (right) pop('ANOTHER VERSION', 800, 300, t - tOth, 0.05, { sc: 0.62 });
    const fh = t > tHang ? clamp(1 - (t - tHang) / 0.2) : 0, fb = t > tBeh ? clamp(1 - (t - tBeh) / 0.2) : 0; G.flash(0.3 * Math.max(fh, fb), P.waxHi);
  };
  add({ id: 'b0_i', at: t7, cam: [300, 900], zoom: 0.12, note: 'split chart, left ONE VERSION: rope swings in, wax seal slams on "hanged"', draw: (lt, d, t) => split(lt, t, false) });
  add({ id: 'b0_j', at: tOth, cam: [760, 900], zoom: 0.12, note: 'cut on "Others": right ANOTHER VERSION, blade swings down, wax seal on "beheaded"', draw: (lt, d, t) => split(lt, t, true) });
  cue(t7, 'whoosh', { gain: 0.6 }); cue(t7 + 0.3, 'tock', { gain: 0.5 }); cue(tHang, 'slam', { gain: 1 }); cue(tHang + 0.05, 'plop', { gain: 0.5 });
  cue(tOth, 'zip', { gain: 0.7 }); cue(tOth + 0.35, 'chisel', { gain: 0.5 }); cue(tBeh, 'slam', { gain: 1 }); cue(tBeh + 0.05, 'plop', { gain: 0.5 });
}
