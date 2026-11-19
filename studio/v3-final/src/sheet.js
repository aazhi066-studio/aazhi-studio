// The Chola Chronicle style sheet, drawn with the style's own kit.
import { ctx } from './core/lib.js';
import { startBoard, panel, frame, cell, small, swatches, rules, BW } from './core/board.js';
import * as K from './core/kit.js';
const { P } = K;

const cv = document.getElementById('cv');
await document.fonts.load('900 40px Inter'); await document.fonts.load('700 40px Caladea'); await document.fonts.load('700 40px NotoTamil', 'சோழர்');
startBoard(cv, { title: 'CHOLA CHRONICLE: VIDEO STYLE SHEET', author: 'FACELESS SHORTS · STYLE 07', bg: '#150B06', line: '#5A3B1E', head: '#F6E7C4', accent: P.gold, font: 'Caladea' });
ctx.save(); ctx.font = '700 40px NotoTamil, Caladea'; ctx.fillStyle = P.gold; ctx.textAlign = 'left'; ctx.fillText('சோழர்', 1000, 54); ctx.restore();
const DK = '#F6E7C4';
const glowBg = (b, a = 0.35, y = 0.4) => { ctx.save(); ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 14); ctx.clip(); ctx.fillStyle = '#1E0F07'; ctx.fillRect(b.x, b.y, b.w, b.h); const g = ctx.createRadialGradient(b.x + b.w / 2, b.y + b.h * y, 0, b.x + b.w / 2, b.y + b.h * y, b.w * 0.8); g.addColorStop(0, `rgba(255,170,60,${a})`); g.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = g; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.restore(); };

// 1 · hero frame
let b = panel(20, 80, 560, 520, 1, 'HERO FRAME');
frame(b.x + 6, b.y, 240, () => {
  K.harbor(0.6, { temple: true });
  K.ship(300, 1080, 0.55, -0.02, 0.6, { crew: 3, lions: 1 }); K.ship(760, 1010, 0.3, 0.02, 1.3, { noFlag: false });
  K.figure({ x: 700, y: 1235, h: 640, role: 'king', arm: 40, sword: 14 });
  K.treasure(300, 1330, 0.7);
  K.embers(0.8, 28, 4); K.vignette(0.4);
  K.plaque('1025 CE', 540, 330, 1);
  K.captionStrip([{ txt: 'The' }, { txt: 'fleet' }, { txt: 'sailed.', hi: 1 }], 540, K.CAPLOOK.y, 0.95);
});
small('LAMPLIT, GOLDEN-HOUR\nEPIC LIGHT', b.x + 270, b.y + 40, 'left', 17);
small('TEMPLES, SHIPS AND\nPALM-LEAF BOOKS', b.x + 270, b.y + 130, 'left', 17);
small('BRONZE-SKIN HEROES\nIN GOLD JEWELS', b.x + 270, b.y + 220, 'left', 17);
small('SLOW PUSH THROUGH\nLIGHT AND EMBERS', b.x + 270, b.y + 310, 'left', 17);

// 2 · palette
b = panel(590, 80, 660, 520, 2, 'PALETTE');
const yy = swatches(b, [['NIGHT', P.night], ['LEAF', P.leaf], ['LAMP', P.lamp], ['GOLD', P.gold], ['BRONZE', P.bronze], ['KUMKUM', P.kumkum], ['SEA', P.teal], ['STONE', P.stone]]);
['WARM GOLD OR DEEP TEAL: ONE MOOD PER SCENE.', 'GOLD: CROWNS, DATES, TREASURE. KUMKUM: ROUTES AND KEY WORD.', 'LIGHT IS THE ONLY GRADIENT: LAMPS, SUN, GOD RAYS.']
  .forEach((t, i) => small(t, b.x + 4, yy + 20 + i * 36, 'left', 14, '#EFE0BE'));
glowBg({ x: b.x, y: yy + 128, w: b.w, h: 168 }, 0.4, 0.5);
['king', 'warrior', 'sailor', 'scribe', 'priest'].forEach((r, i) => cell(b.x + 70 + i * 122, yy + 276, 0.19, () => K.figure({ x: 0, y: 0, role: r }), r.toUpperCase(), 22, DK));

// 3 · components
b = panel(1260, 80, 640, 520, 3, 'COMPONENTS');
glowBg(b, 0.28, 0.3);
const gx = (i) => b.x + 78 + i * 156, gy = (r) => b.y + 112 + r * 212, LB = '#F0DDB4';
cell(gx(0), gy(0) + 40, 0.5, () => K.lamp(0, 0, 1, 0.4), 'OIL LAMP', 66, LB);
cell(gx(1), gy(0) + 10, 0.2, () => K.manuscript(0, 0, 1, -0.08), 'MANUSCRIPT', 80, LB);
cell(gx(2), gy(0) + 6, 0.27, () => K.plaque('1025', 0, 0, 1, 80), 'DATE PLAQUE', 80, LB);
cell(gx(3), gy(0) + 40, 0.5, () => K.lotus(0, 0, 1), 'LOTUS', 66, LB);
cell(gx(0), gy(1) + 20, 0.19, () => K.ship(0, 0, 1, 0, 0.5, { crew: 3, lions: 1 }), 'WARSHIP', 86, LB);
cell(gx(1), gy(1) + 70, 0.14, () => K.gopuram(0, 0, 1, K.STONE.warm), 'GOPURAM', 40, LB);
cell(gx(2), gy(1) + 40, 0.3, () => K.treasure(0, 0, 1), 'TREASURE', 50, LB);
cell(gx(3), gy(1) + 40, 0.13, () => { K.pillar(-70, 0, 700); K.pillar(70, 0, 700); }, 'PILLARS', 50, LB);

// 4 · scenes
b = panel(20, 610, 760, 456, 4, 'SCENES');
const sw = 160, sx = (i) => b.x + 10 + i * (sw + 26);
frame(sx(0), b.y, sw, () => { K.scriptorium(0.5); K.manuscript(540, 1160, 1.0, -0.05); });
frame(sx(1), b.y, sw, () => { K.sunken(0.5); K.figure({ x: 300, y: 1500, h: 560, role: 'scribe', dir: 1, arm: 20 }); });
frame(sx(2), b.y, sw, () => { K.harbor(0.5, { temple: true }); K.ship(330, 1060, 0.6, 0, 0.5, { crew: 3 }); K.figure({ x: 760, y: 1250, h: 600, role: 'king', arm: 30, sword: 10 }); });
frame(sx(3), b.y, sw, () => { K.bronzeHall(0.5); K.statue(540, 960, 1.0, 0.5); });
['(A) THE SCRIPTORIUM', '(B) THE SUNKEN CITY', '(C) GOLDEN HARBOR', '(D) THE BRONZE HALL'].forEach((t, i) => small(t.replace(/^\((.)\) /, '$1 · '), sx(i) + sw / 2, b.y + sw * 16 / 9 + 26, 'center', 12, '#E6D3AA'));

// 5 · captions
b = panel(790, 610, 520, 456, 5, 'CAPTIONS');
glowBg(b, 0.35, 0.45);
[[[{ txt: 'In' }, { txt: '1025,', hi: 1 }], 95], [[{ txt: 'The' }, { txt: 'fleet' }, { txt: 'sailed.', hi: 1 }], 190], [[{ txt: 'Cholas' }, { txt: 'ruled' }, { txt: 'the' }, { txt: 'sea.', hi: 1 }], 285]]
  .forEach(([w, y]) => cell(b.x + b.w / 2, b.y + y, 0.44, () => K.captionStrip(w, 0, 0, 1, { ...K.CAPLOOK, maxW: 1060 }), null));
small('DARK PALM-LEAF STRIP · 2-4 WORDS · ONE GOLD WORD', b.x + b.w / 2, b.y + b.h - 24, 'center', 12, '#D9C38F');

// 6 · rules
b = panel(1320, 610, 580, 456, 6, 'RULES');
rules(b, ['LIGHT IS THE HERO: LAMPS, SUN, GOD RAYS.', 'ONE MOOD PER SCENE: WARM GOLD OR DEEP TEAL.', 'HEROES: FACELESS, BRONZE, GOLD-JEWELLED.', 'SETS: TEMPLES, SHIPS, MANUSCRIPTS, BRONZES.', 'NO GORE: FLEETS, FLAGS, PORTS, NOT FIGHTING.', 'CAMERA PUSHES THROUGH LIGHT, 2-4 S SHOTS.', 'SOUND: LOW DRONE AND SOFT PLUCKS.'], b.y + 26, 16, 52);
window.SHEET_READY = true;
