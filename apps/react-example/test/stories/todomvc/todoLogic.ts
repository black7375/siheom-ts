export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

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

export function allCompleted(todos: Todo[]): boolean {
  return todos.length > 0 && todos.every((todo) => todo.completed);
}

export function updateTodoTitle(todos: Todo[], id: string, title: string): Todo[] {
  const trimmed = title.trim();
  if (!trimmed) return todos.filter((todo) => todo.id !== id);
  return todos.map((todo) => (todo.id === id ? { ...todo, title: trimmed } : todo));
}

export function removeTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((todo) => todo.id !== id);
}