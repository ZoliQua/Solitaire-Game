import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { cardLabel, formatNumber, gameName, Tooth, useLang, useMessages } from '../arcade';
import { MESSAGES } from '../i18n';
import { movableCount, sameLoc } from '../logic/game';
import type { CardState, Loc, Move, Pile as Cards, SolitaireState } from '../logic/types';
import { Pile, type PileAttr, type PileItem } from './Pile';
import { columnLayout, NARROW, pileKeyOf, tableMetrics, type PileKey } from './layout';
import type { DragInfo } from './useDrag';
import styles from './Table.module.css';

export type { PileKey } from './layout';
export type DeckStyle = 'color' | 'grey';

export type TableProps = {
  state: SolitaireState;
  deck: DeckStyle;
  dental: boolean;
  /** False for the demo and while paused: no focus, no pointer handlers. */
  interactive: boolean;
  drag?: DragInfo | null;
  picked?: { from: Loc; count: number } | null;
  hint?: Move | null;
  focused?: PileKey | null;
  onCardDown?: (from: Loc, count: number, e: PointerEvent) => void;
  onStock?: () => void;
  /** Enter / Space on a pile (keyboard pick and drop). */
  onPileActivate?: (loc: Loc) => void;
  onPileFocus?: (key: PileKey) => void;
  /** A tap / click on a pile outside its grabbable cards (an empty pile, a face-down card): a drop target. */
  onPileTap?: (loc: Loc) => void;
  /** A tap / click on the table between the piles. */
  onBackgroundTap?: () => void;
};

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [viewH, setViewH] = useState(() => (typeof window !== 'undefined' ? window.innerHeight || 800 : 800));
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (el.clientWidth > 0) setWidth(el.clientWidth);
      setViewH(window.innerHeight || 800);
    };
    measure();
    window.addEventListener('resize', measure);
    if (typeof ResizeObserver === 'undefined') return () => window.removeEventListener('resize', measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  return { ref, width, viewH };
}

/** The whole table: stock, waste, cells and foundations on top, the columns below. */
export function Table(props: TableProps) {
  const { state, deck, dental, interactive, drag, picked, hint, focused } = props;
  const t = useMessages(MESSAGES);
  const [lang] = useLang();
  const { ref, width, viewH } = useWidth();
  const { cols, gap, cw, ch } = tableMetrics(state.variant, width, viewH);
  const tight = width < NARROW;
  const num = (n: number) => formatNumber(n, lang);
  const spider = state.variant === 'spider';
  const budget = Math.max(ch * 3.5, viewH - 240 - ch);

  const describe = (cards: Cards): string => {
    const tc = cards[cards.length - 1];
    if (!tc) return t('pileEmpty');
    const down = cards.filter((c) => !c.up).length;
    const topName = tc.up ? cardLabel(tc, lang) : t('faceDown');
    return down > 0 && down < cards.length
      ? t('pileCardsHidden', { n: num(cards.length), down: num(down), card: topName })
      : t('pileCards', { n: num(cards.length), card: topName });
  };

  const hintOf = (key: PileKey): 'from' | 'to' | undefined => {
    if (!hint) return undefined;
    if (hint.kind === 'stock') return key.pile === 'stock' ? 'from' : undefined;
    if (key.pile !== 'stock' && sameLoc(hint.from, key)) return 'from';
    if (key.pile !== 'stock' && sameLoc(hint.to, key)) return 'to';
    return undefined;
  };

  const common = (key: PileKey) => ({
    cardWidth: cw,
    interactive,
    deck,
    dental,
    lang,
    hint: hintOf(key),
    focused: interactive && !!focused && pileKeyOf(focused) === pileKeyOf(key),
    onFocus: () => props.onPileFocus?.(key),
  });

  const loc = (pile: Loc['pile'], index: number): Loc => ({ pile, index });

  /** Shared wiring of a Loc pile: drag offsets, keyboard pick, pointer start. */
  const locPile = (l: Loc, length: number) => {
    const dragged = drag && sameLoc(drag.from, l) ? { fromIndex: length - drag.count, dx: drag.dx, dy: drag.dy } : null;
    const pickedFrom = picked && sameLoc(picked.from, l) ? length - picked.count : undefined;
    return {
      dragged,
      pickedFrom,
      onCardDown: (index: number, e: PointerEvent) => props.onCardDown?.(l, length - index, e),
      onActivate: () => props.onPileTap?.(l),
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          props.onPileActivate?.(l);
        }
      },
    };
  };

  const stackItems = (cards: Cards, draggable: boolean, shown = 2): PileItem[] =>
    cards.slice(-shown).map((card, k, arr) => ({
      card,
      x: 0,
      y: 0,
      index: cards.length - arr.length + k,
      draggable: draggable && k === arr.length - 1,
    }));

  // ── Top row ────────────────────────────────────────────────
  const top: JSX.Element[] = [];
  const stockKey: PileKey = { pile: 'stock', index: 0 };
  const stockProps = {
    ...common(stockKey),
    attr: 'stock' as PileAttr,
    index: 0,
    width: cw,
    height: ch,
    column: 1,
    onActivate: props.onStock,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        props.onStock?.();
      }
    },
  };

  if (state.variant === 'klondike') {
    const stockLabel = state.stock.length > 0 ? t('stockCards', { n: num(state.stock.length) }) : state.waste.length > 0 ? t('stockRedeal') : t('stockEmpty');
    top.push(
      <Pile
        key="stock"
        {...stockProps}
        label={stockLabel}
        length={state.stock.length}
        items={stackItems(state.stock, false)}
        placeholder={state.waste.length > 0 ? <span className={styles.redeal}>↻</span> : null}
      />,
    );
    const w = state.waste;
    const fan = state.draw === 3;
    const shown = w.slice(fan ? -3 : -2);
    const wasteLoc = loc('waste', 0);
    top.push(
      <Pile
        key="waste"
        {...common(wasteLoc)}
        {...locPile(wasteLoc, w.length)}
        attr="waste"
        index={0}
        label={`${t('waste')}: ${describe(w)}`}
        width={cw * 2 + gap}
        height={ch}
        column={2}
        span={2}
        length={w.length}
        // Draw three: the last three cards fan out, but only the top one is playable.
        items={shown.map((card, k) => ({
          card,
          x: fan ? Math.round(k * cw * 0.32) : 0,
          y: 0,
          index: w.length - shown.length + k,
          draggable: k === shown.length - 1,
        }))}
      />,
    );
  } else if (state.variant === 'spider') {
    const deals = Math.ceil(state.stock.length / 10);
    top.push(
      <Pile
        key="stock"
        {...stockProps}
        width={Math.round(cw * (1 + 0.14 * Math.max(0, deals - 1)))}
        label={deals > 0 ? t('stockDeals', { n: num(deals) }) : t('stockEmpty')}
        length={state.stock.length}
        items={Array.from({ length: deals }, (_, k) => ({
          card: state.stock[Math.min(state.stock.length - 1, k * 10)]!,
          x: Math.round(k * cw * 0.14),
          y: 0,
          index: k,
          draggable: false,
        }))}
      />,
    );
  } else {
    state.cells.forEach((c, i) => {
      const l = loc('cell', i);
      const cards: Cards = c ? [c] : [];
      top.push(
        <Pile
          key={`cell${i}`}
          {...common(l)}
          {...locPile(l, cards.length)}
          attr="cell"
          index={i}
          label={`${t('cell', { n: num(i + 1) })}: ${describe(cards)}`}
          width={cw}
          height={ch}
          column={i + 1}
          length={cards.length}
          items={stackItems(cards, true, 1)}
        />,
      );
    });
  }

  const foundationPlaceholder = dental ? (
    <span className={styles.slotIcon} data-testid="foundation-tooth">
      <Tooth size={Math.round(cw * 0.5)} />
    </span>
  ) : (
    <span className={styles.slotText}>A</span>
  );

  if (state.variant === 'spider') {
    for (let i = 0; i < 8; i++) {
      const run = state.foundations[i];
      const l = loc('foundation', i);
      const king: CardState | undefined = run?.[0];
      top.push(
        <Pile
          key={`f${i}`}
          {...common(l)}
          attr="foundation"
          index={i}
          label={`${t('run', { n: num(i + 1) })}: ${king ? cardLabel(king, lang) : t('pileEmpty')}`}
          width={cw}
          height={ch}
          column={i + 3}
          length={run?.length ?? 0}
          items={king ? [{ card: king, x: 0, y: 0, index: 0, draggable: false }] : []}
          placeholder={dental ? foundationPlaceholder : <span className={styles.slotText}>K</span>}
          interactive={false}
        />,
      );
    }
  } else {
    const first = state.variant === 'klondike' ? 4 : 5;
    state.foundations.forEach((f, i) => {
      const l = loc('foundation', i);
      top.push(
        <Pile
          key={`f${i}`}
          {...common(l)}
          {...locPile(l, f.length)}
          attr="foundation"
          index={i}
          label={`${t('foundation', { n: num(i + 1) })}: ${describe(f)}`}
          width={cw}
          height={ch}
          column={first + i}
          length={f.length}
          items={stackItems(f, state.variant === 'klondike')}
          placeholder={foundationPlaceholder}
        />,
      );
    });
  }

  // ── Columns ────────────────────────────────────────────────
  const columns = state.tableau.map((p, i) => {
    const l = loc('tableau', i);
    const { ys, height } = columnLayout(p, ch, budget, spider, tight);
    const movable = interactive ? movableCount(state, l) : 0;
    return (
      <Pile
        key={`t${i}`}
        {...common(l)}
        {...locPile(l, p.length)}
        attr="tableau"
        index={i}
        label={`${t('column', { n: num(i + 1) })}: ${describe(p)}`}
        width={cw}
        height={Math.max(ch, height)}
        column={i + 1}
        length={p.length}
        items={p.map((card, k) => ({ card, x: 0, y: ys[k]!, index: k, draggable: k >= p.length - movable }))}
        placeholder={state.variant === 'klondike' ? <span className={styles.slotText}>K</span> : null}
      />
    );
  });

  const gridStyle: CSSProperties = { gridTemplateColumns: `repeat(${cols}, ${cw}px)`, columnGap: gap };
  return (
    <div
      ref={ref}
      className={styles.table}
      data-variant={state.variant}
      data-dental={dental ? 'true' : 'false'}
      data-testid="solitaire-table"
      role="group"
      aria-label={t('tableLabel', { game: gameName('solitaire', lang) })}
      style={{ '--cw': `${cw}px`, '--gap': `${gap}px` } as CSSProperties}
      onClick={(e) => {
        if (!(e.target instanceof Element) || !e.target.closest('[data-pile]')) props.onBackgroundTap?.();
      }}
    >
      <div className={styles.row} style={gridStyle}>
        {top}
      </div>
      <div className={`${styles.row} ${styles.columns}`} style={gridStyle}>
        {columns}
      </div>
    </div>
  );
}
