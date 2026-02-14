import * as React from "react";
import { MOBILE_BREAKPOINT } from "@/lib/constants/breakpoints";

function getMatches(): boolean {
	if (typeof window === "undefined" || !window.matchMedia) {
		return false;
	}
	return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}

export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState(getMatches);

	React.useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) {
			return;
		}

		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = (event: MediaQueryListEvent) => {
			setIsMobile(event.matches);
		};

		setIsMobile(mql.matches);
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	return isMobile;
}
