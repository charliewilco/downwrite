import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "tests/e2e",
	timeout: 30_000,
	expect: {
		timeout: 5_000,
	},
	use: {
		baseURL: "http://127.0.0.1:7879",
		trace: "on-first-retry",
	},
	webServer: {
		command:
			"DOWNWRITE_DATABASE_URL=postgresql://downwrite:downwrite@localhost:5432/downwrite DOWNWRITE_SESSION_SECRET=playwright-local-secret-with-at-least-thirty-two-characters DOWNWRITE_ADDR=127.0.0.1:7879 npm run start",
		url: "http://127.0.0.1:7879",
		reuseExistingServer: !process.env.CI,
		timeout: 10_000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
