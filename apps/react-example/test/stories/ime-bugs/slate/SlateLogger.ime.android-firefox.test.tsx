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
import { createImeActions, measureReplayFidelity } from "@siheom/ime";
import { defaultGivens, reactEffects } from "@siheom/react";

import { SlateLogger } from "./SlateLogger";
import { readSlatePlainText } from "./readSlatePlainText";
import v3Golden from "./fixtures/android-firefox/mechanism-fix-v3-cumulative-preedit-가나다가나다.json";
import v4Golden from "./fixtures/android-firefox/mechanism-fix-v4-still-explodes-가나다가나다.json";

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

  it("fixed mode events-only replay fidelity stays low (not a device gate)", async () => {
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

    const report = await measureReplayFidelity(
      editorRef.current!,
      v4Golden.events,
      readSlatePlainText,
      { settle: "macrotask" },
    );

    expect(report.matchRate).toBeLessThan(0.2);
  });
});

describe("Experiment 1: golden writeback on plain contenteditable", () => {
  it("events-only plain CE stays low-fidelity on v3 capture", async () => {
    const div = document.createElement("div");
    div.contentEditable = "true";
    document.body.append(div);

    const report = await measureReplayFidelity(
      div,
      v3Golden.events,
      readSlatePlainText,
      { settle: "macrotask" },
    );

    expect(report.matchRate).toBeLessThan(0.2);
    div.remove();
  });

  it("golden writeback plain CE reaches 100% on v3 and v4 captures", async () => {
    for (const golden of [v3Golden, v4Golden]) {
      const div = document.createElement("div");
      div.contentEditable = "true";
      document.body.append(div);

      const report = await measureReplayFidelity(
        div,
        golden.events,
        readSlatePlainText,
        { settle: "macrotask", writeback: "golden" },
      );

      expect(report.matchRate).toBe(1);
      div.remove();
    }
  });
});
