import { describe, expect, it } from "vitest";

describe("synthetic InputEvent isComposing", () => {
  it("preserves isComposing through dispatchEvent on contenteditable", () => {
    const el = document.createElement("div");
    el.contentEditable = "true";
    document.body.append(el);

    let seen: boolean | null = null;
    el.addEventListener(
      "input",
      (event) => {
        if (event instanceof InputEvent) {
          seen = event.isComposing;
        }
      },
      true,
    );

    const event = new InputEvent("input", {
      bubbles: true,
      inputType: "insertCompositionText",
      data: "ㅏ",
      isComposing: true,
    });
    el.dispatchEvent(event);

    expect(seen).toBe(true);
    el.remove();
  });
});
