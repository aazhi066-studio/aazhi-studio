import { ctx, W, H } from './core/lib.js';
import { L } from './core/timing.js';
export function buildC(add, cue) { add({ id: 'c0', at: L(8), draw() { ctx.fillStyle = '#100'; ctx.fillRect(0, 0, W, H); } }); }
