import { cloudflare } from "@cloudflare/vite-plugin";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { createLogger, defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const logger = createLogger();
const originalWarn = logger.warn.bind(logger);
logger.warn = (msg, options) => {
	if (msg.includes("Sourcemap for") && msg.includes("points to missing source files")) return;
	originalWarn(msg, options);
};

const config = defineConfig({
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
});

export default config;
