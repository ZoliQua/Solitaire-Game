import { useEffect, useId, useRef, useState } from 'react';
import { LANG_NAMES, LANGS, type Lang } from '../i18n';

/**
 * Globe + current code; opens a short list of language buttons (`aria-pressed`
 * marks the active one). Shared by the standalone `ArcadeShell` and the portal header.
 *
 * While open, Escape only closes the list (focus returns to the trigger): it is
 * caught on `window` in the capture phase and stopped, so a running game's own
 * Escape (pause) handler never sees it.
 */
export function LangMenu({
  lang,
  onPick,
  label,
  className,
}: {
  lang: Lang;
  onPick: (l: Lang) => void;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  return (
    <div className={className ? `arc-lang ${className}` : 'arc-lang'} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="arc-lang__btn"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${LANG_NAMES[lang]}`}
        title={label}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" />
        </svg>
        <span className="arc-lang__code">{lang.toUpperCase()}</span>
      </button>
      {open && (
        <ul id={listId} className="arc-menu__list arc-lang__list" aria-label={label}>
          {LANGS.map((l) => (
            <li key={l}>
              <button
                type="button"
                aria-pressed={l === lang}
                lang={l}
                onClick={() => {
                  onPick(l);
                  setOpen(false);
                }}
              >
                <span className="arc-lang__mark" aria-hidden="true">
                  {l === lang ? '✓' : ''}
                </span>
                {LANG_NAMES[l]}
                <small aria-hidden="true">{l.toUpperCase()}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
