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