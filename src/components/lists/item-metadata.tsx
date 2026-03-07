import { Link2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatUrl } from "@/lib/utils/format-url";

type ItemMetadataProps = {
	description?: string;
	tagName?: string;
	url?: string;
};

export function ItemMetadata({ description, tagName, url }: ItemMetadataProps) {
	if (!description && !tagName && !url) return null;

	return (
		<div
			className="flex min-w-0 flex-col gap-1.5 text-muted-foreground text-xs"
			data-testid="item-metadata"
		>
			{(url || tagName) && (
				<div className="flex min-w-0 flex-wrap items-center gap-1.5 overflow-hidden">
					{tagName && (
						<Badge variant="outline" data-testid="item-tag">
							<Tag className="size-3" />
							{tagName}
						</Badge>
					)}
					{url && (
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							className="min-w-0 max-w-full shrink overflow-hidden"
							data-testid="item-url"
						>
							<Badge
								variant="outline"
								className="min-w-0 max-w-full shrink overflow-hidden"
							>
								<Link2 className="size-3 shrink-0" />
								<span className="min-w-0 truncate">{formatUrl(url)}</span>
							</Badge>
						</a>
					)}
				</div>
			)}
			{description && (
				<span className="whitespace-pre-wrap" data-testid="item-description">
					{description}
				</span>
			)}
		</div>
	);
}
