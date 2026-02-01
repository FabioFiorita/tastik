import { MOBILE_BREAKPOINT } from "@/lib/constants/breakpoints";

export function getMatches(): boolean {
	if (typeof window === "undefined" || !window.matchMedia) {
		return false;
	}
	return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}
