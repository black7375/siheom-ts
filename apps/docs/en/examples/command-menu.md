# Command Menu — Command Palette (⌘K)

A command palette opened from a button. Typing into the combobox inside the dialog filters options; picking one closes the dialog and shows the result.

Source: [`apps/react-example/test/stories/shadcn/command-menu/CommandMenuApp.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/command-menu/CommandMenuApp.tsx), [`CommandMenuApp.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/command-menu/CommandMenuApp.test.tsx).

## UI

- Trigger: role `button`, name `"빠른 실행"`
- Dialog: role `dialog`, name `"빠른 실행"`
- Search: role `combobox`, name `"명령 검색"`
- Options: role `option` (`"새 문서"`, `"설정 열기"`)
- Result: role `status`, name `"실행 결과"`

## Test: search and pick a command

```tsx
await runSiheom(
  given.render(<CommandMenuApp />),
  actions.click(query.button("빠른 실행")),
  assertions.visible(query.dialog("빠른 실행")),
  actions.fill(query.within(query.dialog("빠른 실행"), query.combobox("명령 검색")), "새"),
  actions.click(query.within(query.dialog("빠른 실행"), query.option("새 문서"))),
  assertions.not.visible(query.dialog("빠른 실행")),
  assertions.textContent(query.status("실행 결과"), "새 문서 실행됨"),
);
```

Both the search input and the option are wrapped in `query.within(dialog, ...)`. Even with a single dialog on the page, scoping into the currently open one keeps the test resilient if the component is reused or multiple dialogs can be open.

## Accessibility notes

- The command palette gets its accessible name and description from `CommandDialog`'s `title`/`description`. That visually-hidden description tells screen reader users what the palette is for.
- This example shares the `actions.contextClick` action added by `apps/react-example/test/stories/shadcn/runSiheom.tsx` with [document-actions](/en/examples/document-actions). Extending `runSiheom` once at the project level lets multiple examples/components reuse the same custom action.

## Next steps

- [document-actions](/en/examples/document-actions) — Same `runSiheom.tsx`, Dropdown/Context Menu
- [locator](/en/concepts/locator) — Scoping with `query.within`
- [actions API](/en/configuration/actions) — fill · click
