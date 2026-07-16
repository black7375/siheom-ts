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
