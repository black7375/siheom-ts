# Slate composition debugging

## Goal

Understand Slate + Android Hangul IME — **exploration, not app patches**. See
[`docs/research/slate-placeholder-exploration-hypotheses.md`](../../../../../../docs/research/slate-placeholder-exploration-hypotheses.md).

## Tools

| File | Role |
| ---- | ---- |
| `readSlateCompositionSnapshot.ts` | Slate text, DOM text, composing flags, selection |
| `slateCompositionDebugLog.ts` | `toExport()` → `slateDebug.final` at download |
| `SlateLogger.tsx` | Upstream Slate capture shell |

## Device capture

1. **SlateLogger** → type repro → JSON (`scenarioId`: `slate-ac-first-hangul-placeholder`).
2. Compare with plain control (`slate-ac-plain-control`) for structural diff (H2).

## Retired

App fix modes and alt-a/b/c — see
[`slate-placeholder-fix-alternatives.md`](../../../../../../docs/research/slate-placeholder-fix-alternatives.md).
