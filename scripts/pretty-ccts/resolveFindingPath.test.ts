import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveFindingPath } from "./resolveFindingPath";

describe("resolveFindingPath", () => {
  it("returns absolute path when the tree path exists under cwd", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pretty-ccts-"));
    await mkdir(join(dir, "src"), { recursive: true });
    await writeFile(join(dir, "src", "a.ts"), "");

    expect(resolveFindingPath("src/a.ts", dir)).toBe(join(dir, "src", "a.ts"));
  });

  it("finds the file under cwd when the tree path is only a suffix", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pretty-ccts-"));
    const file = join(dir, "packages", "core", "src", "a.ts");
    await mkdir(join(dir, "packages", "core", "src"), { recursive: true });
    await writeFile(file, "");

    expect(resolveFindingPath("src/a.ts", dir)).toBe(file);
  });
});
