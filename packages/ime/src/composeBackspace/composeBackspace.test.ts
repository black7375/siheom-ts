import { describe, expect, it } from "vitest";

import { attachImeRecorder } from "../attachImeRecorder";
import { composeBackspace } from "./composeBackspace";
import { toCriticalEvents } from "../toCriticalEvents";

describe("composeBackspace", () => {
  it("deletes a selection range when not composing", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const recorder = attachImeRecorder(input);

    try {
      input.value = "김태희";
      input.setSelectionRange(1, 3);

      await composeBackspace(input);

      expect(input.value).toBe("김");
      expect(input.selectionStart).toBe(1);
      expect(input.selectionEnd).toBe(1);
      expect(
        toCriticalEvents(recorder.events).some(
          (event) => event.type === "beforeinput" && event.inputType === "deleteContentBackward",
        ),
      ).toBe(true);
    } finally {
      recorder.detach();
      input.remove();
    }
  });
});
