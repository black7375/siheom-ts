import { describe, expect, it } from "vitest";

import { attachImeRecorder } from "../attachImeRecorder";
import { composeEnter } from "../composeEnter";
import { composeHangul } from "../composeHangul";
import { goldenCritical } from "../goldenCritical";
import { resolveProfile } from "../profiles";
import { toCriticalEvents } from "../toCriticalEvents";

import msContinuous from "../../fixtures/windows-chrome-ms/continuous-hangul.json";
import ngsTipTapEnter from "../../fixtures/windows-chrome-ngs/tiptap-broken-enter-김.json";

function withRecordedInput(
  run: (input: HTMLInputElement, recorder: ReturnType<typeof attachImeRecorder>) => Promise<void>,
) {
  return async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);
    try {
      await run(input, recorder);
    } finally {
      recorder.detach();
      input.remove();
    }
  };
}

describe("Windows IME profiles (MS / Ngs / Firefox)", () => {
  it("resolves windows-chrome-ms and windows-chrome-ngs as chromium-duplicate composition", () => {
    expect(resolveProfile("windows-chrome-ms")).toMatchObject({
      enterDuringComposition: "chromium-duplicate",
      hangulKeyEventKey: "process",
      hangulComposeMode: "composition",
      hangulCompositionBoundary: "syllable",
      hangulKeyboard: "dubeolsik",
      postCompositionEndInput: false,
    });
    expect(resolveProfile("windows-chrome-ngs")).toMatchObject({
      enterDuringComposition: "chromium-duplicate",
      hangulKeyEventKey: "process",
      hangulComposeMode: "composition",
      hangulCompositionBoundary: "syllable",
      hangulKeyboard: "sebeolsik-ngs",
      postCompositionEndInput: false,
    });
  });

  it("resolves windows-firefox-ms as webkit Enter (compositionend then Enter 13)", () => {
    expect(resolveProfile("windows-firefox-ms")).toMatchObject({
      enterDuringComposition: "webkit",
      hangulKeyEventKey: "process",
      hangulComposeMode: "composition",
      hangulCompositionBoundary: "syllable",
      hangulKeyboard: "dubeolsik",
      postCompositionEndInput: true,
    });
  });

  it("matches windows-chrome-ms continuous-hangul critical fields for 김태희", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const events = await composeHangul(input, "김태희", { profile: "windows-chrome-ms" });
    expect(input.value).toBe("김태희");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(msContinuous.events));

    input.remove();
  });

  it("windows-chrome-ngs composes 김태희 to the final value (세벌식 mid-preedit differs from 2-set planner)", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangul(input, "김태희", { profile: "windows-chrome-ngs" });
    expect(input.value).toBe("김태희");

    input.remove();
  });

  it("windows-chrome-ngs TipTap enter: Hangul then Enter matches OS golden critical path", async () => {
    await withRecordedInput(async (input, recorder) => {
      await composeHangul(input, "김", {
        commitFinal: false,
        profile: "windows-chrome-ngs",
      });
      await composeEnter(input, resolveProfile("windows-chrome-ngs"));

      expect(input.value).toBe("김");
      expect(toCriticalEvents(recorder.events)).toEqual(goldenCritical(ngsTipTapEnter.events));
    })();
  });

  it("windows-firefox-ms Enter during composition is compositionend then Enter 13", async () => {
    await withRecordedInput(async (input, recorder) => {
      await composeHangul(input, "김", {
        commitFinal: false,
        profile: "windows-firefox-ms",
      });
      await composeEnter(input, resolveProfile("windows-firefox-ms"));

      const types = toCriticalEvents(recorder.events).map((event) => ({
        type: event.type,
        key: event.key,
        code: event.code,
        keyCode: event.keyCode,
        isComposing: event.isComposing,
      }));
      const endIndex = types.findIndex((event) => event.type === "compositionend");
      const processEnter = types.findIndex(
        (event) =>
          event.type === "keydown" &&
          event.key === "Process" &&
          event.code === "Enter" &&
          event.keyCode === 229,
      );
      const enterIndex = types.findIndex(
        (event) => event.type === "keydown" && event.key === "Enter" && event.keyCode === 13,
      );

      expect(endIndex).toBeGreaterThan(-1);
      expect(enterIndex).toBeGreaterThan(endIndex);
      expect(processEnter).toBe(-1);
      expect(types[enterIndex]?.isComposing).toBe(false);
    })();
  });
});
