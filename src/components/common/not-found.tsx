import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type * as React from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { LEGAL_CONTACT } from "@/lib/constants/legal";
import { cn } from "@/lib/utils/cn";

type NotFoundPageProps = {
	className?: string;
};

export function NotFoundPage({ className }: NotFoundPageProps) {
	const navigate = useNavigate();

	const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const rawQuery = String(formData.get("path") ?? "").trim();

		if (!rawQuery) {
			return;
		}

		const targetPath = rawQuery.startsWith("/") ? rawQuery : `/${rawQuery}`;
		navigate({ to: targetPath });
	};

	return (
		<div
			className={cn(
				"flex min-h-svh items-center justify-center bg-muted/40 p-6",
				className,
			)}
		>
			<div className="w-full max-w-md rounded-2xl border bg-linear-to-b from-background via-background to-muted/30 p-8 text-center shadow-sm">
				<div className="mx-auto flex max-w-sm flex-col items-center gap-3">
					<h1
						className="font-semibold text-lg tracking-tight"
						data-testid="not-found-heading"
					>
						404 - Not Found
					</h1>
					<p
						className="text-balance text-muted-foreground text-sm"
						data-testid="not-found-description"
					>
						The page you're looking for doesn't exist.
					</p>
					<p className="text-balance text-muted-foreground text-sm">
						Try searching for what you need below.
					</p>
					<form
						className="mt-2 w-full"
						onSubmit={handleSubmit}
						data-testid="not-found-search-form"
					>
						<InputGroup className="h-10 bg-background/70">
							<InputGroupAddon>
								<Search className="size-4" />
							</InputGroupAddon>
							<InputGroupInput
								name="path"
								type="search"
								autoComplete="off"
								placeholder="Try searching for pages."
								aria-label="Search for pages"
								data-testid="not-found-search-input"
							/>
							<InputGroupAddon align="inline-end">
								<kbd className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 font-semibold text-muted-foreground text-xs">
									/
								</kbd>
							</InputGroupAddon>
						</InputGroup>
					</form>
					<p className="mt-1 text-muted-foreground text-xs">
						Need help?{" "}
						<a
							className="font-medium text-foreground underline underline-offset-4"
							href={`mailto:${LEGAL_CONTACT.supportEmail}`}
							data-testid="not-found-support-link"
						>
							Contact support
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
