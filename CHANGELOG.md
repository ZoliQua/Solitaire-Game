# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
