import { beforeEach, describe, it } from "vitest";
import { assertions, given, query, runSiheom } from "@siheom/react";
import { TodoMVCApp } from "./TodoMVCApp";
import type { Todo } from "./todoLogic";
import { writeTodos } from "./todoStorage";

function setup(todos: Todo[] = [], initialEntry = "/") {
  writeTodos(todos);
  return given.render(<TodoMVCApp initialEntries={[initialEntry]} />);
}

describe("TodoMVCApp", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("할 일이 없으면 목록과 푸터가 숨겨진다", async () => {
    await runSiheom(
      setup([]),
      assertions.not.visible(query.region("todo list")),
      assertions.not.visible(query.region("todo footer")),
    );
  });

  it("페이지 로드 시 새 할 일 입력에 포커스가 있다", async () => {
    await runSiheom(
      setup([]),
      assertions.focused(query.textbox("What needs to be done?")),
    );
  });
});
