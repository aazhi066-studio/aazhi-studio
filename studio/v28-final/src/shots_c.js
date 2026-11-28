// v28 worker C: script lines 7-10 (the daughters' poem: two moons / Kapilar leads the girls, chiefs refuse / Avvaiyar sees them married /
// envy or war? + "watch the moon"). Indigo Batik & Wax Crackle.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { rgba } from './art.js';
import * as B from './batik.js';
const P = B.PAL;

// ---------- local helpers ----------
const tagIn = (text, x, y, lt, t0, size = 44, o = {}) => { if (lt < t0) return; B.tag(text, x, y, size, { ...o, s: B.pop(lt, t0, 0.3) }); };
// view: map focus point (fx, fy) to frame centre-ish (540, cy) at scale s
function view(fx, fy, s, fn, cy = 860) { ctx.save(); ctx.translate(540, cy); ctx.scale(s, s); ctx.translate(-fx, -fy); fn(); ctx.restore(); }
function clipRect(x, y, w, h, fn) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(); ctx.restore(); }
// a stitched batik panel: darker dyed patch + wax border drawing in
function panel(x, y, w, h, p, lit = 1) {
  if (p >= 1) { ctx.fillStyle = rgba(P.indigoDk, 0.35 + 0.25 * (1 - lit)); ctx.fillRect(x, y, w, h); }
  B.wax(B.rectPts(x, y, w, h), p, { w: 8, a: 0.5 + 0.5 * lit });
}
// rising sparkle dots
function sparkles(x, y, w, h, lt, n, col, seed = 1) {
  for (let i = 0; i < n; i++) { const sp = 0.4 + rnd(i * 3 + seed) * 0.6, u = (rnd(i * 7 + seed) + lt * sp * 0.35) % 1;
    const px = x + rnd(i * 5 + seed) * w + Math.sin(lt * 2 + i) * 12, py = y + h * (1 - u), a = Math.sin(u * Math.PI);
    B.glow(px, py, 26, col, 0.6 * a); ctx.beginPath(); ctx.arc(px, py, 4 + 3 * a, 0, TAU); ctx.fillStyle = rgba(P.waxHi, a); ctx.fill(); }
}
// madder X stamped over a box (p 0..1)
function xMark(x, y, r, p) {
  if (p <= 0) return;
  B.wax([[x - r, y - r], [x + r, y + r]], clamp(p * 2), { col: P.madder, w: 13, tip: false });
  B.wax([[x + r, y - r], [x - r, y + r]], clamp(p * 2 - 1), { col: P.madder, w: 13, tip: false });
}
// wax arrow pointing down
function arrowDown(x, y0, y1, p) {
  B.wax([[x, y0], [x + 5, lerp(y0, y1, 0.33)], [x - 5, lerp(y0, y1, 0.66)], [x, y1]], clamp(p * 1.4), { w: 16 });
  const k = clamp(p * 2.5 - 1.5); if (k > 0) B.wax([[x - 90, y1 - 90], [x, y1], [x + 90, y1 - 90]], k, { w: 16 });
}

// ---------- the daughters' diptych (two moons) ----------
const PW = 490, PY = 300, PH = 1060, LX = 40, RX = 550;
function diptych(lt, s) {
  for (const [x0, k] of [[LX, s.L], [RX, s.R]]) {
    if (!k) continue; const cx = x0 + PW / 2;
    panel(x0, PY, PW, PH, k.frame ?? 1, k.lit ?? 1);
    if ((k.frame ?? 1) < 1) continue;
    clipRect(x0, PY, PW, PH, () => {
      if (k.stainBg) B.bloom(cx, 900, 420, k.stainBg, P.madder, 0.35, 4 + x0);
      if (k.moonP > 0) B.moon(cx, 560 + Math.sin(lt * 1.3 + x0) * 6, 120, { p: k.moonP, crack: k.crack || 0, stain: k.stain || 0, glow: k.glow ?? 1 });
      if (k.hillP > 0) B.hill(x0 + 20, x0 + PW - 20, 1310, 360, k.hillP, { dots: k.dots || 0, villages: 12, stain: k.hillStain || 0 });
      if (k.father) B.figure(cx + 4, 958, 0.55, { col: P.wax, p: k.father.p ?? 1, a: k.father.a ?? 1, dead: k.father.dead || 0 });
      if (k.drip) B.drips(cx, 690, lt, k.drip, 4, x0, P.madder);
    });
  }
}

// ---------- the envy / war split ----------
function envyPanel(lt, p, lit) {
  const cx = 270; panel(LX - 20, PY, PW + 10, PH, p, lit);
  if (p < 1) return;
  clipRect(LX - 20, PY, PW + 10, PH, () => {
    const gp = 0.7 + 0.3 * Math.sin(lt * 5);
    B.glow(cx, 1180, 300, '#FFE7A8', 0.45 * gp * lit);
    B.bloom(cx, 1180, 170, seg(lt, 0, 0.6), P.wax, 0.18);
    B.figure(cx, 1300, 0.7, { col: P.wax, arm: 0.5 + 0.2 * Math.sin(lt * 3), p: seg(lt, 0, 0.5) });
    const ks = [['bow', 120, 0], ['tiger', 300, 0.15], ['fish', 470, 0.3]];
    for (const [em, x, t0] of ks) {
      const bob = Math.sin(lt * 3 + x) * 5, kp = seg(lt, t0, t0 + 0.4);
      B.king(x, 790 + bob, 0.42, em, { p: kp, lt });
      // glare: dashed dye lines from the crown toward the generous figure
      const gpz = seg(lt, t0 + 0.45, t0 + 0.9); if (gpz > 0) {
        const sx = x, sy = 690 + bob, ex = cx, ey = 1060; const n = 6;
        for (let i = 0; i < n * gpz; i++) { const u0 = ((i / n) + lt * 0.4) % 1, u1 = u0 + 0.07;
          B.wax([[lerp(sx, ex, u0), lerp(sy, ey, u0)], [lerp(sx, ex, Math.min(1, u1)), lerp(sy, ey, Math.min(1, u1))]], 1, { col: B.KCOL[em], w: 7, tip: false, a: 0.9 }); }
      }
    }
  });
}
function warPanel(lt, p, lt0) {
  const cx = 790; panel(RX - 10, PY, PW + 10, PH, p, 1);
  if (p < 1) return;
  clipRect(RX - 10, PY, PW + 10, PH, () => {
    const hp = seg(lt0, 0.05, 0.5);
    B.bloom(cx, 1150, 330, seg(lt0, 0.5, 1.2), P.madder, 0.3, 6);
    B.hill(RX + 20, RX + PW - 30, 1290, 320, hp, { dots: 0.6, villages: 10 });
    B.ring(cx, 1150, 215, seg(lt0, 0.35, 1.0), lt);
    if (lt0 > 0.6) B.army(RX + 40, RX + PW - 50, 1360, 6, lt, { s: 0.28, a: seg(lt0, 0.6, 0.9) });
  });
}

export function buildC(add, cue) {
  const t7 = L(7), poem = Wd('poem', 7), dau = Wd('daughters', 7), mourns = Wd('mourns', 7), under = Wd('under', 7), full = Wd('full', 7),
    moon7 = Wd('moon', 7), fat = Wd('father', 7), hill7 = Wd('hill', 7), by = Wd('by', 7), next = Wd('next', 7), both = Wd('both', 7), gone = Wd('gone', 7);
  const t8 = L(8), kap = Wd('kapilar', 8), girls = Wd('girls', 8), hus = Wd('husbands', 8), chiefs = Wd('chiefs', 8), turned = Wd('turned', 8), down = Wd('down', 8);
  const t9 = L(9), later = Wd('later', 9), avv = Wd('avvaiyar', 9), fin = Wd('finally', 9), mar = Wd('married', 9);
  const t10 = L(10), envy = Wd('envy', 10), gen = Wd('generous', 10), war = Wd('war', 10), hill10 = Wd('hill', 10), tell = Wd('tell', 10), below = Wd('below', 10),
    watch = Wd('watch', 10), moon10 = Wd('moon', 10);

  // ================= line 7: the daughters' poem =================
  const s1 = t7;
  add({ id: 'c7_poem', at: s1, cam: [540, 760], zoom: 0.08, note: 'ONE POEM SAYS tag; a poem leaf draws itself in wax (abstract lines), rose dye blooms seep in behind it', draw: (lt, d) => {
    B.cloth(lt, { tone: 'indigo' });
    B.bloom(330, 900, 260, seg(lt, 0.5, 1.4), P.rose, 0.35, 2); B.bloom(760, 700, 220, seg(lt, 0.8, 1.6), P.rose, 0.3, 5);
    ctx.save(); ctx.translate(540, 820); ctx.rotate(Math.sin(lt * 1.4) * 0.03 - 0.04); ctx.translate(-540, -820);
    B.leaf(540, 820, 820, 270, seg(lt, 0.05, 0.9), lt, { rows: 3 });
    ctx.restore();
    B.drips(880, 960, lt, 0.9, 4, 3);
    tagIn('ONE POEM SAYS', 540, 470, lt, poem - s1, 50);
    B.vignette(0.5);
  } });
  cue(s1, 'whoosh', { gain: 0.6 }); cue(s1 + 0.1, 'zip', { gain: 0.4 }); cue(poem, 'pop', { gain: 0.5 }); cue(s1 + 0.6, 'swell', { gain: 0.35 });

  const s2 = dau - 0.08;
  add({ id: 'c7_daughters', at: s2, cam: [540, 1000], zoom: 0.1, note: 'two small ROSE daughter figures draw in under a floating poem leaf, then kneel in mourning as rose dye spreads and wax drips fall', draw: (lt, d) => {
    B.cloth(lt + 3, { tone: 'indigo' });
    B.bloom(540, 1080, 420, seg(lt, 0, 0.9), P.rose, 0.28, 7);
    ctx.save(); ctx.translate(0, Math.sin(lt * 1.6) * 10); B.leaf(540, 500, 520, 170, 1, lt + 2, { rows: 2 }); ctx.restore();
    const kn = lt > mourns - s2 + 0.1;
    B.figure(410, 1300, 0.95, { col: P.rose, p: seg(lt, 0.0, 0.45), kneel: kn });
    B.figure(650, 1300, 0.85, { col: P.rose, p: seg(lt, 0.15, 0.6), kneel: kn });
    if (kn) { B.drips(410, 760, lt, mourns - s2 + 0.1, 3, 4, P.waxHi); B.drips(650, 780, lt, mourns - s2 + 0.25, 3, 9, P.waxHi); }
    B.vignette(0.5);
  } });
  cue(s2 + 0.05, 'zip', { gain: 0.4 }); cue(mourns + 0.1, 'heartbeat', { gain: 0.5 });

  // the diptych begins: zoomed on the left panel
  const s3 = under - 0.05;
  add({ id: 'c7_moon1', at: s3, cam: [540, 860], zoom: 0.05, note: 'close on the left batik panel: Parambu hill draws in, then the whole wax full moon rises above it on "full moon"', draw: (lt, d) => {
    B.cloth(lt + 6, { tone: 'night' });
    const sc = lerp(1.24, 1.14, eio(seg(lt, 0, d)));
    view(LX + PW / 2, 830, sc, () => diptych(lt, {
      L: { hillP: seg(lt, 0.0, 0.5), moonP: seg(lt, full - s3 - 0.05, moon7 - s3 + 0.35), dots: seg(lt, 0.5, 1.2) },
    }), 820);
    B.vignette(0.55);
  } });
  cue(s3, 'whoosh', { gain: 0.5 }); cue(s3 + 0.05, 'zip', { gain: 0.35 }); cue(full, 'swell', { gain: 0.5 }); cue(moon7, 'sparkle', { gain: 0.45 });

  const s4 = fat - 0.06;
  add({ id: 'c7_father', at: s4, cam: [540, 860], zoom: 0.04, note: 'pull back: the cream father figure draws in on the hilltop under the whole moon; village lights glow on "hill"; the empty right panel is stitched in beside it', draw: (lt, d) => {
    B.cloth(lt + 8, { tone: 'night' });
    const k = eio(seg(lt, 0, 0.55)), sc = lerp(1.14, 1.0, k), fx = lerp(LX + PW / 2, 540, k);
    view(fx, lerp(830, 860, k), sc, () => diptych(lt, {
      L: { hillP: 1, moonP: 1, dots: lt > hill7 - s4 ? 1 : 0.6, father: { p: seg(lt, 0, 0.45) } },
      R: { frame: seg(lt, hill7 - s4, hill7 - s4 + 0.4), lit: 0.4 },
    }), lerp(820, 860, k));
    B.vignette(0.55);
  } });
  cue(s4 + 0.02, 'zip', { gain: 0.4 }); cue(hill7, 'sparkle', { gain: 0.35 }); cue(hill7 + 0.1, 'slide', { gain: 0.3 });

  const s5 = by - 0.05;
  add({ id: 'c7_next', at: s5, cam: [540, 820], zoom: 0.08, note: 'the second moon draws in on the right panel CRACKED and madder-stained over an empty stained hill; on "gone" the father fades into madder crackle and the left moon cracks too', draw: (lt, d) => {
    const ng = next - s5, gg = gone - s5, [sx, sy] = B.shk(lt, gg, 12, 0.5);
    B.cloth(lt + 11, { tone: 'night' });
    ctx.save(); B.shake([sx, sy]);
    diptych(lt, {
      L: { hillP: 1, moonP: 1, dots: 1 - seg(lt, gg, gg + 0.5), father: { dead: seg(lt, gg, gg + 0.6) }, crack: seg(lt, gg + 0.05, gg + 0.6), stain: seg(lt, gg + 0.3, d) * 0.6, drip: gg + 0.3 },
      R: { frame: 1, lit: 1, hillP: seg(lt, ng - 0.1, ng + 0.3), hillStain: seg(lt, ng + 0.2, ng + 0.9), stainBg: seg(lt, ng + 0.3, ng + 1.1),
        moonP: seg(lt, ng - 0.05, ng + 0.4), crack: seg(lt, ng + 0.35, ng + 0.9), stain: seg(lt, ng + 0.5, ng + 1.1), glow: 0.5, drip: ng + 0.6 },
    });
    ctx.restore();
    B.flash(0.3 * (1 - seg(lt, gg, gg + 0.25)) * (lt > gg ? 1 : 0), P.madderHi);
    B.vignette(0.6);
  } });
  cue(next - 0.05, 'zip', { gain: 0.45 }); cue(next + 0.4, 'thud', { gain: 0.55 }); cue(both, 'heartbeat', { gain: 0.6 }); cue(gone, 'thud', { gain: 0.85 }); cue(gone + 0.05, 'heartbeat', { gain: 0.7 });

  // ================= line 8: Kapilar leads the girls; chiefs refuse =================
  const pathY = (x) => 1200 + Math.sin(x * 0.007 + 0.6) * 70;
  const pathPts = Array.from({ length: 41 }, (_, i) => { const x = -60 + i * 30; return [x, pathY(x)]; });
  const walker = (x, lt, i, col, s, o = {}) => { const bob = Math.abs(Math.sin(lt * 7 + i * 1.3)) * 10; B.figure(x + Math.sin(lt * 7 + i) * 3, pathY(x) - bob, s, { col, ...o }); };
  const s6 = t8 - 0.05;
  add({ id: 'c8_lead', at: s6, cam: [540, 1000], zoom: 0.07, note: 'KAPILAR tag; the ochre poet leads the two rose girls along a winding wax path that draws ahead of them (walk bob), distant hills, ochre footprint blooms', draw: (lt, d) => {
    B.cloth(lt + 14, { tone: 'dawn' });
    B.hill(-80, 420, 980, 200, 1, { dots: 0 }); B.hill(560, 1160, 1000, 260, 1, { dots: 0 });
    B.wax(pathPts, seg(lt, 0, 0.6), { w: 12 });
    B.wax(pathPts.map(([x, y]) => [x, y + 40]), seg(lt, 0.1, 0.7), { w: 5, a: 0.5, tip: false });
    const kx = 380 + lt * 110;
    for (let i = 0; i < 6; i++) { const fx = kx - 60 - i * 70; if (fx > -40) B.bloom(fx, pathY(fx) + 6, 18, 1, P.ochre, 0.35 * (1 - i / 6), i); }
    walker(kx - 330, lt, 2, P.rose, 0.55);
    walker(kx - 200, lt, 1, P.rose, 0.62);
    walker(kx, lt, 0, P.ochre, 0.9, { arm: 0.35 });
    tagIn('KAPILAR', 540, 470, lt, kap - s6, 52);
    B.vignette(0.45);
  } });
  cue(s6, 'whoosh', { gain: 0.5 }); cue(s6 + 0.1, 'zip', { gain: 0.35 }); cue(kap + 0.05, 'pop', { gain: 0.45 });
  for (let k = 0; k < 4; k++) cue(s6 + 0.4 + k * 0.45, 'tock', { gain: 0.18, pan: -0.2 + k * 0.1 });

  const s7 = hus - 0.1;
  const CH = [[620, 1030, 0.6], [790, 980, 0.58], [950, 1050, 0.6]];
  add({ id: 'c8_chiefs', at: s7, cam: [640, 980], zoom: 0.06, note: 'Kapilar and the girls stop on the left; three small crowned wax chiefs pop up on the right one by one, then each darkens (turns away) as a madder X and crackle stamp over it', draw: (lt, d) => {
    B.cloth(lt + 17, { tone: 'dawn' });
    B.wax(pathPts, 1, { w: 12 });
    const w2 = Math.min(lt, 0.6);   // they walk a little, then stop
    walker(110 + w2 * 80, w2 + Math.max(0, lt - 0.6) * 0.15, 2, P.rose, 0.55);
    walker(220 + w2 * 80, w2 + Math.max(0, lt - 0.6) * 0.15, 1, P.rose, 0.62);
    walker(360 + w2 * 80, w2, 0, P.ochre, 0.9, { arm: lt > 0.6 ? 0.8 : 0.35 });
    CH.forEach(([x, y, s], i) => {
      const a0 = chiefs - s7 - 0.1 + i * 0.25, t0 = turned - s7 + i * 0.28;
      if (lt < a0) return;
      const k = B.pop(lt, a0, 0.3), tn = seg(lt, t0, t0 + 0.25);
      B.bloom(x, y - 120, 110, k, P.waxDk, 0.2, i + 3);
      ctx.save(); ctx.translate(x, y); ctx.scale(lerp(1, -1, tn) * (0.6 + 0.4 * k), 0.6 + 0.4 * k); ctx.translate(-x, -y);
      B.figure(x, y, s, { col: tn > 0.5 ? P.waxDk : P.wax, crown: true, crownCol: P.wax, arm: tn > 0.5 ? 0 : 0.2, a: 1 - 0.35 * tn });
      ctx.restore();
      if (tn > 0) { B.crackle(x - 70, y - 210, 140, 220, tn, 11 + i, P.madder, 2.5); xMark(x, y - 110, 60, seg(lt, t0 + 0.05, t0 + 0.3)); }
    });
    B.vignette(0.45);
  } });
  CH.forEach((_, i) => { cue(chiefs - 0.1 + i * 0.25, 'pop', { gain: 0.35, pan: 0.2 + i * 0.2 }); cue(turned + i * 0.28 + 0.05, 'tock', { gain: 0.65, pan: 0.2 + i * 0.2 }); });
  cue(down, 'thud', { gain: 0.4 });

  // ================= line 9: Avvaiyar =================
  const s8 = t9 - 0.05;
  add({ id: 'c9_later', at: s8, cam: [540, 860], zoom: 0.08, note: 'LATER TRADITION tag; rose and lavender dye blooms open across the dawn cloth around the two rose girls standing together', draw: (lt, d) => {
    B.cloth(lt + 20, { tone: 'dawn' });
    const BL = [[300, 760, 260, P.rose], [780, 620, 230, P.lavender], [620, 1080, 280, P.lavender], [220, 1160, 200, P.rose], [880, 1020, 180, P.rose]];
    BL.forEach(([x, y, r, c], i) => B.bloom(x, y, r, seg(lt, 0.05 + i * 0.18, 0.75 + i * 0.18), c, 0.32, i + 21));
    B.figure(450, 1300 + Math.sin(lt * 2) * 3, 0.85, { col: P.rose, p: seg(lt, 0.1, 0.6) });
    B.figure(630, 1300 + Math.sin(lt * 2 + 1) * 3, 0.8, { col: P.rose, p: seg(lt, 0.2, 0.7) });
    B.drips(540, 470, lt, 0.5, 4, 7, P.lavender);
    tagIn('LATER TRADITION', 540, 400, lt, 0.08, 50);
    B.vignette(0.45);
  } });
  cue(s8, 'swell', { gain: 0.5 }); cue(s8 + 0.1, 'pop', { gain: 0.45 }); cue(s8 + 0.3, 'whoosh', { gain: 0.3 });

  const s9 = avv - 0.1;
  add({ id: 'c9_avvaiyar', at: s9, cam: [700, 950], zoom: 0.08, note: 'AVVAIYAR tag; the lavender poet walks in from the right to the girls, a lavender bloom opening behind her, and raises an arm toward them', draw: (lt, d) => {
    B.cloth(lt + 23, { tone: 'dawn' });
    B.bloom(330, 1050, 260, 1, P.rose, 0.25, 31);
    const ax = lerp(1000, 760, eo(seg(lt, 0, 0.9))), walking = lt < 0.9;
    B.bloom(ax, 1060, 300, seg(lt, 0.2, 1.1), P.lavender, 0.35, 33);
    B.figure(270, 1300, 0.7, { col: P.rose });
    B.figure(430, 1300, 0.66, { col: P.rose });
    B.figure(ax, 1300 - (walking ? Math.abs(Math.sin(lt * 7)) * 10 : 0), 0.95, { col: P.lavender, arm: walking ? 0.2 : lerp(0.2, 0.7, eo(seg(lt, 0.9, 1.3))), p: seg(lt, 0, 0.35) });
    sparkles(150, 700, 800, 600, lt, 10, P.lavender, 3);
    tagIn('AVVAIYAR', 700, 470, lt, 0.12, 54, { col: P.waxHi });
    B.vignette(0.45);
  } });
  cue(s9 + 0.12, 'pop', { gain: 0.5 }); cue(s9 + 0.3, 'whoosh', { gain: 0.3 }); cue(fin, 'bell', { gain: 0.35 });

  const s10 = mar - 0.15;
  add({ id: 'c9_married', at: s10, cam: [540, 900], zoom: 0.1, note: 'a cream wax garland arc draws itself between the two rose girls, rose flowers bloom along it, Avvaiyar small behind; sparkles rise', draw: (lt, d) => {
    B.cloth(lt + 26, { tone: 'dawn' });
    B.bloom(540, 900, 460, seg(lt, 0, 0.8), P.rose, 0.22, 41); B.bloom(540, 820, 300, seg(lt, 0.2, 1.0), P.lavender, 0.25, 43);
    B.figure(540, 1180, 0.55, { col: P.lavender, a: 0.75, arm: 0.6 });
    B.figure(330, 1320, 0.85, { col: P.rose, arm: 0.35 });
    B.figure(750, 1320, 0.85, { col: P.rose, arm: 0.35 });
    const arc = Array.from({ length: 41 }, (_, i) => { const u = i / 40; return [lerp(345, 735, u), 1000 - Math.sin(u * Math.PI) * 300 + Math.sin(u * 30 + lt * 3) * 4]; });
    const gp = seg(lt, 0.05, 0.7); B.wax(arc, gp, { w: 9 });
    for (let i = 2; i < 40; i += 4) { const fb = clamp((gp - i / 40) * 5); if (fb <= 0) continue; const [x, y] = arc[i];
      B.bloom(x, y, 22, fb, i % 8 ? P.rose : P.lavender, 0.95, i);
      ctx.beginPath(); ctx.arc(x, y, 5 * fb, 0, TAU); ctx.fillStyle = P.waxHi; ctx.fill(); }
    sparkles(150, 550, 780, 750, lt, 16, '#FFE7A8', 9);
    B.vignette(0.45);
  } });
  cue(s10 + 0.05, 'zip', { gain: 0.4 }); cue(mar + 0.2, 'bell', { gain: 0.5 }); cue(mar + 0.4, 'sparkle', { gain: 0.5 });

  // ================= line 10: envy or war? + watch the moon =================
  const s11 = t10 - 0.05;
  add({ id: 'c10_envy', at: s11, cam: [540, 860], zoom: 0.05, note: 'close on the left panel: ENVY? tag; three crowned kings (green bow, turmeric tiger, teal fish) glare dashed dye lines down at a glowing cream generous figure', draw: (lt, d) => {
    B.cloth(lt + 29, { tone: 'indigo' });
    const sc = lerp(1.17, 1.11, eio(seg(lt, 0, d)));
    view(270, 830, sc, () => envyPanel(lt, 1, 1), 800);
    tagIn('ENVY?', 540, 250, lt, 0.08, 64);
    B.vignette(0.5);
  } });
  cue(s11, 'whoosh', { gain: 0.5 }); cue(envy + 0.08, 'pop', { gain: 0.55 }); cue(gen, 'heartbeat', { gain: 0.5 });

  const s12 = war - 0.1;
  add({ id: 'c10_war', at: s12, cam: [540, 860], zoom: 0.06, note: 'pull back to a split screen: ENVY? left (dimmed) vs WAR FOR LAND? right, where the hill draws in, a madder siege ring closes round it and a tiny army bobs', draw: (lt, d) => {
    B.cloth(lt + 32, { tone: 'indigo' });
    const k = eio(seg(lt, 0, 0.35)); const sc = lerp(1.11, 1, k), fx = lerp(270, 540, k), fy = lerp(830, 860, k);
    view(fx, fy, sc, () => { envyPanel(lt + 1.7, 1, lerp(1, 0.55, seg(lt, 0.3, 0.8))); warPanel(lt, k >= 1 ? 1 : seg(lt, 0.1, 0.35), lt); }, lerp(800, 860, k));
    if (k >= 0.99) { tagIn('ENVY?', 270, 360, lt, 0.3, 46); tagIn('WAR FOR LAND?', 795, 360, lt, 0.4, 38, { col: P.madderHi }); tagIn('OR', 540, 860, lt, 0.55, 40); }
    B.vignette(0.5);
  } });
  cue(s12, 'slide', { gain: 0.5 }); cue(s12 + 0.4, 'drum', { gain: 0.6 }); cue(s12 + 0.7, 'rumble', { gain: 0.45 }); cue(hill10, 'drum', { gain: 0.5 });

  const s13 = tell - 0.1;
  add({ id: 'c10_tell', at: s13, cam: [540, 800], zoom: 0.08, note: 'TELL ME / BELOW in big wax letters with rose and lavender blooms; a wax arrow draws itself down toward the captions and bobs', draw: (lt, d) => {
    B.cloth(lt + 35, { tone: 'indigo' });
    B.bloom(330, 560, 260, seg(lt, 0, 0.6), P.rose, 0.3, 51); B.bloom(760, 760, 240, seg(lt, 0.1, 0.7), P.lavender, 0.3, 53);
    B.title('TELL ME', 540, 520, 150, { p: seg(lt, 0, 0.35), s: 1 + 0.03 * Math.sin(lt * 4) });
    B.title('BELOW', 540, 720, 150, { p: seg(lt, below - s13 - 0.05, below - s13 + 0.3), col: P.waxHi });
    const bob = Math.sin(lt * 6) * 14;
    ctx.save(); ctx.translate(0, bob); arrowDown(540, 880, 1400, seg(lt, 0.25, 0.85)); ctx.restore();
    if (lt > 0.85) B.drips(540, 1390 + bob, lt, 0.85, 3, 5);
    B.vignette(0.45);
  } });
  cue(tell, 'pop', { gain: 0.5 }); cue(s13 + 0.25, 'zip', { gain: 0.5 }); cue(below, 'pop', { gain: 0.45 });

  const s14 = watch - 0.1;
  add({ id: 'c10_moon', at: s14, cam: [540, 620], zoom: 0.16, note: 'final: the whole wax moon over the empty Parambu hill with a tiny jasmine creeper growing at the top; push-in, moon glow pulses on "moon", madder crackle flickers in and out across it; holds to the end', draw: (lt, d) => {
    B.cloth(lt + 38, { tone: 'night' });
    const mt = moon10 - s14, pulse = Math.exp(-Math.pow((lt - mt - 0.25) / 0.35, 2));
    const my = 500 + Math.sin(lt * 1.1) * 8;
    B.glow(540, my, 520 + 140 * pulse, '#F6E7B8', 0.12 + 0.35 * pulse);
    B.moon(540, my, 180, { p: seg(lt, 0, 0.6), glow: 1 + pulse });
    if (lt > 0.6) {
      const fl = Math.pow(Math.max(0, Math.sin(lt * 2.3)), 3) * (1 - 0.7 * pulse);
      ctx.save(); ctx.beginPath(); ctx.arc(540, my, 180, 0, TAU); ctx.clip(); ctx.globalAlpha = fl;
      B.crackle(360, my - 180, 360, 360, 0.6, 61, P.madder, 3); ctx.restore();
    }
    B.hill(80, 1000, 1390, 380, seg(lt, 0, 0.5), { dots: 0 });
    B.creeper(546, 1012, 140, seg(lt, 0.4, 1.8), lt);
    B.vignette(0.6);
  } });
  cue(s14, 'whoosh', { gain: 0.4 }); cue(s14 + 0.05, 'zip', { gain: 0.35 }); cue(s14 + 0.6, 'sparkle', { gain: 0.3 });
  cue(moon10, 'swell', { gain: 0.6 }); cue(moon10 + 0.2, 'bell', { gain: 0.5 }); cue(moon10 + 0.3, 'heartbeat', { gain: 0.35 });
}
