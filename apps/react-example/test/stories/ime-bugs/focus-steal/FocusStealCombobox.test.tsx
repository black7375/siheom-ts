import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import { actions, assertions, given, query } from "@siheom/react";

import { FocusStealCombobox } from "./FocusStealCombobox";
import { runSiheom } from "../../runSiheom";

async function flushFocusBounce() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function dispatchComposingInput(input: HTMLInputElement, value: string) {
  await act(async () => {
    input.value = value;
    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: value,
        inputType: "insertCompositionText",
        isComposing: true,
      }),
    );
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function dispatchCompositionEnd(input: HTMLInputElement, data: string) {
  await act(async () => {
    input.dispatchEvent(
      new CompositionEvent("compositionend", { bubbles: true, data }),
    );
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("FocusStealCombobox", () => {
  it("broken 모드: 영문 입력 후에는 포커스가 다시 검색 입력으로 돌아온다", async () => {
    await runSiheom(
      given.render(<FocusStealCombobox mode="broken" />),
      actions.type(query.textbox("검색"), "a"),
      assertions.visible(query.option("apple")),
    );
    await flushFocusBounce();

    const input = document.getElementById("focus-steal-combobox-input");
    expect(document.activeElement).toBe(input);
  });

  it("broken 모드: 조합 중에도 option으로 갔다가 input으로 돌아오며 blur가 한 번 난다", async () => {
    await runSiheom(given.render(<FocusStealCombobox mode="broken" />));

    const input = document.getElementById(
      "focus-steal-combobox-input",
    ) as HTMLInputElement;
    input.focus();

    let blurred = false;
    input.addEventListener("blur", () => {
      blurred = true;
    });

    await dispatchComposingInput(input, "ㄱ");

    expect(blurred).toBe(true);
    expect(document.activeElement).toBe(input);
  });

  it("fixed 모드: 조합 중에는 focus bounce(blur)가 없다", async () => {
    await runSiheom(given.render(<FocusStealCombobox mode="fixed" />));

    const input = document.getElementById(
      "focus-steal-combobox-input",
    ) as HTMLInputElement;
    input.focus();

    let blurred = false;
    input.addEventListener("blur", () => {
      blurred = true;
    });

    await dispatchComposingInput(input, "ㄱ");

    expect(blurred).toBe(false);
    expect(document.activeElement).toBe(input);
  });

  it("fixed 모드: compositionend(음절 경계)에도 DOM focus bounce가 없다", async () => {
    await runSiheom(given.render(<FocusStealCombobox mode="fixed" />));

    const input = document.getElementById(
      "focus-steal-combobox-input",
    ) as HTMLInputElement;
    input.focus();

    await act(async () => {
      input.value = "김";
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: "김",
          inputType: "insertCompositionText",
          isComposing: false,
        }),
      );
      await Promise.resolve();
    });

    let blurred = false;
    input.addEventListener("blur", () => {
      blurred = true;
    });

    await dispatchCompositionEnd(input, "김");

    expect(blurred).toBe(false);
    expect(document.activeElement).toBe(input);
  });
});
