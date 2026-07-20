import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { createDefaultActions, actions } from "./action.ts";
import { createDefaultAssertions, assertions } from "./assert.ts";
import { defaultEffects, effect } from "./effect.ts";
import { createRunSiheom, runSiheom } from "./index.ts";
import { query } from "./query.ts";
import { withFakeTimers } from "./withFakeTimers.ts";

describe("sync resolveElement", () => {
  it("tabs synchronously when resolveElement is sync", async () => {
    document.body.innerHTML = `
      <button type="button">첫번째</button>
      <button type="button">두번째</button>
    `;
    const [, second] = Array.from(document.querySelectorAll("button"));
    document.querySelector("button")!.focus();

    await createDefaultActions({ resolveElement: "sync" }).tab(query.button("첫번째"));

    expect(second).toHaveFocus();
  });

  it("asserts synchronously when resolveElement is sync", async () => {
    document.body.innerHTML = `<button type="button">저장</button>`;

    await createDefaultAssertions({ resolveElement: "sync" }).visible(query.button("저장"), true);
  });
});

describe("effect builders through runner", () => {
  it("runs effect.elapsed under fake timers", async () => {
    document.body.innerHTML = `<div role="status" aria-label="count">0</div>`;
    const status = document.querySelector("[role=status]")!;

    const run = createRunSiheom({
      actions: {},
      assertions: createDefaultAssertions(),
      givens: {
        start: async () => {
          setTimeout(() => {
            status.textContent = "1";
          }, 1000);
        },
      },
      effects: defaultEffects,
    });

    await run(
      withFakeTimers(
        { given: "start", log: "start", args: [] },
        effect.elapsed(1000),
        assertions.textContent(query.status("count"), "1"),
      ),
    );
  });

  it("runs effect.runAllTimers under fake timers", async () => {
    document.body.innerHTML = `<div role="status" aria-label="ready">no</div>`;
    const status = document.querySelector("[role=status]")!;

    const run = createRunSiheom({
      actions: {},
      assertions: createDefaultAssertions(),
      givens: {
        start: async () => {
          setTimeout(() => {
            status.textContent = "yes";
          }, 5000);
        },
      },
      effects: defaultEffects,
    });

    await run(
      withFakeTimers(
        { given: "start", log: "start", args: [] },
        effect.runAllTimers(),
        assertions.textContent(query.status("ready"), "yes"),
      ),
    );
  });
});

describe("action and assertion builders through runner", () => {
  it("runs a representative set of not-assertions and actions", async () => {
    document.body.innerHTML = `
      <a href="/docs" aria-current="page">문서</a>
      <button type="button" aria-expanded="false">메뉴</button>
      <button type="button">다른</button>
      <label>이름<input value="김" /></label>
    `;

    await runSiheom(
      assertions.current(query.link("문서"), "page"),
      assertions.not.current(query.link("문서"), "step"),
      assertions.not.expanded(query.button("메뉴")),
      assertions.not.focused(query.button("다른")),
      assertions.value(query.textbox("이름"), "김"),
      assertions.not.value(query.textbox("이름"), "이"),
      assertions.href(query.link("문서"), "/docs"),
      assertions.not.href(query.link("문서"), "/other"),
      assertions.count(query.button("메뉴"), 1),
      assertions.not.count(query.button("메뉴"), 3),
      actions.hover(query.button("메뉴")),
    );
  });
});
