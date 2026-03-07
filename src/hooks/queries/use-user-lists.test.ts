import { api } from "../../../convex/_generated/api";
import { userListsQueryOptions, useUserLists } from "./use-user-lists";

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

describe("useUserLists", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("builds active query options by default", () => {
		const queryOptions = { queryKey: ["lists", "active"] };
		vi.mocked(mockConvexQuery).mockReturnValue(queryOptions);

		const result = userListsQueryOptions();

		expect(mockConvexQuery).toHaveBeenCalledWith(api.lists.getUserLists, {
			status: "active",
		});
		expect(result).toBe(queryOptions);
	});

	it("builds query options with the provided status", () => {
		const queryOptions = { queryKey: ["lists", "archived"] };
		vi.mocked(mockConvexQuery).mockReturnValue(queryOptions);

		const result = userListsQueryOptions("archived");

		expect(mockConvexQuery).toHaveBeenCalledWith(api.lists.getUserLists, {
			status: "archived",
		});
		expect(result).toBe(queryOptions);
	});

	it("returns the query data from useQuery", () => {
		const queryOptions = { queryKey: ["lists", "active"] };
		const lists = [{ _id: "list_123", name: "Errands" }];
		vi.mocked(mockConvexQuery).mockReturnValue(queryOptions);
		vi.mocked(mockUseQuery).mockReturnValue({ data: lists });

		const result = useUserLists();

		expect(mockUseQuery).toHaveBeenCalledWith(queryOptions);
		expect(result).toBe(lists);
	});
});
