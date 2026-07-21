# Slate composition debugging

## Goal

Understand Slate + Android Hangul IME — **exploration, not app patches**. See
[`docs/research/slate-placeholder-exploration-hypotheses.md`](../../../../../../docs/research/slate-placeholder-exploration-hypotheses.md).

## Tools

| File | Role |
| ---- | ---- |
| `readSlateCompositionSnapshot.ts` | Slate text, DOM text, composing flags, selection |
| `slateExplorationCapture.ts` | H1 timeline, H2 domStructures, H3 sourceMapHints |
| `slate-minimal-dom-fixture.html` | H3 static repro (open on AF device) |
| `SlateLogger.tsx` | Upstream Slate + exploration JSON on download |

## Device capture

1. Focus **Slate editor** (not reference textarea) → type repro → **JSON 다운로드**.
2. Inspect `slateDebug.exploration`:
   - `timeline[]` — per-event slateText/domText/flags (H1)
   - `domStructures[]` — Slate vs textarea tree at key steps (H2)
   - `sourceMapHints[]` + `minimalFixture.path` (H3)
3. Optional H3: open `slate-minimal-dom-fixture.html` on same device, type `가`, compare.
   - **2026-07-21 gate:** minimal HTML → `가` OK; SlateLogger → `ㄱ가나다`. Bug is slate-react
     Android path, not raw contenteditable + placeholder.

## Local patch (device test)

`patches/slate-react@0.126.0.patch` — composition anchor fix in `android-input-manager`.
After `bun install`, Storybook SlateLogger should use patched slate-react.

1. `bun run storybook` → SlateLogger → type `가나다` on AF Firefox.
2. Expect **`가나다`** (not `ㄱ가나다`). JSON download optional.
3. Vitest gate: `SlateLogger.ime.android-firefox-patch.test.tsx` (first syllable replay).

## Retired

App fix modes and alt-a/b/c — see
[`slate-placeholder-fix-alternatives.md`](../../../../../../docs/research/slate-placeholder-fix-alternatives.md).
