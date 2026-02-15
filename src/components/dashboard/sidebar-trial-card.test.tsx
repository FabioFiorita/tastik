import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { SidebarTrialCard } from "./sidebar-trial-card";

const mockUseSubscriptionQuery = vi.fn();
const mockOpenBillingPortal = vi.fn();

vi.mock("@/hooks/queries/use-subscription", () => ({
	useSubscriptionQuery: () => mockUseSubscriptionQuery(),
}));

vi.mock("@/hooks/actions/use-manage-subscription", () => ({
	useManageSubscription: () => ({
		openBillingPortal: mockOpenBillingPortal,
		isPending: false,
	}),
}));

describe("sidebar-trial-card", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders nothing when not trialing", () => {
		mockUseSubscriptionQuery.mockReturnValue({
			isTrialing: false,
			isSubscribed: true,
		});

		const { container } = renderWithUser(<SidebarTrialCard />);
		expect(container.innerHTML).toBe("");
	});

	it("renders trial card with days remaining when trialing", () => {
		const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000;
		mockUseSubscriptionQuery.mockReturnValue({
			isTrialing: true,
			isSubscribed: true,
			currentPeriodEnd: threeDaysFromNow,
		});

		renderWithUser(<SidebarTrialCard />);
		expect(screen.getByTestId("sidebar-trial-card")).toBeInTheDocument();
		expect(screen.getByTestId("trial-days-remaining")).toHaveTextContent(
			"3 days remaining",
		);
		expect(screen.getByTestId("trial-subscribe-button")).toHaveTextContent(
			"Subscribe Now",
		);
	});

	it("shows singular day when 1 day remaining", () => {
		const oneDayFromNow = Date.now() + 1 * 24 * 60 * 60 * 1000;
		mockUseSubscriptionQuery.mockReturnValue({
			isTrialing: true,
			isSubscribed: true,
			currentPeriodEnd: oneDayFromNow,
		});

		renderWithUser(<SidebarTrialCard />);
		expect(screen.getByTestId("trial-days-remaining")).toHaveTextContent(
			"1 day remaining",
		);
	});

	it("shows 'ends today' when 0 days remaining", () => {
		mockUseSubscriptionQuery.mockReturnValue({
			isTrialing: true,
			isSubscribed: true,
			currentPeriodEnd: Date.now(),
		});

		renderWithUser(<SidebarTrialCard />);
		expect(screen.getByTestId("trial-days-remaining")).toHaveTextContent(
			"Your trial ends today",
		);
	});

	it("calls openBillingPortal when subscribe button is clicked", async () => {
		const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000;
		mockUseSubscriptionQuery.mockReturnValue({
			isTrialing: true,
			isSubscribed: true,
			currentPeriodEnd: threeDaysFromNow,
		});

		const { user } = renderWithUser(<SidebarTrialCard />);
		await user.click(screen.getByTestId("trial-subscribe-button"));
		expect(mockOpenBillingPortal).toHaveBeenCalledOnce();
	});
});
