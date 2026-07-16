import { describe, it, expectTypeOf } from "vitest";
import type { A11yAttributes, A11yInteraction, A11yNode, BuildA11yTreeOptions } from "./types.ts";
import type { A11ySnapshotOptions } from "../getA11ySnapshot.ts";

describe("A11yInteraction type", () => {
  it("accepts valid interaction object", () => {
    const interaction: A11yInteraction = { focusable: true, tabbable: true, focused: false };
    expectTypeOf(interaction).toExtend<A11yInteraction>();
  });

  it("accepts optional keyshortcuts and accesskey", () => {
    const interaction: A11yInteraction = {
      focusable: true,
      tabbable: true,
      focused: true,
      keyshortcuts: "Alt+S",
      accesskey: "s",
    };
    expectTypeOf(interaction).toExtend<A11yInteraction>();
  });

  it("rejects non-string keyshortcuts", () => {
    expectTypeOf<{
      readonly focusable: true;
      readonly tabbable: true;
      readonly focused: false;
      readonly keyshortcuts: number;
    }>().not.toExtend<A11yInteraction>();
  });

  it("requires focusable", () => {
    expectTypeOf<{
      readonly tabbable: true;
      readonly focused: false;
    }>().not.toExtend<A11yInteraction>();
  });
});

describe("A11yAttributes type", () => {
  it("accepts string-to-string record", () => {
    const attrs: A11yAttributes = { "aria-label": "Save", role: "button", disabled: "" };
    expectTypeOf(attrs).toExtend<A11yAttributes>();
  });
});

describe("A11yNode with interaction and attributes", () => {
  it("accepts node with interaction and attributes", () => {
    const node: A11yNode = {
      role: "button",
      name: "Save",
      interaction: { focusable: true, tabbable: true, focused: false },
      attributes: { "aria-label": "Save" },
      children: [],
    };
    expectTypeOf(node).toExtend<A11yNode>();
  });
});

describe("BuildA11yTreeOptions with includeHidden", () => {
  it("accepts includeHidden boolean", () => {
    const opts: BuildA11yTreeOptions = { mode: "verbose", includeHidden: true };
    expectTypeOf(opts).toExtend<BuildA11yTreeOptions>();
  });

  it("rejects non-boolean includeHidden", () => {
    expectTypeOf<{ readonly includeHidden: string }>().not.toExtend<BuildA11yTreeOptions>();
  });
});

describe("A11ySnapshotOptions", () => {
  it("inherits includeHidden from BuildA11yTreeOptions", () => {
    const opts: A11ySnapshotOptions = {
      mode: "verbose",
      includeHidden: true,
      serialize: { mode: "verbose" },
    };
    expectTypeOf(opts).toExtend<A11ySnapshotOptions>();
  });
});
