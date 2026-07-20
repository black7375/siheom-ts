import { describe, expect, it } from "vitest";
import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  overrideSiheom,
  query,
} from "@siheom/core";

import { createImeActions } from "./createImeActions";

describe("createImeActions + overrideSiheom", () => {
  it("fills Hangul with compositionupdate (not user-event insertText-only)", async () => {
    let compositionUpdates = 0;

    const { runSiheom, actions, assertions, given } = overrideSiheom(
      {
        actions: createDefaultActions(),
        assertions: createDefaultAssertions(),
        givens: {
          render: async () => {
            document.body.innerHTML = "";
            const label = document.createElement("label");
            label.append("이름");
            const input = document.createElement("input");
            input.addEventListener("compositionupdate", () => {
              compositionUpdates += 1;
            });
            label.append(input);
            document.body.append(label);
          },
        },
        effects: defaultEffects,
      },
      {
        actions: createImeActions(),
      },
    );

    await runSiheom(
      given.render(),
      actions.fill(query.textbox("이름"), "김태희"),
      assertions.value(query.textbox("이름"), "김태희"),
    );

    expect(compositionUpdates).toBeGreaterThan(0);
  });
});
