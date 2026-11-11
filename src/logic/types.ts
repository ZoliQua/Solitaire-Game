import type { CardFace } from '../arcade';

export type { CardFace, Rank, Suit } from '../arcade';

/** A card on the table. `deck` tells the two physical decks of Spider apart. */
export type CardState = CardFace & { up: boolean; deck?: 0 | 1 };

/** A pile of cards, bottom first — the top (playable) card is the last element. */
export type Pile = CardState[];

export type Variant = 'klondike' | 'spider' | 'freecell';

/** Where a move picks cards up or puts them down. `index` is 0 for the waste. */
export type Loc = { pile: 'tableau' | 'foundation' | 'cell' | 'waste'; index: number };

/**
 * `move` carries `count` cards from the top of `from` onto `to`.
 * `stock` turns the Klondike stock (or redeals the waste) / deals a Spider row.
 */
export type Move = { kind: 'move'; from: Loc; to: Loc; count: number } | { kind: 'stock' };

export type KlondikeState = {
  variant: 'klondike';
  seed: number;
  draw: 1 | 3;
  /** How many times the waste has been turned back into the stock. Unlimited. */
  passes: number;
  stock: Pile;
  waste: Pile;
  foundations: Pile[];
  tableau: Pile[];
};

export type SpiderState = {
  variant: 'spider';
  seed: number;
  suits: 1 | 2 | 4;
  stock: Pile;
  /** Completed K→A runs, in the order they were removed (8 when won). */
  foundations: Pile[];
  tableau: Pile[];
};

export type FreeCellState = {
  variant: 'freecell';
  dealNumber: number;
  cells: (CardState | null)[];
  foundations: Pile[];
  tableau: Pile[];
};

export type SolitaireState = KlondikeState | SpiderState | FreeCellState;
