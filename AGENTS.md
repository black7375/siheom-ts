# Agent instructions

This monorepo uses **Bun** as the only JavaScript runtime and package manager. Do not use Node.js, npm, npx, pnpm, or yarn.

## Commands

Run everything from the repo root unless a package-specific path is noted.

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Run tests | `bun run test` (wraps `mise exec` so vitest sees Node 24, not system Node 18) |
| Run one package's tests | `bun run --filter '@siheom/react-example' test` |
| Typecheck | `bun run typecheck` |
| Lint | `bun run lint` |
| Full CI locally | `bun run ci` |

## Do not use

- `node`, `npm`, `npx`, `pnpm`, `yarn`
- `vitest` directly — use `bun run test` or `bun run vitest` inside a package
- `/usr/bin/node` (system Node 18) — it is not the project runtime

## Tooling

- Runtime / package manager: [Bun](https://bun.sh) (pinned in `mise.toml`)
- Version manager: [mise](https://mise.jdx.dev) — run `mise trust` once, then `cd` into the repo so `bun` and Node 24 (PATH fallback only) are available
- Vitest runs via `bun --bun vitest` in package scripts — do not invoke `vitest` or `node` directly

If `node --version` reports v18 outside this repo, run commands from the repo root after `mise trust` so Node 24 from mise takes precedence over `/usr/bin/node`.
