# Slate composition debugging

Slate #5989 fix work needs visibility into DOM IME events and whether the
**built-in placeholder leaf** is present (`[data-slate-placeholder]`).

## Tools

| File | Role |
| ---- | ---- |
| `readSlateCompositionSnapshot.ts` | Slate `Node.string`, DOM text (sans placeholder) |
| `slateCompositionDebugLog.ts` | Append-only log + `dump()` for test failure messages |
| `SlateCompositionDebugPlugin.tsx` | Records DOM capture/bubble |
| `SlateLogger.ime.debug.test.tsx` | Diagnostic dump on mismatch |
| `SlateDecorativePlaceholder.tsx` | **Current fixed-mode approach** — overlay outside contenteditable |

## Current fix (preventive)

`mode="fixed"` does **not** pass Slate's `placeholder` prop. It renders
`SlateDecorativePlaceholder` (pointer-events: none overlay) so Hangul IME never
composes next to a non-contenteditable leaf inside the editor.

Broken mode keeps Slate's built-in placeholder to reproduce #5989.

## Rejected approach — post-hoc text rewrite

Rewriting Slate document text from `compositionupdate` / `compositionend`
(`fixSlatePlaceholderHangulText` + former fix plugin) **fights the IME**:

Device capture `fixtures/android-firefox/rejected-rewrite-flicker-가나다.json`
(fixed mode + rewrite, 2026-07-21):

| t | visible `value` |
| - | --------------- |
| … | `가` |
| … | `가가ㄴ` (dup) |
| … | `가ㄴ` (rewrite shrink — **flicker**) |
| … | `가ㄴ가가ㄴㅏ` |
| … | `가가ㄴㅏ` (rewrite again) |
| … | … |
| end | `가가ㄴㅏㄷ가가ㄴㅏㄷㅏ` (still wrong) |

User report: explosion then shrink flickers; final `가가ㄴㅏㄷㅏ`-class garbage.
Unit heuristics cannot win against live composition.

`fixSlatePlaceholderHangulText*.ts(x)` kept only as historical coverage of that
failed idea.

## Emulator note

AF continuous goldens often leave Slate DOM empty under Chromium Vitest
(mount fidelity gap). Decorative-placeholder success is validated with
Linux fixed goldens in unit/integration tests; Android needs **device
recapture** with fixed mode (no rewrite).

## Run

```bash
cd apps/react-example && bun run test SlateLogger.ime.test.tsx SlateLogger.ime.debug.test.tsx
```
