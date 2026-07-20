# siheom이란

시험은 사용자의 행동과 기대를 **데이터**로 표현한 것입니다. 인터프리터(`runSiheom`)가 실제 브라우저에서 이 데이터를 순서대로 실행합니다.

## 시험(Siheom test)이란 무엇인가

테스트 코드가 명령형 API 호출의 연쇄가 아니라, `given` / `action` / `assert` 스텝 객체의 나열입니다.

```tsx
return runSiheom(
  given.render(<SignUpForm />),
  actions.fill(query.textbox(/이메일/), "test@test.com"),
  actions.click(query.button("가입하기")),
  assertions.visible(query.heading("가입을 환영합니다")),
);
```

## 왜 시험을 만들었나요

### await 피로와 실패 추적

Testing Library나 Playwright Test는 스텝마다 `await`를 반복합니다. 이전 siheom(2.0)도 `await query.button("확인").click()` 형태였는데, 실패 시 어느 스텝에서 문제가 생겼는지 파악하기 어렵고 에러 스택이 wrapper 안에서 뭉개졌습니다.

3.0은 시험을 **데이터**로 씁니다. 시험 함수 본문에 `await`를 쓰지 않고 `return runSiheom(...)`으로 인터프리터에 실행을 맡깁니다. 실패하면 [구조화된 리포트](/getting-started/react)로 어느 스텝까지 성공했는지 바로 볼 수 있습니다.

### 접근성을 중심에

`query`는 ARIA **role**과 **accessible name**만 씁니다. CSS 선택자, test id, DOM 경로에 의존하지 않습니다. 스크린 리더가 읽는 정보와 동일한 **공용어**로 UI를 지정하므로, 버튼 위치나 클래스명이 바뀌어도 시험이 유지됩니다.

실패 시 HTML 덤프나 스크린샷 대신 [접근성 스냅샷](/concepts/a11y-snapshot)을 보여줍니다. 사람이 읽기 쉽고 AI 에이전트가 분석하기에도 토큰 비용이 낮습니다.

### 제약으로 일관성 확보

siheom은 locator를 role + name으로 **제한**합니다. Playwright나 Testing Library보다 유연한 선택자를 쓸 수 없지만, 그 대신 팀 전체가 같은 규칙으로 요소를 지정합니다. accessible name이 없는 UI는 시험 작성 전에 접근성을 고치게 만듭니다.

### 커스텀 스텝을 쉽게

반복 조작(계좌 선택, 복잡한 fill 등)은 [Factory](/concepts/factory)의 `extendSiheom`으로 레지스트리에 등록합니다. Playwright의 page object나 Testing Library 헬퍼보다, 시험 데이터와 같은 형태로 재사용할 수 있습니다.

### 실제 브라우저에서 실행

siheom은 vitest **browser mode**로 Chromium 등 실제 브라우저에서 UI를 렌더합니다. jsdom이나 happy-dom은 권장하지 않습니다. 레이아웃·이벤트·포커스를 브라우저와 동일한 환경에서 검증합니다.

### 에러 메시지

스텝 실패 시 실행 로그, 원본 Testing Library 에러, 접근성 스냅샷이 하나의 `Error`에 담깁니다. 섹션 헤더는 [메시지 맵](/configuration/messages)으로 바꿀 수 있습니다.

```text
[Logs]

click!      : button "가입하기"
fill!       : textbox "이메일" with "test@test.com"

[Original Error Message]

Unable to find an accessible element with the role "heading" ...

[A11y Snapshot]

- textbox "이메일": test@test.com
- button "가입하기"
```

## siheom의 특징

- **[데이터 우선](/concepts)** — given / action / assert 스텝 배열
- **[locator](/concepts/locator)** — role + accessible name
- **[접근성 스냅샷](/concepts/a11y-snapshot)** — 시맨틱 트리 assertion
- **[Factory 확장](/concepts/factory)** — `extendSiheom` / `overrideSiheom`

## 패키지 구조

| 패키지 | 역할 |
| --- | --- |
| `@siheom/core` | 인터프리터, factory, 기본 actions/assertions |
| `@siheom/react` | React `given.render`, pre-bound `runSiheom` / `actions` / … |
| `@siheom/vue` | Vue `given.render` |
| `@siheom/svelte` | Svelte `given.render` |
| `@siheom/angular` | Angular `given.render` |
| `@siheom/qwik` | Qwik `given.render` |
| `@siheom/react-native` | React Native Testing Library 기반 `given.render`와 RN 접근성 query |

siheom core는 UI를 어떻게 그리는지 모릅니다. 프레임워크 패키지가 `given.render`를 제공하는 것이 유일한 약속입니다. [given](/concepts/given)을 참고하세요.

core 위에서 실험적으로 쓸 수 있는 보조 패키지도 있습니다: 한글 IME 조합을 흉내 내는 `@siheom/ime`, `vitest-browser-react`의 locator 기반 렌더링을 쓰는 `@siheom/vitest-browser-react`.

## 다음 단계

- [설치](/getting-started/install) — 패키지와 browser mode 의존성
- [React 빠른 시작](/getting-started/react) — 첫 시험
- [비교](/comparisons) — Testing Library·Playwright·Cypress
- [우리에게는 프런트 테스트가 필요할지도 모릅니다](https://twinstae.github.io/why-frontend-testing/)
- [접근성이 이끄는 웹 프론트엔드 테스트 자동화](https://tech.wonderwall.kr/articles/a11ydriventestautomation/)
