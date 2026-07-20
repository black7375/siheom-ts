# effect

Time-advancement steps. Usually used inside [`withFakeTimers`](/en/concepts/effects).

```ts
import { effect, withFakeTimers } from "@siheom/react";
```

| Export | Meaning |
| --- | --- |
| `effect.elapsed(ms)` | Advance fake time by `ms` |
| `effect.runAllTimers()` | Flush pending timers |
| `withFakeTimers(...steps)` | Apply fake timers only to inner steps |

`@siheom/react`'s `runSiheom` ships `reactEffects` (with `act`) and `reactFakeTimerScope` by default. When wrapping with `overrideSiheom`, pass `effects` and `fakeTimerScope` on the base registry. See [effect · withFakeTimers](/en/concepts/effects).

## Next steps

- [effect · withFakeTimers](/en/concepts/effects)
- [Countdown example](/en/examples/countdown)
- [assertions](/en/configuration/assertions)
