import { describe, expect, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";

import { attachImeRecorder } from "./attachImeRecorder";
import { toCriticalEvents } from "./composeHangul";
import { createImeActions } from "./createImeActions";
import { goldenCritical, fromFirstCompositionStart } from "./goldenCompare";
import continuousGolden from "../fixtures/linux-chrome-ibus-hangul/continuous-hangul.json";
import mixedGolden from "../fixtures/linux-chrome-ibus-hangul/mixed-en-ko.json";
import backspaceGolden from "../fixtures/linux-chrome-ibus-hangul/backspace-mid.json";
import arrowGolden from "../fixtures/linux-chrome-ibus-hangul/arrow-edit-mid.json";

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
      actions: createImeActions(),
    },
  );

  return { runSiheom, actions, assertions, given, recorderRef };
}

describe("createImeActions + overrideSiheom", () => {
  it("fills Hangul with compositionupdate (not user-event insertText-only)", async () => {
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

  it("types 김태희 matching continuous-hangul golden critical fields", async () => {
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

  it("types hello 안녕 with Hangul portion matching mixed-en-ko golden", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = setup();

    await runSiheom(
      given.render(),
      actions.type(query.textbox("이름"), "hello 안녕"),
      assertions.value(query.textbox("이름"), "hello 안녕"),
    );

    expect(toCriticalEvents(fromFirstCompositionStart(recorderRef.current!.events))).toEqual(
      goldenCritical(fromFirstCompositionStart(mixedGolden.events)),
    );
    recorderRef.current!.detach();
  });

  it("types backspace-mid script matching golden critical fields", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = setup();

    await runSiheom(
      given.render(),
      actions.type(query.textbox("이름"), "김태희{Backspace}{Backspace}{Backspace}{Backspace}철수"),
      assertions.value(query.textbox("이름"), "김철수"),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(backspaceGolden.events),
    );
    recorderRef.current!.detach();
  });

  it("types arrow-edit-mid script matching golden critical fields", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = setup();

    await runSiheom(
      given.render(),
      actions.type(query.textbox("이름"), "김희{ArrowLeft}태"),
      assertions.value(query.textbox("이름"), "김태희"),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(arrowGolden.events),
    );
    recorderRef.current!.detach();
  });
});
