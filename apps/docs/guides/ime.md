# @siheom/ime — 한글 IME 조합 에뮬레이션

`@testing-library/user-event`의 `fill` / `type`은 한글을 일반 `insertText`로만 넣습니다. 실제 브라우저 IME가 보내는 `compositionstart` / `compositionupdate` / `compositionend`, `keyCode` 229, OS별 Enter 순서 등은 재현하지 않습니다. 그 결과 **조합 중에만** 터지는 버그(포커스 훔치기, Enter 오제출, controlled writeback 등)가 테스트에서 조용히 지나갑니다.

`@siheom/ime`는 OS에서 캡처한 골든 트레이스를 바탕으로 Hangul 조합 이벤트를 에뮬레이션하고, Siheom의 `fill` / `type`을 그 구현으로 바꿀 수 있게 합니다. 프레임워크에 묶이지 않은 패키지이며, React에서는 `overrideSiheom`으로 연결합니다.

이 가이드의 fixed 예시는 `apps/react-example/test/stories/ime-bugs/`에서 검증했습니다.

::: tip 실험적 패키지
`@siheom/ime`는 실험적입니다. API와 프로필 목록은 버전마다 바뀔 수 있습니다.
:::

## 왜 필요한가

| 방식 | Hangul 입력 시 일어나는 일 |
| ---- | -------------------------- |
| `user-event`만 | 조합 없이 완성 글자가 바로 들어감. `isComposing`이 거의 항상 `false` |
| 실제 IME | preedit → 확정, 음절마다 `compositionend`, Enter/Blur가 조합을 끊음 |
| `@siheom/ime` | 프로필별로 실제 IME에 가까운 이벤트 시퀀스를 디스패치 |

영문만 치면 문제 없던 자동완성·검색창이, 한글 조합 중에는 깨지는 경우가 많습니다. Siheom 시험에 IME actions를 붙이면 그 경로를 CI에서 잡을 수 있습니다.

## 설치와 사용

### 설치

프레임워크 패키지와 함께 설치합니다. peer는 Testing Library / Vitest입니다 (React peer는 없습니다).

```bash
bun add @siheom/ime
# 또는
npm install @siheom/ime
```

이미 있는 peer 예시:

- `@testing-library/dom` ^10
- `@testing-library/user-event` ^14
- `@testing-library/jest-dom` ^6
- `vitest` ^4

### React에서 `fill` / `type` 교체

`createImeActions`가 반환하는 `{ fill, type }`을 `overrideSiheom`에 넘깁니다. Hangul 구간은 조합 에뮬레이션, 나머지는 `user-event`입니다.

```ts
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
} from "@siheom/core";
import { createImeActions } from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";
import { render } from "@testing-library/react";

const runSiheom = overrideSiheom(
  {
    actions: createDefaultActions(),
    assertions: createDefaultAssertions(),
    givens: defaultGivens,
    effects: { ...defaultEffects, ...reactEffects },
  },
  {
    actions: createImeActions({ profile: "linux-chrome-ibus-hangul" }),
    givens: {
      render: async (element: React.ReactElement) => {
        render(element);
      },
    },
  },
);

// 이후 기존과 동일 — fill/type만 IME 경로를 탐
return runSiheom(
  given.render(<SearchField />),
  actions.fill(query.textbox("검색"), "김태희"),
  assertions.value(query.textbox("검색"), "김태희"),
);
```

프로필은 옵션 또는 환경 변수 `SIHEOM_IME_PROFILE`로 고릅니다. 생략 시 기본값은 `linux-chrome-ibus-hangul`입니다.

```ts
createImeActions({ profile: "macos-safari" });
// process.env.SIHEOM_IME_PROFILE = "windows-chrome-ms"
```

### 저수준 API

`fill`/`type` 없이 직접 조합을 돌릴 수도 있습니다.

```ts
import { composeHangul, composeEnter, composeBackspace } from "@siheom/ime";

await composeHangul(input, "김", { profile: "macos-chrome-apple" });
await composeEnter(input, "macos-chrome-apple");
await composeBackspace(input);
```

한자 변환은 별도 서브패스입니다.

```ts
import { typeHanja, createHanjaActions } from "@siheom/ime/hanja";
```

### 옵션 요약

| 옵션 | 역할 |
| ---- | ---- |
| `profile` | OS/브라우저 프로필 id 또는 `ImeProfile` 객체 |
| `settle` | preedit 후 양보 시점 — `microtask`(기본, focus-steal) / `macrotask`(지연 writeback) |
| `deferredUpdateRace` | 호스트가 stale controlled writeback을 표시하면 조합을 끊고 OS 캡처와 맞춤 |
| `resolveElement` | locator → DOM — `"waitFor"`(기본) / `"sync"` |

## OS · 브라우저별 동작 (프로필)

내장 프로필은 `registerProfile` / `resolveProfile` / `getRegisteredProfileIds`로 조회합니다. 각 프로필은 네 축으로 정의됩니다.

| 축 | 의미 |
| -- | ---- |
| `enterDuringComposition` | 조합 중 Enter 확정 시 이벤트 순서 |
| `hangulKeyEventKey` | keydown/keyup의 `key` — `"process"` vs 자모(`"jamo"`) |
| `hangulComposeMode` | composition 이벤트 vs Safari `insertReplacementText` |
| `hanjaConversion` | 한자 확정 시 한글 **대체**(`replace`) vs Chrome **덧붙임**(`append`) |

### 내장 프로필

| Profile id | Enter facet | key | Compose | Hanja |
| ---------- | ----------- | --- | ------- | ----- |
| `linux-chrome-ibus-hangul` (기본) | `webkit` | `process` | `composition` | `replace` |
| `macos-safari` | `webkit` | `process` | `composition` | `replace` |
| `macos-safari-apple` | `webkit` | `jamo` | `replacement` | `replace` |
| `macos-chrome-apple` | `chromium-apple` | `jamo` | `composition` | `append` |
| `windows-chrome-ms` | `chromium-duplicate` | `process` | `composition` | `replace` |
| `chromium-enter-229` | `chromium` | `process` | `composition` | `replace` |
| `chromium-cdp` | `chromium` | `process` | `composition` | `replace` |

### Enter 확정 순서 (facet)

앱이 `keydown`에서 Enter로 submit할 때, **어떤 순서로** `compositionend`와 Enter가 오는지가 버그 여부를 가릅니다.

- **`webkit`** (Safari, Linux Chrome + ibus-hangul): `compositionend` 후 `Enter` with `isComposing: false` → `!e.isComposing`만 보면 **조합 확정 Enter가 submit**으로 오인됨
- **`chromium`**: 확정 keydown이 `keyCode` 229 / composing 쪽 → 같은 버그 클래스가 덜 드러남
- **`chromium-duplicate`**: Windows MS IME — Process 229 → `compositionend` → 별도 Enter(13)
- **`chromium-apple`**: macOS Chrome Apple — Enter 229 → confirm update → `compositionend` → 이후 일반 Enter

### Compose mode

- **`composition`**: `compositionstart` / `insertCompositionText` / `compositionend` (Linux ibus, 대부분 Chrome)
- **`replacement`**: Safari Apple — composition 없이 `insertText` / `insertReplacementText`
- **`safari-composition`**: Safari 계열에서 input이 keydown보다 앞서는 변형

### Hanja `append` (macOS Chrome)

Chromium은 macOS IME의 `replacementRange`를 웹 input에서 무시합니다. Option+Enter 한자 변환 시:

```
compositionend "김" → compositionstart → insertCompositionText "金" → value "김金"
```

Safari/네이티브는 `김`을 `金`으로 대체합니다. 앱이 Chrome에서 `金`만 보이게 하려면 **남은 한글을 직접 지우는 보정**이 필요합니다 (아래 “한자 · 자동완성”).

## 이벤트 에뮬레이션 내부 구조

대략적인 파이프라인:

```
segmentTypeText("김태희{Enter}")
  → Hangul / Latin / {Key} 구간 분리
planHangulKeystrokes("김")
  → 자모 스트로크 열
composeHangul / composeHangulSafari*
  → KeyboardEvent + CompositionEvent + InputEvent 디스패치
composeEnter / composeBackspace / …
  → 프로필 facet에 맞는 확정·삭제 시퀀스
```

핵심 모듈:

| 모듈 | 역할 |
| ---- | ---- |
| `createImeActions` | Siheom `fill`/`type` 드롭인 |
| `segmentTypeText` | 문자열을 Hangul / 일반 / `{Backspace}` 등으로 분할 |
| `planHangulKeystrokes` | 음절 → 자모 키 계획 (`es-hangul`) |
| `composeHangul` | Chromium형 composition 시퀀스 |
| `_internal/events.ts` | `dispatch` — Chromium이 버리는 WebKit `inputType`을 `defineProperty`로 복원 |
| `_internal/session.ts` | 조합 세션(preedit) 상태 |
| `_internal/maxLength.ts` | `maxLength` 초과 시 OS별 reject 경로 |
| `attachImeRecorder` / `toCriticalEvents` / `goldenCritical` | OS 트레이스 ↔ 에뮬 대조 |

`settle`이 중요한 이유: React의 `setState`, focus bounce, `setTimeout(0)` writeback이 **다음 preedit 전에** 돌아가야 실제 버그가 재현됩니다.

- `settle: "microtask"` — focus를 option으로 뺏는 패턴 감지
- `settle: "macrotask"` + `deferredUpdateRace` — 한 박자 늦은 controlled `value`가 DOM을 덮어쓰는 레이스

지연 writeback을 에뮬이 알아채게 하려면 호스트가 `markImeControlledWriteback(element)`를 호출합니다 (`dataset` 마커).

::: note contenteditable
`contenteditable`은 현재 `user-event` type으로 폴백합니다. input/textarea 조합이 주 대상입니다.
:::

관련 패키지 `@siheom/ime-cdp`는 실제 브라우저 CDP로 IME를 돌리는 경로이며, 이 합성 에뮬레이터를 대체하지 않습니다.

## React에서 자주 겪는 이슈와 대처 (fixed)

아래는 broken → fixed로 정리한 패턴입니다. 전체 컴포넌트는 `apps/react-example/test/stories/ime-bugs/`를 보세요.

### 1. Focus steal — 조합 중 option으로 포커스

**증상:** 매 `input`마다 option에 `focus()`했다가 input으로 돌아오면, blur가 `compositionend`를 강제해 `김태희` → `ㄱㅣㅁㅌㅐㅎㅡㅣ`처럼 풀어쓰기됨. (영문은 조합이 없어 무사.)

**원인:** DOM focus를 옮김. `compositionend`마다 bounce해도 음절 경계마다 end가 나서 깨짐. 조합 중 controlled `value`를 덮어쓰면 preedit가 오염됨 (`김ㅐㅢ`).

**fixed:** option은 DOM focus하지 말고 `aria-activedescendant` / `aria-selected`로만 하이라이트. 조합 중 React가 옛 `value`를 쓰지 않기.

```tsx
// broken — 매 input마다 option ↔ input focus
queueMicrotask(() => {
  option.focus();
  input.focus();
});

// fixed — 가상 하이라이트만
<input
  aria-activedescendant={activeOption ? `option-${activeOption}` : undefined}
  /* value는 composition 중 IME preedit와 맞추고, option.focus() 금지 */
/>
<button role="option" tabIndex={-1} aria-selected={index === 0} />
```

참고: [Ariakit #6663](https://github.com/ariakit/ariakit/issues/6663), [React Aria #10126](https://github.com/adobe/react-spectrum/issues/10126).

### 2. Delayed controlled update — 한 박자 늦은 setState

**증상:** `setTimeout(0)` + 오래된 스냅샷으로 `setValue`하면, IME가 이미 다음 preedit로 간 뒤 stale `value` prop이 DOM을 덮어써 조합이 깨짐.

**fixed:** 조합 중에는 **동기**로 최신 `event.target.value`를 state에 반영. 지연 배치·leading snapshot writeback을 쓰지 않기.

```tsx
// broken
const leading = input.value;
setTimeout(() => {
  flushSync(() => setValue(leading)); // 이미 낡은 값
}, 0);

// fixed
const onInput = () => {
  setValue(input.value); // 항상 현재 preedit
};
```

에뮬로 레이스를 재현할 때:

```ts
createImeActions({
  settle: "macrotask",
  deferredUpdateRace: true,
});
// broken 쪽 writeback 직후 markImeControlledWriteback(node)
```

### 3. Enter-submit — 조합 확정 Enter가 검색 실행

**증상:** Safari / Linux Chrome+ibus는 확정 Enter가 `compositionend` 뒤 `isComposing: false`로 옴. `if (key === "Enter" && !e.isComposing) submit()`이면 **확정만 해도 검색**됨.

**fixed:** composing / `keyCode === 229`는 무시하고, **`compositionend` 직후 다음 Enter 한 번을 삼킴** (같은 microtask가 아니라 다음 task에 와도).

```tsx
const ignoreNextEnterRef = useRef(false);

const onKeyDown = (e: KeyboardEvent) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter") {
    if (ignoreNextEnterRef.current) {
      ignoreNextEnterRef.current = false;
      e.preventDefault();
      return;
    }
    e.preventDefault();
    submit();
  }
};

const onCompositionEnd = () => {
  ignoreNextEnterRef.current = true;
};
```

### 4. maxLength — 조합 중 길이 초과

**증상:** native `maxLength`만 쓰면 조합 중 preedit가 제한을 넘을 수 있고, 확정 시 IME/브라우저가 거부하는 타이밍이 OS마다 다름.

**fixed:** 매 `input`마다 clamp. Chrome은 조용히 조합 종료, Safari는 composition 재시작 + 빈 `insertText` 등 프로필별 차이가 있음 (`@siheom/ime`가 에뮬).

```tsx
function clampToMaxLength(node: HTMLInputElement) {
  const limit = node.maxLength;
  if (limit < 0 || node.value.length <= limit) return;
  node.value = node.value.slice(0, limit);
  node.setSelectionRange(limit, limit);
}

node.addEventListener("input", () => {
  clampToMaxLength(node);
  setValue(node.value);
});
```

### 5. 한자 · 자동완성 키 충돌 + Chrome `김金`

**증상:**

1. 조합/한자 후보 키(방향키·숫자·Enter·Option)를 combobox가 가로챔
2. macOS Chrome에서 한자 변환이 `김` → `김金`으로 append됨

**fixed:**

1. `isComposing` / 229 / `altKey` 동안 combobox 키 처리 보류
2. Hanja **`compositionend`에서만** 직전 한글+한자 접미를 strip (`Option+Enter` 시작 시점에는 value를 건드리지 않음 — 후보창이 닫힘)

```tsx
const shouldDeferToIme = (e: KeyboardEvent) =>
  isComposing || e.isComposing || e.keyCode === 229 || e.altKey;

// compositionend에서만
function stripHangulBeforeHanja(value: string, lastHangul: string, hanja: string) {
  if (!value.endsWith(lastHangul + hanja)) return null;
  return value.slice(0, -lastHangul.length - hanja.length) + hanja;
}
```

## 관련 링크

- 패키지: [`packages/ime`](https://github.com/twinstae/siheom-ts/tree/main/packages/ime)
- 픽스처·스토리: [`apps/react-example/test/stories/ime-bugs`](https://github.com/twinstae/siheom-ts/tree/main/apps/react-example/test/stories/ime-bugs)
- [헤드리스 UI 가이드](/guides/headless-components) — role/name 쿼리
- [React 빠른 시작](/getting-started/react) — `runSiheom` 기본
- [siheom이란](/intro) — 패키지 개요
