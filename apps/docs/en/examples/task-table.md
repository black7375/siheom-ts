# Task Table — Data Table + Pagination + Badge

A table with a status badge per row, paired with Pagination. `assertions.current` checks "which page is active" through `aria-current`.

Source: [`apps/react-example/test/stories/shadcn/task-table/TaskTable.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/task-table/TaskTable.tsx), [`TaskTable.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/task-table/TaskTable.test.tsx).

## UI accessibility

Initial accessibility snapshot fixed by the test.

<<< @/_snaps/task-table-initial.snap{text}

## Test: first page and status badges

```tsx
await runSiheom(
  given.render(<TaskTable />),
  assertions.visible(query.table("할 일")),
  assertions.visible(query.row("API 문서 작성")),
  assertions.visible(query.row("디자인 리뷰")),
  assertions.not.visible(query.row("배포 자동화")),
  assertions.textContent(query.status("API 문서 작성 상태"), "진행 중"),
  assertions.textContent(query.status("디자인 리뷰 상태"), "완료"),
);
```

## Test: paging

```tsx
await runSiheom(
  given.render(<TaskTable />),
  assertions.visible(query.button("1")),
  assertions.visible(query.button("2")),
  assertions.visible(query.button("3")),
  assertions.current(query.button("1"), "page"),
  assertions.not.visible(query.row("배포 자동화")),
  actions.click(query.button("다음 페이지")),
  assertions.visible(query.row("배포 자동화")),
  assertions.not.visible(query.row("API 문서 작성")),
  assertions.current(query.button("2"), "page"),
  assertions.not.current(query.button("1"), "page"),
);
```

`assertions.current(target, "page")` checks `aria-current="page"`. Even though the active page button is visually bolded, the test looks at `aria-current`, not a CSS class — the same signal a screen reader picks up.

## Accessibility notes

- The status badge carries both `role="status"` and `aria-label="{title} 상태"`, so a single table cell exposes both "status of what" and "the status value" in the accessibility tree.
- Labeling the whole row (`aria-label={task.title}`) lets `query.row("API 문서 작성")` find the row directly, instead of composing it from individual cell text.

## Next steps

- [order-tracking](/en/examples/order-tracking) — Progress steps with `aria-current="step"`
- [assertions API](/en/configuration/assertions) — current · not.current
- [locator](/en/concepts/locator) — table · row
