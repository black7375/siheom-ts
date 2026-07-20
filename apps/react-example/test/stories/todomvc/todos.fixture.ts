import type { Todo } from "./todoLogic";

export const TODO_BUY_MILK: Todo = {
  id: "todo-buy-milk",
  title: "Buy milk",
  completed: false,
};

export const TODO_WALK_DOG: Todo = {
  id: "todo-walk-dog",
  title: "Walk the dog",
  completed: true,
};

export const TODO_READ_BOOK: Todo = {
  id: "todo-read-book",
  title: "Read a book",
  completed: false,
};

export const SEEDED_TODOS: Todo[] = [TODO_BUY_MILK, TODO_WALK_DOG, TODO_READ_BOOK];
