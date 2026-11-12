import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Node >= 25 ships its own global `localStorage` (undefined unless started with
// --localstorage-file), which shadows jsdom's. Point both names at jsdom's.
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom;
if (dom) {
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(globalThis, name, { configurable: true, value: dom.window[name] });
  }
}

// Vitest runs without globals, so Testing Library cannot register its own cleanup.
afterEach(() => cleanup());

// jsdom has no PointerEvent: a MouseEvent subclass carries clientX/Y and pointerId for drag tests.
for (const win of [dom?.window, globalThis as unknown as Window & typeof globalThis].filter(Boolean) as (Window & typeof globalThis)[]) {
  if (typeof win.PointerEvent === 'undefined') {
    class PointerEventPolyfill extends win.MouseEvent {
      readonly pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
      }
    }
    Object.defineProperty(win, 'PointerEvent', { configurable: true, writable: true, value: PointerEventPolyfill });
  }
}
