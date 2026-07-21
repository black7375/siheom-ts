import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import { given } from "@siheom/react";

import { HanjaAutocompleteField } from "./HanjaAutocompleteField";
import { runSiheom } from "../../runSiheom";

describe("HanjaAutocompleteField", () => {
  it("broken 모드: 조합 중 ArrowDown이 combobox 하이라이트를 움직인다", async () => {
    await runSiheom(given.render(<HanjaAutocompleteField mode="broken" />));

    const input = document.getElementById("hanja-autocomplete-input") as HTMLInputElement;
    input.focus();

    await act(async () => {
      input.value = "김";
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertCompositionText",
          isComposing: true,
          data: "김",
        }),
      );
    });

    const firstOption = document.getElementById("hanja-autocomplete-option-김태희");
    expect(firstOption?.getAttribute("aria-selected")).toBe("true");

    await act(async () => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "ArrowDown",
          code: "ArrowDown",
          keyCode: 40,
          isComposing: true,
        }),
      );
    });

    const secondOption = document.getElementById("hanja-autocomplete-option-김철수");
    expect(secondOption?.getAttribute("aria-selected")).toBe("true");
  });

  it("fixed 모드: 조합 중 ArrowDown이 combobox 하이라이트를 움직이지 않는다", async () => {
    await runSiheom(given.render(<HanjaAutocompleteField mode="fixed" />));

    const input = document.getElementById("hanja-autocomplete-input") as HTMLInputElement;
    input.focus();

    await act(async () => {
      input.value = "김";
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertCompositionText",
          isComposing: true,
          data: "김",
        }),
      );
    });

    await act(async () => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "ArrowDown",
          code: "ArrowDown",
          keyCode: 40,
          isComposing: true,
        }),
      );
    });

    const firstOption = document.getElementById("hanja-autocomplete-option-김태희");
    expect(firstOption?.getAttribute("aria-selected")).toBe("true");
    expect(document.querySelector('[aria-label="combobox 선택 횟수"]')?.textContent).toBe("0");
  });

  it("broken 모드: 조합 중 Enter가 combobox 제안을 선택한다", async () => {
    await runSiheom(given.render(<HanjaAutocompleteField mode="broken" />));

    const input = document.getElementById("hanja-autocomplete-input") as HTMLInputElement;
    input.focus();

    await act(async () => {
      input.value = "김";
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertCompositionText",
          isComposing: true,
          data: "김",
        }),
      );
    });

    await act(async () => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          isComposing: true,
        }),
      );
    });

    expect(input.value).toBe("김태희");
    expect(document.querySelector('[aria-label="combobox 선택 횟수"]')?.textContent).toBe("1");
  });

  it("fixed 모드: 조합 중 Enter가 combobox 제안을 선택하지 않는다", async () => {
    await runSiheom(given.render(<HanjaAutocompleteField mode="fixed" />));

    const input = document.getElementById("hanja-autocomplete-input") as HTMLInputElement;
    input.focus();

    await act(async () => {
      input.value = "김";
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertCompositionText",
          isComposing: true,
          data: "김",
        }),
      );
    });

    await act(async () => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          isComposing: true,
        }),
      );
    });

    expect(input.value).toBe("김");
    expect(document.querySelector('[aria-label="combobox 선택 횟수"]')?.textContent).toBe("0");
  });
});
