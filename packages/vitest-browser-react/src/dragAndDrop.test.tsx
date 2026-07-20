import { describe, expect, it } from "vitest";
import { cleanup } from "vitest-browser-react";
import { actions, given, query, runSiheom } from "./index.ts";

describe("browser dragAndDrop", () => {
  it("drags a card onto a column", async () => {
    await runSiheom(
      given.render(
        <section aria-label="칸반">
          <ul aria-label="진행 중">
            <li aria-label="디자인" draggable={true} id="card">
              디자인
            </li>
          </ul>
          <ul
            aria-label="완료"
            id="done-column"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const column = document.getElementById("done-column");
              if (column) column.dataset.dropped = "design";
            }}
          >
            <li>비어 있음</li>
          </ul>
        </section>,
      ),
      actions.dragAndDrop(query.listitem("디자인"), query.list("완료")),
    );

    expect(document.getElementById("done-column")?.dataset.dropped).toBe("design");
    await cleanup();
  });
});
