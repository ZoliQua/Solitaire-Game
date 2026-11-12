import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dealFreeCell } from '../logic/freecell';
import { applyMove, isLegalMove, isWon } from '../logic/moves';
import type { SolitaireState } from '../logic/types';
import { DEMO_DEAL, DEMO_SCRIPT, parseMove } from './script';
import { DEMO_PAUSE_MS, DEMO_STEP_MS, SolitaireDemo } from './SolitaireDemo';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

const home = (c: HTMLElement) =>
  [...c.querySelectorAll('[data-pile="foundation"]')].reduce((n, el) => n + Number(el.getAttribute('data-count')), 0);
const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe('<SolitaireDemo />', () => {
  it('its scripted solution is legal step by step and wins the deal', () => {
    let s: SolitaireState = dealFreeCell(DEMO_DEAL);
    for (const code of DEMO_SCRIPT) {
      const m = parseMove(code);
      expect(isLegalMove(s, m)).toBe(true);
      s = applyMove(s, m);
    }
    expect(isWon(s)).toBe(true);
  });

  it('plays the deal on the real engine, pauses on the win and loops, writing nothing', () => {
    const { container } = render(<SolitaireDemo />);
    expect(container.querySelector('.arc-demo')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelectorAll('[data-pile="tableau"]')).toHaveLength(8);
    expect(container.querySelector('[tabindex]')).toBeNull();
    expect(home(container)).toBe(0);
    for (let i = 0; i < DEMO_SCRIPT.length; i++) tick(DEMO_STEP_MS);
    expect(home(container)).toBe(52);
    tick(DEMO_PAUSE_MS);
    expect(home(container)).toBe(0);
    expect(localStorage.length).toBe(0);
  });

  it('freezes when inactive', () => {
    const { container, rerender } = render(<SolitaireDemo />);
    for (let i = 0; i < 12; i++) tick(DEMO_STEP_MS);
    const snap = container.innerHTML;
    rerender(<SolitaireDemo active={false} />);
    tick(10_000);
    expect(container.innerHTML).toBe(snap);
    expect(localStorage.length).toBe(0);
  });
});
