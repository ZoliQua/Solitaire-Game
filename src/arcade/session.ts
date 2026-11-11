import { emit, readJSON, removeKey, subscribe, writeJSON } from './storage';
import type { ArcadeGameId } from './types';

/**
 * Saved in-progress game. `schema` is the game's own state-shape version:
 * bump it whenever the persisted `data` changes incompatibly and old saves are
 * discarded instead of crashing the game.
 */
export type SessionEnvelope<T> = {
  v: 1;
  game: ArcadeGameId;
  schema: number;
  savedAt: number;
  seconds: number;
  score: number;
  data: T;
};

export type SessionMeta = Omit<SessionEnvelope<unknown>, 'data'>;

export const SESSION_EVENT = 'arcade:session';
const SESSION_PREFIX = 'arcade.session.';
/** Saves older than this are treated as abandoned. */
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const sessionKey = (id: ArcadeGameId) => `${SESSION_PREFIX}${id}`;

function isEnvelope(v: unknown): v is SessionEnvelope<unknown> {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  return (
    e.v === 1 &&
    typeof e.game === 'string' &&
    typeof e.schema === 'number' &&
    typeof e.savedAt === 'number' &&
    typeof e.seconds === 'number' &&
    typeof e.score === 'number' &&
    'data' in e
  );
}

export type SaveInput<T> = { schema: number; data: T; seconds: number; score: number };

export function saveSession<T>(id: ArcadeGameId, input: SaveInput<T>, now: number = Date.now()) {
  const envelope: SessionEnvelope<T> = {
    v: 1,
    game: id,
    schema: input.schema,
    savedAt: now,
    seconds: Math.max(0, Math.floor(input.seconds)),
    score: Math.max(0, Math.floor(input.score)),
    data: input.data,
  };
  const ok = writeJSON(sessionKey(id), envelope);
  if (ok) emit(SESSION_EVENT, { id });
  return ok ? envelope : null;
}

/**
 * Load a saved session. Returns null (and drops the save) when it is missing,
 * corrupt, from another schema, too old, or rejected by `isValid`.
 */
export function loadSession<T>(
  id: ArcadeGameId,
  schema: number,
  isValid?: (data: unknown) => data is T,
  now: number = Date.now(),
): SessionEnvelope<T> | null {
  const env = readJSON<unknown>(sessionKey(id), null);
  if (env === null) return null;
  const usable =
    isEnvelope(env) &&
    env.game === id &&
    env.schema === schema &&
    now - env.savedAt <= SESSION_MAX_AGE_MS &&
    (!isValid || isValid(env.data));
  if (!usable) {
    clearSession(id);
    return null;
  }
  return env as SessionEnvelope<T>;
}

/** Lightweight look at a save without validating game data (portal cards). */
export function peekSession(id: ArcadeGameId, now: number = Date.now()): SessionMeta | null {
  const env = readJSON<unknown>(sessionKey(id), null);
  if (!isEnvelope(env) || env.game !== id || now - env.savedAt > SESSION_MAX_AGE_MS) return null;
  return {
    v: env.v,
    game: env.game,
    schema: env.schema,
    savedAt: env.savedAt,
    seconds: env.seconds,
    score: env.score,
  };
}

export function clearSession(id: ArcadeGameId): void {
  removeKey(sessionKey(id));
  emit(SESSION_EVENT, { id });
}

export function subscribeSessions(cb: () => void): () => void {
  return subscribe(SESSION_EVENT, SESSION_PREFIX, cb);
}
