# Counter

숫자가 적힌 버튼 하나를 클릭할 때마다 값이 1씩 올라가는 Counter입니다. 가장 작은 siheom 시험으로 click·visible·a11ySnapshot을 익힐 수 있습니다.

소스: `apps/react-example/test/stories/Counter.tsx`, `Counter.test.tsx`.

## UI

버튼의 **텍스트**가 accessible name이 됩니다. 초기 `"0"`, 한 번 클릭 후 `"1"`, 두 번 클릭 후 `"2"`.

```tsx
// Counter.tsx — 버튼 children이 name "0", "1", …
<Button onClick={() => setState((old) => old + 1)}>{state}</Button>
```

## 시험: 값 증가

```tsx
return runSiheom(
  given.render(<Counter />),
  actions.click(query.button("0")),
  actions.click(query.button("1")),
  assertions.visible(query.button("2")),
);
```

`query.button("0")`은 role `button`, name `"0"`입니다. CSS 클래스나 `data-testid`는 쓰지 않습니다.

## 시험: 접근성 스냅샷

```tsx
return runSiheom(
  given.render(<Counter />),
  assertions.a11ySnapshot(query.button("0"), "counter-initial.snap"),
);
```

초기 스냅샷:

```text
button: "0"
```

클릭 두 번 후:

```text
button: "2"
```

## 접근성 포인트

- 버튼에 시각적으로 보이는 숫자만으로 accessible name이 충분합니다.
- 아이콘-only 버튼이라면 `aria-label`이 필요합니다—Counter는 해당 없음.

## 다음 단계

- [SignUpForm](/examples/signup-form) — 폼 검증과 errormessage
- [locator](/concepts/locator) — role + name
- [접근성 스냅샷](/concepts/a11y-snapshot)
