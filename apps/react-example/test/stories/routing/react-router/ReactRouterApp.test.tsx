import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { ArticleList, ReactRouterApp } from "./ReactRouterApp";
import { ARTICLES } from "../shared/articles";

describe("ReactRouterApp", () => {
  it("정적 목록 페이지에서는 링크 href만 확인할 수 있다", async () => {
    const [first, second] = ARTICLES;

    await runSiheom(
      given.render(<ArticleList />),
      assertions.visible(query.link(first!.headline)),
      assertions.visible(query.link(second!.headline)),
      assertions.href(query.link(first!.headline), "/articles/1"),
      assertions.href(query.link(second!.headline), "/articles/2"),
    );
  });

  it("해시 링크를 클릭하면 해당 id 섹션이 보인다", async () => {
    await runSiheom(
      given.render(<ReactRouterApp initialEntries={["/terms"]} />),
      assertions.visible(query.region("이용약관")),
      actions.click(query.link("서명 섹션으로")),
      assertions.visible(query.region("서명")),
      assertions.not.visible(query.region("이용약관")),
    );
  });

  it("API 로딩 후 대시보드로 이동한다", async () => {
    const login = () => new Promise<void>((resolve) => setTimeout(resolve, 50));

    await runSiheom(
      given.render(<ReactRouterApp initialEntries={["/login"]} login={login} />),
      actions.click(query.button("로그인")),
      assertions.visible(query.button("로그인 중...")),
      assertions.visible(query.region("대시보드")),
    );
  });
});
