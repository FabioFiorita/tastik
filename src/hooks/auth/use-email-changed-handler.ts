import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import {
	AUTH_STATE_QUERY_KEY,
	authStateQueryOptions,
} from "@/hooks/queries/use-auth-state";
import { openAccountDialog } from "@/hooks/ui/use-account-dialog";
import { authClient } from "@/lib/auth-client";

export function useEmailChangedHandler() {
	const { emailChanged } = useSearch({ from: "/_protected/home" });
	const navigate = useNavigate();
	const router = useRouter();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!emailChanged) return;

		async function handleEmailChanged() {
			await authClient.getSession({
				query: { disableCookieCache: true },
			});
			await queryClient.invalidateQueries({
				queryKey: AUTH_STATE_QUERY_KEY,
				refetchType: "none",
			});
			await queryClient.fetchQuery(authStateQueryOptions());
			await router.invalidate();

			toast.success("Email changed successfully");
			navigate({ to: "/home", replace: true });
			openAccountDialog();
		}

		handleEmailChanged();
	}, [emailChanged, navigate, router, queryClient]);
}
