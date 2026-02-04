import { describe, expect, it } from "vitest";
import { LANDING_USE_CASES } from "@/lib/constants/landing";
import { renderWithUser, screen } from "@/test-utils";
import { UseCases } from "./use-cases";

describe("use-cases", () => {
	it("renders section heading", () => {
		renderWithUser(<UseCases />);
		expect(screen.getByTestId("use-cases-section-heading")).toHaveTextContent(
			"Made for real life",
		);
	});

	it("renders section subtitle", () => {
		renderWithUser(<UseCases />);
		expect(screen.getByTestId("use-cases-section-heading")).toHaveTextContent(
			/From groceries to projects, Tastik adapts to how you actually use lists/i,
		);
	});

	it("renders all use cases from constant", () => {
		renderWithUser(<UseCases />);
		LANDING_USE_CASES.forEach((useCase) => {
			const testId = `use-case-${useCase.title.toLowerCase().replace(/\s+/g, "-")}`;
			const el = screen.getByTestId(testId);
			expect(el).toHaveTextContent(useCase.title);
			expect(el).toHaveTextContent(useCase.description);
			expect(el).toHaveTextContent(useCase.listType);
		});
	});

	it("renders correct number of use case cards", () => {
		const { container } = renderWithUser(<UseCases />);
		const useCaseCards = container.querySelectorAll(
			".group.flex.flex-col.rounded-2xl",
		);
		expect(useCaseCards.length).toBe(LANDING_USE_CASES.length);
	});
});
