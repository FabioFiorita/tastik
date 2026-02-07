import type { Infer } from "convex/values";
import type { listTypeValidator } from "../../../convex/schema";

export type ListType = Infer<typeof listTypeValidator>;
