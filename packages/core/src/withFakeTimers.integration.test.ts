import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { defaultActions, actions } from "./action.ts";
import { createRunSiheom } from "./siheom.ts";
import { withFakeTimers } from "./withFakeTimers.ts";

describe("withFakeTimers scoped actions", () => {
  it("clicks a button without hanging", async () => {
    let clicked = false;
    document.body.innerHTML = `<button type="button">시작</button>`;
    document.querySelector("button")!.addEventListener("click", () => {
      clicked = true;
    });

    const runSiheom = createRunSiheom({
      actions: defaultActions,
      assertions: {},
      givens: {},
      effects: {},
    });

    await runSiheom(withFakeTimers(actions.click({ role: "button", name: "시작" })));

    expect(clicked).toBe(true);
  });

  it("uses installFakeTimers from fakeTimerScope hooks", async () => {
    let installed = false;
    document.body.innerHTML = `<button type="button">시작</button>`;

    const runSiheom = createRunSiheom({
      actions: defaultActions,
      assertions: {},
      givens: {},
      effects: {},
      fakeTimerScope: {
        installFakeTimers: () => {
          installed = true;
          vi.useFakeTimers({ shouldAdvanceTime: false });
        },
      },
    });

    await runSiheom(withFakeTimers(actions.click({ role: "button", name: "시작" })));

    expect(installed).toBe(true);
  });
});
