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
import { createSlateExplorationLog } from "./slateExplorationCapture";
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

describe("SlateLogger AF — exploration timeline", () => {
  it("records timeline rows while typing 가나다", async () => {
    const editorRef: { current: HTMLElement | null } = { current: null };
    const explorationLog = createSlateExplorationLog();
    const { runSiheom, actions, given } = runWithSlateIme(
      "android-firefox-slate-placeholder-fixed",
    );

    await runSiheom(
      given.render(
        <SlateLogger
          captureTarget="slate-placeholder"
          editorRef={editorRef}
          explorationLog={explorationLog}
        />,
      ),
      actions.type(query.textbox("Slate editor"), "가나다"),
    );

    expect(explorationLog.timeline.length).toBeGreaterThan(0);
    expect(explorationLog.domStructures.length).toBeGreaterThan(0);

    const text = readSlatePlainText(editorRef.current);
    const dump = explorationLog.timeline
      .map((row) => `${row.i}\t${row.type}\t${row.flags.join(",")}`)
      .join("\n");

    // eslint-disable-next-line no-console
    console.log("\n--- exploration timeline ---\n" + dump + "\n--- end ---\n");

    expect(text, dump).not.toBe("가나다");
  });
});
