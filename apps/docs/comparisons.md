# 비교

siheom은 Testing Library와 Playwright에 익숙한 팀을 위한 도구입니다. Testing Library 위에서 동작하고, Playwright Test와는 locator 철학이 비슷하지만 시험을 **데이터**로 쓰며 `await`를 금지합니다.

## Testing Library 단독 사용과 비교

같은 테스트를 Testing Library 명령형 코드로 쓰면 스텝마다 `await`와 쿼리가 반복됩니다. siheom은 같은 role·name 정보를 `query`로 쓰되, 실행과 실패 리포트는 인터프리터에 맡깁니다.

Testing Library:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Counter } from "./Counter";

it("값을 증가시킬 수 있다", async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole("button", { name: "0" }));
  await user.click(screen.getByRole("button", { name: "1" }));
  expect(await screen.findByRole("button", { name: "2" })).toBeInTheDocument();
});
```

siheom:

```tsx
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { Counter } from "./Counter";

it("값을 증가시킬 수 있다", () => {
  return runSiheom(
    given.render(<Counter />),
    actions.click(query.button("0")),
    actions.click(query.button("1")),
    assertions.visible(query.button("2")),
  );
});
```

차이:

- **await 없음**: 시험 본문에 `await`를 쓰지 않습니다. 인터프리터가 `waitFor`를 담당합니다.
- **실패 리포트**: 실행 로그와 접근성 스냅샷이 한 메시지에 붙습니다.
- **커스텀 스텝**: `extendSiheom`으로 액션·assertion을 레지스트리에 추가합니다. Testing Library에서는 헬퍼 함수를 직접 조합해야 합니다.
- **로케이터**: `query`는 `getByRole`과 같은 정보를 씁니다. 배울 것은 거의 없습니다.

## Playwright Test와 비교

Playwright Test와 siheom은 둘 다 **role + accessible name** locator를 씁니다. 차이는 시험 표현 방식과 확장 모델입니다.

| | siheom | Playwright Test |
| --- | --- | --- |
| 시험 표현 | 데이터(스텝 배열) | `await` 명령형 |
| 실행 | vitest browser mode | Playwright runner |
| 커스텀 스텝 | factory 레지스트리 (`extendSiheom`) | fixture, helper, page object |
| 엄격함 | accessible name 필수, CSS·test id 비권장 | locator API가 더 유연 |
| E2E | **현재 미지원** (향후 Playwright 기반 E2E 가능) | 멀티 페이지·네트워크 E2E |

Playwright Test는 `await page.getByRole(...).click()` 체인으로 시나리오를 씁니다. siheom은 `actions.click(query.button("저장"))`처럼 스텝 객체로 쓰고, 시험 함수에서 `await`를 쓰지 않습니다. 반복 조작을 한 스텝으로 묶을 때 siheom은 factory에 등록만 하면 되고, Playwright는 page object나 helper를 별도로 유지보수합니다.

## Cypress와 비교

Cypress도 명령형 체인(`cy.get(...).click()`)과 플러그인으로 확장합니다. siheom은 데이터 스텝과 factory 레지스트리로 같은 목적을 다른 방식으로 달성합니다. Cypress는 실제 브라우저 E2E에 강하고, siheom은 컴포넌트·통합 시험을 vitest browser mode에서 돌리는 데 초점을 둡니다.

## E2E와의 관계

siheom은 **현재 멀티 페이지 E2E를 지원하지 않습니다.** 컴포넌트와 통합 수준의 시험을 실제 브라우저에서 돌리는 것이 1.0의 범위입니다. 향후 Playwright 등에 기반한 E2E 시험도 추가될 수 있습니다.

지금 전체 앱 흐름(로그인 → 결제 등)을 검증해야 한다면 Playwright나 Cypress E2E를 씁니다. siheom은 그 아래 층—UI 조각과 통합—을 빠르게, 접근성 중심으로 채웁니다.

## siheom이 맞지 않는 경우

- **지금 당장 멀티 페이지 E2E가 필요할 때** — Playwright / Cypress E2E
- **픽셀 단위 시각적 회귀** — Percy, Chromatic, Playwright screenshot compare
- **데이터 스텝·await 금지가 팀에 안 맞을 때** — Testing Library나 Playwright를 직접 씁니다
- **jsdom/happy-dom만 쓰고 싶을 때** — siheom은 실제 브라우저 실행을 권장합니다

## 한눈에 보기

| 관점 | siheom | Testing Library | Playwright / Cypress |
| --- | --- | --- | --- |
| 테스트 표현 | 데이터(스텝) | 명령형 API | 명령형 / 시나리오 |
| 실행 환경 | vitest browser mode (실제 브라우저) | jsdom 등 (팀 설정) | 실제 브라우저 E2E |
| 로케이터 | role + accessible name | `getByRole` 등 | `getByRole` 등 |
| await | 시험 본문에서 금지 | 스텝마다 필요 | 스텝마다 필요 |
| 접근성 스냅샷 | 내장 assertion | 별도 도구 | 제한적 |
| 실패 리포트 | 로그 + a11y 스냅샷 | 기본 에러 메시지 | 스크린샷 중심 |
| 커스텀 스텝 | factory 레지스트리 | 헬퍼 함수 | fixture / plugin |
| E2E | 미지원 (향후 가능) | 해당 없음 | 핵심 강점 |

## 다음 단계

- [siheom이란](/intro) — 시험을 만든 이유
- [React 빠른 시작](/getting-started/react) — browser mode 설정
- [Factory](/concepts/factory) — 커스텀 스텝 추가
