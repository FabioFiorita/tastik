import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
	],
	test: {
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
			],
			thresholds: {
				lines: 70,
				functions: 70,
				branches: 70,
				statements: 70,
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
					exclude: ["convex/**", "**/node_modules/**"],
					environment: "happy-dom",
					setupFiles: ["./src/test-setup.ts"],
				},
			},
		],
	},
});
