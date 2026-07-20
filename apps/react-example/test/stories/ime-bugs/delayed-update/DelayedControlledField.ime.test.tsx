import { describe, expect, it } from "vitest";
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

import { DelayedControlledField } from "./DelayedControlledField";

function runWithDeferredIme() {
  return overrideSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: defaultGivens,
      effects: { ...defaultEffects, ...reactEffects },
    },
    {
      actions: createImeActions({
        settle: "macrotask",
        deferredUpdateRace: true,
      }),
      givens: {
        render: async (element: React.ReactElement) => {
          render(element);
        },
      },
    },
  );
}

describe("DelayedControlledField + createImeActions (stale setState)", () => {
  it("broken: 빠른 한글 입력 시 조합이 깨진다", async () => {
    const { runSiheom, actions, assertions, given } = runWithDeferredIme();

    await runSiheom(
      given.render(<DelayedControlledField mode="broken" />),
      actions.type(query.textbox("이름"), "김태희"),
    );

    const input = document.getElementById(
      "ime-delayed-controlled-input",
    ) as HTMLInputElement;
    expect(input.value).not.toBe("김태희");
  });

  it("fixed: 동기 setState면 김태희가 유지된다", async () => {
    const { runSiheom, actions, assertions, given } = runWithDeferredIme();

    await runSiheom(
      given.render(<DelayedControlledField mode="fixed" />),
      actions.type(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), "김태희"),
    );
  });
});
