# Kanban — Drag and Drop

카드를 다른 열로 드래그하면 그 열로 옮겨지는 칸반 보드입니다. `actions.dragAndDrop`으로 실제 `dragstart`/`drop` 이벤트 흐름을 시뮬레이션합니다.

소스: [`apps/react-example/test/stories/shadcn/kanban/KanbanBoard.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/kanban/KanbanBoard.tsx), [`KanbanBoard.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/kanban/KanbanBoard.test.tsx).

## UI 접근성

시험이 고정한 초기 접근성 스냅샷입니다.

<<< @/_snaps/kanban-initial.snap{text}

## 시험: 카드를 다른 열로 드래그

```tsx
await runSiheom(
  given.render(<KanbanBoard />),
  assertions.visible(query.within(query.list("진행 중"), query.listitem("디자인"))),
  actions.dragAndDrop(query.listitem("디자인"), query.list("완료")),
  assertions.visible(query.within(query.list("완료"), query.listitem("디자인"))),
  assertions.not.visible(query.within(query.list("진행 중"), query.listitem("디자인"))),
);
```

`actions.dragAndDrop(source, target)`은 HTML5 드래그 앤 드롭 이벤트(`dragstart` → `dragover` → `drop`)를 순서대로 발생시킵니다. 카드가 어느 열에 있는지는 `query.within(list, listitem)`으로 확인합니다 — 두 열에 같은 이름의 카드가 있을 수는 없지만, "이 열 안에 있다"를 명시하면 의도가 더 분명해집니다.

## 접근성 포인트

- 이 칸반은 `draggable` 속성과 `onDragStart`/`onDrop` 핸들러로 만든 네이티브 HTML5 드래그 앤 드롭입니다. 별도의 `aria-grabbed` 같은 상태 속성은 없으므로, 드래그 앤 드롭 자체의 접근성(키보드로 카드를 옮기는 대체 수단)은 이 예제의 범위 밖입니다 — 실제 프로젝트라면 키보드 대체 동작(예: 컨텍스트 메뉴로 "다음 열로 이동")을 추가하는 것이 좋습니다.
- 열은 `<ul aria-label={COLUMN_LABELS[columnId]}>`로 만들어, 드롭 대상 자체를 `list` role로 안정적으로 찾을 수 있게 합니다.

## 다음 단계

- [app-shell](/examples/app-shell) — Sidebar + Breadcrumb
- [actions API](/configuration/actions) — dragAndDrop
- [locator](/concepts/locator) — `query.within`으로 범위 좁히기
