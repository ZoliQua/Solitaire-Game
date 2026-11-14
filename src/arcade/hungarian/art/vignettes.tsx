/* eslint-disable react-refresh/only-export-components -- static card art: components and their lookup tables live together; no fast refresh needed. */
import type { ReactElement } from 'react';
import { Limb, O, P } from './parts';

/*
 * Small landscape vignettes in the middle band of VII–X (inside 10..90 × 68..92; the card clips them),
 * after the scenes of the Tell story on the real deck.
 */

export type Vignette = 'village' | 'lake' | 'hat' | 'castle';

const thin = { stroke: P.ink, strokeWidth: 0.6, strokeLinejoin: 'round' as const };

function Hills({ fill = P.oliveLight }: { fill?: string }) {
  return (
    <>
      <rect x="10" y="68" width="80" height="24" fill="#e8e2c6" />
      <path d="M10 80 Q24 72 40 78 Q58 84 72 76 Q82 72 90 76 L90 92 L10 92 Z" fill={fill} {...thin} />
    </>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 0.8} ${y} L${x - 0.6} ${y - 6} L${x + 0.6} ${y - 6} L${x + 0.8} ${y} Z`} fill={P.brown} {...thin} />
      <circle cx={x} cy={y - 8} r="3.6" fill={P.olive} {...thin} />
    </g>
  );
}

/** A village church among the hills. */
function Village() {
  return (
    <g>
      <Hills />
      <path d="M44 84 L44 76 L52 76 L52 84 Z" fill={P.linen} {...thin} />
      <path d="M43 76 L48 72 L53 76 Z" fill={P.brick} {...thin} />
      <path d="M52 84 L52 72 L56 72 L56 84 Z" fill={P.linen} {...thin} />
      <path d="M51.5 72 L54 65.5 L56.5 72 Z" fill={P.brickDark} {...thin} />
      <path d="M32 85 L32 80 L38 80 L38 85 Z" fill={P.linen} {...thin} />
      <path d="M31 80 L35 77 L39 80 Z" fill={P.brick} {...thin} />
      <Tree x={22} y={86} />
      <Tree x={70} y={84} />
      <Tree x={78} y={86} />
      <path d="M10 90 Q50 86 90 90" fill="none" stroke={P.oliveDark} strokeWidth="0.8" />
    </g>
  );
}

/** The lake with Tell's boat under the mountains. */
function Lake() {
  return (
    <g>
      <rect x="10" y="68" width="80" height="24" fill="#e6e2cf" />
      <path d="M10 82 L22 70 L32 78 L44 69 L58 80 L70 71 L90 82 Z" fill={P.steel} {...thin} />
      <path d="M40 72 L44 69 L48 72 Z M66 73.5 L70 71 L74 73.5 Z" fill={P.snow} {...thin} />
      <rect x="10" y="81" width="80" height="11" fill={P.slate} {...thin} />
      <path d="M14 85 h8 M30 88 h10 M60 86 h8 M74 89 h10" stroke={P.steelLight} strokeWidth="0.7" />
      <path d="M40 84 Q50 89 62 84 L60 86.5 Q50 89 42 86.5 Z" fill={P.brown} {...thin} />
      <path d="M50 84 L50 73 L57 82 Z" fill={P.linen} {...thin} />
    </g>
  );
}

/** Gessler's hat on the pole in the market meadow. */
function Hat() {
  return (
    <g>
      <Hills fill={P.olive} />
      <Limb d="M50 89 L50 74" color={P.brown} w={1.2} />
      <path d="M44 74 Q44 68.5 50 68.5 Q56 68.5 56 74 Z" fill={P.oliveDark} {...thin} />
      <ellipse cx="50" cy="74" rx="8" ry="1.6" fill={P.oliveDark} {...thin} />
      <path d="M55 70 Q62 66 66 68 Q61 69 56 72 Z" fill={P.linen} {...thin} />
      <Tree x={22} y={86} />
      <Tree x={30} y={88} />
      <Tree x={76} y={86} />
    </g>
  );
}

/** A castle with a round tower on its hill. */
function Castle() {
  return (
    <g>
      <Hills />
      <path d="M38 84 L38 75 L62 75 L62 84 Z" fill={P.stockShade} {...thin} />
      <path d="M38 75 v-2 h3 v2 h3 v-2 h3 v2 h3 v-2 h3 v2 h3 v-2 h3 v2 h3 v-2 h2 v2" fill="none" stroke={P.ink} strokeWidth="0.6" />
      <path d="M54 84 L54 70 L60 70 L60 84 Z" fill={P.stockShade} {...thin} />
      <path d="M53 70 L57 64 L61 70 Z" fill={P.brick} {...thin} />
      <path d="M46 84 L46 79 Q48 77 50 79 L50 84 Z" fill={P.brown} {...thin} />
      <Tree x={20} y={86} />
      <Tree x={74} y={86} />
      <Tree x={82} y={88} />
    </g>
  );
}

export const VIGNETTES: Record<Vignette, () => ReactElement> = { village: Village, lake: Lake, hat: Hat, castle: Castle };

/** The ornamental frame of the vignette band. */
export function VignetteFrame() {
  return (
    <>
      <rect x="10" y="68" width="80" height="24" rx="5" fill="none" {...O} />
      <rect x="8.4" y="66.4" width="83.2" height="27.2" rx="6" fill="none" stroke={P.brown} strokeWidth="0.5" />
    </>
  );
}
