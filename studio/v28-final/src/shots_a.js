// v28 worker A: script lines 0-3 (hook: wax full moon over Parambu hill, three crowned kings slam in, madder siege ring snaps shut,
// the moon CRACKS; chief on the hill; generosity blooms; SANGAM AGE; Parambu hill + villages; old poems; villages float to poets;
// LEGEND jasmine creeper + chariot; Chera / Chola / Pandya, joined together, besieged the hill). Shots run 0 .. L(4).
import * as B from './batik.js';
import { L, Wd } from './core/timing.js';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { rgba } from './art.js';

const P = B.PAL;
const GIFT = [P.turmeric, P.green, P.teal, P.rose, P.ochre, P.lavender, P.madderHi, P.waxHi];

// ---------- local helpers ----------
// the village dot positions of B.hill (same formula), so dots can be lifted off the hill
function villagePts(x0, x1, y, h, n) {
  const out = [];
  for (let i = 0; i < n; i++) { const u = 0.12 + rnd(i * 3) * 0.76, hh = h * Math.pow(Math.sin(u * Math.PI), 0.8) * (0.15 + rnd(i * 7) * 0.65); out.push([lerp(x0, x1, u), y - hh]); }
  return out;
}
function dot(x, y, r = 6, a = 1) { B.glow(x, y, r * 4, '#FFE7A8', 0.5 * a); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = rgba(P.waxHi, a); ctx.fill(); }
// a jasmine vine that grows along an arbitrary path (p 0..1), leaves + flowers (fl 0..1 blooms them)
function vine(pts, p, lt, fl) {
  const wv = pts.map((q, i) => [q[0] + Math.sin(i * 1.3 + lt * 2) * 4, q[1]]);
  B.wax(wv, p, { col: P.green, w: 7 });
  const q = B.part(wv, p);
  for (let i = 2; i < q.length; i += 2) { const [px, py] = q[i], s = i % 4 ? 1 : -1;
    ctx.beginPath(); ctx.ellipse(px + s * 18, py - 4, 17, 8, s * 0.6, 0, TAU); ctx.fillStyle = P.green; ctx.fill();
    const fb = clamp(fl * 1.6 - i / q.length * 0.6); if (fb > 0) for (let k = 0; k < 5; k++) { const an = k / 5 * TAU + i;
      ctx.beginPath(); ctx.arc(px - s * 14 + Math.cos(an) * 9 * fb, py - 12 + Math.sin(an) * 9 * fb, 6 * fb, 0, TAU); ctx.fillStyle = P.waxHi; ctx.fill(); } }
}
// resample a path to many points (so vine leaves are evenly spread)
function dense(pts, n = 60) { return Array.from({ length: n + 1 }, (_, i) => { const q = B.part(pts, i / n); return q[q.length - 1]; }); }

export function buildA(add, cue) {
  const tKings = Wd('kings', 0) - 0.05, tKill = Wd('kill', 0), tGen = Wd('generous', 0) - 0.1,
    t3 = L(1) - 0.05, tPari = Wd('pari', 1) - 0.1, tPar = Wd('parambu', 1), tOld = Wd('old', 1) - 0.1, tPoems = Wd('poems', 1),
    tVil = Wd('villages', 1) - 0.1, tPoets = Wd('poets', 1),
    t7 = L(2) - 0.05, tLeg = Wd('legend', 2), tChar = Wd('chariot', 2) - 0.1, tJas = Wd('jasmine', 2), tNoth = Wd('nothing', 2) - 0.1, tClimb = Wd('climb', 2),
    t10 = L(3) - 0.05, tChera = Wd('chera', 3), tChola = Wd('chola', 3), tPandya = Wd('pandya', 3), tJoin = Wd('joined', 3) - 0.1, tTog = Wd('together', 3),
    tBes = Wd('besieged', 3) - 0.15, tHill = Wd('hill', 3);

  // ---------- line 0: HOOK ----------
  add({ id: 'a0_hook', at: 0, cam: [540, 800], zoom: 0.1,
    note: 'HOOK frame 0: night cloth, wax full moon over Parambu hill; green-bow, turmeric-tiger, teal-fish kings slam in from left/right/below, madder siege ring snaps shut, the moon CRACKS madder; madder flash + shake at 0.0',
    draw: (lt) => {
      ctx.save(); B.shake(B.shk(lt, 0, 34, 0.6)); const s2 = B.shk(lt, 0.55, 16, 0.35); ctx.translate(s2[0], s2[1]);
      B.cloth(lt, { tone: 'night' });
      B.moon(540, 340, 150, { crack: eo(seg(lt, 0.45, 1.1)) });
      B.glow(540, 340, 420, P.madder, 0.35 * seg(lt, 0.5, 1.1));
      B.hill(40, 1040, 1420, 560, 1, { dots: 1, stain: 0.5 * seg(lt, 0.5, 1.2) });
      B.figure(540, 880, 0.42, { arm: 0.3 });
      B.ring(540, 1000, 430, eo(seg(lt, 0.05, 0.55)), lt);
      const k = (d) => eo(clamp((lt + 0.12 - d) / 0.35));
      B.king(lerp(-260, 170, k(0)), 1440, 0.85, 'bow', { lt });
      B.king(lerp(1340, 910, k(0.08)), 1440, 0.85, 'fish', { lt });
      B.king(540, lerp(2000, 1450, k(0.16)), 0.72, 'tiger', { lt });
      B.vignette(0.55);
      ctx.restore();
      B.flash(0.55 * clamp(1 - lt / 0.22), P.madderHi);
      B.flash(0.3 * clamp(1 - Math.abs(lt - 0.6) / 0.12), P.madder);
    } });
  cue(0, 'slam', { gain: 1 }); cue(0, 'thud', { gain: 1 }); cue(0, 'rumble', { gain: 0.7, dur: 2 }); cue(0, 'drum', { gain: 0.8 });
  cue(0.1, 'whoosh', { gain: 0.5, pan: 0.6 }); cue(0.55, 'slam', { gain: 0.6 });

  add({ id: 'a1_kill', at: tKings, cam: [540, 760], zoom: 0.14,
    note: '"kill": the chief (cream wax, no crown) stands tall on the hill top against the whole moon; madder crackle runs through him on "kill"; WHY? tag slams',
    draw: (lt) => {
      const tk = tKill - tKings; ctx.save(); B.shake(B.shk(lt, tk, 26, 0.45));
      B.cloth(lt, { tone: 'night' });
      B.moon(540, 620, 260, {});
      B.hill(-60, 1140, 1450, 300, 1, { dots: 0.6, stain: 0.6 * seg(lt, tk, tk + 0.4) });
      B.figure(540, 1180, 1.55, { arm: 0.15 });
      B.crackle(380, 700, 320, 500, seg(lt, tk, tk + 0.3), 11, P.madder, 4);
      B.glow(540, 900, 380, P.madder, 0.4 * seg(lt, tk, tk + 0.2));
      B.vignette(0.6);
      ctx.restore();
      B.tag('WHY?', 540, 230, 86, { s: B.pop(lt, 0, 0.25), rot: -0.04, col: P.madderHi });
      B.flash(0.35 * clamp(1 - Math.abs(lt - tk - 0.03) / 0.12), P.madder);
    } });
  cue(tKings, 'slam', { gain: 0.7 }); cue(tKill, 'thud', { gain: 0.8 }); cue(tKill + 0.02, 'slam', { gain: 0.5 });

  add({ id: 'a2_generous', at: tGen, cam: [540, 820], zoom: 0.08,
    note: '"generous chief": the wax chief raises his hand, wax drips fall, dye-bloom gifts burst outward in every colour; ILLUSTRATION tag',
    draw: (lt) => {
      B.cloth(lt, { tone: 'indigo' });
      B.moon(540, 400, 120, {});
      B.hill(-40, 1120, 1450, 380, 1, { dots: 1 });
      const ar = eo(seg(lt, 0, 0.35)); B.figure(540, 1100, 1.2, { arm: ar });
      const hx = 540 + 36, hy = 1100 - 1.2 * (270 - 140 + 200 * ar) - 10;
      B.glow(hx, hy, 160, '#FFE7A8', 0.5 * ar);
      for (let i = 0; i < 12; i++) { const t0 = 0.15 + (i % 2 ? i * 0.06 : (11 - i) * 0.06), u = eo(seg(lt, t0, t0 + 0.9)); if (u <= 0) continue;
        const an = -Math.PI * 0.95 + (i / 11) * Math.PI * 0.9 + (rnd(i) - 0.5) * 0.2, R = 300 + rnd(i * 5) * 200;
        const x = hx + Math.cos(an) * R * u, y = hy + Math.sin(an) * R * u * 0.9 + 120 * u * u;
        B.bloom(x, y, 38 + rnd(i * 9) * 28, seg(lt, t0 + 0.1, t0 + 0.7), GIFT[i % GIFT.length], 0.8, i + 3);
        dot(x, y, 5, 1 - seg(lt, t0 + 0.5, t0 + 0.9)); }
      B.drips(hx, hy + 10, lt, 0.3, 5, 4);
      B.vignette(0.45);
      B.tag('ILLUSTRATION', 540, 170, 34, { s: B.pop(lt, 0.05, 0.3) });
    } });
  cue(tGen, 'whoosh', { gain: 0.5 }); cue(tGen + 0.25, 'swell', { gain: 0.4, dur: 1.2 }); for (let i = 0; i < 4; i++) cue(tGen + 0.3 + i * 0.25, 'plop', { gain: 0.3, pan: -0.6 + i * 0.4 });

  // ---------- line 1: Sangam age, Parambu hill, old poems, villages to poets ----------
  add({ id: 'a3_sangam', at: t3, cam: [540, 700], zoom: 0.1,
    note: '"Sangam age": the wax moon draws itself, SANGAM AGE wax title draws in over an ochre dye bloom, a horizon line runs out',
    draw: (lt) => {
      B.cloth(lt, { tone: 'dawn' });
      B.moon(540, 420, 140, { p: eo(seg(lt, 0, 0.5)) });
      B.bloom(540, 820, 420, seg(lt, 0.05, 0.6), P.ochre, 0.35, 7);
      B.title('SANGAM', 540, 760, 150, { p: eo(seg(lt, 0.08, 0.5)) });
      B.title('AGE', 540, 930, 150, { p: eo(seg(lt, 0.3, 0.65)), col: P.turmeric });
      const hz = []; for (let i = 0; i <= 40; i++) hz.push([60 + i * 24, 1180 + Math.sin(i * 0.5 + lt * 2) * 10]);
      B.wax(hz, eo(seg(lt, 0.2, 0.9)), { w: 6 });
      B.drips(300, 1190, lt, 0.5, 3, 8); B.drips(780, 1190, lt, 0.6, 3, 9);
      B.vignette(0.45);
    } });
  cue(t3, 'whoosh', { gain: 0.5 }); cue(t3 + 0.1, 'zip', { gain: 0.35 }); cue(t3 + 0.3, 'zip', { gain: 0.3 });

  add({ id: 'a4_parambu', at: tPari, cam: [540, 900], zoom: 0.08,
    note: '"Pari ruled Parambu hill": the hill draws itself in wax, the cream chief stands on its top, village dots light one by one; PARAMBU HILL tag',
    draw: (lt) => {
      B.cloth(lt, { tone: 'indigo' });
      B.moon(540, 360, 120, {});
      const hp = eo(seg(lt, 0, 0.6));
      B.hill(60, 1020, 1400, 640, hp, { dots: seg(lt, 0.6, 1.6), villages: 24 });
      const top = 1400 - 640 * 0.95;
      B.figure(540, top + 8, 0.62, { p: eo(seg(lt, 0.05, 0.5)), arm: 0.4 * seg(lt, 0.6, 1) });
      B.glow(540, top - 80, 180, '#FFE7A8', 0.25);
      B.vignette(0.45);
      B.tag('PARAMBU HILL', 540, 170, 46, { s: B.pop(lt, tPar - tPari - 0.05, 0.3) });
    } });
  cue(tPari, 'zip', { gain: 0.4 }); cue(tPar, 'pop', { gain: 0.5 }); for (let i = 0; i < 5; i++) cue(tPari + 0.65 + i * 0.2, 'tock', { gain: 0.2, pan: -0.6 + i * 0.3 });

  add({ id: 'a5_poems', at: tOld, cam: [540, 880], zoom: 0.1,
    note: '"old poems say": a long ochre poem leaf draws itself in wax with abstract wavy lines; OLD POEMS SAY tag; moon above',
    draw: (lt) => {
      B.cloth(lt, { tone: 'indigo' });
      B.moon(540, 360, 110, {});
      B.bloom(540, 930, 460, seg(lt, 0, 0.5), P.ochre, 0.25, 4);
      ctx.save(); ctx.translate(540, 930); ctx.rotate(Math.sin(lt * 1.4) * 0.03 - 0.05); ctx.translate(-540, -930);
      B.leaf(540, 930, 880, 300, eo(seg(lt, 0.05, 0.9)), lt, { rows: 4 });
      ctx.restore();
      B.drips(300, 1090, lt, 0.8, 3, 6, P.ochre);
      B.vignette(0.45);
      B.tag('OLD POEMS SAY', 540, 640, 46, { s: B.pop(lt, tPoems - tOld - 0.15, 0.3) });
    } });
  cue(tOld, 'whoosh', { gain: 0.4 }); cue(tOld + 0.1, 'zip', { gain: 0.4 }); cue(tPoems, 'pop', { gain: 0.4 });

  const VX0 = 100, VX1 = 980, VY = 1030, VH = 500, VN = 12, POETS = [180, 410, 670, 900];
  add({ id: 'a6_poets', at: tVil, cam: [540, 950], zoom: 0.07,
    note: '"gave its villages to poets": the lit village dots lift off the hill and float down in arcs to four small ochre poet figures, who raise their hands',
    draw: (lt) => {
      B.cloth(lt, { tone: 'indigo' });
      B.moon(540, 300, 105, {});
      B.hill(VX0, VX1, VY, VH, 1, { dots: 0 });
      const vp = villagePts(VX0, VX1, VY, VH, VN), tp = tPoets - tVil;
      const got = [0, 0, 0, 0];
      vp.forEach(([x, y], i) => { const k = i % 4, t0 = 0.15 + i * 0.09, u = eio(seg(lt, t0, t0 + 0.9));
        const tx = POETS[k] + (Math.floor(i / 4) - 1) * 26, ty = 1250 - Math.floor(i / 4) * 22;
        if (u >= 1) got[k]++;
        const x2 = lerp(x, tx, u), y2 = lerp(y, ty, u) - Math.sin(u * Math.PI) * 140;
        dot(x2, y2, 7); });
      POETS.forEach((x, k) => { const g = got[k] / 3; B.glow(x, 1280, 120, '#FFE7A8', 0.35 * g);
        B.figure(x, 1440, 0.55, { col: P.ochre, arm: eo(seg(lt, tp - 0.2 + k * 0.08, tp + 0.2 + k * 0.08)) }); });
      B.vignette(0.45);
    } });
  cue(tVil, 'swell', { gain: 0.35, dur: 1.4 }); for (let i = 0; i < 6; i++) cue(tVil + 0.4 + i * 0.18, 'sparkle', { gain: 0.18, pan: -0.5 + i * 0.2 });

  // ---------- line 2: legend, chariot, jasmine creeper ----------
  add({ id: 'a7_legend', at: t7, cam: [540, 950], zoom: 0.1,
    note: '"Legend says": LEGEND tag; a lone green jasmine creeper grows from the cloth and sways, its glowing tip reaching for nothing',
    draw: (lt) => {
      B.cloth(lt, { tone: 'dawn' });
      B.moon(780, 420, 100, {});
      B.bloom(540, 1420, 260, seg(lt, 0, 0.5), P.green, 0.3, 5);
      const g = []; for (let i = 0; i <= 20; i++) g.push([140 + i * 40, 1410 + Math.sin(i * 1.1) * 8]); B.wax(g, 1, { w: 6, tip: false, a: 0.7 });
      const lean = Math.sin(lt * 1.7) * 0.22;
      B.creeper(540, 1410, 680, lerp(0.15, 0.85, eo(seg(lt, 0, 1.3))), lt, { lean });
      const tip = [540 + Math.sin(9 + lt * 0.8) * 26 + lean * 680 * 0.85, 1410 - 680 * 0.85]; B.glow(tip[0], tip[1], 90, P.green, 0.25);
      B.vignette(0.5);
      B.tag('LEGEND', 540, 200, 52, { s: B.pop(lt, tLeg - t7, 0.3) });
    } });
  cue(t7, 'whoosh', { gain: 0.4 }); cue(tLeg, 'pop', { gain: 0.5 }); cue(t7 + 0.2, 'zip', { gain: 0.3, dur: 1 });

  add({ id: 'a8_chariot', at: tChar, cam: [600, 1150], zoom: 0.08,
    note: '"gave his chariot to a jasmine creeper": the wax chariot rolls in from the right, wheel spinning, and stops beside the swaying creeper; dust blooms',
    draw: (lt) => {
      B.cloth(lt, { tone: 'dawn' });
      B.moon(540, 400, 100, {});
      const g = []; for (let i = 0; i <= 26; i++) g.push([20 + i * 40, 1410 + Math.sin(i * 1.1) * 8]); B.wax(g, 1, { w: 6, tip: false, a: 0.7 });
      const u = eo(seg(lt, 0, 1.3)), cx = lerp(1450, 690, u);
      B.creeper(240, 1410, 560, 0.85, lt, { lean: Math.sin(lt * 1.7) * 0.18 + 0.1 * seg(lt, 1, 2) });
      for (let i = 0; i < 4; i++) B.bloom(cx + 120 + i * 70, 1400 - i * 10, 50 + i * 12, seg(lt, 0.1 + i * 0.15, 0.6 + i * 0.15) * (1 - seg(lt, 1.2, 2)), P.waxDk, 0.25, i + 2);
      B.chariot(cx, 1400, 1.35, (1450 - cx) / 120, {});
      B.vignette(0.5);
      if (lt > tJas - tChar) B.glow(240, 900, 200, P.waxHi, 0.15 * seg(lt, tJas - tChar, tJas - tChar + 0.4));
    } });
  cue(tChar, 'rumble', { gain: 0.4, dur: 1.3 }); cue(tChar + 1.25, 'thud', { gain: 0.4 }); cue(tJas, 'sparkle', { gain: 0.25 });

  const VINE = dense([[230, 1430], [260, 1340], [330, 1260], [380, 1170], [395, 1080], [375, 1000], [368, 934], [450, 942], [544, 950], [520, 1010], [600, 1078], [720, 1078], [815, 1060]], 70);
  add({ id: 'a9_climb', at: tNoth, cam: [560, 1100], zoom: 0.12,
    note: '"nothing to climb": close on the parked chariot; the creeper climbs its frame and canopy, jasmine flowers bloom on "climb" (sparkle); madder dye flood rises at the end',
    draw: (lt, d) => {
      B.cloth(lt, { tone: 'dawn' });
      B.moon(840, 420, 95, {});
      B.chariot(640, 1350, 1.6, 0, {});
      const tc = tClimb - tNoth;
      vine(VINE, eo(seg(lt, 0, tc + 0.15)), lt, seg(lt, tc, tc + 0.6));
      B.glow(480, 1000, 320, P.waxHi, 0.15 * seg(lt, tc, tc + 0.5));
      B.vignette(0.5);
      B.flood(seg(lt, d - 0.45, d), P.madder, lt);
    } });
  cue(tNoth, 'zip', { gain: 0.35, dur: 0.8 }); cue(tClimb, 'sparkle', { gain: 0.6 }); cue(L(3) - 0.5, 'swell', { gain: 0.45, dur: 0.6 });

  // ---------- line 3: the three kings, joined, besieged ----------
  const KX = [220, 540, 860], KE = ['bow', 'tiger', 'fish'], KN = ['CHERA', 'CHOLA', 'PANDYA'], KT = [tChera, tChola, tPandya];
  add({ id: 'a10_kings', at: t10, cam: [540, 950], zoom: 0.08,
    note: 'madder flood drains away; on "Chera / Chola / Pandya" the green-bow, turmeric-tiger and teal-fish kings pop up one by one behind dye blooms with CHERA / CHOLA / PANDYA tags',
    draw: (lt) => {
      B.cloth(lt, { tone: 'madder' });
      B.moon(540, 330, 100, {});
      for (let i = 0; i < 3; i++) { const t0 = KT[i] - t10 - 0.08, u = B.pop(lt, t0, 0.35); if (lt < t0) continue;
        B.bloom(KX[i], 1150, 190, seg(lt, t0, t0 + 0.4), B.KCOL[KE[i]], 0.4, i + 7);
        B.king(KX[i], lerp(1700, 1330, u), 1.1, KE[i], { lt });
        B.tag(KN[i], KX[i], 790, 44, { s: B.pop(lt, t0 + 0.05, 0.25), col: B.KCOL[KE[i]] }); }
      B.vignette(0.5);
      B.flood(1 - seg(lt, 0, 0.35), P.madder, lt);
    } });
  cue(t10, 'whoosh', { gain: 0.4 }); KT.forEach((t, i) => { cue(t - 0.05, 'thud', { gain: 0.6, pan: -0.6 + i * 0.6 }); cue(t, 'drum', { gain: 0.6, pan: -0.6 + i * 0.6 }); });

  add({ id: 'a11_join', at: tJoin, cam: [540, 1000], zoom: 0.12,
    note: '"joined together": the three kings slide into one tight row, their banners overlap and a madder bloom merges behind them; hit + shake as they lock',
    draw: (lt) => {
      const tl = tTog - tJoin + 0.1; ctx.save(); B.shake(B.shk(lt, tl, 18, 0.4));
      B.cloth(lt, { tone: 'madder' });
      B.moon(540, 330, 100, {});
      B.bloom(540, 1000, 480, seg(lt, tl - 0.1, tl + 0.4), P.madder, 0.55, 12);
      const u = eio(seg(lt, 0, tl)), X = [lerp(220, 380, u), 540, lerp(860, 700, u)];
      for (let i = 0; i < 3; i++) B.bloom(X[i], 900, 150, 1, B.KCOL[KE[i]], 0.3 * (1 - seg(lt, tl, tl + 0.4)), i + 7);
      for (const i of [0, 2, 1]) B.king(X[i], 1330, 1.1, KE[i], { lt });
      B.vignette(0.5);
      ctx.restore();
      B.flash(0.25 * clamp(1 - Math.abs(lt - tl) / 0.12), P.madderHi);
    } });
  cue(tJoin, 'slide', { gain: 0.5 }); cue(tTog + 0.1, 'slam', { gain: 0.6 }); cue(tTog + 0.1, 'drum', { gain: 0.6 });

  add({ id: 'a12_siege', at: tBes, cam: [540, 950], zoom: 0.1,
    note: '"besieged his hill": madder army rows march in from both sides below Parambu hill, the madder siege ring closes around it on "hill", SIEGE title; moon still whole',
    draw: (lt) => {
      const th = tHill - tBes; ctx.save(); B.shake(B.shk(lt, th, 14, 0.4));
      B.cloth(lt, { tone: 'night' });
      B.moon(540, 440, 90, {});
      B.hill(160, 920, 1200, 520, 1, { dots: 1, villages: 16 });
      B.figure(540, 1200 - 520 * 0.95 + 8, 0.35, {});
      B.ring(540, 920, 365, eo(seg(lt, 0.1, th + 0.1)), lt);
      const m = eo(seg(lt, 0, 1.2));
      B.army(40, 1040, 1330, 10, lt, { march: lerp(-1100, 0, m), s: 0.38 });
      B.army(40, 1040, 1445, 10, lt + 0.3, { march: lerp(1100, 0, m), s: 0.4 });
      B.vignette(0.55);
      ctx.restore();
      B.title('SIEGE', 540, 240, 150, { p: eo(seg(lt, th - 0.05, th + 0.3)), col: P.madderHi, crackCol: P.ink });
    } });
  cue(tBes, 'rumble', { gain: 0.6, dur: 1.8 }); for (let i = 0; i < 4; i++) cue(tBes + i * 0.3, 'drum', { gain: 0.45 }); cue(tHill, 'slam', { gain: 0.7 });
}
