import { describe, expect, it } from 'vitest';
import { History } from './history';

describe('History', () => {
  it('undoes in reverse push order', () => {
    let h = History.empty<number>();
    expect(History.canUndo(h)).toBe(false);
    expect(History.undo(h)).toBeNull();
    h = History.push(h, 1);
    h = History.push(h, 2);
    expect(History.canUndo(h)).toBe(true);
    const a = History.undo(h)!;
    expect(a.state).toBe(2);
    const b = History.undo(a.history)!;
    expect(b.state).toBe(1);
    expect(History.undo(b.history)).toBeNull();
  });

  it('is immutable', () => {
    const h = History.push(History.empty<string>(), 'x');
    History.push(h, 'y');
    History.undo(h);
    expect(h.past).toEqual(['x']);
  });

  it('drops the oldest states beyond the limit', () => {
    let h = History.empty<number>(3);
    for (let i = 1; i <= 5; i++) h = History.push(h, i);
    expect(h.past).toEqual([3, 4, 5]);
  });

  it('round-trips through JSON', () => {
    const h = History.push(History.empty<{ a: number }>(10), { a: 1 });
    expect(JSON.parse(JSON.stringify(h))).toEqual(h);
  });
});
