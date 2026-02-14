import * as Sentry from "@sentry/tanstackstart-react";

const dsn = process.env.VITE_SENTRY_DSN;
const tracesSampleRate = process.env.SENTRY_TRACES_SAMPLE_RATE;

if (dsn) {
	Sentry.init({
		dsn,
		sendDefaultPii: true,
		tracesSampleRate,
	});
}
