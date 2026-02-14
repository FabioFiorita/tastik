import { sentryTanstackStart } from "@sentry/tanstackstart-react";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { createLogger, defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const defaultLogger = createLogger();
const isSourceMapMessage = (msg: string) =>
	msg.includes("Failed to load source map") ||
	msg.includes("An error occurred while trying to read the map file");
const customLogger = {
	...defaultLogger,
	warn(msg: string, options?: { clear?: boolean; timestamp?: boolean }) {
		if (isSourceMapMessage(msg)) return;
		defaultLogger.warn(msg, options);
	},
	warnOnce(msg: string, options?: { clear?: boolean; timestamp?: boolean }) {
		if (isSourceMapMessage(msg)) return;
		defaultLogger.warnOnce(msg, options);
	},
	error(
		msg: string,
		options?: { clear?: boolean; timestamp?: boolean; error?: Error },
	) {
		if (isSourceMapMessage(msg)) return;
		defaultLogger.error(msg, options);
	},
};

const config = defineConfig({
	customLogger,
	nitro: {
		rollupConfig: {
			external: ["fsevents"],
		},
	},
	plugins: [
		devtools(),
		nitro(),
		// this is the plugin that enables path aliases
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
});

export default config;
