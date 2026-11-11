import { describe, expect, it } from 'vitest';
import { cardCode, parseCard as c, RANKS } from './deck';
import { dealFreeCell, maxSupermove } from './freecell';
import { History } from './history';
import { applyMove, autoFoundation, canAutoComplete, isLegalMove, isWon, legalMoves } from './moves';
import type { FreeCellState, Pile } from './types';

const tab = (index: number) => ({ pile: 'tableau', index }) as const;
const cell = (index: number) => ({ pile: 'cell', index }) as const;
const fnd = (index: number) => ({ pile: 'foundation', index }) as const;

function emptyFreeCell(patch: Partial<FreeCellState> = {}): FreeCellState {
  return {
    variant: 'freecell',
    dealNumber: 0,
    cells: [null, null, null, null],
    foundations: [[], [], [], []],
    tableau: Array.from({ length: 8 }, () => []),
    ...patch,
  };
}

/** Rows of a deal as the published layouts print them (T = ten). */
function rows(s: FreeCellState): string[] {
  const out: string[] = [];
  for (let r = 0; r < 7; r++) {
    out.push(
      s.tableau
        .map((p) => p[r])
        .filter((card) => card !== undefined)
        .map((card) => cardCode(card!).replace('10', 'T'))
        .join(' '),
    );
  }
  return out;
}

const fullSuit = (suit: string): Pile => RANKS.map((r) => c(r + suit));

describe('dealFreeCell (Microsoft deal numbers)', () => {
  it('deal #1 matches the published layout', () => {
    const s = dealFreeCell(1);
    expect(rows(s)[0]).toBe('JD 2D 9H JC 5D 7H 7C 5H');
    expect(rows(s)).toEqual([
      'JD 2D 9H JC 5D 7H 7C 5H',
      'KD KC 9S 5S AD QC KH 3H',
      '2S KS 9D QD JS AS AH 3C',
      '4C 5C TS QH 4H AC 4D 7S',
      '3S TD 4S TH 8H 2C JH 7D',
      '6D 8S 8D QS 6C 3D 8C TC',
      '6S 9C 2H 6H',
    ]);
  });

  it('deal #617 matches the published layout', () => {
    expect(rows(dealFreeCell(617))).toEqual([
      '7D AD 5C 3S 5S 8C 2D AH',
      'TD 7S QD AC 6D 8H AS KH',
      'TH QC 3H 9D 6S 8D 3D TC',
      'KD 5H 9S 3C 8S 7H 4D JS',
      '4C QS 9C 9H 7C 6H 2C 2S',
      '4S TS 2H 5D JC 6C JH QH',
      'JD KS KC 4H',
    ]);
  });

  it('deals 52 face-up cards into columns of 7,7,7,7,6,6,6,6', () => {
    const s = dealFreeCell(11982);
    expect(s.tableau.map((p) => p.length)).toEqual([7, 7, 7, 7, 6, 6, 6, 6]);
    expect(s.tableau.flat().every((card) => card.up)).toBe(true);
    expect(new Set(s.tableau.flat().map(cardCode)).size).toBe(52);
    expect(s.cells).toEqual([null, null, null, null]);
    expect(s.dealNumber).toBe(11982);
  });
});

describe('FreeCell supermoves', () => {
  /** A 7-card alternating run 9H..3H on column 0, a 10S target on column 1. */
  const runState = (freeCells: number, emptyColumns: number): FreeCellState => {
    const tableau: Pile[] = Array.from({ length: 8 }, (_, i) => [c(['2C', '2D', 'KC', 'KD', 'QC', 'QD', 'JC', 'JD'][i]!)]);
    tableau[0] = ['9H', '8S', '7H', '6S', '5H', '4S', '3H'].map((x) => c(x));
    tableau[1] = [c('10S')];
    for (let i = 0; i < emptyColumns; i++) tableau[7 - i] = [];
    const cells = [c('KH'), c('KS'), c('QH'), c('QS')].map((x, i) => (i < 4 - freeCells ? x : null));
    return emptyFreeCell({ tableau, cells });
  };

  it('limits a move to (free cells + 1) × 2^(empty columns)', () => {
    expect(maxSupermove(runState(4, 0), false)).toBe(5);
    expect(maxSupermove(runState(2, 1), false)).toBe(6);
    expect(maxSupermove(runState(1, 2), false)).toBe(8);
    expect(maxSupermove(runState(0, 0), false)).toBe(1);
    // Moving into an empty column: that column does not count.
    expect(maxSupermove(runState(2, 1), true)).toBe(3);
  });

  it('accepts a run within the limit and rejects a longer one', () => {
    const s = runState(2, 1); // limit 6
    expect(isLegalMove(s, { kind: 'move', from: tab(0), to: tab(1), count: 6 })).toBe(false); // 8S onto 10S does not fit anyway
    const s2: FreeCellState = { ...s, tableau: s.tableau.map((p, i) => (i === 1 ? [c('10C')] : p)) };
    expect(isLegalMove(s2, { kind: 'move', from: tab(0), to: tab(1), count: 7 })).toBe(false); // 9H fits but 7 > 6
    const s3: FreeCellState = { ...s, tableau: s.tableau.map((p, i) => (i === 1 ? [c('9D')] : p)) };
    expect(isLegalMove(s3, { kind: 'move', from: tab(0), to: tab(1), count: 6 })).toBe(true); // 8S..3H onto 9D
    const s4 = runState(1, 1); // limit 4
    const s5: FreeCellState = { ...s4, tableau: s4.tableau.map((p, i) => (i === 1 ? [c('9D')] : p)) };
    expect(isLegalMove(s5, { kind: 'move', from: tab(0), to: tab(1), count: 6 })).toBe(false); // 6 > 4
    const s6: FreeCellState = { ...s4, tableau: s4.tableau.map((p, i) => (i === 1 ? [c('7D')] : p)) };
    expect(isLegalMove(s6, { kind: 'move', from: tab(0), to: tab(1), count: 4 })).toBe(true); // 6S..3H onto 7D, 4 ≤ 4
    // Into the empty column the limit halves: 3 cards with 2 free cells.
    expect(isLegalMove(s, { kind: 'move', from: tab(0), to: tab(7), count: 3 })).toBe(true);
    expect(isLegalMove(s, { kind: 'move', from: tab(0), to: tab(7), count: 4 })).toBe(false);
  });

  it('undo after a supermove restores the exact pre-move state; the input is never mutated', () => {
    const base = runState(3, 1); // limit (3 + 1) × 2 = 8
    const s: FreeCellState = { ...base, tableau: base.tableau.map((p, i) => (i === 1 ? [c('10C')] : p)) };
    const snapshot = structuredClone(s);
    const move = { kind: 'move', from: tab(0), to: tab(1), count: 7 } as const; // 9H..3H onto 10C
    const history = History.push(History.empty<FreeCellState>(), s);
    const next = applyMove(s, move);
    expect(next.tableau[1]).toHaveLength(8);
    expect(next.tableau[0]).toEqual([]);
    expect(s).toEqual(snapshot);
    const undone = History.undo(history)!;
    expect(undone.state).toEqual(snapshot);
    expect(undone.state.tableau[0]).toHaveLength(7);
    expect(undone.state.tableau[1]).toEqual([c('10C')]);
  });

  it('lists a cell card to an empty column', () => {
    const s = emptyFreeCell({ cells: [null, c('5H'), null, null], tableau: [[c('KC')], [], [c('2D')], [c('QD')], [c('JD')], [c('9D')], [c('8D')], [c('7D')]] });
    expect(legalMoves(s)).toContainEqual({ kind: 'move', from: cell(1), to: tab(1), count: 1 });
  });

  it('lets one card go into a free cell and back', () => {
    const s = emptyFreeCell({ tableau: [[c('5H')], [c('6S')], [], [], [], [], [], []] });
    const inCell = applyMove(s, { kind: 'move', from: tab(0), to: cell(2), count: 1 });
    expect(inCell.cells[2]).toEqual(c('5H'));
    expect(isLegalMove(inCell, { kind: 'move', from: tab(1), to: cell(2), count: 1 })).toBe(false); // occupied
    expect(isLegalMove(inCell, { kind: 'move', from: cell(2), to: tab(1), count: 1 })).toBe(true);
  });
});

describe('FreeCell foundations', () => {
  it('auto-moves safe cards from columns and cells; undo restores the previous state', () => {
    const s = emptyFreeCell({
      cells: [c('AC'), null, null, null],
      tableau: [[c('KH'), c('2C')], [c('3D')], [c('AD'), c('9S')], [], [], [], [], []],
    });
    const moves = autoFoundation(s);
    let next = s;
    for (const m of moves) next = applyMove(next, m);
    expect(next.foundations.flat().map(cardCode).sort()).toEqual(['2C', 'AC']);
    expect(next.cells).toEqual([null, null, null, null]);
    expect(isLegalMove(next, { kind: 'move', from: fnd(0), to: tab(3), count: 1 })).toBe(false);
  });

  it('can auto-complete when every column is ordered', () => {
    expect(canAutoComplete(emptyFreeCell({ tableau: [[c('KD'), c('9S'), c('2H')], [], [], [], [], [], [], []] }))).toBe(true);
    expect(canAutoComplete(emptyFreeCell({ tableau: [[c('2H'), c('KD')], [], [], [], [], [], [], []] }))).toBe(false);
  });

  it('is won exactly when all 52 cards are on the foundations', () => {
    expect(isWon(emptyFreeCell({ foundations: ['C', 'D', 'H', 'S'].map(fullSuit) }))).toBe(true);
    expect(isWon(dealFreeCell(1))).toBe(false);
  });

  it('lists only legal moves', () => {
    const s = dealFreeCell(1);
    const moves = legalMoves(s);
    expect(moves.length).toBeGreaterThan(0);
    for (const m of moves) expect(isLegalMove(s, m)).toBe(true);
  });
});
