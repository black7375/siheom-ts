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
});
