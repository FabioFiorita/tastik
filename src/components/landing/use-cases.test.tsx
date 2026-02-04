import { describe, expect, it } from "vitest";
import { LANDING_USE_CASES } from "@/lib/constants/landing";
import { renderWithUser, screen } from "@/test-utils";
import { UseCases } from "./use-cases";

describe("use-cases", () => {
	it("renders section heading", () => {
		renderWithUser(<UseCases />);
		expect(screen.getByText("Made for real life")).toBeInTheDocument();
	});

	it("renders section subtitle", () => {
		renderWithUser(<UseCases />);
		expect(
			screen.getByText(
				/From groceries to projects, Tastik adapts to how you actually use lists/i,
			),
		).toBeInTheDocument();
	});

	it("renders all use cases from constant", () => {
		renderWithUser(<UseCases />);
		LANDING_USE_CASES.forEach((useCase) => {
			expect(screen.getByText(useCase.title)).toBeInTheDocument();
			expect(screen.getByText(useCase.description)).toBeInTheDocument();
		});
		// Check that all list types are present (some may be duplicated)
		const listTypes = new Set(LANDING_USE_CASES.map((uc) => uc.listType));
		listTypes.forEach((listType) => {
			expect(screen.getAllByText(listType).length).toBeGreaterThan(0);
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
