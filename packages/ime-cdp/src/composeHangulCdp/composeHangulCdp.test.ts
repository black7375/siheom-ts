import { describe, expect, it } from "vitest";
import { attachImeRecorder, goldenCritical, toCriticalEvents } from "@siheom/ime";

import continuousGolden from "../../fixtures/chromium-cdp/continuous-hangul.json";
import { composeHangulCdp } from "./composeHangulCdp";

describe("composeHangulCdp", () => {
  it("types 김 via CDP and leaves input.value === 김", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await composeHangulCdp(input, "김");
    expect(input.value).toBe("김");

    input.remove();
  });

  it("fires compositionstart / compositionupdate / compositionend", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const { events, detach } = attachImeRecorder(input);

    await composeHangulCdp(input, "김");

    const types = events.map((e) => e.type);
    expect(types).toContain("compositionstart");
    expect(types).toContain("compositionupdate");
    expect(types).toContain("compositionend");
    expect(input.value).toBe("김");

    detach();
    input.remove();
  });

  it("matches chromium-cdp continuous-hangul critical fields for 김태희", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const { events, detach } = attachImeRecorder(input);

    await composeHangulCdp(input, "김태희");
    expect(input.value).toBe("김태희");
    expect(toCriticalEvents(events)).toEqual(goldenCritical(continuousGolden.events));

    detach();
    input.remove();
  });
});
