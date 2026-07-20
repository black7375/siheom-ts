import { beforeEach, describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { TodoMVCApp } from "./TodoMVCApp";
import type { Todo } from "./todoLogic";
import { TODO_BUY_MILK } from "./todos.fixture";
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

  it("Enter로 할 일을 추가하고 입력을 비운다", async () => {
    await runSiheom(
      setup([]),
      actions.fill(query.textbox("What needs to be done?"), "Buy milk{Enter}"),
      assertions.visible(query.listitem("Buy milk")),
      assertions.value(query.textbox("What needs to be done?"), ""),
      assertions.visible(query.region("todo list")),
      assertions.visible(query.region("todo footer")),
    );
  });

  it("공백만 입력하면 할 일이 생기지 않는다", async () => {
    await runSiheom(
      setup([]),
      actions.fill(query.textbox("What needs to be done?"), "   {Enter}"),
      assertions.not.visible(query.region("todo list")),
      assertions.not.visible(query.region("todo footer")),
    );
  });

  it("체크박스로 할 일을 완료할 수 있다", async () => {
    await runSiheom(
      setup([TODO_BUY_MILK]),
      actions.click(query.checkbox(`Mark ${TODO_BUY_MILK.title} as complete`)),
      assertions.a11ySnapshot(query.region("todo list"), "buy-milk-completed.snap"),
    );
  });
});
