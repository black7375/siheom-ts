# Examples

Counter and SignUpForm in `apps/react-example` are the canonical examples. There are also 18 realistic scenarios built with shadcn/ui components. Each page includes test code plus accessibility snapshots or notes.

## Canonical examples

- [Counter](/en/examples/counter) — Single button, increment, snapshots
- [SignUpForm](/en/examples/signup-form) — Form validation, `errormessage`, region snapshots
- [Routing / links](/en/examples/routing) — MemoryRouter, query strings, Link stub, `assertions.href`
- [Countdown](/en/examples/countdown) — `withFakeTimers`, `effect.elapsed`, `query.timer`
- [Headless UI (react-example)](/en/guides/headless-components) — Radix / React Aria / Ariakit / Ark UI subscribe dialog specs

## shadcn/ui examples

18 screens you'd commonly see in a real product, tested with `@siheom/react`. Found under `apps/react-example/test/stories/shadcn`.

| Example | Components covered |
| --- | --- |
| [Settings](/en/examples/settings) | Tabs · Switch · Radio Group |
| [Document Actions](/en/examples/document-actions) | Dropdown Menu · Context Menu |
| [Command Menu](/en/examples/command-menu) | Command palette (⌘K) |
| [Team Invite](/en/examples/team-invite) | Select · Combobox |
| [Notice Search](/en/examples/notice-search) | Search · Empty |
| [View Switcher](/en/examples/view-switcher) | Toggle Group |
| [Task Table](/en/examples/task-table) | Data Table · Pagination · Badge |
| [Order Tracking](/en/examples/order-tracking) | Timeline (Card composition) |
| [Meeting Booking](/en/examples/meeting-booking) | Calendar · Date Picker |
| [Save Feedback](/en/examples/save-feedback) | Sonner toast |
| [Mobile Filter](/en/examples/mobile-filter) | Sheet |
| [Billing Alert](/en/examples/billing-alert) | Alert |
| [Profile Avatar](/en/examples/profile-avatar) | Upload · Avatar · Progress |
| [Two Factor](/en/examples/two-factor) | Input OTP |
| [App Shell](/en/examples/app-shell) | Sidebar · Breadcrumb |
| [Kanban](/en/examples/kanban) | Drag and drop |
| [Chart Dashboard](/en/examples/chart-dashboard) | Chart · Card · Tabs |
| [LLM Chat](/en/examples/llm-chat) | Streaming replies · fake LLM API |

Run `bun run storybook` in the repo to inspect UI visually.

## Next steps

- [React quick start](/en/getting-started/react) — Browser mode setup
- [Accessibility snapshot](/en/concepts/a11y-snapshot) — Snapshot format
- [effect · withFakeTimers](/en/concepts/effects) — Testing timer UI
