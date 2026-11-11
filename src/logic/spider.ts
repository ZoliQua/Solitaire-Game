import { flipTop, isRun, mulberry32, rankValue, replaceAt, runLength, shuffle, standardDeck, top } from './deck';
import type { CardFace, CardState, Loc, Move, Pile, SpiderState, Suit } from './types';

const SPIDER_SUITS: Record<1 | 2 | 4, Suit[]> = { 1: ['S'], 2: ['S', 'H'], 4: ['S', 'H', 'D', 'C'] };

/** Same suit, one rank lower — the only runs that move (and get removed) as a unit. */
export const stacksSameSuit = (card: CardFace, onto: CardFace): boolean =>
  card.suit === onto.suit && rankValue(card.rank) + 1 === rankValue(onto.rank);

/** 104 cards: 8 × one suit, 4 × two suits or 2 × four suits; `deck` splits the copies into two halves. */
export function spiderDeck(suits: 1 | 2 | 4): Pile {
  const chosen = SPIDER_SUITS[suits];
  const copies = 8 / chosen.length;
  const cards: CardState[] = [];
  for (let copy = 0; copy < copies; copy++) {
    const deck: 0 | 1 = copy < copies / 2 ? 0 : 1;
    for (const card of standardDeck(deck)) if (chosen.includes(card.suit)) cards.push(card);
  }
  return cards;
}

/** Seeded Spider deal: 54 cards in 10 columns (6,6,6,6,5,5,5,5,5,5, top up), 50 in the stock. */
export function dealSpider(seed: number, suits: 1 | 2 | 4): SpiderState {
  const deck = shuffle(spiderDeck(suits), mulberry32(seed));
  const tableau: Pile[] = Array.from({ length: 10 }, () => []);
  for (let i = 0; i < 54; i++) tableau[i % 10]!.push(deck[i]!);
  return {
    variant: 'spider',
    seed,
    suits,
    stock: deck.slice(54),
    foundations: [],
    tableau: tableau.map(flipTop),
  };
}

/** Removes a complete K→A same-suit run from the top of column `i`, if there is one. */
function removeRun(s: SpiderState, i: number): SpiderState {
  const pile = s.tableau[i]!;
  if (pile.length < 13 || top(pile)!.rank !== 'A' || !isRun(pile, 13, stacksSameSuit)) return s;
  return {
    ...s,
    tableau: replaceAt(s.tableau, i, flipTop(pile.slice(0, -13))),
    foundations: [...s.foundations, pile.slice(-13)],
  };
}

export function spiderIsLegal(s: SpiderState, move: Move): boolean {
  if (move.kind === 'stock') return s.stock.length > 0 && s.tableau.every((p) => p.length > 0);
  const { from, to, count } = move;
  if (from.pile !== 'tableau' || to.pile !== 'tableau' || from.index === to.index) return false;
  const src = s.tableau[from.index];
  const dst = s.tableau[to.index];
  if (!src || !dst || !Number.isInteger(count) || !isRun(src, count, stacksSameSuit)) return false;
  const moving = src[src.length - count]!;
  const t = top(dst);
  return !t || (t.up && rankValue(moving.rank) + 1 === rankValue(t.rank));
}

export function spiderApply(s: SpiderState, move: Move): SpiderState {
  if (!spiderIsLegal(s, move)) return s;
  if (move.kind === 'stock') {
    const dealt = s.stock.slice(-10).reverse(); // top of the stock goes to column 0
    let next: SpiderState = {
      ...s,
      stock: s.stock.slice(0, -dealt.length),
      tableau: s.tableau.map((p, i) => (dealt[i] ? [...p, { ...dealt[i]!, up: true }] : p)),
    };
    for (let i = 0; i < next.tableau.length; i++) next = removeRun(next, i);
    return next;
  }
  const { from, to, count } = move;
  const src = s.tableau[from.index]!;
  const moving = src.slice(src.length - count);
  let tableau = replaceAt(s.tableau, from.index, flipTop(src.slice(0, src.length - count)));
  tableau = replaceAt(tableau, to.index, [...tableau[to.index]!, ...moving]);
  return removeRun({ ...s, tableau }, to.index);
}

/** Every distinct legal move (one representative empty column per run). */
export function spiderLegalMoves(s: SpiderState): Move[] {
  const moves: Move[] = [];
  const firstEmpty = s.tableau.findIndex((p) => p.length === 0);
  s.tableau.forEach((p, i) => {
    const from: Loc = { pile: 'tableau', index: i };
    const n = runLength(p, stacksSameSuit);
    for (let count = 1; count <= n; count++) {
      s.tableau.forEach((q, j) => {
        if (q.length === 0 || j === i) return;
        const m: Move = { kind: 'move', from, to: { pile: 'tableau', index: j }, count };
        if (spiderIsLegal(s, m)) moves.push(m);
      });
      if (firstEmpty >= 0 && count < p.length) moves.push({ kind: 'move', from, to: { pile: 'tableau', index: firstEmpty }, count });
    }
  });
  if (spiderIsLegal(s, { kind: 'stock' })) moves.push({ kind: 'stock' });
  return moves;
}
