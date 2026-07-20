import { describe, expect, it } from "vitest";

import { hangulValueProgression } from "./hangulProgression";

describe("hangulValueProgression", () => {
  it("matches assemble prefixes for 김태희", () => {
    expect(hangulValueProgression("김태희")).toEqual([
      "ㄱ",
      "기",
      "김",
      "김ㅌ",
      "김태",
      "김탷",
      "김태흐",
      "김태희",
    ]);
  });
});
