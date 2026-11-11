import type { CardFace, CardState, Pile, Rank, Suit } from './types';

export const SUITS: readonly Suit[] = ['S', 'H', 'D', 'C'];
export const RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/** A = 1 … K = 13. */
export const rankValue = (rank: Rank): number => RANKS.indexOf(rank) + 1;
export const isRed = (suit: Suit): boolean => suit === 'H' || suit === 'D';

/** Short code such as "JD", "10H", "AS". */
export const cardCode = (card: CardFace): string => card.rank + card.suit;

/** Parses "JD", "10H" or "TH" into a card (face up unless `up` is false). */
export function parseCard(code: string, up = true): CardState {
  const suit = code.slice(-1) as Suit;
  const raw = code.slice(0, -1);
  const rank = (raw === 'T' ? '10' : raw) as Rank;
  if (!SUITS.includes(suit) || !RANKS.includes(rank)) throw new Error(`Bad card code: ${code}`);
  return { rank, suit, up };
}

/** Deterministic 32-bit PRNG returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle into a new array. */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** One standard 52-card deck, face down. */
export const standardDeck = (deck?: 0 | 1): Pile =>
  SUITS.flatMap((suit) => RANKS.map((rank): CardState => (deck === undefined ? { suit, rank, up: false } : { suit, rank, up: false, deck })));

export const top = (pile: Pile): CardState | undefined => pile[pile.length - 1];

/** Turns the top card face up (new pile; same pile if nothing changes). */
export function flipTop(pile: Pile): Pile {
  const t = top(pile);
  if (!t || t.up) return pile;
  return [...pile.slice(0, -1), { ...t, up: true }];
}

export function replaceAt<T>(items: readonly T[], index: number, value: T): T[] {
  const out = [...items];
  out[index] = value;
  return out;
}

/** True when `card` may go on top of the foundation pile (A on empty, then same suit up). */
export function fitsFoundation(card: CardFace, foundation: Pile): boolean {
  const t = top(foundation);
  if (!t) return card.rank === 'A';
  return t.suit === card.suit && rankValue(card.rank) === rankValue(t.rank) + 1;
}

/** Foundation index a card would go to: its suit's pile, or the first empty one for an ace. */
export function foundationFor(card: CardFace, foundations: readonly Pile[]): number {
  const i = foundations.findIndex((f) => f.length > 0 && fitsFoundation(card, f));
  if (i >= 0) return i;
  return card.rank === 'A' ? foundations.findIndex((f) => f.length === 0) : -1;
}

/** Highest rank already home for `suit` (0 when none). */
export function homeRank(suit: Suit, foundations: readonly Pile[]): number {
  for (const f of foundations) {
    const t = top(f);
    if (t && t.suit === suit) return rankValue(t.rank);
  }
  return 0;
}

/**
 * A foundation move nobody would ever want to take back: aces and twos, or a card whose two
 * possible tableau "children" (the opposite-colour cards one lower) are already home.
 */
export function isSafeToFoundation(card: CardFace, foundations: readonly Pile[]): boolean {
  const r = rankValue(card.rank);
  if (r <= 2) return true;
  const opposite = SUITS.filter((s) => isRed(s) !== isRed(card.suit));
  return opposite.every((s) => homeRank(s, foundations) >= r - 1);
}

/** Alternating colours, each one rank lower (Klondike / FreeCell building rule). */
export const stacksAlternating = (card: CardFace, onto: CardFace): boolean =>
  isRed(card.suit) !== isRed(onto.suit) && rankValue(card.rank) + 1 === rankValue(onto.rank);

/** True when the top `count` cards are face up and each stacks on the one below by `rule`. */
export function isRun(pile: Pile, count: number, rule: (card: CardFace, onto: CardFace) => boolean): boolean {
  if (count < 1 || count > pile.length) return false;
  const start = pile.length - count;
  for (let i = start; i < pile.length; i++) {
    if (!pile[i]!.up) return false;
    if (i > start && !rule(pile[i]!, pile[i - 1]!)) return false;
  }
  return true;
}

/** Length of the longest run on top of the pile by `rule` (0 for an empty pile). */
export function runLength(pile: Pile, rule: (card: CardFace, onto: CardFace) => boolean): number {
  let n = 0;
  while (n < pile.length && isRun(pile, n + 1, rule)) n++;
  return n;
}
