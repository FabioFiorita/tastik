import { useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type KeyboardShortcut = {
	key: string;
	handler: () => void;
	ctrlKey?: boolean;
	metaKey?: boolean;
	shiftKey?: boolean;
	altKey?: boolean;
};

type UseKeyboardShortcutsOptions = {
	enabled?: boolean;
	ignoreInputFocus?: boolean;
};

export function useKeyboardShortcuts(
	shortcuts: KeyboardShortcut[],
	options: UseKeyboardShortcutsOptions = {},
) {
	const { enabled = true, ignoreInputFocus = false } = options;
	const isMobile = useIsMobile();

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const isSearchOpen = !!document.querySelector(".search-command-dialog");
			if (!enabled || isMobile || isSearchOpen) return;

			const target = event.target as HTMLElement;
			const isInputFocused =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable;

			if (isInputFocused && !ignoreInputFocus) return;

			for (const shortcut of shortcuts) {
				const keyMatches =
					event.key.toLowerCase() === shortcut.key.toLowerCase();
				const ctrlMatches = shortcut.ctrlKey
					? event.ctrlKey || event.metaKey
					: !event.ctrlKey && !event.metaKey;
				const shiftMatches = shortcut.shiftKey
					? event.shiftKey
					: !event.shiftKey;
				const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

				if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
					event.preventDefault();
					shortcut.handler();
					return;
				}
			}
		},
		[shortcuts, enabled, isMobile, ignoreInputFocus],
	);

	useEffect(() => {
		if (!enabled) return;

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown, enabled]);
}

export function useKeyboardShortcut(
	keyOrShortcut: string | Omit<KeyboardShortcut, "handler">,
	handler: () => void,
	options: UseKeyboardShortcutsOptions = {},
) {
	const shortcut =
		typeof keyOrShortcut === "string"
			? { key: keyOrShortcut, handler }
			: { ...keyOrShortcut, handler };
	useKeyboardShortcuts([shortcut], options);
}
