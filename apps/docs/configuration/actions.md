# actions API

모든 action은 `(target: Locator, ...args)` 형태의 스텝 객체를 반환합니다. `target`은 [locator](/concepts/locator)입니다.

## 목록

| API | 인자 | 설명 |
| --- | --- | --- |
| `actions.click(target)` | — | `userEvent.click` |
| `actions.dblclick(target)` | — | `userEvent.dblClick` |
| `actions.fill(target, text)` | `text: string` | clear 후 입력 |
| `actions.type(target, text)` | `text: string` | clear 없이 입력 |
| `actions.tab(target)` | — | 포커스 확인 후 Tab |
| `actions.upload(target, file)` | `file: File` | 파일 업로드 |

## 예시

```tsx
actions.click(query.button("가입하기"))
actions.fill(query.textbox(/비밀번호/), "secret123456")
actions.upload(query.button("파일 선택"), file)
```

## 커스텀 action

```ts
extendSiheom(base, {
  actions: {
    selectAccount: async (target, account: string) => {
      // 구현
    },
  },
});
```

새 키는 `extendSiheom`, 기존 키 교체는 `overrideSiheom`입니다. [Factory](/concepts/factory)를 참고하세요.

## 다음 단계

- [action 개념](/concepts/actions)
- [assertions API](/configuration/assertions)
