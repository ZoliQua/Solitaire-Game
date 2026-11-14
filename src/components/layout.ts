import type { Loc, Pile as Cards, SolitaireState } from '../logic/types';

/** A focusable pile: one of the move locations, or the stock. */
export type PileKey = Loc | { pile: 'stock'; index: 0 };

export const pileKeyOf = (k: PileKey): string => `${k.pile}:${k.index}`;

const MAX_CARD = 96;
const MIN_CARD = 20;
/** Below this table width (a phone in portrait) the columns and face-down cards pack tighter. */
export const NARROW = 430;
/** Screen height kept for the stat strip and status line when the card size is capped by height. */
const HEIGHT_RESERVE = 100;
/** Card heights the table needs on screen: the top row plus a column budget of 3.5 cards (and gaps). */
const HEIGHT_IN_CARDS = 4.6;

/**
 * Card width, gap and column count. Cards scale with the table width (Spider's ten columns sit tighter, and
 * every variant packs tighter below NARROW) and are capped by the screen height, so a phone in landscape
 * still shows the top row and the columns without scrolling.
 */
export function tableMetrics(variant: SolitaireState['variant'], width: number, height = Infinity) {
  const cols = variant === 'spider' ? 10 : variant === 'freecell' ? 8 : 7;
  const tight = width < NARROW;
  const narrow = width < 520;
  const gap = variant === 'spider' ? (tight ? 1 : narrow ? 2 : 6) : tight ? 3 : narrow ? 4 : 10;
  const byWidth = (width - gap * (cols - 1)) / cols;
  const byHeight = (height - HEIGHT_RESERVE) / HEIGHT_IN_CARDS / 1.4;
  const cw = Math.max(MIN_CARD, Math.floor(Math.min(MAX_CARD, byWidth, byHeight)));
  return { cols, gap, cw, ch: Math.round(cw * 1.4) };
}

/** Vertical fan of a column, squeezed when it would grow taller than `budget` px; `tight` packs face-down cards closer. */
export function columnLayout(pile: Cards, ch: number, budget: number, spider: boolean, tight = false): { ys: number[]; height: number } {
  const up = ch * (spider ? 0.25 : 0.28);
  const down = ch * (spider ? (tight ? 0.06 : 0.08) : tight ? 0.08 : 0.11);
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

