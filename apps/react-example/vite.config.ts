import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from '@vitest/browser-playwright'
/// <reference types="vitest" />

const dirname = path.dirname(fileURLToPath(import.meta.url));

const tanstackLinkStub = path.resolve(
	dirname,
	"test/stories/routing/tanstack-router/stubs/link.tsx",
);

export default defineConfig({
	plugins: [react(), tailwindcss()],
	root: "./",
	resolve: {
		tsconfigPaths: true,
		alias: {
			"@showcase/tanstack-link": tanstackLinkStub,
		},
	},
	test: {
		alias: {
			"@showcase/tanstack-link": tanstackLinkStub,
		},
		setupFiles: "./test/setupTests.ts",
		include: ["test/**/*.test.tsx"],
		css: true,
		globals: true,
		environment: "jsdom",
		browser: {
			enabled: true,
			headless: true,
			provider: playwright({
				contextOptions: {
					timezoneId: "Asia/Seoul",
					permissions: ["clipboard-read"],
				}
			}),
			instances: [
				{
					browser: "chromium",
				},
			],
		},
		testTimeout: 3000,
	},
});
