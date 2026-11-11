import type { ReactNode } from 'react';
import { formatSavedAt } from '../format';
import { useKitMessages, useLang } from '../hooks';
import type { KitMessageKey } from '../i18n';
import type { ArcadeStatus } from '../types';

export type StatItem = {
  label: string;
  value: ReactNode;
  /** Highlights the value, e.g. a freshly beaten Best. */
  highlight?: boolean;
};

const STATUS_KEY: Record<ArcadeStatus, KitMessageKey> = {
  idle: 'statusIdle',
  running: 'statusRunning',
  paused: 'statusPaused',
  gameOver: 'statusGameOver',
};

/** Status chip; the default label follows the shared language, a passed `label` wins. */
export function StatusPill({ status, label }: { status: ArcadeStatus; label?: string }) {
  const t = useKitMessages();
  return (
    <span className={`arc-status arc-status--${status}`} role="status">
      <span className="arc-status__dot" aria-hidden="true" />
      {label ?? t(STATUS_KEY[status])}
    </span>
  );
}

/** The unified score strip: Score · Best · Time (+ game extras). */
export function StatPanel({
  items,
  status,
  statusLabel,
}: {
  items: StatItem[];
  status?: ArcadeStatus;
  statusLabel?: string;
}) {
  return (
    <div className="arc-stats">
      <dl className="arc-stats__grid">
        {items.map((it) => (
          <div key={it.label} className={`arc-stat${it.highlight ? ' arc-stat--hl' : ''}`}>
            <dt>{it.label}</dt>
            <dd>{it.value}</dd>
          </div>
        ))}
      </dl>
      {status && <StatusPill status={status} label={statusLabel} />}
    </div>
  );
}

export type OverlayAction = {
  label: string;
  onClick: () => void;
  primary?: boolean;
  /** Keyboard hint rendered next to the label, e.g. "P". */
  kbd?: string;
};

/** Centered card over the board for idle / paused / game-over states. */
export function GameOverlay({
  title,
  message,
  actions = [],
  children,
}: {
  title: ReactNode;
  message?: ReactNode;
  actions?: OverlayAction[];
  children?: ReactNode;
}) {
  return (
    <div className="arc-overlay" role="dialog" aria-live="polite" aria-label={typeof title === 'string' ? title : undefined}>
      <div className="arc-overlay__card">
        <h2 className="arc-overlay__title">{title}</h2>
        {message && <p className="arc-overlay__msg">{message}</p>}
        {children}
        {actions.length > 0 && (
          <div className="arc-overlay__actions">
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                className={`arc-btn${a.primary ? ' arc-btn--primary' : ''}`}
                onClick={a.onClick}
              >
                {a.label}
                {a.kbd && <kbd className="arc-kbd">{a.kbd}</kbd>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Small "Autosaved · just now" chip with an optional discard action. */
export function SaveBadge({ savedAt, onDiscard }: { savedAt: number | null; onDiscard?: () => void }) {
  const t = useKitMessages();
  const [lang] = useLang();
  if (savedAt === null) return null;
  return (
    <span className="arc-save" title={new Date(savedAt).toLocaleString()}>
      <span className="arc-save__dot" aria-hidden="true" />
      {t('autosaved')} · {formatSavedAt(savedAt, Date.now(), lang)}
      {onDiscard && (
        <button type="button" className="arc-save__discard" onClick={onDiscard}>
          {t('discard')}
        </button>
      )}
    </span>
  );
}

/**
 * Uniform keyboard help list. `heading`: `true` shows the translated
 * "Controls" title, a node shows that instead; omitted, no title (as before).
 */
export function KeyHelp({ rows, heading }: { rows: [keys: string, action: string][]; heading?: ReactNode | boolean }) {
  const t = useKitMessages();
  const list = (
    <ul className="arc-keys" aria-label={heading ? undefined : t('controls')}>
      {rows.map(([keys, action]) => (
        <li key={keys}>
          <span>
            {keys.split(' ').map((k) => (
              <kbd key={k} className="arc-kbd">
                {k}
              </kbd>
            ))}
          </span>
          <span>{action}</span>
        </li>
      ))}
    </ul>
  );
  if (!heading) return list;
  return (
    <section className="arc-keys-wrap" aria-label={typeof heading === 'string' ? heading : t('controls')}>
      <h3 className="arc-keys__heading">{heading === true ? t('controls') : heading}</h3>
      {list}
    </section>
  );
}
