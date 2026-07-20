# App Shell — Sidebar + Breadcrumb

Sidebar 메뉴로 라우트를 이동하면 Breadcrumb과 본문이 함께 갱신되는, 여러 컴포넌트가 함께 맞물려 동작하는 복합 예제입니다. [Routing](/examples/routing)처럼 `MemoryRouter`로 라우터를 시험합니다.

소스: `apps/react-example/test/stories/shadcn/app-shell/AppShell.tsx`, `AppShell.test.tsx`.

## UI

- 사이드바 메뉴: role `navigation`, name `"앱 메뉴"`; 링크는 `link` (`"대시보드"`, `"설정"`)
- Breadcrumb: role `navigation`, name `"breadcrumb"` (shadcn/ui `Breadcrumb`가 기본으로 부여); 현재 페이지는 `link`이면서 `aria-current="page"`
- 본문: role `region`, name `"대시보드"` / `"설정"`

## 시험: 사이드바로 이동하면 breadcrumb과 본문이 갱신된다

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

페이지에는 `link` name `"대시보드"`가 사이드바와 breadcrumb 두 곳에 있습니다. `query.within(query.navigation(...), query.link(...))`으로 "어느 내비게이션 안의 링크인지"를 명시해야, `query.link("대시보드")`만 썼을 때 발생하는 "여러 개 일치" 에러를 피할 수 있습니다.

## 접근성 포인트

- shadcn/ui `Breadcrumb`은 컨테이너에 기본 `aria-label="breadcrumb"`을 부여합니다. `query.navigation("breadcrumb")`처럼 컴포넌트가 기본 제공하는 landmark 이름을 그대로 시험에 활용할 수 있습니다.
- 현재 페이지의 breadcrumb 항목은 클릭 가능한 링크가 아니라 `aria-current="page"`가 붙은 `BreadcrumbPage`입니다. 두 내비게이션(사이드바/breadcrumb) 모두에서 "지금 어디에 있는지"가 `aria-current`로 일관되게 드러난다는 것을 하나의 시험으로 검증합니다.

## 다음 단계

- [라우팅 / 링크](/examples/routing) — MemoryRouter, query string
- [locator](/concepts/locator) — `query.within`으로 범위 좁히기
- [kanban](/examples/kanban) — 드래그 앤 드롭
