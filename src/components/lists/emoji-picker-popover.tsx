import { Plus } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

type EmojiPickerPopoverProps = {
	value?: string;
	onEmojiSelect?: (emoji: string) => void;
	className?: string;
};

export function EmojiPickerPopover({
	value,
	onEmojiSelect,
	className,
}: EmojiPickerPopoverProps) {
	const [open, setOpen] = React.useState(false);

	const handleSelect = React.useCallback(
		(payload: { emoji: string }) => {
			onEmojiSelect?.(payload.emoji);
			setOpen(false);
		},
		[onEmojiSelect],
	);

	const isCustomEmoji = Boolean(value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						type="button"
						variant="outline"
						size="icon"
						className={cn(
							"cursor-pointer bg-transparent",
							isCustomEmoji && "ring-2 ring-foreground ring-offset-2",
							className,
						)}
						aria-label="Add custom emoji"
						title="Add custom emoji"
						data-testid="emoji-picker-trigger"
					>
						{isCustomEmoji ? (
							<span className="text-lg leading-none">{value}</span>
						) : (
							<Plus className="size-4" />
						)}
					</Button>
				}
			/>
			<PopoverContent className="w-fit p-0" align="start">
				<EmojiPicker className="h-[342px]" onEmojiSelect={handleSelect}>
					<EmojiPickerSearch />
					<EmojiPickerContent />
					<EmojiPickerFooter />
				</EmojiPicker>
			</PopoverContent>
		</Popover>
	);
}
