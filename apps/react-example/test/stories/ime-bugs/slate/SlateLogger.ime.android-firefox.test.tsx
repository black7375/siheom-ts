import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { measureReplayFidelity } from "@siheom/ime";

import { SlateLogger } from "./SlateLogger";
import { readSlatePlainText } from "./readSlatePlainText";
import v3Golden from "./fixtures/android-firefox/mechanism-fix-v3-cumulative-preedit-가나다가나다.json";
import v4Golden from "./fixtures/android-firefox/mechanism-fix-v4-still-explodes-가나다가나다.json";

describe("SlateLogger + android-firefox (upstream, no app patch)", () => {
  it("events-only replay fidelity stays low on v4 capture (not a device gate)", async () => {
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

describe("Experiment 1: golden writeback on plain contenteditable", () => {
  it("events-only plain CE stays low-fidelity on v3 capture", async () => {
    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.append(div);

    const report = await measureReplayFidelity(
      div,
      v3Golden.events,
      readSlatePlainText,
      { settle: "macrotask" },
    );

    expect(report.matchRate).toBeLessThan(0.2);
    div.remove();
  });

  it("golden writeback plain CE reaches 100% on v3 and v4 captures", async () => {
    for (const golden of [v3Golden, v4Golden]) {
      const div = document.createElement("div");
      div.contentEditable = "true";
      document.body.append(div);

      const report = await measureReplayFidelity(
        div,
        golden.events,
        readSlatePlainText,
        { settle: "macrotask", writeback: "golden" },
      );

      expect(report.matchRate).toBe(1);
      div.remove();
    }
  });
});
