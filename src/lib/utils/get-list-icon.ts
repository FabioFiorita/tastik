import { DEFAULT_LIST_ICON, LIST_ICON_OPTIONS } from "../constants/list-icons";

export function getListIcon(icon?: string | null) {
	if (!icon) return DEFAULT_LIST_ICON;
	if (!/[A-Za-z]/.test(icon)) return icon;
	return (
		LIST_ICON_OPTIONS.find((option) => option.name === icon)?.emoji ??
		DEFAULT_LIST_ICON
	);
}
