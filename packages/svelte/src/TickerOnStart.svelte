<script lang="ts">
  let running = $state(false);
  let count = $state(0);

  $effect(() => {
    if (!running) return;

    const intervalId = setInterval(() => {
      count += 1;
    }, 1_000);

    return () => clearInterval(intervalId);
  });
</script>

<div>
  <div role="status" aria-label="count">{count}</div>
  <button type="button" aria-label="start" onclick={() => (running = true)}>start</button>
</div>
