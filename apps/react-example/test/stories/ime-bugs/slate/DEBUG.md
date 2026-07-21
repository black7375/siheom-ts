# Slate composition debugging

Slate #5989 fix work needs visibility into **both** DOM IME events and the fix plugin's
internal state (`compositionData`, `committed`).

## Tools

| File | Role |
| ---- | ---- |
| `readSlateCompositionSnapshot.ts` | Slate `Node.string`, DOM text (sans placeholder), fix refs |
| `slateCompositionDebugLog.ts` | Append-only log + `dump()` for test failure messages |
| `SlateCompositionDebugPlugin.tsx` | Records DOM capture/bubble; `noteSlateFixPlugin` for rewrite/noop |
| `SlateLogger.ime.debug.test.tsx` | AF fixed `가나다` trace test; dumps log on mismatch |

## Usage in tests

```tsx
const debugLog = createSlateCompositionDebugLog();
await runSiheom(
  given.render(
    <SlateLogger mode="fixed" captureTarget="slate-placeholder" debugLog={debugLog} editorRef={editorRef} />,
  ),
  actions.type(query.textbox("Slate editor"), "가나다"),
);
// on failure: console.log(debugLog.dump());
```

Pass the same `debugLog` to `SlatePlaceholderHangulFixPlugin` (via `SlateLogger`) to see
`fix-plugin:*` actions.

## What to look for

Device AF fixed capture for `가나다` shows **preedit prefix duplication / append explosion**:

| Step | composition data | visible (broken) |
| ---- | ---------------- | ---------------- |
| 가 | `가` | `가` (ok after first-syllable fix) |
| ㄴ | `가ㄴ` | `가가ㄴ` (prefix + preedit) |
| ㅏ | `가가ㄴㅏ` | `가가ㄴ가가ㄴㅏ` (append of previous visible + data) |
| … | grows | exponential |

Fix plugin entries:

- `fix-plugin:compositionstart` — records `committed` from stable syllables
- `fix-plugin:compositionupdate` — whether `applyFirstSyllableFix` ran mid-composition
- `fix-plugin:rewrite` / `noop` — decision after `setTimeout(0)` with `from`/`to`/`committed`

## Finding (2026-07-21) — AF fixed golden on Chromium Vitest

`SlateLogger.ime.debug.test.tsx` with `android-firefox-slate-placeholder-fixed` shows:

1. Composition events fire with growing `data` (`ㄱ` → `가` → `가ㄴ` → … explosion string).
2. **`visible` / `slate` / `dom` stay empty for the whole run** (`raw` is only ZWSP `\ufeff`).
3. Every `fix-plugin:noop` has `visible:""` — rewrite never triggers.
4. Final editor text is ZWSP, not the device explosion string and not `가나다`.

So the AF continuous golden **does not drive Slate's contenteditable model in Chromium Vitest** (same class of gap as AF placeholder broken Slate mount). Unit tests on `fixSlatePlaceholderHangulText` still cover the explosion math; device + debug dump validate the real fix path.

## Run

```bash
cd apps/react-example && bun run test SlateLogger.ime.debug.test.tsx
```
