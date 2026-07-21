import { describe, expect, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  extendSiheom,
  query,
} from "@siheom/core";

import { createHanjaActions } from "./createHanjaActions";

describe("createHanjaActions", () => {
  it("extends siheom with actions.typeHanja(target, hanja, hangul)", async () => {
    const input = document.createElement("input");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-label", "검색");
    document.body.append(input);

    const { runSiheom, actions } = extendSiheom(
      {
        actions: createDefaultActions(),
        assertions: createDefaultAssertions(),
        givens: {},
        effects: defaultEffects,
      },
      { actions: createHanjaActions({ profile: "macos-safari-apple" }) },
    );

    await runSiheom(actions.typeHanja(query.combobox("검색"), "金泰熙", "김태희"));

    expect(input.value).toBe("金泰熙");
    input.remove();
  });

  it("types with resolveElement sync when the element is already present", async () => {
    const input = document.createElement("input");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-label", "검색");
    document.body.append(input);

    const actions = createHanjaActions({
      profile: "macos-safari-apple",
      resolveElement: "sync",
    });

    await actions.typeHanja(query.combobox("검색"), "金", "김");

    expect(input.value).toBe("金");
    input.remove();
  });

  it("rejects non-input targets", async () => {
    document.body.innerHTML = `<div role="textbox" aria-label="편집" contenteditable="true"></div>`;
    const actions = createHanjaActions({ resolveElement: "sync" });

    await expect(actions.typeHanja(query.textbox("편집"), "金", "김")).rejects.toThrow(
      /requires an input or textarea/,
    );
  });

  it("types Hanja into a textarea", async () => {
    document.body.innerHTML = "";
    const label = document.createElement("label");
    label.append("메모");
    const textarea = document.createElement("textarea");
    label.append(textarea);
    document.body.append(label);

    const actions = createHanjaActions({
      profile: "macos-safari-apple",
      resolveElement: "sync",
    });

    await actions.typeHanja(query.textbox("메모"), "金", "김");

    expect(textarea.value).toBe("金");
  });
});
