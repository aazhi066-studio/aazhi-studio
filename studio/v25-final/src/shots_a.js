import * as G from './chart.js';
import { L } from './core/timing.js';
import { ctx } from './core/lib.js';
export function buildA(add, cue) {
  add({ id: 'test', at: 0, draw: (lt) => { const r = G.sheet(lt, { lift: 0.5 }); G.rhumb(540, 800, 900, 1); G.coast(G.GEO.INDIA, 1, {land:'#D9C08C'}); G.coast(G.GEO.JAFFNA, 1, { land: '#CDB27E', hatchSide:-1 });
    G.rose(300, 1100, 150, lt, { spin: lt }); G.waves(100, 1000, 1200, lt, { storm: 0.6 }); G.ship(320, 1000, 0.6, lt, {}); G.ship(800, 1250, 0.6, lt, { kind: 'boat' });
    G.fort(700, 600, 0.5, { burning: 0.8, t: lt }); G.figure(200, 1400, 1, { hat: 'crown', chain: true }); G.stamp(860, 300, 90, 0.8, { text: '?' }); G.blot(600, 1000, 60, 1); G.wind(lt, 100, 300, 1000, 900, 1);
    G.rope(450, 1350, 0.7); G.blade(560, 1400, 0.7); G.burn(950, 1300, 0.5, 300); G.sheetTop(lt, r); G.tag('ACCOUNTS SAY', 540, 200); G.title('JAFFNA 1619', 540, 420, 110, 1); } });
}
