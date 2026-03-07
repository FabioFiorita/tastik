import type { ListType } from "@/lib/types/list-type";

const labels: Record<ListType, string> = {
	simple: "Simple",
	calculator: "Calculator",
	stepper: "Stepper",
	kanban: "Kanban",
	multi: "Multi",
};

export function formatListType(type: ListType): string {
	return labels[type];
}
