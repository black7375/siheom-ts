import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import { actions, assertions, given, query } from "@siheom/react";

import { ChatMessageField } from "./ChatMessageField";
import { runSiheom } from "../../runSiheom";

describe("ChatMessageField", () => {
  it("broken 모드: 조합이 아닌 Enter는 send한다", async () => {
    await runSiheom(
      given.render(<ChatMessageField mode="broken" />),
      actions.type(query.textbox("메시지"), "hello{Enter}"),
      assertions.textContent(query.status("send 횟수"), "1"),
      assertions.textContent(query.status("마지막 전송 메시지"), "hello"),
    );
  });

  it("fixed 모드: 일반 Enter도 send한다", async () => {
    await runSiheom(
      given.render(<ChatMessageField mode="fixed" />),
      actions.type(query.textbox("메시지"), "hello{Enter}"),
      assertions.textContent(query.status("send 횟수"), "1"),
      assertions.textContent(query.status("마지막 전송 메시지"), "hello"),
    );
  });

  it("fixed 모드: compositionend 이후 늦게 온 Enter(후보 확정)는 send하지 않는다", async () => {
    await runSiheom(given.render(<ChatMessageField mode="fixed" />));

    const input = document.getElementById("ime-candidate-conversion-chat") as HTMLTextAreaElement;
    input.focus();

    // Simulates conversion IME committing a candidate (e.g. 你好 or raw preedit "hello")
    await act(async () => {
      input.value = "你好";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "你好" }));
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          isComposing: false,
        }),
      );
    });

    expect(document.querySelector('[aria-label="send 횟수"]')?.textContent).toBe("0");
  });

  it("broken 모드: compositionend 이후 Enter(후보 확정)가 send된다", async () => {
    await runSiheom(given.render(<ChatMessageField mode="broken" />));

    const input = document.getElementById("ime-candidate-conversion-chat") as HTMLTextAreaElement;
    input.focus();

    await act(async () => {
      input.value = "hello";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "hello" }));
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          isComposing: false,
        }),
      );
    });

    expect(document.querySelector('[aria-label="send 횟수"]')?.textContent).toBe("1");
    expect(document.querySelector('[aria-label="마지막 전송 메시지"]')?.textContent).toBe("hello");
  });
});
