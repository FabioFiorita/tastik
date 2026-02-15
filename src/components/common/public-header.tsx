import { Link } from "@tanstack/react-router";
import { AuthButton } from "@/components/common/auth-button";
import { ModeToggle } from "@/components/common/mode-toggle";
import { useIsAuthenticated } from "@/hooks/use-is-authenticated";

export function PublicHeader() {
	const isAuthenticated = useIsAuthenticated();

	return (
		<header
			className="sticky top-0 z-50 w-full border-border/50 border-b bg-background/80 backdrop-blur-lg"
			data-testid="public-header"
		>
			<div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
				<Link
					to="/"
					className="flex items-center gap-3 transition-opacity hover:opacity-80"
					data-testid="public-header-logo"
				>
					<img src="/logo.png" alt="Tastik" className="h-10 w-10 rounded-lg" />
					<span className="font-semibold text-foreground text-xl">Tastik</span>
				</Link>

				<nav className="hidden items-center gap-6 md:flex">
					<Link
						to="/"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
						data-testid="public-header-link-home"
					>
						Home
					</Link>
					<Link
						to="/support"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
						data-testid="public-header-link-support"
					>
						Support
					</Link>
					<Link
						to="/privacy"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
						data-testid="public-header-link-privacy"
					>
						Privacy
					</Link>
					<Link
						to="/terms"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
						data-testid="public-header-link-terms"
					>
						Terms
					</Link>
				</nav>

				<div className="flex items-center gap-3">
					{!isAuthenticated && <ModeToggle />}
					<AuthButton />
				</div>
			</div>
		</header>
	);
}
