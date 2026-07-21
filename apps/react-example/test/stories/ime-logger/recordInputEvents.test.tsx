import { describe, expect, it } from "vitest";

import { readEditableValue } from "./recordInputEvents";

describe("readEditableValue", () => {
  it("excludes Slate placeholder nodes from contenteditable value", () => {
    const editor = document.createElement("div");
    editor.contentEditable = "true";
    editor.innerHTML =
      '<div data-slate-node="element"><span data-slate-node="text"><span data-slate-leaf="true">ㄱ</span></span></div>' +
      '<span data-slate-placeholder="true" contenteditable="false">여기에 입력…</span>';
    document.body.append(editor);

    expect(readEditableValue(editor)).toBe("ㄱ");

    editor.remove();
  });
});
