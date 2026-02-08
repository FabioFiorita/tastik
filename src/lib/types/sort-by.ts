import type { Infer } from "convex/values";
import type { sortByValidator } from "../../../convex/schema";

export type SortBy = Infer<typeof sortByValidator>;
