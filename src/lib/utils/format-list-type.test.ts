import { formatListType } from "./format-list-type";

describe("formatListType", () => {
	it("formats simple", () => {
		expect(formatListType("simple")).toBe("Simple");
	});

	it("formats calculator", () => {
		expect(formatListType("calculator")).toBe("Calculator");
	});

	it("formats stepper", () => {
		expect(formatListType("stepper")).toBe("Stepper");
	});

	it("formats kanban", () => {
		expect(formatListType("kanban")).toBe("Kanban");
	});

	it("formats multi", () => {
		expect(formatListType("multi")).toBe("Multi");
	});
});
