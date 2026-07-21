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

## App-layer patches (retired 2026-07-21)

`minimal`, `end-only`, and `fixed` Story modes were removed. Device evidence:

- **Broken continuous** `가나다가나다` → `ㄱ가나다가나다` (only orphan `ㄱ`).
- App patches caused DOM wipe / explosion or post-hoc rewrite UX.

See [`slate-placeholder-fix-alternatives.md`](./slate-placeholder-fix-alternatives.md) for next steps.

### Device tri-mode compare (2026-07-21)

Fixtures: `device-tri-mode-broken-가나다.json`, `device-tri-mode-minimal-가나다x2.json`, `device-tri-mode-fixed-가나다x3.json`.

| Mode | Final `slateText` | Sessions typed | Verdict |
| ---- | ----------------- | -------------- | ------- |
| **broken** | `ㄱ가나다` | 1× `가나다` | Almost readable — one stuck leading `ㄱ` |
| **broken** (continuous) | `ㄱ가나다가나다` | 1 session `가나다가나다` | Still clean except leading `ㄱ` — see `device-broken-가나다가나다-continuous.json` |
| **minimal** | `간ㅏ다간ㅏㄷ간ㅏ간ㄱ` | 2× (2nd explodes) | Guard + **compositionstart select** wiped DOM between sessions |
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

**Implication:** Orphan leading `ㄱ` is the real bug. Broken continuous typing works. App patches made things worse.
