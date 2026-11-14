/* eslint-disable react-refresh/only-export-components -- static card art: components and their lookup tables live together; no fast refresh needed. */
import type { ReactElement } from 'react';
import type { Season } from '../cards';
import { Limb, O, P, SW } from './parts';

/*
 * The four season scenes of the aces, drawn in the top half inside the cartouche 10..90 × 24..78
 * (the card clips them and turns them for the bottom half).
 */

const thin = { stroke: P.ink, strokeWidth: 0.6, strokeLinejoin: 'round' as const };

/** A small country figure, feet at (x, y), about 24 units tall. */
function Folk({ x, y, coat, skirt, hat }: { x: number; y: number; coat: string; skirt?: string; hat?: string }) {
  const top = y - 24;
  return (
    <g>
      {skirt ? (
        <path d={`M${x - 4} ${top + 11} L${x - 8} ${y} L${x + 8} ${y} L${x + 4} ${top + 11} Z`} fill={skirt} {...thin} />
      ) : (
        <>
          <path d={`M${x - 2.4} ${top + 15} L${x - 3} ${y}`} stroke={P.ink} strokeWidth="2.6" strokeLinecap="round" />
          <path d={`M${x + 2.4} ${top + 15} L${x + 3} ${y}`} stroke={P.ink} strokeWidth="2.6" strokeLinecap="round" />
          <path d={`M${x - 2.4} ${top + 15} L${x - 3} ${y - 1}`} stroke={P.brownLight} strokeWidth="1.4" strokeLinecap="round" />
          <path d={`M${x + 2.4} ${top + 15} L${x + 3} ${y - 1}`} stroke={P.brownLight} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      <path d={`M${x - 4.5} ${top + 7} Q${x} ${top + 5.5} ${x + 4.5} ${top + 7} L${x + 5} ${top + (skirt ? 13 : 17)} L${x - 5} ${top + (skirt ? 13 : 17)} Z`} fill={coat} {...thin} />
      <circle cx={x} cy={top + 3.4} r="3.2" fill={P.skin} {...thin} />
      {hat ? <path d={`M${x - 5.5} ${top + 2} Q${x} ${top - 3.5} ${x + 5.5} ${top + 2} Z`} fill={hat} {...thin} /> : null}
    </g>
  );
}

/** Piros ász — spring: a girl with a wreath under a blossoming tree, swallows over green hills. */
function Tavasz() {
  return (
    <g>
      <rect x="10" y="24" width="80" height="54" fill="#e8e6c8" />
      <path d="M10 58 Q30 48 50 55 Q70 61 90 50 L90 78 L10 78 Z" fill={P.oliveLight} {...O} />
      <path d="M10 66 Q40 60 60 66 Q78 71 90 64 L90 78 L10 78 Z" fill={P.olive} {...O} />
      <path d="M24 70 L25 52 L27 52 L28.5 70 Z" fill={P.brown} {...O} />
      {[
        [18, 44, 8], [28, 40, 9], [22, 34, 7], [33, 48, 6],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={P.oliveLight} {...O} />
      ))}
      {[
        [16, 41], [22, 46], [27, 36], [32, 43], [20, 33], [34, 50], [29, 47], [24, 30],
      ].map(([x, y]) => (
        <circle key={`b${x}-${y}`} cx={x} cy={y} r="1.5" fill={P.linen} stroke={P.brick} strokeWidth="0.6" />
      ))}
      <Folk x={60} y={72} coat={P.brick} skirt={P.slate} />
      <circle cx="68" cy="56" r="3.4" fill="none" stroke={P.olive} strokeWidth="1.6" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={68 + 3.4 * Math.cos((a * Math.PI) / 180)} cy={56 + 3.4 * Math.sin((a * Math.PI) / 180)} r="0.9" fill={P.brick} />
      ))}
      <path d="M64.5 57 L66 56" stroke={P.ink} strokeWidth="1" />
      <path d="M56 36 l3 2 l3 -2 M70 31 l2.4 1.6 l2.4 -1.6 M78 39 l2 1.4 l2 -1.4" fill="none" stroke={P.ink} strokeWidth="0.8" strokeLinecap="round" />
      {[[40, 72], [46, 75], [78, 72], [84, 76], [18, 75]].map(([x, y]) => (
        <circle key={`f${x}`} cx={x} cy={y} r="1.1" fill={P.ochreLight} stroke={P.ink} strokeWidth="0.4" />
      ))}
    </g>
  );
}

/** Tök ász — summer: the reaper with his sickle in the ripe wheat under a blazing sun. */
function Nyar() {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <g>
      <rect x="10" y="24" width="80" height="54" fill="#efdfb4" />
      <g transform="translate(76 37)">
        {rays.map((a) => (
          <path key={a} d="M-1.8 -7.5 L0 -12.5 L1.8 -7.5 Z" transform={`rotate(${a})`} fill={P.ochre} {...thin} />
        ))}
        <circle r="7" fill={P.ochreLight} stroke={P.ink} strokeWidth={SW} />
      </g>
      <path d="M10 56 Q50 50 90 56 L90 78 L10 78 Z" fill={P.ochre} {...O} />
      {[14, 20, 26, 34, 70, 78, 86].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 78 L${x + 0.5} ${52 + (i % 2) * 3}`} stroke={P.brown} strokeWidth="0.6" />
          <ellipse cx={x + 0.5} cy={50 + (i % 2) * 3} rx="1.3" ry="3.4" fill={P.ochreLight} {...thin} />
        </g>
      ))}
      <path d="M38 76 L42 58 L46 76 Z" fill={P.ochreLight} {...O} />
      <path d="M38.5 66 H45.5" stroke={P.brown} strokeWidth="1.4" />
      <path d="M41 58 l-2 -4 M42 58 l0 -5 M43 58 l2 -4" stroke={P.brown} strokeWidth="0.8" />
      <Folk x={58} y={74} coat={P.linen} hat={P.ochreLight} />
      <Limb d="M62 56 L66 62" color={P.linen} w={2} />
      <path d="M66 62 Q74 54 70 47 Q71 54 65 60" fill={P.steelLight} {...thin} />
    </g>
  );
}

/** Zöld ász — autumn: the vintner carrying grapes under the vine, a barrel at the press. */
function Osz() {
  const grapes: [number, number][] = [
    [26, 38], [30, 38], [34, 38], [28, 42], [32, 42], [30, 46],
    [62, 36], [66, 36], [70, 36], [64, 40], [68, 40], [66, 44],
  ];
  return (
    <g>
      <rect x="10" y="24" width="80" height="54" fill="#ead9b4" />
      <path d="M10 64 Q50 58 90 64 L90 78 L10 78 Z" fill={P.brownLight} {...O} />
      <Limb d="M10 31 Q30 26 50 31 Q70 36 90 29" color={P.brown} w={2.2} />
      {[[20, 30, -20, P.olive], [44, 30, 10, P.ochre], [78, 31, -10, P.olive], [56, 33, 20, P.brick]].map(([x, y, a, c]) => (
        <path
          key={`${x}`}
          d="M0 0 C-3 -1 -7 -1 -8 -5 C-6 -6 -5 -8 -6 -10 C-3 -10 -2 -11 0 -14 C2 -11 3 -10 6 -10 C5 -8 6 -6 8 -5 C7 -1 3 -1 0 0 Z"
          transform={`translate(${x} ${(y as number) + 6}) rotate(${a}) scale(0.8)`}
          fill={c as string}
          {...thin}
        />
      ))}
      {grapes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill={P.plum} {...thin} />
      ))}
      <path d="M68 76 Q66 66 68 56 L84 56 Q86 66 84 76 Z" fill={P.brown} {...O} />
      <path d="M67.2 61 H84.8 M67.2 71 H84.8" stroke={P.ink} strokeWidth="1.2" />
      <Folk x={42} y={74} coat={P.olive} hat={P.brown} />
      <path d="M45 54 Q52 52 54 58 L50 62 L45 60 Z" fill={P.ochreLight} {...thin} />
      {[[49, 54], [51.5, 55], [48, 56.5]].map(([x, y]) => (
        <circle key={`g${x}`} cx={x} cy={y} r="1.6" fill={P.plum} {...thin} />
      ))}
      {[[20, 58], [30, 50], [86, 46]].map(([x, y]) => (
        <path key={`l${x}`} d={`M${x} ${y} q2 -2 4 0 q-2 2 -4 0 Z`} fill={P.ochre} {...thin} />
      ))}
    </g>
  );
}

/** Makk ász — winter: a snowed-in cottage with smoke, a bare tree and a man hauling firewood. */
function Tel() {
  const flakes: [number, number][] = [[16, 30], [30, 34], [46, 28], [58, 40], [84, 30], [40, 44], [74, 46], [20, 52]];
  return (
    <g>
      <rect x="10" y="24" width="80" height="54" fill="#dcd9cc" />
      <path d="M10 62 Q40 56 60 62 Q76 66 90 60 L90 78 L10 78 Z" fill={P.snow} {...O} />
      <rect x="62" y="50" width="22" height="16" fill={P.brownLight} {...O} />
      <path d="M59 51 L73 40 L87 51 Z" fill={P.snow} {...O} />
      <rect x="78" y="40" width="4" height="7" fill={P.brick} {...O} />
      <path d="M80 39 Q76 34 80 30 Q84 26 80 22" fill="none" stroke={P.steel} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="66" y="55" width="6" height="5" fill={P.ochreLight} {...O} />
      <rect x="75" y="56" width="5" height="10" fill={P.brown} {...O} />
      <path d="M24 68 L25.5 40 L27.5 40 L29.5 68 Z" fill={P.brown} {...O} />
      {['M26 52 Q20 46 15 44', 'M27 47 Q33 40 37 36', 'M26.5 42 Q24 34 26 28', 'M28 57 Q34 54 38 50'].map((d) => (
        <Limb key={d} d={d} color={P.brown} w={1.4} />
      ))}
      <Folk x={46} y={74} coat={P.slate} hat={P.brown} />
      <path d="M38 56 L52 52" stroke={P.ink} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M38 56 L52 52" stroke={P.brownLight} strokeWidth="1.8" strokeLinecap="round" />
      {flakes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill={P.snow} stroke={P.ink} strokeWidth="0.35" />
      ))}
    </g>
  );
}

export const SEASON_SCENES: Record<Season, () => ReactElement> = { tavasz: Tavasz, nyar: Nyar, osz: Osz, tel: Tel };
