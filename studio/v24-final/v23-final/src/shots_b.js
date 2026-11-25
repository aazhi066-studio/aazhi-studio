// Worker B: script lines 4-7 (L(4) .. L(8)). Vira fights back, board splits, Sundara flees north, 1311 march, empty capital.
import * as CH from './chess.js';
import { L, Le, Wd } from './core/timing.js';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, ell, circle, line } from './core/lib.js';
import { cached, rgba, lg } from './art.js';

const P = CH.PAL;
const RIM = '#C9D3F0';                       // pale rim light that makes ebony pieces read
const EB = (o = {}) => ({ col: 'ebony', glow: 0.7, glowCol: RIM, ...o });
const stepf = (x) => { const f = Math.floor(x); return f + eio(clamp((x - f) * 1.4)); };   // square-to-square slide with a pause
const shake = (t, a, f = 40) => [Math.sin(t * f) * a, Math.cos(t * f * 1.3) * a];

// draw a list of pieces {k, u, v, sc, o} on a board projection, back to front
function pieces(proj, list) {
  list.slice().sort((a, b) => a.v - b.v).forEach((p) => {
    const [x, y, s] = proj(p.u + 0.5, p.v + 0.5);
    CH.piece(p.k, x + (p.dx || 0), y + (p.dy || 0), s * (p.sc ?? 0.62), p.o || {});
  });
}
// the shadow ring a piece leaves behind on its square
function ring(x, y, s, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a);
  ctx.beginPath(); ctx.ellipse(x, y + 4 * s, 64 * s, 18 * s, 0, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
  ctx.lineWidth = 9 * s; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y + 4 * s, 74 * s, 22 * s, 0, 0, TAU); ctx.lineWidth = 2.5 * s; ctx.strokeStyle = rgba(P.ivory, 0.35); ctx.stroke();
  ctx.restore();
}
// several spotlights: one darkness layer with soft holes (low-res offscreen, pure function of inputs)
function spots(list, dark = 0.9, t = 0) {
  const q = 0.4, Wd2 = W + 600, Hd = H + 600;
  const c = cached('b_darkL', Wd2, Hd, q, () => {});
  const g = c.getContext('2d'); g.setTransform(q, 0, 0, q, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, Wd2, Hd); g.fillStyle = `rgba(4,3,6,${dark})`; g.fillRect(0, 0, Wd2, Hd);
  g.globalCompositeOperation = 'destination-out';
  list.forEach(([x, y, r, a = 1], i) => {
    if (r <= 1 || a <= 0) return; const fl = 1 + 0.015 * Math.sin(t * 9 + i * 2) + 0.01 * Math.sin(t * 23 + i);
    const gr = g.createRadialGradient(x + 300, y + 300, r * 0.25 * fl, x + 300, y + 300, r * fl);
    gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, Wd2, Hd);
  });
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(c, -300, -300, Wd2, Hd);
}
// dark map-like sheet on the table: faint contour lines and a grid, no text (cached)
function mapSheet() {
  return cached('b_map', W, 2600, 0.6, () => {
    const g = ctx; g.fillStyle = '#0E1016'; g.fillRect(40, 0, W - 80, 2600);
    g.strokeStyle = 'rgba(120,135,170,0.10)'; g.lineWidth = 2;
    for (let x = 120; x < W - 60; x += 140) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 2600); g.stroke(); }
    for (let y = 60; y < 2600; y += 140) { g.beginPath(); g.moveTo(40, y); g.lineTo(W - 40, y); g.stroke(); }
    for (let i = 0; i < 26; i++) {
      const cx = 140 + rnd(i + 40) * 800, cy = rnd(i + 70) * 2600, r0 = 60 + rnd(i + 90) * 140;
      for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(160,150,120,${0.07 + k * 0.015})`; g.beginPath();
        for (let a = 0; a <= 40; a++) { const an = a / 40 * TAU, r = (r0 - k * 26) * (1 + 0.22 * Math.sin(an * 3 + i) + 0.1 * Math.sin(an * 7 + k)); a ? g.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.7) : g.moveTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.7); }
        g.closePath(); g.stroke(); }
    }
    // coast-like wavy edge down the left
    g.strokeStyle = 'rgba(74,98,168,0.25)'; g.lineWidth = 4; g.beginPath();
    for (let y = 0; y <= 2600; y += 30) g.lineTo(150 + Math.sin(y * 0.004) * 60 + Math.sin(y * 0.017) * 18, y); g.stroke();
    g.strokeStyle = 'rgba(210,160,67,0.35)'; g.lineWidth = 6; g.strokeRect(52, 12, W - 104, 2576);
  });
}
// red ink trail along a polyline, drawn to progress p, with small drops
function inkTrail(pts, p, t, w = 12) {
  const n = pts.length - 1, m = clamp(p) * n, k = Math.floor(m);
  if (m <= 0) return;
  const shown = pts.slice(0, k + 1); if (k < n) { const a = pts[k], b = pts[k + 1], f = m - k; shown.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]); }
  line(shown, rgba(P.bloodDk, 0.9), w * 1.6); line(shown, P.blood, w);
  for (let i = 2; i < shown.length; i += 5) circle(shown[i][0] + (rnd(i) - 0.5) * 40, shown[i][1], 4 + rnd(i + 3) * 7, rgba(P.blood, 0.8));
}

// board split along the middle file: draws two clipped copies pushed apart by `gap` px (each half drifts + tilts slightly)
function splitBoard(o, gap) {
  const base = CH.board({ ...o, a: 0 });
  const a = base(4, -6), b = base(4, 14), l = base(0, 4), r = base(8, 4);
  let dx = r[0] - l[0], dy = r[1] - l[1]; const n = Math.hypot(dx, dy); dx /= n; dy /= n;
  const far = 3000, half = (sgn) => {
    ctx.save(); ctx.translate(sgn * dx * gap / 2, sgn * dy * gap / 2 + Math.abs(gap) * 0.04);
    const rot = sgn * gap * 0.00012; ctx.translate(540, 900); ctx.rotate(rot); ctx.translate(-540, -900);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0] + sgn * dx * far, b[1] + sgn * dy * far); ctx.lineTo(a[0] + sgn * dx * far, a[1] + sgn * dy * far); ctx.closePath(); ctx.clip();
    CH.board({ ...o, crack: 0 }); ctx.restore();
  };
  if (gap > 0.5) {
    // red glow + jagged torn edges in the gap
    const m = base(4, 4), g = ctx.createRadialGradient(m[0], m[1], 10, m[0], m[1], 520); g.addColorStop(0, rgba(P.blood, Math.min(0.4, gap / 400))); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 200, W, 1500);
  }
  half(-1); half(1);
  if (o.crack) CH.crackLine(base(4, -0.4), base(4, 8.4), o.crack, 7, o.crackW ?? 7);
  return (u, v) => { const q = base(u, v), sg = u < 4 ? -1 : 1, rot = sg * gap * 0.00012, x = q[0] - 540, y = q[1] - 900;
    return [540 + x * Math.cos(rot) - y * Math.sin(rot) + sg * dx * gap / 2, 900 + x * Math.sin(rot) + y * Math.cos(rot) + sg * dy * gap / 2 + Math.abs(gap) * 0.04, q[2]]; };
}

export function buildB(add, cue) {
  // ================= LINE 4: "Vira fought back. Brother against brother, the kingdom split in two." =================
  const tBack = Wd('back', 4), tBro = Wd('brother', 4), tAg = Wd('against', 4), tKing = Wd('kingdom', 4), tSplit = Wd('split', 4), tTwo = Wd('two', 4);
  const bro2 = tAg + 0.4;  // second "brother"
  // b1: the two princes face off; Vira lunges forward on "back"
  add({ id: 'b1', at: L(4), cam: [540, 950], zoom: 0.07, note: 'princes face off, Vira lunges on "back"',
    draw(lt, d, t) {
      CH.table(t);
      const hit = t - tBack, sh = hit > 0 ? shake(t, 10 * Math.exp(-hit * 9)) : [0, 0];
      ctx.save(); ctx.translate(sh[0], sh[1]);
      const proj = CH.board({ cx: 540, cy: 960, size: 1400, tilt: 0.75, rot: -0.05 + lt * 0.02 });
      const lunge = eob(seg(t, Wd('fought', 4), tBack));
      const recoil = hit > 0 ? Math.sin(clamp(hit / 0.35) * Math.PI) * 0.12 : 0;
      pieces(proj, [
        { k: 'prince', u: 1.6 + 1.0 * lunge, v: 5, sc: 1.05, o: EB({ sash: P.indigoHi, crown: true }) },
        { k: 'prince', u: 5.3 + recoil * 2, v: 5, sc: 1.05, o: { col: 'ivory', sash: P.blood, crown: true, tip: recoil } },
      ]);
      ctx.restore();
      CH.spot(540, 950, 760, 0.9, t); CH.motes(t, 40, 3);
      CH.redFlash(hit > 0 ? 0.5 * Math.exp(-hit * 7) : 0);
      CH.vig(0.6);
    } });
  cue(tBack, 'slam', { gain: 0.9 }); cue(Wd('fought', 4), 'slide', { gain: 0.6 });

  // b2: pawns of each colour clash in the middle files
  add({ id: 'b2', at: tBro, cam: [540, 900], zoom: 0.08, note: 'ebony and ivory pawns clash mid-board',
    draw(lt, d, t) {
      CH.table(t);
      const proj = CH.board({ cx: 540, cy: 900, size: 1120, tilt: 0.62, rot: 0.12 - lt * 0.08 });
      const hits = [tAg, bro2, bro2 + 0.32], rows = [[2, 0], [4, 1], [6, 2], [3, 1], [5, 2]], L2 = [];
      rows.forEach(([v, h], i) => {
        const th = hits[h] + (i > 2 ? 0.08 : 0), p = eio(seg(t, th - 0.45, th)), af = t - th;
        const tipE = af > 0 && (i % 2 === 0) ? -eo(clamp(af / 0.4)) * 1.35 : 0;
        const tipI = af > 0 && (i % 2 === 1) ? eo(clamp(af / 0.4)) * 1.35 : 0;
        const bump = af > 0 ? Math.exp(-af * 6) * 0.15 : 0;
        L2.push({ k: 'pawn', u: lerp(0, 3, p) - bump, v, sc: 0.9, o: EB({ tip: tipE }) });
        L2.push({ k: 'pawn', u: lerp(7, 4, p) + bump, v, sc: 0.9, o: { col: 'ivory', sash: P.blood, tip: tipI } });
      });
      pieces(proj, L2);
      CH.spot(540, 900, 820, 0.88, t); CH.motes(t, 34, 9);
      const fl = Math.max(...hits.map((h) => (t > h ? Math.exp(-(t - h) * 9) : 0)));
      CH.redFlash(fl * 0.35); CH.vig(0.6);
    } });
  [tAg, bro2, bro2 + 0.32].forEach((h, i) => cue(h, i === 1 ? 'thud' : 'tock', { gain: 0.8, pan: i % 2 ? 0.3 : -0.3 }));

  // b3: board cracks along the middle file and the halves drift apart; marbled-ink wipe out
  add({ id: 'b3', at: tKing, cam: [540, 900], zoom: 0.05, note: 'crack + board SPLIT, halves drift apart, ink wipe',
    draw(lt, d, t) {
      CH.table(t);
      const crack = seg(t, tSplit - 0.25, tSplit + 0.1), sp = eio(seg(t, tSplit + 0.1, tTwo + 0.4)) * 1.6 + seg(t, tTwo + 0.4, tTwo + 2) * 0.5;
      const af = t - (tSplit + 0.1), sh = af > 0 ? shake(t, 9 * Math.exp(-af * 6)) : [0, 0];
      ctx.save(); ctx.translate(sh[0], sh[1]);
      const tilt = 0.4 + lt * 0.03, rot = -0.06 + lt * 0.03;
      const proj = splitBoard({ cx: 540, cy: 860, size: 960, tilt, rot, crack: sp > 0.05 ? 0 : crack, crackW: 9 }, sp * 150);
      const wob = Math.sin(t * 3) * 0.04 * clamp(sp);
      pieces(proj, [
        { k: 'prince', u: 1.5, v: 4, sc: 0.85, o: EB({ sash: P.indigoHi, crown: true, tip: -wob }) },
        { k: 'pawn', u: 0.5, v: 2, sc: 0.6, o: EB() }, { k: 'pawn', u: 2.5, v: 6, sc: 0.6, o: EB() }, { k: 'pawn', u: 2.6, v: 1, sc: 0.6, o: EB() },
        { k: 'prince', u: 5.5, v: 3, sc: 0.85, o: { col: 'ivory', sash: P.blood, crown: true, tip: wob } },
        { k: 'pawn', u: 6.5, v: 5, sc: 0.6, o: { col: 'ivory' } }, { k: 'pawn', u: 4.5, v: 6, sc: 0.6, o: { col: 'ivory' } }, { k: 'pawn', u: 7, v: 1, sc: 0.6, o: { col: 'ivory' } },
      ]);
      ctx.restore();
      CH.spot(540, 900, 900, 0.88, t); CH.motes(t, 30, 21);
      CH.redFlash(af > 0 ? 0.45 * Math.exp(-af * 6) : 0); CH.vig(0.55);
      CH.marble(t, seg(lt, d - 0.42, d), { x: 540, y: 900, seed: 2 });
    } });
  cue(tSplit - 0.2, 'zip', { gain: 0.7 }); cue(tSplit + 0.1, 'slam', { gain: 1 }); cue(tTwo, 'rumble', { gain: 0.5, dur: 1.2 });

  // ================= LINE 5: "Some accounts say Sundara fled north and asked the Delhi Sultanate for help." =================
  const tSome = Wd('some', 5), tFled = Wd('fled', 5), tNorth = Wd('north', 5), tDelhi = Wd('delhi', 5), tSult = Wd('sultanate', 5), tHelp = Wd('help', 5);
  // b4: ink recedes; SOME ACCOUNTS; ivory prince on its own half starts sliding north
  add({ id: 'b4', at: L(5), cam: [540, 900], zoom: 0.07, note: 'tag SOME ACCOUNTS, ivory prince slides north on its half',
    draw(lt, d, t) {
      CH.table(t);
      const proj = splitBoard({ cx: 540, cy: 900, size: 960, tilt: 0.5, rot: 0.08 - lt * 0.03 }, 260 + lt * 30);
      const v = 5 - stepf(seg(t, tSome + 0.3, tFled + 0.2) * 2.2) * 1.0;
      pieces(proj, [
        { k: 'pawn', u: 2.5, v: 3, sc: 0.62, o: EB({ a: 0.7 }) }, { k: 'prince', u: 1.5, v: 5, sc: 0.85, o: EB({ sash: P.indigoHi, crown: true, a: 0.8 }) },
        { k: 'prince', u: 5.5, v, sc: 1.05, o: { col: 'ivory', sash: P.blood, crown: true } },
        { k: 'pawn', u: 6.5, v: 6, sc: 0.62, o: { col: 'ivory' } },
      ]);
      const [px, py] = proj(6, v + 0.5);
      spots([[px, py - 120, 620, 1], [380, 900, 500, 0.5]], 0.9, t); CH.motes(t, 26, 33, px, 500);
      CH.vig(0.5);
      CH.tag('SOME ACCOUNTS', 540, 250, { sc: eob(seg(t, tSome, tSome + 0.35)), a: seg(t, tSome, tSome + 0.15), ink: P.indigo, rot: -0.02 });
      CH.marble(t, 1 - seg(lt, 0, 0.4), { x: 540, y: 900, seed: 2 });
    } });
  cue(tSome, 'pop', { gain: 0.7 }); cue(tSome + 0.35, 'slide', { gain: 0.5 }); cue(tSome + 0.8, 'slide', { gain: 0.5 });

  // b5: he slides off the top edge into the dark map; red ink trail runs north
  const trail = []; for (let i = 0; i <= 30; i++) { const k = i / 30; trail.push([560 + Math.sin(k * 5) * 90 + k * 40, 1180 - k * 1500]); }
  add({ id: 'b5', at: tFled, cam: [540, 900], zoom: 0.05, note: 'ivory prince slides off board top into dark map, ink trail north',
    draw(lt, d, t) {
      const pan = eio(clamp(lt / d)) * 520;
      CH.table(t);
      ctx.save(); ctx.translate(0, pan);
      ctx.drawImage(mapSheet(), 0, -1600, W, 2600);
      const proj = CH.board({ cx: 540, cy: 1380, size: 820, tilt: 0.42, rot: 0.02 });
      // prince position along the trail
      const p = eio(seg(t, tFled, Wd('the', 5) + 0.5)) * 0.62;
      inkTrail(trail, p, t, 11);
      const n = trail.length - 1, m = p * n, k = Math.min(n - 1, Math.floor(m)), a = trail[k], b = trail[k + 1];
      const x = lerp(a[0], b[0], m - k), y = lerp(a[1], b[1], m - k), s = 1.0 - p * 0.4;
      CH.piece('prince', x, y, s, { col: 'ivory', sash: P.blood, crown: true, glow: 0.4 });
      ctx.restore();
      spots([[x, y + pan - 110, 520, 1], [540, 1380 + pan, 600, 0.35]], 0.92, t);
      CH.motes(t, 30, 44, x, 500); CH.vig(0.6);
      CH.tag('SOME ACCOUNTS', 540, 250, { ink: P.indigo, rot: -0.02, a: 1 - seg(lt, 0.6, 1.0) });
    } });
  cue(tFled, 'whoosh', { gain: 0.7 }); cue(tNorth, 'slide', { gain: 0.6 });

  // b6: far north, a second spotlight: steel pieces rise out of the dark; the small ivory prince arrives to ask
  const army = [];
  for (let i = 0; i < 11; i++) { const r = Math.floor(i / 4), c = i % 4; army.push({ k: ['elephant', 'horse', 'pawn'][r] || 'pawn', x: 330 + c * 170 + (r % 2) * 60 + (rnd(i) - 0.5) * 30, y: 560 + r * 150, at: tSult - 0.15 + i * 0.09 }); }
  add({ id: 'b6', at: tDelhi, cam: [540, 700], zoom: 0.09, note: 'second spotlight: steel pieces appear, ivory prince arrives',
    draw(lt, d, t) {
      CH.table(t);
      ctx.drawImage(mapSheet(), 0, -900 + lt * 30, W, 2600);
      // trail coming up from the bottom to the prince
      const arr = eo(seg(t, tDelhi, tHelp + 0.2)), px = 560, py = lerp(1450, 1060, arr);
      line([[600, 1950], [580, 1700], [560 + Math.sin(t) * 4, py + 20]], P.blood, 11);
      army.forEach((a) => {
        const k = eo(seg(t, a.at, a.at + 0.45)); if (k <= 0) return;
        const s = (0.62 + (a.y - 500) / 1200) * (a.k === 'pawn' ? 0.9 : 0.85);
        CH.piece(a.k, a.x + Math.sin(t * 2 + a.x) * 2, a.y + (1 - k) * 40, s, { col: 'steel', a: k, glow: 0.25 * k, glowCol: P.steelHi });
      });
      // prince bows on "help"
      const bow = Math.sin(clamp((t - tHelp + 0.1) / 0.6) * Math.PI) * 0.18;
      CH.piece('prince', px, py, 0.8, { col: 'ivory', sash: P.blood, crown: true, tip: -bow });
      const ga = seg(t, tSult - 0.3, tSult + 0.4);
      spots([[560, 640, 680 * eo(ga) + 1, 1], [px, py - 100, 420, 1]], 0.92, t);
      CH.motes(t, 30, 55, 560, 700); CH.vig(0.55);
    } });
  cue(tSult - 0.2, 'swell', { gain: 0.6, dur: 1.4 }); army.forEach((a, i) => i % 3 === 0 && cue(a.at, 'tock', { gain: 0.4, pan: (a.x - 540) / 600 }));
  cue(tHelp, 'heartbeat', { gain: 0.5 });

  // ================= LINE 6: "In thirteen eleven, Malik Kafur's army marched south." =================
  const t13 = Wd('thirteen', 6), t11 = Wd('eleven', 6), tMalik = Wd('malik', 6), tKaf = Wd("kafur", 6), tArmy = Wd('army', 6), tMarch = Wd('marched', 6), tSouth = Wd('south', 6);
  const steelRow = (v0, kinds, sc) => kinds.map((k, u) => ({ k, u, v: v0, sc, o: { col: 'steel', glow: 0.2, glowCol: P.steelHi } }));
  // b7: carved 1311 over a board whose far rank fills with steel pieces
  add({ id: 'b7', at: L(6), cam: [540, 700], zoom: 0.08, note: 'carved title 1311 on drum hits; steel ranks waiting',
    draw(lt, d, t) {
      CH.table(t);
      const proj = CH.board({ cx: 540, cy: 1040, size: 1020, tilt: 0.6, rot: 0.05 - lt * 0.04 });
      const creep = eio(seg(lt, 0.4, d)) * 0.5;
      pieces(proj, [...steelRow(creep, ['elephant', 'horse', 'pawn', 'elephant', 'elephant', 'pawn', 'horse', 'elephant'], 0.68),
        ...steelRow(1 + creep, Array(8).fill('pawn'), 0.68)]);
      CH.spot(540, 820, 820, 0.9, t);
      const hit = Math.max(t > t13 ? Math.exp(-(t - t13) * 8) : 0, t > t11 ? Math.exp(-(t - t11) * 8) : 0);
      ctx.save(); ctx.translate(540, 560); ctx.scale(1 + hit * 0.06, 1 + hit * 0.06); ctx.translate(-540, -560);
      CH.title('1311', 540, 620, 300, seg(t, t13 - 0.05, t11 + 0.25), { edge: P.steelHi });
      ctx.restore();
      CH.motes(t, 40, 66); CH.vig(0.55);
    } });
  cue(t13, 'drum', { gain: 0.9 }); cue(t11, 'drum', { gain: 1 }); cue(t13 + 0.05, 'chisel', { gain: 0.4 });

  // b8: formation slides down the files toward the viewer; ILLUSTRATION
  add({ id: 'b8', at: tMalik, cam: [540, 900], zoom: 0.07, note: 'steel formation slides down the files; tag ILLUSTRATION',
    draw(lt, d, t) {
      CH.table(t);
      const rb = Math.sin(t * 31) * 2.5;
      const proj = CH.board({ cx: 540, cy: 940 + rb, size: 1060, tilt: 0.62, rot: -0.04 + lt * 0.03 });
      const adv = stepf((t - tMalik) / 0.36) * 0.7;
      const L3 = [];
      [['pawn', 2.0], ['horse', 1.0], ['elephant', 0], ['elephant', -1]].forEach(([k, v0], r) => {
        for (let u = 0; u < 8; u++) { if (k !== 'pawn' && (u + r) % 2) continue; L3.push({ k, u, v: v0 + adv - 1.2, sc: k === 'pawn' ? 0.68 : 0.72, o: { col: 'steel', glow: 0.2, glowCol: P.steelHi } }); }
      });
      pieces(proj, L3);
      CH.spot(540, 900, 860, 0.88, t); CH.motes(t, 30, 77); CH.vig(0.55);
      CH.tag('ILLUSTRATION', 540, 230, { sc: eob(seg(lt, 0.05, 0.4)), a: seg(lt, 0.05, 0.2), ink: P.steelDk });
    } });
  cue(tMalik, 'rumble', { gain: 0.6, dur: 2.4 }); cue(tKaf, 'drum', { gain: 0.7 }); cue(tArmy, 'drum', { gain: 0.8 });
  for (let k = 1; k < 4; k++) cue(tMalik + k * 0.36, 'slide', { gain: 0.35 });

  // b9: low angle - steel elephants and horses loom toward the camera; SLAM on "south"; ink wipe out
  add({ id: 'b9', at: tMarch, cam: [540, 1000], zoom: 0.12, note: 'low-angle steel elephants loom; slam on "south"; ink wipe',
    draw(lt, d, t) {
      CH.table(t);
      const hit = t - tSouth, sh = hit > 0 ? shake(t, 12 * Math.exp(-hit * 6)) : shake(t, 2);
      ctx.save(); ctx.translate(sh[0], sh[1]);
      const proj = CH.board({ cx: 540, cy: 1000, size: 1500, tilt: 0.8, rot: 0.03 });
      const adv = eio(seg(t, tMarch, tSouth)) * 1.6 + seg(t, tSouth, tSouth + 2) * 0.8;
      pieces(proj, [
        { k: 'elephant', u: 2, v: 1.8 + adv, sc: 0.8, o: { col: 'steel', glow: 0.25, glowCol: P.steelHi } },
        { k: 'elephant', u: 5, v: 1.4 + adv, sc: 0.8, o: { col: 'steel', glow: 0.25, glowCol: P.steelHi } },
        { k: 'horse', u: 3.5, v: 0.4 + adv, sc: 0.7, o: { col: 'steel' } }, { k: 'horse', u: 0.5, v: 0.2 + adv, sc: 0.7, o: { col: 'steel' } },
        { k: 'horse', u: 6.6, v: 0.5 + adv, sc: 0.7, o: { col: 'steel' } },
        { k: 'pawn', u: 1.2, v: -0.6 + adv, sc: 0.6, o: { col: 'steel' } }, { k: 'pawn', u: 4.5, v: -0.8 + adv, sc: 0.6, o: { col: 'steel' } },
      ]);
      ctx.restore();
      CH.spot(540, 860, 900, 0.88, t); CH.motes(t, 36, 88);
      CH.redFlash(hit > 0 ? 0.45 * Math.exp(-hit * 7) : 0); CH.vig(0.6);
      CH.marble(t, seg(lt, d - 0.4, d), { x: 540, y: 820, seed: 5, cols: [P.ink, P.steelDk, P.indigo, P.paper] });
    } });
  cue(tMarch, 'drum', { gain: 0.8 }); cue(tSouth, 'slam', { gain: 1 }); cue(Le(6) + 0.05, 'whoosh', { gain: 0.6 });

  // ================= LINE 7: "Their court poet wrote that Vira's capital stood empty. The king had fled." =================
  const tCourt = Wd('court', 7), tWrote = Wd('wrote', 7), tVira = Wd("vira", 7), tEmpty = Wd('empty', 7), tThe = Wd('king', 7) - 0.12, tFled7 = Wd('fled', 7);
  // b10: parchment fills with abstract ink rows; COURT POET WROTE
  add({ id: 'b10', at: L(7), cam: [540, 760], zoom: 0.08, note: 'tag COURT POET WROTE, parchment rows ink in',
    draw(lt, d, t) {
      CH.table(t);
      CH.chronicle(540 + Math.sin(t * 0.8) * 8, 790 + (1 - eo(clamp(lt / 0.6))) * 90, 0.1 + 0.9 * seg(t, tCourt, tVira + 0.2), { w: 620, h: 760, rot: -0.04 + lt * 0.025, rows: 12, red: [6, 7] });
      CH.spot(540, 790, 760, 0.85, t); CH.motes(t, 30, 99); CH.vig(0.5);
      CH.tag('COURT POET WROTE', 540, 270, { sc: eob(seg(t, tCourt, tCourt + 0.35)), a: seg(t, tCourt, tCourt + 0.15), ink: P.blood, rot: 0.015 });
      CH.marble(t, 1 - seg(lt, 0, 0.28), { x: 540, y: 820, seed: 5, cols: [P.ink, P.steelDk, P.indigo, P.paper] });
    } });
  cue(tCourt, 'pop', { gain: 0.7 }); cue(tWrote, 'chisel', { gain: 0.4 });

  // b11: the capital square stands empty - only the shadow ring; spotlight irises in on "empty"
  add({ id: 'b11', at: tVira, cam: [540, 860], zoom: 0.1, note: 'empty centre square, shadow ring fading, iris tightens on "empty"',
    draw(lt, d, t) {
      CH.table(t);
      const proj = CH.board({ cx: 540, cy: 840, size: 1040, tilt: 0.48, rot: 0.25 - lt * 0.09, glow: t > tEmpty - 0.1 ? [3, 3] : null });
      const [x, y, s] = proj(3.5, 3.5);
      ring(x, y, s * 1.1, 1 - seg(t, tEmpty, tThe + 0.3) * 0.6);
      pieces(proj, [
        { k: 'pawn', u: 1, v: 5, sc: 0.75, o: EB({ tip: -1.4 }) }, { k: 'pawn', u: 5, v: 2, sc: 0.75, o: EB({ tip: 1.4 }) },
        { k: 'pawn', u: 6, v: 6, sc: 0.75, o: EB() }, { k: 'tower', u: 0, v: 1, sc: 0.75, o: EB({ a: 0.8 }) },
      ]);
      const ir = lerp(860, 330, eio(seg(t, tEmpty - 0.35, tEmpty + 0.2)));
      CH.spot(x, y - 40, ir, 0.94, t); CH.motes(t, 24, 111, x, 420); CH.vig(0.5);
    } });
  cue(tEmpty, 'bell', { gain: 0.6 }); cue(tEmpty - 0.3, 'inhale', { gain: 0.4 });

  // b12: "The king had fled" - the ebony prince slides away off the board edge; iris closes on the empty square
  add({ id: 'b12', at: tThe, cam: [540, 880], zoom: 0.08, note: 'ebony prince slides off-board into dark; iris closes on empty square',
    draw(lt, d, t) {
      CH.table(t);
      const proj = CH.board({ cx: 540, cy: 860, size: 1000, tilt: 0.55, rot: 0.04 + lt * 0.03, glow: [3, 3] });
      const [x, y, s] = proj(3.5, 3.5);
      ring(x, y, s * 0.85, 0.45 - seg(lt, 0, d) * 0.45);
      const go = eio(seg(t, tThe, tFled7 + 0.35));
      const u = lerp(5, 10.5, go), v = lerp(3, 4.5, go);
      const [px, py, ps] = proj(u + 0.5, v + 0.5);
      const off = clamp((u - 7.6) / 1.5);
      // faint drag mark along the rank
      const [sx, sy] = proj(4.2, 3.6); line([[sx, sy], [px - 30, py]], 'rgba(0,0,0,0.5)', 10 * ps);
      CH.piece('prince', px, py + off * off * 60, ps * 1.05, EB({ sash: P.indigoHi, crown: true, a: 1 - off * 0.6, tip: off * 0.25 }));
      const ir = lerp(900, 150, eio(seg(t, tFled7 + 0.1, L(8) - 0.05)));
      spots([[x, y - 40, ir, 1], [px, py - 120, 420 * (1 - off), 0.8]], 0.94, t); CH.motes(t, 24, 122, x, 500); CH.vig(0.5);
    } });
  cue(tThe + 0.05, 'slide', { gain: 0.6 }); cue(tFled7, 'whoosh', { gain: 0.7 }); cue(tFled7 + 0.5, 'heartbeat', { gain: 0.5 });
}
