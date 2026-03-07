import type { ReactNode } from "react";

type AuthPageCardProps = {
	title: string;
	description?: ReactNode;
	children: ReactNode;
};

export function AuthPageCard({
	title,
	description,
	children,
}: AuthPageCardProps) {
	return (
		<div className="mx-auto flex min-h-screen w-full max-w-lg items-center p-4">
			<div className="flex w-full flex-col gap-6 rounded-xl border bg-card p-8 shadow-sm">
				<div className="flex flex-col items-center gap-2 text-center">
					<img src="/logo.png" alt="Tastik" className="size-10 rounded-lg" />
					<h1 className="font-bold text-xl">{title}</h1>
					{description ? (
						<p className="text-muted-foreground text-sm">{description}</p>
					) : null}
				</div>
				{children}
			</div>
		</div>
	);
}
