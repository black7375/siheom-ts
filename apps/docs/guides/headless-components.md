# 헤드리스 UI 컴포넌트 가이드

Siheom 시험은 **접근성 role과 accessible name**으로 UI를 가리킵니다. Radix UI, React Aria, Ariakit, Ark UI 같은 헤드리스 라이브러리는 DOM 구조와 role이 라이브러리마다 다릅니다. 같은 “Select를 클릭한다” 시나리오라도 **a11y snapshot에 맞는 query**가 달라질 수 있습니다.

이 가이드는 `apps/react-example/test/stories/headless/`에서 검증한 패턴을 정리합니다. 컴포넌트를 고치기 전에 snapshot을 보고, 키보드 시퀀스(`{ArrowDown}{Enter}`) 같은 우회로 테스트를 통과시키지 마세요.

## 원칙

1. **실패하면 snapshot을 먼저 본다** — `[A11y Snapshot]` 또는 `assertions.a11ySnapshot`으로 role·name·state를 확인합니다.
2. **query는 snapshot의 role에 맞춘다** — label 텍스트가 같아도 trigger role이 `combobox`면 `query.combobox`를 씁니다.
3. **컴포넌트를 고친다, 테스트를 속이지 않는다** — placeholder·floating label·portal·focus trap이 name/query를 깨면 마크업·a11y wiring을 수정합니다.
4. **키보드 우회 금지** — `{ArrowDown}{Enter}`, `disableEnforceFocus`, `noValidate` 등으로 Siheom click/fill을 우회하지 않습니다.
5. **dialog 안에서는 `query.within`** — 이름이 겹칠 때 dialog region으로 스코프합니다.

## 공통 패턴

### Dialog + Form

```tsx
actions.click(query.button("구독하기")),
assertions.visible(query.dialog("구독하기")),
actions.fill(query.within(query.dialog("구독하기"), query.textbox("이름")), "홍길동"),
```

- Dialog 제목(`DialogTitle`, `Heading slot="title"`)이 accessible name이 되면 `query.dialog("제목")`으로 잡힙니다.
- 폼 필드는 dialog 안에서 `query.within`으로 스코프합니다.

### Select (헤드리스)

많은 헤드리스 Select는 **native `<select>`가 아닙니다**. Form submit을 위해 다음 중 하나가 필요합니다.

| 방법 | 예 |
| ---- | -- |
| 라이브러리 내장 | Ark UI `Select.HiddenSelect`, React Aria `name` on `Select` |
| hidden input + controlled state | Radix, Ariakit wrapper |

시험 흐름:

```tsx
// 1) trigger 열기 — role에 맞는 query (아래 표 참고)
actions.click(query.within(dialog, query.label("구독할 항목"))),
// 또는 query.combobox("구독할 항목")

// 2) option 선택
actions.click(query.option("프리미엄")),
```

`query.label("…")`는 **`<label>` 요소가 아니라 label이 가리키는 control**을 반환합니다. Select trigger가 button/combobox이면 라이브러리 wiring에 따라 `query.label` 또는 `query.combobox`가 맞습니다.

### Checkbox

- `query.checkbox("약관에 동의합니다")` — label 텍스트 또는 `aria-label`이 accessible name이어야 합니다.
- custom render(`render={<button />}`)를 써도 role이 checkbox로 노출되면 Siheom query는 동일합니다.
- form value가 필요하면 라이브러리 `HiddenInput` / hidden field / React Aria `name` prop을 사용합니다.

## 라이브러리별 Select query

| 라이브러리 | Select 열기 query | 이유 |
| ---------- | ----------------- | ---- |
| React Aria | `query.label("구독할 항목")` | `Label` + Select wiring, label–control 연결 |
| Radix UI | `query.label("구독할 항목")` | `Label` `htmlFor` + `Select.Trigger` `id` |
| Ariakit | `query.label("구독할 항목")` | native `<label htmlFor>` (아래 주의 참고) |
| Ark UI | `query.combobox("구독할 항목")` | trigger role이 `combobox` |
| MUI | ⚠️ 비권장 | floating label, dialog+menu portal 충돌 (아래) |

**같은 시나리오 테스트를 억지로 통일하지 마세요.** role 차이는 a11y 차이의 신호입니다.

## 라이브러리별 구현 주의

### React Aria Components

| 항목 | 권장 | 피할 것 |
| ---- | ---- | ------- |
| Select placeholder | `Select`에 `placeholder=""` | `SelectValue`에만 placeholder (API/타입·name 오염) |
| Checkbox | `CheckboxField` + `CheckboxButton` (v1.19+) | deprecated `Checkbox` |
| Form | `Form` + field `name` | 불필요한 hidden input |
| Select 열기 | `query.label` | trigger만 `query.button` (label 연결이 더 안정적) |

### Radix UI

| 항목 | 권장 | 피할 것 |
| ---- | ---- | ------- |
| Select + form | hidden input + controlled `value` | Select value만 React state에 두고 form submit 기대 |
| Label | `@radix-ui/react-label` + trigger `id` | label 없이 placeholder만 |
| Checkbox | `Checkbox.Root`에 `name` | label과 control 연결 누락 |

### Ariakit

| 항목 | 권장 | 피할 것 |
| ---- | ---- | ------- |
| Select label | native `<label htmlFor={id}>` | `SelectLabel` — combobox와 **이름 중복**으로 `query.label` ambiguous |
| Select + form | hidden input + store value | form field 없이 store만 |
| Checkbox (React 19) | `Checkbox render={<button type="button" />}` | 기본 native input render (browser test 충돌 보고됨) |
| Checkbox required | hidden input + validation wiring | 테스트만 `noValidate` |

### Ark UI

| 항목 | 권장 | 피할 것 |
| ---- | ---- | ------- |
| Select 열기 | `query.combobox("레이블")` | `query.label` (trigger는 combobox) |
| Collection | `createListCollection` | ad-hoc items without collection |
| Form | `Select.HiddenSelect`, `Checkbox.HiddenInput` | controlled state만으로 FormData 기대 |
| Placeholder | `Select.ValueText placeholder=""` | placeholder가 accessible name에 섞임 |

### Material UI (비권장)

Siheom + browser mode에서 다음 문제가 반복되었고, 우회가 누적되어 **headless 비교 대상에서 제외**했습니다.

| 문제 | 증상 |
| ---- | ---- |
| Floating label | `query.label("구독할 항목")` 불안정 |
| Select in Dialog | 메뉴 open 시 dialog `aria-hidden` → option이 a11y tree / `within` 밖 |
| Custom Select menu | `query.option` 미노출 (portal·focus trap) |
| NativeSelect | snapshot상 option 보여도 click 후 value 미반영 |
| Dialog backdrop | select 조작 중 dialog 닫힘 |

`disablePortal`, `disableEnforceFocus`, backdrop `onClose` 필터, `{ArrowDown}{Enter}` 등은 **테스트 통과용 hack**이며 Siheom 철학과 맞지 않습니다.

## 실패 시 체크리스트

1. `[A11y Snapshot]`에서 target의 **role**과 **name**을 읽는다.
2. `query.*` 문자열이 snapshot name과 **정확히** 일치하는지 확인한다 (placeholder·`*` 접미사 주의).
3. Select: trigger role이 `combobox`인지, label이 별도 role인지 본다.
4. Dialog + popover: option/listbox가 dialog **밖** portal에 있지 않은지, dialog가 `aria-hidden` 되지 않았는지 본다.
5. Form submit: hidden field / `name` prop으로 FormData에 값이 들어가는지 확인한다.
6. 그다음에만 컴ponent 마크업을 수정한다 — 테스트 query를 억지로 바꾸지 않는다.

## react-example 참고

| 라이브러리 | 스토리 | 컴포넌트 wrapper |
| ---------- | ------ | ---------------- |
| React Aria | `test/stories/headless/ReactAria.test.tsx` | `test/components/react-aria/` |
| Radix UI | `test/stories/headless/Radix.test.tsx` | `test/components/radix/` |
| Ariakit | `test/stories/headless/Ariakit.test.tsx` | `test/components/ariakit/` |
| Ark UI | `test/stories/headless/ArkUi.test.tsx` | `test/components/ark-ui/` |

공유 fixture: `test/stories/headless/subscribe.fixture.ts`

## 다음 단계

- [locator](/concepts/locator) — `query.label` vs role query
- [접근성 스냅샷](/concepts/a11y-snapshot) — snapshot 형식
- [예제: SignUpForm](/examples/signup-form) — 폼·에러 region 패턴
- [AI 에이전트](/ai-agent) — llms.txt · Skills
