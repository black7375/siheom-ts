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

## AF fixed golden (v2 device capture)

Single composition session with syllable preedit (`ㄱ→가→간→가나→가낟→가나다`), ZWSP anchor, no premature `compositionend` after first jamo. Matches LF fixed shape; deferred Firefox `input` commits `가나다` (not `ㅏ나다`).

v1 capture (superseded) had premature `compositionend` on `ㄱ`, second session with `ㅏ…` preedit → visible `ㅏ나다`; fix plugin `ㅏ→가` rewrite handled that in emulator only.

Run trace test:

```bash
cd apps/react-example && bun run test LexicalLogger.ime.debug.test.tsx
```
