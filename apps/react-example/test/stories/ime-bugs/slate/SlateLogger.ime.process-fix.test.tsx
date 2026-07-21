import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import {
  composeHangulAndroidFirefoxSlateNativeComposition,
  compositionIntentsFromEvents,
} from "@siheom/ime";

import { SlateLogger } from "./SlateLogger";
import deviceV2 from "./fixtures/android-firefox/device-v2-patched-process-still-buggy-가나다.json";

const TARGET = "가나다";

/**
 * RED for the real fix. The native-composition emulator paints into the composition region the
 * editor SELECTS at compositionstart, so this goes green once Slate keeps the Android run as one
 * composition (selection spans the composed text → cumulative preedit replaces cleanly) instead
 * of committing per syllable (collapsed caret → cumulative preedit appends → `가가나`).
 *
 * A clean composing snapshot is exactly the IME's cumulative preedit (`ㄱ`, `가`, `간`, `가나`,
 * `가낟`, `가나다`). The bug prepends the committed text (`가간`, `가가나`, `가나가나ㄷ`).
 *
 * Currently RED: v2-patched Slate collapses per syllable, so the native paint duplicates.
 * See docs/research/slate-closed-loop-emulator.md.
 */
describe("AF Slate composing process is clean (no flicker) — RED until the run-composition fix", () => {
  it("each composing snapshot is the cumulative preedit, with no committed text prepended", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    render(
      <SlateLogger
        captureTarget="slate-placeholder"
        editorRef={editorRef}
        captureExploration={false}
      />,
    );
    await waitFor(() => expect(editorRef.current).not.toBeNull());

    const intents = compositionIntentsFromEvents(deviceV2.events);
    const expectedPreedits = intents.flatMap((intent) =>
      intent.kind === "update" ? [intent.data] : [],
    );

    const { visibleTimeline, final } = await composeHangulAndroidFirefoxSlateNativeComposition(
      editorRef.current!,
      intents,
    );
    const nativePaints = visibleTimeline
      .filter((step) => step.phase === "native-paint")
      .map((step) => step.value);

    expect(final).toBe(TARGET);
    // Clean process: what the user sees === the cumulative preedit, never committed + preedit.
    expect(nativePaints).toEqual(expectedPreedits);
  });
});
