# Meeting Booking — Calendar + Date Picker

A form where picking a date from a Calendar inside a Popover updates the trigger button before confirming a booking. `query.within` scopes date buttons to inside the calendar region.

Source: [`apps/react-example/test/stories/shadcn/meeting-booking/MeetingBookingForm.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/meeting-booking/MeetingBookingForm.tsx), [`MeetingBookingForm.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/meeting-booking/MeetingBookingForm.test.tsx).

## UI accessibility

Initial accessibility snapshot fixed by the test.

<<< @/_snaps/meeting-booking-initial.snap{text}

## Test: opening the calendar

```tsx
await runSiheom(
  given.render(<MeetingBookingForm />),
  actions.click(query.button("미팅 날짜")),
  assertions.visible(query.region("미팅 날짜 달력")),
);
```

## Test: pick a date and book

```tsx
await runSiheom(
  given.render(<MeetingBookingForm />),
  actions.click(query.button("미팅 날짜")),
  actions.click(
    query.within(query.region("미팅 날짜 달력"), query.button("2024년 3월 15일")),
  ),
  assertions.textContent(query.button("미팅 날짜"), "2024년 3월 15일"),
  actions.click(query.button("예약하기")),
  assertions.textContent(query.status("예약 결과"), "2024년 3월 15일 미팅 예약됨"),
);
```

A calendar has plenty of buttons whose names can collide — days from adjacent months, "today," and so on. `query.within(region, button)` scopes the search to inside "미팅 날짜 달력" only, so the test can't accidentally click a different button that happens to share the same text.

## Accessibility notes

- The date trigger is a single `button` whose text changes before and after selection. `assertions.textContent` verifies the picked date sticks to the trigger even after the popover closes.
- Each day cell attaches a human-readable full date (`"2024년 3월 15일"`) via `CalendarDayButton`'s `aria-label`, so a screen reader announces the year and month even for a cell that visually shows just a number.

## Next steps

- [save-feedback](/en/examples/save-feedback) — Announcing results with a Sonner toast
- [locator](/en/concepts/locator) — Scoping with `query.within`
- [actions API](/en/configuration/actions) — click
