import { describe, it } from "vitest";
import { query } from "@siheom/core";

import { SearchField } from "./SearchField";
import { runWithImeSiheom } from "../shared/runWithImeSiheom";

describe("SearchField + createImeActions (Enter during composition)", () => {
  it.each([
    "macos-safari",
    "macos-safari-apple",
    "macos-chrome-apple",
    "linux-chrome-ibus-hangul",
  ] as const)("%s + broken: 김{Enter} 확정 키가 submit된다", async (profile) => {
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({ profile });

    await runSiheom(
      given.render(<SearchField mode="broken" />),
      actions.type(query.searchbox("검색"), "김{Enter}"),
      assertions.value(query.searchbox("검색"), "김"),
      assertions.textContent(query.status("submit 횟수"), "1"),
      assertions.textContent(query.status("마지막 검색어"), "김"),
    );
  });

  it("macos-safari-apple + fixed: compositionend 없어 Enter가 submit된다", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({
      profile: "macos-safari-apple",
    });

    await runSiheom(
      given.render(<SearchField mode="fixed" />),
      actions.type(query.searchbox("검색"), "김{Enter}"),
      assertions.value(query.searchbox("검색"), "김"),
      assertions.textContent(query.status("submit 횟수"), "1"),
    );
  });

  it.each(["macos-safari", "macos-chrome-apple", "linux-chrome-ibus-hangul"] as const)(
    "%s + fixed: 김{Enter} 확정 키는 submit되지 않는다",
    async (profile) => {
      const { runSiheom, actions, assertions, given } = runWithImeSiheom({ profile });

      await runSiheom(
        given.render(<SearchField mode="fixed" />),
        actions.type(query.searchbox("검색"), "김{Enter}"),
        assertions.value(query.searchbox("검색"), "김"),
        assertions.textContent(query.status("submit 횟수"), "0"),
      );
    },
  );

  it("chromium-enter-229 + broken: 229 확정이라 false submit 없음", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({
      profile: "chromium-enter-229",
    });

    await runSiheom(
      given.render(<SearchField mode="broken" />),
      actions.type(query.searchbox("검색"), "김{Enter}"),
      assertions.value(query.searchbox("검색"), "김"),
      assertions.textContent(query.status("submit 횟수"), "0"),
    );
  });

  it("linux-chrome-ibus-hangul + fixed: 확정 후 한 번 더 Enter면 submit", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({
      profile: "linux-chrome-ibus-hangul",
    });

    await runSiheom(
      given.render(<SearchField mode="fixed" />),
      actions.type(query.searchbox("검색"), "김{Enter}{Enter}"),
      assertions.textContent(query.status("submit 횟수"), "1"),
      assertions.textContent(query.status("마지막 검색어"), "김"),
    );
  });
});
