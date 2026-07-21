import { Button } from "@/components/ui/button";
import { useEffect, useReducer } from "react";
import {
  countdownReducer,
  formatSeconds,
  initialCountdown,
  isComplete,
  remainingSeconds,
} from "./countdownLogic";

export function CountdownApp({ durationMinutes = 25 }: { durationMinutes?: number }) {
  const [state, dispatch] = useReducer(countdownReducer, durationMinutes, initialCountdown);
  const running = state.startTime !== null;
  const complete = isComplete(state);

  useEffect(() => {
    if (!running) return;

    const intervalId = setInterval(() => {
      dispatch({ type: "tick", now: Date.now() });
    }, 1_000);

    return () => clearInterval(intervalId);
  }, [running]);

  return (
    <div role="region" aria-label="카운트다운">
      <div role="timer" aria-label="남은 시간">
        {formatSeconds(remainingSeconds(state))}
      </div>
      {complete && (
        <div role="status" aria-label="완료">
          완료
        </div>
      )}
      {running ? (
        <Button aria-label="일시정지" onClick={() => dispatch({ type: "pause" })}>
          일시정지
        </Button>
      ) : (
        !complete && (
          <Button aria-label="시작" onClick={() => dispatch({ type: "start" })}>
            시작
          </Button>
        )
      )}
      <Button aria-label="리셋" onClick={() => dispatch({ type: "reset" })}>
        리셋
      </Button>
    </div>
  );
}
