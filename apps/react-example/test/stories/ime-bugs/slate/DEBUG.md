# Slate composition debugging

## Goal

Understand Slate + Android Hangul IME well enough to keep the **official**
`placeholder` prop working. See
[`docs/research/slate-placeholder-hangul-mechanism.md`](../../../../../../docs/research/slate-placeholder-hangul-mechanism.md).

## Tools

| File | Role |
| ---- | ---- |
| `readSlateCompositionSnapshot.ts` | Slate text, DOM text, `IS_COMPOSING` weak-map vs React, pending diffs, selection, fix state |
| `slateFixDebugState.ts` | Per-editor `committedHangul` + fix action history |
| `slateCompositionDebugLog.ts` | `dump()`, `toExport()` for device JSON |
| `SlateLogger.tsx` | IME capture + fix-plugin rows → `slateDebug` in downloaded JSON |

## Side effects (why capture is deferred)

`onEventRecorded` → `readSlateCompositionSnapshot` must **not** run synchronously inside
`beforeinput` / composition handlers. Invasive reads break Slate Android Firefox IME replay
and likely real devices:

| Read | Risk |
| ---- | ---- |
| `cloneNode(true)` (`readSlatePlainText`) | Clones live contenteditable during composition; races Android IM |
| `getComputedStyle(placeholder)` | Forces layout mid-composition |
| `window.getSelection()` | Can desync IME vs Slate selection |
| Even `Node.string(editor)` sync in `beforeinput` | Observed to race AF golden replay |

**Strategy:**

- IME shell `events[]` still records DOM `value` via existing listener (unchanged).
- `onEventRecorded` schedules **`setTimeout(0)`** + **`passive`** snapshot (no clone/layout).
- Fixed-mode **`fix-plugin`** rows log model-only snapshot inline; `detail` already carries
  `domText` / `slateText` / `committed` for the decisions that matter.
- Full `slateDocument` clone omitted in passive mode (see export `summary`).

## Device capture (Android Firefox)

1. Open Storybook / dev build → **SlateLogger** (`slate-placeholder`, **fixed** or **broken**).
2. Meta: OS=`android`, Browser=`firefox`, IME=`hangul` (or leave as detected).
3. **Clear** → focus editor → type repro (e.g. `가나다가나다`).
4. **JSON 다운로드** — file includes:
   - `events[]` — DOM IME trace (same as before)
   - `slateDebug.entries[]` — per-event Slate snapshot (`slateText`, `domText`, `domRaw`, placeholder display, `isComposingWeak` / `isComposingReact`, `pendingDiffCount`, `committedHangul`, `slateDocument`)
   - `slateDebug.fixActions[]` — fixed-mode patch decisions only
   - `slateDebug.summary` — last texts + slate/dom mismatch count

### What to look for in captures

| Signal | Meaning |
| ------ | ------- |
| `slateText !== domText` | Slate model vs DOM diverged (explosion precursor) |
| `isComposingWeak=true`, `isComposingReact=false` | Android placeholder bug path |
| `placeholderDisplay !== "none"` during composition | Official placeholder still visible |
| `pendingDiffCount > 0` at compositionend | Android IM flush race |
| `fix:skip-input` / missing `fix:committed-preedit` | Patch not running on device |

Save to `fixtures/android-firefox/` with descriptive name.

## Rejected “fixes”

1. **Post-hoc rewrite** — `rejected-rewrite-flicker-가나다.json` (flicker).
2. **Decorative placeholder (drop official API)** — `decorative-still-explodes-가나다가나다.json`
   (still explodes; placeholder not visible). Not a fix.

## Mechanism clue (decorative AF capture)

```
ㄱ → "" (wiped)
가 → "" (wiped)
ㄱ stuck + data 가→가나다 → visible ㄱ가나다
then data = whole document + next jamo → value doubles (explosion)
```

## Fixed mode (`useSlatePlaceholderCompositionFixEditableProps`)

Keeps official `placeholder={…}`. Patches Slate Android IM interaction:

| Patch | Targets |
| ----- | ------- |
| `renderPlaceholder` + imperative hide | Android never sets React `isComposing` → placeholder stayed visible ([`editable.tsx`](https://github.com/ianstormtaylor/slate/blob/main/packages/slate-react/src/components/editable.tsx)) |
| `EDITOR_TO_FORCE_RENDER` guard while composing | AF wipe / explosion ([`android-input-manager.ts`](https://github.com/ianstormtaylor/slate/blob/main/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts) `handleDomMutations`) |
| `onDOMBeforeInput` | duplicate jamo skip, deferred FF insert skip, committed+preedit model |

Vitest: `slateAndroidChromeEnv.ts` / `slateAndroidFirefoxEnv.ts` patch UA before `slate-react` init.

## Run

```bash
cd apps/react-example && bun run test readSlateCompositionSnapshot.test.ts
cd apps/react-example && bun run test SlateLogger.ime.debug.test.tsx
```
