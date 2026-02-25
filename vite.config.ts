import { readFileSync } from "node:fs";
import { cloudflare } from "@cloudflare/vite-plugin";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

function stripSourceMapFromSeroval() {
	return {
		name: "strip-seroval-sourcemap",
		enforce: "pre" as const,
		load(id: string) {
			if (
				id.includes("node_modules/seroval") ||
				id.includes("node_modules/seroval-plugins")
			) {
				const filePath = id.split("?")[0];
				const code = readFileSync(filePath, "utf-8").replace(
					/\n\/\/# sourceMappingURL=.*$/m,
					"",
				);
				return { code, map: null };
			}
		},
	};
}

const config = defineConfig({
	plugins: [
		stripSourceMapFromSeroval(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		devtools({
			eventBusConfig: {
				port: 42071,
				enabled: true,
			},
		}),
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		sentryTanstackStart({
			org: "fabiofiorita",
			project: "tastik-web",
			authToken: process.env.SENTRY_AUTH_TOKEN,
		}),
	],
	ssr: {
		noExternal: ["@convex-dev/better-auth"],
	},
});

export default config;
