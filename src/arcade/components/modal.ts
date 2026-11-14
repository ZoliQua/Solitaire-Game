import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
}

/**
 * Keyboard contract of every kit modal (Rules dialog, Finish confirm) while `open`:
 * - focus moves into `dialogRef` (`initialFocusRef`, else its first focusable element),
 * - Tab / Shift+Tab cycle inside it,
 * - Escape calls `onClose`,
 * - no key reaches the game: the listener runs on `window` in the capture phase and stops every
 *   keydown, so P/Escape/R/arrows of a paused game never fire behind the modal. Buttons still work
 *   with Enter/Space (that is the browser's default action, not a listener).
 */
export function useModalKeys(
  open: boolean,
  dialogRef: RefObject<HTMLElement>,
  onClose: () => void,
  initialFocusRef?: RefObject<HTMLElement>,
): void {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    if (root) (initialFocusRef?.current ?? focusables(root)[0] ?? root).focus();
    const onKey = (e: KeyboardEvent) => {
      const dialog = dialogRef.current;
      e.stopPropagation();
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;
      const list = focusables(dialog);
      if (list.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = !!active && dialog.contains(active);
      if (e.shiftKey && (!inside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable; only `open` re-arms the trap
  }, [open]);
}
