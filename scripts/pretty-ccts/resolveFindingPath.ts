import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const IGNORED_PATH_PARTS = ["/node_modules/", "/dist/", "/.git/"];

export function resolveFindingPath(treePath: string, cwd: string): string {
  const direct = resolve(cwd, treePath);
  if (existsSync(direct)) {
    return direct;
  }

  const matches: string[] = [];
  for (const match of new Bun.Glob(`**/${treePath}`).scanSync({ cwd })) {
    const absolute = join(cwd, match);
    if (IGNORED_PATH_PARTS.some((part) => absolute.includes(part))) {
      continue;
    }
    matches.push(absolute);
  }

  if (matches.length === 1) {
    return matches[0]!;
  }

  if (matches.length > 1) {
    const preferred = matches.filter((m) => m.includes("/src/"));
    if (preferred.length === 1) {
      return preferred[0]!;
    }
    return matches.sort()[0]!;
  }

  return direct;
}
