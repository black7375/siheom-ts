import { defineConfig } from "vitest/config";
import { reactNative } from "vitest-native";

export default defineConfig({
  // mock: fast pure-JS RN for library unit tests. Use engine: "native" in apps with full RN/babel setup.
  plugins: [reactNative({ engine: "mock" })],
  test: {
    globals: true,
    include: ["src/**/*.test.tsx"],
    exclude: ["src/**/*.direct.test.tsx"],
  },
});
