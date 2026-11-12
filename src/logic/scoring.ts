import type { ModeId } from './game';
import type { Variant } from './types';

/**
 * Only a won game scores:
 *   score = round(base × timeFactor × undoFactor)
 *   timeFactor = clamp(par / seconds, 0.25, 1)
 *   undoFactor = max(0.5, 1 − 0.02 × undos)
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

const variantOf = (mode: ModeId): Variant => (mode === 'freecell' ? 'freecell' : mode.startsWith('spider') ? 'spider' : 'klondike');

export function timeFactor(variant: Variant, seconds: number): number {
  const s = Math.max(1, seconds);
  return Math.min(1, Math.max(0.25, PAR_SECONDS[variant] / s));
}

export const undoFactor = (undos: number): number => Math.max(0.5, 1 - 0.02 * Math.max(0, undos));

export function solitaireScore(mode: ModeId, seconds: number, undos: number): number {
  return Math.round(BASE_POINTS[mode] * timeFactor(variantOf(mode), seconds) * undoFactor(undos));
}
