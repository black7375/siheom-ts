import { describe, expect, it } from "vitest";

import { attachImeRecorder } from "./attachImeRecorder";
import { composeEnter } from "./composeEnter";
import { composeHangul, toCriticalEvents } from "./composeHangul";
import { resolveProfile } from "./profiles";

describe("composeEnter during composition", () => {
  it("webkit (macos-safari): compositionend then Enter with isComposing false", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);

    await composeHangul(input, "김", { commitFinal: false });
    await composeEnter(input, resolveProfile("macos-safari"));

    const types = toCriticalEvents(recorder.events).map((event) => ({
      type: event.type,
      key: event.key,
      keyCode: event.keyCode,
      isComposing: event.isComposing,
    }));

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

    recorder.detach();
    input.remove();
  });

  it("chromium-enter-229: 229 keydown before compositionend", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);

    await composeHangul(input, "김", { commitFinal: false });
    await composeEnter(input, resolveProfile("chromium-enter-229"));

    const types = toCriticalEvents(recorder.events).map((event) => ({
      type: event.type,
      key: event.key,
      keyCode: event.keyCode,
      isComposing: event.isComposing,
    }));

    const confirmKeyIndex = types.findIndex(
      (event) =>
        event.type === "keydown" && event.keyCode === 229 && event.isComposing === true,
    );
    const endIndex = types.findIndex((event) => event.type === "compositionend");
    expect(confirmKeyIndex).toBeGreaterThan(-1);
    expect(endIndex).toBeGreaterThan(confirmKeyIndex);
    expect(types.some((event) => event.type === "keydown" && event.key === "Enter")).toBe(
      false,
    );

    recorder.detach();
    input.remove();
  });

  it("linux-chrome-ibus-hangul: compositionend then Enter like Safari (OS capture)", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);

    await composeHangul(input, "김", { commitFinal: false });
    await composeEnter(input, resolveProfile("linux-chrome-ibus-hangul"));

    const types = toCriticalEvents(recorder.events).map((event) => ({
      type: event.type,
      key: event.key,
      keyCode: event.keyCode,
      isComposing: event.isComposing,
    }));

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

    recorder.detach();
    input.remove();
  });

  it("chromium-duplicate (windows-chrome-ms): 229 then Enter 13 after end", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);

    await composeHangul(input, "김", { commitFinal: false });
    await composeEnter(input, resolveProfile("windows-chrome-ms"));

    const types = toCriticalEvents(recorder.events).map((event) => ({
      type: event.type,
      key: event.key,
      keyCode: event.keyCode,
      isComposing: event.isComposing,
    }));

    const k229 = types.findIndex(
      (event) => event.type === "keydown" && event.keyCode === 229,
    );
    const endIndex = types.findIndex((event) => event.type === "compositionend");
    const enterIndex = types.findIndex(
      (event) => event.type === "keydown" && event.key === "Enter" && event.keyCode === 13,
    );
    expect(k229).toBeGreaterThan(-1);
    expect(endIndex).toBeGreaterThan(k229);
    expect(enterIndex).toBeGreaterThan(endIndex);

    recorder.detach();
    input.remove();
  });
});
