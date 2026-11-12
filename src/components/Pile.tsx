import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { PlayingCard, type Lang } from '../arcade';
import type { CardState } from '../logic/types';
import { SuitMark } from './SuitMark';
import styles from './Table.module.css';

export type PileAttr = 'tableau' | 'foundation' | 'cell' | 'waste' | 'stock';

export type PileItem = {
  card: CardState;
  /** Offset inside the pile, px. */
  x: number;
  y: number;
  /** Index of the card in the real pile. */
  index: number;
  /** Whether a press on this card picks it (and everything above it) up. */
  draggable: boolean;
};

export type PileProps = {
  attr: PileAttr;
  index: number;
  label: string;
  width: number;
  height: number;
  cardWidth: number;
  /** Grid column (1-based) and span inside its row. */
  column: number;
  span?: number;
  items: PileItem[];
  /** Real length of the pile (items may show only its top). */
  length: number;
  placeholder?: ReactNode;
  hint?: 'from' | 'to';
  /** Cards from this index up are lifted (keyboard pick). */
  pickedFrom?: number;
  /** Cards from `fromIndex` up follow the pointer. */
  dragged?: { fromIndex: number; dx: number; dy: number } | null;
  focused?: boolean;
  interactive: boolean;
  deck: 'color' | 'grey';
  dental: boolean;
  lang: Lang;
  onCardDown?: (index: number, e: PointerEvent) => void;
  onActivate?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onFocus?: () => void;
};

/** One pile: an outlined slot with its cards absolutely positioned on top. */
export function Pile(p: PileProps) {
  const style: CSSProperties = { width: p.width, height: p.height, gridColumn: `${p.column} / span ${p.span ?? 1}` };
  return (
    <div
      className={[styles.pile, p.hint ? styles[`hint_${p.hint}`] : '', p.focused ? styles.focused : ''].filter(Boolean).join(' ')}
      style={style}
      data-pile={p.attr}
      data-index={p.index}
      data-count={p.length}
      data-hint={p.hint}
      role={p.interactive ? 'button' : 'group'}
      tabIndex={p.interactive ? 0 : undefined}
      aria-label={p.label}
      onClick={p.interactive ? p.onActivate : undefined}
      onKeyDown={p.interactive ? p.onKeyDown : undefined}
      onFocus={p.interactive ? p.onFocus : undefined}
    >
      <div className={styles.slot} style={{ width: p.cardWidth, height: Math.round(p.cardWidth * 1.4) }} aria-hidden="true">
        {p.placeholder}
      </div>
      {p.items.map((it) => {
        const lifted = p.dragged && it.index >= p.dragged.fromIndex;
        const picked = p.pickedFrom !== undefined && it.index >= p.pickedFrom;
        const cardStyle: CSSProperties = {
          left: it.x,
          top: it.y,
          zIndex: lifted ? 1000 + it.index : it.index + 1,
          transform: lifted ? `translate(${p.dragged!.dx}px, ${p.dragged!.dy}px)` : undefined,
        };
        return (
          <div
            key={it.index}
            className={[styles.card, it.draggable && p.interactive ? styles.grab : '', lifted ? styles.dragging : '', picked ? styles.picked : ''].filter(Boolean).join(' ')}
            style={cardStyle}
            data-card-index={it.index}
            onPointerDown={it.draggable && p.interactive && p.onCardDown ? (e) => p.onCardDown!(it.index, e) : undefined}
          >
            <PlayingCard
              card={it.card}
              faceDown={!it.card.up}
              deck={p.deck}
              dental={p.dental}
              size={p.cardWidth}
              lang={p.lang}
              selected={picked}
            />
            {it.card.up && <SuitMark suit={it.card.suit} deck={p.deck} />}
          </div>
        );
      })}
    </div>
  );
}
