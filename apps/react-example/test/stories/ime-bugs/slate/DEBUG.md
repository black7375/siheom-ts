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

`readSlateCompositionSnapshot` must **not** run synchronously inside `beforeinput` handlers.
Invasive reads (`cloneNode`, `getComputedStyle`, sync `Node.string`) break Slate AF IME.

**Export shape (compact):**

| Field | Contents |
| ----- | -------- |
| `events[]` | DOM IME trace (only copy) |
| `slateDebug.fixTrace[]` | Fix-plugin steps (`composition-start`, `committed-preedit` in full fixed only, …) |
| `slateDebug.final` | Passive Slate+DOM read at JSON download |
| ~~`slateDebug.entries`~~ | Removed — duplicated every `events[]` row |

## Device capture (Android Firefox)

1. Open Storybook / dev build → **SlateLogger** (`slate-placeholder`).
2. Compare **broken → minimal → fixed** in one session (Clear between runs).
3. Meta: OS=`android`, Browser=`firefox`, IME=`hangul` (or leave as detected).
4. **Clear** → focus editor → type repro (e.g. `가나다` or `가나다가나다`).
5. **JSON 다운로드** — scenarioId suffix: `…-placeholder` (broken), `…-minimal`, `…-fixed`.
   - `events[]` — DOM IME trace
   - `slateDebug.fixTrace[]` — patch steps (`action`, `detail`, compact `snap`); minimal has no `committed-preedit`
   - `slateDebug.final` — passive Slate+DOM at download
   - `slateDebug.summary` — last slate text, committed, step count

### What to look for in captures

| Signal | Meaning |
| ------ | ------- |
| `fixTrace[].detail.domText !== detail.slateText` | Model vs DOM diverged at patch decision |
| `snap.isComposingWeak=true`, `snap.isComposingReact=false` | Android placeholder bug path |
| `final.placeholderDisplay !== "none"` after typing | Placeholder still visible |
| `snap.pendingDiffCount > 0` at `composition-end` | Android IM flush race |
| missing `committed-preedit` / only `committed-sync` | Patch not driving document during compose |

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
