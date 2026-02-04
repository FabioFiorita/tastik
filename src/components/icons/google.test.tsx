import { describe, expect, it } from "vitest";
import { renderWithUser } from "@/test-utils";
import { Google } from "./google";

describe("google", () => {
	it("renders svg element", () => {
		const { container } = renderWithUser(<Google />);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	it("renders title element", () => {
		const { container } = renderWithUser(<Google />);
		const title = container.querySelector("title");
		expect(title).toBeInTheDocument();
		expect(title?.textContent).toBe("Google");
	});

	it("applies custom className", () => {
		const { container } = renderWithUser(<Google className="custom-icon" />);
		const svg = container.querySelector("svg");
		expect(svg).toHaveClass("custom-icon");
	});

	it("has shrink-0 class by default", () => {
		const { container } = renderWithUser(<Google />);
		const svg = container.querySelector("svg");
		expect(svg).toHaveClass("shrink-0");
	});

	it("passes through svg props", () => {
		const { container } = renderWithUser(<Google data-testid="google-icon" />);
		const svg = container.querySelector("svg");
		expect(svg).toHaveAttribute("data-testid", "google-icon");
	});

	it("renders with gradients", () => {
		const { container } = renderWithUser(<Google />);
		const defs = container.querySelector("defs");
		expect(defs).toBeInTheDocument();
		const gradients = container.querySelectorAll("linearGradient");
		expect(gradients.length).toBeGreaterThan(0);
	});
});
