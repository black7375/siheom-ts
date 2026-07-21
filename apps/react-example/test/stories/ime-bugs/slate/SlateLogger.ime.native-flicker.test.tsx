import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import {
  composeHangulAndroidFirefoxSlateNativeComposition,
  compositionIntentsFromEvents,
} from "@siheom/ime";

import { SlateLogger } from "./SlateLogger";
import deviceV2 from "./fixtures/android-firefox/device-v2-patched-process-still-buggy-가나다.json";

/**
 * Device-faithful reproduction of the composing FLICKER against real (patched) Slate.
 *
 * The native-composition model paints `committed + cumulative preedit` before Slate reconciles,
 * so the emulation exhibits the same transient duplication (`가가나`, `가나가나ㄷ`) the user sees
 * on the device — which plain event replay and event-only closed-loop both miss.
 *
 * This is the RED for the real fix: when the composing process is fixed, these native-paint
 * duplications must disappear (final stays 가나다). See docs/research/slate-closed-loop-emulator.md.
 */
describe("native-composition emulator reproduces the device flicker on real Slate", () => {
  async function run() {
    const editorRef: { current: HTMLElement | null } = { current: null };
    render(
      <SlateLogger captureTarget="slate-placeholder" editorRef={editorRef} captureExploration={false} />,
    );
    await waitFor(() => expect(editorRef.current).not.toBeNull());

    const intents = compositionIntentsFromEvents(deviceV2.events);
    return composeHangulAndroidFirefoxSlateNativeComposition(editorRef.current!, intents);
  }

  it("native paint shows the same duplicated flicker the device shows", async () => {
    const { visibleTimeline, final } = await run();
    const nativePaints = visibleTimeline
      .filter((step) => step.phase === "native-paint")
      .map((step) => step.value);

    // The device flicker values (device capture input events showed these).
    expect(nativePaints).toContain("가가나");
    expect(nativePaints).toContain("가나가나ㄷ");
    // Committed final is still correct (v2 masks the flicker at commit).
    expect(final).toBe("가나다");
  });

  it("Slate reconciles each flicker back toward the clean run (가가나 → 가나)", async () => {
    const { visibleTimeline } = await run();
    const byStep = new Map<number, Record<string, string>>();
    for (const step of visibleTimeline) {
      const row = byStep.get(step.index) ?? {};
      row[step.phase] = step.value;
      byStep.set(step.index, row);
    }
    // Find the step whose native paint duplicated to 가가나 and assert Slate cleaned it.
    const dup = [...byStep.values()].find((row) => row["native-paint"] === "가가나");
    expect(dup?.reconcile).toBe("가나");
  });
});
