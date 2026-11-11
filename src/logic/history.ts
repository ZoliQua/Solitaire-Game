/** Immutable undo stack of whole game states (plain data, JSON-safe). */
export type History<S> = { readonly past: readonly S[]; readonly limit: number };

export const DEFAULT_HISTORY_LIMIT = 1000;

export const History = {
  empty<S>(limit: number = DEFAULT_HISTORY_LIMIT): History<S> {
    return { past: [], limit };
  },

  /** Remembers `state` (the state *before* a move) so it can be restored by `undo`. */
  push<S>(history: History<S>, state: S): History<S> {
    const past = [...history.past, state];
    return { past: past.length > history.limit ? past.slice(past.length - history.limit) : past, limit: history.limit };
  },

  /** The most recent remembered state and the history without it, or null when there is nothing to undo. */
  undo<S>(history: History<S>): { history: History<S>; state: S } | null {
    if (history.past.length === 0) return null;
    return {
      history: { past: history.past.slice(0, -1), limit: history.limit },
      state: history.past[history.past.length - 1]!,
    };
  },

  canUndo<S>(history: History<S>): boolean {
    return history.past.length > 0;
  },
};
