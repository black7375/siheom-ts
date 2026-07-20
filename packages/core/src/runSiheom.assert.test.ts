import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { actions } from "./action.ts";
import { assertions, defaultAssertions } from "./assert.ts";
import { createRunSiheom, runSiheom } from "./index.ts";
import { query } from "./query.ts";

describe("runSiheom assert dispatch", () => {
  it("runs assertion steps through the runner", async () => {
    document.body.innerHTML = `<button type="button">저장</button>`;

    await runSiheom(assertions.visible(query.button("저장")));
  });

  it("includes logs and an a11y snapshot when an assertion fails", async () => {
    document.body.innerHTML = `<button type="button">저장</button>`;

    await expect(runSiheom(assertions.disabled(query.button("저장")))).rejects.toThrow(
      /button "저장"/,
    );

    try {
      await runSiheom(assertions.disabled(query.button("저장")));
    } catch (error) {
      expect(String(error)).toMatch(/button: "저장"/);
      expect(String(error)).toMatch(/disabled/);
    }
  });

  it("throws Invalid step for an unrecognized step shape", async () => {
    const run = createRunSiheom({
      actions: {},
      assertions: {},
      givens: {},
      effects: {},
    });

    await expect(run({ log: "bogus" } as never)).rejects.toThrow("Invalid step");
  });
});

describe("assertions.a11ySnapshot and tableSnapshot via runner", () => {
  it("matches a compact a11y tree snapshot for a labeled checkbox", async () => {
    document.body.innerHTML = `
      <div role="region" aria-label="설정">
        <h1>설정</h1>
        <label><input type="checkbox" checked />알림</label>
        <button type="button" aria-haspopup="menu">메뉴</button>
      </div>
    `;

    await defaultAssertions.a11ySnapshot(query.region("설정"), "a11y-settings.snap");
  });

  it("matches markdown for a simple data table", async () => {
    document.body.innerHTML = `
      <table aria-label="할 일">
        <thead><tr><th>이름</th><th>상태</th></tr></thead>
        <tbody><tr><td>청소</td><td>완료</td></tr></tbody>
      </table>
    `;

    await defaultAssertions.tableSnapshot(query.table("할 일"), "table-todos.snap");
  });
});

describe("actions builders through runner", () => {
  it("clicks via action step builders", async () => {
    let clicked = false;
    document.body.innerHTML = `<button type="button">Go</button>`;
    document.querySelector("button")!.addEventListener("click", () => {
      clicked = true;
    });

    await runSiheom(actions.click(query.button("Go")));

    expect(clicked).toBe(true);
  });
});
