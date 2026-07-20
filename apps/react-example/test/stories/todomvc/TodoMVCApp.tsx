import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { addTodo, allCompleted, toggleAll, toggleTodo, type Todo } from "./todoLogic";
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
  const [todos, setTodos] = useState<Todo[]>(() => readTodos());
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
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            setTodos((current) => addTodo(current, event.currentTarget.value));
            event.currentTarget.value = "";
          }}
        />
      </header>

      {hasTodos ? (
        <section className="main" aria-label="todo list">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            aria-label="Mark all as complete"
            checked={allCompleted(todos)}
            onChange={(event) => {
              setTodos((current) => toggleAll(current, event.currentTarget.checked));
            }}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {todos.map((todo) => (
              <li
                key={todo.id}
                aria-label={todo.title}
                className={todo.completed ? "completed" : undefined}
              >
                <input
                  className="toggle"
                  type="checkbox"
                  aria-label={`Mark ${todo.title} as complete`}
                  checked={todo.completed}
                  onChange={() => {
                    setTodos((current) => toggleTodo(current, todo.id));
                  }}
                />
                {todo.title}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasTodos ? (
        <section className="footer" aria-label="todo footer" />
      ) : null}
    </section>
  );
}
