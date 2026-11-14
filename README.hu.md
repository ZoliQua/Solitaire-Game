# ♠️ Pasziánsz (Solitaire)

[English](README.md) · [Deutsch](README.de.md) · **Magyar**

Típusbiztos pasziánsz **React 18**, **Vite** és **TypeScript** alapokon: három klasszikus türelemjáték egy asztalon —
**Klondike** (egyes vagy hármas húzás), **Pók** (1, 2 vagy 4 szín) és **FreeCell** (a Microsoft-féle osztásszámokkal). Húzz át egy
lapot vagy sort, kattints egy lapra, és a legjobb helyre kerül, telefonon koppintásokkal játssz, vagy vidd végig az egész játszmát
billentyűzettel. Tipp, visszavonás, biztonságos automatikus lépések és egygombos befejezés is van; a színeket alakjukról is
megkülönböztetheted, így a szín csak ráadás.
Önállóan is fut, **és** a **[Zoltan's Arcade](https://github.com/ZoliQua/Arcade-Game-Center)** tizenöt játékának egyike:
játszd itt: [dulzoltan.hu/arcade/#/play/solitaire](https://dulzoltan.hu/arcade/#/play/solitaire).

[![CI](https://github.com/ZoliQua/Solitaire-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Solitaire-Game/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Tartalom

- [A Zoltan's Arcade család](#%EF%B8%8F-a-zoltans-arcade-család)
- [Funkciók](#-funkciók)
- [Gyors kezdés](#-gyors-kezdés)
- [Játékok és szabályok](#-játékok-és-szabályok)
- [Irányítás](#%EF%B8%8F-irányítás)
- [Mobilon](#-mobilon)
- [Pontozás és statisztika](#-pontozás-és-statisztika)
- [Automatikus mentés és folytatás](#-automatikus-mentés-és-folytatás)
- [Beágyazás az Arcade-Game-Centerbe](#-beágyazás-az-arcade-game-centerbe)
- [Szkriptek](#-szkriptek)
- [Felépítés](#%EF%B8%8F-felépítés)
- [Közreműködés](#-közreműködés)
- [Licenc](#%EF%B8%8F-licenc)

## 🕹️ A Zoltan's Arcade család

Minden játék önálló repó, amely a portálba is becsatlakozik. Egy közös dizájnrendszeren, egy pontozási modellen és egy mentési formátumon osztoznak a becsomagolt [`src/arcade/`](./src/arcade) kiten keresztül.

| Játék | Repó | Műfaj |
| --- | --- | --- |
| 🏠 **Arcade portál** | [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) | Minden játék egy helyen, élő demók, statisztika, ranglista |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reflex |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Fejtörő |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Labirintus |
| ⚫ Gomoku | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Stratégia |
| 🦷 Tic-Tac-Toe | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Párbaj |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Ütő |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Lövöldözős |
| 🔴 Connect Four | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Párbaj |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Rendezős |
| 🃏 Texas Hold'em | [Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game) | Kártya |
| 💣 Minesweeper | [Minesweeper-Game](https://github.com/ZoliQua/Minesweeper-Game) | Logika |
| ♠️ **Solitaire** (ez a repó) | [Solitaire-Game](https://github.com/ZoliQua/Solitaire-Game) | Kártya |
| 🎴 Ulti | [Ulti-Game](https://github.com/ZoliQua/Ulti-Game) | Kártya |
| 🂡 Snapszer | [Snapszer-Game](https://github.com/ZoliQua/Snapszer-Game) | Kártya |

## ✨ Funkciók

- 🃏 **Három játék, hat változat**: Klondike egyes / hármas húzással, Pók 1 / 2 / 4 színnel, FreeCell
- 🖱️ **Fogd és vidd** egy lapra vagy egy egész szabályos sorra (egér, toll és érintés, pointer eventekkel); a szabálytalanul
  ledobott lap visszaugrik
- 👆 **Érintéses játék**: telefonon koppints egy lapra a kijelöléshez (a rajta lévőkkel együtt), aztán egy oszlopra, szabad
  cellára vagy alapra, hogy odakerüljön; dupla koppintással a lap az alapra megy; ujjal húzni is lehet
- 🖱️ **Kattintásos lépés**: egy egérkattintás a lapot (és a rajta lévőket) a legjobb szabályos helyre küldi — elsőként az alapra,
  aztán egy lapokkal teli oszlopra (a Pókban előbb az azonos színűre), aztán üres oszlopba, végül szabad cellába
- ⌨️ **Teljes billentyűzetes játék**: **Tab** a kupacok között, **Enter** felvesz és letesz, **↑ / ↓** több vagy kevesebb lapot
  vesz kézbe
- 💡 **Tipp** (**H**): szaggatott gyűrű „1”-gyel a forráson és folytonos gyűrű „2”-vel a célon, mellette a lépés szavakkal —
  sosem csak színnel; az alapra vivő, lapot felfordító és cellát vagy oszlopot felszabadító lépéseket részesíti előnyben
- ↩️ **Visszavonás** (**U** / **Ctrl+Z**), legfeljebb 200 lépésig; egy kis pontba kerül
- 🏠 **Biztonságos automatikus lépések**: az ászok, a kettesek és minden olyan lap, amelyre egyik oszlopnak sincs már szüksége,
  minden lépés után maguktól felmennek az alapra (kivéve, ha épp az alapról vettél le egy lapot — az visszacsinálná a lépésedet)
- 📖 **Szabályok** (**R** vagy a *Szabályok* gomb): cél, irányítás, mindhárom játék szabályai, a pontozás a valódi számokkal és egy
  ábra a váltakozó sorról — megnyitásakor a játék szünetel
- 🏁 **Idő előtti befejezés**: a *Befejezés* gomb megerősítés után lezárja a játszmát; 0 ponttal kerül a ranglistára, mert csak a
  megnyert játszma ér pontot
- ⛶ **Teljes képernyő**: a *Teljes képernyő* gombbal az asztal kitölti a képernyőt (iPhone-on teljes ablakos módban, mert a
  Safari weboldalaknak nem ad teljes képernyős API-t)
- ⏩ **Mindet fel** (**A**): ha már minden lap nyitva van (Klondike: üres pakli és dobott lapok; FreeCell: minden oszlop rendben),
  egy gombnyomás a többit felrakja az alapokra
- 🎴 **A kit kártyalapjai**: az arcade négyszínű francia kártyája (♠ fekete, ♥ piros, ♦ kék, ♣ zöld) vagy egyetlen szürke tónus
  (**Pakli** beállítás), minden lap sarkában kis színjellel, hogy a szín akkor is olvasható maradjon, ha a lapok sűrűn fedik
  egymást
- 🏆 **Egységes arcade pontozás** — csak a megnyert játszma ér pontot; a rekord, a játszmák és a győzelmek száma közös a portállal
- ⏸️ **Szünet** (P, vagy magától, ha a lap a háttérbe kerül) — megállítja az asztalt és az órát
- 💾 **Automatikus mentés és folytatás** — az állás, a visszavonási előzmények, az óra és a visszavonások száma túléli az
  újratöltést és a lap bezárását
- 🌗 **Sötét / világos téma**, közös minden arcade játékkal (**T** gomb)
- 🌍 **Három nyelv** — angol, magyar (Pasziánsz: Klondike / Pók / FreeCell) és német (Solitär); váltás a felső sávban
  (vagy `?lang=en|hu|de`); a számok a nyelv szerinti tagolást követik, a képernyőolvasó a lapneveket is az adott nyelven mondja
- 🦷 **Fogas mód** — „Fogas mód” / "Dental mode" / „Zahnmodus” kapcsoló a beállításokban, alapból kikapcsolva (vagy `?dental=1`),
  közös az egész arcade-ban: a lapok hátán fog van, az üres alapokon fog látszik, a győzelem pedig „Minden fog a helyén!”;
  csak a megjelenést érinti
- 🤖 **Bemutató demó** (`<SolitaireDemo />`) — a 164-es FreeCell-osztás előre megírt megoldását játssza le a valódi motoron
- 📱 **Telefonbarát** — a lapok az asztal szélességével méreteződnek, így egy 360 px-es kijelzőre vízszintes görgetés nélkül
  kifér mind a hét Klondike-, nyolc FreeCell- és tíz Pók-oszlop (430 px alatt az oszlopok közelebb kerülnek, a lefordított lapok
  sűrűbben fedik egymást); a lapméretet a képernyő magassága is korlátozza, így fekvő telefonon is látszik az egész asztal; a
  hosszú oszlopok összenyomódnak, hogy elférjenek
- ♿ **Akadálymentes** — minden kupac fókuszálható gomb, a tartalmát leíró címkével
  (`3. oszlop: 5 lap (3 lefordítva), felül: Kőr hetes`)
- 🧪 **Tesztelt** — mindhárom motor szabályai, az osztásformátumok, a visszavonás, a pontozás, a tippek, a kattintási célok, a
  mentések, a fogd és vidd, a billentyűzetes és az érintéses játék, a szabályok ablak, az idő előtti befejezés, a teljes
  képernyő, a Mindet fel, a nyelvek, a fogas mód és a demó

## 🚀 Gyors kezdés

Kell hozzá **Node ≥ 20** és npm.

```bash
git clone https://github.com/ZoliQua/Solitaire-Game.git
cd Solitaire-Game
npm install
npm run dev          # http://localhost:5173
```

Éles build: `npm run build && npm run preview`. A build relatív útvonalakat használ, így a `dist/` bármelyik almappából kiszolgálható.

## 📏 Játékok és szabályok

| Játék | Osztás | Építés | Cél |
| --- | --- | --- | --- |
| **Klondike** | 7 oszlop 1…7 lappal (a felső felfordítva), 24 a pakliban | Lefelé, piros (♥ ♦) és fekete (♠ ♣) lapokat váltogatva; üres oszlopba csak király (vagy királlyal kezdődő sor) kerülhet | Mind az 52 lap a négy alapon, ásztól királyig |
| **Pók** | 104 lap: 10 oszlop 6,6,6,6,5,5,5,5,5,5 lappal (a felső felfordítva), 50 a pakliban | Lefelé, színtől függetlenül; csak az egyszínű sor mozog együtt; üres oszlopba bármelyik lap mehet | Nyolc teljes, egyszínű K→A sor, mindegyik lekerül, amint összeáll |
| **FreeCell** | Mind az 52 lap nyitva, 8 oszlopban (Microsoft-osztásszámok 1…32 000) | Lefelé, piros (♥ ♦) és fekete (♠ ♣) lapokat váltogatva; 4 szabad cella, mindegyikben egy lap fér el | Mind az 52 lap az alapokon |

- **Klondike** — az *Egyes húzás* egy lapot fordít, a *Hármas húzás* hármat; a dobott lapok közül az utolsó három legyezőben
  látszik, de csak a legfelső játszható. Akárhányszor újrakezdheted a paklit. Az alap legfelső lapja visszaléphet egy oszlopra.
- **Pók** — a pakli minden oszlopra oszt egy lapot, de nem oszt, amíg van üres oszlop. Az *1 szín* csak ♠, a *2 szín* ♠ ♥, a
  *4 szín* mind a négy színt használja.
- **FreeCell** — a sorok „szuperlépéssel” mozognak, legfeljebb `(szabad cellák + 1) × 2^(üres oszlopok)` lapig (az üres
  céloszlop nem számít bele). Az osztások a klasszikus Microsoft-generátorral készülnek, így az itteni 1-es osztás ugyanaz, mint
  Windowson.
- A Klondike- és a Pók-osztás seedelt (kezdőértékes) keverésből jön; az osztás száma a Játszma gombok alatt látszik.

Ha játék közben játékot vagy változatot váltasz, vagy **Új játék**ot kezdesz, előbb egy oldalon belüli kártya kérdez rá; a játék
megjegyzi az utoljára választott változatot (`solitaire.mode`) és a paklit is (`solitaire.deck`).

## ⌨️ Irányítás

| Billentyű | Művelet |
| --- | --- |
| 🖱️ Lap húzása | A lap és a rajta lévők áthelyezése; egy kupacra dobod |
| 🖱️ Kattintás egy lapra | A legjobb szabályos helyre küldi |
| 🖱️ Kattintás a paklira | Húzás (Klondike) / egy sor osztása (Pók) |
| **Tab** / **Shift+Tab** | Lépés a kupacok között |
| **Enter** / **Szóköz** egy kupacon | Felveszi a mozgatható lapjait; egy másik kupacon leteszi őket; ugyanazon a kupacon a legjobb helyre küldi őket |
| **↑** / **↓** | Több / kevesebb lap a felvett sorból |
| **H** | Tipp |
| **U** / **Ctrl+Z** / **Cmd+Z** | Visszavonás |
| **A** | Mindet fel (minden lap az alapra) |
| **D** | Húzás / osztás a pakliból |
| **N** | Új játék (előbb rákérdez) |
| **Esc** | A felvett lapok elengedése · szünet |
| **Enter** | Indítás · új játszma (kupacon kívül) |
| **P** | Szünet / folytatás |
| **R** | Szabályok (szünetelteti a játékot) |
| **T** | Sötét / világos téma váltása (önálló oldalon) |

A gyorsbillentyűk nem működnek, amíg egy űrlapmezőbe gépelsz, vagy nyomva tartod a Cmd/Ctrl/Alt gombot (kivéve a Ctrl/Cmd+Z-t).

## 📱 Mobilon

Koppints egy lapra a kijelöléshez — a rajta lévő lapok vele mennek, és az állapotsor kiírja, mit tartasz a kezedben. Aztán
koppints arra az oszlopra, szabad cellára vagy alapra, ahová kerüljön; ha oda nem fér, a megkoppintott lap lesz az új kijelölés.
Dupla koppintással a lap az alapra megy (ha oda nem mehet, a legjobb másik helyre). Ujjal húzni is lehet, a paklira koppintva
húzol vagy osztasz, a kupacok közötti asztalra koppintva pedig elengeded a kijelölést. Az asztal sosem görög és nem nagyít az
ujjad alatt. A *Teljes képernyő* az egész kijelzőt a lapoknak adja; iPhone-on a **Megosztás → Főképernyőhöz adás** a böngésző
sávjait is eltünteti.

## 🎯 Pontozás és statisztika

Csak a **megnyert** játszma ér pontot:

```
pont         = kerekítés(alap × időszorzó × visszavonás-szorzó)
időszorzó    = clamp(szintidő / másodperc, 0.25, 1)
vissza-szorzó = max(0.5, 1 − 0.02 × visszavonások)
```

| Játék | Alap | Szintidő |
| --- | --- | --- |
| Klondike, egyes húzás | 1000 | 300 mp |
| Klondike, hármas húzás | 1500 | 300 mp |
| Pók, 1 szín | 1000 | 600 mp |
| Pók, 2 szín | 2000 | 600 mp |
| Pók, 4 szín | 4000 | 600 mp |
| FreeCell | 2000 | 420 mp |

A legtöbb elérhető pont **4000** (Pók, négy szín, szintidőn belül, visszavonás nélkül). A megnyert játszma egyszer kerül
rögzítésre, `win` eredménnyel. A **Befejezés** gomb megerősítés után idő előtt lezárja a játszmát: `finished` eredménnyel kerül
rögzítésre, és **0** ponttal a ranglistára. Az **Új játék**kal vagy változatváltással félbehagyott játszma **nem** kerül a
statisztikába. A statisztikasáv a **Lépések**, az aktív **Idő**, a **Pont** (győzelemig 0) és a **Rekord** értékét mutatja. A kit
minden befejezett játszmát az `arcade.stats.solitaire` kulcs alatt rögzít.

## 💾 Automatikus mentés és folytatás

A munkamenet a teljes játszma: a változat, az állás, a visszavonási előzmények (legfeljebb 200 állapot), a lépés- és
visszavonásszámláló és az óra (kulcs: `arcade.session.solitaire`, sémaverzióval). Egy ellenőrző minden mentett állást átvizsgál —
változatonként a kupacok számát és azt, hogy megvan-e a teljes pakli (52 vagy 104 lap) —, és elveti azt a mentést, amelynek
változata nem illik az állásához. A mentés nagyjából másodpercenként történik, valamint mindig, amikor az oldal a háttérbe kerül
vagy a játék lecsatolódik. Újratöltéskor az **Üdv újra!** kártya fogad, szüneteltetett játékkal. Megnyert vagy befejezett játszma sosem töltődik
vissza, így kétszer sem kerülhet rögzítésre; az *Elmentve* jelvény melletti **Elvetés** törli a mentést.

## 🧩 Beágyazás az Arcade-Game-Centerbe

```tsx
import { SolitaireGame, SolitaireDemo } from '@arcade/solitaire';

<SolitaireGame
  embedded                                   // elrejti az oldal címét; a portál mutatja
  onGameOver={(score, info) => submitScore('solitaire', score, info)}  // megnyert játszmák; a Befejezés 0-t küld { finished: true }-val
  onRunEnd={(run) => console.log(run.outcome, run.score)}  // minden véget ért játszma
  onStatusChange={({ status, score, seconds }) => updateHeader(status, seconds)}
/>
<SolitaireDemo active={cardIsVisible} />     // a nyitóoldal bemutató módja
```

Mindkét komponens a közös `ArcadeGameProps` / `ArcadeDemoProps` szerződést követi (`src/arcade/types.ts`).
Állapotok: `idle` a látogatás első játszmája előtt (Indítás kártya), `running` játék közben, `paused` szüneteltetve (vagy
visszatöltés után), `gameOver`, amint a játszma megnyerve vagy idő előtt befejezve.

## 🧪 Szkriptek

| Szkript | Mire való |
| --- | --- |
| `npm run dev` | Vite fejlesztői szerver |
| `npm run build` | Típusellenőrzés (`tsc -b`) és éles build |
| `npm run preview` | Az éles build kiszolgálása |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (logikai és komponenstesztek) |
| `npm run check` | lint → typecheck → test → build (ezt futtatja a CI) |

## 🏗️ Felépítés

```
src/
  arcade/                 becsomagolt Zoltan's Arcade kit — itt ne szerkeszd (lásd a README-jét)
  logic/                  tiszta játékszabályok, React nélkül
    types.ts deck.ts      lapok, kupacok, seedelt keverés, alap- és sorszabályok
    klondike.ts spider.ts freecell.ts   az egyes játékok osztása és lépései
    moves.ts              legalMoves, applyMove, isWon, autoFoundation, canAutoComplete
    history.ts            megváltoztathatatlan visszavonási verem
    game.ts               módok, playMove (+ biztonságos automatikus lépések), visszavonás, Mindet fel, tippek, kattintási célok, mentésellenőrző
    scoring.ts            alap × időszorzó × visszavonás-szorzó
  components/             Table, Pile, SuitMark, useDrag (pointer eventek), layout (lapméret, legyezők), DentalToggle
  rules.tsx               a Szabályok ablak szakaszai (számok a valódi konstansokból) és a sor-ábra
  labels.ts               változat- és módnevek, az érintéses súgó sorai
  demo/                   SolitaireDemo + a megírt FreeCell-megoldás
  SolitaireGame.tsx       a beágyazható játék (ArcadeGameProps)
  i18n.ts                 en / hu / de szövegek
  App.tsx                 önálló oldal: <ArcadeShell><SolitaireGame/></ArcadeShell>
  main.tsx                belépési pont; egyszer tölti be a közös arcade.css-t
  index.ts                csomag-belépési pont az Arcade-Game-Center számára
```

A felület csak a motoron keresztül változtatja az állást (`playMove`, `undoGame`, `autoComplete`, `finishGame` a
`logic/game.ts`-ben), amely sosem módosítja a bemenetét — a visszavonás egyszerűen visszaállít egy eltárolt állapotot.

## 🤝 Közreműködés

Lásd: [CONTRIBUTING.md](./CONTRIBUTING.md), a [magatartási kódex](./CODE_OF_CONDUCT.md) és a [SECURITY.md](./SECURITY.md).
A közreműködők listája: [CONTRIBUTORS.md](./CONTRIBUTORS.md); a változások: [CHANGELOG.md](./CHANGELOG.md).

## ⚖️ Licenc

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">❤️-vel készítette Zoltán Dul · a <a href="https://github.com/ZoliQua/Arcade-Game-Center">Zoltan's Arcade</a> része</p>
