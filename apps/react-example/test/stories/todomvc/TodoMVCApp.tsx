import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import type { Todo } from "./todoLogic";
import { readTodos } from "./todoStorage";

export function TodoMVCApp({
  initialEntries = ["/"],
}: {
  initialEntries?: string[];
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="*" element={<TodoMVCContent />} />
      </Routes>
    </MemoryRouter>
  );
}

function TodoMVCContent() {
  const [todos] = useState<Todo[]>(() => readTodos());
  const hasTodos = todos.length > 0;

  return (
    <section className="todoapp" aria-label="todos">
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          aria-label="What needs to be done?"
          autoFocus
          placeholder="What needs to be done?"
        />
      </header>

      {hasTodos ? <section className="main" aria-label="todo list" /> : null}
      {hasTodos ? <footer className="footer" aria-label="todo footer" /> : null}
    </section>
  );
}
