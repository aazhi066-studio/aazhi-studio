// v23 worker C: script lines 8-11 (elephant boast, contested killer, loot vs feud, the crown question + end card).
import { ctx, setCtx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, circle, ell, rr, line } from './core/lib.js';
import { T, L, Le, Wd } from './core/timing.js';
import { cached, blit, rgba, lg } from './art.js';
import * as CH from './chess.js';
const P = CH.PAL;
const K = 0.74; // piece scale on a board square

// ---------- helpers ----------
const SPR = (kind, col, sash) => cached(`c_spr_${kind}_${col}_${sash || ''}`, 320, 340, 1, () => CH.piece(kind, 160, 320, 1, { col, sash }));
function spr(kind, col, x, y, s, a = 1, sash) { blit(SPR(kind, col, sash), 160, 320, x, y, s, a); }
const at = (proj, u, v) => { const [x, y, s] = proj(u, v); return [x, y, s * K]; };
function depthDraw(items) { items.sort((a, b) => a[0] - b[0]).forEach((i) => i[1]()); }
function baseGlow(x, y, r, col, a) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.36);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, rgba(col, 0.85 * a)); g.addColorStop(0.6, rgba(col, 0.35 * a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.restore();
}
function pop(text, x, y, t, t0, o = {}) {
  if (t < t0) return; const k = clamp((t - t0) / 0.3);
  CH.tag(text, x, y, { ...o, sc: (o.sc ?? 1) * eob(k), a: (o.a ?? 1) * clamp(k * 3) });
}
function slam(text, x, y, t, t0, o = {}) {
  if (t < t0) return; const k = eo(clamp((t - t0) / 0.2)), sh = (1 - clamp((t - t0) / 0.35)) * 10;
  CH.tag(text, x + Math.sin(t * 90) * sh, y + Math.cos(t * 77) * sh, { ...o, sc: (o.sc ?? 1) * lerp(2.6, 1, k), a: (o.a ?? 1) * clamp(k * 2) });
}
function sparkle(x, y, r, a, rot = 0) {
  if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = clamp(a);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.7); g.addColorStop(0, 'rgba(255,248,220,0.9)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  ctx.fillStyle = '#FFF7DC';
  for (const [w, h] of [[r * 0.09, r], [r, r * 0.09]]) { ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(w, 0); ctx.lineTo(0, h); ctx.lineTo(-w, 0); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function coin(x, y, s, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ell(x, y + 3 * s, 15 * s, 6 * s, P.goldDk); ell(x, y, 15 * s, 6 * s, '#F2CC6B'); ell(x - 3 * s, y - 1 * s, 6 * s, 2 * s, 'rgba(255,250,220,0.7)');
  ctx.restore();
}
function finish(t, sx, sy, r, seed, dark = 0.9) { CH.spot(sx, sy, r, dark, t); CH.motes(t, 34, seed, sx, 760); CH.vig(0.6); }
const wipeOut = (t, lt, d, o = {}) => CH.marble(t, eio(seg(lt, d - 0.35, d)), o);
const wipeIn = (t, lt, o = {}) => CH.marble(t, 1 - eo(seg(lt, 0, 0.42)), o);

// rolling / wobbling counter (ivory carved digits); wob 0..1 scrambles + ghosts the digits
function counter(n, x, y, size, wob, t) {
  const txt = String(n).padStart(3, '0');
  ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const cw = size * 0.66, x0 = x - (txt.length - 1) * cw / 2;
  [...txt].forEach((c, i) => {
    let ch = c; if (wob > 0.2 && rnd(i * 13 + Math.floor(t * 15)) < wob * 0.8) ch = String(Math.floor(rnd(i * 31 + Math.floor(t * 15)) * 10));
    const dx = wob * Math.sin(t * 29 + i * 2.1) * 16, dy = wob * Math.cos(t * 23 + i * 1.3) * 12, rot = wob * 0.12 * Math.sin(t * 17 + i);
    ctx.save(); ctx.translate(x0 + i * cw + dx, y + dy); ctx.rotate(rot);
    for (let g = 3; g >= 1 && wob > 0.05; g--) { ctx.globalAlpha = 0.22 * wob; ctx.fillStyle = P.ivoryMid; ctx.fillText(ch, g * 10 * wob * Math.sin(t * 11 + g), -g * 5 * wob); ctx.fillText(ch, -g * 10 * wob, g * 4 * wob); }
    ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillText(ch, 7, 9);
    ctx.fillStyle = lg(0, -size * 0.8, 0, 0, [[0, '#FFF6E2'], [1, P.ivoryMid]]); ctx.fillText(ch, 0, 0);
    ctx.fillStyle = rgba(P.blood, 0.9); ctx.fillRect(-cw * 0.4, 12, cw * 0.8, size * 0.05);
    ctx.restore();
  });
  ctx.restore();
}

// spinning crown (fake 3D: horizontal squash by |cos| + rim ellipse), floating
function spinCrown(x, y, s, ang, glint = 0) {
  const c = Math.cos(ang), sx = Math.max(0.08, Math.abs(c));
  const g = ctx.createRadialGradient(x, y - 30 * s, 10, x, y - 30 * s, 150 * s); g.addColorStop(0, rgba(P.gold, 0.4 + 0.3 * glint)); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 160 * s, y - 190 * s, 320 * s, 320 * s);
  ell(x, y + 60 * s, 46 * s, 9 * s, 'rgba(0,0,0,0.35)');
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.ellipse(0, 0, 35 * s, 9 * s, 0, 0, TAU); ctx.fillStyle = P.goldDk; ctx.fill();
  ctx.save(); ctx.scale(sx, 1); CH.crownTop(0, 0, s, c > 0 ? P.gold : '#B4842F');
  // moving shine band
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#FFF1C4'; const bx = Math.sin(ang) * 26 * s; ctx.fillRect(bx - 4 * s, -46 * s, 8 * s, 44 * s); ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, 0, 35 * s, 9 * s, 0, 0, Math.PI); ctx.strokeStyle = '#F2CC6B'; ctx.lineWidth = 4 * s * 0.4; ctx.stroke();
  ctx.restore();
  sparkle(x + Math.sin(ang) * 30 * s * sx, y - 40 * s, 70 * s * 0.5 * (0.4 + glint), 0.35 + glint, ang * 0.5);
}
function beam(x, y, w, a = 0.1) {
  ctx.save(); const g = ctx.createLinearGradient(0, -50, 0, y); g.addColorStop(0, `rgba(255,236,190,${a * 0.2})`); g.addColorStop(1, `rgba(255,236,190,${a})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 60, -50); ctx.lineTo(x + 60, -50); ctx.lineTo(x + w, y); ctx.lineTo(x - w, y); ctx.closePath(); ctx.fill(); ctx.restore();
}

// '?' made of marbled ink (marble rendered into a small offscreen, masked by the glyph)
let QC = null;
function inkQ(t, x, y, size, a = 1, sc = 1) {
  if (a <= 0) return;
  const w = Math.ceil(size * 0.72), h = Math.ceil(size * 1.0);
  if (!QC || QC.width !== w) { QC = document.createElement('canvas'); QC.width = w; QC.height = h; }
  const main = ctx, g = QC.getContext('2d');
  setCtx(g); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  g.save(); g.translate(-(540 - w / 2), -(900 - h / 2)); CH.marble(t * 1.4, 1, { full: true, cols: [P.indigo, P.paper, P.blood, P.ink, P.indigoHi], seed: 4 }); g.restore();
  g.globalCompositeOperation = 'destination-in'; g.font = `900 ${size}px Inter`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText('?', w / 2, h / 2);
  g.globalCompositeOperation = 'source-over'; setCtx(main);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText('?', 14, 18);
  ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = P.gold; ctx.strokeText('?', 0, 0);
  ctx.drawImage(QC, -w / 2, -h / 2); ctx.restore();
}
function rewindIcon(x, y, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = P.ivory;
  for (const o of [0, 46]) { ctx.beginPath(); ctx.moveTo(x - o, y); ctx.lineTo(x - o + 46, y - 32); ctx.lineTo(x - o + 46, y + 32); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

export function buildC(add, cue) {
  const t8 = L(8), hund = Wd('hundreds', 8), eleph = Wd('elephants', 8), taken = Wd('taken', 8), the8 = Wd('the', 8), nums = Wd('numbers', 8), boasts = Wd('boasts', 8);
  const t9 = L(9), contested = Wd('contested', 9), some9 = Wd('some', 9), later = Wd('later', 9), name9 = Wd('name', 9), vira = Wd('vira', 9), killer = Wd('killer', 9);
  const t10 = L(10), hist = Wd('historians', 10), raid10 = Wd('raid', 10), loot = Wd('loot', 10), not10 = Wd('not', 10), feud = Wd('feud', 10);
  const t11 = L(11), sons = Wd("son's", 11), crime = Wd('crime', 11), story11 = Wd('story', 11), far = Wd('far', 11), tell = Wd('tell', 11), below = Wd('below', 11);
  const watch = Wd('watch', 11), again = Wd('again', 11), crownW = Wd('crown', 11), END = T.dur, endc = END - 2;
  const claims = Wd('claims', 8), raided = Wd('raided', 8);

  // ===== c8a: HE CLAIMS - steel pieces sweep across the board, defenders topple =====
  const STEELK = ['horse', 'elephant', 'pawn', 'horse', 'elephant', 'pawn', 'elephant', 'horse'];
  add({ id: 'c8a', at: t8, cam: [540, 900], zoom: 0.07, note: 'HE CLAIMS: steel army sweeps the board, defenders topple', draw(lt, d, t) {
    CH.table(t);
    const proj = CH.board({ cx: 540, cy: 960, size: 940, tilt: 0.6, rot: 0.08 - 0.07 * lt });
    const items = [];
    for (let u = 0; u < 8; u++) {
      const st = 0.08 + rnd(u * 3 + 1) * 0.5, k = eio(seg(lt, st, st + 0.75)), v = lerp(-1.6, 4.7, k);
      const arr = st + 0.62, tip = (u % 2 ? 1 : -1) * 1.45 * eo(seg(lt, arr, arr + 0.32));
      const dcol = u % 2 ? 'ebony' : 'ivory', sash = u % 2 ? P.indigo : P.blood;
      const [dx, dy, ds] = at(proj, u + 0.5, 5.6 + 0.4 * eo(seg(lt, arr, arr + 0.3)));
      items.push([dy, () => { if (dcol === 'ebony') baseGlow(dx, dy, 70 * ds * 2, P.indigoHi, 0.5); CH.piece('pawn', dx, dy, ds, { col: dcol, sash, tip }); }]);
      const [bx, by, bs] = at(proj, u + 0.5, 6.7);
      if (u % 3 === 1) items.push([by, () => CH.piece(u === 4 ? 'tower' : 'elephant', bx, by, bs, { col: u % 2 ? 'ebony' : 'ivory', tip: (u % 2 ? 1 : -1) * 1.4 * eo(seg(lt, arr + 0.2, arr + 0.5)) })]);
      const [sx, sy, ss] = at(proj, u + 0.5, v);
      items.push([sy, () => CH.piece(STEELK[u], sx, sy, ss * 1.05, { col: 'steel' })]);
    }
    depthDraw(items);
    finish(t, 540, 960, 860, 1);
    slam('HE CLAIMS', 540, 300, t, claims - 0.05, { ink: P.ink, size: 70 });
    CH.redFlash(0.6 * (1 - seg(t, raided, raided + 0.3)) * (t > raided ? 1 : 0));
  } });
  cue(t8, 'whoosh', { gain: 0.7 }); cue(claims, 'slam', { gain: 0.8 }); cue(t8 + 0.3, 'rumble', { gain: 0.6, dur: 1.4 });
  for (let u = 0; u < 8; u += 2) cue(t8 + 0.08 + rnd(u * 3 + 1) * 0.5 + 0.62, 'tock', { gain: 0.5, pan: (u - 3.5) / 5 });
  cue(raided, 'thud', { gain: 0.8 });

  // ===== c8b + c8c: hundreds of elephants slid off the board into a long line; counter rises then blurs =====
  const NE = 24, slot = (i) => [80 + (i % 12) * 84 + (i >= 12 ? 40 : 0), 1200 + (i >= 12 ? 95 : 0)];
  const ePos = (i) => [0.5 + (i % 8), 6.0 - Math.floor(i / 8) * 1.6];
  const B8 = { cx: 540, cy: 780, size: 720, tilt: 0.62 };
  function elephantField(lt, t, prog, rot, bob = 0) {
    CH.table(t);
    const proj = CH.board({ ...B8, rot });
    const onB = [], off = [];
    for (let i = 0; i < NE; i++) {
      const dep = 0.05 + i * 0.058, k = prog(dep);
      const [u, v] = ePos(i), [ex, ey] = slot(i);
      if (k <= 0) { const [x, y, s] = at(proj, u, v); onB.push([y, () => spr('elephant', 'ivory', x, y, s * 0.9)]); continue; }
      const [x0, y0, s0] = at(proj, u, v), [x1, y1, s1] = at(proj, u, 8.9);
      let x, y, s;
      if (k < 0.45) { const q = eio(k / 0.45); x = lerp(x0, x1, q); y = lerp(y0, y1, q); s = lerp(s0 * 0.9, s1 * 0.8, q); }
      else { const q = eio((k - 0.45) / 0.55); x = lerp(x1, ex, q); y = lerp(y1, ey, q) - Math.sin(q * Math.PI) * 60; s = lerp(s1 * 0.8, 0.42, q); }
      if (k >= 1) y += Math.sin(t * 6 + i) * 3 * bob;
      (k < 0.45 ? onB : off).push([y, () => spr('elephant', 'ivory', x, y, s)]);
    }
    // steel pusher sliding along the back rank
    const pu = 0.5 + 7 * (0.5 + 0.5 * Math.sin(lt * 1.6 - 1.2)), [px, py, ps] = at(proj, pu, 1.3);
    onB.push([py, () => CH.piece('horse', px, py, ps, { col: 'steel' })]);
    depthDraw(onB); depthDraw(off);
    return proj;
  }
  add({ id: 'c8b', at: hund, cam: [540, 760], zoom: 0.06, note: 'elephants slid off the board edge into a long line, counter rising, HUNDREDS?', draw(lt, d, t) {
    elephantField(lt, t, (dep) => clamp((lt - dep) / 0.5), 0.05 * Math.sin(lt * 0.9));
    finish(t, 540, 880, 980, 2, 0.85);
    const n = Math.floor(eo(seg(lt, 0.1, d + 0.2)) * 480 + 7 * seg(lt, 0, 0.1));
    ctx.save(); ctx.globalAlpha = clamp(lt / 0.2); counter(n, 540, 340, 210, 0, t); ctx.restore();
    pop('HUNDREDS?', 540, 470, t, eleph, { ink: P.blood, size: 60 });
  } });
  cue(hund, 'whoosh', { gain: 0.6 });
  for (let i = 0; i < NE; i += 4) cue(hund + 0.05 + i * 0.058 + 0.2, 'slide', { gain: 0.35, pan: -0.6 + (i / NE) * 1.2 });
  cue(eleph, 'pop', { gain: 0.7 }); cue(taken, 'tock', { gain: 0.5 });

  add({ id: 'c8c', at: the8, cam: [540, 420], zoom: 0.08, note: 'counter digits wobble/blur; NUMBERS DISPUTED, MAY BE BOASTS stamp', draw(lt, d, t) {
    elephantField(lt, t, () => 1, 0.05 * Math.sin((lt + 2) * 0.9), 1);
    finish(t, 540, 620, 900, 3, 0.88);
    const wob = 0.25 + 0.75 * eo(seg(t, nums, nums + 0.6));
    if (t > boasts - 0.05) CH.inkDrop(560, 290, 150, seg(t, boasts - 0.05, boasts + 0.5), P.bloodDk, t);
    counter(480 + Math.floor(lt * 3), 540, 360, 230, wob, t);
    pop('NUMBERS DISPUTED', 540, 560, t, nums, { ink: P.ink, size: 56 });
    slam('MAY BE BOASTS', 540, 300, t, boasts, { ink: P.blood, size: 66, rot: -0.07 });
    wipeOut(t, lt, d, { x: 540, y: 320, seed: 2 });
  } });
  cue(the8, 'zip', { gain: 0.5 }); cue(nums, 'pop', { gain: 0.6 }); cue(boasts, 'slam', { gain: 0.8 }); cue(t9 - 0.35, 'whoosh', { gain: 0.6 });

  // ===== c9a: CONTESTED slam; scene rewinds while the board spins backwards =====
  add({ id: 'c9a', at: t9, cam: [540, 820], zoom: 0.07, note: 'CONTESTED slam; board spins backwards, rewinding the killing', draw(lt, d, t) {
    CH.table(t);
    const r = eio(seg(lt, 0, d * 0.95));
    const proj = CH.board({ cx: 540, cy: 960, size: 900, tilt: 0.55, rot: lerp(0, -Math.PI * 0.9, r) });
    const kingTip = 1.5 * (1 - eio(seg(lt, 0.15, 0.85))) + 1.5 * eob(seg(t, contested + 0.05, contested + 0.45));
    const iv = lerp(3.3, 1.6, eio(seg(lt, 0.15, 0.85)));
    const items = [];
    const [kx, ky, ks] = at(proj, 4.5, 4.5), [ix, iy, is] = at(proj, iv, 4.6);
    items.push([ky, () => CH.piece('king', kx, ky, ks * 1.1, { col: 'gold', tip: kingTip, glow: 0.6 })]);
    items.push([iy, () => CH.piece('prince', ix, iy, is * 1.05, { col: 'ivory', sash: P.blood })]);
    for (const [u, v, c] of [[1.5, 1.5, 'steel'], [6.5, 2.5, 'steel'], [6.5, 6.5, 'ebony'], [2.5, 6.5, 'ivory']]) { const [x, y, s] = at(proj, u, v); items.push([y, () => CH.piece('pawn', x, y, s, { col: c })]); }
    depthDraw(items);
    finish(t, 540, 940, 820, 4);
    rewindIcon(150, 200, (t < contested ? 0.85 : 0.3) * (0.6 + 0.4 * Math.sin(lt * 14)));
    slam('CONTESTED', 540, 330, t, contested, { ink: P.blood, size: 84 });
    CH.redFlash(t > contested ? 1 - seg(t, contested, contested + 0.3) : 0);
    wipeIn(t, lt, { x: 540, y: 320, seed: 2 });
  } });
  cue(t9, 'zip', { gain: 0.6 }); cue(t9 + 0.1, 'whoosh', { gain: 0.5, dur: 1.2 }); cue(contested, 'slam', { gain: 1 }); cue(contested + 0.1, 'thud', { gain: 0.7 });

  // ===== c9b: LATER WRITERS - two later pages ink themselves over a marbled swirl =====
  add({ id: 'c9b', at: some9, cam: [540, 820], zoom: 0.08, note: 'LATER WRITERS: two later pages over indigo marbled swirl', draw(lt, d, t) {
    CH.table(t);
    CH.marble(t, 1, { full: true, cols: [P.indigo, P.ink, P.paper, P.ink, P.bloodDk], seed: 5, a: 0.55 });
    const k1 = eo(seg(lt, 0, 0.4)), k2 = eo(seg(lt, 0.15, 0.55));
    CH.chronicle(lerp(-300, 320, k1), 860 + Math.sin(t * 1.5) * 8, seg(lt, 0.2, d), { w: 440, h: 600, rot: -0.12 + 0.03 * Math.sin(t), rows: 10, red: [4] });
    CH.chronicle(lerp(1380, 770, k2), 900 + Math.cos(t * 1.3) * 8, seg(lt, 0.35, d), { w: 440, h: 600, rot: 0.1 - 0.03 * Math.sin(t), rows: 10, red: [6] });
    finish(t, 540, 880, 900, 5, 0.75);
    pop('LATER WRITERS', 540, 340, t, later - 0.05, { ink: P.indigo, size: 66 });
  } });
  cue(some9, 'whoosh', { gain: 0.6 }); cue(some9 + 0.2, 'whoosh', { gain: 0.4, pan: 0.4 }); cue(later, 'pop', { gain: 0.6 }); cue(some9 + 0.3, 'chisel', { gain: 0.3, dur: 0.8 });

  // ===== c9c: the toppled gold king - ivory prince slides away, EBONY prince slides in; highlight swaps =====
  add({ id: 'c9c', at: name9, cam: [540, 880], zoom: 0.09, note: 'swap: ebony prince (Vira) now beside the toppled king; VIRA?', draw(lt, d, t) {
    CH.table(t);
    CH.marble(t, 0.55 + 0.05 * Math.sin(t), { x: 540, y: 700, cols: [P.indigo, P.ink, P.indigoHi, P.ink], seed: 7, a: 0.4 });
    const proj = CH.board({ cx: 540, cy: 990, size: 900, tilt: 0.55, rot: 0.12 - 0.06 * lt });
    const sw = eio(seg(t, vira - 0.45, vira + 0.2));
    const items = [];
    const [kx, ky, ks] = at(proj, 4.3, 4.4);
    items.push([ky, () => CH.piece('king', kx, ky, ks * 1.1, { col: 'gold', tip: 1.5 })]);
    const [ix, iy, is] = at(proj, lerp(3.0, 0.9, sw), lerp(4.6, 6.6, sw));
    items.push([iy, () => { baseGlow(ix, iy, 120 * is * 2, P.blood, 1 - sw); CH.piece('prince', ix, iy, is * 1.1, { col: 'ivory', sash: P.blood, a: lerp(1, 0.55, sw), glow: 1 - sw, glowCol: P.blood }); }]);
    const [ex, ey, es] = at(proj, lerp(7.6, 5.9, eio(seg(lt, 0, 0.7))), lerp(1.6, 4.7, eio(seg(lt, 0, 0.7))));
    items.push([ey, () => { baseGlow(ex, ey, 120 * es * 2, P.indigoHi, 0.4 + 0.6 * sw); CH.piece('prince', ex, ey, es * 1.1, { col: 'ebony', sash: P.indigoHi, glow: 0.5 + 0.7 * sw, glowCol: '#9DB2F0' }); }]);
    depthDraw(items);
    finish(t, lerp(470, 600, sw), 900, 800, 6);
    CH.tag('LATER WRITERS', 540, 210, { ink: P.indigo, size: 44, a: 0.9 });
    pop('VIRA?', 540, 360, t, vira, { ink: P.indigo, size: 76, sc: 1 + 0.08 * (t > killer ? Math.sin(seg(t, killer, killer + 0.4) * Math.PI) : 0) });
    wipeOut(t, lt, d, { x: 700, y: 760, seed: 3, cols: [P.indigo, P.ink, P.paper, P.blood] });
  } });
  cue(name9, 'slide', { gain: 0.6, pan: 0.5 }); cue(vira - 0.4, 'slide', { gain: 0.5, pan: -0.5 }); cue(vira, 'swell', { gain: 0.6 }); cue(vira + 0.02, 'pop', { gain: 0.6 });
  cue(killer, 'heartbeat', { gain: 0.6 }); cue(t10 - 0.35, 'whoosh', { gain: 0.5 });

  // ===== c10a: SOME HISTORIANS - princes shrink into the corner while steel carries the gold away =====
  const NC = 9;
  const pile = (proj, n, t) => { // coin heap on the centre squares
    for (let i = 0; i < n; i++) { const [x, y, s] = at(proj, 3.2 + rnd(i * 3) * 1.8, 3.0 + rnd(i * 5) * 1.6); coin(x, y - (i % 4) * 7 * s / K, s / K * 0.9); }
  };
  add({ id: 'c10a', at: t10, cam: [540, 860], zoom: 0.07, note: 'SOME HISTORIANS: princes shrink to the corner, steel carries gold off the board', draw(lt, d, t) {
    CH.table(t);
    const proj = CH.board({ cx: 540, cy: 980, size: 900, tilt: 0.58, rot: -0.1 + 0.05 * lt });
    const sh = eio(seg(lt, 0.1, 1.2));
    pile(proj, Math.round(lerp(60, 26, seg(lt, 0, d + 1))), t);
    const items = [];
    for (let i = 0; i < NC; i++) {
      const st = 0.05 + i * 0.17, k = eio(seg(lt, st, st + 1.1));
      const u0 = 3.4 + rnd(i * 7) * 1.4, v0 = 3.2 + rnd(i * 9) * 1.2, side = i % 3;
      const u1 = side === 0 ? -2.2 : side === 1 ? 10 : u0, v1 = side === 2 ? -2.6 : v0 - 1.5;
      const [x, y, s] = at(proj, lerp(u0, u1, k), lerp(v0, v1, k));
      items.push([y, () => { CH.piece('pawn', x, y, s * 0.9, { col: 'steel' }); if (k > 0) { coin(x, y - 128 * s * 0.9, s / K * 0.9); coin(x + 4, y - 140 * s * 0.9, s / K * 0.8); } }]);
    }
    for (const [j, col, sash] of [[0, 'ivory', P.blood], [1, 'ebony', P.indigoHi]]) {
      const [x, y, s] = at(proj, lerp(3.2 + j * 1.6, 0.6 + j * 0.9, sh), lerp(5.8, 7.4, sh));
      items.push([y, () => { if (col === 'ebony') baseGlow(x, y, 90 * s, P.indigoHi, 0.7); CH.piece('prince', x, y, s * lerp(1.2, 0.55, sh), { col, sash, glow: col === 'ebony' ? 0.6 : 0, glowCol: '#9DB2F0' }); }]);
    }
    depthDraw(items);
    finish(t, 560, 920, 860, 7);
    pop('SOME HISTORIANS', 540, 300, t, hist - 0.05, { ink: P.ink, size: 62 });
    wipeIn(t, lt, { x: 700, y: 760, seed: 3, cols: [P.indigo, P.ink, P.paper, P.blood] });
  } });
  cue(t10, 'zip', { gain: 0.5 }); cue(hist, 'pop', { gain: 0.6 });
  for (let i = 0; i < NC; i += 2) cue(t10 + 0.05 + i * 0.17 + 0.2, 'sparkle', { gain: 0.3, pan: (i % 3 - 1) * 0.6 });
  cue(raid10, 'slide', { gain: 0.5 });

  // ===== c10b: LOOT vs FEUD =====
  add({ id: 'c10b', at: loot, cam: [540, 700], zoom: 0.07, note: 'LOOT vs FEUD: gold carried off left, tiny princes feuding in the corner, FEUD dims', draw(lt, d, t) {
    CH.table(t);
    const proj = CH.board({ cx: 540, cy: 1000, size: 920, tilt: 0.62, rot: 0.14 - 0.05 * lt });
    pile(proj, Math.round(lerp(26, 8, seg(lt, 0, d))), t);
    const items = [];
    for (let i = 0; i < 10; i++) { // steel conga line carrying coins off the left edge
      const ph = lt * 0.55 + i * 0.12, u = lerp(4.2, -3.5, ph % 1.2 / 1.2), v = 3.6 + Math.sin(i * 1.7) * 0.9;
      if (ph > 1.2) continue;
      const [x, y, s] = at(proj, u, v);
      items.push([y, () => { CH.piece(i % 3 === 1 ? 'horse' : 'pawn', x, y, s * 0.85, { col: 'steel' }); coin(x, y - (i % 3 === 1 ? 200 : 128) * s * 0.85, s / K * 0.9); }]);
    }
    for (const [j, col, sash] of [[0, 'ivory', P.blood], [1, 'ebony', P.indigoHi]]) {
      const lunge = 0.15 * Math.sin(t * 7 + j * Math.PI);
      const [x, y, s] = at(proj, 6.2 + j * 1.0 + (j ? -lunge : lunge), 1.2);
      items.push([y, () => { if (col === 'ebony') baseGlow(x, y, 80 * s, P.indigoHi, 0.8); CH.piece('prince', x, y, s * 0.55, { col, sash, glow: col === 'ebony' ? 0.7 : 0, glowCol: '#9DB2F0' }); }]);
    }
    depthDraw(items);
    const [fx, fy] = at(proj, 7.2, 1.2); sparkle(fx, fy - 70, 40, 0.5 + 0.5 * Math.sin(t * 14), t * 3);
    finish(t, 500, 880, 900, 8);
    const g = 1 + 0.05 * Math.sin(t * 8);
    pop('LOOT', 290, 330, t, loot - 0.05, { ink: P.goldDk, size: 96, sc: g });
    if (t > loot) sparkle(380, 270, 70, 0.6 + 0.4 * Math.sin(t * 11), t * 2);
    ctx.save(); ctx.globalAlpha = clamp((t - loot - 0.15) / 0.2); ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.ivory; ctx.fillText('vs', 560, 336); ctx.restore();
    const fd = eo(seg(t, not10, not10 + 0.4));
    pop('FEUD', 790, 330, t, loot + 0.25, { ink: P.indigo, size: 72, a: lerp(1, 0.75, fd), sc: lerp(1, 0.85, fd) });
    if (fd > 0) line([[690, 362], [690 + 200 * fd, 300]], P.blood, 9);
    wipeOut(t, lt, d, { x: 540, y: 700, seed: 6 });
  } });
  cue(loot, 'bell', { gain: 0.6 }); cue(loot + 0.02, 'sparkle', { gain: 0.6 }); cue(loot + 0.25, 'pop', { gain: 0.5, pan: 0.4 });
  cue(not10 + 0.1, 'chisel', { gain: 0.6 }); cue(feud, 'tock', { gain: 0.5 }); cue(t11 - 0.35, 'whoosh', { gain: 0.6 });

  // ===== c11: the crown alone in the spotlight between the two princes =====
  const BOARD11 = { cx: 540, cy: 1230, size: 1040, tilt: 0.72, a: 0.85 };
  function crownScene(lt, t, o = {}) {
    CH.table(t);
    const proj = CH.board({ ...BOARD11, rot: 0.04 * Math.sin(t * 0.5) });
    const [kx, ky, ks] = at(proj, 4, 4.0);
    CH.piece('king', kx, ky, ks * 1.2, { col: 'gold', crown: false, tip: 1.5, a: 0.75 });
    const red = o.red || 0;
    const [ax, ay, as] = at(proj, 1.4, 5.6), [bx, by, bs] = at(proj, 6.6, 5.6);
    baseGlow(ax, ay, 150, P.blood, 0.5 + red * 0.5); CH.piece('prince', ax, ay, as * 1.5, { col: 'ivory', sash: P.blood, glow: red, glowCol: P.blood });
    baseGlow(bx, by, 150, P.indigoHi, 0.6 + red * 0.4); CH.piece('prince', bx, by, bs * 1.5, { col: 'ebony', sash: P.indigoHi, glow: 0.9 + red * 0.4, glowCol: red > 0.3 ? P.blood : '#9DB2F0' });
    beam(540, o.cy ?? 760, 230, 0.12);
    finish(t, 540, o.cy ?? 760, 900, 9, 0.9);
    spinCrown(540, (o.cy ?? 760) + Math.sin(t * 2.2) * 14, o.cs ?? 3.0, t * 2.6, o.glint || 0);
  }
  add({ id: 'c11a', at: t11, cam: [540, 760], zoom: 0.08, note: 'gold crown spinning alone in the spotlight, princes either side; both flash red on "son\'s crime"', draw(lt, d, t) {
    const red = Math.max(0, Math.sin(seg(t, sons, crime + 0.5) * Math.PI));
    crownScene(lt, t, { red });
    wipeIn(t, lt, { x: 540, y: 700, seed: 6 });
  } });
  cue(t11 + 0.1, 'swell', { gain: 0.5 }); cue(sons, 'heartbeat', { gain: 0.7 }); cue(crime, 'drum', { gain: 0.6 });

  add({ id: 'c11b', at: story11, cam: [540, 560], zoom: 0.07, note: "a '?' of marbled ink forms over the crown; a page drifts far away", draw(lt, d, t) {
    crownScene(lt, t, { cy: 820, cs: 2.7 });
    const k = eob(seg(t, story11 + 0.1, far + 0.2));
    inkQ(t, 540, 380 + Math.sin(t * 1.7) * 8, 480, clamp(k * 2), lerp(0.4, 1, k));
  } });
  cue(story11, 'inhale', { gain: 0.5 }); cue(story11 + 0.15, 'swell', { gain: 0.5 }); cue(far, 'plop', { gain: 0.6 });

  add({ id: 'c11c', at: tell, cam: [540, 900], zoom: 0.06, note: 'TELL ME BELOW + bouncing down arrow; crown glints on "watch again"', draw(lt, d, t) {
    const gl = Math.max(0, 1 - Math.abs(t - watch - 0.15) / 0.35);
    crownScene(lt, t, { cy: 700, cs: 2.8, glint: gl });
    inkQ(t, 540, 300 - eio(seg(lt, 0, 1)) * 40, 340, 1 - 0.6 * seg(lt, 0, 1), 1);
    pop('TELL ME BELOW', 540, 1060, t, tell, { ink: P.blood, size: 64 });
    if (t > below - 0.1) {
      const b = Math.abs(Math.sin((t - below) * 6)) * 26, a = clamp((t - below + 0.1) / 0.2);
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = P.gold; ctx.strokeStyle = '#000'; ctx.lineWidth = 5;
      ctx.beginPath(); const y0 = 1170 + b; ctx.moveTo(510, y0); ctx.lineTo(570, y0); ctx.lineTo(570, y0 + 60); ctx.lineTo(610, y0 + 60); ctx.lineTo(540, y0 + 130); ctx.lineTo(470, y0 + 60); ctx.lineTo(510, y0 + 60); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
    }
  } });
  cue(tell, 'pop', { gain: 0.7 }); cue(below, 'drum', { gain: 0.6 }); cue(below + 0.05, 'plop', { gain: 0.4 }); cue(watch + 0.1, 'sparkle', { gain: 0.6 }); cue(again, 'bell', { gain: 0.4 });

  // ===== c11d: end card - board, crown glinting, AAZHI, FOLLOW =====
  add({ id: 'c11d', at: endc, cam: [540, 760], zoom: 0.05, note: 'END CARD: board + king with glinting crown, carved AAZHI, FOLLOW', draw(lt, d, t) {
    CH.table(t);
    const proj = CH.board({ cx: 540, cy: 1060, size: 900, tilt: 0.58, rot: 0.18 - 0.12 * lt });
    const items = [];
    const gl = Math.max(0, 1 - Math.abs(t - crownW - 0.15) / 0.4);
    const [kx, ky, ks] = at(proj, 4, 4);
    items.push([ky, () => CH.piece('king', kx, ky, ks * 1.35, { col: 'gold', glow: 0.6 + gl })]);
    for (const [u, v, kind, col, sash] of [[2.5, 4.6, 'prince', 'ivory', P.blood], [5.5, 4.6, 'prince', 'ebony', P.indigoHi], [1.5, 1.5, 'pawn', 'steel'], [6.5, 1.5, 'pawn', 'steel'], [3.5, 6.5, 'pawn', 'ivory'], [4.5, 6.5, 'pawn', 'ebony']]) {
      const [x, y, s] = at(proj, u, v);
      items.push([y, () => { if (col === 'ebony') baseGlow(x, y, 90 * s * 2, P.indigoHi, 0.6); CH.piece(kind, x, y, s, { col, sash, glow: col === 'ebony' ? 0.5 : 0, glowCol: '#9DB2F0' }); }]);
    }
    depthDraw(items);
    finish(t, 540, 900, 820, 10, 0.88);
    const cy = ky - 236 * ks * 1.35 - 26 * ks * 1.35;
    sparkle(kx + 10, cy, 90 + 120 * gl, 0.4 + 0.6 * gl + 0.15 * Math.sin(t * 9), t * 1.5);
    CH.title('AAZHI', 540, 420, 200, seg(lt, 0.05, 0.75), { col: P.ivory, edge: P.gold });
    pop('FOLLOW', 540, 560, t, endc + 0.7, { ink: P.blood, size: 54 });
  } });
  cue(endc, 'chisel', { gain: 0.6, dur: 0.7 }); cue(endc + 0.7, 'pop', { gain: 0.6 }); cue(crownW + 0.1, 'sparkle', { gain: 0.7 }); cue(endc + 0.1, 'swell', { gain: 0.5 });
}
