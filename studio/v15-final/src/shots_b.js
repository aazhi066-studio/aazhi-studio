import { ctx, W, H } from './core/lib.js';
import { L } from './core/timing.js';
export function buildB(add, cue) { add({ id: 'b0', at: L(4), draw() { ctx.fillStyle = '#100'; ctx.fillRect(0, 0, W, H); } }); }
