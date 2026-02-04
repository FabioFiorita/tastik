import { describe, expect, it } from "vitest";
import { renderWithUser } from "@/test-utils";
import { Apple } from "./apple";

describe("apple", () => {
	it("renders svg element", () => {
		const { container } = renderWithUser(<Apple />);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
	});

	it("renders title element", () => {
		const { container } = renderWithUser(<Apple />);
		const title = container.querySelector("title");
		expect(title).toBeInTheDocument();
		expect(title?.textContent).toBe("Apple");
	});

	it("applies custom className", () => {
		const { container } = renderWithUser(<Apple className="custom-icon" />);
		const svg = container.querySelector("svg");
		expect(svg).toHaveClass("custom-icon");
	});

	it("has shrink-0 class by default", () => {
		const { container } = renderWithUser(<Apple />);
		const svg = container.querySelector("svg");
		expect(svg).toHaveClass("shrink-0");
	});

	it("passes through svg props", () => {
		const { container } = renderWithUser(<Apple data-testid="apple-icon" />);
		const svg = container.querySelector("svg");
		expect(svg).toHaveAttribute("data-testid", "apple-icon");
	});
});
