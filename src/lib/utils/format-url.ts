const MAX_LENGTH = 40;

export function formatUrl(url: string): string {
	try {
		const parsed = new URL(url);
		const display = parsed.hostname + parsed.pathname.replace(/\/$/, "");
		return display.length > MAX_LENGTH
			? `${display.slice(0, MAX_LENGTH)}...`
			: display;
	} catch {
		return url.length > MAX_LENGTH ? `${url.slice(0, MAX_LENGTH)}...` : url;
	}
}
