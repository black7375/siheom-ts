# Command Menu — Command Palette (⌘K)

버튼으로 여는 command palette입니다. 다이얼로그 안 콤보박스에 검색어를 입력해 옵션을 필터링하고, 선택하면 다이얼로그가 닫히면서 결과가 표시됩니다.

소스: `apps/react-example/test/stories/shadcn/command-menu/CommandMenuApp.tsx`, `CommandMenuApp.test.tsx`.

## UI

- 트리거: role `button`, name `"빠른 실행"`
- 다이얼로그: role `dialog`, name `"빠른 실행"`
- 검색: role `combobox`, name `"명령 검색"`
- 옵션: role `option` (`"새 문서"`, `"설정 열기"`)
- 결과: role `status`, name `"실행 결과"`

## 시험: 검색하고 명령 선택

```tsx
await runSiheom(
  given.render(<CommandMenuApp />),
  actions.click(query.button("빠른 실행")),
  assertions.visible(query.dialog("빠른 실행")),
  actions.fill(query.within(query.dialog("빠른 실행"), query.combobox("명령 검색")), "새"),
  actions.click(query.within(query.dialog("빠른 실행"), query.option("새 문서"))),
  assertions.not.visible(query.dialog("빠른 실행")),
  assertions.textContent(query.status("실행 결과"), "새 문서 실행됨"),
);
```

검색 입력과 옵션 모두 `query.within(dialog, ...)`으로 감쌌습니다. 페이지에 다이얼로그가 하나뿐이라도, 열려 있는 다이얼로그 안으로 스코프를 좁히는 습관은 컴포넌트가 재사용되거나 여러 개 열리는 상황에서도 시험이 깨지지 않게 해 줍니다.

## 접근성 포인트

- Command palette는 `CommandDialog`의 `title`/`description`으로 다이얼로그 accessible name과 설명을 얻습니다. 시각적으로 숨겨진 이 설명은 스크린 리더 사용자에게 팔레트의 목적을 알려줍니다.
- 이 예제는 `apps/react-example/test/stories/shadcn/runSiheom.tsx`가 추가한 `actions.contextClick`을 다른 예제([document-actions](/examples/document-actions))와 공유합니다. `runSiheom`을 프로젝트 전역에서 한 번만 확장해 두면, 여러 예제/컴포넌트가 같은 커스텀 액션을 재사용할 수 있습니다.

## 다음 단계

- [document-actions](/examples/document-actions) — 같은 `runSiheom.tsx`, Dropdown/Context Menu
- [locator](/concepts/locator) — `query.within`으로 범위 좁히기
- [actions API](/configuration/actions) — fill · click
