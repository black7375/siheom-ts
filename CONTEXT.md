# siheom-ts

Data-first frontend test interpreter: tests are data (actions + assertions + effects), executed by a pluggable runtime.

## Language

**시험 (Siheom test)**:
A data description of user interactions and expectations that an interpreter runs against a UI.
_Avoid_: script, scenario (when meaning the executable test data), story (unless Storybook)

**런타임 (Runtime)**:
A framework-specific way of mounting UI for 시험s — expressed by supplying `given` (especially `given.render`), not a separate Runtime type/object.
_Avoid_: renderer (except React Native Test Renderer as a named runtime), driver, Runtime interface

**액션 (Action)**:
A named step in a 시험 (click, fill, …), including user-defined custom actions.
_Avoid_: command, step (when meaning the typed action unit)

**이펙트 (Effect)**:
A named step that advances the test environment (especially time: `effect.elapsed`, `effect.runAllTimers`), not a direct user gesture. Used inside `withFakeTimers`.
_Avoid_: action (when meaning time travel), wait helper, sleep

**withFakeTimers**:
A scope step that installs Vitest fake timers for nested steps only, then restores real timers. Not a global `vi.useFakeTimers()` flag.
_Avoid_: global fake-timer mode, suite-wide timer mock

**fakeTimerScope**:
Optional registry hooks (`installFakeTimers`, `afterAction`, …) so a runtime package (e.g. `@siheom/react`) can adapt fake timers (`act`, `shouldAdvanceTime`) without global module state.
_Avoid_: userEventSession, isFakeTimersActive global

**쇼케이스 (Showcase)**:
The set of example UIs and 시험s that prove siheom covers real frontend situations; ships with the docs site.
_Avoid_: demo app, cookbook (when meaning the full required catalog)

**메시지 맵 (Message map)**:
Optional labels for the failure-report section headers only (`logs`, `originalErrorMessage`, `a11ySnapshot`). Action/assertion step `log` strings are not locale-translated in 1.0.
_Avoid_: i18n bundle, locale file, en/ko action-log catalog

**1.0**:
The complete release that includes installability, factory+types, built-in runtimes for the agreed frameworks, docs+full 쇼케이스, AI skill/rule with quality checks, failure-report 메시지 맵 (section headers only), and vitest/browser path — not a minimal MVP.
_Avoid_: MVP, preview

**1.0 확장 (Post-1.0 extension)**:
Work that builds on 1.0 but is outside this effort: backend siheom, siheom MCP, IME emulation, full action/assertion log locale catalogs (en/ko/user locales).
_Avoid_: 1.0 scope, out of product

**코어 패키지 (Core package)**:
The framework-agnostic package (`@siheom/core` or equivalent) holding factory, actions, message map, and interpreter — no framework testing-library peers.
_Avoid_: main package (ambiguous with the npm root name)

**런타임 패키지 (Runtime package)**:
A per-framework package (e.g. `@siheom/react`) that supplies that framework's default `given` (at least `render`), peers for that framework's testing libraries, and a pre-bound `runSiheom` / `actions` / `query` / `assertions` / `given` / `effect` / `withFakeTimers` surface (plus `reactEffects` / `reactFakeTimerScope` when needed for `overrideSiheom`).
_Avoid_: adapter package, binding

**Skills 패키지 (Skills package)**:
The installable package of AI skills/rules for writing good 시험s, distributed via a skills registry (pattern to follow from ecosystems like mattpocock/skills).
_Avoid_: prompt pack, agent docs (when meaning the installable skill unit)

**Wrapper**:
A documentation/glossary idea for wrapping mounted UI or test context (providers, scopes). Not a 1.0 first-class API — achieved by extending `given` (e.g. a custom `render` that wraps Providers).
_Avoid_: decorator (except when contrasting Storybook's term), HOC, factory `wrappers` option

**Provider**:
App-level context the UI expects (router, query client, theme, …), typically wrapped inside an extended `given.render`. Not a separate siheom API.
_Avoid_: Wrapper API, Global Wrapper API

**Global Wrapper**:
Suite-wide default wrapping (Storybook-style global decorator) as a *pattern* via shared extended `given`, not a registered global-wrapper list in 1.0.
_Avoid_: global decorator (as our API name), `globalWrappers` factory option

**Factory**:
Core composition via `extendSiheom` (add new action/assertion/given/effect/message-map entries) and `overrideSiheom` (replace existing entries). Input is registries (including optional `fakeTimerScope`); output is the existing bindings surface (`runSiheom`, `actions`, `query`, `assertions`, `given`, `effect`). Not the primary consumer entry — `@siheom/react` pre-bound imports remain default.
_Avoid_: createSiheom-as-new-primary-API, builder, partial-merge-only extend

**Extend**:
Add new specs and implementations to registries (new keys only). Lives in `@siheom/core` as `extendSiheom`.
_Avoid_: override (when you mean add), partial replace

**Override**:
Replace implementations for existing registry keys. Lives in `@siheom/core` as `overrideSiheom`, separate from Extend.
_Avoid_: extend (when you mean replace)

**런타임 계약 (Runtime contract)**:
What a framework package must provide: a `given` registry with an explicit `render` (and any other givens it needs). No separate Runtime interface; user-event stays shared in core/actions.
_Avoid_: full framework port, showcase parity, Runtime type
