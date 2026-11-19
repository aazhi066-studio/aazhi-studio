// EPISODE 4 · worker B: shots B1-B5 (lines 5 to 9): the gas front, heavier than air, the reach, the silent village, the open question.
// Cold night palette: ink / deep teal / slate, ONE sickly green (#7BD88F) for the gas, off-white text. Flat painterly + soft fog + grain.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L, Wd } from './core/timing.js';

const INK = '#05080C', TEAL = '#0E3B43', SLATE = '#24384A', SLATE2 = '#16222E', GREEN = '#7BD88F', OFF = '#E6EEE9';
const rgb = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const lg = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const poly = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
const fillP = (pts, c) => { poly(pts); ctx.fillStyle = c; ctx.fill(); };
const pr = (lt, s, dur = 0.5) => clamp((lt - s) / dur);
function blob(x, y, r, col, a) {
  if (a <= 0.003) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgb(col, a)); g.addColorStop(0.55, rgb(col, a * 0.5)); g.addColorStop(1, rgb(col, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function txt(s, x, y, size, col = OFF, o = {}) {
  ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = (o.ls ?? 4) + 'px'; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore();
}
function grain(t, a = 0.07) {
  const f = Math.floor(t * 12); ctx.save();
  for (let i = 0; i < 260; i++) { const x = rnd(i * 3 + f * 17) * (W + 200) - 100, y = rnd(i * 7 + f * 29 + 5) * (H + 200) - 100; ctx.fillStyle = rnd(i + f) > 0.5 ? `rgba(230,240,235,${a})` : `rgba(0,0,0,${a * 1.6})`; ctx.fillRect(x, y, 3, 3); }
  ctx.restore();
}
function vig(a = 0.7) { const g = ctx.createRadialGradient(540, 960, 520, 540, 960, 1300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600); }
function stars(t, n, yMax, seed = 0, a = 1) {
  for (let i = 0; i < n; i++) { const x = rnd(i + seed) * W, y = rnd(i * 5 + 3 + seed) * yMax, tw = 0.5 + 0.5 * Math.sin(t * (0.6 + rnd(i) * 1.4) + i); ctx.fillStyle = `rgba(215,235,232,${a * tw * (0.25 + rnd(i + 2) * 0.55)})`; ctx.beginPath(); ctx.arc(x, y, 1 + rnd(i + 8) * 1.5, 0, TAU); ctx.fill(); }
}
function eye(x, y, s, col, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.beginPath(); ctx.moveTo(-120, 0); ctx.quadraticCurveTo(0, -105, 120, 0); ctx.quadraticCurveTo(0, 105, -120, 0); ctx.closePath();
  ctx.fillStyle = rgb(col, 0.12); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 11; ctx.lineJoin = 'round'; ctx.stroke();
  circle(0, 0, 38, col); circle(0, 0, 17, INK); circle(10, -10, 7, col); ctx.restore();
}
function iconPerson(x, y, s, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); circle(0, -50, 22, col); rr(-30, -22, 60, 70, 24); ctx.fillStyle = col; ctx.fill(); rr(-30, 30, 24, 60, 8); ctx.fill(); rr(6, 30, 24, 60, 8); ctx.fill(); ctx.restore(); }
function iconCow(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-60, -40, 120, 64, 22); ctx.fillStyle = col; ctx.fill();
  for (const lx of [-50, -22, 14, 42]) { rr(lx, 18, 14, 54, 5); ctx.fill(); }
  fillP([[52, -48], [92, -30], [92, 0], [52, -4]], col); fillP([[60, -48], [66, -66], [74, -50]], col); fillP([[-62, -22], [-82, 14], [-72, 18], [-56, -4]], col); ctx.restore();
}
function iconBird(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ell(0, 0, 46, 28, col, -0.15); circle(40, -26, 18, col); fillP([[54, -30], [86, -22], [54, -18]], col);
  fillP([[-40, -6], [-86, -22], [-50, 10]], col); ctx.beginPath(); ctx.moveTo(-6, -8); ctx.quadraticCurveTo(-20, -90, 26, -70); ctx.quadraticCurveTo(14, -30, 14, -8); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore();
}

export function buildB(add, cue) {
  const T1 = L(5) - 0.1, T2 = L(6) - 0.1, T3 = L(7) - 0.1, T4 = L(8) - 0.1, T5 = L(9) - 0.1;

  // ═════════ B1 · line 5 · the lake erupts softly; a green fog front rolls over the rim and down the valley (camera pulls back) ═════════
  add({ id: 'B1', at: T1, cam: [540, 760], zoom: -0.075, note: 'night valley in perspective, lake at top, green gas front spills over rim and pours toward camera', draw(lt, d, t) {
    ctx.fillStyle = lg(0, -300, 0, 900, [[0, '#04070B'], [0.6, '#0B222B'], [1, '#12383F']]); ctx.fillRect(-300, -300, W + 600, 1400);
    stars(t, 50, 330, 11, 0.8);
    // far hills
    fillP([[-300, 520], [-80, 440], [160, 480], [330, 400], [440, 470], [640, 460], [760, 390], [930, 450], [1150, 410], [1400, 520], [1400, 700], [-300, 700]], '#0A1C24');
    // lake basin: rim + water
    ell(540, 470, 360, 84, '#08141B'); ell(540, 478, 330, 70, lg(0, 410, 0, 550, [[0, '#17606A'], [1, '#0C3A44']]));
    const er = seg(lt, 0.0, 1.1);
    for (let k = 0; k < 4; k++) { const rp = ((lt * 0.7 + k * 0.25) % 1) * er; ctx.strokeStyle = rgb(GREEN, 0.5 * (1 - rp) * er); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(540, 480, 40 + rp * 260, 8 + rp * 54, 0, 0, TAU); ctx.stroke(); }
    for (let k = 0; k < 7; k++) blob(540 + (rnd(k) - 0.5) * 360, 470 - er * 25 * rnd(k + 3), 90 + er * 70, GREEN, 0.28 * er);
    // valley floor (perspective, widening toward camera)
    poly([[420, 540], [660, 540], [1260, 2100], [-180, 2100]]); ctx.fillStyle = lg(0, 540, 0, 1900, [[0, '#0D2E36'], [0.5, '#081A20'], [1, '#05090D']]); ctx.fill();
    ctx.strokeStyle = 'rgba(120,200,190,0.07)'; ctx.lineWidth = 3; for (let k = 0; k < 7; k++) { const y = 620 + Math.pow(k / 6, 1.8) * 1250, hw = 120 + (y - 540) * 0.5; ctx.beginPath(); ctx.moveTo(540 - hw, y); ctx.quadraticCurveTo(540, y + 18, 540 + hw, y); ctx.stroke(); }
    // the front: soft blobs travelling along the valley, growing as they near the camera
    const p = eio(clamp((lt - 0.45) / (d - 0.7)));
    for (let i = 0; i < 46; i++) {
      const o = rnd(i + 40), s = clamp(p * 1.15 - o * 0.5); if (s <= 0) continue;
      const sw = Math.sin(t * 0.5 + i) * 30, x = 540 + (rnd(i) - 0.5) * 2 * (60 + s * 520) + sw, y = 480 + Math.pow(s, 1.15) * 1380 + Math.sin(t * 0.7 + i * 2) * 14;
      blob(x, y, 90 + s * 330 * (0.6 + o * 0.8), GREEN, 0.2 * Math.min(1, s * 6) * (0.5 + o * 0.5));
    }
    // sickly low fog haze across the lower valley
    const hz = ctx.createLinearGradient(0, 700, 0, 1900); hz.addColorStop(0, rgb(GREEN, 0)); hz.addColorStop(1, rgb(GREEN, 0.18 * p)); ctx.fillStyle = hz; ctx.fillRect(-300, 700, W + 600, 1300);
    // near slopes (dark, rim-lit teal)
    const lft = [[-300, 400], [100, 520], [300, 640], [420, 720], [360, 1000], [160, 1380], [-40, 1750], [-300, 2100]];
    const rgt = [[1380, 400], [980, 520], [790, 640], [680, 720], [740, 1000], [920, 1380], [1120, 1750], [1380, 2100]];
    fillP(lft, '#060D12'); fillP(rgt, '#060D12');
    ctx.strokeStyle = 'rgba(70,160,160,0.28)'; ctx.lineWidth = 4; ctx.beginPath(); lft.slice(1, 7).forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); ctx.beginPath(); rgt.slice(1, 7).forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
    // fog spilling on the near slopes too
    blob(140, 1150 + p * 100, 380, GREEN, 0.12 * p); blob(960, 1250 + p * 100, 380, GREEN, 0.12 * p);
    txt('LAKE NYOS', 540, 200, 70, OFF, { alpha: eio(pr(lt, 0.2, 0.6)) * 0.9, ls: 14 });
    vig(0.65); grain(t);
  } });
  cue(T1, 'rumble', { gain: 0.8 }); cue(T1 + 0.5, 'bubbles', { gain: 0.7 }); cue(T1 + 1.2, 'swell', { gain: 0.8 }); cue(T1 + 2.4, 'whoosh', { gain: 0.5 });

  // ═════════ B2 · line 6 · two columns: AIR floats up, CO2 sinks and pools; HEAVIER THAN AIR; INVISIBLE ═════════
  add({ id: 'B2', at: T2, cam: [540, 760], zoom: 0.05, note: 'two-column diagram AIR vs CO2, pooling dots, HEAVIER THAN AIR banner, crossed-out eye INVISIBLE', draw(lt, d, t) {
    ctx.fillStyle = lg(0, -300, 0, 1900, [[0, '#0C1A24'], [1, '#05080C']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    const tH = Wd('heavier', 6) - T2, tI = Wd('cannot', 6) - T2;
    const colX = [275, 805], gy = 1060, top = 230, cw = 470;
    for (let c = 0; c < 2; c++) {
      const x = colX[c]; rr(x - cw / 2, top, cw, gy - top + 90, 28); ctx.fillStyle = c ? 'rgba(14,59,67,0.55)' : 'rgba(36,56,74,0.55)'; ctx.fill();
      ctx.strokeStyle = c ? rgb(GREEN, 0.35) : 'rgba(230,238,233,0.25)'; ctx.lineWidth = 3; rr(x - cw / 2, top, cw, gy - top + 90, 28); ctx.stroke();
      ctx.fillStyle = '#05080C'; rr(x - cw / 2 + 10, gy, cw - 20, 70, 12); ctx.fill();   // ground
      ctx.fillStyle = 'rgba(230,238,233,0.2)'; ctx.fillRect(x - cw / 2 + 10, gy, cw - 20, 5);
    }
    txt('AIR', colX[0], 300, 92, OFF, { ls: 10 }); txt('CO₂', colX[1], 300, 92, GREEN, { ls: 6 });
    // AIR: small light dots drifting up
    ctx.save(); rr(colX[0] - cw / 2, top + 90, cw, gy - top - 90, 8); ctx.clip();
    for (let i = 0; i < 46; i++) { const ph = (rnd(i + 1) + lt * (0.06 + rnd(i + 2) * 0.07)) % 1, y = gy - 20 - ph * (gy - top - 120), x = colX[0] + (rnd(i + 9) - 0.5) * (cw - 70) + Math.sin(lt * 1.2 + i) * 14; circle(x, y, 7 + rnd(i + 4) * 3, `rgba(230,238,233,${0.35 + 0.4 * Math.sin(ph * Math.PI)})`); }
    ctx.restore();
    // CO2: heavy dots sink and pool (layers stack from the ground up)
    const nC = 56, vis = 1 - 0.78 * eio(pr(lt, tI, 0.7));
    ctx.save(); ctx.globalAlpha *= vis;
    for (let i = 0; i < nC; i++) {
      const row = Math.floor(i / 7), colI = i % 7, rx = colX[1] - 190 + colI * 63 + (row % 2) * 24, ry = gy - 22 - row * 42;
      const ts = 0.15 + rnd(i + 20) * 1.3, sp = clamp((lt - ts) / (0.9 + rnd(i + 30) * 0.5)), y0 = top + 130 + rnd(i + 6) * 120;
      const y = lerp(y0, ry, sp * sp), wob = sp >= 1 ? Math.sin(lt * 1.6 + i) * 1.5 : Math.sin(lt * 3 + i) * 10 * (1 - sp);
      if (lt > ts - 0.05) { blob(rx + wob, y, 36, GREEN, 0.22); circle(rx + wob, y, 19, GREEN); circle(rx + wob - 5, y - 6, 6, 'rgba(255,255,255,0.35)'); }
    }
    ctx.restore();
    // HEAVIER THAN AIR banner
    const hb = eob(pr(lt, tH - 0.1, 0.5));
    if (hb > 0) { ctx.save(); ctx.translate(540, 1215); ctx.scale(hb, hb); rr(-440, -62, 880, 124, 20); ctx.fillStyle = GREEN; ctx.fill(); txt('HEAVIER THAN AIR', 0, 4, 76, INK, { ls: 3 }); ctx.restore(); }
    // arrows: air up, CO2 down
    const ar = eio(pr(lt, 0.6, 0.5)); ctx.save(); ctx.globalAlpha *= ar; fillP([[colX[0] - 24, 400], [colX[0] + 24, 400], [colX[0], 346]], OFF); fillP([[colX[1] - 24, 380], [colX[1] + 24, 380], [colX[1], 434]], GREEN); ctx.restore();
    // INVISIBLE: crossed-out eye above the pool
    const ip = eio(pr(lt, tI, 0.5));
    if (ip > 0) { ctx.save(); ctx.translate(colX[1], 640); const sc = 0.5 + 0.5 * eob(ip); ctx.scale(sc, sc); ctx.globalAlpha *= ip;
      eye(0, 0, 1.15, OFF); const sl = eio(pr(lt, tI + 0.25, 0.35)); line([[-130, -120], [-130 + 260 * sl, -120 + 240 * sl]], INK, 26); line([[-130, -120], [-130 + 260 * sl, -120 + 240 * sl]], GREEN, 12);
      txt('INVISIBLE', 0, 190, 70, OFF, { ls: 3, stroke: INK }); ctx.restore(); }
    vig(0.55); grain(t);
  } });
  cue(T2, 'whoosh', { gain: 0.4 }); cue(Wd('heavier', 6) - 0.1, 'thud', { gain: 0.8 }); cue(Wd('hugs', 6), 'plop', { gain: 0.6 }); cue(Wd('cannot', 6), 'sizzle', { gain: 0.4 }); cue(Wd('cannot', 6) + 0.1, 'pop', { gain: 0.5 });

  // ═════════ B3 · line 7 · top-down ring map: radius grows past 4 village dots; dots dim; icon row dims ═════════
  add({ id: 'B3', at: T3, cam: [540, 740], zoom: 0.04, note: 'top-down map, expanding gas ring from lake, 20+ KM, 4 village dots dim, person/cow/bird icons dim', draw(lt, d, t) {
    ctx.fillStyle = INK; ctx.fillRect(-300, -300, W + 600, H + 600);
    const cx = 540, cy = 640, R = 420;
    ctx.fillStyle = '#0A242B'; ctx.beginPath(); ctx.arc(cx, cy, 500, 0, TAU); ctx.fill();
    // contour rings + grid
    ctx.strokeStyle = 'rgba(120,190,190,0.09)'; ctx.lineWidth = 2; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.ellipse(cx + Math.sin(k) * 8, cy + Math.cos(k * 2) * 8, k * 100, k * 92, 0.3 * k, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(230,238,233,0.06)'; for (let x = 40; x < W; x += 100) { ctx.beginPath(); ctx.moveTo(x, 160); ctx.lineTo(x, 1280); ctx.stroke(); } for (let y = 160; y <= 1280; y += 100) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const t0 = Wd('villages', 7) - T3 - 0.1, t1 = Wd('animals', 7) - T3 - 0.2;
    const rp = eio(clamp((lt - t0) / (t1 - t0))), r = rp * R;
    // growing gas disc
    if (r > 2) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, rgb(GREEN, 0.36)); g.addColorStop(0.8, rgb(GREEN, 0.2)); g.addColorStop(1, rgb(GREEN, 0.34)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = GREEN; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); }
    // villages: km -> px at 22 px/km
    const V = [[9 * 21, 0.55, 'a'], [14.5 * 21, 3.7, 'b'], [17.5 * 21, 2.2, 'c'], [19.5 * 21, 5.2, 'd']].map(([dist, ang]) => [cx + Math.cos(ang) * (dist > 100 ? dist : dist), cy + Math.sin(ang) * dist, dist]);
    V.forEach(([x, y, dist], i) => {
      const hit = clamp((r - dist) / 30), dim = eio(clamp((lt - (t0 + (t1 - t0) * (dist / R) * 0.95 + 0.1)) / 0.5)) * (r >= dist ? 1 : 0);
      const col = dim > 0 ? `rgb(${Math.round(lerp(230, 40, dim))},${Math.round(lerp(238, 60, dim))},${Math.round(lerp(233, 66, dim))})` : OFF;
      if (dim < 1) blob(x, y, 60, '#E6EEE9', 0.12 * (1 - dim));
      circle(x, y, 17, col); ctx.strokeStyle = rgb(OFF, 0.5 * (1 - dim) + 0.15); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 27 + hit * 3, 0, TAU); ctx.stroke();
      if (dim > 0.99 && !V[i].tk) V[i].tk = 1;
    });
    // lake
    ell(cx, cy, 36, 28, '#2FA3A8'); ell(cx, cy, 20, 15, GREEN); blob(cx, cy, 70, GREEN, 0.5);
    txt('LAKE', cx, cy - 58, 30, OFF, { ls: 8, alpha: 0.9 });
    // radius dimension line + 20+ KM
    const dl = eio(pr(lt, t1 - 0.5, 0.5));
    if (dl > 0) { ctx.save(); ctx.globalAlpha *= dl; ctx.setLineDash([14, 12]); line([[cx, cy], [cx + R, cy]], OFF, 4); ctx.setLineDash([]);
      line([[cx + R, cy - 26], [cx + R, cy + 26]], OFF, 6); rr(cx + 100, cy - 130, 300, 100, 18); ctx.fillStyle = INK; ctx.fill(); txt('20+ KM', cx + 250, cy - 78, 80, GREEN, { ls: 2 }); ctx.restore(); }
    // icon row
    const ix = [270, 540, 810], iy = 1270, tt = [Wd('people', 7), Wd('cattle', 7), Wd('wild', 7)].map((x) => x - T3);
    const fns = [iconPerson, iconCow, iconBird];
    ix.forEach((x, i) => {
      const dm = eio(clamp((lt - tt[i] - 0.35) / 0.6)), a = eio(pr(lt, 0.3 + i * 0.15, 0.5));
      ctx.save(); ctx.globalAlpha *= a; rr(x - 110, iy - 100, 220, 200, 26); ctx.fillStyle = 'rgba(36,56,74,0.5)'; ctx.fill();
      ctx.globalAlpha *= lerp(1, 0.22, dm); fns[i](x, iy + (i === 1 ? -4 : 2), 1.05, OFF); ctx.restore();
    });
    vig(0.55); grain(t);
  } });
  cue(T3, 'swell', { gain: 0.5 });
  [0, 1, 2, 3].forEach((i) => cue(Wd('twenty', 7) + i * 0.7, 'tock', { gain: 0.55 }));
  cue(Wd('people', 7) + 0.35, 'plop', { gain: 0.4 }); cue(Wd('cattle', 7) + 0.35, 'plop', { gain: 0.4 }); cue(Wd('wild', 7) + 0.35, 'plop', { gain: 0.4 });

  // ═════════ B4 · line 8 · one hut, a window light, a lantern, a thin moon, a far figure; MIDNIGHT. Total stillness. ═════════
  add({ id: 'B4', at: T4, cam: [470, 1000], zoom: 0.05, note: 'quiet night: single hut with window light, lantern, thin moon, tiny distant figure, MIDNIGHT', draw(lt, d, t) {
    ctx.fillStyle = lg(0, -300, 0, 1500, [[0, '#04070B'], [0.55, '#0A1C26'], [1, '#12323B']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    stars(t, 90, 900, 77, 1);
    // thin crescent moon
    ctx.save(); blob(830, 360, 210, '#9FD0D0', 0.12); ctx.beginPath(); ctx.arc(830, 360, 54, 0, TAU); ctx.clip(); ctx.beginPath(); ctx.arc(830, 360, 54, 0, TAU); ctx.moveTo(904, 346); ctx.arc(852, 346, 52, 0, TAU); ctx.fillStyle = '#DCE9E4'; ctx.fill('evenodd'); ctx.restore();
    // far ridge and distant standing figure
    fillP([[-300, 1130], [100, 1070], [380, 1100], [640, 1040], [900, 1080], [1400, 1020], [1400, 1500], [-300, 1500]], '#0A1E26');
    const fx = 880, fy = 1062; ctx.fillStyle = '#04080B'; circle(fx, fy - 38, 7, '#04080B'); rr(fx - 7, fy - 30, 14, 36, 5); ctx.fill(); rr(fx - 7, fy, 5, 18, 2); ctx.fill(); rr(fx + 2, fy, 5, 18, 2); ctx.fill();
    // ground + hut
    fillP([[-300, 1300], [300, 1240], [700, 1270], [1400, 1230], [1400, 2100], [-300, 2100]], '#050A0E');
    blob(400, 1300, 600, TEAL, 0.5);
    const hx = 400, hy = 1290;
    ctx.save(); ctx.translate(hx, hy);
    ell(0, 6, 270, 26, 'rgba(0,0,0,0.5)');
    rr(-200, -230, 400, 236, 14); ctx.fillStyle = '#0E1B24'; ctx.fill();                            // wall
    ctx.fillStyle = 'rgba(70,120,130,0.18)'; ctx.fillRect(-200, -230, 14, 236);
    fillP([[-270, -218], [0, -470], [270, -218], [220, -200], [-220, -200]], '#040709');         // thatch roof
    ctx.strokeStyle = 'rgba(100,170,170,0.22)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-270, -218); ctx.lineTo(0, -470); ctx.lineTo(270, -218); ctx.stroke();
    const flick = 0.92 + 0.08 * Math.sin(lt * 5) * Math.sin(lt * 2.3);
    blob(-90, -120, 190 * flick, '#DDEBD0', 0.28); rr(-130, -160, 80, 88, 6); ctx.fillStyle = '#E8F0D8'; ctx.fill();   // window light
    ctx.strokeStyle = '#0E1B24'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-90, -160); ctx.lineTo(-90, -72); ctx.moveTo(-130, -116); ctx.lineTo(-50, -116); ctx.stroke();
    rr(70, -170, 84, 176, 10); ctx.fillStyle = '#04080B'; ctx.fill();                              // dark door
    ctx.restore();
    // lone lantern on the ground
    const lx = 700, ly = 1330; blob(lx, ly - 30, 150 * flick, '#DDEBD0', 0.3); rr(lx - 14, ly - 50, 28, 46, 5); ctx.fillStyle = '#E8F0D8'; ctx.fill(); ctx.strokeStyle = '#04080B'; ctx.lineWidth = 5; ctx.strokeRect(lx - 14, ly - 50, 28, 46); line([[lx - 8, ly - 50], [lx, ly - 66], [lx + 8, ly - 50]], '#04080B', 5);
    // low still fog hugging the ground (no movement but a slow breath)
    for (let i = 0; i < 6; i++) blob(100 + i * 190, 1420 + Math.sin(i) * 20, 280, GREEN, 0.07 + 0.01 * Math.sin(t * 0.4 + i));
    const mid = eio(pr(lt, 0.15, 0.8));
    txt('MIDNIGHT', 540, 250, 124, OFF, { alpha: mid, ls: 14 });
    ctx.save(); ctx.globalAlpha *= mid * 0.8; ctx.fillStyle = GREEN; ctx.fillRect(440, 330, 200, 5); ctx.restore();
    vig(0.7); grain(t, 0.06);
  } });
  cue(T4, 'swell', { gain: 0.5 }); cue(T4 + 0.4, 'heartbeat', { gain: 0.35 }); cue(Wd('silent', 8) - 0.1, 'inhale', { gain: 0.4 });

  // ═════════ B5 · line 9 · three stacked clue cards forming a question mark; UNSETTLED stamp ═════════
  add({ id: 'B5', at: T5, cam: [540, 800], zoom: 0.05, note: 'giant ? backdrop, three clue cards LANDSLIDE? RAIN? VOLCANIC GAS?, UNSETTLED stamp', draw(lt, d, t) {
    ctx.fillStyle = lg(0, -300, 0, 1900, [[0, '#0A1822'], [1, '#05080C']]); ctx.fillRect(-300, -300, W + 600, H + 600);
    blob(540, 700, 800, TEAL, 0.6);
    // giant question mark behind the cards
    ctx.save(); ctx.font = '900 1500px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(123,216,143,0.11)'; ctx.fillText('?', 540, 800 + Math.sin(t * 0.8) * 8); ctx.restore();
    const tW = Wd('what', 9) - T5, tS = Wd('scientists', 9) - T5, tD = Wd('debate', 9) - T5;
    const cards = [['LANDSLIDE?', 0, -3, 360, 'ls'], ['RAIN?', 1, 2.5, 640, 'rain'], ['VOLCANIC GAS?', 2, -2, 920, 'vg']];
    cards.forEach(([label, i, rot, cy, ic]) => {
      const p = eob(pr(lt, tW + 0.05 + i * 0.4, 0.5)); if (p <= 0) return;
      ctx.save(); ctx.translate(540 + (1 - p) * (i % 2 ? 300 : -300), cy); ctx.rotate(rot * Math.PI / 180); ctx.globalAlpha *= Math.min(1, p * 2.5);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 18; rr(-420, -110, 840, 220, 22); ctx.fillStyle = lg(0, -110, 0, 110, [[0, '#2A4056'], [1, '#1A2B3B']]); ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(230,238,233,0.3)'; ctx.lineWidth = 3; rr(-420, -110, 840, 220, 22); ctx.stroke();
      ctx.fillStyle = GREEN; ctx.fillRect(-420, -110, 14, 220);
      // little icons
      ctx.save(); ctx.translate(-340, 0); ctx.strokeStyle = OFF; ctx.fillStyle = OFF; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (ic === 'ls') { fillP([[-34, 30], [-4, -30], [34, 30]], OFF); ctx.fillStyle = INK; circle(14, 4, 8, INK); circle(-6, 22, 6, INK); }
      else if (ic === 'rain') { ctx.beginPath(); ctx.arc(-14, -8, 16, 0, TAU); ctx.arc(14, -12, 20, 0, TAU); ctx.fill(); rr(-34, -10, 66, 20, 10); ctx.fill(); for (const dx of [-20, 0, 20]) { ctx.beginPath(); ctx.moveTo(dx, 20); ctx.lineTo(dx - 6, 38); ctx.stroke(); } }
      else { fillP([[-40, 34], [-8, -18], [8, -18], [40, 34]], OFF); ctx.fillStyle = GREEN; circle(0, -34, 14, GREEN); circle(14, -54, 10, rgb(GREEN, 0.6)); }
      ctx.restore();
      txt(label, 50, 6, label.length > 10 ? 74 : 92, OFF, { ls: 2 });
      ctx.restore();
    });
    // UNSETTLED stamp
    const sp = pr(lt, tD - 0.05, 0.28);
    if (sp > 0) { const sc = lerp(2.2, 1, eo(sp)); ctx.save(); ctx.translate(560, 1230); ctx.rotate(-9 * Math.PI / 180); ctx.scale(sc, sc); ctx.globalAlpha *= Math.min(1, sp * 3);
      ctx.strokeStyle = GREEN; ctx.lineWidth = 12; rr(-360, -84, 720, 168, 16); ctx.stroke(); ctx.lineWidth = 3; rr(-346, -70, 692, 140, 10); ctx.stroke();
      txt('UNSETTLED', 0, 6, 120, GREEN, { ls: 6 });
      for (let i = 0; i < 160; i++) { ctx.fillStyle = `rgba(8,20,28,${0.6 + rnd(i) * 0.4})`; ctx.fillRect((rnd(i * 3) - 0.5) * 760, (rnd(i * 5 + 1) - 0.5) * 190, 3 + rnd(i) * 8, 2 + rnd(i + 3) * 4); }
      ctx.restore(); }
    vig(0.6); grain(t);
  } });
  cue(Wd('what', 9), 'whoosh', { gain: 0.4 }); [0, 1, 2].forEach((i) => cue(Wd('what', 9) + 0.1 + i * 0.4, 'tock', { gain: 0.6 })); cue(Wd('debate', 9) - 0.05, 'slam', { gain: 0.7 });
}
