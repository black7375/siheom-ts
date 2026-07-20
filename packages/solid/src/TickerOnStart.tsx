import { createEffect, createSignal } from "solid-js";

export function TickerOnStart() {
  const [running, setRunning] = createSignal(false);
  const [count, setCount] = createSignal(0);

  createEffect(() => {
    if (!running()) return;

    const intervalId = setInterval(() => {
      setCount((value) => value + 1);
    }, 1_000);

    return () => clearInterval(intervalId);
  });

  return (
    <div>
      <div role="status" aria-label="count">
        {count()}
      </div>
      <button type="button" aria-label="start" onClick={() => setRunning(true)}>
        start
      </button>
    </div>
  );
}
