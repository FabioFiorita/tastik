import { ConvexError } from "convex/values";
import { appError } from "../../../convex/lib/errors";
import { getErrorMessage } from "./get-error-message";

describe("getErrorMessage", () => {
	it("returns fallback for a plain Error", () => {
		expect(getErrorMessage(new Error("oops"), "fallback")).toBe("fallback");
	});

	it("returns fallback for non-error values", () => {
		expect(getErrorMessage(null, "fallback")).toBe("fallback");
		expect(getErrorMessage("string error", "fallback")).toBe("fallback");
		expect(getErrorMessage(42, "fallback")).toBe("fallback");
	});

	it("returns the app error message from a ConvexError", () => {
		const err = new ConvexError(appError("INVALID_INPUT", "Name is required"));
		expect(getErrorMessage(err, "fallback")).toBe("Name is required");
	});

	it("returns fallback when ConvexError has unexpected data shape", () => {
		const err = new ConvexError({ unexpected: true });
		expect(getErrorMessage(err, "fallback")).toBe("fallback");
	});

	describe("rate limit formatting", () => {
		function makeRateLimited(retryAfterMs: number) {
			return new ConvexError({
				code: "RATE_LIMITED",
				message: "Rate limited",
				retryAfter: retryAfterMs,
			});
		}

		it("formats seconds (singular)", () => {
			expect(getErrorMessage(makeRateLimited(1000), "fb")).toBe(
				"Too many requests. Try again in 1 second.",
			);
		});

		it("formats seconds (plural)", () => {
			expect(getErrorMessage(makeRateLimited(5000), "fb")).toBe(
				"Too many requests. Try again in 5 seconds.",
			);
		});

		it("formats minutes (singular)", () => {
			expect(getErrorMessage(makeRateLimited(60_000), "fb")).toBe(
				"Too many requests. Try again in 1 minute.",
			);
		});

		it("formats minutes (plural)", () => {
			expect(getErrorMessage(makeRateLimited(120_000), "fb")).toBe(
				"Too many requests. Try again in 2 minutes.",
			);
		});

		it("formats hours (singular)", () => {
			expect(getErrorMessage(makeRateLimited(3_600_000), "fb")).toBe(
				"Too many requests. Try again in 1 hour.",
			);
		});

		it("formats hours (plural)", () => {
			expect(getErrorMessage(makeRateLimited(7_200_000), "fb")).toBe(
				"Too many requests. Try again in 2 hours.",
			);
		});

		it("uses the app message when retryAfter is absent", () => {
			const err = new ConvexError(appError("RATE_LIMITED", "Slow down"));
			expect(getErrorMessage(err, "fb")).toBe("Slow down");
		});
	});
});
