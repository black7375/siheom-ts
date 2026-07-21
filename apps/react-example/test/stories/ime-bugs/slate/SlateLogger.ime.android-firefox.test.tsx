import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";
import { createImeActions, measureReplayFidelity } from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";

import { SlateLogger } from "./SlateLogger";
import { createSlateCompositionDebugLog } from "./slateCompositionDebugLog";
import { readSlatePlainText } from "./readSlatePlainText";
import v4Golden from "./fixtures/android-firefox/mechanism-fix-v4-still-explodes-가나다가나다.json";

function runWithSlateIme(profile: "android-firefox-slate-placeholder-broken") {
  return overrideSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: defaultGivens,
      effects: { ...defaultEffects, ...reactEffects },
    },
    {
      actions: createImeActions({ profile, resolveElement: "sync" }),
    },
  );
}

describe("SlateLogger alternatives + android-firefox IME", () => {
  it("alt-c records anchor + guard fixTrace without preedit drive", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const debugLog = createSlateCompositionDebugLog();
    const { runSiheom, actions, given } = runWithSlateIme(
      "android-firefox-slate-placeholder-broken",
    );

    await runSiheom(
      given.render(
        <SlateLogger
          fixMode="alt-c"
          captureTarget="slate-placeholder"
          editorRef={editorRef}
          debugLog={debugLog}
        />,
      ),
      actions.type(query.textbox("Slate editor"), "가"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
    });

    const actionsSeen = debugLog.entries.map((entry) => entry.action);
    expect(actionsSeen).not.toContain("committed-preedit");
    expect(actionsSeen.some((a) => a.includes("anchor") || a.includes("keydown-hide"))).toBe(true);
  });

  it("events-only replay fidelity stays low on v4 (not a device gate)", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };

    render(
      <SlateLogger
        fixMode="alt-c"
        captureTarget="slate-placeholder"
        editorRef={editorRef}
        captureSlateDebug={false}
      />,
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
