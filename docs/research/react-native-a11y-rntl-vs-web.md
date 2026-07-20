# Research: React Native a11y / RNTL vs web RTL for `@siheom/react-native`

**Date:** 2026-07-20  
**Scope:** Design inputs for a React Native runtime package (`@siheom/react-native`), comparing RNTL accessibility querying to web RTL / current `@siheom/core` DOM assumptions. Also notes Tamagui/One mapping and Storybook usage.

---

## Repo scan

| Finding | Source |
|--------|--------|
| **No** mentions of `react-native`, RNTL, `@testing-library/react-native`, Tamagui, or One/onestack | repo-wide grep |
| Existing runtimes: `@siheom/react`, `vue`, `svelte`, `angular`, `qwik` (+ `vitest-browser-react`, `ime`) | `packages/*/package.json` |
| Core locator resolution is **DOM-only**: `@testing-library/dom` `getByRole` / `getByLabelText`, `HTMLElement` | `packages/core/src/query.ts` |
| Core a11y depends on `aria-query` + `dom-accessibility-api` | `packages/core/package.json`, `packages/core/src/a11y/*` |
| Runtime package pattern: pre-bound `runSiheom` + `given.render` + peers for that framework’s testing libs | `CONTEXT.md`, `packages/react/src/index.ts` |

---

## 1. Key a11y differences: RN vs web

### Roles (two systems on RN)

React Native exposes **two** role systems; `role` wins when both are set ([RN Accessibility](https://reactnative.dev/docs/accessibility#role)):

| Concern | Web (ARIA / HTML) | React Native |
|--------|-------------------|--------------|
| Role prop | Implicit from tags + `role` | Explicit `role` **or** legacy `accessibilityRole` |
| Precedence | HTML semantics + ARIA | `role` overrides `accessibilityRole` |
| RNTL query | `getByRole` on a11y tree | Matches **either** `role` or `accessibilityRole` ([How should I query?](https://oss.callstack.com/react-native-testing-library/docs/guides/how-to-query)) |

**Name aliases RNTL documents** (ARIA-ish ↔ legacy native):

| Prefer (ARIA / `role`) | Legacy (`accessibilityRole`) |
|------------------------|------------------------------|
| `heading` | `header` |
| `img` | `image` |
| `searchbox` | `search` |
| `slider` | `adjustable` |

**Roles that diverge from typical web ARIA usage:**

- Legacy-only style: `text`, `togglebutton`, `imagebutton`, `keyboardkey`, `summary` ([RN `accessibilityRole`](https://reactnative.dev/docs/accessibility#accessibilityrole)).
- `role` adds web-aligned names like `list`, `listitem`, `presentation`, `slider`, `searchbox`, `heading`, `img` ([RN `role`](https://reactnative.dev/docs/accessibility#role)).
- **No general textbox role** for `TextInput` — only optional `searchbox`/`search`. RNTL therefore recommends `*ByLabelText` / `*ByPlaceholderText` / `*ByDisplayValue` for inputs ([How should I query?](https://oss.callstack.com/react-native-testing-library/docs/guides/how-to-query)).

### What counts as an accessibility element (critical for `getByRole`)

Unlike web HTML (many elements are implicitly in the a11y tree), RNTL `*ByRole` only matches **accessibility elements** ([Queries `*ByRole`](https://oss.callstack.com/react-native-testing-library/docs/api/queries)):

1. `Text`, `TextInput`, `Switch` — accessible by default  
2. `View` — needs `accessible={true}` (or equivalent)  
3. Composites like `Pressable` / `TouchableOpacity` — host `View` already sets `accessible`

Design implication: Tamagui/`View` with `onPress` may still need `role` + accessible semantics for RNTL queries to find them.

### Labels

| Web | RN (both accepted by RNTL) |
|-----|----------------------------|
| `aria-label`, `aria-labelledby`, `<label for>` | `aria-label` / `accessibilityLabel` |
| | `aria-labelledby` / `accessibilityLabelledBy` (Android; `nativeID`) |
| Accessible name from content | Text children / label props; `Image` `alt` also matched by `*ByLabelText` |

RN-specific: `accessibilityHint` → RNTL `*ByHintText` (no first-class web RTL equivalent).

### States and values

RNTL state options accept **either** ARIA props **or** RN objects ([Queries](https://oss.callstack.com/react-native-testing-library/docs/api/queries)):

| State | ARIA prop | RN prop |
|-------|-----------|---------|
| disabled | `aria-disabled` | `accessibilityState.disabled` |
| selected | `aria-selected` | `accessibilityState.selected` |
| checked | `aria-checked` | `accessibilityState.checked` (`true` \| `false` \| `"mixed"`) |
| busy | `aria-busy` | `accessibilityState.busy` |
| expanded | `aria-expanded` | `accessibilityState.expanded` |
| value | `aria-valuemin/max/now/text` | `accessibilityValue` `{ min, max, now, text }` |

### Hidden / inaccessible

RNTL `isHiddenFromAccessibility` / `isInaccessible` ([Accessibility](https://oss.callstack.com/react-native-testing-library/docs/api/misc/accessibility)) treats an element as hidden if it or an ancestor has:

- `display: 'none'`
- `aria-hidden={true}`
- `accessibilityElementsHidden={true}` (iOS)
- `importantForAccessibility="no-hide-descendants"` (Android)
- sibling with `aria-modal` / `accessibilityViewIsModal`

**Not** enough to hide: `accessible={false}`, `role="none"`, `accessibilityRole="none"`, `importantForAccessibility="no"`.

This is a partial subset of the web ARIA accessibility tree rules (presentational vs hidden diverge).

### Interaction model (testing)

| Web RTL | RNTL |
|---------|------|
| `userEvent.click` / keyboard | `userEvent.press`, `userEvent.type`, … |
| DOM events | Simulated RN host events via Test Renderer |
| Browser / jsdom | No real VoiceOver/TalkBack; a11y from props + host defaults |

---

## 2. RNTL recommended runner / render API

Sources: [Intro](https://oss.callstack.com/react-native-testing-library/docs/start/intro), [Quick Start](https://oss.callstack.com/react-native-testing-library/docs/start/quick-start), Callstack v14 API notes.

| Topic | Recommendation |
|-------|----------------|
| Package | `@testing-library/react-native` |
| Peer renderer | `test-renderer` (preferred over deprecated `react-test-renderer` for React 19) |
| Test runner | **Jest** is what RNTL is tested with; docs say other runners *should* work. Matchers auto-extend Jest on import. Vitest is possible but not first-class (fake-timer / `jest` globals friction exists in the broader Testing Library ecosystem). |
| Render API | `import { render, screen, userEvent } from '@testing-library/react-native'` |
| v14 async | **`await render(...)`** (and await `fireEvent` / `rerender` / `unmount` / `act`) |
| Queries | Prefer `screen.getByRole(...)`; idiomatic order: Role → text-input queries → Text/Label/Hint → `testID` last |
| userEvent | `userEvent.setup()`; fake timers recommended when using userEvent |

Example shape from official intro:

```jsx
import { render, screen, userEvent } from '@testing-library/react-native';

await render(<QuestionsBoard ... />);
await user.press(screen.getByRole('button', { name: 'Submit' }));
```

---

## 3. Tamagui / One → RN roles & a11y props

| Source | Mapping |
|--------|---------|
| [Tamagui props](https://tamagui.dev/docs/intro/props) | First-class `role` and `tabIndex`; prefer `role` over web-only `tag` for semantics. Press handlers live on `View` (no need for `Pressable` wrapper). |
| Tamagui PR [#1277](https://github.com/tamagui/tamagui/pull/1277) | Historically mapped web `aria-*` / `role` → native `accessibility*` for older RN; RN ≥0.71 accepts many `aria-*` / `role` natively (values not 100% interchangeable — e.g. `slider` vs `adjustable`). |
| Tamagui Image docs | On native, still document `accessible` + `accessibilityLabel`. |
| [One + Tamagui guide](https://onestack.dev/docs/guides-tamagui) | One is Tamagui LLC’s cross-platform Vite framework (web + RN). Setup is provider + Vite plugin; **no** first-party Storybook/testing-library guide in those pages. |

**Practical expectation for siheom against Tamagui/One UIs:**

- Prefer querying ARIA-style roles (`button`, `heading`, `img`, `searchbox`, `slider`) that Tamagui/components set via `role`.
- Still accept legacy `accessibilityRole` names in the resolver (RNTL already aliases).
- Ensure interactive `View`s are accessibility elements (`accessible` / Pressable-like defaults); otherwise `getByRole` will miss them.

---

## 4. Is Storybook React Native typical for Tamagui / One?

| Context | Typical? | Notes |
|---------|----------|-------|
| Expo / RN CLI apps generally | **Yes, common** | Official [`@storybook/react-native`](https://github.com/storybookjs/react-native) (on-device UI, Metro `withStorybook`, optional RN-web addon). |
| Tamagui docs | **Not prescribed** | Focus on app + compiler; Takeout/starters more than Storybook. |
| One docs | **Not prescribed** | Routing/preview pages or app entry are natural isolation; no Storybook section in intro / Tamagui guide. |
| Universal (web + native) | Mixed | Web Storybook and/or `@storybook/addon-react-native-web`; separate on-device RN Storybook; or in-app “kitchen sink” routes. |

**Verdict for `@siheom/react-native` design:** do **not** couple the runtime to Storybook RN. Treat Storybook as an optional showcase host (same as web `@siheom/react` + Storybook). One/Tamagui apps may use routes or RN Storybook equally.

---

## 5. Recommended package split: `@siheom/react-native` vs core reuse

Aligned with `CONTEXT.md` **런타임 패키지** vs **코어 패키지**.

### Reuse from `@siheom/core` (keep)

- Factory: `createRunSiheom`, `extendSiheom`, `overrideSiheom`
- Step / registry types: `Locator` shape `{ role, name, within? }`, action/assertion/given/effect step types
- `query.*` **API surface** (role → locator factories) — *conceptually*; implementation must swap
- Message-map / failure-report scaffolding (if kept DOM-agnostic)
- `withFakeTimers` / `fakeTimerScope` **contracts** (RN package supplies RNTL/`act`-aware install)

### Do **not** reuse as-is (DOM-bound today)

| Module | Why |
|--------|-----|
| `packages/core/src/query.ts` `getElement` | Imports `@testing-library/dom`, returns `HTMLElement` |
| `action.ts` / default actions | DOM `user-event` + `HTMLElement` |
| `assert.ts` + `getA11ySnapshot` | `dom-accessibility-api`, HTML tree |
| `a11y/ariaRoles.ts` via `aria-query` alone | Web ARIA role set ≠ RN role + alias set; inputs lack textbox |

### Own in `@siheom/react-native`

| Piece | Approach |
|-------|----------|
| Peers | `@testing-library/react-native`, `react-native`, `test-renderer`, `react`; Jest (or Vitest with documented shims) |
| `given.render` | `await render(element)` from RNTL (+ optional `wrapper` for TamaguiProvider) |
| Locator resolution | RNTL `screen.getByRole` / `getByLabelText` / placeholder / display value; map siheom `query.text` → `*ByText`; keep `query.label` → `*ByLabelText` |
| Actions | RNTL `userEvent`: `press` (maps from web `click`), `type`/`clear` for TextInput; drop or no-op web-only (`hover`, `upload`, dblclick as needed) |
| Assertions | RNTL Jest matchers (`toBeOnTheScreen`, `toBeChecked`, …) or thin wrappers |
| A11y snapshot | New RN tree walker over `TestInstance` props (`role`/`accessibilityRole`, labels, states) — **not** `dom-accessibility-api` |
| Role vocabulary | Prefer ARIA `role` names in `query.*`; document aliases (`header`→`heading`, etc.); add RN-relevant extras (`switch` already ARIA; consider `text` if needed) |

### Optional later core extraction

If both web and RN need shared “role + name locator DSL” without DOM:

1. Split **pure** types + `query` builders into a DOM-free module.  
2. Keep `getElement` / snapshot behind a **HostQueries** port injected by the runtime.  

Until then, mirroring `@siheom/vue`/`angular` (thin runtime that still leans on core’s DOM defaults) is **wrong for RN** — core’s default actions/assertions are HTMLElement-based. Prefer the `@siheom/react` pattern: runtime registers **its own** action/assertion implementations, but RN cannot call through to core’s DOM `getElement`.

---

## Sources

- [RNTL Intro](https://oss.callstack.com/react-native-testing-library/docs/start/intro)  
- [RNTL Quick Start](https://oss.callstack.com/react-native-testing-library/docs/start/quick-start)  
- [RNTL How should I query?](https://oss.callstack.com/react-native-testing-library/docs/guides/how-to-query)  
- [RNTL Queries](https://oss.callstack.com/react-native-testing-library/docs/api/queries)  
- [RNTL Accessibility helpers](https://oss.callstack.com/react-native-testing-library/docs/api/misc/accessibility)  
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)  
- [Tamagui props](https://tamagui.dev/docs/intro/props)  
- [One introduction](https://onestack.dev/docs/introduction)  
- [One + Tamagui](https://onestack.dev/docs/guides-tamagui)  
- [Storybook React Native](https://github.com/storybookjs/react-native)  
- Repo: `CONTEXT.md`, `packages/core`, `packages/react`
