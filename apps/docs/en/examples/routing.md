# Routing / links

How to verify **navigation intent** with siheom: list/detail pages, hash sections, query-string deep links, and async `push`. Three showcases live under `apps/react-example/test/stories/routing/` for React Router, a fake Next router, and TanStack Router.

In Storybook (`yarn storybook`), open the **Routing/** group to inspect MemoryRouter, FakeNextRouter, and TanStack memory history interactively.

## Which strategy when

| Situation | Router | Test focus | Showcase |
| --- | --- | --- | --- |
| SSR list, static HTML, link intent only | **None** | `query.link` + `assertions.href` | React Router `ArticleList`, TanStack `TanStackArticleList` |
| In-page `#sign` section | MemoryRouter | hash click → `region` visibility | React Router `/terms` |
| `/notice?id=123` deep link | Fake Next router | `initialPath` + `assertions.expanded` | Next Router `NextRouterApp` |
| Navigation after API | MemoryRouter | loading UI → destination `region` | React Router `/login` → `/dashboard` |
| Isolate TanStack `Link` | memory history + **Link stub alias** | stub: href only; app: click navigation | TanStack Router |

Prefer role + name (`link`, `region`, `heading`) over implementation selectors (`data-testid`, router internals).

## UI: card links and accessible names

List and notice cards are **entire-card links**. The visible card shows title, excerpt, and meta; the accessible name comes from the **heading (`h2`)** inside the link via `aria-labelledby`.

Tests use the headline text, e.g. `query.link("정적 링크로 목록 페이지를 검증하는 방법")`. Page landmarks use `h1` + `aria-labelledby` (e.g. `query.region("공지사항")`).

## 1. Static href — no router

For server-rendered lists or components tested without a Router Provider:

```tsx
await runSiheom(
  given.render(<ArticleList />),
  assertions.visible(query.link(ARTICLES[0]!.headline)),
  assertions.href(query.link(ARTICLES[0]!.headline), "/articles/1"),
);
```

`assertions.href` is the built-in assertion for link `href` attributes.

## 2. React Router — MemoryRouter

`ReactRouterApp` wraps routes in `MemoryRouter` with `initialEntries` for Storybook and Vitest browser.

Hash navigation and async login → dashboard flows use `query.link`, `query.region`, and `assertions.not.visible` — see the Korean page for full snippets (`/examples/routing`).

Wrap providers inside **`given.render`**, not a separate siheom Wrapper API.

## 3. Next Router — fake implementation

`FakeNextRouterProvider` replaces `next-router-mock`: `push`, `useSearchParams`, and query-string parsing. Tests pass `initialPath="/notice?id=123"` and assert the matching accordion trigger with `assertions.expanded(query.button("공지 123"))`. Notice content uses shadcn Accordion from `@/components/ui/accordion`.

## 4. TanStack Router — Link stub alias

- **`TanStackRouterApp`**: real `@tanstack/react-router` `Link` + `RouterProvider`
- **`TanStackArticleList`**: imports `@showcase/tanstack-link`, resolved to a stub `<a>` in both Vitest and Storybook

Navigation tests use the real router app; href-only tests use the stub list.

## Source layout

| Framework | App | Tests |
| --- | --- | --- |
| React Router | `routing/react-router/ReactRouterApp.tsx` | `ReactRouterApp.test.tsx` |
| Next (fake) | `routing/next-router/NextRouterApp.tsx` | `NextRouterApp.test.tsx` |
| TanStack | `routing/tanstack-router/TanStackRouterApp.tsx` | `TanStackRouterApp.test.tsx` |

## Next steps

- [`assertions.href`](/en/configuration/assertions)
- [given](/en/concepts/given)
- [locator](/en/concepts/locator)
- [SignUpForm](/en/examples/signup-form)
