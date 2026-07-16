export type Article = {
  id: string;
  headline: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  body: string;
};

export const ARTICLES: Article[] = [
  {
    id: "1",
    headline: "정적 링크로 목록 페이지를 검증하는 방법",
    excerpt:
      "라우터 없이도 href와 접근 가능한 링크 이름으로 내비게이션 의도를 테스트할 수 있습니다.",
    category: "테스트 가이드",
    publishedAt: "2026-07-10",
    body: "목록 페이지는 아직 서버에서 HTML을 내려주거나, 클라이언트 라우터 초기화 전 상태일 수 있습니다. 이때는 MemoryRouter 대신 링크의 href와 role=link 이름만으로도 충분한 회귀 테스트가 됩니다.",
  },
  {
    id: "2",
    headline: "해시 네비게이션과 in-page 섹션 전환",
    excerpt:
      "약관처럼 한 페이지 안에서 #sign 섹션으로 이동할 때는 hash 변경 후 region 가시성을 확인합니다.",
    category: "라우팅",
    publishedAt: "2026-07-12",
    body: "해시 링크는 전체 페이지를 다시 불러오지 않고 특정 섹션으로 스크롤하거나, SPA에서는 조건부 렌더링으로 섹션을 전환합니다. 시험에서는 aria-labelledby로 연결된 제목 region이 보이는지 확인합니다.",
  },
  {
    id: "3",
    headline: "API 이후 programmatic navigation",
    excerpt:
      "로그인처럼 비동기 작업이 끝난 뒤 push 되는 경로는 memory router와 waitFor assertion으로 검증합니다.",
    category: "라우팅",
    publishedAt: "2026-07-14",
    body: "버튼 클릭 → 로딩 상태 → navigate('/dashboard') 흐름은 사용자에게 실제 앱과 같은 피드백을 줍니다. 시험은 로딩 버튼과 도착 페이지 region을 순서대로 assert합니다.",
  },
];

export function getArticle(id: string) {
  return ARTICLES.find((article) => article.id === id);
}
