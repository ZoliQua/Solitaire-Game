import { useEffect, useRef, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { useKitMessages } from '../hooks';
import { useIsTouch } from '../touch';

export type TouchPadButton = {
  /** Stable id; in the `dpad` layout `up` / `down` / `left` / `right` take the cross, other ids sit in the middle and below. */
  id: string;
  /** Visible caption and accessible name. */
  label: string;
  /** Shape (arrow, ⟳, ⤓…): meaning never depends on colour. */
  icon: ReactNode;
  onPress: () => void;
  /** Auto-repeat every 150 ms while held (after the first press). */
  repeat?: boolean;
};

const REPEAT_MS = 150;
const DPAD_AREAS = new Set(['up', 'down', 'left', 'right']);

function PadButton({ button, area }: { button: TouchPadButton; area?: string }) {
  const press = useRef(button.onPress);
  press.current = button.onPress;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    // Fire on touch-down (no wait for the click) and keep focus and text selection where they were.
    e.preventDefault();
    stop();
    press.current();
    if (button.repeat) timer.current = setInterval(() => press.current(), REPEAT_MS);
  };
  // Pointer presses were handled on pointerdown; a click with detail 0 is the keyboard or a screen reader.
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0) press.current();
  };

  return (
    <button
      type="button"
      className="arc-pad__btn"
      data-pad={button.id}
      style={area ? { gridArea: area } : undefined}
      aria-label={button.label}
      title={button.label}
      onPointerDown={onPointerDown}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <span className="arc-pad__icon" aria-hidden="true">
        {button.icon}
      </span>
      <span className="arc-pad__label" aria-hidden="true">
        {button.label}
      </span>
    </button>
  );
}

/**
 * On-screen controls for touch devices (renders nothing with a fine pointer).
 * `dpad`: a cross of up/down/left/right (other buttons in the middle, then a row below);
 * `row`: one row of equal buttons. Buttons are at least 48 px, with a shape and a caption.
 */
export function TouchPad({ buttons, layout }: { buttons: TouchPadButton[]; layout: 'dpad' | 'row' }) {
  const touch = useIsTouch();
  const t = useKitMessages();
  if (!touch) return null;

  if (layout === 'row') {
    return (
      <div className="arc-pad arc-pad--row" role="group" aria-label={t('touchControls')}>
        {buttons.map((b) => (
          <PadButton key={b.id} button={b} />
        ))}
      </div>
    );
  }

  const cross = buttons.filter((b) => DPAD_AREAS.has(b.id));
  const others = buttons.filter((b) => !DPAD_AREAS.has(b.id));
  const [center, ...rest] = others;
  return (
    <div className="arc-pad arc-pad--dpad" role="group" aria-label={t('touchControls')}>
      <div className="arc-pad__cross">
        {cross.map((b) => (
          <PadButton key={b.id} button={b} area={b.id} />
        ))}
        {center && <PadButton button={center} area="center" />}
      </div>
      {rest.length > 0 && (
        <div className="arc-pad__extra">
          {rest.map((b) => (
            <PadButton key={b.id} button={b} />
          ))}
        </div>
      )}
    </div>
  );
}
