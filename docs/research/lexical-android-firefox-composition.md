# Research: Lexical composition vs plain input for Android Firefox Hangul break

**Date:** 2026-07-21  
**Ticket:** [#41](https://github.com/twinstae/siheom-ts/issues/41) (map [#33](https://github.com/twinstae/siheom-ts/issues/33))  
**Question:** For [Lexical #6377](https://github.com/facebook/lexical/issues/6377) (CJK/Hangul → jamo on Android Firefox; Android Chrome and mac Firefox OK), is the first hypothesis **engine event sequence**, **Lexical composition/DOM sync**, or **both**? Is plain-input Storybook capture enough for an `android-firefox` profile, or is a Lexical local mount required?

**Method:** Primary sources only — Lexical issue thread, Lexical `main` composition-related source, related Lexical PRs, MDN / W3C Input Events where relevant. No device re-capture in this pass.

---

## Verdict (first hypothesis)

**Both — engine × Lexical interaction — with Lexical mount required to match #6377.**

| Claim | Confidence | Why |
|-------|------------|-----|
| Pure “Firefox compositionend-before-input” alone does **not** explain #6377 | High | Reporter: mac Firefox + Lexical works; Lexical already defers FF composition end to `input` for that order |
| Pure “Android IME” alone does **not** explain #6377 | High | Reporter: Android Chrome + Lexical works; Lexical has dedicated `IS_ANDROID_CHROME` composition mitigations |
| Android Firefox hits a **cross-product** of Firefox UA paths and non–Android-Chrome paths | High | `IS_FIREFOX` is true on AF; `IS_ANDROID_CHROME` is false; no `IS_ANDROID_FIREFOX` flag exists |
| #6377 does **not** establish whether plain `<input>` also breaks | High | Issue only cites Lexical playground; no plain-input control |
| Plain-input capture is a useful **control**, not a sufficient golden for the reported bug | High | Reported surface is Lexical contenteditable + Lexical’s composition handlers |

---

## What #6377 actually reports

Source: [facebook/lexical#6377](https://github.com/facebook/lexical/issues/6377) (opened 2024-07-08 by @scarf005; label `composition`; still open as of this research; no diagnostic comments in the thread).

**Repro surface:** https://playground.lexical.dev on Android Firefox with Android’s default keyboard; type composable Korean (e.g. `안녕하세요`).

**Observed:** Composable syllables appear as jamo (e.g. expected `안`, got `ㅇㅏㄴ`). Worse when typing fast.

**Reporter controls:**

- Android Chrome: OK  
- Mac Firefox: OK  

**Not in the thread:** comparison to plain `<input>` / `<textarea>` / vanilla `contenteditable`; Gecko bug IDs; event logs; Lexical version pin (playground only).

So the public bug is defined as **Lexical playground on Android Firefox**, not as “Hangul is broken in all AF web text fields.”

---

## Lexical composition machinery (primary source)

Core file: [`packages/lexical/src/LexicalEvents.ts`](https://github.com/facebook/lexical/blob/main/packages/lexical/src/LexicalEvents.ts) on `main`. Environment flags: [`packages/lexical/src/environment.ts`](https://github.com/facebook/lexical/blob/main/packages/lexical/src/environment.ts). Composition sentinel char: [`packages/lexical/src/LexicalConstants.ts`](https://github.com/facebook/lexical/blob/main/packages/lexical/src/LexicalConstants.ts).

### UA gates relevant to Android Firefox

From `environment.ts`:

- `IS_FIREFOX` — UA matches `Firefox` (includes Android Firefox).
- `IS_ANDROID` — UA matches `Android`.
- `IS_ANDROID_CHROME` — `IS_ANDROID && IS_CHROME`.
- There is **no** `IS_ANDROID_FIREFOX` (or similar) export.

Therefore Android Firefox evaluates as: **Firefox composition paths ON**, **Android Chrome mitigations OFF**.

### Firefox: compositionend before input

Lexical documents and implements a Firefox-specific deferral:

> Firefox fires compositionEnd before input; … Chrome/Webkit fires input first, so it dispatches immediately.

On `compositionend`, if `IS_FIREFOX`, Lexical sets `compositionPhase = 'ending-firefox'` and does **not** run `$handleCompositionEnd` immediately. The deferred end runs inside the subsequent `input` handler (`$onCompositionEndImpl` + `COMPOSITION_END_TAG`).

Introduced for emoji / composition ordering in [PR #2109](https://github.com/facebook/lexical/pull/2109) (2022). Tag emission on the Firefox defer branch was completed in [PR #8680](https://github.com/facebook/lexical/pull/8680) (2026; Korean IME + Firefox markdown shortcuts on **desktop**). Unit coverage: `LexicalFirefoxCompositionEndTag.test.ts`.

**Implication for #6377:** this FF ordering fix is active on **mac Firefox too**, where #6377 says composition works. So the deferral is necessary context for Lexical-on-Firefox, but **not a sufficient root cause** of the Android-only break.

### Firefox: NBSP as composition start sentinel

```ts
// For FF, we need to use a non-breaking space, or it gets composition
// in a stuck state.
export const COMPOSITION_START_CHAR: string = IS_FIREFOX
  ? NON_BREAKING_SPACE
  : COMPOSITION_SUFFIX;
```

On `compositionstart`, Lexical may `dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, COMPOSITION_START_CHAR)` — a **Lexical-driven DOM insertion** into the composing region before/around IME updates. That is editor sync, not plain-input behavior.

### Android Chrome-only mitigations (Android Firefox excluded)

1. **Skip ZWSP/NBSP on format/style mismatch (Android Chrome only)**  
   Unit file comment in `LexicalAndroidChromeComposition.test.ts` (primary):

   > On Android Chrome, Samsung Keyboard … caches the composing region … When Lexical inserts a ZWSP during compositionStart … Samsung's `restartInput()` … causes duplication.  
   > The fix: skip the ZWSP insertion for format/style mismatch on Android Chrome.

   In `$handleCompositionStart`, the format/style mismatch arm is gated with `(!IS_ANDROID_CHROME && …)`. Android Firefox still takes the Firefox `COMPOSITION_START_CHAR` (NBSP) path when those conditions fire.

2. **Clear composition key during composing `input` on Android Chrome**  
   In `$handleInput`, after handling insert paths:

   ```ts
   if (IS_ANDROID_CHROME && editor.isComposing()) {
     inputState.lastKeyDownTimeStamp = 0;
     $setCompositionKey(null);
   }
   ```

   Android Firefox does not enter this branch.

3. **Delete / backspace browser hand-off** also keys off `IS_ANDROID_CHROME` in the same file (less central to “jamo split while typing,” but shows AF is not covered by Android mitigations).

### Other Lexical composition notes (scope)

- iOS 10-key Korean without composition events is a separate, documented path in `LexicalEvents.ts` (`IS_IOS` + `deleteContentBackward` targetRange) — not Android Firefox.
- Safari `ending-safari` deferral ([PR #7061](https://github.com/facebook/lexical/pull/7061)) — not AF.

---

## Spec / MDN context (what engines are *allowed* to differ on)

- [Input Events Level 2](https://www.w3.org/TR/input-events-2/): during composition, after each `compositionupdate`, a `beforeinput`/`input` pair with composition `inputType`s; session ends with `compositionend`. Spec does **not** require identical ordering of `compositionend` vs final `input` across engines; Lexical’s own comments treat Firefox vs Chromium order as divergent.
- [MDN `keydown` + IME](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime): since Firefox 65, key events fire during IME; `compositionstart` may follow the opening `keydown`, and `compositionend` may precede the closing `keydown` (`isComposing` false; `keyCode` 229 still set). Documents cross-browser IME edge timing, not Android Firefox Hangul jamo break specifically.

**No MDN/W3C page found in this pass that states Android Firefox Hangul decomposes to jamo in plain inputs.** Engine divergence remains a **hypothesis to test with capture**, not a documented AF platform bug in these sources.

---

## First hypothesis (decision)

```text
                    Android Chrome          Desktop/mac Firefox
                    ──────────────          ───────────────────
Lexical playground  OK (#6377)              OK (#6377)
Plain input         (unknown in #6377)      (unknown in #6377)

Android Firefox + Lexical playground → FAIL (#6377)
```

**H1 (preferred): interaction.**  
Android Firefox emits a composition/`beforeinput`/`input` sequence (and DOM mutation sensitivity) that differs from Android Chrome **and** stresses Lexical paths that are (a) Firefox-deferred and NBSP-sentinel-based, and (b) **not** covered by `IS_ANDROID_CHROME` mitigations (especially controlled insertion on `compositionstart` and compositionKey lifecycle). Desktop Firefox is “close enough” to Lexical’s FF heuristics that the same code works there.

**H2 (engine-only):** Reject as sole explanation until a plain-input (or vanilla contenteditable) capture on the same device shows jamo break without Lexical. #6377 provides no such evidence; Lexical source shows substantial AF-relevant editor sync.

**H3 (Lexical-only, engine identical to desktop FF):** Unlikely as sole explanation: same Lexical Firefox deferral + NBSP sentinel run on mac Firefox where #6377 reports success. Something about **Android** (IME / Gecko Android / event timing) is part of the differential — either in the event stream or in how Lexical’s Android-adjacent heuristics interact with it.

---

## Recommendation for siheom `android-firefox` profile / Storybook

| Artifact | Enough for #6377? | Role |
|----------|-------------------|------|
| Plain `<input>` / Logger capture on Android Firefox | **No** (not sufficient) | **Required control:** compare event sequence + visible text vs `android-chrome` and desktop Firefox profiles. Answers H2 vs H1. |
| Lexical playground or **local `@lexical/react` mount** + same Logger | **Yes** (necessary) | Matches the only surface proven in #6377. Needed for goldens / `ime-bugs` story that claim the Lexical AF break. |

**Practical order:**

1. Capture plain-input on AF (and AC / desktop FF controls) → populate `android-firefox` **engine** facets (key codes, composition boundary, `inputType`, Enter order).  
2. Mount Lexical (minimal editor, not full playground) with the same capture shell → if jamo break reproduces only there, treat mode as `editor-composition-break` stacked on `engine-firefox-android` (as in the Korean IME survey taxonomy).  
3. Do **not** ship an `android-firefox` golden that claims #6377 fidelity from plain-input alone.

Related repo note (not a substitute for this analysis): [`korean-ime-github-issue-survey.md`](./korean-ime-github-issue-survey.md) already shortlists P0 `ime-bugs/lexical-android-firefox/` with `@lexical/react` deps.

---

## What this pass did **not** do

- Device capture on Android Firefox / Chrome.  
- Bisect which Lexical branch (`COMPOSITION_START_CHAR` insert, deferred end, compositionKey clear absence, reconcile) is the proximate DOM desync.  
- Confirm whether Gecko Android has a standalone Hangul bug outside editors.

---

## Primary sources

1. [Lexical #6377 — Bug: CJK composition broken in android firefox](https://github.com/facebook/lexical/issues/6377)  
2. [Lexical `LexicalEvents.ts` (main)](https://github.com/facebook/lexical/blob/main/packages/lexical/src/LexicalEvents.ts) — composition listeners, `ending-firefox`, Android Chrome branches, ZWSP/NBSP insertion on `compositionstart`  
3. [Lexical `environment.ts` (main)](https://github.com/facebook/lexical/blob/main/packages/lexical/src/environment.ts) — `IS_FIREFOX`, `IS_ANDROID`, `IS_ANDROID_CHROME`  
4. [Lexical `LexicalConstants.ts` (main)](https://github.com/facebook/lexical/blob/main/packages/lexical/src/LexicalConstants.ts) — `COMPOSITION_START_CHAR` NBSP on Firefox  
5. [Lexical `LexicalAndroidChromeComposition.test.ts`](https://github.com/facebook/lexical/blob/main/packages/lexical/src/__tests__/unit/LexicalAndroidChromeComposition.test.ts) — documents why ZWSP is skipped on Android Chrome only  
6. [Lexical PR #2109 — Fix Firefox composition bug with emojis](https://github.com/facebook/lexical/pull/2109) — defer composition end to `input` on Firefox  
7. [Lexical PR #8680 — Emit COMPOSITION_END_TAG from Firefox onInput defer branch](https://github.com/facebook/lexical/pull/8680) — Firefox + Korean IME (desktop) tag fix  
8. [W3C Input Events Level 2](https://www.w3.org/TR/input-events-2/) — composition / beforeinput / input model  
9. [MDN: keydown events with IME](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime) — Firefox IME key timing caveats  
