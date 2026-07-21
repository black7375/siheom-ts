# @siheom/ime

## Goal

IME-faithful `fill` / `type` that plug into siheom via `overrideSiheom`, starting from Hangul composition matched to golden traces.

## Behaviors

### Hangul compose engine

- [x] Progressive jamo assembly for a target string yields the same value steps as `assemble(disassemble(text) prefixes)` (e.g. 김태희 → ㄱ…김태희)
- [x] `composeHangul` on an input for `"김"` matches golden critical fields through the first `compositionend`
- [x] `composeHangul` for `"김태희"` matches golden `continuous-hangul` critical fields (types, composition data/value, keydown Process/229/isComposing)

### createImeActions + override

- [x] `segmentTypeText` splits a type string into Hangul runs, Latin runs, and `{Key}` descriptors
- [x] `createImeActions()` returns `{ fill, type }` that compose Hangul via `composeHangul` and delegate the rest to user-event
- [x] `overrideSiheom(..., { actions: createImeActions() })` can fill `"김태희"` and fires `compositionupdate` (not only `insertText`)
- [x] `overrideSiheom` + `actions.type("김태희")` records match `continuous-hangul` golden critical fields
- [x] `mixed-en-ko`: Hangul portion of recorded events matches golden after Latin prefix
- [x] `backspace-mid` script matches golden critical fields
- [x] `arrow-edit-mid` script matches golden critical fields
- [x] `registerProfile` / resolve profile id; linux-chrome-ibus-hangul is the default Hangul profile
- [x] Enter-during-composition facets: webkit (`macos-safari`, `linux-chrome-ibus-hangul`), chromium (`chromium-enter-229`), chromium-duplicate (`windows-chrome-ms`), chromium-apple (`macos-chrome-apple`)
- [x] Hangul keydown `key` facet: `process` (Linux ibus) vs `jamo` (macOS Chrome Apple)
- [x] Hangul compose mode: `composition` vs `replacement` (macOS Safari Apple insertText path)

### Phase 4 — Bug fixtures

- [x] OS capture of focus-steal aborted composition (Storybook `IME/Focus Steal Combobox`) compared to emulator
- [x] Emulator reproduces broken 풀어쓰기 (`ㄱㅣㅁㅌㅐㅎㅡㅣ`) and fixed `김태희` via createImeActions
- [x] Enter-submit-during-composition fixture (SearchField); Linux ibus OS capture shows webkit-order Enter
- [x] Delayed controlled update (stale setState mid-composition): `settle: "macrotask"` + `deferredUpdateRace`; OS critical events matched

### Phase 5 — MaxLength during composition

- [x] `composeHangul` with `maxLength`: preedit may overflow, then the IME rejects it at commit (Chrome: empty `insertCompositionText` + `compositionend`; Safari: `deleteCompositionText` + empty `insertFromComposition`)
- [x] Host clamp during composition (fixed UI): Chrome ends silently; Safari restarts composition and fires empty `insertText`
- [x] MaxLengthField broken/fixed IME tests for linux / macOS Chrome / macOS Safari profiles
- [x] OS golden captures matched under `ime-bugs/maxlength/fixtures/` (macos-chrome-apple, macos-safari-apple)

### Coverage gaps (intentional behaviors)

- [x] `composeEnter` when not composing fires plain Enter keydown/keyup (isComposing false)
- [x] `createImeActions` type Hangul then `{Enter}` ends composition per profile
- [x] `composeBackspace` with a selection range deletes the selection (not one grapheme)
- [x] `createImeActions({ resolveElement: "sync" })` types when the element is already present
- [x] `composeArrowLeft` when not composing moves the caret left without compositionend
- [x] `fromFirstCompositionStart` returns the original list when there is no compositionstart
- [x] `consumeImeControlledWriteback` returns false when the host never marked writeback
- [x] `segmentTypeText` treats an unclosed `{` run as keys (remainder of string)
- [x] `createImeActions` types Hangul into a `<textarea>`
- [x] `createImeActions({ profile })` accepts a profile object (not only an id string)
- [x] Unknown key descriptors like `{Home}` delegate to user-event
- [x] Contenteditable targets fall back to user-event type
- [x] `composeHangul` macos-safari-apple + `maxLength`: composition path rejects overflow (deleteCompositionText / empty insertFromComposition)
- [x] `composeHangul` macos-safari-apple + `settle: "macrotask"`: multi-syllable composition commits between syllables
- [x] `composeHangul` macos-safari-apple + maxLength host clamp: empty `insertText` reject (fixed UI)

### Phase 6 — Hanja candidate conversion (`@siheom/ime/hanja`)

- [x] `ImeProfile.hanjaConversion`: `replace` (default / Safari) vs `append` (macos-chrome-apple)
- [x] `composeHanjaConversion` first syllable matches macos-chrome-apple golden critical path through `김金`
- [x] `composeHanjaConversion` first syllable matches macos-safari-apple golden critical path (replace → `金`)
- [x] `typeHanja(element, "金泰熙", "김태희")` plays full name on Chrome append and Safari replace profiles
- [x] `@siheom/ime/hanja` subpath exports `typeHanja` / `composeHanjaConversion` (main entry does not)
- [x] `typeHanja` Chrome append: conversion+confirm critical events match `fixed-hanja-name` through first syllable (Alt → last critical while value still `김金`)
### Coverage gaps (hanja)

- [x] `createHanjaActions({ resolveElement: "sync" })` types when the element is already present
- [x] `createHanjaActions` typeHanja rejects non-input targets (e.g. contenteditable)
- [x] `createHanjaActions` types Hanja into a textarea

### Phase 7 — Android Chrome profile

OS captures under `apps/react-example/.../fixtures/android-chrome/` (virtual keyboard: `key: "Unidentified"`, `code: ""`, often one composition run for a whole Hangul string; Enter is webkit-order).

- [x] (structural) `ImeProfile.hangulCompositionBoundary`: `syllable` | `run`; existing builtins default to `syllable`
- [x] `HangulKeyEventKey` includes `unidentified`; `resolveProfile("android-chrome")` returns webkit Enter, unidentified keys, composition Hangul, replace Hanja, run boundary
- [x] Hangul keydown/keyup with `unidentified` emit `key: "Unidentified"`, `keyCode: 229`, `code: ""`
- [x] `composeHangul` with android-chrome for `"김태희"` matches android `continuous-hangul` critical fields (single run composition + Unidentified keys)
- [ ] `composeEnter` during composition on android-chrome matches android `fixed-김-enter` critical order (compositionend → Enter 13 `isComposing: false`)
- [ ] `createImeActions({ profile: "android-chrome" }).type("김태희")` matches android continuous-hangul critical fields
- [ ] android maxlength host-clamp (fixed): overflow `insertCompositionText` keeps overflow `data` with clamped `value` (no Chrome empty-data + compositionend reject)
- [ ] android delayed-update: `settle: "macrotask"` + deferred writeback reproduces broken 풀어쓰기 / fixed `김태희` against android fixtures
- [ ] (N/A) arrow-edit-mid — android capture has no ArrowLeft (virtual keyboard mid-edit)
- [ ] (N/A) hanja Alt+Enter — android uses candidate-tap replace; broken≈fixed on captures
