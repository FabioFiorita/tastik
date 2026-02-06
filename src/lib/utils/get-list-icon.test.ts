import { describe, expect, it } from "vitest";
import { DEFAULT_LIST_ICON, LIST_ICON_OPTIONS } from "../constants/list-icons";
import { getListIcon } from "./get-list-icon";

describe("get-list-icon", () => {
	it("returns default icon when icon is undefined", () => {
		expect(getListIcon(undefined)).toBe(DEFAULT_LIST_ICON);
	});

	it("returns default icon when icon is null", () => {
		expect(getListIcon(null)).toBe(DEFAULT_LIST_ICON);
	});

	it("returns default icon when icon is empty string", () => {
		expect(getListIcon("")).toBe(DEFAULT_LIST_ICON);
	});

	it("returns emoji when icon name matches an option", () => {
		const option = LIST_ICON_OPTIONS[0];
		expect(getListIcon(option.name)).toBe(option.emoji);
	});

	it("returns emoji for Shopping icon", () => {
		expect(getListIcon("Shopping")).toBe("🛒");
	});

	it("returns emoji for Travel icon", () => {
		expect(getListIcon("Travel")).toBe("🧳");
	});

	it("returns default icon when icon name does not match any option", () => {
		expect(getListIcon("InvalidIcon")).toBe(DEFAULT_LIST_ICON);
	});

	it("returns custom emoji when icon contains no letters", () => {
		expect(getListIcon("🔥")).toBe("🔥");
	});

	it("returns custom emoji for numeric string", () => {
		expect(getListIcon("123")).toBe("123");
	});

	it("returns custom emoji for special characters", () => {
		expect(getListIcon("⭐")).toBe("⭐");
	});

	it("returns emoji for case-insensitive icon name", () => {
		const option = LIST_ICON_OPTIONS[0];
		expect(getListIcon(option.name.toLowerCase())).toBe(option.emoji);
	});
});
