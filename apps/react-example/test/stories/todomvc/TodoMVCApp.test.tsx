import { beforeEach, describe, it, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { TodoMVCApp } from "./TodoMVCApp.tsx";
import type { Todo } from "./todoLogic";
import { SEEDED_TODOS, TODO_BUY_MILK, TODO_READ_BOOK, TODO_WALK_DOG } from "./todos.fixture";
import { writeTodos, readTodos } from "./todoStorage";

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

  it("더블클릭 후 Enter로 수정 내용을 저장한다", async () => {
    await runSiheom(
      setup([TODO_BUY_MILK]),
      actions.dblclick(query.label(`${TODO_BUY_MILK.title} title`)),
      assertions.focused(query.textbox(`Edit ${TODO_BUY_MILK.title}`)),
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

  it("남은 할 일 개수를 올바른 복수형으로 표시한다", async () => {
    await runSiheom(
      setup(SEEDED_TODOS),
      assertions.textContent(query.status("items left"), "2 items left"),
    );
  });

  it("Clear completed로 완료된 할 일을 지우고 버튼을 숨긴다", async () => {
    await runSiheom(
      setup(SEEDED_TODOS),
      actions.click(query.button("Clear completed")),
      assertions.not.visible(query.listitem(TODO_WALK_DOG.title)),
      assertions.not.visible(query.button("Clear completed")),
    );
  });

  it("할 일을 localStorage에 저장한다", async () => {
    await runSiheom(
      setup([]),
      actions.fill(query.textbox("What needs to be done?"), "Buy milk{Enter}"),
    );

    expect(readTodos()).toStrictEqual([
      expect.objectContaining({ title: "Buy milk", completed: false }),
    ]);
  });

  it("Active 필터는 진행 중인 할 일만 보여준다", async () => {
    await runSiheom(
      setup(SEEDED_TODOS, "/active"),
      assertions.visible(query.listitem(TODO_BUY_MILK.title)),
      assertions.visible(query.listitem(TODO_READ_BOOK.title)),
      assertions.not.visible(query.listitem(TODO_WALK_DOG.title)),
    );
  });

  it("Completed 필터는 완료된 할 일만 보여준다", async () => {
    await runSiheom(
      setup(SEEDED_TODOS, "/completed"),
      assertions.visible(query.listitem(TODO_WALK_DOG.title)),
      assertions.not.visible(query.listitem(TODO_BUY_MILK.title)),
    );
  });

  it("Active 필터 링크에 현재 페이지 표시가 있다", async () => {
    await runSiheom(
      setup(SEEDED_TODOS, "/active"),
      assertions.current(query.link("Active"), "page"),
    );
  });

  it("새로고침 후에도 Active 필터가 유지된다", async () => {
    await runSiheom(
      setup(SEEDED_TODOS, "/active"),
      assertions.current(query.link("Active"), "page"),
    );

    cleanup();
    await runSiheom(
      given.render(<TodoMVCApp initialEntries={["/active"]} />),
      assertions.current(query.link("Active"), "page"),
    );
  });

  it("Active 필터에서 완료하면 항목이 숨겨진다", async () => {
    await runSiheom(
      setup(SEEDED_TODOS, "/active"),
      actions.click(query.checkbox(`Mark ${TODO_BUY_MILK.title} as complete`)),
      assertions.not.visible(query.listitem(TODO_BUY_MILK.title)),
    );
  });
});
