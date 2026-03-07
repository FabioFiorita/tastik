import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
	],
	test: {
		globals: true,
		server: { deps: { inline: ["convex-test"] } },
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/test-setup.ts",
				"src/test-utils.tsx",
				"src/__tests__/helpers/**",
				"**/*.d.ts",
				"**/*.config.*",
				"**/mockData/**",
				"**/types/**",
				"**/*.types.ts",
				".next/**",
				"dist/**",
				"build/**",
				"convex/auth.ts",
				"convex/http.ts",
				"convex/users.ts",
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
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
					exclude: ["convex/**", "e2e/**", "**/node_modules/**"],
					environment: "happy-dom",
					setupFiles: ["./src/test-setup.ts"],
				},
			},
		],
	},
});
