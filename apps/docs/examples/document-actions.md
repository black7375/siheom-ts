# Document Actions — Dropdown Menu + Context Menu

문서 카드마다 더보기 버튼(Dropdown Menu)과 우클릭(Context Menu)으로 같은 동작(복사·이름 변경·삭제)에 접근할 수 있는 예제입니다. `query.within`으로 열려 있는 메뉴 안의 항목만 골라 클릭합니다.

소스: [`apps/react-example/test/stories/shadcn/document-actions/DocumentActions.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/document-actions/DocumentActions.tsx), [`DocumentActions.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/document-actions/DocumentActions.test.tsx).

## UI

- 문서: role `article`, name은 문서 제목(`"기획서"`)
- 더보기 버튼: role `button`, name `"기획서 더보기"`
- 메뉴: role `menu`, name은 dropdown이면 `"기획서 더보기"`, context menu면 `"문서 동작"`; 항목은 `menuitem` (`"복사"`, `"이름 변경"`, `"삭제"`)
- 결과: role `status`, name `"복사 결과"`

## 시험: 더보기 메뉴로 복사

```tsx
await runSiheom(
  given.render(<DocumentActions />),
  actions.click(query.button("기획서 더보기")),
  assertions.visible(query.menu("기획서 더보기")),
  actions.click(query.within(query.menu("기획서 더보기"), query.menuitem("복사"))),
  assertions.textContent(query.status("복사 결과"), "기획서 복사됨"),
);
```

`query.within(menu, menuitem)`으로 열려 있는 메뉴 안의 "복사"만 지정합니다. Dropdown Menu와 Context Menu가 같은 텍스트의 항목을 갖고 있어서, 범위를 좁히지 않으면 어느 메뉴의 항목인지 모호해집니다.

## 시험: 우클릭 메뉴로 삭제

```tsx
await runSiheom(
  given.render(<DocumentActions />),
  actions.contextClick(query.article("기획서")),
  assertions.visible(query.menu("문서 동작")),
  actions.click(query.within(query.menu("문서 동작"), query.menuitem("삭제"))),
  assertions.not.visible(query.article("기획서")),
);
```

`actions.contextClick`은 이 예제 앱이 `extendSiheom`으로 추가한 커스텀 액션입니다. `@siheom/react`가 기본으로 제공하지 않는 동작이 필요하면, `apps/react-example/test/stories/shadcn/runSiheom.tsx`처럼 `createDefaultActions()`를 감싸서 프로젝트 전용 `runSiheom`/`actions`를 만들 수 있습니다.

```tsx
// runSiheom.tsx — 우클릭을 흉내 내는 액션 추가
export const { runSiheom, actions } = extendSiheom(
  { actions: createDefaultActions(), /* ... */ },
  {
    actions: {
      contextClick: (target) => userEvent.pointer([
        { keys: "[MouseRight>]", target: getElement(target, true) },
        { keys: "[/MouseRight]" },
      ]),
    },
  },
);
```

## 접근성 포인트

- Dropdown Menu와 Context Menu는 트리거가 다르지만(버튼 클릭 vs 우클릭) 같은 `menu`/`menuitem` role 규약을 따르므로, 시험 코드도 `actions.click`/`actions.contextClick`만 바뀌고 나머지는 동일합니다.
- 삭제 후 문서 `article`이 완전히 사라지는지 `assertions.not.visible`로 확인해, 삭제가 실제로 목록을 바꿨는지 시각적 확인 없이 검증합니다.

## 다음 단계

- [command-menu](/examples/command-menu) — Command palette도 같은 `runSiheom.tsx`를 씁니다
- [locator](/concepts/locator) — `query.within`으로 범위 좁히기
- [factory](/concepts/factory) — `extendSiheom`으로 커스텀 action 추가
