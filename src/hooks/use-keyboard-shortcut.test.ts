import { renderHook } from "@/test-utils";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";

vi.mock("@/hooks/use-mobile", () => ({
	useIsMobile: () => false,
}));

function press(key: string, target: EventTarget = window) {
	target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("useKeyboardShortcut", () => {
	it("calls handler when the matching key is pressed", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut("c", handler));

		press("c");

		expect(handler).toHaveBeenCalledOnce();
	});

	it("does not call handler for a different key", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut("c", handler));

		press("x");

		expect(handler).not.toHaveBeenCalled();
	});

	it("is case-insensitive", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut("c", handler));

		press("C");

		expect(handler).toHaveBeenCalledOnce();
	});

	it("does not call handler when disabled", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut("c", handler, { enabled: false }));

		press("c");

		expect(handler).not.toHaveBeenCalled();
	});

	it("does not fire when an input element is focused", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut("c", handler));

		const input = document.createElement("input");
		document.body.appendChild(input);
		press("c", input);
		document.body.removeChild(input);

		expect(handler).not.toHaveBeenCalled();
	});

	it("fires when an input is focused but ignoreInputFocus is true", () => {
		const handler = vi.fn();
		renderHook(() =>
			useKeyboardShortcut("c", handler, { ignoreInputFocus: true }),
		);

		const input = document.createElement("input");
		document.body.appendChild(input);
		press("c", input);
		document.body.removeChild(input);

		expect(handler).toHaveBeenCalledOnce();
	});
});
