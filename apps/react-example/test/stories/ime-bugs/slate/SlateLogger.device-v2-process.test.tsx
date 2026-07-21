import { describe, expect, it } from "vitest";

import deviceV2 from "./fixtures/android-firefox/device-v2-patched-process-still-buggy-가나다.json";

/**
 * Real Android Firefox device capture against the v2-patched Storybook.
 *
 * The v2 patch makes the *committed* value correct (final `가나다`) but the
 * *composing process* still flickers: each syllable boundary transiently shows a
 * duplicated preedit (`가가나`, `가나가나ㄷ`) before compositionend cleans it up.
 * The user sees this flicker → the bug is masked, not fixed.
 *
 * This is a characterization test of the KNOWN-BAD process. When the composing
 * display is actually fixed, the duplicated intermediate values must disappear
 * (update this test then). See docs/research/slate-closed-loop-emulator.md.
 */
describe("device v2 capture — final correct, process still buggy", () => {
  const visibleValues = deviceV2.events
    .filter((event) => event.type === "input")
    .map((event) => event.value);

  it("final committed value is 가나다 (masked correct)", () => {
    expect(deviceV2.slateDebug.final.domText).toBe("가나다");
    expect(visibleValues.at(-1)).toBe("가나다");
  });

  it("composing process transiently shows duplicated jamo (the visible bug)", () => {
    // Duplicated preedit flashes the v2 patch does NOT prevent.
    expect(visibleValues).toContain("가가나");
    expect(visibleValues).toContain("가나가나ㄷ");
  });
});
