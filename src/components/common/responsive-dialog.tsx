import type * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils/cn";

function ResponsiveDialog({ ...props }: React.ComponentProps<typeof Dialog>) {
	return <Dialog data-slot="responsive-dialog" {...props} />;
}

function ResponsiveDialogTrigger({
	...props
}: React.ComponentProps<typeof DialogTrigger>) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return <SheetTrigger {...props} />;
	}

	return <DialogTrigger {...props} />;
}

function ResponsiveDialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DialogContent>) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<SheetContent
				side="bottom"
				showCloseButton={showCloseButton}
				className={cn(
					"flex max-h-[85vh] min-h-0 flex-col overflow-hidden p-6",
					className,
				)}
				{...props}
			>
				{children}
			</SheetContent>
		);
	}

	return (
		<DialogContent
			className={cn(
				"flex max-h-[85vh] min-h-0 flex-col overflow-hidden",
				className,
			)}
			showCloseButton={showCloseButton}
			{...props}
		>
			{children}
		</DialogContent>
	);
}

function ResponsiveDialogHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return <SheetHeader className={className} {...props} />;
	}

	return <DialogHeader className={className} {...props} />;
}

function ResponsiveDialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<"div"> & {
	showCloseButton?: boolean;
}) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<SheetFooter className={className} {...props}>
				{children}
			</SheetFooter>
		);
	}

	return (
		<DialogFooter
			className={className}
			showCloseButton={showCloseButton}
			{...props}
		>
			{children}
		</DialogFooter>
	);
}

function ResponsiveDialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogTitle>) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return <SheetTitle className={className} {...props} />;
	}

	return <DialogTitle className={className} {...props} />;
}

function ResponsiveDialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogDescription>) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return <SheetDescription className={className} {...props} />;
	}

	return <DialogDescription className={className} {...props} />;
}

export {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
};
