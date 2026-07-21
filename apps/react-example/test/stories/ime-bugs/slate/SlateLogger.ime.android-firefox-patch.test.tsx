import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { measureReplayFidelity } from "@siheom/ime";

import { SlateLogger } from "./SlateLogger";
import { readSlatePlainText } from "./readSlatePlainText";
import exploreGa from "./fixtures/android-firefox/device-explore-ㄱ가나다.json";
import { EXPECTED_SLATE_ANDROID_HANGUL_PATCH_ID, readSlatePatchProbe } from "./readSlatePatchProbe";

/** First syllable events from AF device capture — orphan ㄱ repro. */
const FIRST_GA_EVENTS = exploreGa.events.slice(0, 15);

/** Full 가나다 session (through first compositionend). */
const FIRST_WORD_EVENTS = exploreGa.events.slice(0, 40);

describe("bun patch slate-react: composition anchor (AF Hangul)", () => {
  it("loads patched slate-react in bundle", () => {
    expect(readSlatePatchProbe()).toEqual({
      expectedPatchId: EXPECTED_SLATE_ANDROID_HANGUL_PATCH_ID,
      loadedPatchId: EXPECTED_SLATE_ANDROID_HANGUL_PATCH_ID,
      patchActive: true,
    });
  });

  async function replay(events: typeof exploreGa.events) {
    const editorRef: { current: HTMLElement | null } = { current: null };

    render(
      <SlateLogger captureTarget="slate-placeholder" editorRef={editorRef} captureExploration={false} />,
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
    });

    const report = await measureReplayFidelity(
      editorRef.current!,
      events as Parameters<typeof measureReplayFidelity>[1],
      readSlatePlainText,
      { settle: "macrotask" },
    );

    return { report, editorRef };
  }

  it("first 가 session ends with 가, not ㄱ or ㄱ가", async () => {
    const { report, editorRef } = await replay(FIRST_GA_EVENTS);

    if (readSlatePlainText(editorRef.current!) !== "가") {
      console.log(
        report.steps.map((s) => `#${s.index} ${s.type} data=${s.data} → ${JSON.stringify(s.actual)}`),
      );
    }

    expect(readSlatePlainText(editorRef.current!)).toBe("가");
  });

  it("full 가나다 replay has no orphan ㄱ prefix (vitest ≠ device gate)", async () => {
    const { editorRef } = await replay(FIRST_WORD_EVENTS);
    const text = readSlatePlainText(editorRef.current!);

    expect(text).not.toMatch(/^ㄱ/);
    expect(text.endsWith("가나다")).toBe(true);
  });
});
