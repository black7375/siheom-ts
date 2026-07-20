import { $, component$, useSignal } from "@builder.io/qwik";

export const TickerOnStart = component$(() => {
  const count = useSignal(0);

  const start = $(() => {
    setInterval(() => {
      count.value += 1;
    }, 1_000);
  });

  return (
    <div>
      <div role="status" aria-label="count">
        {count.value}
      </div>
      <button type="button" aria-label="start" onClick$={start}>
        start
      </button>
    </div>
  );
});
