# Two Factor — Input OTP

6자리 인증 코드를 입력하고 확인하는 폼입니다. 여러 개의 슬롯으로 나뉘어 보이는 Input OTP도 접근성 트리에서는 하나의 `textbox`입니다.

소스: [`apps/react-example/test/stories/shadcn/two-factor/TwoFactorForm.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/two-factor/TwoFactorForm.tsx), [`TwoFactorForm.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/two-factor/TwoFactorForm.test.tsx).

## UI

- 인증 코드: role `textbox`, name `"인증 코드"` (6개의 `InputOTPSlot`으로 시각적으로 나뉘어 보임)
- 확인: role `button`, name `"확인"`
- 결과: role `status`, name `"인증 결과"`

## 시험: 코드를 입력하고 확인

```tsx
await runSiheom(
  given.render(<TwoFactorForm />),
  actions.fill(query.textbox("인증 코드"), "123456"),
  actions.click(query.button("확인")),
  assertions.textContent(query.status("인증 결과"), "인증되었습니다"),
);
```

`InputOTP`는 6개의 칸(`InputOTPSlot`)으로 나뉘어 보이지만, 실제로는 하나의 입력 엘리먼트가 값을 관리합니다. `actions.fill`로 전체 문자열(`"123456"`)을 한 번에 채우면 되고, 슬롯 하나하나를 따로 채울 필요가 없습니다.

## 접근성 포인트

- 시각적으로 여러 칸으로 나뉜 컴포넌트라도, `aria-label="인증 코드"`가 붙은 실제 입력이 하나라면 시험에서는 평범한 `textbox`로 다룰 수 있습니다. 시험 코드가 컴포넌트의 시각적 분할 구조를 알 필요가 없다는 점이 핵심입니다.
- 틀린 코드를 입력했을 때의 동작은 이 예제에 없습니다 — `onSubmit`이 `code === "123456"`일 때만 상태를 갱신하므로, 실패 케이스를 시험하려면 `assertions.not.visible(query.status("인증 결과"))` 같은 assertion을 추가로 작성해야 합니다.

## 다음 단계

- [app-shell](/examples/app-shell) — Sidebar + Breadcrumb
- [actions API](/configuration/actions) — fill
- [assertions API](/configuration/assertions) — textContent
