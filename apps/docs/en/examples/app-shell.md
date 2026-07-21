# App Shell — Sidebar + Breadcrumb

A composite example where several components move together: navigating via the Sidebar menu updates both the Breadcrumb and the main content. Like [Routing](/en/examples/routing), it tests a router through `MemoryRouter`.

Source: [`apps/react-example/test/stories/shadcn/app-shell/AppShell.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/app-shell/AppShell.tsx), [`AppShell.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/app-shell/AppShell.test.tsx).

## UI accessibility

Initial accessibility snapshot fixed by the test.

<<< @/_snaps/app-shell-initial.snap{text}

## Test: navigating via the sidebar updates breadcrumb and content

```tsx
await runSiheom(
  given.render(<AppShell />),
  assertions.visible(query.region("대시보드")),
  assertions.current(
    query.within(query.navigation("breadcrumb"), query.link("대시보드")),
    "page",
  ),
  actions.click(query.within(query.navigation("앱 메뉴"), query.link("설정"))),
  assertions.visible(query.region("설정")),
  assertions.current(query.within(query.navigation("breadcrumb"), query.link("설정")), "page"),
  assertions.not.visible(query.region("대시보드")),
);
```

The page has a `link` named `"대시보드"` in both the sidebar and the breadcrumb. `query.within(query.navigation(...), query.link(...))` specifies which navigation the link belongs to, avoiding the "multiple matches" error that plain `query.link("대시보드")` would raise.

## Accessibility notes

- shadcn/ui's `Breadcrumb` gives its container a default `aria-label="breadcrumb"`. Landmark names a component ships by default, like this one, can be used directly in tests via `query.navigation("breadcrumb")`.
- The current page's breadcrumb entry isn't a clickable link — it's a `BreadcrumbPage` carrying `aria-current="page"`. One test verifies that "where am I" is expressed consistently through `aria-current` in both navigations (sidebar and breadcrumb).

## Next steps

- [Routing / links](/en/examples/routing) — MemoryRouter, query strings
- [locator](/en/concepts/locator) — Scoping with `query.within`
- [kanban](/en/examples/kanban) — Drag and drop
