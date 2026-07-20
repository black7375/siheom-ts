import { describe, expect, it } from "vitest";
import { tableToMarkdown } from "./tableToMarkdown.ts";

describe("tableToMarkdown", () => {
  it("renders thead/tbody cells as padded markdown including Korean width", async () => {
    document.body.innerHTML = `
      <table>
        <thead><tr><th>이름</th><th>상태</th></tr></thead>
        <tbody><tr><td>청소</td><td>완료</td></tr></tbody>
      </table>
    `;

    await expect(tableToMarkdown(document.querySelector("table")!)).toMatchFileSnapshot(
      "__snapshots__/table-korean-padded.snap",
    );
  });

  it("uses input values inside cells", async () => {
    document.body.innerHTML = `
      <table>
        <thead><tr><th>수량</th></tr></thead>
        <tbody><tr><td><input value="3" /></td></tr></tbody>
      </table>
    `;

    await expect(tableToMarkdown(document.querySelector("table")!)).toMatchFileSnapshot(
      "__snapshots__/table-input-cell.snap",
    );
  });

  it("throws when the table has no rows", () => {
    document.body.innerHTML = `<table></table>`;

    expect(() => tableToMarkdown(document.querySelector("table")!)).toThrow(
      "there is no rows in table!",
    );
  });
});
