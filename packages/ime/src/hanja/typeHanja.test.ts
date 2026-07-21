import { describe, expect, it } from "vitest";

import { toCriticalEvents } from "../toCriticalEvents";
import chromeFixed from "../../../../apps/react-example/test/stories/ime-bugs/candidate-conversion/fixtures/macos-chrome-apple/fixed-hanja-name.json";
import { typeHanja } from "./typeHanja";

/** Alt (value 김) through last non-keyup critical event before value becomes 金 (confirm still at 김金). */
function chromeAppendThroughConfirmKimKim(events: typeof chromeFixed.events) {
  const alt = events.findIndex((e) => e.type === "keydown" && e.key === "Alt" && e.value === "김");
  const settledKeyup = events.findIndex((e) => e.type === "keyup" && e.value === "金");
  return events.slice(alt, settledKeyup);
}

describe("typeHanja", () => {
  it("types 金泰熙 via 김태희 readings on Safari replace profile", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await typeHanja(input, "金泰熙", "김태희", { profile: "macos-safari-apple" });

    expect(input.value).toBe("金泰熙");
    input.remove();
  });

  it("types 金泰熙 via 김태희 readings on Chrome append profile", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await typeHanja(input, "金泰熙", "김태희", { profile: "macos-chrome-apple" });

    expect(input.value).toBe("金泰熙");
    input.remove();
  });

  it("throws when hanja and hangul lengths differ", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await expect(typeHanja(input, "金泰熙", "김태")).rejects.toThrow(/length must match/);
    input.remove();
  });

  it("Chrome append: conversion+confirm critical matches fixed-hanja-name through first 김金", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await typeHanja(input, "金", "김", { profile: "macos-chrome-apple" });
    const fromAlt = events.slice(events.findIndex((e) => e.type === "keydown" && e.key === "Alt"));
    const expected = toCriticalEvents(chromeAppendThroughConfirmKimKim(chromeFixed.events));

    // Match golden through confirm preedit at 김金; settle (compositionend → 金) follows for chaining.
    expect(toCriticalEvents(fromAlt).slice(0, expected.length)).toEqual(expected);
    expect(input.value).toBe("金");

    input.remove();
  });
});
