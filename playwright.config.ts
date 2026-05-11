import { defineConfig, devices } from "@playwright/test";

const databaseURL =
	process.env.DOWNWRITE_DATABASE_URL ??
	"postgresql://downwrite:downwrite@localhost:5432/downwrite";
const sessionSecret =
	process.env.DOWNWRITE_SESSION_SECRET ??
	"playwright-local-secret-with-at-least-thirty-two-characters";
const address = process.env.DOWNWRITE_ADDR ?? "127.0.0.1:7879";
const port = address.slice(address.lastIndexOf(":") + 1);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
	testDir: "tests/e2e",
	timeout: 30_000,
	expect: {
		timeout: 5_000,
	},
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	webServer: {
		command: `DOWNWRITE_DATABASE_URL=${databaseURL} DOWNWRITE_SESSION_SECRET=${sessionSecret} DOWNWRITE_ADDR=${address} npm run start:e2e`,
		url: baseURL,
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
