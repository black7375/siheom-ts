import { useMemo } from "react";
import {
  Link,
  Outlet,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";
import { ArticleDetailView } from "../components/ArticleDetailView";
import { ArticleListView } from "../components/ArticleListView";
import { ARTICLES, getArticle } from "../shared/articles";
import { articleCardLinkClassName, linkClassName } from "../shared/linkStyles";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function IndexPage() {
    return (
      <AppShell activeNav="articles">
        <ArticleListView
          headingId="article-index-heading"
          renderLink={({ article, headingId, children }) => (
            <Link
              to="/articles/$articleId"
              params={{ articleId: article.id }}
              aria-labelledby={headingId}
              className={articleCardLinkClassName}
            >
              {children}
            </Link>
          )}
        />
      </AppShell>
    );
  },
});

const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/articles/$articleId",
  component: function ArticlePage() {
    const { articleId } = articleRoute.useParams();
    const article = getArticle(articleId) ?? ARTICLES[0]!;

    return (
      <AppShell activeNav="articles">
        <ArticleDetailView
          article={article}
          backLink={
            <Link to="/" className={linkClassName}>
              목록으로
            </Link>
          }
        />
      </AppShell>
    );
  },
});

const routeTree = rootRoute.addChildren([indexRoute, articleRoute]);

function createTanStackRouter(initialPath = "/") {
  const history = createMemoryHistory({ initialEntries: [initialPath] });

  return createRouter({
    routeTree,
    history,
  });
}

export function TanStackRouterApp({ initialPath = "/" }: { initialPath?: string }) {
  const router = useMemo(() => createTanStackRouter(initialPath), [initialPath]);

  return <RouterProvider router={router} />;
}
