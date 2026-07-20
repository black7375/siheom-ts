# effect

시간 진행 스텝입니다. 보통 [`withFakeTimers`](/concepts/effects) 안에서 사용합니다.

```ts
import { effect, withFakeTimers } from "@siheom/react";
```

| export | 설명 |
| --- | --- |
| `effect.elapsed(ms)` | fake 시간을 `ms`만큼 진행 |
| `effect.runAllTimers()` | 대기 중인 타이머를 모두 실행 |
| `withFakeTimers(...steps)` | 내부 스텝에만 fake timers 적용 |

`@siheom/react`의 `runSiheom`은 `reactEffects`(act 포함)와 `reactFakeTimerScope`를 기본으로 씁니다. `overrideSiheom`으로 감쌀 때는 base에 `effects`·`fakeTimerScope`를 넘기세요. 자세한 내용은 [effect · withFakeTimers](/concepts/effects)를 보세요.

## 다음 단계

- [effect · withFakeTimers](/concepts/effects)
- [Countdown 예제](/examples/countdown)
- [assertions](/configuration/assertions)
