import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import type { A11ySnapshotOptions } from "./getA11ySnapshot.ts";
import type { Locator } from "./types.ts";

vi.stubGlobal("expect", expect);
const { assertions, defaultAssertions } = await import("./assert.ts");

const target: Locator = { role: "region", name: "Panel" };
const options = { mode: "verbose", includeHidden: true } satisfies A11ySnapshotOptions;

function renderPanel(): void {
  document.body.innerHTML = `
    <div role="region" aria-label="Panel">
      <button>Visible action</button>
      <button aria-label="Hidden action" hidden>Hidden action</button>
    </div>
  `;
}

afterEach(() => {
  document.body.replaceChildren();
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("assertions.a11ySnapshot", () => {
  it("keeps the path as the only runtime argument when options are omitted", () => {
    const step = assertions.a11ySnapshot(target, "default.snap");

    expect(step.args).toEqual(["default.snap"]);
  });

  it("includes snapshot options in the runtime arguments when provided", () => {
    const step = assertions.a11ySnapshot(target, "verbose.snap", options);

    expect(step.args).toEqual(["verbose.snap", options]);
  });
});

describe("defaultAssertions.a11ySnapshot", () => {
  it("omits hidden descendants when options are omitted", async () => {
    renderPanel();

    await defaultAssertions.a11ySnapshot(target, "assert-default.snap");
  });

  it("forwards verbose hidden options to the accessibility snapshot", async () => {
    renderPanel();

    await defaultAssertions.a11ySnapshot(target, "assert-verbose-hidden.snap", options);
  });
});
