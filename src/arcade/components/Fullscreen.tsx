import { useKitMessages } from '../hooks';
import type { Immersive } from '../immersive';

/** Enter / leave full screen; icon + word, label follows the state. Safe to show on every device. */
export function FullscreenButton({ immersive }: { immersive: Immersive }) {
  const t = useKitMessages();
  const label = immersive.active ? t('fullscreenExit') : t('fullscreen');
  return (
    <button
      type="button"
      className={`arc-btn arc-fs__btn${immersive.active ? ' arc-fs__btn--on' : ''}`}
      onClick={immersive.toggle}
      title={label}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {immersive.active ? (
          <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
        ) : (
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        )}
      </svg>
      <span>{label}</span>
    </button>
  );
}
