import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOBILE_BREAKPOINT } from "@/lib/constants/breakpoints";
import { getMatches } from "./get-matches";

describe("get-matches", () => {
	const originalWindow = global.window;
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		global.window = originalWindow;
		window.matchMedia = originalMatchMedia;
	});

	it("returns false when window is undefined", () => {
		// @ts-expect-error - intentionally setting window to undefined for SSR test
		global.window = undefined;
		const result = getMatches();
		expect(result).toBe(false);
	});

	it("returns false when matchMedia is not available", () => {
		// @ts-expect-error - intentionally removing matchMedia
		window.matchMedia = undefined;
		const result = getMatches();
		expect(result).toBe(false);
	});

	it("returns true when screen width is below mobile breakpoint", () => {
		const mockMatchMedia = vi.fn().mockReturnValue({
			matches: true,
			media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		});
		window.matchMedia = mockMatchMedia;

		const result = getMatches();
		expect(result).toBe(true);
		expect(mockMatchMedia).toHaveBeenCalledWith(
			`(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
		);
	});

	it("returns false when screen width is at or above mobile breakpoint", () => {
		const mockMatchMedia = vi.fn().mockReturnValue({
			matches: false,
			media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		});
		window.matchMedia = mockMatchMedia;

		const result = getMatches();
		expect(result).toBe(false);
		expect(mockMatchMedia).toHaveBeenCalledWith(
			`(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
		);
	});
});
