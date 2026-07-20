import { beforeEach, describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { TodoMVCApp } from "./TodoMVCApp";
import type { Todo } from "./todoLogic";
import { TODO_BUY_MILK, TODO_READ_BOOK } from "./todos.fixture";
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

  it("Mark all as complete는 모든 할 일을 완료 상태로 만든다", async () => {
    await runSiheom(
      setup([TODO_BUY_MILK, TODO_READ_BOOK]),
      actions.click(query.checkbox("Mark all as complete")),
      assertions.a11ySnapshot(query.region("todo list"), "all-completed.snap"),
    );
  });

  it("모든 할 일을 개별 체크하면 Mark all as complete도 체크된다", async () => {
    await runSiheom(
      setup([TODO_BUY_MILK, TODO_READ_BOOK]),
      actions.click(query.checkbox(`Mark ${TODO_BUY_MILK.title} as complete`)),
      actions.click(query.checkbox(`Mark ${TODO_READ_BOOK.title} as complete`)),
      assertions.a11ySnapshot(query.region("todo list"), "all-completed.snap"),
    );
  });

  it("제목을 더블클릭하면 수정 모드로 들어간다", async () => {
    await runSiheom(
      setup([TODO_BUY_MILK]),
      actions.dblclick(query.label(`${TODO_BUY_MILK.title} title`)),
      assertions.focused(query.textbox(`Edit ${TODO_BUY_MILK.title}`)),
    );
  });

  it("수정 내용을 Enter로 저장한다", async () => {
    await runSiheom(
      setup([TODO_BUY_MILK]),
      actions.dblclick(query.label(`${TODO_BUY_MILK.title} title`)),
      actions.fill(query.textbox(`Edit ${TODO_BUY_MILK.title}`), "Buy oat milk{Enter}"),
      assertions.visible(query.listitem("Buy oat milk")),
      assertions.not.visible(query.listitem("Buy milk")),
    );
  });

  it("빈 제목으로 수정하면 할 일이 삭제된다", async () => {
    await runSiheom(
      setup([TODO_BUY_MILK]),
      actions.dblclick(query.label(`${TODO_BUY_MILK.title} title`)),
      actions.fill(query.textbox(`Edit ${TODO_BUY_MILK.title}`), "   {Enter}"),
      assertions.not.visible(query.listitem("Buy milk")),
      assertions.not.visible(query.region("todo list")),
    );
  });

  it("Escape로 수정을 취소한다", async () => {
    await runSiheom(
      setup([TODO_BUY_MILK]),
      actions.dblclick(query.label(`${TODO_BUY_MILK.title} title`)),
      actions.fill(query.textbox(`Edit ${TODO_BUY_MILK.title}`), "Changed{Escape}"),
      assertions.visible(query.listitem("Buy milk")),
      assertions.not.visible(query.textbox("Edit Buy milk")),
    );
  });

  it("삭제 버튼으로 할 일을 제거한다", async () => {
    await runSiheom(
      setup([TODO_BUY_MILK, TODO_READ_BOOK]),
      actions.click(query.button(`Delete ${TODO_BUY_MILK.title}`)),
      assertions.not.visible(query.listitem("Buy milk")),
      assertions.visible(query.listitem(TODO_READ_BOOK.title)),
    );
  });
});
