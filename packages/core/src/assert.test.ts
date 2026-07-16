import { describe, it } from "vitest";
import { defaultAssertions } from "./assert.ts";
import { query } from "./query.ts";

describe("assertions.focused", () => {
  it("passes when the target element has focus", async () => {
    document.body.innerHTML = `<button>Go</button>`;
    document.querySelector("button")!.focus();

    await defaultAssertions.focused(query.button("Go"), true);
  });

  it("passes when the target element does not have focus", async () => {
    document.body.innerHTML = `<button>Go</button><input aria-label="Name" />`;
    document.querySelector("input")!.focus();

    await defaultAssertions.focused(query.button("Go"), false);
  });
});
