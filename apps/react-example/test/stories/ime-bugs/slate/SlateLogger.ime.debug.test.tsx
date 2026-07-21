import { describe, expect, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";
import { createImeActions } from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";

import { SlateLogger } from "./SlateLogger";
import { createSlateCompositionDebugLog } from "./slateCompositionDebugLog";
import { readSlatePlainText } from "./readSlatePlainText";

function runWithSlateIme(profile: "android-firefox-slate-placeholder-fixed") {
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

/**
 * Diagnostic test — dumps Slate DOM trace (AF continuous golden has no Slate
 * mount fidelity under Chromium Vitest). Run:
 *   cd apps/react-example && bun run test SlateLogger.ime.debug.test.tsx
 */
describe("SlateLogger AF fixed — composition debug trace", () => {
  it("dump trace while typing 가나다 (android-firefox-slate-placeholder-fixed)", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const debugLog = createSlateCompositionDebugLog();
    const { runSiheom, actions, given } = runWithSlateIme(
      "android-firefox-slate-placeholder-fixed",
    );

    await runSiheom(
      given.render(
        <SlateLogger
          mode="fixed"
          captureTarget="slate-placeholder"
          editorRef={editorRef}
          debugLog={debugLog}
        />,
      ),
      actions.type(query.textbox("Slate editor"), "가나다"),
    );

    const text = readSlatePlainText(editorRef.current);
    const dump = debugLog.dump();

    // eslint-disable-next-line no-console
    console.log("\n--- Slate composition debug trace ---\n" + dump + "\n--- end ---\n");

    expect(editorRef.current).not.toBeNull();
    // Emulator gap: DOM stays ZWSP/empty. Device validation is separate.
    expect(text, `Unexpected intact 가나다 under Vitest.\n\n${dump}`).not.toBe("가나다");
  });
});
