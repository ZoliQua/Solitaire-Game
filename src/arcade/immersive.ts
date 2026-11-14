import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export type Immersive = {
  /** The game fills the screen (native full screen or the CSS immersive mode). */
  active: boolean;
  /** This browser has the element Fullscreen API, so `toggle` asks for real full screen (false on iPhone Safari). */
  native: boolean;
  toggle: () => void;
  exit: () => void;
};

const IMMERSIVE_CLASS = 'arc-immersive';
const NATIVE_CLASS = 'arc-fullscreen';

/**
 * Only the standard API counts: iPhone Safari leaves `document.fullscreenEnabled` false/undefined
 * (its prefixed API covers `<video>` only), iPad Safari 16.4+ and every other browser set it to true.
 */
function nativeSupported(): boolean {
  return typeof document !== 'undefined' && document.fullscreenEnabled === true;
}

function fullscreenElement(): Element | null {
  return typeof document === 'undefined' ? null : (document.fullscreenElement ?? null);
}

function leaveNative(): void {
  try {
    Promise.resolve(document.exitFullscreen?.()).catch(() => {});
  } catch {
    /* already left */
  }
}

const BODY_PROPS = ['position', 'top', 'left', 'right', 'width', 'overflow'] as const;
type BodyStyle = Record<(typeof BODY_PROPS)[number], string>;
type Lock = { y: number; body: BodyStyle; el: HTMLElement };

/**
 * Body scroll lock that also holds on iOS Safari (where `overflow: hidden` on body alone does not):
 * the body is pinned with `position: fixed; top: -scrollY`, and the scroll position comes back on release.
 */
function lockPage(el: HTMLElement): Lock {
  const y = window.scrollY || window.pageYOffset || 0;
  const s = document.body.style;
  const body = Object.fromEntries(BODY_PROPS.map((p) => [p, s[p]])) as BodyStyle;
  s.position = 'fixed';
  s.top = `-${y}px`;
  s.left = '0';
  s.right = '0';
  s.width = '100%';
  s.overflow = 'hidden';
  document.documentElement.dataset.arcadeImmersive = '1';
  el.classList.add(IMMERSIVE_CLASS);
  return { y, body, el };
}

function unlockPage(lock: Lock): void {
  lock.el.classList.remove(IMMERSIVE_CLASS);
  delete document.documentElement.dataset.arcadeImmersive;
  const s = document.body.style;
  for (const p of BODY_PROPS) s[p] = lock.body[p];
  // The page chrome comes back in the same frame; without this, scroll anchoring would add its height
  // on top of the restored position.
  const root = document.documentElement.style;
  const anchor = root.overflowAnchor;
  root.overflowAnchor = 'none';
  try {
    window.scrollTo(0, lock.y);
  } catch {
    /* jsdom and old browsers */
  }
  const release = () => {
    root.overflowAnchor = anchor;
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => requestAnimationFrame(release));
  else setTimeout(release, 50);
}

/**
 * Full screen for a game's root element.
 * - Where the element Fullscreen API exists (`document.fullscreenEnabled`: desktop, Android, iPad) it is used on
 *   `target`; the browser's own Escape exits it. If the request is refused, the CSS mode is used instead.
 * - Elsewhere (iPhone Safari) the CSS immersive mode: `html[data-arcade-immersive="1"]` (the portal and the
 *   standalone shell hide their chrome), `target` gets `.arc-immersive` (fixed, 100dvh, safe-area padding),
 *   the page scroll is locked and restored on exit; Escape exits.
 * Kit modals render inside the game, so they stay visible in both modes.
 */
export function useImmersive(target: RefObject<HTMLElement>): Immersive {
  const [native] = useState(nativeSupported);
  const [mode, setMode] = useState<null | 'native' | 'css'>(null);
  const lock = useRef<Lock | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const enterCss = useCallback(() => {
    const el = target.current;
    if (!el || lock.current) return;
    lock.current = lockPage(el);
    setMode('css');
  }, [target]);

  const exitCss = useCallback(() => {
    if (!lock.current) return;
    unlockPage(lock.current);
    lock.current = null;
    setMode(null);
  }, []);

  const exit = useCallback(() => {
    if (lock.current) {
      exitCss();
      return;
    }
    const el = target.current;
    if (el && fullscreenElement() === el) leaveNative();
  }, [exitCss, target]);

  const toggle = useCallback(() => {
    if (modeRef.current || lock.current) {
      exit();
      return;
    }
    const el = target.current;
    if (!el) return;
    if (native && typeof el.requestFullscreen === 'function') {
      try {
        // Refused (iframe without allow="fullscreen", no user gesture…): fall back to the CSS mode.
        Promise.resolve(el.requestFullscreen()).catch(() => enterCss());
      } catch {
        enterCss();
      }
      return;
    }
    enterCss();
  }, [enterCss, exit, native, target]);

  // Native mode follows the browser (its Escape, the system gesture, our exit()).
  useEffect(() => {
    if (!native) return;
    const onChange = () => {
      const el = target.current;
      if (!el) return;
      const on = fullscreenElement() === el;
      el.classList.toggle(NATIVE_CLASS, on);
      if (on) setMode('native');
      else if (modeRef.current === 'native') setMode(null);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [native, target]);

  // CSS mode: Escape exits (an open kit modal stops the key first and only closes itself).
  useEffect(() => {
    if (mode !== 'css') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitCss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, exitCss]);

  // Leaving the page (unmount) never leaves the body locked or the browser in full screen.
  useEffect(() => {
    const el = target.current;
    return () => {
      if (lock.current) {
        unlockPage(lock.current);
        lock.current = null;
      }
      if (el && fullscreenElement() === el) leaveNative();
    };
  }, [target]);

  return { active: mode !== null, native, toggle, exit };
}
