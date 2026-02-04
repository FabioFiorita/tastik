import { beforeEach, describe, expect, it, vi } from "vitest";
import { SUBSCRIPTION_PERK_ITEMS } from "@/lib/constants/subscription";
import { renderWithUser, screen } from "@/test-utils";
import { SubscriptionPage } from "./subscription-page";

const mockUser = {
	_id: "user_123" as const,
	email: "test@example.com",
};

const mockBuildRevenueCatUrl = vi.fn();
const mockUseCurrentUser = vi.fn();

// Mock the revenue-cat module to avoid env var issues
vi.mock("@/lib/revenue-cat", () => ({
	buildRevenueCatUrl: (...args: any[]) => mockBuildRevenueCatUrl(...args),
}));

vi.mock("@/hooks/queries/use-current-user", () => ({
	useCurrentUser: () => mockUseCurrentUser(),
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
		mockUseCurrentUser.mockReturnValue(null);
		const { container } = renderWithUser(<SubscriptionPage />);
		expect(container.firstChild).toBeNull();
	});

	it("renders main heading and subheading", () => {
		mockUseCurrentUser.mockReturnValue(mockUser);
		renderWithUser(<SubscriptionPage />);
		expect(
			screen.getByText("Unlock every list, everywhere."),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				/Your lists are ready. Choose a plan to sync across devices/i,
			),
		).toBeInTheDocument();
	});

	it("renders PricingFeatures component", () => {
		mockUseCurrentUser.mockReturnValue(mockUser);
		renderWithUser(<SubscriptionPage />);
		// PricingFeatures should render features from PRICING_FEATURES constant
		expect(screen.getByText("5 list types")).toBeInTheDocument();
	});

	it("renders all subscription perk items", () => {
		mockUseCurrentUser.mockReturnValue(mockUser);
		renderWithUser(<SubscriptionPage />);
		SUBSCRIPTION_PERK_ITEMS.forEach((perk) => {
			expect(screen.getByText(perk.title)).toBeInTheDocument();
			expect(screen.getByText(perk.description)).toBeInTheDocument();
		});
	});

	it("renders PlanCards component", () => {
		mockUseCurrentUser.mockReturnValue(mockUser);
		renderWithUser(<SubscriptionPage />);
		// Check for plan card presence
		expect(screen.getByTestId("plan-card-monthly")).toBeInTheDocument();
		expect(screen.getByTestId("plan-card-yearly")).toBeInTheDocument();
	});

	it("renders user email information", () => {
		mockUseCurrentUser.mockReturnValue(mockUser);
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByText("test@example.com")).toBeInTheDocument();
		expect(
			screen.getByText("Checkout opens in a secure RevenueCat window."),
		).toBeInTheDocument();
	});

	it("handles missing email gracefully", () => {
		mockUseCurrentUser.mockReturnValue({ _id: "user_123", email: null });
		renderWithUser(<SubscriptionPage />);
		expect(screen.getByText("user")).toBeInTheDocument();
	});

	it("renders RevenueCat checkout links for plans", () => {
		mockUseCurrentUser.mockReturnValue(mockUser);
		const { container } = renderWithUser(<SubscriptionPage />);
		const links = container.querySelectorAll('a[href*="revenuecat"]');
		expect(links.length).toBeGreaterThan(0);
	});

	it("builds correct RevenueCat URLs with user data", () => {
		mockUseCurrentUser.mockReturnValue(mockUser);

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
