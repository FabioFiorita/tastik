import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		server: { deps: { inline: ["convex-test"] } },
		projects: [
			{
				extends: true,
				test: {
					name: "convex",
					include: ["convex/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
					exclude: ["**/node_modules/**"],
					environment: "edge-runtime",
				},
			},
			{
				extends: true,
				test: {
					name: "unit",
					include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
					exclude: ["convex/**", "**/node_modules/**"],
					environment: "happy-dom",
				},
			},
		],
	},
});
