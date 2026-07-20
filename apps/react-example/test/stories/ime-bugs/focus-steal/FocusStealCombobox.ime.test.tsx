import { describe, it } from "vitest";
import { query } from "@siheom/core";

import { FocusStealCombobox } from "./FocusStealCombobox";
import brokenGolden from "./fixtures/linux-ibus-hangul-chrome/broken-hangul.json";
import fixedGolden from "./fixtures/linux-ibus-hangul-chrome/fixed-hangul.json";
import safariBrokenGolden from "./fixtures/macos-safari-apple/broken-hangul.json";
import { runWithImeSiheom } from "../shared/runWithImeSiheom";

describe("FocusStealCombobox + createImeActions (OS bug reproduction)", () => {
  it("broken: typing 김태희 yields OS 풀어쓰기 final value", async () => {
    const expected = brokenGolden.events.at(-1)?.value ?? "ㄱㅣㅁㅌㅐㅎㅡㅣ";
    const { runSiheom, actions, assertions, given } = runWithImeSiheom();

    await runSiheom(
      given.render(<FocusStealCombobox mode="broken" />),
      actions.type(query.textbox("검색"), "김태희"),
      assertions.value(query.textbox("검색"), expected),
    );
  });

  it("fixed: typing 김태희 yields composed 김태희", async () => {
    const expected = fixedGolden.events.at(-1)?.value ?? "김태희";
    const { runSiheom, actions, assertions, given } = runWithImeSiheom();

    await runSiheom(
      given.render(<FocusStealCombobox mode="fixed" />),
      actions.type(query.textbox("검색"), "김태희"),
      assertions.value(query.textbox("검색"), expected),
    );
  });

  it("macos-safari-apple broken: typing 김태희 yields OS final value (composed, not 풀어쓰기)", async () => {
    const expected = safariBrokenGolden.events.at(-1)?.value ?? "김태희";
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({
      profile: "macos-safari-apple",
    });

    await runSiheom(
      given.render(<FocusStealCombobox mode="broken" />),
      actions.type(query.textbox("검색"), "김태희"),
      assertions.value(query.textbox("검색"), expected),
    );
  });

  it("macos-safari-apple fixed: typing 김태희 yields composed 김태희", async () => {
    const expected = safariBrokenGolden.events.at(-1)?.value ?? "김태희";
    const { runSiheom, actions, assertions, given } = runWithImeSiheom({
      profile: "macos-safari-apple",
    });

    await runSiheom(
      given.render(<FocusStealCombobox mode="fixed" />),
      actions.type(query.textbox("검색"), "김태희"),
      assertions.value(query.textbox("검색"), expected),
    );
  });
});
