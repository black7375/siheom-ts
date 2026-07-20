import { configure } from "@testing-library/dom";
import * as React from "react";

configure({
  asyncWrapper: async (callback) => {
    let result: unknown;
    await React.act(async () => {
      result = await callback();
    });
    await React.act(async () => {
      await new Promise<void>((resolve) => {
        queueMicrotask(resolve);
      });
    });
    return result;
  },
  unstable_advanceTimersWrapper: (callback) => {
    let result: unknown;
    React.act(() => {
      result = callback();
    });
    return result;
  },
});
