# Order Tracking — Timeline (Card composition)

주문 배송 단계를 타임라인으로 보여주는 예제입니다. 현재 진행 중인 단계를 `aria-current="step"`으로 표시하고, 나머지 단계는 아니라는 것까지 함께 확인합니다.

소스: [`apps/react-example/test/stories/shadcn/order-tracking/OrderTracking.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/order-tracking/OrderTracking.tsx), [`OrderTracking.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/order-tracking/OrderTracking.test.tsx).

## UI 접근성

시험이 고정한 초기 접근성 스냅샷입니다.

<<< @/_snaps/order-tracking-initial.snap{text}

## 시험: 진행 중인 단계 확인

```tsx
await runSiheom(
  given.render(<OrderTracking />),
  assertions.visible(query.region("주문 배송")),
  assertions.visible(query.listitem("주문 접수")),
  assertions.visible(query.listitem("배송 중")),
  assertions.current(query.listitem("배송 중"), "step"),
  assertions.not.current(query.listitem("주문 접수"), "step"),
  assertions.not.current(query.listitem("배달 완료"), "step"),
  assertions.textContent(query.region("주문 정보"), "ORD-2024-001"),
  assertions.textContent(query.region("주문 정보"), "무선 이어폰"),
);
```

## 접근성 포인트

- 타임라인은 `<Card>`를 나열한 것이지만, 진행 상태 자체는 `aria-current="step"`이라는 표준 속성으로 표현됩니다. 시각적으로는 `border-primary`로 강조되는 카드지만, 시험은 스타일이 아니라 시맨틱을 검사합니다.
- `assertions.not.current`를 다른 두 단계에도 적용해, "정확히 하나의 단계만 current"라는 불변식을 시험에 남깁니다. 하나만 확인하면 여러 단계가 동시에 current로 표시되는 버그를 놓칠 수 있습니다.
- `assertions.textContent(region, text)`는 region 안에 있는 텍스트를 부분적으로 검사할 수 있어, `<CardTitle>`/`<CardDescription>` 구조를 몰라도 "이 정보가 화면에 있다"만 확인하면 됩니다.

## 다음 단계

- [task-table](/examples/task-table) — `aria-current="page"`로 페이지 표시
- [assertions API](/configuration/assertions) — current · textContent
- [locator](/concepts/locator) — region · listitem
