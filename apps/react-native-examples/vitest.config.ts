import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { reactNative } from "vitest-native";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [reactNative({ engine: "mock" })],
  resolve: {
    alias: {
      "@siheom/react-native": path.resolve(dirname, "../../packages/react-native/src/index.ts"),
    },
  },
  test: {
    globals: true,
    include: ["test/**/*.test.tsx"],
    setupFiles: ["test/matchMedia.polyfill.ts", "test/setupTests.ts"],
  },
});
