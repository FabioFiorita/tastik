export function getInitials(str: string): string {
	return str
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.slice(0, 2)
		.toUpperCase();
}
