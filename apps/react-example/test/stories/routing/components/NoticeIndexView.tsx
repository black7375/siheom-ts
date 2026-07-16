import type { ReactNode } from "react";
import { NOTICES, type Notice } from "../shared/notices";
import { PageIntro } from "./AppShell";

export type NoticeCardLinkRenderProps = {
  notice: Notice;
  headingId: string;
  children: ReactNode;
};

export function NoticeIndexView({
  headingId = "notice-index-heading",
  renderLink,
}: {
  headingId?: string;
  renderLink: (props: NoticeCardLinkRenderProps) => ReactNode;
}) {
  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <PageIntro
        titleId={headingId}
        eyebrow="Notices"
        title="공지 목록"
        description="카드 전체가 링크이며, 접근 가능한 이름은 카드 안 제목(h2)에서 가져옵니다."
      />

      <nav aria-label="공지 바로가기">
        <ul className="grid gap-3">
          {NOTICES.map((notice) => {
            const cardHeadingId = `notice-${notice.id}-title`;

            return (
              <li key={notice.id}>
                {renderLink({
                  notice,
                  headingId: cardHeadingId,
                  children: (
                    <>
                      <p aria-hidden="true" className="mb-2 text-xs text-muted-foreground">
                        {notice.publishedAt}
                      </p>
                      <h2 id={cardHeadingId} className="text-lg font-semibold">
                        {notice.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {notice.summary}
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
