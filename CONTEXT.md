# siheom-ts

Data-first frontend test interpreter: tests are data (actions + assertions), executed by a pluggable runtime.

## Language

**시험 (Siheom test)**:
A data description of user interactions and expectations that an interpreter runs against a UI.
_Avoid_: script, scenario (when meaning the executable test data), story (unless Storybook)

**런타임 (Runtime)**:
The environment adapter that mounts UI and drives DOM/user events for a framework (e.g. React, Vue).
_Avoid_: renderer (except React Native Test Renderer as a named runtime), driver

**액션 (Action)**:
A named step in a 시험 (click, fill, …), including user-defined custom actions.
_Avoid_: command, step (when meaning the typed action unit)

**쇼케이스 (Showcase)**:
The set of example UIs and 시험s that prove siheom covers real frontend situations; ships with the docs site.
_Avoid_: demo app, cookbook (when meaning the full required catalog)

**메시지 맵 (Message map)**:
User-replaceable strings for logs and interpreter output. Default locale is English; Korean is built-in (`ko`); other locales are user-supplied extensions.
_Avoid_: i18n bundle, locale file (unless a concrete file format is chosen)

**1.0**:
The complete release that includes installability, factory+types, built-in runtimes for the agreed frameworks, docs+full 쇼케이스, AI skill/rule with quality checks, log 메시지 맵, and vitest/browser path — not a minimal MVP.
_Avoid_: MVP, preview

**1.0 확장 (Post-1.0 extension)**:
Work that builds on 1.0 but is outside this effort: backend siheom, siheom MCP, IME emulation.
_Avoid_: 1.0 scope, out of product

**코어 패키지 (Core package)**:
The framework-agnostic package (`@siheom/core` or equivalent) holding factory, actions, message map, and interpreter — no framework testing-library peers.
_Avoid_: main package (ambiguous with the npm root name)

**런타임 패키지 (Runtime package)**:
A per-framework package (e.g. `@siheom/react`) that supplies that framework's Runtime and peers only that framework's testing libraries.
_Avoid_: adapter package, binding

**Skills 패키지 (Skills package)**:
The installable package of AI skills/rules for writing good 시험s, distributed via a skills registry (pattern to follow from ecosystems like mattpocock/skills).
_Avoid_: prompt pack, agent docs (when meaning the installable skill unit)

**Wrapper**:
The general extension point that wraps mounted UI or test context (providers, scopes, suite-wide defaults). Broader than Provider.
_Avoid_: decorator (except when contrasting Storybook's term), HOC

**Provider**:
A Wrapper that injects app-level context the UI expects (router, query client, theme, …).
_Avoid_: Wrapper (when you mean specifically context injection)

**Global Wrapper**:
A Wrapper applied by default across the suite (Storybook-style global decorator).
_Avoid_: global decorator (prefer this term in our glossary; "decorator" only when relating to Storybook)

**Factory**:
The composition layer that wires a Runtime, action set, message map, and Wrappers into bindings matching the existing siheom surface (`runSiheom`, `actions`, `query`, …). Not a replacement primary API.
_Avoid_: createSiheom-as-new-primary-API, builder

**런타임 계약 (Runtime contract)**:
The shared interface a framework package must satisfy — chiefly render/mount (and unmount); user-event behavior is shared, not reimplemented per framework.
_Avoid_: full framework port, showcase parity
