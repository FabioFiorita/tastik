import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ListsView } from "@/components/lists/lists-view";

const homeSearchSchema = z.object({
	emailChanged: z.boolean().optional().catch(undefined),
});

export const Route = createFileRoute("/_protected/home")({
	component: ListsView,
	validateSearch: homeSearchSchema,
});
