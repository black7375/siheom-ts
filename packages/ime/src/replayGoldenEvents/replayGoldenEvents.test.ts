import { describe, expect, it } from "vitest";

import type { ComposedEventRecord } from "../_internal";
import { replayGoldenEvents } from "./replayGoldenEvents";

describe("replayGoldenEvents", () => {
  it("replays key and composition events on an input", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    const golden: ComposedEventRecord[] = [
      {
        type: "keydown",
        key: "Process",
        code: "KeyR",
        keyCode: 229,
        isComposing: false,
        inputType: null,
        data: null,
        value: "",
      },
      {
        type: "compositionstart",
        key: null,
        code: null,
        keyCode: null,
        isComposing: null,
        inputType: null,
        data: "",
        value: "",
      },
      {
        type: "compositionupdate",
        key: null,
        code: null,
        keyCode: null,
        isComposing: null,
        inputType: null,
        data: "ㄱ",
        value: "",
      },
    ];

    const records = await replayGoldenEvents(input, golden);
    expect(records.map((event) => event.type)).toEqual([
      "keydown",
      "compositionstart",
      "compositionupdate",
    ]);

    input.remove();
  });
});
