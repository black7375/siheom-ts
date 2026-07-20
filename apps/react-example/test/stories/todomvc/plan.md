# TodoMVC TDD plan

Spec: [TodoMVC app-spec](https://raw.githubusercontent.com/tastejs/todomvc/refs/heads/master/app-spec.md)

- [x] no todos — todo list region and footer region are hidden
- [x] new todo — input is focused on load
- [x] new todo — Enter creates a todo and clears the input
- [x] new todo — trimmed empty input does not create a todo
- [x] item — checkbox marks todo complete
- [x] mark all — toggles every todo to the checkbox state
- [x] mark all — checkbox reflects when all items are checked individually
- [x] editing — double-click title enters edit mode with focus (covered by Enter save test)
- [x] editing — Enter and blur save the title
- [x] editing — empty title removes the todo
- [x] editing — Escape discards changes
- [x] item — delete button removes the todo
- [x] counter — shows active count with correct pluralization
- [x] clear completed — removes completed todos and hides when none remain
- [x] persistence — todos are stored in localStorage
- [x] routing — Active filter shows only active todos
- [x] routing — Completed filter shows only completed todos
- [x] routing — active filter link has aria-current page
- [x] routing — active filter persists after reload
- [x] routing — completing a todo hides it on Active filter
