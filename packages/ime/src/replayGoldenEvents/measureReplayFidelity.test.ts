import { describe, expect, it } from "vitest";

import type { ComposedEventRecord } from "../_internal/types";
import { measureReplayFidelity } from "./measureReplayFidelity";

describe("measureReplayFidelity", () => {
  it("golden writeback matches golden values on plain contenteditable", async () => {
    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.append(div);

    const events: ComposedEventRecord[] = [
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

    const report = await measureReplayFidelity(div, events, (el) => el.textContent ?? "", {
      writeback: "golden",
      settle: "macrotask",
    });

    expect(report.matchRate).toBe(1);
    div.remove();
  });

  it("events-only replay may diverge from golden (documents emulation gap)", async () => {
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

    const report = await measureReplayFidelity(div, events, (el) => el.textContent ?? "", {
      settle: "macrotask",
    });

    // Plain div without IME: last step often mismatches — that's the point.
    expect(report.steps.length).toBe(2);
    div.remove();
  });
});
