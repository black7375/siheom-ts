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

describe("assertions.textContent", () => {
  it("passes when the target element has the expected text", async () => {
    document.body.innerHTML = `<p role="status" aria-label="남은 할 일">2 items left</p>`;

    await defaultAssertions.textContent(query.status("남은 할 일"), "2 items left", true);
  });

  it("passes when the target element does not have the expected text", async () => {
    document.body.innerHTML = `<p role="status" aria-label="남은 할 일">1 item left</p>`;

    await defaultAssertions.textContent(query.status("남은 할 일"), "2 items left", false);
  });
});
