import { describe, expect, it } from "bun:test";
import { collectFindings } from "./collectFindings";

describe("collectFindings", () => {
  it("returns functions with score greater than scoreLimit", () => {
    const tree = {
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
              score: 3,
              line: 40,
              column: 1,
              inner: [],
            },
          ],
        },
      },
    };

    expect(collectFindings(tree, 10)).toEqual([
      {
        path: "src/a.ts",
        kind: "function",
        name: "tooComplex",
        score: 15,
        line: 10,
        column: 1,
      },
    ]);
  });

  it("includes nested functions over the limit independently", () => {
    const tree = {
      "a.ts": {
        kind: "file",
        score: 30,
        inner: [
          {
            kind: "function",
            name: "outer",
            score: 20,
            line: 1,
            column: 1,
            inner: [
              {
                kind: "function",
                name: "inner",
                score: 12,
                line: 5,
                column: 3,
                inner: [],
              },
            ],
          },
        ],
      },
    };

    expect(collectFindings(tree, 10)).toEqual([
      {
        path: "a.ts",
        kind: "function",
        name: "outer",
        score: 20,
        line: 1,
        column: 1,
      },
      {
        path: "a.ts",
        kind: "function",
        name: "inner",
        score: 12,
        line: 5,
        column: 3,
      },
    ]);
  });

  it("ignores non-function containers even when their score exceeds the limit", () => {
    const tree = {
      "a.ts": {
        kind: "file",
        score: 50,
        inner: [
          {
            kind: "class",
            name: "Big",
            score: 40,
            line: 1,
            column: 1,
            inner: [
              {
                kind: "function",
                name: "method",
                score: 11,
                line: 3,
                column: 3,
                inner: [],
              },
            ],
          },
          {
            kind: "type",
            name: "T",
            score: 20,
            line: 20,
            column: 1,
            inner: [],
          },
        ],
      },
    };

    expect(collectFindings(tree, 10)).toEqual([
      {
        path: "a.ts",
        kind: "function",
        name: "method",
        score: 11,
        line: 3,
        column: 3,
      },
    ]);
  });

  it("sorts findings by score descending", () => {
    const tree = {
      "a.ts": {
        kind: "file",
        score: 40,
        inner: [
          {
            kind: "function",
            name: "mid",
            score: 12,
            line: 1,
            column: 1,
            inner: [],
          },
          {
            kind: "function",
            name: "high",
            score: 30,
            line: 10,
            column: 1,
            inner: [],
          },
          {
            kind: "function",
            name: "low",
            score: 11,
            line: 20,
            column: 1,
            inner: [],
          },
        ],
      },
    };

    expect(collectFindings(tree, 10).map((f) => f.name)).toEqual([
      "high",
      "mid",
      "low",
    ]);
  });
});
