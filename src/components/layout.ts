import type { Loc, Pile as Cards, SolitaireState } from '../logic/types';

/** A focusable pile: one of the move locations, or the stock. */
export type PileKey = Loc | { pile: 'stock'; index: 0 };

export const pileKeyOf = (k: PileKey): string => `${k.pile}:${k.index}`;

const MAX_CARD = 96;
const MIN_CARD = 20;

/** Card width, gap and column count for a table width: cards scale with the width, Spider's ten columns sit tighter. */
export function tableMetrics(variant: SolitaireState['variant'], width: number) {
  const cols = variant === 'spider' ? 10 : variant === 'freecell' ? 8 : 7;
  const narrow = width < 520;
  const gap = variant === 'spider' ? (narrow ? 2 : 6) : narrow ? 4 : 10;
  const cw = Math.max(MIN_CARD, Math.floor(Math.min(MAX_CARD, (width - gap * (cols - 1)) / cols)));
  return { cols, gap, cw, ch: Math.round(cw * 1.4) };
}

/** Vertical fan of a column, squeezed when it would grow taller than `budget` px. */
export function columnLayout(pile: Cards, ch: number, budget: number, spider: boolean): { ys: number[]; height: number } {
  const up = ch * (spider ? 0.25 : 0.28);
  const down = ch * (spider ? 0.08 : 0.11);
  let natural = 0;
  for (let i = 0; i < pile.length - 1; i++) natural += pile[i]!.up ? up : down;
  const factor = natural > 0 ? Math.max(0.6, Math.min(1, (budget - ch) / natural)) : 1;
  const ys: number[] = [];
  let y = 0;
  pile.forEach((c, i) => {
    ys.push(Math.round(y));
    if (i < pile.length - 1) y += (c.up ? up : down) * factor;
  });
  return { ys, height: Math.round((ys[ys.length - 1] ?? 0) + ch) };
}

