import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type * as React from "react";
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils/cn";

function ResponsiveDialog({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="responsive-dialog" {...props} />;
}

function ResponsiveDialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return <SheetTrigger {...props} />;
	}

	return <DialogTrigger {...props} />;
}

function ResponsiveDialogClose({ ...props }: DialogPrimitive.Close.Props) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return <SheetClose {...props} />;
	}

	return <DialogClose {...props} />;
}

function ResponsiveDialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: DialogPrimitive.Popup.Props & {
	showCloseButton?: boolean;
}) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<SheetContent
				side="bottom"
				showCloseButton={showCloseButton}
				className={cn("max-h-[85vh] overflow-y-auto p-6", className)}
				{...props}
			>
				{children}
			</SheetContent>
		);
	}

	return (
		<DialogContent showCloseButton={showCloseButton} {...props}>
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
}: DialogPrimitive.Title.Props) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return <SheetTitle className={className} {...props} />;
	}

	return <DialogTitle className={className} {...props} />;
}

function ResponsiveDialogDescription({
	className,
	...props
}: DialogPrimitive.Description.Props) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return <SheetDescription className={className} {...props} />;
	}

	return <DialogDescription className={className} {...props} />;
}

export {
	ResponsiveDialog,
	ResponsiveDialogClose,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
};
