import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@/test-utils";
import {
	useKeyboardShortcut,
	useKeyboardShortcuts,
} from "./use-keyboard-shortcut";

vi.mock("@/hooks/use-mobile", () => ({
	useIsMobile: vi.fn(() => false),
}));

describe("use-keyboard-shortcut", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		document.querySelector(".search-command-dialog")?.remove();
	});

	describe("useKeyboardShortcuts", () => {
		it("calls handler when matching shortcut is pressed", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([{ key: "k", ctrlKey: true, handler }]),
			);

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).toHaveBeenCalledTimes(1);
		});

		it("does not call handler when key does not match", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([{ key: "k", ctrlKey: true, handler }]),
			);

			const event = new KeyboardEvent("keydown", {
				key: "j",
				ctrlKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).not.toHaveBeenCalled();
		});

		it("does not call handler when modifier keys do not match", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([{ key: "k", ctrlKey: true, handler }]),
			);

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: false,
			});
			window.dispatchEvent(event);

			expect(handler).not.toHaveBeenCalled();
		});

		it("works with metaKey as ctrlKey alternative", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([{ key: "k", ctrlKey: true, handler }]),
			);

			const event = new KeyboardEvent("keydown", {
				key: "k",
				metaKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).toHaveBeenCalledTimes(1);
		});

		it("handles shiftKey modifier", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([
					{ key: "k", ctrlKey: true, shiftKey: true, handler },
				]),
			);

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: true,
				shiftKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).toHaveBeenCalledTimes(1);
		});

		it("handles altKey modifier", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([
					{ key: "k", ctrlKey: true, altKey: true, handler },
				]),
			);

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: true,
				altKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).toHaveBeenCalledTimes(1);
		});

		it("does not call handler when input is focused", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([{ key: "k", ctrlKey: true, handler }]),
			);

			const input = document.createElement("input");
			document.body.appendChild(input);
			input.focus();

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: true,
			});
			input.dispatchEvent(event);

			expect(handler).not.toHaveBeenCalled();
			document.body.removeChild(input);
		});

		it("calls handler when input is focused and ignoreInputFocus is true", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([{ key: "k", ctrlKey: true, handler }], {
					ignoreInputFocus: true,
				}),
			);

			const input = document.createElement("input");
			document.body.appendChild(input);
			input.focus();

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).toHaveBeenCalledTimes(1);
			document.body.removeChild(input);
		});

		it("does not call handler when search command dialog is open", () => {
			const handler = vi.fn();
			const dialog = document.createElement("div");
			dialog.className = "search-command-dialog";
			document.body.appendChild(dialog);

			renderHook(() =>
				useKeyboardShortcuts([{ key: "k", ctrlKey: true, handler }]),
			);

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).not.toHaveBeenCalled();
			document.body.removeChild(dialog);
		});

		it("does not call handler when disabled", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([{ key: "k", ctrlKey: true, handler }], {
					enabled: false,
				}),
			);

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).not.toHaveBeenCalled();
		});

		it("is case-insensitive for key matching", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcuts([{ key: "k", ctrlKey: true, handler }]),
			);

			const event = new KeyboardEvent("keydown", {
				key: "K",
				ctrlKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).toHaveBeenCalledTimes(1);
		});
	});

	describe("useKeyboardShortcut", () => {
		it("calls handler when matching shortcut is pressed with string key", () => {
			const handler = vi.fn();
			renderHook(() => useKeyboardShortcut("k", handler));

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: false,
				metaKey: false,
			});
			window.dispatchEvent(event);

			expect(handler).toHaveBeenCalledTimes(1);
		});

		it("calls handler when matching shortcut is pressed with shortcut object", () => {
			const handler = vi.fn();
			renderHook(() =>
				useKeyboardShortcut({ key: "k", ctrlKey: true }, handler),
			);

			const event = new KeyboardEvent("keydown", {
				key: "k",
				ctrlKey: true,
			});
			window.dispatchEvent(event);

			expect(handler).toHaveBeenCalledTimes(1);
		});
	});
});
