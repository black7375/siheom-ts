import { describe, expect, it } from "bun:test";
import type { Finding } from "./collectFindings";
import { formatFindings } from "./formatFindings";

describe("formatFindings", () => {
  it("prints jscpd-like lines for each finding and a summary", () => {
    const findings: Finding[] = [
      {
        path: "/repo/src/a.ts",
        kind: "function",
        name: "tooComplex",
        score: 15,
        line: 10,
        column: 1,
      },
    ];

    const output = formatFindings(findings, 10);

    expect(output).toContain("Complexity found (function)");
    expect(output).toContain("/repo/src/a.ts");
    expect(output).toContain("[10:1]");
    expect(output).toContain("(score 15)");
    expect(output).toContain("tooComplex");
    expect(output).toContain("Found 1 complex function (score > 10).");
  });

  it("labels empty names as (anonymous) and pluralizes the summary", () => {
    const findings: Finding[] = [
      {
        path: "/repo/a.ts",
        kind: "function",
        name: "",
        score: 20,
        line: 1,
        column: 1,
      },
      {
        path: "/repo/b.ts",
        kind: "function",
        name: "other",
        score: 11,
        line: 2,
        column: 3,
      },
    ];

    const output = formatFindings(findings, 10);
    expect(output).toContain("(anonymous)");
    expect(output).toContain("Found 2 complex functions (score > 10).");
  });
});
