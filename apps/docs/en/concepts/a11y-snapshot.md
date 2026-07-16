# Accessibility snapshot

An accessibility snapshot serializes the **semantic accessibility tree** as text — not DOM HTML. Compare it to a file with `assertions.a11ySnapshot`.

## Usage

```tsx
return runSiheom(
  given.render(<Counter />),
  assertions.a11ySnapshot(query.button("0"), "counter-initial.snap"),
);
```

Snapshot files live under `__snapshots__/`. siheom uses vitest's file snapshot matcher.

## Examples

Counter initial state:

```text
button: "0"
```

After two clicks:

```text
button: "2"
```

SignUpForm error state (excerpt):

```text
region: "signup-form"
  textbox: "Email *" [invalid=true] [description="Invalid email format"]
  alert
    "Invalid email format"
  ...
```

States like `[invalid=true]` and `[checked=false]` come from computed ARIA state. You pin **semantic UI meaning**, not pixels.

## vs HTML and screenshots

- HTML dumps: noisy tags and classes; unstable diffs.
- Screenshots: pixel regression; expensive in tokens.
- A11y snapshots: role, name, and state — readable for humans and AI.

The same format appears in failure reports under `[A11y Snapshot]`.

## Next steps

- [assertions API](/en/configuration/assertions) — `a11ySnapshot`, `tableSnapshot`
- [Example: Counter](/en/examples/counter) — Snapshot tests
- [Example: SignUpForm](/en/examples/signup-form) — Form error snapshots
