# Countdown

포모도로 스타일 카운트다운입니다. `startTime`과 `now`로 경과를 유도하고, 시험은 `withFakeTimers` + `effect.elapsed`로 시간을 점프합니다.

소스: [`apps/react-example/test/stories/countdown/`](https://github.com/twinstae/siheom-ts/tree/main/apps/react-example/test/stories/countdown).

## UI 접근성

| 요소 | role / name |
| --- | --- |
| 남은 시간 | `role="timer"` · `aria-label="남은 시간"` |
| 시작 / 일시정지 / 리셋 | `button` + `aria-label` |
| 완료 | `role="status"` · `aria-label="완료"` |

## 시험: 시작 후 1초

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

## 시험: 일시정지

```tsx
return runSiheom(
  withFakeTimers(
    given.render(<CountdownApp durationMinutes={25} />),
    actions.click(query.button("시작")),
    effect.elapsed(1_000),
    actions.click(query.button("일시정지")),
    effect.elapsed(5_000),
    assertions.textContent(query.timer("남은 시간"), "24:59"),
  ),
);
```

일시정지 뒤에는 `effect.elapsed`로 시간이 흘러도 표시가 그대로입니다.

## 시험: 리셋 · 완료

```tsx
// 리셋 → 다시 25:00
return runSiheom(
  withFakeTimers(
    given.render(<CountdownApp durationMinutes={25} />),
    actions.click(query.button("시작")),
    effect.elapsed(1_000),
    actions.click(query.button("리셋")),
    assertions.textContent(query.timer("남은 시간"), "25:00"),
  ),
);

// 짧은 duration으로 완료까지
return runSiheom(
  withFakeTimers(
    given.render(<CountdownApp durationMinutes={1 / 60} />),
    actions.click(query.button("시작")),
    effect.elapsed(1_000),
    assertions.visible(query.status("완료")),
  ),
);
```

완료 시나리오는 실제 25분을 돌리지 말고, 짧은 `durationMinutes`로 끝내는 편이 안전합니다 (`setInterval` + 긴 `elapsed`는 느려질 수 있음).

## 구현 포인트

- 남은 시간은 `tick`으로 깎지 않고 `startTime`·`now`·`frozenElapsedMs`에서 **유도**합니다.
- React 쪽은 `useReducer` + `countdownReducer`로 전이합니다.
- 자세한 개념은 [effect · withFakeTimers](/concepts/effects)를 보세요.

## 다음 단계

- [effect · withFakeTimers](/concepts/effects)
- [Counter](/examples/counter) — 더 작은 click/visible 예제
- [설정과 API](/configuration)
