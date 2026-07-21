import { describe, expect, it } from "vitest";

import { composeHangul } from "../composeHangul";
import { toCriticalEvents } from "../toCriticalEvents";
import chromeFixed from "../../../../apps/react-example/test/stories/ime-bugs/candidate-conversion/fixtures/macos-chrome-apple/fixed-hanja-name.json";
import safariFixed from "../../../../apps/react-example/test/stories/ime-bugs/candidate-conversion/fixtures/macos-safari-apple/fixed-hanja-name.json";
import { composeHanjaConversion } from "./composeHanjaConversion";

/** Conversion slice: Option+Enter through first input that yields 김金. */
function chromeAppendThroughKimKim(events: typeof chromeFixed.events) {
  const alt = events.findIndex((e) => e.type === "keydown" && e.key === "Alt" && e.value === "김");
  const kimKim = events.findIndex((e, i) => i > alt && e.type === "input" && e.value === "김金");
  return events.slice(alt, kimKim + 1);
}

/** Conversion slice: Alt through first replace input that yields 金. */
function safariReplaceThroughKim(events: typeof safariFixed.events) {
  const alt = events.findIndex((e) => e.type === "keydown" && e.key === "Alt" && e.value === "김");
  const gold = events.findIndex(
    (e, i) => i > alt && e.type === "input" && e.value === "金" && e.data === "金",
  );
  return events.slice(alt, gold + 1);
}

describe("composeHanjaConversion", () => {
  it("matches macos-chrome-apple golden through first 김金 append", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "김", { commitFinal: false, profile: "macos-chrome-apple" });
    const events = await composeHanjaConversion(input, {
      hangul: "김",
      hanja: "金",
      profile: "macos-chrome-apple",
    });

    expect(toCriticalEvents(events)).toEqual(
      toCriticalEvents(chromeAppendThroughKimKim(chromeFixed.events)),
    );
    expect(input.value).toBe("김金");

    input.remove();
  });

  it("matches macos-safari-apple golden through first 金 replace", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    // Hangul must be composing; safari-apple normal type uses replacement, so use composition profile.
    await composeHangul(input, "김", { commitFinal: false, profile: "macos-safari" });
    const events = await composeHanjaConversion(input, {
      hangul: "김",
      hanja: "金",
      profile: "macos-safari-apple",
    });

    expect(toCriticalEvents(events)).toEqual(
      toCriticalEvents(safariReplaceThroughKim(safariFixed.events)),
    );
    expect(input.value).toBe("金");

    input.remove();
  });
});
