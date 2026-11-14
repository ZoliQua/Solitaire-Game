# ♠️ Solitär (Solitaire)

[English](README.md) · **Deutsch** · [Magyar](README.hu.md)

Ein typsicheres Solitär mit **React 18**, **Vite** und **TypeScript**: drei klassische Patiencen auf einem Tisch —
**Klondike** (eine oder drei Karten ziehen), **Spider** (1, 2 oder 4 Farben) und **FreeCell** (mit den Microsoft-Spielnummern).
Zieh eine Karte oder Reihe, klick eine Karte an, damit sie an den besten Platz geht, spiel auf dem Handy mit Antippen oder die
ganze Partie mit der Tastatur. Tipps, Rückgängig, sichere automatische Züge und Fertigspielen per Tastendruck sind dabei; die
Farben erkennst du auch an ihrer Form, die Farbe selbst ist nur ein Bonus.
Läuft eigenständig **und** als eines der fünfzehn Spiele von **[Zoltan's Arcade](https://github.com/ZoliQua/Arcade-Game-Center)**:
spiel es unter [dulzoltan.hu/arcade/#/play/solitaire](https://dulzoltan.hu/arcade/#/play/solitaire).

[![CI](https://github.com/ZoliQua/Solitaire-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Solitaire-Game/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Inhaltsverzeichnis

- [Die Zoltan's-Arcade-Familie](#%EF%B8%8F-die-zoltans-arcade-familie)
- [Funktionen](#-funktionen)
- [Schnellstart](#-schnellstart)
- [Spiele und Regeln](#-spiele-und-regeln)
- [Steuerung](#%EF%B8%8F-steuerung)
- [Auf dem Handy](#-auf-dem-handy)
- [Punkte & Statistik](#-punkte--statistik)
- [Autospeichern & Fortsetzen](#-autospeichern--fortsetzen)
- [Einbindung in Arcade-Game-Center](#-einbindung-in-arcade-game-center)
- [Skripte](#-skripte)
- [Architektur](#%EF%B8%8F-architektur)
- [Mitwirken](#-mitwirken)
- [Lizenz](#%EF%B8%8F-lizenz)

## 🕹️ Die Zoltan's-Arcade-Familie

Jedes Spiel ist ein eigenständiges Repo, das sich auch ins Portal einklinkt. Alle teilen ein Designsystem, ein Punktemodell und ein Speicherformat über das mitgelieferte Kit [`src/arcade/`](./src/arcade).

| Spiel | Repo | Genre |
| --- | --- | --- |
| 🏠 **Arcade-Portal** | [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) | Alle Spiele an einem Ort, Live-Demos, Statistik, Bestenliste |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reaktion |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Puzzle |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Labyrinth |
| ⚫ Gomoku | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Strategie |
| 🦷 Tic-Tac-Toe | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Duell |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Schläger |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Shooter |
| 🔴 Connect Four | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Duell |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Sortieren |
| 🃏 Texas Hold'em | [Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game) | Karten |
| 💣 Minesweeper | [Minesweeper-Game](https://github.com/ZoliQua/Minesweeper-Game) | Logik |
| ♠️ **Solitaire** (dieses Repo) | [Solitaire-Game](https://github.com/ZoliQua/Solitaire-Game) | Karten |
| 🎴 Ulti | [Ulti-Game](https://github.com/ZoliQua/Ulti-Game) | Karten |
| 🂡 Snapszer | [Snapszer-Game](https://github.com/ZoliQua/Snapszer-Game) | Karten |

## ✨ Funktionen

- 🃏 **Drei Spiele, sechs Varianten**: Klondike mit einer / drei Karten, Spider mit 1 / 2 / 4 Farben, FreeCell
- 🖱️ **Ziehen und Ablegen** einer Karte oder einer ganzen gültigen Reihe (Maus, Stift und Touch über Pointer Events); ein
  ungültiger Abwurf springt zurück
- 👆 **Touch-Spiel**: Auf dem Handy tippst du eine Karte an, um sie (mit den Karten darauf) auszuwählen, dann eine Spalte, freie
  Zelle oder Ablage, um sie dorthin zu legen; Doppeltippen schickt die Karte auf die Ablage; Ziehen mit dem Finger geht auch
- 🖱️ **Klicken zum Ziehen**: Ein Mausklick schickt die Karte (und die Karten darauf) an den besten gültigen Platz — zuerst auf
  die Ablage, dann auf eine Spalte mit Karten (bei Spider zuerst dieselbe Farbe), dann in eine leere Spalte, dann in eine freie Zelle
- ⌨️ **Komplett per Tastatur**: **Tab** zwischen den Stapeln, **Enter** nimmt auf und legt ab, **↑ / ↓** ändern, wie viele Karten
  du hältst
- 💡 **Tipps** (**H**): ein gestrichelter Ring mit „1“ an der Quelle und ein durchgezogener Ring mit „2“ am Ziel, dazu der Zug in
  Worten — nie nur über Farbe; bevorzugt Züge auf die Ablage, Züge, die eine Karte aufdecken, und Züge, die eine Zelle oder Spalte
  freimachen
- ↩️ **Rückgängig** (**U** / **Strg+Z**), bis zu 200 Schritte; kostet ein paar Punkte
- 🏠 **Sichere automatische Züge**: Asse, Zweien und jede Karte, die keine Spalte mehr brauchen kann, gehen nach jedem Zug von
  selbst auf die Ablage (nicht, wenn du gerade eine Karte von der Ablage zurückgenommen hast — das würde deinen Zug aufheben)
- 📖 **Regeln** (**R** oder der Knopf *Regeln*): Ziel, Steuerung, die Regeln aller drei Spiele, die Wertung mit ihren echten
  Zahlen und eine Abbildung einer abwechselnden Reihe — beim Öffnen pausiert das Spiel
- 🏁 **Vorzeitig beenden**: Der Knopf *Beenden* schließt die Partie nach einer Rückfrage ab; sie kommt mit 0 Punkten in die
  Bestenliste, denn nur ein gewonnenes Spiel zählt
- ⛶ **Vollbild**: Mit dem Knopf *Vollbild* füllt der Tisch den Bildschirm (auf dem iPhone als Vollfenster-Modus, weil Safari
  Webseiten keine Vollbild-API bietet)
- ⏩ **Alle ablegen** (**A**): Sobald alle Karten offen liegen (Klondike: Stapel und Abwurf leer; FreeCell: jede Spalte in
  Ordnung), spielt ein Tastendruck den Rest nach Hause
- 🎴 **Spielkarten aus dem Kit**: das vierfarbige französische Blatt der Arcade (♠ schwarz, ♥ rot, ♦ blau, ♣ grün) oder ein
  einziger Grauton (Einstellung **Blatt**), mit einem kleinen Farbsymbol in jeder Kartenecke, damit die Farbe auch bei eng
  überlappenden Karten lesbar bleibt
- 🏆 **Einheitliche Arcade-Wertung** — nur ein gewonnenes Spiel zählt; Bestwert, Partien und Siege teilt es mit dem Portal
- ⏸️ **Pause** (P, oder automatisch, wenn der Tab verborgen wird) — friert Tisch und Uhr ein
- 💾 **Autospeichern & Fortsetzen** — die Stellung, ihr Rückgängig-Verlauf, die Uhr und die Zahl der Rückgängig-Schritte
  überstehen Neuladen und Schließen des Tabs
- 🌗 **Dunkles / helles Design**, gemeinsam mit allen Arcade-Spielen (Taste **T**)
- 🌍 **Drei Sprachen** — Englisch, Ungarisch (Pasziánsz: Klondike / Pók / FreeCell) und Deutsch (Solitär); Umschalten in der
  oberen Leiste (auch `?lang=en|hu|de`); Zahlen folgen der Gruppierung der Sprache, Kartennamen für Screenreader ebenfalls
- 🦷 **Zahnmodus** — ein Schalter „Fogas mód“ / „Dental mode“ / „Zahnmodus“ in den Einstellungen, standardmäßig aus (oder
  `?dental=1`), gemeinsam für die ganze Arcade: Die Kartenrücken tragen einen Zahn, die leeren Ablagen zeigen einen Zahn, und ein
  Sieg heißt „Jeder Zahn an seinem Platz!“; nur die Darstellung ändert sich
- 🤖 **Demo im Anziehungsmodus** (`<SolitaireDemo />`) — spielt eine vorbereitete Lösung von FreeCell-Spiel Nr. 164 auf der
  echten Engine ab
- 📱 **Handytauglich** — die Karten wachsen mit der Tischbreite, sodass ein 360-px-Bildschirm alle sieben Klondike-, acht
  FreeCell- und zehn Spider-Spalten ohne seitliches Scrollen zeigt (unter 430 px rücken die Spalten enger zusammen und verdeckte
  Karten überlappen stärker); die Kartengröße ist zusätzlich durch die Bildschirmhöhe begrenzt, sodass ein Handy im Querformat
  trotzdem den ganzen Tisch zeigt; lange Spalten werden gestaucht, damit sie passen
- ♿ **Barrierearm** — jeder Stapel ist ein fokussierbarer Knopf mit einer Beschriftung seines Inhalts
  (`Spalte 3: 5 Karten (3 verdeckt), oben: Herz-Sieben`)
- 🧪 **Getestet** — die Regeln aller drei Engines, die Spielformate, Rückgängig, Wertung, Tipps, Klickziele, Spielstände, Ziehen
  und Ablegen, Tastatur- und Touch-Spiel, das Regelfenster, vorzeitiges Beenden, Vollbild, Alle ablegen, die Sprachen, der
  Zahnmodus und die Demo

## 🚀 Schnellstart

Benötigt **Node ≥ 20** und npm.

```bash
git clone https://github.com/ZoliQua/Solitaire-Game.git
cd Solitaire-Game
npm install
npm run dev          # http://localhost:5173
```

Produktions-Build: `npm run build && npm run preview`. Der Build nutzt relative Pfade, daher lässt sich `dist/` aus jedem Unterordner ausliefern.

## 📏 Spiele und Regeln

| Spiel | Austeilen | Anlegen | Ziel |
| --- | --- | --- | --- |
| **Klondike** | 7 Spalten mit 1…7 Karten (oberste offen), 24 im Stapel | Absteigend, abwechselnd rot (♥ ♦) und schwarz (♠ ♣); in eine leere Spalte darf nur ein König (oder eine Reihe mit einem König oben) | Alle 52 Karten auf den vier Ablagen, vom Ass bis zum König |
| **Spider** | 104 Karten: 10 Spalten mit 6,6,6,6,5,5,5,5,5,5 Karten (oberste offen), 50 im Stapel | Absteigend unabhängig von der Farbe; nur Reihen einer Farbe bewegen sich zusammen; jede Karte darf in eine leere Spalte | Acht komplette K→A-Reihen einer Farbe, jede verschwindet, sobald sie fertig ist |
| **FreeCell** | Alle 52 Karten offen in 8 Spalten (Microsoft-Spielnummern 1…32 000) | Absteigend, abwechselnd rot (♥ ♦) und schwarz (♠ ♣); 4 freie Zellen für je eine Karte | Alle 52 Karten nach Hause |

- **Klondike** — *Eine Karte ziehen* dreht eine Karte um, *Drei Karten ziehen* drei; die letzten drei Karten im Abwurf liegen
  gefächert, aber nur die oberste ist spielbar. Du darfst den Stapel beliebig oft neu durchgehen. Die oberste Karte einer Ablage
  darf zurück auf eine Spalte.
- **Spider** — der Stapel gibt auf jede Spalte eine Karte und verweigert das, solange eine Spalte leer ist. *1 Farbe* nutzt nur ♠,
  *2 Farben* ♠ ♥, *4 Farben* alle vier.
- **FreeCell** — Reihen bewegen sich als „Superzug“ mit bis zu `(freie Zellen + 1) × 2^(leere Spalten)` Karten (eine leere
  Zielspalte zählt nicht mit). Die Spiele entstehen mit dem klassischen Microsoft-Generator, Spiel Nr. 1 hier ist also Spiel Nr. 1
  unter Windows.
- Klondike- und Spider-Spiele stammen aus einem Mischen mit Startwert (Seed); die Spielnummer steht unter den Partie-Knöpfen.

Wechselst du während einer Partie das Spiel oder die Variante oder startest ein **Neues Spiel**, fragt vorher eine Karte auf der
Seite nach; die zuletzt gewählte Variante (`solitaire.mode`) und das Blatt (`solitaire.deck`) bleiben gespeichert.

## ⌨️ Steuerung

| Taste | Aktion |
| --- | --- |
| 🖱️ Karte ziehen | Sie und alle Karten darauf bewegen; auf einem Stapel ablegen |
| 🖱️ Karte anklicken | An den besten gültigen Platz schicken |
| 🖱️ Stapel anklicken | Ziehen (Klondike) / eine Reihe geben (Spider) |
| **Tab** / **Umschalt+Tab** | Zwischen den Stapeln wechseln |
| **Enter** / **Leertaste** auf einem Stapel | Seine beweglichen Karten aufnehmen; auf einem anderen Stapel ablegen; auf demselben Stapel an den besten Platz schicken |
| **↑** / **↓** | Mehr / weniger Karten der aufgenommenen Reihe halten |
| **H** | Tipp |
| **U** / **Strg+Z** / **Cmd+Z** | Rückgängig |
| **A** | Alle ablegen (jede Karte nach Hause) |
| **D** | Vom Stapel ziehen / geben |
| **N** | Neues Spiel (fragt vorher) |
| **Esc** | Aufgenommenes loslassen · Pause |
| **Enter** | Start · noch mal (außerhalb eines Stapels) |
| **P** | Pause / weiter |
| **R** | Regeln (pausiert das Spiel) |
| **T** | Dunkles / helles Design umschalten (eigenständige Seite) |

Tastenkürzel werden ignoriert, während du in ein Formularfeld tippst oder Cmd/Strg/Alt hältst (außer Strg/Cmd+Z).

## 📱 Auf dem Handy

Tipp eine Karte an, um sie auszuwählen — die Karten darauf kommen mit, und die Statuszeile sagt, was du hältst. Dann tipp auf die
Spalte, freie Zelle oder Ablage, wo sie hin soll; passt sie dort nicht, wird stattdessen die angetippte Karte deine neue Auswahl.
Doppeltippen schickt eine Karte auf die Ablage (kann sie dort nicht hin, geht sie an den besten anderen Platz). Du kannst Karten
auch mit dem Finger ziehen, auf den Stapel tippen, um zu ziehen oder zu geben, und auf den Tisch zwischen den Stapeln tippen, um
die Auswahl loszulassen. Unter deinem Finger scrollt und zoomt der Tisch nie. *Vollbild* gibt den Karten den ganzen Bildschirm;
auf dem iPhone blendet **Teilen → Zum Home-Bildschirm** zusätzlich die Browserleisten aus.

## 🎯 Punkte & Statistik

Nur ein **gewonnenes** Spiel zählt:

```
Punkte          = runden(Basis × Zeitfaktor × Rückgängig-Faktor)
Zeitfaktor      = clamp(Richtzeit / Sekunden, 0.25, 1)
Rückgängig-F.   = max(0.5, 1 − 0.02 × Rückgängig)
```

| Spiel | Basis | Richtzeit |
| --- | --- | --- |
| Klondike, eine Karte | 1000 | 300 s |
| Klondike, drei Karten | 1500 | 300 s |
| Spider, 1 Farbe | 1000 | 600 s |
| Spider, 2 Farben | 2000 | 600 s |
| Spider, 4 Farben | 4000 | 600 s |
| FreeCell | 2000 | 420 s |

Die höchste mögliche Punktzahl ist **4000** (Spider, vier Farben, in der Richtzeit, ohne Rückgängig). Ein gewonnenes Spiel wird
einmal mit dem Ergebnis `win` erfasst. Der Knopf **Beenden** schließt eine Partie nach einer Rückfrage vorzeitig ab: Sie wird mit
dem Ergebnis `finished` erfasst und kommt mit **0** Punkten in die Bestenliste. Eine über **Neues Spiel** oder einen
Variantenwechsel abgebrochene Partie wird **nicht** erfasst. Die Statusleiste zeigt **Züge**, die aktive **Zeit**, die **Punkte**
(0 bis zum Sieg) und den **Bestwert**. Das Kit erfasst jede beendete Partie unter `arcade.stats.solitaire`.

## 💾 Autospeichern & Fortsetzen

Die Sitzung ist die ganze Partie: die Variante, die Stellung, der Rückgängig-Verlauf (höchstens 200 Stellungen), die Zug- und
Rückgängig-Zähler und die Uhr (Schlüssel `arcade.session.solitaire`, mit Schemaversion). Ein Prüfer kontrolliert jede
gespeicherte Stellung — die Zahl der Stapel je Variante und ob das ganze Blatt da ist (52 oder 104 Karten) — und verwirft einen
Spielstand, dessen Variante nicht zu seiner Stellung passt. Gespeichert wird etwa einmal pro Sekunde, jedes Mal, wenn die Seite
verborgen wird, und wenn das Spiel ausgehängt wird. Nach dem Neuladen begrüßt dich **Willkommen zurück** mit pausiertem Spiel.
Ein gewonnenes oder beendetes Spiel wird nie wiederhergestellt und kann daher nie doppelt erfasst werden; **Verwerfen** neben dem
Hinweis *Automatisch gespeichert* löscht den Spielstand.

## 🧩 Einbindung in Arcade-Game-Center

```tsx
import { SolitaireGame, SolitaireDemo } from '@arcade/solitaire';

<SolitaireGame
  embedded                                   // blendet den Seitentitel aus; das Portal zeigt ihn
  onGameOver={(score, info) => submitScore('solitaire', score, info)}  // gewonnene Spiele; Beenden meldet 0 mit { finished: true }
  onRunEnd={(run) => console.log(run.outcome, run.score)}  // jede beendete Partie
  onStatusChange={({ status, score, seconds }) => updateHeader(status, seconds)}
/>
<SolitaireDemo active={cardIsVisible} />     // Anziehungsmodus der Startseite
```

Beide Komponenten folgen dem gemeinsamen Vertrag `ArcadeGameProps` / `ArcadeDemoProps` aus `src/arcade/types.ts`.
Status: `idle` vor der ersten Partie eines Besuchs (Start-Karte), `running` während des Spiels, `paused` während einer Pause (oder
nach dem Wiederherstellen), `gameOver`, sobald das Spiel gewonnen oder vorzeitig beendet ist.

## 🧪 Skripte

| Skript | Zweck |
| --- | --- |
| `npm run dev` | Vite-Entwicklungsserver |
| `npm run build` | Typprüfung (`tsc -b`) und Produktions-Build |
| `npm run preview` | Den Produktions-Build ausliefern |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (Logik- und Komponententests) |
| `npm run check` | lint → typecheck → test → build (das, was die CI ausführt) |

## 🏗️ Architektur

```
src/
  arcade/                 mitgeliefertes Zoltan's-Arcade-Kit — hier nicht bearbeiten (siehe seine README)
  logic/                  reine Spielregeln, ohne React
    types.ts deck.ts      Karten, Stapel, Mischen mit Seed, Ablage- und Reihenregeln
    klondike.ts spider.ts freecell.ts   Austeilen und Züge der einzelnen Spiele
    moves.ts              legalMoves, applyMove, isWon, autoFoundation, canAutoComplete
    history.ts            unveränderlicher Rückgängig-Stapel
    game.ts               Modi, playMove (+ sichere automatische Züge), Rückgängig, Alle ablegen, Tipps, Klickziele, Spielstand-Prüfer
    scoring.ts            Basis × Zeitfaktor × Rückgängig-Faktor
  components/             Table, Pile, SuitMark, useDrag (Pointer Events), layout (Kartengröße, Fächer), DentalToggle
  rules.tsx               Abschnitte des Regelfensters (Zahlen aus den echten Konstanten) und die Reihen-Abbildung
  labels.ts               Varianten- und Modusnamen, die Zeilen der Touch-Hilfe
  demo/                   SolitaireDemo + die vorbereitete FreeCell-Lösung
  SolitaireGame.tsx       das einbettbare Spiel (ArcadeGameProps)
  i18n.ts                 en / hu / de Texte
  App.tsx                 eigenständige Seite: <ArcadeShell><SolitaireGame/></ArcadeShell>
  main.tsx                Einstieg; lädt die gemeinsame arcade.css einmal
  index.ts                Paket-Einstieg für Arcade-Game-Center
```

Die Oberfläche ändert die Stellung nur über die Engine (`playMove`, `undoGame`, `autoComplete`, `finishGame` in
`logic/game.ts`), die ihre Eingabe nie verändert — Rückgängig stellt einfach eine gespeicherte Stellung wieder her.

## 🤝 Mitwirken

Siehe [CONTRIBUTING.md](./CONTRIBUTING.md), den [Verhaltenskodex](./CODE_OF_CONDUCT.md) und [SECURITY.md](./SECURITY.md).
Mitwirkende stehen in [CONTRIBUTORS.md](./CONTRIBUTORS.md), Änderungen in [CHANGELOG.md](./CHANGELOG.md).

## ⚖️ Lizenz

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">Mit ❤️ gemacht von Zoltán Dul · Teil von <a href="https://github.com/ZoliQua/Arcade-Game-Center">Zoltan's Arcade</a></p>
