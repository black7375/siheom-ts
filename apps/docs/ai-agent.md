# AI 에이전트

siheom 시험은 스텝 객체와 접근성 스냅샷으로 이루어져, AI 에이전트가 실패를 읽고 수정안을 제안하기에 적합한 형태입니다.

## llms.txt

문서 사이트의 [`/llms.txt`](/llms.txt)에 API 요약, factory, locator, **헤드리스 UI 주의사항**, 실패 리포트 형식이 정리되어 있습니다. 에이전트 컨텍스트에 이 URL을 넣거나 파일 내용을 붙여 넣으세요.

헤드리스 UI(Radix, React Aria, Ariakit, Ark UI)로 폼·Select·Dialog를 테스트할 때는 [헤드리스 UI 가이드](/guides/headless-components)와 레포 Skills [`HEADLESS.md`](https://github.com/twinstae/siheom-ts/blob/main/.claude/skills/siheom-frontend-test/HEADLESS.md)를 함께 제공하세요.

레포 루트 [`CONTEXT.md`](https://github.com/twinstae/siheom-ts/blob/main/CONTEXT.md)에는 **시험**, **런타임**, **factory**, **메시지 맵** 등 glossary가 있습니다. siheom 관련 용어는 이 파일과 맞춥니다.

## Skills 설치

siheom 1.0에는 시험 작성 품질을 돕는 **Skills 패키지**가 포함됩니다. [mattpocock/skills](https://github.com/mattpocock/skills)와 같은 skills registry 패턴으로 배포합니다.

패키지가 공개되면 다음과 같은 형태로 설치합니다.

```bash
npx skills add twinstae/siheom-ts
```

설치 후 에이전트는 다음을 따릅니다.

- 시험 본문에 `await`를 쓰지 않고 `return runSiheom(...)` 사용
- locator는 `query.<role>(name)`만 사용 (CSS·test id 금지)
- 타이머 UI는 `withFakeTimers` + `effect.elapsed` + `query.timer` / `textContent` (전역 `vi.useFakeTimers` 금지)
- 실패 시 `[Logs]` / `[A11y Snapshot]` 섹션을 우선 읽기
- 헤드리스 UI: snapshot role에 맞는 query (`query.label` vs `query.combobox`); 키보드 우회 금지 — [가이드](/guides/headless-components)
- 커스텀 조작은 `extendSiheom`으로 레지스트리에 추가
- `overrideSiheom`으로 render를 감쌀 때 `effects`·`fakeTimerScope`를 base에 유지

공개 전까지는 `llms.txt`와 [siheom이란](/intro), [React 빠른 시작](/getting-started/react)을 컨텍스트로 제공하세요.

## 에이전트에게 유리한 siheom 특성

- **데이터 스텝**: 수정할 스텝을 배열에서 pinpoint하기 쉽습니다.
- **접근성 스냅샷**: HTML 전체 대신 role·name·state만 전달되어 토큰 비용이 낮습니다.
- **구조화된 실패 리포트**: 어느 action까지 성공했는지 로그로 확인합니다.

## 다음 단계

- [헤드리스 UI 가이드](/guides/headless-components) — Select query, dialog+form, 라이브러리별 주의
- [접근성 스냅샷](/concepts/a11y-snapshot) — 스냅샷 형식
- [예제: Countdown](/examples/countdown) — withFakeTimers와 effect.elapsed
- [예제: SignUpForm](/examples/signup-form) — errormessage와 region 스냅샷
- [Factory](/concepts/factory) — 커스텀 스텝
