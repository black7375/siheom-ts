import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { TanStackArticleList } from "./TanStackArticleList";
import { TanStackRouterApp } from "./TanStackRouterApp";
import { ARTICLES } from "../shared/articles";

describe("TanStackRouterApp", () => {
  it("Link stub alias로 정적 href만 확인할 수 있다", async () => {
    const [first, third] = [ARTICLES[0], ARTICLES[2]];

    await runSiheom(
      given.render(<TanStackArticleList />),
      assertions.visible(query.link(first!.headline)),
      assertions.visible(query.link(ARTICLES[1]!.headline)),
      assertions.href(query.link(first!.headline), "/articles/1"),
      assertions.href(query.link(third!.headline), "/articles/3"),
    );
  });

  it("memory history 라우터로 글 상세 페이지로 이동한다", async () => {
    await runSiheom(
      given.render(<TanStackRouterApp initialPath="/" />),
      actions.click(query.link(ARTICLES[0]!.headline)),
      assertions.visible(query.region("글 1")),
    );
  });
});
