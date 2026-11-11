/**
 * localStorage wrappers that never throw: storage can be missing (SSR, tests),
 * blocked (private mode) or full. Every read falls back, every write reports
 * success as a boolean.
 */

function store(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readString(key: string): string | null {
  try {
    return store()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): boolean {
  const s = store();
  if (!s) return false;
  try {
    s.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    store()?.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readJSON<T>(
  key: string,
  fallback: T,
  isValid?: (value: unknown) => value is T,
): T {
  const raw = readString(key);
  if (raw === null) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isValid && !isValid(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    return writeString(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

/** All keys currently in storage that start with `prefix`. */
export function keysWithPrefix(prefix: string): string[] {
  const s = store();
  if (!s) return [];
  const out: string[] = [];
  try {
    for (let i = 0; i < s.length; i += 1) {
      const k = s.key(i);
      if (k !== null && k.startsWith(prefix)) out.push(k);
    }
  } catch {
    /* ignore */
  }
  return out;
}

export function emit(eventName: string, detail: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  } catch {
    /* ignore */
  }
}

/**
 * Subscribe to an in-page custom event plus cross-tab `storage` events for
 * keys under `keyPrefix`. Returns an unsubscribe function.
 */
export function subscribe(eventName: string, keyPrefix: string, cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onCustom = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(keyPrefix)) cb();
  };
  window.addEventListener(eventName, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(eventName, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}
