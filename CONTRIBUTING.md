# Contributing to Solitaire

Thanks for your interest! Solitaire is one of the Zoltan’s Arcade games — it runs on its own and inside [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center).
Please read the [Code of Conduct](./CODE_OF_CONDUCT.md) first.

## Getting started

```bash
git clone https://github.com/ZoliQua/Solitaire-Game.git
cd Solitaire-Game
npm install
npm run dev
```

Node.js **20 or newer** is required (see `.nvmrc`).

## Before you open a pull request

Run the full check — the same one CI runs:

```bash
npm run check   # lint → typecheck → tests → production build
```

- Keep game rules in pure functions under `src/logic/` and cover them with tests.
- Keep pull requests small and focused: one fix or one feature.
- Update the README and CHANGELOG when behaviour changes.
- `src/arcade/` is the vendored shared kit. **Do not edit it here** — change it in
  [Arcade-Game-Center/packages/kit](https://github.com/ZoliQua/Arcade-Game-Center/tree/main/packages/kit)
  and sync it to every game.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat: …`, `fix: …`,
`docs: …`, `test: …`, `refactor: …`, `chore: …`. Write the subject in the imperative
and explain the *why* in the body.

## Reporting bugs and ideas

Open an issue using one of the templates. For security problems see [SECURITY.md](./SECURITY.md).

## License

By contributing you agree that your contributions are licensed under the [MIT License](./LICENSE).
