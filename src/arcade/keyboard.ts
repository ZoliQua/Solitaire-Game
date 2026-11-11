/**
 * True when a key event should be left alone by game hotkeys: the user is
 * typing in a form field, or holding a browser/OS modifier (Cmd+R must reload,
 * Ctrl+W must close the tab, …).
 */
export function shouldIgnoreKey(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey) return true;
  const target = event.target as HTMLElement | null;
  if (!target || typeof target.tagName !== 'string') return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable === true;
}

/** Standard cross-game hotkeys, so every game answers to the same keys. */
export const ARCADE_KEYS = {
  pause: ['p', 'P', 'Escape'],
  restart: ['r', 'R'],
  theme: ['t', 'T'],
} as const;

export function isKey(event: KeyboardEvent, keys: readonly string[]): boolean {
  return keys.includes(event.key);
}
