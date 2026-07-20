import { describe, expect, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";
import { attachImeRecorder, goldenCritical, toCriticalEvents } from "@siheom/ime";

import continuousGolden from "../../fixtures/chromium-cdp/continuous-hangul.json";
import { createCdpImeActions } from "./createCdpImeActions";

type ImeRecorder = ReturnType<typeof attachImeRecorder>;

function setupLabeledInput(onInput?: (input: HTMLInputElement) => void) {
  document.body.innerHTML = "";
  const label = document.createElement("label");
  label.append("이름");
  const input = document.createElement("input");
  onInput?.(input);
  label.append(input);
  document.body.append(label);
  return input;
}

function setup(onInput?: (input: HTMLInputElement) => void) {
  const recorderRef: { current: ImeRecorder | undefined } = { current: undefined };

  const { runSiheom, actions, assertions, given } = overrideSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: {
        render: async () => {
          setupLabeledInput((input) => {
            recorderRef.current = attachImeRecorder(input);
            onInput?.(input);
          });
        },
      },
      effects: defaultEffects,
    },
    {
      actions: createCdpImeActions(),
    },
  );

  return { runSiheom, actions, assertions, given, recorderRef };
}

describe("createCdpImeActions + overrideSiheom", () => {
  it("fills Hangul with compositionupdate (CDP engine path)", async () => {
    let compositionUpdates = 0;
    const { runSiheom, actions, assertions, given } = setup((input) => {
      input.addEventListener("compositionupdate", () => {
        compositionUpdates += 1;
      });
    });

    await runSiheom(
      given.render(),
      actions.fill(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), "김태희"),
    );

    expect(compositionUpdates).toBeGreaterThan(0);
  });

  it("types 김태희 matching chromium-cdp continuous-hangul golden", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = setup();

    await runSiheom(
      given.render(),
      actions.type(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), "김태희"),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(continuousGolden.events),
    );
    recorderRef.current!.detach();
  });

  it("types hello김태희 with Latin prefix then CDP Hangul composition", async () => {
    let compositionStarts = 0;
    const { runSiheom, actions, assertions, given } = setup((input) => {
      input.addEventListener("compositionstart", () => {
        compositionStarts += 1;
      });
    });

    await runSiheom(
      given.render(),
      actions.type(query.textbox("이름"), "hello김태희"),
      assertions.value(query.textbox("이름"), "hello김태희"),
    );

    expect(compositionStarts).toBeGreaterThan(0);
  });
});
