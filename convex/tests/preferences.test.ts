import { api } from "../_generated/api";
import schema from "../schema";
import { createConvexTest } from "./test.setup";

const modules = import.meta.glob("../**/*.ts");

describe("preferences", () => {
	async function setup(t: ReturnType<typeof createConvexTest>, userId: string) {
		return t.withIdentity({ subject: userId });
	}

	describe("getUserPreferences", () => {
		it("returns sort preferences after updating", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-pref-1");

			await asUser.mutation(api.lists.createList, { name: "List" });
			await asUser.mutation(api.preferences.updateListsSortPreference, {
				sortBy: "name",
				sortAscending: true,
			});

			const prefs = await asUser.query(api.preferences.getUserPreferences, {});
			expect(prefs.listsSortBy).toBe("name");
			expect(prefs.listsSortAscending).toBe(true);
		});
	});

	describe("updateListsSortPreference", () => {
		it("creates profile when none exists", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-pref-new");

			await asUser.mutation(api.lists.createList, { name: "List" });
			await asUser.mutation(api.preferences.updateListsSortPreference, {
				sortBy: "updated_at",
				sortAscending: false,
			});

			const prefs = await asUser.query(api.preferences.getUserPreferences, {});
			expect(prefs.listsSortBy).toBe("updated_at");
			expect(prefs.listsSortAscending).toBe(false);
		});

		it("patches existing profile", async () => {
			const t = createConvexTest(schema, modules);
			const asUser = await setup(t, "user-pref-patch");

			await asUser.mutation(api.lists.createList, { name: "List" });
			await asUser.mutation(api.preferences.updateListsSortPreference, {
				sortBy: "created_at",
				sortAscending: true,
			});
			await asUser.mutation(api.preferences.updateListsSortPreference, {
				sortBy: "name",
				sortAscending: false,
			});

			const prefs = await asUser.query(api.preferences.getUserPreferences, {});
			expect(prefs.listsSortBy).toBe("name");
			expect(prefs.listsSortAscending).toBe(false);
		});
	});
});
