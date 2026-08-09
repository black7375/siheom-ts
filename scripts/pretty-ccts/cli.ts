#!/usr/bin/env bun
import { runPrettyCcts } from "./runPrettyCcts";

async function cctsJson(path: string): Promise<string> {
  const proc = Bun.spawn(["bunx", "ccts-json", path], {
    stdout: "pipe",
    stderr: "inherit",
  });
  const [stdout, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    throw new Error(`ccts-json failed for "${path}" (exit ${exitCode})`);
  }
  return stdout;
}

const paths = process.argv.slice(2);

const jsonTexts = paths.length
  ? await Promise.all(paths.map(cctsJson))
  : [await Bun.stdin.text()];

if (jsonTexts.every((text) => !text.trim())) {
  console.error(
    "Usage: pretty-ccts <path...>\n   or: bunx ccts-json <path> | pretty-ccts\nPrints functions over ccts.config.json scoreLimit.",
  );
  process.exit(2);
}

const result = await runPrettyCcts(jsonTexts, process.cwd());
console.log(result.output);
process.exit(result.exitCode);
