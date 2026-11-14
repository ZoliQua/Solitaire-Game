import { SUIT_SHAPE, type HSuit } from '../cards';
import { P } from './parts';

const O = { stroke: P.ink, strokeWidth: 5, strokeLinejoin: 'round' as const };

/** The four signs, drawn in a 100 × 100 box. */
function Art({ suit }: { suit: HSuit }) {
  switch (suit) {
    case 'piros':
      return (
        <>
          <path d="M50 94 C24 72 4 52 4 30 C4 14 16 4 30 4 C40 4 47 10 50 19 C53 10 60 4 70 4 C84 4 96 14 96 30 C96 52 76 72 50 94 Z" fill={P.brick} {...O} />
          <path d="M22 22 Q28 14 36 16" fill="none" stroke={P.linen} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case 'tok':
      // Round sleigh bell: suspension ring, band, slit with the clapper ball.
      return (
        <>
          <circle cx="50" cy="13" r="8" fill="none" stroke={P.ink} strokeWidth="9" />
          <circle cx="50" cy="13" r="8" fill="none" stroke={P.ochre} strokeWidth="4" />
          <circle cx="50" cy="57" r="37" fill={P.ochre} {...O} />
          <path d="M14 48 Q50 60 86 48 L86.4 60 Q50 72 13.6 60 Z" fill={P.brick} {...O} strokeWidth="4" />
          <path d="M28 79 Q50 88 72 79" fill="none" stroke={P.ink} strokeWidth="7" strokeLinecap="round" />
          <circle cx="50" cy="84" r="6.5" fill={P.brown} {...O} strokeWidth="4" />
          <path d="M28 32 Q36 24 46 23" fill="none" stroke={P.ochreLight} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case 'zold':
      // Leaf with a notched base, stem, midrib and three pairs of veins.
      return (
        <>
          <path d="M50 99 L50 84" stroke={P.ink} strokeWidth="9" strokeLinecap="round" />
          <path d="M50 99 L50 84" stroke={P.oliveDark} strokeWidth="4" strokeLinecap="round" />
          <path d="M50 3 C64 20 92 32 90 58 C88 76 70 85 55 84 L50 89 L45 84 C30 85 12 76 10 58 C8 32 36 20 50 3 Z" fill={P.olive} {...O} />
          <path
            d="M50 86 L50 14 M50 34 L37 24 M50 34 L63 24 M50 50 L29 39 M50 50 L71 39 M50 66 L24 57 M50 66 L76 57"
            fill="none"
            stroke={P.oliveDark}
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        </>
      );
    case 'makk':
      // Acorn: curled stem, scaly cup, smooth nut with a tip.
      return (
        <>
          <path d="M50 18 Q51 8 61 4" fill="none" stroke={P.ink} strokeWidth="9" strokeLinecap="round" />
          <path d="M50 18 Q51 8 61 4" fill="none" stroke={P.brown} strokeWidth="4" strokeLinecap="round" />
          <path d="M24 48 Q22 82 50 97 Q78 82 76 48 Z" fill={P.ochreLight} {...O} />
          <path d="M33 58 Q33 74 42 84" fill="none" stroke={P.linen} strokeWidth="5" strokeLinecap="round" />
          <path d="M16 48 Q16 17 50 15 Q84 17 84 48 Q50 57 16 48 Z" fill={P.brown} {...O} />
          <path
            d="M27 30 l5 6 l5 -6 M42 24 l5 6 l5 -6 M57 24 l5 6 l5 -6 M66 32 l4 5 l4 -5 M22 41 l5 6 l5 -6 M37 39 l5 6 l5 -6 M52 39 l5 6 l5 -6 M66 42 l5 5 l4 -5"
            fill="none"
            stroke={P.ink}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
  }
}

/** Suit sign centred at (x, y), `size` wide. `pip` marks it as a counted pip on VII–X. */
export function SuitSign({ suit, x, y, size, pip = false }: { suit: HSuit; x: number; y: number; size: number; pip?: boolean }) {
  const k = size / 100;
  return (
    <g
      data-suit-shape={SUIT_SHAPE[suit]}
      data-pip={pip ? '' : undefined}
      data-x={pip ? x : undefined}
      transform={`translate(${x - size / 2} ${y - size / 2}) scale(${k})`}>
      <Art suit={suit} />
    </g>
  );
}
