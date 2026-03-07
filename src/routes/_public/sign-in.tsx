import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthPageCard } from "@/components/auth/auth-page-card";
import { AuthProviderButtons } from "@/components/auth/auth-provider-buttons";
import { AuthTransitionScreen } from "@/components/common/auth-transition-screen";
import { LastUsedBadge } from "@/components/last-used-badge";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthTransitionCoordinator } from "@/hooks/auth/use-auth-transition-coordinator";
import { useLastLoginMethod } from "@/hooks/auth/use-last-login-method";
import { authClient } from "@/lib/auth-client";
import { loadAuthState } from "@/lib/auth-routing";
import { cn } from "@/lib/utils/cn";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export const Route = createFileRoute("/_public/sign-in")({
	beforeLoad: async ({ context }) => {
		const { isAuthenticated } = await loadAuthState(context);

		if (isAuthenticated) {
			throw redirect({ to: "/home" });
		}
	},
	component: SignInPage,
});

export function SignInPage() {
	const navigate = useNavigate();
	const { syncAfterSignIn } = useAuthTransitionCoordinator();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const { lastLoginMethod, isLastLoginMethod } = useLastLoginMethod();

	const completeSignIn = useCallback(async () => {
		setIsTransitioning(true);
		try {
			await syncAfterSignIn();
			navigate({ to: "/home", replace: true });
		} catch (error) {
			setIsTransitioning(false);
			toast.error(getErrorMessage(error, "Unable to finalize sign in"));
		}
	}, [navigate, syncAfterSignIn]);

	useEffect(() => {
		let isMounted = true;
		if (typeof PublicKeyCredential === "undefined") return;
		const check = PublicKeyCredential.isConditionalMediationAvailable?.();
		if (typeof check?.then !== "function") return;
		check.then((available) => {
			if (!available || !isMounted) return;
			authClient.signIn
				.passkey({ autoFill: true })
				.then((result) => {
					if (!isMounted || result?.error) return;
					return completeSignIn();
				})
				.catch(() => {});
		});
		return () => {
			isMounted = false;
		};
	}, [completeSignIn]);

	if (isTransitioning) {
		return <AuthTransitionScreen />;
	}

	const handleEmailSignIn = async (
		event: React.SyntheticEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setIsPending(true);
		try {
			const result = await authClient.signIn.email(
				{ email, password, callbackURL: "/" },
				{
					onSuccess(context) {
						const data = context.data as
							| { twoFactorRedirect?: boolean }
							| undefined;
						if (data?.twoFactorRedirect) {
							navigate({ to: "/2fa" });
						}
					},
					onError(context) {
						if (context.error.status === 403) {
							toast.error(
								"Please verify your email address. Check your inbox for the verification link.",
							);
						}
					},
				},
			);

			if (result.error) {
				const message =
					result.error.status === 403
						? "Please verify your email address. Check your inbox for the verification link."
						: (result.error.message ?? "Unable to sign in");
				toast.error(message);
				return;
			}

			const data = result.data as { twoFactorRedirect?: boolean } | undefined;
			if (!data?.twoFactorRedirect) {
				await completeSignIn();
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to sign in"));
		} finally {
			setIsPending(false);
		}
	};

	const handlePasskeySignIn = async () => {
		setIsPending(true);
		try {
			const result = await authClient.signIn.passkey();

			if (result?.error) {
				toast.error(result.error.message ?? "Unable to sign in with passkey");
				return;
			}

			await completeSignIn();
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to sign in"));
		} finally {
			setIsPending(false);
		}
	};

	const handleSocialSignIn = async (
		provider: "google" | "apple" | "github",
	) => {
		setIsPending(true);
		try {
			const result = await authClient.signIn.social({
				provider,
				callbackURL: "/",
			});

			if (result.error) {
				toast.error(result.error.message ?? "Unable to sign in");
			}
		} catch (error) {
			toast.error(getErrorMessage(error, "Unable to sign in"));
		} finally {
			setIsPending(false);
		}
	};

	const hasLastLoginMethod = lastLoginMethod !== null;
	const emailIsLastUsed = isLastLoginMethod("email");
	const lastUsedProvider =
		(["passkey", "google", "apple", "github"] as const).find((provider) =>
			isLastLoginMethod(provider),
		) ?? null;
	const getAuthMethodClassName = (isLastUsed: boolean) =>
		hasLastLoginMethod && !isLastUsed ? "opacity-75" : undefined;

	return (
		<AuthPageCard
			title="Welcome to Tastik"
			description="Sign in with Google, Apple, or GitHub in one tap"
		>
			<form onSubmit={handleEmailSignIn}>
				<FieldGroup>
					<Field>
						<AuthProviderButtons
							mode="sign-in"
							isPending={isPending}
							priority="primary"
							lastUsedProvider={lastUsedProvider}
							onProviderClick={(provider) => {
								if (provider === "passkey") {
									handlePasskeySignIn();
									return;
								}
								handleSocialSignIn(provider);
							}}
						/>
					</Field>
					<FieldSeparator>Or continue with email</FieldSeparator>
					<Field>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
							autoComplete="username webauthn"
							data-testid="sign-in-email-input"
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
							autoComplete="current-password webauthn"
							data-testid="sign-in-password-input"
						/>
					</Field>
					<Field>
						<Button
							type="submit"
							variant="default"
							className={cn(
								"relative w-full",
								getAuthMethodClassName(emailIsLastUsed),
							)}
							disabled={isPending}
							data-testid="sign-in-submit"
						>
							Sign in with email
							{emailIsLastUsed ? (
								<LastUsedBadge data-testid="sign-in-last-used-email" />
							) : null}
						</Button>
					</Field>
					<Field>
						<Link
							to="/request-reset-password"
							className="text-muted-foreground text-sm underline"
							data-testid="sign-in-forgot-password"
						>
							Forgot password?
						</Link>
					</Field>
				</FieldGroup>
			</form>
			<p className="text-center text-muted-foreground text-sm">
				Don&apos;t have an account?{" "}
				<Link to="/sign-up" className="underline">
					Sign up
				</Link>
			</p>
			<p className="px-6 text-center text-muted-foreground text-xs">
				By clicking continue, you agree to our{" "}
				<Link to="/terms">Terms of Service</Link> and{" "}
				<Link to="/privacy">Privacy Policy</Link>.
			</p>
		</AuthPageCard>
	);
}
