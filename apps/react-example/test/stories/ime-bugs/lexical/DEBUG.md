# Lexical composition debugging

Lexical #6377 fix work needs visibility into **both** DOM events and Lexical's internal composition state (`LexicalEvents.ts` in [facebook/lexical](https://github.com/facebook/lexical)).

## Tools

| File | Role |
| ---- | ---- |
| `readLexicalCompositionSnapshot.ts` | Reads `$getRoot()` text, DOM text, `editor.isComposing()`, `_inputState.compositionPhase` |
| `lexicalCompositionDebugLog.ts` | Append-only log + `dump()` for test failure messages |
| `LexicalCompositionDebugPlugin.tsx` | Records DOM capture/bubble + `INPUT_COMMAND`, `CONTROLLED_TEXT_INSERTION_COMMAND`, composition commands |
| `LexicalLogger.ime.debug.test.tsx` | AF fixed trace test; dumps log on mismatch |

## Usage in tests

```tsx
const debugLog = createLexicalCompositionDebugLog();
render(<LexicalLogger mode="fixed" debugLog={debugLog} editorRef={editorRef} />);
// on failure: console.log(debugLog.dump());
```

Pass the same `debugLog` to `LexicalAndroidFirefoxCompositionFixPlugin` (via `LexicalLogger`) to see `fix-plugin:*` actions.

## Key Lexical internals (Firefox)

From `packages/lexical/src/LexicalEvents.ts`:

- `compositionend` → `compositionPhase = 'ending-firefox'` (does **not** dispatch `COMPOSITION_END_COMMAND` yet)
- Next `input` with `insertCompositionText` → `$handleInput` → `$onCompositionEndImpl` + `CONTROLLED_TEXT_INSERTION_COMMAND`
- `COMPOSITION_START_CHAR` = NBSP on Firefox (fix plugin replaces with ZWSP)

## AF fixed golden failure mode (debug trace)

1. During composition: IME sends preedit `ㅏ…` instead of `가…` — fix plugin rewrites via `INPUT_COMMAND`.
2. After `compositionend`: Firefox deferred `input` (`isComposing: false`) sends `ㅏ나다` again.
3. Lexical dispatches `CONTROLLED_TEXT_INSERTION_COMMAND` with raw `ㅏ나다`, overwriting corrected `가나다`.
4. Fix: skip redundant `CONTROLLED_TEXT_INSERTION` when root already equals `가${payload.slice(1)}`.

Run trace test:

```bash
cd apps/react-example && bun run test LexicalLogger.ime.debug.test.tsx
```
