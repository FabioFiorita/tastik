import { act, renderHook } from "@/test-utils";
import { useManagedAction } from "./use-managed-action";

describe("useManagedAction", () => {
	it("starts with isPending false", () => {
		const { result } = renderHook(() => useManagedAction());
		expect(result.current.isPending).toBe(false);
	});

	it("sets isPending to true during the action and false after", async () => {
		let resolveFn!: () => void;
		const action = () =>
			new Promise<void>((resolve) => {
				resolveFn = resolve;
			});

		const { result } = renderHook(() => useManagedAction());

		let promise: Promise<unknown>;
		act(() => {
			promise = result.current.runAction(action);
		});

		expect(result.current.isPending).toBe(true);

		await act(async () => {
			resolveFn();
			await promise;
		});

		expect(result.current.isPending).toBe(false);
	});

	it("calls onSuccess with the action result", async () => {
		const onSuccess = vi.fn();
		const { result } = renderHook(() => useManagedAction());

		await act(async () => {
			await result.current.runAction(() => Promise.resolve(42), { onSuccess });
		});

		expect(onSuccess).toHaveBeenCalledWith(42);
	});

	it("calls onError when the action throws", async () => {
		const onError = vi.fn();
		const error = new Error("boom");
		const { result } = renderHook(() => useManagedAction());

		const returnValue = await act(async () =>
			result.current.runAction(() => Promise.reject(error), { onError }),
		);

		expect(onError).toHaveBeenCalledWith(error);
		expect(returnValue).toBeUndefined();
	});

	it("returns undefined when the action throws", async () => {
		const { result } = renderHook(() => useManagedAction());

		const returnValue = await act(async () =>
			result.current.runAction(() => Promise.reject(new Error("fail")), {
				onError: () => {},
			}),
		);

		expect(returnValue).toBeUndefined();
	});

	it("returns the action result on success", async () => {
		const { result } = renderHook(() => useManagedAction());

		const returnValue = await act(async () =>
			result.current.runAction(() => Promise.resolve("done")),
		);

		expect(returnValue).toBe("done");
	});

	it("resets isPending to false even when the action throws", async () => {
		const { result } = renderHook(() => useManagedAction());

		await act(async () => {
			await result.current.runAction(() => Promise.reject(new Error("fail")), {
				onError: () => {},
			});
		});

		expect(result.current.isPending).toBe(false);
	});
});
