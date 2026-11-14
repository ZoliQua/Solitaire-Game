import type { ReactNode } from 'react';
import {
  cardLabel,
  formatClock,
  formatNumber,
  Tooth,
  useDental,
  useIsTouch,
  useKitMessages,
  useLang,
  useMessages,
  type CardFace,
  type RulesSection,
} from './arcade';
import { MESSAGES } from './i18n';
import { modeLabel, RULES_KEY, TOUCH_ROWS, VARIANT_KEY } from './labels';
import { maxSupermove } from './logic/freecell';
import { deal, HISTORY_CAP, MODES, variantOfMode, type ModeId } from './logic/game';
import { BASE_POINTS, PAR_SECONDS, SOLITAIRE_MAX_SCORE, solitaireScore, TIME_FLOOR, UNDO_FLOOR, UNDO_STEP } from './logic/scoring';
import type { FreeCellState, KlondikeState, SpiderState } from './logic/types';

/** Plain two-colour ink, so the drawing matches its written "red" / "black" groups. */
const INK: Record<CardFace['suit'], string> = { S: '#1b1b1f', H: '#d62828', D: '#d62828', C: '#1b1b1f' };
const GLYPH: Record<CardFace['suit'], string> = { S: '♠', H: '♥', D: '♦', C: '♣' };
const RUN: CardFace[] = [
  { rank: 'K', suit: 'S' },
  { rank: 'Q', suit: 'H' },
  { rank: 'J', suit: 'C' },
  { rank: '10', suit: 'D' },
];
const isRed = (c: CardFace) => c.suit === 'H' || c.suit === 'D';

const CW = 54;
const CH = 76;
const STEP = 24;

function Face({ card, x, y }: { card: CardFace; x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={CW} height={CH} rx={6} fill="#fbfbf7" stroke="rgba(0,0,0,.45)" strokeWidth={1.2} />
      <text x={x + 5} y={y + 17} fontSize={15} fontWeight={800} fill={INK[card.suit]} fontFamily="ui-sans-serif, system-ui, sans-serif">
        {card.rank}
        {GLYPH[card.suit]}
      </text>
    </g>
  );
}

/**
 * Rules diagram: a Klondike / FreeCell column built down on a face-down card, alternating black (♠ ♣) and
 * red (♥ ♦) — each card carries its suit symbol and a written group, never colour alone — next to a foundation
 * built up from the ace. Dental mode draws the tooth back and the tooth in the empty foundation, like the table.
 */
export function RunDiagram() {
  const m = useMessages(MESSAGES);
  const [lang] = useLang();
  const [dental] = useDental();
  const group = (c: CardFace) => (isRed(c) ? m('rulesDiagramRed') : m('rulesDiagramBlack'));
  const label = m('rulesDiagramLabel', { cards: RUN.map((c) => `${cardLabel(c, lang)} (${group(c)})`).join(', ') });
  const x0 = 12;
  const y0 = 10;
  const fx = 196;
  return (
    <svg
      viewBox="0 0 320 194"
      role="img"
      aria-label={label}
      style={{ width: '100%', maxWidth: 360, height: 'auto', display: 'block', margin: '8px auto' }}
    >
      {/* Face-down card under the run. */}
      <rect x={x0} y={y0} width={CW} height={CH} rx={6} fill="#2b3a7a" stroke="rgba(255,255,255,.7)" strokeWidth={1.5} />
      {dental ? (
        <g transform={`translate(${x0 + 15} ${y0 + 3})`}>
          <Tooth size={24} fill="rgba(255,255,255,.92)" stroke="rgba(255,255,255,.55)" />
        </g>
      ) : (
        <path d={`M${x0 + 27} ${y0 + 8}l12 12-12 12-12-12z`} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={1.5} />
      )}
      {RUN.map((c, i) => {
        const y = y0 + 30 + i * STEP;
        return (
          <g key={c.rank}>
            <Face card={c} x={x0} y={y} />
            <text x={x0 + CW + 8} y={y + 16} fontSize={12} fontWeight={700} fill="var(--text)">
              {GLYPH[c.suit]} {group(c)}
            </text>
          </g>
        );
      })}
      {/* "builds down" arrow beside the labels */}
      <path d={`M${x0 + CW + 92} ${y0 + 34}v${STEP * 3 + 4}`} stroke="var(--text-mute)" strokeWidth={2} markerEnd="url(#sol-rules-arrow)" />
      <defs>
        <marker id="sol-rules-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--text-mute)" />
        </marker>
      </defs>

      {/* Foundation: built up from the ace, plus an empty one (tooth in dental mode). */}
      <text x={fx} y={y0 + 12} fontSize={12} fontWeight={700} fill="var(--text)">
        {m('rulesDiagramHome')}: A → K
      </text>
      <Face card={{ rank: 'A', suit: 'H' }} x={fx} y={y0 + 24} />
      <Face card={{ rank: '2', suit: 'H' }} x={fx + 8} y={y0 + 46} />
      <rect x={fx + 70} y={y0 + 24} width={CW - 10} height={CH - 14} rx={6} fill="none" stroke="var(--text-mute)" strokeWidth={1.5} strokeDasharray="5 4" />
      {dental ? (
        <g data-testid="diagram-tooth" transform={`translate(${fx + 78} ${y0 + 40})`}>
          <Tooth size={28} />
        </g>
      ) : (
        <text x={fx + 92} y={y0 + 62} fontSize={18} fontWeight={800} fill="var(--text-mute)" textAnchor="middle">
          A
        </text>
      )}
    </svg>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- the diagram and its hook belong together
export function useRulesSections(): RulesSection[] {
  const m = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const touch = useIsTouch();
  const num = (n: number) => formatNumber(n, lang);
  const pct = (f: number) => num(Math.round(f * 100));
  const ios = typeof navigator !== 'undefined' && /iP(hone|od)/.test(navigator.userAgent);

  // Numbers of the real deals and helpers, never typed in by hand.
  const drawOf = (mode: ModeId) => (deal(mode, 1) as KlondikeState).draw;
  const spider = deal('spider1', 1) as SpiderState;
  const spiderCards = spider.tableau.reduce((n, p) => n + p.length, 0) + spider.stock.length;
  const fc = deal('freecell', 1) as FreeCellState;
  const fcOneEmpty: FreeCellState = { ...fc, tableau: fc.tableau.map((p, i) => (i === 0 ? [] : p)) };
  const best = MODES.reduce((a, b) => (BASE_POINTS[b] > BASE_POINTS[a] ? b : a));
  const example = { mode: 'klondike1' as ModeId, seconds: 600, undos: 5 };

  const mobile: ReactNode = (
    <ul>
      {TOUCH_ROWS.map(([g, a]) => (
        <li key={g}>{`${m(g)}: ${m(a)}`}</li>
      ))}
      <li>{m('rulesMobileFs', { fs: k('fullscreen') })}</li>
      {ios && <li>{k('iosHomeScreenTip')}</li>}
    </ul>
  );

  return [
    {
      id: 'goal',
      body: (
        <>
          <p>{m('rulesGoalIntro')}</p>
          <ul>
            {(['klondike', 'spider', 'freecell'] as const).map((v) => (
              <li key={v}>{`${m(VARIANT_KEY[v])}: ${m(RULES_KEY[v])}`}</li>
            ))}
          </ul>
          <RunDiagram />
        </>
      ),
    },
    {
      id: 'play',
      body: touch ? (
        <p>{m('rulesPlayTouch')}</p>
      ) : (
        <>
          <p>{m('rulesPlayMouse')}</p>
          <p>{m('rulesPlayKeys')}</p>
        </>
      ),
    },
    {
      id: 'rules',
      body: (
        <ul>
          <li>{m('rulesRuleKlondike', { one: num(drawOf('klondike1')), three: num(drawOf('klondike3')) })}</li>
          <li>{m('rulesRuleSpider', { decks: num(spiderCards / 52), cards: num(spiderCards), cols: num(spider.tableau.length) })}</li>
          <li>
            {m('rulesRuleFreecell', {
              cells: num(fc.cells.length),
              n: num(maxSupermove(fcOneEmpty, false)),
              m: num(maxSupermove(fcOneEmpty, true)),
            })}
          </li>
          <li>{m('rulesRuleAuto')}</li>
          <li>{m('rulesRuleUndo', { n: num(HISTORY_CAP) })}</li>
        </ul>
      ),
    },
    {
      id: 'scoring',
      body: (
        <>
          <p>{m('rulesScoringIntro')}</p>
          <ul>
            {MODES.map((mode) => (
              <li key={mode}>
                {m('rulesScoringMode', {
                  mode: modeLabel(mode, m),
                  base: num(BASE_POINTS[mode]),
                  par: num(PAR_SECONDS[variantOfMode(mode)] / 60),
                })}
              </li>
            ))}
          </ul>
          <p>{m('rulesScoringTime', { floor: pct(TIME_FLOOR) })}</p>
          <p>
            {m('rulesScoringUndo', {
              step: pct(UNDO_STEP),
              max: pct(1 - UNDO_FLOOR),
              n: num(Math.round((1 - UNDO_FLOOR) / UNDO_STEP)),
            })}
          </p>
          <p>
            {m('rulesScoringExample', {
              mode: modeLabel(example.mode, m),
              time: formatClock(example.seconds),
              undos: num(example.undos),
              score: num(solitaireScore(example.mode, example.seconds, example.undos)),
            })}
          </p>
          <p>{m('rulesScoringMax', { max: num(SOLITAIRE_MAX_SCORE), mode: modeLabel(best, m) })}</p>
          <p>{m('rulesScoringFinish', { zero: num(0) })}</p>
        </>
      ),
    },
    { id: 'dental', body: <p>{m('rulesDentalText')}</p> },
    { id: 'mobile', body: mobile },
  ];
}
