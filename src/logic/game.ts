import { RANKS, stacksAlternating, SUITS, top } from './deck';
import { dealFreeCell } from './freecell';
import { History } from './history';
import { dealKlondike } from './klondike';
import { applyMove, autoFoundation, canAutoComplete, isLegalMove, isWon, legalMoves } from './moves';
import { dealSpider, stacksSameSuit } from './spider';
import type { CardState, Loc, Move, Pile, SolitaireState, Variant } from './types';

/** One selectable game: a variant plus its option (draw count / suit count). */
export type ModeId = 'klondike1' | 'klondike3' | 'spider1' | 'spider2' | 'spider4' | 'freecell';
export const MODES: readonly ModeId[] = ['klondike1', 'klondike3', 'spider1', 'spider2', 'spider4', 'freecell'];

export const isModeId = (v: unknown): v is ModeId => typeof v === 'string' && (MODES as readonly string[]).includes(v);

export function variantOfMode(mode: ModeId): Variant {
  return mode === 'freecell' ? 'freecell' : mode.startsWith('spider') ? 'spider' : 'klondike';
}

/** The default option when switching to a variant. */
export const DEFAULT_MODE: Record<Variant, ModeId> = { klondike: 'klondike1', spider: 'spider1', freecell: 'freecell' };

export function modeOf(state: SolitaireState): ModeId {
  switch (state.variant) {
    case 'klondike':
      return state.draw === 3 ? 'klondike3' : 'klondike1';
    case 'spider':
      return `spider${state.suits}` as ModeId;
    case 'freecell':
      return 'freecell';
  }
}

/** Seeds are 1…999 999 (FreeCell: Microsoft deal numbers 1…32 000). */
export function randomSeed(mode: ModeId, rng: () => number = Math.random): number {
  const max = mode === 'freecell' ? 32000 : 999_999;
  return 1 + Math.floor(rng() * max);
}

export function deal(mode: ModeId, seed: number): SolitaireState {
  switch (mode) {
    case 'klondike1':
      return dealKlondike(seed, 1);
    case 'klondike3':
      return dealKlondike(seed, 3);
    case 'spider1':
      return dealSpider(seed, 1);
    case 'spider2':
      return dealSpider(seed, 2);
    case 'spider4':
      return dealSpider(seed, 4);
    case 'freecell':
      return dealFreeCell(seed);
  }
}

/** Undo steps kept (and saved) per game. */
export const HISTORY_CAP = 200;

/** A game in progress: the position, its undo history and the counters the score needs. */
export type Game = {
  mode: ModeId;
  state: SolitaireState;
  history: History<SolitaireState>;
  /** Player actions (stock turns included; undo does not count). */
  moves: number;
  undos: number;
  /** Ended with the Finish button: over, scores 0, takes no more moves. Never saved. */
  finishedEarly?: boolean;
};

export function fromState(state: SolitaireState): Game {
  return { mode: modeOf(state), state, history: History.empty(HISTORY_CAP), moves: 0, undos: 0 };
}

export const newGame = (mode: ModeId, seed: number): Game => fromState(deal(mode, seed));

export const seedOf = (state: SolitaireState): number => (state.variant === 'freecell' ? state.dealNumber : state.seed);

export const sameLoc = (a: Loc | null | undefined, b: Loc | null | undefined): boolean =>
  !!a && !!b && a.pile === b.pile && a.index === b.index;

/** Plays the safe foundation moves; skipped after a foundation → tableau move, which would undo it. */
function settle(state: SolitaireState, move: Move): SolitaireState {
  if (move.kind === 'move' && move.from.pile === 'foundation') return state;
  return autoFoundation(state).reduce<SolitaireState>((s, m) => applyMove(s, m), state);
}

/** Won, or ended early with the Finish button. */
export const isOver = (game: Game): boolean => game.finishedEarly === true || isWon(game.state);

/** Ends the game early (Finish button): it is over and scores nothing. */
export const finishGame = (game: Game): Game => (isOver(game) ? game : { ...game, finishedEarly: true });

/** The player's move plus the safe auto-moves it allows, as one undo step. Illegal → the same game. */
export function playMove(game: Game, move: Move): Game {
  if (isOver(game) || !isLegalMove(game.state, move)) return game;
  const next = settle(applyMove(game.state, move), move);
  return { ...game, state: next, history: History.push(game.history, game.state), moves: game.moves + 1 };
}

export function undoGame(game: Game): Game {
  if (game.finishedEarly) return game;
  const step = History.undo(game.history);
  if (!step) return game;
  return { ...game, state: step.state, history: step.history, undos: game.undos + 1 };
}

/** Plays every remaining card home once `canAutoComplete` holds (one undo step). Otherwise a no-op. */
export function autoComplete(game: Game): Game {
  if (isOver(game) || !canAutoComplete(game.state)) return game;
  let s = game.state;
  for (let guard = 0; guard < 200 && !isWon(s); guard++) {
    const m = legalMoves(s).find((x) => x.kind === 'move' && x.to.pile === 'foundation' && x.from.pile !== 'foundation');
    if (!m) break;
    s = applyMove(s, m);
  }
  if (s === game.state) return game;
  return { ...game, state: s, history: History.push(game.history, game.state), moves: game.moves + 1 };
}

/** Cards of a pile (a free cell is a pile of 0 or 1 cards). */
export function pileCards(state: SolitaireState, loc: Loc): Pile {
  switch (loc.pile) {
    case 'tableau':
      return state.tableau[loc.index] ?? [];
    case 'foundation':
      return state.foundations[loc.index] ?? [];
    case 'waste':
      return state.variant === 'klondike' ? state.waste : [];
    case 'cell': {
      const c = state.variant === 'freecell' ? state.cells[loc.index] : null;
      return c ? [c] : [];
    }
  }
}

/** How many cards on top of the pile can be picked up together (0 when none). */
export function movableCount(state: SolitaireState, loc: Loc): number {
  const pile = pileCards(state, loc);
  if (pile.length === 0) return 0;
  if (loc.pile !== 'tableau') return 1;
  const rule = state.variant === 'spider' ? stacksSameSuit : stacksAlternating;
  let n = 0;
  while (n < pile.length) {
    const c = pile[pile.length - 1 - n]!;
    if (!c.up) break;
    if (n > 0 && !rule(pile[pile.length - n]!, c)) break;
    n++;
  }
  return n;
}

/** Every legal move of exactly these cards (any empty column / cell / foundation counts once). */
function movesOf(state: SolitaireState, from: Loc, count: number): Move[] {
  return legalMoves(state).filter((m) => m.kind === 'move' && sameLoc(m.from, from) && m.count === count);
}

const targetRank = (state: SolitaireState, m: Move & { kind: 'move' }): number => {
  if (m.to.pile === 'foundation') return 0;
  if (m.to.pile === 'tableau') {
    const t = top(state.tableau[m.to.index] ?? []);
    if (!t) return 2;
    // Spider: a same-suit target keeps the run together.
    const moving = pileCards(state, m.from)[pileCards(state, m.from).length - m.count];
    return state.variant === 'spider' && moving && moving.suit !== t.suit ? 1.5 : 1;
  }
  return 3;
};

/**
 * Where a click sends these cards: home first (a single card), then a column with cards
 * (Spider: same suit first), then an empty column, then a free cell. Null when nothing fits.
 */
export function bestMove(state: SolitaireState, from: Loc, count: number): Move | null {
  const options = movesOf(state, from, count) as (Move & { kind: 'move' })[];
  if (options.length === 0) return null;
  return [...options].sort((a, b) => targetRank(state, a) - targetRank(state, b))[0]!;
}

/** The longest legal pick-up from `from`, for clicking a card in the middle of a column. */
export function bestMoveFrom(state: SolitaireState, from: Loc, maxCount: number): Move | null {
  for (let n = maxCount; n >= 1; n--) {
    const m = bestMove(state, from, n);
    if (m) return m;
  }
  return null;
}

function hintValue(state: SolitaireState, m: Move): number {
  if (m.kind === 'stock') return 1;
  const { from, to, count } = m;
  if (from.pile === 'foundation') return 0;
  if (to.pile === 'foundation') return 100;
  const src = pileCards(state, from);
  const moving = src[src.length - count]!;
  const below: CardState | undefined = from.pile === 'tableau' ? src[src.length - count - 1] : undefined;
  const dstTop = to.pile === 'tableau' ? top(state.tableau[to.index] ?? []) : undefined;
  const rule = state.variant === 'spider' ? stacksSameSuit : stacksAlternating;

  if (from.pile === 'waste') return dstTop ? 45 : 40;
  if (from.pile === 'cell') return dstTop ? 50 : 15;
  if (to.pile === 'cell') return below && !below.up ? 6 : below && !rule(moving, below) ? 4 : 0;

  // Tableau → tableau.
  if (!below) return dstTop ? 35 : 0; // empties a column
  if (!below.up) return 80; // turns a card over
  if (rule(moving, below)) {
    // The run already sits where it belongs: only worth it when the card below can then go home.
    const home = legalMoves(applyMove(state, m)).some(
      (x) => x.kind === 'move' && sameLoc(x.from, from) && x.to.pile === 'foundation',
    );
    if (home) return 60;
    if (state.variant === 'spider' && dstTop && dstTop.suit === moving.suit && below.suit !== moving.suit) return 50;
    return 0;
  }
  // The run sits on a card it does not belong to (Spider mixed suits, FreeCell deals).
  if (!dstTop) return 10;
  if (state.variant === 'spider') return dstTop.suit === moving.suit ? 55 : 25;
  return 30;
}

/** The most useful legal move, or null when nothing on the table helps. */
export function findHint(state: SolitaireState): Move | null {
  let best: Move | null = null;
  let bestScore = 0;
  for (const m of legalMoves(state)) {
    const v = hintValue(state, m);
    if (v > bestScore) {
      best = m;
      bestScore = v;
    }
  }
  return best;
}

// ── Saves ────────────────────────────────────────────────────

export type SavedGame = {
  mode: ModeId;
  state: SolitaireState;
  /** Undo states, oldest first (at most HISTORY_CAP). */
  past: SolitaireState[];
  moves: number;
  undos: number;
};

export const toSaved = (g: Game): SavedGame => ({ mode: g.mode, state: g.state, past: [...g.history.past], moves: g.moves, undos: g.undos });

export const fromSaved = (s: SavedGame): Game => ({
  mode: s.mode,
  state: s.state,
  history: { past: s.past.slice(-HISTORY_CAP), limit: HISTORY_CAP },
  moves: s.moves,
  undos: s.undos,
});

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isCard = (v: unknown): v is CardState =>
  isObj(v) &&
  (SUITS as readonly unknown[]).includes(v.suit) &&
  (RANKS as readonly unknown[]).includes(v.rank) &&
  typeof v.up === 'boolean' &&
  (v.deck === undefined || v.deck === 0 || v.deck === 1);
const isPile = (v: unknown): v is Pile => Array.isArray(v) && v.every(isCard);
const isPiles = (v: unknown, n?: number): v is Pile[] => Array.isArray(v) && (n === undefined || v.length === n) && v.every(isPile);

/** Structural check of a position: right pile counts and the whole deck present. */
export function isSolitaireState(v: unknown): v is SolitaireState {
  if (!isObj(v)) return false;
  const count = (piles: Pile[]) => piles.reduce((n, p) => n + p.length, 0);
  if (v.variant === 'klondike') {
    if (!(v.draw === 1 || v.draw === 3) || !isCount(v.seed) || !isCount(v.passes)) return false;
    if (!isPile(v.stock) || !isPile(v.waste) || !isPiles(v.foundations, 4) || !isPiles(v.tableau, 7)) return false;
    return count([v.stock, v.waste, ...v.foundations, ...v.tableau]) === 52;
  }
  if (v.variant === 'spider') {
    if (!(v.suits === 1 || v.suits === 2 || v.suits === 4) || !isCount(v.seed)) return false;
    if (!isPile(v.stock) || !isPiles(v.foundations) || v.foundations.length > 8 || !isPiles(v.tableau, 10)) return false;
    return count([v.stock, ...v.foundations, ...v.tableau]) === 104;
  }
  if (v.variant === 'freecell') {
    if (!isCount(v.dealNumber) || !Array.isArray(v.cells) || v.cells.length !== 4) return false;
    if (!v.cells.every((c) => c === null || isCard(c)) || !isPiles(v.foundations, 4) || !isPiles(v.tableau, 8)) return false;
    return count([...v.foundations, ...v.tableau]) + v.cells.filter(Boolean).length === 52;
  }
  return false;
}

export function isSavedGame(v: unknown): v is SavedGame {
  if (!isObj(v) || !isModeId(v.mode) || !isCount(v.moves) || !isCount(v.undos)) return false;
  if (!isSolitaireState(v.state) || modeOf(v.state) !== v.mode) return false;
  if (!Array.isArray(v.past) || v.past.length > HISTORY_CAP) return false;
  return v.past.every((s) => isSolitaireState(s) && modeOf(s) === v.mode);
}
