import type { ReactNode } from "react";
import { ARTICLES, type Article } from "../shared/articles";
import { PageIntro } from "./AppShell";

export type ArticleCardLinkRenderProps = {
  article: Article;
  headingId: string;
  children: ReactNode;
};

export function ArticleListView({
  headingId = "article-list-heading",
  renderLink,
}: {
  headingId?: string;
  renderLink: (props: ArticleCardLinkRenderProps) => ReactNode;
}) {
  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <PageIntro
        titleId={headingId}
        eyebrow="Articles"
        title="글 목록"
        description="카드 전체가 링크이며, 접근 가능한 이름은 카드 안 제목(h2)에서 가져옵니다."
      />

      <nav aria-label="글 바로가기">
        <ul className="grid gap-4">
          {ARTICLES.map((article) => {
            const cardHeadingId = `article-${article.id}-title`;

            return (
              <li key={article.id}>
                {renderLink({
                  article,
                  headingId: cardHeadingId,
                  children: (
                    <>
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                          {article.category}
                        </span>
                        <span>{article.publishedAt}</span>
                      </div>
                      <h2 id={cardHeadingId} className="text-lg font-semibold">
                        {article.headline}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {article.excerpt}
                      </p>
                    </>
                  ),
                })}
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
