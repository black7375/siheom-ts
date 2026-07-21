# Billing Alert — Alert

결제 실패를 알리는 Alert를 확인 버튼으로 닫는, 가장 단순한 형태의 알림 예제입니다. `role="alert"`가 사라지는 것으로 "닫힘"을 검증합니다.

소스: [`apps/react-example/test/stories/shadcn/billing-alert/BillingAlert.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/billing-alert/BillingAlert.tsx), [`BillingAlert.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/billing-alert/BillingAlert.test.tsx).

## UI 접근성

시험이 고정한 초기 접근성 스냅샷입니다.

<<< @/_snaps/billing-alert-initial.snap{text}

## 시험: 알림을 확인하고 닫기

```tsx
await runSiheom(
  given.render(<BillingAlert />),
  assertions.visible(query.alert("결제 실패")),
  actions.click(query.button("확인")),
  assertions.not.visible(query.alert("결제 실패")),
);
```

## 접근성 포인트

- `role="alert"`는 스크린 리더가 콘텐츠 변화 즉시(포커스 이동 없이) 읽어 주는 live region입니다. `variant="destructive"`라는 시각적 스타일과 무관하게, 시험은 `alert` role 하나만으로 "이건 사용자에게 즉시 알려야 하는 정보"라는 의도를 확인합니다.
- 닫기 버튼(`"확인"`)을 누르면 컴포넌트가 `null`을 렌더링합니다. `assertions.not.visible`은 엘리먼트가 DOM에 아예 없는 경우와 `display:none`인 경우를 모두 "안 보임"으로 처리하므로, 구현이 조건부 렌더링이든 CSS 토글이든 같은 assertion을 쓸 수 있습니다.

## 다음 단계

- [mobile-filter](/examples/mobile-filter) — Sheet
- [assertions API](/configuration/assertions) — visible · not.visible
- [locator](/concepts/locator) — alert
