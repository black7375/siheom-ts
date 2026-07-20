export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export type TodoFilter = "all" | "active" | "completed";

export function createTodo(title: string, id = crypto.randomUUID()): Todo {
  return { id, title, completed: false };
}

export function addTodo(todos: Todo[], title: string): Todo[] {
  const trimmed = title.trim();
  if (!trimmed) return todos;
  return [...todos, createTodo(trimmed)];
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
}

export function toggleAll(todos: Todo[], completed: boolean): Todo[] {
  return todos.map((todo) => ({ ...todo, completed }));
}

export function updateTodoTitle(todos: Todo[], id: string, title: string): Todo[] {
  const trimmed = title.trim();
  if (!trimmed) return todos.filter((todo) => todo.id !== id);
  return todos.map((todo) => (todo.id === id ? { ...todo, title: trimmed } : todo));
}

export function removeTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}

export function clearCompleted(todos: Todo[]): Todo[] {
  return todos.filter((todo) => !todo.completed);
}

export function filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

export function countActive(todos: Todo[]): number {
  return todos.filter((todo) => !todo.completed).length;
}

export function activeCountLabel(count: number): string {
  const noun = count === 1 ? "item" : "items";
  return `${count} ${noun} left`;
}

export function allCompleted(todos: Todo[]): boolean {
  return todos.length > 0 && todos.every((todo) => todo.completed);
}

export function hasCompleted(todos: Todo[]): boolean {
  return todos.some((todo) => todo.completed);
}

export function parseFilter(pathname: string): TodoFilter {
  if (pathname.endsWith("/active")) return "active";
  if (pathname.endsWith("/completed")) return "completed";
  return "all";
}
