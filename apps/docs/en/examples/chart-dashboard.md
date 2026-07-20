# Chart Dashboard — Chart + Card + Tabs

A dashboard that switches between revenue and visitor charts via tabs. Even for a chart drawn with a visualization library like `recharts`, this shows that testing the summary text and container landmarks below the chart is enough for a meaningful check.

Source: `apps/react-example/test/stories/shadcn/chart-dashboard/ChartDashboard.tsx`, `ChartDashboard.test.tsx`.

## UI

- Tabs: role `tab`, name `"매출"` (Revenue) / `"방문자"` (Visitors)
- Revenue chart section: role `region`, name `"매출 차트"`; summary: role `status`, name `"총 매출"`
- Visitor chart section: role `region`, name `"방문자 차트"`; summary: role `status`, name `"총 방문자"`

## Test: chart and summary change with the tab

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

## Accessibility notes

- The `BarChart` has `accessibilityLayer` turned on, so the chart itself gets keyboard focus and basic screen reader support. This test doesn't inspect individual bars inside the SVG, though — a single number, "total revenue" (`role="status"`), conveys the same conclusion the chart shows visually, as text. Providing a text summary of what a chart communicates lets you write a stable test that doesn't depend on chart rendering details.
- Confirming the two chart `region`s are never visible at the same time (`assertions.not.visible`) verifies that switching tabs fully unmounts the previous tab's chart rather than leaving it lingering.

## Next steps

- [settings](/en/examples/settings) — Same Tabs pattern
- [assertions API](/en/configuration/assertions) — selected · textContent
- [locator](/en/concepts/locator) — tab · region · status
