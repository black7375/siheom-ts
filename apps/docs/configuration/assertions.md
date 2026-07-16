# assertions API

assertion은 `(target: Locator, ...args)` 형태의 스텝 객체를 반환합니다. `assertions.not.*`는 같은 assertion의 부정입니다.

## 상태 assertion

| API | 설명 |
| --- | --- |
| `assertions.visible(target)` | 보임 |
| `assertions.checked(target)` | 체크됨 |
| `assertions.expanded(target)` | `aria-expanded=true` |
| `assertions.selected(target)` | `aria-selected=true` |
| `assertions.disabled(target)` | 비활성 |
| `assertions.current(target, value)` | `aria-current` |
| `assertions.count(target, n)` | 매칭 개수 |
| `assertions.value(target, string)` | 폼 value |
| `assertions.description(target, string)` | accessible description |
| `assertions.errormessage(target, string)` | accessible error message |

부정: `assertions.not.visible`, `not.checked`, `not.expanded`, `not.selected`, `not.disabled`, `not.current`, `not.count`, `not.value`, `not.errormessage`.

## 스냅샷 assertion

| API | 설명 |
| --- | --- |
| `assertions.a11ySnapshot(target, path)` | 접근성 트리 → `__snapshots__/${path}` |
| `assertions.tableSnapshot(target, path)` | `<table>` → 마크다운 → `__snapshots__/${path}` |

`tableSnapshot`은 target이 `HTMLTableElement`여야 합니다.

## 예시

```tsx
assertions.visible(query.button("2"))
assertions.errormessage(query.textbox(/이메일/), "올바른 이메일 형식이 아닙니다")
assertions.a11ySnapshot(query.region("signup-form"), "signup-form-initial.snap")
assertions.not.visible(query.button("삭제"))
```

## 커스텀 assertion

```ts
extendSiheom(base, {
  assertions: {
    hasToast: async (target, message: string) => { /* ... */ },
  },
});
```

## 다음 단계

- [assertion 개념](/concepts/assertions)
- [접근성 스냅샷](/concepts/a11y-snapshot)
- [메시지 맵](/configuration/messages)
