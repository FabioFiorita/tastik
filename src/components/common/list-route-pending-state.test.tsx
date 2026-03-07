import { QueryClient } from "@tanstack/react-query";
import { listQueryOptions } from "@/hooks/queries/use-list";
import { userListsQueryOptions } from "@/hooks/queries/use-user-lists";
import { mockReactRouter } from "@/lib/helpers/mocks";
import { renderWithUser, screen } from "@/test-utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { ListRoutePendingState } from "./list-route-pending-state";

describe("list-route-pending-state", () => {
	beforeEach(() => {
		mockReactRouter({
			params: { listId: "list_123" },
			routeContext: { queryClient: new QueryClient() },
		});
	});

	it("renders the kanban pending state when the active lists cache has a kanban list", () => {
		const queryClient = new QueryClient();
		const listId = "list_kanban" as Id<"lists">;
		mockReactRouter({
			params: { listId },
			routeContext: { queryClient },
		});
		queryClient.setQueryData(userListsQueryOptions("active").queryKey, [
			{ _id: listId, type: "kanban" },
		]);

		renderWithUser(<ListRoutePendingState />);

		expect(
			screen.getByTestId("kanban-detail-pending-skeleton"),
		).toBeInTheDocument();
		expect(
			screen.queryByTestId("list-detail-pending-skeleton"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("list-detail-fallback-pending"),
		).not.toBeInTheDocument();
	});

	it("renders the list pending state when the list cache resolves to a non-kanban type", () => {
		const queryClient = new QueryClient();
		const listId = "list_simple" as Id<"lists">;
		mockReactRouter({
			params: { listId },
			routeContext: { queryClient },
		});
		queryClient.setQueryData(listQueryOptions(listId).queryKey, {
			_id: listId,
			type: "simple",
			isOwner: true,
		});

		renderWithUser(<ListRoutePendingState />);

		expect(
			screen.getByTestId("list-detail-pending-skeleton"),
		).toBeInTheDocument();
		expect(
			screen.queryByTestId("kanban-detail-pending-skeleton"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("list-detail-fallback-pending"),
		).not.toBeInTheDocument();
	});

	it("renders the neutral fallback when no cached list type is available", () => {
		renderWithUser(<ListRoutePendingState />);

		expect(
			screen.getByTestId("list-detail-fallback-pending"),
		).toBeInTheDocument();
		expect(
			screen.queryByTestId("kanban-detail-pending-skeleton"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByTestId("list-detail-pending-skeleton"),
		).not.toBeInTheDocument();
	});
});
