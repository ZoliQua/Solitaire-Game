import { describe, expect, it } from 'vitest';
import { klondikePosition, nearlyWonKlondike, suitUpTo } from '../test/fixtures';
import { cardCode } from './deck';
import {
  autoComplete,
  bestMove,
  findHint,
  fromState,
  HISTORY_CAP,
  isSavedGame,
  MODES,
  modeOf,
  newGame,
  playMove,
  toSaved,
  undoGame,
} from './game';
import { isLegalMove, isWon } from './moves';
import type { CardFace, KlondikeState, Loc, Move } from './types';

const tab = (index: number) => ({ pile: 'tableau', index }) as const;
const fnd = (index: number) => ({ pile: 'foundation', index }) as const;
const codes = (cards: readonly CardFace[]) => cards.map(cardCode).join(' ');
const mv = (from: Loc, to: Loc, count = 1): Move => ({ kind: 'move', from, to, count });

describe('modes', () => {
  it('deals every mode with its own variant settings', () => {
    for (const mode of MODES) {
      const g = newGame(mode, 5);
      expect(modeOf(g.state)).toBe(mode);
      expect(g.moves).toBe(0);
      expect(g.undos).toBe(0);
      expect(g.history.past).toHaveLength(0);
    }
    expect(newGame('klondike3', 1).state).toMatchObject({ variant: 'klondike', draw: 3 });
    expect(newGame('spider2', 1).state).toMatchObject({ variant: 'spider', suits: 2 });
    expect(newGame('freecell', 617).state).toMatchObject({ variant: 'freecell', dealNumber: 617 });
  });
});

describe('playMove', () => {
  const base = () => fromState(klondikePosition({ tableau: ['8S', '7H', 'KD'] }));

  it('plays a legal move, counts it and remembers the previous state', () => {
    const g = base();
    const next = playMove(g, mv(tab(1), tab(0)));
    expect(codes(next.state.tableau[0]!)).toBe('8S 7H');
    expect(next.state.tableau[1]).toHaveLength(0);
    expect(next.moves).toBe(1);
    expect(next.history.past).toEqual([g.state]);
  });

  it('returns the same game for an illegal move', () => {
    const g = base();
    expect(playMove(g, mv(tab(1), tab(2)))).toBe(g);
  });

  it('sends safe cards home after a move, as one undo step', () => {
    const g = fromState(klondikePosition({ tableau: ['_9C AH', 'KD', '2H'] }));
    // The ace goes home by hand; the 2H (always safe) follows on its own.
    const next = playMove(g, mv(tab(0), fnd(0)));
    expect(codes(next.state.foundations[0]!)).toBe('AH 2H');
    expect(next.state.tableau[2]).toHaveLength(0);
    const back = undoGame(next);
    expect(back.state).toEqual(g.state);
    expect(back.undos).toBe(1);
  });

  it('does not send a card straight back home after a foundation → tableau move', () => {
    const g = fromState(klondikePosition({ tableau: ['3H'], foundations: ['AS 2S'] }));
    const next = playMove(g, mv(fnd(0), tab(0)));
    expect(codes(next.state.tableau[0]!)).toBe('3H 2S');
    expect(codes(next.state.foundations[0]!)).toBe('AS');
  });

  it(`keeps at most ${HISTORY_CAP} undo steps`, () => {
    let g = fromState(klondikePosition({ tableau: [], stock: 'KS', fillStock: false }) as KlondikeState);
    for (let i = 0; i < HISTORY_CAP + 30; i++) g = playMove(g, { kind: 'stock' });
    expect(g.history.past).toHaveLength(HISTORY_CAP);
    expect(g.moves).toBe(HISTORY_CAP + 30);
  });
});

describe('undoGame', () => {
  it('does nothing without history', () => {
    const g = newGame('klondike1', 3);
    expect(undoGame(g)).toBe(g);
  });
});

describe('autoComplete', () => {
  it('finishes a nearly won Klondike in one undoable step', () => {
    const g = fromState(nearlyWonKlondike());
    const done = autoComplete(g);
    expect(isWon(done.state)).toBe(true);
    expect(done.history.past).toEqual([g.state]);
    expect(done.moves).toBe(1);
  });

  it('is a no-op when the game cannot auto-complete', () => {
    const g = newGame('klondike1', 3);
    expect(autoComplete(g)).toBe(g);
  });
});

describe('bestMove (click-to-move)', () => {
  it('prefers the foundation for a single card', () => {
    const s = klondikePosition({ tableau: ['3D', '2D', '4C'], foundations: ['AD'] });
    expect(bestMove(s, tab(1), 1)).toEqual(mv(tab(1), fnd(0)));
  });

  it('then the first column that takes it', () => {
    const s = klondikePosition({ tableau: ['8S', '_2C 7H', '', '8C'] });
    expect(bestMove(s, tab(1), 1)).toEqual(mv(tab(1), tab(0)));
  });

  it('moves a whole run and returns null when nothing fits', () => {
    const s = klondikePosition({ tableau: ['9H', '_3C 8S 7H', 'KD'] });
    expect(bestMove(s, tab(1), 2)).toEqual(mv(tab(1), tab(0), 2));
    expect(bestMove(s, tab(2), 1)).toBeNull();
  });
});

describe('findHint', () => {
  it('suggests a foundation move first', () => {
    const s = klondikePosition({ tableau: ['8S', '7H', 'AC'] });
    expect(findHint(s)).toEqual(mv(tab(2), { pile: 'foundation', index: 0 }));
  });

  it('suggests a move that reveals a face-down card over a lateral one', () => {
    const s = klondikePosition({ tableau: ['8S', '_3C 7H', '8C', 'KD'] });
    const hint = findHint(s);
    expect(hint).not.toBeNull();
    expect(hint && hint.kind === 'move' && hint.from).toEqual(tab(1));
  });

  it('falls back to the stock and returns legal moves only', () => {
    const s = klondikePosition({ tableau: ['KD'] });
    expect(findHint(s)).toEqual({ kind: 'stock' });
    for (const mode of MODES) {
      const g = newGame(mode, 11);
      const h = findHint(g.state);
      if (h) expect(isLegalMove(g.state, h)).toBe(true);
    }
  });

  it('never suggests moving a run between two equal places', () => {
    const s = klondikePosition({ tableau: ['8S 7H', '8C'] });
    expect(findHint(s)).toEqual({ kind: 'stock' });
  });
});

describe('saves', () => {
  it('round-trips through the validator and rejects broken data', () => {
    let g = newGame('spider4', 9);
    g = playMove(g, { kind: 'stock' });
    const saved = JSON.parse(JSON.stringify(toSaved(g)));
    expect(isSavedGame(saved)).toBe(true);
    expect(isSavedGame({ ...saved, mode: 'klondike1' })).toBe(false);
    expect(isSavedGame({ ...saved, state: { ...saved.state, stock: [] } })).toBe(false);
    expect(isSavedGame({ ...saved, undos: -1 })).toBe(false);
    expect(isSavedGame(null)).toBe(false);
    const k = toSaved(fromState(klondikePosition({ tableau: [suitUpTo('S', '3')] })));
    expect(isSavedGame(JSON.parse(JSON.stringify(k)))).toBe(true);
  });
});
