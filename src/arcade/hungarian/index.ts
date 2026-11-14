export * from './cards';
export { HungarianCard, type HungarianCardProps } from './HungarianCard';
/** A suit sign of the deck centred at (x, y), `size` wide (shape tells the suit, never colour alone). */
export { SuitSign as HSuitSign } from './art/SuitSign';
/** The deck's period palette and outline width, for game art drawn in the same woodcut look. */
export { P as H_PALETTE, SW as H_OUTLINE } from './art/parts';
/** A per-instance id safe for url(#…) references (React's useId values contain colons). */
export { svgId as hSvgId } from './art/svgId';
