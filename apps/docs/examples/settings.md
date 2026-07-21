# Settings — Tabs + Switch + Radio Group

탭으로 일반/알림 설정을 나누고, `Switch`로 다크 모드를 토글하고, `RadioGroup`으로 알림 빈도를 고르는 설정 패널입니다. 탭을 전환하면 다른 탭의 컨트롤은 완전히 숨겨진다는 것을 `assertions.not.visible`로 확인합니다.

소스: [`apps/react-example/test/stories/shadcn/settings/SettingsPanel.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/settings/SettingsPanel.tsx), [`SettingsPanel.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/settings/SettingsPanel.test.tsx).

## UI 접근성

시험이 고정한 초기 접근성 스냅샷입니다.

<<< @/_snaps/settings-initial.snap{text}

## 시험: 탭에 따라 보이는 컨트롤이 다르다

```tsx
await runSiheom(
  given.render(<SettingsPanel />),
  assertions.selected(query.tab("일반")),
  assertions.visible(query.switch("다크 모드")),
  assertions.not.visible(query.radiogroup("알림 빈도")),
);
```

알림 탭을 클릭하면 반대로 바뀝니다.

```tsx
await runSiheom(
  given.render(<SettingsPanel />),
  actions.click(query.tab("알림")),
  assertions.selected(query.tab("알림")),
  assertions.visible(query.radiogroup("알림 빈도")),
  assertions.not.visible(query.switch("다크 모드")),
);
```

## 시험: 토글과 라디오 선택

```tsx
await runSiheom(
  given.render(<SettingsPanel />),
  actions.click(query.switch("다크 모드")),
  assertions.checked(query.switch("다크 모드")),
);
```

```tsx
await runSiheom(
  given.render(<SettingsPanel />),
  actions.click(query.tab("알림")),
  actions.click(query.radio("즉시")),
  assertions.checked(query.radio("즉시")),
  assertions.not.checked(query.radio("일일 요약")),
);
```

## 접근성 포인트

- 각 `TabsContent`는 `aria-labelledby`로 패널 제목(`settings-title`)을 가리켜, 탭이 바뀌어도 스크린 리더가 지금 어떤 설정을 보는지 알 수 있습니다.
- 비활성 탭의 컨텐츠는 DOM에서 완전히 감춰집니다. `assertions.not.visible`로 이를 고정해 두면, 탭을 클릭하지 않고는 다른 탭의 컨트롤을 조작할 수 없다는 것이 회귀 없이 유지됩니다.
- `RadioGroup`은 `aria-label`로 그룹 이름을 얻고, 각 `radio`는 `Label`의 `htmlFor` 연결로 개별 이름을 얻습니다.

## 다음 단계

- [document-actions](/examples/document-actions) — Dropdown Menu와 Context Menu
- [actions API](/configuration/actions) — click
- [assertions API](/configuration/assertions) — selected · checked · visible
