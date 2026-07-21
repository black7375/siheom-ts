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
