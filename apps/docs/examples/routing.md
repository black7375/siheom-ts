# 라우팅 / 링크

목록·상세·해시·query string·비동기 `push`처럼 **내비게이션 의도**를 siheom으로 검증하는 전략을 정리합니다. React Router, 가짜 Next Router, TanStack Router 세 가지 쇼케이스가 `apps/react-example/test/stories/routing/`에 있습니다.

Storybook(`yarn storybook`) → **Routing/** 그룹에서 MemoryRouter / FakeNextRouter / TanStack memory history 동작을 눈으로 확인할 수 있습니다.

## 어떤 전략을 쓸까

| 상황 | 라우터 | 시험 초점 | 쇼케이스 |
| --- | --- | --- | --- |
| SSR 목록, 정적 HTML, 링크 의도만 확인 | **없음** | `query.link` + `assertions.href` | React Router `ArticleList`, TanStack `TanStackArticleList` |
| 같은 페이지 `#sign` 섹션 전환 | MemoryRouter | hash 클릭 후 `region` 가시성 | React Router `/terms` |
| `/notice?id=123` deep link | 가짜 Next Router | `initialPath` + `assertions.expanded` | Next Router `NextRouterApp` |
| API 후 programmatic navigation | MemoryRouter | 로딩 UI → 도착 `region` | React Router `/login` → `/dashboard` |
| TanStack Link 구현 분리 | memory history + **Link stub alias** | stub은 href만, 앱은 클릭 navigation | TanStack Router |

원칙: **구현 셀렉터(`data-testid`, 라우터 내부 API) 대신** role + name(`link`, `region`, `heading`)으로 assert합니다.

## UI: 카드 링크와 accessible name

목록·공지 카드는 **카드 전체가 링크**입니다. 시각적으로는 제목·요약·메타가 한 덩어리처럼 보이지만, accessible name은 카드 안 **제목(`h2`)** 에서 가져옵니다.

```tsx
<Link to={`/articles/${article.id}`} aria-labelledby={headingId} className={articleCardLinkClassName}>
  <span aria-hidden="true">{article.publishedAt}</span>
  <h2 id={headingId}>{article.headline}</h2>
  <p>{article.excerpt}</p>
</Link>
```

시험에서는 `query.link("정적 링크로 목록 페이지를 검증하는 방법")`처럼 **제목 텍스트**로 조회합니다. 페이지 landmark는 `h1` + `aria-labelledby`로 연결합니다 (`query.region("공지사항")`).

## 1. 정적 href — 라우터 없이

서버가 내려준 목록 HTML, 또는 아직 Router Provider가 없는 단위 시험에 적합합니다.

```tsx
await runSiheom(
  given.render(<ArticleList />),
  assertions.visible(query.link(ARTICLES[0]!.headline)),
  assertions.href(query.link(ARTICLES[0]!.headline), "/articles/1"),
);
```

`assertions.href`는 링크의 `href` 속성을 assert하는 공식 API입니다. `toHaveAttribute`를 시험 밖에서 직접 쓰지 않아도 됩니다.

## 2. React Router — MemoryRouter

`ReactRouterApp`은 `MemoryRouter` + `initialEntries`로 Storybook·Vitest browser에서 동일하게 동작합니다.

**해시 네비게이션**

```tsx
await runSiheom(
  given.render(<ReactRouterApp initialEntries={["/terms"]} />),
  assertions.visible(query.region("이용약관")),
  actions.click(query.link("서명 섹션으로")),
  assertions.visible(query.region("서명")),
  assertions.not.visible(query.region("이용약관")),
);
```

**비동기 로그인 후 push**

```tsx
await runSiheom(
  given.render(<ReactRouterApp initialEntries={["/login"]} login={slowLogin} />),
  actions.click(query.button("로그인")),
  assertions.visible(query.button("로그인 중...")),
  assertions.visible(query.region("대시보드")),
);
```

Provider는 별도 siheom API가 아니라 **`given.render`로 감싼 컴포넌트**에 포함합니다 (`CONTEXT.md`의 Wrapper / Provider 패턴).

## 3. Next Router — 가짜 구현체

`next-router-mock` 대신 `FakeNextRouterProvider`가 `push` / `useSearchParams` / query string 파싱을 제공합니다. Next 앱 코드와 같은 import 경로(`../fake-next-router/FakeNextRouter`)를 쓰되, 테스트·Storybook에서는 가벼운 in-memory 구현을 씁니다.

**외부 deep link 진입**

```tsx
await runSiheom(
  given.render(<NextRouterApp initialPath="/notice?id=123" />),
  assertions.visible(query.region("공지사항")),
  assertions.expanded(query.button("공지 123")),
  assertions.not.expanded(query.button("공지 456")),
);
```

**목록에서 클릭 → query string 이동**

```tsx
await runSiheom(
  given.render(<NextRouterApp initialPath="/" />),
  actions.click(query.link("공지 456")),
  assertions.expanded(query.button("공지 456")),
);
```

공지 본문은 shadcn Accordion(`@/components/ui/accordion`)으로 렌더합니다. 열림 상태는 trigger의 `aria-expanded`를 `assertions.expanded`로 검증합니다.

## 4. TanStack Router — Link stub alias

- **`TanStackRouterApp`**: `@tanstack/react-router`의 real `Link` + `createMemoryHistory` + `RouterProvider`
- **`TanStackArticleList`**: `@showcase/tanstack-link` import → Vitest·Storybook 모두 **stub `<a>`** 로 resolve

`vite.config.ts`:

```ts
resolve: {
  alias: {
    "@showcase/tanstack-link": "…/tanstack-router/stubs/link.tsx",
  },
},
```

stub은 Router context 없이 `assertions.href`만 검증할 때 사용합니다. navigation 시험은 real Link가 있는 `TanStackRouterApp`으로 합니다.

```tsx
await runSiheom(
  given.render(<TanStackRouterApp initialPath="/" />),
  actions.click(query.link(ARTICLES[0]!.headline)),
  assertions.visible(query.region("글 1")),
);
```

## 소스 위치

| 프레임워크 | 앱 | 시험 |
| --- | --- | --- |
| React Router | `routing/react-router/ReactRouterApp.tsx` | `ReactRouterApp.test.tsx` |
| Next (fake) | `routing/next-router/NextRouterApp.tsx` | `NextRouterApp.test.tsx` |
| TanStack | `routing/tanstack-router/TanStackRouterApp.tsx` | `TanStackRouterApp.test.tsx` |
| 공통 UI | `routing/components/`, `routing/shared/` | — |

## 다음 단계

- [`assertions.href`](/configuration/assertions) — 링크 href assertion
- [given](/concepts/given) — `given.render`로 Provider 감싸기
- [locator](/concepts/locator) — `query.link`, `query.region`
- [SignUpForm](/examples/signup-form) — 폼·region 스냅샷 예제
