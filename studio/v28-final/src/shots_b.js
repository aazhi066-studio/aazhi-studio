// Worker B: script lines 4-6 (L(4) .. L(7)). Kapilar the ochre poet walks down from Pari's hill to warn the three crowns;
// armies bounce off the hill, singers walk up and the villages glow; then the madder flood: the hill FELL, Pari's wax cracks and fades
// (killed), the moon stains madder. Line 6: a huge wax '?', the poem with a blank gap (POEMS NEVER SAY), overlapping LATER TELLINGS,
// a hidden madder thread (TREACHERY?), and the leaves split apart (DISPUTED). "Indigo Batik & Wax Crackle" kit.
import * as B from './batik.js';
import { L, Wd } from './core/timing.js';
import { ctx, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { rgba } from './art.js';

const P = B.PAL;
const sh = (a) => B.shake(a);
/** y of the hill surface at fraction u (same formula as B.hill) */
const hillY = (x0, x1, y, h, u) => y - h * Math.pow(Math.sin(u * Math.PI), 0.8) * (0.92 + 0.08 * Math.sin(u * 17));
const hillPts = (x0, x1, y, h) => Array.from({ length: 41 }, (_, i) => [lerp(x0, x1, i / 40), hillY(x0, x1, y, h, i / 40)]);
/** village positions (same formula as B.hill) */
const villages = (x0, x1, y, h, n = 24) => Array.from({ length: n }, (_, i) => { const u = 0.12 + rnd(i * 3) * 0.76;
  return [lerp(x0, x1, u), y - h * Math.pow(Math.sin(u * Math.PI), 0.8) * (0.15 + rnd(i * 7) * 0.65)]; });
/** a poem leaf drawn at (x, y) rotated rot, scale s */
function leafAt(x, y, w, h, rot, p, lt, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(o.s ?? 1, o.s ?? 1);
  B.leaf(0, 0, w, h, p, lt, o); if (o.crack) B.crackle(-w / 2, -h / 2, w, h, o.crack, o.seed || 4, P.madder, 3);
  ctx.restore();
}
const H1 = [60, 1020, 1350, 620]; // the standard Parambu hill (top ~ y 740)

export function buildB(add, cue) {
  // ---------------- line 4: Kapilar warns them ----------------
  const t4 = L(4), tKap = Wd('kapilar', 4), tWarn = Wd('warned', 4), tArm = Wd('armies', 4), tNev = Wd('never', 4), tSing = Wd('singers', 4), tAsk = Wd('ask', 4);

  const sA = t4;
  add({ id: 'b4_kapilar', at: sA, cam: [700, 820], zoom: 0.1, note: 'ochre poet Kapilar walks down the hill from cream Pari toward three tiny crowns at the foot; KAPILAR tag',
    draw(lt, d) {
      B.cloth(lt);
      B.moon(540, 330, 120);
      B.hill(...H1, 1, { dots: 0.6 });
      B.figure(520, hillY(...H1, 0.48) + 6, 0.42, { arm: 0.3 + 0.2 * Math.sin(lt * 2) });
      const w = eio(seg(lt, 0, d)), u = lerp(0.53, 0.76, w), kx = lerp(H1[0], H1[1], u), ky = hillY(...H1, u) + 6;
      for (let k = 0.54; k < u - 0.015; k += 0.025) { const fx = lerp(H1[0], H1[1], k); ctx.beginPath(); ctx.arc(fx, hillY(...H1, k) + 4, 5, 0, TAU); ctx.fillStyle = rgba(P.ochre, 0.8); ctx.fill(); }
      B.figure(kx, ky - Math.abs(Math.sin(lt * 7)) * 5, 0.42, { col: P.ochre, arm: 0.15 });
      ['bow', 'tiger', 'fish'].forEach((e, i) => B.king(660 + i * 140, 1440, 0.36, e, { lt: lt + i }));
      B.tag('KAPILAR', kx, ky - 210, 48, { s: B.pop(lt, tKap - sA - 0.05), col: P.ochre });
      B.vignette(0.5);
    } });
  cue(sA, 'whoosh', { gain: 0.4 }); cue(sA + 0.15, 'zip', { gain: 0.25 }); cue(tKap - 0.05, 'pop', { gain: 0.45 });

  const sB = tWarn - 0.1;
  add({ id: 'b4_warned', at: sB, cam: [400, 1150], zoom: 0.08, note: 'at the siege line: Kapilar (ochre, arm raised) faces the three crowned kings; a poem leaf rises from him; madder army row bobs at the hill foot',
    draw(lt, d) {
      B.cloth(lt);
      B.moon(540, 300, 100);
      B.hill(80, 1000, 1080, 460, 1, { dots: 0.5 });
      const ar = seg(lt, tArm - sB - 0.1, tArm - sB + 0.3);
      B.army(120, 960, 1095, 9, lt, { s: 0.22, a: 0.55 + 0.45 * ar, march: Math.sin(lt * 2) * 10 });
      ['bow', 'tiger', 'fish'].forEach((e, i) => B.king(580 + i * 170, 1400, 0.6, e, { lt: lt + i * 0.7 }));
      B.figure(220, 1400, 0.64, { col: P.ochre, arm: eo(seg(lt, 0, 0.35)) });
      const r = eo(seg(lt, 0.1, d));
      leafAt(lerp(330, 420, r), lerp(1130, 830, r), 440, 120, -0.08 + 0.04 * Math.sin(lt * 2), seg(lt, 0.05, 0.8), lt);
      B.vignette(0.5);
    } });
  cue(sB, 'slide', { gain: 0.4 }); cue(sB + 0.1, 'zip', { gain: 0.3, pan: -0.3 }); cue(tArm, 'drum', { gain: 0.4 });

  const sC = tNev - 0.35;
  add({ id: 'b4_never', at: sC, cam: [540, 1050], zoom: 0.06, note: 'NEVER: madder armies charge the hill from both sides, the hill wax outline flares into a barrier and they bounce back',
    draw(lt, d) {
      const hit = tNev - sC + 0.02, hp = [140, 940, 1250, 560];
      B.cloth(lt);
      ctx.save(); sh(B.shk(lt, hit, 14, 0.45));
      B.moon(540, 330, 110);
      B.hill(...hp, 1, { dots: 0.5 });
      B.figure(540, hillY(...hp, 0.5) + 6, 0.4, {});
      const fl = seg(lt, hit - 0.05, hit + 0.05) * (1 - 0.6 * seg(lt, hit + 0.3, d)), pts = hillPts(...hp);
      if (fl > 0) { for (let i = 0; i < pts.length; i += 3) B.glow(pts[i][0], pts[i][1], 70, '#FFE7A8', 0.35 * fl);
        B.wax(pts, 1, { col: P.waxHi, w: 10 + 14 * fl, tip: false }); }
      const m = lt < hit ? 90 * eo(lt / hit) : 90 - 330 * eo(seg(lt, hit, hit + 0.5));
      B.army(-40 + m, 330 + m, 1330, 4, lt, { s: 0.3 }); B.army(1120 - m, 750 - m, 1330, 4, lt + 0.5, { s: 0.3 });
      B.army(-120 + m * 1.1, 360 + m * 1.1, 1440, 4, lt + 0.2, { s: 0.38 }); B.army(1200 - m * 1.1, 720 - m * 1.1, 1440, 4, lt + 0.8, { s: 0.38 });
      ctx.restore();
      B.flash(0.3 * (1 - seg(lt, hit, hit + 0.25)) * (lt > hit ? 1 : 0), '#FFF4DE');
      B.vignette(0.5);
    } });
  cue(sC, 'drum', { gain: 0.6 }); cue(sC + 0.05, 'rumble', { gain: 0.6, dur: 0.6 }); cue(tNev + 0.02, 'slam', { gain: 0.6 }); cue(tNev + 0.1, 'whoosh', { gain: 0.35 });

  const sD = tSing - 0.1;
  add({ id: 'b4_singers', at: sD, cam: [540, 950], zoom: 0.08, note: 'SINGERS: small ochre bards walk up a switchback wax path; on ASK the village dots glow and warm dye blooms open across the hill; Pari raises an arm',
    draw(lt, d) {
      const ta = tAsk - sD;
      B.cloth(lt);
      B.moon(540, 330, 120, { glow: 1 + seg(lt, ta, ta + 0.5) });
      B.hill(...H1, 1, { dots: 0 });
      const vs = villages(...H1), bl = seg(lt, ta - 0.1, ta + 0.7);
      vs.forEach(([vx, vy], i) => B.bloom(vx, vy, 46, clamp(bl * 1.6 - i * 0.025), i % 3 ? P.turmeric : P.ochre, 0.45, i));
      const dl = 0.35 + 0.65 * seg(lt, ta, ta + 0.4);
      vs.slice(0, Math.round(24 * dl)).forEach(([vx, vy]) => { B.glow(vx, vy, 22 + 18 * bl, '#FFE7A8', 0.5 + 0.3 * bl); ctx.beginPath(); ctx.arc(vx, vy, 6, 0, TAU); ctx.fillStyle = P.waxHi; ctx.fill(); });
      const path = [[200, 1330], [480, 1250], [300, 1130], [520, 1040], [390, 940], [530, 830], [535, 770]];
      B.wax(path, seg(lt, 0, 0.5), { col: P.ochre, w: 4, a: 0.7 });
      const walk = eo(seg(lt, 0, ta));
      for (let i = 0; i < 4; i++) { const f = clamp(walk * 0.86 - i * 0.12); if (f <= 0 && walk <= 0) continue; const q = B.part(path, f), [bx, by] = q[q.length - 1];
        B.figure(bx, by - Math.abs(Math.sin(lt * 7 + i)) * 4, 0.24, { col: P.ochre, arm: i % 2 ? 0.5 : 0 }); }
      B.figure(540, hillY(...H1, 0.5) + 6, 0.42, { arm: eo(seg(lt, ta - 0.2, ta + 0.3)) });
      B.vignette(0.5);
    } });
  cue(sD, 'tock', { gain: 0.3 }); cue(sD + 0.1, 'zip', { gain: 0.25 }); cue(tAsk, 'sparkle', { gain: 0.5 }); cue(tAsk + 0.05, 'swell', { gain: 0.45, dur: 0.9 });

  // ---------------- line 5: the hill fell, Pari was killed (KEY MOMENT) ----------------
  const t5 = L(5), tFell = Wd('fell', 5), tPari = Wd('pari', 5), tKill = Wd('killed', 5), t6 = L(6);

  const sE = t5 - 0.05;
  add({ id: 'b5_fell', at: sE, cam: [540, 900], zoom: 0.1, note: 'FELL: a madder dye flood rises over Parambu hill, the hill stains and cracks; shake + madder flash on FELL; moon still whole',
    draw(lt, d) {
      const tf = tFell - sE;
      B.cloth(lt, { tone: lt > tf ? 'madder' : 'indigo' });
      ctx.save(); sh(B.shk(lt, tf, 22, 0.6));
      B.moon(540, 330, 120);
      B.hill(...H1, 1, { dots: 0.6 * (1 - seg(lt, tf, tf + 0.3)), stain: seg(lt, 0.15, tf + 0.3) });
      B.crackle(80, 740, 920, 620, seg(lt, tf, tf + 0.4), 11, P.madderHi, 3);
      B.figure(540, hillY(...H1, 0.5) + 6, 0.42, {});
      B.flood(lerp(0.3, 0.5, eio(seg(lt, 0, d))), P.madder, lt, 0.82);
      ctx.restore();
      B.flash(0.45 * (1 - seg(lt, tf, tf + 0.3)) * (lt > tf ? 1 : 0), P.madderHi);
      B.vignette(0.55);
    } });
  cue(sE, 'swell', { gain: 0.5, dur: 0.6 }); cue(sE + 0.05, 'whoosh', { gain: 0.45 }); cue(tFell, 'slam', { gain: 0.8 }); cue(tFell + 0.02, 'thud', { gain: 0.7 });

  const sF = tPari - 0.1;
  add({ id: 'b5_killed', at: sF, cam: [540, 650], zoom: 0.12, note: 'KILLED: close on the stained hilltop; cream Pari figure cracks madder and fades into a madder dye bloom; the moon above stains madder',
    draw(lt, d) {
      const tk = tKill - sF;
      B.cloth(lt, { tone: 'madder', sway: 4 });
      ctx.save(); sh(B.shk(lt, tk, 16, 0.5));
      B.moon(540, 300, 150, { stain: seg(lt, tk - 0.1, tk + 0.8), crack: 0.35 * seg(lt, tk + 0.2, tk + 0.8) });
      B.hill(-200, 1280, 1500, 700, 1, { stain: 1 });
      B.flood(0.42, P.madder, lt, 0.8);
      B.bloom(540, 700, 190, seg(lt, tk + 0.25, tk + 0.95), P.madder, 0.75, 5);
      const dead = seg(lt, tk, tk + 0.55);
      B.figure(540, 812, 0.9, { dead });
      B.bloom(540, 690, 200, seg(lt, tk + 0.4, tk + 0.9), P.madder, 0.92, 6); // the figure dissolves into madder dye
      B.drips(540, 780, lt, tk + 0.6, 4, 7, P.madder);
      ctx.restore();
      B.flash(0.35 * (1 - seg(lt, tk, tk + 0.3)) * (lt > tk ? 1 : 0), P.madderHi);
      B.vignette(0.65);
    } });
  cue(sF, 'heartbeat', { gain: 0.6 }); cue(tKill, 'thud', { gain: 0.8 }); cue(tKill + 0.05, 'heartbeat', { gain: 0.55 }); cue(tKill + 0.5, 'swell', { gain: 0.3, dur: 0.6 });

  // ---------------- line 6: how? nobody knows ----------------
  const tPoems = Wd('poems', 6), tNev6 = Wd('never', 6), tLater = Wd('later', 6), tTre = Wd('treachery', 6), tEven = Wd('even', 6), tDis = Wd('disagree', 6);

  const sG = t6 - 0.05;
  add({ id: 'b6_how', at: sG, cam: [540, 800], zoom: 0.1, note: 'HOW?: a huge wax question mark draws itself with the glowing tjanting tip above the stained hill; dot pops, wax drips',
    draw(lt, d) {
      B.cloth(lt, { tone: 'night' });
      B.moon(860, 260, 70, { stain: 1, glow: 0.5 });
      B.hill(120, 960, 1450, 280, 1, { stain: 1 });
      const q = []; for (let i = 0; i <= 30; i++) { const a = lerp(Math.PI * 1.02, Math.PI * 2.38, i / 30); q.push([540 + Math.cos(a) * 180, 620 + Math.sin(a) * 180]); }
      q.push([545, 880], [540, 950]);
      B.wax(q, eio(seg(lt, 0, 0.6)), { w: 50 });
      const dp = B.pop(lt, 0.6, 0.25); if (dp > 0) { ctx.beginPath(); ctx.arc(540, 1080, 34 * dp, 0, TAU); ctx.fillStyle = P.wax; ctx.fill(); }
      B.drips(540, 960, lt, 0.65, 3, 3);
      B.vignette(0.55);
    } });
  cue(sG, 'zip', { gain: 0.5 }); cue(sG + 0.65, 'pop', { gain: 0.5 }); cue(sG + 0.05, 'whoosh', { gain: 0.3 });

  const sH = tPoems - 0.1;
  add({ id: 'b6_never', at: sH, cam: [540, 850], zoom: 0.07, note: 'POEMS NEVER SAY: a big poem leaf with abstract wax rows; on NEVER the middle of every row wipes out leaving a blank dashed gap',
    draw(lt, d) {
      const tn = tNev6 - sH, fy = Math.sin(lt * 1.6) * 10, x0 = 160, x1 = 920, y0 = 760 + fy;
      B.cloth(lt);
      leafAt(540, y0, 820, 360, -0.03, 1, lt, { rows: 0 });
      ctx.save(); ctx.translate(540, y0); ctx.rotate(-0.03); ctx.translate(-540, -y0);
      const gw = 540 * eio(seg(lt, tn - 0.05, tn + 0.45)), gl = 540 - gw / 2, gr = 540 + gw / 2;
      for (let i = 0; i < 5; i++) { const yy = y0 - 140 + i * 70, row = (a, b) => Array.from({ length: 25 }, (_, k) => { const x = lerp(a, b, k / 24); return [x, yy + Math.sin(x * 0.06 + i * 1.7 + lt * 2) * 5]; });
        const p = clamp(seg(lt, 0, 0.5) * 1.4 - i * 0.08);
        if (gw < 4) B.wax(row(x0, x1), p, { w: 4, col: P.ink, tip: false });
        else { B.wax(row(x0, gl), 1, { w: 4, col: P.ink, tip: false }); B.wax(row(gr, x1), 1, { w: 4, col: P.ink, tip: false }); } }
      if (gw > 20) { ctx.setLineDash([14, 10]); ctx.strokeStyle = rgba(P.waxHi, 0.8); ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(gl + 6, y0 - 160, gw - 12, 320, 12); ctx.stroke(); ctx.setLineDash([]);
        B.glow(gr, y0, 90, '#FFE7A8', 0.4 * (1 - seg(lt, tn + 0.45, tn + 0.7))); }
      ctx.restore();
      B.tag('POEMS NEVER SAY', 540, 1150, 54, { s: B.pop(lt, tn + 0.1) });
      B.vignette(0.5);
    } });
  cue(sH, 'slide', { gain: 0.35 }); cue(tNev6, 'whoosh', { gain: 0.45 }); cue(tNev6 + 0.1, 'pop', { gain: 0.45 });

  const L3 = [[540, 620, -0.12], [570, 810, 0.08], [510, 1000, -0.05]];
  const sI = tLater - 0.1;
  add({ id: 'b6_later', at: sI, cam: [540, 820], zoom: 0.08, note: 'LATER TELLINGS: three overlapping poem leaves slide in from alternating sides and stack',
    draw(lt, d) {
      B.cloth(lt);
      B.moon(540, 210, 60, { stain: 1, glow: 0.4 });
      L3.forEach(([x, y, r], i) => { const k = eo(seg(lt, i * 0.15, i * 0.15 + 0.45)), side = i % 2 ? 1 : -1;
        leafAt(lerp(x + side * 900, x, k), y + Math.sin(lt * 1.5 + i) * 8, 640, 170, lerp(r + side * 0.3, r, k), 1, lt + i); });
      B.tag('LATER TELLINGS', 540, 1270, 54, { s: B.pop(lt, 0.3) });
      B.vignette(0.5);
    } });
  cue(sI, 'slide', { gain: 0.4, pan: -0.4 }); cue(sI + 0.15, 'slide', { gain: 0.4, pan: 0.4 }); cue(sI + 0.3, 'slide', { gain: 0.4, pan: -0.4 }); cue(sI + 0.35, 'pop', { gain: 0.35 });

  const sJ = tTre - 0.1;
  add({ id: 'b6_treachery', at: sJ, cam: [700, 950], zoom: 0.1, note: 'TREACHERY?: a hidden madder thread snakes up the dark hill from behind toward the top; a shadow figure stands at the foot; TREACHERY? tag',
    draw(lt, d) {
      const hp = [60, 1020, 1200, 600];
      B.cloth(lt, { tone: 'night' });
      B.moon(240, 300, 85, { stain: 1, glow: 0.5 });
      B.hill(...hp, 1, { stain: 0.5 });
      const th = [[990, 1440], [960, 1300], [1010, 1180], [900, 1080], [940, 960], [800, 880], [830, 760], [660, 690], [560, 640]];
      const tp = eio(seg(lt, 0, d * 0.9)), fl = 0.75 + 0.25 * Math.sin(lt * 14);
      B.glow(...B.part(th, tp).slice(-1)[0], 60, P.madderHi, 0.5);
      B.wax(th, tp, { col: P.madder, w: 6, a: fl });
      B.figure(lerp(40, 150, eo(seg(lt, 0.1, 0.8))), 1215, 0.5, { col: P.indigoLt, a: 0.7 });
      B.tag('TREACHERY?', 540, 1340, 56, { s: B.pop(lt, 0.15), col: P.madderHi });
      B.vignette(0.6);
    } });
  cue(sJ, 'heartbeat', { gain: 0.55 }); cue(sJ + 0.05, 'zip', { gain: 0.3, pan: 0.4 }); cue(sJ + 0.15, 'pop', { gain: 0.4 });

  const sK = tEven - 0.1;
  add({ id: 'b6_disagree', at: sK, cam: [540, 820], zoom: 0.07, note: 'DISAGREE: the three stacked leaves shudder, crack madder along the seams and split apart in different directions; DISPUTED tag',
    draw(lt, d) {
      const ts = tDis - sK;
      B.cloth(lt);
      const k = eo(seg(lt, ts, ts + 0.55)), jit = lt < ts ? Math.sin(lt * 60) * 4 * seg(lt, 0, ts) : 0;
      const to = [[260, 420, -0.4], [830, 640, 0.35], [700, 1180, -0.25]];
      L3.forEach(([x, y, r], i) => { const [tx, ty, tr] = to[i];
        leafAt(lerp(x, tx, k) + jit * (i - 1), lerp(y, ty, k), 640, 170, lerp(r, tr, k), 1, lt + i, { s: lerp(1, 0.75, k), crack: seg(lt, ts - 0.05, ts + 0.4), seed: 3 + i }); });
      B.glow(540, 810, 300, P.madderHi, 0.35 * (1 - seg(lt, ts, ts + 0.4)) * (lt > ts ? 1 : 0));
      B.tag('DISPUTED', 520, 900, 68, { s: B.pop(lt, ts + 0.3), rot: -0.05, col: P.madderHi });
      B.vignette(0.5);
    } });
  cue(sK, 'tock', { gain: 0.3 }); cue(tDis, 'slam', { gain: 0.45 }); cue(tDis + 0.05, 'whoosh', { gain: 0.4 }); cue(tDis + 0.3, 'pop', { gain: 0.4 });
}
