import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

function parseEvent(body: unknown): {
	eventId: string;
	type: string;
	app_user_id?: string;
	transferred_from?: string[];
	transferred_to?: string[];
	purchased_at_ms?: number;
	expiration_at_ms?: number;
	event_timestamp_ms?: number;
	period_type?: string;
	original_transaction_id?: string;
	transaction_id?: string;
} | null {
	if (typeof body !== "object" || body === null) return null;
	const event = (body as Record<string, unknown>).event;
	if (typeof event !== "object" || event === null) return null;
	const e = event as Record<string, unknown>;
	const id = e.id;
	const type = e.type;
	if (typeof id !== "string" || typeof type !== "string") return null;
	return {
		eventId: id,
		type,
		app_user_id: typeof e.app_user_id === "string" ? e.app_user_id : undefined,
		transferred_from: Array.isArray(e.transferred_from)
			? (e.transferred_from as string[])
			: undefined,
		transferred_to: Array.isArray(e.transferred_to)
			? (e.transferred_to as string[])
			: undefined,
		purchased_at_ms:
			typeof e.purchased_at_ms === "number" ? e.purchased_at_ms : undefined,
		expiration_at_ms:
			typeof e.expiration_at_ms === "number" ? e.expiration_at_ms : undefined,
		event_timestamp_ms:
			typeof e.event_timestamp_ms === "number"
				? e.event_timestamp_ms
				: undefined,
		period_type: typeof e.period_type === "string" ? e.period_type : undefined,
		original_transaction_id:
			typeof e.original_transaction_id === "string"
				? e.original_transaction_id
				: undefined,
		transaction_id:
			typeof e.transaction_id === "string" ? e.transaction_id : undefined,
	};
}

export const handleRevenueCatWebhook = httpAction(async (ctx, request) => {
	if (request.method !== "POST") {
		return new Response("Method Not Allowed", { status: 405 });
	}

	const expectedAuth = process.env.REVENUECAT_WEBHOOK_AUTHORIZATION;
	if (expectedAuth) {
		const authHeader = request.headers.get("Authorization");
		if (authHeader !== expectedAuth) {
			return new Response("Unauthorized", { status: 401 });
		}
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return new Response("Bad Request", { status: 400 });
	}

	const event = parseEvent(body);
	if (!event) {
		return new Response("Bad Request", { status: 400 });
	}

	try {
		await ctx.runMutation(internal.subscriptions.handleRevenueCatEvent, {
			event,
		});
		return new Response(null, { status: 200 });
	} catch {
		return new Response(null, { status: 500 });
	}
});
