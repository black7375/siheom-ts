import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
/// <reference types="vitest" />

export default defineConfig({
	plugins: [tsconfigPaths(), react(), tailwindcss()],
	root: "./",
	test: {
		setupFiles: "./test/setupTests.ts",
		include: ["test/**/*.test.tsx"],
		css: true,
		globals: true,
		browser: {
			enabled: true,
			headless: true,
			provider: "playwright",
			instances: [
				{
					browser: "chromium",
					context: {
						timezoneId: "Asia/Seoul",
						permissions: ["clipboard-read"],
					},
				},
			],
		},
		testTimeout: 3000,
	},
});
