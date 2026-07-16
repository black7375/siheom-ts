import { ArticleListShell } from "../components/ArticleListShell";
import { createArticleListLinkRenderer } from "../components/indexListViews";
import { Link } from "@showcase/tanstack-link";

export function TanStackArticleList() {
  return <ArticleListShell renderLink={createArticleListLinkRenderer(Link)} />;
}
