import { describe, expect, it } from "vitest";

import { assertions, given, query, runSiheom } from "@siheom/react";

import { TipTapLogger } from "./TipTapLogger";

describe("TipTapLogger", () => {
  it("renders an accessible contenteditable editor", async () => {
    await runSiheom(
      given.render(<TipTapLogger />),
      assertions.visible(query.textbox("TipTap editor")),
    );
  });

  it('registers Storybook title "IME/TipTap"', async () => {
    const stories = await import("./TipTapLogger.stories");
    expect(stories.default.title).toBe("IME/TipTap");
  });
});
