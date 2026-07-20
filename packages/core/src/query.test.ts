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

describe("query.label", () => {
  it("resolves an input by its accessible label text", () => {
    document.body.innerHTML = `<label>이메일<input type="email" /></label>`;

    const input = getElement(query.label("이메일"), true);

    expect(input).toBeInstanceOf(HTMLInputElement);
    expect((input as HTMLInputElement).type).toBe("email");
  });
});

describe("query invisible path", () => {
  it("returns null when querying a missing role as not visible", () => {
    document.body.innerHTML = ``;

    expect(getElement(query.button("없음"), false)).toBeNull();
  });
});
