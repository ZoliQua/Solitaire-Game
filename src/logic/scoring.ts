import type { ModeId } from './game';
import type { Variant } from './types';

/**
 * Only a won game scores:
 *   score = round(base × timeFactor × undoFactor)
 *   timeFactor = clamp(par / seconds, TIME_FLOOR, 1)      (0.25)
 *   undoFactor = max(UNDO_FLOOR, 1 − UNDO_STEP × undos)    (0.5, 0.02)
 */
export const BASE_POINTS: Record<ModeId, number> = {
  klondike1: 1000,
  klondike3: 1500,
  spider1: 1000,
  spider2: 2000,
  spider4: 4000,
  freecell: 2000,
};

export const PAR_SECONDS: Record<Variant, number> = { klondike: 300, spider: 600, freecell: 420 };

/** Highest possible score (Spider, four suits, on par, no undo) — the portal's `max_score` for `solitaire`. */
export const SOLITAIRE_MAX_SCORE = 4000;

/** Slowest possible time factor: a slow win still keeps a quarter of the base. */
export const TIME_FLOOR = 0.25;
/** Each undo takes this share off the score… */
export const UNDO_STEP = 0.02;
/** …but the undo factor never drops below this. */
export const UNDO_FLOOR = 0.5;

const variantOf = (mode: ModeId): Variant => (mode === 'freecell' ? 'freecell' : mode.startsWith('spider') ? 'spider' : 'klondike');

export function timeFactor(variant: Variant, seconds: number): number {
  const s = Math.max(1, seconds);
  return Math.min(1, Math.max(TIME_FLOOR, PAR_SECONDS[variant] / s));
}

export const undoFactor = (undos: number): number => Math.max(UNDO_FLOOR, 1 - UNDO_STEP * Math.max(0, undos));

export function solitaireScore(mode: ModeId, seconds: number, undos: number): number {
  return Math.round(BASE_POINTS[mode] * timeFactor(variantOf(mode), seconds) * undoFactor(undos));
}
