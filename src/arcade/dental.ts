import { emit, readString, writeString } from './storage';
import type { ApplyOptions } from './i18n';

/**
 * Dental mode: one shared, presentation-only preference (`arcade.dental`,
 * `'1'` / `'0'`, default off) that re-skins every game with teeth, brushes and
 * toothpaste. It never changes rules, scores, stats keys or save formats.
 */

export const DENTAL_KEY = 'arcade.dental';
export const DENTAL_EVENT = 'arcade:dental';

/** Last value `applyDental` could not persist; used only when storage has no value. */
let unsavedDental: boolean | null = null;

/** Saved value → in-memory fallback (storage blocked) → off. */
export function readDental(): boolean {
  const stored = readString(DENTAL_KEY);
  if (stored === '1' || stored === '0') return stored === '1';
  return unsavedDental ?? false;
}

/** Mirror the preference on `<html data-dental>` so CSS can react to it. */
export function markDental(on: boolean): void {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-dental', on ? 'on' : 'off');
}

/** Persist dental mode and notify every listener on the page. */
export function applyDental(on: boolean, opts: ApplyOptions = {}): void {
  unsavedDental = writeString(DENTAL_KEY, on ? '1' : '0') ? null : on;
  markDental(on);
  if (!opts.silent) emit(DENTAL_EVENT, on);
}
