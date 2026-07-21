# Notice Search — Search + Empty

검색어를 입력하면 목록이 필터링되고, 일치하는 결과가 없으면 Empty 상태가 나타나는 예제입니다. `assertions.visible`과 `assertions.not.visible`을 짝지어 "결과 있음"과 "결과 없음"이 서로 배타적임을 확인합니다.

소스: [`apps/react-example/test/stories/shadcn/notice-search/NoticeSearch.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/notice-search/NoticeSearch.tsx), [`NoticeSearch.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/notice-search/NoticeSearch.test.tsx).

## UI 접근성

시험이 고정한 초기 접근성 스냅샷입니다.

<<< @/_snaps/notice-search-initial.snap{text}

## 시험: 결과 없음 안내

```tsx
await runSiheom(
  given.render(<NoticeSearch />),
  actions.fill(query.textbox("공지 검색"), "휴가"),
  assertions.visible(query.region("검색 결과 없음")),
);
```

## 시험: 검색어에 맞는 공지

```tsx
await runSiheom(
  given.render(<NoticeSearch />),
  actions.fill(query.textbox("공지 검색"), "점검"),
  assertions.visible(query.listitem("서버 점검 안내")),
  assertions.not.visible(query.region("검색 결과 없음")),
);
```

두 번째 시험의 마지막 assertion이 중요합니다. "공지가 보인다"만 확인하면 Empty 상태가 동시에 남아 있는 버그(예: `showEmpty` 조건이 잘못돼 결과와 안내가 함께 렌더링되는 경우)를 놓칠 수 있습니다.

## 접근성 포인트

- Empty 상태는 별도의 `<section aria-label="검색 결과 없음">`으로 감싸, "결과가 없다"는 상태 자체가 하나의 랜드마크가 됩니다. 결과 목록과 Empty 상태는 동시에 존재하지 않으므로 `assertions.not.visible`로 상호 배타성을 시험에 남길 수 있습니다.
- 검색 입력은 빈 문자열일 때 Empty 상태를 보여주지 않습니다(`query.trim().length > 0` 조건). 초기 상태와 "검색했지만 없음" 상태를 구분하는 것도 실제 사용자 경험에서 중요합니다.

## 다음 단계

- [view-switcher](/examples/view-switcher) — Toggle Group으로 뷰 전환
- [assertions API](/configuration/assertions) — visible · not.visible
- [locator](/concepts/locator) — region · listitem
