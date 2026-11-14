import { emit, readString, writeString } from './storage';

/**
 * Tiny typed i18n: every dictionary is `Messages<K>`, so a key missing in any
 * language fails `typecheck`. The language is one shared preference
 * (`arcade.lang`) for the portal and every game on the same origin.
 */

export type Lang = 'en' | 'hu' | 'de';

export const LANGS: readonly Lang[] = ['en', 'hu', 'de'];
export const LANG_KEY = 'arcade.lang';
export const LANG_EVENT = 'arcade:lang';

/** Each language's own name, for switchers. */
export const LANG_NAMES: Record<Lang, string> = { en: 'English', hu: 'Magyar', de: 'Deutsch' };

/** BCP 47 locale used for number and date formatting. */
export const LANG_LOCALES: Record<Lang, string> = { en: 'en-US', hu: 'hu-HU', de: 'de-DE' };

export type Messages<K extends string> = Record<Lang, Record<K, string>>;
export type MessageVars = Record<string, string | number>;

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/** First browser language whose primary subtag is supported, if any. */
function browserLang(): Lang | null {
  try {
    if (typeof navigator === 'undefined') return null;
    const list = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const tag of list) {
      const primary = String(tag ?? '').toLowerCase().split('-')[0];
      if (isLang(primary)) return primary;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Last language `applyLang` could not persist (storage blocked or full).
 * Consulted only when storage has no value, so a page without storage still
 * remembers the switch for components that mount later. A successful write clears it.
 */
let unsavedLang: Lang | null = null;

/** Saved choice → in-memory fallback → browser language → English. (URL prefs are applied at boot by `applyUrlPrefs`.) */
export function readLang(): Lang {
  const stored = readString(LANG_KEY);
  if (isLang(stored)) return stored;
  return unsavedLang ?? browserLang() ?? 'en';
}

export type ApplyOptions = {
  /**
   * Persist and update `<html>` but emit no event. Only for boot-time
   * application before any listener renders (see `applyUrlPrefs`).
   */
  silent?: boolean;
};

/** Persist the language, set `<html lang>` and notify every listener on the page. */
export function applyLang(lang: Lang, opts: ApplyOptions = {}): void {
  unsavedLang = writeString(LANG_KEY, lang) ? null : lang;
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
  if (!opts.silent) emit(LANG_EVENT, lang);
}

/** Replace `{name}` placeholders; unknown placeholders are left as they are. */
export function interpolate(template: string, vars?: MessageVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole,
  );
}

/** Non-React lookup with English fallback (the hook `useMessages` wraps this). */
export function translate<K extends string>(dict: Messages<K>, lang: Lang, key: K, vars?: MessageVars): string {
  return interpolate(dict[lang]?.[key] ?? dict.en[key] ?? key, vars);
}

export type KitMessageKey =
  | 'statusIdle' | 'statusRunning' | 'statusPaused' | 'statusGameOver'
  | 'score' | 'best' | 'time' | 'plays' | 'level' | 'moves'
  | 'start' | 'resume' | 'pause' | 'restart' | 'newGame' | 'paused' | 'gameOver' | 'welcomeBack' | 'newBest'
  | 'autosaved' | 'discard' | 'savedJustNow' | 'savedSeconds' | 'savedMinutes' | 'savedHours'
  | 'controls'
  | 'openArcade' | 'otherGames' | 'moreGames' | 'playAll' | 'switchToLight' | 'switchToDark' | 'toggleTheme'
  | 'language' | 'dental' | 'dentalDesc' | 'onGitHub' | 'partOf' | 'license'
  | 'rulesButton' | 'rulesTitle' | 'rulesGoal' | 'rulesPlay' | 'rulesRules' | 'rulesScoring' | 'rulesDental'
  | 'rulesMobile' | 'rulesClose'
  | 'finishButton' | 'finishConfirm' | 'finishYes' | 'finishNo' | 'finishedEarly'
  | 'fullscreen' | 'fullscreenExit' | 'iosHomeScreenTip' | 'touchControls';

/** Shared chrome strings, also available to games for their common labels. */
export const KIT_MESSAGES: Messages<KitMessageKey> = {
  en: {
    statusIdle: 'Ready',
    statusRunning: 'Playing',
    statusPaused: 'Paused',
    statusGameOver: 'Game over',
    score: 'Score',
    best: 'Best',
    time: 'Time',
    plays: 'Plays',
    level: 'Level',
    moves: 'Moves',
    start: 'Start',
    resume: 'Resume',
    pause: 'Pause',
    restart: 'Restart',
    newGame: 'New game',
    paused: 'Paused',
    gameOver: 'Game over',
    welcomeBack: 'Welcome back',
    newBest: 'New best!',
    autosaved: 'Autosaved',
    discard: 'Discard',
    savedJustNow: 'just now',
    savedSeconds: '{n}s ago',
    savedMinutes: '{n} min ago',
    savedHours: '{n} h ago',
    controls: 'Controls',
    openArcade: "Open Zoltan's Arcade",
    otherGames: 'Other games',
    moreGames: 'More games',
    playAll: 'Play all in the Arcade →',
    switchToLight: 'Switch to light theme',
    switchToDark: 'Switch to dark theme',
    toggleTheme: 'Toggle theme (T)',
    language: 'Language',
    dental: 'Dental mode',
    dentalDesc: 'Teeth, toothbrushes and toothpaste in every game',
    onGitHub: '{name} on GitHub',
    partOf: 'Part of {link}',
    license: 'MIT © {author}',
    rulesButton: 'Rules',
    rulesTitle: '{game} — rules',
    rulesGoal: 'Goal',
    rulesPlay: 'How to play',
    rulesRules: 'Rules',
    rulesScoring: 'Scoring',
    rulesDental: 'Dental mode',
    rulesMobile: 'On mobile',
    rulesClose: 'Close',
    finishButton: 'Finish',
    finishConfirm: 'Finish the game? {score} points go on the leaderboard.',
    finishYes: 'Finish',
    finishNo: 'Cancel',
    finishedEarly: 'Finished early',
    fullscreen: 'Full screen',
    fullscreenExit: 'Exit full screen',
    iosHomeScreenTip: 'No browser bars: Share → Add to Home Screen.',
    touchControls: 'Touch controls',
  },
  hu: {
    statusIdle: 'Indulhat',
    statusRunning: 'Játékban',
    statusPaused: 'Szünet',
    statusGameOver: 'Vége a játéknak',
    score: 'Pont',
    best: 'Rekord',
    time: 'Idő',
    plays: 'Játszmák',
    level: 'Szint',
    moves: 'Lépések',
    start: 'Indítás',
    resume: 'Folytatás',
    pause: 'Szünet',
    restart: 'Újrakezdés',
    newGame: 'Új játék',
    paused: 'Szünet',
    gameOver: 'Vége a játéknak',
    welcomeBack: 'Üdv újra!',
    newBest: 'Új rekord!',
    autosaved: 'Elmentve',
    discard: 'Elvetés',
    savedJustNow: 'épp most',
    savedSeconds: '{n} másodperce',
    savedMinutes: '{n} perce',
    savedHours: '{n} órája',
    controls: 'Irányítás',
    openArcade: "A Zoltan's Arcade megnyitása",
    otherGames: 'További játékok',
    moreGames: 'Több játék',
    playAll: 'Az összes játék az Arcade-ben →',
    switchToLight: 'Váltás világos témára',
    switchToDark: 'Váltás sötét témára',
    toggleTheme: 'Témaváltás (T)',
    language: 'Nyelv',
    dental: 'Fogas mód',
    dentalDesc: 'Fogak, fogkefék és fogkrém minden játékban',
    onGitHub: '{name} a GitHubon',
    partOf: 'Az {link} része',
    license: 'MIT © {author}',
    rulesButton: 'Szabályok',
    rulesTitle: '{game} — szabályok',
    rulesGoal: 'Cél',
    rulesPlay: 'Így játssz',
    rulesRules: 'Szabályok',
    rulesScoring: 'Pontozás',
    rulesDental: 'Fogas mód',
    rulesMobile: 'Mobilon',
    rulesClose: 'Bezárás',
    finishButton: 'Befejezés',
    finishConfirm: 'Befejezed a játékot? {score} pont kerül a ranglistára.',
    finishYes: 'Befejezem',
    finishNo: 'Mégse',
    finishedEarly: 'Idő előtt befejezve',
    fullscreen: 'Teljes képernyő',
    fullscreenExit: 'Kilépés',
    iosHomeScreenTip: 'Böngészősáv nélkül: Megosztás → Főképernyőhöz adás.',
    touchControls: 'Érintéses irányítás',
  },
  de: {
    statusIdle: 'Bereit',
    statusRunning: 'Läuft',
    statusPaused: 'Pausiert',
    statusGameOver: 'Spiel vorbei',
    score: 'Punkte',
    best: 'Bestwert',
    time: 'Zeit',
    plays: 'Spiele',
    level: 'Level',
    moves: 'Züge',
    start: 'Start',
    resume: 'Weiter',
    pause: 'Pause',
    restart: 'Neustart',
    newGame: 'Neues Spiel',
    paused: 'Pausiert',
    gameOver: 'Spiel vorbei',
    welcomeBack: 'Willkommen zurück',
    newBest: 'Neuer Bestwert!',
    autosaved: 'Automatisch gespeichert',
    discard: 'Verwerfen',
    savedJustNow: 'gerade eben',
    savedSeconds: 'vor {n} s',
    savedMinutes: 'vor {n} Min.',
    savedHours: 'vor {n} Std.',
    controls: 'Steuerung',
    openArcade: "Zoltan's Arcade öffnen",
    otherGames: 'Weitere Spiele',
    moreGames: 'Mehr Spiele',
    playAll: 'Alle Spiele in der Arcade →',
    switchToLight: 'Zum hellen Design wechseln',
    switchToDark: 'Zum dunklen Design wechseln',
    toggleTheme: 'Design wechseln (T)',
    language: 'Sprache',
    dental: 'Zahnmodus',
    dentalDesc: 'Zähne, Zahnbürsten und Zahnpasta in jedem Spiel',
    onGitHub: '{name} auf GitHub',
    partOf: 'Teil von {link}',
    license: 'MIT © {author}',
    rulesButton: 'Regeln',
    rulesTitle: '{game} — Regeln',
    rulesGoal: 'Ziel',
    rulesPlay: 'So spielst du',
    rulesRules: 'Regeln',
    rulesScoring: 'Punktewertung',
    rulesDental: 'Zahnmodus',
    rulesMobile: 'Auf dem Handy',
    rulesClose: 'Schließen',
    finishButton: 'Beenden',
    finishConfirm: 'Spiel beenden? {score} Punkte kommen in die Bestenliste.',
    finishYes: 'Beenden',
    finishNo: 'Abbrechen',
    finishedEarly: 'Vorzeitig beendet',
    fullscreen: 'Vollbild',
    fullscreenExit: 'Vollbild beenden',
    iosHomeScreenTip: 'Ohne Browserleisten: Teilen → Zum Home-Bildschirm.',
    touchControls: 'Touch-Steuerung',
  },
};
