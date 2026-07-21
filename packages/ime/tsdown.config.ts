import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/hanja.ts"],
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist",
  clean: true,
});
