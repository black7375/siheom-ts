# Mobile Filter — Sheet

On a mobile layout, a button opens a Sheet (bottom sheet); picking an option closes the sheet and updates the selected value. A Sheet exposes as a `dialog` role.

Source: [`apps/react-example/test/stories/shadcn/mobile-filter/MobileFilter.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/mobile-filter/MobileFilter.tsx), [`MobileFilter.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/mobile-filter/MobileFilter.test.tsx).

## UI

- Selected filter display: role `status`, name `"선택된 필터"`
- Open filter: role `button`, name `"필터"`
- Sheet: role `dialog`, name `"필터"`
- Filter options: role `button`, name `"전체"` (All) / `"진행 중"` (In progress) / `"완료"` (Done)

## Test: open the sheet and pick a filter

```tsx
await runSiheom(
  given.render(<MobileFilter />),
  assertions.textContent(query.status("선택된 필터"), "전체"),
  actions.click(query.button("필터")),
  assertions.visible(query.dialog("필터")),
  actions.click(query.button("진행 중")),
  assertions.textContent(query.status("선택된 필터"), "진행 중"),
  assertions.not.visible(query.dialog("필터")),
);
```

A single test chains "confirm open → select → confirm closed." Since selecting an option closes the sheet as a side effect, dropping that final `assertions.not.visible` would let a regression in the auto-close behavior slip through unnoticed.

## Accessibility notes

- shadcn/ui's `Sheet` uses the `dialog` role internally. Regardless of the bottom-sheet visual treatment, the test only needs to know the dialog semantic contract — the same query approach (`query.dialog`) works for a centered desktop modal too.
- Filter option buttons only get a visual highlight (`variant="default"`) for the selected one, but that distinction doesn't show up in the accessibility tree. Announcing "which filter is selected" through a `status` outside the sheet (`"선택된 필터"`) is the only way to verify it once the sheet has closed.

## Next steps

- [billing-alert](/en/examples/billing-alert) — Alert
- [assertions API](/en/configuration/assertions) — visible · not.visible
- [locator](/en/concepts/locator) — dialog
