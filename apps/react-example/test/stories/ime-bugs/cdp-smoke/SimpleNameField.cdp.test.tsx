import { describe, expect, it } from "vitest";
import { query } from "@siheom/core";
import { attachImeRecorder } from "@siheom/ime";
import { render } from "@testing-library/react";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
} from "@siheom/core";
import { createCdpImeActions } from "@siheom/ime-cdp";
import { defaultGivens, reactEffects } from "@siheom/react";

import { runWithCdpImeSiheom } from "../shared/runWithCdpImeSiheom";
import { SimpleNameField } from "./SimpleNameField";

describe("SimpleNameField + createCdpImeActions (Chromium CDP smoke)", () => {
  it("types 김태희 via runWithCdpImeSiheom", async () => {
    const { runSiheom, actions, assertions, given } = runWithCdpImeSiheom();

    await runSiheom(
      given.render(<SimpleNameField />),
      actions.type(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), "김태희"),
    );
  });

  it("records composition events on the CDP engine path", async () => {
    const recorderRef: {
      current: ReturnType<typeof attachImeRecorder> | undefined;
    } = { current: undefined };
    let compositionUpdates = 0;

    const { runSiheom, actions, assertions, given } = overrideSiheom(
      {
        actions: createDefaultActions(),
        assertions: createDefaultAssertions(),
        givens: defaultGivens,
        effects: { ...defaultEffects, ...reactEffects },
      },
      {
        actions: createCdpImeActions(),
        givens: {
          render: async (element: React.ReactElement) => {
            render(element);
            const input = document.getElementById("ime-cdp-name-field") as HTMLInputElement;
            recorderRef.current = attachImeRecorder(input);
            input.addEventListener("compositionupdate", () => {
              compositionUpdates += 1;
            });
          },
        },
      },
    );

    await runSiheom(
      given.render(<SimpleNameField />),
      actions.type(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), "김태희"),
    );

    expect(compositionUpdates).toBeGreaterThan(0);
    expect(recorderRef.current!.events.some((e) => e.type === "compositionend")).toBe(true);
    recorderRef.current!.detach();
  });
});
