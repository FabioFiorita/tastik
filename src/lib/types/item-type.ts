import type { Infer } from "convex/values";
import type { itemTypeValidator } from "../../../convex/schema";

export type ItemType = Infer<typeof itemTypeValidator>;
