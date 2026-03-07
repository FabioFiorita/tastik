import { useState } from "react";

type RunActionHandlers<TResult> = {
	onSuccess?: (result: TResult) => void | Promise<void>;
	onError?: (error: unknown) => void | Promise<void>;
};

export function useManagedAction() {
	const [isPending, setIsPending] = useState(false);

	const runAction = async <TResult>(
		action: () => Promise<TResult>,
		handlers?: RunActionHandlers<TResult>,
	): Promise<TResult | undefined> => {
		setIsPending(true);
		try {
			const result = await action();
			if (handlers?.onSuccess) {
				await handlers.onSuccess(result);
			}
			return result;
		} catch (error) {
			if (handlers?.onError) {
				await handlers.onError(error);
			}
			return undefined;
		} finally {
			setIsPending(false);
		}
	};

	return {
		runAction,
		isPending,
	};
}
