# Save Feedback — Sonner Toast

One of the shortest siheom examples: a button click announces a save result via a [sonner](https://sonner.emilkowal.ski/) toast. The test checks the accessible name exactly as the toast library produces it.

Source: [`apps/react-example/test/stories/shadcn/save-feedback/SaveFeedback.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/save-feedback/SaveFeedback.tsx), [`SaveFeedback.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/save-feedback/SaveFeedback.test.tsx).

## UI accessibility

Initial accessibility snapshot fixed by the test.

<<< @/_snaps/save-feedback-initial.snap{text}

## Test: saving shows a toast

```tsx
await runSiheom(
  given.render(<SaveFeedback />),
  actions.click(query.button("저장")),
  assertions.textContent(query.region("Notifications alt+T"), "저장됨"),
);
```

## Accessibility notes

- `"Notifications alt+T"` isn't a string this codebase wrote — it's the `aria-label` sonner's `Toaster` attaches internally. Knowing that the test copied the library's own accessible name verbatim makes it obvious why the test would break if a future sonner version changes that label.
- The toast doesn't exist right after render; it only appears after the click. Querying this region before the action would fail. For toasts/notifications that appear asynchronously, ordering assertions after the triggering action matters.

## Next steps

- [billing-alert](/en/examples/billing-alert) — Dismissing an Alert
- [assertions API](/en/configuration/assertions) — textContent
- [locator](/en/concepts/locator) — region
