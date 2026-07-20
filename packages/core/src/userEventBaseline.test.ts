import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("userEvent baseline", () => {
  it("clicks an html button under fake timers", async () => {
    vi.useFakeTimers();
    let clicked = false;

    document.body.innerHTML = `<button type="button">start</button>`;
    document.querySelector("button")!.addEventListener("click", () => {
      clicked = true;
    });

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(document.querySelector("button")!);

    expect(clicked).toBe(true);
    vi.useRealTimers();
  });
});
