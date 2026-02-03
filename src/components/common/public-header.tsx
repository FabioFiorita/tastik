import { Link } from "@tanstack/react-router";
import { AuthButton } from "@/components/common/auth-button";
import { ModeToggle } from "@/components/common/mode-toggle";

export function PublicHeader() {
	return (
		<header className="sticky top-0 z-50 w-full border-border/50 border-b bg-background/80 backdrop-blur-lg">
			<div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
				<Link
					to="/"
					className="flex items-center gap-3 transition-opacity hover:opacity-80"
				>
					<img src="/logo.png" alt="Tastik" className="h-10 w-10 rounded-lg" />
					<span className="font-semibold text-foreground text-xl">Tastik</span>
				</Link>

				<nav className="hidden items-center gap-6 md:flex">
					<Link
						to="/"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						Home
					</Link>
					<Link
						to="/support"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						Support
					</Link>
					<Link
						to="/privacy"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						Privacy
					</Link>
					<Link
						to="/terms"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
					>
						Terms
					</Link>
				</nav>

				<div className="flex items-center gap-3">
					<ModeToggle />
					<AuthButton />
				</div>
			</div>
		</header>
	);
}
