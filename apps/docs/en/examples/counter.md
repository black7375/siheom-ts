# Counter

Counter is a single button whose label increments by 1 on each click. Use it to learn click, visible, and a11ySnapshot in the smallest possible test.

Source: [`apps/react-example/test/stories/Counter.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/Counter.tsx), [`Counter.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/Counter.test.tsx).

## UI accessibility

The button's children are its accessible name.

Initial:

<<< @/_snaps/counter-initial.snap{text}

After two clicks:

<<< @/_snaps/counter-after-clicks.snap{text}

## Test: increment

```tsx
return runSiheom(
  given.render(<Counter />),
  actions.click(query.button("0")),
  actions.click(query.button("1")),
  assertions.visible(query.button("2")),
);
```

`query.button("0")` is role `button`, name `"0"`. No CSS classes or `data-testid`.

## Test: accessibility snapshot

```tsx
return runSiheom(
  given.render(<Counter />),
  assertions.a11ySnapshot(query.button("0"), "counter-initial.snap"),
);
```

## Accessibility notes

- Visible digit text is enough for the accessible name here.
- Icon-only buttons would need `aria-label` — not the case for Counter.

## Next steps

- [SignUpForm](/en/examples/signup-form) — Form validation and errormessage
- [locator](/en/concepts/locator) — Role + name
- [Accessibility snapshot](/en/concepts/a11y-snapshot)
