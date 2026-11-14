import type { HSuit } from '../cards';
import { Hand, Head, Limb, O, P, Torso } from './parts';

/** Each suit's king wears his own mantle and rides his own horse. */
const KING: Record<HSuit, { mantle: string; horse: string; mane: string; beard: string }> = {
  piros: { mantle: P.brick, horse: P.linen, mane: P.steel, beard: P.brownLight },
  tok: { mantle: P.ochre, horse: P.brownLight, mane: P.brown, beard: P.linen },
  zold: { mantle: P.olive, horse: P.steelLight, mane: P.slate, beard: P.brown },
  makk: { mantle: P.plum, horse: P.brown, mane: P.ink, beard: P.steel },
};

const ERMINE: [number, number][] = [[52, 58], [60, 61], [68, 58], [56, 70], [64, 70], [60, 78]];

/**
 * Király (top half): a crowned, bearded king seated on horseback, the horse's head and neck in front of him
 * turned to the left, his sceptre raised in the right hand. The kings are anonymous on the real deck.
 */
export function King({ suit }: { suit: HSuit }) {
  const k = KING[suit];
  return (
    <g>
      {/* rider */}
      <path d="M56 38 L56 50 L64 50 L64 38 Z" fill={P.skin} {...O} />
      <Torso x={60} fill={k.mantle}>
        <path d="M60 50 L60 82" stroke={P.linen} strokeWidth="6" />
        <path d="M57 50 V82 M63 50 V82" stroke={P.ink} strokeWidth="0.7" />
        {ERMINE.map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 0.6} ${y} l1.2 0 l-0.6 2.6 z`} fill={P.ink} stroke={P.ink} strokeWidth="0.5" />
        ))}
        <path d="M47 51.5 Q60 58 73 51.5 L74 55 Q60 62 46 55 Z" fill={P.linen} {...O} />
      </Torso>
      <Limb d="M78 18 L77 64" color={P.ochre} w={1.8} />
      <circle cx="78" cy="15.5" r="2.8" fill={P.ochre} {...O} />
      <path d="M78 12.7 V7.5 M75.8 9.6 H80.2" stroke={P.ink} strokeWidth="1.2" strokeLinecap="round" />
      <Limb d="M72 55 Q78 60 77 60" color={k.mantle} w={6} />
      <Hand x={77} y={59} r={2.8} />
      <Head x={60} y={31} r={8.3} beard="long" beardColor={k.beard} hair={k.beard} />
      <path d="M51.5 24 L51.5 13 L55 18 L58 11 L60 16.5 L62 11 L65 18 L68.5 13 L68.5 24 Z" fill={P.ochre} {...O} />
      <rect x="51" y="21" width="18" height="3.8" fill={P.ochreLight} {...O} />
      {[55, 60, 65].map((x) => (
        <circle key={x} cx={x} cy="22.9" r="0.95" fill={P.brick} />
      ))}
      {/* horse: neck and head in front of the rider, turned to the left */}
      <g data-mount="horse">
        <path
          d="M26 82 Q26 66 24 56 Q20 58 15 57.5 Q10 56.5 10.5 51.5 Q11 47.5 15 44 L24 34 L26 25 L30 31 L33 25.5 L35.5 32 Q46 40 52 56 Q55 68 58 82 Z"
          fill={k.horse}
          {...O}
        />
        <path d="M35.5 32 Q46 40 52 56 Q55 68 58 82 L53 82 Q50 68 46.5 58 Q41.5 45 32 37 Z" fill={k.mane} {...O} />
        <path d="M24 56 Q27 49 23 46" fill="none" stroke={P.ink} strokeWidth="0.7" />
        <ellipse cx="23" cy="40" rx="1.6" ry="1.2" fill={P.ink} />
        <path d="M13 49.5 q1.6 -1.4 3 0.4" fill="none" stroke={P.ink} strokeWidth="0.8" />
        <path d="M11 54 Q14 55.5 17 54.5" fill="none" stroke={P.ink} strokeWidth="0.7" />
        <path d="M15.5 45.5 L20 53.5 M27 35 L21.5 52" stroke={P.brickDark} strokeWidth="1.3" strokeLinecap="round" />
        <path d="M20.5 53 Q34 66 49 64" fill="none" stroke={P.brickDark} strokeWidth="1" />
      </g>
      <Limb d="M50 58 Q48 62 49 64" color={k.mantle} w={5} />
      <Hand x={49.5} y={64} />
    </g>
  );
}
