# Hangul compose (Phase 1)

## Goal

`composeHangul(element, text)` dispatches IME-like events so recorded traces match `linux-chrome-ibus-hangul` golden fixtures for continuous Hangul typing.

## Behaviors

- [x] Progressive jamo assembly for a target string yields the same value steps as `assemble(disassemble(text) prefixes)` (e.g. 김태희 → ㄱ…김태희)
- [x] `composeHangul` on an input for `"김"` matches golden critical fields through the first `compositionend`
- [x] `composeHangul` for `"김태희"` matches golden `continuous-hangul` critical fields (types, composition data/value, keydown Process/229/isComposing)
