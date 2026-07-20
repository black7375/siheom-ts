import * as React from "react";

export async function actAsync<T>(run: () => Promise<T> | T): Promise<T> {
  let result!: T;
  await React.act(async () => {
    result = await run();
  });
  return result;
}
