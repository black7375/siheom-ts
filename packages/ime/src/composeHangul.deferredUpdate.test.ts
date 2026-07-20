import { describe, expect, it } from "vitest";

import { composeHangul } from "./composeHangul";

/**
 * Mimic DelayedControlledField broken mode: one deferred writeback per tick,
 * capturing the leading DOM value. Later IME preedits advance the DOM; the
 * stale write then clobbers composition.
 */
function attachStaleDeferredWriteback(input: HTMLInputElement) {
  let pending = false;
  input.addEventListener("input", () => {
    if (pending) return;
    pending = true;
    const leadingSnapshot = input.value;
    setTimeout(() => {
      pending = false;
      input.value = leadingSnapshot;
    }, 0);
  });
}

describe("composeHangul deferred controlled update race", () => {
  it("detects stale writeback and corrupts Hangul (not 김태희)", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    attachStaleDeferredWriteback(input);

    await composeHangul(input, "김태희", {
      settle: "macrotask",
      deferredUpdateRace: true,
    });

    expect(input.value).not.toBe("김태희");
    expect(input.value.length).toBeGreaterThan(0);

    input.remove();
  });

  it("without deferred race still composes 김태희 under macrotask settle", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "김태희", { settle: "macrotask" });

    expect(input.value).toBe("김태희");

    input.remove();
  });
});
