import { describe, expect, it } from "vitest";

import { compactDomStructure } from "./compactDomStructure";

describe("compactDomStructure", () => {
  it("summarizes slate-like placeholder + text leaf", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <div data-slate-node="element">
        <span data-slate-node="text"><span data-slate-string="true"></span></span>
      </div>
      <span data-slate-placeholder="true" contenteditable="false">여기에 입력…</span>
    `;

    const tree = compactDomStructure(root);
    expect(tree.some((node) => node.ph === true)).toBe(true);
    expect(tree.some((node) => node.sn === "element")).toBe(true);
  });
});
