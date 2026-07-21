### Exploration (phase 5) — understand, do not patch

- [x] Retire alt-a / alt-b / alt-c Story modes (device gate: all `ㄱ가나다`)
- [x] Exploration hypotheses: `docs/research/slate-placeholder-exploration-hypotheses.md`
- [x] **H1** Divergence timeline — `slateDebug.exploration.timeline[]`
- [x] **H2** Structural diff — Slate + reference textarea, `domStructures[]`
- [x] **H3** Minimal DOM fixture + `sourceMapHints[]` in JSON export
- [x] Device: download JSON after `가나다`, review `firstDivergence` (i=7 stuck-ㄱ; i=3 timing only)
- [x] Device H3: minimal HTML `가` OK → slate-react android-input-manager scope
- [x] `bun patch` slate-react@0.126.0 — composition anchor (`patches/slate-react@0.126.0.patch`)
- [ ] Device: patched Storybook → `가나다` not `ㄱ가나다`

### Closed-loop AF emulator (phase 6) — make emulation device-faithful

Diagnosis: open-loop golden replay is NOT device-faithful — unpatched emulation gives `ㄱ가가`
where the device gives `ㄱ` (double-mediation of recorded events). See
`docs/research/slate-closed-loop-emulator.md`. Replace AF golden replay with a closed-loop
emulator that drives real Slate and lets it mediate.

- [x] RED: closed-loop emulator types `가` into real (patched) Slate → editor shows `가`
      (generative events, no golden replay)
- [x] GREEN: `composeHangulAndroidFirefoxSlateClosedLoop` — dispatch composition/beforeinput
      per stroke, Slate mediates (`SlateLogger.ime.closed-loop.test.tsx`)
- [x] Continuous: emulator types `가나다` / `가나다가나다` into patched Slate → correct
      (open-loop replay exploded here)
- [~] Faithfulness gate: unpatched Slate → orphan-`ㄱ` *family* (`ㄱ가…`), directionally like
      device (`ㄱ`) but not exact — exact match needs browser writeback/flush desync model
      (research-grade, see `docs/research/slate-closed-loop-emulator.md`)
- [ ] Model composition DOM writeback + pending-diff flush desync → unpatched emul == device `ㄱ`
- [ ] Replace `android-firefox-slate-placeholder-*` golden-replay modes with closed-loop
- [ ] Wire closed-loop as an `@siheom/ime` profile mode (`createImeActions({ profile })`)

### CORRECTION (2026-07-21 device) — the bug is the composing process, not the final value

Device v2 capture (`device-v2-patched-process-still-buggy-가나다.json`, `patchActive:true`) has
final `가나다` but the composing display flickers duplicates (`가가나`, `가나가나ㄷ`) at each
syllable boundary. v2 only corrects the committed value at `compositionend` — user still sees
the bug. See `docs/research/slate-closed-loop-emulator.md` (Correction section).

- [x] Characterization: `SlateLogger.device-v2-process.test.tsx` locks known-bad process
- [ ] Real fix: `androidInputManager` shows cumulative preedit as a **replace** of the running
      composition (`가나`) during composition, not append-then-correct at `compositionend`
- [ ] Emulation must reproduce the flicker (`가가나`, `가나가나ㄷ`) to be device-faithful, then
      go green only when the composing process is clean end-to-end
