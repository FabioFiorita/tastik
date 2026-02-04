import { type RenderOptions, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

/**
 * Custom render function that sets up userEvent automatically
 * Use this instead of the regular render from @testing-library/react
 */
export function renderWithUser(ui: ReactElement, options?: RenderOptions) {
	return {
		user: userEvent.setup(),
		...render(ui, options),
	};
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";
export { userEvent };
