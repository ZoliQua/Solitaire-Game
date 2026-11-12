import type { Loc, Move } from '../logic/types';

/** Microsoft FreeCell deal #164. */
export const DEMO_DEAL = 164;

/**
 * A full solution of deal #164, found offline with a best-first search over the real engine
 * (safe foundation moves written out as their own steps). `t3c1` = column 4 → free cell 2,
 * `f` = foundation, `x2` = a two-card run. A test replays it move by move to the win.
 */
export const DEMO_SCRIPT: readonly string[] = (
  't0c0 t0t4 t0c1 t0f0 t0c2 t0f1 t0f2 t4f1 t5f1 t5f1 c2f1 c0f1 t1t0 t7t0 t7t0 t1c0 t1c2 t1f2 t4f2 t2t4 t7c3 t7t3 ' +
  't7f0 c0t6 t7c0 c3t7 c2t7 t5t7 t3c2 t3c3 t3t7 c0t3 t6t7x2 c1t7 t2c0 t2t0 t2c1 t2f1 t5t7 t5f1 c3t2 t1t2 t1t2 t3t2x2 ' +
  't4t2x2 t4f1 t4f1 t1c3 c0t1 t3c0 t5t1 t3t5 t3f2 t3f3 c3t3 t7t3 t7f2 t3t7x2 c1t3 t6c1 t6t3 t6c3 t6f3 t0f3 t6f0 t0f0 ' +
  't7f3 t0f3 t0f2 t7f0 t2f0 t7f3 c1f2 t2f3 t5f2 t7f0 t2f0 t7f3 c3f0 t2f3 t2f0 t7f2 t4f2 t2f1 t7f3 c2f3 t7f0 t4f0 ' +
  't2t0x2 t2f2 t0f2 t1f1 c0f1 t3f3 t0f3 t1f0 t3f2'
).split(' ');

const PILE: Record<string, Loc['pile']> = { t: 'tableau', c: 'cell', f: 'foundation' };

export function parseMove(code: string): Move {
  const m = /^([tcf])(\d)([tcf])(\d)(?:x(\d+))?$/.exec(code);
  if (!m) throw new Error(`Bad demo move: ${code}`);
  return { kind: 'move', from: { pile: PILE[m[1]!]!, index: Number(m[2]) }, to: { pile: PILE[m[3]!]!, index: Number(m[4]) }, count: Number(m[5] ?? 1) };
}
