# Installation

Install `@siheom/react` and run tests in a real browser with vitest browser mode.

## Packages

| Package | Role |
| --- | --- |
| `@siheom/core` | Factory, interpreter, default actions/assertions |
| `@siheom/react` | React `given.render`, pre-bound API |

## Install

```bash
bun add @siheom/react
# or
npm install @siheom/react
```

Dev dependencies for browser mode:

```bash
bun add -d vitest @vitest/browser playwright @vitejs/plugin-react
bun add @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Peer dependencies

siheom sits on top of Testing Library rather than bundling it. Peers avoid version clashes with what is already in your project.

- `@testing-library/dom` ^10
- `@testing-library/react` ^16
- `@testing-library/jest-dom` ^6
- `@testing-library/user-event` ^14
- `vitest` ^3
- `react` / `react-dom` ^18 or ^19

jsdom and happy-dom are not the recommended runtime. Follow browser mode setup in [React quick start](/en/getting-started/react).

## Minimal import

```ts
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
```

## Next steps

- [React quick start](/en/getting-started/react) — Browser mode and your first test
- [Configuration](/en/configuration) — Export surface
