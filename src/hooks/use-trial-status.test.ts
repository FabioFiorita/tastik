import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTrialStatus } from "./use-trial-status";

const mockUseSubscription = vi.fn();

vi.mock("@/contexts/subscription", () => ({
	useSubscription: () => mockUseSubscription(),
}));

describe("use-trial-status", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns isTrialing true when status is trialing", () => {
		mockUseSubscription.mockReturnValue({
			status: "trialing",
			currentPeriodEnd: Date.now() + 7 * 24 * 60 * 60 * 1000,
		});

		const { result } = renderHook(() => useTrialStatus());

		expect(result.current.isTrialing).toBe(true);
		expect(result.current.trialEnd).toBeInstanceOf(Date);
		expect(result.current.trialDaysLeft).toBe(7);
		expect(result.current.trialLabel).toBe("7 days left");
	});

	it("returns isTrialing false when status is active", () => {
		mockUseSubscription.mockReturnValue({
			status: "active",
			currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
		});

		const { result } = renderHook(() => useTrialStatus());

		expect(result.current.isTrialing).toBe(false);
	});

	it("returns null trialLabel when currentPeriodEnd is not provided", () => {
		mockUseSubscription.mockReturnValue({
			status: "trialing",
			currentPeriodEnd: undefined,
		});

		const { result } = renderHook(() => useTrialStatus());

		expect(result.current.isTrialing).toBe(true);
		expect(result.current.trialEnd).toBeNull();
		expect(result.current.trialDaysLeft).toBeNull();
		expect(result.current.trialLabel).toBeNull();
	});

	it("calculates correct trial days left", () => {
		const daysLeft = 5;
		mockUseSubscription.mockReturnValue({
			status: "trialing",
			currentPeriodEnd: Date.now() + daysLeft * 24 * 60 * 60 * 1000,
		});

		const { result } = renderHook(() => useTrialStatus());

		expect(result.current.trialDaysLeft).toBe(daysLeft);
		expect(result.current.trialLabel).toBe("5 days left");
	});

	it("returns singular 'day' for 1 day left", () => {
		mockUseSubscription.mockReturnValue({
			status: "trialing",
			currentPeriodEnd: Date.now() + 24 * 60 * 60 * 1000,
		});

		const { result } = renderHook(() => useTrialStatus());

		expect(result.current.trialDaysLeft).toBe(1);
		expect(result.current.trialLabel).toBe("1 day left");
	});

	it("returns 0 days left when trial has ended", () => {
		mockUseSubscription.mockReturnValue({
			status: "trialing",
			currentPeriodEnd: Date.now() - 24 * 60 * 60 * 1000,
		});

		const { result } = renderHook(() => useTrialStatus());

		expect(result.current.trialDaysLeft).toBe(0);
		expect(result.current.trialLabel).toBe("0 days left");
	});

	it("returns 0 days left when currentPeriodEnd is in the past", () => {
		mockUseSubscription.mockReturnValue({
			status: "trialing",
			currentPeriodEnd: Date.now() - 1000,
		});

		const { result } = renderHook(() => useTrialStatus());

		expect(result.current.trialDaysLeft).toBe(0);
	});

	it("handles inactive status", () => {
		mockUseSubscription.mockReturnValue({
			status: "inactive",
			currentPeriodEnd: undefined,
		});

		const { result } = renderHook(() => useTrialStatus());

		expect(result.current.isTrialing).toBe(false);
		expect(result.current.trialEnd).toBeNull();
		expect(result.current.trialDaysLeft).toBeNull();
		expect(result.current.trialLabel).toBeNull();
	});
});
