import { AuthPageCard } from "@/components/auth/auth-page-card";
import { Spinner } from "@/components/ui/spinner";

type AuthTransitionScreenProps = {
	title?: string;
	description?: string;
};

export function AuthTransitionScreen({
	title = "Signing you in",
	description = "Preparing your account...",
}: AuthTransitionScreenProps) {
	return (
		<AuthPageCard title={title} description={description}>
			<div
				className="flex items-center justify-center py-6"
				data-testid="auth-transition-screen"
			>
				<Spinner className="size-5 text-muted-foreground" />
			</div>
		</AuthPageCard>
	);
}
