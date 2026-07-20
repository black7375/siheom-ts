# Project setup (for Siheom skill users)

The skill does **not** assume Bun, npm, a monorepo, or fixed script names. Discover the user's project first.

## 1. Find package manager

| Lockfile | Manager | Run scripts |
| -------- | ------- | ------------- |
| `bun.lock` / `bun.lockb` | Bun | `bun run <script>` |
| `pnpm-lock.yaml` | pnpm | `pnpm <script>` or `pnpm run <script>` |
| `yarn.lock` | Yarn | `yarn <script>` |
| `package-lock.json` | npm | `npm run <script>` |

Monorepo: read root `package.json` **and** the app package that owns the UI under test.

## 2. Find scripts

Read `package.json` → `scripts`. Match by **intent**, not exact name:

| Intent | Common script names |
| ------ | ------------------- |
| Test | `test`, `vitest`, `test:run`, `test:unit`, `unit` |
| Typecheck | `typecheck`, `check:types`, `tsc`, `types` |
| Lint | `lint`, `oxlint`, `eslint` |
| Format | `format`, `fmt`, `oxfmt`, `prettier` |
| CI (all) | `ci`, `check`, `verify` |

Run from the package directory that contains the Siheom spec, unless the root orchestrates workspaces.

Filter one spec when the runner supports it:

```bash
npm run test -- MyFeature
pnpm test MyFeature
yarn test MyFeature
bun run test MyFeature
```

## 3. Missing scripts — ask the user

Do **not** guess or install without asking. Propose adding scripts + devDependencies.

### Tests (Vitest + Siheom)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^4",
    "@vitest/browser": "^4",
    "@testing-library/react": "^16",
    "@siheom/react": "<version>"
  }
}
```

Browser mode (Playwright) is common for Siheom; see `@siheom/react` docs or an example `vite.config.ts` in the repo.

### Typecheck

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit -p tsconfig.json"
  }
}
```

### Lint — [oxlint](https://oxc.rs/docs/guide/usage/linter.html)

```json
{
  "scripts": {
    "lint": "oxlint"
  },
  "devDependencies": {
    "oxlint": "^1"
  }
}
```

### Format — [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)

```json
{
  "scripts": {
    "format": "oxfmt",
    "format:check": "oxfmt --check"
  },
  "devDependencies": {
    "oxfmt": "^0.35"
  }
}
```

Alternatives: ESLint + Prettier if the user prefers.

## 4. Gate before commit

Run every script the project defines for quality (at minimum **test**; plus **typecheck**, **lint**, **format:check** when present). See [TDD.md](TDD.md) commit discipline.
