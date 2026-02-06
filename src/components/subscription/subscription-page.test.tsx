import { beforeEach, describe, expect, it, vi } from "vitest";
import { SUBSCRIPTION_PERK_ITEMS } from "@/lib/constants/subscription";
import { renderWithUser, screen } from "@/test-utils";
import { SubscriptionPage } from "./subscription-page";

const mockUserData = {
	_id: "user_123" as const,
	email: "test@example.com",
};

import { mockUseCurrentUser } from "@/lib/helpers/mocks";

const mockBuildRevenueCatUrl = vi.fn();
const { mockUseCurrentUser: mockUser } = mockUseCurrentUser();

// Mock the revenue-cat module to avoid env var issues
vi.mock("@/lib/revenue-cat", () => ({
	buildRevenueCatUrl: (params: {
		userId: string;
		packageId: "monthly" | "yearly";
		email: string;
	}) => mockBuildRevenueCatUrl(params),
}));

describe("subscription-page", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockBuildRevenueCatUrl.mockImplementation(
			({ userId, packageId, email }) =>
				`https://revenuecat.com/${userId}?package=${packageId}&email=${email}`,
		);
	});

	it("renders null when no user", () => {
		mockUser.mockReturnValue(null);
		const { container } = renderWithUser(<SubscriptionPage />);
		expect(container.firstChild).toBeNull();
	});

	it("renders main heading and subheading", () => {
		mockUser.mockReturnValue(mockUserData);
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByTestId("subscription-page-heading")).toHaveTextContent(
			"Unlock every list, everywhere.",
		);
		expect(
			screen.getByTestId("subscription-page-subheading"),
		).toHaveTextContent(
			/Your lists are ready. Choose a plan to sync across devices/i,
		);
	});

	it("renders PricingFeatures component", () => {
		mockUser.mockReturnValue(mockUserData);
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByTestId("subscription-page-features")).toHaveTextContent(
			"5 list types",
		);
	});

	it("renders all subscription perk items", () => {
		mockUser.mockReturnValue(mockUserData);
		renderWithUser(<SubscriptionPage />);
		SUBSCRIPTION_PERK_ITEMS.forEach((perk) => {
			const testId = `subscription-perk-${perk.title.toLowerCase().replace(/\s+/g, "-")}`;
			const el = screen.getByTestId(testId);
			expect(el).toHaveTextContent(perk.title);
			expect(el).toHaveTextContent(perk.description);
		});
	});

	it("renders PlanCards component", () => {
		mockUser.mockReturnValue(mockUserData);
		renderWithUser(<SubscriptionPage />);
		// Check for plan card presence
		expect(screen.getByTestId("plan-card-monthly")).toBeInTheDocument();
		expect(screen.getByTestId("plan-card-yearly")).toBeInTheDocument();
	});

	it("renders user email information", () => {
		mockUser.mockReturnValue(mockUserData);
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByTestId("subscription-page-signed-in")).toHaveTextContent(
			"test@example.com",
		);
		expect(
			screen.getByTestId("subscription-page-checkout-disclaimer"),
		).toHaveTextContent("Checkout opens in a secure RevenueCat window.");
	});

	it("handles missing email gracefully", () => {
		mockUser.mockReturnValue({ _id: "user_123", email: null });
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByTestId("subscription-page-signed-in")).toHaveTextContent(
			"user",
		);
	});

	it("renders RevenueCat checkout links for plans", () => {
		mockUser.mockReturnValue(mockUserData);
		const { container } = renderWithUser(<SubscriptionPage />);
		const links = container.querySelectorAll('a[href*="revenuecat"]');
		expect(links.length).toBeGreaterThan(0);
	});

	it("builds correct RevenueCat URLs with user data", () => {
		mockUser.mockReturnValue(mockUserData);

		renderWithUser(<SubscriptionPage />);

		// Check that buildRevenueCatUrl was called with correct params
		expect(mockBuildRevenueCatUrl).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "user_123",
				email: "test@example.com",
			}),
		);
	});
});
