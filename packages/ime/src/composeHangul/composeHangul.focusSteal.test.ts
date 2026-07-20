import { describe, expect, it } from "vitest";

import { composeHangul } from "./composeHangul";

/** Mimic FocusStealCombobox broken mode: option←→input focus bounce after each input. */
function attachFocusBounce(input: HTMLInputElement) {
  const option = document.createElement("button");
  option.type = "button";
  option.textContent = "suggestion";
  document.body.append(option);

  input.addEventListener("input", () => {
    queueMicrotask(() => {
      option.focus();
      input.focus();
    });
  });

  return () => option.remove();
}

describe("composeHangul with focus bounce (IME bug reproduction)", () => {
  it("aborts composition on blur and yields 풀어쓰기 like broken OS capture", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const detach = attachFocusBounce(input);

    await composeHangul(input, "김태희");

    expect(input.value).toBe("ㄱㅣㅁㅌㅐㅎㅡㅣ");

    detach();
    input.remove();
  });

  it("without focus bounce still composes 김태희", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "김태희");

    expect(input.value).toBe("김태희");

    input.remove();
  });
});
