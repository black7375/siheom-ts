import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/siheom.ts",
    "src/effect.ts",
    "src/withFakeTimers.ts",
    "src/a11y/ariaRoles.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist",
  clean: true,
});
