import { cloudflare } from "@cloudflare/vite-plugin";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { createLogger, defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig(({ command }) => {
	const isDev = command === "serve";
	const logger = createLogger();
	const originalWarn = logger.warn.bind(logger);
	const originalError = logger.error.bind(logger);
	const isNodeModulesSourcemapWarn = (m: string) =>
		((m.includes("Sourcemap for") &&
			m.includes("points to missing source files")) ||
			m.includes("Failed to load source map")) &&
		/node_modules/.test(m);
	const isNodeModulesSourcemapError = (m: string) =>
		(m.includes("map file") ||
			m.includes("source map") ||
			m.includes(".map")) &&
		/node_modules/.test(m);
	logger.warn = (msg, options) => {
		if (isDev && isNodeModulesSourcemapWarn(String(msg))) return;
		originalWarn(msg, options);
	};
	logger.error = (msg, options) => {
		if (isDev && isNodeModulesSourcemapError(String(msg))) return;
		originalError(msg, options);
	};

	return {
		customLogger: logger,
		plugins: [
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
	};
});

export default config;
