# shadcn UI examples

Realistic scenarios for Siheom + shadcn/ui. One user story per folder; TDD via this plan.

## Done (elsewhere in react-example)

- [x] Counter — render, click
- [x] SignUpForm — fill, errormessage, checkbox
- [x] DeleteDialog — alertdialog, within
- [x] Routing — link, aria-current, provider
- [x] Relations — section, region, aria relations
- [x] Countdown — effect.elapsed, timer
- [x] Accordion — expanded (NoticeAccordion in routing)
- [x] Checkbox — SignUpForm, TodoMVC

## Phase 1 — Navigation & overlay

- [x] settings — Tabs + Switch + Radio Group
  - [x] initial — general tab selected
  - [x] tab switch — notifications tab
  - [x] switch — dark mode toggle
  - [x] radio — notification frequency
- [x] document-actions — Dropdown Menu + Context Menu
  - [x] dropdown — copy via 더보기 menu
  - [x] context menu — delete via right click
- [x] command-menu — Command palette (Cmd+K)
  - [x] open — dialog from 빠른 실행 button
  - [x] select — run command and close dialog

## Phase 2 — Selection & search

- [x] team-invite — Select + Combobox
  - [x] select role — 멤버 / 관리자
  - [x] combobox search — filter and pick team member
  - [x] submit — invite confirmation status
- [x] notice-search — Search + Empty
- [x] view-switcher — Toggle Group

## Phase 3 — Data

- [x] task-table — Data Table + Pagination + Badge
  - [x] initial — first page tasks visible
  - [x] pagination — next page
  - [x] badge — task status labels
- [x] order-tracking — Timeline (Card composition)
  - [x] initial — delivery timeline steps visible
  - [x] current — active step marked with aria-current
  - [x] order card — order summary in card header

## Phase 4 — Date

- [x] meeting-booking — Calendar + Date Picker
  - [x] open — calendar from date picker trigger
  - [x] select — chosen date reflected in trigger
  - [x] confirm — booking confirmation status

## Phase 5 — Feedback & mobile

- [x] save-feedback — Sonner toast
- [x] mobile-filter — Sheet
- [x] billing-alert — Alert

## Phase 6 — Forms & upload

- [x] profile-avatar — upload + Avatar + Progress
- [x] two-factor — Input OTP

## Phase 7 — Composite

- [x] app-shell — Sidebar + Breadcrumb

## Phase 8 — Kanban

- [x] kanban — drag-drop
  - [x] drag card — move card from 진행 중 to 완료 column

## Phase 9 — Chart

- [x] chart-dashboard — Chart + Card + Tabs
  - [x] tab switch — 매출/방문자 차트 전환

## Phase 10 — LLM chat

- [x] llm-chat — streaming chat + fake LLM API
  - [x] stream — partial chunks accumulate in assistant status

## Deferred

_(none)_
