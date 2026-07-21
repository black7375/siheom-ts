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
import {
  composeHangulContentEditableFirefoxFixedOn,
  createImeActions,
  goldenCritical,
  resolveProfile,
  toCriticalEvents,
} from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";
import { render, waitFor } from "@testing-library/react";

import { LexicalLogger } from "./LexicalLogger";
import { readLexicalPlainText } from "./readLexicalPlainText";
import fixedGolden from "./fixtures/linux-firefox/fixed-가나다.json";

function runWithLexicalIme(
  profile: "android-firefox-contenteditable-broken" | "linux-firefox-contenteditable-fixed",
) {
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

describe("LexicalLogger + android-firefox-contenteditable-broken IME", () => {
  it("typing 가나다 does not compose intact 가나다 in Lexical", async () => {
    const editorRef: { current: LexicalEditor | null } = { current: null };
    const { runSiheom, actions, given } = runWithLexicalIme(
      "android-firefox-contenteditable-broken",
    );

    await runSiheom(
      given.render(<LexicalLogger mode="broken" editorRef={editorRef} />),
      actions.type(query.textbox("Lexical editor"), "가나다"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      const text = readLexicalPlainText(editorRef.current!);
      expect(text).not.toBe("가나다");
    });
  });
});

describe("LexicalLogger + linux-firefox-contenteditable-fixed IME", () => {
  it("linux-firefox-contenteditable-fixed emulator critical events match golden on plain contenteditable", async () => {
    const editor = document.createElement("div");
    editor.contentEditable = "true";
    document.body.append(editor);

    const events = await composeHangulContentEditableFirefoxFixedOn(editor, "가나다", {
      profile: resolveProfile("linux-firefox-contenteditable-fixed"),
    });

    expect(toCriticalEvents(events)).toEqual(goldenCritical(fixedGolden.events));
    editor.remove();
  });

  it("fixed mode + linux-firefox-contenteditable-fixed: typing 가나다 composes intact 가나다 in Lexical", async () => {
    const editorRef: { current: LexicalEditor | null } = { current: null };
    const { runSiheom, actions, given } = runWithLexicalIme("linux-firefox-contenteditable-fixed");

    await runSiheom(
      given.render(<LexicalLogger mode="fixed" editorRef={editorRef} />),
      actions.type(query.textbox("Lexical editor"), "가나다"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      expect(readLexicalPlainText(editorRef.current!)).toBe("가나다");
    });
  });
});

// AF post-fix device golden: fixtures/android-firefox/fixed-가나다.json (visible ㅏ나다 on v1 fix).
// Replay regression test after v2 fix plugin lands.
