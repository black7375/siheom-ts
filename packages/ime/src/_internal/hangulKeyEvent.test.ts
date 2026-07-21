import { describe, expect, it } from "vitest";

import { resolveProfile } from "../profiles";
import { hangulKeydownFields, hangulKeyupFields } from "./hangulKeyEvent";

const stroke = { jamo: "ㄱ", code: "KeyR", key: "r" };

describe("hangulKeyEvent", () => {
  it("unidentified emits Unidentified/229 with empty code on keydown and keyup", () => {
    const profile = resolveProfile("android-chrome");

    expect(hangulKeydownFields(profile, stroke)).toEqual({
      key: "Unidentified",
      code: "",
      keyCode: 229,
    });
    expect(hangulKeyupFields(profile, stroke, true)).toEqual({
      key: "Unidentified",
      code: "",
      keyCode: 229,
      isComposing: true,
    });
  });
});
