/* eslint-disable react-refresh/only-export-components -- static card art: components and their lookup tables live together; no fast refresh needed. */
import type { ReactNode } from 'react';

/**
 * Shared drawing kit for the Hungarian (Tell) deck: our own vector redraw in the spirit of the
 * public-domain 1835 Schneider József design. Card space is 100 × 160; court cards and aces are
 * double-headed (the top half 7..80 is drawn once and turned by 180° for the bottom half).
 * Flat shapes with dark-brown outlines (woodcut feel), muted period palette.
 */
export const W = 100;
export const H = 160;
/** The bottom half is the top half turned about the card centre. */
export const MIRROR = 'rotate(180 50 80)';

export const P = {
  stock: '#f3e7c9',
  stockShade: '#e6d5ac',
  ink: '#2e1d12',
  brick: '#b0452f',
  brickDark: '#7d2e1f',
  ochre: '#c99a34',
  ochreLight: '#e2bf6a',
  olive: '#6b7a36',
  oliveLight: '#a2a663',
  oliveDark: '#4b5726',
  brown: '#6e4527',
  brownLight: '#9b6a3e',
  skin: '#ecca9f',
  linen: '#faf3df',
  steel: '#9a9a8c',
  steelLight: '#c4c3b6',
  plum: '#5e3446',
  slate: '#56607a',
  sky: '#e9dfc3',
  snow: '#fbf8ef',
} as const;

/** Outline width for every flat shape. */
export const SW = 1.1;

/** Outline props for flat shapes. */
export const O = { stroke: P.ink, strokeWidth: SW, strokeLinejoin: 'round' as const };

/** A costume: each figure wears its own colours. */
export type Costume = { main: string; trim: string; hose: string; hat: string; feather: string };

/** Card stock with a double inner frame: the drawable area is 7..93 × 7..153. */
export function Frame({ children }: { children?: ReactNode }) {
  return (
    <>
      <rect x="1" y="1" width="98" height="158" rx="7" fill={P.stock} stroke={P.ink} strokeWidth="1.4" />
      <rect x="5" y="5" width="90" height="150" rx="3.5" fill="none" stroke={P.ink} strokeWidth="0.9" />
      <rect x="6.6" y="6.6" width="86.8" height="146.8" rx="2.6" fill="none" stroke={P.brown} strokeWidth="0.35" />
      {children}
    </>
  );
}

/** The thin rule with a small lozenge between the two halves of a double-headed card. */
export function Divider() {
  return (
    <g data-divider="">
      <path d="M7 80 H44 M56 80 H93" stroke={P.ink} strokeWidth="0.8" />
      <path d="M44 80 L50 77 L56 80 L50 83 Z" fill={P.ochre} stroke={P.ink} strokeWidth="0.7" strokeLinejoin="round" />
    </g>
  );
}

/** Short ribbon banner with folded tails (x 24..76), for the season name on the aces. */
export function Banner({ y, text }: { y: number; text: string }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <path d="M24 2.5 L31 2.5 L31 12.5 L24 12.5 L27 7.5 Z" fill={P.brickDark} {...O} />
      <path d="M76 2.5 L69 2.5 L69 12.5 L76 12.5 L73 7.5 Z" fill={P.brickDark} {...O} />
      <path d="M29 0 Q50 -2 71 0 L71 11 Q50 9 29 11 Z" fill={P.linen} {...O} />
      <text
        data-banner=""
        x="50"
        y="8"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="7"
        letterSpacing="0.8"
        fill={P.ink}
      >
        {text}
      </text>
    </g>
  );
}

/** A limb or staff drawn as a coloured stroke inside a dark outline. */
export function Limb({ d, color, w }: { d: string; color: string; w: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={P.ink} strokeWidth={w + SW * 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

export function Hand({ x, y, r = 2.6 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={P.skin} stroke={P.ink} strokeWidth={SW} />;
}

export type Beard = 'none' | 'mustache' | 'short' | 'pointed' | 'long';

/**
 * A head at (x, y) with radius r: eyes, nose, mouth; `beard` picks the facial hair,
 * `hair` adds side locks behind the face.
 */
export function Head({
  x,
  y,
  r = 8,
  beard = 'none',
  beardColor = P.brown,
  hair,
}: {
  x: number;
  y: number;
  r?: number;
  beard?: Beard;
  beardColor?: string;
  hair?: string;
}) {
  const k = r / 8;
  const bx = (dx: number) => x + dx * k;
  const by = (dy: number) => y + dy * k;
  const beardPath =
    beard === 'short'
      ? `M${bx(-7)} ${by(1)} Q${bx(-6)} ${by(11)} ${x} ${by(12.5)} Q${bx(6)} ${by(11)} ${bx(7)} ${by(1)} Q${x} ${by(6)} ${bx(-7)} ${by(1)} Z`
      : beard === 'pointed'
        ? `M${bx(-6.5)} ${by(2)} Q${bx(-5)} ${by(10)} ${x} ${by(16)} Q${bx(5)} ${by(10)} ${bx(6.5)} ${by(2)} Q${x} ${by(6.5)} ${bx(-6.5)} ${by(2)} Z`
        : beard === 'long'
          ? `M${bx(-7.4)} ${by(0)} Q${bx(-8)} ${by(16)} ${x} ${by(22)} Q${bx(8)} ${by(16)} ${bx(7.4)} ${by(0)} Q${x} ${by(6)} ${bx(-7.4)} ${by(0)} Z`
          : null;
  return (
    <g>
      {hair ? (
        <>
          <ellipse cx={bx(-7)} cy={by(1)} rx={3.2 * k} ry={6 * k} fill={hair} stroke={P.ink} strokeWidth={SW} />
          <ellipse cx={bx(7)} cy={by(1)} rx={3.2 * k} ry={6 * k} fill={hair} stroke={P.ink} strokeWidth={SW} />
        </>
      ) : null}
      <circle cx={x} cy={y} r={r} fill={P.skin} stroke={P.ink} strokeWidth={SW} />
      {beardPath ? <path d={beardPath} fill={beardColor} {...O} /> : null}
      <circle cx={bx(-2.8)} cy={by(-1.6)} r={0.85 * k} fill={P.ink} />
      <circle cx={bx(2.8)} cy={by(-1.6)} r={0.85 * k} fill={P.ink} />
      <path d={`M${bx(-4.4)} ${by(-3.6)} l${2.6 * k} ${-0.6 * k} M${bx(4.4)} ${by(-3.6)} l${-2.6 * k} ${-0.6 * k}`} stroke={P.ink} strokeWidth={0.6} />
      <path d={`M${x} ${by(-0.8)} l-0.9 ${2.6 * k} h1.4`} fill="none" stroke={P.ink} strokeWidth={0.6} />
      {beard === 'none' ? (
        <path d={`M${bx(-2.2)} ${by(4.2)} Q${x} ${by(5.4)} ${bx(2.2)} ${by(4.2)}`} fill="none" stroke={P.brown} strokeWidth={0.8} strokeLinecap="round" />
      ) : (
        <path
          d={`M${bx(-4.4)} ${by(4.4)} Q${bx(-2)} ${by(2.2)} ${x} ${by(3.2)} Q${bx(2)} ${by(2.2)} ${bx(4.4)} ${by(4.4)}`}
          fill="none"
          stroke={beard === 'mustache' ? beardColor : P.ink}
          strokeWidth={beard === 'mustache' ? 1.6 : 0.9}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** Upper body from the shoulders down to the divider; (x) is the centre line, the neck sits at y 47. */
export function Torso({ x = 50, fill, children }: { x?: number; fill: string; children?: ReactNode }) {
  return (
    <g>
      <path d={`M${x - 27} 82 Q${x - 27} 58 ${x - 13} 51.5 Q${x} 47.5 ${x + 13} 51.5 Q${x + 27} 58 ${x + 27} 82 Z`} fill={fill} {...O} />
      {children}
    </g>
  );
}
