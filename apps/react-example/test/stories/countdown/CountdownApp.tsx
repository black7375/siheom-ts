import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  formatSeconds,
  initialCountdown,
  remainingSeconds,
  setNow,
  startCountdown,
  type CountdownState,
} from "./countdownLogic";

export function CountdownApp({ durationMinutes = 25 }: { durationMinutes?: number }) {
  const [state, setState] = useState<CountdownState>(() => initialCountdown(durationMinutes));

  useEffect(() => {
    if (state.startTime === null) return;

    const intervalId = setInterval(() => {
      setState((current) => setNow(current, Date.now()));
    }, 1_000);

    return () => clearInterval(intervalId);
  }, [state.startTime]);

  return (
    <div>
      <div role="timer" aria-label="남은 시간">
        {formatSeconds(remainingSeconds(state))}
      </div>
      <Button aria-label="시작" onClick={() => setState((current) => startCountdown(current))}>
        시작
      </Button>
    </div>
  );
}
