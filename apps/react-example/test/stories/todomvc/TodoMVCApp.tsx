import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
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
    <section aria-label="todos" className="mx-auto w-full max-w-xl space-y-4 p-4">
      <header className="space-y-4 text-center">
        <h1 className="text-5xl font-light tracking-tight text-primary">todos</h1>
        <Input
          className="h-12 rounded-none border-0 border-b border-input bg-background px-0 text-lg shadow-none focus-visible:ring-0"
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
        <section aria-label="todo list" className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Checkbox
              id="toggle-all"
              checked={allCompleted(todos)}
              onCheckedChange={(checked) => {
                setTodos((current) => toggleAll(current, checked === true));
              }}
            />
            <Label htmlFor="toggle-all" className="font-normal text-muted-foreground">
              Mark all as complete
            </Label>
          </div>
          <ul className="divide-y">
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
        <section
          aria-label="todo footer"
          className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
        >
          <span role="status" aria-label="items left">
            <strong className="text-foreground">{countActive(todos)}</strong>{" "}
            {countActive(todos) === 1 ? "item" : "items"} left
          </span>
          <ul className="flex items-center gap-1">
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setTodos((current) => clearCompleted(current))}
            >
              Clear completed
            </Button>
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
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "ghost", size: "sm" }),
        "no-underline",
      )}
    >
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
      className={cn(
        "group flex items-center gap-3 px-3 py-2",
        todo.completed && "text-muted-foreground",
        editing && "bg-muted/40",
      )}
    >
      <Checkbox
        aria-label={`Mark ${todo.title} as complete`}
        checked={todo.completed}
        onCheckedChange={onToggle}
      />
      {editing ? (
        <Input
          className="h-8 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
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
        <Label
          aria-label={`${todo.title} title`}
          onDoubleClick={onStartEdit}
          className={cn(
            "min-w-0 flex-1 cursor-default font-normal",
            todo.completed && "line-through",
          )}
        >
          {todo.title}
        </Label>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={`Delete ${todo.title}`}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
