# Solitaire Game — CLAUDE.md

## Project Facts

* **Repository**: https://github.com/ZoliQua/Solitaire-Game (package `solitaire-game`)
* **Portal**: https://github.com/ZoliQua/Arcade-Game-Center — arcade id **`solitaire`**, colour token `--game-solitaire`,
  play URL https://dulzoltan.hu/arcade/#/play/solitaire. The same `src/` is mirrored into `Arcade-Game-Center/apps/solitaire/`.
* **Names**: en "Solitaire", hu „Pasziánsz”, de „Solitär”.
* **Sister games**: Tetris, Snake (the reference implementation), 2048, Pac-Man, Gomoku, Tic-Tac-Toe, Breakout, Space Invaders,
  Connect Four, Nut Sort, Texas Hold'em, Minesweeper, Ulti. The closest sibling is Texas Hold'em (French deck via the kit's
  `PlayingCard` / `cardLabel`).
* **Stack**: React 18.3, Vite 5.4, TypeScript 5.6, CSS Modules on the shared arcade tokens. No other runtime dependencies.
* **Package manager**: npm. **Node**: >=20.
* **Scripts**:
  * `npm run dev` — local dev server
  * `npm run build` — `tsc -b && vite build`
  * `npm run preview` — preview production build
  * `npm run typecheck` — `tsc -b`
  * `npm run lint` — ESLint (flat config, typescript-eslint)
  * `npm test` — Vitest (logic + component tests, jsdom)
  * `npm run check` — lint → typecheck → test → build (same as CI)
* **Variants**: Klondike (draw 1 / draw 3, unlimited redeals), Spider (1 / 2 / 4 suits, 104 cards, 10 columns),
  FreeCell (Microsoft deal numbers, 4 cells, supermove `(cells + 1) × 2^emptyColumns`).
* **Cards**: `CardState = CardFace & { up: boolean; deck?: 0 | 1 }` — `CardFace`, `Suit`, `Rank` come from the kit
  (`src/arcade/cardLabels.ts`). A `Pile` is a `CardState[]` with the **top card last**.
* **Randomness**: deals are seeded (`mulberry32` in `src/logic/deck.ts`); FreeCell uses the classic Microsoft LCG.
* **Communication**: respond to the user in **Hungarian** in chat, even though this file and the codebase are in English.

If any fact above disagrees with the real repository, verify first and flag the divergence to the user before editing code.

---

## Primary Goal

A correct, type-safe set of patience games that runs standalone and embeds unchanged in the Arcade-Game-Center portal.

**Priority order**: correctness → truthfulness → verification → small diffs → maintainability → polish.

---

## Architecture

```
src/
  arcade/              # VENDORED shared kit from Arcade-Game-Center/packages/kit — never edit here
  logic/               # pure rules, no React
    deck.ts            # CardState, Pile, deck builders, seeded shuffle, colour/rank helpers
    klondike.ts        # dealKlondike + Klondike moves
    spider.ts          # dealSpider + Spider moves (run removal)
    freecell.ts        # dealFreeCell (Microsoft deal) + FreeCell moves (supermove limit)
    moves.ts           # variant-agnostic legalMoves / applyMove / isWon / autoFoundation / canAutoComplete
    history.ts         # History: push / undo of immutable states
    game.ts            # modes, playMove (+ safe auto-moves), undo, auto-complete, hints, click targets, save validator
    scoring.ts         # base × timeFactor × undoFactor (only a won game scores; max 4000)
    *.test.ts
  components/          # Table, Pile, SuitMark, useDrag (pointer events), layout, DentalToggle
  i18n.ts              # en / hu / de strings
  SolitaireGame.tsx    # embeddable game, ArcadeGameProps
  demo/                # SolitaireDemo + script.ts (scripted solution of FreeCell deal #164)
  App.tsx              # exactly <ArcadeShell gameId="solitaire"><SolitaireGame /></ArcadeShell>
  main.tsx             # imports arcade/arcade.css once, applyTheme(readTheme())
  index.ts             # exports SolitaireGame, SolitaireDemo, default
  test/setup.ts
```

Stats, Best, session autosave/restore, timer, theme, stat strip and overlays come from `src/arcade/`
(`useArcadeRun`, `useSessionAutosave`, `useRestoredSession`, `useRunTimer`, `StatPanel`, `GameOverlay`, `SaveBadge`, `KeyHelp`).
Change the kit only in Arcade-Game-Center and sync it.

`src/logic/*` never imports from `react`, `hooks/` or `components/` (it may import pure helpers and types from `../arcade`).
Every engine function returns a new state and never mutates its input — `History` relies on that.

---

## Working Rules

**Verify before and after every non-trivial change.** Read the target file and its neighbours; afterwards re-check imports, call sites and state transitions.

**No hallucination.** Never claim a build, lint or test passed without running it.

**Small, local, reversible changes.** One fix or one feature at a time.

**Preserve architecture.** Do not change Vite config, tsconfig, folder layout or styling approach without a stated reason and user approval.

**No new dependencies** without justification. No Zustand, game engines, lodash, immer, animation libraries.

**CSS**: CSS Modules + kit tokens only. No `:root`, `html`, `body`, `*` or bare element selectors in game styles. Must look right in both `[data-theme='dark']` and `[data-theme='light']`.

**Colour-blind safe**: suits are always told apart by symbol and label, never by colour alone.

---

## Solitaire-Specific Bug Checklist

* Tableau builds down in alternating colours (Klondike, FreeCell) or down regardless of suit (Spider); only same-suit runs move as a unit in Spider.
* Only a King (or a King-led run) goes to an empty Klondike column; any card / run goes to an empty Spider or FreeCell column.
* Moving off a face-down card turns it face up; undo turns it back down.
* Spider stock never deals while a column is empty; a complete K→A same-suit run is removed at once.
* FreeCell supermove never exceeds `(freeCells + 1) × 2^emptyColumns` (halved when the target is an empty column).
* Auto-moves to the foundations are only the safe ones; undo restores the exact previous state.
* Demo: no keyboard, stats or storage writes; freezes when `active === false`. Hotkeys ignored while typing or with Cmd/Ctrl/Alt.

---

## End-of-Task Report

* **Changed files** — each file with a one-line reason.
* **Verified** — which checks actually ran.
* **Not verified** — explicit gaps.
* **Risks / follow-ups** — only real concerns, no filler.

---

## Git & Commit Rules

- Commit **only** as `Zoltán Dul <zoltan.dul@gmail.com>` (the global git identity).
- **Never** add `Co-Authored-By: Claude …`, "Generated with Claude Code" or any AI attribution
  to commit messages or pull-request descriptions.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
