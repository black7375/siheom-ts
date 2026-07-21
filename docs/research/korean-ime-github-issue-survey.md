# Research: Korean / CJK IME GitHub issue survey for Storybook candidates

**Date:** 2026-07-21  
**Scope:** Harvest browser-reproducible Korean (and closely related CJK) IME failures from GitHub, map them onto siheom `ime-bugs` failure modes, and shortlist Storybook logger candidates.  
**Related:** [`docs/research/ime-browser-event-emulation.md`](./ime-browser-event-emulation.md), [`apps/react-example/test/stories/ime-bugs/`](../../apps/react-example/test/stories/ime-bugs/), [`packages/ime/src/profiles/profiles.ts`](../../packages/ime/src/profiles/profiles.ts).

**Out of this pass:** implementing Logger stories, committing fixture JSON, Windows OS capture (profile id `windows-chrome-ms` already exists but has no `ime-bugs` goldens yet).

---

## Method

1. **Harvest** — `gh issue list --repo <repo> --search "korean OR hangul OR IME OR composition OR CJK"` on editor and widget repos; plus global `gh search issues "korean IME"`.
2. **Filter** — keep browser / contenteditable / web form cases; drop CLI/TUI, native terminals, OS IME apps.
3. **Classify** — map each In-scope issue to the taxonomy below.
4. **Verify** — mark `Verified` only when reproduced in this project’s investigation (or explicitly confirmed by the survey requester); otherwise `Reported-only` / `Blocked`.
5. **Shortlist** — P0–P2 Storybook candidates with suggested `ime-bugs/<slug>/` folders and profile gaps.

Primary search entry points:

- [GitHub issues: `korean ime`](https://github.com/search?q=korean+ime&type=issues)
- Lexical label [`composition`](https://github.com/facebook/lexical/labels/composition)

---

## Taxonomy

### Existing classes (already in `ime-bugs/`)

| Mode | Folder | Symptom |
|------|--------|---------|
| **enter-submit** | `enter-submit/` | Confirm Enter after / during composition submits the form |
| **focus-steal** | `focus-steal/` | DOM focus / highlight on `input` aborts Hangul → 풀어쓰기 |
| **delayed-update** | `delayed-update/` | Stale controlled `value` writeback mid-composition |
| **maxlength** | `maxlength/` | `maxLength` vs Hangul preedit overflow / clamp |
| **candidate-conversion** | `candidate-conversion/` | Arrow / digit / Enter stolen from Hanja (or Chrome append `김金`) |

### New classes (editor / engine / typeahead)

| Mode | Symptom | Example sources |
|------|---------|-----------------|
| **editor-composition-break** | contenteditable / editor model desync → jamo split, duplicate, freeze | Lexical, Slate, TipTap, Quill, ProseMirror, CKEditor |
| **placeholder-interfere** | empty / placeholder DOM breaks first syllable | [Slate #5989](https://github.com/ianstormtaylor/slate/issues/5989) |
| **collab-during-composition** | remote op / collaborator cursor / Yjs vs preedit | [TipTap #5250](https://github.com/ueberdosis/tiptap/issues/5250), [Quill #4449](https://github.com/slab/quill/issues/4449) |
| **typeahead-slash** | `/` commands or typeahead consume IME keystrokes / drop preceding Hangul | [Excalidraw #11042](https://github.com/excalidraw/excalidraw/issues/11042), [floating-ui #3106](https://github.com/floating-ui/floating-ui/issues/3106) |
| **engine-firefox-android** | Android Firefox event order / composition differs from Android Chrome and desktop Firefox | [Lexical #6377](https://github.com/facebook/lexical/issues/6377) |

Modes can stack (e.g. Slate Android = `editor-composition-break` + `placeholder-interfere`).

---

## Platform / profile matrix

Registered `@siheom/ime` profiles today ([`profiles.ts`](../../packages/ime/src/profiles/profiles.ts)):

| Profile id | Coverage in `ime-bugs` fixtures |
|------------|----------------------------------|
| `linux-chrome-ibus-hangul` | yes (`linux-ibus-hangul-chrome/`) |
| `macos-chrome-apple` | yes |
| `macos-safari-apple` / `macos-safari` | yes (Safari) |
| `android-chrome` | yes |
| `windows-chrome-ms` | registered; **no** `ime-bugs` fixture dirs yet |
| `chromium-enter-229`, `chromium-cdp` | test / CDP helpers |

**Gaps called out by this survey:**

| Proposed fixture dir / profile | Why |
|--------------------------------|-----|
| `android-firefox/` (+ new profile facets) | Lexical #6377 — broken on AF, OK on Android Chrome & Linux Firefox |
| `linux-firefox/` | Control capture: desktop Firefox often OK where AF fails |
| Windows fixture dirs under each bug | `windows-chrome-ms` exists but uncaptured for stories |

Suggested future profile facets (open questions for `@siheom/ime`):

- Does Android Firefox use `hangulCompositionBoundary: "run"` like `android-chrome`, or syllable?
- Are `beforeinput` / `input` `inputType` values and key `Unidentified` vs `Process` the same as Chrome?
- Is Enter-during-composition closer to `webkit` or a Firefox-specific order?

---

## Verification status

| Case | Status | Notes |
|------|--------|-------|
| Lexical playground Hangul on **Android Firefox** → 풀어쓰기; **Android Chrome** OK; **Linux Firefox** OK | **Verified** (survey requester) | Matches [Lexical #6377](https://github.com/facebook/lexical/issues/6377) |
| Slate: first Hangul syllable fails composition (placeholder / empty) | **Verified** (survey requester) | Aligns with [Slate #5989](https://github.com/ianstormtaylor/slate/issues/5989) / related Android empty-editor reports |
| TipTap general Hangul typing | **Verified OK** (survey requester) | Still harvest Enter / collab issues as Reported-only |
| Quill #4357 change lag, TipTap #5605 Enter, CodeMirror #1403, Excalidraw #11042 | **Reported-only** | Not re-run in this pass |
| iOS Safari / WKWebView (CKEditor #19648, Quill #3827) | **Blocked** | No iOS device in this pass → capture backlog |
| Windows MS IME (ProseMirror #1551, ant-design #58210) | **Blocked** | Windows capture backlog (after this survey) |

Fixture JSON was **not** captured in this pass (per plan).

---

## Harvest: In-scope issues

Columns: **Mode** = primary failure mode; **Repro** = public playground / demo when known.

### Editors

| Repo | # | Title | State | Env (from issue) | Mode | Repro |
|------|---|-------|-------|------------------|------|-------|
| [facebook/lexical](https://github.com/facebook/lexical) | [6377](https://github.com/facebook/lexical/issues/6377) | CJK composition broken in android firefox | OPEN | Android Firefox (default KB); Chrome / mac Firefox OK | engine-firefox-android + editor-composition-break | https://playground.lexical.dev |
| facebook/lexical | [4753](https://github.com/facebook/lexical/issues/4753) | Cursor positioning during Korean composition (fonts) | OPEN | Chrome | editor-composition-break | playground |
| facebook/lexical | [8834](https://github.com/facebook/lexical/issues/8834) | Committing IME with mouse click scrolls viewport | OPEN | Korean IME | editor-composition-break | — |
| facebook/lexical | [8596](https://github.com/facebook/lexical/issues/8596) | Tab + Korean IME freezes editor in Safari | CLOSED | macOS Safari | editor-composition-break | playground |
| [ianstormtaylor/slate](https://github.com/ianstormtaylor/slate) | [5989](https://github.com/ianstormtaylor/slate/issues/5989) | Hangul breaks on first char when placeholder visible | OPEN | Android Chrome | placeholder-interfere | https://www.slatejs.org/examples/richtext |
| ianstormtaylor/slate | [4693](https://github.com/ianstormtaylor/slate/issues/4693) | Android editable does not support Korean composition | OPEN | Android | editor-composition-break | slatejs.org richtext |
| ianstormtaylor/slate | [4400](https://github.com/ianstormtaylor/slate/issues/4400) | AndroidEditable interfering with IME | OPEN | Android Chrome | editor-composition-break | — |
| ianstormtaylor/slate | [5014](https://github.com/ianstormtaylor/slate/issues/5014) | CJK duplicated and crash on Firefox | OPEN | Firefox desktop | editor-composition-break | slatejs.org richtext |
| ianstormtaylor/slate | [5493](https://github.com/ianstormtaylor/slate/issues/5493) | First letter typing twice on Android | OPEN | Android | editor-composition-break | slatejs.org |
| ianstormtaylor/slate | [3882](https://github.com/ianstormtaylor/slate/issues/3882) | IME bug when typing in empty richtext | OPEN | — | placeholder-interfere | richtext example |
| ianstormtaylor/slate | [5830](https://github.com/ianstormtaylor/slate/issues/5830) | `onBlur` not called while composing | OPEN | JA/KO IME, empty area | editor-composition-break | StackBlitz in issue |
| [ueberdosis/tiptap](https://github.com/ueberdosis/tiptap) | [5605](https://github.com/ueberdosis/tiptap/issues/5605) | Last character disappears when Enter after Korean | OPEN | Chrome | enter-submit / editor-composition-break | — |
| ueberdosis/tiptap | [5250](https://github.com/ueberdosis/tiptap/issues/5250) | Korean + collaborator cursor → text disappears | OPEN | collab | collab-during-composition | — |
| ueberdosis/tiptap | [6838](https://github.com/ueberdosis/tiptap/issues/6838) | Floating menu does not respond to Korean | OPEN | — | typeahead-slash (menu regex) | tiptap custom menus docs |
| ueberdosis/tiptap | [5928](https://github.com/ueberdosis/tiptap/issues/5928) | max length truncates with CJK IME | OPEN | — | maxlength | — |
| ueberdosis/tiptap | [4108](https://github.com/ueberdosis/tiptap/issues/4108) | CJK last char disappears on newline | OPEN | — | enter-submit / editor-composition-break | — |
| ueberdosis/tiptap | [4606](https://github.com/ueberdosis/tiptap/issues/4606) | Android: first letter on blank line fires compositionend | OPEN | Android | editor-composition-break | — |
| [slab/quill](https://github.com/slab/quill) | [3827](https://github.com/slab/quill/issues/3827) | iOS Korean IME bug | OPEN | iOS | editor-composition-break | — |
| slab/quill | [4357](https://github.com/slab/quill/issues/4357) | Korean: change event one letter late | OPEN | — | delayed-update (event lag) | — |
| slab/quill | [4449](https://github.com/slab/quill/issues/4449) | 3-set Korean IME + collaborative sync wrong | OPEN | collab | collab-during-composition | — |
| slab/quill | [3143](https://github.com/slab/quill/issues/3143) | IME / composing breaks when receiving ops | OPEN | collab | collab-during-composition | — |
| slab/quill | [4748](https://github.com/slab/quill/issues/4748) | Android: select-all then type — composition starts on 2nd letter | OPEN | Android | placeholder-interfere / editor-composition-break | — |
| [codemirror/dev](https://github.com/codemirror/dev) | [1403](https://github.com/codemirror/dev/issues/1403) | Enter after Korean → duplicate line break (Safari) | OPEN | Safari macOS | enter-submit (editor newline) | — |
| [ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5) | [19648](https://github.com/ckeditor/ckeditor5/issues/19648) | iOS Korean IME removes inline formatting | OPEN | iOS Safari / WKWebView | editor-composition-break | — |
| ckeditor/ckeditor5 | [19720](https://github.com/ckeditor/ckeditor5/issues/19720) | Sometimes Korean letters are not combined | OPEN | demo classic | editor-composition-break | https://ckeditor.com/ckeditor-5/demo/ |
| ckeditor/ckeditor5 | [15616](https://github.com/ckeditor/ckeditor5/issues/15616) | Mention dropdown waits until composition finishes | OPEN | Korean | candidate-conversion / typeahead | — |
| [ProseMirror/prosemirror](https://github.com/ProseMirror/prosemirror) | [1551](https://github.com/ProseMirror/prosemirror/issues/1551) | CJK × Windows × Chromium duplicate/remove on click | OPEN | Windows Chrome/Edge | editor-composition-break | — |
| ProseMirror/prosemirror | [1014](https://github.com/ProseMirror/prosemirror/issues/1014) | Stored marks / mark cursor breaks Korean on Windows | OPEN | Windows | editor-composition-break | PM demo |
| [handlewithcarecollective/react-prosemirror](https://github.com/handlewithcarecollective/react-prosemirror) | [233](https://github.com/handlewithcarecollective/react-prosemirror/issues/233) | Cancel unmarked Korean composition mid marks → wrong insert | OPEN | Chrome | editor-composition-break | — |
| [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) | [11042](https://github.com/excalidraw/excalidraw/issues/11042) | Text before `/q` disappears after Korean IME | OPEN | — | typeahead-slash | Excalidraw app |
| [summernote/summernote](https://github.com/summernote/summernote) | [4676](https://github.com/summernote/summernote/issues/4676) | Copied Korean letter issue when typing | OPEN | — | editor-composition-break | — |

**In-scope editor rows above: 31** (exceeds ≥20 success criterion when combined with widgets).

### Forms / widgets (non-editor)

| Repo | # | Title | State | Env | Mode | Maps to existing story? |
|------|---|-------|-------|-----|------|-------------------------|
| [PostHog/posthog](https://github.com/PostHog/posthog) | [60044](https://github.com/PostHog/posthog/issues/60044) | Enter submits forms during IME composition | OPEN | CJK IME | enter-submit | Yes — `enter-submit/` |
| [ariakit/ariakit](https://github.com/ariakit/ariakit) | [6663](https://github.com/ariakit/ariakit/issues/6663) | Combobox `autoSelect` breaks Korean composition | CLOSED | 2벌식 | focus-steal | Yes — `focus-steal/` |
| [JedWatson/react-select](https://github.com/JedWatson/react-select) | [5885](https://github.com/JedWatson/react-select/issues/5885) | Down arrow during Korean needs extra press | OPEN | macOS Chrome | candidate-conversion | Partial |
| [tusen-ai/naive-ui](https://github.com/tusen-ai/naive-ui) | [8079](https://github.com/tusen-ai/naive-ui/issues/8079) | v-model missing last composing Hangul char | OPEN | — | delayed-update | Yes (Vue → React minimal repro) |
| [ant-design/ant-design](https://github.com/ant-design/ant-design) | [58210](https://github.com/ant-design/ant-design/issues/58210) | Hover dropdown closes during Chinese IME (Windows) | OPEN | Windows | focus-steal / overlay | Windows backlog |
| [floating-ui/floating-ui](https://github.com/floating-ui/floating-ui) | [3106](https://github.com/floating-ui/floating-ui/issues/3106) | typeAhead `typedString` gets jamo not syllable | OPEN | Korean | typeahead-slash | New |

Widget rows reinforce that many “app bugs” are the same five classes already covered by plain `<input>` stories; editors add the five new classes.

---

## Out of scope (sample)

Not pursued for Storybook / `@siheom/ime` (non-browser or non-web composition surface):

| Example | Why out |
|---------|---------|
| [ghostty-org/ghostty #13235](https://github.com/ghostty-org/ghostty/issues/13235) | Native terminal |
| [anthropics/claude-code](https://github.com/anthropics/claude-code/issues) Korean IME CLI / Windows Terminal issues | TUI / terminal |
| [warpdotdev/warp](https://github.com/warpdotdev/warp/issues/8919), [xtermjs/xterm.js #6045](https://github.com/xtermjs/xterm.js/issues/6045) | Terminal / PTY |
| [zed-industries/zed #46319](https://github.com/zed-industries/zed/issues/46319) Hanja key | Native editor |
| [florisboard/florisboard #2004](https://github.com/florisboard/florisboard/issues/2004) | OS keyboard itself |
| Ink / React CLI apps | No DOM composition events |

Electron/WebView apps (VS Code find box, Anytype, Notesnook) sit on the boundary: only interesting if we can host the same web input surface in Storybook.

---

## Storybook candidate shortlist

Reuse existing capture chrome: [`ImeCaptureShell`](../../apps/react-example/test/stories/ime-logger/), [`imeBugLoggerChrome`](../../apps/react-example/test/stories/ime-bugs/shared/imeBugLoggerChrome.tsx). Prefer **local minimal editor mount** (not iframe-only) so `attachImeRecorder` / inputRef targets our DOM.

| Pri | Suggested folder | Source | Broken scenario | New profile / fixtures | Deps |
|-----|------------------|--------|-----------------|------------------------|------|
| **P0** | `ime-bugs/lexical-android-firefox/` | [Lexical #6377](https://github.com/facebook/lexical/issues/6377) | Type `안녕하세요` fast → jamo split | `android-firefox/` (+ optional `linux-firefox/` control) | `@lexical/react` (+ core) in `react-example` |
| **P0** | `ime-bugs/slate-placeholder-hangul/` | [Slate #5989](https://github.com/ianstormtaylor/slate/issues/5989) | Empty editor + placeholder; first Hangul syllable fails | `android-chrome/` (extend); compare desktop Chrome | `slate` + `slate-react` |
| **P1** | `ime-bugs/tiptap-korean-enter/` | [TipTap #5605](https://github.com/ueberdosis/tiptap/issues/5605) | Hangul then Enter → last syllable dropped | Cross-check Safari / Chrome enter facets | `@tiptap/react` + starter-kit |
| **P1** | `ime-bugs/codemirror-safari-enter/` | [CodeMirror #1403](https://github.com/codemirror/dev/issues/1403) | Hangul then Enter → duplicate newline (Safari) | `macos-safari-apple/` | `codemirror` |
| **P1** | `ime-bugs/excalidraw-slash-hangul/` | [Excalidraw #11042](https://github.com/excalidraw/excalidraw/issues/11042) | Hangul then `/q` drops preceding text | Desktop Chrome first | `@excalidraw/excalidraw` (heavy) or minimal slash+IME demo |
| **P2** | `ime-bugs/quill-change-lag/` | [Quill #4357](https://github.com/slab/quill/issues/4357) / [#3827](https://github.com/slab/quill/issues/3827) | change one letter late; iOS | iOS backlog | `quill` |
| **P2** | `ime-bugs/ckeditor-mention-hangul/` | [CKEditor #15616](https://github.com/ckeditor/ckeditor5/issues/15616) | Mention waits for compositionend | — | CKEditor 5 build |
| **P2** | (or extend `delayed-update/`) | [naive-ui #8079](https://github.com/tusen-ai/naive-ui/issues/8079) | Bound state missing composing syllable | Already have delayed-update | React-controlled mirror, no Vue |

### Capture procedure (when implementing)

Same as existing bugs ([e.g. enter-submit `fixtures/README.md`](../../apps/react-example/test/stories/ime-bugs/enter-submit/fixtures/README.md)):

1. Add `plan.md` Behaviors checklist + `*Logger.tsx` / `*Logger.stories.tsx` (`title: "IME/…"`).
2. `bun run storybook` → open Capture story → set OS / browser / IME → type scenario → download JSON.
3. Save under `fixtures/<platform-dir>/broken-*.json` (and `fixed-*` if a fixed mode exists).
4. Wire `*.ime.test.tsx` via `runWithImeSiheom` / profile id.
5. Document dirs in `fixtures/README.md`.

For P0 Lexical/Slate: start with **broken-only** logger (no “fixed” editor fork until a known mitigation exists); optional side-by-side plain `<textarea>` as control.

---

## Mapping: harvest → existing stories

| Existing story | External issues that are the same class |
|----------------|----------------------------------------|
| `enter-submit/` | PostHog #60044; TipTap #5605 / #4108; CodeMirror #1403 (newline variant) |
| `focus-steal/` | Ariakit #6663 (closed); ant-design #58210 (overlay) |
| `delayed-update/` | naive-ui #8079; Quill #4357 |
| `maxlength/` | TipTap #5928 |
| `candidate-conversion/` | react-select #5885; CKEditor mention #15616 |

These do **not** need new folders unless we want an editor-shaped demo of the same class.

---

## Open questions for `@siheom/ime`

1. **Android Firefox profile** — capture a continuous Hangul run on Lexical (or plain contenteditable) and diff against `android-chrome` goldens: composition boundary, key names, Enter order, `inputType`.
2. **Desktop Firefox** — confirm whether Slate #5014 still reproduces on current Firefox; if yes, may need `linux-firefox` / `macos-firefox` profiles even when Lexical is OK.
3. **Windows** — fill `windows-chrome-ms` fixture dirs for existing five bugs before adding editor stories (plan backlog).
4. **Emulation fidelity for editors** — plain-input profiles may be insufficient when the editor rewrites DOM during `compositionupdate`; P0 stories validate whether `createImeActions` + contenteditable needs an editor-specific settle path.

---

## Success criteria check

| Criterion | Result |
|-----------|--------|
| ≥20 In-scope issues classified | **Yes** — 31 editor + 6 widget rows |
| P0 verified or reproduction documented | **Yes** — Lexical #6377 and Slate placeholder/first-char **Verified** by survey requester |
| Next agent can start P0 `plan.md` + Logger | **Yes** — shortlist table has folder, source, scenario, deps, fixture dirs |

---

## Primary sources

- [GitHub search: korean ime (issues)](https://github.com/search?q=korean+ime&type=issues)
- [Lexical #6377 — CJK composition broken in android firefox](https://github.com/facebook/lexical/issues/6377)
- [Slate #5989 — Hangul first character + placeholder (Android Chrome)](https://github.com/ianstormtaylor/slate/issues/5989)
- [TipTap #5605 — last character disappears on Enter after Korean](https://github.com/ueberdosis/tiptap/issues/5605)
- [CodeMirror #1403 — Safari duplicate line break after Korean](https://github.com/codemirror/dev/issues/1403)
- [Excalidraw #11042 — `/q` drops preceding Korean](https://github.com/excalidraw/excalidraw/issues/11042)
- [Quill #3827](https://github.com/slab/quill/issues/3827), [#4357](https://github.com/slab/quill/issues/4357), [#4449](https://github.com/slab/quill/issues/4449)
- [CKEditor #15616](https://github.com/ckeditor/ckeditor5/issues/15616), [#19648](https://github.com/ckeditor/ckeditor5/issues/19648), [#19720](https://github.com/ckeditor/ckeditor5/issues/19720)
- [ProseMirror #1551](https://github.com/ProseMirror/prosemirror/issues/1551), [#1014](https://github.com/ProseMirror/prosemirror/issues/1014)
- [PostHog #60044](https://github.com/PostHog/posthog/issues/60044), [Ariakit #6663](https://github.com/ariakit/ariakit/issues/6663), [naive-ui #8079](https://github.com/tusen-ai/naive-ui/issues/8079), [react-select #5885](https://github.com/JedWatson/react-select/issues/5885), [floating-ui #3106](https://github.com/floating-ui/floating-ui/issues/3106), [ant-design #58210](https://github.com/ant-design/ant-design/issues/58210)
- Local: `packages/ime/src/profiles/profiles.ts`, `apps/react-example/test/stories/ime-bugs/*`
