import { describe, expect, it } from "vitest";
import { getA11ySnapshot } from "./getA11ySnapshot.ts";

describe("getA11ySnapshot", () => {
  it("serializes a checked checkbox with role and name", async () => {
    document.body.innerHTML = `<label><input type="checkbox" checked />완료</label>`;

    await expect(getA11ySnapshot(document.body)).toMatchFileSnapshot(
      "__snapshots__/a11y-checkbox-checked.snap",
    );
  });

  it("serializes heading level and haspopup properties", async () => {
    document.body.innerHTML = `
      <h2>설정</h2>
      <button type="button" aria-haspopup="menu">메뉴</button>
    `;

    await expect(getA11ySnapshot(document.body)).toMatchFileSnapshot(
      "__snapshots__/a11y-heading-haspopup.snap",
    );
  });

  it("serializes aria-describedby and aria-errormessage relations", async () => {
    document.body.innerHTML = `
      <label>이메일<input aria-describedby="hint" aria-errormessage="err" aria-invalid="true" /></label>
      <div id="hint">힌트</div>
      <div id="err">오류</div>
    `;

    await expect(getA11ySnapshot(document.body)).toMatchFileSnapshot(
      "__snapshots__/a11y-relations.snap",
    );
  });

  it("escapes quotes and newlines in accessible names", async () => {
    document.body.innerHTML = `<button type="button" aria-label='Say "hi"\nnow'>x</button>`;

    await expect(getA11ySnapshot(document.body)).toMatchFileSnapshot(
      "__snapshots__/a11y-escaped-name.snap",
    );
  });

  it("returns empty string when the tree is inaccessible", () => {
    document.body.innerHTML = `<div aria-hidden="true"><button>숨김</button></div>`;

    expect(getA11ySnapshot(document.querySelector("div")!)).toBe("");
  });
});
