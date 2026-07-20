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
- [x] Enter-during-composition facets: webkit (`macos-safari`), chromium (`linux-chrome-ibus-hangul`), chromium-duplicate (`windows-chrome-ms`)

### Phase 4 — Bug fixtures

- [x] OS capture of focus-steal aborted composition (Storybook `IME/Focus Steal Combobox`) compared to emulator
- [x] Emulator reproduces broken 풀어쓰기 (`ㄱㅣㅁㅌㅐㅎㅡㅣ`) and fixed `김태희` via createImeActions
- [x] Enter-submit-during-composition fixture (SearchField); Linux ibus OS capture shows webkit-order Enter
- [x] Delayed controlled update (stale setState mid-composition): `settle: "macrotask"` + `deferredUpdateRace`
- [ ] Optional: maxlength during composition fixture
