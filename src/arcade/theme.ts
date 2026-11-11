import { readString, writeString } from './storage';

export type ArcadeTheme = 'dark' | 'light';

export const THEME_KEY = 'arcade.theme';
export const THEME_EVENT = 'arcade:theme';

export function readTheme(): ArcadeTheme {
  const stored = readString(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  try {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    /* ignore */
  }
  return 'dark';
}

/** Persist and apply the theme on <html data-theme>. */
export function applyTheme(theme: ArcadeTheme): void {
  writeString(THEME_KEY, theme);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
  }
}
