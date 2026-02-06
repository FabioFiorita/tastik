export function getUserInitials(name?: string, email?: string): string {
	if (name) {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
	if (email) {
		return email[0].toUpperCase();
	}
	return "U";
}
