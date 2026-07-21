import "./slateAndroidFirefoxEnv";

import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";
import { createImeActions, replayGoldenEvents } from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";

import { SlateLogger } from "./SlateLogger";
import { readSlatePlainText } from "./readSlatePlainText";
import deviceExplosionGolden from "./fixtures/android-firefox/mechanism-fix-still-explodes-가나다가나다.json";

function runWithSlateIme(profile: "android-firefox-slate-placeholder-broken") {
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

describe("SlateLogger + android-firefox-slate-placeholder-fixed IME", () => {
  it("fixed mode composes intact 가 with AF broken golden + official placeholder", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme(
      "android-firefox-slate-placeholder-broken",
    );

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

  it("fixed mode replays AF device explosion golden without document concat", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };

    render(
      <SlateLogger
        mode="fixed"
        captureTarget="slate-placeholder"
        editorRef={editorRef}
        captureSlateDebug={false}
      />,
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
    });

    await replayGoldenEvents(editorRef.current!, deviceExplosionGolden.events, {
      settle: "macrotask",
    });

    await waitFor(
      () => {
        const text = readSlatePlainText(editorRef.current!);
        expect(text).not.toContain("가나간간");
        expect(text).not.toMatch(/(.+)\1\1/);
        expect(text.length).toBeLessThanOrEqual(6);
      },
      { timeout: 3000 },
    );
  });
});
