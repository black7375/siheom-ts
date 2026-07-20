import { describe, expect, it } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { render } from "@testing-library/react";

import { recordInputEvents } from "../../ime-logger/recordInputEvents";
import { buildImeTrace, formatImeTraceJson } from "../../ime-logger/serializeImeEvent";
import { FocusStealCombobox } from "./FocusStealCombobox";

const SCENARIOS = [
  {
    id: "broken-hangul",
    mode: "broken" as const,
    script: "김태희",
    expectedValue: "김태희",
  },
  {
    id: "fixed-hangul",
    mode: "fixed" as const,
    script: "김태희",
    expectedValue: "김태희",
  },
];

describe("focus-steal user-event capture fixtures", () => {
  it.each(SCENARIOS)(
    "records $id the way @testing-library/user-event fires events",
    async (scenario) => {
      const { container } = render(<FocusStealCombobox mode={scenario.mode} />);
      const input = container.querySelector("#focus-steal-combobox-input") as HTMLInputElement;

      const user = userEvent.setup();
      const events = await recordInputEvents(input, async () => {
        await user.click(input);
        await user.keyboard(scenario.script);
      });

      // user-event inserts finished Hangul syllables — no composition to abort
      expect(input.value).toBe(scenario.expectedValue);

      const trace = buildImeTrace({
        os: "synthetic",
        browser: "chromium",
        ime: "user-event",
        scenarioId: `focus-steal-hangul-${scenario.mode}`,
        source: "user-event",
        capturedAt: "1970-01-01T00:00:00.000Z",
        events,
      });

      await expect(formatImeTraceJson(trace)).toMatchFileSnapshot(
        `./fixtures/user-event/${scenario.id}.json`,
      );
    },
  );
});
