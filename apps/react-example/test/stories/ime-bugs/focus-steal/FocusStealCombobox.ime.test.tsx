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

import { FocusStealCombobox } from "./FocusStealCombobox";
import brokenGolden from "./fixtures/linux-ibus-hangul-chrome/broken-hangul.json";
import fixedGolden from "./fixtures/linux-ibus-hangul-chrome/fixed-hangul.json";

function runWithImeActions() {
  return overrideSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: defaultGivens,
      effects: { ...defaultEffects, ...reactEffects },
    },
    {
      actions: createImeActions(),
      givens: {
        render: async (element: React.ReactElement) => {
          render(element);
        },
      },
    },
  );
}

describe("FocusStealCombobox + createImeActions (OS bug reproduction)", () => {
  it("broken: typing 김태희 yields OS 풀어쓰기 final value", async () => {
    const expected = brokenGolden.events.at(-1)?.value ?? "ㄱㅣㅁㅌㅐㅎㅡㅣ";
    const { runSiheom, actions, assertions, given } = runWithImeActions();

    await runSiheom(
      given.render(<FocusStealCombobox mode="broken" />),
      actions.type(query.textbox("검색"), "김태희"),
      assertions.value(query.textbox("검색"), expected),
    );
  });

  it("fixed: typing 김태희 yields composed 김태희", async () => {
    const expected = fixedGolden.events.at(-1)?.value ?? "김태희";
    const { runSiheom, actions, assertions, given } = runWithImeActions();

    await runSiheom(
      given.render(<FocusStealCombobox mode="fixed" />),
      actions.type(query.textbox("검색"), "김태희"),
      assertions.value(query.textbox("검색"), expected),
    );
  });
});
