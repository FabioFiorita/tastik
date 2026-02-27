import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { renderToString } from "react-dom/server";
import { renderHook, waitFor } from "@/test-utils";
import { useLastLoginMethod } from "./use-last-login-method";

vi.mock("@/lib/auth-client", () => {
	const mockGetLastUsedLoginMethod = vi.fn<() => string | null>();
	return {
		authClient: {
			getLastUsedLoginMethod: mockGetLastUsedLoginMethod,
		},
		__authClientMocks: {
			mockGetLastUsedLoginMethod,
		},
	};
});

type AuthClientMockModule = {
	__authClientMocks: {
		mockGetLastUsedLoginMethod: ReturnType<typeof vi.fn<() => string | null>>;
	};
};

const authClientModule = (await import(
	"@/lib/auth-client"
)) as unknown as AuthClientMockModule;
const { mockGetLastUsedLoginMethod } = authClientModule.__authClientMocks;

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return ({ children }: { children: React.ReactNode }) =>
		React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useLastLoginMethod", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("returns null when no method is available", async () => {
		vi.mocked(mockGetLastUsedLoginMethod).mockReturnValue(null);

		const { result } = renderHook(() => useLastLoginMethod(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.lastLoginMethod).toBeNull();
		});
		expect(result.current.isLastLoginMethod("email")).toBe(false);
	});

	it("returns known methods and matches correctly", async () => {
		vi.mocked(mockGetLastUsedLoginMethod).mockReturnValue("github");

		const { result } = renderHook(() => useLastLoginMethod(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.lastLoginMethod).toBe("github");
		});
		expect(result.current.isLastLoginMethod("github")).toBe(true);
		expect(result.current.isLastLoginMethod("google")).toBe(false);
	});

	it("safely ignores unknown methods", async () => {
		vi.mocked(mockGetLastUsedLoginMethod).mockReturnValue("linkedin");

		const { result } = renderHook(() => useLastLoginMethod(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.lastLoginMethod).toBeNull();
		});
		expect(result.current.isLastLoginMethod("email")).toBe(false);
		expect(result.current.isLastLoginMethod("passkey")).toBe(false);
	});

	it("is hydration-safe by not reading method during server render", () => {
		vi.mocked(mockGetLastUsedLoginMethod).mockReturnValue("google");
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		});

		function ServerComponent() {
			useLastLoginMethod();
			return React.createElement("div");
		}

		renderToString(
			React.createElement(
				QueryClientProvider,
				{ client: queryClient },
				React.createElement(ServerComponent),
			),
		);
		expect(mockGetLastUsedLoginMethod).not.toHaveBeenCalled();
	});
});
