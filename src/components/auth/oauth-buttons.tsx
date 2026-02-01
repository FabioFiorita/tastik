import { useState } from "react";
import { Apple } from "@/components/icons/apple";
import { Google } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";
import { getErrorMessage } from "@/lib/utils/get-error-message";

type OAuthProvider = "google" | "apple";

type OAuthButtonsProps = {
	onError: (error: string) => void;
	disabled?: boolean;
	className?: string;
} & Omit<React.ComponentProps<"div">, "onError">;

export function OAuthButtons({
	onError,
	disabled = false,
	className,
	...props
}: OAuthButtonsProps) {
	const { signIn } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleOAuthSignIn = async (provider: OAuthProvider) => {
		setIsLoading(true);
		onError("");
		try {
			await signIn(provider);
		} catch (err) {
			onError(
				getErrorMessage(
					err,
					provider === "google"
						? "Failed to sign in with Google"
						: "Failed to sign in with Apple",
				),
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-3", className)} {...props}>
			<Button
				variant="outline"
				size="lg"
				type="button"
				onClick={() => handleOAuthSignIn("google")}
				disabled={disabled || isLoading}
				className="w-full"
			>
				<Google className="size-5" />
				Continue with Google
			</Button>
			<Button
				variant="outline"
				size="lg"
				type="button"
				onClick={() => handleOAuthSignIn("apple")}
				disabled={disabled || isLoading}
				className="w-full"
			>
				<Apple className="size-5" />
				Continue with Apple
			</Button>
		</div>
	);
}
