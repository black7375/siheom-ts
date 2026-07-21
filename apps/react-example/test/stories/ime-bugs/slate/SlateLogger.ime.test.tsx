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
    | "android-chrome-slate-placeholder-broken"
    | "android-chrome-slate-plain-control"
    | "android-firefox-slate-placeholder-broken"
    | "android-firefox-slate-placeholder-fixed"
    | "android-firefox-slate-plain-control"
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

describe("SlateLogger + android-chrome-slate-placeholder-broken IME", () => {
  it("typing 가 does not compose intact 가 in Slate (placeholder visible)", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme(
      "android-chrome-slate-placeholder-broken",
    );

    await runSiheom(
      given.render(
        <SlateLogger mode="broken" captureTarget="slate-placeholder" editorRef={editorRef} />,
      ),
      actions.type(query.textbox("Slate editor"), "가"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      expect(readSlatePlainText(editorRef.current!)).not.toBe("가");
    });
  });

  it("fixed mode: decorative placeholder — no data-slate-placeholder leaf", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, given } = runWithSlateIme("android-chrome-slate-placeholder-broken");

    await runSiheom(
      given.render(
        <SlateLogger mode="fixed" captureTarget="slate-placeholder" editorRef={editorRef} />,
      ),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      expect(editorRef.current!.querySelector("[data-slate-placeholder]")).toBeNull();
      expect(
        editorRef.current!.parentElement?.querySelector("[data-slate-decorative-placeholder]"),
      ).not.toBeNull();
    });
  });

  it("fixed mode + broken AC golden still ≠ 가 (rewrite rejected; need device recapture)", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme(
      "android-chrome-slate-placeholder-broken",
    );

    await runSiheom(
      given.render(
        <SlateLogger mode="fixed" captureTarget="slate-placeholder" editorRef={editorRef} />,
      ),
      actions.type(query.textbox("Slate editor"), "가"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      // Broken golden events already encode jamo split — decorative placeholder
      // prevents device breakage; it cannot repair a broken event replay.
      expect(readSlatePlainText(editorRef.current!)).not.toBe("가");
    });
  });
});

describe("SlateLogger + android-chrome-slate-plain-control IME", () => {
  it("typing 가 composes intact 가 in plain control textarea", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme("android-chrome-slate-plain-control");

    await runSiheom(
      given.render(
        <SlateLogger captureTarget="plain-control" editorRef={editorRef} />,
      ),
      actions.type(query.textbox("Plain control input"), "가"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      expect((editorRef.current as HTMLTextAreaElement).value).toBe("가");
    });
  });
});

describe("SlateLogger + android-firefox-slate-plain-control IME", () => {
  it("typing 가 composes intact 가 in plain control textarea", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme("android-firefox-slate-plain-control");

    await runSiheom(
      given.render(
        <SlateLogger captureTarget="plain-control" editorRef={editorRef} />,
      ),
      actions.type(query.textbox("Plain control input"), "가"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      expect((editorRef.current as HTMLTextAreaElement).value).toBe("가");
    });
  });
});

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

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
      expect(readSlatePlainText(editorRef.current!)).toBe("가");
    });
  });

  it("fixed mode (decorative placeholder) composes intact 가", async () => {
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

describe("SlateLogger + android-firefox-slate-placeholder-fixed IME", () => {
  it("rewrite-era AF golden is device flicker evidence — emulator Slate mount stays empty", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme(
      "android-firefox-slate-placeholder-fixed",
    );

    await runSiheom(
      given.render(
        <SlateLogger mode="fixed" captureTarget="slate-placeholder" editorRef={editorRef} />,
      ),
      actions.type(query.textbox("Slate editor"), "가나다"),
    );

    await waitFor(() => {
      expect(editorRef.current).not.toBeNull();
    });

    expect(readSlatePlainText(editorRef.current!)).not.toBe("가나다");
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
