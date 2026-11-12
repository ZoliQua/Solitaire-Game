import { cardCode, parseCard, standardDeck } from '../logic/deck';
import type { CardState, KlondikeState, Pile } from '../logic/types';

/** "7H" face up, "_7H" face down. */
export const card = (code: string): CardState => (code.startsWith('_') ? parseCard(code.slice(1), false) : parseCard(code));
export const pile = (codes: string): Pile => (codes.trim() ? codes.trim().split(/\s+/).map(card) : []);

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
/** `suit` from the ace up to and including `to`. */
export const suitUpTo = (suit: string, to: string): string => RANKS.slice(0, RANKS.indexOf(to) + 1).map((r) => r + suit).join(' ');

/**
 * A Klondike position from short codes. Any of the 52 cards not placed anywhere goes face down into
 * the stock, so the position always holds the whole deck.
 */
export function klondikePosition(opts: {
  tableau: string[];
  foundations?: string[];
  waste?: string;
  stock?: string;
  draw?: 1 | 3;
  fillStock?: boolean;
}): KlondikeState {
  const tableau = Array.from({ length: 7 }, (_, i) => pile(opts.tableau[i] ?? ''));
  const foundations = Array.from({ length: 4 }, (_, i) => pile(opts.foundations?.[i] ?? ''));
  const waste = pile(opts.waste ?? '');
  let stock = pile(opts.stock ?? '').map((c) => ({ ...c, up: false }));
  if (opts.fillStock !== false) {
    const used = new Set([...tableau.flat(), ...foundations.flat(), ...waste, ...stock].map(cardCode));
    stock = [...standardDeck().filter((c) => !used.has(cardCode(c))), ...stock];
  }
  return { variant: 'klondike', seed: 7, draw: opts.draw ?? 1, passes: 0, stock, waste, foundations, tableau };
}

/** All four foundations complete except the kings of spades, hearts and diamonds, which sit in columns 0–2. */
export function nearlyWonKlondike(): KlondikeState {
  return klondikePosition({
    tableau: ['KS', 'KH', 'KD'],
    foundations: [suitUpTo('S', 'Q'), suitUpTo('H', 'Q'), suitUpTo('D', 'Q'), suitUpTo('C', 'K')],
    fillStock: false,
  });
}
