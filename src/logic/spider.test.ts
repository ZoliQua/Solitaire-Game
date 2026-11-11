import { describe, expect, it } from 'vitest';
import { cardCode, parseCard as c, RANKS } from './deck';
import { History } from './history';
import { dealSpider } from './spider';
import { applyMove, autoFoundation, canAutoComplete, isLegalMove, isWon, legalMoves } from './moves';
import type { CardState, Pile, SpiderState } from './types';

const down = (code: string): CardState => c(code, false);
const tab = (index: number) => ({ pile: 'tableau', index }) as const;

function emptySpider(patch: Partial<SpiderState> = {}): SpiderState {
  return {
    variant: 'spider',
    seed: 0,
    suits: 1,
    stock: [],
    foundations: [],
    tableau: Array.from({ length: 10 }, () => []),
    ...patch,
  };
}

/** K down to `low` of one suit, all face up (top card last). */
const run = (suit: string, low = 'A'): Pile =>
  [...RANKS].reverse().slice(0, 13 - RANKS.indexOf(low as (typeof RANKS)[number])).map((r) => c(r + suit));

const countBy = (cards: Pile) => {
  const m = new Map<string, number>();
  for (const card of cards) m.set(cardCode(card), (m.get(cardCode(card)) ?? 0) + 1);
  return m;
};

describe('dealSpider', () => {
  it('deals 54 tableau cards (6,6,6,6,5,5,5,5,5,5) with top cards up and 50 in the stock', () => {
    const s = dealSpider(9, 4);
    expect(s.tableau.map((p) => p.length)).toEqual([6, 6, 6, 6, 5, 5, 5, 5, 5, 5]);
    expect(s.tableau.flat()).toHaveLength(54);
    expect(s.stock).toHaveLength(50);
    s.tableau.forEach((pile) => {
      expect(pile[pile.length - 1]!.up).toBe(true);
      pile.slice(0, -1).forEach((card) => expect(card.up).toBe(false));
    });
    expect(s.stock.every((card) => !card.up)).toBe(true);
    expect(s.foundations).toEqual([]);
  });

  it('builds a 1-suit deck of 104 spades, eight of each rank', () => {
    const s = dealSpider(1, 1);
    const all = [...s.stock, ...s.tableau.flat()];
    expect(all).toHaveLength(104);
    expect(all.every((card) => card.suit === 'S')).toBe(true);
    const counts = countBy(all);
    expect(counts.size).toBe(13);
    for (const n of counts.values()) expect(n).toBe(8);
  });

  it('builds 2-suit (spades + hearts, four each) and 4-suit (two full decks) decks', () => {
    const two = countBy([...dealSpider(2, 2).stock, ...dealSpider(2, 2).tableau.flat()]);
    expect(two.size).toBe(26);
    for (const [code, n] of two) {
      expect(['S', 'H']).toContain(code.slice(-1));
      expect(n).toBe(4);
    }
    const s4 = dealSpider(3, 4);
    const four = [...s4.stock, ...s4.tableau.flat()];
    expect(countBy(four).size).toBe(52);
    for (const n of countBy(four).values()) expect(n).toBe(2);
    expect(four.filter((card) => card.deck === 0)).toHaveLength(52);
    expect(four.filter((card) => card.deck === 1)).toHaveLength(52);
  });

  it('is deterministic per seed', () => {
    expect(dealSpider(5, 2)).toEqual(dealSpider(5, 2));
  });
});

describe('Spider moves', () => {
  it('deals one face-up card onto every column from the stock', () => {
    const s = dealSpider(4, 1);
    const next = applyMove(s, { kind: 'stock' });
    expect(next.stock).toHaveLength(40);
    expect(next.tableau.map((p) => p.length)).toEqual([7, 7, 7, 7, 6, 6, 6, 6, 6, 6]);
    next.tableau.forEach((p) => expect(p[p.length - 1]!.up).toBe(true));
  });

  it('does not deal from the stock while a column is empty', () => {
    const tableau: Pile[] = Array.from({ length: 10 }, () => [c('5S')]);
    tableau[3] = [];
    const s = emptySpider({ tableau, stock: Array.from({ length: 10 }, () => down('9S')) });
    expect(isLegalMove(s, { kind: 'stock' })).toBe(false);
    expect(legalMoves(s).some((m) => m.kind === 'stock')).toBe(false);
    expect(applyMove(s, { kind: 'stock' })).toBe(s);
  });

  it('moves only same-suit descending runs, onto one rank higher of any suit or an empty column', () => {
    const s = emptySpider({
      suits: 2,
      tableau: [[c('9H'), c('8S')], [c('7H'), c('6H')], [c('8H'), c('7S')], [], [], [], [], [], [], []].map(
        (p) => p as Pile,
      ),
    });
    expect(isLegalMove(s, { kind: 'move', from: tab(1), to: tab(0), count: 2 })).toBe(true); // 7H-6H onto 8S
    expect(isLegalMove(s, { kind: 'move', from: tab(2), to: tab(1), count: 1 })).toBe(false); // 7S onto 6H
    expect(isLegalMove(s, { kind: 'move', from: tab(2), to: tab(3), count: 2 })).toBe(false); // 8H-7S mixed suits
    expect(isLegalMove(s, { kind: 'move', from: tab(0), to: tab(3), count: 2 })).toBe(false); // 9H-8S mixed suits
    expect(isLegalMove(s, { kind: 'move', from: tab(1), to: tab(3), count: 2 })).toBe(true); // any run to empty
  });

  it('removes a complete K→A same-suit run, flips the card below, and undo restores it', () => {
    const tableau: Pile[] = Array.from({ length: 10 }, () => [c('QH')]);
    tableau[0] = [down('5H'), ...run('S', '2')];
    tableau[1] = [down('3D'), c('AS')];
    const s = emptySpider({ tableau, stock: Array.from({ length: 10 }, () => down('9S')) });
    const snapshot = structuredClone(s);
    const move = { kind: 'move', from: tab(1), to: tab(0), count: 1 } as const;
    expect(isLegalMove(s, move)).toBe(true);
    const next = applyMove(s, move);
    expect(next.foundations).toHaveLength(1);
    expect(next.foundations[0]!.map(cardCode)).toEqual(run('S').map(cardCode));
    expect(next.tableau[0]).toEqual([c('5H')]);
    expect(next.tableau[1]).toEqual([c('3D')]);

    expect(s).toEqual(snapshot); // the input was never mutated

    const history = History.push(History.empty<SpiderState>(), s);
    const undone = History.undo(history)!;
    expect(undone.state).toEqual(snapshot);
    expect(undone.state.foundations).toHaveLength(0);
    expect(undone.state.tableau[0]![0]).toEqual(down('5H'));
    expect(undone.state.tableau[1]).toEqual([down('3D'), c('AS')]);
    expect(undone.history.past).toHaveLength(0);
  });

  it('removes a run completed by a stock deal', () => {
    const tableau: Pile[] = Array.from({ length: 10 }, () => [c('QH')]);
    tableau[2] = run('S', '2');
    const stock = Array.from({ length: 10 }, () => down('9H'));
    stock[stock.length - 1 - 2] = down('AS'); // column 2 receives the third card from the top
    const next = applyMove(emptySpider({ tableau, stock }), { kind: 'stock' });
    expect(next.foundations).toHaveLength(1);
    expect(next.tableau[2]).toEqual([]);
  });

  it('does not remove a run with mixed suits', () => {
    const tableau: Pile[] = Array.from({ length: 10 }, () => [c('QH')]);
    tableau[0] = [...run('S', '3'), c('2H')];
    tableau[1] = [c('AS')];
    const next = applyMove(emptySpider({ suits: 2, tableau }), { kind: 'move', from: tab(1), to: tab(0), count: 1 });
    expect(next.foundations).toEqual([]);
    expect(next.tableau[0]).toHaveLength(13);
  });

  it('has no auto-moves and never offers auto-complete', () => {
    const s = dealSpider(1, 1);
    expect(autoFoundation(s)).toEqual([]);
    expect(canAutoComplete(s)).toBe(false);
  });

  it('is won exactly when all 104 cards are on the foundations', () => {
    expect(isWon(emptySpider({ foundations: Array.from({ length: 8 }, () => run('S')) }))).toBe(true);
    expect(isWon(emptySpider({ foundations: Array.from({ length: 7 }, () => run('S')), tableau: [run('S'), [], [], [], [], [], [], [], [], []] }))).toBe(false);
  });

  it('lists only legal moves', () => {
    const s = dealSpider(12, 4);
    const moves = legalMoves(s);
    expect(moves.some((m) => m.kind === 'stock')).toBe(true);
    for (const m of moves) expect(isLegalMove(s, m)).toBe(true);
  });
});
