import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import { given } from "@siheom/react";

import {
  HanjaAutocompleteField,
  stripHangulBeforeHanja,
} from "./HanjaAutocompleteField";
import { runSiheom } from "../../runSiheom";

describe("stripHangulBeforeHanja", () => {
  it("김金 → 金", () => {
    expect(stripHangulBeforeHanja("김金", "김", "金")).toBe("金");
  });

  it("金태泰 → 金泰", () => {
    expect(stripHangulBeforeHanja("金태泰", "태", "泰")).toBe("金泰");
  });

  it("일반 한글 연속(김태)은 건드리지 않는다", () => {
    expect(stripHangulBeforeHanja("김태", "김", "태")).toBeNull();
  });
});

/** Replay macOS Chrome Hanja append: compositionend Hangul → new composition Hanja appends. */
async function replayChromeHanjaAppend(input: HTMLInputElement, hangul: string, hanja: string) {
  await act(async () => {
    input.value = hangul;
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: hangul }));
  });

  await act(async () => {
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
    input.value = hangul + hanja;
    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertCompositionText",
        isComposing: true,
        data: hanja,
      }),
    );
  });

  await act(async () => {
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: hanja }));
  });
}

describe("HanjaAutocompleteField", () => {
  it("broken 모드: 조합 중 Enter가 combobox 제안을 선택한다", async () => {
    await runSiheom(given.render(<HanjaAutocompleteField mode="broken" />));

    const input = document.getElementById("hanja-autocomplete-input") as HTMLInputElement;
    input.focus();

    await act(async () => {
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
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
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
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

  it("broken 모드: Chrome 한자 append(김金)를 그대로 둔다", async () => {
    await runSiheom(given.render(<HanjaAutocompleteField mode="broken" />));

    const input = document.getElementById("hanja-autocomplete-input") as HTMLInputElement;
    input.focus();
    await replayChromeHanjaAppend(input, "김", "金");

    expect(input.value).toBe("김金");
  });

  it("fixed 모드: 한자 변환 중(확정 전)에는 한글을 지우지 않는다", async () => {
    await runSiheom(given.render(<HanjaAutocompleteField mode="fixed" />));

    const input = document.getElementById("hanja-autocomplete-input") as HTMLInputElement;
    input.focus();

    await act(async () => {
      input.value = "김";
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "김" }));
    });

    await act(async () => {
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
      input.value = "김金";
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertCompositionText",
          isComposing: true,
          data: "金",
        }),
      );
    });

    // Still browsing candidates — strip must wait for compositionend
    expect(input.value).toBe("김金");
  });

  it("fixed 모드: Chrome 한자 append(김金)를 金으로 보정한다", async () => {
    await runSiheom(given.render(<HanjaAutocompleteField mode="fixed" />));

    const input = document.getElementById("hanja-autocomplete-input") as HTMLInputElement;
    input.focus();
    await replayChromeHanjaAppend(input, "김", "金");

    expect(input.value).toBe("金");
    expect(document.querySelector('[aria-label="combobox query"]')?.textContent).toBe("金");
  });

  it("fixed 모드: 이어지는 태→泰도 보정한다", async () => {
    await runSiheom(given.render(<HanjaAutocompleteField mode="fixed" />));

    const input = document.getElementById("hanja-autocomplete-input") as HTMLInputElement;
    input.focus();
    await replayChromeHanjaAppend(input, "김", "金");
    expect(input.value).toBe("金");

    await act(async () => {
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
      input.value = "金태";
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertCompositionText",
          isComposing: true,
          data: "태",
        }),
      );
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "태" }));
    });

    await act(async () => {
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
      input.value = "金태泰";
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertCompositionText",
          isComposing: true,
          data: "泰",
        }),
      );
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "泰" }));
    });

    expect(input.value).toBe("金泰");
  });
});
