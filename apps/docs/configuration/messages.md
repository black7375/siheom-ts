# 메시지 맵

메시지 맵은 **실패 리포트의 섹션 헤더**만 바꿉니다. action/assertion 스텝의 `log` 문자열은 작성한 그대로 표시됩니다.

## 옵션

| 옵션 키 | 기본값 |
| --- | --- |
| `logs` | `Logs` |
| `originalErrorMessage` | `Original Error Message` |
| `a11ySnapshot` | `A11y Snapshot` |

## 사용

```ts
import { extendSiheom, defaultActions, defaultAssertions } from "@siheom/core";

const bindings = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: { render: myRender },
  },
  {
    messages: {
      logs: "로그",
      originalErrorMessage: "원본 에러 메시지",
      a11ySnapshot: "접근성 스냅샷",
    },
  },
);
```

부분 지정 시 나머지는 영문 기본값이 유지됩니다. `overrideSiheom`의 `messages` 슬롯으로도 동일하게 적용할 수 있습니다.

::: info
action/assertion `log` 문자열의 locale 카탈로그는 아직 없습니다. 헤더만 메시지 맵으로 바꿉니다.
:::

## 다음 단계

- [설정과 API](/configuration) — pre-bound API와 factory
- [React 빠른 시작](/getting-started/react) — 실패 리포트 예시
- [Factory](/concepts/factory) — `messages` 슬롯이 들어가는 위치
