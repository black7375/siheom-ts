import { describe, expect, it } from "vitest";

import { composeHangul } from "./composeHangul";
import { markImeControlledWriteback } from "./imeWritebackSignal";

/**
 * Mimic DelayedControlledField broken mode: one deferred writeback per tick with
 * `markImeControlledWriteback` so the emulator knows composition was cancelled.
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
      markImeControlledWriteback(input);
    }, 0);
  });
}

describe("composeHangul deferred controlled update race", () => {
  it("writeback after first jamo yields OS 풀어쓰기 without compositionend", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    attachStaleDeferredWriteback(input);

    const events = await composeHangul(input, "김태희", {
      settle: "macrotask",
      deferredUpdateRace: true,
    });

    expect(input.value).toBe("ㄱㅣㅁㅌㅐㅎㅡㅣ");
    expect(events.filter((event) => event.type === "compositionend")).toHaveLength(0);
    expect(events.filter((event) => event.type === "compositionstart")).toHaveLength(8);

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
