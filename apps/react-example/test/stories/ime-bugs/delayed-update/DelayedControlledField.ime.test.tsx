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
import macosBrokenGolden from "./fixtures/macos-chrome-apple/broken-김태희.json";
import macosFixedGolden from "./fixtures/macos-chrome-apple/fixed-김태희.json";

type ImeRecorder = ReturnType<typeof attachImeRecorder>;

function runWithDeferredIme(
  deferredUpdateRace: boolean,
  profile: "linux-chrome-ibus-hangul" | "macos-chrome-apple" | "macos-safari-apple" = "linux-chrome-ibus-hangul",
) {
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
        profile,
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

  it("macos-chrome-apple broken: final value and critical events match OS capture", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = runWithDeferredIme(
      true,
      "macos-chrome-apple",
    );
    const expected = macosBrokenGolden.events.at(-1)?.value ?? "ㄱㅣㅁㅌㅐㅎㅡㅣ";

    await runSiheom(
      given.render(<DelayedControlledField mode="broken" />),
      actions.type(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), expected),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(macosBrokenGolden.events),
    );
    recorderRef.current!.detach();
  });

  it("macos-chrome-apple fixed: final value and critical events match OS capture", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = runWithDeferredIme(
      false,
      "macos-chrome-apple",
    );

    await runSiheom(
      given.render(<DelayedControlledField mode="fixed" />),
      actions.type(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), "김태희"),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(macosFixedGolden.events),
    );
    recorderRef.current!.detach();
  });

  it("macos-safari-apple broken: stale writeback yields Safari-style garble (not Linux 풀어쓰기)", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = runWithDeferredIme(
      true,
      "macos-safari-apple",
    );
    const linuxBroken = "ㄱㅣㅁㅌㅐㅎㅡㅣ";

    await runSiheom(
      given.render(<DelayedControlledField mode="broken" />),
      actions.type(query.textbox("이름"), "김태희"),
    );

    const value = recorderRef.current!.events.at(-1)?.value ?? "";
    expect(value).not.toBe(linuxBroken);
    expect(value.length).toBeGreaterThan("김태희".length);
    recorderRef.current!.detach();
  });

  it("macos-safari-apple fixed: final value matches OS capture", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } = runWithDeferredIme(
      false,
      "macos-safari-apple",
    );

    await runSiheom(
      given.render(<DelayedControlledField mode="fixed" />),
      actions.type(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), "김태희"),
    );

    recorderRef.current!.detach();
  });
});
