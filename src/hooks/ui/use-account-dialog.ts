let openAccountDialogFn: (() => void) | null = null;

export function registerAccountDialogOpener(fn: () => void) {
	openAccountDialogFn = fn;
	return () => {
		openAccountDialogFn = null;
	};
}

export function openAccountDialog() {
	openAccountDialogFn?.();
}
