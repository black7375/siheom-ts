# 개념

시험은 `given` · `action` · `assert` · (선택) `effect` 스텝 객체의 배열입니다. 인터프리터가 실제 브라우저에서 순서대로 실행합니다.

## 스텝 종류

| 종류 | 예시 | 설명 |
| --- | --- | --- |
| **given** | `given.render(<App />)` | UI 마운트 등 전제 조건 |
| **action** | `actions.click(query.button("저장"))` | 사용자 행동 |
| **assert** | `assertions.visible(query.button("저장"))` | 기대 상태 |
| **effect** | `effect.elapsed(1_000)` | 시간 진행 등 환경 효과 (`withFakeTimers` 안) |

```tsx
return runSiheom(
  given.render(<Counter />),
  actions.click(query.button("0")),
  assertions.visible(query.button("1")),
);
```

시험 본문에 `await`를 쓰지 않습니다. `return runSiheom(...)`으로 인터프리터에 실행을 맡깁니다.

## 개념별 문서

- [given](/concepts/given) — UI 마운트와 Provider
- [action](/concepts/actions) — click, fill, type 등
- [assertion](/concepts/assertions) — visible, a11ySnapshot 등
- [effect · withFakeTimers](/concepts/effects) — fake timers와 시간 진행
- [locator](/concepts/locator) — `query`와 role + name
- [접근성 스냅샷](/concepts/a11y-snapshot) — 시맨틱 트리 assertion
- [Factory](/concepts/factory) — 커스텀 스텝 추가·교체

## 다음 단계

- [React 빠른 시작](/getting-started/react) — browser mode 설정
- [설정과 API](/configuration) — 전체 API 목록
