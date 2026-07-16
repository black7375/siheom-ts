import { AppShell } from "./AppShell";
import { ArticleListView, type ArticleCardLinkRenderProps } from "./indexListViews";
import type { ReactNode } from "react";

export function ArticleListShell({
  renderLink,
}: {
  renderLink: (props: ArticleCardLinkRenderProps) => ReactNode;
}) {
  return (
    <AppShell activeNav="articles">
      <ArticleListView renderLink={renderLink} />
    </AppShell>
  );
}
