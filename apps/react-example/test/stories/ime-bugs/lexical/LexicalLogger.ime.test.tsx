import { describe, expect, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  getElement,
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
import { render } from "@testing-library/react";

import { LexicalLogger } from "./LexicalLogger";
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
    const { runSiheom, actions, given } = runWithLexicalIme(
      "android-firefox-contenteditable-broken",
    );

    await runSiheom(
      given.render(<LexicalLogger mode="broken" />),
      actions.type(query.textbox("Lexical editor"), "가나다"),
    );

    const editor = getElement(query.textbox("Lexical editor"), true);
    const visible = editor.textContent?.replace(/\u200b/g, "") ?? "";
    expect(visible).not.toBe("가나다");
  });
});

describe("LexicalLogger + linux-firefox-contenteditable-fixed IME", () => {
  it("fixed mode: emulator critical events match golden on contenteditable", async () => {
    await render(<LexicalLogger mode="fixed" />);
    const editor = getElement(query.textbox("Lexical editor"), true);
    editor.focus();

    const events = await composeHangulContentEditableFirefoxFixedOn(editor, "가나다", {
      profile: resolveProfile("linux-firefox-contenteditable-fixed"),
    });

    expect(toCriticalEvents(events)).toEqual(goldenCritical(fixedGolden.events));
  });
});
