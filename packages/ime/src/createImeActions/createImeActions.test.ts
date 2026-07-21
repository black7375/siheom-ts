import { describe, expect, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";

import { attachImeRecorder } from "../attachImeRecorder";
import { toCriticalEvents } from "../toCriticalEvents";
import { createImeActions } from "./createImeActions";
import { goldenCritical, fromFirstCompositionStart } from "../goldenCritical";
import { resolveProfile } from "../profiles";
import continuousGolden from "../../fixtures/linux-chrome-ibus-hangul/continuous-hangul.json";
import androidContinuousGolden from "../../fixtures/android-chrome/continuous-hangul.json";
import mixedGolden from "../../fixtures/linux-chrome-ibus-hangul/mixed-en-ko.json";
import backspaceGolden from "../../fixtures/linux-chrome-ibus-hangul/backspace-mid.json";
import arrowGolden from "../../fixtures/linux-chrome-ibus-hangul/arrow-edit-mid.json";
import type { CreateImeActionsOptions } from "./createImeActions";

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

function setup(
  onInput?: (input: HTMLInputElement) => void,
  imeOptions?: CreateImeActionsOptions,
) {
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
      actions: createImeActions(imeOptions),
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

  it.each([
    {
      label: "linux-chrome-ibus-hangul",
      imeOptions: undefined as CreateImeActionsOptions | undefined,
      golden: continuousGolden,
    },
    {
      label: "android-chrome",
      imeOptions: { profile: "android-chrome" } satisfies CreateImeActionsOptions,
      golden: androidContinuousGolden,
    },
  ])(
    "types 김태희 with $label matching continuous-hangul golden critical fields",
    async ({ imeOptions, golden }) => {
      const { runSiheom, actions, assertions, given, recorderRef } = setup(undefined, imeOptions);

      await runSiheom(
        given.render(),
        actions.type(query.textbox("이름"), "김태희"),
        assertions.value(query.textbox("이름"), "김태희"),
      );

      expect(toCriticalEvents(recorderRef.current!.events)).toEqual(goldenCritical(golden.events));
      recorderRef.current!.detach();
    },
  );

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

  it("types Hangul then {Enter} ending composition before Enter (webkit profile)", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = setup();

    await runSiheom(
      given.render(),
      actions.type(query.textbox("이름"), "김{Enter}"),
      assertions.value(query.textbox("이름"), "김"),
    );

    const types = toCriticalEvents(recorderRef.current!.events).map((event) => ({
      type: event.type,
      key: event.key,
      isComposing: event.isComposing,
    }));
    const endIndex = types.findIndex((event) => event.type === "compositionend");
    const enterIndex = types.findIndex(
      (event) => event.type === "keydown" && event.key === "Enter",
    );
    expect(endIndex).toBeGreaterThan(-1);
    expect(enterIndex).toBeGreaterThan(endIndex);
    expect(types[enterIndex]?.isComposing).toBe(false);
    recorderRef.current!.detach();
  });

  it("types with resolveElement sync when the element is already present", async () => {
    setupLabeledInput();
    const actions = createImeActions({ resolveElement: "sync" });
    const assertions = createDefaultAssertions({ resolveElement: "sync" });

    await actions.type(query.textbox("이름"), "김");
    await assertions.value(query.textbox("이름"), "김");
  });

  it("types Hangul into a textarea", async () => {
    document.body.innerHTML = "";
    const label = document.createElement("label");
    label.append("메모");
    const textarea = document.createElement("textarea");
    label.append(textarea);
    document.body.append(label);

    const actions = createImeActions();
    const assertions = createDefaultAssertions();

    await actions.type(query.textbox("메모"), "김");
    await assertions.value(query.textbox("메모"), "김");
  });

  it("accepts a profile object instead of an id string", async () => {
    setupLabeledInput();
    const profile = resolveProfile("macos-safari");
    const actions = createImeActions({ profile, resolveElement: "sync" });
    const assertions = createDefaultAssertions({ resolveElement: "sync" });

    await actions.type(query.textbox("이름"), "김{Enter}");
    await assertions.value(query.textbox("이름"), "김");
  });

  it("delegates unknown key descriptors like {Home} to user-event", async () => {
    setupLabeledInput();
    const input = document.querySelector("input") as HTMLInputElement;
    input.value = "ab";
    input.setSelectionRange(2, 2);
    const actions = createImeActions({ resolveElement: "sync" });
    const assertions = createDefaultAssertions({ resolveElement: "sync" });

    await actions.type(query.textbox("이름"), "{Home}");
    await assertions.value(query.textbox("이름"), "ab");
    expect(input.selectionStart).toBe(0);
  });

  it("types into a contenteditable via user-event fallback", async () => {
    document.body.innerHTML = `<div role="textbox" aria-label="편집" contenteditable="true"></div>`;
    const actions = createImeActions({ resolveElement: "sync" });
    const assertions = createDefaultAssertions({ resolveElement: "sync" });

    await actions.type(query.textbox("편집"), "hi");
    await assertions.textContent(query.textbox("편집"), "hi");
  });
});
