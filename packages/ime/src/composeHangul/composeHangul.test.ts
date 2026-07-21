import { describe, expect, it } from "vitest";

import { composeHangul } from "./composeHangul";
import golden from "../../fixtures/linux-chrome-ibus-hangul/continuous-hangul.json";
import macosGolden from "../../fixtures/macos-chrome-apple/continuous-hangul.json";
import { attachImeRecorder } from "../attachImeRecorder";
import { composeEnter } from "../composeEnter";
import { resolveProfile } from "../profiles";
import safariEnterGolden from "../../fixtures/macos-safari-apple/broken-김-enter.json";
import { goldenCritical } from "../goldenCritical";
import { toCriticalEvents } from "../toCriticalEvents";
import { planHangulKeystrokes } from "../planHangulKeystrokes";

describe("planHangulKeystrokes", () => {
  it("plans 김 with one composition session ending after ㅁ", () => {
    const strokes = planHangulKeystrokes("김");
    expect(strokes).toHaveLength(3);
    expect(strokes[0]?.compositionStart).toBe(true);
    expect(strokes[0]?.keydownIsComposing).toBe(false);
    expect(strokes.map((s) => s.preeditSteps[0])).toEqual(["ㄱ", "기", "김"]);
  });
});

describe("composeHangul", () => {
  it("types 김 with compositionstart/update/end and insertCompositionText", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "김");
    expect(input.value).toBe("김");
    expect(events.map((e) => e.type)).toEqual([
      "keydown",
      "compositionstart",
      "compositionupdate",
      "beforeinput",
      "input",
      "keyup",
      "keydown",
      "compositionupdate",
      "beforeinput",
      "input",
      "keyup",
      "keydown",
      "compositionupdate",
      "beforeinput",
      "input",
      "keyup",
      "compositionend",
    ]);
    expect(events.filter((e) => e.type === "input").map((e) => e.value)).toEqual([
      "ㄱ",
      "기",
      "김",
    ]);

    input.remove();
  });

  it("matches linux-chrome-ibus-hangul continuous-hangul critical fields for 김태희", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "김태희");
    expect(input.value).toBe("김태희");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(golden.events));

    input.remove();
  });

  it("matches macos-chrome-apple continuous-hangul critical fields for 김태희", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "김태희", { profile: "macos-chrome-apple" });
    expect(input.value).toBe("김태희");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(macosGolden.events));

    input.remove();
  });

  it("matches macos-safari-apple enter-submit critical fields for 김 (replacement, no composition)", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);

    await composeHangul(input, "김", {
      profile: "macos-safari-apple",
      commitFinal: false,
    });
    await composeEnter(input, resolveProfile("macos-safari-apple"));

    expect(input.value).toBe("김");
    expect(toCriticalEvents(recorder.events)).toEqual(goldenCritical(safariEnterGolden.events));
    recorder.detach();
    input.remove();
  });

  it("rejects overflow when maxLength is set during composition", async () => {
    const input = document.createElement("input");
    input.maxLength = 3;
    document.body.append(input);

    await composeHangul(input, "가나다라");

    expect(input.value).toBe("가나다");
    input.remove();
  });

  it("macos-safari-apple with maxLength rejects overflow on composition path", async () => {
    const input = document.createElement("input");
    input.maxLength = 3;
    document.body.append(input);

    const events = await composeHangul(input, "가나다라", { profile: "macos-safari-apple" });

    expect(input.value).toBe("가나다");
    expect(events.some((e) => e.type === "input" && e.inputType === "deleteCompositionText")).toBe(
      true,
    );
    expect(
      events.some(
        (e) => e.type === "input" && e.inputType === "insertFromComposition" && e.data === "",
      ),
    ).toBe(true);

    input.remove();
  });

  it("macos-safari-apple settle macrotask commits between syllables on composition path", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "김태", {
      profile: "macos-safari-apple",
      settle: "macrotask",
    });

    expect(input.value).toBe("김태");
    const compositionEnds = events.filter((e) => e.type === "compositionend");
    expect(compositionEnds.length).toBeGreaterThanOrEqual(2);
    expect(
      events.some(
        (e) => e.type === "input" && e.inputType === "insertFromComposition" && e.data === "김",
      ),
    ).toBe(true);

    input.remove();
  });

  it("macos-safari-apple maxLength with host clamp rejects via empty insertText", async () => {
    const input = document.createElement("input");
    input.maxLength = 3;
    document.body.append(input);
    input.addEventListener("input", () => {
      if (input.value.length > input.maxLength) {
        input.value = input.value.slice(0, input.maxLength);
      }
    });

    const events = await composeHangul(input, "가나다라", { profile: "macos-safari-apple" });

    expect(input.value).toBe("가나다");
    expect(
      events.some((e) => e.type === "input" && e.inputType === "insertText" && e.data === ""),
    ).toBe(true);

    input.remove();
  });
});
