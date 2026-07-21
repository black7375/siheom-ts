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

  it("fixed mode: typing 가 composes intact 가 in Slate with placeholder", async () => {
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
      expect(readSlatePlainText(editorRef.current!)).toBe("가");
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
  it("typing 가 composes intact 가 in Slate with placeholder", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const { runSiheom, actions, given } = runWithSlateIme("linux-chrome-slate-placeholder-fixed");

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

  it("fixed mode does not regress linux-chrome placeholder 가", async () => {
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
  it("fixed mode: typing 가나다 is device-only on Slate mount (emulator DOM stays empty)", async () => {
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

    // Chromium Vitest does not apply AF continuous golden into Slate's model
    // (see DEBUG.md). Explosion recovery is covered by unit tests + device.
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
