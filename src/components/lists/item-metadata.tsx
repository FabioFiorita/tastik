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
			className="flex flex-col gap-1.5 text-muted-foreground text-xs"
			data-testid="item-metadata"
		>
			{(url || tagName) && (
				<div className="flex flex-wrap items-center gap-1.5">
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
							data-testid="item-url"
						>
							<Badge variant="outline">
								<Link2 className="size-3" />
								{formatUrl(url)}
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
