# siheom-ts

## 0.3.0

0.2.0 이후 프레임워크 지원 범위를 넓히고, core에 effect/드래그앤드롭을 더한 릴리스입니다. `@siheom/core`, `@siheom/react`, `@siheom/vue`, `@siheom/svelte`, `@siheom/solid`, `@siheom/angular`, `@siheom/qwik`, `@siheom/react-native`, `@siheom/ime`, `@siheom/vitest-browser-react` 10개 패키지가 모두 0.3.0으로 나갑니다.

### 새 프레임워크 러너 (첫 공개)

- `@siheom/vue`, `@siheom/svelte`, `@siheom/solid`, `@siheom/angular`, `@siheom/qwik` — `@siheom/react`와 같은 계약으로 `given.render`, `effect`, `withFakeTimers`를 각 프레임워크의 렌더러/fake timer scope에 맞춰 제공합니다.
- `@siheom/react-native` — React Native Testing Library 위에서 `given.render`와 RN 접근성 role 기반 query/action/assertion, 실패 시 접근성 스냅샷을 제공합니다.

### 새 보조 패키지 (첫 공개)

- `@siheom/ime` — 한글 IME 조합을 흉내 내는 `composeHangul`과, `overrideSiheom`으로 `fill`/`type`을 한글 입력으로 바꿔 끼우는 `createImeActions`. Linux Chrome + ibus 환경에서 캡처한 실제 IME 이벤트 트레이스를 기준으로 조합 순서를 맞췄습니다.
- `@siheom/vitest-browser-react` — `vitest-browser-react`의 locator 기반 렌더링 위에 얹은 실험적 React 러너.

### `@siheom/core` / `@siheom/react`

- effect 스텝과 `withFakeTimers`를 추가해, 스코프가 있는 fake timer로 `setTimeout`/`setInterval`을 다루는 시험을 쓸 수 있습니다.
- `hover`, `dragAndDrop` 액션과 `textContent`, `focused` assertion을 추가했습니다.
- 체크박스 checked 상태를 DOM 속성으로 확인하도록 고쳤고, `overrideSiheom`의 액션 바인딩 타입을 항상 필요하도록 고정했습니다.

### 문서

- Vue/Svelte/Solid/Angular/Qwik/React Native Getting Started 가이드를 새로 썼습니다.
- action 문서에 `hover`, `dragAndDrop`을 추가하고, 설치 가이드의 낡은 peer dependency 버전을 정리했습니다.

## 0.1.1

### Patch Changes

- c2825a9: setup for publishing and CI check
