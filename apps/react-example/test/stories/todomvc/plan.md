# TodoMVC TDD plan

Spec: [TodoMVC app-spec](https://raw.githubusercontent.com/tastejs/todomvc/refs/heads/master/app-spec.md)

- [x] no todos — todo list region and footer region are hidden
- [x] new todo — input is focused on load
- [ ] new todo — Enter creates a todo and clears the input
- [ ] new todo — trimmed empty input does not create a todo
- [ ] item — checkbox marks todo complete
- [ ] mark all — toggles every todo to the checkbox state
- [ ] mark all — checkbox reflects when all items are checked individually
- [ ] editing — double-click title enters edit mode with focus
- [ ] editing — Enter and blur save the title
- [ ] editing — empty title removes the todo
- [ ] editing — Escape discards changes
- [ ] item — delete button removes the todo
- [ ] counter — shows active count with correct pluralization
- [ ] clear completed — removes completed todos and hides when none remain
- [ ] persistence — todos are stored in localStorage
- [ ] routing — Active filter shows only active todos
- [ ] routing — Completed filter shows only completed todos
- [ ] routing — active filter link has aria-current page
- [ ] routing — active filter persists after reload
- [ ] routing — completing a todo hides it on Active filter
