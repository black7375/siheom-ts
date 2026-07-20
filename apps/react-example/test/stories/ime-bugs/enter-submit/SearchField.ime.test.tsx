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
  it("macos-safari + broken: 김{Enter} 확정 키가 submit된다", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeProfile("macos-safari");

    await runSiheom(
      given.render(<SearchField mode="broken" />),
      actions.type(query.searchbox("검색"), "김{Enter}"),
      assertions.value(query.searchbox("검색"), "김"),
      assertions.textContent(query.status("submit 횟수"), "1"),
      assertions.textContent(query.status("마지막 검색어"), "김"),
    );
  });

  it("macos-safari + fixed: 김{Enter} 확정 키는 submit되지 않는다", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeProfile("macos-safari");

    await runSiheom(
      given.render(<SearchField mode="fixed" />),
      actions.type(query.searchbox("검색"), "김{Enter}"),
      assertions.value(query.searchbox("검색"), "김"),
      assertions.textContent(query.status("submit 횟수"), "0"),
    );
  });

  it("linux-chrome-ibus-hangul + broken: 확정은 229라서 false submit 없음", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeProfile(
      "linux-chrome-ibus-hangul",
    );

    await runSiheom(
      given.render(<SearchField mode="broken" />),
      actions.type(query.searchbox("검색"), "김{Enter}"),
      assertions.value(query.searchbox("검색"), "김"),
      assertions.textContent(query.status("submit 횟수"), "0"),
    );
  });

  it("macos-safari + fixed: 확정 후 한 번 더 Enter면 submit", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeProfile("macos-safari");

    await runSiheom(
      given.render(<SearchField mode="fixed" />),
      actions.type(query.searchbox("검색"), "김{Enter}{Enter}"),
      assertions.textContent(query.status("submit 횟수"), "1"),
      assertions.textContent(query.status("마지막 검색어"), "김"),
    );
  });
});
