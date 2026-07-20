# Factory

팀마다 필요한 액션은 다릅니다. 계좌 선택 콤보박스처럼 반복되는 조작을 한 스텝으로 묶고 싶거나, `fill`의 구현을 프로젝트 사정에 맞게 바꾸고 싶을 수 있습니다. factory는 이런 확장과 교체를 위한 조립 지점입니다.

입력은 레지스트리(`actions`, `assertions`, `givens`, `effects`, `messages`, 선택적 `fakeTimerScope`)이고, 출력은 여러분이 이미 쓰고 있는 `runSiheom` / `actions` / `assertions` / `given` / `effect`입니다. `query`는 공유됩니다.

`@siheom/react`는 기본 레지스트리로 한 번 묶어 둔 **pre-bound** 진입점입니다. 확장과 교체는 `@siheom/core`에서 수행합니다.

**새 키는 `extendSiheom`, 있는 키는 `overrideSiheom`입니다. 반대로 쓰면 에러가 납니다.**

## extendSiheom

기존에 없는 action, assertion, given, message 키를 **추가**합니다. 같은 키가 있으면 에러가 발생합니다.

```ts
import { extendSiheom, defaultActions, defaultAssertions } from "@siheom/core";

const { runSiheom, actions } = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: { render: myRender },
  },
  {
    actions: {
      selectAccount: async (target, account) => {
        /* 콤보박스 열기 → 옵션 선택 */
      },
    },
  },
);

await runSiheom(actions.selectAccount(query.combobox(/계정/), "현금"));
```

이미 있는 키를 `extendSiheom`에 넘기면 다음과 같이 실패합니다.

```text
extendSiheom: cannot add existing actions keys: fill. Use overrideSiheom to replace.
```

## overrideSiheom

이미 있는 키의 **구현만 교체**합니다. 없는 키를 넘기면 에러가 발생합니다.

```ts
const { runSiheom, actions } = overrideSiheom(base, {
  actions: {
    fill: myCustomFill,
  },
});
```

없는 키를 `overrideSiheom`에 넘기면 다음과 같이 실패합니다.

```text
overrideSiheom: cannot replace unknown actions keys: selectAccount. Use extendSiheom to add.
```

## effects · fakeTimerScope

타이머 UI를 쓰려면 base 레지스트리에 `effects`와 (React라면) `fakeTimerScope`를 넣습니다. `overrideSiheom`은 이 필드를 base에서 보존합니다. [effect · withFakeTimers](/concepts/effects)를 참고하세요.

```ts
import { defaultGivens, reactEffects, reactFakeTimerScope } from "@siheom/react";

overrideSiheom(
  {
    givens: defaultGivens,
    actions: defaultActions,
    assertions: defaultAssertions,
    effects: reactEffects,
    fakeTimerScope: reactFakeTimerScope,
  },
  { givens: { render: myRender } },
);
```

`extendSiheom` / `overrideSiheom`으로 effect 키를 추가·교체할 수도 있습니다 (예: 커스텀 `elapsed`).

## 메시지 맵

factory의 `messages` 슬롯으로 실패 리포트 섹션 헤더를 지정합니다. [메시지 맵](/configuration/messages)을 참고하세요.

## 다음 단계

- [given](/concepts/given) — Provider를 `given.render`에 묶기
- [effect · withFakeTimers](/concepts/effects) — fake timers 스코프
- [설정과 API](/configuration) — pre-bound API와 factory export
- [메시지 맵](/configuration/messages) — 실패 리포트 헤더 커스터마이즈
