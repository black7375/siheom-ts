# 설정과 API

`@siheom/react`의 pre-bound API로 시작하고, 확장은 `@siheom/core`의 factory를 씁니다.

## Pre-bound API (`@siheom/react`)

```ts
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
```

| export | 설명 |
| --- | --- |
| `runSiheom` | 시험 실행기 |
| `actions` | 사용자 행동 스텝 |
| `assertions` | 기대 상태 스텝 |
| `given` | 전제 조건 (`render`) |
| `query` | role + name locator |

## API 참조

- [given](/configuration/given)
- [actions](/configuration/actions)
- [assertions](/configuration/assertions)
- [메시지 맵](/configuration/messages) — 실패 리포트 헤더

## Core factory (`@siheom/core`)

```ts
import {
  createRunSiheom,
  extendSiheom,
  overrideSiheom,
  defaultActions,
  defaultAssertions,
} from "@siheom/core";
```

`extendSiheom` / `overrideSiheom`으로 레지스트리를 확장·교체합니다. [Factory](/concepts/factory)를 참고하세요.

## 타입

`ActionStep`, `AssertionStep`, `GivenStep`, `Step`, `Locator` 등은 `@siheom/core`에서 export됩니다.

## 다음 단계

- [React 빠른 시작](/getting-started/react) — browser mode와 첫 시험
- [개념 개요](/concepts) — 스텝과 locator
