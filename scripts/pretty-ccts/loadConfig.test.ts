import { describe, expect, it } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "./loadConfig";

describe("loadConfig", () => {
  it("reads scoreLimit from ccts.config.json", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pretty-ccts-"));
    await writeFile(
      join(dir, "ccts.config.json"),
      JSON.stringify({ scoreLimit: 12 }),
    );

    expect(await loadConfig(dir)).toEqual({ scoreLimit: 12 });
  });

  it("defaults scoreLimit to 10 when config is missing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pretty-ccts-"));
    expect(await loadConfig(dir)).toEqual({ scoreLimit: 10 });
  });
});
