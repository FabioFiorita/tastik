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
		expect(screen.getByTestId("hero-heading")).toHaveTextContent(
			"Lists without deadlines",
		);
	});

	it("renders tagline", () => {
		renderWithUser(<Hero />);
		expect(screen.getByTestId("hero-tagline")).toHaveTextContent(
			/Tastik is the quiet companion to your reminder app/i,
		);
	});

	it("renders Get Started button with link to sign-in", () => {
		renderWithUser(<Hero />);
		const getStartedLink = screen.getByTestId("hero-get-started");
		expect(getStartedLink).toBeInTheDocument();
		expect(getStartedLink).toHaveAttribute("href", "/sign-in");
		expect(getStartedLink).toHaveTextContent("Get Started");
	});

	it("renders Download for iOS link", () => {
		renderWithUser(<Hero />);
		const downloadLink = screen.getByTestId("hero-download-ios");
		expect(downloadLink).toBeInTheDocument();
		expect(downloadLink).toHaveTextContent("Download for iOS");
	});

	it("renders demo list cards", () => {
		renderWithUser(<Hero />);
		expect(screen.getByTestId("hero-demo-grocery")).toHaveTextContent(
			"Grocery List",
		);
		expect(screen.getByTestId("hero-demo-packing")).toHaveTextContent(
			"Packing List",
		);
		expect(screen.getByTestId("hero-demo-party")).toHaveTextContent(
			"Party Budget",
		);
	});

	it("renders Tastik logo", () => {
		renderWithUser(<Hero />);
		const logo = screen.getByTestId("hero-logo");
		expect(logo).toHaveAttribute("alt", "Tastik");
	});
});
