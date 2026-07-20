# @siheom/ime-cdp

## Goal

Chromium CDP (`Input.imeSetComposition`) Hangul backend for Vitest browser mode.
Does not replace `@siheom/ime` — engine-path ATDD / golden capture alongside synthetic emulation.

## Behaviors

### Phase 1 — composeHangulCdp

- [x] `김` via CDP leaves `input.value === "김"`
- [x] `attachImeRecorder` captures compositionstart / compositionupdate / compositionend
- [x] `김태희` critical events match `fixtures/chromium-cdp/continuous-hangul.json`
- [x] Spike notes: imeSetComposition → insertText commit order documented in composeHangulCdp.ts

### Phase 2 — createCdpImeActions

- [x] `segmentTypeText("hello김태희")` — Latin via userEvent, Hangul via CDP
- [x] `overrideSiheom` + `createCdpImeActions` fill/type Hangul

### Phase 3 — ATDD

- [x] `buildChromiumCdpTrace` produces profileId `chromium-cdp`, source `cdp`
- [x] `diffCriticalTraces` returns structured diffs (informational, not CI fail)
- [x] `@siheom/ime` registers `chromium-cdp` profile

### Phase 4 — Example

- [x] react-example browser IME test with `runWithCdpImeSiheom`
