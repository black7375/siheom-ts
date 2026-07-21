import "./lexicalAndroidFirefoxEnv";
import { describe, expect, it } from "vitest";
import type { LexicalEditor } from "lexical";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";
import { createImeActions } from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";
import { render, waitFor } from "@testing-library/react";

import { LexicalLogger } from "./LexicalLogger";
import { createLexicalCompositionDebugLog } from "./lexicalCompositionDebugLog";
import { readLexicalPlainText } from "./readLexicalPlainText";

function runWithLexicalIme(profile: "android-firefox-contenteditable-fixed") {
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
 * Diagnostic test — dumps Lexical DOM/command trace on failure.
 * Run: cd apps/react-example && bun run test LexicalLogger.ime.debug.test.tsx
 */
describe("LexicalLogger AF fixed — composition debug trace", () => {
  it("dump trace while typing 가나다 (android-firefox-contenteditable-fixed)", async () => {
    const editorRef: { current: LexicalEditor | null } = { current: null };
    const debugLog = createLexicalCompositionDebugLog();
    const { runSiheom, actions, given } = runWithLexicalIme("android-firefox-contenteditable-fixed");

    await runSiheom(
      given.render(
        <LexicalLogger mode="fixed" editorRef={editorRef} debugLog={debugLog} />,
      ),
      actions.type(query.textbox("Lexical editor"), "가나다"),
    );

    const text = readLexicalPlainText(editorRef.current!);
    const dump = debugLog.dump();

    if (text !== "가나다") {
      // eslint-disable-next-line no-console
      console.log("\n--- Lexical composition debug trace ---\n" + dump + "\n--- end ---\n");
    }

    expect(
      text,
      text === "가나다" ? undefined : `Lexical text mismatch.\n\n${dump}`,
    ).toBe("가나다");
  });
});
