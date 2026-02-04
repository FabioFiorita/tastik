import { describe, expect, it, vi } from "vitest";
import { renderWithUser, screen } from "@/test-utils";
import { Hero } from "./hero";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, className, ...props }: any) => (
		<a href={to} className={className} {...props}>
			{children}
		</a>
	),
}));

describe("hero", () => {
	it("renders main heading", () => {
		renderWithUser(<Hero />);
		expect(screen.getByText("Lists without deadlines")).toBeInTheDocument();
	});

	it("renders tagline", () => {
		renderWithUser(<Hero />);
		expect(
			screen.getByText(/Tastik is the quiet companion to your reminder app/i),
		).toBeInTheDocument();
	});

	it("renders Get Started button with link to sign-in", () => {
		renderWithUser(<Hero />);
		const getStartedButton = screen.getByText("Get Started");
		expect(getStartedButton).toBeInTheDocument();
		expect(getStartedButton).toHaveAttribute("href", "/sign-in");
	});

	it("renders Download for iOS link", () => {
		renderWithUser(<Hero />);
		expect(screen.getByText("Download for iOS")).toBeInTheDocument();
	});

	it("renders demo list cards", () => {
		renderWithUser(<Hero />);
		expect(screen.getByText("Grocery List")).toBeInTheDocument();
		expect(screen.getByText("Packing List")).toBeInTheDocument();
		expect(screen.getByText("Party Budget")).toBeInTheDocument();
	});

	it("renders Tastik logo", () => {
		renderWithUser(<Hero />);
		const logos = screen.getAllByAltText("Tastik");
		expect(logos.length).toBeGreaterThan(0);
	});
});
