# given

A **given** step sets preconditions. In React, `given.render` mounts a component in a real browser.

## Runtime contract

siheom core does not know how to paint UI. A framework package provides **`given.render`**.

```ts
export const defaultGivens = {
  render: async (element: ReactElement) => {
    render(element);
  },
};
```

In a test:

```tsx
given.render(<Counter />)
```

## Providers / wrappers

Router, query client, theme, and similar wrappers are not separate siheom APIs. Extend `given.render` with `extendSiheom`:

```ts
const { runSiheom, given } = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: {
      render: async (ui) => {
        render(<Providers>{ui}</Providers>);
      },
    },
  },
  {},
);
```

Export these bindings from a test helper module and reuse them across the suite.

## Next steps

- [given API](/en/configuration/given) — Signature
- [Factory](/en/concepts/factory) — Extend givens
- [React quick start](/en/getting-started/react) — Provider example
