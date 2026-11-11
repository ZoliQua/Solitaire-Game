import type { CSSProperties, ReactNode } from 'react';

/**
 * The shared dental icon family (dental mode in every game). All icons use a
 * 100×100 viewBox and are told apart by shape, never by colour alone:
 * Molar, GoldCrown, Toothbrush, PasteDrop, Probe and Germ each have their own
 * silhouette; DecayedTooth has a chipped (notched) crown edge; Tooth and
 * SmileTooth share the incisor outline and differ by interior marks (the face).
 * Colours come from optional props, then CSS custom properties, then defaults:
 *   --arc-tooth-fill / --arc-tooth-stroke   enamel (Tooth, Molar, SmileTooth, DecayedTooth)
 *   --arc-tooth-shine                       enamel highlight streak (transparent hides it)
 *   --arc-dental-ink                        faces, cavities, bristle lines
 *   --arc-dental-accent                     brush handle, paste stripe
 *   --arc-germ                              germ body
 */
export type DentalIconProps = {
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  /** Accessible name; without it the icon is decorative (aria-hidden). */
  title?: string;
  /** Main fill override (e.g. a Tetris piece's colour). */
  fill?: string;
  /** Outline override. */
  stroke?: string;
};

// Incisor-like tooth with two roots (same outline as Gomoku / Tic-Tac-Toe pieces).
const TOOTH =
  'M30 14c-9 0-16 7-16 17 0 7 2 12 4 18 2 5 4 13 5 22 1 8 4 13 8 13 4 0 6-3 7-10 1-7 2-11 5-11 3 0 4 4 5 11 1 7 3 10 7 10 4 0 7-5 8-13 1-9 3-17 5-22 2-6 4-11 4-18 0-10-7-17-16-17-5 0-9 2-12 5-3-3-7-5-12-5z';
// Wide, flat-topped molar.
const MOLAR =
  'M18 22c0-8 6-12 14-12 6 0 10 3 18 3s12-3 18-3c8 0 14 4 14 12 0 10-4 18-6 26-2 10-2 22-6 30-3 6-8 6-10 0-2-8-3-16-10-16s-8 8-10 16c-2 6-7 6-10 0-4-8-4-20-6-30-2-8-6-16-6-26z';

// Same incisor with a chipped, zig-zag notch in the upper-right crown edge.
const TOOTH_CHIPPED =
  'M30 14c-9 0-16 7-16 17 0 7 2 12 4 18 2 5 4 13 5 22 1 8 4 13 8 13 4 0 6-3 7-10 1-7 2-11 5-11 3 0 4 4 5 11 1 7 3 10 7 10 4 0 7-5 8-13 1-9 3-17 5-22 2-6 4-11 4-18l-13-2 7-6-9-4-1-5c-5 0-9 2-12 5-3-3-7-5-12-5z';

const ENAMEL = 'var(--arc-tooth-fill, #f7f8fb)';
const OUTLINE = 'var(--arc-tooth-stroke, #9aa3b5)';
const INK = 'var(--arc-dental-ink, #1b1d27)';
const ACCENT = 'var(--arc-dental-accent, #42d392)';

function Svg({ size = 24, className, style, title, children }: DentalIconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {children}
    </svg>
  );
}

function Enamel({ d, fill, stroke }: { d: string; fill?: string; stroke?: string }) {
  return (
    <>
      <path d={d} fill={fill ?? ENAMEL} stroke={stroke ?? OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <path d="M34 24q-8 4-8 14" fill="none" stroke="var(--arc-tooth-shine, #fff)" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    </>
  );
}

/** Front tooth (incisor) with two roots. */
export function Tooth(props: DentalIconProps) {
  return (
    <Svg {...props}>
      <Enamel d={TOOTH} fill={props.fill} stroke={props.stroke} />
    </Svg>
  );
}

/** Wide, flat-crowned back tooth — a different silhouette from `Tooth`. */
export function Molar(props: DentalIconProps) {
  return (
    <Svg {...props}>
      <Enamel d={MOLAR} fill={props.fill} stroke={props.stroke} />
    </Svg>
  );
}

/** Tooth with eyes and a smile (Snake head, Pac-Man, 2048 tiles). */
export function SmileTooth(props: DentalIconProps) {
  return (
    <Svg {...props}>
      <Enamel d={TOOTH} fill={props.fill} stroke={props.stroke} />
      <circle cx="40" cy="40" r="4.5" fill={INK} />
      <circle cx="60" cy="40" r="4.5" fill={INK} />
      <path d="M38 52q12 11 24 0" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
    </Svg>
  );
}

/** Five-point crown with a band and jewels (2048 top tile, Nut Sort nuts). */
export function GoldCrown(props: DentalIconProps) {
  const fill = props.fill ?? 'var(--arc-crown-fill, #f4c84a)';
  const stroke = props.stroke ?? 'var(--arc-crown-stroke, #a8871f)';
  return (
    <Svg {...props}>
      <path
        d="M12 74 8 30l22 20L50 16l20 34 22-20-4 44z"
        fill={fill}
        stroke={stroke}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="12" y="72" width="76" height="14" rx="4" fill={fill} stroke={stroke} strokeWidth="4" />
      <circle cx="8" cy="28" r="5" fill={fill} stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="14" r="5" fill={fill} stroke={stroke} strokeWidth="3" />
      <circle cx="92" cy="28" r="5" fill={fill} stroke={stroke} strokeWidth="3" />
      <circle cx="50" cy="79" r="3.5" fill={stroke} />
      <circle cx="30" cy="79" r="3" fill={stroke} />
      <circle cx="70" cy="79" r="3" fill={stroke} />
    </Svg>
  );
}

/** Diagonal toothbrush: long handle, head with bristles. */
export function Toothbrush(props: DentalIconProps) {
  const handle = props.fill ?? 'var(--arc-brush-handle, #6b8cff)';
  const stroke = props.stroke ?? OUTLINE;
  return (
    <Svg {...props}>
      <g transform="rotate(-40 50 50)">
        <rect x="4" y="56" width="90" height="12" rx="6" fill={handle} />
        <rect x="62" y="36" width="30" height="20" rx="3" fill="var(--arc-bristle, #e9f6ff)" stroke={stroke} strokeWidth="2.5" />
        {[66, 71, 76, 81, 86].map((x) => (
          <line key={x} x1={x} y1="38" x2={x} y2="54" stroke={stroke} strokeWidth="2" />
        ))}
      </g>
    </Svg>
  );
}

/** Striped toothpaste drop (Snake food, Pac-Man dots, Space Invaders shots). */
export function PasteDrop(props: DentalIconProps) {
  const fill = props.fill ?? 'var(--arc-paste, #e9f6ff)';
  const stroke = props.stroke ?? ACCENT;
  return (
    <Svg {...props}>
      <path d="M50 8C42 22 20 44 20 64a30 30 0 0 0 60 0C80 44 58 22 50 8z" fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      <path d="M23 62q14-9 27 0t27 0" fill="none" stroke={stroke} strokeWidth="7" strokeLinecap="round" />
      <path d="M36 72q2 10 12 13" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
    </Svg>
  );
}

/** Dental probe: straight handle ending in a hooked tip. */
export function Probe(props: DentalIconProps) {
  const stroke = props.stroke ?? 'var(--arc-probe, #9aa3b5)';
  return (
    <Svg {...props}>
      <path d="M14 88 58 44" stroke={stroke} strokeWidth="11" strokeLinecap="round" />
      {[24, 32, 40].map((p) => (
        <path key={p} d={`M${p - 5} ${97 - p}l10 10`} stroke={props.fill ?? INK} strokeWidth="2" opacity="0.45" />
      ))}
      <path d="M58 44 74 28q8-8 14-2 5 6-3 12" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Spiky round bacterium with a face (Pac-Man ghosts, Space Invaders aliens). */
export function Germ(props: DentalIconProps) {
  const body = props.fill ?? 'var(--arc-germ, #ef4c55)';
  const spikes = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  return (
    <Svg {...props}>
      {spikes.map((a) => (
        <g key={a}>
          <line
            x1="50"
            y1="50"
            x2={(50 + Math.cos(a) * 42).toFixed(1)}
            y2={(50 + Math.sin(a) * 42).toFixed(1)}
            stroke={props.stroke ?? body}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx={(50 + Math.cos(a) * 42).toFixed(1)} cy={(50 + Math.sin(a) * 42).toFixed(1)} r="5" fill={props.stroke ?? body} />
        </g>
      ))}
      <circle cx="50" cy="50" r="28" fill={body} />
      <circle cx="40" cy="44" r="6" fill="#fff" />
      <circle cx="60" cy="44" r="6" fill="#fff" />
      <circle cx="41" cy="45" r="2.6" fill={INK} />
      <circle cx="61" cy="45" r="2.6" fill={INK} />
      <path d="M38 60q12-8 24 0" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

/** Chipped tooth with dark cavities and a crack (caries; eroded Space Invaders bunkers). */
export function DecayedTooth(props: DentalIconProps) {
  const cavity = 'var(--arc-caries, #4a3a2a)';
  return (
    <Svg {...props}>
      <Enamel d={TOOTH_CHIPPED} fill={props.fill} stroke={props.stroke} />
      <circle cx="38" cy="36" r="8" fill={cavity} />
      <circle cx="54" cy="54" r="5" fill={cavity} />
      <path d="M59 30l-4 9 5 5-3 8" fill="none" stroke={cavity} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
