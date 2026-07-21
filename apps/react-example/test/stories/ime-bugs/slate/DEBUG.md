# Slate composition debugging

## Goal

Understand Slate + Android Hangul IME well enough to keep the **official**
`placeholder` prop working. See
[`docs/research/slate-placeholder-hangul-mechanism.md`](../../../../../../docs/research/slate-placeholder-hangul-mechanism.md).

## Tools

| File | Role |
| ---- | ---- |
| `readSlateCompositionSnapshot.ts` | Slate text, DOM text, placeholder flags |
| `slateCompositionDebugLog.ts` | `dump()` for failures |
| `SlateCompositionDebugPlugin.tsx` | DOM capture/bubble |
| `SlateLogger.ime.debug.test.tsx` | Trace dump helper |

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
| `onDOMBeforeInput` | duplicate jamo skip, deferred FF insert skip, trust IME `data` when visible broken |

Vitest: `slateAndroidChromeEnv.ts` / `slateAndroidFirefoxEnv.ts` patch UA before `slate-react` init.

## Run

```bash
cd apps/react-example && bun run test SlateLogger.ime.debug.test.tsx
```
