import { useId, type CSSProperties, type ReactNode } from 'react';
import type { Lang } from '../i18n';
import { SEASON_NAME, SEASON_OF_SUIT, hCardBackLabel, hCardLabel, hFigure, pipCount, type HCard, type HFigure, type HRank } from './cards';
import { Back } from './art/Back';
import { TELL_FIGURES } from './art/figures';
import { King } from './art/King';
import { Banner, Divider, Frame, H, MIRROR, O, P, W } from './art/parts';
import { SEASON_SCENES } from './art/seasons';
import { SuitSign } from './art/SuitSign';
import { svgId } from './art/svgId';
import { VIGNETTES, VignetteFrame, type Vignette } from './art/vignettes';

export type HungarianCardProps = {
  card: HCard;
  faceDown?: boolean;
  /** Tooth logo on the back. */
  dental?: boolean;
  /** Width in px (height follows the 100 × 160 card). */
  size?: number;
  selected?: boolean;
  className?: string;
  /** Language of the default accessible name (default en). */
  lang?: Lang;
  /** Accessible name override. */
  title?: string;
};

type NumberRank = 'VII' | 'VIII' | 'IX' | 'X';

const L = 26;
const R = 74;
const COLS = (ys: number[]) => ys.flatMap((y) => [[L, y] as const, [R, y] as const]);
const FOUR = COLS([28, 52, 108, 132]);

/** Traditional pip layouts: two side columns, extra pips on the centre line, the vignette band in the middle. */
const PIPS: Record<NumberRank, (readonly [number, number])[]> = {
  VII: [...COLS([28, 52, 108]), [50, 130]],
  VIII: FOUR,
  IX: [...FOUR, [50, 30]],
  X: [...FOUR, [50, 30], [50, 130]],
};

const VIGNETTE_OF: Record<NumberRank, Vignette> = { VII: 'village', VIII: 'lake', IX: 'hat', X: 'castle' };

const isNumber = (rank: HRank): rank is NumberRank => rank in PIPS;

/** The same drawing in the top half and, turned by 180°, in the bottom half (the real deck is double-headed). */
function DoubleHeaded({ children }: { children: ReactNode }) {
  return (
    <>
      <g data-half="top">{children}</g>
      <g data-half="bottom" transform={MIRROR}>
        {children}
      </g>
    </>
  );
}

function Numerals({ rank }: { rank: HRank }) {
  const text = (x: number, anchor: 'start' | 'end') => (
    <text
      data-numeral=""
      x={x}
      y={16}
      textAnchor={anchor}
      fontFamily="Georgia, 'Times New Roman', serif"
      fontWeight="700"
      fontSize="8.5"
      fill={P.ink}
    >
      {rank}
    </text>
  );
  const pair = (
    <>
      {text(10, 'start')}
      {text(W - 10, 'end')}
    </>
  );
  // Four corners: two read from the top, two (turned) from the bottom.
  return (
    <>
      <g>{pair}</g>
      <g transform={MIRROR}>{pair}</g>
    </>
  );
}

function TellFigure({ figure }: { figure: Exclude<HFigure, 'kiraly'> }) {
  const Figure = TELL_FIGURES[figure];
  return <Figure />;
}

type Clips = { half: string; scene: string; band: string };

function Face({ card, clips }: { card: HCard; clips: Clips }) {
  const { suit, rank } = card;
  if (rank === 'asz') {
    const season = SEASON_OF_SUIT[suit];
    const Scene = SEASON_SCENES[season];
    return (
      <g data-season={season}>
        <DoubleHeaded>
          <g clipPath={`url(#${clips.scene})`}>
            <Scene />
          </g>
          <rect x="10" y="24" width="80" height="54" rx="4" fill="none" {...O} strokeWidth={1.3} />
          <Banner y={9.5} text={SEASON_NAME[season]} />
          <g data-corner="">
            <SuitSign suit={suit} x={16} y={16} size={13} />
            <SuitSign suit={suit} x={84} y={16} size={13} />
          </g>
        </DoubleHeaded>
        <Divider />
      </g>
    );
  }
  const figure = hFigure(card);
  if (figure) {
    // Felső and Király: suit sign in the top-left corner; Alsó: lower on the left side, as on the real deck.
    const signY = rank === 'also' ? 60 : 16;
    return (
      <g data-figure={figure} data-rank={rank}>
        <DoubleHeaded>
          <g clipPath={`url(#${clips.half})`}>
            {figure === 'kiraly' ? <King suit={suit} /> : <TellFigure figure={figure} />}
          </g>
          <g data-corner="">
            <SuitSign suit={suit} x={15.5} y={signY} size={12} />
          </g>
        </DoubleHeaded>
        <Divider />
      </g>
    );
  }
  if (!isNumber(rank)) return null;
  const pips = PIPS[rank];
  if (pips.length !== pipCount(rank)) throw new Error(`pip layout mismatch for ${rank}`);
  const kind = VIGNETTE_OF[rank];
  const Scene = VIGNETTES[kind];
  return (
    <>
      <g data-vignette={kind}>
        <g clipPath={`url(#${clips.band})`}>
          <Scene />
        </g>
        <VignetteFrame />
      </g>
      <Numerals rank={rank} />
      {pips.map(([x, y]) => (
        <SuitSign key={`${x}-${y}`} suit={suit} x={x} y={y} size={18} pip />
      ))}
    </>
  );
}

/** One card of the Hungarian (Tell) deck: our own redraw after the 1835 Schneider József design, double-headed. */
export function HungarianCard({ card, faceDown = false, dental = false, size = 64, selected = false, className, lang = 'en', title }: HungarianCardProps) {
  const id = useId();
  const cls = ['arc-card', faceDown ? 'arc-card--down' : '', selected ? 'arc-card--selected' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  const style: CSSProperties | undefined = size > 0 ? { width: size } : undefined;
  const viewBox = `0 0 ${W} ${H}`;
  if (faceDown) {
    return (
      <svg className={cls} style={style} viewBox={viewBox} role="img" aria-label={title ?? hCardBackLabel(lang)} data-back="" data-dental={dental ? 'true' : 'false'}>
        <Back dental={dental} />
      </svg>
    );
  }
  const label = title ?? hCardLabel(card, lang);
  const clips: Clips = { half: svgId(id, 'hhalf'), scene: svgId(id, 'hscene'), band: svgId(id, 'hband') };
  return (
    <svg className={cls} style={style} viewBox={viewBox} role="img" aria-label={label} data-card={`${card.suit}-${card.rank}`} data-suit={card.suit}>
      <title>{label}</title>
      <defs>
        <clipPath id={clips.half}>
          <rect x="7" y="7" width="86" height="73" />
        </clipPath>
        <clipPath id={clips.scene}>
          <rect x="10" y="24" width="80" height="54" rx="4" />
        </clipPath>
        <clipPath id={clips.band}>
          <rect x="10" y="68" width="80" height="24" rx="5" />
        </clipPath>
      </defs>
      <Frame />
      <Face card={card} clips={clips} />
    </svg>
  );
}
