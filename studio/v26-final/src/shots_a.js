import * as K from './kolam.js';
const P = K.PAL;
export function buildA(add, cue) {
  add({ id: 't', at: 0, draw: (lt) => { K.floor(lt); K.dots(540, 700, 5, 5, 110, lt / 1.5); K.cage(540, 700, 200, lt / 2, { open: (lt - 3) / 2 }); K.dot(540, 700, 16, P.yellow);
    K.figure(300, 1300, 1, { p: lt / 2, hat: 'crown' }); K.figure(780, 1300, 1, { p: lt / 2, col: P.red, hat: 'turban', spear: 1 }); K.fort(540, 1450, 0.8, lt / 3, { col: P.red });
    K.army(100, 400, 6, 2, 80, lt / 2, P.teal, lt * 40); K.crown(540, 300, 1, lt); K.title('1231', 540, 1000, lt); K.tag('ILLUSTRATION', 540, 180, lt);
    K.gust((lt - 4) / 1.5); K.smudge(700, 900, 120, lt - 4.5); K.crack(200, 900, 500, 0.3, lt - 4); K.motes(lt); } });
}
