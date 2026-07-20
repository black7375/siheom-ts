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

import { MaxLengthField } from "./MaxLengthField";
import { runWithImeSiheom } from "../shared/runWithImeSiheom";
import chromeBrokenGolden from "./fixtures/macos-chrome-apple/broken-7of6.json";
import chromeFixedGolden from "./fixtures/macos-chrome-apple/fixed-7of6.json";
import safariBrokenGolden from "./fixtures/macos-safari-apple/broken-7of6.json";
import safariFixedGolden from "./fixtures/macos-safari-apple/fixed-7of6.json";

const OVERFLOW_TEXT = "가나다라마바사";
const MAX_LENGTH = 6;
const EXPECTED_VALUE = "가나다라마바";

type ImeRecorder = ReturnType<typeof attachImeRecorder>;

function runWithMaxLengthIme(profile: "macos-chrome-apple" | "macos-safari-apple") {
  const recorderRef: { current: ImeRecorder | undefined } = { current: undefined };

  const api = overrideSiheom(
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
          await render(element);
          const input = document.getElementById("ime-maxlength-field") as HTMLInputElement;
          recorderRef.current = attachImeRecorder(input);
        },
      },
    },
  );

  return { ...api, recorderRef };
}

describe("MaxLengthField + createImeActions (composition vs maxLength)", () => {
  it("macos-chrome-apple + broken: critical events match OS capture", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } =
      runWithMaxLengthIme("macos-chrome-apple");

    await runSiheom(
      given.render(<MaxLengthField mode="broken" maxLength={MAX_LENGTH} />),
      actions.type(query.textbox("닉네임"), OVERFLOW_TEXT),
      assertions.value(query.textbox("닉네임"), EXPECTED_VALUE),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(chromeBrokenGolden.events),
    );
    recorderRef.current!.detach();
  });

  it("macos-chrome-apple + fixed: critical events match OS capture", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } =
      runWithMaxLengthIme("macos-chrome-apple");

    await runSiheom(
      given.render(<MaxLengthField mode="fixed" maxLength={MAX_LENGTH} />),
      actions.type(query.textbox("닉네임"), OVERFLOW_TEXT),
      assertions.value(query.textbox("닉네임"), EXPECTED_VALUE),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(chromeFixedGolden.events),
    );
    recorderRef.current!.detach();
  });

  it("macos-safari-apple + broken: critical events match OS capture", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } =
      runWithMaxLengthIme("macos-safari-apple");

    await runSiheom(
      given.render(<MaxLengthField mode="broken" maxLength={MAX_LENGTH} />),
      actions.type(query.textbox("닉네임"), OVERFLOW_TEXT),
      assertions.value(query.textbox("닉네임"), EXPECTED_VALUE),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(safariBrokenGolden.events),
    );
    recorderRef.current!.detach();
  });

  it("macos-safari-apple + fixed: critical events match OS capture", async () => {
    const { runSiheom, actions, assertions, given, recorderRef } =
      runWithMaxLengthIme("macos-safari-apple");

    await runSiheom(
      given.render(<MaxLengthField mode="fixed" maxLength={MAX_LENGTH} />),
      actions.type(query.textbox("닉네임"), OVERFLOW_TEXT),
      assertions.value(query.textbox("닉네임"), EXPECTED_VALUE),
    );

    expect(toCriticalEvents(recorderRef.current!.events)).toEqual(
      goldenCritical(safariFixedGolden.events),
    );
    recorderRef.current!.detach();
  });

  it("linux-chrome-ibus-hangul + broken: final value stays within maxLength", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({
      profile: "linux-chrome-ibus-hangul",
    });

    await runSiheom(
      given.render(<MaxLengthField mode="broken" maxLength={MAX_LENGTH} />),
      actions.type(query.textbox("닉네임"), OVERFLOW_TEXT),
      assertions.value(query.textbox("닉네임"), EXPECTED_VALUE),
    );
  });

  it("linux-chrome-ibus-hangul + fixed: final value stays within maxLength", async () => {
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({
      profile: "linux-chrome-ibus-hangul",
    });

    await runSiheom(
      given.render(<MaxLengthField mode="fixed" maxLength={MAX_LENGTH} />),
      actions.type(query.textbox("닉네임"), OVERFLOW_TEXT),
      assertions.value(query.textbox("닉네임"), EXPECTED_VALUE),
    );
  });
});
