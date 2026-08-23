# Installation

Install one framework package and run tests in a real browser with vitest browser mode.

## Packages

| Package | Role |
| --- | --- |
| `@siheom/core` | Factory, interpreter, default actions/assertions |
| `@siheom/react` | React `given.render`, pre-bound API |
| `@siheom/vue` | Vue `given.render` |
| `@siheom/svelte` | Svelte `given.render` |
| `@siheom/solid` | Solid `given.render` |
| `@siheom/angular` | Angular `given.render` |
| `@siheom/qwik` | Qwik `given.render` |
| `@siheom/react-native` | `given.render` on top of React Native Testing Library |

Experimental helpers:

| Package | Role |
| --- | --- |
| [`@siheom/ime`](/en/guides/ime) | Hangul IME composition emulation (replace `fill`/`type`) |

`@siheom/core` is a dependency of every framework package, so you don't install it separately.

## Install

```bash
yarn add @siheom/react
# or
npm install @siheom/react
```

Using Vue, Svelte, Angular, Qwik, or React Native instead? See the matching quick start guide.

Dev dependencies for browser mode (React shown here):

```bash
yarn add -D vitest @vitest/browser playwright @vitejs/plugin-react
yarn add @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Peer dependencies

siheom sits on top of Testing Library rather than bundling it. Peers avoid version clashes with what is already in your project.

- `@testing-library/dom` ^10
- `@testing-library/react` ^16
- `@testing-library/jest-dom` ^6
- `@testing-library/user-event` ^14
- `vitest` ^4
- `react` / `react-dom` ^18 or ^19

jsdom and happy-dom are not the recommended runtime (React Native is the exception). Follow browser mode setup in [React quick start](/en/getting-started/react).

## Minimal import

```ts
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
```

## Next steps

- [React quick start](/en/getting-started/react) — Browser mode and your first test
- Quick starts for [Vue](/en/getting-started/vue), [Svelte](/en/getting-started/svelte), [Solid](/en/getting-started/solid), [Angular](/en/getting-started/angular), [Qwik](/en/getting-started/qwik), [React Native](/en/getting-started/react-native)
- [@siheom/ime](/en/guides/ime) — Tests that need Hangul composition
- [Configuration](/en/configuration) — Export surface
