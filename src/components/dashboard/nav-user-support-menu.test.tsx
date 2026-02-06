import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { NavUserSupportMenu } from "./nav-user-support-menu";

describe("nav-user-support-menu", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.open = vi.fn();
	});

	it("renders support menu options", () => {
		renderWithUser(<NavUserSupportMenu />);
		expect(screen.getByTestId("nav-user-help")).toBeInTheDocument();
		expect(screen.getByTestId("nav-user-privacy")).toBeInTheDocument();
		expect(screen.getByTestId("nav-user-terms")).toBeInTheDocument();
	});

	it("opens help center page when help option is clicked", async () => {
		const { user } = renderWithUser(<NavUserSupportMenu />);
		const helpOption = screen.getByTestId("nav-user-help");
		await user.click(helpOption);
		expect(window.open).toHaveBeenCalledWith("/support", "_blank");
	});

	it("opens privacy policy page when privacy option is clicked", async () => {
		const { user } = renderWithUser(<NavUserSupportMenu />);
		const privacyOption = screen.getByTestId("nav-user-privacy");
		await user.click(privacyOption);
		expect(window.open).toHaveBeenCalledWith("/privacy", "_blank");
	});

	it("opens terms of service page when terms option is clicked", async () => {
		const { user } = renderWithUser(<NavUserSupportMenu />);
		const termsOption = screen.getByTestId("nav-user-terms");
		await user.click(termsOption);
		expect(window.open).toHaveBeenCalledWith("/terms", "_blank");
	});
});
