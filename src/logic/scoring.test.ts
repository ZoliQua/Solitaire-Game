import { describe, expect, it } from 'vitest';
import { MODES } from './game';
import { BASE_POINTS, PAR_SECONDS, SOLITAIRE_MAX_SCORE, solitaireScore, timeFactor, undoFactor } from './scoring';

describe('solitaire scoring', () => {
  it('has the base points and pars of the spec', () => {
    expect(BASE_POINTS).toEqual({ klondike1: 1000, klondike3: 1500, spider1: 1000, spider2: 2000, spider4: 4000, freecell: 2000 });
    expect(PAR_SECONDS).toEqual({ klondike: 300, spider: 600, freecell: 420 });
    expect(SOLITAIRE_MAX_SCORE).toBe(4000);
    expect(Math.max(...MODES.map((m) => solitaireScore(m, 1, 0)))).toBe(SOLITAIRE_MAX_SCORE);
  });

  it('clamps the time factor between 0.25 and 1', () => {
    expect(timeFactor('klondike', 120)).toBe(1);
    expect(timeFactor('klondike', 300)).toBe(1);
    expect(timeFactor('klondike', 600)).toBe(0.5);
    expect(timeFactor('klondike', 5000)).toBe(0.25);
    expect(timeFactor('spider', 0)).toBe(1);
  });

  it('takes 2 % per undo down to half', () => {
    expect(undoFactor(0)).toBe(1);
    expect(undoFactor(5)).toBeCloseTo(0.9);
    expect(undoFactor(25)).toBe(0.5);
    expect(undoFactor(80)).toBe(0.5);
  });

  it('multiplies and rounds', () => {
    expect(solitaireScore('klondike1', 200, 0)).toBe(1000);
    expect(solitaireScore('klondike3', 600, 0)).toBe(750);
    expect(solitaireScore('freecell', 840, 3)).toBe(Math.round(2000 * 0.5 * 0.94));
    expect(solitaireScore('spider4', 1200, 30)).toBe(1000);
    expect(solitaireScore('spider2', 100000, 100)).toBe(250);
  });
});
