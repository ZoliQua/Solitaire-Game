import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSession, saveSession, type ArcadeGameProps } from './arcade';
import { fromState, toSaved, type SavedGame } from './logic/game';
import type { SolitaireState } from './logic/types';
import { SESSION_SCHEMA, SolitaireGame } from './SolitaireGame';
import { klondikePosition, nearlyWonKlondike } from './test/fixtures';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const key = (k: string, init: KeyboardEventInit = {}) => act(() => void fireEvent.keyDown(window, { key: k, ...init }));
const pileEl = (pile: string, index = 0) => document.querySelector<HTMLElement>(`[data-pile="${pile}"][data-index="${index}"]`)!;
const cardsIn = (pile: string, index = 0) =>
  [...pileEl(pile, index).querySelectorAll('[data-card]')].map((el) => el.getAttribute('data-card')).join(' ');
const cardEl = (code: string, pile = 'tableau', index = 0) =>
  pileEl(pile, index).querySelector(`[data-card="${code}"]`)!.parentElement as HTMLElement;
const stat = (label: string) => screen.getByText(label).parentElement?.textContent?.replace(label, '');

/** Starts the game from a saved position and resumes it. */
function resume(state: SolitaireState, props: ArcadeGameProps = {}) {
  const data: SavedGame = toSaved(fromState(state));
  saveSession('solitaire', { schema: SESSION_SCHEMA, data, seconds: 10, score: 0 });
  const view = render(<SolitaireGame {...props} />);
  expect(screen.getByRole('dialog', { name: 'Welcome back' })).toBeTruthy();
  key('p');
  expect(screen.queryByRole('dialog')).toBeNull();
  return view;
}

/** A pointer drag from a card to a pile (jsdom has no layout: the drop target is what elementFromPoint returns). */
function dragTo(card: HTMLElement, target: HTMLElement) {
  document.elementFromPoint = vi.fn(() => target);
  act(() => void fireEvent.pointerDown(card, { clientX: 10, clientY: 10, button: 0, pointerId: 1 }));
  act(() => void fireEvent.pointerMove(window, { clientX: 40, clientY: 70, pointerId: 1 }));
  expect(card.style.transform).toBe('translate(30px, 60px)');
  act(() => void fireEvent.pointerUp(window, { clientX: 40, clientY: 70, pointerId: 1 }));
}

function tap(card: HTMLElement) {
  act(() => void fireEvent.pointerDown(card, { clientX: 10, clientY: 10, button: 0, pointerId: 1 }));
  act(() => void fireEvent.pointerUp(window, { clientX: 11, clientY: 10, pointerId: 1 }));
}

const POSITION = () => klondikePosition({ tableau: ['8S', '7H', 'KD'] });

describe('<SolitaireGame />', () => {
  it('starts with the Klondike deal behind a Start overlay', () => {
    render(<SolitaireGame />);
    expect(screen.getByRole('dialog', { name: 'Solitaire' })).toBeTruthy();
    expect(document.querySelectorAll('[data-pile="tableau"]')).toHaveLength(7);
    key('Enter');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stat('Moves')).toBe('0');
  });

  it('a dragged valid card moves there', () => {
    resume(POSITION());
    dragTo(cardEl('7H', 'tableau', 1), pileEl('tableau', 0));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(cardsIn('tableau', 1)).toBe('');
    expect(stat('Moves')).toBe('1');
  });

  it('an invalid drop snaps the card back', () => {
    resume(POSITION());
    const card = cardEl('7H', 'tableau', 1);
    dragTo(card, pileEl('tableau', 2));
    expect(cardsIn('tableau', 1)).toBe('7H');
    expect(cardsIn('tableau', 2)).toBe('KD');
    expect(cardEl('7H', 'tableau', 1).style.transform).toBe('');
    expect(stat('Moves')).toBe('0');
    expect(screen.getByRole('status').textContent).toMatch(/do not fit/);
  });

  it('click-to-move sends a card to the best legal place', () => {
    resume(POSITION());
    tap(cardEl('7H', 'tableau', 1));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
  });

  it('clicking a card that cannot move leaves the table alone', () => {
    resume(POSITION());
    tap(cardEl('KD', 'tableau', 2));
    expect(cardsIn('tableau', 2)).toBe('KD');
    expect(screen.getByRole('status').textContent).toMatch(/King of diamonds cannot go anywhere/);
  });

  it('the Undo button takes the move back', () => {
    resume(POSITION());
    const undoBtn = screen.getByRole('button', { name: /^Undo/ }) as HTMLButtonElement;
    expect(undoBtn.disabled).toBe(true);
    tap(cardEl('7H', 'tableau', 1));
    act(() => void fireEvent.click(undoBtn));
    expect(cardsIn('tableau', 0)).toBe('8S');
    expect(cardsIn('tableau', 1)).toBe('7H');
  });

  it('Ctrl+Z takes the last move back', () => {
    resume(POSITION());
    tap(cardEl('7H', 'tableau', 1));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(cardsIn('tableau', 1)).toBe('');
    key('z', { ctrlKey: true });
    expect(cardsIn('tableau', 0)).toBe('8S');
    expect(cardsIn('tableau', 1)).toBe('7H');
  });

  it('draw three fans the waste but only its top card plays', () => {
    resume(klondikePosition({ tableau: ['8S', '6C'], waste: 'QH 5H 7H', draw: 3 }));
    expect(cardsIn('waste')).toBe('QH 5H 7H');
    // A card under the top one does not even lift.
    const under = cardEl('5H', 'waste');
    act(() => void fireEvent.pointerDown(under, { clientX: 10, clientY: 10, button: 0, pointerId: 1 }));
    act(() => void fireEvent.pointerMove(window, { clientX: 60, clientY: 90, pointerId: 1 }));
    expect(under.style.transform).toBe('');
    expect(cardEl('7H', 'waste').style.transform).toBe('');
    act(() => void fireEvent.pointerUp(window, { clientX: 60, clientY: 90, pointerId: 1 }));
    tap(under);
    expect(cardsIn('waste')).toBe('QH 5H 7H');
    tap(cardEl('7H', 'waste'));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(cardsIn('waste')).toBe('QH 5H');
  });

  it('auto-complete finishes a nearly won Klondike and the win calls onGameOver(score)', () => {
    const onGameOver = vi.fn();
    const onRunEnd = vi.fn();
    resume(nearlyWonKlondike(), { onGameOver, onRunEnd });
    expect(screen.getByRole('status').textContent).toMatch(/press A to finish/);
    key('a');
    expect(screen.getByRole('dialog', { name: 'You won!' })).toBeTruthy();
    // 10 s on a 300 s par, no undo: the full 1000 for Klondike draw 1.
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(1000);
    expect(onRunEnd).toHaveBeenCalledWith(expect.objectContaining({ outcome: 'win', score: 1000 }));
    expect(stat('Score')).toBe('1,000');
    // A won game is not kept as a save.
    expect(loadSession('solitaire', SESSION_SCHEMA)).toBeNull();
  });

  it('switching the mode mid-game asks first in the page, never with window.confirm', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    render(<SolitaireGame />);
    key('Enter');
    key('d');
    expect(stat('Moves')).toBe('1');
    act(() => void fireEvent.click(screen.getByRole('button', { name: 'Spider' })));
    const dialog = screen.getByRole('dialog', { name: 'Switch to Spider · 1 suit?' });
    act(() => void fireEvent.click(within(dialog).getByRole('button', { name: /Keep playing/ })));
    expect(document.querySelectorAll('[data-pile="tableau"]')).toHaveLength(7);
    expect(stat('Moves')).toBe('1');

    act(() => void fireEvent.click(screen.getByRole('button', { name: 'Spider' })));
    act(() => void fireEvent.click(screen.getByRole('button', { name: /^Switch/ })));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelectorAll('[data-pile="tableau"]')).toHaveLength(10);
    expect(stat('Moves')).toBe('0');
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('Enter on a focused "Keep playing" button keeps the game', () => {
    render(<SolitaireGame />);
    key('Enter');
    key('d');
    act(() => void fireEvent.click(screen.getByRole('button', { name: 'Spider' })));
    const dialog = screen.getByRole('dialog', { name: 'Switch to Spider · 1 suit?' });
    const keep = within(dialog).getByRole('button', { name: /Keep playing/ });
    keep.focus();
    act(() => void fireEvent.keyDown(keep, { key: 'Enter' }));
    expect(document.querySelectorAll('[data-pile="tableau"]')).toHaveLength(7);
    expect(stat('Moves')).toBe('1');
    // The browser then activates the focused button itself.
    act(() => void fireEvent.click(keep));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelectorAll('[data-pile="tableau"]')).toHaveLength(7);
    expect(stat('Moves')).toBe('1');
  });

  it('the clock stops and the status reports paused while a confirm card is open', () => {
    const onStatusChange = vi.fn();
    render(<SolitaireGame onStatusChange={onStatusChange} />);
    key('Enter');
    key('d');
    act(() => void vi.advanceTimersByTime(2100));
    expect(stat('Time')).toBe('00:02');
    act(() => void fireEvent.click(screen.getByRole('button', { name: 'Spider' })));
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'paused' }));
    act(() => void vi.advanceTimersByTime(10_000));
    expect(stat('Time')).toBe('00:02');
    key('Escape');
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'running' }));
    act(() => void vi.advanceTimersByTime(1100));
    expect(stat('Time')).toBe('00:03');
  });

  it('switches at once when no move was made yet', () => {
    render(<SolitaireGame />);
    act(() => void fireEvent.click(screen.getByRole('button', { name: 'FreeCell' })));
    expect(document.querySelectorAll('[data-pile="tableau"]')).toHaveLength(8);
    expect(document.querySelectorAll('[data-pile="cell"]')).toHaveLength(4);
    expect(localStorage.getItem('solitaire.mode')).toBe('freecell');
  });

  it('plays with the keyboard: Enter picks a pile, Enter on another pile drops', () => {
    resume(POSITION());
    act(() => void fireEvent.keyDown(pileEl('tableau', 1), { key: 'Enter' }));
    expect(screen.getByRole('status').textContent).toMatch(/Seven of hearts picked up/);
    act(() => void fireEvent.keyDown(pileEl('tableau', 0), { key: 'Enter' }));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    key('u');
    expect(cardsIn('tableau', 1)).toBe('7H');
  });

  it('H highlights a hint without moving anything', () => {
    resume(klondikePosition({ tableau: ['8S', '_3C 7H'] }));
    key('h');
    expect(pileEl('tableau', 1).getAttribute('data-hint')).toBe('from');
    expect(pileEl('tableau', 0).getAttribute('data-hint')).toBe('to');
    expect(screen.getByRole('status').textContent).toMatch(/Hint: Seven of hearts → column 1/);
    expect(cardsIn('tableau', 1)).toBe('7H');
    act(() => void vi.advanceTimersByTime(3100));
    expect(pileEl('tableau', 1).getAttribute('data-hint')).toBeNull();
  });

  it('clicking the stock draws a card', () => {
    resume(klondikePosition({ tableau: ['KD'], stock: '4C', fillStock: true }));
    act(() => void fireEvent.click(pileEl('stock')));
    expect(cardsIn('waste')).toBe('4C');
  });
});
