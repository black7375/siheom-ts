import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import { actions, assertions, given, query } from "@siheom/react";

import { FocusStealCombobox } from "./FocusStealCombobox";
import { runSiheom } from "../../runSiheom";

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
  });
}

describe("FocusStealCombobox", () => {
  it("broken 모드는 입력 직후 첫 제안 옵션으로 포커스를 옮긴다", async () => {
    await runSiheom(
      given.render(<FocusStealCombobox mode="broken" />),
      actions.type(query.textbox("검색"), "김"),
      assertions.visible(query.option("김태희")),
    );

    expect(document.activeElement).toHaveAccessibleName("김태희");
  });

  it("fixed 모드는 조합 중(isComposing)에는 옵션으로 포커스를 옮기지 않는다", async () => {
    await runSiheom(given.render(<FocusStealCombobox mode="fixed" />));

    const input = document.getElementById(
      "focus-steal-combobox-input",
    ) as HTMLInputElement;
    input.focus();
    await dispatchComposingInput(input, "ㄱ");

    expect(document.activeElement).toBe(input);
  });

  it("broken 모드는 조합 중에도 옵션으로 포커스를 옮긴다", async () => {
    await runSiheom(given.render(<FocusStealCombobox mode="broken" />));

    const input = document.getElementById(
      "focus-steal-combobox-input",
    ) as HTMLInputElement;
    input.focus();
    await dispatchComposingInput(input, "ㄱ");

    expect(document.activeElement).toHaveAccessibleName("김태희");
  });
});
