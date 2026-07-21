# Notice Search — Search + Empty

Typing a search term filters a list; no matches show an empty state. Pairing `assertions.visible` with `assertions.not.visible` confirms "has results" and "no results" are mutually exclusive.

Source: [`apps/react-example/test/stories/shadcn/notice-search/NoticeSearch.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/notice-search/NoticeSearch.tsx), [`NoticeSearch.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/notice-search/NoticeSearch.test.tsx).

## UI accessibility

Initial accessibility snapshot fixed by the test.

<<< @/_snaps/notice-search-initial.snap{text}

## Test: no-results state

```tsx
await runSiheom(
  given.render(<NoticeSearch />),
  actions.fill(query.textbox("공지 검색"), "휴가"),
  assertions.visible(query.region("검색 결과 없음")),
);
```

## Test: matching notices show up

```tsx
await runSiheom(
  given.render(<NoticeSearch />),
  actions.fill(query.textbox("공지 검색"), "점검"),
  assertions.visible(query.listitem("서버 점검 안내")),
  assertions.not.visible(query.region("검색 결과 없음")),
);
```

That last assertion in the second test matters. Checking only "the notice is visible" would miss a bug where the empty state stays rendered alongside real results (e.g. a broken `showEmpty` condition).

## Accessibility notes

- The empty state is wrapped in its own `<section aria-label="검색 결과 없음">`, turning "no results" into a landmark of its own. Since the result list and empty state never coexist, `assertions.not.visible` pins that exclusivity in the test.
- The empty state doesn't show for an empty search box (`query.trim().length > 0` guard). Distinguishing "haven't searched yet" from "searched and found nothing" matters for the real user experience too.

## Next steps

- [view-switcher](/en/examples/view-switcher) — Switching views with Toggle Group
- [assertions API](/en/configuration/assertions) — visible · not.visible
- [locator](/en/concepts/locator) — region · listitem
