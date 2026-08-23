# @siheom/ime — Hangul IME composition emulation

`@testing-library/user-event` `fill` / `type` insert Hangul as plain `insertText`. They do **not** replay real IME traffic: `compositionstart` / `compositionupdate` / `compositionend`, `keyCode` 229, or OS-specific Enter ordering. Bugs that only appear **during composition** (focus steal, false Enter-submit, stale controlled writeback, …) slip through tests.

`@siheom/ime` emulates Hangul composition from OS-captured golden traces and can replace Siheom’s `fill` / `type`. It is framework-agnostic; wire it in React with `overrideSiheom`.

Fixed examples below are validated under `apps/react-example/test/stories/ime-bugs/`.

::: tip Experimental
`@siheom/ime` is experimental. APIs and profile ids may change between versions.
:::

## Why it exists

| Approach | What happens for Hangul |
| -------- | ----------------------- |
| `user-event` only | Finished syllables land with little/no composition; `isComposing` stays false |
| Real IME | Preedit → commit; `compositionend` per syllable; Enter/Blur aborts composition |
| `@siheom/ime` | Dispatches a profile-specific event sequence close to a real IME |

Autocomplete and search UIs that work for Latin often break mid-Hangul. IME actions let CI exercise that path.

## Install and use

### Install

Install alongside your framework package. Peers are Testing Library / Vitest (no React peer).

```bash
yarn add @siheom/ime
# or
npm install @siheom/ime
```

Typical peers already in the app:

- `@testing-library/dom` ^10
- `@testing-library/user-event` ^14
- `@testing-library/jest-dom` ^6
- `vitest` ^4

### Replace `fill` / `type` in React

Pass `{ fill, type }` from `createImeActions` into `overrideSiheom`. Hangul runs use composition emulation; everything else uses `user-event`.

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

return runSiheom(
  given.render(<SearchField />),
  actions.fill(query.textbox("Search"), "김태희"),
  assertions.value(query.textbox("Search"), "김태희"),
);
```

Pick a profile via options or `SIHEOM_IME_PROFILE`. Default: `linux-chrome-ibus-hangul`.

```ts
createImeActions({ profile: "macos-safari" });
// process.env.SIHEOM_IME_PROFILE = "windows-chrome-ms"
```

### Low-level API

```ts
import { composeHangul, composeEnter, composeBackspace } from "@siheom/ime";

await composeHangul(input, "김", { profile: "macos-chrome-apple" });
await composeEnter(input, "macos-chrome-apple");
await composeBackspace(input);
```

Hanja conversion lives on a subpath:

```ts
import { typeHanja, createHanjaActions } from "@siheom/ime/hanja";
```

### Options

| Option | Role |
| ------ | ---- |
| `profile` | OS/browser profile id or `ImeProfile` object |
| `settle` | Yield after each preedit — `microtask` (default, focus-steal) / `macrotask` (deferred writeback) |
| `deferredUpdateRace` | If the host marks a stale controlled writeback, abort continuous composition to match OS captures |
| `resolveElement` | Locator → DOM — `"waitFor"` (default) / `"sync"` |

## OS / browser behavior (profiles)

Built-ins are registered via `registerProfile` / `resolveProfile` / `getRegisteredProfileIds`. Each profile has four axes:

| Axis | Meaning |
| ---- | ------- |
| `enterDuringComposition` | Event order when Enter confirms composition |
| `hangulKeyEventKey` | `key` on keydown/keyup — `"process"` vs jamo (`"jamo"`) |
| `hangulComposeMode` | Composition events vs Safari `insertReplacementText` |
| `hanjaConversion` | Hanja **replace** vs Chrome **append** |
| `hangulKeyboard` | Physical layout — `"dubeolsik"` (default) vs `"sebeolsik-ngs"` (Nalgaeset 3-set) |
| `postCompositionEndInput` | Extra `insertCompositionText` `input` after `compositionend` (Windows Firefox) |

### Built-in profiles

| Profile id | Enter facet | key | Compose | Hanja | Keyboard | post-end input |
| ---------- | ----------- | --- | ------- | ----- | -------- | -------------- |
| `linux-chrome-ibus-hangul` (default) | `webkit` | `process` | `composition` | `replace` | `dubeolsik` | no |
| `macos-safari` | `webkit` | `process` | `composition` | `replace` | `dubeolsik` | no |
| `macos-safari-apple` | `webkit` | `jamo` | `replacement` | `replace` | `dubeolsik` | no |
| `macos-chrome-apple` | `chromium-apple` | `jamo` | `composition` | `append` | `dubeolsik` | no |
| `windows-chrome-ms` | `chromium-duplicate` | `process` | `composition` | `replace` | `dubeolsik` | no |
| `windows-chrome-ngs` | `chromium-duplicate` | `process` | `composition` | `replace` | `sebeolsik-ngs` | no |
| `windows-firefox-ms` | `webkit` | `process` | `composition` | `replace` | `dubeolsik` | yes |
| `android-chrome` | `webkit` | `unidentified` | `composition` | `replace` | `dubeolsik` | no |
| `chromium-enter-229` | `chromium` | `process` | `composition` | `replace` | `dubeolsik` | no |
| `chromium-cdp` | `chromium` | `process` | `composition` | `replace` | `dubeolsik` | no |

### Enter confirm order (facets)

When the app submits on Enter in `keydown`, **order** of `compositionend` vs Enter decides whether confirm looks like submit.

- **`webkit`** (Safari, Linux Chrome + ibus-hangul, Windows Firefox + MS): `compositionend` then `Enter` with `isComposing: false` → `!e.isComposing` **false-submits on confirm**
- **`chromium`**: confirm keydown stays on the 229 / composing side
- **`chromium-duplicate`**: Windows MS Hangul / Nalgaeset — Process 229 → `compositionend` → separate Enter(13). ArrowLeft likewise uses Process+ArrowLeft 229 before confirm
- **`chromium-apple`**: macOS Chrome Apple — Enter 229 → confirm update → `compositionend` → later plain Enter

### Windows profile notes

- **`windows-chrome-ms`**: 2-set. Matches continuous-hangul / Enter / backspace / arrow goldens on critical fields.
- **`windows-chrome-ngs`**: Nalgaeset **3-set**. Distinct choseong/jungseong/jongseong keys; no 2-set batchim look-ahead across syllables (e.g. `태|희` mid-preedit has no `탷`/`흐`). `ㅢ` is a single Digit8 key. Some TipTap enter captures used 2-set codes; Enter fidelity is asserted via `enter-submit` goldens.
- **`windows-firefox-ms`**: webkit Enter order. Every `compositionend` is followed by an `insertCompositionText` `input` with `isComposing: false`. No-op confirm pulses omit `compositionupdate`.

```ts
createImeActions({ profile: "windows-chrome-ms" });
createImeActions({ profile: "windows-chrome-ngs" });
createImeActions({ profile: "windows-firefox-ms" });
```

### Compose modes

- **`composition`**: `compositionstart` / `insertCompositionText` / `compositionend`
- **`replacement`**: Safari Apple — `insertText` / `insertReplacementText` without composition
- **`safari-composition`**: Safari variant where input precedes keydown

### Hanja `append` (macOS Chrome)

Chromium ignores macOS IME `replacementRange` on web inputs. Option+Enter often does:

```
compositionend "김" → compositionstart → insertCompositionText "金" → value "김金"
```

Safari/native replace in place. Apps that want only `金` must **strip leftover Hangul** (see “Hanja + autocomplete” below).

## Event emulation internals

Pipeline sketch:

```
segmentTypeText("김태희{Enter}")
  → Hangul / Latin / {Key} segments
planHangulKeystrokes("김")
  → jamo stroke list
composeHangul / composeHangulSafari*
  → KeyboardEvent + CompositionEvent + InputEvent
composeEnter / composeBackspace / …
  → profile-specific confirm / delete sequences
```

Key modules:

| Module | Role |
| ------ | ---- |
| `createImeActions` | Drop-in Siheom `fill` / `type` |
| `segmentTypeText` | Split Hangul / plain / `{Backspace}` runs |
| `planHangulKeystrokes` | Syllable → jamo plan (`es-hangul`) |
| `composeHangul` | Chromium-style composition sequence |
| `_internal/events.ts` | `dispatch` — restore WebKit `inputType`s Chromium drops |
| `_internal/session.ts` | Composition session (preedit) state |
| `_internal/maxLength.ts` | OS-specific reject paths past `maxLength` |
| `attachImeRecorder` / `toCriticalEvents` / `goldenCritical` | OS trace ↔ emulator compare |

`settle` matters because React `setState`, focus bounce, and `setTimeout(0)` writeback must run **before the next preedit** for real bugs to show:

- `settle: "microtask"` — detect focus bounce to options
- `settle: "macrotask"` + `deferredUpdateRace` — stale controlled `value` clobbering DOM

Hosts signal deferred writeback with `markImeControlledWriteback(element)`.

::: note contenteditable
`contenteditable` currently falls back to `user-event` typing. Primary target is `input` / `textarea`.
:::

`@siheom/ime-cdp` drives a real browser via CDP; it does not replace this synthetic emulator.

## Common React issues and fixes

Patterns from broken → fixed. Full components: `apps/react-example/test/stories/ime-bugs/`.

### 1. Focus steal — focusing options mid-composition

**Symptom:** Focusing an option then the input after every `input` forces `compositionend` on blur → `김태희` becomes 풀어쓰기 (`ㄱㅣㅁ…`). Latin is fine.

**Fix:** Never move DOM focus to options; highlight with `aria-activedescendant` / `aria-selected`. Don’t rewrite controlled `value` over IME preedit during composition.

```tsx
// broken
queueMicrotask(() => {
  option.focus();
  input.focus();
});

// fixed
<input
  aria-activedescendant={activeOption ? `option-${activeOption}` : undefined}
/>
<button role="option" tabIndex={-1} aria-selected={index === 0} />
```

See [Ariakit #6663](https://github.com/ariakit/ariakit/issues/6663), [React Aria #10126](https://github.com/adobe/react-spectrum/issues/10126).

### 2. Delayed controlled update — stale setState

**Symptom:** A leading snapshot + `setTimeout(0)` writeback applies an old `value` after IME already advanced preedit.

**Fix:** Sync `setValue` to the current `input.value` during composition; no deferred leading-snapshot writeback.

```tsx
// broken
const leading = input.value;
setTimeout(() => flushSync(() => setValue(leading)), 0);

// fixed
const onInput = () => setValue(input.value);
```

Reproduce with the emulator:

```ts
createImeActions({ settle: "macrotask", deferredUpdateRace: true });
// after broken writeback: markImeControlledWriteback(node)
```

### 3. Enter-submit — confirm Enter submits search

**Symptom:** Safari / Linux Chrome+ibus emit confirm as `compositionend` then `Enter` with `isComposing: false`. `if (key === "Enter" && !e.isComposing) submit()` treats confirm as submit.

**Fix:** Ignore composing / `keyCode === 229`, and **swallow the next Enter after `compositionend`** (even across tasks).

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

### 4. maxLength — overflow during preedit

**Symptom:** Native `maxLength` alone can let preedit exceed the limit; reject timing differs by OS.

**Fix:** Clamp on every `input`.

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

### 5. Hanja + autocomplete keys + Chrome `김金`

**Symptoms:** Combobox steals Arrow/digit/Enter during IME; macOS Chrome appends Hanja (`김` → `김金`).

**Fix:** Defer combobox keys while composing / 229 / `altKey`. Strip Hangul+Hanja suffix **only on Hanja `compositionend`** (never when Option+Enter *starts* conversion).

```tsx
const shouldDeferToIme = (e: KeyboardEvent) =>
  isComposing || e.isComposing || e.keyCode === 229 || e.altKey;

function stripHangulBeforeHanja(value: string, lastHangul: string, hanja: string) {
  if (!value.endsWith(lastHangul + hanja)) return null;
  return value.slice(0, -lastHangul.length - hanja.length) + hanja;
}
```

## Related

- Package: [`packages/ime`](https://github.com/twinstae/siheom-ts/tree/main/packages/ime)
- Fixtures & stories: [`apps/react-example/test/stories/ime-bugs`](https://github.com/twinstae/siheom-ts/tree/main/apps/react-example/test/stories/ime-bugs)
- [Headless UI guide](/en/guides/headless-components)
- [React quick start](/en/getting-started/react)
- [What is siheom?](/en/intro)
