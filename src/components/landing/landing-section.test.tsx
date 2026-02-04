import { describe, expect, it } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { LandingSection } from "./landing-section";

describe("landing-section", () => {
	it("renders section with id", () => {
		const { container } = renderWithUser(
			<LandingSection id="test-section" backgroundClass="bg-white">
				<div>Content</div>
			</LandingSection>,
		);
		const section = container.querySelector("#test-section");
		expect(section).toBeInTheDocument();
	});

	it("renders children content", () => {
		renderWithUser(
			<LandingSection id="test" backgroundClass="bg-white">
				<div>Test content</div>
			</LandingSection>,
		);
		expect(screen.getByTestId("test-section-content")).toHaveTextContent(
			"Test content",
		);
	});

	it("renders title and subtitle when provided", () => {
		renderWithUser(
			<LandingSection
				id="test"
				backgroundClass="bg-white"
				title="Section Title"
				subtitle="Section subtitle text"
			>
				<div>Content</div>
			</LandingSection>,
		);
		const heading = screen.getByTestId("test-section-heading");
		expect(heading).toHaveTextContent("Section Title");
		expect(heading).toHaveTextContent("Section subtitle text");
	});

	it("does not render title/subtitle when not provided", () => {
		renderWithUser(
			<LandingSection id="test" backgroundClass="bg-white">
				<div>Content</div>
			</LandingSection>,
		);
		expect(
			screen.queryByTestId("test-section-heading"),
		).not.toBeInTheDocument();
	});

	it("applies custom background class", () => {
		const { container } = renderWithUser(
			<LandingSection id="test" backgroundClass="bg-custom-gradient">
				<div>Content</div>
			</LandingSection>,
		);
		const section = container.querySelector(".bg-custom-gradient");
		expect(section).toBeInTheDocument();
	});

	it("applies custom heading className", () => {
		const { container } = renderWithUser(
			<LandingSection
				id="test"
				backgroundClass="bg-white"
				title="Title"
				subtitle="Subtitle"
				headingClassName="custom-heading-class"
			>
				<div>Content</div>
			</LandingSection>,
		);
		const headingContainer = container.querySelector(".custom-heading-class");
		expect(headingContainer).toBeInTheDocument();
	});
});
