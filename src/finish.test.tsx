import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, loadSession, saveSession, type ArcadeGameProps } from './arcade';
import { fromState, toSaved } from './logic/game';
import { SESSION_SCHEMA, SolitaireGame } from './SolitaireGame';
import { klondikePosition } from './test/fixtures';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  applyLang('en', { silent: true });
});

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const finishBtn = () => screen.queryByRole('button', { name: 'Befejezés' });
const stat = (label: string) => screen.getByText(label).parentElement?.textContent?.replace(label, '');
const pileEl = (pile: string, index = 0) => document.querySelector<HTMLElement>(`[data-pile="${pile}"][data-index="${index}"]`)!;
const cardsIn = (pile: string, index = 0) =>
  [...pileEl(pile, index).querySelectorAll('[data-card]')].map((el) => el.getAttribute('data-card')).join(' ');
const click = (code: string, index: number) => {
  const el = pileEl('tableau', index).querySelector(`[data-card="${code}"]`)!.parentElement!;
  act(() => void fireEvent.pointerDown(el, { clientX: 1, clientY: 1, button: 0, pointerId: 1 }));
  act(() => void fireEvent.pointerUp(window, { clientX: 1, clientY: 1, pointerId: 1 }));
};

function resume(props: ArcadeGameProps = {}) {
  saveSession('solitaire', {
    schema: SESSION_SCHEMA,
    data: toSaved(fromState(klondikePosition({ tableau: ['8S', '7H', 'KD'] }))),
    seconds: 10,
    score: 0,
  });
  render(<SolitaireGame {...props} />);
  key('p');
  expect(screen.queryByRole('dialog')).toBeNull();
}

describe('Solitaire finish early', () => {
  it('is hidden before the game starts and visible once it runs', () => {
    render(<SolitaireGame />);
    expect(finishBtn()).toBeNull();
    key('Enter');
    expect(finishBtn()).toBeTruthy();
  });

  it('is visible after the first move of a resumed game', () => {
    resume();
    click('7H', 1);
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(finishBtn()).toBeTruthy();
  });

  it('confirms with the Score panel value 0, ranks it once and shows the finished card', () => {
    const onGameOver = vi.fn();
    resume({ onGameOver });
    click('7H', 1);
    expect(stat('Pont')).toBe('0');
    fireEvent.click(finishBtn()!);
    expect(screen.getByRole('alertdialog').textContent).toContain('Befejezed a játékot? 0 pont kerül a ranglistára.');
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(0, { finished: true });
    expect(screen.getByRole('dialog', { name: 'Idő előtt befejezve' })).toBeTruthy();
    expect(loadSession('solitaire', SESSION_SCHEMA)).toBeNull();
    expect(finishBtn()).toBeNull();
    act(() => vi.advanceTimersByTime(5000));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(loadSession('solitaire', SESSION_SCHEMA)).toBeNull();
  });

  it('finishing at 0 straight after the start ranks 0 once', () => {
    const onGameOver = vi.fn();
    render(<SolitaireGame onGameOver={onGameOver} />);
    key('Enter');
    fireEvent.click(finishBtn()!);
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(0, { finished: true });
  });

  it('a finished game takes no moves; the card starts a new deal', () => {
    resume();
    fireEvent.click(finishBtn()!);
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    click('7H', 1);
    expect(cardsIn('tableau', 1)).toBe('7H');
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Idő előtt befejezve' })).getByRole('button', { name: /Új játszma/ }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(finishBtn()).toBeTruthy();
    expect(stat('Lépések')).toBe('0');
  });

  it('Cancel changes nothing, and the clock stands still while the confirm is open', () => {
    const onGameOver = vi.fn();
    resume({ onGameOver });
    click('7H', 1);
    fireEvent.click(finishBtn()!);
    act(() => vi.advanceTimersByTime(5000));
    expect(stat('Idő')).toBe('00:10');
    fireEvent.click(screen.getByRole('button', { name: 'Mégse' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onGameOver).not.toHaveBeenCalled();
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(stat('Lépések')).toBe('1');
    expect(loadSession('solitaire', SESSION_SCHEMA)).not.toBeNull();
  });
});
