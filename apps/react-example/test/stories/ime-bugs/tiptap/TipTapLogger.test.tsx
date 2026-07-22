import { describe, it } from "vitest";

import { assertions, given, query, runSiheom } from "@siheom/react";

import { TipTapLogger } from "./TipTapLogger";

describe("TipTapLogger", () => {
  it("renders an accessible contenteditable editor", async () => {
    await runSiheom(
      given.render(<TipTapLogger />),
      assertions.visible(query.textbox("TipTap editor")),
    );
  });
});
