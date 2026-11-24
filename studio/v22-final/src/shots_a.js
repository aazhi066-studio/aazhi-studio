import { ctx } from './core/lib.js';
import * as PP from './puppet.js';
export function buildA(add, cue) {
  add({ id: 'test', at: 0, draw: (lt, d, t) => { PP.screen(t); PP.elephant(560, 1250, 0.8, 1, { rear: 0.4, step: t * 3, rider: (x, y) => PP.warrior(x, y + 10, 0.45, 1, { crown: 1, arm: 60, rodA: 0 }) });
    PP.warrior(220, 1300, 0.6, 1, { weapon: 'bow', arm: 80, col: PP.PAL.green, dk: PP.PAL.greenDk }); PP.volley(0.6, 12, 1); PP.placard('WHO WON?', 540, 380, 1, 110); PP.stageFrame(t); PP.lampEdge(); } });
}
