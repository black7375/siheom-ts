# Slate AF — emulation fidelity experiments

## Problem

Fix tests replay device golden JSON in Chromium + UA spoof and pass, but **real Android Firefox still fails**. The inference “test green → device OK” is invalid if replay ≠ device.

## Experiment A — broken replay fidelity

**Question:** If we replay capture events on **broken** Slate (no fix), does DOM match golden `value` each step?

**Tool:** `measureReplayFidelity()` in `@siheom/ime`

**Results** (Chromium Vitest, `SlateLogger.ime.replay-fidelity.test.tsx`):

| Capture | Steps | Match rate | First mismatch |
| ------- | ----- | ---------- | -------------- |
| `broken-가-placeholder.json` | 15 | **46.7%** | step 3 (`beforeinput`, expected `""`, actual `ㄱ`) |
| `mechanism-fix-v3-…json` | 120 | **4.2%** | step 3 |

**Conclusion:** Events-only contenteditable replay is **not** a device emulator. Longer captures diverge more (4% for 120 steps).

**Golden writeback** (`writeback: "golden"` on `replayGoldenEvents`) → **100%** on plain div. Golden is self-consistent; gap is **Slate+Chromium not reproducing device DOM from events alone**.

## Experiment B — dual trace

**Question:** Separate `event` from `expectedDom` explicitly?

**Tool:** `dualTraceFromImeCapture()` — maps `events[].value` → `expectedDom`

Golden writeback satisfies dual trace on plain div (100%). Use dual trace for:

- Fidelity benchmarks (events-only vs golden-writeback gap)
- Future: step assertions without conflating event log with DOM oracle

## Experiment C — fix-pair extraction

**Question:** Can we test fix **logic** without golden replay?

**Tool:** `extractFixPairsFromCapture()` — reads `slateDebug.fixTrace` `committed-preedit` rows → `(committed, data, expectedNext)`

Compare `documentFromCommittedPreedit(committed, data)` vs device `expectedNext` at capture time.

**Use:** Pure function regression when capture was taken with *older* fix; drift snapshot documents whether current code matches what device actually ran.

Run: `bun run vitest run extractFixPairsFromCapture.test.tsx`

## What to do next

1. ~~**Stop using fixed-mode golden replay as device gate**~~ — replaced with fidelity assertions (`matchRate < 0.2`).
2. **Golden writeback** — `replayGoldenEvents({ writeback: "golden" })` for plain CE upper bound; Slate stays events-only.
3. **Fix development:** iterate on Experiment C pairs + device capture (`mechanism-fix-v4-…json`), not replay pass alone.
