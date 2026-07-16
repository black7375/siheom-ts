# Factory

Teams need different actions. You may want to fold a repeating flow like picking an account from a combobox into one step, or replace `fill` with a project-specific implementation. The factory is the assembly point for that extension and replacement.

**Input** is registries (`actions`, `assertions`, `givens`, `messages`). **Output** is the surface you already use: `runSiheom` / `actions` / `assertions` / `given`. `query` is shared.

`@siheom/react` is a **pre-bound** entry point over the default registries. Extend and override in `@siheom/core`.

**Use `extendSiheom` for new keys and `overrideSiheom` for existing ones. Swapping them throws.**

## extendSiheom

**Add** action, assertion, given, or message keys that do not exist yet. Reusing a key throws.

```ts
import { extendSiheom, defaultActions, defaultAssertions } from "@siheom/core";

const { runSiheom, actions } = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: { render: myRender },
  },
  {
    actions: {
      selectAccount: async (target, account) => {
        /* open combobox → pick option */
      },
    },
  },
);

await runSiheom(actions.selectAccount(query.combobox(/account/i), "cash"));
```

Passing an existing key to `extendSiheom` fails like this:

```text
extendSiheom: cannot add existing actions keys: fill. Use overrideSiheom to replace.
```

## overrideSiheom

**Replace** implementations for keys that already exist. Unknown keys throw.

```ts
const { runSiheom, actions } = overrideSiheom(base, {
  actions: {
    fill: myCustomFill,
  },
});
```

Passing an unknown key to `overrideSiheom` fails like this:

```text
overrideSiheom: cannot replace unknown actions keys: selectAccount. Use extendSiheom to add.
```

## Message map

Use the factory `messages` slot for failure-report section headers. See [Message map](/en/configuration/messages).

## Next steps

- [given](/en/concepts/given) — Bind providers in `given.render`
- [Configuration](/en/configuration) — Pre-bound API and factory exports
- [Message map](/en/configuration/messages) — Customize failure-report headers
