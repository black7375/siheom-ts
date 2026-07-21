/** Yield so host code (React setState, focus bounce) can run between preedit steps. */
export async function settleAfterPreedit(kind: "microtask" | "macrotask"): Promise<void> {
  if (kind === "microtask") {
    await Promise.resolve();
    await Promise.resolve();
    return;
  }
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}
