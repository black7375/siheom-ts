import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runPrettyCcts } from "./runPrettyCcts";

describe("runPrettyCcts", () => {
  it("filters by ccts.config.json and formats matching functions", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pretty-ccts-"));
    await mkdir(join(dir, "src"), { recursive: true });
    await writeFile(join(dir, "src", "a.ts"), "");
    await writeFile(
      join(dir, "ccts.config.json"),
      JSON.stringify({ scoreLimit: 10 }),
    );

    const json = JSON.stringify({
      src: {
        "a.ts": {
          kind: "file",
          score: 20,
          inner: [
            {
              kind: "function",
              name: "tooComplex",
              score: 15,
              line: 10,
              column: 1,
              inner: [],
            },
            {
              kind: "function",
              name: "ok",
              score: 2,
              line: 40,
              column: 1,
              inner: [],
            },
          ],
        },
      },
    });

    const result = await runPrettyCcts(json, dir);

    expect(result.exitCode).toBe(1);
    expect(result.output).toContain("Complexity found (function)");
    expect(result.output).toContain(join(dir, "src", "a.ts"));
    expect(result.output).toContain("tooComplex");
    expect(result.output).not.toContain(" ok");
    expect(result.output).toContain("Found 1 complex function (score > 10).");
  });

  it("exits 0 when nothing exceeds the score limit", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pretty-ccts-"));
    await writeFile(
      join(dir, "ccts.config.json"),
      JSON.stringify({ scoreLimit: 10 }),
    );

    const json = JSON.stringify({
      "a.ts": {
        kind: "file",
        score: 3,
        inner: [
          {
            kind: "function",
            name: "ok",
            score: 3,
            line: 1,
            column: 1,
            inner: [],
          },
        ],
      },
    });

    const result = await runPrettyCcts(json, dir);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain("Found 0 complex functions (score > 10).");
  });
});
