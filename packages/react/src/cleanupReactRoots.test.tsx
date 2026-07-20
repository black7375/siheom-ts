import { describe, expect, it } from "vitest";
import { cleanupReactRoots, given, runSiheom } from "./index.ts";

describe("cleanupReactRoots", () => {
  it("unmounts roots from given.render and removes their containers", async () => {
    await runSiheom(
      given.render(
        <div role="status" aria-label="mounted">
          hi
        </div>,
      ),
    );

    expect(document.querySelector('[role="status"]')).not.toBeNull();
    expect(document.body.querySelectorAll(":scope > div").length).toBeGreaterThan(0);

    await cleanupReactRoots();

    expect(document.querySelector('[role="status"]')).toBeNull();
    expect(document.body.querySelectorAll(":scope > div")).toHaveLength(0);
  });
});
