import { describe, expect, it } from "vitest";

import { replayGoldenEvents } from "./replayGoldenEvents";
import type { ComposedEventRecord } from "../_internal/types";

describe("replayGoldenEvents writeback golden", () => {
  it("sets contenteditable text to golden value each step", async () => {
    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.append(div);

    const events: ComposedEventRecord[] = [
      {
        type: "beforeinput",
        key: null,
        code: null,
        keyCode: null,
        isComposing: true,
        inputType: "insertCompositionText",
        data: "ㄱ",
        value: "",
      },
      {
        type: "input",
        key: null,
        code: null,
        keyCode: null,
        isComposing: true,
        inputType: "insertCompositionText",
        data: "ㄱ",
        value: "ㄱ",
      },
    ];

    await replayGoldenEvents(div, events, { settle: "macrotask", writeback: "golden" });
    expect(div.textContent).toBe("ㄱ");
    div.remove();
  });
});
