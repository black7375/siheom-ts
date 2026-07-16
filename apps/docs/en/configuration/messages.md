# Message map

The message map changes **failure-report section headers** only. Action and assertion `log` strings stay as authored.

## Options

| Option key | Default |
| --- | --- |
| `logs` | `Logs` |
| `originalErrorMessage` | `Original Error Message` |
| `a11ySnapshot` | `A11y Snapshot` |

## Usage

```ts
import { extendSiheom, defaultActions, defaultAssertions } from "@siheom/core";

const bindings = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: { render: myRender },
  },
  {
    messages: {
      logs: "로그",
      originalErrorMessage: "원본 에러 메시지",
      a11ySnapshot: "접근성 스냅샷",
    },
  },
);
```

Partial overrides keep English defaults for omitted keys. The `messages` slot on `overrideSiheom` works the same way.

::: info
There is no locale catalog for action/assertion `log` strings yet. Only headers are changed by the message map.
:::

## Next steps

- [Configuration](/en/configuration) — Pre-bound API and factory
- [React quick start](/en/getting-started/react) — Failure report example
- [Factory](/en/concepts/factory) — Where the `messages` slot fits
