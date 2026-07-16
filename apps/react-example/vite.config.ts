import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
/// <reference types="vitest" />

const dirname = path.dirname(fileURLToPath(import.meta.url));

const tanstackLinkStub = path.resolve(
	dirname,
	"test/stories/routing/tanstack-router/stubs/link.tsx",
);

export default defineConfig({
	plugins: [tsconfigPaths(), react(), tailwindcss()],
	root: "./",
	resolve: {
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
