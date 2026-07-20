import * as React from "react";

async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => {
    queueMicrotask(resolve);
  });
}

export async function actAsync<T>(run: () => Promise<T> | T): Promise<T> {
  let result!: T;
  await React.act(async () => {
    result = await run();
  });
  await React.act(async () => {
    await flushMicrotasks();
  });
  return result;
}
