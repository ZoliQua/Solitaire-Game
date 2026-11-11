import type { RunOutcome } from './types';

/**
 * Unified points for round-based duel games (Gomoku, Tic-Tac-Toe, Connect Four)
 * so they share the score scale used by stats and the leaderboard:
 * - win: base × (1 + share of the board still empty) → faster wins pay up to 2× base,
 * - draw: a quarter of base (a draw against the unbeatable AI still counts),
 * - loss: 0.
 * Local two-player rounds are unranked and score 0.
 */
export type DuelDifficulty = 'easy' | 'medium' | 'hard';

export const DUEL_BASE_POINTS: Record<DuelDifficulty, number> = {
  easy: 100,
  medium: 250,
  hard: 500,
};

export function duelRoundScore(input: {
  outcome: RunOutcome;
  difficulty: DuelDifficulty | null;
  /** Stones/marks placed by both sides when the round ended. */
  moves: number;
  boardCells: number;
}): number {
  if (input.difficulty === null) return 0;
  const base = DUEL_BASE_POINTS[input.difficulty];
  if (input.outcome === 'win') {
    const empty = Math.max(0, input.boardCells - input.moves) / Math.max(1, input.boardCells);
    return Math.round(base * (1 + empty));
  }
  if (input.outcome === 'draw') return Math.round(base / 4);
  return 0;
}
