# SignUpForm

A sign-up form with email, password, and checkboxes. Demonstrates validation errors (`errormessage`), fill/click flows, and form-level accessibility snapshots.

Source: [`apps/react-example/test/stories/SignUpForm.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/SignUpForm.tsx), [`SignUpForm.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/SignUpForm.test.tsx).

## UI accessibility

Initial snapshot scoped to `query.form("회원가입")`.

<<< @/_snaps/signup-form-initial.snap{text}

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
  given.render(<SignUpForm signUpMember={noop} />),
  assertions.a11ySnapshot(query.form("회원가입"), "signup-form-initial.snap"),
);
```

## Snapshot: errors

After submit, invalid fields and `alert` nodes appear in the tree:

```tsx
return runSiheom(
  given.render(<SignUpForm signUpMember={noop} />),
  actions.click(query.button("가입하기")),
  assertions.a11ySnapshot(query.form("회원가입"), "signup-form-with-errors.snap"),
);
```

<<< @/_snaps/signup-form-with-errors.snap{text}

## Accessibility notes

- **Labels**: `query.textbox(/이메일/)` matches accessible names that include `*`. Use RegExp when labels vary.
- **Error wiring**: Invalid fields show `[invalid=true]` and `alert` children in snapshots.
- **form**: A named `form` (`aria-labelledby`) makes a clear snapshot root.

## Next steps

- [assertions API](/en/configuration/assertions) — `errormessage`, `a11ySnapshot`
- [Counter](/en/examples/counter) — Simpler example
- [AI agents](/en/ai-agent) — How agents read snapshots
