# SignUpForm

A sign-up form with email, password, and checkboxes. Demonstrates validation errors (`errormessage`), fill/click flows, and region-level accessibility snapshots.

Source: `apps/react-example/test/stories/SignUpForm.tsx`, `SignUpForm.test.tsx`.

## UI

- Text fields: `label` as accessible name (`Email`, `Password` in EN UI; Korean labels in the example app)
- Checkboxes: linked labels (`약관 동의`, `개인정보 수집 동의`)
- Submit: `button` `"가입하기"`

Snapshots wrap the form in `<section aria-label="signup-form">` and target `query.region("signup-form")`.

## Test: validate then sign up

Submit empty → error assertions → fill → submit:

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

`errormessage` mirrors `toHaveAccessibleErrorMessage` as an assertion step.

## Snapshot: initial

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

## Snapshot: errors

After submit, invalid fields and `alert` nodes appear in the tree:

```text
region: "signup-form"
  textbox: "이메일 *" [invalid=true] [description="올바른 이메일 형식이 아닙니다"]
  alert
    "올바른 이메일 형식이 아닙니다"
  ...
```

## Accessibility notes

- **Labels**: `query.textbox(/이메일/)` matches accessible names that include `*`. Use RegExp when labels vary.
- **Error wiring**: Invalid fields show `[invalid=true]`, `description`, and `alert` children in snapshots — easy to miss visually alone.
- **Region**: Wrapping the form in an `aria-label` region scopes snapshots clearly.

## Next steps

- [assertions API](/en/configuration/assertions) — `errormessage`, `a11ySnapshot`
- [Counter](/en/examples/counter) — Simpler example
- [AI agents](/en/ai-agent) — How agents read snapshots
