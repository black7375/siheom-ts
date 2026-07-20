# Settings — Tabs + Switch + Radio Group

A settings panel that splits general/notification settings across tabs, toggles dark mode with a `Switch`, and picks notification frequency with a `RadioGroup`. `assertions.not.visible` confirms that the other tab's controls are fully hidden when a tab is inactive.

Source: `apps/react-example/test/stories/shadcn/settings/SettingsPanel.tsx`, `SettingsPanel.test.tsx`.

## UI

- Tabs: role `tab`, name `"일반"` (General) / `"알림"` (Notifications)
- Dark mode: role `switch`, name `"다크 모드"`
- Notification frequency: role `radiogroup`, name `"알림 빈도"`; individual `radio`s are `"즉시"` (Immediate) / `"일일 요약"` (Daily digest) / `"끄기"` (Off)

## Test: visible controls change with the tab

```tsx
await runSiheom(
  given.render(<SettingsPanel />),
  assertions.selected(query.tab("일반")),
  assertions.visible(query.switch("다크 모드")),
  assertions.not.visible(query.radiogroup("알림 빈도")),
);
```

Clicking the notifications tab flips it around.

```tsx
await runSiheom(
  given.render(<SettingsPanel />),
  actions.click(query.tab("알림")),
  assertions.selected(query.tab("알림")),
  assertions.visible(query.radiogroup("알림 빈도")),
  assertions.not.visible(query.switch("다크 모드")),
);
```

## Test: toggle and radio selection

```tsx
await runSiheom(
  given.render(<SettingsPanel />),
  actions.click(query.switch("다크 모드")),
  assertions.checked(query.switch("다크 모드")),
);
```

```tsx
await runSiheom(
  given.render(<SettingsPanel />),
  actions.click(query.tab("알림")),
  actions.click(query.radio("즉시")),
  assertions.checked(query.radio("즉시")),
  assertions.not.checked(query.radio("일일 요약")),
);
```

## Accessibility notes

- Each `TabsContent` points at the panel heading (`settings-title`) via `aria-labelledby`, so a screen reader always knows which settings group is active after a tab switch.
- Content of an inactive tab is fully removed from the DOM. Pinning that with `assertions.not.visible` guarantees you can't accidentally interact with another tab's controls without switching first.
- `RadioGroup` gets its name from `aria-label`; each `radio` gets its name from a `Label`'s `htmlFor` link.

## Next steps

- [document-actions](/en/examples/document-actions) — Dropdown Menu and Context Menu
- [actions API](/en/configuration/actions) — click
- [assertions API](/en/configuration/assertions) — selected · checked · visible
