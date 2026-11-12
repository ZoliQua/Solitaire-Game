import type { Suit } from '../logic/types';

/** Same tones as the kit's PlayingCard (four-colour deck, or one grey tone). */
const FILL = {
  color: { S: '#1b1b1f', H: '#d62828', D: '#1f6feb', C: '#1f9d45' },
  grey: { S: '#3b3d45', H: '#3b3d45', D: '#3b3d45', C: '#3b3d45' },
} as const;

const PATH: Record<Exclude<Suit, 'C'>, string> = {
  H: 'M50 92 C22 70 2 50 2 29 C2 13 14 2 29 2 C39 2 46 8 50 17 C54 8 61 2 71 2 C86 2 98 13 98 29 C98 50 78 70 50 92 Z',
  D: 'M50 2 L88 50 L50 98 L12 50 Z',
  S: 'M50 2 C38 22 4 40 4 63 C4 78 15 87 28 87 C37 87 44 83 47 76 C46 88 41 94 32 98 L68 98 C59 94 54 88 53 76 C56 83 63 87 72 87 C85 87 96 78 96 63 C96 40 62 22 50 2 Z',
};

/**
 * A small suit shape in the empty top-right corner of a face-up card, so the suit stays readable by
 * its shape when cards overlap tightly (the card's own index suit sits lower and gets covered).
 */
export function SuitMark({ suit, deck }: { suit: Suit; deck: 'color' | 'grey' }) {
  const fill = FILL[deck][suit];
  return (
    <svg className="sol-suitmark" viewBox="0 0 100 140" aria-hidden="true" focusable="false" data-suitmark={suit}>
      <g transform="translate(64 7) scale(0.27)" fill={fill}>
        {suit === 'C' ? (
          <>
            <circle cx="50" cy="27" r="22" />
            <circle cx="25" cy="60" r="22" />
            <circle cx="75" cy="60" r="22" />
            <path d="M45 50 L55 50 C55 72 60 88 70 98 L30 98 C40 88 45 72 45 50 Z" />
          </>
        ) : (
          <path d={PATH[suit]} />
        )}
      </g>
    </svg>
  );
}
