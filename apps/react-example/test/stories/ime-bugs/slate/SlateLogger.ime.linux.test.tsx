import "./slateLinuxDesktopEnv";

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
import { waitFor } from "@testing-library/react";

import { SlateLogger } from "./SlateLogger";
import { readSlatePlainText } from "./readSlatePlainText";

function runWithSlateIme(
  profile:
    | "linux-chrome-slate-placeholder-fixed"
    | "linux-firefox-slate-placeholder-fixed"
    | "linux-chrome-slate-plain-control"
    | "linux-firefox-slate-plain-control",
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

describe("SlateLogger + linux-chrome-slate-placeholder-fixed IME", () => {
  it("typing 가 composes intact 가 in Slate with built-in placeholder", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme("linux-chrome-slate-placeholder-fixed");

    await runSiheom(
      given.render(
        <SlateLogger mode="broken" captureTarget="slate-placeholder" editorRef={editorRef} />,
      ),
      actions.type(query.textbox("Slate editor"), "가"),
    );

    await waitFor(
      () => {
        expect(editorRef.current).not.toBeNull();
        expect(readSlatePlainText(editorRef.current!)).toBe("가");
      },
      { timeout: 3000 },
    );
  });

  it("fixed mode composes intact 가 with official placeholder", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme("linux-chrome-slate-placeholder-fixed");

    await runSiheom(
      given.render(
        <SlateLogger mode="fixed" captureTarget="slate-placeholder" editorRef={editorRef} />,
      ),
      actions.type(query.textbox("Slate editor"), "가"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      expect(readSlatePlainText(editorRef.current!)).toBe("가");
    });
  });
});

describe("SlateLogger + linux-firefox-slate-placeholder-fixed IME", () => {
  it("typing 가 composes intact 가 in Slate with placeholder", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme("linux-firefox-slate-placeholder-fixed");

    await runSiheom(
      given.render(
        <SlateLogger captureTarget="slate-placeholder" editorRef={editorRef} />,
      ),
      actions.type(query.textbox("Slate editor"), "가"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      expect(readSlatePlainText(editorRef.current!)).toBe("가");
    });
  });
});
