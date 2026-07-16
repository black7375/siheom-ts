# given API

## `@siheom/react`

| API | 설명 |
| --- | --- |
| `given.render(element)` | React 컴포넌트를 실제 브라우저에 마운트 |

```tsx
given.render(<Counter />)
given.render(<SignUpForm signUpMember={handler} />)
```

`element`는 `ReactElement`입니다. Provider가 필요하면 [given](/concepts/given)의 `extendSiheom` 패턴을 씁니다.

## `@siheom/core`

`defaultGivens.render`는 `@siheom/react`가 사용하는 구현입니다. 커스텀 given은 factory 레지스트리에 추가합니다.

## 다음 단계

- [given 개념](/concepts/given)
- [actions API](/configuration/actions)
