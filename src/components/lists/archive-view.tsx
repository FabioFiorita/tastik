import { Archive, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { useRestoreList } from "@/hooks/actions/use-restore-list";
import { useUserLists } from "@/hooks/queries/use-user-lists";
import type { ListType } from "@/lib/types/list-type";
import { formatListType } from "@/lib/utils/format-list-type";
import { getListIcon } from "@/lib/utils/get-list-icon";
import type { Id } from "../../../convex/_generated/dataModel";

type ArchiveList = {
	_id: Id<"lists">;
	name: string;
	icon?: string;
	type: ListType;
	isOwner: boolean;
};

function ArchiveListRow({
	list,
	onRestore,
	disabled,
}: {
	list: ArchiveList;
	onRestore: () => void;
	disabled: boolean;
}) {
	return (
		<div
			className="flex items-center gap-3 rounded-xl border bg-background p-4 transition hover:bg-muted/30"
			data-testid={`archive-list-row-${list._id}`}
		>
			<span className="text-2xl">{getListIcon(list.icon)}</span>
			<span className="flex-1 truncate">{list.name}</span>
			<Badge variant="secondary" className="shrink-0 text-xs">
				{formatListType(list.type)}
			</Badge>
			{list.isOwner && (
				<Button
					variant="ghost"
					size="icon"
					onClick={onRestore}
					disabled={disabled}
					aria-label="Restore list"
					data-testid={`restore-list-${list._id}`}
				>
					<RotateCcw className="size-4" />
				</Button>
			)}
		</div>
	);
}

export function ArchiveView() {
	const lists = useUserLists("archived");
	const { restoreList, isPending } = useRestoreList();

	if (!lists) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					Archived Lists
				</h1>
				<p className="text-muted-foreground text-sm">
					Restore archived lists to make them active again
				</p>
			</div>

			{lists.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Archive />
						</EmptyMedia>
						<EmptyTitle>No archived lists</EmptyTitle>
						<EmptyDescription>
							Lists you archive will appear here
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="space-y-2">
					{lists.map((list) => (
						<ArchiveListRow
							key={list._id}
							list={list}
							onRestore={() => restoreList({ listId: list._id })}
							disabled={isPending}
						/>
					))}
				</div>
			)}
		</div>
	);
}
