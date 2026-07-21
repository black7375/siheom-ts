# Task Table — Data Table + Pagination + Badge

행마다 상태 배지가 있는 테이블과, 페이지를 넘기는 Pagination을 함께 시험합니다. `assertions.current`로 "지금 몇 페이지인가"를 `aria-current`로 확인합니다.

소스: [`apps/react-example/test/stories/shadcn/task-table/TaskTable.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/task-table/TaskTable.tsx), [`TaskTable.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/task-table/TaskTable.test.tsx).

## UI 접근성

시험이 고정한 초기 접근성 스냅샷입니다.

<<< @/_snaps/task-table-initial.snap{text}

## 시험: 첫 페이지 목록과 상태 배지

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

## 시험: 페이지 이동

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

`assertions.current(target, "page")`는 `aria-current="page"`를 확인합니다. 페이지 번호 버튼 자체가 시각적으로 굵게 표시되더라도, 시험은 `class`가 아니라 `aria-current`를 봅니다 — 스크린 리더가 인식하는 것과 같은 정보입니다.

## 접근성 포인트

- 상태 배지는 `role="status"`와 `aria-label="{제목} 상태"`를 함께 달아, 표 셀 하나만으로도 "무엇의 상태인지"와 "상태값"을 모두 접근성 트리에서 읽을 수 있게 합니다.
- 행 전체에 `aria-label`을 달아 두면(`aria-label={task.title}`), 셀 텍스트를 일일이 조합하지 않고도 `query.row("API 문서 작성")`처럼 행을 바로 찾을 수 있습니다.

## 다음 단계

- [order-tracking](/examples/order-tracking) — `aria-current="step"`으로 진행 단계 표시
- [assertions API](/configuration/assertions) — current · not.current
- [locator](/concepts/locator) — table · row
