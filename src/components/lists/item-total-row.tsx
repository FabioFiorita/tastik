import { MinusCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const numberFormatter = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 2,
});

type ItemTotalRowProps = {
	total: number;
};

export function ItemTotalRow({ total }: ItemTotalRowProps) {
	const isNegative = total < 0;
	const Icon = isNegative ? MinusCircle : PlusCircle;

	return (
		<div
			className="rounded-lg border bg-muted/20 px-3 py-2"
			data-testid="item-total-row"
		>
			<div className="flex items-center justify-between gap-3">
				<span className="font-semibold text-muted-foreground text-sm">
					Total
				</span>
				<div className="flex items-center gap-2 font-semibold text-sm tabular-nums">
					<Icon
						className={cn(
							"size-4",
							isNegative ? "text-rose-500" : "text-primary",
						)}
					/>
					<span data-testid="item-total-value">
						{numberFormatter.format(Math.abs(total))}
					</span>
				</div>
			</div>
		</div>
	);
}
