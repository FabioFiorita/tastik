import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { ERROR_CODES } from "../../../convex/lib/errors";
import { getErrorMessage } from "./get-error-message";

describe("get-error-message", () => {
	it("returns message from ConvexError with app error data", () => {
		const error = new ConvexError({
			code: ERROR_CODES.NOT_AUTHENTICATED,
			message: "User is not authenticated",
		});
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("User is not authenticated");
	});

	it("formats rate limit error with retryAfter in hours", () => {
		const error = new ConvexError({
			code: ERROR_CODES.RATE_LIMITED,
			message: "Rate limited",
			retryAfter: 3600 * 1000,
		});
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("Too many requests. Try again in 1 hour.");
	});

	it("formats rate limit error with retryAfter in multiple hours", () => {
		const error = new ConvexError({
			code: ERROR_CODES.RATE_LIMITED,
			message: "Rate limited",
			retryAfter: 7200 * 1000,
		});
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("Too many requests. Try again in 2 hours.");
	});

	it("formats rate limit error with retryAfter in minutes", () => {
		const error = new ConvexError({
			code: ERROR_CODES.RATE_LIMITED,
			message: "Rate limited",
			retryAfter: 120 * 1000,
		});
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("Too many requests. Try again in 2 minutes.");
	});

	it("formats rate limit error with retryAfter in single minute", () => {
		const error = new ConvexError({
			code: ERROR_CODES.RATE_LIMITED,
			message: "Rate limited",
			retryAfter: 60 * 1000,
		});
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("Too many requests. Try again in 1 minute.");
	});

	it("formats rate limit error with retryAfter in seconds", () => {
		const error = new ConvexError({
			code: ERROR_CODES.RATE_LIMITED,
			message: "Rate limited",
			retryAfter: 30 * 1000,
		});
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("Too many requests. Try again in 30 seconds.");
	});

	it("formats rate limit error with retryAfter in single second", () => {
		const error = new ConvexError({
			code: ERROR_CODES.RATE_LIMITED,
			message: "Rate limited",
			retryAfter: 1000,
		});
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("Too many requests. Try again in 1 second.");
	});

	it("returns fallback message for unknown errors", () => {
		const error = new Error("Some error");
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("Fallback message");
	});

	it("returns fallback message for non-ConvexError", () => {
		const error = "string error";
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("Fallback message");
	});

	it("returns fallback message for ConvexError without app error data", () => {
		const error = new ConvexError("Not an app error");
		const result = getErrorMessage(error, "Fallback message");
		expect(result).toBe("Fallback message");
	});
});
