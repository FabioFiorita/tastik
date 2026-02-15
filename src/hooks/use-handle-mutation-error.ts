import { useNavigate } from "@tanstack/react-router";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import {
	type AppErrorData,
	ERROR_CODES,
	isAppErrorData,
} from "../../convex/lib/errors";
import { getErrorMessage } from "../lib/utils/get-error-message";

type HandleMutationErrorOptions = {
	beforeToast?: (data: AppErrorData) => boolean;
};

export function useHandleMutationError() {
	const navigate = useNavigate();

	return function handleMutationError(
		error: unknown,
		fallback: string,
		options?: HandleMutationErrorOptions,
	) {
		if (error instanceof ConvexError && isAppErrorData(error.data)) {
			const data = error.data;

			if (data.code === ERROR_CODES.NOT_AUTHENTICATED) {
				navigate({ to: "/sign-in", replace: true });
				return;
			}

			if (data.code === ERROR_CODES.NOT_SUBSCRIBED) {
				navigate({ to: "/subscription", replace: true });
				return;
			}

			if (options?.beforeToast?.(data)) {
				return;
			}

			toast.error(getErrorMessage(error, fallback));
			return;
		}

		toast.error(fallback);
	};
}
