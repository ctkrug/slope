# Contributing

This is a personal side project — no external PRs expected — but future work on it (including
future automated build passes) should follow these conventions:

## Commits

One atomic change per commit. Subject line: `<type>(<scope>): <imperative summary>`, using a
conventional-commit type (`feat` / `fix` / `docs` / `test` / `refactor` / `perf` / `ci` /
`build` / `chore` / `style`). Add a 1-3 line body for anything substantive (`feat` / `fix` /
`refactor` / `perf`) explaining *why*, not just what — the diff already shows what changed.

## Workflow

1. `npm install`
2. `npm run lint` and `npm test` before committing.
3. `npm run build` to confirm the static `dist/` output still builds cleanly.
4. Check `docs/BACKLOG.md` for the current epic/story plan and `docs/DESIGN.md` for the visual
   direction before adding UI.

## Design

Any UI work follows `docs/DESIGN.md` (tokens, layout, motion, sound) rather than improvising a
new look. Change the direction only deliberately, in its own commit, with a note on why.
