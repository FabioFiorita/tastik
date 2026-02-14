import type { Infer } from "convex/values";
import type { itemStatusValidator } from "../../../convex/schema";

export type ItemStatus = Infer<typeof itemStatusValidator>;
