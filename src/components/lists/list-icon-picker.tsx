import { EmojiPickerPopover } from "@/components/lists/emoji-picker-popover";
import { Button } from "@/components/ui/button";
import { LIST_ICON_OPTIONS } from "@/lib/constants/list-icons";
import { cn } from "@/lib/utils/cn";
import { getListIcon } from "@/lib/utils/get-list-icon";

type ListIconPickerProps = {
	value?: string;
	onChange: (value: string) => void;
};

const PRESET_EMOJIS = new Set<string>(LIST_ICON_OPTIONS.map((o) => o.emoji));

export function ListIconPicker({ value, onChange }: ListIconPickerProps) {
	const displayValue = getListIcon(value);
	const isCustomEmoji =
		typeof value === "string" &&
		value.length > 0 &&
		!PRESET_EMOJIS.has(value) &&
		!/[A-Za-z]/.test(value);

	return (
		<div className="flex flex-wrap gap-2">
			{LIST_ICON_OPTIONS.map((option) => (
				<Button
					key={option.emoji}
					type="button"
					variant="outline"
					size="icon"
					className={cn(
						"size-9 text-lg",
						displayValue === option.emoji &&
							"ring-2 ring-foreground ring-offset-2",
					)}
					aria-label={option.name}
					title={option.name}
					data-testid={`list-icon-${option.name.toLowerCase()}`}
					onClick={() => onChange(option.emoji)}
				>
					{option.emoji}
				</Button>
			))}
			<EmojiPickerPopover
				value={isCustomEmoji ? value : undefined}
				onEmojiSelect={onChange}
				className="size-9"
			/>
		</div>
	);
}
