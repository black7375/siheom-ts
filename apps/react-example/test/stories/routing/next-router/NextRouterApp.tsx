import { Accordion } from "../components/Accordion";
import { AppShell, PageIntro } from "../components/AppShell";
import { NoticeIndexView } from "../components/NoticeIndexView";
import {
  FakeNextRouterProvider,
  Link,
  usePathname,
  useSearchParams,
} from "../fake-next-router/FakeNextRouter";
import { noticeCardLinkClassName } from "../shared/linkStyles";
import { NOTICES } from "../shared/notices";

function NoticePage() {
  const searchParams = useSearchParams();
  const openId = searchParams.get("id");

  return (
    <AppShell activeNav="notices">
      <section aria-labelledby="notice-heading" className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <PageIntro
          titleId="notice-heading"
          eyebrow="Support"
          title="공지사항"
          description="외부 링크나 목록에서 query string id 로 진입하면 해당 Accordion이 열린 상태로 표시됩니다."
        />
        <Accordion items={NOTICES} openId={openId} />
      </section>
    </AppShell>
  );
}

function NoticeIndexPage() {
  return (
    <AppShell activeNav="notices">
      <NoticeIndexView
        renderLink={({ notice, headingId, children }) => (
          <Link
            href={`/notice?id=${notice.id}`}
            aria-labelledby={headingId}
            className={noticeCardLinkClassName}
          >
            {children}
          </Link>
        )}
      />
    </AppShell>
  );
}

function NextRouterRoutes() {
  const pathname = usePathname();

  if (pathname === "/notice") {
    return <NoticePage />;
  }

  return <NoticeIndexPage />;
}

export function NextRouterApp({ initialPath = "/" }: { initialPath?: string }) {
  return (
    <FakeNextRouterProvider initialPath={initialPath}>
      <NextRouterRoutes />
    </FakeNextRouterProvider>
  );
}
