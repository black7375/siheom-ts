import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell, PageIntro } from "../components/AppShell";
import { ArticleDetailView } from "../components/ArticleDetailView";
import { ArticleListShell } from "../components/ArticleListShell";
import {
  createArticleListLinkRenderer,
  renderStaticArticleListLink,
} from "../components/indexListViews";
import { ARTICLES, getArticle } from "../shared/articles";
import { linkClassName } from "../shared/linkStyles";

export function ArticleList() {
  return <ArticleListShell renderLink={renderStaticArticleListLink} />;
}

function ArticleListPage() {
  return <ArticleListShell renderLink={createArticleListLinkRenderer(Link)} />;
}

function ArticleDetailPage() {
  const { articleId = "1" } = useParams();
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
}

export function TermsPage() {
  const location = useLocation();
  const section = location.hash.replace("#", "") || "intro";

  return (
    <AppShell activeNav="terms">
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <PageIntro
          titleId="terms-page-heading"
          eyebrow="Legal"
          title="이용약관"
          description="해시 링크로 같은 페이지 안에서 서명 섹션으로 이동하는 예제입니다."
        />

        <nav aria-label="약관 목차" className="rounded-xl border bg-card p-4">
          <p className="mb-3 text-sm font-medium">목차</p>
          <ul className="flex flex-wrap gap-3 text-sm">
            <li>
              <Link to="#intro" className={linkClassName}>
                소개
              </Link>
            </li>
            <li>
              <Link to="#sign" className={linkClassName}>
                서명 섹션으로
              </Link>
            </li>
          </ul>
        </nav>

        {section === "intro" ? (
          <section aria-labelledby="terms-intro-heading" className="rounded-xl border bg-card p-6">
            <h1 id="terms-intro-heading" className="text-xl font-semibold">
              이용약관
            </h1>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <p>
                서비스 이용에 관한 기본 약관입니다. Storybook에서도 MemoryRouter가 hash 변경을
                처리합니다.
              </p>
              <p>아래 링크를 누르면 서명 섹션만 보이도록 전환됩니다.</p>
            </div>
          </section>
        ) : null}

        {section === "sign" ? (
          <section
            id="sign"
            aria-labelledby="terms-sign-heading"
            className="rounded-xl border bg-card p-6"
          >
            <h1 id="terms-sign-heading" className="text-xl font-semibold">
              서명
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              약관에 동의하면 아래 서명란에 이름을 적어주세요.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="signer-name">이름</Label>
                <Input id="signer-name" placeholder="홍길동" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sign-date">날짜</Label>
                <Input id="sign-date" defaultValue="2026-07-16" />
              </div>
            </div>
          </section>
        ) : null}
      </article>
    </AppShell>
  );
}

export function LoginPage({ login }: { login: () => Promise<void> }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <AppShell activeNav="login">
      <section aria-labelledby="login-heading" className="mx-auto max-w-md space-y-6 px-4 py-8">
        <PageIntro
          titleId="login-heading"
          eyebrow="Account"
          title="로그인"
          description="API 호출이 끝난 뒤 /dashboard 로 push 되는 흐름을 Storybook과 시험에서 동일하게 확인합니다."
        />

        <form
          className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="login-email">이메일</Label>
            <Input id="login-email" type="email" defaultValue="demo@siheom.dev" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">비밀번호</Label>
            <Input id="login-password" type="password" defaultValue="password123" />
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await login();
              navigate("/dashboard");
            }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </section>
    </AppShell>
  );
}

export function DashboardPage() {
  return (
    <AppShell activeNav="login">
      <section
        aria-labelledby="dashboard-heading"
        className="mx-auto max-w-3xl space-y-6 px-4 py-8"
      >
        <PageIntro
          titleId="dashboard-heading"
          eyebrow="Workspace"
          title="대시보드"
          description="로그인에 성공했습니다. 최근 활동과 바로가기를 확인하세요."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "작성한 글", value: "12" },
            { label: "읽지 않은 공지", value: "2" },
            { label: "북마크", value: "5" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

export function ReactRouterApp({
  initialEntries = ["/"],
  login = async () => {},
}: {
  initialEntries?: string[];
  login?: () => Promise<void>;
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<ArticleListPage />} />
        <Route path="/articles/:articleId" element={<ArticleDetailPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage login={login} />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </MemoryRouter>
  );
}
