# ♠️ Solitaire

A type-safe Solitaire built with **React 18**, **Vite** and **TypeScript**: three classic patience games on one table —
**Klondike** (draw 1 or draw 3), **Spider** (1, 2 or 4 suits) and **FreeCell** (the Microsoft deal numbers). Drag a card or a
run, click a card to send it to the best place, or play the whole game from the keyboard. Hints, undo, safe auto-moves and
one-key auto-complete included; suits are told apart by shape, so colour is only a bonus.
Runs on its own **and** as one of the fourteen games of **[Zoltan's Arcade](https://github.com/ZoliQua/Arcade-Game-Center)**:
play it at [dulzoltan.hu/arcade/#/play/solitaire](https://dulzoltan.hu/arcade/#/play/solitaire).

[![CI](https://github.com/ZoliQua/Solitaire-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Solitaire-Game/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Table of contents

- [The Zoltan's Arcade family](#%EF%B8%8F-the-zoltans-arcade-family)
- [Features](#-features)
- [Quick start](#-quick-start)
- [Games and rules](#-games-and-rules)
- [Controls](#%EF%B8%8F-controls)
- [Scoring & stats](#-scoring--stats)
- [Autosave & resume](#-autosave--resume)
- [Embedding in Arcade-Game-Center](#-embedding-in-arcade-game-center)
- [Scripts](#-scripts)
- [Architecture](#%EF%B8%8F-architecture)
- [Contributing](#-contributing)
- [License](#%EF%B8%8F-license)

## 🕹️ The Zoltan's Arcade family

Every game is a standalone repo that also plugs into the portal. They share one design system, one scoring model and one save format through the vendored [`src/arcade/`](./src/arcade) kit.

| Game | Repo | Genre |
| --- | --- | --- |
| 🏠 **Arcade portal** | [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) | All games in one place, live demos, stats, leaderboard |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reflex |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Puzzle |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Maze |
| ⚫ Gomoku | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Strategy |
| 🦷 Tic-Tac-Toe | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Duel |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Paddle |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Shooter |
| 🔴 Connect Four | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Duel |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Sorting |
| 🃏 Texas Hold'em | [Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game) | Cards |
| 💣 Minesweeper | [Minesweeper-Game](https://github.com/ZoliQua/Minesweeper-Game) | Logic |
| ♠️ **Solitaire** (this repo) | [Solitaire-Game](https://github.com/ZoliQua/Solitaire-Game) | Cards |
| 🎴 Ulti | [Ulti-Game](https://github.com/ZoliQua/Ulti-Game) | Cards |

## ✨ Features

- 🃏 **Three games, six variants**: Klondike draw 1 / draw 3, Spider 1 / 2 / 4 suits, FreeCell
- 🖱️ **Drag and drop** of a card or a whole valid run (mouse, pen and touch through pointer events); an illegal drop snaps back
- 👆 **Click-to-move**: a click sends the card (and the cards on it) to the best legal place — home first, then a column with
  cards (in Spider the same suit first), then an empty column, then a free cell
- ⌨️ **Full keyboard play**: **Tab** between piles, **Enter** picks up and puts down, **↑ / ↓** change how many cards you hold
- 💡 **Hints** (**H**): a dashed ring with “1” on the source and a solid ring with “2” on the target, plus the move in words —
  never colour alone; it prefers moves home, moves that turn a card over and moves that free a cell or column
- ↩️ **Undo** (**U** / **Ctrl+Z**), up to 200 steps; it costs a little score
- 🏠 **Safe auto-moves**: aces, twos and any card no column can still need go home by themselves after each move (not after you
  take a card back down from a foundation — that would undo your move)
- ⏩ **Auto-complete** (**A**): once every card is open (Klondike: stock and waste empty; FreeCell: every column in order) one key
  plays the rest home
- 🎴 **Kit playing cards**: the arcade's four-colour French deck (♠ black, ♥ red, ♦ blue, ♣ green) or a single grey tone
  (**Deck** setting), with a small suit shape in each card's corner so the suit stays readable even when the cards overlap tightly
- 🏆 **Unified arcade scoring** — only a won game scores; Best, plays and wins are shared with the portal
- ⏸️ **Pause** (P, or automatically when the tab is hidden) — freezes the table and the timer
- 💾 **Autosave & resume** — the position, its undo history, the clock and the undo count survive reloads and tab closes
- 🌗 **Dark / light theme** shared with every arcade game (press **T**)
- 🌍 **Three languages** — English, Hungarian (Pasziánsz: Klondike / Pók / FreeCell) and German (Solitär); switch in the top bar
  (also `?lang=en|hu|de`); numbers follow the locale's grouping, card names in screen-reader labels follow the language
- 🦷 **Dental mode** — a „Fogas mód” / "Dental mode" / „Zahnmodus” toggle in the settings, off by default (or `?dental=1`), shared
  across the whole arcade: the card backs carry a tooth, the empty foundations show a tooth and a win is “Every tooth in its place!”;
  presentation only
- 🤖 **Attract-mode demo** (`<SolitaireDemo />`) — replays a scripted solution of FreeCell deal #164 on the real engine
- 📱 **Phone-friendly** — the cards scale with the table width, so a 360 px screen fits all seven Klondike, eight FreeCell and ten
  Spider columns without horizontal scroll (Spider's columns sit closer and overlap more tightly); long columns squeeze to fit
- ♿ **Accessible** — every pile is a focusable button labelled with its contents
  (`Column 3: 5 cards (3 face down), top: Seven of hearts`)
- 🧪 **Tested** — rules of all three engines, the deal formats, undo, scoring, hints, click targets, saves, drag and drop,
  keyboard play, auto-complete, languages, dental mode and the demo

## 🚀 Quick start

Requires **Node ≥ 20** and npm.

```bash
git clone https://github.com/ZoliQua/Solitaire-Game.git
cd Solitaire-Game
npm install
npm run dev          # http://localhost:5173
```

Production build: `npm run build && npm run preview`. The build uses relative asset paths, so `dist/` can be served from any sub-folder.

## 📏 Games and rules

| Game | Deal | Building | Goal |
| --- | --- | --- | --- |
| **Klondike** | 7 columns of 1…7 cards (top card up), 24 in the stock | Down, alternating red (♥ ♦) and black (♠ ♣); only a King (or a King-led run) fills an empty column | All 52 cards on the four foundations, ace to king |
| **Spider** | 104 cards: 10 columns of 6,6,6,6,5,5,5,5,5,5 (top up), 50 in the stock | Down regardless of suit; only same-suit runs move together; any card fills an empty column | Eight complete K→A same-suit runs, each removed as soon as it forms |
| **FreeCell** | All 52 cards open in 8 columns (Microsoft deal numbers 1…32 000) | Down, alternating red (♥ ♦) and black (♠ ♣); 4 free cells hold one card each | All 52 cards home |

- **Klondike** — *Draw 1* turns one card, *Draw 3* turns three; the last three waste cards are fanned but only the top one plays.
  Redeals are unlimited. A foundation's top card may come back down onto a column.
- **Spider** — the stock deals one card onto every column and is refused while a column is empty. *1 suit* uses ♠ only, *2 suits*
  ♠ ♥, *4 suits* all four.
- **FreeCell** — runs move as a “supermove” of up to `(free cells + 1) × 2^(empty columns)` cards (an empty target column does not
  count). Deals are seeded with the classic Microsoft generator, so deal #1 here is deal #1 in Windows.
- Klondike and Spider deals come from a seeded shuffle; the deal number is shown under the Game buttons.

Switching the game or the variant, or **New game**, during a game asks first with an in-page card; the last chosen variant is
remembered (`solitaire.mode`), and so is the deck (`solitaire.deck`).

## ⌨️ Controls

| Key | Action |
| --- | --- |
| 🖱️ Drag a card | Move it and every card on it; drop on a pile |
| 🖱️ Click / tap a card | Send it to the best legal place |
| 🖱️ Click the stock | Draw (Klondike) / deal a row (Spider) |
| **Tab** / **Shift+Tab** | Move between piles |
| **Enter** / **Space** on a pile | Pick up its movable cards; on another pile, put them down; on the same pile, send them to the best place |
| **↑** / **↓** | Hold more / fewer cards of the picked run |
| **H** | Hint |
| **U** / **Ctrl+Z** / **Cmd+Z** | Undo |
| **A** | Finish (auto-complete) |
| **D** | Draw / deal from the stock |
| **N** | New game (asks first) |
| **Esc** | Drop what you picked up · pause |
| **Enter** | Start · play again (outside a pile) |
| **P** | Pause / resume |
| **T** | Toggle dark / light theme (standalone page) |

Hotkeys are ignored while you type in a form field or hold Cmd/Ctrl/Alt (Ctrl/Cmd+Z excepted).

## 🎯 Scoring & stats

Only a **won** game scores:

```
score      = round(base × timeFactor × undoFactor)
timeFactor = clamp(par / seconds, 0.25, 1)
undoFactor = max(0.5, 1 − 0.02 × undos)
```

| Game | Base | Par |
| --- | --- | --- |
| Klondike draw 1 | 1000 | 300 s |
| Klondike draw 3 | 1500 | 300 s |
| Spider 1 suit | 1000 | 600 s |
| Spider 2 suits | 2000 | 600 s |
| Spider 4 suits | 4000 | 600 s |
| FreeCell | 2000 | 420 s |

The highest possible score is **4000** (Spider, four suits, on par, no undo). A won game is recorded once with outcome `win`; a game
abandoned through **New game** or a variant switch is **not** recorded. The stat strip shows **Moves**, the active **Time**, the
**Score** (after a win) and **Best**. Every finished game is recorded by the kit under `arcade.stats.solitaire`.

## 💾 Autosave & resume

The session is the whole game: the variant, the position, the undo history (at most 200 states), the move and undo counters and
the clock (key `arcade.session.solitaire`, schema-versioned). A validator checks every saved position — pile counts per variant
and the whole deck present (52 or 104 cards) — and rejects a save whose variant does not match its position. It is saved about
once a second, whenever the page is hidden and when the game unmounts. Reloading shows **Welcome back** with the game paused.
A won game is never restored, so it can never be recorded twice; **Discard** next to the *Autosaved* badge drops the save.

## 🧩 Embedding in Arcade-Game-Center

```tsx
import { SolitaireGame, SolitaireDemo } from '@arcade/solitaire';

<SolitaireGame
  embedded                                   // hide the page title; the portal shows it
  onGameOver={(score) => submitScore('solitaire', score)}  // won games with points > 0
  onRunEnd={(run) => console.log(run.outcome, run.score)}  // every finished game
  onStatusChange={({ status, score, seconds }) => updateHeader(status, seconds)}
/>
<SolitaireDemo active={cardIsVisible} />     // landing-page attract mode
```

Both components follow the shared `ArcadeGameProps` / `ArcadeDemoProps` contract from `src/arcade/types.ts`.
Status mapping: `idle` before the first game of a visit (Start overlay), `running` while a game is played, `paused` while suspended
(or restored), `gameOver` once the game is won.

## 🧪 Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (logic + component tests) |
| `npm run check` | lint → typecheck → test → build (what CI runs) |

## 🏗️ Architecture

```
src/
  arcade/                 vendored Zoltan's Arcade kit — do not edit here (see its README)
  logic/                  pure game rules, no React
    types.ts deck.ts      cards, piles, seeded shuffle, foundation and run rules
    klondike.ts spider.ts freecell.ts   deals and moves of each game
    moves.ts              legalMoves, applyMove, isWon, autoFoundation, canAutoComplete
    history.ts            immutable undo stack
    game.ts               modes, playMove (+ safe auto-moves), undo, auto-complete, hints, click targets, save validator
    scoring.ts            base × timeFactor × undoFactor
  components/             Table, Pile, SuitMark, useDrag (pointer events), layout (card size, fans), DentalToggle
  demo/                   SolitaireDemo + the scripted FreeCell solution
  SolitaireGame.tsx       the embeddable game (ArcadeGameProps)
  i18n.ts                 en / hu / de strings
  App.tsx                 standalone page: <ArcadeShell><SolitaireGame/></ArcadeShell>
  main.tsx                entry; loads the shared arcade.css once
  index.ts                package entry used by Arcade-Game-Center
```

The UI changes the position only through the engine (`playMove`, `undoGame`, `autoComplete` in `logic/game.ts`), which never
mutates its input — undo simply restores a stored state.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md), the [Code of Conduct](./CODE_OF_CONDUCT.md) and [SECURITY.md](./SECURITY.md).
Contributors are listed in [CONTRIBUTORS.md](./CONTRIBUTORS.md); changes in [CHANGELOG.md](./CHANGELOG.md).

## ⚖️ License

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">Made with ❤️ by Zoltán Dul · part of <a href="https://github.com/ZoliQua/Arcade-Game-Center">Zoltan's Arcade</a></p>
