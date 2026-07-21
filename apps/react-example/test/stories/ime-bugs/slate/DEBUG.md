# Slate composition debugging

## Goal

Understand Slate + Android Hangul IME well enough to keep the **official**
`placeholder` prop working. See
[`docs/research/slate-placeholder-hangul-mechanism.md`](../../../../../../docs/research/slate-placeholder-hangul-mechanism.md)
and fix direction
[`docs/research/slate-placeholder-fix-alternatives.md`](../../../../../../docs/research/slate-placeholder-fix-alternatives.md).

## Tools

| File | Role |
| ---- | ---- |
| `readSlateCompositionSnapshot.ts` | Slate text, DOM text, `IS_COMPOSING` weak-map vs React, pending diffs, selection |
| `slateCompositionDebugLog.ts` | `toExport()` for device JSON (`final` passive read) |
| `SlateLogger.tsx` | IME capture — modes: **broken**, **alt-a**, **alt-b**, **alt-c** |
| `useSlatePlaceholderAlternativeEditableProps.tsx` | A/B/C Editable wiring (no text rewrite) |

## Side effects (why capture is deferred)

`readSlateCompositionSnapshot` must **not** run synchronously inside `beforeinput` handlers.
Invasive reads (`cloneNode`, `getComputedStyle`, sync `Node.string`) break Slate AF IME.

**Export shape (compact):**

| Field | Contents |
| ----- | -------- |
| `events[]` | DOM IME trace |
| `slateDebug.final` | Passive Slate+DOM read at JSON download |

## Device capture (Android Firefox)

1. Open **SlateLogger** → compare **broken / alt-a / alt-b / alt-c** (Clear between runs).
2. **Clear** → type repro (e.g. `가나다가나다`) → JSON (`scenarioId` suffix: `…-alt-a`, etc.).

### What to look for in captures

| Signal | Meaning |
| ------ | ------- |
| `final.slateText` vs `events[].value` at end | Model vs DOM at download |
| `final.placeholderDisplay !== "none"` after typing | Placeholder still visible |
| Stuck leading `ㄱ` with correct `compositionend.data` | AF #5989 orphan jamo |

Save to `fixtures/android-firefox/` with descriptive name.

## Rejected app-layer patches (2026-07-21)

| Patch | Evidence |
| ----- | -------- |
| Post-hoc rewrite | `rejected-rewrite-flicker-가나다.json` |
| Decorative placeholder | `decorative-still-explodes-가나다가나다.json` |
| Preedit drive (`minimal` / `fixed`) | `device-tri-mode-*`, v4 fixture |
| End-only orphan strip | `device end-only` — correct final text, awkward UX |

## Run

```bash
cd apps/react-example && bun run test readSlateCompositionSnapshot.test.ts
cd apps/react-example && bun run test SlateLogger.ime.debug.test.tsx
```
