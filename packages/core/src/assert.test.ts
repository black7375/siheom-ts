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

describe("assertions.checked", () => {
  it("passes for a controlled checkbox whose checked state is a property", async () => {
    document.body.innerHTML = `<input type="checkbox" aria-label="Done" />`;
    (document.querySelector("input") as HTMLInputElement).checked = true;

    await defaultAssertions.checked(query.checkbox("Done"), true);
  });

  it("passes for a checkbox with aria-checked", async () => {
    document.body.innerHTML = `<span role="checkbox" aria-checked="true" aria-label="Done" />`;

    await defaultAssertions.checked(query.checkbox("Done"), true);
  });

  it("passes when the checkbox is not checked", async () => {
    document.body.innerHTML = `<input type="checkbox" aria-label="Done" />`;

    await defaultAssertions.checked(query.checkbox("Done"), false);
  });
});
