import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  cardLabel,
  clearSession,
  formatClock,
  formatNumber,
  gameName,
  GameOverlay,
  KeyHelp,
  readString,
  SaveBadge,
  shouldIgnoreKey,
  StatPanel,
  useArcadeRun,
  useDental,
  useKitMessages,
  useLang,
  useMessages,
  useRestoredSession,
  useRunTimer,
  useSessionAutosave,
  writeString,
  type ArcadeGameProps,
  type ArcadeStatus,
  type OverlayAction,
} from './arcade';
import { DentalToggle } from './components/DentalToggle';
import { Table, type DeckStyle, type PileKey } from './components/Table';
import { useDrag } from './components/useDrag';
import { MESSAGES, type MessageKey } from './i18n';
import {
  autoComplete,
  bestMove,
  DEFAULT_MODE,
  findHint,
  fromSaved,
  isModeId,
  isSavedGame,
  movableCount,
  newGame,
  pileCards,
  playMove,
  randomSeed,
  sameLoc,
  seedOf,
  toSaved,
  undoGame,
  variantOfMode,
  type Game,
  type ModeId,
  type SavedGame,
} from './logic/game';
import { History } from './logic/history';
import { canAutoComplete, isLegalMove, isWon } from './logic/moves';
import type { Loc, Move, Variant } from './logic/types';
import styles from './SolitaireGame.module.css';

/** Bump when SavedGame changes shape; older saves are then discarded. */
export const SESSION_SCHEMA = 1;
export const MODE_KEY = 'solitaire.mode';
export const DECK_KEY = 'solitaire.deck';
/** How long a hint stays highlighted. */
export const HINT_MS = 3000;

type Phase = 'idle' | 'live' | 'paused';
type Confirm = { kind: 'newGame' } | { kind: 'mode'; mode: ModeId } | null;
type Picked = { from: Loc; count: number } | null;

const VARIANT_KEY: Record<Variant, MessageKey> = { klondike: 'variantKlondike', spider: 'variantSpider', freecell: 'variantFreecell' };
const RULES_KEY: Record<Variant, MessageKey> = { klondike: 'rulesKlondike', spider: 'rulesSpider', freecell: 'rulesFreecell' };
const OPTIONS: Record<Variant, [ModeId, MessageKey][]> = {
  klondike: [
    ['klondike1', 'draw1'],
    ['klondike3', 'draw3'],
  ],
  spider: [
    ['spider1', 'suits1'],
    ['spider2', 'suits2'],
    ['spider4', 'suits4'],
  ],
  freecell: [],
};

const KEYS: [string, MessageKey][] = [
  ['Tab', 'keyTab'],
  ['Enter', 'keyEnter'],
  ['↑ ↓', 'keyArrows'],
  ['H', 'keyHint'],
  ['U Ctrl+Z', 'keyUndo'],
  ['A', 'keyAuto'],
  ['D', 'keyStock'],
  ['N', 'keyNew'],
  ['Esc', 'keyEsc'],
  ['P', 'keyPause'],
];

const readMode = (): ModeId => {
  const m = readString(MODE_KEY);
  return isModeId(m) ? m : 'klondike1';
};
const readDeck = (): DeckStyle => (readString(DECK_KEY) === 'grey' ? 'grey' : 'color');

const isButtonTarget = (target: EventTarget | null): boolean =>
  target instanceof Element && (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button');
const isUndoChord = (e: KeyboardEvent): boolean =>
  (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'z' || e.key === 'Z');
const withoutModifiers = (e: KeyboardEvent): KeyboardEvent =>
  ({ target: e.target, metaKey: false, ctrlKey: false, altKey: false }) as unknown as KeyboardEvent;

export function SolitaireGame(props: ArcadeGameProps = {}) {
  const { embedded = false } = props;
  const t = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const [dental] = useDental();
  const restored = useRestoredSession<SavedGame>('solitaire', SESSION_SCHEMA, isSavedGame);
  // A won game is already recorded: it is never restored.
  const resumable = restored !== null && !isWon(restored.data.state) ? restored : null;

  const [game, setGame] = useState<Game>(() => {
    if (resumable) return fromSaved(resumable.data);
    const mode = readMode();
    return newGame(mode, randomSeed(mode));
  });
  const [phase, setPhase] = useState<Phase>(resumable ? 'paused' : 'idle');
  const [runKey, setRunKey] = useState(0);
  const [welcomeBack, setWelcomeBack] = useState(resumable !== null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [final, setFinal] = useState<{ score: number; seconds: number } | null>(null);
  const [hint, setHint] = useState<Move | null>(null);
  const [picked, setPicked] = useState<Picked>(null);
  const [focused, setFocused] = useState<PileKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deck, setDeckState] = useState<DeckStyle>(readDeck);

  const state = game.state;
  const variant = state.variant;
  const won = isWon(state);
  const status: ArcadeStatus = phase === 'idle' ? 'idle' : won ? 'gameOver' : phase === 'paused' ? 'paused' : 'running';
  const running = status === 'running';
  const interactive = running && confirm === null;

  const seconds = useRunTimer(running, runKey, runKey === 0 && resumable ? resumable.seconds : 0);
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;

  const score = final?.score ?? 0;
  const stats = useArcadeRun({
    gameId: 'solitaire',
    status,
    score,
    seconds: final?.seconds ?? seconds,
    runKey,
    outcome: 'win',
    props,
  });

  const saved = useMemo(() => toSaved(game), [game]);
  const savedAt = useSessionAutosave({
    gameId: 'solitaire',
    schema: SESSION_SCHEMA,
    enabled: phase !== 'idle' && !won,
    discard: phase === 'idle' || won,
    data: saved,
    seconds,
    score: 0,
  });

  // Leaving the tab pauses the game, so the clock never runs unseen.
  useEffect(() => {
    if (!running) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') setPhase((p) => (p === 'live' ? 'paused' : p));
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [running]);

  useEffect(() => {
    if (!hint) return;
    const id = window.setTimeout(() => setHint(null), HINT_MS);
    return () => window.clearTimeout(id);
  }, [hint]);

  useEffect(() => {
    if (!interactive) setPicked(null);
  }, [interactive]);

  // ── State changes (only through the engine) ────────────────
  const commit = useCallback((next: Game, prev: Game) => {
    if (next === prev) return false;
    setGame(next);
    setHint(null);
    setPicked(null);
    setMessage(null);
    if (isWon(next.state) && !isWon(prev.state)) {
      const secs = Math.max(1, secondsRef.current);
      // Scoring lands with the score model; a win is recorded with 0 points until then.
      setFinal({ score: 0, seconds: secs });
    }
    return true;
  }, []);

  const play = useCallback((move: Move) => (interactive ? commit(playMove(game, move), game) : false), [interactive, game, commit]);

  const tap = useCallback(
    (from: Loc, count: number) => {
      if (!interactive || from.pile === 'foundation') return;
      const m = bestMove(state, from, count);
      if (m) play(m);
      else {
        const cards = pileCards(state, from);
        const c = cards[cards.length - count];
        setMessage(c ? t('statusNoMove', { card: cardLabel(c, lang) }) : null);
      }
    },
    [interactive, state, play, t, lang],
  );

  const { drag, start: startDrag } = useDrag({
    enabled: interactive,
    onDrop: (from, count, to) => {
      if (!to || sameLoc(from, to)) return;
      if (!play({ kind: 'move', from, to, count })) setMessage(t('statusCantDrop'));
    },
    onTap: tap,
  });

  const stock = useCallback(() => {
    if (!interactive) return;
    if (!play({ kind: 'stock' }) && state.variant === 'spider' && state.stock.length > 0) setMessage(t('statusStockBlocked'));
  }, [interactive, play, state, t]);

  const undo = useCallback(() => {
    if (interactive) commit(undoGame(game), game);
  }, [interactive, game, commit]);

  const finish = useCallback(() => {
    if (interactive) commit(autoComplete(game), game);
  }, [interactive, game, commit]);

  const showHint = useCallback(() => {
    if (!interactive) return;
    const h = findHint(state);
    setPicked(null);
    setHint(h);
    setMessage(h ? null : t('statusNoMoves'));
  }, [interactive, state, t]);

  const activatePile = useCallback(
    (loc: Loc) => {
      if (!interactive) return;
      if (picked) {
        if (sameLoc(picked.from, loc)) {
          const m = bestMove(state, loc, picked.count);
          if (m) play(m);
          else setPicked(null);
          return;
        }
        for (let n = picked.count; n >= 1; n--) {
          const m: Move = { kind: 'move', from: picked.from, to: loc, count: n };
          if (isLegalMove(state, m)) {
            play(m);
            return;
          }
        }
        setMessage(t('statusCantDrop'));
        return;
      }
      if (variant === 'spider' && loc.pile === 'foundation') return;
      const count = movableCount(state, loc);
      if (count > 0) {
        setPicked({ from: loc, count });
        setHint(null);
        setMessage(null);
      }
    },
    [interactive, picked, state, variant, play, t],
  );

  const adjustPick = useCallback(
    (delta: number) => {
      if (!picked || picked.from.pile !== 'tableau') return;
      const max = movableCount(state, picked.from);
      setPicked({ from: picked.from, count: Math.min(max, Math.max(1, picked.count + delta)) });
    },
    [picked, state],
  );

  // ── Runs and modes ─────────────────────────────────────────
  const startRun = useCallback(
    (fresh: boolean, mode: ModeId = game.mode) => {
      if (fresh) setGame(newGame(mode, randomSeed(mode)));
      setFinal(null);
      setHint(null);
      setPicked(null);
      setMessage(null);
      setWelcomeBack(false);
      setConfirm(null);
      setPhase('live');
      setRunKey((n) => n + 1);
    },
    [game.mode],
  );
  const start = useCallback(() => startRun(false), [startRun]);
  const playAgain = useCallback(() => startRun(true), [startRun]);

  const togglePause = useCallback(() => {
    if (won || phase === 'idle') return;
    setWelcomeBack(false);
    setConfirm(null);
    setPhase((p) => (p === 'live' ? 'paused' : 'live'));
  }, [won, phase]);

  const inProgress = (status === 'running' || status === 'paused') && game.moves > 0;

  const switchMode = useCallback(
    (mode: ModeId) => {
      writeString(MODE_KEY, mode);
      if (phase === 'idle') {
        setGame(newGame(mode, randomSeed(mode)));
        setConfirm(null);
        setHint(null);
        setMessage(null);
        return;
      }
      startRun(true, mode);
    },
    [phase, startRun],
  );

  const selectMode = useCallback(
    (mode: ModeId) => {
      if (mode === game.mode) return;
      if (inProgress) setConfirm({ kind: 'mode', mode });
      else switchMode(mode);
    },
    [game.mode, inProgress, switchMode],
  );

  const requestNewGame = useCallback(() => {
    if (phase === 'idle') {
      switchMode(game.mode);
      return;
    }
    if (inProgress) setConfirm({ kind: 'newGame' });
    else playAgain();
  }, [phase, inProgress, game.mode, switchMode, playAgain]);

  const confirmDialog = useCallback(() => {
    if (!confirm) return;
    // Abandoning a game never records it: the run key changes while not game-over.
    if (confirm.kind === 'mode') switchMode(confirm.mode);
    else playAgain();
  }, [confirm, switchMode, playAgain]);
  const dismissDialog = useCallback(() => setConfirm(null), []);

  const discardSave = useCallback(() => {
    clearSession('solitaire');
    setGame(newGame(game.mode, randomSeed(game.mode)));
    setFinal(null);
    setWelcomeBack(false);
    setConfirm(null);
    setPhase('idle');
    setRunKey((n) => n + 1);
  }, [game.mode]);

  const setDeck = useCallback((d: DeckStyle) => {
    setDeckState(d);
    writeString(DECK_KEY, d);
  }, []);

  const primary = useCallback(() => {
    if (status === 'idle') start();
    else if (status === 'paused') togglePause();
    else if (status === 'gameOver') playAgain();
  }, [status, start, togglePause, playAgain]);

  // ── Keyboard ───────────────────────────────────────────────
  const keys = useRef({ interactive, confirm, picked, hint, primary, togglePause, confirmDialog, dismissDialog, undo, showHint, finish, stock, requestNewGame, adjustPick });
  keys.current = { interactive, confirm, picked, hint, primary, togglePause, confirmDialog, dismissDialog, undo, showHint, finish, stock, requestNewGame, adjustPick };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const o = keys.current;
      if (shouldIgnoreKey(e)) {
        if (!isUndoChord(e) || shouldIgnoreKey(withoutModifiers(e)) || !o.interactive) return;
        e.preventDefault();
        o.undo();
        return;
      }
      const key = e.key;
      if (o.confirm) {
        if (key === 'Enter') {
          e.preventDefault();
          o.confirmDialog();
        } else if (key === 'Escape') {
          e.preventDefault();
          o.dismissDialog();
        }
        return;
      }
      if (key === 'Enter' || key === ' ') {
        // A focused pile or button handles itself.
        if (isButtonTarget(e.target) || o.interactive) return;
        e.preventDefault();
        o.primary();
        return;
      }
      if (key === 'Escape' && o.interactive && (o.picked || o.hint)) {
        e.preventDefault();
        setPicked(null);
        setHint(null);
        return;
      }
      if (key === 'p' || key === 'P' || key === 'Escape') {
        e.preventDefault();
        o.togglePause();
        return;
      }
      if (!o.interactive) return;
      const lower = key.toLowerCase();
      const actions: Record<string, () => void> = {
        h: o.showHint,
        u: o.undo,
        a: o.finish,
        d: o.stock,
        n: o.requestNewGame,
        arrowup: () => o.adjustPick(1),
        arrowdown: () => o.adjustPick(-1),
      };
      const act = actions[lower];
      if (act && (!lower.startsWith('arrow') || o.picked)) {
        e.preventDefault();
        act();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── View ───────────────────────────────────────────────────
  const num = (n: number) => formatNumber(n, lang);
  const modeName = (mode: ModeId): string => {
    const v = variantOfMode(mode);
    const opt = OPTIONS[v].find(([m]) => m === mode);
    return opt ? `${t(VARIANT_KEY[v])} · ${t(opt[1])}` : t(VARIANT_KEY[v]);
  };
  const canFinish = interactive && canAutoComplete(state);
  const best = Math.max(stats.best, won ? score : 0);
  const newBest = won && score > stats.bestBeforeRun;
  const keyRows = KEYS.map(([keys, action]): [string, string] => [keys, t(action)]);

  const hintText = (h: Move): string => {
    if (h.kind === 'stock') return t('statusHintStock');
    const cards = pileCards(state, h.from);
    const c = cards[cards.length - h.count]!;
    const target =
      h.to.pile === 'foundation' ? t('targetFoundation') : h.to.pile === 'cell' ? t('targetCell') : t('targetColumn', { n: num(h.to.index + 1) });
    return t('statusHint', { card: cardLabel(c, lang), target });
  };

  let statusLabel: string | undefined;
  if (running) {
    if (picked) {
      const cards = pileCards(state, picked.from);
      const c = cards[cards.length - picked.count];
      statusLabel = c
        ? picked.count > 1
          ? t('statusPickedRun', { n: num(picked.count), card: cardLabel(c, lang) })
          : t('statusPicked', { card: cardLabel(c, lang) })
        : undefined;
    } else if (hint) statusLabel = hintText(hint);
    else if (message) statusLabel = message;
    else if (canAutoComplete(state)) statusLabel = t('statusAuto');
    else statusLabel = t('statusPlay');
  }

  let overlay: { title: string; message: string; actions: OverlayAction[] } | null = null;
  if (confirm?.kind === 'mode') {
    overlay = {
      title: t('switchTitle', { mode: modeName(confirm.mode) }),
      message: t('switchBody'),
      actions: [
        { label: t('switchConfirm'), onClick: confirmDialog, primary: true, kbd: 'Enter' },
        { label: t('keepPlaying'), onClick: dismissDialog, kbd: 'Esc' },
      ],
    };
  } else if (confirm?.kind === 'newGame') {
    overlay = {
      title: t('newGameTitle'),
      message: t('newGameBody'),
      actions: [
        { label: t('newGame'), onClick: confirmDialog, primary: true, kbd: 'Enter' },
        { label: t('keepPlaying'), onClick: dismissDialog, kbd: 'Esc' },
      ],
    };
  } else if (status === 'idle') {
    overlay = {
      title: gameName('solitaire', lang),
      message: t('idleBody', { mode: modeName(game.mode), rules: t(RULES_KEY[variant]) }),
      actions: [{ label: k('start'), onClick: start, primary: true, kbd: 'Enter' }],
    };
  } else if (status === 'paused') {
    overlay = welcomeBack
      ? {
          title: k('welcomeBack'),
          message: t('welcomeBody', { mode: modeName(game.mode), deal: num(seedOf(state)), moves: num(game.moves) }),
          actions: [
            { label: t('continue'), onClick: togglePause, primary: true, kbd: 'P' },
            { label: t('newGame'), onClick: playAgain },
          ],
        }
      : {
          title: k('paused'),
          message: t('pausedBody'),
          actions: [{ label: k('resume'), onClick: togglePause, primary: true, kbd: 'P' }],
        };
  } else if (status === 'gameOver') {
    overlay = {
      title: dental ? t('wonTitleDental') : t('wonTitle'),
      message:
        t('wonBody', {
          mode: modeName(game.mode),
          time: formatClock(final?.seconds ?? seconds),
          moves: num(game.moves),
          undos: num(game.undos),
          score: num(score),
        }) + (newBest ? t('newBestSuffix') : ''),
      actions: [{ label: t('playAgain'), onClick: playAgain, primary: true, kbd: 'Enter' }],
    };
  }

  const currentVariant = variantOfMode(game.mode);
  const options = OPTIONS[currentVariant];

  return (
    <div className={`arc-game ${styles.game}`} style={{ '--game-color': 'var(--game-solitaire)' } as CSSProperties}>
      {!embedded && (
        <header className="arc-game__head">
          <div>
            <h1 className="arc-game__title">{gameName('solitaire', lang)}</h1>
            <p className="arc-game__sub">{t('subtitle')}</p>
          </div>
        </header>
      )}

      <StatPanel
        status={status}
        statusLabel={statusLabel}
        items={[
          { label: k('moves'), value: num(game.moves) },
          { label: k('time'), value: formatClock(final?.seconds ?? seconds) },
          { label: k('score'), value: won ? num(score) : '—', highlight: newBest },
          { label: k('best'), value: num(best) },
        ]}
      />

      <div className={styles.layout}>
        <div className={`arc-game__board ${styles.boardWrap}`}>
          <Table
            state={state}
            deck={deck}
            dental={dental}
            interactive={interactive}
            drag={drag}
            picked={picked}
            hint={hint}
            focused={focused}
            onCardDown={startDrag}
            onStock={stock}
            onPileActivate={activatePile}
            onPileFocus={setFocused}
          />
          {overlay && <GameOverlay {...overlay} />}
        </div>

        <aside className={styles.side}>
          <section className="arc-panel">
            <h2 className="arc-panel__title">{t('panelGame')}</h2>
            <div className={styles.buttons}>
              <button
                type="button"
                className="arc-btn arc-btn--primary"
                onClick={status === 'running' || status === 'paused' ? togglePause : primary}
              >
                {status === 'running' ? k('pause') : status === 'paused' ? k('resume') : status === 'idle' ? k('start') : t('playAgain')}
              </button>
              <button type="button" className="arc-btn" onClick={requestNewGame}>
                {t('newGame')}
              </button>
            </div>
            <div className={styles.buttons}>
              <button type="button" className="arc-btn" onClick={undo} disabled={!interactive || !History.canUndo(game.history)}>
                {t('undo')} <kbd className="arc-kbd">U</kbd>
              </button>
              <button type="button" className="arc-btn" onClick={showHint} disabled={!interactive}>
                {t('hint')} <kbd className="arc-kbd">H</kbd>
              </button>
            </div>
            <div className={styles.buttons}>
              <button type="button" className="arc-btn" onClick={stock} disabled={!interactive || variant === 'freecell'}>
                {variant === 'spider' ? t('stockSpider') : t('stockKlondike')} <kbd className="arc-kbd">D</kbd>
              </button>
              <button type="button" className={`arc-btn${canFinish ? ' arc-btn--primary' : ''}`} onClick={finish} disabled={!canFinish}>
                {t('autoComplete')} <kbd className="arc-kbd">A</kbd>
              </button>
            </div>
            <p className={styles.note}>{t('dealNote', { deal: num(seedOf(state)) })}</p>
            <div className={styles.save}>
              <SaveBadge savedAt={phase !== 'idle' ? savedAt : null} onDiscard={discardSave} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{t('panelSettings')}</h2>
            <div className={styles.settings}>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>{t('settingGame')}</span>
                <div className="arc-segmented arc-segmented--full" role="group" aria-label={t('settingGame')}>
                  {(['klondike', 'spider', 'freecell'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={currentVariant === v}
                      onClick={() => selectMode(currentVariant === v ? game.mode : DEFAULT_MODE[v])}
                    >
                      {t(VARIANT_KEY[v])}
                    </button>
                  ))}
                </div>
              </div>
              {options.length > 0 && (
                <div className={styles.setting}>
                  <span className={styles.settingLabel}>{t('settingOption')}</span>
                  <div className="arc-segmented arc-segmented--full" role="group" aria-label={t('settingOption')}>
                    {options.map(([mode, label]) => (
                      <button key={mode} type="button" aria-pressed={game.mode === mode} onClick={() => selectMode(mode)}>
                        {t(label)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.setting}>
                <span className={styles.settingLabel}>{t('settingDeck')}</span>
                <div className="arc-segmented arc-segmented--full" role="group" aria-label={t('settingDeck')}>
                  {(['color', 'grey'] as const).map((d) => (
                    <button key={d} type="button" aria-pressed={deck === d} onClick={() => setDeck(d)}>
                      {d === 'color' ? t('deckColor') : t('deckGrey')}
                    </button>
                  ))}
                </div>
              </div>
              <DentalToggle className={styles.dentalRow} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">{t('panelKeys')}</h2>
            <KeyHelp rows={keyRows} />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default SolitaireGame;
