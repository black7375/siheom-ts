# 접근성 스냅샷

접근성 스냅샷은 DOM HTML이 아니라 **시맨틱 접근성 트리**를 텍스트로 직렬화한 것입니다. `assertions.a11ySnapshot`으로 파일과 비교합니다.

## 사용

```tsx
return runSiheom(
  given.render(<Counter />),
  assertions.a11ySnapshot(query.button("0"), "counter-initial.snap"),
);
```

스냅샷 파일은 `__snapshots__/`에 저장됩니다. vitest의 file snapshot matcher를 사용합니다.

## 스냅샷 예시

Counter 초기 상태:

```text
button: "0"
```

Counter를 두 번 클릭한 뒤:

```text
button: "2"
```

SignUpForm 에러 상태(발췌):

```text
region: "signup-form"
  textbox: "이메일 *" [invalid=true] [description="올바른 이메일 형식이 아닙니다"]
  alert
    "올바른 이메일 형식이 아닙니다"
  ...
```

`[invalid=true]`, `[checked=false]` 같은 상태는 ARIA computed state에서 옵니다. 시각적 픽셀이 아니라 **접근성 관점의 UI 의미**를 고정합니다.

## HTML·스크린샷과의 차이

- HTML 덤프: 태그·클래스 노이즈가 많아 diff가 불안정합니다.
- 스크린샷: 픽셀 회귀에 가깝고 토큰 비용이 큽니다.
- 접근성 스냅샷: role·name·state 중심으로 사람과 AI 모두 읽기 쉽습니다.

실패 리포트의 `[A11y Snapshot]` 섹션에도 같은 형식이 붙습니다.

## 다음 단계

- [assertions API](/configuration/assertions) — `a11ySnapshot`, `tableSnapshot`
- [예제: Counter](/examples/counter) — 스냅샷 시험
- [예제: SignUpForm](/examples/signup-form) — 폼 에러 상태 스냅샷
