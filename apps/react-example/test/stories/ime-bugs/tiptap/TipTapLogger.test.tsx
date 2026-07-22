import { describe, expect, it } from "vitest";

import { actions, given, query, runSiheom } from "@siheom/react";

import type { ImeCaptureApi } from "../../ime-logger/ImeCaptureShell";
import { TipTapLogger } from "./TipTapLogger";

describe("TipTapLogger", () => {
  it("includes TipTap editor text in the IME capture trace", async () => {
    const captureApiRef: { current: ImeCaptureApi | null } = { current: null };

    await runSiheom(
      given.render(<TipTapLogger captureApiRef={captureApiRef} />),
      actions.type(query.textbox("TipTap editor"), "a"),
    );

    const trace = captureApiRef.current!.buildTrace();
    expect(trace.events.length).toBeGreaterThan(0);
    expect(trace).toMatchObject({
      tiptapDebug: { final: { editorText: "a" } },
    });
  });
});
