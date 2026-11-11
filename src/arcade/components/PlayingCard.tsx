import type { CSSProperties } from 'react';
import type { Lang } from '../i18n';
import { Tooth } from './DentalIcons';
import { cardBackLabel, cardLabel, type CardFace, type Suit } from '../cardLabels';

const SUIT_FILL = {
  color: { S: '#1b1b1f', H: '#d62828', D: '#1f6feb', C: '#1f9d45' },
  grey: { S: '#3b3d45', H: '#3b3d45', D: '#3b3d45', C: '#3b3d45' },
} as const;

/** Suit shapes as paths in a 100 × 100 box: drawn, not glyphs, so identical everywhere and distinct in grey. */
function SuitShape({ suit, fill, x, y, size }: { suit: Suit; fill: string; x: number; y: number; size: number }) {
  const t = `translate(${x} ${y}) scale(${size / 100})`;
  switch (suit) {
    case 'H':
      return <path data-suit="H" transform={t} fill={fill} d="M50 92 C22 70 2 50 2 29 C2 13 14 2 29 2 C39 2 46 8 50 17 C54 8 61 2 71 2 C86 2 98 13 98 29 C98 50 78 70 50 92 Z" />;
    case 'D':
      return <path data-suit="D" transform={t} fill={fill} d="M50 2 L88 50 L50 98 L12 50 Z" />;
    case 'S':
      return <path data-suit="S" transform={t} fill={fill} d="M50 2 C38 22 4 40 4 63 C4 78 15 87 28 87 C37 87 44 83 47 76 C46 88 41 94 32 98 L68 98 C59 94 54 88 53 76 C56 83 63 87 72 87 C85 87 96 78 96 63 C96 40 62 22 50 2 Z" />;
    case 'C':
      return (
        <g data-suit="C" transform={t} fill={fill}>
          <circle cx="50" cy="27" r="22" />
          <circle cx="25" cy="60" r="22" />
          <circle cx="75" cy="60" r="22" />
          <path d="M45 50 L55 50 C55 72 60 88 70 98 L30 98 C40 88 45 72 45 50 Z" />
        </g>
      );
  }
}

export type PlayingCardProps = {
  card: CardFace;
  faceDown?: boolean;
  /** `color` is four-colour (♠ black, ♥ red, ♦ blue, ♣ green); `grey` is one tone. */
  deck?: 'color' | 'grey';
  /** Tooth logo on the back. */
  dental?: boolean;
  /** Width in px. */
  size?: number;
  selected?: boolean;
  className?: string;
  /** Language of the default accessible name (default en). */
  lang?: Lang;
  /** Accessible name override. */
  title?: string;
};

export function PlayingCard({ card, faceDown = false, deck = 'color', dental = false, size = 64, selected = false, className, lang = 'en', title }: PlayingCardProps) {
  const cls = ['arc-card', faceDown ? 'arc-card--down' : '', selected ? 'arc-card--selected' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  const style: CSSProperties | undefined = size > 0 ? { width: size } : undefined;
  if (faceDown) {
    return (
      <svg className={cls} style={style} viewBox="0 0 100 140" role="img" aria-label={title ?? cardBackLabel(lang)} data-back="" data-deck={deck}>
        <rect x="1.5" y="1.5" width="97" height="137" rx="11" fill="#2b3a7a" stroke="rgba(255,255,255,.7)" strokeWidth="3" />
        <rect x="12" y="12" width="76" height="116" rx="7" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
        {dental ? (
          <g data-testid="card-back-tooth">
            <circle cx="50" cy="70" r="30" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.4)" strokeWidth="2" />
            <g transform="translate(26 46)">
              <Tooth size={48} fill="rgba(255,255,255,.92)" stroke="rgba(255,255,255,.55)" />
            </g>
          </g>
        ) : (
          <g data-testid="card-back-classic">
            <path d="M50 30 L70 70 L50 110 L30 70 Z" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" />
            <circle cx="50" cy="70" r="9" fill="rgba(255,255,255,.22)" />
          </g>
        )}
      </svg>
    );
  }
  const fill = SUIT_FILL[deck][card.suit];
  const label = title ?? cardLabel(card, lang);
  return (
    <svg className={cls} style={style} viewBox="0 0 100 140" role="img" aria-label={label} data-deck={deck} data-card={`${card.rank}${card.suit}`}>
      <title>{label}</title>
      <rect x="1.5" y="1.5" width="97" height="137" rx="11" fill="#fbfbf7" stroke={selected ? '#111' : 'rgba(0,0,0,.35)'} strokeWidth={selected ? 6 : 2} />
      <text
        x="9"
        y="38"
        fill={fill}
        fontSize={card.rank === '10' ? 31 : 36}
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        letterSpacing={card.rank === '10' ? -2 : 0}
      >
        {card.rank}
      </text>
      <SuitShape suit={card.suit} fill={fill} x={10} y={45} size={26} />
      <SuitShape suit={card.suit} fill={fill} x={34} y={66} size={60} />
    </svg>
  );
}
