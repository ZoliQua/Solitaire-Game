import { describe, expect, it } from 'vitest';
import { cardCode, parseCard as c } from './deck';
import { History } from './history';
import { dealKlondike } from './klondike';
import { applyMove, autoFoundation, canAutoComplete, isLegalMove, isWon, legalMoves } from './moves';
import type { CardState, KlondikeState, Move, Pile } from './types';

const down = (code: string): CardState => c(code, false);
const tab = (index: number) => ({ pile: 'tableau', index }) as const;
const fnd = (index: number) => ({ pile: 'foundation', index }) as const;
const WASTE = { pile: 'waste', index: 0 } as const;

function emptyKlondike(patch: Partial<KlondikeState> = {}): KlondikeState {
  return {
    variant: 'klondike',
    seed: 0,
    draw: 1,
    passes: 0,
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    ...patch,
  };
}

const fullSuit = (suit: string): Pile =>
  ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((r) => c(r + suit));

describe('dealKlondike', () => {
  it('deals 28 tableau cards with only the top card of each column face up', () => {
    const s = dealKlondike(42, 1);
    expect(s.tableau.map((p) => p.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(s.tableau.flat()).toHaveLength(28);
    s.tableau.forEach((pile) => {
      expect(pile[pile.length - 1]!.up).toBe(true);
      pile.slice(0, -1).forEach((card) => expect(card.up).toBe(false));
    });
    expect(s.stock).toHaveLength(24);
    expect(s.stock.every((card) => !card.up)).toBe(true);
    expect(s.waste).toEqual([]);
    expect(s.foundations).toEqual([[], [], [], []]);
    expect(s.passes).toBe(0);
    const all = [...s.stock, ...s.tableau.flat()].map(cardCode);
    expect(new Set(all).size).toBe(52);
  });

  it('is deterministic per seed', () => {
    expect(dealKlondike(7, 3)).toEqual(dealKlondike(7, 3));
    expect(dealKlondike(7, 3).stock).not.toEqual(dealKlondike(8, 3).stock);
  });
});

describe('Klondike tableau rules', () => {
  it('builds down in alternating colours only', () => {
    const s = emptyKlondike({ tableau: [[c('8S')], [c('7H')], [c('7C')], [c('6H')], [], [], []] });
    expect(isLegalMove(s, { kind: 'move', from: tab(1), to: tab(0), count: 1 })).toBe(true);
    expect(isLegalMove(s, { kind: 'move', from: tab(2), to: tab(0), count: 1 })).toBe(false); // same colour
    expect(isLegalMove(s, { kind: 'move', from: tab(3), to: tab(0), count: 1 })).toBe(false); // not one lower
  });

  it('accepts only a King on an empty column', () => {
    const s = emptyKlondike({ tableau: [[], [c('QH')], [down('3C'), c('KD'), c('QS')], [], [], [], []] });
    expect(isLegalMove(s, { kind: 'move', from: tab(1), to: tab(0), count: 1 })).toBe(false);
    expect(isLegalMove(s, { kind: 'move', from: tab(2), to: tab(0), count: 2 })).toBe(true);
    const next = applyMove(s, { kind: 'move', from: tab(2), to: tab(0), count: 2 });
    expect(next.tableau[0]!.map(cardCode)).toEqual(['KD', 'QS']);
    // The card left behind turns face up.
    expect(next.tableau[2]).toEqual([c('3C')]);
  });

  it('never mutates the input state', () => {
    const s = emptyKlondike({ tableau: [[c('8S')], [down('2C'), c('7H')], [], [], [], [], []] });
    const snapshot = structuredClone(s);
    applyMove(s, { kind: 'move', from: tab(1), to: tab(0), count: 1 });
    expect(s).toEqual(snapshot);
  });

  it('rejects illegal moves without changing anything', () => {
    const s = emptyKlondike({ tableau: [[c('8S')], [c('7S')], [], [], [], [], []] });
    expect(applyMove(s, { kind: 'move', from: tab(1), to: tab(0), count: 1 })).toBe(s);
  });
});

describe('Klondike stock', () => {
  it('draw 3 puts three cards on the waste with the third drawn on top', () => {
    const s = dealKlondike(1, 3);
    const stockTop3 = s.stock.slice(-3).map(cardCode); // [a, b, c], c on top
    const next = applyMove(s, { kind: 'stock' });
    expect(next.stock).toHaveLength(21);
    expect(next.waste.map(cardCode)).toEqual([...stockTop3].reverse()); // [c, b, a]
    expect(next.waste.every((card) => card.up)).toBe(true);
    expect(cardCode(next.waste[next.waste.length - 1]!)).toBe(stockTop3[0]);
  });

  it('draw 3 with fewer than three cards left takes the rest', () => {
    const s = emptyKlondike({ draw: 3, stock: [down('2C'), down('3C')] });
    const next = applyMove(s, { kind: 'stock' });
    expect(next.waste.map(cardCode)).toEqual(['3C', '2C']);
    expect(next.stock).toEqual([]);
  });

  it('draw 1 takes one card', () => {
    const s = dealKlondike(1, 1);
    const next = applyMove(s, { kind: 'stock' });
    expect(next.waste).toEqual([{ ...s.stock[s.stock.length - 1]!, up: true }]);
  });

  it('redeals the waste face down in the original order, without limit', () => {
    let s = dealKlondike(3, 3);
    const original = s.stock;
    for (let pass = 1; pass <= 3; pass++) {
      while (s.stock.length > 0) s = applyMove(s, { kind: 'stock' });
      expect(s.waste).toHaveLength(24);
      s = applyMove(s, { kind: 'stock' });
      expect(s.stock).toEqual(original);
      expect(s.waste).toEqual([]);
      expect(s.passes).toBe(pass);
    }
  });

  it('has no stock move when stock and waste are both empty', () => {
    const s = emptyKlondike({ tableau: [[c('5H')], [], [], [], [], [], []] });
    expect(legalMoves(s).some((m) => m.kind === 'stock')).toBe(false);
  });
});

describe('Klondike foundations', () => {
  it('moves the waste top to the foundation and builds up by suit', () => {
    const s = emptyKlondike({ waste: [c('2H')], foundations: [[c('AH')], [], [], []] });
    expect(isLegalMove(s, { kind: 'move', from: WASTE, to: fnd(0), count: 1 })).toBe(true);
    expect(isLegalMove(s, { kind: 'move', from: WASTE, to: fnd(1), count: 1 })).toBe(false);
  });

  it('auto-moves only safe cards and flips the card left behind', () => {
    const s = emptyKlondike({
      waste: [c('AS')],
      foundations: [[c('AH')], [], [], []],
      tableau: [[down('9C'), c('2H')], [c('3H')], [c('AD')], [c('2S')], [], [], []],
    });
    const moves = autoFoundation(s);
    let next = s;
    for (const m of moves) next = applyMove(next, m);
    // AS, AD, 2H, 2S are always safe; 3H waits until both black twos are home (2C is not).
    expect(next.foundations.flat().map(cardCode).sort()).toEqual(['2H', '2S', 'AD', 'AH', 'AS'].sort());
    expect(next.tableau[1]!.map(cardCode)).toEqual(['3H']);
    expect(next.tableau[0]).toEqual([c('9C')]);
    expect(next.tableau[0]![0]!.up).toBe(true); // 9C was flipped by the auto-move
  });

  it('undo after a foundation auto-move with a flip restores the exact pre-move state', () => {
    const s = emptyKlondike({
      foundations: [[c('AH')], [], [], []],
      tableau: [[down('9C'), c('2H')], [c('KS')], [], [], [], [], []],
    });
    const snapshot = structuredClone(s);
    let history = History.empty<KlondikeState>();
    let current = s;
    for (const m of autoFoundation(current)) {
      history = History.push(history, current);
      current = applyMove(current, m);
    }
    expect(current.tableau[0]).toEqual([c('9C')]);
    expect(current.foundations[0]).toHaveLength(2);
    const undone = History.undo(history)!;
    expect(undone.state).toEqual(snapshot);
    expect(undone.state.tableau[0]![0]!.up).toBe(false);
    expect(undone.state.foundations[0]).toHaveLength(1);
    expect(s).toEqual(snapshot); // the input was never mutated
  });

  it('can auto-complete once everything is face up and stock and waste are empty', () => {
    const s = emptyKlondike({ tableau: [[c('KS'), c('QH')], [c('5D')], [], [], [], [], []] });
    expect(canAutoComplete(s)).toBe(true);
    expect(canAutoComplete({ ...s, waste: [c('2C')] })).toBe(false);
    expect(canAutoComplete({ ...s, tableau: [[down('KS'), c('QH')], [], [], [], [], [], []] })).toBe(false);
  });

  it('is won exactly when all 52 cards are on the foundations', () => {
    const won = emptyKlondike({ foundations: ['S', 'H', 'D', 'C'].map(fullSuit) });
    expect(isWon(won)).toBe(true);
    const almost = emptyKlondike({
      foundations: [fullSuit('S'), fullSuit('H'), fullSuit('D'), fullSuit('C').slice(0, 12)],
      tableau: [[c('KC')], [], [], [], [], [], []],
    });
    expect(isWon(almost)).toBe(false);
    expect(isWon(dealKlondike(5, 1))).toBe(false);
  });

  it('lists only legal moves', () => {
    const s = dealKlondike(11, 1);
    const moves: Move[] = legalMoves(s);
    expect(moves.length).toBeGreaterThan(0);
    for (const m of moves) expect(isLegalMove(s, m)).toBe(true);
  });
});
