import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";

import { SlateLogger } from "./SlateLogger";
import { createSlateExplorationLog } from "./slateExplorationCapture";
import brokenGate from "./fixtures/android-firefox/device-alt-gate-broken-가나다.json";

describe("SlateLogger exploration export", () => {
  it("includes exploration sections in traceExtra shape", async () => {
    const explorationLog = createSlateExplorationLog();

    render(
      <SlateLogger
        captureTarget="slate-placeholder"
        explorationLog={explorationLog}
        captureExploration={true}
      />,
    );

    await waitFor(() => {
      expect(document.querySelector('[aria-label="Slate editor"]')).not.toBeNull();
    });

    const exported = explorationLog.toExport({ events: brokenGate.events });
    expect(exported.timeline).toEqual([]);
    expect(exported.sourceMapHints.length).toBeGreaterThan(0);
    expect(exported.minimalFixture.path).toContain("slate-minimal-dom-fixture.html");
    expect(exported.domStructures).toEqual([]);
  });
});
