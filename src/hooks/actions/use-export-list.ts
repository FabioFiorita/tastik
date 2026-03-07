import { useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import { trackListExported } from "@/lib/metrics";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useHandleMutationError } from "./use-handle-mutation-error";
import { useManagedAction } from "./use-managed-action";

export function useExportList(listId: Id<"lists">, listName: string) {
	const { convexClient } = useRouteContext({ from: "__root__" });
	const handleMutationError = useHandleMutationError();
	const { runAction, isPending } = useManagedAction();

	const exportList = async (format: "txt" | "md" | "csv") => {
		await runAction(
			() =>
				convexClient.query(api.lists.exportList, {
					listId,
					format,
				}),
			{
				onSuccess: (content) => {
					const mimeTypes = {
						txt: "text/plain",
						md: "text/markdown",
						csv: "text/csv",
					};

					const blob = new Blob([content], { type: mimeTypes[format] });
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `${listName}.${format}`;
					a.click();
					URL.revokeObjectURL(url);
					trackListExported("success");
					toast.success(`Exported as ${format.toUpperCase()}`);
				},
				onError: (error) => {
					trackListExported("failure");
					handleMutationError(error, "Failed to export list");
				},
			},
		);
	};

	return { exportList, isPending };
}
