import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { listQueryOptions, useList } from "./use-list";

vi.mock("@convex-dev/react-query", () => {
	const mockConvexQuery = vi.fn();
	return {
		convexQuery: mockConvexQuery,
		__convexReactQueryMocks: { mockConvexQuery },
	};
});

vi.mock("@tanstack/react-query", () => {
	const mockUseQuery = vi.fn();
	return {
		useQuery: mockUseQuery,
		__tanstackReactQueryMocks: { mockUseQuery },
	};
});

type ConvexReactQueryMockModule = {
	__convexReactQueryMocks: {
		mockConvexQuery: ReturnType<typeof vi.fn>;
	};
};

type TanstackReactQueryMockModule = {
	__tanstackReactQueryMocks: {
		mockUseQuery: ReturnType<typeof vi.fn>;
	};
};

const convexReactQueryModule = (await import(
	"@convex-dev/react-query"
)) as unknown as ConvexReactQueryMockModule;
const tanstackReactQueryModule = (await import(
	"@tanstack/react-query"
)) as unknown as TanstackReactQueryMockModule;

const { mockConvexQuery } = convexReactQueryModule.__convexReactQueryMocks;
const { mockUseQuery } = tanstackReactQueryModule.__tanstackReactQueryMocks;

describe("useList", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("builds skip query options when no list id is provided", () => {
		const queryOptions = { queryKey: ["list", "skip"] };
		vi.mocked(mockConvexQuery).mockReturnValue(queryOptions);

		const result = listQueryOptions(undefined);

		expect(mockConvexQuery).toHaveBeenCalledWith(api.lists.getList, "skip");
		expect(result).toBe(queryOptions);
	});

	it("builds query options with the provided list id", () => {
		const listId = "list_123" as Id<"lists">;
		const queryOptions = { queryKey: ["list", listId] };
		vi.mocked(mockConvexQuery).mockReturnValue(queryOptions);

		const result = listQueryOptions(listId);

		expect(mockConvexQuery).toHaveBeenCalledWith(api.lists.getList, { listId });
		expect(result).toBe(queryOptions);
	});

	it("returns the query data from useQuery", () => {
		const listId = "list_456" as Id<"lists">;
		const queryOptions = { queryKey: ["list", listId] };
		const list = { _id: listId, name: "Groceries" };
		vi.mocked(mockConvexQuery).mockReturnValue(queryOptions);
		vi.mocked(mockUseQuery).mockReturnValue({ data: list });

		const result = useList(listId);

		expect(mockUseQuery).toHaveBeenCalledWith(queryOptions);
		expect(result).toBe(list);
	});
});
