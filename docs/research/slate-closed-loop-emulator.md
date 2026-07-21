# Slate AF Hangul — why open-loop replay can't guarantee the device, and the closed-loop plan

**Date:** 2026-07-21
**Context:** `@siheom/ime` milestone ([#33](https://github.com/twinstae/siheom-ts/issues/33)),
Slate placeholder Hangul on Android Firefox. Follows
[`slate-placeholder-exploration-hypotheses.md`](./slate-placeholder-exploration-hypotheses.md).

## The guarantee we want

> If the bug is fixed in **emulation**, it must be fixed on the **real device**.

For that, the emulation must be a *faithful model* of the device: replaying/driving the
same IME behaviour through the same editor must reproduce the device's outcome.

## Measured finding — open-loop replay is NOT device-faithful (even unpatched)

The current AF Slate emulation is **open-loop golden replay**
(`composeHangulAndroidFirefoxSlatePlaceholderBroken` → `replayGoldenEvents`): it re-fires a
recorded event log into a mounted Slate. Toggling the `slate-react` bun patch and replaying
device captures through real Slate (vitest browser mode) gives:

| Capture (device final) | Unpatched emulation | Patched (v2) emulation |
| ---------------------- | ------------------- | ---------------------- |
| `broken-가` (device `ㄱ`) | **`ㄱ가가`** | `가` |
| `device-explore-ㄱ가나다` (device `ㄱ`) | **`ㄱ가가`** | `가` |
| `gaga-v1` first40 (device `가가나다`) | `ㄱ가가간가나가낟가나다가나다` | `가나다` |
| `v3-가나다가나다` (device orphan `ㄱ`) | `ㄱㄱ가가간간…` (double explosion) | `ㄱ가간가나…` (explosion) |

**The unpatched emulation (`ㄱ가가`) already diverges from the device (`ㄱ`).** So a green
patched-emulation test does **not** imply the device is fixed — the model and the device
disagree before any patch.

### Why replay double-applies

The device event stream for `broken-가` fires `beforeinput(가)`/`input(가)` **twice**
(indices 8–9 and 11–12). On the device those repeats are composition-idempotent (the DOM
stays `ㄱ` — the *original* slate-react replace-failure bug). Replayed into Slate, each event
is treated as a fresh insert → `ㄱ + 가 + 가 = ㄱ가가`.

Root cause of the infidelity: **a contenteditable IME session cannot be faithfully reproduced
by re-firing recorded DOM events.** The recording already contains the browser's
post-mediation `beforeinput`/`input` (with device-specific duplications and DOM-dependent
target ranges). Slate expects to be the mediator between raw IME intent and DOM mutation;
replaying the *mediated* events double-mediates.

## Correction (2026-07-21, device) — the bug is the *composing process*, not the final value

A capture on a real Android Firefox device against the **v2-patched** Storybook
(`fixtures/android-firefox/device-v2-patched-process-still-buggy-가나다.json`,
`patchActive: true`) has final `domText: "가나다"` — but the **composing process still
flickers**. Tracing each `input` event's visible DOM value:

| typing | visible DOM value during composition |
| ------ | ------------------------------------ |
| `가` | stays `ㄱ` until commit, then jumps to `가` |
| `나` | `가간` → **`가가나`** → (commit) `가나` |
| `다` | **`가나가나ㄷ`** → `가나ㄷ` → (commit) `가나다` |

**The v2 patch masks, not fixes:** it corrects the *committed* value at `compositionend`
(`storeDiff` + `flush`) but each syllable boundary transiently shows a **duplicated cumulative
preedit** (`가가나`, `가나가나ㄷ`). The user sees this flicker → "여전히 버그처럼 보여요".

Mechanism: after committing syllable N (e.g. `가`), the selection sits after it; the Android
IME sends the **cumulative** run preedit (`가나`, then `가나다`) for the next syllable, and
native contenteditable renders it *after* the committed text → `가` + `가나` = `가가나`. Slate's
`androidInputManager` only reconciles/replaces at `compositionend`, so the duplication is
visible until commit. (H3: plain contenteditable on the same device does not flicker → this is
slate-react's cumulative-preedit handling, not the browser.)

**Consequences:**
- The real fix must make the composing display a **replace** of the running composition
  (`가나`), not append-then-correct — during composition, not only at `compositionend`.
- Emulation faithfulness now means **reproducing the flicker** (`가가나`, `가나가나ㄷ`). The
  first closed-loop increment produces a *clean* `가나다`, so it does **not** yet reproduce the
  device process — it is not faithful to the still-buggy device either.

Characterization test: `SlateLogger.device-v2-process.test.tsx` locks the known-bad process.

## Fix landed — v3 composition-range extension (2026-07-22)

`patches/slate-react@0.126.0.patch` (`composition-anchor-v3`) extends
`handleCompositionStart`: it walks back over the contiguous committed Hangul immediately before
the caret, moves `compositionAnchor` to that word start, and spans the DOM selection over the
word (`setBaseAndExtent`). So when the OS IME re-sends the cumulative preedit, native
composition **replaces** the word instead of appending after it — the `가가나` native paint
never happens.

Validated by the composition-range-aware native emulator: `SlateLogger.ime.process-fix.test.tsx`
went from RED (native paints `ㄱ,가,가간,가가나,가나가나ㄷ,가나가나다`) to GREEN (native paints
`ㄱ,가,간,가나,가나ㄷ,가나다` = the cumulative preedit, no duplication). Final still `가나다`;
full slate suite green; closed-loop `가나다가나다` still correct.

**Still open:** device recapture with v3 to confirm the composing process is clean on the real
device (the guarantee's empirical closure), and a generative Hangul-IME intent model to replace
the capture-derived intents.

## The fix direction — closed-loop IME emulator (decision 2026-07-21)

Instead of replaying a fixed log, model the IME as a **state machine that drives the mounted
editor and lets the editor mediate** — like a real OS IME:

1. The emulator owns the composition buffer (builds `ㄱ`, then `가` from strokes) —
   independent of the DOM, exactly as an OS IME does.
2. Per stroke it dispatches `compositionupdate` + `beforeinput(insertCompositionText, data)` +
   `input`, **reading the editor DOM** (`readEditableText`, selection) between steps to set
   the composition context — not assuming a planned value.
3. The editor (Slate `androidInputManager`) mediates the mutation. `ContentEditableImeTrace`
   dispatches real events but never writes the DOM, so Slate owns all mutations.
4. Clean single cumulative preedit per stroke (no device-recording duplications) → matches the
   IME's *intent*, which a correct editor turns into `가`.

### Faithfulness gate (the guarantee mechanism)

The closed-loop emulator is validated against the pile of existing device captures:

- **unpatched** Slate driven by the emulator must reproduce the device's broken outcome
  (`가` alone → device `ㄱ`); and
- **patched** Slate driven by the *same* emulator must produce the correct `가` / `가나다`.

When both hold across captures (single syllable, and continuous `가나다가나다`), the emulation
is a validated device model and "fixed in emulation ⇒ fixed on device" holds.

### Status (2026-07-21) — first closed-loop increment

`composeHangulAndroidFirefoxSlateClosedLoop` (dispatch composition/beforeinput per stroke,
Slate mediates via `androidInputManager`, no golden replay):

| | `가` | `가나다` | `가나다가나다` |
| --- | --- | --- | --- |
| **patched** Slate | `가` ✓ | `가나다` ✓ | `가나다가나다` ✓ (open-loop replay exploded here) |
| **unpatched** Slate | `ㄱ가` | `ㄱ가간가나가낟가나다` | explosion |
| device (for ref) | `ㄱ` | `ㄱ가나다` | orphan `ㄱ` |

**Note (superseded by the device correction above):** the patched emulation reaches a clean
final `가나다`, but that only matches the *committed value*, which the device also gets right.
It does **not** reproduce the device's composing flicker (`가가나`, `가나가나ㄷ`), so a green
here is necessary but not sufficient — the process is the real bug.

**Directional, not exact, faithfulness:** unpatched closed-loop reproduces the orphan-`ㄱ`
*family* (`ㄱ가…`) — closer to the device (`ㄱ`) than open-loop replay (`ㄱ가가`) — but not the
exact device string.

### Why exact unpatched match is research-grade

DOM probe (patched) shows Slate applies the replace `ㄱ→가` itself from `beforeinput.data` via
Transforms (`<span data-slate-string>ㄱ</span>` → `…가…`) — no browser DOM writeback needed,
which is why patched passes without one.

The device bug (orphan `ㄱ`) lives in the **unpatched** path, where `androidInputManager`
reconciles from **DOM mutations** (MutationObserver), not from `data`. To reproduce it exactly
the emulator would have to model the browser's composition DOM writeback **and** the specific
desync between that writeback and Slate's pending-diff flush that strands the first jamo. Note:
a *correct* DOM writeback would make unpatched Slate reconcile to the correct `가` (no bug) —
so the device bug is precisely a writeback/flush **timing desync**, not a plain mutation.
Modeling that timing is the next milestone; until then the guarantee is *directional* (fix
proven on real Slate; exact device-bug reproduction pending).

## Harness notes

- Tests run in **vitest browser mode** (real Chromium) — `apps/react-example/vite.config.ts`.
  Real DOM + real Slate is good for fidelity.
- Toggling the `slate-react` patch in a run requires clearing **only** the app-level vite dep
  cache (`apps/react-example/node_modules/.vite`, `.vite-temp`) — do **not** delete
  `@vitest/browser/**/.vite/manifest.json` (breaks the browser runner; restore via
  `bun install --force`).
- `@siheom/ime` is aliased to `packages/ime/src` — edit source directly, no rebuild.

## Out of scope / retired

App-layer Slate patches and pure golden-replay "modes" for AF (retired — see
exploration-hypotheses doc). This milestone replaces AF golden replay with the closed-loop
emulator; golden captures become **calibration fixtures**, not the emulation itself.
