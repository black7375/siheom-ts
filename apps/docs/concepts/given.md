# given

given 스텝은 시험의 **전제 조건**입니다. React에서는 `given.render`로 컴포넌트를 실제 브라우저에 마운트합니다.

## 런타임 계약

siheom core는 UI를 어떻게 그리는지 모릅니다. 프레임워크 패키지가 `given.render`를 제공하는 것이 유일한 약속입니다.

```ts
export const defaultGivens = {
  render: async (element: ReactElement) => {
    render(element);
  },
};
```

시험에서:

```tsx
given.render(<Counter />)
```

## Provider / Wrapper

Router, QueryClient, Theme 등은 별도 siheom API가 아닙니다. `extendSiheom`으로 `given.render`를 확장합니다.

```ts
const { runSiheom, given } = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: {
      render: async (ui) => {
        render(<Providers>{ui}</Providers>);
      },
    },
  },
  {},
);
```

바인딩을 테스트 헬퍼 모듈로 export해 suite 전체에서 재사용합니다.

## 다음 단계

- [given API](/configuration/given) — 시그니처
- [Factory](/concepts/factory) — given 확장
- [React 빠른 시작](/getting-started/react) — Provider 예시
