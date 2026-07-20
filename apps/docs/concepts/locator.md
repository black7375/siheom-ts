# locator

locator는 ARIA **role**과 **accessible name**으로 요소를 가리킵니다. Playwright의 `getByRole`이나 Testing Library의 `screen.getByRole`과 같은 정보를 씁니다.

## query API

`query.<role>(name)` 형태입니다. `name`은 문자열 또는 정규식입니다.

```ts
query.button("가입하기");
query.textbox(/이메일/);
query.checkbox("약관 동의");
query.region("signup-form");
query.timer("남은 시간");
query.label("이메일");
```

`query`는 aria-query의 concrete role 전체와 `label`, `text` 커스텀 role을 지원합니다. 카운트다운처럼 `role="timer"` UI는 `query.timer("…")`로 가리킵니다. CSS 선택자, test id, xpath는 쓰지 않습니다.

`query.label("…")`는 **`<label>` 요소가 아니라 label이 연결한 control**을 가리킵니다. 헤드리스 Select는 trigger role이 `combobox`인 경우가 있어 `query.combobox("…")`가 맞을 수 있습니다 — [헤드리스 UI 가이드](/guides/headless-components)를 참고하세요.

## 엄격함

accessible name이 없으면 시험을 작성할 수 없습니다. 이는 의도된 제약입니다—UI에 이름(레이블, aria-label 등)을 붙이도록 유도합니다.

```tsx
// 버튼 텍스트 "0"이 accessible name이 됩니다
actions.click(query.button("0"))
```

## 다음 단계

- [action](/concepts/actions) — locator를 target으로 쓰는 방법
- [assertion](/concepts/assertions) — locator로 기대 상태 확인
- [헤드리스 UI 가이드](/guides/headless-components) — Select·Dialog·라이브러리별 query
- [비교](/comparisons) — Playwright·Testing Library와 locator 관계
