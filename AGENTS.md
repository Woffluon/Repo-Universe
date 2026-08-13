# Repo Universe agent notes

- Preserve the product metaphor: repository = star, languages = planets, contributors = outer signals, forks = asteroid density.
- Keep GitHub network code server-only. Never expose `GITHUB_TOKEN` or fetch arbitrary user URLs.
- Keep repository normalization separate from the Three.js-independent universe model.
- Permanent repository structure must remain deterministic; do not use uncontrolled `Math.random()` for it.
- Three.js imperative rendering belongs under `components/universe/engine/`. Keep a single RAF lifecycle and dispose GPU resources on teardown.
- Prefer Server Components outside interactive UI. Avoid adding a database, auth, analytics, R3F, shadcn, or large state libraries.
- Before shipping, run lint, typecheck, tests, build, and browser QA when the environment supports them.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
