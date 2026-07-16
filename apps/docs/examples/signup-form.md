# SignUpForm

이메일·비밀번호·체크박스가 있는 가입 폼입니다. 검증 에러(`errormessage`), fill/click 흐름, region 단위 접근성 스냅샷을 보여줍니다.

소스: `apps/react-example/test/stories/SignUpForm.tsx`, `SignUpForm.test.tsx`.

## UI

- 텍스트 필드: `label`이 accessible name (`이메일`, `비밀번호`)
- 체크박스: `label` 연결 (`약관 동의`, `개인정보 수집 동의`)
- 제출: `button` `"가입하기"`

스냅샷은 `region` `"signup-form"`으로 감싼 `<section aria-label="signup-form">` 기준입니다.

## 시험: 검증 후 가입

빈 폼 제출 → 에러 assertion → 값 입력 → 가입:

```tsx
await runSiheom(
  given.render(<SignUpForm signUpMember={handler} />),
  actions.click(query.button("가입하기")),
  assertions.errormessage(query.textbox(/이메일/), "올바른 이메일 형식이 아닙니다"),
  assertions.errormessage(query.textbox(/비밀번호/), "비밀번호를 10자 이상 입력해주세요"),
  assertions.errormessage(query.checkbox("약관 동의"), "약관 동의에 동의해야 합니다"),
  actions.fill(query.textbox(/이메일/), "test@test.com"),
  actions.fill(query.textbox(/비밀번호/), "test123456"),
  actions.click(query.checkbox("약관 동의")),
  actions.click(query.checkbox("개인정보 수집 동의")),
  actions.click(query.button("가입하기")),
);
```

`errormessage`는 `toHaveAccessibleErrorMessage`와 동일한 정보를 assertion 스텝으로 씁니다.

## 접근성 스냅샷: 초기 상태

```tsx
return runSiheom(
  given.render(
    <section aria-label="signup-form">
      <SignUpForm signUpMember={noop} />
    </section>,
  ),
  assertions.a11ySnapshot(query.region("signup-form"), "signup-form-initial.snap"),
);
```

```text
region: "signup-form"
  textbox: "이메일 *" [value=""]
  checkbox: "약관 동의" [checked=false] [value="on"]
  ...
  button: "가입하기"
```

## 접근성 스냅샷: 에러 상태

제출 후 invalid·alert 노드가 스냅샷에 나타납니다.

```text
region: "signup-form"
  textbox: "이메일 *" [invalid=true] [description="올바른 이메일 형식이 아닙니다"]
  alert
    "올바른 이메일 형식이 아닙니다"
  ...
```

## 접근성 포인트

- **레이블**: `query.textbox(/이메일/)`은 accessible name에 `*`가 포함될 수 있습니다. 정규식으로 유연하게 매칭합니다.
- **에러 연결**: invalid 필드는 `[invalid=true]`와 `description`, `alert` 자식으로 스냅샷에 드러납니다. 시각만으로는 놓치기 쉬운 상태를 assertion으로 고정할 수 있습니다.
- **region**: 폼 전체를 `aria-label` region으로 묶으면 스냅샷 범위를 명확히 할 수 있습니다.

## 다음 단계

- [assertions API](/configuration/assertions) — `errormessage`, `a11ySnapshot`
- [Counter](/examples/counter) — 더 단순한 예제
- [AI 에이전트](/ai-agent) — 스냅샷을 agent가 읽는 방법
