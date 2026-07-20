import { describe, expect, it } from "vitest";
import { getElement, query } from "./query.ts";

describe("query.within", () => {
  it("scopes role queries to a container", () => {
    document.body.innerHTML = `
			<div role="dialog" aria-label="삭제 확인">
				<button>삭제</button>
			</div>
			<button>삭제</button>
		`;

    const dialogButton = getElement(
      query.within(query.dialog("삭제 확인"), query.button("삭제")),
      true,
    );

    expect(dialogButton.closest('[role="dialog"]')).not.toBeNull();
  });
});

describe("query.timer", () => {
  it("resolves role=timer by accessible name", () => {
    document.body.innerHTML = `<div role="timer" aria-label="남은 시간">25:00</div>`;

    const timer = getElement(query.timer("남은 시간"), true);

    expect(timer.textContent).toBe("25:00");
  });
});
