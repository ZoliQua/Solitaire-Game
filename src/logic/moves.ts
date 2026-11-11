import { isSafeToFoundation, rankValue } from './deck';
import { freeCellApply, freeCellIsLegal, freeCellLegalMoves } from './freecell';
import { klondikeApply, klondikeIsLegal, klondikeLegalMoves } from './klondike';
import { spiderApply, spiderIsLegal, spiderLegalMoves } from './spider';
import type { CardState, Loc, Move, SolitaireState } from './types';

/** Every distinct legal move in this position. */
export function legalMoves(state: SolitaireState): Move[] {
  switch (state.variant) {
    case 'klondike':
      return klondikeLegalMoves(state);
    case 'spider':
      return spiderLegalMoves(state);
    case 'freecell':
      return freeCellLegalMoves(state);
  }
}

export function isLegalMove(state: SolitaireState, move: Move): boolean {
  switch (state.variant) {
    case 'klondike':
      return klondikeIsLegal(state, move);
    case 'spider':
      return spiderIsLegal(state, move);
    case 'freecell':
      return freeCellIsLegal(state, move);
  }
}

/** Plays `move` and returns the new state; an illegal move returns `state` itself. Never mutates. */
export function applyMove<S extends SolitaireState>(state: S, move: Move): S {
  switch (state.variant) {
    case 'klondike':
      return klondikeApply(state, move) as S;
    case 'spider':
      return spiderApply(state, move) as S;
    case 'freecell':
      return freeCellApply(state, move) as S;
  }
  return state;
}

export function isWon(state: SolitaireState): boolean {
  if (state.variant === 'spider') return state.foundations.length === 8;
  return state.foundations.every((f) => f.length === 13);
}

/** The card a move would pick up first (the bottom of the moved run). */
export function movingCard(state: SolitaireState, move: Move): CardState | undefined {
  if (move.kind === 'stock') return undefined;
  const pile = pileAt(state, move.from);
  if (!pile) return undefined;
  return pile[pile.length - move.count];
}

function pileAt(state: SolitaireState, loc: Loc): readonly CardState[] | undefined {
  switch (loc.pile) {
    case 'tableau':
      return state.tableau[loc.index];
    case 'foundation':
      return state.foundations[loc.index];
    case 'waste':
      return state.variant === 'klondike' && loc.index === 0 ? state.waste : undefined;
    case 'cell': {
      if (state.variant !== 'freecell') return undefined;
      const card = state.cells[loc.index];
      return card ? [card] : [];
    }
  }
}

/**
 * The safe foundation moves to play now, in order (each assumes the previous ones were applied).
 * Spider removes complete runs by itself, so it has none.
 */
export function autoFoundation(state: SolitaireState): Move[] {
  if (state.variant === 'spider') return [];
  const moves: Move[] = [];
  let s: SolitaireState = state;
  for (;;) {
    const next: Move | undefined = legalMoves(s).find(
      (m) => m.kind === 'move' && m.to.pile === 'foundation' && isSafeToFoundation(movingCard(s, m)!, s.foundations),
    );
    if (!next) return moves;
    moves.push(next);
    s = applyMove(s, next);
  }
}

/**
 * True when the rest of the game plays itself: Klondike with stock and waste empty and every card
 * face up; FreeCell with every column in descending order. Spider never auto-completes.
 */
export function canAutoComplete(state: SolitaireState): boolean {
  if (state.variant === 'spider') return false;
  if (state.variant === 'klondike') {
    return state.stock.length === 0 && state.waste.length === 0 && state.tableau.every((p) => p.every((card) => card.up));
  }
  // `<=`, not `<`: equal ranks (e.g. 7H on 7S) are fine — with every column non-increasing towards the top,
  // the lowest remaining card is always on top of a column or in a cell, so it can always go home next.
  return state.tableau.every((p) => p.every((card, i) => i === 0 || rankValue(card.rank) <= rankValue(p[i - 1]!.rank)));
}
