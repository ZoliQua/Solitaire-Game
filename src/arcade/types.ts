/**
 * Shared contract between every Zoltan's Arcade game and its hosts
 * (the standalone page and the Arcade-Game-Center portal).
 *
 * This folder is vendored byte-for-byte into each game repo as `src/arcade/`.
 * Edit it only in Arcade-Game-Center/packages/kit and run `npm run sync:kit`.
 */

export type ArcadeGameId = 'tetris' | 'snake' | '2048' | 'pacman' | 'gomoku' | 'tictactoe'
  | 'breakout' | 'invaders' | 'connect4' | 'nutsort' | 'holdem'
  | 'minesweeper' | 'solitaire' | 'ulti' | 'snapszer';

/** Lifecycle every game maps its own state machine onto. */
export type ArcadeStatus = 'idle' | 'running' | 'paused' | 'gameOver';

/**
 * How a run ended. Score-attack games (Tetris, Snake, 2048, Pac-Man, Breakout,
 * Space Invaders, Nut Sort) end with `over` (or `win` when the board is cleared / 2048
 * reached); duel games (Gomoku, Tic-Tac-Toe, Connect Four) end with `win` / `loss` / `draw` from the player's side.
 * `finished` = the player ended the run early with the Finish button: the score shown at that moment is
 * ranked even when it is 0, and it never counts as a win.
 */
export type RunOutcome = 'win' | 'loss' | 'draw' | 'over' | 'finished';

/** Extra detail for `onGameOver`; `finished` is true for a run ended early with the Finish button. */
export type GameOverInfo = { finished?: boolean };

export type RunResult = {
  score: number;
  /** Active (unpaused) play time of the run in whole seconds. */
  seconds: number;
  outcome: RunOutcome;
  /**
   * Whether the score counts towards Best and the global leaderboard.
   * False for e.g. local two-player rounds.
   */
  ranked: boolean;
};

export type ArcadeStatusInfo = {
  status: ArcadeStatus;
  score: number;
  seconds: number;
};

/** Props every exported `<XxxGame />` component accepts. */
export type ArcadeGameProps = {
  /**
   * True when rendered inside the portal shell: the game hides its own
   * page-level title/header because the portal already shows one.
   */
  embedded?: boolean;
  /**
   * Called once per ranked run: with a positive score after a natural game over (one argument),
   * or with any score, 0 included, and `{ finished: true }` when the player finished early.
   */
  onGameOver?: (score: number, info?: GameOverInfo) => void;
  /** Called once per finished run (ranked or not). */
  onRunEnd?: (run: RunResult) => void;
  /** Called whenever status, score or the run timer changes. */
  onStatusChange?: (info: ArcadeStatusInfo) => void;
};

/** Props every exported `<XxxDemo />` (landing-page attract mode) accepts. */
export type ArcadeDemoProps = {
  /** When false the demo freezes on its current frame (off-screen, reduced motion). */
  active?: boolean;
};
