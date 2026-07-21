# Kanban — Drag and Drop

A kanban board where dragging a card into another column moves it there. `actions.dragAndDrop` simulates the real `dragstart`/`drop` event sequence.

Source: [`apps/react-example/test/stories/shadcn/kanban/KanbanBoard.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/kanban/KanbanBoard.tsx), [`KanbanBoard.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/kanban/KanbanBoard.test.tsx).

## UI

- Columns: role `list`, name `"진행 중"` (In progress) / `"완료"` (Done)
- Cards: role `listitem`, name is the card title (`"디자인"`)

## Test: drag a card into another column

```tsx
await runSiheom(
  given.render(<KanbanBoard />),
  assertions.visible(query.within(query.list("진행 중"), query.listitem("디자인"))),
  actions.dragAndDrop(query.listitem("디자인"), query.list("완료")),
  assertions.visible(query.within(query.list("완료"), query.listitem("디자인"))),
  assertions.not.visible(query.within(query.list("진행 중"), query.listitem("디자인"))),
);
```

`actions.dragAndDrop(source, target)` fires the HTML5 drag-and-drop event sequence (`dragstart` → `dragover` → `drop`) in order. Which column a card lives in is verified with `query.within(list, listitem)` — the two columns couldn't hold a card of the same name anyway, but scoping "inside this column" makes the intent clearer.

## Accessibility notes

- This kanban board is built on native HTML5 drag-and-drop (`draggable` plus `onDragStart`/`onDrop`). There's no `aria-grabbed` or similar state attribute, so the accessibility of drag-and-drop itself (a keyboard alternative for moving cards) is out of scope for this example — a real project should add a keyboard fallback, such as a context menu action like "move to next column."
- Each column is a `<ul aria-label={COLUMN_LABELS[columnId]}>`, so the drop target itself can be reliably found by its `list` role.

## Next steps

- [app-shell](/en/examples/app-shell) — Sidebar + Breadcrumb
- [actions API](/en/configuration/actions) — dragAndDrop
- [locator](/en/concepts/locator) — Scoping with `query.within`
