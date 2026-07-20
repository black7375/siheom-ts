import { describe, expect, it } from "vitest";

import { attachImeRecorder } from "../attachImeRecorder";
import { composeEnter } from "./composeEnter";
import { composeHangul, type ComposedEventRecord } from "../composeHangul";
import { toCriticalEvents } from "../toCriticalEvents";
import { resolveProfile } from "../profiles";

async function withRecordedInput(
  run: (input: HTMLInputElement, recorder: ReturnType<typeof attachImeRecorder>) => Promise<void>,
) {
  const input = document.createElement("input");
  document.body.append(input);
  const recorder = attachImeRecorder(input);
  try {
    await run(input, recorder);
  } finally {
    recorder.detach();
    input.remove();
  }
}

function criticalSummary(events: ComposedEventRecord[]) {
  return toCriticalEvents(events).map((event) => ({
    type: event.type,
    key: event.key,
    keyCode: event.keyCode,
    isComposing: event.isComposing,
  }));
}

describe("composeEnter during composition", () => {
  it("webkit (macos-safari): compositionend then Enter with isComposing false", async () => {
    await withRecordedInput(async (input, recorder) => {
      await composeHangul(input, "김", { commitFinal: false });
      await composeEnter(input, resolveProfile("macos-safari"));

      const types = criticalSummary(recorder.events);
      const endIndex = types.findIndex((event) => event.type === "compositionend");
      const enterIndex = types.findIndex(
        (event) => event.type === "keydown" && event.key === "Enter",
      );
      expect(endIndex).toBeGreaterThan(-1);
      expect(enterIndex).toBeGreaterThan(endIndex);
      expect(types[enterIndex]).toMatchObject({
        key: "Enter",
        keyCode: 13,
        isComposing: false,
      });
    });
  });

  it("chromium-enter-229: 229 keydown before compositionend", async () => {
    await withRecordedInput(async (input, recorder) => {
      await composeHangul(input, "김", { commitFinal: false });
      await composeEnter(input, resolveProfile("chromium-enter-229"));

      const types = criticalSummary(recorder.events);
      const confirmKeyIndex = types.findIndex(
        (event) => event.type === "keydown" && event.keyCode === 229 && event.isComposing === true,
      );
      const endIndex = types.findIndex((event) => event.type === "compositionend");
      expect(confirmKeyIndex).toBeGreaterThan(-1);
      expect(endIndex).toBeGreaterThan(confirmKeyIndex);
      expect(types.some((event) => event.type === "keydown" && event.key === "Enter")).toBe(false);
    });
  });

  it("linux-chrome-ibus-hangul: compositionend then Enter like Safari (OS capture)", async () => {
    await withRecordedInput(async (input, recorder) => {
      await composeHangul(input, "김", { commitFinal: false });
      await composeEnter(input, resolveProfile("linux-chrome-ibus-hangul"));

      const types = criticalSummary(recorder.events);
      const endIndex = types.findIndex((event) => event.type === "compositionend");
      const enterIndex = types.findIndex(
        (event) => event.type === "keydown" && event.key === "Enter",
      );
      expect(endIndex).toBeGreaterThan(-1);
      expect(enterIndex).toBeGreaterThan(endIndex);
      expect(types[enterIndex]).toMatchObject({
        key: "Enter",
        keyCode: 13,
        isComposing: false,
      });
    });
  });

  it("chromium-duplicate (windows-chrome-ms): 229 then Enter 13 after end", async () => {
    await withRecordedInput(async (input, recorder) => {
      await composeHangul(input, "김", { commitFinal: false });
      await composeEnter(input, resolveProfile("windows-chrome-ms"));

      const types = criticalSummary(recorder.events);
      const k229 = types.findIndex((event) => event.type === "keydown" && event.keyCode === 229);
      const endIndex = types.findIndex((event) => event.type === "compositionend");
      const enterIndex = types.findIndex(
        (event) => event.type === "keydown" && event.key === "Enter" && event.keyCode === 13,
      );
      expect(k229).toBeGreaterThan(-1);
      expect(endIndex).toBeGreaterThan(k229);
      expect(enterIndex).toBeGreaterThan(endIndex);
    });
  });
});

describe("composeEnter when not composing", () => {
  it("fires plain Enter keydown/keyup with isComposing false", async () => {
    await withRecordedInput(async (input, recorder) => {
      input.value = "김";
      input.setSelectionRange(1, 1);

      await composeEnter(input, resolveProfile("linux-chrome-ibus-hangul"));

      expect(
        recorder.events.map((event) => ({
          type: event.type,
          key: event.key,
          keyCode: event.keyCode,
          isComposing: event.isComposing,
        })),
      ).toEqual([
        { type: "keydown", key: "Enter", keyCode: 13, isComposing: false },
        { type: "keyup", key: "Enter", keyCode: 13, isComposing: false },
      ]);
      expect(recorder.events.some((event) => event.type === "compositionend")).toBe(false);
    });
  });
});
