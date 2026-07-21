# Chart Dashboard — Chart + Card + Tabs

탭으로 매출/방문자 차트를 전환하는 대시보드입니다. `recharts` 같은 시각화 라이브러리 위에 그려진 차트라도, 시험은 차트 아래의 요약 텍스트와 컨테이너 landmark만으로 충분히 의미 있는 검증을 할 수 있다는 것을 보여줍니다.

소스: [`apps/react-example/test/stories/shadcn/chart-dashboard/ChartDashboard.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/chart-dashboard/ChartDashboard.tsx), [`ChartDashboard.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/chart-dashboard/ChartDashboard.test.tsx).

## UI

- 탭: role `tab`, name `"매출"` / `"방문자"`
- 매출 차트 영역: role `region`, name `"매출 차트"`; 요약: role `status`, name `"총 매출"`
- 방문자 차트 영역: role `region`, name `"방문자 차트"`; 요약: role `status`, name `"총 방문자"`

## 시험: 탭 전환에 따라 차트와 요약이 바뀐다

```tsx
await runSiheom(
  given.render(<ChartDashboard />),
  assertions.selected(query.tab("매출")),
  assertions.visible(query.region("매출 차트")),
  assertions.textContent(query.status("총 매출"), "₩1,200,000"),
  actions.click(query.tab("방문자")),
  assertions.selected(query.tab("방문자")),
  assertions.visible(query.region("방문자 차트")),
  assertions.not.visible(query.region("매출 차트")),
  assertions.textContent(query.status("총 방문자"), "48,200"),
);
```

## 접근성 포인트

- `BarChart`에는 `accessibilityLayer`가 켜져 있어, 차트 자체도 키보드 포커스와 기본적인 스크린 리더 지원을 받습니다. 하지만 이 시험은 SVG 안의 개별 막대를 검사하지 않습니다 — "총 매출"이라는 숫자 하나(`role="status"`)가 차트가 보여주는 결론을 텍스트로 대신 전달하기 때문입니다. 시각적 차트가 전달하는 정보를 텍스트 요약으로도 제공하면, 차트의 렌더링 디테일에 의존하지 않는 안정적인 시험을 쓸 수 있습니다.
- 두 차트 `region`이 동시에 보이지 않는다는 것(`assertions.not.visible`)을 확인해, 탭이 전환될 때 이전 탭의 차트가 완전히 언마운트되는지(메모리에 남아 있지 않은지) 검증합니다.

## 다음 단계

- [settings](/examples/settings) — 같은 Tabs 패턴
- [assertions API](/configuration/assertions) — selected · textContent
- [locator](/concepts/locator) — tab · region · status
