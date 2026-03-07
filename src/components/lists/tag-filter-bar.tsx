import { Button } from "@/components/ui/button";
import type { ListTagDoc, ListTagId } from "@/lib/types/convex";

type TagFilterBarProps = {
	tags: ListTagDoc[];
	selectedTagId: ListTagId | null;
	onSelect: (tagId: ListTagId | null) => void;
};

export function TagFilterBar({
	tags,
	selectedTagId,
	onSelect,
}: TagFilterBarProps) {
	if (tags.length === 0) return null;

	return (
		<div
			className="flex gap-2 overflow-x-auto pb-1"
			data-testid="tag-filter-bar"
		>
			<Button
				size="sm"
				variant={selectedTagId === null ? "default" : "outline"}
				onClick={() => onSelect(null)}
				data-testid="tag-filter-all"
			>
				All
			</Button>
			{tags.map((tag) => (
				<Button
					key={tag._id}
					size="sm"
					variant={selectedTagId === tag._id ? "default" : "outline"}
					onClick={() => onSelect(tag._id)}
					data-testid={`tag-filter-${tag._id}`}
					className="shrink-0"
				>
					{tag.color && (
						<span
							className="size-2 rounded-full"
							style={{ backgroundColor: tag.color }}
						/>
					)}
					{tag.name}
				</Button>
			))}
		</div>
	);
}
