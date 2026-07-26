import { describe, expect, it } from "vitest";

import { composeHangul } from "./composeHangul";
import golden from "../../fixtures/linux-chrome-ibus-hangul/continuous-hangul.json";
import macosGolden from "../../fixtures/macos-chrome-apple/continuous-hangul.json";
import androidGolden from "../../fixtures/android-chrome/continuous-hangul.json";
import ceBrokenGolden from "../../fixtures/android-firefox-contenteditable-broken/continuous-hangul.json";
import ceFixedGolden from "../../fixtures/linux-firefox-contenteditable-fixed/continuous-hangul.json";
import ceAfFixedGolden from "../../fixtures/android-firefox-contenteditable-fixed/continuous-hangul.json";
import slateBrokenGolden from "../../fixtures/android-chrome-slate-placeholder-broken/first-hangul-가.json";
import slatePlainGolden from "../../fixtures/android-chrome-slate-plain-control/first-hangul-가.json";
import afSlateBrokenGolden from "../../fixtures/android-firefox-slate-placeholder-broken/first-hangul-가.json";
import afSlatePlainGolden from "../../fixtures/android-firefox-slate-plain-control/first-hangul-가.json";
import lcSlatePhGolden from "../../fixtures/linux-chrome-slate-placeholder-fixed/first-hangul-가.json";
import lcSlatePlGolden from "../../fixtures/linux-chrome-slate-plain-control/first-hangul-가.json";
import lfSlatePhGolden from "../../fixtures/linux-firefox-slate-placeholder-fixed/first-hangul-가.json";
import lfSlatePlGolden from "../../fixtures/linux-firefox-slate-plain-control/first-hangul-가.json";
import { attachImeRecorder } from "../attachImeRecorder";
import { composeEnter } from "../composeEnter";
import { resolveProfile } from "../profiles";
import safariEnterGolden from "../../fixtures/macos-safari-apple/broken-김-enter.json";
import { goldenCritical } from "../goldenCritical";
import { toCriticalEvents } from "../toCriticalEvents";
import { planHangulKeystrokes } from "../planHangulKeystrokes";

function visibleHangul(text: string): string {
  return text.replace(/[\uFEFF\u200B]/g, "");
}

type ComposedEvent = Awaited<ReturnType<typeof composeHangul>>[number];

function isInputOfType(event: ComposedEvent, inputType: string, data?: string): boolean {
  if (event.type !== "input" || event.inputType !== inputType) return false;
  if (data === undefined) return true;
  return event.data === data;
}

function isCompositionEnd(event: ComposedEvent): boolean {
  return event.type === "compositionend";
}

function isOverflowClampedInput(event: ComposedEvent): boolean {
  return (
    event.type === "input" &&
    event.inputType === "insertCompositionText" &&
    event.data === "가나다라마바사" &&
    event.value === "가나다라마바"
  );
}

function installHostMaxLengthClamp(input: HTMLInputElement): void {
  input.addEventListener("input", clampInputToMaxLength);
}

function clampInputToMaxLength(this: HTMLInputElement): void {
  if (this.value.length > this.maxLength) {
    this.value = this.value.slice(0, this.maxLength);
  }
}

async function expectSafariMaxLengthRejectsOverflow(): Promise<void> {
  const input = document.createElement("input");
  input.maxLength = 3;
  document.body.append(input);

  const events = await composeHangul(input, "가나다라", { profile: "macos-safari-apple" });

  expect(input.value).toBe("가나다");
  expect(events.some((e) => isInputOfType(e, "deleteCompositionText"))).toBe(true);
  expect(events.some((e) => isInputOfType(e, "insertFromComposition", ""))).toBe(true);

  input.remove();
}

async function expectSafariMacrotaskCommitsBetweenSyllables(): Promise<void> {
  const input = document.createElement("input");
  document.body.append(input);

  const events = await composeHangul(input, "김태", {
    profile: "macos-safari-apple",
    settle: "macrotask",
  });

  expect(input.value).toBe("김태");
  expect(events.filter(isCompositionEnd).length).toBeGreaterThanOrEqual(2);
  expect(events.some((e) => isInputOfType(e, "insertFromComposition", "김"))).toBe(true);

  input.remove();
}

async function expectSafariHostClampRejectsViaEmptyInsertText(): Promise<void> {
  const input = document.createElement("input");
  input.maxLength = 3;
  document.body.append(input);
  installHostMaxLengthClamp(input);

  const events = await composeHangul(input, "가나다라", { profile: "macos-safari-apple" });

  expect(input.value).toBe("가나다");
  expect(events.some((e) => isInputOfType(e, "insertText", ""))).toBe(true);

  input.remove();
}

async function expectAndroidHostClampKeepsOverflowData(): Promise<void> {
  const input = document.createElement("input");
  input.maxLength = 6;
  document.body.append(input);
  installHostMaxLengthClamp(input);

  const events = await composeHangul(input, "가나다라마바사", {
    profile: "android-chrome",
    commitFinal: false,
  });

  expect(input.value).toBe("가나다라마바");
  expect(events.find(isOverflowClampedInput)).toBeDefined();
  expect(events.some((e) => isInputOfType(e, "insertCompositionText", ""))).toBe(false);
  expect(events.filter(isCompositionEnd)).toHaveLength(0);

  input.remove();
}

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

  it("android-firefox-contenteditable-broken: 가나다 yields jamo-split ㄱㅏ나다", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가나다", { profile: "android-firefox-contenteditable-broken" });

    expect(input.value.replace(/\u200b/g, "")).toBe("ㄱㅏ나다");
    input.remove();
  });

  it("matches android-firefox-contenteditable-broken golden critical fields for 가나다", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가나다", {
      profile: "android-firefox-contenteditable-broken",
    });

    expect(input.value.replace(/\u200b/g, "")).toBe("ㄱㅏ나다");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(ceBrokenGolden.events));

    input.remove();
  });

  it("linux-firefox-contenteditable-fixed: 가나다 yields intact 가나다", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가나다", { profile: "linux-firefox-contenteditable-fixed" });

    expect(input.value.replace(/\u200b/g, "")).toBe("가나다");
    input.remove();
  });

  it("matches linux-firefox-contenteditable-fixed golden critical fields for 가나다", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가나다", {
      profile: "linux-firefox-contenteditable-fixed",
    });

    expect(input.value.replace(/\u200b/g, "")).toBe("가나다");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(ceFixedGolden.events));

    input.remove();
  });

  it("android-firefox-contenteditable-fixed: 가나다 yields intact 가나다 (AF post-fix v2)", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가나다", { profile: "android-firefox-contenteditable-fixed" });

    expect(input.value.replace(/\u200b/g, "")).toBe("가나다");
    input.remove();
  });

  it("matches android-firefox-contenteditable-fixed golden critical fields for 가나다", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가나다", {
      profile: "android-firefox-contenteditable-fixed",
    });

    expect(input.value.replace(/\u200b/g, "")).toBe("가나다");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(ceAfFixedGolden.events));

    input.remove();
  });

  it("android-chrome-slate-placeholder-broken: 가 yields jamo-split ㄱㄱㅏㄱㅏ", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가", { profile: "android-chrome-slate-placeholder-broken" });

    expect(input.value).toBe("ㄱㄱㅏㄱㅏ");
    input.remove();
  });

  it("matches android-chrome-slate-placeholder-broken golden critical fields for 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가", {
      profile: "android-chrome-slate-placeholder-broken",
    });

    expect(input.value).toBe("ㄱㄱㅏㄱㅏ");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(slateBrokenGolden.events));

    input.remove();
  });

  it("android-chrome-slate-plain-control: 가 yields intact 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가", { profile: "android-chrome-slate-plain-control" });

    expect(input.value).toBe("가");
    input.remove();
  });

  it("matches android-chrome-slate-plain-control golden critical fields for 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가", {
      profile: "android-chrome-slate-plain-control",
    });

    expect(input.value).toBe("가");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(slatePlainGolden.events));

    input.remove();
  });

  it("android-firefox-slate-placeholder-broken: 가 yields stuck ㄱ (not 가)", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가", { profile: "android-firefox-slate-placeholder-broken" });

    expect(input.value).toBe("ㄱ");
    expect(input.value).not.toBe("가");
    input.remove();
  });

  it("matches android-firefox-slate-placeholder-broken golden critical fields for 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가", {
      profile: "android-firefox-slate-placeholder-broken",
    });

    expect(input.value).toBe("ㄱ");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(afSlateBrokenGolden.events));

    input.remove();
  });

  it("android-firefox-slate-plain-control: 가 yields intact 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가", { profile: "android-firefox-slate-plain-control" });

    expect(input.value).toBe("가");
    input.remove();
  });

  it("matches android-firefox-slate-plain-control golden critical fields for 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가", {
      profile: "android-firefox-slate-plain-control",
    });

    expect(input.value).toBe("가");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(afSlatePlainGolden.events));

    input.remove();
  });

  it("linux-chrome-slate-placeholder-fixed: 가 yields intact 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가", { profile: "linux-chrome-slate-placeholder-fixed" });

    expect(visibleHangul(input.value)).toBe("가");
    input.remove();
  });

  it("matches linux-chrome-slate-placeholder-fixed golden critical fields for 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가", {
      profile: "linux-chrome-slate-placeholder-fixed",
    });

    expect(visibleHangul(input.value)).toBe("가");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(lcSlatePhGolden.events));

    input.remove();
  });

  it("linux-chrome-slate-plain-control: 가 yields intact 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가", { profile: "linux-chrome-slate-plain-control" });

    expect(input.value).toBe("가");
    input.remove();
  });

  it("matches linux-chrome-slate-plain-control golden critical fields for 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가", {
      profile: "linux-chrome-slate-plain-control",
    });

    expect(input.value).toBe("가");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(lcSlatePlGolden.events));

    input.remove();
  });

  it("linux-firefox-slate-placeholder-fixed: 가 yields intact 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가", { profile: "linux-firefox-slate-placeholder-fixed" });

    expect(input.value).toBe("가");
    input.remove();
  });

  it("matches linux-firefox-slate-placeholder-fixed golden critical fields for 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가", {
      profile: "linux-firefox-slate-placeholder-fixed",
    });

    expect(input.value).toBe("가");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(lfSlatePhGolden.events));

    input.remove();
  });

  it("linux-firefox-slate-plain-control: 가 yields intact 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "가", { profile: "linux-firefox-slate-plain-control" });

    expect(input.value).toBe("가");
    input.remove();
  });

  it("matches linux-firefox-slate-plain-control golden critical fields for 가", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "가", {
      profile: "linux-firefox-slate-plain-control",
    });

    expect(input.value).toBe("가");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(lfSlatePlGolden.events));

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

  it("matches android-chrome continuous-hangul critical fields for 김태희", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "김태희", { profile: "android-chrome" });
    expect(input.value).toBe("김태희");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(androidGolden.events));

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

  it("macos-safari-apple with maxLength rejects overflow on composition path", () =>
    expectSafariMaxLengthRejectsOverflow());

  it("macos-safari-apple settle macrotask commits between syllables on composition path", () =>
    expectSafariMacrotaskCommitsBetweenSyllables());

  it("macos-safari-apple maxLength with host clamp rejects via empty insertText", () =>
    expectSafariHostClampRejectsViaEmptyInsertText());

  it("android-chrome host clamp keeps overflow data with clamped value (no empty reject)", () =>
    expectAndroidHostClampKeepsOverflowData());
});
