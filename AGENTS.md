# Repo Universe agent notes

- Preserve the product metaphor: repository = star, languages = planets, contributors = outer signals, forks = asteroid density.
- Keep GitHub network code server-only. Never expose `GITHUB_TOKEN` or fetch arbitrary user URLs.
- Keep repository normalization separate from the Three.js-independent universe model.
- Permanent repository structure must remain deterministic; do not use uncontrolled `Math.random()` for it.
- Three.js imperative rendering belongs under `components/universe/engine/`. Keep a single RAF lifecycle and dispose GPU resources on teardown.
- Prefer Server Components outside interactive UI. Avoid adding a database, auth, analytics, R3F, shadcn, or large state libraries.
- Before shipping, run lint, typecheck, tests, build, and browser QA when the environment supports them.
