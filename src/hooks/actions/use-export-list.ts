import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { trackListExported } from "@/lib/metrics";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function useExportList(listId: Id<"lists">, listName: string) {
	const { convexClient } = useRouteContext({ from: "__root__" });
	const [isPending, setIsPending] = useState(false);

	const exportList = async (format: "txt" | "md" | "csv") => {
		setIsPending(true);
		try {
			// Use ConvexClient to call query (not useQuery hook)
			const content = await convexClient.query(api.lists.exportList, {
				listId,
				format,
			});

			// Trigger download
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
		} catch (error) {
			trackListExported("failure");
			toast.error(getErrorMessage(error, "Failed to export list"));
		} finally {
			setIsPending(false);
		}
	};

	return { exportList, isPending };
}
