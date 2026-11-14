import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyLang, LANGS, saveSession } from './arcade';
import { MESSAGES } from './i18n';
import { fromState, toSaved } from './logic/game';
import type { SolitaireState } from './logic/types';
import { SESSION_SCHEMA, SolitaireGame } from './SolitaireGame';
import { klondikePosition, nearlyWonKlondike } from './test/fixtures';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  act(() => applyLang('en'));
  vi.useRealTimers();
});

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const stat = (label: string) => screen.getByText(label).parentElement?.textContent?.replace(label, '');
const pileEl = (pile: string, index = 0) => document.querySelector<HTMLElement>(`[data-pile="${pile}"][data-index="${index}"]`)!;
const cardsIn = (pile: string, index = 0) =>
  [...pileEl(pile, index).querySelectorAll('[data-card]')].map((el) => el.getAttribute('data-card')).join(' ');

function resume(state: SolitaireState) {
  saveSession('solitaire', { schema: SESSION_SCHEMA, data: toSaved(fromState(state)), seconds: 10, score: 0 });
  render(<SolitaireGame />);
  key('p');
}

describe('Solitaire i18n', () => {
  it('has every key in en, hu and de with a non-empty value', () => {
    const keys = Object.keys(MESSAGES.en).sort();
    expect(keys.length).toBeGreaterThan(0);
    for (const lang of LANGS) {
      expect(Object.keys(MESSAGES[lang]).sort()).toEqual(keys);
      for (const k of keys) expect((MESSAGES[lang] as Record<string, string>)[k]!.trim()).not.toBe('');
    }
  });

  it('is really translated (only names and pure templates may match English)', () => {
    const same = (lang: 'hu' | 'de') =>
      (Object.keys(MESSAGES.en) as (keyof typeof MESSAGES.en)[]).filter((k) => MESSAGES[lang][k] === MESSAGES.en[k]);
    expect(same('hu').every((k) => ['variantKlondike', 'variantFreecell', 'idleBody'].includes(k))).toBe(true);
    expect(same('de').every((k) => ['variantKlondike', 'variantSpider', 'variantFreecell', 'idleBody'].includes(k))).toBe(true);
  });

  it('uses the agreed mode, variant and deck names', () => {
    expect([MESSAGES.hu.variantKlondike, MESSAGES.hu.variantSpider, MESSAGES.hu.variantFreecell]).toEqual(['Klondike', 'Pók', 'FreeCell']);
    expect([MESSAGES.de.variantKlondike, MESSAGES.de.variantSpider, MESSAGES.de.variantFreecell]).toEqual(['Klondike', 'Spider', 'FreeCell']);
    expect([MESSAGES.hu.draw1, MESSAGES.hu.draw3]).toEqual(['Egyes húzás', 'Hármas húzás']);
    expect([MESSAGES.hu.suits1, MESSAGES.hu.suits2, MESSAGES.hu.suits4]).toEqual(['1 szín', '2 szín', '4 szín']);
    expect([MESSAGES.de.draw1, MESSAGES.de.draw3]).toEqual(['Eine Karte ziehen', 'Drei Karten ziehen']);
    expect([MESSAGES.de.suits1, MESSAGES.de.suits2, MESSAGES.de.suits4]).toEqual(['1 Farbe', '2 Farben', '4 Farben']);
    expect([MESSAGES.hu.deckColor, MESSAGES.hu.deckGrey, MESSAGES.de.deckColor, MESSAGES.de.deckGrey]).toEqual(['Színes', 'Szürke', 'Farbig', 'Grau']);
  });

  it('names the colour groups explicitly in the Klondike and FreeCell rules (colour-blind friendly)', () => {
    const groups = { en: /red \(♥ ♦\) and black \(♠ ♣\)/, hu: /piros \(♥ ♦\) és fekete \(♠ ♣\)/, de: /rote \(♥ ♦\) und schwarze \(♠ ♣\)/ };
    for (const lang of LANGS) {
      expect(MESSAGES[lang].rulesKlondike).toMatch(groups[lang]);
      expect(MESSAGES[lang].rulesFreecell).toMatch(groups[lang]);
      expect(MESSAGES[lang].rulesKlondike).not.toMatch(/alternating colours|váltakozó színnel|wechselnden Farben/);
    }
    expect(MESSAGES.hu.statusPickedRun).toMatch(/^\{n\} lapot vettél fel, az első: \{card\} — /);
  });

  it('renders the German UI after applyLang("de")', () => {
    applyLang('de');
    render(<SolitaireGame />);
    expect(screen.getByRole('dialog', { name: 'Solitär' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Solitär' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Einstellungen' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Eine Karte ziehen' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Farbig' })).toBeTruthy();
    expect(pileEl('tableau', 0).getAttribute('aria-label')).toMatch(/^Spalte 1: /);
  });

  it('switching to Hungarian mid-game keeps the table, moves and clock', () => {
    resume(klondikePosition({ tableau: ['8S', '7H', 'KD'] }));
    act(() => void fireEvent.pointerDown(pileEl('tableau', 1).querySelector('[data-card="7H"]')!.parentElement!, { clientX: 1, clientY: 1, button: 0 }));
    act(() => void fireEvent.pointerUp(window, { clientX: 1, clientY: 1 }));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(stat('Moves')).toBe('1');

    act(() => applyLang('hu'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stat('Lépések')).toBe('1');
    expect(stat('Idő')).toBe('00:10');
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(pileEl('tableau', 0).getAttribute('aria-label')).toBe('1. oszlop: 2 lap, felül: Kőr hetes');
    expect(screen.getByRole('heading', { level: 1, name: 'Pasziánsz' })).toBeTruthy();
  });

  it('formats the score with the language grouping', () => {
    applyLang('de');
    resume(nearlyWonKlondike());
    key('a');
    expect(screen.getByRole('dialog', { name: 'Gewonnen!' }).textContent).toContain('1.000 Punkte');
    expect(stat('Punkte')).toBe('1.000');
  });
});
