import { describe, expect, it } from 'vitest';
import { mulberry32 } from './deck';
import { dealFreeCell } from './freecell';
import { dealKlondike } from './klondike';
import { applyMove, isLegalMove, legalMoves } from './moves';
import { dealSpider } from './spider';
import type { Loc, Move, SolitaireState } from './types';

const cardCount = (s: SolitaireState): number =>
  s.tableau.flat().length +
  s.foundations.flat().length +
  (s.variant === 'klondike' ? s.stock.length + s.waste.length : 0) +
  (s.variant === 'spider' ? s.stock.length : 0) +
  (s.variant === 'freecell' ? s.cells.filter(Boolean).length : 0);

describe('random legal play', () => {
  const starts: [string, SolitaireState, number][] = [
    ['klondike draw 1', dealKlondike(21, 1), 52],
    ['klondike draw 3', dealKlondike(22, 3), 52],
    ['spider 1 suit', dealSpider(23, 1), 104],
    ['spider 4 suits', dealSpider(24, 4), 104],
    ['freecell', dealFreeCell(25), 52],
  ];
  it.each(starts)('%s keeps every card and only lists legal moves', (_name, start, total) => {
    const rng = mulberry32(99);
    let s = start;
    for (let step = 0; step < 400; step++) {
      const moves = legalMoves(s);
      if (moves.length === 0) break;
      for (const m of moves) expect(isLegalMove(s, m)).toBe(true);
      const next = applyMove(s, moves[Math.floor(rng() * moves.length)]!);
      expect(next).not.toBe(s);
      s = next;
      expect(cardCount(s)).toBe(total);
    }
  });
});

/** All locations of a state's piles. */
function locations(s: SolitaireState): Loc[] {
  const locs: Loc[] = [
    ...s.tableau.map((_, index): Loc => ({ pile: 'tableau', index })),
    ...s.foundations.map((_, index): Loc => ({ pile: 'foundation', index })),
  ];
  if (s.variant === 'spider') locs.push({ pile: 'foundation', index: s.foundations.length });
  if (s.variant === 'klondike') locs.push({ pile: 'waste', index: 0 });
  if (s.variant === 'freecell') s.cells.forEach((_, index) => locs.push({ pile: 'cell', index }));
  return locs;
}

const isEmptyTarget = (s: SolitaireState, loc: Loc): boolean => {
  if (loc.pile === 'cell') return s.variant === 'freecell' && s.cells[loc.index] === null;
  if (loc.pile === 'tableau') return s.tableau[loc.index]?.length === 0;
  if (loc.pile === 'foundation') return (s.foundations[loc.index]?.length ?? 0) === 0;
  return false;
};

/**
 * `legalMoves` lists one representative per empty target (any empty column / cell / foundation is
 * the same move) and leaves out relocating a whole column into an empty column (a no-op).
 */
function key(s: SolitaireState, m: Move): string {
  if (m.kind === 'stock') return 'stock';
  const to = isEmptyTarget(s, m.to) ? 'empty' : String(m.to.index);
  return `${m.from.pile}${m.from.index}:${m.count}->${m.to.pile}${to}`;
}
const isRelocation = (s: SolitaireState, m: Move): boolean =>
  m.kind === 'move' &&
  m.from.pile === 'tableau' &&
  m.to.pile === 'tableau' &&
  m.count === s.tableau[m.from.index]!.length &&
  isEmptyTarget(s, m.to);

/** The same position with the last column emptied (its top cards parked in free cells in FreeCell). */
function withEmptyColumn(s: SolitaireState): SolitaireState {
  const last = s.tableau.length - 1;
  const removed = s.tableau[last]!;
  const tableau = s.tableau.map((p, i) => (i === last ? [] : p));
  if (s.variant !== 'freecell') return { ...s, tableau };
  const parked = removed.slice(-2).map((card) => ({ ...card, up: true }));
  const cells = s.cells.map((c) => c ?? parked.shift() ?? null);
  return { ...s, tableau, cells };
}

function expectComplete(s: SolitaireState): number {
  const listed = new Set(legalMoves(s).map((m) => key(s, m)));
  const candidates: Move[] = [{ kind: 'stock' }];
  for (const from of locations(s)) {
    for (const to of locations(s)) {
      for (let count = 1; count <= 13; count++) candidates.push({ kind: 'move', from, to, count });
    }
  }
  let checked = 0;
  for (const m of candidates) {
    if (!isLegalMove(s, m) || isRelocation(s, m)) continue;
    expect(listed, JSON.stringify(m)).toContain(key(s, m));
    checked++;
  }
  return checked;
}

describe('legalMoves completeness', () => {
  const starts: [string, () => SolitaireState][] = [
    ['klondike', () => dealKlondike(31, 3)],
    ['spider', () => dealSpider(32, 2)],
    ['freecell', () => dealFreeCell(33)],
  ];
  it.each(starts)('%s lists every move isLegalMove accepts', (_name, start) => {
    const rng = mulberry32(7);
    let s = start();
    let checked = 0;
    for (let step = 0; step < 1500; step++) {
      if (step % 3 === 0) checked += expectComplete(s) + expectComplete(withEmptyColumn(s));
      const moves = legalMoves(s);
      if (moves.length === 0) break;
      s = applyMove(s, moves[Math.floor(rng() * moves.length)]!);
    }
    expect(checked).toBeGreaterThan(20);
  });
});
