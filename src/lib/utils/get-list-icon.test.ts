import { DEFAULT_LIST_ICON } from "@/lib/constants/list-icons";
import { getListIcon } from "./get-list-icon";

describe("getListIcon", () => {
	it("returns default icon for undefined input", () => {
		expect(getListIcon(undefined)).toBe(DEFAULT_LIST_ICON);
	});

	it("returns default icon for null input", () => {
		expect(getListIcon(null)).toBe(DEFAULT_LIST_ICON);
	});

	it("returns the emoji directly when input contains no letters (is already an emoji)", () => {
		expect(getListIcon("🛒")).toBe("🛒");
	});

	it("resolves a known icon name to its emoji", () => {
		expect(getListIcon("Shopping")).toBe("🛒");
	});

	it("returns default icon for an unknown name", () => {
		expect(getListIcon("Unknown")).toBe(DEFAULT_LIST_ICON);
	});

	it("resolves the default icon name correctly", () => {
		expect(getListIcon("Checklist")).toBe("✅");
	});
});
