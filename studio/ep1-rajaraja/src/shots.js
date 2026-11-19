// THE KING WHO BUILT A MOUNTAIN IN STONE · AAZHI (Chola Chronicle style) : the shot list.
import { ctx, W, H, TAU, clamp, lerp, seg, eo, eio, eob, rnd, rr, circle, ell, line } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import * as K from './core/kit.js';
import * as A from './art.js';
const { P } = K;
const { lg, poly, fillP, rgba, mixc } = A;

export function buildShots() {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });

  // ───────── 1 · 0 to 6.7 s : an enormous silhouette rising out of the dark ─────────
  add({ id: 'S01', at: 0, cam: [540, 900], zoom: 0.05, note: 'silhouette emerges, light sweeps up the tower, title', draw(lt, d, t) {
    ctx.fillStyle = lg(0, -300, 0, 1900, [[0, '#030101'], [0.35, '#150A05'], [0.7, '#4A2210'], [1, '#B35E28']]); ctx.fillRect(-300, -300, W + 600, 2300);
    const rise = eio(clamp(lt / 3.2));
    A.stars(t, 90, 1 - rise * 0.55, 1000);
    K.glow(540, 1050, 980, '255,150,60', 0.5 * rise);
    const tilt = (1 - eio(clamp(lt / d))) * 560, s = 1.06, by = 2160 - tilt;      // base y: the camera tilts up the tower
    const a = clamp(lt / 1.4);
    A.drawVimana('silplain', 540, by, s, a, 1.5);
    // light sweep: the rim-lit version is revealed from the foot upwards
    const sweep = by - eio(clamp((lt - 0.6) / 5.4)) * 1900 + 120;
    ctx.save(); ctx.beginPath(); ctx.rect(-300, sweep, W + 600, 4000); ctx.clip(); A.drawVimana('sil', 540, by, s, a, 1.5); ctx.restore();
    // sweeping glint where the light front passes
    K.glow(540, sweep, 380, '255,190,100', 0.22 * a);
    A.fog(by - 160, 520, 0.4 * rise, '210,120,50'); A.fog(by - 20, 380, 0.55, '120,60,25');
    A.palm(-40, by + 120, 760, 0.16, 3, '#050201', t); A.palm(1130, by + 140, 820, -0.14, 7, '#050201', t);
    A.dust(t, 36, 2, '255,200,120', 0.45); K.vignette(0.7);
  } });

  // ───────── 2 · 6.75 to 13.55 s : Thanjavur, hazy golden evening on the Kaveri delta, the temple rises out of the haze ─────────
  { const t0 = 6.75;
  add({ id: 'S02', at: t0, cam: [540, 1000], zoom: 0.07, note: 'delta landscape, parallax track, temple emerges from haze', draw(lt, d, t) {
    const k = lt / d, tr = (k - 0.5);                                   // lateral track -0.5..0.5
    K.sky(t, 430, 640);
    // distant hills and the temple (it sharpens as the haze lifts)
    ctx.save(); ctx.translate(-tr * 24, 0);
    ctx.fillStyle = '#9C6A44'; poly([[-300, 1010], [-40, 930], [180, 975], [420, 940], [700, 990], [940, 950], [1400, 1010]]); ctx.fill();
    const lift = eio(clamp((lt - 0.4) / 5.2)), ts = lerp(0.3, 0.4, lift);
    ctx.save(); A.drawVimana('dusk', 690, 1030, ts, 1, 1.0); ctx.restore();
    A.haze(700, 1030, '#F3C77C', 0, 0.9 - 0.62 * lift);
    ctx.restore();
    ctx.save(); ctx.translate(-tr * 50, 0); A.village(-60, 1075, 1.0, 3, '#4A2E1A', '#35200F', 0.6 * eio(clamp((lt - 2) / 3))); A.village(560, 1088, 1.15, 8, '#43291A', '#2F1B0D', 0.5 * eio(clamp((lt - 2) / 3))); K.gopuram(160, 1078, 0.28, K.STONE.warm, { w: 560 }); ctx.restore();
    ctx.globalAlpha = 0.5; A.fog(1070, 170, 0.7, '246,196,120'); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(-tr * 80, 0); [[60, 1090, 230, 0.05, 4], [310, 1096, 190, -0.04, 9], [820, 1092, 250, 0.06, 6], [1010, 1098, 200, -0.05, 2]].forEach(([x, y, h, l, sd]) => A.palm(x, y, h, l, sd, '#3B2412', t)); ctx.restore();
    ctx.save(); ctx.translate(-tr * 110, 0); A.river(1110, 150, t, 560); ctx.restore();
    ctx.save(); ctx.translate(-tr * 150, 0); A.paddy(1260, 2200, t, ['#667428', '#8A8A36', '#F0C679'], 540, tr * 300); ctx.restore();
    A.fog(1250, 90, 0.35, '246,190,110');
    ctx.save(); ctx.translate(-tr * 330, 0); A.palm(-30, 1760, 900, 0.18, 14, '#1A0E06', t); A.palm(1090, 1800, 980, -0.16, 21, '#1A0E06', t); ctx.restore();
    // a flock of birds crossing the sun
    ctx.strokeStyle = '#3A2010'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) { const bx = ((lt * 90 + i * 70) % 1500) - 250, by = 520 + Math.sin(i * 1.7) * 90 + i * 18, fl = Math.sin(t * 9 + i) * 12; ctx.beginPath(); ctx.moveTo(bx - 22, by - fl); ctx.quadraticCurveTo(bx - 8, by - 6, bx, by); ctx.quadraticCurveTo(bx + 8, by - 6, bx + 22, by - fl); ctx.stroke(); }
    K.glow(430, 640, 600, '255,220,140', 0.28);
    A.dust(t, 30, 4, '255,226,160', 0.4); K.vignette(0.55);
    // place name
    const tn = Wd('thanjavur', 2) - t0, pp = clamp((lt - tn) / 0.45);
    if (pp > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, pp * 1.4) * (1 - seg(lt, d - 0.5, d)); ctx.translate(0, (1 - eo(pp)) * 26);
      ctx.fillStyle = 'rgba(21,11,6,0.55)'; rr(220, 130, 640, 200, 36); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 5; rr(220, 130, 640, 200, 36); ctx.stroke();
      K.tamil('தஞ்சாவூர்', 540, 205, 90, P.gold); K.label('THANJAVUR', 540, 292, 42, P.cream); ctx.restore(); }
  } });
  cue(t0, 'whoosh', { gain: 0.8 }); cue(Wd('thanjavur', 2), 'pop', { gain: 0.7 }); }

  // ───────── 3 · 13.55 to 22.95 s : the king, an illustrated royal portrait ─────────
  { const t0 = 13.55;
  add({ id: 'S03', at: t0, cam: [540, 880], zoom: 0.1, note: 'illustrated royal portrait: prabha, crown, parasol, chowries, tiger standard', draw(lt, d, t) {
    const k = lt / d; K.bronzeHall(t);
    ctx.save(); ctx.translate((0.5 - k) * 40, 0);
    // a faint lotus lattice on the wall
    ctx.globalAlpha = 0.12; for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) K.lotus(110 + c * 290 + (r % 2) * 145, 260 + r * 250, 0.9, P.gold, P.goldDark); ctx.globalAlpha = 1; ctx.restore();
    ctx.save(); ctx.translate((0.5 - k) * 18, 0); A.prabha(540, 900, 430, t); ctx.restore();
    // tiger standard (the Chola emblem) on a pole, left
    ctx.save(); ctx.translate((0.5 - k) * -30, 0); line([[140, 1480], [140, 520]], P.goldDark, 12); fillP([[146, 540], [420, 560 + Math.sin(t * 3) * 8], [380, 650], [420, 730 - Math.sin(t * 3) * 8], [146, 740]], P.kumkum); A.tiger(260, 668, 0.78); ctx.restore();
    A.chowrie(130, 1090, 0.16, t); A.chowrie(950, 1090, -0.16, t + 1);
    K.lamp(190, 1500, 0.8, t); K.lamp(890, 1500, 0.8, t + 1.3);
    ctx.save(); ctx.translate((0.5 - k) * -14, 0); A.kingBust(540, 1500, 1.0, t); ctx.restore();
    A.parasol(540, 330, 0.9, t);
    K.glow(540, 760, 520, '255,210,140', 0.18);
    K.embers(t, 30, 6); K.vignette(0.55);
    // name + honest label
    const tn = Wd('rajaraja', 4) - t0, pp = clamp((lt - tn + 0.1) / 0.5);
    if (pp > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, pp * 1.5); ctx.translate(0, (1 - eo(pp)) * 24);
      ctx.fillStyle = 'rgba(21,11,6,0.7)'; rr(150, 110, 780, 190, 30); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 5; rr(150, 110, 780, 190, 30); ctx.stroke();
      K.tamil('ராஜராஜ சோழன்', 540, 185, 80, P.gold); K.label('RAJARAJA CHOLA I  ·  r. 985-1014', 540, 262, 32, P.cream); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = 0.9 * eio(clamp((lt - 0.6) / 0.6)); ctx.font = '700 28px Caladea'; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.fillStyle = P.cream; ctx.fillText("ARTIST'S IMPRESSION, NOT A LIKENESS", 540, 1530); ctx.restore();
  } });
  cue(t0, 'whoosh'); cue(t0 + 0.25, 'drum', { gain: 1 }); cue(Wd('rajaraja', 4), 'drum', { gain: 0.9 }); cue(Wd('crowned', 5), 'sparkle', { gain: 0.7 }); }

  // ───────── 4 · 22.95 to 34.7 s : the temple rises (three different views) ─────────
  { const t0 = 22.95, t1 = 25.4, t2 = 29.2, t3 = 34.7;
  // 4a: ground level, a granite block hauled on rollers under a low dawn sun
  add({ id: 'S04a', at: t0, cam: [540, 1000], zoom: 0.08, note: 'low wide: hauling a granite block, plinth rising in the haze', draw(lt, d, t) {
    const k = lt / d, tr = k - 0.5; K.sky(t, 760, 800);
    ctx.fillStyle = '#B9743C'; poly([[-300, 1080], [200, 1020], [600, 1060], [1400, 1000], [1400, 1200], [-300, 1200]]); ctx.fill();
    ctx.save(); ctx.translate(-tr * 40, 0); A.drawVimana('dusk', 360, 1130, 0.34, 0.9, 1.0); ctx.restore();
    A.haze(700, 1130, '#F3C77C', 0, 0.55);
    ctx.fillStyle = lg(0, 1100, 0, 1920, [[0, '#9A6234'], [1, '#4A2A12']]); ctx.fillRect(-300, 1100, W + 600, 1000);
    ctx.save(); ctx.translate(-tr * 140, 0); A.scaffold(160, 1180, 260, 380, 0.9); A.scaffold(930, 1180, 220, 300, 0.9); ctx.restore();
    // the block on log rollers, pulled by a rope team
    ctx.save(); ctx.translate(-tr * 90, 0);
    const bx = 560 + lt * 40;
    for (let i = 0; i < 5; i++) { const rx = bx - 20 + i * 90 - (lt * 80) % 90; ell(rx, 1390, 22, 12, '#4A2C14'); }
    A.granite(bx, 1380, 420, 190); ctx.restore();
    ctx.save(); ctx.translate(-tr * 90, 0);
    const roles = ['sailor', 'warrior', 'scribe', 'sailor', 'warrior', 'sailor']; line([[bx + 6, 1290], [bx - 470, 1262]], '#4A2C14', 7);
    roles.forEach((r, i) => K.figure({ x: bx - 90 - i * 90, y: 1425 + (i % 2) * 10, h: 330, dir: -1, role: r, arm: 78, bend: 12, walk: lt * 4 + i }));
    ctx.restore();
    ctx.save(); ctx.translate(-tr * 300, 0); A.granite(-120, 1900, 520, 330, 1, 0.1); A.granite(380, 1960, 400, 260, 1, 0.25); ctx.restore();
    A.dust(t, 40, 8, '255,214,150', 0.5); K.glow(760, 800, 600, '255,200,120', 0.25); K.vignette(0.55);
    const tn = Wd('three', 6) - t0 - 0.2; K.plaque('1003 CE', 540, 300, clamp((lt - tn) / 0.35) > 0 ? eob(clamp((lt - tn) / 0.35)) : 0, 84);
  } });
  cue(t0, 'whoosh'); cue(t0 + 0.4, 'rumble', { gain: 0.7, dur: 2.2 });
  // 4b: scaffolds and an earth ramp around the half-built tower
  add({ id: 'S04b', at: t1, cam: [540, 1100], zoom: 0.14, note: 'medium: tower half built, scaffold, ramp, carriers', draw(lt, d, t) {
    const k = lt / d; K.sky(t, 300, 640);
    ctx.fillStyle = '#B9743C'; poly([[-300, 1100], [300, 1040], [800, 1090], [1400, 1030], [1400, 1300], [-300, 1300]]); ctx.fill(); ctx.fillStyle = lg(0, 1180, 0, 1920, [[0, '#9A6234'], [1, '#5A3318']]); ctx.fillRect(-300, 1180, W + 600, 900);
    ctx.save(); ctx.translate(540, 1560 + (1 - eio(k)) * 120); ctx.scale(0.78, 0.78); A.vimana(A.GRAN, { tiers: 6.4 }); ctx.restore();
    ctx.save(); ctx.translate(0, (1 - eio(k)) * 120); A.scaffold(160, 1560, 160, 900, 0.95); A.scaffold(920, 1560, 160, 760, 0.95); ctx.restore();
    // the earth ramp climbing toward the tower, with carriers and a block on rollers
    ctx.save(); ctx.translate(0, (1 - eio(k)) * 120); fillP([[1400, 1560], [1400, 1010], [820, 1010], [330, 1560]], '#8A5A30'); line([[330, 1560], [820, 1010]], '#B98650', 8);
    for (let i = 0; i < 5; i++) { const u = (lt * 0.12 + i * 0.2) % 1, px = lerp(1260, 640 + 120, 1 - u) , py = lerp(1560, 1020, 1 - u) ; }
    for (let i = 0; i < 5; i++) { const u = (lt * 0.1 + i / 5) % 1, px = lerp(430, 790, u), py = lerp(1545, 1035, u); K.figure({ x: px, y: py, h: 190 - u * 40, dir: 1, role: ['sailor', 'warrior', 'scribe'][i % 3], arm: 50, bend: 30, walk: lt * 5 + i, hold: (hx, hy) => {} }); }
    ctx.restore();
    A.granite(60, 1760, 330, 170, 1, 0.1); A.granite(700, 1800, 360, 200, 1, 0.2);
    A.fog(1500, 200, 0.3, '246,190,110'); A.dust(t, 36, 3, '255,214,150', 0.5); K.glow(300, 640, 700, '255,210,130', 0.22); K.vignette(0.5);
    const tw = Wd('rajarajesvaram', 7) - t1, pp = clamp((lt - tw) / 0.5);
    if (pp > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, pp * 1.4); ctx.translate(0, (1 - eo(pp)) * 20); ctx.fillStyle = 'rgba(21,11,6,0.62)'; rr(140, 190, 800, 120, 28); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 5; rr(140, 190, 800, 120, 28); ctx.stroke(); ctx.font = '700 62px Caladea'; ctx.letterSpacing = '6px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.gold; ctx.fillText('RAJARAJESVARAM', 540, 254); ctx.letterSpacing = '0px'; ctx.restore(); }
  } });
  cue(t1, 'whoosh'); for (let i = 0; i < 6; i++) cue(t1 + 0.5 + i * 0.55, 'chisel', { gain: 0.6, pan: i % 2 ? 0.3 : -0.3 }); cue(Wd('rajarajesvaram', 7), 'pop');
  // 4c: seven years in time-lapse, tier by tier
  add({ id: 'S04c', at: t2, cam: [540, 1000], zoom: 0.04, note: 'time-lapse: tower grows tier by tier, years 1003 to 1010', draw(lt, d, t) {
    const k = clamp(lt / (d - 0.8)), e = eio(k), year = 1003 + Math.min(7, Math.floor(k * 7.999));
    K.sky(lt * 7, 780 - 560 * e + 300 * (1 - e) * 0, 520 + 80 * Math.sin(k * 9));
    ctx.fillStyle = '#B9743C'; poly([[-300, 1120], [200, 1060], [600, 1100], [1400, 1040], [1400, 1300], [-300, 1300]]); ctx.fill(); ctx.fillStyle = lg(0, 1150, 0, 1920, [[0, '#9A6234'], [1, '#5A3318']]); ctx.fillRect(-300, 1150, W + 600, 900);
    const s = 0.88, base = 1790;
    ctx.save(); ctx.translate(540, base); ctx.scale(s, s); A.vimana(A.GRAN, { tiers: k >= 1 ? 13 : 13 * e * 0.999 }); ctx.restore();
    if (k < 1) A.scaffold(540 - 380, base, 120, 120 + e * 1500 * s, 0.9), A.scaffold(540 + 380, base, 120, 120 + e * 1500 * s, 0.9);
    A.fog(1790, 160, 0.4, '246,190,110'); K.glow(540, 700, 800, '255,210,130', 0.14 + 0.2 * (k >= 1 ? seg(lt, d - 0.8, d) : 0));
    if (k >= 1) { const f = seg(lt, d - 0.8, d - 0.2); K.godrays(t, 0.28 * f, 6, '255,205,120'); }
    A.dust(t, 30, 9, '255,214,150', 0.45); K.vignette(0.5);
    K.plaque(`${year} CE`, 540, 280, eob(clamp(((lt % (d / 8)) + 0.3) / 0.3)) * 0 + 1, 84);
  } });
  cue(t2, 'whoosh'); for (let i = 0; i < 7; i++) cue(t2 + 0.2 + (i / 7) * (t3 - t2 - 0.8), 'thud', { gain: 0.5 }); cue(t3 - 0.9, 'sparkle', { gain: 0.8 }); }
  // ═════════ shared little helpers for shots 5 to 10 ═════════
  const sil = (x, y, h, col = '#0A0503', a = 1, bob = 0) => { ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y - Math.abs(Math.sin(bob)) * h * 0.04); const s = h / 100; ctx.scale(s, s); ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-10, -54); ctx.quadraticCurveTo(0, -62, 10, -54); ctx.lineTo(15, 0); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, -68, 9.5, 0, TAU); ctx.fill(); ctx.restore(); };
  const copperPot = (x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const g = lg(-120, 0, 120, 0, [[0, '#6A3016'], [0.35, '#D98A52'], [0.62, '#B8663A'], [1, '#5E2A12']]);
    ctx.beginPath(); ctx.moveTo(-40, -170); ctx.bezierCurveTo(-150, -150, -150, -10, -70, 0); ctx.lineTo(70, 0); ctx.bezierCurveTo(150, -10, 150, -150, 40, -170); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    rr(-46, -206, 92, 40, 10); ctx.fillStyle = g; ctx.fill(); rr(-62, -224, 124, 22, 8); ctx.fillStyle = '#E7A468'; ctx.fill();
    for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.ellipse(i * 26, -112, 12, 28, i * 0.08, 0, TAU); ctx.fillStyle = 'rgba(255,214,160,0.32)'; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(-14, -224); ctx.lineTo(0, -300); ctx.lineTo(14, -224); ctx.closePath(); ctx.fillStyle = '#E7A468'; ctx.fill(); circle(0, -306, 9, '#F6C894'); ctx.restore(); };
  const lampField = (t, y0, y1, a = 1) => { for (let r = 0; r < 7; r++) { const u = r / 6, y = lerp(y0, y1, Math.pow(u, 1.5)), sc = lerp(0.1, 0.36, u), n = 9 + r * 3, span = lerp(560, 1500, u);
    for (let i = 0; i < n; i++) { const x = 540 + (i / (n - 1) - 0.5) * span; ctx.save(); ctx.globalAlpha *= a; K.glow(x, y - 16 * sc * 3, 120 * sc * 3, '255,160,50', 0.42); ell(x, y, 34 * sc * 3, 9 * sc * 3, '#8A5A1E'); K.flame(x, y - 8 * sc * 3, sc * 1.1, t + r, i * 3 + r); ctx.restore(); } } };
  const banner = (x, y, h, col, t, ph) => { line([[x, y], [x, y - h]], P.goldDark, 10); const w = 170, top = y - h; ctx.beginPath(); ctx.moveTo(x, top);
    for (let i = 0; i <= 8; i++) ctx.lineTo(x + (i / 8) * w, top + Math.sin(t * 5 + ph + i * 0.8) * 10 * (i / 8) + (i / 8) * 20); for (let i = 8; i >= 0; i--) ctx.lineTo(x + (i / 8) * w, top + 150 + Math.sin(t * 5 + ph + i * 0.8) * 10 * (i / 8) - (i / 8) * 40); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); circle(x, top - 8, 12, P.gold); };
  const nightSky = (top = '#080402', mid = '#1E0F07', bot = '#3A1D0C') => { ctx.fillStyle = lg(0, -300, 0, 2000, [[0, top], [0.6, mid], [1, bot]]); ctx.fillRect(-300, -300, W + 600, 2400); };
  const dip = (lt, dur = 0.4, col = '14,6,3') => { const a = 1 - clamp(lt / dur); if (a > 0) A.veil(a * 0.85, col); };
  const tierTop = (i) => { let y = 438; for (let j = 0; j <= i; j++) y += (62 - j) + 12; return y; };
  const plate = (x, y, w, h, a = 1) => { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(21,11,6,0.72)'; rr(x, y, w, h, 30); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 5; rr(x, y, w, h, 30); ctx.stroke(); ctx.restore(); };
  const sm = (s) => { ctx.font = '700 28px Caladea'; ctx.letterSpacing = '4px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.cream; ctx.fillText(s, 540, 1530); ctx.letterSpacing = '0px'; };

  // ───────── 5 · 34.7 to 42.4 s : the vimana (a climb up the tower, then the capstone) ─────────
  { const t0 = 34.7, t1 = 37.7, t2 = 42.4;
  add({ id: 'S05a', at: t0, cam: [540, 960], zoom: 0.03, note: 'tilt up the 13 tiers with a live tier counter; people at the foot for scale', draw(lt, d, t) {
    const k = eio(clamp(lt / d)), s = 0.95, by = lerp(1720, 2200, k);
    ctx.fillStyle = lg(0, -300, 0, 2000, [[0, '#26110A'], [0.5, '#7A3E1C'], [1, '#E7A055']]); ctx.fillRect(-300, -300, W + 600, 2400);
    K.glow(540, by - 1300 * s, 900, '255,190,100', 0.45); A.stars(t, 40, 0.5, 700, 5);
    ctx.fillStyle = '#2A1608'; ctx.fillRect(-300, by, W + 600, 900);
    A.drawVimana('stone', 540, by, s, 1, 1.5); A.fog(by - 30, 260, 0.5, '246,190,110');
    for (let i = 0; i < 5; i++) sil(380 + i * 70 + (i % 2) * 20, by + 70, 62 - i * 3, '#0A0503');
    for (let i = 0; i < 6; i++) { const a = t * 0.5 + i * 1.05, bx = 540 + Math.cos(a) * 340, byy = by - 1480 * s + Math.sin(a * 1.3) * 120, fl = Math.sin(t * 8 + i) * 8; ctx.strokeStyle = '#2A1408'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx - 18, byy - fl); ctx.quadraticCurveTo(bx - 6, byy - 6, bx, byy); ctx.quadraticCurveTo(bx + 6, byy - 6, bx + 18, byy - fl); ctx.stroke(); }
    A.palm(-20, 1950 + k * 1500, 900, 0.18, 3, '#080302', t); A.palm(1100, 2000 + k * 1600, 1000, -0.16, 8, '#080302', t);
    A.dust(t, 30, 3, '255,214,150', 0.4); K.vignette(0.55);
    let cnt = 0; for (let i = 0; i < 13; i++) if (by - tierTop(i) * s < 1000) cnt = i + 1;
    const pa = eio(clamp((lt - 0.25) / 0.5)); const pulse = 1 + 0.12 * Math.max(0, 1 - ((lt * 2.2) % 1) * 4) * (cnt > 0 && cnt < 13 ? 1 : 0);
    ctx.save(); ctx.globalAlpha = pa; plate(300, 120, 480, 190); ctx.translate(540, 200); ctx.scale(pulse, pulse);
    ctx.font = '700 118px Caladea'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.gold; ctx.fillText(String(cnt), -60, 0); ctx.font = '700 40px Caladea'; ctx.fillStyle = P.cream; ctx.textAlign = 'left'; ctx.fillText('OF 13', 10, -16); ctx.fillText('TIERS', 10, 30); ctx.restore();
  } });
  cue(t0, 'whoosh', { gain: 0.8 }); cue(t0 + 0.2, 'rumble', { gain: 0.8, dur: 3.0 }); cue(Wd('thirteen', 9), 'pop', { gain: 0.8 });
  add({ id: 'S05b', at: t1, cam: [540, 760], zoom: 0.05, note: 'extreme close, tilt up to the capstone, cupola and finial against a god-ray sky', draw(lt, d, t) {
    const k = eio(clamp(lt / d)), s = 2.2, by = lerp(4060, 4310, k);
    ctx.fillStyle = lg(0, -300, 0, 2000, [[0, '#120805'], [0.45, '#5A2C14'], [1, '#C07A38']]); ctx.fillRect(-300, -300, W + 600, 2400);
    K.glow(540, by - 3400, 1000, '255,190,100', 0.4); A.stars(t, 30, 0.35, 500, 9);
    ctx.save(); ctx.translate(540, by); ctx.scale(s, s); A.vimana(A.GRAN, {}); ctx.restore();
    K.glow(540, by - 1696 * s + 130, 340, '255,214,120', 0.55 + 0.1 * Math.sin(t * 3)); K.godrays(t, 0.2, 5, '255,205,120');
    for (let i = 0; i < 5; i++) { const a = t * 0.6 + i * 1.3, bx = 540 + Math.cos(a) * 430, byy = by - 3700 + Math.sin(a * 1.2) * 90 + 120, fl = Math.sin(t * 8 + i) * 8; ctx.strokeStyle = '#1A0C05'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx - 18, byy - fl); ctx.quadraticCurveTo(bx - 6, byy - 6, bx, byy); ctx.quadraticCurveTo(bx + 6, byy - 6, bx + 18, byy - fl); ctx.stroke(); }
    A.dust(t, 36, 5, '255,214,150', 0.5); K.vignette(0.55);
    const tc = Wd('capstone', 10) - t1, p1 = clamp((lt - tc) / 0.4), te = Wd('eighty', 10) - t1, p2 = clamp((lt - te) / 0.4);
    if (p1 > 0) { ctx.save(); ctx.translate(0, (1 - eo(p1)) * 22); plate(110, 40, 860, 200, Math.min(1, p1 * 1.4)); ctx.globalAlpha = Math.min(1, p1 * 1.4); K.label('THE CAPSTONE', 540, 110, 62, P.gold);
      ctx.globalAlpha = Math.min(1, p2 * 1.4); K.label('TRADITIONALLY SAID TO WEIGH ~80 TONS', 540, 185, 33, P.cream); ctx.restore(); }
  } });
  cue(t1, 'whoosh'); cue(Wd('capstone', 10), 'pop', { gain: 0.7 }); cue(Wd('eighty', 10), 'thud', { gain: 0.9 }); cue(Wd('eighty', 10) + 0.2, 'sparkle', { gain: 0.8 }); }

  // ───────── 6 · 42.4 to 49.85 s : the consecration, lamps in the dark ─────────
  { const t2 = 42.4, t3 = 46.4;
  add({ id: 'S06a', at: t2, cam: [540, 1000], zoom: 0.1, note: 'close: the copper finial pot between two lamps, pillars, smoke', draw(lt, d, t) {
    const k = lt / d, tr = k - 0.5; nightSky();
    ctx.save(); ctx.translate(-tr * 70, 0); K.glow(540, 1000, 900, '255,150,50', 0.35); [60, 300, 780, 1020].forEach((x, i) => K.pillar(x, 1560, 1200, K.STONE.warm)); ctx.restore();
    ctx.fillStyle = lg(0, 1480, 0, 1920, [[0, '#5A3318'], [1, '#1E0F07']]); ctx.fillRect(-300, 1480, W + 600, 600);
    A.smoke(540, 1380, t, 8, '235,205,160', 0.14, 70, 700);
    K.glow(540, 1050, 640, '255,170,70', 0.5 + 0.06 * Math.sin(t * 7)); A.granite(330, 1480, 420, 180, 1, 0);
    copperPot(540, 1330, 2.1);
    K.lamp(160, 1520, 1.0, t, 1); K.lamp(920, 1520, 1.0, t + 1.1, 1);
    A.smoke(160, 1330, t, 5, '235,205,160', 0.1, 50, 520); A.smoke(920, 1330, t + 2, 5, '235,205,160', 0.1, 50, 520);
    K.embers(t, 30, 11); A.dust(t, 28, 6, '255,200,120', 0.4); K.vignette(0.6); dip(lt, 0.5);
    const tn = Wd('ten', 11) - t2 - 0.1; K.plaque('c. 1010 CE', 540, 220, clamp((lt - tn) / 0.35) > 0 ? eob(clamp((lt - tn) / 0.35)) : 0, 78);
  } });
  cue(t2, 'bell', { gain: 0.8 }); cue(Wd('ten', 11), 'pop', { gain: 0.7 }); cue(Wd('copper', 11), 'sparkle', { gain: 0.8 });
  add({ id: 'S06b', at: t3, cam: [540, 1000], zoom: 0.0, note: 'wide pull-out: the lit tower over a courtyard of hundreds of lamps', draw(lt, d, t) {
    const k = eio(clamp(lt / d)), s = lerp(0.82, 0.58, k), by = lerp(1480, 1300, k);
    nightSky('#06030A', '#1A0C12', '#4A2410'); A.stars(t, 110, 1, 900, 2); K.glow(540, by - 800 * s, 1100, '255,150,60', 0.3 + 0.2 * k);
    ctx.fillStyle = lg(0, by, 0, 1920, [[0, '#4A2A14'], [1, '#120904']]); ctx.fillRect(-300, by, W + 600, 900);
    A.drawVimana('lit', 540, by, s, 1, 1.5); K.glow(540, by - 300 * s, 700 * s + 200, '255,170,60', 0.4);
    A.fog(by - 10, 220, 0.4, '255,170,70'); lampField(t, by + 60, 1760, 0.95);
    sil(300, by + 240, 90, '#070302'); sil(340, by + 245, 84, '#070302'); sil(780, by + 250, 96, '#070302'); sil(830, by + 240, 88, '#070302');
    A.smoke(540, by + 100, t, 6, '235,205,160', 0.09, 160, 900); K.embers(t, 40, 3); K.vignette(0.55);
  } });
  cue(t3 - 0.05, 'whoosh', { gain: 0.6 }); cue(Wd('ready', 12), 'bell', { gain: 1 }); }

  // ───────── 7 · 49.85 to ~60.7 s : the evidence, the walls remember ─────────
  { const t4 = L(13) - 0.05, t5 = Wd('gifts', 14) - 0.2, t6 = L(15) - 0.05;
  let bandY = 0; for (let r = 0; r < 4; r++) bandY += 190 + rnd(r * 3) * 70;
  add({ id: 'S07a', at: t4, cam: [540, 900], zoom: 0.0, note: 'macro track along a granite wall in raking lamplight; stylised marks, labelled', draw(lt, d, t) {
    const k = clamp(lt / d), sc = lerp(1.05, 1.5, eio(k)), px = lerp(-300, -1050, eio(k)), py = 760 - (bandY + 180) * sc;
    ctx.fillStyle = '#120904'; ctx.fillRect(-300, -300, W + 600, 2400);
    ctx.save(); ctx.translate(px, py); ctx.scale(sc, sc); ctx.drawImage(A.wallImg(), 0, 0); ctx.restore();
    const lx = lerp(260, 900, eio(k)); A.veil(0.62, '10,4,0'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; K.glow(lx, 760, 760, '255,170,70', 0.5); ctx.restore();
    K.glow(lx, 760, 420, '255,190,100', 0.22); A.dust(t, 40, 12, '255,214,150', 0.5); K.vignette(0.7); dip(lt, 0.45);
    const pa = eio(clamp((lt - 0.7) / 0.5)); ctx.save(); ctx.globalAlpha = pa; ctx.translate(0, (1 - pa) * 20); plate(190, 150, 700, 150); K.label('TAMIL INSCRIPTIONS', 540, 205, 54, P.gold); K.label('BRIHADISVARA TEMPLE, THANJAVUR', 540, 262, 28, P.cream); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.9 * pa; sm('STYLISED MARKS  ·  NOT A REAL INSCRIPTION'); ctx.restore();
  } });
  cue(t4, 'whoosh'); cue(t4 + 0.4, 'chisel', { gain: 0.8 }); cue(t4 + 1.0, 'chisel', { gain: 0.6, pan: 0.3 }); cue(Wd('inscriptions', 14), 'pop');
  add({ id: 'S07b', at: t5, cam: [540, 860], zoom: 0.07, note: 'the record: gold, ornaments, land; donors appear', draw(lt, d, t) {
    ctx.fillStyle = '#120904'; ctx.fillRect(-300, -300, W + 600, 2400); ctx.save(); ctx.translate(-600, -250); ctx.drawImage(A.wallImg(), 0, 0); ctx.restore(); A.veil(0.55, '10,4,0');
    ctx.fillStyle = lg(0, 300, 0, 1420, [[0, '#8C7A62'], [1, '#6B5A44']]); rr(100, 300, 880, 1130, 30); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 8; rr(112, 312, 856, 1106, 24); ctx.stroke(); ctx.strokeStyle = 'rgba(40,22,8,0.5)'; ctx.lineWidth = 3; rr(136, 336, 808, 1058, 18); ctx.stroke();
    K.glow(540, 860, 760, '255,170,70', 0.2);
    const pop = (w, fn) => { const p = clamp((lt - (Wd(w, 14) - t5)) / 0.4); if (p > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, p * 1.5); fn(eob(p)); ctx.restore(); } };
    pop('gold', (e) => { ctx.save(); ctx.translate(330, 580); ctx.scale(e, e); K.treasure(0, 40, 0.6); ctx.restore(); K.label('GOLD', 700, 570, 60, P.gold); });
    pop('ornaments', (e) => { ctx.save(); ctx.translate(330, 830); ctx.scale(e, e); for (let i = 0; i <= 14; i++) { const a = Math.PI * (0.1 + 0.8 * i / 14); circle(Math.cos(a) * 120, Math.sin(a) * 100 - 40, i % 4 === 2 ? 11 : 7, i % 4 === 2 ? P.kumkum : P.gold); } circle(0, 76, 18, P.kumkum); circle(0, 76, 9, P.gold); ctx.restore(); K.label('ORNAMENTS', 700, 840, 52, P.gold); });
    pop('land', (e) => { ctx.save(); ctx.translate(330, 1100); ctx.scale(e, e); A.fillP([[-170, 50], [150, 50], [190, -60], [-130, -60]], '#7E8A34'); for (let i = 0; i < 6; i++) line([[-160 + i * 6 + i * 4, 44 - i * 18], [140 + i * 8, 44 - i * 18]], '#C9B45A', 4); ctx.restore(); K.label('LAND', 700, 1090, 60, P.gold); });
    [['king', 'THE KING', null, 280], ['sister', 'HIS SISTER', 'KUNDAVAI', 540], ['queens', 'HIS QUEENS', null, 800]].forEach(([w, a, b, x]) => { const p = clamp((lt - (Wd(w, 14) - t5)) / 0.4); if (p > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, p * 1.5); ctx.translate(x, 1300 + (1 - eo(p)) * 20); ctx.fillStyle = 'rgba(21,11,6,0.7)'; rr(-118, -52, 236, 104, 22); ctx.fill(); ctx.strokeStyle = P.gold; ctx.lineWidth = 3; rr(-118, -52, 236, 104, 22); ctx.stroke(); K.label(a, 0, b ? -16 : 0, 34, P.cream); if (b) K.label(b, 0, 24, 36, P.gold); ctx.restore(); } });
    A.dust(t, 24, 14, '255,214,150', 0.4); K.vignette(0.6); sm('ILLUSTRATION OF THE RECORDED GIFTS');
  } });
  for (const w of ['gold', 'ornaments', 'land']) cue(Wd(w, 14), 'pop', { gain: 0.7 }); cue(Wd('gold', 14), 'sparkle', { gain: 0.8 }); for (const w of ['king', 'sister', 'queens']) cue(Wd(w, 14), 'tock', { gain: 1 });

  // ───────── 8 · 60.7 to 71.95 s : the people behind the temple ─────────
  add({ id: 'S08a', at: t6, cam: [540, 1000], zoom: 0.09, note: 'a temple street at dusk: houses, women dancers, the tower at its end; 400 and 108 count up', draw(lt, d, t) {
    const k = lt / d, tr = k - 0.5; K.sky(t, 540, 700);
    ctx.save(); ctx.translate(-tr * 20, 0); A.drawVimana('dusk', 540, 1000, 0.3, 1, 1.0); A.haze(700, 1000, '#F3C77C', 0, 0.6); ctx.restore();
    ctx.fillStyle = lg(0, 980, 0, 1920, [[0, '#C0884E'], [1, '#6A3E1C']]); ctx.fillRect(-300, 980, W + 600, 1000);
    ctx.save(); ctx.translate(-tr * 60, 0); for (let i = 0; i < 4; i++) { A.village(-120 + i * 70, 1040 + i * 70, 1.3 + i * 0.4, i + 2, '#4A2E1A', '#35200F', 0.6); A.village(640 - i * 40, 1040 + i * 70, 1.3 + i * 0.4, i + 12, '#43291A', '#2F1B0D', 0.6); } ctx.restore();
    A.fog(1050, 140, 0.4, '246,190,110');
    for (let i = 0; i < 6; i++) { const y = 1300 + i * 70, h = 300 + i * 52, x = i % 2 ? 640 + i * 40 : 260 - i * 30; A.dancer(x + Math.sin(t * 1.2 + i) * 10, y, h, t, i % 2 ? -1 : 1, i); }
    A.dust(t, 34, 16, '255,214,150', 0.45); K.vignette(0.5);
    const pw = clamp((lt - (Wd('women', 15) - t6 - 0.5)) / 0.4), pm = clamp((lt - (Wd('men', 15) - t6 - 0.5)) / 0.4);
    const cw = Math.round(400 * eo(clamp((lt - (Wd('four', 15) - t6)) / 1.0))), cm = Math.round(108 * eo(clamp((lt - (Wd('eight', 15) - t6)) / 0.8)));
    if (lt > Wd('four', 15) - t6 - 0.1) { ctx.save(); ctx.globalAlpha = Math.min(1, (lt - (Wd('four', 15) - t6 - 0.1)) * 3); plate(130, 110, 820, 190); K.label('IN ONE RECORD', 540, 150, 28, P.cream);
      ctx.font = '700 96px Caladea'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = P.gold; ctx.fillText(String(cw), 330, 228); ctx.fillText(lt > Wd('eight', 15) - t6 - 0.2 ? String(cm) : '', 760, 228);
      ctx.font = '700 32px Caladea'; ctx.fillStyle = P.cream; ctx.letterSpacing = '4px'; ctx.fillText('WOMEN', 330, 282); if (pm > 0) ctx.fillText('MEN', 760, 282); ctx.letterSpacing = '0px'; ctx.restore(); }
  } });
  cue(t6, 'whoosh'); cue(Wd('four', 15), 'pop'); cue(Wd('eight', 15), 'pop'); cue(t6 + 0.3, 'drum', { gain: 0.5 });
  { const tS = L(16) - 0.05, keys = [['dancers', 0], ['drummers', 1], ['accountants', 2], ['lamp', 3], ['harvest', 4]], names = ['DANCERS', 'DRUMMERS', 'ACCOUNTANTS', 'LAMP-LIGHTERS', 'A SHARE OF THE HARVEST'];
  add({ id: 'S08b', at: tS, cam: [540, 1000], zoom: 0.0, note: 'tracking shot along a hall: dancer, drummers, accountant, lamp-lighter, harvest', draw(lt, d, t) {
    let idx = 0; for (let i = 1; i < keys.length; i++) idx += eio(seg(t, Wd(keys[i][0], 16) - 0.6, Wd(keys[i][0], 16) - 0.05));
    nightSky('#120A06', '#2A160A', '#5A3318'); const cam = idx * 1080;
    ctx.save(); ctx.translate(-cam * 0.45 + 200, 0); for (let i = -1; i < 9; i++) K.pillar(i * 360, 1500, 1300, K.STONE.warm); ctx.restore();
    K.glow(540, 800, 900, '255,160,60', 0.3);
    ctx.fillStyle = lg(0, 1440, 0, 1920, [[0, '#6A3E1C'], [1, '#2A1608']]); ctx.fillRect(-300, 1440, W + 600, 600);
    ctx.save(); ctx.translate(-cam, 0);
    A.dancer(540, 1470, 760, t, 1, 0);
    [[1080 + 330, 1], [1080 + 750, -1]].forEach(([x, dr], i) => { K.figure({ x, y: 1480, h: 620, dir: dr, role: i ? 'warrior' : 'sailor', arm: 40, bend: 20, walk: t * 2 + i }); A.drum(x + dr * 70, 1250, 1.1, 0.3 * dr + Math.sin(t * 8 + i * 3) * 0.05); });
    K.figure({ x: 2160 + 400, y: 1480, h: 640, dir: -1, role: 'scribe', arm: 70, bend: 20 }); K.leaf(2160 + 560, 1130, 400, 200, -0.1, { lines: 6, seed: 3, tie: true, warm: true }); K.leaf(2160 + 210, 1180, 300, 160, 0.12, { lines: 5, seed: 8, warm: true });
    K.figure({ x: 3240 + 380, y: 1480, h: 640, dir: 1, role: 'priest', arm: 120, bend: 15 }); K.lamp(3240 + 640, 1480, 1.0, t, 1); K.lamp(3240 + 140, 1480, 0.8, t + 1, 1);
    for (let i = 0; i < 9; i++) { const x = 4320 + 240 + (i % 3) * 190 - 100, y = 1480 - Math.floor(i / 3) * 70; ell(x, y, 80, 26, '#6A3E1C'); for (let j = -3; j <= 3; j++) line([[x + j * 10, y - 6], [x + j * 16, y - 120 - (j % 2) * 20]], '#E8C25A', 5); ell(x, y - 60, 86, 40, '#D6A93E'); }
    ctx.restore();
    A.smoke(540, 1000, t, 4, '235,205,160', 0.07, 100, 600); A.dust(t, 36, 21, '255,214,150', 0.45); K.vignette(0.6);
    for (let i = 0; i < 5; i++) { const p = 1 - Math.min(1, Math.abs(idx - i) * 1.6); if (p > 0.02) { ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - p) * 14); plate(120, 110, 840, 120); K.label(names[i], 540, 170, i === 4 ? 44 : 56, P.gold); ctx.restore(); } }
  } });
  for (const [w] of keys) cue(Wd(w, 16), w === 'drummers' ? 'drum' : 'tock', { gain: 0.9 }); cue(Wd('drummers', 16) + 0.25, 'drum', { gain: 0.8 }); cue(Wd('harvest', 16), 'sparkle', { gain: 0.6 }); }

  }

  // ───────── 9 · 71.95 to 80.5 s : centuries pass, the living temple ─────────
  { const t7 = L(17) - 0.05, t8 = L(18) - 0.05, t9 = L(19) - 0.05;
  add({ id: 'S09a', at: t7, cam: [540, 1000], zoom: 0.03, note: 'time-lapse: suns and moons sweep over the unchanged tower; banners rise and fall', draw(lt, d, t) {
    const ph = lt / d * TAU * 1.6 + 0.9, f = clamp(0.5 + 0.7 * Math.sin(ph), 0, 1);
    ctx.fillStyle = lg(0, -300, 0, 1100, [[0, mixc('#06030A', '#E9B76A', f)], [1, mixc('#2A1A22', '#F6DDA0', f)]]); ctx.fillRect(-300, -300, W + 600, 1500);
    A.stars(t, 90, 1 - f, 900, 4);
    const orb = (a, isSun) => { const ox = 540 - Math.cos(a) * 520, oy = 1000 - Math.sin(a) * 760; if (oy > 1010) return; if (isSun) { K.glow(ox, oy, 520, '255,226,160', 0.6); circle(ox, oy, 80, '#FFF0BE'); } else { K.glow(ox, oy, 360, '200,210,240', 0.35); circle(ox, oy, 56, '#EDE6D2'); } };
    orb(ph, true); orb(ph + Math.PI, false);
    ctx.fillStyle = mixc('#1A0E08', '#A8783E', f); ctx.fillRect(-300, 1280, W + 600, 700);
    A.drawVimana('stone', 540, 1340, 0.74, 1, 1.5); A.fog(1330, 160, 0.3, '246,190,110'); A.veil((1 - f) * 0.5, '6,4,24');
    for (let i = 0; i < 5; i++) { const up = eo(seg(lt, 0.05 + 0.18 * i, 0.55 + 0.18 * i)), dn = eio(seg(lt, 1.05 + 0.15 * i, 1.6 + 0.15 * i)); if (up <= 0 || dn >= 1) continue;
      ctx.save(); ctx.globalAlpha = 1 - dn; ctx.translate(120 + i * 210, 1780); ctx.rotate(dn * (i % 2 ? 1.2 : -1.2)); banner(0, 0, 560 * up, ['#B3262B', '#1C6B78', '#C9985A', '#3A3F7A', '#5C7A2E'][i], t, i); ctx.restore(); }
    A.dust(t, 24, 8, '255,214,150', 0.3); K.vignette(0.5); dip(lt, 0.3);
  } });
  cue(t7, 'whoosh', { gain: 0.9 }); cue(t7 + 0.3, 'rumble', { gain: 0.7, dur: 2.0 });
  add({ id: 'S09b', at: t8, cam: [540, 1000], zoom: 0.05, note: 'dawn: people of today walk toward the lit gateway, the tower above them', draw(lt, d, t) {
    const k = lt / d; ctx.fillStyle = lg(0, -300, 0, 1500, [[0, '#6E5878'], [0.45, '#E8A27A'], [1, '#FBE0A6']]); ctx.fillRect(-300, -300, W + 600, 1900);
    K.glow(540, 900, 900, '255,226,160', 0.55); A.stars(t, 40, 0.3, 400, 3);
    A.drawVimana('stone', 540, 1010, 0.56 + 0.04 * k, 1, 1.5); A.fog(1000, 220, 0.5, '255,214,150');
    ctx.fillStyle = lg(0, 1010, 0, 1920, [[0, '#B88650'], [1, '#4A2A12']]); ctx.fillRect(-300, 1010, W + 600, 1000);
    for (let i = 0; i < 18; i++) { const sp = 22 + rnd(i) * 20, x = ((i * 137 + lt * sp) % 1500) - 200, y = 1180 + (i % 6) * 70, h = 110 + (i % 6) * 44; sil(x, y, h, '#1C0E06', 1, t * 3 + i); if (i % 3 === 0) K.glow(x + h * 0.14, y - h * 0.5, 40, '255,170,60', 0.6); }
    for (let i = 0; i < 6; i++) { const bx = ((lt * 70 + i * 260) % 1500) - 200, by = 420 + (i % 3) * 80, fl = Math.sin(t * 8 + i) * 8; ctx.strokeStyle = '#3A2010'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx - 20, by - fl); ctx.quadraticCurveTo(bx - 7, by - 6, bx, by); ctx.quadraticCurveTo(bx + 7, by - 6, bx + 20, by - fl); ctx.stroke(); }
    A.palm(-30, 1900, 900, 0.18, 14, '#1A0E06', t); A.palm(1110, 1950, 980, -0.16, 21, '#1A0E06', t); A.dust(t, 30, 17, '255,236,190', 0.45); K.vignette(0.45);
    const pa = eio(clamp((lt - (Wd('living', 18) - t8 - 0.2)) / 0.5)); if (pa > 0) { ctx.save(); ctx.globalAlpha = pa; ctx.translate(0, (1 - pa) * 20); plate(190, 130, 700, 140); K.label('STILL A PLACE OF WORSHIP', 540, 200, 40, P.gold); ctx.restore(); }
  } });
  cue(t8, 'bell', { gain: 0.9 }); cue(Wd('today', 18), 'sparkle', { gain: 0.6 });
  add({ id: 'S09c', at: t9, cam: [540, 960], zoom: 0.06, note: 'blue hour: the lit tower, UNESCO World Heritage text plate', draw(lt, d, t) {
    const k = lt / d; nightSky('#0C0A24', '#3A2048', '#C8683A'); A.stars(t, 120, 0.9, 900, 6); K.glow(540, 700, 1000, '255,150,70', 0.4);
    ctx.save(); ctx.translate(540, lerp(3230, 2980, eio(k))); ctx.scale(1.7, 1.7); A.vimana(A.GRAN, { lit: 1 }); ctx.restore(); A.fog(1500, 300, 0.4, '255,170,70');
    A.smoke(540, 1430, t, 5, '235,205,160', 0.08, 140, 800); K.embers(t, 30, 9); K.vignette(0.5);
    const pa = eio(clamp((lt - (Wd('unesco', 19) - t9)) / 0.5)); if (pa > 0) { ctx.save(); ctx.globalAlpha = pa; ctx.translate(0, (1 - pa) * 22); plate(150, 120, 780, 200); K.label('UNESCO', 540, 175, 76, P.gold); K.label('WORLD HERITAGE SITE  ·  1987', 540, 268, 34, P.cream); ctx.restore(); }
  } });
  cue(t9, 'whoosh', { gain: 0.6 }); cue(Wd('unesco', 19), 'bell', { gain: 1 }); }

  // ───────── 10 · 80.45 to 89.78 s : the last image and the closing prompt ─────────
  { const t10 = L(20) - 0.1, t11 = L(22) - 0.12;
  add({ id: 'S10a', at: t10, cam: [540, 1000], zoom: 0.04, note: 'low angle at last light: a lamp in the foreground, a person small at the foot, slow tilt up', draw(lt, d, t) {
    const k = eio(clamp(lt / d)), by = lerp(1400, 1900, k), s = 1.0;
    ctx.fillStyle = lg(0, -300, 0, 2000, [[0, '#120A24'], [0.4, '#7A3A3A'], [1, '#F0A455']]); ctx.fillRect(-300, -300, W + 600, 2400); A.stars(t, 90, 0.5 + 0.5 * k, 800, 8); K.glow(540, by - 900, 1000, '255,180,90', 0.4);
    ctx.fillStyle = '#1A0E06'; ctx.fillRect(-300, by, W + 600, 900);
    A.drawVimana('stone', 540, by, s, 1, 1.5); A.fog(by - 20, 260, 0.5, '246,190,110'); sil(560, by + 70, 66); sil(620, by + 76, 60);
    K.godrays(t, 0.14, 5, '255,205,120'); K.embers(t, 40, 5);
    ctx.save(); ctx.globalAlpha = 0.55; A.fog(1500, 400, 0.55, '10,4,2'); ctx.restore();
    K.lamp(190, 1520 + k * 30, 1.2, t, 1); K.glow(190, 1250, 420, '255,170,60', 0.35); A.smoke(190, 1300, t, 5, '235,205,160', 0.08, 50, 500); K.vignette(0.65);
  } });
  cue(t10, 'swell', { gain: 1, dur: 4 }); cue(Wd('stone', 20), 'bell', { gain: 0.9 }); cue(Wd('still', 21), 'bell', { gain: 1, pan: 0.2 });
  add({ id: 'S10b', at: t11, cam: [540, 900], zoom: 0.03, note: 'end card: wheel emblem, AAZHI wordmark, episode label', draw(lt, d, t) {
    nightSky('#070304', '#150A05', '#2A1608'); K.glow(540, 800, 800, '255,170,60', 0.35); K.embers(t, 36, 4);
    const pa = eio(clamp(lt / 0.8)); ctx.save(); ctx.globalAlpha = pa; ctx.translate(540, 760); ctx.rotate(t * 0.12);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(0, 0, 230, 0, TAU); ctx.stroke(); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 196, 0, TAU); ctx.stroke();
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; line([[Math.cos(a) * 60, Math.sin(a) * 60], [Math.cos(a) * 190, Math.sin(a) * 190]], P.gold, i % 2 ? 5 : 9); circle(Math.cos(a) * 230, Math.sin(a) * 230, 10, P.goldDark); }
    circle(0, 0, 56, P.gold); circle(0, 0, 30, '#150A05'); ctx.restore();
    ctx.save(); ctx.globalAlpha = pa; K.tamil('ஆழி', 540, 1130, 110, P.gold); ctx.font = '700 120px Caladea'; ctx.letterSpacing = '22px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.cream; ctx.fillText('AAZHI', 550, 1270); ctx.letterSpacing = '0px'; ctx.restore();
    ctx.save(); ctx.globalAlpha = pa * 0.9; K.label('EPISODE 1  ·  THE KING WHO BUILT A MOUNTAIN IN STONE', 540, 1400, 25, P.goldDark === undefined ? P.gold : P.gold); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.8 * pa; sm('ALL PEOPLE AND SCENES ARE ILLUSTRATIONS'); ctx.restore(); K.vignette(0.55);
  } });
  cue(t11, 'sparkle', { gain: 0.9 }); cue(Wd('aazhi', 22), 'pop', { gain: 0.8 }); }
  return { shots: S, cues: CUES };
}
