import * as B from './batik.js';
import { L, Wd } from './core/timing.js';
export function buildA(add, cue) {
  add({ id: 'test', at: 0, draw: (lt) => { B.cloth(lt); B.hill(80, 1000, 1350, 600, 1, { dots: 1 }); B.moon(540, 420, 160, { crack: 0.6 }); B.king(250, 1300, 0.9, 'bow', { lt }); B.king(540, 1300, 0.9, 'tiger', { lt }); B.king(830, 1300, 0.9, 'fish', { lt });
    B.figure(540, 900, 0.7, {}); B.creeper(150, 1300, 400, 0.8, lt); B.chariot(800, 800, 0.8, lt); B.leaf(540, 1100, 500, 120, 1, lt); B.tag('PARAMBU HILL', 540, 200); B.title('SIEGE', 540, 650, 140); B.army(100, 980, 1450, 9, lt); B.ring(540, 900, 300, 0.7, lt); } });
}
