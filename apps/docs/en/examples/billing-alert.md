# Billing Alert — Alert

The simplest possible alert example: a payment-failure Alert dismissed by a confirm button. The test verifies "dismissed" by checking the `role="alert"` element disappears.

Source: [`apps/react-example/test/stories/shadcn/billing-alert/BillingAlert.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/billing-alert/BillingAlert.tsx), [`BillingAlert.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/billing-alert/BillingAlert.test.tsx).

## UI

- Alert: role `alert`, name `"결제 실패"`
- Dismiss: role `button`, name `"확인"`

## Test: acknowledge and dismiss

```tsx
await runSiheom(
  given.render(<BillingAlert />),
  assertions.visible(query.alert("결제 실패")),
  actions.click(query.button("확인")),
  assertions.not.visible(query.alert("결제 실패")),
);
```

## Accessibility notes

- `role="alert"` is a live region that a screen reader announces immediately, without a focus change. Regardless of the `variant="destructive"` visual styling, the test confirms the intent — "this must be announced to the user right away" — through the `alert` role alone.
- Clicking dismiss (`"확인"`) makes the component render `null`. `assertions.not.visible` treats "not in the DOM at all" and "`display: none`" the same way, so the same assertion works whether the implementation is conditional rendering or a CSS toggle.

## Next steps

- [mobile-filter](/en/examples/mobile-filter) — Sheet
- [assertions API](/en/configuration/assertions) — visible · not.visible
- [locator](/en/concepts/locator) — alert
