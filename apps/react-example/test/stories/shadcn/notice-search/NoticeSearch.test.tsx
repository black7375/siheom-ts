import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { NoticeSearch } from "./NoticeSearch";

describe("NoticeSearch", () => {
  it("검색 결과가 없으면 안내가 보인다", async () => {
    await runSiheom(
      given.render(<NoticeSearch />),
      actions.fill(query.textbox("공지 검색"), "휴가"),
      assertions.visible(query.region("검색 결과 없음")),
    );
  });

  it("검색어에 맞는 공지를 볼 수 있다", async () => {
    await runSiheom(
      given.render(<NoticeSearch />),
      actions.fill(query.textbox("공지 검색"), "점검"),
      assertions.visible(query.listitem("서버 점검 안내")),
      assertions.not.visible(query.region("검색 결과 없음")),
    );
  });
});
