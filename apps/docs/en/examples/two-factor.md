# Two Factor — Input OTP

A form that fills in a 6-digit verification code and confirms it. Even though Input OTP visually splits into slots, it's a single `textbox` in the accessibility tree.

Source: [`apps/react-example/test/stories/shadcn/two-factor/TwoFactorForm.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/two-factor/TwoFactorForm.tsx), [`TwoFactorForm.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/two-factor/TwoFactorForm.test.tsx).

## UI accessibility

Initial accessibility snapshot fixed by the test.

<<< @/_snaps/two-factor-initial.snap{text}

## Test: fill in the code and confirm

```tsx
await runSiheom(
  given.render(<TwoFactorForm />),
  actions.fill(query.textbox("인증 코드"), "123456"),
  actions.click(query.button("확인")),
  assertions.textContent(query.status("인증 결과"), "인증되었습니다"),
);
```

`InputOTP` looks like six separate boxes, but a single input element actually manages the value. `actions.fill` fills the whole string (`"123456"`) at once — there's no need to fill each slot individually.

## Accessibility notes

- However many boxes a component splits into visually, if there's really just one input carrying `aria-label="인증 코드"`, the test can treat it as an ordinary `textbox`. The test code never needs to know about the visual slot structure.
- This example doesn't cover an incorrect code — `onSubmit` only updates state when `code === "123456"`. Testing the failure path would need an extra assertion like `assertions.not.visible(query.status("인증 결과"))`.

## Next steps

- [app-shell](/en/examples/app-shell) — Sidebar + Breadcrumb
- [actions API](/en/configuration/actions) — fill
- [assertions API](/en/configuration/assertions) — textContent
