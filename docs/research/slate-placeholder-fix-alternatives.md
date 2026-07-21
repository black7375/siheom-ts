# Slate #5989 — fix alternatives (archived)

**Status:** Closed. App-layer alternatives A/B/C failed device gate (2026-07-21).

See **[slate-placeholder-exploration-hypotheses.md](./slate-placeholder-exploration-hypotheses.md)**
for next work — understanding, not patching.

## Device gate summary

Fixtures: `device-alt-gate-{broken,alt-a,alt-b,alt-c}-가나다.json`

All modes → `ㄱ가나다`. `events[]` identical. alt-a fixTrace confirms patches ran on time.

## Retired approaches (do not re-ship)

| Approach | Why retired |
| -------- | ----------- |
| Preedit drive | DOM explosion |
| compositionstart select reset | session-2 wipe |
| compositionend orphan strip | awkward UX |
| alt-a composition anchor | device gate fail |
| alt-b force-render guard | device gate fail |
| alt-c A+B | device gate fail |
