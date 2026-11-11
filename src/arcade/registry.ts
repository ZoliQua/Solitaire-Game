import type { Lang } from './i18n';
import type { ArcadeGameId } from './types';

export type ArcadeGameInfo = {
  id: ArcadeGameId;
  /** English name (also the fallback for every language). */
  name: string;
  /** Established local names only; others keep `name`. Use `gameName(id, lang)`. */
  names: Partial<Record<Lang, string>>;
  /** GitHub repository of the standalone game. */
  repo: string;
  /** Short genre tag shown on cards. */
  tag: string;
  /** One-line pitch in English (= `taglines.en`). */
  tagline: string;
  /** One-line pitch per language. Use `gameTagline(id, lang)`. */
  taglines: Record<Lang, string>;
  /** CSS custom property holding the game's accent colour. */
  colorVar: string;
  /** Pre-kit localStorage key of the best score, migrated into stats. */
  legacyBestKey?: string;
};

export const ARCADE_PORTAL_URL = 'https://dulzoltan.hu/arcade/';
export const ARCADE_REPO_URL = 'https://github.com/ZoliQua/Arcade-Game-Center';
export const ARCADE_AUTHOR = 'Zoltán Dul';

const GAMES: readonly Omit<ArcadeGameInfo, 'tagline'>[] = [
  {
    id: 'tetris',
    name: 'Tetris',
    names: {},
    repo: 'https://github.com/ZoliQua/Tetris-Game',
    tag: 'Arcade',
    taglines: {
      en: 'Stack falling blocks, clear lines, chase a Tetris. SRS rotation, 7-bag, hold.',
      hu: 'Rendezd egymásra a hulló idomokat, töröld a teli sorokat, és vadássz Tetrisre! SRS-forgatás, 7-es zsák, félretétel.',
      de: 'Staple fallende Steine, räume Reihen ab und jage den Tetris. SRS-Drehung, 7er-Beutel, Hold.',
    },
    colorVar: '--game-tetris',
    legacyBestKey: 'tetris.highScore',
  },
  {
    id: 'snake',
    name: 'Snake',
    names: {},
    repo: 'https://github.com/ZoliQua/Snake-Game',
    tag: 'Reflex',
    taglines: {
      en: "Eat, grow, don't bite yourself. Adjustable speed, optional wall wrap.",
      hu: 'Egyél, nőj, és ne harapd meg magad! Állítható sebesség, választható átjárható fal.',
      de: 'Fressen, wachsen, nicht selbst beißen. Einstellbares Tempo, Wände optional durchlässig.',
    },
    colorVar: '--game-snake',
    legacyBestKey: 'snake.highScore',
  },
  {
    id: '2048',
    name: '2048',
    names: {},
    repo: 'https://github.com/ZoliQua/2048-Game',
    tag: 'Puzzle',
    taglines: {
      en: 'Slide tiles, merge equal numbers. Get to 2048 — and beyond.',
      hu: 'Csúsztasd a lapokat, vond össze az egyforma számokat. Irány a 2048 — és tovább!',
      de: 'Schiebe die Kacheln, vereine gleiche Zahlen. Bis 2048 — und darüber hinaus.',
    },
    colorVar: '--game-2048',
    legacyBestKey: '2048.highScore',
  },
  {
    id: 'pacman',
    name: 'Pac-Man',
    names: {},
    repo: 'https://github.com/ZoliQua/Pac-Man-Game',
    tag: 'Maze',
    taglines: {
      en: 'Gobble dots and power pellets while four ghosts scatter, chase and flee.',
      hu: 'Falj fel pöttyöt és erőpirulát, míg négy szellem szétszéled, üldöz és menekül.',
      de: 'Friss Punkte und Kraftpillen, während vier Geister ausschwärmen, jagen und fliehen.',
    },
    colorVar: '--game-pacman',
    legacyBestKey: 'pacman.highScore',
  },
  {
    id: 'gomoku',
    name: 'Gomoku',
    names: { hu: 'Amőba' },
    repo: 'https://github.com/ZoliQua/Gomoku-Game',
    tag: 'Strategy',
    taglines: {
      en: 'Five in a row on a 15×15 goban against an α-β minimax AI — or a friend.',
      hu: 'Öt egy sorban a 15×15-ös táblán egy α-β minimax gép — vagy egy barát — ellen.',
      de: 'Fünf in einer Reihe auf dem 15×15-Brett gegen eine α-β-Minimax-KI — oder einen Freund.',
    },
    colorVar: '--game-gomoku',
  },
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe',
    names: {},
    repo: 'https://github.com/ZoliQua/Tic-Tac-Toe-Game',
    tag: 'Duel',
    taglines: {
      en: 'Three in a row with tooth or X/O marks. The hard AI never loses.',
      hu: 'Három egy sorban fogakkal vagy X/O jelekkel. A nehéz gép sosem veszít.',
      de: 'Drei in einer Reihe mit Zähnen oder X/O. Die schwere KI verliert nie.',
    },
    colorVar: '--game-tictactoe',
  },
  {
    id: 'breakout',
    name: 'Breakout',
    names: {},
    repo: 'https://github.com/ZoliQua/Breakout-Game',
    tag: 'Paddle',
    taglines: {
      en: 'Bounce the ball, smash every brick. Power-ups, multiball, faster each level.',
      hu: 'Pattintsd a labdát, törd szét az összes téglát. Bónuszok, több labda, szintről szintre gyorsabban.',
      de: 'Lass den Ball springen und zertrümmere jeden Stein. Power-ups, Multiball, jedes Level schneller.',
    },
    colorVar: '--game-breakout',
  },
  {
    id: 'invaders',
    name: 'Space Invaders',
    names: {},
    repo: 'https://github.com/ZoliQua/Space-Invaders-Game',
    tag: 'Shooter',
    taglines: {
      en: 'Hold the line against marching alien waves. Crumbling bunkers, mystery UFO.',
      hu: 'Tartsd a frontot a menetelő idegen hullámok ellen. Omladozó bunkerek, rejtélyes ufó.',
      de: 'Halte die Stellung gegen anrückende Alien-Wellen. Bröckelnde Bunker, mysteriöses UFO.',
    },
    colorVar: '--game-invaders',
  },
  {
    id: 'connect4',
    name: 'Connect Four',
    names: { hu: 'Négy a sorban', de: 'Vier gewinnt' },
    repo: 'https://github.com/ZoliQua/Connect-Four-Game',
    tag: 'Duel',
    taglines: {
      en: 'Drop discs, line up four. A 7×6 classic against an α-β minimax AI — or a friend.',
      hu: 'Ejtsd be a korongokat, rakj ki négyet egy sorban. A 7×6-os klasszikus egy α-β minimax gép — vagy egy barát — ellen.',
      de: 'Wirf Scheiben ein und bilde eine Viererreihe. Der 7×6-Klassiker gegen eine α-β-Minimax-KI — oder einen Freund.',
    },
    colorVar: '--game-connect4',
  },
  {
    id: 'nutsort',
    name: 'Nut Sort',
    names: {},
    repo: 'https://github.com/ZoliQua/Nut-Sort-Game',
    tag: 'Sorting',
    taglines: {
      en: 'Sort the nuts onto bolts in as few moves as you can — shaped for colour-blind players.',
      hu: 'Rendezd a csavaranyákat a csavarokra minél kevesebb lépésből — színtévesztőknek is kitalálva.',
      de: 'Sortiere die Muttern mit möglichst wenigen Zügen auf die Schrauben — auch für Farbenblinde gemacht.',
    },
    colorVar: '--game-nutsort',
  },
  {
    id: 'holdem',
    name: "Texas Hold'em",
    names: {},
    repo: 'https://github.com/ZoliQua/Texas-Holdem-Game',
    tag: 'Cards',
    taglines: {
      en: "No-limit hold'em tournaments against bots with their own faces, styles and tells.",
      hu: "No-limit hold'em versenyek saját arcú, stílusú és árulkodó jelű gépi ellenfelek ellen.",
      de: "No-Limit-Hold'em-Turniere gegen Bots mit eigenen Gesichtern, Spielstilen und Tells.",
    },
    colorVar: '--game-holdem',
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    names: { hu: 'Aknakereső' },
    repo: 'https://github.com/ZoliQua/Minesweeper-Game',
    tag: 'Logic',
    taglines: {
      en: 'Classic, hex and time-attack minefields. Flag the mines, clear the rest.',
      hu: 'Klasszikus, hatszögletű és időre menő aknamezők. Jelöld az aknákat, tisztítsd meg a többit.',
      de: 'Klassische, hexagonale und Time-Attack-Minenfelder. Markiere die Minen, räume den Rest.',
    },
    colorVar: '--game-minesweeper',
  },
  {
    id: 'solitaire',
    name: 'Solitaire',
    names: { hu: 'Pasziánsz', de: 'Solitär' },
    repo: 'https://github.com/ZoliQua/Solitaire-Game',
    tag: 'Cards',
    taglines: {
      en: 'Klondike, Spider and FreeCell in one deck of patience.',
      hu: 'Klondike, Pók és FreeCell egyetlen pasziánsz-csomagban.',
      de: 'Klondike, Spider und FreeCell in einem Solitär-Paket.',
    },
    colorVar: '--game-solitaire',
  },
  {
    id: 'ulti',
    name: 'Ulti',
    names: {},
    repo: 'https://github.com/ZoliQua/Ulti-Game',
    tag: 'Cards',
    taglines: {
      en: 'The Hungarian card classic against two bots, with the old Tell deck.',
      hu: 'A magyar kártyaklasszikus két gépi ellenfél ellen, a régi Tell-kártyával.',
      de: 'Der ungarische Kartenklassiker gegen zwei Bots, mit dem alten Tell-Blatt.',
    },
    colorVar: '--game-ulti',
  },
];

export const ARCADE_GAMES: readonly ArcadeGameInfo[] = GAMES.map((g) => ({ ...g, tagline: g.taglines.en }));

export function gameInfo(id: ArcadeGameId): ArcadeGameInfo {
  const info = ARCADE_GAMES.find((g) => g.id === id);
  if (!info) throw new Error(`Unknown arcade game: ${id}`);
  return info;
}

/** The game's name in `lang` (established local names only, else English). */
export function gameName(id: ArcadeGameId, lang: Lang): string {
  const info = gameInfo(id);
  return info.names[lang] ?? info.name;
}

/** The game's one-line pitch in `lang`. */
export function gameTagline(id: ArcadeGameId, lang: Lang): string {
  const info = gameInfo(id);
  return info.taglines[lang] ?? info.tagline;
}
