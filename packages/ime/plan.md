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
