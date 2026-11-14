import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { Loc } from '../logic/types';

/** Pointer travel (px) before a press turns into a drag; less is a click. */
export const DRAG_THRESHOLD = 5;

export type DragInfo = { from: Loc; count: number; dx: number; dy: number };

export type DragOptions = {
  enabled: boolean;
  /** Released over `to` (null: not over a pile). Return nothing: an illegal drop just snaps back. */
  onDrop(from: Loc, count: number, to: Loc | null): void;
  /** Pressed and released without moving: a click (mouse, pen) or a tap (`pointerType` 'touch'). */
  onTap(from: Loc, count: number, pointerType: string): void;
};

const PILES = ['tableau', 'foundation', 'cell', 'waste'] as const;

/** The pile under a screen point, read from the nearest `[data-pile][data-index]` element. */
export function locAt(x: number, y: number): Loc | null {
  const el = typeof document.elementFromPoint === 'function' ? document.elementFromPoint(x, y) : null;
  const host = el?.closest<HTMLElement>('[data-pile]');
  if (!host) return null;
  const pile = host.dataset.pile as Loc['pile'];
  const index = Number(host.dataset.index);
  return (PILES as readonly string[]).includes(pile) && Number.isInteger(index) ? { pile, index } : null;
}

type Press = { from: Loc; count: number; x: number; y: number; id: number; type: string; moved: boolean };

/**
 * Pointer-events drag of a card or a run (mouse, pen and touch alike). The dragged cards follow the
 * pointer through `drag.dx/dy`; on release the pile under the pointer is the target.
 */
export function useDrag(opts: DragOptions) {
  const [drag, setDrag] = useState<DragInfo | null>(null);
  const ref = useRef(opts);
  ref.current = opts;
  const press = useRef<Press | null>(null);
  const detach = useRef<(() => void) | null>(null);

  const end = useCallback(() => {
    detach.current?.();
    detach.current = null;
    press.current = null;
    setDrag(null);
  }, []);

  useEffect(() => end, [end]);
  // Disabled mid-drag (paused, dialog): drop the drag without playing it.
  useEffect(() => {
    if (!opts.enabled && press.current) end();
  }, [opts.enabled, end]);

  const start = useCallback(
    (from: Loc, count: number, e: ReactPointerEvent) => {
      if (!ref.current.enabled || press.current || (e.button ?? 0) !== 0) return;
      e.preventDefault();
      const p: Press = { from, count, x: e.clientX, y: e.clientY, id: e.pointerId, type: e.pointerType || 'mouse', moved: false };
      press.current = p;
      const same = (ev: PointerEvent) => ev.pointerId === undefined || p.id === undefined || ev.pointerId === p.id;
      const move = (ev: PointerEvent) => {
        if (!same(ev)) return;
        const dx = ev.clientX - p.x;
        const dy = ev.clientY - p.y;
        if (!p.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        p.moved = true;
        setDrag({ from, count, dx, dy });
      };
      const up = (ev: PointerEvent) => {
        if (!same(ev)) return;
        const moved = p.moved;
        end();
        if (moved) ref.current.onDrop(from, count, locAt(ev.clientX, ev.clientY));
        else ref.current.onTap(from, count, p.type);
      };
      const cancel = () => end();
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', cancel);
      detach.current = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cancel);
      };
    },
    [end],
  );

  return { drag, start };
}
