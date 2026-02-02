/**
 * Log an error with context for debugging and monitoring.
 */
export function logError(
	error: Error,
	context: {
		operation: string;
		userId?: string;
		additionalInfo?: Record<string, unknown>;
	},
) {
	console.error(`[ERROR] ${context.operation}`, {
		message: error.message,
		stack: error.stack,
		userId: context.userId,
		additionalInfo: context.additionalInfo,
		timestamp: new Date().toISOString(),
	});
	// TODO: Add external error tracking service (e.g., Sentry) here
}

/**
 * Log a warning with context.
 */
export function logWarning(message: string, context?: Record<string, unknown>) {
	console.warn(`[WARNING] ${message}`, {
		...context,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Log info message with context (useful for tracking important events).
 */
export function logInfo(message: string, context?: Record<string, unknown>) {
	console.log(`[INFO] ${message}`, {
		...context,
		timestamp: new Date().toISOString(),
	});
}
