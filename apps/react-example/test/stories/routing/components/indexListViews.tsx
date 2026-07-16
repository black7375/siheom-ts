import type { ReactNode } from "react";
import { ARTICLES, type Article } from "../shared/articles";
import { NOTICES, type Notice } from "../shared/notices";
import { articleCardLinkClassName } from "../shared/linkStyles";
import { IndexListView, type IndexListLinkRenderProps } from "./IndexListView";

export type ArticleCardLinkRenderProps = IndexListLinkRenderProps<Article> & {
  article: Article;
};

export type NoticeCardLinkRenderProps = IndexListLinkRenderProps<Notice> & {
  notice: Notice;
};

const ARTICLE_LIST = {
  defaultHeadingId: "article-list-heading",
  items: ARTICLES,
  idPrefix: "article",
  pageIntro: {
    eyebrow: "Articles",
    title: "글 목록",
    description: "카드 전체가 링크이며, 접근 가능한 이름은 카드 안 제목(h2)에서 가져옵니다.",
  },
  navLabel: "글 바로가기",
  listClassName: "grid gap-4",
  renderCardContent: (article: Article, cardHeadingId: string) => (
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
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
    </>
  ),
} as const;

const NOTICE_LIST = {
  defaultHeadingId: "notice-index-heading",
  items: NOTICES,
  idPrefix: "notice",
  pageIntro: {
    eyebrow: "Notices",
    title: "공지 목록",
    description: "카드 전체가 링크이며, 접근 가능한 이름은 카드 안 제목(h2)에서 가져옵니다.",
  },
  navLabel: "공지 바로가기",
  listClassName: "grid gap-3",
  renderCardContent: (notice: Notice, cardHeadingId: string) => (
    <>
      <p aria-hidden="true" className="mb-2 text-xs text-muted-foreground">
        {notice.publishedAt}
      </p>
      <h2 id={cardHeadingId} className="text-lg font-semibold">
        {notice.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{notice.summary}</p>
    </>
  ),
} as const;

function renderCardListView<TItem extends { id: string }, TLinkProps>(
  definition: {
    defaultHeadingId: string;
    items: readonly TItem[];
    idPrefix: string;
    pageIntro: {
      eyebrow: string;
      title: string;
      description: string;
    };
    navLabel: string;
    listClassName?: string;
    renderCardContent: (item: TItem, cardHeadingId: string) => ReactNode;
  },
  headingId: string | undefined,
  renderLink: (props: TLinkProps) => ReactNode,
  toLinkProps: (props: IndexListLinkRenderProps<TItem>) => TLinkProps,
) {
  return (
    <IndexListView
      headingId={headingId ?? definition.defaultHeadingId}
      items={[...definition.items]}
      idPrefix={definition.idPrefix}
      pageIntro={definition.pageIntro}
      navLabel={definition.navLabel}
      listClassName={definition.listClassName}
      renderLink={(props) => renderLink(toLinkProps(props))}
      renderCardContent={definition.renderCardContent}
    />
  );
}

const CARD_LIST_CONFIG = {
  article: {
    definition: ARTICLE_LIST,
    createLinkProps: ({ item, headingId, children }: IndexListLinkRenderProps<Article>) =>
      ({
        article: item,
        item,
        headingId,
        children,
      }) satisfies ArticleCardLinkRenderProps,
  },
  notice: {
    definition: NOTICE_LIST,
    createLinkProps: ({ item, headingId, children }: IndexListLinkRenderProps<Notice>) =>
      ({
        notice: item,
        item,
        headingId,
        children,
      }) satisfies NoticeCardLinkRenderProps,
  },
} as const;

type CardListViewProps =
  | {
      variant: "article";
      headingId?: string;
      renderLink: (props: ArticleCardLinkRenderProps) => ReactNode;
    }
  | {
      variant: "notice";
      headingId?: string;
      renderLink: (props: NoticeCardLinkRenderProps) => ReactNode;
    };

function CardListView(props: CardListViewProps) {
  if (props.variant === "article") {
    const config = CARD_LIST_CONFIG.article;
    return renderCardListView(
      config.definition,
      props.headingId,
      props.renderLink,
      config.createLinkProps,
    );
  }

  const config = CARD_LIST_CONFIG.notice;
  return renderCardListView(
    config.definition,
    props.headingId,
    props.renderLink,
    config.createLinkProps,
  );
}

export function ArticleListView(
  props: Omit<Extract<CardListViewProps, { variant: "article" }>, "variant">,
) {
  return <CardListView variant="article" {...props} />;
}

export function NoticeIndexView(
  props: Omit<Extract<CardListViewProps, { variant: "notice" }>, "variant">,
) {
  return <CardListView variant="notice" {...props} />;
}

export function createArticleListLinkRenderer(
  LinkComponent: (props: {
    to: string;
    "aria-labelledby": string;
    className: string;
    children: ReactNode;
  }) => ReactNode,
): (props: ArticleCardLinkRenderProps) => ReactNode {
  return ({ article, headingId, children }) =>
    LinkComponent({
      to: `/articles/${article.id}`,
      "aria-labelledby": headingId,
      className: articleCardLinkClassName,
      children,
    });
}

export function renderStaticArticleListLink({
  article,
  headingId,
  children,
}: ArticleCardLinkRenderProps) {
  return (
    <a
      href={`/articles/${article.id}`}
      aria-labelledby={headingId}
      className={articleCardLinkClassName}
    >
      {children}
    </a>
  );
}
