import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { composeHangulAndroidFirefoxSlateClosedLoopOn } from "@siheom/ime";

import { SlateLogger } from "./SlateLogger";
import { readSlatePlainText } from "./readSlatePlainText";

/**
 * Closed-loop AF Hangul emulator: drives real (patched) Slate by dispatching
 * composition/beforeinput per stroke and letting Slate mediate — no golden replay.
 * Faithfulness gate lives in a sibling spec (unpatched → ㄱ).
 */
describe("closed-loop AF emulator drives real Slate", () => {
  async function typeInto(text: string): Promise<string> {
    const editorRef: { current: HTMLElement | null } = { current: null };

    render(
      <SlateLogger captureTarget="slate-placeholder" editorRef={editorRef} captureExploration={false} />,
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
    });

    await composeHangulAndroidFirefoxSlateClosedLoopOn(editorRef.current!, text);
    return readSlatePlainText(editorRef.current!);
  }

  it("types 가 into patched Slate → editor shows 가", async () => {
    expect(await typeInto("가")).toBe("가");
  });

  it("types 가나다 into patched Slate → editor shows 가나다", async () => {
    expect(await typeInto("가나다")).toBe("가나다");
  });

  it("types 가나다가나다 into patched Slate → editor shows 가나다가나다", async () => {
    expect(await typeInto("가나다가나다")).toBe("가나다가나다");
  });
});
