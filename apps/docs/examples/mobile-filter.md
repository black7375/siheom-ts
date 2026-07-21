# Mobile Filter — Sheet

모바일 화면에서 버튼으로 Sheet(바텀시트)를 열고, 옵션을 고르면 시트가 닫히며 선택값이 반영되는 예제입니다. Sheet는 `dialog` role로 노출됩니다.

소스: [`apps/react-example/test/stories/shadcn/mobile-filter/MobileFilter.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/mobile-filter/MobileFilter.tsx), [`MobileFilter.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/mobile-filter/MobileFilter.test.tsx).

## UI

- 선택된 필터 표시: role `status`, name `"선택된 필터"`
- 필터 열기: role `button`, name `"필터"`
- Sheet: role `dialog`, name `"필터"`
- 필터 옵션: role `button`, name `"전체"` / `"진행 중"` / `"완료"`

## 시험: 시트를 열고 필터 선택

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

한 시험 안에서 "열림 확인 → 선택 → 닫힘 확인"까지 이어집니다. Sheet가 옵션 선택과 동시에 닫히는 동작이므로, 마지막 `assertions.not.visible`이 없으면 닫힘 자체가 회귀했을 때 놓치게 됩니다.

## 접근성 포인트

- shadcn/ui의 `Sheet`는 내부적으로 `dialog` role을 씁니다. 바텀시트라는 시각적 형태와 관계없이, 시험은 dialog라는 시맨틱 계약만 알면 됩니다 — 데스크톱의 중앙 모달과 똑같은 쿼리 방식(`query.dialog`)을 쓸 수 있습니다.
- 필터 옵션 버튼은 선택된 것만 `variant="default"`로 시각적 강조를 받지만, 접근성 트리에는 그 구분이 드러나지 않습니다. "선택된 필터가 무엇인지"는 시트 바깥의 `status`(`"선택된 필터"`)로 알려주는 편이, 시트가 닫힌 뒤에도 확인 가능한 유일한 방법입니다.

## 다음 단계

- [billing-alert](/examples/billing-alert) — Alert
- [assertions API](/configuration/assertions) — visible · not.visible
- [locator](/concepts/locator) — dialog
