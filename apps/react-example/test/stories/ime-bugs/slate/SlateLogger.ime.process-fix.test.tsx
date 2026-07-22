import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@/stories/render";
import {
  composeHangulAndroidFirefoxSlateNativeComposition,
  compositionIntentsFromEvents,
} from "@siheom/ime";

import { SlateLogger } from "./SlateLogger";
import deviceV2 from "./fixtures/android-firefox/device-v2-patched-process-still-buggy-가나다.json";
import { EXPECTED_SLATE_ANDROID_HANGUL_PATCH_ID, readSlatePatchProbe } from "./readSlatePatchProbe";

const TARGET = "가나다";

/**
 * Native-composition emulator paints into the composition region Slate selects at
 * compositionstart. With composition-anchor-v3, the Android run stays one composition so
 * cumulative preedit replaces cleanly (no committed+preedit flicker like `가가나`).
 *
 * A clean composing snapshot is exactly the IME's cumulative preedit (`ㄱ`, `가`, `간`, `가나`,
 * `가낟`, `가나다`). See docs/research/slate-closed-loop-emulator.md.
 */
describe("AF Slate composing process is clean (no flicker)", () => {
  it("loads patched slate-react in bundle", () => {
    expect(readSlatePatchProbe()).toEqual({
      expectedPatchId: EXPECTED_SLATE_ANDROID_HANGUL_PATCH_ID,
      loadedPatchId: EXPECTED_SLATE_ANDROID_HANGUL_PATCH_ID,
      patchActive: true,
    });
  });

  it("each composing snapshot is the cumulative preedit, with no committed text prepended", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    await render(
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
