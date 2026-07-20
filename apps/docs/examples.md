# 예제

`apps/react-example`의 Counter와 SignUpForm이 문서의 기준 예제입니다. shadcn/ui 컴포넌트로 만든 18개의 실전형 시나리오도 있습니다. 각 페이지에 시험 코드, 접근성 스냅샷이나 접근성 포인트를 정리했습니다.

## 기준 예제

- [Counter](/examples/counter) — 단일 버튼, 값 증가, 스냅샷
- [SignUpForm](/examples/signup-form) — 폼 검증, `errormessage`, region 스냅샷
- [라우팅 / 링크](/examples/routing) — MemoryRouter, query string, Link stub, `assertions.href`
- [Countdown](/examples/countdown) — `withFakeTimers`, `effect.elapsed`, `query.timer`
- [헤드리스 UI (react-example)](/guides/headless-components) — Radix / React Aria / Ariakit / Ark UI 구독 dialog 시나리오

## shadcn/ui 예제

실제 제품에서 자주 보는 화면 18개를 `@siheom/react`로 시험합니다. `apps/react-example/test/stories/shadcn`에 있습니다.

| 예제 | 다루는 컴포넌트 |
| --- | --- |
| [Settings](/examples/settings) | Tabs · Switch · Radio Group |
| [Document Actions](/examples/document-actions) | Dropdown Menu · Context Menu |
| [Command Menu](/examples/command-menu) | Command palette (⌘K) |
| [Team Invite](/examples/team-invite) | Select · Combobox |
| [Notice Search](/examples/notice-search) | Search · Empty |
| [View Switcher](/examples/view-switcher) | Toggle Group |
| [Task Table](/examples/task-table) | Data Table · Pagination · Badge |
| [Order Tracking](/examples/order-tracking) | Timeline (Card 조합) |
| [Meeting Booking](/examples/meeting-booking) | Calendar · Date Picker |
| [Save Feedback](/examples/save-feedback) | Sonner toast |
| [Mobile Filter](/examples/mobile-filter) | Sheet |
| [Billing Alert](/examples/billing-alert) | Alert |
| [Profile Avatar](/examples/profile-avatar) | Upload · Avatar · Progress |
| [Two Factor](/examples/two-factor) | Input OTP |
| [App Shell](/examples/app-shell) | Sidebar · Breadcrumb |
| [Kanban](/examples/kanban) | 드래그 앤 드롭 |
| [Chart Dashboard](/examples/chart-dashboard) | Chart · Card · Tabs |
| [LLM Chat](/examples/llm-chat) | 스트리밍 응답 · fake LLM API |

Storybook으로 UI를 눈으로 확인하려면 레포에서 `bun run storybook`을 실행하세요.

## 다음 단계

- [React 빠른 시작](/getting-started/react) — browser mode 설정
- [접근성 스냅샷](/concepts/a11y-snapshot) — 스냅샷 형식 이해
- [effect · withFakeTimers](/concepts/effects) — 타이머 UI 시험
