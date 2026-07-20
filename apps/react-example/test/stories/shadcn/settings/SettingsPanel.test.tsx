import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { SettingsPanel } from "./SettingsPanel.tsx";

describe("SettingsPanel", () => {
  it("일반 탭이 선택되어 있고 일반 설정이 보인다", async () => {
    await runSiheom(
      given.render(<SettingsPanel />),
      assertions.selected(query.tab("일반")),
      assertions.visible(query.switch("다크 모드")),
      assertions.not.visible(query.radiogroup("알림 빈도")),
    );
  });

  it("알림 탭을 선택하면 알림 설정이 보인다", async () => {
    await runSiheom(
      given.render(<SettingsPanel />),
      actions.click(query.tab("알림")),
      assertions.selected(query.tab("알림")),
      assertions.visible(query.radiogroup("알림 빈도")),
      assertions.not.visible(query.switch("다크 모드")),
    );
  });

  it("다크 모드를 켤 수 있다", async () => {
    await runSiheom(
      given.render(<SettingsPanel />),
      actions.click(query.switch("다크 모드")),
      assertions.checked(query.switch("다크 모드")),
    );
  });

  it("알림 빈도를 변경할 수 있다", async () => {
    await runSiheom(
      given.render(<SettingsPanel />),
      actions.click(query.tab("알림")),
      actions.click(query.radio("즉시")),
      assertions.checked(query.radio("즉시")),
      assertions.not.checked(query.radio("일일 요약")),
    );
  });
});
