import type { Id } from "../../../convex/_generated/dataModel";

export interface EditorInfo {
	_id: Id<"listEditors">;
	nickname?: string;
	user: {
		_id: string;
		email?: string;
		name?: string;
	} | null;
}
