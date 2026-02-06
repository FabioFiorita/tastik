import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockReactRouter } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import { ErrorState } from "./error-state";

const { mockNavigate } = mockReactRouter();

describe("error-state", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders default title and description", () => {
		renderWithUser(<ErrorState />);
		expect(screen.getByTestId("error-state-title")).toHaveTextContent(
			"Something went wrong",
		);
		expect(screen.getByTestId("error-state-description")).toHaveTextContent(
			"We couldn't load the data. Please try again.",
		);
	});

	it("renders custom title and description", () => {
		renderWithUser(
			<ErrorState
				title="Custom Error"
				description="This is a custom error message"
			/>,
		);
		expect(screen.getByTestId("error-state-title")).toHaveTextContent(
			"Custom Error",
		);
		expect(screen.getByTestId("error-state-description")).toHaveTextContent(
			"This is a custom error message",
		);
	});

	it("renders retry button when onRetry is provided", () => {
		const onRetry = vi.fn();
		renderWithUser(<ErrorState onRetry={onRetry} />);
		expect(screen.getByTestId("error-state-retry")).toBeInTheDocument();
	});

	it("calls onRetry when retry button is clicked", async () => {
		const onRetry = vi.fn();
		const { user } = renderWithUser(<ErrorState onRetry={onRetry} />);
		const retryButton = screen.getByTestId("error-state-retry");
		await user.click(retryButton);
		expect(onRetry).toHaveBeenCalledTimes(1);
	});

	it("renders go back button when onGoBack is true", () => {
		renderWithUser(<ErrorState onGoBack />);
		expect(screen.getByTestId("error-state-go-back")).toBeInTheDocument();
	});

	it("calls navigate when go back button is clicked", async () => {
		const { user } = renderWithUser(<ErrorState onGoBack />);
		const goBackButton = screen.getByTestId("error-state-go-back");
		await user.click(goBackButton);
		expect(mockNavigate).toHaveBeenCalledWith({ to: "..", replace: true });
	});

	it("renders both buttons when both props are provided", () => {
		const onRetry = vi.fn();
		renderWithUser(<ErrorState onRetry={onRetry} onGoBack />);
		expect(screen.getByTestId("error-state-retry")).toBeInTheDocument();
		expect(screen.getByTestId("error-state-go-back")).toBeInTheDocument();
	});

	it("renders custom button labels", () => {
		const onRetry = vi.fn();
		renderWithUser(
			<ErrorState
				onRetry={onRetry}
				onGoBack
				retryLabel="Retry Now"
				goBackLabel="Back"
			/>,
		);
		expect(screen.getByTestId("error-state-retry")).toHaveTextContent(
			"Retry Now",
		);
		expect(screen.getByTestId("error-state-go-back")).toHaveTextContent("Back");
	});

	it("does not render buttons when no actions are provided", () => {
		renderWithUser(<ErrorState />);
		expect(screen.queryByTestId("error-state-retry")).not.toBeInTheDocument();
		expect(screen.queryByTestId("error-state-go-back")).not.toBeInTheDocument();
	});

	it("does not render description when not provided", () => {
		renderWithUser(<ErrorState title="Error" description="" />);
		expect(screen.getByTestId("error-state-title")).toHaveTextContent("Error");
		expect(
			screen.queryByTestId("error-state-description"),
		).not.toBeInTheDocument();
	});
});
