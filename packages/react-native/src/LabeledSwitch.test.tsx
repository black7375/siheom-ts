import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "./index.ts";
import { ConditionalBanner } from "./fixtures/ConditionalBanner.tsx";
import { LabeledSwitch } from "./fixtures/LabeledSwitch.tsx";

describe("LabeledSwitch", () => {
  it("click maps to userEvent.press and checked works for checkbox role", async () => {
    await runSiheom(
      given.render(<LabeledSwitch label="알림" />),
      assertions.not.checked(query.checkbox("알림")),
      actions.click(query.checkbox("알림")),
      assertions.checked(query.checkbox("알림")),
    );
  });
});

describe("visible assertions", () => {
  it("supports visible and not.visible via toBeOnTheScreen", async () => {
    await runSiheom(
      given.render(<ConditionalBanner />),
      assertions.visible(query.text("banner")),
      actions.click(query.button("hide")),
      assertions.not.visible(query.text("banner")),
    );
  });
});
