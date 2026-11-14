import { describe, expect, it } from 'vitest';
import { pile } from '../test/fixtures';
import { columnLayout, NARROW, tableMetrics } from './layout';

const VARIANTS = ['klondike', 'spider', 'freecell'] as const;
const rowWidth = (m: ReturnType<typeof tableMetrics>) => m.cols * m.cw + (m.cols - 1) * m.gap;

describe('table layout', () => {
  it('fits every variant into a 360 px phone (336 px of table)', () => {
    for (const v of VARIANTS) {
      const m = tableMetrics(v, 336, 740);
      expect(rowWidth(m)).toBeLessThanOrEqual(336);
      expect(m.cw).toBeGreaterThanOrEqual(30);
    }
  });

  it('packs the columns tighter below the narrow width', () => {
    for (const v of VARIANTS) {
      expect(tableMetrics(v, NARROW - 1, 800).gap).toBeLessThan(tableMetrics(v, NARROW, 800).gap);
    }
  });

  it('caps the card size by the screen height (phone in landscape)', () => {
    const landscape = tableMetrics('klondike', 804, 390);
    // Top row plus a column budget of 3.5 cards stays inside the screen.
    expect(landscape.ch * 4.6).toBeLessThanOrEqual(390 - 100);
    expect(rowWidth(landscape)).toBeLessThanOrEqual(804);
    // A desktop window keeps the full size.
    expect(tableMetrics('klondike', 792, 800).cw).toBe(96);
  });

  it('overlaps face-down cards tighter on a narrow table, face-up ones stay readable', () => {
    const cards = pile('_2S _3S _4S _5S 6H 7C');
    const wide = columnLayout(cards, 100, 2000, false, false);
    const narrow = columnLayout(cards, 100, 2000, false, true);
    expect(narrow.ys[1]! - narrow.ys[0]!).toBeLessThan(wide.ys[1]! - wide.ys[0]!);
    expect(narrow.ys[5]! - narrow.ys[4]!).toBe(wide.ys[5]! - wide.ys[4]!);
  });
});
