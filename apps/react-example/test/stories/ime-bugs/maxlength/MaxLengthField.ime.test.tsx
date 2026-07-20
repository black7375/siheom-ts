import { describe, it } from "vitest";
import { query } from "@siheom/core";

import { MaxLengthField } from "./MaxLengthField";
import { runWithImeSiheom } from "../shared/runWithImeSiheom";

/** Four syllables; maxLength=3 forces overflow during IME composition. */
const OVERFLOW_TEXT = "가나다라";
const MAX_LENGTH = 3;

describe("MaxLengthField + createImeActions (composition vs maxLength)", () => {
  it.each([
    "linux-chrome-ibus-hangul",
    "macos-chrome-apple",
    "macos-safari-apple",
  ] as const)("%s + broken: composition can exceed maxLength", async (profile) => {
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({ profile });

    await runSiheom(
      given.render(<MaxLengthField mode="broken" maxLength={MAX_LENGTH} />),
      actions.type(query.textbox("닉네임"), OVERFLOW_TEXT),
      assertions.value(query.textbox("닉네임"), OVERFLOW_TEXT),
      assertions.textContent(query.status("글자 수"), String(OVERFLOW_TEXT.length)),
    );
  });

  it.each([
    "linux-chrome-ibus-hangul",
    "macos-chrome-apple",
    "macos-safari-apple",
  ] as const)("%s + fixed: input stays within maxLength during composition", async (profile) => {
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({ profile });

    await runSiheom(
      given.render(<MaxLengthField mode="fixed" maxLength={MAX_LENGTH} />),
      actions.type(query.textbox("닉네임"), OVERFLOW_TEXT),
      assertions.value(query.textbox("닉네임"), OVERFLOW_TEXT.slice(0, MAX_LENGTH)),
      assertions.textContent(query.status("글자 수"), String(MAX_LENGTH)),
    );
  });
});
