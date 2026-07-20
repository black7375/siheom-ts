import { describe, expect, it } from "vitest";
import { act } from "@testing-library/react";
import { actions, assertions, given, query } from "@siheom/react";

import { SearchField } from "./SearchField";
import { runSiheom } from "../../runSiheom";

describe("SearchField", () => {
  it("broken 모드: 조합이 아닌 Enter는 submit한다", async () => {
    await runSiheom(
      given.render(<SearchField mode="broken" />),
      actions.type(query.searchbox("검색"), "hello{Enter}"),
      assertions.textContent(query.status("submit 횟수"), "1"),
      assertions.textContent(query.status("마지막 검색어"), "hello"),
    );
  });

  it("fixed 모드: 일반 Enter도 submit한다", async () => {
    await runSiheom(
      given.render(<SearchField mode="fixed" />),
      actions.type(query.searchbox("검색"), "hello{Enter}"),
      assertions.textContent(query.status("submit 횟수"), "1"),
      assertions.textContent(query.status("마지막 검색어"), "hello"),
    );
  });

  it("fixed 모드: compositionend 직후 Enter는 submit하지 않는다", async () => {
    await runSiheom(given.render(<SearchField mode="fixed" />));

    const input = document.getElementById("ime-enter-submit-search") as HTMLInputElement;
    input.focus();

    await act(async () => {
      input.value = "김";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "김" }));
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

    expect(document.querySelector('[aria-label="submit 횟수"]')?.textContent).toBe("0");
  });
});
