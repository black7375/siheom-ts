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

Device v4 (`mechanism-fix-v4-still-explodes-가나다가나다.json`): fix-pair drift **0%** — pure function matches device `next`, but driving DOM each step still explodes.

### Device tri-mode compare (2026-07-21, same device session)

Fixtures: `device-tri-mode-broken-가나다.json`, `device-tri-mode-minimal-가나다x2.json`, `device-tri-mode-fixed-가나다x3.json`.

| Mode | Final `slateText` | Sessions typed | Verdict |
| ---- | ----------------- | -------------- | ------- |
| **broken** | `ㄱ가나다` | 1× `가나다` | Almost readable — one stuck leading `ㄱ` |
| **minimal** | `간ㅏ다간ㅏㄷ간ㅏ간ㄱ` | 2× (2nd explodes) | Guard alone does not help session 2+ |
| **fixed** | `가ㅏㄷ가ㅏㅏ` | 3× (patch fights IME) | Different garbage; preedit drive makes it worse |

**Session 1 (all modes identical in `events[]`):**

- IME cumulative preedit: `ㄱ` → `간` → `가나` → `가나다`.
- DOM sticks first jamo: final `value` = `ㄱ가나다` while `compositionend.data` = `가나다`.
- This is the **real single-word bug**: orphaned `ㄱ`, not exponential growth.

**Session 2+ (minimal/fixed only):**

- After first word, `keydown` reports `value: ""` — DOM wiped before next `compositionstart` while Slate model still holds fragments (`fixTrace` snap: `slateText: "ㄱ"` or longer garbage).
- Same stuck-`ㄱ` pattern on a corrupt baseline → jamo/syllable concat (`간ㅏ다…`).
- **minimal** has no `committed-preedit` — explosion is **not** caused by preedit drive; it is Slate+AF reconciliation after the first word.
- **fixed** `replaceSlateEditorPlainText` + skip-input reshuffles DOM mid-compose → shorter but still wrong (`가ㅏㄷ가ㅏㅏ`).

**Implication:** Fixing the stuck first `ㄱ` (composition range / placeholder leaf) is the right target. Driving document text during compose or after corrupt state amplifies damage. Next experiment: broken + **only** strip leading orphan jamo on `compositionend` (no during-compose rewrite)?
