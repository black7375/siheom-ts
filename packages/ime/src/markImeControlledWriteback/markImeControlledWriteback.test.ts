import { describe, expect, it } from "vitest";

import {
  consumeImeControlledWriteback,
  markImeControlledWriteback,
} from "./markImeControlledWriteback";

describe("consumeImeControlledWriteback", () => {
  it("returns false when the host never marked writeback", () => {
    const input = document.createElement("input");

    expect(consumeImeControlledWriteback(input)).toBe(false);
  });

  it("returns true once then clears the mark", () => {
    const input = document.createElement("input");
    markImeControlledWriteback(input);

    expect(consumeImeControlledWriteback(input)).toBe(true);
    expect(consumeImeControlledWriteback(input)).toBe(false);
  });
});
