import { MemoryRouter, Route, Routes, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  addTodo,
  allCompleted,
  clearCompleted,
  countActive,
  filterTodos,
  hasCompleted,
  parseFilter,
  removeTodo,
  toggleAll,
  toggleTodo,
  updateTodoTitle,
  type Todo,
} from "./todoLogic";
import { readTodos, writeTodos } from "./todoStorage";

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
  const { pathname } = useLocation();
  const filter = parseFilter(pathname);
  const [todos, setTodos] = useState<Todo[]>(() => readTodos());
  const [editingId, setEditingId] = useState<string | null>(null);
  const hasTodos = todos.length > 0;
  const visibleTodos = filterTodos(todos, filter);

  useEffect(() => {
    writeTodos(todos);
  }, [todos]);

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
            {visibleTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                editing={editingId === todo.id}
                onToggle={() => setTodos((current) => toggleTodo(current, todo.id))}
                onStartEdit={() => setEditingId(todo.id)}
                onFinishEdit={(title) => {
                  setTodos((current) => updateTodoTitle(current, todo.id, title));
                  setEditingId(null);
                }}
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => setTodos((current) => removeTodo(current, todo.id))}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {hasTodos ? (
        <section className="footer" aria-label="todo footer">
          <span className="todo-count" role="status" aria-label="items left">
            <strong>{countActive(todos)}</strong>{" "}
            {countActive(todos) === 1 ? "item" : "items"} left
          </span>
          <ul className="filters">
            <li>
              <FilterLink to="/" label="All" active={filter === "all"} />
            </li>
            <li>
              <FilterLink to="/active" label="Active" active={filter === "active"} />
            </li>
            <li>
              <FilterLink to="/completed" label="Completed" active={filter === "completed"} />
            </li>
          </ul>
          {hasCompleted(todos) ? (
            <button
              type="button"
              className="clear-completed"
              onClick={() => setTodos((current) => clearCompleted(current))}
            >
              Clear completed
            </button>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}

function FilterLink({
  to,
  label,
  active,
}: {
  to: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link to={to} aria-current={active ? "page" : undefined}>
      {label}
    </Link>
  );
}

function TodoItem({
  todo,
  editing,
  onToggle,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
  onDelete,
}: {
  todo: Todo;
  editing: boolean;
  onToggle: () => void;
  onStartEdit: () => void;
  onFinishEdit: (title: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li
      aria-label={todo.title}
      className={[todo.completed ? "completed" : "", editing ? "editing" : ""]
        .filter(Boolean)
        .join(" ") || undefined}
    >
      <input
        className="toggle"
        type="checkbox"
        aria-label={`Mark ${todo.title} as complete`}
        checked={todo.completed}
        onChange={onToggle}
      />
      {editing ? (
        <input
          className="edit"
          aria-label={`Edit ${todo.title}`}
          defaultValue={todo.title}
          autoFocus
          onBlur={(event) => onFinishEdit(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onFinishEdit(event.currentTarget.value);
            }
            if (event.key === "Escape") {
              onCancelEdit();
            }
          }}
        />
      ) : (
        <label aria-label={`${todo.title} title`} onDoubleClick={onStartEdit}>
          {todo.title}
        </label>
      )}
      <button
        type="button"
        className="destroy"
        aria-label={`Delete ${todo.title}`}
        onClick={onDelete}
      />
    </li>
  );
}
