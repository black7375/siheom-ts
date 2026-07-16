# 설치

`@siheom/react`를 설치하고, vitest browser mode로 실제 브라우저에서 시험을 실행합니다.

## 패키지

| 패키지 | 역할 |
| --- | --- |
| `@siheom/core` | factory, 인터프리터, 기본 actions/assertions |
| `@siheom/react` | React `given.render`, pre-bound API |

## 설치

```bash
bun add @siheom/react
# 또는
npm install @siheom/react
```

browser mode 실행에 필요한 dev dependency:

```bash
bun add -d vitest @vitest/browser playwright @vitejs/plugin-react
bun add @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Peer dependencies

siheom은 Testing Library를 감싸 재배포하지 않고 그 위에 얹힙니다. 프로젝트에 이미 있는 버전과 충돌하지 않도록 peer dependency입니다.

- `@testing-library/dom` ^10
- `@testing-library/react` ^16
- `@testing-library/jest-dom` ^6
- `@testing-library/user-event` ^14
- `vitest` ^3
- `react` / `react-dom` ^18 또는 ^19

jsdom이나 happy-dom은 siheom이 권장하는 실행 환경이 아닙니다. [React 빠른 시작](/getting-started/react)의 browser mode 설정을 따르세요.

## 최소 import

```ts
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
```

## 다음 단계

- [React 빠른 시작](/getting-started/react) — vitest browser mode와 첫 시험
- [설정과 API](/configuration) — export 목록
