# Order Tracking — Timeline (Card composition)

Shipping steps rendered as a timeline. The current step is marked with `aria-current="step"`, and the test confirms the other steps are not marked current at the same time.

Source: [`apps/react-example/test/stories/shadcn/order-tracking/OrderTracking.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/order-tracking/OrderTracking.tsx), [`OrderTracking.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/order-tracking/OrderTracking.test.tsx).

## UI accessibility

Initial accessibility snapshot fixed by the test.

<<< @/_snaps/order-tracking-initial.snap{text}

## Test: which step is current

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

## Accessibility notes

- The timeline is just a list of `<Card>`s, but progress itself is expressed through the standard `aria-current="step"` attribute. The active card is visually highlighted with `border-primary`, but the test checks semantics, not styling.
- Applying `assertions.not.current` to the other two steps as well pins the invariant "exactly one step is current." Checking only one assertion could miss a bug where multiple steps end up marked current simultaneously.
- `assertions.textContent(region, text)` does a partial text match inside the region, so the test doesn't need to know the `<CardTitle>`/`<CardDescription>` structure — just that the information is somewhere on screen.

## Next steps

- [task-table](/en/examples/task-table) — Marking pages with `aria-current="page"`
- [assertions API](/en/configuration/assertions) — current · textContent
- [locator](/en/concepts/locator) — region · listitem
