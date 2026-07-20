# action

action 스텝은 **사용자 행동**을 데이터로 표현합니다. `@siheom/react`의 `actions.*`가 스텝 객체를 만들고, 인터프리터가 실제 브라우저에서 실행합니다.

## 기본 액션

| API | 설명 |
| --- | --- |
| `actions.click(target)` | 클릭 |
| `actions.dblclick(target)` | 더블 클릭 |
| `actions.fill(target, text)` | 포커스 → clear → 입력 |
| `actions.type(target, text)` | 포커스 → 기존 내용 위에 입력 |
| `actions.tab(target)` | 포커스 확인 후 Tab |
| `actions.upload(target, file)` | 파일 업로드 |
| `actions.hover(target)` | 마우스 오버 |
| `actions.dragAndDrop(source, target)` | source를 target으로 드래그 |

```tsx
actions.click(query.button("가입하기"))
actions.fill(query.textbox(/이메일/), "test@test.com")
```

`target`은 [locator](/concepts/locator)입니다. 시험 본문에 `await`를 붙이지 않습니다.

## 커스텀 action

팀 전용 조작은 [Factory](/concepts/factory)의 `extendSiheom`으로 레지스트리에 추가합니다.

```ts
extendSiheom(base, {
  actions: {
    selectAccount: async (target, account) => { /* ... */ },
  },
});
```

## 다음 단계

- [actions API](/configuration/actions) — 전체 목록과 시그니처
- [assertion](/concepts/assertions) — 기대 상태 확인
- [예제: SignUpForm](/examples/signup-form) — fill / click 흐름
