import { describe, expect, it } from "vitest";

import { actions, assertions, given, query, runSiheom } from "@siheom/react";

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

  it("seeds a list item for the list-item-start scenario", async () => {
    const captureApiRef: { current: ImeCaptureApi | null } = { current: null };

    await runSiheom(
      given.render(<TipTapLogger scenario="list-item-start" captureApiRef={captureApiRef} />),
      assertions.visible(query.textbox("TipTap editor")),
    );

    const trace = captureApiRef.current!.buildTrace();
    expect(trace.scenarioId).toBe("tiptap-list-ime");
    expect(trace).toMatchObject({
      tiptapDebug: { final: { nodeType: "listItem" } },
    });
  });
});
