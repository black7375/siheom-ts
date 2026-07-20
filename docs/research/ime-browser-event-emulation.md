# Research: IME browser event emulation for a frontend test library

**Date:** 2026-07-20  
**Scope:** Designing an IME emulation layer for siheom (post-1.0; see `CONTEXT.md`).  
**Primary ticket:** [GitHub issue #14 — IME 테스트 에뮬레이션](https://github.com/twinstae/siheom-ts/issues/14) (repo may resolve via `gh`).

---

## Repo context

| Finding | Source |
|--------|--------|
| IME emulation is explicitly **post-1.0**, not in current product scope | `CONTEXT.md` (“1.0 확장”) |
| No implementation, tests, or `es-hangul` dependency for IME today | repo search |
| Text input uses `@testing-library/user-event` (`user.type` / `user.clear`) in `@siheom/core`; browser path uses Vitest browser `userEvent` / `locator.fill` | `packages/core/src/action.ts`, `packages/vitest-browser-react/src/action.ts` |
| **No** CDP `Input.insertText` / `Input.imeSetComposition`, OS automation (`xdotool`, robotjs, etc.), or Playwright keyboard IME helpers anywhere in first-party code | repo search |
| Local `plan.md` files (countdown / headless / todomvc) do **not** mention IME | `apps/react-example/test/stories/*/plan.md` |
| Issue #14 asks for cross-browser/OS composition emulation; owner comment explores **real OS keyboard injection** as an alternative to pure browser event faking; contributor taxonomy of input-method classes (composition / conversion / code / replacement / joining) | issue #14 + comments |

---

## 1. Browser event sequences for Korean Hangul composition

### Spec-level composition + inputType (W3C Input Events Level 2)

Canonical session shape ([Input Events Level 2](https://www.w3.org/TR/input-events-2/)):

1. `compositionstart`
2. Repeated:
   - `compositionupdate` (`data` = current composition / preedit string)
   - `beforeinput` with `inputType: "insertCompositionText"` (not cancellable; `data` matches update)
   - DOM update of the active composition range
   - `input` with `inputType: "insertCompositionText"`
3. `compositionend`

**`insertCompositionText` vs `insertFromComposition`:**

- Spec / modern intent: during composition, updates use **`insertCompositionText`** only; commit is marked by `compositionend` (and typically a final composition string in `data`).
- Older draft types **`insertFromComposition`**, **`deleteByComposition`**, **`deleteCompositionText`** were [removed from the Input Events spec (PR #122)](https://github.com/w3c/input-events/pull/122). Emulators should treat them as **legacy / engine-dependent**, not the primary model.
- Some engines still diverge on whether a final `beforeinput`/`input` at commit uses `insertCompositionText`, `insertText`, or (historically) `insertFromComposition`. Design for **profiles**, not one universal `inputType` on commit.

### Keyboard events during IME (MDN / UI Events)

From [MDN: keydown events with IME](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime):

- During composition, `keydown`/`keyup` still fire (Firefox 65+ aligned with other browsers for CJKT).
- Recommended ignore guard:

  ```js
  if (event.isComposing || event.keyCode === 229) return;
  ```

- **`keyCode === 229`** (`VK_PROCESS`): IME consumed the key. Still needed because:
  - First key that *starts* composition: `compositionstart` may fire **after** `keydown`, so `isComposing` is still `false`.
  - Last key that *ends* composition: `compositionend` may fire **before** `keydown`, so `isComposing` is already `false`.
- During Hangul composition, `event.key` is often `"Process"` rather than the jamo / syllable ([SO / field reports](https://stackoverflow.com/questions/78025542/in-javascript-event-key-not-returning-keypresses-for-hangul-characters-in-consol)).
- IME typically does **not** send classic `keypress` for composition keys ([stum.de](https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/)).

### Illustrative Hangul preedit progression

For typing toward `한` (ㅎ → 하 → 한), engines generally show progressive **composed syllables** in `compositionupdate.data`, not raw jamo strings ([contenteditable.lab IME overview](https://contenteditable.realerror.com/docs/ime-composition/)):

| Step | Physical intent (2벌식) | Typical `compositionupdate.data` |
|------|-------------------------|----------------------------------|
| 1 | ㅎ | `"ㅎ"` |
| 2 | ㅎ+ㅏ | `"하"` |
| 3 | 하+ㄴ | `"한"` |
| commit | Space / Enter / next syllable boundary | `compositionend` with final text |

Each update is accompanied (per current Input Events) by non-cancellable `beforeinput`/`input` with `insertCompositionText`.

**Emulation implication:** Hangul needs a **syllable assembler** (jamo → progressive NFC syllables), not merely appending characters to a string. See §5 (`es-hangul`).

---

## 2. Platform / engine differences (Enter during composition)

This is the highest-value bug class for chat boxes, search-on-Enter, and form submit.

### Safari / WebKit: `compositionend` before Enter `keydown`

Documented extensively ([Square blog](https://developer.squareup.com/blog/understanding-composition-browser-events/), [contenteditable.lab ce-0567](https://contenteditable.realerror.com/cases/ce-0567-safari-composition-event-order/), [ironclaw #1139](https://github.com/nearai/ironclaw/issues/1139)):

| Engine | Enter to **confirm** composition |
|--------|----------------------------------|
| Chrome / Firefox (typical) | `keydown` (`isComposing: true`, often `keyCode: 229`) → `compositionend` → (sometimes later) real Enter |
| **Safari** | `compositionend` **first** → `keydown` with `key: "Enter"`, **`isComposing: false`** |

App code that only checks `!e.isComposing` on Enter **sends/submits on the confirm key** in Safari.

**Emulation profiles to ship:**

- `chromium-like`: Enter-during-commit has `isComposing: true` and/or `keyCode: 229` before/with end.
- `webkit-like`: fire `compositionend`, then Enter with `isComposing: false` (the failure mode apps must defend against).

### Chrome: duplicate keydowns (229 then 13)

On Windows Chrome with Korean IME, Enter during composition can emit **two** `keydown`s: first `keyCode: 229`, then `keyCode: 13` ([ce-0210](https://contenteditable.realerror.com/cases/ce-0210-ime-keydown-keycode-229-enter-chrome/)). Handlers that only listen for `key === "Enter"` / `13` can run on the second event unexpectedly depending on composition state.

### macOS vs Windows vs Linux

| Platform | Notes relevant to tests |
|----------|-------------------------|
| **macOS** | Frequent reports of Hangul Enter double-send / composition race specifically on **Chrome + macOS** (e.g. [Chainlit #2598](https://github.com/Chainlit/chainlit/issues/2598)); Safari has the WebKit order bug above. Korean “풀어쓰기” / syllable-split bugs in Safari+Docs also reported in the wild (linked from #14). |
| **Windows** | Classic 229 + Enter pairing; MS Korean IME; good reference for duplicate-keydown cases. |
| **Linux** | Behavior depends on **IBus / Fcitx / ibus-hangul** stack; more variance and Electron/webview edge cases (composition broken until first Latin char, etc.). Harder to pin one “Linux profile.” |
| **OS-agnostic truth** | Browsers expose IME to the page; Enter/Space/Arrows are **not** invisible. Defensive apps must ignore IME-consumed keys; test libs must be able to reproduce both “correct” and “Safari-broken” orders. |

### keyup after compositionend

Older cross-browser notes ([stum.de](https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/)):

- IE / Firefox / Safari: may emit `keyup` after `compositionend` (must not treat as user Enter).
- Chrome / Edge: often no such `keyup`.

---

## 3. How Playwright / Cypress / Testing Library handle IME

### Playwright

- **No first-class IME composition API** in stable Keyboard docs. `keyboard.type` for non-US characters often sends **only `input`**, skipping full key/composition sequences ([docs](https://playwright.dev/docs/api/class-keyboard), [issue #6267](https://github.com/microsoft/playwright/issues/6267)).
- Feature request [#5777](https://github.com/microsoft/playwright/issues/5777) remains the hub; early PRs for `imeSetComposition` ([#7487](https://github.com/microsoft/playwright/pull/7487)) did not land as a polished public surface.
- **Chromium CDP workaround** (used by Quill e2e fixtures and discussed on #5777):
  - `Input.imeSetComposition` — set/cancel preedit
  - `Input.insertText` — commit composition (emulates non-key-derived insertion)
- Chromium-only; WebKit/Firefox need different strategies (manual `dispatchEvent` or OS injection).

### Cypress

- Synthesizes events; **does not** drive the OS IME. Known gap vs human typing ([cypress#7653](https://github.com/cypress-io/cypress/issues/7653), native-events label).
- Unsuitable as a reference for faithful Hangul composition sequences.

### Testing Library / `@testing-library/user-event`

- **No composition-session support.** Open enhancement: [user-event #1097](https://github.com/testing-library/user-event/issues/1097).
- `user.type` / `user.keyboard` use a US keymap; dead-key / CJK composition is not modeled.
- Community workaround: large hand-rolled `fireEvent` / Selection simulators (gist linked from #1097).
- **siheom today inherits this gap** via `user.type` in `createDefaultActions`.

### Design takeaway for siheom

Existing tools either:

1. Insert final Unicode (skips composition), or  
2. Require Chromium CDP, or  
3. Force apps to hand-roll events.

A library-owned **composition emulator** (dispatch CompositionEvent + InputEvent + KeyboardEvent with profiles) is still an open niche—and matches issue #14’s ask. OS-level injection (owner comment on #14) is a second product: higher fidelity, poorer parallelism / CI cost.

---

## 4. OS-level / CDP keyboard injection in this repo

**Not used.** Current stack:

- jsdom / Testing Library path → `user-event`
- Vitest browser path → Vitest’s browser `userEvent` / Playwright-under-the-hood locators, but **no** project code calling CDP IME methods

If siheom later adds a browser-runtime IME action, Chromium CDP (`imeSetComposition` + `insertText`) is the most realistic **engine-backed** path; pure DOM dispatch remains the only path that works under jsdom / user-event without a real browser.

---

## 5. `es-hangul` for Korean jamo sequences

**Not in the repo today.** Relevant APIs ([es-hangul docs](https://es-hangul.slash.page/en/docs/api/core/disassemble)):

| API | Role for IME emulation |
|-----|------------------------|
| `disassemble(str)` | Flatten syllables to jamo string: `'값'` → `'ㄱㅏㅂㅅ'` — good for generating the **keystroke stream** from a target string |
| `disassembleToGroups(str)` | Per-syllable jamo groups: `'사과'` → `[['ㅅ','ㅏ'],['ㄱ','ㅗ','ㅏ']]` — good for **syllable-boundary** commits |
| `disassembleCompleteCharacter` | Single syllable → `{ choseong, jungseong, jongseong }` |
| `assemble(fragments)` | Rebuild progressive / final Hangul from jamo fragments for each `compositionupdate.data` |

**Suggested pipeline for `actions.typeHangul("한글")` (conceptual):**

1. `disassembleToGroups(target)` → list of jamo per syllable.  
2. For each jamo keypress: `assemble(prefixJamo)` → current preedit syllable(s); emit composition update sequence.  
3. On syllable boundary / explicit commit: `compositionend` (+ profile-specific Enter/Space key events).  
4. Map 2벌식 jamo → physical `code` (`KeyR` for ㄱ, etc.) only if tests need layout-accurate `KeyboardEvent.code` (optional; many app bugs only care about composition + `isComposing` / 229).

Caveat: `disassemble` alone does not encode **when** Hangul IME auto-commits a previous syllable when the next choseong begins—that state machine must sit above es-hangul.

---

## 6. Issue #14 taxonomy (input-method classes)

Contributor breakdown (useful for scoping v1 vs later):

1. **Composition (preedit)** — Korean Hangul; `composition*` + `isComposing`  
2. **Conversion (candidates)** — CJK candidate window; Enter/Space/Arrows collide with app shortcuts  
3. **Code input** — romaji/pinyin/Wubi; typed Latin ≠ output  
4. **Replacement** — Telex/VNI, dead keys  
5. **Joining / combining / bidi controls** — Arabic, ZWJ, grapheme length  
6. **Third-party tools** — Google Input Tools, etc. (likely out of scope)

**Pragmatic v1 for a test library:** Hangul composition (1) + Enter-during-commit profiles (Safari vs Chromium) + keyCode 229 / `isComposing` fidelity. Conversion candidates (2) second. OS injection as an optional E2E backend later.

---

## 7. user-event typing pipeline (GitHub main)

Source of truth: [testing-library/user-event](https://github.com/testing-library/user-event) (not installed `node_modules`).

1. [`type`](https://github.com/testing-library/user-event/blob/main/src/utility/type.ts) → click → [`keyboard(text)`](https://github.com/testing-library/user-event/blob/main/src/keyboard/index.ts)
2. `parseKeyDef` + US [`defaultKeyMap`](https://github.com/testing-library/user-event/blob/main/src/keyboard/keyMap.ts)
3. Per key: [`KeyboardHost.keydown`](https://github.com/testing-library/user-event/blob/main/src/system/keyboard.ts) → optional `keypress` → `keyup`
4. Printable insert: [`behavior.keypress`](https://github.com/testing-library/user-event/blob/main/src/event/behavior/keypress.ts) → [`input(..., 'insertText')`](https://github.com/testing-library/user-event/blob/main/src/event/input.ts)

Hangul syllables are treated as single `key` characters with no composition session. Open issue: [#1097](https://github.com/testing-library/user-event/issues/1097).

Capture tooling in this repo: Storybook story **IME / Event Logger** (`apps/react-example`, `bun run storybook` → port 6006).

## Design recommendations for an IME emulation layer


1. **Two backends**
   - **Synthetic (default):** dispatch trusted-looking event sequences in jsdom / browser; parameterize with `profile: 'chromium' | 'webkit' | 'firefox'`.
   - **Engine (optional, Chromium):** CDP `Input.imeSetComposition` + `Input.insertText` when running under Vitest browser / Playwright.

2. **API shape (sketch)**
   - High-level: `actions.typeIme(target, "한글", { profile, commit: 'enter' | 'next-syllable' | 'escape' })`
   - Low-level: `compositionStart` / `compositionUpdate` / `compositionEnd` / `imeKeydown` steps for editor authors.

3. **Always emit**
   - `compositionstart|update|end`
   - `beforeinput`/`input` with `insertCompositionText` during updates
   - `keydown`/`keyup` with `key: 'Process'`, `keyCode: 229`, `isComposing` per profile
   - Commit-key variants including WebKit’s “end then Enter with isComposing false”

4. **Do not rely on** user-event, Cypress `cy.type`, or Playwright `keyboard.type` for Hangul composition fidelity.

5. **Use `es-hangul`** (`disassembleToGroups` + `assemble`) for Korean preedit progression; keep a small Hangul IME state machine for inter-syllable commit.

6. **Test the library against golden event traces** captured from real browsers (one fixture per profile), not against app assertions alone.

---

## Primary sources

- [MDN — keydown with IME](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime)
- [W3C Input Events Level 2 — composition order / insertCompositionText](https://www.w3.org/TR/input-events-2/)
- [W3C input-events PR #122 — remove insertFromComposition](https://github.com/w3c/input-events/pull/122)
- [Square — Understanding Composition Browser Events](https://developer.squareup.com/blog/understanding-composition-browser-events/)
- [stum.de — Handling IME events in JavaScript](https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/)
- [contenteditable.lab — IME & composition](https://contenteditable.realerror.com/docs/ime-composition/)
- [Playwright #5777 — IME support](https://github.com/microsoft/playwright/issues/5777)
- [Playwright keyboard docs](https://playwright.dev/docs/api/class-keyboard)
- [CDP Input domain](https://chromedevtools.github.io/devtools-protocol/tot/Input/)
- [testing-library/user-event #1097](https://github.com/testing-library/user-event/issues/1097)
- [es-hangul disassemble / assemble](https://es-hangul.slash.page/en/docs/api/core/disassemble)
- Local: GitHub issue #14, `CONTEXT.md`, `packages/core/src/action.ts`
