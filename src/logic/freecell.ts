import { fitsFoundation, foundationFor, isRun, RANKS, replaceAt, runLength, stacksAlternating, top } from './deck';
import type { CardState, FreeCellState, Loc, Move, Pile, Suit } from './types';

/** Microsoft FreeCell card order: A♣ A♦ A♥ A♠ 2♣ … K♠. */
const MS_SUITS: Suit[] = ['C', 'D', 'H', 'S'];

/**
 * The classic Microsoft FreeCell deal (deal numbers 1…32000 match Windows FreeCell):
 * LCG state = state × 214013 + 2531011 mod 2^31, rand = state >> 16; card i goes to column i mod 8.
 */
export function dealFreeCell(dealNumber: number): FreeCellState {
  const deck = Array.from({ length: 52 }, (_, i) => i);
  const tableau: Pile[] = Array.from({ length: 8 }, () => []);
  let state = dealNumber >>> 0;
  for (let i = 0; i < 52; i++) {
    const left = 52 - i;
    state = (state * 214013 + 2531011) % 2147483648;
    const j = (state >>> 16) % left;
    const n = deck[j]!;
    const card: CardState = { rank: RANKS[n >> 2]!, suit: MS_SUITS[n & 3]!, up: true };
    tableau[i % 8]!.push(card);
    deck[j] = deck[left - 1]!;
  }
  return { variant: 'freecell', dealNumber, cells: [null, null, null, null], foundations: [[], [], [], []], tableau };
}

/**
 * Longest run that can move at once using free cells and empty columns:
 * (free cells + 1) × 2^(empty columns), not counting the target column when it is empty.
 */
export function maxSupermove(s: FreeCellState, toEmptyColumn: boolean): number {
  const freeCells = s.cells.filter((c) => c === null).length;
  const empty = s.tableau.filter((p) => p.length === 0).length - (toEmptyColumn ? 1 : 0);
  return (freeCells + 1) * 2 ** Math.max(0, empty);
}

export function freeCellIsLegal(s: FreeCellState, move: Move): boolean {
  if (move.kind === 'stock') return false;
  const { from, to, count } = move;
  if (!Number.isInteger(count) || count < 1) return false;
  if (from.pile === to.pile && from.index === to.index) return false;
  let moving: CardState | undefined;
  if (from.pile === 'cell') {
    moving = s.cells[from.index] ?? undefined;
    if (count !== 1) return false;
  } else if (from.pile === 'tableau') {
    const src = s.tableau[from.index];
    if (!src || !isRun(src, count, stacksAlternating)) return false;
    moving = src[src.length - count];
  } else {
    return false;
  }
  if (!moving) return false;
  if (to.pile === 'cell') return count === 1 && from.pile === 'tableau' && to.index >= 0 && s.cells[to.index] === null;
  if (to.pile === 'foundation') {
    const f = s.foundations[to.index];
    return count === 1 && !!f && fitsFoundation(moving, f);
  }
  if (to.pile !== 'tableau') return false;
  const dst = s.tableau[to.index];
  if (!dst) return false;
  const t = top(dst);
  if (t && !stacksAlternating(moving, t)) return false;
  return from.pile === 'cell' || count <= maxSupermove(s, !t);
}

export function freeCellApply(s: FreeCellState, move: Move): FreeCellState {
  if (move.kind === 'stock' || !freeCellIsLegal(s, move)) return s;
  const { from, to, count } = move;
  let moving: Pile;
  let next: FreeCellState;
  if (from.pile === 'cell') {
    moving = [s.cells[from.index]!];
    next = { ...s, cells: replaceAt(s.cells, from.index, null) };
  } else {
    const src = s.tableau[from.index]!;
    moving = src.slice(src.length - count);
    next = { ...s, tableau: replaceAt(s.tableau, from.index, src.slice(0, src.length - count)) };
  }
  if (to.pile === 'cell') return { ...next, cells: replaceAt(next.cells, to.index, moving[0]!) };
  if (to.pile === 'foundation') {
    return { ...next, foundations: replaceAt(next.foundations, to.index, [...next.foundations[to.index]!, ...moving]) };
  }
  return { ...next, tableau: replaceAt(next.tableau, to.index, [...next.tableau[to.index]!, ...moving]) };
}

/** Every distinct legal move (one representative empty cell / empty column). */
export function freeCellLegalMoves(s: FreeCellState): Move[] {
  const moves: Move[] = [];
  const add = (m: Move) => {
    if (freeCellIsLegal(s, m)) moves.push(m);
  };
  const firstEmptyCol = s.tableau.findIndex((p) => p.length === 0);
  const firstFreeCell = s.cells.findIndex((c) => c === null);
  const sources: { from: Loc; card: CardState | undefined }[] = [
    ...s.cells.map((card, i) => ({ from: { pile: 'cell', index: i } as Loc, card: card ?? undefined })),
    ...s.tableau.map((p, i) => ({ from: { pile: 'tableau', index: i } as Loc, card: top(p) })),
  ];
  for (const { from, card } of sources) {
    if (!card) continue;
    const f = foundationFor(card, s.foundations);
    if (f >= 0) add({ kind: 'move', from, to: { pile: 'foundation', index: f }, count: 1 });
  }
  for (const { from, card } of sources) {
    if (!card) continue;
    const pile = from.pile === 'tableau' ? s.tableau[from.index]! : [card];
    const n = from.pile === 'tableau' ? runLength(pile, stacksAlternating) : 1;
    for (let count = 1; count <= n; count++) {
      s.tableau.forEach((p, j) => {
        if (p.length > 0) add({ kind: 'move', from, to: { pile: 'tableau', index: j }, count });
      });
      // A whole column into an empty column is a no-op; a cell card always may go there.
      if (firstEmptyCol >= 0 && (from.pile === 'cell' || count < pile.length)) add({ kind: 'move', from, to: { pile: 'tableau', index: firstEmptyCol }, count });
    }
    if (from.pile === 'tableau' && firstFreeCell >= 0) add({ kind: 'move', from, to: { pile: 'cell', index: firstFreeCell }, count: 1 });
  }
  return moves;
}
