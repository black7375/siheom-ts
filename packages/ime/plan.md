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
