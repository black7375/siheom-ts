# View Switcher — Toggle Group

같은 데이터를 목록/그리드 두 가지 방식으로 보여주고, Toggle Group으로 전환하는 예제입니다. 뷰가 바뀌면 이전 뷰의 `region`은 완전히 사라진다는 것을 확인합니다.

소스: [`apps/react-example/test/stories/shadcn/view-switcher/ViewSwitcher.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/view-switcher/ViewSwitcher.tsx), [`ViewSwitcher.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/view-switcher/ViewSwitcher.test.tsx).

## UI

- 전환 버튼: role `button`, name `"목록"` / `"그리드"` (Toggle Group 아이템)
- 목록 뷰: role `region`, name `"목록 보기"`
- 그리드 뷰: role `region`, name `"그리드 보기"`

## 시험: 목록에서 그리드로 전환

```tsx
await runSiheom(
  given.render(<ViewSwitcher />),
  assertions.visible(query.region("목록 보기")),
  actions.click(query.button("그리드")),
  assertions.visible(query.region("그리드 보기")),
  assertions.not.visible(query.region("목록 보기")),
);
```

## 접근성 포인트

- Toggle Group 자체는 `aria-label="보기 방식"`으로 그룹을, 각 아이템은 `aria-label="목록"`/`aria-label="그리드"`로 개별 이름을 가집니다. 아이템에 아이콘과 텍스트가 함께 있어도, `aria-label`이 있으면 그 값이 accessible name이 됩니다.
- 두 뷰는 서로 다른 `region`으로 완전히 나뉘어 있어, "지금 어떤 뷰가 보이는가"를 시험에서 명확한 landmark 이름으로 물을 수 있습니다. `class`나 `display: none` 여부를 직접 검사할 필요가 없습니다.

## 다음 단계

- [task-table](/examples/task-table) — Data Table과 Pagination
- [assertions API](/configuration/assertions) — visible · not.visible
- [locator](/concepts/locator) — region
