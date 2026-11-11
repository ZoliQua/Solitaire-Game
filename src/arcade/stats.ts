import { ARCADE_GAMES } from './registry';
import { emit, readJSON, readString, removeKey, subscribe, writeJSON, writeString } from './storage';
import type { ArcadeGameId, RunResult } from './types';

/**
 * One scoring model for every game. A finished run updates:
 * - `plays`, `totalSeconds`, `lastScore`, `lastPlayedAt` always,
 * - `wins` when the outcome is a win,
 * - `best` and `totalScore` only for ranked runs.
 */
export type GameStats = {
  best: number;
  plays: number;
  wins: number;
  totalScore: number;
  totalSeconds: number;
  lastScore: number;
  lastPlayedAt: number | null;
};

export type ArcadeTotals = {
  plays: number;
  totalScore: number;
  totalSeconds: number;
};

export const STATS_EVENT = 'arcade:stats';
const STATS_PREFIX = 'arcade.stats.';

export const statsKey = (id: ArcadeGameId) => `${STATS_PREFIX}${id}`;

export function emptyStats(): GameStats {
  return {
    best: 0,
    plays: 0,
    wins: 0,
    totalScore: 0,
    totalSeconds: 0,
    lastScore: 0,
    lastPlayedAt: null,
  };
}

const nonNegInt = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;

function normalize(raw: unknown): GameStats {
  if (typeof raw !== 'object' || raw === null) return emptyStats();
  const r = raw as Record<string, unknown>;
  return {
    best: nonNegInt(r.best),
    plays: nonNegInt(r.plays),
    wins: nonNegInt(r.wins),
    totalScore: nonNegInt(r.totalScore),
    totalSeconds: nonNegInt(r.totalSeconds),
    lastScore: nonNegInt(r.lastScore),
    lastPlayedAt:
      typeof r.lastPlayedAt === 'number' && Number.isFinite(r.lastPlayedAt) ? r.lastPlayedAt : null,
  };
}

function legacyKey(id: ArcadeGameId): string | undefined {
  return ARCADE_GAMES.find((g) => g.id === id)?.legacyBestKey;
}

function readLegacyBest(id: ArcadeGameId): number {
  const key = legacyKey(id);
  if (!key) return 0;
  const raw = readString(key);
  if (raw === null) return 0;
  return nonNegInt(Number.parseInt(raw, 10));
}

export function readStats(id: ArcadeGameId): GameStats {
  const stats = normalize(readJSON<unknown>(statsKey(id), null));
  // Pre-kit builds stored only `<id>.highScore`; never lose that record.
  const legacy = readLegacyBest(id);
  return legacy > stats.best ? { ...stats, best: legacy } : stats;
}

export function readAllStats(ids: readonly ArcadeGameId[] = ARCADE_GAMES.map((g) => g.id)) {
  const out = {} as Record<ArcadeGameId, GameStats>;
  for (const id of ids) out[id] = readStats(id);
  return out;
}

export function summarize(all: Partial<Record<ArcadeGameId, GameStats>>): ArcadeTotals {
  const totals: ArcadeTotals = { plays: 0, totalScore: 0, totalSeconds: 0 };
  for (const s of Object.values(all)) {
    if (!s) continue;
    totals.plays += s.plays;
    totals.totalScore += s.totalScore;
    totals.totalSeconds += s.totalSeconds;
  }
  return totals;
}

/** Pure reducer: stats after one finished run. */
export function applyRun(prev: GameStats, run: RunResult, now: number): GameStats {
  const score = nonNegInt(run.score);
  return {
    best: run.ranked ? Math.max(prev.best, score) : prev.best,
    plays: prev.plays + 1,
    wins: prev.wins + (run.outcome === 'win' ? 1 : 0),
    totalScore: prev.totalScore + (run.ranked ? score : 0),
    totalSeconds: prev.totalSeconds + nonNegInt(run.seconds),
    lastScore: score,
    lastPlayedAt: now,
  };
}

export function recordRun(id: ArcadeGameId, run: RunResult, now: number = Date.now()): GameStats {
  const next = applyRun(readStats(id), run, now);
  writeJSON(statsKey(id), next);
  const legacy = legacyKey(id);
  if (legacy) writeString(legacy, String(next.best));
  emit(STATS_EVENT, { id });
  return next;
}

export function resetStats(id?: ArcadeGameId): void {
  const ids = id ? [id] : ARCADE_GAMES.map((g) => g.id);
  for (const gid of ids) {
    removeKey(statsKey(gid));
    const legacy = legacyKey(gid);
    if (legacy) removeKey(legacy);
  }
  emit(STATS_EVENT, { id: id ?? null });
}

export function subscribeStats(cb: () => void): () => void {
  return subscribe(STATS_EVENT, STATS_PREFIX, cb);
}
