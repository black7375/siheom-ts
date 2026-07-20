import { describe, expect, it } from "vitest";

import { attachImeRecorder } from "../attachImeRecorder";
import { composeArrowLeft } from "./composeArrowLeft";
import { composeHangul } from "../composeHangul";

describe("composeArrowLeft", () => {
  it("moves the caret left without compositionend when not composing", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);

    try {
      input.value = "김태";
      input.setSelectionRange(2, 2);

      await composeArrowLeft(input);

      expect(input.selectionStart).toBe(1);
      expect(recorder.events.some((event) => event.type === "compositionend")).toBe(false);
      expect(recorder.events.map((event) => event.type)).toEqual(["keydown", "keyup"]);
    } finally {
      recorder.detach();
      input.remove();
    }
  });

  it("does not move the caret when already at the start", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    try {
      input.value = "김";
      input.setSelectionRange(0, 0);

      await composeArrowLeft(input);

      expect(input.selectionStart).toBe(0);
    } finally {
      input.remove();
    }
  });

  it("ends composition before moving when composing", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);

    try {
      await composeHangul(input, "김", { commitFinal: false });
      const before = input.selectionStart ?? 0;

      await composeArrowLeft(input);

      expect(recorder.events.some((event) => event.type === "compositionend")).toBe(true);
      expect(input.selectionStart).toBe(before - 1);
    } finally {
      recorder.detach();
      input.remove();
    }
  });
});
