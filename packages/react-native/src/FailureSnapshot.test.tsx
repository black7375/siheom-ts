import { describe, expect, it } from "vitest";
import { assertions, given, query, runSiheom } from "./index.ts";
import { Counter } from "./Counter.tsx";

describe("failure snapshot", () => {
  it("includes RN a11y snapshot section when an assertion fails", async () => {
    await expect(
      runSiheom(given.render(<Counter />), assertions.visible(query.button("999"))),
    ).rejects.toThrow(/\[A11y Snapshot\][\s\S]*button/);
  });
});
