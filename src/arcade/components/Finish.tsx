import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { formatNumber } from '../format';
import { useKitMessages, useLang } from '../hooks';
import { useModalKeys } from './modal';

export type FinishButtonProps = {
  /** The score shown in the game's Score panel right now; it is what goes on the leaderboard. */
  score: number;
  /** Show the button only while a run is active (started and not over). */
  visible: boolean;
  /** Confirmed: end the run with outcome `'finished'`. Called once per confirm. */
  onFinish: () => void;
  /** True while the confirm is open, so the game can pause its timer. */
  onOpenChange?: (open: boolean) => void;
};

/**
 * "Finish" button with an in-page confirm (role `alertdialog`, never a browser dialog):
 * "Finish the game? {score} points go on the leaderboard." Cancel is focused first, so a stray
 * Enter cannot end the run; Escape and a click outside the card cancel too.
 */
export function FinishButton({ score, visible, onFinish, onOpenChange }: FinishButtonProps) {
  const t = useKitMessages();
  const [lang] = useLang();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef(false);
  const msgId = useId();
  const changeRef = useRef(onOpenChange);
  changeRef.current = onOpenChange;

  const show = () => {
    doneRef.current = false;
    setOpen(true);
    changeRef.current?.(true);
  };
  const hide = useCallback((returnFocus: boolean) => {
    setOpen(false);
    changeRef.current?.(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);
  const cancel = useCallback(() => hide(true), [hide]);
  const confirm = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    hide(false);
    onFinish();
  };

  // The run ended some other way while the confirm was open: drop the confirm.
  useEffect(() => {
    if (!visible && open) hide(false);
  }, [visible, open, hide]);

  useModalKeys(open, dialogRef, cancel, cancelRef);

  if (!visible) return null;
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="arc-btn arc-finish__btn"
        aria-haspopup="dialog"
        onClick={show}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 21V4" />
          <path d="M5 4h11l-2 4 2 4H5" />
        </svg>
        {t('finishButton')}
      </button>
      {open && (
        <div className="arc-modal" onClick={(e) => e.target === e.currentTarget && cancel()}>
          <div
            ref={dialogRef}
            className="arc-modal__card arc-finish"
            role="alertdialog"
            aria-modal="true"
            aria-label={t('finishButton')}
            aria-describedby={msgId}
            tabIndex={-1}
          >
            <p id={msgId} className="arc-finish__msg">
              {t('finishConfirm', { score: formatNumber(Math.max(0, Math.floor(score)), lang) })}
            </p>
            <div className="arc-finish__actions">
              <button ref={cancelRef} type="button" className="arc-btn" onClick={cancel}>
                {t('finishNo')}
              </button>
              <button type="button" className="arc-btn arc-btn--primary" onClick={confirm}>
                {t('finishYes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
