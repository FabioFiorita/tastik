import { beforeEach, describe, expect, it } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { SidebarTrialCard } from "./sidebar-trial-card";

describe("sidebar-trial-card", () => {
	beforeEach(() => {
		// No setup needed
	});

	it("renders nothing when trialLabel is null", () => {
		const { container } = renderWithUser(
			<SidebarTrialCard trialLabel={null} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("renders nothing when trialLabel is undefined", () => {
		const { container } = renderWithUser(
			<SidebarTrialCard trialLabel={undefined} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("renders trial card with label", () => {
		renderWithUser(<SidebarTrialCard trialLabel="7 days left" />);
		expect(screen.getByTestId("sidebar-trial-card")).toBeInTheDocument();
		expect(screen.getByText("Trial")).toBeInTheDocument();
		expect(screen.getByText("7 days left")).toBeInTheDocument();
	});

	it("renders trial card with 1 day left", () => {
		renderWithUser(<SidebarTrialCard trialLabel="1 day left" />);
		expect(screen.getByText("1 day left")).toBeInTheDocument();
	});
});
