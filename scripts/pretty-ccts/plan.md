# pretty-ccts

Pipe `ccts-json` stdout into a jscpd-like console report of functions over `scoreLimit`.

## Checklist

- [x] `collectFindings` walks ccts-json tree and returns functions with `score > scoreLimit`
- [x] Findings include file path, line, column, name, score, kind
- [x] Nested functions over the limit are included independently
- [x] Non-function containers (file/class/type/module) are ignored
- [x] Findings are sorted by score descending
- [x] `loadConfig` reads `ccts.config.json` (`scoreLimit`, default 10)
- [x] `formatFindings` prints jscpd-like lines (bold header, green path, location, score, name)
- [x] Summary line: `Found N complex functions (score > limit).`
- [x] CLI reads JSON from stdin, config from cwd, prints report; exit 1 when findings exist
- [x] `pretty-ccts` bin + root `ccts.config.json` wired for `… | pretty-ccts`
- [x] `runPrettyCcts` accepts multiple ccts-json trees and merges findings across them
- [x] CLI runs `ccts-json <path>` itself for each path arg (so `bun run ccts packages/ime/src` works)
