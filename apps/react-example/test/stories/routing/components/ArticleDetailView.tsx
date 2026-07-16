import type { ReactNode } from "react";
import type { Article } from "../shared/articles";
import { PageIntro } from "./AppShell";
import { Separator } from "@/components/ui/separator";

export function ArticleDetailView({
  article,
  backLink,
}: {
  article: Article;
  backLink: ReactNode;
}) {
  const headingId = `article-${article.id}-heading`;

  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <PageIntro
        titleId={headingId}
        eyebrow={article.category}
        title={`글 ${article.id}`}
        description={article.headline}
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-xs text-muted-foreground">{article.publishedAt}</p>
        <Separator className="my-4" />
        <div className="space-y-4 text-sm leading-7 text-foreground/90">
          <p>{article.body}</p>
          <p className="text-muted-foreground">{article.excerpt}</p>
        </div>
      </div>

      <div>{backLink}</div>
    </section>
  );
}
