import { describe, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";
import { createImeActions } from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";
import { render } from "@testing-library/react";

import { SearchField } from "./SearchField";

function runWithImeProfile(profile: string) {
  return overrideSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: defaultGivens,
      effects: { ...defaultEffects, ...reactEffects },
    },
    {
      actions: createImeActions({ profile }),
      givens: {
        render: async (element: React.ReactElement) => {
          render(element);
        },
      },
    },
  );
}

describe("SearchField + createImeActions (Enter during composition)", () => {
  it.each(["macos-safari", "linux-chrome-ibus-hangul"] as const)(
    "%s + broken: 김{Enter} 확정 키가 submit된다",
    async (profile) => {
      const { runSiheom, actions, assertions, given } = runWithImeProfile(profile);

      await runSiheom(
        given.render(<SearchField mode="broken" />),
        actions.type(query.searchbox("검색"), "김{Enter}"),
        assertions.value(query.searchbox("검색"), "김"),
        assertions.textContent(query.status("submit 횟수"), "1"),
        assertions.textContent(query.status("마지막 검색어"), "김"),
      );
    },
  );

  it.each(["macos-safari", "linux-chrome-ibus-hangul"] as const)(
    "%s + fixed: 김{Enter} 확정 키는 submit되지 않는다",
    async (profile) => {
      const { runSiheom, actions, assertions, given } = runWithImeProfile(profile);

      await runSiheom(
        given.render(<SearchField mode="fixed" />),
        actions.type(query.searchbox("검색"), "김{Enter}"),
        assertions.value(query.searchbox("검색"), "김"),
        assertions.textContent(query.status("submit 횟수"), "0"),
      );
    },
  );

  it("chromium-enter-229 + broken: 229 확정이라 false submit 없음", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeProfile("chromium-enter-229");

    await runSiheom(
      given.render(<SearchField mode="broken" />),
      actions.type(query.searchbox("검색"), "김{Enter}"),
      assertions.value(query.searchbox("검색"), "김"),
      assertions.textContent(query.status("submit 횟수"), "0"),
    );
  });

  it("linux-chrome-ibus-hangul + fixed: 확정 후 한 번 더 Enter면 submit", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeProfile(
      "linux-chrome-ibus-hangul",
    );

    await runSiheom(
      given.render(<SearchField mode="fixed" />),
      actions.type(query.searchbox("검색"), "김{Enter}{Enter}"),
      assertions.textContent(query.status("submit 횟수"), "1"),
      assertions.textContent(query.status("마지막 검색어"), "김"),
    );
  });
});
