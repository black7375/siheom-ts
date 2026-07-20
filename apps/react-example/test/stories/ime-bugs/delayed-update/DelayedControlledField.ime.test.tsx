import { describe, expect, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";
import { attachImeRecorder, createImeActions, goldenCritical, toCriticalEvents } from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";
import { render } from "@testing-library/react";

import { DelayedControlledField } from "./DelayedControlledField";
import brokenGolden from "./fixtures/linux-ibus-hangul-chrome/broken-김태희.json";
import fixedGolden from "./fixtures/linux-ibus-hangul-chrome/fixed-김태희.json";

type ImeRecorder = ReturnType<typeof attachImeRecorder>;

function runWithDeferredIme(deferredUpdateRace: boolean) {
  const recorderRef: { current: ImeRecorder | undefined } = { current: undefined };

  const api = overrideSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: defaultGivens,
      effects: { ...defaultEffects, ...reactEffects },
    },
    {
      actions: createImeActions({
        settle: "macrotask",
        deferredUpdateRace,
      }),
      givens: {
        render: async (element: React.ReactElement) => {
          await render(element);
          const input = document.getElementById("ime-delayed-controlled-input") as HTMLInputElement;
          recorderRef.current = attachImeRecorder(input);
        },
      },
    },
  );

  return { ...api, recorderRef };
}

describe("DelayedControlledField + createImeActions (OS delayed-update)", () => {
  it("broken: final value and critical events match linux-ibus-hangul-chrome", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = runWithDeferredIme(true);
    const expected = brokenGolden.events.at(-1)?.value ?? "ㄱㅣㅁㅌㅐㅎㅡㅣ";

    await runSiheom(
      given.render(<DelayedControlledField mode="broken" />),
      actions.type(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), expected),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(brokenGolden.events),
    );
    recorderRef.current!.detach();
  });

  it("fixed: final value and critical events match linux-ibus-hangul-chrome", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = runWithDeferredIme(false);

    await runSiheom(
      given.render(<DelayedControlledField mode="fixed" />),
      actions.type(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), "김태희"),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(fixedGolden.events),
    );
    recorderRef.current!.detach();
  });
});
