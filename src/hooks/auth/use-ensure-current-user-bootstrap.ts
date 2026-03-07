import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function useEnsureCurrentUserBootstrap() {
	const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
	const hasBootstrapped = useRef(false);

	useEffect(() => {
		if (hasBootstrapped.current) return;
		hasBootstrapped.current = true;
		ensureCurrentUser({}).catch(() => {
			toast.error(
				"Signed in, but we could not finish account setup. Please refresh if this persists.",
			);
		});
	}, [ensureCurrentUser]);
}
