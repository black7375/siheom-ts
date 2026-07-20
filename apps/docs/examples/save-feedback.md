# Save Feedback — Sonner Toast

버튼을 누르면 [sonner](https://sonner.emilkowal.ski/) 토스트로 저장 결과를 알리는, siheom에서 가장 짧은 예제 중 하나입니다. 토스트 라이브러리가 만드는 accessible name을 있는 그대로 검증합니다.

소스: `apps/react-example/test/stories/shadcn/save-feedback/SaveFeedback.tsx`, `SaveFeedback.test.tsx`.

## UI

- 저장 버튼: role `button`, name `"저장"`
- 토스트 영역: role `region`, name `"Notifications alt+T"`

## 시험: 저장하면 토스트가 보인다

```tsx
await runSiheom(
  given.render(<SaveFeedback />),
  actions.click(query.button("저장")),
  assertions.textContent(query.region("Notifications alt+T"), "저장됨"),
);
```

## 접근성 포인트

- `"Notifications alt+T"`는 직접 짠 문자열이 아니라 `sonner`의 `Toaster`가 내부적으로 붙이는 `aria-label`입니다. 라이브러리가 만드는 accessible name을 그대로 시험에 옮겨 적었다는 점을 소스에서 확인해 두면, 나중에 sonner 버전이 바뀌어 label이 달라졌을 때 시험이 왜 깨졌는지 바로 알 수 있습니다.
- 토스트는 마운트되자마자 화면에 나타나는 것이 아니라 클릭 이후 등장하므로, 렌더 직후 이 region을 찾으면 실패합니다. 토스트/알림처럼 비동기로 나타나는 UI는 액션 다음에 assertion을 두는 순서가 중요합니다.

## 다음 단계

- [billing-alert](/examples/billing-alert) — Alert를 닫는 예제
- [assertions API](/configuration/assertions) — textContent
- [locator](/concepts/locator) — region
