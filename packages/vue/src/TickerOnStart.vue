<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";

const running = ref(false);
const count = ref(0);
let intervalId: ReturnType<typeof setInterval> | undefined;

watch(running, (isRunning) => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
  if (!isRunning) return;

  intervalId = setInterval(() => {
    count.value += 1;
  }, 1_000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div>
    <div role="status" aria-label="count">{{ count }}</div>
    <button type="button" aria-label="start" @click="running = true">start</button>
  </div>
</template>
