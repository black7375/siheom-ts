# Document Actions — Dropdown Menu + Context Menu

Each document card exposes the same actions (copy, rename, delete) through a "more" button (Dropdown Menu) and a right-click (Context Menu). `query.within` scopes clicks to items inside whichever menu is open.

Source: [`apps/react-example/test/stories/shadcn/document-actions/DocumentActions.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/document-actions/DocumentActions.tsx), [`DocumentActions.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/document-actions/DocumentActions.test.tsx).

## UI

- Document: role `article`, name is the document title (`"기획서"`)
- More button: role `button`, name `"기획서 더보기"`
- Menu: role `menu`, name is `"기획서 더보기"` for the dropdown or `"문서 동작"` for the context menu; items are `menuitem` (`"복사"`, `"이름 변경"`, `"삭제"`)
- Result: role `status`, name `"복사 결과"`

## Test: copy from the more menu

```tsx
await runSiheom(
  given.render(<DocumentActions />),
  actions.click(query.button("기획서 더보기")),
  assertions.visible(query.menu("기획서 더보기")),
  actions.click(query.within(query.menu("기획서 더보기"), query.menuitem("복사"))),
  assertions.textContent(query.status("복사 결과"), "기획서 복사됨"),
);
```

`query.within(menu, menuitem)` scopes "copy" to the currently open menu. The dropdown and context menu share item labels, so without scoping it would be ambiguous which menu's item you mean.

## Test: delete from the right-click menu

```tsx
await runSiheom(
  given.render(<DocumentActions />),
  actions.contextClick(query.article("기획서")),
  assertions.visible(query.menu("문서 동작")),
  actions.click(query.within(query.menu("문서 동작"), query.menuitem("삭제"))),
  assertions.not.visible(query.article("기획서")),
);
```

`actions.contextClick` is a custom action this example app added with `extendSiheom`. It's not part of `@siheom/react` by default — when you need an action siheom doesn't ship, wrap `createDefaultActions()` to build a project-specific `runSiheom`/`actions`, as `apps/react-example/test/stories/shadcn/runSiheom.tsx` does.

```tsx
// runSiheom.tsx — adding a right-click action
export const { runSiheom, actions } = extendSiheom(
  { actions: createDefaultActions(), /* ... */ },
  {
    actions: {
      contextClick: (target) => userEvent.pointer([
        { keys: "[MouseRight>]", target: getElement(target, true) },
        { keys: "[/MouseRight]" },
      ]),
    },
  },
);
```

## Accessibility notes

- Dropdown Menu and Context Menu use different triggers (click vs. right-click) but the same `menu`/`menuitem` role contract, so the test code only swaps `actions.click`/`actions.contextClick` and stays otherwise identical.
- `assertions.not.visible` on the document `article` confirms deletion actually changed the list, without relying on a visual check.

## Next steps

- [command-menu](/en/examples/command-menu) — Also uses the same `runSiheom.tsx`
- [locator](/en/concepts/locator) — Scoping with `query.within`
- [factory](/en/concepts/factory) — Adding custom actions with `extendSiheom`
