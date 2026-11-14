import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, saveSession } from './arcade';
import { fromState, toSaved } from './logic/game';
import type { SolitaireState } from './logic/types';
import { DOUBLE_TAP_MS, SESSION_SCHEMA, SolitaireGame } from './SolitaireGame';
import { klondikePosition } from './test/fixtures';
import { setCoarsePointer } from './test/touchEnv';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('en', { silent: true });
  vi.useFakeTimers();
  setCoarsePointer(true);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const pileEl = (pile: string, index = 0) => document.querySelector<HTMLElement>(`[data-pile="${pile}"][data-index="${index}"]`)!;
const cardsIn = (pile: string, index = 0) =>
  [...pileEl(pile, index).querySelectorAll('[data-card]')].map((el) => el.getAttribute('data-card')).join(' ');
const cardEl = (code: string, pile = 'tableau', index = 0) =>
  pileEl(pile, index).querySelector(`[data-card="${code}"]`)!.parentElement as HTMLElement;
const status = () => screen.getByRole('status').textContent ?? '';
const foundations = () => [0, 1, 2, 3].map((i) => cardsIn('foundation', i)).join('|');

/** A finger tap on a card: pointer down and up without travel, then the click the browser sends. */
function tapCard(el: HTMLElement) {
  act(() => void fireEvent.pointerDown(el, { clientX: 10, clientY: 10, button: 0, pointerId: 1, pointerType: 'touch' }));
  act(() => void fireEvent.pointerUp(window, { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch' }));
  act(() => void fireEvent.click(el));
}
/** A finger tap on an empty spot of a pile (no card under it). */
const tapPile = (el: HTMLElement) => act(() => void fireEvent.click(el));

function resume(state: SolitaireState) {
  saveSession('solitaire', { schema: SESSION_SCHEMA, data: toSaved(fromState(state)), seconds: 10, score: 0 });
  render(<SolitaireGame />);
  key('p');
  expect(screen.queryByRole('dialog')).toBeNull();
}

const POSITION = () => klondikePosition({ tableau: ['8S', '7H', 'KD', '', '9C'], waste: 'AH' });

describe('Solitaire touch controls', () => {
  it('marks the table as a gesture board', () => {
    render(<SolitaireGame />);
    expect(document.querySelector('.arc-board-touch [data-testid="solitaire-table"]')).toBeTruthy();
  });

  it('a tap selects a card without moving it', () => {
    resume(POSITION());
    tapCard(cardEl('7H', 'tableau', 1));
    expect(cardsIn('tableau', 1)).toBe('7H');
    expect(cardsIn('tableau', 0)).toBe('8S');
    expect(status()).toMatch(/Seven of hearts selected — tap where it should go/);
    expect(cardEl('7H', 'tableau', 1).querySelector('.arc-card--selected')).toBeTruthy();
  });

  it('tapping a destination card moves the selection there', () => {
    resume(POSITION());
    tapCard(cardEl('7H', 'tableau', 1));
    tapCard(cardEl('8S', 'tableau', 0));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(cardsIn('tableau', 1)).toBe('');
  });

  it('tapping an empty column moves the selection there', () => {
    resume(POSITION());
    tapCard(cardEl('KD', 'tableau', 2));
    tapPile(pileEl('tableau', 3));
    expect(cardsIn('tableau', 3)).toBe('KD');
    expect(cardsIn('tableau', 2)).toBe('');
  });

  it('a tapped run moves together; an illegal target re-selects or keeps the pick', () => {
    resume(klondikePosition({ tableau: ['9C 8H', '9H', '', '10D'] }));
    tapCard(cardEl('9H', 'tableau', 1));
    tapCard(cardEl('8H', 'tableau', 0));
    // 9H cannot go on 8H: the tapped card becomes the new selection instead.
    expect(status()).toMatch(/Eight of hearts selected/);
    tapCard(cardEl('9C', 'tableau', 0));
    expect(status()).toMatch(/2 cards from Nine of clubs selected/);
    // An empty Klondike column takes only a king: nothing moves, the run stays picked.
    tapPile(pileEl('tableau', 2));
    expect(cardsIn('tableau', 0)).toBe('9C 8H');
    expect(status()).toMatch(/do not fit/);
    tapCard(cardEl('10D', 'tableau', 3));
    expect(cardsIn('tableau', 3)).toBe('10D 9C 8H');
    expect(cardsIn('tableau', 0)).toBe('');
  });

  it('a double tap sends the card to a foundation', () => {
    resume(POSITION());
    const ace = cardEl('AH', 'waste');
    tapCard(ace);
    expect(foundations()).toBe('|||');
    tapCard(ace);
    expect(foundations()).toContain('AH');
    expect(cardsIn('waste')).toBe('');
  });

  it('two taps further apart than the double-tap time just drop the selection', () => {
    resume(POSITION());
    const ace = cardEl('AH', 'waste');
    tapCard(ace);
    act(() => vi.advanceTimersByTime(DOUBLE_TAP_MS + 50));
    tapCard(ace);
    expect(foundations()).toBe('|||');
    expect(status()).not.toMatch(/selected/);
  });

  it('tapping the table background drops the selection', () => {
    resume(POSITION());
    tapCard(cardEl('7H', 'tableau', 1));
    act(() => void fireEvent.click(screen.getByTestId('solitaire-table')));
    expect(status()).not.toMatch(/selected/);
  });

  it('tapping the stock draws', () => {
    resume(POSITION());
    const before = Number(pileEl('stock').getAttribute('data-count'));
    tapPile(pileEl('stock'));
    expect(Number(pileEl('stock').getAttribute('data-count'))).toBe(before - 1);
  });

  it('a finger drag still moves a card', () => {
    resume(POSITION());
    const card = cardEl('7H', 'tableau', 1);
    document.elementFromPoint = vi.fn(() => pileEl('tableau', 0));
    act(() => void fireEvent.pointerDown(card, { clientX: 10, clientY: 10, button: 0, pointerId: 1, pointerType: 'touch' }));
    act(() => void fireEvent.pointerMove(window, { clientX: 40, clientY: 70, pointerId: 1, pointerType: 'touch' }));
    act(() => void fireEvent.pointerUp(window, { clientX: 40, clientY: 70, pointerId: 1, pointerType: 'touch' }));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
  });

  it('a mouse click still sends the card to the best place at once', () => {
    resume(POSITION());
    const el = cardEl('7H', 'tableau', 1);
    act(() => void fireEvent.pointerDown(el, { clientX: 10, clientY: 10, button: 0, pointerId: 1, pointerType: 'mouse' }));
    act(() => void fireEvent.pointerUp(window, { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'mouse' }));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
  });

  it('shows touch help next to the key help', () => {
    render(<SolitaireGame />);
    expect(screen.getByText('Double-tap')).toBeTruthy();
    expect(screen.getByText('Tap a target')).toBeTruthy();
  });

  it('the full-screen button toggles the immersive mode', () => {
    render(<SolitaireGame />);
    fireEvent.click(screen.getByRole('button', { name: /^Full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: /Exit full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBeUndefined();
  });
});
