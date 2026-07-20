import "../../../index.css";
import { describe, expect, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { TeamInviteForm } from "./TeamInviteForm.tsx";

describe("TeamInviteForm", () => {
  it("역할과 팀원을 선택하고 초대할 수 있다", async () => {
    let result: unknown = null;

    await runSiheom(
      given.render(
        <TeamInviteForm
          onInvite={async (invite) => {
            result = invite;
          }}
        />,
      ),
      actions.click(query.label("역할")),
      actions.click(query.option("멤버")),
      actions.fill(query.combobox("팀원"), "김"),
      actions.click(query.option("김태희")),
      actions.click(query.button("초대하기")),
      assertions.textContent(query.status("초대 결과"), "김태희를 멤버로 초대했습니다"),
    );

    expect(result).toEqual({ member: "김태희", role: "member" });
  });
});
