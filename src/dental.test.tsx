import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, saveSession } from './arcade';
import { Table } from './components/Table';
import { dealKlondike } from './logic/klondike';
import { fromState, toSaved } from './logic/game';
import { SESSION_SCHEMA, SolitaireGame } from './SolitaireGame';
import { klondikePosition, nearlyWonKlondike } from './test/fixtures';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  applyDental(false, { silent: true });
  vi.useRealTimers();
});

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const table = () => screen.getByTestId('solitaire-table');
const stat = (label: string) => screen.getByText(label).parentElement?.textContent?.replace(label, '');
const cardsIn = (pile: string, index = 0) =>
  [...document.querySelectorAll(`[data-pile="${pile}"][data-index="${index}"] [data-card]`)].map((el) => el.getAttribute('data-card')).join(' ');

describe('dental mode', () => {
  it('draws the card backs with a tooth and teeth in the empty foundations', () => {
    applyDental(true);
    render(<Table state={dealKlondike(4, 1)} deck="color" dental interactive={false} />);
    expect(table().getAttribute('data-dental')).toBe('true');
    // 21 face-down cards in the columns plus the stock's top two (the stock draws two so the next one shows underneath).
    expect(screen.getAllByTestId('card-back-tooth').length).toBe(23);
    expect(screen.getAllByTestId('foundation-tooth')).toHaveLength(4);
    expect(screen.queryByTestId('card-back-classic')).toBeNull();
  });

  it('with dental mode off the classic backs and foundations are drawn', () => {
    render(<Table state={dealKlondike(4, 1)} deck="color" dental={false} interactive={false} />);
    expect(table().getAttribute('data-dental')).toBe('false');
    expect(screen.queryByTestId('card-back-tooth')).toBeNull();
    expect(screen.queryByTestId('foundation-tooth')).toBeNull();
    expect(screen.getAllByTestId('card-back-classic').length).toBeGreaterThan(0);
  });

  it('toggling dental mode mid-game keeps the table, moves and clock', () => {
    saveSession('solitaire', {
      schema: SESSION_SCHEMA,
      data: toSaved(fromState(klondikePosition({ tableau: ['8S', '_3C 7H'] }))),
      seconds: 42,
      score: 0,
    });
    render(<SolitaireGame />);
    key('p');
    const card = document.querySelector('[data-pile="tableau"][data-index="1"] [data-card="7H"]')!.parentElement!;
    act(() => void fireEvent.pointerDown(card, { clientX: 1, clientY: 1, button: 0 }));
    act(() => void fireEvent.pointerUp(window, { clientX: 1, clientY: 1 }));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(table().getAttribute('data-dental')).toBe('false');

    act(() => void fireEvent.click(screen.getByRole('checkbox', { name: /Dental mode/ })));
    expect(table().getAttribute('data-dental')).toBe('true');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(cardsIn('tableau', 1)).toBe('3C');
    expect(stat('Moves')).toBe('1');
    expect(stat('Time')).toBe('00:42');
    expect(screen.getAllByTestId('card-back-tooth').length).toBeGreaterThan(0);
    expect(localStorage.getItem('arcade.dental')).toBe('1');
  });

  it('celebrates a win with a dental title', () => {
    applyDental(true);
    saveSession('solitaire', { schema: SESSION_SCHEMA, data: toSaved(fromState(nearlyWonKlondike())), seconds: 5, score: 0 });
    render(<SolitaireGame />);
    key('p');
    key('a');
    expect(screen.getByRole('dialog', { name: 'Every tooth in its place!' })).toBeTruthy();
  });
});
