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

- [ ] RED: closed-loop emulator types `가` into real (patched) Slate → editor shows `가`
      (generative events, no golden replay)
- [ ] GREEN: `composeHangulAndroidFirefoxSlateClosedLoop` — dispatch composition/beforeinput
      per stroke, read editor DOM between steps, Slate mediates; wire profile mode
- [ ] Continuous: emulator types `가나다` into patched Slate → `가나다`
- [ ] Faithfulness gate: same emulator on **unpatched** Slate → `ㄱ` (matches device);
      calibrate against `가나다가나다` device captures
- [ ] Replace `android-firefox-slate-placeholder-*` golden-replay modes with closed-loop
