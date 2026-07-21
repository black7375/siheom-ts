import { describe, expect, it } from "vitest";
import { createEditor } from "slate";
import { withReact } from "slate-react";

import { createSlateCompositionDebugLog, pushSlateFixDebugEntry } from "./slateCompositionDebugLog";
import { readSlateCompositionSnapshot } from "./readSlateCompositionSnapshot";
import { noteSlateFixAction, setSlateFixCommittedHangul } from "./slateFixDebugState";

describe("readSlateCompositionSnapshot", () => {
  it("includes slate model, DOM placeholder flags, and fix state", () => {
    const editor = withReact(createEditor());
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    editable.innerHTML =
      '<span data-slate-node="element"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">가</span></span></span></span>';
    document.body.appendChild(editable);

    setSlateFixCommittedHangul(editor, "가");
    noteSlateFixAction(editor, "test-action", { foo: 1 });

    const snap = readSlateCompositionSnapshot(editor, editable);

    expect(snap.committedHangul).toBe("가");
    expect(snap.lastFixAction).toBe("test-action");
    expect(snap.slateDocument).toEqual(editor.children);
    expect(snap.isAndroid).toBeTypeOf("boolean");
    expect(snap.pendingDiffCount).toBe(0);

    editable.remove();
  });
});

describe("slateCompositionDebugLog.toExport", () => {
  it("exports compact fix trace without duplicating IME events", () => {
    const editor = withReact(createEditor());
    const log = createSlateCompositionDebugLog();
    const editable = document.createElement("div");

    noteSlateFixAction(editor, "committed-preedit", { next: "가" });
    pushSlateFixDebugEntry(
      log,
      "fixed",
      "committed-preedit",
      { next: "가" },
      {
        slateText: "",
        isComposingWeak: true,
        isComposingReact: false,
        pendingDiffCount: 0,
        committedHangul: "",
      },
    );

    const exported = log.toExport(editor, { editable, imeEventCount: 42 });

    expect(exported.imeEventCount).toBe(42);
    expect(exported.fixTrace).toHaveLength(1);
    expect(exported.fixTrace[0]?.action).toBe("committed-preedit");
    expect(exported.fixTrace[0]?.snap?.committedHangul).toBe("");
    expect(exported.summary.fixStepCount).toBe(1);
    expect(exported.final?.slateText).toBe("");
  });
});
