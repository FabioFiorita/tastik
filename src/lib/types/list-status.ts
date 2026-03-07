import type { Infer } from "convex/values";
import type { listStatusValidator } from "../../../convex/schema";

export type ListStatus = Infer<typeof listStatusValidator>;
