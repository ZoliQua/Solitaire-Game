import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useKitMessages, useLang } from '../hooks';
import type { KitMessageKey } from '../i18n';
import { shouldIgnoreKey } from '../keyboard';
import { gameName } from '../registry';
import { useIsTouch } from '../touch';
import type { ArcadeGameId } from '../types';
import { useModalKeys } from './modal';

export type RulesSectionId = 'goal' | 'play' | 'rules' | 'scoring' | 'dental' | 'mobile';

/** One block of a game's rules; the kit supplies the localized heading for `id`. */
export type RulesSection = { id: RulesSectionId; body: ReactNode };

const HEADING: Record<RulesSectionId, KitMessageKey> = {
  goal: 'rulesGoal',
  play: 'rulesPlay',
  rules: 'rulesRules',
  scoring: 'rulesScoring',
  dental: 'rulesDental',
  mobile: 'rulesMobile',
};

export type RulesDialogProps = {
  open: boolean;
  onClose: () => void;
  sections: RulesSection[];
  /** Titles the dialog "{game} — rules" in the active language; without it the title is just "Rules". */
  gameId?: ArcadeGameId;
  /** Receives focus back when the dialog closes. */
  returnFocusRef?: RefObject<HTMLElement>;
};

/**
 * The rules as an in-page modal (role `dialog`): sections in the order given, each under its kit
 * heading; the `mobile` section only on touch devices. Escape, the Close button or a click outside
 * the card closes it; focus is trapped inside and handed back to `returnFocusRef`.
 */
export function RulesDialog({ open, onClose, sections, gameId, returnFocusRef }: RulesDialogProps) {
  const t = useKitMessages();
  const [lang] = useLang();
  const touch = useIsTouch();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = useCallback(() => {
    onClose();
    returnFocusRef?.current?.focus();
  }, [onClose, returnFocusRef]);
  useModalKeys(open, dialogRef, close);

  if (!open) return null;
  const title = gameId ? t('rulesTitle', { game: gameName(gameId, lang) }) : t('rulesButton');
  return (
    <div className="arc-modal" onClick={(e) => e.target === e.currentTarget && close()}>
      <div
        ref={dialogRef}
        className="arc-modal__card arc-rules"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="arc-rules__head">
          <h2 id={titleId} className="arc-rules__title">
            {title}
          </h2>
          <button type="button" className="arc-btn arc-btn--ghost arc-rules__close" onClick={close}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            {t('rulesClose')}
          </button>
        </header>
        <div className="arc-rules__body">
          {sections
            .filter((s) => s.id !== 'mobile' || touch)
            .map((s) => (
              <section key={s.id} className={`arc-rules__section arc-rules__section--${s.id}`}>
                <h3 className="arc-rules__heading">{t(HEADING[s.id])}</h3>
                {s.body}
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}

export type RulesButtonProps = {
  sections: RulesSection[];
  /** True while the dialog is open, so the game can pause (closing never auto-resumes). */
  onOpenChange?: (open: boolean) => void;
  /** Bind R to open the dialog (default true); pass false when the game already uses R. */
  hotkey?: boolean;
  /** Optional: titles the dialog "{game} — rules". */
  gameId?: ArcadeGameId;
};

/** Book icon + the visible word „Szabályok” / "Rules" / „Regeln”; opens the `RulesDialog`. */
export function RulesButton({ sections, onOpenChange, hotkey = true, gameId }: RulesButtonProps) {
  const t = useKitMessages();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const changeRef = useRef(onOpenChange);
  changeRef.current = onOpenChange;

  const show = useCallback(() => {
    setOpen(true);
    changeRef.current?.(true);
  }, []);
  const hide = useCallback(() => {
    setOpen(false);
    changeRef.current?.(false);
  }, []);

  useEffect(() => {
    if (!hotkey || open) return;
    const onKey = (e: KeyboardEvent) => {
      if (shouldIgnoreKey(e) || e.repeat || (e.key !== 'r' && e.key !== 'R')) return;
      e.preventDefault();
      show();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey, open, show]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="arc-btn arc-rules__btn"
        aria-haspopup="dialog"
        aria-keyshortcuts={hotkey ? 'R' : undefined}
        title={hotkey ? `${t('rulesButton')} (R)` : undefined}
        onClick={show}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
          <path d="M9.5 8.2a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1v.6M12 15h.01" />
        </svg>
        {t('rulesButton')}
      </button>
      <RulesDialog open={open} onClose={hide} sections={sections} gameId={gameId} returnFocusRef={triggerRef} />
    </>
  );
}
