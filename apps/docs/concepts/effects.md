# effect · withFakeTimers

타이머(`setTimeout` / `setInterval`)나 `Date`에 의존하는 UI는 Vitest fake timers 안에서 시험합니다. siheom은 **effect** 스텝과 **`withFakeTimers` 스코프**로 이를 표현합니다.

## 왜 스코프인가

`vi.useFakeTimers()`를 전역으로 켜면 다른 시험과 섞이거나 user-event가 멈출 수 있습니다. `withFakeTimers(...steps)`는 내부 스텝에만 fake timers를 설치하고, 끝나면 실시간을 복구합니다.

`@siheom/react`는 React/`act`에 맞게 effect와 fake-timer 훅을 미리 묶어 둡니다.

## API

```tsx
import {
  actions,
  assertions,
  effect,
  given,
  query,
  runSiheom,
  withFakeTimers,
} from "@siheom/react";

return runSiheom(
  withFakeTimers(
    given.render(<CountdownApp durationMinutes={25} />),
    actions.click(query.button("시작")),
    effect.elapsed(1_000),
    assertions.textContent(query.timer("남은 시간"), "24:59"),
  ),
);
```

| 스텝 | 의미 |
| --- | --- |
| `withFakeTimers(...steps)` | fake timers 스코프. 안쪽 스텝만 영향 |
| `effect.elapsed(ms)` | fake 시간을 `ms`만큼 진행 (React에서는 `act`로 감쌈) |
| `effect.runAllTimers()` | 대기 중인 타이머를 모두 실행. 열린 `setInterval`과 함께 쓰지 마세요 |

스코프 안에서는 각 **action** 뒤에 짧은 사용자 지연(~50ms)이 자동으로 진행됩니다. 앱 시간은 `effect.elapsed`로만 명시적으로 점프하세요.

## assertion은 그대로

타이머 전용 assertion은 없습니다. `role="timer"` UI는 `query.timer("…")`와 `assertions.textContent` / `visible`로 확인합니다.

```tsx
assertions.textContent(query.timer("남은 시간"), "24:59")
assertions.visible(query.status("완료"))
```

## overrideSiheom 사용 시

프로젝트가 `overrideSiheom`으로 `given.render`를 감싸면, base 레지스트리에 **`effects`**와 **`fakeTimerScope`**를 함께 넘겨야 `withFakeTimers`가 동작합니다.

```ts
import { overrideSiheom, defaultActions, defaultAssertions } from "@siheom/core";
import { defaultGivens, reactEffects, reactFakeTimerScope } from "@siheom/react";

export const { runSiheom } = overrideSiheom(
  {
    givens: defaultGivens,
    actions: defaultActions,
    assertions: defaultAssertions,
    effects: reactEffects,
    fakeTimerScope: reactFakeTimerScope,
  },
  { givens: { render: async (el) => render(<Provider>{el}</Provider>) } },
);
```

## 다음 단계

- [Countdown 예제](/examples/countdown) — start / pause / reset / complete
- [locator](/concepts/locator) — `query.timer`
- [Factory](/concepts/factory) — effect 레지스트리 확장
- [설정과 API](/configuration) — export 목록
