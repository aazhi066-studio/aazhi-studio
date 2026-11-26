// v25 worker C: script lines 8-10 (the disputed year, the line ends, the question + wind rewatch loop).
import { ctx, clamp, lerp, seg, eo, eio, eob, TAU, circle, line } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { rgba } from './art.js';
import * as G from './chart.js';
const P = G.PAL, GEO = G.GEO;

// ---------- local helpers ----------
// tag that pops in (overshoot) at local time t0
function pop(text, x, y, lt, t0, o = {}) {
  if (lt < t0) return; G.tag(text, x, y, { ...o, sc: (o.sc ?? 1) * eob(clamp((lt - t0) / 0.3)) });
}
// tag that slams down (shrinks from big, shakes)
function slam(text, x, y, lt, t0, o = {}) {
  if (lt < t0) return; const k = eo(clamp((lt - t0) / 0.2)), sh = (1 - clamp((lt - t0) / 0.35)) * 10;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  G.tag(text, x + Math.sin(lt * 90) * sh, y + Math.cos(lt * 77) * sh, { ...o, sc: (o.sc ?? 1) * lerp(2.4, 1, k) }); ctx.restore();
}
// stamp progress so that the impact (p = 0.35) lands exactly at local time ti
const sp = (lt, ti, dur = 0.6) => clamp((lt - ti) / dur + 0.35);
// needle angle (0 = north, clockwise) from a rose at (rx, ry) to a point
const aim = (rx, ry, x, y) => Math.atan2(x - rx, -(y - ry));
// shake offset for impacts
const shake = (lt, ti, amp = 12) => { const k = lt > ti ? 1 - clamp((lt - ti) / 0.3) : 0; return [Math.sin(lt * 97) * amp * k, Math.cos(lt * 83) * amp * k]; };
// faint chart backdrop: rhumb lines + both coasts
function chartBg(lt, o = {}) {
  G.rhumb(o.rx ?? 540, o.ry ?? 980, 1500, o.rp ?? 1, { a: o.ra ?? 0.35, rot: o.rot ?? 0.05 });
  G.coast(GEO.INDIA, o.cp ?? 1, { land: rgba(P.stain, 0.35) });
  G.coast(GEO.JAFFNA, o.cp ?? 1, { land: rgba(P.green, 0.18), hatchSide: -1 });
  if (o.waves !== false) G.waves(100, 1020, o.wy ?? 1180, lt, { rows: 3, a: 0.4, storm: o.storm ?? 0 });
}
// genealogy-like ink line: nodes on a trunk with short branches (no text)
const NODES = [170, 300, 430, 560, 690, 820, 930];
function lineage(y, p, col = P.green, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; const xe = lerp(150, 940, eo(clamp(p)));
  line([[150, y], [xe, y]], col, 9);
  NODES.forEach((x, i) => { if (x > xe) return; const up = i % 2 ? -1 : 1;
    line([[x, y], [x, y + up * 90], [x + 50, y + up * 90]], rgba(col, 0.8), 5); circle(x + 50, y + up * 90, 14, col); circle(x + 50, y + up * 90, 7, P.vellumHi);
    circle(x, y, 24, P.ink); circle(x, y, 18, col); circle(x, y, 8, P.vellumHi); });
  ctx.restore();
}
// green pennant on a pole; drop 0..1 lowers it down the pole
function pole(x, y, h, lt, drop = 0, seed = 0) {
  line([[x, y], [x, y - h]], P.ink, 8); circle(x, y - h, 9, P.gold);
  const py = lerp(y - h + 6, y - 40, eio(clamp(drop)));
  ctx.save(); ctx.translate(x, py); ctx.rotate(drop * 0.9); G.pennant(0, 0, 120 * (1 - drop * 0.4), lt + seed, P.green); ctx.restore();
}
// big ink arrow pointing down, drawn with p
function arrowDown(x, y0, y1, p, lt) {
  if (p <= 0) return; const yy = lerp(y0, y1, eo(clamp(p))) + Math.sin(lt * 9) * 12 * clamp(p * 2 - 1);
  line([[x, y0], [x + Math.sin(lt * 3) * 10, (y0 + yy) / 2], [x, yy]], P.ink, 26);
  ctx.beginPath(); ctx.moveTo(x - 80, yy - 70); ctx.lineTo(x, yy + 40); ctx.lineTo(x + 80, yy - 70); ctx.closePath(); ctx.fillStyle = P.ink; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 52, yy - 50); ctx.lineTo(x, yy + 14); ctx.lineTo(x + 52, yy - 50); ctx.closePath(); ctx.fillStyle = P.green; ctx.fill();
}

export function buildC(add, cue) {
  const t8 = L(8), disp = Wd('disputed', 8), y19 = Wd('Sixteen', 8), orW = Wd('or', 8), nin = Wd('nineteen', 8), one = Wd('one', 8);
  const t9 = L(9), acc = Wd('accounts', 9), were = Wd('were', 9), monks = Wd('monks', 9), no = Wd('No', 9), heirs = Wd('heirs', 9), ended = Wd('ended', 9);
  const t10 = L(10), usu = Wd('usurper', 10), def = Wd('defender', 10), tell = Wd('Tell', 10), below = Wd('below', 10), watch = Wd('Watch', 10), wind = Wd('wind', 10);
  const c8c = orW + 0.4, c10c = Math.max(tell + 1.6, watch + 0.55);
  const Y1 = [330, 500], Y2 = [730, 780], RS = [540, 1130];

  // ---- line 8: the disputed year ----
  add({ id: 'c8a', at: t8, cam: [540, 900], zoom: 0.08, note: 'DISPUTED: chart, rhumb lines shoot out of a big compass rose, needle spins undecided; wind gust; tag slams', draw: (lt, d) => {
    const r = G.sheet(lt, { lift: 0.25, seed: 11 }); chartBg(lt, { rp: seg(lt, 0, 0.7), ra: 0.5 });
    G.rose(540, 900, 260, lt, { spin: lt * 7 + Math.sin(lt * 3) * 2, rot: lt * 0.05 });
    G.wind(lt, 60, 300, 1020, 700, seg(lt, 0.2, 0.8), 3, { n: 10 }); G.sheetTop(lt, r);
    slam('DISPUTED', 540, 250, lt, disp - t8, { size: 56 });
  } });
  cue(t8, 'whoosh', { gain: 0.7 }); cue(t8 + 0.1, 'zip', { gain: 0.4, dur: 0.6 }); cue(disp, 'slam', { gain: 0.8 });

  add({ id: 'c8b', at: y19, cam: [360, 760], zoom: 0.12, note: "big ink '1619' writes itself; needle swings to it; wax seal '?' slams on it", draw: (lt) => {
    const [sx, sy] = shake(lt, nin + 0.35 - y19);
    ctx.save(); ctx.translate(sx, sy);
    const r = G.sheet(lt, { seed: 12 }); chartBg(lt, { ra: 0.3 });
    G.title('1619', Y1[0], Y1[1], 190, seg(lt, 0, 0.55));
    G.rose(RS[0], RS[1], 170, lt, { spin: lerp(lt * 6, aim(RS[0], RS[1], Y1[0], Y1[1]), eo(seg(lt, 0.1, 0.7))) + Math.sin(lt * 14) * 0.08 * (1 - seg(lt, 0.7, 1.4)) });
    G.stamp(Y1[0] + 170, Y1[1] + 100, 72, sp(lt, nin + 0.35 - y19), { text: '?', mark: 'blank' });
    G.wind(lt, 60, 850, 1020, 1000, 0.5, 7, { n: 6 }); G.sheetTop(lt, r); ctx.restore();
    G.tag('DISPUTED', 540, 200, { size: 40, sc: 0.85 });
  } });
  cue(y19, 'chisel', { gain: 0.5 }); cue(y19 + 0.2, 'tock', { gain: 0.5, pan: -0.3 }); cue(nin + 0.35, 'slam', { gain: 0.75, pan: -0.3 });

  add({ id: 'c8c', at: c8c, cam: [600, 820], zoom: 0.1, note: "'1621' writes itself; needle swings between both years; second '?' seal; strong wind gust", draw: (lt) => {
    const ti = one - c8c + 0.1, [sx, sy] = shake(lt, ti);
    ctx.save(); ctx.translate(sx, sy);
    const r = G.sheet(lt, { seed: 12, lift: 0.3 * seg(lt, 0.6, 1.4) }); chartBg(lt, { ra: 0.3 });
    G.title('1619', Y1[0], Y1[1], 190, 1); G.stamp(Y1[0] + 170, Y1[1] + 100, 72, 1, { text: '?', mark: 'blank' });
    G.title('1621', Y2[0], Y2[1], 190, seg(lt, 0, 0.5));
    const a1 = aim(RS[0], RS[1], Y1[0], Y1[1]), a2 = aim(RS[0], RS[1], Y2[0], Y2[1]);
    G.rose(RS[0], RS[1], 170, lt, { spin: lerp(a1, a2, 0.5 + 0.5 * Math.sin(lt * 5 - 1.2)) });
    G.stamp(Y2[0] + 150, Y2[1] + 100, 72, sp(lt, ti), { text: '?', mark: 'blank' });
    G.wind(lt, 60, 300, 1020, 1300, seg(lt, 0.3, 1), 9, { n: 14, speed: 1.4 }); G.sheetTop(lt, r); ctx.restore();
    G.tag('DISPUTED', 540, 200, { size: 40, sc: 0.85 });
  } });
  cue(c8c, 'slide', { gain: 0.5, pan: 0.3 }); cue(one + 0.1, 'slam', { gain: 0.8, pan: 0.3 }); cue(c8c + 0.4, 'whoosh', { gain: 0.6, dur: 1 });

  // ---- line 9: the royals take holy orders, the line ends ----
  const monkRow = (lt, x0, y, s, n, sp2, fade) => { for (let i = 0; i < n; i++) {
    const x = x0 + i * 150 * s + lt * sp2, q = clamp(1 - fade * (x - 700) / 400);
    G.figure(x, y - i * 6, s * (1 - i * 0.04), { hat: 'hood', robe: P.sepia, walk: i * 1.7, t: lt * 0.45, a: q }); } };
  add({ id: 'c9a', at: t9, cam: [540, 1000], zoom: 0.09, note: 'ACCOUNTS SAY: dusk-washed chart, a row of small hooded silhouettes walking slowly away along the coast', draw: (lt) => {
    const r = G.sheet(lt, { seed: 21, ground: [rgba(P.storm, 0.15), rgba(P.stormDk, 0.55)] });
    chartBg(lt, { ra: 0.25, wy: 1260 }); line([[60, 1120], [1020, 1100]], rgba(P.ink, 0.6), 5);
    for (let k = 0; k < 6; k++) line([[80 + k * 160, 1140], [140 + k * 160, 1150]], rgba(P.ink, 0.3), 3);
    monkRow(lt, 120, 1115, 0.85, 5, 55, 0.4);
    G.wind(lt, 60, 400, 1020, 700, 0.3, 13, { n: 5, speed: 0.6 }); G.sheetTop(lt, r);
    pop('ACCOUNTS SAY', 540, 240, lt, acc - t9, { size: 44 });
  } });
  cue(t9, 'whoosh', { gain: 0.5 }); cue(t9 + 0.1, 'swell', { gain: 0.35, dur: 2 }); cue(acc, 'pop', { gain: 0.55 });

  add({ id: 'c9b', at: were, cam: [680, 820], zoom: 0.12, note: 'hooded figures walk up a path into the distance, shrinking, past green pennants on poles', draw: (lt, d) => {
    const r = G.sheet(lt, { seed: 22, ground: [rgba(P.storm, 0.1), rgba(P.stormDk, 0.4)] });
    G.rhumb(780, 520, 1400, 1, { a: 0.3 }); G.coast(GEO.JAFFNA, 1, { land: rgba(P.green, 0.2), hatchSide: -1 });
    line([[180, 1380], [500, 1000], [700, 760], [780, 560]], rgba(P.sepia, 0.5), 30);
    [[260, 900], [420, 720], [880, 900]].forEach(([x, y], i) => pole(x, y, 300, lt, 0, i));
    for (let i = 0; i < 5; i++) { const u = clamp(0.1 + i * 0.13 + lt / d * 0.28), x = lerp(180, 780, eio(u)) - 30, y = lerp(1380, 580, u);
      G.figure(x, y, lerp(1, 0.25, u), { hat: 'hood', robe: P.sepia, walk: i * 2, t: lt * 0.5, a: clamp((0.95 - u) * 4) }); }
    G.sheetTop(lt, r); G.tag('ACCOUNTS SAY', 540, 200, { size: 40, sc: 0.85 });
  } });
  cue(were, 'slide', { gain: 0.5, pan: 0.2 }); cue(monks, 'bell', { gain: 0.4 });

  add({ id: 'c9c', at: no, cam: [700, 820], zoom: 0.1, note: 'No heirs: pennants lowered + blotted; the green royal line is cut by a big X wax seal, the vellum burns from its end', draw: (lt, d) => {
    const ti = ended - no, [sx, sy] = shake(lt, ti, 18);
    ctx.save(); ctx.translate(sx, sy);
    const r = G.sheet(lt, { seed: 23 }); G.rhumb(540, 900, 1400, 1, { a: 0.25 });
    [200, 420, 640, 860].forEach((x, i) => { pole(x, 640, 330, lt, seg(lt, 0.05 + i * 0.08, 0.5 + i * 0.08), i);
      G.blot(x + 50, 610, 30, seg(lt, heirs - no + i * 0.07, heirs - no + 0.4 + i * 0.07), i + 4); });
    lineage(980, seg(lt, 0, 0.4));
    G.burn(945, 980, seg(lt, ti + 0.15, d + 0.6), 330, 5);
    G.stamp(720, 980, 120, sp(lt, ti), { mark: 'cross' });
    G.sheetTop(lt, r); ctx.restore(); G.flash(0.5 * (1 - seg(lt, ti, ti + 0.2)) * (lt > ti ? 1 : 0), P.waxHi);
  } });
  cue(no, 'thud', { gain: 0.5 }); cue(heirs, 'plop', { gain: 0.6 }); cue(heirs + 0.15, 'plop', { gain: 0.4, pan: 0.3 });
  cue(ended, 'slam', { gain: 1 }); cue(ended + 0.2, 'rumble', { gain: 0.5, dur: 1.2 });

  // ---- line 10: the question, tell me below, watch the wind ----
  const coastKing = (lt, s = 1.25, cx = 540) => {
    G.coast(GEO.JAFFNA, 1, { land: rgba(P.green, 0.25), hatchSide: -1 }); G.waves(60, 1020, 1240, lt, { rows: 4, a: 0.5, storm: 0.3 });
    ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(cx, 1200, 130 * s, 18 * s, 0, 0, TAU); ctx.fill(); ctx.restore();
    G.figure(cx, 1200, s, { hat: 'crown', robe: P.green, t: lt, arm: 0.1 * Math.sin(lt * 1.5) });
  };
  const scales = (lt, sU, sD, x = 540, y = 330) => { const tilt = 0.12 * Math.sin(lt * 2.3) + 0.08 * (sD - sU), c = Math.cos(tilt), s = Math.sin(tilt), hw = 270;
    line([[x, y - 40], [x, y + 20]], P.ink, 10); circle(x, y - 40, 14, P.gold);
    const ends = [[x - hw * c, y - hw * s], [x + hw * c, y + hw * s]]; line(ends, P.ink, 12); circle(x, y, 16, P.gold);
    ends.forEach(([ex, ey], i) => { const sc = i ? sD : sU; if (sc <= 0) return; line([[ex, ey], [ex, ey + 90]], P.ink, 4);
      G.tag(i ? 'DEFENDER?' : 'USURPER?', ex, ey + 120, { size: 36, sc: sc * 0.9, rot: Math.sin(lt * 3 + i) * 0.05, col: i ? '#D6E6C8' : P.vellumHi }); }); };
  add({ id: 'c10a', at: t10, cam: [540, 760], zoom: 0.1, note: 'crowned green figure on the Jaffna coast at storm dusk; USURPER? / DEFENDER? tags hang from a swinging scale beam', draw: (lt) => {
    const r = G.sheet(lt, { seed: 31, ground: [P.storm, P.stormDk], groundA: 0.55 });
    G.rhumb(540, 1200, 1500, 1, { a: 0.3 }); coastKing(lt);
    G.wind(lt, 60, 700, 1020, 900, 0.35, 17, { n: 5, col: P.vellumHi });
    scales(lt, eob(clamp((lt - (usu - t10)) / 0.35)), eob(clamp((lt - (def - t10)) / 0.35)));
    G.sheetTop(lt, r);
  } });
  cue(t10, 'whoosh', { gain: 0.6 }); cue(usu, 'pop', { gain: 0.6, pan: -0.4 }); cue(def, 'pop', { gain: 0.6, pan: 0.4 }); cue(def + 0.3, 'tock', { gain: 0.4 });

  add({ id: 'c10b', at: tell, cam: [540, 1150], zoom: 0.14, note: 'Tell me below: scale and figure shift up-left, a big green-ink arrow draws down toward the captions', draw: (lt) => {
    const r = G.sheet(lt, { seed: 31, ground: [P.storm, P.stormDk], groundA: 0.55 });
    G.rhumb(540, 1200, 1500, 1, { a: 0.3 }); ctx.save(); ctx.translate(-160, -40); coastKing(lt, 0.9, 540); ctx.restore();
    scales(lt, 1, 1, 540, 330); arrowDown(800, 760, 1360, seg(lt, below - tell - 0.3, below - tell + 0.25), lt);
    G.sheetTop(lt, r);
  } });
  cue(tell, 'slide', { gain: 0.5 }); cue(below - 0.05, 'zip', { gain: 0.6 }); cue(below + 0.25, 'thud', { gain: 0.6 });

  add({ id: 'c10c', at: c10c, cam: [540, 860], zoom: 0.16, note: 'WIND: huge gust sweeps the whole chart, sheet lifts; needle spins and stops on the Jaffna coast; the green boat is pushed back (rewatch loop)', draw: (lt, d) => {
    const r = G.sheet(lt, { seed: 3, lift: 0.8, ground: [P.storm, P.stormDk], groundA: 0.3 * (1 - seg(lt, 0, d)) });
    chartBg(lt, { ra: 0.45, storm: 0.8, wy: 1150 });
    const bx = lerp(360, 700, eio(seg(lt, 0.2, d))), by = lerp(620, 400, eio(seg(lt, 0.2, d)));
    G.ship(bx, by, 0.6, lt, { kind: 'boat', dir: -1, roll: 0.9 });
    const fin = aim(320, 1000, GEO.POINT[0], GEO.POINT[1]);
    G.rose(320, 1000, 180, lt, { spin: fin + (1 - eo(seg(lt, 0, wind - c10c + 0.4))) * TAU * 3 });
    const k = seg(lt, wind - c10c + 0.4, wind - c10c + 0.8); if (k > 0) { ctx.strokeStyle = rgba(P.waxHi, 0.9 * (1 - k * 0.4)); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(GEO.POINT[0], GEO.POINT[1], 20 + 40 * eo(k), 0, TAU); ctx.stroke(); circle(GEO.POINT[0], GEO.POINT[1], 12, P.green); }
    G.wind(lt, 40, 200, 1040, 1420, 1, 21, { n: 22, speed: 1.8 }); G.wind(lt + 0.5, 40, 300, 1040, 1300, 0.6, 41, { n: 10, speed: 2.4 });
    G.sheetTop(lt, r); G.rain(lt, 0.2);
  } });
  cue(c10c, 'whoosh', { gain: 1, dur: 1.5 }); cue(c10c + 0.1, 'rumble', { gain: 0.5, dur: 1.6 }); cue(wind, 'swell', { gain: 0.6, dur: 1.2 });
  cue(wind + 0.4, 'tock', { gain: 0.7 });
}
