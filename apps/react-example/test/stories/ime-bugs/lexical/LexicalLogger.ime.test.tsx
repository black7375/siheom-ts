import { describe, expect, it } from "vitest";
import { getElement, query } from "@siheom/core";

import { LexicalLogger } from "./LexicalLogger";
import { runWithImeSiheom } from "../shared/runWithImeSiheom";

describe("LexicalLogger + android-firefox-lexical IME", () => {
  it("typing 가나다 does not compose intact 가나다 in Lexical", async () => {
    const { runSiheom, actions, given } = runWithImeSiheom({
      profile: "android-firefox-lexical",
      resolveElement: "sync",
    });

    await runSiheom(
      given.render(<LexicalLogger />),
      actions.type(query.textbox("Lexical editor"), "가나다"),
    );

    const editor = getElement(query.textbox("Lexical editor"), true);
    const visible = editor.textContent?.replace(/\u200b/g, "") ?? "";
    expect(visible).not.toBe("가나다");
  });
});
