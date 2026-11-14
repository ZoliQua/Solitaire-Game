# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.1.0] - 2026-11-14

### Added
- Rules dialog (*Rules* button or **R**, pauses the game): goal with the three games' rule texts and a diagram of an alternating
  black (♠ ♣) / red (♥ ♦) run with suit symbols and written groups (tooth back and foundation in dental mode), mouse / keyboard or
  touch controls, the table rules and the scoring — every number taken from the real constants and helpers (bases, par times,
  time floor, undo step and floor, the 4000 cap, the FreeCell supermove, the 200-step undo).
- Finish early: the *Finish* button ends the game after an in-page confirm; it is ranked with 0 points (outcome `finished`,
  `onGameOver(0, { finished: true })`), because only a won game scores; the save is dropped and the game-over card says so.
- Touch controls on phones: tap a card to select it (with the cards on it), tap a column, free cell or foundation to move the
  selection there, double-tap a card to send it home, tap the table to drop the selection; finger drag still works, mouse
  drag and click-to-move are unchanged. Touch help in the Controls panel and touch wording in the status line.
- Full screen button (native full screen, or the kit's full-window mode on iPhone).
- The card size is also capped by the screen height (a phone in landscape shows the whole table); below 430 px the columns sit
  closer and face-down cards overlap more tightly. `viewport-fit=cover` for the iPhone safe areas.
- README in English, German and Hungarian; the family table lists all fifteen games.

### Changed
- The auto-complete button is now called *Auto-complete* / „Mindet fel” / „Alle ablegen”, so it is not confused with *Finish*.
- The Score panel shows 0 until a win (it showed “—”).

## [1.0.0] - 2026-11-12

### Added
- Engines for Klondike (draw 1 / draw 3, unlimited redeals), Spider (1 / 2 / 4 suits, run removal, no deal onto an empty
  column) and FreeCell (Microsoft deal numbers, supermove limit `(free cells + 1) × 2^(empty columns)`), all pure and immutable,
  with an undo history of whole states.
- Table with the kit's `PlayingCard` (four-colour or grey deck, localized card names); cards scale with the table width so a
  360 px phone fits 7, 8 or 10 columns, Spider's columns overlap more tightly and long columns squeeze to fit. A small suit shape
  in each card's corner keeps the suit readable by shape when cards overlap.
- Pointer-events drag and drop of a card or a valid run (an illegal drop snaps back), click-to-move to the best legal place,
  and full keyboard play (Tab between piles, Enter picks up / puts down, ↑ / ↓ change the picked run).
- In Klondike draw 3 the last three waste cards are fanned and only the top one plays.
- Safe auto-moves to the foundations after each move (one undo step together with the move), skipped after a
  foundation → tableau move so it is never taken straight back.
- Hints (H) shown with a dashed “1” ring on the source, a solid “2” ring on the target and the move in words.
- Undo (U / Ctrl+Z, 200 steps), auto-complete (A) once every card can go home, draw / deal (D), new game (N), pause (P / Esc).
- Scoring: `round(base × clamp(par / seconds, 0.25, 1) × max(0.5, 1 − 0.02 × undos))`; base 1000 / 1500 (Klondike draw 1 / 3),
  1000 / 2000 / 4000 (Spider 1 / 2 / 4 suits), 2000 (FreeCell); par 300 s, 600 s, 420 s; maximum 4000. Only a won game scores and
  is recorded once with outcome `win`; an abandoned game is not recorded.
- Variant switches and new games during a game ask first with an in-page card; the last variant (`solitaire.mode`) and the deck
  (`solitaire.deck`) are remembered.
- Autosave & resume (`arcade.session.solitaire`) of the position, undo history, counters and clock, with a validator for pile
  counts and the whole deck; a won game is never restored.
- English, Hungarian (Pasziánsz — Klondike / Pók / FreeCell) and German (Solitär), following the shared arcade language; numbers
  use the locale's grouping.
- Dental mode (shared `arcade.dental`, off by default, toggle in Settings): tooth card backs, teeth in the empty foundations and a
  dental win title. Presentation only.
- `SolitaireDemo` attract mode replaying a scripted solution of FreeCell deal #164 on the real engine.
- Vitest + Testing Library suite, `npm run check`, GitHub Actions CI, community files and a fanned-cards favicon.
