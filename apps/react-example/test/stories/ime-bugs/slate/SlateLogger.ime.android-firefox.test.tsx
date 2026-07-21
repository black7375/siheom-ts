import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { measureReplayFidelity } from "@siheom/ime";

import { SlateLogger } from "./SlateLogger";
import { readSlatePlainText } from "./readSlatePlainText";
import v4Golden from "./fixtures/android-firefox/mechanism-fix-v4-still-explodes-가나다가나다.json";

describe("SlateLogger + android-firefox (upstream capture)", () => {
  it("events-only replay fidelity stays low on v4 (not a device gate)", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };

    render(
      <SlateLogger captureTarget="slate-placeholder" editorRef={editorRef} captureSlateDebug={false} />,
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
    });

    const report = await measureReplayFidelity(
      editorRef.current!,
      v4Golden.events,
      readSlatePlainText,
      { settle: "macrotask" },
    );

    expect(report.matchRate).toBeLessThan(0.2);
  });
});
