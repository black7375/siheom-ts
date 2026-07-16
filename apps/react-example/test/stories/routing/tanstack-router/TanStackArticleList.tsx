import { Link } from "@showcase/tanstack-link";
import { AppShell } from "../components/AppShell";
import { ArticleListView } from "../components/ArticleListView";
import { articleCardLinkClassName } from "../shared/linkStyles";

export function TanStackArticleList() {
  return (
    <AppShell activeNav="articles">
      <ArticleListView
        renderLink={({ article, headingId, children }) => (
          <Link
            to={`/articles/${article.id}`}
            aria-labelledby={headingId}
            className={articleCardLinkClassName}
          >
            {children}
          </Link>
        )}
      />
    </AppShell>
  );
}
