import { ctx, W, H } from './core/lib.js';
import { L } from './core/timing.js';
export function buildA(add, cue) { add({ id: 'a0', at: L(0), draw() { ctx.fillStyle = '#100'; ctx.fillRect(0, 0, W, H); } }); }
