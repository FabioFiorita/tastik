import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local" });

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;
if (!baseUrl) {
	throw new Error(
		"PLAYWRIGHT_TEST_BASE_URL is required. Set it to your dev URL (e.g. https://tastik-dev.xxx.workers.dev) or localhost when running dev locally.",
	);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "playwright/.auth/user.json");

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	timeout: process.env.CI ? 90000 : 60000,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: "html",
	use: {
		baseURL: baseUrl,
		trace: "on-first-retry",
	},
	projects: [
		{ name: "setup", testMatch: /.*\.setup\.ts/ },
		{
			name: "chromium-auth",
			use: { ...devices["Desktop Chrome"], storageState: authFile },
			dependencies: ["setup"],
			testMatch: /authenticated\/.*\.spec\.ts/,
		},
		{
			name: "chromium-public",
			use: {
				...devices["Desktop Chrome"],
				storageState: { cookies: [], origins: [] },
			},
			dependencies: ["chromium-auth"],
			testMatch: /public\/.*\.spec\.ts/,
		},
	],
});
