# View Switcher — Toggle Group

The same data rendered two ways — list and grid — switched with a Toggle Group. The test confirms the previous view's `region` fully disappears when the view changes.

Source: [`apps/react-example/test/stories/shadcn/view-switcher/ViewSwitcher.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/view-switcher/ViewSwitcher.tsx), [`ViewSwitcher.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/view-switcher/ViewSwitcher.test.tsx).

## UI accessibility

Initial accessibility snapshot fixed by the test.

<<< @/_snaps/view-switcher-initial.snap{text}

## Test: switch from list to grid

```tsx
await runSiheom(
  given.render(<ViewSwitcher />),
  assertions.visible(query.region("목록 보기")),
  actions.click(query.button("그리드")),
  assertions.visible(query.region("그리드 보기")),
  assertions.not.visible(query.region("목록 보기")),
);
```

## Accessibility notes

- The Toggle Group itself is named via `aria-label="보기 방식"`, and each item gets its own name from `aria-label="목록"`/`aria-label="그리드"`. Even with an icon plus text inside an item, an `aria-label` wins as the accessible name.
- The two views are split into distinct `region`s, so "which view is showing right now" is a clear landmark name in the test — no need to inspect a `class` or `display: none` directly.

## Next steps

- [task-table](/en/examples/task-table) — Data Table and Pagination
- [assertions API](/en/configuration/assertions) — visible · not.visible
- [locator](/en/concepts/locator) — region
