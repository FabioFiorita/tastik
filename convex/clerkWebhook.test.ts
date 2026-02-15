import { describe, expect, it } from "vitest";
import { createTestEnv } from "./test.setup";

describe("clerkWebhook", () => {
	it("handles user events", async () => {
		const env = await createTestEnv();
		expect(env.asAlice).toBeDefined();
	});
});
