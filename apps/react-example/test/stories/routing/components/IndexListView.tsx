import type { ReactNode } from "react";
import { PageIntro } from "./AppShell";

export type IndexListLinkRenderProps<TItem> = {
  item: TItem;
  headingId: string;
  children: ReactNode;
};

type IndexListViewProps<TItem extends { id: string }> = {
  headingId: string;
  items: TItem[];
  idPrefix: string;
  pageIntro: {
    eyebrow: string;
    title: string;
    description: string;
  };
  navLabel: string;
  listClassName?: string;
  renderLink: (props: IndexListLinkRenderProps<TItem>) => ReactNode;
  renderCardContent: (item: TItem, cardHeadingId: string) => ReactNode;
};

export function IndexListView<TItem extends { id: string }>({
  headingId,
  items,
  idPrefix,
  pageIntro,
  navLabel,
  listClassName = "grid gap-4",
  renderLink,
  renderCardContent,
}: IndexListViewProps<TItem>) {
  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <PageIntro titleId={headingId} {...pageIntro} />

      <nav aria-label={navLabel}>
        <ul className={listClassName}>
          {items.map((item) => {
            const cardHeadingId = `${idPrefix}-${item.id}-title`;

            return (
              <li key={item.id}>
                {renderLink({
                  item,
                  headingId: cardHeadingId,
                  children: renderCardContent(item, cardHeadingId),
                })}
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
