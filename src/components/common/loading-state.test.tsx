import { describe, expect, it } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { LoadingState } from "./loading-state";

describe("loading-state", () => {
	it("renders default loading title", () => {
		renderWithUser(<LoadingState />);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("renders custom title", () => {
		renderWithUser(<LoadingState title="Please wait" />);
		expect(screen.getByText("Please wait")).toBeInTheDocument();
	});

	it("renders custom description when provided", () => {
		renderWithUser(<LoadingState description="Fetching your data..." />);
		expect(screen.getByText("Fetching your data...")).toBeInTheDocument();
	});

	it("does not render description when not provided", () => {
		const { container } = renderWithUser(<LoadingState />);
		const descriptions = container.querySelectorAll(
			'[class*="EmptyDescription"]',
		);
		expect(descriptions.length).toBe(0);
	});

	it("renders with custom testId when provided", () => {
		renderWithUser(<LoadingState testId="custom-loading" />);
		expect(screen.getByTestId("custom-loading")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		const { container } = renderWithUser(
			<LoadingState className="custom-class" />,
		);
		const element = container.querySelector(".custom-class");
		expect(element).toBeInTheDocument();
	});
});
