#!/usr/bin/env bun
import { runPrettyCcts } from "./runPrettyCcts";

const jsonText = await Bun.stdin.text();
if (!jsonText.trim()) {
  console.error(
    "Usage: bunx ccts-json <path> | pretty-ccts\nReads ccts-json stdout and prints functions over ccts.config.json scoreLimit.",
  );
  process.exit(2);
}

const result = await runPrettyCcts(jsonText, process.cwd());
console.log(result.output);
process.exit(result.exitCode);
