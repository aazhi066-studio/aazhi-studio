// v24 worker A: script lines 0-3 (hook blast, Thanjavur 1673, the Madurai proposal, the refusal and the march). Shots run 0 .. L(4).
import * as G from './glass.js';
import { L, Le, Wd } from './core/timing.js';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd, TAU, line, circle, ell } from './core/lib.js';
import { rgba, mixc, lg, stars } from './art.js';

const P = G.PAL;
const DAY = ['#4664C0', '#F3E6C8'];
const MINT = '#B9D7A8', ROSE = '#EBB39E';

// ---------- local helpers ----------
const pop = (lt, t0, d = 0.3) => eob(clamp((lt - t0) / d));
function shk(lt, t0, amp, dur = 0.5) { const k = 1 - seg(lt, t0, t0 + dur); if (lt < t0 || k <= 0) return [0, 0]; const a = amp * k * k; return [Math.sin(lt * 93) * a, Math.cos(lt * 71) * a]; }
// panel with a shake offset applied to the frame and the scene inside it
function pnl(t, o, sx = 0, sy = 0) { const r = G.panel(t, { ...o, x: 60 + sx, y: 110 + sy }); if (sx || sy) ctx.translate(sx, sy); return r; }
function embers(t, x0, x1, y0, y1, n = 30, seed = 0, a = 1) {
  for (let i = 0; i < n; i++) { const q = (t * (0.5 + rnd(i + seed) * 0.6) + rnd(i * 3 + seed)) % 1, x = lerp(x0, x1, rnd(i * 7 + seed)) + Math.sin(t * 3 + i) * 30, y = lerp(y1, y0, q);
    circle(x, y, 3 + rnd(i + 2) * 5, rgba(i % 3 ? P.fire : P.fireHi, a * (1 - q) * 0.9)); }
}
function glow(x, y, r, col, a) { if (a <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
function groundStrip(y, col, y1 = 1460) { ctx.fillStyle = col; ctx.fillRect(0, y, W, y1 - y); line([[0, y], [W, y]], P.ink, 6); }
// faceless veiled woman, cut-out silhouette (no features), rim-lit
function veiled(x, y, s, col, sway = 0, rim = P.pink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(sway * 0.02);
  ctx.beginPath(); ctx.moveTo(-78, 0); ctx.quadraticCurveTo(-70, -120, -50, -200); ctx.quadraticCurveTo(-56, -300, 0, -310); ctx.quadraticCurveTo(56, -300, 50, -200);
  ctx.quadraticCurveTo(70, -120, 78, 0); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = rgba(rim, 0.85); ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-50, -200); ctx.quadraticCurveTo(0, -170, 50, -200); ctx.strokeStyle = rgba(rim, 0.5); ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
// gilt marriage tray with a marigold garland draped over it; o.tilt rotates
function tray(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0); ctx.scale(s, s);
  // garland loop hanging below
  const n = 22; for (let i = 0; i < n; i++) { const u = i / (n - 1), gx = lerp(-100, 100, u), gy = 14 + Math.sin(u * Math.PI) * (110 + Math.sin(t * 3) * 6) + Math.sin(t * 3 + u * 3) * 4;
    circle(gx, gy, 15, P.ink); circle(gx, gy, 12, i % 3 === 0 ? P.cream : i % 2 ? P.fire : P.ochre); }
  ell(0, 6, 136, 40, P.ink); ell(0, 0, 130, 36, P.giltDk); ell(0, -6, 122, 30, P.gilt); ell(-30, -12, 50, 10, rgba(P.giltHi, 0.8));
  // heaped flowers + two gift boxes
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI; circle(Math.cos(a) * 80, -14 - Math.sin(a) * 26, 16, P.ink); circle(Math.cos(a) * 80, -14 - Math.sin(a) * 26, 13, i % 2 ? P.vermil : P.fire); }
  for (const bx of [-34, 30]) { ctx.fillStyle = P.ink; ctx.fillRect(bx - 26, -78, 52, 50); ctx.fillStyle = bx < 0 ? P.vermil : P.greenHi; ctx.fillRect(bx - 21, -73, 42, 40); ctx.fillStyle = P.gilt; ctx.fillRect(bx - 4, -73, 8, 40); }
  ctx.restore();
}
// raised arm (sleeve + palm) from shoulder to hand, screen coords
function arm(sx, sy, hx, hy, robe, w = 56) {
  line([[sx, sy], [hx, hy]], P.ink, w + 14); line([[sx, sy], [hx, hy]], robe, w);
  circle(hx, hy, w * 0.8 + 6, P.ink); circle(hx, hy, w * 0.8, '#B9824F');
}
// royal parasol canopy (secular court sign)
function parasol(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.5) * 0.03);
  line([[0, -10], [0, 260]], P.ink, 10);
  ctx.beginPath(); ctx.moveTo(-200, 0); ctx.quadraticCurveTo(-180, -120, 0, -130); ctx.quadraticCurveTo(180, -120, 200, 0); ctx.closePath(); ctx.fillStyle = P.gilt; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 7; ctx.stroke();
  for (let i = 0; i < 10; i++) { const fx = -180 + i * 40; ctx.beginPath(); ctx.arc(fx, 4, 20, 0, Math.PI); ctx.fillStyle = i % 2 ? P.vermil : P.green; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke(); }
  circle(0, -138, 16, P.giltHi); ctx.restore();
}
// simple flat city skyline (houses with tiled roofs), no temples
function town(x0, x1, y, h, col, roof, seed = 0) {
  let x = x0, i = 0; while (x < x1) { const w = 70 + rnd(i + seed) * 70, hh = h * (0.5 + rnd(i * 3 + seed) * 0.6);
    ctx.fillStyle = col; ctx.fillRect(x, y - hh, w, hh); ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.strokeRect(x, y - hh, w, hh);
    ctx.beginPath(); ctx.moveTo(x - 8, y - hh); ctx.lineTo(x + w / 2, y - hh - 36); ctx.lineTo(x + w + 8, y - hh); ctx.closePath(); ctx.fillStyle = roof; ctx.fill(); ctx.stroke();
    ctx.fillStyle = P.ink; ctx.fillRect(x + w / 2 - 9, y - hh * 0.55, 18, 26); x += w + 6; i++; }
}
function sun(x, y, r, t, col = P.gilt) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.4);
  ctx.beginPath(); for (let i = 0; i < 32; i++) { const rr2 = (i % 2 ? 1.0 : 1.28) * r; ctx.lineTo(Math.cos(i / 32 * TAU) * rr2, Math.sin(i / 32 * TAU) * rr2); } ctx.closePath();
  ctx.fillStyle = P.ochre; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  circle(x, y, r * 0.86, P.ink); circle(x, y, r * 0.8, col); circle(x - r * 0.25, y - r * 0.25, r * 0.25, rgba(P.giltHi, 0.7));
}

// line-0 "family" scene (also the static front of the line-1 shatter)
function familyScene(t, lt, sx = 0, sy = 0) {
  const r = pnl(t, { ground: [mixc(P.cream, '#5A5068', 0.55), mixc(P.cream, '#3A2C40', 0.7)], rot: 0.01 * Math.sin(lt * 3) }, sx, sy);
  // palace wall close: ochre band, carved border
  ctx.fillStyle = mixc(P.ochre, '#3A2020', 0.45); ctx.fillRect(r.x, 180, r.w, 70); line([[0, 250], [W, 250]], P.ink, 6); line([[0, 180], [W, 180]], P.ink, 6);
  const ax = 540, top = 330, bot = 1250, hw = 330;
  const archPath = (k = 0) => { ctx.beginPath(); ctx.moveTo(ax - hw - k, bot + k); ctx.lineTo(ax - hw - k, top + 300); ctx.quadraticCurveTo(ax - hw - k, top - k, ax, top - 40 - k); ctx.quadraticCurveTo(ax + hw + k, top - k, ax + hw + k, top + 300); ctx.lineTo(ax + hw + k, bot + k); ctx.closePath(); };
  archPath(36); ctx.fillStyle = P.ink; ctx.fill(); archPath(26); ctx.fillStyle = P.gilt; ctx.fill(); archPath(8); ctx.fillStyle = P.ink; ctx.fill();
  ctx.save(); archPath(0); ctx.clip();
  const fl = 0.5 + 0.5 * Math.sin(t * 11) * Math.sin(t * 7.3);
  ctx.fillStyle = lg(0, top, 0, bot, [[0, P.fire], [0.55, mixc(P.fireHi, P.fire, 0.3 * fl)], [1, P.vermil]]); ctx.fillRect(ax - hw, top - 60, hw * 2, bot - top + 80);
  glow(ax, 900, 420, P.fireHi, 0.55 + 0.25 * fl);
  // three veiled women, cut-out silhouettes, standing together
  veiled(ax - 170, bot, 1.55, '#3A1A28', Math.sin(t * 1.3)); veiled(ax + 170, bot, 1.55, '#3A1A28', Math.sin(t * 1.1 + 1));
  veiled(ax, bot + 10, 1.85, '#2A1220', Math.sin(t * 1.2 + 2));
  // lattice mullions
  line([[ax - 110, top], [ax - 110, bot]], rgba(P.ink, 0.55), 8); line([[ax + 110, top], [ax + 110, bot]], rgba(P.ink, 0.55), 8);
  ctx.restore();
  // ledge
  ctx.fillStyle = P.ochre; ctx.fillRect(ax - hw - 70, bot + 30, hw * 2 + 140, 50); ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.strokeRect(ax - hw - 70, bot + 30, hw * 2 + 140, 50);
  G.puffs(ax - 380, 520, t, 4, 0.6, 3); G.puffs(ax + 380, 540, t, 4, 0.6, 9);
  embers(t, 100, 980, 200, 1300, 26, 4);
  G.crack(900, 260, 1, 17, { len: 900, n: 7 });
  G.glassTop(t, r);
  return r;
}

export function buildA(add, cue) {
  // ================= LINE 0: HOOK =================
  const tPal = Wd('palace', 0), tFam = Wd('family', 0), tBlast = 0.2;
  const a1At = tPal - 0.15, a2At = tFam - 0.05, a3At = L(1) - 0.12;

  add({ id: 'a0_blast', at: 0, cam: [540, 860], zoom: 0.1, note: 'HOOK: night palace, fuse spark racing, white flash + burst + glass crack, windows flare to fire',
    draw(lt, d, t) {
      const [sx, sy] = shk(lt, tBlast, 26, 0.9), bl = seg(lt, tBlast, tBlast + 0.3);
      const r = pnl(t, { ground: [mixc(P.night, P.vermilDk, bl * 0.6), mixc('#241A30', P.fire, bl * 0.45)], rot: -0.025 * eo(bl) + 0.01 * Math.sin(lt * 4) }, sx, sy);
      stars(t, 60, 1 - bl * 0.7, 700, 2);
      circle(850, 300, 60, rgba(P.cream, 0.9 - bl * 0.6));
      glow(540, 800, 700, P.fire, 0.5 * bl);
      groundStrip(1250, '#13301F');
      G.palace(540, 1250, 1.02, { lit: 1, burn: bl, t });
      if (bl > 0) { const k = eo(seg(lt, tBlast, tBlast + 0.5)); for (const [fx, fy, fs, sd] of [[230, 880, 0.9, 1], [850, 880, 0.9, 2], [540, 380, 1.1, 3], [400, 1040, 0.5, 4], [690, 1040, 0.5, 5]]) G.fire(fx, fy, fs * k, t, sd);
        G.puffs(540, 500, t, 6, 0.8 * k, 1); embers(t, 150, 930, 200, 1200, 30, 1, k); }
      // fuse from keg to gate, spark racing until the blast
      const fuse = (u) => { const x = lerp(210, 490, u), y = lerp(1262, 1245, u) - Math.sin(u * Math.PI) * 60 + 20 * u; return [x, y]; };
      const su = clamp(0.35 + lt / tBlast * 0.65);
      const pts = []; for (let i = 0; i <= 20; i++) pts.push(fuse(i / 20)); line(pts, P.ink, 7);
      if (lt < tBlast + 0.05) { const [fx, fy] = fuse(su); glow(fx, fy, 90, P.fireHi, 0.9); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * 20; line([[fx, fy], [fx + Math.cos(a) * 36, fy + Math.sin(a) * 36]], P.fireHi, 4); } circle(fx, fy, 12, '#FFFFFF'); }
      G.keg(180, 1420, 1.3, { glow: lt < tBlast ? 1 : 0, t });
      G.burst(540, 760, 620, seg(lt, tBlast, tBlast + 0.6));
      G.crack(540, 760, seg(lt, tBlast, tBlast + 0.4), 7, { len: 1100, n: 11, lw: 5 });
      G.glassTop(t, r);
      G.flash(lt < tBlast ? 0 : 1 - eo(seg(lt, tBlast, tBlast + 0.4)));
    } });
  cue(0, 'slam', { gain: 1 }); cue(0.02, 'thud', { gain: 0.8 }); cue(tBlast, 'thud', { gain: 1 }); cue(tBlast + 0.02, 'rumble', { gain: 0.9, dur: 2.2 });

  add({ id: 'a1_windows', at: a1At, cam: [540, 980], zoom: 0.16, note: 'HOOK: close push along burning arched windows, fire tongues, smoke, cracked glass',
    draw(lt, d, t) {
      const [sx, sy] = shk(lt, 0, 14, 0.4), k = eio(clamp(lt / d));
      const r = pnl(t, { ground: [P.vermilDk, P.night], rot: lerp(0.03, -0.02, k) }, sx, sy);
      glow(540, 900, 800, P.fire, 0.45);
      const px = lerp(620, 470, k);
      G.palace(px, 1580, 1.75, { burn: 1, t });
      for (let i = 0; i < 7; i++) { const wx = px + (-300 + i * 100) * 1.75; G.fire(wx, 1580 - 190 * 1.75 - 70, 0.38, t, i); }
      for (const i of [0, 1]) G.fire(px + (-50 + i * 100) * 1.75, 1580 - 580 * 1.75, 0.32, t, i + 9);
      G.fire(px - 560, 870, 0.9, t, 3); G.fire(px + 560, 870, 0.9, t, 4);
      G.puffs(px, 520, t, 7, 0.8, 5);
      embers(t, 60, 1020, 150, 1400, 40, 2);
      G.crack(820, 360, clamp(0.6 + lt / d * 0.4), 11, { len: 1000, n: 8 });
      G.glassTop(t, r);
    } });
  cue(a1At, 'whoosh', { gain: 0.6 });

  add({ id: 'a2_family', at: a2At, cam: [540, 820], zoom: 0.12, note: 'HOOK "and family?": veiled women as dark cut-outs inside a fire-lit arch; DISPUTED tag pops',
    draw(lt, d, t) {
      familyScene(t, lt);
      G.tag('DISPUTED', 540, 1370, { sc: pop(lt, 0.15), rot: -0.04, col: P.cream, ink: P.vermilDk });
    } });
  cue(a2At, 'thud', { gain: 0.6 }); cue(a2At + 0.15, 'pop', { gain: 0.5 }); cue(a2At + 0.05, 'heartbeat', { gain: 0.5 });

  // ================= LINE 1: THANJAVUR 1673 =================
  const tSix = Wd('sixteen', 1), tVij = Wd('vijayaraghava', 1), tRuled = Wd('ruled', 1), tDec = Wd('decades', 1);
  const R0 = { x: 60, y: 110, w: 960, h: 1330 };
  const dayCity = (lt, t) => {
    const r = G.panel(t, { ground: DAY, rot: 0.006 * Math.sin(lt * 2) });
    sun(820, 470, 80, t);
    G.palace(540, 1240, 0.78, { lit: 0.35, t });
    G.banner(540 - 6, 1240 - 880 * 0.78, 0.6, P.green, t); G.banner(250, 1240 - 400 * 0.78 + 30, 0.45, P.green, t + 1); G.banner(820, 1240 - 400 * 0.78 + 30, 0.45, P.green, t + 2);
    groundStrip(1300, '#6E7F3A');
    G.wall(40, 1060, 1440, 190, { col: '#8E4A2E' });
    for (const bx of [150, 420, 690, 960]) G.banner(bx, 1240, 0.55, P.green, t + bx);
    G.title('THANJAVUR', 540, 330, 120, seg(lt, 0.25, 1.0));
    G.glassTop(t, r);
  };
  add({ id: 'a3_thanjavur', at: a3At, cam: [540, 760], zoom: 0.08, note: 'line 1: family scene SHATTERS away revealing daytime Thanjavur (palace, wall, green banners); THANJAVUR title drops',
    draw(lt, d, t) {
      G.shatter(() => dayCity(lt, t), () => { familyScene(a3At - 0.01, 0.8); G.tag('DISPUTED', 540, 1370, { rot: -0.04, col: P.cream, ink: P.vermilDk }); }, R0, eio(seg(lt, 0, 0.8)), { key: 'a_fam', cx: 540, cy: 800, seed: 5 });
    } });
  cue(a3At, 'slam', { gain: 0.8 }); cue(a3At + 0.05, 'sparkle', { gain: 0.6 }); cue(a3At + 0.35, 'tock', { gain: 0.5 });

  add({ id: 'a4_1673', at: tSix, cam: [540, 640], zoom: 0.1, note: '"1673": low angle on the palace tower, rayed sun rising behind, 1673 foil numerals drop',
    draw(lt, d, t) {
      const k = eio(clamp(lt / d));
      const r = G.panel(t, { ground: [P.ultraHi, P.cream], rot: lerp(-0.02, 0.015, k) });
      sun(540, lerp(900, 640, eo(clamp(lt / 1.2))), 190, t);
      G.foil(80, 130, 920, 400, t, 18, 3);
      G.palace(540, 1960 - 60 * k, 1.5, { lit: 0.4, t });
      G.banner(534, 1960 - 60 * k - 880 * 1.5, 0.9, P.green, t);
      G.banner(110, 1960 - 60 * k - 400 * 1.5, 0.8, P.green, t + 1); G.banner(860, 1960 - 60 * k - 400 * 1.5, 0.8, P.green, t + 2);
      G.title('1673', 540, 330, 230, seg(lt, 0.0, 1.2));
      G.glassTop(t, r);
    } });
  cue(tSix, 'whoosh', { gain: 0.5 }); cue(tSix + 0.1, 'chisel', { gain: 0.6 }); cue(Wd('three', 1), 'chisel', { gain: 0.5 });

  add({ id: 'a5_king', at: tVij, cam: [540, 760], zoom: 0.1, note: 'Vijayaraghava: green-robed faceless king paints in (outline then colour), parasol, curtains; ILLUSTRATION tag',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: [P.ultra, P.night] });
      G.archTop(r, 1); G.foil(80, 400, 920, 900, t, 30, 7);
      // swagged curtains
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * 480, 350); ctx.quadraticCurveTo(540 + s * 300, 520 + Math.sin(t * 1.4 + s) * 12, 540 + s * 480, 900); ctx.closePath(); ctx.fillStyle = P.green; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.stroke(); }
      ctx.fillStyle = P.vermilDk; ctx.fillRect(r.x, 1340, r.w, 120); line([[0, 1340], [W, 1340]], P.ink, 6);
      const p = seg(lt, 0, 1.1);
      ctx.save(); ctx.globalAlpha = eo(seg(lt, 0.4, 0.9)); parasol(540, 510, 1.1, t); ctx.restore();
      glow(540, 900, 460, P.giltHi, 0.25 * eo(seg(lt, 0.6, 1.2)));
      G.person(540, 1345, 2.5, { kind: 'king', robe: P.green, p });
      G.glassTop(t, r);
      G.tag('ILLUSTRATION', 540, 200, { sc: pop(lt, 0.15) * 0.85, rot: -0.02 });
    } });
  cue(tVij, 'swell', { gain: 0.5 }); cue(tVij + 0.15, 'pop', { gain: 0.4 }); cue(tVij + 0.8, 'sparkle', { gain: 0.5 });

  add({ id: 'a6_decades', at: tRuled, cam: [540, 900], zoom: 0.08, note: '"for decades": sun and moon wheel overhead, sky cycles day/night, gilt year tally carves in, FOR DECADES title',
    draw(lt, d, t) {
      const a = Math.PI * 0.15 + lt * 4.2, day = 0.5 + 0.5 * Math.sin(a);
      const r = G.panel(t, { ground: [mixc(P.night, P.ultraHi, day), mixc('#241A30', P.cream, day)] });
      stars(t, 50, 1 - day, 800, 5);
      const cx = 540, cy = 1080, R = 470;
      sun(cx - Math.cos(a) * R, cy - Math.sin(a) * R, 80, t);
      circle(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 62, P.ink); circle(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 56, P.cream);
      G.palace(540, 1120, 0.52, { lit: 1 - day * 0.7, t });
      G.banner(537, 1120 - 880 * 0.52, 0.4, P.green, t);
      groundStrip(1110, mixc('#13301F', '#6E7F3A', day));
      G.person(540, 1250, 0.45, { kind: 'king', robe: P.green });
      // tally of years
      const n = Math.floor(clamp(lt / (d - 0.2)) * 30);
      for (let i = 0; i < n; i++) { const g = Math.floor(i / 5), j = i % 5, gx = 150 + g * 150, gy = 1330;
        if (j < 4) { line([[gx + j * 22, gy - 50], [gx + j * 22, gy + 50]], P.ink, 13); line([[gx + j * 22, gy - 50], [gx + j * 22, gy + 50]], P.gilt, 8); }
        else { line([[gx - 16, gy + 40], [gx + 82, gy - 40]], P.ink, 13); line([[gx - 16, gy + 40], [gx + 82, gy - 40]], P.vermil, 8); } }
      G.title('FOR DECADES', 540, 280, 104, seg(lt, tDec - tRuled - 0.35, tDec - tRuled + 0.4));
      G.glassTop(t, r);
    } });
  cue(tRuled, 'whoosh', { gain: 0.4 }); for (let i = 0; i < 5; i++) cue(tRuled + 0.2 + i * 0.3, 'tock', { gain: 0.3 });

  // ================= LINE 2: THE PROPOSAL =================
  const a7At = L(2) - 0.1, tNay = Wd('nayak', 2), tMad = Wd('madurai', 2), tMarry = Wd('marry', 2), tDau = Wd('daughter', 2);
  add({ id: 'a7_chokkanatha', at: a7At, cam: [460, 800], zoom: 0.1, note: 'ACCOUNTS SAY: vermilion-robed king (Chokkanatha) paints in, Madurai town + vermilion banners behind; NAYAK OF MADURAI tag',
    draw(lt, d, t) {
      const k = eio(clamp(lt / d));
      const r = G.panel(t, { ground: [P.cream, ROSE], rot: lerp(0.015, -0.01, k) });
      sun(860, 420, 70, t, P.giltHi);
      town(60, 1040, 1150, 200, P.cream, P.vermilDk, 4);
      for (const bx of [140, 360, 720, 940]) G.banner(bx, 1000, 0.6, P.vermil, t + bx);
      groundStrip(1150, P.ochre);
      ctx.fillStyle = mixc(P.ochre, P.vermilDk, 0.4); ctx.fillRect(r.x, 1360, r.w, 100);
      const x = lerp(360, 460, eo(clamp(lt / 1.2)));
      G.person(x, 1350, 2.3, { kind: 'king', robe: P.vermil, p: seg(lt, 0.05, 1.1) });
      G.person(820, 1300, 1.0, { kind: 'soldier', robe: P.vermil, dir: -1, p: seg(lt, 0.4, 1.2) });
      G.glassTop(t, r);
      G.tag('ACCOUNTS SAY', 540, 200, { sc: pop(lt, 0.05) * 0.85, rot: 0.02 });
      G.tag('NAYAK OF MADURAI', 540, 1390, { sc: pop(lt, tNay - a7At) * 0.8, col: P.vermil, ink: P.cream, rot: -0.02 });
    } });
  cue(a7At, 'whoosh', { gain: 0.5 }); cue(a7At + 0.05, 'pop', { gain: 0.5 }); cue(tNay, 'pop', { gain: 0.45 });

  add({ id: 'a8_split', at: tMad - 0.05, cam: [540, 900], zoom: 0.06, note: 'split panel MADURAI | THANJAVUR: two kings, a vermilion messenger rider gallops the gift tray across the divider',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: P.cream });
      ctx.fillStyle = lg(0, 110, 0, 1440, [[0, P.cream], [1, ROSE]]); ctx.fillRect(60, 110, 480, 1330);
      ctx.fillStyle = lg(0, 110, 0, 1440, [[0, P.cream], [1, MINT]]); ctx.fillRect(540, 110, 480, 1330);
      G.palace(300, 1100, 0.42, { lit: 0.3, t }); G.palace(780, 1100, 0.42, { lit: 0.3, t });
      G.banner(298, 1100 - 880 * 0.42, 0.35, P.vermil, t); G.banner(778, 1100 - 880 * 0.42, 0.35, P.green, t + 1);
      ctx.fillStyle = mixc(P.ochre, P.vermilDk, 0.25); ctx.fillRect(60, 1100, 480, 340); ctx.fillStyle = '#6E7F3A'; ctx.fillRect(540, 1100, 480, 340); line([[0, 1100], [W, 1100]], P.ink, 6);
      G.person(170, 1270, 0.85, { kind: 'king', robe: P.vermil, p: seg(lt, 0, 0.5) });
      G.person(910, 1270, 0.85, { kind: 'king', robe: P.green, dir: -1, p: seg(lt, 0, 0.5) });
      // divider mullion
      ctx.fillStyle = P.teakDk; ctx.fillRect(526, 110, 28, 1330); line([[524, 110], [524, 1440]], P.gilt, 4); line([[556, 110], [556, 1440]], P.gilt, 4);
      // rider with the tray crossing left -> right
      const rx = lerp(120, 900, eio(clamp(lt / (d + 0.2)))), g = lt * 16;
      G.rider(rx, 1430, 0.62, { robe: P.vermil, gallop: g, shield: P.vermil });
      tray(rx + 30, 1430 - 470 * 0.62 + Math.sin(g) * 5, 0.55, t);
      G.puffs(rx - 120, 1460, t * 2, 3, 0.5, 8);
      G.title('MADURAI', 300, 260, 84, seg(lt, 0, 0.6));
      G.title('THANJAVUR', 790, 260, 64, seg(lt, 0.25, 0.9));
      G.glassTop(t, r);
    } });
  cue(tMad - 0.05, 'slide', { gain: 0.5 }); for (let i = 0; i < 4; i++) cue(tMad + 0.05 + i * 0.28, 'tock', { gain: 0.3, pan: -0.6 + i * 0.4 });

  add({ id: 'a9_offer', at: tMarry, cam: [560, 900], zoom: 0.1, note: '"marry his daughter": Thanjavur court, messenger offers the garland tray, green king; the veiled daughter paints in behind him',
    draw(lt, d, t) {
      const r = G.panel(t, { ground: [P.cream, MINT] });
      G.archTop(r, 1, P.green); G.foil(80, 140, 920, 200, t, 14, 11);
      for (const cx of [300, 780]) { ctx.beginPath(); ctx.moveTo(cx - 170, 1200); ctx.lineTo(cx - 170, 640); ctx.quadraticCurveTo(cx - 170, 470, cx, 450); ctx.quadraticCurveTo(cx + 170, 470, cx + 170, 640); ctx.lineTo(cx + 170, 1200); ctx.closePath(); ctx.fillStyle = rgba(P.green, 0.25); ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.stroke(); }
      ctx.fillStyle = P.green; ctx.fillRect(r.x, 1330, r.w, 130); line([[0, 1330], [W, 1330]], P.ink, 6);
      const dp = seg(lt, tDau - tMarry - 0.1, tDau - tMarry + 0.9);
      glow(900, 950, 300, P.giltHi, 0.4 * dp);
      G.person(905, 1335, 1.5, { kind: 'woman', robe: P.greenHi, veil: P.cream, dir: -1, p: dp });
      G.person(700, 1340, 1.9, { kind: 'king', robe: P.green, dir: -1 });
      const mx = lerp(80, 250, eo(clamp(lt / 0.7)));
      G.person(mx, 1340, 1.6, { kind: 'plain', robe: P.vermil });
      const ty = 1340 - 180 * 1.6 + Math.sin(t * 2.5) * 6;
      arm(mx + 40, 1340 - 160 * 1.6, mx + 140, ty + 30, P.vermil, 34);
      tray(mx + 170, ty, 1.0, t);
      G.foil(mx + 60, ty - 120, 220, 120, t, 10, 2);
      G.glassTop(t, r);
    } });
  cue(tMarry, 'slide', { gain: 0.5 }); cue(tDau, 'sparkle', { gain: 0.6 }); cue(tDau + 0.1, 'bell', { gain: 0.35 });

  // ================= LINE 3: REFUSED, THE MARCH =================
  const tRef = Wd('refused', 3) - 0.05, tArmy = Wd('army', 3) - 0.05, tThan = Wd('thanjavur', 3);
  add({ id: 'a10_refused', at: tRef, cam: [460, 820], zoom: 0.08, note: '"refused": hard cut, green king throws up a palm, the tray cracks and falls, garland beads scatter, vermilion flash, REFUSED',
    draw(lt, d, t) {
      const [sx, sy] = shk(lt, 0.05, 22, 0.6);
      const r = pnl(t, { ground: [MINT, P.green], rot: 0.02 * eo(seg(lt, 0.3, 0.9)) }, sx, sy);
      G.burst(340, 800, 420, seg(lt, 0.05, 0.6), P.vermil);
      // king (big, right) with raised palm
      G.person(840, 1600, 3.0, { kind: 'king', robe: P.green, dir: -1 });
      const ak = eob(seg(lt, 0, 0.18));
      arm(730, 1080, lerp(700, 610, ak), lerp(1350, 700, ak), P.green, 62);
      // tray cracks then drops
      const q = seg(lt, 0.3, 0.9), tx = 320 - 60 * q, ty = 800 + 800 * q * q;
      tray(tx, ty, 1.9, t, { tilt: -0.9 * q });
      for (let i = 0; i < 14; i++) { const a = rnd(i + 3) * TAU, v = 200 + rnd(i) * 400, qq = seg(lt, 0.1, 0.9); if (qq <= 0) break;
        circle(320 + Math.cos(a) * v * qq, 900 + Math.sin(a) * v * qq + 900 * qq * qq, 18, P.ink); circle(320 + Math.cos(a) * v * qq, 900 + Math.sin(a) * v * qq + 900 * qq * qq, 14, i % 2 ? P.fire : P.ochre); }
      G.crack(330, 790, seg(lt, 0.05, 0.3), 21, { len: 800, n: 10, lw: 5 });
      G.title('REFUSED', 540, 300, 150, seg(lt, 0.05, 0.45), { fill: P.vermil });
      G.glassTop(t, r);
      G.flash(0.85 * (1 - eo(seg(lt, 0.03, 0.35))), P.vermil);
    } });
  cue(tRef, 'slam', { gain: 1 }); cue(tRef + 0.05, 'thud', { gain: 0.8 }); cue(tRef + 0.35, 'whoosh', { gain: 0.4 }); cue(tRef + 0.85, 'plop', { gain: 0.5 });

  const army = (lt, t, adv, rows) => {
    rows.forEach(([y, s, n, gap, x0, ban]) => {
      const x = x0 + adv;
      G.puffs(x - gap * 2, y + 10, t * 1.5 + s, 3, 0.35, Math.round(s * 10));
      G.crowd(x - gap * (n - 1), x, y, n, s, { robe: P.vermil, walk: lt * 7, banners: ban, t, shield: P.gilt });
    });
  };
  add({ id: 'a11_march', at: tArmy, cam: [700, 1050], zoom: 0.1, note: '"the army of Madurai marched": vermilion ranks with banners march right toward the green-bannered Thanjavur wall',
    draw(lt, d, t) {
      const k = eio(clamp(lt / d));
      const r = G.panel(t, { ground: [P.ultraHi, P.cream], rot: lerp(-0.012, 0.008, k) });
      sun(250, 380, 70, t);
      G.palace(870, 1060, 0.5, { lit: 0.35, t }); G.banner(867, 1060 - 880 * 0.5, 0.38, P.green, t);
      groundStrip(1150, '#C9A35A');
      G.wall(700, 1100, 1220, 220, {});
      for (const bx of [740, 880, 1000]) G.banner(bx, 1000, 0.55, P.green, t + bx);
      army(lt, t, 170 * lt, [[1240, 0.42, 9, 70, 300, 3], [1330, 0.52, 8, 88, 240, 3], [1450, 0.66, 7, 110, 170, 0]]);
      G.glassTop(t, r);
      G.tag('MADURAI', 300, 560, { sc: pop(lt, Wd('madurai', 3) - tArmy) * 0.85, col: P.vermil, ink: P.cream, rot: -0.03 });
    } });
  for (let i = 0; i * 0.449 < Wd('thanjavur', 3) - tArmy; i++) cue(tArmy + i * 0.449, 'drum', { gain: 0.55, pan: -0.4 });
  cue(Wd('madurai', 3), 'pop', { gain: 0.4 });

  add({ id: 'a12_wall', at: tThan - 0.05, cam: [760, 900], zoom: 0.18, note: '"on Thanjavur": close on the green-banner Thanjavur wall as vermilion front rank surges in, THANJAVUR tag, rush to next line',
    draw(lt, d, t) {
      const k = eio(clamp(lt / d)), rush = seg(lt, d - 0.5, d);
      const r = G.panel(t, { ground: [P.ultraHi, P.cream], rot: lerp(0.01, -0.02, k), sc: 1 + 0.05 * eo(rush) });
      G.palace(760, 900, 0.75, { lit: 0.5, t }); G.banner(757, 900 - 880 * 0.75, 0.55, P.green, t);
      groundStrip(1140, '#C9A35A');
      G.wall(300, 1200, 1250, 330, {});
      for (const bx of [380, 560, 760, 960]) G.banner(bx, 920, 0.8, P.green, t + bx);
      army(lt, t, 260 * lt + 400 * rush * rush, [[1330, 0.62, 6, 105, 90, 2], [1460, 0.8, 5, 135, 0, 2]]);
      // speed streaks for forward momentum
      ctx.save(); ctx.globalAlpha = 0.25 + 0.5 * rush; for (let i = 0; i < 6; i++) { const yy = 1180 + i * 45, xx = ((lt * 900 + rnd(i) * 600) % 1100) - 200; line([[xx, yy], [xx + 160 + 120 * rush, yy]], P.cream, 6); } ctx.restore();
      G.glassTop(t, r);
      G.tag('THANJAVUR', 760, 300, { sc: pop(lt, 0.05) * 0.9, col: P.green, ink: P.cream, rot: 0.02 });
    } });
  for (let i = 0; tThan - 0.05 + i * 0.449 < L(4) - 0.3; i++) cue(tThan - 0.05 + i * 0.449, 'drum', { gain: 0.65, pan: 0.2 });
  cue(tThan, 'pop', { gain: 0.4 }); cue(L(4) - 0.3, 'whoosh', { gain: 0.7 });
}
