import { describe, expect, it } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { PlanActionLink } from "./plan-action-link";

describe("plan-action-link", () => {
	it("renders link with correct href", () => {
		renderWithUser(
			<PlanActionLink href="https://example.com" popular={false}>
				Click me
			</PlanActionLink>,
		);
		const link = screen.getByTestId("plan-action-link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "https://example.com");
	});

	it("renders children content", () => {
		renderWithUser(
			<PlanActionLink href="https://example.com" popular={false}>
				Start Trial
			</PlanActionLink>,
		);
		expect(screen.getByText("Start Trial")).toBeInTheDocument();
	});

	it("applies default variant styling when not popular", () => {
		renderWithUser(
			<PlanActionLink href="https://example.com" popular={false}>
				Click me
			</PlanActionLink>,
		);
		const link = screen.getByTestId("plan-action-link");
		// Outline variant should have border styling
		expect(link.className).toContain("border");
	});

	it("applies primary variant styling when popular", () => {
		renderWithUser(
			<PlanActionLink href="https://example.com" popular={true}>
				Click me
			</PlanActionLink>,
		);
		const link = screen.getByTestId("plan-action-link");
		// Primary variant should have primary background
		expect(link.className).toContain("bg-primary");
	});

	it("renders as full width", () => {
		renderWithUser(
			<PlanActionLink href="https://example.com" popular={false}>
				Click me
			</PlanActionLink>,
		);
		const link = screen.getByTestId("plan-action-link");
		expect(link.className).toContain("w-full");
	});
});
