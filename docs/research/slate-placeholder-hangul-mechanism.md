# Slate #5989 — placeholder + Hangul mechanism notes

## Goal

Use Slate's **official** `placeholder` prop correctly on Android (Chrome/Firefox)
while Hangul IME composition works. Avoiding the feature (decorative overlay) is
not a fix.

## Rejected approaches

| Approach | Evidence | Why rejected |
| -------- | -------- | ------------ |
| Post-hoc text rewrite | `rejected-rewrite-flicker-가나다.json` | Fights IME; flicker `가가ㄴ`↔`가ㄴ`; ends wrong |
| Decorative overlay (no `placeholder` prop) | `decorative-still-explodes-가나다가나다.json` | Placeholder UX gone; **still explodes** on AF |

## Device finding — decorative AF `가나다가나다` (2026-07-21)

Even **without** `[data-slate-placeholder]`:

1. First jamo/syllable briefly appear then **DOM is cleared** (`ㄱ`→`""`, `가`→`""`).
2. Next session sticks a lone `ㄱ` while composition `data` advances `가→간→가나→가나다`.
3. Visible becomes `ㄱ가나다` (stuck choseong + correct preedit).
4. Later compositions put the **entire document into `data`**, and `value ≈ previous + data` → exponential growth (len 209 at end).

So AF Slate breakage is not explained by “placeholder leaf present” alone. It
looks like **Slate reconciliation fighting live IME DOM** (untracked mutations →
force re-render) plus **wrong composition range** once the document is corrupt.

Slate `androidInputManager` comments (0.126):

- IME may insert **inside** the placeholder (includes `\uFEFF`).
- Placeholder is `contenteditable=false` next to an empty text node (SwiftKey /
  keyboard issues) — hide on `keydown`.
- Tracked DOM mutations without pending action → **force re-render** (wipes IME).

## Working baselines (same device)

- Plain `<textarea>`: `가` OK.
- Linux desktop Slate + official placeholder: `가` OK.
- So the bug is Slate's Android composition path (placeholder interacts, but
  empty-editor / Android IM is deeper).

## Hypotheses for a real fix (keep official `placeholder`)

1. **Do not force-re-render while `IS_COMPOSING`** when mutations are composition
   preedit (let Android IM `storeDiff` own the DOM).
2. **Hide official placeholder before first composition** early enough for
   Firefox (today: keydown hide may be too late / missing).
3. **Composition range / selection** at `compositionstart` must be a real text
   offset, not the placeholder node (FEFF / empty leaf).
4. Chrome #5989 first-syllable jamo split may share (2)+(3); AF stuck-`ㄱ` +
   explosion may be (1)+(4).

## Fix in Story (three modes)

| Mode | Behavior |
| ---- | -------- |
| `broken` | Upstream Slate, no patch |
| `minimal` | Placeholder hide + force-render guard only (no preedit drive) |
| `fixed` | Minimal + `onDOMBeforeInput` cumulative preedit + composition-end normalize |

See `useSlatePlaceholderCompositionFixEditableProps.tsx` + `slatePlaceholderCompositionFix.ts`.

1. **Placeholder stays official** — `renderPlaceholder` hides via `display:none` while `IS_COMPOSING` (Android never flips React `isComposing`, so `showPlaceholder` stayed true).
2. **No force-re-render during composition** — wrap `EDITOR_TO_FORCE_RENDER` (MutationObserver wipe / explosion).
3. **`onDOMBeforeInput` (full fixed only, Android)** — document = cumulative IME `data` when it already includes `committed`; skip deferred duplicate/explosion; `documentAfterCompositionEnd` after flush.

Device v4 (`mechanism-fix-v4-still-explodes-가나다가나다.json`): fix-pair drift **0%** — pure function matches device `next`, but driving DOM each step still explodes. **Compare broken / minimal / fixed on device** before more recapture.
