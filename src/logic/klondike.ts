import {
  fitsFoundation,
  flipTop,
  foundationFor,
  isRun,
  mulberry32,
  replaceAt,
  runLength,
  shuffle,
  stacksAlternating,
  standardDeck,
  top,
} from './deck';
import type { KlondikeState, Loc, Move, Pile } from './types';

/** Seeded Klondike deal: columns of 1…7 cards (top card up), 24 cards face down in the stock. */
export function dealKlondike(seed: number, draw: 1 | 3): KlondikeState {
  const deck = shuffle(standardDeck(), mulberry32(seed));
  const tableau: Pile[] = [];
  let next = 0;
  for (let col = 0; col < 7; col++) {
    const pile = deck.slice(next, next + col + 1);
    next += col + 1;
    tableau.push(flipTop(pile));
  }
  return {
    variant: 'klondike',
    seed,
    draw,
    passes: 0,
    stock: deck.slice(next),
    waste: [],
    foundations: [[], [], [], []],
    tableau,
  };
}

function pileAt(s: KlondikeState, loc: Loc): Pile | undefined {
  if (loc.pile === 'waste') return loc.index === 0 ? s.waste : undefined;
  if (loc.pile === 'tableau') return s.tableau[loc.index];
  if (loc.pile === 'foundation') return s.foundations[loc.index];
  return undefined;
}

export function klondikeIsLegal(s: KlondikeState, move: Move): boolean {
  if (move.kind === 'stock') return s.stock.length > 0 || s.waste.length > 0;
  const { from, to, count } = move;
  const src = pileAt(s, from);
  const dst = pileAt(s, to);
  if (!src || !dst || (from.pile === to.pile && from.index === to.index) || !Number.isInteger(count) || count < 1 || count > src.length) return false;
  if (from.pile !== 'tableau' && count !== 1) return false;
  if (from.pile === 'tableau' && !isRun(src, count, stacksAlternating)) return false;
  const moving = src[src.length - count]!;
  if (!moving.up) return false;
  if (to.pile === 'foundation') return count === 1 && from.pile !== 'foundation' && fitsFoundation(moving, dst);
  if (to.pile !== 'tableau') return false;
  const t = top(dst);
  return t ? t.up && stacksAlternating(moving, t) : moving.rank === 'K';
}

export function klondikeApply(s: KlondikeState, move: Move): KlondikeState {
  if (!klondikeIsLegal(s, move)) return s;
  if (move.kind === 'stock') {
    if (s.stock.length === 0) {
      return { ...s, stock: [...s.waste].reverse().map((card) => ({ ...card, up: false })), waste: [], passes: s.passes + 1 };
    }
    const n = Math.min(s.draw, s.stock.length);
    const drawn = s.stock.slice(-n).reverse().map((card) => ({ ...card, up: true }));
    return { ...s, stock: s.stock.slice(0, -n), waste: [...s.waste, ...drawn] };
  }
  const { from, to, count } = move;
  const src = pileAt(s, from)!;
  const moving = src.slice(src.length - count);
  let next: KlondikeState = { ...s };
  const rest = src.slice(0, src.length - count);
  if (from.pile === 'waste') next.waste = rest;
  else if (from.pile === 'foundation') next.foundations = replaceAt(s.foundations, from.index, rest);
  else next.tableau = replaceAt(s.tableau, from.index, flipTop(rest));
  const dst = pileAt(next, to)!;
  if (to.pile === 'foundation') next = { ...next, foundations: replaceAt(next.foundations, to.index, [...dst, ...moving]) };
  else next = { ...next, tableau: replaceAt(next.tableau, to.index, [...dst, ...moving]) };
  return next;
}

/** Every distinct legal move (one representative per empty target column / foundation). */
export function klondikeLegalMoves(s: KlondikeState): Move[] {
  const moves: Move[] = [];
  const add = (m: Move) => {
    if (klondikeIsLegal(s, m)) moves.push(m);
  };
  const firstEmptyCol = s.tableau.findIndex((p) => p.length === 0);
  const toTableau = (from: Loc, count: number, wholePile: boolean) => {
    s.tableau.forEach((p, i) => {
      if (p.length > 0) add({ kind: 'move', from, to: { pile: 'tableau', index: i }, count });
    });
    if (firstEmptyCol >= 0 && !wholePile) add({ kind: 'move', from, to: { pile: 'tableau', index: firstEmptyCol }, count });
  };
  const toFoundation = (from: Loc, pile: Pile) => {
    const t = top(pile);
    if (!t) return;
    const f = foundationFor(t, s.foundations);
    if (f >= 0) add({ kind: 'move', from, to: { pile: 'foundation', index: f }, count: 1 });
  };

  const waste: Loc = { pile: 'waste', index: 0 };
  toFoundation(waste, s.waste);
  s.tableau.forEach((p, i) => toFoundation({ pile: 'tableau', index: i }, p));
  if (s.waste.length > 0) toTableau(waste, 1, false);
  s.tableau.forEach((p, i) => {
    const n = runLength(p, stacksAlternating);
    for (let count = 1; count <= n; count++) toTableau({ pile: 'tableau', index: i }, count, count === p.length);
  });
  s.foundations.forEach((p, i) => {
    if (p.length > 0) toTableau({ pile: 'foundation', index: i }, 1, false);
  });
  add({ kind: 'stock' });
  return moves;
}

/** Sources whose top card could go home right now (waste and tableau). */
export function klondikeFoundationMoves(s: KlondikeState): Move[] {
  return klondikeLegalMoves(s).filter((m) => m.kind === 'move' && m.to.pile === 'foundation');
}
