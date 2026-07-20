# Meeting Booking — Calendar + Date Picker

Popover 안에 열리는 Calendar에서 날짜를 골라 트리거 버튼에 반영하고, 예약을 확정하는 폼입니다. `query.within`으로 달력 영역 안의 날짜 버튼만 지정합니다.

소스: `apps/react-example/test/stories/shadcn/meeting-booking/MeetingBookingForm.tsx`, `MeetingBookingForm.test.tsx`.

## UI

- 날짜 선택 트리거: role `button`, name `"미팅 날짜"` (초기 텍스트는 `"날짜 선택"`, 선택 후 `"2024년 3월 15일"`처럼 바뀜)
- 달력: role `region`, name `"미팅 날짜 달력"`; 날짜 버튼은 `button`, name은 포맷된 날짜(`"2024년 3월 15일"`)
- 예약 버튼: role `button`, name `"예약하기"`
- 결과: role `status`, name `"예약 결과"`

## 시험: 달력 열기

```tsx
await runSiheom(
  given.render(<MeetingBookingForm />),
  actions.click(query.button("미팅 날짜")),
  assertions.visible(query.region("미팅 날짜 달력")),
);
```

## 시험: 날짜를 선택하고 예약

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

달력 안에는 다른 달의 날짜나 오늘 날짜 등 이름이 겹칠 수 있는 버튼이 많습니다. `query.within(region, button)`으로 "미팅 날짜 달력" 영역 안에서만 찾도록 좁혀, 우연히 같은 텍스트를 가진 다른 버튼을 클릭하지 않게 합니다.

## 접근성 포인트

- 날짜 트리거는 선택 전/후 텍스트가 바뀌는 하나의 `button`입니다. `assertions.textContent`로 "선택한 날짜가 트리거에 그대로 반영됐는지"를 검증해, Popover가 닫힌 뒤에도 상태가 유지되는지 확인합니다.
- 각 날짜 셀은 `CalendarDayButton`에 `aria-label`로 사람이 읽을 수 있는 전체 날짜(`"2024년 3월 15일"`)를 달아, 숫자만 보이는 셀이라도 스크린 리더가 연·월까지 함께 읽어 줍니다.

## 다음 단계

- [save-feedback](/examples/save-feedback) — Sonner 토스트로 결과 알리기
- [locator](/concepts/locator) — `query.within`으로 범위 좁히기
- [actions API](/configuration/actions) — click
