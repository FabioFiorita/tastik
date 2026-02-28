import type { ReactElement, ReactNode } from "react";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from "@/components/common/responsive-dialog";
import { Button } from "@/components/ui/button";

export type FormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	trigger?: ReactElement;
	title: string;
	description: string;
	formId: string;
	submitLabel: string;
	isPending: boolean;
	cancelTestId: string;
	submitTestId: string;
	footerStartContent?: ReactNode;
	children: ReactNode;
};

export function FormDialog({
	open,
	onOpenChange,
	trigger,
	title,
	description,
	formId,
	submitLabel,
	isPending,
	cancelTestId,
	submitTestId,
	footerStartContent,
	children,
}: FormDialogProps) {
	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			{trigger && <ResponsiveDialogTrigger render={trigger} />}
			<ResponsiveDialogContent>
				<ResponsiveDialogHeader className="shrink-0">
					<ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{description}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 [-webkit-overflow-scrolling:touch]">
					{children}
				</div>
				<ResponsiveDialogFooter className="shrink-0">
					{footerStartContent}
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						data-testid={cancelTestId}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form={formId}
						disabled={isPending}
						data-testid={submitTestId}
					>
						{submitLabel}
					</Button>
				</ResponsiveDialogFooter>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
