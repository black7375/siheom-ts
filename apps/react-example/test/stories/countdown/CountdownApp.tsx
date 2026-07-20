import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  formatSeconds,
  initialCountdown,
  isComplete,
  pauseCountdown,
  remainingSeconds,
  resetCountdown,
  setNow,
  startCountdown,
  type CountdownState,
} from "./countdownLogic";

export function CountdownApp({ durationMinutes = 25 }: { durationMinutes?: number }) {
  const [state, setState] = useState<CountdownState>(() => initialCountdown(durationMinutes));
  const running = state.startTime !== null;
  const complete = isComplete(state);

  useEffect(() => {
    if (!running) return;

    const intervalId = setInterval(() => {
      setState((current) => setNow(current, Date.now()));
    }, 1_000);

    return () => clearInterval(intervalId);
  }, [running]);

  return (
    <div>
      <div role="timer" aria-label="남은 시간">
        {formatSeconds(remainingSeconds(state))}
      </div>
      {complete && (
        <div role="status" aria-label="완료">
          완료
        </div>
      )}
      {running ? (
        <Button aria-label="일시정지" onClick={() => setState((current) => pauseCountdown(current))}>
          일시정지
        </Button>
      ) : (
        !complete && (
          <Button aria-label="시작" onClick={() => setState((current) => startCountdown(current))}>
            시작
          </Button>
        )
      )}
      <Button aria-label="리셋" onClick={() => setState((current) => resetCountdown(current))}>
        리셋
      </Button>
    </div>
  );
}
