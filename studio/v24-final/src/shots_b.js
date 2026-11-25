// Worker B: script lines 4-7 (L(4) .. L(8)). Breach, 1924 history + gunpowder, royal women in the lit windows, the blast,
// the king rides out and his crown falls. Reverse-glass painting look (glass.js kit).
import * as G from './glass.js';
import { L, Le, Wd } from './core/timing.js';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, circle, line } from './core/lib.js';
import { cached, rgba, mixc, lg } from './art.js';

const P = G.PAL;
const SIL = '#4A1E3A';                                   // window silhouettes of the veiled women (cut-out plum)
const shake = (t, a, f = 38) => [Math.sin(t * f) * a, Math.cos(t * f * 1.3) * a];

// window geometry of G.palace (local coords): [wx, wy(base), ww, wh]
const WINS = (() => { const o = [];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) o.push([-300 + i * 100, -40 - r * 150, 54, 100]);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) o.push([-50 + i * 100, -360 - r * 110, 48, 80]);
  return o; })();
const archPath = (wx, wy, ww, wh) => { ctx.beginPath(); ctx.moveTo(wx - ww / 2, wy); ctx.lineTo(wx - ww / 2, wy - wh * 0.6); ctx.quadraticCurveTo(wx - ww / 2, wy - wh, wx, wy - wh); ctx.quadraticCurveTo(wx + ww / 2, wy - wh, wx + ww / 2, wy - wh * 0.6); ctx.lineTo(wx + ww / 2, wy); ctx.closePath(); };
const silPath = (wx, wy, ww, wh, sw = 0) => { ctx.beginPath(); ctx.moveTo(wx - 0.36 * ww, wy); ctx.lineTo(wx - 0.24 * ww + sw, wy - 0.5 * wh);
  ctx.quadraticCurveTo(wx - 0.24 * ww + sw, wy - 0.84 * wh, wx + sw, wy - 0.84 * wh); ctx.quadraticCurveTo(wx + 0.24 * ww + sw, wy - 0.84 * wh, wx + 0.24 * ww + sw, wy - 0.5 * wh); ctx.lineTo(wx + 0.36 * ww, wy); ctx.closePath(); };
// overlay on a palace drawn at (x, y, s): gold fill per window (lit[k] 0..1) and a veiled silhouette (sil[k] 0..1)
function winFill(x, y, s, t, litF, silF) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  WINS.forEach(([wx, wy, ww, wh], k) => {
    const a = litF(k), b = silF(k); if (a <= 0) return;
    archPath(wx, wy, ww, wh); ctx.globalAlpha = a; ctx.fillStyle = mixc(P.gilt, P.giltHi, 0.6 + 0.4 * Math.sin(t * 3 + k)); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = P.ink; ctx.stroke();
    if (b > 0) { ctx.save(); archPath(wx, wy, ww, wh); ctx.clip(); ctx.translate(0, (1 - eo(b)) * wh * 0.8); silPath(wx, wy, ww, wh, Math.sin(t * 2 + k) * 2); ctx.globalAlpha = a; ctx.fillStyle = SIL; ctx.fill(); ctx.restore(); }
    ctx.globalAlpha = 1;
  });
  ctx.restore();
}
function stars(r, t, n = 26, seed = 0) {
  for (let i = 0; i < n; i++) { const tw = 0.5 + 0.5 * Math.sin(t * 2.5 + i * 1.7); ctx.save(); ctx.translate(r.x + rnd(i + seed) * r.w, r.y + 40 + rnd(i * 5 + seed) * 520); ctx.rotate(0.785);
    ctx.fillStyle = rgba(P.giltHi, 0.35 + 0.5 * tw); ctx.fillRect(-5, -5, 10, 10); ctx.restore(); }
}
// pennant on a pole whose flag slides down the pole by drop 0..1
function flagPole(x, yb, ph, drop, col, t) {
  line([[x, yb], [x, yb - ph]], P.ink, 8); circle(x, yb - ph - 6, 9, P.gilt);
  const fy = yb - ph + 6 + drop * (ph - 90);
  ctx.beginPath(); ctx.moveTo(x, fy); for (let i = 0; i <= 10; i++) { const u = i / 10; ctx.lineTo(x + u * 120, fy + Math.sin(t * 6 + u * 5) * 9 * u + drop * u * 40); }
  for (let i = 10; i >= 0; i--) { const u = i / 10; ctx.lineTo(x + u * 120 - (i === 10 ? 26 : 0), fy + 62 + Math.sin(t * 6 + u * 5) * 9 * u + drop * u * 40 - (i === 10 ? 30 : 0)); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.stroke();
}
function crown(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  G.paint(() => { ctx.beginPath(); ctx.moveTo(-30, 20); ctx.lineTo(-36, -24); ctx.lineTo(-14, -6); ctx.lineTo(0, -42); ctx.lineTo(14, -6); ctx.lineTo(36, -24); ctx.lineTo(30, 20); ctx.closePath(); },
    lg(0, -42, 0, 20, [[0, P.giltHi], [0.5, P.gilt], [1, P.giltDk]]), 1, { lw: 3 });
  line([[-30, 12], [30, 12]], P.ink, 2.5);
  circle(0, 2, 6, P.vermil); circle(-18, 6, 4, P.green); circle(18, 6, 4, P.green);
  for (const [cx, cy] of [[-36, -24], [0, -42], [36, -24]]) circle(cx, cy, 4, P.giltHi);
  ctx.restore();
}
function ground(r, y, col = '#3A2A1A') { ctx.fillStyle = col; ctx.fillRect(r.x, y, r.w, r.y + r.h - y); line([[r.x, y], [r.x + r.w, y]], P.ink, 6); }
const popTag = (txt, x, y, lt, at, o = {}) => { const q = clamp((lt - at) / 0.35); if (q > 0) G.tag(txt, x, y, { ...o, sc: eob(q) * (o.sc ?? 1) }); };

export function buildB(add, cue) {
  // ---------------- line 4: the breach ----------------
  const tBr = Wd('breached', 4) + 0.08, tCity = Wd('city', 4) - 0.08, tFall = Wd('fall', 4);
  add({ id: 'b1', at: L(4), cam: [540, 1000], zoom: 0.07, note: 'vermilion ranks before the green-bannered wall; breach on "breached", crack',
    draw(lt, d, t) {
      const at = L(4), br = eo(seg(t, tBr, tBr + 0.45)), sh = t > tBr ? Math.max(0, 1 - (t - tBr) / 0.5) : 0, [sx, sy] = shake(t, 10 * sh);
      const r = G.panel(t, { ground: [P.night, P.ultra], rot: sx * 0.002 });
      ctx.save(); ctx.translate(sx, sy);
      stars(r, t, 22, 3);
      G.palace(540, 1150, 0.75, { lit: 1, t });
      G.wall(r.x - 20, r.x + r.w + 20, 1150, 330, { breach: br, bx: 540 });
      for (const x of [150, 330, 750, 930]) G.banner(x, 786, 0.75, P.green, t + x);
      if (br > 0) G.puffs(540, 1060, t, 6, 0.75 * br, 5);
      ground(r, 1150, '#2E2216');
      const adv = eo(seg(t, at, at + 1.6)) * 60;
      G.crowd(30 + adv, 1060 + adv, 1300, 9, 0.42, { robe: P.vermilDk, walk: t * 7, banners: 3, t, shield: P.ochre });
      G.crowd(-40 + adv * 1.4, 1120 + adv * 1.4, 1440, 7, 0.6, { robe: P.vermil, walk: t * 7 + 1, t, shield: P.gilt });
      ctx.restore();
      G.crack(560, 640, seg(t, tBr, tBr + 0.25), 7, { len: 520 });
      G.flash(0.45 * Math.max(0, 1 - (t - tBr) / 0.2) * (t > tBr ? 1 : 0), P.fireHi);
      G.glassTop(t, r);
    } });
  cue(L(4), 'drum', { gain: 0.8 }); cue(tBr, 'thud', { gain: 1 }); cue(tBr + 0.03, 'chisel', { gain: 0.6 }); cue(tBr + 0.1, 'rumble', { gain: 0.5, dur: 0.9 });

  add({ id: 'b2', at: tCity, cam: [540, 820], zoom: 0.08, note: 'palace through the gap; sky turns vermilion, smoke, green banners lower on "fall"',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: [P.night, '#2A1E48'] });
      const red = eo(clamp(lt / d)); ctx.fillStyle = lg(0, r.y, 0, r.y + r.h, [[0, rgba(P.vermilDk, 0.2 + 0.5 * red)], [0.7, rgba(P.vermil, 0.15 + 0.55 * red)], [1, rgba(P.fire, 0.3 * red)]]); ctx.fillRect(r.x, r.y, r.w, r.h);
      stars(r, t, 14, 9);
      G.puffs(220, 1150, t, 5, 0.7, 2); G.puffs(860, 1150, t + 0.4, 5, 0.7, 8);
      const drop = eio(seg(t, tFall - 0.25, tFall + 0.7));
      G.palace(540, 1240, 1.0, { lit: 1, t, dark: 0.15 * red });
      flagPole(270, 840, 280, drop, P.green, t); flagPole(690, 840, 280, drop, P.green, t + 1); flagPole(540, 360, 220, drop, P.green, t + 2);
      G.fire(150, 1250, 0.55, t, 1); G.fire(930, 1250, 0.6, t, 4);
      ground(r, 1240, '#2E2216');
      // foreground broken-wall jaws framing the gap
      const jaw = (sgn) => { ctx.beginPath(); const x0 = sgn < 0 ? r.x - 10 : r.x + r.w + 10; ctx.moveTo(x0, r.y + r.h + 10);
        const pts = [[160, 1450], [230, 1200], [180, 1060], [250, 900], [190, 760], [120, 640], [0, 600]];
        pts.forEach(([dx, y]) => ctx.lineTo(x0 - sgn * dx, y)); ctx.lineTo(x0, 600); ctx.closePath(); };
      const sl = 40 * (1 - eo(clamp(lt / 0.6)));
      for (const sgn of [-1, 1]) { ctx.save(); ctx.translate(sgn * sl, 0); G.paint(() => jaw(sgn), '#6E3820', 1, { lw: 7 }); ctx.restore(); }
      G.glassTop(t, r);
    } });
  cue(tCity, 'whoosh', { gain: 0.5 }); cue(tFall - 0.2, 'slide', { gain: 0.6 }); cue(tFall, 'rumble', { gain: 0.5, dur: 1.2 });

  // ---------------- line 5: the 1924 history + gunpowder ----------------
  const tHist = Wd('history', 5), t19 = Wd('nineteen', 5), tSays = Wd('says', 5) - 0.12, tPack = Wd('packed', 5), tGun = Wd('gunpowder', 5) - 0.1;
  add({ id: 'b3', at: L(5), cam: [540, 820], zoom: 0.07, note: 'printed book paints in, page flips, title 1924 drops, tag 1924 HISTORY',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: [P.green, '#0C2A16'] });
      G.archTop(r, 1); G.foil(r.x + 40, r.y + 300, r.w - 80, 1000, t, 22, 4);
      const bob = Math.sin(t * 1.6) * 8, s = 1.25 + 0.05 * eo(clamp(lt / d)), by = 820 + bob - 120 * (1 - eo(clamp(lt / 0.5)));
      G.book(540, by, s, seg(lt, 0.15, 1.3), t);
      // a page flipping right to left
      const f = seg(lt, 0.0, 0.7); if (f < 1) { ctx.save(); ctx.translate(540, by); ctx.scale(s * Math.cos(f * Math.PI), s);
        G.paint(() => { ctx.beginPath(); ctx.moveTo(0, -190); ctx.quadraticCurveTo(160, -230, 330, -200); ctx.lineTo(330, 200); ctx.quadraticCurveTo(160, 170, 0, 210); ctx.closePath(); }, mixc(P.cream, '#C9B48A', f), 1, { lw: 5 });
        ctx.restore(); }
      // gilt ribbon bookmark
      ctx.save(); ctx.translate(560, by + 200 * s); ctx.rotate(Math.sin(t * 2.4) * 0.12); ctx.fillStyle = P.vermil; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(14, 70); ctx.lineTo(0, 54); ctx.lineTo(-14, 70); ctx.closePath(); ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
      G.glassTop(t, r);
      G.title('1924', 540, 1275, 230, seg(t, t19 - 0.05, Wd('four', 5) + 0.1));
      popTag('1924 HISTORY', 540, 330, t, tHist);
    } });
  cue(L(5), 'whoosh', { gain: 0.5 }); cue(L(5) + 0.1, 'slide', { gain: 0.5 }); cue(tHist, 'pop', { gain: 0.7 }); cue(t19, 'drum', { gain: 0.7 }); cue(Wd('four', 5), 'bell', { gain: 0.5 });

  add({ id: 'b4', at: tSays, cam: [540, 1100], zoom: 0.1, note: 'palace cutaway: cellar vault below, kegs pop in row by row on "packed"',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: [P.night, P.ultra] });
      stars(r, t, 18, 11);
      G.palace(540, 1000, 0.95, { lit: 1, t });
      ground(r, 1000, '#5A3A22');
      // the cellar opens like a cut-away (slides down)
      const op = eo(seg(lt, 0.0, 0.5)), cy0 = 1030, ch = 400 * op;
      if (ch > 2) {
        ctx.save(); ctx.beginPath(); ctx.rect(110, cy0, 860, ch); ctx.clip();
        ctx.fillStyle = '#24140A'; ctx.fillRect(110, cy0, 860, 400);
        for (let i = 0; i < 4; i++) { const ax = 110 + 107 + i * 215; ctx.beginPath(); ctx.moveTo(ax - 95, cy0 + 400); ctx.lineTo(ax - 95, cy0 + 120); ctx.quadraticCurveTo(ax - 95, cy0 + 30, ax, cy0 + 30); ctx.quadraticCurveTo(ax + 95, cy0 + 30, ax + 95, cy0 + 120); ctx.lineTo(ax + 95, cy0 + 400);
          ctx.fillStyle = '#3A2414'; ctx.fill(); ctx.strokeStyle = rgba(P.gilt, 0.6); ctx.lineWidth = 4; ctx.stroke(); }
        for (let k = 0; k < 11; k++) { const row = k < 6 ? 0 : 1, i = k % 6, q = seg(t, tPack - 0.25 + k * 0.05, tPack + k * 0.05); if (q <= 0) continue;
          const sc = eob(q) * (row ? 1.3 : 1.1); G.keg(185 + i * 142 + (row ? 70 : 0), cy0 + (row ? 395 : 225), sc, { t }); }
        ctx.restore();
        ctx.strokeStyle = P.ink; ctx.lineWidth = 7; ctx.strokeRect(110, cy0, 860, ch); ctx.strokeStyle = P.gilt; ctx.lineWidth = 3; ctx.strokeRect(120, cy0 + 10, 840, Math.max(0, ch - 20));
      }
      G.glassTop(t, r);
    } });
  cue(tSays, 'slide', { gain: 0.6 }); for (let k = 0; k < 6; k++) cue(tPack - 0.2 + k * 0.1, 'pop', { gain: 0.45, pan: -0.6 + k * 0.2 });

  add({ id: 'b5', at: tGun, cam: [540, 950], zoom: 0.08, note: 'close on kegs in the vault, fuses draw in, sparks; tag GUNPOWDER',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: ['#3A2414', '#140A04'] });
      const px = -40 * eio(clamp(lt / d));
      ctx.save(); ctx.translate(px, 0);
      for (let i = 0; i < 4; i++) { const ax = 60 + 130 + i * 280; ctx.beginPath(); ctx.moveTo(ax - 120, 1440); ctx.lineTo(ax - 120, 520); ctx.quadraticCurveTo(ax - 120, 380, ax, 380); ctx.quadraticCurveTo(ax + 120, 380, ax + 120, 520); ctx.lineTo(ax + 120, 1440);
        ctx.fillStyle = '#1A0E06'; ctx.fill(); ctx.strokeStyle = P.gilt; ctx.lineWidth = 6; ctx.stroke(); }
      const kegs = [[200, 1060, 1.7], [470, 1080, 1.8], [740, 1060, 1.7], [960, 1080, 1.6], [320, 1420, 2.3], [640, 1430, 2.4], [940, 1420, 2.2]];
      // fuse rope drawn progressively between keg tops
      const fp = seg(lt, 0.1, 0.9), pts = kegs.slice(0, 4).map(([x, y, s]) => [x, y - 125 * s]);
      const path = [[100, 860], ...pts.flatMap(([x, y], i) => [[x - 70, y - 30 - (i % 2) * 20], [x, y]])];
      const m = fp * (path.length - 1), k = Math.floor(m), shown = path.slice(0, k + 1);
      if (k < path.length - 1) { const a = path[k], b = path[k + 1], f = m - k; shown.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]); }
      if (shown.length > 1) { line(shown, P.ink, 10); line(shown, '#C9A46A', 5); }
      kegs.forEach(([x, y, s], i) => { const q = seg(lt, i * 0.06, 0.25 + i * 0.06); if (q > 0) G.keg(x, y, s * eob(q), { t, glow: i < 4 && fp * 4 > i ? 0.8 : 0 }); });
      ctx.restore();
      G.glassTop(t, r);
      popTag('GUNPOWDER', 540, 280, t, Wd('gunpowder', 5) + 0.05, { size: 54 });
    } });
  cue(tGun, 'thud', { gain: 0.6 }); cue(Wd('gunpowder', 5) + 0.05, 'pop', { gain: 0.8 }); cue(tGun + 0.2, 'zip', { gain: 0.4 }); cue(tGun + 0.6, 'sparkle', { gain: 0.4 });

  // ---------------- line 6: the royal women ----------------
  const tIn = Wd('inside', 6) - 0.05, tEnemy = Wd('enemy', 6) - 0.08;
  const WOM = [[P.pink, P.cream], [P.cream, P.pink], ['#B04A6A', P.cream], [P.pink, P.cream], [P.cream, P.pink], ['#B04A6A', P.cream]];
  add({ id: 'b6', at: L(6), cam: [600, 1150], zoom: 0.07, note: 'veiled women walk in a dignified line into the lit palace gate',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: [P.night, P.ultra] });
      stars(r, t, 12, 21);
      const gx = 640;
      G.palace(gx, 1330, 1.5, { lit: 1, t });
      // warm light spilling from the gate
      const g = ctx.createRadialGradient(gx, 1250, 20, gx, 1250, 380); g.addColorStop(0, rgba(P.giltHi, 0.5)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(r.x, 900, r.w, 540);
      ctx.save(); ctx.translate(gx, 1330); ctx.scale(1.5, 1.5); archPath(0, 0, 100, 140); ctx.fillStyle = rgba(P.giltHi, 0.85); ctx.fill(); ctx.restore();
      ground(r, 1330, P.ochre);
      for (let i = 0; i < 9; i++) line([[r.x + i * 120 - (t * 30) % 120, 1440], [r.x + i * 120 + 40 - (t * 30) % 120, 1330]], rgba(P.ink, 0.25), 3);
      WOM.forEach(([robe, veil], i) => {
        const x = 200 - i * 175 + (lt + 0.3) * 300;
        const a = clamp((gx + 10 - x) / 70); if (a <= 0 || x < -100) return;
        ctx.save(); ctx.globalAlpha = a; G.person(x, 1410, 0.85 * (0.85 + 0.15 * a), { robe, veil, kind: 'woman', walk: t * 7 + i * 1.3, t }); ctx.restore();
      });
      G.glassTop(t, r);
    } });
  cue(L(6), 'swell', { gain: 0.45, dur: 1.4 }); for (let k = 0; k < 5; k++) cue(L(6) + 0.2 + k * 0.25, 'tock', { gain: 0.25, pan: -0.4 + k * 0.15 });

  const order = WINS.map((_, k) => k).sort((a, b) => rnd(a * 3 + 1) - rnd(b * 3 + 1)), rank = []; order.forEach((k, i) => (rank[k] = i));
  add({ id: 'b7', at: tIn, cam: [540, 820], zoom: 0.07, note: 'wide palace, dark windows fill one by one with gold light + veiled silhouettes; tag ACCOUNTS SAY',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: [P.night, '#1A2250'] });
      stars(r, t, 26, 31);
      G.puffs(130, 1240, t, 3, 0.35, 4); G.puffs(950, 1240, t, 3, 0.35, 7);
      G.palace(540, 1240, 1.05, { lit: 0, t });
      const fl = (k) => seg(lt, 0.03 + rank[k] * 0.035, 0.2 + rank[k] * 0.035);
      winFill(540, 1240, 1.05, t, fl, (k) => (k % 3 !== 2 ? seg(lt, 0.12 + rank[k] * 0.035, 0.4 + rank[k] * 0.035) : 0));
      ground(r, 1240, '#2E2216');
      G.glassTop(t, r);
      popTag('ACCOUNTS SAY', 540, 230, lt, 0.2);
    } });
  cue(tIn + 0.2, 'pop', { gain: 0.6 }); cue(tIn + 0.05, 'sparkle', { gain: 0.5 }); cue(tIn + 0.5, 'bell', { gain: 0.35 });

  add({ id: 'b8', at: tEnemy, cam: [540, 760], zoom: 0.09, note: 'close: three gold arched windows with veiled silhouettes; vermilion spear tips rise below, held back',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: [P.cream, '#D9C59A'] });
      ctx.fillStyle = P.ochre; ctx.fillRect(r.x, r.y, r.w, 120); line([[r.x, r.y + 120], [r.x + r.w, r.y + 120]], P.ink, 6);
      for (let i = 0; i < 12; i++) circle(r.x + 40 + i * 80, r.y + 150, 10, P.gilt);
      [[230, 1000], [540, 1000], [850, 1000]].forEach(([x, y], k) => {
        ctx.save(); ctx.translate(x, y);
        archPath(0, 0, 250, 640); ctx.fillStyle = P.teak; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 8; ctx.stroke();
        archPath(0, -14, 210, 600); ctx.fillStyle = lg(0, -600, 0, 0, [[0, P.giltHi], [1, P.gilt]]); ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
        ctx.save(); archPath(0, -14, 210, 600); ctx.clip(); ctx.translate(0, 30 * (1 - eo(seg(lt, k * 0.12, 0.5 + k * 0.12))));
        silPath(0, -14, 210, 560, Math.sin(t * 1.8 + k) * 5); ctx.fillStyle = SIL; ctx.fill(); ctx.restore();
        G.foil(-90, -560, 180, 200, t, 5, k * 9);
        ctx.restore();
      });
      ground(r, 1060, '#8E4A2E');
      for (let i = 0; i < 12; i++) G.foil(r.x, 1070, r.w, 40, t, 2, i);
      // enemy spears + banners rise at the bottom edge but stop below the sill
      const rise = eo(seg(lt, 0.1, 1.1)) * 160;
      for (let i = 0; i < 9; i++) { const x = r.x + 50 + i * 110, y = 1500 - rise - (i % 2) * 30; line([[x, 1460], [x + 12, y]], P.ink, 7);
        ctx.fillStyle = '#C9C2B0'; ctx.beginPath(); ctx.moveTo(x + 12, y); ctx.lineTo(x + 2, y + 34); ctx.lineTo(x + 22, y + 34); ctx.closePath(); ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.stroke(); }
      G.banner(200, 1640 - rise, 0.8, P.vermil, t); G.banner(820, 1660 - rise, 0.8, P.vermil, t + 1);
      G.glassTop(t, r);
    } });
  cue(tEnemy, 'heartbeat', { gain: 0.6 }); cue(tEnemy + 0.2, 'slide', { gain: 0.35 });

  // ---------------- line 7: the blast, the ride, the fall ----------------
  const tBlow = Wd('blown', 7), tRode = Wd('rode', 7) - 0.1, tFell = Wd('fell', 7) - 0.08;
  const litScene = (r) => { ctx.fillStyle = lg(0, r.y, 0, r.y + r.h, [[0, P.night], [1, P.ultra]]); ctx.fillRect(r.x, r.y, r.w, r.h);
    stars(r, 0, 22, 41); G.palace(540, 1240, 1.05, { lit: 1, t: 0 }); winFill(540, 1240, 1.05, 0, () => 1, (k) => (k % 3 !== 2 ? 1 : 0)); ground(r, 1240, '#2E2216'); };
  add({ id: 'b9', at: L(7), cam: [540, 820], zoom: 0.05, note: 'lit palace trembles; "blown": flash + burst + crack + SHATTER to burning palace, windows fire then dark',
    draw(lt, d, t) {
      const pre = clamp((t - L(7)) / (tBlow - L(7))), [sx, sy] = t < tBlow ? shake(t, 4 * pre * pre) : shake(t, 14 * Math.max(0, 1 - (t - tBlow) / 0.6));
      const r = G.panel(t, { ground: [P.night, P.ultra], rot: sx * 0.002, sc: 1 + 0.01 * pre });
      if (t < tBlow) { ctx.save(); ctx.translate(sx, sy); litScene(r); winFill(540, 1240, 1.05, t, () => 0.6 + 0.4 * Math.sin(t * 20), () => 0); ctx.restore(); }
      else {
        const sp = seg(t, tBlow + 0.08, tBlow + 0.85), ae = t - tBlow;
        const behind = () => { ctx.save(); ctx.translate(sx, sy);
          ctx.fillStyle = lg(0, r.y, 0, r.y + r.h, [[0, P.vermilDk], [0.7, P.vermil], [1, P.fire]]); ctx.fillRect(r.x, r.y, r.w, r.h);
          G.puffs(540, 900, t, 9, 0.85, 3); G.puffs(260, 1100, t + 0.5, 5, 0.7, 13); G.puffs(820, 1100, t + 0.2, 5, 0.7, 17);
          const burn = 1 - seg(ae, 0.5, 1.2);
          G.palace(540, 1240, 1.05, { lit: 0, burn: Math.max(0.01, burn), dark: 0.2 + 0.6 * seg(ae, 0.4, 1.2), t });
          G.fire(220, 860, 0.8, t, 1); G.fire(860, 860, 0.8, t, 3); G.fire(540, 380, 0.7, t, 5);
          ground(r, 1240, '#1E140C'); ctx.restore(); };
        G.shatter(behind, () => litScene(r), r, sp, { key: 'b9_palace', cx: 540, cy: 900, seed: 7 });
        G.burst(540, 900, 520, seg(ae, 0, 0.7));
        ctx.save(); ctx.globalAlpha = 1 - sp; G.crack(540, 900, seg(ae, 0, 0.1), 11, { len: 800, n: 11 }); ctx.restore();
        G.flash(1 - seg(ae, 0, 0.3));
      }
      G.glassTop(t, r);
    } });
  cue(tBlow, 'slam', { gain: 1 }); cue(tBlow + 0.02, 'thud', { gain: 0.9 }); cue(tBlow + 0.1, 'chisel', { gain: 0.6 }); cue(tBlow + 0.15, 'rumble', { gain: 0.8, dur: 2 });

  add({ id: 'b10', at: tRode, cam: [600, 1100], zoom: 0.07, note: 'green king + son gallop out of the smoking palace toward vermilion ranks; tag ONE VERSION',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: [P.vermilDk, '#3A0C08'] });
      G.puffs(250, 900, t, 7, 0.7, 23);
      G.palace(230, 1080, 0.72, { lit: 0, dark: 0.85, t });
      G.fire(110, 820, 0.5, t, 2); G.fire(360, 820, 0.45, t, 6);
      ground(r, 1080, '#3A2414');
      G.crowd(800, 1000, 1170, 4, 0.36, { robe: P.vermil, walk: 0, banners: 2, t, dir: -1, shield: P.ochre });
      const k = eio(clamp(lt / d)), x = lerp(330, 620, k);
      G.rider(x - 330, 1425, 0.85, { robe: P.greenHi, kind: 'plain', gallop: t * 14 + 1 });
      G.rider(x, 1405, 1.05, { robe: P.green, kind: 'king', gallop: t * 14 });
      // dust kicked up behind
      for (let i = 0; i < 6; i++) { const q = ((t * 1.5 + rnd(i)) % 1); ctx.save(); ctx.globalAlpha = 0.5 * (1 - q); circle(x - 560 - q * 160 + rnd(i + 4) * 80, 1420 - q * 70, 20 + q * 30, P.ochre); ctx.restore(); }
      G.crowd(930, 1100, 1450, 3, 0.55, { robe: P.vermil, walk: 0, t, dir: -1, shield: P.gilt });
      G.glassTop(t, r);
      popTag('ONE VERSION', 540, 230, lt, 0.15);
    } });
  cue(tRode, 'whoosh', { gain: 0.8 }); for (let k = 0; k < 6; k++) cue(tRode + 0.1 + k * 0.2, 'tock', { gain: 0.35, pan: -0.3 + k * 0.1 }); cue(tRode + 0.2, 'pop', { gain: 0.5 });

  add({ id: 'b11', at: tFell, cam: [540, 1000], zoom: 0.06, note: 'on "fell": the gilt crown tumbles to the ground, green pennant collapses, glass cracks',
    draw(lt, d, t) {
      const hit = 0.5, ae = lt - hit, sh = ae > 0 ? Math.max(0, 1 - ae / 0.4) : 0, [sx, sy] = shake(t, 10 * sh);
      const r = G.panel(t, { ground: [P.vermil, P.vermilDk], rot: sx * 0.002 });
      G.puffs(300, 1300, t, 5, 0.5, 31); G.puffs(800, 1300, t, 5, 0.5, 37);
      ground(r, 1240, '#3A2414');
      // green pennant pole topples
      const fall = eio(seg(lt, 0.05, 0.75)); ctx.save(); ctx.translate(950, 1240); ctx.rotate(-fall * 0.75); ctx.translate(-950, -1240); G.banner(950, 1240, 1.8, P.green, t); ctx.restore();
      // crown tumbles and settles
      const q = clamp(lt / hit), y = lt < hit ? lerp(420, 1200, q * q) : 1200 - Math.abs(Math.sin(ae * 9)) * 60 * Math.max(0, 1 - ae / 0.4),
        rot = lt < hit ? q * 4.2 : 4.2 + 0.08 * Math.sin(ae * 12) * Math.max(0, 1 - ae / 0.5) + seg(ae, 0, 0.3) * 0.2;
      ctx.save(); ctx.translate(sx, sy); crown(460 + q * 60, y, 3.6, rot); ctx.restore();
      if (ae > 0) for (let i = 0; i < 7; i++) { const k = eo(seg(ae, 0, 0.6)); ctx.save(); ctx.globalAlpha = 0.7 * (1 - k); circle(520 + (i - 3) * 50 * k * 2, 1230 - 60 * k * rnd(i), 24 + 30 * k, P.ochre); ctx.restore(); }
      G.crack(520, 1180, seg(ae, 0, 0.2), 19, { len: 760, n: 10 });
      G.flash(ae > 0 ? 0.35 * (1 - seg(ae, 0, 0.2)) : 0);
      G.glassTop(t, r);
    } });
  cue(tFell + 0.05, 'whoosh', { gain: 0.5 }); cue(tFell + 0.5, 'thud', { gain: 1 }); cue(tFell + 0.52, 'chisel', { gain: 0.7 }); cue(tFell + 0.6, 'rumble', { gain: 0.4, dur: 0.8 });
}
