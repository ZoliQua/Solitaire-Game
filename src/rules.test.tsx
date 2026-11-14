import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, formatClock, formatNumber, saveSession, type Lang } from './arcade';
import { MESSAGES } from './i18n';
import { deal, fromState, HISTORY_CAP, toSaved, type ModeId } from './logic/game';
import { maxSupermove } from './logic/freecell';
import {
  BASE_POINTS,
  PAR_SECONDS,
  SOLITAIRE_MAX_SCORE,
  solitaireScore,
  TIME_FLOOR,
  UNDO_FLOOR,
  UNDO_STEP,
} from './logic/scoring';
import type { FreeCellState, KlondikeState, SpiderState } from './logic/types';
import { SESSION_SCHEMA, SolitaireGame } from './SolitaireGame';
import { klondikePosition } from './test/fixtures';
import { setCoarsePointer } from './test/touchEnv';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers();
  setCoarsePointer(false);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  applyLang('en', { silent: true });
});

const key = (k: string) => act(() => void fireEvent.keyDown(window, { key: k }));
const openRules = () => act(() => void fireEvent.click(screen.getByRole('button', { name: /Szabályok/ })));
const dialog = () => screen.getByRole('dialog', { name: /szabályok|Regeln/ });
const headings = () => within(dialog()).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
const pileEl = (pile: string, index = 0) => document.querySelector<HTMLElement>(`[data-pile="${pile}"][data-index="${index}"]`)!;
const cardsIn = (pile: string, index = 0) =>
  [...pileEl(pile, index).querySelectorAll('[data-card]')].map((el) => el.getAttribute('data-card')).join(' ');

function resume() {
  saveSession('solitaire', {
    schema: SESSION_SCHEMA,
    data: toSaved(fromState(klondikePosition({ tableau: ['8S', '7H', 'KD'] }))),
    seconds: 10,
    score: 0,
  });
  render(<SolitaireGame />);
  key('p');
  expect(screen.queryByRole('dialog')).toBeNull();
}

const MODE_NAMES: Record<Lang, Record<ModeId, string>> = {
  en: {
    klondike1: 'Klondike · Draw 1',
    klondike3: 'Klondike · Draw 3',
    spider1: 'Spider · 1 suit',
    spider2: 'Spider · 2 suits',
    spider4: 'Spider · 4 suits',
    freecell: 'FreeCell',
  },
  hu: {
    klondike1: 'Klondike · Egyes húzás',
    klondike3: 'Klondike · Hármas húzás',
    spider1: 'Pók · 1 szín',
    spider2: 'Pók · 2 szín',
    spider4: 'Pók · 4 szín',
    freecell: 'FreeCell',
  },
  de: {
    klondike1: 'Klondike · Eine Karte ziehen',
    klondike3: 'Klondike · Drei Karten ziehen',
    spider1: 'Spider · 1 Farbe',
    spider2: 'Spider · 2 Farben',
    spider4: 'Spider · 4 Farben',
    freecell: 'FreeCell',
  },
};
const MODES: ModeId[] = ['klondike1', 'klondike3', 'spider1', 'spider2', 'spider4', 'freecell'];
const variant = (m: ModeId) => (m === 'freecell' ? 'freecell' : m.startsWith('spider') ? 'spider' : 'klondike');

/** The scoring sentences, built from the real constants and helpers. */
function scoringSentences(lang: 'hu' | 'de'): string[] {
  const n = (v: number) => formatNumber(v, lang);
  const pct = (f: number) => n(Math.round(f * 100));
  const perMode = MODES.map((m) =>
    lang === 'hu'
      ? `${MODE_NAMES.hu[m]}: ${n(BASE_POINTS[m])} pont, szintidő ${n(PAR_SECONDS[variant(m)] / 60)} perc`
      : `${MODE_NAMES.de[m]}: ${n(BASE_POINTS[m])} Punkte, Richtzeit ${n(PAR_SECONDS[variant(m)] / 60)} Minuten`,
  );
  const undosToFloor = Math.round((1 - UNDO_FLOOR) / UNDO_STEP);
  const example = solitaireScore('klondike1', 600, 5);
  if (lang === 'hu') {
    return [
      ...perMode,
      `de soha nem kevesebb, mint az alap ${pct(TIME_FLOOR)}%-a.`,
      `Minden visszavonás ${pct(UNDO_STEP)}%-ot von le, összesen legfeljebb ${pct(1 - UNDO_FLOOR)}%-ot (${n(undosToFloor)} visszavonás után).`,
      `Példa: ${MODE_NAMES.hu.klondike1} megnyerve ${formatClock(600)} alatt, ${n(5)} visszavonással: ${n(example)} pont.`,
      `A legtöbb elérhető pont ${n(SOLITAIRE_MAX_SCORE)} (${MODE_NAMES.hu.spider4}, szintidőn belül, visszavonás nélkül).`,
      `A Befejezés azonnal lezárja a játszmát ${n(0)} ponttal`,
    ];
  }
  return [
    ...perMode,
    `aber nie unter ${pct(TIME_FLOOR)} % der Basis.`,
    `Jedes Rückgängig kostet ${pct(UNDO_STEP)} %, insgesamt höchstens ${pct(1 - UNDO_FLOOR)} % (nach ${n(undosToFloor)}× Rückgängig).`,
    `Beispiel: ${MODE_NAMES.de.klondike1} gewonnen in ${formatClock(600)} mit ${n(5)}× Rückgängig: ${n(example)} Punkte.`,
    `Die höchste mögliche Punktzahl ist ${n(SOLITAIRE_MAX_SCORE)} (${MODE_NAMES.de.spider4}, in der Richtzeit, ohne Rückgängig).`,
    `Beenden schließt die Partie sofort mit ${n(0)} Punkten ab`,
  ];
}

describe('Solitaire rules dialog', () => {
  it('shows a Rules button; opening mid-game pauses and closing leaves it paused', () => {
    resume();
    openRules();
    expect(screen.getByRole('dialog', { name: 'Pasziánsz — szabályok' })).toBeTruthy();
    act(() => void fireEvent.click(screen.getByRole('button', { name: 'Bezárás' })));
    expect(screen.queryByRole('dialog', { name: /szabályok/ })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Szünet' })).toBeTruthy();
  });

  it('R opens the rules (Solitaire has no other R binding) and pauses the game', () => {
    resume();
    key('r');
    expect(dialog()).toBeTruthy();
    key('Escape');
    expect(screen.queryByRole('dialog', { name: /szabályok/ })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Szünet' })).toBeTruthy();
  });

  it('lists goal, play, rules, scoring, dental in order; mobile only on touch', () => {
    const view = render(<SolitaireGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód']);
    expect(dialog().textContent).toContain('Húzz egy lapot');
    view.unmount();
    setCoarsePointer(true);
    render(<SolitaireGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód', 'Mobilon']);
    const text = dialog().textContent ?? '';
    expect(text).toContain('Koppintás: Lap kijelölése');
    expect(text).toContain('Dupla koppintás: ');
    expect(text).toContain('Teljes képernyő');
    expect(text).toContain('Koppints egy lapra');
  });

  it('reuses the per-variant rule texts in the goal section', () => {
    render(<SolitaireGame />);
    openRules();
    const text = dialog().textContent ?? '';
    expect(text).toContain(`Klondike: ${MESSAGES.hu.rulesKlondike}`);
    expect(text).toContain(`Pók: ${MESSAGES.hu.rulesSpider}`);
    expect(text).toContain(`FreeCell: ${MESSAGES.hu.rulesFreecell}`);
  });

  it('prints the real scoring numbers as full sentences (hu and de)', () => {
    // The constants the sentences rest on, pinned so a change is noticed.
    expect(SOLITAIRE_MAX_SCORE).toBe(Math.max(...Object.values(BASE_POINTS)));
    expect(solitaireScore('spider4', PAR_SECONDS.spider, 0)).toBe(SOLITAIRE_MAX_SCORE);
    expect(solitaireScore('klondike1', 600, 5)).toBe(450);
    render(<SolitaireGame />);
    openRules();
    let text = dialog().textContent ?? '';
    for (const s of scoringSentences('hu')) expect(text).toContain(s);
    expect(text).toContain('Pók · 4 szín: 4000 pont, szintidő 10 perc');
    act(() => applyLang('de'));
    text = dialog().textContent ?? '';
    for (const s of scoringSentences('de')) expect(text).toContain(s);
  });

  it('prints the table rules with the numbers of the real deals', () => {
    const fc = deal('freecell', 1) as FreeCellState;
    const oneEmpty: FreeCellState = { ...fc, tableau: fc.tableau.map((p, i) => (i === 0 ? [] : p)) };
    const spider = deal('spider1', 1) as SpiderState;
    const spiderCards = spider.tableau.flat().length + spider.stock.length;
    render(<SolitaireGame />);
    openRules();
    const text = dialog().textContent ?? '';
    const draw = (m: ModeId) => (deal(m, 1) as KlondikeState).draw;
    expect(text).toContain(`A pakli egyszerre ${draw('klondike1')} vagy ${draw('klondike3')} lapot fordít`);
    expect(text).toContain(`Pók: ${spiderCards / 52} pakli (${spiderCards} lap), ${spider.tableau.length} oszlop.`);
    expect(text).toContain(
      `${fc.cells.length} szabad cella és egy üres oszlop mellett ${maxSupermove(oneEmpty, false)} lapot, üres oszlopba ${maxSupermove(oneEmpty, true)} lapot.`,
    );
    expect(text).toContain(`az utolsó ${HISTORY_CAP} lépést`);
  });

  it('has a described run diagram that follows dental mode', () => {
    render(<SolitaireGame />);
    openRules();
    const img = within(dialog()).getByRole('img', { name: /^Ábra/ });
    expect(img.getAttribute('aria-label')).toContain('Pikk király (fekete)');
    expect(img.getAttribute('aria-label')).toContain('Kőr dáma (piros)');
    expect(img.textContent).toContain('♠');
    expect(img.textContent).toContain('♥');
    expect(img.textContent).toContain('fekete');
    expect(img.textContent).toContain('piros');
    expect(img.querySelector('[data-testid="diagram-tooth"]')).toBeNull();
    act(() => applyDental(true));
    expect(within(dialog()).getByRole('img', { name: /^Ábra/ }).querySelector('[data-testid="diagram-tooth"]')).toBeTruthy();
  });

  it('keeps the game when the language changes inside the rules', () => {
    resume();
    act(() => void fireEvent.pointerDown(pileEl('tableau', 1).querySelector('[data-card="7H"]')!.parentElement!, { clientX: 1, clientY: 1, button: 0 }));
    act(() => void fireEvent.pointerUp(window, { clientX: 1, clientY: 1 }));
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    openRules();
    act(() => applyLang('de'));
    expect(screen.getByRole('heading', { level: 2, name: 'Solitär — Regeln' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Ziel' })).toBeTruthy();
    act(() => void fireEvent.click(screen.getByRole('button', { name: 'Schließen' })));
    expect(screen.getByRole('dialog', { name: 'Pausiert' })).toBeTruthy();
    expect(cardsIn('tableau', 0)).toBe('8S 7H');
    expect(screen.getByText('Züge').parentElement?.textContent).toBe('Züge1');
  });
});
